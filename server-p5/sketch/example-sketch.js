var num=150, d=50, frames=100;
var theta=0, d2;

function setup() {
  pixelDensity(1); // for performance reasons
  // frameRate(30)
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

  sendArtNetFrame();
}


var artnet = require('artnet')({host: '255.255.255.255'});
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
