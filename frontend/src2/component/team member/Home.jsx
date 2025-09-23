import React from 'react'
import Navbar from './Navbar'
import CreateCampaign from './Createcampaign'
import Targeting from './Targeting'
import Content from './Content'
import Attachments from './Attachment'
import TipsSection from './Tipssection'



const Home = () => {
  return (
    <div>
        <Navbar />
        <CreateCampaign />
        <Targeting />
        <Content />
        <Attachments />
        <TipsSection />
    
        </div>
  )
}

export default Home