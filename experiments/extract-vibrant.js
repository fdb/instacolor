const fs = require('fs');
const vibrant = require('node-vibrant');

async function main() {
  const palette = await vibrant.from('example.png').getPalette();
  console.log(palette);
  const colorNames = Object.keys(palette);
  const swatches = colorNames.map(name => palette[name]);
  //const swatches = Array.from(palette); // .swatches();
  const totalPopulation = swatches.reduce((sum, swatch) => sum + swatch.population, 0);
  console.log('POP', totalPopulation);
  let svg = '<?xml version="1.0"?>\n';
  svg += '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">\n';
  let y = 0;
  for (const swatch of swatches) {
    const swatchHeight = swatch.population / totalPopulation * 500;
    console.log(y, swatch.population, typeof swatch.population, swatchHeight);
    svg += `<rect x="0" y="${y}" width="200" height="${swatchHeight}" fill="${swatch.hex}" />\n`;
    y += swatchHeight;
  }
  svg += '</svg>\n';
  fs.writeFileSync('colors.svg', svg);

  //const totalPopulation = colorNames.map(name => palette[name].Swatch.)
  // for (const color of colors) {
  //   const colorHeight = color.r * 500;
  //   svg += `<rect x="0" y="${y}" width="200" height="${colorHeight}" fill="${color.color}" />\n`;
  //   y += colorHeight;
  // }
  // svg += '</svg>\n';
  // fs.writeFileSync('colors.svg', svg);
}

main().then(() => {

  console.log('Done.');
});

