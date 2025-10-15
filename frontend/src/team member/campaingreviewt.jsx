import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Campaingdate from '../Tables/Campaingdate.jsx'
import Navbart from './Navbart.jsx'

// API Configuration
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const Campaignreview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const campaignId = searchParams.get('campaignId');
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [resubmissionDeadline, setResubmissionDeadline] = useState('');

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetails();
    } else {
      setError('No campaign ID provided');
      setLoading(false);
    }
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/campaigns/${campaignId}`);
      if (!response.ok) throw new Error('Failed to fetch campaign details');
      
      const data = await response.json();
      setCampaign(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setError('Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this campaign?')) return;
    
    try {
      const response = await fetch(`${API_URL}/campaigns/${campaignId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      
      if (!response.ok) throw new Error('Failed to approve campaign');
      
      alert('Campaign approved successfully!');
      navigate('/thome');
    } catch (err) {
      console.error('Error approving campaign:', err);
      alert('Failed to approve campaign');
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert('Please provide rejection notes');
      return;
    }
    
    if (!window.confirm('Are you sure you want to reject this campaign?')) return;
    
    try {
      const response = await fetch(`${API_URL}/campaigns/${campaignId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: notes })
      });
      
      if (!response.ok) throw new Error('Failed to reject campaign');
      
      alert('Campaign rejected successfully!');
      navigate('/thome');
    } catch (err) {
      console.error('Error rejecting campaign:', err);
      alert('Failed to reject campaign');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbart />
        <div className='flex flex-col w-3/4 h-auto p-4 mx-20'>
          <p className='text-center py-8 text-gray-600'>Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div>
        <Navbart />
        <div className='flex flex-col w-3/4 h-auto p-4 mx-20'>
          <p className='text-center py-8 text-red-600'>{error || 'Campaign not found'}</p>
          <button 
            onClick={() => navigate(-1)} 
            className='mx-auto px-4 py-2 bg-blue-400 text-white rounded-3xl hover:bg-blue-300'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbart />
      <div >
        <div className='flex flex-col w-3/4 h-auto p-4 mx-20'>
            <h1 className='text-black text-[32px] font-bold'>Campaign Review</h1>
            <p className='text-gray-500 text-[16px]'>Review the campaign details and take action.</p>
            <div className='mt-10'>
                <h2 className='text-black text-[24px] font-bold'>Campaign Details</h2>
                {/*form*/}
                <form action="" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <div><label className='font-semibold'>Campaign Created By</label></div>
                        <div className='mt-2'>
                          <div className="w-1/2 px-3 py-2 border rounded-2xl bg-gray-100 text-gray-700">
                            {campaign.createdBy || 'Unknown'}
                          </div>
                        </div>
                        
                        <div className='mt-5'><label className='font-semibold'>Campaign Name</label></div>
                        <div className='mt-2'>
                          <div className="w-1/2 px-3 py-2 border rounded-2xl bg-gray-100 text-gray-700">
                            {campaign.title || 'Untitled Campaign'}
                          </div> 
                        </div>
                        
                        <div className='mt-5'><label className='font-semibold'>Campaign Description</label></div>
                        <div className='mt-2'>
                          <div className="w-1/2 px-3 py-2 border rounded-2xl bg-gray-100 text-gray-700">
                            {campaign.description || 'No description'}
                          </div>
                        </div>

                        <div className='mt-5'><label className='font-semibold'>Target Customer Segments</label></div>
                        <div className='mt-2'>
                          <div className="w-1/2 px-3 py-2 border rounded-2xl bg-gray-100 text-gray-700">
                            {campaign.customerSegments && campaign.customerSegments.length > 0 
                              ? campaign.customerSegments.join(', ') 
                              : 'None'}
                          </div>
                        </div>

                        <div className='mt-5'><label className='font-semibold'>Campaign Dates</label></div>
                        <div className='mt-2 flex flex-col gap-4 w-1/2'>
                          <div>
                            <div className='text-sm text-gray-600 mb-1'>Start Date</div>
                            <div className="px-3 py-2 border rounded-2xl bg-gray-100 text-gray-700">
                              {campaign.startDate 
                                ? new Date(campaign.startDate).toLocaleDateString() 
                                : 'Not set'}
                            </div>
                          </div>
                          <div>
                            <div className='text-sm text-gray-600 mb-1'>End Date</div>
                            <div className="px-3 py-2 border rounded-2xl bg-gray-100 text-gray-700">
                              {campaign.endDate 
                                ? new Date(campaign.endDate).toLocaleDateString() 
                                : 'Not set'}
                            </div>
                          </div>
                        </div>

                        <div className='mt-5'><label className='font-semibold'>Email Subject</label></div>
                        <div className='mt-2'>
                          <div className="w-1/2 px-3 py-2 border rounded-2xl bg-gray-100 text-gray-700">
                            {campaign.emailSubject || 'No subject'}
                          </div>
                        </div>
                        
                        <div className='mt-5'><label className='font-semibold'>Email Content</label></div>
                       <div className='mt-2'> 
                        <div className="w-3/4 min-h-[200px] px-3 py-2 border bg-gray-50 rounded-2xl text-gray-700 whitespace-pre-wrap">
                          {campaign.emailContent || 'No content'}
                        </div>
                       </div>

                        <div className='mt-5'><label className='font-semibold'>SMS Content</label></div>
                       <div className='mt-2'> 
                        <div className="w-3/4 min-h-[200px] px-3 py-2 border bg-gray-50 rounded-2xl text-gray-700 whitespace-pre-wrap">
                          {campaign.smsContent || 'No SMS content'}
                        </div>
                       </div>

                        {/* Show resubmission note if campaign needs resubmission */}
                        {campaign.status === 'rejected' && (
                          <div className='mt-8 border-t pt-6'>
                            <div className='bg-orange-50 border-2 border-orange-300 rounded-2xl p-6'>
                              <div className='flex items-start gap-3 mb-4'>
                                <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div className='flex-1'>
                                  <h3 className='text-lg font-bold text-orange-800 mb-1'>Resubmission Required</h3>
                                  <p className='text-sm text-orange-700'>Your manager has requested changes to this campaign before approval.</p>
                                </div>
                              </div>
                              
                              <div className='mb-4'>
                                <p className='text-sm font-semibold text-gray-700 mb-1'>Requested On:</p>
                                <p className='text-gray-900'>
                                  {campaign.rejectedAt 
                                    ? new Date(campaign.rejectedAt).toLocaleString()
                                    : 'N/A'}
                                </p>
                              </div>
                              
                              <div>
                                <p className='text-sm font-semibold text-gray-700 mb-2'>Manager's Feedback:</p>
                                <div className='bg-white border-2 border-orange-200 rounded-lg p-4'>
                                  <p className='text-gray-900 whitespace-pre-wrap font-medium'>
                                    {campaign.resubmissionNote || campaign.rejectionReason || 'No feedback provided'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className='mt-4 p-3 bg-orange-100 rounded-lg'>
                                <p className='text-sm text-orange-800'>
                                  <strong>Next Steps:</strong> Please review the feedback above, make the necessary changes, and resubmit your campaign for approval.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Show rejection message if campaign is permanently rejected */}
                        {campaign.status === 'rejected_final' && (
                          <div className='mt-8 border-t pt-6'>
                            <div className='bg-red-50 border-2 border-red-300 rounded-2xl p-6'>
                              <div className='flex items-start gap-3 mb-4'>
                                <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className='flex-1'>
                                  <h3 className='text-lg font-bold text-red-800 mb-1'>Campaign Rejected</h3>
                                  <p className='text-sm text-red-700'>This campaign has been permanently rejected by the manager.</p>
                                </div>
                              </div>
                              
                              <div className='mb-4'>
                                <p className='text-sm font-semibold text-gray-700 mb-1'>Rejected On:</p>
                                <p className='text-gray-900'>
                                  {campaign.rejectedAt 
                                    ? new Date(campaign.rejectedAt).toLocaleString()
                                    : 'N/A'}
                                </p>
                              </div>
                              
                              <div>
                                <p className='text-sm font-semibold text-gray-700 mb-2'>Rejection Reason:</p>
                                <div className='bg-white border-2 border-red-200 rounded-lg p-4'>
                                  <p className='text-gray-900 whitespace-pre-wrap font-medium'>
                                    {campaign.rejectionReason || 'No reason provided'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className='mt-4 p-3 bg-red-100 rounded-lg'>
                                <p className='text-sm text-red-800'>
                                  <strong>Note:</strong> This campaign cannot be resubmitted. You may delete it or create a new campaign.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className='mt-8 border-t pt-6'>
                          <div className='flex gap-4 w-auto mt-6'> 
                            {campaign.status === 'rejected' ? (
                              <>
                                <button 
                                  type="button" 
                                  onClick={() => navigate(`/createcampaingt?edit=${campaign._id}`)}
                                  className='px-8 py-3 bg-green-600 text-white rounded-3xl hover:bg-green-700 font-semibold text-base transition-colors shadow-lg'
                                >
                                  Edit & Resubmit Campaign
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => navigate(-1)}
                                  className='px-6 py-3 bg-gray-400 text-white rounded-3xl hover:bg-gray-500 font-medium transition-colors'
                                >
                                  Back
                                </button>
                              </>
                            ) : campaign.status === 'rejected_final' ? (
                              <>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this rejected campaign?')) {
                                      fetch(`${API_URL}/campaigns/${campaign._id}`, { method: 'DELETE' })
                                        .then(() => {
                                          alert('Campaign deleted successfully');
                                          navigate('/thome');
                                        })
                                        .catch(err => alert('Failed to delete campaign'));
                                    }
                                  }}
                                  className='px-6 py-3 bg-red-600 text-white rounded-3xl hover:bg-red-700 font-medium transition-colors'
                                >
                                  Delete Campaign
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => navigate(-1)}
                                  className='px-6 py-3 bg-gray-400 text-white rounded-3xl hover:bg-gray-500 font-medium transition-colors'
                                >
                                  Back
                                </button>
                              </>
                            ) : (
                              <button 
                                type="button" 
                                onClick={() => navigate(-1)}
                                className='px-6 py-2 bg-gray-400 text-white rounded-3xl hover:bg-gray-500 font-medium'
                              >
                                Back
                              </button>
                            )}
                          </div>
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

