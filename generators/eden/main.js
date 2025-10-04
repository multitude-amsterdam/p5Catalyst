import '/src/style/inter.css';
import '/src/style/style.css';

import { Catalyst } from '/src/lib/Catalyst';
import { sketchSeed } from './sketch';
import { createGui } from './create-gui';
import { plugins } from './create-plugins';

new Catalyst(sketchSeed, createGui, plugins);
