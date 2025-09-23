import { useState } from "react";

// Functional component for managing content creation and preview
export default function ContentSection() {
  const [contentType, setContentType] = useState(""); // State to track the selected content type (Email or SMS)
  const [subject, setSubject] = useState(""); // State for the subject input field (used for both Email and SMS)
  const [emailContent, setEmailContent] = useState(""); // State for email content input
  const [smsContent, setSmsContent] = useState("");   // State for SMS content input
  const [showPreview, setShowPreview] = useState(false);   // State to control visibility of the preview modal
  const [previewType, setPreviewType] = useState("Email");   // State to determine whether to preview Email or SMS in the modal

  // Mock data for received emails (static array for demonstration)
  const [receivedEmails] = useState([
    { id: 1, subject: "Welcome to May Fashion", content: "Thank you for joining us! Explore our latest collection...", date: "2025-08-15" },
    { id: 2, subject: "Summer Sale Alert", content: "Don't miss our amazing summer discounts up to 50% off...", date: "2025-08-14" },
    { id: 3, subject: "New Arrivals", content: "Check out our latest fashion trends for this season...", date: "2025-08-13" }
  ]);

  // Mock data for received SMS messages (static array for demonstration)
  const [receivedSMS] = useState([
    { id: 1, content: "Welcome to May Fashion! Use code WELCOME10 for 10% off your first order.", date: "2025-08-15" },
    { id: 2, content: "Flash Sale: 50% off selected items. Valid until midnight. Shop now!", date: "2025-08-14" },
    { id: 3, content: "Your order #12345 has been shipped. Track: bit.ly/track12345", date: "2025-08-13" }
  ]);

  // Handler for form submission
  const handleSubmit = () => {
    // Log the submitted content based on content type
    if (contentType === "Email") {
      console.log("Email submitted:", { subject, content: emailContent });
    } else if (contentType === "SMS") {
      console.log("SMS submitted:", { subject, content: smsContent });
    }
    // Reset form fields after submission
    setSubject("");
    setEmailContent("");
    setSmsContent("");
    // Show success alert
    alert(`${contentType} content submitted successfully!`);
  };

  // Handler to close the preview modal
  const closePreview = () => {
    setShowPreview(false);
  };

  return (
    // Main container with white background and padding
    <div className="bg-white p-6">
      {/* Header for the content section */}
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Content</h2>
      
      {/* Content Type Selection Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type of Content
        </label>
        <div className="flex gap-6">
          {/* Radio button for selecting Email content type */}
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="contentType"
              value="Email"
              checked={contentType === "Email"}
              onChange={(e) => setContentType(e.target.value)}
              className="mr-2 text-blue-600"
            />
            <span className="text-sm text-gray-700">Email Content</span>
          </label>
          {/* Radio button for selecting SMS content type */}
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="contentType"
              value="SMS"
              checked={contentType === "SMS"}
              onChange={(e) => setContentType(e.target.value)}
              className="mr-2 text-blue-600"
            />
            <span className="text-sm text-gray-700">SMS Content</span>
          </label>
        </div>
      </div>

      {/* Content Input Form - Conditionally rendered when a content type is selected */}
      {contentType && (
        // Reduced width of the form container using max-w-md (448px)
        <div className="space-y-4 max-w-lg p-4">
          <h3 className="text-md font-medium text-gray-800 mb-4">{contentType} Content</h3>
          
          {/* Subject Input Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              placeholder={`Enter ${contentType.toLowerCase()} subject`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Content Input Field (Textarea) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              placeholder={`Enter ${contentType.toLowerCase()} content`}
              value={contentType === "Email" ? emailContent : smsContent}
              onChange={(e) => {
                // Update appropriate state based on content type
                if (contentType === "Email") {
                  setEmailContent(e.target.value);
                } else {
                  setSmsContent(e.target.value);
                }
              }}
              // Adjust textarea height based on content type (Email: 4 rows, SMS: 3 rows)
              rows={contentType === "Email" ? 4 : 3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
            {/* Display character count for SMS content */}
            {contentType === "SMS" && (
              <div className="text-xs text-gray-500 mt-1">
                Character count: {smsContent.length}/160
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
          >
            Submit {contentType}
          </button>
        </div>
      )}

      {/* Preview Buttons - Always visible for toggling Email/SMS previews */}
      <div className="flex gap-3 mb-6">
        <button 
          onClick={() => {
            setPreviewType("Email");
            setShowPreview(true);
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
        >
          Preview Email
        </button>
        <button 
          onClick={() => {
            setPreviewType("SMS");
            setShowPreview(true);
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
        >
          Preview SMS
        </button>
      </div>

      {/* Preview Modal - Displays when showPreview is true */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Received {previewType}s
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            {/* Modal Content - Displays received emails or SMS based on previewType */}
            <div className="space-y-4">
              {previewType === "Email" ? (
                // Render email previews
                receivedEmails.map((email) => (
                  <div key={email.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{email.subject}</h4>
                      <span className="text-xs text-gray-500">{email.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{email.content}</p>
                  </div>
                ))
              ) : (
                // Render SMS previews
                receivedSMS.map((sms) => (
                  <div key={sms.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-500">{sms.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{sms.content}</p>
                    <div className="text-xs text-gray-400 mt-2">
                      {sms.content.length} characters
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Modal Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={closePreview}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}