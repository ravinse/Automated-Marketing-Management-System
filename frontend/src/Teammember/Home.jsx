import React from 'react'
import TeamMemberNavbar from './TeamMemberNavbar';
import Header from './Header';
import Drafted from './Drafted';
import SentForApproval from './Sentapproval';
import Running from './Running';
import Finished from './Finished';


const Home = () => {
  return (
    <div>
        <TeamMemberNavbar />
        <Header />
        <Drafted />
        <SentForApproval />
        <Running />
        <Finished />
        </div>
  )
}

export default Home