"use client";

import { initializeWasm } from "@provablehq/sdk";

let initialized = false;

export async function initAleo() {
  if (!initialized) {
    await initializeWasm();
    initialized = true;
  }
}