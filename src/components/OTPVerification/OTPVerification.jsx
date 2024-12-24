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
        <div className="min-h-screen bg-white ">
           <div className="flex items-center gap-2 mb-8 -ml-4">
          <img
            src={TideTransformLogo}
            alt="Tide Transform"
            className="h-[80px]"
          />
        </div>
          {/* Back Button */}
          {/* <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-16 p-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-black text-base">Back</span>
          </button> */}
    
          <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <h1 className="text-[32px] font-bold text-black mb-4">
                Verify Your Account
              </h1>
              <p className="text-gray-600">
                We've sent a verification code to your email. Please enter it below to complete your registration.
              </p>
            </div>
    
            {/* Right Column */}
            <div className="bg-[#F5F7FF] rounded-[20px] p-8">
              <h2 className="text-[24px] font-semibold text-black mb-2">
                Enter Verification Code
              </h2>
              <p className="text-gray-600 mb-8">
                Please enter the code sent to your email.
              </p>
    
              <form onSubmit={handleVerifyOTP}>
                <div className="flex gap-2 mb-6" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <div key={index} className="w-full">
                      <input
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        ref={(el) => inputsRef.current[index] = el}
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
              </form>
            </div>
          </div>
        </div>
      );
    }