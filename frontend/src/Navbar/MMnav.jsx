import React from 'react'
import Logo from '../assets/logo.png'
import profile from '../assets/profile.png'
import search from '../assets/search.png'

const Navbar7 = () => {
  return (
    <div className='w-full border-b-2 p-3 border-gray-200 flex bg-white'>
      <img src={Logo} alt="logo" className='w-14 h-8 ml-4 mt-2' />
      <div className='ml-10'>
      <nav className="flex sm:justify-center space-x-4">
        {
            [
                ['Dashboard', '/manager'],
                ['Campaigns', '/manager'],
                ['Templates', '/manager/templates'],
                ['Reports', '/manager/reports'],
                ['Audience', '/manager/audience'],
            ].map(([title, url]) => (
                <a href={url} key={title} className="rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900">
                    {title}</a>
            ))
        }
        </nav>
        </div>
      <div className="relative ml-auto mr-8 flex items-center">
        <img src={search} alt="search" className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60 ml' />
        <input type="text" placeholder="Search" className="pl-10 pr-6 py-2 w-64 rounded-xl bg-[#F2F2F5] focus:outline-none mr-4" />
        <button className='rounded-full'>
          <img src={profile} alt="profile" className="h-8 w-8 align-middle inline-block" />
        </button>
      </div>
    </div>
  )
}

export default Navbar7