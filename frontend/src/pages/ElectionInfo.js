import React, { useState, useEffect } from 'react';
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
  const [electionDates, setElectionDates] = useState(null);
  const [datesLoading, setDatesLoading] = useState(false);
  const [datesError, setDatesError] = useState(null);
  const [selectedElectionDate, setSelectedElectionDate] = useState(null);
  const usStates = new UsaStates().states;

  const handleSelect = (state) => {
    setSelectedState(state);
  };

  useEffect(() => {
    if (!selectedState) {
      setElectionDates(null);
      setDatesError(null);
      setDatesLoading(false);
      setSelectedElectionDate(null);
      return;
    }

    const controller = new AbortController();

    const fetchElectionDates = async () => {
      setDatesLoading(true);
      setDatesError(null);
      setElectionDates(null);

      try {
        const params = new URLSearchParams({
          country: 'US',
          province: selectedState.abbreviation,
          year: new Date().getFullYear().toString(),
        });

        const response = await fetch(`http://localhost:8000/api/election-dates/?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch election dates');
        }

        const data = await response.json();
        if (!controller.signal.aborted) {
          setElectionDates(data);
          setSelectedElectionDate(null);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setDatesError(error.message || 'Unable to load election dates');
      } finally {
        if (!controller.signal.aborted) {
          setDatesLoading(false);
        }
      }
    };

    fetchElectionDates();

    return () => controller.abort();
  }, [selectedState]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) {
      return dateString;
    }
    return parsed.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const allElectionDates = electionDates?.months?.flatMap((month) =>
    (month.dates || []).map((date) => ({
      ...date,
      month: month.month,
      raceDetails: date.raceDetails || [],
    }))
  ) || [];

  const ballotMeasures = allElectionDates
    .flatMap((date) =>
      (date.raceDetails || []).map((detail) => ({
        id: detail.id || `${detail.name || 'unnamed'}-${date.date || 'unknown'}-${detail.district || 'nodistrict'}`,
        name: detail.name || 'Unnamed Election',
        type: detail.type || detail.electionType || 'Unknown type',
        electionType: detail.electionType,
        district: detail.district,
        province: detail.province,
        date: date.date,
        formattedDate: formatDate(date.date),
      }))
    )
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

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
                  {/* <Tab label="Voting Options" value="3" /> */}
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
                  {!selectedState ? (
                    <Typography variant="body2" color="text.secondary">
                      Select a state to view upcoming elections.
                    </Typography>
                  ) : datesLoading ? (
                    <Typography variant="body2" color="text.secondary">
                      Loading election dates...
                    </Typography>
                  ) : datesError ? (
                    <Typography variant="body2" color="error">
                      {datesError}
                    </Typography>
                  ) : allElectionDates.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No election dates available for {selectedState.name}.
                    </Typography>
                  ) : (
                    <div className="state-election-dates">
                      <p className="election-dates-summary">
                        Showing {electionDates.total_unique_dates} election date{electionDates.total_unique_dates === 1 ? '' : 's'}
                        {' '}in {selectedState.name} for {electionDates.year}
                      </p>

                      <Dropdown className="dates-dropdown">
                        <Dropdown.Toggle variant="outline-primary" id="dropdown-dates">
                          {selectedElectionDate
                            ? `${formatDate(selectedElectionDate.date)} • ${selectedElectionDate.count} races`
                            : 'Select Election Date'}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          {allElectionDates.map((dateOption) => (
                            <Dropdown.Item
                              key={dateOption.slug}
                              onClick={() => setSelectedElectionDate(dateOption)}
                            >
                              {formatDate(dateOption.date)} • {dateOption.count} races
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>

                      <div className="month-list">
                        {electionDates.months.map((month) => (
                          <div key={`${month.month}-${month.month_num}`} className="month-block">
                            <h4>{month.month}</h4>
                            <ul>
                              {(month.dates || []).map((date) => (
                                <li key={date.slug}>
                                  <span>{formatDate(date.date)}</span>
                                  <span style={{ color: '#666', marginLeft: '6px' }}>{date.count} races</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {selectedElectionDate && (
                        <div className="selected-date-details" style={{ marginTop: '20px' }}>
                          <Typography variant="subtitle1">
                            Selected Date Details
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(selectedElectionDate.date)} • {selectedElectionDate.count} races
                          </Typography>
                        </div>
                      )}
                    </div>
                  )}
                </TabPanel>

                <TabPanel value="2" className={value === '2' ? 'Mui-selected' : ''}>
                  {!selectedState ? (
                    <Typography variant="body2" color="text.secondary">
                      Select a state to view ballot measures.
                    </Typography>
                  ) : datesLoading ? (
                    <Typography variant="body2" color="text.secondary">
                      Loading ballot measures...
                    </Typography>
                  ) : datesError ? (
                    <Typography variant="body2" color="error">
                      {datesError}
                    </Typography>
                  ) : ballotMeasures.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No ballot measures available for {selectedState.name}.
                    </Typography>
                  ) : (
                    <div className="ballot-measure-list">
                      {ballotMeasures.map((measure) => (
                        <div key={measure.id} className="ballot-measure-card" style={{ marginBottom: '16px' }}>
                          <Typography variant="subtitle1" component="h4">
                            {measure.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {measure.formattedDate}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {measure.type}
                            {measure.electionType && measure.electionType !== measure.type ? ` • ${measure.electionType}` : ''}
                          </Typography>
                          {measure.district && (
                            <Typography variant="body2" color="text.secondary">
                              District: {measure.district}
                            </Typography>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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