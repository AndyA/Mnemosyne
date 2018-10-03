#!/bin/bash

out="TTH-Reports"

find "$out" -not -name "*-*" -name "*.txt" | while read fn; do
  bn="$( basename "$fn" ".txt" )"
  echo "$bn";
  node bin/report.js summary "${bn}*" > "$out/${bn}-summary.txt"
  node bin/report.js detail  "${bn}*" > "$out/${bn}.txt"
done

# vim:ts=2:sw=2:sts=2:et:ft=sh

