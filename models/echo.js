function Echo(string, userText){
  this.quote = string;
  this.userText = userText || "";
  this.sentTo = [];
  this.bitly = SessionController.shortenUrl();
  this.wasSent = false;
}

Echo.prototype.asText = function(){
  if (this.userText == ""){
    return this.quote +"| "+ this.bitly;
  } else {
    return '"'+this.quote + '"| ' + this.userText + this.bitly;
  }
}
