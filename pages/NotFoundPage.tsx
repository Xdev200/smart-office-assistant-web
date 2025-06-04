
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-100">
      <img src="https://picsum.photos/seed/404page/300/200" alt="Lost" className="rounded-lg shadow-xl mb-8 w-64 h-auto" />
      <h1 className="text-6xl font-bold text-sky-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Oops! The page you're looking for doesn't seem to exist. It might have been moved, deleted, or maybe you just mistyped the URL.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
};
