$(document).ready(function () {
  let text = "";
  let clickedWords = [];
  let intervalId = null;
  let chosenWord = "";
  let count = 0;
  let chosenWordCount = 0;

  // DOM elements caching
  const $start = $("#start");
  const $startBtn = $("#startBtn");
  const $wordToSelect = $("#wordToSelect");
  const $textContent = $("#textContent");
  const $counter = $("#counter");
  const $timer = $("#timer");
  const $summary = $("#summary");
  const $summaryText = $("#summaryText");
  const $summaryBtn = $("#summaryBtn");

  // Initialization
  function init() {
    loadText();
    setupEventHandlers();
  }

  // Load text from the server
  function loadText() {
    $.getJSON("/text/medium")
      .done((data) => {
        text = data.text;
        chosenWord = chooseRandomWordFromText(text);
        if (!chosenWord) {
          console.log("Brak słowa, które występuje co najmniej 5 razy.");
          return;
        }

        displayStart();
      })
      .fail(() => {
        console.log("Błąd podczas ładowania tekstu.");
      });
  }

  // Set up event handlers
  function setupEventHandlers() {
    $startBtn.click(() => {
      $start.remove();
      displayText(text);
      startTimer();
    });

    $summaryBtn.click(submit);
  }

  // Display the start screen with the chosen word
  function displayStart() {
    $summary.hide();
    $wordToSelect.text("Słowo: " + chosenWord);
  }

  // Display the loaded text with clickable words
  function displayText(text) {
    const words = text.replace(/\n/g, " ").split(" ");

    $textContent.empty();
    $counter.text(`Ilość zaznaczonych wystąpień słowa "${chosenWord}": 0`);
    $timer.text("00-00");

    words.forEach((word) => {
      const $span = $("<span>")
        .text(word + " ")
        .css("cursor", "pointer")
        .css("user-select", "none")
        .click(function () {
          toggleWord($(this));
        });

      $textContent.append($span);
    });
  }

  // Toggle the selection of a word
  function toggleWord($span) {
    const clickedWord = $span.text().trim().toLowerCase();
    const index = clickedWords.indexOf(clickedWord);

    if ($span.css("color") === "rgb(255, 0, 0)") {
      // If the word is already red
      $span.css("color", "black");
      if (index !== -1) clickedWords.splice(index, 1);
    } else {
      $span.css("color", "red");
      clickedWords.push(clickedWord);
    }

    updateCounter();
  }
  // Choose a random word that appears at least 5 times in the text
  function chooseRandomWordFromText(text) {
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts = {};

    words.forEach((word) => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    const eligibleWords = Object.keys(wordCounts).filter(
      (word) => wordCounts[word] >= 5
    );

    if (eligibleWords.length === 0) return null;

    chosenWordCount = eligibleWords.length;

    return eligibleWords[Math.floor(Math.random() * eligibleWords.length)];
  }

  // Update the counter for selected instances of the chosen word
  function updateCounter() {
    count = clickedWords.filter((word) => word === chosenWord).length;
    $counter.text(
      `Ilość zaznaczonych wystąpień słowa "${chosenWord}": ${count}`
    );
  }

  // Start a one-minute timer
  function startTimer() {
    let totalSeconds = 0;

    intervalId = setInterval(() => {
      totalSeconds++;

      const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (totalSeconds % 60).toString().padStart(2, "0");

      $timer.text(`${minutes}-${seconds}`);

      if (totalSeconds >= 60) {
        stopTimer();
        showSummary();
      }
    }, 1000);
  }

  // Stop the timer
  function stopTimer() {
    clearInterval(intervalId);
  }

  // Display the summary
  function showSummary() {
    $("body > *").hide();
    $summary.show();
    $summaryText.text(
      `Zaznaczyłeś ${count} wystąpień słowa "${chosenWord}" na ${chosenWordCount} możliwych.`
    );
  }

  // Submit the result
  function submit() {
    const percentage = (count / chosenWordCount) * 100;

    $.ajax({
      url: "/exercise3-submission",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ percentage }),
      success(response) {
        window.location.href = response.redirect;
      },
      error() {
        console.log("Błąd podczas przesyłania danych.");
      },
    });
  }

  // Initialize the script
  init();
});
