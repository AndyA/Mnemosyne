#!/usr/bin/env perl

use v5.10;

use autodie;
use strict;
use warnings;

use Dancer ':script';
use Dancer::Plugin::Database;

use constant XREF_TABLE => 'labs_uuid_xref';
use constant IGNORE     => qw(
 mnemosyne_listings_v2_noncomplied
 mnemosyne_programmes_v2_noncomplied
 labs_uuid_map
);

$| = 1;

xref( database, XREF_TABLE, IGNORE );
make_map(database);

sub xref {
  my ( $dbh, $xref_table, @ignore ) = @_;
  my %ignore = map { $_ => 1 } $xref_table, @ignore;
  $dbh->do("TRUNCATE `$xref_table`");
  my @tables = grep { !$ignore{$_} } find_tables(database);
  for my $tbl (@tables) {
    say "Scanning $tbl";
    scan_table( $dbh, $xref_table, $tbl );
  }
}

sub make_map {
  my $dbh = shift;
  say "Making labs_uuid_map";
  $dbh->do("DROP TABLE labs_uuid_map");
  $dbh->do(
    join( " ",
      "CREATE TABLE labs_uuid_map AS",
      "  SELECT q.*, COUNT(*) AS count",
      "    FROM (",
      "      SELECT GROUP_CONCAT(found_in ORDER BY found_in) AS `fields`",
      "        FROM labs_uuid_xref",
      "       GROUP BY uuid) AS q",
      "  GROUP BY fields" )
  );

}

=for ref

=cut

sub scan_table {
  my ( $dbh, $xref_table, $table ) = @_;

  my @queue = ();

  my $flush = sub {
    return unless @queue;
    my $sql = join ' ',
     "INSERT INTO `$xref_table` ( `uuid`, `found_in` ) VALUES ",
     join( ', ', ('(?, ?)') x @queue ),
     'ON DUPLICATE KEY UPDATE `count` = `count` + 1';
    $dbh->do( $sql, {}, map { @$_ } splice @queue );
  };

  my $is_uuid = uuid_re();
  my %seen    = ();

  my ($total) = $dbh->selectrow_array("SELECT COUNT(*) FROM `$table`");
  my $done    = 0;
  my $last_pc = -1;

  my $sth = $dbh->prepare("SELECT * FROM `$table`");
  $sth->execute;
  while ( my $row = $sth->fetchrow_hashref ) {
    while ( my ( $col, $val ) = each %$row ) {
      next unless defined $val && $val =~ $is_uuid;
      my $loc = "$table.$col";
      $seen{$loc}++;
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

