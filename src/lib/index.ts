import { createContainer } from "./create_container";
import { createGUI } from "./create_gui";
import "../style.css";
import type p5 from "p5";
import type { GUIControllerInterface } from "./types/gui_interface_type";

const initialize = async (
  sketchFunction: (
    sketch: p5,
    state: any
  ) => Promise<{ state?: any }> | { state?: any } | void,
  guiSetup?: (gui: GUIControllerInterface, state: any) => void // Add state parameter
) => {
  const container = await createContainer(sketchFunction);
  const gui = createGUI(container.p5Instance, container.state, guiSetup);

  return { container, gui };
};

export const catalyst = {
  createContainer,
  createGUI,
  initialize,
};
