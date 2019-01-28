function startSystem() {
   let dm = new AuthorDM();
}

class AuthorDM {
   constructor() {
      this._translator = new Translator();
      this._compiledCase = null;
      this._htmlKnot = null;
      this._knotSelected = -1;
      
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
      if (event.type == "control-load")
         this.selectCase();
   }
   
   actionKnotSelected(event) {
      this._knotSelected = -1;
      for (let kn = 0; kn < this._compiledCase.length && this._knotSelected == -1; kn++)
         if (this._compiledCase[kn].title == event.detail)
            this._knotSelected = kn;
      
      let template = (this._compiledCase[this._knotSelected].category) ?
                        this._compiledCase[this._knotSelected].category : "knot";
      loadTemplate(template, this);
   }
   
   _templateLoaded(templateHTML) {
      this._htmlKnot = this._translator.generateHTML(this._compiledCase[this._knotSelected]);
      
      let presentation = templateHTML
                            .replace("{title}", this._compiledCase[this._knotSelected].title)
                            .replace("{description}", this._htmlKnot);
      
      // console.log(this._htmlKnot);
      
      let knotPanel = document.querySelector("#knot-panel");
      knotPanel.innerHTML = presentation;
   }
   
   _resourceSelected(event) {
      loadCase(event.detail, this);
   }
   
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
   
   // <TODO> Temporary
   dispatchEvent(event) {
      this._resourceSelected(event);
   }
   
   selectCase() {
      this._selector = new DCCResourceSelector();
      this._resourceSelected = this._resourceSelected.bind(this);
      document.addEventListener("resource-selected", this._resourceSelected);
      this._selector.addSelectionListener(this);
      
      casesList(this._selector);
      let knotPanel = document.querySelector("#knot-panel");
      knotPanel.appendChild(this._selector);
   }
   

}

