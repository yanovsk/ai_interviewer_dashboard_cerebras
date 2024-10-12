import React, { useState } from "react";
import "./App.css";

import ApprovedJobListingsTable from "./approvedJobListingsTable.js";

import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ListIcon from "@mui/icons-material/List";
import CircularProgress from "@mui/material/CircularProgress";

function App() {
  const [formData, setFormData] = useState({
    applicationName: "",
    applicationFormReqs: "",
    interviewQuestionReqs: "",
    reportReqs: "",
  });

  const [formUrl, setFormUrl] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [reportTemplate, setReportTemplate] = useState({ categories: [] });
  const [approvalData, setApprovalData] = useState(null);
  const [title, setTitle] = useState("Job Listing");
  const [isFormButtonDisabled, setIsFormButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadJobListings = () => {
    const savedListings = localStorage.getItem("jobListings");
    return savedListings ? JSON.parse(savedListings) : [];
  };

  const [jobListings, setJobListings] = useState(loadJobListings());

  // Alerts states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const [isApproved, setIsApproved] = useState(false);

  const updateJobListings = (newListing) => {
    setJobListings((prevListings) => {
      const updatedListings = [...prevListings, newListing];
      saveJobListings(updatedListings);
      return updatedListings;
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Determine the API base URL based on the environment
  const getApiBaseUrl = () => {
    if (window.location.hostname === "localhost") {
      return "http://localhost:3001";
    } else {
      return "https://dash-be-dusky.vercel.app";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/submit-requirements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("from BE", data);
        setFormUrl(data.formUrl);
        setInterviewQuestions(data.interviewQuestions);
        setReportTemplate(data.reportTemplate);
        setApprovalData(data);

        // Enable the "View Google Form" button
        setIsFormButtonDisabled(false);

        // Update the title to match the application name after the API call
        setTitle(formData.applicationName);

        // Show success alert
        setAlertMessage("Requirements submitted successfully!");
        setAlertSeverity("success");
        setAlertOpen(true);
      } else {
        // Show error alert
        setAlertMessage("Failed to submit requirements.");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Error:", error);
      // Show error alert
      setAlertMessage("An error occurred while submitting requirements.");
      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/approve-requirements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...approvalData,
            applicationName: formData.applicationName,
            applicationFormReqs: formData.applicationFormReqs,
            interviewQuestionReqs: formData.interviewQuestionReqs,
            reportReqs: formData.reportReqs,
          }),
        }
      );

      if (response.ok) {
        const newJobListing = {
          name: formData.applicationName,
          link: formUrl,
          peopleFilled: 0, // Start with 0 people filled
        };

        updateJobListings(newJobListing);
        setIsApproved(true);
        setAlertMessage("Requirements approved and saved successfully!");
        setAlertSeverity("success");
        setAlertOpen(true);
      } else {
        setAlertMessage("An error occurred while approving requirements.");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setAlertMessage("An error occurred while approving requirements.");
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  };

  const saveJobListings = (listings) => {
    localStorage.setItem("jobListings", JSON.stringify(listings));
  };

  return (
    <div className="App">
      {isApproved ? (
        <ApprovedJobListingsTable jobListings={jobListings} />
      ) : (
        <Grid
          container
          spacing={2}
          sx={{
            height: "100vh",
            padding: "16px", // Adds a margin from the edge of the screen
            boxSizing: "border-box",
          }}
        >
          {/* First Column - 1/3 width */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              height: "100%", // Full height of the screen
              backgroundColor: "#e3f2fd", // Slight blue background
              borderRadius: "8px",
              padding: "16px", // Padding inside the box
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column", // Stack children vertically
              justifyContent: "stretch", // Ensure content fills height
            }}
          >
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <TextField
                name="applicationName"
                label="Application name"
                placeholder="Junior Software Engineer"
                value={formData.applicationName}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                margin="normal"
              />

              <TextField
                name="applicationFormReqs"
                label="Application Form Requirements"
                placeholder="Specify details required from applicants (e.g., resume, references)"
                value={formData.applicationFormReqs}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                margin="normal"
              />

              <TextField
                name="interviewQuestionReqs"
                label="Interview Question Requirements"
                placeholder="Enter required interview topics (e.g., problem-solving, teamwork"
                value={formData.interviewQuestionReqs}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                margin="normal"
              />

              <TextField
                name="reportReqs"
                label="Report Requirements"
                placeholder="List key report sections (e.g., statistics, recommendations)."
                value={formData.reportReqs}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                margin="normal"
              />
              <Button
                variant="outlined"
                color="primary"
                onClick={handleSubmit}
                sx={{ marginTop: "auto" }} // Pushes the button to the bottom
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ marginRight: "8px" }} />
                    Generating
                  </>
                ) : (
                  "Generate"
                )}
              </Button>
            </Box>
          </Grid>

          {/* Second Column - 2/3 width */}
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              height: "100%",
              padding: "16px",
              boxSizing: "border-box",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
              }}
            >
              <Typography variant="h4" component="h1">
                {title || "Job Listing"}
              </Typography>

              <Button
                variant="text"
                startIcon={<ListIcon />}
                href={formUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                disabled={isFormButtonDisabled}
              >
                View Google Form
              </Button>
            </Box>

            <Box
              sx={{ display: "flex", gap: "16px", height: "calc(100% - 80px)" }}
            >
              {/* Interview Questions Box */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Typography variant="h5">Interview Questions:</Typography>
                <List>
                  {interviewQuestions.length > 0 ? (
                    interviewQuestions.map((q, index) => (
                      <ListItem key={index}>
                        <Typography>
                          <strong>{`Question ${q.questionNumber}:`}</strong>{" "}
                          {q.question}
                        </Typography>
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <Typography>
                        Generate a job listing to see the questions
                      </Typography>
                    </ListItem>
                  )}
                </List>
              </Box>

              {/* Report Template Box */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Typography variant="h5">Report Template:</Typography>
                <List>
                  {reportTemplate.categories.length > 0 ? (
                    reportTemplate.categories.map((category, index) => (
                      <ListItem key={index}>
                        <Typography>
                          <strong>{category.category}:</strong>{" "}
                          {category.judging_criteria}
                        </Typography>
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <Typography>
                        Generate a job listing to see the report categories
                      </Typography>
                    </ListItem>
                  )}
                </List>
              </Box>
            </Box>

            {approvalData && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleApprove}
                sx={{
                  position: "fixed",
                  bottom: "16px",
                  right: "16px",
                  padding: "12px 24px",
                  zIndex: 1000,
                }}
              >
                Approve and Save
              </Button>
            )}
          </Grid>
        </Grid>
      )}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertSeverity}
          sx={{ width: "100vh" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
