import "../css/registrationinfo.css";
import React, { useState, useEffect, useRef } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { UsaStates } from 'usa-states';
import { FiCheckCircle, FiInfo } from 'react-icons/fi';

function RegistrationInfo() {
  const [selectedState, setSelectedState] = useState(null);
  const usStates = new UsaStates().states;

  const handleSelect = (state) => {
    setSelectedState(state);
  };

  return (
    <div className="registration-info">
      <header className="topbar">
        <h1>Registration Information by State</h1>
        <p className="description">Find important dates, deadlines, and information about elections in your state</p>
      </header>

      {/* Registration Information */}
      <div className="regis-info">
        {/* State Information */}
        <div className="state-card">
          <div className="header">
            <h3>Select Your State</h3>
            <p className="description">Choose your state to view election information specific to your location</p>
          </div>

          {/* Dropdown for State Selection */}
          <Dropdown className="state-dropdown">
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {selectedState ? selectedState.name : "Select State"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {usStates.map((state) => (
                <Dropdown.Item key={state.abbreviation} onClick={() => handleSelect(state)}>
                  {state.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Registration Requirements */}
        <div className="requirements-card">
          <div className="header">
            <h3>Registration Requirements</h3>
            <p className="description">Make sure you meet these requirements to register</p>
          </div>

          <div className="content">
            <div className="info-card">
              <FiCheckCircle />
              <div className="text">
                <h4>U.S. Citizen</h4>
                <p>You must be a citizen of the United States</p>
              </div>
            </div>

            <div className="info-card">
              <FiCheckCircle />
              <div className="text">
                <h4>18 Years Old</h4>
                <p>You must be at least 18 years old on or before Election Day (some states allow pre-registration at 16 or 17)</p>
              </div>
            </div>

            <div className="info-card">
              <FiCheckCircle />
              <div className="text">
                <h4>State Resident</h4>
                <p>You must be a resident of the state where you're registering</p>
              </div>
            </div>

            <div className="info-card">
              <FiInfo />
              <div className="text">
                <h4>Not Currently Serving a Felony Conviction</h4>
                <p>Requirements vary by state. Check your state's specific rules</p>
              </div>
            </div>
          </div>
        </div>

        {/* Required Documents */}
        <div className="documents-card">
          <div className="header">
            <h3>What You'll Need</h3>
            <p className="description">Documents required for registration</p>
          </div>

          <div className="content">
            <div className="info-card">
              <FiCheckCircle />
              <div className="text">
                <h4>Valid ID</h4>
                <p>Driver's license, state ID, or last 4 digits of SSN</p>
              </div>
            </div>
            <div className="info-card">
              <FiCheckCircle />
              <div className="text">
                <h4>Residential Address</h4>
                <p>Your current home address (P.O. Box not accepted)</p>
              </div>
            </div>
            <div className="info-card">
              <FiCheckCircle />
              <div className="text">
                <h4>Date Of Birth</h4>
                <p>Proof of age to confirm eligibility</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default RegistrationInfo;