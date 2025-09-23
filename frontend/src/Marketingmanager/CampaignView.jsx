import React from 'react'
import Running from '../Tables/Running'
import Completed from '../Tables/Completed'
import MarketingManagerNavbar from './MarketingManagerNavbar'

const CampaignView = () => {
  return (
    <div>
      <MarketingManagerNavbar />
      <div>
        <h3 className="text-xl font-bold ml-52 mt-6 text-slate-800">Campaigns</h3>
      </div>
      <div className='mt-10'>
        <Running />
      </div>
      <div className='mt-10'>
        <Completed />
      </div>

    </div>
  )
}

export default CampaignView
