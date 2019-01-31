function startSystem() {
   let dm = new AuthorManager();
}

class AuthorManager {
   constructor() {
      this._translator = new Translator();
      this._compiledCase = null;
      
      this._currentCaseName = null;

      this._knotSelected = null;
      this._htmlTemplate = null;
      this._htmlKnot = null;
      this._renderSlide = true;
      
      // <TODO> Fix this problem - allow assynchronous methods inside the class
      // this._server = new DCCAuthorServer();

      this.actionButton = this.actionButton.bind(this);
      let actionListeners = ["control-load", "control-save", "control-play",
         "control-new-knot", "control-edit-knot", "control-knot-up",
         "control-knot-down", "control-config"];
      for (var al in actionListeners)
         document.addEventListener(actionListeners[al], this.actionButton);
      
      this.actionKnotSelected = this.actionKnotSelected.bind(this);
      document.addEventListener("knot-selected", this.actionKnotSelected);
   }
   
   actionButton(event) {
      console.log("Event: " + event.type);
      switch (event.type) {
         case "control-load": this.selectCase();
                              break;
         case "control-save": this.saveCase();
                              break;
         case "control-edit-knot": this.editKnot();
                                   break;
         case "control-play": this.playCase();
                              break;
      }
   }
   
   /*
    * ACTION: control-load (1)
    */
   selectCase() {
      this._selector = new DCCResourceSelector();
      this._resourceSelected = this._resourceSelected.bind(this);
      document.addEventListener("resource-selected", this._resourceSelected);
      this._selector.addSelectionListener(this);
      
      DCCNS_casesList(this._selector);
      let knotPanel = document.querySelector("#knot-panel");
      knotPanel.appendChild(this._selector);
   }

   /*
    * ACTION: control-load (2)
    */
   _resourceSelected(event) {
      this._currentCaseName = event.detail;
      DCCNS_loadCase(this._currentCaseName, this);
   }
   
   /*
    * ACTION: control-load (3)
    */
   _caseLoaded(caseMd) {
      let navigationPanel  = document.querySelector("#navigation-panel");
      let knotPanel = document.querySelector("#knot-panel");
      knotPanel.removeChild(this._selector);
      
      this._compiledCase = this._translator.compileMarkdown(caseMd);
      
      for (let kn in this._compiledCase) {
         if (this._compiledCase[kn].type == "knot") {
            let miniature = document.createElement("div");
            miniature.classList.add("navigation-knot");
            miniature.classList.add("std-border");
            miniature.innerHTML = "<h2><dcc-trigger action='knot-selected' render='none' " +
                                      "label = '" + this._compiledCase[kn].title + "'>"
                                  "</dcc-trigger></h2>";
            navigationPanel.appendChild(miniature);
         }
            
      }
   }

   /*
    * ACTION: control-edit
    */
   editKnot() {
      if (this._knotSelected != null) {
         this._renderSlide = !this._renderSlide;
         this._renderKnot();
      }
   }
   
   /*
    * ACTION: control-save (1)
    */
   saveCase() {
      if (this._currentCaseName != null && this._compiledCase != null) {
         let md =this._translator.assembleMarkdown(this._compiledCase);
         DCCNS_saveCase(this._currentCaseName, md, this);
      }
   }
   
   /*
    * ACTION: control-save (2)
    */
   _caseSaved(versionFile) {
      console.log("Case saved! Previous version: " + versionFile);
      document.querySelector("#message-space").innerHTML = "Saved";
      setTimeout(this._clearMessage, 2000);
   }

   /*
    * ACTION: control-save (3)
    */
   _clearMessage() {
      document.querySelector("#message-space").innerHTML = "";
   }

   /*
    * ACTION: control-play (1)
    */
   playCase() {
      this._generateHTML();
   }
   
   /*
    * ACTION: control-play (2)
    */
   _generateHTML() {
      DCCNS_prepareCaseHTML(this._currentCaseName, this);
   }
   
   /*
    * ACTION: control-play (3)
    */
   _casePrepared() {
      // this._htmlSet = this._translator.generateCaseHTML(this._compiledCase);
      this._allKnotTitles = Object.keys(this._compiledCase);
      this._knotLoop = -1;
      this._templateSet = {};
      DCCNS_loadTemplate("player", this, 2);
   }

   /*
    * ACTION: control-play (4)
    */
   _knotCheck(fileSaved) {
      if (this._knotLoop >= 0)
         console.log("Saved: " + fileSaved);
      this._knotLoop++;
      if (this._knotLoop < this._allKnotTitles.length) {
         let knotTitle =  this._allKnotTitles[this._knotLoop];        
         let template = (this._compiledCase[knotTitle].category) ?
                        this._compiledCase[knotTitle].category : "knot";
         if (!this._templateSet[template])
            DCCNS_loadTemplate(template, this, 3);
         else
            this._knotSave(template);
      } else
         this._htmlGenerated();
   }
   
   _knotSave(template) {
      let knotTitle = this._allKnotTitles[this._knotLoop];
      let htmlName = knotTitle.replace(/ /igm, "_");
      let finalHTML =  this._templateSet["player"].replace("{knot}",
         this._templateSet[template].replace("{knot}",
            this._translator.generateKnotHTML(this._compiledCase[knotTitle])));      
      DCCNS_saveKnotHTML(this._currentCaseName,
                         htmlName + ".html", finalHTML, this);
   }
   
   /*
    * ACTION: control-play (5)
    */
   _htmlGenerated() {
      this._templateSet = null;
      this._allKnotTitles = null;
      window.open("../cases/" + this._currentCaseName + "/html/index.html", "_blank");
   }   
   
   /*
    * ACTION: knot-selected (1)
    */
   actionKnotSelected(event) {
      this._htmlTemplate = null;
      
      if (this._compiledCase[event.detail]) {
         this._knotSelected = event.detail;
         this._htmlKnot = this._translator.generateKnotHTML(this._compiledCase[this._knotSelected]);
         let template = (this._compiledCase[this._knotSelected].category) ?
                         this._compiledCase[this._knotSelected].category : "knot";
         DCCNS_loadTemplate(template, this, 1);
      }
   }
   
   /*
    * ACTION: knot-selected (2) / control-play (4)
    */
   _templateLoaded(templateName, templateHTML, source) {
      switch (source) {
         case 1: this._templateHTML = templateHTML;
                 this._renderKnot();
                 break;
         case 2: this._templateSet[templateName] = templateHTML;
                 this._knotCheck();
                 break;
         case 3: this._templateSet[templateName] = templateHTML;
                 this._knotSave(templateName);
                 break;
      }
   }
   
   /*
    * ACTION: knot-selected (3)
    */
   _renderKnot() {
      let knotPanel = document.querySelector("#knot-panel");
      if (this._renderSlide) {
         let htmlFinal = this._templateHTML
                             .replace("{title}", this._compiledCase[this._knotSelected].title)
                             .replace("{knot}", this._htmlKnot);
         knotPanel.innerHTML = htmlFinal;
         
         let dccs = document.querySelectorAll("*");
         for (let d = 0; d < dccs.length; d++)
            if (dccs[d].tagName.toLowerCase().startsWith("dcc-lively-talk"))
               dccs[d].editDCC();
      } else {
         knotPanel.innerHTML = "<div id='editor-space'></div>";
         let quill = new Quill('#editor-space', {
            theme: 'snow'
          });
         quill.insertText(0, this._compiledCase[this._knotSelected]._source);
      }
   }
   
   // <TODO> Temporary
   dispatchEvent(event) {
      this._resourceSelected(event);
   }
}

