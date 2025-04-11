import React, { useState } from 'react'
import Calendar from 'react-calendar'
import moment from 'moment'
import 'react-calendar/dist/Calendar.css'

interface AvailabilityFormModalProps {
  onClose: () => void
  onSave: (data: {
    selectedDate: Date
    startTime: string
    endTime: string
    duration: number
  }) => void
}

const calendarStyle = `
  .react-calendar {
    font-family: 'Nunito Sans', sans-serif;
    background: transparent;
    border: none;
  }
  .react-calendar button:focus {
    outline: none;
  }
  .react-calendar__navigation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    font-weight: 600;
  }
  .react-calendar__navigation__label {
    font-size: 1rem;
    color: #333;
  }
  .react-calendar__navigation__prev2-button,
  .react-calendar__navigation__next2-button {
    display: none;
  }
  .react-calendar__navigation button {
    background-color: transparent !important;
    border: none;
    color: #4a4a4a;
    font-size: 1.25rem;
    font-weight: bold;
  }
  .react-calendar__tile {
    height: 3rem;
    width: 3rem;
    max-width: 100%;
    padding: 0;
    border-radius: 50%;
    transition: background-color 0.2s, color 0.2s;
    font-weight: 500;
    color: #4a4a4a;
  }
  .react-calendar__tile:hover {
    background-color: #f0f0f0;
  }
  .react-calendar__tile--now {
    background: #f0f0ff;
    border-radius: 50%;
    font-weight: 700;
    color: #584B8B;
  }
  .react-calendar__tile--active {
    background: #584B8B !important;
    color: #fff !important;
  }
`

const AvailabilityFormModal: React.FC<AvailabilityFormModalProps> = ({ onClose, onSave }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState<string>('08:00')
  const [endTime, setEndTime] = useState<string>('17:00')
  const [duration, setDuration] = useState<number>(30)

  const handleSave = () => {
    if (!selectedDate) {
      alert('Please select a date.')
      return
    }
    onSave({ selectedDate, startTime, endTime, duration })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
        <style dangerouslySetInnerHTML={{ __html: calendarStyle }} />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add Availability</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <Calendar
              onChange={(date: Date) => setSelectedDate(date)}
              value={selectedDate}
              minDetail="month"
              next2Label={null}
              prev2Label={null}
              className="rounded-lg border-0"
            />
          </div>
          <div className="md:w-1/2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
            <input type="time" className="w-full p-2 border rounded mb-4" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <label className="block text-sm font-semibold text-gray-700 mb-1">End Time</label>
            <input type="time" className="w-full p-2 border rounded mb-4" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (minutes)</label>
            <input type="number" className="w-full p-2 border rounded mb-4" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex justify-end mt-4 gap-4">
          <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-800 hover:underline">Cancel</button>
          <button onClick={handleSave} className="bg-[#5F4B8B] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700">Save</button>
        </div>
      </div>
    </div>
  )
}

export default AvailabilityFormModal
