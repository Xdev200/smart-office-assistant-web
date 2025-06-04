
import React from 'react';
import { AttendanceRecord, AttendanceStatusOption, TransportMode } from '../../types';
import { Card } from '../common/Card';
import { CalendarIcon, CarIcon, BriefcaseIcon, ClockIcon } from '../icons';

interface AttendanceStatusProps {
  todaysAttendance: AttendanceRecord | undefined | null;
  attendanceHistory: AttendanceRecord[];
}

const StatusBadge: React.FC<{ status: AttendanceStatusOption }> = ({ status }) => {
  let bgColor = 'bg-gray-200 text-gray-700';
  if (status === AttendanceStatusOption.IN_OFFICE) bgColor = 'bg-green-100 text-green-700';
  else if (status === AttendanceStatusOption.WFH) bgColor = 'bg-blue-100 text-blue-700';
  else if (status === AttendanceStatusOption.ON_LEAVE) bgColor = 'bg-yellow-100 text-yellow-700';
  
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor}`}>{status}</span>;
};

const TransportIcon: React.FC<{ mode?: TransportMode}> = ({ mode }) => {
    if (!mode) return null;
    // This can be expanded with more icons
    if (mode === TransportMode.CAR || mode === TransportMode.MOTORBIKE) return <CarIcon className="w-4 h-4 text-gray-500 inline-block mr-1" />;
    return <BriefcaseIcon className="w-4 h-4 text-gray-500 inline-block mr-1" />;
}

export const AttendanceStatus: React.FC<AttendanceStatusProps> = ({ todaysAttendance, attendanceHistory }) => {
  return (
    <div className="space-y-6">
      {todaysAttendance && todaysAttendance.status !== AttendanceStatusOption.NOT_MARKED && (
        <Card title="Today's Status" className="bg-sky-50">
          <div className="flex items-center space-x-4">
            <StatusBadge status={todaysAttendance.status} />
            {todaysAttendance.status === AttendanceStatusOption.IN_OFFICE && todaysAttendance.transportMode && (
              <span className="text-sm text-gray-600 flex items-center">
                <TransportIcon mode={todaysAttendance.transportMode}/> {todaysAttendance.transportMode}
              </span>
            )}
             {todaysAttendance.checkInTime && (
              <span className="text-sm text-gray-600 flex items-center">
                <ClockIcon className="w-4 h-4 mr-1"/> In: {todaysAttendance.checkInTime}
              </span>
            )}
            {todaysAttendance.checkOutTime && (
              <span className="text-sm text-gray-600 flex items-center">
                <ClockIcon className="w-4 h-4 mr-1"/> Out: {todaysAttendance.checkOutTime}
              </span>
            )}
          </div>
        </Card>
      )}

      <Card title="Recent Attendance History">
        {attendanceHistory.length === 0 ? (
          <p className="text-gray-600">No attendance history found.</p>
        ) : (
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {attendanceHistory.map(record => (
              <li key={record.id} className="p-3 bg-gray-50 rounded-md shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CalendarIcon className="w-5 h-5 text-sky-600 mr-2" />
                    <span className="font-medium text-gray-700">{new Date(record.date + 'T00:00:00').toLocaleDateString()}</span>
                  </div>
                  <StatusBadge status={record.status} />
                </div>
                {(record.status === AttendanceStatusOption.IN_OFFICE || record.checkInTime) && (
                    <div className="text-xs text-gray-500 mt-1 ml-7 space-x-2">
                        {record.status === AttendanceStatusOption.IN_OFFICE && record.transportMode && (
                            <span>Transport: {record.transportMode}</span>
                        )}
                        {record.checkInTime && <span>In: {record.checkInTime}</span>}
                        {record.checkOutTime && <span>Out: {record.checkOutTime}</span>}
                    </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};
