function startSystem() {
   let dm = new AuthorDM();
}

class AuthorDM {
   constructor() {
      // this._server = new DCCAuthorServer();

      let listeners = ["control-load", "control-save", "control-new-knot",
         "control-edit-knot", "control-knot-up", "control-knot-down",
         "control-config"];
      this.actionButton = this.actionButton.bind(this);
      for (var l in listeners)
         document.addEventListener(listeners[l], this.actionButton);
   }
   
   actionButton(event) {
      if (event.type == "control-load")
         this.selectCase();
   }
   
   _resourceSelected() {
      
   }
   
   selectCase() {
      let selector = new DCCResourceSelector();
      selector.preview = false;
      this._resourceSelected = this._resourceSelected.bind(this);
      document.addEventListener("resource-selected", this._resourceSelected);
      selector.addSelectionListener(this);
      // selector.addSelectList(this._server.casesList());
      
      let cl = casesList(selector);
      // console.log(cl);
      // selector.addSelectList(cl);
      let knotPanel = document.querySelector("#knot-panel");
      knotPanel.appendChild(selector);
   }
}

