(function() {
  
/* Lively Talk DCC
 *****************/
class DCCLivelyTalk extends HTMLElement {
   constructor() {
     super();

     this._imageLoaded = this._imageLoaded.bind(this);
     this._imageWeb = null;

     this._scheduleAnimation = this._scheduleAnimation.bind(this);
   }

   static get observedAttributes() {
    return ["duration", "delay", "direction", "character", "bubble", "speech"];
   }

   connectedCallback() {
      const animationDirection = {
         "left":  "from {left: 100%;} to {left: 0%;}",
         "right": "from {left: -100%;} to {left: 0%;}"
      };
      const animationTransform = {
         "left":  "1, 1",
         "right": "-1, 1"
      };
         
      let durationWeb = (this.duration != null) ? this.duration : "2s";
      let delayWeb = (this.delay != null) ? this.delay : "0s";
      let directionWeb = (this.direction != null) ? this.direction : "left";
      let bubbleWeb = (this.bubble != null) ? this.bubble : "bubble";
      
      let templateHTML =
         `<style>
          .dcc-hidden {
            position: relative;
            left: 100%;
          }
          
          @keyframes dcc-block-displacement {
            [direction]
          }

          .dcc-entrance-container {
            width: 100%;
            overflow: hidden;
          }

          .dcc-entrance {
            position: relative;
            left: 100%;
            font-family: "Trebuchet MS", Helvetica, sans-serif;
            animation-name: dcc-block-displacement;
            animation-duration: [duration];
            animation-delay: [delay];
            animation-fill-mode: forwards;
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
          
          .dcc-bubble {
             background-repeat: no-repeat;
             background-size: 100% 100%;
             flex-basis: 800px;
             padding: 15px 15px 10px 80px;
             transform: scale([transform]);
          }
          
          @media (orientation: landscape) {
             .dcc-bubble {
                background-image: url("images/[bubble-file]-landscape.png");
             }
          }

          @media (orientation: portrait) {
             .dcc-bubble {
                background-image: url("images/[bubble-file]-portrait.png");
             }
          }

          .dcc-speech {
             transform: scale([transform]);
             text-align: [align];
          }
          
          </style>
          <div class="dcc-entrance-container">
             <div id="presentation-dcc" class="dcc-hidden"></div>
          </div>`;
          
      templateHTML = templateHTML.replace("[duration]", durationWeb)
                                 .replace("[delay]", delayWeb)
                                 .replace(/\[direction\]/igm, animationDirection[directionWeb])
                                 .replace(/\[transform\]/igm, animationTransform[directionWeb])
                                 .replace("[align]", directionWeb)
                                 .replace(/\[bubble-file\]/igm, bubbleWeb);
      
      const template = document.createElement("template");
      template.innerHTML = templateHTML;
      this._shadow = this.attachShadow({mode: "open"});
      this._shadow.appendChild(template.content.cloneNode(true));
          
      this._presentation = this._shadow.querySelector("#presentation-dcc");
      
      const imageHTML = "<div class='dcc-character'><img src='" + this.character + "' width='100px'></div>";
      const speechHTML = "<div class='dcc-bubble'><div class='dcc-speech'>" + this.speech + "</div></div>";
      
      this._presentation.innerHTML = (directionWeb == "left") ? imageHTML + speechHTML : speechHTML + imageHTML;
      this._presentation.querySelector("img").addEventListener("load", this._imageLoaded);
      
      this.addEventListener("schedule-animation", this._scheduleAnimation);
   }
   
   disconnectedCallback() {
      this.removeEventListener("schedule-animation", this._scheduleAnimation);
   }

   get duration() {
     return this.getAttribute("duration");
   }

   set duration(newDuration) {
     this.setAttribute("duration", newDuration);
   }

   get delay() {
      return this.getAttribute("delay");
    }

   set delay(newDelay) {
      this.setAttribute("delay", newDelay);
    }

   get direction() {
      return this.getAttribute("direction");
   }

   set direction(newDirection) {
      this.setAttribute("direction", newDirection);
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
      this._dialog = document.querySelector("dcc-lively-dialog");
      
      if (this._dialog == null)
         this._startAnimation();
      else {
         let eventReady = new CustomEvent("talk-ready", {detail: this});
         this._dialog.dispatchEvent(eventReady);         
      }
   }
   
   _scheduleAnimation(event) {
      this.duration = event.detail.duration;
      this.delay = event.detail.delay;
      this._startAnimation();
   }
   
   _startAnimation() {
      this._presentation.classList.add("dcc-direction");
      this._presentation.classList.add("dcc-entrance");
      this._presentation.classList.remove("dcc-hidden");
   }
}

/* Lively Dialog DCC
 *******************/
class DCCLivelyDialog extends HTMLElement {
   constructor() {
      super();
      
      this._sequenceCounter = 0;
      
      this._talkReady = this._talkReady.bind(this);
   }
   
   /* Attribute Handling */

   static get observedAttributes() {
      return ["rate", "duration"];
   }

   connectedCallback() {
      this.addEventListener("talk-ready", this._talkReady);
   }

   disconnectedCallback() {
      this.removeEventListener("talk-ready", this._talkReady);
   }

   get rate() {
      return this.getAttribute("rate");
   }

    set rate(newRate) {
      this.setAttribute("rate", newRate);
   }
   
    get duration() {
       return this.getAttribute("duration");
    }

    set duration(newDuration) {
       this.setAttribute("duration", newDuration);
    }
    
   /* Rendering */

   _talkReady(event) {
      let eventSchedule = new CustomEvent("schedule-animation",
            {detail: {duration: this.duration, delay: (this._sequenceCounter * this.rate) - this.duration}});
      event.detail.dispatchEvent(eventSchedule);
      this._sequenceCounter++;
   }
}

customElements.define("dcc-lively-talk", DCCLivelyTalk);
customElements.define("dcc-lively-dialog", DCCLivelyDialog);

})();