import React from 'react';
import OwnerNavbar from './homepage/OwnerNavbar';

const StrategicDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <OwnerNavbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Strategic Dashboard</h1>
        <p className="text-gray-600 mb-6">Overview of your business performance and strategic actions</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[['Total Revenue','$120,500','+10%'],['Customer Growth','+15%','+5%'],['Customer Loyalty','85%','+2%']]
            .map(([title,val,delta], idx)=> (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-gray-500 text-sm">{title}</div>
                <div className="text-3xl font-bold text-gray-900">{val}</div>
                <div className="text-green-600 text-sm">{delta}</div>
              </div>
            ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="text-gray-900 font-semibold mb-4">Running Campaigns</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  {['Campaign Name','Revenue','Engagement','Status'].map((h,i)=> (
                    <th key={i} className="px-6 py-3 text-sm font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {[['Campaign B','$25,000','25%','Active'],['Campaign A','$20,000','20%','Active'],['Campaign D','$15,000','18%','Active'],['Campaign C','$10,000','15%','Paused'],['Campaign E','$5,000','12%','Completed']]
                .map((row, i)=> (
                  <tr key={i} className="hover:bg-gray-50">
                    {row.map((c,j)=> (<td key={j} className="px-6 py-3 text-sm text-gray-800">{c}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-gray-900 font-semibold mb-2">Customer Loyalty Trends</div>
          <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 text-sm">
            Trend chart placeholder
          </div>
        </div>
      </div>
    </div>
  );
}

export default StrategicDashboard;
