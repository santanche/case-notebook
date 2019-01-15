function updateHeader() {
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
}

