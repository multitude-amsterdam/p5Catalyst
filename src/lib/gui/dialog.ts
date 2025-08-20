import p5 from 'p5';
import type GUIForP5 from './gui';

export default class Dialog {
	gui: GUIForP5;
	dialogElement: p5.Element;
	divContent: p5.Element;
	buttonCloseDialog: p5.Element;
	dialogBackdropClose: p5.Element;
	contentWrapper: p5.Element;
	divPrompt: p5.Element;
	promptInput: p5.Element;
	promptConfirmButton: p5.Element;

	constructor(gui: GUIForP5) {
		this.gui = gui;

		// create html structure
		this.dialogElement = gui.p5Instance
			.createElement('dialog')
			.class('dialog');
		{
			this.dialogBackdropClose = gui.p5Instance
				.createButton('')
				.parent(this.dialogElement)
				.class('dialog-backdrop-close')
				.attribute('tabindex', '-1')
				.mousePressed(() => this.close());

			this.divContent = gui.p5Instance
				.createDiv()
				.parent(this.dialogElement)
				.class('dialog-content');
			{
				this.buttonCloseDialog = gui.p5Instance
					.createButton('&#10005;') // cross
					.parent(this.divContent)
					.class('dialog-close')
					.mousePressed(() => this.close());

				this.contentWrapper = gui.p5Instance
					.createDiv()
					.parent(this.divContent)
					.class('dialog-content-wrapper');

				this.divPrompt = gui.p5Instance
					.createDiv()
					.parent(this.divContent)
					.class('dialog-prompt-form');
				{
					this.promptInput = gui.p5Instance
						.createInput()
						.parent(this.divPrompt)
						.class('dialog-prompt-input');
					this.promptConfirmButton = gui.p5Instance
						.createButton('OK')
						.parent(this.divPrompt)
						.class('dialog-prompt-confirm');
				}
			}
		}
	}

	alert(html: string): void {
		this.divPrompt.style('display', 'none');
		this.contentWrapper.html(html);

		// close with Enter or Escape keys
		this.contentWrapper.elt.onkeydown = (e: KeyboardEvent) => {
			// prevent p5 keyPressed function firing for this key
			this.gui.isTypingText = true;
			if (e.key === 'Enter' || e.key === 'Escape') {
				e.preventDefault();
				this.close();
			}
		};

		this.show();
	}

	prompt(
		html: string,
		defaultVal: string = '',
		confirmButtonLabel: string = 'OK'
	): Promise<string> {
		console.log(html);

		// reset contentWrapper on keydown from alert()
		this.contentWrapper.elt.onkeydown = () => {};

		this.divPrompt.style('display', '');
		html += this.contentWrapper.html(html);

		this.promptInput.value(defaultVal);
		this.promptConfirmButton.html(confirmButtonLabel);
		this.show();

		this.promptInput.elt.focus();

		return new Promise(resolve => {
			// clicking button resolves the promise
			this.promptConfirmButton.mousePressed(() => {
				resolve(this.promptInput.value().toString());
				this.close();
			});
			// Enter key resolves the promise
			this.promptInput.elt.onkeydown = (e: KeyboardEvent) => {
				this.gui.isTypingText = true;
				if (e.key === 'Enter') {
					e.preventDefault();
					resolve(this.promptInput.value().toString());
					this.close();
				}
			};
		});
	}

	show() {
		this.dialogElement.elt.showModal();
	}

	close() {
		console.trace(this);
		this.dialogElement.elt.close();
	}
}
