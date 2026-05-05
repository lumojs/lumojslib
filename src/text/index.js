import { TextAnimator } from "./text.js";

export function textReveal(selector, options) {
  return new TextAnimator(selector, options);
}
