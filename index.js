require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

app.use(bodyParser.urlencoded({ extended: false }));

const urldata = [];
let counter = 1;

app.post("/api/shorturl", (req, res) => {
  let originalUrl = req.body.url;

  let hostname;
  try {
    const parsedUrl = new URL(originalUrl);

    if (!/^https?:$/.test(parsedUrl.protocol)) {
      throw new Error("invalid protocol");
    }

    hostname = parsedUrl.hostname;
  } catch (err) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    let shortUrl = counter++;
    urldata[shortUrl] = originalUrl;

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  });
});


app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urldata[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "No short URL found for given input" });
  }
});
