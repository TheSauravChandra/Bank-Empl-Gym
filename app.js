(function () {
  "use strict";

  var START_LENGTH = 10;
  var LENGTH_CAP = 30;
  var score = 0;
  var lengthValue = START_LENGTH;
  var target = "";
  var roundStartedAt = 0;
  var flashTimer = null;

  var scoreEl = document.getElementById("score");
  var statusEl = document.getElementById("status");
  var targetEl = document.getElementById("target");
  var lengthEl = document.getElementById("length-label");
  var progressEl = document.getElementById("length-progress");
  var entryEl = document.getElementById("entry");
  var keypadEl = document.getElementById("keypad");
  var leftPane = document.querySelector(".pane-left");

  function displayedLength() {
    return Math.floor(lengthValue);
  }

  function nextIncrement(len) {
    var step = 50 / len - 2 / 3;
    if (len < LENGTH_CAP) {
      return Math.max(1, step);
    }
    return Math.max(0.12, Math.min(0.99, 30 / len));
  }

  function randomDigits(count) {
    var out = "";
    var i;
    for (i = 0; i < count; i += 1) {
      out += String(Math.floor(Math.random() * 10));
    }
    return out;
  }

  function updateHud() {
    var shown = displayedLength();
    var fraction = lengthValue - shown;
    scoreEl.innerHTML = String(score);
    lengthEl.innerHTML = shown + " digits";
    progressEl.style.width = Math.round(fraction * 100) + "%";
  }

  function newRound() {
    target = randomDigits(displayedLength());
    targetEl.innerHTML = target;
    entryEl.value = "";
    roundStartedAt = new Date().getTime();
    updateHud();
  }

  function flash(ok) {
    var className = ok ? "ok" : "bad";
    leftPane.className = "pane pane-left " + className;
    entryEl.className = ok ? "" : "bad";
    if (flashTimer) {
      clearTimeout(flashTimer);
    }
    flashTimer = setTimeout(function () {
      leftPane.className = "pane pane-left";
      entryEl.className = "";
    }, 280);
  }

  function appendDigit(digit) {
    if (entryEl.value.length >= displayedLength() + 8) {
      return;
    }
    entryEl.value += digit;
  }

  function deleteDigit() {
    entryEl.value = entryEl.value.slice(0, -1);
  }

  function submitEntry() {
    var guess = entryEl.value;
    var now = new Date().getTime();
    var elapsed = Math.max(1, now - roundStartedAt);
    var digits = displayedLength();
    var expectedMs;
    var speedRatio;
    var points;

    if (!guess) {
      statusEl.innerHTML = "Enter the number, then submit.";
      return;
    }

    if (guess === target) {
      expectedMs = digits * 280;
      speedRatio = expectedMs / elapsed;
      points = Math.round(digits * 8 * Math.min(2.4, Math.max(0.35, speedRatio)));
      score += points;
      lengthValue += nextIncrement(lengthValue);
      flash(true);
      statusEl.innerHTML = "+" + points;
      newRound();
      return;
    }

    score = Math.max(0, score - Math.round(digits * 1.5));
    flash(false);
    statusEl.innerHTML = "Mismatch. Same number. Try again.";
    updateHud();
    entryEl.value = "";
    entryEl.focus();
  }

  function onKeypadClick(event) {
    var button = event.target;
    var key;
    var action;

    if (!button || button.nodeName !== "BUTTON") {
      return;
    }

    key = button.getAttribute("data-key");
    action = button.getAttribute("data-action");

    if (key) {
      appendDigit(key);
      return;
    }
    if (action === "delete") {
      deleteDigit();
      return;
    }
    if (action === "submit") {
      submitEntry();
    }
  }

  function onEntryKeydown(event) {
    var code = event.keyCode;
    var key = event.key;

    if (code === 13) {
      event.preventDefault();
      submitEntry();
      return;
    }
    if (code === 8) {
      return;
    }
    if (key && key.length === 1 && key >= "0" && key <= "9") {
      return;
    }
    if (code >= 48 && code <= 57) {
      return;
    }
    if (code >= 96 && code <= 105) {
      return;
    }
    event.preventDefault();
  }

  keypadEl.onclick = onKeypadClick;
  entryEl.onkeydown = onEntryKeydown;
  entryEl.onpaste = function (event) {
    event.preventDefault();
  };

  newRound();
  entryEl.focus();
}());
