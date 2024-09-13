$(document).ready(function () {
  // Cache selectors for improved performance
  const $bodyElements = $("body *");
  const $textContent = $("#text_content");
  const $startBtn = $("#start_btn");
  const $time = $("#time");
  const $phraseInfo = $("#phrase_info");
  const $doneBtn = $("#done_btn");
  const $quizContainer = $("#quiz_container");

  $bodyElements.hide();

  let text;
  let wordIndex = 0;
  let maxIndex;
  let intervalId;
  let intervalId2;
  let startTime;
  let numOfWords = 2;
  let speed = 500;

  async function loadText() {
    $.getJSON("/text-quiz/long", async function (data) {
      text = data.text.split(/\s+/); // Split text into words
      quizData = JSON.parse(data.quiz);
      const averageWpm = await getAverageWpm();
      speed = (2 / averageWpm) * 60 * 1000;
      console.log(speed);
      startExercise(text, quizData);
    });
  }
  loadText();

  function getAverageWpm() {
    return $.getJSON("/user/average-wpm").then((data) => {
      console.log(data);
      return data.average_wpm;
    });
  }

  function startExercise(text, quizData) {
    maxIndex = text.length;
    $startBtn.show();
    startDisplay();
    displayWords(text);
    $startBtn.click(function () {
      $startBtn.hide();
      startDisplay();
      displayWords(text);
      startTimer();
      intervalId = setInterval(function () {
        displayNextWords(text, quizData);
      }, speed);
      console.log(speed);
    });
  }

  function startDisplay() {
    $textContent.show();
    $phraseInfo.show();
    $phraseInfo.text(
      `Przeczytane/Całkowite: ${Math.ceil(wordIndex / numOfWords)}/${
        Math.ceil(maxIndex / numOfWords) - 1
      }`
    );
    $time.show();
    $time.text("00-00");
  }

  function displayWords(text) {
    let slice = text.slice(wordIndex, wordIndex + numOfWords);
    $textContent.text(slice.join(" "));
  }

  function displayNextWords(text, quizData) {
    wordIndex += numOfWords;
    if (wordIndex >= maxIndex - numOfWords) {
      displayWords(text);
      $phraseInfo.text(
        `Przeczytane/Całkowite: ${Math.ceil(wordIndex / numOfWords)}/${
          Math.ceil(maxIndex / numOfWords) - 1
        }`
      );
      finishReading(quizData);
    } else {
      displayWords(text);
      $phraseInfo.text(
        `Przeczytane/Całkowite: ${Math.ceil(wordIndex / numOfWords)}/${
          Math.ceil(maxIndex / numOfWords) - 1
        }`
      );
    }
  }

  function finishReading(quizData) {
    clearInterval(intervalId);
    stopTimer();
    $doneBtn.show();
    $doneBtn.click(function () {
      quiz(quizData);
    });
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
    let questionsList = quizData.questions.map(
      (q) => new Question(q.question, q.options, q.correct_answer)
    );
    renderQuiz(questionsList);
    $("#done-button").click(function () {
      let correctAnswers = checkCorrectAnswers(questionsList);
      $bodyElements.hide();
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
    $quizContainer.show().empty();
    questionsList.forEach((question, questionIndex) => {
      let questionDiv = $("<div>")
        .addClass("question")
        .appendTo($quizContainer);
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
      .appendTo($quizContainer);
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

  function submitQuiz(correctAnswers, length) {
    let percentage = (correctAnswers / length) * 100;
    $.ajax({
      url: "/exercise1-submission",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        percentage: percentage,
      }),
      success: function (response) {
        console.log(response);
        window.location.href = response.redirect;
      },
    });
  }

  function startTimer() {
    let totalSeconds = 0;
    startTime = new Date().getTime();

    intervalId2 = setInterval(function () {
      totalSeconds++;

      let seconds = totalSeconds % 60;
      let totalMinutes = Math.floor(totalSeconds / 60);
      let minutes = totalMinutes % 60;

      $time.text(
        `${minutes.toString().padStart(2, "0")}-${seconds
          .toString()
          .padStart(2, "0")}`
      );
    }, 1000);
  }

  function stopTimer() {
    clearInterval(intervalId2);
  }
});
