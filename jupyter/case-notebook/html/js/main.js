function exportScore() {
  var userid = localStorage.getItem("current-user");
  console.log("== user id: " + userid);
  var profile = localStorage.getItem(userid);
  console.log("== profile: " + profile);
}

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
