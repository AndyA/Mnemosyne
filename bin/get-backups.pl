#!/usr/bin/env perl

use v5.10;

use autodie qw( :default :system );
use strict;
use warnings;

use constant BACKUP => "backwpup/";
use constant LOCK   => ".no-cron";

use DBI;
use DateTime;
use File::Find;
use File::Temp;
use File::chdir;
use JSON ();
use Path::Class;

END { unlink LOCK }
system touch => LOCK;

my %stash = ();

my $name_re = qr{
  ^ 
  (?:backwpup_[0-9A-Z]+_)? 
  (\d{4})-(\d{2})-(\d{2})
  _
  (\d{2})-(\d{2})-(\d{2})
  _
}x;

find {
  wanted => sub {
    return unless -f;
    return unless /_database\.tar\.gz$/;

    my $tarball = file $_;

    my $name = $tarball->basename;
    my $site = $tarball->parent->basename;
    my $env  = $tarball->parent->parent->basename;

    unless ( $name =~ $name_re ) {
      warn "Bad name: $name";
      return;
    }

    my $dt = DateTime->new(
      year      => $1,
      month     => $2,
      day       => $3,
      hour      => $4,
      minute    => $5,
      second    => $6,
      time_zone => "UTC"
    );

    $stash{$env}{$site}{$dt} = $tarball->absolute;
  },
  no_chdir => 1
 },
 BACKUP;

my $CONN = {
  host     => "localhost",
  database => "mnemosyne",
  user     => "root",
  pass     => "",
};

my $dbh = dbh($CONN);

for my $env ( sort keys %stash ) {
  for my $site ( sort keys %{ $stash{$env} } ) {
    my $backup = $stash{$env}{$site};
    my @times  = sort keys %$backup;

    next unless @times;

    my $latest = $times[-1];
    ( my $db = join "_", $site, $env ) =~ s/-/_/g;

    my ($got)
     = $dbh->selectrow_array(
      "SELECT `latest` FROM `backwpup` WHERE `database` = ?",
      {}, $db );

    if ( defined $got && $got eq $latest ) {
      say "[$latest] Skipping $env/$site";
      next;
    }

    update_db( $env, $site, $db, $backup->{$latest}, $latest );
    $dbh->do( "REPLACE INTO `backwpup` (`database`, `latest`) VALUES (?, ?)",
      {}, $db, $latest );
  }
}

$dbh->disconnect;

sub update_db {
  my ( $env, $site, $db, $tarball, $ts ) = @_;
  say "[$ts] Updating $env/$site";
  my $work = File::Temp->newdir;
  {
    local $CWD = $work;
    system tar => "zxf", $tarball;
  }

  my @sql = ();
  find {
    wanted => sub {
      return unless -f;
      return unless /\.sql(?:\.gz)?$/;
      push @sql, $_;
    },
    no_chdir => 1
  }, $work;

  unless (@sql) {
    warn "No *.sql.gz or *.sql found in $tarball";
    return;
  }

  say "  Dropping $db";
  system "echo 'DROP DATABASE IF EXISTS `$db`' | mysql -uroot";
  say "  Creating $db";
  system "echo 'CREATE DATABASE `$db`' | mysql -uroot";
  for my $sql (@sql) {
    say "  Loading $sql into $db";
    my $cmd = join " | ", ( $sql =~ /\.gz$/ ? "gzip -cd $sql" : "cat $sql" ),
     "sed -e 's/^INSERT /REPLACE /'",
     "mysql -uroot $db";
    say "    $cmd";
    system $cmd;
  }
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

# vim:ts=2:sw=2:sts=2:et:ft=perl

