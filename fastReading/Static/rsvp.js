$(document).ready(function () {
  $("body *").hide();

  let text;
  let wordIndex = 0;
  let maxIndex;
  let intervalId;
  let intervalId2;
  let startTime;
  let numOfWords = 2;
  let speed = 500;

  function loadText() {
    $.getJSON("/get_rsvp_data", function (data) {
      text = data.file_content;
      text = text.split(/\s+/);
      id = data.id;
      quizData = JSON.parse(data.quiz_content);
      console.log(data.average_wpm);
      speed = (2 / data.average_wpm) * 60 * 1000;
      startExercise(text, id, quizData);
    });
  }
  loadText();

  function startExercise(text, id, quizData) {
    maxIndex = text.length;
    $("#start_btn").show();
    startDisplay();
    displayWords(text);
    $("#start_btn").click(function () {
      $("#start_btn").hide();
      startDisplay();
      displayWords(text);
      startTimer();
      intervalId = setInterval(function () {
        displayNextWords(text, id, quizData);
      }, speed);
    });
  }

  function startDisplay() {
    $("#text_content").show();
    $("#phrase_info").show();
    $("#phrase_info").text(
      `Przeczytane/Całkowite: ${Math.ceil(wordIndex / numOfWords)}/${
        Math.ceil(maxIndex / numOfWords) - 1
      }`
    );
    $("#time").show();
    $("#time").text("00-00");
  }

  function displayWords(text) {
    let slice = text.slice(wordIndex, wordIndex + numOfWords);
    $("#text_content").text(slice.join(" "));
  }

  function displayNextWords(text, id, quizData) {
    wordIndex += numOfWords;
    if (wordIndex >= maxIndex - numOfWords) {
      displayWords(text);
      $("#phrase_info").text(
        `Przeczytane/Całkowite: ${Math.ceil(wordIndex / numOfWords)}/${
          Math.ceil(maxIndex / numOfWords) - 1
        }`
      );
      finishReading(id, quizData);
    } else {
      displayWords(text);
      $("#phrase_info").text(
        `Przeczytane/Całkowite: ${Math.ceil(wordIndex / numOfWords)}/${
          Math.ceil(maxIndex / numOfWords) - 1
        }`
      );
    }
  }

  function finishReading(id, quizData) {
    clearInterval(intervalId);
    stopTimer();
    $("#done_btn").show();
    $("#done_btn").click(function () {
      submitReading(id, quizData);
    });
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

  function submitReading(id, quizData) {
    $.ajax({
      url: "/submit_readed_text",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ id: id }),
      success: function (response) {
        console.log(response);
        quiz(quizData);
      },
    });
  }

  function submitQuiz(correctAnswers, length) {
    let percentage = (correctAnswers / length) * 100;
    $.ajax({
      url: "/submit_rsvp",
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

      $("#time").text(
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
