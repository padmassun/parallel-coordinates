#!/bin/bash

echo "cd /dataviz/src"
cd "/dataviz/src"

echo "npm install"
npm install

echo "cd /dataviz/data"

cd "/dataviz/data"

echo "Cloning baselines"
git clone https://github.com/canmet-energy/necb-2011-baselines.git baselines
cd "./baselines" && ./init.sh && cd ..

echo "Cloning ecms"
git clone https://github.com/canmet-energy/necb-2011-ecms.git ecms
cd "./ecms" && ./init.sh && cd ..


cd "/dataviz/src"

echo "node server.js"
node server.js
