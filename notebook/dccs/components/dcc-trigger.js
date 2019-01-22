/* Trigger DCC
**************/
(function() {
  
class DCCTrigger extends DCCBase {
   constructor() {
     super();

     let templateHTML = 
     `<style>
        .trigger-button {
          background-color: #383f4f;
          color: #e0e9ce;
          padding: 14px 25px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
        }
        
        .trigger-button:hover {
          color: white;
          cursor: pointer;
        }
        
        .trigger-image {
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
     
     // this._monitor = document.querySelector("dcc-monitor");
     
     this._computeTrigger = this._computeTrigger.bind(this);
     this._documentLoaded = this._documentLoaded.bind(this);
   }
   
   /* Attribute Handling */

   static get observedAttributes() {
     return ["link", "action", "label", "image", "location"];
   }

   connectedCallback() {
      window.addEventListener("load", this._documentLoaded);
   }
   
   disconnectedCallback() {
      this._presentation.removeEventListener("click", this._computeTrigger);
   }

   get link() {
      return this.getAttribute("link");
   }
   
   set link(newLink) {
      this.setAttribute("link", newLink);
   }
   
   get action() {
      return this.getAttribute("action");
   }
   
   set action(newAction) {
      this.setAttribute("action", newAction);
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

    get location() {
       return this.getAttribute("location");
    }
    
    set location(newLocation) {
      this.setAttribute("location", newLocation);
    }

   /* Rendering */

   _documentLoaded() {
      let webLocation = null;
      if (this.hasAttribute("location")) {
         console.log(this.label + " location: #" + this.location);
         webLocation = document.querySelector("#" + this.location);
      }
      
      let linkWeb = (this.hasAttribute("link")) ? "href='" + this.link + "' " : "";
      
      let triggerWeb = null;
      if (this.hasAttribute("image"))
         triggerWeb = "<a " + linkWeb + "alt='" + this.label + "'>" + 
                      "<img width='100%' height='100%' class='link-image' src='" + this.image + "'></a>";
      else
         triggerWeb = "<a class='trigger-button' " + linkWeb + ">" + this.label + "</a>";
      if (webLocation != null) {
         console.log(this.label + " done!");
         webLocation.innerHTML = webLocation.innerHTML + triggerWeb;
      } else
         this._presentation.innerHTML = triggerWeb;

      this._presentation.addEventListener("click", this._computeTrigger);
   }
   
   _computeTrigger() {
      if (this.hasAttribute("label") || this.hasAttribute("action")) {
         let eventLabel = (this.hasAttribute("action")) ? this.action : "compute-trigger";
         let message = (this.hasAttribute("label")) ? this.label : this.action;
         let eventButton = new CustomEvent(eventLabel, {detail: message});
         document.dispatchEvent(eventButton);
      }
   }
}

customElements.define("dcc-trigger", DCCTrigger);

})();