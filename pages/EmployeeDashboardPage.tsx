import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AttendanceRecord, Room, Booking, UserRole, ParkingSlot, RoomFilters, AVEquipment } from '../types';
import { 
    getAttendanceForUser, 
    getAllUserAttendance, 
    getParkingSlots, 
    getRooms, 
    getBookingsForRoom, 
    createBooking as apiCreateBooking,
    cancelBooking as apiCancelBooking,
    resolveBookingConflictAI,
    autoReleaseUnusedSlotsAI,
} from '../services/mockApiService';

import { AttendanceForm } from '../components/attendance/AttendanceForm';
import { AttendanceStatus } from '../components/attendance/AttendanceStatus';
import { ParkingAvailability } from '../components/parking/ParkingAvailability';
import { RoomFilter } from '../components/booking/RoomFilter';
import { RoomCard } from '../components/booking/RoomCard';
import { BookingCalendar } from '../components/booking/BookingCalendar';
import { BookingForm } from '../components/booking/BookingForm';

import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import { DatePicker } from '../components/common/DatePicker';
import { Alert } from '../components/common/Alert';
import { Button } from '../components/common/Button';

import { CalendarIcon, CarIcon, BuildingIcon, BriefcaseIcon, PlusIcon } from '../components/icons';

type ActiveSection = 'attendance' | 'parking' | 'booking' | 'my_bookings';

const EmployeeDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>('attendance');
  
  // Attendance State
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [todaysAttendance, setTodaysAttendance] = useState<AttendanceRecord | null | undefined>(null); // null for loading, undefined for no record
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  // Parking State (ParkingAvailability handles its own state)

  // Room Booking State
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [roomFilters, setRoomFilters] = useState<RoomFilters>({ capacity: 0, avEquipment: [], floor: null });
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedRoomForCalendar, setSelectedRoomForCalendar] = useState<Room | null>(null);
  const [bookingsForSelectedRoom, setBookingsForSelectedRoom] = useState<Booking[]>([]);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [userBookingsLoading, setUserBookingsLoading] = useState(true);

  const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error' | 'info' | 'warning', text: string } | null>(null);


  // Fetch initial data
  const fetchAttendanceData = useCallback(async () => {
    if (!currentUser) return;
    setAttendanceLoading(true);
    try {
      const [todayData, historyData] = await Promise.all([
        getAttendanceForUser(currentUser.id, selectedAttendanceDate),
        getAllUserAttendance(currentUser.id)
      ]);
      setTodaysAttendance(todayData); // Can be undefined if no record exists
      setAttendanceHistory(historyData);
    } catch (error) {
      console.error("Failed to fetch attendance data", error);
      setGlobalMessage({type: 'error', text: 'Could not load attendance data.'});
    } finally {
      setAttendanceLoading(false);
    }
  }, [currentUser, selectedAttendanceDate]);

  const fetchRoomsData = useCallback(async () => {
    setRoomsLoading(true);
    try {
      const roomsData = await getRooms();
      setAllRooms(roomsData);
      setFilteredRooms(roomsData); // Initially show all rooms
    } catch (error) {
      console.error("Failed to fetch rooms data", error);
      setGlobalMessage({type: 'error', text: 'Could not load room data.'});
    } finally {
      setRoomsLoading(false);
    }
  }, []);
  
  const fetchUserBookings = useCallback(async () => {
    if (!currentUser) return;
    setUserBookingsLoading(true);
    try {
      const bookingsData = await (await import('../services/mockApiService')).getBookingsForUser(currentUser.id);
      setUserBookings(bookingsData);
    } catch (err) {
      console.error("Failed to fetch user bookings", err);
       setGlobalMessage({type: 'error', text: 'Could not load your bookings.'});
    } finally {
      setUserBookingsLoading(false);
    }
  }, [currentUser]);


  useEffect(() => {
    if (currentUser) {
      fetchAttendanceData();
      fetchRoomsData();
      fetchUserBookings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); 


  useEffect(() => { 
    if (currentUser) fetchAttendanceData();
  }, [selectedAttendanceDate, currentUser, fetchAttendanceData]);


  // Filter rooms logic
  useEffect(() => {
    let tempFilteredRooms = allRooms.filter(room => {
      const capacityMatch = roomFilters.capacity === 0 || room.capacity >= roomFilters.capacity;
      const avMatch = roomFilters.avEquipment.length === 0 || roomFilters.avEquipment.every(eq => room.avEquipment.includes(eq));
      const floorMatch = roomFilters.floor === null || room.floor === roomFilters.floor;
      return capacityMatch && avMatch && floorMatch;
    });
    setFilteredRooms(tempFilteredRooms);
  }, [allRooms, roomFilters]);

  const handleFilterChange = <K extends keyof RoomFilters,>(filterName: K, value: RoomFilters[K]) => {
    setRoomFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleSelectRoomForCalendar = async (roomId: string) => {
    const room = allRooms.find(r => r.id === roomId);
    if (room) {
      setSelectedRoomForCalendar(room);
      setRoomsLoading(true); 
      try {
        const roomBookings = await getBookingsForRoom(roomId, selectedBookingDate);
        setBookingsForSelectedRoom(roomBookings);
      } catch (error) {
        console.error("Failed to fetch bookings for room", error);
        setGlobalMessage({type: 'error', text: `Could not load bookings for ${room.name}.`});
      } finally {
        setRoomsLoading(false);
      }
    }
  };

  const handleBookingConfirmed = async (newBookingData: Omit<Booking, 'id'>) => {
    if (!currentUser || !selectedRoomForCalendar) return;
    setRoomsLoading(true);
    try {
        const existingConflict = bookingsForSelectedRoom.find(b => 
            (newBookingData.startTime >= b.startTime && newBookingData.startTime < b.endTime) ||
            (newBookingData.endTime > b.startTime && newBookingData.endTime <= b.endTime) ||
            (newBookingData.startTime <= b.startTime && newBookingData.endTime >= b.endTime)
        );

        if (existingConflict) {
            const resolution = await resolveBookingConflictAI(newBookingData, selectedRoomForCalendar.id);
            setGlobalMessage({type: resolution.resolved ? 'info' : 'warning', text: resolution.message});
            if (resolution.resolved && resolution.suggestion) {
                const suggestedBookingData: Omit<Booking, 'id'> = {
                    roomId: resolution.suggestion.roomId,
                    userId: resolution.suggestion.userId, // Should be currentUser.id
                    date: resolution.suggestion.date,
                    startTime: resolution.suggestion.startTime,
                    endTime: resolution.suggestion.endTime,
                    title: resolution.suggestion.title,
                };
                const confirmedBooking = await apiCreateBooking(suggestedBookingData);
                // If suggestion is for a different room, don't add to current selectedRoomForCalendar.bookingsForSelectedRoom
                // but do refresh user bookings. If it's for the same room, add it.
                if (confirmedBooking.roomId === selectedRoomForCalendar.id) {
                    setBookingsForSelectedRoom(prev => [...prev, confirmedBooking].sort((a,b) => a.startTime.localeCompare(b.startTime)));
                }
                setGlobalMessage({type: 'success', text: `Booking confirmed for ${resolution.suggestion.startTime} in ${allRooms.find(r => r.id === confirmedBooking.roomId)?.name || 'room'}!`});

            } else if (!resolution.resolved) {
                 setGlobalMessage({type: 'warning', text: `${resolution.message} Original booking not made.`});
                 setIsBookingFormOpen(false); // Close form as AI couldn't resolve
                 return; 
            }
        } else { 
             const confirmedBooking = await apiCreateBooking(newBookingData);
             setBookingsForSelectedRoom(prev => [...prev, confirmedBooking].sort((a,b) => a.startTime.localeCompare(b.startTime)));
             setGlobalMessage({type: 'success', text: 'Booking confirmed successfully!'});
        }
        setIsBookingFormOpen(false);
        fetchUserBookings(); 
    } catch (error) {
        console.error("Failed to confirm booking", error);
        let errorMessage = 'Failed to save booking.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        setGlobalMessage({type: 'error', text: errorMessage});
    } finally {
        setRoomsLoading(false);
    }
};

  const handleCancelBooking = async (bookingId: string): Promise<boolean> => {
    if (!currentUser) return false;
    setRoomsLoading(true);
    try {
      const success = await apiCancelBooking(bookingId, currentUser.id);
      if (success) {
        setBookingsForSelectedRoom(prev => prev.filter(b => b.id !== bookingId));
        setUserBookings(prev => prev.filter(b => b.id !== bookingId)); 
        setGlobalMessage({type: 'success', text: 'Booking cancelled.'});
        return true;
      } else {
        setGlobalMessage({type: 'error', text: 'Failed to cancel booking. You may not be the owner or an Admin.'});
        return false;
      }
    } catch(error) {
      console.error("Error cancelling booking", error);
      setGlobalMessage({type: 'error', text: 'An error occurred while cancelling.'});
      return false;
    } finally {
      setRoomsLoading(false);
    }
  };
  
  const simulateAutoRelease = async () => {
    setGlobalMessage({type: 'info', text: "AI is checking for unused slots..."});
    setIsLoading(true);
    const releasedIds = await autoReleaseUnusedSlotsAI();
    if (releasedIds.length > 0) {
        setGlobalMessage({type: 'success', text: `AI auto-released ${releasedIds.length} unused booking(s).`});
        // Refresh relevant data
        if (selectedRoomForCalendar) { 
            handleSelectRoomForCalendar(selectedRoomForCalendar.id);
        }
        fetchUserBookings();
    } else {
        setGlobalMessage({type: 'info', text: "No unused slots found by AI for auto-release at this time."});
    }
    setIsLoading(false);
  };


  if (!currentUser) {
    return <div className="p-8 text-center"><Spinner size="lg" /> <p className="mt-2">Loading user data...</p></div>;
  }

  const availableFloors = [...new Set(allRooms.map(r => r.floor))].sort((a,b) => a-b);

  const sectionButtonClass = (sectionName: ActiveSection) => 
    `flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-150 ease-in-out hover:bg-sky-100 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1`;
  const activeSectionButtonClass = "bg-sky-600 text-white hover:bg-sky-700";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Employee Dashboard</h1>
          <p className="text-gray-600">Manage your office day efficiently, {currentUser.name}.</p>
        </header>

        {globalMessage && (
            <div className="my-4">
                <Alert type={globalMessage.type} message={globalMessage.text} onClose={() => setGlobalMessage(null)} />
            </div>
        )}

        <div className="mb-8 bg-white shadow-md rounded-lg p-3 flex flex-wrap gap-2 items-center">
          <button onClick={() => {setActiveSection('attendance'); setSelectedRoomForCalendar(null);}} className={`${sectionButtonClass('attendance')} ${activeSection === 'attendance' ? activeSectionButtonClass : 'text-gray-600'}`}>
            <BriefcaseIcon className="w-5 h-5"/><span>My Attendance</span>
          </button>
          <button onClick={() => {setActiveSection('parking'); setSelectedRoomForCalendar(null);}} className={`${sectionButtonClass('parking')} ${activeSection === 'parking' ? activeSectionButtonClass : 'text-gray-600'}`}>
            <CarIcon className="w-5 h-5"/><span>Parking</span>
          </button>
          <button onClick={() => {setActiveSection('booking'); setSelectedRoomForCalendar(null);}} className={`${sectionButtonClass('booking')} ${activeSection === 'booking' ? activeSectionButtonClass : 'text-gray-600'}`}>
            <BuildingIcon className="w-5 h-5"/><span>Book a Room</span>
          </button>
           <button onClick={() => {setActiveSection('my_bookings'); setSelectedRoomForCalendar(null);}} className={`${sectionButtonClass('my_bookings')} ${activeSection === 'my_bookings' ? activeSectionButtonClass : 'text-gray-600'}`}>
            <CalendarIcon className="w-5 h-5"/><span>My Bookings</span>
          </button>
          <Button onClick={simulateAutoRelease} variant="ghost" size="sm" className="ml-auto !text-xs text-sky-600 border border-sky-200 hover:bg-sky-50" disabled={roomsLoading}>
            {roomsLoading ? <Spinner size="sm" /> : "Simulate AI Slot Release"}
          </Button>
        </div>

        <div className="space-y-8">
          {activeSection === 'attendance' && (
            <section id="attendance">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                  <div className="mb-4">
                    <DatePicker
                        label="Select Date for Attendance:"
                        value={selectedAttendanceDate}
                        onChange={(e) => setSelectedAttendanceDate(e.target.value)}
                        // max={new Date().toISOString().split('T')[0]} // Allow future leave marking? For now, only past/today
                    />
                  </div>
                  {attendanceLoading ? <div className="flex justify-center p-8"><Spinner/></div> : 
                    <AttendanceForm 
                        currentAttendance={todaysAttendance} 
                        onAttendanceUpdate={(updatedRecord) => {
                            setTodaysAttendance(updatedRecord);
                            if (updatedRecord.date === selectedAttendanceDate) {
                                setTodaysAttendance(updatedRecord);
                            }
                            setAttendanceHistory(prev => {
                                const index = prev.findIndex(ar => ar.id === updatedRecord.id);
                                if (index !== -1) {
                                    const newHistory = [...prev];
                                    newHistory[index] = updatedRecord;
                                    return newHistory;
                                }
                                return [updatedRecord, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                            });
                        }}
                        selectedDate={selectedAttendanceDate}
                    />
                  }
                </div>
                <div>
                  <AttendanceStatus todaysAttendance={todaysAttendance} attendanceHistory={attendanceHistory} />
                </div>
              </div>
            </section>
          )}

          {activeSection === 'parking' && (
            <section id="parking">
              <ParkingAvailability />
            </section>
          )}

          {activeSection === 'booking' && !selectedRoomForCalendar && (
            <section id="booking-list">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Available Rooms</h2>
                    <DatePicker 
                        containerClassName="w-full sm:w-auto"
                        value={selectedBookingDate} 
                        onChange={(e) => {
                          setSelectedBookingDate(e.target.value);
                          if(selectedRoomForCalendar) { // If a room was selected, refresh its bookings for new date
                            handleSelectRoomForCalendar(selectedRoomForCalendar.id);
                          }
                        }}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>
                <RoomFilter filters={roomFilters} onFilterChange={handleFilterChange} availableFloors={availableFloors}/>
                {roomsLoading ? <div className="flex justify-center p-8"><Spinner size="lg"/></div> : 
                    filteredRooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRooms.map(room => (
                        <RoomCard key={room.id} room={room} onBookRoom={() => handleSelectRoomForCalendar(room.id)} />
                        ))}
                    </div>
                    ) : <p className="text-center text-gray-600 py-8">No rooms match your criteria for {new Date(selectedBookingDate+'T00:00:00').toLocaleDateString()}.</p>
                }
            </section>
          )}
          
          {activeSection === 'booking' && selectedRoomForCalendar && (
            <section id="booking-calendar">
                <Button onClick={() => setSelectedRoomForCalendar(null)} variant="secondary" size="sm" className="mb-4">
                    &larr; Back to All Rooms
                </Button>
                {roomsLoading && !bookingsForSelectedRoom.length ? <div className="flex justify-center p-8"><Spinner/></div> :
                    <BookingCalendar 
                        room={selectedRoomForCalendar} 
                        selectedDate={selectedBookingDate}
                        bookings={bookingsForSelectedRoom}
                        onNewBooking={() => setIsBookingFormOpen(true)}
                        onCancelBooking={handleCancelBooking}
                    />
                }
            </section>
          )}

          {activeSection === 'my_bookings' && (
            <section id="my-bookings">
                <Card title="My Bookings">
                    {userBookingsLoading ? <div className="flex justify-center p-8"><Spinner/></div> : 
                        userBookings.length === 0 ? <p className="text-gray-600">You have no bookings.</p> : (
                            <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                {userBookings.filter(b => new Date(b.date + 'T' + b.endTime) >= new Date(new Date().toISOString().split('T')[0])).length === 0 && 
                                  userBookings.length > 0 && 
                                  <p className="text-gray-500 mb-3 text-sm">You have no upcoming bookings. Showing past bookings.</p>
                                }
                                {userBookings.sort((a,b) => {
                                     const dateA = new Date(a.date + 'T' + a.startTime).getTime();
                                     const dateB = new Date(b.date + 'T' + b.startTime).getTime();
                                     return dateA - dateB;
                                }) 
                                .map(booking => {
                                    const room = allRooms.find(r => r.id === booking.roomId);
                                    const isPast = new Date(booking.date + 'T' + booking.endTime) < new Date();
                                    return (
                                    <li key={booking.id} className={`p-4 bg-white rounded-lg shadow border ${isPast ? 'opacity-70 border-gray-200' : 'border-sky-200'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-sky-700">{booking.title}</h4>
                                                <p className="text-sm text-gray-600">Room: {room?.name || 'Unknown Room'}</p>
                                                <p className="text-sm text-gray-600">Date: {new Date(booking.date+'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                                <p className="text-sm text-gray-600">Time: {booking.startTime} - {booking.endTime}</p>
                                                {isPast && <p className="text-xs text-red-500 mt-1">This booking is in the past.</p>}
                                            </div>
                                            {!isPast && <Button variant="danger" size="sm" onClick={() => handleCancelBooking(booking.id)}>Cancel</Button>}
                                        </div>
                                    </li>
                                    );
                                })}
                            </ul>
                        )
                    }
                </Card>
            </section>
          )}

        </div>
      </div>

      {selectedRoomForCalendar && isBookingFormOpen && (
        <BookingForm 
            isOpen={isBookingFormOpen}
            onClose={() => setIsBookingFormOpen(false)}
            room={selectedRoomForCalendar}
            selectedDate={selectedBookingDate}
            existingBookings={bookingsForSelectedRoom}
            onBookingConfirmed={(newBookingData) => handleBookingConfirmed(newBookingData as Omit<Booking, 'id'>)}
        />
      )}
    </div>
  );
};

export default EmployeeDashboardPage;
