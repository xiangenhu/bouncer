// ctl.debugTrace( -> //ctl.debugTrace(
// ctl.frameTrace( -> //ctl.frameTrace(
// then http://closure-compiler.appspot.com/home
// ==ClosureCompiler==
// @output_file_name MSHTML5_bubble.min.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==
window.MSModule_bubble = new MSModule_bubble;
function MSModule_bubble()
{
	// Modules are shared between embedding, so don't include data here! All context is provided to each API by way of ctl, objid, etc.
	
	// Standard module API
    this.render = function(ctl, obj)
    {
        var s = "";
		s += '<div id="'+ctl.idDiv+obj.id+'Div" style="position:absolute; left:'+obj.left+'px; top:'+obj.top+'px;">';
		s += '<div id="'+ctl.idDiv+obj.id+'Inner" style="position:relative; left:0px; top:0px;" width="'+(obj.width+5)+'" height="'+(obj.height+8)+'">';
		  s += '<canvas id="'+ctl.idDiv+obj.id+'Canvas" style="position:absolute; left:0px; top:0px;" width="'+(obj.width+5)+'" height="'+(obj.height+8)+'"></canvas>';
		  s += '<div id="'+ctl.idDiv+obj.id+'Text" style="position:absolute; left:5px; top:5px; width:'+(parseInt(obj.width)-10)+'px; height:0px;';
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

	// Standard module API
	this.event = function(ctl, idEvent, obj, data)
	{
	}

	// Special bubble API
    function updateBubble(ctl, obj, text)
    {
		// If text does not all fit, remainder is stored in textDeferred on the dir object
        obj.textDeferred = "";
        updateBubbleActual(ctl, obj, text)
    }
	this.updateBubble = updateBubble;

    function updateBubbleActual(ctl, obj, text)
    {
        var layout = layoutBubble(ctl, obj, text, obj.width - 12, obj.height - 10 - obj.tailheight);
        ctl.debugTrace("Text "+layout.text+" lays out to h="+layout.height+" remainder: "+layout.remain);
        if (layout.remain.length > 0)
        {
            obj.textDeferred = layout.remain;
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

        var c = document.getElementById(ctl.idDiv+obj.id+'Canvas');
        var ctx = c.getContext("2d");
        
        ctx.clearRect(0, 0, c.width, c.height);
		if (ctl.android) ctl.bug_workaround(c);
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
        
        var t = document.getElementById(ctl.idDiv+obj.id+'Text');
        t.style.top = (y+5)+'px';
        t.innerHTML = layout.text;
        
        // Show it 
        var d = document.getElementById(ctl.idDiv+obj.id+'Div');
        d.style.display = 'block';         
        
        // Clear previous timer, and set new timer - store the timer on the dir object
        if (obj.timer)
        {
            clearTimeout(obj.timer); 
        }
        var cms = getBubbleTime(layout.text, obj);
        obj.timer = setTimeout(function(){hideBubble(ctl,obj);}, cms);
    }

    function layoutBubble(ctl, obj, text, width, heightMax)
    {
        var mdiv = document.getElementById(ctl.idDiv+"Measure");
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

    function getBubbleTime(t, obj)
    {
        var wc = t.split(" ").length;
        var cms = obj.minshow + (1000 * 60 * wc / obj.wpm); 
        return cms;
    }

    function hideBubble(ctl, obj)
    {
        obj.timer = 0;
        if (obj.textDeferred.length > 0)
        {
            updateBubble(ctl, obj, obj.textDeferred);
        }
        else
        {
            var d = document.getElementById(ctl.idDiv+obj.id+'Div');
            d.style.display = 'none';         
        }
    }
};
msModuleLoaded();
