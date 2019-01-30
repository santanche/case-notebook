import glob

class NotebookDM(object):
    
    DIR_CASES = "../cases/"
    DIR_SHARED = "../shared/"
    DIR_TEMPLATES = "../templates/"
    DIR_AUTHOR = "../author/"
    FILE_CASE = "case.md"
    
    def casesList(self):
        directories = glob.glob(NotebookDM.DIR_CASES + "*/")
        directories = [d.replace("\\", "/") for d in directories]  # adaptation for Windows
        directories = [d.replace(NotebookDM.DIR_CASES, "") for d in directories]
        return [d.replace("/", "") for d in directories]
    
    def loadCase(self, caseName):
        caseDir = NotebookDM.DIR_CASES + caseName + "/"
        
        # build an author images directory combining cases and shared images
        shutil.rmtree(NotebookDM.DIR_AUTHOR + "images")
        shutil.copytree(caseDir + "images", NotebookDM.DIR_AUTHOR + "images")
        shutil.copy2(NotebookDM.DIR_SHARED + "images/*", NotebookDM.DIR_AUTHOR + "images")
        
        # retrieve the case file
        caseMd = open(NotebookDM.DIR_CASES + caseName + "/" + NotebookDM.FILE_CASE, "r", encoding="utf-8")
        caseText = caseMd.read()
        caseMd.close()
        
        return caseText
    
    def loadTemplate(self, templateName):
        templateFile = open(NotebookDM.DIR_TEMPLATES + templateName + ".html", "r", encoding="utf-8")
        templateHTML = templateFile.read()
        templateFile.close()
        return templateHTML
    
    def interfaceMain(self, caseName):  # title, description, image, firstKnot
        caseDir = NotebookDM.DIR_CASES + caseName + "/"
        
        # remake the generated HTML case directory
        shutil.rmtree(caseDir + "html")
        os.mkdir(caseDir + "html")
        
        # copy template styles and scripts to the case
        dirs = ["css", "js"]
        for d in dirs:
           shutil.copytree(NotebookDM.DIR_TEMPLATES + d, caseDir + d)
        
        # copy case-specific and shared images to the case 
        shutil.copytree(caseDir + "images", caseDir + "html/images")
        shutil.copy2(NotebookDM.DIR_SHARED + "images/*", caseDir + "html/images")
        
        # copy general case start files to the case directory
        files = ["index", "signin", "register", "report"]
        for f in files:
            # cls.interfaceKnot(f, f, "", "", "")
            shutil.copy2((NotebookDM.DIR_TEMPLATES + "{}.html").format(f), (caseDir + "html/{}.html").format(f))

        # indexTemplate = open("template/casesindex.html", "r", encoding="utf-8")
        # indexResult = open("html/casesindex.html", "w", encoding="utf-8")
        # indexResult.write(
        #     indexTemplate.read().format(title=title, description=description, image=image, firstKnot=firstKnot))
        # indexTemplate.close()
        # indexResult.close()