/**
 * Translator of Case Notebooks
 * 
 * Translates case notebook narratives (extension of markdown) to object representations and further to HTML.
 */
class Translator {
   
   constructor() {
      this._markdownTranslator = new showdown.Converter();
      
      this.domainMdToObj = this.domainMdToObj.bind(this);
      this.textObjToHTML = this.textObjToHTML.bind(this);
   }

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
      
      
      this._currentKnot = null;
      this._currentCategory = null;
      this._objSequence = 0;
      
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
            // add a segment that does not match to any expression as type="text"
            if (matchStart > 0)
               compiledKnot.push(this._stampObject(
                  this.textMdToObj(mdfocus.substring(0, matchStart))));
            
            // translate the expression to an object
            let matchSize = mdfocus.match(Translator.marks[selected])[0].length;
            let toTranslate = mdfocus.substr(matchStart, matchSize);
            let transObj = this._stampObject( 
               mdToObj[selected](Translator.marks[selected].exec(toTranslate)));
            
            // attach to a knot array (if it is a knot) or an array inside a knot
            if (selected == "knot") {
               compiledCase.push(transObj);
               compiledKnot = [];
               transObj.content = compiledKnot;
               this._currentKnot = transObj.title;
               this._currentCategory = (transObj.category) ? transObj.category : null;
            } else
               compiledKnot.push(transObj);
            
            if (matchStart + matchSize >= mdfocus.length)
               matchStart = -1;
            else
               mdfocus = mdfocus.substring(matchStart + matchSize);
         }
      } while (matchStart > -1);
      if (mdfocus.length > 0)
         compiledKnot.push(this._stampObject(this.textMdToObj(mdfocus)));
      
      return compiledCase;
   }
   
   /*
    * Produce a sequential stamp to uniquely identify each recognized object
    */
   _stampObject(obj) {
      this._objSequence++;
      obj.seq = this._objSequence;
      return obj;
   }
   
   generateHTML(knotObj) {
      const objToHTML = {
            // knot   : 
            text   : this.textObjToHTML,
            option : this.optionObjToHTML,
            divert : this.divertObjToHTML,
            talk   : this.talkObjToHTML,
            // image  : this.image,
            input  : this.inputObjToHTML,
            selector: this.selectorObjToHTML,
            domain : this.domainObjToHTML
            // score  : this.translateScore
      };

      let preDoc = "";
      if (knotObj != null && knotObj.content != null) {
         // produces a pretext with object slots to process markdown
         for (let kc in knotObj.content)
            preDoc += (knotObj.content[kc].type == "text") 
               ? objToHTML[knotObj.content[kc].type](knotObj.content[kc])
               : "@@" + knotObj.content[kc].seq + "@@";
               
         console.log("===== Pre Doc:");
         console.log(preDoc);
      
         // converts to HTML
         let html = this._markdownTranslator.makeHtml(preDoc);

         console.log("===== Pre HTML:");
         console.log(html);
         
         // replaces the marks
         let current = 0;
         let next = html.indexOf("@@");
         while (next != -1) {
            let end = html.indexOf("@@", next+1);
            let seq = parseInt(html.substring(next+2, end));
            console.log("seq: " + seq);
            while (knotObj.content[current].seq < seq)
               current++;
            if (knotObj.content[current].seq != seq)
               console.log("Error in finding seq.");
            else
               html = html.substring(0, next) +
                      objToHTML[knotObj.content[current].type](knotObj.content[current]) +
                      html.substring(end+2);
            next = html.indexOf("@@");
         }
         
         console.log("===== Pos HTML:");
         console.log(html);
         
         return html;
      }
      
      /*
      if (knotObj != null && knotObj.content != null) {
         for (let kc in knotObj.content)
            final += objToHTML[knotObj.content[kc].type](knotObj.content[kc]);
      }
      */
      
      return final;
   }
   
   /*
    * Knot Md to Obj
    * Input: == [title] ([category]) ==
    * Output:
    * {
    *    type: "knot"
    *    title: <title of the knot> #1
    *    category: <knot category>  #2
    *    content: [<sub-nodes>] - generated in further routines
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
    * Text Obj to HTML
    * Output: [content]
    */
   textObjToHTML(obj) {
      // return this._markdownTranslator.makeHtml(obj.content);
      return obj.content;
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
    * Option Obj to HTML
    * Output:
    *   <dcc-trigger link='[link].html' label='[display]' [image]></dcc-trigger>
    *   [image] -> image='[image-file].svg' location='control-panel'
    */
   optionObjToHTML(obj) {
      let display = (obj.label != null) ? obj.label : obj.target;
      let link = (obj.target != null) ? obj.target : obj.label;
      link = link.replace(/ /igm, "_");
      
      let optionalImage = "";
      if (display.endsWith("(control)")) {
         display = display.replace("(control)", "").trim();
         optionalImage = " image='images/" + display.toLowerCase().replace(/ /igm, "-") + ".svg' location='control-panel'";
      }
      
      return Translator.htmlTemplates.option.replace("[link]", link)
                                            .replace("[display]", display)
                                            .replace("[image]", optionalImage);
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
    * Divert Obj to HTML
    * Output:
    *   <dcc-trigger link='[link].html' label='[display]'></dcc-trigger>
    */
   divertObjToHTML(obj) {
      let link = obj.target.replace(/ /igm, "_");
      
      return Translator.htmlTemplates.divert.replace("[link]", link)
                                            .replace("[display]", obj.target);
   }

   /*
    * Talk Md to Obj
    * Input: :[character]: [talk]
    * Output:
    * {
    *    type: "talk"
    *    character: <identification of the character> #1
    *    speech: <character's speech> #2
     * }
    */
   talkMdToObj(matchArray) {
      return {
         type: "talk",
         character: matchArray[1].trim(),
         speech: matchArray[2].trim()
      };
   }   

   /*
    * Talk Obj to HTML
    * Output:
    * <dcc-lively-talk character='[character]' speech='[speech]'>
    * </dcc-lively-talk>
    */
   talkObjToHTML(obj) {
      let charImg = "images/" + obj.character.toLowerCase()
                                   .replace(/ /igm, "_") + "-icon.png";
      
      
      return Translator.htmlTemplates.talk.replace("[character]", charImg)
                                          .replace("[speech]", obj.speech);
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
    *          oninput="followInput('[variable]','[vocabulary]')">
    *         </[input-type]>
    *         <span id='[variable]_result'></span>
    */
   inputObjToHTML(inputObj) {
      let inputType = ((inputObj.rows > 1) ? "textarea" : "input");
      let inputParam = ((inputObj.rows > 1) ? "style='width:100%' rows=" + rows
                                            : "type='text'");
      
      return Translator.htmlTemplates.input.replace(/\[input-type\]/igm, inputType)
                                           .replace("[input-parameters]", inputParam)
                                           .replace(/\[variable\]/igm, inputObj.variable)
                                           .replace("[vocabulary", inputObj.vocabulary);
   }

   /*
    * Domain Md to Obj
    * Input outside: {[natural]}([formal])
    * Expression outside: \{([\w \t\+\-\*"=\:%\/]+)\}(?:\(([\w \t\+\-\*"=\:%\/]+)\))?(?!\/)
    * Output: {
    *    type: "domain"
    *    natural: {  #1
    *       complete: <complete text in natural language>
    *       expression: <expression in the text to be evaluated>
    *       specification: <specify the expression defining, for example, a measurable value, rate or origin>
    *       rate: <compose the rate of the specification>
    *    }
    *    formal: {   #2
    *       complete: <complete text written in formal way to be recognized against a dictionary>
    *       expression: <expression in the text to be evaluated>
    *       specification: <specify the expression defining, for example, a measurable value, rate or origin>
    *       rate: <compose the rate of the specification>
    *    }
    * }
    */
   domainMdToObj(matchArray) {
      let domain = {
         type: "domain",
         natural: this.domainInsideMdToObj(Translator.marksDomainInside.exec(matchArray[1].trim()))
      };
      
      if (matchArray[2] != null)
         domain.formal = this.domainInsideMdToObj(Translator.marksDomainInside.exec(matchArray[2].trim()));
     
      return domain;
   }
   
   /*
    * Domain Inside Md to Obj
    * Input inside: [expression] =|: [specification] / [rate]
    * Expression inside: ([\w \t\+\-\*"]+)(?:[=\:]([\w \t%]*)(?:\/([\w \t%]*))?)?
    * Output: {
    *    complete: <complete text> #0
    *    expression: <expression in the text to be evaluated> #1
    *    specification: <specify the expression defining, for example, a measurable value, rate or origin> #2
    *    rate: <compose the rate of the specification> #3
    * }
    */
   domainInsideMdToObj(matchArray) {
      let inside = {
         complete: matchArray[0]
      };
      
      if (matchArray[1] != null)
         inside.expression = matchArray[1].trim(); 
      if (matchArray[2] != null)
         inside.specification = matchArray[2].trim(); 
      if (matchArray[3] != null)
         inside.rate = matchArray[3].trim(); 
      
      return inside;
   }

   /*
    * Domain Obj to HTML
    * Output: [natural]
    */
   domainObjToHTML(obj) {
      return Translator.htmlTemplates.domain.replace("[natural]", obj.natural.complete);
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
    * Selector Obj to HTML
    * Output: <dcc-state-selector>[expression]</dcc-state-selector>
    */
   selectorObjToHTML(obj) {
      return Translator.htmlTemplates.selector.replace("[expression]", obj.expression);            
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
      option : /[ \t]*\+\+[ \t]*([^-&<> \t][^-&<>\n\r\f]*)?(?:-(?:(?:&gt;)|>)[ \t]*(\w[\w. \t]*))?[\f\n\r]/im,
      divert : /-(?:(?:&gt;)|>) *(\w[\w. ]*)/im,
      talk   : /^[ \t]*: *(\w[\w ]*):[ \t]*([^\n\r\f]+)[\n\r\f]*/im,
      // image  : /<img src="([\w:.\/\?&#\-]+)" (?:alt="([\w ]+)")?>/im,
      input  : /\{[ \t]*\?(\d+)?([\w \t]*)(?:\:([\w \t]*))?\}/im,
      selector: /\{([\w \t\-\*"=\:%\/]+)\}\/([\w\+\-\*=\:]+)/im,
      domain : /\{([\w \t\+\-\*"=\:%\/]+)\}(?:\(([\w \t\+\-\*"=\:%\/]+)\))?(?!\/)/im
      // score  : /^(?:<p>)?[ \t]*~[ \t]*([\+\-=\*\\%]?)[ \t]*(\w*)?[ \t]*(\w+)[ \t]*(?:<\/p>)?/im
   };
   
   Translator.marksDomainInside = /([\w \t\+\-\*"]+)(?:[=\:]([\w \t%]*)(?:\/([\w \t%]*))?)?/im;
})();