
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminDashboardData } from '../../types';
import { Card } from '../common/Card';

interface RoomOccupancyChartProps {
  data: AdminDashboardData['roomOccupancy'];
}

export const RoomOccupancyChart: React.FC<RoomOccupancyChartProps> = ({ data }) => {
  if (data.length === 0) {
    return <Card title="Room Occupancy (Today)"><p className="text-gray-600 text-center py-8">No room booking data for today.</p></Card>;
  }
  return (
    <Card title="Room Occupancy (Today)">
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <BarChart 
            data={data} 
            margin={{ top: 5, right: 20, left: 0, bottom: 50 }} // Increased bottom margin for angled labels
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
                dataKey="roomName" 
                angle={-30} // Angle labels
                textAnchor="end" // Anchor angled labels correctly
                height={70} // Allocate space for angled labels
                interval={0} // Show all labels
                tick={{fontSize: 10}}
            />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Bookings Count', angle: -90, position: 'insideLeft', offset:-5, style: {fontSize: '0.8rem', fill: '#8884d8'} }} allowDecimals={false}/>
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Hours Booked', angle: -90, position: 'insideRight', offset: 10, style: {fontSize: '0.8rem', fill: '#82ca9d'} }} />
            <Tooltip />
            <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '10px'}}/>
            <Bar yAxisId="left" dataKey="bookingsCount" name="Bookings" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="hoursBooked" name="Hours Booked" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
