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

my $C       = load_json("config.json");
my $CONN    = $C->{db};
my $CONN_WP = $C->{wpdb} // $C->{db};

my $name_re = qr{
  ^ 
  (?:(?:backwpup_)?[0-9A-Z]+_)? 
  (\d{4})-(\d{2})-(\d{2})
  _
  (\d{2})-(\d{2})-(\d{2})
  _
}x;

find {
  wanted => sub {
    return unless -f;
    return unless /_(files|database)\.tar\.gz$/;

    my $kind    = $1;
    my $tarball = file $_;

    my $name = $tarball->basename;
    my $site = $tarball->parent->basename;
    my $env  = $tarball->parent->parent->basename;

    $name =~ s/%/00/g;

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

    $stash{$env}{$site}{$kind}{$dt} = $tarball->absolute;
  },
  no_chdir => 1
 },
 $C->{backup};

my $dbh    = dbh($CONN);
my $dbh_wp = dbh($CONN_WP);

for my $env ( sort keys %stash ) {
  for my $site ( sort keys %{ $stash{$env} } ) {
    for my $kind ( sort keys %{ $stash{$env}{$site} } ) {
      next if $kind ne "database";
      my $backup = $stash{$env}{$site}{$kind};
      my @times  = sort keys %$backup;

      next unless @times;

      my $latest = $times[-1];
      ( my $db = join "_", $site, $env ) =~ s/-/_/g;

      my $key = join "_", $kind, $db;

      my ($got)
       = $dbh->selectrow_array(
        "SELECT `latest` FROM `backwpup` WHERE `key` = ?",
        {}, $key );

      if ( defined $got && $got eq $latest ) {
        say "[$latest] Skipping $kind $env/$site";
        next;
      }

      my $root = dir $C->{backup}, "home", $env, $site;
      $root->mkpath;

      if ( $kind eq "database" ) {
        update_db( $root, $env, $site, $db, $backup->{$latest}, $latest );
      }
      elsif ( $kind eq "file" ) {
        update_files( $root, $env, $site, $db, $backup->{$latest}, $latest );
      }
      else {
        die "Unknown kind: $kind";
      }

      $dbh->do( "REPLACE INTO `backwpup` (`key`, `latest`) VALUES (?, ?)",
        {}, $key, $latest );
    }
  }
}

$dbh_wp->disconnect;
$dbh->disconnect;

sub mysql_options {
  my $conn = shift;
  my @opt  = ();
  push @opt, "-u", $conn->{user}
   if $conn->{user};
  push @opt, "--host", $conn->{host}
   if $conn->{host} && $conn->{host} ne "localhost";
  push @opt, "--port", $conn->{port}
   if $conn->{port};
  push @opt, "-p", $conn->{pass}
   if $conn->{pass};
  return @opt;
}

sub mysql_command {
  my ( $cmd, $conn, @extra ) = @_;
  my @cmd = ( $cmd, @extra, mysql_options($conn) );
  return @cmd if wantarray;
  return join " ", @cmd;
}

sub git_snapshot {
  my ( $root, $env, $site, $db, $tarball, $ts ) = @_;

  local $CWD = $root;

  unless ( -d ".git" ) {
    system "git init .";
  }

  system "git add .";
}

sub update_files {
  my ( $root, $env, $site, $db, $tarball, $ts ) = @_;
  say "[$ts] Updating files $env/$site";
}

sub update_db {
  my ( $root, $env, $site, $db, $tarball, $ts ) = @_;
  say "[$ts] Updating database $env/$site";
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

  my $mysql = mysql_command( "mysql", $CONN_WP );

  say "  Dropping $db";
  system join " | ", "echo 'DROP DATABASE IF EXISTS `$db`'", $mysql;
  say "  Creating $db";
  system join " | ", "echo 'CREATE DATABASE `$db`'", $mysql;
  for my $sql (@sql) {
    say "  Loading $sql into $db";
    my $cmd = join " | ", ( $sql =~ /\.gz$/ ? "gzip -cd $sql" : "cat $sql" ),
     "sed -e 's/^INSERT /REPLACE /'",
     "$mysql $db";
    say "    $cmd";
    system $cmd;
  }

  my @tables = @{ $dbh_wp->selectcol_arrayref("SHOW TABLES IN `$db`") };
  my $dump_dir = dir $root, "sql";
  $dump_dir->mkpath;

  for my $table (@tables) {
    my $sql = file $dump_dir, "$table.sql";
    say "$table -> $sql";
    my $tmp = file $dump_dir, "$table.tmp.sql";

    my @mysqldump = (
      mysql_command(
        "mysqldump",              $CONN_WP,
        '--skip-extended-insert', '--skip-dump-date',
        '--skip-comments'
      ),
      '--result-file' => $tmp,
      $db,
      $table
    );

    system @mysqldump;
    rename $tmp, $sql;
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

sub load_json {
  my $file = shift;
  my $fh   = file($file)->openr;
  $fh->binmode(":utf8");
  return JSON->new->decode(
    do { local $/; <$fh> }
  );
}

# vim:ts=2:sw=2:sts=2:et:ft=perl

