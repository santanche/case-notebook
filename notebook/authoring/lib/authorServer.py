import glob

class AuthorDM(object):
    
    CASES_DIR = "../cases/"
    
    def caseList(self):
        directories = glob.glob(AuthorDM.CASES_DIR + "*/")
        directories = [d.replace(AuthorDM.CASES_DIR, "") for d in directories]
        return [d.replace("/", "") for d in directories]