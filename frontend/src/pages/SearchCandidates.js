import { useState } from "react";
import { useRecentActivity } from '../context/RecentActivityContext';
import { FiSearch, FiFilter } from "react-icons/fi";
import "../css/searchcandidates.css";

function SearchCandidates() {
  const [candidateQuery, setCandidateQuery] = useState("");
  const [candidateResults, setCandidateResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Autocomplete state
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const { addActivity } = useRecentActivity();

  const handleSearchCandidates = async () => {
    if (!candidateQuery.trim()) {
      setError("Please enter a candidate name or office");
      return;
    }

    setLoading(true);
    setError(null);
    setCandidateResults(null);

    try {
      const params = new URLSearchParams({ query: candidateQuery.trim() });
      const response = await fetch(`http://localhost:8000/api/search-candidates/?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to search candidates");
      }

      const data = await response.json();
      console.log("Candidate search response:", data);
      setCandidateResults(data);
      // only record activity when there are results
      try {
        const count = data.count || (data.candidates && data.candidates.length) || 0;
        if (count > 0) {
          addActivity({
            type: 'search',
            action: 'search_candidates',
            label: candidateQuery.trim(),
            description: `Searched candidates "${candidateQuery.trim()}" — found ${count} candidate${count!==1? 's':''}${data.totalRaces? ` across ${data.totalRaces} race${data.totalRaces!==1? 's':''}`: ''}`,
            meta: { count, totalRaces: data.totalRaces }
          });
        }
      } catch (e) {
        // ignore context errors
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchCandidates();
      setShowAutocomplete(false);
    }
  };

  const handleCandidateInputChange = async (e) => {
    const value = e.target.value;
    setCandidateQuery(value);

    // Fetch autocomplete suggestions if input length >= 2
    if (value.trim().length >= 2) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/autocomplete-candidates/?prefix=${encodeURIComponent(value.trim())}`
        );
        if (response.ok) {
          const data = await response.json();
          setAutocompleteSuggestions(data.suggestions || []);
          setShowAutocomplete(data.suggestions && data.suggestions.length > 0);
        }
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    } else {
      setShowAutocomplete(false);
      setAutocompleteSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion) => {
    setCandidateQuery(suggestion);
    setShowAutocomplete(false);
    setAutocompleteSuggestions([]);
  };

  return (
    <div className="search-candidates">
      <header><h2>Search Candidates</h2></header>
      
      <div className="candidate-search" style={{ position: 'relative' }}>
        <FiSearch />
        <input 
          type="text" 
          placeholder="Search candidates by name or office" 
          value={candidateQuery}
          onChange={handleCandidateInputChange}
          onKeyPress={handleCandidateKeyPress}
          onFocus={() => {
            if (autocompleteSuggestions.length > 0) setShowAutocomplete(true);
          }}
        />
        <button 
          type="submit" 
          className="search-button"
          onClick={handleSearchCandidates}
          disabled={loading}
        >
          {loading ? "Searching..." : <FiSearch />}
        </button>
        <button type="button" className="filter-button">
          <FiFilter className="filter-icon" />
        </button>
        
        {/* Autocomplete Dropdown */}
        {showAutocomplete && autocompleteSuggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '30px',
            right: '120px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginTop: '5px'
          }}>
            {autocompleteSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                onClick={() => selectSuggestion(suggestion)}
                style={{
                  padding: '10px 15px',
                  cursor: 'pointer',
                  borderBottom: idx < autocompleteSuggestions.length - 1 ? '1px solid #eee' : 'none',
                  backgroundColor: 'white',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Display errors */}
      {error && (
        <div className="error-message" style={{ color: 'red', padding: '10px', margin: '10px 0', background: '#ffe6e6', borderRadius: '5px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Display candidate search results */}
      {candidateResults && (
        <div className="candidate-results" style={{ padding: '20px', margin: '20px 0' }}>
          <h3>Search Results</h3>
          {candidateResults.count > 0 && (
            <p style={{ color: '#666', marginBottom: '15px' }}>
              Found {candidateResults.count} candidates
              {candidateResults.totalRaces && ` across ${candidateResults.totalRaces} races`}
              {candidateResults.source === 'database' && <span style={{ color: '#28a745', marginLeft: '10px' }}>• From database</span>}
            </p>
          )}
          {candidateResults.candidates && candidateResults.candidates.length > 0 ? (
            <div className="results-grid" style={{ display: 'grid', gap: '15px' }}>
              {candidateResults.candidates.map((candidate, idx) => (
                <div key={idx} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{candidate.name}</h4>
                  <div style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                    <p style={{ margin: '5px 0' }}><strong>Party:</strong> {candidate.party || 'No party listed'}</p>
                    <p style={{ margin: '5px 0' }}><strong>Race:</strong> {candidate.office || 'N/A'}</p>
                    {candidate.election && <p style={{ margin: '5px 0' }}><strong>Election:</strong> {candidate.election}</p>}
                    {candidate.electionDate && (
                      <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(candidate.electionDate).toLocaleDateString()}</p>
                    )}
                    {candidate.state && (
                      <p style={{ margin: '5px 0' }}><strong>State:</strong> {candidate.state}</p>
                    )}
                    {candidate.district && (
                      <p style={{ margin: '5px 0' }}><strong>District:</strong> {candidate.district}</p>
                    )}
                    {candidate.votes !== undefined && candidate.votes !== null && (
                      <p style={{ margin: '5px 0' }}>
                        <strong>Results:</strong> {candidate.votes.toLocaleString()} votes ({candidate.percent}%)
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontStyle: 'italic', color: '#666' }}>No candidates found matching "{candidateQuery}"</p>
          )}
        </div>
      )}
    </div>
  )
}
export default SearchCandidates;