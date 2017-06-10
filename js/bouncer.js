var xhttp;
// URL Parser
function qs(search_for,defaultstr) {
	var query = window.location.search.substring(1);
	var parms = query.split('&');
	for (var i = 0; i<parms.length; i++) {
		var pos = parms[i].indexOf('=');
		if (pos > 0  && search_for == parms[i].substring(0,pos)) {
			return parms[i].substring(pos+1);
			}
		}
		return defaultstr;
	}
function doResize()
{
}


var SpeakList = [];

var aIndex = 0;

var responses = [];

function onContentLoaded()
{
	var s = '';
	s += '<div id="Movie1" class="tl-agent"></div>';
	s += '<div id="Movie2" class="tr-agent"></div>';
	s += '<div id="Movie3" class="bl-agent"></div>';
	s += '<div id="Movie4" class="br-agent"></div>';
	document.getElementById('TopDiv').innerHTML = s;
	
	var c1=qs("c1","Ben");
	var c2=qs("c2","Angela");
	var c3=qs("c3","Angela");
	var C4=qs("c4","Anna");
	
	var p1=qs("p1","Player/CBCode/English/Paul/Output/Ben_Files");
	var p2=qs("p2","Player/CBCode/English/Julie/Output/Angela_Files");
	var p3=qs("p3","Player/CBCode/English/Julie/Output/Lily_Files");
	var p4=qs("p4","Player/CBCode/English/Kate/Output/Anna_Files");
	
	msAttach('Movie1', c1,p1,200,250);
	msAttach('Movie2', c2,p2, 200,250);
	msAttach('Movie3', c3,p3, 200,250);
	msAttach('Movie4', c4,p4, 200,250);
}

function Talk(Movie,s)
{
	Speak(Movie, s);
}

function Playing(Movie,s)
{
	Play(Movie, s);
}

function responsing(Movie,s)
{
	response(Movie, s);
}

function Play(movieID,Text)
{
//    alert("Playing "+" " +movieID+"   "+Text+" Not implemented yet ");
	msPlay(movieID, Text);
}



function Speak(movieID,Text)
{
//	msSpeakQueued(movieID, Text);
	var atext="";
	var alink = '<input type="button" onclick="msSpeak(&#39;'+movieID+'&#39;,&#39;'+Text+'&#39;)" value="Try again" />';
//	alert(alink);
	if (movieID=="Movie1"){
			atext="<b>Tutor:</b> " + Text+alink;
		}
	if (movieID=="Movie2"){
			atext="<b>Student:</b> " + Text+alink;
		}
	var OldText=document.getElementById("outputJSON").innerHTML;
	document.getElementById("outputJSON").innerHTML = atext+"<br/>"+OldText;
	msSpeak(movieID, Text);
}
function response(movieID,Text)
{
//     alert("Response "+" " +movieID+"   "+Text+" Not implemented yet ");
	msResponse(movieID, Text);
}

function onSceneLoaded(id)
{
	// CB content loaded and ready to accept commands - will get N of these where N is # of characters
	

}
function onPresentingChange(id, p)
{
	aIndex++;
	
	if (aIndex==SpeakList.length) {
		document.getElementById("SubmitAnswer").style.display = "block";
		document.getElementById("inputText").style.display = "block";
		return;
	}
		
	msStop("Movie1");
	msStop("Movie2");
	if (SpeakList.length==0) return;
	if (SpeakList.length < aIndex) aIndex=0;
	if (aIndex>SpeakList.length-1) 
	{
		aIndex=0;
		return;
	}
	var obj = JSON.parse(SpeakList[aIndex]); 
	if (obj.Agent=="ComputerTutor") 
	{
		Talk("Movie1",obj.Data);
	}
	if (obj.Agent=="ComputerStudent") 
	{
		Talk("Movie2",obj.Data);
	}
}
function onFocusChange(id, f)
{
	// Focus changed, e.g. as a result of navigation
}
function onExternalCommand(id, cmd, args)
{
	// External Command encountered in script
	//alert("External Command cmd=" + cmd + ", args=" + args);
}
function onQueueLengthChange(id, n)
{
	// msSpeakQueued queue length change
}
function onVariableChange(id, n)
{
	// One or more variables changed
	
}
// Others