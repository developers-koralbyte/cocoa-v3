import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import {
  Calendar as BigCalendar,
  momentLocalizer,
  View,
  SlotInfo,
  Event as RBCEvent,
} from 'react-big-calendar'
import ReactCalendar from 'react-calendar'
import { Bell, User } from 'lucide-react'
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
} from 'firebase/firestore'
import BaseLayout from '../../components/Dashboard/BaseLayout'
import chatImage from '../../assets/img/Dashboard/chatImage.png'
import { db } from '../../utils/firebase'
import { useAuth } from '../../utils/AuthContext'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-calendar/dist/Calendar.css'
import AvailabilityFormModal from '../../components/calendar/AvailibilityFormModal'
import AppointmentModal from '../../components/chat/AppointmentModal'
import MeetingDetailsModal from '../../components/calendar/MeetingDetailsModal'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const localizer = momentLocalizer(moment)

const calendarOverrides = `
.rbc-off-range-bg {
  background-color: #e9d8fd !important;
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
`

function MyToolbar(props: any) {
  const goToBack = () => props.onNavigate('PREV')
  const goToNext = () => props.onNavigate('NEXT')
  const handleViewChange = (view: string) => props.onView(view)

  return (
    <div className="flex items-center justify-between mb-4 font-nunito p-4 bg-gradient-to-r from-[#936ab7] to-[#9082c6] text-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3">
        <span className="font-medium select-none">Calendar View</span>
        {['week', 'month', 'day'].map((v) => (
          <button
            key={v}
            onClick={() => handleViewChange(v)}
            className={`px-4 py-1 rounded text-sm font-medium transition-colors ${
              props.view === v
                ? 'bg-white text-[#936ab7]'
                : 'bg-transparent text-white hover:bg-white hover:text-[#936ab7]'
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={goToBack}
          className="px-3 py-1 text-sm font-medium bg-transparent rounded hover:bg-[#936ab7]/70 hover:text-white"
        >
          &lt;
        </button>
        <span className="text-lg font-bold select-none">{props.label}</span>
        <button
          onClick={goToNext}
          className="px-3 py-1 text-sm font-medium bg-transparent rounded hover:bg-[#936ab7]/70 hover:text-white"
        >
          &gt;
        </button>
      </div>
    </div>
  )
}

function hashStringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ('00' + value.toString(16)).slice(-2)
  }
  return color
}

function darkenColor(hexColor: string, factor = 0.7): string {
  hexColor = hexColor.replace('#', '')
  let r = parseInt(hexColor.substring(0, 2), 16)
  let g = parseInt(hexColor.substring(2, 4), 16)
  let b = parseInt(hexColor.substring(4, 6), 16)
  r = Math.floor(r * factor)
  g = Math.floor(g * factor)
  b = Math.floor(b * factor)
  return (
    '#' +
    [r, g, b]
      .map((x) => ('0' + x.toString(16)).slice(-2))
      .join('')
  )
}

function getContrastingTextColor(hexColor: string): string {
  hexColor = hexColor.replace('#', '')
  const r = parseInt(hexColor.substring(0, 2), 16)
  const g = parseInt(hexColor.substring(2, 4), 16)
  const b = parseInt(hexColor.substring(4, 6), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness < 128 ? '#ffffff' : '#000000'
}

function eventStyleGetter(event: AppointmentEvent) {
  const key = event.buyerId || event.vendorId || event.id.toString()
  const raw = hashStringToColor(key)
  const bg = darkenColor(raw, 0.7)
  const color = getContrastingTextColor(bg)
  return {
    style: {
      backgroundColor: bg,
      color,
      borderRadius: '4px',
      border: 'none',
      padding: '2px 6px',
    },
  }
}

function combineDateAndTime(date: Date, timeString: string): Date {
  const dm = moment(date).startOf('day')
  const tm = moment(timeString, 'h:mm A')
  dm.hours(tm.hours()).minutes(tm.minutes())
  return dm.toDate()
}

interface AppointmentDoc {
  buyerId: string
  vendorId: string
  category?: string
  createdAt?: any
  description?: string
  selectedDate?: any
  selectedTime?: string
  title?: string
  guests?: string[]
  meetingLink?: string
}

export interface AppointmentEvent extends RBCEvent {
  id: string | number
  title: string
  start: Date
  end: Date
  desc?: string
  buyerId?: string
  vendorId?: string
  category?: string
  guests?: string[]
  meetingLink?: string
}

interface UserInfo {
  avatar?: string
  firstName?: string
  lastName?: string
  role?: string
  id?: string
  businessName?: string
}

export function parseTimestampToDate(value: any): Date | null {
  if (!value) return null
  if (typeof value === 'string') return new Date(value)
  if (value.toDate) return value.toDate()
  if (value.seconds) return new Date(value.seconds * 1000)
  return null
}

const BuyerCalendarPage: React.FC = () => {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()

  const [events, setEvents] = useState<AppointmentEvent[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null)
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [view, setView] = useState<View>('month')

  const [oppositeUsers, setOppositeUsers] =
    useState<Record<string, UserInfo>>({})
  const [availability, setAvailability] = useState<any[]>([])
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false)

  const [opponentUsers, setOpponentUsers] = useState<UserInfo[]>([])
  const [selectedOpponent, setSelectedOpponent] = useState<string>('')
  const opponentRole = 'vendor'

  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [upcomingIndex, setUpcomingIndex] = useState(0)

  // Fetch and filter only future appointments
  const fetchAppointmentsData = async () => {
    if (!authUser) return
    try {
      const q = query(
        collection(db, 'appointments'),
        where('buyerId', '==', authUser.uid)
      )
      const snap = await getDocs(q)
      const fetched: AppointmentEvent[] = []
      const vendorIds = new Set<string>()

      snap.forEach((docSnap) => {
        const d = docSnap.data() as AppointmentDoc
        vendorIds.add(d.vendorId!)
        let start =
          parseTimestampToDate(d.selectedDate) ||
          new Date()
        if (d.selectedTime && start) {
          const tm = moment(d.selectedTime, 'h:mm A')
          start.setHours(tm.hours(), tm.minutes())
        }
        fetched.push({
          id: docSnap.id,
          title: d.title || '',
          start,
          end: new Date(start.getTime() + 3600000),
          desc: d.description || '',
          buyerId: d.buyerId,
          vendorId: d.vendorId,
          category: d.category,
          guests: d.guests || [],
          meetingLink: d.meetingLink || '',
        })
      })

      // Fetch vendor profiles
      const userMap: Record<string, UserInfo> = {}
      await Promise.all(
        Array.from(vendorIds).map(async (id) => {
          const uref = doc(db, 'users', id)
          const usnap = await getDoc(uref)
          if (usnap.exists()) {
            const u = usnap.data()
            userMap[id] = {
              avatar: u.avatar || '',
              firstName: u.firstName || 'Unknown',
              lastName: u.lastName || '',
              role: u.role || 'vendor',
              id,
              businessName: u.businessName || 'Unknown Vendor',
            }
          }
        })
      )

      // Assign blank titles
      const updated = fetched
        .map((evt) => {
          if (!evt.title.trim()) {
            const v = userMap[evt.vendorId!]
            return {
              ...evt,
              title: v
                ? `${v.firstName} ${v.lastName}`
                : 'Unknown Vendor',
            }
          }
          return evt
        })
        .sort(
          (a, b) => a.start.getTime() - b.start.getTime()
        )

      // Filter past
      const now = new Date()
      setEvents(updated.filter((e) => e.end >= now))
      setOppositeUsers(userMap)
      setUpcomingIndex(0)
    } catch (err) {
      console.error(err)
    }
  }

  // Weekly rolling availability for buyer
  useEffect(() => {
    if (!authUser) return
    const ref = doc(db, 'Buyers', authUser.uid)
    const roll = async () => {
      const s = await getDoc(ref)
      if (!s.exists()) return
      const all = s.data().availability || []
      const today = moment()
      const thisWeek = all.filter((slot: any) => {
        const d = moment(slot.date)
        return (
          d.isoWeek() === today.isoWeek() && d.year() === today.year()
        )
      })
      if (thisWeek.length) {
        setAvailability(thisWeek)
      } else if (all.length) {
        const carry = window.confirm(
          'Your availability is from a past week. Carry it over to this week?'
        )
        if (carry) {
          const newAvail = all.map((slot: any) => {
            const old = moment(slot.date)
            const rolled = moment()
              .isoWeekday(old.isoWeekday())
              .startOf('day')
            return { ...slot, date: rolled.toISOString() }
          })
          await updateDoc(ref, { availability: newAvail })
          setAvailability(newAvail)
        } else {
          await updateDoc(ref, { availability: [] })
          setAvailability([])
        }
      }
    }
    roll()
  }, [authUser])

  useEffect(fetchAppointmentsData, [authUser])

  // Fetch vendors as opponents
  useEffect(() => {
    if (!authUser) return
    const getVendors = async () => {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'vendor')
      )
      const snap = await getDocs(q)
      setOpponentUsers(
        snap.docs.map((d) => ({
          id: d.id,
          firstName: d.data().firstName || 'Unknown',
          lastName: d.data().lastName || '',
          role: 'vendor',
          businessName: d.data().businessName || '',
          avatar: d.data().avatar || '',
        }))
      )
    }
    getVendors()
  }, [authUser])

  const upcomingAppointments = [...events].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  )
  const displayedAppointment =
    upcomingAppointments[upcomingIndex] || null

  const handlePrevUpcoming = () =>
    upcomingIndex > 0 &&
    setUpcomingIndex(upcomingIndex - 1)
  const handleNextUpcoming = () =>
    upcomingIndex < upcomingAppointments.length - 1 &&
    setUpcomingIndex(upcomingIndex + 1)

  const handleOpenAppointmentModal = () => {
    if (!selectedOpponent) {
      alert(
        'Please select a vendor to schedule an appointment.'
      )
      return
    }
    setShowAppointmentModal(true)
  }

  const saveAppointment = async (data: any) => {
    try {
      const buyerId = authUser!.uid
      const vendorId = selectedOpponent
      const combined = combineDateAndTime(
        data.selectedDate,
        data.selectedTime
      )
      if (combined < new Date()) {
        toast.error(
          'Cannot schedule appointment in the past.'
        )
        return
      }
      const id = new Date().getTime().toString()
      const docData = {
        ...data,
        buyerId,
        vendorId,
        createdAt: new Date(),
        selectedDate: combined,
      }
      await runTransaction(db, async (tx) => {
        const startDay = moment(combined)
          .startOf('day')
          .toDate()
        const endDay = moment(combined)
          .endOf('day')
          .toDate()
        const apptsRef = collection(
          db,
          'appointments'
        )
        const qcheck = query(
          apptsRef,
          where('vendorId', '==', vendorId),
          where('selectedDate', '>=', startDay),
          where('selectedDate', '<=', endDay)
        )
        const snap = await getDocs(qcheck)
        if (
          snap.docs.some(
            (d) =>
              d.data().selectedTime ===
              data.selectedTime
          )
        ) {
          throw new Error(
            'This time slot is already booked.'
          )
        }
        tx.set(doc(db, 'appointments', id), docData)
      })
      toast.success(
        'Appointment scheduled successfully!'
      )
      setTimeout(fetchAppointmentsData, 500)
    } catch (err: any) {
      console.error(err)
      toast.error(
        err.message || 'Failed to schedule appointment.'
      )
    }
  }

  const handleSaveAppointment = (d: any) => {
    saveAppointment(d)
    setShowAppointmentModal(false)
  }

  const handleSelectEvent = (evt: AppointmentEvent) => {
    const v = oppositeUsers[evt.vendorId!]
    setSelectedMeeting({
      appointmentId: evt.id,
      title: evt.title,
      description: evt.desc,
      start: evt.start,
      end: evt.end,
      withUserName: v
        ? `${v.firstName} ${v.lastName}`
        : 'Unknown Vendor',
      withUserAvatar: v?.avatar || '',
      opponentRole: 'vendor',
      opponentId: evt.vendorId,
      selectedTime: evt.selectedTime,
      durationMinutes: evt.duration,
      guests: evt.guests,
      meetingLink: evt.meetingLink,
    })
    setShowMeetingModal(true)
  }

  // Disable past days in small calendar
 

  return (
    <BaseLayout>
      <ToastContainer />
      <style
        dangerouslySetInnerHTML={{
          __html: calendarOverrides,
        }}
      />
      <div className="p-6 font-nunito">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">
            Calendar
          </h1>
          <div className="flex items-center gap-x-5 gap-4">
            <div>
              <h2 className="font-bold">
                {authUser?.firstName || 'Buyer'},{' '}
              </h2>
              <span className="text-sm text-gray-600">
                {authUser?.role || 'Buyer'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {authUser?.avatar ? (
                <img
                  src={authUser.avatar}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-0">
          {/* LEFT SIDE: BigCalendar */}
          <div className="flex-1 border-4 border-[#6868AC] rounded-l-[3.5rem] bg-white p-6">
            <div className="shadow rounded-lg p-4 h-full">
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={(
                  slotInfo: SlotInfo
                ) => console.log('Selected slot', slotInfo)}
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

          {/* RIGHT SIDE */}
          <div className="w-80 border-4 border-[#6868AC] border-l-0 rounded-r-[3.5rem] bg-white p-6 space-y-6">
            {/* Small Calendar */}
            

            {/* Upcoming Appointment */}
            <div className="bg-white rounded-[2rem] p-6 shadow transition-all duration-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">
                  Upcoming Appointment
                </h3>
                <div className="flex gap-2">
                  <button
                    className="text-purple-600"
                    onClick={handlePrevUpcoming}
                  >
                    &lt;
                  </button>
                  <button
                    className="text-purple-600"
                    onClick={handleNextUpcoming}
                  >
                    &gt;
                  </button>
                </div>
              </div>
              {displayedAppointment ? (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    {displayedAppointment.vendorId &&
                    oppositeUsers[
                      displayedAppointment.vendorId
                    ]?.avatar ? (
                      <img
                        src={
                          oppositeUsers[
                            displayedAppointment.vendorId
                          ].avatar
                        }
                        alt="Vendor avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {displayedAppointment.title ||
                        'Unknown Vendor'}
                    </h4>
                    <div className="text-sm text-gray-500">
                      {moment(
                        displayedAppointment.start
                      ).format(
                        'ddd, MMM Do, h:mm A'
                      )}
                    </div>
                  </div>
                  <Bell
                    className="w-4 h-4 text-purple-600 cursor-pointer"
                    onClick={() =>
                      alert('Reminder set!')
                    }
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No appointments available.
                </p>
              )}
            </div>

            {/* Schedule Appointment */}
            <div className="bg-white rounded-[2rem] p-6 shadow">
              <h3 className="font-bold mb-4">
                Schedule Appointment
              </h3>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 mr-3">
                  {(() => {
                    const opp = opponentUsers.find(
                      (op) => op.id === selectedOpponent
                    )
                    return opp?.avatar ? (
                      <img
                        src={opp.avatar}
                        alt="Vendor"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )
                  })()}
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-700 font-semibold mb-1">
                    Select Vendor:
                  </label>
                  <select
                    className="border border-gray-300 rounded px-2 py-1 w-full"
                    value={selectedOpponent}
                    onChange={(e) =>
                      setSelectedOpponent(e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {opponentUsers.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.firstName} {op.lastName}
                        {op.businessName
                          ? ` - ${op.businessName}`
                          : ''}
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

            {/* My Availability */}
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-semibold text-gray-700">
                  My Availability
                </h3>
                <button
                  onClick={() =>
                    setShowAvailabilityForm(true)
                  }
                  className="bg-[#5F4B8B] text-white px-2 py-1 rounded shadow hover:bg-[#4A3971]"
                >
                  +
                </button>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {availability.map((slot, idx) => {
                  const start = slot.startTime
                    ? moment(
                        slot.startTime,
                        'HH:mm'
                      ).format('h:mm A')
                    : ''
                  const end = slot.endTime
                    ? moment(slot.endTime, 'HH:mm').format(
                        'h:mm A'
                      )
                    : ''
                  const day = slot.date
                    ? moment(slot.date).format('ddd')
                    : ''
                  return (
                    <li
                      key={idx}
                      className="flex justify-between"
                    >
                      <span className="font-medium text-gray-700">
                        {day}
                      </span>
                      <span>
                        {start && end
                          ? `${start} - ${end}`
                          : ''}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Icon */}
      <div
        className="fixed bottom-3 right-10 cursor-pointer z-50"
        onClick={() => navigate('/inbox')}
      >
        <img
          src={chatImage}
          alt="Chat"
          className="w-14 h-14 hover:opacity-90 transition-opacity"
        />
      </div>

      {showAvailabilityForm && (
        <AvailabilityFormModal
          onClose={() =>
            setShowAvailabilityForm(false)
          }
          onSave={(slot) => {
            const ref = doc(
              db,
              'Buyers',
              authUser!.uid
            )
            const newSlot = {
              date: slot.selectedDate.toISOString(),
              startTime: slot.startTime,
              endTime: slot.endTime,
              duration: slot.duration,
            }
            updateDoc(ref, {
              availability: arrayUnion(newSlot),
            })
              .then(() =>
                setAvailability((a) => [
                  ...a,
                  newSlot,
                ])
              )
              .catch(() =>
                alert(
                  'Failed to save availability.'
                )
              )
            setShowAvailabilityForm(false)
          }}
        />
      )}

      {showAppointmentModal && (
        <AppointmentModal
          onClose={() =>
            setShowAppointmentModal(false)
          }
          onSchedule={handleSaveAppointment}
          selectedPartner={selectedOpponent}
        />
      )}

      {showMeetingModal && selectedMeeting && (
        <MeetingDetailsModal
          isOpen={showMeetingModal}
          onClose={() =>
            setShowMeetingModal(false)
          }
          {...selectedMeeting}
          onRescheduleSuccess={(
            newStart,
            newSlot
          ) =>
            setSelectedMeeting((prev: any) =>
              prev
                ? {
                    ...prev,
                    start: newStart,
                    selectedTime: newSlot,
                  }
                : prev
            )
          }
        />
      )}
    </BaseLayout>
  )
}

export default BuyerCalendarPage