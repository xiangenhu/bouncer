window.Megan_Dir = {
	"width":200, "height":250, "presenting":false, "fps":12, "modules":"bubble", "version":"5.4.7.0", "project":"Megan", "allowautoplay":"detect", "variables":"c.Text=\"0\";",
	"items":{
		"Scene1":{
			"type":"scene", "name":"Scene 1",
			"items":{
				"Char1":{"type":"character", "name":"Megan", "left":0, "top":67, "width":200, "height":160, "artwidth":500, "artheight":400, "mode":"infront"},
				"MsgChar1Idle":{
					"type":"message", "idle":true, "character":"Char1", "frames":45,
					"onframe":{
						"0":"c.load('Img1','03C6A651E9F2F40EA8E0D8380F5DECA8.js',6120,7920,7920,1);c.load('Img10','34F07A08BE72A1CA164597EA0E24DA41.js',6120,7920,7920,1);c.load('Img2','F041A239AC1B10C75C73C378E917C08A.js',6120,7920,7920,1);c.load('Img3','CE56277CFB3ECC1850490AD3814FB646.js',6120,7920,7920,1);c.load('Img4','64CFF7FB92DFABF387309391234F0869.js',6120,7920,7920,1);c.load('Img5','61615168357C3A26452758C969271604.js',6120,7920,7920,1);c.load('Img6','9DA97152DB8EAE7FE7B28B3A00B7D910.js',6120,7920,7920,1);c.load('Img7','6DCCC6A2F666AEB5850A1E39366BE222.js',6120,7920,7920,1);c.load('Img8','F05ED01577281473BAECC0A7CEB2A21D.js',6120,7920,7920,1);c.load('Img9','2CD026630DCD245627C349A3663EFFB0.js',6120,7920,7920,1);",
						"1":"c.add('Img1',0,0,1);c.add('Img2',0,1000,1);c.add('Img3',0,1000,1);c.add('Img4',0,0,1);c.add('Img5',0,0,1);c.add('Img6',770,1010,1);c.add('Img7',630,580,1);c.add('Img8',630,580,1);c.add('Img9',630,580,1);c.add('Img10',0,0,1);",
						"6":"c.rec(45);",
						"9":"c.rec(45);",
						"13":"c.rec(45);",
						"16":"c.rec(45);",
						"19":"c.rec(45);",
						"20":"c.push(100);c.random();c.push(50);c.lessthan();c.ifnot(30);",
						"22":"c.rec(45);",
						"25":"c.rec(45);",
						"28":"c.rec(45);",
						"30":"c.push(100);c.random();c.push(50);c.lessthan();c.ifnot(40);",
						"32":"c.rec(45);",
						"35":"c.rec(45);",
						"38":"c.rec(45);",
						"40":"c.branch(1);",
						"43":"c.stop()",
						"45":"c.add('Img1',0,0,1);c.add('Img2',0,1000,1);c.add('Img3',0,1000,1);c.add('Img4',0,0,1);c.add('Img5',0,0,1);c.add('Img6',770,1010,1);c.add('Img7',630,580,1);c.add('Img8',630,580,1);c.add('Img9',630,580,1);c.add('Img10',0,0,1);c.stop()"
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
				"Msg1":{"type":"message", "name":"Respond", "external":true, "url":"https://www.x-in-y.com/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=MeganHead&addons=IW1HeadClothesPack1,IW1HeadHairPack1,IW1HeadPropPack1&voice=Loquendo%20Allison&size=200,160&autoactionlevel=2&customhair=meganhair&customtop=shirt2&flashversion=8&actionscript=3&aiengine=programd&aimldatabase=SampleBot", "method":"get", "addvariables":"Text,AIMLUser,AIMLSession,AIMLTimezone", "character":"Char1"},
				"Msg2":{"type":"message", "name":"Speak", "external":true, "url":"https://www.x-in-y.com/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=MeganHead&addons=IW1HeadClothesPack1,IW1HeadHairPack1,IW1HeadPropPack1&voice=Loquendo%20Allison&size=200,160&autoactionlevel=2&customhair=meganhair&customtop=shirt2&flashversion=8&actionscript=3", "method":"get", "addvariables":"Text", "character":"Char1"},
				"Msg3":{"type":"message", "name":"Eyenormal", "character":"Char1", "frames":2, "datafile":"MeganMsg3.js"}
			}
		}
	}
};
msDocLoaded();
