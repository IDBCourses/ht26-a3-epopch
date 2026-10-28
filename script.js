/*
 * IDB Programming: A3 — a musical instrument
 *
 * All of the code for your instrument goes in this file. It's split into sections:
 *   settings — the "fixed" parts of your program
 *   state    — the parts of your program that change over time
 *   sound    — the Tone.js instruments and effects
 *   update   — updates the state every 100ms, if necessary
 *   use      — uses the state to make sound and shapes every 100ms, if necessary
 *   controls — what happens when the player uses the pointer
 *   setup    — starts everything
 *
 * The pointer events change the state. update() and use() each run every
 * 100ms, in a loop:
 *   1. update: change the state, e.g. based on time or on the pointer's movement
 *   2. use:    make sound and move shapes, based on the state
 *
 * Shapes come from shape.js: createShape() makes one, and its methods
 * (setPosition, setSize, setColour ...) change it.
 *
 * Tone.js documentation: https://tonejs.github.io/docs/15.1.22/
 */

import { createShape } from "./shape.js";

// ---------- Settings ----------
// Settings variables should contain all of the "fixed" parts of your programs
// For example: which notes you can play, how fast things move, the tempo.
// const note = "C4"; // the note played when the pointer goes down
// const shape

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
const shape = createShape("shape");

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth = new Tone.PolySynth(Tone.Synth).toDestination(); // can play several notes at once

// ---------- Update ----------
// Update the state. This is called every 100ms.
function update() {
  setTimeout(update, 100); // call update() again in 100 milliseconds
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  setTimeout(use, 100); // call use() again in 100 milliseconds
}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function startSound(event) {
  Tone.start(); // browsers only allow sound after the player has pressed something

  /*console.log("Pointer down at", event.clientX, event.clientY);
  synth.triggerAttackRelease(note, "8n"); // play the note for an eighth note */
}

function pointerEnter(event) {
  synth.triggerAttack("C4");
  shape.setColour(200, 80, 50);
  synth.volume.value = -12; // use this to change the volume of the sound, can be tied to changing value
}

function pointerLeave(event) {
  synth.triggerRelease("C4");
  shape.setColour(120, 80, 50);
}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  update(); // start the update loop
  use(); // start the use loop

  // Example: a shape near the middle of the window. Replace it with your own.
  shape.setPosition(0.3, 0.3);
  shape.setColour(120, 80, 50);
  shape.setRoundedness(0.3); // I initially spelled roundedness wrong lol
  shape.setSize(300); // doesn't seem to work?

  // Put your event listener code here
  window.addEventListener("pointerdown", startSound);

  shape.element.addEventListener("pointerenter", pointerEnter); // spelled pointerenter wrong, now fixed
  shape.element.addEventListener("pointerleave", pointerLeave);
}

setup(); // Always remember to call setup()!
