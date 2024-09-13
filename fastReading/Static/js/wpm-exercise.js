$(document).ready(function () {
  // Cache commonly used selectors
  const $startButton = $("#start_btn");
  const $nextButton = $("#next_btn").hide();
  const $doneButton = $("#done_btn").hide();
  const $textContent = $("#text");
  const $phraseInfo = $("#phrase_info");
  const $timeDisplay = $("#time");
  const $wpmInfo = $("#wpm_info");

  let text = []; // list with words
  let wordIndex = 0;
  let maxIndex = 0;
  let intervalId;
  let startTime;
  let wpm;
  let wpmIntervalId;

  // Load text from the server
  function loadText() {
    $.getJSON("/text/long").done(initializeText).fail(handleError);
  }

  function initializeText(data) {
    text = data.split(/\s+/);
    maxIndex = text.length;
    console.log("Loaded text:", text);
    initializeExercise();
  }

  function handleError(error) {
    console.error("Failed to load text:", error);
  }

  // Initialize exercise UI and start logic
  function initializeExercise() {
    displayCurrentWords();

    $startButton.click(startExercise);
    $nextButton.click(displayNextWords);
    $doneButton.click(submitWpm);
  }

  function startExercise() {
    $startButton.hide();
    $nextButton.show();
    enableButton($nextButton);
    startTimer();
    startWpmCalculation();
    displayCurrentWords();
  }

  function displayCurrentWords() {
    const wordsToShow = text.slice(wordIndex, wordIndex + 5).join(" ");
    $textContent.text(wordsToShow);
    updatePhraseInfo();
  }

  function displayNextWords() {
    wordIndex += 5;
    if (isEndOfText()) {
      displayCurrentWords();
      finishReading();
    } else {
      displayCurrentWords();
    }
  }

  function isEndOfText() {
    return wordIndex >= maxIndex - 5;
  }

  function updatePhraseInfo() {
    const phrasesRead = Math.ceil(wordIndex / 5);
    const totalPhrases = Math.ceil(maxIndex / 5) - 1;
    $phraseInfo.text(`Przeczytane/Całkowite: ${phrasesRead}/${totalPhrases}`);
  }

  function finishReading() {
    disableButton($nextButton);
    stopTimer();
    stopWpmCalculation();
    $doneButton.show();
  }

  function startTimer() {
    startTime = Date.now();
    intervalId = setInterval(updateTimerDisplay, 1000);
  }

  function updateTimerDisplay() {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
    const seconds = String(elapsedSeconds % 60).padStart(2, "0");
    $timeDisplay.text(`${minutes}-${seconds}`);
  }

  function stopTimer() {
    clearInterval(intervalId);
  }

  function startWpmCalculation() {
    wpmIntervalId = setInterval(calculateWpm, 200);
  }

  function calculateWpm() {
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    wpm = wordIndex / elapsedMinutes;
    $wpmInfo.text(`Słowa na minutę: ${wpm.toFixed(2)}`);
  }

  function stopWpmCalculation() {
    clearInterval(wpmIntervalId);
  }

  function submitWpm() {
    $.ajax({
      url: "/wpm-submission",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ wpm }),
      success: handleWpmSubmissionSuccess,
      error: handleWpmSubmissionError,
    });
  }

  function handleWpmSubmissionSuccess(response) {
    console.log("Submission success:", response);
    window.location.href = response.redirect;
  }

  function handleWpmSubmissionError() {
    console.error("Error during WPM submission.");
  }

  function enableButton($button) {
    $button.prop("disabled", false);
  }

  function disableButton($button) {
    $button.prop("disabled", true);
  }

  // Start the process by loading text
  loadText();
});
