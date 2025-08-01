import { Field } from "../gui/field";
import { Title } from "../gui/gui";
export interface GUIControllerInterface {
  addField: (id: string, className: string) => Field;
  addTitle: (hSize: number, text: string, doAlignCenter?: boolean) => Title;
}
