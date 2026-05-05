import { snake } from "./cursor/index.js";
import { textReveal } from "./text/index.js";


const lumo = {
  snake,
  textReveal
};

if (typeof window !== "undefined") {
  window.lumo = {
    ...(window.lumo || {}),
    ...lumo
  };
}

export default lumo;