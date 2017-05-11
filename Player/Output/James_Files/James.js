window.James_Dir = {
	"width":250, "height":200, "presenting":false, "fps":12, "version":"5.4.7.0", "project":"James", "allowautoplay":"detect", "variables":"c.Text=\"\";",
	"items":{
		"Scene1":{
			"type":"scene", "name":"Scene 1",
			"items":{
				"Char1":{"type":"character", "name":"James", "left":0, "top":0, "width":250, "height":200, "artwidth":250, "artheight":200, "mode":"replace"},
				"MsgChar1Idle":{
					"type":"message", "idle":true, "character":"Char1", "frames":6,
					"onframe":{
						"0":"c.load('Img1','78A5A89BC5F455FE0CA4DAB811E01C3A.png',232,62,62,1);c.load('Img2','D01EDC2E37515A2EA65436D721E38E3F.png',119,157,157,1);",
						"1":"c.add('Img1',10,138,1,67,8,119,157);c.add('Img2',67,8,1);",
						"3":"c.branch(1);",
						"6":"c.stop()"
					}
				},
				"Msg1":{"type":"message", "name":"Speak", "external":true, "url":"http://localhost/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=James&addons=&voice=Loquendo%20Dave&size=250,200&autoactionlevel=2&flashversion=11&actionscript=3", "method":"get", "addvariables":"Text", "character":"Char1"}
			}
		}
	}
};
msDocLoaded();
