const express = require("express");
const fs = require("fs");
const notifier = require("node-notifier");

const PORT = 5000;
const DATA_FILE_PATH = "./data/data.json";
const app = express();

// Middlewarez
app.use(express.json({ limit: "16mb" }));
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

app.post("/create-mock", async (req, res) => {
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

  await getData();
  mockData[`${method}_${url}`] = JSON.parse(response);
  await writeData();

  return res.json({
    message: `Mock for [${method}] ${url} created/updated successfully`,
  });
});

// Add any custom mocks you want here
// Example:
app.get("/error", (req, res) => {
  res.status(500).json({ message: "Internal Server Error" });
});

app
  .get("**", anyRouteHandler)
  .post("**", anyRouteHandler)
  .put("**", anyRouteHandler)
  .patch("**", anyRouteHandler)
  .delete("**", anyRouteHandler);

async function anyRouteHandler(req, res) {
  const { method, url } = req;
  const key = `${method}_${url}`;

  await getData();
  if (mockData[key]) {
    res.json(mockData[key]);
    return;
  }

  // Show notification for unregistered routes:
  notifier.notify({
    title: "Mock-API: Unregistered route",
    message: `Method: ${method}, URL: ${url.slice(0, 30)}...`,
    sound: true,
  });
  res.status(404).json({ message: "Mock API: Route not found" });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function writeData() {
  try {
    await fs.promises.writeFile(
      DATA_FILE_PATH,
      JSON.stringify(mockData, null, 2)
    );
  } catch (err) {
    console.error(err);
  }
}

async function getData() {
  try {
    const data = await fs.promises.readFile(DATA_FILE_PATH);
    const parsedData = JSON.parse(data);
    Object.assign(mockData, parsedData);
  } catch (err) {
    console.error(err);
  }
}
