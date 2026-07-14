const { onRequest } = require("firebase-functions/v2/https");
const { handleRequest } = require("./server");

exports.api = onRequest(
  { region: "us-central1", secrets: ["GROQ_API_KEY"] },
  handleRequest
);
