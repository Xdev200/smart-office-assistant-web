
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminDashboardData } from '../../types';
import { Card } from '../common/Card';

interface ParkingChartProps {
  data: AdminDashboardData['parkingUsage'];
}

const COLORS = ['#EF4444', '#22C55E']; // Occupied (Red), Available (Green)

export const ParkingChart: React.FC<ParkingChartProps> = ({ data }) => {
  if (data.totalSlots === 0) {
    return <Card title="Parking Usage"><p className="text-gray-600 text-center py-8">No parking slots configured.</p></Card>;
  }
  
  const chartData = [
    { name: 'Occupied', value: data.occupiedSlots },
    { name: 'Available', value: data.totalSlots - data.occupiedSlots },
  ];
  const occupancyPercentage = (data.occupiedSlots / data.totalSlots) * 100;

  return (
    <Card title="Parking Usage">
        <div className="text-center mb-4">
            <p className="text-4xl font-bold text-sky-600">{occupancyPercentage.toFixed(1)}%</p>
            <p className="text-gray-600">Occupied ({data.occupiedSlots} / {data.totalSlots} slots)</p>
        </div>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value} slots`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
