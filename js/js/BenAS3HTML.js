window.BenAS3HTML_Dir = {
	"width":200, "height":250, "presenting":false, "fps":12, "blankfile":"blank.mp3", "version":"5.4.2.0", "allowautoplay":"detect",
	"items":{
		"Scene1":{
			"type":"scene", "name":"Scene 1",
			"items":{
				"Char1":{"type":"character", "name":"Ben", "left":0, "top":67, "width":200, "height":160, "artwidth":250, "artheight":200, "mode":"replace"},
				"MsgChar1Idle":{
					"type":"message", "idle":true, "character":"Char1", "frames":18,
					"onframe":{
						"0":"c.load('Img1','C8DF043A90F6C2D1E40FFE28C302A91E.png',250,105,105,1);c.load('Img10','74B5AC9E451C7E5E4CAB3A8068A0C18D.png',95,238,14,1);c.load('Img11','FDA85503B6C1346F069CE8D3C92704ED.png',95,476,14,1);c.load('Img12','2813045633EAE36BB66B9D0CBB17093D.png',95,476,14,1);c.load('Img13','5C4C5B7C1C6ECF8B51CD9C36F1602360.png',95,476,14,1);c.load('Img2','119CF719ADD425AB2AEA63AA6F49D9FE.png',219,200,200,1);c.load('Img3','5ABF516A611D74B46070CFE211194D5C.png',219,4400,200,1);c.load('Img4','68702C45D8E107924386F195E760C285.png',219,1600,200,1);c.load('Img5','FA3E7343C5B7D2C3CA199884D79E9C8F.png',219,1600,200,1);c.load('Img6','289CE1A72981A0372E2C4378D2AE2638.png',76,62,31,1);c.load('Img7','75F25239E70488E8F37143B60C80B609.png',76,62,31,1);c.load('Img8','7DC6B2A214DBF757FCDD6A12DC14B379.png',76,62,31,1);c.load('Img9','C67BB95B9C9CB6A970D59F7903E012BC.png',76,62,31,1);",
						"1":"c.add('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);c.addctl('Img3',15,0,'randomright');c.addctl('Img4',15,0,'headright');c.addctl('Img5',15,0,'headleft');c.addctl('Img6',88,72,'blink');c.addctl('Img7',88,72,'random1blink');c.addctl('Img8',88,72,'random2blink');c.addctl('Img9',88,72,'random4blink');c.addctl('Img10',78,87,'pupils0');c.addctl('Img11',78,87,'pupils1');c.addctl('Img12',78,87,'pupils2');c.addctl('Img13',78,87,'pupils3');",
						"2":"c.ctlaction('eyetracker');",
						"3":"",
						"4":"",
						"5":"",
						"6":"",
						"7":"",
						"8":"c.rec(18);",
						"9":"",
						"10":"",
						"11":"c.rec(18);",
						"12":"",
						"13":"c.branch(3);",
						"14":"",
						"15":"",
						"16":"c.stop()",
						"17":"",
						"18":"c.add('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);c.addctl('Img3',15,0,'randomright');c.addctl('Img4',15,0,'headright');c.addctl('Img5',15,0,'headleft');c.addctl('Img6',88,72,'blink');c.addctl('Img7',88,72,'random1blink');c.addctl('Img8',88,72,'random2blink');c.addctl('Img9',88,72,'random4blink');c.addctl('Img10',78,87,'pupils0');c.addctl('Img11',78,87,'pupils1');c.addctl('Img12',78,87,'pupils2');c.addctl('Img13',78,87,'pupils3');c.stop()"
					}
				},
				"Obj1":{"type":"bubble", "name":"Bubble", "left":8, "top":3, "width":188, "height":68, "tailstyle":1, "tailheight":18, "tailwidth":8, "tailattach":60, "tailskew":-10, "fontname":"Arial", "fontheight":13, "fontspacing":-4, "fontcolor":"#000000", "bubblecolor":"#f7ffbf", "linecolor":"#323232", "linewidth":2, "autosize":2, "wpm":200, "minshow":3000},
				"Msg1":{"type":"message", "name":"Respond", "external":true, "url":"http://localhost/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=BenHead&addons=RM2HeadClothesPack1,RM2HeadClothesPack2,RM2HeadHairPack1,RM2HeadHairPack2,RM2HeadHairPack3,RM2HeadIndustryPack,RM2HeadPolicePack,RM2HeadPropPack1,RM2HeadSoldierPack&voice=Neo%20Paul&size=200,160&autoactionlevel=2&customtop=shirt1&customneck=tie1&customover=jacket1&customovercolor=73,66,35&flashversion=11&actionscript=3&aiengine=programab&aimldatabase=super", "method":"get", "addvariables":"Text,AIMLUser,AIMLSession,AIMLTimezone", "character":"Char1"},
				"Msg2":{"type":"message", "name":"Speak", "external":true, "url":"http://localhost/cs/cs.exe?template=Library%2FTemplates%2FServer%2FSpeech.xml&character=BenHead&addons=RM2HeadClothesPack1,RM2HeadClothesPack2,RM2HeadHairPack1,RM2HeadHairPack2,RM2HeadHairPack3,RM2HeadIndustryPack,RM2HeadPolicePack,RM2HeadPropPack1,RM2HeadSoldierPack&voice=Neo%20Paul&size=200,160&autoactionlevel=2&customtop=shirt1&customneck=tie1&customover=jacket1&customovercolor=73,66,35&flashversion=11&actionscript=3", "method":"get", "addvariables":"Text", "character":"Char1"},
				"Msg3":{
					"type":"message", "name":"Eyenormal", "character":"Char1", "frames":2,
					"onframe":{
						"0":"c.load('Img1','C8DF043A90F6C2D1E40FFE28C302A91E.png',250,105,105,1);c.load('Img2','119CF719ADD425AB2AEA63AA6F49D9FE.png',219,200,200,1);",
						"1":"c.add('Img1',0,95,1,0,0,0,15,0,219,200);c.add('Img2',15,0,1,0,0,0);",
						"2":"c.stop()"
					}
				}
			}
		}
	}
};
msDocLoaded();
