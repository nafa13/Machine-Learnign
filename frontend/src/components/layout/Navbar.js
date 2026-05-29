"use client";

import React from 'react';

export default function Navbar() {
  return (
    <nav className="dashboard-navbar">
      <div className="navbar-brand">
        <span className="brand-logo">🔮</span>
        <h1 className="brand-title">NEXUS</h1>
      </div>
      
      <div className="navbar-actions">
        <div className="nav-item">
          <span className="nav-icon">🔔</span>
          <span className="notification-dot"></span>
        </div>
      </div>
    </nav>
  );
}
