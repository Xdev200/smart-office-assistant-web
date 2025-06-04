
import React from 'react';
import { Room, AVEquipment } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { UsersIcon, BuildingIcon } from '../icons';

interface RoomCardProps {
  room: Room;
  onBookRoom: (roomId: string) => void;
  isBooked?: boolean; // Simplified: if the room has any booking for the selected date
}

const AVEquipmentPill: React.FC<{equipment: AVEquipment}> = ({equipment}) => {
    let color = "bg-gray-200 text-gray-700";
    if (equipment === AVEquipment.PROJECTOR) color = "bg-indigo-100 text-indigo-700";
    else if (equipment === AVEquipment.VIDEO_CONFERENCE) color = "bg-teal-100 text-teal-700";
    else if (equipment === AVEquipment.WHITEBOARD) color = "bg-purple-100 text-purple-700";
    else if (equipment === AVEquipment.SPEAKERS) color = "bg-pink-100 text-pink-700";

    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${color}`}>{equipment}</span>
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onBookRoom }) => {
  return (
    <Card className="h-full flex flex-col transition-shadow hover:shadow-xl">
      {room.imageUrl && <img src={room.imageUrl} alt={room.name} className="w-full h-40 object-cover"/>}
      <div className="p-4 flex-grow">
        <h4 className="text-xl font-semibold text-sky-700 mb-2">{room.name}</h4>
        <div className="text-sm text-gray-600 space-y-1 mb-3">
          <p className="flex items-center"><UsersIcon className="w-4 h-4 mr-2 text-gray-500"/>Capacity: {room.capacity} people</p>
          <p className="flex items-center"><BuildingIcon className="w-4 h-4 mr-2 text-gray-500"/>Floor: {room.floor}</p>
        </div>
        {room.avEquipment.length > 0 && (
            <div className="mb-3">
                <h5 className="text-xs font-semibold text-gray-500 mb-1">AV Equipment:</h5>
                <div className="flex flex-wrap gap-1">
                    {room.avEquipment.map(eq => <AVEquipmentPill key={eq} equipment={eq} />)}
                </div>
            </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <Button onClick={() => onBookRoom(room.id)} variant="primary" size="sm" className="w-full">
          View Availability & Book
        </Button>
      </div>
    </Card>
  );
};
