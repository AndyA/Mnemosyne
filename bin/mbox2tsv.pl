#!/usr/bin/env perl

use v5.10;

use autodie;
use strict;
use warnings;

use DateTime::Format::Mail;
use Email::Folder;
use JSON ();

my @field = qw( Date From To Subject );
say join "\t", @field;
for my $mbox (@ARGV) {
  my $folder = Email::Folder->new($mbox);
  while ( my $msg = $folder->next_message ) {
    my ( $date, @fv ) = map {
      join ", ",
       map { tidy($_) }
       $msg->header($_)
    } @field;
    say join "\t", format_date($date), @fv;
  }
}

sub format_date {
  my $date = shift;
  $date =~ s/\s*\(\w+\)$//;
  return DateTime::Format::Mail->parse_datetime($date)->strftime("%Y-%m-%d %H:%M:%S");
}

sub tidy {
  s/^\s+//, s/\s+$//, s/\s+/ /g for ( my $s = $_[0] );
  return $s;
}

# vim:ts=2:sw=2:sts=2:et:ft=perl

