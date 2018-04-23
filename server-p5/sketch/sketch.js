/*=== p5.js SKETCH ===*/
// Write your sketch here!

function setup() {
  pixelDensity(1); // for performance reasons
  // frameRate(30)
  createCanvas(windowWidth,windowHeight); // set small width & height if stutter occurs
}

function draw() {
  background(0,0,0);

  // Call sendArtNetFrame() when your image is ready to be send.
  sendArtNetFrame();
}


/*=== ARTNET ===*/
// Logic for ArtNet.

var artnet = require('artnet')({host: '255.255.255.255', refresh: 2500});
const NUM_LEDS = 13;
var dmx = new Uint8ClampedArray(NUM_LEDS*3);

function sendArtNetFrame() {
  var d = pixelDensity();
  var col = Math.floor(width*d/2);
  var rowjump = (width*d);
  var distance = Math.floor(height*d/NUM_LEDS);

  loadPixels();

  for (var i = 0; i < NUM_LEDS ; i++) {
    var pos = col+((rowjump*distance)*i)
    dmx[(NUM_LEDS-i)*3] = pixels[pos*4];
    dmx[((NUM_LEDS-i)*3)+1] = pixels[(pos*4)+1];
    dmx[((NUM_LEDS-i)*3)+2] = pixels[(pos*4)+2];
    //pixels[pos*4] = 255;
  }

  //updatePixels()
  // dmx.reverse();

  artnet.set(0, 1, dmx, function (err, res) {
    //artnet.close();
  });

  //console.log(dmx);
  // noLoop()
}
