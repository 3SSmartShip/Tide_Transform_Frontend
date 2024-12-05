import React from 'react';
import { Link } from 'react-router-dom';

export default function ConfirmEmail() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent you a confirmation link to your email address.
              Please check your inbox and click the link to activate your account.
            </p>
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Didn't receive the email?
                Check your spam folder or{' '}
                <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                  try signing up again
                </Link>
              </p>
            </div>
            <div className="mt-6">
              <Link
                to="/login"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Return to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 