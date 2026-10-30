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
const noteS = ["C4", "D4", "E4", "G4", "A4", "C5"]; // pentathonic scale
// new stuff below
const noteLength = "8n"; // fairly certain this doesn't actually work
const movementThreshold = 20;
const maxGhostEnergy = 50;

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
const shape = createShape("shape"); // test
const ghost = createShape("ghost"); // ghost
// new stuff below
const isPlaying = false;
let inGhost = false;
const pastX = 0;
const pastY = 0;
const lastTime = 0;
const speed = 0;
const distance = 0;
const ghostEnergy = 0;

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
//const synth = new Tone.PolySynth(Tone.Synth).toDestination(); // can play several notes at once // I want to change this, but don't want to ruin the code
//new stuff below, filter and reverb work on synth, i'll have to test ghostSynth
const synth = new Tone.Synth({
  oscillator: {
    type: "sine"
  },

  envelope: {
    attack: 0.05,
    decay: 0.2,
    sustain: 0.4
  }
});
const reverb = new Tone.Reverb({
  decay: 5,
  wet: 0.5
});
const filter = new Tone.Filter(
  1200,
  "lowpass"
);
synth.connect(filter);
filter.connect(reverb);
reverb.toDestination();

// ---------- Update ----------
// Update the state. This is called every 100ms.
function update() {
  setTimeout(update, 100); // call update() again in 100 milliseconds
  // new stuff below
  if (!isPlaying) { // unsure what this really does right now but trust the process
    return;
  }
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  setTimeout(use, 100); // call use() again in 100 milliseconds
  // new stuff below
  /*const reveal = Math.min(
    1,
    ghostEnergy / maxGhostEnergy
  );
  const size = 120 + Math.min(
    40,
    speed * 4
  );
  ghost.element.style.opacity = 0.15 + reveal * 0.85;
  if (ghost.element.style.transform) {
    ghost.element.style.transform = `scale(${size / 120})`;
  } */
}

// ---------- Controls (Event Handlers) ----------
function startSound(event) {
  Tone.start(); // browsers only allow sound after the player has pressed something
  // i'll likely want to change when and where the above is triggered for a more seamless experience

  console.log("Pointer down at", event.clientX, event.clientY);
}

function pointerEnter(event) {
  synth.triggerAttackRelease("C4", "8n");
  shape.setColour(200, 10, 80);
  synth.volume.value = +12; // use this to change the volume of the sound, can be tied to changing value
}

function pointerLeave(event) {
  console.log("pointer left"); // here for testing
  synth.triggerAttackRelease("C4", "12n");
  shape.setColour(120, 80, 50);
  synth.volume.value = -12;
}

function ghostEnter(event) {
  synth.triggerAttackRelease("C4", "8n");
  synth.volume.value = +12;
  ghost.setColour(120, 80, 50);
  teleportGhost();
}

function ghostLeave(event) {
  console.log("ghost left"); // also here for testing
  synth.volume.value = -12;
  synth.triggerAttackRelease("G4", "12n");
  ghost.setColour(0, 0, 100);
}

function pointerMove(event) { // this works but the shape isnt centred on pointer right now
  const lastX = event.clientX / window.innerWidth;
  const lastY = event.clientY / window.innerHeight;

  // ghost.setPosition(lastX, lastY); // add back later, makes shape follow pointer
}

function teleportGhost() {
  const randomX = Math.random() * 0.8 + 0.1;
  const randomY = Math.random() * 0.8 + 0.1;

  ghost.setPosition(randomX, randomY);
}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  update(); // start the update loop
  use(); // start the use loop

  shape.setPosition(0.3, 0.3);
  shape.setColour(120, 80, 50);
  shape.setRoundedness(0.1);
  shape.setSize(100);

  // ghost.setPosition(0.5, 0.5); // remove?
  teleportGhost();

  // Put your event listener code here
  window.addEventListener("pointerdown", startSound);
  window.addEventListener("pointermove", pointerMove);

  shape.element.addEventListener("pointerenter", pointerEnter);
  shape.element.addEventListener("pointerleave", pointerLeave);

  // new stuff below
  ghost.element.addEventListener("pointerenter", ghostEnter);
  ghost.element.addEventListener("pointerleave", ghostLeave);
  /*ghost.element.addEventListener("pointerdown", ghostpointDown);
  ghost.element.addEventListener("pointermove", ghostpointMove);
  ghost.element.addEventListener("pointerup", ghostpointUp);*/
  // ghost.element.addEventListener("pointercancel", stopPlaying);

}

setup(); // ring ring calling doctor setup();
