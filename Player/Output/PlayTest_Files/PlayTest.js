window.PlayTest_Dir = {
	"width":200, "height":250, "presenting":false, "fps":12, "blankfile":"blank.mp3", "version":"5.4.3.0", "allowautoplay":"detect",
	"items":{
		"Scene1":{
			"type":"scene", "name":"Scene 1",
			"items":{
				"Char1":{"type":"character", "name":"Ben", "left":0, "top":67, "width":200, "height":160, "artwidth":250, "artheight":200, "mode":"replace"},
				"MsgChar1Idle":{
					"type":"message", "idle":true, "character":"Char1", "frames":69,
					"onframe":{
						"0":"c.load('Img1','37FF41CA52258076FBADBB4EC6D61010.png',250,105,105,1);c.load('Img2','EB55D458B14A040C4639F8A245C9DCEB.png',219,200,200,1);c.load('Img3','289CE1A72981A0372E2C4378D2AE2638.png',76,62,31,3);",
						"1":"c.add('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);",
						"3":"c.rem('Img2');c.update('Img1',0,95,1,0,0,0,15,0,219,200,88,72,76,31);c.add('Img2',15,0,1,0,0,0,88,72,76,31);c.add('Img3',88,72,1,0,0,0);",
						"4":"c.update('Img3',2);",
						"5":"c.update('Img3',1);",
						"6":"c.rem('Img2');c.rem('Img3');c.update('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);",
						"8":"c.rec(69);",
						"11":"c.rec(69);",
						"14":"c.rec(69);",
						"17":"c.rec(69);",
						"20":"c.rec(69);",
						"23":"c.rec(69);",
						"26":"c.rec(69);",
						"29":"c.rec(69);",
						"32":"c.rec(69);",
						"35":"c.rec(69);",
						"38":"c.rec(69);",
						"41":"c.rec(69);",
						"44":"c.rec(69);",
						"47":"c.rec(69);",
						"50":"c.rec(69);",
						"53":"c.rec(69);",
						"56":"c.rec(69);",
						"59":"c.rec(69);",
						"62":"c.rec(69);",
						"65":"c.rec(69);",
						"67":"c.stop()",
						"69":"c.add('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);c.stop()"
					}
				},
				"Obj1":{"type":"bubble", "name":"Bubble", "left":8, "top":3, "width":188, "height":68, "tailstyle":1, "tailheight":18, "tailwidth":8, "tailattach":60, "tailskew":-10, "fontname":"Arial", "fontheight":13, "fontspacing":-4, "fontcolor":"#000000", "bubblecolor":"#f7ffbf", "linecolor":"#323232", "linewidth":2, "autosize":2, "wpm":200, "minshow":3000},
				"Msg1":{"type":"message", "name":"Respond", "external":true, "url":"http://localhost/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=BenHead&addons=RM2HeadClothesPack1,RM2HeadClothesPack2,RM2HeadHairPack1,RM2HeadHairPack2,RM2HeadHairPack3,RM2HeadIndustryPack,RM2HeadPolicePack,RM2HeadPropPack1,RM2HeadSoldierPack&voice=Neo%20Paul&size=200,160&autoactionlevel=2&customtop=shirt1&customneck=tie1&customover=jacket1&customovercolor=73,66,35&flashversion=11&actionscript=3&aiengine=programab&aimldatabase=super", "method":"get", "addvariables":"Text,AIMLUser,AIMLSession,AIMLTimezone", "character":"Char1"},
				"Msg2":{"type":"message", "name":"Speak", "external":true, "url":"http://localhost/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=BenHead&addons=RM2HeadClothesPack1,RM2HeadClothesPack2,RM2HeadHairPack1,RM2HeadHairPack2,RM2HeadHairPack3,RM2HeadIndustryPack,RM2HeadPolicePack,RM2HeadPropPack1,RM2HeadSoldierPack&voice=Neo%20Paul&size=200,160&autoactionlevel=2&customtop=shirt1&customneck=tie1&customover=jacket1&customovercolor=73,66,35&flashversion=11&actionscript=3", "method":"get", "addvariables":"Text", "character":"Char1"},
				"Msg3":{
					"type":"message", "name":"Eyenormal", "character":"Char1", "frames":2,
					"onframe":{
						"0":"c.load('Img1','37FF41CA52258076FBADBB4EC6D61010.png',250,105,105,1);c.load('Img2','EB55D458B14A040C4639F8A245C9DCEB.png',219,200,200,1);",
						"1":"c.add('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);",
						"2":"c.stop()"
					}
				},
				"A1":{
					"type":"message", "name":"A1", "character":"Char1", "frames":18, "file":"PlayTestA1.mp3", "altfile":"PlayTestA1.ogv",
					"onframe":{
						"0":"c.load('Img1','37FF41CA52258076FBADBB4EC6D61010.png',250,105,105,1);c.load('Img2','EB55D458B14A040C4639F8A245C9DCEB.png',219,200,200,1);c.load('Img3','24747CC3EE69E3400DE9EC22D813278C.png',77,936,52,2);",
						"1":"c.add('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);c.bubble('Char1','Awesome job');",
						"2":"c.rem('Img2');c.update('Img1',0,95,1,0,0,0,15,0,219,200,87,117,77,52);c.add('Img2',15,0,1,0,0,0,87,117,77,52);c.add('Img3',87,117,8,0,0,0);",
						"3":"c.update('Img3',14);",
						"4":"c.update('Img3',5);c.rec(18);",
						"5":"c.update('Img3',8);",
						"6":"c.update('Img3',11);",
						"7":"c.update('Img3',10);c.rec(18);",
						"8":"c.update('Img3',9);",
						"9":"c.rem('Img2');c.rem('Img3');c.update('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);",
						"10":"c.rec(18);",
						"13":"c.rec(18);",
						"16":"c.stop()",
						"18":"c.add('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);c.stop()"
					}
				},
				"A2":{
					"type":"message", "name":"A2", "character":"Char1", "frames":22, "file":"PlayTestA2.mp3", "altfile":"PlayTestA2.ogv",
					"onframe":{
						"0":"c.load('Img1','37FF41CA52258076FBADBB4EC6D61010.png',250,105,105,1);c.load('Img2','EB55D458B14A040C4639F8A245C9DCEB.png',219,200,200,1);c.load('Img3','24747CC3EE69E3400DE9EC22D813278C.png',77,936,52,2);",
						"1":"c.add('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);c.bubble('Char1','! You answered correctly!');",
						"2":"c.rem('Img2');c.update('Img1',0,95,1,0,0,0,15,0,219,200,87,117,77,52);c.add('Img2',15,0,1,0,0,0,87,117,77,52);c.add('Img3',87,117,6,0,0,0);",
						"3":"c.update('Img3',8);",
						"4":"c.rec(22);",
						"5":"c.update('Img3',14);",
						"6":"c.update('Img3',8);",
						"7":"c.rec(22);",
						"9":"c.update('Img3',5);",
						"10":"c.update('Img3',8);c.rec(22);",
						"11":"c.update('Img3',3);",
						"12":"c.update('Img3',2);",
						"13":"c.rem('Img2');c.rem('Img3');c.update('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);c.rec(22);",
						"20":"c.stop()",
						"22":"c.add('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);c.stop()"
					}
				}
			}
		}
	}
};
msDocLoaded();
