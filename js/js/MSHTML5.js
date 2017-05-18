// debugTrace( -> //debugTrace(
// frameTrace( -> //frameTrace(
// function //debugTrace -> function debugTrace
// function //frameTrace -> function frameTrace
// then http://closure-compiler.appspot.com/home
// ==ClosureCompiler==
// @output_file_name MSHTML5.min.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==

/** 
  * @preserve Copyright (c) 2012-2014 Media Semantics, Inc. 
  * Loading spinner is copyright (c) 2011 Felix Gnass.
  */
  
// Creation API
function msEmbed(idDiv, project, base, widthEmbed, heightEmbed)
{
    // MSHTML5Control is a little "controller" object attached to the div
    var ctl = new MSHTML5Control(idDiv, project, base, widthEmbed, heightEmbed)
    ctl.setCtl(ctl);
    if (typeof msEmbeddings == 'undefined')
        msEmbeddings = [];
    msEmbeddings.push(ctl);                // Global array that contains all our controls - another way to get back to us

    // Parameters
    for (var i = 5; i < arguments.length; i=i+2) 
    {
        var n = arguments[i];
        var v = arguments[i+1];
        ctl[n] = v;
    }
	
	msEventHelper(ctl);
	
    var div = ctl.realizeTopLevel(true);    // Enough to get layout right and spinner
    div.ctl = ctl;                      	// Important - lets ms API connect back to class, given a DOM id
}

// Use instead of msEmbed when idDiv already created
function msAttach(idDiv, project, base, widthEmbed, heightEmbed)
{
    var ctl = new MSHTML5Control(idDiv, project, base, widthEmbed, heightEmbed)
    ctl.setCtl(ctl);
    if (typeof msEmbeddings == 'undefined')
        msEmbeddings = [];
    msEmbeddings.push(ctl);
	for (var i = 5; i < arguments.length; i=i+2) 
    {
        var n = arguments[i];
        var v = arguments[i+1];
        ctl[n] = v;
    }
	msEventHelper(ctl);
    var div = ctl.realizeTopLevel(false);
    div.ctl = ctl;
}

function msEventHelper(ctl)
{
	this.addEvents = function()
	{
		// For Safari
		if (/WebKit/i.test(navigator.userAgent)) 
		{
			var timer = setInterval(function() {
				if (/loaded|complete/.test(document.readyState)) 
				{
					clearInterval(timer);
					ctl.onPageLoad();
				}
			}, 10);
		}
		else
		{
			var oldonload = onload; 
			if (typeof onload != 'function') 
			{ 
				onload = function() {ctl.onPageLoad()}; 
			} 
			else // don't interfere with any other onloads
			{ 
				onload = function() 
				{ 
					if (oldonload) 
						oldonload(); 
					ctl.onPageLoad(); 
				} 
			} 
		}

		var oldonscroll = onscroll; 
		if (typeof onscroll != 'function') 
		{ 
			onscroll = function() {ctl.onScroll()}; 
		} 
		else // don't interfere with any other onloads
		{ 
			onscroll = function() 
			{ 
				if (oldonscroll) 
					oldonscroll(); 
				ctl.onScroll(); 
			} 
		} 
		
		var oldonmousemove = onmousemove; 
		if (typeof onmousemove != 'function') 
		{ 
			onmousemove = function(event) {ctl.onMouseMove(event)}; 
		} 
		else // don't interfere with any other onloads
		{ 
			onmousemove = function(event) 
			{ 
				if (oldonmousemove) 
					oldonmousemove(); 
				ctl.onMouseMove(event); 
			} 
		}
	}	
}	
	
// Used on eval to get back to the right control in a multi-scene page
var c;

function MSHTML5Control(idDiv, project, base, widthEmbed, heightEmbed)
{
    // So idDiv, project, base, widthEmbed, heightEmbed are global

    // IMPORTANT - other than in this creation fn, we use 'ctl' instead of 'this' in the code, to refer to globals vars, 
    // because 'this' is the wrong value when reacting to events and timers.
    
    // We'll set this in a sec with setCtl.
    var ctl = null;

    // Root (project) node of dir tree
    var dirRoot = undefined; 
    
    // Hash of ids in dirRoot
    var dirHash = null;
    
    // Public vars - note, all BuilderScript variables are in this namespace as well
    this.Presenting = false; // will get set from dirRoot.presenting on doc load
    this.Focus = "";
    this.Text = "";
    this.Paused = false;
    this.Muted = false;
    // End public vars    

    // 0 -> errors only, 1 -> top-level info only (DEFAULT), 2 -> full debug, 3 -> extreme debug (full frame trace)
    traceLevel = 2;
    
    // StartShield - true if shield is up
    var startShield = false;        
    
    // Startup
    var docLoaded = false;          // Content js file loaded
    var pageLoaded = (document.readyState === "complete"); // Containing HTML page loaded
    var startedUp = false;          
    
    // Current Scene, Slide, etc.
    var idSceneCur = null;            // id of current scene
    var idSlideshowCur = null;        // id of current slideshow if any
    var idSlideCur = null;            // id of current slide
    var idSequenceCur = null;        // id of current sequence if any
    var idStepCur = null;            // id of current step
    
    // Used in transition
    var idScenePrev = null;         
    var idSlidePrev = null;
    var idStepPrev = null;

    // Deferred are used in two-step navigation (going out then back in), i.e. move focus to a peer elsewhere in the tree
    var idMsgDeferred = null;
    var idSlideDeferred = null;
    var idStepDeferred = null;

    // Switching - we are either switching scene+slide+charframe0, or slide, or message - invariant: at most one of these in non-null
    var idSceneLoading = null;          // Non-null when loading scene
    var idSlideLoading = null;          // Non-null when loading slide
    var idCharLoading = null;           // Non-null when loading char

	// If a focus change happens while we are loading/switching, then it effectively waits until the loading is done.
	var changingFocus = false;
	var deferFocusChanged = false;
	 
    // Loading - one scene, slide, or message loads at a time
    var nImgLoading = 0;                // When loading images, number of outstanding loads
    var aImg = {};                      // Outstanding loads indexed by img id - should be empty during animation phase
    
    // Character
    var chars = {};                     // This is a hash from charId to an object that serves as a bag of state vars
                                        // So chars[charId].xSafe gets to the xSafe field
    // This is the char state:
    // idScene                          // Scene - can ignore chars that are not on current scene
    // aImg                             // Loaded images - for characters these are transferred from aImg - a hash
    // aImgShow                         // Array of ids of showing images, in drawing order
    // cxCharLeft                       // Due to clipping, amount of space that character overhangs left side
    // cyCharTop                        // Ditto for top
    // charCanvas                       // Secondary composition canvas, if size is not one-to-one
    // idMsg                            // Id of message currently being played by this character, or null
    // idMsgNext                        // Id of message scheduled to be played as soon as idMsg stops
    // loadingAudio                     // Audio loads can be concurrent and can precede actual char load time
    // audioLoaded                      // Indicates audio loaded
    // started                          // Flag indicates a message or idle has started
    // complete                         // Flag indicates a message or idle is complete
    // fRecovering                      // True from rec() to stop()
    // fStopReached                     // Final stop() reached - for controller coordination
    // fFirstFrameAfterRec              // Trigger to call clear char after a rec()
    // action                        // Normally "" - currently active idle controller
    
    // See also char vars used by idle controller
    
    // When a focus change occurs, we end up with a new idMsg. If idMsg is non-null then we set idMsgNext instead.
    // This is not a queue - if ANOTHER focus change occurs soon thereafter then it overwrites idMsgNest.
    // The presence of an idMsgNext causes the character to (smoothly) stop. When it comes to a stop, idMsgNext is
    // moved to idMsg, and only then does the "switching" process start, beginning with char loading. (Preloading is a
    // different thing altogether.)
    
    var charsToLoad = [];               // During switchChars we load one char at a time - this keeps track of the chars left to load

    // These are transitory, used to pass context to eval'ed fns
    var idCharEval;                     // If evaluating a CBScript fn, this is the current character 
    var idMsgEval;                      // If evaluating a CBScript fn, this is the current message 
    var loadTo = 0;                     // During loading, reaching this non-zero frame's worth of bitmaps will stop the loading
    var fRedraw;                        // Used during character frame processing - as soon as we do something that can't be rendered with just a blit we flag a redraw and deal with it after all the commands are in
    var fFromTimeline;                  // True during timeline processing
    var xSafe;                          // Used for redraw optimization - if next showimg is contained or equal to the safe rect then we can just blit
    var ySafe;
    var cxSafe;
    var cySafe;

    // Idles are treated just like regular messages for the most part, except that they have no audio and are looped, 
    // so they effectively have infinite length. 
    
    // Frame/event timing
    var eventHorizon = -1;   // The last time for which we have fired all events
    var tLastReported = 0;    // The last time-into-audio track reported 
    var tOfLastReport = 0;    // The real time when this report occurred
    var fMessedWithTime = false;    // True right after we do a gotoFrame, used to short-circuit frame loop in fireEvents
    
    // External messages
    var idCharExternal = null;        	// Non-blank while going out to the server to fetch an external message
    var idMsgExternal = null;
    var objExternal = null;            	// During an external message, holds the json from the server
    var urlExternal = null;            	// Used during switchCharTo to pass context to load
	var projGraft = null;	   	   		// Used by msPlayExternal
	var idGraft = null;		   	   		// Used by msPlayExternal

	// Sequencer
	var seqState;					// Sequencer state
	var seqInput;					// Sequencer input
	
    // Queues
    var speakPlayQueue = [];            // Objects of form     {type:"speak", data:string}

    // Compatibility
    var oldsyntax = false;

    // Bubble
    var bubbleBody = null;
    var bubbleTail = null;
    var textDeferred = "";

    // Misc
    var aQualify = null;                    // Used in qualifyURL
    var tStart = (new Date()).getTime();    // Trace
    var tPause = 0;

    // Fire-and-forget faders
    var aFade = [];
    var fading = false;

    // FAQ
    var faq = 1;
    
    // Scroll-prevention
    var curScrollTop = 0;
    var curScrollLeft = 0;
    
    // Stack (for bs expressions)
    var stack = [];
    
    // Mouse
    var mouseX = 0;     // relative to the embed
    var mouseY = 0;
    
    // Platform detection
    var iPhone = navigator.userAgent.match(/iPhone/i);
    var iPad = navigator.userAgent.match(/iPad/i);
    var android = navigator.userAgent.match(/android/i);
    var safari = navigator.userAgent.match(/AppleWebKit/i) && !android;
    //iPhone = true; // test
    //android = true; //test
    
    debugTrace("platform: "+navigator.userAgent+" iPhone="+iPhone+" iPad="+iPad+" android="+android+" safari="+safari);

    // Creates a new div DOM object in the document flow
    this.realizeTopLevel = function(create)
    {
        if (create) document.write('<div id="'+idDiv+'" style="top:0px; left:0px; width:'+widthEmbed+'px'+'; height:'+heightEmbed+'px'+'">'+'</div>');
        var div = document.getElementById(idDiv);
        s = "";
        var a = "'" + idDiv + "','" + idDiv+'Stage' + "',";
        var b = a + "'keydown'";
        s += '<div id="'+idDiv+'Stage" style="position:relative" width="'+widthEmbed+'" height="'+heightEmbed+'" onkeydown="msEvent('+b+')">';
        s += '&nbsp;';
        s += '</div>';
        debugTrace(" -> "+s);
        div.innerHTML = s;
        
        // This is where we stop without HTML5 support - just display blank
        if (!DetectHTML5())
        {
            return div;
        }
    
        addSpinner(div);
        
        // Attach data file
        var scr = document.createElement('script');
        div.appendChild(scr);
        var url = getBasedURL(project+'.js');
        /*CH*/if (ctl.Preview == "true") url += "?Preview=true";
        scr.src = url;
        return div;
    }

    //
    // Spinner
    //
    
    var spinner = null;
    var spinnerShowing = true;

    function addSpinner(target)
    {
        var opts = {
          lines: 11, // The number of lines to draw
          length: 7, // The length of each line
          width: 4, // The line thickness
          radius: 10, // The radius of the inner circle
          rotate: 0, // The rotation offset
          color: '#eeeeee', //'#3B4596' - MS blue
          speed: 1, // Rounds per second
          trail: 60, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 1, // The z-index 
          top: heightEmbed/2 - 17, // Top position relative to parent in px
          left: widthEmbed/2 - 17 // Left position relative to parent in px
        };
        spinner = new Spinner(opts).spin(target);    
    }
                    
    function showSpinner()
    {
        if (!spinnerShowing)
        {
            var divinner = document.getElementById(idDiv);
            spinner.spin(divinner);
            spinnerShowing = true;
        }
    }
    
    function hideSpinner()
    {
        if (spinnerShowing)
        {
            spinner.stop();
            spinnerShowing = false;
        }
    }

    //
    // Startup
    //

    this.setCtl = function(x)
    {
        ctl = x;
    }

    this.aDocLoaded = function()
    {
        debugTrace("aDocLoaded");
        // In a multi-embedding situation, onDocLoad is called whenever any doc loads - see if it unblocks us
        if (dirRoot == undefined)
        {
            dirRoot = window[project+'_Dir'];
            if (dirRoot != undefined)
            {
                onDocLoad()
            }
        }
		// We can also load a second dir file in the case of msPlayExternal
		else if (projGraft)
		{
			finishPlayExternal();
		}
    }
    
    function onDocLoad()
    {
        debugTrace("onDocLoad");
        
        /*CH*/if (dirRoot.exceeded == "true" || (dirRoot.trial == "true" && (dirRoot.hostingresources && dirRoot.hostingresources != "") ) )
        /*CH*/{
        /*CH*/    var divstage = document.getElementById(idDiv+'Stage');
        /*CH*/    divstage.innerHTML = '<div style="position:absolute; left:'+(widthEmbed-112)/2+'px; top:'+(heightEmbed-112)/2+'px; width:112px; height:87px;"/><a href="http://www.mediasemantics.com"><img src="http://www.characterhosting.com/images/MSLogo.gif" border="0"></a></div>'
        /*CH*/    hideSpinner(); 
        /*CH*/    return;
        /*CH*/}  
        
        prepDir();
        renderRest();
        initRest();

        // See matching at onPageLoad        
        docLoaded = true;
        if (pageLoaded && !startedUp)
        {
            startedUp = true;
            fireStartupEvents();
        }
    }

    function fireStartupEvents()
    {
        debugTrace("fireStartupEvents");

        // Initial Presenting
        ctl.Presenting = (dirRoot.presenting == true && !startShield);
                
        // Initial Focus
        for (var id in dirRoot.items)
        {
            ctl.Focus = id;
            break;
        }

        // No valid focus? Turn Presenting off
        if (ctl.Focus == null && ctl.Presenting)
        {
            ctl.Presenting = false;
        }

		// onLoad code
		if (dirRoot.onload)
		{
			debugTrace("Executing: "+dirRoot.onload);
			c = ctl;
			eval(dirRoot.onload);
			c = null;
		}
		
        // No flashvars with HTML - we get it first from the project, then get a chance to override in onSceneLoaded
        infoTrace("Firing onSceneLoaded("+idDiv+")");
        if (typeof onSceneLoaded == 'function')
            onSceneLoaded(idDiv);
        infoTrace("Firing onPresentingChange("+idDiv+","+ctl.Presenting+")");
        if (typeof onPresentingChange == 'function')
            onPresentingChange(idDiv, ctl.Presenting);
        infoTrace("Firing onFocusChange("+idDiv+","+ctl.Focus+")");
        if (typeof onFocusChange == 'function')
            onFocusChange(idDiv, ctl.Focus);
    
        focusChanged();

        // setup frame timer already - we will use it for the scene loading feedback
        setTimeout(function(){onFrame()}, 1000/dirRoot.fps);    
    }        
    
    //
    // Render the dir to DOM objects
    //
    
    function renderRest()
    {
        debugTrace("renderRest");
        s = "";
        for (var sceneid in dirRoot.items)
        {
            s += '<div id="'+idDiv+sceneid+'Div" style="display:none; left:0px; top:0px; position:absolute" width="'+widthEmbed+'" height="'+heightEmbed+'">';
            s += '<div id="'+idDiv+sceneid+'Inner" style="left:0px; top:0px; position:relative" width="'+widthEmbed+'" height="'+heightEmbed+'">';
            s += renderRecurse(dirRoot.items[sceneid]);
            renderBubble();
            renderStartShield();
            s += '</div>'; 
            s += '</div>'; 
            s += '<div id="'+idDiv+'Measure" style="position:absolute; visibility:hidden; width:auto; height:auto"></div>'; // Used for bubble layout, maybe others        

            // scenes are created invisible and displayed all at once when everything is loaded
        }
        /*CH*/if (ctl.Preview == "true")
        /*CH*/{
        /*CH*/    s += '<div id="'+idDiv+'PreviewDiv" style="display:none; position:absolute; left:'+(widthEmbed-120)/2+'px; top:'+(heightEmbed-120)/2+'px; width:120px; height:120px;"/><img src="http://www.characterhosting.com/images/MSPreview.png" border="0"></div>'
        /*CH*/}
        debugTrace(" -> "+s);
        var divstage = document.getElementById(idDiv+'Stage');
        divstage.innerHTML = s;
    }
    
    function renderRecurse(parent)
    {
        // Note - we can overgenerate here - CB will validate hierarchy constraints
        var s = "";
        for (var objid in parent.items)
        {
            var obj = parent.items[objid];
            if (obj.type=="character")
            {    
                s += renderCharacter(objid, obj);
            }
            else if (obj.type=="bubble")
            {    
                s += renderBubble2(objid, obj);
            }
            else if (obj.type=="image")
            {
                s += renderImage(objid, obj);
            }
            else if (obj.type=="movie")
            {
                s += renderMovie(objid, obj);
            }
            else if (obj.type=="text")
            {
                s += renderText(objid, obj);
            }
            else if (obj.type=="editcontrol")
            {
                s += renderEditControl(objid, obj);
            }
            else if (obj.type=="rectangle")
            {
                s += renderRectangle(objid, obj);
            }
            else if (obj.type=="button")
            {
                s += renderButton(objid, obj);
            }
            else if (obj.type=="grid")
            {
                s += renderGrid(objid, obj);
            }
            else if (obj.type=="slideshow")
            {
                s += renderSlideshow(objid, obj);
            }
            else if (obj.type=="buttonset")
            {    
                s += renderButtonSet(objid, obj);
            }
        }
        return s;    
    }

    function renderGrid(objid, obj)
    {
        s = "";
        s += '<div id="'+idDiv+objid+'Div" style="position:absolute; left:'+obj.left+'px; top:'+obj.top+'px; width:'+obj.width+'; height:'+obj.height+'">';
        s += '<div id="'+idDiv+objid+'Inner" style="position:relative; left:0px; top:0px; width:'+obj.width+'; height:'+obj.height+'">';
          s += renderRecurse(obj);
        s += '</div>';
        s += '</div>';
        return s;
    }
    
    function renderCharacter(objid, obj)
    {
        var s = "";
        var a = "'" + idDiv + "','" + objid + "',";
        var vls = a + "'audioonloadstart'"; var vprog = a + "'audioonprogress'"; var vcpt = a + "'audiooncanplaythrough'"; var verr = a + "'audioonerror'"; var vst = a + "'audioonstalled'"; var vlm = a + "'audioonloadedmetadata'"; var vpl = a + "'audioonplaying'"; var vend = a + "'audioonended'"; var vtu = a + "'audioontimeupdate'";
        
        if (obj.narrator) 
            obj.left = obj.top = obj.width = obj.height = 0;
        var o = cropHelper(obj);
        
        s += '<div id="'+idDiv+objid+'Div" style="position:absolute; left:'+o.x+'px; top:'+o.y+'px; width:'+o.cx+'; height:'+o.cy+'">';
          s += '<canvas id="'+idDiv+objid+'Canvas" width="'+o.cx+'" height="'+o.cy+'"></canvas>';
          s += '<audio id="'+idDiv+objid+'Audio" onloadstart="msEvent('+vls+')" onprogress="msEvent('+vprog+')" oncanplaythrough="msEvent('+vcpt+')" onerror="msEvent('+verr+')" onstalled="msEvent('+vst+')" onloadedmetadata="msEvent('+vlm+')" onplaying="msEvent('+vpl+')" onended="msEvent('+vend+')" ontimeupdate="msEvent('+vtu+')"/>';
        s += '</div>';

        // also set up the char state
        chars[objid] = {
		    "idScene":obj.parent.id,
            "aImg":null,
            "aImgShow":null,
            "cxCharLeft":o.cxLeft,
            "cyCharTop":o.cyTop,
            "charCanvas":null,
            "loadingAudio":false,
            "audioLoaded":false,
            "idMsg":null,
            "idMsgNext":null,
            "complete":false
        };
        return s;
    }
    
    function cropHelper(obj)
    {
        // Use a div background, so we can crop
        var cxLeft = 0;
        var x = parseInt(obj.left);
        var cx = parseInt(obj.width);
        if (x < 0)
        {
            cxLeft = -x;
            cx += x;
            x = 0;
        }
        if (x+cx > widthEmbed)
            cx = widthEmbed - x;
        
        var cyTop = 0;
        var y = parseInt(obj.top);
        var cy = parseInt(obj.height);
        if (y < 0)
        {
            cyTop = -y;
            cy += y;
            y = 0;
        }
        if (y+cy > heightEmbed)
            cy = heightEmbed - y;
            
        return {"cxLeft":cxLeft, "cyTop":cyTop, "x":x, "y":y, "cx":cx, "cy":cy};
    }


    // z-index policy: topmost is always shield, at 1000 - avoid using, but use 999 for edit controls, so they get the focus.
    
    function renderStartShield()
    {
        if (dirRoot.allowautoplay == "always") return;
        if (dirRoot.allowautoplay == "never" ||
            (iPhone||iPad||android) && dirRoot.presenting == true && !dirRoot.noaudio) // or "detect", the default
        {
            infoTrace("allowautoplay - initially presenting, have audio: putting up StartShield, Presenting now false");
            var c = "'" + idDiv + "',null," + "'shieldclick'"; 
            s += '<canvas id="'+idDiv+'StartShield" style="position:absolute; z-index:1000; left:0px; top:0px;" width="'+widthEmbed+'" height="'+heightEmbed+'" onclick="msEvent('+c+')"/></canvas>';
            startShield = true;
            ctl.Presenting = false;
        }
    }
    
    function initStartShield()
    {   
        var e = document.getElementById(idDiv+"StartShield")
        if (e) 
        {
            // Background
            var ctx = e.getContext('2d');
            ctx.fillStyle= "#000000";
            ctx.globalAlpha=0.5;
            ctx.fillRect(0,0,widthEmbed,heightEmbed);
            
            var x = widthEmbed/2;
            var y = heightEmbed/2;

            // Inner
            ctx.beginPath();
            ctx.arc(x, y , 25, 0 , 2*Math.PI, false);
            ctx.fillStyle = "#999999";
            ctx.globalAlpha = 0.5;
            ctx.fill();
            
            // Outer
            ctx.beginPath();
            ctx.arc(x, y , 27, 0 , 2*Math.PI, false);
            ctx.strokeStyle = "#cccccc";
            ctx.lineWidth = 5;
            ctx.globalAlpha = 1;
            ctx.stroke();
            
            // Triangle
            ctx.beginPath();
            x -= 12; y -= 15;
            ctx.moveTo(x, y);
            y += 30;
            ctx.lineTo(x, y);
            y -= 15; x += 30;
            ctx.lineTo(x, y);
            y -= 15; x -= 30;
            ctx.lineTo(x, y);
            ctx.fillStyle = "#cccccc";
            ctx.globalAlpha = 1;
            ctx.fill();
        }
    }
    
    function getAudioFilesRec(parent, a)
    {
        for (var objid in parent.items)
        {
            var obj = parent.items[objid];
            if (obj.type == "message")
            {
                if (obj.file) a.push(obj.file);
            }
            else if (obj.items)
            {
                getAudioFilesRec(obj, a);
            }
        }    
    }
        
    function shieldclick()
    {
        infoTrace("user clicked StartShield");
        var e = document.getElementById(idDiv+"StartShield")
        if (e) e.parentNode.removeChild(e);
        startShield = false;
        ctl.startPresenting();
        switchChars();
    }
    
    function dismissAnyStartShield()
    {
        if (startShield)
        {
            infoTrace("external api caused us to remove StartShield");
            var e = document.getElementById(idDiv+"StartShield")
            if (e) e.parentNode.removeChild(e);
            startShield = false;
            switchChars();
        }
    }

    function renderImage(objid, obj)
    {
        // Use a div background, so we can crop
        var o = cropHelper(obj);
        return '<div id="'+idDiv+objid+'Div" style="position:absolute; display:'+(obj.hidden ? 'none' : 'block')+'; left:'+o.x+'px; top:'+o.y+'px; width:'+o.cx+'px; height:'+o.cy+'px;"/></div>';
        // Note: background-size is CSS3
    }

    function renderMovie(objid, obj)
    {
		var s = '<div id="'+idDiv+objid+'Div" style="position:absolute; left:'+obj.left+'px; top:'+obj.top+'px;">';
		s += '<video id="'+idDiv+objid+'Video" width="'+obj.width+'" height="'+obj.height+'"' + (obj.autoplay?' autoplay':'') + (obj.controls?' controls ':'') + '>';
		s += '<source src="'+getBasedURL(obj.file)+'" type="video/mp4">';
		if (obj.altfile) s += '<source src="'+getBasedURL(obj.altfile)+'" type="video/ogg">';
		s += '</video></div>';
        return s;
    }

    function renderBubble()
    {
        if (oldsyntax) s += '<canvas id="BubbleLayer" style="position:absolute; left:0px; top:0px;" width="'+widthEmbed+'" height="'+heightEmbed+'"/></canvas>';
    }

    function renderBubble2(objid, obj)
    {
        var s = "";
        s += '<div id="'+idDiv+objid+'Div" style="position:absolute; left:'+obj.left+'px; top:'+obj.top+'px;">';
        s += '<div id="'+idDiv+objid+'Inner" style="position:relative; left:0px; top:0px;" width="'+(obj.width+5)+'" height="'+(obj.height+8)+'">';
          s += '<canvas id="'+idDiv+objid+'Canvas" style="position:absolute; left:0px; top:0px;" width="'+(obj.width+5)+'" height="'+(obj.height+8)+'"></canvas>';
          s += '<div id="'+idDiv+objid+'Text" style="position:absolute; left:5px; top:5px; width:'+(parseInt(obj.width)-10)+'px; height:0px;';
          s += 'font-family:'+obj.fontname+'; font-size:'+obj.fontheight+'px;';
          s += 'font-color:'+obj.fontcolor+';';
          if (obj.fontbold) s += ' font-weight:bold;';
          if (obj.fontitalic) s += ' font-style:italic;';
          // UNDONE: fontspacing, fontalign
          s += '">';
          s += '</div>';
        s += '</div>';
        s += '</div>';
        return s;
    }

    function renderButtonSet(objid, obj)
    {
        var s = "";
        s += '<div id="'+idDiv+objid+'Div" style="position:absolute; left:'+obj.left+'px; top:'+obj.top+'px;">';
        s += '<div id="'+idDiv+objid+'Inner" style="position:relative; left:0px; top:0px;" width="'+(obj.width+5)+'" height="'+(obj.height+8)+'">';
        s += '</div>';
        s += '</div>';
        return s;
    }

    function renderText(objid, obj)
    {
        var s = "";
        s += '<div id="'+idDiv+objid+'Div" style="position:absolute; display:'+(obj.hidden ? 'none' : 'block')+'; left:'+obj.left+'px; top:'+obj.top+'px; width:'+obj.width+'px; height:'+obj.height+'px">';
        s += obj.text;
        s += '</div>';
        return s;
    }

    function renderEditControl(objid, obj)
    {
        var s = "";
        s += '<div id="'+idDiv+objid+'EditDiv" style="display:block; z-index:999; position:absolute; left:'+obj.left+'px; top:'+obj.top+'px;" width="'+obj.width+'" height="'+obj.height+'">';
        // w/o a high z-index, edit control does not get the focus
        var a = "'" + idDiv + "','" + objid + "',";
        var b = a + "'editchange'";
        var c = a + "'editfocus'";
        s += '<input id="'+idDiv+objid+'Edit" type="text" style="width:'+obj.width+'px; height:'+obj.height+'px; border-style:none;" onkeyup="msEvent('+b+')" onmouseup="msEvent('+b+')" onchange="msEvent('+b+')" onfocus="msEvent('+c+')"/>'; // onchange called on mouse out
        s += '</div>';
        return s;
    }
        
    function renderRectangle(objid, obj)
    {
        var s = "";
        var solid = obj.fillcolor;
        if (obj.wash)
        {
            s += '<canvas id="'+idDiv+objid+'Wash" style="position:absolute; left:'+obj.left+'px; top:'+obj.top+'px;" width="'+obj.width+'" height="'+obj.height+'"/></canvas>';
        }
        else
        {
            s += '<div id="'+idDiv+objid+'Div" style="position:absolute; left:'+obj.left+'px; top:'+obj.top+'px; width:'+obj.width+'px; height:'+obj.height+'px;';
            if (obj.fillcolor)
                s += ' background-color:'+obj.fillcolor+';';
            if (obj.strokewidth > 0)
                s += ' border:'+obj.strokewidth+'px solid '+obj.strokecolor+';';
            s += '"></div>';
        }
        return s;
    }
    
    function renderButton(objid, obj)
    {
        // Set up all the structure, withhold the src
        var s = "";
        s += '<div id="'+idDiv+objid+'Div" style="position:absolute; left:'+obj.left+'px; top:'+obj.top+'px; width:'+obj.width+'px; height:'+obj.height+'px">';
        var a = "'" + idDiv + "','" + objid + "',";
        var bc = a + "'buttonclick'"; var mover = a + "'mouseover'"; var mout = a + "'mouseout'"; var mdn = a + "'mousedown'"; var mup = a + "'mouseup'";
        s += '<a href="javascript:msEvent('+bc+')" onmouseover="msEvent('+mover+')" onmouseout="msEvent('+mout+')" onmousedown="msEvent('+mdn+')" onmouseup="msEvent('+mup+')">';
        s += '<div id="'+idDiv+objid+'Inner" style="position:relative; left:0px; top:0px; width:'+obj.width+'; height:'+obj.height+'">';
        s += '<img id="'+idDiv+objid+'Back" style="position:absolute; left:0; top:0;" border="0"/>';
        if (obj.text)
            s += '<span id="'+idDiv+objid+'Lbl" style="position:absolute; left:'+obj.xfore+'px; top:'+obj.yfore+'px;"/><font>'+obj.text+'</font></span>';
        else if (obj.forefile)
            s += '<img id="'+idDiv+objid+'Fore" style="position:absolute; left:'+obj.xfore+'px; top:'+obj.yfore+'px;" border="0"/>';
        s += '</div>';
        s += '</a>';
        s += '</div>';
        obj.over = false;   // We add these fields and use them to track button state at runtime - see updateButton(), buttonover()
        obj.down = false;
        return s;
    }
    
    function renderSlideshow(objid, obj)
    {
        var s = "";
        s += '<div id="'+idDiv+objid+'Div" style="position:absolute; left:'+obj.left+'px; top:'+obj.top+'px; width:'+obj.width+'; height:'+obj.height+'">';
        s += '<div id="'+idDiv+objid+'Inner" style="position:relative; left:0px; top:0px; width:'+obj.width+'; height:'+obj.height+'">';
        for (var slideid in obj.items)
        {
			s += renderSlide(slideid, obj);
        }
        s += '</div>';
        s += '</div>';
        return s;
    }

    function renderSlide(slideid, obj)
    {
        var s = "";
		var slide = obj.items[slideid];
		s += '<div id="'+idDiv+slideid+'Div" style="display:none; position:absolute; left:0px; top:0px; width:'+obj.width+'; height:'+obj.height+';">';
		s += '<div id="'+idDiv+slideid+'Inner" style="position:relative; left:0px; top:0px; width:'+obj.width+'; height:'+obj.height+';">';
		s += renderRecurse(slide);
		s += '</div>';
		s += '</div>';
        return s;
    }
	
	//
	// ButtonSets
	//
	
	function layoutButtonSet(msg, bs)
	{
		if (bs == null) return;
		// populate abtn w/ {label:"OK"}
		abtn = [];
		var t = "c.button('";
		for (var i = 1; i <= msg.frames; i++)
		{
			var s = msg.onframe[i.toString()];
			if (s)
			{
				var p = 0;
				p = s.indexOf(t,p);
				while (p != -1) 
				{
					p += t.length;
					var q = s.indexOf("'",p);
					if (q != -1)
					{
						abtn.push({text:s.substr(p, q - p)});
						p = q+1;
					}
					p = s.indexOf(t,p);
				}
			}
		}
		// Add abtn to the dir object - we'll use it on a click
		bs.abtn = abtn;
		// Measure label lengths
		var mdiv = document.getElementById(idDiv+"Measure");
        mdiv.style.fontFamily = bs.fontname;
        mdiv.style.fontSize = bs.fontheight+'px';
		var maxwidth = 0;
		var height;
		for (var i = 0; i < abtn.length; i++)
		{
			mdiv.innerHTML = abtn[i].text;
			height = mdiv.clientHeight;
			if (mdiv.clientWidth > maxwidth) maxwidth = mdiv.clientWidth;
            abtn[i].width = mdiv.clientWidth;
            abtn[i].height = mdiv.clientHeight;
		}
		// Create up and down button canvases - all btns same (max) size
		var facewidth = maxwidth + 2*(bs.padding); 
		var faceheight = height + 2*(bs.padding);
		// Render new buttons
		var cols = Math.floor(bs.width / (facewidth + bs.padding));
		var rows = Math.ceil(abtn.length / cols);
		var totalwidth = cols * facewidth + (cols-1) * bs.spacing;
		var totalheight = rows * faceheight + (rows-1) * bs.spacing;
		var row = 0;
		var col = 0;
		var x = (bs.width - totalwidth)/2;  // simplistic layout - all buttons the same (max) size, centered 
		var y = (bs.height - totalheight)/2;  // might want a bottom/top-aligned feature
		var s = "";
		for (var i = 0; i < abtn.length; i++)
		{
			s += renderButtonSetButton(bs.id, i, x, y, abtn[i], facewidth, faceheight);
			col++;
			x += facewidth + bs.padding;
			if (col == cols)
			{
				row++;
				y += faceheight + bs.padding;
				col = 0;
				x = (bs.width - totalwidth)/2;  // simplistic layout - all buttons the same (max) size, centered
			}
		}
		var div = document.getElementById(idDiv + bs.id + "Inner");
		div.innerHTML = s;
		// render the canvases
		for (var i = 0; i < abtn.length; i++)
		{
			drawButtonSetFace(document.getElementById(idDiv + bs.id + "Btn" + i + "Up"), facewidth, faceheight, bs, false);
			drawButtonSetFace(document.getElementById(idDiv + bs.id + "Btn" + i + "Dn"), facewidth, faceheight, bs, true);
		}
	}
	
    function renderButtonSetButton(objid, i, x, y, btn, facewidth, faceheight)
    {
        // Mimic how we set up a button - buttons will be ButtonSet1Btn0Div, for example
        var s = "";
        s += '<div id="'+idDiv+objid+'Btn'+i+'Div" style="position:absolute; left:'+x+'px; top:'+y+'px; width:'+facewidth+'px; height:'+faceheight+'px">';
        var a = "'"+idDiv+"','"+objid+"',";
        var bc = a + "'bsbuttonclick',"+i; var mdn = a + "'bsmousedown',"+i; var mup = a + "'bsmouseup',"+i;
        s += '<a href="javascript:msEvent('+bc+')" onmousedown="msEvent('+mdn+')" onmouseup="msEvent('+mup+')">';
        s += '<div id="'+idDiv+objid+'Btn'+i+'Inner" style="position:relative; left:0px; top:0px; width:'+facewidth+'px; height:'+faceheight+'px;">';
        s += '<canvas id="'+idDiv+objid+'Btn'+i+'Up" style="display:none; position:absolute; left:0px; top:0px;" width="'+facewidth+'" height="'+faceheight+'"></canvas>';
        s += '<canvas id="'+idDiv+objid+'Btn'+i+'Dn" style="display:none; position:absolute; left:0px; top:0px;" width="'+facewidth+'" height="'+faceheight+'"></canvas>';
        s += '<span id="'+idDiv+objid+'Btn'+i+'Lbl" style="display:none; position:absolute; left:'+(facewidth-btn.width)/2+'px; top:'+(faceheight-btn.height)/2+'px;"/><font>'+btn.text+'</font></span>';
        s += '</div>';
        s += '</a>';
        s += '</div>';
        return s;
    }

	function drawButtonSetFace(face, w, h, bs, down)
	{
        var ctx = face.getContext("2d");
        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = parseInt(bs.linewidth)*2;
        ctx.strokeStyle = bs.linecolor; 
        ctx.fillStyle = down ? bs.facecolordown : bs.facecolor;
        var x = 0;
        var y = 0
		var r = 20;
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.lineTo(x+w-r, y);
        ctx.arcTo(x+w, y, x+w, y+r, r);
        ctx.lineTo(x+w, y+h-r);
        ctx.arcTo(x+w, y+h, x+w-r, y+h,r);
        ctx.lineTo(x+r, y+h);
        ctx.arcTo(x, y+h, x, y+h-r, r);
        ctx.lineTo(x, y+r);
        ctx.arcTo(x, y, x+r, y, r);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
		return face;
	}
	
    function bsbuttonclick(idBS, i)
    {
        var bs = getDirObjectFromId(idBS);
		var text = bs.abtn[i].text;
		// Set variable to text
		if (bs.variable)
		{
            debugTrace(bs.variable + " changed to " + text);
            ctl[bs.variable] = text;
		}
		// Invoke onclick
		var cmd = bs.onclick;
		if (cmd)
		{
			debugTrace("Executing: "+cmd);
			c = ctl;
			eval(cmd);
			c = null;
		}
		// Clear the buttonset contents
		document.getElementById(idDiv + idBS + "Inner").innerHTML = "";
    }

    function bsbuttondown(idBtn, i)
    {
		document.getElementById(idDiv + idBtn + "Btn" + i + "Up").style.display = 'none';
		document.getElementById(idDiv + idBtn + "Btn" + i + "Dn").style.display = 'block';
    }

    function bsbuttonup(idBtn, i)
    {
		document.getElementById(idDiv + idBtn + "Btn" + i + "Up").style.display = 'block';
		document.getElementById(idDiv + idBtn + "Btn" + i + "Dn").style.display = 'none';
    }
	
    //
    // Id/Name/Containment Helpers
    //

    function prepDir()
    {
        dirHash = {}
        dirRoot.type = "project";
        dirRoot.parent = null;
        prepDirRec(dirRoot, "");
        if (parseInt(dirRoot.version.split(".")[3])&1) oldsyntax = true;
    }
    
    function prepDirRec(parobj, parid)
    {
        for (var id in parobj.items)
        {
            var obj = parobj.items[id];
            dirHash[id] = obj;            // For quick dirObjFromId
            obj.id = id;                // so given an obj when can quick get back to id
            obj.parent = parobj;        // so we can walk up the containment chain
            if (obj.hasOwnProperty("items"))
                prepDirRec(obj, id);
        }
    }
    
    function getDirObjectFromId(idObj)
    {
        return dirHash[idObj];
    };
                    
    function getIdFromIdOrName(s)
    {
        if (getDirObjectFromId(s)) return s;
        else return getIdFromNameRec(dirRoot, s)
    }

    function getIdFromNameRec(obj, nameTarget)
    {
        for (var idChild in obj.items)
        {
            var objChild = obj.items[idChild];
            if (objChild.name == nameTarget)
                return idChild;
            var idTest = getIdFromNameRec(objChild, nameTarget);
            if (idTest) 
                return idTest;
        }
        return null;
    };

    //
    // Tracing
    //
    
    // Always on - critical errors that result in suppressed functionality
    function errorTrace(message)
    {
        try
        {     
            console.log(idDiv+": "+((new Date()).getTime()-tStart)/1000+"s: "+message);
        }
        catch (e) {}
    }
    
    // Normally turned on - key events that may be relevant to API users, etc.
    function infoTrace(message)
    {
        if (traceLevel > 0)
        {
            try
            {            
                console.log(idDiv+": "+((new Date()).getTime()-tStart)/1000+"s: "+message);
            }
            catch (e) {}
        }
    }

    // Normally turned off - detailed trace for testing internals
    function debugTrace(message)
    {
        if (traceLevel > 1)
        {
            try
            {
                console.log(idDiv+": "+((new Date()).getTime()-tStart)/1000+"s: "+message);
            }
            catch (e) {}
        }
    }

    // Normally turned off - detailed frame by frame trace for testing internals
    function frameTrace(message)
    {
        if (traceLevel > 2 && ((new Date()).getTime()-tStart)/1000 < 10.0)
        {
            try
            {            
                console.log(idDiv+": "+((new Date()).getTime()-tStart)/1000+"s: "+message);
            }
            catch (e) {}
        }
    }

    function assert(f)
    {
        if (!f)
        {
            errorTrace("Internal Error");
        }
    }
    
    //
    // Dir object navigation helpers
    //
    
    function getFirstItemOfTypeIn(type, idParent)
    {
        return getFirstItemOfTypeInObj(type, getDirObjectFromId(idParent));
    }

    function getFirstItemOfTypeInObj(type, parent)
    {
        for (var id in parent.items)
        {
            if (parent.items[id].type == type)
                return id;
        }
        return null;
    }

    function getContainingElementOfType(type, obj)
    {
        var p = obj.parent;
        while (p)
        {
            if (p && p.type == type)
                return p;
            p = p.parent;
        }
    }

    function getContainingElementOfTypeId(type, id)
    {
        var obj = getContainingElementOfType(type, getDirObjectFromId(id));
        return obj ? obj.id : null;
    }

    function lastItemInFirstChildOfType(type, obj)
    {
        if (obj == null) return null;
        var seq = getFirstItemOfTypeInObj(type, obj);
        if (seq)
        {
            var step = getLastItemIn(getDirObjectFromId(seq));
            if (step) return step;
        }
        return null;
    }

    // Given a directory object returns its next sibling
    function getNextItem(obj)
    {
        var f = false;
        for (var id in obj.parent.items)
        {
            if (f) return obj.parent.items[id];
            if (obj.parent.items[id] == obj)
                f = true;
        }
        return null;
    }

    // Given a directory object returns its previous sibling
    function getPrevItem(obj)
    {
        var last = null;
        for (var id in obj.parent.items)
        {
            if (obj.parent.items[id] == obj)
                return last;
            last = obj.parent.items[id];
        }
    }
    
    function getLastItemIn(obj)
    {
        var last = null;
        for (var id in obj.items)
        {
            last = obj.items[id];
        }
        return last;
    }
    
    function checkAllComplete()
    {
        debugTrace("checkAllComplete");
        
        // chars[idChar].complete is a special flag that goes complete as soon as the message audio file completes.
        // It is possible, with a dialog, for two messages to complete slightly out of order - we don't finish until
        // all messages are complete.
        
        var fAllComplete = true;
		var fNotEvenStarted = false;
        for (var idChar in chars)
        {
			if (chars[idChar].idScene != idSceneCur) continue;
			if (!chars[idChar].started) fNotEvenStarted = true;
            if (chars[idChar].started && !chars[idChar].complete)
			{
                fAllComplete = false;
				debugTrace("("+idChar+" still not complete)");
			}
        }
        if (idSlideLoading)         // Often we will be stopping the character concurrently with loading the next slide.
		{
            fAllComplete = false;   // Slide load complete also calls checkAllComplete(). Enforces rule of loading one thing at a time (scene/slide/char).
			debugTrace("(no - "+idSlideLoading+" loading)");
		}
        if (idSceneLoading)         // Similar for scenes
		{
            fAllComplete = false;
			debugTrace("(no - "+idSceneLoading+" loading)");
		}
        if (fAllComplete)
        {
			debugTrace("(yes, ready to switch)");
            var idle = false;
            for (var idChar in chars)
            {
				if (chars[idChar].idScene != idSceneCur) continue;
				if (fNotEvenStarted && chars[idChar].idMsg != null && chars[idChar].idMsgNext == null)
				{
					// Fast start case
				}
				else
				{
					chars[idChar].idMsg = chars[idChar].idMsgNext;
					chars[idChar].idMsgNext = null;
					if (chars[idChar].idMsg == null)
						idle = true;
				}
                // Reset and move idMsgNext to idMsg
                chars[idChar].started = false; // until first real frame of animation
                chars[idChar].complete = false;
                dumpState();
            }
			if (idle) 
			{
				goIdle(); // If ANY char has no msg then go idle - may be too strong?
			}
			setTimeout(function(){switchChars();}, 1); // Let things unravel first
        }
    }

    // Gets called only when we run out of messages to present
    function goIdle()
    {
        debugTrace("goIdle");
        var ex = ctl.Presenting;
        ctl.Presenting = false;
        dumpState();
        if (!restartFromQueue())
        {
            if (ex != ctl.Presenting)
            { 
                infoTrace("Firing onPresentingChange("+idDiv+","+ctl.Presenting+")");
                if (typeof onPresentingChange == 'function')
                    onPresentingChange(ctl, ctl.Presenting);    // This may change everything...
            }
            dumpState();
            updateNavButtons();
            resetCharacterMessages();
        }
    }
    
    function getIdleId(idChar)
    {
        var dir = dirRoot;
        for (var sceneid in dir.items)
        {
            for (var objid in dir.items[sceneid].items)
            {
                var obj = dir.items[sceneid].items[objid];
                if (obj.type == "message" && obj.idle == true && obj.character == idChar)
                    return objid;
            }
        }
        return null;
    };
    
    function getFirstCharacter()
    {
        var dir = dirRoot;
        for (var sceneid in dir.items)
        {
            for (var objid in dir.items[sceneid].items)
            {
                var obj = dir.items[sceneid].items[objid];
                if (obj.type == "character")
                    return objid;
            }
        }
        return null;
    }    

    function getBasedURL(file)
    {
        if (base && file)
            return base + "/" + file;
        else
            return file;
    }

    function getURLWithParams(obj)
    {
        var url = obj.url;
        if (obj.addvariables != undefined)
        {
            if (obj.addvariables.indexOf("AIMLUser") != -1)
            {
                checkAIMLVars();
            }
            // Only ask for ogv if we need it
            var f = false;
            for (var idChar in chars)
            {
				if (chars[idChar].idScene != idSceneCur) continue;
                var a = document.getElementById(idDiv + idChar + "Audio");
                if (!a.canPlayType("audio/mp3") && a.canPlayType("audio/ogg")) 
                    f = true;
                break;
            }
            url += ("&genogv=" + (f ? "true" : "false"));
            // Add other vars            
            var vars = obj.addvariables.split(",");
            for (var i = 0; i < vars.length; i++)
            {
                var x = ctl[vars[i]];
                var s = x == undefined ? "" : x.toString();
                if (x.length > 0) url += "&" + vars[i] + "=" + encodeURIComponent(s);
            }
        }
        return url;
    }

    // Create 3 special AIML variables as needed
    function checkAIMLVars()
    {
        var date = new Date();
        date.setTime(date.getTime()+(365*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
        var s;
        if (!ctl.AIMLUser)
        {
            if (s = readCookie("AIMLUser"))
            {
                ctl.AIMLUser = s;
                infoTrace("Returning with aimluser "+s);
            }
            else
            {
                s = "User";
                for (i = 0; i < 10; i++)
                    s += Math.floor(Math.random()*9) + 1;    //1-9
                infoTrace("Creating aimluser "+s);
                ctl.AIMLUser = s;
                createCookie("AIMLUser", s, 365);
            }
        }
        if (!ctl.AIMLSession) 
        {
            s = "Session";
            for (i = 0; i < 10; i++)
                s += Math.floor(Math.random()*9) + 1;    //1-9
            infoTrace("Creating aimlsession "+s);
            ctl.AIMLSession = s;
        }
        if (!ctl.AIMLSequence && ctl.AIMLSession) 
        {
            ctl.AIMLSequence = 1;
        }
        if (!ctl.AIMLTimezone) // This will get used in the future
        {
            var dt = new Date();
            ctl.AIMLTimezone = dt.getTimezoneOffset();
        }
    }

    function createCookie(name,value,days) 
    {
        if (days) 
        {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
        }
        else var expires = "";
        document.cookie = name+"="+value+expires+"; path=/";
    }

    function readCookie(name) 
    {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) 
        {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }    

    function filterDomain(s)
    {
        var tdom = "";
        var t = qualifyURL(base);
        if (t.substr(0,8)=="https://") {t = t.substr(8); tdom = t.substr(0, t.indexOf("/"));}
        else if (t.substr(0,7)=="http://") {t = t.substr(7); tdom = t.substr(0, t.indexOf("/"));}
        var sdom = "";
        var ssl = false;
        if (s.substr(0,8)=="https://") {var ss = s.substr(8); sdom = ss.substr(0, ss.indexOf("/")); ssl = true;}
        else if (s.substr(0,7)=="http://") {var ss = s.substr(7); sdom = ss.substr(0, ss.indexOf("/"));}
        debugTrace("project js coming from domain "+tdom+" and is requesting a url from domain "+sdom);
        if (sdom != "" && tdom != "" && sdom != tdom)
        {
            temparray = s.split(sdom);
            salt = temparray.join(tdom);
            //salt = temparray.join("www.x-in-y.com");
            debugTrace(" -> remapping "+s+" to "+salt);
            return salt;
        }    
        else return s;
    }
    
    function qualifyURL(url) 
    { 
        if (aQualify == null) aQualify = document.createElement('a'); 
        aQualify.href = url; 
        return aQualify.href; 
    } 

    function switchChars()
    {
        debugTrace("switchChars");
        if (charsToLoad.length > 0) errorTrace("code 4");
        charsToLoad = [];
        for (var idChar in chars)
        {
			if (chars[idChar].idScene != idSceneCur) continue;
            charsToLoad.push(idChar);
        }
        
        // Start things off
        if (charsToLoad.length > 0)
        {
            idChar = charsToLoad.pop();
            switchCharPart1(idChar)
        }
        else
        {
            onAllCharLoadsAndAudioComplete();
        }
    }
    
    function switchCharPart1(idChar)
    {
        debugTrace("switchCharPart1 "+idChar);
        var idMsg = chars[idChar].idMsg;
        var objMsg = getDirObjectFromId(idMsg);
        if (!objMsg) 
        {
            idCharLoading = idChar;
            onCharLoadComplete();
        }
        else if (objMsg.external)
        {    
			if (typeof jQuery != 'function')
			{
				errorTrace('jQuery required for external messages');
				return;
			}
			if (loadingExternalMsg())
			{
				infoTrace("Already have an outstanding server request! Ignoring.");
				return;
			}
			idCharExternal = idChar;
			idMsgExternal = idMsg;
			
			var s;
			s = filterDomain(getURLWithParams(objMsg));
			// AIMLSequence is appended automatically by loader if AIMLSession is present. If present, it
			// defeats caching of server requests.
			if (ctl.AIMLSequence)   
			{
				s += "&AIMLSequence=" + ctl.AIMLSequence;
				ctl.AIMLSequence++;
			}
			s += '&callback=?';
			infoTrace("Calling "+s);
			$.ajax({ url: s,
				data: {}, 
				dataType: "jsonp", 
				success: function(json) { 
					for (var id in json)
					{
						objExternal = json[id];
						objExternal.id = id;
						break;
					}
					switchCharPart2(idCharExternal, idMsgExternal);
					idCharExternal = null;
					idMsgExternal = null;
				}, 
				error: function() { 
					errorTrace("Error calling "+s);
					idCharLoading = null;
					idCharExternal = null;
					idMsgExternal = null;
					ctl.Presenting = false;
				} 
			});
        }
        else
        {
            objExternal = null;
            switchCharPart2(idChar, idMsg);
        }
    }
    
    function loadingExternalMsg() {return idCharExternal != null;}
    
    function switchCharPart2(idChar, idMsg)
    {
        debugTrace("switchCharPart2 "+idChar+","+idMsg);
    
        var objMsg = getDirObjectFromId(idMsg);
        var obj;
        if (objMsg.idle == true)
        {
            obj = objMsg;
        }
        else if (objMsg.external)
        {
            obj = objExternal;
        }
        else
        {
            obj = objMsg;
        }
        
		if (ctl.Presenting) // Button set explicitly not cleared when entering idle
		{
			layoutButtonSet(obj, getButtonSetForCharacter(idChar));
		}
		
        var objChar = getDirObjectFromId(objMsg.character);

        // Loading begins - continues in the case of audio - only one scene or char loads at a time - chars in multi-char scenes will load one at a time
        idCharLoading = idChar;

        // Do we need a composition canvas? We do if we are going to draw from bitmaps, then scale
        if (!chars[idChar].charCanvas && objChar.mode == "replace" && objChar.width != objChar.artwidth)
        {
            chars[idChar].charCanvas = document.createElement('canvas'); 
            chars[idChar].charCanvas.height = objChar.artheight; 
            chars[idChar].charCanvas.width = objChar.artwidth; 
            chars[idChar].cyCharTop = 0;
            chars[idChar].cxCharLeft = 0;
        }

        nImgLoading = 1;    // start off as one, then decrement it down below, as objects may load very quickly - as soon as src is set - if they were loaded before
                
        // Free old images
        recycleImageHashContents(chars[idChar].aImg);
        chars[idChar].aImg = null;
                        
        // Load the images
        aImg = {};
        if (obj && obj.onframe && obj.onframe["0"])
        {
            // makes a series of load calls
            urlExternal = objMsg.external ? filterDomain(objMsg.url) : null; // in load, urlExternal indicates that the file is in cshtml
            idMsgEval = idMsg;
            idCharEval = idChar;
            c = ctl;
            eval(obj.onframe["0"]);
            c = null;
            idMsgEval = null;
            idCharEval = null;
            urlExternal = null;
        }
        
        debugTrace("By the way, char "+idChar+" is loading:");
        for (i in aImg)
        {
            debugTrace(i + ": " + (isVector(aImg[i]) ? aImg[i].digest : aImg[i].src));
        }
        
        nImgLoading--;
        
        // Need this for the rare case where everything loads instantly.
        if (nImgLoading == 0)
            onCharLoadComplete();
    }    
    
    function startAudioLoad()
    {
        debugTrace("startAudioLoad");
        for (idChar in chars)
        {
			if (chars[idChar].idScene != idSceneCur) continue;
            var idMsg = chars[idChar].idMsgNext;
            if (idMsg == null) idMsg = chars[idChar].idMsg; // start case?
            if (idMsg)
            {
                var objMsg = getDirObjectFromId(idMsg);
                var file;
                var altfile;
                if (objMsg.external)
                {
					// Prefetch audio - cs knows how to handle two near-concurrent requests properly
					var s = getURLWithParams(objMsg);
					if (ctl.AIMLSequence)   
					{
						s += "&AIMLSequence=" + ctl.AIMLSequence;   // but don't increment
					}
					file = filterDomain(s + '&MP3Prefetch=true'); // Prefetch param is for cs.exe
					altfile = filterDomain(s + '&OGVPrefetch=true');
                }
                else
                {
                    file = getBasedURL(objMsg.file);
                    altfile = getBasedURL(objMsg.altfile);
                }
            
				startAudioLoadActual(idChar, file, altfile);
            }
        }
    }

	function startAudioLoadActual(idChar, file, altfile)
	{
		var a = document.getElementById(idDiv + idChar + "Audio");
		if (!android && !iPhone && !iPad && !a.canPlayType("audio/mp3") && a.canPlayType("audio/ogg")) 
			file = altfile;
		if (file)
		{
			if (chars[idChar].loadingAudio)
			{
				// We must have started it earlier
			}
			else
			{
				a.autoplay = true;  // but we'll pause it as soon as it is ready
				debugTrace("a.src="+file);
				a.src = file;
				debugTrace("a.load");
				a.load();
				chars[idChar].loadingAudio = true;
			}
		}
		else
		{
			// Case of no audio specified - be sure to set all things that an audio load would normally set, as we won't get those events.
			tLastReported = 0;
			tOfLastReport = (new Date()).getTime();
			chars[idChar].loadingAudio = false;
		}
	}

    function getCSHTMLURL(csurl, file)
    {
        // localhost/cs/cs.exe + foo.png -> // localhost/csdata/foo.png
        var i = csurl.indexOf("cs.exe")
        if (i != -1)
            return csurl.substr(0,i-1) + "html/" + file;
        else 
            return null;
    }
    
    function onImgLoadComplete()
    {
        // Called when one of our png images has loaded
        nImgLoading--;
        debugTrace("onImgLoadComplete - " + nImgLoading + " queued so far");
        if (idSceneLoading && nImgLoading == 0)
            onSceneLoadComplete();
        else if (idSlideLoading && nImgLoading == 0)
            onSlideLoadComplete();
        else if (idCharLoading && nImgLoading == 0)
            onCharLoadComplete();
    }

    function isVector(o) {return typeof o == 'object' && o.hasOwnProperty('msvector');}
    
    this.aVectorLoaded = function()
    {
           nAudio = audioFilesLoading();
        // When a vector script is attached during loading phase, it sets the top level variable msXXX to the json, then call this fn
        // Note: called when *a* vector image has loaded - not even necessarily from our embedding!
        for (var id in aImg)
        {
            var img = aImg[id];
            if (isVector(img) && img.data == null)
            {
                // Is it now loaded?
                img.data = window["MS"+img.digest];
                if (img.data)
                {
                    // Yes!
                    nImgLoading--;
                    debugTrace("aVectorLoaded - " + nImgLoading + " queued so far");
                }                    
            }
        }
        if (idSceneLoading && nImgLoading == 0)
            onSceneLoadComplete();
        else if (idSlideLoading && nImgLoading == 0)
            onSlideLoadComplete();
        else if (idCharLoading && nImgLoading == 0)
            onCharLoadComplete();
    }
    
    function audioFilesLoading()
    {
        nAudio = 0;
        for (idChar in chars)
        {
			if (chars[idChar].idScene != idSceneCur) continue;
            if (chars[idChar].loadingAudio) nAudio++;
        }
        return nAudio;
    }
    
    function onAudioLoadComplete(idChar)
    {
        chars[idChar].loadingAudio = false;
        var nAudio = audioFilesLoading();
        debugTrace("onAudioLoadComplete " + idChar + " - " + nAudio + " audio files left to load, interrupting()="+interrupting());
        if (charsToLoad.length == 0 && idCharLoading == null && nAudio == 0 && !interrupting())
        {
            onAllCharLoadsAndAudioComplete();
        }
    }
	
	function interrupting()
    {
        for (var idChar in chars)
        {
            if (chars[idChar].idMsgNext)
                return true; // We either are, or will be soon, returning to default pose
        }
        return false;
    }	

    function onCharLoadComplete()
    {
        var idChar = idCharLoading;
        debugTrace("onCharLoadComplete "+idChar);
        idCharLoading = null;

        // Only one thing load at a time, but when we are done, since character actually consume these
        // resources during several frames, we need to save aImg off as character state.
        chars[idChar].aImg = aImg;
        aImg = {};
        chars[idChar].aImgShow = [];

        // Reset animation complete flag as we are ready to start playing
        chars[idChar].started = false;
        chars[idChar].complete = false;
        chars[idChar].fRecovering = false;
        chars[idChar].action = "";
        chars[idChar].fStopReached = false;
        
        if (charsToLoad.length > 0)
        {
            idChar = charsToLoad.pop();
            switchCharPart1(idChar)
        }
        else
        {
               var nAudio = audioFilesLoading();
            if (nAudio == 0)
                onAllCharLoadsAndAudioComplete();
        }
    }
    
    function onAllCharLoadsAndAudioComplete()
    {
        debugTrace("onAllCharLoadsAndAudioComplete");
    
        // Frame 1 of the message lasts from time *now* until 1/fps seconds. All images were
        // added initially hidden, and we count on prerunning frame 1 right now, before the
        // smooth switch. Then, after eg. 83 ms, we will run frame 2.
        
        eventHorizon = -1;
        fireEvents(0);  // Establish 0 as having been done - load are ignored now

        idCharLoading = null;
        
        // REVIEW - assumes this is the only character!!!!!
        
        hideSpinner();    
        
		// It could be that, after getting all this ready to go, we changed our focus, and now we get to start all over again
		changingFocus = false;
		if (deferFocusChanged)
		{
			debugTrace("(resuming deferred focusChanged)");
			deferFocusChanged = false;
			focusChanged();
			return;
		}
		
        // This starts event generation for this message/idle
        if (ctl.Presenting) 
        {
            // Start them all off at once
            for (idChar in chars)
			{
				if (chars[idChar].idScene != idSceneCur) continue;			
                var a = document.getElementById(idDiv + idChar + "Audio");
                debugTrace("a.play()");
                a.play();        
            }
        }
        else
        {
            // When going idle, must actively pause any audio or else timeupdate events will mess up the idle
            for (idChar in chars)
            {
				if (chars[idChar].idScene != idSceneCur) continue;
                var a = document.getElementById(idDiv + idChar + "Audio");
                debugTrace("a.pause()");
                a.pause();        
            }
        }
        
        tLastReported = 0;    
        tOfLastReport = (new Date()).getTime();
    }

    function switchScene()
    {
        debugTrace("switchScene()");
        
        showSpinner();
    
        // Loading begins - only one scene or char loads at a time 
        idSceneLoading = idSceneCur;
    
        // Load images. Also load the idle msg for each character - up to the first frame. Reuse as much of the character load mechanism as possible.
        nImgLoading = 1;    // See comments in switchChar re instant loads
        aImg = {};
        startLoadsRec(getDirObjectFromId(idSceneLoading));
        debugTrace("By the way, scene is loading:");
        for (var j in aImg)
        {
            debugTrace(j + ": " + (isVector(aImg[j]) ? aImg[j].digest : aImg[j].src));
        }
        // See comments in switchChar re instant loads
        nImgLoading--;
        if (nImgLoading == 0)
            onSceneLoadComplete();
    }    

    var imgPool = [];
    var imgTemp;
    
    function allocImage(src)
    {
        var img;
        var i;
        
        // Use src as a hint - img may already be present
        if (src)
        {
            for (i = 0; i < imgPool.length; i++)
            {
                if (imgPool[i].src == src)
                {
                    debugTrace("("+src+" already in-mem)");
                    img = imgPool[i];
                    imgPool.splice(i, 1);
                    return img;
                }
            }
        }
        // Next try to reuse the oldest bitmap
        if (imgPool.length > 0)
        {
            img = imgPool.shift();  
            img.src = "";   // clear as it goes out
            img.data = null;
            return img;
        }
        // If we are still here then just allocate one
        return new Image();
    }
    
    function freeImage(img)
    {
        img.onload = null;
        //img.src = "";
        //img.data = null;
        imgPool.push(img);
    }

    function recycleImageHashContents(hash)
    {
        for (var id in hash)
        {
            freeImage(hash[id]);
            delete(hash[id]);
        }
    }
    
    // Updates aImg/nImgLoading with loads for parent
    function startLoadsRec(parent)
    {
        for (var objid in parent.items)
        {
            var obj = parent.items[objid];
            if (obj.type == "image")
            {
                var url = getBasedURL(obj.file);
                aImg[objid] = allocImage(null);
                aImg[objid].onload = function(){onImgLoadComplete();}
                nImgLoading++;
                aImg[objid].src = url;
            }
            else if (obj.type == "button")
            {
                var a = ["backfile", "backoverfile", "backdownfile", "backdisabledfile", "backchosenfile", 
                         "forefile", "foreoverfile", "foredisabledfile", "forechosenfile"];
                for (var i = 0; i < a.length; i++)
                {
                    if (obj[a[i]])
                    {
                        aImg[objid+a[i]] = allocImage(null);
                        aImg[objid+a[i]].onload = function(){onImgLoadComplete();}
                        nImgLoading++;
                        aImg[objid+a[i]].src = getBasedURL(obj[a[i]]);
                    }
                }
            }
            else if (obj.type == "character" && !obj.narrator)
            {
                var idMsg = getIdleId(objid);
                var msg = getDirObjectFromId(idMsg);
                loadTo = 1;
                idCharEval = objid;
                idMsgEval = idMsg;
                c = ctl;
                eval(msg.onframe["0"]);
                c = null;
                idCharEval = null;
                idMsgEval = null;
                loadTo = 0;
            }
            else if (obj.type == "grid")
            {
                startLoadsRec(obj);
            }
            else if (obj.type == "slideshow")
            {
                var slide = obj.items[idSlideCur];
                if (slide) startLoadsRec(slide);
            }
        }    
    }
            
    function onSceneLoadComplete()
    {
        debugTrace("onSceneLoadComplete "+idSceneCur);
        assert(idSceneCur == idSceneLoading);
        idSceneLoading = null;
        
        hideSpinner();
        
        // Updated the enabled/disabled state of all buttons
        updateNavButtons();

        // Assign all loaded images where they belong
        finishLoadsRec(dirRoot.items[idSceneCur]);
    
        // Show the scene
        var dom;
        if (idScenePrev)
        {
            dom = document.getElementById(idDiv + idScenePrev + 'Div');
            dom.style.display = 'none';
        }
        dom = document.getElementById(idDiv + idSceneCur + 'Div');
        dom.style.display = 'block';
        /*CH*/if (ctl.Preview) document.getElementById(idDiv + 'PreviewDiv').style.display = 'block';
		snapToParent(idSceneCur);
        execOnShow(idSceneCur);
		gridOnShow(idSceneCur);
                        
        // Load AND RENDER complete - release aImg now for use by animation phase
        // Note - we didn't actually use these images, but having an instance in memory
        // makes the load of the second one almost instantaneous. (In the case of the first
        // frame of the character we actually did use the image, but the visual in now in the canvas).
        aImg = {};
        
        // Show the slide
        if (idSlideCur)
        {
			snapToParent(idSlideCur);
            execOnShow(idSlideCur);
            dom = document.getElementById(idDiv + idSlideCur + 'Div');
            dom.style.display = 'block';
        }
        
        // Set the step
        if (idStepCur)
        {
            execOnShow(idStepCur);
        }
        
        idScenePrev = null;
        idSlidePrev = null;
        idStepPrev = null;
        
        // Now start loading character message
        if (!startShield)
        {
            switchChars();
        }
    }

    function gridOnShow(id)
    {
        var obj = getDirObjectFromId(id);
        for (var objid in obj.items)
        {
            var child = obj.items[objid];
			if (child.type == "grid")  execOnShow(child.id);
		}
	}
	
    function snapToParent(id)
    {
        var obj = getDirObjectFromId(id);
        for (var objid in obj.items)
        {
            var child = obj.items[objid];
			if (child.snaptoparent) 
			{
				ctl.setPosition(child.id, 0, 0);
				ctl.setSize(child.id, ctl.getWidth(obj.parent.id), ctl.getHeight(obj.parent.id));
			}
		}	
	}	

    function execOnShow(id)
    {
        debugTrace("execOnShow "+id);
        var obj = getDirObjectFromId(id);
        var cmd = obj.onshow;
        if (cmd)
        {
            debugTrace("Executing onshow: "+cmd);
            c = ctl;
            eval(cmd);
            c = null;
        }
    }
    
    function finishLoadsRec(parent)
    {
        debugTrace("finishLoadsRec "+parent.id);
        for (var objid in parent.items)
        {
            var obj = parent.items[objid];
            if (obj.type == "image")
            {
                var domimg = document.getElementById(idDiv + objid + 'Div');
                //domimg.src = getBasedURL(obj.file); - leave for now - the simple way to do images that does everything everything except cropping
                var o = cropHelper(obj);
                domimg.style.background = 'url('+getBasedURL(obj.file)+') -'+o.cxLeft+'px -'+o.cyTop+'px no-repeat';
                domimg.style.backgroundSize = obj.width+'px '+obj.height+'px'; 
            }
            else if (obj.type == "button")
            {
                updateButton(objid);
            }
            else if (obj.type == "character" && !obj.narrator)
            {
                var idMsg = getIdleId(objid);
                var msg = getDirObjectFromId(idMsg);
                resetCharOpts(objid);
                
                // We are reusing redrawChar to draw the first frame as part of the scene render - but draw code expects this in the character array.
                // Create a temporary character aImg with just the pieces we need.
                chars[objid].aImg = {};
                chars[objid].aImgShow = [];
                for (var id in aImg)
                {
                    if (idMsg == id.substr(0,idMsg.length))
                        chars[objid].aImg[id] = aImg[id];
                }
                
                idCharEval = objid;
                idMsgEval = idMsg;
                c = ctl;
                eval(msg.onframe["1"]);
                c = null;
                idCharEval = null;
                idMsgEval = null;
                if (fRedraw) redrawChar(objid, idMsg);
                
                // Do we need a composition canvas? We do if we are going to draw from bitmaps, then scale
                if (obj.mode == "replace" && obj.width != obj.artwidth)
                {
                    chars[objid].charCanvas = document.createElement('canvas'); 
                    chars[objid].charCanvas.height = obj.artheight; 
                    chars[objid].charCanvas.width = obj.artwidth; 
                    chars[objid].cyCharTop = 0;
                    chars[objid].cxCharLeft = 0;
                }
                        
                if (chars[objid].charCanvas) stretchChar(objid);
                
                recycleImageHashContents(chars[objid].aImg);
                chars[objid].aImg = null;
                chars[objid].aImgShow = null;
            }
            else if (obj.type == "grid")
            {
                finishLoadsRec(obj);
            }
            else if (obj.type == "slideshow")
            {
                // Temp Simplification - when loading a scene, assume the first slide is visible
                var slide;
                for (var test in obj.items)
                {
                    slide = obj.items[test];
                    break;
                }
                if (slide) finishLoadsRec(slide);
            }
        }
    }
    
    // switchSlide and onSlideLoadComplete are very similar to switchScene and onSceneLoadComplete, and reuse same helpers.
    function switchSlide()
    {
        debugTrace("switchSlide()");
        
        showSpinner();
    
        // Loading begins - only one scene, slide, or char loads at a time 
        assert(!idSceneLoading && !idSlideLoading && !idCharLoading);
        idSlideLoading = idSlideCur;
    
        // Load images. Reuse as much of the character load mechanism as possible, but note that slides cannot have characters, so they stay untouched.
        nImgLoading = 1;    // See comments in switchChar re instant loads
        aImg = {};
        startLoadsRec(getDirObjectFromId(idSlideCur));
        debugTrace("By the way, slide is loading:");
        for (var j in aImg)
        {
            debugTrace(j + ": " + aImg[j].src);
        }
        // See comments in switchChar re instant loads
        nImgLoading--;
        if (nImgLoading == 0)
            onSlideLoadComplete();
    }    
    
    function onSlideLoadComplete()
    {
        debugTrace("onSlideLoadComplete "+idSlideCur);
        assert(idSlideLoading == idSlideCur);
        idSlideLoading = null;
        
        hideSpinner();
        
        // Assign all loaded images where they belong
        var slideobj = getDirObjectFromId(idSlideCur);
        finishLoadsRec(slideobj);

        var div1 = idSlidePrev ? document.getElementById(idDiv + idSlidePrev + 'Div') : null;
        var div2 = document.getElementById(idDiv + idSlideCur + 'Div');
    
        // Show the slide
		snapToParent(idSlideCur);
        execOnShow(idSlideCur);
		gridOnShow(idSlideCur);
        var tran = slideobj.transition;
        if (tran == "cross" && !idSlidePrev) 
            tran = "simple";
        if (tran == "cross")
        {
            crossfade(div1, div2, 500)
        }
        else if (tran == "simple")
        {
            if (div1) div1.style.display = 'none';
            fadein(div2, 500)
        }
        else
        {
            if (div1) div1.style.display = 'none';
            div2.style.display = 'block';
        }
                        
        aImg = {};
        
        idScenePrev = null;
        idSlidePrev = null;
        idStepPrev = null;
        
        checkAllComplete();
    }    

    function fadeout(obj, cms)
    {
        fade = {from:obj, to:null, cms:cms, tStart:(new Date()).getTime()};
        aFade.push(fade);
        if (!fading) doFades();
    }

    function fadein(obj, cms)
    {
        fade = {from:null, to:obj, cms:cms, tStart:(new Date()).getTime()};
        aFade.push(fade);
        if (!fading) doFades();
    }
    
    function crossfade(obj1, obj2, cms)
    {
        fade = {from:obj1, to:obj2, cms:cms, tStart:(new Date()).getTime()};
        aFade.push(fade);
        if (!fading) doFades();
    }
    
    function doFades()
    {
        var tNow = (new Date()).getTime();
        var stillgoing = false;
        for (var i = 0; i < aFade.length; i++)
        {
            var obj1 = aFade[i].from;
            var obj2 = aFade[i].to;
            var pcnt = (tNow - aFade[i].tStart) / aFade[i].cms;
            if (pcnt < 1) 
            {
                if (obj1) obj1.style.display = 'block';
                if (obj2) obj2.style.display = 'block';
                if (obj1) obj1.style.opacity = 1 - pcnt;
                if (obj2) obj2.style.opacity = pcnt;
                //debugTrace(obj1+" alpha="+(1-pcnt));
                //debugTrace(obj2+" alpha="+pcnt);
                stillgoing = true;
            }
            else
            {
                if (obj1) obj1.style.display = 'none';
                if (obj2) obj2.style.display = 'block';
                //debugTrace(obj1+" visible=false");
                //debugTrace(obj2+" visible=true");
                aFade.splice(i,1);
                i--;
            }
        }
        if (stillgoing) 
            setTimeout(function(){doFades()}, 1000/30);  // 30 fps for fades 
        else
            fading = false;
    }

    function updateButton(idBtn)
    {
        var obj = getDirObjectFromId(idBtn);
        
        // "backfile", "backoverfile", "backdownfile", "backdisabledfile", "backchosenfile", "forefile", "foreoverfile", "foredisabledfile", "forechosenfile"
        var b = "backfile";
        var f = "forefile";
        var left = obj.xfore;
        var top = obj.yfore;
        var fHide = false;
        var test;
        var test2;
        if (obj.disabled) 
        {
            if (obj.hideondisabled)
            {
                fHide = true;
            }
            else
            {
                // disabled state - use disabled images if specified
                test = "backdisabledfile";
                if (obj[test]) b = test;
                test = "foredisabledfile";
                if (obj[test]) f = test;
            }
        }
        else if (obj.chosen) 
        {
            // chosen state - use chosen images if specified, and if not, use the down image
            test = "backchosenfile";
            test2 = "backoverfile";
            if (obj[test]) b = test;
            else if (obj[test2]) b = test2;
            test = "forechosenfile";
            test2 = "foredownfile";
            if (obj[test]) f = test;
            else if (obj[test2]) f = test2;
        }
        else if (obj.over && !obj.down) 
        {
            test = "backoverfile";
            if (obj[test]) b = test;
            test = "foreoverfile";
            if (obj[test]) f = test;
        }
        else if (obj.over && obj.down) 
        {
            test = "backdownfile";
            if (obj[test]) b = test;
            test = "foreoverfile";
            if (obj[test]) f = test;
            left = parseInt(obj.xfore) + parseInt(obj.xdown);
            top = parseInt(obj.yfore) + parseInt(obj.ydown);
        }
        var btn = document.getElementById(idDiv + idBtn + 'Div');
        btn.style.display = fHide ? 'none' : 'block';        
        var back = document.getElementById(idDiv + idBtn + 'Back');
        if (obj[b]) back.src = getBasedURL(obj[b]);
        var fore = document.getElementById(idDiv + idBtn + 'Fore')
        if (fore) 
        {
            if (obj[f]) fore.src = getBasedURL(obj[f]);
            fore.style.left = left+'px'; // offset applies to text as well
            fore.style.top = top+'px';
        }
    }

    //
    // Navigation logic
    //
    
    function dumpState()
    {
        debugTrace("  Focus="+ctl.Focus+" Presenting="+ctl.Presenting+" Paused="+ctl.Paused+" Muted="+ctl.Muted);
        for (idChar in chars)
        {
			if (chars[idChar].idScene != idSceneCur) continue;
            debugTrace("  Char "+idChar+" idMsg="+chars[idChar].idMsg+" idMsgNext="+chars[idChar].idMsgNext);
        }
        debugTrace("  idSceneCur="+idSceneCur+" idSlideshowCur="+idSlideshowCur+" idSlideCur="+idSlideCur+" idSequenceCur="+idSequenceCur+" idStepCur="+idStepCur);
        debugTrace("  idSceneLoading="+idSceneLoading+" idSlideLoading="+idSlideLoading+" idCharLoading="+idCharLoading);
    }

    // Focus may be set to a scene, slide, step, or presentation. Given that Focus is set, 
    // resetStateFromFocus will adjust idSceneCur, idSlideCur, etc.

    function resetStateFromFocus()
    {
        debugTrace("resetStateFromFocus");
        idScenePrev = idSceneCur;         
        idSlidePrev = idSlideCur;
        idStepPrev = idStepCur;
        idMsgDeferred = null;
        idSlideDeferred = null;
        idStepDeferred = null;
        resetStateFromFocusInt();
        
        // Still on the user thread - now is the earliest that we know the filename of the new message.
        startAudioLoad();
        
        dumpState();
        updateNavButtons();
    }

    function resetStateFromFocusInt()
    {
        debugTrace("resetStateFromFocusInt");
        var t;
        
        // Given a change to Focus, update scene, slide, presentation node as appropriate
        var objFocus = getDirObjectFromId(ctl.Focus);
        if (objFocus == null) 
        {
            errorTrace("Invalid Focus value " + ctl.Focus+  " - ignoring!"); 
            ctl.Presenting = false; 
            return;
        }
        var type = objFocus.type;
        
        // What we do depends on what takes the focus
        if (type == "scene") 
        {
            idSceneCur = ctl.Focus; 
            idSlideshowCur = getFirstItemOfTypeIn("slideshow", idSceneCur);
            idSlideCur = idSlideshowCur ? (idSlideDeferred ? idSlideDeferred : getFirstItemOfTypeIn("slide", idSlideshowCur)) : null;
            if (idSlideCur) 
            {
                ctl.Focus = idSlideCur; 
                debugTrace("Focus moved in to "+ctl.Focus);
                idSlideDeferred = null;
            }
            idSequenceCur = getFirstItemOfTypeIn("sequence", idSlideCur ? idSlideCur : idSceneCur);
            idStepCur = idSequenceCur ? (idStepDeferred ? idStepDeferred : getFirstItemOfTypeIn("step", idSequenceCur)) : null;
            if (idStepCur != null) 
            {
                ctl.Focus = idStepCur;        
                debugTrace("Focus moved in to "+ctl.Focus);
                idStepDeferred = null;
            }
            resetCharacterMessages(); // is aware of idMsgDeferred
            if (idMsgDeferred) 
            {
                ctl.Focus = idMsgDeferred; 
                idMsgDeferred = null;
            }
        }
        else if (type == "slide") 
        {
            var id = getContainingElementOfTypeId("scene", ctl.Focus);
            if (id && id != idSceneCur)    // Case of a jump to a slide in another scene
            {
                idSlideDeferred = ctl.Focus;    // hang onto this slide for later
                ctl.Focus = id;                // and pretend we came in with the slide focus instead
                return resetStateFromFocusInt();
            }
            idSlideCur = ctl.Focus; 
            idSequenceCur = getFirstItemOfTypeIn("sequence", idSlideCur);
            idStepCur = idSequenceCur ? (idStepDeferred ? idStepDeferred : getFirstItemOfTypeIn("step", idSequenceCur)) : null;
            if (idStepCur) 
            {
                ctl.Focus = idStepCur;
                debugTrace("Focus moved in to "+ctl.Focus);
                idStepDeferred = null;
            }
            resetCharacterMessages(); // is aware of idMsgDeferred
        }
        else if (type == "step") 
        {
            var id = getContainingElementOfTypeId("slide", ctl.Focus);
            if (id && id != idSlideCur)
            {
                idStepDeferred = ctl.Focus;
                ctl.Focus = id;
                return resetStateFromFocusInt();    // case of jump to step in another slide
            }
            id = getContainingElementOfTypeId("scene", id);
            if (id && id != idSceneCur)
            {
                idStepDeferred = ctl.Focus;
                ctl.Focus = id;
                return resetStateFromFocusInt();    // case of jump to step in another scene
            }
            idStepCur = ctl.Focus; 
            /*
            // Special case of prev into a slide w/ a sequence
            var t = n.parentNode.parentNode; 
            if (t.nodeName == "slide") 
            {
                SlideNode = t; SequenceNode = n.parentNode;
            } 
            */
            resetCharacterMessages();
        }
        else if (type == "message" || type == "dialog") 
        {
            var id = getContainingElementOfTypeId("step", ctl.Focus);
            if (id && id != idStepCur)
            {
                idMsgDeferred = ctl.Focus;
                ctl.Focus = id;
                return resetStateFromFocusInt(); // case of jump to presentation in other step
            }
            id = getContainingElementOfTypeId("slide", ctl.Focus);
            if (id && id != idSlideCur)
            {
                idMsgDeferred = ctl.Focus;
                ctl.Focus = id;
                return resetStateFromFocusInt(); // case of jump to presentation in other slide
            }
            id = getContainingElementOfTypeId("scene", ctl.Focus);
            if (id && id != idSceneCur) 
            {
                idMsgDeferred = ctl.Focus;
                ctl.Focus = id;
                return resetStateFromFocusInt();   // case of jump to presentation in other scene
            }
            // if we get here we have a simple movefocus to a different presentation - use idMsgDeferred to
            // trick resetCharacterMessages into going straight to that message - after all, focus is in current 
            // step, slide, or scene.
            idMsgDeferred = ctl.Focus;
            resetCharacterMessages();
        }
        else 
        {
            debugTrace("Invalid Focus value - ignoring!"); 
            return;
        }
    }

    // We have just entered a scene/slide/step - reset char messages. This is where things can be complex, but
    // by default we take the first one.
    function resetCharacterMessages()
    {
        debugTrace("resetCharacterMessages");
        var fAllIdle = true;
        
        for (idChar in chars)
        {
			if (chars[idChar].idScene != idSceneCur) continue;
            var idMsgNext = null;
            // Given that a scene, slide, or step has changed, reset chars[idChar].idMsg for each character
            if (!ctl.Presenting)
            {
                idMsgNext = getIdleId(idChar);
            }
            else
            {
                if (idStepCur) 
                    idMsgNext = getActiveMessageIn(idStepCur, idChar); // Is aware of idMsgDeferred
                else if (idSlideCur) 
                    idMsgNext = getActiveMessageIn(idSlideCur, idChar); // Is aware of idMsgDeferred
                else if (idSceneCur) 
                    idMsgNext = getActiveMessageIn(idSceneCur, idChar); // Is aware of idMsgDeferred
        
                // If we say Presenting=true but focus has no presentation, e.g a slide with no presentation, then just go idle
                if (idMsgNext == null) 
                {
                    debugTrace(idChar + ": Tried to present, but no active presentations - going idle");
                    idMsgNext = getIdleId(idChar);
                } 
                else 
                {
                    fAllIdle = false;
                }
            }
            // idMsg does not EVER get reset from non-null to null except when it truly ends - store next msg in idMsgNext
            if (!chars[idChar].idMsg)
                chars[idChar].idMsg = idMsgNext;
            else 
                chars[idChar].idMsgNext = idMsgNext;
        }
        idMsgDeferred = null;
        if (fAllIdle)
        {
            ctl.Presenting = false;
        }
        // Principle: when presenting, focus is on the message or dialog - when idle it is on the containing step/slide/scene
        /* ????
        if (CharacterNodes.length > 0)
        {
            n = PresentationNodes[0];
            if (n.parentNode.nodeName == "dialog") n = n.parentNode;
            if (n != null)
            {
                if (Presenting == "true")
                    Focus = n.attributes.id;
            }
        }    
        */
    }

    function getActiveMessageIn(idParent, idChar)
    {
        // Returns first non-idle presentation in container, that is marked for given char (or use idMsgDeferred if it is non-null)
        var parent = getDirObjectFromId(idParent);
        var idRet = null;
        for (var id in parent.items)
        {
            var obj = parent.items[id];
            if (obj.type == "message" && obj.character == idChar && !obj.idle) 
            {
                // If we hit a deferred message, always return that
                if (id == idMsgDeferred) 
                {
                    return id;
                }
                // Message may have a condition
                var ok = true;
                if (obj.condition)
                {
                    c = ctl;
                    ok = eval(obj.condition);
                    c = null;
                    debugTrace("eval(" + obj.condition + ") is " + ok);
                }
                // pickup first presentation who's condition is satisfied - but check them all, in case we hit deferredPresentation
                if (ok && !idRet) idRet = id; 
            }
            else if (obj.type == "dialog" && (idMsgDeferred == null || idMsgDeferred == id)) // tunnel into first dialog, or named dialog
            {
                idRet = getActiveMessageIn(id, idChar); // even if idMsgDeferred == id, it won't mess up this one recursion
                break;
            }
        }
        return idRet; // can return null
    }
    
    function checkDialogMessage(idTest, idChar)
    {
        // Returns first non-idle presentation in container, that is marked for given char (or use idMsgDeferred if it is non-null)
        var parent = getDirObjectFromId(idTest);
        if (parent.type != "dialog") return idTest;
        for (var id in parent.items)
        {
            if (parent.items[id].character == idChar) 
                return id;
        }
        return null;
    }

    //
    // Find next/previous/first focus
    //

    function getNextFocus()
    {
        var obj;
        if (idStepCur)
        {
            obj = getNextItem(getDirObjectFromId(idStepCur));
            if (obj) return obj.id; // else fall thru to slide
        }
        if (idSlideCur)
        {
            obj = getNextItem(getDirObjectFromId(idSlideCur));
            if (obj) return obj.id; // else fall thru to scene
        }
        if (idSceneCur && !dirRoot.focusisland)
        {
            obj = getNextItem(getDirObjectFromId(idSceneCur));
            if (obj) return obj.id;
        }
        return null;
    }

    function getPrevFocus()
    {
        var obj;
        if (idStepCur)
        {
            obj = getPrevItem(getDirObjectFromId(idStepCur));
            if (obj) return obj.id; // else fall thru
        }
        if (idSlideCur)
        {
            obj = getPrevItem(getDirObjectFromId(idSlideCur));
            // Moving back need to be careful to step into last slide/step
            var test = lastItemInFirstChildOfType("sequence", obj); 
            if (test) obj = test;
            if (obj) return obj.id; // else fall thru
        }
        if (idSceneCur && !dirRoot.focusisland)
        {
            obj = getPrevItem(getDirObjectFromId(idSceneCur));
            // Moving back need to be careful to step into last slide/step!
            var test = lastItemInFirstChildOfType("slideshow", obj); 
            if (test) obj = test;
            test = lastItemInFirstChildOfType("sequence", obj); 
            if (test) obj = test;
            if (obj) return obj.id;
        }
        return null;
    }

    function getFirstFocus()
    {
        var ret = null;
        if (!dirRoot.focusisland) ret = getFirstItemOfTypeInObj("scene", dirRoot);
        else if (idSlideshowCur != null) ret = getFirstItemOfTypeIn("slide", idSlideshowCur);
        else if (idSequenceCur != null) ret = getFirstItemOfTypeIn("step", idSequenceCur);
        return ret;
    }

    // Called when the focus/presenting changes by external means, by a button, or an embedded command, such as a next() near the end of the message.
    function focusChanged()
    {
		if (changingFocus) 
		{
			debugTrace("(focusChanged deferred)");
			deferFocusChanged = true;
			return;
		}
        debugTrace("focusChanged");
		changingFocus = true;
		
        var scene = idSceneCur;
        var slide = idSlideCur;
        var step = idStepCur;

        // In all cases, if we are still playing audio, we should stop
        for (idChar in chars)
        {
			if (chars[idChar].idScene != idSceneCur) continue;
            if (!ctl.Presenting)
            {
                var a = document.getElementById(idDiv + idChar + "Audio");
                if (a) 
                {
                    debugTrace("a.pause");
                    a.pause();
                }
            }
        }
        
        // This will not change the idMsg of a char - but it will likely set the idMsgNext, which is the
        // trigger to the char to smoothly halt.
        resetStateFromFocus();
        
        // Make the least change necessary to accomplish the focus change
        if (idSceneCur != scene)
        {
            // Note we do NOT wait for the character to recover here. The desired behavior is to freeze this frame, 
            // possibly do a transition into new scene. Nav buttons will switch anyway.
            switchScene();
        }
        else if (idSlideCur != slide)
        {
            // Slide switches immediately, WHILE char is recovering - this is key
            switchSlide()
            updateNavButtons();
        }
        else if (idStepCur != step)
        {
            // Ditto with steps.
            updateNavButtons();
        }
        if (idStepCur)
        {
            execOnShow(idStepCur);
        }
		
		checkAllComplete();
		
        // Now we will wait for a rec() and ultimately a stop(), then restart on a timer, and then only, if all are complete, start 
        // the new message. 
		
    }
    
    //
    // Update enabled state of buttons with behavior
    //
    
    // Call this if properties may have changed that button behaviors care about
    function updateNavButtons()
    {
        debugTrace("updateNavButtons");
        updateNavButtonsRec(dirRoot);
    }

    function updateNavButtonsRec(parent)
    {
        for (id in parent.items)
        {
            obj = parent.items[id];
            if (obj.type == "button")
            {
                var b = obj.behavior;
                if (b)
                {
                    switch(b)
                    {
                    case "start":
                        obj.disabled = ctl.Presenting;
                        break;
                    case "stop":
                        obj.disabled = !ctl.Presenting;
                        break;
                    case "next":
                        obj.disabled = (getNextFocus() == null);
                        break;
                    case "previous":
                    case "first":
                        obj.disabled = (getPrevFocus() == null);
                        break;
                    case "back":
                        //obj.disabled = (history.length <= 1);
                        break;
                    case "pause":
                        obj.disabled = !(ctl.Presenting && !ctl.Paused);
                        break;
                    case "resume":
                        obj.disabled = !(ctl.Presenting && ctl.Paused);
                        break;
                    case "mute":
                        obj.disabled = ctl.Muted;
                        break;
                    case "unmute":
                        obj.disabled = !ctl.Muted;
                        break;
                    }
                    updateButton(id);
                }
            }
            else if (obj.hasOwnProperty("items"))
            {
                updateNavButtonsRec(obj);
            }
        }
    }

    //
    // Gradients
    //
    
    function initRest()
    {
        for (var sceneid in dirRoot.items)
        {
            initRestRecurse(dirRoot.items[sceneid]);
        }
        initBubble();
        initStartShield();
    }
    
    function initRestRecurse(parent)
    {
        for (var objid in parent.items)
        {
            var obj = parent.items[objid];
            if (obj.type=="rectangle")
            {
                if (obj.wash)
                {
                    var c = document.getElementById(idDiv+obj.id+'Wash');
                    var ctx = c.getContext("2d");
                    var grd=ctx.createLinearGradient(0, 0, (obj.wash == "horizontal" ? obj.width : 0), (obj.wash == "vertical" ? obj.height : 0));
                    grd.addColorStop(0, obj.fillcolor1);
                    grd.addColorStop(1, obj.fillcolor2);
                    ctx.fillStyle=grd;
                    ctx.fillRect(0,0,obj.width,obj.height);
                }
            }
            else if (obj.type=="slideshow" || obj.type=="slide" || obj.type=="grid")
            {
                initRestRecurse(obj);
            }
        } 
    }
    
    // 
    // Bubble
    //
    
    function getBubbleBody()
    {
        if (!bubbleBody)
        {
            bubbleBody = new Object();
            bubbleBody.msvector = true;
            bubbleBody.data = {"cx":"6120", "cy":"7920", "xView":"990", "yView":"820", "cxView":"1750", "cyView":"1750","frames":[[
                ["fs",35,31,32,50],["bp"],["m",1391,978],["l",1478,1065],["l",1438,1105],["l",1403,1070],["l",1365,1108],["l",1398,1141],["l",1360,1179],["l",1327,1146],["l",1283,1190],["l",1321,1228],["l",1281,1268],["l",1190,1177],["l",1391,978],["c"],["f"],
                ["bp"],["m",1621,1208],["l",1393,1383],["l",1314,1304],["l",1485,1073],["l",1540,1128],["b",1491,1190,1449,1241,1413,1282],["b",1454,1246,1492,1214,1525,1187],["l",1566,1153],["l",1621,1208],["c"],["f"],
                ["bp"],["m",1717,1304],["l",1546,1535],["l",1493,1482],["l",1526,1443],["l",1507,1424],["l",1468,1457],["l",1414,1403],["l",1642,1228],["l",1717,1304],["c"],["m",1560,1406],["b",1580,1381,1606,1350,1637,1314],["b",1593,1347,1562,1372,1542,1388],["l",1560,1406],["c"],["f"],
                ["bp"],["m",1808,1395],["l",1647,1556],["l",1679,1588],["l",1639,1628],["l",1555,1544],["l",1756,1343],["l",1808,1395],["c"],["f"],
                ["bp"],["m",1971,1559],["l",1837,1693],["b",1822,1708,1811,1718,1803,1724],["b",1796,1729,1787,1733,1775,1734],["b",1764,1736,1752,1734,1741,1729],["b",1719,1717,1708,1706],["b",1696,1694,1687,1681,1682,1668],["b",1677,1655,1675,1643,1677,1632],["b",1679,1621,1683,1612,1689,1604],["b",1710,1581,1732,1558],["l",1851,1439],["l",1903,1491],["l",1753,1642],["b",1744,1651,1739,1657,1738,1660],["b",1737,1663,1737,1667,1740,1669],["b",1743,1672,1747,1673,1750,1671],["b",1754,1669,1760,1663,1771,1653],["l",1919,1505],["l",1971,1559],["c"],["f"],
                ["bp"],["m",2082,1670],["l",1911,1901],["l",1858,1848],["l",1891,1809],["l",1872,1790],["l",1833,1823],["l",1779,1769],["l",2007,1594],["l",2082,1670],["c"],["m",1925,1771],["b",1945,1746,1971,1715,2002,1679],["b",1958,1712,1927,1737,1907,1753],["l",1925,1771],["c"],["f"],
                ["bp"],["m",2212,1800],["l",2172,1840],["l",2141,1809],["l",1980,1970],["l",1928,1918],["l",2089,1757],["l",2058,1726],["l",2098,1686],["l",2212,1800],["c"],["f"],
                ["bp"],["m",2276,1864],["l",2075,2065],["l",2023,2013],["l",2224,1812],["l",2276,1864],["c"],["f"],
                ["bp"],["m",2299,2122],["b",2279,2142,2264,2156,2255,2164],["b",2235,2176,2223,2178],["b",2211,2180,2199,2179,2187,2174],["b",2175,2169,2163,2161,2152,2150],["b",2141,2139,2133,2128,2128,2116],["b",2121,2092,2123,2079],["b",2125,2067,2129,2056,2137,2047],["b",2144,2038,2158,2023,2179,2002],["l",2213,1968],["b",2233,1948,2248,1934,2257,1926],["b",2266,1919,2277,1914,2289,1912],["b",2301,1910,2313,1911,2325,1916],["b",2337,1921,2349,1929,2360,1940],["b",2371,1951,2379,1962,2384,1974],["b",2389,1986,2391,1998,2389,2011],["b",2387,2023,2383,2034,2375,2043],["b",2368,2052,2354,2067,2333,2088],["l",2299,2122],["c"],["m",2313,2004],["b",2322,1995,2328,1988,2329,1984],["b",2331,1980,2330,1977,2327,1974],["b",2324,1971,2321,1970,2318,1971],["b",2307,1977,2297,1988],["l",2203,2082],["b",2191,2094,2185,2101,2183,2105],["b",2181,2109,2182,2112,2186,2116],["b",2190,2120,2193,2120,2198,2118],["b",2202,2116,2210,2109,2222,2097],["l",2313,2004],["c"],["f"],
                ["bp"],["m",2553,2141],["l",2352,2342],["l",2306,2296],["l",2370,2177],["l",2279,2268],["l",2235,2224],["l",2436,2023],["l",2480,2067],["l",2419,2187],["l",2510,2096],["l",2553,2141],["c"],["f"]
                ]]};
        }
        return bubbleBody;
    }

    function initBubble()
    {   
        var lyr = document.getElementById("BubbleLayer")
        if (lyr) 
        {
            var ctx = lyr.getContext('2d');
            var x = 0;
            var y = 0;
            for (x=0; x < widthEmbed*10; x+=1750/2)
            for (y=0; y < heightEmbed*10; y+=1750/2)
            renderVector(ctx, "", getBubbleBody().data, 0, x, y, 0.5, 0, 0, 0);
        }
    }

    function layoutBubble(obj, text, width, heightMax)
    {
        var mdiv = document.getElementById(idDiv+"Measure");
        var result = "";
        var lc = 0;
        var cyGood = 0;
        var line;
        mdiv.style.fontFamily = obj.fontname;
        mdiv.style.fontSize = obj.fontheight+'px';
        while (text.length > 0) // pull lines off the front of text and add to result, split by <br/>
        {
            text = text.trim();
            var i = 0;
            var iBest = 0;
            while(i < text.length)
            {
                // Run i to next possible break
                while(i < text.length && text.substr(i,1) != ' ' && text.substr(i,1) != '-')    // undone: treat <a href=""/> as atomic
                    i++;
                if (text.substr(i,1) == '-') i++; // keep the dash but not the space
                iTest = i;
                while(i < text.length && text.substr(i,1) == ' ') i++; // i is where we pick up if we accept the new larger size
                mdiv.innerHTML = text.substr(0, iTest);
                if (mdiv.clientWidth > width)
                    break;
                else
                    iBest = iTest;
            }
            if (iBest == 0) iBest = iTest;    // if longest does not fit, take it anyway
            var t = result;
            if (t.length > 0) t += "<br/>";
            t += text.substr(0, iBest);
            // Now check height of would-be result
            mdiv.innerHTML = t;
            if (mdiv.clientHeight < heightMax || 
                lc == 0) // but must take a min of one line per page
            {
                result = t;
                lc++;
                text = text.substr(iBest);
                cyGood = mdiv.clientHeight;
            }
            else break;        
        }
        obj = {text:result, height:cyGood, remain:text};
        mdiv.innerHTML = "";
        return obj;
    }

    function updateBubble(obj, text)
    {
        textDeferred = "";
        updateBubbleActual(obj, text)
    }
        
    function updateBubbleActual(obj, text)
    {
        var layout = layoutBubble(obj, text, obj.width - 10, obj.height - 10 - obj.tailheight);
        debugTrace("Text "+layout.text+" lays out to h="+layout.height+" remainder: "+layout.remain);
        if (layout.remain.length > 0)
        {
            textDeferred = layout.remain;
        }    
        var cxyMargin1 = 5; // for text
        var cxyMargin2 = 2; // for line
        var cyFudge = 8; // helps tail appearance when tail on top
        var w = obj.width - cxyMargin2*2; // actual bubble width    
        var thb = obj.tailstyle == 1 ? parseInt(obj.tailheight) : 0; // tailheight
        var tht = obj.tailstyle == 2 ? parseInt(obj.tailheight) : 0;
        // tailstyle: 1 = tail on bottom, 2 = tail on top - defaults to 1.
        // autosize: 1 is no autosize, 2 = anchor top, 3 = anchor bottom
        var h = obj.autosize == 1 ? obj.height : layout.height + 2*cxyMargin1 + parseInt(obj.tailheight); // h is the actual bubble height, including tail
        if (obj.tailstyle == 2) h -= (cyFudge + cxyMargin1);
        var r = 10; // corner radius
        var x = cxyMargin2; // draw
        var y = obj.tailstyle == 1 ? (obj.autosize == 3 ? parseInt(obj.height) - h : cxyMargin2) : (tht + cyFudge); // starting point
        var cxt = w * parseInt(obj.tailattach) / 100;
        if (cxt < 15) cxt = 15;
        if (cxt > w-15) cxt = w-15;
        var skt = parseInt(obj.tailskew);
        var tw = parseInt(obj.tailwidth);

        var c = document.getElementById(idDiv+obj.id+'Canvas');
        var ctx = c.getContext("2d");
        
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.lineWidth = parseInt(obj.linewidth)*2;
        ctx.strokeStyle = obj.linecolor; 
        ctx.fillStyle = obj.bubblecolor;

        ctx.beginPath();
        
        ctx.moveTo(x+10, y);
        if (obj.tailstyle == '2')
        {
            ctx.lineTo(x+cxt-tw/2, y);
            ctx.lineTo(x+cxt+skt, y-tht);
            ctx.lineTo(x+cxt+tw/2, y);
            ctx.lineTo(x+w-r, y);
        }
        else ctx.lineTo(x+w-r, y);

        ctx.arcTo(x+w, y, x+w, y+r, r);
        ctx.lineTo(x+w, y+h-thb-r);
        ctx.arcTo(x+w, y+h-thb, x+w-r, y+h-thb,r);

        if (obj.tailstyle == '1')
        {
            ctx.lineTo(x+cxt+tw/2, y+h-thb);
            ctx.lineTo(x+cxt+skt, y+h);
            ctx.lineTo(x+cxt-tw/2, y+h-thb);
            ctx.lineTo(x+r, y+h-thb);
        }
        else ctx.lineTo(x+r, y+h-thb);

        ctx.arcTo(x, y+h-thb, x, y+h-thb-r, r);
        ctx.lineTo(x, y+r);
        ctx.arcTo(x, y, x+r, y, r);
        
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        
        var t = document.getElementById(idDiv+obj.id+'Text');
        t.style.top = (y+5)+'px';
        t.innerHTML = layout.text;
        
        // Show it 
        var d = document.getElementById(idDiv+obj.id+'Div');
        d.style.display = 'block';         
        
        // Clear previous timer, and set new timer - store the timer on the dir object
        if (obj.timer)
        {
            clearTimeout(obj.timer); 
        }
        var cms = getBubbleTime(layout.text, obj);
        obj.timer = setTimeout(function(){hideBubble(obj);}, cms);
    }

    function getBubbleTime(t, obj)
    {
        var wc = t.split(" ").length;
        var cms = obj.minshow + (1000 * 60 * wc / obj.wpm); 
        return cms;
    }

    function hideBubble(obj)
    {
        obj.timer = 0;
        if (textDeferred.length > 0)
        {
            updateBubble(obj, textDeferred);
        }
        else
        {
            var d = document.getElementById(idDiv+obj.id+'Div');
            d.style.display = 'none';         
        }
    }
        
    //
    // Internal API (BuilderScript)
    //
    
    this.startPresenting = function()
    {
        infoTrace("startPresenting"); 
        if (ctl.Presenting) 
            return;             // this test not done in restartPresenting
        if (getDirObjectFromId(ctl.Focus))
        {
            ctl.Presenting = true;
            ctl.Paused = false;
            focusChanged();
        }
        else errorTrace("startPresenting() - no valid messages available");
    }

    this.restartPresenting = function()
    {
        // REVIEW difference startPresenting and restartPresenting
        infoTrace("restartPresenting"); 
        if (getDirObjectFromId(ctl.Focus))
        {
            ctl.Presenting = true;
            ctl.Paused = false;
            focusChanged();
        }
        else errorTrace("restartPresenting() - no valid messages available");
    }

    this.stopPresenting = function()
    {
        infoTrace("stopPresenting");
        if (ctl.Presenting)
        {
            ctl.Presenting = false;
            ctl.Paused = false;
            focusChanged();
        }
    }
    
    this.pausePresenting = function()
    {
        infoTrace("pausePresenting");
        if (!ctl.Paused)
        {
            // Record the time we paused
            tPause = ((new Date()).getTime() - tOfLastReport) + tLastReported;
            // Stop all audio
            for (charid in chars)
			{
				if (chars[idChar].idScene != idSceneCur) continue;			
                var a = document.getElementById(idDiv + idChar + "Audio");
                if (a) 
                {
                    a.pause();
                    debugTrace("a.pause()");
                }
            }
            // Update buttons
            ctl.Paused = true;
            updateNavButtons();
        }
    }

    this.resumePresenting = function()
    {
        infoTrace("resumePresenting");
        if (ctl.Paused)
        {
            // Restart audio
            for (charid in chars)
            {
				if (chars[idChar].idScene != idSceneCur) continue;
                var a = document.getElementById(idDiv + idChar + "Audio");
                if (a) 
                {
                    debugTrace("a.play()");
                    a.play();
                }
            }
            // Update buttons
            ctl.Paused = false;
            updateNavButtons();
            // Reset time
            tLastReported = tPause;
            tOfLastReport = (new Date()).getTime();
        }
    }

    // Note that this gets translated from goto in the html5 export to avoid javascript reserved keyword 'goto'
    this.msgoto = function(id)
    {
        infoTrace("goto "+id); 
        id = getIdFromIdOrName(id);
        ctl.Focus = id;
        ctl.Paused = false;
        focusChanged();
    }

    this.gotoAndRestart = function(id)
    {
        infoTrace("gotoAndRestart "+id); 
        id = getIdFromIdOrName(id);
        ctl.Focus = id;
        ctl.Presenting = true;
        ctl.Restart = true;
        ctl.Paused = false;
        focusChanged();
    }

    this.externalCommand = function(c,a)
    {
        infoTrace("Firing onExternalCommand("+c+","+a+")");
        if (typeof onExternalCommand == 'function')
            onExternalCommand(idDiv, c, a);
        captivateExternalCommand(c, a);
    }

    function getBubbleForCharacter(c)
    {
        // bubble must be on the same scene - take the first bubble whose target matches our character, or whose character is empty
        var scn = getContainingElementOfType("scene", getDirObjectFromId(c));
        for (var id in scn.items)
        {
            var o = scn.items[id];
            if (o.type == "bubble")
            {
                if (!o.target || o.target == c)
                    return o;
            }
        }
        return null;
    }
	
    function getButtonSetForCharacter(c)
    {
        // button set must be on the same scene - take the first one
        var scn = getContainingElementOfType("scene", getDirObjectFromId(c));
        for (var id in scn.items)
        {
            var o = scn.items[id];
            if (o.type == "buttonset") return o;
        }
        return null;
    }
    
    this.bubble = function(c,t)
    {
        infoTrace("bubble "+c+" "+t); 
        var b = getBubbleForCharacter(c);
        if (b) updateBubble(b, t);
    }

    this.nextFocus = function()
    {
        infoTrace("nextFocus"); 
        var id = getNextFocus();
        if (id) 
            ctl.Focus = id;
        else 
            ctl.Presenting = false; // stop when there is no more left to say
            
        // Also, on mobile, when go Presenting False if we are running in timeline
        if (!(dirRoot.allowautoplay == "always"))
        {
            if (dirRoot.allowautoplay == "never" ||
                (iPhone||iPad||android) && dirRoot.presenting == true && !dirRoot.noaudio && fInTimeline) // or "detect", the default
            {
                infoTrace("allowautoplay - presenting, encountered next: going Presenting false");
                ctl.Presenting = false;
            }
        }
            
        focusChanged();
        ctl.Paused = false;            
    }

    this.previousFocus = function()
    {
        infoTrace("previousFocus"); 
        var id = getPrevFocus();
        if (id) 
        {
            ctl.Focus = id;
            focusChanged();
        }
        ctl.Paused = false;            
    }

    this.firstFocus = function()
    {
        infoTrace("firstFocus"); 
        var id = getFirstFocus();
        if (id) 
        {
            ctl.Focus = id;
            focusChanged();
        }
        ctl.Paused = false;            
    }
    
    this.mute = function()
    {
        infoTrace("mute"); 
        ctl.Muted = true;
        updateNavButtons();
        updateVolume();
    }

    this.unmute = function()
    {
        infoTrace("unmute"); 
        ctl.Muted = false;
        updateNavButtons();
        updateVolume();
    }

    function updateVolume()
    {
        var v = ctl.Muted ? 0 : 1.0;
        debugTrace("volume="+v);
        for (charid in chars)
        {
			if (chars[idChar].idScene != idSceneCur) continue;
            var a = document.getElementById(idDiv + idChar + "Audio");
            if (a) 
            {
                debugTrace("a.volume="+v)
                a.volume = v;
            }
        }
    }
    
    this.trace = function(s)
    {
        console.log(s);    
    }

    this.getText = function(id)
    {
        var obj = document.getElementById(idDiv+id+'Edit');
        if (obj) 
            return obj.value;
        else 
            return "";
    }

    this.setText = function(id,value)
    {
        var obj = document.getElementById(idDiv+id+'Edit');
        if (obj) 
        {
            obj.value = value;
        }
    }

	this.daysSinceLastVisit = function()
	{
		return 0; // TODO
	}
	
    this.firstFAQ = function()
    {
        return getFAQ(1);
    }

    this.nextFAQ = function()
    {
        return getFAQ(2);
    }

    this.previousFAQ = function()
    {
        return getFAQ(3);
    }
    
    this.targetFAQ = function()
    {
        return getFAQ(4);
    }

    function getFAQ(fn) // 1 = first, 2 = next, 3 = previous, 4 = target
    {
        for (var pass = 1; pass <= 2; pass++)
        {
            var parent = getDirObjectFromId(idSceneCur);
            var pos = 1;
            for (var objid in parent.items)
            {
                var obj = parent.items[objid];
                if (obj.type=="message")
                {
                    if (obj.text)
                    {
                        if (fn == 1) {faq = 1; return obj.text;}
                        else if (fn == 2 && faq+1 == pos) {faq = pos; return obj.text;}
                        else if (fn == 3 && faq-1 == pos) {faq = pos; return obj.text;}
                        else if (fn == 4 && faq == pos) {return obj.id;}
                        pos++;
                    }
                }
            } 
            // case where we find nothing
            if (fn == 1 || fn == 4) return "";
            else if (fn == 2) faq = 0; // wrap around and stay for second pass
            else if (fn == 3) faq = pos; // wrap around and stay for second pass
        }
        faq = 1;
        return ""; // still nothing after 2nd pass means there were no FAQs
    }    
    
    this.show = function(id)
    {
        id = getIdFromIdOrName(id)
        var obj = getDOMObjFromId(id);
        if (obj) obj.style.display = 'block';
    }

    this.hide = function(id)
    {
        id = getIdFromIdOrName(id)
        var obj = getDOMObjFromId(id);
        if (obj) obj.style.display = 'none';
    }

    this.fadein = function(id)
    {
        id = getIdFromIdOrName(id)
        var obj = getDOMObjFromId(id);
        if (obj) fadein(obj, 500);
    }

    this.fadeout = function(id)
    {
        id = getIdFromIdOrName(id)
        var obj = getDOMObjFromId(id);
        if (obj) fadeout(obj, 500);
    }

    this.setPosition = function(id,x,y)
    {
		x = Math.round(x);
		y = Math.round(y);
        id = getIdFromIdOrName(id)
        var obj = getDOMObjFromId(id);
        if (obj) 
		{
			obj.style.left = x+'px';
			obj.style.top = y+'px';
		}
    }

    this.setSize = function(id,cx,cy)
    {
		cx = Math.round(cx);
		cy = Math.round(cy);
        id = getIdFromIdOrName(id)
        var obj = getDirObjectFromId(id);
        var div = getDOMObjFromId(id);
        if (div) 
		{
			if (obj.type == 'character')
			{
				obj.width = cx;
				obj.height = cy;
				var s = renderCharacter(obj.id, obj);
				div.outerHTML = s;
			}
			else
			{
				div.style.width = cx+'px';
				div.style.height = cy+'px';
				if (obj.type == 'image')
				{
					div.style.backgroundSize = cx+'px '+cy+'px'; 
				}
			}	
		}
    }
	
	this.getX = function(id)
	{
		var div = getDOMObjFromId(getIdFromIdOrName(id));
        return div ? parseInt(div.style.left.replace("px","")) : 0;
	}
	this.getY = function(id)
	{
		var div = getDOMObjFromId(getIdFromIdOrName(id));
        return div ? parseInt(div.style.top.replace("px","")) : 0;
	}
	this.getWidth = function(id)
	{
		var div = getDOMObjFromId(getIdFromIdOrName(id));
		return div ? parseInt(div.style.width.replace("px","")) : 0;
	}
	this.getHeight = function(id)
	{
        var div = getDOMObjFromId(getIdFromIdOrName(id));
        return div ? parseInt(div.style.height.replace("px","")) : 0;
	}
	
    this.stageWidth = function()
    {
		return widthEmbed; 
    }

    this.stageHeight = function()
    {
		return heightEmbed; 
    }

    this.max = function(a,b)
    {
        return a >= b ? a : b;
    }

    this.min = function(a,b)
    {
        return a >= b ? b : a;
    }

    function getVideoObjFromId(id)
    {
        id = getIdFromIdOrName(id)
        return document.getElementById(idDiv+id+'Video');
    }
	
	this.moviePlay = function(id)
	{
        var obj = getVideoObjFromId(id);
        if (obj) 
		{
			debugTrace("v.play()"); 
			obj.play();
		}
	}

	this.movieStop = function(id)
	{
        var obj = getVideoObjFromId(id);
        if (obj) 
		{
			debugTrace("v.pause()"); 
			obj.pause();
		}
	}

	this.movieReached = function(id,time) // time in s
	{
        var obj = getVideoObjFromId(id);
        if (obj) return (obj.currentTime >= time);
		else return false;
	}

	this.movieReachedEnd = function(id)
	{
        var obj = getVideoObjFromId(id);
		debugTrace(obj.currentTime + ">?=" +obj.duration);
        if (obj) return (obj.currentTime >= obj.duration);
		else return false;
	}

	// Edit
	
	this.setFocus = function(id)
	{
	}

	// Stack-based
	
    this.random = function()
    {
        stack.push(Math.random()*stack.pop());
    }

    this.push = function(n)
    {
        stack.push(n);
    }

    this.lessthan = function()
    {
        var v2 = stack.pop();
        var v1 = stack.pop();
        stack.push(v1 < v2);
    }

    this.ifnot = function(n)
    {
        if (!stack.pop()) gotoFrame(n);
    }

    // Unlike a rec, a branch is a promise that the imgShow array remains identical
    this.branch = function(n)
    {
        frameTrace("branch "+n); 
        gotoFrame(n);
    }

    this.button = function(text)
    {
		var bs = getButtonSetForCharacter(idCharEval);
		for (var i=0; i < bs.abtn.length; i++)
		{
			if (text == bs.abtn[i].text)
			{
				document.getElementById(idDiv + bs.id + "Btn" + i + "Up").style.display = 'block';
				document.getElementById(idDiv + bs.id + "Btn" + i + "Lbl").style.display = 'block';
				break;
			}
		}
    }

    function getDOMObjFromId(id)
    {
        return document.getElementById(idDiv+id+'Div'); 
    }
    
    //
    // Internal API generated from art
    //
    
    this.load = function(id, file, cx, cy, cyFrame, nFrame)
    {
        if (loadTo != 0 && nFrame > loadTo) return;
        frameTrace("load("+id+","+file+")");
        
        // When indexing into aImg we always use Msg1Img1, and not just Img1. This matters when rendering scenes, where we
        // load images from different characters. We could have made Img1 identifiers unique at compile time, but it was 
        // inconvenient due to our merge approach - it was easier to treat them as identifiers with scope limited to their message.
        id = idMsgEval+id;
        
        var filefull;
        if (urlExternal)
        {
            // go to objExternal instead to get audio file
            filefull = getCSHTMLURL(urlExternal, file);
        }
        else
        {
            // may yet append base
            filefull = getBasedURL(file);
        }
        
        if (file.substr(file.length-3) == ".js")
        {
            // A vector image may already be loaded
            aImg[id] = new Object();
            aImg[id].msvector = true;       // a marker that lets us quickly distinguish vector images from regular Image (PNG) objects
            aImg[id].digest = file.substr(0, file.length-3);
            if (window["MS"+aImg[id].digest])
            {
                aImg[id].data = window["MS"+aImg[id].digest];
            }
            else
            {
                aImg[id].data = null;           // key!
                // inject a script to load it - when it loads and runs, it will call msVectorLoaded, which calls onVectorLoaded on each embedding
                var s = document.createElement('script');
                var div = document.getElementById(idDiv);                
                div.appendChild(s);
                nImgLoading++;
                s.src = filefull;
            }
        }
        else
        {
            var filefullqual = qualifyURL(filefull);
            // We reload png images from scratch each time - they will be in the browser cache though
            aImg[id] = allocImage(filefullqual);
            if (aImg[id].src != filefullqual)
            {
                aImg[id].onload = function(){onImgLoadComplete();}
                aImg[id].setAttribute("data-cyframe", cyFrame);
                nImgLoading++;
                aImg[id].src = filefull;
            }
        }        
        
        return;
    }

    // Called at the beginning of each frame. Establishes the "safe" zone as the entire char surface. Adds and updates
    // can be blitted directly so long as they only narrow the safe zone down or leave it the same.
    function resetCharOpts(idChar)
    {
        fRedraw = false;
        xSafe = 0; 
        ySafe = 0;
        var obj = getDirObjectFromId(idChar);
        cxSafe = obj.width; 
        cySafe = obj.height;
    }

    function addToShow(idChar, id)
    {
        var a = chars[idChar].aImgShow;
        for (var i = 0; i < a.length; i++)
            if (a[i] == id) return;
        a.push(id);
    }

    function removeFromShow(idChar, id)
    {
        var a = chars[idChar].aImgShow;
        for (var i = 0; i < a.length; i++)
        {
            if (a[i] == id) 
            {
                a = a.splice(i,1);
                return;
            }
        }
    }
    
    this.add = function(id, p2, p3, p4, p5, p6, p7)
    {
        var x = 0;
        var y = 0;
        var n = 1;
        var rx = 0;
        var ry = 0;
        var rn = 0;
        var coreargs;
        var img = chars[idCharEval].aImg[idMsgEval+id];   // Note that for render we pull these from the char version
        if (img == null) return;
        
        chars[idCharEval].lastCmdAddId = id; // see idLookUser
        
        addToShow(idCharEval, idMsgEval+id);
        if (arguments.length >= 7) 
        {
            x = p2; 
            y = p3; 
            n = p4; 
            rx = p5;
            ry = p6;
            rn = p7;
            coreargs = 7;
            frameTrace("add/update("+id+","+n+","+x+","+y+","+rx+","+ry+","+rn+(arguments.length > 7 ? ",..." : "")+")");
        }
        else if (arguments.length == 4) 
        {
            x = p2; 
            y = p3; 
            n = p4; 
            rx = isVector(img) ? img.rx : parseInt(img.getAttribute("data-rx")); 
            ry = isVector(img) ? img.ry : parseInt(img.getAttribute("data-ry")); 
            rn = isVector(img) ? img.rn : parseInt(img.getAttribute("data-rn")); 
            frameTrace("add/update("+id+","+n+","+x+","+y+")");
        }
        else if (arguments.length == 2) 
        {
            n = p2; 
            x = isVector(img) ? img.x : parseInt(img.getAttribute("data-x")); 
            y = isVector(img) ? img.y : parseInt(img.getAttribute("data-y")); 
            rx = isVector(img) ? img.rx : parseInt(img.getAttribute("data-rx")); 
            ry = isVector(img) ? img.ry : parseInt(img.getAttribute("data-ry")); 
            rn = isVector(img) ? img.rn : parseInt(img.getAttribute("data-rn")); 
            frameTrace("add/update("+id+","+n+")");
        }

        // For cartoon characters, the art is layered transparencies, so we need to redraw the whole stack each time.
        var charobj = getDirObjectFromId(idCharEval);
        if (charobj.mode == "infront")
            fRedraw = true;

        // If we are not already redrawing, check if showing this image will violate our safe rect - if so we will redraw for this frame
        var cyFrame;
        if (!fRedraw) 
        {
            cyFrame = parseInt(img.getAttribute("data-cyframe"));
            if (x >= xSafe && x <= xSafe+cxSafe && x+img.width >= xSafe && x+img.width <= xSafe+cxSafe &&
                y >= ySafe && y <= ySafe+cySafe && y+cyFrame >= ySafe && y+cyFrame <= ySafe+cySafe)
            {
                // Safe to blit!
            }
            else
            {
                fRedraw = true;
            }
        }

        if (!fRedraw) 
        {        
            // Direct blit
            var canvas = chars[idCharEval].charCanvas ? chars[idCharEval].charCanvas : document.getElementById(idDiv + idCharEval + "Canvas"); 
            if (canvas.getContext)
            {
                var ctx = canvas.getContext('2d');
                ctx.clearRect(x - chars[idCharEval].cxCharLeft, y - chars[idCharEval].cyCharTop, img.width, cyFrame);
                ctx.drawImage(img, 0, (n-1)*cyFrame, img.width, cyFrame, x - chars[idCharEval].cxCharLeft, y - chars[idCharEval].cyCharTop, img.width, cyFrame);
                // Consider dst point 0, 0 - if char overhangs top-left by 50,50, then dst for blit is -50,-50 - clipping on the canvas will occur naturally
                var iParam = 7;
                while (arguments.length > iParam)
                {
                    ctx.clearRect(arguments[iParam] - chars[idCharEval].cxCharLeft, arguments[iParam+1] - chars[idCharEval].cyCharTop, arguments[iParam+2], arguments[iParam+3]);
                    iParam += 4;
                }
				if (android) bug_workaround(canvas);
            } else errorTrace("No canvas support.");
            xSafe = x;
            ySafe = y;
            cxSafe = img.width;
            cySafe = cyFrame;
        }
        
        if (isVector(img))
        {
            img.x = x;
            img.y = y;
            img.n = n;
            img.rx = rx;
            img.ry = ry;
            img.rn = rn;
            img.morph = null;
        }
        else
        {
            img.setAttribute("data-x", x);
            img.setAttribute("data-y", y);
            img.setAttribute("data-n", n);
            img.setAttribute("data-rx", rx);
            img.setAttribute("data-ry", ry);
            img.setAttribute("data-rn", rn);
            var iParam = 7;
            for (var i = 1; i <= 3; i++)
            {
                var s = "";
                if (arguments.length > iParam) s = arguments[iParam]+","+arguments[iParam+1]+","+arguments[iParam+2]+","+arguments[iParam+3];
                img.setAttribute("data-exclude"+i, s); 
                iParam += 4;
            }
        }
    }
    this.update = this.add; // The distinction is for readability
    
	function bug_workaround(canvas) 
	{
	  canvas.style.opacity = 0.99;
	  setTimeout(function() {
	  canvas.style.opacity = 1;
	  }, 1);
	}	
	
    this.addtween = function(id1, id2, p2, p3, p4, p5, p6, p7)
    {
        var x = 0;
        var y = 0;
        var n = 0;
        var rx = 0;
        var ry = 0;
        var rn = 0;
        var img1 = chars[idCharEval].aImg[idMsgEval+id1];
        var img2 = chars[idCharEval].aImg[idMsgEval+id2];
        if (!img1 || !img2) return;
        addToShow(idCharEval, idMsgEval+id1);    // First one in tween will hold z-order
        if (arguments.length >= 8) 
        {
            x = p2; 
            y = p3; 
            n = p4; 
            rx = p5;
            ry = p6;
            rn = p7;
            frameTrace("tweenimg("+id1+","+id2+","+n+","+x+","+y+")");
        }
        else if (arguments.length >= 5) 
        {
            x = p2; 
            y = p3; 
            n = p4; 
            frameTrace("tweenimg("+id1+","+id2+","+n+","+x+","+y+")");
        }
        else if (arguments.length == 3) 
        {
            n = p2; 
            x = img1.x; 
            y = img1.y; 
            frameTrace("tweenimg("+id1+","+id2+","+n+")");
        }
        img1.x = x;
        img1.y = y;
        img1.n = n;
        img1.rx = rx;
        img1.ry = ry;
        img1.rn = rn;
        img1.morph = id2;
        fRedraw = true;
    }
    this.updatetween = this.addtween;
    
    this.rem = function(id)  // short for remove
    {
        frameTrace("rem("+id+")");
        var img = chars[idCharEval].aImg[idMsgEval+id];
        removeFromShow(idCharEval, idMsgEval+id);
        fRedraw = true;
    }    

    function stretchChar(idChar)
    {
        var objChar = getDirObjectFromId(idChar);
        if (chars[idChar].charCanvas)
        {
            var canvas = document.getElementById(idDiv + idChar + "Canvas"); 
            if (canvas.getContext)
            {
                var ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.clearRect(0, 0, parseInt(objChar.width), parseInt(objChar.height));
                ctx.drawImage(chars[idChar].charCanvas, 0, 0, objChar.artwidth, objChar.artheight, 0, 0, parseInt(objChar.width), parseInt(objChar.height));
            }        
        }
    }
    
    function getCharScale(idChar)
    {
        var o = getDirObjectFromId(idChar);
        return o.width / o.artwidth;
    }
    
    function redrawChar(idChar, idMsg)
    {
        frameTrace("redrawChar");
        var canvas = chars[idChar].charCanvas ? chars[idChar].charCanvas : document.getElementById(idDiv + idChar + "Canvas"); 
        if (canvas.getContext)
        {
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (var iImg = 0; iImg < chars[idChar].aImgShow.length; iImg++)
            {
                var id = chars[idChar].aImgShow[iImg];
                var img = chars[idChar].aImg[id];
                if (!img || (!isVector(img) && !img.src)) {errorTrace("code 5"); continue;}
                
                if (isVector(img))
                {
                    var n = img.n;
                    var x = img.x;
                    var y = img.y;
                    var scale = getCharScale(idChar);
                    var rx = img.rx;
                    var ry = img.ry;
                    var rn = img.rn;
                    if (!img.morph)
                    {
                        renderVector(ctx, id, img.data, n-1, x - chars[idChar].cxCharLeft*10, y - chars[idChar].cyCharTop*10, scale, rx, ry, rn);
                    }
                    else
                    {
                        var imgMorph = chars[idChar].aImg[idMsg+img.morph];
                        renderVectorMorph(ctx, id, img.data, img.morph, imgMorph.data, n, x - chars[idChar].cxCharLeft*10, y - chars[idChar].cyCharTop*10, scale, rx, ry, rn);
                    }
                }
                else
                {
                    var cyFrame = img.getAttribute("data-cyframe");
                    var n = img.getAttribute("data-n");
                    var x = img.getAttribute("data-x");
                    var y = img.getAttribute("data-y");
                
                    // Consider dst point 0, 0 - if char overhangs top-left by 50,50, then dst for blit is -50,-50 - clipping on the canvas will occur naturally
                    ctx.drawImage(img, 0, (n-1)*cyFrame, img.width, cyFrame, x - chars[idChar].cxCharLeft, y - chars[idChar].cyCharTop, img.width, cyFrame);
                    
                    for (var iEx = 1; iEx <= 3; iEx++)
                    {
                        var s = img.getAttribute("data-exclude"+iEx);
                        if (s != "")
                        {
                            var a = s.split(",");
                            ctx.clearRect(a[0] - chars[idChar].cxCharLeft, a[1] - chars[idChar].cyCharTop, a[2], a[3]);
                        }
                    }
					if (android) bug_workaround(canvas);
                }
            }
            resetCharOpts(idChar);
        }
    }

    function renderVector(ctx, id, data, iFrame, xDest, yDest, scale, xRotate, yRotate, aRotate)
    {
          frameTrace("renderVector "+id+" "+iFrame+" "+xDest+" "+yDest+" "+scale);
          if (iFrame >= data.frames.length)
          {
              errorTrace("Frame out of bounds "+id+" "+iFrame);
              return;
          }

        // defaults
        ctx.fillStyle = "rgba(0,0,0,100)";
        ctx.strokeStyle = "rgba(0,0,0,100)";
        ctx.lineWidth = 1.2;

        var x1 = 0;
        var y1 = 0;
        var x2 = 0;
        var y2 = 0;
        var x = 0;
        var y = 0;
        var a = data.frames[iFrame];
        var xOff = xDest/10 - data.xView/10*scale;
        var yOff = yDest/10 - data.yView/10*scale;
        var cmd;
        var o = getTransformMatrix(scale, xOff, yOff, xRotate, yRotate, aRotate);
        
        for (var i = 0; i < a.length; i++)
        {
            cmd = a[i];
            switch(cmd[0])
            {
            case "lw":
                ctx.lineWidth = 1.2*cmd[1]/10*scale;
                break;
            case "fs":
                ctx.fillStyle = "rgba("+cmd[1]+","+cmd[2]+","+cmd[3]+","+cmd[4]/100+")";
                break;
            case "ss":
                ctx.strokeStyle = "rgba("+cmd[1]+","+cmd[2]+","+cmd[3]+","+cmd[4]/100+")";
                break;
            case "bp":
                ctx.beginPath();
                x = 0;
                y = 0;
                x1 = 0;
                y1 = 0;
                x2 = 0;
                y2 = 0;
                break;
            case "m":
                x = cmd[1];
                y = cmd[2];
                ctx.moveTo(o.a * x + o.c * y + o.e, o.b * x + o.d * y + o.f);
                break;
            case "l":
                x = cmd[1];
                y = cmd[2];
                ctx.lineTo(o.a * x + o.c * y + o.e, o.b * x + o.d * y + o.f);
                break;
            case "b":
                if (cmd.length == 7)
                {
                    x1 = cmd[1];
                    y1 = cmd[2];
                    x2 = cmd[3];
                    y2 = cmd[4];
                    x = cmd[5];
                    y = cmd[6];
                }
                else
                {
                    x1 = x - (x2 - x);
                    y1 = y - (y2 - y);
                    x2 = cmd[1];
                    y2 = cmd[2];
                    x = cmd[3];
                    y = cmd[4];
                }
                ctx.bezierCurveTo(o.a * x1 + o.c * y1 + o.e, o.b * x1 + o.d * y1 + o.f, 
                                  o.a * x2 + o.c * y2 + o.e, o.b * x2 + o.d * y2 + o.f,
                                  o.a * x + o.c * y + o.e, o.b * x + o.d * y + o.f);
                break;
            case "c":
                ctx.closePath();
                break;
            case "s":
                ctx.stroke();
                break;
            case "f":
                ctx.fill();
                break;
            }
        }        
    }

    function renderVectorMorph(ctx, id, data, idM, dataM, n, xDest, yDest, scale, xRotate, yRotate, aRotate)
    {
          frameTrace("renderVectorMorph "+id+" "+idM+" "+n+" "+xDest+" "+yDest+" "+scale);
          
        // defaults
        ctx.fillStyle = "rgba(0,0,0,100)";
        ctx.strokeStyle = "rgba(0,0,0,100)";
        ctx.lineWidth = 1;
        var x1 = 0;
        var y1 = 0;
        var x2 = 0;
        var y2 = 0;
        var x = 0;
        var y = 0;
        var x1M = 0;
        var y1M = 0;
        var x2M = 0;
        var y2M = 0;
        var xM = 0;
        var yM = 0;
        var a = data.frames[0];
        var aM = dataM.frames[0];
        if (a.length != aM.length) 
        {
            errorTrace("Tween fail - "+id+" -> "+idM+" - lengths differ");
            return;
        }
        var xOff = xDest/10 - data.xView/10*scale;
        var yOff = yDest/10 - data.yView/10*scale;
        var cmd;
        var cmdM;
        var o = getTransformMatrix(scale, xOff, yOff, xRotate, yRotate, aRotate);
        
        for (var i = 0; i < a.length; i++)
        {
            cmd = a[i];
            cmdM = aM[i];
            if (cmd[0] != cmdM[0]) 
            {
                errorTrace("Tween fail - "+id+" -> "+idM+" - "+cmd+" vs "+cmdM);
                return;
            }
            switch(cmd[0])
            {
            case "lw":
                ctx.lineWidth = cmd[1]/10*scale;
                break;
            case "fs":
                ctx.fillStyle = "rgba("+cmd[1]+","+cmd[2]+","+cmd[3]+","+cmd[4]/100+")";
                break;
            case "ss":
                ctx.strokeStyle = "rgba("+cmd[1]+","+cmd[2]+","+cmd[3]+","+cmd[4]/100+")";
                break;
            case "bp":
                ctx.beginPath();
                x = 0;
                y = 0;
                x1 = 0;
                y1 = 0;
                x2 = 0;
                y2 = 0;
                xN = 0;
                yM = 0;
                x1M = 0;
                y1M = 0;
                x2M = 0;
                y2M = 0;
                break;
            case "m":
                x = cmd[1];
                y = cmd[2];
                xM = cmdM[1];
                yM = cmdM[2];
                xA = x + (xM-x)*n/100;
                yA = y + (yM-y)*n/100;
                ctx.moveTo(o.a * xA + o.c * yA + o.e, o.b * xA + o.d * yA + o.f);
                break;
            case "l":
                x = cmd[1];
                y = cmd[2];
                xM = cmdM[1];
                yM = cmdM[2];
                xA = x + (xM-x)*n/100;
                yA = y + (yM-y)*n/100;
                ctx.lineTo(o.a * xA + o.c * yA + o.e, o.b * xA + o.d * yA + o.f);
                break;
            case "b":
                if (cmd.length == 7)
                {
                    x1 = cmd[1];
                    y1 = cmd[2];
                    x2 = cmd[3];
                    y2 = cmd[4];
                    x = cmd[5];
                    y = cmd[6];
                }
                else
                {
                    x1 = x - (x2 - x);
                    y1 = y - (y2 - y);
                    x2 = cmd[1];
                    y2 = cmd[2];
                    x = cmd[3];
                    y = cmd[4];
                }
                if (cmdM.length == 7)
                {
                    x1M = cmdM[1];
                    y1M = cmdM[2];
                    x2M = cmdM[3];
                    y2M = cmdM[4];
                    xM = cmdM[5];
                    yM = cmdM[6];
                }
                else
                {
                    x1M = xM - (x2M - xM);
                    y1M = yM - (y2M - yM);
                    x2M = cmdM[1];
                    y2M = cmdM[2];
                    xM = cmdM[3];
                    yM = cmdM[4];
                }                
                // Illustrator sometimes switches between smooth and normal for no apparent reason.
                // When this happens, treat as if both were smooth, and drop the extra point - assume its close enough to being the reflection.            
                if (cmd.length == 5 && cmdM.length == 7)
                {
                    x1M = xM - (x2M - xM);
                    y1M = yM - (y2M - yM);
                }
                else if (cmd.length == 7 && cmdM.length == 5)
                {
                    x1 = x - (x2 - x);
                    y1 = y - (y2 - y);
                }
                // Actuals
                x1A = x1 + (x1M-x1)*n/100;
                y1A = y1 + (y1M-y1)*n/100;
                x2A = x2 + (x2M-x2)*n/100;
                y2A = y2 + (y2M-y2)*n/100;
                xA = x + (xM-x)*n/100;
                yA = y + (yM-y)*n/100;
                ctx.bezierCurveTo(o.a * x1A + o.c * y1A + o.e, o.b * x1A + o.d * y1A + o.f, 
                                  o.a * x2A + o.c * y2A + o.e, o.b * x2A + o.d * y2A + o.f, 
                                  o.a * xA + o.c * yA + o.e, o.b * xA + o.d * yA + o.f);
                break;
            case "c":
                ctx.closePath();
                break;
            case "s":
                ctx.stroke();
                break;
            case "f":
                ctx.fill();
                break;
            }
        }        
    }

    function getTransformMatrix(scale, xTran, yTran, xRotate, yRotate, aRotate)
    {
        var o = {};

        // Initial transform vector
        o.a = 1; o.b = 0; o.c = 0; o.d = 1; o.e = xTran; o.f = yTran;
        
        // Scale
        o.a = o.a / 10 * scale;
        o.d = o.d / 10 * scale;
        
        // Rotate
        if (aRotate != 0)
        {
            var ep = -(xRotate/10.0+xTran); var fp = -(yRotate/10.0+yTran);
            o.e += ep; 
            o.f += fp;
            var pi = 3.1415926535;
            var aq = Math.cos(-aRotate/10*pi/180); var bq = Math.sin(-aRotate/10*pi/180); var cq = -Math.sin(-aRotate/10*pi/180); var dq = Math.cos(-aRotate/10*pi/180);
            o.a = aq * o.a + cq * o.b;     o.c = aq * o.c + cq * o.d;     o.e = aq * o.e + cq * o.f; 
            o.b = bq * o.a + dq * o.b;     o.d = bq * o.c + dq * o.d;      o.f = bq * o.e + dq * o.f;
            var er = (xRotate/10.0+xTran); var fr = (yRotate/10.0+yTran);
            o.e += er; 
            o.f += fr;
        }
        return o;
    }
    
    this.stop = function()
    {
        var restart = false;
        if (getDirObjectFromId(idMsgEval).idle)
        {
            if (chars[idCharEval].idMsgNext == null)
                restart = true;
        }
        if (restart)
        {
            frameTrace("Restarting idle");
            eventHorizon = -1;
            tLastReported = 0;    
            tOfLastReport = (new Date()).getTime(); // see onFrame
        }
        else
        {
            // An official end to the message - we are guaranteed to be in the same visual state as at the start
            debugTrace("stop"); 
            var ch = chars[idCharEval];
            ch.fRecovering = false;
            ch.fFirstFrameAfterRec = false;
            ch.fStopReached = true;
            
            // Stop audio - we don't want to get another audioontimeupdate
            var a = document.getElementById(idDiv + idCharEval + "Audio");
            debugTrace("a.pause()");
            a.pause();        
            
            // We are only stopped when fStopReached AND any controller action is stopped
            if (!ch.action)
            {
                ch.complete = true;
                checkAllComplete(idCharEval);   
            }
            else
            {
                debugTrace("waiting for controller to stop");
            }
        }
        // even if all chars are complete, we won't do anything about it until after we unravel this thread
    }
    
    this.rec = function(n)
    {
        frameTrace("rec "+n); // frame #s are 1-based, and frame # indicates the beginning of the frame
        if (chars[idCharEval].idMsgNext) // indicates we are trying to stop
        {
            // The promise, when encountering a recovery, is that you can jump directly to this frame, and there will be
            // no visual difference in the character.
            debugTrace("Taking recovery to frame "+n);
            gotoFrame(n);
            chars[idCharEval].fRecovering = true;
            chars[idCharEval].fFirstFrameAfterRec = true;
        }
    }

    function gotoFrame(n)
    {
        // Monkey with time so that the given frame is the next to fire
        var tevent = Math.floor((1000 * (n-1)) / dirRoot.fps); 
        eventHorizon = tevent-1;     
        tLastReported = tevent;    
        tOfLastReport = (new Date()).getTime(); // see onFrame
        fMessedWithTime = true; // breaks catch-up frame loop in fireEvents
        // Recall that var tCur = (t - tOfLastReport) + tLastReported;
        // so tevent > eventHorizon && tevent <= tcur) will fire is fireEvents
    }

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
    
    // addctl does not actually add to the display list - it just establishes it as a potential, to be added/removed by controller
    this.addctl = function(id,x,y,s)
    {
        var ch = chars[idCharEval];
        
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
        img.setAttribute("data-x", x);
        img.setAttribute("data-y", y);
    }
    
    this.addtweenctl = function()
    {
        // UNDONE
    }
    
    this.ctlaction = function(action)
    {
        debugTrace("ctlaction "+action);
        initController(action);
    }

	function initController(action)
    {
        var ch = chars[idCharEval];
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
        cFollow = 0;
        ch.fakingmouse = false;
        ch.xTrg = 0;
        ch.yTrg = 0;
        ch.nTrg = 0;
        ch.xCur = 0;
        ch.yCur = 0;
        ch.nCur = 0;
        
		var img;
		if (ch.idPupils0 && (img = ch.aImg[idMsgEval+ch.idPupils0]))
		{
			ch.xBtwEye = parseInt(img.getAttribute("data-x")) + img.width / 2;
			ch.yBtwEye = parseInt(img.getAttribute("data-y")) + parseInt(img.getAttribute("data-cyframe")) / 2;
			debugTrace("xBtwEye "+ch.xBtwEye+" yBtwEye "+ch.yBtwEye);	
		}
		var obj = getDirObjectFromId(idCharEval);
		ch.xMouseLast = mouseX - parseInt(obj.left) - ch.xBtwEye;
		ch.yMouseLast = mouseY - parseInt(obj.left) - ch.yBtwEye; 
    }

	function terminateController()
	{
		debugTrace("terminateController");
		var ch = chars[idCharEval];
		ch.action = "";
	}

	function doBlink(nCur, n)
	{
	    var ch = chars[idCharEval];
		if (ch.nCur == 0) doBlinkWork(ch.idBlink, n);
		else if (ch.nCur == 5) doBlinkWork(ch.idBlink1, n);
		else if (ch.nCur == 6) doBlinkWork(ch.idBlink2, n);
		else if (ch.nCur == 104) doBlinkWork(ch.idBlink3, n);
		else if (ch.nCur == 18) doBlinkWork(ch.idBlink4, n);
		else if (ch.nCur == 113) doBlinkWork(ch.idBlink5, n);
	}
	
	function doBlinkWork(idBlink, n)
	{
	    var ch = chars[idCharEval];
		if (n == 1 || n == 3) 
		{
			c.add(idBlink, 1);
		}
		else if (n == 2) 
		{
			c.add(idBlink, 2);
		}
		else 
		{
			c.rem(idBlink);
		}
	}
	
    function doMoveHead(x, y) 
	{
		frameTrace("doMoveHead " + x + " " + y);

	    var ch = chars[idCharEval];
		c.rem(ch.idBlink);
		c.rem(ch.idBlink1);
		c.rem(ch.idBlink2);
		c.rem(ch.idBlink3);
		c.rem(ch.idBlink4);
		c.rem(ch.idBlink5);
		c.rem(ch.idRandomLeft);
		c.rem(ch.idRandomRight);
		
		if (x < -8) x = -8;
		if (x > 8) x = 8;
		if (y < -3) y = -3;
		if (y > 3) y = 3;
		
		// Selection of HeadRight/Left controlled only by x
		if (x == 0)
		{
			c.rem(ch.idHeadRight);
			c.rem(ch.idHeadLeft);
			c.add(ch.idLookUser, 1);
		}
		else if (x > 0)
		{
			c.rem(ch.idLookUser);
			c.rem(ch.idHeadRight);
			c.add(ch.idHeadLeft, x);
		}
		else if (x < 0)
		{
			c.rem(ch.idLookUser);
			c.rem(ch.idHeadLeft);
			c.add(ch.idHeadRight, -x); // x = -8 -> 8
		}
		
		// Selection of pupil controlled first by y, then x
		c.rem(ch.idPupils0);
		c.rem(ch.idPupils1);
		c.rem(ch.idPupils2);
		c.rem(ch.idPupils3);
		if (y == -3)
		{
			c.add(ch.idPupils3, x + 9);		// x = -8 -> 1, x = 0 -> 9
		}
		else if (y == -2)
		{
			c.add(ch.idPupils2, x + 9);
		}
		else if (y == -1)
		{
			c.add(ch.idPupils1, x + 9);
		}
		else if (y == 0)
		{
			c.add(ch.idPupils0, x + 9);
		}
		else if (y == 1)
		{
			c.add(ch.idPupils1, 17 + x + 9);		// x = -8 -> 19
		}
		else if (y == 2)
		{
			c.add(ch.idPupils2, 17 + x + 9);		// x = -8 -> 19
		}
		else if (y == 3)
		{
			c.add(ch.idPupils3, 17 + x + 9);		// x = -8 -> 19
		}
	}

	function doRandomHead(n) 
	{
		frameTrace("doRandomHead " + n);
		
		var ch = chars[idCharEval];
		c.rem(ch.idBlink);
		c.rem(ch.idBlink1);
		c.rem(ch.idBlink2);
		c.rem(ch.idBlink3);
		c.rem(ch.idBlink4);
		c.rem(ch.idBlink5);
		c.rem(ch.idHeadLeft);
		c.rem(ch.idHeadRight);
		c.rem(ch.idPupils0);
		c.rem(ch.idPupils1);
		c.rem(ch.idPupils2);
		c.rem(ch.idPupils3);
		
		// Note: n > 100 means left and subtract 100. Random1-5 are 5, 6, 104, 18, 113
		if (n == 0)
		{
			c.rem(ch.idRandomLeft);
			c.rem(ch.idRandomRight);
			c.add(ch.idLookUser, 1);
		}
		else if (n > 100)
		{
			c.rem(ch.idLookUser);
			c.rem(ch.idRandomRight);
			c.add(ch.idRandomLeft, n - 100);
		}
		else
		{
			c.rem(ch.idLookUser);
			c.add(ch.idRandomRight, n); 
			c.rem(ch.idRandomLeft);
		}
	}
				
	/*
	var nTestCur = 0;
	var nTestTrg = 5;
	*/
	/*
	var xTestCur = 0;
	var xTestTrg = 8;
	*/

    function ctlTrack()
    {
        var ch = chars[idCharEval];
    
		/*
		// Nod test - tests random head imagery
		nTestCur = oneStepCloser(nTestCur, nTestTrg); 
		doRandomHead(nTestCur);
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
		
		var obj = getDirObjectFromId(idCharEval);
		var xMouse = mouseX - parseInt(obj.left) - ch.xBtwEye;
		var yMouse = mouseY - parseInt(obj.top) - ch.yBtwEye;
		frameTrace("raw mouseX="+mouseX+" raw mouseY="+mouseY+" xMouse="+xMouse+" yMouse="+yMouse);
	
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
				frameTrace("Picking random xMouse="+ch.xMouseFake+" yMouse="+ch.yMouseFake);
			}
		}
		
		ch.xMouseLast = xMouse;
		ch.yMouseLast = yMouse;
		frameTrace("nInactive="+ch.nInactive);
		
		// Sort of an override
		if (ch.fakingmouse)
		{
			xMouse = ch.xMouseFake;
			yMouse = ch.yMouseFake;
		}
			
	    ch.nLastBlink++;
	    
		ch.nLastRandom++;
		frameTrace("nLastRandom="+ch.nLastRandom);
	    
		if (ch.stopping)
		{
			ch.xTrg = 0;
			ch.yTrg = 0;
			ch.nTrg = 0;
		}
		else if (ch.state != "eyetrack" && ch.nInactive == 0 && ch.action == "eyetracker") 
		{	
			frameTrace("Cursor movement - back to tracking"); // snappy!
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
				frameTrace("Cursor movement - track target updated");
				ch.xTrg = xTrgNew;
				ch.yTrg = yTrgNew;
			}
		}			
		else if (ch.state == "eyetrack" && ch.nInactive >= 40) 
		{
			frameTrace("Bored of tracking - back to user");
			ch.state = "eyetrackstop";
			ch.xTrg = 0;
			ch.yTrg = 0;	
		}
		else if (ch.state == "randomheadattarget")
		{
			if (ch.nLastBlink > 60)
			{
				frameTrace("Time to blink");
				ch.state = "blink";
				ch.nFrameBlink = 1;
				ch.nLastBlink = 0;
			}
			else if (Math.random() < 0.03 && ch.nLastRandom > 20)  // distracting if it's too close together
			{
				ch.nTrg = chooseRandomHead();
				if (ch.nTrg != ch.nCur)
				{
					ch.state = "randomheadmove";
					frameTrace("Different random head "+ch.nTrg);
					ch.cFollow = 0;
				}
			}
		}
			    
	    if (ch.state == "user")
	    {
		    if (ch.nLastBlink > 60)
		    {
			    ch.state = "blink";
			    ch.nFrameBlink = 1;
			    ch.nLastBlink = 0;
		    }
			else if (ch.action == "eyetracker" || ch.action == "lookuseridle")
			{
				if (Math.random() < 0.03 && ch.nLastRandom > 20)
				{
					ch.nTrg = chooseRandomHead();
					frameTrace("New random head "+ch.nTrg);
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
		    doMoveHead(ch.xCur, ch.yCur);		
	    }
	    if (ch.nCur != ch.nTrg)
	    {
		    frameTrace("Random head cur=" + ch.nCur + " target=" + ch.nTrg);
		    ch.nCur = oneStepCloser(ch.nCur, ch.nTrg);
		    doRandomHead(ch.nCur);
		    ch.nLastRandom = 0;
	    }

        if (ch.nFrameBlink > 0)
	    {
	        frameTrace("Blink "+ch.nFrameBlink);
		    doBlink(ch.nCur, ch.nFrameBlink);
		    ch.nFrameBlink++;
		    if (ch.nFrameBlink == 5) {ch.state = "user"; ch.nFrameBlink = 0;}
	    }

        // Detect that we want to stop idle
        if (ch.idMsgNext)
        {
            ch.stopping = true;
        }

	    // Detect end of a motion
	    if (ch.stopping && ch.xCur == 0 && ch.yCur == 0 && ch.nCur == 0 && ch.nFrameBlink == 0)
	    {
		    ch.stopped = true;		
		    ch.stopping = false;		
		    ch.action = "";
		    debugTrace("Controller stopped");
            if (ch.fStopReached)   // See comments in this.stop
            {
                ch.complete = true;
                checkAllComplete(idCharEval);   
            }
            else
            {
                debugTrace("waiting for idle stop");
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
				ch.nTrg = chooseRandomHead();
				if (ch.nTrg != ch.nCur)
				{
					ch.state = "randomheadmove";
					frameTrace("Follow-on random head "+ch.nTrg);
					ch.cFollow++;
				}
			}
		}	
    }	
    
	function chooseRandomHead()
	{
		var ch = chars[idCharEval];
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
    
    //
    // Events
    //
    
    this.onPageLoad = function()
    {
        debugTrace("onPageLoad");
        
        // See matching at onDocLoad        
        pageLoaded = true;
        if (docLoaded && !startedUp)
        {
            startedUp = true;
            fireStartupEvents();
        }
        
        // Could do enableAutoMoveOnScroll('Movie1Div') here
    }

    this.onMouseMove = function(event) 
    {
        event = event || window.event; // IE-ism
        var rect = document.getElementById(idDiv).getBoundingClientRect();
        mouseX = event.clientX + curScrollLeft - rect.left;
        mouseY = event.clientY + curScrollTop - rect.top ;
    }

    this.onScroll = function()
    {
        curScrollTop = document.body.scrollTop;
        curScrollLeft = document.body.scrollLeft;
        debugTrace("onPageScroll "+curScrollTop+" "+curScrollLeft);
    }    
    
    function onFrame()
    {
        frameTrace("onFrame "+idDiv);
        if (!startShield && !idSceneLoading && !idSlideLoading && !idCharLoading && audioFilesLoading() == 0 && !loadingExternalMsg())
        {
            var t = (new Date()).getTime();
            var tCur = (t - tOfLastReport) + tLastReported;
            if (!ctl.Paused)
            {
                fireEvents(tCur);
            }
        }
        // Set in motion any captivate API
        dispatchCaptivate();
        // Similar for storyline web object
        dispatchStoryline();
                
        // REVIEW: Use requestAnimationFrame instead of setInterval/setTimeout - http://www.nczonline.net/blog/2011/05/03/better-javascript-animations-with-requestanimationframe/    
        setTimeout(function(){onFrame()}, 1000/dirRoot.fps);
    }
    
    // In the common case where we put up an alert on external comand, want to prevent a cascade
    var inFireEvents = false;

    // Fire events that occur in current presentation at or before time index tcur
    function fireEvents(tcur)
    {
        if (inFireEvents) return; // in case you have an event that triggers an alert
        inFireEvents = true;
        
        frameTrace("fireEvents "+tcur);    

        var eventHorizonGoingIn = eventHorizon;
        for (var idChar in chars)
        {
			if (chars[idChar].idScene != idSceneCur) continue;
            if (idCharLoading && idCharLoading != idChar)   // We call fireEvents once per char as part of the loading/switching process
                continue;
            if (chars[idChar].complete)         // Stop drawing when complete
                continue;
            var msg = getDirObjectFromId(chars[idChar].idMsg);
            if (msg) 
            {
                if (msg.external && objExternal)
                    msg = objExternal;
                if (msg && msg.onframe)
                {
                    for (var frame in msg.onframe)
                    {
                        if (frame == 0) continue;    // Frame 0 is the special load frame. Frame 1 begins at time index 0 and lasts to time index 1/fps
                        if (fMessedWithTime) {fMessedWithTime = false; break;} // as soon as we execute a branch, and have messed with time, break out of loop
                        var tevent = Math.floor((1000 * (frame-1)) / dirRoot.fps);
                        //frameTrace("Frame "+frame+" at time "+tevent);
                        if (tevent > eventHorizon && tevent <= tcur) // All frames that have not been executed, prior to the target time tcur
                        {
                            frameTrace(idChar + " frame "+frame+" ("+tevent+") reached at time "+tcur+" - executing "+msg.onframe[frame]);
                            
                            if (chars[idChar].fFirstFrameAfterRec)
                            {
                                frameTrace("first frame after rec - clearing character");
                                chars[idChar].aImgShow = [];
                                chars[idChar].fFirstFrameAfterRec = false;
                            }
                            
							chars[idChar].started = true; // we are about to start executing actions - we have officially started
							
                            // Reset safe zones
                            resetCharOpts(idChar);  
                            
                            idCharEval = idChar;
                            idMsgEval = chars[idChar].idMsg;
                            c = ctl;
                            fFromTimeline = true;
                            eval(msg.onframe[frame]);
                            fFromTimeline = false;
                            c = null;
                            idCharEval = null;
                            idMsgEval = null;
                            
                            // Redraw if safe zones are violated
                            if (fRedraw) redrawChar(idChar, msg.id);
                        }
                        else 
                        {
                            //frameTrace("Rejected");
                        }
                    }
                    
                    // Idle behavior for this character on this frame
                    if (chars[idChar].action != "")
                    {
                        // Reset safe zones
                        resetCharOpts(idChar);  
                    
                        idCharEval = idChar;
                        idMsgEval = chars[idChar].idMsg;
                        c = ctl;
                        ctlTrack();
                        c = null;
                        idCharEval = null;
                        idMsgEval = null;
                    
                        // Redraw if safe zones are violated
                        if (fRedraw) redrawChar(idChar, msg.id);
                    }     
                    
                    if (chars[idChar].charCanvas) stretchChar(idChar);
                }
            }
        }
        if (eventHorizon == eventHorizonGoingIn) // If not then it means we reset it, e.g. as part of a rec(), so don't touch it
        {
            if (tcur < eventHorizon)
            {
                frameTrace("Possible pause of animation for audio to catch up.");
            }
            else if (tcur > eventHorizon + 1.5*(1000/dirRoot.fps))
            {
                frameTrace("Possible skip of animation to catch up with audio (or recovering).");
            }
            eventHorizon = Math.max(eventHorizon, tcur); // event horizon never moves back
        }
        frameTrace("Event horizon now "+eventHorizon);
        
        inFireEvents = false;
    }
        
    // Central dispatcher for all other events
    this.msEvent = function(idObj, idEvent, data)
    {
        switch(idEvent)
        {
            // Audio events
            case 'audioonloadstart': audioonloadstart(idObj); break; 
            case 'audioonprogress': audioonprogress(idObj); break; 
            case 'audiooncanplaythrough': audiooncanplaythrough(idObj); break; 
            case 'audioonerror': audioonerror(idObj); break; 
            case 'audioonstalled': audioonstalled(idObj); break; 
            case 'audioonloadedmetadata': audioonloadedmetadata(idObj); break; 
            case 'audioonplaying': audioonplaying(idObj); break; 
            case 'audioonended': audioonended(idObj); break; 
            case 'audioontimeupdate': audioontimeupdate(idObj); break; 
            
            // Image load events
            case 'onload': onload(idObj); break;
            
            // Button events
            case 'buttonclick': buttonclick(idObj); break;
            case 'mouseover': buttonover(idObj); break;
            case 'mouseout': buttonout(idObj); break;
            case 'mousedown': buttondown(idObj); break;
            case 'mouseup': buttonup(idObj); break;

			// ButtonSet events
            case 'bsbuttonclick': bsbuttonclick(idObj,data); break;
            case 'bsmousedown': bsbuttondown(idObj,data); break;
            case 'bsmouseup': bsbuttonup(idObj,data); break;
			
            // Edit events
            case 'editchange': editchange(idObj); break;
            case 'editfocus': editfocus(idObj); break;
            
            // Keyboard events
            case 'keydown': keydown(idObj); break;

            // StartShield            
            case 'shieldclick': shieldclick(); break;
            
            default: errorTrace("unhandled event "+idEvent);
        }
    }
    
    // Audio events
    
    function audioonloadstart(idChar)
    {
        debugTrace("audioonloadstart "+idChar);
    }

    function audioonprogress(idChar)
    {
        debugTrace("audioonprogress "+idChar);
    }

    function audiooncanplaythrough(idChar)
    {
        debugTrace("audiooncanplaythrough "+idChar);
        var a = document.getElementById(idDiv + idChar + "Audio");        
        debugTrace("a.pause");
        a.pause();
        if (chars[idChar].loadingAudio) // on firefox we seem to get two of these
            onAudioLoadComplete(idChar);
    }

    function audioonerror(idChar)
    {
        var v = document.getElementById(idDiv + idChar + "Audio");
        debugTrace("audioonerror "+idChar);
        if (chars[idChar].loadingAudio) // If audio can't load, provide a warning, the proceed silently but move lips
        {
            // Can get error only from the DOM element on IE - for other browsers we would need to get from the event (REVIEW)
            errorTrace("Embedded character unable to play audio - will still move lips" + (typeof v.error == 'object' ? " - code " + v.error.code : ""));
            onAudioLoadComplete(idChar);
        }
    }

    function audioonstalled(idChar)
    {
        debugTrace("audioonstalled "+idChar);
    }

    function audioonloadedmetadata(idChar)
    {
        debugTrace("audioonloadedmetadata "+idChar);
    }

    function audioonplaying(idChar)
    {
        debugTrace("audioonplaying "+idChar);
    }

    function audioontimeupdate(idChar)
    {
        var v = document.getElementById(idDiv + idChar + "Audio");
        debugTrace("audioontimeupdate "+idChar+", "+Math.floor(v.currentTime * 1000));
        if (v.currentTime > 0 && !chars[idChar].fRecovering)    // Ignores 0 events that occur prior to actual start of audio
        {
            tLastReported = Math.floor(v.currentTime * 1000);
            tOfLastReport = (new Date()).getTime();
        }
    }

    function audioonended(idChar)
    {
        debugTrace("audioonended "+idChar);
        // We actually don't need to do anything special - count on animation actions to control everything
    }

    // Button events
    
    function buttonclick(idBtn)
    {
        debugTrace("buttonclick "+idBtn+" at "+(new Date()).getTime());
        var btn = getDirObjectFromId(idBtn);
        if (btn) 
        {
            // Checkbox/radio behaviors
            if (btn.toggleschosen)
            {
                btn.chosen = !btn.chosen;
                updateButton(btn.id);
            }
            if (btn.stayschosen)
            {
                btn.chosen = true;
                updateButton(btn.id);
            }
            if (btn.resetspeers)
            {
                for (var id in btn.parent.items)
                {
                    var peer = btn.parent.items[id];
                    if (peer.type == "button" && peer != btn)
                    {
                        peer.chosen = false;
                        updateButton(peer.id);
                    }
                }
            }
            
            var cmd = btn.onclick;
            if (cmd)
            {
                debugTrace("Executing: "+cmd);
                c = ctl;
                eval(cmd);
                c = null;
            }
        }
    }

    function buttonover(idBtn)
    {
        debugTrace("buttonover "+idBtn);
        getDirObjectFromId(idBtn).over = true;
        updateButton(idBtn);
    }

    function buttonout(idBtn)
    {
        debugTrace("buttonout "+idBtn);
        getDirObjectFromId(idBtn).over = false;
        updateButton(idBtn);
    }

    function buttondown(idBtn)
    {
        debugTrace("buttondown "+idBtn);
        getDirObjectFromId(idBtn).down = true;
        updateButton(idBtn);
    }

    function buttonup(idBtn)
    {
        debugTrace("buttonup "+idBtn);
        getDirObjectFromId(idBtn).down = false;
        updateButton(idBtn);
    }
    
    function editchange(idEdit)
    {
        debugTrace("editchange "+idEdit);
        var obj = getDirObjectFromId(idEdit);
        if (obj.variable)
        {
            var edit = document.getElementById(idDiv+idEdit+'Edit');
            if (edit && ctl[obj.variable] != edit.value)
            {
                debugTrace(obj.variable + " changed to " + edit.value);
                ctl[obj.variable] = edit.value;
				fireVariableChange();
            }
        }
    }

    function editfocus(idEdit)
    {
        debugTrace("editfocus "+idEdit);
        if (iPhone) // avoid auto-scroll on iphone on take focus - so you can line up an avatar just right and sliding keyboard does not mess up your view
        {
       	    debugTrace("iphone autoscroll to "+curScrollLeft+" "+curScrollTop);
            window.scrollTo(curScrollLeft,curScrollTop);
        }
    }

    function keydown(key)
    {
        debugTrace("keydown "+event.keyCode);
        if (event.keyCode == 13)
        {
            doDefaultBtnRecurse(getDirObjectFromId(idSceneCur));
        }
    }

    function doDefaultBtnRecurse(parent)
    {
        for (var objid in parent.items)
        {
            var obj = parent.items[objid];
            if (obj.type=="button")
            {
                if (obj.key == 'enter')
                    buttonclick(obj.id);
            }
            else if (obj.type=="slideshow" || obj.type=="slide" || obj.type=="grid")
            {
                doDefaultBtnRecurse(obj);
            }
        } 
    }
    
    //
    // API entry points
    //
    this.msSetTraceLevel = function(n)
    {
        traceLevel = n;
    }
    
    this.msPlay = function(idMsg)
    {
        infoTrace("msPlay('"+idMsg+"')");
        idMsg = getIdFromIdOrName(idMsg);   // switch to id addressing-only, as early as possible
        speakPlayQueue = [];
    
        var ex = ctl.Presenting;
        ctl.Presenting = true;
        if (ex != ctl.Presenting)
        {
            infoTrace("Firing onPresentingChange("+idDiv+","+ctl.Presenting+")");
            if (typeof onPresentingChange == 'function')
                onPresentingChange(idDiv, ctl.Presenting);
        }

        ex = ctl.Focus;    
        ctl.Focus = idMsg;
        if (ex != ctl.Focus)
        {
            infoTrace("Firing onFocusChange("+idDiv+","+ctl.Focus+")");
            if (typeof onFocusChange == 'function')
                onFocusChange(idDiv, ctl.Focus);
        }

        if (ctl.Presenting == false) return; // a chance for events to cancel
        
        if (getDirObjectFromId(ctl.Focus))
            focusChanged();
        else
            errorTrace("msPlay() - unknown message "+idMsg);
            
        dismissAnyStartShield();
    }
    
    this.msSpeak = function(text)
    {
        infoTrace("msSpeak('"+text+"')");
        speakPlayQueue = [];
        ctl.Presenting = true;
        ctl.Focus = getIdFromIdOrName("Speak");
        ctl.Text = text;
        
        if (getDirObjectFromId(ctl.Focus))
            focusChanged();
        else
            errorTrace("msSpeak() - no external message named Speak");
    }    
        
    this.msSpeakQueued = function(text)
    {
        infoTrace("msSpeakQueued('"+text+"')");
        if (!ctl.Presenting && !ctl.Restart)
        {
            ctl.Text = text; 
            ctl.Focus = getIdFromIdOrName("Speak"); 
            ctl.Presenting = true;
            
            if (getDirObjectFromId(ctl.Focus))
                focusChanged();
            else
                errorTrace("msSpeakQueued() - no message named Speak");
        }
        else
        {
            speakPlayQueue.push({type:"speak", data:text});
			fireQueueLengthChange();
        }
    }

    function restartFromQueue()
    {
        // If we were going to fire a transition to Presenting=false, but we have a queue item,
        // then we go right on presenting with that queue item.
        if (ctl.Presenting == false && speakPlayQueue.length > 0)
        {
            var o = speakPlayQueue.shift(); 
			fireQueueLengthChange();
            if (o.type == 'play')
            {
                ctl.Focus = o.data;
                ctl.Presenting = "true";
                infoTrace("Playing from queue with: "+Focus);
				focusChanged();
            }
            else if (o.type == 'speak')
            {
                ctl.Text = o.data;
                ctl.Focus = getIdFromIdOrName("Speak"); 
                ctl.Presenting = "true";
                infoTrace("Speaking from queue with: "+ctl.Text);
				focusChanged();
            }
            else if (o.type == 'playExternal')
            {
                infoTrace("Playing from queue with: "+o.data[0]+","+o.data[1]);
				msPlayExternalCore(o.data[0], o.data[1]);
            }
            return true;
        }
        return false;
    }

    this.msRespond = function(text)
    {
        infoTrace("msRespond('"+text+"')");
        speakPlayQueue = [];
        ctl.Presenting = true;
        ctl.Focus = getIdFromIdOrName("Respond");
        ctl.Text = text;
        
        if (getDirObjectFromId(ctl.Focus))
            focusChanged();
        else
            errorTrace("msRespond() - no external message named Respond");
    }    
    
    this.msStart = function()
    {
        infoTrace("msStart()");
        speakPlayQueue = [];
        this.startPresenting();
    }

    this.msStop = function()
    {
        infoTrace("msStop()");
        speakPlayQueue = [];
        this.stopPresenting();
    }

    this.msGetVariable = function(name)
    {
        return this[name];
    }

    this.msSetVariable = function(name, value)
    {
        this[name] = value;
    }

	function fireVariableChange() 
	{
		// does NOT fire with msSetVariable(s) API
	    if (typeof onVariableChange == 'function')
            onVariableChange(idDiv);
	}
	
    this.msGetVariables = function()
    {
		// User variables begin with uppercase
		var o = {};
		for (key in this)
		{
			if (key.substr(0,1).toUpperCase() == key.substr(0,1) && key != "Presenting" && key != "Focus" && key != "Paused" && key != "Muted") 	// These variables are historically-named
				o[key] = this[key];
		}
		return o;
    }

    this.msSetVariables = function(o)
    {
		for (key in o)
		{
			this[key] = o[key];
		}
    }
	
    this.msStartShieldUp = function()
    {
        return startShield;
    }
	
    this.msPlayExternalQueued = function(proj, id)
    {
        infoTrace("msPlayExternalQueued("+proj+", "+id+")");
        if (!ctl.Presenting && !ctl.Restart && !projGraft)
        {
			msPlayExternalCore(proj, id, true);
        }
        else
        {
            speakPlayQueue.push({type:"playExternal", data:[proj, id]});
			fireQueueLengthChange();
        }
    }
	
	function fireQueueLengthChange()
	{
		infoTrace("Firing onQueueLengthChange("+idDiv+","+speakPlayQueue.length+")");
		if (typeof onQueueLengthChange == 'function')
			onQueueLengthChange(idDiv, speakPlayQueue.length);
	}
	
	this.msPlayExternal = function(proj, id)
	{
		infoTrace("msPlayExternal("+proj+", "+id+")");
		msPlayExternalCore(proj, id);
	}
	
	function msPlayExternalCore(proj, id)
	{
		debugTrace("msPlayExternalCore");
		// if target is already grafted in, behave like a regular play
		if (getDirObjectFromId(proj+id))
		{
			speakPlayQueue = [];
			ctl.Presenting = true;
			ctl.Focus = getIdFromIdOrName(id);
		}
		else
		{
			projGraft = proj;
			idGraft = id;

			// Attach data file - think about this load as happening concurrently with normal loads and does not affect the normal load/switch process
			var scr = document.createElement('script');
			var div = document.getElementById(idDiv);
			div.appendChild(scr);
			var url = base + '/' + projGraft + '.js';
			debugTrace("loading "+url);
			scr.src = url;
			// see msDocLoaded -> aDocLoaded -> finishPlayExternal()
			// Normally, because a touch results in a graft load first, you'd think we could not preload the audio for mobile browsers. 
			// But it is actually possible since we know the audio file. But the Queued variety of calls can never be made to autostart,
			// so not sure how much that buys us. The following code works, but would need an additional layer of logic to sync with the rest.
			// file = base + '/' + projGraft + idGraft + '.mp3';
			// altfile = base + '/' + projGraft + idGraft + '.ogv';
			// for (var idChar in chars)	// for msPlayExternal - take first char
			// {
			// 	if (chars[idChar].idScene != idSceneCur) continue;
			// 	break;
			// }
			// startAudioLoadActual(idChar, file, altfile);
		}
	}
	
	function finishPlayExternal()
	{
		debugTrace("finishPlayExternal");
		var extRoot = window[projGraft + '_Dir'];
		prepDirExtRec(extRoot, ""); // get all the id and parent fields, but don't add to dirHash just yet
		// assume the external message is at the root of the first scene of in a slideshow at the root of the scene
		// assume furthermore that when using playExternal, we no longer care about next/prev navigation. 
		// id conflicts are okay - we might end up loading a Msg1 on top of an old Msg1 - that's okay.
		// use a matching scene name to find the scene in the container where we graft into.
		var msgGraft = findGraftRec(extRoot);
		var slideGraft = (msgGraft.parent.type == 'slide' ? msgGraft.parent : null);
		var graftScene = getContainingElementOfType('scene', msgGraft);
		var newSceneId = getIdFromIdOrName(graftScene.name);
		var newScene = getDirObjectFromId(newSceneId);
		if (slideGraft)
		{
			// Merge the new slide in
			var newSlideshowId = getFirstItemOfTypeInObj('slideshow', newScene)
			var newSlideshow = getDirObjectFromId(newSlideshowId);
			newSlideshow.items[slideGraft.id] = slideGraft; // actual merge
			prepDirRec(newSlideshow, newSlideshow.id); // rebuilds dirHash, parent links, etc.
			// Realize the DOM for the slide just as if it had always been there...
			var s = renderSlide(slideGraft.id, newSlideshow);
			var divSlideshow = document.getElementById(idDiv + msgGraft.parent.parent.id + "Inner");
			divSlideshow.innerHTML = s;
			idSlideCur = ""; // we may replace Slide1 with Slide1 but they really are different
		}
		else
		{
			// Merge the new msg in
			newScene.items[msgGraft.id] = msgGraft; // actual merge
			prepDirRec(newScene, newScene.id); // rebuilds dirHash, parent links, etc.
        }
		// Now the magic is complete - we can just switch to it as if we were a regular msPlay request
		ctl.Presenting = true;
		ctl.Focus = getIdFromIdOrName(idGraft);
		projGraft = null;
		idGraft = null;
        if (getDirObjectFromId(ctl.Focus))
            focusChanged();
        else
            errorTrace("msPlayExternal() - unknown message "+ctl.Focus);
	}
    
    function prepDirExtRec(parobj, parid)
    {
        for (var id in parobj.items)
        {
            var obj = parobj.items[id];
            obj.id = id;                // so given an obj when can quick get back to id
            obj.parent = parobj;        // so we can walk up the containment chain
            if (obj.hasOwnProperty("items"))
                prepDirExtRec(obj, id);
        }
    }
	
	function findGraftRec(parobj)
    {
        for (var id in parobj.items)
        {
			var obj = parobj.items[id];
			if (id == idGraft) return obj;
            if (obj.hasOwnProperty("items"))
			{
                var t = findGraftRec(obj);
				if (t) return t;
			}
        }
		return null;
    }
	
	// Sequencer support
			
	this.msRunSequencer = function(machine, input)
	{
		if (!input) // call without input to start up
		{
			seqState = "Start";
			seqInput = "Ok";
			infoTrace("Initial state: "+seqState);
			crank(machine);
		}
		else
		{
			seqInput = input;
			infoTrace("Restarting machine with: "+seqInput);
			crank(machine);
		}
	}
	
	function crank(machine)
	{
		if (seqState == "Stop") return;
		for(;;)
		{
			var state = machine[seqState];
			if (!state) {errorTrace("missing state "+seqState); return;}
			
			var consider = [];
			for (var i = 0; i < state.transitions.length; i++)
			{
				var a = state.transitions[i];
				if (a[0].toLowerCase() == seqInput.toLowerCase() || a[0] == '*')
				{
					var ok = true;
					if (a[1])
					{
						c = ctl;
						ok = eval(a[1]);
						c = null;
					}
					if (ok)
					{
						consider.push(i);
						break;
					}
				}
			}
			if (consider.length == 0)
			{
				if (seqInput != "") infoTrace("No transition possible for input: "+seqInput);
				break;
			}
			else
			{
				infoTrace("Taking transition "+(consider[0]+1));
				var a = state.transitions[consider[0]];
				var code = a[2];
				c = ctl;
				eval(code);
				c = null;
				seqState = a[3];
				seqInput = "";  // input consumed
				if (code.indexOf("msSetVariable") != -1) fireVariableChange();
				infoTrace("New state: "+seqState);
				if (seqState == "Stop")
					break;
				else
				{
					// now the enter actions for the next state
					state = machine[seqState];
					code = state.actions;
					if (code)
					{
						c = ctl;
						eval(code);
						c = null;
						if (code.indexOf("msSetVariable") != -1) fireVariableChange();
					}
				}
			}
		}
	}	

    // Widget support
    this.onLoad = function() 
    { 
        if (!this.captivate) return; 
        ctl.vh = this.captivate.CPMovieHandle.getMovieProps().variablesHandle; 
    }
    
    function dispatchCaptivate()
    {
        if (!ctl.vh) return;
        var s;
        s = ctl.vh.cp.variablesManager.getVariableValue('msPlay');
        if (s) {ctl.msPlay(s); ctl.vh.cp.variablesManager.setVariableValue('msPlay','');}
    }

    function dispatchStoryline()
    {
        try
        {     
			if (!parent.GetPlayer) return;
			var s = parent.GetPlayer().GetVar('msPlay');
			if (s) {ctl.msPlay(s); parent.GetPlayer().SetVar('msPlay','');}
        }
        catch (e) {}
    }

    function captivateExternalCommand(c, a)
    {    
        if (!ctl.vh) return;
        ctl.vh.cp.variablesManager.setVariableValue(c, a);
    }
    
/**
 * Spin.js
 * Copyright (c) 2011 Felix Gnass [fgnass at neteye dot de]
 * Licensed under the MIT license
 */

  var prefixes = ['webkit', 'Moz', 'ms', 'O']; /* Vendor prefixes */
  var animations = {}; /* Animation rules keyed by their name */
  var useCssAnimations;

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div');
    var n;

    for(n in prop) {
      el[n] = prop[n];
    }
    return el;
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++) {
      parent.appendChild(arguments[i]);
    }
    return parent;
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = function() {
    var el = createEl('style');
    ins(document.getElementsByTagName('head')[0], el);
    return el.sheet || el.styleSheet;
  }();

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-');
    var start = 0.01 + i/lines*100;
    var z = Math.max(1-(1-alpha)/trail*(100-start) , alpha);
    var prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase();
    var pre = prefix && '-'+prefix+'-' || '';

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:'+z+'}' +
        start + '%{opacity:'+ alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail)%100 + '%{opacity:'+ alpha + '}' +
        '100%{opacity:'+ z + '}' +
        '}', 0);
      animations[name] = 1;
    }
    return name;
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   **/
  function vendor(el, prop) {
    var s = el.style;
    var pp;
    var i;

    if(s[prop] !== undefined) return prop;
    prop = prop.charAt(0).toUpperCase() + prop.slice(1);
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop;
      if(s[pp] !== undefined) return pp;
    }
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop) {
      el.style[vendor(el, n)||n] = prop[n];
    }
    return el;
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i];
      for (var n in def) {
        if (obj[n] === undefined) obj[n] = def[n];
      }
    }
    return obj;
  }

  /**
   * Returns the absolute page-offset of the given element.
   */
  function pos(el) {
    var o = {x:el.offsetLeft, y:el.offsetTop};
    while((el = el.offsetParent)) {
      o.x+=el.offsetLeft;
      o.y+=el.offsetTop;
    }
    return o;
  }

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    rotate: 0,            // rotation offset
    color: '#000',        // #rgb or #rrggbb
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: 'auto',          // center vertically
    left: 'auto'          // center horizontally
  };

  /** The constructor */
  var Spinner = function Spinner(o) {
    if (!this.spin) return new Spinner(o);
    this.opts = merge(o || {}, Spinner.defaults, defaults);
  };

  Spinner.defaults = {};
  merge(Spinner.prototype, {
    spin: function(target) {
      this.stop();
      var self = this;
      var o = self.opts;
      var el = self.el = css(createEl(0, {className: o.className}), {position: 'relative', zIndex: o.zIndex});
      var mid = o.radius+o.length+o.width;
      var ep; // element position
      var tp; // target position

      if (target) {
        //target.insertBefore(el, target.firstChild||null);
        target.appendChild(el); // MS mod from above line
        tp = pos(target);
        ep = pos(el);
        css(el, {
          left: (o.left == 'auto' ? tp.x-ep.x + (target.offsetWidth >> 1) : o.left+mid) + 'px',
          top: (o.top == 'auto' ? tp.y-ep.y + (target.offsetHeight >> 1) : o.top+mid)  + 'px'
        });
      }

      el.setAttribute('aria-role', 'progressbar');
      self.lines(el, self.opts);

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0;
        var fps = o.fps;
        var f = fps/o.speed;
        var ostep = (1-o.opacity)/(f*o.trail / 100);
        var astep = f/o.lines;

        !function anim() {
          i++;
          for (var s=o.lines; s; s--) {
            var alpha = Math.max(1-(i+s*astep)%f * ostep, o.opacity);
            self.opacity(el, o.lines-s, alpha, o);
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps));
        }();
      }
      return self;
    },
    stop: function() {
      var el = this.el;
      if (el) {
        clearTimeout(this.timeout);
        if (el.parentNode) el.parentNode.removeChild(el);
        this.el = undefined;
      }
      return this;
    },
    lines: function(el, o) {
      var i = 0;
      var seg;

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.width>>1) + 'px'
        });
      }
      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, i, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        });
        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}));
        ins(el, ins(seg, fill(o.color, '0 0 1px rgba(0,0,0,.1)')));
      }
      return el;
    },
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val;
    }
  });

  window.Spinner = Spinner;

    
}


// Ancillary API

function DetectHTML5()
{
    var detect = document.createElement('audio') || false;
    var audio = detect && typeof detect.canPlayType !== "undefined";
    var elem = document.createElement('canvas'); 
    var canvas = !!(elem.getContext && elem.getContext('2d')); 
    return audio && canvas;
}

function msGetFlash(movieName) 
{
    if (navigator.appName.indexOf("Microsoft") != -1) 
        return window[movieName];
    else 
        return document[movieName];
}

function msIsFlash(x) 
{
    return x.toString() == '[object HTMLEmbedElement]' || x.toString() == '[object HTMLObjectElement]';
}

function msIsHTML5(x) 
{
    return x.toString() == '[object HTMLDivElement]' && x.hasOwnProperty('ctl');
}

function msDocLoaded()
{
    // When a script is attached with a project js file, it sets the top level variable msXXXDir to the json, then call this fn
    for (var i = 0; i < msEmbeddings.length; i++)
    {
        var ctl = msEmbeddings[i];
        ctl.aDocLoaded();
    }
}

function msVectorLoaded()
{
    for (var i = 0; i < msEmbeddings.length; i++)
    {
        var ctl = msEmbeddings[i];
        ctl.aVectorLoaded();
    }
}

function msEvent(idDiv, idObj, idEvent, data)
{
    var div = document.getElementById(idDiv);
    div.ctl.msEvent(idObj, idEvent, data);
}

// Core API - wrappers that dispatch to either Flash or HTML5

function msPlay(idX, idMsg)
{
    var x = document.getElementById(idX); if (x == null) x = msGetFlash(idX);
    if (msIsFlash(x)) x.msPlay(idMsg); else if (msIsHTML5(x)) x.ctl.msPlay(idMsg);
}

function msSpeak(idX, text)
{
    var x = document.getElementById(idX); if (x == null) x = msGetFlash(idX);
    if (msIsFlash(x)) x.msSpeak(text); else if (msIsHTML5(x)) x.ctl.msSpeak(text);
}

function msSpeakQueued(idX, text)
{
    var x = document.getElementById(idX); if (x == null) x = msGetFlash(idX);
    if (msIsFlash(x)) msGetFlash(idX).msSpeakQueued(text); else if (msIsHTML5(x)) x.ctl.msSpeakQueued(text);
}

function msRespond(idX, text)
{
    var x = document.getElementById(idX); if (x == null) x = msGetFlash(idX);
    if (msIsFlash(x)) x.msRespond(text); else if (msIsHTML5(x)) x.ctl.msRespond(text);
}

function msStart(idX)
{
    var x = document.getElementById(idX); if (x == null) x = msGetFlash(idX);
    if (msIsFlash(x)) x.msStart(); else if (msIsHTML5(x)) x.ctl.msStart();
}

function msStop(idX)
{
    var x = document.getElementById(idX); if (x == null) x = msGetFlash(idX);
    if (msIsFlash(x)) x.msStop(); else if (msIsHTML5(x)) x.ctl.msStop();
}

function msGetVariable(idX, name)
{
    var x = document.getElementById(idX); if (x == null) x = msGetFlash(idX);
    if (msIsFlash(x)) return x.msGetVariable(name); else if (msIsHTML5(x)) return x.ctl.msGetVariable(name);
}

function msSetVariable(idX, name, value)
{
    var x = document.getElementById(idX); if (x == null) x = msGetFlash(idX);
    if (msIsFlash(x)) x.msSetVariable(name, value); else if (msIsHTML5(x)) x.ctl.msSetVariable(name, value);
}

function msGetVariables(idX)
{
    var x = document.getElementById(idX);
    if (msIsHTML5(x)) return x.ctl.msGetVariables();
	else return {};
}

function msSetVariables(idX, o)
{
    var x = document.getElementById(idX);
    if (msIsHTML5(x)) x.ctl.msSetVariables(o);
}

function msSetTraceLevel(idX, n)
{
    var x = document.getElementById(idX); 
    if (msIsHTML5(x)) x.msSetTraceLevel(n);
}

function msStartShieldUp(idX)
{
    var x = document.getElementById(idX);
    if (msIsHTML5(x)) return x.ctl.msStartShieldUp();
	else return false;
}

function msPlayExternal(idX, proj, id)
{
    var x = document.getElementById(idX);
    if (msIsHTML5(x)) x.ctl.msPlayExternal(proj, id);
}

function msPlayExternalQueued(idX, proj, id)
{
    var x = document.getElementById(idX);
    if (msIsHTML5(x)) x.ctl.msPlayExternalQueued(proj, id);
}

function msRunSequencer(idX, machine, input)
{
    var x = document.getElementById(idX);
    if (msIsHTML5(x)) x.ctl.msRunSequencer(machine, input);
}
