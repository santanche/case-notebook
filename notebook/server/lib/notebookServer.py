import glob

class AuthorDM(object):
    
    CASES_DIR = "../cases/"
    CASES_DIR_WINDOWS = "../cases\\"
    CASE_FILE = "case.md"
    TEMPLATES_DIR = "../templates/"
    
    def casesList(self):
        directories = glob.glob(AuthorDM.CASES_DIR + "*/")
        directories = [d.replace(AuthorDM.CASES_DIR, "") for d in directories]
        directories = [d.replace(AuthorDM.CASES_DIR_WINDOWS, "") for d in directories]
        directories = [d.replace("/", "") for d in directories]
        return [d.replace("\\", "") for d in directories]
    
    def loadCase(self, caseName):
        caseMd = open(AuthorDM.CASES_DIR + caseName + "/" + AuthorDM.CASE_FILE, "r", encoding="utf-8")
        caseText = caseMd.read()
        caseMd.close()
        return caseText
    
    def loadTemplate(self, templateName):
        templateFile = open(AuthorDM.TEMPLATES_DIR + templateName + ".html", "r", encoding="utf-8")
        templateHTML = templateFile.read()
        templateFile.close()
        return templateHTML
        