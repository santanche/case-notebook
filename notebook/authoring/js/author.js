function startSystem() {
   let dm = new AuthorDM();
}

class AuthorDM {
   constructor() {
      this._translator = new Translator();
      this._compiledCase = null;

      this._knotSelected = null;
      this._htmlTemplate = null;
      this._htmlKnot = null;
      this._renderSlide = true;
      
      // <TODO> Fix this problem - allow assynchronous methods inside the class
      // this._server = new DCCAuthorServer();

      this.actionButton = this.actionButton.bind(this);
      let actionListeners = ["control-load", "control-save", "control-new-knot",
         "control-edit-knot", "control-knot-up", "control-knot-down",
         "control-config"];
      for (var al in actionListeners)
         document.addEventListener(actionListeners[al], this.actionButton);
      
      this.actionKnotSelected = this.actionKnotSelected.bind(this);
      document.addEventListener("knot-selected", this.actionKnotSelected);
   }
   
   actionButton(event) {
      switch (event.type) {
         case "control-load": this.selectCase();
                              break;
         case "control-edit-knot": this.editKnot();
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
      
      casesList(this._selector);
      let knotPanel = document.querySelector("#knot-panel");
      knotPanel.appendChild(this._selector);
   }

   /*
    * ACTION: control-load (2)
    */
   _resourceSelected(event) {
      loadCase(event.detail, this);
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
    * ACTION: knot-selected (1)
    */
   actionKnotSelected(event) {
      this._htmlTemplate = null;
      
      if (this._compiledCase[event.detail]) {
         this._knotSelected = event.detail;
         this._htmlKnot = this._translator.generateHTML(this._compiledCase[this._knotSelected]);
         let template = (this._compiledCase[this._knotSelected].category) ?
                         this._compiledCase[this._knotSelected].category : "knot";
         loadTemplate(template, this);
      }
   }
   
   /*
    * ACTION: knot-selected (2)
    */
   _templateLoaded(templateHTML) {
      this._templateHTML = templateHTML;
      _renderKnot();
      
   }
   
   _renderKnot() {
      if (this._renderSlide) {
         this._htmlKnot = templateHTML
                             .replace("{title}", this._compiledCase[this._knotSelected].title)
                             .replace("{description}", this._htmlKnot);
         
         let knotPanel = document.querySelector("#knot-panel");
         knotPanel.innerHTML = this._htmlKnot;,
      } else {
         let editorSpace = document.createElement("div");
         editorSpace.id = "editor-space";
         knotPanel.appendChild(editorSpace);
         let quill = new Quill('#editor-space', {
            theme: 'snow'
          });
         quill.insertText();
      }
   }
   
   // <TODO> Temporary
   dispatchEvent(event) {
      this._resourceSelected(event);
   }
}

