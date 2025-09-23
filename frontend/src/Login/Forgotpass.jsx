import React, { useState } from 'react'
import logo from '../assets/logo.png'; 
import { Link } from 'react-router-dom';
import API from '../api/';

const Forgotpass = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(`✅ Reset token sent! (Dev mode: ${res.data.resetToken})`);
      // 👉 In production, token ekak email ekata yanawa
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.error || "Something went wrong"));
    }
  };
  return (
    <div className="flex w-full h-screen">
      <div className="w-1/2 flex items-center justify-center bg-white">
        <img src={logo} alt="May Fashion Logo" className="w-96" />
      </div>
      <div className="w-1/2 flex items-center justify-center bg-[#00AF96] p-4 rounded-l-3xl">
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="mx-20 text-2xl font-bold mb-1">Forgot Password?</h1>
            <div className="mt-2 text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/" className="font-medium text-blue-500 hover:text-black hover:underline">
                Login here
              </Link>
            </div>
            <form className="mt-4" onSubmit={handleSubmit}>
              <label className="mt-4 text-left text-sm text-gray-600 block" htmlFor="email-input">
                Email address
              </label>
              <div className="mb-4">
                <input
                  id="email-input"
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#28b584]"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#C7F5EE] text-black py-2 rounded-md hover:bg-[#c7f5eeb4]"
              >
                Reset Password   
              </button>
            </form>
            {message && (
              <div className="mt-4 text-center text-sm text-gray-700">
                {message}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default Forgotpass
