/**
 * 
 */
//class DCCAuthorServer {
   const serverAddress = "http://127.0.0.1:8888/";

   const casesList = async (selector) => {
      const response = await fetch(serverAddress + "cases-list", {
         method: "POST",
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      const cases = jsonResponse.casesList;
      let finalCasesList = {};
      for (var c in cases)
         finalCasesList[cases[c]] = "images/mono-slide.svg";
      selector.addSelectList(finalCasesList);
      return cases;
   }
   
   const loadCase = async (caseName, author) => {
      const response = await fetch(serverAddress + "load-case", {
         method: "POST",
         body: JSON.stringify({"caseName": caseName}),
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      const caseMd = jsonResponse.caseMd;

      author._caseLoaded(caseMd);
      return caseMd;
   }

   const saveCase = async (caseName, caseText, author) => {
      const response = await fetch(serverAddress + "save-case", {
         method: "POST",
         body: JSON.stringify({"caseName": caseName,
                               "caseText": caseText}),
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      const status = jsonResponse.status;

      author._caseSaved(status);
      return status;
   }

   const loadTemplate = async (templateName, author) => {
      const response = await fetch(serverAddress + "load-template", {
         method: "POST",
         body: JSON.stringify({"templateName": templateName}),
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      const templateHTML = jsonResponse.template;

      author._templateLoaded(templateHTML);
      return templateHTML;
   }

   const prepareCaseHTML = async (caseName, author) => {
      const response = await fetch(serverAddress + "prepare-case-html", {
         method: "POST",
         body: JSON.stringify({"caseName": caseName}),
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      const status = jsonResponse.status;

      author._casePrepared(status);
      return status;
   }

   const saveKnotHTML = async (caseName, knotFile, knotHTML, author) => {
      const response = await fetch(serverAddress + "save-knot-html", {
         method: "POST",
         body: JSON.stringify({"caseName": caseName,
                               "knotFile": knotFile,
                               "knotHTML": knotHTML}),
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      const status = jsonResponse.status;

      author._knotSaved(status);
      return status;
   }

   const saveCaseScript = async (caseName, scriptFile, scriptJS, author) => {
      const response = await fetch(serverAddress + "save-case-script", {
         method: "POST",
         body: JSON.stringify({"caseName": caseName,
                               "scriptFile": scriptFile,
                               "scriptJS": scriptJS}),
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      const status = jsonResponse.status;

      author._scriptSaved(status);
      return status;
   }


//}

