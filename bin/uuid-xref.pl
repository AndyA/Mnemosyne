#!/usr/bin/env perl

use v5.10;

use autodie;
use strict;
use warnings;

use Dancer ':script';
use Dancer::Plugin::Database;

use List::Flatten;
use JSON ();

use constant IGNORE => qw(
 mnemosyne_broadcast
 mnemosyne_episode
 mnemosyne_listings_v2_noncomplied
 mnemosyne_pips_day
 mnemosyne_pips_id_map
 mnemosyne_pips_master_brand
 mnemosyne_pips_service
 mnemosyne_programmes_v2_noncomplied
 labs_uuid_map
 labs_uuid_xref
);

$| = 1;

run_script( database,
  "-- DROP labs_uuid_xref_raw",
  "DROP TABLE IF EXISTS `labs_uuid_xref_raw`",

  "-- CREATE labs_uuid_xref_raw",
  [ "CREATE TABLE `labs_uuid_xref_raw` (",
    "  `uuid` varchar(36) NOT NULL COMMENT 'Unique object identifier',",
    "  `found_in` VARCHAR(80) NOT NULL COMMENT 'table.field where found'",
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8"
  ]
);

xref( database, 'labs_uuid_xref_raw', IGNORE );

run_script( database,
  "-- DROP labs_uuid_xref",
  "DROP TABLE IF EXISTS `labs_uuid_xref`",

  "-- CREATE labs_uuid_xref",
  [ "CREATE TABLE `labs_uuid_xref` (",
    "  `uuid` varchar(36) NOT NULL COMMENT 'Unique object identifier',",
    "  `found_in` VARCHAR(80) NOT NULL COMMENT 'table.field where found',",
    "  `count` INT(10) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'cardinality', ",
    "  PRIMARY KEY (`uuid`, `found_in`),",
    "  KEY `uuid` (`uuid`)",
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8"
  ],

  "-- POPULATE labs_uuid_xref",
  [ "INSERT INTO `labs_uuid_xref`",
    "  SELECT `uuid`, `found_in`, COUNT(*) AS `count`",
    "    FROM `labs_uuid_xref_raw`",
    "   GROUP BY `uuid`, `found_in`"
  ]
);

run_script( database,
  "-- DROP labs_uuid_map",
  "DROP TABLE IF EXISTS `labs_uuid_map`",

  "-- CREATE labs_uuid_map",
  [ "CREATE TABLE `labs_uuid_map` AS",
    "  SELECT `q`.*, COUNT(*) AS `count`",
    "    FROM (",
    "      SELECT GROUP_CONCAT(`found_in` ORDER BY `found_in`) AS `fields`",
    "        FROM `labs_uuid_xref`",
    "       GROUP BY `uuid`) AS `q`",
    "  GROUP BY `fields`"
  ]
);

sub xref {
  my ( $dbh, $xref_table, @ignore ) = @_;
  my %ignore = map { $_ => 1 } $xref_table, @ignore;
  #  $dbh->do("TRUNCATE `$xref_table`");
  my @tables = grep { !$ignore{$_} } find_tables(database);
  for my $tbl (@tables) {
    say "Scanning $tbl";
    scan_table( $dbh, $xref_table, $tbl );
  }
}

sub run_script {
  my ( $dbh, @sql ) = @_;
  for my $sql (@sql) {
    if ( !ref $sql && $sql =~ /^--/ ) {
      say $sql;
      next;
    }
    $dbh->do( join( " ", flat $sql) );
  }
}

sub scan_table {
  my ( $dbh, $xref_table, $table ) = @_;

  my @queue = ();

  my $flush = sub {
    return unless @queue;
    my $sql = join ' ',
     "INSERT INTO `$xref_table` ( `uuid`, `found_in` ) VALUES ",
     join( ', ', ('(?, ?)') x @queue );
    $dbh->do( $sql, {}, map { @$_ } splice @queue );
  };

  my %required = map { $_ => 1 }
   map  { $_->{Field} }
   grep { $_->{Type} eq "varchar(36)" }
   @{ $dbh->selectall_arrayref( "DESCRIBE `$table`", { Slice => {} } ) };

  my $is_uuid = uuid_re();
  my %seen = map { ( "$table.$_" => 1 ) } keys %required;

  my ($total) = $dbh->selectrow_array("SELECT COUNT(*) FROM `$table`");
  my $done    = 0;
  my $last_pc = -1;

  my $sth = $dbh->prepare("SELECT * FROM `$table`");
  $sth->execute;
  while ( my $row = $sth->fetchrow_hashref ) {
    while ( my ( $col, $val ) = each %$row ) {
      next unless $required{$col} || ( defined $val && $val =~ $is_uuid );
      if ( !defined $val ) {
        $val = "(null)";
      }
      elsif ( $val !~ $is_uuid ) {
        $val = "(invalid)";
      }

      my $loc = "$table.$col";
      $seen{"+$loc"}++ unless $seen{$loc};
      push @queue, [$val, $loc];
      $flush->() if @queue >= 1000;
    }
    $done++;
    my $pc = int( $done * 1000 / $total );
    if ( $pc != $last_pc ) {
      printf "\r  %5.1f%% %s ", $pc / 10, join ', ', sort keys %seen;
      $last_pc = $pc;
    }
  }
  $flush->();
  say "\n  Scanned $done rows";
}

sub uuid_re {
  return qr{^ ([0-9a-f]{8}) -
              ([0-9a-f]{4}) -
              ([0-9a-f]{4}) -
              ([0-9a-f]{4}) -
              ([0-9a-f]{12}) $}xi;
}

sub find_tables {
  my $dbh = shift;
  return @{ $dbh->selectcol_arrayref('SHOW TABLES') };
}

# vim:ts=2:sw=2:sts=2:et:ft=perl

