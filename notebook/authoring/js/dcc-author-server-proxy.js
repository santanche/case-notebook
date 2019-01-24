/**
 * 
 */
//class DCCAuthorServer {
   const casesList = async (selector) => {
      const response = await fetch("http://127.0.0.1:8888/cases-list", {
         method: "POST",
         headers:{
           "Content-Type": "application/json"
         }
      });
      const cases = await response.json();
      selector.addSelectList(cases);
      return cases;
   }
//}

