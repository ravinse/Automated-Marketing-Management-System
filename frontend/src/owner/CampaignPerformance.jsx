import React from 'react';
import OwnerNavbar from './homepage/OwnerNavbar';

const CampaignPerformance = () => {
  const metrics = [
    ['Summer Sale', 'Active', 5000, '25%', '5%', 100],
    ['Back to School', 'Completed', 4500, '22%', '4%', 90],
    ['Holiday Promotion', 'Completed', 6000, '30%', '6%', 150],
    ['New Product Launch', 'Active', 3000, '20%', '3%', 60],
    ['Customer Appreciation', 'Completed', 4000, '28%', '5.5%', 110],
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <OwnerNavbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Performance</h1>
        <p className="text-gray-600 mb-6">Track the performance of your campaigns and optimize for better results.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[['Total Campaigns',25],['Active Campaigns',5],['Campaigns Completed',20]].map(([t,v],i)=> (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-gray-500 text-sm">{t}</div>
              <div className="text-3xl font-bold text-gray-900">{v}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {['Campaign Name','Status','Sent','Open Rate','Click-Through Rate','Conversions','']
                  .map((h, i)=> (<th key={i} className="px-6 py-3 text-sm font-medium">{h}</th>))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {metrics.map((row, i)=> (
                <tr key={i} className="hover:bg-gray-50">
                  {row.map((cell, j)=> (
                    <td key={j} className="px-6 py-4 text-sm text-gray-800">{cell}</td>
                  ))}
                  <td className="px-6 py-4 text-sm text-blue-600">View</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CampaignPerformance;
