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
	
// Pop menu	

	
//Contains objects with Agent, Act, Data properties
var SpeakList = [];


var IMGgexmlData = [];
var VideoxmlData = [];
var IDxmlData = [];
var AREAText="";
var PnQData="";

// English Character and SKO Default

var CharactorA;
var CharactorB;
var CharactorC;
var CharactorD;

var Status="";

var Cc1=qs("Cc1","Lee");
var Cc2=qs("Cc2","Lily");
var Cc3=qs("Cc3","Angela");
var Cc4=qs("Cc4","Anna");



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

var PnQCode="";

var RetriveSKOObj={
		guid:qs("guid","b6979123-2a19-4092-8e5b-36e1771d4525"),
		source:"ScriptOnly",
		authorname:"xiangenhu"
	};
	
if (qs("lang","eng")=="chn")
	{
		UserStudent=qs("UserStudent","沛沛");
		SKOSchool=qs("school","class.skoonline.org");
		SKOGuid=qs("guid","02989a6a-b50b-4292-abb9-d496ddda3963");

		CharactorA=Cc1;
		CharactorB=Cc2;
		CharactorC=Cc3;
		CharactorD=Cc4;
		
	}
	if  (qs("lang","eng")=="eng") {
		var UserStudent=qs("UserStudent","Carl");
		SKOSchool=qs("school","class.skoonline.org");
		SKOGuid=qs("guid","b6979123-2a19-4092-8e5b-36e1771d4525");
		CharactorA=Ec1;
		CharactorB=Ec2;
		CharactorC=Ec3;
		CharactorD=Ec4;
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
		if (qs('SType','GAE')=="NONGAE")
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
	if (qs("C1","1")=="1")	{
		s += '<div id="'+CharactorA+'" class="tl-agent">'+CharactorA+'</div>';
	}
	if (qs("C2","1")=="1")	{
		s += '<div id="'+CharactorB+'" class="tr-agent">'+CharactorB+'</div>';
	}
	if (qs("C3","1")=="1")	{
		s += '<div id="'+CharactorC+'" class="bl-agent">'+CharactorC+'</div>';
	}
	if (qs("C4","1")=="1")	{
		s += '<div id="'+CharactorD+'" class="br-agent">'+CharactorD+'</div>';
	}
	Avatars.innerHTML = s; 
	if (qs("lang","eng")=="chn")
	{
		Attache((qs("C1","1")=="1"),Cc1,CharactorA,Cp1);
		Attache((qs("C2","1")=="1"),Cc2,CharactorB,Cp2);
		Attache((qs("C3","1")=="1"),Cc3,CharactorC,Cp3);
		Attache((qs("C4","1")=="1"),Cc4,CharactorD,Cp4);
	}
	if  (qs("lang","eng")=="eng") {
		Attache((qs("C1","1")=="1"),Ec1,CharactorA,Ep1);
		Attache((qs("C2","1")=="1"),Ec2,CharactorB,Ep2);
		Attache((qs("C3","1")=="1"),Ec3,CharactorC,Ep3);
		Attache((qs("C4","1")=="1"),Ec4,CharactorD,Ep4);
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
function ShowDebuggingNow(){
	ShowWindow("ShowDebugging","DebuggingArea");
}

function Speak(movieID,Text,index,print) {
	var SText= ReplaceTest(movieID,Text);
	if (SText!="") 
	{
		if (print==true) {
			var atext="";
			var alink = ' <input type="button" onclick="repeat(&#39;'+movieID+'&#39;,&#39;'+Text+'&#39;,&#39;'+index+'&#39;)" value="Repeat" />';
			atext="<li><b>"+movieID+":</b> " + SText+"</li>";
			var OldText=document.getElementById("Coversation").innerHTML;
			document.getElementById("Coversation").innerHTML = atext+"<br/>"+OldText;
		}
		msSpeak(movieID,SText);
	}
	var newText ='<externalcommand command="next" args="'+index+'"/>.';
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

//Finds which ones is talking and then executes Speak function
function AgentTalk(obj,aIndex){
	if (obj.Agent=="ComputerTutor"){
		Speak(CharactorA,obj.Data,aIndex+1,true);
	}	
	else if (obj.Agent=="ComputerStudent1"){
		Speak(CharactorB,obj.Data,aIndex+1,true);
	} 
	else if (obj.Agent=="ComputerStudent2"){
		Speak(CharactorC,obj.Data,aIndex+1,true);
	} 
	else if (obj.Agent=="ComputerStudent3"){
		Speak(CharactorD,obj.Data,aIndex+1,true);
	}
	
}

//Action(Speaklist). 
//Speaklist contains an array of objects {Agent, Act, Data}
//Runs the object through two functions to see what action to take
function Action(obj,aIndex){
	//debugger;
	if (obj==null) return;
	actionMethods.ifShowMedia(obj,aIndex);
	actionMethods.ifSpeakTalk(obj,aIndex);
}
//When isRunning === true, agents stop talking
var isRunning = false;

//Organizes function to use in Action();
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
			//If there's no period in the data, it would be a youtube video (Ex.image.png is not video)
			if (obj.Data.indexOf('.') == -1){
				displayYoutube("video-placeholder",obj.Data);
				currentIndex=newID;
			}else{
				displayMedia("MediaContainer",qs("MediaBase","https://xiangenhu.github.io/ATMedia/IMG/StatsTutorDemo_ANOVAIntro_ID/"),obj.Data);
			}
			var newText ='<externalcommand command="next" args="'+newID+'"/>.';
			msSpeak(CharactorA,newText);
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////
//The next section of functions deal with the youtube video

//parameters are div and youtube id (obj,Data)
function displayYoutube(YoutubContainer,YoutubeID){
	isRunning = true;
	GetYoutubeVideo(YoutubContainer,YoutubeID);
	document.getElementById(YoutubContainer).style.display = "block";
}

function displayMedia(MediaContainer,MediaBase,MediaURL){
//	isRunning = true;
	var text='<img align="center" usemap="#PnQ" width="640" src="'+MediaBase+MediaURL+'"/>';
	if (MediaURL.toUpperCase().includes("HTTP")==true) {
		text='<img align="center" width="640" usemap="#PnQ" src="'+MediaURL+'"/>';
	}
	
	if (Status=="ASATPageIMG")
	{
		// Map Information here
		/* text=text+'<map name="PnQ" id="PnQ">';
		text=text+'<area href="#" shape="rect" coords="0,0,100,200" data-popupmenu="popmenu1"/>'; 
		text=text+'<area href="#" shape="rect" coords="100,200,100,200" data-popupmenu="popmenu2"/>'; 
		text=text+'</map>';
		text=text+'<ul id="popmenu1" class="jqpopupmenu"> <li><a href="#">Item 1a</a></li><li><a href="#">Item 2a</a></li><li><a href="#">Item Folder 3a</a><ul><li><a href="#">Sub Item 3.1a</a></li><li><a href="#">Sub Item 3.2a</a></li><li><a href="#">Sub Item 3.3a</a></li><li><a href="#">Sub Item 3.4a</a></li></ul></li></ul>';	
		text=text+'<ul id="popmenu2" class="jqpopupmenu"> <li><a href="#">Item 1a</a></li><li><a href="#">Item 2a</a></li><li><a href="#">Item Folder 3a</a><ul><li><a href="#">Sub Item 3.1a</a></li><li><a href="#">Sub Item 3.2a</a></li><li><a href="#">Sub Item 3.3a</a></li><li><a href="#">Sub Item 3.4a</a></li></ul></li></ul>';	 */
		
		GenerateImgMap(IMGgexmlData);
		text=text+AREAText+PnQData;
		
		
		
	}
	document.getElementById(MediaContainer).innerHTML=text;
	document.getElementById(MediaContainer).style.display = "block";
	if (Status=="ASATPageIMG") {
			jQuery(document).ready(function($){
			var $anchors=$('*[data-popupmenu]')
			$anchors.each(function(){
			$(this).addpopupmenu(this.getAttribute('data-popupmenu'))
			})
		})
	}
}
function colorSwitch(id) {
    element = document.getElementById(id);
    element.style.background = '#000000';
}

function GenerateImgMap(MapData)
{
	// Create AREA
	var HotSpotLength=MapData.length;
	var i;
	AREAText='<map name="PnQ" id="PnQ">';
	for (i = 0; i < HotSpotLength; i++) {
			if (MapData[i].Act=="SPOTS"){
				AREAText=AREAText+'<area href="#" shape="rect" coords="'+MapData[i].X.toString()+','+MapData[i].Y.toString()+','+MapData[i].width.toString()+','+MapData[i].height.toString()+'" data-popupmenu="popmenu'+i.toString()+'"/>';
				PnQData=PnQData+'<ul id="popmenu'+i.toString()+'" class="jqpopupmenu"><li><a href="#">'+MapData[i].Question+'</a><ul><li>'+MapData[i].Answer+'</li></ul></li></ul>';
				}
		}
    AREAText=AREAText+'</map>';
	// Create AREA
	var text="";
	for (i = 0; i < HotSpotLength; i++) {
			if (MapData[i].Act=="SPOTS"){
				text=text+"<il>"+ JSON.stringify(MapData[i])+"</li>"
				}
		}
	document.getElementById("DebuggingArea").innerHTML ="<ul>"+text+"</ul>";
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
			if (Status=="ASAT"||Status=="ASATPageIMG")
			{
				document.getElementById("InputArea").style.display = "block";
				document.getElementById("Initialize").style.display = "none";	
			}
			if (Status=="ID")
			{
				Status="ASATPageIMG";
				GetASATPageIMGXML();
			}	
			if (Status=="ASATPageIMG")
			{
			//	Status="ASATPageVideo";
			//	GetASATPageVideoXML();
			}			
			if (Status=="ASATPageVideo")
			{
				Status=ASAT;
				POSTtoACE("POST");	
				document.getElementById("ResumeBTN").style.display = "none";
			}
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

function closeYoutube() {
	var youtubeContainer = document.getElementById('video-placeholder')
	//Style is none is it is closed
    youtubeContainer.style.display = "none";
    //Resumes talking and pauses video
	isRunning = false;
	player.pauseVideo();
	//Resumes talking where leaves off
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

var player;

//Gets the youtube video from the data and makes it ready to be displayed
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
            onReady: initialize,
            onReady: onPlayerReady,
            onReady: seekTo,
            onStateChange: onPlayerStateChange
        }
    });
}

// autoplay video
function onPlayerReady(event) {
    event.target.playVideo();
}

// when video ends
var done = false;
function onPlayerStateChange(event) { 
	//Once it is done function stops
    if(event.data == YT.PlayerState.PLAYING && !done) { 
        setTimeout(closeYoutube, VideoxmlData[aIndex].duration*1000);
        done = true;
    }
}

//play at specific time
function seekTo(event) {
	event.target.seekTo(VideoxmlData[aIndex].currentStart);
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
//Allows you to drag avatar with class tl-agent #Lee


// //Allows you to drag avatar with class tr-agent #Lily
// $(document).ready(function() {
//     $(function() {
//     	$(".tl-agent").draggable();
// 	});

// 	$(function() {
//     	$(".tr-agent").draggable();
// 	});
// }
// )
/////////////////////////////////////////////////////////////////////////////////////////
// Changes XML to JSON
function xmlToJson(xml) {
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["currentAttributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["currentAttributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}else if (xml.nodeType == 4) { // cdata section
		obj = xml.nodeValue
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

//Contains the data with methods Agent Act Data
///////////////////////////////////////////////////////////////////////////////////////////////////
//The next  functions create the IDxmlData. getIDXmlData gets the Agent and Act data from the 
//jsonOfXml. getCdata gets the data for the Speak property. removeEmpty removes empty objects

//Takes xml and converts it to json that can be used in processingReturn. Final data will be in the array IDxmlData
function getIDXmlData(jsonOfXml) {
	//Each item has an object with Act:"Speak". However, it can also have an object  
	//with Act:"Showmedia" if there is a media present
	var item = jsonOfXml.ID.ITEM;
	var mediaIndex=0;

	//There should be 2 counters. "i" is for reading the file and seeing media type.
	//"mediaIndex" is to assign values into the IDxmlData object.
	for(var i=0; i<jsonOfXml.ID.ITEM.length; i++) {
		//Declares an object and adds it to the array
		var obj = {
			Agent: "",
			Act: "",
			Data: "",
		}
		IDxmlData.push(obj);
		var obj = {
			Agent: "",
			Act: "",
			Data: "",
		}
		IDxmlData.push(obj);
		//itemAgent and itemAct are a shortcut (pass by reference)
		var itemAgent = item[i].PageConfig.AVATAR.currentAttributes;
		var itemAct = item[i].PageConfig;
		
		if (itemAct.mediaTypeXML==null) return;

		//Obtain ShowMedia info
		if (itemAct.mediaTypeXML["#text"] == "ImageOnly") {
			IDxmlData[mediaIndex].Agent = "System";
			IDxmlData[mediaIndex].Act = "ShowMedia";
			//The ["#text"] contains the image name (image.jpg)
			IDxmlData[mediaIndex].Data = itemAct.MediaURLXML["#text"];

			mediaIndex++;

			if (itemAgent.useTeacher == "true") {
				IDxmlData[mediaIndex].Agent = "ComputerTutor";
			} else if (itemAgent.useStudent1=="true") {
				IDxmlData[mediaIndex].Agent = "ComputerStudent1";
			} else if (itemAgent.useStudent2=="true") {
				IDxmlData[mediaIndex].Agent = "ComputerStudent2";
			} else if (itemAgent.useStudent3=="true") {
				IDxmlData[mediaIndex].Agent = "ComputerStudent3";
			}
			IDxmlData[mediaIndex].Act = "Speak";
			IDxmlData[mediaIndex].Data = xmlDocCopy.getElementsByTagName("mattextS")[i].textContent;
		} else {
			IDxmlData[mediaIndex].Act = "Speak";
			IDxmlData[mediaIndex].Data = xmlDocCopy.getElementsByTagName("mattextS")[i].textContent;
			//Obtain Agent info
			if (itemAgent.useTeacher == "true") {
				IDxmlData[mediaIndex].Agent = "ComputerTutor";
			} else if (itemAgent.useStudent1=="true") {
				IDxmlData[mediaIndex].Agent = "ComputerStudent1";
			} else if (itemAgent.useStudent2=="true") {
				IDxmlData[mediaIndex].Agent = "ComputerStudent2";
			} else if (itemAgent.useStudent3=="true") {
				IDxmlData[mediaIndex].Agent = "ComputerStudent3";
			}
		}
		mediaIndex++;
	}
}

function removeEmpty(xmlData) {
	for (var i=0; i<xmlData.length; i++){
		if (xmlData[i].Agent == "" && xmlData[i].Act == "" && xmlData[i].Data==""){
			xmlData.splice(i);
		}
	}
}

var jsonOfXml;
var xmlDocCopy;

function GetIDXML(){
	RetriveSKOObj.TagName="ID";
	var url  = "http://"+SKOSchool+"/retrieve?json="+JSON.stringify(RetriveSKOObj); 
	
	var IDRetrive  = new XMLHttpRequest();
	//Fixes issue with firefox browser by forcing it to be read as text
	IDRetrive.overrideMimeType('text/xml; charset=iso-8859-1');

	IDRetrive.open('GET', url, true);
	IDRetrive.onload = function () {
		//ID is a string
		var oldID = IDRetrive.responseText;
		//Adds declaration
		var ID = "<?xml version='1.0' encoding='utf-8'?> \n" + oldID;

		var parser, xmlDoc;

		parser = new DOMParser();
		//xmlDoc is an object #document
		//Converts ID text to xml
		xmlDoc = parser.parseFromString(ID,"text/xml");

		//Cannot use xmlDoc to get Cdata because it has local scope
		//So, we use a copy of it
		xmlDocCopy = xmlDoc;

		//jsonOfXml is an object
		//Converts xml to json
		jsonOfXml = xmlToJson(xmlDoc);

		//Gets data parameter from the json object
		getIDXmlData(jsonOfXml);

		removeEmpty(IDxmlData);
		
		console.log(IDxmlData);
		
		var actionLength=IDxmlData.length;
		SpeakList=[];
		for (var i = 0; i < actionLength; i++) {
				SpeakList.push(IDxmlData[i]); 
				console.log("==>"+JSON.stringify(IDxmlData[i]));
				}
			Action(SpeakList[0],0);		
		}
	IDRetrive.send(null);

}

/////////////////////////////////////////////////////////////////////
//Same functions as above but different text file is obtained from server
var imgData = [];

//The next function get the VideoxmlData.

function GetASATPageVideo(jsonOfXml) {
//debugger;
	pageVideo = jsonOfXml.ASATPageConfigration.ASATPageVideo;
	var mediaIndex = 0;
	//First we play the video and its respective talking head
	for(var i=0; i<pageVideo.ASATPageVideoBreakPoint.length; i++) {
		//You push 2 objects to VideoxmlData for every breakpoint. For each breakpoint, it 
		//plays the video at specific parts and then the talking head says something
		var obj = {
			Agent: "System",
			Act: "ShowMedia",
			Data: pageVideo.ASATPageVideoStoppingPointFileName["#text"],
			currentStart: parseInt(pageVideo.ASATPageVideoBreakPoint[i].ASATPageVideoBreakPointStop["#text"]),
			duration: parseInt(pageVideo.ASATPageVideoBreakPoint[i].ASATPageVideoBreakPointDuration["#text"]),
		}
		VideoxmlData.push(obj);
		var obj = {
			Agent: "",
			Act: "Speak",
			Data: "",
		}
		VideoxmlData.push(obj);
		//Adds stuff to first object
//		VideoxmlData[mediaIndex].currentStart = parseInt(pageVideo.ASATPageVideoBreakPoint[i].ASATPageVideoBreakPointStop["#text"]);
//		VideoxmlData[mediaIndex].duration = parseInt(pageVideo.ASATPageVideoBreakPoint[i].ASATPageVideoBreakPointDuration["#text"]);
		//debugger;
		mediaIndex++;
		//Adds stuff to second object
		if(pageVideo.ASATPageVideoBreakPoint[i].ASATPageVideoBreakPointAgent["#text"] === "Teacher") {
			VideoxmlData[mediaIndex].Agent = "ComputerTutor";
		}
		else{
			VideoxmlData[mediaIndex].Agent = "ComputerStudent";
		}
		VideoxmlData[mediaIndex].Data = xmlDocCopy.getElementsByTagName("ASATPageVideoBreakPointSpeech")[i].textContent;

		mediaIndex++;
	}
	//Now we display the image and its respective talking head
	
//	document.getElementById("DebuggingArea").innerHTML =JSON.stringify(VideoxmlData);
}

function GetASATPagePnQ(jsonOfXml){
	
//debugger;
	pageImage = jsonOfXml.ASATPageConfigration.ASATPageImage;
	var mediaIndex = 0;
	//First we play the video and its respective talking head	
	var obj = {
			Agent: "System",
			Act: "ShowMedia",
			Data: pageImage.ASATPageImgFile["#text"],
		}
	IMGgexmlData.push(obj);
	mediaIndex++;
//	document.getElementById("DebuggingArea").innerHTML =JSON.stringify(jsonOfXml);
	
	for(var i=0; i<pageImage.ASATPageImgHotSpot.length; i++) {
		//debugger;	
		var AnAnswer=pageImage.ASATPageImgHotSpot[i].ASATPageImgHotSpotAnswer["#cdata-section"];
		//	alert(AnAnswer+' 1');
		var NewAnAnswer=AnAnswer.replace(/[\r\n]/g, '');
		//	alert(NewAnAnswer+' 2');
		var obj = {
			Agent: "System",
			Act: "SPOTS",
			X:parseInt(pageImage.ASATPageImgHotSpot[i].ASATPageImgHotSpotX["#text"]),
			Y:parseInt(pageImage.ASATPageImgHotSpot[i].ASATPageImgHotSpotY["#text"]),
			width:parseInt(pageImage.ASATPageImgHotSpot[i].ASATPageImgHotSpotWidth["#text"]),
			height:parseInt(pageImage.ASATPageImgHotSpot[i].ASATPageImgHotSpotHeight["#text"]),
			
			Question:pageImage.ASATPageImgHotSpot[i].ASATPageImgHotSpotQuestion["#text"],
			Answer:NewAnAnswer,
			Form:pageImage.ASATPageImgHotSpot[i].ASATPageImgHotSpotQuestionForm["#text"], 
			QuesBy:pageImage.ASATPageImgHotSpot[i].ASATPageImgHotSpotQuestionBy["#text"],
			AnswBy:pageImage.ASATPageImgHotSpot[i].ASATPageImgHotSpotAnswerBy["#text"] 
		}
		
		IMGgexmlData.push(obj);
		mediaIndex++;
		//debugger;
	}
}

function GetASATPageVideoXML(){
	//debugger;
	RetriveSKOObj.TagName="ASATPageConfigration";		
	var url  = "http://"+SKOSchool+"/retrieve?json="+JSON.stringify(RetriveSKOObj);
	
	var IDRetrive  = new XMLHttpRequest();
	//Fixes issue with firefox browser by forcing it to be read as text
	IDRetrive.overrideMimeType('text/xml; charset=iso-8859-1');

	IDRetrive.open('GET', url, true);
	IDRetrive.onload = function () {
		//ID is a string
		var oldID = IDRetrive.responseText;
		//Adds declaration
		var ID = "<?xml version='1.0' encoding='utf-8'?> \n" + oldID;

		var parser, xmlDoc;

		parser = new DOMParser();
		//xmlDoc is an object #document
		//Converts ID text to xml
		xmlDoc = parser.parseFromString(ID,"text/xml");

		//Cannot use xmlDoc to get Cdata because it has local scope
		//So, we use a copy of it
		xmlDocCopy = xmlDoc;

		//jsonOfXml is an object
		//Converts xml to json
		jsonOfXml = xmlToJson(xmlDoc);

		//Gets data parameter from the json object
		GetASATPageVideo(jsonOfXml);
		//debugger;
		
//		console.log(VideoxmlData);
		document.getElementById("DebuggingArea").innerHTML =JSON.stringify(VideoxmlData);
	//	debugger;
		var actionLength=VideoxmlData.length;
		SpeakList=[];
		for (var i = 0; i < actionLength; i++) {
				SpeakList.push(VideoxmlData[i]); 
				console.log("==>"+JSON.stringify(VideoxmlData[i]));
				}
			Action(SpeakList[0],0);	
		}
	IDRetrive.send(null);

}

function GetASATPageIMGXML(){
	//debugger;
	RetriveSKOObj.TagName="ASATPageConfigration";		
	var url  = "http://"+SKOSchool+"/retrieve?json="+JSON.stringify(RetriveSKOObj);
	
	var IDRetrive  = new XMLHttpRequest();
	//Fixes issue with firefox browser by forcing it to be read as text
	IDRetrive.overrideMimeType('text/xml; charset=iso-8859-1');

	IDRetrive.open('GET', url, true);
	IDRetrive.onload = function () {
		//ID is a string
		var oldID = IDRetrive.responseText;
		//Adds declaration
		var ID = "<?xml version='1.0' encoding='utf-8'?> \n" + oldID;

		var parser, xmlDoc;

		parser = new DOMParser();
		//xmlDoc is an object #document
		//Converts ID text to xml
		xmlDoc = parser.parseFromString(ID,"text/xml");

		//Cannot use xmlDoc to get Cdata because it has local scope
		//So, we use a copy of it
		xmlDocCopy = xmlDoc;

		//jsonOfXml is an object
		//Converts xml to json
		jsonOfXml = xmlToJson(xmlDoc);

		//Gets data parameter from the json object
		GetASATPagePnQ(jsonOfXml);
		//debugger;
		
		console.log(IMGgexmlData);
		
	//	debugger;
		var actionLength=IMGgexmlData.length;
		SpeakList=[];
		for (var i = 0; i < actionLength; i++) {
				SpeakList.push(IMGgexmlData[i]); 
				console.log("==>"+JSON.stringify(IMGgexmlData[i]));
				}
			Action(SpeakList[0],0);	
		}
	IDRetrive.send(null);
}
