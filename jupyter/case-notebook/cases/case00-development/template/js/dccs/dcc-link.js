/* Link DCC
***********/
(function() {
  
class DCCLink extends HTMLElement {
   constructor() {
     super();

     let templateHTML = 
     `<style>
        .link-button {
          background-color: #383f4f;
          color: #e0e9ce;
          padding: 14px 25px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
        }
        
        .link-button:hover {
          color: white;
        }
        
        .link-image {
          max-width: 100%;
          max-height: 100%;
        }
      </style>
      <span id="presentation-dcc" class="state-selector"></span>`;
     
     const template = document.createElement("template");
     template.innerHTML = templateHTML;
     this._shadow = this.attachShadow({mode: "open"});
     this._shadow.appendChild(template.content.cloneNode(true));
     
     this._presentation = this._shadow.querySelector("#presentation-dcc");
     
     this._monitor = document.querySelector("dcc-monitor");
     
     this._computeLink = this._computeLink.bind(this);
     this._updateLink = this._updateLink.bind(this);
   }
   
   /* Attribute Handling */

   static get observedAttributes() {
     return ["link", "label", "image", "target"];
   }

   createdCallback() {
     this._updateRendering();
   }

   attributeChangedCallback(name, oldValue, newValue) {
     this._updateRendering();
   }
   
   connectedCallback() {
      this._presentation.addEventListener("click", this._computeLink);
      this.addEventListener("update-link-event", this._updateLink);
      
      this._updateRendering();
   }
   
   disconnectedCallback() {
      this._presentation.removeEventListener("click", this._computeLink);
      this.removeEventListener("update-link-event", this._updateLink);
   }

   get link() {
      return this.getAttribute("link");
   }
   
   set link(newLink) {
      this.setAttribute("link", newLink);
   }
   
   get label() {
      return this.getAttribute("label");
   }
   
   set label(newLabel) {
      this.setAttribute("label", newLabel);
   }
   
   get image() {
      return this.getAttribute("image");
   }
   
    set image(newImage) {
     this.setAttribute("image", newImage);
   }

    get target() {
       return this.getAttribute("target");
    }
    
     set target(newTarget) {
      this.setAttribute("target", newTarget);
    }

   /* Rendering */

   _updateRendering() {
      let targetWeb = (this.target && this.target != null) ? " target='" + this.target + "'" : "";
      if (this.image && this.image != null)
         this._presentation.innerHTML = "<a href='" + this.link + "' alt='" + this.label + "'" + targetWeb + ">" + 
                                          "<img class='link-image' src='" + this.image + "'></a>";
      else
         this._presentation.innerHTML = "<a class='link-button' href='" + this.link + "'" + targetWeb + ">" + 
                                        this.label + "</a>";
   }
   
   _computeLink() {
      if (this._monitor != null) {
         if (this.hasAttribute("label")) {
            let eventStates = new CustomEvent("compute-link", {detail: this.label});
            this._monitor.dispatchEvent(eventStates);
         }
      }
   }
   
   /* External DCC events */

   _updateLink(event) {
     this.link = event.detail;
   }
}

class DCCLinkProxy extends HTMLElement {
   constructor() {
     super();
   }
   
   /* Attribute Handling */

   static get observedAttributes() {
     return ["link", "label", "image", "target"];
   }

   connectedCallback() {
      let parentWindow = window.parent.document;
      let dcclink = document.querySelector("dcc-link[label='" + this.label + "']");
      
      if (dccLink != null) {
         if (!this.hasAttribute("link")) {
            let eventLink = new CustomEvent("update-link-event", {detail: this.link});
            dccLink.dispatchEvent(eventLink);
         }
      }
      
      this._updateRendering();
   }
   
   get link() {
      return this.getAttribute("link");
   }
   
   set link(newLink) {
      this.setAttribute("link", newLink);
   }
   
   get label() {
      return this.getAttribute("label");
   }
   
   set label(newLabel) {
      this.setAttribute("label", newLabel);
   }
   
   get image() {
      return this.getAttribute("image");
   }
   
    set image(newImage) {
     this.setAttribute("image", newImage);
   }

    get target() {
       return this.getAttribute("target");
    }
    
     set target(newTarget) {
      this.setAttribute("target", newTarget);
    }
}

customElements.define("dcc-link", DCCLink);
customElements.define("dcc-link-proxy", DCCLinkProxy);

})();