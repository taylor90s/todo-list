module.exports.getDate = function(){
  const today = new Date();
  var day = today.getDay();
  const options = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  const timeString = today.toLocaleDateString("en-US",options);
  return timeString;
}

module.exports.getDay = function(){
  const today = new Date();
  var day = today.getDay();
  const options = {
    weekday: "long",
  };
  const timeString = today.toLocaleDateString("en-US",options);
  return timeString;
}
