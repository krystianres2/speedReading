$(document).ready(function () {
  // Cache selectors for improved performance
  const $bodyElements = $("body *");
  const $textContent = $("#text");
  const $startBtn = $("#start_btn");
  const $time = $("#time");
  const $phraseInfo = $("#phrase_info");
  const $doneBtn = $("#done_btn").hide();
  const $quizContainer = $("#quiz_container").hide();
  const $wpmContainer = $("#wpm_container");
  const $alert = $("#alert");


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
      $alert.remove();
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
    $time.text("Czas: 00-00");
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
    $wpmContainer.remove();
    $quizContainer.show();

    class Question {
      constructor(question, answers, correctAnswer) {
        this.question = question;
        this.answers = answers;
        this.correctAnswer = correctAnswer;
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
    // Clear the quiz container and show it
    $quizContainer.show();

    // Create a container for the entire quiz
    let quizContainerDiv = $("<div>")
      .addClass("container mb-5 mt-4 p-4 bg-white")
      .appendTo($quizContainer);

    // Create a row to hold the questions
    let rowDiv = $("<div>").addClass("row").appendTo(quizContainerDiv);

    // Loop through each question and create the structure
    questionsList.forEach((questionObj, questionIndex) => {
      // Create a column for each question
      let colDiv = $("<div>").addClass("col-12 col-md-6 mb-4").appendTo(rowDiv); // Changed to col-md-6 for even split on larger screens

      // Display the question text
      $("<p>")
        .addClass("fw-bold fs-5")
        .text(questionIndex + 1 + ". " + questionObj.question)
        .appendTo(colDiv);

      // Create a div to hold the answer options
      let answerDiv = $("<div>").appendTo(colDiv);

      // Loop through the answers and create radio buttons and labels
      questionObj.answers.forEach((answer, answerIndex) => {
        // Create the radio input element
        let inputId = "one" + (questionIndex + 1);
        if (answerIndex > 0) {
          inputId =
            ["two", "three", "four"][answerIndex - 1] + (questionIndex + 1);
        }
        $("<input>")
          .attr("type", "radio")
          .attr("name", "group" + (questionIndex + 1))
          .attr("id", inputId)
          .attr("value", answer)
          .prop("checked", answerIndex === 0) // Set first option as checked by default
          .appendTo(answerDiv);

        // Create the label for the radio input
        let labelDiv = $("<label>")
          .addClass("box " + ["first", "second", "third", "forth"][answerIndex]) // Add class for styling
          .attr("for", inputId)
          .appendTo(answerDiv);

        // Create the inner div for label content (circle and text)
        let courseDiv = $("<div>").addClass("course").appendTo(labelDiv);
        $("<span>").addClass("circle").appendTo(courseDiv); // Circle element
        $("<span>").addClass("subject").text(answer).appendTo(courseDiv); // Answer text
      });
    });

    // Add a submit button at the end of the quiz
    let buttonRow = $("<div>").addClass("col-12 mb-3").appendTo(rowDiv);
    let buttonWrapper = $("<div>")
      .addClass("d-flex justify-content-center")
      .appendTo(buttonRow);
    $("<button>")
      .addClass("btn btn-primary btn-lg px-4 py-2 fw-bold")
      .text("Zatwierdź")
      .appendTo(buttonWrapper)
      .click(function () {
        let correctAnswers = checkCorrectAnswers(questionsList);
        displayQuizResults(correctAnswers, questionsList.length);
        console.log("Correct answers:", correctAnswers);
      });
  }

  function checkCorrectAnswers(questionsList) {
    let correctAnswersCount = 0;

    questionsList.forEach((question, questionIndex) => {
      // Get the selected answer for the current question
      let selectedAnswer = $(
        `input[name='group${questionIndex + 1}']:checked`
      ).val();

      // Compare the selected answer with the correct answer
      if (selectedAnswer === question.correctAnswer) {
        correctAnswersCount++;
      }
    });

    return correctAnswersCount;
  }

  function displayQuizResults(correctAnswers, totalQuestions) {
    // Remove the quiz container
    $quizContainer.remove();

    // Create the result card container
    let resultContainer = $("<div>").addClass(
      "container d-flex align-items-center justify-content-center vh-100"
    );

    // Create the card element
    let card = $("<div>")
      .addClass("card text-center p-4")
      .css("width", "22rem")
      .appendTo(resultContainer);

    // Add the image to the card
    if (correctAnswers >= 3) {
      $("<img>")
        .attr("src", happyFaceUrl)
        .attr("alt", "")
        .addClass("card-img-top mx-auto mt-3")
        .appendTo(card);
    } else {
      $("<img>")
        .attr("src", sadFaceUrl)
        .attr("alt", "")
        .addClass("card-img-top mx-auto mt-3")
        .appendTo(card);
    }
    // Create the card body
    let cardBody = $("<div>").addClass("card-body pt-4").appendTo(card);

    // Add the card title
    $("<h4>").addClass("card-title").text("Podsumowanie").appendTo(cardBody);

    // Add the correct answers text
    $("<p>")
      .addClass("card-text fs-5 mb-3")
      .html(
        `Udało ci się odpowiedzieć poprawnie na: <strong>${correctAnswers} z ${totalQuestions} pytań</strong>`
      )
      .appendTo(cardBody);

    // Add the exit button
    $("<a>")
      .attr("href", "#")
      .addClass("btn btn-primary btn-lg px-4")
      .text("Wyjdź")
      .appendTo(cardBody)
      .click(function () {
        submitQuiz(correctAnswers, totalQuestions);
      });

    // Append the result container to the body
    $("body").append(resultContainer);
  }

  function checkCorrectAnswers(questionsList) {
    let correctAnswersCount = 0;

    questionsList.forEach((question, questionIndex) => {
      // Get the selected answer for the current question
      let selectedAnswer = $(
        `input[name='group${questionIndex + 1}']:checked`
      ).val();

      // Compare the selected answer with the correct answer
      if (selectedAnswer === question.correctAnswer) {
        correctAnswersCount++;
      }
    });

    return correctAnswersCount;
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
        `Czas: ${minutes.toString().padStart(2, "0")}-${seconds
          .toString()
          .padStart(2, "0")}`
      );
    }, 1000);
  }

  function stopTimer() {
    clearInterval(intervalId2);
  }
});
