
import React, { useState, useEffect, useCallback } from 'react';
import { ParkingSlot, AlertMessageType } from '../../types';
import { getParkingSlots, bookParkingSlot, releaseParkingSlot, getUserBookedSlot } from '../../services/mockApiService';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { CarIcon } from '../icons';

interface ParkingSlotTileProps {
  slot: ParkingSlot;
  isCurrentUserSlot: boolean;
  canBookThisSlot: boolean; // True if slot is available AND current user has no slot booked
  onSlotClick: (slot: ParkingSlot) => void;
}

const ParkingSlotTile: React.FC<ParkingSlotTileProps> = ({ slot, isCurrentUserSlot, canBookThisSlot, onSlotClick }) => {
  let tileColor = 'bg-gray-300'; // Default for occupied by others or unbookable
  let textColor = 'text-gray-700';
  let hoverEffect = '';
  let cursor = 'cursor-default';

  if (isCurrentUserSlot) {
    tileColor = 'bg-sky-500 hover:bg-sky-600'; // User's booked slot
    textColor = 'text-white';
  } else if (!slot.isOccupied) {
    if (canBookThisSlot) {
      tileColor = 'bg-green-400 hover:bg-green-500';
      textColor = 'text-green-800 hover:text-green-900';
      hoverEffect = 'transition-colors';
      cursor = 'cursor-pointer';
    } else { // Available but user already has a slot or some other reason
      tileColor = 'bg-green-200'; // Dimmed available
      textColor = 'text-green-600';
    }
  } else { // Occupied by someone else
    tileColor = 'bg-red-400';
    textColor = 'text-red-800';
  }

  return (
    <button
      onClick={() => (canBookThisSlot && !slot.isOccupied) ? onSlotClick(slot) : undefined}
      disabled={!canBookThisSlot && !isCurrentUserSlot && slot.isOccupied}
      className={`p-2 rounded-md shadow-sm text-center ${tileColor} ${hoverEffect} ${cursor} w-full h-full flex flex-col justify-center items-center aspect-square`}
      aria-label={`Parking slot ${slot.bayNumber}. ${isCurrentUserSlot ? 'This is your slot.' : slot.isOccupied ? 'Occupied.' : canBookThisSlot ? 'Available, click to book.' : 'Available.'}`}
    >
      <div className={`text-xs font-semibold ${textColor}`}>{slot.bayNumber}</div>
      <CarIcon className={`w-5 h-5 mx-auto mt-1 ${isCurrentUserSlot ? 'text-sky-100' : slot.isOccupied ? 'text-red-100' : 'text-green-100'}`} />
      {isCurrentUserSlot && <div className="text-xs mt-0.5 text-sky-100">My Slot</div>}
    </button>
  );
};

export const ParkingAvailability: React.FC = () => {
  const { currentUser } = useAuth();
  const [slots, setSlots] = useState<ParkingSlot[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userBookedSlot, setUserBookedSlot] = useState<ParkingSlot | null>(null);
  const [slotToConfirmBooking, setSlotToConfirmBooking] = useState<ParkingSlot | null>(null);
  const [successModalMessage, setSuccessModalMessage] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<AlertMessageType | null>(null);

  const fetchParkingData = useCallback(async () => {
    if (!currentUser) return;
    // setIsLoading(true); // Keep true if slots is null, otherwise background refresh
    try {
      const [slotsData, bookedSlotData] = await Promise.all([
        getParkingSlots(),
        getUserBookedSlot(currentUser.id)
      ]);
      setSlots(slotsData);
      setUserBookedSlot(bookedSlotData);
    } catch (err) {
      setAlertMessage({ type: 'error', text: 'Failed to fetch parking data.' });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchParkingData();
    const intervalId = setInterval(fetchParkingData, 10000); // Refresh every 10 seconds
    return () => clearInterval(intervalId);
  }, [fetchParkingData]);

  const handleSlotClick = (slot: ParkingSlot) => {
    setAlertMessage(null);
    if (!currentUser) return;

    if (userBookedSlot) {
      setAlertMessage({ type: 'info', text: `You already have slot ${userBookedSlot.bayNumber} booked. Release it first to book another.` });
      return;
    }
    if (slot.isOccupied) {
      setAlertMessage({ type: 'info', text: `Slot ${slot.bayNumber} is already occupied.` });
      return;
    }
    setSlotToConfirmBooking(slot);
  };

  const confirmSlotBooking = async () => {
    if (!slotToConfirmBooking || !currentUser) return;
    setIsLoading(true);
    setAlertMessage(null);
    const result = await bookParkingSlot(slotToConfirmBooking.id, currentUser.id);
    if (result.success && result.slot) {
      setUserBookedSlot(result.slot);
      setSuccessModalMessage(result.message);
      await fetchParkingData(); // Refresh all slots
    } else {
      setAlertMessage({ type: 'error', text: result.message });
    }
    setSlotToConfirmBooking(null);
    setIsLoading(false);
  };

  const handleReleaseSlot = async () => {
    if (!userBookedSlot || !currentUser) return;
    setIsLoading(true);
    setAlertMessage(null);
    const result = await releaseParkingSlot(currentUser.id);
    if (result.success) {
      setUserBookedSlot(null);
      setAlertMessage({ type: 'success', text: result.message });
      await fetchParkingData(); // Refresh all slots
    } else {
      setAlertMessage({ type: 'error', text: result.message });
    }
    setIsLoading(false);
  };

  if (isLoading && slots === null) {
    return <div className="flex justify-center items-center p-8"><Spinner size="lg" /></div>;
  }

  const availableSlotsCount = slots?.filter(s => !s.isOccupied).length || 0;
  const totalSlotsCount = slots?.length || 0;
  const occupancyPercentage = totalSlotsCount > 0 ? ((totalSlotsCount - availableSlotsCount) / totalSlotsCount) * 100 : 0;

  return (
    <Card title="Real-Time Parking Availability" className="w-full">
      {alertMessage && (
        <div className="mb-4">
          <Alert type={alertMessage.type} message={alertMessage.text} onClose={() => setAlertMessage(null)} />
        </div>
      )}

      {userBookedSlot && (
        <Card title="My Booked Slot" className="mb-6 bg-sky-50 border-sky-200">
          <div className="flex flex-col sm:flex-row justify-between items-center p-2">
            <p className="text-lg font-semibold text-sky-700">
              You have booked slot: <span className="text-xl">{userBookedSlot.bayNumber}</span>
            </p>
            <Button variant="danger" size="sm" onClick={handleReleaseSlot} disabled={isLoading}>
              {isLoading ? <Spinner size="sm"/> : 'Release My Slot'}
            </Button>
          </div>
        </Card>
      )}

      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-around items-center text-center gap-4 sm:gap-0">
            <div>
                <p className="text-3xl font-bold text-green-600">{availableSlotsCount}</p>
                <p className="text-sm text-gray-600">Available Slots</p>
            </div>
            <div>
                <p className="text-3xl font-bold text-gray-700">{totalSlotsCount}</p>
                <p className="text-sm text-gray-600">Total Slots</p>
            </div>
            <div>
                <p className="text-3xl font-bold text-red-600">{occupancyPercentage.toFixed(0)}%</p>
                <p className="text-sm text-gray-600">Occupancy</p>
            </div>
        </div>
        {totalSlotsCount > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${occupancyPercentage}%` }}></div>
            </div>
        )}
      </div>
      
      {slots && slots.length > 0 ? (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {slots.slice(0, 60).map(slot => (
            <ParkingSlotTile 
              key={slot.id} 
              slot={slot} 
              isCurrentUserSlot={userBookedSlot?.id === slot.id}
              canBookThisSlot={!slot.isOccupied && !userBookedSlot}
              onSlotClick={handleSlotClick}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center py-4">No parking information available or loading data.</p>
      )}
      {slots && slots.length > 60 && <p className="text-xs text-gray-500 mt-4 text-center">Showing 60 of {totalSlotsCount} slots.</p>}

      {slotToConfirmBooking && (
        <Modal
          isOpen={!!slotToConfirmBooking}
          onClose={() => setSlotToConfirmBooking(null)}
          title={`Confirm Booking for Slot ${slotToConfirmBooking.bayNumber}`}
        >
          <p className="text-gray-700 mb-6">Are you sure you want to book parking slot {slotToConfirmBooking.bayNumber}?</p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setSlotToConfirmBooking(null)} disabled={isLoading}>Cancel</Button>
            <Button variant="primary" onClick={confirmSlotBooking} disabled={isLoading}>
              {isLoading ? <Spinner size="sm" color="text-white"/> : 'Confirm'}
            </Button>
          </div>
        </Modal>
      )}

      {successModalMessage && (
         <Modal
            isOpen={!!successModalMessage}
            onClose={() => setSuccessModalMessage(null)}
            title="Booking Successful!"
        >
            <p className="text-gray-700 mb-6">{successModalMessage}</p>
            <div className="flex justify-end">
                <Button variant="primary" onClick={() => setSuccessModalMessage(null)}>OK</Button>
            </div>
        </Modal>
      )}
    </Card>
  );
};
