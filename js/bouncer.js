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
	
	
	msAttach('Movie1', 'Ben', 'Player/CBCode/English/Paul/Output/Ben_Files',200,250);
	msAttach('Movie2', 'Angela','Player/CBCode/English/Julie/Output/Angela_Files', 200,250);
	msAttach('Movie3', 'Lily','Player/CBCode/English/Julie/Output/Lily_Files', 200,250);
	msAttach('Movie4', 'Anna','Player/CBCode/English/Kate/Output/Anna_Files', 200,250);
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
	document.getElementById("Accounting4").innerHTML =aIndex;
	if (SpeakList.length < aIndex) 
	{
		aIndex=0;
		return;
	}
	var obj = JSON.parse(SpeakList[aIndex]); 
	if (obj.Agent=="ComputerTutor") 
	{
		Talk("Movie1",obj.Data);
		Play("Movie1", "normal");
	}
	if (obj.Agent=="ComputerStudent") 
	{
		Talk("Movie2",obj.Data);
		Play("Movie2", "normal");
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
	if (id=="Movie1")
	document.getElementById("Accounting1").innerHTML =n+ " "+id;
	if (id=="Movie2")
	document.getElementById("Accounting2").innerHTML =n+ " "+id;
	if (id=="Movie3")
	document.getElementById("Accounting3").innerHTML =n+ " "+id;
	if (id=="Movie4")
	document.getElementById("Accounting4").innerHTML =n+ " "+id;

}
function onVariableChange(id, n)
{
	// One or more variables changed
	
}
// Others