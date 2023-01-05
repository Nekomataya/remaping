#!/usr/local/bin/perl
use strict;

my $rows = "";
for my $key (sort keys %ENV) {
    $rows .= "<tr><th>$key</th><td>$ENV{$key}</td></tr>\n";
}

print <<HTML;
Content-Type: text/html

<html>
<head><title>ENV Values</title></head>
<style type="text/css">
th, td { font-size: 90%; padding: 0.2em 0.5em; border-bottom: 1px #C00 solid; }
th { text-align: left; background-color: #FCC; border-right: 1px #C00 solid; }
</style>
<body>
<table>$rows</table>
</body>
</html>
HTML

__END__