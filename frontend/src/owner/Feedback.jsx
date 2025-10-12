import React from 'react';
import OwnerNavbar from './homepage/OwnerNavbar';

const Feedback = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <OwnerNavbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Feedback & Ratings</h1>
        <p className="text-gray-600 mb-6">Analyze customer feedback and ratings to improve your campaigns.</p>

        <div className="mb-6">
          <input placeholder="Search feedback" className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm md:col-span-1">
            <div className="text-5xl font-bold">4.5</div>
            <div className="text-gray-500">1250 reviews</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm md:col-span-2">
            <div className="space-y-3">
              {[40,30,15,10,5].map((pct, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 text-sm">{5 - i}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div style={{width: pct+'%'}} className="h-full bg-gray-700"></div></div>
                  <span className="w-10 text-right text-sm text-gray-600">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Feedback</h2>
        <div className="space-y-4">
          {[
            {name:'Great product!', sub:'The product quality exceeded my expectations. Will definitely recommend to friends.', when:'2 days ago'},
            {name:'Delivery was late', sub:'The delivery was delayed by a week, which was quite inconvenient.', when:'5 days ago'},
            {name:'Excellent customer service', sub:'The customer service was very helpful in resolving my issue.', when:'1 week ago'},
            {name:'Innovative design', sub:'The product is innovative and user-friendly. I love the design!', when:'2 weeks ago'},
          ].map((f, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm flex items-start justify-between">
              <div>
                <div className="font-medium text-gray-900">{f.name}</div>
                <div className="text-gray-600 text-sm">{f.sub}</div>
              </div>
              <div className="text-gray-500 text-sm">{f.when}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Feedback;
