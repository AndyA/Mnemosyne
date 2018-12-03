#!/bin/bash

out="TTH-Reports"

function freshen {
  local bn=$1
  echo "$bn"
  node bin/report.js summary "${bn}*" > "$out/${bn}-summary.txt"
  node bin/report.js detail  "${bn}*" > "$out/${bn}.txt"
}

for new in "$@"; do
  touch "$out/$new.txt"
done

find "$out" -not -name "*-*" -name "*.txt" | while read fn; do
  bn="$( basename "$fn" ".txt" )"
  freshen "$bn"
done

rsync -avP TTH-Reports pringle:/Users/smoo/Dropbox/Warez/

# vim:ts=2:sw=2:sts=2:et:ft=sh

