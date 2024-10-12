const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const {
  generateGoogleFormJSON,
  generateInterviewQuestionsJSON,
  generateReportTemplate,
} = require("../services/openaiService");

module.exports = async (req, res) => {
  console.log("env", process.env.GOOGLE_KEY, process.env.EMAIL_USER);

  // Set CORS headers to allow requests from your frontend
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://ulta-hr-dashboard.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  console.log("Received request to submit requirements");
  const startTime = Date.now();
  const { applicationFormReqs, interviewQuestionReqs, reportReqs } = req.body;

  try {
    const auth = new GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_KEY),
      scopes: [
        "https://www.googleapis.com/auth/forms.body",
        "https://www.googleapis.com/auth/drive",
      ],
    });

    // Run all GPT calls and form creation in parallel using Promise.all
    const [batchUpdateRequest, interviewQuestionsJSON, report, formResponse] =
      await Promise.all([
        generateGoogleFormJSON(applicationFormReqs),
        generateInterviewQuestionsJSON(interviewQuestionReqs),
        generateReportTemplate(reportReqs),
        google.forms({ version: "v1", auth }).forms.create({
          requestBody: {
            info: { title: "Application Form Requirements" },
          },
        }),
      ]);

    const formId = formResponse.data.formId;
    const formUrl = `https://docs.google.com/forms/d/${formId}/edit`;

    // Update the form in parallel
    await google.forms({ version: "v1", auth }).forms.batchUpdate({
      formId: formId,
      requestBody: batchUpdateRequest,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Request processed successfully in ${duration} ms`);

    res.status(200).json({
      message: "Requirements processed successfully",
      formUrl: formUrl,
      formId: formId,
      interviewQuestions: interviewQuestionsJSON,
      reportTemplate: report,
      duration: `${duration} ms`,
    });
  } catch (error) {
    console.error("Error processing requirements:", error);
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Failed to process requirements in ${duration} ms`);

    res.status(500).json({
      message: "Failed to process requirements",
      error,
      duration: `${duration} ms`,
    });
  }
};
