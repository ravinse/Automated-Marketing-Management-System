import React from 'react'
import Navbar from './Navbart';
import Header from './Header';
import Drafted from './Drafted';
import SentForApproval from './Sentapproval';
import Running from './Running';
import Finished from './Finished';


const Home = () => {
  return (
    <div>
        <Navbar />
        <Header />
        <Drafted />
        <SentForApproval />
        <Running />
        <Finished />
        </div>
  )
}

export default Home