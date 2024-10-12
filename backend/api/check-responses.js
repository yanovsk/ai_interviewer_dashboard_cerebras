const express = require("express");
const { MongoClient } = require("mongodb");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

const app = express();

const mongoUri = process.env.MONGO_SRV;
const client = new MongoClient(mongoUri);

async function connectDb() {
  await client.connect();
  const db = client.db("ULTAAIInterviewer");
  const applicationFormsCollection = db.collection("applicationForms");
  return { db, applicationFormsCollection };
}

app.get("/api/check-responses", async (req, res) => {
  try {
    const { applicationFormsCollection } = await connectDb();

    const formDocs = await applicationFormsCollection.find({}).toArray();

    // Example check logic
    res.status(200).json({ message: "Checked for responses." });
  } catch (error) {
    res.status(500).json({ message: "Failed to check responses.", error });
  }
});

module.exports = app;
