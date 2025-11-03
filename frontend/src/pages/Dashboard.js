import { useState} from "react";
import { FiHome, FiMapPin, FiSearch, FiUser, FiInfo, FiPhoneCall, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../dashboard.css";
import Home from "./Home";
import SearchCandidates from "./SearchCandidates";
import ElectionInfo from "./ElectionInfo";
import RegistrationInfo from "./RegistrationInfo";
import AboutUs from "./AboutUs";
import ContactUs from "./ContactUs";

export const Dashboard = () => {
  const [active, setActive] = useState("home");
  const navigate = useNavigate();
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
        <button className="logout" onClick={() => navigate('/') }>
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