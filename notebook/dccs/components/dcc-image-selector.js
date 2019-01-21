/* Image Selector DCC
  *******************/
class DCCImageSelector extends DCCBase {
   constructor() {
      super();
      
      this._listeners = [];
   }
   
   connectedCallback() {
      let templateHTML = 
         `<style>
            .dsty-border {
               border: 1px solid black;
               border-radius: 5px;
               margin: 5px;
            }
            .dsty-selector {
               overflow: hidden;
               display: flex;
               max-width: 400px;
            }
            @media (orientation: landscape) {
               .dsty-selector {
                  flex-direction: row;
               }
            }
            @media (orientation: portrait) {
               .dsty-selector {
                  flex-direction: column;
               }
            }
            .dsty-selection-block {
               flex: 200px;
               max-height: 300px;
               display: flex;
               flex-direction: column;
            }
            .dsty-image-list {
               flex: 50%;
            }
            .dsty-select-button {
               background-color: #383f4f;
               color: #e0e9ce;
               padding: 14px 25px;
               text-align: center;
               text-decoration: none;
               display: inline-block;
            }
            .dsty-select-button:hover {
               color: white;
               cursor: pointer;
            }
            .dsty-image-preview {
               flex: 200px;
            }
            .dsty-image {
               object-fit: contain;
               max-width: 100%;
               max-height: 100%;
            }
       </style>
       <div id="presentation-dcc" class="dsty-selector dsty-border">
          <div class="dsty-selection-block">
             <select id="image-list" size="10" class="dsty-image-list dsty-border">
                [files]
             </select>
             <div id="select-button" class="dsty-select-button">Select</div>
          </div>
          <div id="image-preview" class="dsty-image-preview dsty-border">
          </div>
       </div>`;
      
      let imageFiles = DCCSystem.getImageFiles();
      let options = "";
      for (var i in imageFiles)
         options += "<option value='" + imageFiles[i] +
                    ((i == 0) ? "' selected>" : "'>") +
                    imageFiles[i] + "</option>";
      
      templateHTML = templateHTML.replace("[files]", options);

      // building the template
      const template = document.createElement("template");
      template.innerHTML = templateHTML;
      let shadow = this.attachShadow({mode: "open"});
      shadow.appendChild(template.content.cloneNode(true));
      
      this._imagePreview = shadow.querySelector("#image-preview");
      
      this._imageList = shadow.querySelector("#image-list");
      this._updatePreview = this._updatePreview.bind(this);
      this._imageList.addEventListener("change", this._updatePreview);
      
      let selectButton = shadow.querySelector("#select-button");
      this._notify = this._notify.bind(this);
      selectButton.addEventListener("click", this._notify);
      
      this._updatePreview();
   }
   
   _updatePreview() {
      this._imagePreview.innerHTML = "<img src='" + this._imageList.value + "' class='dsty-image'>"; 
   }
   
   addSelectionListener(listener) {
      this._listeners.push(listener);
   }
   
   _notify() {
      let eventSelected = new CustomEvent("image-selected", {detail: this._imageList.value});
      for (var l in this._listeners)
         this._listeners[l].dispatchEvent(eventSelected);
   }
}

(function() {
   DCCImageSelector.editableCode = false;
   customElements.define("dcc-image-selector", DCCImageSelector);
})();