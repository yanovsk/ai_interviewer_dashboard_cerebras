const express = require("express");
const cors = require("cors");
const { MongoClient, GridFSBucket, ServerApiVersion } = require("mongodb");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const {
  generateGoogleFormJSON,
  generateInterviewQuestionsJSON,
  generateReportTemplate,
} = require("./openaiService"); // Import the functions from openaiService.js

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use((req, res, next) => {
  req.requestTime = Date.now(); // Store the start time
  next();
});

const mongoUri = process.env.MONGO_SRV;
if (!mongoUri) {
  throw new Error("Please add the MongoDB connection SRV as 'MONGO_SRV'");
}

const client = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const DB_NAME = "ULTAAIInterviewer";
let db;
let applicationFormsCollection;

async function connectDb() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    db = client.db(DB_NAME);
    bucket = new GridFSBucket(db, { bucketName: "files" });
    applicationFormsCollection = db.collection("applicationForms");
    console.log("Connected to MongoDB and collections initialized!");
  } catch (e) {
    console.error("MongoDB Connection failed:", e);
  }
}

connectDb();

app.post("/api/submit-requirements", async (req, res) => {
  const startTime = Date.now();
  const { applicationFormReqs, interviewQuestionReqs, reportReqs } = req.body;

  try {
    const auth = new GoogleAuth({
      keyFile: "creds.json",
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
});

app.post("/api/approve-requirements", async (req, res) => {
  const {
    applicationName,
    formUrl,
    reportTemplate,
    applicationFormReqs,
    interviewQuestionReqs,
    reportReqs,
  } = req.body;

  try {
    const document = {
      applicationName: applicationName,
      formUrl: formUrl,
      formId: formUrl.split("/d/")[1].split("/edit")[0],
      applicationFormReqs: applicationFormReqs,
      interviewQuestionReqs: interviewQuestionReqs,
      reportReqs: reportReqs,
      reportTemplate: reportTemplate,
    };

    const result = await applicationFormsCollection.insertOne(document);
    console.log("Document inserted with _id:", result.insertedId);

    res.status(200).json({ message: "Data approved and stored successfully!" });
  } catch (error) {
    console.error("Error processing approval:", error);
    res
      .status(500)
      .json({ message: "Failed to approve and store data.", error });
  }
});

async function getFormResponses(formId) {
  const auth = new GoogleAuth({
    keyFile: "creds.json",
    scopes: [
      "https://www.googleapis.com/auth/forms.responses.readonly",
      "https://www.googleapis.com/auth/forms.body.readonly",
    ],
  });

  const forms = google.forms({ version: "v1", auth });

  const [formMetadata, responses] = await Promise.all([
    forms.forms.get({ formId: formId }),
    forms.forms.responses.list({ formId: formId }),
  ]);

  const questionMap = {};
  formMetadata.data.items.forEach((item) => {
    if (item.questionItem && item.questionItem.question) {
      questionMap[item.questionItem.question.questionId] = item.title;
    }
  });

  const formResponses = responses.data.responses || [];

  return formResponses.map((response) => ({
    responseId: response.responseId,
    submittedTime: response.createTime,
    answers: Object.entries(response.answers || {}).reduce(
      (acc, [questionId, answer]) => {
        const questionTitle = questionMap[questionId] || questionId;
        acc[questionTitle] = answer.textAnswers.answers
          .map((a) => a.value)
          .join(", ");
        return acc;
      },
      {}
    ),
  }));
}

async function updateFormResponses(formId, newResponses) {
  try {
    const formResponseDoc = await applicationFormsCollection.findOne({
      formId: formId,
    });

    if (!formResponseDoc) {
      console.error(`No document found for formId: ${formId}`);
      return;
    }

    const existingResponses = formResponseDoc.responses || {};
    const newResponsesToProcess = newResponses.filter(
      (response) => !existingResponses[response.responseId]
    );

    const emailPromises = [];

    for (const response of newResponsesToProcess) {
      const email = response.answers.Email;

      // Store the full response data
      existingResponses[response.responseId] = {
        submittedTime: response.submittedTime,
        answers: response.answers,
        processed: false,
      };

      if (email) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Your Unique Code to Join the Meeting",
          text: `Here is your unique code to join the meeting: ${response.responseId}`,
        };

        // Send emails in parallel
        emailPromises.push(
          transporter
            .sendMail(mailOptions)
            .then(() => {
              console.log(
                `Email sent to ${email} for responseId: ${response.responseId}`
              );
              existingResponses[response.responseId].emailSent = true;
            })
            .catch((error) => {
              console.error(`Failed to send email to ${email}:`, error);
              existingResponses[response.responseId].emailSent = false;
            })
        );
      } else {
        console.error(`No email found for responseId: ${response.responseId}`);
        existingResponses[response.responseId].emailSent = false;
      }
    }

    await Promise.all(emailPromises);

    // Update the document in MongoDB with the new responses
    await applicationFormsCollection.updateOne(
      { formId: formId },
      { $set: { responses: existingResponses } }
    );

    console.log(`Updated responses for formId: ${formId}`);
  } catch (error) {
    console.error(`Error updating responses for formId ${formId}:`, error);
  }
}

async function checkForNewResponses() {
  try {
    const formDocs = await applicationFormsCollection.find({}).toArray();

    await Promise.all(
      formDocs.map(async (formDoc) => {
        const formId = formDoc.formId;
        try {
          const responses = await getFormResponses(formId);
          await updateFormResponses(formId, responses);
        } catch (error) {
          console.error(
            `Error checking responses for formId ${formId}:`,
            error
          );
        }
      })
    );
  } catch (error) {
    console.error("Error fetching form documents:", error);
  }
}

// Start the periodic check
setInterval(checkForNewResponses, 30000);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
