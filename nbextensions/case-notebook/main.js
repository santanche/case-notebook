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
	
	var render_cell = function(cell) {
		notebookCell = cell;
		
        mdhtml = cell.element.find('div.text_cell_render')[0];
        
        var mdtext = mdhtml.innerHTML;
        
        var marks = [
            [/\{([\w\s]*)\}/igm, markDomain],
            [/===([\w\s]*)===/igm, markKnot]
        ];
        
        for (mk in marks)
            mdtext = mdtext.replace(marks[mk][0], marks[mk][1]);
        	
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
        notebookCell.notebook.kernel.execute("findMeshCode('" + inside + "')",
        		{iopub : {output: meshBack}},
        	    {silent: false, store_history : false, stop_on_error: false});

    	return "<a href='#mesh_addr#" + inside + "#' title='#tree_number#" + inside + "#' target='_blank'>" + inside + "</a>";
    };

    var markKnot = function(match, inside) {
        return "<h1><span style='font-style: italic'>" + inside + "</span></h1>";
    };

    var load_ipython_extension = function() {
        events.on("rendered.MarkdownCell", function (event, data) {
            render_cell(data.cell);
        });
        
        var handler = function () {
            alert('this is an alert from my_extension!');
        };

        var action = {
            icon: 'fa-comment-o', // a font-awesome class used on buttons, etc
            help    : 'Show an alert',
            help_index : 'zz',
            handler : handler
        };
        var prefix = 'my_extension';
        var action_name = 'show-alert';

        var full_action_name = Jupyter.actions.register(action, action_name, prefix); // returns 'my_extension:show-alert'
        Jupyter.toolbar.add_buttons_group([full_action_name]);
    };

    return {
        load_ipython_extension: load_ipython_extension
    };
});
