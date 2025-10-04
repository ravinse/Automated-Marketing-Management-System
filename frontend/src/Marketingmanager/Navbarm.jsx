import React, { useState } from 'react'
import Logo from '../assets/logo.png'
import profile from '../assets/profile.png'
import search from '../assets/search.png'

const Navbarm = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full border-b-2 p-3 border-gray-200 flex bg-white relative">
      {/* Logo */}
      <img src={Logo} alt="logo" className="w-14 h-8 ml-4 mt-2" />

      {/* Nav links */}
      <div className="ml-10">
        <nav className="flex sm:justify-center space-x-4">
          {[
            ['Dashboard', '/'],
            ['Campaigns', '/Campaign'],
            ['Templates', '/Template'],
            ['Performance', '/performanceoverview'],
            ['Feedback', '/Feedback'],
          ].map(([title, url]) => (
            <a
              href={url}
              key={title}
              className="rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900"
            >
              {title}
            </a>
          ))}
        </nav>
      </div>

      {/* Search + Profile */}
      <div className="relative ml-auto mr-8 flex items-center">
        {/* Search box */}
        <img
          src={search}
          alt="search"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60"
        />
        <input
          type="text"
          placeholder="Search"
          className="pl-10 pr-6 py-2 w-64 rounded-xl bg-[#F2F2F5] focus:outline-none mr-4"
        />

        {/* Profile with dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full focus:outline-none"
          >
            <img
              src={profile}
              alt="profile"
              className="h-8 w-8 rounded-full border"
            />
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
              <div className="px-4 py-2 border-b">
                <p className="font-semibold">yasodhakalhara</p>
                <p className="text-sm text-gray-500">yasodhakalhara187@gmail.com</p>
              </div>
              <a
                href="/settings"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Settings
              </a>
              <button
                onClick={() => alert('Logged out')}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbarm
