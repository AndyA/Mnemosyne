#!/usr/bin/env perl

use v5.10;

use autodie;
use strict;
use warnings;

use JSON ();

my @n    = ();
my @rows = ();
while (<>) {
  chomp;
  my @f = split /\t/;
  unless (@n) { @n = @f; next }
  my $row = {};
  @{$row}{@n} = @f;
  push @rows, $row;
}
say JSON->new->pretty->canonical->encode( \@rows );

# vim:ts=2:sw=2:sts=2:et:ft=perl

