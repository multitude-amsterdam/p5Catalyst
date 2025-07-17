/**
 * @fileoverview Simple modal dialog helper used for alerts and prompts.
 *
 * @see Dialog
 * @see dialog
 */

/**
 * Wrapper around a HTML `<dialog>` element providing alert and prompt helpers.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement}
 */
class Dialog {
	/**
	 * Create a new dialog wrapper and bind DOM elements.
	 */
	constructor() {
		this.dialog = document.querySelector('.dialog');
		this.dialogClose = document.querySelector('.dialog-close');
		this.dialogBackdropClose = document.querySelector(
			'.dialog-backdrop-close'
		);
		this.contentWrapper = this.dialog.querySelector(
			'.dialog-content-wrapper'
		);

		this.dialogClose.addEventListener('click', () => {
			this.close();
		});
		this.dialogBackdropClose.addEventListener('click', () => {
			this.close();
		});

		this.promptForm = this.dialog.querySelector('.dialog-prompt-form');
		this.promptInput = this.dialog.querySelector('.dialog-prompt-input');
		this.promptConfirmButton = this.dialog.querySelector(
			'.dialog-prompt-confirm'
		);
	}

	/**
	 * Show a message in the dialog.
	 * @param {string} html HTML content or plain text to display
	 * @example
	 * dialog.alert('This is an alert message.');
	 */
	alert(html) {
		if (html !== '' && html.indexOf('<') === -1) {
			html = `<p>${html}</p>`;
		}
		this.promptForm.style.display = 'none';
		this.contentWrapper.innerHTML = html;
		// close with Enter or Escape keys
		this.contentWrapper.onkeydown = e => {
			if (gui) gui.isTypingText = true;
			if (e.key === 'Enter' || e.key === 'Escape') {
				e.preventDefault();
				this.close();
			}
		};
		this.show();
	}

	/**
	 * Display a prompt dialog and resolve with the entered value.
	 *
	 * @param {string} html text or HTML to show
	 * @param {string} [defaultVal=''] pre-filled input value
	 * @param {string} [confirmButtonLabel='OK'] label for the confirm button
	 * @returns {Promise<string>} resolves with the typed value
	 *
	 * @example
	 * // Using the dialog in a promise chain
	 * dialog.prompt('Enter your name:').then(name => console.log(name));
	 * @example
	 * // Using the dialog in an async function
	 * async function getUserName() {
	 *     let name = await dialog.prompt('Enter your name:');
	 *    console.log(`Hello, ${name}!`);
	 * }
	 */
	prompt(html, defaultVal = '', confirmButtonLabel = 'OK') {
		if (html !== '' && html.indexOf('<') === -1) {
			html = `<p>${html}</p>`;
		}

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
				if (gui) gui.isTypingText = true;
				if (e.key === 'Enter') {
					e.preventDefault();
					print(this.promptInput.value);
					resolve(this.promptInput.value);
					this.close();
				}
			};
		});
	}

	/**
	 * Open the underlying `<dialog>` element.
	 */
	show() {
		this.dialog.showModal();
	}

	/**
	 * Close the dialog.
	 */
	close() {
		this.dialog.close();
	}
}

/**
 * Global instance used throughout the application.
 * @global
 * @type {Dialog}
 * @see Dialog
 */
const dialog = new Dialog();
