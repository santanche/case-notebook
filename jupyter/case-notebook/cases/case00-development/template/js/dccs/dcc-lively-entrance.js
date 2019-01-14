/* Lively Entrance DCC
**********************/
(function() {
  
class DCCLivelyEntrance extends HTMLElement {
   constructor() {
     super();

     let templateHTML =
    `<style>
     .dcc-hidden {
       display: none;
     }
     @keyframes dcc-block-displacement {
       from {left: 100%;}
       to {left: 0%;}
     }

     .dcc-entrance-container {
       width: 100%;
       overflow: hidden;
     }

     .dcc-entrance {
       display: initial;
       position: relative;
       font-family: "Trebuchet MS", Helvetica, sans-serif;
       animation-name: dcc-block-displacement;
       animation-duration: 2s;
     }
     </style>
     <div class="dcc-entrance-container">
        <div id="presentation-dcc" class="dcc-hidden"></div>
     </div>`;
     const template = document.createElement("template");
     template.innerHTML = templateHTML;
       this._shadow = this.attachShadow({mode: "open"});
     this._shadow.appendChild(template.content.cloneNode(true));
     
     this._presentation = this._shadow.querySelector("#presentation-dcc");
     this._imageLoaded = this._imageLoaded.bind(this);
     this._imageWeb = null;
   }

   static get observedAttributes() {
    return ["duration", "image", "text"];
   }

   createdCallback() {
   }

   attributeChangedCallback(name, oldValue, newValue) {
   }
   
   connectedCallback() {
      this._presentation.innerHTML =
         "<img src='" + this.image + "' width='150px'>" +
         this.text;
      this._presentation.querySelector("img").addEventListener("load", this._imageLoaded);
   }

   get duration() {
     return this.getAttribute("duration");
   }

    set duration(newDuration) {
     this.setAttribute("duration", newDuration);
   }

   get image() {
     return this.getAttribute("image");
   }

    set image(newImage) {
     this.setAttribute("image", newImage);
   }

   get text() {
     return this.getAttribute("text");
   }

    set text(newText) {
     this.setAttribute("text", newText);
   }

   _imageLoaded() {
      this._presentation.classList.add("dcc-entrance");
      this._presentation.classList.remove("dcc-hidden");
   }
}

customElements.define("dcc-lively-entrance", DCCLivelyEntrance);

})();