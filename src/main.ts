import './style/inter.css';
import './style/style.css';

import { Catalyst } from './lib/Catalyst';
import { sketchSeedFunction } from './sketch';
import { createGui } from './create-gui';
import { plugins } from './create-plugins';

// declare global {
// 	var catalyst: Catalyst;
// }

// globalThis.catalyst = new Catalyst(sketchSeedFunction, createGui, plugins);

new Catalyst(sketchSeedFunction, createGui, plugins);
