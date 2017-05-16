
document.addEventListener('DOMContentLoaded', function() {
  var selection1;
  console.log(document.getElementsByTagName('tutor'));

  var prepare = function(){
        var array = [];

        for (var i=0; i<document.getElementsByTagName('tutor').length; i++){
            var gender;
            if (document.getElementsByTagName('tutor')[i].getAttribute('gender') == "male"){
                gender = 1
            } else{
                gender = 0
            }

            array.push({
                "g": gender,
                "t" :document.getElementsByTagName('tutor')[i].getAttribute('message')
            });
        };

        return JSON.stringify(array)
   }

  selection1 = chrome.tabs.executeScript( {
    code: "("+prepare.toString()+")();"
  }, function(selection) {
    console.log(selection);
    $("#head").attr('src', 'http://localhost/talkingHeadServer/index.html?text=' + decodeURIComponent(selection));
  });
});
