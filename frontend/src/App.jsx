import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Campaign from './features/marketing-manager/Campaign';
import CampaignView from './features/marketing-manager/CampaignView';
import CampaignReview from './features/marketing-manager/CampaignReview';
import PerformanceOverview from './features/marketing-manager/PerformanceOverview';
import Home from './features/team-member/Home';
import CampaignCreationTeam from './features/team-member/NewCampaign/CampaignCreation';
import CampaignOverviewHome from './features/team-member/CampaignOverview/CampaignOverviewHome';
import CampaignCreation from './features/marketing-manager/CampaignCreation';
import AHome from './features/admin/AHome';
import CampaignManagement from './features/admin/CampaignManagement';
import PerformanceDashboard from './features/marketing-manager/PerformanceDashboard';
import Feedback1 from './features/marketing-manager/Feedback1.jsx';




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
