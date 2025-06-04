
import React, { useState, useEffect } from 'react';
import { AdminDashboardData } from '../types';
import { getAdminDashboardData } from '../services/mockApiService';
import { AttendanceChart } from '../components/admin/AttendanceChart';
import { ParkingChart } from '../components/admin/ParkingChart';
import { RoomOccupancyChart } from '../components/admin/RoomOccupancyChart';
import { Spinner } from '../components/common/Spinner';
import { Card } from '../components/common/Card';
import { Alert } from '../components/common/Alert';

export const AdminOverviewPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAdminDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError('Failed to load admin dashboard data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <div className="p-8"><Alert type="error" message={error} /></div>;
  }

  if (!dashboardData) {
    return <div className="p-8 text-center text-gray-600">No dashboard data available.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of office resource utilization.</p>
      </header>

      <div className="space-y-8">
        <section id="attendance-trends">
          <AttendanceChart data={dashboardData.attendanceSummary} peakDaysData={dashboardData.peakOfficeDays} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section id="parking-usage">
            <ParkingChart data={dashboardData.parkingUsage} />
            </section>

            <section id="room-occupancy">
            <RoomOccupancyChart data={dashboardData.roomOccupancy} />
            </section>
        </div>
        
        <Card title="AI Insights & Management (Simulated)">
            <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Predict peak office days and auto-suggest attendance days to employees.</li>
                <li>Recommend optimal rooms based on past usage patterns and current requests.</li>
                <li>AI-driven conflict resolution for double bookings (e.g., suggesting alternatives).</li>
                <li>Auto-release unused slots or no-show rooms to maximize utilization.</li>
            </ul>
            <p className="mt-3 text-sm text-sky-600">These advanced AI features are part of the future roadmap and can be integrated to further enhance SmartOffice capabilities.</p>
        </Card>
      </div>
    </div>
  );
};
