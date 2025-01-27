import * as echo from '@dotpi/javascript/echo.js';
import { isRaspberryPi } from '@dotpi/javascript/system.js';

let chalk = null;
if (process.env.DEBUG) {
  chalk = (await import('chalk')).default;
}

if (process.env.DEBUG) {
  echo.warning('Debug mode enabled');
}

if (process.getuid() !== 0) {
  echo.error('This script must be run as root');
  if(process.env.DEBUG) {
    echo.warning('Debug display only');
  } else {
    process.exit(1);
  }
}

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

function pad000(value) {
  return value.toString().padStart(3, '0');
}

export function rgbw_display(r, g, b, w) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);

  const rString = pad000(r);
  const gString = pad000(g);
  const bString = pad000(b);
  const wString = pad000(w);

  if (!chalk) {
    process.stdout.write(`rgbw ${rString} ${gString} ${bString} ${wString}`);
    return;
  }

  process.stdout.write(chalk.bgRgb(r, g, b)('rgb'));
  process.stdout.write(chalk.bgRgb(0, 0, 0)(' '));
  process.stdout.write(chalk.bgRgb(r, 0, 0)(rString));
  process.stdout.write(chalk.bgRgb(0, 0, 0)(' '));
  process.stdout.write(chalk.bgRgb(0, g, 0)(gString));
  process.stdout.write(chalk.bgRgb(0, 0, 0)(' '));
  process.stdout.write(chalk.bgRgb(0, 0, b)(bString));
  process.stdout.write(chalk.bgRgb(0, 0, 0)(' '));
  process.stdout.write(chalk.bgRgb(w, w, w)(wString));
  process.stdout.write(chalk.bgRgb(0, 0, 0)(' '));

  const rw = Math.min(255, r + w);
  const gw = Math.min(255, g + w);
  const bw = Math.min(255, b + w);

  process.stdout.write(chalk.bgRgb(rw, gw, bw)('rgbw'));

  // const rwString = pad000(rw);
  // const gwString = pad000(gw);
  // const bwString = pad000(bw);

  // process.stdout.write(chalk.bgRgb(0, 0, 0)(' '));
  // process.stdout.write(chalk.bgRgb(rw, 0, 0)(rwString));
  // process.stdout.write(chalk.bgRgb(0, 0, 0)(' '));
  // process.stdout.write(chalk.bgRgb(0, gw, 0)(gwString));
  // process.stdout.write(chalk.bgRgb(0, 0, 0)(' '));
  // process.stdout.write(chalk.bgRgb(0, 0, bw)(bwString));
  // process.stdout.write(chalk.bgRgb(0, 0, 0)(' '));
  // process.stdout.write(chalk.bgRgb(w, w, w)(wString));
  // process.stdout.write(chalk.bgRgb(0, 0, 0)(' '));

  // process.stdout.write('\n');

}

export async function rgbw_fill_and_render(r, g, b, w) {
  if (process.env.DEBUG) {
    rgbw_display(r, g, b, w);
  }

  if (!ws281x) {
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

    isDotpi = await isRaspberryPi();

    if (isDotpi) {
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

      rgbw_fill_and_render(0, 0, 0, 0);

    } else {
      isDotpi = false;
    }
  } catch (error) {
    isDotpi = false;
    echo.error('Error during initialisation of LED', error);
  }

  if (!isDotpi) {
    echo.warning('Not controlling LED');
  }

  return isDotpi;
}

export async function finalise() {
  if (ws281x) {
    clear();
    ws281x.reset();
    ws281x.finalize();
  }
}
