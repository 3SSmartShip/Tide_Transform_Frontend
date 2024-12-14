import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";

export default function OTPVerification() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const email = localStorage.getItem('userEmail');
      
      // Correct Supabase OTP verification method
      const { data, error: verificationError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'  // Changed from 'signup' to 'email'
      });

      if (verificationError) {
        setError('Invalid verification code. Please try again.');
        return;
      }

      if (data?.user) {
        localStorage.removeItem('userEmail');
        navigate("/dashboard");
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add resend verification email functionality
  const handleResendVerification = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (!error) {
        alert('Verification email resent successfully');
      }
    } catch (error) {
      setError('Failed to resend verification email');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col p-12">
        <div className="flex items-center gap-2 mb-16">
          <img src="/logo.svg" alt="TideTransform" className="h-8" />
          <span className="text-xl font-semibold">TideTransform</span>
        </div>
        
        <div className="flex-grow flex flex-col justify-center max-w-lg">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Verify Your Account
          </h1>
          <p className="text-gray-600">
            We've sent a verification code to your email. Please enter it below to complete your registration.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md bg-[#EBF3FF] rounded-[20px] p-8">
          <h2 className="text-2xl font-semibold text-gray-900">Enter Verification Code</h2>
          <p className="mt-2 text-gray-600">Please check your email for the verification code</p>

          <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Verification Code*
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter verification code"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {/* Add resend button */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                Resend verification code
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}