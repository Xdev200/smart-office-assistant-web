import React from 'react';
import { AVEquipment, RoomFilters } from '../../types'; // Import RoomFilters from types.ts
import { Select } from '../common/Select';
import { FilterIcon } from '../icons';

// RoomFilters interface is now defined in types.ts

interface RoomFilterProps {
  filters: RoomFilters;
  onFilterChange: <K extends keyof RoomFilters>(filterName: K, value: RoomFilters[K]) => void;
  availableFloors: number[];
}

const capacityOptions = [
  { value: 0, label: 'Any Capacity' },
  { value: 2, label: '2+' },
  { value: 4, label: '4+' },
  { value: 6, label: '6+' },
  { value: 8, label: '8+' },
  { value: 10, label: '10+' },
  { value: 12, label: '12+' },
];

const avEquipmentOptions = Object.values(AVEquipment).map(eq => ({ value: eq, label: eq }));

export const RoomFilter: React.FC<RoomFilterProps> = ({ filters, onFilterChange, availableFloors }) => {
  const handleAVEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const equipment = e.target.value as AVEquipment;
    const currentAV = filters.avEquipment;
    if (currentAV.includes(equipment)) {
      onFilterChange('avEquipment', currentAV.filter(item => item !== equipment));
    } else {
      onFilterChange('avEquipment', [...currentAV, equipment]);
    }
  };

  const floorOptions = [{ value: 0, label: 'Any Floor' }, ...availableFloors.map(f => ({ value: f, label: `Floor ${f}`}))];

  return (
    <div className="p-4 bg-white shadow rounded-lg mb-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center"><FilterIcon className="w-5 h-5 mr-2 text-sky-600"/>Filter Rooms</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Min. Capacity"
          options={capacityOptions}
          value={filters.capacity}
          onChange={(e) => onFilterChange('capacity', parseInt(e.target.value))}
        />
        <Select
          label="Floor"
          options={floorOptions}
          value={filters.floor === null ? 0 : filters.floor}
          onChange={(e) => onFilterChange('floor', parseInt(e.target.value) === 0 ? null : parseInt(e.target.value))}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">AV Equipment</label>
          <div className="space-y-2 max-h-32 overflow-y-auto p-2 border rounded-md border-gray-300">
            {avEquipmentOptions.map(option => (
              <label key={option.value} className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={filters.avEquipment.includes(option.value as AVEquipment)}
                  onChange={handleAVEquipmentChange}
                  className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 mr-2"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
