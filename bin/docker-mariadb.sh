#!/bin/bash

docker run                                      \
  --name wp-mysql                               \
  -p 3307:3306                                  \
  -e MYSQL_ALLOW_EMPTY_PASSWORD=yes             \
  -e MYSQL_ROOT_PASSWORD=                       \
  -v /db/wp-mysql/etc/conf.d:/etc/mysql/conf.d  \
  -v /db/wp-mysql/var:/var/lib/mysql            \
  -d mariadb:latest

# vim:ts=2:sw=2:sts=2:et:ft=sh

