
import React, { useState } from 'react';
const createSampleFile = (name, type) => new File([""], name, { type });
const filterOptions = ['Shopping Frequency', 'Customer Value', 'Product Preference'];
const segmentOptions = {
  'Shopping Frequency': ['New Customers', 'Loyal Customers', 'Lapsed Customers', 'Seasonal Customers'],
  'Customer Value': ['High value customers', 'Low value customers'],
  'Product Preference': ['Women', 'Men', 'Kids', 'Family']
};
const initialForm = {
  title: 'Summer Sale Campaign',
  description: 'Special summer discounts for our valued customers',
  startDate: '2025-09-10',
  endDate: '2025-09-20',
  selectedFilters: ['Shopping Frequency'],
  customerSegment: 'Loyal Customers',
  emailSubject: '🌟 Exclusive Summer Sale - Up to 50% Off!',
  emailContent: `Dear Valued Customer,\n\nWe're excited to bring you our exclusive Summer Sale! 🌞\n\nEnjoy incredible discounts of up to 50% off on our latest collection. As one of our loyal customers, you get early access to:\n\n• Premium Fashion Items\n• Summer Accessories\n• Limited Edition Products\n\nShop now and make the most of these amazing offers!\n\nBest regards,\nFashion Store Team`,
  smsContent: `Fashion Store: Summer is here! 🌞 Get up to 50% off in our exclusive sale. Early access for loyal customers starts now. Shop at fashionstore.com/sale`,
  templateName: 'Summer Sale Template',
  attachments: [
    createSampleFile('summer_catalog.pdf', 'application/pdf'),
    createSampleFile('discount_voucher.pdf', 'application/pdf'),
    createSampleFile('product_highlights.jpg', 'image/jpeg')
  ]
};
const CampaignCreationt = () => {
  const [formData, setFormData] = useState(initialForm);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [showSMSPreview, setShowSMSPreview] = useState(false);
  const update = (name, value) => setFormData(f => ({ ...f, [name]: value }));
  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'attachments') update('attachments', [...formData.attachments, ...Array.from(files)]);
    else update(name, value);
  };
  const handleFileUpload = e => update('attachments', [...formData.attachments, ...Array.from(e.target.files)]);
  const removeAttachment = i => update('attachments', formData.attachments.filter((_, idx) => idx !== i));
  const handleDrop = e => { e.preventDefault(); update('attachments', [...formData.attachments, ...Array.from(e.dataTransfer.files)]); };
  const handleDragOver = e => e.preventDefault();
  const handleSubmit = e => { e.preventDefault(); };
  const renderAttachments = (cb) => formData.attachments.length > 0 && (
    <ul className="space-y-2">{formData.attachments.map((file, i) => cb(file, i))}</ul>
  );
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Create New Campaign</h1>
          <p className="text-gray-600">Define your campaign's core details, target audience, and content to engage your customers effectively.</p>
        </div>
        <div className="flex items-center gap-2" />
      </div>
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="font-semibold mb-2">Tips for Effective Campaigns</h2>
        <p className="text-gray-600">Personalize your message, use a clear call to action, and segment your audience for better results.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          {[['title', 'Campaign Title', 'text'], ['description', 'Description', 'textarea']].map(([n, l, t]) => (
            <div className="mb-4" key={n}>
              <label htmlFor={n} className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
              {t === 'textarea' ? (
                <textarea id={n} name={n} value={formData[n]} onChange={handleChange} rows={4} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              ) : (
                <input type={t} id={n} name={n} value={formData[n]} onChange={handleChange} placeholder={`Enter ${l.toLowerCase()}`} className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              )}
            </div>
          ))}
        </div>
        {/* Targeting Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Targeting</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              {['startDate', 'endDate'].map(n => (
                <div key={n}>
                  <label htmlFor={n} className="block text-sm font-medium text-gray-700 mb-1">{n === 'startDate' ? 'Start Date' : 'End Date'}</label>
                  <input type="date" id={n} name={n} value={formData[n]} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filters</label>
              <div className="space-y-2 border border-gray-300 rounded p-3">
                {filterOptions.map(filter => (
                  <div key={filter} className="flex items-center">
                    <input type="checkbox" id={`filter-${filter}`} name="filters" value={filter} checked={formData.selectedFilters?.includes(filter)}
                      onChange={e => {
                        const v = e.target.value;
                        update('selectedFilters', e.target.checked ? [...(formData.selectedFilters || []), v] : (formData.selectedFilters || []).filter(f => f !== v));
                      }} className="h-4 w-4 text-blue-600 rounded border-gray-300" />
                    <label htmlFor={`filter-${filter}`} className="ml-2 text-sm text-gray-700">{filter}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="customerSegment" className="block text-sm font-medium text-gray-700 mb-1">Customer Segment</label>
              <select id="customerSegment" name="customerSegment" value={formData.customerSegment} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" disabled={!formData.selectedFilters?.length}>
                <option value="">Select a segment</option>
                {formData.selectedFilters?.map(filter => segmentOptions[filter]?.map(segment => (
                  <option key={`${filter}-${segment}`} value={segment}>{segment} ({filter})</option>
                )))}
              </select>
            </div>
          </div>
        </div>
        {/* Content Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Content</h2>
          <div className="space-y-4">
            {[['emailSubject', 'Subject', 'text'], ['emailContent', 'Email Content', 'textarea'], ['smsContent', 'SMS Content', 'textarea']].map(([n, l, t]) => (
              <div key={n}>
                <label htmlFor={n} className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                {t === 'textarea' ? (
                  <textarea id={n} name={n} value={formData[n]} onChange={handleChange} rows={4} className="w-full p-2 border border-gray-300 rounded" />
                ) : (
                  <input type={t} id={n} name={n} value={formData[n]} onChange={handleChange} placeholder={`Enter ${l.toLowerCase()}`} className="w-full p-2 border border-gray-300 rounded" />
                )}
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center" onDrop={handleDrop} onDragOver={handleDragOver}>
                <p className="text-gray-600 mb-2">Drag and drop files here or browse</p>
                <p className="text-sm text-gray-500">Supported formats: PDF, DOCX, JPG, PNG. Max file size: 10MB</p>
                <input type="file" id="fileInput" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.jpg,.jpeg,.png" />
                <button type="button" className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200" onClick={() => document.getElementById('fileInput').click()}>Browse Files</button>
              </div>
              {renderAttachments((file, i) => (
                <li key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <button type="button" onClick={() => removeAttachment(i)} className="text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setShowEmailPreview(true)} className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded shadow-sm">Preview Email</button>
              <button type="button" onClick={() => setShowSMSPreview(true)} className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded shadow-sm">Preview SMS</button>
            </div>
          </div>
        </div>
        {/* Email Preview Modal */}
        {showEmailPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Email Preview</h3>
                  <button onClick={() => setShowEmailPreview(false)} className="text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="mb-4"><p className="text-sm text-gray-600">Subject:</p><p className="font-medium">{formData.emailSubject}</p></div>
                  <div className="mb-4"><p className="text-sm text-gray-600">Content:</p><div className="whitespace-pre-wrap">{formData.emailContent}</div></div>
                  {renderAttachments((file, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                      </svg>
                      {file.name}
                    </li>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* SMS Preview Modal */}
        {showSMSPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">SMS Preview</h3>
                  <button onClick={() => setShowSMSPreview(false)} className="text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-800 whitespace-pre-wrap">{formData.smsContent}</p>
                    {renderAttachments((file, i) => (
                      <li key={i} className="text-sm text-blue-600">{file.name}</li>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Save Template Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <label htmlFor="templateName" className="text-sm font-medium text-gray-700">Save as Template</label>
            <input type="text" id="templateName" name="templateName" value={formData.templateName} onChange={handleChange} placeholder="Enter Template Name" className="flex-1 p-2 border border-gray-300 rounded" />
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button type="button" className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Delete</button>
          <button type="button" className="px-4 py-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100">Save as Draft</button>
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Submit for Approval</button>
        </div>
      </form>
    </div>
  );
};
export default CampaignCreationt;
