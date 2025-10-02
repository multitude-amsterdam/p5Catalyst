import './style/inter.css';
import './style/style.css';

import { Catalyst } from './lib/Catalyst';
import { sketchSeed } from './sketch';
import { createGui } from './create-gui';
import { plugins } from './create-plugins';

new Catalyst(sketchSeed, createGui, plugins);
