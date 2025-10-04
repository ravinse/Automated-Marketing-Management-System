import React from 'react'
import Campaingdate from '../Tables/Campaingdate.jsx'
import Navbarm from './Navbarm.jsx'

const Campaignreview = () => {
  return (
    <div>
      <Navbarm />
      <div >
        <div className='flex flex-col w-3/4 h-auto p-4 mx-20'>
            <h1 className='text-black text-[32px] font-bold'>Campaign Review</h1>
            <p className='text-gray-500 text-[16px]'>Review the campaign details and take action.</p>
            <div className='mt-10'>
                <h2 className='text-black text-[24px] font-bold'>Campaign Details</h2>
                {/*form*/}
                <form action="">
                    <div>
                        <div><label>Campaign Created By</label></div>
                        <div className='mt-2'>
                          <div className="w-1/2 px-3 py-2 border rounded-2xl bg-gray-100 text-gray-700 font-semibold">Kalhara</div>
                        </div>
                        <div className='mt-5'><label>Campaign Name</label></div>
                        <div className='mt-2'>
                        <div className="w-1/2 px-3 py-2 border rounded-2xl bg-gray-100 text-gray-700 font-semibold">school cloth</div> 
                         
                        </div>
                        <div className='mt-5'><label>Campaign Description</label></div>
                        <div className='mt-2'>
                        <div className="w-1/2 px-3 py-2 border rounded-2xl bg-gray-100 text-gray-700 font-semibold">uydgfdjghdsgf63743jdggfsdfdgsj$#%^jfh</div>
                        </div>
                        <div className='mt-5'><label>Content Preview</label></div>
                       <div className='mt-5'> 
                        <div className="w-3/4 h-96 px-3 py-2 border bg-red-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500">Kalharahdgjfdgsfzhdchgjchzgcsdhfgdjfgsdjgfjsdjdsgf</div>
                       </div>

                        
                       
                       
                        <div className='mt-5 font-bold'><h1>Action</h1></div>
                        <div className='mt-5'><label>Notes</label></div>
                        <div className='mt-5'>
                          <div
                          className="w-1/3 h-32 px-3 py-2 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500">@#$%^&*dfghjkertyuivbnm,</div>
                        </div>
                        <div className='mt-5'><h1>Resubmission Deadline</h1></div>
                       <div><Campaingdate/></div>
                      <div className='flex gap-4 w-auto mt-3'> 
                        <button type="submit" className="w-1/12 bg-blue-400 text-white rounded-3xl hover:bg-blue-300">Approve</button>
                        <button type="submit" className='w-1/12 bg-blue-400 text-white rounded-3xl hover:bg-blue-300'>Reject</button>
                        <button type="submit" className='w-1/6 bg-blue-400 text-white rounded-3xl hover:bg-blue-300'>Request Resubmission</button>
                      </div>
                        
                    </div>
                </form>
            </div>
            
        </div>

      </div>
    </div>
  )
}

export default Campaignreview

