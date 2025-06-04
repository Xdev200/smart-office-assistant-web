import { 
    User, 
    AttendanceRecord, 
    AttendanceStatusOption, 
    TransportMode, 
    ParkingSlot, 
    Room, 
    Booking,
    AdminDashboardData,
    UserRole,
    BookingConflictResolution,
    AVEquipment
} from '../types';
import { 
    MOCK_USERS, 
    MOCK_ROOMS, 
    MOCK_INITIAL_ATTENDANCE, 
    MOCK_PARKING_SLOTS, 
    MOCK_INITIAL_BOOKINGS 
} from '../constants';

// Simulate a database or persistent storage
let attendanceRecordsDB: AttendanceRecord[] = JSON.parse(JSON.stringify(MOCK_INITIAL_ATTENDANCE));
let parkingSlotsDB: ParkingSlot[] = JSON.parse(JSON.stringify(MOCK_PARKING_SLOTS));
let bookingsDB: Booking[] = JSON.parse(JSON.stringify(MOCK_INITIAL_BOOKINGS));
let roomsDB: Room[] = JSON.parse(JSON.stringify(MOCK_ROOMS)); 

const simulateDelay = (ms: number = Math.random() * 200 + 50) => new Promise(resolve => setTimeout(resolve, ms));

export const getAttendanceForUser = async (userId: string, date: string): Promise<AttendanceRecord | undefined> => {
  await simulateDelay();
  const record = attendanceRecordsDB.find(r => r.userId === userId && r.date === date);
  return record ? {...record} : undefined;
};

export const getAllUserAttendance = async (userId: string): Promise<AttendanceRecord[]> => {
  await simulateDelay();
  return attendanceRecordsDB.filter(r => r.userId === userId)
    .map(r => ({...r}))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const markAttendance = async (
  userId: string, 
  date: string, 
  status: AttendanceStatusOption, 
  transportMode?: TransportMode, 
  checkInTime?: string
): Promise<AttendanceRecord> => {
  await simulateDelay();
  let record = attendanceRecordsDB.find(r => r.userId === userId && r.date === date);
  if (record) {
    record.status = status;
    record.transportMode = status === AttendanceStatusOption.IN_OFFICE ? transportMode : undefined;
    if (status === AttendanceStatusOption.IN_OFFICE && checkInTime && !record.checkInTime) {
      record.checkInTime = checkInTime;
    }
     // If status changes away from In-Office, or to Not Marked, clear times
    if (status !== AttendanceStatusOption.IN_OFFICE || status === AttendanceStatusOption.NOT_MARKED) {
        record.checkInTime = undefined;
        record.checkOutTime = undefined;
        record.transportMode = undefined;
    }
    if (status === AttendanceStatusOption.ON_LEAVE || status === AttendanceStatusOption.WFH) {
      record.checkInTime = undefined; // WFH might have a different "start time" not covered by physical check-in
      record.checkOutTime = undefined;
      record.transportMode = undefined;
    }

  } else {
    record = { 
      id: `att${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, 
      userId, 
      date, 
      status, 
      transportMode: status === AttendanceStatusOption.IN_OFFICE ? transportMode : undefined,
      checkInTime: status === AttendanceStatusOption.IN_OFFICE && checkInTime ? checkInTime : undefined,
    };
    attendanceRecordsDB.push(record);
  }
  return { ...record };
};

export const checkOut = async (userId: string, date: string): Promise<AttendanceRecord | null> => {
  await simulateDelay();
  const record = attendanceRecordsDB.find(r => r.userId === userId && r.date === date && r.status === AttendanceStatusOption.IN_OFFICE && r.checkInTime && !r.checkOutTime);
  if (record) {
    record.checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return { ...record };
  }
  return null;
};

export const getParkingSlots = async (): Promise<ParkingSlot[]> => {
  await simulateDelay();
  // Simulate some random changes for "real-time" feel
  parkingSlotsDB.forEach(slot => {
    if (!slot.occupiedBy && Math.random() < 0.02) { // Small chance for an available slot to become occupied by "someone else"
      slot.isOccupied = true;
      slot.occupiedBy = `otherUser-${Date.now()}`;
    } else if (slot.isOccupied && slot.occupiedBy && slot.occupiedBy.startsWith('otherUser') && Math.random() < 0.03) { // Small chance for "someone else" to free a slot
      slot.isOccupied = false;
      slot.occupiedBy = undefined;
    }
  });
  return parkingSlotsDB.map(s => ({...s}));
};

export const getUserBookedSlot = async (userId: string): Promise<ParkingSlot | null> => {
  await simulateDelay();
  const slot = parkingSlotsDB.find(s => s.isOccupied && s.occupiedBy === userId);
  return slot ? { ...slot } : null;
};

export const bookParkingSlot = async (slotId: string, userId: string): Promise<{ success: boolean; message: string; slot?: ParkingSlot }> => {
  await simulateDelay();
  const userHasSlot = parkingSlotsDB.some(s => s.occupiedBy === userId);
  if (userHasSlot) {
    return { success: false, message: 'You already have a parking slot booked.' };
  }
  const slot = parkingSlotsDB.find(s => s.id === slotId);
  if (!slot) {
    return { success: false, message: 'Parking slot not found.' };
  }
  if (slot.isOccupied) {
    return { success: false, message: `Slot ${slot.bayNumber} is already occupied.` };
  }
  slot.isOccupied = true;
  slot.occupiedBy = userId;
  return { success: true, message: `Successfully booked slot ${slot.bayNumber}.`, slot: { ...slot } };
};

export const releaseParkingSlot = async (userId: string): Promise<{ success: boolean; message: string }> => {
  await simulateDelay();
  const slot = parkingSlotsDB.find(s => s.occupiedBy === userId);
  if (!slot) {
    return { success: false, message: 'No parking slot found booked by you.' };
  }
  slot.isOccupied = false;
  slot.occupiedBy = undefined;
  return { success: true, message: `Successfully released slot ${slot.bayNumber}.` };
};

export const getRooms = async (): Promise<Room[]> => {
  await simulateDelay();
  return roomsDB.map(r => ({...r}));
};

export const getBookingsForRoom = async (roomId: string, date: string): Promise<Booking[]> => {
  await simulateDelay();
  return bookingsDB.filter(b => b.roomId === roomId && b.date === date).map(b=>({...b})).sort((a,b) => a.startTime.localeCompare(b.startTime));
};

export const getBookingsForUser = async (userId: string): Promise<Booking[]> => {
    await simulateDelay();
    return bookingsDB.filter(b => b.userId === userId).map(b=>({...b})).sort((a,b) => {
        const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        return a.startTime.localeCompare(b.startTime);
    });
};

export const createBooking = async (bookingData: Omit<Booking, 'id'>): Promise<Booking> => {
  await simulateDelay();
  const conflict = bookingsDB.find(b => 
    b.roomId === bookingData.roomId &&
    b.date === bookingData.date &&
    !(bookingData.endTime <= b.startTime || bookingData.startTime >= b.endTime)
  );
  if (conflict) {
    throw new Error(`Booking conflict detected for room ${roomsDB.find(r => r.id === bookingData.roomId)?.name} on ${bookingData.date} between ${bookingData.startTime}-${bookingData.endTime}.`);
  }

  const newBooking: Booking = {
    ...bookingData,
    id: `book${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };
  bookingsDB.push(newBooking);
  return { ...newBooking };
};

export const cancelBooking = async (bookingId: string, userId: string): Promise<boolean> => {
  await simulateDelay();
  const bookingIndex = bookingsDB.findIndex(b => b.id === bookingId);
  if (bookingIndex === -1) return false;
  
  const booking = bookingsDB[bookingIndex];
  const currentUser = MOCK_USERS.find(u => u.id === userId);

  if (booking.userId === userId || currentUser?.role === UserRole.ADMIN) {
    bookingsDB.splice(bookingIndex, 1);
    return true;
  }
  return false;
};

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
    await simulateDelay(300);
    const today = new Date().toISOString().split('T')[0];

    const todaysAttendanceRecords = attendanceRecordsDB.filter(r => r.date === today);
    const attendanceSummary: AdminDashboardData['attendanceSummary'] = Object.values(AttendanceStatusOption)
        .map(status => ({
            status: status,
            count: todaysAttendanceRecords.filter(r => r.status === status).length,
        }));
        
    const occupiedSlotsCount = parkingSlotsDB.filter(s => s.isOccupied).length;
    const parkingUsage: AdminDashboardData['parkingUsage'] = {
        totalSlots: parkingSlotsDB.length,
        occupiedSlots: occupiedSlotsCount,
    };

    const todaysBookings = bookingsDB.filter(b => b.date === today);
    const roomOccupancyMap = new Map<string, { roomName: string, bookingsCount: number, hoursBooked: number }>();
    roomsDB.forEach(room => { // Initialize all rooms so they appear even if no bookings
        roomOccupancyMap.set(room.id, { roomName: room.name, bookingsCount: 0, hoursBooked: 0});
    });

    todaysBookings.forEach(booking => {
        const room = roomsDB.find(r => r.id === booking.roomId);
        if (!room) return;

        const current = roomOccupancyMap.get(booking.roomId)!; // Should exist due to prefill
        current.bookingsCount++;
        
        const start = new Date(`1970-01-01T${booking.startTime}:00Z`); // Use Z for UTC to avoid DST issues in calculation
        const end = new Date(`1970-01-01T${booking.endTime}:00Z`);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
            const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            current.hoursBooked += durationHours;
        }
        roomOccupancyMap.set(booking.roomId, current);
    });
    const roomOccupancy: AdminDashboardData['roomOccupancy'] = Array.from(roomOccupancyMap.entries()).map(([roomId, data]) => ({
        roomId,
        ...data
    }));

    const peakOfficeDays: AdminDashboardData['peakOfficeDays'] = [
        { day: 'Mon', attendanceCount: MOCK_INITIAL_ATTENDANCE.filter(r => r.status === AttendanceStatusOption.IN_OFFICE && new Date(r.date).getDay() === 1).length + Math.floor(Math.random()*3) },
        { day: 'Tue', attendanceCount: MOCK_INITIAL_ATTENDANCE.filter(r => r.status === AttendanceStatusOption.IN_OFFICE && new Date(r.date).getDay() === 2).length + Math.floor(Math.random()*5) },
        { day: 'Wed', attendanceCount: MOCK_INITIAL_ATTENDANCE.filter(r => r.status === AttendanceStatusOption.IN_OFFICE && new Date(r.date).getDay() === 3).length + Math.floor(Math.random()*5) },
        { day: 'Thu', attendanceCount: MOCK_INITIAL_ATTENDANCE.filter(r => r.status === AttendanceStatusOption.IN_OFFICE && new Date(r.date).getDay() === 4).length + Math.floor(Math.random()*4) },
        { day: 'Fri', attendanceCount: MOCK_INITIAL_ATTENDANCE.filter(r => r.status === AttendanceStatusOption.IN_OFFICE && new Date(r.date).getDay() === 5).length + Math.floor(Math.random()*2) },
    ];

    return {
        attendanceSummary,
        parkingUsage,
        roomOccupancy,
        peakOfficeDays
    };
};

export const resolveBookingConflictAI = async (conflictingBookingData: Omit<Booking, 'id'>, currentRoomId: string): Promise<BookingConflictResolution> => {
    await simulateDelay(300);
    
    // Try to find an alternative room
    const alternativeRoom = roomsDB.find(r => 
        r.id !== currentRoomId && 
        r.capacity >= (MOCK_ROOMS.find(mr => mr.id === currentRoomId)?.capacity || 0) && // Simple capacity check
        !bookingsDB.some(b => 
            b.roomId === r.id && 
            b.date === conflictingBookingData.date &&
            !(conflictingBookingData.endTime <= b.startTime || conflictingBookingData.startTime >= b.endTime)
        )
    );

    if (alternativeRoom) {
        const suggestedBooking: Booking = {
            ...conflictingBookingData,
            id: `sugg-${Date.now()}`,
            roomId: alternativeRoom.id,
            title: `${conflictingBookingData.title} (Alt. Room)`
        };
        return {
            resolved: true,
            message: `Room '${roomsDB.find(r=>r.id === currentRoomId)?.name}' is busy. Suggested '${alternativeRoom.name}' at the same time.`,
            suggestion: suggestedBooking
        };
    }

    // Try to find a later slot in the same room
    const originalStartHour = parseInt(conflictingBookingData.startTime.split(':')[0]);
    const originalStartMinutes = parseInt(conflictingBookingData.startTime.split(':')[1]);
    const originalEndHour = parseInt(conflictingBookingData.endTime.split(':')[0]);
    const originalEndMinutes = parseInt(conflictingBookingData.endTime.split(':')[1]);
    const durationMinutes = (originalEndHour * 60 + originalEndMinutes) - (originalStartHour * 60 + originalStartMinutes);

    for (let i = 1; i <= 3; i++) { // Check next 3 hours
        const suggestedStartTotalMinutes = (originalStartHour + i) * 60 + originalStartMinutes;
        const suggestedEndTotalMinutes = suggestedStartTotalMinutes + durationMinutes;
        
        const suggestedStartHour = Math.floor(suggestedStartTotalMinutes / 60);
        const suggestedStartMinute = suggestedStartTotalMinutes % 60;
        const suggestedEndHour = Math.floor(suggestedEndTotalMinutes / 60);
        const suggestedEndMinute = suggestedEndTotalMinutes % 60;

        if (suggestedEndHour > 18 || (suggestedEndHour === 18 && suggestedEndMinute > 0)) break; // Office closes (assumption)

        const suggestedStartTime = `${String(suggestedStartHour).padStart(2, '0')}:${String(suggestedStartMinute).padStart(2, '0')}`;
        const suggestedEndTime = `${String(suggestedEndHour).padStart(2, '0')}:${String(suggestedEndMinute).padStart(2, '0')}`;

        const slotIsFree = !bookingsDB.some(b => 
            b.roomId === currentRoomId && 
            b.date === conflictingBookingData.date &&
            !(suggestedEndTime <= b.startTime || suggestedStartTime >= b.endTime)
        );

        if (slotIsFree) {
            const suggestedBooking: Booking = {
                ...conflictingBookingData,
                id: `sugg-${Date.now()}`,
                roomId: currentRoomId, // Same room
                startTime: suggestedStartTime,
                endTime: suggestedEndTime,
                title: `${conflictingBookingData.title} (Later Slot)`
            };
            return {
                resolved: true,
                message: `Original slot is busy. Suggested a later slot in the same room at ${suggestedStartTime}.`,
                suggestion: suggestedBooking
            };
        }
    }

    return {
        resolved: false,
        message: 'Could not automatically resolve booking conflict. Please choose another time or room manually.',
    };
};

export const autoReleaseUnusedSlotsAI = async (): Promise<string[]> => {
    await simulateDelay(400);
    const releasedBookingIds: string[] = [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Example: Release bookings older than 1 hour ago today if they were short (e.g. 30 min) and by a specific user for demo
    const userToTarget = MOCK_USERS.find(u => u.role === UserRole.EMPLOYEE && u.name.includes("Bob")); // Bob The Builder
    if (userToTarget) {
        const bookingsToConsider = bookingsDB.filter(b => 
            b.userId === userToTarget.id &&
            b.date === today &&
            new Date(`${b.date}T${b.endTime}:00`) < now // Booking has ended
        );

        for (const booking of bookingsToConsider) {
            const start = new Date(`${booking.date}T${booking.startTime}:00`);
            const end = new Date(`${booking.date}T${booking.endTime}:00`);
            const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

            if (durationMinutes <= 30 && Math.random() < 0.7) { // 70% chance to release short, past bookings by Bob
                 const index = bookingsDB.findIndex(db => db.id === booking.id);
                 if (index !== -1) {
                    releasedBookingIds.push(booking.id);
                    bookingsDB.splice(index, 1);
                    break; // Release one for demo
                 }
            }
        }
    }
     // Example 2: Release any very old booking for demo cleanup (older than 2 days)
    if (Math.random() < 0.3) { // 30% chance to run this cleanup
        const twoDaysAgo = new Date(now.setDate(now.getDate() - 2)).toISOString().split('T')[0];
        const veryOldBookingIndex = bookingsDB.findIndex(b => b.date < twoDaysAgo);
        if (veryOldBookingIndex !== -1) {
            releasedBookingIds.push(bookingsDB[veryOldBookingIndex].id);
            bookingsDB.splice(veryOldBookingIndex, 1);
        }
    }

    return releasedBookingIds;
};
