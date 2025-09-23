import React from "react";
import { Search, Star } from "lucide-react";
import Navbar7 from "./Navbar7";



const Feedback = () => {
  const feedbacks = [
    {
      id: 1,
      name: "Jane Doe",
      avatar: "https://i.pravatar.cc/50?img=1",
      title: "Great product!",
      comment:
        "The product quality exceeded my expectations. Will definitely recommend to friends.",
      campaign: "Summer Sale",
      time: "2 days ago",
    },
    {
      id: 2,
      name: "John Smith",
      avatar: "https://i.pravatar.cc/50?img=2",
      title: "Delivery was late",
      comment:
        "The delivery was delayed by a week, which was quite inconvenient.",
      campaign: "Back to School",
      time: "5 days ago",
    },
    {
      id: 3,
      name: "Alice Johnson",
      avatar: "https://i.pravatar.cc/50?img=3",
      title: "Excellent customer service",
      comment: "The customer service was very helpful in resolving my issue.",
      campaign: "Holiday Promotion",
      time: "1 week ago",
    },
    {
      id: 4,
      name: "Michael Lee",
      avatar: "https://i.pravatar.cc/50?img=4",
      title: "Innovative design",
      comment:
        "The product is innovative and user-friendly. I love the design!",
      campaign: "New Product Launch",
      time: "2 weeks ago",
    },
  ];

  return (
    
    <section className="p-6">
      {/* Header */}
      <header><div><Navbar7 /></div>
        <h2 className="text-2xl font-bold mb-1">Feedback & Ratings</h2>
        <p className="text-gray-500 mb-6">
          Analyze customer feedback and ratings to improve your campaigns.
        </p>
      </header>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search feedback"
          aria-label="Search feedback"
          className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select className="border rounded-lg px-4 py-2 text-sm">
          <option>Date Range</option>
        </select>
        <select className="border rounded-lg px-4 py-2 text-sm">
          <option>Campaign Type</option>
        </select>
      </div>

      {/* Ratings Overview */}
      <div className="flex items-start gap-8 mb-8">
        <div className="text-center">
          <p className="text-4xl font-bold">4.5</p>
          <div className="flex justify-center mb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={`star-${i}`}
                className={`w-5 h-5 ${
                  i <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-gray-500 text-sm">1250 reviews</p>
        </div>

        {/* Distribution */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((rating, idx) => {
            const percentages = [40, 30, 15, 10, 5];
            return (
              <div key={`dist-${rating}`} className="flex items-center gap-3">
                <span className="w-4">{rating}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full"
                    style={{ width: `${percentages[idx]}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {percentages[idx]}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Feedback */}
      <h3 className="text-lg font-semibold mb-4">Recent Feedback</h3>
      <div className="space-y-6">
        {feedbacks.map((f) => (
          <div key={f.id} className="flex items-start gap-4 border-b pb-4">
            <img
              src={f.avatar}
              alt={f.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <p className="font-semibold">{f.title}</p>
              <p className="text-gray-600 text-sm">{f.comment}</p>
              <p className="text-gray-500 text-xs mt-1">
                Campaign: {f.campaign}
              </p>
            </div>
            <span className="text-gray-400 text-xs whitespace-nowrap">
              {f.time}
            </span>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <nav className="flex justify-center items-center gap-2 mt-6" aria-label="Pagination">
        <button className="text-gray-400 hover:text-black" aria-label="Previous page">
          {"<"}
        </button>
        <button className="px-3 py-1 border rounded-full bg-black text-white text-sm" aria-current="page">
          1
        </button>
        <button className="px-3 py-1 border rounded-full text-sm">2</button>
        <button className="px-3 py-1 border rounded-full text-sm">3</button>
        <span className="text-gray-500">...</span>
        <button className="px-3 py-1 border rounded-full text-sm">10</button>
        <button className="text-gray-400 hover:text-black" aria-label="Next page">
          {">"}
        </button>
      </nav>
    </section>
  );
};

export default Feedback;