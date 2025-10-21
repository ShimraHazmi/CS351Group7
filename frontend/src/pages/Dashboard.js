import React, { useState, useEffect, useRef} from "react";
import { FiHome, FiMapPin, FiSearch, FiUser, FiInfo, FiPhoneCall, FiLogOut, FiFilter, FiCalendar } from "react-icons/fi";
import "../dashboard.css"; // your styling (shared stylesheet in src/)
export const Dashboard = () => {
  const [active, setActive] = useState("home");
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="web-logo">
          <h2>CivicConnect</h2>
        </div>
        <nav>
          <NavItem icon={<FiHome />} label="Home" isActive ={active === "home"} onClick={() => setActive("home")}/>
          <NavItem icon={<FiSearch />} label="Search Candidates" isActive ={active === "search"} onClick={() => setActive("search")}/>
          <NavItem icon={<FiMapPin />} label="Election Info" isActive ={active === "election-info"} onClick={() => setActive("election-info")}/>
          <NavItem icon={<FiUser />} label="Registration Info" isActive ={active === "registration-info"} onClick={() => setActive("registration-info")}/>
          <NavItem icon={<FiInfo />} label="About Us" isActive ={active === "about-us"} onClick={() => setActive("about-us")}/>
          <NavItem icon={<FiPhoneCall />} label="Contact Us" isActive ={active === "contact-us"} onClick={() => setActive("contact-us")}/>

        </nav>
        <div className="spacer"></div>
        <button className="logout">
          <FiLogOut />
          <span>Log Out</span>
        </button>
      </aside>

      <main className="main">

        <section className="content">
          {active === "home" && <Home />}
          {active === "search" && <SearchCandidates />}
          {active === "election-info" && <ElectionInfo />}
          {active === "registration-info" && <RegistrationInfo />}
          {active === "about-us" && <AboutUs />}
          {active === "contact-us" && <ContactUs />}
        </section>
      </main>
    </div>
  );
};

function Home() {
  return (
    <div className="home-page">
      <header className="topbar">
        <h1>Welcome to CivicConnect!</h1>
        <p>Your central hub for civic engagement and democratic participation</p>
        <h2>Quick Actions</h2>
        
      </header>
      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="candidate-search">
          <FiSearch />
          <input icon type="text" placeholder="Search candidates" />
        </div>
        <div className="election-info-search">
          <FiMapPin />
          <input icon type="text" placeholder="Search elections" />
        </div>
        <div className="registration-info-search">
          <FiUser />
          <input icon type="text" placeholder="Search User" />
        </div>
      </div>

      <div className="home-section-1">
        {/* Upcoming Elections */}
        <div className="upcoming-elections">
          <div className="header">
            <h3>Upcoming Elections</h3>
            <p className="description">Important dates you should know</p>
          </div>

          <div className="content">
            <div className="election-card">
              <FiCalendar />
              <h4>City Council Election</h4>
            </div>
            <div className="election-card">
              <FiCalendar />
              <h4>School Board Election</h4>
            </div>
          </div>
        </div>

        {/* Engagement stats */}
        <div className="engagement-stats">
          <div className="header">
            <h3>Civic Engagement Stats</h3>
            <p className="description">Your impact on the community</p>
          </div>

          <div className="content">
            <h4>Polls Participated</h4>
            <h4>Issues Voted On</h4>
            <h4>Representatives Contacted</h4>
          </div>
        </div>
      </div>

      <div className="home-section-2">
        <div className="header">
          <h3>Recent Activity</h3>
          <p className="description">Your latest civic engagement actions</p>
        </div>
      </div>
     
    </div>
  )
}

function SearchCandidates() {
  return (
    <div className="search-candidates">
      <header><h2>Search Candidates</h2></header>
      <div className="candidate-search">
        <FiSearch />
        <input icon type="text" placeholder="Search candidates" />
        <button type="submit" className="filter-button">
          <FiFilter className="filter-icon" />
        </button>
      </div>
    </div>
  )
}

function ElectionInfo() {
  return (
    <div className="election-info">
      <h2>Election Info</h2>
    </div>
  );
}

function RegistrationInfo() {
  return (
    <div className="registration-info">
      <h2>Registration Info</h2>
    </div>
  );
}

function AboutUs() {
  return (
    <div className="about-us">
      <h2>About Us</h2>
    </div>
  );
}

function ContactUs() {
  return (
    <div className="contact-us">
      <h2>Contact Us</h2>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <div
      className={`nav-item ${isActive ? "active" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </div>
  );
}


export default Dashboard;