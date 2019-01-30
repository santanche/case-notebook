(function() {
  
/* State Selector DCC
 ********************/
class DCCStateSelector extends HTMLElement {
   constructor() {
     super();
     
     const template = document.createElement("template");
     template.innerHTML = 
        `<style>
           .state-selector:hover {
             cursor: pointer;
           }
         </style>
         <span id="presentation-dcc" class="state-selector"><slot></slot><span id="presentation-state"></span></span>`;

     this._currentState = 0;
     this._stateVisible = false;
     
     this._shadow = this.attachShadow({mode: "open"});
     this._shadow.appendChild(template.content.cloneNode(true));
     
     this._presentation = this._shadow.querySelector("#presentation-dcc");
     this._presentationState = this._shadow.querySelector("#presentation-state");
     
     // <TODO> limited: considers only one group per page
     this._group = document.querySelector("dcc-group-selector");

     this._showState = this._showState.bind(this);
     this._hideState = this._hideState.bind(this);
     this._changeState = this._changeState.bind(this);
     this._updateStates = this._updateStates.bind(this);
     this._updateColors = this._updateColors.bind(this);
   }
   
   /* Attribute Handling */

   static get observedAttributes() {
     return ["states", "colors"];
   }

   createdCallback() {
     this._updateRendering();
   }

   attributeChangedCallback(name, oldValue, newValue) {
     this._updateRendering();
   }
   
   connectedCallback() {
      this._presentation.addEventListener("mouseover", this._showState);
      this._presentation.addEventListener("mouseout", this._hideState);
      this._presentation.addEventListener("click", this._changeState);
      
      this.addEventListener("update-states-event", this._updateStates);
      this.addEventListener("update-colors-event", this._updateColors);
      
      if (this._group != null) {
         if (!this.hasAttribute("states")) {
            let eventStates = new CustomEvent("request-states-event", {detail: this});
            this._group.dispatchEvent(eventStates);
         }
         if (!this.hasAttribute("colors")) {
            let eventColors = new CustomEvent("request-colors-event", {detail: this});
            this._group.dispatchEvent(eventColors);
         }
      }

      this._updateRendering();
   }
   
   disconnectedCallback() {
      this._presentation.removeEventListener('mouseover', this._showState);
      this._presentation.removeEventListener('mouseout', this._hideState);
      this._presentation.removeEventListener('click', this._changeState);
      
      this.removeEventListener('update-states-event', this._updateStates);
      this.removeEventListener('update-colors-event', this._updateColors);
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

   _updateRendering() {
     if (this._presentation != null) {
       if (this._presentationState != null) {
          if (this._stateVisible && this.states != null) {
             const statesArr = this.states.split(",");
             this._presentationState.innerHTML = "[" + statesArr[this._currentState] + "]";
          } else
             this._presentationState.innerHTML = "";
       }
       if (this.colors != null) {
         const colorsArr = this.colors.split(",");
         this._presentation.style.backgroundColor = colorsArr[this._currentState];
       }
     }
   }
   
   /* Event handling */
   
   _showState() {
     this._stateVisible = true;
     this._updateRendering();
   }
   
   _hideState() {
     this._stateVisible = false;
     this._updateRendering();
   }
   
   _changeState() {
     if (this.states != null) {
       const statesArr = this.states.split(",");
       this._currentState = (this._currentState + 1) % statesArr.length;
     }
     this._updateRendering();
   }
   
   /* Container DCC events */

   _updateStates(event) {
     this.states = event.detail;
   }

   _updateColors(event) {
     this.colors = event.detail;
   }
}

/* Group Selector DCC
 ********************/
class DCCGroupSelector extends HTMLElement {
   constructor() {
     super();
     this._sendStates = this._sendStates.bind(this);
     this._sendColors = this._sendColors.bind(this);
   }
   
   /* Attribute Handling */

   static get observedAttributes() {
    return ["states", "colors"];
   }

   connectedCallback() {
      this.addEventListener("request-states-event", this._sendStates);
      this.addEventListener("request-colors-event", this._sendColors);
   }

   disconnectedCallback() {
      this.removeEventListener("request-states-event", this._sendStates);
      this.removeEventListener("request-colors-event", this._sendColors);
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

customElements.define("dcc-state-selector", DCCStateSelector);
customElements.define("dcc-group-selector", DCCGroupSelector);

})();