/**
 * 
 */
class Translator {

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

      const interfaceFs = {
            // knot   : translateKnot,
            option : this.translateOption,
            divert : this.translateDivert,
            talk   : this.translateTalk,
            image  : this.translateImage,
            input  : this.translateInput,
            domain : this.translateDomain,
            score  : this.translateScore
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
         /*
         var pageContent = knotsMD[kb + 2].replace(marks.input,
               translateInput).replace(marks.domain, translateDomain)
               .replace(marks.option, translateOption).replace(
                     marks.image, translateImage).replace(marks.score,
                     translateScore);
         */
         
         console.log('HealthDM.interfaceKnot("' + knotTemplate + '","'
               + pageName + '","' + knotsMD[kb].trim() + '","""'
               + pageContent + '""","' + knotImage + '")');
         
         notebookCell.notebook.kernel.execute('HealthDM.interfaceKnot("'
               + knotTemplate + '","' + pageName + '","'
               + knotsMD[kb].trim() + '","""' + pageContent + '""","'
               + knotImage + '")');
      }
   }
   
   translateInput(_matchStr, insideRows, insideVariable,
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
   }

   translateDomain(matchStr, _insideDescription,
         _insideDetail1, _insideRate1, _insideHeading, _insideDetail2,
         _insideRate2) {
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
         input  : /\{[ \t]*\?(\d+)?([\w \t]*)(?:\:([\w \t%]*))?\}/igm,
         domain : /\{([\w \t\-"]*)(?:[=\:]([\w \t%]*)(?:\/([\w \t%]*))?)?\}(?:\(([\w \t\+\-=\*]*)(?:[=\:]([\w \t%]*)(?:\/([\w \t%]*))?)?\))?/igm,
         score  : /^(?:<p>)?[ \t]*~[ \t]*([\+\-=\*\\%]?)[ \t]*(\w*)?[ \t]*(\w+)[ \t]*(?:<\/p>)?/igm
   };
})();