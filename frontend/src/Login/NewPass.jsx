import React, { useState } from "react";
import logo from "../assets/logo.png";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";

const NewPass = () => {
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const navigate = useNavigate();
  const { token } = useParams(); // 👈 take token from URL

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await API.post(`/auth/reset-password/${token}`, {
        newPassword: form.newPassword,
      });
      alert("✅ Password reset successful! Please log in.");
      navigate("/"); // go back to login
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.error || "Password reset failed"));
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
                id="new-password-input"
                name="newPassword"
                type="password"
                placeholder="New Password"
                value={form.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#28b584] mb-4"
                required
              />
              <input
                id="confirm-password-input"
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="my-6 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#28b584]"
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
        </div>
      </div>
    </div>
  );
};

export default NewPass;
