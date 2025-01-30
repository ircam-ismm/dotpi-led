${''/* This is a template for the configuration file. */}
export const module = {
  name: '${d.module.name}',
  version: '${d.module.version}',
};

export const server = {
  port: ${d.server.port},
  verbose: ${d.server.verbose},
};

export const led = {
  // cf. https://github.com/beyondscreen/node-rpi-ws281x-native/blob/master/lib/constants.js

  // for more than 10 led pixels, do not directly connect to GPIO
  stripSize: ${d.led.stripSize},

  // ws2812 is an alias of ws2812-grb
  // sk6812 is an alias of sk6812-grbw
  stripType: '${d.led.stripType}',

  // in [0-255]
  brightness: ${d.led.brightness},
  // invert brightness
  invert: ${d.led.inverse ? true : false},

  // use 12 for PWM 0 when using digital audio (sound interface)
  // use 21 for PCM DOUT when using analog audio (headphones)
  gpio: ${d.led.gpio},

  // dma channel
  dma: ${d.led.dma},
  // frequency
  freq: ${d.led.freq},
};
