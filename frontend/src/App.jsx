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
import AdminDashboard from "./admin/admindashboard";
import MarketingMDash from "./manager/MarketingMDash";
import OwnerDash from "./owner/homepage/OwnerDash";
import TeamMDash from "./team member/TeamMOverview/Home";

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
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/manager" element={<MarketingMDash />} />
        <Route path="/owner" element={<OwnerDash />} />
        <Route path="/team" element={<TeamMDash />} />
        <Route path="/reset-password/:token" element={<NewPass />} />

      </Routes>
    </div>
  );
}

export default App;
