
import React, { useState, useEffect, useCallback } from 'react';
import { AttendanceStatusOption, TransportMode, AttendanceRecord } from '../../types';
import { markAttendance, checkOut } from '../../services/mockApiService';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Alert } from '../common/Alert';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';
import { LocationMarkerIcon, QrCodeIcon, WifiIcon, ClockIcon, BriefcaseIcon } from '../icons';
import { WifiCheckinModal } from './WifiCheckinModal';
import { QrCodeCheckinModal } from './QrCodeCheckinModal';


interface AttendanceFormProps {
  currentAttendance: AttendanceRecord | undefined | null; // null means loading, undefined means no record yet
  onAttendanceUpdate: (record: AttendanceRecord) => void;
  selectedDate: string;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({ currentAttendance, onAttendanceUpdate, selectedDate }) => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<AttendanceStatusOption>(AttendanceStatusOption.NOT_MARKED);
  const [transportMode, setTransportMode] = useState<TransportMode | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; text: string } | null>(null);

  const [isWifiModalOpen, setIsWifiModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [gpsCheckinState, setGpsCheckinState] = useState<'idle' | 'requesting' | 'acquiring' | 'denied'>('idle');


  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (currentAttendance) {
      setStatus(currentAttendance.status);
      setTransportMode(currentAttendance.transportMode);
    } else if (currentAttendance === undefined) { // No record yet, default to Not Marked
      setStatus(AttendanceStatusOption.NOT_MARKED);
      setTransportMode(undefined);
    }
    // if currentAttendance is null, it means it's loading, so don't change status
  }, [currentAttendance]);

  const performActualCheckIn = useCallback(async (method: string, checkInMessage: string) => {
    if (!currentUser) return;
    setIsLoading(true); // General loading for the form submission part
    setMessage(null);
    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    try {
      const updatedRecord = await markAttendance(currentUser.id, selectedDate, AttendanceStatusOption.IN_OFFICE, transportMode, checkInTime);
      setStatus(AttendanceStatusOption.IN_OFFICE);
      onAttendanceUpdate(updatedRecord);
      setMessage({ type: 'success', text: `${checkInMessage} Checked in via ${method} at ${checkInTime}!` });
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to auto check-in via ${method}.` });
      console.error(error);
    } finally {
      setIsLoading(false);
      setGpsCheckinState('idle');
    }
  }, [currentUser, selectedDate, transportMode, onAttendanceUpdate]);


  const handleManualSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    setMessage(null);
    try {
      // If marking as "In Office" without auto-checkin, don't pass checkInTime, let backend decide or prompt
      const explicitCheckInTime = status === AttendanceStatusOption.IN_OFFICE && !currentAttendance?.checkInTime ? 
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) 
        : undefined;

      const updatedRecord = await markAttendance(currentUser.id, selectedDate, status, transportMode, explicitCheckInTime);
      onAttendanceUpdate(updatedRecord);
      setMessage({ type: 'success', text: 'Attendance updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update attendance.' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWifiCheckin = () => setIsWifiModalOpen(true);
  const handleQrCheckin = () => setIsQrModalOpen(true);

  const handleLocationCheckin = () => {
    setGpsCheckinState('requesting');
    setMessage({type: 'info', text: 'Requesting location permission... (Simulated)'});
    // Simulate browser permission dialog
    setTimeout(() => {
        if (window.confirm("SmartOffice would like to use your current location for check-in. Allow? (This is a simulation)")) {
            setGpsCheckinState('acquiring');
            setMessage({type: 'info', text: 'Acquiring location... (Simulated)'});
            setTimeout(() => {
                performActualCheckIn('Location', 'Location acquired!');
            }, 2000);
        } else {
            setGpsCheckinState('denied');
            setMessage({ type: 'warning', text: 'Location access denied by user. Cannot check-in using GPS.' });
        }
    }, 500); // Short delay to "show" the request
  };
  
  const handleCheckOut = async () => {
    if (!currentUser || !currentAttendance || currentAttendance.status !== AttendanceStatusOption.IN_OFFICE) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const updatedRecord = await checkOut(currentUser.id, selectedDate);
      if (updatedRecord) {
        onAttendanceUpdate(updatedRecord);
        setMessage({ type: 'success', text: `Successfully checked out at ${updatedRecord.checkOutTime}!` });
      } else {
        setMessage({ type: 'error', text: 'Could not check out. Are you checked in?' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to check out.' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  if (currentAttendance === null) { // Loading state for current attendance data
    return <div className="flex justify-center items-center p-8"><Spinner /></div>;
  }

  const attendanceOptions = Object.values(AttendanceStatusOption)
    .filter(opt => opt !== AttendanceStatusOption.NOT_MARKED) 
    .map(s => ({ value: s as string, label: s as string }));
  
  const transportOptions = Object.values(TransportMode).map(t => ({ value: t as string, label: t as string }));

  const canCheckOut = isToday && currentAttendance?.status === AttendanceStatusOption.IN_OFFICE && currentAttendance?.checkInTime && !currentAttendance?.checkOutTime;
  const canAutoCheckIn = isToday && status === AttendanceStatusOption.IN_OFFICE && !currentAttendance?.checkInTime;

  return (
    <>
      <Card title={`Mark Attendance for ${new Date(selectedDate + 'T00:00:00').toLocaleDateString()}`} className="max-w-lg mx-auto">
        {message && <div className="mb-4"><Alert type={message.type} message={message.text} onClose={() => setMessage(null)} /></div>}
        
        {gpsCheckinState === 'acquiring' && (
             <div className="flex items-center justify-center p-4 my-2 bg-sky-50 rounded-md">
                <Spinner size="sm" color="text-sky-600" />
                <p className="ml-2 text-sky-700">Acquiring location...</p>
            </div>
        )}

        <form onSubmit={handleManualSubmit} className="space-y-6">
          <div>
            <Select
              label="My Status:"
              id="attendanceStatus"
              options={attendanceOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendanceStatusOption)}
              disabled={isLoading || !isToday || gpsCheckinState === 'acquiring'}
            />
          </div>

          {status === AttendanceStatusOption.IN_OFFICE && (
            <div className="space-y-4">
              <Select
                label="Mode of Transport:"
                id="transportMode"
                options={transportOptions}
                value={transportMode || ''}
                onChange={(e) => setTransportMode(e.target.value as TransportMode)}
                disabled={isLoading || !isToday || gpsCheckinState === 'acquiring'}
                placeholder="Select transport mode"
              />
              {canAutoCheckIn && (
                   <Card title="Auto Check-in (Simulated)" bodyClassName="p-3" titleClassName="p-3 text-md">
                      <p className="text-sm text-gray-600 mb-3">Use a simulated method to automatically check-in.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Button type="button" variant="secondary" size="sm" onClick={handleLocationCheckin} disabled={isLoading || gpsCheckinState === 'acquiring'} leftIcon={<LocationMarkerIcon className="w-4 h-4"/>}>Location</Button>
                          <Button type="button" variant="secondary" size="sm" onClick={handleQrCheckin} disabled={isLoading || gpsCheckinState === 'acquiring'} leftIcon={<QrCodeIcon className="w-4 h-4"/>}>QR Code</Button>
                          <Button type="button" variant="secondary" size="sm" onClick={handleWifiCheckin} disabled={isLoading || gpsCheckinState === 'acquiring'} leftIcon={<WifiIcon className="w-4 h-4"/>}>Wi-Fi</Button>
                      </div>
                  </Card>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <Button type="submit" disabled={isLoading || !isToday || status === AttendanceStatusOption.NOT_MARKED || gpsCheckinState === 'acquiring'} leftIcon={<BriefcaseIcon className="w-5 h-5"/>}>
              {isLoading ? <Spinner size="sm" color="text-white"/> : 'Update Attendance'}
            </Button>
            {canCheckOut && (
               <Button type="button" variant="secondary" onClick={handleCheckOut} disabled={isLoading || gpsCheckinState === 'acquiring'} leftIcon={<ClockIcon className="w-5 h-5"/>}>
                  {isLoading && !(gpsCheckinState === 'acquiring') ? <Spinner size="sm"/> : 'Check-Out'}
              </Button>
            )}
          </div>
           {currentAttendance?.checkInTime && (
              <p className="text-sm text-gray-600">
                  Checked In: {currentAttendance.checkInTime}
                  {currentAttendance.checkOutTime && `, Checked Out: ${currentAttendance.checkOutTime}`}
              </p>
          )}
           {!isToday && currentAttendance && (
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-md">Attendance for past dates is view-only. To make changes, please contact HR/Admin.</p>
           )}
           {!isToday && !currentAttendance && (
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-md">Cannot mark attendance for past dates if not previously recorded.</p>
           )}
        </form>
      </Card>

      <WifiCheckinModal
        isOpen={isWifiModalOpen}
        onClose={() => setIsWifiModalOpen(false)}
        onWifiConnect={(networkName) => performActualCheckIn('Wi-Fi', `Connected to ${networkName}.`)}
      />
      <QrCodeCheckinModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onQrScan={() => performActualCheckIn('QR Code', 'QR Code scanned.')}
      />
    </>
  );
};
