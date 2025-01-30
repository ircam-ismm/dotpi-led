
export const module = {
  name: '@dotpi/led',
  version: '3.1.1',
};

export const server = {
  port: 9999,
  verbose: false,
};

export const led = {
  // cf. https://github.com/beyondscreen/node-rpi-ws281x-native/blob/master/lib/constants.js

  // for more than 10 led pixels, do not directly connect to GPIO
  stripSize: 10,

  // ws2812 is an alias of ws2812-grb
  // sk6812 is an alias of sk6812-grbw
  stripType: 'ws2812',

  // in [0-255]
  brightness: 255,
  // invert brightness
  invert: false,

  // use 12 for PWM 0 when using digital audio (sound interface)
  // use 21 for PCM DOUT when using analog audio (headphones)
  gpio: 12,

  // dma channel
  dma: 10,
  // frequency
  freq: 800000,
};
