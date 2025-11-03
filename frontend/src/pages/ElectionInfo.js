import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import '../css/electioninfo.css';
import { UsaStates } from 'usa-states';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

function ElectionInfo() {
  const [selectedState, setSelectedState] = useState(null);
  const usStates = new UsaStates().states;

  const handleSelect = (state) => {
    setSelectedState(state);
  };

  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <div className="election-info">
      <header className="topbar">
        <h1>Election Information by State</h1>
        <p className="description">Find important dates, deadlines, and information about elections in your state</p>
      </header>

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

        <div>
          <Box>
            <TabContext value={value}>
              <Box className="election-tabs">
                <TabList onChange={handleChange}>
                  <Tab label="Upcoming Elections" value="1" />
                  <Tab label="Ballot Measures" value="2" />
                  <Tab label="Voting Options" value="3" />
                </TabList>
              </Box>

              <Paper className="election-card" elevation={0}>
                <Typography className="election-title">
                  {value === '1'
                    ? 'Upcoming Elections'
                    : value === '2'
                    ? 'Ballot Measures'
                    : 'Voting Options'}
                </Typography>

                <TabPanel value="1" className={value === '1' ? 'Mui-selected' : ''}>
                </TabPanel>

                <TabPanel value="2" className={value === '2' ? 'Mui-selected' : ''}>
                </TabPanel>

                <TabPanel value="3" className={value === '3' ? 'Mui-selected' : ''}>
                </TabPanel>
              </Paper>
            </TabContext>
          </Box>
        </div>
      </div>

    </div>
  );
}
export default ElectionInfo;