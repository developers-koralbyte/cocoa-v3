import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import {
  Calendar as BigCalendar,
  momentLocalizer,
  View,
  SlotInfo,
} from 'react-big-calendar'
import ReactCalendar from 'react-calendar'
import { Bell } from 'lucide-react'

// Layout & Assets
import BaseLayout from '../../components/Dashboard/BaseLayout'
import chatImage from '../../assets/img/Dashboard/chatImage.png'
import Header from '../../components/Dashboard/Invoices/HeaderProps'
import { useUserStore } from '../../utils/userStore'

// 1) Setup for react-big-calendar
const localizer = momentLocalizer(moment)

// 2) Inline CSS overrides
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

interface AppointmentEvent {
  id: number
  title: string
  start: Date
  end: Date
  desc?: string
}

interface User {
  username: string
  role: string
  avatar: string
}

interface UserStore {
  currentUser: User
  fetchUserInfo: () => void
}

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
        <button
          className="text-purple-600 text-2xl font-bold"
          onClick={goToBack}
        >
          &lt;
        </button>
        <span className="font-semibold text-gray-800 text-lg">
          {props.label}
        </span>
        <button
          className="text-purple-600 text-2xl font-bold"
          onClick={goToNext}
        >
          &gt;
        </button>
      </div>

      <div className="flex space-x-2">
        {['day', 'week', 'month'].map((viewType) => (
          <button
            key={viewType}
            className={`px-2 py-1 rounded hover:bg-gray-300 ${
              props.view === viewType
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => handleViewChange(viewType)}
          >
            {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate()
  const { currentUser, fetchUserInfo } = useUserStore() as UserStore

  const [events, setEvents] = useState<AppointmentEvent[]>([
    {
      id: 1,
      title: 'Gustavo, Creative Hive',
      start: new Date(2025, 0, 15, 10),
      end: new Date(2025, 0, 15, 11),
      desc: 'Catchup meeting about new products',
    },
    {
      id: 2,
      title: 'Anaïs, Startup Hub',
      start: new Date(2025, 0, 26, 14),
      end: new Date(2025, 0, 26, 15, 30),
      desc: 'Project discussion',
    },
  ])

  const [view, setView] = useState<View>('month')
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState<AppointmentEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [availability] = useState([
    { day: 'Mon', time: '8:00 am - 5:00 pm' },
    { day: 'Tue', time: 'Not Available' },
    { day: 'Wed', time: '8:00 am - 5:00 pm' },
    { day: 'Thu', time: 'Not Available' },
    { day: 'Fri', time: '8:00 am - 5:00 pm' },
    { day: 'Sat', time: 'Not Available' },
    { day: 'Sun', time: 'Not Available' },
  ])

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setModalData({
      id: Date.now(),
      title: '',
      start: slotInfo.start,
      end: slotInfo.end,
    })
    setIsEditing(false)
    setShowModal(true)
  }

  const handleSelectEvent = (event: AppointmentEvent) => {
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

  const upcoming = [...events].sort((a, b) => a.start.getTime() - b.start.getTime())[0]

  return (
    <>
      <BaseLayout>
        <style dangerouslySetInnerHTML={{ __html: calendarOverrides }} />
        <div className="p-6 font-nunito">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-bold font-nunito">Calendar</h1>
            <Header
              userName={currentUser?.username}
              userRole={currentUser?.role}
              userImage={currentUser?.avatar}
            />
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
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  components={{ toolbar: MyToolbar }}
                  views={['month', 'week', 'day']}
                  view={view}
                  onView={setView}
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
                  formatMonthYear={(_, date) =>
                    moment(date).format('MMMM YYYY')
                  }
                />
              </div>

              <div className="bg-white rounded-[2rem] p-6 shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Next Appointment</h3>
                  <div className="flex gap-2">
                    <button className="text-purple-600">&lt;</button>
                    <button className="text-purple-600">&gt;</button>
                  </div>
                </div>
                <div className="space-y-4">
                  {upcoming ? (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150"
                          alt={upcoming.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">
                            {upcoming.title},{' '}
                            <span className="text-purple-600">
                              {upcoming.desc || 'No company info'}
                            </span>
                          </h4>
                        </div>
                        <div className="text-sm text-gray-500">
                          {moment(upcoming.start).format('ddd, MMM Do, h:mm A')} –{' '}
                          {moment(upcoming.end).format('h:mm A')}
                        </div>
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          alert(`Reminder set for ${upcoming.title}`)
                        }
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
                      <span className="font-medium text-gray-700">
                        {slot.day}:
                      </span>
                      <span>{slot.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </BaseLayout>

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
                    start: new Date(e.target.value),
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
                    end: new Date(e.target.value),
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
                onClick={closeModal}
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

export default CalendarPage
