import "@testing-library/jest-dom/vitest";
import { i18n } from "@lingui/core";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";
import { messages } from "./locales";

expect.extend(matchers);

i18n.load("en", messages.en);
i18n.activate("en");

// jsdom lacks the browser APIs Radix primitives (Select, Dialog, Tooltip,
// Popper) call. Each stub is installed only when the API is missing, so a
// future jsdom that implements it wins and a test can still spy on it.
const noop = () => undefined;

function stub(target: object, name: string, value: unknown) {
  if (typeof (target as Record<string, unknown>)[name] !== "function") {
    Object.defineProperty(target, name, {
      value,
      configurable: true,
      writable: true,
    });
  }
}

class ResizeObserverStub {
  observe = noop;
  unobserve = noop;
  disconnect = noop;
}
if (typeof globalThis.ResizeObserver === "undefined") {
  Object.defineProperty(globalThis, "ResizeObserver", {
    value: ResizeObserverStub,
    configurable: true,
    writable: true,
  });
}

stub(Element.prototype, "scrollIntoView", noop);
stub(Element.prototype, "hasPointerCapture", () => false);
stub(Element.prototype, "setPointerCapture", noop);
stub(Element.prototype, "releasePointerCapture", noop);
stub(window, "matchMedia", (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: noop,
  removeListener: noop,
  addEventListener: noop,
  removeEventListener: noop,
  dispatchEvent: () => false,
}));
