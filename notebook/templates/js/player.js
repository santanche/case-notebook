const storePrefix = "casenote_";

class PlayerManager {
   static instance() {
      if (!PlayerManager._instance)
         PlayerManager._instance = new PlayerManager();
      return PlayerManager._instance;
   }
   
   constructor() {
      this.eventMonitor = this.eventMonitor.bind(this);
      let actionListeners = ["previous-knot", "control-register", "control-signin"];
      for (var al in actionListeners)
         document.addEventListener(actionListeners[al], this.eventMonitor);
   }
   
   eventMonitor(event) {
      console.log("Event: " + event.type);
      switch (event.type) {
         case "control-register": this.register(); break;
         case "control-signin":   this.signIn(); break;
         case "previous-knot":    window.history.back(); break;
      }
   }
   
   startKnot() {
      
   }
   
   startGame() {
      let currentUser = localStorage.getItem(storePrefix + "current-user");
      if (currentUser == null)
         document.querySelector("#signin-register").style.display = "flex";
      else {
         let userId = document.querySelector("#user-id");
         userId.innerHTML = userId.innerHTML + currentUser;
         let profile = this.retrieveProfile(currentUser);
         let userName = document.querySelector("#user-name");
         userName.innerHTML = userName.innerHTML + profile.name;
         document.querySelector("#signed-user").style.display = "initial";
      }
    }
   
   register() {
      let userId = document.querySelector("#idInput").value;
      let userName = document.querySelector("#nameInput").value;
      let userAge = document.querySelector("#ageInput").value;
      let invalidId = document.querySelector("#invalid-id");
      let answerAll = document.querySelector("#answer-all");

      if (userId.trim().length >0 && userName.trim().length > 0 && parseInt(userAge) > 0) {
         let users = this.retrieveUsers();
         if (users.ids.indexOf(userId) > -1) {
             invalidId.style.display = "initial";
             answerAll.style.display = "none";
         } else {
             let profile = {id: userId,
                            name: userName,
                            age: userAge,
                            cases: []};
             localStorage.setItem(storePrefix + "profile-" + userId, JSON.stringify(profile));
             users.ids.push(userId);
             localStorage.setItem(storePrefix + "users", JSON.stringify(users));
             invalidId.style.display = "none";
             answerAll.style.display = "none";
             document.querySelector("#signed-user").style.display = "initial";
             document.querySelector("#registration-form").style.display = "none";
             localStorage.setItem(storePrefix + "current-user", userId);
         }
      } else {
          invalidId.style.display = "none";
          answerAll.style.display = "initial";
      }
   }
   
   signIn() {
      var userId = document.querySelector("#idInput").value;

      if (this.retrieveUsers().ids.indexOf(userId) > -1) {
          var profile = this.retrieveProfile(userId);
          var userName = document.querySelector("#user-name");
          userName.innerHTML = userName.innerHTML + profile.name;
          document.querySelector("#request-id").style.display = "none";
          document.querySelector("#invalid-id").style.display = "none";
          document.querySelector("#signed-user").style.display = "initial";
          localStorage.setItem(storePrefix + "current-user", userId);
      } else
          document.querySelector("#invalid-id").style.display = "initial";
   }
   
   retrieveUsers() {
      let usersStr = localStorage.getItem(storePrefix + "users");
      return (usersStr == null) ? {ids: []} : JSON.parse(usersStr);
   }
   
   retrieveProfile(userid) {
      return JSON.parse(localStorage.getItem(storePrefix + "profile-" + userid));
   }
}