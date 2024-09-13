$(document).ready(function () {
  // Cache selectors
  const $bodyElements = $("body *");
  const $text = $("#text");
  const $startBtn = $("#start_btn");
  const $nextBtn = $("#next_btn");
  const $time = $("#time");
  const $wpmInfo = $("#wpm_info");
  const $phraseInfo = $("#phrase_info");
  const $doneBtn = $("#done_btn");
  const $quizContainer = $("#quiz_container"); // Correct selector cached

  // Hide all body elements initially
  $bodyElements.hide();

  let text;
  let wordIndex = 0;
  let maxIndex;
  let intervalId;
  let startTime;
  let wpm;
  let wpmIntervalId;
  let quizData;

  function loadText() {
    $.getJSON("/text-quiz/long", function (data) {
      text = data.text.split(/\s+/);
      quizData = JSON.parse(data.quiz);
      startExercise(text, quizData);
    });
  }
  loadText();

  function displayWords(text) {
    let slice = text.slice(wordIndex, wordIndex + 5);
    $text.text(slice.join(" "));
  }

  function displayNextWords(text) {
    wordIndex += 5;
    if (wordIndex >= maxIndex - 5) {
      displayWords(text);
      $phraseInfo.text(
        `Przeczytane/Całkowite: ${Math.ceil(wordIndex / 5)}/${Math.ceil(maxIndex / 5) - 1}`
      );
      finishReading(quizData);
    } else {
      displayWords(text);
      $phraseInfo.text(
        `Przeczytane/Całkowite: ${Math.ceil(wordIndex / 5)}/${Math.ceil(maxIndex / 5) - 1}`
      );
    }
  }

  function startExercise(text) {
    maxIndex = text.length;
    console.log(maxIndex);
    $startBtn.show();
    startDisplay();
    displayWords(text);
    $nextBtn.prop("disabled", true);
    $startBtn.click(function () {
      $startBtn.hide();
      startDisplay();
      displayWords(text);
      startTimer();
      calculateWpm();
      startWpmCalculation();
      $nextBtn.click(function () {
        displayNextWords(text);
      });
    });
  }

  function startDisplay() {
    $nextBtn.prop("disabled", false);
    $text.show();
    $nextBtn.show();
    $phraseInfo.show().text(
      `Przeczytane/Całkowite: ${Math.ceil(wordIndex / 5)}/${Math.ceil(maxIndex / 5) - 1}`
    );
    $time.show().text("00-00");
    $wpmInfo.show().text("Słowa na minutę: 0.00");
  }

  function finishReading(quizData) {
    $nextBtn.prop("disabled", true);
    stopTimer();
    stopWpmCalculation();
    $doneBtn.show().click(function () {
      submitWpm(quizData);
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

      $time.text(`${minutes.toString().padStart(2, "0")}-${seconds.toString().padStart(2, "0")}`);
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
    $wpmInfo.text(`Słowa na minutę: ${wpm.toFixed(2)}`);
  }

  function quiz(quizData) {
    $bodyElements.hide();

    class Question {
      constructor(question, options, correct_answer) {
        this.question = question;
        this.options = options;
        this.correct_answer = correct_answer;
      }
    }

    // Ensure quizData.questions exists and is an array
    if (quizData && Array.isArray(quizData.questions)) {
      let questionsList = quizData.questions.map(
        (q) => new Question(q.question, q.options, q.correct_answer)
      );

      renderQuiz(questionsList);
    } else {
      console.error("Invalid quiz data");
    }
  }

  function renderQuiz(questionsList) {
    $quizContainer.show().empty(); // Correct selector is used

    questionsList.forEach((question, questionIndex) => {
      let questionDiv = $("<div>")
        .addClass("question")
        .appendTo($quizContainer); // Use cached selector

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

    // Attach click handler correctly after the button is added
    $("<button>")
      .text("Zatwierdź")
      .attr("id", "done-button")
      .appendTo($quizContainer)
      .click(function () {
        let correctAnswers = checkCorrectAnswers(questionsList);
        displayQuizResults(correctAnswers, questionsList.length);
      }); // Attach the click handler here
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

  function displayQuizResults(correctAnswers, totalQuestions) {
    $bodyElements.hide();
    $("<p>")
      .text(`Poprawne odpowiedzi: ${correctAnswers}/${totalQuestions}`)
      .attr("id", "result")
      .appendTo("body");
    $("<button>")
      .text("Zakończ")
      .attr("id", "finish-button")
      .appendTo("body")
      .click(function () {
        submitQuiz(correctAnswers, totalQuestions);
      });
  }

  function submitWpm(quizData) {
    $.ajax({
      url: "/wpm-submission",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ wpm: wpm }),
      success: function (response) {
        console.log(response);
        quiz(quizData); // Call the quiz function after submitting WPM
      },
    });
  }

  function submitQuiz(correctAnswers, length) {
    let percentage = (correctAnswers / length) * 100;
    let effectivity = wpm * (percentage / 100);
    $.ajax({
      url: "/quiz-submission",
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
