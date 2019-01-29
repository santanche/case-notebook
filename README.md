# case-notebook
A notebook for clinical cases.

Jupyter Classical [![Binder](https://mybinder.org/badge.svg)](https://mybinder.org/v2/gh/santanche/case-notebook/master)

Instructions to install Jupyter and Case Notebook in your machine:

# Linux Installation

## PIP3 installation
```
sudo apt-get update
sudo apt-get install python3-pip
```

## Jupyter installation
```
pip3 install jupyter
```

## Jupyter will be probably installed in the following directory
```
~/.local/
```

## Download the Git project in the suggested directory
```
~/git/case-notebook/
```

## Libraries installation
### SPARQLWrapper
```
pip3 install SPARQLWrapper
```
### Widgets
```
pip3 install ipywidgets
sudo ~/.local/bin/jupyter nbextension enable --py widgetsnbextension
```
### Kernel Gateway (for Python REST services)
```
pip3 install jupyter_kernel_gateway
```

## Case-Notebook extension installation
```
cp -r ~/git/case-notebook/nbextensions/notebook/case-notebook ~/.local/share/jupyter/nbextensions
sudo ~/.local/bin/jupyter nbextension install ~/.local/share/jupyter/nbextensions/case-notebook/
sudo ~/.local/bin/jupyter nbextension enable case-notebook/main
```

## Starting Jupyter
```
~/.local/bin/jupyter notebook
```

# Windows Installation

## Python and PIP3 instalation
Install latest version of [Python 3](https://www.python.org/). It comes with PIP3.
For python 3.7, it will be probably be installed in the following directory:
```
C:\Program Files\Python37
```

## Jupyter installation
Considering that Python is in your PATH (and consequently PIP3), open a terminal as admnistrator and type:
```
pip3 install jupyter
```

## Download the Git project in the suggested directory
```
/Users/<User>/git/case-notebook
```

## Libraries installation
Considering that Python is in your PATH (and consequently Jupyter), type the following commands to install the libraries:
### SPARQLWrapper
```
pip3 install SPARQLWrapper
```
### Widgets
```
pip3 install ipywidgets
sudo ~/.local/bin/jupyter nbextension enable --py widgetsnbextension
```
### Kernel Gateway (for Python REST services)
```
pip3 install jupyter_kernel_gateway
```

## Case-Notebook extension installation
```
xcopy C:\Users\<User>\git\case-notebook\notebook\nbextensions\* "C:\Program Files\Python37\share\jupyter\nbextensions" /s
jupyter nbextension install "C:\Program Files\Python37\share\jupyter\nbextensions\case-notebook"
jupyter nbextension enable "C:\Program Files\Python37\share\jupyter\nbextensions\case-notebook\main"
```

## Starting Jupyter
```
jupyter notebook
```
