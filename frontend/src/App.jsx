import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Campaign from './Marketingmanager/Campaign';
import CampaignView from './Marketingmanager/Campaignview';
import Campaignreview from './Marketingmanager/Campaignreview';

import Performanceoverview from './Marketingmanager/Performanceoverview';
import Home from './Teammember/Home';
import Homen from './Teammember/newcampaing/CampaignCreationt';
import Homeo from './Teammember/Campaign Overview/Homeo';
import CampaignCreation from './Marketingmanager/CampaignCreation';
import AHome from './admin/AHome';
import Campaign_management from './admin/Campaign_management';
import Performance_dashboardm from './Marketingmanager/Perfomance_dashboardm';
import Feedback1 from './Marketingmanager/Feedback1.jsx';




const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/Campaign" element={<Campaign/>} /> 
        <Route path="/campaignview" element={<CampaignView/>} />
       <Route path="/campaignreview" element={<Campaignreview/>} />
       <Route path="/performanceoverview" element={<Performanceoverview/>} />
       <Route path="/thome" element={<Home/>} />
     <Route path="/newcampaign" element={<Homen/>} />
     <Route path="/Homeoverview" element={<Homeo/>} />
     <Route path="/campaigncreation" element={<CampaignCreation/>} />
     <Route path="/AHome" element={<AHome/>} />
    <Route path="/Campaign_management" element={<Campaign_management/>}/>
    <Route path="/" element={<Performance_dashboardm />} />
    <Route path="/CampaignCreationt" element={<CampaignCreation />} />  
  <Route path="/Feedback" element={<Feedback1 />} />
      </Routes>
    </Router>
  );
};

export default App;
