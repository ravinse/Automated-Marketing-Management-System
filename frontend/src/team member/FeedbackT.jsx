import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Navbart from "./Navbart";

// API Configuration
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Rating Overview Component
const RatingOverview = ({ rating, totalReviews, ratingData }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-gray-900 mb-2">{rating}</div>
        <div className="flex items-center justify-center mb-2">
          {renderStars(rating)}
        </div>
        <div className="text-gray-600">{totalReviews} reviews</div>
      </div>

      <div className="space-y-3">
        {ratingData.map((item) => (
          <div key={item.stars} className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 w-2">{item.stars}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-900 h-2 rounded-full"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 w-8">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const FeedbackItem = ({ feedback }) => {
  return (
    <div className="flex space-x-4">
      <img
        src={feedback.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(feedback.name || 'User')}&background=ccc&color=000`} 
        alt="User"
        className="w-12 h-12 rounded-full"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{feedback.name || 'Anonymous'}</h3>
          <span className="text-sm text-gray-500">{new Date(feedback.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="text-gray-600 mb-2">{feedback.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Campaign: {feedback.campaign || '—'}</span>
          <div className="text-sm text-yellow-500">{feedback.rating || '-'}/5</div>
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 7); i++) pages.push(i);
  return (
    <div className="flex items-center justify-center space-x-2 mt-8 pt-6 border-t border-gray-200">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="p-2 text-gray-400 hover:text-gray-600">
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-2 text-sm font-medium rounded-md ${p === currentPage ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className="p-2 text-gray-600 hover:text-gray-800">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

const SearchFilters = ({ onSearch }) => {
  const [q, setQ] = useState('');
  const [campaign, setCampaign] = useState('');

  const submit = (e) => {
    e?.preventDefault();
    onSearch({ search: q, campaign });
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search feedback"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <input
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
          placeholder="Campaign Type"
          className="px-4 py-2 border border-gray-300 rounded-md"
        />
        <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-md">Search</button>
      </div>
    </form>
  );
};

const RecentFeedback = ({ feedbackData, currentPage, onPageChange, totalPages }) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Feedback</h2>

      <div className="space-y-6">
        {feedbackData.map((feedback) => (
          <FeedbackItem key={feedback._id} feedback={feedback} />
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
};

const Feedback1 = () => {
  const [overview, setOverview] = useState({ averageRating: 0, totalReviews: 0, distribution: [] });
  const [feedbacks, setFeedbacks] = useState([]);
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ search: '', campaign: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 4; // items per page

  useEffect(() => {
    fetchOverview();
    fetchAllFeedbacks();
  }, []);

  useEffect(() => {
    fetchFeedbacks(currentPage, filters);
  }, [currentPage, filters]);

  // Fetch all feedbacks for the scrolling bar
  const fetchAllFeedbacks = async () => {
    try {
      const response = await fetch(`${API_URL}/feedback?limit=100`);
      if (!response.ok) throw new Error('Failed to fetch all feedbacks');
      const data = await response.json();
      setAllFeedbacks(data.items || []);
    } catch (err) {
      console.error('Error fetching all feedbacks:', err);
    }
  };

  // Fetch overview/statistics from API
  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/feedback/overview`);
      if (!response.ok) throw new Error('Failed to fetch overview');
      const data = await response.json();
      setOverview(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching overview:', err);
      setError('Failed to load feedback overview');
      // Set default values on error
      setOverview({ averageRating: 0, totalReviews: 0, distribution: [] });
    } finally {
      setLoading(false);
    }
  };

  // Fetch feedbacks from API with pagination and filters
  const fetchFeedbacks = async (page = 1, { search = '', campaign = '' } = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search) params.append('search', search);
      if (campaign) params.append('campaign', campaign);

      const response = await fetch(`${API_URL}/feedback?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch feedbacks');
      
      const data = await response.json();
      setFeedbacks(data.items || []);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('Failed to load feedbacks');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (newFilters) => {
    setCurrentPage(1);
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbart />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback & Ratings</h1>
          <p className="text-gray-600">Analyze customer feedback and ratings to improve your campaigns.</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading feedbacks...</p>
          </div>
        )}

        <SearchFilters onSearch={onSearch} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <RatingOverview 
            rating={overview.averageRating || 0} 
            totalReviews={overview.totalReviews || 0} 
            ratingData={overview.distribution || []} 
          />

          <RecentFeedback 
            feedbackData={feedbacks}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={totalPages}
          />
        </div>

        {/* Horizontal Scrolling Bar - View All Feedback */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">All Feedback</h2>
            <div className="text-sm text-gray-600">{allFeedbacks.length} total feedbacks</div>
          </div>
          
          <div className="relative">
            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              <div className="flex gap-4 min-w-max">
                {allFeedbacks.map((feedback) => (
                  <div 
                    key={feedback._id} 
                    className="flex-shrink-0 w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex space-x-3">
                      <img
                        src={feedback.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(feedback.name || 'User')}&background=ccc&color=000`}
                        alt="User"
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {feedback.name || 'Anonymous'}
                          </h3>
                          <div className="flex items-center text-yellow-500 text-xs ml-2">
                            <Star className="w-3 h-3 fill-yellow-500" />
                            <span className="ml-1">{feedback.rating || '-'}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                          {feedback.description}
                        </p>
                        <div className="text-xs text-gray-500 truncate">
                          Campaign: {feedback.campaign || '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Scroll Indicators */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none flex justify-between px-2">
              <div className="w-8 h-full bg-gradient-to-r from-gray-50 to-transparent"></div>
              <div className="w-8 h-full bg-gradient-to-l from-gray-50 to-transparent"></div>
            </div>
          </div>
          
          {/* Scroll hint */}
          <div className="text-center mt-2">
            <p className="text-sm text-gray-500">← Scroll horizontally to view all feedback →</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback1;
