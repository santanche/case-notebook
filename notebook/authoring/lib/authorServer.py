import glob

class AuthorDM(object):
    def caseList(self):
        return glob.glob("cases/*.md")