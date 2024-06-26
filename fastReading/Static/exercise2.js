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
    $.getJSON("/get_text_quiz", function (data) {
      text = data.file_content;
      text = text.split(/\s+/);
      id = data.id;
      quizData = JSON.parse(data.quiz_content);
      startExercise(text, id, quizData);
    });
  }
  loadText();

  function displayWords(text) {
    let slice = text.slice(wordIndex, wordIndex + 5);
    $("#text_content").text(slice.join(" "));
  }

  function displayNextWords(text, id, quiuzData) {
    wordIndex += 5;
    if (wordIndex >= maxIndex - 5) {
      displayWords(text);
      $("#phrase_info").text(
        `Przeczytane/Całkowite: ${Math.ceil(wordIndex / 5)}/${
          Math.ceil(maxIndex / 5) - 1
        }`
      );
      finishReading(id, quizData);
    } else {
      displayWords(text);
      $("#phrase_info").text(
        `Przeczytane/Całkowite: ${Math.ceil(wordIndex / 5)}/${
          Math.ceil(maxIndex / 5) - 1
        }`
      );
    }
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

  function finishReading(id, quizData) {
    $("#next-button").prop("disabled", true);
    stopTimer();
    stopWpmCalculation();
    $("#done_btn").show();
    $("#done_btn").click(function () {
      submitWpm(id, quizData);
    });
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

  function quiz(quizData) {
    $("body *").hide();

    class Question {
      constructor(question, options, correct_answer) {
        this.question = question;
        this.options = options;
        this.correct_answer = correct_answer;
      }
    }
    let questionsList = quizData.questions.map(
      (q) => new Question(q.question, q.options, q.correct_answer)
    );
    renderQuiz(questionsList);
    $("#done-button").click(function () {
      let correctAnswers = checkCorrectAnswers(questionsList);
      $("body *").hide();
      $("<p>")
        .text(`Poprawne odpowiedzi: ${correctAnswers}/${questionsList.length}`)
        .attr("id", "result")
        .appendTo("body");
      $("<button>")
        .text("Zakończ")
        .attr("id", "finish-button")
        .appendTo("body");
      $("#finish-button").click(function () {
        submitQuiz(correctAnswers, questionsList.length);
      });
    });
  }

  function renderQuiz(questionsList) {
    $("#quiz-container").show();
    $("#quiz-container").empty();
    questionsList.forEach((question, questionIndex) => {
      let questionDiv = $("<div>")
        .addClass("question")
        .appendTo("#quiz-container");
      $("<p>").text(question.question).appendTo(questionDiv);
      question.options.forEach((option, index) => {
        let optionDiv = $("<div>").addClass("option").appendTo(questionDiv);
        $("<input>")
          .attr("type", "radio")
          .attr("name", questionIndex)
          .attr("value", option)
          .prop("checked", true)
          .appendTo(optionDiv);
        $("<label>").text(option).appendTo(optionDiv);
      });
    });
    $("<button>")
      .text("Zatwierdź")
      .attr("id", "done-button")
      .appendTo("#quiz-container");
  }

  function checkCorrectAnswers(questionsList) {
    let correctAnswers = 0;
    questionsList.forEach((question, questionIndex) => {
      let selectedOption = $(`input[name=${questionIndex}]:checked`).val();
      if (selectedOption == question.correct_answer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  }

  function submitWpm(id, quizData) {
    $.ajax({
      url: "/submit_wpm",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ wpm: wpm, id: id }),
      success: function (response) {
        console.log(response);
        quiz(quizData);
      },
    });
  }

  function submitQuiz(correctAnswers, length) {
    let percentage = (correctAnswers / length) * 100;
    let effectivity = wpm * (percentage / 100);
    $.ajax({
      url: "/submit_quiz",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        percentage: percentage,
        effectivity: effectivity,
      }),
      success: function (response) {
        console.log(response);
        window.location.href = response.redirect;
      },
    });
  }
});