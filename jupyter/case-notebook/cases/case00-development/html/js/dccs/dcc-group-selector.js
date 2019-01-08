/* Group Selector DCC
   *********************/
(function() {

class DCCGroupSelector extends HTMLElement {
  constructor() {
    super();
    // this._children = this._shadow.querySelectorAll("dcc-state-selector");
    
    this._sendStates = this._sendStates.bind(this);
    this._sendColors = this._sendColors.bind(this);
  }
  
  /* Attribute Handling */

  static get observedAttributes() {
   return ["states", "colors"];
  }

  createdCallback() {
    // this._fireEvents();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // this._fireEvents();
  }
  
  connectedCallback() {
     this.addEventListener("request-states-event", this._sendStates);
     this.addEventListener("request-colors-event", this._sendColors);
  }

  get states() {
    return this.getAttribute("states");
  }

   set states(newStates) {
    this.setAttribute("states", newStates);
  }

  get colors() {
    return this.getAttribute("colors");
  }

   set colors(newColors) {
    this.setAttribute("colors", newColors);
  }
  
  /* Rendering */

  _sendStates(event) {
      let eventStates = new CustomEvent("update-states-event", {detail: this.states});
      event.detail.dispatchEvent(eventStates);
  }
      
  _sendColors(event) {
     let eventColors = new CustomEvent("update-colors-event", {detail: this.colors});
     event.detail.dispatchEvent(eventColors);
  }
}

customElements.define("dcc-group-selector", DCCGroupSelector);
})();