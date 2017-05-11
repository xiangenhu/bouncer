window.SteveAS3HTML_Dir = {
	"width":200, "height":250, "presenting":false, "fps":12, "blankfile":"blank.mp3", "version":"5.4.2.0", "allowautoplay":"detect",
	"items":{
		"Scene1":{
			"type":"scene", "name":"Scene 1",
			"items":{
				"Char1":{"type":"character", "name":"Steve", "left":0, "top":67, "width":200, "height":160, "artwidth":250, "artheight":200, "mode":"replace"},
				"MsgChar1Idle":{
					"type":"message", "idle":true, "character":"Char1", "frames":18,
					"onframe":{
						"0":"c.load('Img1','9089776735BA9AD6A20ED4B01A020993.png',250,105,105,1);c.load('Img10','3C9E1839C58001BDC0EC6057847E133E.png',95,238,14,1);c.load('Img11','D60A696195201C61465BBADBB98A3A8A.png',95,476,14,1);c.load('Img12','618158457FD876323D3593BEB653DD5C.png',95,476,14,1);c.load('Img13','253BF5AF8E11F5135A6DC94433EFAFA0.png',95,476,14,1);c.load('Img2','212F1C70CDF5C17A5B7633E1FF4CF20D.png',219,200,200,1);c.load('Img3','2BD5AD2E7B4D3EC211678BD4043F9ED7.png',219,4400,200,1);c.load('Img4','AF4E0124B4F09F87D409C0D051A55226.png',219,1600,200,1);c.load('Img5','D700A8D204DC994E50F3999600EC50ED.png',219,1600,200,1);c.load('Img6','6E64E0B7FA16DC1A6137F933D2470747.png',76,62,31,1);c.load('Img7','F2BCD1D65B039995206BC2472B9791FC.png',76,62,31,1);c.load('Img8','2B3E117C82B6B8CC09DA429B6DF3959E.png',76,62,31,1);c.load('Img9','5239159CF9F943B3FB230F25C5069619.png',76,62,31,1);",
						"1":"c.add('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);c.addctl('Img3',15,0,'randomright');c.addctl('Img4',15,0,'headright');c.addctl('Img5',15,0,'headleft');c.addctl('Img6',88,72,'blink');c.addctl('Img7',88,72,'random1blink');c.addctl('Img8',88,72,'random2blink');c.addctl('Img9',88,72,'random4blink');c.addctl('Img10',78,87,'pupils0');c.addctl('Img11',78,87,'pupils1');c.addctl('Img12',78,87,'pupils2');c.addctl('Img13',78,87,'pupils3');",
						"2":"c.ctlaction('eyetracker');",
						"3":"",
						"4":"",
						"5":"",
						"6":"",
						"7":"",
						"8":"c.rec(18);",
						"9":"",
						"10":"",
						"11":"c.rec(18);",
						"12":"",
						"13":"c.branch(3);",
						"14":"",
						"15":"",
						"16":"c.stop()",
						"17":"",
						"18":"c.add('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);c.addctl('Img3',15,0,'randomright');c.addctl('Img4',15,0,'headright');c.addctl('Img5',15,0,'headleft');c.addctl('Img6',88,72,'blink');c.addctl('Img7',88,72,'random1blink');c.addctl('Img8',88,72,'random2blink');c.addctl('Img9',88,72,'random4blink');c.addctl('Img10',78,87,'pupils0');c.addctl('Img11',78,87,'pupils1');c.addctl('Img12',78,87,'pupils2');c.addctl('Img13',78,87,'pupils3');c.stop()"
					}
				},
				"Obj1":{"type":"bubble", "name":"Bubble", "left":8, "top":3, "width":188, "height":68, "tailstyle":1, "tailheight":18, "tailwidth":8, "tailattach":60, "tailskew":-10, "fontname":"Arial", "fontheight":13, "fontspacing":-4, "fontcolor":"#000000", "bubblecolor":"#f7ffbf", "linecolor":"#323232", "linewidth":2, "autosize":2, "wpm":200, "minshow":3000},
				"Msg1":{"type":"message", "name":"Respond", "external":true, "url":"http://localhost/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=SteveHead&addons=RM2HeadClothesPack1&voice=Neo%20Paul&size=200,160&autoactionlevel=2&customtop=shirt1&customneck=tie1&customover=jacket1&customhair=stevecut&flashversion=11&actionscript=3&aiengine=programab&aimldatabase=super", "method":"get", "addvariables":"Text,AIMLUser,AIMLSession,AIMLTimezone", "character":"Char1"},
				"Msg2":{"type":"message", "name":"Speak", "external":true, "url":"http://localhost/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=SteveHead&addons=RM2HeadClothesPack1&voice=Neo%20Paul&size=200,160&autoactionlevel=2&customtop=shirt1&customneck=tie1&customover=jacket1&customhair=stevecut&flashversion=11&actionscript=3", "method":"get", "addvariables":"Text", "character":"Char1"},
				"Msg3":{
					"type":"message", "name":"Eyenormal", "character":"Char1", "frames":2,
					"onframe":{
						"0":"c.load('Img1','9089776735BA9AD6A20ED4B01A020993.png',250,105,105,1);c.load('Img2','212F1C70CDF5C17A5B7633E1FF4CF20D.png',219,200,200,1);",
						"1":"c.add('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);",
						"2":"c.stop()"
					}
				}
			}
		}
	}
};
msDocLoaded();
