# Parallel Coordinates Data Visualization for NECB-2011 QAQC simulations
Creates a parallel coordinate plot for QAQC simulation data

Full Preview: https://canmet-energy.github.io/parallel-coordinates

The data is obtained from simulations.json which is produced by btap_results_extractor

### Requirements
  + NodeJS
Install NodeJS from [nodejs download page](https://nodejs.org/en/download/)

To see if Node is installed, open the terminal and type `node -v`. This should print a version number.

Navigate to the root of the directory and run `cd src && npm install` to install the dependencies.

# Running the Server
Navigate to `src` folder and run the following code in the terminal to start the server

```bash
node server.js
```

Next go to `http://localhost:8080/` to access the Parallel coordinate plot

# Running the Server with Docker

Navigate to current directory, and run

```bash
docker build -t nodeserver .
```

execute the following command to run the dockerized server

```
docker run -it -d -p 8080:8080 -v `pwd`:/dataviz --restart=always nodeserver
```

Next use your browser and go to `http://localhost:8080/` to access the Parallel coordinate plot


## WARNINGS

Make sure the file path of this repository does not contain any spaces.
