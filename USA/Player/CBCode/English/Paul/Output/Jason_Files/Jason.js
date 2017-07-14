window.Jason_Dir = {
	"width":200, "height":250, "presenting":false, "fps":12, "blankfile":"blank.mp3", "modules":"bubble", "version":"5.4.5.0", "project":"Jason", "allowautoplay":"detect", "variables":"c.Text=\"0\";",
	"items":{
		"Scene1":{
			"type":"scene", "name":"Scene 1",
			"items":{
				"Char1":{"type":"character", "name":"Jason", "left":0, "top":67, "width":200, "height":160, "artwidth":250, "artheight":200, "mode":"replace"},
				"MsgChar1Idle":{
					"type":"message", "idle":true, "character":"Char1", "frames":6,
					"onframe":{
						"0":"c.load('Img1','9202B5E657DF8EEF7F8EB243E7EEEEEF.png',232,62,62,1);c.load('Img2','2D60E267648318F02ECAAF4A215E55D0.png',119,157,157,1);",
						"1":"c.add('Img1',10,138,1,67,11,119,157);c.add('Img2',67,11,1);",
						"3":"c.branch(1);",
						"6":"c.stop()"
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
				"Msg1":{"type":"message", "name":"Respond", "external":true, "url":"http://www.x-in-y.com/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=Jason&addons=&voice=Neo%20Paul&size=200,160&autoactionlevel=2&flashversion=8&actionscript=3&aiengine=programd&aimldatabase=SampleBot", "method":"get", "addvariables":"Text,AIMLUser,AIMLSession,AIMLTimezone", "character":"Char1"},
				"Msg2":{"type":"message", "name":"Speak", "external":true, "url":"http://www.x-in-y.com/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=Jason&addons=&voice=Neo%20Paul&size=200,160&autoactionlevel=2&flashversion=8&actionscript=3", "method":"get", "addvariables":"Text", "character":"Char1"},
				"Msg3":{"type":"message", "name":"Eyenormal", "character":"Char1", "frames":2, "datafile":"JasonMsg3.js"}
			}
		}
	}
};
msDocLoaded();
