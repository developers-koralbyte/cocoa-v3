import React, { useState } from 'react'
import moment from 'moment'


export interface AvailabilitySlot {
  day: string   // e.g. "Monday"
  start: string // e.g. "08:00"
  end: string   // e.g. "17:00"
}

export interface DayObj {
  dateObj: moment.Moment
  label: string  // e.g. "MON"
  date: number   // e.g. 27
}

export interface TimeSlot {
  time: string   // e.g. "8:00 AM"
}


interface AppointmentModalProps {
  onClose: () => void;
  onSchedule: (appointmentData: { selectedDay: DayObj; selectedTime: string; description: string }) => void;
  availability: AvailabilitySlot[];
}


const getDaysInMonth = (monthMoment: moment.Moment): DayObj[] => {
  const days: DayObj[] = []
  const start = monthMoment.clone().startOf('month')
  const end = monthMoment.clone().endOf('month')
  let day = start.clone()
  while (day.isSameOrBefore(end, 'day')) {
    days.push({
      dateObj: day.clone(),
      label: day.format('ddd').toUpperCase(),
      date: day.date(),
    })
    day.add(1, 'day')
  }
  return days
}


const generateTimeSlots = (start: string, end: string): TimeSlot[] => {
  const slots: TimeSlot[] = []
  let current = moment(start, 'HH:mm')
  const finish = moment(end, 'HH:mm')
  while (current < finish) {
    slots.push({ time: current.format('h:mm A') })
    current.add(30, 'minutes')
  }
  return slots
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  onClose,
  onSchedule,
  availability,
}) => {

  const allMonths = Array.from({ length: 12 }, (_, i) => moment().month(i))
  const [selectedMonth, setSelectedMonth] = useState<moment.Moment>(moment())
  const daysInMonth = getDaysInMonth(selectedMonth)

 
  const visibleCount = 7
  const [sliderStart, setSliderStart] = useState(0)
  const visibleDays = daysInMonth.slice(sliderStart, sliderStart + visibleCount)

  // Selected day and time
  const [selectedDay, setSelectedDay] = useState<DayObj | null>(visibleDays[0] || null)
  const [selectedTime, setSelectedTime] = useState<string>('')

 
  const [description, setDescription] = useState<string>('')


  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const monthIndex = parseInt(e.target.value, 10)
    const newMonth = allMonths[monthIndex]
    setSelectedMonth(newMonth)
    setSliderStart(0)
    const newDays = getDaysInMonth(newMonth)
    setSelectedDay(newDays[0] || null)
    setSelectedTime('')
  }

  // Slider arrow handlers
  const handlePrev = () => {
    setSliderStart((prev) => Math.max(prev - 1, 0))
    setSelectedTime('')
  }
  const handleNext = () => {
    setSliderStart((prev) =>
      Math.min(prev + 1, daysInMonth.length - visibleCount)
    )
    setSelectedTime('')
  }

  // Determine vendor availability for the selected day (by weekday)
  const weekdayName = selectedDay ? selectedDay.dateObj.format('dddd') : ''
  const vendorAvail = availability.find((slot) => slot.day === weekdayName)
  const globalTimeSlots =
    vendorAvail && vendorAvail.start !== vendorAvail.end
      ? generateTimeSlots(vendorAvail.start, vendorAvail.end)
      : []

  // Condition for margin classes on arrow buttons
  const shouldApplyMargin = !!(selectedDay && globalTimeSlots.length > 0)
  const prevArrowMargin = shouldApplyMargin ? 'mb-40 mr-2' : ''
  const nextArrowMargin = shouldApplyMargin ? 'mb-40 ml-2' : ''

  // Handle scheduling
  const handleScheduleClick = () => {
    if (!selectedDay || !selectedTime) {
      alert('Please select a day and time slot.')
      return
    }
    onSchedule({
      selectedDay,
      selectedTime,
      description, 
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4 font-[Nunito_Sans]">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
        {/* Header with Month Dropdown */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-800">Schedule Appointment</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Select Month
          </label>
          <select
            className="w-full p-2 border rounded text-sm"
            value={allMonths.findIndex((m) => m.isSame(selectedMonth, 'month'))}
            onChange={handleMonthChange}
          >
            {allMonths.map((m, index) => (
              <option key={index} value={index}>
                {m.format('MMMM')} {m.year()}
              </option>
            ))}
          </select>
        </div>

        {/* Days Slider with Arrows */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={sliderStart === 0}
              className={`text-gray-500 disabled:opacity-50 text-xl ${prevArrowMargin}`}
            >
              &lt;
            </button>

            <div className="flex space-x-4">
              {visibleDays.map((day) => {
               
                const isPast = day.dateObj.isBefore(moment().startOf('day'), 'day')

              
                const weekday = day.dateObj.format('dddd')
                const foundAvail = availability.find((slot) => slot.day === weekday)
                let dayTimeSlots: TimeSlot[] = []
                if (foundAvail && foundAvail.start !== foundAvail.end) {
                  dayTimeSlots = generateTimeSlots(foundAvail.start, foundAvail.end)
                }
                const isDisabled = isPast || dayTimeSlots.length === 0

                const isSelected =
                  selectedDay && day.dateObj.isSame(selectedDay.dateObj, 'day')

                return (
                  <div key={day.dateObj.toString()} className="flex flex-col items-center">
                    <button
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedDay(day)
                          setSelectedTime('')
                        }
                      }}
                      disabled={isDisabled}
                      className={`px-4 py-3 rounded-md w-full font-bold
                        ${
                          isSelected
                            ? 'border-[#584B8B] bg-[#e8e1fa] text-[#584B8B]'
                            : 'border-gray-200 bg-white text-gray-700'
                        }
                        ${
                          isDisabled
                            ? 'opacity-50 cursor-not-allowed border border-gray-300'
                            : 'border'
                        }
                      `}
                    >
                      <div className="text-sm">{day.label}</div>
                      <div className="text-lg">{day.date}</div>
                    </button>

                    {/* If this day is selected, show the time slots */}
                    {isSelected && (
                      <div className="mt-2 flex flex-col space-y-2 max-h-40 overflow-y-auto hide-scrollbar">
                        {dayTimeSlots.length > 0 && !isPast ? (
                          dayTimeSlots.map((slot) => {
                            const timeSelected = selectedTime === slot.time
                            return (
                              <button
                                key={slot.time}
                                onClick={() => setSelectedTime(slot.time)}
                                className={`px-4 py-2 rounded-md text-sm border border-gray-300
                                  hover:border-[#584B8B] hover:text-[#584B8B] transition-colors ease-in-out
                                  ${
                                    timeSelected
                                      ? 'border-[#584B8B] text-[#584B8B] bg-white font-bold'
                                      : 'bg-white text-gray-700'
                                  } min-w-[80px] mb-1 whitespace-nowrap`}
                                style={{ minWidth: '75px', marginBottom: '2px' }}
                              >
                                {slot.time}
                              </button>
                            )
                          })
                        ) : (
                          <span className="text-[10px] text-red-400">
                            No availability
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              onClick={handleNext}
              disabled={sliderStart >= daysInMonth.length - visibleCount}
              className={`text-gray-500 disabled:opacity-50 text-xl ${nextArrowMargin}`}
            >
              &gt;
            </button>
          </div>
        </div>

       
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Meeting Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter meeting details..."
            className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            rows={3}
          />
        </div>

        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleScheduleClick}
            className="bg-[#584B8B] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentModal
