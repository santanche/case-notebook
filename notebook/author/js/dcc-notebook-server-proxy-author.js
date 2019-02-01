/**
 * 
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
      // selector.addSelectList(finalCasesList);
      return finalCasesList);
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
      // const caseMd = jsonResponse.caseMd;

      // author._caseLoaded(caseMd);
      return jsonResponse.caseMd;
   }
}

   const DCCNS_saveCase = async (caseName, caseText, author) => {
      const response = await fetch(DCCNS_serverAddress + "save-case", {
         method: "POST",
         body: JSON.stringify({"caseName": caseName,
                               "caseText": caseText}),
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      const versionFile = jsonResponse.versionFile;

      author._caseSaved(versionFile);
      return status;
   }

   const DCCNS_loadTemplate = async (templateName, author, source) => {
      const response = await fetch(DCCNS_serverAddress + "load-template", {
         method: "POST",
         body: JSON.stringify({"templateName": templateName}),
         headers:{
           "Content-Type": "application/json"
         }
      });
      const jsonResponse = await response.json();
      const templateHTML = jsonResponse.template;

      author._templateLoaded(templateName, templateHTML, source);
      return templateHTML;
   }

   const DCCNS_prepareCaseHTML = async (caseName, author) => {
      const response = await fetch(DCCNS_serverAddress + "prepare-case-html", {
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

   const DCCNS_saveKnotHTML = async (caseName, knotFile, knotHTML, author) => {
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
      const status = jsonResponse.status;

      author._knotCheck(knotFile);
      return status;
   }

   const DCCNS_saveCaseScript = async (caseName, scriptFile, scriptJS, author) => {
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
      const status = jsonResponse.status;

      author._scriptSaved(status);
      return status;
   }
   
// }

