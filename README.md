# case-notebook
A notebook for clinical cases.

Jupyter Classical [![Binder](https://mybinder.org/badge.svg)](https://mybinder.org/v2/gh/santanche/case-notebook/master)

Instructions to install Jupyter and Case Notebook in your machine:

# PIP3 installation
```
sudo apt-get update
sudo apt-get install python3-pip
```

# Jupyter installation
```
pip3 install jupyter
```

# Jupyter will be installed in the following directory
```
~/.local/
```

# Download the Git project in the following directory
```
~/git/case-notebook/
```

# Libraries installation
## SPARQLWrapper
```
pip3 install SPARQLWrapper
```
## Widgets
```
pip3 install ipywidgets
sudo ~/.local/bin/jupyter nbextension enable --py widgetsnbextension
```
## Kernel Gateway (for Python REST services)
```
pip3 install jupyter_kernel_gateway
```

# Case-Notebook extension installation
```
cp -r ~/git/case-notebook/nbextensions/case-notebook ~/.local/share/jupyter/nbextensions
sudo ~/.local/bin/jupyter nbextension install ~/.local/share/jupyter/nbextensions/case-notebook/
sudo ~/.local/bin/jupyter nbextension enable case-notebook/main
```

# Starting Jupyter
```
~/.local/bin/jupyter notebook
```
