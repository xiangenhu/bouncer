window.Tasha_Dir = {
	"width":200, "height":250, "presenting":false, "fps":12, "blankfile":"blank.mp3", "modules":"bubble", "version":"5.4.5.0", "project":"Tasha", "allowautoplay":"detect", "variables":"c.Text=\"0\";",
	"items":{
		"Scene1":{
			"type":"scene", "name":"Scene 1",
			"items":{
				"Char1":{"type":"character", "name":"Tasha", "left":0, "top":67, "width":200, "height":160, "artwidth":500, "artheight":400, "mode":"infront"},
				"MsgChar1Idle":{
					"type":"message", "idle":true, "character":"Char1", "frames":45,
					"onframe":{
						"0":"c.load('Img1','493641B43CE3E8B541A9EF0C728A676A.js',6120,7920,7920,1);c.load('Img10','34F07A08BE72A1CA164597EA0E24DA41.js',6120,7920,7920,1);c.load('Img2','359A28F45A8FEF3E9A18D91C482B3178.js',6120,7920,7920,1);c.load('Img3','69BBB31DA6107321720545826AB76912.js',6120,7920,7920,1);c.load('Img4','9866D4162FA81B65F057FDA31CDC4450.js',6120,7920,7920,1);c.load('Img5','515A9FD0423515CB42D2403C8EEC3116.js',6120,7920,7920,1);c.load('Img6','79C57DA8C3D27145B9549F44BEB8BE37.js',6120,7920,7920,1);c.load('Img7','93F5917C744DD533B2F06DC06745CF61.js',6120,7920,7920,1);c.load('Img8','240762950495693E9B7997E9AC082F00.js',6120,7920,7920,1);c.load('Img9','721BF012C5945BBF1BA5BCD65AC18B82.js',6120,7920,7920,1);",
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
						"btn0":{"type":"button", "name":"(null)", "left":0, "top":0, "width":26, "height":26, "backfile":"MuteBtn1Up.png", "xfore":0, "yfore":0, "xdown":0, "ydown":0, "hideondisabled":true, "onclick":"c.mute()", "behavior":"mute"},
						"btn1":{"type":"button", "name":"(null)", "left":0, "top":0, "width":26, "height":26, "backfile":"MuteBtn1Dn.png", "xfore":0, "yfore":0, "xdown":0, "ydown":0, "hideondisabled":true, "onclick":"c.unmute()", "behavior":"unmute"}
					}
				},
				"Msg1":{"type":"message", "name":"Respond", "external":true, "url":"http://www.auto-tutor.com/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=TashaHead&addons=IW1HeadClothesPack1,IW1HeadHairPack1,IW1HeadPropPack1&voice=Neo%20Julie&size=200,160&autoactionlevel=2&customhair=tashahair&customtop=shirt1&flashversion=8&actionscript=3&aiengine=programd&aimldatabase=SampleBot", "method":"get", "addvariables":"Text,AIMLUser,AIMLSession,AIMLTimezone", "character":"Char1"},
				"Msg2":{"type":"message", "name":"Speak", "external":true, "url":"http://www.auto-tutor.com/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=TashaHead&addons=IW1HeadClothesPack1,IW1HeadHairPack1,IW1HeadPropPack1&voice=Neo%20Julie&size=200,160&autoactionlevel=2&customhair=tashahair&customtop=shirt1&flashversion=8&actionscript=3", "method":"get", "addvariables":"Text", "character":"Char1"},
				"Msg3":{"type":"message", "name":"Eyenormal", "character":"Char1", "frames":2, "datafile":"TashaMsg3.js"}
			}
		}
	}
};
msDocLoaded();