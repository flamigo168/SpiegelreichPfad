const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname === path.join(__dirname) ? path.join(__dirname, "..") : process.cwd();
const base = path.resolve(__dirname, "..");
const types = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".png": "image/png",
  ".webmanifest": "application/manifest+json"
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/spiegelreich_pfad.html";
  const full = path.join(base, p);
  if (!full.startsWith(base)) { res.writeHead(403); res.end(); return; }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found: " + p); return; }
    const ext = path.extname(full);
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
}).listen(8080, () => console.log("listening on 8080"));
