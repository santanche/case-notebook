import glob
import shutil
import os
import uuid
import datetime

class CaseHandler(object):
    
   DIR_CASES  = "../resources/datasets/cases/"
   DIR_SHARED = "../resources/shared/"
   DIR_TEMPLATES = "../templates/"
   DIR_DCCS = "../dccs/components/"
   DIR_AUTHOR = "../author/"
   FILE_CASE_NAME = "case"
   FILE_CASE_EXTENSION = ".md"
   FILE_CASE = FILE_CASE_NAME + FILE_CASE_EXTENSION
   FILE_PLAYER_TEMPLATE = "player.html";
    
   def casesList(self):
       directories = glob.glob(self.DIR_CASES + "*/")
       print(directories)
       directories = [d.replace("\\", "/") for d in directories]  # adaptation for Windows
       directories = [d.replace(self.DIR_CASES, "") for d in directories]
       return [d.replace("/", "") for d in directories]
    
   def loadCase(self, caseName):
       caseDir = self.DIR_CASES + caseName + "/"
       
       # build an author images directory combining cases and shared images
       authorImages = self.DIR_AUTHOR + "images"
       if os.path.isdir(authorImages):
          shutil.rmtree(authorImages)
       shutil.copytree(caseDir + "images", authorImages)
       for fi in glob.glob(self.DIR_SHARED + "images/*"):
          shutil.copy2(fi, authorImages)
       
       # retrieve the case file
       caseMd = open(self.DIR_CASES + caseName + "/" + self.FILE_CASE, "r", encoding="utf-8")
       caseText = caseMd.read()
       caseMd.close()
       
       return caseText
    
   def saveCase(self, caseName, content):
      caseDir = self.DIR_CASES + caseName + "/"
      caseFile = caseDir + self.FILE_CASE
      versionsDir = caseDir + "version/"
      
      # copy a version of the previous file
      versionFile = "new file"
      if os.path.isfile(caseFile):
         if not os.path.isdir(versionsDir):
           os.mkdir(versionsDir)
         versionFile = self.FILE_CASE_NAME + \
                       datetime.datetime.now().strftime("_%Y-%m-%d-%H-%M-%S_") + \
                       str(uuid.uuid1()) + self.FILE_CASE_EXTENSION
         shutil.copy2(caseFile, versionsDir + versionFile)
         
      # write the new case
      self.saveFile(caseFile, content)
      
      return versionFile
        
   def loadTemplate(self, templateName):
        templateFile = open(self.DIR_TEMPLATES + templateName + ".html", "r", encoding="utf-8")
        templateHTML = templateFile.read()
        templateFile.close()
        return templateHTML
    
   def prepareCaseHTML(self, caseName):
      caseDir = self.DIR_CASES + caseName + "/"
      
      # remake the generated HTML case directory
      if os.path.isdir(caseDir + "html"):
         shutil.rmtree(caseDir + "html")
      os.mkdir(caseDir + "html")
      
      # copy template styles and scripts to the case
      dirs = ["css", "js"]
      for d in dirs:
         shutil.copytree(self.DIR_TEMPLATES + d, caseDir + "html/" + d)
         
      # copy DCCs to the case
      shutil.copytree(self.DIR_DCCS, caseDir + "html/js/dccs")
      
      # copy case-specific and shared images to the case 
      shutil.copytree(caseDir + "images", caseDir + "html/images")
      for fi in glob.glob(self.DIR_SHARED + "images/*"):
         shutil.copy2(fi, caseDir + "html/images")
      
      # copy general case start files to the case directory
      playerTemplateFile = open(
         self.DIR_TEMPLATES + self.FILE_PLAYER_TEMPLATE, "r", encoding="utf-8")
      playerTemplate = playerTemplateFile.read();
      playerTemplateFile.close()
      files = ["index", "signin", "register", "report"]
      for f in files:
         htmlSourceFile = open((self.DIR_TEMPLATES + "{}.html").format(f), "r", encoding="utf-8")
         htmlTargetFile = open((caseDir + "html/{}.html").format(f), "w", encoding="utf-8")
         htmlTargetFile.write(playerTemplate.format(knot = htmlSourceFile.read()))
         htmlSourceFile.close()
         htmlTargetFile.close()
         # cls.interfaceKnot(f, f, "", "", "")
         # shutil.copy2((self.DIR_TEMPLATES + "{}.html").format(f), (caseDir + "html/{}.html").format(f))
   
      # indexTemplate = open("template/casesindex.html", "r", encoding="utf-8")
      # indexResult = open("html/casesindex.html", "w", encoding="utf-8")
      # indexResult.write(
      #     indexTemplate.read().format(title=title, description=description, image=image, firstKnot=firstKnot))
      # indexTemplate.close()
      # indexResult.close()
        
   def saveKnotHTML(self, caseName, htmlName, content):
      self.saveFile(self.DIR_CASES + caseName + "/html/" + htmlName, content)
      
   def saveCaseScript(self, caseName, scriptName, content):
      self.saveFile(self.DIR_CASES + caseName + "/html/js/" + scriptName, content)
      
   def saveFile(self, filePath, content):
      knotFile = open(filePath, "w", encoding="utf-8")
      knotFile.write(content)
      knotFile.close()
