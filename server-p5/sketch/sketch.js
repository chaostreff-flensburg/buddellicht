// Require node js dgram module.
var dgram = require('dgram');

// Create a udp socket client object.
// @todo: set multicast interface
var client = dgram.createSocket("udp4");

client.bind(2342);


/*=== p5.js SKETCH ===*/
// Write your sketch here!

const fps = 30;

function setup() {
  pixelDensity(1); // for performance reasons
  frameRate(fps)
  createCanvas(windowWidth,windowHeight); // set small width & height if stutter occurs
}

let walk = 0;
let bpm = 128;
let bps = bpm/60;
let fpb = fps/bps;

function draw() {
  background(0,0,0);
  rect(0, mouseY, windowWidth, 20);

  walk = walk + (windowHeight/fpb/16);
  if (walk > windowHeight) walk = 0;

  // Call sendArtNetFrame() when your image is ready to be send.
  sendFrame();
}


/*=== ARTNET ===*/
// Logic for ArtNet.


function sendFrame() {
  const NUM_LEDS = 300;
  var dmx = new Uint8Array(NUM_LEDS*3+4);
  dmx[0] = 0;
  dmx[1] = 0;
  dmx[2] = 0;
  dmx[3] = 0;
  // let msg = Buffer.allocUnsafe(NUM_LEDS*3+10);
  // todo: maybe use uint8array instead of buffer. maybe faster
  // doesnt need to be clamped, pixel data will only be uint8
  // msg.writeUInt8(0x00, 2);
  // msg.writeUInt8(0x00, 0);
  // msg.writeUInt8(0x02, 0);
  // msg.writeUInt8(0xA6, 0); //length

  var d = pixelDensity();
  var col = Math.floor(width*d/2);
  var rowjump = (width*d);
  var distance = Math.floor(height * d / NUM_LEDS);

  loadPixels();

  for (var i = 0; i < NUM_LEDS ; i++) {
    var pos = col+((rowjump*distance)*i)
    // msg.writeUInt8(pixels[pos*4], (NUM_LEDS-i)*3+4);
    // msg.writeUInt8(pixels[pos*4+1], (NUM_LEDS-i)*3+5);
    // msg.writeUInt8(pixels[pos*4+2], (NUM_LEDS-i)*3+6);
    
    dmx[(NUM_LEDS-i)*3+4] = pixels[pos*4];
    dmx[((NUM_LEDS-i)*3)+5] = pixels[(pos*4)+1];
    dmx[((NUM_LEDS-i)*3)+6] = pixels[(pos*4)+2];
    //pixels[pos*4] = 255;
  }
  
  // todo: add length
  client.send(dmx, 2342, "233.255.255.255");
  // noLoop()
}
