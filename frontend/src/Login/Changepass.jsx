import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png'; 
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

const Changepass = () => {
  const [form, setForm] = useState({ email: "", oldPassword: "", newPassword: "", confirmPassword: "" });
  const navigate = useNavigate();

  useEffect(() => {
    // Try to get email from user profile if logged in
    const fetchUserEmail = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await API.get("/auth/profile");
          setForm(prev => ({ ...prev, email: res.data.email }));
        }
      } catch (err) {
        console.error("Failed to fetch user email:", err);
      }
    };
    fetchUserEmail();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email) {
      alert("Please enter your email address");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    try {
      await API.post("/auth/changepass", {
        email: form.email,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });
      // Navigate to success page
      navigate("/passchangesucc");
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "Password change failed"));
    }
  };

  return (
    <div className="flex w-full h-screen">
      <div className="w-1/2 flex items-center justify-center bg-white">
        <img src={logo} alt="May Fashion Logo" className="w-96" />
      </div>
      <div className="w-1/2 flex items-center justify-center bg-[#00AF96] p-4 rounded-l-3xl">
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="mx-20 text-2xl font-bold mb-1">Reset Password</h1>
            <form className="mt-4" onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#28b584] mb-4"
                />
                <input
                  id="old-password-input"
                  name="oldPassword"
                  type="password"
                  placeholder="Old Password"
                  value={form.oldPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#28b584] mb-4"
                />
                <input
                  id="new-password-input"
                  name="newPassword"
                  type="password"
                  placeholder="New Password"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#28b584] mb-4"
                />
                <input
                  id="confirm-password-input"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="my-4 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#28b584]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#C7F5EE] text-black py-2 rounded-md hover:bg-[#c7f5eeb4]"
              >
                Reset Password   
              </button>
            </form>
        </div>
      </div>
    </div>
  )
}

export default Changepass;
