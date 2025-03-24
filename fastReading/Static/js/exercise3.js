$(document).ready(function () {
  let text = "";
  let clickedWords = [];
  let intervalId = null;
  let chosenWord = "";
  let count = 0;
  let chosenWordCount = 0;

  // DOM elements caching
  const $startBtn = $("#start_btn");
  const $wordToSelect = $("#wordToSelect");
  const $textContent = $("#text");
  const $counter = $("#counter");
  const $timer = $("#time");
  const $alert = $("#alert");

  // Initialization
  function init() {
    loadText();
    setupEventHandlers();
  }

  // Load text from the server
  function loadText() {
    $.getJSON("/text/medium")
      .done((data) => {
        text = data;
        console.log(data);
        chosenWord = chooseRandomWordFromText(text);
        $counter.text(`Ilość zaznaczonych wystąpień słowa "${chosenWord}": 0`);
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
      displayText(text);
      startTimer();
      $alert.remove();
      $startBtn.remove();
    });
  }

  // Display the start screen with the chosen word
  function displayStart() {
    $wordToSelect.text("Słowo: " + chosenWord);
  }

  // Display the loaded text with clickable words
  function displayText(text) {
    const words = text.replace(/\n/g, " ").split(" ");

    $textContent.empty();
    $counter.text(`Ilość zaznaczonych wystąpień słowa "${chosenWord}": 0`);
    $timer.text("Czas: 00-00");

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
      $span.addClass("fw-bold");
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
      (word) => wordCounts[word] >= 4
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

      $timer.text(`Czas: ${minutes}-${seconds}`);

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

  function showSummary() {
    // Remove the quiz container
    let percentage = (count / chosenWordCount) * 100;
    $("body").empty();

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
    if (percentage >= 70) {
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
        `Udało ci się zaznaczyć: <strong>${count}/${chosenWordCount} wystąpień</strong>`
      )
      .appendTo(cardBody);

    // Add the exit button
    $("<a>")
      .attr("href", "#")
      .addClass("btn btn-primary btn-lg px-4")
      .text("Wyjdź")
      .appendTo(cardBody)
      .click(function () {
        submit();
      });

    // Append the result container to the body
    $("body").append(resultContainer);
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
