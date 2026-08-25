/**
 * Top navigation bar — dynamic page title.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { HiOutlineBell, HiOutlineSearch } from 'react-icons/hi';
import { HiOutlineBars3 } from 'react-icons/hi2';
import './TopNav.css';

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Supply chain overview' },
  '/shipments': { title: 'Shipments', subtitle: 'Manage shipments' },
  '/shipments/add': { title: 'Add Shipment', subtitle: 'Create a new record' },
  '/prediction': { title: 'Prediction & Recs', subtitle: 'ML delay prediction' },
  '/analytics': { title: 'Analytics', subtitle: 'Closed-loop insights' },
  '/decisions': { title: 'Decision History', subtitle: 'Past actions & outcomes' },
  '/settings': { title: 'Settings', subtitle: 'Preferences' },
};

const TopNav = ({ onMenuToggle }) => {
  const location = useLocation();
  const path = location.pathname;

  // Match exact path first, then check if it starts with /shipments/edit
  const pageInfo = pageTitles[path]
    || (path.startsWith('/shipments/edit') ? { title: 'Edit Shipment', subtitle: 'Update shipment details' } : pageTitles['/']);

  return (
    <header className="topnav" id="topnav">
      <div className="topnav-left">
        <button
          className="topnav-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar menu"
          id="menu-toggle-btn"
        >
          <HiOutlineBars3 />
        </button>
        <div className="topnav-title">
          <h1>{pageInfo.title}</h1>
          <p className="topnav-subtitle">{pageInfo.subtitle}</p>
        </div>
      </div>

      <div className="topnav-right">
        <div className="topnav-search" id="topnav-search">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search…"
            className="search-input"
            id="search-input"
          />
        </div>

        <button className="topnav-icon-btn" aria-label="Notifications" id="notifications-btn">
          <HiOutlineBell />
          <span className="notification-badge">3</span>
        </button>

        <div className="topnav-avatar" id="user-avatar">
          <span className="avatar-initials">RP</span>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
