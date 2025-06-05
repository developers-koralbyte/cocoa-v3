import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import moment from 'moment';
import 'react-calendar/dist/Calendar.css';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuth } from '../../utils/AuthContext';

export interface AvailabilitySlot {
  date: string;          // e.g. "2025-04-07T20:10:32.044Z"
  startTime: string;     // e.g. "08:00"
  endTime: string;       // e.g. "17:00"
  duration?: number;     // in minutes (optional; default to 30)
}

export interface TimeSlot {
  time: string;          // e.g. "8:00 AM"
}

interface AppointmentModalProps {
  onClose: () => void;
  onSchedule: (data: {
    selectedDate: Date;
    selectedTime: string;     // "h:mm A"
    computedEndTime: string;  // "h:mm A"
    description: string;
    guests: string[];         // e.g. ['alice@example.com', 'bob@example.com']
    meetingLink: string;
  }) => void;
  selectedPartner: string;    // the vendorId or buyerId we're scheduling with
}

// Create slots from start (HH:mm) up to end (HH:mm), stepping by duration
const generateTimeSlots = (
  start: string,  // "08:00"
  end: string,    // "17:00"
  duration: number = 30
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  let current = moment(start, 'HH:mm');
  const finish = moment(end, 'HH:mm');
  while (current.isBefore(finish)) {
    slots.push({ time: current.format('h:mm A') });
    current.add(duration, 'minutes');
  }
  return slots;
};

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  onClose,
  onSchedule,
  selectedPartner,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>(''); // "h:mm A"
  const [description, setDescription] = useState<string>('');
  const [participants, setParticipants] = useState<string[]>(['']);
  const [participantErrors, setParticipantErrors] = useState<string[]>(['']);
  const [meetingLink, setMeetingLink] = useState<string>('');

  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [bookedAppointments, setBookedAppointments] = useState<any[]>([]);

  const { user: authUser } = useAuth();

  // Determine weekday (e.g. "monday", "tuesday", etc.)
  const weekdayName = moment(selectedDate).format('dddd').toLowerCase();

  // Email regex
  const isValidEmail = (email: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email.trim());
  };

  // Disable past dates in the left calendar
  const tileDisabled = ({ date }: { date: Date }) => {
    return date < moment().startOf('day').toDate();
  };

  // -------------- Fetch Partner Availability --------------
  const fetchPartnerAvailability = async (): Promise<AvailabilitySlot[]> => {
    if (!selectedPartner) return [];
    // First check "Vendors" collection
    let partnerDocRef = doc(db, 'Vendors', selectedPartner);
    let partnerSnap = await getDoc(partnerDocRef);

    if (!partnerSnap.exists()) {
      // If not in Vendors, check "Buyers"
      partnerDocRef = doc(db, 'Buyers', selectedPartner);
      partnerSnap = await getDoc(partnerDocRef);
    }

    if (partnerSnap.exists()) {
      const data = partnerSnap.data();
      return (data.availability || []) as AvailabilitySlot[];
    } else {
      return [];
    }
  };

  // -------------- Fetch Booked Appointments --------------
  const fetchBookedAppointmentsForPartner = async () => {
    if (!selectedPartner) return;
    const dateToQuery = selectedDate || new Date();
    const startOfDay = moment(dateToQuery).startOf('day').toDate();
    const endOfDay = moment(dateToQuery).endOf('day').toDate();

    if (!authUser || !authUser.id) return;

    // If I'm the buyer, I need to query vendorId = selectedPartner, else buyerId
    const currentUserRole = (authUser.role || '').toLowerCase();
    const field = currentUserRole === 'buyer' ? 'vendorId' : 'buyerId';

    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where(field, '==', selectedPartner),
      where('selectedDate', '>=', startOfDay),
      where('selectedDate', '<=', endOfDay)
    );
    try {
      const querySnapshot = await getDocs(q);
      const booked = querySnapshot.docs.map((d) => d.data());
      setBookedAppointments(booked);
    } catch (error) {
      console.error('Error fetching booked appointments:', error);
    }
  };

  // Whenever selectedPartner or selectedDate changes, re‐fetch availability & booked appointments
  useEffect(() => {
    if (!selectedPartner) return;
    (async () => {
      const avail = await fetchPartnerAvailability();
      setAvailability(avail);
      await fetchBookedAppointmentsForPartner();
    })();
  }, [selectedPartner, selectedDate]);

  // -------------- Derive “today’s availability slot” --------------
  const partnerAvail = availability.find((slot) => {
    if (!slot.date) return false;
    // Compare weekday names
    const slotDayName = moment(slot.date).format('dddd').toLowerCase();
    return slotDayName === weekdayName;
  });
  const duration = partnerAvail?.duration ?? 30;
  const timeSlots =
    partnerAvail && partnerAvail.startTime !== partnerAvail.endTime
      ? generateTimeSlots(partnerAvail.startTime, partnerAvail.endTime, duration)
      : [];

  // -------------- Check if a time slot is already booked --------------
  const isSlotBooked = (slotTime: string) => {
    // Each booked appointment has: selectedDate (Timestamp), selectedTime (e.g. "8:00 AM"), and maybe a duration
    return bookedAppointments.some((app) => {
      // We only need to compare the same day & exact time string
      return (app.selectedTime || '') === slotTime;
    });
  };

  // -------------- Participant Fields --------------
  const handleAddParticipantField = () => {
    setParticipants((prev) => [...prev, '']);
    setParticipantErrors((prev) => [...prev, '']);
  };

  const handleParticipantChange = (index: number, value: string) => {
    setParticipants((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
    setParticipantErrors((prev) => {
      const updated = [...prev];
      updated[index] = '';
      return updated;
    });
  };

  const handleParticipantBlur = (index: number) => {
    const email = participants[index];
    if (email.trim() && !isValidEmail(email)) {
      setParticipantErrors((prev) => {
        const updated = [...prev];
        updated[index] = 'Enter a valid email.';
        return updated;
      });
    }
  };

  // -------------- Handle “Schedule” --------------
  const [error, setError] = useState<string>('');

  const handleSchedule = () => {
    setError('');

    // 1) Must pick a slot
    if (!selectedTime) {
      setError('Please select a time slot.');
      return;
    }

    // 2) If any participant fields are non‐empty, they must be valid
    for (let i = 0; i < participants.length; i++) {
      const email = participants[i];
      if (email.trim() && !isValidEmail(email)) {
        setError(`"${email}" is not a valid email.`);
        return;
      }
    }

    // 3) Compute endTime from selectedTime + duration
    const timeMoment = moment(selectedTime, 'h:mm A');
    if (!timeMoment.isValid()) {
      setError('Selected time format is invalid.');
      return;
    }
    const computedEndTime = timeMoment.clone().add(duration, 'minutes').format('h:mm A');

    // 4) Check that this appointment does not overlap any already booked appointment
    //    We'll compute numeric-minute window and compare
    const selectedStart = moment(selectedTime, 'h:mm A');
    const selectedEnd = moment(computedEndTime, 'h:mm A');

    const hasConflict = bookedAppointments.some((app) => {
      if (!app.selectedTime) return false;
      // If the existing appointment has a `duration` field, use it; else assume 60m
      const existingStart = moment(app.selectedTime, 'h:mm A');
      const existingDur = app.duration ?? 60;
      const existingEnd = existingStart.clone().add(existingDur, 'minutes');
      // Overlap if start1 < end2 && start2 < end1
      return (
        selectedStart.isBefore(existingEnd) &&
        existingStart.isBefore(selectedEnd)
      );
    });

    if (hasConflict) {
      setError('This time slot overlaps an already booked appointment.');
      return;
    }

    // 5) All good: call onSchedule (parent will handle Firestore write)
    onSchedule({
      selectedDate,
      selectedTime,
      computedEndTime,
      description,
      guests: participants.filter((e) => e.trim() !== ''),
      meetingLink,
    });

    onClose();
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

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col">
        <style dangerouslySetInnerHTML={{ __html: calendarStyle }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Schedule Appointment
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            &times;
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left column: Calendar & summary */}
          <div className="w-full md:w-1/2 p-6 border-r border-gray-200 overflow-auto">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Select Date
            </h3>
            <div className="rounded-lg shadow-sm p-2 bg-white">
              <Calendar
                onChange={(date: Date) => {
                  setSelectedDate(date);
                  setSelectedTime('');
                  setError('');
                  fetchBookedAppointmentsForPartner();
                }}
                value={selectedDate}
                minDate={new Date()}
                tileDisabled={tileDisabled}
                className="rounded-lg border-0"
                next2Label={null}
                prev2Label={null}
                prevLabel={<span>&lt;</span>}
                nextLabel={<span>&gt;</span>}
              />
            </div>

            {/* Meeting Summary */}
            {(selectedTime ||
              description ||
              participants.some((e) => e.trim()) ||
              meetingLink) && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-md font-semibold mb-2 text-gray-700">
                  Meeting Details
                </h4>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Date:</strong>{' '}
                  {moment(selectedDate).format('dddd, MMM D, YYYY')}
                </p>
                {selectedTime && (
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Time:</strong> {selectedTime} –{' '}
                    {moment(selectedTime, 'h:mm A')
                      .add(duration, 'minutes')
                      .format('h:mm A')}
                  </p>
                )}
                {description ? (
                  <p className="text-sm text-gray-600">
                    <strong>Description:</strong> {description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No description provided.
                  </p>
                )}
                {participants.some((e) => e.trim()) && (
                  <div className="text-sm text-gray-600 mt-2">
                    <strong>Participants:</strong>
                    <ul className="list-disc list-inside ml-2 mt-1">
                      {participants.map(
                        (email, i) => email.trim() && <li key={i}>{email.trim()}</li>
                      )}
                    </ul>
                  </div>
                )}
                {meetingLink && (
                  <p className="text-sm text-gray-600">
                    <strong>Meeting Link:</strong> {meetingLink}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right column: Time slots & inputs */}
          <div className="w-full md:w-1/2 p-6 overflow-auto">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Select Time
            </h3>
            {timeSlots.length > 0 ? (
              <div
                className="flex flex-wrap gap-3 mb-6"
                style={{ maxHeight: '240px', overflowY: 'auto' }}
              >
                {timeSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  const disabled = isSlotBooked(slot.time);
                  return (
                    <button
                      key={slot.time}
                      onClick={() => {
                        if (!disabled) {
                          setSelectedTime(slot.time);
                          setError('');
                        }
                      }}
                      disabled={disabled}
                      className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                        disabled
                          ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-purple-100 text-purple-700 border-purple-300 font-semibold'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:text-purple-600'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-red-400 text-sm mb-6">
                No availability for {moment(selectedDate).format('dddd')}.
              </p>
            )}

            <p className="mb-4 text-sm text-red-600">{error}</p>

            {/* Description */}
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Meeting Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any details about the meeting..."
              className="w-full mb-6 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
              rows={4}
            />

            {/* Participants */}
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Participants
            </label>
            {participants.map((value, idx) => (
              <div className="mb-3" key={idx}>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleParticipantChange(idx, e.target.value)}
                  onBlur={() => handleParticipantBlur(idx)}
                  placeholder="Enter participant's email..."
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
                />
                {participantErrors[idx] && (
                  <p className="text-xs text-red-500 mt-1">{participantErrors[idx]}</p>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddParticipantField}
              className="text-sm font-semibold text-white px-3 py-2 rounded-lg"
              style={{ backgroundColor: '#5F4B8B' }}
            >
              + Add Another
            </button>

            {/* Meeting Link */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Meeting Link
              </label>
              <input
                type="text"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="e.g. https://meet.example.com/..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            className="bg-[#5F4B8B] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
