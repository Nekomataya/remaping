#!/usr/local/bin/perl
# for remaping v1.2 file echo cgi ログ付き
# スゴイ野蛮なコーディングなのでちゃんとマルチパートデータに対応できてません。
# テキストのみ受け付け。さらに二つ以上のファイルを送ると混ざります。
# 標準入力は、単にバウンダリラインを捨てて連結しているだけです。
#	2006/01/31	kiyo/Nekomataya
#
#	即席CGIなのにいまさら拡張
#	xps/html/sbd/xml をMIMEタイプに指定可能に (拡張子で判断)
#	2008/04/17	kiyo/Nekomataya
# 呼ばれた時間を成形だぁ

	@Date=localtime(time());
	$Date=localtime(time());
	$sec=sprintf("%02u",$Date[0]);
	$min=sprintf("%02u",$Date[1]);
	$hor=sprintf("%02u",$Date[2]);

##
# ログモード
	$LOG="ON" ;
	$log_lockfile="./hit/log.lock";


# 変数読み込み
	$contentType = $ENV{CONTENT_TYPE};

if  ($ENV{QUERY_STRING} eq "") {

	$MODE="enpty";
} else {

foreach $CELL (split(/\&/,$ENV{QUERY_STRING})) {
	@CELL=(split(/=/,$CELL));
	$QUERY{$CELL[0]}=$CELL[1];
}
#	標準入力からデータをとる
	$Body="";
	$bdCount=0;

	if ( $contentType =~ /multipart\/form-data/)
	{
		while(<STDIN>) {
			$myLine = $_;
#バウンダリライン捨てて連結する(雑)
		if(! ($myLine =~ /^\-+\S+$/)){
			$bdCount++;
		if($bdCount > 4){
			if(! ($myLine =~ /^\-+\S+/)){
	$Body .= $myLine;}}
			}
		}
	} else {
		 $Body =<STDIN>;
		foreach  $CELL (split( "\&" , $Body ))
		{
			@CELL=(split(/=/,$CELL));
			$QUERY{$CELL[0]}=$CELL[1];
		}
	}

# XPSのテキストをほどく
	$myXPSBody=$QUERY{"XPSBody"};

	$myXPSBody =~ s/\x2b/\x20/g;
	$myXPSBody =~ s/%([0-9A-Fa-f][0-9A-Fa-f])/pack("C", hex($1))/eg;
if ($QUERY{"encode"} eq "utf8") {
	$myXPSBody =~ s/%([0-9A-Fa-f][0-9A-Fa-f])/pack("C", hex($1))/eg;
}
	$View_Page=$QUERY{"PAGE"};

	$myFilename = $QUERY{"XPSFilename"};

	$myFilename =~ s/\x2b/\x20/g;
	$myFilename =~ s/%([0-9A-Fa-f][0-9A-Fa-f])/pack("C", hex($1))/eg;
}
# ファイル拡張子からMIMEタイプを設定 サポート外のデータはすべて"text/plainで"
	$myMIME ="text/plain";
	if($myFilename =~ /.*\.xps$/i){$myMIME = "application/xps";};
	if($myFilename =~ /.*\.ard$/i){$myMIME = "application/ard";};
	if($myFilename =~ /.*\.tsh$/i){$myMIME = "application/tsh";};
	if($myFilename =~ /.*\.ardj$/i){$myMIME = "application/ardj";};
	if($myFilename =~ /.*\.sbd$/i){$myMIME = "application/sbd";};
	if($myFilename =~ /.*\.html?$/i){$myMIME = "application/html";};
	if($myFilename =~ /.*\.xml$/i){$myMIME = "application/xml";};
	if($myFilename =~ /.*\.csv$/i){$myMIME = "application/csv";};
	if($myFilename =~ /.*\.e?ps$/i){$myMIME = "application/postscript";};
# HTMLプロトコルヘッダ(プレーンテキストで返す)
if ($QUERY{"COMMAND"} eq "save") {
	print ("Content-Disposition: filename=\"".$myFilename."\"\r\n");
#	print ("Content-Type: aplication/xps\r\n\r\n") ;
	print ("Content-Type: ".$myMIME."\r\n\r\n") ;
	print ($myXPSBody);
} else {
	print ("Content-Type: text/plain\r\n\r\n") ;
	print("このCGIは、スゴイ暫定版なのです。\nとりあえずおうむ返しで\nデータをファイル保存出来るように返すだけです。\nりまぴんファイルセーブ専用\n\n");
	print($bdCount);
	print("\n\tクエリ\n");
		print ($ENV{"QUERY_STRING"});
	print("\n\tフォームタイプ\n");
		print ($ENV{CONTENT_TYPE});
	print("\n\t送信本文\n");
		print ($Body);
}
# ログ取り
	if ($LOG eq "ON") {
		$LOGFILE= $Date[3]+($Date[4]+ 1)*100+($Date[5]+1900)*10000;

		$filename="./log/$LOGFILE.log";
# ロック
		open(LOCK, ">$log_lockfile");
		flock(LOCK, 2);
	
# クッキーとエージェントのコンマをエスケープ
#		$Cookie=$ENV{HTTP_COOKIE};
#			$Cookie=~s/\,/%2c%/g;
		$UAgent=$ENV{HTTP_USER_AGENT};
			$UAgent=~s/\,/%2c%/g;
# open logfile
		open(FILE,">>$filename");
print FILE "$Date,$0,$ENV{QUERY_STRING} ,$Cookie \:\: $ENV{CONTENT_TYPE} , $ENV{HTTP_REFERER} ,$ENV{REMOTE_ADDR},$UAgent\n";
		close(FILE) ;
	
# ロック解除/クローズ
#		flock(LOCK, 8);
		close(LOCK);
		unlink("$log_lockfile");
}

#### end script
exit ;
__END__

即席 単なるおうむ返しCGI

