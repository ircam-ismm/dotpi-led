# @dotpi/led

To use this, you need a dotpi system, with the `@dotpi/led-module` installed and configured.

See [dotpi](https://ircam-ismm.github.io/dotpi/).

## Installation

In your project, install the `@dotpi/led` npm module.

```sh
npm install --save @dotpi/led
```

## Usage

In you code, you can set the red, green, blue and white channels, withe values in `[0-255]`.

```javascript
import { Client } from '@dotpi/led/Client.js';
const client = await Client.create();

let colour = {
  r: 255 * Math.random(),
  g: 255 * Math.random(),
  b: 255 * Math.random(),
  w: 255 * Math.random(), // ignored if no white LED
}

client.fill(colour);
```
