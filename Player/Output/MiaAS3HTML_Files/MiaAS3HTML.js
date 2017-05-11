window.MiaAS3HTML_Dir = {
	"width":200, "height":250, "presenting":false, "fps":12, "modules":"bubble", "version":"5.4.7.0", "project":"MiaAS3HTML", "allowautoplay":"detect", "variables":"c.Text=\"\";",
	"items":{
		"Scene1":{
			"type":"scene", "name":"Scene 1",
			"items":{
				"Obj1":{"type":"bubble", "name":"Bubble", "left":8, "top":3, "width":188, "height":68, "tailstyle":1, "tailheight":18, "tailwidth":8, "tailattach":60, "tailskew":-10, "fontname":"Arial", "fontheight":13, "fontspacing":-4, "fontcolor":"#000000", "bubblecolor":"#f7ffbf", "linecolor":"#323232", "linewidth":2, "autosize":2, "wpm":200, "minshow":3000},
				"Msg1":{"type":"message", "name":"Respond", "external":true, "url":"http://localhost/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=MiaHead&addons=&voice=Neo%20Julie&size=200,160&autoactionlevel=2&flashversion=11&actionscript=3&aiengine=programab&aimldatabase=super", "method":"get", "addvariables":"Text,AIMLUser,AIMLSession,AIMLTimezone", "character":"Char1"},
				"Msg2":{"type":"message", "name":"Speak", "external":true, "url":"http://localhost/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=MiaHead&addons=&voice=Neo%20Julie&size=200,160&autoactionlevel=2&flashversion=11&actionscript=3", "method":"get", "addvariables":"Text", "character":"Char1"},
				"Msg3":{"type":"message", "name":"Eyenormal", "character":"Char1", "frames":2, "datafile":"MiaAS3HTMLMsg3.js"},
				"Char1":{"type":"character", "name":"Mia", "left":2, "top":63, "width":200, "height":160, "artwidth":250, "artheight":200, "mode":"replace"},
				"MsgChar1Idle":{
					"type":"message", "idle":true, "character":"Char1", "frames":6,
					"onframe":{
						"0":"c.load('Img1','7EA835D96A15EC3EAC952042E6F9915F.png',206,45,45,1);c.load('Img2','FBFCF7F5CACC217E72B8D9C1CB4FD7EE.png',138,151,151,1);",
						"1":"c.add('Img1',22,155,1,57,17,138,151);c.add('Img2',57,17,1);",
						"3":"c.branch(1);",
						"6":"c.stop()"
					}
				}
			}
		}
	}
};
msDocLoaded();
