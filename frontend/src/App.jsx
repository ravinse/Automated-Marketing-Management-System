import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login/Login";
import Register from "./Login/Register";
import Forgotpass from "./Login/Forgotpass";
import Changepass from "./Login/Changepass";
import Checkmail from "./Login/Checkmail";
import Changesucc from "./Login/NewPass";
import NewPass from "./Login/NewPass";

// Dashboard
import Campaign from './Marketingmanager/Campaign';
import CampaignView from './Marketingmanager/Campaignview';
import Campaignreview from './Marketingmanager/Campaignreview';
import Performanceoverview from './Marketingmanager/Performanceoverview';

import Performance_dashboardm from './Marketingmanager/Perfomance_dashboardm';
import Feedback1 from './Marketingmanager/Feedback1';
import Templete from './Marketingmanager/Templete';
import AdminDashboard from './admin/AdminDashboard';
import CreatecampaingM from './Marketingmanager/createcampaingM';

import PendingApproval from './Tables/PendingApproval';

// Team Member
import Home from './team member/Home';
import FeedbackT from "./team member/FeedbackT";
import TemplateT from "./team member/TemplateT";
import CreatecampaingT from "./team member/createcampaingT";

// Owner
import OwnerDash from './owner/homepage/OwnerDash';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpass" element={<Forgotpass />} />
        <Route path="/changepass" element={<Changepass />} />
        <Route path="/checkmail" element={<Checkmail />} />
        <Route path="/changesucc" element={<Changesucc />} />

        {/* Dashboard Routes */}
        <Route path="/Campaign" element={<Campaign/>} /> 
        <Route path="/campaignview" element={<CampaignView/>} />
        <Route path="/campaignreview" element={<Campaignreview/>} />
        <Route path="/performanceoverview" element={<Performanceoverview/>} />
        <Route path="/thome" element={<Home/>} />

        
        {/* <Route path="/Homeoverview" element={<Homeo/>} /> */}
        
        {/* <Route path="/AHome" element={<AHome/>} /> */}
        {/* <Route path="/Campaign_management" element={<Campaign_management/>}/> */}
        <Route path="/performance" element={<Performance_dashboardm />} />
        <Route path="/Feedback" element={<Feedback1 />} />
        <Route path="/Template" element={<Templete />} />
        {/* <Route path ="/EditCampaignCreation" element={<EditCampaignCreation/>}/> */}
        <Route path="/Homeowner" element={<OwnerDash />} />
        <Route path="/reset-password/:token" element={<NewPass />} />
        <Route path="/ahome" element={<AdminDashboard />} />
        <Route path="/feedbackT" element={<FeedbackT />} />
        <Route path="/templatet" element={<TemplateT />} />
        <Route path="/createcampaingt" element={<CreatecampaingT />} />
        <Route path="/createcampaingm" element={<CreatecampaingM />} />
        <Route path="/pendingapproval" element={<PendingApproval />} />

      </Routes>
    </div>
  );
}

export default App;
