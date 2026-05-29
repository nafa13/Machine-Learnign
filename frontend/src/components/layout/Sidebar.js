"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: '🏠', href: '/' },
    { name: 'Metode', icon: '🧠', href: '/metode' },
    { name: 'Model Evaluation', icon: '📊', href: '/metode#eval' },
    { name: 'Dataset Hub', icon: '📂', href: '/metode#data' },
    { name: 'API Docs', icon: '📖', href: '/metode#docs' },
    { name: 'Settings', icon: '⚙️', href: '/metode#settings' },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header" style={{ padding: '1rem' }}>
        {/* Removed System Online indicator */}
      </div>
      
      <div className="sidebar-menu">
        <div className="menu-label">CORE MODULES</div>
        {menuItems.map((item, index) => {
          // Cek apakah item aktif berdasarkan pathname
          // Khusus dashboard (/) harus exact match, yang lain bisa startsWith
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href.split('#')[0]);
          
          return (
            <Link 
              href={item.href} 
              key={index} 
              style={{ textDecoration: 'none' }}
            >
              <div className={`menu-item ${isActive ? 'active' : ''}`}>
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-name">{item.name}</span>
                {isActive && <div className="active-glow"></div>}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="server-info">
          <div>Python Backend</div>
          <div style={{ color: 'var(--success)' }}>Connected v1.0.4</div>
        </div>
      </div>
    </aside>
  );
}
