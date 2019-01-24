/* Resource Selector DCC
  *******************/
class DCCResourceSelector extends DCCBase {
   constructor() {
      super();
      
      this._listeners = [];
      this._selectList = null;
      this._listWeb = null;
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
            .dsty-resource-list {
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
            .dsty-resource-preview {
               flex: 200px;
            }
            .dsty-resource {
               object-fit: contain;
               max-width: 100%;
               max-height: 100%;
            }
       </style>
       <div id="presentation-dcc" class="dsty-selector dsty-border">
          <div class="dsty-selection-block">
             <select id="resource-list" size="10" class="dsty-resource-list dsty-border">
             </select>
             <div id="select-button" class="dsty-select-button">Select</div>
          </div>
          <div id="resource-preview" class="dsty-resource-preview dsty-border">
          </div>
       </div>`;
      
      // templateHTML = templateHTML.replace("[files]", options);

      // building the template
      const template = document.createElement("template");
      template.innerHTML = templateHTML;
      let shadow = this.attachShadow({mode: "open"});
      shadow.appendChild(template.content.cloneNode(true));
      
      this._resourcePreview = shadow.querySelector("#resource-preview");
      
      let selectButton = shadow.querySelector("#select-button");
      this._notify = this._notify.bind(this);
      selectButton.addEventListener("click", this._notify);
      
      this._updatePreview = this._updatePreview.bind(this);
      this._listWeb = shadow.querySelector("#resource-list");
      this._showSelectList();
   }
   
   /* Properties
    **********/
    
    static get observedAttributes() {
       return ["preview"];
    }
   
    get preview() {
       let returnValue = this.hasAttribute("preview") && this.getAttribute("preview") != false;
       return returnValue;
    }
    
    set preview(newValue) {
       this.setAttribute("preview", newValue);
    }
    
   addSelectList(selectList) {
      this._selectList = selectList;
      if (this._listWeb != null)
         this._showSelectList();
   }
   
   _showSelectList() {
      if (this._selectList != null) {
         // let imageFiles = DCCSystem.getImageFiles();
         let options = "";
         for (var l in this._selectList)
            options += "<option value='" + this._selectList[l][1] +
                       ((l == 0) ? "' selected>" : "'>") +
                       this._selectList[l][0] + "</option>";
         this._listWeb.innerHTML = options;
         this._listWeb.addEventListener("change", this._updatePreview);
      }
      this._updatePreview();
   }
   
   _updatePreview() {
      this._resourcePreview.innerHTML = "<img src='" + this._listWeb.value + "' class='dsty-resource'>"; 
   }
   
   addSelectionListener(listener) {
      this._listeners.push(listener);
   }
   
   _notify() {
      let eventSelected = new CustomEvent("resource-selected", {detail: this._listWeb.value});
      for (var l in this._listeners)
         this._listeners[l].dispatchEvent(eventSelected);
   }
}

(function() {
   DCCResourceSelector.editableCode = false;
   customElements.define("dcc-resource-selector", DCCResourceSelector);
})();