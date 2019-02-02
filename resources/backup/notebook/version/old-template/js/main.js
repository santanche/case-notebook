/*
function startSystem() {
    var usersStr = localStorage.getItem("jacinto-users");
    var users = (usersStr == null) ? {ids: []} : JSON.parse(usersStr);  

    var currentStr = localStorage.getItem("jacinto-current-user");
    var userid = (currentStr == null) ? generateGuid()

    var userid = generateGuid();
    localStorage.setItem("current-user", userid);
    users.ids.push(userid);
    localStorage.setItem("jacinto-users", JSON.stringify(users));
}
*/

/*
function loadHTML(source, target) {
   let xhr = new XMLHttpRequest();
   
   xhr.open("GET", source, true);
   
   xhr.onreadystatechange = function contentLoaded() {
      if (this.readyState === this.DONE) {
         let targetWeb = document.querySelector("#" + target);
         targetWeb.innerHTML = xhr.responseXML.src;
      }
   }
   
   xhr.send();
}

function startPage() {
   loadHTML("start.xml", "render-area");
}
*/

function exportScore() {
    console.log("=== current user ===");
    var userid = localStorage.getItem("current-user");
    console.log("== user id: " + userid);
    var profile = localStorage.getItem(userid);
    console.log("== profile: " + profile);

    console.log("=== all users ===");
    var users = JSON.parse(localStorage.getItem("jacinto-users"));
    for (u in users.ids) {
        console.log("== user id: " + users.ids[u]);
        profile = localStorage.getItem(users.ids[u]);
        console.log("== profile: " + profile);
    }
}

/*
function switchStateA()
{
    var sourceItem = document.getElementById("stateA");
    sourceItem.className = "menu_bottom_selected";
    sourceItem.innerHTML = "[State A]";

    var executionItem = document.getElementById("stateB");
    executionItem.className = "";
    executionItem.innerHTML = "<a onclick='switchStateB()' class='link_class'>[State B]</a>";
}

function switchStateB()
{
    var executionItem = document.getElementById("stateA");
    executionItem.className = "";
    executionItem.innerHTML = "<a onclick='switchStateA()' class='link_class'>[State A]</a>";
    
    var sourceItem = document.getElementById("stateB");
    sourceItem.className = "menu_bottom_selected";
    sourceItem.innerHTML = "[State B]";
}
*/
