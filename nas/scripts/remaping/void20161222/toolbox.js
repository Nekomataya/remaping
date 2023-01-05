/*
作業ツールボックス用関数
拡張ツール用

ツールボックスは、ペン等のポインタを使用した汎用入力パネル
jquery導入に合わせて、ドラッガブルでミニマイズ可能な作りに変更　2013.04.07

*/
/**
	ソフトウェアキーボード処理
	ツールボックス上のソフトウェアキーボードの入力をxUIに送る
*/
function skbPush(Chr){
	var textBody=document.getElementById("iNputbOx").value;
	switch(Chr){
	case	"(*)":if(textBody.length){document.getElementById("iNputbOx").value="("+textBody+")"};
	break;
	case	"○":chkValue("ok");
	break;
	case	"^z":chkValue("undo");
	break;
	case	"^y":chkValue("redo");
	break;
	case	"←":if(textBody.length){document.getElementById("iNputbOx").value=textBody.slice(0,-1)};
	break;
	case	"esc":chkValue("ng");return;
	break;
	default	:document.getElementById("iNputbOx").value+=Chr;//
	}
	if((! xUI.edchg)&&(textBody!=document.getElementById("iNputbOx").value)){
		xUI.edChg(true);//編集フラグ立て
	}
	document.getElementById("iNputbOx").focus();
}

/**
//キーダウンでキー入力をサバく
//IEがプレスだとカーソルが拾えないようなのでキーダウン
function keyDown(e){
//フォーカスされたテーブル上の入力ボックスのキーダウンを検出
	key = e.keyCode;//キーコードを取得

	var eddt = document.getElementById("iNputbOx").value;

	var interpKey=110;


//console.log('press :'+key)


	switch(key) {
case	25	:if(! Safari) break;
case	9	:	//tab
if (! xUI.tabSpin) {
	if(!xUI.edchg) return;
	xUI.put(eddt);
	return false;break;
}
case	13	:		//Enter 標準/次スピン・シフト/前スピン・コントロール/interpSpin
	if(e.ctrlKey){interpSign();return false;}
	if (xUI.edchg){
		xUI.put(nas_expdList(eddt));//更新
//		alert("xstop");
//		xUI.selection();
		xUI.selectCell(add(xUI.Select,[0,1]));//入力あり
	}else{
	    if(e.shiftKey){
		if(expd_repFlag){
			xUI.spin("up");expd_repFlag=false;
		}else{
			xUI.spin("back");
		}
	    }else{
		if(expd_repFlag){
		xUI.spin("down");expd_repFlag=false;
		}else{
			xUI.spin("fwd");//入力なしカラ送り
//			xUI.selectCell(add(xUI.Select,[0,1]));//入力あり
		}
	    };
//	if(! e.ctrlKey){}
	    if(! e.ctrlKey){
		if(xUI.getid("Selection")!="0_0")
			{xUI.selection();xUI.spinHi();};//選択範囲解除
	    }
	}
	return false;
	break;
case	27	:	//esc 選択範囲解除
//		編集中
	if (xUI.edchg){return false;}//バックアップ復帰のためスキップ(実処理はUP)
//		複数セレクト状態
	if(xUI.getid("Selection")!="0_0")
		{xUI.selection();xUI.spinHi();break;};//選択範囲解除
		return false;break;//標準処理(NOP)

//case 32	:		//space 値を確定してフォーカスアウト
//	xUI.edchg=false;
//	xUI.focusCell();	break;
case	38	:		//カーソル上・下
case	40	:		//[shift]+時はセレクションの調整 [ctrl]+時はさらにスピン量の調整も兼ねる
 	if ( e.shiftKey &&
		xUI.Select[1]+xUI.Selection[1]>=0 &&
		xUI.Select[1]+xUI.Selection[1]<(XPS.duration()-1)
	){
		var kOffset=(key==38)? -1:1;
		xUI.selection(xUI.Select[0]+"_"+
		(xUI.Select[1]+xUI.Selection[1]+kOffset));
		if((e.ctrlKey)||(xUI.spinSelect)) xUI.spin("update");
	}else{
		//通常入力処理
	 if(! e.ctrlKey){
		if(xUI.getid("Selection")!="0_0"){xUI.selection();xUI.spinHi();};//選択範囲解除
	 }
		if (xUI.edchg){xUI.put(eddt);}//更新
		if(key==38){xUI.spin("up")}else{xUI.spin("down")};
	}	;return false;	break;
case	39	:		//右
	if ((! xUI.edchg)||(xUI.viewOnly)) {xUI.spin("right")	;return false;
	}else{
	return true;
	};	break;
case	37	:		//左?
	if ((! xUI.edchg)||(xUI.viewOnly)) {xUI.spin("left")	;return false;
	}else{
	return true;
	};	break;
case 	33:		//ページアップ
	if (xUI.edchg){xUI.put(eddt);}//更新
	xUI.spin("pgup");return false;	break;
case 	34:		//ページダウン
	if (xUI.edchg){xUI.put(eddt);}//更新
	xUI.spin("pgdn");return false;	break;
case	35 :;//[END]
	xUI.selectCell(xUI.Select[0]+"_"+XPS.duration());
	break;
case	36 :;//[HOME]
	xUI.selectCell(xUI.Select[0]+"_0");
	break;
case	65 :		;	//[ctrl]+[A]/selectAll
 	if (e.ctrlKey)	{
		xUI.selectCell(xUI.Select[0]+"_0");
		xUI.selection(
			xUI.Select[0]+"_"+XPS.duration()
		);
		return false;}else{return true}
	break;
case	67 :		;	//[ctrl]+[C]/copy
	if (e.ctrlKey)	{
		xUI.yank();
		return false;}else{return true}
	break;
/*
case	79 :		;	//[ctrl]+[O]/ Open Document
	if ((e.ctrlKey)&&(! e.shiftKey))	{
		xUI.openDocument();
		return false;}else{return true}
	break;
case	83 :	alert("SSS");	//[ctrl]+[S]/ Save or Store document
	if (e.ctrlKey) {
		 if(e.shiftKey){xUI.storeDocument("as");}else{xUI.storeDocument();}
		return false;
	}else{
		return true
	}
	break;

case	86 :		;	//[ctrl]+[V]/paste
	if (e.ctrlKey)	{
		xUI.paste();
		return false;}else{return true}
	break;
case	88 :		;	//[ctrl]+[X]/cut
	if (e.ctrlKey)	{
		xUI.cut();
		return false;}else{return true}
	break;
case	89 :		;	//[ctrl]+[Y]/redo
	if (e.ctrlKey)	{
		xUI.redo();
		return false;}else{return true}
	break;
case	90 :		;	//[ctrl]+[Z]/undo
	if (e.ctrlKey)	{
		xUI.undo();
		return false;}else{return true}
	break;
//case	61 :		;
//case	107 :		;
//case	221 :		;	//[+]/plus
//	alert("PLUS :"+key);
//return dialogSpin("incr");
//return true;
//	break;
//case	108 :		;
//case	109 :		;
case	interpKey :		;//[.]/dot-Tenkey これは問題あるキーの交換が出来ない
	if(! xUI.edchg) {
		interpSign();return false;
	}else{
		return true;
	}
break;
//case	219 :		;	//[-]/minus
//	alert("MINUS :"+key);
//return dialogSpin("decr");
//return true;
//	break;
/* 保留
case 8	:	xUI.spin("bs");	break;	//bs NOP
case 46	:	xUI.spin("del");	break;	//del 
case  :	window.status="[]";	break;	//

default :	return true;
	}
//return false;
}
////

function keyPress(e)
{
//	フォーカスされたテーブル上の入力ボックスのキープレスを検出して
//	動作コントロールのために戻り値を調整
	key = e.keyCode;//キーコードを取得
//console.log("press :"+key);
/*		フロートモード判定
	フロート（ブロック移動/セクション編集）モードでは、キー動作の入力が制限される。
	最初にモード内動作を判定して処理
	モードを抜けるまでは他の機能に移行できない
	モードイン判定はノーマル入力モードアウト判定はこのルーチン内
-------------------------------------------------ブロック移動：
[↑][↓][→][←][h][j][k][l][8][2][4][6]	移動
[enter][5]			確定>モードアウト
[esc][0]			モードアウト
-------------------------------------------------セクション編集：
[ctrl] +[↑]/[↓]		端点移動
[shift]+[↑]/[↓]		セクション移動
[enter][5]			確定>モードアウト
[esc][0]			モードアウト


	if(xUI.edmode>0){
if(xUI.edmode==1){
//ブロック移動モード

}else{
//セクション編集モード
}
	  return;
	}
/*
	ラピッドモード!=0 分岐処理
	ラピッドキーモードでは、マウスの入力は受け入れない
	0:解除
	1:スタンバイ（導入キーが一度押しされた状態）
	2:ラピッドモード
	
 
if(xUI.eXMode){
	//ラピッドモード前駆状態フラグONなのでラピッドモード判定
	if(xUI.eXMode==1 && document.getElementById("iNputbOx").value.length==1)
	{	//	入力が前キーと同一ならばモードアクティブ
		if(xUI.eXCode==key && document.getElementById("iNputbOx").value.charCodeAt(0)==key)
		{
			xUI.eXMode++;//モード遷移
			eddt="";
			xUI.eddt="";
			xUI.selectedColor=xUI.inputModeColor.EXTEND;
			xUI.spinAreaColor=xUI.inputModeColor.EXTENDspin;
			xUI.spinAreaColorSelect=xUI.inputModeColor.EXTENDselection;
			xUI.spinHi();
		} else{
			xUI.eXMode=0;xUI.eXCode=0;return true;//遷移失敗 このセッションでは入れない
		};
	}
//モード変更直後でも1回はラピッド動作する
	if(xUI.eXMode>=2){
		if(xUI.eXMode==2){
//	モード遷移直後なので、現在の入力コントロールとバッファをクリアしてモードを確定する
			xUI.eXMode++;
			if(xUI.eddt==xUI.bkup())xUI.edChg(false);
			syncInput(xUI.bkup());
		};
	for (idx=0;idx<(rapidMode.length-1)/2;idx++){if(key==rapidMode[idx*2].charCodeAt(0))break;};
		if(idx<(rapidMode.length-1)/2)
		{
			xUI.doRapid([rapidMode[idx*2+1]]);
			return false;
		}else{
			if (key!=13 && key!=8 && key!=9)
			{
		//モード解除
				if(xUI.eXMode)
				{
		xUI.eXMode=0;	xUI.eXCode=0;

		xUI.selectedColor=xUI.inputModeColor.NORMAL;
		xUI.spinAreaColor=xUI.inputModeColor.NORMALspin;
		xUI.spinAreaColorSelect=xUI.inputModeColor.NORMALselection;
		xUI.spinHi();
		return true;
//		return false;
				}
			}
		}
	}
}else{
//		通常状態なので予備モード遷移判定
	for (idx=0;idx<(rapidMode.length-1)/2;idx++)
	{
//		if(key==rapidMode[idx*2].charCodeAt(0) && document.getElementById("iNputbOx").value.length==0)
		if(key==rapidMode[idx*2].charCodeAt(0) && xUI.edChg)
		{
//dbgPut("exMode-ready: "+ key);
			xUI.eXMode=1;xUI.eXCode=key;return true;//予備モードに入る
		}
	}
}

//		通常判定
	switch(key) {
case	27	: 			;//esc
	return false;
case	25	:if(! Safari) break;
case	0	: 			;//キーコード0を返すコントロールキー群
case	9	:			;//またはTAB および ctr-I
//	return false;

if (! xUI.tabSpin) {
	if(!xUI.edchg) return true;
	return false;break;
}else{
	if (xUI.edchg)
	{return true} else {return false};break;
}
case	13	:			;//Enter
		return false;break;
case	65	:			;//a
case	67	:			;//c
//case	79	:			;//o
//case	83	:			;//s
case	86	:			;//v
case	88	:			;//x
case	89	:			;//y
case	90	:			;//z
case	97	:			;//A
case	99	:			;//C
case	118	:			;//V
case	120	:			;//X
case	121	:			;//Y
case	122	:			;//Z
	if (e.ctrlKey)	{return false;}else{return true;};
		break;
//case		: ;	//
default :;
	return true;
	}
//return true;
}
//
//キーアップもキャプチャする。UI制御に必要 今のところは使ってない?
function keyUp(e)
{
	key = e.keyCode;//キーコードを取得
	if(xUI.eXMode>=2){
		document.getElementById("iNputbOx").select();
		return false;
	}
	if(false){
//alert(key+" : "+document.getElementById("iNputbOx").value.length);
//		通常状態なので予備モード遷移判定
	for (idx=0;idx<(rapidMode.length-1)/2;idx++)
	{
		
		if(key==rapidMode[idx*2].charCodeAt(0) && document.getElementById("iNputbOx").value.length==1)
		{
			xUI.eXMode=1;xUI.eXCode=key;break;//予備モードに入る
		}
	}
}
;
//	通常処理 入力コントロールとバックアップが食い違っているので編集中フラグON
	if(xUI.bkup()!=document.getElementById("iNputbOx").value){
if(dbg)document.getElementById("app_status").innerHTML=xUI.bkup()+" <> "+document.getElementById("iNputbOx").value;
	if(! xUI.edchg) xUI.edChg(true);//変更されていたらフラグ立て
	};
	switch(key) {
case  27:	;	//esc

	if(xUI.edchg){xUI.edChg(false);}
//		document.getElementById("iNputbOx").value=xUI.bkup();
		syncInput(xUI.bkup());
		return false;
break;
case  9	:	;	//tab はシステムで使うのでUPは注意
case  13:	;	//Enter
case  32:	;	//space
case  38:	;	//上カーソル
case  40:	;	//下
case  39:	;	//右
case  37:	;	//左
case  33:	;	//ページアップ
case  34:	;	//ページダウン
case  16:	;	//シフト
case  17:	;	//コントロール
case  18:	;	//ALT
case  45:	;	//ins
case  46:	;	//del
case  144:	;	//clear(NumLock)
//case  :	;	//
	if(xUI.viewOnly) return false;
	if(!xUI.edchg) document.getElementById("iNputbOx").select();
//	if(!xUI.edchg) document.getElementById("iNputbOx").focus();
//	syncInput(document.getElementById("iNputbOx").value);
	return true;
//case  :	window.status="[]";	break;	//
case	65	:	;//[a]
case	67	:	;//[c]
//case	79	:	;//[o]
//case	83	:	;//[s]
case	86	:	;//[v]
case	88	:	;//[x]
case	89	:	;//[y]
case	90	:	;//[z]
	if (e.ctrlKey)	{
		return true;
	}
		break;
//case 110:;//.テンキー
//case 190:;//.>
//	if(!xUI.edchg) document.getElementById("iNputbOx").select();

//break;
//case 99 :	;	//[C]copy	このあたりは横取り
//case 118 :	;	//[V]paste
//case 120 :	;	//[X]cut	しないほうが良い?
case 8	:	;	//bs NOP
default :
//if(! xUI.edchg) xUI.edChg(true);
if(xUI.Select[0]>0){syncInput(document.getElementById("iNputbOx").value);};
	return true;
	}
return true;
}
//サブミットの際の動作
function chkAction()
{
	return false;
}
*/
//
/**
	UIControlの値を検査して値に従ったアクションに変換する
	引数はエレメントのid
*/
function chkValue(id)
{
	document.getElementById("iNputbOx").select();

	switch (id)
	{
case	"fct0"	:
case	"fct1"	:
	xUI.selectCell(xUI.Select[0]+'_'+
		nas.FCT2Frm(document.getElementById(id).value));
	;break;
case	"selall"	:
		xUI.selectCell(xUI.Select[0]+"_0");
		xUI.selection(xUI.Select[0]+"_"+XPS.duration());
		break;
case	"copy"	:	xUI.copy();	break;
case	"cut"	:	xUI.cut();	break;
case	"paste"	:	xUI.paste();break;
case	"activeLvl"	:
	var Lvl=xUI.Select[0];
	if(Lvl>0&&Lvl<=(XPS.xpsTracks.length-1)){	writeAEKey(Lvl);	}
	return;
	break;
case	"iNputbOx"	:	hello();break;
case	"ok"	:
	if (xUI.edchg)
	{
		xUI.put(nas_expdList(document.getElementById("iNputbOx").value));//更新
	}
	if(expd_repFlag){
		xUI.spin("down");expd_repFlag=false;
	}else{
		xUI.spin("fwd")
	}
		break;

case	"ng"	:
	if(xUI.edchg){xUI.edChg(false);}
	syncInput(xUI.bkup());
	if(xUI.getid("Selection")!="0_0")
		{xUI.selection();break;}
		//選択範囲解除
		break;

case	"undo"	:	xUI.undo();break;
case	"redo"	:	xUI.redo();break;
case	"up"	:	;//スピン
case	"down"	:	;
case	"right"	:	;
case	"left"	:	;
case	"fwd"	:	;
case	"back"	:	;
	xUI.spin(id);break;
case	"home"	:	xUI.selectCell(xUI.Select[0]+"_0");break;
case	"end"	:	xUI.selectCell(xUI.Select[0]+"_"+XPS.duration());break;
//
case	"spin_V":	xUI.spin(document.getElementById(id).value);break;
case	"v_up"	:	;//スピン関連
case	"v_dn"	:	;//IDとキーワードを合わせてそのまま送る
case	"pgdn"	:	;
case	"pgup"	:	xUI.spin(id);break;
case	"spinCk":	;//スイッチ変更
	xUI.spinSelect=document.getElementById(id).checked;
	sync("spinS");
			break;
case	"exportCheck":	;//スイッチ変更
	var myCheck=document.getElementById(id);
	myCheck.checked=(myCheck.checked)?false:true;
	return false;
			break;
case	"layer"	:	;//レイヤ変更
	if (document.getElementById("single")){}

	xUI.selectCell(
		(document.getElementById(id).selectedIndex).toString()+
		"_"+xUI.Select[1]
	);
	reWriteCS();//cセレクタの書き直し
	break;
case	"cell"	:	;//セルの入力
	xUI.put((document.getElementById(id).selectedIndex+1));
	xUI.spin("fwd");

	break;
case	"fav"	:	;//文字の一括入力
EXword=xUI.favoriteWords[document.getElementById(id).selectedIndex];
TGword=XPS.xpsTracks[xUI.Select[0]][xUI.Select[1]];
//文字列に*があれば、現在の値と置換
if(EXword.match(/\*/))EXword=EXword.replace(/\*/,TGword);
//#があれば現在の値の数値部分と置換

if(EXword.match(/\#/)){
	if(TGword.match(/(\D*)([0-9]+)(.*)/)){
		var prefix=RegExp.$1;var num=RegExp.$2;var postfix=RegExp.$3;
		EXword=EXword.replace(/\#/,num);
		EXword=prefix+EXword+postfix;
	}
}
	xUI.put(EXword);
	xUI.spin("fwd");

	break;
case	"single":	;
case	"TSXall":	break;
default:	alert(id);return false;
	}
//	alert(id);
return false;
}
//チェックボックストグル操作
function chg(id)
{
	document.getElementById(id).checked=
	(document.getElementById(id).checked) ?
	false	:	true	;
	chkValue(id);
	return false;
}

/**
	ツールボックス初期化
*/
function initToolbox(){
//エレメントブラウザを初期化
	var Selector="";
	var selected=xUI.Select[0];
	for(c=0;c<XPS.xpsTracks.length;c++){
		var myLabel=(c==XPS.xpsTracks.length-1)?"MEMO.":XPS.xpsTracks[c]["id"];
		if(c < xUI.dialogSpan ) myLabel="台詞"+ ((c>0)?c:"");
		Selector+=(selected==c)?'<option selected/>':'<option />';
		Selector+=myLabel;
	}
	document.getElementById("layer").innerHTML=Selector;
	reWriteCS();//cellセレクタの書き直し
	reWriteWS();//wordセレクタの書き直し
}

//セルのセレクタを書き直す。
function reWriteCS(){
	var Selector='';
	if(xUI.Select[0] >= xUI.dialogSpan || xUI.Select[0] < (XPS.xpsTracks.length-1)){
		if(xUI.Select[0] < (XPS.xpsTracks.length-1))
	var cOunt=
	(isNaN(XPS["xpsTracks"][xUI.Select[0]]["lot"]))?
20 : XPS["xpsTracks"][xUI.Select[0]]["lot"];
for(f=1;f<=cOunt;f++){Selector+='<option />'+f.toString()}
	};
	document.getElementById("cell").innerHTML=Selector;
}
//お気に入り単語のセレクタを書き直す。
function reWriteWS(){
	var Selector='';
	var wCount=xUI.favoriteWords.length;
	for(id=0;id<wCount;id++){Selector+='<option />'+xUI.favoriteWords[id]};
		document.getElementById("fav").innerHTML=Selector;
	}
//
function toss(target){document.getElementById(target).focus();};
//
function hello(){alert("この辺は、まだなのだ。\nのんびり待っててチョ。");}
