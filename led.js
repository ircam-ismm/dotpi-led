import { execSync } from 'node:child_process';

const strip_size_default = 3;

let ws281x = null;
let channel = null;
let colorsArray = null;

export function rgb_to_colour(r, g, b) {
  return (((r << 8) + g) << 8) + b;
}

export function colour_fill(colour) {
  if (!colorsArray) {
    return;
  }
  for (let c = 0; c < channel.count; c++) {
    colorsArray[c] = colour;
  }
}

export function rgb_fill(r, g, b) {
  colour_fill(rgb_to_colour(r, g, b));
}

export function rgb_fill_and_render(r, g, b) {
  if (!ws281x) {
    console.error('no ws281x');
    return;
  }

  rgb_fill(r, g, b);
  ws281x.render();
}

export function clear() {
  if (!ws281x) {
    return;
  }

  console.log('clear');
  rgb_fill(0, 0, 0);
  ws281x.render();
}

export async function init({
  strip_size = strip_size_default,
  ws281x_options = {
    dma: 10,
    freq: 800000,
    gpio: 12,
    invert: false,
    brightness: 255,
    stripType: 'ws2812',
  },
} = {}) {
  let isDotpi = false;
  try {

    isDotpi = execSync('if dotpi system_is_raspberry_pi; then echo -n "true" ; else echo -n "false"; fi').toString();

    if (isDotpi === 'true') {
      ({ default: ws281x } = await import('rpi-ws281x-native'));

      channel = ws281x(strip_size, ws281x_options);

      // // use channel 1 for PWM1 on GPIO13 PIN33
      // const channel = ws281x.init({
      //   dma: 10,
      //   freq: 800000,
      //   channels: [
      //     {count: 0, gpio: 10 },
      //     {count: strip_size, gpio: 13, invert: false, brightness: 255, stripType: 'ws2812'},
      //   ]
      // })[0];

      colorsArray = channel.array;

      ['SIGINT', 'SIGTERM', 'SIGHUP'].forEach((signal) => {
        process.on(signal, () => {
          console.log('signal', signal);
          clear();
          process.exit();
        });
      });

      rgb_fill_and_render({ r: 0, g: 0,  b: 0 });

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

