const fs = require('fs');
const colorExtractor = require('img-color-extractor');

async function main() {
  const stream = fs.createReadStream('example.png');
  const defaultOptions = {
      background: '#fafafa',
      alphaMin: 0,
      dist: 100,
      greyVa: -1,
  };
  // [ { color: '#ffffff', n: 1515551, r: 0.728368706 },
  //   { color: '#333333', n: 388783, r: 0.1868478003 },
  //   { color: '#669f64', n: 174227, r: 0.0837329094 },
  //   { color: '#b2ceb1', n: 2186, r: 0.0010505842 } ]
  const colors = await colorExtractor.extract(stream, defaultOptions);
  let svg = '<?xml version="1.0"?>\n';
  svg += '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">\n';
  let y = 0;
  for (const color of colors) {
    const colorHeight = color.r * 500;
    svg += `<rect x="0" y="${y}" width="200" height="${colorHeight}" fill="${color.color}" />\n`;
    y += colorHeight;
  }
  svg += '</svg>\n';
  fs.writeFileSync('colors.svg', svg);
}

main().then(() => {

  console.log('Done.');
});

