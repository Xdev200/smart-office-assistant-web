
import React from 'react';
import { Booking, Room } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ClockIcon, TrashIcon, UsersIcon } from '../icons';
import { MOCK_USERS } from '../../constants'; // To display user names
import { useAuth } from '../../hooks/useAuth';

interface BookingCalendarProps {
  room: Room;
  selectedDate: string;
  bookings: Booking[];
  onNewBooking: () => void; // Callback to open booking form
  onCancelBooking: (bookingId: string) => Promise<boolean>;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ room, selectedDate, bookings, onNewBooking, onCancelBooking }) => {
  const { currentUser } = useAuth();

  const handleCancel = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
        const success = await onCancelBooking(bookingId);
        if (success) {
            alert("Booking cancelled successfully.");
        } else {
            alert("Failed to cancel booking. You might not be the owner or an error occurred.");
        }
    }
  };
  
  const dateFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Card title={`${room.name} - Bookings for ${dateFormatter.format(new Date(selectedDate + 'T00:00:00'))}`} className="mt-6">
      <div className="mb-4">
        <Button onClick={onNewBooking} variant="primary" size="sm">
          Book New Slot for this Room
        </Button>
      </div>
      {bookings.length === 0 ? (
        <p className="text-gray-600">No bookings for this room on {new Date(selectedDate+'T00:00:00').toLocaleDateString()}.</p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {bookings.map(booking => {
            const user = MOCK_USERS.find(u => u.id === booking.userId);
            const canCancel = currentUser && (currentUser.id === booking.userId || currentUser.role === 'admin');
            return (
            <div key={booking.id} className="p-3 bg-sky-50 rounded-lg shadow-sm border border-sky-200">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-semibold text-sky-700">{booking.title}</h5>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <ClockIcon className="w-4 h-4 mr-1 text-gray-500"/> 
                    {booking.startTime} - {booking.endTime}
                  </p>
                  {user && (
                    <p className="text-xs text-gray-500 flex items-center mt-0.5">
                      <UsersIcon className="w-3 h-3 mr-1 text-gray-400"/>
                      Booked by: {user.name}
                    </p>
                  )}
                </div>
                {canCancel && (
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleCancel(booking.id)}
                    title="Cancel Booking"
                    className="p-1.5"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )})}
        </div>
      )}
    </Card>
  );
};
