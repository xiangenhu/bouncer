// ctl.debugTrace( -> //ctl.debugTrace(
// ctl.frameTrace( -> //ctl.frameTrace(
// then http://closure-compiler.appspot.com/home
// ==ClosureCompiler==
// @output_file_name MSHTML5_rasterctl.min.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==

window.MSModule_rasterctl = new MSModule_rasterctl;
function MSModule_rasterctl()
{
    //
    // Idle controllers
    //

    // Additional char values for idle:
    //
    // lastCmdAddId     used to find idLookUser
    // idLookUser       id of the default (look user) img
    // idBlink          id of blink layer
    // ...
    //
    // state            state of idle controller - defaults to "user"
    // action           current controller action, or "" if controller inactive
    //
	// nLastBlink       how many frames since last blink
	// nFrameBlink      frame within the blink animation
	//
    // xBtwEye		    point between character's eyes
	// yBtwEye
	// xMouseLast		last mouse
	// yMouseLast
	// nInactive		number of frames of no mouse movement
	// nLastRandom		frames since last random head
	// cFollow			number of successive follow-on random head movements
	// fakingmouse	    random look behavior
	// xMouseFake
	// yMouseFake
	//
	// xTrg             target for eyetracker
	// yTrg
	// nTrg             target for random head
	// xCur             current for eyetracker
	// yCur
	// nCur             current for random head
	//
	// stopping         true if we are actively trying to stop the controller
	// stopped          true when controllers has finally stopped

    // Special controller API
    this.addctl = function(ctl, ch, idCharEval, idMsgEval, id, x, y, s)
    {
		// addctl does not actually add to the display list - it just establishes it as a potential, to be added/removed by controller
        
		// Brittle assumption - last add before the addCtls is the "look user" id
		if (!ch.idLookUser) 
		{
			ch.idLookUser = ch.lastCmdAddId;
		}
        
		if (s == "headright") ch.idHeadRight = id;
		else if (s == "headleft") ch.idHeadLeft = id;
		else if (s == "pupils0") ch.idPupils0 = id;		
		else if (s == "pupils1") ch.idPupils1 = id;
		else if (s == "pupils2") ch.idPupils2 = id;
		else if (s == "pupils3") ch.idPupils3 = id;
		else if (s == "randomright") ch.idRandomRight = id;
		else if (s == "randomleft") ch.idRandomLeft = id;
		else if (s == "random1blink") ch.idBlink1 = id;	
		else if (s == "random2blink") ch.idBlink2 = id;	
		else if (s == "random3blink") ch.idBlink3 = id;	
		else if (s == "random4blink") ch.idBlink4 = id;	
		else if (s == "random5blink") ch.idBlink5 = id;	
		else if (s == "blink") ch.idBlink = id;	
		
		var img = ch.aImg[idMsgEval+id];
		if (img)
		{
			img.setAttribute("data-x", x);
			img.setAttribute("data-y", y);
		}	
    }
    
	// Special controller API
    this.ctlaction = function(ctl, ch, idCharEval, idMsgEval, action, mouseX, mouseY)
    {
        ctl.debugTrace("ctlaction "+action);
        ch.action = action;
		ch.state = "user";
		ch.nLastBlink = 0;
		ch.nFrameBlink = 0;
		ch.stopping = false;
		ch.stopped = false;
        ch.xBtwEye = 0;
        ch.yBtwEye = 0;
        ch.nInactive = 1000;
        ch.nLastRandom = 0;
        ch.cFollow = 0;
        ch.fakingmouse = false;
        ch.xTrg = 0;
        ch.yTrg = 0;
        ch.nTrg = 0;
        ch.xCur = 0;
        ch.yCur = 0;
        ch.nCur = 0;
		ch.asb = Math.random()*20; // asb=anti-sync-blink
		ch.nUnique = parseInt(idCharEval.match(/\d/)); // Char1 -> 1 Char2 -> 2
        
		var img;
		if (ch.idPupils0 && (img = ch.aImg[idMsgEval+ch.idPupils0]))
		{
			ch.xBtwEye = parseInt(img.getAttribute("data-x")) + img.width / 2;
			ch.yBtwEye = parseInt(img.getAttribute("data-y")) + parseInt(img.getAttribute("data-cyframe")) / 2;
			ctl.debugTrace("xBtwEye "+ch.xBtwEye+" yBtwEye "+ch.yBtwEye);	
		}
		var obj = ctl.getDirObjectFromId(idCharEval);
		ch.xMouseLast = mouseX - parseInt(obj.left) - ch.xBtwEye;
		ch.yMouseLast = mouseY - parseInt(obj.left) - ch.yBtwEye; 
    }

	/*
	var nTestCur = 0;
	var nTestTrg = 5;
	*/
	/*
	var xTestCur = 0;
	var xTestTrg = 8;
	*/

	// Special controller API
    this.ctlTrack = function(ctl, ch, idCharEval, idMsgEval, mouseX, mouseY)
    {
		/*
		// Nod test - tests random head imagery
		nTestCur = oneStepCloser(nTestCur, nTestTrg); 
		doRandomHead(ctl, ch, nTestCur);
		if (nTestCur == nTestTrg) 
		{
			if (nTestTrg == 5)
				nTestTrg = 0;
			else if (nTestTrg == 0)
				nTestTrg = 5;
		}
		return;
		*/
		/*
		// Look-back-and-forth test - tests eye tracker imagery
		if (xTestCur < xTestTrg)
			xTestCur++;
		else if (xTestCur > xTestTrg)
			xTestCur--;
		doMoveHead(xTestCur, 1);	// try -3 to 3
		if (xTestCur == xTestTrg) 
		{
			if (xTestTrg == 8)
				xTestTrg = -8;
			else if (xTestTrg == -8)
				xTestTrg = 8;
		}
		return;
		*/    
		
		var obj = ctl.getDirObjectFromId(idCharEval);
		var xMouse = mouseX - parseInt(obj.left) - ch.xBtwEye;
		var yMouse = mouseY - parseInt(obj.top) - ch.yBtwEye;
		ctl.frameTrace("raw mouseX="+mouseX+" raw mouseY="+mouseY+" xMouse="+xMouse+" yMouse="+yMouse);
	
		// Mechanism to detect if we haven't received a new mouse in a while
		if (xMouse != ch.xMouseLast || yMouse != ch.yMouseLast)
		{
			ch.nInactive = 0;
			ch.fakingmouse = false;	// a true mouse move
		}
		else
		{
			ch.nInactive++;
			if (ch.state == "user" && ch.nInactive > 45 && Math.random() < 0.02)
			{
				ch.fakingmouse = true;
				ch.xMouseFake = Math.random()*200 - 100;
				if (ch.xMouseFake > -50 && ch.xMouseFake <= 0) ch.xMouseFake = -50;
				if (ch.xMouseFake > 0 && ch.xMouseFake < 50) ch.xMouseFake = 50;
				ch.yMouseFake = Math.random()*200 - 100;
				if (ch.yMouseFake > -50 && ch.xMouseFake <= 0) ch.xMouseFake = -50;
				if (ch.yMouseFake > 0 && ch.xMouseFake < 50) ch.xMouseFake = 50;
				ch.nInactive = 0;
				ctl.frameTrace("Picking random xMouse="+ch.xMouseFake+" yMouse="+ch.yMouseFake);
			}
		}
		
		ch.xMouseLast = xMouse;
		ch.yMouseLast = yMouse;
		ctl.frameTrace("nInactive="+ch.nInactive);
		
		// Sort of an override
		if (ch.fakingmouse)
		{
			xMouse = ch.xMouseFake;
			yMouse = ch.yMouseFake;
		}
			
	    ch.nLastBlink++;
	    
		ch.nLastRandom++;
		ctl.frameTrace("nLastRandom="+ch.nLastRandom);
	    
		if (ch.stopping)
		{
			ch.xTrg = 0;
			ch.yTrg = 0;
			ch.nTrg = 0;
		}
		else if (ch.state != "eyetrack" && ch.nInactive == 0 && ch.action == "eyetracker") 
		{	
			ctl.frameTrace("Cursor movement - back to tracking"); // snappy!
			ch.state = "eyetrack";
			ch.nTrg = 0;
			ch.nCur = 0;
			ch.xTrg = Math.round(xMouse / 10);
			ch.yTrg = Math.round(yMouse / 20);
		}
		else if (ch.state == "eyetrack" && ch.nInactive < 40)
		{
			var xTrgNew = Math.round(xMouse / 10);
			var yTrgNew = Math.round(yMouse / 20);
			if (xTrgNew != ch.xTrg || yTrgNew != ch.yTrg)
			{
				ctl.frameTrace("Cursor movement - track target updated");
				ch.xTrg = xTrgNew;
				ch.yTrg = yTrgNew;
			}
		}			
		else if (ch.state == "eyetrack" && ch.nInactive >= 40) 
		{
			ctl.frameTrace("Bored of tracking - back to user");
			ch.state = "eyetrackstop";
			ch.xTrg = 0;
			ch.yTrg = 0;	
		}
		else if (ch.state == "randomheadattarget")
		{
			if (ch.nLastBlink > 60)
			{
				ctl.frameTrace("Time to blink");
				ch.state = "blink";
				ch.nFrameBlink = 1;
				ch.nLastBlink = 0;
			}
			else if (Math.random() < 0.03 && ch.nLastRandom > 20)  // distracting if it's too close together
			{
				ch.nTrg = chooseRandomHead(ch);
				if (ch.nTrg != ch.nCur)
				{
					ch.state = "randomheadmove";
					ctl.frameTrace("Different random head "+ch.nTrg);
					ch.cFollow = 0;
				}
			}
		}
			    
	    if (ch.state == "user")
	    {
		    if (ch.nLastBlink > 50+(ch.nUnique*10))
		    {
			    ch.state = "blink";
			    ch.nFrameBlink = 1;
			    ch.nLastBlink = 0;
		    }
			else if (ch.action == "eyetracker" || ch.action == "lookuseridle")
			{
				if (Math.random() < 0.03 && ch.nLastRandom > 20+(ch.nUnique*10))
				{
					ch.nTrg = chooseRandomHead(ctl, idCharEval, idMsgEval);
					ctl.frameTrace("New random head "+ch.nTrg);
					ch.cFollow = 0;
					ch.state = "randomheadmove";
				}
			}
		}

	    if (ch.xCur != ch.xTrg || ch.yCur != ch.yTrg)
	    {
		    var dt = Math.sqrt((ch.xTrg - ch.xCur)*(ch.xTrg - ch.xCur) + (ch.yTrg - ch.yCur)*(ch.yTrg - ch.yCur));
		    var d = dt*0.4;
		    if (d < 1) d = dt;	    // gravity well so we always get there
		    var limit = 2;
		    if (ch.state == "eyetrackstop" || ch.fakingmouse) limit = 0.5; // languid stop when bored of eye tracking
		    ch.xCur = dt == 0 ? ch.xCur : Math.round(ch.xCur + Math.min(limit,(ch.xTrg - ch.xCur)*(d/dt)));
		    ch.yCur = dt == 0 ? ch.yCur : Math.round(ch.yCur + Math.min(limit,(ch.yTrg - ch.yCur)*(d/dt)));		
		    doMoveHead(ctl, ch, ch.xCur, ch.yCur);		
	    }
	    if (ch.nCur != ch.nTrg)
	    {
		    ctl.frameTrace("Random head cur=" + ch.nCur + " target=" + ch.nTrg);
		    ch.nCur = oneStepCloser(ch.nCur, ch.nTrg);
		    doRandomHead(ctl, ch, ch.nCur);
		    ch.nLastRandom = 0;
	    }

        if (ch.nFrameBlink > 0)
	    {
	        ctl.frameTrace("Blink "+ch.nFrameBlink);
		    doBlink(ctl, ch, ch.nCur, ch.nFrameBlink);
		    ch.nFrameBlink++;
		    if (ch.nFrameBlink == 5) {ch.state = "user"; ch.nFrameBlink = 0;}
	    }

        // Detect that we want to stop idle
        if (ch.idMsgNext && !ctl.idleToIdle())
        {
            ch.stopping = true;
        }

	    // Detect end of a motion
	    if (ch.stopping && ch.xCur == 0 && ch.yCur == 0 && ch.nCur == 0 && ch.nFrameBlink == 0)
	    {
		    ch.stopped = true;		
		    ch.stopping = false;		
		    ch.action = "";
		    ctl.debugTrace("Controller stopped");
            if (ch.fStopReached)   // See comments in this.stop
            {
                ch.complete = true;
                ctl.controllerStopped();
            }
            else
            {
                ctl.debugTrace("waiting for idle stop");
            }
	    }
		else if (ch.state == "eyetrackstop" && ch.xCur == 0 && ch.yCur == 0)
		{
			ch.state = "user";
		}			
		else if (ch.state == "randomheadstop" && ch.nCur == 0)
		{
			ch.state = "user";
		}				
		else if (ch.state == "randomheadmove" && ch.nCur == ch.nTrg)
		{
			ch.state = "randomheadattarget";
			if (Math.random() < 0.7 && ch.cFollow < 3)	// min pause between head movement, but then a burst of one to three
			{
				ch.nTrg = chooseRandomHead(ch);
				if (ch.nTrg != ch.nCur)
				{
					ch.state = "randomheadmove";
					ctl.frameTrace("Follow-on random head "+ch.nTrg);
					ch.cFollow++;
				}
			}
		}	
    }	

	function doBlink(ctl, ch, nCur, n)
	{
		if (ch.nCur == 0) doBlinkWork(ctl, ch.idBlink, n);
		else if (ch.nCur == 5) doBlinkWork(ctl, ch.idBlink1, n);
		else if (ch.nCur == 6) doBlinkWork(ctl, ch.idBlink2, n);
		else if (ch.nCur == 104) doBlinkWork(ctl, ch.idBlink3, n);
		else if (ch.nCur == 18) doBlinkWork(ctl, ch.idBlink4, n);
		else if (ch.nCur == 113) doBlinkWork(ctl, ch.idBlink5, n);
	}
	
	function doBlinkWork(ctl, idBlink, n)
	{
		if (n == 1 || n == 3) 
		{
			ctl.add(idBlink, 1);
		}
		else if (n == 2) 
		{
			ctl.add(idBlink, 2);
		}
		else 
		{
			ctl.rem(idBlink);
		}
	}
	
    function doMoveHead(ctl, ch, x, y) 
	{
		ctl.frameTrace("doMoveHead " + x + " " + y);

		ctl.rem(ch.idBlink);
		ctl.rem(ch.idBlink1);
		ctl.rem(ch.idBlink2);
		ctl.rem(ch.idBlink3);
		ctl.rem(ch.idBlink4);
		ctl.rem(ch.idBlink5);
		ctl.rem(ch.idRandomLeft);
		ctl.rem(ch.idRandomRight);
		
		if (x < -8) x = -8;
		if (x > 8) x = 8;
		if (y < -3) y = -3;
		if (y > 3) y = 3;
		
		// Selection of HeadRight/Left controlled only by x
		if (x == 0)
		{
			ctl.rem(ch.idHeadRight);
			ctl.rem(ch.idHeadLeft);
			ctl.add(ch.idLookUser, 1);
		}
		else if (x > 0)
		{
			ctl.rem(ch.idLookUser);
			ctl.rem(ch.idHeadRight);
			ctl.add(ch.idHeadLeft, x);
		}
		else if (x < 0)
		{
			ctl.rem(ch.idLookUser);
			ctl.rem(ch.idHeadLeft);
			ctl.add(ch.idHeadRight, -x); // x = -8 -> 8
		}
		
		// Selection of pupil controlled first by y, then x
		ctl.rem(ch.idPupils0);
		ctl.rem(ch.idPupils1);
		ctl.rem(ch.idPupils2);
		ctl.rem(ch.idPupils3);
		if (y == -3)
		{
			ctl.add(ch.idPupils3, x + 9);		// x = -8 -> 1, x = 0 -> 9
		}
		else if (y == -2)
		{
			ctl.add(ch.idPupils2, x + 9);
		}
		else if (y == -1)
		{
			ctl.add(ch.idPupils1, x + 9);
		}
		else if (y == 0)
		{
			ctl.add(ch.idPupils0, x + 9);
		}
		else if (y == 1)
		{
			ctl.add(ch.idPupils1, 17 + x + 9);		// x = -8 -> 19
		}
		else if (y == 2)
		{
			ctl.add(ch.idPupils2, 17 + x + 9);		// x = -8 -> 19
		}
		else if (y == 3)
		{
			ctl.add(ch.idPupils3, 17 + x + 9);		// x = -8 -> 19
		}
	}

	function doRandomHead(ctl, ch, n) 
	{
		ctl.frameTrace("doRandomHead " + n);
		
		ctl.rem(ch.idBlink);
		ctl.rem(ch.idBlink1);
		ctl.rem(ch.idBlink2);
		ctl.rem(ch.idBlink3);
		ctl.rem(ch.idBlink4);
		ctl.rem(ch.idBlink5);
		ctl.rem(ch.idHeadLeft);
		ctl.rem(ch.idHeadRight);
		ctl.rem(ch.idPupils0);
		ctl.rem(ch.idPupils1);
		ctl.rem(ch.idPupils2);
		ctl.rem(ch.idPupils3);
		
		// Note: n > 100 means left and subtract 100. Random1-5 are 5, 6, 104, 18, 113
		if (n == 0)
		{
			ctl.rem(ch.idRandomLeft);
			ctl.rem(ch.idRandomRight);
			ctl.add(ch.idLookUser, 1);
		}
		else if (n > 100)
		{
			ctl.rem(ch.idLookUser);
			ctl.rem(ch.idRandomRight);
			ctl.add(ch.idRandomLeft, n - 100);
		}
		else
		{
			ctl.rem(ch.idLookUser);
			ctl.add(ch.idRandomRight, n); 
			ctl.rem(ch.idRandomLeft);
		}
	}
				
	function chooseRandomHead(ch)
	{
		var aRandom;
		if (ch.idRandomLeft) // for size we will generally only do the right side
			aRandom = [5, 6, 104, 18, 113];
		else 
			aRandom = [5, 6, 18];
		return aRandom[Math.floor(Math.random()*aRandom.length)];
	}

	function oneStepCloser(nCur, nTrg)
	{
		var paths =        [ //                         1->0                               2->0                                   3->0                                   4->0                                           5->0
												   [5,4,3,2,1,0],                     [6,7,8,9,0],                           [104,103,102,101,0],                   [18,22,21,20,19,0],                            [113,120,119,118,117,0],
							// 0->1                                                       2->1                                   3->1                                   4->1                                           5->1
							[0,1,2,3,4,5],                                                [6,12,11,10,5],                        [104,107,106,105,5],                   [18,17,16,15,14,6,12,11,10,5],                 [113,112,111,110,109,108,104,107,106,106,5],
							// 0->2                    1->2                                                                      3->2                                   4->2                                           5->2
							[0,9,8,7,6],               [5,10,11,12,6],                                                           [104,103,102,101,9,8,7,6],             [18,17,16,15,14,13,6],                         [113,116,115,114,18,17,16,15,14,13,6],					
							// 0->3                    1->3                               2->3                                                                          4->3                                           5->3
							[0,101,102,103,104],       [5,105,106,107,104],               [6,7,8,9,101,102,103,104],                                                    [18,114,115,116,113,112,111,110,109,108,104],  [113,112,111,110,109,108,104],
							// 0->4                    1->4                               2->4                                   3->4                                                                                  5->4
							[0,19,20,21,22,18],        [5,4,3,2,1,0,19,20,21,22,18],      [6,13,14,15,16,17,18],                 [104,108,109,110,111,112,113,116,115,114,18],                                         [113,116,115,114,18],
							// 0->5                    1->5                               2->5                                   3->5                                   4->5
							[0,117,118,119,120,113],   [5,4,3,2,1,0,117,118,119,120,113], [6,13,14,15,16,17,18,114,115,116,113], [104,108,109,110,111,112,113],         [18,114,115,116,113]
							];

		var i, l, j;
		// First try to find a direct path from where you are to where you want to be
		for (i = 0; i < paths.length; i++)
		{
			l = paths[i].length;
			if (paths[i][l-1] == nTrg)
			{
				for (j = 0; j < l-1; j++)
				{
					if (paths[i][j] == nCur)
					{
						return paths[i][j+1];
					}
				}
			}
		}
		// Failing that, pick the first path that gets us closer to any target
		for (i = 0; i < paths.length; i++)
		{
			var l = paths[i].length;
			for (var j = 0; j < l-1; j++)
			{
				if (paths[i][j] == nCur)
				{
					return paths[i][j+1];
				}
			}
		}
		return nCur;
	}	
};
msModuleLoaded();
    