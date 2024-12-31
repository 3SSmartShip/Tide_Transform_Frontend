import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";
import TideTransformLogo from "../../assets/logos/Tide_Transform_logo_bw.png";

export default function OTPVerification() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  // Handle input change for each OTP digit
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Handle key down for backspace functionality
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      if (newOtp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputsRef.current[index - 1].focus();
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Handle paste event to allow pasting the OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('Text').trim();
    if (!/^\d{6}$/.test(pasteData)) {
      setError('Please paste a 6-digit OTP code.');
      return;
    }
    const pasteOtp = pasteData.split('');
    setOtp(pasteOtp);
    pasteOtp.forEach((digit, index) => {
      if (inputsRef.current[index]) {
        inputsRef.current[index].value = digit;
      }
    });
    // Focus the last input
    if (inputsRef.current[5]) {
      inputsRef.current[5].focus();
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
        type: 'signup'
      });

      if (verificationError) {
        setError('Invalid verification code. Please try again.');
        return;
      }

      if (data?.user) {
        localStorage.removeItem('userEmail');
        navigate("/onboarding"); // Redirect to onboarding page
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden lg:flex lg:w-1/2 flex-col px-8">
        <div className="flex items-center gap-2 mb-8 -ml-4 p-6 pl-16 mt-4">
          <img
            src={TideTransformLogo}
            alt="Tide Transform"
            className="h-[45px] w-[200px]"
          />
        </div>

        <div className="flex-grow flex flex-col justify-center max-w-lg p-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-poppins">
            See how it works
          </h1>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Smart Document Processing
                </h3>
                <p className="text-gray-600 text-sm">
                  Transform maritime documents into structured data instantly
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Lightning Fast</h3>
                <p className="text-gray-600 text-sm">
                  Get results in seconds with our advanced AI engine
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#E9F1FF] flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure & Reliable</h3>
                <p className="text-gray-600 text-sm">
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:w-1/2 flex items-center justify-center">
        <div className="bg-[#E9F1FF] rounded-[20px] p-8 w-[480px]">
          <h2 className="text-[28px] font-semibold text-[#1C1C1C] mb-2">
            Enter Verification Code
          </h2>
          <p className="text-[#6B7280] mb-8">
            No worries, we'll send you reset instructions.
          </p>

          <form onSubmit={handleVerifyOTP}>
            <div className="flex gap-4 mb-6" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <div key={index} className="w-full">
                  <input
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => inputsRef.current[index] = el}
                    className="w-full h-14 text-center text-xl font-semibold border-b-2 border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0066FF] text-white py-4 rounded-xl font-medium text-base hover:bg-blue-600 transition-colors"
            >
              Verify Your Account
            </button>

            {error && (
              <div className="mt-4 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}

