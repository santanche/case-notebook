/**
 * 
 */
class Translator {

   // Index all knots to guide references
   indexKnots(markdown) {
      let knots = [];
      let knotCtx = null;
      let knotHeads = markdown.match(Translator.marks.knot);
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
   
   // Compiles a markdown text to an object representation 
   compileMarkdown(markdown) {
      let knots = this.indexKnots(markdown);
      
      const mdToObj = {
            knot   : this.knotMdToObj,
            option : this.optionMdToObj,
            divert : this.divertMdToObj,
            talk   : this.talkMdToObj,
            // image  : this.image,
            input  : this.inputMdToObj,
            selector: this.selectorMdToObj,
            domain : this.domainMdToObj
            // score  : this.translateScore
      };
      
      let mdfocus = markdown;
      let compiledCase = [];
      let compiledKnot = compiledCase;
      
      this.currentKnot = null;
      this.currentCategory = null;
      
      let matchStart;
      do {
         // look for the next nearest expression match
         matchStart = -1;
         let selected = "";
         for (let mk in Translator.marks) {
            let pos = mdfocus.search(Translator.marks[mk]);
            if (pos > -1 && (matchStart == -1 || pos < matchStart)) {
               selected = mk;
               matchStart = pos;
            }
         }

         if (matchStart > -1) {
            // add a segment that does not match to any expression
            if (matchStart > 0)
               compiledKnot.push(this.textMdToObj(mdfocus.substring(0, matchStart)));
            
            // translate the expression to an object
            let matchSize = mdfocus.match(Translator.marks[selected])[0].length;
            let toTranslate = mdfocus.substr(matchStart, matchSize);
            let transObj = mdToObj[selected](Translator.marks[selected].exec(toTranslate));
            
            if (selected == "knot") {
               compiledCase.push(transObj);
               compiledKnot = [];
               transObj.content = compiledKnot;
               this.currentKnot = transObj.title;
               this.currentCategory = (transObj.category) ? transObj.category : null;
            } else
               compiledKnot.push(transObj);
            
            if (matchStart + matchSize >= mdfocus.length)
               matchStart = -1;
            else
               mdfocus = mdfocus.substring(matchStart + matchSize);
         }
      } while (matchStart > -1);
      if (mdfocus.length > 0)
         compiledKnot.push(this.textMdToObj(mdfocus));
      
      return compiledCase;
   }
   
   /*
    * Knot Md to Obj
    * Input: == [title] ([category]) ==
    * Output:
    * {
    *    type: "knot"
    *    title: <title of the knot> #1
    *    category: <knot category>  #2
    * }
    */
   knotMdToObj(matchArray) {
      let knot = {
         type: "knot",
         title: matchArray[1].trim()
      };
      
      if (matchArray[2] != null)
         knot.category = matchArray[2].trim();
         
      return knot;
   }
   
   /*
    * Text Md to Obj
    * Output:
    * {
    *    type: "text"
    *    content: <unprocessed content in markdown>
    * }
    */
   textMdToObj(markdown) {
      return {
         type: "text",
         content: markdown
      };
   }
   
   /*
    * Option Md to Obj
    * Input: ++ [label] -> [target]
    * Output:
    * {
    *    type: "option"
    *    label: <label to be displayed -- if there is not an explicit divert, the label is the divert> #1
    *    target: <target node to divert> #2
    * }
    */
   optionMdToObj(matchArray) {
      let option = {
         type: "option"
      };
      
      if (matchArray[1] != null)
         option.label = matchArray[1].trim();
      if (matchArray[2] != null)
         option.target = matchArray[2].trim();
      
      return option;
   }
   
   /*
    * Divert Md to Obj
    * Input: -> [target]
    * Output:
    * {
    *    type: "divert"
    *    target: <target node to divert> #1
    * }
    */
   divertMdToObj(matchArray) {
      return {
         type: "divert",
         target: matchArray[1].trim()
      };
   }

   /*
    * Talk Md to Obj
    * Input: :[character]: [talk]
    * Output:
    * {
    *    type: "talk"
    *    character: <identification of the character> #1
    *    talk: <character's talk> #2
     * }
    */
   talkMdToObj(matchArray) {
      return {
         type: "talk",
         character: matchArray[1].trim(),
         talk: matchArray[2].trim()
      };
   }   
   
   /*
    * Input Md to Obj
    * Input: {?[rows] [variable]: [vocabulary]}
    * Output:
    * {
    *    type: "input"
    *    variable: <variable that will receive the input> #2
    *    rows: <number of rows for the input> #1
    *    vocabulary: <the vocabulary to interpret the input> #3
    * }
    */
   inputMdToObj(matchArray) {
      let input = {
             type: "input",
             variable: matchArray[2].trim().replace(/ /igm, "_")
      };
      
      if (matchArray[1] == null)
         input.rows = parseInt(insideRows);
      
      if (matchArray[3] != null)
         input.vocabulary = matchArray[3].trim();
            
      return input;
   }
   
   /*
    * Input Obj to HTML
    * Output: <[input-type] [input-parameters] class='userInput' id='[variable]'
               oninput="followInput('[variable]','[vocabulary]')">
              </[input-type]>
              <span id='[variable]_result'></span>
    */
   /*
   inputObjToHTML(inputObj) {
      let inputType = ((inputObj.rows > 1) ? "textarea" : "input");
      let inputParam = ((inputObj.rows > 1) ? "style='width:100%' rows=" + rows
                                            : "type='text'");
      
      return this.marksHTML.replace(/\[input-type\]/igm, inputType)
                           .replace("[input-parameters]", inputParam)
                           .replace(/\[variable\]/igm, inputObject.variable)
                           .replace("[vocabulary", inputObject.vocabulary);
   }
   */

   /*
    * Domain Md to Obj
    * Input: {[expression] =|: [specification] / [rate]}([formal_expression] =|: [formal_specification] / [formal_rate])
    * Regular expression: \{([\w \t\-"]*)(?:[=\:]([\w \t%]*)(?:\/([\w \t%]*))?)?\}(?:\(([\w \t\+\-=\*]*)(?:[=\:]([\w \t%]*)(?:\/([\w \t%]*))?)?\))?
    * Output: {
    *    type: "domain"
    *    expression: <expression in the text to be evaluated> #1
    *    specification: <specify the expression defining, for example, a measurable value, rate or origin> #2
    *    rate: <compose the rate of the specification> #3
    *    formalExpression: <expression written in formal way to be recognized against a dictionary> #4
    *    formalSpecification: <formal specification> #5
    *    formalRate: <formal rate> #6
    * }
    */
   domainMdToObj(matchArray) {
      let domain = {
             type: "domain",
             expression: matchArray[1].trim()
      };
      
      if (matchArray[2] != null)
         domain.specification = matchArray[2].trim(); 
      if (matchArray[3] != null)
         domain.rate = matchArray[3].trim(); 
      if (matchArray[4] != null)
         domain.formalExpression = matchArray[4].trim(); 
      if (matchArray[5] != null)
         domain.formalSpecification = matchArray[5].trim(); 
      if (matchArray[6] != null)
         domain.formalRate = matchArray[6].trim(); 
     
      return domain;
   }

   /*
    * Selector Md to Obj
    * Input: {[expression]}/[value]
    * Output:
    * {
    *    type: "selector"
    *    expression: <expression to be evaluated> #1
    *    value: <right evaluation of the expression> #2
    * }
    */
   selectorMdToObj(matchArray) {
      return {
         type: "selector",
         expression: matchArray[1].trim(),
         value: matchArray[2].trim()
      };            
   }
   
   /*

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
   */
   
   // Transforms the markdown to HTML
   /*
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
   */
}

(function() {
   Translator.marks = {
         knot   : /^[ \t]*==*[ \t]*(\w[\w \t]*)(?:\(([\w \t]*)\))?[ \t]*=*[ \t]*[\f\n\r]/igm,
         option : /[ \t]\+\+[ \t]*([^-&<> \t][^-&<>\n\r\f]*)?(?:-(?:(?:&gt;)|>)[ \t]*(\w[\w. \t]*))?[\f\n\r]/igm,
         divert : /-(?:(?:&gt;)|>) *(\w[\w. ]*)/igm,
         talk   : /^[ \t]*: *(\w[\w ]*):[ \t]*([^\n\r\f]+)[\n\r\f]*/igm,
         // image  : /<img src="([\w:.\/\?&#\-]+)" (?:alt="([\w ]+)")?>/igm,
         input  : /\{[ \t]*\?(\d+)?([\w \t]*)(?:\:([\w \t]*))?\}/igm,
         selector: /\{([\w \t\-"]+)\}\/([\w\+\-\*=\:]+)/igm,
         domain : /\{([\w \t\-"]+)(?:[=\:]([\w \t%]*)(?:\/([\w \t%]*))?)?\}(?:\(([\w \t\+\-\*]*)(?:[=\:]([\w \t%]*)(?:\/([\w \t%]*))?)?\))?(?!\/)/igm
         // score  : /^(?:<p>)?[ \t]*~[ \t]*([\+\-=\*\\%]?)[ \t]*(\w*)?[ \t]*(\w+)[ \t]*(?:<\/p>)?/igm
   };
   

})();