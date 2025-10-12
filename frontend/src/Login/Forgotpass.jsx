import React, { useState } from 'react'
import logo from '../assets/logo.png'; 
import { Link } from 'react-router-dom';
import API from '../api/';

const Forgotpass = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("📧 Sending reset email...");
    
    try {
      const res = await API.post("/auth/forgot-password", { email });
      
      if (res.data.success) {
        // Email sent successfully
        setMessage(`✅ ${res.data.message}`);
      } else {
        // Email failed but token provided for development
        setMessage(`⚠️ ${res.data.message}${res.data.resetLink ? `\n🔗 Development Link: ${res.data.resetLink}` : ''}`);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      const errorMessage = err.response?.data?.error || "Failed to send reset email. Please try again.";
      setMessage("❌ " + errorMessage);
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
              <div className={`mt-4 p-3 rounded-md text-sm ${
                message.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' : 
                message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {message.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default Forgotpass
