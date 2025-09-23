import React from 'react'
import Navbar from './Navbar.jsx';
import User_management from './User_management.jsx';
import Campain_management from './Campaign_management.jsx';
import Perfomace_dashboard from './Perfomance_dashboard.jsx';

const Home = () => {
  return (
    <div>
        <Navbar/>
        <Perfomace_dashboard/>
    </div>
  )
}

export default Home
