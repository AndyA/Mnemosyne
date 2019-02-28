#!/bin/bash

out="TTH-Reports"

function freshen {
  local bn=$1
  echo "$bn"
  node bin/report.js summary "${bn}*" > "$out/${bn}-summary.csv"
  node bin/report.js detail  "${bn}*" > "$out/${bn}.csv"
}

for new in "$@"; do
  touch "$out/$new.csv"
done

find "$out" -not -name "*-*" -name "*.csv" | while read fn; do
  bn="$( basename "$fn" ".csv" )"
  freshen "$bn"
done

# vim:ts=2:sw=2:sts=2:et:ft=sh
