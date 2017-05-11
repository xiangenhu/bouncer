// debugTrace( -> //debugTrace(
// frameTrace( -> //frameTrace(
// function //debugTrace -> function debugTrace
// function //frameTrace -> function frameTrace
// ".js" -> ".min.js"
// then, *in chrome*, http://closure-compiler.appspot.com/home
// ==ClosureCompiler==
// @output_file_name MSHTML5.min.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==

/** 
  * @preserve Copyright (c) 2012-2016 Media Semantics, Inc. 
  * Loading spinner is copyright (c) 2011 Felix Gnass.
  */
  
// Creation API
function msEmbed(idDiv, project, base, widthEmbed, heightEmbed)
{
    // MSHTML5Control is a little "controller" object attached to the div
    var ctl = new MSHTML5Control(idDiv, project, base, widthEmbed, heightEmbed)
    if (typeof msEmbeddings == 'undefined')
        msEmbeddings = [];
    msEmbeddings.push(ctl);                // Global array that contains all our controls - another way to get back to us

    // Parameters
    for (var i = 5; i < arguments.length; i=i+2) 
    {
        var n = arguments[i];
        var v = arguments[i+1];
		if (n == 'Presenting' || n == 'Focus')
			n = 'Override' + n;
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
	
	var oldonmousemove; 
	if (typeof onmousemove != 'function') 
	{ 
		onmousemove = function(event) {ctl.onMouseMove(event)}; 
	} 
	else // don't interfere with any other onloads
	{ 
		oldonmousemove = onmousemove; 
		onmousemove = function(event) 
		{ 
			if (oldonmousemove) 
				oldonmousemove(); 
			ctl.onMouseMove(event); 
		} 
	}
}	
	
function MSHTML5Control(idDiv, project, base, widthEmbed, heightEmbed)
{
    // So idDiv, project, base, widthEmbed, heightEmbed are global

    // IMPORTANT - other than in this creation fn, we use 'ctl' instead of 'this' in the code, to refer to globals vars, 
    // because 'this' is the wrong value when reacting to events and timers.

	var ctl = this;
	
	// Used on eval to get back to the right control in a multi-scene page
	this.c = null;
	
	// Similar to c, but used to compute 'this' in BuilderScript expressions. E.g. when evaluating a text field expression, this is the textfield dir object.
	this.bsthis = null;
    
	this.idDiv = idDiv;
	this.base = base;
	this.widthEmbed = widthEmbed;
	this.heightEmbed = heightEmbed;

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
    var traceLevel = 2;
    
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
	var switching = true;				// true during entire time animation is not running - see allCharLoadsAndAudioComplete
	var stopHit = false;				// used to safely transition out of fireEvents on a stop
	var focusHit = false;				// used to safely transition out of fireEvents on a focus change
    var idSceneLoading = null;          // Non-null when loading scene
    var idSlideLoading = null;          // Non-null when loading slide
    var idCharLoading = null;           // Non-null when loading char
    var idMsgLoading = null;            // Non-null when loading a message

	// If a focus change happens while we are loading/switching, then it effectively waits until the loading is done.
	var changingFocus = false;
	var deferFocusChanged = false;

	// Modules - the first thing to load after the doc file, based on root modules parameter
    var nModuleLoading = 0;             // When loading modules, number of outstanding loads
	var modules = {};					// Modules, indexed by module id
	
    // Image loading - one scene, slide, or message loads at a time
    var nImgLoading = 0;                // When loading images, number of outstanding loads
    var aImg = {};                      // Outstanding loads indexed by img id - used to load the images, then transfered to char aImg - empty during animation phase

	// An img is either an HTML Image, for bitmaps, or an object, for a vector image. Currently we render vectors as needed, into the canvas, during animation.
	// For bitmaps, we keep an image pool, allowing us to reuse them.

    var imgPool = [];					// Raster image pool - see allocImage, freeImage
    
    // Character
    var chars = {};                     // This is a hash from charId to an object that serves as a bag of state vars
                                        // So chars[charId].xSafe gets to the xSafe field
										
    // This is the char state:
    // idScene                          // Scene - can ignore chars that are not on current scene
    // aImg                             // Loaded images - these are transferred from aImg - a hash
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
    // action                        	// Normally "" - currently active idle controller
	// frame							// See gotoFrame
    
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
	var idInstEval = "";                // If evaluating a CBScript fn, in the context of an exernal message, this is a unique instance of the current message, otherwise it is ""
	var uniqueInst = 0;					// Used to compute idInstEval
    var loadTo = 0;                     // During loading, reaching this non-zero frame's worth of bitmaps will stop the loading
    var fRedraw;                        // Used during character frame processing - as soon as we do something that can't be rendered with just a blit we flag a redraw and deal with it after all the commands are in
    var fFromTimeline;                  // True during timeline processing
    var xSafe;                          // Used for redraw optimization - if next showimg is contained or equal to the safe rect then we can just blit
    var ySafe;
    var cxSafe;
    var cySafe;

    // Idles are treated just like regular messages for the most part, except that they have no audio and are looped, 
    // so they effectively have infinite length. 
    
    // Frame/event timing. A character uses time-based event firing when audio is playing, so events can be accelerated/slowed-down
	// to match audio. In a dialog, multiple characters may run in lockstep, while they are both playing audio.
    var eventHorizon = -1;    // The last time for which we have fired all events
    var tLastReported = 0;    // The last time-into-audio track reported 
    var tOfLastReport = 0;    // The real time when this report occurred
	var tOfLastFrame = 0; 	  // The real of the last animation frame - used to maintain fps
	var tOfLastIdle = 0;	  // Used to divide the frame rate to keep idles at ~12fps
	var gotoFrameOccurred = false; // Used in fireEvents when processing a gotoFrame to avoid incrementing the frame
    
    // External messages
    var idExternalLoading = null;       // Non-blank while going out to the server to fetch an external message
    var idMsgExternal = null;
    var objExternal = null;            	// During an external message, holds the json from the server
    var urlExternal = null;            	// Used during switchCharTo to pass context to load

    // Queues
    var speakPlayQueue = [];            // Objects of form     {type:"speak", data:string}

	// Preloading - we only do a very limited instance of this - basically the next msSpeak request in the queue is pulled
	var preloading = false;
	var preloaded = false;
	var preloadURL = null;
	var preloadData = null;
	var preloadAudio = null;
	
    // Compatibility
    var oldsyntax = false;

    // Bubble
    var bubbleBody = null;
    var bubbleTail = null;

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

	// Movies
	var idPlayUntil;				// if not undefined, movie to stop at given timePlayUntil
	var timePlayUntil;				// for playUntil
	var initialMovieCurrentTime;	// if time set when not yet loaded
    
	// Misc functions and autostart
	var cmsInactivity = 0;				// if non-0, counted down - when reaches 0 and idle, we startPresenting - reset on focusChanged
	var cmsInteraction = 0;
	var cmsNavigation = 0;
	var whichAutoStart = 0;
	var suspendAutoStart = false;
	var inactiveCount = 0;
	var lastSeen;
	var lastTouched;
	
    // Platform detection
    var iPhone = navigator.userAgent.match(/iPhone/i);
    var iPad = navigator.userAgent.match(/iPad/i);
    var android = navigator.userAgent.match(/android/i);
    var safari = navigator.userAgent.match(/AppleWebKit/i) && !android;
    //iPhone = true; // test
    //android = true; //test
	
	var deferSetFocus;

	// Switching messages consists of the following phases.
	// - During the message (or idle, which is just a special kind of message that loops and has no audio),
	//   a focus change event is received. (If we are already switching focus, then the request is placed in a 
	//   special "deferred" slot for processing later, when we have switched.)
	// - Immediately we pause the current audio and set in motion the load for the next audio. This is because
	//   mobile requires audio loads to start on the button push thread. We also, by virtue of declaring a "next"
	//   message for the character (and a stop request if this is an idle with a controller), we set in motion the 
	//   smooth return of the character(s) to the default pose, and mark them "complete". We check that this "recovery" 
	//   process is complete in checkAllComplete().
	// - Once recovery is complete, we stop executing frames and begin a loading process with switchChars()
	// - For each character in the scene, we go through two phases - SwitchCharPart1 is about loading any frame
	//   data files or external messages. (For external messages, this is actually the second request out to the 
	//   server - the first was the audio request.) SwitchCharPart2 is about loading and preparing all images needed
	//   by that message.
    
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
		loadModules();
		//onModulesLoaded(); // handy test-bypass
    }

    function initVars()
    {
		// Initialize variables
		if (dirRoot.variables)
		{
			c = ctl;
			bsthis = dirRoot;
			try{
			eval(dirRoot.variables);
			} catch (e) {if (traceLevel >= 2) debugger}
			c = null;
			bsthis = null;
		}
	}	

    function fireStartupEvents()
    {
        debugTrace("fireStartupEvents");

        // Initial Presenting
        ctl.Presenting = (dirRoot.presenting == true && !startShield);
		if (ctl.OverridePresenting != undefined) 
			ctl.Presenting = ctl.OverridePresenting;
                
        // Initial Focus
        for (var id in dirRoot.items)
        {
            ctl.Focus = id;
            break;
        }
		if (ctl.OverrideFocus != undefined) 
			ctl.Focus = ctl.OverrideFocus;

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
			bsthis = dirRoot;
			try{
			eval(dirRoot.onload);
			} catch (e) {if (traceLevel >= 2) debugger}
			c = null;
			bsthis = null;
		}
		
        // No flashvars with HTML - we get it first from the project, then get a chance to override in onSceneLoaded
        infoTrace("Firing onSceneLoaded("+idDiv+")");
        if (typeof onSceneLoaded == 'function')
            onSceneLoaded(idDiv);
		fireFocusChange();
		firePresentingChange();
    
		// Chances are one of the above hooks resulted in a play and, as a result, a focus change, but if not, then trigger one now
		if (!changingFocus)
		{
			focusChanged();
		}	

		// setup frame timer already - we will use it for the scene loading feedback
		//setTimeout(function(){onFrame()}, 1000/dirRoot.fps);    
		requestAnimationFrame(onFrame);
	}        
    
	// requestAnimationFrame polyfill
	(function() {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
									   || window[vendors[x]+'CancelRequestAnimationFrame'];
		}
	 
		if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function(callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function() { callback(currTime + timeToCall); },
				  timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
	 
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
	}());	
	
	//
	// Modules
	//

	// The following are exposed by the ctl only so they can be called by other modules
    this.getDirObjectFromId = getDirObjectFromId;
    this.debugTrace = debugTrace;
    this.frameTrace = frameTrace;
	
    this.checkAllComplete = checkAllComplete; // controllers call this 
    this.idleToIdle = idleToIdle; // controllers call this 
	
	function loadModules()
	{
		debugTrace("loadModules");
        // Attach data file
		var aid = dirRoot.modules ? dirRoot.modules.split(",") : [];
		nModuleLoading = 0;
		for (var i = 0; i < aid.length; i++)		
		{
			var id = aid[i];
            if (window["MSModule_"+id])
            {
                modules[id] = window["MSModule_"+id]; 
            }
			else
			{
				modules[id] = {loading:true};	// marks modules still loading
				var scr = document.createElement('script');
				var div = document.getElementById(idDiv);
				div.appendChild(scr);
				var url = getBasedURL("MSHTML5_" + id + ".js");
				nModuleLoading++;
				scr.src = url;
			}	
		}
		if (nModuleLoading == 0) onModulesLoaded();
	}

	this.aModuleLoaded = function()
	{
        // When a module is attached during loading phase, it sets the top level variable msXXX to the json, then calls this fn
        // Note: called when *a* module has loaded - not even necessarily from our embedding!
        debugTrace("aModuleLoaded");
        for (var id in modules)
        {
            var module = modules[id];
            if (module.loading)
            {
                // Is it now loaded?
                var o = window["MSModule_"+id];
                if (o)
                {
					modules[id] = o;
                    nModuleLoading--;
                    debugTrace("aModuleLoaded - " + nModuleLoading + " queued");
                }                    
            }
        }
		if (nModuleLoading == 0)
			onModulesLoaded();	
	}
	
	function onModulesLoaded()
	{
		debugTrace("onModulesLoaded");
		initVars();
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
            else if (obj.type=="image")
            {
                s += renderImage(objid, obj);
            }
            else if (obj.type=="movie")
            {
                s += renderMovie(objid, obj);
            }
            else if (obj.type=="sound")
            {
                s += renderSound(objid, obj);
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
            else if (obj.type=="line" || obj.type=="arrow")
            {
                s += renderLine(objid, obj);
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
            else if (obj.type=="message" || obj.type=="dialog")
            {
            }
            else
            {   
				var t = obj.type == "component" ? obj.class : obj.type;
				for (var name in modules)
				{
					if (t == name)
					{
						var ss = modules[name].render(ctl, obj);
						if (ss) {s += ss; break;}
					}	
				}	
            }
        }
        return s;    
    }

    function renderGrid(objid, obj)
    {
        s = "";
        s += '<div id="'+idDiv+objid+'Div" style="position:absolute; display:'+(obj.hidden?'none':'block')+'; left:'+obj.left+'px; top:'+obj.top+'px; width:'+obj.width+'px; height:'+obj.height+'px">';
        s += '<div id="'+idDiv+objid+'Inner" style="position:relative; left:0px; top:0px; width:'+obj.width+'px; height:'+obj.height+'px">';
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
        
        s += '<div id="'+idDiv+objid+'Div" style="pointer-events:none; position:absolute; left:'+o.x+'px; top:'+o.y+'px; width:'+o.cx+'px; height:'+o.cy+'px">';
          s += '<canvas style="pointer-events:none;" id="'+idDiv+objid+'Canvas" width="'+o.cx+'" height="'+o.cy+'"></canvas>';
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
            "complete":false,
			"fFirstFrameAfterRec":false,
			"frame":0
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


    function renderStartShield()
    {
        if (dirRoot.allowautoplay == "always") return;
        if (dirRoot.allowautoplay == "never" ||
            (iPhone||iPad||android) && dirRoot.presenting == true && !dirRoot.noaudio) // or "detect", the default
        {
            infoTrace("allowautoplay - initially presenting, have audio: putting up StartShield, Presenting now false");
            var c = "'" + idDiv + "',null," + "'shieldclick'"; 
            s += '<canvas id="'+idDiv+'StartShield" style="position:absolute; left:0px; top:0px;" width="'+widthEmbed+'px" height="'+heightEmbed+'px" onclick="msEvent('+c+')"/></canvas>';
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
		e.style.display = 'none';
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
			e.style.display = 'none';
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
        var a = "'" + idDiv + "','" + objid + "',";
        var vlm = a + "'videoonloadedmetadata'";
		var s = '<div id="'+idDiv+objid+'Div" style="position:absolute; left:'+obj.left+'px; top:'+obj.top+'px;">';
		s += '<video id="'+idDiv+objid+'Video" width="'+obj.width+'" height="'+obj.height+'" onloadedmetadata="msEvent('+vlm+')"' + (obj.controls ? ' controls ':'') + '>';
		s += '<source src="'+getBasedURL(obj.file)+'" type="video/mp4">';
		if (obj.altfile) s += '<source src="'+getBasedURL(obj.altfile)+'" type="video/ogg">';
		s += '</video></div>';
        return s;
    }

    function renderSound(objid, obj)
    {
		var s = '<audio id="'+idDiv+objid+'Audio"' + '>';
		s += '<source src="'+getBasedURL(obj.file)+'" type="audio/mp3">';
		s += '</audio>';
        return s;
    }
	
    function renderBubble()
    {
        if (oldsyntax) s += '<canvas id="BubbleLayer" style="position:absolute; left:0px; top:0px;" width="'+widthEmbed+'" height="'+heightEmbed+'"/></canvas>';
    }
	
    function renderText(objid, obj)
    {
		t = "";
		if (obj.face) t += "; font-family:" + obj.face;
		if (obj.size) t += "; font-size:" + obj.size + "px";
		if (obj.color) t += "; color:" + obj.color;
		if (obj.align) t += "; text-align:" + obj.align;
		if (obj.bold) t += "; font-weight:bold";
		if (obj.italic) t += "; font-style:italic";
        var s = "";
		if (obj.text.indexOf("<p") != -1) s += "<style>p {line-height:50%;}</style>";
        s += '<div id="'+idDiv+objid+'Div" style="position:absolute; display:'+(obj.hidden ? 'none' : 'block')+'; white-space:'+(obj.multiline ? 'wrap' : 'nowrap')+'; left:'+obj.left+'px; top:'+obj.top+'px; width:'+obj.width+'px; height:'+obj.height+'px'+t+'">';
        s += obj.text;
        s += '</div>';
        return s;
    }

    function renderEditControl(objid, obj)
    {
        var s = "";
        s += '<div id="'+idDiv+objid+'Div" style="display:'+(obj.hidden?'none':'block')+'; position:absolute; left:'+obj.left+'px; top:'+obj.top+'px;" width="'+obj.width+'" height="'+obj.height+'">';
        var a = "'" + idDiv + "','" + objid + "',";
        var b = a + "'editchange'";
        var c = a + "'editfocus'";
		var extracss = (obj.fontname ? 'font-family:' + obj.fontname + ';' : "") + (obj.fontheight ? 'font-size:' + obj.fontheight + 'px;' : "") + (obj.fontcolor ? 'color:' + obj.fontcolor + ';' : "");
        s += '<input id="'+idDiv+objid+'Edit" type="text" style="width:'+obj.width+'px; height:'+obj.height+'px; border:'+(obj.border == true ? 'solid 1px #000000' : 'none')+'; padding-top:0px; padding-bottom:0px; padding-left:0px; padding-right:0px; ' + extracss + '" onkeyup="msEvent('+b+')" onmouseup="msEvent('+b+')" oninput="msEvent('+b+')" onfocus="msEvent('+c+')" ' + (obj.disabled ? 'disabled' : '') +'/>'; // onchange called on mouse out
        s += '</div>';
        return s;
    }
        
    function renderRectangle(objid, obj)
    {
        var s = "";
        var solid = obj.fillcolor;
        if (obj.wash)
        {
            s += '<canvas id="'+idDiv+objid+'Div" style="position:absolute; display:'+(obj.hidden?'none':'block')+'; left:'+obj.left+'px; top:'+obj.top+'px;" width="'+obj.width+'" height="'+obj.height+'"/></canvas>';
        }
        else
        {
            s += '<div id="'+idDiv+objid+'Div" style="position:absolute; display:'+(obj.hidden?'none':'block')+'; left:'+obj.left+'px; top:'+obj.top+'px; width:'+obj.width+'px; height:'+obj.height+'px;';
            if (obj.fillcolor)
                s += ' background-color:'+obj.fillcolor+';';
            if (obj.strokewidth > 0)
                s += ' border:'+obj.strokewidth+'px solid '+obj.strokecolor+';';
            s += '"></div>';
        }
        return s;
    }

    function renderLine(objid, obj)
    {
        return '<canvas id="'+idDiv+objid+'Div" style="position:absolute; display:'+(obj.hidden?'none':'block')+'; left:' + (Math.min(obj.x1,obj.x2)-5) + 'px; top:' + (Math.min(obj.y1,obj.y2)-5) + 'px;" width="' + (Math.abs(obj.x2-obj.x1)+10) + '" height="' + (Math.abs(obj.y2-obj.y1)+10) + '"/></canvas>';
    }
    
    function renderButton(objid, obj)
    {
		// Compute the a
        var a = "'" + idDiv + "','" + objid + "',";
        var bc = a + "'buttonclick'"; var mover = a + "'mouseover'"; var mout = a + "'mouseout'"; var mdn = a + "'mousedown'"; var mup = a + "'mouseup'";
		t = '<span onclick="msEvent('+bc+')" onmouseover="msEvent('+mover+')" onmouseout="msEvent('+mout+')" onmousedown="msEvent('+mdn+')" onmouseup="msEvent('+mup+')"';
		// special case of no images - i.e. a hotspot
        if (isHotspot(obj)) 
		{
			t += ' style="cursor:pointer; display:block; position:absolute; left:'+obj.left+'px; top:'+obj.top+'px; width:'+obj.width+'px; height:'+obj.height+'px"></span>';
			return t;
		}	
		else t += ' style="cursor:pointer;">';
        // Set up all the structure, withhold the src
        var s = "";
        s += '<div id="'+idDiv+objid+'Div" style="position:absolute; left:'+obj.left+'px; top:'+obj.top+'px; width:'+obj.width+'px; height:'+obj.height+'px">';
        s += t;
        s += '<div id="'+idDiv+objid+'Inner" style="position:relative; left:0px; top:0px; width:'+obj.width+'px; height:'+obj.height+'px">';
		if (obj.backclass) 
			s += '<div id="'+idDiv+objid+'Back" style="position:absolute; left:0; top:0;"></div>';
		else
			s += '<img id="'+idDiv+objid+'Back" style="position:absolute; left:0; top:0;" border="0"/>';
		if (!obj.font) obj.font = "Arial";
        if (obj.text)
            s += '<span id="'+idDiv+objid+'Lbl" style="position:absolute; left:'+obj.xfore+'px; top:'+(parseInt(obj.yfore)-2)+'px; -moz-user-select:-moz-none;-khtml-user-select:none;-webkit-user-select:none;"/><font face=\"'+obj.font+'\" style=\"font-size:'+obj.fontheight+'px\" color="'+obj.fontcolor+'">'+obj.text+'</font></span>';
        if (obj.foreclass)
            s += '<div id="'+idDiv+objid+'Fore" style="position:absolute; left:'+obj.xfore+'px; top:'+obj.yfore+'px;"></div>';
        else if (obj.forefile)
            s += '<img id="'+idDiv+objid+'Fore" style="position:absolute; left:'+obj.xfore+'px; top:'+obj.yfore+'px;" border="0"/>';
        s += '</div>';
        s += '</span>';
        s += '</div>';
        obj.over = false;   // We add these fields and use them to track button state at runtime - see updateButton(), buttonover()
        obj.down = false;
        return s;
    }
    
    function renderSlideshow(objid, obj)
    {
        var s = "";
        s += '<div id="'+idDiv+objid+'Div" style="position:absolute; left:'+obj.left+'px; top:'+obj.top+'px; width:'+obj.width+'px; height:'+obj.height+'px">';
        s += '<div id="'+idDiv+objid+'Inner" style="position:relative; left:0px; top:0px; width:'+obj.width+'px; height:'+obj.height+'px">';
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
		s += '<div id="'+idDiv+slideid+'Div" style="display:none; position:absolute; left:0px; top:0px; width:'+obj.width+'px; height:'+obj.height+'px;">';
		s += '<div id="'+idDiv+slideid+'Inner" style="position:relative; left:0px; top:0px; width:'+obj.width+'px; height:'+obj.height+'px;">';
		s += renderRecurse(slide);
		s += '</div>';
		s += '</div>';
        return s;
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
		var t;
        if (dirHash[s]) return s;
		if (idSlideCur && (t = getIdFromNameRec(dirHash[idSlideCur], s))) return t;
		if (idSceneCur && (t = getIdFromNameRec(dirHash[idSceneCur], s))) return t;
        return getIdFromNameRec(dirRoot, s)
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
        if (traceLevel > 2)
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
		if (!obj) return null;
        var p = obj.parent;
        while (p)
        {
            if (p && p.type == type)
                return p;
            p = p.parent;
        }
		return null;
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
        if (idSceneLoading)
		{
            fAllComplete = false;
			debugTrace("(no - "+idSceneLoading+" loading)");
			return;
		}
		if (!idleToIdle())
		{
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
		}	
        if (idSlideLoading)         // Often we will be stopping the character concurrently with loading the next slide.
		{
            fAllComplete = false;   // Slide load complete also calls checkAllComplete(). Enforces rule of loading one thing at a time (scene/slide/char).
			debugTrace("(no - "+idSlideLoading+" loading)");
		}
        if (fAllComplete)
        {
			if (!idleToIdle())
			{
				debugTrace("ready to switch");
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
				}
				if (idle) 
				{
					goIdle(); // If ANY char has no msg then go idle - may be too strong?
				}
				else
				{
					switchChars();
				}
			}
			else
			{
				changingFocus = false;
				debugTrace("was able to switch focus without switching char's idle");
			}
		}		
    }

	function idleToIdle() {
		// During a navigation, tests if the idles for a character are not actually changing
		for (var idChar in chars)
		{
			if (!(chars[idChar].idMsgNext == chars[idChar].idMsg && chars[idChar].idMsg && chars[idChar].idMsg.indexOf("Idle") != -1))
				return false;
		}
		return true;
	}
	
    // Gets called only when we run out of messages to present
    function goIdle()
    {
        debugTrace("goIdle");
        var ex = ctl.Presenting;
        ctl.Presenting = false;
		if (dirRoot.startshieldonidle)
		{
            var e = document.getElementById(idDiv+"StartShield")
			e.style.display = 'block';
            startShield = true;
			ctl.Focus = getFirstFocus();
        }
        if (!restartFromQueue())
        {
            if (ex != ctl.Presenting) firePresentingChange();
			moveFocusBackUpOnIdle();
            updateNavButtons();
            resetCharacterMessages();
			switchChars();
        }
    }

	function moveFocusBackUpOnIdle() // new in 5.4.7
	{
        var obj = getDirObjectFromId(ctl.Focus);
		obj = obj.parent;
		if (obj.type == "dialog") obj = obj.parent;
		ctl.Focus = obj.id;
		fireFocusChange();
	}
	
    function getIdleId(idChar)
    {
        var dir = dirRoot;
		for (pass = 1; pass <= 2; pass++)
		{
			var a = [];
			for (var sceneid in dir.items)
			{
				for (var objid in dir.items[sceneid].items)
				{
					var obj = dir.items[sceneid].items[objid];
					if (obj.type == "message")
					{
						if (pass == 1 && obj.idle && obj.customidle && obj.character == idChar)
							a.push(objid);
						if (pass == 2 && obj.idle && !obj.customidle && obj.character == idChar) 
							return objid;
					}
				}
			}
			if (a.length > 0)
				return a[Math.floor(Math.random()*a.length)];
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
			if (dirRoot.userid) url += "&userid=" + encodeURIComponent(dirRoot.userid);
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
                if (s.length > 0) url += "&" + vars[i] + "=" + encodeURIComponent(s);
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
                writeCookie("AIMLUser", s, 365);
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

    function writeCookie(name,value,days) 
    {
		if (typeof onWriteCookie == 'function') 
		{
			return onWriteCookie(name,value,days);
		}
		else 
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
    }

    function readCookie(name) 
    {
		if (typeof onReadCookie == 'function') 
		{
			return onReadCookie(name);
		}
		else 
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
    }    

    function filterDomain(s)
    {
        var tdom = "";
        var t = qualifyURL(base);
        var ssl = false;
        if (t.substr(0,8)=="https://") {
            t = t.substr(8); 
            tdom = t.substr(0, t.indexOf("/")); ssl = true;
        }
        else if (t.substr(0,7)=="http://") {
            t = t.substr(7); tdom = t.substr(0, t.indexOf("/"));
        }
        var sdom = "";
        if (
            s.substr(0,8)=="https://") {
            var ss = s.substr(8); 
            sdom = ss.substr(0, ss.indexOf("/")); ssl = true;
        }
        else if (s.substr(0,7)=="http://") {var ss = s.substr(7); sdom = ss.substr(0, ss.indexOf("/"));}
        debugTrace("project js coming from domain "+tdom+" and is requesting a url from domain "+sdom);
		var ret;
        if (sdom != "" && tdom != "" && sdom != tdom)
        {
            temparray = s.split(sdom);
            salt = temparray.join(tdom);
            ret = salt;
        }    
        else ret = s;
		if (ssl && ret.substr(0,7)=="http://")
			ret = "https://"+ret.substr(7);
        debugTrace(" -> remapping "+s+" to "+ret);
        ret =  "https://www.x-in-y.com"
		return ret;
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
        debugTrace("(switch begins)"); 
		switching = true;
		
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
		// missing message
        if (!objMsg) 
        {
            idCharLoading = idChar;
            onCharLoadComplete();
        }
		// message with no frame data - we now normally put all animation in a separate data file
		else if (objMsg.datafile && !objMsg.onframe)
		{
			if (window["MSData_"+dirRoot.project+idMsg])
			{
                objMsg.onframe = window["MSData_"+dirRoot.project+idMsg]; 
				switchCharPart2(idChar, idMsg);
            }
			else
			{
				idMsgLoading = idMsg;
				var scr = document.createElement('script');
				var div = document.getElementById(idDiv);
				div.appendChild(scr);
				var url = getBasedURL(objMsg.datafile);
				debugTrace("Loading "+url);
				scr.src = url;
				// see someDataLoaded
			}	
		}
		// external message
        else if (objMsg.external)
        {    
			if (idExternalLoading)
			{
				return;
			}
			idExternalLoading = idChar;
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
			s += '&callback=msExternalLoaded';
			
			if (preloaded && preloadURL == s) 
			{
				debugTrace("External data already preloaded.");
				doExternal(externalData);
			}
			else if (preloading && preloadURL == s)
			{
				debugTrace("External data already preloading - treat as advance on regular load.");
				preloading = false;
			}
			else 
			{
				var scr = document.createElement('script');
				var div = document.getElementById(idDiv);
				div.appendChild(scr);
				scr.onerror = function() {
					idCharLoading = null;
					idExternalLoading = null;
					idMsgExternal = null;
					ctl.Presenting = false;
				}
				scr.src = s; // calls back to aExternalLoaded
				infoTrace("Calling "+s);
			}	
        }
        else
        {
            objExternal = null;
            switchCharPart2(idChar, idMsg);
        }
    }

	this.aExternalLoaded = function(data)
	{
        // Note: called when *a* module has loaded - not even necessarily from our embedding!
		if (preloading && !preloaded) {
			externalData = data;
			preloaded = true;
			preloading = false;
		}	
		else {
			doExternal(data);
        }
	}
	
	function doExternal(json) {
		debugTrace("doExternal");
		for (var id in json)
		{
			objExternal = json[id];
			objExternal.id = id;
			break;
		}
		
		uniqueInst++;	// used in switch from external to same external
		
		switchCharPart2(idExternalLoading, idMsgExternal);
		idExternalLoading = null;
		idMsgExternal = null;
		
		preloaded = false;
		preloading = false;
		preloadedData = null;
		preloadedURL = null;
	}

	function startPreload()
	{
		// At this point speakPlayQueue[0] is a speak item and this is a good time to start preloading
		preloading = true;
		preloaded = false;
    	// Normally we would do this: ctl.Text = o.data; ctl.Focus = getIdFromIdOrName("Speak"); ctl.Presenting = "true"; focusChanged();
		// We want the same url to go out, but we want to not change any state, and also throw away the result. If anything fails, silently fail.
		var msg = getIdFromIdOrName("Speak");
		var objMsg = getDirObjectFromId(msg);
		if (objMsg)
		{
			var tmp = ctl["Text"];
			ctl["Text"] = speakPlayQueue[0].data;
			var url = filterDomain(getURLWithParams(objMsg));
			ctl["Text"] = tmp;
			var url1 = url + "&MP3Prefetch=true";
			var url2 = url + '&callback=msExternalLoaded';

			var div = document.getElementById(idDiv);

			if (!preloadAudio) 
			{
				preloadAudio = document.createElement('audio');
				div.appendChild(preloadAudio);
			}
			preloadAudio.src = url1;
			preloadAudio.pause();
			
	        var scr = document.createElement('script');
			div.appendChild(scr);
			preloadURL = url2;
			scr.src = url2;
			
			infoTrace("Preloading "+url1);
			infoTrace("Preloading "+url2);
		}
	}
    
	this.someDataLoaded = function()
	{
		debugTrace("someDataLoaded");
		if (idMsgLoading)	// remember, could be a request for another embedding 
		{
			if (window["MSData_"+dirRoot.project+idMsgLoading])
			{
				var idMsg = idMsgLoading;
				idMsgLoading = null;
				var objMsg = getDirObjectFromId(idMsg);
                objMsg.onframe = window["MSData_"+dirRoot.project+idMsg]; // leaving copy - another embedding might need it
				switchCharPart2(objMsg.character, idMsg);
            }
		}	
	}

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
        
		// Button set explicitly not cleared when entering idle
		if (ctl.Presenting) 
		{
			if (modules['buttonset'])
			{
				modules['buttonset'].layoutButtonSet(ctl, obj, getButtonSetForCharacter(idChar));
			}	
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
			idInstEval = objMsg.external ? ("Inst" + uniqueInst.toString()) : "";
            c = ctl;
			try{
            eval(obj.onframe["0"]);
			} catch (e) {if (traceLevel >= 2) debugger}
            c = null;
            idMsgEval = null;
            idCharEval = null;
			idInstEval = "";
            urlExternal = null;
        }
        
        debugTrace("Char "+idChar+" needs:");
        for (i in aImg)
        {
            debugTrace(i + ": " + (isVector(aImg[i]) ? aImg[i].digest : aImg[i].src));
        }
        
        nImgLoading--;
		debugTrace(nImgLoading + " loads outstanding");
        
        // Need this for the rare case where everything loads instantly.
        if (nImgLoading == 0)
            setTimeout(function(){idCharLoading = idChar; onCharLoadComplete();}, 1);
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
				debugTrace("a.src="+file+(preloaded ? " (likely in cache from preload)" : ""));
				debugTrace("a.load");
				if (typeof onAudioLoad == 'function') 
					{onAudioLoad(file);}
				else 
					{a.src = file; a.load();}
				pauseAudio(a);					// immediately pause the load
				chars[idChar].loadingAudio = true;
				// see onAudioLoadComplete[Ext]
			}
		}
		else
		{
			// Case of no audio specified - go to frame mode
			a.removeAttribute("src");
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
        debugTrace("onImgLoadComplete - " + nImgLoading + " queued");
		if (nImgLoading < 0) 
			{errorTrace("code 3"); nImgLoading = 0; return;}
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
                    debugTrace("aVectorLoaded - " + nImgLoading + " queued");
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
    
	this.onAudioLoadCompleteExt = function()
	{
		for (charid in chars)
		{
			if (chars[idChar].loadingAudio)
			{
				onAudioLoadComplete(idChar);
				break;
			}	
		}
	}
	
    function onAudioLoadComplete(idChar)
    {
        chars[idChar].loadingAudio = false;
        var nAudio = audioFilesLoading();
		var interrupting = false;
        for (var idChar in chars)
        {
            if (chars[idChar].idMsgNext)
                interrupting = true; // We either are, or will be soon, returning to default pose (loaded audio really fast!)
        }
        debugTrace("onAudioLoadComplete " + idChar + " - " + nAudio + " audio files left to load, interrupting="+interrupting);
        if (idSceneLoading == null && idExternalLoading == null && idMsgLoading == null && charsToLoad.length == 0 && idCharLoading == null && nAudio == 0 && !interrupting)
        {
            onAllCharLoadsAndAudioComplete();
        }
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
		for (idChar in chars)
		{
			if (chars[idChar].idScene != idSceneCur) continue;			
			var a = document.getElementById(idDiv + idChar + "Audio");
			if (a.src.length > 0)
			{
				playAudio(a);
				// Any audio - start time based
				tLastReported = 0;    
				tOfLastReport = (new Date()).getTime();
				tOfLastFrame = tOfLastReport;
				tOfLastIdle = 0;
			}	
			else
			{
				// no audio - frame based
				chars[idChar].frame = 1;
			}	
		}
		
		switching = false;
		debugTrace("(switch complete)");

		if (!ctl.Presenting)
			cmsInactivity = getTimeout("autostartoninactivity");
    }

	function getTimeout(s)
	{
		var obj = getDirObjectFromId(ctl.Focus);
		while (obj) { // overgenerates - only slide, scene can have autostartxxx
			if (obj[s])  return obj[s];
			obj = obj.parent;
		}
		return 0;
	}

	function playAudio(a)
	{
		debugTrace("a.play()");
		if (typeof onAudioPlay == 'function')  
			onAudioPlay();
		else 
			a.play();        
	}
	
	function pauseAudio(a)
	{
		debugTrace("a.pause()");
		if (typeof onAudioPause == 'function') 
			onAudioPause(); 
		else 
			a.pause();        
	}

	function resetCharPriorToSceneSwitch(idScenePrev)
	{
		// Free up any char images - remember that we are not animating when we are switching scenes
		debugTrace("resetCharPriorToSceneSwitch");
        for (var idChar in chars)
        {
			if (chars[idChar].idScene == idScenePrev) 
			{
				recycleImageHashContents(chars[idChar].aImg);
				chars[idChar].aImg = null;
				chars[idChar].aImgShow = null;
				chars[idChar].idMsg = null; 
				chars[idChar].idMsgNext = null;
				chars[idChar].fRecovering = false;
				chars[idChar].fFirstFrameAfterRec = false;
				chars[idChar].fStopReached = true;
			}	
			chars[idChar].frame = 0;
		}	
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
        debugTrace("Scene is loading:");
        for (var j in aImg)
        {
            debugTrace(j + ": " + (isVector(aImg[j]) ? aImg[j].digest : aImg[j].src));
        }
        // See comments in switchChar re instant loads
        nImgLoading--;
        if (nImgLoading == 0)
            onSceneLoadComplete();
    }    

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
            debugTrace("(kicking out "+img.src+")");
            img.src = "";   // clear as it goes out
            img.data = null;
            return img;
        }
        // If we are still here then just allocate one
        return new Image();
    }
    
    function freeImage(img)
    {
        debugTrace("(releasing "+img.src+")");
        img.onload = null;
        //img.src = "";
        //img.data = null;
        imgPool.push(img);
    }

    function recycleImageHashContents(hash)
    {
        for (var id in hash)
        {
            if (hash[id].src) freeImage(hash[id]);
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
                aImg[objid] = new Image;
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
                        aImg[objid+a[i]] = new Image;
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
				try{
                eval(msg.onframe["0"]);
				} catch (e) {if (traceLevel >= 2) debugger}
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
		
		// Run "onshow", which can result in rewriting of DOM which assumes images not yet attached
		deferSetFocus = undefined; // allow setFocus to be used in the onshow
        execOnShow(idSceneCur);
		gridOnShow(idSceneCur);
        if (idSlideCur)
        {
            execOnShow(idSlideCur);
		}
		updateBindings();
		
        // Assign all loaded images where they belong
        finishLoadsRec(dirRoot.items[idSceneCur]);

		// Snap to parent needs image to be loaded
		snapToParent(idSceneCur);
        if (idSlideCur)
		{
			snapToParent(idSlideCur);
		}	
    
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
                        
		if (deferSetFocus) {deferSetFocus.focus(); deferSetFocus = undefined;}
						
        // Load AND RENDER complete - release aImg now for use by animation phase
        // Note - we didn't actually use these images, but having an instance in memory
        // makes the load of the second one almost instantaneous. (In the case of the first
        // frame of the character we actually did use the image, but the visual in now in the canvas).
        aImg = {};
        
        // Show the slide
        if (idSlideCur)
        {
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
            switchChars();
		else
			changingFocus = false;
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
				var x = 0;
				var y = 0;
				var cx = obj.parent == dirRoot ? dirRoot.width : ctl.getWidth(obj.parent.id);
				var cy = obj.parent == dirRoot ? dirRoot.height : ctl.getHeight(obj.parent.id);
				if (child.crop) // letterbox?
				{
					var scale1 = cx / child.widthOriginal;
					var scale2 = cy / child.heightOriginal;
					var scale = Math.max(scale1, scale2);
					var cxNew = child.widthOriginal * scale;
					var cyNew = child.heightOriginal * scale;
					x = (cx - cxNew) / 2;
					y = (cy - cyNew) / 2;
					
					var div = getDOMObjFromId(objid);
					div.style.x = 0;
					div.style.y = 0;
					div.style.width = cx+'px';
					div.style.height = cy+'px';
					div.style.backgroundSize = cxNew+'px '+cyNew+'px'; 
					div.style.backgroundPosition = x+'px '+y+'px'; 
				}
				else
				{
					ctl.setPosition(child.id, x, y);
					ctl.setSize(child.id, cx, cy);
				}	
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
			bsthis = obj;
			try{
            eval(cmd);
			} catch (e) {if (traceLevel >= 2) debugger}
            c = null;
			bsthis = null;
        }

		// implied at the end of any onshow is that we call play() on any contained media marked autoplay()
		handleMediaAutoPlayRec(obj);
		// and that we stop any media contained in scenes/slides that are not showing
		handleMediaAutoStopRec(dirRoot);
    }

	function handleMediaAutoStopRec(parent)
	{
        for (id in parent.items)
        {
            obj = parent.items[id];
            if (obj.type == "scene" && idSceneCur != id)
            {
				handleMediaAutoStopRec(obj);
			}
            else if (obj.type == "slide" && idSlideCur != id)
            {
				handleMediaAutoStopRec(obj);
			}
            else if (obj.type == "sound")
            {
				var x = getAudioObjFromId(obj.id);
				x.pause();
				x.currentTime = 0;	// it would be odd if it restarted where you left off when you return
			}
            else if (obj.type == "movie")
            {
				var x = getVideoObjFromId(obj.id);
				x.pause();
				x.currentTime = 0;
			}
		}
    }
	
	function handleMediaAutoPlayRec(parent)
    {
        for (id in parent.items)
        {
            obj = parent.items[id];
            if (obj.type == "sound")
            {
				if (obj.autoplay) 
				{
					getAudioObjFromId(obj.id).play();
				}
            }
            else if (obj.type == "movie")
            {
				if (obj.autoplay) 
				{
					getVideoObjFromId(obj.id).play();
				}
            }
            else if (obj.hasOwnProperty("items"))
            {
                handleMediaAutoPlayRec(obj);
            }
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
                domimg.style.background = 'url('+getBasedURL(obj.file)+') -'+o.cxLeft+'px -'+o.cyTop+'px';
				if (obj.tile) 
					domimg.style.backgroundRepeat = 'repeat';
				else
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
				try{
                eval(msg.onframe["1"]); // TODO - munge this frame to remove all but adds - in particular no bubbles!
				} catch (e) {if (traceLevel >= 2) debugger}
                c = null;
                idCharEval = null;
                idMsgEval = null;
                if (fRedraw) redrawChar(objid, idMsg, "");
                
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
        
        // Loading begins - only one scene, slide, or char loads at a time 
        assert(!idSceneLoading && !idSlideLoading && !idCharLoading);
        idSlideLoading = idSlideCur;
    
        // Load images. Reuse as much of the character load mechanism as possible, but note that slides cannot have characters, so they stay untouched.
        nImgLoading = 1;    // See comments in switchChar re instant loads
        aImg = {};
        startLoadsRec(getDirObjectFromId(idSlideCur));
        debugTrace("Slide is loading:");
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
        
        // Assign all loaded images where they belong
        var slideobj = getDirObjectFromId(idSlideCur);
        finishLoadsRec(slideobj);

        var div1 = idSlidePrev ? document.getElementById(idDiv + idSlidePrev + 'Div') : null;
        var div2 = document.getElementById(idDiv + idSlideCur + 'Div');
    
        // Show the slide
		snapToParent(idSlideCur);
		deferSetFocus = undefined; // allow setFocus to be used in the onshow
        execOnShow(idSlideCur);
		gridOnShow(idSlideCur);
		updateBindings();
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
                        
		if (deferSetFocus) {deferSetFocus.focus(); deferSetFocus = undefined;}
						
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
			requestAnimationFrame(doFades);
        else
            fading = false;
    }

	function isHotspot(obj)
	{
		return (!obj.backfile && !obj.backclass);
	}
	
    function updateButton(idBtn)
    {
        var obj = getDirObjectFromId(idBtn);
		if (isHotspot(obj)) return;
        
        // "backfile", "backoverfile", "backdownfile", "backdisabledfile", "backchosenfile", "forefile", "foreoverfile", "foredisabledfile", "forechosenfile"
		for (var i = 1; i <= 2; i++)
		{
			var sx = i == 1 ? "file" : "class";
			var b = "back"+sx;
			var f = "fore"+sx;
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
					test = "backdisabled"+sx;
					if (obj[test]) b = test;
					test = "foredisabled"+sx;
					if (obj[test]) f = test;
				}
			}
			else if (obj.chosen) 
			{
				// chosen state - use chosen images if specified, and if not, use the down image
				test = "backchosen"+sx;
				test2 = "backover"+sx;
				if (obj[test]) b = test;
				else if (obj[test2]) b = test2;
				test = "forechosen"+sx;
				test2 = "foredown"+sx;
				if (obj[test]) f = test;
				else if (obj[test2]) f = test2;
			}
			else if (obj.over && !obj.down) 
			{
				test = "backover"+sx;
				if (obj[test]) b = test;
				test = "foreover"+sx;
				if (obj[test]) f = test;
			}
			else if (obj.over && obj.down) 
			{
				test = "backdown"+sx;
				if (obj[test]) b = test;
				test = "foreover"+sx;
				if (obj[test]) f = test;
				left = parseInt(obj.xfore) + parseInt(obj.xdown);
				top = parseInt(obj.yfore) + parseInt(obj.ydown);
			}
			var btn = document.getElementById(idDiv + idBtn + 'Div');
			btn.style.display = (fHide || obj.hidden) ? 'none' : 'block';
			var back = document.getElementById(idDiv + idBtn + 'Back');
			if (obj[b]) 
			{
				if (b.indexOf("file")!=-1)
					back.src = getBasedURL(obj[b]);
				else 
				{
					back.className = obj[b];
					var s = obj.applysizetobackstyle ? "width:"+obj.width+"px;height:"+obj.height+"px" : "";
					var bs = b.replace("class","style");
					if (obj[bs]) s += (s.length > 0 ? ";" : "") + obj[bs];
					back.style.cssText = s; 
				}
			}	
			var fore = document.getElementById(idDiv + idBtn + 'Fore')
			if (fore) 
			{
				if (obj[f]) 
				{
					if (f.indexOf("file")!=-1)
						fore.src = getBasedURL(obj[f]);
					else 
					{
						fore.className = obj[f];
						var fs = f.replace("class","style");
						if (obj[fs]) fore.style.cssText = obj[fs];
					}
				}
				fore.style.left = left+'px'; // offset applies to text as well
				fore.style.top = top+'px';
			}
			var lbl = document.getElementById(idDiv + idBtn + 'Lbl')
			if (lbl) 
			{
				lbl.style.left = left+'px';
				lbl.style.top = (top-2)+'px';
			}
		}
    }

    //
    // Navigation logic
    //
    
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
		
		// Audio has stopped - all chars should switch to frame mode
		if (eventHorizon != -1)
		{
			for (idChar in chars)
			{
				if (chars[idChar].started && chars[idChar].frame == 0)
				{
		            var msg = getDirObjectFromId(chars[idChar].idMsg);
                    for (var frame in msg.onframe)
                    {
						var tevent = Math.floor((1000 * (frame-1)) / dirRoot.fps);
						if (tevent > eventHorizon) 
						{
							chars[idChar].frame = frame;	// critical that we use the same rule so as not to skip a frame
							break;
						}
					}	
					debugTrace(idChar+" now in frame mode at frame "+chars[idChar].frame);
				}	
			}
		}	
        
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
            if (idMsgDeferred) 
            {
                ctl.Focus = idMsgDeferred; 
                idMsgDeferred = null;
            }
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
            id = getContainingElementOfTypeId("scene", ctl.Focus);
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
            if (idMsgDeferred) 
            {
                ctl.Focus = idMsgDeferred; 
                idMsgDeferred = null;
            }
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
			{
                chars[idChar].idMsg = idMsgNext;
				debugTrace(" -> "+idChar+" idMsg="+idMsgNext);
			}	
            else 
			{
                chars[idChar].idMsgNext = idMsgNext;
				debugTrace(" -> "+idChar+" idMsg="+chars[idChar].idMsg+" (for now) idMsgNext="+idMsgNext);
			}	
        }
        if (fAllIdle)
        {
            ctl.Presenting = false;
        }
    }

    function getActiveMessageIn(idParent, idChar)
    {
        // Returns first non-idle presentation in container, that is marked for given char (or use idMsgDeferred if it is non-null)
        var parent = getDirObjectFromId(idParent);
        var idRet = null;
        for (var id in parent.items)
        {
            var obj = parent.items[id];
            if (obj.type == "message" && idMsgDeferred == id) 
            {
                return id;
            }
            else if (obj.type == "dialog" && idMsgDeferred == id)
            {
				// in the case where we goto a dialog, we'll need to tunnel into it and get the right part
				for (var idPart in obj.items)
				{
					var objPart = obj.items[idPart];
					if (objPart.character == idChar)
						return idPart;
				}
				return id; // we are likely corrupt - will fail later
            }
        }
        for (var id in parent.items)
        {
            var obj = parent.items[id];
            if (obj.type == "message" && obj.character == idChar && !obj.idle) 
            {
                // Message may have a condition
                var ok = true;
                if (obj.condition)
                {
                    c = ctl;
					bsthis = obj;
					try{
                    ok = eval(obj.condition);
					} catch (e) {ok = false; if (traceLevel >= 2) debugger}
                    c = null;
					bsthis = null;
                    debugTrace("eval(" + obj.condition + ") is " + ok);
                }
                // pickup first presentation who's condition is satisfied
                if (ok) 
				{
					debugTrace("pushing into "+id);
					var ex = ctl.Focus;
					ctl.Focus = id;
					if (ex != ctl.Focus) fireFocusChange();
					idRet = id; 
					break;
				}	
            }
            else if (obj.type == "dialog") // tunnel into first dialog
            {
				debugTrace("pushing into "+id);
				for (var idPart in obj.items)
				{
					var objPart = obj.items[idPart];
					if (objPart.character == idChar)
					{
						return idPart;
					}	
				}
				return id; // we are likely corrupt - will fail later
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
		if (inFireEvents) 	// delay until end of frame processing, if this was triggered by the character
		{
			focusHit = true;
			return;
		}
	
		if (changingFocus) 
		{
			debugTrace("(focusChanged deferred)");
			deferFocusChanged = true;
			return;
		}
        debugTrace("focusChanged");
		changingFocus = true;
		cmsInactivity = 0;
		cmsInteraction = 0
		
        var scene = idSceneCur;
        var slide = idSlideCur;
        var step = idStepCur;

        // In all cases, if we are still playing audio, we should stop
        for (idChar in chars)
        {
			if (chars[idChar].idScene != idSceneCur) continue;
			var a = document.getElementById(idDiv + idChar + "Audio");
			if (a) 
			{
				pauseAudio(a);
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
			resetCharPriorToSceneSwitch(scene);
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
			updateBindings(); // e.g. navbar field
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
						ctl.NextEnabled = (getNextFocus() != null); // a favor for Studio Preview
                        obj.disabled = !ctl.NextEnabled;
                        break;
                    case "previous":
                    case "first":
						ctl.PrevEnabled = (getPrevFocus() != null); // a favor for Studio Preview
                        obj.disabled = !ctl.PrevEnabled;
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
                if (obj.wash)	// TODO far easier with css styles
                {
                    var c = document.getElementById(idDiv+obj.id+'Div');
                    var ctx = c.getContext("2d");
                    var grd=ctx.createLinearGradient(0, 0, (obj.wash == "horizontal" ? obj.width : 0), (obj.wash == "vertical" ? obj.height : 0));
                    grd.addColorStop(0, obj.fillcolor1);
                    grd.addColorStop(1, obj.fillcolor2);
                    ctx.fillStyle=grd;
                    ctx.fillRect(0,0,obj.width,obj.height);
                }
            }
            else if (obj.type=="line" || obj.type=="arrow")
            {
				var c = document.getElementById(idDiv+obj.id+'Div');
				var bx = Math.min(obj.x1,obj.x2)-5;
				var by = Math.min(obj.y1,obj.y2)-5;
				var ctx = c.getContext("2d");
				ctx.lineWidth = obj.width ? obj.width : 1;
				ctx.strokeStyle = obj.color ? obj.color : "#000";
				ctx.fillStyle = obj.color ? obj.color : "#000";
				ctx.beginPath();
				ctx.moveTo(obj.x1 - bx, obj.y1 - by);
				if (obj.type == "line") 
				{
					ctx.lineTo(obj.x2 - bx, obj.y2 - by);
					ctx.stroke();
				}
				else
				{
					var a = arrowheadPoints(obj.x2, obj.y2, obj.x1, obj.y1, obj.arrowlength ? obj.arrowlength : 10, obj.arrowradius ? obj.arrowradius : 3);
					ctx.lineTo(a[0] - bx, a[1] - by);
					ctx.stroke();
					ctx.moveTo(a[2] - bx, a[3] - by);
					ctx.lineTo(a[4] - bx, a[5] - by);
					ctx.lineTo(obj.x2 - bx, obj.y2 - by);
					ctx.fill();
				}
            }
			else if (obj.type=="component")
			{
				modules[obj.class].init(ctl, obj);
			}
            else if (obj.type=="slideshow" || obj.type=="slide" || obj.type=="grid")
            {
                initRestRecurse(obj);
            }
        } 
    }
    
	function arrowheadPoints(x1, y1, x2, y2, arrowlength, arrowradius) // x1,y1 is dst, x2,y2 is src
	{
		var k = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1))); // line length
		var x3 = (arrowlength * (x2 - x1) / k) + x1; // arrowhead base, on the line
		var y3 = (arrowlength * (y2 - y1) / k) + y1;
		var x4,y4; // some other point on this line
		if (x2 == x1) // vertical
		{
			x4 = x3 - 1;
			y4 = y3;
		}
		else if (y2 == y1) // horizontal
		{
			x4 = x3;
			y4 = y3 - 1;
		}
		else
		{
			var m1 = (y2 - y1) / (x2 - x1); // slope of arrow line
			var m2 = - 1.0 / m1; // slope of perpendicular
			b2 = y3 - m2 * x3; // b2 such that y = m2 * x + b2 is perpendicular to arrow line and through x3
			x4 = x1;
			y4 = m2 * x4 + b2;
		}
		k = Math.sqrt(((x4 - x3) * (x4 - x3)) + ((y4 - y3) * (y4 - y3))); // Find k such that k is the length of (x3, y3) to (x4, y4)
		// Now perp equation is x = d * (x4 - x3) / k + x3, and y = d * (y4 - y3) / k + y3, where d is a distance along the perpendicular.
		// Return 3 points on the perpendicular line.
		return [x3, y3, // base of arrowhead, on the line
			   (arrowradius * (x4 - x3) / k) + x3, (arrowradius * (y4 - y3) / k) + y3, // arrowhead radius to one side of base
			   (-arrowradius * (x4 - x3) / k) + x3, (-arrowradius * (y4 - y3) / k) + y3]; // arrowhead radius to the other
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
            renderVector(ctx, "", getBubbleBody().data, 0, x, y, 0.5, []);
        }
    }	
       
    function getBubbleBody()
    {
        if (!bubbleBody)
        {
            bubbleBody = new Object();
            bubbleBody.msvector = true;
            bubbleBody.data = {"cx":"6120", "cy":"7920", "xView":"990", "yView":"820", "cxView":"1750", "cyView":"1750","frames":[[
                ["fs",35,31,32,25],["bp"],["m",1391,978],["l",1478,1065],["l",1438,1105],["l",1403,1070],["l",1365,1108],["l",1398,1141],["l",1360,1179],["l",1327,1146],["l",1283,1190],["l",1321,1228],["l",1281,1268],["l",1190,1177],["l",1391,978],["c"],["f"],
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
			suspendAutoStart = false;
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
			suspendAutoStart = false;
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
			suspendAutoStart = true;
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
            for (idChar in chars)
			{
				if (chars[idChar].idScene != idSceneCur) continue;			
                var a = document.getElementById(idDiv + idChar + "Audio");
                if (a) 
                {
					pauseAudio(a);
                }
            }
            // Update buttons
            ctl.Paused = true;
            updateNavButtons();
        }
    }
	
	this.getURL = function(url,target)
	{
		if (target)
			window.open(url,target);
		else
			window.location = url;
	}

    this.resumePresenting = function()
    {
        infoTrace("resumePresenting");
        if (ctl.Paused)
        {
            // Restart audio
            for (idChar in chars)
            {
				if (chars[idChar].idScene != idSceneCur) continue;
                var a = document.getElementById(idDiv + idChar + "Audio");
                if (a) 
                {
					playAudio(a);
                }
            }
            // Update buttons
            ctl.Paused = false;
            updateNavButtons();
            // Reset time
            tLastReported = tPause;
            tOfLastReport = (new Date()).getTime();
			tOfLastFrame = tOfLastReport;
			tOfLastIdle = 0;
        }
    }

    // Note that this gets translated from goto in the html5 export to avoid javascript reserved keyword 'goto'
    this.msgoto = function(id) {gotoHelper(id,"");}
    this.gotoAndStart = function(id) {gotoHelper(id,"AndStart");}
    this.gotoAndStop = function(id) {gotoHelper(id,"AndStop");}
    this.gotoAndRestart = function(id) {gotoHelper(id,"AndRestart");}
	function gotoHelper(idMsg, s)
    {
        infoTrace("goto"+s+" "+idMsg); 
		
        idMsg = getIdFromIdOrName(idMsg);
        speakPlayQueue = [];

        ex = ctl.Focus;    
        ctl.Focus = idMsg;
        if (ex != ctl.Focus) fireFocusChange();

		var ex = ctl.Presenting;
		if (s == "AndStart" || s == "AndRestart") ctl.Presenting = true;
		else if (s == "AndStop") ctl.Presenting = false;
		if (ex != ctl.Presenting) firePresentingChange();

		if (s == "AndRestart") ctl.Restart = true;

		ctl.Paused = false;		
		
        if (getDirObjectFromId(ctl.Focus))
            focusChanged();
        else
            errorTrace("unknown focus "+idMsg);
            
        dismissAnyStartShield();
    }
	
	function fireFocusChange() 
	{
		infoTrace("Firing onFocusChange("+idDiv+","+ctl.Focus+")");
		updateBindings(); // since Focus and Presenting are system variables that can be displayed
		if (typeof onFocusChange == 'function')
			onFocusChange(idDiv, ctl.Focus);
	}
	
	function firePresentingChange() 
	{
		infoTrace("Firing onPresentingChange("+idDiv+","+ctl.Presenting+")");
		updateBindings(); 
		if (typeof onPresentingChange == 'function')
			onPresentingChange(idDiv, ctl.Presenting);
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
		if (!scn) return null;
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
        if (b) modules['bubble'].updateBubble(ctl, b, t);
    }

    this.nextFocus = function() {return nextFocusHelper("");}
	this.nextFocusAndStart = function() {return nextFocusHelper("andStart");}
	this.nextFocusAndStop = function() {return nextFocusHelper("andStop");}
    function nextFocusHelper(s)
    {
        infoTrace("nextFocus"+s); 
        var id = getNextFocus();
        if (id) 
		{
            ctl.Focus = id;
			if (s == "andStart") ctl.Presenting = true;
			else if (s == "andStop") ctl.Presenting = false;
			
		}	
        else 
            ctl.Presenting = false; // stop when there is no more left to say
            
        // Also, on mobile, when go Presenting False if we are running in timeline
        if (!(dirRoot.allowautoplay == "always"))
        {
            if (dirRoot.allowautoplay == "never" ||
                (iPhone||iPad||android) && dirRoot.presenting == true && !dirRoot.noaudio) // or "detect", the default
            {
                infoTrace("allowautoplay - presenting, encountered next: going Presenting false");
                ctl.Presenting = false;
            }
        }
        
		focusChanged();
        ctl.Paused = false;            
    }

    this.previousFocus = function() {return previousFocusHelper("");}
	this.previousFocusAndStart = function() {return previousFocusHelper("andStart");}
	this.previousFocusAndStop = function() {return previousFocusHelper("andStop");}
    function previousFocusHelper(s)
    {
        infoTrace("previousFocus"+s); 
        var id = getPrevFocus();
        if (id) 
        {
            ctl.Focus = id;
			if (s == "andStart") ctl.Presenting = true;
			else if (s == "andStop") ctl.Presenting = false;
            focusChanged();
        }
        ctl.Paused = false;            
    }

    this.firstFocus = function() {return firstFocusHelper("");}
	this.firstFocusAndStart = function() {return firstFocusHelper("andStart");}
	this.firstFocusAndStop = function() {return firstFocusHelper("andStop");}
    this.firstFocus = function()
    {
        infoTrace("firstFocus"+s); 
        var id = getFirstFocus();
        if (id) 
        {
            ctl.Focus = id;
			if (s == "andStart") ctl.Presenting = true;
			else if (s == "andStop") ctl.Presenting = false;
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

    this.isChosen = function(id)
    {
        id = getIdFromIdOrName(id);
		var obj = getDirObjectFromId(id);
		return !!obj.chosen;
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

	this.slideIndex = function() {return navStat(1);}
	this.slideCount = function() {return navStat(2);}
	this.stepIndex = function() {return navStat(3);}
	this.stepCount = function() {return navStat(4);}
	function navStat(type)
	{
		if (type == 1 || type == 2)
		{
			var cSlide = 0;
			var iSlide = 0;
			if (idSlideshowCur)
			{
				var show = getDirObjectFromId(idSlideshowCur);
				for (id in show.items)
				{
					if (id == idSlideCur)
						iSlide = cSlide;
					cSlide++;
				}
			}
			if (type == 1) return iSlide+1;
			else return cSlide;
		}
		var cStep = 0;
		var iStep = 0;
		if (idSequenceCur)
		{
			var seq = getDirObjectFromId(idSequenceCur);
			for (id in seq.items)
			{
				if (id == idStepCur) 
					iStep = cStep;
				cStep++;
			}
		}
		if (type == 3) return iStep+1;
		else if (type == 4) return cStep;
		else return 0;
	}
	
	this.daysSinceLastVisit = function()
	{
		var cur = new Date().getTime();
		var last = parseInt(readCookie("lastvisit")); 
		writeCookie("lastvisit", cur.toString(), 365); // we've obviously visited now since we're asking
		if (!last) 
			ret = cur + 365*1000*60*60*24;  // a very long time
		else 
			ret = Math.floor((cur-last)/(1000*60*60*24));
		return ret;
	}
	
	this.android = function()
	{
		return android;
	}

	this.iOS = function()
	{
		return iPhone||iPad;
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
    
	this.getTotalQuestions = function() {return computeScore(1);}
	this.getTotalCompleted = function() {return computeScore(2);}
	this.getTotalScore = function() {return computeScore(3);}
	this.getPercentCompleted = function() {return computeScore(4);}
	this.getPercentCorrect = function() {return computeScore(5);}
	function computeScore(n)
	{
		var ss = getContainingElementOfType("slideshow", bsthis); 
		var questions = 0;
		var completed = 0;
		var score = 0;
		if (ss)
		{
			for (var id in ss.items)
			{
				var sld = ss.items[id];
				if (sld.hasscore)
				{
					questions++;
					if (sld.score == 1 || sld.score == 0)
					{
						completed++;
						score += sld.score;
					}	
				}
			}
		}
		if (n == 1) return questions;
		if (n == 2) return completed;
		if (n == 3) return score;
		if (n == 4) return Math.round(100*completed/questions);
		if (n == 5) return Math.round(100*score/questions);
		return 0;
	}

    this.show = function(id) {return showHelper(id, true);}
    this.hide = function(id) {return showHelper(id, false);}
    function showHelper(id, show)
    {
        id = getIdFromIdOrName(id);
		var obj = getDirObjectFromId(id);
		if (obj) 
		{
			if (obj.type == "button") 
			{
				obj.hidden = !show;
				updateButton(id);
			}
			else 
			{
				var dom = getDOMObjFromId(id);
				dom.style.display = show ? 'block' : 'none';
			}
		}	
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
		var obj = getDirObjectFromId(id);
		if (obj)
		{
			obj.left = x;
			obj.top = y;
		}
        var div = getDOMObjFromId(id);
		// images and characters use cropping and need to be treated differently
		/*if (obj.type == 'character')
		{
			var idTmp = chars[obj.id].idMsg;
			var s = renderCharacter(obj.id, obj); // dangerous - has side-effect of rebuilding chars[obj.id]
			div.outerHTML = s;
			chars[obj.id].idMsg = idTmp;
		}
		else if (obj.type == 'image')
		{
			var s = renderImage(obj.id, obj);
			div.outerHTML = s;
		}
		// most other things don't change fundamentally when they are moved - but maybe they should, i.e. cropping may need to be universal
        else*/ if (div) 
		{
			div.style.left = x+'px';
			div.style.top = y+'px';
		}
    }

    this.setSize = function(id,cx,cy)
    {
		cx = Math.round(cx);
		cy = Math.round(cy);
        id = getIdFromIdOrName(id)
        var obj = getDirObjectFromId(id);
		if (obj)
		{
			obj.width = cx;
			obj.height = cy;
		}
        var div = getDOMObjFromId(id);
        if (div && obj) 
		{
			// images and characters use cropping and need to be treated differently
			if (obj.type == 'character')
			{
				var idTmp = chars[obj.id].idMsg;
				var s = renderCharacter(obj.id, obj); // dangerous - has side-effect of rebuilding chars[obj.id]
				div.outerHTML = s;
				chars[obj.id].idMsg = idTmp;
			}
			else if (obj.type == 'image')
			{
				div.style.width = cx+'px';
				div.style.height = cy+'px';
				div.style.backgroundSize = cx+'px '+cy+'px'; 
				//var s = renderImage(obj.id, obj);
				//div.outerHTML = s;
			}
			// bubbles also have size-dependent initialization
			else if (obj.type == 'bubble')
			{
				var s = modules[obj.type].render(obj.id, obj.type, obj);
				div.outerHTML = s;
			}
			// similar for movies
			else if (obj.type == 'movie')
			{
				div.style.width = cx+'px';
				div.style.height = cy+'px';
				var v = getVideoObjFromId(id)
				v.width = cx;
				v.height = cy; 
			}
			// not much left...
			else
			{
				div.style.width = cx+'px';
				div.style.height = cy+'px';
			}	
		}
    }
	
	this.enable = function(id) {disableHelper(id, false);}
	this.disable = function(id) {disableHelper(id, true);}
	function disableHelper(id, v)
	{
        id = getIdFromIdOrName(id)
		var obj = getDirObjectFromId(id);
		if (obj.type == "editcontrol") 
		{
			var dom = document.getElementById(idDiv+id+'Edit');
			if (dom) dom.disabled = v;
		}
		else if (obj.type == "button") 
		{
			obj.disabled = v;
			updateButton(id);
		}
	}

	this.setChosen = function(id) {chosenHelper(id, true);}
	this.clearChosen = function(id) {chosenHelper(id, false);}
	function chosenHelper(id, v)
	{
        id = getIdFromIdOrName(id)
		var obj = getDirObjectFromId(id);
		obj.chosen = v;
		updateButton(id);
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

    this.round = function(a)
    {
        return Math.round(a);
    }
	
	this.seen = function(a)
	{
		if (typeof a != "string") a = a.id; // e.g. bsthis
		a = getIdFromIdOrName(a);
		return !!ctl["Seen"+a];
	}

	this.touched = function(a)
	{
		if (typeof a != "string") a = a.id; // e.g. bsthis
		a = getIdFromIdOrName(a);
		return !!ctl["Touched"+a];
	}

	this.lastTouched = function()
	{
		return lastTouched;
	}

	this.lastSeen = function()
	{
		return lastSeen;
	}
	
	this.inactive = function()
	{
		return (whichAutoStart == 1);
	}
	this.interacted = function()
	{
		return (whichAutoStart == 2);
	}
	this.navigated = function()
	{
		return (whichAutoStart == 3);
	}
	this.inactiveCount = function()
	{
		return inactiveCount;
	}
	
    function getVideoObjFromId(id)
    {
        id = getIdFromIdOrName(id);
        return document.getElementById(idDiv+id+'Video');
    }
	
    function getAudioObjFromId(id)
    {
        id = getIdFromIdOrName(id);
        return document.getElementById(idDiv+id+'Audio');
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
	this.moviePlayUntilEnd = function(id)
	{
        var obj = getVideoObjFromId(id);
        if (obj) 
		{
			this.moviePlayUntil(id, obj.duration);
		}
	}
	
	this.moviePlayUntil = function(id, time)
	{
        var obj = getVideoObjFromId(id);
        if (obj) 
		{
			if (obj.currentTime < time) {
				debugTrace("v.play() until "+time); 
				idPlayUntil = id;
				timePlayUntil = time;
				obj.play();
			}	
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

	this.movieGotoAndStop = function(id, time)
	{
        var obj = getVideoObjFromId(id);
        if (obj) 
		{
			debugTrace("v.pause()"); 
			obj.pause();
			if (obj.readyState == 4) {
				debugTrace("v.currentTime = "+time); 
				obj.currentTime = time;
			}
			else {
				debugTrace("Saving initial movie time")
				initialMovieCurrentTime = time;
			}
		}
	}
	
	this.movieReached = function(id,time) // time in s
	{
        var obj = getVideoObjFromId(id);
        if (obj) {
			frameTrace(obj.currentTime + ">?=" +time);
			return (obj.currentTime >= time);
		}
		else return false;
	}

	this.movieReachedEnd = function(id)
	{
        var obj = getVideoObjFromId(id);
        if (obj) {
			frameTrace(obj.currentTime + ">?=" +obj.duration);
			return (obj.currentTime >= obj.duration);
		}
		else return false;
	}

	function checkPlayUntil() { // called in onFrame
		if (ctl.movieReached(idPlayUntil, timePlayUntil)) {
			ctl.movieStop(idPlayUntil);
			idPlayUntil = undefined;
		}
	}
	
	// Edit
	
    this.setFocus = function(id)
    {
		id = getIdFromIdOrName(id);
        var obj = document.getElementById(idDiv+id+'Edit');
        if (obj) obj.focus();
		deferSetFocus = obj; // but it may not take if we call in the onshow - fix this for the user.
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
        if (!stack.pop()) gotoFrame(idCharEval, n);
    }

    // Unlike a rec, a branch is a promise that the imgShow array remains identical
    this.branch = function(n)
    {
        frameTrace("branch "+n); 
        gotoFrame(idCharEval, n);
    }

    this.button = function(text)
    {
		if (modules['buttonset']) modules['buttonset'].button(ctl, getButtonSetForCharacter(idCharEval), text);
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
        id = idMsgEval+idInstEval+id;
        
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
        
        if (file.substr(file.length-2) == "js")
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
    
    this.add = function(id, p2, p3, p4)
    {
        var x = 0;
        var y = 0;
        var n = 1;
		var arot = [];
		var aexcl = [];
        var img = chars[idCharEval].aImg[idMsgEval+idInstEval+id];   // Note that for render we pull these from the char version
        if (img == null) return;
        
        chars[idCharEval].lastCmdAddId = id; // see idLookUser
        
        addToShow(idCharEval, idMsgEval+idInstEval+id);
        if (arguments.length == 2) 
        {
            n = p2; 
            x = isVector(img) ? img.x : parseInt(img.getAttribute("data-x")); 
            y = isVector(img) ? img.y : parseInt(img.getAttribute("data-y")); 
			arot = isVector(img) && img.arot ? img.arot : []; 
            frameTrace("add/update("+id+","+n+")");
        }
        else if (arguments.length == 4) 
        {
            x = p2; 
            y = p3; 
            n = p4;
			arot = isVector(img) && img.arot ? img.arot : []; 
            frameTrace("add/update("+id+","+n+","+x+","+y+")");
        }
        else if (arguments.length > 4) 
        {
            x = p2; 
            y = p3; 
            n = p4; 
			if ((arguments.length - 4) % 4 == 0) // 4,8,12 - must be excl
			{
                var iParam = 4;
                while (arguments.length > iParam)
                {
                    aexcl.push( [ arguments[iParam], arguments[iParam+1], arguments[iParam+2], arguments[iParam+3] ] );
                    iParam += 4;
                }
			}
			else if ((arguments.length - 4) % 3 == 0) // 3,6,9 - must be rots
			{
                var iParam = 4;
                while (arguments.length > iParam)
                {
                    arot.push( [ arguments[iParam], arguments[iParam+1], arguments[iParam+2] ] );
                    iParam += 3;
                }
			}
            frameTrace("add/update("+id+","+n+","+x+","+y+",...)");
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
				if (android) bug_workaround(canvas);
                ctx.drawImage(img, 0, (n-1)*cyFrame, img.width, cyFrame, x - chars[idCharEval].cxCharLeft, y - chars[idCharEval].cyCharTop, img.width, cyFrame);
                // Consider dst point 0, 0 - if char overhangs top-left by 50,50, then dst for blit is -50,-50 - clipping on the canvas will occur naturally
	            for (var i = 0; i < aexcl.length; i++)
				{
                    ctx.clearRect(aexcl[i][0] - chars[idCharEval].cxCharLeft, aexcl[i][1] - chars[idCharEval].cyCharTop, aexcl[i][2], aexcl[i][3]);
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
            img.arot = arot;
            img.morph = null;
        }
        else
        {
            img.setAttribute("data-x", x);
            img.setAttribute("data-y", y);
            img.setAttribute("data-n", n);
            for (var i = 0; i < 3; i++)
            {
                var s = "";
                if (i < aexcl.length) s = aexcl[i][0]+","+aexcl[i][1]+","+aexcl[i][2]+","+aexcl[i][3];
                img.setAttribute("data-exclude"+(i+1), s); 
            }
        }
    }
    this.update = this.add; // The distinction is for readability
    
	function bug_workaround(canvas) 
	{
	    // see https://code.google.com/p/android/issues/detail?id=39247
		canvas.style.display = 'none';// Detach from DOM
		canvas.offsetHeight; // Force the detach
		canvas.style.display = 'inherit'; // Reattach to DOM		
	}
	this.bug_workaround = bug_workaround;
	
    this.addtween = function(id1, id2, p2, p3, p4)
    {
        var x = 0;
        var y = 0;
        var n = 0;
		var arot = [];
        var img1 = chars[idCharEval].aImg[idMsgEval+idInstEval+id1];
        var img2 = chars[idCharEval].aImg[idMsgEval+idInstEval+id2];
        if (!img1 || !img2) return;
        addToShow(idCharEval, idMsgEval+idInstEval+id1);    // First one in tween will hold z-order
        if (arguments.length == 3) 
        {
            n = p2; 
            x = img1.x; 
            y = img1.y; 
            frameTrace("tweenimg("+id1+","+id2+","+n+")");
        }
        else if (arguments.length >= 5) 
        {
            x = p2; 
            y = p3; 
            n = p4; 
			var iParam = 5;
			while (arguments.length > iParam)
			{
				arot.push( [ arguments[iParam], arguments[iParam+1], arguments[iParam+2] ]);
				iParam += 3;
			}
            frameTrace("tweenimg("+id1+","+id2+","+n+","+x+","+y+")");
        }
        img1.x = x;
        img1.y = y;
        img1.n = n;
        img1.arot = arot;
        img1.morph = id2;
        fRedraw = true;
    }
    this.updatetween = this.addtween;
    
    this.rem = function(id)  // short for remove
    {
        frameTrace("rem("+id+")");
        var img = chars[idCharEval].aImg[idMsgEval+idInstEval+id];
        if (img) 
		{
			img.arot = [];
			img.morph = null;
		}	
        removeFromShow(idCharEval, idMsgEval+idInstEval+id);
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
				if (android) bug_workaround(canvas);
                ctx.drawImage(chars[idChar].charCanvas, 0, 0, objChar.artwidth, objChar.artheight, 0, 0, parseInt(objChar.width), parseInt(objChar.height));
            }        
        }
    }
    
    function getCharScale(idChar)
    {
        var o = getDirObjectFromId(idChar);
        return o.width / o.artwidth;
    }
    
    function redrawChar(idChar, idMsg, idInst)
    {
        frameTrace("redrawChar");
        var canvas = chars[idChar].charCanvas ? chars[idChar].charCanvas : document.getElementById(idDiv + idChar + "Canvas"); 
        if (canvas.getContext)
        {
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
			if (android) bug_workaround(canvas);
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
                    var arot = img.arot;
                    if (!img.morph)
                    {
                        renderVector(ctx, id, img.data, n-1, x - chars[idChar].cxCharLeft*10, y - chars[idChar].cyCharTop*10, scale, arot);
                    }
                    else
                    {
                        var imgMorph = chars[idChar].aImg[idMsg+idInst+img.morph];
                        renderVectorMorph(ctx, id, img.data, img.morph, imgMorph.data, n, x - chars[idChar].cxCharLeft*10, y - chars[idChar].cyCharTop*10, scale, arot);
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

    function renderVector(ctx, id, data, iFrame, xDest, yDest, scale, arot)
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
        var o = getTransformMatrix(scale, xOff, yOff, arot);
        
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

    function renderVectorMorph(ctx, id, data, idM, dataM, n, xDest, yDest, scale, arot)
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
        var o = getTransformMatrix(scale, xOff, yOff, arot);
        
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

    function getTransformMatrix(scale, xTran, yTran, arot)
    {
        var o = {};

        // Initial transform vector
        o.a = 1; o.b = 0; o.c = 0; o.d = 1; o.e = xTran; o.f = yTran;
        
        // Scale
        o.a = o.a / 10 * scale;
        o.d = o.d / 10 * scale;
        
        // Rotates
		for (var i = 0; i < arot.length; i++)
		{
			var xRotate = arot[i][0];
			var yRotate = arot[i][1];
			var aRotate = arot[i][2];
			
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
			if (!getDirObjectFromId(idMsgEval).customidle)
				gotoFrame(idCharEval, 1);
			else
				focusChanged();
		}
        else
        {
            // An official end to the message - we are guaranteed to be in the same visual state as at the start
            debugTrace("stop"); 
            var ch = chars[idCharEval];
			if (ch.fStopReached)
			{
				debugTrace("extraneous stop!");
				return;
			}	
            ch.fRecovering = false;
            ch.fFirstFrameAfterRec = false;
            ch.fStopReached = true;
			ch.frame = 0;
            
            // Stop audio - we don't want to get another audioontimeupdate
            var a = document.getElementById(idDiv + idCharEval + "Audio");
			pauseAudio(a);            
            // We are only stopped when fStopReached AND any controller action is stopped
            if (!ch.action)
            {
                ch.complete = true;
				stopHit = true;
            }
            else
            {
                debugTrace("waiting for controller to stop");
            }
        }
        // even if all chars are complete, we won't do anything about it until after we unravel this thread
    }
	
	this.controllerStopped = function() 
	{
		stopHit = true;
	}
    
    this.rec = function(n)
    {
        frameTrace("rec "+n); // frame #s are 1-based, and frame # indicates the beginning of the frame
        if (chars[idCharEval].idMsgNext // indicates we are trying to stop
			&& !idleToIdle())			// except when we know we are switching from an idle to the same idle 
        {
            // The promise, when encountering a recovery, is that you can jump directly to this frame, and there will be
            // no visual difference in the character.
            debugTrace("Taking recovery to frame "+n);
            gotoFrame(idCharEval, n);
            chars[idCharEval].fRecovering = true;
            chars[idCharEval].fFirstFrameAfterRec = true;
        }
    }

    function gotoFrame(idChar, n)
    {
		frameTrace("gotoFrame "+idChar+" "+n);
		// as soon as we hit a rec or branch, we have messed with time - the assumption is that any
		// audio is either stopped or silent and about to be stopped, never to start again, and we
		// switch to a direct frame-based model, where each char's frame in their message is potentially different.
        chars[idChar].frame = n; 
		gotoFrameOccurred = true;
    }

	//
	// Controller support - moved to a module
	//
	
    this.addctl = function(id,x,y,s)
    {
		var m = modules['rasterctl'];
		if (m) m.addctl(ctl, chars[idCharEval], idCharEval, idMsgEval, id, x, y, s);
	}
    
    this.addtweenctl = function()
    {
        // UNDONE
    }
    
    this.ctlaction = function(action)
    {
		var m = modules['rasterctl'];
		if (m) m.ctlaction(ctl, chars[idCharEval], idCharEval, idMsgEval, action, mouseX, mouseY);
    }

    function ctlTrack()
    {
		var m = modules['rasterctl'];
		if (m) m.ctlTrack(ctl, chars[idCharEval], idCharEval, idMsgEval, mouseX, mouseY);
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
		if (idPlayUntil) checkPlayUntil();
		
        //frameTrace("onFrame "+idDiv);
        if (!ctl.Paused && !startShield && !idSceneLoading && !switching)
        {
            var t = (new Date()).getTime();
			if (t > tOfLastFrame + 1000/dirRoot.fps) 	// because we are called faster than our stated fps typically
			{
				// Convenient place for timeout checks
				whichAutoStart = 0;
				if (cmsNavigation > 0 && tOfLastFrame) {cmsNavigation -= (t - tOfLastFrame); if (cmsNavigation == 0) cmsNavigation = -1;}
				if (cmsInteraction > 0 && tOfLastFrame) {cmsInteraction -= (t - tOfLastFrame); if (cmsInteraction == 0) cmsInteraction = -1;}
				if (cmsInactivity > 0 && tOfLastFrame) {cmsInactivity -= (t - tOfLastFrame); if (cmsInactivity == 0) cmsInactivity = -1;}
				if (cmsInactivity < 0 || cmsInteraction < 0 || cmsNavigation < 0) 
				{
					if (cmsNavigation < 0) {whichAutoStart = 3; inactiveCount = 0;}
					else if (cmsInteraction < 0) {whichAutoStart = 2; inactiveCount = 0;}
					else if (cmsInactivity < 0) {whichAutoStart = 1; inactiveCount++;}
					cmsNavigation = 0;
					cmsInteraction = 0;
					cmsInactivity = 0;
					fireVariableChange();
					if (!ctl.Presenting && !suspendAutoStart)
						ctl.startPresenting();
				}

				// Main event firing code
				tOfLastFrame = t;
				var tCur = (t - tOfLastReport) + tLastReported;	// align us with audio time
                fireEvents(tCur);	// fireEvents may ignore this for messages that have switched to frame-based
            }
        }
        // Set in motion any captivate API
        dispatchCaptivate();
        // Similar for storyline web object
        dispatchStoryline();
                
        //setTimeout(function(){onFrame()}, 1000/dirRoot.fps);
		requestAnimationFrame(onFrame);
    }
    
    // In the common case where we put up an alert on external comand, want to prevent a cascade
    var inFireEvents = false;

    // Fire events that occur in current presentation at or before time index tcur
    function fireEvents(tcur)
    {
        if (inFireEvents) return; // in case you have an event that triggers an alert
        inFireEvents = true;
        
        frameTrace("fireEvents "+tcur);    

		var animFrame = (tcur - tOfLastIdle > 80);  // Limit the idle animation rate to about 12 fps regardless of project fps, which effectively controls only mouth speed
		if (animFrame) tOfLastIdle = tcur;
		
		var normalplay = true;
        for (var idChar in chars)
        {
			if (chars[idChar].idScene != idSceneCur) continue;
			if (!chars[idChar].started || chars[idChar].complete || chars[idChar].idMsgNext || chars[idChar].fRecovering) 
				normalplay = false; // for preload start
            if (idCharLoading && idCharLoading != idChar)   // We call fireEvents once per char as part of the loading/switching process
                continue;
            var msg = getDirObjectFromId(chars[idChar].idMsg);
            if (msg && !chars[idChar].fStopReached) 
            {
                if (msg.external && objExternal)
                    msg = objExternal;
                if (msg.onframe)
                {
					var fAnyActions = false;
					gotoFrameOccurred = false;
                    for (var frame in msg.onframe)
                    {
						frame = parseInt(frame);
                        if (frame == 0) continue;    // Frame 0 is the special load frame. Frame 1 begins at time index 0 and lasts to time index 1/fps
						var takeThisFrame = false;
						if (chars[idChar].frame > 0)
						{
							takeThisFrame = (frame == chars[idChar].frame);  // frame mode (idle/recovery)
						}
						else						
						{
							var tevent = Math.floor((1000 * (frame-1)) / dirRoot.fps);
							takeThisFrame = (tevent > eventHorizon && tevent <= tcur) // All frames that have not been executed, prior to the target time tcur
						}	
						if (takeThisFrame)
                        {
							fAnyActions = true;
                            frameTrace(idChar + " frame "+frame+" ("+tevent+") reached at time "+tcur+" - executing "+msg.onframe[frame]);
                            
							if (frame > msg.frames/3) 
								markSeen(msg);
							
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
							idInstEval = getDirObjectFromId(idMsgEval).external ? ("Inst" + uniqueInst.toString()) : "";
                            c = ctl;
							bsthis = msg;
                            fFromTimeline = true;
							try{
                            eval(msg.onframe[frame]);
							} catch (e) {if (traceLevel == 2) debugger}
                            fFromTimeline = false;
                            c = null;
							bsthis = null;
                            idCharEval = null;
                            idMsgEval = null;
                            
                            // Redraw if safe zones are violated
                            if (fRedraw && !idCharLoading) redrawChar(idChar, msg.id, idInstEval); 
							
							idInstEval = "";
                        }
                        else 
                        {
                            //frameTrace("Rejected");
                        }
						if (gotoFrameOccurred) break; // no tight loops possible
						if (stopHit) {
							markSeen(msg);
							break; // never execute past stop, even if time allows, as this would be the beginning of a recovery
						}
                    }
					// Whether or not there were actions declared at current frame, we still need to move forward one frame
					if (chars[idChar].frame > 0)
					{
						if (!gotoFrameOccurred) chars[idChar].frame++;
						frameTrace("Char "+idChar+" in frame mode at "+chars[idChar].frame);
					}
                }
			}

			if (switching) break; // in a multichar case, first char can cause a nav change...
			
			// Idle behavior for this character on this frame
			if (chars[idChar].action != "" && animFrame)
			{
				tOfLastIdle = tcur;
				
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
				if (fRedraw) redrawChar(idChar, msg.id, "");
			}     
			
			if (chars[idChar].charCanvas && !idCharLoading) stretchChar(idChar);
        }
		// Opportunity to start preloading a request that may take the server significant time to process
		if (speakPlayQueue.length > 0 && speakPlayQueue[0].type == "speak" && !preloading && !preloaded && !switching && normalplay) 
		{
			startPreload();
		}
		if (tcur < eventHorizon)
		{
			frameTrace("Possible pause of animation for audio to catch up.");
		}
		else if (tcur > eventHorizon + 1.5*(1000/dirRoot.fps))
		{
			frameTrace("Possible skip of animation to catch up with audio (or recovering).");
		}
		eventHorizon = Math.max(eventHorizon, tcur); // event horizon never moves back
        frameTrace("Event horizon now "+eventHorizon);
        
        inFireEvents = false;
		
		if (focusHit) 
		{
			focusHit = false;
			focusChanged();   
		}
		if (stopHit) 
		{
			stopHit = false;
			checkAllComplete();   
		}
    }

	function markSeen(o) 
	{
		if (!ctl["Seen"+o.id] && ctl.Presenting) {
			var x;
			if (o.type == "message") {ctl["Seen"+o.id] = true; x = o;}
			while(o) { // Seen is rolled up to dialog and slide
				if (o.type == "dialog") {ctl["Seen"+o.id] = true; x = o;}
				if (o.type == "slide") ctl["Seen"+o.id] = true; 
				o = o.parent;
			};
			lastSeen = x ? x.name : "";
			fireVariableChange();
		} 
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

			// Video events
            case 'videoonloadedmetadata': videoonloadedmetadata(idObj); break; 

            // Image load events
            case 'onload': onload(idObj); break;
            
            // Button events
            case 'buttonclick': buttonclick(idObj); break;
            case 'mouseover': buttonover(idObj); break;
            case 'mouseout': buttonout(idObj); break;
            case 'mousedown': buttondown(idObj); break;
            case 'mouseup': buttonup(idObj); break;

            // Edit events
            case 'editchange': editchange(idObj); break;
            case 'editfocus': editfocus(idObj); break;
            
            // Keyboard events
            case 'keydown': keydown(idObj); break;

            // StartShield            
            case 'shieldclick': shieldclick(); break;
            
            default: 
				var ok = false;
				var obj = getDirObjectFromId(idObj);
				if (obj)
				{
					var t = obj.type == "component" ? obj.class : obj.type;
					for (var name in modules)
					{
						if (modules[name].event(ctl, idEvent, obj, data)) {ok = true; break;}
					}	
				}	
				if (!ok) errorTrace("unhandled event "+idEvent);
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
		if (v.paused) 
			return; // we can get a stray audioontimeupdate if after we get paused
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

	// Video events
	
    function videoonloadedmetadata(idMovie)
    {
        debugTrace("videoonloadedmetadata "+idMovie);
		if (initialMovieCurrentTime) 
		{        
			var obj = getVideoObjFromId(id);
			debugTrace("v.currentTime = "+initialMovieCurrentTime); 
			obj.currentTime = initialMovieCurrentTime;
			initialMovieCurrentTime = undefined;
		}
    }
	
    // Button events
    
    function buttonclick(idBtn)
    {
        var btn = getDirObjectFromId(idBtn);
        if (btn && !btn.disabled) 
        {
			debugTrace("buttonclick "+idBtn+" at "+(new Date()).getTime());
			
            // Checkbox/radio behaviors
            if (btn.toggleschosen)
            {
                btn.chosen = !btn.chosen;
                updateButton(btn.id);
				if (btn.variable) {
					var value = btn.chosen ? 1 : 0;
					debugTrace(btn.variable + " changed to " + value);
					ctl[btn.variable] = value;
					fireVariableChange();
				}
            }
			else if (btn.variable && btn.value) {
				debugTrace(btn.variable + " changed to " + btn.value);
				ctl[btn.variable] = btn.value;
				fireVariableChange();
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
			if (btn.scorecorrect || btn.scoreincorrect)
			{
				var slide = getContainingElementOfType("slide", btn); 
				slide.score = btn.scorecorrect ? 1 : 0
			}
            
			var nav = false;
            var cmd = btn.onclick;
            if (cmd)
            {
                debugTrace("Executing: "+cmd);
                c = ctl;
				bsthis = btn;
				var focusPrev = ctl.Focus;
				var presPrev = ctl.Presenting;
				try{
                eval(cmd);
				} catch (e) {if (traceLevel == 2) debugger}
				if (focusPrev != ctl.Focus || presPrev != ctl.Presenting) {
					nav = true;
				}
                c = null;
				bsthis = null;
            }
			if (nav)
				cmsNavigation = getTimeout("autostartonnavigation");
			else 
				cmsInteraction = getTimeout("autostartoninteraction");
			
			cmsInactivity = 0;
			inactiveCount = 0;
			
			var temp = btn;
			while (temp.parent.type == "grid")
				temp = temp.parent;
			lastTouched = temp ? temp.name : "";
			ctl["Touched"+temp.id] = true;
			fireVariableChange();
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
		updateBindings();
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
    
	this.msGoto = function(idMsg) 
	{
		infoTrace("msGoto('"+idMsg+"')");
		gotoHelper(idMsg, "");
	}
	this.msGotoAndStart = function(idMsg)
	{
		infoTrace("msGotoAndStart('"+idMsg+"')");
		gotoHelper(idMsg, "AndStart");
	}
	this.msGotoAndStop = function(idMsg) 
	{
		infoTrace("msGotoAndStop('"+idMsg+"')");
		gotoHelper(idMsg, "AndStop");
	}
	
    this.msPlay = function(idMsg) // same as msGotoAndStart
	{
		infoTrace("msPlay('"+idMsg+"')");
		gotoHelper(idMsg, "AndStart");
	}	
    this.msPlayQueued = function(id)
    {
        infoTrace("msPlayQueued('"+id+"')");
        if (!ctl.Presenting && !ctl.Restart)
        {
            ctl.Focus = getIdFromIdOrName(id); 
            ctl.Presenting = true;
            
            if (getDirObjectFromId(ctl.Focus))
                focusChanged();
            else
                errorTrace("msPlayQueued() - no message "+id);
        }
        else
        {
            speakPlayQueue.push({type:"play", data:id});
			fireQueueLengthChange();
        }
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
                infoTrace("Playing from queue with: "+ctl.Focus);
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

    this.msNextFocusAndStop = function()
    {
        infoTrace("msNextFocusAndStop()");
        this.nextFocusAndStop();
    }
    this.msPreviousFocusAndStop = function()
    {
        infoTrace("msPreviousFocusAndStop()");
        this.previousFocusAndStop();
    }
	
    this.msGetVariable = function(name)
    {
        return this[name];
    }

    this.msSetVariable = function(name, value)
    {
        this[name] = value;
    }

	this.vc = function() {fireVariableChange();}
	
	function fireVariableChange() 
	{
		// NOTE: does NOT fire with msSetVariable(s) API
		
		// update fields
		updateBindings();
		// tell surrounding html
	    if (typeof onVariableChange == 'function')
            onVariableChange(idDiv);
	}

	function updateBindings()
	{
        updateBindingsRec(dirRoot);
    }

    function updateBindingsRec(parent)
    {
        for (id in parent.items)
        {
            obj = parent.items[id];
            if (obj.type == "text" && obj.expression)
            {
				bsthis = obj;
				var cOld = window["c"] ? c : undefined; // because we can get here from vc() called inside a frame
				c = ctl;
				try{
				var r = eval(obj.expression);
				} catch (e) {r = undefined; if (traceLevel == 2) debugger}
				c = cOld;
				bsthis = null;
				debugTrace("eval(" + obj.expression + ") is " + r);
				var dom = getDOMObjFromId(obj.id);
				dom.innerHTML = r;
            }
			else if (obj.type == "editcontrol" && obj.variable)
			{
				var x = document.getElementById(idDiv+id+'Edit');
				if (x.value != ctl[obj.variable]) // key: avoids the loop when you type in an edit, modify the variable, and reset the same value - moves cursor to end
					x.value = ctl[obj.variable];
			}
			else if (obj.type == "button" && obj.stayschosen && obj.variable && obj.value)
			{
				obj.chosen = (ctl[obj.variable] == obj.value);
				updateButton(id);
			}
			else if (obj.type == "button" && obj.toggleschosen && obj.variable)
			{
				obj.chosen = (ctl[obj.variable] == 1);
				updateButton(id);
			}
			else if (obj.type == "component")
			{
				for (var name in modules)
				{
					if (name == obj.class)
					{
						modules[name].onVariableChange(ctl, obj);
					}	
				}	
			}
            else if (obj.hasOwnProperty("items"))
            {
                updateBindingsRec(obj);
            }
        }
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
	
    this.msGetMessages = function()
    {
		var a = [];
		for (key in dirHash)
		{
			if (dirHash[key].type == "message") 
				a.push(dirHash[key].name);
		}
		return a;
    }
	
    this.msStartShieldUp = function()
    {
        return startShield;
    }
	
	function fireQueueLengthChange()
	{
		infoTrace("Firing onQueueLengthChange("+idDiv+","+speakPlayQueue.length+")");
		if (typeof onQueueLengthChange == 'function')
			onQueueLengthChange(idDiv, speakPlayQueue.length);
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

function msDataLoaded()
{
    for (var i = 0; i < msEmbeddings.length; i++)
    {
        var ctl = msEmbeddings[i];
        ctl.someDataLoaded();
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

function msModuleLoaded()
{
    for (var i = 0; i < msEmbeddings.length; i++)
    {
        var ctl = msEmbeddings[i];
        ctl.aModuleLoaded();
    }
}

function msExternalLoaded(data)
{
    for (var i = 0; i < msEmbeddings.length; i++)
    {
        var ctl = msEmbeddings[i];
        ctl.aExternalLoaded(data);
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

function msPlayQueued(idX, idMsg)
{
    var x = document.getElementById(idX); if (x == null) x = msGetFlash(idX);
    if (msIsFlash(x)) x.msPlayQueued(idMsg); else if (msIsHTML5(x)) x.ctl.msPlayQueued(idMsg);
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

function msGetMessages(idX)
{
    var x = document.getElementById(idX);
    if (msIsHTML5(x)) return x.ctl.msGetMessages(); else return [];
}

function msSetTraceLevel(idX, n)
{
    var x = document.getElementById(idX); 
    if (msIsHTML5(x)) x.msSetTraceLevel(n);
}

function msPause(idX, idMsg)
{
    var x = document.getElementById(idX); if (x == null) x = msGetFlash(idX);
    if (msIsFlash(x)) x.msPause(idMsg); else if (msIsHTML5(x)) x.ctl.pausePresenting(idMsg);
}

function msResume(idX, idMsg)
{
    var x = document.getElementById(idX); if (x == null) x = msGetFlash(idX);
    if (msIsFlash(x)) x.msResume(idMsg); else if (msIsHTML5(x)) x.ctl.resumePresenting(idMsg);
}

function msStartShieldUp(idX)
{
    var x = document.getElementById(idX);
    if (msIsHTML5(x)) return x.ctl.msStartShieldUp();
	else return false;
}

function msAudioLoadComplete(idX)
{
    var x = document.getElementById(idX);
    if (msIsHTML5(x)) x.ctl.onAudioLoadCompleteExt();
}

function msGoto(idX, idTgt) {var x = document.getElementById(idX); if (msIsHTML5(x)) x.ctl.msStart(idTgt);}
function msGotoAndStart(idX, idTgt) {var x = document.getElementById(idX); if (msIsHTML5(x)) x.ctl.msGotoAndStart(idTgt);}
function msGotoAndStop(idX, idTgt) {var x = document.getElementById(idX); if (msIsHTML5(x)) x.ctl.msGotoAndStop(idTgt);}
function msNextFocusAndStop(idX, idTgt) {var x = document.getElementById(idX); if (msIsHTML5(x)) x.ctl.msNextFocusAndStop(idTgt);}
function msPreviousFocusAndStop(idX, idTgt) {var x = document.getElementById(idX); if (msIsHTML5(x)) x.ctl.msPreviousFocusAndStop(idTgt);}
