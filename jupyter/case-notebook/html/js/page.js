function updateHeader() {
    /*
	var parentWindow = window.parent.document;
	
	parentWindow.getElementById("navigator_text").innerHTML =
        document.getElementById("description").getAttribute("content");
        
    var navigatorPrevious =
        document.getElementById("navigator_previous");
    var navigatorBackward = parentWindow.getElementById("navigator_backward");
    if (navigatorPrevious != null) {
    	navigatorBackward.className = "navigator_backward_enabled";
        navigatorBackward.innerHTML = "<a href='" + navigatorPrevious.getAttribute("content") +
            "' target='render'><div class='navigator_backward_enabled'></div></a>";
    } else {
    	navigatorBackward.className = "navigator_backward_disabled";
    	navigatorBackward.innerHTML = "";
    }
    
    var navigatorNext =
        document.getElementById("navigator_next");
    var navigatorForward = parentWindow.getElementById("navigator_forward");
    if (navigatorNext != null) {
    	navigatorForward.className = "navigator_forward_enabled";
        navigatorForward.innerHTML = "<a href='" + navigatorNext.getAttribute("content") +
            "' target='render'><div class='navigator_forward_enabled'></div></a>";
    } else {
    	navigatorForward.className = "navigator_forward_disabled";
    	navigatorForward.innerHTML = "";
    }
    */
}

function goBack() {
    window.history.back();
}

function generateGuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function startGame() {
    var userid = generateGuid();
    localStorage.setItem("current-user", userid);

    var userProfile = {
      name : document.querySelector("#name").value
    };
    localStorage.setItem(userid, JSON.stringify(userProfile));

    localStorage.setItem("zombie-score", 100);
    showScore();
}

function increaseScore() {
    updateScore(10);
}

function decreaseScore() {
    updateScore(-10);
}

function updateScore(shift) {
    var score = parseInt(localStorage.getItem("zombie-score")) + shift;
    localStorage.setItem("zombie-score", score);
    showScore();
}

function showScore() {
    var score = localStorage.getItem("zombie-score");
    var scorePanel = document.getElementById("score");
    scorePanel.innerHTML = score;
}