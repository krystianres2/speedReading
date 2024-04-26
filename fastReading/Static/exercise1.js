$(document).ready(function () {
    let text_content = document.getElementById("text_content");
    let words;
    let wordIndex = 0;
    let intervalId;
    let startTime;
    $('#done_btn').hide();

    loadText(function (text) {
        words = text.split(/\s+/);
        displayWords();
    });

    $('#start_btn').click(startTimer);
    $('#next_btn').click(displayNextWords);

    $('#next_btn').prop('disabled', true);

    $('#reset_btn').click(function () {
        clearInterval(intervalId);
        wordIndex = 0;
        displayWords();
        $('#time').text('00-00-00');
        $('#wpm_info').text('Words per minute: 0.00');
        $('#phrase_info').text(`Read/Total phrases: 0/${Math.ceil(words.length / 5)}`);
        $('#start_btn').prop('disabled', false);
        $('#next_btn').prop('disabled', true);
    });

    function loadText(callback) {
        $.getJSON("/get_ex1_text", function (data) {
            let text = data.file_content;
            console.log(text);
            callback(text);
            $('#phrase_info').text(`Read/Total phrases: 0/${Math.ceil(words.length / 5)}`);
        });
    }

    function displayWords() {
        let slice = words.slice(wordIndex, wordIndex + 5);
        text_content.innerHTML = slice.join(' ');
    }

    function displayNextWords() {
        let wordsDisplayed = Math.min(5, words.length - wordIndex);
        wordIndex += wordsDisplayed;
        console.log(wordIndex);
        if (wordIndex >= words.length) {
            // If there are no more words, stop the timer and disable all buttons
            stopTimer();
            $('#start_btn').prop('disabled', true);
            $('#next_btn').prop('disabled', true);
            $('#done_btn').show();
            $('#done_btn').click(summary);
        } else {
            displayWords();
        }
    
        let currentTime = new Date().getTime();
        let timeInMinutes = (currentTime - startTime) / 60000;
        let wpm = wordIndex / timeInMinutes;
    
        $('#wpm_info').text(`Words per minute: ${wpm.toFixed(2)}`);
        $('#phrase_info').text(`Read/Total phrases: ${Math.ceil(wordIndex / 5)}/${Math.ceil(words.length / 5)}`);
    }

    function startTimer() {
        let totalSeconds = 0;
        startTime = new Date().getTime();

        intervalId = setInterval(function () {
            totalSeconds++;

            let seconds = totalSeconds % 60;
            let totalMinutes = Math.floor(totalSeconds / 60);
            let minutes = totalMinutes % 60;
            let hours = Math.floor(totalMinutes / 60);

            $('#time').text(`${hours.toString().padStart(2, '0')}-${minutes.toString().padStart(2, '0')}-${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        // Enable the #next_btn when the timer starts
        $('#next_btn').prop('disabled', false);
    }

    function stopTimer() {
        clearInterval(intervalId);
        // Disable the #next_btn when the timer stops
        $('#next_btn').prop('disabled', true);
    }

    function summary(){
        $('body *').not('#wpm_info').hide();
        let wpmText = $('#wpm_info').text();
        let wpm = wpmText.split(':')[1].trim();
        $.ajax({
            url: '/submit_wpm',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({wpm: wpm}),
            success: function(response) {
                console.log(response);
                window.location.href = response.redirect;
            }
        });
    }
});