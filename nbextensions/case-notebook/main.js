// file my_extension/main.js

define(["base/js/namespace", "jquery", "require", "notebook/js/cell",
        "base/js/security", "components/marked/lib/marked",
        "base/js/events", "notebook/js/textcell"],
        
function(_IPython, _$, _requirejs, _cell, _security, _marked, events,
      _textcell) {

   var notebookCell;
   var mdhtml;
   var knots = [];
   var knotContext = null;
   var knotImage = "";
   var knotTemplate = null;

   var marks = {
      knot : /^(?:<p>)?[ \t]*==*[ \t]*(\w[\w \t]*)(?:\(([\w \t]*)\))?[ \t]*=*[ \t]*(?:<\/p>)?/igm,
      option : /\+\+[ \t]*([^-&<> \t][^-&<>\n\r\f]*)?(?:-(?:(?:&gt;)|>)[ \t]*(\w[\w. \t]*))?/igm,
      divert : /-(?:(?:&gt;)|>) *(\w[\w. ]*)/igm,
      character : /^(?:<p>)?[ \t]*:[ \t]*([\w]+)[ \t]*:[ \t]*(?:<\/p>)?/igm,
      image : /<img src="([\w:.\/\?&#\-]+)" (?:alt="([\w ]+)")?>/igm,
      input : /\{[ \t]*\?(\d+)?([\w \t]*)(?:\:([\w \t%]*))?\}/igm,
      domain : /\{([\w \t\-"]*)(?:[=\:]([\w \t%]*)(?:\/([\w \t%]*))?)?\}(?:\(([\w \t\+\-=\*]*)(?:[=\:]([\w \t%]*)(?:\/([\w \t%]*))?)?\))?/igm,
      score : /^(?:<p>)?[ \t]*~[ \t]*([\+\-=\*\\%]?)[ \t]*(\w*)?[ \t]*(\w+)[ \t]*(?:<\/p>)?/igm
   };

   var render_cell = function(cell) {
      notebookCell = cell;
      mdhtml = cell.element.find('div.text_cell_render')[0];
      
      console.log("=== MDHTML ===");
      console.log(mdhtml.innerHTML);

      // Reset the widget panel cleaning up it
      notebookCell.notebook.kernel.execute("HealthDM.clearTerms()");

      renderInterface(mdhtml);
      renderMarkdown(mdhtml);
   };

   // Renders the HTML interface of the narrative
   var renderInterface = function(mdhtml) {
      var mdinterface = mdhtml.innerHTML;
      
      var knotBlocks = mdinterface.split(marks.knot);

      // capturing title, description and image of the starting knot
      var caseTitle = knotBlocks[1].trim();
      var caseDescription = "";
      var caseImage = "";
      if (knotBlocks[3] != null && knotBlocks[3].trim().length > 0) {
         caseDescription = knotBlocks[3].replace(marks.option, "")
               .replace(marks.image, ""); // marks - option/image
         var imageStr = knotBlocks[3].match(marks.image);
         caseImage = (imageStr == null) ? "" : imageStr[0].replace(">",
               " style='width:100px'>"); // marks - image
      }

      /*
      console.log('HealthDM.interfaceMain("' + caseTitle + '","""'
            + caseDescription + '""","""' + caseImage + '""","'
            + caseTitle.replace(/ /igm, "_") + '")');
      */
      notebookCell.notebook.kernel
            .execute('HealthDM.interfaceMain("' + caseTitle + '","""'
                  + caseDescription + '""","""' + caseImage + '""","'
                  + caseTitle.replace(/ /igm, "_") + '")');

      const interfaceFs = {
            // knot   : markKnot,
            option : interfaceOption,
            divert : interfaceDivert,
            // character : interfaceCharacter,
            image  : interfaceImage,
            input  : interfaceInput,
            domain : interfaceDomain,
            score  : interfaceScore
      };
      
      for (kb = 1; kb < knotBlocks.length; kb += 3) {
         let pageName = knotBlocks[kb].trim().replace(/ /igm, "_");
         knotTemplate = (knotBlocks[kb + 1] == null) ? "knot"
                          : knotBlocks[kb + 1].trim().replace(" ", "_");
         knotImage = "";
         let pageContent = knotBlocks[kb + 2];
         for (mk in interfaceFs)
            pageContent = pageContent.replace(marks[mk], interfaceFs[mk]);
         /*
         var pageContent = knotBlocks[kb + 2].replace(marks.input,
               interfaceInput).replace(marks.domain, interfaceDomain)
               .replace(marks.option, interfaceOption).replace(
                     marks.image, interfaceImage).replace(marks.score,
                     interfaceScore);
         */
         
         console.log('HealthDM.interfaceKnot("' + knotTemplate + '","'
               + pageName + '","' + knotBlocks[kb].trim() + '","""'
               + pageContent + '""","' + knotImage + '")');
         
         notebookCell.notebook.kernel.execute('HealthDM.interfaceKnot("'
               + knotTemplate + '","' + pageName + '","'
               + knotBlocks[kb].trim() + '","""' + pageContent + '""","'
               + knotImage + '")');
      }
   };
   
   // Extends the markdown rendering to support narrative authoring
   var renderMarkdown = function(mdhtml) {
      var mdtext = mdhtml.innerHTML;

      var markFs = {
            knot   : markKnot,
            option : markOption,
            divert : markDivert,
            character : markCharacter,
            image  : markImage,
            input  : markInput,
            domain : markDomain,
            score  : markScore
      };

      // indexing knots
      let knotCtx = null;
      let knotHeads = mdtext.match(marks.knot);
      for (kh in knotHeads) {
         var label = knotHeads[kh]
               .match(/==*[ \t]*(\w[\w \t]*)(?:\([\w \t]*\))?[ \t]*=*/i);
         label = label[1].trim();
         if (knotHeads[kh].indexOf("==") >= 0)
            knotCtx = label;
         else
            label = (label.indexOf(".") < 0 && knotCtx == null) ? label
                  : knotCtx + "." + label;
         knots.push(label);
      }

      // replacing Ink marks
      var mdfocus = mdtext;
      var mdresult = "";

      var matchStart;
      do {
         matchStart = -1;
         var selected = "";
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
            mdresult += toReplace.replace(marks[selected],
                  markFs[selected]);
            if (matchStart + matchSize >= mdfocus.length)
               matchStart = -1;
            else
               mdfocus = mdfocus.substring(matchStart + matchSize);
         }
      } while (matchStart > -1);

      mdresult += mdfocus;

      mdhtml.innerHTML = mdresult;
   };

   var interfaceInput = function(_matchStr, insideRows, insideVariable,
         insideVocabulary) {
      var variable = insideVariable.trim().replace(/ /igm, "_");

      var rows = (insideRows == null) ? 0 : parseInt(insideRows);

      return ((rows > 0) ? "<textarea style='width:100%' rows=" + rows
            : "<input type='text'")
            + " class='userInput' id='"
            + variable
            + "' oninput=\"followInput('"
            + variable
            + "','"
            + insideVocabulary.trim()
            + "')\" "
            + "' onchange=\"evaluateInput('"
            + variable
            + "','"
            + insideVocabulary.trim()
            + "')\">"
            + ((rows > 0) ? "</textarea>" : "</input>")
            + "<span id='" + variable + "_result'></span>";
   };

   var interfaceDomain = function(matchStr, _insideDescription,
         _insideDetail1, _insideRate1, _insideHeading, _insideDetail2,
         _insideRate2) {
      let content = matchStr.match(/\{([ \t\w=\:\-=%\/"]*)\}/i)[1];
      
      if (knotTemplate == "selector")
         content = "<dcc-state-selector>" + content + "</dcc-state-selector>"; 
      
      return content;
   };

   var interfaceOption = function(_matchStr, insideText, insideDivert) {
      let display = (insideText != null) ? insideText.trim() : insideDivert.trim();
      let link = (insideDivert != null) ? insideDivert : insideText;
      link = link.trim().replace(/ /igm, "_");
      
      let linkImage = "";
      if (display.endsWith("(control)")) {
         display = display.replace("(control)", "").trim();
         linkImage = " image='images/" + display.toLowerCase().replace(/ /igm, "-") + ".svg' location='control-panel'";
      }

      return "<dcc-link link='" + link + ".html' label='" + display + "'" + linkImage + "></dcc-link>"; 
      /*
      return "<p class='case_link'><a href='" + link
            + ".html' onclick=\"computeLink('" + link + "')\">" + display
            + "</a></p>";
      */
   };

   var interfaceDivert = function(_matchStr, inside) {
      let display = inside.trim();
      let link = display.trim().replace(/ /igm, "_");
      
      return "<dcc-link link='" + link + ".html' label='" + display.trim() + "'></dcc-link>";
      /*
      return "<span class='case_link'><a href='" + link
             + ".html' onclick=\"computeLink('" + link + "')\">" + display
             + "</a></span>";
      */
   };

   var interfaceImage = function(matchStr, insideSrc, _insideAlt) {
      if (knotImage === "")
         knotImage = insideSrc;

      return matchStr.replace(">", " style='float:left'>");
   };

   var interfaceScore = function(_matchStr, insideSymbol, insideValue,
         insideVariable) {
      var symbol = (insideSymbol == null || insideSymbol.trim().length == 0) ? "="
            : insideSymbol.trim();

      var output = "";

      if (symbol == "%")
         output = "<p class='case_text' id='var-" + insideVariable.trim()
               + "'></p><script>showScore('" + insideVariable.trim()
               + "')</script>";
      else
         output = "<script>computeScore('" + symbol + "', '"
               + insideVariable.trim() + "', '" + insideValue.trim()
               + "')</script>";

      return output;
   };

   var markKnot = function(matchStr, insideText, _insideTemplate) {
      console.log("*** mark knot");
      var label = insideText.trim();

      var display = matchStr
            .match(/==*[ \t]*(\w[\w \t]*)(?:\(([\w \t]*)\))?[ \t]*=*/ig);

      if (matchStr.indexOf("==") >= 0)
         knotContext = label;
      else
         label = (label.indexOf(".") < 0 && knotContext == null) ? label
               : knotContext + "." + label;

      return "<h1><a id='knot_" + label
            + "'><span style='font-style:italic'>" + display
            + "</span></a></h1>";
   };

   var markOption = function(_matchStr, insideText, insideDivert) {
      var display = (insideText != null) ? insideText : insideDivert;
      var label = (insideDivert != null) ? insideDivert.trim()
            : insideText.trim();
      var newLabel = divertResolver(label);
      display = (newLabel != null) ? display : display + "-> ?" + label
            + "?";
      link = "#knot_" + ((newLabel != null) ? newLabel : label);

      return "<ul><li><a href='" + link
            + "'><span style='font-weight:bold'>" + display
            + "</span></a></li></ul>";
   };

   var markDivert = function(_matchStr, inside) {
      var label = inside.trim();
      var newLabel = divertResolver(label);

      var display = (newLabel != null) ? inside : "?" + label + "?";
      var link = (newLabel != null) ? newLabel : label;

      return "<a href='#knot_" + link
            + "'><span style='font-weight:bold'>" + display
            + "</span></a>";
   };

   var divertResolver = function(label) {
      var newLabel = null;

      if (knots.indexOf(label) >= 0)
         newLabel = label;
      else if (knotContext != null
            && knots.indexOf(knotContext + "." + label) >= 0)
         newLabel = knotContext + "." + label;

      return newLabel;
   };

   var markCharacter = function(matchStr, _inside) {
      var display = matchStr.replace(/: *([\w]+ *:)/igm,
            "<span style='font-weight:bold'>$1</span>");

      return display;
   };

   var markImage = function(matchStr, _inside1, _inside2) {
      return matchStr
            .replace(">",
                  " style='float:left' width='300px'><p style='clear:both'></p>");
   };

   var markInput = function(_matchStr, insideRows, _insideVariable,
         _insideVocabulary) {
      // var variable = insideVariable.trim().replace(/ /igm, "_");

      var rows = (insideRows == null) ? 0 : parseInt(insideRows);

      return ((rows > 0) ? "<textarea style='width:100%' rows=" + rows
            + "></textarea>" : "<input type='text'></input>");
   }

   var markScore = function(matchStr, _insideSymbol, _insideValue,
         _insideVariable) {
      return "<p>" + matchStr + "</p>";
   };

   var meshBack = function(meshResult) {
      // alert("MeSH back: " + meshResult.content.data["text/plain"]);

      var regexR = /u?'#mesh_heading#([\w\s]*)#tree_number#([\w\:\/\.]*)'/igm;

      if (meshResult.msg_type == "execute_result") {
         var result = meshResult.content.data["text/plain"];
         var heading = result.replace(regexR, "$1");
         var code = result.replace(regexR, "$2");

         var regexA = new RegExp("#mesh_addr#" + heading + "#", "igm");
         mdtext = mdhtml.innerHTML
               .replace(regexA,
                     "https://meshb-prev.nlm.nih.gov/record/ui?name="
                           + heading);
         var regexT = new RegExp("#tree_number#" + heading + "#", "igm");
         mdhtml.innerHTML = mdtext.replace(regexT, code);
      } else if (meshResult.msg_type == "error")
         console.log("Sparql error: " + meshResult.content.evalue);
      else
         console.log("Unknown message return type: "
               + meshResult.msg_type);
   };

   var markDomain = function(_matchStr, insideDescription, insideDetail1,
         insideRate1, insideHeading, insideDetail2, insideRate2) {
      var description = insideDescription.trim();
      var detail1 = (insideDetail1 != null) ? insideDetail1.trim() : "#";
      var rate1 = (insideRate1 != null) ? insideRate1.trim() : "#";
      var heading = (insideHeading != null) ? insideHeading.trim()
            : description;
      var detail2 = (insideDetail2 != null) ? insideDetail2.trim() : "#";
      var rate2 = (insideRate2 != null) ? insideRate2.trim() : "#";

      notebookCell.notebook.kernel.execute("HealthDM.findMeshCode('"
            + heading + "','" + detail1 + "','" + rate1 + "','"
            + description + "','" + detail2 + "','" + rate2 + "')", {
         iopub : {
            output : meshBack
         }
      }, {
         silent : false,
         store_history : false,
         stop_on_error : false
      });

      return "<a href='#mesh_addr#" + heading + "#' title='#tree_number#"
            + heading + "#' target='_blank'>" + description + "</a>";
   };

   var load_ipython_extension = function() {
      events.on("rendered.MarkdownCell", function(_event, data) {
         render_cell(data.cell);
      });
   };

   return {
      load_ipython_extension : load_ipython_extension
   };
});
