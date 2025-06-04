// types.ts

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export enum AttendanceStatusOption {
  IN_OFFICE = 'In-Office',
  WFH = 'Work From Home',
  ON_LEAVE = 'On Leave',
  NOT_MARKED = 'Not Marked',
}

export enum TransportMode {
  CAR = 'Car',
  MOTORBIKE = 'Motorbike',
  PUBLIC_TRANSPORT = 'Public Transport',
  CYCLE = 'Cycle',
  WALK = 'Walk',
  OTHER = 'Other',
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatusOption;
  transportMode?: TransportMode;
  checkInTime?: string; // HH:MM
  checkOutTime?: string; // HH:MM
}

export interface ParkingSlot {
  id: string;
  bayNumber: string;
  isOccupied: boolean;
  occupiedBy?: string; // userId
  vehicleType?: 'Car' | 'Motorbike';
}

export enum AVEquipment {
  PROJECTOR = 'Projector',
  VIDEO_CONFERENCE = 'Video Conference',
  WHITEBOARD = 'Whiteboard',
  SPEAKERS = 'Speakers',
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  avEquipment: AVEquipment[];
  imageUrl?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  title: string;
}

export interface RoomFilters {
  capacity: number;
  avEquipment: AVEquipment[];
  floor: number | null;
}

export interface AlertMessageType {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
}

// For Admin Dashboard
export interface AttendanceSummaryItem {
    status: AttendanceStatusOption;
    count: number;
}

export interface ParkingUsageSummary {
    totalSlots: number;
    occupiedSlots: number;
}

export interface RoomOccupancyItem {
    roomId: string;
    roomName: string;
    bookingsCount: number;
    hoursBooked: number; 
}

export interface PeakDayData {
    day: string; 
    attendanceCount: number;
}

export interface AdminDashboardData {
    attendanceSummary: AttendanceSummaryItem[];
    parkingUsage: ParkingUsageSummary;
    roomOccupancy: RoomOccupancyItem[];
    peakOfficeDays?: PeakDayData[];
}

export interface BookingConflictResolution {
    resolved: boolean;
    message: string;
    suggestion?: Booking;
}
