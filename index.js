const express = require("express");
const cors = require("cors");
const fs = require("fs");
const puppeteer = require("puppeteer");
const rgbaPalette = require("get-rgba-palette");
const PNG = require("png-js");

const getHashtags = require("./hashtags").getHashtags;

const PAGE_HEADER_HEIGHT = 650;
const PAGE_WIDTH = 1024;
const PAGE_HEIGHT = 2700;

const app = express();
app.use(cors());

function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

async function downloadPageAsImage(insta, fileName) {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  page.setViewport({ width: PAGE_WIDTH, height: PAGE_HEIGHT });
  await page.goto(`https://www.instagram.com/${insta}/`);
  const closeButton = await page.$('[aria-label="Close"]');
  if (closeButton) {
    closeButton.click();
  }
  await page.screenshot({
    path: fileName,
    clip: {
      x: 0,
      y: PAGE_HEADER_HEIGHT,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT - PAGE_HEADER_HEIGHT
    }
  });
  await browser.close();
}

async function rawExtractPalette(imageFileName) {
  return new Promise(function(resolve) {
    PNG.decode(imageFileName, function(pixels) {
      const colors = rgbaPalette.bins(pixels, 10);
      resolve(colors);
    });
  });
}

async function extractPalette(imageFileName, paletteFileName) {
  if (fs.existsSync(paletteFileName)) {
    return new Promise((resolve, reject) => {
      fs.readFile(paletteFileName, "utf-8", (err, data) => {
        if (err) {
          return reject(err);
        }
        const palette = JSON.parse(data);
        resolve(palette);
      });
    });
  }

  const palette = await rawExtractPalette(imageFileName);

  //const palette = await vibrant.from(imageFileName).getPalette();
  //const colorNames = Object.keys(palette);
  //const swatches = colorNames.map(name => palette[name]);
  const newSwatches = [];
  // const totalPopulation = swatches.reduce((sum, swatch) => sum + swatch.population, 0);
  for (let i = 0; i < palette.length; i++) {
    const swatch = palette[i];
    const hex = rgbToHex(swatch.color[0], swatch.color[1], swatch.color[2]);
    newSwatches.push({ color: hex, ratio: swatch.amount });
  }
  fs.writeFileSync(paletteFileName, JSON.stringify(newSwatches));
  return newSwatches;
}

async function handleGetPalette(insta) {
  const d = new Date();
  const prefixFileName = `/tmp/${insta}-${d.getFullYear()}-${d.getMonth() +
    1}-${d.getDate()}`;
  const imageFileName = `${prefixFileName}.png`;
  const paletteFileName = `${prefixFileName}.json`;
  if (!fs.existsSync(imageFileName)) {
    await downloadPageAsImage(insta, imageFileName);
  }
  const palette = await extractPalette(imageFileName, paletteFileName);

  //console.log(imageFileName);

  // const { ids, colors, amount } = imagePalette(await imagePixels(imageFileName));
  // console.log(ids, colors, amount );

  return palette;
}

async function handleGetHashtags(insta) {
  const hashtags = await getHashtags(insta);
  return hashtags;
}

app.get("/", (req, res) => {
  const html = `<!doctype html>
  <html>
  <head><meta charset="utf-8"><title>instakleur</title>
  <style>
    body, html { font: 14px sans-serif; background: #fafafa; color: #666; max-width: 1000px; padding: 0 5vw; margin: 30px auto; }
    h2 { margin: 2.5rem 0 0.5rem 0; }
    a { color: inherit; text-decoration: none; border-bottom: 2px solid rgba(0, 0, 0, 0.2); }
    li { margin-bottom: 1rem; }
    input { margin: 20px 0; padding: 5px 10px; border-radius: 3px; font: inherit; color: inherit; border: 1px solid #ddd; }
    input[type="submit"] { background-color: #3897f0; color: white; border-color: #3897f0; }
  </style>
  </head>
  <body>
  <h1>instakleur</h1>
  <h2>Try It</h2>
  <form method="get" action="/insta">
    <input id="insta" type="text" placeholder="tastycreamery">
    <input type="submit" value="Generate Palette">
  </form>
  <h2>Example Profiles</h2>
  <ul>
    <li><a href="/palette/natgeo">National Geographic</a></li>
    <li><a href="/palette/katyperry">Katy Perry</a></li>
    <li><a href="/palette/buzzfeedtasty">buzzfeedtasty</a></li>
    <li><a href="/palette/leomessi">Leo Messi</a></li>
    <li><a href="/palette/therock">therock</a></li>
  </ul>
  <h2>API</h2>
  <h3>Palettes</h3>
  <pre>/api/palette/<span style="color: #3897f0">INSTAGRAM_NAME</span></pre>
  <p>Get a color palette from an Instagram profile.</p>
  <p>Palettes are cached -- a new one is generated every day.</p>
  <p>Example: <code><a href="/api/palette/natgeo">/api/palette/natgeo</a></code></p>
  <h3>Hashtags</h3>
  <pre>/api/hashtags/<span style="color: #3897f0">INSTAGRAM_NAME</span></pre>
  <p>Get the hashtags from an Instagram profile.</p>
  <p>Hashtags are cached -- a new one is generated every day.</p>
  <p>Example: <code><a href="/api/hashtags/natgeo">/api/hashtags/natgeo</a></code></p>
  <h2>Source Code</h2>
  <p>Source code is available on <a href="https://github.com/fdb/instakleur">GitHub</a>.</p>
  <script>
    document.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const insta = document.querySelector('#insta').value;
      document.location = '/palette/' + insta;
    });
  </script>
  </body>
  </html>
  `;
  res.send(html);
});

app.get("/palette/:insta", (req, res) => {
  const insta = req.params.insta;
  handleGetPalette(insta)
    .then(palette => {
      let html = "<!doctype html>\n";
      html += '<html><head><meta charset="utf-8"><title>instakleur</title>\n';
      html += "<style>\n";
      html +=
        "body, html { font: 14px sans-serif; background: #fafafa; color: #666; max-width: 1000px; padding: 0 5vw; margin: 30px auto; }\n";
      html +=
        "a { color: inherit; text-decoration: none; border-bottom: 2px solid rgba(0, 0, 0, 0.2); }\n";
      html +=
        ".wrap { display: flex; flex-direction: row; align-items: flex-start;  justify-content: flex-start; }\n";
      html += "svg { margin-right: 50px; }\n";
      html += "table { border-collapse: collapse; }\n";
      html += "th { text-align: left; }\n";
      html += "td, th { padding: 10px 30px; }\n";
      html += "tr { border-bottom: 1px solid #ddd; }\n";
      html +=
        ".swatch { display: inline-block; width: 1rem; height: 1rem; margin-right: 1rem; vertical-align: top; }\n";
      html += "</style>\n";
      html += "</head><body>\n";
      html += `<h1><a href="/">instakleur</a> – <a href="https://instagram.com/${insta}/">${insta}</a></h1>\n`;
      let svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="500" viewBox="0 0 200 500">\n';
      let table = "<table><tr><th>Color</th><th>Ratio</th></tr>";
      let y = 0;
      for (const swatch of palette) {
        const swatchHeight = swatch.ratio * 500;
        svg += `  <rect x="0" y="${y}" width="200" height="${swatchHeight}" fill="${
          swatch.color
        }" />\n`;
        table += `  <tr><td><span class="swatch" style="background-color: ${
          swatch.color
        }"></span>${swatch.color}</td><td>${(swatch.ratio * 100).toFixed(
          2
        )}%</td></tr>\n`;
        y += swatchHeight;
      }
      svg += "</svg>\n";
      table += "</table>\n";
      html += '<div class="wrap">\n';
      html += svg;
      html += table;
      html += "</div>\n";
      html += "</body></html>\n";
      res.send(html);
    })
    .catch(error => {
      res.send({ status: "error", error: error.toString() });
    });
});

app.get("/api/palette/:insta", (req, res) => {
  const insta = req.params.insta;
  handleGetPalette(insta)
    .then(palette => {
      res.send({ status: "ok", palette });
    })
    .catch(error => {
      res.send({ status: "error", error: error.toString() });
    });
});

app.get("/api/hashtags/:insta", (req, res) => {
  const insta = req.params.insta;
  handleGetHashtags(insta)
    .then(hashtags => {
      res.send({ status: "ok", hashtags });
    })
    .catch(error => {
      res.send({ status: "error", error: error.toString() });
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
