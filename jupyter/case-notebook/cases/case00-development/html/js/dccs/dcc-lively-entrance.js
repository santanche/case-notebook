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
       position: relative;
       font-family: "Trebuchet MS", Helvetica, sans-serif;
       animation-name: dcc-block-displacement;
       animation-duration: 2s;
     }
     
      @media (orientation: landscape) {
        .dcc-direction {
          display: flex;
          flex-direction: row;
        }
      }
      
      @media (orientation: portrait) {
        .dcc-direction {
          display: flex;
          flex-direction: column;
        }
      }
     
     .dcc-character {
        flex-basis: 100px;
     }
     
     .dcc-speech {
        background-repeat: no-repeat;
        background-size: 100% 100%;
        flex-basis: 800px;
     }
     
     @media (orientation: landscape) {
        .dcc-speech-image {
           background-image: url("[bubble-file]-landscape.svg");
        }
     }

     @media (orientation: portrait) {
        .dcc-speech-image {
           background-image: url("[bubble-file]-portrait.svg");
        }
     }

     </style>
     <div class="dcc-entrance-container">
        <div id="presentation-dcc" class="dcc-hidden"></div>
     </div>`;
     templateHTML = templateHTML.replace("[bubble-file]", this.bubble);
     const template = document.createElement("template");
     template.innerHTML = templateHTML;
       this._shadow = this.attachShadow({mode: "open"});
     this._shadow.appendChild(template.content.cloneNode(true));
     
     this._presentation = this._shadow.querySelector("#presentation-dcc");
     this._imageLoaded = this._imageLoaded.bind(this);
     this._imageWeb = null;
   }

   static get observedAttributes() {
    return ["duration", "character", "bubble", "speech"];
   }

   createdCallback() {
   }

   attributeChangedCallback(name, oldValue, newValue) {
   }
   
   connectedCallback() {
      this._presentation.innerHTML =
         "<div class='dcc-character'><img src='" + this.character + "' width='100px'></div>" +
         "<div class='dcc-speech dcc-speech-direction' style=' padding: 15px 15px 10px 80px'>" + this.speech + "</div>";
      this._presentation.querySelector("img").addEventListener("load", this._imageLoaded);
   }

   get duration() {
     return this.getAttribute("duration");
   }

   set duration(newDuration) {
     this.setAttribute("duration", newDuration);
   }

   get character() {
     return this.getAttribute("character");
   }

    set character(newCharacter) {
     this.setAttribute("character", newCharacter);
   }

   get bubble() {
      return this.getAttribute("bubble");
   }

   set speech(newBubble) {
      this.setAttribute("bubble", newBubble);
   }

   get speech() {
     return this.getAttribute("speech");
   }

    set speech(newSpeech) {
     this.setAttribute("speech", newSpeech);
   }

   _imageLoaded() {
      this._presentation.classList.add("dcc-direction");
      this._presentation.classList.add("dcc-entrance");
      this._presentation.classList.remove("dcc-hidden");
   }
}

customElements.define("dcc-lively-entrance", DCCLivelyEntrance);

})();