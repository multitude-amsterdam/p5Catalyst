import { catalyst } from "./lib";
import { timeline } from "./lib";

const sketchFunction = async (sketch, state) => {
  state.size = 50;
  state.text = "test";

  let img;

  sketch.setup = async () => {
    img = await sketch.loadImage("assets/image.jpg");
  };

  sketch.draw = () => {
    sketch.image(img, 0, 0);
    sketch.circle(sketch.mouseX, sketch.mouseY, state.size);
    sketch.circle(200, 200, state.size * 2);
  };
};

let { p5Instance, state } = catalyst.createContainer(sketchFunction);
catalyst.createGUI(p5Instance, (gui) => {
  gui.addSlider("Speed", 50, 100, 50, (value) => {
    state.size = value;
  });
});
