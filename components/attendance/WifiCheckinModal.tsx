import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { WifiIcon } from '../icons';

interface WifiCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWifiConnect: (networkName: string) => void;
}

const mockNetworks = [
  { name: 'OfficeNet_Main', strength: 90 },
  { name: 'SmartOffice_Guest', strength: 75 },
  { name: 'CorporateWiFi_Secure', strength: 80 },
  { name: 'MeetingRoom_AV', strength: 60 },
];

export const WifiCheckinModal: React.FC<WifiCheckinModalProps> = ({ isOpen, onClose, onWifiConnect }) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleNetworkSelect = (networkName: string) => {
    setSelectedNetwork(networkName);
    setIsConnecting(true);
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false);
      onWifiConnect(networkName);
      onClose(); // Close modal after "connection"
    }, 2000);
  };

  const handleCloseModal = () => {
    setSelectedNetwork(null);
    setIsConnecting(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Wi-Fi Check-in">
      {isConnecting && selectedNetwork ? (
        <div className="text-center p-4">
          <Spinner size="md" />
          <p className="mt-3 text-gray-700">Connecting to {selectedNetwork}...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Select an office Wi-Fi network to check-in:</p>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {mockNetworks.map((network) => (
              <li key={network.name}>
                <button
                  onClick={() => handleNetworkSelect(network.name)}
                  className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-sky-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <span className="font-medium text-gray-700">{network.name}</span>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-1">{network.strength}%</span>
                    <WifiIcon className="w-5 h-5 text-sky-600" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-right">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};