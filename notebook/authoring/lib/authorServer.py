import glob

class AuthorDM(object):
    
    CASES_DIR = "../cases/"
    CASE_FILE = "case.md"
    
    def casesList(self):
        directories = glob.glob(AuthorDM.CASES_DIR + "*/")
        directories = [d.replace(AuthorDM.CASES_DIR, "") for d in directories]
        return [d.replace("/", "") for d in directories]
    
    def loadCase(self, caseName):
        caseMd = open(AuthorDM.CASES_DIR + caseName + "/" + AuthorDM.CASE_FILE, "r", encoding="utf-8")
        caseText = caseMd.read()
        caseMd.close()
        return caseText