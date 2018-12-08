import ipywidgets as widgets
from SPARQLWrapper import SPARQLWrapper, JSON

class HealthDM(object):
    profile = None
    profilePresent = None
    profileAbsent = None
    
    sparqlQuery = """
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX meshv: <http://id.nlm.nih.gov/mesh/vocab#>
PREFIX mesh: <http://id.nlm.nih.gov/mesh/>
PREFIX mesh2015: <http://id.nlm.nih.gov/mesh/2015/>
PREFIX mesh2016: <http://id.nlm.nih.gov/mesh/2016/>
PREFIX mesh2017: <http://id.nlm.nih.gov/mesh/2017/>
PREFIX mesh2018: <http://id.nlm.nih.gov/mesh/2018/>

SELECT ?d
FROM <http://id.nlm.nih.gov/mesh>
WHERE {{
    ?d a meshv:Term .
    {{?d meshv:prefLabel ?l
     FILTER (lcase(str(?l)) = lcase('{0}'))}}
    UNION
    {{?d meshv:altLabel ?l
     FILTER (lcase(str(?l)) = lcase('{0}'))}}
}}
ORDER BY ?d
"""
    
    # @classmethod
    # def setProfile(cls, profile):
    #     cls.profile = profile
    
    @classmethod
    def createProfile(cls):
        cls.profile = widgets.Accordion(children=[])
        return cls.profile
        
    @classmethod
    def clearTerms(cls):
        cls.profilePresent = widgets.Accordion(children=[])
        cls.profileAbsent = widgets.Accordion(children=[])
        cls.profile.children = tuple([cls.profilePresent, cls.profileAbsent])
        cls.profile.set_title(0, "Sign Present")
        cls.profile.set_title(1, "Sign Absent")

    @classmethod
    def addTerm(cls, heading, description, code, present, detail1, rate1, detail2, rate2):
        wprofile = [widgets.Text(description = "MeSH Term:", value = heading),
                    widgets.Text(description = "MeSH Code:", value = code)]
        if detail1 != "#":
            fDetail = cls.formatDetail(detail1, rate1)
            wprofile.append(widgets.Text(description = fDetail[0], value = fDetail[1]))
        if detail2 != "#":
            fDetail = cls.formatDetail(detail2, rate2)
            wprofile.append(widgets.Text(description = fDetail[0], value = fDetail[1]))
        wcontent = widgets.VBox(wprofile)
        profileList = cls.profilePresent if present else cls.profileAbsent
        profileList.children = tuple(list(profileList.children) + [wcontent])
        profileList.set_title(len(profileList.children)-1, description)
        
    @classmethod
    def formatDetail(cls, detail, rate):
        detailDesc = "Detail:"
        detailValue = detail
        if detail in ["occasionally", "often", "frequently", "sometimes",
                      "rarely", "daily", "monthly", "yearly", "each day",
                      "each month", "each year", "once a day", "once a month",
                      "once a year"]:
            detailDesc = "Frequency:"
        else:
            try:
                value = int(detail)
                detailDesc = "Intensity:"
                if rate != "#":
                    detailDesc = "Frequency:"
                    detailValue = detailValue + " / " + rate
            except ValueError:
                pass
        return [detailDesc, detailValue]

    @classmethod
    def findMeshCode(cls, heading, detail1, rate1, description, detail2, rate2):
        code = "none"
        present = True
        meshHeading = heading
        
        sparql = SPARQLWrapper("http://id.nlm.nih.gov/mesh/sparql")
        sparql.setReturnFormat(JSON)

        # looking for the heading
        sparql.setQuery(cls.sparqlQuery.format(meshHeading))
        results = sparql.query().convert()
        if len(results["results"]["bindings"]) > 0:
            code = results["results"]["bindings"][0]["d"]["value"]

        if code == "none" and (heading.lower().startswith("no") or
                               heading.lower().startswith("not")):
            # looking for the heading
            present = False
            meshHeading = heading[3:] if heading.lower().startswith("no") else heading[4:]
            sparql.setQuery(cls.sparqlQuery.format(meshHeading))
            results = sparql.query().convert()
            if len(results["results"]["bindings"]) > 0:
                code = results["results"]["bindings"][0]["d"]["value"]
            
        cls.addTerm(meshHeading, description, code, present, detail1, rate1, detail2, rate2)
    
        return "#mesh_heading#" + heading + "#tree_number#" + code
    
    @classmethod
    def interfacePresentation(cls, title, description, template):
        indexTemplate = open("template/index.html", "r", encoding="utf-8")
        presentationTemplate = open("template/presentation.html", "r", encoding="utf-8")

        indexResult = open("html/index.html", "w", encoding="utf-8")
        presentationResult = open("html/Presentation.html", "w", encoding="utf-8")
        
        indexResult.write(indexTemplate.read().format(title=title, description=description))
        presentationResult.write(presentationTemplate.read().format(title=title, description=description))

        indexResult.close()
        presentationResult.close()

    @classmethod
    def interfaceKnot(cls, htmlName, title, description, template):
        knotTemplate = open("template/" + template + ".html", "r", encoding="utf-8")

        knotResult = open("html/" + htmlName + ".html", "w", encoding="utf-8")
        
        knotResult.write(knotTemplate.read().format(title=title, description=description))

        knotResult.close()