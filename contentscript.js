window.onmouseup = function(event1) {
  var echoFormExists = false;
  var keys = [];

  onkeydown = onkeyup = function(event2) {
    keys[event2.keyCode] = event2.type == 'keydown';

    if ( (keys[17] === true) && (keys[69] === true)
        && rangeIsSelected() && !echoFormExists ) {
      event2.preventDefault();
      var selectedString = '"'+ window.getSelection().toString() + '"';
      // not protected variable!
      spawnedEcho = spawnEchoForm(event1.pageX, event1.pageY, this, selectedString);
      window.getSelection().removeAllRanges();
      echoFormExists = true;
      echoFormSubmit();
      hideSpawnedEcho();
    };
  };
};

function rangeIsSelected() {
  return (window.getSelection().type == "Range");
};

function closeEchoFormAfterSubmit() {
  echoThat();
  setTimeout(function(){
    var echoFrame = document.getElementsByClassName("echo-frame")[0];
    body.removeChild(echoFrame);
    echoFormExists = false;
  }, 1250);
};

function echoThat() {
  var confirm = document.getElementById("char-count");
  confirm.innerHTML = "echo";

  setTimeout(function(){
    confirm.innerHTML = "That.";
  }, 720);
};

function echoFormSubmit() {
  var userTextandSubmitForm = document.getElementById("userTextAndSubmit");
  userTextandSubmitForm.addEventListener("submit", function(event3){
    event3.preventDefault();

    var finalUserHighLight = document.getElementById("userHighLight").value
    var userText = document.getElementById("userEchoText").value;

    closeEchoFormAfterSubmit();

    chrome.runtime.sendMessage({
      message: finalUserHighLight + " " + userText
    }, function(response) {
      // response from eventpage.js
    });

    finalUserHighLight = "";
    userText = "";
  });
};

function hideSpawnedEcho() {
  document.onmousedown = function(event4) {
    var echoFrame = document.getElementsByClassName("echo-frame")[0];

    if (spawnedEcho && !checkClickEventWithinForm(event, echoFrame)) {
      body.removeChild(echoFrame);
      echoFormExists = false;
      spawnedEcho = false;
    };
  };
};

function checkClickEventWithinForm(event, parent) {
  var current = event.target;

  while (current) {
    if (current === parent) return true;
    current = current.parentNode;
  }
  return false;
};

function spawnEchoForm(x, y, that, selectedString) {
  that.echoForm = document.createElement("div");
  that.echoForm.setAttribute("class", "echo-frame");

  that.echoSubmit = document.createElement("div");
  that.echoSubmit.setAttribute("class", "echo-submit");
  that.echoForm.appendChild(that.echoSubmit);

  that.echoInputForm = document.createElement("form");
  that.echoInputForm.setAttribute("id", "userTextAndSubmit");
  that.echoSubmit.appendChild(that.echoInputForm);

  that.echoLeftWrapper = document.createElement("div");
  that.echoLeftWrapper.setAttribute("class", "echoLeftWrapper");
  that.echoInputForm.appendChild(that.echoLeftWrapper);

  that.echoHighLight = document.createElement("textarea");
  that.echoHighLight.setAttribute("id", "userHighLight");
  that.echoHighLight.setAttribute("name", "userHighLight");
  that.echoHighLight.setAttribute("rows", "4");
  that.echoHighLight.setAttribute("cols", "20");
  that.echoHighLight.value = selectedString;
  that.echoLeftWrapper.appendChild(that.echoHighLight);

  that.echoText = document.createElement("input");
  that.echoText.setAttribute("type", "text");
  that.echoText.setAttribute("id", "userEchoText");
  that.echoText.setAttribute("name", "userEchoText");
  that.echoText.setAttribute("placeholder", "add to your Echo");
  that.echoLeftWrapper.appendChild(that.echoText);

  that.echoRightWrapper = document.createElement("div");
  that.echoRightWrapper.setAttribute("class", "echoRightWrapper");
  that.echoInputForm.appendChild(that.echoRightWrapper);

  that.echoButton = document.createElement("button");
  that.echoButton.setAttribute("type", "submit");
  that.echoButton.setAttribute("id", "EchoButton");
  that.echoRightWrapper.appendChild(that.echoButton);

  that.echoTextCharCount = document.createElement("span");
  that.echoTextCharCount.setAttribute("id", "char-count");
  that.echoTextCharCount.style.color= "#ffffff";
  that.echoRightWrapper.appendChild(that.echoTextCharCount);

  that.fileRef = document.createElement("link");
  that.fileRef.setAttribute("rel", "stylesheet");
  that.fileRef.setAttribute("type", "text/css");
  that.fileRef.setAttribute("href", chrome.extension.getURL("echoform.css"));
  document.getElementsByTagName("head")[0].appendChild(that.fileRef);

  that.echoForm.style.visibility = "visible";
  if ( x > (document.body.clientWidth - 390) ) {
    x = document.body.clientWidth - 400;
  } else if ( x < 30 ) {
    x = 20;
  } else {
    x -= 25;
  };
  that.echoForm.style.left = x + "px";

  y += 20;
  that.echoForm.style.top = y + "px";

  body = document.getElementsByTagName("body")[0];
  body.appendChild(that.echoForm);
  that.echoTextCharCount.innerHTML = updateCharCount();
  updateCharColor(updateCharCount())
  updateUserFeedback(that);
  return true;
};

function updateCharColor(charCount) {
  var inputFields = ["userEchoText", "userHighLight"];
  for (i in inputFields) {
    if (charCount < 141) {
      document.getElementById(inputFields[i]).style.borderColor="#B6FCD5";
    } else {
      document.getElementById(inputFields[i]).style.borderColor="#3B5998";
    }
  }
};

function updateCharCount() {
  var shortenedUrlLength = 25; //subject to change based on length of shortered URL
  var userEchoTextCount = document.getElementById("userEchoText").value.length;
  var userHighLightCount = document.getElementById("userHighLight").value.length;
  return shortenedUrlLength + userHighLightCount + userEchoTextCount;
};

function updateUserFeedback(that) {
  var inputFields = ["userEchoText", "userHighLight"];
  for (i in inputFields) {
    document.getElementById(inputFields[i]).addEventListener("keydown", function(event) {
      that.echoTextCharCount.innerHTML = updateCharCount();
      updateCharColor(updateCharCount());
    });
  }
};
