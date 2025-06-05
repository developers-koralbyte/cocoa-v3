// src/components/calendar/AvailabilityFormModal.tsx
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import moment from 'moment';
import 'react-calendar/dist/Calendar.css';

interface AvailabilityFormModalProps {
  onClose: () => void;
  /**
   * onSave now accepts an optional `copyPrevWeek` flag.
   * If copyPrevWeek===true, parent should ignore selectedDate/startTime/endTime/duration
   * and instead simply copy last week's availability into this week.
   */
  onSave: (data: {
    selectedDate?: Date;
    startTime?: string;
    endTime?: string;
    duration?: number;
    copyPrevWeek?: boolean;
  }) => void;
}

// We disable any date earlier than today
const tileDisabled = ({ date }: { date: Date }) => {
  return date < moment().startOf('day').toDate();
};

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
`;

const AvailabilityFormModal: React.FC<AvailabilityFormModalProps> = ({ onClose, onSave }) => {
  const [copyPrevWeek, setCopyPrevWeek] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [duration, setDuration] = useState<number>(30);
  const [error, setError] = useState<string>('');

  const handleSave = () => {
    setError('');

    if (copyPrevWeek) {
      // If user wants to copy from the previous week, we ignore the other fields
      onSave({ copyPrevWeek: true });
      return;
    }

    // Otherwise, do all the normal validations:
    if (!selectedDate) {
      setError('Please select a date.');
      return;
    }
    if (moment(selectedDate).isBefore(moment().startOf('day'))) {
      setError('You cannot add availability for a past date.');
      return;
    }

    const startMoment = moment(startTime, 'HH:mm');
    const endMoment = moment(endTime, 'HH:mm');
    if (!endMoment.isAfter(startMoment)) {
      setError('End time must be later than start time.');
      return;
    }

    const diffMinutes = endMoment.diff(startMoment, 'minutes');
    if (duration <= 0 || duration > diffMinutes) {
      setError(`Duration must be positive and no more than ${diffMinutes} minutes.`);
      return;
    }

    onSave({
      selectedDate,
      startTime,
      endTime,
      duration,
      copyPrevWeek: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
        <style dangerouslySetInnerHTML={{ __html: calendarStyle }} />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add Availability</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            &times;
          </button>
        </div>

        {error && (
          <p className="mb-2 text-sm text-red-600">{error}</p>
        )}

        {/* ‣ New checkbox: “Copy from previous week” */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="copyPrevWeek"
            checked={copyPrevWeek}
            onChange={(e) => {
              setCopyPrevWeek(e.target.checked);
              setError('');
            }}
            className="h-4 w-4 text-purple-600 border-gray-300 rounded"
          />
          <label htmlFor="copyPrevWeek" className="ml-2 text-sm text-gray-700">
            Copy availability from previous week
          </label>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Calendar */}
          <div className="md:w-1/2">
            <Calendar
              onChange={(date: Date) => {
                setSelectedDate(date);
                setError('');
              }}
              value={selectedDate}
              tileDisabled={tileDisabled}
              minDetail="month"
              next2Label={null}
              prev2Label={null}
              className="rounded-lg border-0"
              // If “copyPrevWeek” is true, disable the calendar entirely
              tileClassName={() => (copyPrevWeek ? 'opacity-50 pointer-events-none' : '')}
            />
          </div>

          {/* Right: Time / Duration Inputs */}
          <div className="md:w-1/2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              className={`w-full p-2 border rounded mb-4 ${
                copyPrevWeek ? 'opacity-50 pointer-events-none' : ''
              }`}
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setError('');
              }}
              disabled={copyPrevWeek}
            />

            <label className="block text-sm font-semibold text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              className={`w-full p-2 border rounded mb-4 ${
                copyPrevWeek ? 'opacity-50 pointer-events-none' : ''
              }`}
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                setError('');
              }}
              disabled={copyPrevWeek}
            />

            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              className={`w-full p-2 border rounded mb-4 ${
                copyPrevWeek ? 'opacity-50 pointer-events-none' : ''
              }`}
              value={duration}
              onChange={(e) => {
                setDuration(Number(e.target.value));
                setError('');
              }}
              disabled={copyPrevWeek}
              min={1}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 gap-4">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#5F4B8B] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityFormModal;
