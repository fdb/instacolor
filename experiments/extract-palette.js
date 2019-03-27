
var palette = require('get-rgba-palette')
// var pixels = require('get-image-pixels')
// var load = require('img')
var PNG = require('png-js');

// const imagePalette = require('image-palette');
// const imagePixels = require('image-pixels');

//const palette = await extractPalette(imageFileName, paletteFileName);

  //console.log(imageFileName);

async function main() {

    PNG.decode('test.png', function(pixels) {
       var colors = palette.bins(pixels, 10);
       console.log(colors);
    });
     //console.log(await imagePixels('test.png'));
}

main();
  // const { ids, colors, amount } = imagePalette(await imagePixels(imageFileName));
