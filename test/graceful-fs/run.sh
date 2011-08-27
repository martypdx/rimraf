#!/bin/bash
rimraf="oo-rimraf"
target="target"
for i in test-*-pass.js; do
    echo -n $i ...
    touch $target
    node $i $rimraf $target
    if [ -f $target ]
    then
        echo 'failed: target file should not exist!'
        rm $target
    fi
    
done

for i in test-*-fail.js; do
    echo -n $i ...
    touch $target
    node $i $rimraf $target
    if [ ! -f $target ]
    then
        echo 'failed: file should still exist!'
    else
        rm $target
    fi
done
