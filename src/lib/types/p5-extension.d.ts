import type p5 from 'p5';
import type { Catalyst } from '../Catalyst';

export type ExtensibleP5 = p5 & { catalyst?: Catalyst; [key: string]: any };

export type sketchSeedFunction = (sketch: ExtensibleP5) => void;
