const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();

const mongoUri = process.env.MONGO_SRV;
const client = new MongoClient(mongoUri);

async function connectDb() {
  await client.connect();
  const db = client.db("ULTAAIInterviewer");
  const applicationFormsCollection = db.collection("applicationForms");
  return { db, applicationFormsCollection };
}

app.use(express.json());

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
    const { applicationFormsCollection } = await connectDb();

    const document = {
      applicationName,
      formUrl,
      formId: formUrl.split("/d/")[1].split("/edit")[0],
      applicationFormReqs,
      interviewQuestionReqs,
      reportReqs,
      reportTemplate,
    };

    const result = await applicationFormsCollection.insertOne(document);

    res.status(200).json({
      message: "Data approved and stored successfully!",
      id: result.insertedId,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to approve and store data.", error });
  }
});

module.exports = app;
