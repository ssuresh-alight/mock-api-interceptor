const express = require("express");
const fs = require("fs");

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
  console.log("================");
  next();
});

// Routes

/**
 * @type {Object.<string, Object>} Map of METHOD_URL to Response Objects
 */
const mockData = {};

app.post("/create-mock", (req, res) => {
  const { url, method, response } = req.body;
  if (!url || !method || !response) {
    return res
      .status(400)
      .json({ message: "'url', 'method' and 'response' are required" });
  }

  if (
    method !== "GET" &&
    method !== "POST" &&
    method !== "PUT" &&
    method !== "PATCH" &&
    method !== "DELETE"
  ) {
    return res.status(400).json({
      message:
        "Invalid method. Only GET, POST, PUT, PATCH and DELETE are allowed",
    });
  }

  getData();
  mockData[`${method}_${url.toLowerCase()}`] = JSON.parse(response);
  writeData();

  return res.json({
    message: `Mock for [${method}] ${url} created/updated successfully`,
  });
});

app
  .get("**", anyRouteHandler)
  .post("**", anyRouteHandler)
  .put("**", anyRouteHandler)
  .patch("**", anyRouteHandler)
  .delete("**", anyRouteHandler);

function anyRouteHandler(req, res) {
  const { method, url } = req;
  const key = `${method}_${url.toLowerCase()}`;

  getData();
  if (mockData[key]) {
    return res.json(mockData[key]);
  }

  res.status(404).json({ message: "Mock API: Route not found" });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function writeData() {
  fs.writeFile("./data/data.json", JSON.stringify(mockData, null, 2), (err) => {
    if (err) {
      console.error(err);
    }
  });
}

function getData() {
  fs.readFile("./data/data.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    try {
      const parsedData = JSON.parse(data);
      Object.assign(mockData, parsedData);
    } catch (err) {
      console.error(err);
    }
  });
}
