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
  Timestamp,
} from 'firebase/firestore';

import BaseLayout from '../../components/Dashboard/BaseLayout';
import chatImage from '../../assets/img/Dashboard/chatImage.png';
import { db } from '../../utils/firebase';
import { useAuth } from '../../utils/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup react-big-calendar localizer
const localizer = momentLocalizer(moment);

// Inline CSS overrides
const calendarOverrides = `
  /* BigCalendar event styling */
  .rbc-event,
  .rbc-day-slot .rbc-background-event {
    background-color: #5F4B8B !important;
    color: #fff !important;
    border: none !important;
    border-radius: 0.375rem;
  }
  .rbc-event.rbc-selected,
  .rbc-day-slot .rbc-selected.rbc-background-event {
    background-color: #6868AC !important;
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

/** Event interface for the RBC calendar. */
interface AppointmentEvent extends RBCEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date; // Make sure end is properly defined
  desc?: string;
  buyerId?: string;
  vendorId?: string;
  duration?: number; // Duration in minutes
}

/** Firestore doc structure for appointments. */
interface AppointmentDoc {
  buyerId: string;
  vendorId: string;
  createdAt?: any;
  description?: string;
  selectedDay?: {
    dateObj: Timestamp | { seconds: number; nanoseconds: number } | string;
    label?: string;
    date?: number;
  };
  selectedTime?: string;
  title?: string;
  duration?: number; // Duration in minutes if available
}

/** Minimal user info for referencing the buyer or vendor. */
interface UserInfo {
  avatar?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  id?: string;
  businessName?: string;
}

/** Default company name when missing in data */
const DEFAULT_COMPANY_NAME = 'Unknown Company';

/** Helper to parse Firestore Timestamps into JS Dates. */
function parseTimestampToDate(
  timestamp: Timestamp | { seconds: number; nanoseconds: number } | string
): Date | null {
  if (!timestamp) return null;

  try {
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    // If it's a Firestore Timestamp
    if ((timestamp as Timestamp).toDate) {
      return (timestamp as Timestamp).toDate();
    }
    // If it's a {seconds, nanoseconds} object
    if (
      typeof (timestamp as { seconds: number; nanoseconds: number }).seconds === 'number' &&
      typeof (timestamp as { seconds: number; nanoseconds: number }).nanoseconds === 'number'
    ) {
      const tsObj = timestamp as { seconds: number; nanoseconds: number };
      return new Date(tsObj.seconds * 1000 + tsObj.nanoseconds / 1e6);
    }
  } catch (error) {
    console.error('Error parsing timestamp:', error);
  }
  return null;
}

/**
 * Parse time string (like "8:00 am") and add to date
 * @param date Base date object
 * @param timeStr Time string in format "HH:MM am/pm"
 * @returns Date with time added or original date if parsing fails
 */
function addTimeToDate(date: Date, timeStr?: string): Date {
  if (!timeStr) return date;
  
  try {
    const result = new Date(date);
    const parsed = moment(timeStr, 'h:mm a');
    
    if (parsed.isValid()) {
      result.setHours(parsed.hours());
      result.setMinutes(parsed.minutes());
      result.setSeconds(0);
      result.setMilliseconds(0);
      return result;
    }
  } catch (error) {
    console.error('Error parsing time string:', error);
  }
  
  return date;
}

/**
 * Calculate end time based on start time and duration
 * @param startDate Start date and time
 * @param duration Duration in minutes (default: 60)
 * @returns End date
 */
function calculateEndTime(startDate: Date, duration: number = 60): Date {
  return new Date(startDate.getTime() + duration * 60000);
}

/** A custom RBC toolbar with "Today", "Favourites", prev/next arrow, and day/week/month views. */
function MyToolbar(props: any) {
  const goToBack = () => props.onNavigate('PREV');
  const goToNext = () => props.onNavigate('NEXT');
  const goToToday = () => props.onNavigate('TODAY');
  const handleViewChange = (view: string) => props.onView(view);

  return (
    <div className="rbc-toolbar flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <button
          className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
          onClick={goToToday}
        >
          Today
        </button>
        <button
          className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
          onClick={() => alert('Favourites clicked')}
        >
          Favourites
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-purple-600 text-2xl font-bold" onClick={goToBack}>
          &lt;
        </button>
        <span className="font-semibold text-gray-800 text-lg">{props.label}</span>
        <button className="text-purple-600 text-2xl font-bold" onClick={goToNext}>
          &gt;
        </button>
      </div>

      <div className="flex space-x-2">
        <button
          className={`px-2 py-1 rounded hover:bg-gray-300 ${
            props.view === 'day' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => handleViewChange('day')}
        >
          Day
        </button>
        <button
          className={`px-2 py-1 rounded hover:bg-gray-300 ${
            props.view === 'week' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => handleViewChange('week')}
        >
          Week
        </button>
        <button
          className={`px-2 py-1 rounded hover:bg-gray-300 ${
            props.view === 'month' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => handleViewChange('month')}
        >
          Month
        </button>
      </div>
    </div>
  );
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [view, setView] = useState<View>('month');
  const [oppositeUsers, setOppositeUsers] = useState<Record<string, UserInfo>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hard-coded availability example
  const [availability] = useState([
    { day: 'Mon', time: '8:00 am - 5:00 pm' },
    { day: 'Tue', time: 'Not Available' },
    { day: 'Wed', time: '8:00 am - 5:00 pm' },
    { day: 'Thu', time: 'Not Available' },
    { day: 'Fri', time: '8:00 am - 5:00 pm' },
    { day: 'Sat', time: 'Not Available' },
    { day: 'Sun', time: 'Not Available' },
  ]);

  // Fetch appointments from Firestore for the current user
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!authUser) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Assuming "vendorId" = current user
        const q = query(collection(db, 'appointments'), where('vendorId', '==', authUser.uid));
        const querySnapshot = await getDocs(q);

        const fetchedEvents: AppointmentEvent[] = [];
        const userIdsToFetch = new Set<string>();

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as AppointmentDoc;
          const docId = docSnap.id;

          if (data.buyerId) {
            userIdsToFetch.add(data.buyerId);
          }

          let eventDate = new Date();
          const titleStr = data.title || '';
          const descStr = data.description || '';
          const duration = data.duration || 60; // Default 60 min if not specified

          // Parse the date object
          if (data.selectedDay?.dateObj) {
            const parsedDate = parseTimestampToDate(data.selectedDay.dateObj);
            if (parsedDate) {
              eventDate = parsedDate;
              
              // Add time if available
              if (data.selectedTime) {
                eventDate = addTimeToDate(eventDate, data.selectedTime);
              }
            }
          }

          // Calculate end date (start + duration)
          const endDate = calculateEndTime(eventDate, duration);

          fetchedEvents.push({
            id: docId,
            title: titleStr,
            start: eventDate,
            end: endDate,
            desc: descStr,
            buyerId: data.buyerId,
            vendorId: data.vendorId,
            duration,
          });
        });

        // fetch buyer info for each buyerId
        const userMap: Record<string, UserInfo> = {};
        for (const buyerId of userIdsToFetch) {
          try {
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
                businessName: uData.businessName || DEFAULT_COMPANY_NAME,
              };
            } else {
              userMap[buyerId] = {
                avatar: '',
                firstName: 'Unknown',
                lastName: '',
                role: '',
                id: buyerId,
                businessName: DEFAULT_COMPANY_NAME,
              };
            }
          } catch (userError) {
            console.error(`Error fetching user ${buyerId}:`, userError);
            // Continue with other users if one fails
            userMap[buyerId] = {
              firstName: 'Unknown',
              businessName: DEFAULT_COMPANY_NAME,
              id: buyerId,
            };
          }
        }

        // If event has no title, fallback to the buyer's businessName
        const updatedEvents = fetchedEvents.map((event) => {
          if (!event.title.trim()) {
            if (event.buyerId && userMap[event.buyerId]?.businessName) {
              return { ...event, title: userMap[event.buyerId].businessName };
            } else {
              return { ...event, title: DEFAULT_COMPANY_NAME };
            }
          }
          return event;
        });

        // Sort events by date ascending
        updatedEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
        setEvents(updatedEvents);
        setOppositeUsers(userMap);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [authUser]);

  // get the earliest event as "upcoming"
  const upcoming = events.length > 0 ? events[0] : null;
  let upcomingUser: UserInfo | undefined;
  if (upcoming?.buyerId) {
    upcomingUser = oppositeUsers[upcoming.buyerId];
  }

  return (
    <BaseLayout>
      <style dangerouslySetInnerHTML={{ __html: calendarOverrides }} />
      <div className="p-6 font-nunito">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Calendar</h1>
          {/* Example top-right user info */}
          <div className="flex items-center gap-x-5 gap-4">
            <div>
              <h2 className="font-bold">
                {authUser?.firstName || 'User'},{' '}
                {authUser?.businessName || 'Company'}
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

        {/* Main content area */}
        <div className="flex gap-0">
          {/* Left Panel: big calendar */}
          <div className="flex-1 border-4 border-[#6868AC] rounded-l-[3.5rem] bg-white p-6">
            <div className="shadow rounded-lg p-4 h-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-70vh">
                  <Loader className="w-10 h-10 text-purple-600 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center p-8 text-red-600">{error}</div>
              ) : (
                <BigCalendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  selectable
                  onSelectSlot={(slotInfo: SlotInfo) =>
                    console.log('Selected slot =>', slotInfo)
                  }
                  onSelectEvent={(event) => console.log('Selected event =>', event)}
                  components={{ toolbar: MyToolbar }}
                  views={['month', 'week', 'day']}
                  view={view}
                  onView={setView}
                  defaultDate={new Date()}
                  style={{ height: '70vh' }}
                />
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-80 border-4 border-[#6868AC] border-l-0 rounded-r-[3.5rem] bg-white p-6 space-y-6">
            {/* Small calendar (React-Calendar) */}
            <div className="bg-white shadow rounded-lg p-4">
              <ReactCalendar
                defaultValue={new Date()}
                next2Label={null}
                prev2Label={null}
                minDetail="month"
                maxDetail="month"
                formatMonthYear={(_, date) => moment(date).format('MMMM YYYY')}
              />
            </div>

            {/* Upcoming Appointment */}
            <div className="bg-white rounded-[2rem] p-6 shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Upcoming Appointment</h3>
                <div className="flex gap-2">
                  <button className="text-purple-600">&lt;</button>
                  <button className="text-purple-600">&gt;</button>
                </div>
              </div>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center">
                    <Loader className="w-5 h-5 text-purple-600 animate-spin" />
                  </div>
                ) : upcoming ? (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {upcomingUser?.avatar ? (
                        <img
                          src={upcomingUser.avatar}
                          alt="Opposite user avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="text-gray-400 w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">
                          {upcoming.title},{' '}
                          <span className="text-purple-600">
                            {upcoming.desc || 'No description available'}
                          </span>
                        </h4>
                      </div>
                      <div className="text-sm text-gray-500">
                        {moment(upcoming.start).isValid()
                          ? moment(upcoming.start).format('ddd, MMM Do, h:mm A')
                          : 'Invalid date'}
                      </div>
                    </div>
                    <div
                      className="cursor-pointer"
                      onClick={() => alert(`Reminder set for ${upcoming.title}`)}
                    >
                      <Bell className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No upcoming appointments.
                  </p>
                )}
              </div>
            </div>

            {/* My Availability */}
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-semibold text-gray-700">
                  My Availability
                </h3>
                <button
                  onClick={() => alert('Add new availability logic here')}
                  className="bg-[#5F4B8B] text-white px-2 py-1 rounded shadow hover:bg-[#4A3971]"
                >
                  +
                </button>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {availability.map((slot) => (
                  <li key={slot.day} className="flex justify-between">
                    <span className="font-medium text-gray-700">{slot.day}:</span>
                    <span>{slot.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Floating chat icon */}
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
    </BaseLayout>
  );
};

export default CalendarPage;