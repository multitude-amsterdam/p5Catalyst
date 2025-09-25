import type { ExtensibleP5 } from './Catalyst';

export class CatalystGUI {
	sketch: ExtensibleP5;

	isTyping = false;

	constructor(sketch: ExtensibleP5) {
		this.sketch = sketch;
	}

	finalize() {}
}
