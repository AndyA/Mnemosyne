#!/bin/bash

set -e

out="TTH-Reports"

freshen() {
  local bn=$1
  echo "$bn"
  node bin/report.js summary "${bn}*" > "$out/${bn}-summary.csv"
  node bin/report.js detail  "${bn}*" > "$out/${bn}.csv"
}

cleanup() {
  rm -f .no-cron
}

banner() {
  local msg="$@"

  local bar=$( echo "$msg" | sed -e 's/./#/g' )
  local pad=$( echo "$msg" | sed -e 's/./ /g' )

  echo
  echo "###$bar###"
  echo "#  $pad  #"
  echo "#  $msg  #"
  echo "#  $pad  #"
  echo "###$bar###"
  echo
}

trap cleanup EXIT

# Update from live databases
banner "Loading database backups"
perl bin/get-backups.pl

# Scan all dbs
banner "Scanning local databases"
touch .no-cron
node bin/local-scan.js
rm -f .no-cron

# Make empty files for any new reports
for new in "$@"; do
  touch "$out/$new.csv"
done

# Make reports
banner "Making reports"
find "$out" -not -name "*-*" -name "*.csv" | while read fn; do
  bn="$( basename "$fn" ".csv" )"
  freshen "$bn"
done

# vim:ts=2:sw=2:sts=2:et:ft=sh
