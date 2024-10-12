// ApprovedJobListingsTable.js
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Link, 
  Typography, 
  Box 
} from '@mui/material';

const ApprovedJobListingsTable = ({ jobListings }) => {
  return (
    <Box sx={{ padding: '32px' }}>
      <Typography variant="h4" sx={{ marginBottom: '24px' }}>Approved Job Listings</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="job listings table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Link</TableCell>
              <TableCell align="right">Number of People Filled</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobListings.map((job, index) => (
              <TableRow key={index}>
                <TableCell>{job.name}</TableCell>
                <TableCell>
                  <Link href={job.link} target="_blank" rel="noopener noreferrer">
                    Google Form Link
                  </Link>
                </TableCell>
                <TableCell align="right">{job.peopleFilled}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ApprovedJobListingsTable;