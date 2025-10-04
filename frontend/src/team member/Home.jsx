import React, { useState } from 'react'
import Navbar from './Navbart';
import { FileText, Send, PlayCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Drafted from './Drafted';
import SentForApproval from './Sentapproval';
import Running from './Running';
import Finished from './Finished';

const Home = () => {
  const [activeSection, setActiveSection] = useState(null);

  const campaignStats = [
    {
      id: 'drafted',
      title: 'Drafted',
      count: 2,
      icon: FileText,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      description: 'Campaigns saved as draft'
    },
    {
      id: 'sentForApproval',
      title: 'Sent for Approval',
      count: 3,
      icon: Send,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      description: 'Pending manager approval'
    },
    {
      id: 'running',
      title: 'Running',
      count: 5,
      icon: PlayCircle,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
      description: 'Active campaigns'
    },
    {
      id: 'finished',
      title: 'Finished',
      count: 8,
      icon: CheckCircle2,
      color: 'bg-gray-500',
      lightColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      description: 'Completed campaigns'
    }
  ];

  const renderTable = () => {
    switch (activeSection) {
      case 'drafted':
        return <Drafted />;
      case 'sentForApproval':
        return <SentForApproval />;
      case 'running':
        return <Running />;
      case 'finished':
        return <Finished />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Campaign Dashboard</h1>
              <p className="text-gray-600">Manage and track all your marketing campaigns</p>
            </div>
            <Link to="/newcampaign">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                + New Campaign
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {campaignStats.map((stat) => {
            const Icon = stat.icon;
            const isActive = activeSection === stat.id;
            
            return (
              <div
                key={stat.id}
                onClick={() => setActiveSection(activeSection === stat.id ? null : stat.id)}
                className={`
                  bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer
                  transform hover:-translate-y-1 overflow-hidden
                  ${isActive ? 'ring-4 ring-blue-400 scale-105' : ''}
                `}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.lightColor} ${stat.textColor} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className={`${stat.color} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                      {stat.count}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{stat.title}</h3>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
                <div className={`h-1 ${isActive ? stat.color : 'bg-gray-100'} transition-all duration-300`}></div>
              </div>
            );
          })}
        </div>

        {/* Back Button */}
        {activeSection && (
          <button
            onClick={() => setActiveSection(null)}
            className="mb-4 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        )}

        {/* Table Section */}
        {activeSection ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn">
            {renderTable()}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Campaign Status</h3>
            <p className="text-gray-500">Click on any card above to view campaigns in that category</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home