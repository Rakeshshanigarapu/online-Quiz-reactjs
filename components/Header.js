// src/components/Header.js
import React from 'react';

const Header = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-house' },
    { id: 'create', label: 'Create Quiz', icon: 'bi-plus-circle' },
    { id: 'results', label: 'Results', icon: 'bi-bar-chart' }
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <a className="navbar-brand" href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}>
          <i className="bi bi-question-circle me-2"></i>
          QuizMaster Pro
        </a>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {navItems.map(item => (
              <li key={item.id} className="nav-item">
                <a 
                  className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
                >
                  <i className={`bi ${item.icon} me-1`}></i>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          
          <div className="navbar-text">
            <small>All question types | LocalStorage | React + Bootstrap</small>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;