// ===== Basic web server with Node.js and Express =====
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const startedAt = Date.now();

app.disable("x-powered-by"); // do not advertise the framework in response headers

// Middleware 1: request logger (method, URL, status code, response time)
app.use((req, res, next) => {
  const begin = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - begin) / 1e6;
    console.log(`[${new Date().toLocaleTimeString("en-IN")}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms.toFixed(1)} ms)`);
  });
  next();
});

// Middleware 2: serve static files (HTML, CSS, JS, images) from /public
app.use(express.static(PUBLIC_DIR));

// Clean URLs: /about and /contact map to their HTML files
const pages = { "/about": "about.html", "/contact": "contact.html" };
Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res) => res.sendFile(path.join(PUBLIC_DIR, file)));
});

// JSON endpoint: shows the server can respond dynamically too
app.get("/api/status", (req, res) => {
  res.json({
    status: "running",
    server: "Express " + require("express/package.json").version,
    node: process.version,
    platform: process.platform,
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    time: new Date().toISOString()
  });
});

// Fallback: anything not matched above gets the 404 page
app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, "404.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});