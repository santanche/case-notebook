function startKnot() {
   let player = new PlayerManager();
}

class PlayerManager {
   constructor() {
      this.eventMonitor = this.eventMonitor.bind(this);
      let actionListeners = ["previous-knot"];
      for (var al in actionListeners)
         document.addEventListener(actionListeners[al], this.eventMonitor);
   }
   
   eventMonitor(event) {
      console.log("Event: " + event.type);
      switch (event.type) {
         case "previous-knot": window.history.back();
                              break;
      }
   }
}