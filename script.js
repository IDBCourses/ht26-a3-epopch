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
// const randomNote = noteS[Math.floor(Math.random() * noteS.length)];
const noteLength = "8n"; // fairly certain this doesn't actually work
const movementThreshold = 20;
const maxGhostEnergy = 50;

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
const shape = createShape("shape"); // test
const ghost = createShape("ghost"); // ghost
const flashlight = createShape("flashlight"); // flash light

// new stuff below
let pointerX = 0; // stores the pointers position
let pointerY = 0;

let ghostX = 0.5;
let ghostY = 0.5;

// trying NEW STUFF
const trail = [];
const trailLength = 5;
const pointerHistory = [];

const isPlaying = false;
let ghostNoteIndex = 0;
let pastX = 0;
let pastY = 0;
let pointerSpeed = 0;

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
//const synth = new Tone.PolySynth(Tone.Synth).toDestination(); // can play several notes at once // I want to change this, but don't want to ruin the code
//new stuff below, filter and reverb work on synth, i'll have to test ghostSynth
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

const vibrato = new Tone.Vibrato({ // adds a more wobbly feel to the sound
  frequency: 5,
  depth: 0.35
});

synth.connect(vibrato);
vibrato.connect(filter);
filter.connect(reverb);
reverb.toDestination();

// ghost drone below
const ghostDrone = new Tone.Oscillator({
  frequency: 220,
  type: "sine"
});
const ghostGain = new Tone.Gain(0);
ghostDrone.connect(ghostGain);
ghostGain.connect(reverb);
ghostDrone.start();

// ---------- Update ----------
// Update the state. This is called every 100ms.
function update() {
  setTimeout(update, 10); // call update() again in 100 milliseconds
  // new stuff below
  ghost.setSize(
    80 + Math.sin(Date.now() * 0.002) * 10
  );
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  setTimeout(use, 100); // call use() again in 100 milliseconds
  // new stuff below
  const ghostDX = pointerX - ghostX;
  const ghostDY = pointerY - ghostY;
  const distance = Math.sqrt(
    ghostDX * ghostDX + ghostDY * ghostDY
  );
  const intensity = Math.max(
    0, 1 - distance * 1.5
  );
  const glowSize = 20 + pointerSpeed * 300;

  ghostGain.gain.rampTo(
    intensity * 0.2,
    0.1
  );

  filter.frequency.rampTo(
    500 + intensity * 400,
    0.1
  );

  ghost.element.style.opacity = 0.02 + intensity * 0.98;
  flashlight.element.style.boxShadow = `0 0 ${glowSize}px 20px hsl(69, 87%, 79%)`; //idk if this does anything

  trail.forEach((dot, index) => {
    if (pointerHistory[index]) {
      dot.setPosition(pointerHistory[index].x,
        pointerHistory[index].y
      );
      dot.setSize(10 + index * 10);
      dot.element.style.opacity = (index + 1) / trailLength;
    }
  });
}

// ---------- Controls (Event Handlers) ----------
function startSound(event) {
  Tone.start(); // browsers only allow sound after the player has pressed something
  // i'll likely want to change when and where the above is triggered for a more seamless experience

  console.log("Pointer down at", event.clientX, event.clientY);
}

function pointerEnter(event) {
  synth.triggerAttack("C4");
  shape.setColour(200, 10, 80);
  //synth.volume.value = +12; // use this to change the volume of the sound, can be tied to changing value
}

function pointerLeave(event) {
  console.log("pointer left"); // here for testing
  synth.triggerRelease();
  shape.setColour(120, 80, 50);
  //synth.volume.value = -12;
}

function ghostEnter(event) { // when ghost gets touched by the pointer it'll teleport
  /*const randomNote = noteS[Math.floor(Math.random() * noteS.length)];
  //synth.volume.value = +12;
  synth.triggerAttackRelease(randomNote, "12n"); */ // random note

  // testing new thing below, this plays a small melody when ghost is touched
  /*noteS.forEach((note, index) => {
    setTimeout(() => {
      synth.triggerAttackRelease(note, "32n");
    }, index * 50);
  }); */

  // another test below, splendid it works. makes the jingle different everytime the ghost is touched
  const randomStart = Math.floor(Math.random() * noteS.length);
  noteS.forEach((_, index) => {
    const noteGhost = noteS[(randomStart + index) % noteS.length];
    setTimeout(() => {
      synth.triggerAttackRelease(noteGhost, "32n");
    }, index * 50);
  });

  ghost.setColour(0, 1, 50); // fix color later
  ghost.element.style.boxShadow = "0 0 50px hsl(192, 84%, 71%)"; // adds box shadow when ghost is found

  setTimeout(() => { // delays the teleportation briefly so that there's enough time for the note to get played!
    teleportGhost();
  }, 1000);
}

function ghostLeave(event) {
  console.log("ghost left"); // also here for testing
  synth.volume.value = -12;
  synth.triggerAttackRelease("G4", "16n");
  //synth.triggerAttackRelease(randomNote, "12n");
  ghost.setColour(0, 0, 100);
  ghost.element.style.boxShadow = ""; // removes box shadow
}

function pointerMove(event) { // this works but the shape isnt centred on pointer right now
  const lastX = event.clientX / window.innerWidth;
  const lastY = event.clientY / window.innerHeight;
  flashlight.setPosition(lastX, lastY); // add back later, makes shape follow pointer

  pointerX = event.clientX / window.innerWidth;
  pointerY = event.clientY / window.innerHeight;

  // new stuff below, unsure if I want to keep this, check again later
  const moveDX = pointerX - pastX;
  const moveDY = pointerY - pastY;

  pointerSpeed = Math.sqrt(moveDX * moveDX + moveDY * moveDY);

  pastX = pointerX;
  pastY = pointerY;

  ghostDrone.frequency.rampTo(
    220 + pointerSpeed * 300,
    0.1
  );

  // NEW STUFF
  pointerHistory.push({
    x: pointerX,
    y: pointerY
  });
  if (pointerHistory.length > trailLength) {
    pointerHistory.shift();
  }
}

function teleportGhost() {
  ghostX = Math.random() * 0.8 + 0.1;
  ghostY = Math.random() * 0.8 + 0.1;

  ghost.setPosition(ghostX, ghostY);
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

  flashlight.setRoundedness(1);
  flashlight.setSize(50);
  flashlight.setColour(70, 90, 80);
  flashlight.setPosition(0, 0);
  flashlight.element.style.boxShadow = "0 0 100px 20px hsl(69, 87%, 79%)";

  for (let i = 0; i < trailLength; i++) {
    const dot = createShape("trail");
    dot.setRoundedness(1);
    dot.setColour("white");
    dot.setSize(30);
    trail.push(dot);
  }

  teleportGhost(); // spawns the ghost in a random location when setup is called at the start of the program

  // Event listeners below
  window.addEventListener("pointerdown", startSound);
  window.addEventListener("pointermove", pointerMove);

  shape.element.addEventListener("pointerenter", pointerEnter);
  shape.element.addEventListener("pointerleave", pointerLeave);

  ghost.element.addEventListener("pointerenter", ghostEnter);
  ghost.element.addEventListener("pointerleave", ghostLeave);
}

setup(); // ring ring calling doctor setup();
