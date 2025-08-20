import p5 from 'p5';
import type GUIForP5 from './gui';

export default class Dialog {
	gui: GUIForP5;
	dialog: HTMLDialogElement;
	dialogClose: HTMLElement;
	dialogBackdropClose: HTMLElement;
	contentWrapper: HTMLElement;
	promptForm: HTMLElement;
	promptInput: HTMLInputElement;
	promptConfirmButton: HTMLElement;

	constructor(gui: GUIForP5) {
		this.gui = gui;
		this.dialog = document.querySelector('.dialog') as HTMLDialogElement;
		this.dialogClose = document.querySelector(
			'.dialog-close'
		) as HTMLElement;
		this.dialogBackdropClose = document.querySelector(
			'.dialog-backdrop-close'
		) as HTMLElement;
		this.contentWrapper = this.dialog?.querySelector(
			'.dialog-content-wrapper'
		) as HTMLElement;

		this.dialogClose.addEventListener('click', () => {
			this.close();
		});
		this.dialogBackdropClose.addEventListener('click', () => {
			this.close();
		});

		this.promptForm = this.dialog.querySelector(
			'.dialog-prompt-form'
		) as HTMLElement;
		this.promptInput = this.dialog.querySelector(
			'.dialog-prompt-input'
		) as HTMLInputElement;
		this.promptConfirmButton = this.dialog.querySelector(
			'.dialog-prompt-confirm'
		) as HTMLElement;
	}

	alert(html: string): void {
		console.log(html);

		this.promptForm.style.display = 'none';
		this.contentWrapper.innerHTML = `<p>${html}</p>`;

		// close with Enter or Escape keys
		this.contentWrapper.onkeydown = (e: KeyboardEvent) => {
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
		this.contentWrapper.onkeydown = () => {};

		this.promptForm.style.display = '';
		html += this.contentWrapper.innerHTML = html;

		this.promptInput.value = defaultVal;
		this.promptConfirmButton.innerHTML = confirmButtonLabel;
		this.show();
		this.promptInput.focus();

		return new Promise(resolve => {
			// clicking button resolves the promise
			this.promptConfirmButton.onclick = () => {
				resolve(this.promptInput.value);
				this.close();
			};
			// Enter key resolves the promise
			this.promptInput.onkeydown = e => {
				this.gui.isTypingText = true;
				if (e.key === 'Enter') {
					e.preventDefault();
					resolve(this.promptInput.value);
					this.close();
				}
			};
		});
	}

	show() {
		this.dialog.showModal();
	}

	close() {
		this.dialog.close();
	}
}
