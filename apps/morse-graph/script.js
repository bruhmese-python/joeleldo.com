let isSpaceDown = false;
let pressStartTime = null;
let pressDuration = 0;

let dotDashLog = [];
let lastReleaseTime = null;
let wordStartTime = Date.now();
let WORD_GAP = 1000; // ms of inactivity to consider end of word
let DASH_THRESHOLD = 200; // ms to distinguish dot vs dash

const letter = document.getElementById("letter");
const svgObject = document.getElementById("mySvg");
// let letter = ""

const morseToChar = {
  // Letters
  ".-": "A",
  "-...": "B",
  "-.-.": "C",
  "-..": "D",
  ".": "E",
  "..-.": "F",
  "--.": "G",
  "....": "H",
  "..": "I",
  ".---": "J",
  "-.-": "K",
  ".-..": "L",
  "--": "M",
  "-.": "N",
  "---": "O",
  ".--.": "P",
  "--.-": "Q",
  ".-.": "R",
  "...": "S",
  "-": "T",
  "..-": "U",
  "...-": "V",
  ".--": "W",
  "-..-": "X",
  "-.--": "Y",
  "--..": "Z",

  // Numbers
  "-----": "0",
  ".----": "1",
  "..---": "2",
  "...--": "3",
  "....-": "4",
  ".....": "5",
  "-....": "6",
  "--...": "7",
  "---..": "8",
  "----.": "9",

  // Punctuation
  ".-.-.-": ".", // period
  "--..--": ",", // comma
  "..--..": "?", // question mark
  ".----.": "'", // apostrophe
  "-.-.--": "!", // exclamation mark
  "-..-.": "/", // slash
  "-.--.": "(", // open parenthesis
  "-.--.-": ")", // close parenthesis
  ".-...": "&", // ampersand
  "---...": ":", // colon
  "-.-.-.": ";", // semicolon
  "-...-": "=", // equals sign
  ".-.-.": "+", // plus
  "-....-": "-", // minus/hyphen
  "..--.-": "_", // underscore
  ".-..-.": '"', // quotation mark
  "...-..-": "$", // dollar sign
  ".--.-.": "@", // at symbol
};

// ----------------------------- SOUND ENGINE --------------------
// Global audio objects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = null;
let gainNode = null;

function startTone(frequency = 440, volume = 0.2) {
  oscillator = audioCtx.createOscillator();
  gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);

  oscillator.connect(gainNode).connect(audioCtx.destination);
  oscillator.start();
}

function stopTone() {
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    gainNode.disconnect();
    oscillator = null;
    gainNode = null;
  }
}

// ----------------------------- STROKE REGISTRATION AND SEND --------------------
function registerStrokes() {
  isSpaceDown = true;
  pressStartTime = Date.now();

  const output = document.getElementById("keystrokes");
  const output_letter = document.getElementById("letter-overlay");
  if (output.textContent.startsWith("Tap")) {
    output.textContent = "";
    output_letter.textContent = "";
  }

  // Add this:
  startTone();
}

function sendStrokes() {
  // Add this:
  stopTone();

  isSpaceDown = false;
  pressDuration = Date.now() - pressStartTime;

  const output = document.getElementById("keystrokes");
  const output_letter = document.getElementById("letter-overlay");

  if (pressDuration < DASH_THRESHOLD) {
    dotDashLog.push(".");
    if (output) {
      output.textContent += ".";
      highlight(output.textContent);
    }
  } else {
    dotDashLog.push("-");
    if (output) {
      output.textContent += "-";
      highlight(output.textContent);
    }
  }

  lastReleaseTime = Date.now();
}


// Listen for key state
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !isSpaceDown) {
    registerStrokes();
  }
  e.preventDefault(); // prevent default space scrolling
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    sendStrokes();
  }
  e.preventDefault();
});

// Listen for mouse state
const obj = document.getElementById("mySvg");

obj.onload = function () {
  const svgRoot = obj.contentDocument;

  svgRoot.addEventListener("mousedown", () => {
    if (!isSpaceDown) {
      isSpaceDown = true;
      registerStrokes();
    }
  });

  svgRoot.addEventListener("mouseup", () => {
    if (isSpaceDown) {
      isSpaceDown = false;
      sendStrokes();
    }
  });
};

function highlight(code) {
  letter.value = morseToChar[code];
  console.log("finding code: ", code);
  console.log("finding letter: ", letter.value);

  const output_letter = document.getElementById("letter-overlay");
  output_letter.textContent = letter.value;
}

function refreshSVG() {
  // const currentData = svgObject.getAttribute("data");
  // Force reload by adding a unique query string
  // svgObject.setAttribute("data", currentData + "?t=" + new Date().getTime());
  letter.value = "";
}

function loop() {
  const now = Date.now();
  const output = document.getElementById("keystrokes");
  const output_letter = document.getElementById("letter-overlay");

  // Check for word gap
  if (lastReleaseTime && now - lastReleaseTime > WORD_GAP) {
    if (dotDashLog.length > 0) {
      output.textContent = "Tap screen / press spacebar";
      output_letter.textContent = "undefined";
      dotDashLog = [];

      // reset the graph
      refreshSVG();
    }
    lastReleaseTime = null;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
