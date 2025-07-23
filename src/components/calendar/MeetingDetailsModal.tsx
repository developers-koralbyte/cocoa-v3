// src/components/calendar/MeetingDetailsModal.tsx
import React, { useEffect, useState } from 'react'
import moment from 'moment'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    runTransaction,
    deleteDoc,
} from 'firebase/firestore'
import { db } from '../../utils/firebase'
import { Pencil, Check, X, Clock, User as UserIcon, Trash2 } from 'lucide-react'

type OpponentRole = 'vendor' | 'buyer'

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

export interface AvailabilitySlot {
    date: string // ISO string
    startTime: string // "HH:mm"
    endTime: string // "HH:mm"
    duration?: number // in minutes (optional; default 30)
}

function generateTimeSlotsFromRange(
    startTime: string,
    endTime: string,
    slotDuration = 30
) {
    const out: string[] = []
    let current = moment(startTime, 'HH:mm')
    const finish = moment(endTime, 'HH:mm')
    while (current < finish) {
        out.push(current.format('h:mm A'))
        current.add(slotDuration, 'minutes')
    }
    return out
}

function buildGoogleCalUrl(
    title: string,
    start: Date,
    end: Date,
    description?: string
) {
    const startStr = moment(start).utc().format('YYYYMMDDTHHmmss[Z]')
    const endStr = moment(end).utc().format('YYYYMMDDTHHmmss[Z]')
    const calURL = new URL('https://calendar.google.com/calendar/render')
    calURL.searchParams.set('action', 'TEMPLATE')
    calURL.searchParams.set('text', title || 'Meeting')
    calURL.searchParams.set('dates', `${startStr}/${endStr}`)
    if (description) {
        calURL.searchParams.set('details', description)
    }
    return calURL.toString()
}

function combineDateAndTime(date: Date, timeStr: string): Date {
    const dateMoment = moment(date).startOf('day')
    const timeMoment = moment(timeStr, 'h:mm A')
    dateMoment.hours(timeMoment.hours()).minutes(timeMoment.minutes())
    return dateMoment.toDate()
}

export interface MeetingDetailsModalProps {
    isOpen: boolean
    onClose: () => void

    appointmentId: string
    title: string
    description?: string
    start: Date
    end: Date
    category?: string
    withUserName: string
    withUserAvatar?: string

    opponentRole: OpponentRole
    opponentId: string

    selectedTime?: string
    durationMinutes?: number
    guests?: string[]
    meetingLink?: string

    onRescheduleSuccess?: (newStart: Date, newSlot: string) => void

    /** NEW: Called after “Edit Details” is saved, so the parent can re‐fetch. */
    onDetailsSave?: () => void

    /** OPTIONAL: Called after deletion, so the parent can re‐fetch. */
    onDeleteSuccess?: () => void
}

const MeetingDetailsModal: React.FC<MeetingDetailsModalProps> = ({
    isOpen,
    onClose,

    appointmentId,
    title,
    description,
    start,
    end,
    category,
    withUserName,
    withUserAvatar,

    opponentRole,
    opponentId,

    selectedTime = '',
    durationMinutes = 30,
    guests = [],
    meetingLink = '',

    onRescheduleSuccess,
    onDetailsSave,
    onDeleteSuccess,
}) => {
    const [isEditingDetails, setIsEditingDetails] = useState(false)
    const [tempDesc, setTempDesc] = useState('')
    const [tempGuests, setTempGuests] = useState('')
    const [tempMeetingLink, setTempMeetingLink] = useState('')

    const [isRescheduling, setIsRescheduling] = useState(false)
    const [newDate, setNewDate] = useState<Date>(start)
    const [selectedSlot, setSelectedSlot] = useState<string>('')
    const [conflictError, setConflictError] = useState('')

    const [opponentAvailability, setOpponentAvailability] = useState<
        AvailabilitySlot[]
    >([])
    const [timeSlots, setTimeSlots] = useState<string[]>([])

    const [currentDesc, setCurrentDesc] = useState(description || '')
    const [currentGuests, setCurrentGuests] = useState<string[]>(guests)
    const [currentMeetingLink, setCurrentMeetingLink] = useState(meetingLink)

    const [localStart, setLocalStart] = useState(start)

    // Disable past dates in the rescheduling calendar
    const disablePastDates = ({ date }: { date: Date }) =>
        date < moment().startOf('day').toDate()

    // Whenever the modal opens or its inputs change, reset all internal state:
    useEffect(() => {
        if (!isOpen) return

        setIsEditingDetails(false)
        setTempDesc(description || '')
        setTempGuests((guests || []).join(', '))
        setTempMeetingLink(meetingLink || '')
        setCurrentDesc(description || '')
        setCurrentGuests(guests || [])
        setCurrentMeetingLink(meetingLink || '')
        setIsRescheduling(false)
        setNewDate(start)
        setSelectedSlot(selectedTime || moment(start).format('h:mm A'))
        setLocalStart(start)
        setConflictError('')

        // Fetch the opponent’s availability from Firestore:
        fetchOpponentAvailability(opponentId, opponentRole)
    }, [
        isOpen,
        description,
        guests,
        meetingLink,
        start,
        selectedTime,
        opponentId,
        opponentRole,
    ])

    // If the parent changes `start`/`selectedTime` while we are not editing or rescheduling,
    // update our localStart and selectedSlot accordingly:
    useEffect(() => {
        if (!isEditingDetails && !isRescheduling) {
            setLocalStart(start)
            setSelectedSlot(selectedTime || moment(start).format('h:mm A'))
        }
    }, [start, selectedTime, isEditingDetails, isRescheduling])

    // Fetch the opponent’s availability from the correct collection (“Vendors” if role=’vendor’,
    // otherwise “Buyers”) and store in state:
    async function fetchOpponentAvailability(id: string, role: OpponentRole) {
        try {
            const colName = role === 'vendor' ? 'Vendors' : 'Buyers'
            const docRef = doc(db, colName, id)
            const snap = await getDoc(docRef)
            if (snap.exists()) {
                const data = snap.data()
                setOpponentAvailability(
                    (data.availability as AvailabilitySlot[]) || []
                )
            } else {
                setOpponentAvailability([])
            }
        } catch (err) {
            console.error('fetchOpponentAvailability error:', err)
            setOpponentAvailability([])
        }
    }

    // Whenever “isRescheduling” flips to true, or whenever newDate changes,
    // recompute the time slots for that exact date (if availability exists):
    useEffect(() => {
        if (!isRescheduling) {
            setTimeSlots([])
            return
        }

        const foundSlot = opponentAvailability.find((slot) =>
            moment(slot.date).isSame(newDate, 'day')
        )

        if (foundSlot) {
            const dur = foundSlot.duration || 30
            const generated = generateTimeSlotsFromRange(
                foundSlot.startTime,
                foundSlot.endTime,
                dur
            )
            setTimeSlots(generated)

            if (!generated.includes(selectedSlot)) {
                setSelectedSlot('')
            }
        } else {
            // No availability for that exact date:
            setTimeSlots([])
            setSelectedSlot('')
        }
    }, [isRescheduling, newDate, opponentAvailability])

    // === “Edit Details” ===
    async function handleSaveDetails() {
        try {
            // 1) Parse comma‐separated participants into an array
            const newGuests = tempGuests
                .split(',')
                .map((e) => e.trim())
                .filter((e) => e !== '')

            // 2) Write to Firestore:
            await updateDoc(doc(db, 'appointments', appointmentId), {
                description: tempDesc,
                guests: newGuests,
                meetingLink: tempMeetingLink,
            })

            // 3) Update our local “current…” state so the modal reflects the change immediately:
            setIsEditingDetails(false)
            setCurrentDesc(tempDesc)
            setCurrentGuests(newGuests)
            setCurrentMeetingLink(tempMeetingLink)

            // 4) Notify parent to re‐fetch its calendar events (so the calendar view updates immediately):
            if (onDetailsSave) {
                onDetailsSave()
            }
        } catch (err) {
            console.error('Error updating details b:', err)
        }
    }

    // === “Reschedule” ===
    async function handleRescheduleConfirm() {
        if (timeSlots.length === 0) {
            setConflictError('No availability on the selected date.')
            return
        }
        if (!selectedSlot) {
            setConflictError('Please choose a valid time slot.')
            return
        }

        const combined = combineDateAndTime(newDate, selectedSlot)
        if (combined < new Date()) {
            setConflictError('Cannot reschedule to a past date/time.')
            return
        }

        try {
            const fieldToCheck =
                opponentRole === 'vendor' ? 'vendorId' : 'buyerId'
            await runTransaction(db, async (transaction) => {
                const startOfDay = moment(combined).startOf('day').toDate()
                const endOfDay = moment(combined).endOf('day').toDate()
                const appointmentsRef = collection(db, 'appointments')
                const qCheck = query(
                    appointmentsRef,
                    where(fieldToCheck, '==', opponentId),
                    where('selectedDate', '>=', startOfDay),
                    where('selectedDate', '<=', endOfDay)
                )
                const snaps = await getDocs(qCheck)

                let conflict = false
                snaps.forEach((docSnap) => {
                    const data = docSnap.data()
                    if (
                        data.selectedTime === selectedSlot &&
                        docSnap.id !== appointmentId
                    ) {
                        conflict = true
                    }
                })
                if (conflict) {
                    throw new Error(
                        'This time slot is already booked by the opponent.'
                    )
                }

                transaction.update(doc(db, 'appointments', appointmentId), {
                    selectedDate: combined,
                    selectedTime: selectedSlot,
                })
            })

            const newStart = combineDateAndTime(newDate, selectedSlot)
            setLocalStart(newStart)
            setIsRescheduling(false)
            setConflictError('')

            if (onRescheduleSuccess) {
                onRescheduleSuccess(newStart, selectedSlot)
            }
        } catch (err: any) {
            setConflictError(err.message || 'Failed to reschedule.')
            console.error('Error rescheduling:', err)
        }
    }

    // === “Cancel Appointment” / Delete ===
    async function handleCancelAppointment() {
        const confirmResult = window.confirm(
            'Are you sure you want to cancel this appointment? This action cannot be undone.'
        )
        if (!confirmResult) return

        try {
            await deleteDoc(doc(db, 'appointments', appointmentId))
            if (onDeleteSuccess) {
                onDeleteSuccess()
            }
            onClose()
        } catch (err) {
            console.error('Error deleting appointment:', err)
        }
    }

    // === Compute “Add to Google Calendar” link ===
    const computedDuration =
        durationMinutes || moment(end).diff(moment(localStart), 'minutes') || 60
    const endDate = new Date(localStart.getTime() + computedDuration * 60000)
    const googleCalendarUrl = buildGoogleCalUrl(
        title,
        localStart,
        endDate,
        currentDesc
    )

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="relative bg-white rounded-xl shadow-lg max-w-3xl w-full p-0">
                {/* “X” Button to close */}
                <button
                    className="absolute top-3 right-4 text-xl text-gray-500 z-10"
                    onClick={onClose}
                >
                    &times;
                </button>

                <div className="p-6 max-h-[90vh] overflow-y-auto">
                    <style
                        dangerouslySetInnerHTML={{ __html: calendarStyle }}
                    />

                    <h2 className="text-2xl font-bold text-[#5F4B8B] mb-3">
                        {title}
                    </h2>

                    <div className="flex items-center mb-4">
                        {withUserAvatar ? (
                            <img
                                src={withUserAvatar}
                                alt="User Avatar"
                                className="w-12 h-12 rounded-full mr-3 object-cover"
                            />
                        ) : (
                            <UserIcon className="w-10 h-10 mr-3 text-gray-400" />
                        )}
                        <p className="text-gray-700 text-md">
                            With <strong>{withUserName}</strong>
                        </p>
                    </div>

                    {!isRescheduling && (
                        <div className="text-gray-800 mb-4">
                            <p>
                                <strong>Time:</strong>{' '}
                                {moment(localStart).format(
                                    'dddd, MMM D, h:mm A'
                                )}
                            </p>
                            <p>
                                <strong>Duration:</strong> {computedDuration}{' '}
                                minutes
                            </p>
                            {category && (
                                <p className="text-sm text-purple-700 mt-2">
                                    <strong>Category:</strong> {category}
                                </p>
                            )}
                        </div>
                    )}

                    {/* ────────── DETAILS SECTION ────────── */}
                    {!isRescheduling && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-md font-semibold text-gray-700">
                                    Details
                                </h4>
                                {!isEditingDetails && (
                                    <button
                                        onClick={() => {
                                            setIsEditingDetails(true)
                                            setTempDesc(currentDesc)
                                            setTempGuests(
                                                currentGuests.join(', ')
                                            )
                                            setTempMeetingLink(
                                                currentMeetingLink
                                            )
                                        }}
                                        className="text-sm text-purple-600 hover:underline flex items-center"
                                    >
                                        <Pencil className="w-4 h-4 mr-1" />
                                        Edit
                                    </button>
                                )}
                            </div>

                            {isEditingDetails ? (
                                <div className="mt-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={tempDesc}
                                        onChange={(e) =>
                                            setTempDesc(e.target.value)
                                        }
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-300 text-sm"
                                        rows={3}
                                    />
                                    <label className="block text-sm font-semibold text-gray-700 mt-3 mb-1">
                                        Participants (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={tempGuests}
                                        onChange={(e) =>
                                            setTempGuests(e.target.value)
                                        }
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-300 text-sm"
                                    />
                                    <label className="block text-sm font-semibold text-gray-700 mt-3 mb-1">
                                        Meeting Link
                                    </label>
                                    <input
                                        type="text"
                                        value={tempMeetingLink}
                                        onChange={(e) =>
                                            setTempMeetingLink(e.target.value)
                                        }
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-300 text-sm"
                                    />

                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={handleSaveDetails}
                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-[#5F4B8B] text-white rounded hover:bg-purple-700"
                                        >
                                            <Check className="w-4 h-4" />
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingDetails(false)
                                            }}
                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-2 text-sm text-gray-600">
                                    <p>
                                        <strong>Description:</strong>{' '}
                                        {currentDesc ||
                                            'No description provided.'}
                                    </p>
                                    <p>
                                        <strong>Participants:</strong>{' '}
                                        {currentGuests &&
                                        currentGuests.length > 0
                                            ? currentGuests.join(', ')
                                            : 'None'}
                                    </p>
                                    <p>
                                        <strong>Meeting Link:</strong>{' '}
                                        {currentMeetingLink || 'None'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ────────── RESCHEDULE SECTION ────────── */}
                    {isRescheduling ? (
                        <div className="bg-gray-50 rounded p-4 mb-4">
                            <h4 className="text-md font-semibold text-gray-800 flex items-center mb-3">
                                <Clock className="w-5 h-5 mr-2" />
                                Reschedule Appointment
                            </h4>
                            <p className="text-xs text-gray-500 mb-4">
                                Select a new date &amp; time based on the
                                opponent’s availability.
                            </p>
                            <div className="mb-4">
                                <Calendar
                                    onChange={(dateVal: any) => {
                                        if (dateVal instanceof Date) {
                                            setNewDate(dateVal)
                                        }
                                    }}
                                    value={newDate}
                                    tileDisabled={disablePastDates}
                                />
                            </div>
                            <div className="mb-4">
                                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                                    Select Time
                                </h5>
                                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-3">
                                    {timeSlots.length > 0 ? (
                                        timeSlots.map((slot) => {
                                            const isSelected =
                                                slot === selectedSlot
                                            return (
                                                <button
                                                    key={slot}
                                                    onClick={() =>
                                                        setSelectedSlot(slot)
                                                    }
                                                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                                                        isSelected
                                                            ? 'bg-[#E9D8FD] border-purple-400 text-purple-800 font-semibold'
                                                            : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {slot}
                                                </button>
                                            )
                                        })
                                    ) : (
                                        <p className="text-xs text-gray-500 col-span-full">
                                            No available slots for this date.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {conflictError && (
                                <p className="text-red-500 text-sm mb-3">
                                    {conflictError}
                                </p>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleRescheduleConfirm}
                                    disabled={
                                        timeSlots.length === 0 || !selectedSlot
                                    }
                                    className={`px-4 py-2 rounded text-sm font-semibold ${
                                        !selectedSlot
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-[#5F4B8B] hover:bg-purple-700 text-white'
                                    }`}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsRescheduling(false)
                                        setConflictError('')
                                    }}
                                    className="bg-gray-200 text-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-3 mb-3">
                                <button
                                    onClick={() => setIsRescheduling(true)}
                                    className="flex-1 bg-[#5F4B8B] hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-semibold"
                                >
                                    Reschedule
                                </button>
                                <button
                                    onClick={handleCancelAppointment}
                                    className="flex-1 flex items-center justify-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded text-sm font-semibold"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Cancel Appointment
                                </button>
                            </div>
                            <a
                                href={googleCalendarUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-sm text-purple-600 hover:underline text-center"
                            >
                                Add to Google Calendar
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MeetingDetailsModal
