import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Campaingdate from '../Tables/Campaingdate.jsx'
import Navbarm from './Navbarm.jsx'

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
      navigate('/approvalsm');
    } catch (err) {
      console.error('Error approving campaign:', err);
      alert('Failed to approve campaign');
    }
  };

  const handleRequestResubmission = async () => {
    if (!notes.trim()) {
      alert('Please provide a resubmission note explaining what needs to be fixed');
      return;
    }
    
    if (!window.confirm('Are you sure you want to request resubmission for this campaign? The team member will be able to edit and resubmit it.')) return;
    
    try {
      const response = await fetch(`${API_URL}/campaigns/reject/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'resubmit',
          rejectionReason: notes,
          resubmissionNote: notes 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request resubmission');
      }
      
      alert('Resubmission requested successfully! Team member will be notified.');
      navigate('/approvalsm');
    } catch (err) {
      console.error('Error requesting resubmission:', err);
      alert('Failed to request resubmission: ' + err.message);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    if (!window.confirm('Are you sure you want to COMPLETELY REJECT this campaign? The team member will NOT be able to resubmit it.')) return;
    
    try {
      const response = await fetch(`${API_URL}/campaigns/reject/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'final',
          rejectionReason: notes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject campaign');
      }
      
      alert('Campaign rejected successfully.');
      navigate('/approvalsm');
    } catch (err) {
      console.error('Error rejecting campaign:', err);
      alert('Failed to reject campaign: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbarm />
        <div className='flex flex-col w-3/4 h-auto p-4 mx-20'>
          <p className='text-center py-8 text-gray-600'>Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div>
        <Navbarm />
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
      <Navbarm />
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
                        <div className='mt-2 flex gap-4'>
                          <div className="flex-1">
                            <div className='text-sm text-gray-600 mb-1'>Start Date</div>
                            <div className="px-3 py-2 border rounded-2xl bg-gray-100 text-gray-700">
                              {campaign.startDate 
                                ? new Date(campaign.startDate).toLocaleDateString() 
                                : 'Not set'}
                            </div>
                          </div>
                          <div className="flex-1">
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

                        <div className='mt-8 border-t pt-6'>
                          <div className='mt-5'>
                            <label className='font-semibold'>
                              {campaign.status === 'pending_approval' 
                                ? 'Manager Feedback / Decision Note' 
                                : 'Manager Notes'}
                            </label>
                            <p className='text-sm text-gray-500 mt-1'>
                              {campaign.status === 'pending_approval' 
                                ? 'Provide feedback for approval, resubmission request, or complete rejection. The team member will see this message.'
                                : 'Add any notes about this campaign'}
                            </p>
                          </div>
                          <div className='mt-2'>
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder={campaign.status === 'pending_approval' 
                                ? "e.g., 'Please update the email subject to be more engaging and fix the target date range...'" 
                                : "Enter your notes here..."}
                              className="w-3/4 min-h-[120px] px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className='flex gap-3 w-auto mt-6 flex-wrap'> 
                            {campaign.status === 'pending_approval' && (
                              <>
                                <button 
                                  type="button" 
                                  onClick={handleApprove}
                                  className='px-6 py-2 bg-green-600 text-white rounded-3xl hover:bg-green-700 font-medium transition-colors shadow-md'
                                >
                                  ✓ Approve Campaign
                                </button>
                                <button 
                                  type="button" 
                                  onClick={handleRequestResubmission}
                                  className='px-6 py-2 bg-orange-600 text-white rounded-3xl hover:bg-orange-700 font-medium transition-colors shadow-md'
                                >
                                  ↻ Request Resubmission
                                </button>
                                <button 
                                  type="button" 
                                  onClick={handleReject}
                                  className='px-6 py-2 bg-red-600 text-white rounded-3xl hover:bg-red-700 font-medium transition-colors shadow-md'
                                >
                                  ✕ Reject Completely
                                </button>
                              </>
                            )}
                            <button 
                              type="button" 
                              onClick={() => navigate(-1)}
                              className='px-6 py-2 bg-gray-400 text-white rounded-3xl hover:bg-gray-500 font-medium'
                            >
                              {campaign.status === 'pending_approval' ? 'Cancel' : 'Back'}
                            </button>
                          </div>
                          
                          {campaign.status === 'pending_approval' && (
                            <div className='mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                              <p className='text-sm text-blue-800'>
                                <strong>Note:</strong><br/>
                                • <strong>Approve</strong>: Campaign will be approved and can start running<br/>
                                • <strong>Request Resubmission</strong>: Team member can edit and resubmit the campaign<br/>
                                • <strong>Reject Completely</strong>: Campaign is permanently rejected (cannot be resubmitted)
                              </p>
                            </div>
                          )}
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

