/*
情報同期用のスクリプト…
フレームとパネルの関連
フレーム名称	パネル/ウインドウ

	headline	ヘッドライン・常用ツール
	body		タイムシート本体
	info		情報表示・AEキーリザルト
	tool_		ツールボックス(実質上の常用ツール)
	map		マップ表示
	pref		プリファレンスパネル
	dataio		データI/O(XPS/AEload)

こんなもんかしら
こいつは相当いじらないと危ないかも
*/
//汎用表示同期プロシージャ
//同期プロシージャは発信側に置いたほうが、なにかとベンリなので本体に移動

//プロパティとセレクタの関連づけ
	var PropLists = new Array();
	PropLists["blmtd"]=["file","opacity","wipe","channelShift","expression1"];
	PropLists["blpos"]=["first","end","none"];
	PropLists["AEver"]=["8.0","10.0"];
//	PropLists["AEver"]=["4.0","5.0"];
	PropLists["KEYmtd"]=["min","opt","max"];
	PropLists["framerate"]=["custom","24","30","29.97","25","15","23.976","48","60"];
	PropLists["framerate"+"_name"]=["=CUSTOM=","FILM","NTSC","NTSC-DF","PAL","WEB","DF24","FR48","FR60"];
	PropLists["SIZEs"]=["custom",
"640,480,1","720,480,0.9","720,486,0.9","720,540,1",
"1440,1024,1","2880,2048,1","1772,1329,1","1276,957,1",
"1280,720,1","1920,1080,1","1440,1080,1.333"];
	PropLists["dfSIZE"+"_name"]=["=CUSTOM=",
"VGA","DV","D1","D1sq",
"D4","D16","std-200dpi","std-144dpi",
"HD720","HDTV","HDV"];
/*
	タイトル置換機能初期化
 */
if(useworkTitle){
var workTitle=new Array();
	for (i=0;i<=(workTitles.length-1/5);i++){
	ix=i*5;
	workTitle[workTitles[ix]]=new Array();
		workTitle[workTitles[ix]].imgSrc=(workTitles[ix+1])?
			workTitles[ix+1]:"";
		workTitle[workTitles[ix]].ALTText=(workTitles[ix+2])?
			workTitles[ix+2]:"";
		workTitle[workTitles[ix]].linkURL=(workTitles[ix+3])?
			workTitles[ix+3]:"";
		workTitle[workTitles[ix]].titleText=(workTitles[ix+4])?
			workTitles[ix+4]:"";
	}
}

function aserch_(name,ael){if(this[name]){for (n=0;n<this[name].length;n++){if(this[name][n]==ael)return n}};return -1;}

PropLists.aserch = aserch_	;

/*
	タイムシート表示同期プロシジャ
オンメモリの編集バッファとHTML上の表示を同期させる。キーワードは以下の通り
fct	;//フレームカウンタ
lvl	;//キー変換ボタン
spinS	;//スピンセレクタ
title	;//タイトル
subtitle	;//サブタイトル
opus	;//制作番号
create_time	;//作成時間
update_time	;//更新時間?これは要らない
create_user	;//作成ユーザ
update_user	;//更新(作業)ユーザ
scene	;//シーン番号
cut	;//カット番号
framerate	;//フレームレート
undo	;//アンドゥボタン
redo	;//リドゥボタン
time	;//時間
trin	;//トランジション時間1
trout	;//トランジション時間2
memo	;//メモ欄
lbl	;//タイムラインラベル
info_	;//セット変更 シート上書き
tool_	;//セット変更 ツールボックス
pref_	;//セット変更 設定パネル
scene_	;//セット変更 ドキュメントパネル
about_	;//セット変更 りまぴんについて
data_	;//
dbg_	;//
winTitle;//ウィンドウタイトル文字列
productStatus	;//制作ステータス 
*/
function sync(prop)
{
	switch (prop)
	{
case	"productStatus":;
{
	document.getElementById('pmcui_line').innerHTML  = xUI.XPS.line.id.join('-')  + ':(' +xUI.XPS.line.name + ')';
	document.getElementById('pmcui_stage').innerHTML = xUI.XPS.stage.id + ':'  +xUI.XPS.stage.name ;
	document.getElementById('pmcui_job').innerHTML   = xUI.XPS.job.id   + ':'  +xUI.XPS.job.name ;
	document.getElementById('pmcui_status').innerHTML= xUI.XPS.currentStatus;
	document.getElementById('pmcui_documentWriteable').innerHTML= (xUI.viewOnly)?'[編集不可]':'';
	switch (xUI.uiMode){
		case 'production':
	document.getElementById('pmcui').style.backgroundColor = '#bbbbbdd';break;
		case 'management':
	document.getElementById('pmcui').style.backgroundColor = '#ddbbbb';break;
		case 'brousing':
	document.getElementById('pmcui').style.backgroundColor = '#bbddbb';break;
	}
}
break;
case	"fct":	;
{
//フレームの移動があったらカウンタを更新
	document.getElementById("fct0").value=
		nas.Frm2FCT(xUI.Select[1],xUI.fct0[0],xUI.fct0[1]);
	document.getElementById("fct1").value=
		nas.Frm2FCT(xUI.Select[1],xUI.fct1[0],xUI.fct1[1]);
	if (xUI.SWap["tool_"]){
	xUI["tool_"].document.getElementById("fct0").value=
		nas.Frm2FCT(xUI.Select[1],xUI.fct0[0],xUI.fct0[1]);
	xUI["tool_"].document.getElementById("fct1").value=
		nas.Frm2FCT(xUI.Select[1],xUI.fct1[0],xUI.fct1[1]);
	}
}
	break;
case	"lvl":	;
{
//レイヤの移動があったらボタンラベルを更新
//ボタンラベルと同時にブランクメソッドセレクタを更新
	//フォーカスのあるトラックの情報を取得
	if (xUI.Select[0]>0 && xUI.Select[0]<XPS.xpsTracks.length){
		var label=XPS.xpsTracks[xUI.Select[0]]["id"];
		var bmtd=XPS.xpsTracks[xUI.Select[0]]["blmtd"];
		var bpos=XPS.xpsTracks[xUI.Select[0]]["blpos"];
stat=(XPS.xpsTracks[xUI.Select[0]]["option"].match(/still|timing|replacement/))?
		false:true;
	}else{
		var label=(xUI.Select[0]==0)? "台詞":"メモ";//
		var bmtd=xUI.blmtd;
		var bpos=xUI.blpos;
		stat=true;
	}

	document.getElementById("activeLvl").value=label;
	document.getElementById("activeLvl").disabled=stat;
	//現在タイムリマップトラック以外はdisable　将来的には各トラックごとの処理あり
	document.getElementById("blmtd").value=bmtd;
	document.getElementById("blpos").value=bpos;
	
	if (xUI.SWap["tool_"]){
	xUI["tool_"].document.getElementById("activeLvl").value=label;
	xUI["tool_"].document.getElementById("activeLvl").disabled=stat;
	}

	document.getElementById("blmtd").disabled=stat;
	document.getElementById("blpos").disabled=stat;
	if(! document.getElementById("blpos").disabled) chkPostat();
}
	break;
case	"spinS":
	document.getElementById("spinCk").checked=xUI.spinSelect;
	if (xUI.SWap["tool_"]){
	xUI["tool_"].document.getElementById("spinCk").checked=xUI.spinSelect;
	}
	break;
case	"title":

var titleStyle=0;
	if(useworkTitle && workTitle[XPS["title"]]){
if(workTitle[XPS["title"]].linkURL){
	var linkURL=workTitle[XPS["title"]].linkURL;
	var titleText=(workTitle[XPS["title"]].titleText)?workTitle[XPS["title"]].titleText:workTitle[XPS["title"]].linkURL;
	titleStyle += 1;
}
if(workTitle[XPS["title"]].imgSrc){
	var imgSrc=workTitle[XPS["title"]].imgSrc;
	var ALTText=(workTitle[XPS["title"]].ALTtext)?
	workTitle[XPS["title"]].ALTtext:workTitle[XPS["title"]].imgSrc;
	titleStyle += 10;
}

switch(titleStyle){
case 11:	;//画像ありリンクあり
	var titleString="<a href=\""+linkURL+"\" title=\""+titleText+"\"  target=_new><img src=\""+imgSrc+"\" ALT=\""+ALTText+"\" border=0></a>";
	break;
case 10:	;//画像のみ
	var titleString="<img src=\""+imgSrc+"\" ALT=\""+ALTText+"\" border=0>";
	break;
case 1:		;//画像なしリンクあり
	var titleString="<a href=\""+linkURL+"\" title=\""+titleText+"\" target=_new>"+XPS["title"]+" </a>";
	break;
default:
	var titleString=(XPS["title"])? XPS["title"] : "<br />";
}

	}else{
	var titleString=(XPS["title"])? XPS["title"] : "<br />";
	}
//

	document.getElementById("title").innerHTML=titleString;
if(xUI.viewMode != "Compact"){
	for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
		document.getElementById(prop+pg).innerHTML=titleString+"/"+XPS.subtitle;
}
	}
	break;
case	"subtitle":	;
	document.getElementById(prop).innerHTML=
	(XPS[prop])? XPS[prop] : "<br />";
	sync("title");
	break;
case	"opus":	;
case	"create_time":	;
case	"update_time":	;//?これは要らない
	document.getElementById(prop).innerHTML=
	(XPS[prop])? XPS[prop] : "<br />";
if(xUI.viewMode != "Compact"){
	for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
		document.getElementById(prop+pg).innerHTML=(XPS[prop])? XPS[prop] : "<br />";
}
	}
	break;
case	"create_user":	;
case	"update_user":	;
	document.getElementById(prop).innerHTML=
	(XPS[prop])? XPS[prop].split(':')[0] : "<br />";
if(xUI.viewMode != "Compact"){
	for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
		document.getElementById(prop+pg).innerHTML=(XPS[prop])? XPS[prop].split(':')[0] : "<br />";
}
	}
	break;
case	"scene":	;
case	"cut":	;
	var scn= XPS["scene"]	; 
	var cut= XPS["cut"]	;
	
	var myValue=(XPS["scene"] || XPS["cut"])?  scn +" "+ cut :"<br />";
//	document.title=(XPS["scene"] || XPS["cut"])? windowTitle +" "+scn +" "+ cut:windowTitle;

	document.getElementById("scene_cut").innerHTML=myValue;
if(xUI.viewMode !="Compact"){
	for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
		document.getElementById("scene_cut"+pg).innerHTML=(myValue)? myValue : "<br />";
}
	}
	break;
case	"winTitle":	;
	break;
case	"framerate":	;break;
case	"undo":	;
{
//undoバッファの状態を見てボタンラベルを更新

	stat=(xUI.undoPt==0)? true:false ;

//	document.getElementById("undo").disabled=stat;
	$("#undo").attr("disabled",stat);
//	$("#undo").html((stat)?"<img src=./images/ui/undo-d.png>":"<img src=./images/ui/undo.png>")
	
	
	if (xUI.SWap["tool_"]){
	xUI["tool_"].document.getElementById("undo").disabled=stat;
	}
}
	break;
case	"redo":	;
{
//redoバッファの状態を見てボタンラベルを更新

	stat=((xUI.undoPt+1)>=xUI.undoStack.length)? true:false ;

	$("#redo").attr("disabled",stat);
//	$("#redo").html((stat)?"<img src=./images/ui/redo-d.png>":"<img src=./images/ui/redo.png>")


//	document.getElementById("redo").disabled=stat;
	
	if (xUI.SWap["tool_"]){
	xUI["tool_"].document.getElementById("redo").disabled=stat;
	}
}
	break;
case	"time":	;//時間取得
	var timestr=nas.Frm2FCT(XPS.time(),3,0);
	document.getElementById(prop).innerHTML=timestr;
if(xUI.viewMode !="Compact"){
	for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
		document.getElementById(prop+pg).innerHTML=(timestr)? timestr : "<br />";
}
	}
	break;
case	"trin":	;
case	"trout":	;
	var timestr=nas.Frm2FCT(XPS[prop][0],3,0);
	var transit=XPS[prop][1];
	document.getElementById(prop).innerHTML=
	(XPS[prop][0]==0)? "-<br/>" : " ("+timestr+")";
//	(XPS[prop][0]==0)? "-<br/>" : transit + " ("+timestr+")";

	var myTransit="";
	if(XPS.trin[0]>0){
		myTransit+="△ "+XPS.trin[1]+'('+nas.Frm2FCT(XPS.trin[0],3)+')';
	}
	if((XPS.trin[0]>0)&&(XPS.trout[0]>0)){	myTransit+=' / ';}
	if(XPS.trout[0]>0){
	myTransit+="▼ "+XPS.trout[1]+'('+nas.Frm2FCT(XPS.trout[0],3)+')';
	}
	document.getElementById("transit_data").innerHTML=myTransit;

	break;
case	"memo":
	var memoText=XPS.xpsTracks.noteText.toString().replace(/(\r)?\n/g,"<br>");
	document.getElementById(prop).innerHTML=memoText;
	if(document.getElementById("memo_prt")){document.getElementById("memo_prt").innerHTML=memoText;}
	break;
case	"lbl":	;
//UIモード増加に伴って切り分けが発生　コンパクトモード時はラベル書き換えを分岐
  if(xUI.viewMode=="Compact"){
//隠れる分のヘッダと固定ヘッダをを書き換え
	for(r=xUI.dialogSpan-1 ;r<XPS.xpsTracks.length;r++){
if(XPS.xpsTracks[r].id.match(/^\s*$/)){
		document.getElementById("L"+r.toString()+"_0_0").innerHTML='<span style="color:'+SheetBorderColor+'";>'+nas.Zf(r+1,2)+'</span>';
		document.getElementById("L"+r.toString()+"_-1_0").innerHTML='<span style="color:'+SheetBorderColor+'";>'+nas.Zf(r+1,2)+'</span>';
}else{
		document.getElementById("L"+r.toString()+"_0_0").innerHTML=XPS.xpsTracks[r].id;
		document.getElementById("L"+r.toString()+"_-1_0").innerHTML=XPS.xpsTracks[r].id;
}
	}
  }else{
	for(r=xUI.dialogSpan ;r<XPS.xpsTracks.length-1;r++){
	for(Pg=0;Pg<(Math.ceil(XPS.duration()/xUI.PageLength));Pg++){
	for(Cm=0;Cm<xUI.PageCols;Cm++){
//		alert("L"+r.toString()+"_"+Pg+"+"+Cm);
if(XPS.xpsTracks[r].id.match(/^\s*$/)){
		document.getElementById("L"+r.toString()+"_"+Pg+"_"+Cm).innerHTML='<span style="color:'+SheetBorderColor+'";>'+nas.Zf(r+1,2)+'</span>';
}else{
		document.getElementById("L"+r.toString()+"_"+Pg+"_"+Cm).innerHTML=XPS.xpsTracks[r].id;

}
	}}}
  }
	break;
case	"info_":	;//セット変更
	var syncset=
["opus","title","subtitle","time","trin","trout","scene","update_user"];
//["opus","title","subtitle","time","trin","trout","scene","update_user","memo"];
	for(var n=0;n<syncset.length;n++){sync(syncset[n])};
	break;
case	"tool_":	;//セット変更
	var syncset=["fct","lvl","undo","redo","spinS"];
	for(var n=0;n<syncset.length;n++){sync(syncset[n])};
	break;
case	"pref_":	;//セット変更	
	break;
case	"scene_":	;//セット変更
	break;
case	"about_":	;//セット変更
	for(var N=0;N<2;N++){
		if(document.getElementById("myVer"+N)){document.getElementById("myVer"+N).innerHTML= windowTitle};
		if(document.getElementById("myServer"+N)){document.getElementById("myServer"+N).innerHTML="[no server]"};
	};
	break;
case	"data_":	;
	break;
case	"dbg_":	;
	break;
default	:	if(dbg){dbgPut(prop+" :ソレは知らないプロパティなのです。");}
	}
//windowTitleは無条件で変更
	if(xUI.init){
		var winTitle=XPS["scene"].toString()+XPS["cut"].toString();
		if((appHost.platform == "AIR") && (fileBox.currentFile)){winTitle = fileBox.currentFile.name}
		winTitle +=(xUI.isStored())?"":" *";
		if(document.title!=winTitle){document.title=winTitle};//違ってるときのみ書き直す
	}
}
function syncInput(entry)
{
	if((xUI.noSync)||(xUI.viewOnly)) return;
//カーソル入力同期
//		ヘッドライン更新
	if (document.getElementById("iNputbOx").value!=entry)
	document.getElementById("iNputbOx").value=entry;
//		ツールボックス更新
	if (xUI.SWap["tool_"]){
	if (xUI["tool_"].document.getElementById("iNputbOx").value!=entry)
	xUI["tool_"].document.getElementById("iNputbOx").value=entry;
	}
//		フォーカスがシート上にあればボックスを更新
	if(this.Focus)
	{
		if (document.getElementById("iNputbOx").value!=entry)
			document.getElementById("iNputbOx").value=entry;
	}else{
		if (document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).innerHTML!=entry)
			document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).innerHTML=(entry=="")?"<br>":entry;

		var paintColor=(xUI.eXMode>=2)?xUI.inputModeColor.EXTENDeddt:xUI.inputModeColor.NORMALeddt;
		if (! xUI.edchg) paintColor=xUI.selectedColor;
		if (document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).style.backgroundColor!=paintColor)
			document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).style.backgroundColor=paintColor;
	};
}
//
function initInfo()
{
//info ファイル初期化
//NOP
alert("Load! Info");
}
//
