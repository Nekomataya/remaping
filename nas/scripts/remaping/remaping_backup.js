/*
	Remaping本体スクリプト
	XPSオブジェクトとMAPオブジェクトについては、
	以下のドキュメントを参照のこと
		http://www.nekomataya.info/remaping/teck.html
	$Id: remaping.js,v 1.66 2014/11/29 kiyo Exp $
CEP動作のための修正開始
*/
// http://d.hatena.ne.jp/amachang/20071010/1192012056 //
/*@cc_on _d=document;eval('var document=_d')@*/

//UIコントロールオブジェクトを作成、初期化
function new_xUI()
{
	var	xUI=new Object();

if (true){
	xUI.errorCode	=	0;
	xUI.errorMsg=[
"000:最終処理にエラーはありません",
"001:データ長が0です。読み込みに失敗したかもしれません",
"002:どうもすみません。このデータは読めないみたいダ",
"003:読み取るデータがないのです。",
"004:変換すべきデータがありません。\n処理を中断します。",
"005:MAPデータがありません",
"006:ユーザキャンセル",
"007:",
"008:",
"009:想定外エラー"
];
}

	//UIオブジェクト初期化前の未定義参照エラーを回避するためのダミーメソッド
	xUI.Mouse=function(evt){return true;};
	//初期化前にバックアップデータの処理が発生するので暫定的に初期化しておく
	xUI.backupStore	="12345";	//作業バックアップ

//	初期化メソッド 編集対象となるXPSオブジェクトを与えて初期化する。
xUI.init	=function(XPS)
{
	this.dialogSpan	=SoundColumns;//シート上の配置に合わせてXPSを初期化する
	this.timingSpan	=SheetLayers;
	this.cameraSpan	=CompositColumns;

	this.dialogCount=SoundColumns;//タイムライン種別数控え
	this.stillCount	=0;//背景を標準的に読み込み場合はここに数値を入れる
	this.timingCount=SheetLayers;//
	this.sfxCount	=0;//
	this.cameraCount=CompositColumns;//空欄でも良いと思われるが

	this.XPS=XPS;//XPSを参照するオブジェクト(将来の拡張用)
	this.referenceXPS=new Xps(4,72)//参照用XPSを保持するオブジェクト(初期値はfalse)

	this.viewMode	=ViewMode;	//表示モード Compact/WordProp

	this.spinValue	=SpinValue;	//スピン量
	this.spinSelect =SpinSelect;	//選択範囲でスピン指定
	this.sLoop	=SLoop;	//スピンループ
	this.cLoop	=CLoop;	//カーソルループ
	this.SheetLength	=SheetLength;	//タイムシート1枚の表示上の秒数 コンパクトモードではシート長を収まる秒数に強制
//コンパクトモード時はこのプロパティとcolsの値を無視するように変更
	this.SheetWidth= XPS.layers.length+2;//シートの幅(編集範囲)

	this._checkProp=function(){
//XPSをチェックしてxUIのシートビュープロパティを更新
	this.dialogCount=1;this.stillCount=0;this.timingCount=0;this.sfxCount=0;this.cameraCount=0;
	this.dialogSpan=0;this.cameraSpan=0;
for(var idx=0;idx<XPS.layers.length;idx++){
	switch(XPS.layers[idx].option){
	 case "dialog": this.dialogCount++;break;
	 case "still" : this.stillCount++ ;break;
	 case "sfx"   : this.sfxCount++   ;break;
	 case "camera": this.cameraCount++;break;
	 case "timing": ;
	 default:       this.timingCount++;break;
	};
	if((XPS.layers[idx].option!="dialog")&&(! this.dialogSpan)){this.dialogSpan=this.dialogCount};
	if((XPS.layers[idx].option=="timing")||(XPS.layers[idx].option=="still")){this.cameraSpan=XPS.layers.length-idx-1};
//カウントする、ただしこのルーチンはこの後プロパティに変換してレイヤ数が変わるたびにプロパティとして変更するように変更されるべき。
}
	this.timingSpan=XPS.layers.length-(this.cameraSpan+this.dialogSpan-1);
	this.SheetWidth=XPS.layers.length+2;
	}
	this._checkProp();
	this.PageLength=this.SheetLength*Math.ceil(XPS.framerate);//1ページの表示コマ数を出す
//	1秒のコマ数はドロップを考慮して切り上げ
	this.cPageLength=Math.ceil(XPS.framerate);//カラム長だったけど一秒に変更

	this.sheetSubSeparator	=SheetSubSeparator;//サブセパレータの間隔
	this.PageCols	=SheetPageCols;	//シートのカラム段数。
				//	実際問題としては１または２以外は使いづらくてダメ
				//	コンパクトモードでは1段に強制するのでこの値を無視する
	this.fct0	=Counter0;	//カウンタのタイプ
	this.fct1	=Counter1;	//二号カウンタはコンパクトモードでは非表示



	this.favoriteWords	=FavoriteWords;	//お気に入り単語
	this.footMark	=FootMark;//フットマーク機能フラグ
	this.autoScroll	=AutoScroll;//自動スクロールフラグ
	this.tabSpin	=TabSpin;//TABキーで確定操作

	this.noSync	=NoSync;//入力同期停止

	this.blmtd	=BlankMethod;	//カラセル方式デフォルト値
					//["file","opacity","wipe","expression1","expression2"];
	this.blpos	=BlankPosition;	//カラセル位置デフォルト値
					//["build","first","end","none"]

	this.fpsF	=FootageFramerate;	//フッテージのフレームレート
							//コンポサイズdefeult
	this.dfX	=defaultSIZE.split(",")[0];	//コンポサイズが指定されない場合の標準値
	this.dfY	=defaultSIZE.split(",")[1];	//
	this.dfA	=defaultSIZE.split(",")[2];	//
	this.timeShift	=TimeShift;	//読み込みタイムシフト
//yank関連
	this.yankBuf="";	//ヤンクバッファは、comma、改行区切りのデータストリームで
//undo関連
	this.flushUndoBuf();
//ラピッド入力モード関連
	this.eXMode=0;	//ラピッドモード変数(0/1/2/3)
	this.eXCode=0;	//ラピッドモード導入キー変数
//シート入力関連
	this.eddt="";	//編集バッファ
	this.edchg=false;	//編集フラグ
//	this.Focus=false;	//シートフォーカス

	this.activeInput=null;//アクティブ入力エレメントを保持
//	アクセス頻度の高いDOMオブジェクトの参照保持用プロパティ
	this["data_well"]=document.getElementById("data_well");//データウェル
	this["snd_body"]=document.getElementById("snd_body");//音声編集バッファ
/*	アクティブ入力エレメント切り換えメソッド
	xUI.activate(target);
		targetとしてキーワードを
		["tool_","sheet"]ほかは廃止済
*/
this.activate= function(target){this.activeInput=target;};	
/*	
	this.edChg(status boolean)
	セル編集フラグ 切り替えと同時に表示を調整
*/
this.edChg=function(status)
{
	this.edchg=status;

	document.getElementById("edchg").style.backgroundColor=
	(this.edchg)?
	this.editingColor:"";//表示
};
//
if(! this.SWap){
	this.tbap=false;	//ツールボックスを使用しているか否かのフラグ
	this.tool_=null;	//ツールボックスオブジェクト参照用変数
	this.pfap=false;	//プリファレンスを使用しているか否かのフラグ
	this.pref=null;		//プリファレンスオブジェクト参照用変数


	this.SWap=new Array();//サブウィンドウ表示情報格納用
	this.SWsz=new Array();//サブウィンドウサイズ格納用
		this.SWap["writeout_"]=false;
			this.SWsz["writeout_"]=[512,480];
		this.SWap["tool_"]=false;
			this.SWsz["tool_"]=[360,360];
		this.SWap["pref_"]=false;
			this.SWsz["pref_"]=[400,300];
		this.SWap["scene_"]=false;
			this.SWsz["scene_"]=[512,480];
		this.SWap["about_"]=false;
			this.SWsz["about_"]=[420,420];
		this.SWap["data_"]=false;
			this.SWsz["data_"]=[512,400];
		this.SWap["dbg_"]=false;
			this.SWsz["dbg_"]=[512,400];

//サブウィンドウオブジェクト
	this["writeout_"]	=new Object();
	this["tool_"]	=new Object();
	this["pref_"]	=new Object();
	this["scene_"]	=new Object();
	this["about_"]	=new Object();
	this["data_"]	=new Object();
	this["dbg_"]	=new Object();
/*
	ウィンドウ構成変更にしたがって変更要 後で調整 07/08/06
*/
};

//以下インターフェースカラー設定
	this.sheetbaseColor	=SheetBaseColor;	//タイムシート背景色
	this.sheetblankColor	=SheetBlankColor;	//編集不可領域の背景色
	this.footstampColor	=FootStampColor;	//フットスタンプの色
	this.inputModeColor	=new Object();		//入力モード色
		this.inputModeColor.NORMAL	=SelectedColor;	//
		this.inputModeColor.EXTEND	=RapidModeColor;	//
	this.selectedColor	=this.inputModeColor.NORMAL;	//選択セルの背景色
	this.selectionColor	=SelectionColor;	//選択領域の背景色
	this.editingColor	=EditingColor;	//セル編集中のインジケータ
	this.selectingColor	=SelectingColor;	//セル選択中のインジケータ
	this.sectionNodeColor =SectionNodeColor;	//範囲編集中の色
//タイムライン・ラベル識別カラ－
	this.cameraColor=nas.colorAry2Str(div(add([0,1,0],mul(nas.colorStr2Ary(SheetBaseColor),6)),7));
	this.sfxColor=nas.colorAry2Str(div(add([0,0,1],mul(nas.colorStr2Ary(SheetBaseColor),5)),6));
	this.stillColor=nas.colorAry2Str(div(add([1,0,0],mul(nas.colorStr2Ary(SheetBaseColor),6)),7));//タイムライン全体に着色

//中間色自動計算
		this.inputModeColor.NORMALspin=nas.colorAry2Str(div(add(nas.colorStr2Ary(SelectedColor),mul(nas.colorStr2Ary(SheetBaseColor),3)),4));
		this.inputModeColor.EXTENDspin=nas.colorAry2Str(div(add(nas.colorStr2Ary(RapidModeColor),mul(nas.colorStr2Ary(SheetBaseColor),3)),4));

		this.inputModeColor.NORMALselection=nas.colorAry2Str(div(add(nas.colorStr2Ary(SelectedColor),mul(nas.colorStr2Ary(SelectionColor),3)),4));
		this.inputModeColor.EXTENDselection=nas.colorAry2Str(div(add(nas.colorStr2Ary(RapidModeColor),mul(nas.colorStr2Ary(SelectionColor),3)),4));

		this.inputModeColor.NORMALeddt=nas.colorAry2Str(div(add(nas.colorStr2Ary(SelectedColor),mul([1,1,1],8)),9));
		this.inputModeColor.EXTENDeddt=nas.colorAry2Str(div(add(nas.colorStr2Ary(RapidModeColor),mul([1,1,1],8)),9));

	this.spinAreaColor	=this.inputModeColor.NORMALspin;
	this.spinAreaColorSelect=this.inputModeColor.NORMALselection;

		this.sectionBodyColor =nas.colorAry2Str(div(add(nas.colorStr2Ary(SectionNodeColor),mul(nas.colorStr2Ary(SheetBaseColor),3)),4));

//そのほか
	this.keyMethod		=KEYMethod;	//キー変換方式
	this.aeVersion		=AEVersion;	//キーにつけるバージョン番号

///////////
//データ配列に対してUIオブジェクトにフォーカス関連プロパティ設置

				//[カラム,フレーム]
				//初期値は非選択状態
	this.Select	=[1, 0];
				//シート上のフォーカスセル位置
				//選択位置・常にいずれかをセレクト
	this.Selection	=[0, 0];
				//選択範囲・ベクトル正方向=右・下

};

//	xUIオブジェクト初期化終了 以下メソッド
//
/*
	現在のファイルからファイル名を作成
*/
xUI.getFileName=function(){
	myResult=myFileName;
	myResult=myResult.replace(/\$TITLE/g,XPS.title);
	myResult=myResult.replace(/\$SUBTITLE/g,XPS.subtitle);
	myResult=myResult.replace(/\$OPUS/g,XPS.opus);
	myResult=myResult.replace(/\$SCENE/g,XPS.scene);
	myResult=myResult.replace(/\$CUT/g,XPS.cut);
	myResult=myResult.replace(/\$TIME/g,XPS.time());
	myResult=myResult.replace(/\$TC/g,XPS.getTC(XPS.time()));
	return myResult;
}
/*	シートボディフラッシュ
		xUI.flush(content)
		現在のシートの入力領域をすべてcontentで埋める
		戻り値は常にtrue
*/
//
xUI.flush=function(content){
	if(! content){content=""};
//強制的にnullデータで全レイヤ・全フレームを書き換え
	var myDuration=XPS.duration();
//	タイムラインループ
	for (T=0;T<XPS.xpsBody.length;T++){
//		フレームループ
		for(F=0;F<myDuration;F++){
			try {XPS.xpsBody[T][F]=content}catch(e) {alert(e);return;};
		};
	};
	return true;
};

/*	undoバッファ初期化
		undoバッファをクリアして初期化
*/
xUI.flushUndoBuf=function(){

	this.inputFlag="nomal";//入力フラグ["nomal","undo","redo"]
	this.undoStack=new Array();//アンドウスタック
		this.undoStack.push([[0,1],[0,0],'']);
//		データは [セレクト座標,セレクション,入力データ]
//	座標と選択範囲は配列で、入力データはcomma、改行区切りで2次元のstream
	this.undoPt=0;	//アンドウポインタ
	this.storePt=0;	//保存ポインタ初期化
//リセットタイミングは 保存・ダウンロード・新規作成(ココ)
	this.Backupdata=new Array();//編集バックアップトレーラ
	this.activeInput=null;//アクティブ入力ポインタ
};
/*
	保存ポインタを参照してドキュメントが保存されているか否かを返す関数
	保存状態の変更とリセットも可能

 */
xUI.isStored=function(){return (this.undoPt==this.storePt)};//このリザルトが保存状態を表す
xUI.setStored=function(myPt){
	switch(myPt){
	case "current":this.storePt=this.undoPt;
	break;
	case "zero":this.storePt=0;
	break;
	case "force":this.storePt=-1;//常にfalseになる値
	break;
	default:
		if(myPt>=0){
			this.storePt=Math.floor(myPt);//正の数値ならその数値を整数でセット
		}
	}
	return (this.undoPt==this.storePt);//セット後の状態を戻す
};
/*
	作業用バックアップオブジェクト
	ユーザによる保存指定可能
	明示的に破棄することが可能
	実行環境の違いによる動作の違いはメソッド内で吸収する。

	xUI.setBackup();現在の作業バックアップをストアする
	xUI.getBackup();現状のバックアップデータを返す　バックアップデータがない場合はfalse
	xUI.clearBackup();現在のバックアップデータを廃棄する。
*/
xUI.setBackup=function(){
/*
	保存・レストア・削除を一つのメソッドに統一して処理する。
	プラットフォーム別の処理分岐はメソッド側で処置
*/

//html5対応 localStorageに対して保存する。AIRはWebStorageが無い
	if(localStorage){
		localStorage.setItem("info.nekomataya.remaping.backupData",XPS.toString());
		alert("バックアップ領域に現在のデータを退避しました。");
	}else{
		//localStorageのないブラウザならサーバストア・CGIダウンロード　どちらもダメなら別ウインドウに書き出し
//CGIダウンロード時にはリスタートが実行されるのでその部分の排除コードが必要
//↑==callEcho時点で先行で保存フラグを立てれば自動的に回避可能
		//AIRならsaveAs tempSave モーダル保存があった方がよいかも
if(fileBox.saveFile){fileBox.saveFile();}else{writeXPS(XPS);}
//		alert("バックアップ保存処理はまだ実装されていません");
	}
//==================================== ここまでをシステムバックアップメソッドに移行
};

xUI.getBackup =function(){
//
	var myBackup=localStorage.getItem("info.nekomataya.remaping.backupData");
	if(myBackup!==null){
	  if(confirm("バックアップデータをシートに読み込みます。\n現在のデータは失われます。\nよろしいですか？")){
	    document.getElementById("data_well").value=myBackup;
	    if(XPS.readIN(xUI.data_well.value)){xUI.init(XPS);nas_Rmp_Init();}
	  }
	}else{
	  alert("現在、バックアップ領域にデータがありません。")
	}
}
xUI.clearBackup =function(){
	var myBackup=localStorage.removeItem("info.nekomataya.remaping.backupData");
	alert("バックアップ領域をクリアしました。");
}
/*	未保存時の処理をまとめるメソッド
未保存か否かを判別してケースごとのメッセージを出す
ユーザ判断を促して処理続行か否かをリザルトする
*/
xUI.checkStored=function(mode){
if(!mode){mode=null;}
	if(xUI.isStored()){return (true)};//保存済みなら即 true
if(fileBox.saveFile){
var	msg ="ドキュメントが保存されていません 保存しますか？";
//ドキュメントの保存・保存しないで更新・処理をキャンセルの３分岐に変更 2013.03.18
	msg+="\nOK:保存する /Cancel:保存せずに続行\n";
//	msg+="\nYes:保存する /No:保存しないで更新 /Cancel:処理をキャンセル\n";
//	nas.showModalDialog("confirm2",msg,"ドキュメント更新",0,
/*
	function(){
	switch (this.status){
case 0:;//yes 保存処理　後でテンポラリファイルを実装しておくこと		
			fileBox.openMode=mode;//ファイル保存に続行処理モードが必要　デフォルトは保存のみ
			fileBox.saveFile();
break;
case 1:;
break;
case 2:;
break;
	}
);
*/
	var myAction=confirm(msg);
	if(myAction){
		//保存処理　後でテンポラリファイルを実装しておくこと		
			fileBox.openMode=mode;//ファイル保存に続行処理モードが必要　デフォルトは保存のみ
			fileBox.saveFile();
			return false;
	}else{
		xUI.setStored("current");sync();return true;// キャンセルの場合は保存しないで続行
	}
}else{
var	msg ="ドキュメントが保存されていません 書き出しますか？";
	msg+="\nOK:保存する /Cancel:保存せずに続行\n";
	var myAction=confirm(msg);
	if(myAction){
		//保存処理　後でテンポラリファイルを実装しておくこと		
			writeXPS(XPS);xUI.setStored("current");sync();
			return true
//HTMLモードの保存は頻繁だと作業性が低下するので一考
			if(ServiceUrl){callEcho()};//CGIエコー

	}else{
		//破棄して続行
		xUI.setStored("current");sync();return true
	}
}
}

/*	画面サイズの変更時等にシートボディのスクロールスペーサーを調整する
	固定ヘッダとフッタの高さをスクロールスペーサーと一致させる
	2010.08.28
	引数なし
 */
xUI.adjustSpacer=function(){
// ////////////alert("start adjust : "+$("#app_status").offset().top +":"+document.getElementById("fixedHeader").clientHeight );
    var headHeight=(this.viewMode=="Compact")? $("#app_status").offset().top-$("#pMenu").offset().top:document.getElementById("fixedHeader").clientHeight;
//　ケースによりでっかい値を返してるのはこれ？？
//    var headHeight=document.getElementById("fixedHeader").clientHeight;
//	var headHeight=document.getElementById("fixedHeader").clientHeight;
//	var footHeight=document.getElementById("fixedFooter").clientHeight;
//	document.getElementById("scrollSpaceHd").style.height=headHeight+"px";
//	document.getElementById("scrollSpaceFt").style.height=footHeight+"px";
//	document.getElementById("scrollSpaceHd").style.height=(footHeight+headHeight)+"px";
 var myOffset=(this.viewMode=="Compact")? $("#app_status").offset().top-headHeight:0;
// ////////// alert("viewMode :"+this.viewMode +"\n adjust myOffset :"+myOffset+"\n headHeight :"+headHeight);
//	document.getElementById("scrollSpaceHd").style.height=myOffset+"px";
	document.getElementById("scrollSpaceHd").style.height=(headHeight-myOffset)+"px";

	document.getElementById("UIheaderScrollH").style.top=(headHeight+$("#app_status").height())+"px";
	document.getElementById("UIheaderFix").style.top=(headHeight+$("#app_status").height())+"px";
	document.getElementById("UIheaderScrollV").style.top=(headHeight+$("#app_status").height())+"px";

	document.getElementById("scrollSpaceFt").style.height="1 px";

}
/*	指定された大きさにシートを書き直す。
		xUI.reInitBody(newTimelines,newDuration);
	元データは可能な限り維持
	undoの構造上サイズが変わると弊害が大きいので
	undoバッファは初期化する。undoを改装するまでは必須

	データ構造上Xpsのメソッドの方が良いので、
	データ改変部分をXPSlibに移動して
	ここではXPSのメソッドを呼び出す形式に変更　2013.02.23
 */
xUI.reInitBody=function(newTimelines,newDuration){
	var oldWidth=XPS.xpsBody.length;
		if(! newTimelines) newTimelines=oldWidth;
	var oldDuration=XPS.duration();
		if(! newDuration ) newDuration =oldDuration;
	if(newTimelines<3 || newDuration<=0){return false;};
	var widthUp=(newTimelines > oldWidth)?	true:false;
	var durationUp=(newDuration > oldDuration)?	true:false;
if(false){
	XPS.xpsBody.length=newTimelines;//配列長(タイムライン数)の設定

//延長したらカラデータで埋めとく
		if(widthUp){
			for (i=0;i<oldWidth;i++)
			{
				XPS.xpsBody[i].length=newDuration;
				if(durationUp){
					for(f=oldDuration;f<newDuration;f++){XPS.xpsBody[i][f]='';};
				};
			};
			for (i=oldWidth;i<newTimelines;i++)
			{
				XPS.xpsBody[i]=new Array(newDuration);
//if(durationUp)
				for(f=0;f<newDuration;f++){XPS.xpsBody[i][f]='';};
			};
		}else{
			for (i=0;i<newTimelines;i++)
			{
				XPS.xpsBody[i].length=newDuration;
				if(durationUp)
				{
					for(f=oldDuration;f<newDuration;f++){XPS.xpsBody[i][f]='';};
				};
			};
		};
//タイムラインが増えた場合は、再描画前にグループ情報の追加が必要・空データを自動生成してやる必要あり

	XPS["layers"].length=(newTimelines-2);//(現在決め打ち)
	if(widthUp){
		for(i=oldWidth-2;i<(newTimelines-2);i++){
		XPS["layers"][i]=new Array();//これ、今はarrayだけど後でコンストラクタ書くこと
 
		XPS["layers"][i]["name"]	="new"	;
		XPS["layers"][i]["sizeX"]	=XPS["layers"][oldWidth-3]["sizeX"]	;
		XPS["layers"][i]["sizeY"]	=XPS["layers"][oldWidth-3]["sizeY"]	;
		XPS["layers"][i]["aspect"]	=XPS["layers"][oldWidth-3]["aspect"]	;
		XPS["layers"][i]["lot"]	=XPS["layers"][oldWidth-3]["lot"]	;
		XPS["layers"][i]["blmtd"]	=XPS["layers"][oldWidth-3]["blmtd"]	;
		XPS["layers"][i]["blpos"]	=XPS["layers"][oldWidth-3]["blpos"]	;
		XPS["layers"][i]["option"]	=XPS["layers"][oldWidth-3]["option"]	;
		XPS["layers"][i]["link"]	=XPS["layers"][oldWidth-3]["link"]	;
		XPS["layers"][i]["parent"]	=XPS["layers"][oldWidth-3]["parent"]	;

		};
	};
}
	XPS.reInitBody(newTimelines,newDuration);
//このメソッドでは必ず初期化
	xUI.flushUndoBuf();
	xUI._checkProp();
	sync("undo");sync("redo");
};
xUI.switchStage=function(){
	alert("どうもすみません。\nこの機能はまだ実装されていません。");
};

xUI.setReferenceXPS=function(myXps){
		this.referenceXPS=myXps;
		sync("reference")
	}
//////

/*	テーブル表示用文字列置換
		xUI.trTd(Str);
	タグ等htmlで表示不能な文字を置き換え
	戻り値は変換後の文字列
*/
xUI.trTd=function(Str){
if(Str){
//alert(Str+" : "+pos);
	Str=Str.toString().replace( />/ig, "&gt;").replace(/</ig,"&lt;");
	if(this.Select[0]>0 && this.Select[0]<(this.SheetWidth-1)) Str=Str.toString().replace(/[\|｜]/ig,"<span class=v_bar>\|</span>");
//	if(Str.match(/^([\|;])$/)) return "<span class=v_bar>RegExp.$0</span>";//セリフ用には使えないので注意
	if(Str.match(/[-_─━~]{2,}?/)) return "<hr>";
return Str;
}else{
return "";
}
};
//
/*	XPSのプロパティの配列要素を"_"でつないで返す(シート上のidに対応)
		getId(要素名)
	現在は"Select"のみが有効値

*/

xUI.getid=function(name){

	if ((this[name].length==0)||(this[name][0]==null)){
		return '';
	}else{
		return this[name].join("_");
	};
};
/*	指定のセルを選択状態にする
		xUI.selectCell(HTMLElementID)
*/
xUI.selectCell=function(ID){

	if (!ID) ID='';
//if(dbg) document.getElementById("update_user").innerHTML=ID;//デバッグ用
if(dbg) document.getElementById("app_status").innerHTML=ID;//デバッグ用
//		移動なし かつ インプットボックスなし 編集なし ならば処理中止
	if (ID == this.getid("Select") && ! this.Focus && !this.edchg)
	{
//		ツールボックスがアクティブなら優先してフォーカスを入れる
		if (this.activeInput=="tool_")
		{	this["tool_"].document.getElementById("iNputbOx").focus();};
	};
//	現在のセレクトをフォーカスアウト
//		選択セルの内容をXPSの当該の値で置き換え
//		セルがINPUTで処理されていた場合の移動時の処置
/*	構成変更によりシート内input消滅
if(document.getElementById(this.getid("Select")).innerHTML.match(/^<INPUT.*>/i)){
	document.getElementById(this.getid("Select")).innerHTML=
		(XPS.xpsBody[xUI.Select[0]][xUI.Select[1]]=='')?
			'<br>':this.trTd(XPS.xpsBody[xUI.Select[0]][xUI.Select[1]]) ;
};
*/

//	引数が偽ならば フォーカスアウトのみ(ここでリターン)
	if(! ID){return;};
/*
	if (! ID)
	{
		if(false)
		{
			this.eXMode=0;this.eXCode=0;
		};
		return;
	};
*/
//新アドレスにフォーカス処理開始 = IDをセレクト

//指定IDが稼働範囲外だったら丸め込む
	var Layer = ID.split("_")[0]*1;
	var fRame = ID.split("_")[1]*1;

	if (Layer<0 || Layer>=this.SheetWidth)
	{	Layer=(Layer<0)?0:XPS.layers.length+1;};
	if (fRame<0 || fRame>=XPS.duration())
	{	fRame=(fRame<0)?0:XPS.duration()-1;};
	ID=Layer+'_'+fRame;
//	JQオブジェクトを取得
	var currentJQItem=$("#"+ID);
//	まずセレクションクリア
		this.selectionHi("clear");

//	フットマーク機能がオンならば選択範囲とそしてホットポイントをフミツケ
	if(this.footMark)
	{
//					== footmark ==
		paintColor=this.footstampColor;
	}else{
//					== clear ==
		paintColor=this.sheetbaseColor;
	};
//この辺まとめた方が良さそう?
	if(XPS.xpsBody[xUI.Select[0]][xUI.Select[1]]=='') paintColor=this.sheetbaseColor;

//足跡ぺったら
	document.getElementById(this.getid("Select")).style.backgroundColor=paintColor;

//フレームの移動があったらカウンタ更新フラグ立てる
		var fctrefresh = (fRame==this.Select[1])? false : true ;
//レイヤの移動があったらボタンラベル更新フラグ立てる
		var lvlrefresh = (Layer==this.Select[0])? false : true ;
//セレクト更新
	this.Select=[Layer, fRame];
		if(fctrefresh) sync("fct");//
		if(lvlrefresh) sync("lvl");//カウンタ同期
//入力同期
	this.selectionHi("hilite");	//選択範囲とホットポイントをハイライト
	this.bkup([XPS.xpsBody[Layer][fRame]]);	//編集前にバックアップする

// フォーカスが必要ならインプットボックスを作る
/*	修正版では試験的に排除中	*/

//	if(this.Focus)
	if(false)
	{
//新しいセルの横幅を取得してinputの横幅を調整
	var selectSize=(Layer>XPS.layers.length)? CommentWidth:SheetCellWidth;
		if(Layer==0){selectSize=DialogWidth;};

/*
本来的にはこちらが望ましいが、「りまぴん」では、パス。汎用オブジェクトの際は採用
	var selectSize=document.getElementById(ID).style.width;
	selectSize=selectSize.substring(0,selectSize.length-2)-3;
*/
	selectSize=selectSize*0.9;//サイズを9割に縮小

//データ配列の当該のIDのデータをバッファにおいて編集用のinputを生成
var	BODY_ ='<INPUT type=text name=iNputbOx id=iNputbOx value="';
BODY_+=	XPS.xpsBody[Layer][fRame];
BODY_+= '"	onKeyDown="return xUI.keyDown(event)"';
BODY_+= '	onKeyPress="return xUI.keyPress(event)"';
BODY_+= '	onKeyUp="return xUI.keyUp(event)"';
BODY_+= '	onFocus="select();xUI.activate(\'sheet\');" ';
BODY_+= '	class=IptBox ';
BODY_+= '	style="width:';
BODY_+= (selectSize + CellWidthUnit);
BODY_+= '" >';
	document.getElementById(ID).innerHTML= BODY_;
//alert("XX-"+document.getElementById(ID).innerHTML);
	};

//入力同期
if(false){
	syncInput(XPS.xpsBody[Layer][fRame]);	//新アドレスの値で入力エリアを同期
}else{
	var eddt=XPS.xpsBody[Layer][fRame];	//編集済データ取得
//	ヘッドライン
	if(document.getElementById("iNputbOx").value!=eddt)
	{	document.getElementById("iNputbOx").value=eddt;};//編集ラインに送る

//	ツールボックスへ送る
	if (this.SWap["tool_"])
	{
		if(this["tool_"].document.getElementById("iNputbOx").value!=eddt)
		{	this["tool_"].document.getElementById("iNputbOx").value=eddt;};
	};

};
/*	オートスクロールフラグが立っていたらスクロールを制御
	現在、オートスクロールで移動時にマウスによる選択処理をキャンセルしている
	オートスクロールのアルゴリズムが改善されたら処理を検討のこと
	コンパクトモードと通常モードで動作切り替え

	全体の位置に加えて、現在のスクーンサイズを条件に追加して使用感を改善すること
	2015-0331

オートスクロール起動条件
縦方向	セルフォーカスが表示範囲上下一定（６または８？）フレーム以内であること(上下別の条件に)
横方向　セルフォーカスが表示範囲左右一定（２～４？）カラム以内であること（左右別条件に）

かつ移動余裕があること=各条件がシート端からの距離以上であること


*/
if (this.autoScroll){
	this.scrollTo(ID);
// 入力ボックスあるならばフォーカスを入れる
	{
//		 this.riseSW();
		if (this.activeInput=="tool_")
		{
			this["tool_"].focus();
			this["tool_"].document.getElementById("iNputbOx").select();
//			this["tool_"].focus();
		}else{
			document.getElementById("iNputbOx").select();
		};
	};

}
if(false){
/*
//フォーカスのあるセルの座標
	var currentPos=[currentJQItem.position().left-$("body").scrollLeft(),currentJQItem.position().top-$("body").scrollTop()];
//表示範囲起点座標(compact)
	var currentOrigin=[$("#qdr1").offset().left+$("#qdr2").width(),$("#qdr1").offset().top+$("#qdr2").height()];
//表示幅
	var currenClipWidth=$(window).width()-currentOrigin[0];	var currenClipHeight=$(window).height()-currentOrigin[1];
*/
//スクロール 表示ライン
    if(this.viewMode=="Compact"){
//ライン位置 =コンパクトモード時はフレーム数そのもの
//ライン位置 =（消化ページのライン数）＋（ページ内のライン高さ）
	var Lpos=fRame;
//	Lpos=(Lpos<12)? 0:Lpos-12;
//シート全体のライン数 = UI上のシート長
	var Mlows=Math.ceil(XPS.duration()/XPS.framerate)*XPS.framerate;
//セル高さ
	var cellHeight=(document.getElementById("qdr4").clientHeight-document.getElementById("qdr1").clientHeight)/Mlows;
//スクリーン上の表示範囲（仮ライン数）
	var ViewRange =Math.round((window.innerHeight-document.getElementById("fixedHeader").clientHeight-document.getElementById("app_status").clientHeight)/cellHeight);

//	var ViewRange = 24;

//カラム判定　カーソルが何段目のタイムラインにあるか=タイムライン深度＋(１カラムのタイムライン数×(シート先頭からのフレーム数÷シート１枚あたりのライン数)) : 2減じて負数なら0
	var Cpos=1*Layer;
	Cpos=(Cpos<2)? 0:Cpos-2;
	var tableBodyWidth=
(36+48+48*XPS.layers.length+96);//要調整（概算なのでオブジェクトから取得したが良い）
//scrollさせる
	var moved=false;
	var myX=Math.floor(Cpos*Math.abs(32+tableBodyWidth-document.body.clientWidth)/((this.SheetWidth)-2));
	var myY=Math.floor(Lpos*((document.documentElement.scrollHeight-document.documentElement.clientHeight)/(Mlows-13)));
	var prevLeft=scrollX;var prevTop=scrollY;
	scrollTo(myX,myY);
	moved=(scrollX!=prevLeft);moved=(scrollY!=prevTop);
}else{
//ライン位置 =（消化ページのライン数）＋（ページ内のライン高さ）　12フレーム減じて負数なら0  
//コンパクトモード時は計算を変更
//ライン位置 =（消化ページのライン数）＋（ページ内のライン高さ）
	var Lpos=
Math.floor(fRame/this.PageLength)*(this.PageLength/this.PageCols)+(fRame%(this.PageLength/this.PageCols));
	Lpos=(Lpos<12)? 0:Lpos-12;
//シート全体のライン数 = 一段あたりのフレーム数×シート数
	var Mlows=
(Math.floor(this.PageLength/this.PageCols))*Math.ceil(XPS.duration()/this.PageLength);
//スクリーン上の表示範囲（仮ライン数）
	var ViewRange = 24;

//カラム判定　カーソルが何段目のタイムラインにあるか=タイムライン深度＋(１カラムのタイムライン数×(シート先頭からのフレーム数÷シート１枚あたりのライン数)) : 2減じて負数なら0
	var Cpos=
1*Layer + (XPS.layers.length + 2)*Math.floor((fRame%this.PageLength)/(this.PageLength/this.PageCols));
	Cpos=(Cpos<2)? 0:Cpos-2;
	var tableBodyWidth=
(36+48+48*XPS.layers.length+96)*this.PageCols;//要調整（概算なのでオブジェクトから取得したが良い）
//scrollさせる
	var moved=false;
/*
if(MSIE){
	var myX=Math.floor(Cpos*Math.abs(32+tableBodyWidth-document.body.clientWidth)/((this.SheetWidth)*this.PageCols-2));
	var myY=Math.floor(Lpos*((document.body.scrollHeight-document.body.clientHeight)/(Mlows-13)));
	var prevLeft=document.body.scrollLeft;var prevTop=document.body.scrollTop
	if(document.body.scrollLeft !=myX){document.body.scrollLeft=myX; moved=(prevLeft!=document.body.scrollLeft);};
	if(document.body.scrollTop  !=myY){document.body.scrollTop =myY; moved=(prevTop !=document.body.scrollTop);};
}else{
};
*/
	var myX=Math.floor(Cpos*Math.abs(32+tableBodyWidth-document.body.clientWidth)/((this.SheetWidth)*this.PageCols-2));
	var myY=Math.floor(Lpos*((document.documentElement.scrollHeight-document.documentElement.clientHeight)/(Mlows-13)));
	var prevLeft=scrollX;var prevTop=scrollY;
	scrollTo(myX,myY);
	moved=(scrollX!=prevLeft);moved=(scrollY!=prevTop);
    }
	if(moved){this.Mouse.action=false;};//マウス選択キャンセル
};
// 入力ボックスあるならばフォーカスを入れる
	{
//		 this.riseSW();
		if (this.activeInput=="tool_")
		{
			this["tool_"].focus();
			this["tool_"].document.getElementById("iNputbOx").select();
//			this["tool_"].focus();
		}else{
			document.getElementById("iNputbOx").select();
		};
	};
};
//
//
/*	sheetfocus廃止中
xUI.focusCell	=function(ID){

	//iNputbOxならば単にアクティブにして処理中断
	if(ID == "iNputbOx"){
		document.getElementById("iNputbOx").focus();
		document.getElementById("iNputbOx").select();
		return;
	};
	if(!ID){
		this.Focus=false;
		void(toss("iNputbOx"));
		ID=this.getid("Select");
	}else{
		this.Focus=true;
		if(this.eXMode)
		{
			this.eXMode=0;this.eXCode=0;
		this.selectedColor=this.inputModeColor.NORMAL;
		this.spinAreaColor=this.inputModeColor.NORMALspin;
		this.spinAreaColorSelect=this.inputModeColor.NORMALselection;
		this.spinHi();
		};
	};

//セレクトチェンジ
	this.selectCell(ID);
};
*/
/*	カラム移動
		xUI.changeColumn(カラムID,カラムブロック番号)
		カラムブロック番号は、タイムシートのひとかたまりのブロック番号
		2段シートならば第一ページにはブロック0および1がある
*/
xUI.changeColumn =function(ID,cols){
if(this.viewMode=="Compact"){
	var fr=this.Select[1];
}else{
//レイヤIDとカラムIDから移動位置を算出して実行。移動不能の場合は何もせずに復帰
	if(ID=="memo"){ID=XPS.layers.length + 1};

	var lineOffset=this.Select[1]-Math.floor(this.Select[1]/(this.PageLength/this.PageCols))*(this.PageLength/this.PageCols);//ラインオフセット
	var fr=cols*(this.PageLength/this.PageCols)+lineOffset;
	if(fr>=XPS.duration()){return};
}
	this.selectCell((ID).toString()+"_"+ fr.toString());
};
//
//
/*	マルチセレクト
		xUI.selection(ID)
		現在のカーソル位置からIDまでの範囲を選択状態にする
		引数が空なら選択解除
*/
xUI.selection =function(ID){

//現行のセレクションハイライトクリア
//選択範囲とホットポイントをフミツケ
	this.selectionHi("clear");
//IDがヌルならクリアのみでリターン
	if (ID==null)
	{
		this.Selection=[0 ,0];
		document.getElementById("edchg").style.backgroundColor="";//ここでUI表示をクリアする
		this.selectionHi("hilite");
		return;
	};
//ID値から、セレクションの値を導く
	this.Selection=
	[1*ID.split('_')[0]-1*this.Select[0],1*ID.split('_')[1]-1*this.Select[1]];
	document.getElementById("edchg").style.backgroundColor=this.selectingColor;//ここでUIインジケータ表示
	this.selectionHi("hilite");
};

/*	選択範囲のハイライト
		xUI.selectionHi(メソッド)
		範囲が許容外だった場合は範囲を維持して操作無し
		メソッドは["hilite","footmark","clear"]
*/
xUI.selectionHi	=function(Method)
{
switch (Method) {
case	"hilite"	:
				var paintColor=this.selectionColor;break;
case	"footmark"	:
				this.spinHi("clear");
				var paintColor=this.footstampColor;break;
case	"clear"		:
				this.spinHi("clear");
default			:
	var paintColor=this.sheetbaseColor;break;
};
var range=this.actionRange();
//新選択範囲をハイライト
	for (C=range[0][0];C<=range[1][0];C++){
		for (L=range[0][1];L<=range[1][1];L++){
			if(C>=XPS.xpsBody.length ||L>=XPS.xpsBody[C].length){
//	当座のバグ回避とデバッグ C.Lが操作範囲外だったときの処置 値を表示
//				dbgPut(range.toString());
			}else{
				if (!(this.Select[0]==C && ( this.Select[1]+this.spinValue > L && this.Select[1] <= L)))
				{
					if(Method=="hilite")
					{
						paintColor=xUI.selectionColor
					}else{
						if(this.footMark && XPS.xpsBody[C][L]!='')
						{
							paintColor=xUI.footstampColor;
						}else{
							paintColor=xUI.sheetbaseColor;
						};
					};
					if(nas.colorAry2Str(nas.colorStr2Ary(document.getElementById(C+"_"+L).style.backgroundColor))!=paintColor)
					{
						document.getElementById(C+"_"+L).style.
						backgroundColor=paintColor;//セレクションのリペイント
					};
				};
			};
		};
		if(Method=="hilite"){this.spinHi("put")};
	};
};

/*	スピン範囲のハイライト処理
		xUI.spinHi(メソッド)
		メソッドは["clear"]またはそれ以外
*/
xUI.spinHi = function(Method)
{
//選択ポイントのハイライトおよびスピン範囲のハイライト
//	必ず

if(Method=="clear")
{
	document.getElementById(this.getid("Select")).style.backgroundColor=this.footstampColor;
}else{
	document.getElementById(this.getid("Select")).style.backgroundColor=this.selectedColor;
};

//	スピン 1 以上を処理 選択範囲内外で色分け
	for(L=this.Select[1]+1;L<this.spinValue+this.Select[1];L++)
	{
		if(L > 0 && L < XPS.xpsBody[0].length){
			if(Method=="clear"){
if(XPS.xpsBody[this.Select[0]][L]!="" && this.footMark){
		document.getElementById(this.Select[0]+"_"+L).style.backgroundColor=this.footstampColor;//スピンエリア表示解除
}else{
if(document.getElementById(this.Select[0]+"_"+L).style.backgroundColor)
	document.getElementById(this.Select[0]+"_"+L).style.backgroundColor=this.sheetbaseColor;//スピンエリア表示解除
};
			}else{
if(L>(this.Selection[1]+this.Select[1]))
{
if(nas.colorAry2Str(nas.colorStr2Ary(document.getElementById(this.Select[0]+"_"+L).style.backgroundColor))!=this.spinAreaColor)
		document.getElementById(this.Select[0]+"_"+L).style.backgroundColor=this.spinAreaColor;//スピンエリア表示
}else{
if(nas.colorAry2Str(nas.colorStr2Ary(document.getElementById(this.Select[0]+"_"+L).style.backgroundColor))!=this.spinAreaColorSelect)
		document.getElementById(this.Select[0]+"_"+L).style.backgroundColor=this.spinAreaColorSelect;//スピンエリア表示
};
			};
		};
	};
};
//spinHi
/*	足跡をクリア
		xUI.footstampClear();
 */
xUI.footstampClear	=function(){

	if (this.footstampColor){
	var BGr=eval("0x"+this.footstampColor.substr(1,2));
	var BGg=eval("0x"+this.footstampColor.substr(3,2));
	var BGb=eval("0x"+this.footstampColor.substr(5,2));
} else {BGr=0;BGg=0;BGb=0;};
	var BGColor="rgb("+BGr+", "+BGg+", "+BGb+")";
	if (! this.footMark) {return;};
//足跡のお掃除
	for (c=0;c<(this.SheetWidth);c++){
		for(f=0;f<(XPS.duration());f++){
	if (this.getid("Select")!=(c+"_"+f)){
if (
document.getElementById(c+"_"+f).style.backgroundColor==BGColor ||
document.getElementById(c+"_"+f).style.backgroundColor==this.footstampColor){
document.getElementById(c+"_"+f).style.backgroundColor=this.sheetbaseColor;
};
	};
		};
	};
};
//
//
/*	足跡をチェック
		xUI.footstampPaint();
		現在のカーソル位置を控えて全選択して解除
		カーソル位置を戻す
 */
xUI.footstampPaint	=function(){

	var restoreValue=this.getid("Select");
		this.selectCell("0_0");
		this.selection((this.SheetWidth-1)+"_"+XPS.duration());
		this.selection();
		this.selectCell(restoreValue);
};
//
/*	タイムシート本体のヘッダを返すメソッド(ページ単位)
		xUI.headerView(pageNumber)
		引数はページ番号を整数で
		第一ページ以外は省略形を返す
		戻り値はページヘッダのHTMLテキスト
 */
xUI.headerView = function(pageNumber){

var Pages=(this.viewMode=="Compact")? 1:Math.ceil(XPS.duration()/this.PageLength);//ページ長で割って切り上げ
var	_BODY ='';
//----印字用ページヘッダ・第一ページのみシートヘッダ---//
if(pageNumber>1){
	_BODY+='<div class="pageBreak"> </div>';
	_BODY+='<br><table class=pageHeader>';
}else{
	_BODY+='<table class=sheetHeader>';
};
//　ページヘッダとシートヘッダの共通表示
	_BODY+='<tr><th class=opusLabel>No.</th><th class=titleLabel>TITLE</th><th class=scenecutLabel>S-C</th><th class=timeLabel>TIME</th><th class=nameLabel>name</th><th class=pageLabel>page</th></tr>';
	_BODY+='<tr>';
	_BODY+='<td class=pgHeader id="opus'+pageNumber+'">'+XPS.opus+'</td>';
	_BODY+='<td class=pgHeader id="title'+pageNumber+'">'+XPS.title+XPS.subtitle+'</td>';
	_BODY+='<td class=pgHeader id="scene_cut'+pageNumber+'">'+XPS.scene+XPS.cut+'</td>';
	_BODY+='<td class=pgHeader id="time'+pageNumber+'">'+nas.Frm2FCT(XPS.time(),3)+'</td>';
	_BODY+='<td class=pgHeader id="update_user'+pageNumber+'">'+XPS.update_user+'</td>';
//シート番号終了表示
if(pageNumber==Pages){
	_BODY+='<td class=pgHeader >'+'end / '+Pages+'</td>';
}else{
	_BODY+='<td class=pgHeader >'+pageNumber+' / '+Pages+'</td>';
};
	_BODY+='</tr>';
//ページヘッダを閉じる
	_BODY+='</table>';

	_BODY+='<table  class=sheetHeader style="border-style:none;border-width:0px;" ><tr><td style="border-style:none;border-width:0px;text-align:left;">';
//第一ページのみシート全体のコメントを書き込む（印刷用）　表示用には別のエレメントを使用
if(pageNumber==1){
//シート書き出し部分からコメントを外す 印刷時は必要なので注意 2010/08/21
	_BODY+='<span class=top_comment ><u>memo:</u>';  
	_BODY+='<span id="transit_dataXXX">';
	if(XPS.trin[0]>0){
		_BODY+="△ "+XPS.trin[1]+'('+nas.Frm2FCT(XPS.trin[0],3)+')';
	};
	if((XPS.trin[0]>0)&&(XPS.trout[0]>0)){	_BODY+=' / ';};
	if(XPS.trout[0]>0){
	_BODY+="▼ "+XPS.trout[1]+'('+nas.Frm2FCT(XPS.trout[0],3)+')';
	};
	_BODY+='</span>';

		_BODY+='<div id="memo_prt">';
		if(XPS.memo.toString().length){
			_BODY+=XPS.memo.toString().replace(/(\r)?\n/g,"<br>");
		}else{
			_BODY+="<br><br><br><br>";
		};
		_BODY+='</div>';

	_BODY+='</span>';
}else{
	_BODY+='<div class=printSpace ><br><br><br></div>';
};
	_BODY+='</td></tr></table>';


if(pageNumber==1){
//	document.getElementById("UIheaderScrollH").innerHTML=this.pageView(0);
//	document.getElementById("UIheaderScrollV").innerHTML=this.pageView(-2);
}

	return _BODY;
};
//end haedaerView()
/*	タイムシート本体のHTMLを返すメソッド(ページ単位)
 *		xUI.pageView(pageNumber)
 *		引数はページ番号を整数で
 *		戻り値はページ内容のHTMLテキスト
 *ページヘッダであった場合のみ固定のタイムラインヘッダーを出力する（画面表示専用）
 * 固定ヘッダの　第一第二第三　象限を出力する
 *   2  |  1(よこスクロール)
 ----+-----
 *  3   |   4
 *
 *引数:
 *0	第一象限(-1)
 *-1	第二象限(-2)
 *-2	第三象限(-3)
 *	内部パラメータでは各値ともに減算して使用　--
 *	0以上は通常ページの出力（0 org）
 */
xUI.pageView =function(pageNumber)
{
	var restoreValue=this.Select;
	var BODY_ = '';
//ページ数//プロパティに変更せよ
if(this.viewMode=="Compact"){
var Pages=1;//コンパクトモードでは固定
var SheetRows=Math.ceil(XPS.duration()/XPS.framerate)*Math.ceil(XPS.framerate);
}else{
var Pages=Math.ceil((XPS.duration()/XPS.framerate)/this.SheetLength);//総尺をページ秒数で割って切り上げ
var SheetRows=Math.ceil(this.SheetLength/this.PageCols)*Math.ceil(XPS.framerate);
}
/*
(2010/11/06)
	現在　PageLengthは冗長フレームを含む <秒数×フレーム母数>
	シート秒数が指定カラムで割り切れない場合は最後のカラムの秒数を1秒短縮して対応する仕様にする
	5秒シート　2段組みの場合　2.5秒2段でなく　3秒と2秒の段を作る
	従って1段のフレーム数は　切り上げ（指定秒数/指定段数）×フレーム母数

(2014/11/17)
	簡易表示のためのタイムラインヘッダを戻す機能を追加
	引数が0以下の場合はヘッダのみを返す
(2015/04/17)
	さらに拡張
引数	0でヘッドライン全体を第一象限用に
	-1で固定部第二象限に
	-2で第三象限に
	それぞれ出力する

簡易UIのために
タイムラインラベルを タイミング適用スイッチに兼用する拡張…可能？12/17

(2015/01/07)
	アクション欄をたたむ（非表示）
	アクション欄のタイムライン　表示プロパティの増設
*/
//ページ番号が現存のページ外だった場合丸める
	if (pageNumber >=Pages){
		pageNumber=Pages;
	} else {
		if(pageNumber<=-3) pageNumber=0;
	};
	pageNumber--;

//タイムシートテーブル

//タイムシートテーブルボディ幅の算出
/*
タイムシートのルック調整の為のおぼえがき
画面上は、規定幅のエレメントをすべて設定した状態で配置(cssに設定)
全体幅は自動計算
印字上は全体幅の規定が存在するので、規定幅をテーブル全体幅に設定して
フレームコメント以外の各エレメントの設定をcssで行い
誤差をフレームコメントで吸収する。（epsと同じアルゴリズム）
そのために必要な表示クラスを設定
	TimeGuideWidth	th.timeguidelabel
	ActionWidth	th.layerlabelR
	DialogWidth	th.dialoglabel
	SheetCellWidth	th.layerlabel
*new	cameraWidth	th.cameraLabel
	CommentWidth	th.framenotelabel
	ColumnSeparatorWidth colSep
印字に適さない設定(幅/高さオーバー)の場合は、一応警告を表示する。
印字用cssは、固定で作成する。A4,A3,B4,レターサイズくらいのところで作る

*/
if(this.viewMode=="Compact"){
var tableFixWidth=(
	TimeGuideWidth +
	ActionWidth*xUI.referenceXPS.layers.length 
	);
/*
+
	DialogWidth*(xUI.dialogSpan-1)
		(第二・第三象限固定幅)
	(
	参照レイヤ数*参照セル幅+
	タイムヘッダ幅+
	ダイアログ幅
	)
	TimeGuideWidth +
	ActionWidth*xUI.referenceXPS.layers.length +
	DialogWidth*(xUI.dialogCount-xUI.dialogSpan)+
*/
//alert(	DialogWidth*(xUI.dialogCount-xUI.dialogSpan) );
var tableBodyWidth=(
	tableFixWidth+
	DialogWidth*xUI.dialogCount +
	StillCellWidth*xUI.stillCount +
	SfxCellWidth*xUI.sfxCount +
	CameraCellWidth*xUI.cameraCount +
	SheetCellWidth*xUI.timingCount +
	CommentWidth );//
/*
コンパクトモードで１段固定(第一象限スクロールデータ)
	(
	参照レイヤ数*参照セル幅+
	タイムヘッダ幅+
	ダイアログ幅+
	stillレイヤ数*stillセル幅+
	timingレイヤ数*timingセル幅+
	sfxレイヤ数*sfxセル幅+
	cameraレイヤ数*cameraセル幅+
	コメント欄幅
	)
*/
var PageCols=1;
var SheetLength=Math.ceil(XPS.duration()/XPS.framerate);
}else{
//シートワープロモード
/*	第二象限固定ヘッダは、タイムガイド幅
	第一象限ヘッダーはカラム数分繰り返し
	第三象限ヘッダーはシート枚数分繰り返し
UI設定に基づいて段組
*/
var tableFixWidth=TimeGuideWidth;

/*
	以前はテーブル内のタイムラン種別をここで判定していたが
	xUIのプロパティに変換してこちらでは計算のみを行う仕様に変更済み 2015/04.25
*/
var tableBodyWidth=(
	TimeGuideWidth +
	ActionWidth*xUI.referenceXPS.layers.length +
	DialogWidth*xUI.dialogCount +
	StillCellWidth*xUI.stillCount +
	SfxCellWidth*xUI.sfxCount +
	CameraCellWidth*xUI.cameraCount +
	SheetCellWidth*xUI.timingCount +
	CommentWidth ) * this.PageCols +
	(ColumnSeparatorWidth*(this.PageCols-1));//
/*
	(
	参照レイヤ数*参照セル幅+
	タイムヘッダ幅+
	ダイアログ幅+
	stillレイヤ数*stillセル幅+
	timingレイヤ数*timingセル幅+
	sfxレイヤ数*sfxセル幅+
	cameraレイヤ数*cameraセル幅+
	コメント欄幅
	)×ページカラム数＋カラムセパレータ幅×(ページカラム数?1)
*/
var PageCols=this.PageCols;
var SheetLength=this.SheetLength
}

/*
BODY_ += 'onMouseDown =" return xUI.Mouse(event)"';
BODY_ += 'onMouseUp =" return xUI.Mouse(event)"';
BODY_ += 'onMouseOver =" xUI.Mouse(event)"';
*/
//alert(tableFixWidth+":"+tableBodyWidth);
//============= テーブル出力開始
BODY_ +='<table class=sheet cellspacing=0 ';
	if(pageNumber<=-2){
//第2,3象限用
BODY_ +='style="width:'+(tableFixWidth)+CellWidthUnit+'"';
	}else{
//第1,4象限用
BODY_ +='style="width:'+tableBodyWidth+CellWidthUnit+'"';
	}
	if(pageNumber<0){
BODY_ +='id="qdr'+(-1*pageNumber)+'" ';
	}else{
BODY_ +='id="qdr4" ';
	}
BODY_ +=' >';
BODY_ +='<tbody>';
	if(true){
//========================================シートヘッダ
/*	テーブルルックを決め込む為の幅配置及び将来的にリンクペアレントを表示する領域(かも)
	第一行目
	UI上は、イベント受信を担当するのは最も上に表示されるエレメント
*/
BODY_ +='<tr class=tlheade style="height:2px;" >';
//*==============================ページカラムループ処理
	for (cols=0;cols < PageCols;cols ++){
/*********** timeguide ********************/
BODY_ +='<th class=tcSpan';
BODY_ +=' ></th>';

if((this.viewMode!="Compact")&&(pageNumber<=-2)){break;
//第二第三象限でかつコンパクトモードでない場合はここでブレイクしてヘッダーを縮小
}
/*********** Action Ref *************/
//=====================参照エリア
		for (r=0;r<this.referenceXPS.layers.length;r++){
BODY_ +='<th class="referenceSpan" ';
BODY_ +=' > </th>';
		};

/*********** Dialog Area*************/
//予約タイムラインの為一回分別に出力
BODY_ +='<th class=dialogSpan ';
BODY_ +='> </th>';
/************左見出し固定時の処理*****************/
	if(pageNumber<=-2){
/*********** Edit Area *************/
//=====================編集セル本体の固定部分のみをタイムライン種別に合わせて配置(ラベル部分)
if(true){
		for (var r=0;r<(xUI.dialogSpan-1);r++){
	BODY_ +='<th class=dialogSpan  id="TL'+(r+1)+'" ></th>';
		}
}else{
		for (var r=0;r<XPS.layers.length;r++){
//BODY_ +='<th class="editSpan" ';//editSpanは後で消しておくこと
 switch (XPS.layers[r].option)
 {
case "dialog":
	BODY_ +='<th class=dialogSpan ';
	BODY_ +=' id="TL'+(r+1)+'"';
	BODY_ +=' >';
	BODY_ +='</th>';
break;
case "still":
case "sfx":
case "camera":
case "timing":
default:
 }
		};
//BODY_ +='</tr><tr>';//改段
}

	}else{
/*第一、第四象限用処理*/
/*********** Edit Area *************/
//=====================編集セル本体をタイムライン種別に合わせて配置(ラベル部分)
		for (r=0;r<XPS.layers.length;r++){
//BODY_ +='<th class="editSpan" ';//editSpanは後で消しておくこと
 switch (XPS.layers[r].option)
 {
case "dialog":BODY_ +='<th class=dialogSpan ';break;
case "still":BODY_ +='<th class=stillSpan ';break;
case "sfx":BODY_ +='<th class=sfxSpan ';break;
case "camera":BODY_ +='<th class=cameraSpan ';break;
case "timing":
default:BODY_ +='<th class=timingSpan ';
 }

BODY_ +=' id="TL'+(r+1)+'"';
BODY_ +=' > ';
//BODY_ +=XPS.layers[r].option;
BODY_ +='</th>';
		};
/*********** FrameNote Area *************/
BODY_ +='<th class=framenoteSpan';
BODY_ +=' ></th>';
//カラムセパレータの空セル挿入
if (cols < PageCols-1) BODY_ +=('<td class=colSep ></td>');
	};

	}
/************************************************/


BODY_ +='</tr>';//改段
	}
//第二行目========================================シート記入分ヘッダ
	
BODY_ +='<tr>';
	for (cols=0;cols < PageCols;cols ++){
/*********** timeguide ********************/
BODY_ +='<th rowspan=2 class=timelabel ';
//BODY_ +='style=" width:'+TimeGuideWidth+CellWidthUnit+'"';
BODY_ +=' ><span class=timeguide> TIME </span></th>';
/*********** Action Ref *************/
BODY_ +='<th colspan="'+this.referenceXPS.layers.length+ '" id="rnArea" class="rnArea" ondblclick=alert(this.id)';
//BODY_ +=' style=" width:'+(ActionWidth*this.referenceXPS.layers.length).toString()+CellWidthUnit+'" ';
//　ここは参照ステージ名に置き換え予定
BODY_ +=' >Action</th>';
/*********** Dialog Area*************/
BODY_ +='<th rowspan=2 class="dialoglabel" ';
//ダイアログの幅は可変
if(xUI.dialogSpan>1){
BODY_ +='colspan ="'+xUI.dialogSpan+'" ';
}
/***
BODY_ +=' onMouseDown=\'xUI.changeColumn(0 ,'+ (2 * pageNumber+cols) +');\'';
***/
BODY_ +='>台<BR>詞</th>';
	if(pageNumber>=-1){
/*********** Edit Area 1 (timing) *************/
BODY_ +='<th colspan='+xUI.timingSpan+' id=editArea class=editArea ondblclick="alert(this.id)"; '
//BODY_ +='<th colspan='+XPS.layers.length+' id=editArea class=editArea ondblclick="alert(this.id)"; '
//BODY_ +=' style=" width:'+(SheetCellWidth*XPS.layers.length).toString()+CellWidthUnit+'" ';
//ここは編集中のステージ名に置き換え予定
BODY_ +='>CELL</th>';

/*********** Edit Area 2 (camera+sfx) *************/
if(xUI.cameraSpan>0){
BODY_ +='<th colspan='+xUI.cameraSpan+' id=editArea class=editArea ondblclick="alert(this.id)"; '
//BODY_ +='<th colspan='+XPS.layers.length+' id=editArea class=editArea ondblclick="alert(this.id)"; '
//BODY_ +=' style=" width:'+(SheetCellWidth*XPS.layers.length).toString()+CellWidthUnit+'" ';
//
BODY_ +='>camera</th>';
}
/*********** FrameNote Area *************/
BODY_ +='<th rowspan=2 class=framenotelabel';
/***
BODY_ +=' onMouseDown=\'xUI.changeColumn("memo" ,'+ (2 * pageNumber+cols) +');\'';
***/
BODY_ +=' >MEMO.</th>';
//カラムセパレータの空セル挿入
if (cols < PageCols-1) BODY_ +=('<td rowspan='+(2+SheetRows)+' class=colSep ></td>');
	};

	}
BODY_ +='</tr>';//改段

//ヘッダ2行目
BODY_ +='<tr>';//改段

	for (cols=0;cols < PageCols;cols ++){

//=====================参照エリア
		for (r=0;r<this.referenceXPS.layers.length;r++){
BODY_ +='<th id="rL';
BODY_ += r.toString();
BODY_ += '_';
BODY_ += pageNumber;
BODY_ += '_';
BODY_ += cols.toString();

BODY_ +='" class="layerlabelR" ';
BODY_ +=' >';
var lbString=(this.referenceXPS.layers[r].name.length<4)?this.referenceXPS.layers[r].name:'<a onclick="return false;" title="'+this.referenceXPS.layers[r].name+'">●</a>';


 if (this.referenceXPS.layers[r].name.match(/^\s*$/)){
	BODY_ +='<span style="color:'+SheetBorderColor+'";>'+nas.Zf(r,2)+'</span>';
 }else{
	BODY_ +=lbString;
//	BODY_ +=this.referenceXPS.layers[r].name;
 };

		};
	if(pageNumber>=-1){
//=====================編集セル本体(ラベル部分)

		for (var r=(xUI.dialogSpan-1);r<XPS.layers.length;r++){
BODY_ +='<th id="L';
BODY_ += r.toString();
BODY_ += '_';
BODY_ += pageNumber;
BODY_ += '_';
BODY_ += cols.toString();
 switch (XPS.layers[r].option){
case "still" :BODY_ +='" class="stilllabel" ' ;break;
case "sfx"   :BODY_ +='" class="sfxlabel" '   ;break;
case "camera":BODY_ +='" class="cameralabel" ';break;
case "timing":
default:BODY_ +='" class="layerlabel" ';
}
/***
BODY_ +=' onMouseDown=\'xUI.changeColumn(' + (r + 1).toString() + ','+ (2 * pageNumber + cols) +');\'';
BODY_ +=' ondblclick=\'reNameLabel(' + (r + 1).toString() +');\'';
***/
BODY_ +=' >';
if(XPS.layers[r].option=="still"){
 if (XPS.layers[r].name.match(/^\s*$/)){
	BODY_ +='<span style="color:'+SheetBorderColor+'";>'+nas.Zf(r,2)+'</span>';
 }else{
	BODY_ +='<a onclick="return false" title="'+XPS.layers[r].name+'">▼</a>';
 };
}else{
 if (XPS.layers[r].name.match(/^\s*$/)){
	BODY_ +='<span style="color:'+SheetBorderColor+'";>'+nas.Zf(r,2)+'</span>';
 }else{
	BODY_ +=XPS.layers[r].name;
 };
}
BODY_ +='</th>';
		};

	};
	};
BODY_ +='</tr>';

//以下　シートデータ本体　pageNumberが-3以下の場合は固定(冒頭ダイアログ)部分まで出力
if((pageNumber>=0)||(pageNumber<-2)){
/*=========================シートデータエリア==========================*/
//alert("SheetRows : "+ SheetRows +"\nthis.PageCols : "+this.PageCols);
var currentPageNumber=(pageNumber<-2)?0:pageNumber;
for (n=0;n<SheetRows;n++){
BODY_ += '<tr>';
		for (cols=0;cols<PageCols;cols ++){
//フレーム毎のプロパティを設定
	var myFrameCount=cols*SheetRows+n;
	var currentSec=(currentPageNumber*SheetLength)+Math.floor(myFrameCount/Math.ceil(XPS.framerate));//処理中の秒
	var restFrm= myFrameCount % Math.ceil(XPS.framerate);//処理中の　ライン/秒
	var mySpt=(XPS.rate.match(/df/i))?";":":";
	var myTC=[Math.floor(currentSec/3600)%24,Math.floor(currentSec/60),currentSec%60].join(":")+mySpt+restFrm
	var current_frame= nas.FCT2Frm(myTC,XPS.framerate);//FCTからフレームインデックスを導くドロップ時はnull

//alert([myFrameCount,currentSec,restFrm].join("\n"));break;
// var current_frame=(this.PageLength*currentPageNumber)+cols*SheetRows+n;//カレントフレームの計算がTCベースになる必要あり
//現在処理中のフレームは有効か否かをフラグ　フレームがドロップまたは継続時間外の場合は無効フレーム
	var isBlankLine =((current_frame != null)&&(current_frame < XPS.duration()))? false:true;
//alert(isBlankLine+" : "+current_frame)
//セパレータ(境界線)設定
if(restFrm==(Math.ceil(XPS.framerate)-1)){
//	n%XPS.framerate==(XPS.framerate-1);//旧判定
//秒セパレータ
	var tH_border= 'class=ltSep';
	var dL_border= 'class=dtSep';
	var sC_border= 'class=ntSep';
	var mO_border= 'class=ntSep';
}else{
	if (n%this.sheetSubSeparator==(this.sheetSubSeparator-1)){
//	サブセパレータ
		var tH_border= 'class=lsSep';
		var dL_border= 'class=dsSep';
		var sC_border= 'class=nsSep';
		var mO_border= 'class=nsSep';
	}else{
//	ノーマル(通常)指定なし
		var tH_border= 'class=lnSep';
		var dL_border= 'class=dnSep';
		var sC_border= 'class=nnSep';
		var mO_border= 'class=nnSep';
	};
};
//背景色設定
/*	判定基準を継続時間内外のみでなくドロップフレームに拡張
*/
//	if ((current_frame != null)&&(current_frame < XPS.duration())){}
	if (! isBlankLine){
//有効フレーム
		var bgStyle='';
		var bgProp='';
		var cellClassExtention=''
	}else{
//無効フレーム
		var bgStyle='background-color:'+this.sheetblankColor+';';
		var bgProp='bgcolor='+this.sheetblankColor+' ';
		var cellClassExtention='_Blank'
	};

//タイムヘッダ
	var tcStyle='<td nowrap ';

BODY_ +=tcStyle +tH_border+cellClassExtention;
BODY_ +=' >';
	if (restFrm==0) {BODY_ += "<span class=timeguide>[ "+ currentSec.toString()+"' ]</span>"};
	if  (((n+1)%2 ==0)&&(! isBlankLine))
	{BODY_ += (current_frame+1).toString();}else{BODY_+='<br>';};
//	{BODY_ += ((n+1)+cols*SheetRows).toString();}else{BODY_+='<br>';};
BODY_ +='</td>';
//参照シートセル
	for (var r=1;r<= this.referenceXPS.layers.length;r++){
//仮表示（シート本体と同内容）2013 01 29
//参照XPSに切替　02 17
BODY_ +='<td ';
	if (! isBlankLine){}
	if (current_frame<this.referenceXPS.xpsBody[r].length){
BODY_ += 'id=\"r_';
BODY_ +=r.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
BODY_ +=sC_border+cellClassExtention;
	}else{
BODY_ +=sC_border+"_Blank";
};
BODY_ +='>';
		if (current_frame>=this.referenceXPS.xpsBody[r].length){
	BODY_+="<br>";
		}else{
	this.Select=[r,current_frame];
	if (this.referenceXPS.xpsBody[r][current_frame]!=""){
		BODY_ += this.trTd(this.referenceXPS.xpsBody[r][current_frame]);
	}else{
		BODY_+='<br>';
	};
		};
BODY_ +='</td>';

	};
/*
	ダイアログタイムラインとその他のタイムラインの混在を許容することになるので
	位置による決め打ちでなく、タイムライン種別の判定を行う。
	固定ヘッダ出力の場合は、ループ上限を冒頭ダイアログまでに限定
*/
	var outputColumus=(pageNumber<-2)?xUI.dialogSpan-1:XPS.layers.length;
for (var r=0;r<=outputColumus;r++){
if((r==0)||(XPS.layers[r-1].option=="dialog"))	{
//ダイアログセル
BODY_ +='<td ';
//	if ((current_frame != null)&&(current_frame < XPS.duration())){}
	if (! isBlankLine){
BODY_ += 'id="';
BODY_ +=r.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
//BODY_ +='onclick="return xUI.Mouse(event)" ';
	};
BODY_ += dL_border+cellClassExtention;
BODY_ +='>';
//		if((current_frame==null)||(current_frame>=XPS.duration()))
		if (isBlankLine){
	BODY_+="<br>";
		}else{
	this.Select=[0,current_frame];
	if (XPS.xpsBody[r][current_frame]!=""){
		BODY_+=this.trTd(XPS.xpsBody[r][current_frame]);
	}else{
		BODY_ += '<BR>';
	}	};

BODY_ +='</td>';
	}else{
//シートセル
//極力インラインスタイルシートを書かないように心がける 05'2/25
BODY_ +='<td ';
//	if ((current_frame != null)&&(current_frame < XPS.duration())){}
	if (! isBlankLine){
BODY_ += 'id="';
BODY_ +=r.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
//BODY_ +='onclick="xUI.Mouse(event)" ';
	};
BODY_ +=sC_border+cellClassExtention;
BODY_ +='>';
//		if((current_frame==null)||(current_frame>=XPS.duration())){}
		if (isBlankLine){
	BODY_+="<br>";
		}else{
	this.Select=[r,current_frame];
	if ( XPS.xpsBody[r][current_frame]!=""){
		BODY_ += this.trTd(XPS.xpsBody[r][current_frame]);
	}else{
		BODY_+='<br>';
	};
		};
BODY_ +='</td>';

	};
}

/*	メモエリア
 * 固定ヘッダー出力時はスキップ
 *
 */
 if(pageNumber>=0){
BODY_ +='<td ';
//	if (current_frame < XPS.duration()){}
	if (! isBlankLine){
BODY_ += 'id="';
BODY_ += (1+XPS.layers.length).toString()+'_'+ current_frame.toString();
BODY_ +='" ';
//BODY_ +='onclick="xUI.Mouse(event)" ';
	};
BODY_ +=mO_border+cellClassExtention;
BODY_ +='>';
//		if(current_frame>=XPS.duration()){}
		if (isBlankLine){
	BODY_+="<br>";
		}else{
	this.Select=[XPS.layers.length+1,current_frame];
	if ( XPS.xpsBody[XPS.layers.length+1][current_frame]!=""){
		BODY_ += this.trTd(XPS.xpsBody[XPS.layers.length+1][current_frame]);
	}else{
		BODY_+='<br>';
	};
		};
BODY_+='</td>';
 }
		};
BODY_ +='</tr>';

};
	};

BODY_ +='</tbody></table>';
BODY_ +='';
BODY_ +='';
BODY_ +='';
	this.Select=restoreValue;
	return BODY_;
};
//
//本体シートの表示を折り畳む（トグル）
xUI.packColumn=function(ID)
{
//	id((ID<0)||(ID>this.SheetWidth)){return;};
var Target=ID;
var PageCols=(this.viewMode=="Compact")?1:this.PageCols;
var PageCount=(this.viewMode=="Compact")?1:Math.ceil(XPS.duration()/this.PageLength);
//	switch(ID)
//	{
//case	0:myTarget=0;break;
//case	this.SheetWidth:myTarget="memo";break;
//	};
	for (Page=0 ;Page < PageCount;Page++)
	{
//レイヤラベルのID "L[レイヤID]_[ページID]_[カラムID]"
		for (cols=0;cols < PageCols;cols ++){
			alert("L"+Target+"_"+Page+"_"+cols+" : "+document.getElementById("L"+Target+"_"+Page+"_"+cols).style.width);
			var isNarrow=(document.getElementById("L"+Target+"_"+Page+"_"+cols).style.width=="4px")?true:false;
			document.getElementById("L"+Target+"_"+Page+"_"+cols).style.width=(isNarrow)? SheetCellWidth:SheetCellNarrow;
			alert(document.getElementById("L"+Target+"_"+Page+"_"+cols).style.width+" : "+isNarrow);

		};
	};
};

//参照シートの表示を折り畳む(トグル)
xUI.packRefColumns=function()
{
var PageCols=(this.viewMode=="Compact")?1:this.PageCols;
var PageCount=(this.viewMode=="Compact")?1:Math.ceil(XPS.duration()/this.PageLength);
   for (var Target=1;Target<=this.referenceXPS.layers.length;Target++){
	for (Page=0 ;Page < PageCount ;Page++){
//レイヤラベルのID "L[レイヤID]_[ページID]_[カラムID]"
		for (var cols=0;cols < PageCols;cols ++){
			alert("rL"+Target+"_"+Page+"_"+cols+" : "+document.getElementById("rL"+Target+"_"+Page+"_"+cols).style.width);

			var isNarrow=(document.getElementById("rL"+Target+"_"+Page+"_"+cols).style.width=="4px")?true:false;
			document.getElementById("rL"+Target+"_"+Page+"_"+cols).style.width=(isNarrow)? SheetCellWidth:SheetCellNarrow;
			alert(document.getElementById("rL"+Target+"_"+Page+"_"+cols).style.width+" : "+isNarrow);

		};
	};
   }
};

/*
UI関連メソッド
*/
/*	スピンアクション
		xUI.spin(vAlue)
		オプションは、数値 または、
		キーワード right/left/up/doun/fwd/back
		戻り値は、更新あとのspin値
*/
xUI.spin	=function(vAlue)
{
	var NxsV=this.spinValue;	//spin値を取得
	var Layer=this.Select[0];//IDからカラムとラインを取得
	var fRame=this.Select[1];//
	var NxrA=Layer*1;
	var NxFr=fRame*1;//暫定的に次のフレームをもとのフレームで初期化

//スピンオプションにしたがって次の位置を計算する
switch (vAlue) {
case 'fwd' :	;//スピン前方*
	NxFr =((NxFr + NxsV) % XPS.duration() );
	if (!this.sLoop) {if (fRame > NxFr) {NxFr = fRame}};
	break ;
case 'back' :	;//スピン後方*
	NxFr =((NxFr + XPS.duration() - NxsV ) % XPS.duration() ) ;
	if (!this.sLoop) {if (fRame < NxFr) {NxFr = fRame }};
	break ;
case 'down' :	;//\[down\]*
	NxFr = (NxFr + 1 )% XPS.duration() ;
	if ((!this.cLoop) && (fRame > NxFr)) {NxFr = fRame};
	break ;
case 'up' :	;//\[up\]*
	NxFr = ((NxFr + XPS.duration() -1) % XPS.duration() );
	if ((!this.cLoop) && (fRame < NxFr)) {NxFr = fRame * 1};
	break ;
case 'right' :	;//\[right\]データが未編集の場合のみ左右スピン
	if (! this.edchg)
	{
		NxrA =(NxrA<(XPS.layers.length+1)) ?
		(NxrA + 1 ) : (XPS.layers.length+1) ;
	};
	break ;
case 'left' :	;//\[left\]編集中の場合は、システムに戻す*
	if (! this.edchg)
	{NxrA = (NxrA>0) ? (NxrA -1) : 0 ;};
	break ;
case 'pgup' :	;//ページアップ*
	if (NxFr-this.cPageLength >= 0){
	NxFr=NxFr-this.cPageLength};
	break;
case 'pgdn' :	;//ページダウン*
	if(NxFr+this.cPageLength < XPS.duration()){
	NxFr=NxFr+this.cPageLength};
	break;
case 'v_up' :	;//spin値ひとつあげ
	NxsV++;if(NxsV > XPS.framerate) NxsV=1;
//return NxsV;
	break;
case 'v_dn' :	;//spin値ひとつさげ
	NxsV--;if(NxsV <= 0) NxsV=XPS.framerate;
//return this.spinValue;
	break;
case 'v_loop' :	;
	NxsV++;NxsV=[2,3][NxsV%2];//spin値を2,3 交互切り換え
//	NxsV--;NxsV=[2,3,4][NxsV%3];//spin値を2,3,4 交互切り換え
//return this.spinValue;
	break;

case 'update'	:	;//セレクションの値からスピンの更新
	if(this.Selection[0]==0 && this.Selection[1]>=0 &&this.spinSelect)
	{
		NxsV=(Math.abs(this.Selection[1])+1);
	};
	break;
default :	;//数値の場合は、spin値の更新 数値以外はNOP
	if (isNaN(vAlue)){return;false}else{NxsV=vAlue*1};
};

//スピン値の変更があった場合は、スピン表示の更新
	if(NxsV != this.spinValue)
	{
		this.spinHi("clear");
		this.spinValue=NxsV;
		document.getElementById("spin_V").value=this.spinValue;
		if(this.SWap["tool_"])this["tool_"].document.getElementById("spin_V").value=this.spinValue;

		this.spinHi();
	};
	var newID=NxrA+"_"+NxFr;//新しいフォーカス位置を導く
//位置の更新があった場合のみフォーカスを更新
	if((newID != this.getid("Select")) || this.edchg){
 		this.selectCell(newID);
	};
	return this.spinValue;
};
//
/*	ダイアログタイムライン用のSpin動作
	
*/

xUI.dialogSpin=function(param)
{
	var doSpin=true;
	var entry=(this.eddt)?this.eddt:this.getCurrent();//

	if (! entry || entry=="blank"){syncInput("");return;};

	switch(param)
	{
	case "incr":	doSpin=false;entry++;break;
	case "decr":	doSpin=false;if(entry>1){entry--;break}else{return;break;};
	case "incrS":	entry++;break;
	case "decrS":	if(entry>1){entry--;break}else{return;break;};
	};

	if(doSpin) 
	{
		this.put(entry);//更新
		this.spin("fwd");
	}else{
		this.eddt=entry;
		syncInput(entry);
	if(!this.edchg)this.edChg(true);
	};
	return false;
};
//
//xUI.dialogSpin=dialogSpin_;
//


xUI.getCurrent=function(){

	var currentValue=null;
	for(id=this.Select[1];id>=0;id--)
	{
		currentValue=dataCheck(XPS.xpsBody[xUI.Select[0]][id]);
		if(currentValue && currentValue!="blank") break;
	 };
	return currentValue;
};
//
//xUI.getCurrent=getCurrent_ ;
//


/*	ラピッドモードのコマンドを実行	*/
xUI.doRapid=function(param){rapidMode.command[param]();};

/*	複写	*/
xUI.copy	=function(){	this.yank();};

/*	切り取り	*/
xUI.cut	=function()
{
	var bkPos=this.getid("Select");
	this.yank();
//選択範囲を取得して全部空のストリームに作って流し込む。
	var actionRange=this.actionRange();
	var L=actionRange[1][0]-actionRange[0][0];//幅
	var F=actionRange[1][1]-actionRange[0][1];//継続時間
	var bulk_l='';
	var bulk= '';
	for (f=0;f<=F;f++) {bulk_l+=(f!=F)? ","	:"";};
	for (l=0;l<=L;l++) {bulk+=(l!=L)? bulk_l+"\n":bulk_l;};
	this.inputFlag="cut";
	this.put(bulk);
	this.selectCell(bkPos);
};

/*	貼り付け	*/
xUI.paste	=function()
{
	var bkPos=this.getid("Select");
	this.inputFlag="cut";
	this.put(this.yankBuf);
	this.selectCell(bkPos);
};
/*	やり直し	*/
xUI.undo	=function ()
{
	if(this.undoPt==0) {
		if(dbg) {dbgPut("UNDOバッファが空")};
		return;
	};
	//UNDOバッファが空
	this.inputFlag="undo";
	this.put();
};

/*	やり直しのやり直し	*/
xUI.redo	=function()
{
	if((this.undoPt+1)>=this.undoStack.length) {
		if(dbg){dbgPut("REDOバッファが空")};
		return;
	};
		//REDOバッファが空
	this.inputFlag="redo";this.put();
};

/*	ヤンクバッファに選択範囲の値を退避	*/
xUI.yank=function(){this.yankBuf=this.getRange();};

/*	操作範囲の抽出	*/
//引数は、制限範囲・省略可能
xUI.actionRange	=function(limit)
{
	if (! limit) limit=this.Selection;
//レイヤ操作範囲
	var LayerStartAddress	=
	(this.Selection[0]<0)?
	this.Select[0]+this.Selection[0]	:	this.Select[0];
//			指定範囲の小さいほう
	if(LayerStartAddress<0) LayerStartAddress=0;
//			シート起点と比較して内側
	var RangeWidth	=
	(Math.abs(limit[0])<Math.abs(this.Selection[0]))?
	Math.abs(limit[0])	:	Math.abs(this.Selection[0]);
//			引数と比較して小さいほう
	var LayerEndAddress	=	LayerStartAddress+RangeWidth;
	if (LayerEndAddress>this.SheetWidth)
	LayerEndAddress=this.SheetWidth;
//			終了点と比較して内側

//フレーム操作範囲
	var FrameStartAddress	=
	(this.Selection[1]<0)?
	this.Select[1]+this.Selection[1]	:	this.Select[1];
//			指定範囲の小さいほう
	if(FrameStartAddress<0) FrameStartAddress=0;
//			シート起点と比較して内側
	var RangeHeight	=
	(Math.abs(limit[1])<Math.abs(this.Selection[1]))?
	Math.abs(limit[1])	:	Math.abs(this.Selection[1]);
//			引数と比較して小さいほう
	var FrameEndAddress	=	FrameStartAddress+RangeHeight;
	if (FrameEndAddress>=XPS.duration())
	FrameEndAddress=XPS.duration()-1;
//			終了点と比較して内側
//配列で返す
return [[LayerStartAddress,FrameStartAddress],[LayerEndAddress,FrameEndAddress]]
};

/*	xUI.getRange(Range:[[startC,startF],[endC,endF]])
	指定範囲内のデータをストリームで返す
	指定がない場合は、現在の選択範囲
*/
xUI.getRange	=function(Range)
{
	if (! Range) Range=this.actionRange();//指定がなければ現在の操作範囲を設定
	
if(false){
	StartAddress	=Range[0];
	EndAddress	=Range[1];
	var xBUF=new Array();var yBUF=new Array();var zBUF=new Array();
//ループして拾い出す
	for (r=StartAddress[0];r<=EndAddress[0];r++)
	{
		for (f=StartAddress[1];f<=EndAddress[1];f++)
			xBUF.push(XPS.xpsBody[r][f]);	
		yBUF.push(xBUF.join(","));xBUF.length=0;
	};
	zBUF=yBUF.join("\n");
}
// アンドゥデータ拾いだしのために作成されたが編集全般に便利
// ストリームで返す
	return XPS.getRange(Range);
};


/*	シートに外部から値を流し込むメソッド
		xUI.put(データストリーム)
		読み込みとかにもつかえるべし
*/
xUI.put	=function(datastream){
 var Cexpand=true;//コンマ展開フラグ
switch (this.inputFlag){
case "redo":		this.undoPt++;				//REDO処理時
case "undo":	;//UNDO処理時
	var undoTarget=this.undoStack[this.undoPt];	//処理データ取得
	this.Selection=undoTarget[1];
	this.selectCell(undoTarget[0][0]+"_"+undoTarget[0][1]);
	datastream=undoTarget[2];
		break;
default:				;//通常のデータ入力
					//
};

/*
やりとりするデータの形式は、コンマ区切り文字列
フレーム方向のストリームで、改行で次のレイヤに移動
制御トークン等は無し。データのみ。
	'1,,,2,,\n1,,,,,\n"x",,,,,\n'
こんな奴

	07/08/07	undoGroup着手

グループフラグが立っていたらグループカウントをかける

グループカウント中はグループID付きのputを受け付けて。
シート全体のコピーをとってそちらの編集を行う

カウント中はundoに値を積まない。undoポインタも固定する。
フラグがendGroupになるか、通常のputを受け取った時点で解除
コピーした配列から変更範囲全体をXPSに流し込んで、UNDOを更新する。
こんな予定、でもまだやってない
*/
	var lastAddress=this.Select;//最終操作アドレス初期化
//UNDO配列
	var UNDO=new Array();
		UNDO[0]	=this.Select;
		UNDO[1]	=this.Selection;
/*	フォーカス関連は廃止
//フォーカスされていたら、状態を控えていったんフォーカスを抜く。
	if (this.Focus)
	{
		var focused=true;
		this.focusCell();
		if (this.inputFlag=="normal") Cexpand=false;
	}else{
		var focused=false;
	};
*/
//	データ展開するかしないかを判断		//まだ、考え中
	if (! Cexpand)
	{
//展開しない。
//カンマ展開無しの場合は、データストリームを直接セルの内容にするので
//ソースデータ配列を元データと空データの配列に仕立てる
	var layers=Math.abs(this.Selection[0]);
	var frames=Math.abs(this.Selection[1]);

	var srcData=new Array(layers);
	for (r=0;r<=layers;r++){
	srcData[r]=new Array(frames);
		for (f=0;f<=frames;f++){
			srcData[r][f]='';
		};
	};
	var la=
	(this.Selection[0]<0)?
	Math.abs(this.Selection[0])	:	0;
	var fr=
	(this.Selection[1]<0)?
	Math.abs(this.Selection[1])	:	0;
	srcData[la][fr]=datastream;
	}else{
//セレクションに対して不足している場合は、空データを追加
if (false){
	if(
		this.Selection[0]<0 &&
		(Math.abs(this.Selection[0])+1)>datastream.toString().split("\n").length
	)
	var preLyers=
	Math.abs(this.Selection[0])+1-datastream.toString().split("\n").length;
	if(
		this.Selection[1]<0 &&
		(Math.abs(this.Selection[1])+1)>
		datastream.toString().split("\n").length
	)
var preLyers=
Math.abs(this.Selection[0])+1-datastream.toString().split("\n").length;
};
//配列に変換
	var srcData=new Array(datastream.toString().split("\n").length);
	for (var n=0;n<srcData.length;n++){
	srcData[n]=datastream.toString().split("\n")[n].split(",");
	}

	};
//ソースデータは配列に変換(済)
//ソースデータのサイズを出す。
	var sdWidth	=srcData.length;
	var sdHeight	=srcData[0].length;
//
//データ処理範囲調整
		if (this.getid("Selection") !="0_0")
		{
//セレクションあり。操作範囲を取得
	var actionRange=this.actionRange([sdWidth-1,sdHeight-1]);

//カレントセレクションの左上端から現在の配列にデータを流し込む。

	var LayerStartAddress=actionRange[0][0];//	左端
	var FrameStartAddress=actionRange[0][1];//	上端
//セレクションとソースのデータ幅の小さいほうをとる
	var LayerEndAddress=actionRange[1][0];//	右端
	var FrameEndAddress=actionRange[1][1];//	下端
//
		} else {
//セレクション無し

	var LayerStartAddress= this.Select[0];//	左端
	var FrameStartAddress= this.Select[1];//	上端
//シート第2象限とソースデータの幅 の小さいほうをとる
	var LayerEndAddress=(xUI.SheetWidth-this.Select[0]<sdWidth)?
	(this.SheetWidth-1):(LayerStartAddress+sdWidth-1)	;//	右端
	var FrameEndAddress=(XPS.duration()-this.Select[1]<sdHeight)?
	(XPS.duration()-1):(FrameStartAddress+sdHeight-1)	;//	下端
if (false){
	alert(	"noSelection :"+LayerStartAddress+"_"+
		FrameStartAddress+"->"+LayerEndAddress+"_"+
		FrameEndAddress
	);
};
		};
//レンジ内のデータをストリームでバックアップする***
	UNDO[2]=this.getRange(
		[[LayerStartAddress,FrameStartAddress],
		[LayerEndAddress,FrameEndAddress]]
	);
//入力値をループで流し込む
	for (r=LayerStartAddress;r<=LayerEndAddress;r++)
	{
		for (f=FrameStartAddress;f<=FrameEndAddress;f++)
		{
// alert(r.toString()+":"+datastream.split("\n")[r-LayerStartAddress]+"\n"+f.toString()+":"+datastream.split("\n")[r-LayerStartAddress].split(",")[f-FrameStartAddress]);
	XPS.xpsBody[r][f]=
	srcData[r-LayerStartAddress][f-FrameStartAddress];
//		配列データ置き換え
//	dbgPut("---"+XPS.xpsBody[r][f]+"---");
	var td=(XPS.xpsBody[r][f]=='')?"<br>" : this.trTd(XPS.xpsBody[r][f]) ;
//		シートテーブルデータヲ作ル
	if (document.getElementById(r+"_"+f).innerHTML!= td)
	{
		document.getElementById(r+"_"+f).innerHTML=td;
//		シートテーブル書き換え
	};
	if (XPS.xpsBody[r][f]!='')
	{
		lastAddress=[r,f] ;		//最終入力操作アドレス控え
		var footstamp =(this.footMark)? 
		this.footstampColor:this.sheetbaseColor;//踏むぞー
		this.Select=([r,f]);
		//各ブラウザで試験して判定文字列を変更(未処置)
		if (
		document.getElementById(r+"_"+f).style.backgroundColor!=
		footstamp
		)
			document.getElementById(r+"_"+f).style.
			backgroundColor=footstamp; //セレクト位置を踏む！
	}else{
	//セルが空なので、背景色がフットスタンプならフットスタンプを消す。
		//各ブラウザで試験して判定文字列を変更(未処置)
		if (
		document.getElementById(r+"_"+f).style.backgroundColor!=
		this.sheetbaseColor
		&&
		this.footMark
		)
			document.getElementById(r+"_"+f).style.
			backgroundColor=this.sheetbaseColor; //踏み消す
	};
		};
	};
//操作別に終了処理
switch (this.inputFlag){
case "undo":
		this.undoStack[this.undoPt][2]=UNDO[2];	//UNDO処理時
		this.undoPt--;
	this.selection();
	this.selectCell(undoTarget[0][0]+"_"+undoTarget[0][1]);
		break;

case "redo":	this.undoStack[this.undoPt][2]=UNDO[2];	//REDO処理時
	this.selection();
	this.selectCell(undoTarget[0][0]+"_"+undoTarget[0][1]);
		break;

case "nomal":	;//通常のデータ入力
//	最終入力操作位置に移動
	this.selectCell(lastAddress[0]+"_"+lastAddress[1]);//チョト一考 いらない?
default:	;//カット・コピー・ペースト操作の際はカーソル移動無し
		this.undoPt++;
		this.undoGc=0;
		this.undoStack[this.undoPt]=UNDO;
		if (this.undoStack.length>(this.undoPt+1))
			this.undoStack.length=(this.undoPt+1);
};
		this.inputFlag="nomal";
// undoバッファの状態を表示
	sync("undo");sync("redo");
//編集バッファをクリア・編集フラグを下げる(バッファ変数をモジュールスコープに変更したので副作用発生)
	if(this.edchg)	this.edChg(false);
	if(this.eXMode==1){this.eXMode=0;this.eXCode=0;};//予備モード解除
// 処理終了アドレスを配列で返す(使わなくなったような気がする)
return lastAddress;
};

//バックアップデータ入出力method作成
xUI.bkup	=function(Datas){
if (! Datas){return this.Backupdata[0]};
if (Datas.length==0){return this.Backupdata[0]}else{this.Backupdata=Datas;return true;};
};
/*
UI関数群
	これも、xUIのメソッドに

*/
/*=====================================*/

//メッセージをアプリケーションステータスに出力する。 引数なしでクリア
xUI.printStatus	=function(msg,prompt){
	if(! msg){msg="<br />"};
	if(! prompt){prompt=""};
	var bodyText=(prompt+msg);
	document.getElementById("app_status").innerHTML=bodyText.replace(/\n/g,"<br>");
}
//キーダウンでキー入力をサバく
//IEがプレスだとカーソルが拾えないようなのでキーダウン
xUI.keyDown	=function(e){
	if(this.Mouse.action){return false};//マウス動作優先中
//フォーカスされたテーブル上の入力ボックスのキーダウンを検出
//window.status=getKEYCODE(e)+'/'+String.fromCharCode(getKEYCODE(e))
//	alert(e.KeyCode)
	key = getKEYCODE(e);//キーコードを取得
	this.eddt = document.getElementById("iNputbOx").value;
//	var eddt = document.getElementById("iNputbOx").value;
	switch(key) {
case	25	:if(! Safari) break;
case	9	:	;//tab
if(! this.tabSpin){
	if(!this.edchg) return;
	this.put(this.eddt);
	return false;break;
};
case	13	:	;//Enter 標準/次スピン・シフト/前スピン
	if (this.edchg){this.put(this.eddt);}//更新
	if(e.shiftKey) {this.spin("back")}else{this.spin("fwd")};
	if(! e.ctrlKey){
		if(this.getid("Selection")!="0_0")
			{this.selection();this.spinHi();};//選択範囲解除
	};
	return false;
	break;
case	27	:	;//esc
	if (this.edchg){this.put(this.eddt);}//更新
	if(this.getid("Selection")!="0_0") {this.selection();this.spinHi();break;};
		//選択範囲解除
//	if(this.Focus) {this.focusCell();};
	
		//選択範囲なければフォーカス解除
	break;

case	32	:	;//space 値を確定してフォーカスアウト
	if (this.edchg){this.put(this.eddt);}//更新
//	this.focusCell();
	break;
case	38	:	;//カーソル上・下
case	40	:	;//シフト時はセレクション(+スピン)の調整
 	if (	chkShift(e) &&
		this.Select[1]+this.Selection[1]>=0 &&
		this.Select[1]+this.Selection[1]<(XPS.duration()-1)
	)
	{	var kOffset=(key==38)? -1:1;
		this.selection(this.Select[0]+"_"+
		(this.Select[1]+this.Selection[1]+kOffset));
		this.spin("update");
	}else{
		if (this.edchg){this.put(this.eddt);}//更新
		if(key==38){this.spin("up")}else{this.spin("down")};
	}	;return false;	break;
case	39	:		;//右
	if (this.edchg){this.put(this.eddt);}//更新
	if (! this.edchg) {this.spin("right")	;return false;
	}else{
	return true;
	};	break;
case	37	:		;//左?
	if (this.edchg){this.put(this.eddt);}//更新
 	if (! this.edchg) {this.spin("left")	;return false;
	}else{
	return true;
	};	break;
case	33:		;//ページアップ
	if (this.edchg){this.put(this.eddt);}//更新
	this.spin("pgup");	break;
case	34:	;//ページダウン
	if (this.edchg){this.put(this.eddt);}//更新
	this.spin("pgdn");	break;
case	35 :;//[END]
	xUI.selectCell(xUI.Select[0]+"_"+XPS.duration());
//	xUI.selectCell(xUI.Select[0]+"_"+XPS.duration(),"end");
	break;
case	36 :;//[HOME]
//	xUI.selectCell(xUI.Select[0]+"_0","home");
	xUI.selectCell(xUI.Select[0]+"_0");
	break;
case	65 :		;	//[ctrl]+[A]/selectAll
 	if (chkCtrl(e))	{
	if (this.edchg){this.put(this.eddt);}//更新
		this.selectCell(this.Select[0]+"_0");//selall
		this.selection(this.Select[0]+"_"+XPS.duration());
		return false;}else{return true};
	break;
//case	:;//	break;
case	67 :		;	//[ctrl]+[C]/copy
	if (chkCtrl(e))	{
	if (this.edchg){this.put(this.eddt);}//更新
		this.yank();
		return false;}else{return true};
	break;
case	79 :		;	//[ctrl]+[O]/ Open Document
	if ((chkCtrl(e))&&(! chkShift(e)))	{
		this.openDocument();
		return false;}else{return true}
	break;
case	83 :	alert("SSS");	//[ctrl]+[S]/ Save or Store document
	if (chkCtrl(e)) {
		 if(chkShift(e)){this.storeDocument("as");}else{this.storeDocument();}
		return false;
	}else{
		return true
	}
	break;
case	86 :		;	//[ctrl]+[V]/paste
	if (chkCtrl(e))	{
	if (this.edchg){this.put(this.eddt);}//更新
		this.paste();
		return false;}else{return true};
	break;
case	88 :		;	//[ctrl]+[X]/cut
	if (chkCtrl(e))	{
	if (this.edchg){this.put(this.eddt);}//更新
		this.cut();
		return false;}else{return true};
	break;
case	89 :		;	//[ctrl]+[Y]/redo
	if (chkCtrl(e))	{
	if (this.edchg){this.put(this.eddt);}//更新
		this.redo();
		return false;}else{return true};
	break;
case	90 :		;	//[ctrl]+[Z]/undo
	if (chkCtrl(e))	{
	if (this.edchg){this.put(this.eddt);}//更新
		this.undo();
		return false;}else{return true};
	break;
/* 保留
case	 :		;	//[ctrl]+[]/
case	8	:	this.spin("bs");	break;	//bs NOP
case	46	:	this.spin("del");	break;	//del 
case  :	window.status="[]";	break;	//
*/
default :	return true;
	};
return false;
};

xUI.keyPress	=function(e){

//フォーカスされたテーブル上の入力ボックスのキープレスを検出して
//動作コントロールのために戻り値を調整
//alert(e);
	key = getKEYCODE(e);//キーコードを取得
	switch(key) {
case	27	: return false		;//esc
case	25	:if(! Safari) break;
case	0	:
case	9	:			;//またはTAB および ctr-I
	if (this.edchg)
	{return true} else {return false};break;//ctrls
case	13	:			;//Enter
	return false;break;
case	65	:			;//a
case	67	:			;//c
case	79	:			;//v
case	83	:			;//v
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
	if (chkCtrl(e))	{return false}else{return true};
		break;
//case		: return false;break	;//
//	if (this.edchg)
//	{return true} else {return false};
//	;break
// なんか、イロイロ間違い。キープレスでは、ほとんどのコントロール関連の
//キーコードが拾えないので、あまり気にする必要ないみたい。
//気にするのは、ほぼ改行(enter/return)のみ。
//case 	:	return false;break;//
default :	return true;
	};
return true;
};
//
//xUI.keyPress	=keyPress_ ;
//
//キーアップもキャプチャする。UI制御に必要 今のところは使ってない?
xUI.keyUp=function(e){

	key = getKEYCODE(e);//キーコードを取得
	iBocs	= document.getElementById("iNputbOx").value;
window.status='KEYUP /'+key+'/'+String.fromCharCode(getKEYCODE(e))+'/'+iBocs+'/'+this.bkup()+'/'+this.edchg;
	if(this.bkup()!=document.getElementById("iNputbOx").value){
		if (!this.edchg) this.edChg(true);//変更されていたらフラグ立て
//		syncInput(iBocs);
	};
	switch(key) {
case 9	:	;	//tab はシステムで使うのでUPは注意
case 13	:	;	//Enter
case 27	:	;	//esc
case 32	:	;	//space
case 38	:	;	//上カーソル
case 40	:	;	//下
case 39	:	;	//右
case 37	:	;	//左
case  33:	;	//ページアップ
case  34:	;	//ページダウン
case  16:	;	//シフト
case  17:	;	//コントロール
case  18:	;	//ALT
case  45:	;	//ins
case  46:	;	//del
case  144:	;	//clear(NumLock)
//case  :	;	//
	if(!this.edchg) document.getElementById("iNputbOx").select();
	return true;break;
//case  :	window.status="[]";	break;	//
case	65	:			;//[a]
case	67	:			;//[c]
case	79	:			;//[v]
case	83	:			;//[v]
case	86	:			;//[v]
case	88	:			;//[x]
case	89	:			;//[y]
case	90	:			;//[z]
	if (chkCtrl(e))	{
		return true;
	};
		break;
//case 99 :	;	//[C]copy	このあたりは横取り
//case 118 :	;	//[V]paste
//case 120 :	;	//[X]cut	しないほうが良い?
case 8	:	;	//bs NOP
default :
	return true;
	};
return false;
};
//
//xUI.keyUp	=	keyUp_	;
//
/*	マウス動作
マウス処理を集中的にコントロールするファンクション
 */
xUI.Mouse=function(e){
//alert("mouse:"+e.type.toString())
//document.dbg.Console.value=("mouse:"+e.type.toString())+"\n"+document.dbg.Console.value;
//if(dbg) dbgPut("mouse:"+e.type.toString());
//document.getElementById("iNputbOx").focus();

if(this.edchg){
	this.eddt=(this.activeInput=="tool_")?
		this["tool_"].document.getElementById("iNputbOx").value:
		document.getElementById("iNputbOx").value;
};

//IEのとき event.button event.srcElement
//	if(MSIE){TargeT = event.srcElement ;Bt = event.button ;}else{};

		var TargeT=e.target;var Bt=e.which;//ターゲットオブジェクト取得
//dbgPut(TargeT.id);
//IDの無いエレメントは処理スキップ
	if(! TargeT.id){return false;}

//カラム移動処理の前にヘッダ処理を追加 2010/08
	if(TargeT.id.match(/^L([0-9]+)_([0-9]+)_([0-9]+)$/))
	{
		var tln=1*RegExp.$1;var pgn=1*RegExp.$2;var cbn=1*RegExp.$3;//timeline(column)ID/pageID/columnBlockID
switch(e.type){
case	"dblclick":
		reNameLabel((tln+1).toString());
break;
case	"mousedown":
		xUI.changeColumn(tln+1,2*pgn+cbn);
break;

}
return 		;
	}

//	if(TargeT.id.split("_").length>2){return false};//判定を変更
	if(!(TargeT.id.match(/^([0-9]+)_([0-9]+)$/))){return false};
//ページヘッダ処理を抜けた場合カラム移動処理
switch (e.type){
case	"mousedown"	:
//document.getElementById("iNputbOx").value=("mouseDown")
	if (this.edchg){this.put(this.eddt);}//更新

	this.Mouse.rID=this.getid("Select");
	this.Mouse.sID=TargeT.id;
	this.Mouse.action=true;

//	if(TargeT.id==this.getid("Select"))
//	{	}else{	};

		if(this.Selection[0]!=0||this.Selection[1]!=0)
		{
			this.selection();//セレクション解除
			this.Mouse.action=false;
			this.selectCell(TargeT.id);//セレクト移動
			return false;
		}else{
		};

		if(chkShift(e))
		{	this.selection(TargeT.id);
			this.spin("update");
			return false;//マルチセレクト
		}else{
			if (!chkCtrl(e)){this.selection()};//コントロールなければ選択範囲の解除

			//this.Mouse.action=false;
			this.selectCell(TargeT.id);
		};
	break;
case	"mouseup"	:
//document.getElementById("iNputbOx").value=("mouseUp")
		this.Mouse.action=false;
	if( this.Mouse.sID!=TargeT.id)
	{
		if(chkShift(e))
		{	this.selection(TargeT.id);
			this.spin("update");
			return false;//マルチセレクト
		}else{
			return false;//セレクトしたまま移動
		};
	};
	break;
case	"click"	:
	break;
case	"mouseover"	:
	if(this.Mouse.action)
		{	if (TargeT.id && xUI.Mouse.rID!=TargeT.id )
			{
				this.selection(TargeT.id);
				this.spin("update");
				return false;
			}else{
				return true;
			};
		};
default	:	return true;
};
	return false;
};
//
//	xUI.Mouse.action	=false	;//マウスアクション保留フラグ
//	xUI.Mouse.rID=false	;//マウスカーソルID

//
//サブウインドウを開く。引数はキーワード。戻り値は常にfalse?引っ越しする?
xUI.openSW=function(name){
	if (this.SWap[name]){
	if (! this[name].closed){};
		this[name].focus();
		sync(name);
		return false;
	}else{
if (name!="scene_"){
	this[name]=window.open("../template/"+name+".html",name,"width="+this.SWsz[name][0]+",height="+this.SWsz[name][1]);
}else{
	this[name]=window.open("../template/"+name+".html",name,"width="+this.SWsz[name][0]+",height="+this.SWsz[name][1]+",resizable=yes,scrollbars=yes");
};
		this.SWap[name]=true;
//		sync(name);
		return false;
	};
};
//
//xUI.openSW	=openSW_;
//サブウィンドウをすべて閉じる
xUI.closeSW=function(){
	for (var n=0;n<this.SWap.length;n++){
		if (this.SWap[n]==true) {this.SWap[n]=false;this[n].close();}
	};
};
//
//xUI.closeSW	=closeSW_;
//

//サブウィンドウをライズ
xUI.riseSW=function(name){
	if (! name){
		for (var n=0;n<this.SWap.length;n++)
		{if (this.SWap[n]==true) {this[n].focus();}};
	}else{
		if (this.SWap[name]==true) {this[name].focus();};
	};
};
//
//xUI.riseSW	=riseSW_	;
//

//ドキュメントを開く
xUI.openDocument=function(){
	if(fileBox.openFileDB){fileBox.openFileDB();}else{sWitchPanel("Data");}
}

//ドキュメントを保存
xUI.storeDocument=function(mode){
	if(fileBox.saveFile){
		if(mode){fileBox.saveAs()}else{fileBox.saveFile()}
	}else{sWitchPanel("Data")}
}

/*xUI.scrollTo(ID)
	特定のIDのセルが画面内に収まるようにスクロールする
	ずれ込みの象限によって移動位置は変わる
	IDを持ったエレメントならば汎用的に使用可能
	CSX環境でscrollTo()メソッドの際にスクロールイベントが発生しないケースあり
*/
xUI.scrollTo=function(ID){
//要素が存在しない場合はNOP
	if(document.getElementById(ID) == null){return};
//ドキュメント系の座標に変換するメソッド要る？

	var elementOffset=$("#"+ID).offset();
//ドキュメントオフセット（スクロール）
	var currentOffset={};
	  currentOffset.left=$(document).scrollLeft();
	  currentOffset.top=$(document).scrollTop();

//表示ウインドウを算出（Window系座標値)この基準位置はCompactモードの基準値なので注意
if(this.viewMode=="Compact"){
	var clipBounds={};
	  clipBounds.left=($("#qdr2").offset().left+$("#qdr2").width())-currentOffset.left;
	  clipBounds.top=$("#qdr2").offset().top+$("#qdr2").height()-currentOffset.top;
	  clipBounds.right=$(window).width();
	  clipBounds.bottom=$(window).height();
}else{
	var clipBounds={};
	  clipBounds.left=120;
	  clipBounds.top=$("#fixedHeader").height()+$("#app_status").height();
	  clipBounds.right=$(window).width();
	  clipBounds.bottom=$(window).height();
}
//フレーム高さ
	var frameHeight=$("#0_0").height();
if(this.viewMode=="Compact"){
//境界オフセット変数
	var borderOffset={};
//左マージン	２カラム
	  borderOffset.left=SheetCellWidth;
//上マージン	４フレーム
	  borderOffset.top=frameHeight*4;
//右マージン	レコード末コメント除き１カラム
	  borderOffset.right=CommentWidth;
//下マージン	４フレーム内寄り
	  borderOffset.bottom=frameHeight*6
}else{
//境界オフセット変数
	var borderOffset={};
//左マージン	３カラム
	  borderOffset.left=SheetCellWidth*4;
//上マージン	６フレーム
	  borderOffset.top= frameHeight*4;
//右マージン	レコード末コメント除き２カラム
	  borderOffset.right= CommentWidth;
//下マージン	６フレーム
	  borderOffset.bottom= frameHeight*6;
}
//オフセット計算
var offsetV=0;var offsetH=0;
	if((elementOffset.top-currentOffset.top)<(clipBounds.top+borderOffset.top)){
		offsetV=clipBounds.top+borderOffset.top-elementOffset.top+currentOffset.top;
	}else{
		if((elementOffset.top-currentOffset.top)>(clipBounds.bottom-borderOffset.bottom)){
		offsetV=clipBounds.bottom+currentOffset.top-borderOffset.bottom-elementOffset.top;
		}
	}

	if((elementOffset.left-currentOffset.left)<(clipBounds.left+borderOffset.left)){
		offsetH=(clipBounds.left+borderOffset.left)-elementOffset.left+currentOffset.left;
	}else{
		if((elementOffset.left-currentOffset.left)>(clipBounds.right-borderOffset.right)){
		offsetH=(clipBounds.right+currentOffset.left-borderOffset.right)-elementOffset.left;
		}
	}
//オフセットがHVともに0の場合は処理をスキップ(移動条件外)
	if((offsetV==0)&&(offsetH==0)){return;}else{
//移動量を計算してスクロール(可動範囲外の値が出るのでクランプする)
//	var myLeft=clamp([currentOffset.left-offsetH],0,document.body.clientWidth-(clipBounds.right -clipBounds.left))[1];
//	var myTop =clamp([currentOffset.top-offsetV] ,0,document.body.clientHeight-(clipBounds.bottom-clipBounds.top))[1];
	var myLeft=(currentOffset.left-offsetH);
	var myTop =(currentOffset.top-offsetV );
//	dbgPut(myLeft+":"+myTop);

//	var moved=(myLeft+myTop)?true:false;
//	if(moved){this.Mouse.action=false;};//マウス選択キャンセル
		scrollTo(myLeft,myTop);
	  if(appHost.platform=="CSX"){
		this.onScroll();
	  }
	}
}

/* xUI.onScroll
	SheetBody(document.body)のスクロールイベントに合わせ相当量の移動をヘッダに与える
３秒目からセルの高さが減少するのは、出力ルーチン側のカラム処理の問題だと思われる
スクロールが外れるのは、Rmp_initを通過しない書き換え部分で　body の初期化が発生するためと推測
onscrollの設定位置を一考
マージン部分のカバーをするか、または全体paddingが必要
キーボードによるスクロールが発生した場合、ケースを見て対応が必要

2015.04.22
*/
   xUI.onScroll=function() {
//dbgPut("kb");return false;
//dbgPut($(document.body).offset().top);
//if(this.viewMode=="Compact"){}
{     $('#UIheaderScrollV').offset( { top : $('#qdr4').offset().top} );
     $('#UIheaderScrollH').offset( { left : $('#qdr4').offset().left} );
}
   };
//===========================================


//オブジェクト戻す
return xUI;
};
/*
りまぴん スタートアップ
*/
//var MSIE = navigator.userAgent.indexOf("MSIE")!=-1;
//ユーザ設定を予備加工
	var MaxFrames=nas.FCT2Frm(Sheet);//タイムシート尺
	var MaxLayers=SheetLayers;//セル重ね数

//	新規XPSオブジェクト作成・初期化
var        XPS= new Object() ;//ダミーオブジェクトとして初期化
var startupXPS= ""           ;//初期状態のXPS本文

//始動オブジェクトとして空オブジェクトで初期化する スタートアップ終了までのフラグとして使用
var    xUI=new Object();
        xUI.Mouse=function(){return};
        xUI.onScroll=function(){return};
/* Startup */
function nas_Rmp_Startup(){
//バージョンナンバーセット
	sync("about_");
//設定ファイルの内容を配列で保存
//	var myPrefarences=buildCk();
//クッキー指定があれば読み込む
	if(useCookie[0]){ldCk()};

//設定されたサイズ(内寸)にリサイズする。
/*
	sheetAllWidth=(isNaN(sheetAllWidth))?
	getINNERWIDTH(window.parent) :sheetAllWidth;
	sheetAllHeight=(isNaN(sheetAllHeight))?
	getINNERHEIGHT(window.parent):sheetAllHeight;
	resizeToWIN(sheetAllWidth,sheetAllHeight,parent);
//設定されたサイズ比にフレームを調整
window.parent.document.getElementById("HTctlr").rows=sheetHeadHeight+",*";
window.parent.document.getElementById("WDctlr").cols=sheetInfoWidth+",*";
 */
//シートロゴをアップデート
document.getElementById("headerLogo").innerHTML="<a href='"+ headerLogo_url +"' title='"+ headerLogo_urlComment +"' target='_new'>"+ headerLogo +"</a>";

//	XPS=new_XPS(MaxLayers,MaxFrames);
	XPS=new Xps(MaxLayers,MaxFrames);
/*
	XPSオブジェクトのreadINメソッドをオーバーライド
	元のreadINメソッドから切り離した、データ判定ルーチン部分
	内部でparseXpsメソッドを呼んでリザルトを返す
*/

convertXps=function(datastream){
	if(! datastream.toString().length ){
		return false;
	}else{
//データが存在したら、種別判定して、コンバート可能なデータはコンバータに送ってXPS互換ストリームに変換する
//Xpxデータが与えられた場合は素通し
//この分岐処理は、互換性維持のための分岐
switch(true)
{
case	(/^nasTIME-SHEET\ 0\.[1-4]/).test(datastream):
//	判定ルーチン内で先にXPSをチェックしておく（先抜け）
break;
case	(/^\"Frame\",/).test(datastream):
			datastream =StylosCSV2XPS(datastream,0);
break;
case	(/^\{[^\}]*\}/).test(datastream):
			try{datastream =ARDJ2XPS(datastream);}catch(err){return false};
break;

case	(/^#TimeSheetGrid\x20SheetData/).test(datastream):
			try{datastream =ARD2XPS(datastream);}catch(err){return false}
break;
case	(/^\x22([^\x09]*\x09){25}[^\x09]*/).test(datastream):
			try{datastream =TSH2XPS(datastream);}catch(err){return false}
break;
case	(/^Adobe\ After\ Effects\x20([456]\.[05])\ Keyframe\ Data/).test(datastream):
			try{datastream=AEK2XDS(datastream)}catch(err){alert(err);return false}
		xUI.put(datastream);return true;
break;
default :
	if(TSXEx){
		try{datastream=TSX2XPS(datastream)}catch(err){alert(err);return false}
//		xUI.put(datastream);return true;
	}
//元の判定ルーチンと同じ
//データ内容での判別がほぼ不可能なので、拡張オプションがあってかつ他の判定をすべてすり抜けたデータを暫定的にTSXデータとみなす
}
		if(! datastream){return false}
	}
		return datastream;
}

XPS.readIN=function(datastream){
	xUI.errorCode=0;//読み込みメソッドが呼ばれたので最終のエラーコードを捨てる。
	if(! datastream.toString().length ){
	  xUI.errorCode=1;return false;
//"001:データ長が0です。読み込みに失敗したかもしれません",
	}else{
//データが存在したら、コンバータに送ってコンバート可能なデータをXPS互換ストリームに変換する
		return this.parseXps(convertXps(datastream));
	}
}

//	ダミーマップを与えて情報取り込み 要mapio確認
	var MAP=new Map(SheetLayers);

	XPS.getMap(MAP);
/*
//現在のシート上のカラーデータを取得
*/
//	alert(document.body.bgColor);
//	alert(document.body.Color);

//タイムシート背景色をconfigで設定した色に置き換え(css固定に変更)
	document.body.style.backgroundColor=SheetBaseColor;
//	さらにヘッダとフッタの背景色をシート背景色で塗りつぶし
	document.getElementById("fixedHeader").style.backgroundColor=SheetBaseColor;
//	nas.addCssRule("div.fixedHeadline","background-color:"+SheetBaseColor,"screen")
	nas.addCssRule("table.sheet","background-color:"+SheetBaseColor,"screen")
//	document.getElementById("UIheaderScrollH").style.width="100%";
//	document.getElementById("fixedFooter").style.backgroundColor=SheetBaseColor;

/*
//そのため画面から取得するルーチンはすべて無効に 2007/06/19
//	SheetBaseColor	=(document.getElementById("0_0").style.backgroundColor)?document.getElementById("0_0").style.backgroundColor:SheetBaseColor;
if(Safari)
{
	SheetBaseColor=document.styleSheets.item(0).cssRules.item(0).style.getPropertyValue("background-color");
//	alert("get bgColor "+SheetBaseColor);
}else{
	SheetBaseColor	=(document.bgColor)?document.bgColor:SheetBaseColor;
};
	SheetBaseColor=nas.colorAry2Str(nas.colorStr2Ary(SheetBaseColor));
 */

//編集不可領域の背景色
	if (! SheetBaseColor.toString().match(/^#[0-9a-f]+/i)) SheetBaseColor=nas.colorAry2Str(nas.colorStr2Ary(SheetBaseColor));
	SheetBlankColor	=nas.colorAry2Str(mul(nas.colorStr2Ary(SheetBaseColor),.95));

//シート境界色
	SheetBorderColor	=nas.colorAry2Str(mul(nas.colorStr2Ary(SheetBaseColor),.75));

//フットスタンプの色	FootStampColor	=document.getElementById("bgStamp").style.backgroundColor;

//選択セルの背景色	SelectedColor	=document.getElementById("bgSelect").style.backgroundColor;
//選択領域の背景色	SelectionColor	=document.getElementById("bgSelection").style.backgroundColor;

//	EditingColor	=document.getElementById("spanEdit").style.backgroundColor;
//セル編集中のインジケータ
//	SelectingColor	=document.getElementById("spanSelection").style.backgroundColor;
//セル選択中のインジケータ
/*
var mySections=[
	["th.timelabel","width:"+(TimeGuideWidth + CellWidthUnit)],
	[".dtSep","width:"+(DialogWidth + CellWidthUnit)],
	[".ntSep","width:"+(CommentWidth + CellWidthUnit)],
	["td.colSep","width:"+(ColumnSeparatorWidth +CellWidthUnit)],
	["th.layerlabelR","width:"+(ActionWidth + CellWidthUnit)],
	["th.layerlabel","width:"+(SheetCellWidth + CellWidthUnit)]
	["th.framenoteSpan","width",(CommentWidth + CellWidthUnit)],
]
*/
//	["timeguide","width:"+],
var mySections=[
	["th.tcSpan","width",(TimeGuideWidth + CellWidthUnit)],
	["th.dialogSpan","width,",(DialogWidth + CellWidthUnit)],
	["td.colSep","width",(ColumnSeparatorWidth +CellWidthUnit)],
	["th.referenceSpan","width",(ActionWidth + CellWidthUnit)],
	["th.editSpan","width",(SheetCellWidth + CellWidthUnit)],
	["th.timingSpan","width",(SheetCellWidth + CellWidthUnit)],
	["th.stillSpan","width",(StillCellWidth + CellWidthUnit)],
	["th.sfxSpan","width",(SfxCellWidth + CellWidthUnit)],
	["th.cameraSpan","width",(CameraCellWidth + CellWidthUnit)],
]

/*	cssにルールセットを追加する関数
	nas.addCssRule( セレクタ, プロパティ, 適用範囲 )
		セレクタ	cssのセレクタを指定
		プロパティ	プロパティを置く
		適用範囲	"screen""print"または"both"
 */
//width set
/*	リスト
class=timelabel
class=timeguide? 
class=dtSep
class=ntSep
class=colSep
class=layerlabelR
class=layerlabel
 */

for(var idx=0;idx<mySections.length;idx++){
	nas.addCssRule( mySections[idx][0],mySections[idx][1]+":"+mySections[idx][2],"both");
//	$(mySections[idx][0]).css(mySections[idx][1],mySections[idx][2])
};

//	シートブランクの色設定
var mySeps=[
	"ltSep","dtSep","ntSep","ntSep",
	"lsSep","dsSep","nsSep","nsSep",
	"lnSep","dnSep","nnSep","nnSep"
];

for(var idx=0;idx<mySeps.length;idx++){
	nas.addCssRule("."+mySeps[idx]+"_Blank","background-color:"+SheetBlankColor)
};

if(false){
//	設定幅適用
	$("th.tcSpan").width       =(TimeGuideWidth+CellWidthUnit);
	$("th.referenceSpan").width=(ActionWidth+CellWidthUnit);
	$("th.dialogSpan").width   =(DialogWidth+CellWidthUnit);
	$("th.editSpan").width     =(SheetCellWidth+CellWidthUnit);
	$("th.framenoteSpan").width=(CommentWidth+CellWidthUnit);
}
//サブルーチンの位置は後で一考

//alert(SelectingColor);


//	ドキュメント内にスタートアップデータがあれば読み出し

if(document.getElementById("startupXPS"))
{	startupXPS=document.getElementById("startupXPS").innerHTML; }


//	起動時に AIR環境で引数があれば引数を解釈実行する。
//同様のルーチンで  invorkイベントがあれば引数を解釈して実行するルーチンが必要
//実態はair_UI.jsxに


//	UI初期化
	xUI=new_xUI();
//	xUI オブジェクトは、コール前に必ずXPSを与えての再初期化が必要
if(startupXPS.length==0){
//	if(xUI){alert("AX"+xUI.backupStore)} //xUIの再初期化前でもbackupStoreプロパティは存在する。
if(isAIR){
//	var myBackup=localStorage.getItem("info.nekomataya.remaping.backupData");
}else{
//CSX環境下ではローカルストレージが未サポートなのでローカルストレージの判定をするが吉
  try{
	var myBackup=localStorage.getItem("info.nekomataya.remaping.backupData");
  }catch(err){
	var myBackup="";
  }
}

	if((myBackup)&&(myBackup.length)){
		var msg="バックアップ保存されたデータがあります。\n復元しますか？\n\nOK:復元 / CANCEL:新規";
		if(confirm(msg)){startupXPS=myBackup;};
	}
};//	記録されたシートが有れば読み出し
if((fileBox)&&(fileBox.contentText.length)){startupXPS=fileBox.contentText;}
if(startupXPS.length > 0){XPS.readIN(startupXPS);NameCheck=false;}
//	さっそくコール
	xUI.init(XPS);
	nas_Rmp_Init();
//================================css設定
//	シート境界色設定
	nas.addCssRule("table","border-color:"+SheetBorderColor,"screen");
	nas.addCssRule("th","border-color:"+SheetBorderColor,"screen");
	nas.addCssRule("td","border-color:"+SheetBorderColor,"screen");
//	識別用ラベル背景色設定
	nas.addCssRule("th.stilllabel" ,"background-color:"+xUI.stillColor ,"screen");
	nas.addCssRule("th.sfxlabel"   ,"background-color:"+xUI.sfxColor   ,"screen");
	nas.addCssRule("th.cameralabel","background-color:"+xUI.cameraColor,"screen");

//startupXPSがない場合でフラグがあればシートに書き込むユーザ名を問い合わせる
	if(NameCheck){
		var msg=welcomeMsg+" シートに記入するあなたの名前を入力してください。\n";
		var newName=null;
		nas.showModalDialog("prompt",msg,"作業者の名前",myName,function(){if(this.status==0){newName=this.value;myName=newName;XPS.update_user=this.value;sync("update_user");}});

	document.getElementById("nas_modalInput").focus();

	};

//	クッキーで設定されたspinValueがあれば反映
	if(xUI.spinValue){document.getElementById("spin_V").value=xUI.spinValue} ;

document.getElementById("iNputbOx").focus();

};

/*
タイムシートのUIをリセットする手続き
タイムシートの変更があった場合はxUI.init(XPS)を先にコールしてxUIのアップデートを行うこと
*/
function nas_Rmp_Init(){
//プロパティのリフレッシュ
	xUI._checkProp();

/*　表示モード増設 
Compactモード時は強制的に
  表示１列　コンテの継続時間とページ長を一致させる
表示モードにしたがって
  タイトルヘッドラインの縮小
*/
//xUI.PageCols=(xUI.viewMode=="Compact")? 1:2;
//xUI.SheetLength=(xUI.viewMode=="Compact")?(Math.floor(XPS.duration()/nas.FRATE)):6;
//タイムシートテーブルボディ幅の算出
//(タイムヘッダ幅+ダイアログ幅+レイヤ数*幅+コメント欄幅+余分)×ページカラム数＋カラムセパレータ幅×(ページカラム数?1)

var tableBodyWidth=(
	TimeGuideWidth + DialogWidth + 
	ActionWidth*xUI.referenceXPS.layers.length + SheetCellWidth*XPS.layers.length +
	CommentWidth )
	if(xUI.viewMode!="Compact"){
	    tableBodyWidth=tableBodyWidth* xUI.PageCols +(ColumnSeparatorWidth*(xUI.PageCols-1));//
	}
//全体幅の指定を停止
//	nas.addCssRule("table.sheet","width:"+(tableBodyWidth + CellWidthUnit),"screen");

/* この計算はシート表示初期化の際にのみ必要な計算なのでこちらに移動	07/07/08	*/
//シートを初期化
	var TimeStart=new Date();
//UI上メモとトランジション表示をシート表示と切り分けること 関連処理注意
	sync("memo");
if(xUI.viewMode=="Compact"){
//	alert("compact xD:"+ XPS.duration()+" pL: "+xUI.PageLength );
//コンパクトモード　コンパクトUI用のラベルヘッダーを作成
document.getElementById("UIheaderFix").innerHTML=xUI.pageView(-1);
document.getElementById("UIheaderScrollH").innerHTML=xUI.pageView(0);
document.getElementById("UIheaderScrollV").innerHTML=xUI.pageView(-2);

document.getElementById("UIheader").style.display="inline";
//コンパクトUI時は1ページ限定なのでボディ出力を１回だけ行う
		var SheetBody= xUI.headerView(1);
		SheetBody+= '<br>';//UI調整用に１行（ステータス行の分）
		SheetBody+= xUI.pageView(1);
}else{
//ノーマルモード　コンパクトUI用のラベルヘッダーを隠す
document.getElementById("UIheader").style.display="none";
//
	var SheetBody='';
	for (Page=1 ;Page <=Math.ceil(XPS.duration()/xUI.PageLength);Page++)
	{
		SheetBody+= xUI.headerView(Page);
		SheetBody+= ' <span class=pgNm>( p '+nas.Zf(Page,3)+' )</span><br>';
		SheetBody+= xUI.pageView(Page);
	};
}
//シートボディを締める
	document.getElementById("sheet_body").innerHTML=SheetBody+"<div class=\"screenSpace\"></div>";
//"<div class=\"screenSpace\"></div>"+;

//書き出したら、セレクト関連をハイライト
//
//	XPS.selectionHi("hilite")
//	xUI.focusCell("1_0")	;//フォーカスして
//	xUI.selectCell("1_0")	;//フォーカスして,"startup"
	xUI.bkup([XPS.xpsBody[1][0]]);
//	xUI.focusCell()	;//リリース
//jquery関連　パネル類の初期化
	initPanels();


//表示内容の同期
	sync("tool_");sync("info_");
//フットスタンプの再表示
	if(FootMark){xUI.footstampPaint()};
	var TimeFinish=new Date();
	var msg="ただいまのレンダリング所要時間は、およそ "+ Math.round((TimeFinish-TimeStart)/1000) +" 秒 でした。\n レイヤ数は、 "+XPS.layers.length+ "\nフレーム数は、"+XPS.duration()+"\tでした。\n\t現在のspin値は :"+xUI.spinValue;
//	if(dbg) alert(msg);

//ヘッドラインの初期化
	initToolbox();
//デバッグ関連メニューの表示
	if(dbg)
	{
		$("li#debug").each(function(){$(this).show()});
		if(appHost.platform=="AIR"){$("li#airDbg").each(function(){$(this).show()})};
	}else{
		$("li#debug").each(function(){$(this).hide()});
		$("li#airDbg").each(function(){$(this).hide()});
	}
//AIRを認識した場合cgiUIとairUIを切り換え
switch (appHost.platform){
case	"AIR":
//tableメニュー表記
		$("tr#cgiMenu").each(function(){$(this).hide()});
//ショートカットアイコンボタン
		$("#airMenu").show();//="inline";
		$("#psMenu").hide();//
		$("#cgiMenu").hide();//="none";
//		document.getElementById("airMenu").style.display="inline";
//		document.getElementById("cgiMenu").style.display="none";
//サンプル取得部
//		document.getElementById("cgiSample").style.display="none";
//ドロップダウンメニュー用表記切り替え
		$("li").each(function(){
				switch(this.id){
				case "dMair":$(this).show();break;
				case "dMps":$(this).hide();break;
				case "dMcgi":$(this).hide();break;
				}
			});
//ブラウザ用ドロップダウンメニュー表示
		$("#pMenu").show();
//ドロップダウンメニューの初期化
		$("#pMenu li").hover(function() {
			$(this).children('ul').show();
		}, function() {$(this).children('ul').hide();});
//osがwindowsでかつAIR環境だった場合のみドロップダウンメニューを隠す
//		if((window.navigator.platform).indexOf("Win")>=0){$("#pMenu").hide()};
break;
case "CEP":
//	window.parent.psHtmlDispatch();
case	"CSX":
//tableメニュー表記
		$("tr#airMenu").each(function(){$(this).hide()});
//ショートカットアイコンボタン
		$("#airMenu").hide();//
		$("#psMenu").show();//
		$("#cgiMenu").hide();//
//サンプル取得部
//		document.getElementById("cgiSample").style.display="none";
//ドロップダウンメニュー用表記切り替え
		$("li").each(function(){
				switch(this.id){
				case "dMair":$(this).hide();break;
				case "dMps":$(this).show();break;
				case "dMcgi":$(this).hide();break;
				}
			});
//ブラウザ用ドロップダウンメニュー表示
		$("#pMenu").show();
//ドロップダウンメニューの初期化
		$("#pMenu li").hover(function() {
			$(this).children('ul').show();
		}, function() {$(this).children('ul').hide();});
break;
default:
//標準的なブラウザ
//tableメニュー表記
		$("tr#airMenu").each(function(){$(this).hide()});
//ショートカットアイコンボタン
		$("#airMenu").hide();//
		$("#psMenu").hide();//
		$("#cgiMenu").show();//
//ドロップダウンメニュー用表記切り替え
		$("li").each(function(){
				switch(this.id){
				case "dMair":$(this).hide();break;
				case "dMps":$(this).hide();break;
				case "dMcgi":$(this).show();break;
				}
			});
//ブラウザ用ドロップダウンメニュー表示
		$("div#pMenu").show();
//ドロップダウンメニューの初期化
		$("#pMenu li").hover(function() {
			$(this).children('ul').show();
		}, function() {$(this).children('ul').hide();});
}
//コンパクトメニューが有効ならばコンパクトモードへ遷移
	if(xUI.viewMode=="Compact"){
//ロゴ
	$("#headerLogo").hide();
//第二カウンタ
	$("#fct1").hide();
//ツールバーボタン
	$("#ok").hide();
	$("#ng").hide();

//シートヘッダ
	$("#opusL").hide();
	$("#titleL").hide();
	$("#subtitleL").hide();
	$("#nameL").hide();
	$("#opus").hide();
	$("#title").hide();
	$("#subtitle").hide();
	$("#update_user").hide();
//メモエリア
	$("#memo_header").hide();
	$("#memo").hide();
//タイムラインヘッダ
	$("#UIheader").show();
	if(document.getElementById("UIheaderScrollV").innerHTML==""){document.getElementById("UIheaderScrollV").innerHTML=xUI.paveView(-2);};
//	$("#UIheaderFix").show();
//	$("#UIheaderScroll").show();
	}else{
//ロゴ
	$("#headerLogo").show();
//第二カウンタ
	$("#fct1").show();
//ツールバーボタン
	$("#ok").show();
	$("#ng").show();

//シートヘッダ
	$("#opusL").show();
	$("#titleL").show();
	$("#subtitleL").show();
	$("#nameL").show();
	$("#opus").show();
	$("#title").show();
	$("#subtitle").show();
	$("#update_user").show();
//メモエリア
	$("#memo_header").show();
	$("#memo").show();
//タイムラインヘッダ
	$("#UIheader").hide();
	$("#UIheaderScrollV").html("");
	
//	$("#UIheaderFix").hide();
//	$("#UIheaderScroll").hide();
	}


//infoシートの初期化
	if(TSXEx){init_TSXEx();};
//window.FileReader オブジェクトがある場合のみローカルファイル用のセレクタを表示する
//読み込み機能自体は封鎖してないので注意
	if(window.FileReader){
		$("#localFileLoader").show();
		$("#localFileLoaderSelect").show();
	}else{
		$("#localFileLoader").hide();
		$("#localFileLoaderSelect").hide();
	}
//initInfosheet();
//xUI.spin(0);xUI.spin(SpinValue);
//ドキュメント設定オブジェクト初期化
	myScenePref	=new ScenePref();
//UI設定オブジェクト初期化
	myPref	=new Pref();
//
//
//if(dbg){xUI.openSW("dbg_")};
/* ヘッダ高さの初期調整*/
xUI.adjustSpacer();

};


function nas_Rmp_reStart(evt){
//ファイルがオープン後に変更されていたら、警告する
/*
	オープン判定は xUI.storePt と xUI.undoPtの比較で行う
storePtはオープン時および保存時に現状のundoPtを複製するので、
内容変化があれば (xUI.storePt != xUI.undoPt) となる
*/
// evt = event || window.event;
//	return evt.returnValue="TESTEST";
	if(! xUI.isStored()){
		var msg="このページから移動します(移動のキャンセルはできません)\nドキュメントが保存されていませんが、保存しますか？";
		if(confirm(msg)){xUI.setBackup();
		//保存処理
	};
	
	}

//if(confirm("TEST")){return }else {return false};
//	クッキーを使用する設定なら、
//	現在のウィンドウサイズを取得してクッキーかき出し
if (useCookie[0]) {writeCk(buildCk());};
//	サブウィンドウが開いていたら閉じる?
	xUI.closeSW();
//
};

/*
メモ

アンドゥスタックの使用

通常入力
アンドゥポインタと配列の長さを比較
配列をアンドゥポインタの長さに揃える(切り取る)
アンドゥ要素(位置・セレクション・保存データストリーム)を
アンドゥ配列に積む・ポインタ1加算

アンドゥ操作
ポインタ位置のデータを使用して本体配列の書き換え
アンドゥデータとリドゥデータの入れ換え(位置とセレクションはそのまま)
ポインタだけを1減算

リドゥ操作
ポインタ1加算
ポインタ位置のデータを使用して本体配列の書き換え
アンドゥデータにデータを置き換え

操作フラグ必要


HTML上のシート取り込み手順
index(または相当の)ファイルのbodyに textarea でXPSデータを書き込む
startup内でXPSデータを認識したら。フレームセットのプロパティにXPSデータをescapeして書き込む
シート初期化の際に parent.document.body.innerHTML から切り分けで読み出す
読み出しに成功した場合だけ、そのXPSを使用してシートを初期化する。



2015 01 10
メモ　シートの秒数を減らす際にスクロールスペーサーのサイズ計算が間違っている
計算違いではなく　ステータス表示エレメントの位置がズレて、その値から計算しているのでおおきくなる
エラー検出が必要かも
全尺が大きい時に顕著？

尺が大きい時に自動スクロールの位置計算に狂いが出ているので要チェック



*/
