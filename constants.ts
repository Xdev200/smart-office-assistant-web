
import { User, UserRole, AttendanceRecord, AttendanceStatusOption, TransportMode, ParkingSlot, Room, AVEquipment, Booking } from './types';

export const APP_NAME = "Smart Office Assistant";

export const MOCK_USERS: User[] = [
  { id: 'user1', name: 'Alice Wonderland', role: UserRole.EMPLOYEE, email: 'alice@example.com' },
  { id: 'user2', name: 'Bob The Builder', role: UserRole.EMPLOYEE, email: 'bob@example.com' },
  { id: 'user3', name: 'Charlie Admin', role: UserRole.ADMIN, email: 'charlie@example.com' },
  { id: 'user4', name: 'Diana Prince', role: UserRole.EMPLOYEE, email: 'diana@example.com' },
];

export const MOCK_ROOMS: Room[] = [
  { id: 'room1', name: 'Innovation Hub', capacity: 10, floor: 1, avEquipment: [AVEquipment.PROJECTOR, AVEquipment.VIDEO_CONFERENCE, AVEquipment.WHITEBOARD], imageUrl: 'https://picsum.photos/seed/room1/400/200' },
  { id: 'room2', name: 'Synergy Space', capacity: 6, floor: 1, avEquipment: [AVEquipment.VIDEO_CONFERENCE, AVEquipment.SPEAKERS], imageUrl: 'https://picsum.photos/seed/room2/400/200' },
  { id: 'room3', name: 'Quiet Zone Alpha', capacity: 4, floor: 2, avEquipment: [AVEquipment.WHITEBOARD], imageUrl: 'https://picsum.photos/seed/room3/400/200' },
  { id: 'room4', name: 'Boardroom', capacity: 12, floor: 2, avEquipment: [AVEquipment.PROJECTOR, AVEquipment.VIDEO_CONFERENCE, AVEquipment.SPEAKERS, AVEquipment.WHITEBOARD], imageUrl: 'https://picsum.photos/seed/room4/400/200' },
  { id: 'room5', name: 'Team Huddle Spot', capacity: 8, floor: 1, avEquipment: [AVEquipment.WHITEBOARD, AVEquipment.PROJECTOR], imageUrl: 'https://picsum.photos/seed/room5/400/200' },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const MOCK_INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att1', userId: 'user1', date: today, status: AttendanceStatusOption.NOT_MARKED },
  { id: 'att2', userId: 'user2', date: today, status: AttendanceStatusOption.WFH, checkInTime: '09:00' },
  { id: 'att3', userId: 'user1', date: yesterday, status: AttendanceStatusOption.IN_OFFICE, transportMode: TransportMode.CAR, checkInTime: '09:30', checkOutTime: '17:30' },
  { id: 'att4', userId: 'user4', date: today, status: AttendanceStatusOption.ON_LEAVE },
];

export const MOCK_PARKING_SLOTS: ParkingSlot[] = Array.from({ length: 50 }, (_, i) => ({
  id: `slot${i + 1}`,
  bayNumber: `A-${String(i + 1).padStart(2, '0')}`,
  isOccupied: i < 15 ? Math.random() > 0.3 : false, // Roughly 30% occupied initially
  occupiedBy: i < 15 && Math.random() > 0.3 ? MOCK_USERS[Math.floor(Math.random()*MOCK_USERS.length)].id : undefined,
  vehicleType: Math.random() > 0.8 ? 'Motorbike' : 'Car',
}));

export const MOCK_INITIAL_BOOKINGS: Booking[] = [
  { id: 'book1', roomId: 'room1', userId: 'user1', date: today, startTime: '10:00', endTime: '11:00', title: 'Project Alpha Sync' },
  { id: 'book2', roomId: 'room2', userId: 'user2', date: today, startTime: '14:00', endTime: '15:30', title: 'Client Demo Prep' },
  { id: 'book3', roomId: 'room1', userId: 'user4', date: today, startTime: '11:30', endTime: '12:30', title: 'UX Review' },
  { id: 'book4', roomId: 'room4', userId: 'user1', date: yesterday, startTime: '09:00', endTime: '12:00', title: 'All Hands Meeting' },
];

export const CHATBOT_KNOWLEDGE_BASE: Record<string, string | { response: string; followUp?: string[] }> = {
  "hello": "Hello! How can I assist you with Smart Office today?",
  "hi": "Hi there! What can I do for you?",
  "how are you": "I'm doing well, ready to help streamline your workday!",
  "mark attendance": "You can mark your attendance on the 'My Attendance' page. Choose between WFH, In-Office, or On Leave.",
  "attendance": "For attendance, head to the 'My Attendance' section. You can specify your status and transport mode if you're in the office.",
  "parking": "To check parking availability, go to the 'Parking' section. You'll see real-time status of parking bays.",
  "book room": "Room booking is available under 'Book a Room'. You can filter by date, capacity, AV equipment, and floor.",
  "room booking": "Find and book meeting rooms in the 'Book a Room' section. Remember to check availability first!",
  "cancel booking": "You can cancel your room bookings from the 'Book a Room' page, usually under 'My Bookings' or by finding your booking on the calendar.",
  "admin dashboard": "The Admin Dashboard provides insights into attendance trends, parking usage, and room occupancy. It's accessible if you have admin privileges.",
  "default": "I'm still learning! Can you try rephrasing, or ask about attendance, parking, or room bookings?",
  "peak office days": {
    response: "Based on historical data, Tuesdays and Wednesdays are typically the busiest. We can predict this more accurately with more data!",
    followUp: ["Show attendance trends", "Suggest optimal room"]
  },
  "recommend room": {
    response: "For a quick huddle of 4-6 people, 'Synergy Space' is often available. For larger meetings with full AV, 'Boardroom' is a good choice. What are your needs?",
    followUp: ["Book 'Synergy Space'", "Check 'Boardroom' availability"]
  },
  "double booking": {
    response: "I can help resolve double bookings. If a conflict occurs, I can suggest alternative slots or rooms. This feature is under development.",
  },
  "bye": "Goodbye! Have a productive day!",
  "help": "I can help you with: \n- Marking Attendance \n- Viewing Parking Slots \n- Booking Meeting Rooms \n- Understanding Admin Dashboard features. \nWhat do you need help with?"
};

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17'; // Not used for API calls in this mock version, but good for reference
