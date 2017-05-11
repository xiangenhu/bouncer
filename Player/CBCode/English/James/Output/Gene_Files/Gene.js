window.Gene_Dir = {
	"width":200, "height":250, "presenting":false, "fps":12, "modules":"rasterctl,bubble", "version":"5.4.7.0", "project":"Gene", "allowautoplay":"detect", "variables":"c.Text=\"0\";",
	"items":{
		"Scene1":{
			"type":"scene", "name":"Scene 1",
			"items":{
				"Char1":{"type":"character", "name":"Gene", "left":0, "top":67, "width":200, "height":160, "artwidth":250, "artheight":200, "mode":"replace"},
				"MsgChar1Idle":{
					"type":"message", "idle":true, "character":"Char1", "frames":16,
					"onframe":{
						"0":"c.load('Img1','F5DFFFD196DC0BDCC90B3886E6688D23.png',250,105,105,1);c.load('Img2','3BE898D180C4165847984E6EE624018B.png',219,200,200,1);",
						"1":"c.add('Img1',0,95,1,15,0,219,200);c.add('Img2',15,0,1);",
						"6":"c.rec(16);",
						"9":"c.rec(16);",
						"11":"c.branch(1);",
						"14":"c.stop()",
						"16":"c.add('Img1',0,95,1,15,0,219,200);c.add('Img2',15,0,1);c.stop()"
					}
				},
				"Obj1":{"type":"bubble", "name":"Bubble", "left":8, "top":3, "width":188, "height":68, "tailstyle":1, "tailheight":18, "tailwidth":8, "tailattach":60, "tailskew":-10, "fontname":"Arial", "fontheight":13, "fontspacing":-4, "fontcolor":"#000000", "bubblecolor":"#f7ffbf", "linecolor":"#323232", "linewidth":2, "autosize":2, "wpm":200, "minshow":3000},
				"Btn1":{
					"type":"grid", "name":"Mute Button", "left":146, "top":76, "width":37, "height":37, "hidden":false,
					"items":{
						"btn0":{"type":"button", "name":"", "left":0, "top":0, "width":26, "height":26, "backfile":"MuteBtn1Up.png", "xfore":0, "yfore":0, "xdown":0, "ydown":0, "hideondisabled":true, "onclick":"c.mute()", "behavior":"mute"},
						"btn1":{"type":"button", "name":"", "left":0, "top":0, "width":26, "height":26, "backfile":"MuteBtn1Dn.png", "xfore":0, "yfore":0, "xdown":0, "ydown":0, "hideondisabled":true, "onclick":"c.unmute()", "behavior":"unmute"}
					}
				},
				"Obj2":{
					"type":"grid", "name":"Panel 1", "left":-2, "top":226, "width":248, "height":23, "hidden":true, "onshow":"c.setFocus('Obj2Edit1');",
					"items":{
						"Obj2Image1":{"type":"image", "name":"(null)", "file":"EditBoxA.png", "left":0, "top":0, "width":5, "height":25, "widthOriginal":5, "heightOriginal":25},
						"Obj2Image2":{"type":"image", "name":"(null)", "file":"EditBoxB.png", "left":5, "top":0, "width":205, "height":25, "tile":true, "widthOriginal":5, "heightOriginal":25},
						"Obj2Image3":{"type":"image", "name":"(null)", "file":"EditBoxC.png", "left":210, "top":0, "width":5, "height":25, "widthOriginal":5, "heightOriginal":25},
						"Obj2Edit1":{"type":"editcontrol", "name":"", "left":3, "top":2, "width":209, "height":19, "border":false, "fontheight":12},
						"Obj2Btn1":{"type":"button", "name":"", "left":215, "top":0, "width":33, "height":25, "backfile":"Enter.png", "backoverfile":"EnterOver.png", "backdownfile":"EnterDown.png", "xfore":0, "yfore":0, "xdown":0, "ydown":0, "key":"enter", "onclick":"c.Text=c.getText('Obj2Edit1'); c.setText('Obj2Edit1',''); c.vc(); c.gotoAndRestart('Msg1');"}
					}
				},
				"Msg1":{"type":"message", "name":"Respond", "external":true, "url":"http://localhost/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=GeneHead&addons=RM2HeadClothesPack1,RM2HeadClothesPack2,RM2HeadHairPack1,RM2HeadHairPack2,RM2HeadHairPack3,RM2HeadIndustryPack,RM2HeadPolicePack,RM2HeadPropPack1,RM2HeadSoldierPack&voice=Neo%20James&size=200,160&autoactionlevel=2&customtop=shirt1&customneck=tie2&customhair=crewblonde&flashversion=8&actionscript=3&aiengine=programd&aimldatabase=SampleBot", "method":"get", "addvariables":"Text,AIMLUser,AIMLSession,AIMLTimezone", "character":"Char1"},
				"Msg2":{"type":"message", "name":"Speak", "external":true, "url":"http://localhost/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=GeneHead&addons=RM2HeadClothesPack1,RM2HeadClothesPack2,RM2HeadHairPack1,RM2HeadHairPack2,RM2HeadHairPack3,RM2HeadIndustryPack,RM2HeadPolicePack,RM2HeadPropPack1,RM2HeadSoldierPack&voice=Neo%20James&size=200,160&autoactionlevel=2&customtop=shirt1&customneck=tie2&customhair=crewblonde&flashversion=8&actionscript=3", "method":"get", "addvariables":"Text", "character":"Char1"},
				"Msg3":{"type":"message", "name":"Eyenormal", "character":"Char1", "frames":2, "datafile":"GeneMsg3.js"}
			}
		}
	}
};
msDocLoaded();
