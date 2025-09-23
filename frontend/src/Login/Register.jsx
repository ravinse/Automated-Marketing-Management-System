import React, {useState} from 'react'
import logo from '../assets/logo.png'; 
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "", confirmPassword: "", role: "admin" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        username: form.username,
        password: form.password,
        role: form.role
      });

      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "Registration failed"));
    }
  };

  return (
    <div className="flex w-full h-screen">
      <div className="w-1/2 flex items-center justify-center bg-white">
        <img src={logo} alt="May Fashion Logo" className="w-96" />
      </div> 
      <div className="w-1/2 flex items-center justify-center bg-[#00AF96] p-8 rounded-l-3xl">
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-1">Sign Up</h2>
          <p className="text-gray-600 mb-6">Welcome to May Fashion</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#28b584]"
              />
            </div>

            <div className="mb-4">
                <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#28b584]"/>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    placeholder="Username"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#28b584]"
                />  
            </div>

            <div className="mb-4 relative">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#28b584]"
              />
              <span className="absolute right-3 top-2.5 text-gray-500 cursor-pointer">
                Show
              </span>
            </div>

            <div className="mb-4 relative">
                <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm Password"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#28b584]"/>
                <span className="absolute right-3 top-2.5 text-gray-500 cursor-pointer">
                    Show
                    </span>
            </div>

            <input
              type="checkbox"
                className="mr-2 mx-16 mb-4"    
            />
            <span className="text-gray-500 text-sm">I agree to the terms and conditions</span>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
            >
              Register
            </button>
          </form>


          <div className="mt-4 text-center">
            <Link to="/" type="submit"
            className="text-gray-500 text-sm hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
