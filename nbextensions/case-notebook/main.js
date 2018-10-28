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
	
	var render_cell = function(cell) {
        // alert("rendered cell");

        notebookCell = cell;
        mdhtml = cell.element.find('div.text_cell_render')[0];
        
        var mdtext = mdhtml.innerHTML;
        
        var marksRound1 = [
            [/\{([\w ]*)\}/igm, markDomain],
            [/===([\w ]*)===/igm, markKnot]
        ];
        
        var marksRound2 = [
        	[/-(?:(?:&gt;)|>)([\w ]*)/igm, markDivert]
        ];
        
        // console.log("=== Before: " + mdtext);
        
        notebookCell.notebook.kernel.execute("HealthDM.clearConcepts()")
        
        // replacing Ink marks - round 1
        for (mk in marksRound1)
            mdtext = mdtext.replace(marksRound1[mk][0], marksRound1[mk][1]);

        // replacing Ink marks - round 2
        for (mk in marksRound2)
            mdtext = mdtext.replace(marksRound2[mk][0], marksRound2[mk][1]);
        
        // console.log("=== After: " + mdtext);

        mdhtml.innerHTML = mdtext;
    };
    
    var meshBack = function(meshResult){
    	// alert("MeSH back: " + meshResult.content.data["text/plain"]);
    	
    	var regexR = /u?'#mesh_heading#([\w\s]*)#tree_number#([\w\:\/\.]*)'/igm;
    	
    	var result = meshResult.content.data["text/plain"];
    	var heading = result.replace(regexR, "$1");
    	var code = result.replace(regexR, "$2");
    	
    	var regexA = new RegExp("#mesh_addr#" + heading + "#", "igm");
    	mdtext = mdhtml.innerHTML.replace(regexA, "https://meshb-prev.nlm.nih.gov/record/ui?name=" + heading);
    	var regexT = new RegExp("#tree_number#" + heading + "#", "igm");
    	mdhtml.innerHTML = mdtext.replace(regexT, code);
    	
    	// alert("heading: " + heading + "; code: " + code);
    };
    
    var markDomain = function(match, inside) {
    	var label = inside.trim();
    	
        notebookCell.notebook.kernel.execute("HealthDM.findMeshCode('" + label + "')",
        		{iopub : {output: meshBack}},
        	    {silent: false, store_history : false, stop_on_error: false});

    	return "<a href='#mesh_addr#" + label + "#' title='#tree_number#" + label + "#' target='_blank'>" + label + "</a>";
    };

    var markKnot = function(match, inside) {
    	var label = inside.trim();
    	
    	knots.push(label);
        return "<h1><a id='knot_" + label + "'><span style='font-style: italic'>" + label + "</span></a></h1>";
    };

    var markDivert = function(match, inside) {
    	var label = inside.trim();
    	
    	// console.log("Knots: " + knots);
    	// console.log("Inside: " + label);
    	var display = (knots.indexOf(label)>=0) ? label : "?" + label + "?";
        return "<a href='#knot_" + label + "'><span style='font-style: bold'>" + display + "</span></a>";
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
