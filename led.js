import { execSync } from 'node:child_process';

const stripSizeDefault = 3;

let ws281x = null;
let channel = null;
let coloursArray = null;
let stripWhiteLed = false;

export function rgbw_to_colour(r, g, b, w) {
  if(stripWhiteLed) {
    return (((((w << 8) + r) << 8) + g) << 8) + b;
  } else {
    return (((r << 8) + g) << 8) + b;
  }
}

export function colour_fill(colour) {
  if (!coloursArray) {
    return;
  }
  for (let c = 0; c < channel.count; c++) {
    coloursArray[c] = colour;
  }
}

export function rgbw_fill(r, g, b, w) {
  colour_fill(rgbw_to_colour(r, g, b, w));
}

export async function rgbw_fill_and_render(r, g, b, w) {
  if (!ws281x) {
    console.error('no ws281x');
    return;
  }

  rgbw_fill(r, g, b, w);
  ws281x.render();
}

export function clear() {
  if (!ws281x) {
    return;
  }

  rgbw_fill(0, 0, 0, 0);
  ws281x.render();
}

export async function init({
  stripSize = stripSizeDefault,
  dma = 10,
  freq = 800000,
  gpio = 12,
  invert = false,
  brightness = 255,
  stripType = 'ws2812',
} = {}) {
  let isDotpi = false;
  try {

    isDotpi = execSync('if dotpi system_is_raspberry_pi; then echo -n "true" ; else echo -n "false"; fi').toString();

    if (isDotpi === 'true') {
      ({ default: ws281x } = await import('rpi-ws281x-native'));

      const ws281x_options = {
        dma,
        freq,
        gpio,
        invert,
        brightness,
        stripType,
      };
      channel = ws281x(stripSize, ws281x_options);

      stripWhiteLed = false;
      [
        ws281x.stripType.SK6812_RGBW,
        ws281x.stripType.SK6812_RBGW,
        ws281x.stripType.SK6812_GRBW,
        ws281x.stripType.SK6812_GBRW,
        ws281x.stripType.SK6812_BRGW,
        ws281x.stripType.SK6812_BGRW,
        ws281x.stripType.SK6812,
      ].forEach( (stripType) => {
        stripWhiteLed |= channel.stripType === stripType;
      });

      coloursArray = channel.array;

      ['SIGINT', 'SIGTERM', 'SIGHUP'].forEach((signal) => {
        process.on(signal, () => {
          console.log('signal', signal);
          clear();
          ws281x.reset();
          ws281x.finalize();
          process.exit();
        });
      });

      rgbw_fill_and_render({ r: 0, g: 0, b: 0, w: 0 });

    } else {
      isDotpi = false;
    }
  } catch (error) {
    console.error('Error during initialisation of LED', error);
    isDotpi = false;
  }

  if (!isDotpi) {
    console.warn('Not controlling LED');
  }

  return isDotpi;
}

