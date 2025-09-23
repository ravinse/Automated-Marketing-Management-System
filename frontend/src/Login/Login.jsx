import React, { useState } from 'react'
import logo from '../assets/logo.png'; 
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      console.log("backend response:", res.data);
      localStorage.setItem("token", res.data.token); // Save JWT
      localStorage.setItem("role", res.data.user.role); // Save user role
      alert("Login successful!");

      switch (res.data.user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'manager':
          navigate('/manager');
          break;
        case 'owner':
          navigate('/owner');
          break;
        case 'team member':
          navigate('/team');
          break;
        default:
          navigate('/home');
      }
    } catch (err) {
      console.error("login error:", err.response?.data);
      alert("Error: " + (err.response?.data?.error || "Login failed"));
    }
  };
  
  return (
    <div className="flex w-full h-screen">
      <div className="w-1/2 flex items-center justify-center bg-white">
        <img src={logo} alt="May Fashion Logo" className="w-96" />
      </div>
      <div className="w-1/2 flex items-center justify-center bg-[#00AF96] p-8 rounded-l-3xl">
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-1">Hello!</h2>
          <p className="text-gray-600 mb-6">Welcome to May Fashion</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Email or Username"
                value={form.email}
                onChange={handleChange}
                required
                name="email"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#28b584]"
              />
            </div>

            <div className="mb-4 relative">
              <input
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                name="password"
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#28b584]"
              />
              <span className="absolute right-3 top-2.5 text-gray-500 cursor-pointer">
                Show
              </span>
            </div>

            <div className="text-right mb-6">
              <Link to="/forgotpass" className="text-gray-500 text-sm hover:underline">
                Forgot Password ?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
