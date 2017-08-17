// Changes XML to JSON
function xmlToJson(xml) {
	debugger;
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};



// //Sample xml
// var text, parser, xmlDoc;

// text = "<bookstore><book>" +
// "<title>Everyday Italian</title>" +
// "<author>Giada De Laurentiis</author>" +
// "<year>2005</year>" +
// "</book></bookstore>";

// parser = new DOMParser();
// xmlDoc = parser.parseFromString(text,"text/xml");

 console.log(xmlToJson(


 	));

function processingReturn(data){
    var actionLength, text, i;
    actionLength=data.ACEActions.length;
	SpeakList=[];
	
	OldText=document.getElementById("Coversation").innerHTML="";
	var x = document.getElementById('InputArea');
	x.style.display = 'none';
	
//			console.log("++=============================================================");
//			console.log(JSON.stringify(data));
//			console.log("=============================================================++++");
	
	for (i = 0; i < actionLength; i++) {
		if ((data.ACEActions[i].Act=="Speak") || (data.ACEActions[i].Act=="ShowMedia")){
			SpeakList.push(data.ACEActions[i]); 
			console.log(JSON.stringify(data.ACEActions[i]));
			}
	}
	Action(SpeakList[0],0);		
}



function POSTtoACE(Method){

iputObj.Text=IntitalText;
var getUrl = $.ajax({
	type: Method,
	url: aceurl,
	data: iputObj,
		success: function() {
			var x = document.getElementById('Coversation');
			x.style.display = 'block';
			var s = document.getElementById('InputArea');
			s.style.display = 'none';
			var s = document.getElementById('Initialize');
			s.style.display = 'none';
			PuttoACE("不知道");
			
		}
	})
}


function PuttoACE(Inputtext){

	iputObj.Text=Inputtext;
	
var getUrl = $.ajax({
	type: "PUT",
	url: aceurl,
	data: iputObj,
	success: function (data) {
	    speakerData=data;
	    processingReturn(speakerData);
	}
})
}

$(document).ready(function () {
    $('input#Initialize').click(
        function (event) {
			event.preventDefault();
			POSTtoACE("POST");
            });
		$('input#SubmitAnswer').click(
        function (event) {
			event.preventDefault();
			PuttoACE($('textarea#inputText').val());
            });
});


