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
  Timestamp,
} from 'firebase/firestore'

import BaseLayout from '../../components/Dashboard/BaseLayout'
import chatImage from '../../assets/img/Dashboard/chatImage.png'
import { db } from '../../utils/firebase'
import { useAuth } from '../../utils/AuthContext'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Setup react-big-calendar localizer
const localizer = momentLocalizer(moment)

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
`

/** Custom RBC Toolbar, unchanged */
function MyToolbar(props: any) {
  const goToBack = () => props.onNavigate('PREV')
  const goToNext = () => props.onNavigate('NEXT')
  const goToToday = () => props.onNavigate('TODAY')
  const handleViewChange = (view: string) => props.onView(view)

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
  )
}

interface AppointmentDoc {
  buyerId: string
  vendorId: string
  createdAt?: any
  description?: string
  selectedDay?: {
    dateObj: Timestamp | { seconds: number; nanoseconds: number } | string
    label?: string
    date?: number
  }
  selectedTime?: string
  title?: string
}

interface AppointmentEvent extends RBCEvent {
  id: string | number
  title: string
  start: Date
  // Since only one common date is used, we remove 'end'
  desc?: string
  buyerId?: string
  vendorId?: string
}

interface UserInfo {
  avatar?: string
  firstName?: string
  lastName?: string
  role?: string
  id?: string
  businessName?: string
}

export function parseTimestampToDate(
  timestamp: Timestamp | { seconds: number; nanoseconds: number } | string
): Date | null {
  if (!timestamp) return null
  if (typeof timestamp === 'string') {
    return new Date(timestamp)
  }
  if ((timestamp as Timestamp).toDate) {
    return (timestamp as Timestamp).toDate()
  }
  if (
    typeof (timestamp as { seconds: number; nanoseconds: number }).seconds === 'number' &&
    typeof (timestamp as { seconds: number; nanoseconds: number }).nanoseconds === 'number'
  ) {
    const ts = timestamp as { seconds: number; nanoseconds: number }
    return new Date(ts.seconds * 1000 + ts.nanoseconds / 1e6)
  }
  return null
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const [events, setEvents] = useState<AppointmentEvent[]>([])
  const [view, setView] = useState<View>('month')
  const [oppositeUsers, setOppositeUsers] = useState<Record<string, UserInfo>>({})

  const [availability] = useState([
    { day: 'Mon', time: '8:00 am - 5:00 pm' },
    { day: 'Tue', time: 'Not Available' },
    { day: 'Wed', time: '8:00 am - 5:00 pm' },
    { day: 'Thu', time: 'Not Available' },
    { day: 'Fri', time: '8:00 am - 5:00 pm' },
    { day: 'Sat', time: 'Not Available' },
    { day: 'Sun', time: 'Not Available' },
  ])

  useEffect(() => {
    const fetchAppointments = async (
      authUser: { uid: string },
      setEvents: (events: AppointmentEvent[]) => void,
      setOppositeUsers: (users: Record<string, UserInfo>) => void
    ) => {
      if (!authUser) return

      try {
        const q = query(
          collection(db, 'appointments'),
          where('vendorId', '==', authUser.uid)
        )
        const querySnapshot = await getDocs(q)

        const fetchedEvents: AppointmentEvent[] = []
        const userIdsToFetch = new Set<string>()

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as AppointmentDoc
          const docId = docSnap.id
          console.log(`Processing appointment doc ${docId}:`, data)

          if (data.buyerId) {
            userIdsToFetch.add(data.buyerId)
            console.log(`Added buyerId ${data.buyerId} for doc ${docId}`)
          }

          let eventDate = new Date()
          const titleStr = data.title || ''
          const descStr = data.description || ''

          if (data.selectedDay?.dateObj) {
            const parsedDate = parseTimestampToDate(data.selectedDay.dateObj)
            if (parsedDate) {
              eventDate = parsedDate
              console.log(`Parsed event date for doc ${docId}:`, parsedDate)
            } else {
              console.log(`Failed to parse date for doc ${docId}, using current date`)
              eventDate = new Date()
            }
          } else {
            console.log(`No selectedDay for doc ${docId}, using current date`)
            eventDate = new Date()
          }

          fetchedEvents.push({
            id: docId,
            title: titleStr,
            start: eventDate,
            desc: descStr,
            buyerId: data.buyerId,
            vendorId: data.vendorId,
          })
        })

        console.log('Fetched raw events:', fetchedEvents)

        const userMap: Record<string, UserInfo> = {}
        for (const buyerId of userIdsToFetch) {
          console.log(`Fetching buyer info for id: ${buyerId}`)
          const userRef = doc(db, 'users', buyerId)
          const userSnap = await getDoc(userRef)
          if (userSnap.exists()) {
            const uData = userSnap.data()
            userMap[buyerId] = {
              avatar: uData.avatar || '',
              firstName: uData.firstName || 'Unknown',
              lastName: uData.lastName || '',
              role: uData.role || '',
              id: buyerId,
              businessName: uData.businessName || 'Koralbyte Inc',
            }
            console.log(`Fetched buyer info for ${buyerId}:`, userMap[buyerId])
          } else {
            userMap[buyerId] = {
              avatar: '',
              firstName: 'Unknown',
              lastName: '',
              role: '',
              id: buyerId,
              businessName: 'Koralbyte Inc',
            }
            console.log(`No buyer info for ${buyerId}, using fallback:`, userMap[buyerId])
          }
        }

        const updatedEvents = fetchedEvents.map((event) => {
          if (!event.title || event.title.trim() === '') {
            if (event.buyerId && userMap[event.buyerId]?.businessName) {
              return { ...event, title: userMap[event.buyerId].businessName }
            } else {
              return { ...event, title: 'Koralbyte Inc' }
            }
          }
          return event
        })

        updatedEvents.sort((a, b) => a.start.getTime() - b.start.getTime())
        setEvents(updatedEvents)
        setOppositeUsers(userMap)
        console.log('Final fetched events:', updatedEvents)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      }
    }

    if (!authUser) return
    fetchAppointments({ uid: authUser.uid }, setEvents, setOppositeUsers)
  }, [authUser])

  const now = new Date()
  const earliest =
  events.length > 0
    ? events.sort((a, b) => a.start.getTime() - b.start.getTime())[0]
    : null

let earliestAppointmentUser: UserInfo | undefined
if (earliest?.buyerId && oppositeUsers[earliest.buyerId]) {
  earliestAppointmentUser = oppositeUsers[earliest.buyerId]
}

  return (
    <BaseLayout>
      <style dangerouslySetInnerHTML={{ __html: calendarOverrides }} />
      <div className="p-6 font-nunito">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Calendar</h1>
          <div className="flex items-center gap-x-5 gap-4">
            <div>
              <h2 className="font-bold">
                {authUser?.firstName || 'Harsh'},{' '}
                {authUser?.businessName || 'Accountix'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {authUser?.role || 'Vendor'}
                </span>
                <span className="text-xs bg-purple-200 px-2 py-1 rounded-full">
                  Premium Account
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img
                src={
                  authUser?.avatar ||
                  'https://via.placeholder.com/150?text=No+Image'
                }
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-0">
          <div className="flex-1 border-4 border-[#6868AC] rounded-l-[3.5rem] bg-white p-6">
            <div className="shadow rounded-lg p-4 h-full">
              <BigCalendar
                localizer={localizer}
                events={events.map((evt) => ({
                  ...evt,
                  // BigCalendar requires both start & end; use the same date for both.
                  end: evt.start,
                }))}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={(slotInfo: SlotInfo) =>
                  console.log('Selected slot', slotInfo)
                }
                onSelectEvent={(event) => console.log('Selected event', event)}
                components={{ toolbar: MyToolbar }}
                views={['month', 'week', 'day']}
                view={view}
                onView={(newView) => setView(newView)}
                defaultDate={new Date()}
                style={{ height: '70vh' }}
              />
            </div>
          </div>
          <div className="w-80 border-4 border-[#6868AC] border-l-0 rounded-r-[3.5rem] bg-white p-6 space-y-6">
            <div className="bg-white shadow rounded-lg p-4">
              <ReactCalendar
                defaultValue={new Date()}
                next2Label={null}
                prev2Label={null}
                minDetail="month"
                maxDetail="month"
                formatMonthYear={(locale, date) =>
                  moment(date).format('MMMM YYYY')
                }
              />
            </div>
            <div className="bg-white rounded-[2rem] p-6 shadow">
  <div className="flex justify-between items-center mb-4">
    <h3 className="font-bold">Upcoming Appointment</h3>
    <div className="flex gap-2">
      <button className="text-purple-600">&lt;</button>
      <button className="text-purple-600">&gt;</button>
    </div>
  </div>
  <div className="space-y-4">
    {earliest ? (
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          {earliestAppointmentUser?.avatar ? (
            <img
              src={earliestAppointmentUser.avatar}
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
              {earliest.title},{' '}
              <span className="text-purple-600">
                {earliest.desc || 'No company info'}
              </span>
            </h4>
          </div>
          <div className="text-sm text-gray-500">
            {moment(earliest.start).isValid()
              ? moment(earliest.start).format('ddd, MMM Do, h:mm A')
              : 'Invalid date'}
          </div>
        </div>
        <div
          className="cursor-pointer"
          onClick={() => alert(`Reminder set for ${earliest.title}`)}
        >
          <Bell className="w-4 h-4 text-purple-600" />
        </div>
      </div>
    ) : (
      <p className="text-sm text-gray-500">
        No appointments available.
      </p>
    )}
  </div>
</div>
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
  )
}

export default CalendarPage
