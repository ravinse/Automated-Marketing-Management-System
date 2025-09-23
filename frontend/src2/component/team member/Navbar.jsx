import { Bell } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Brand */}
        <div className="flex items-center">
          <div className="w-6 h-6 bg-black rounded-sm mr-3"></div>
          <h1 className="text-lg font-semibold text-gray-900">May Fashion</h1>
        </div>
        
        {/* Right side - Icons */}
        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Profile Avatar */}
          <button className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-gray-300 transition-all">
            <img 
              src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=100&q=80" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </nav>
  );
}