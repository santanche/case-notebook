var storePrefix = "jacinto-";

function goBack() {
    window.history.back();
}

function retrieveProfile(userid) {
    return JSON.parse(localStorage.getItem(storePrefix + "profile-" + userid));
}

function retrieveUsers() {
    var usersStr = localStorage.getItem(storePrefix + "users");
    return (usersStr == null) ? {ids: []} : JSON.parse(usersStr);
}

function retrieveCase() {
    var casekey = localStorage.getItem(storePrefix + "current-case");
    return JSON.parse(localStorage.getItem(storePrefix + casekey));
}

function generateGuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function startSystem() {
    var currentUser = localStorage.getItem(storePrefix + "current-user");
    if (currentUser == null)
        document.querySelector("#signin-register").style.display = "initial";
    else {
        var userId = document.querySelector("#user-id");
        userId.innerHTML = userId.innerHTML + currentUser;
        var profile = retrieveProfile(currentUser);
        var userName = document.querySelector("#user-name");
        userName.innerHTML = userName.innerHTML + profile.name;
        document.querySelector("#signed-user").style.display = "initial";
    }

    // localStorage.setItem("zombie-score", 100);
    // showScore();

    // traceRoute("Case Start");
}

function resetSystem() {
    console.log("Removing " + storePrefix + "users");
    localStorage.removeItem(storePrefix + "users");
    console.log("Removing " + storePrefix + "current-user");
    localStorage.removeItem(storePrefix + "current-user");
    console.log("Removing " + storePrefix + "current-case");
    localStorage.removeItem(storePrefix + "current-case");
}

function signIn() {
    var userId = document.querySelector("#idInput").value;

    if (retrieveUsers().ids.indexOf(userId) > -1) {
        var profile = retrieveProfile(userId);
        var userName = document.querySelector("#user-name");
        userName.innerHTML = userName.innerHTML + profile.name;
        document.querySelector("#request-id").style.display = "none";
        document.querySelector("#invalid-id").style.display = "none";
        document.querySelector("#signed-user").style.display = "initial";
        localStorage.setItem(storePrefix + "current-user", userId);
    } else
        document.querySelector("#invalid-id").style.display = "initial";
}

function changeUser() {
    localStorage.removeItem(storePrefix + "current-user");
}

function register() {
    var userId = document.querySelector("#idInput").value;
    var userName = document.querySelector("#nameInput").value;
    var userAge = document.querySelector("#ageInput").value;
    var invalidId = document.querySelector("#invalid-id");
    var answerAll = document.querySelector("#answer-all");

    if (userId.trim().length >0 && userName.trim().length > 0 && parseInt(userAge) > 0) {
       if (retrieveUsers().ids.indexOf(userId) > -1) {
           invalidId.style.display = "initial";
           answerAll.style.display = "none";
       } else {
           var profile = {id: userId,
                          name: userName,
                          age: userAge,
                          cases: []};
           localStorage.setItem(storePrefix + "profile-" + userId, JSON.stringify(profile));
           var users = retrieveUsers();
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

/*
function setupProfile() {
    var profile = retrieveProfile();

    var nameField = document.querySelector("#name");
    if (profile == null) {
      // nameField.innerHTML = "Inform your name: <input type='text' id='nameInput'></input>";
      signin.innerHTML = "";
      proceedLink.innerHTML = "<a href='#' onclick='signIn()'>Sign in</a>";
    } else {
      nameField.innerHTML = "Name: " + profile.name;
      buildCase(profile);
    }
}
*/

function buildCase(caseid) {
    var currentUser = localStorage.getItem(storePrefix + "current-user");
    var profile = retrieveProfile(currentUser);

    var casekey = currentUser + "-" + caseid + "-" + generateGuid();
    profile.cases.push(casekey);
    localStorage.setItem(storePrefix + "current-case", casekey);
    localStorage.setItem(storePrefix + "profile-" + currentUser, JSON.stringify(profile));

    var currentDateTime = new Date();
    var casetrack = {
      userid : currentUser,
      caseid : caseid,
      startDate : currentDateTime.getDate(),
      startTime : currentDateTime.getTime(),
      inputs : {},
      route : []
    };
    localStorage.setItem(storePrefix + casekey, JSON.stringify(casetrack));
}

function computeLink(_link) {
    var casekey = localStorage.getItem(storePrefix + "current-case");
    var casetrack = retrieveCase();
    var userInputs = document.querySelectorAll(".userInput");
    for (ui in userInputs)
      casetrack.inputs[userInputs[ui].id] = userInputs[ui].value;
    localStorage.setItem(storePrefix + casekey, JSON.stringify(casetrack));
}

function followInput(variable, vocabulary) {
    var value = document.querySelector("#" + variable).value;

    console.log("= Follow input - variable: " + variable + ", value: " + value +
                ", vocabulary: " + vocabulary);
}

function evaluateInput(variable, vocabulary) {
    var value = document.querySelector("#" + variable).value;

    console.log("===== Evaluate input - variable: " + variable + ", value: " + value +
                ", vocabulary: " + vocabulary);
}

function traceRoute(node) {
    var casekey = localStorage.getItem(storePrefix + "current-case");
    var casetrack = retrieveCase();
    
    var currentTime = new Date();
    casetrack.route.push("#navigate:" + node + "," + currentTime.getTime());

    localStorage.setItem(storePrefix + casekey, JSON.stringify(casetrack));

    // var score = localStorage.getItem("jacinto-score");
    /*
    var userid = localStorage.getItem("current-user");
    var profile = JSON.parse(localStorage.getItem(userid));
    var currentTime = new Date();
    profile.route.push(currentCase + "," + node + "," + currentTime.getTime());
    */
    // profile.route.push(currentCase + "," + node + "," + score);
    
    // localStorage.setItem(userid, JSON.stringify(profile));
}

function reportRoute() {
    var output = "";
    output += "##current-user: " + localStorage.getItem(storePrefix + "current-user") + "\n";
    output += "##current-case: " + localStorage.getItem(storePrefix + "current-case") + "\n";
    var users = retrieveUsers();
    for (u in users.ids) {
        output += "##userid: " + users.ids[u] + "\n";
        var profileStr = localStorage.getItem(storePrefix + "profile-" + users.ids[u]);
        output += "##profile: " + profileStr + "\n";
        if (profileStr != null) {
            var profile = JSON.parse(profileStr);
            for (c in profile.cases) {
                var casetrack = localStorage.getItem(storePrefix + profile.cases[c]);
                output += "##case: " + casetrack;
            }
        }
    }
    document.querySelector("#report").innerHTML = output; 
}

function computeScore(operator, variable, value) {
    var casekey = localStorage.getItem(storePrefix + "current-case");
    var casetrack = retrieveCase();
    
    if (casetrack.inputs[variable] && casetrack.inputs[variable] != null && operator != "=") {
        switch (operator) {
            case "+": casetrack.inputs[variable] = casetrack.inputs[variable] + parseInt(value);
                      break;
            case "-": casetrack.inputs[variable] = casetrack.inputs[variable] - parseInt(value);
                      break;
            case "*": casetrack.inputs[variable] = casetrack.inputs[variable] * parseInt(value);
                      break;
            case "/": casetrack.inputs[variable] = casetrack.inputs[variable] / parseInt(value);
                      break;
        }
    } else {
        if (isNaN(casetrack))
            casetrack.inputs[variable] = value;
        else
            casetrack.inputs[variable] = parseInt(value);
    }

    localStorage.setItem(storePrefix + casekey, JSON.stringify(casetrack));
}

function showScore(variable) {
    var casetrack = retrieveCase();
    var variableField = document.querySelector("#var-" + variable);

    variableField.innerHTML = casetrack.inputs[variable];
}

function increaseScore(title) {
    updateScore(10, title);
}

function decreaseScore(title) {
    updateScore(-10, title);
}

function updateScore(shift, title) {
    var score = parseInt(localStorage.getItem("zombie-score")) + shift;
    localStorage.setItem("zombie-score", score);
    showScore();
    traceRoute(title);
    nextCase();
}

function endScore() {
    traceRoute("End");
    showScore();
}

function showScore() {
    var score = localStorage.getItem("zombie-score");
    var scorePanel = document.getElementById("score");
    scorePanel.innerHTML = score;
}

function nextCase() {
    var currentCase = parseInt(localStorage.getItem("current-case"));
    currentCase++;
    localStorage.setItem("current-case", currentCase);
    document.querySelector("#next_case").innerHTML = "<a href='Caso_" + currentCase + ".html'>Próximo Caso</a>";
}

