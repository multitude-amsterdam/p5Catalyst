import p5 from "p5";

export const createContainer = (
  userSketch: (
    sketch: p5,
    state: any
  ) => Promise<{ state?: any }> | { state?: any } | void
): { p5Instance: p5; state?: any } => {
  const state = {};

  const containerSketch = async (sketch: p5) => {
    await userSketch(sketch, state);

    const originalSetup = sketch.setup || (() => {});
    const originalDraw = sketch.draw || (() => {});
    const originalMouseMoved = sketch.mouseMoved || (() => {});

    sketch.setup = async () => {
      sketch.createCanvas(400, 400);
      await Promise.resolve(originalSetup());
    };

    sketch.draw = () => {
      originalDraw();
    };

    sketch.mouseMoved = () => {
      originalMouseMoved();
    };
  };

  const p5Instance = new p5(containerSketch);
  return { p5Instance, state };
};
