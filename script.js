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
const noteS = ["C4", "D4", "E4", "G4", "A4", "C5"]; // uses an array to store the notes used in the ghost melody
const ghost = createShape("ghost"); // ghost, creates the hidden target players search for
const flashlight = createShape("flashlight"); // flashlight, visual representation of players' cursor

// ---------- State ----------
// State variables are the parts of your program that change over time.
// current pointer position, gets updated later in program
let pointerX = 0;
let pointerY = 0;

// current position of the ghost, gets updated later in program and the program breaks without it here
let ghostX = 0.5;
let ghostY = 0.5;

const trail = []; // initial array for shapes used to draw the visual tray behind the flashlight/pointer
const trailLength = 5; // constant for maximum number of previous pointer positions stored for the trail
const pointerHistory = []; // array storing a history of pointer positions so interaction is based on MOVEMENT OVER TIME rather than a single pointer position.

// previous pointer position used to calculate the movement speed
let pastX = 0;
let pastY = 0;

let pointerSpeed = 0; // distance travelled between pointer events

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth = new Tone.Synth({
  oscillator: {
    type: "triangle8"
  },

  envelope: {
    attack: 0.3,
    decay: 0.2,
    sustain: 0.5,
    release: 0.8
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

const vibrato = new Tone.Vibrato({
  frequency: 5,
  depth: 0.35
});

synth.connect(vibrato);
vibrato.connect(filter);
filter.connect(reverb);
reverb.toDestination();

// continuous drone used as an audio clue for the ghost hunt
// the drone gets louder and brighter as the pointer gets closer to the ghost
const ghostDrone = new Tone.Oscillator({
  frequency: 220,
  type: "triangle8"
});

const ghostGain = new Tone.Gain(0);

ghostDrone.connect(ghostGain);
ghostGain.connect(reverb);
ghostDrone.start();

// ---------- Update ----------
// Update the state. This is called every 10ms.
function update() {
  setTimeout(update, 10); // call update() again in 10 milliseconds
  // makes the ghost gently pulse to give it a more floating and animated visual appearance
  ghost.setSize(
    80 + Math.sin(Date.now() * 0.002) * 10
  );
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  setTimeout(use, 100); // call use() again in 100 milliseconds
  const ghostDX = pointerX - ghostX;
  const ghostDY = pointerY - ghostY;
  const distance = Math.sqrt( // calculates the distance between the pointer and the ghost
    ghostDX * ghostDX + ghostDY * ghostDY
  );
  const intensity = Math.max( // converts distance into an intensity value. highter intensity means that the player is getting closer to the ghost.
    0, 1 - distance * 1.5
  );

  // increases the drone volume as the player approaches the ghost and/or moves rapidly
  // pointer distance continuously affects drone volume
  ghostGain.gain.rampTo(
    intensity * 0.2,
    0.1
  );
  // pointer distance continuously affects timbre by opening the filter
  filter.frequency.rampTo(
    500 + intensity * 400,
    0.1
  );

  // ghost's visibility changes continuously based on proximity to pointer
  ghost.element.style.opacity = 0.02 + intensity * 0.98; // gradually reveal the ghost as the player/pointer gets closer

  // increases the flashlight's glow based on movement speed
  const glowSize = 20 + pointerSpeed * 300;
  flashlight.element.style.boxShadow = `0 0 ${glowSize}px 20px hsl(69, 87%, 79%)`; //idk if this does anything

  // visual trail shows recent pointer movement using stored position history
  // uses forEach() to update each trail element
  trail.forEach((dot, index) => {
    if (pointerHistory[index]) {
      dot.setPosition(pointerHistory[index].x,
        pointerHistory[index].y
      );
      dot.setSize(10 + index * 10);
      dot.element.style.opacity = (index + 1) / trailLength;
      dot.element.style.filter = "blur(10px)";
    }
  });
}

// ---------- Controls (Event Handlers) ----------
function startSound(event) {
  Tone.start(); // browsers only allow sound after the player has pressed something
  // i'll likely want to change when and where the above is triggered for a more seamless experience

  console.log("Pointer down at", event.clientX, event.clientY);
}

function ghostEnter(event) {
  // selects a different starting note each time pointer touches the ghost so the melody varies.
  const randomStart = Math.floor(Math.random() * noteS.length);
  noteS.forEach((_, index) => {
    const noteGhost = noteS[(randomStart + index) % noteS.length];
    setTimeout(() => {
      synth.triggerAttackRelease(noteGhost, "32n");
    }, index * 50);
  });

  // visual effects that highlights the ghost briefly as it is discovered
  ghost.setColour(0, 1, 50);
  ghost.element.style.boxShadow = "0 0 50px hsl(192, 84%, 71%)";

  setTimeout(() => { // delays the teleportation briefly so that there's enough time for the note to get played!
    teleportGhost();
  }, 1000);
}

function ghostLeave(event) {
  synth.volume.value = -12;
  synth.triggerAttackRelease("G4", "16n"); // plays a short cue to indicate that the ghost has teleported
  ghost.setColour(0, 0, 100); // returns the ghost's color back to normal
  ghost.element.style.boxShadow = ""; // removes the discovery glow
}

// pointerevent data is used to continuously control both sound and visuals.
function pointerMove(event) {
  // this function updates pointer position, movement speed, flashlight position and trail history

  pointerX = event.clientX / window.innerWidth;
  pointerY = event.clientY / window.innerHeight;

  flashlight.setPosition(pointerX, pointerY); // sets the flashlights position to the pointer, not entirely centred unfortunately but know that I've tried.

  // measures the pointer movement since the previous event
  pastX = pointerX;
  pastY = pointerY;
  const moveDX = pointerX - pastX;
  const moveDY = pointerY - pastY;
  // calculates pointer speed using current and previous pointer positions (processing data over time)
  pointerSpeed = Math.sqrt(moveDX * moveDX + moveDY * moveDY);

  ghostDrone.frequency.rampTo( // increases the drone pitch when the pointer moves more quickly
    220 + pointerSpeed * 300,
    0.1
  );

  pointerHistory.push({ // stores recent pointer positions for the trail effect
    x: pointerX,
    y: pointerY
  });
  if (pointerHistory.length > trailLength) {
    pointerHistory.shift();
  }
}

function teleportGhost() { // moves the ghost to a new random position on the screen
  ghostX = Math.random() * 0.8 + 0.1;
  ghostY = Math.random() * 0.8 + 0.1;

  ghost.setPosition(ghostX, ghostY);
}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  update(); // start the update loop
  use(); // start the use loop

  flashlight.setRoundedness(1); // configures the flashlight's appearance
  flashlight.setSize(50);
  flashlight.setColour(70, 90, 80);
  flashlight.setPosition(0, 0);
  flashlight.element.style.boxShadow = "0 0 100px 20px hsl(69, 87%, 79%)";

  // uses a for loop to create trail shapes
  for (let i = 0; i < trailLength; i++) { // creates the trail shapes used to visualise recent pointer movement.
    const dot = createShape("trail");
    dot.setRoundedness(1);
    dot.setColour("hsl(69, 86%, 74%)");
    dot.setSize(30);
    trail.push(dot);
  }

  teleportGhost(); // spawns the ghost in a random location when setup is called at the start of the program

  // pointer provide the main form of interaction (eventListeners)
  window.addEventListener("pointerdown", startSound);
  window.addEventListener("pointermove", pointerMove);

  ghost.element.addEventListener("pointerenter", ghostEnter);
  ghost.element.addEventListener("pointerleave", ghostLeave);
}

setup(); // ring ring calling doctor setup();
