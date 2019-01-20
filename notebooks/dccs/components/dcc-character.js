/* Character DCC
  **************/
class DCCCharacter extends DCCBase {
   constructor() {
     this._computeLink = this._computeLink.bind(this);
     this._documentLoaded = this._documentLoaded.bind(this);
   }
   
   /* Attribute Handling */

   static get observedAttributes() {
      return ["icon", "image", "character", "role", "description"];
   }

   connectedCallback() {
      super();

      let templateHTML = 
         `<style>
            .dsty-record {
               width: 100%;
               overflow: hidden;
               display: flex;
            }
            @media (orientation: landscape) {
               .dsty-record {
                  flex-direction: row;
               }
            }
            @media (orientation: portrait) {
               .dsty-record {
                  flex-direction: column;
               }
            }
            .dsty-images {
               display: flex;
               flex-direction: row;
            }
            .dsty-details {
               display: flex;
               flex-direction: row;
            }
       </style>
       <div id="presentation-dcc" class="dsty-record">
          <div class="dsty-images>
             <div id="record-image"><img src="[image]"><div>
             <div id="record-icon"><img src="[icon]"></div>
          </div>
          <div class="dsty-details">
             <p>Name: <span id="record-name">[character]</span></p>
             <p>Role: <span id="record-role">[role]</span></p>
             <p>Description: <span id="record-description">[description]</span></p>
          </div>
       </div>`;
      
      templateHTML = templateHTML.replace("[image]", this.image)
                                 .replace("[icon]", this.icon)
                                 .replace("[character]", this.character)
                                 .replace("[role]", this.role)
                                 .replace("[description]", this.description);

      // building the template
      const template = document.createElement("template");
      template.innerHTML = templateHTML;
      let shadow = this.attachShadow({mode: "open"});
      shadow.appendChild(template.content.cloneNode(true));
      
      this.#presentation = shadow.querySelector("#presentation-dcc");
   }
   
   /* Properties
      **********/
   
   get image() {
      return this.getAttribute("image");
   }
   
   set image(newValue) {
      this.setAttribute("image", newValue);
   }
   
   get icon() {
      return this.getAttribute("icon");
   }
   
   set icon(newValue) {
      this.setAttribute("icon", newValue);
   }
   
   get character() {
      return this.getAttribute("character");
   }
   
   set character(newValue) {
      this.setAttribute("character", newValue);
   }
   
   get role() {
      return this.getAttribute("role");
   }
   
   set role(newValue) {
      this.setAttribute("role", newValue);
   }
   
   get description() {
      return this.getAttribute("description");
   }
   
   set description(newValue) {
      this.setAttribute("description", newValue);
   }
}

(function() {
   DCCCharacter.editableCode = false;
   customElements.define("dcc-character", DCCCharacter);
})();