import React from 'react';
import OwnerNavbar from './homepage/OwnerNavbar';

const CampaignOverview = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <OwnerNavbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Performance Overview</h1>
        <p className="text-gray-600 mb-6">Analyze the effectiveness of your recent campaign with detailed metrics and insights.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-gray-900 font-semibold mb-2">Campaign Details</div>
            <div className="text-sm text-gray-600">Campaign Name</div>
            <div className="text-gray-900 font-medium mb-4">Summer Sale 2024</div>
            <div className="text-sm text-gray-600">Content</div>
            <div className="text-gray-900">Email with promotional offers and new product announcements</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-sm text-gray-600">Target Audience</div>
            <div className="text-gray-900 font-medium mb-4">Loyal Customers</div>
            <div className="text-sm text-gray-600">Key Metrics</div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {[['Open Rate','25%','+2%'],['Click-Through Rate','12%','-1%'],['Conversion Rate','5%','+0.5%'],['Audience Engagement','80%','+3%']]
                .map(([t,v,delta],i)=> (
                  <div key={i} className="border rounded-lg p-3">
                    <div className="text-gray-600 text-sm">{t}</div>
                    <div className="text-xl font-semibold text-gray-900">{v}</div>
                    <div className={`text-sm ${delta.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>{delta}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['Open Rate Trend','Click-Through Rate Trend'].map((title, idx)=> (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-gray-900 font-semibold mb-2">{title}</div>
              <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 text-sm">
                Trend chart placeholder
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CampaignOverview;
