import { useState, useEffect } from "react";
import { FiMapPin, FiSearch, FiUser, FiCalendar } from "react-icons/fi";
import { useRecentActivity } from '../context/RecentActivityContext';
import RecentActivity from '../components/RecentActivity';
import StatsChart from '../components/StatsChart';
import "../css/home.css";

function Home() {
  const [address, setAddress] = useState("");
  const [voterInfo, setVoterInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [electionId, setElectionId] = useState(null);
  
  // Election type search state
  const [electionTypeQuery, setElectionTypeQuery] = useState("");
  const [electionTypeResults, setElectionTypeResults] = useState(null);
  const [electionTypeLoading, setElectionTypeLoading] = useState(false);
  const [electionTypeError, setElectionTypeError] = useState(null);
  const { addActivity } = useRecentActivity();

  // Fetch the default election ID when component mounts
  useEffect(() => {
    async function fetchDefaultElection() {
      try {
        const response = await fetch("http://localhost:8000/api/elections/");
        if (response.ok) {
          const data = await response.json();
          if (data.elections && data.elections.length > 0) {
            // Try to find a non-test election first
            const realElection = data.elections.find(e => !e.name.toLowerCase().includes('test'));
            const selectedElection = realElection || data.elections[0];
            
            setElectionId(selectedElection.id);
            console.log("Auto-selected election:", selectedElection.name, "ID:", selectedElection.id);
            
            // Warn if it's a test election
            if (selectedElection.name.toLowerCase().includes('test')) {
              console.warn("⚠️ Using test election - real election data may not be available");
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch elections:", err);
      }
    }
    fetchDefaultElection();
  }, []);

  const handleSearchElections = async () => {
    if (!address.trim()) {
      setError("Please enter an address");
      return;
    }

    setLoading(true);
    setError(null);
    setVoterInfo(null);

    try {
      const params = new URLSearchParams({ address: address.trim() });
      
      // Add the election ID if we have one
      if (electionId) {
        params.set("electionId", electionId);
      }
      
      const response = await fetch(`http://localhost:8000/api/voterinfo/?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch voter information");
      }

      const data = await response.json();
      console.log("Voter info response:", data); // Debug: see what we're getting
      setVoterInfo(data);
      // record recent activity only when there are results
      try {
        const contestsCount = data.contests ? data.contests.length : 0;
        const pollingCount = data.pollingLocations ? data.pollingLocations.length : 0;
        const resultCount = contestsCount + pollingCount;
        if (resultCount > 0) {
          addActivity({
            type: 'search',
            action: 'search_address',
            label: address.trim(),
            description: `Searched address "${address.trim()}" — found ${contestsCount} contest${contestsCount!==1? 's':''}${pollingCount? ` and ${pollingCount} polling location${pollingCount!==1? 's':''}`: ''}`,
            meta: { electionId: electionId || null, contests: contestsCount, pollingLocations: pollingCount }
          });
        }
      } catch (e) { /* ignore */ }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchElections();
    }
  };

  const handleSearchElectionType = async () => {
    if (!electionTypeQuery.trim()) {
      setElectionTypeError("Please enter an election type (e.g., president, mayor, senate)");
      return;
    }

    setElectionTypeLoading(true);
    setElectionTypeError(null);
    setElectionTypeResults(null);

    try {
      const params = new URLSearchParams({ query: electionTypeQuery.trim() });
      const response = await fetch(`http://localhost:8000/api/search-races/?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to search elections");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      console.log("Election type search response:", data);
      setElectionTypeResults({
        count: data.count || 0,
        races: data.races || [],
      });
      // record recent activity only if results were found
      try {
        const c = data.count || 0;
        if (c > 0) {
          addActivity({
            type: 'search',
            action: 'search_election_type',
            label: electionTypeQuery.trim(),
            description: `Searched election type "${electionTypeQuery.trim()}" — found ${c} race${c!==1? 's':''}`,
            meta: { resultCount: c }
          });
        }
      } catch (e) {}
    } catch (err) {
      setElectionTypeError(err.message);
    } finally {
      setElectionTypeLoading(false);
    }
  };

  const handleElectionTypeKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchElectionType();
    }
  };

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
          <FiCalendar />
          <input 
            type="text" 
            placeholder="Search by election type (e.g., president, mayor, senate)" 
            value={electionTypeQuery}
            onChange={(e) => setElectionTypeQuery(e.target.value)}
            onKeyPress={handleElectionTypeKeyPress}
          />
          <button onClick={handleSearchElectionType} disabled={electionTypeLoading}>
            {electionTypeLoading ? "Searching..." : "Search"}
          </button>
        </div>
        {/* <div className="election-info-search">
          <FiMapPin />
          <input 
            type="text" 
            placeholder="Enter your address" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSearchElections} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div> */}
        {/* <div className="registration-info-search">
          <FiUser />
          <input type="text" placeholder="Search User" />
        </div> */}
      </div>

      {/* Display election type search errors */}
      {electionTypeError && (
        <div className="error-message" style={{ color: 'red', padding: '10px', margin: '10px 0', background: '#ffe6e6', borderRadius: '5px' }}>
          <strong>Election Type Search Error:</strong> {electionTypeError}
        </div>
      )}

      {/* Display election type search results */}
      {electionTypeResults && (
        <div className="election-type-results" style={{ padding: '20px', margin: '20px 0', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Election Races for "{electionTypeQuery}"</h3>
          {electionTypeResults.count > 0 && (
            <p style={{ color: '#666', marginBottom: '15px' }}>
              Found {electionTypeResults.count} races
            </p>
          )}
          {electionTypeResults.races && electionTypeResults.races.length > 0 ? (
            <div>
              {electionTypeResults.races.map((race, idx) => (
                <div key={idx} style={{ marginBottom: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
                  <h4>{race.name}</h4>
                  {race.election && race.election.name && (
                    <p><strong>Election:</strong> {race.election.name}</p>
                  )}
                  {race.election && race.election.date && (
                    <p><strong>Date:</strong> {new Date(race.election.date).toLocaleDateString()}</p>
                  )}
                  {race.election && race.election.type && (
                    <p><strong>Type:</strong> {race.election.type}</p>
                  )}
                  {race.state && (
                    <p><strong>State:</strong> {race.state}</p>
                  )}
                  {race.district && (
                    <p><strong>District:</strong> {race.district}</p>
                  )}
                  {race.candidates_count !== undefined && (
                    <p><strong>Number of Candidates:</strong> {race.candidates_count}</p>
                  )}
                  {race.candidates && race.candidates.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <p style={{ marginBottom: '8px' }}><strong>Candidates:</strong></p>
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {race.candidates.map((candidate, cIdx) => (
                          <li key={cIdx} style={{ marginBottom: '6px' }}>
                            <span style={{ fontWeight: '600' }}>{candidate.name || 'Unnamed Candidate'}</span>
                            {candidate.party && (
                              <span style={{ marginLeft: '6px', color: '#555' }}>({candidate.party})</span>
                            )}
                            {(candidate.votes !== undefined && candidate.votes !== null) || (candidate.percent !== undefined && candidate.percent !== null) ? (
                              <span style={{ marginLeft: '10px', color: '#666' }}>
                                {candidate.votes !== undefined && candidate.votes !== null && (
                                  <span>
                                    {typeof candidate.votes === 'number' ? candidate.votes.toLocaleString() : candidate.votes} votes
                                  </span>
                                )}
                                {candidate.percent !== undefined && candidate.percent !== null && (
                                  <span>{candidate.votes !== undefined && candidate.votes !== null ? ' • ' : ''}{candidate.percent}%</span>
                                )}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontStyle: 'italic' }}>No races found for "{electionTypeQuery}"</p>
          )}
        </div>
      )}

      {/* Display errors */}
      {error && (
        <div className="error-message" style={{ color: 'red', padding: '10px', margin: '10px 0' }}>
          Error: {error}
        </div>
      )}

      {/* Display voter info results */}
      {voterInfo && (
        <div className="voter-info-results" style={{ padding: '20px', margin: '20px 0', border: '1px solid #ccc' }}>
          <h3>Voter Information</h3>
          
          {/* Show raw data for debugging if nothing else shows */}
          {!voterInfo.election && !voterInfo.contests && (
            <div style={{ background: '#f0f0f0', padding: '10px', marginTop: '10px' }}>
              <p><strong>Debug - Raw Response:</strong></p>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {JSON.stringify(voterInfo, null, 2)}
              </pre>
            </div>
          )}
          
          {voterInfo.election && (
            <div style={{ marginBottom: '15px' }}>
              <h4>{voterInfo.election.name}</h4>
              <p>Election Day: {voterInfo.election.electionDay}</p>
            </div>
          )}
          
          {voterInfo.contests && voterInfo.contests.length > 0 ? (
            <div>
              <h4>Contests & Candidates:</h4>
              {voterInfo.contests.map((contest, idx) => (
                <div key={idx} style={{ marginBottom: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
                  <h5 style={{ marginTop: 0 }}>{contest.office || 'Unknown Office'}</h5>
                  {contest.candidates && contest.candidates.length > 0 ? (
                    contest.candidates.map((candidate, cIdx) => (
                      <div key={cIdx} style={{ marginLeft: '20px', marginBottom: '10px' }}>
                        <p style={{ margin: '5px 0' }}>
                          <strong>{candidate.name}</strong> ({candidate.party || 'No party listed'})
                        </p>
                        {candidate.candidateUrl && (
                          <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <a href={candidate.candidateUrl} target="_blank" rel="noopener noreferrer">
                              Campaign Website
                            </a>
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ marginLeft: '20px', fontStyle: 'italic' }}>No candidates listed for this contest</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            voterInfo.election && <p style={{ fontStyle: 'italic' }}>No contest information available for this address.</p>
          )}
          
          {voterInfo.pollingLocations && voterInfo.pollingLocations.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4>Polling Locations:</h4>
              {voterInfo.pollingLocations.map((location, idx) => (
                <div key={idx} style={{ marginLeft: '20px' }}>
                  <p>{location.address.locationName}</p>
                  <p>{location.address.line1}, {location.address.city}, {location.address.state} {location.address.zip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
            <div className="election-card">
              <FiCalendar />
              <h4>Presidential Election</h4>
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
            <StatsChart days={14} />
          </div>
        </div>
      </div>

      <div className="home-section-2">
        <div className="header">
          <h3>Recent Activity</h3>
          <p className="description">Your latest civic engagement actions</p>
        </div>
        <RecentActivity limit={8} />
      </div>
     
    </div>
  )
}
export default Home;