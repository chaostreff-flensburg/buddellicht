var dgram = require('dgram');

// Create a udp socket client object.
var client = dgram.createSocket("udp4");

client.bind(2342);


/*=== p5.js SKETCH ===*/
// Write your sketch here!

const fps = 30;

function setup() {
  pixelDensity(1);
  frameRate(fps)
  createCanvas(windowWidth,windowHeight);
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

  // Call sendFrame() when your image is ready to be send.
  sendFrame();
}


/*=== Leuchtfeuer ===*/

function sendFrame() {
  const NUM_LEDS = 300;
  var data = new Uint8Array(NUM_LEDS*3+4);
  data[0] = 0;
  data[1] = 0;
  data[2] = 0;
  data[3] = 0;

  var d = pixelDensity();
  var col = Math.floor(width*d/2);
  var rowjump = (width*d);
  var distance = Math.floor(height * d / NUM_LEDS);

  loadPixels();

  for (var i = 0; i < NUM_LEDS ; i++) {
    var pos = col+((rowjump*distance)*i)
    
    data[(NUM_LEDS-i)*3+4] = pixels[pos*4];
    data[((NUM_LEDS-i)*3)+5] = pixels[(pos*4)+1];
    data[((NUM_LEDS-i)*3)+6] = pixels[(pos*4)+2];
  }
  
  client.send(data, 2342, "233.255.255.255");
}
