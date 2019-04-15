#!/bin/bash

here="$PWD"
rm -rf "$here/ignore"

find /opt -mindepth 3 -maxdepth 3 -name 'wp-config.php' | while read wpc; do
  dir="$(dirname "$(dirname "$wpc")")"
  [[ $dir == "/opt/mnemosyne" ]] && continue
  pushd "$dir" > /dev/null
  find . -name .gitignore | while read gi; do 
    sd="$here/ignore/$gi"
    mkdir -p "$(dirname "$sd")"
    touch "$sd"
    echo "$gi $sd"
    sort -u "$gi" "$sd" > "$sd.tmp" && mv "$sd.tmp" "$sd"
  done
  popd > /dev/null
done

# vim:ts=2:sw=2:sts=2:et:ft=sh

