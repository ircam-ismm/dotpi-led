${''/* This is a template for the configuration file. */}
export const module = {
  name: '${d.module.name}',
  version: '${d.module.version}',
};

export const server = {
  port: ${d.server.port ? d.server.port : 9999},
  verbose: ${typeof d.server.verbose !== 'undefined' ? d.server.verbose : false},
};

export const led = {
  // cf. https://github.com/beyondscreen/node-rpi-ws281x-native/blob/master/lib/constants.js

  // for more than 10 led pixels, do not directly connect to GPIO
  stripSize: ${d.led.stripSize ? d.led.stripSize : 10},

  // ws2812 is an alias of ws2812-grb
  // sk6812 is an alias of sk6812-grbw
  stripType: '${d.led.stripType ? d.led.stripType : 'ws2812'}',

  // in [0-255]
  brightness: 255,
  // invert brightness
  invert: false,

  // use 12 for PWM 0 when using digital audio (sound interface)
  // use 21 for PCM DOUT when using analog audio (headphones)
  gpio: ${d.led.gpio ? d.led.gpio : 12},

  // dma channel
  dma: 10,
  // frequency
  freq: 800000,
};
