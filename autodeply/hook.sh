#!/bin/bash

# First, get the zip file
cd /home/pi/autodeploy/zips && wget -O pibot-master.zip -q https://github.com/corygrunk/pibot/archive/master.zip

# Second, unzip it, if the zip file exists
if [ -f /home/pi/autodeploy/zips/pibot-master.zip ]; then
    # Unzip the zip file
    unzip -q /home/pi/autodeploy/zips/pibot-master.zip

    # Delete zip file
    rm /home/pi/autodeploy/zips/pibot-master.zip

    # Rename project directory to desired name
    mv pibot-master pibot

    # Delete current directory
    rm -rf /home/pi/pibot

    # Replace with new files
    mv pibot /home/pi/pibot

    # Install
    npm install

    # Start
    /etc/init.d/pibot start

    # Perhaps call any other scripts you need to rebuild assets here
    # or set owner/permissions
    # or confirm that the old site was replaced correctly
fi
