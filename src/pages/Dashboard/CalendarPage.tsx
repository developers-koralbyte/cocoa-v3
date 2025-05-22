
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  Calendar as BigCalendar,
  momentLocalizer,
  View,
  SlotInfo,
  Event as RBCEvent,
} from 'react-big-calendar';
import ReactCalendar from 'react-calendar';
import { Bell, User, Loader } from 'lucide-react';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  runTransaction,
} from 'firebase/firestore';
import BaseLayout from '../../components/Dashboard/BaseLayout';
import chatImage from '../../assets/img/Dashboard/chatImage.png';
import { db } from '../../utils/firebase';
import { useAuth } from '../../utils/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AvailabilityFormModal from '../../components/calendar/AvailibilityFormModal';
import AppointmentModal from '../../components/chat/AppointmentModal';
import MeetingDetailsModal from '../../components/calendar/MeetingDetailsModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const localizer = momentLocalizer(moment);

const calendarOverrides = `
.rbc-off-range-bg {
  background-color:#e9d8fd  !important;
}
.rbc-event,
.rbc-day-slot .rbc-background-event {
  color: #fff !important;
  border: none !important;
  border-radius: 0.375rem;
  padding: 2px 6px;
  font-size: 0.85rem;
}
.rbc-event.rbc-selected,
.rbc-day-slot .rbc-selected.rbc-background-event {
  opacity: 0.8;
}
.rbc-today {
  background-color: #e9d8fd22 !important;
}
.rbc-toolbar {
  margin-bottom: 1rem;
  font-family: 'Nunito Sans', sans-serif;
}
.rbc-toolbar-button {
  border: none !important;
}
.rbc-time-content > * + * > * {
  min-height: 1.5rem;
}
.react-calendar {
  border: none;
  background: transparent;
}
.react-calendar__navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.react-calendar__navigation__label {
  font-size: 1rem;
}
.react-calendar__navigation__prev2-button,
.react-calendar__navigation__next2-button {
  display: none;
}
.react-calendar__navigation button {
  background: transparent;
  border: none;
  color: #5F4B8B;
  font-size: 1.2rem;
  cursor: pointer;
}
.react-calendar__tile {
  text-align: center;
  padding: 0.6rem 0;
  margin: 0.2rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}
.react-calendar__tile:hover {
  background-color: #f3f0fa;
}
.react-calendar__tile--now {
  background-color: #e9d8fd;
  border-radius: 50%;
}
.react-calendar__tile--active {
  background-color: #5F4B8B;
  color: #fff;
}
.react-calendar__tile--active:enabled:hover {
  background-color: #5F4B8B;
}
`;

function MyToolbar(props: any) {
  const goToBack = () => props.onNavigate('PREV');
  const goToNext = () => props.onNavigate('NEXT');

  const handleViewChange = (view: string) => {
    props.onView(view);
  };

  return (
    <div className="flex items-center justify-between mb-4 font-nunito p-4 bg-gradient-to-r from-[#936ab7] to-[#9082c6] text-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3">
        <span className="font-medium select-none">Calendar View</span>
        <button
          onClick={() => handleViewChange('week')}
          className={`px-4 py-1 rounded text-sm font-medium transition-colors ${
            props.view === 'week'
              ? 'bg-white text-[#936ab7]'
              : 'bg-transparent text-white hover:bg-white hover:text-[#936ab7]'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => handleViewChange('month')}
          className={`px-4 py-1 rounded text-sm font-medium transition-colors ${
            props.view === 'month'
              ? 'bg-white text-[#936ab7]'
              : 'bg-transparent text-white hover:bg-white hover:text-[#936ab7]'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => handleViewChange('day')}
          className={`px-4 py-1 rounded text-sm font-medium transition-colors ${
            props.view === 'day'
              ? 'bg-white text-[#936ab7]'
              : 'bg-transparent text-white hover:bg-white hover:text-[#936ab7]'
          }`}
        >
          Day
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={goToBack}
          className="px-3 py-1 text-sm font-medium bg-transparent rounded transition-colors hover:bg-[#936ab7]/70 hover:text-white"
        >
          &lt;
        </button>
        <span className="text-lg font-bold select-none">{props.label}</span>
        <button
          onClick={goToNext}
          className="px-3 py-1 text-sm font-medium bg-transparent rounded transition-colors hover:bg-[#936ab7]/70 hover:text-white"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

interface AppointmentDoc {
  buyerId: string;
  vendorId: string;
  category?: string;
  createdAt?: any;
  description?: string;
  selectedDate?: any;
  selectedTime?: string;
  title?: string;
  guests?: string[];
  meetingLink?: string;
}

export interface AppointmentEvent extends RBCEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  desc?: string;
  buyerId?: string;
  vendorId?: string;
  category?: string;
  guests?: string[];
  meetingLink?: string;
}

interface UserInfo {
  avatar?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  id?: string;
  businessName?: string;
}

export function parseTimestampToDate(value: any): Date | null {
  if (!value) return null;
  if (typeof value === 'string') return new Date(value);
  if (value.toDate) return value.toDate();
  if (value.seconds) return new Date(value.seconds * 1000);
  return null;
}

function hashStringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}

function darkenColor(hexColor: string, factor = 0.7): string {
  hexColor = hexColor.replace('#', '');
  let r = parseInt(hexColor.substring(0, 2), 16);
  let g = parseInt(hexColor.substring(2, 4), 16);
  let b = parseInt(hexColor.substring(4, 6), 16);
  r = Math.floor(r * factor);
  g = Math.floor(g * factor);
  b = Math.floor(b * factor);
  return (
    '#' +
    [r, g, b]
      .map((x) => ('0' + x.toString(16)).slice(-2))
      .join('')
  );
}

function getContrastingTextColor(hexColor: string): string {
  hexColor = hexColor.replace('#', '');
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128 ? '#ffffff' : '#000000';
}

function eventStyleGetter(event: AppointmentEvent) {
  const colorKey = event.buyerId || event.vendorId || event.id;
  const rawColor = hashStringToColor(colorKey.toString());
  const backgroundColor = darkenColor(rawColor, 0.7);
  const textColor = getContrastingTextColor(backgroundColor);
  return {
    style: {
      backgroundColor,
      color: textColor,
      borderRadius: '4px',
      border: 'none',
      padding: '2px 6px',
    },
  };
}

function combineDateAndTime(date: Date, timeString: string): Date {
  const dateMoment = moment(date).startOf('day');
  const timeMoment = moment(timeString, 'h:mm A');
  dateMoment.hours(timeMoment.hours());
  dateMoment.minutes(timeMoment.minutes());
  return dateMoment.toDate();
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  const [view, setView] = useState<View>('month');
  const [oppositeUsers, setOppositeUsers] = useState<Record<string, UserInfo>>({});

  const [availability, setAvailability] = useState<any[]>([]);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);

  const [opponentUsers, setOpponentUsers] = useState<UserInfo[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<string>('');
  const [opponentRole, setOpponentRole] = useState<string>('');

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [upcomingIndex, setUpcomingIndex] = useState(0);

  // ============= FETCH APPOINTMENTS =============
  const fetchAppointmentsData = async () => {
    if (!authUser) return;
    try {
      const q = query(
        collection(db, 'appointments'),
        where('vendorId', '==', authUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetchedEvents: AppointmentEvent[] = [];
      const userIdsToFetch = new Set<string>();

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as AppointmentDoc;
        const docId = docSnap.id;
        if (data.buyerId) {
          userIdsToFetch.add(data.buyerId);
        }
        let startDate = new Date();
        const rawDate = parseTimestampToDate(data.selectedDate);
        if (rawDate) {
          startDate = rawDate;
          if (data.selectedTime) {
            const timeMoment = moment(data.selectedTime, 'h:mm A');
            startDate.setHours(timeMoment.hours());
            startDate.setMinutes(timeMoment.minutes());
          }
        }
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        fetchedEvents.push({
          id: docId,
          title: data.title || '',
          start: startDate,
          end: endDate,
          desc: data.description || '',
          buyerId: data.buyerId,
          vendorId: data.vendorId,
          category: data.category,
          guests: data.guests || [],
          meetingLink: data.meetingLink || '',
        });
      });

      const userMap: Record<string, UserInfo> = {};
      for (const buyerId of userIdsToFetch) {
        const userRef = doc(db, 'users', buyerId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const uData = userSnap.data();
          userMap[buyerId] = {
            avatar: uData.avatar || '',
            firstName: uData.firstName || 'Unknown',
            lastName: uData.lastName || '',
            role: uData.role || '',
            id: buyerId,
            businessName: uData.businessName || 'Koralbyte Inc',
          };
        } else {
          userMap[buyerId] = {
            avatar: '',
            firstName: 'Unknown',
            lastName: '',
            role: '',
            id: buyerId,
            businessName: 'Koralbyte Inc',
          };
        }
      }

      let updatedEvents = fetchedEvents.map((event) => {
        if (!event.title.trim()) {
          if (event.buyerId && userMap[event.buyerId]) {
            const buyer = userMap[event.buyerId];
            const buyerName = `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim();
            return { ...event, title: buyerName || 'Unknown Buyer' };
          } else {
            return { ...event, title: 'Unknown Buyer' };
          }
        }
        return event;
      });

      updatedEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

      // filter out past events
      const now = new Date();
      const futureEvents = updatedEvents.filter(evt => evt.end >= now);

      setEvents(futureEvents);
      setOppositeUsers(userMap);
      setUpcomingIndex(0);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  // ============= ROLLING WEEKLY AVAILABILITY =============
  useEffect(() => {
    if (!authUser) return;
    const vendorDocRef = doc(db, 'Vendors', authUser.uid);

    const fetchAndRollAvailability = async () => {
      const snap = await getDoc(vendorDocRef);
      if (!snap.exists()) return;

      const allAvail: any[] = snap.data().availability || [];
      const today = moment();

      // keep only this week's slots
      const thisWeek = allAvail.filter(slot => {
        const d = moment(slot.date);
        return d.isoWeek() === today.isoWeek() && d.year() === today.year();
      });

      if (thisWeek.length > 0) {
        setAvailability(thisWeek);
      } else if (allAvail.length > 0) {
        const carry = window.confirm(
          'Your availability is from a past week. Carry it over to this week?'
        );
        if (carry) {
          const newAvail = allAvail.map(slot => {
            const old = moment(slot.date);
            const rolled = moment().isoWeekday(old.isoWeekday()).startOf('day');
            return {
              ...slot,
              date: rolled.toISOString(),
              startTime: slot.startTime,
              endTime: slot.endTime,
              duration: slot.duration,
            };
          });
          await updateDoc(vendorDocRef, { availability: newAvail });
          setAvailability(newAvail);
        } else {
          await updateDoc(vendorDocRef, { availability: [] });
          setAvailability([]);
        }
      }
    };

    fetchAndRollAvailability();
  }, [authUser]);

  useEffect(() => {
    fetchAppointmentsData();
  }, [authUser]);

  useEffect(() => {
    if (!authUser?.role) return;
    const roleNeeded = authUser.role === 'buyer' ? 'vendor' : 'buyer';
    setOpponentRole(roleNeeded);

    const fetchOpponents = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', roleNeeded));
        const querySnapshot = await getDocs(q);
        const arr: UserInfo[] = [];
        querySnapshot.forEach((docSnap) => {
          const d = docSnap.data();
          arr.push({
            id: docSnap.id,
            firstName: d.firstName || 'Unknown',
            lastName: d.lastName || '',
            role: d.role || '',
            businessName: d.businessName || '',
            avatar: d.avatar || '',
          });
        });
        setOpponentUsers(arr);
      } catch (err) {
        console.error('Error fetching opponents:', err);
      }
    };
    fetchOpponents();
  }, [authUser]);

  const upcomingAppointments = [...events].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );
  const displayedAppointment = upcomingAppointments[upcomingIndex] || null;

  const handlePrevUpcoming = () => {
    if (upcomingIndex > 0) {
      setUpcomingIndex(upcomingIndex - 1);
    }
  };

  const handleNextUpcoming = () => {
    if (upcomingIndex < upcomingAppointments.length - 1) {
      setUpcomingIndex(upcomingIndex + 1);
    }
  };

  const handleOpenAppointmentModal = () => {
    if (!selectedOpponent) {
      alert(`Please select a ${opponentRole} to schedule an appointment.`);
      return;
    }
    setShowAppointmentModal(true);
  };

  const saveAppointment = async (appointmentData: any) => {
    try {
      // prevent past scheduling
      const combinedDateTime = combineDateAndTime(
        appointmentData.selectedDate,
        appointmentData.selectedTime
      );
      if (combinedDateTime < new Date()) {
        toast.error('Cannot schedule appointment in the past.');
        return;
      }

      const vendorId = authUser?.role === 'vendor' ? authUser.uid : selectedOpponent;
      const buyerId = authUser?.role === 'buyer' ? authUser.uid : selectedOpponent;
      if (!buyerId || !vendorId) {
        throw new Error('Buyer or Vendor info missing!');
      }

      const appointmentId = new Date().getTime().toString();
      const safeData = {
        ...appointmentData,
        buyerId,
        vendorId,
        createdAt: new Date(),
        selectedDate: combinedDateTime,
      };

      await runTransaction(db, async (transaction) => {
        const startOfDay = moment(combinedDateTime).startOf('day').toDate();
        const endOfDay = moment(combinedDateTime).endOf('day').toDate();
        const appointmentsRef = collection(db, 'appointments');
        const qCheck = query(
          appointmentsRef,
          where('vendorId', '==', vendorId),
          where('selectedDate', '>=', startOfDay),
          where('selectedDate', '<=', endOfDay)
        );
        const querySnapshot = await getDocs(qCheck);

        let conflict = false;
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as any;
          if (data.selectedTime === appointmentData.selectedTime) {
            conflict = true;
          }
        });
        if (conflict) {
          throw new Error('This time slot is already booked.');
        }

        const appointmentDocRef = doc(db, 'appointments', appointmentId);
        transaction.set(appointmentDocRef, safeData);
      });

      toast.success('Appointment scheduled successfully!');
      setTimeout(() => {
        fetchAppointmentsData();
      }, 1000);
    } catch (error: any) {
      console.error('Error scheduling appointment:', error);
      toast.error(error.message || 'Failed to schedule appointment.');
    }
  };

  const handleSaveAppointment = (appointmentData: any) => {
    saveAppointment(appointmentData);
    setShowAppointmentModal(false);
  };

  function handleSelectEvent(event: AppointmentEvent) {
    const buyer = oppositeUsers[event.buyerId || ''];
    const buyerName = buyer
      ? `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim()
      : 'Unknown Buyer';

    setSelectedMeeting({
      appointmentId: event.id,
      title: event.title,
      description: event.desc,
      start: event.start,
      end: event.end,
      category: event.category,
      withUserName: buyerName,
      withUserAvatar: buyer?.avatar || '',
      opponentRole: 'buyer',
      opponentId: event.buyerId || '',
      selectedTime: event.selectedTime,
      durationMinutes: event.duration || 30,
      guests: event.guests,
      meetingLink: event.meetingLink,
    });
    setShowMeetingModal(true);
  }

  return (
    <BaseLayout>
      <ToastContainer />
      <style dangerouslySetInnerHTML={{ __html: calendarOverrides }} />
      <div className="p-6 font-nunito">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Calendar</h1>
          <div className="flex items-center gap-x-5 gap-4">
            <div>
              <h2 className="font-bold">
                {authUser?.firstName || 'User'},{' '}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {authUser?.role || 'User'}
                </span>
                {authUser?.premiumAccount && (
                  <span className="text-xs bg-purple-200 px-2 py-1 rounded-full">
                    Premium Account
                  </span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {authUser?.avatar ? (
                <img
                  src={authUser.avatar}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="text-gray-400 w-6 h-6" />
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-0">
          <div className="flex-1 border-4 border-[#6868AC] rounded-l-[3.5rem] bg-white p-6">
            <div className="shadow rounded-lg p-4 h-full">
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={(slotInfo: SlotInfo) =>
                  console.log('Selected slot', slotInfo)
                }
                onSelectEvent={handleSelectEvent}
                components={{ toolbar: MyToolbar }}
                views={['month', 'week', 'day']}
                view={view}
                onView={(newView) => setView(newView)}
                defaultDate={new Date()}
                getNow={() => new Date()}
                style={{ height: '70vh' }}
                eventPropGetter={eventStyleGetter}
              />
            </div>
          </div>

          <div className="w-80 border-4 border-[#6868AC] border-l-0 rounded-r-[3.5rem] bg-white p-6 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow transition-all duration-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Upcoming Appointment</h3>
                <div className="flex gap-2">
                  <button className="text-purple-600" onClick={handlePrevUpcoming}>
                    &lt;
                  </button>
                  <button className="text-purple-600" onClick={handleNextUpcoming}>
                    &gt;
                  </button>
                </div>
              </div>
              {displayedAppointment ? (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    {(() => {
                      const buyer = oppositeUsers[displayedAppointment.buyerId || ''];
                      if (buyer && buyer.avatar) {
                        return (
                          <img
                            src={buyer.avatar}
                            alt="Opposite user avatar"
                            className="w-full h-full object-cover"
                          />
                        );
                      } else {
                        return <User className="text-gray-400 w-6 h-6" />;
                      }
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">
                        {displayedAppointment.title || 'Unknown Buyer'},{' '}
                        <span className="text-purple-600">
                          {displayedAppointment.desc || 'No company info'}
                        </span>
                      </h4>
                    </div>
                    <div className="text-sm text-gray-500">
                      {moment(displayedAppointment.start).isValid()
                        ? moment(displayedAppointment.start).format('ddd, MMM Do, h:mm A')
                        : 'Invalid date'}
                    </div>
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      alert(`Reminder set for ${displayedAppointment.title || 'Appointment'}`)
                    }
                  >
                    <Bell className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No appointments available.</p>
              )}
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow">
              <h3 className="font-bold mb-4">Schedule Appointment</h3>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 mr-3">
                  {(() => {
                    const opponent = opponentUsers.find((op) => op.id === selectedOpponent);
                    if (opponent && opponent.avatar) {
                      return (
                        <img
                          src={opponent.avatar}
                          alt="Opponent avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      );
                    } else {
                      return <User className="w-10 h-10 text-gray-400" />;
                    }
                  })()}
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-700 font-semibold mb-1">
                    Select {opponentRole.charAt(0).toUpperCase() + opponentRole.slice(1)}:
                  </label>
                  <select
                    className="border border-gray-300 rounded px-2 py-1 w-full"
                    value={selectedOpponent}
                    onChange={(e) => {
                      setSelectedOpponent(e.target.value);
                    }}
                  >
                    <option value="">Select</option>
                    {opponentUsers.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.firstName} {op.lastName}
                        {op.businessName ? ` - ${op.businessName}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                className="bg-[#5F4B8B] text-white px-3 py-2 rounded shadow hover:bg-[#4A3971]"
                onClick={handleOpenAppointmentModal}
              >
                Schedule Appointment
              </button>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-semibold text-gray-700">My Availability</h3>
                <button
                  onClick={() => setShowAvailabilityForm(true)}
                  className="bg-[#5F4B8B] text-white px-2 py-1 rounded shadow hover:bg-[#4A3971]"
                >
                  +
                </button>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {availability.map((slot, idx) => {
                  const formattedStart = slot.startTime
                    ? moment(slot.startTime, 'HH:mm').format('h:mm A')
                    : '';
                  const formattedEnd = slot.endTime
                    ? moment(slot.endTime, 'HH:mm').format('h:mm A')
                    : '';
                  const formattedDay = slot.date ? moment(slot.date).format('ddd') : '';
                  return (
                    <li key={idx} className="flex justify-between">
                      <span className="font-medium text-gray-700">{formattedDay}</span>
                      <span>
                        {formattedStart && formattedEnd
                          ? `${formattedStart} - ${formattedEnd}`
                          : ''}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <div
          className="fixed bottom-3 right-10 cursor-pointer z-50"
          onClick={() => navigate('/inbox')}
        >
          <img
            src={chatImage}
            alt="Chat"
            className="hover:opacity-90 transition-opacity w-14 h-14"
          />
        </div>

        {showAvailabilityForm && (
          <AvailabilityFormModal
            onClose={() => setShowAvailabilityForm(false)}
            onSave={(availabilityData) => {
              const vendorDocRef = doc(db, 'Vendors', authUser?.uid || '');
              const newAvail = {
                date: availabilityData.selectedDate.toISOString(),
                startTime: availabilityData.startTime,
                endTime: availabilityData.endTime,
                duration: availabilityData.duration,
              };
              updateDoc(vendorDocRef, {
                availability: arrayUnion(newAvail),
              })
                .then(() => {
                  setAvailability((prev) => [...prev, newAvail]);
                })
                .catch((err) => {
                  console.error('Error saving availability:', err);
                  alert('Failed to save availability.');
                });
              setShowAvailabilityForm(false);
            }}
          />
        )}

        {showAppointmentModal && (
          <AppointmentModal
            onClose={() => setShowAppointmentModal(false)}
            onSchedule={handleSaveAppointment}
            selectedPartner={selectedOpponent}
          />
        )}

        {showMeetingModal && selectedMeeting && (
          <MeetingDetailsModal
            isOpen={showMeetingModal}
            onClose={() => setShowMeetingModal(false)}
            appointmentId={selectedMeeting.appointmentId}
            title={selectedMeeting.title}
            description={selectedMeeting.description}
            start={selectedMeeting.start}
            end={selectedMeeting.end}
            category={selectedMeeting.category}
            withUserName={selectedMeeting.withUserName}
            withUserAvatar={selectedMeeting.withUserAvatar}
            opponentRole={selectedMeeting.opponentRole}
            opponentId={selectedMeeting.opponentId}
            selectedTime={selectedMeeting.selectedTime}
            durationMinutes={selectedMeeting.durationMinutes || 30}
            guests={selectedMeeting.guests}
            meetingLink={selectedMeeting.meetingLink}
            onRescheduleSuccess={(newStart, newSlot) => {
              setSelectedMeeting((prev: any) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  start: newStart,
                  selectedTime: newSlot,
                };
              });
            }}
          />
        )}
      </div>
    </BaseLayout>
  );
};

export default CalendarPage;