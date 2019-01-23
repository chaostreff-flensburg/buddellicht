// Require node js dgram module.
var dgram = require('dgram');

// Create a udp socket client object.
// @todo: set multicast interface
var client = dgram.createSocket("udp4");

client.bind(2342);


var num=150, d=50, frames=100;
var theta=0, d2;

function setup() {
  pixelDensity(1); // for performance reasons
  frameRate(30)
  createCanvas(windowWidth,windowHeight); // set small width & height if stutter occurs
  colorMode(HSB,360,100,100);
  smooth(6);
  noStroke();
}

function draw() {
  randomSeed(36521);
  background(0,0,0);
  for (var i=0; i<num; i++) {
    var angle = (TWO_PI/num)*i;
    var x = width/2 + cos(angle)*d;
    var y = height/2 + sin(angle)*d;
    push();
    translate(x, y);
    rotate(theta+angle);
    if (random(1)>.15) {
      d2=50+i*2;
      stroke(360.0/num*i,90,90);
      fill(360.0/num*i,90,90, 20);
    } else {
      d2=50+i*2.5;
      stroke(360.0/num*i,90,90);
      fill(360.0/num*i,90,90, 90);
    }
    if (random(1)>.3) {
      arc(0, 0, d2, d2, 0, radians(d2/5));
    }
    pop();
  }
  theta += (TWO_PI/frames);
  //if (frameCount<=frames) saveFrame("image-###.gif");

  sendFrame();
}


function sendFrame() {
  const NUM_LEDS = 300;
  var dmx = new Uint8ClampedArray(NUM_LEDS*3);
  let msg = Buffer.allocUnsafe(NUM_LEDS*3+10);
  // todo: maybe use uint8array instead of buffer. maybe faster
  // doesnt need to be clamped, pixel data will only be uint8
  msg.writeUInt8(0x00, 0);
  msg.writeUInt8(0x00, 1);
  msg.writeUInt8(0x02, 2);
  msg.writeUInt8(0xA6, 3); //length

  var d = pixelDensity();
  var col = Math.floor(width*d/2);
  var rowjump = (width*d);
  var distance = Math.floor(height * d / NUM_LEDS);

  loadPixels();

  for (var i = 0; i < NUM_LEDS ; i++) {
    var pos = col+((rowjump*distance)*i)
    msg.writeUInt8(pixels[pos*4], (NUM_LEDS-i)*3+4);
    msg.writeUInt8(pixels[pos*4+1], (NUM_LEDS-i)*3+5);
    msg.writeUInt8(pixels[pos*4+2], (NUM_LEDS-i)*3+6);
    
    // dmx[(NUM_LEDS-i)*3] = pixels[pos*4];
    // dmx[((NUM_LEDS-i)*3)+1] = pixels[(pos*4)+1];
    // dmx[((NUM_LEDS-i)*3)+2] = pixels[(pos*4)+2];
    //pixels[pos*4] = 255;
  }
  
  // todo: add length
  client.send(msg, 2342, "233.255.255.255");
  

  //updatePixels()
  // dmx.reverse();

  

  //console.log(dmx);
  // noLoop()
}

