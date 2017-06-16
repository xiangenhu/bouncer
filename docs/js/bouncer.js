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

var c1=qs("c1","Lee");
var c2=qs("c2","Lily");
var c3=qs("c3","Angela");
var c4=qs("c4","Anna");

var p1=qs("p1","Player/CBCode/Chinese/Liang/Output/Lee_Files");
var p2=qs("p2","Player/CBCode/Chinese/Hui/Output/Lily_Files");
var p3=qs("p3","Player/CBCode/English/Julie/Output/Lily_Files");
var p4=qs("p4","Player/CBCode/English/Kate/Output/Anna_Files");

var urlPageForIFrame = qs("url","https://adlnet.github.io");

var SKOGuid=qs("guid","50ed8af1-3fd1-4ca2-ab1d-3b5cc97fbfbf");
var SKOSchool=qs("school","ccnu.x-in-y.com:8889");

var IDtoACE=qs("ID","Chinese-test");
var UserStudent=qs("UserStudent","小明");
var IntitalText =qs("Text","No idea");
var Defaultlanguage=qs("language","Chinese");


function ComposeSKOLink()  //for none gae only
		{
			var SKO ={
			guid:SKOGuid,
			return:"scriptContent",
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

function repeat(movieID, Text,index){
	Speak(movieID, Text,index,false);
//	aIndex=0;
}

function ShowWindow(chkbox,targetw) {
	
    var x = document.getElementById(chkbox);
	if (x.checked == true) {
    document.getElementById(targetw).style.display = "block";
	}
	if (x.checked == false) {
    document.getElementById(targetw).style.display = "none";
	}
}

function ShowLog(){
	ShowWindow("ShowLogs","Coversation");
}

function Speak(movieID,Text,index,print)
{
	if (print==true) {
		var atext="";
		var alink = ' <input type="button" onclick="repeat(&#39;'+movieID+'&#39;,&#39;'+Text+'&#39;,&#39;'+index+'&#39;)" value="Repeat" />';
		if (movieID=="Movie1"){ 
				atext="<li><b>Tutor:</b> " + Text+"</li>";
			}
		if (movieID=="Movie2"){
				atext="<li><b>Student:</b> " + Text+"</li>";
			}
		var OldText=document.getElementById("Coversation").innerHTML;
		document.getElementById("Coversation").innerHTML = atext+"<br/>"+OldText;
	}
	var newText ='<externalcommand command="next" args="'+index+'"/>';
	msSpeak(movieID, Text);
	msSpeakQueued(movieID,newText);
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
		Speak("Movie1",obj.Data,aIndex+1,true);
	}	
	if (obj.Agent=="ComputerStudent"){
		Speak("Movie2",obj.Data,aIndex+1,true);
	}
	
}

function Action(obj,aIndex){
	if (obj.Act=="Speak") {
		AgentTalk(obj,aIndex);
	}
	if (obj.Act=="ShowMedia") {
		var newID=aIndex+1;
		displayMedia("MediaContainer",qs("MediaBase","https://xiangenhu.github.io/ATMedia/IMG/CAT/"),obj.Data);
		var newText ='<externalcommand command="next" args="'+newID+'"/>';
		msSpeak("Movie1",newText);
	}
}

function displayMedia(MediaContainer,MediaBase,MediaURL){
	var text='<img align="center" width="480" src="'+MediaBase+MediaURL+'"/>';
	if (MediaURL.toUpperCase().includes("HTTP")==true) {
		text='<img align="center" width="480" src="'+MediaURL+'"/>';
	}
	document.getElementById(MediaContainer).innerHTML=text;
	document.getElementById(MediaContainer).style.display = "block";
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
//			displayMedia("MediaContainer","","https://xiangenhu.github.io/ATMedia/IMG/CAT/Down2andTone.png");
			return;
		}
		Action(SpeakList[aIndex],aIndex);
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