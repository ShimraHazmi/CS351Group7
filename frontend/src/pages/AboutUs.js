import "../css/aboutus.css";
import { FiTarget } from "react-icons/fi";

function AboutUs() {
  return (
    <div className="about-us">
      <header className="topbar">
        <h1>About CivicConnect</h1>
        <p className="description">Empowering citizens to participate in democracy</p>
      </header>

      <div className="image-banner">
        <div className="overlay-text">
          <h2>Democracy Thrives When Everyone Participates</h2>
          <p>CivicConnect is dedicated to making civic engagement accessible, transparent, and impactful for all citizens.</p>
        </div>
      </div>

      <div className="mission-vision">
        <div className="mission-section">
          <div className="section-header">
            <div className="icon-box"><FiTarget /></div>
            <h3>Our Mission</h3>
          </div>
          <p>To create a more informed and engaged citizenry by providing accessible tools and resources 
            that connect people with their representatives, election information, and opportunities to participate in the democratic process.</p>

        </div>

        <div className="vision-section">
          <div className="section-header">
            <div className="icon-box"><FiTarget /></div>
            <h3>Our Vision</h3>
          </div>
          <p>A future where every citizen has the knowledge, tools, and confidence to actively participate in shaping their communities and government. </p>
        </div>
      </div>
      

      <div className="story-section">
        <h3>Our Story</h3>
        <p>CivicConnect was founded in 2025 by a group of civic-minded technologists who recognized a critical gap in how citizens engage with their government.</p>
        <p>We saw that while information about elections, representatives, and civic participation existed, it was often scattered, difficult to navigate, and not accessible to everyone. We set out to change that.</p>
        <p>Today, CivicConnect provides users with the tools and information they need to be informed, engaged citizens. We've helped countless people register to vote, connect with their representatives, and participate in their communities.
        Our work is guided by the belief that democracy works best when everyone participates. We're committed to breaking down barriers to civic engagement and ensuring that every citizen has the opportunity to make their voice heard.</p>
      </div>
    </div>
  )
}

export default AboutUs;

