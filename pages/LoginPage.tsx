
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MOCK_USERS } from '../constants';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Card } from '../components/common/Card';
import { BuildingIcon, LoginIcon } from '../components/icons';
import { APP_NAME } from '../constants';


export const LoginPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string>(MOCK_USERS[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      navigate(currentUser.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login(selectedUserId);
      const user = MOCK_USERS.find(u => u.id === selectedUserId);
      setIsLoading(false);
      if (user) {
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        // Should not happen with mock data
        alert("Login failed: User not found.");
      }
    }, 500);
  };

  const userOptions = MOCK_USERS.map(user => ({ value: user.id, label: `${user.name} (${user.role})` }));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-600 to-cyan-400 p-4">
       <div className="flex items-center text-white text-3xl font-bold mb-8">
          <BuildingIcon className="h-10 w-10 mr-3" />
          {APP_NAME}
        </div>
      <Card title="Welcome! Select User to Login" className="w-full max-w-md shadow-2xl" titleClassName="text-center !text-xl">
        <form onSubmit={handleLogin} className="space-y-6 p-2">
          <Select
            label="Select User:"
            options={userOptions}
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full"
          />
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading} leftIcon={<LoginIcon className="w-5 h-5"/>}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Card>
      <p className="text-center text-xs text-sky-100 mt-8">
        This is a simulated login for demonstration purposes. <br/> No actual authentication is performed.
      </p>
    </div>
  );
};
