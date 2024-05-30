$(document).ready(function () {
  $("body *").hide();

  let text;
  let wordIndex = 0;
  let maxIndex;
  let intervalId;
  let startTime;
  let wpm;
  let wpmIntervalId;

  function loadText() {
    $.getJSON("/get_ex1_text", function (data) {
      text = data.file_content;
      text = text.split(/\s+/);
      id = data.id;
      console.log(id);
      startExercise(text, id);
    });
  }
  loadText();

  function displayWords(text) {
    let slice = text.slice(wordIndex, wordIndex + 5);
    $("#text_content").text(slice.join(" "));
  }

  function displayNextWords(text, id) {
    wordIndex += 5;
    if (wordIndex >= maxIndex - 5) {
      displayWords(text);
      $("#phrase_info").text(
        `Przeczytane/Całkowite: ${Math.ceil(wordIndex / 5)}/${
          Math.ceil(maxIndex / 5) - 1
        }`
      );
      finishReading(id);
    } else {
      displayWords(text);
      $("#phrase_info").text(
        `Przeczytane/Całkowite: ${Math.ceil(wordIndex / 5)}/${
          Math.ceil(maxIndex / 5) - 1
        }`
      );
    }
  }

  function finishReading(id) {
    $("#next-button").prop("disabled", true);
    stopTimer();
    stopWpmCalculation();
    $("#done_btn").show();
    $("#done_btn").click(function () {
      submitWpm(id);
    });
  }

  function startDisplay() {
    $("#next-button").prop("disabled", false);
    $("#text_content").show();
    $("#next-button").show();
    $("#phrase_info").show();
    $("#phrase_info").text(
      `Przeczytane/Całkowite: ${Math.ceil(wordIndex / 5)}/${
        Math.ceil(maxIndex / 5) - 1
      }`
    );
    $("#time").show();
    $("#time").text("00-00");
    $("#wpm_info").show();
    $("#wpm_info").text("Słowa na minutę: 0.00");
  }

  function startTimer() {
    let totalSeconds = 0;
    startTime = new Date().getTime();

    intervalId = setInterval(function () {
      totalSeconds++;

      let seconds = totalSeconds % 60;
      let totalMinutes = Math.floor(totalSeconds / 60);
      let minutes = totalMinutes % 60;

      $("#time").text(
        `${minutes.toString().padStart(2, "0")}-${seconds
          .toString()
          .padStart(2, "0")}`
      );
    }, 1000);
  }

  function stopTimer() {
    clearInterval(intervalId);
  }

  function startWpmCalculation() {
    wpmIntervalId = setInterval(calculateWpm, 200);
  }

  function stopWpmCalculation() {
    clearInterval(wpmIntervalId);
  }

  function calculateWpm() {
    let currentTime = new Date().getTime();
    let timeInMinutes = (currentTime - startTime) / 60000;
    wpm = wordIndex / timeInMinutes;
    $("#wpm_info").text(`Słowa na minutę: ${wpm.toFixed(2)}`);
  }

  function startExercise(text, id) {
    maxIndex = text.length;
    console.log(maxIndex);
    $("#start_btn").show();
    startDisplay();
    displayWords(text);
    $("#next-button").prop("disabled", true);
    $("#start_btn").click(function () {
      $("#start_btn").hide();
      startDisplay();
      displayWords(text);
      startTimer();
      calculateWpm();
      startWpmCalculation();
      $("#next-button").click(function () {
        displayNextWords(text, id);
      });
    });
  }
  function submitWpm(id) {
    console.log(id);
    $.ajax({
      url: "/submit_wpm",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ wpm: wpm, id: id }),
      success: function (response) {
        console.log(response);
        console.log(id);
        window.location.href = response.redirect;
      },
    });
  }
});
