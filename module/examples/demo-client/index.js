import { program } from 'commander';
import { Client } from '@dotpi/led/Client.js';

// to debug
program.option('-c, --configuration <file>', 'configuration file');
program.parse();
const options = program.opts();

const client = await Client.create({
  configurationFile: options.configuration, // to debug
});

console.log(`Client started with configuration:`,
  client.configuration,
);

const colour = {
  r: 0,
  g: 0,
  b: 0,
  w: 0,
}

const coloursToChange = [
  'r', 'g', 'b', 'w',
];

function randomIncrement({
  min = 1,
  max = 2,
} = {}) {
  return Math.random() * (max - min) + min;
}

setInterval(() => {
  const channelIndex = Math.round(Math.random() * coloursToChange.length - 1);
  const channel = coloursToChange[channelIndex];

  colour[channel] += randomIncrement();
  if (colour[channel] > 255) {
    colour[channel] = 0;
  } else if (colour[channel] < 0) {
    colour[channel] = 255;
  }

  client.fill(colour);
}, 10);
