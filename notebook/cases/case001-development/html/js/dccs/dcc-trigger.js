/* Trigger DCC
**************/
(function() {
  
class DCCTrigger extends DCCBase {
   constructor() {
     super();
     
     let templateHTML = 
     `<style>
        .trigger-button-minimal:hover {
           cursor: pointer;
        }
     
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
           cursor: pointer;
        }
      </style>
      <span id="presentation-dcc"></span>`;
     
     const template = document.createElement("template");
     template.innerHTML = templateHTML;
     this._shadow = this.attachShadow({mode: "open"});
     this._shadow.appendChild(template.content.cloneNode(true));
     
     this._presentation = this._shadow.querySelector("#presentation-dcc");
     
     // this._monitor = document.querySelector("dcc-monitor");
     
     this._computeTrigger = this._computeTrigger.bind(this);
     this._renderInterface = this._renderInterface.bind(this);
   }
   
   /* Attribute Handling */

   static get observedAttributes() {
     return ["link", "action", "label", "image", "location", "render"];
   }

   connectedCallback() {
      if (document.readyState === "complete")
         this._renderInterface();
      else
         window.addEventListener("load", this._renderInterface);
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
    
   get render() {
      return this.getAttribute("render");
   }

   set render(newValue) {
      this.setAttribute("render", newValue);
   }

   /* Rendering */
   
   _renderInterface() {
      let webLocation = null;
      if (this.hasAttribute("location"))
         webLocation = document.querySelector("#" + this.location);
      
      let linkWeb = (this.hasAttribute("link")) ? "href='" + this.link + "' " : "";
      
      let renderWeb = "trigger-button";
      if (this.hasAttribute("render"))
         if (this.render = "none")
            renderWeb = "trigger-button-minimal";
         else
            renderWeb = this.style;
      
      let triggerWeb = null;
      if (this.hasAttribute("image"))
         triggerWeb = DCCTrigger.templates.image.replace("[link]", linkWeb)
                                                .replace("[label]", this.label)
                                                .replace("[image]", this.image);
      else
         triggerWeb = DCCTrigger.templates.regular.replace("[render]", renderWeb)
                                                  .replace("[link]", linkWeb)
                                                  .replace("[label]", this.label);
      
      let triggerElem = document.createElement("span");
      triggerElem.innerHTML = triggerWeb;
      triggerElem.addEventListener("click", this._computeTrigger);
      
      if (webLocation != null)
         webLocation.appendChild(triggerElem);
      else
         this._presentation.appendChild(triggerElem);

      // this._presentation.addEventListener("click", this._computeTrigger);
   }
   
   _computeTrigger() {
      if (this.hasAttribute("label") || this.hasAttribute("action")) {
         let eventLabel = (this.hasAttribute("action")) ? this.action : "compute-trigger";
         let message = (this.hasAttribute("label")) ? this.label : this.action;
         let eventButton = new CustomEvent(eventLabel, {detail: message});
         console.log(eventButton);
         document.dispatchEvent(eventButton);
      }
   }
}

DCCTrigger.templates = {
regular:
`<a class='[render]' [link]>[label]</a>`,
image:
`<a [link] alt='[label]' style='cursor:pointer'>
   <img width='100%' height='100%' class='trigger-image' src='[image]'>
</a>`
};

customElements.define("dcc-trigger", DCCTrigger);

})();