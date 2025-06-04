import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../constants';
import { Button } from './common/Button';
import { BuildingIcon, LoginIcon, LogoutIcon, UsersIcon, MenuIcon, XIcon } from './icons';
// Note: ChartBarIcon was in the thought process but not directly used in this final nav version to keep it clean. Can be added if specific admin link needs it.

export const Navbar: React.FC = () => {
  const { currentUser, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const commonLinks = (
    <>
      {isAuthenticated && (
        <>
          <li>
            <Link 
              to="/dashboard" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 sm:text-sm sm:hover:bg-transparent sm:hover:text-sky-600" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link 
                to="/admin" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 sm:text-sm sm:hover:bg-transparent sm:hover:text-sky-600" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            </li>
          )}
        </>
      )}
    </>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center text-sky-600 hover:text-sky-700">
              <BuildingIcon className="h-8 w-auto mr-2" />
              <span className="font-bold text-xl">{APP_NAME}</span>
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <ul className="flex space-x-1">
                {commonLinks}
            </ul>
            {isAuthenticated && currentUser ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 hidden lg:block">Welcome, {currentUser.name}!</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={<LogoutIcon className="w-4 h-4"/>}>
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm" leftIcon={<LoginIcon className="w-4 h-4"/>}>
                  Login
                </Button>
              </Link>
            )}
          </div>
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-16 inset-x-0 z-30 bg-white shadow-lg p-2 space-y-1" id="mobile-menu">
            <ul className="space-y-1">
                {commonLinks}
            </ul>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated && currentUser ? (
              <>
                <div className="flex items-center px-4 mb-2">
                  {/* Consider adding a generic user icon if available */}
                  {/* <UsersIcon className="w-8 h-8 text-gray-500 mr-2"/> */}
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-lg font-semibold mr-3">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-base font-medium text-gray-800">{currentUser.name}</div>
                    <div className="text-sm font-medium text-gray-500">{currentUser.email}</div>
                  </div>
                </div>
                <Button variant="danger" size="sm" onClick={handleLogout} className="w-full justify-center mt-2" leftIcon={<LogoutIcon className="w-4 h-4"/>}>
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login" className="block w-full">
                <Button variant="primary" size="sm" className="w-full justify-center" leftIcon={<LoginIcon className="w-4 h-4"/>} onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
