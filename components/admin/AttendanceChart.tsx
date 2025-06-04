
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AdminDashboardData, AttendanceStatusOption } from '../../types';
import { Card } from '../common/Card';

interface AttendanceChartProps {
  data: AdminDashboardData['attendanceSummary'];
  peakDaysData?: AdminDashboardData['peakOfficeDays'];
}

const COLORS_ATTENDANCE: Record<AttendanceStatusOption, string> = {
  [AttendanceStatusOption.IN_OFFICE]: '#10B981', // Emerald 500
  [AttendanceStatusOption.WFH]: '#3B82F6', // Blue 500
  [AttendanceStatusOption.ON_LEAVE]: '#F59E0B', // Amber 500
  [AttendanceStatusOption.NOT_MARKED]: '#9CA3AF', // Gray 400
};

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ data, peakDaysData }) => {
  const pieChartData = data.map(item => ({ name: item.status, value: item.count }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Today's Attendance Status">
        {data.every(d => d.count === 0) ? (
          <p className="text-gray-600 text-center py-8">No attendance data for today yet.</p>
        ) : (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_ATTENDANCE[entry.name as AttendanceStatusOption] || '#CCCCCC'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {peakDaysData && peakDaysData.length > 0 && (
        <Card title="Predicted Peak Office Days (Sample)">
           <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={peakDaysData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="attendanceCount" name="In-Office Count" fill="#0EA5E9" />
                </BarChart>
            </ResponsiveContainer>
           </div>
        </Card>
      )}
    </div>
  );
};
