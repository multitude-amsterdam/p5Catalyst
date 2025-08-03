export interface State {
  width: number;
  height: number;
  resize?: (width: number, height: number) => void;
  [key: string]: any; // Allow other properties
}

export type Dimensions = { width: number; height: number };
