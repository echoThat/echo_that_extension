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
};

function evalTwitterChanges(){
  document.getElementById("twitter-switch-listener").addEventListener("click", function(event){
    event.preventDefault();
    var checkbox = document.getElementById("twitter-toggle")
    var oldStatus = checkbox.getAttribute("checked");

    if(!oldStatus){
      checkbox.setAttribute("checked", true);
      chrome.storage.sync.set({"twitterOn":true}, function(response){
        console.log("twitter posting enabled");
      });
    } else {
      checkbox.removeAttribute("checked");
      chrome.storage.sync.set({"twitterOn":false}, function(response){
        console.log("twitter posting disabled");
      });
    };
  });
};

