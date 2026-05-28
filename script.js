const wordsContainer = document.getElementById("words");
const input = document.getElementById("input");
const timeDisplay = document.getElementById("time");
const wpmDisplay = document.getElementById("wpm");
const restartBtn = document.getElementById("restartBtn");
const timeSelect = document.getElementById("timeSelect");

const resultModal = document.getElementById("resultModal");
const finalWpm = document.getElementById("finalWpm");
const finalAccuracy = document.getElementById("finalAccuracy");
const modalRestartBtn = document.getElementById("modalRestartBtn");

let selectedTime = parseInt(timeSelect.value);
let timeLeft = selectedTime;
let timer = null;
let started = false;

let currentWordIndex = 0;
let correctChars = 0;
let totalChars = 0;
let words = [];

function getRandomWords(count) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return arr;
}

function renderWords() {
  wordsContainer.innerHTML = "";

  words.forEach((word, index) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.classList.add("word");

    if (index === currentWordIndex) {
      span.classList.add("current");
    }

    wordsContainer.appendChild(span);
  });
}

function calculateLiveStats() {
  const typed = input.value;
  const expected = words[currentWordIndex] || "";

  const elapsedSeconds = selectedTime - timeLeft;
  const minutes = elapsedSeconds / 60;

  if (minutes <= 0) {
    return { wpm: 0, accuracy: 100 };
  }

  let tempCorrect = correctChars;
  let tempTotal = totalChars + typed.length;

  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === expected[i]) {
      tempCorrect++;
    }
  }

  if (tempTotal <= 0) {
    return { wpm: 0, accuracy: 100 };
  }

  const grossWPM = (tempTotal / 5) / minutes;
  const accuracy = tempCorrect / tempTotal;
  const finalWPM = grossWPM * accuracy;

  return {
    wpm: Math.round(finalWPM),
    accuracy: Math.round(accuracy * 100),
  };
}

function updateWpmOnce() {
  const stats = calculateLiveStats();
  wpmDisplay.textContent = stats.wpm;
}

function showResults() {
  const stats = calculateLiveStats();

  finalWpm.textContent = stats.wpm;
  finalAccuracy.textContent = stats.accuracy + "%";

  resultModal.classList.remove("hidden");
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;

    if (timeLeft < 0) {
      timeLeft = 0;
    }

    timeDisplay.textContent = timeLeft;
    updateWpmOnce();

    if (timeLeft <= 0) {
      clearInterval(timer);
      input.disabled = true;
      input.blur();
      showResults();
    }
  }, 1000);
}

function moveNext(isCorrect, typedWord, expectedWord) {
  const spans = document.querySelectorAll(".word");

  if (spans[currentWordIndex]) {
    spans[currentWordIndex].classList.remove("current");
    spans[currentWordIndex].classList.add(isCorrect ? "correct" : "wrong");
  }

  totalChars += typedWord.length;

  if (isCorrect) {
    correctChars += expectedWord.length;
  } else {
    for (let i = 0; i < typedWord.length; i++) {
      if (typedWord[i] === expectedWord[i]) {
        correctChars++;
      }
    }
  }

  currentWordIndex++;

  if (currentWordIndex >= words.length) {
    words = words.concat(getRandomWords(40));
    renderWords();
  } else {
    const updatedSpans = document.querySelectorAll(".word");
    updatedSpans[currentWordIndex]?.classList.add("current");
  }

  input.value = "";
  keepCurrentWordVisible();
}

function keepCurrentWordVisible() {
  const currentWord = document.querySelector(".word.current");

  if (currentWord) {
    currentWord.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }
}

input.addEventListener("input", () => {
  if (!started) {
    started = true;
    startTimer();
  }

  const typed = input.value;

  if (typed.includes(" ")) {
    const typedWord = typed.trim();
    const expectedWord = words[currentWordIndex];

    if (typedWord.length > 0) {
      moveNext(typedWord === expectedWord, typedWord, expectedWord);
    } else {
      input.value = "";
    }
  }
});

function resetGame() {
  clearInterval(timer);

  selectedTime = parseInt(timeSelect.value);
  timeLeft = selectedTime;
  started = false;

  currentWordIndex = 0;
  correctChars = 0;
  totalChars = 0;

  timeDisplay.textContent = timeLeft;
  wpmDisplay.textContent = "0";

  input.disabled = false;
  input.value = "";
  input.focus();

  resultModal.classList.add("hidden");

  words = getRandomWords(80);
  renderWords();
}

restartBtn.onclick = resetGame;
modalRestartBtn.onclick = resetGame;
timeSelect.onchange = resetGame;

resetGame();
