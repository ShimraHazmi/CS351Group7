import { FiSearch, FiFilter } from "react-icons/fi";
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
export default SearchCandidates;