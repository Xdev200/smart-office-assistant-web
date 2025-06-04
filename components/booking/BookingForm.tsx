
import React, { useState, useEffect } from 'react';
import { Booking, Room } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Spinner } from '../common/Spinner';
import { Alert } from '../common/Alert';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  selectedDate: string;
  existingBookings: Booking[];
  onBookingConfirmed: (newBooking: Booking) => void;
}

// Generate time slots (e.g., every 30 minutes from 8 AM to 6 PM)
const generateTimeSlots = (intervalMinutes: number = 30, startHour: number = 8, endHour: number = 18) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
  }
  return slots;
};

const ALL_TIME_SLOTS = generateTimeSlots();


export const BookingForm: React.FC<BookingFormProps> = ({ isOpen, onClose, room, selectedDate, existingBookings, onBookingConfirmed }) => {
  const { currentUser } = useAuth();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setStartTime('');
      setEndTime('');
      setTitle(currentUser ? `${currentUser.name}'s Meeting` : 'Meeting');
      setError(null);
    }
  }, [isOpen, currentUser]);

  if (!room) return null;

  const getAvailableTimeSlots = () => {
    return ALL_TIME_SLOTS.filter(slot => {
      return !existingBookings.some(booking => {
        // Check if slot is within an existing booking's range
        return slot >= booking.startTime && slot < booking.endTime;
      });
    });
  };
  
  const availableStartTimes = getAvailableTimeSlots();
  
  const availableEndTimes = startTime ? ALL_TIME_SLOTS.filter(slot => {
    if (slot <= startTime) return false; // End time must be after start time
    // Check if there's any existing booking between startTime and slot
    return !existingBookings.some(booking => 
        booking.startTime < slot && booking.endTime > startTime
    );
  }) : [];


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser || !room || !startTime || !endTime || !title) {
      setError("Please fill in all fields.");
      return;
    }
    if (endTime <= startTime) {
      setError("End time must be after start time.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, call mockApiService.createBooking
      const newBooking: Omit<Booking, 'id'> = {
        roomId: room.id,
        userId: currentUser.id,
        date: selectedDate,
        startTime,
        endTime,
        title,
      };
      // Simulate API call
      await new Promise(res => setTimeout(res, 500)); 
      const confirmedBooking: Booking = { ...newBooking, id: `mock-${Date.now()}`}; // Create a mock ID
      
      onBookingConfirmed(confirmedBooking); // Pass to parent to update state
      onClose();
    } catch (err) {
      setError('Failed to create booking. The slot might have been taken.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStartTime(e.target.value);
    // If current end time is before new start time, reset it
    if (endTime && e.target.value >= endTime) {
      setEndTime('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book Room: ${room.name} for ${new Date(selectedDate+'T00:00:00').toLocaleDateString()}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        
        <div>
          <label htmlFor="bookingTitle" className="block text-sm font-medium text-gray-700">Booking Title</label>
          <input
            type="text"
            id="bookingTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
            <select
              id="startTime"
              value={startTime}
              onChange={handleStartTimeChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              required
            >
              <option value="" disabled>Select start time</option>
              {availableStartTimes.map(slot => <option key={slot} value={slot}>{slot}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
            <select
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              required
              disabled={!startTime}
            >
              <option value="" disabled>Select end time</option>
              {availableEndTimes.map(slot => <option key={slot} value={slot}>{slot}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading || !startTime || !endTime || !title}>
            {isLoading ? <Spinner size="sm" color="text-white"/> : 'Confirm Booking'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
