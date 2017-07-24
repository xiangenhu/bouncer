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

if (qs("lang","chn")=="chn")
	{
		UserStudent=qs("UserStudent","小明");
		SKOGuid=qs("guid","50ed8af1-3fd1-4ca2-ab1d-3b5cc97fbfbf");
	}
	if  (qs("lang","chn")=="eng") {
		var UserStudent=qs("UserStudent","Carl");
		SKOGuid=qs("guid","bf406af8-b18a-4b2f-b03b-1d285ef19b7e");
	}

var SKOSchool=qs("school","ccnu.x-in-y.com:8889");

var IDtoACE=qs("ID","Chinese-test");
var IntitalText =qs("Text","No idea");
var Defaultlanguage=qs("language","Chinese");



function ComposeSKOLink(){
	    if (qs('SType','NGAE')=="GAE")
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
		if (qs('SType','NGAE')=="NGAE")
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

var responses = [];

function AttachTalkingHeads(c1,p1,s1,c2,p2,s2,c3,p3,s3,c4,p4,s4){	
	 var Avatars = document.getElementById("TopDiv");
	document.getElementById(CharactorA).remove();
	document.getElementById(CharactorB).remove();
	document.getElementById(CharactorC).remove();
	document.getElementById(CharactorD).remove();
    Avatars.innerHTML ="";
	CharactorA=c1;
	CharactorB=c2;
	CharactorC=c3;
	CharactorD=c4;
	var s = '';
	s += '<div id="'+CharactorA+'" class="tl-agent"></div>';
	s += '<div id="'+CharactorB+'" class="tr-agent"></div>';
	s += '<div id="'+CharactorC+'" class="bl-agent"></div>';
	s += '<div id="'+CharactorD+'" class="br-agent"></div>';
	Avatars.innerHTML = s; 
	if (s1=="true") {
		msAttach(CharactorA, c1,p1,200,250);
	}
	if (s2=="true") {
		msAttach(CharactorB, c2,p2, 200,250);
	}
	if (s3=="true") {
		msAttach(CharactorC, c3,p3, 200,250);
	}
	if (s4=="true") {
		msAttach(CharactorD, c4,p4, 200,250);
	}
	document.body.appendChild(Avatars);
}
function Attache(Att,ChName,Agent,Path){
	if (Att){
		msAttach(Agent, ChName,Path,200,250);
    }
}


function onContentLoaded()
{
	var Avatars = document.getElementById("TopDiv");
	var s = '';
	s += '<div id="'+Cc1+'" class="tl-agent"></div>';
	s += '<div id="'+Cc2+'" class="tr-agent"></div>';
	s += '<div id="'+Cc3+'" class="bl-agent"></div>';
	s += '<div id="'+Cc4+'" class="br-agent"></div>';
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

function Speak(movieID,Text,index,print)
{
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

function Action(obj,aIndex){
	if (obj.Act=="Speak") {
		AgentTalk(obj,aIndex);
	}
	if (obj.Act=="ShowMedia") {
		var newID=aIndex+1;
		displayMedia("MediaContainer",qs("MediaBase","https://xiangenhu.github.io/ATMedia/IMG/CAT/"),obj.Data);
		var newText ='<externalcommand command="next" args="'+newID+'"/>.';
		msSpeak(CharactorA,newText);
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