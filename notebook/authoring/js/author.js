function startSystem() {
   let dm = new AuthorDM();
}

class AuthorDM {
   constructor() {
      // this._server = new DCCAuthorServer();

      this.actionButton = this.actionButton.bind(this);
      let listeners = ["control-load", "control-save", "control-new-knot",
         "control-edit-knot", "control-knot-up", "control-knot-down",
         "control-config"];
      for (var l in listeners)
         document.addEventListener(listeners[l], this.actionButton);
      
      // <TODO> Temporary
      document.addEventListener(listeners[l], this.actionButton);
      let listenersX = ["edit-slide01", "edit-slide02"];
      for (var lX in listenersX)
         document.addEventListener(listenersX[lX], this.actionButton);
   }
   
   actionButton(event) {
      if (event.type == "control-load")
         this.selectCase();
      
      // <TODO> Temporary
      if (event.type == "edit-slide01")
         this.editSlide01();
      if (event.type == "edit-slide02")
         this.editSlide02();
   }
   
   // <TODO> provisory
   editSlide01() {
      // <TODO> provisory
      let slide01 =
`<div class="scene-screen">
   <dcc-character character="Lucinda" role="nurse" 
      image="../dccs/tests/images/nurse.png"
      description="Head nurse of the hospital.">
   </dcc-character>
</div>`;
      let slide01Web = document.querySelector("#slide01");
      slide01Web.innerHTML = slide01;
      
      let dccs = slide01Web.querySelectorAll("*");
      for (var d = 0; d < dccs.length; d++)
         if (dccs[d].tagName.toLowerCase().startsWith("dcc-"))
            dccs[d].editDCC();      
   }
   
   editSlide02() {
let slide02 =
`<div class="scene-screen">
      <dcc-lively-talk duration="2s" 
         character="images/nurse.png"
         speech="Doctor, we have a man (51 years old) who entered the emergency department reporting chest pain. His vital signs are ABP: 144x92mmHG; HR: 78bpm; RR: 21rpm; Temp: 37oC; O2Sat: 98%.">
      </dcc-lively-talk>
      <dcc-lively-talk duration="2s" delay="2s" direction="right"
         character="images/doctor.png" bubble="bubble"
         speech="Let’s go!">
      </dcc-lively-talk>
      <dcc-lively-talk duration="2s" delay="4s"
         character="images/patient.png" bubble="bubble"
         speech="Doctor, I am feeling chest pain since yesterday. The pain is continuous and is located just in the middle of my chest, worsening when I breathe and when I lay down on my bed. I suffer from arterial hypertension and smoke 20 cigarettes every day. My father had a “heart attack” at my age and I am very worried about it.">
      </dcc-lively-talk>
 </div>`;
let slide02Web = document.querySelector("#slide01");
slide02Web.innerHTML = slide02;

let dccs = slide02Web.querySelectorAll("*");
for (var d = 0; d < dccs.length; d++)
   if (dccs[d].tagName.toLowerCase().startsWith("dcc-"))
      dccs[d].editDCC();    
   }
   
   _resourceSelected(event) {
      // <TODO> provisory
      loadCase("case001-development", this);
      
      document.querySelector("#slide-set").style.display = "flex";
      
      // loadCase(event.detail, this);
   }
   
   _caseLoaded(caseMd) {
      console.log(caseMd);
      let knotPanel = document.querySelector("#knot-panel");
      knotPanel.removeChild(this._selector);
   }
   
   // <TODO> Temporary
   dispatchEvent(event) {
      this._resourceSelected(event);
   }
   
   selectCase() {
      this._selector = new DCCResourceSelector();
      // selector.preview = false;
      this._resourceSelected = this._resourceSelected.bind(this);
      document.addEventListener("resource-selected", this._resourceSelected);
      this._selector.addSelectionListener(this);
      // selector.addSelectList(this._server.casesList());
      
      casesList(this._selector);
      // console.log(cl);
      // selector.addSelectList(cl);
      let knotPanel = document.querySelector("#knot-panel");
      knotPanel.appendChild(this._selector);
   }
}

