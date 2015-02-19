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
      spawnedEcho = spawnEchoForm(event1.pageX, event1.pageY, selectedString);
      window.getSelection().removeAllRanges();
      echoFormExists = true;
      document.getElementById("userEchoText").focus();
      echoFormSubmit();
      hideSpawnedEcho();
      closeEchoFormWithEsc();
    };
  };
};

function rangeIsSelected() {
  return (window.getSelection().type == "Range");
};

function closeEchoFormAfterSubmit() {
  echoThat();
  setTimeout(function(){
    closeEchoForm();
  }, 1250);
};

function closeEchoFormWithEsc() {
  document.addEventListener('keyup', function(event) {
    if (event.keyCode == 27) {
      closeEchoForm();
    };
  });
};

function echoThat() {
  var confirm = document.getElementById("char-count");
  confirm.innerHTML = "echo";

  setTimeout(function(){
    confirm.innerHTML = "That.";
  }, 720);
};

function charEncoding(string) {
  string = string.replace(/\[/g,"etcode4osqbr");
  return string = string.replace(/\]/g,"etcode4csqbr");
};

function echoFormSubmit() {
  var userTextandSubmitForm = document.getElementById("userTextAndSubmit");
  userTextandSubmitForm.addEventListener("submit", function(event3){
    event3.preventDefault();

    var finalUserHighLight = document.getElementById("userHighLight").value
    var userText = document.getElementById("userEchoText").value;
    var echoString = charEncoding(finalUserHighLight + " "
    + userText)

    closeEchoFormAfterSubmit();

    chrome.runtime.sendMessage({
      message: echoString
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

    if (!checkClickEventWithinForm(event, echoFrame)) {
      closeEchoForm();
    };
  };
};

function closeEchoForm() {
  if (spawnedEcho) {
    var echoFrame = document.getElementsByClassName("echo-frame")[0];
    document.body.removeChild(echoFrame);
    echoFormExists = false;
    spawnedEcho = false;
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

function spawnEchoForm(x, y, selectedString) {
  echoForm = document.createElement("div");
  echoForm.setAttribute("class", "echo-frame");

  echoSubmit = document.createElement("div");
  echoSubmit.setAttribute("class", "echo-submit");
  echoForm.appendChild(echoSubmit);

  echoInputForm = document.createElement("form");
  echoInputForm.setAttribute("id", "userTextAndSubmit");
  echoSubmit.appendChild(echoInputForm);

  echoLeftWrapper = document.createElement("div");
  echoLeftWrapper.setAttribute("class", "echoLeftWrapper");
  echoInputForm.appendChild(echoLeftWrapper);

  echoHighLight = document.createElement("textarea");
  echoHighLight.setAttribute("id", "userHighLight");
  echoHighLight.setAttribute("name", "userHighLight");
  echoHighLight.setAttribute("rows", "4");
  echoHighLight.setAttribute("cols", "20");
  echoHighLight.value = selectedString;
  echoLeftWrapper.appendChild(echoHighLight);

  echoText = document.createElement("input");
  echoText.setAttribute("type", "text");
  echoText.setAttribute("id", "userEchoText");
  echoText.setAttribute("name", "userEchoText");
  echoText.setAttribute("placeholder", "add to your Echo");
  echoLeftWrapper.appendChild(echoText);

  echoRightWrapper = document.createElement("div");
  echoRightWrapper.setAttribute("class", "echoRightWrapper");
  echoInputForm.appendChild(echoRightWrapper);

  echoButton = document.createElement("button");
  echoButton.setAttribute("type", "submit");
  echoButton.setAttribute("id", "EchoButton");
  echoRightWrapper.appendChild(echoButton);

  echoTextCharCount = document.createElement("span");
  echoTextCharCount.setAttribute("id", "char-count");
  echoTextCharCount.style.color= "#ffffff";
  echoRightWrapper.appendChild(echoTextCharCount);

  fileRef = document.createElement("link");
  fileRef.setAttribute("rel", "stylesheet");
  fileRef.setAttribute("type", "text/css");
  fileRef.setAttribute("href", chrome.extension.getURL("echoform.css"));
  document.getElementsByTagName("head")[0].appendChild(fileRef);

  echoForm.style.visibility = "visible";
  if ( x > (document.body.clientWidth - 390) ) {
    x = document.body.clientWidth - 400;
  } else if ( x < 30 ) {
    x = 20;
  } else {
    x -= 25;
  };
  echoForm.style.left = x + "px";

  y += 20;
  echoForm.style.top = y + "px";

  body = document.getElementsByTagName("body")[0];
  body.appendChild(echoForm);
  echoTextCharCount.innerHTML = updateCharCount();
  updateCharColor(updateCharCount())
  updateUserFeedback();
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
  var shortenedUrlLength = 24; //subject to change based on length of shortened URL
  var userEchoTextCount = document.getElementById("userEchoText").value.length;
  var userHighLightCount = document.getElementById("userHighLight").value.length;
  return shortenedUrlLength + userHighLightCount + userEchoTextCount;
};

function updateUserFeedback() {
  var inputFields = ["userEchoText", "userHighLight"];
  for (i in inputFields) {
    document.getElementById(inputFields[i]).addEventListener("keyup", function(event) {
      echoTextCharCount.innerHTML = updateCharCount();
      updateCharColor(updateCharCount());
    });
  }
};
