/*	汎用的なクッキー関連メソッド??

	nasオブジェクトのメソッドとして実装する。
	nas.cookie.toString()//クッキー文字列
	nas.cookie.write()
	nas.cookie.read()
*/
//クッキー文字列を作って書き込み

function buildCk(){
var myCookie = new Array();
///////	クッキー配列用のデータを取得。
//	フラグの無いものは"false"をエントリして配列の要素数を合わせる。
//	[0] WindowSize
	if (useCookie.WinSize){
		sheetAllWidth	=getINNERWIDTH(window.parent);
		sheetAllHeight	=getINNERHEIGHT(window.parent);

		sheetHeadHeight	=getINNERHEIGHT(window.parent.headline);
		sheetInfoWidth	=getINNERWIDTH(window.parent.info);
	winSizes=[sheetAllWidth,sheetAllHeight,sheetHeadHeight,sheetInfoWidth];
	}else{
	winSizes=[false,false,false,false];
	
	}
myCookie[0]=winSizes;

//	[1] XPSAttrib
	myTitle		=(useCookie.XPSAttrib)?XPS.title:null;
	mySubTitle	=(useCookie.XPSAttrib)?XPS.subtitle:null;
	myOpus		=(useCookie.XPSAttrib)?XPS.opus:null;
	myFrameRate	=(useCookie.XPSAttrib)?XPS.framerate:null;
	Sheet		=(useCookie.XPSAttrib)?nas.Frm2FCT(XPS.xpsTracks[0].length,3):null;//
	SheetLayers	=(useCookie.XPSAttrib)?XPS.xpsTracks.length-2:null;

myCookie[1]=[myTitle,mySubTitle,myOpus,myFrameRate,Sheet,SheetLayers];

//	[2] UserName
	if(! useCookie.UserName)	myName	=false;

myCookie[2]=myName;

//	[3] KeyOptions
	BlankMethod	=(useCookie.KeyOptions)?xUI.blmtd:null;
	BlankPosition	=(useCookie.KeyOptions)?xUI.blpos:null;
	AEVersion	=(useCookie.KeyOptions)?xUI.aeVersion:null;
	KEYMethod	=(useCookie.KeyOptions)?xUI.keyMethod:null;
	TimeShift	=(useCookie.KeyOptions)?xUI.timeShift:null;
	FootageFramerate=(useCookie.KeyOptions)?xUI.fpsF:null;
	defaultSIZE	=(useCookie.KeyOptions)?[xUI.dfX,xUI.dfY,xUI.dfA].toString():"auto";

myCookie[3]=[BlankMethod,BlankPosition,AEVersion,KEYMethod,TimeShift,FootageFramerate,defaultSIZE];

//	[4] SheetOptions
	SpinValue 	=(useCookie.SheetOptions)?xUI.spinValue:null;
	SpinSelect	=(useCookie.SheetOptions)?xUI.spinSelect:null;
	SheetLength	=(useCookie.SheetOptions)?xUI.SheetLength:null;
	SheetPageCols	=(useCookie.SheetOptions)?xUI.PageCols:null;
	FootMark	=(useCookie.SheetOptions)?xUI.footMark:null;
	
myCookie[4]=[SpinValue,SpinSelect,SheetLength,SheetPageCols,FootMark];

//	[5] CounterType
	Counter0	=(useCookie.CounterType)?xUI.fct0:null;
	Counter1	=(useCookie.CounterType)?xUI.fct1:null;

myCookie[5]=[Counter0,Counter1];

//	[6] UIOptions
	SLoop		=(useCookie.UIOptions)?xUI.sLoop:null;
	CLoop		=(useCookie.UIOptions)?xUI.cLoop:null;
	AutoScroll	=(useCookie.UIOptions)?xUI.autoScroll:null;
	TabSpin		=(useCookie.UIOptions)?xUI.tabSpin:null;
	ViewMode	=(useCookie.UIOptions)?xUI.viewMode:null;
myCookie[6]=[SLoop,CLoop,AutoScroll,TabSpin,ViewMode];

//	[7] UIView
if(useCookie.UIView){
	ToolView=[];
	for (var ix=0;ix<UIViewIdList.length;ix++){
		ToolView.push(($('#'+UIViewIdList[ix]).is(':visible'))?1:0);				
	};
	ToolView=ToolView.join("");
};//記録チェックがない場合は元のデータを変更しない
myCookie[7]=ToolView;

return myCookie;
}

function writeCk(myCookie){
	if (!navigator.cookieEnabled){
		if (dbg){alert("クッキーが有効でないカンジ?")};
		return false;
	}
if(typeof myCookie == "undefined") myCookie=buildCk();
var myCookieExpiers="";

if(useCookie.expiers) {
	var Xnow = new Date();

var completeYear=Xnow.getFullYear();//	年
var completeMonth=Xnow.getMonth()+1;//	月
var completeDate=Xnow.getDate();//	日
var completeHour=Xnow.getHours();//	時刻

var completeMin=Xnow.getMinutes();//	分
var completeSec=Xnow.getSeconds();//	秒

var eXpSpan=(isNaN(useCookie.expier))? 1:useCookie.expier[1];
//クッキーの期限 デフォルト期限 1日

expDate=new Date(
	completeYear, completeMonth-1, completeDate + eXpSpan,
	completeHour , completeMin, completeSec 
);//	満了期日をセットした日付オブジェクトを作成

myCookieExpiers=';expires='+ expDate.toGMTString();
}

myCookieSource=tosRcs(myCookie);
document.cookie= 'rEmaping=' +escape(myCookieSource) + myCookieExpiers;//書き込む
	return myCookie;
}
//
//	文字列をname=value;のセットに分解して与えられたckNameの値を返す。
//	フラグが立っていればエスケープする。
function breakValue(ckString,ckName,flag) {
	ckString += ';' ;
	ckStringS= ckString.split(';');
		for (n=0;n<ckStringS.length;n ++){
if (ckName == ckStringS[n].split('=')[0]){
	if (flag) {
		return ckStringS[n].split('=')[1];
	}else{
		return unescape(ckStringS[n].split('=')[1]);
	}
}
		}
return null;//判定できなかった場合は空文字列を返す。
}

//クッキー文字列を配列に戻す。
function ldCk(ckStrings){
if (!navigator.cookieEnabled){return false;}

	if(breakValue(document.cookie,"rEmaping")){
		eval("rEmaping="+breakValue(document.cookie,"rEmaping"));
	}else{
		return false;
	}
//	[0] WindowSize
	if (useCookie.WinSize){
	if(rEmaping[0][0]) sheetAllWidth	=unescape(rEmaping[0][0]);
	if(rEmaping[0][1]) sheetAllHeight	=rEmaping[0][1];

	if(rEmaping[0][2]) sheetHeadHeight	=rEmaping[0][2];
	if(rEmaping[0][3]) sheetInfoWidth	=rEmaping[0][3];
	}

//	[1] XPSAttrib
	if (useCookie.XPSAttrib){
	if(rEmaping[1][0]) myTitle	=unescape(rEmaping[1][0]);
	if(rEmaping[1][1]) mySubTitle	=unescape(rEmaping[1][1]);
	if(rEmaping[1][2]) myOpus	=unescape(rEmaping[1][2]);
	if(rEmaping[1][3]) myFrameRate	=unescape(rEmaping[1][3]);
	if(rEmaping[1][4]) Sheet	=unescape(rEmaping[1][4]);
	if(rEmaping[1][5]) SheetLayers	=unescape(rEmaping[1][5]);
	}

//	[2] UserName
	if(useCookie.UserName){
	if(rEmaping[2]) myName	=unescape(rEmaping[2]);
	}

//	[3] KeyOptions
	if(useCookie.KeyOptions){
	if(rEmaping[3][0]) BlankMethod	=unescape(rEmaping[3][0]);
	if(rEmaping[3][1]) BlankPosition=unescape(rEmaping[3][1]);
	if(rEmaping[3][2]) AEVersion	=unescape(rEmaping[3][2]);
	if(rEmaping[3][3]) KEYMethod	=unescape(rEmaping[3][3]);
	if(rEmaping[3][4]) TimeShift	=eval(rEmaping[3][4]);
	if(rEmaping[3][5]) FootageFramerate=unescape(rEmaping[3][5]);
	if(rEmaping[3][6]) defaultSIZE	=unescape(rEmaping[3][6].toString());
	}

//	[4] SheetOptions
	if(useCookie.SheetOptions){
	if(rEmaping[4][0]) SpinValue 	=eval(rEmaping[4][0]);
	if(rEmaping[4][1]) SpinSelect	=eval(rEmaping[4][1]);
	if(rEmaping[4][2]) SheetLength	=eval(rEmaping[4][2]);
	if(rEmaping[4][3]) SheetPageCols=eval(rEmaping[4][3]);
	if(rEmaping[4][4]) FootMark	=eval(rEmaping[4][4]);
	}

//	[5] CounterType
	if(useCookie.CounterType){
	
	if(rEmaping[5][0] instanceof Array) Counter0 =
	[eval(rEmaping[5][0][0]),eval(rEmaping[5][0][1])];
	if(rEmaping[5][1] instanceof Array) Counter1 =
	[eval(rEmaping[5][1][0]),eval(rEmaping[5][1][1])];
	}

//	[6] UIOptions
	if(useCookie.UIOptions){
	if(rEmaping[6][0]) SLoop	=eval(rEmaping[6][0]);
	if(rEmaping[6][1]) CLoop	=eval(rEmaping[6][1]);
	if(rEmaping[6][2]) AutoScroll	=eval(rEmaping[6][2]);
	if(rEmaping[6][3]) TabSpin	=eval(rEmaping[6][3]);
	if(rEmaping[6][4]) ViewMode	=rEmaping[6][4];
	}
//	[7] UIView
	if(useCookie.UIView){
	if(rEmaping[7]) ToolView	=rEmaping[7];
	}
}
//	クッキー削除
function dlCk() {
	ckName = 'rEmaping'; document.cookie = ckName + '=;expires=Thu,01-Jan-70 00:00:01 GMT';
	useCookie=false;
	var msg="クッキーを削除しました。\n値をリセットするには、再読み込みをしてください。";
	alert(msg);
}
function resetCk()
{
// alert(myPrefarences)
	dlCk();
	writeCk(myPrefarences);
	ldCk();
}
//
function tosRcs(obj)
{
//	alert(obj);
	var sRcs="[";
	for(var idx=0; idx <obj.length;idx ++){
		var eLm=obj[idx];
		if(eLm instanceof Array){
			sRcs +=tosRcs(eLm);
		}else{
			sRcs +='"'+escape(eLm)+'"';
		}
		sRcs +=(idx < (obj.length-1))?",":"";
	}
	return sRcs+"]";
}

