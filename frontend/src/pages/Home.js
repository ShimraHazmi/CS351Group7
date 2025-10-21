import { FiMapPin, FiSearch, FiUser, FiCalendar } from "react-icons/fi";
import "../css/home.css";
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
export default Home;