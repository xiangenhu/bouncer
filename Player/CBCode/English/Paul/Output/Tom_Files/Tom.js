window.Tom_Dir = {
	"width":200, "height":250, "presenting":false, "fps":12, "modules":"bubble", "version":"5.4.7.0", "project":"Tom", "allowautoplay":"detect", "variables":"c.Text=\"0\";",
	"items":{
		"Scene1":{
			"type":"scene", "name":"Scene 1",
			"items":{
				"Char1":{"type":"character", "name":"Tom", "left":0, "top":67, "width":200, "height":160, "artwidth":500, "artheight":400, "mode":"infront"},
				"MsgChar1Idle":{
					"type":"message", "idle":true, "character":"Char1", "frames":45,
					"onframe":{
						"0":"c.load('Img1','34F07A08BE72A1CA164597EA0E24DA41.js',6120,7920,7920,1);c.load('Img10','033B1676217293994A18F3C1FC6F2303.js',6120,7920,7920,1);c.load('Img2','6A4F89BDA892E07C72C551A4F7C551E3.js',6120,7920,7920,1);c.load('Img3','42BC5DF2A14651F18544E573B4C1F273.js',6120,7920,7920,1);c.load('Img4','AEAE87493CF47B50070EA37188164C46.js',6120,7920,7920,1);c.load('Img5','5E9AC349D0A461FBBFB6AED4FAF77CA6.js',6120,7920,7920,1);c.load('Img6','7EB122A2037D41976F5D3171D3F1568E.js',6120,7920,7920,1);c.load('Img7','A79AE1B82009CC8CB640D1A6EC332F2D.js',6120,7920,7920,1);c.load('Img8','0DA5752E46CD76881E8F76E4A6310F81.js',6120,7920,7920,1);c.load('Img9','DFF2798447B91FC7E2FF6EA02F0FCAF1.js',6120,7920,7920,1);",
						"1":"c.add('Img1',0,0,1);c.add('Img2',0,1000,1);c.add('Img3',0,1000,1);c.add('Img4',0,1000,1);c.add('Img5',0,0,1);c.add('Img6',0,0,1);c.add('Img7',770,1010,1);c.add('Img8',630,580,1);c.add('Img9',630,580,1);c.add('Img10',630,580,1);c.add('Img1',0,0,1);",
						"2":"c.rem('Img1');c.add('Img1',0,0,1);",
						"3":"c.rem('Img1');c.add('Img1',0,0,1);",
						"4":"c.rem('Img1');c.add('Img1',0,0,1);",
						"5":"c.rem('Img1');c.add('Img1',0,0,1);",
						"6":"c.rem('Img1');c.add('Img1',0,0,1);c.rec(45);",
						"7":"c.rem('Img1');c.add('Img1',0,0,1);",
						"8":"c.rem('Img1');c.add('Img1',0,0,1);",
						"9":"c.rem('Img1');c.add('Img1',0,0,1);c.rec(45);",
						"10":"c.rem('Img1');c.add('Img1',0,0,1);",
						"11":"c.rem('Img1');c.add('Img1',0,0,1);",
						"12":"c.rem('Img1');c.add('Img1',0,0,1);",
						"13":"c.rem('Img1');c.add('Img1',0,0,1);c.rec(45);",
						"14":"c.rem('Img1');c.add('Img1',0,0,1);",
						"15":"c.rem('Img1');c.add('Img1',0,0,1);",
						"16":"c.rem('Img1');c.add('Img1',0,0,1);c.rec(45);",
						"17":"c.rem('Img1');c.add('Img1',0,0,1);",
						"18":"c.rem('Img1');c.add('Img1',0,0,1);",
						"19":"c.rem('Img1');c.add('Img1',0,0,1);c.rec(45);",
						"20":"c.rem('Img1');c.add('Img1',0,0,1);c.push(100);c.random();c.push(50);c.lessthan();c.ifnot(30);",
						"21":"c.rem('Img1');c.add('Img1',0,0,1);",
						"22":"c.rem('Img1');c.add('Img1',0,0,1);c.rec(45);",
						"23":"c.rem('Img1');c.add('Img1',0,0,1);",
						"24":"c.rem('Img1');c.add('Img1',0,0,1);",
						"25":"c.rem('Img1');c.add('Img1',0,0,1);c.rec(45);",
						"26":"c.rem('Img1');c.add('Img1',0,0,1);",
						"27":"c.rem('Img1');c.add('Img1',0,0,1);",
						"28":"c.rem('Img1');c.add('Img1',0,0,1);c.rec(45);",
						"29":"c.rem('Img1');c.add('Img1',0,0,1);",
						"30":"c.rem('Img1');c.add('Img1',0,0,1);c.push(100);c.random();c.push(50);c.lessthan();c.ifnot(40);",
						"31":"c.rem('Img1');c.add('Img1',0,0,1);",
						"32":"c.rem('Img1');c.add('Img1',0,0,1);c.rec(45);",
						"33":"c.rem('Img1');c.add('Img1',0,0,1);",
						"34":"c.rem('Img1');c.add('Img1',0,0,1);",
						"35":"c.rem('Img1');c.add('Img1',0,0,1);c.rec(45);",
						"36":"c.rem('Img1');c.add('Img1',0,0,1);",
						"37":"c.rem('Img1');c.add('Img1',0,0,1);",
						"38":"c.rem('Img1');c.add('Img1',0,0,1);c.rec(45);",
						"39":"c.rem('Img1');c.add('Img1',0,0,1);",
						"40":"c.rem('Img1');c.add('Img1',0,0,1);c.branch(1);",
						"41":"c.rem('Img1');c.add('Img1',0,0,1);",
						"42":"c.rem('Img1');c.add('Img1',0,0,1);",
						"43":"c.rem('Img1');c.add('Img1',0,0,1);c.stop()",
						"44":"c.rem('Img1');c.add('Img1',0,0,1);",
						"45":"c.add('Img1',0,0,1);c.add('Img2',0,1000,1);c.add('Img3',0,1000,1);c.add('Img4',0,1000,1);c.add('Img5',0,0,1);c.add('Img6',0,0,1);c.add('Img7',770,1010,1);c.add('Img8',630,580,1);c.add('Img9',630,580,1);c.add('Img10',630,580,1);c.add('Img1',0,0,1);c.stop()"
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
				"Msg1":{"type":"message", "name":"Respond", "external":true, "url":"http://www.x-in-y.com/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=TomHead&addons=IM1HeadHairPack1,IM1HeadClothesPack1,IM1HeadHairPack1,IM1HeadIndustryPack,IM1HeadPropPack1&voice=Neo%20Paul&size=200,160&autoactionlevel=2&customhair=tomhair&customtop=shirt1&customneck=tie1&flashversion=8&actionscript=3&aiengine=programd&aimldatabase=SampleBot", "method":"get", "addvariables":"Text,AIMLUser,AIMLSession,AIMLTimezone", "character":"Char1"},
				"Msg2":{"type":"message", "name":"Speak", "external":true, "url":"http://www.x-in-y.com/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=TomHead&addons=IM1HeadHairPack1,IM1HeadClothesPack1,IM1HeadHairPack1,IM1HeadIndustryPack,IM1HeadPropPack1&voice=Neo%20Paul&size=200,160&autoactionlevel=2&customhair=tomhair&customtop=shirt1&customneck=tie1&flashversion=8&actionscript=3", "method":"get", "addvariables":"Text", "character":"Char1"},
				"Msg3":{"type":"message", "name":"Eyenormal", "character":"Char1", "frames":2, "datafile":"TomMsg3.js"}
			}
		}
	}
};
msDocLoaded();
