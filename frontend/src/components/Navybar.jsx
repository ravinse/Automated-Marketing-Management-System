import React from "react";
import logo from "../assets/logo.png"; // Your logo
import profileImg from "../assets/profile.png"; // Your profile picture

const Navybar = () => {
  return (
    <>
      {/* Navbar */}
      <div className="flex flex-row items-center h-20 w-screen px-4">
        {/* Logo */}
        <div className="flex-1">
          <img src={logo} alt="Logo" className="h-16 w-auto" />
        </div>

        {/* Nav items */}
        <div className="flex gap-6 flex-1 justify-center">
          <button className="hover:bg-gray-200 px-3 py-2 rounded-lg">Dashboard</button>
          <button className="hover:bg-gray-200 px-3 py-2 rounded-lg">Campaigns</button>
          <button className="hover:bg-gray-200 px-3 py-2 rounded-lg">Templates</button>
          <button className="hover:bg-gray-200 px-3 py-2 rounded-lg">Reports</button>
          <button className="hover:bg-gray-200 px-3 py-2 rounded-lg">Audience</button>
        </div>

        {/* Right section: Search + Icons */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          

          {/* Notification Bell */}
          <button className="relative p-2 rounded-full hover:bg-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.964 8.964 0 0118 9.75V8a6 6 0 10-12 0v1.75a8.964 8.964 0 01-2.311 6.022c1.733.64 3.56 1.085 5.454 1.31m5.714 0a3 3 0 11-5.714 0m5.714 0H9.143"
              />
            </svg>
            {/* Red dot notification indicator */}
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Profile Icon */}
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 cursor-pointer hover:border-blue-400">
            <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-t-2 border-gray-200" />
    </>
  );
};

export default Navybar;
