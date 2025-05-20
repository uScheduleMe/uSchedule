#!/bin/bash

# This script is intended to be used as an entrypoint for the container to run setup tasks needed to prepare
#   the environment for normal use (it is run from the perspective of the container)

# Function to search for and install local pip packages
local_pip_install(){
    python3 -m pip install -e $1
    local err=$?
    if ! [ $err ] ; then
        echo "Could not install local python package: $1" >&2
    fi
    return $err
}
local_pip_search_install(){
    local pkg="$1"
    local err=0
    if  python3 -m pip show $pkg >>/dev/null 2>&1 ; then
        echo "Local python package $pkg already installed." >&2
    else
        ( test -d "/opt/$pkg/" && local_pip_install "/opt/$pkg/" ) || ( test -d "./$pkg/" && local_pip_install "./$pkg/" )
        err=$?
    fi
    return $err
}

# Make sure notifier and updater are installed
for pkg in notifier updater
do
    local_pip_search_install $pkg
done

# Unset local variables
unset -f local_pip_install
unset -f local_pip_search_install
unset pkg

exec "$@"
