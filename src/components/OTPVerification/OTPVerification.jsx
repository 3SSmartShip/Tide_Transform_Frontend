import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input change for each OTP digit
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value && index < 5) {
      const nextInput = element.parentElement.nextElementSibling?.querySelector('input');
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const email = localStorage.getItem('userEmail');
      const otpString = otp.join('');
      
      const { data, error: verificationError } = await supabase.auth.verifyOtp({
        email,
        token: otpString,
        type: 'email'
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
    <div className="min-h-screen bg-white p-4">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-16">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-black text-base">Back</span>
      </button>

      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div>
          <h1 className="text-[32px] font-bold text-black mb-4">
            Verify Your Account
          </h1>
          <p className="text-gray-600">
            We've sent a verification code to your email. please enter it below to complete your registration
          </p>
        </div>

        {/* Right Column */}
        <div className="bg-[#F5F7FF] rounded-[20px] p-8">
          <h2 className="text-[24px] font-semibold text-black mb-2">
            Enter Verification Code
          </h2>
          <p className="text-gray-600 mb-8">
            No worries, we'll send you reset instructions.
          </p>

          <form onSubmit={handleVerifyOTP}>
            <div className="flex gap-2 mb-6">
              {otp.map((digit, index) => (
                <div key={index} className="w-full">
                  <input
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(e.target, index)}
                    className="w-full h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0066FF] text-white py-4 rounded-lg font-medium text-base"
            >
              Verify Your Account
            </button>

            {error && (
              <div className="mt-4 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <div className="mt-4 text-center">
              <span className="text-gray-600">Didn't receive the code? </span>
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-[#0066FF] font-normal"
              >
                Click to resend
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}