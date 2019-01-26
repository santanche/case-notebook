/**
 * 
 */
class Translator {

   // Index all knots to guide references
   indexKnots(markdown) {
      let knots = [];
      let knotCtx = null;
      let knotHeads = mdtext.match(this.marks.knot);
      for (var kh in knotHeads) {
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
      return knots;
   }
   
   compileMarkdown(markdown) {
      let knots = indexKnots(markdown);
      
      const mdToObj = {
            // knot   : translateKnot,
            // option : this.translateOption,
            // divert : this.translateDivert,
            // talk   : this.translateTalk,
            // image  : this.translateImage,
            input  : this.translateInput,
            // domain : this.translateDomain,
            // score  : this.translateScore
      };
      
      let mdfocus = mdtext;
      let compiledCase = {};
      
      let current = 0;
      let matchStart;
      do {
         matchStart = -1;
         let selected = "";
         for (let mk in marks) {
            let pos = mdfocus.search(marks[mk]);
            if (pos > -1 && (matchStart == -1 || pos < matchStart)) {
               selected = mk;
               matchStart = pos;
            }
         }

         if (matchStart > -1) {
            let inter = matchStart - current;
            
            
            let matchSize = mdfocus.match(marks[selected])[0].length;
            let toReplace = mdfocus.substring(0, matchStart + matchSize);
            mdresult += toReplace.replace(marks[selected],
                                          markFs[selected]);
            if (matchStart + matchSize >= mdfocus.length)
               matchStart = -1;
            else
               mdfocus = mdfocus.substring(matchStart + matchSize);
         }
      } while (matchStart > -1);

      mdresult += mdfocus;
   }
   
   textMdToObj(markdown) {
      return {
         type: "text",
         content: markdown
      };
   }
   
   /*
    * Input Md to Obj
    * Input: {?[rows]: [vocabulary]}
    * Regular expression: \{[ \t]*\?(\d+)?([\w \t]*)(?:\:([\w \t]*))?\}
    * Output: {
    *   variable: <variable that will receive the input>
    *   rows: <number of rows for the input>
    *   vocabulary: <the vocabulary set to match the input>
    * }
    */
   inputMdToObj(insideRows, insideVariable, insideVocabulary) {
      return {
         variable: insideVariable.trim().replace(/ /igm, "_"),
         rows: (insideRows == null) ? 0 : parseInt(insideRows),
         vocabulary: insideVocabulary.trim()
      };
   }
   
   // Transforms the markdown to HTML
   generateInterface(markdown) {
      let knotsMD = mdinterface.split(Translator.marks.knot);
      let knotsHTML = [];

      // capturing title, description and image of the starting knot
      let caseTitle = knotsMD[1].trim();
      let caseDescription = "";
      let caseImage = "";
      if (knotsMD[3] != null && knotsMD[3].trim().length > 0) {
         caseDescription = knotsMD[3].replace(marks.option, "")
               .replace(marks.image, ""); // marks - option/image
         var imageStr = knotsMD[3].match(marks.image);
         caseImage = (imageStr == null) ? "" : imageStr[0].replace(">",
               " style='width:100px'>"); // marks - image
      }

      notebookCell.notebook.kernel
            .execute('HealthDM.interfaceMain("' + caseTitle + '","""'
                  + caseDescription + '""","""' + caseImage + '""","'
                  + caseTitle.replace(/ /igm, "_") + '")');


      const objToHTML = {
            // knot   : translateKnot,
            // option : this.translateOption,
            // divert : this.translateDivert,
            // talk   : this.translateTalk,
            // image  : this.translateImage,
            input  : this.translateInput,
            // domain : this.translateDomain,
            // score  : this.translateScore
      };
      
      for (var kb = 1; kb < knotsMD.length; kb += 3) {
         let pageName = knotsMD[kb].trim().replace(/ /igm, "_");
         knotTemplate = (knotsMD[kb + 1] == null) ? "knot"
                          : knotsMD[kb + 1].trim().replace(" ", "_");
         knotImage = "";
         
         // converting case-markdown in HTML
         let pageContent = knotsMD[kb + 2];
         for (var mk in interfaceFs)
            pageContent = pageContent.replace(marks[mk], interfaceFs[mk]);
         
         console.log('HealthDM.interfaceKnot("' + knotTemplate + '","'
               + pageName + '","' + knotsMD[kb].trim() + '","""'
               + pageContent + '""","' + knotImage + '")');
         
         notebookCell.notebook.kernel.execute('HealthDM.interfaceKnot("'
               + knotTemplate + '","' + pageName + '","'
               + knotsMD[kb].trim() + '","""' + pageContent + '""","'
               + knotImage + '")');
      }
   }
   
   translateInput(_matchStr, insideRows, insideVariable, insideVocabulary) {
      return inputObjToHTML(inputMdToObj(insideRows, insideVariable, insideVocabulary));
   }
   
   /*
    * Input Obj to HTML
    * Output: <[input-type] [input-parameters] class='userInput' id='[variable]'
               oninput="followInput('[variable]','[vocabulary]')">
              </[input-type]>
              <span id='[variable]_result'></span>
    */
   inputObjToHTML(inputObj) {
      let inputType = ((inputObj.rows > 1) ? "textarea" : "input");
      let inputParam = ((inputObj.rows > 1) ? "style='width:100%' rows=" + rows
                                            : "type='text'");
      
      return this.marksHTML.replace(/\[input-type\]/igm, inputType)
                           .replace("[input-parameters]", inputParam)
                           .replace(/\[variable\]/igm, inputObject.variable)
                           .replace("[vocabulary", inputObject.vocabulary);
   }

   /*
    * Domain Md to Obj
    * Input: {[expression] =|: [specification] / [rate]}([formal] =|: [specification] / [rate])
    * Regular expression: \{([\w \t\-"]*)(?:[=\:]([\w \t%]*)(?:\/([\w \t%]*))?)?\}(?:\(([\w \t\+\-=\*]*)(?:[=\:]([\w \t%]*)(?:\/([\w \t%]*))?)?\))?
    * Output: {
    *   expression: <expression in the text to be evaluated
    *   specification: specify the expession defining, for example, a measurable value, rate or origin.
    *   rate:  
    *   
    *   variable: <variable that will receive the input>
    *   rows: <number of rows for the input>
    *   vocabulary: <the vocabulary set to match the input>
    * }
    */
   domainMdToObj(matchStr, insideDescription,
                 insideSpecification1, insideRate1,
                 insideHeading, insideSpecification2, insideRate2) {
      let 
      
      return {
         description: insideDescription.trim(),
         specification1: (insideSpecification1 != null) ? insideSpecification1.trim() : "#",
         var rate1 = (insideRate1 != null) ? insideRate1.trim() : "#";
         var heading = (insideHeading != null) ? insideHeading.trim()
               : description;
         var detail2 = (insideDetail2 != null) ? insideDetail2.trim() : "#";
         var rate2 = (insideRate2 != null) ? insideRate2.trim() : "#";
      };
      

      
      let content = matchStr.match(/\{([ \t\w=\:\-=%\/"]*)\}/i)[1];
      
      if (knotTemplate == "selector")
         content = "<dcc-state-selector>" + content + "</dcc-state-selector>"; 
      
      return content;
   }

   translateOption(_matchStr, insideText, insideDivert) {
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
   }

   translateDivert(_matchStr, inside) {
      let display = inside.trim();
      let link = display.trim().replace(/ /igm, "_");
      
      return "<dcc-link link='" + link + ".html' label='" + display.trim() + "'></dcc-link>";
      /*
      return "<span class='case_link'><a href='" + link
             + ".html' onclick=\"computeLink('" + link + "')\">" + display
             + "</a></span>";
      */
   }
   
   translateTalk(matchStr, character, talk) {
      let output = matchStr;
      if (knotTemplate == "dialog") {
         let fileName = character.trim().toLowerCase().replace(/ /igm, "_");
         output = "<dcc-lively-talk " + 
                  "character='images/" + fileName + ".png' " +
                  "speech='" + talk.trim() + "'></dcc-lively-talk>";
      }
      return output;
   }   

   translateImage(matchStr, insideSrc, _insideAlt) {
      if (knotImage === "")
         knotImage = insideSrc;

      return matchStr.replace(">", " style='float:left'>");
   }

   translateScore(_matchStr, insideSymbol, insideValue,
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
   }

}

(function() {
   Translator.marks = {
         knot   : /^[ \t]*==*[ \t]*(\w[\w \t]*)(?:\(([\w \t]*)\))?[ \t]*=*[ \t]*/igm,
         option : /\+\+[ \t]*([^-&<> \t][^-&<>\n\r\f]*)?(?:-(?:(?:&gt;)|>)[ \t]*(\w[\w. \t]*))?/igm,
         divert : /-(?:(?:&gt;)|>) *(\w[\w. ]*)/igm,
         talk   : /^(?:<p>)?[ \t]*(\w[\w ]*):[ \t]*(\w[\w \t]*)(?:<\/p>)?/igm,
         image  : /<img src="([\w:.\/\?&#\-]+)" (?:alt="([\w ]+)")?>/igm,
         input  : /\{[ \t]*\?(\d+)?([\w \t]*)(?:\:([\w \t]*))?\}/igm,
         domain : /\{([\w \t\-"]*)(?:[=\:]([\w \t%]*)(?:\/([\w \t%]*))?)?\}(?:\(([\w \t\+\-=\*]*)(?:[=\:]([\w \t%]*)(?:\/([\w \t%]*))?)?\))?/igm,
         score  : /^(?:<p>)?[ \t]*~[ \t]*([\+\-=\*\\%]?)[ \t]*(\w*)?[ \t]*(\w+)[ \t]*(?:<\/p>)?/igm
   };
   

})();