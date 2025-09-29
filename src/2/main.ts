import { Catalyst } from './lib/Catalyst';
import { sketchSeedFunction } from './sketch';
import { createGui } from './create-gui';
import { plugins } from './plugins';

declare global {
	var catalyst: Catalyst;
}

globalThis.catalyst = new Catalyst(sketchSeedFunction, createGui, plugins);
