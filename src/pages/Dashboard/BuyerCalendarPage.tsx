import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import {
  Calendar as BigCalendar,
  momentLocalizer,
  View,
  SlotInfo
} from 'react-big-calendar'
import ReactCalendar from 'react-calendar'
import { Bell } from 'lucide-react'
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore'

import BaseLayout from '../../components/Dashboard/BaseLayout'
import chatImage from '../../assets/img/Dashboard/chatImage.png'
import { db } from '../../utils/firebase'
import { useAuth } from '../../utils/AuthContext'

// Setup for react-big-calendar
const localizer = momentLocalizer(moment)

// Inline CSS for RBC & ReactCalendar
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

// Custom Toolbar for BigCalendar
function CustomToolbar(props: any) {
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
            props.view === 'day'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => handleViewChange('day')}
        >
          Day
        </button>
        <button
          className={`px-2 py-1 rounded hover:bg-gray-300 ${
            props.view === 'week'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => handleViewChange('week')}
        >
          Week
        </button>
        <button
          className={`px-2 py-1 rounded hover:bg-gray-300 ${
            props.view === 'month'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => handleViewChange('month')}
        >
          Month
        </button>
      </div>
    </div>
  )
}

// Helper: convert a Firestore timestamp to a JS Date
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

interface AppointmentDoc {
  vendorId: string
  buyerId: string
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

interface BuyerCalendarEvent {
  id: string
  title: string
  start: Date
  // we remove 'end' because we use only one common date (set it same as start)
  desc?: string
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

const BuyerCalendarPage: React.FC = () => {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const [events, setEvents] = useState<BuyerCalendarEvent[]>([])
  const [view, setView] = useState<View>('month')
  const [oppositeUsers, setOppositeUsers] = useState<Record<string, UserInfo>>({})

  // For demonstration, we also keep a static list for all appointments view
  const [allAppointments, setAllAppointments] = useState([
    {
      name: 'Vendor: Koralbyte Tech',
      dateTime: 'Wed, Jan 9, 10:00 AM',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      name: 'Vendor: Accountix',
      dateTime: 'Wed, Jan 15, 2:00 PM',
      image:
        'https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?auto=format&fit=crop&w=150&h=150&q=80'
    }
  ])

  // Fetch buyer appointments from Firebase
  useEffect(() => {
    const fetchAppointments = async (
      authUser: { uid: string },
      setEvents: (events: BuyerCalendarEvent[]) => void,
      setOppositeUsers: (users: Record<string, UserInfo>) => void
    ) => {
      if (!authUser) return

      try {
        // For buyers, we query appointments where buyerId equals the current user uid
        const q = query(
          collection(db, 'appointments'),
          where('buyerId', '==', authUser.uid)
        )
        const querySnapshot = await getDocs(q)
        const fetchedEvents: BuyerCalendarEvent[] = []
        const vendorIdsToFetch = new Set<string>()

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as AppointmentDoc
          const docId = docSnap.id

          
          if (data.vendorId) {
            vendorIdsToFetch.add(data.vendorId)
          }

          let eventDate = new Date()
          const titleStr = data.title || ''
          const descStr = data.description || ''

          if (data.selectedDay?.dateObj) {
            const parsedDate = parseTimestampToDate(data.selectedDay.dateObj)
            eventDate = parsedDate ? parsedDate : new Date()
          } else {
            eventDate = new Date()
          }

          fetchedEvents.push({
            id: docId,
            title: titleStr,
            start: eventDate,
            desc: descStr,
            vendorId: data.vendorId
          })
        })

        // Fetch vendor details from "users" collection for each vendorId
        const userMap: Record<string, UserInfo> = {}
        for (const vendorId of vendorIdsToFetch) {
          const userRef = doc(db, 'users', vendorId)
          const userSnap = await getDoc(userRef)
          if (userSnap.exists()) {
            const uData = userSnap.data()
            userMap[vendorId] = {
              avatar: uData.avatar || '',
              firstName: uData.firstName || 'Unknown',
              lastName: uData.lastName || '',
              role: uData.role || '',
              id: vendorId,
              businessName: uData.businessName || 'Vendor'
            }
          } else {
            userMap[vendorId] = {
              avatar: '',
              firstName: 'Unknown',
              lastName: '',
              role: '',
              id: vendorId,
              businessName: 'Vendor'
            }
          }
        }

        // If event title is empty, use the vendor's businessName as fallback
        const updatedEvents = fetchedEvents.map((event) => {
          if (!event.title || event.title.trim() === '') {
            if (event.vendorId && userMap[event.vendorId]?.businessName) {
              return { ...event, title: userMap[event.vendorId].businessName }
            } else {
              return { ...event, title: 'Vendor' }
            }
          }
          return event
        })

        updatedEvents.sort((a, b) => a.start.getTime() - b.start.getTime())
        setEvents(updatedEvents)
        setOppositeUsers(userMap)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      }
    }

    if (!authUser) return
    fetchAppointments({ uid: authUser.uid }, setEvents, setOppositeUsers)
  }, [authUser])

  // Get the earliest appointment from all events
  const earliest =
    events.length > 0
      ? events.sort((a, b) => a.start.getTime() - b.start.getTime())[0]
      : null

  let earliestAppointmentUser: UserInfo | undefined
  if (earliest?.vendorId && oppositeUsers[earliest.vendorId]) {
    earliestAppointmentUser = oppositeUsers[earliest.vendorId]
  }

  // Slot & event selection handlers remain similar
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    // For new appointment creation – use current slot as default
    const newEvent: BuyerCalendarEvent = {
      id: Date.now().toString(),
      title: '',
      start: slotInfo.start,
      // Using the same time as end (or add a default duration if needed)
      desc: '',
      vendorId: ''
    }
    setModalData(newEvent)
    setIsEditing(false)
    setShowModal(true)
  }

  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState<BuyerCalendarEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleSelectEvent = (event: BuyerCalendarEvent) => {
    setModalData(event)
    setIsEditing(true)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalData(null)
    setIsEditing(false)
  }

  const handleSaveEvent = () => {
    if (!modalData) return
    if (isEditing) {
      setEvents((prev) =>
        prev.map((evt) => (evt.id === modalData.id ? modalData : evt))
      )
    } else {
      setEvents((prev) => [...prev, modalData])
    }
    closeModal()
  }

  return (
    <>
      <BaseLayout>
        <style dangerouslySetInnerHTML={{ __html: calendarOverrides }} />

        <div className="p-6 font-nunito">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-gray-800">
              Buyer Calendar
            </h1>
            <div className="text-right">
              <h2 className="text-lg font-semibold text-gray-700">
                {authUser?.firstName || 'Buyer'}, TechNest (Buyer)
              </h2>
              <p className="text-sm text-purple-600">★ Premium Account</p>
            </div>
          </div>

          <div className="rounded-[3rem] bg-white p-6">
            <div className="flex">
              <div className="flex-1 border-4 border-[#6868AC] rounded-l-[3.5rem] bg-white p-6">
                <BigCalendar
                  localizer={localizer}
                  events={events.map((evt) => ({
                    ...evt,
                    // BigCalendar requires an end date; using start as a fallback
                    end: evt.start
                  }))}
                  startAccessor="start"
                  endAccessor="end"
                  selectable
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  components={{ toolbar: CustomToolbar }}
                  views={['month', 'week', 'day']}
                  view={view}
                  onView={(newView) => setView(newView)}
                  defaultDate={new Date()}
                  style={{ height: '70vh' }}
                />
              </div>

              <div className="w-80 border-4 border-[#6868AC] border-l-0 rounded-r-[3.5rem] bg-white p-6 space-y-6">
                <div className="bg-white shadow rounded-lg p-4">
                  <ReactCalendar
                    defaultDate={new Date()}
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
                              alt="Vendor avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-300 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">
                              {earliest.title || earliestAppointmentUser?.firstName},{' '}
                              <span className="text-purple-600">
                                {earliest.desc || 'No company info'}
                              </span>
                            </h4>
                          </div>
                          <div className="text-sm text-gray-500">
                            {moment(earliest.start).format('ddd, MMM Do, h:mm A')}
                          </div>
                        </div>
                        <div
                          className="cursor-pointer"
                          onClick={() =>
                            alert(`Reminder set for ${earliest.title || 'Appointment'}`)
                          }
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

                {/* All Appointments card */}
                <div className="bg-white shadow rounded-lg p-4">
                  <h3 className="font-bold mb-3">All Appointments</h3>
                  <div className="space-y-3">
                    {allAppointments.map((apt, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img
                            src={apt.image}
                            alt={apt.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{apt.name}</p>
                          <p className="text-xs text-gray-500">{apt.dateTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseLayout>

      <div
        className="fixed bottom-3 right-10 cursor-pointer z-50"
        onClick={() => navigate('/buyer-chat')}
      >
        <img
          src={chatImage}
          alt="Chat"
          className="hover:opacity-90 transition-opacity w-14 h-14"
        />
      </div>

      {/* Modal for creating/editing an appointment */}
      {showModal && modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Edit Appointment' : 'New Appointment'}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Title</label>
              <input
                type="text"
                className="border p-2 w-full rounded"
                value={modalData.title}
                onChange={(e) =>
                  setModalData({ ...modalData, title: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Start</label>
              <input
                type="datetime-local"
                className="border p-2 w-full rounded"
                value={moment(modalData.start).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) =>
                  setModalData({
                    ...modalData,
                    start: new Date(e.target.value)
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">End</label>
              <input
                type="datetime-local"
                className="border p-2 w-full rounded"
                value={moment(modalData.end).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) =>
                  setModalData({
                    ...modalData,
                    end: new Date(e.target.value)
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">
                Description
              </label>
              <textarea
                className="border p-2 w-full rounded"
                value={modalData.desc || ''}
                onChange={(e) =>
                  setModalData({ ...modalData, desc: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false)
                  setModalData(null)
                  setIsEditing(false)
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                {isEditing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BuyerCalendarPage
