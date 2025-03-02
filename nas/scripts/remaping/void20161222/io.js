﻿/*						----- io.js
りまぴん
入出力関連プロシージャ

ウインドウの開閉コントロール
jQueryライブラリの使用に置き換えるので
ルーチンの見なおし
2013.02.26
*/
/*　起動時に一度だけ実行される初期化手順の一部なので　初期化プロシジャに移動
function initPanels(){
//起動時に各種パネルの初期化を行う。主にjquery-ui-dialog
//aboutパネル
$("#optionPanelVer").dialog({
	autoOpen:false,
	modal	:true,
	width	:480,
	title	:"りまぴんについて",
});
$("#optionPanelPref").dialog({
	autoOpen:false,
	modal	:true,
	width	:520,
	title	:"各種設定"
});
$("#optionPanelScn").dialog({
	autoOpen:false,
	modal	:true,
	width	:512,
	title	:"新規タイムシート/タイムシート内容の編集",
});

$("#optionPanelFile").dialog({
	autoOpen:false,
	modal	:true,
	width	:720,
	title	:"ドキュメント",
});

$("#optionPanelProg").dialog({
	autoOpen:false,
	modal	:true,
	width	:720,
	title	:"処理中",
});
}
*/

/*
	xUI.sWitchPanel(引数)
パネル類の表示をコントローする
引数="clear"または　なしの場合は、排他表示のパネル類を表示クリア（hide）して表示を初期化する

引数	JQobject	備考

//排他表示
login	#optionPanelLogin	//ログインUI（　排他）
memo	#optionPanelMemo	//メモ編集（　排他）
Data	#optionPanelData	//Import/Export（　排他）
AEKey	#optionPanelAEK	//キー変換（　排他）
Scn	#optionPanelScn	//シーン設定(モーダル)
Pref	#optionPanelPref	//環境設定（モーダル）
Ver	#optionPanelVer	//about(モーダル)
File	#optionPanelFile	//ファイルブラウザ（モーダル）

Dbg	#optionPanelDbg	//デバッグコンソール（　排他）
Prog	#optionPanelProg	//プログレスバー（使ってないけど…排他モーダルにする）
//フローティングツール
Tbx	#optionPanelTbx	//ソフトウェアキーボード
//常時パネル（ユーザ指定）
menu	#pMenu	//ドロップダウンメニュー(共)
ToolBr	div#toolbarHeader	//ツールバー(共)
SheetHdr	div#sheetHeaderTable	//シートヘッダー(共)
memoArea		//ヘッダメモ欄複合オブジェクト
Utl	#optionPanelUtl	//ユーティリティーコマンドバー(共)排他から除外

xUI.sWitchPanel = function sWitchPanel(status){
//一括クリアするパネルのリスト
//	"#optionPanelProg",
var myPanels=["#optionPanelMemo",
	"#optionPanelLogin",
	"#optionPanelData",
	"#optionPanelAEK",
	"#optionPanelScn",
	"#optionPanelPref",
	"#optionPanelVer",
	"#optionPanelSnd"
];
/*
オールクリアは可能だが、ウインドウがフロートに移行するので使用範囲は限定される。
一部のフロートパネルは一括消去対象外にする
	"#optionPanelUtl",
	"#optionPanelTbx",
	"#optionPanelDbg",

   if( status == "clear" ){
	for(var idx=0;idx<myPanels.length;idx++){
//		if(document.getElementById("tbLock").checked && myPanels[idx]=="#optionPanelUtl"){continue;};
		if(myPanels[idx]=="#optionPanelMemo"){
			if($("#optionPanelMemo").is(':visible')){this.sWitchPanel('memo');}
		}else{
			$(myPanels[idx]).hide();
		}
	}
	xUI.adjustSpacer();
	document.getElementById("iNputbOx").focus();
	return;
   }

//jQueryオブジェクトを取得してターゲットにする
		var myTarget=$("#optionPanel"+status);//jQ object
//if(! myTarget[0]){alert("noObject : #optionPanel"+status);return flase;};
//ターゲットが存在しないことがあるがそれはヨシ？
switch(status){
//ダイアログ
case	"File":	;//ファイルブラウザ
	if(documentDepot.documents.length==0){documentDepot.rebuildList();}
case	"Ver":	;//バージョンパネル
case	"Pref":	;//環境設定
case	"Scn":	;//ドキュメント設定
case	"Prog":	;//プログレスパネル
	var myStatus=(myTarget.is(':visible'))? true:false;
		this.sWitchPanel("clear");
		if(myStatus){myTarget.dialog("close")}else{myTarget.dialog("open")};
	break;
//割り込みパネル
case	"Login":;//ログインパネル
case	"Data":	;//データパネル
case	"Dbg":	;//デバッグパネル
case	"Snd":	;//音声編集パネル
	var myStatus=(myTarget.is(':visible'))? true:false;
		this.sWitchPanel("clear");
		if(myStatus){myTarget.hide()}else{myTarget.show()};
	break;
case	"TimeUI":	;//ツールボックス
		if(myTarget.is(':visible')){myTarget.hide()}else{myTarget.show()};
	break;
case	"Tbx":	;//ツールボックス
		if(myTarget.is(':visible')){myTarget.hide()}else{myTarget.show()};
	break;
case	"Utl":	;//ユーティリテーメニューパネル
	if(! myTarget.is(':visible')){
		myTarget.show();
	}else{
//		if(! document.getElementById("tbLock").checked){		}

			myTarget.hide();
	};
	break;
case	"memo":	;//memo edit start
	myTarget=$("#optionPanelMemo");//置き換え
	hideTarget=$("#memo");
	if(! myTarget.is(':visible')){
		this.sWitchPanel("clear");
		if((document.getElementById("myWords").innerHTML=="word table")&&(myWords)){
			document.getElementById("myWords").innerHTML=putMyWords();
		}
		hideTarget.hide();
		myTarget.show();
		document.getElementById("rEsult").value=XPS.xpsTracks.noteText;
	}else{
		hideTarget.show();
		XPS.xpsTracks.noteText=document.getElementById("rEsult").value;
		sync("memo");
		myTarget.hide();
	};
	break;
case	"memoArea": ;//メモエリア切り替え
	if($("#memoArea").is(":visible")){
		$("#memoArea").hide()
	}else{
		$("#memoArea").show()
	};
//		xUI.adjustSpacer();
break;
case	"AEKey":	;//キー表示
	myTarget=$("#optionPanelAEK");//置き換え
	if(! myTarget.is(':visible')){
		this.sWitchPanel("clear");
			//パネル初期化が必要
			//var myIdx=["blmtd","blpos","aeVersion"]//キーメッソド固定に変更されるので不要　,"keyMethod"
			//for (var idx=0;idx<myIdx.length;idx++){document.getElementById(myIdx[idx]).value=xUI[myIdx[idx]];}
		myTarget.show();
	}else{
		myTarget.hide();
	};
	break;
case	"memu":	;//ドロップダウンメニューバー　消す時に操作性が阻害されるケースがあるので警告を入れる
	if($("#pMenu").is(":visible")){
		if(appHost.platform!="AIR"){
			if(confirm("ドロップダウンメニューを非表示にしてよろしいですか？")){$("#pMenu").hide();}else{break;};
		}else{
			$("#pMenu").hide();
		}
	}else{
		$("#pMenu").show()
	};
//	xUI.adjustSpacer();
break;
case	"ToolBr":	;//固定ツールバー
	if($("#toolbarHeader").is(":visible")){$("#toolbarHeader").hide()}else{$("#toolbarHeader").show()};
//	xUI.adjustSpacer();
break;
case	"SheetHdr": ;//固定UIシートヘッダ
	if($("#sheetHeaderTable").is(":visible")){$("#sheetHeaderTable").hide()}else{$("#sheetHeaderTable").show()};
//	xUI.adjustSpacer();
break;

//case	"clear":	break;//表示クリアは、最初に分岐してパラメータを見ない仕様に変更
default:	;//	デフォルトアクションはクリアと同値
	for(var idx=0;idx<myPanels.length;idx++){
//		if(document.getElementById("tbLock").checked && myPanels[idx]=="#optionPanelUtl"){continue;};
		$(myPanels[idx]).hide();
	}
}
	xUI.adjustSpacer();
	document.getElementById("iNputbOx").focus();
}

*/


/*
	メモ欄用単語セレクタ
*/
function putMyWords(){
	var myResult="<table>";
	for(var idx=0;idx<myWords.length;idx++){
		myResult+="\n<td>";
		for(var idxw=0;idxw<myWords[idx].length;idxw++){
			myResult+="<input type=button class=toolTip value=\""+myWords[idx][idxw]+"\"><br>";;
		}
		myResult+="\n</td>";
	}
	myResult+="\n</table>";
	return myResult;
}
editMemo=function(e){
	var myTarget=e.target;
	document.getElementById("rEsult").insert(myTarget.value);
}
/**
	AEキー書き出し
	現状ではタイミングタイムラインだけが変換対象
*/
function writeAEKey(n){
if(! n){n=xUI.Select[0]; }
//リザルトエリアが表示されていない場合表示させる。
	if (! $("#optionPanelAEK").is(':visible')){xUI.sWitchPanel("AEKey");}
		document.getElementById("AEKrEsult").value=XPS2AEK(XPS,n-1);
		if(! Safari){document.getElementById("AEKrEsult").focus();}
		if((appHost.platform=="AIR")&&(air.Clipboard)){
//AIRだった場合はここでクリップボードへ転送
			writeClipBoard(XPS2AEK(XPS,n-1));
		}else{
//ブラウザの場合もコピーにトライ
			document.getElementById("AEKrEsult").select();
			if(document.execCommand)document.execCommand("copy");
		}
}


//リスト展開プロシージャ
/**
引数:	ソース文字列　ListStr /  rcl
戻値:	putメソッドの引数ストリーム
	マクロ記法の文字列をputメソッドに引き渡し可能なストリームへ展開する
	リスト展開エンジンは汎用性を持たせたいので、無理やりグローバルに置いてある。
	要注意
*/
	var expd_repFlag	=false	;
	var expd_skipValue	=0	;//グローバルで宣言

// リスト展開はxUIのメソッドか?
function nas_expdList(ListStr,rcl){
	if(typeof rcl=="undefined"){rcl=false}else{rcl=true}
	var leastCount=(xUI.Selection[1])? xUI.Selection[1]:XPS.duration()-xUI.Select[1];
	if(!rcl){
		expd_repFlag=false;
		expd_skipValue=xUI.spinValue-1;
	//再帰呼び出し以外はスピン値で初期化
	}
//(スキップ量はスピン-１)この値はグローバルの値を参照
	var SepChar="\.";


//	台詞レイヤの場合のみ、カギ括弧の中をすべてセパレートする
//　ダイアログトラックは固定ではなくなったので判定を変更
//  コメントトラックを排除する必要あり
//この判定をxUIに依存すると汎用性がなくなるので、コール側で引数渡しに変更する必要あり？
	if (
		((xUI.Select[0]<(XPS.xpsTracks.length-2))&&
		(XPS.xpsTracks[xUI.Select[0]].option=="dialog"))
	){
if (ListStr.match(/「([^「]*)」?/)) ;
if (ListStr.match(/「(.+)」?/)) {
//alert("Hit ："+ListStr.match(/^(.*「)([^」]*)(」?$)/));
	ListStr=d_break(ListStr.match(/^(.*「)([^」]*)(」?$)/));
	ListStr=ListStr.replace(/「/g,SepChar+"「"+SepChar);//開き括弧はセパレーション
}
	ListStr=ListStr.replace(/\」/g,"---");//閉じ括弧は横棒
	ListStr=ListStr.replace(/\、/g,"・");//読点中黒
	ListStr=ListStr.replace(/\。/g,"");//句点空白(null)
	ListStr=ListStr.replace(/\ー/g,"｜");//音引き縦棒
	};

//		r導入リピートならば専用展開プロシージャへ渡してしまう
		if (ListStr.match(/^([\+rR])(.*)$/)){
			var expdList=TSX_expdList(ListStr);
			expd_repFlag=true;
		}else{

//		リスト文字列を走査してセパレータを置換
	ListStr=ListStr.replace(/[\,\x20]/g,SepChar);
//		スラッシュを一組で括弧と置換(代用括弧)
	ListStr=ListStr.replace(/\/(.*)(\/)/g,"\($1\)");//コメント引数注意
//		var PreX="/\(\.([1-9])/g";//括弧の前にセパレータを補う
	ListStr=ListStr.replace(/\(([^\.])/g,"\(\.$1");
//		var PostX="/[0-9](\)[1-9])/";//括弧の後にセパレータを補う
	ListStr=ListStr.replace(/([^\.])(\)[1-9]?)/g,"$1\.$2");

//		前処理終わり
//		リストをセパレータで分割して配列に
	var srcList=new Array;
		srcList=ListStr.toString().split(SepChar);

	var expdList= new Array;//生成データ配列を作成

	var sDepth=0;//括弧展開深度/初期値0
	var StartCt=0;var EndCt=0;

//		元配列を走査
	var ct=0;//ローカルスコープにするために宣言する
	for (ct=0;ct<srcList.length;ct++){
	tcn=srcList[ct];

//		トークンが開きカギ括弧の場合リザルトに積まないで
//		リザルトのおしまいの要素を横棒にする。
	if (tcn=="「") {y_bar();continue;}

//		トークンがコントロールワードならば値はリザルトに積まない
//		変数に展開してループ再開
	if (tcn.match(/^s([1-9][0-9]*)$/))
	{
		expd_skipValue=(RegExp.$1*1>0)? (RegExp.$1*1-1):0;
		continue;
	}
//		トークンが開き括弧ならばデプスを加算して保留
	if (tcn.match(/^(\(|\/)$/))
	{	sDepth=1;StartCt=ct;
//		トークンを積まないで閉じ括弧を走査
		var ct2=0;//ローカルスコープにするために宣言する
		for(ct2=ct+1;ct2<srcList.length;ct2++)
		{
	if (srcList[ct2].match(/^\($/)){sDepth++}
	if (srcList[ct2].match(/^(\)|\/)[\*x]?([0-9]*)$/)){sDepth--}
			if (sDepth==0)
			{EndCt=ct2;
//	最初の括弧が閉じたので括弧の繰り返し分を取得/ループ
			var rT=RegExp.$2*1;if(rT<1){rT=1};
			if(RegExp.$2==""){expd_repFlag=true;};
			var ct3=0;//ローカルスコープにするために宣言する
			for(ct3=1;ct3<=rT;ct3++)
			{if((StartCt+1)!=EndCt)
{
//alert("DPS= "+sDepth+" :start= "+StartCt+"  ;end= "+EndCt +"\n"+ srcList.slice(StartCt+1,EndCt).join(SepChar)+"\n\n-- "+rT);
expdList=expdList.concat(nas_expdList(srcList.slice(StartCt+1,EndCt).join(SepChar),"Rcall"));
//括弧の中身を自分自身に渡して展開させる
//展開配列が規定処理範囲を超過していたら処理終了
	if(expdList.length>=leastCount){return expdList}
}
			}
			ct=EndCt;break;
			}//if block end
		}//ct2 loop end
			if(rT==0)
			{expdList.push(srcList[ct]);s_kip();//ct++;
			}
	}else{
//	トークンが展開可能なら展開して生成データに積む
			if (tcn.match(/^([1-9]{1}[0-9]*)\-([1-9]{1}[0-9]*)$/))
			{
	var stV=Math.round(RegExp.$1*1) ;var edV=Math.round(RegExp.$2*1);
		if (stV<=edV){
	for(tcv=stV;tcv<=edV;tcv++){expdList.push(tcv);s_kip();}
		}else{
	for(tcv=stV;tcv>=edV;tcv--){expdList.push(tcv);s_kip();}
		}
			}else{
	expdList.push(tcn);s_kip();
			}

	}
}
	}
//	生成配列にスキップを挿入
function s_kip(){ for (x=0;x<expd_skipValue;x++) expdList.push('');}
//	配列の末尾を横棒に
function y_bar(){ expdList.pop(); expdList.push('---');}
//	かぎ括弧の中身をセパレーション
function d_break(dList){ wLists=dList.toString().split(","); return wLists[1]+wLists[2].replace(/(.)/g,"$1\.")+wLists[3];}
// カエス
	if ( expdList.length < leastCount && expd_repFlag ){
			blockCount=expdList.length;
//			alert(blockCount + " / " +leastCount);
			for(resultCt=0; resultCt <= (leastCount-blockCount); resultCt++){
				expdList.push(expdList[resultCt % blockCount]);
			}
		}
		return expdList.join();//文字列で戻す
}
/**
	XPS オブジェクトから データテキストを保存用ウィンドウに出力
引数:Xps
戻値:
	false(リンクでアクセスするので動作抑制用)
 	xpsSourceText(AIR等のAdobe環境下ではXpsテキストを戻す)
*/
function writeXPS(obj)
{
	if(! nas.isAdobe){
		if(true){xUI.setStored("current");sync();};//書き出すのでフラグリセット(ブラウザのみ)
		_w=window.open ("","xpsFile","width=480,height=360,scrollbars=yes,menubar=yes");

		_w.document.open("text/plain");
		if(! MSIE && ! Firefox)_w.document.write("<html><body><pre>");
		_w.document.write(obj.toString());
		if(! MSIE && ! Firefox)_w.document.write("</pre></body></html>");
		_w.document.close();
		_w.window.focus();//書き直したらフォーカス入れておく

		return false;//リンクのアクションを抑制するためにfalseを返す
	}else{
		return obj.toString();
	};
}

/**
	XPSデータを印刷および閲覧用htmlに変換
	このファイルは、アプリケーションでの再読込不能
*/
function printHTML(mode){
//モードあり true時はボディをそのままリザルトするがfalseの際は別ウィンドウを開いて書き出す
if(mode){mode=true}

var myBody="";
myBody+='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja">';
myBody+='<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>';
myBody+=XPS.scene.toString()+XPS.cut.toString();
// myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="http://www.nekomataya.info/test/remaping/template/printout.css">';
myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="http://localhost/~kiyo/remaping.js/template/printout.css">';//for TEST
myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="http://www.nekomataya.info/test/remaping.js/template/printout.css">';//for TEST-on-site
//myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="./template/printout.css">';
myBody+='<style type="text/css"> * { margin: 0; padding: 0;} #fixed {position: fixed;} #sheet_view {  margin:0; }</style></head><body><div id="sheet_body">';

	for (Page=1 ;Page <=Math.ceil(XPS.duration()/xUI.PageLength);Page++)
	{
		myBody+= xUI.headerView(Page);
		myBody+= ' <span class=pgNm>( p '+nas.Zf(Page,3)+' )</span><br>';
		myBody+= xUI.pageView(Page);
	};
//myBody+='<div class="screenSpace"></div>';



myBody+='</div></body></html>';

if(mode){return myBody;}else{
_w=window.open ("","xpsFile","width=480,height=360,scrollbars=yes,menubar=yes");

	_w.document.open("text/html");
	_w.document.write(myBody);
	_w.document.close();

	_w.window.focus();//書き直したらフォーカス入れておく 保存扱いにはしない
	return false;//リンクのアクションを抑制するためにfalseを返す
}

}
/*
	File API を使用したデータの読み込み（ブラウザでローカルファイルを読む）
	File API　は、Chrome Firefoxではローカルファイルの読み出し可能だが、
	IE,Safari等他の環境では、情報取得のみ可能
	File.nameは、ブラウザではパスを含まないファイル名（＋拡張子）のみ。
	ただし、AIR環境ではフルパスのローカルFSパスが戻る。
	同じI.FをAIR環境でも使用するために、ケース分岐する。

*/
window.addEventListener('DOMContentLoaded', function() {
// ファイルが指定されたタイミングで、その内容を表示
  document.getElementById("myCurrentFile").addEventListener('change', function(e) {
    if(appHost.platform == "AIR"){
    // File APIを利用できるかをチェック
    if (window.File) {
      // 指定されたファイルを取得
      var input = document.getElementById('myCurrentFile').files[0];
	fileBox.currentFile=new air.File(input.name);
	xUI.data_well.value =fileBox.readContent();
         //　フラグを判定してチェックがあれば、そのまま読み込んで入出力パネルを閉じる。
	if(document.getElementById("loadShortcut").value!="false"){
		var myAction=document.getElementById("loadShortcut").value;
switch (myAction){
case "body":		if(XPS.readIN(xUI.data_well.value)){
			xUI.init(XPS);nas_Rmp_Init();xUI.sWitchPanel("clear");
		}else{alert("error reading body : ")};
break;
case "ref":	var myStream=convertXps(xUI.data_well.value,"",{},true);
		if(xUI.referenceXPS.readIN(myStream)){
			nas_Rmp_Init();xUI.sWitchPanel("clear");
		}else{alert("reading-Ref : ")};
break;
}
		document.getElementById("loadShortcut").value="false";
	}
 }
    }else{
    // File APIを利用できるかをチェック
    if (window.File) {
      // 指定されたファイルを取得
      var input = document.getElementById('myCurrentFile').files[0];
	var myEncode=(input.name.match(/\.(ard|csv|tsh)$/))?"Shift-JIS":"UTF-8";
if(window.FileReader){
//if(false){}
      // ファイルリーダーオブジェクト初期化(Chrome/Firefoxのみ)
      var reader = new FileReader();
      // ファイルの読み込みに成功したら、その内容をxUI.data_wellに反映（2）
      reader.addEventListener('load', function(e) {
        var output = reader.result;//
        xUI.data_well.value = output;
      //　フラグを判定してチェックがあれば、そのまま読み込んで入出力パネルを閉じる。
	if(document.getElementById("loadShortcut").value!="false"){
	var myAction=document.getElementById("loadShortcut").value;
switch (myAction){
case "body":
		if(XPS.readIN(xUI.data_well.value)){
			xUI.init(XPS);nas_Rmp_Init();xUI.sWitchPanel("clear");
		}else{alert("reading-Body : "+xUI.errorMsg[XPS.errorCode] )};
break;
case "ref":
		if(xUI.referenceXPS.readIN(convertXps(xUI.data_well.value,'',{},true))){
			nas_Rmp_Init();xUI.sWitchPanel("clear");
		}else{alert("error reading ref :")};
break;
}
		document.getElementById("loadShortcut").value="false";
	}
      }, true);
      // ファイルの内容をテキストとして取得（3）
      reader.readAsText(input, myEncode);
}else{
//FileReaderが無いブラウザ(Safari等)では、お詫びしてオシマイ
	alert("no FileReader! :\n　このブラウザはFileReaderオブジェクトをサポートしていません。\n残念ですが、この環境ではローカルファイルは読みだし出来ません。\nThis browser does not support the FileReader object. \n Unfortunately, you can't read local files now.");
}
    }
   }
  }, true);//myCrrentFile.addEvent
});//window.addEvent


/*
	テンプレートを利用したeps出力
テンプレートは、サーバ側で管理したほうが良いのだけど　一考

*/
/*
	XPSから出力に必要な本体データを切り出し、1ページづつepsエンコードして返す

	引数は整数　ページナンバー 1から開始
	引数が0 又は引数なしは全ページリザルト
	ページが存在しない場合は空データを返す
*/
getBodyData=function(myPage){

	var startCount=0;var endCount=XPS.duration();
	if((myPage > 0 )&&(myPage <= Math.ceil(XPS.duration()/xUI.PageLength))){
		startCount=(myPage-1)*xUI.PageLength;
		endCount=(endCount>(startCount+xUI.PageLength))?startCount+xUI.PageLength:endCount;
	}else{
		if(myPage > Math.ceil(XPS.duration()/xUI.PageLength))return "";
	}
	var myBody= new Array();
	for (var frm=startCount;frm<endCount;frm++){
		for(var col=0;col<(XPS.xpsTracks.length);col++){
		  var currentData=XPS.xpsTracks[col][frm];
		if (currentData.match(/^[|｜:]$/)){currentData=""}
		  myBody.push("\("+EncodePS2(currentData)+")");
		}
	}
	return myBody.join(" ");
}
/*
	リファレンスXpsから出力に必要なデータを切り出し、epsエンコードして返す
	横幅はリファレンスデータそのまま（コメント省略）
	継続時間が本体データを越えた部分をカットする（返すべきかも？）
	引数はページナンバー　1から開始
	引数が0　又は無ければ全ページを返す
	ページが存在しない場合は空データを返す
 */
getReferenceData=function(myPage){
	var startCount=0;var endCount=XPS.duration();
	if((myPage > 0 )&&(myPage <= Math.ceil(XPS.duration()/xUI.PageLength))){
		startCount=(myPage-1)*xUI.PageLength;
		endCount=(endCount>(startCount+xUI.PageLength))?startCount+xUI.PageLength:endCount;
	}else{
		if(myPage > Math.ceil(XPS.duration()/xUI.PageLength))return "";
	}
	var myRef= new Array();
	for (var frm=startCount;frm<endCount;frm++){
		for(var col=1;col<=xUI.referenceXPS.xpsTracks.length-1;col++){
			if(frm<xUI.referenceXPS.duration()){
              var currentData=xUI.referenceXPS.xpsTracks[col][frm];
              if (currentData.match(/^[|｜:]$/)){currentData=""}
              myRef.push("\("+EncodePS2(currentData)+")");
//			myRef.push("\("+EncodePS2(xUI.referenceXPS.xpsTracks[col][frm])+")");
			}
		}
	}
	return myRef.join(" ");
}
/*
	epsタイムシートに記載するデータを抽出してdata_wellの内容と置き換える
	エンコード注意


追加プロパティ

FrameRate	XPSから転記
PageRength	ｘUIから転記
PageColumns	xUIから転記
"camColumns"	現在固定　ただしカメラワーク指定可能になり次第xUIから転記

Columns	XPSの値から計算
	各フォーマットごとに規定数あり
	規定数以下なら規定数を確保（読みやすいので）
	規定数をオーバーした際は段組変更を警告
	A3 2段組　規定 6/3 最大8/4
	A3 1段組　規定10/5 最大18/9

トランジションの尺と注釈を転記してない！
MemoTextの前に挿入する　

この部分は epsExporter としてソース分離すべき
*/
var pushEps= function (myTemplate){
//テンプレート取得後に呼び出される。
 myTemplate=decodeURI(myTemplate);
/*====================置換え用データ生成
置き換えのためのキャリアオブジェクトを作成してevalを避ける　13/06/22
*/
	var sWap=[];
//フレームレートのドロップ処理をしていない、ドロップ処置が済むまでは小数点以下のレートは扱わない
	sWap.FileName="";
	sWap.FrameRate=new Number(XPS.framerate);
if(sWap.FrameRate%1 > 0){return false;}
	sWap.PageLength = xUI.SheetLength;//１ページの秒数（フレーム数にあらず）
	sWap.PageColumns = xUI.PageCols;//シートの段組はxUIを複写
	sWap.ActionColumns =(xUI.referenceXPS.xpsTracks.length < 10)? 8 :XPS.xpsTracks.length-2;

	sWap.DialogColumns =xUI.dialogSpan;//xUIのプロパティを作成するのでそれを参照

	sWap.Columns =(xUI.timingSpan < SheetLayers)? SheetLayers :xUI.timingSpan;//カラム数総計
	sWap.TimingColumns = xUI.timingSpan ;//xUIのプロパティを参照
	sWap.camColumns = (xUI.cameraSpan<CompositColumns)?CompositColumns:xUI.cameraSpan;//CompositColumns ; //現在固定4を標準にしてオーバー分を追加
//sWap.SpanOrder / Cam のビルド
spanWord=({
	still:"StillCellWidth",
	dialog:"DialogCellWidth",
	sound:"DialogCellWidth",
	timing:"CellWidth",
	replacement:"CellWidth",
	sfx:"SfxCellWidth",
	effect:"SfxCellWidth",
	camera:"CameraCellWidth"
});

	var SO=[];
	for (var ix=0; ix<sWap.Columns;ix++){
//	for (var ix=0; ix<sWap.TimingColumns;ix++){}
		if(ix<xUI.timingSpan){
		  SO.push( spanWord[XPS.xpsTracks[ix+xUI.dialogSpan-1].option] );
		}else{
		  SO.push('CellWidth');
		};
	}
	sWap.SpanOrder=SO.join(" ");
	var SOC=[];
	for (var ix=0; ix<sWap.camColumns;ix++){
		if(ix<xUI.cameraSpan){
		  SOC.push( spanWord[XPS.xpsTracks[ix+xUI.dialogSpan+xUI.timingSpan-1].option] );
		}else{
		  SOC.push('CameraCellWidth');
		};
	};
	sWap.SpanOrderCam=SOC.join(" ");
//トランジションテキストの組立
	sWap.transitionText="";

	if(XPS.trin[0]>0){
		sWap.transitionText+="△ "+XPS.trin[1]+'\('+nas.Frm2FCT(XPS.trin[0],3)+')';
	};
	if((XPS.trin[0]>0)&&(XPS.trout[0]>0)){	sWap.transitionText+=' / ';};
	if(XPS.trout[0]>0){
		sWap.transitionText+="▼ "+XPS.trout[1]+'\('+nas.Frm2FCT(XPS.trout[0],3)+')';
	};
	sWap.transitionText=EncodePS2(sWap.transitionText);

 sWap.timesheetDuration = XPS.duration();

	var ACL=[];
 for(var id = 0;id < 26; id++){
	if(id < xUI.referenceXPS.xpsTracks.length-2){
	 ACL.push("\("+EncodePS2(xUI.referenceXPS.xpsTracks[id+1].id)+")")
	}else{
	 ACL.push("\( )");
	}
 };
 sWap.ActionCellLabels  = ACL.join(" ");//
	var CL=[];
 for(var id = 0;id < 26; id++){
	if(id < xUI.timingSpan){
	 CL.push("\("+EncodePS2(XPS.xpsTracks[id + xUI.dialogSpan].id)+")");
	}else{
	 CL.push("\( )");
	}
 };
 sWap.CellLabels = CL.join(" ");

	var CCL=[];
 for(var id = 0;id < 26; id++){
	if(id < xUI.cameraSpan){
	 CCL.push("\("+EncodePS2(XPS.xpsTracks[id + xUI.timingSpan + xUI.dialogSpan].id)+")");
	}else{
	 CCL.push("\( )");
	}
 };
 sWap.CameraCellLabels = CCL.join(" ");
 
 sWap.TitleString =EncodePS2(XPS.title);//
 sWap.Opus = EncodePS2(XPS.opus);//
 sWap.SceneCut= EncodePS2(XPS.scene +" "+XPS.cut);//
 sWap.DurationString = EncodePS2("\("+nas.Frm2FCT(XPS.time(),3)+")");
 sWap.UserName = EncodePS2(XPS.create_user);//
 sWap.xpsRef = "";//getReferenceData();
 sWap.refLayers = xUI.referenceXPS.xpsTracks.length-1;
 sWap.xpsBody = "";//getBodyData();
 sWap.xpsLayers = XPS.xpsTracks.length;
 	var MT=XPS.xpsTracks.noteText.split("\n");

	var MTR=[];
 for(var id = 0 ;id < MT.length ; id++ ){MTR.push("\("+EncodePS2(MT[id])+")")};
 sWap.memoText = MTR.join("\n");

  var myDatas=["FileName",
"FrameRate",
"PageLength",
"PageColumns",
"ActionColumns",
"DialogColumns",
"Columns",
"TimingColumns",
"camColumns",
"timesheetDuration",
"SpanOrder",
"SpanOrderCam",
"ActionCellLabels",
"CellLabels",
"CameraCellLabels",
"TitleString",
"Opus",
"SceneCut",
"DurationString",
"UserName",
"PageNumber",
"PageCount",
"xpsRef",
"refLayers",
"xpsBody",
"xpsLayers",
"transitionText",
"memoText"
  ];

//	var myContent=document.getElementById("data_well").value;
 var epsBodys=[];
 var pages=Math.ceil(XPS.duration()/xUI.PageLength);//ページ長で割って切り上げ
//	１ページづつ変換してストア
 for(var pageCount=0;pageCount<pages;pageCount++){

 if(pageCount>0){
  sWap.FileName=xUI.getFileName()+"_"+sWap.pageCount;
  sWap.memoText=" ";
  sWap.transitionText="";
 }else{
  sWap.FileName=xUI.getFileName();
 }

	sWap.PageNumber=((pageCount+1)==pages)? "end / "+ pages:(pageCount+1)+" / "+ pages;
	sWap.PageCount= pageCount+1;

 sWap.xpsRef=getReferenceData(pageCount+1);
 sWap.xpsBody=getBodyData(pageCount+1);

 epsBodys[pageCount]=myTemplate;

  for(var count=0;count<myDatas.length;count++){
	var myRegex=new RegExp("=="+myDatas[count]+"==");
	var swapData=sWap[myDatas[count]];
	epsBodys[pageCount]=epsBodys[pageCount].replace(myRegex,swapData);
  }
 }
//置き換え終了したデータは、データウェルに流しこみ。かつチェックがあればダウンロードCGIに送る
	document.getElementById("data_well").value="";//クリア
	var myCount=0;
	var myContents=[]
 for(var pageCount=0;pageCount<pages;pageCount++){
	document.getElementById("data_well").value+=epsBodys[pageCount];
	if(document.getElementById("exportCheck").checked){

	 switch (appHost.platform){
case "AIR":
case "CSX":
case "CEP":
		myContents.push(epsBodys[pageCount]);//配列にスタックする 配列の要素数が処理判定
//		if(fileBox) { myCount=fileBox.storeOtherExtensionFile(epsBodys[pageCount],"eps");}
	//このルーチンではページ毎の処理ができないのであまり良くない
	//SJIS化もできていないのでOUT callEchoEpsに準じた処理が必要　CEP CSXも同様の処理が必要
	//さらにローカル保存なのでロケーション指定を一箇所にして連番処理に
//		alert(pageCount+":"+myCount);
break;
default:
		Count=callEchoEps(epsBodys[pageCount],xUI.getFileName(),pageCount+1);//ページカウントはオリジン0なので加算して送る
//		alert(pageCount+":"+myCount);
	 }

	}
 }
 //AIR/CSX/CEPの環境ではループしてスタックしたデータを配列で渡す
		if((fileBox)&&(myContents.length)) { myCount=fileBox.storeOtherExtensionFile(myContents,"eps");}
// alert ("myCount :"+myCount); 
}

function exportEps(myTemplate){
	var url="./template/blank.txt";
	switch(myTemplate){
case	"A3":url="./template/timeSheet_epsA3.txt";break;
default:url="./template/timeSheet_eps.txt";
	}
	myAjax= jQuery.ajax({
		type    :"GET",
		 url    : url ,
		dataType:"text",
		success : pushEps
	});
};

//htmlUIなのでここじゃないんだけどパネル関連ということで暫定的にこちら
/*
	試験的にjQueryでフローティングウインドウ
*/

jQuery(function(){
    jQuery("a.openTbx").click(function(){
        jQuery("#optionPanelTbx").show();
        return false;
    })
    
    jQuery("#optionPanelTbx a.close").click(function(){
        jQuery("#optionPanelTbx").hide();
        return false;
    })
    jQuery("#optionPanelTbx a.minimize").click(function(){
        if(jQuery("#optionPanelTbx").height()>100){
           jQuery("#formTbx").hide();
           jQuery("#optionPanelTbx").height(24);
	}else{
           jQuery("#formTbx").show();
           jQuery("#optionPanelTbx").height(165);
	}
        return false;
    })
    jQuery("#optionPanelTbx dl dt").mousedown(function(e){
        
        jQuery("#optionPanelTbx")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelTbx").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelTbx").offset().top);
        
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelTbx").css({
//                top:e.pageY  - jQuery("#optionPanelTbx").data("clickPointY")-document.getElementById("fixedHeader").clientHeight+myOffset.top+"px",
                top:e.pageY  - jQuery("#optionPanelTbx").data("clickPointY")+myOffset.top+"px",
                left:e.pageX - jQuery("#optionPanelTbx").data("clickPointX")+myOffset.left+"px"
            })
        })
        
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
        
    })
});
/*
// IE用コードとのこと　今回はもうIEは動作対象外なので勘弁
jQuery("#optionPanelTbx dl dt").mousedown(function(e){
    jQuery("body").bind('selectstart', function(){
        return false;
    })
}).mouseup(function(){
    jQuery("body").unbind('selectstart');
})

*/
