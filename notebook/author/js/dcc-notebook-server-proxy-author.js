/**
 * Local component that worls as a proxy to the server functionalities
 */
const DCCNS_serverAddress = "http://127.0.0.1:8888/";

class DCCNotebookServer {
   async casesList() {
      const response = await fetch(DCCNS_serverAddress + "cases-list", {
         method: "POST",
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      const cases = jsonResponse.casesList;
      let finalCasesList = {};
      for (var c in cases)
         finalCasesList[cases[c]] = "icons/mono-slide.svg";
      return finalCasesList;
   }
   
   async loadCase(caseName) {
      const response = await fetch(DCCNS_serverAddress + "load-case", {
         method: "POST",
         body: JSON.stringify({"caseName": caseName}),
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      return jsonResponse.caseMd;
   }

   async saveCase(caseName, caseText) {
      const response = await fetch(DCCNS_serverAddress + "save-case", {
         method: "POST",
         body: JSON.stringify({"caseName": caseName,
                               "caseText": caseText}),
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      return jsonResponse.versionFile;
   }

   async loadTemplate(templateName) {
      const response = await fetch(DCCNS_serverAddress + "load-template", {
         method: "POST",
         body: JSON.stringify({"templateName": templateName}),
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      return jsonResponse.template;
   }

   async prepareCaseHTML(caseName) {
      const response = await fetch(DCCNS_serverAddress + "prepare-case-html", {
         method: "POST",
         body: JSON.stringify({"caseName": caseName}),
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      return jsonResponse.status;
   }

   async saveKnotHTML(caseName, knotFile, knotHTML) {
      const response = await fetch(DCCNS_serverAddress + "save-knot-html", {
         method: "POST",
         body: JSON.stringify({"caseName": caseName,
                               "knotFile": knotFile,
                               "knotHTML": knotHTML}),
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      return jsonResponse.status;
   }

   async saveCaseScript(caseName, scriptFile, scriptJS) {
      const response = await fetch(DCCNS_serverAddress + "save-case-script", {
         method: "POST",
         body: JSON.stringify({"caseName": caseName,
                               "scriptFile": scriptFile,
                               "scriptJS": scriptJS}),
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      return jsonResponse.status;
   }
}

