import p5 from "p5";

export const createGUI = (p5Instance: p5, userGUI?: (gui: any) => void) => {
  const guiInstance = {
    addSlider: (min: any, max: any, value: any, onChange: any) => {
      const slider = p5Instance.createSlider(min, max, value);
      slider.elt.oninput = () => onChange(slider.value());
      return slider;
    },
    addButton: (label: any, onClick: any) => {
      const button = p5Instance.createButton(label);
      button.mousePressed(onClick);
      return button;
    },
  };

  if (userGUI) {
    userGUI(guiInstance);
  }
};
