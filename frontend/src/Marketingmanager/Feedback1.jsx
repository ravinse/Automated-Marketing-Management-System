import React, { useState } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Navbarm from "./Navbarm";

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

// Feedback Item Component
const FeedbackItem = ({ feedback }) => {
  return (
    <div className="flex space-x-4">
      <img
        src={feedback.avatar}
        alt="User"
        className="w-12 h-12 rounded-full"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{feedback.name}</h3>
          <span className="text-sm text-gray-500">{feedback.timeAgo}</span>
        </div>
        <p className="text-gray-600 mb-2">{feedback.description}</p>
        <span className="text-sm text-gray-500">Campaign: {feedback.campaign}</span>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, onPageChange }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mt-8 pt-6 border-t border-gray-200">
      <button className="p-2 text-gray-400 hover:text-gray-600">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button className="px-3 py-2 text-sm font-medium bg-gray-900 text-white rounded-md">1</button>
      <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">2</button>
      <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">3</button>
      <span className="px-2 text-gray-500">...</span>
      <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">10</button>
      <button className="p-2 text-gray-600 hover:text-gray-800">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// Search and Filters Component
const SearchFilters = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search feedback"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <span>Date Range</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <span>Campaign Type</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Recent Feedback Component
const RecentFeedback = ({ feedbackData, currentPage, onPageChange }) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Feedback</h2>
      
      <div className="space-y-6">
        {feedbackData.map((feedback) => (
          <FeedbackItem key={feedback.id} feedback={feedback} />
        ))}
      </div>

      <Pagination currentPage={currentPage} onPageChange={onPageChange} />
    </div>
  );
};

// Main Dashboard Component
const FeedbackDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // Sample data
  const feedbackData = [
    {
      id: 1,
      name: "Great product!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      description: "The product quality exceeded my expectations. Will definitely recommend to friends.",
      campaign: "Summer Sale",
      timeAgo: "2 days ago"
    },
    {
      id: 2,
      name: "Delivery was late",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      description: "The delivery was delayed by a week, which was quite inconvenient.",
      campaign: "Back to School",
      timeAgo: "5 days ago"
    },
    {
      id: 3,
      name: "Excellent customer service",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      description: "The customer service was very helpful in resolving my issue.",
      campaign: "Holiday Promotion",
      timeAgo: "1 week ago"
    },
    {
      id: 4,
      name: "Innovative design",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      description: "The product is innovative and user-friendly. I love the design!",
      campaign: "New Product Launch",
      timeAgo: "2 weeks ago"
    }
  ];

  const ratingData = [
    { stars: 5, percentage: 40 },
    { stars: 4, percentage: 30 },
    { stars: 3, percentage: 15 },
    { stars: 2, percentage: 10 },
    { stars: 1, percentage: 5 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbarm/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback & Ratings</h1>
          <p className="text-gray-600">Analyze customer feedback and ratings to improve your campaigns.</p>
        </div>

        <SearchFilters />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <RatingOverview 
            rating={4.5} 
            totalReviews={1250} 
            ratingData={ratingData} 
          />
          
          <RecentFeedback 
            feedbackData={feedbackData}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default FeedbackDashboard;