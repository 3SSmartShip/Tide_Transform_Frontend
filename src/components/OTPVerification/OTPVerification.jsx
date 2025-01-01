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
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

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
    const pasteData = e.clipboardData.getData("Text").trim();
    if (!/^\d{6}$/.test(pasteData)) {
      setError("Please paste a 6-digit OTP code.");
      return;
    }
    const pasteOtp = pasteData.split("");
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
      const email = localStorage.getItem("userEmail");
      const otpString = otp.join("");

      const { data, error: verificationError } = await supabase.auth.verifyOtp({
        email,
        token: otpString,
        type: "signup",
      });

      if (verificationError) {
        setError("Invalid verification code. Please try again.");
        return;
      }

      if (data?.user) {
        localStorage.removeItem("userEmail");
        navigate("/onboarding"); // Redirect to onboarding page
      }
    } catch (error) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    setError(null);

    try {
      const email = localStorage.getItem("userEmail");
      const { error: resendError } = await supabase.auth.resend({
        email,
        type: "signup",
      });

      if (resendError) throw resendError;

      // Start 60-second timer
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setError("Failed to resend code. Please try again.");
      setResendDisabled(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white pl-20 pr-20">
      <div className="hidden lg:flex lg:w-1/2 flex-col ">
        <div className="flex items-center gap-2 mb-4 pt-4 pl-12 mt-6">
          <img
            src={TideTransformLogo}
            alt="Tide Transform"
            className="h-45px] w-[200px]"
          />
        </div>

        <div className="flex-grow flex flex-col justify-center px-16 pb-64">
          <h1 className="text-[28px] font-bold mb-4 text-[#1C1C1C] ">
            Verify Your Account
          </h1>
          <p className="text-black text-base">
            We've sent a verification code to your email. Please <br />
            enter it below to complete your registration.
          </p>
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
                    ref={(el) => (inputsRef.current[index] = el)}
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

            <div className="mt-6 text-left">
              <p className="text-gray-600 text-sm">
                Didn't receive the code?{" "}
                {resendTimer > 0 ? (
                  <span className="text-gray-500">
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendDisabled}
                    className="text-[#0066FF] font-medium hover:text-blue-700 disabled:text-gray-400"
                  >
                    Click to resend
                  </button>
                )}
              </p>
            </div>

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
