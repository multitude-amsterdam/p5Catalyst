import type p5 from 'p5';
import type { GUIForP5 } from './gui';
/**
 * Base GUI element container used by controllers.
 */
export class Field {
	/**
	 * Creates a new Field instance.
	 * @param {p5} p5Instance - The p5Instance.
	 * @param {p5.Element} parentDiv - The parent element to attach the field to.
	 * @param {string} id - The ID to assign to the field (optional).
	 * @param {string} className - The CSS class to assign to the field (optional).
	 */
	div: p5.Element;
	constructor(gui: GUIForP5, id: string, className: string) {
		this.div = gui.p5Instance.createDiv();
		this.div.parent(gui.div);
		if (id != '') this.div.id(id);
		this.div.class(className);
	}

	//   /**
	//    * Sets the tooltip text for this field.
	//    * @param {string} tooltip - The tooltip text to set.
	//    */
	//   setTooltip(tooltip) {
	//     this.div.elt.title = tooltip;
	//   }

	//   /**
	//    * Sets the text content of this field.
	//    * @param {string} text - The new text content for the field.
	//    */
	//   setText(text) {
	//     this.div.elt.innerText = text;
	//   }

	//   /**
	//    * Hides this field by setting its display to 'none'.
	//    */
	//   hide() {
	//     this.div.hide();
	//   }

	//   /**
	//    * Shows this field by setting its display to '' (default).
	//    */
	//   show() {
	//     this.div.elt.style.display = ""; // more general than p5 .show()
	//     if (this.setDisplay) this.setDisplay(); // XYSlider needs this for now
	//   }

	//   /**
	//    * Checks if this field is currently hidden.
	//    * @returns {boolean} True if the field is hidden, false otherwise.
	//    */
	//   isHidden() {
	//     return this.div.elt.style.display == "none";
	//   }
}
