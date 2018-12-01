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

	var marks = [
		// /^(?:<p>)?[ \t]*==*[ \t]*(\w[\w \t]*)=*[ \t]*(?:\(([\s\w=-\+\*\/,])\))?(?:<\/p>)?/igm,
		/^(?:<p>)?[ \t]*==*[ \t]*(\w[\w \t]*)(?:\(([\w \t]*)\))?[ \t]*=*[ \t]*(?:<\/p>)?/igm,           // knot
        /\+\+[ \t]*([^-&> \t][^-&>]*)?(?:-(?:(?:&gt;)|>)[ \t]*(\w[\w. \t]*))?/igm, // option
        /-(?:(?:&gt;)|>) *(\w[\w. ]*)/igm,                       // divert
        /^(?:<p>)? *: *([\w]+) *: *(?:<\/p>)?/igm,               // character
        /<img src="([\w:.\/\?&#\-]+)" (?:alt="([\w ]+)")?>/igm,  // image
        /\{([\w ]*)(?:=([\w %]*)(?:\/([\w %]*))?)?\}(?:\(([\w ]*)(?:=([\w %]*)(?:\/([\w %]*))?)?\))?/igm // domain
    ];
	
	var render_cell = function(cell) {
        notebookCell = cell;
        mdhtml = cell.element.find('div.text_cell_render')[0];
        
		var mdtext = mdhtml.innerHTML;
		var mdinterface = mdhtml.innerHTML;

        notebookCell.notebook.kernel.execute("HealthDM.clearTerms()");

		generateInterface(mdinterface);
        
        var markFs = [markKnot, markOption, markDivert, markCharacter, markImage, markDomain];
        
        // indexing knots
        var knotContext = null;
        var knotHeads = mdtext.match(marks[0]);
        for (kh in knotHeads) {
        	var label = knotHeads[kh].match(/==*[ \t]*(\w[\w \t]*)(?:\([\w \t]*\))?[ \t]*=*/i);
        	label = label[1].trim();
        	if (knotHeads[kh].indexOf("==") >= 0)
        		knotContext = label;
        	else
        		label = (label.indexOf(".") < 0 && knotContext == null) ? label : knotContext + "." + label;
        	knots.push(label);
        }
        
        // replacing Ink marks
        var mdfocus = mdtext;
        var mdresult = "";
        
        var matchStart;
        do {
	        matchStart = -1;
	        var selected = -1;
	        for (mk in marks) {
	        	var pos = mdfocus.search(marks[mk]);
	        	if (pos > -1 && (matchStart == -1 || pos < matchStart)) {
	        		selected = mk;
	        		matchStart = pos;
	        	}
	        }
	        
	        if (matchStart > -1) {
	        	var matchSize = mdfocus.match(marks[selected])[0].length;
	        	var toReplace = mdfocus.substring(0, matchStart + matchSize);
	        	mdresult += toReplace.replace(marks[selected], markFs[selected]);
	        	if (matchStart + matchSize >= mdfocus.length)
	        		matchStart = -1;
	        	else
	        		mdfocus = mdfocus.substring(matchStart + matchSize);
	        }
        } while (matchStart > -1);
        
        mdresult += mdfocus;

		mdhtml.innerHTML = mdresult;
	};
	
	var generateInterface = function(mdinterface) {
		var knotBlocks = mdinterface.split(marks[0]);

        var knotTemplate = (knotBlocks[2] == null) ? "knot" : knotBlocks[2].trim().replace(" ", "_");

		console.log(knotBlocks);
		console.log('HealthDM.interfacePresentation("' + knotBlocks[1].trim() + '","""' +
		             knotBlocks[3] + '""","' + knotTemplate + '")');

		notebookCell.notebook.kernel.execute(
			'HealthDM.interfacePresentation("' + knotBlocks[1].trim() + '","""' + knotBlocks[3] +
			'""","' + knotTemplate + '")');

		for (kb = 4; kb < knotBlocks.length; kb += 3) {
			var pageName = knotBlocks[kb].trim().replace(/ /igm, "_");
			knotTemplate = (knotBlocks[kb+1] == null) ? "knot" : knotBlocks[kb+1].trim().replace(" ", "_");
			var pageContent = knotBlocks[kb+2].replace(marks[5], interfaceDomain).replace(marks[1], interfaceOption).
			                  replace(marks[4], interfaceImage);
			console.log('HealthDM.interfaceKnot("' + pageName + '","' + knotBlocks[kb].trim() + '","""' + pageContent +
			            '""","' + knotTemplate + '")');
			notebookCell.notebook.kernel.execute(
			  'HealthDM.interfaceKnot("' + pageName + '","' + knotBlocks[kb].trim() + '","""' + pageContent +
			  '""","' + knotTemplate + '")');
		}
	};
    
    var interfaceDomain = function(matchStr, insideDescription, insideDetail1, insideRate1,
    		                                 insideHeading, insideDetail2, insideRate2) {
		return matchStr.match(/\{([\w= %\/]*)\}/i)[1];
	}

    var interfaceOption = function(matchStr, insideText, insideDivert) {
		var display = (insideText != null) ? insideText : insideDivert;
		
        var link = (insideDivert != null) ? insideDivert.trim().replace(/ /igm, "_") : "#";

		return "<div class='case_link'><a href='" + link + ".html'>" + display + "</a></div>";
	};
	
	var interfaceImage = function(matchStr, inside1, inside2) {
    	return matchStr.replace(">", " style='float:left' width='300px'>");
    };
    
   var markKnot = function(matchStr, insideText, insideTemplate) {
	    // var variables = insideVariables.replace(/(?:\( *(\w*) *(?:([=-\+\*\/])([\w ]*))?\))?/igm);
	   
    	var label = insideText.trim();

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
    	return matchStr.replace(">", " style='float:left' width='300px'><p style='clear:both'></p>");
    };
    
    var meshBack = function(meshResult){
    	// alert("MeSH back: " + meshResult.content.data["text/plain"]);
    	
    	var regexR = /u?'#mesh_heading#([\w\s]*)#tree_number#([\w\:\/\.]*)'/igm;
    	
    	// console.log(meshResult);
    	
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
        /*
		console.log("inside description: " + insideDescription);
    	console.log("inside detail 1: " + insideDetail1);
    	console.log("inside rate 1: " + insideRate1);
    	console.log("inside heading: " + insideHeading);
    	console.log("inside detail 2: " + insideDetail2);
		console.log("inside rate 2: " + insideRate2);
		*/
		
    	var description = insideDescription.trim();
    	var detail1 = (insideDetail1 != null) ? insideDetail1.trim() : "#";
    	var rate1 = (insideRate1 != null) ? insideRate1.trim() : "#";
    	var heading = (insideHeading != null) ? insideHeading.trim() : description;
    	var detail2 = (insideDetail2 != null) ? insideDetail2.trim() : "#";
    	var rate2 = (insideRate2 != null) ? insideRate2.trim() : "#";

		console.log("inside description: " + description);
		console.log("inside heading: " + heading);
		
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
