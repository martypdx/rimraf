#!/bin/bash
set -e
for i in test-*.js; do
  echo -n $i ...
  bash setup.sh
  time node $i
  ! [ -d target ]
  echo "pass"
done
rm -rf target
