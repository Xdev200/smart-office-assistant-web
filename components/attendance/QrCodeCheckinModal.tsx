
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { QrCodeIcon } from '../icons';

interface QrCodeCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQrScan: () => void;
}

export const QrCodeCheckinModal: React.FC<QrCodeCheckinModalProps> = ({ isOpen, onClose, onQrScan }) => {
  const [status, setStatus] = useState<'scanning' | 'detecting' | 'detected'>('scanning');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOpen && status === 'scanning') {
      // Simulate scanning process
      timer = setTimeout(() => {
        setStatus('detecting');
      }, 1500); // Initial delay before "detecting"
    }
    if (isOpen && status === 'detecting') {
      timer = setTimeout(() => {
        setStatus('detected');
      }, 2000); // Time to "detect"
    }
    if (isOpen && status === 'detected') {
        timer = setTimeout(() => {
            onQrScan();
            onClose(); // Close modal after "scan"
        }, 1000); // Show detected message briefly
    }
    return () => clearTimeout(timer);
  }, [isOpen, status, onQrScan, onClose]);

  // Reset status when modal is closed/reopened
  useEffect(() => {
    if (!isOpen) {
      setStatus('scanning');
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code Check-in" size="sm">
      <div className="text-center p-4">
        <div className="relative w-48 h-48 bg-gray-700 mx-auto rounded-lg flex items-center justify-center overflow-hidden mb-4">
          {/* Simulated camera view & scanner */}
          <QrCodeIcon className="w-24 h-24 text-gray-500 opacity-50" />
          {status === 'scanning' && (
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-sky-500/50 to-transparent animate-pulse"></div>
          )}
           {status === 'detecting' && (
             <div className="absolute inset-0 border-4 border-green-500 rounded-lg animate-ping opacity-75"></div>
           )}
          {/* This div will use the 'animate-scan-line' class which applies keyframes from index.html */}
          <div className="absolute w-full h-0.5 bg-red-500 top-1/2 animate-scan-line"></div>
        </div>

        {status === 'scanning' && <p className="text-gray-600">Position QR code within the frame...</p>}
        {status === 'detecting' && 
            <div className="flex items-center justify-center text-yellow-500">
                <Spinner size="sm" color="text-yellow-500"/> 
                <span className="ml-2">Detecting QR Code...</span>
            </div>
        }
        {status === 'detected' && <p className="text-green-600 font-semibold">QR Code Detected!</p>}

        <div className="mt-6">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
};
