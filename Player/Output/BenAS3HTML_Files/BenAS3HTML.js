window.BenAS3HTML_Dir = {
	"width":200, "height":250, "presenting":false, "fps":12, "modules":"bubble,rasterctl", "version":"5.4.7.0", "project":"BenAS3HTML", "allowautoplay":"detect", "variables":"c.Text=\"\";",
	"items":{
		"Scene1":{
			"type":"scene", "name":"Scene 1",
			"items":{
				"Obj1":{"type":"bubble", "name":"Bubble", "left":8, "top":3, "width":188, "height":68, "tailstyle":1, "tailheight":18, "tailwidth":8, "tailattach":60, "tailskew":-10, "fontname":"Arial", "fontheight":13, "fontspacing":-4, "fontcolor":"#000000", "bubblecolor":"#f7ffbf", "linecolor":"#323232", "linewidth":2, "autosize":2, "wpm":200, "minshow":3000},
				"Msg1":{"type":"message", "name":"Respond", "external":true, "url":"http://localhost/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=BenHead&addons=RM2HeadClothesPack1&voice=Neo%20James&size=200,160&autoactionlevel=2&customtop=shirt1&customneck=tie1&customover=jacket1&customovercolor=73,66,35&flashversion=11&actionscript=3&aiengine=programab&aimldatabase=super", "method":"get", "addvariables":"Text,AIMLUser,AIMLSession,AIMLTimezone", "character":"Char1"},
				"Msg2":{"type":"message", "name":"Speak", "external":true, "url":"http://localhost/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=BenHead&addons=RM2HeadClothesPack1&voice=Neo%20James&size=200,160&autoactionlevel=2&customtop=shirt1&customneck=tie1&customover=jacket1&customovercolor=73,66,35&flashversion=11&actionscript=3", "method":"get", "addvariables":"Text", "character":"Char1"},
				"Msg3":{"type":"message", "name":"Eyenormal", "character":"Char1", "frames":2, "datafile":"BenAS3HTMLMsg3.js"},
				"Char1":{"type":"character", "name":"Ben", "left":2, "top":63, "width":200, "height":160, "artwidth":250, "artheight":200, "mode":"replace"},
				"MsgChar1Idle":{
					"type":"message", "idle":true, "character":"Char1", "frames":16,
					"onframe":{
						"0":"c.load('Img1','37FF41CA52258076FBADBB4EC6D61010.png',250,105,105,1);c.load('Img2','EB55D458B14A040C4639F8A245C9DCEB.png',219,200,200,1);",
						"1":"c.add('Img1',0,95,1,15,0,219,200);c.add('Img2',15,0,1);",
						"6":"c.rec(16);",
						"9":"c.rec(16);",
						"11":"c.branch(1);",
						"14":"c.stop()",
						"16":"c.add('Img1',0,95,1,15,0,219,200);c.add('Img2',15,0,1);c.stop()"
					}
				}
			}
		}
	}
};
msDocLoaded();
