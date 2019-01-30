# # Notebook Server
It uses the Jupyter Kernel Gateway: https://test-jupyterkernelgateway.readthedocs.io/en/latest/index.html

# Turn any Jupyter notebook into a REST API

Adapted to POST from the tutorial of Eliot Andres:
https://ndres.me/post/jupyter-notebook-rest-api/

To start the server run in the terminal:
## Linux
~~~~
~/.local/bin/jupyter kernelgateway --KernelGatewayApp.api='kernel_gateway.notebook_http' --KernelGatewayApp.seed_uri='~/git/case-notebook/notebook/authoring/author-server.ipynb' --KernelGatewayApp.allow_origin='*' --KernelGatewayApp.allow_methods='POST, GET, OPTIONS' --KernelGatewayApp.allow_headers='Content-Type'
~~~~
## Windows
~~~~
jupyter kernelgateway --KernelGatewayApp.api='kernel_gateway.notebook_http' --KernelGatewayApp.seed_uri='/Users/<User>/git/case-notebook/notebook/authoring/author-server.ipynb' --KernelGatewayApp.allow_origin='*' --KernelGatewayApp.allow_methods='POST, GET, OPTIONS' --KernelGatewayApp.allow_headers='Content-Type'
~~~~

* `--KernelGatewayApp.allow_origin='*'` -> accepts all origins (better restrict in the future)
* `--KernelGatewayApp.allow_methods='POST, GET, OPTIONS'` -> accepted types of request
* `--KernelGatewayApp.allow_headers='Content-Type'` -> things that can appear in the header

Details at:

* Jupyter Kernel Gateway configuration: https://test-jupyterkernelgateway.readthedocs.io/en/latest/config-options.html
