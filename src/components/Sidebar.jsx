import React, { useState } from 'react';
import { Home, Activity, FileText, Settings, HelpCircle, User } from 'lucide-react';
import './Sidebar.css';
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`sidebar ${expanded ? 'expanded' : ''}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="sidebar-logo">
        <span className="icon">📈</span>
        {expanded && <span className="logo-text">ECG Analysis</span>}
      </div>

      <nav className="sidebar-nav">
        <NavItem to="/" icon={<Home size={20} />} label="Dashboard" expanded={expanded} />
        <NavItem to="/acquisition" icon={<Activity size={20} />} label="ECG Analysis" expanded={expanded} />
        <NavItem to="/records" icon={<FileText size={20} />} label="Records" expanded={expanded} />
        <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" expanded={expanded} />
        <NavItem to="/help" icon={<HelpCircle size={20} />} label="Help" expanded={expanded} />
      </nav>

      <div className="sidebar-footer">
        <User size={20} />
        {expanded && <span className="footer-label">Account</span>}
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label, expanded }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `nav-item ${isActive ? "active" : ""}`
    }
  >
    {icon}
    {expanded && <span className="nav-label">{label}</span>}
  </NavLink>
);

export default Sidebar;