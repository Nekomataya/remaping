#!/usr/local/bin/perl
# for remaping v1.2 file echo cgi ���դ�
# ���������ڤʥ����ǥ��󥰤ʤΤǤ����ȥޥ���ѡ��ȥǡ������б��Ǥ��Ƥޤ���
# �ƥ����ȤΤ߼����դ����������İʾ�Υե����������Ⱥ�����ޤ���
# ɸ�����Ϥϡ�ñ�˥Х������饤���ΤƤ�Ϣ�뤷�Ƥ�������Ǥ���
#	2006/01/31	kiyo/Nekomataya
#
#	¨��CGI�ʤΤˤ��ޤ����ĥ
#	xps/html/sbd/xml ��MIME�����פ˻����ǽ�� (��ĥ�Ҥ�Ƚ��)
#	2008/04/17	kiyo/Nekomataya
# �ƤФ줿���֤���������

	@Date=localtime(time());
	$Date=localtime(time());
	$sec=sprintf("%02u",$Date[0]);
	$min=sprintf("%02u",$Date[1]);
	$hor=sprintf("%02u",$Date[2]);

##
# ���⡼��
	$LOG="ON" ;
	$log_lockfile="./hit/log.lock";


# �ѿ��ɤ߹���
	$contentType = $ENV{CONTENT_TYPE};

if  ($ENV{QUERY_STRING} eq "") {

	$MODE="enpty";
} else {

foreach $CELL (split(/\&/,$ENV{QUERY_STRING})) {
	@CELL=(split(/=/,$CELL));
	$QUERY{$CELL[0]}=$CELL[1];
}
#	ɸ�����Ϥ���ǡ�����Ȥ�
	$Body="";
	$bdCount=0;

	if ( $contentType =~ /multipart\/form-data/)
	{
		while(<STDIN>) {
			$myLine = $_;
#�Х������饤��ΤƤ�Ϣ�뤹��(��)
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

# XPS�Υƥ����Ȥ�ۤɤ�
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
# �ե������ĥ�Ҥ���MIME�����פ����� ���ݡ��ȳ��Υǡ����Ϥ��٤�"text/plain��"
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
# HTML�ץ�ȥ���إå�(�ץ졼��ƥ����Ȥ��֤�)
if ($QUERY{"COMMAND"} eq "save") {
	print ("Content-Disposition: filename=\"".$myFilename."\"\r\n");
#	print ("Content-Type: aplication/xps\r\n\r\n") ;
	print ("Content-Type: ".$myMIME."\r\n\r\n") ;
	print ($myXPSBody);
} else {
	print ("Content-Type: text/plain\r\n\r\n") ;
	print("����CGI�ϡ������������ǤʤΤǤ���\n�Ȥꤢ�����������֤���\n�ǡ�����ե�������¸�����褦���֤������Ǥ���\n��ޤԤ�ե����륻��������\n\n");
	print($bdCount);
	print("\n\t������\n");
		print ($ENV{"QUERY_STRING"});
	print("\n\t�ե����ॿ����\n");
		print ($ENV{CONTENT_TYPE});
	print("\n\t������ʸ\n");
		print ($Body);
}
# �����
	if ($LOG eq "ON") {
		$LOGFILE= $Date[3]+($Date[4]+ 1)*100+($Date[5]+1900)*10000;

		$filename="./log/$LOGFILE.log";
# ��å�
		open(LOCK, ">$log_lockfile");
		flock(LOCK, 2);
	
# ���å����ȥ���������ȤΥ���ޤ򥨥�������
#		$Cookie=$ENV{HTTP_COOKIE};
#			$Cookie=~s/\,/%2c%/g;
		$UAgent=$ENV{HTTP_USER_AGENT};
			$UAgent=~s/\,/%2c%/g;
# open logfile
		open(FILE,">>$filename");
print FILE "$Date,$0,$ENV{QUERY_STRING} ,$Cookie \:\: $ENV{CONTENT_TYPE} , $ENV{HTTP_REFERER} ,$ENV{REMOTE_ADDR},$UAgent\n";
		close(FILE) ;
	
# ��å����/������
#		flock(LOCK, 8);
		close(LOCK);
		unlink("$log_lockfile");
}

#### end script
exit ;
__END__

¨�� ñ�ʤ뤪�����֤�CGI

