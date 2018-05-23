#!/usr/bin/env perl

use v5.10;

use autodie;
use strict;
use warnings;

use DBI;
use DateTime::Format::MySQL;
use DateTime;
use JSON ();
use List::Util qw( max );
use Socket;

use constant HOST      => "emit";
use constant HOME_HOST => "pike.dyn.hexten.net";

my $CONN = {
  host     => HOST,
  database => "activity_log",
  user     => "root",
  pass     => "",
};

my $dbh = dbh($CONN);

my $now = DateTime->now;

my @columns = map { $_->{Field} }
 @{ $dbh->selectall_arrayref( "DESCRIBE `activity`", { Slice => {} } ) };

$dbh->do(
  "INSERT INTO `batch` (`when`, `home_ip`) VALUES (?, ?)",
  {},
  DateTime::Format::MySQL->format_datetime($now),
  join( ",", resolve_host(HOME_HOST) )
);
my $batch_id = $dbh->last_insert_id( undef, undef, undef, undef );

my @db = @{ $dbh->selectcol_arrayref("SHOW DATABASES") };
for my $db (@db) {
  my @pfx = get_wp_prefix( $dbh, $db, "aryo_activity_log" );
  for my $pfx (@pfx) {
    my $log = tail_log( $dbh, $batch_id, HOST, $db, $pfx );
    next unless @$log;
    my $ph = join ", ", map "?", @columns;
    $dbh->do(
      join( " ",
        "INSERT INTO `activity` (",
        join( ", ", map "`$_`", @columns ),
        ") VALUES ",
        join( ", ", map "($ph)", @$log ) ),
      {},
      map { @{$_}{@columns} } @$log
    );
  }
}

sub tail_log {
  my ( $dbh, $batch_id, $host, $db, $pfx ) = @_;
  my $t_aal   = "${pfx}aryo_activity_log";
  my $t_users = "${pfx}users";

  my @term = ("`aal`.`user_id` = `u`.`ID`");
  my @bind = ();

  my ($hwm) = $dbh->selectrow_array(
    join( " ",
      "SELECT `histid` FROM `activity_hwm`",
      " WHERE `host` = ?",
      "   AND `database` = ?",
      "   AND `table` = ?" ),
    {},
    $host, $db, $t_aal
  );

  if ( defined $hwm ) {
    push @term, "`aal`.`histid` > ?";
    push @bind, $hwm;
  }

  my $rows = $dbh->selectall_arrayref(
    join( " ",
      "SELECT * FROM `$db`.`$t_aal` AS `aal`, `$db`.`$t_users` AS `u` WHERE",
      join( " AND ", @term ) ),
    { Slice => {} },
    @bind
  );

  return [] unless @$rows;

  my $new_hwm = max( map { $_->{histid} } @$rows );
  $dbh->do(
    "REPLACE INTO `activity_hwm` (`host`, `database`, `table`, `histid`) VALUES (?, ?, ?, ?)",
    {}, $host, $db, $t_aal, $new_hwm
  );

  for my $row (@$rows) {
    my $when = DateTime->from_epoch( epoch => $row->{hist_time} );
    $row->{host}     = $host;
    $row->{database} = $db;
    $row->{table}    = $t_aal;
    $row->{when}     = DateTime::Format::MySQL->format_datetime($when);
    $row->{batch_id} = $batch_id;
  }

  return $rows;
}

sub get_wp_prefix {
  my ( $dbh, $db, $table ) = @_;
  my $tables = $dbh->selectcol_arrayref( "SHOW TABLES FROM `$db` LIKE ?",
    {}, "%$table" );
  my @prefix = ();
  for my $tbl (@$tables) {
    die unless $tbl =~ /^(.+)\Q$table\E$/;
    push @prefix, $1;
  }
  return @prefix;
}

sub dbh {
  my $db   = shift;
  my %dbc  = %$db;
  my $user = delete $dbc{user};
  my $pass = delete $dbc{pass};
  my $args = join ";", map { "$_=$dbc{$_}" } sort keys %dbc;
  return DBI->connect( "DBI:mysql:$args", $user, $pass,
    { mysql_enable_utf8 => 1, RaiseError => 1 } );
}

sub resolve_host {
  my $name = shift;
  my @addr = gethostbyname($name) or return;
  return map { inet_ntoa($_) } @addr[4 .. $#addr];
}

# vim:ts=2:sw=2:sts=2:et:ft=perl

