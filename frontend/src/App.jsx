import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Campaign from './Marketingmanager/Campaign';
import CampaignView from './Marketingmanager/CampaignView';
import CampaignReview from './Marketingmanager/CampaignReview';
import PerformanceOverview from './Marketingmanager/PerformanceOverview';
import Home from './Teammember/Home';
import CampaignCreationTeam from './Teammember/NewCampaign/CampaignCreation';
import CampaignOverviewHome from './Teammember/CampaignOverview/CampaignOverviewHome';
import CampaignCreation from './Marketingmanager/CampaignCreation';
import AHome from './admin/AHome';
import CampaignManagement from './admin/CampaignManagement';
import PerformanceDashboard from './Marketingmanager/PerformanceDashboard';
import Feedback1 from './Marketingmanager/Feedback1.jsx';




const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/Campaign" element={<Campaign/>} /> 
        <Route path="/campaignview" element={<CampaignView/>} />
        <Route path="/campaignreview" element={<CampaignReview/>} />
        <Route path="/performanceoverview" element={<PerformanceOverview/>} />
        <Route path="/thome" element={<Home/>} />
        <Route path="/newcampaign" element={<CampaignCreationTeam/>} />
        <Route path="/Homeoverview" element={<CampaignOverviewHome/>} />
        <Route path="/campaigncreation" element={<CampaignCreation/>} />
        <Route path="/AHome" element={<AHome/>} />
        <Route path="/Campaign_management" element={<CampaignManagement/>}/>
        <Route path="/" element={<PerformanceDashboard />} />
        <Route path="/CampaignCreationt" element={<CampaignCreation />} />  
        <Route path="/Feedback" element={<Feedback1 />} />
      </Routes>
    </Router>
  );
};

export default App;
