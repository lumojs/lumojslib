import { snake } from "./cursor/index.js";

if (typeof window !== "undefined") {
  window.lumo = {
    ...(window.lumo || {}),
    snake,
  };
}

export { snake };