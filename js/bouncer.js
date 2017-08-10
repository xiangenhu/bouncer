var xhttp;
// URL Parser

//search_for is phrase on left of =
//returns phrase on right of = for search_for
//If not found, return defaultstr
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

// English Character and SKO Default

var Cc1=qs("Cc1","Lee");
var Cc2=qs("Cc2","Lily");
var Cc3=qs("Cc3","Angela");
var Cc4=qs("Cc4","Anna");


var CharactorA=Cc1;
var CharactorB=Cc2;
var CharactorC=Cc3;
var CharactorD=Cc4;

var Cp1=qs("Cp1","CBCode/Chinese/Liang/Output/Lee_Files");
var Cp2=qs("Cp2","CBCode/Chinese/Hui/Output/Lily_Files");
var Cp3=qs("Cp3","CBCode/Chinese/Hui/Output/Angela_Files");
var Cp4=qs("Cp4","CBCode/Chinese/Hui/Output/Anna_Files");

// English Character and SKO Default

var Ec1=qs("Ec1","Ben");
var Ec2=qs("Ec2","Angela");
var Ec3=qs("Ec3","Lily");
var Ec4=qs("Ec4","Anna");

var Ep1=qs("Ep1","CBCode/English/Paul/Output/Ben_Files");
var Ep2=qs("Ep2","CBCode/English/Julie/Output/Angela_Files");
var Ep3=qs("Ep3","CBCode/English/Julie/Output/Lily_Files");
var Ep4=qs("Ep4","CBCode/English/Kate/Output/Anna_Files");

var urlPageForIFrame = qs("url","");


// var UserStudent=qs("UserStudent","小明");

// var SKOGuid=qs("guid","50ed8af1-3fd1-4ca2-ab1d-3b5cc97fbfbf");

var UserStudent=qs("UserStudent","Carl");
var SKOGuid=qs("guid","bf406af8-b18a-4b2f-b03b-1d285ef19b7e");
var SKOSchool=qs("school","ccnu.x-in-y.com:8889");
if (qs("lang","chn")=="chn")
	{
		UserStudent=qs("UserStudent","沛沛");
		SKOSchool="class.skoonline.org";
		SKOGuid=qs("guid","02989a6a-b50b-4292-abb9-d496ddda3963");
	}
	if  (qs("lang","chn")=="eng") {
		var UserStudent=qs("UserStudent","Carl");
		SKOGuid=qs("guid","bf406af8-b18a-4b2f-b03b-1d285ef19b7e");
	}



var IDtoACE=qs("ID","Chinese-test");
var IntitalText =qs("Text","No idea");
var Defaultlanguage=qs("language","Chinese");



function ComposeSKOLink(){
	    if (qs('SType','GAE')=="GAE")
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
		if (qs('SType','NGAE')=="GAE")
     	{
			var SKO ={
			guid:SKOGuid,
			return:"scriptContent"
			}
		    var school,text;
			school=SKOSchool;
			text= "http://"+school+"/retrieve?json="+JSON.stringify(SKO);
			return text;
		}
}
var ScriptURL=qs("ScriptURL",ComposeSKOLink());

var iputObj={
			Id:IDtoACE,
			ScriptURL:ScriptURL,
			User:UserStudent,
			language:Defaultlanguage
		};

function AvatarsAction(data){
		var actionLength, text, i;
		actionLength=data.length;
		SpeakList=[];
		OldText=document.getElementById("Coversation").innerHTML="";
		for (i = 0; i < actionLength; i++) {
			if ((data[i].Act=="Speak") || (data[i].Act=="ShowMedia")){
				SpeakList.push(data[i]); 
				}
		}
		Action(SpeakList[0],0);		
}
		
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

var currentIndex=0;

var responses = [];

function Attache(Att,ChName,Agent,Path){
	if (Att){
		msAttach(Agent, ChName,Path,200,250);
    }
}


function onContentLoaded()
{
	var Avatars = document.getElementById("TopDiv");
	var s = '';
	if (qs("C1","0")=="1")	{
		s += '<div id="'+Cc1+'" class="tl-agent">'+Cc1+'</div>';
	}
	if (qs("C2","0")=="1")	{
		s += '<div id="'+Cc2+'" class="tr-agent">'+Cc2+'</div>';
	}
	if (qs("C3","0")=="1")	{
		s += '<div id="'+Cc3+'" class="bl-agent">'+Cc3+'</div>';
	}
	if (qs("C4","0")=="1")	{
		s += '<div id="'+Cc4+'" class="br-agent">'+Cc4+'</div>';
	}
	Avatars.innerHTML = s; 
	if (qs("lang","chn")=="chn")
	{
		Attache((qs("C1","0")=="1"),Cc1,CharactorA,Cp1);
		Attache((qs("C2","0")=="1"),Cc2,CharactorB,Cp2);
		Attache((qs("C3","0")=="1"),Cc3,CharactorC,Cp3);
		Attache((qs("C4","0")=="1"),Cc4,CharactorD,Cp4);
	}
	if  (qs("lang","chn")=="eng") {
		Attache((qs("C1","0")=="1"),Ec1,CharactorA,Ep1);
		Attache((qs("C2","0")=="1"),Ec2,CharactorB,Ep2);
		Attache((qs("C3","0")=="1"),Ec3,CharactorC,Ep3);
		Attache((qs("C4","0")=="1"),Ec4,CharactorD,Ep4);
	}

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

function ReplaceTest(MoveID,Text){
	var Res=Text;
	Res=Res.replace("_NAMES1_", CharactorB);
	Res=Res.replace("_NAMES2_", CharactorC);
	Res=Res.replace("_NAMES3_", CharactorD);
	Res=Res.replace("_NAMET_", CharactorA);
	Res=Res.replace("_SELF_", MoveID);
	return Res;
}

function ShowLog(){
	ShowWindow("ShowLogs","Coversation");
}

function Speak(movieID,Text,index,print) {
	var SText= ReplaceTest(movieID,Text);
	
	if (print==true) {
		var atext="";
		var alink = ' <input type="button" onclick="repeat(&#39;'+movieID+'&#39;,&#39;'+Text+'&#39;,&#39;'+index+'&#39;)" value="Repeat" />';
		if (movieID==CharactorA){ 
				atext="<li><b>Tutor:</b> " + SText+"</li>";
			}
		if (movieID==CharactorB){
				atext="<li><b>Student:</b> " + SText+"</li>";
			}
		var OldText=document.getElementById("Coversation").innerHTML;
		document.getElementById("Coversation").innerHTML = atext+"<br/>"+OldText;
	}
	var newText ='<externalcommand command="next" args="'+index+'"/>.';
	msSpeak(movieID,SText);
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
		Speak(CharactorA,obj.Data,aIndex+1,true);
	}	
	if (obj.Agent=="ComputerStudent"){
		Speak(CharactorB,obj.Data,aIndex+1,true);
	}
	
}

//Action(Speaklist). 
//Speaklist contains an array of objects {Agent, Act, Data}
function Action(obj,aIndex){
	actionMethods.ifShowMedia(obj,aIndex);
	actionMethods.ifSpeakTalk(obj,aIndex);
}
//When isRunning === true, agents stop talking
var isRunning = false;

var actionMethods = {
	
	ifSpeakTalk: function(obj, aIndex) {
		//Only runs if isRunning is false
		if (obj.Act=="Speak" && isRunning === false) {
			AgentTalk(obj,aIndex);
		}
	},

	ifShowMedia: function(obj, aIndex) {

		if (obj.Act=="ShowMedia") {
			var newID=aIndex+1;
			if (obj.Data.indexOf('.') == -1){
				displayYoutube("video-placeholder",obj.Data);
				currentIndex=newID;
			}else{
				displayMedia("MediaContainer",qs("MediaBase","https://xiangenhu.github.io/ATMedia/IMG/CAT/"),obj.Data);
			}
			var newText ='<externalcommand command="next" args="'+newID+'"/>.';
			msSpeak(CharactorA,newText);
		}
	}
}

function displayYoutube(YoutubContainer,YoutubeID){

	isRunning = true;
	GetYoutubeVideo(YoutubContainer,YoutubeID);
	document.getElementById(YoutubContainer).style.display = "block";
}

function displayMedia(MediaContainer,MediaBase,MediaURL){
//	isRunning = true;
	var text='<img align="center" width="640" src="'+MediaBase+MediaURL+'"/>';
	if (MediaURL.toUpperCase().includes("HTTP")==true) {
		text='<img align="center" width="640" src="'+MediaURL+'"/>';
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

function closeYoutube(VideoPlaceHolder) {
	var youtubeContainer = document.getElementById(VideoPlaceHolder)
    youtubeContainer.style.display = "none";
	isRunning = false;
	player.pauseVideo();
	Action(SpeakList[currentIndex],currentIndex);
}

function runDisplay() {
	isRunning = false;
	Action(SpeakList[currentIndex],currentIndex);
}

function pauseSession() {
	isRunning = true;
	currentIndex+=1;
}

function resumeSession() {
	isRunning = false;
	Action(SpeakList[currentIndex],currentIndex);
}

// function makeTlAgentBigger() {
// 	var tlAgent = document.querySelector("tl-agent");

// 	tlAgent.addEventListener('click', function(){
		
		
// 	});
// }
// Youtube Controls

var player;

function GetYoutubeVideo(VideoPlaceHolder,VideoID){
	 player = new YT.Player(VideoPlaceHolder, {
        width: 640,
        height: 480,
        videoId: VideoID,
        playerVars: {
            color: 'white',
            playlist: ''
        },
        events: {
            onReady: initialize
        }
    });
}
 
function onYouTubeIframeAPIReady() {
	return;
   
} 

function initialize(){

    // Update the controls on load
    updateTimerDisplay();
    updateProgressBar();

    // Clear any old interval.
    clearInterval(time_update_interval);

    // Start interval to update elapsed time display and
    // the elapsed part of the progress bar every second.
    time_update_interval = setInterval(function () {
        updateTimerDisplay();
        updateProgressBar();
    }, 1000)

}


