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
	

var SpeakList = [];

var c1=qs("c1","Ben");
var c2=qs("c2","Angela");
var c3=qs("c3","Angela");
var c4=qs("c4","Anna");

var p1=qs("p1","Player/CBCode/English/Paul/Output/Ben_Files");
var p2=qs("p2","Player/CBCode/English/Julie/Output/Angela_Files");
var p3=qs("p3","Player/CBCode/English/Julie/Output/Lily_Files");
var p4=qs("p4","Player/CBCode/English/Kate/Output/Anna_Files");

var urlPageForIFrame = qs("url","https://adlnet.github.io");

var SKOGuid=qs("guid","ef09a0a7-5e35-47c6-b19e-2dc1739b4c75");
var SKOSchool=qs("school","onrstem.skoonline.org");

var IDtoACE=qs("ID","Chinese-test");
var UserStudent=qs("UserStudent","Carl");
var IntitalText =qs("Text","No idea");
var Defaultlanguage=qs("language","Chinese");


function ComposeSKOLink()
		{
			var SKO ={
			guid:SKOGuid,
			TagName:"AutoTutorScript",
			source:"ScriptOnly",
			authorname:"xiangenhu"
			}
		    var school,text;
			school=SKOSchool;
			text= "http://"+school+"/retrieve?json="+JSON.stringify(SKO);
			return text;
		}
var ScriptURL=qs("ScriptURL",ComposeSKOLink());

var iputObj={
			Id:IDtoACE,
			ScriptURL:ScriptURL,
			User:UserStudent,
			language:Defaultlanguage
		};

function refreshSKO(){
    ScriptURL=qs("ScriptURL",ComposeSKOLink());
    iputObj={
			Id:IDtoACE,
			ScriptURL:ScriptURL,
			User:UserStudent,
			language:Defaultlanguage
		};
}		
		
var aceurl=qs("aceurl","http://ace.autotutor.org/aceapi2017/api/aceaction");

var talking=true;

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
	
	
	msAttach('Movie1', c1,p1,200,250);
	msAttach('Movie2', c2,p2, 200,250);
	msAttach('Movie3', c3,p3, 200,250);
	msAttach('Movie4', c4,p4, 200,250);
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

function repeat(movieID, Text){
	document.getElementById("Coversation").innerHTML="";
	msSpeak(movieID, Text);
	aIndex=0;
}

function Speak(movieID,Text,index)
{
	var atext="";
	var alink = ' <input type="button" onclick="Speak(&#39;'+movieID+'&#39;,&#39;'+Text+'&#39;,&#39;'+index+'&#39;)" value="Repeat" />';
	if (movieID=="Movie1"){
			atext="<li><b>Tutor:</b> " + Text+alink+"</li>";
		}
	if (movieID=="Movie2"){
			atext="<li><b>Student:</b> " + Text+alink+"</li>";
		}
	var OldText=document.getElementById("Coversation").innerHTML;
	document.getElementById("Coversation").innerHTML = atext+"<br/>"+OldText;
	var newText=Text+' <pause/> <externalcommand command="next" args="'+index+'"/>';
	msSpeak(movieID, newText);
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

function AgentTalk(obj,aIndex){
	if (obj.Agent=="ComputerTutor"){
		Speak("Movie1",obj.Data,aIndex+1);
	}	
	if (obj.Agent=="ComputerStudent"){
		Speak("Movie2",obj.Data,aIndex+1);
	}
	
}
function onPresentingChange(id, p)
{
	talking=p;
}
function onFocusChange(id, f)
{
	// Focus changed, e.g. as a result of navigation
}
function onExternalCommand(id, cmd, args)
{
	if (cmd=="next"){
		var aIndex=Number(args);
		if (aIndex==SpeakList.length) {
			document.getElementById("InputArea").style.display = "block";
			document.getElementById("Initialize").style.display = "none";
			return;
		}
		AgentTalk(SpeakList[aIndex],aIndex);
	}
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