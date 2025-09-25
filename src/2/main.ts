import { Catalyst } from './lib/Catalyst';
import { sketchSeedFunction } from './sketch';
import { createGui } from './create-gui';
import { plugins } from './plugins';

export const catalyst = new Catalyst(sketchSeedFunction, createGui, plugins);
