//   ____            _     _      _ _ _      _     _   
//  |  _ \          | |   | |    | | (_)    | |   | |  
//  | |_) |_   _  __| | __| | ___| | |_  ___| |__ | |_ 
//  |  _ <| | | |/ _` |/ _` |/ _ \ | | |/ __| '_ \| __|
//  | |_) | |_| | (_| | (_| |  __/ | | | (__| | | | |_ 
//  |____/ \__,_|\__,_|\__,_|\___|_|_|_|\___|_| |_|\__|
//

#if defined(ARDUINO_ARCH_ESP32)
#include <WiFi.h>
#else
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#endif
#include <WiFiUdp.h>
#include <ArtnetWifi.h>
#include <FastLED.h>

/******************************************************************************/
// CONFIGURATION
/******************************************************************************/

// FastLED Configuration
#define DATA_PIN    D1
//#define CLK_PIN   4
#define LED_TYPE    WS2812B
#define COLOR_ORDER GRB
#define NUM_LEDS    13
CRGB leds[NUM_LEDS];

#define BRIGHTNESS          255
#define FRAMES_PER_SECOND   60
#define WAIT_TIME           3 // seconds that the ligth will wait after the last artnet frame before playing a default animation

// Wifi settings
const char* NETWORK_NAME = "buddellicht";
const char* NETWORK_PASSWORD = "NotTheRealPassword123";

// Artnet settings
ArtnetWifi artnet;
const int startUniverse = 0; // CHANGE FOR YOUR SETUP most software this is 1, some software send out artnet first universe as 0.
const int numberOfChannels = NUM_LEDS * 3; // Total number of channels you want to receive (1 led = 3 channels)

/******************************************************************************/
// CONFIGURATION END
/******************************************************************************/

// Check if we got all universes
const int maxUniverses = numberOfChannels / 512 + ((numberOfChannels % 512) ? 1 : 0);
bool universesReceived[maxUniverses];
bool sendFrame = 1;
int previousDataLength = 0;

int lastArtnetFrame = 0;

void setup() {
  delay(1000); // 1 second delay for recovery

  Serial.begin(115200);
  Serial.println();

  // tell FastLED about the LED strip configuration
  FastLED.addLeds<LED_TYPE,DATA_PIN,COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
  //FastLED.addLeds<LED_TYPE,DATA_PIN,CLK_PIN,COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);

  WiFi.begin(NETWORK_NAME, NETWORK_PASSWORD);
  WiFi.mode(WIFI_STA);

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    FastLED.delay(1000/FRAMES_PER_SECOND);
    Serial.print(".");
    runner(0x00FFFF); // run blue pixels up and down the strip while connecting
    FastLED.show();
  }
  Serial.println();

  Serial.print("Connected, IP address: ");
  Serial.println(WiFi.localIP());

  // run green pixels on strip as a visual connection confirmation
  // somehow we need a stupid large number like NUM_LEDS*20 for this step. @ToDo: investigate this
  for (int i=0; i<=NUM_LEDS*20; i++) {
    runner(0x00FF00);
    FastLED.show();
    FastLED.delay(1000/FRAMES_PER_SECOND);
  }
  for (int i=0; i<=50; i++) {
    runner(0x000000);
    FastLED.show();
    FastLED.delay(1000/FRAMES_PER_SECOND/4);
  }

  // set master brightness control
  FastLED.setBrightness(BRIGHTNESS);

  artnet.begin();
  // this will be called for each packet received
  artnet.setArtDmxCallback(onDmxFrame);
}

void loop() {
  artnet.read();

  if (lastArtnetFrame > WAIT_TIME * FRAMES_PER_SECOND) {
    Fire2012(); // run simulation frame
    FastLED.show(); // display this frame
  }
  if (lastArtnetFrame < WAIT_TIME * FRAMES_PER_SECOND + FRAMES_PER_SECOND) {
    // increase waiting timer, but only to a set point, so the esp wont crash
    lastArtnetFrame++;
  }
  FastLED.delay(1000 / FRAMES_PER_SECOND);
}

void onDmxFrame(uint16_t universe, uint16_t length, uint8_t sequence, uint8_t* data) {
  sendFrame = 1;
  // set brightness of the whole strip
  if (universe == 15) {
    FastLED.setBrightness(data[0]);
  }

  // Store which universe has got in
  if ((universe - startUniverse) < maxUniverses) {
    universesReceived[universe - startUniverse] = 1;
  }

  for (int i = 0 ; i < maxUniverses ; i++) {
    if (universesReceived[i] == 0) {
      //Serial.println("Broke");
      sendFrame = 0;
      break;
    }
  }

  // read universe and put into the right part of the display buffer
  for (int i = 0; i < length / 3; i++) {
    int led = i + (universe - startUniverse) * (previousDataLength / 3);
    if (led < NUM_LEDS) {
      leds[i] = CRGB(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
    }
  }
  previousDataLength = length;

  if (sendFrame) {
    lastArtnetFrame = 0;
    FastLED.show();
    // Reset universeReceived to 0
    memset(universesReceived, 0, maxUniverses);
  }
}


// Preset Animations

void runner(CRGB clr) {
  // a colored dot sweeping back and forth, with fading trails
  fadeToBlackBy( leds, NUM_LEDS, 20);
  int pos = beatsin16( 13, 0, NUM_LEDS-1 );
  leds[pos] += clr;
}


// Fire2012 by Mark Kriegsman, July 2012
// as part of "Five Elements" shown here: http://youtu.be/knWiGsmgycY
//// 
// This basic one-dimensional 'fire' simulation works roughly as follows:
// There's a underlying array of 'heat' cells, that model the temperature
// at each point along the line.  Every cycle through the simulation, 
// four steps are performed:
//  1) All cells cool down a little bit, losing heat to the air
//  2) The heat from each cell drifts 'up' and diffuses a little
//  3) Sometimes randomly new 'sparks' of heat are added at the bottom
//  4) The heat from each cell is rendered as a color into the leds array
//     The heat-to-color mapping uses a black-body radiation approximation.
//
// Temperature is in arbitrary units from 0 (cold black) to 255 (white hot).
//
// This simulation scales it self a bit depending on NUM_LEDS; it should look
// "OK" on anywhere from 20 to 100 LEDs without too much tweaking. 
//
// I recommend running this simulation at anywhere from 30-100 frames per second,
// meaning an interframe delay of about 10-35 milliseconds.
//
// Looks best on a high-density LED setup (60+ pixels/meter).
//
//
// There are two main parameters you can play with to control the look and
// feel of your fire: COOLING (used in step 1 above), and SPARKING (used
// in step 3 above).
//
// COOLING: How much does the air cool as it rises?
// Less cooling = taller flames.  More cooling = shorter flames.
// Default 50, suggested range 20-100 
#define COOLING  40

// SPARKING: What chance (out of 255) is there that a new spark will be lit?
// Higher chance = more roaring fire.  Lower chance = more flickery fire.
// Default 120, suggested range 50-200.
#define SPARKING 120

bool gReverseDirection = false;

void Fire2012()
{
// Array of temperature readings at each simulation cell
  static byte heat[NUM_LEDS];

  // Step 1.  Cool down every cell a little
    for( int i = 0; i < NUM_LEDS; i++) {
      heat[i] = qsub8( heat[i],  random8(0, ((COOLING * 10) / NUM_LEDS) + 2));
    }
  
    // Step 2.  Heat from each cell drifts 'up' and diffuses a little
    for( int k= NUM_LEDS - 1; k >= 2; k--) {
      heat[k] = (heat[k - 1] + heat[k - 2] + heat[k - 2] ) / 3;
    }
    
    // Step 3.  Randomly ignite new 'sparks' of heat near the bottom
    if( random8() < SPARKING ) {
      int y = random8(7);
      heat[y] = qadd8( heat[y], random8(160,255) );
    }

    // Step 4.  Map from heat cells to LED colors
    for( int j = 0; j < NUM_LEDS; j++) {
      CRGB color = HeatColor( heat[j]);
      int pixelnumber;
      if( gReverseDirection ) {
        pixelnumber = (NUM_LEDS-1) - j;
      } else {
        pixelnumber = j;
      }
      leds[pixelnumber] = color;
    }
}

