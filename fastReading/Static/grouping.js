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

  function getText() {
    $.getJSON("/get_rsvp_data", function (data) {
      text = data.file_content;
      text = text.split(/\s+/);
      id = data.id;
      console.log(data.average_wpm);
      speed = ((2 / data.average_wpm) * 60 )* 1000;
      displayStart(text);
      uncoverText();
    });
  }
  getText();

  function displayStart(text) {
    $("#exercise_description").show();
    $("#text_content").show();
    $("#start_btn").show();
    text = text.map(word => `<span class="cover">${word}</span>`);
    $("#text_content").html(text.join(" "));
  }

  function uncoverText(){
    let wordElements = $("#text_content").find(".cover");
    let index = 0;
    intervalId2 = setInterval(() => {
        if(index < wordElements.length){
            $(wordElements[index]).removeClass("cover");
            if(index + 1 < wordElements.length){
                $(wordElements[index + 1]).removeClass("cover");
            }
            index += 2;
        }
    }, 500);
  }




});
