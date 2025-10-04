import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Navbarm from "./Navbarm";

// API Configuration - Use the same backend as Team Member feedback
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ search: '', campaign: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 4; // items per page

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchFeedbacks(currentPage, filters);
  }, [currentPage, filters]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/feedback/overview`);
      if (!res.ok) throw new Error('Failed to load overview');
      const data = await res.json();
      setOverview({
        averageRating: data.averageRating || 0,
        totalReviews: data.totalReviews || 0,
        distribution: data.distribution || []
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching overview:', err);
      setError('Failed to load feedback overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async (page = 1, { search = '', campaign = '' } = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ 
        page: page.toString(), 
        limit: limit.toString() 
      });
      if (search) params.set('search', search);
      if (campaign) params.set('campaign', campaign);
      
      const res = await fetch(`${API_URL}/feedback?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load feedbacks');
      
      const data = await res.json();
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
      <Navbarm />

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
      </div>
    </div>
  );
};

export default Feedback1;
