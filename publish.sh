#!/bin/bash

git checkout master && apm publish $0 && git checkout dev

exit
