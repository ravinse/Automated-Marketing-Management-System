import React from 'react'
import logo from '../assets/logo.png'; 
import { Link, useNavigate } from 'react-router-dom';

const Passchangesucc = () => {
  const navigate = useNavigate();
  return (
    <div className="flex w-full h-screen">
      <div className="w-1/2 flex items-center justify-center bg-white">
        <img src={logo} alt="May Fashion Logo" className="w-96" />
      </div>
      <div className="w-1/2 flex items-center justify-center bg-[#00AF96] p-4 rounded-l-3xl">
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="mx-20 text-2xl font-bold mb-1">Password Reset</h1>
            <div className="mt-2 text-center text-sm text-gray-600">
              Your password has been reset
 successfully!
              <button
                type="submit"
                onClick={() => navigate("/Resetpass")}
                className="w-full bg-[#C7F5EE] text-black py-2 rounded-md hover:bg-[#c7f5eeb4]"
              >
                Login Again
              </button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Passchangesucc