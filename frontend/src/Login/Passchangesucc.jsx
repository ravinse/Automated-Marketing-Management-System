import React, { useEffect, useState } from 'react'
import logo from '../assets/logo.png'; 
import { Link, useNavigate } from 'react-router-dom';

const Passchangesucc = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="flex w-full h-screen">
      <div className="w-1/2 flex items-center justify-center bg-white">
        <img src={logo} alt="May Fashion Logo" className="w-96" />
      </div>
      <div className="w-1/2 flex items-center justify-center bg-[#00AF96] p-4 rounded-l-3xl">
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">Password Changed Successfully!</h1>
            </div>
            <div className="mt-4 text-center text-gray-600 mb-6">
              Your password has been changed successfully. You will be redirected to the login page in <span className="font-bold text-green-600">{countdown}</span> seconds...
            </div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full bg-[#C7F5EE] text-black py-2 rounded-md hover:bg-[#c7f5eeb4] font-medium"
            >
              Login Now
            </button>
        </div>
      </div>
    </div>
  )
}

export default Passchangesucc