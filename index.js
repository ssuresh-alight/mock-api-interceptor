const express = require("express");

const PORT = 5000;
const app = express();

// Middlewarez
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to log url, header, body:
app.use((req, res, next) => {
  console.log("Request:", `${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.get("**", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
