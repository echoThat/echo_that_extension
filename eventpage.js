chrome.runtime.onMessage.addListener(
  function(echo, sender, sendResponse) {
    var promise = new Promise(function(resolve, reject) {
      chrome.identity.getProfileUserInfo(function(userInfo) {
        echo['google_credentials'] = userInfo.email;
      });
      chrome.storage.sync.get('chrome_token', function(items) {
        echo['chrome_token'] = items.chrome_token
      });
      echo['message'] = charEncoding(echo['message']);
      echo['url'] = encodeURIComponent(sender.url);
      var timer = setInterval(function() {
        if (echo['google_credentials'] != null && echo['chrome_token'] != null && echo['url'] != null) {
          resolve(echo);
          clearInterval(timer);
        }
      }, 100)
    }).then(function(value) {
      var message = JSON.stringify(echo);
      var xml = new XMLHttpRequest();
      xml.open("POST", "https://echoko.herokuapp.com/api/echos", true);
      xml.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xml.send(message);
      sendResponse({
        message: "Message: " + message
      }, function(reason) {
      });
    });
});

function charEncoding(string) {
  string = string.replace("[","etcode4osqbr");
  return string = string.replace("]","etcode4csqbr");
};
