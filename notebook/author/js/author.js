function startSystem() {
   let dm = new AuthorManager();
}

class AuthorManager {
   constructor() {
      this._translator = new Translator();
      this._compiledCase = null;
      
      this._server = new DCCNotebookServer();
      
      this._currentCaseName = null;
      this._knotSelected = null;
      this._htmlTemplate = null;
      this._htmlKnot = null;
      this._renderSlide = true;
      this._editor = null;
      
      // <TODO> Fix this problem - allow asynchronous methods inside the class
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
   async selectCase() {
      this._resPicker = new DCCResourcePicker();
      this._resourceSelected = this._resourceSelected.bind(this);
      document.addEventListener("resource-selected", this._resourceSelected);
      this._resPicker.addSelectionListener(this);
      
      const cases = await this._server.casesList(this._resPicker);
      this._resPicker.addSelectList(cases);
      let knotPanel = document.querySelector("#knot-panel");
      knotPanel.appendChild(this._resPicker);
   }

   /*
    * ACTION: control-load (2)
    */
   async _resourceSelected(event) {
      this._currentCaseName = event.detail;
      let caseMd = await this._server.loadCase(this._currentCaseName);
      let navigationPanel  = document.querySelector("#navigation-panel");
      let knotPanel = document.querySelector("#knot-panel");
      knotPanel.removeChild(this._resPicker);
      
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
    * ACTION: control-save
    */
   async saveCase() {
      if (this._currentCaseName != null && this._compiledCase != null) {
         let md =this._translator.assembleMarkdown(this._compiledCase);
         const versionFile = await this._server.saveCase(this._currentCaseName, md);
         
         console.log("Case saved! Previous version: " + versionFile);
         document.querySelector("#message-space").innerHTML = "Saved";
         setTimeout(this._clearMessage, 2000);

         let promise = new Promise((resolve, reject) => {
            setTimeout(() => resolve("done!"), 2000);
         });
         let result = await promise;
         document.querySelector("#message-space").innerHTML = "";
      }
   }

   /*
    * ACTION: control-play
    */
   async playCase() {
      await this._server.prepareCaseHTML(this._currentCaseName);
      this._allKnotTitles = Object.keys(this._compiledCase);
      this._knotLoop = -1;
      this._templateSet = {};
      this._templateSet.player = await this._server.loadTemplate("player");
      
      for (let kn in this._compiledCase) {
         let template = (this._compiledCase[kn].category) ?
               this._compiledCase[kn].category : "knot";
         if (!this._templateSet[template])
            this._templateSet[template] = await this._server.loadTemplate(template);
         let htmlName = kn.replace(/ /igm, "_");
         let finalHTML =  this._templateSet.player.replace("{knot}",
            this._templateSet[template].replace("{knot}",
               this._translator.generateKnotHTML(this._compiledCase[kn])));      
         await this._server.saveKnotHTML(this._currentCaseName,
                                         htmlName + ".html", finalHTML);
      }
      
      window.open("../cases/" + this._currentCaseName + "/html/index.html", "_blank");
   }
     
   /*
    * ACTION: knot-selected
    */
   async actionKnotSelected(event) {
      this._htmlTemplate = null;
      
      if (this._compiledCase[event.detail]) {
         this._checkKnotModification();
         this._knotSelected = event.detail;
         this._htmlKnot = this._translator.generateKnotHTML(this._compiledCase[this._knotSelected]);
         let template = (this._compiledCase[this._knotSelected].category) ?
                         this._compiledCase[this._knotSelected].category : "knot";
         
         this._templateHTML = await this._server.loadTemplate(template);
         this._renderKnot();
      }
   }

   _checkKnotModification() {
      if (!this._renderSlide && this._editor != null) {
         let editorText = this._editor.getText();
         editorText = editorText.substring(0, editorText.length - 1);
         if (this._compiledCase[this._knotSelected]._source != editorText)
            this._compiledCase[this._knotSelected]._source = editorText;
      }
   }
   
   _renderKnot() {
      let knotPanel = document.querySelector("#knot-panel");
      
      if (this._renderSlide) {
         document.querySelector("#player-panel").innerHTML = "";
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
         this._editor = new Quill('#editor-space', {
            theme: 'snow'
          });
         this._editor.insertText(0, this._compiledCase[this._knotSelected]._source);
      }
   }
   
   // <TODO> Temporary
   dispatchEvent(event) {
      this._resourceSelected(event);
   }
}