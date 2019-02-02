from casemanager.casehandler import CaseHandler
from flask import Flask, request
import os 
import dotenv  
import pathlib 
import json
import sys


app = Flask(__name__)

caseHandler = CaseHandler()


@app.route('/')
def index():
    return 'Hello from the CaseManager!'



@app.route('/cases-list', methods=['POST'])
def cases_list():
    print(json.dumps({'casesList': caseHandler.casesList()}))
    return json.dumps({'casesList': caseHandler.casesList()}) 



@app.route('/load-case', methods=['POST'])
def load_case():
    caseName = request.get_json()['caseName']
    return json.dumps({'caseMd': caseHandler.loadCase(caseName)}) 



@app.route('/save-case', methods=['POST'])
def save_case():
    return ''



@app.route('/load-case', methods=['POST'])
def load_template():
    return ''



@app.route('/prepare-case-html', methods=['POST'])
def prepare_case_html():
    return ''



@app.route('/save-knot-html', methods=['POST'])
def save_knot_html():
    return ''



@app.route('/save-case-script', methods=['POST'])
def save_case_script(): 
    return ''



if __name__ == '__main__':
    app.run(host=os.getenv("FLASK_HOST"), port=os.getenv("FLASK_PORT"),debug=bool(os.getenv("FLASK_DEBUG") == 'True'))
