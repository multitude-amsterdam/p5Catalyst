class Dialog {
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

	prompt(html, defaultVal = '', confirmButtonLabel = 'OK') {
		/* 
            returns a Promise that resolves with input value
            usage:
            let result = await dialog.prompt('Enter your name:');
            or:
            dialog.prompt('Enter your name:').then(name => console.log(name));
        */
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

	show() {
		this.dialog.showModal();
	}

	close() {
		this.dialog.close();
	}
}

const dialog = new Dialog();
