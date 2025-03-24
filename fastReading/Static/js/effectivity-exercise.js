$(document).ready(function () {
  // Cache commonly used selectors
  const $startButton = $("#start_btn");
  const $nextButton = $("#next_btn");
  const $doneButton = $("#done_btn").hide();
  const $textContent = $("#text");
  const $phraseInfo = $("#phrase_info");
  const $timeDisplay = $("#time");
  const $wpmInfo = $("#wpm_info");
  const $startButtonContainer = $("#start_btn_container");
  const $nextButtonContainer = $("#next_btn_container").hide();
  const $wpmContainer = $("#wpm_container");
  const $quizContainer = $("#quiz_container").hide();
  const $bodyElements = $("body *");

  let text = []; // list with words
  let wordIndex = 0;
  let maxIndex = 0;
  let intervalId;
  let startTime;
  let wpm;
  let wpmIntervalId;
  let quizData = [];

  // Load text from the server
  function loadText() {
    $.getJSON("/text-quiz/long").done(initializeText).fail(handleError);
  }

  function initializeText(data) {
    text = data.text.split(/\s+/);
    maxIndex = text.length;
    console.log("Loaded text:", text);
    quizData = JSON.parse(data.quiz);
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
    $startButtonContainer.remove();
    $nextButtonContainer.show();
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
    $timeDisplay.text(`Czas: ${minutes}-${seconds}`);
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
    quiz();
  }

  function handleWpmSubmissionError() {
    console.error("Error during WPM submission.");
  }

  function enableButton($button) {
    $button.prop("disabled", false);
  }

  function disableButton($button) {
    $button.prop("disabled", true).addClass("btn-disabled");
  }

  function quiz() {
    $wpmContainer.remove();

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

    $("<p>")
      .addClass("card-text fs-5 mb-3")
      .html(`Twoje wpm wyniosło: <strong>${Math.round(wpm)}</strong>`)
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
  // Start the process by loading text
  loadText();
});
