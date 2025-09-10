import React from 'react'
import Logo from '../assets/logo.png'
import profile from '../assets/profile.png'

const Navbar5 = () => {
  return (
    <div className='w-full border-b-2 p-3 border-gray-200 flex bg-white'>
      <img src={Logo} alt="logo" className='w-14 h-8 ml-4 mt-2' />
      <div className='ml-auto mr-12'>
      <nav className="flex sm:justify-center space-x-4">
        {
            [
                ['Home', '/'],
                ['Campaigns', '/'],
                ['Automation', '/'],
                ['Audience', '/'],
                ['Analytics', '/'],
                ['Content Studio', '/'],
            ].map(([title, url]) => (
                <a href={url} key={title} className="rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900">
                    {title}</a>
            ))
        }
        </nav>
        </div>
        
      
      <div className="relative mr-8 flex items-center">
        <button className='rounded-full'>
          <img src={profile} alt="profile" className="h-8 w-8 align-middle inline-block" />
        </button>
      </div>
    </div>
  )
}

export default Navbar5