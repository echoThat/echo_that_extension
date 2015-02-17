document.addEventListener('DOMContentLoaded', function() {
  userRailsOauth();
  twitterOauthStarter();
  facebookOauthStarter();
  showPostSettings();
  postChangeListen();
});



function userRailsOauth() {
  chrome.identity.getProfileUserInfo(function(userInfo) {

    var promise = new Promise(function(resolve, reject) {
      var xml = new XMLHttpRequest();
      xml.open("POST", "http://www.thatecho.co/api/users", true);
      xml.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xml.setRequestHeader("Accept", "application/json");
      xml.onload = function() {
        if (xml.status === 200) {
          var responseString = JSON.parse(xml.response);
          chrome.storage.sync.set({
            'chrome_token': responseString.key
          });
        } else {
          reject("Your response was bad.")
        };
      };
      var timer = setInterval(function() {
        if (userInfo['email'] != "" && userInfo['id'] != "") {
          var message = JSON.stringify(userInfo);
          xml.send(message);
          clearInterval(timer);
        }
      }, 100)
    });
    return promise;
  });
};

function RailsTwitterOauth() {
  chrome.identity.getProfileUserInfo(function(userInfo) {
    var message = JSON.stringify(userInfo);
    chrome.tabs.create({ url: "http://www.thatecho.co/auth/twitter?google_credentials=" + userInfo.email });
  });
};

function twitterOauthStarter() {
  document.getElementById('TwitterEchoAuth').addEventListener('click', function(event) {
    event.preventDefault();
    RailsTwitterOauth();
  });
};

function RailsFacebookOauth() {
  chrome.identity.getProfileUserInfo(function(userInfo) {
    var message = JSON.stringify(userInfo);
    chrome.tabs.create({ url: "http://www.thatecho.co/auth/facebook?scope=publish_actions&google_credentials=" + userInfo.email  });
  });
};

function facebookOauthStarter() {
  document.getElementById('FacebookEchoAuth').addEventListener('click', function(event) {
    event.preventDefault();
    RailsFacebookOauth();
  });
};

function showPostSettings(){
  showTwitterSettings();
  showFacebookSettings();
};

function showTwitterSettings(){
  chrome.storage.sync.get("twitterOn", function(result){
    var twitterStatus = (result.twitterOn);

    if( twitterStatus === false ){
      document.getElementById('twitter-toggle').removeAttribute('checked');
    } else {
      document.getElementById('twitter-toggle').setAttribute('checked', true);
    };
  });
};

function showFacebookSettings(){
  chrome.storage.sync.get("facebookOn", function(result){
    var facebookStatus = (result.facebookOn);

    if( facebookStatus === false ){
      document.getElementById('facebook-toggle').removeAttribute('checked');
    } else {
      document.getElementById('facebook-toggle').setAttribute('checked', true);
    };
  });
};

function postChangeListen(){
  evalTwitterChanges();
  evalFacebookChanges();
  sendAnyUserChanges();
};

function evalTwitterChanges(){
  document.getElementById("twitter-switch-listener").addEventListener("click", function(event){
    event.preventDefault();
    var checkbox = document.getElementById("twitter-toggle")
    var oldStatus = checkbox.getAttribute("checked");

    if(!oldStatus){
      checkbox.setAttribute("checked", true);
      chrome.storage.sync.set({"twitterOn":true}, function(response){
        console.log("echoThat to twitter enabled");
      });
    } else {
      checkbox.removeAttribute("checked");
      chrome.storage.sync.set({"twitterOn":false}, function(response){
        console.log("echoThat to twitter disabled");
      });
    };
  });
};

function evalFacebookChanges(){
  document.getElementById("facebook-switch-listener").addEventListener("click", function(event){
    event.preventDefault();
    var checkbox = document.getElementById("facebook-toggle")
    var oldStatus = checkbox.getAttribute("checked");

    if(!oldStatus){
      checkbox.setAttribute("checked", true);
      chrome.storage.sync.set({"facebookOn":true}, function(response){
        console.log("echoThat to facebook enabled");
      });
    } else {
      checkbox.removeAttribute("checked");
      chrome.storage.sync.set({"facebookOn":false}, function(response){
        console.log("echoThat to facebook disabled");
      });
    };
  });
};

function sendAnyUserChanges(){
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for(key in changes){
    if(key === "chrome_token"){
      return "echoThat token set";
    }
    else {
      new Promise(function(resolve, reject){
        chrome.identity.getProfileUserInfo(function(userInfo){
          resolve(userInfo.email);
          reject(Error("Unable to retrieve userInfo for echoThat"));
        });

      }).then(function(response){
          for(outletOn in changes[key].newValue){
            var booleanTerm = changes[key].newValue[outletOn];
            sendToggle(response, outletOn, booleanTerm);
          };
        });
      };
    };
  });
};

function sendToggle(userEmail, outletOn, booleanTerm){
  var url = "http://localhost:3000/api/toggle?"+outletOn+"="+booleanTerm+"&google_credentials="+userEmail;
  return new Promise(function(resolve, reject){

    var request = new XMLHttpRequest();
    request.open('post', url, true);
    request.onload = function(){
      if(request.status == 200){
        resolve(request.response);
      }
      else {
        reject(Error(request.statusText));
      }
    };

    request.onerror = function() {
      reject(Error("Network Error"));
    };

    request.send();
  });
};
