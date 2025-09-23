import React, { useState } from 'react';
import { Calendar, Users, Filter } from 'lucide-react';

const Targeting = () => {
  const [targetingMethod, setTargetingMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerSegment, setCustomerSegment] = useState('');
  const [filters, setFilters] = useState('');

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2" />
        Targeting
      </h3>
      
      <div className="space-y-4 max-w-lg" >
        <div>
          <label htmlFor="targetingMethod" className="block text-sm font-medium text-gray-700 mb-2">
            Targeting Method
          </label>
          <select
            id="targetingMethod"
            value={targetingMethod}
            onChange={(e) => setTargetingMethod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select targeting method</option>
            <option value="demographic">Demographic</option>
            <option value="behavioral">Behavioral</option>
            <option value="geographic">Geographic</option>
            <option value="psychographic">Psychographic</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="customerSegment" className="block text-sm font-medium text-gray-700 mb-2">
            Customer Segment
          </label>
          <select
            id="customerSegment"
            value={customerSegment}
            onChange={(e) => setCustomerSegment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select customer segment</option>
            <option value="new-customers">New Customers</option>
            <option value="returning-customers">Royal Customers</option>
            <option value="vip-customers">VIP Customers</option>
            <option value="inactive-customers">Inactive Customers</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="filters" className="flex text-sm font-medium text-gray-700 mb-2 items-center">
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </label>
          <input
            type="text"
            id="filters"
            value={filters}
            onChange={(e) => setFilters(e.target.value)}
            placeholder="Add filters..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default Targeting;