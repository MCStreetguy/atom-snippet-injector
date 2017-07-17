#!/bin/bash

git checkout origin master
apm publish "$0"
git checkout origin dev

exit
