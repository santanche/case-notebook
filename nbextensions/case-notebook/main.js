// file my_extension/main.js

define([
	    'base/js/namespace',
	    'jquery',
	    'require',
	    'notebook/js/cell',
	    'base/js/security',
	    'components/marked/lib/marked',
	    'base/js/events',
	    'notebook/js/textcell'
	], function(IPython, $, requirejs, cell, security, marked, events, textcell) {

	var notebookCell;
	var mdhtml;
	var knots = [];
	var knotContext = null;
	
	var render_cell = function(cell) {
        notebookCell = cell;
        mdhtml = cell.element.find('div.text_cell_render')[0];
        
        var mdtext = mdhtml.innerHTML;
        
        var marks = [
            [/^(?:<p>)? *==* *(\w[\w ]*)=* *(?:<\/p>)?/igm, markKnot],
            [/\+\+ *(\w[\w ]*)?(?:-(?:(?:&gt;)|>) *(\w[\w. ]*))?/igm, markOption],
            [/-(?:(?:&gt;)|>) *(\w[\w. ]*)/igm, markDivert],
            [/^(?:<p>)? *: *([\w]+) *: *(?:<\/p>)?/igm, markCharacter],
            [/<img src="([\w:.\/\?&#\-]+)" (?:alt="([\w ]+)")?>/igm, markImage],
            [/\{([\w ]*)(?:=([\w %]*)(?:\/([\w %]*))?)?\}(?:\(([\w ]*)(?:=([\w %]*)(?:\/([\w %]*))?)?\))?/igm, markDomain]
            /* /\{([\w ]*)\}(?:\(([\w ]*)\))?/igm */
        ];
        
        notebookCell.notebook.kernel.execute("HealthDM.clearTerms()")

        // indexing knots
        var knotContext = null;
        var knotHeads = mdtext.match(marks[0][0]);
        for (kh in knotHeads) {
        	var label = knotHeads[kh].match(/==* *(\w[\w ]*)=*/i);
        	label = label[1].trim();
        	if (knotHeads[kh].indexOf("==") >= 0)
        		knotContext = label;
        	else
        		label = (label.indexOf(".") < 0 && knotContext == null) ? label : knotContext + "." + label;
        	knots.push(label);
        }
        
        // replacing Ink marks
        var current = 0;
        var mdfocus = mdtext;
        var mdresult = "";
        
        var matchStart;
        do {
	        matchStart = -1;
	        var selected = -1;
	        for (mk in marks) {
	        	var pos = mdfocus.search(marks[mk][0]);
	        	if (pos > -1 && (matchStart == -1 || pos < matchStart)) {
	        		selected = mk;
	        		matchStart = pos;
	        	}
	        }
	        
	        if (matchStart > -1) {
	        	var matchSize = mdfocus.match(marks[selected][0])[0].length;
	        	var toReplace = mdfocus.substring(0, matchStart + matchSize);
	        	mdresult += toReplace.replace(marks[selected][0], marks[selected][1]);
	        	if (matchStart + matchSize >= mdfocus.length)
	        		matchStart = -1;
	        	else
	        		mdfocus = mdfocus.substring(matchStart + matchSize);
	        }
        } while (matchStart > -1);
        
        mdresult += mdfocus;

        mdhtml.innerHTML = mdresult;
    };
    
    var markKnot = function(matchStr, inside) {
    	var label = inside.trim();

    	var display = matchStr.match(/==* *(\w[\w ]*)=*/ig);
    	
    	if (matchStr.indexOf("==") >= 0)
    		knotContext = label;
    	else
    		label = (label.indexOf(".") < 0 && knotContext == null) ? label : knotContext + "." + label;
    	
        return "<h1><a id='knot_" + label + "'><span style='font-style:italic'>" + display + "</span></a></h1>";
    };

    var markOption = function(matchStr, insideText, insideDivert) {
    	/*
    	console.log("inside text: " + insideText);
    	console.log("inside divert: " + insideDivert);
    	*/
    	
    	var display = (insideText != null) ? insideText : insideDivert;
    	var link = "#";
    	if (insideDivert != null) {
    		var label = insideDivert.trim();
    		var newLabel = divertResolver(label);
        	display = (newLabel != null) ? display : display + "-> ?" + label + "?";
        	link = "#knot_" + ((newLabel != null) ? newLabel : label);
    	}

    	return "<ul><li><a href='" + link + "'><span style='font-weight:bold'>" + display + "</span></a></li></ul>";
    };
    
    var markDivert = function(matchStr, inside) {
    	var label = inside.trim();
    	var newLabel = divertResolver(label);
    	
    	var display = (newLabel != null) ? inside : "?" + label + "?";
    	var link = (newLabel != null) ? newLabel : label;
    	
    	return "<a href='#knot_" + link + "'><span style='font-weight:bold'>" + display + "</span></a>";
    };
    
    var divertResolver = function(label) {
    	var newLabel = null;
    	
    	if (knots.indexOf(label) >= 0)
    		newLabel = label;
    	else if (knotContext != null && knots.indexOf(knotContext + "." + label) >= 0)
    		newLabel = knotContext + "." + label;
    	
    	return newLabel;
    };
    
    var markCharacter = function(matchStr, inside) {
    	var label = inside.trim();
    	
    	var display = matchStr.replace(/: *([\w]+ *:)/igm, "<span style='font-weight:bold'>$1</span>");
    	
    	return display;
    };

    var markImage = function(matchStr, inside1, inside2) {
    	return matchStr.replace(">", " style='float:left'><p style='clear:both'></p>");
    };
    
    var meshBack = function(meshResult){
    	// alert("MeSH back: " + meshResult.content.data["text/plain"]);
    	
    	var regexR = /u?'#mesh_heading#([\w\s]*)#tree_number#([\w\:\/\.]*)'/igm;
    	
    	console.log(meshResult);
    	
    	if (meshResult.msg_type == "execute_result") {
    		var result = meshResult.content.data["text/plain"];
    		var heading = result.replace(regexR, "$1");
    		var code = result.replace(regexR, "$2");
    	
	    	var regexA = new RegExp("#mesh_addr#" + heading + "#", "igm");
	    	mdtext = mdhtml.innerHTML.replace(regexA, "https://meshb-prev.nlm.nih.gov/record/ui?name=" + heading);
	    	var regexT = new RegExp("#tree_number#" + heading + "#", "igm");
	    	mdhtml.innerHTML = mdtext.replace(regexT, code);
    	} else if (meshResult.msg_type == "error")
    		console.log("Sparql error: " + meshResult.content.evalue);
    	else
    		console.log("Unknown message return type: " + meshResult.msg_type);
    	
    	// alert("heading: " + heading + "; code: " + code);
    };
    
    var markDomain = function(matchStr, insideDescription, insideDetail1, insideRate1,
    		                            insideHeading, insideDetail2, insideRate2) {
    	console.log("inside description: " + insideDescription);
    	console.log("inside detail 1: " + insideDetail1);
    	console.log("inside rate 1: " + insideRate1);
    	console.log("inside heading: " + insideHeading);
    	console.log("inside detail 2: " + insideDetail2);
    	console.log("inside rate 2: " + insideRate2);
    	
    	var description = insideDescription.trim();
    	var detail1 = (insideDetail1 != null) ? insideDetail1.trim() : "#";
    	var rate1 = (insideRate1 != null) ? insideRate1.trim() : "#";
    	var heading = (insideHeading != null) ? insideHeading.trim() : description;
    	var detail2 = (insideDetail2 != null) ? insideDetail2.trim() : "#";
    	var rate2 = (insideRate2 != null) ? insideRate2.trim() : "#";
    	
        notebookCell.notebook.kernel.execute(
        		"HealthDM.findMeshCode('" + heading + "','" + detail1 + "','" + rate1 + "','" +
        		                            description + "','" + detail2 + "','" + rate2 + "')",
        		{iopub : {output: meshBack}},
        	    {silent: false, store_history : false, stop_on_error: false});

    	return "<a href='#mesh_addr#" + heading + "#' title='#tree_number#" + heading +
    	                "#' target='_blank'>" + description + "</a>";
    };

    var load_ipython_extension = function() {
        // alert("Observer installed");
        
        // Select the node that will be observed for mutations
        // var targetNode = document.getElementById("notebook-container");
    	
        events.on("rendered.MarkdownCell", function (event, data) {
            render_cell(data.cell);
        });
        
        
        /*
        var callbackEvent = function(event) {
        	console.log("Event: " + event.detail);
        };
        
        // targetNode.addEventListener("rendered.MarkdownCell", callbackEvent);
        
        var installEvent = function(node) {
        	node.addEventListener("rendered.MarkdownCell", callbackEvent);
        };
        
        document.querySelectorAll(".MarkdownCell *").forEach(installEvent);
        
        
        // Options for the observer (which mutations to observe)
        var config = { attributes: true, childList: true, subtree: true };

        // Callback function to execute when mutations are observed
        var callback = function(mutationsList, observer) {
            for(var mutation of mutationsList) {
                if (mutation.type == 'childList') {
                    console.log("Observer: A child node has been added or removed.");
                }
                else if (mutation.type == 'attributes') {
                    console.log('The ' + mutation.attributeName + ' attribute was modified.');
                }
            }
        };

        // Create an observer instance linked to the callback function
        var observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
        */
    };

    return {
        load_ipython_extension: load_ipython_extension
    };
});
