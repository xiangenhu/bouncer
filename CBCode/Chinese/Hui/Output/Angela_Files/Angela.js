window.Angela_Dir = {
	"width":200, "height":250, "presenting":false, "fps":12, "blankfile":"blank.mp3", "modules":"rasterctl,bubble", "version":"5.4.5.0", "project":"Angela", "allowautoplay":"detect", "variables":"c.Text=\"0\";",
	"items":{
		"Scene1":{
			"type":"scene", "name":"Scene 1",
			"items":{
				"Char1":{"type":"character", "name":"Angela", "left":0, "top":67, "width":200, "height":160, "artwidth":250, "artheight":200, "mode":"replace"},
				"MsgChar1Idle":{
					"type":"message", "idle":true, "character":"Char1", "frames":16,
					"onframe":{
						"0":"c.load('Img1','AC3DFB2D17D34177936AD5BFCA7A395E.png',237,106,106,1);c.load('Img2','A3CC0B54308ABF26E6940C91AF330370.png',190,200,200,1);",
						"1":"c.add('Img1',6,94,1,31,0,190,200);c.add('Img2',31,0,1);",
						"6":"c.rec(16);",
						"9":"c.rec(16);",
						"11":"c.branch(1);",
						"14":"c.stop()",
						"16":"c.add('Img1',6,94,1,31,0,190,200);c.add('Img2',31,0,1);c.stop()"
					}
				},
				"Obj1":{"type":"bubble", "name":"Bubble", "left":8, "top":3, "width":188, "height":68, "tailstyle":1, "tailheight":18, "tailwidth":8, "tailattach":60, "tailskew":-10, "fontname":"Arial", "fontheight":13, "fontspacing":-4, "fontcolor":"#000000", "bubblecolor":"#f7ffbf", "linecolor":"#323232", "linewidth":2, "autosize":2, "wpm":200, "minshow":3000},
				"Btn1":{
					"type":"grid", "name":"Mute Button", "left":146, "top":76, "width":37, "height":37, "hidden":false,
					"items":{
						"btn0":{"type":"button", "name":"(null)", "left":0, "top":0, "width":26, "height":26, "backfile":"MuteBtn1Up.png", "xfore":0, "yfore":0, "xdown":0, "ydown":0, "hideondisabled":true, "onclick":"c.mute()", "behavior":"mute"},
						"btn1":{"type":"button", "name":"(null)", "left":0, "top":0, "width":26, "height":26, "backfile":"MuteBtn1Dn.png", "xfore":0, "yfore":0, "xdown":0, "ydown":0, "hideondisabled":true, "onclick":"c.unmute()", "behavior":"unmute"}
					}
				},
				"Msg1":{"type":"message", "name":"Respond", "external":true, "url":"http://www.auto-tutor.com/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=AngelaHead&addons=&voice=Neo%20Hui&size=200,160&autoactionlevel=2&customtop=classictop&customhair=combeddark&flashversion=8&actionscript=3&aiengine=programd&aimldatabase=SampleBot", "method":"get", "addvariables":"Text,AIMLUser,AIMLSession,AIMLTimezone", "character":"Char1"},
				"Msg2":{"type":"message", "name":"Speak", "external":true, "url":"http://www.auto-tutor.com/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=AngelaHead&addons=&voice=Neo%20Hui&size=200,160&autoactionlevel=2&customtop=classictop&customhair=combeddark&flashversion=8&actionscript=3", "method":"get", "addvariables":"Text", "character":"Char1"},
				"Msg3":{"type":"message", "name":"Eyenormal", "character":"Char1", "frames":2, "datafile":"AngelaMsg3.js"}
			}
		}
	}
};
msDocLoaded();
