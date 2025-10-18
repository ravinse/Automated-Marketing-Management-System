import React, { useState, useEffect } from 'react';
import OwnerNavbar from './homepage/OwnerNavbar';
import API from '../api';

const Feedback = () => {
  const [overview, setOverview] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: []
  });
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedbackData();
  }, [searchTerm]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch overview statistics
      const overviewResponse = await API.get('/feedback/overview');
      setOverview(overviewResponse.data);
      
      // Fetch feedback list
      const feedbackResponse = await API.get('/feedback', {
        params: { search: searchTerm, limit: 10 }
      });
      setFeedbacks(feedbackResponse.data.items || []);
    } catch (err) {
      console.error('Error fetching feedback data:', err);
      // Set default values instead of showing error
      setOverview({
        averageRating: 0,
        totalReviews: 0,
        distribution: []
      });
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading && feedbacks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OwnerNavbar />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading feedback data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OwnerNavbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Feedback & Ratings</h1>
        <p className="text-gray-600 mb-6">Analyze customer feedback and ratings to improve your campaigns.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <input 
            placeholder="Search feedback" 
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm md:col-span-1">
            <div className="text-5xl font-bold text-gray-900">{overview.averageRating.toFixed(1)}</div>
            <div className="text-gray-500">{overview.totalReviews} reviews</div>
            <div className="flex items-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(overview.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm md:col-span-2">
            <div className="space-y-3">
              {overview.distribution.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 text-sm font-medium">{item.stars}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${item.percentage}%` }} 
                      className="h-full bg-gray-700"
                    ></div>
                  </div>
                  <span className="w-12 text-right text-sm text-gray-600">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Feedback</h2>
        {feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback._id} className="bg-white rounded-xl p-4 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium text-gray-900">{feedback.name}</div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {feedback.campaign && (
                    <div className="text-xs text-blue-600 mb-1">Campaign: {feedback.campaign}</div>
                  )}
                  <div className="text-gray-600 text-sm">{feedback.description}</div>
                </div>
                <div className="text-gray-500 text-sm ml-4">{formatDate(feedback.createdAt)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-gray-500">No feedback available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Feedback;
