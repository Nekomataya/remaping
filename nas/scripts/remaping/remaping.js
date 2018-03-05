﻿ /**
 * Remaping本体スクリプト
 *     XPSオブジェクトとMAPオブジェクトについては、
 *     以下のドキュメントを参照のこと
 *     http://www.nekomataya.info/remaping/teck.html
 *     $Id: remaping.js,v 1.66 2014/11/29 kiyo Exp $
 * CEP動作のための修正開始
 */
// http://d.hatena.ne.jp/amachang/20071010/1192012056 //
/*@cc_on _d=document;eval('var document=_d')@*/
//  JQ isVisible mathod
$.fn.isVisible = function() {
    return $.expr.filters.visible(this[0]);
};
/* xUI
 *     UIコントロールオブジェクト
 * 
 */
//----------------------------------- UIコントロールオブジェクトを作成、初期化
function new_xUI(){
    var xUI = {};
/**
 * xUI のエラーメッセージは旧Xpsオブジェクトから移転されたもの
 * XpsオブジェクトにUIエラーハンドリングは不用
 */
    xUI.errorCode    =    0;
    xUI.errorMsg=[
{en: "000:There is no error in final processing" ,ja: "000:最終処理にエラーはありません"},
{en: "001:Data length is 0. It may have failed to read" ,ja: "001:データ長が0です。読み込みに失敗したかもしれません"},
{en: "002:sorry. I do not seem to be able to read this data" ,ja: "002:どうもすみません。このデータは読めないみたいダ"},
{en: "003:There is no data to read" ,ja: "003:読み取るデータがないのです。"},
{en: "004:There is no data to be converted.\n Processing is interrupted." ,ja: "004:変換すべきデータがありません。\n処理を中断します。"},
{en: "005:MAP data is missing" ,ja: "005:MAPデータがありません"},
{en: "006:User cancellation" ,ja: "006:ユーザキャンセル"},
{en: "007:You can not specify outside the range" ,ja: "007:範囲外の指定はできません"},
{en: "008:You can not update confirmed data" ,ja: "008:確定済データを更新することはできません"},
{en: "009:Unexpected error" ,ja: "009:想定外エラー"}
];//    -localized

//------- UIオブジェクト初期化前の未定義参照エラーを回避するためのダミーメソッド
    xUI.Mouse=function(evt){return true;};
//	初期化前にバックアップデータの処理が発生するので暫定的に初期化しておく
    xUI.backupStore    ="0123456789";    //作業バックアップ

//------------------------ 以下インターフェースカラープロパティ
//カラー・トラック幅等のルック決定要素はundefinedで初期化して　遅延解決に移行する

    xUI.sheetbaseColor        ; //タイムシート背景色
    xUI.sheetblankColor       ; //編集不可領域の背景色
    xUI.footstampColor        ; //フットスタンプの色
    xUI.inputModeColor = {}   ; //入力モード色
    xUI.inputModeColor.NORMAL ; //ノーマル色
    xUI.inputModeColor.EXTEND ; //ラピッド入力基本色
    xUI.inputModeColor.FLOAT  ; //ブロック移動基本色
    xUI.inputModeColor.SECTION; //範囲編集中の色
         
    xUI.selectedColor         ; //選択セルの背景色
    xUI.selectionColor        ; //選択領域の背景色
    xUI.editingColor          ; //セル編集中のインジケータ
    xUI.selectingColor        ; //セル選択中のインジケータ

//テキストカラー
    xUI.sheetTextColor        ;//本文標準色
    xUI.annnotationColor        ;//本文注釈色
    xUI.linkColor        ;//リンク色
    xUI.hoverColor       ;//リンクホーバー色
    xUI.activeColor      ;//リンクアクティブ色
//メニュー関連
    ;//
    ;//
    ;//
    ;//
//タイムライン・ラベル識別カラ－
    xUI.cameraColor;
    xUI.sfxColor;
    xUI.stillColor;//タイムライン全体に着色
//中間色自動計算
        xUI.inputModeColor.NORMALspin;
        xUI.inputModeColor.EXTENDspin;
        xUI.inputModeColor.FLOATspin;
        xUI.inputModeColor.SECTIONspin;
//スピン選択状態
        xUI.inputModeColor.NORMALspinselected;
        xUI.inputModeColor.EXTENDspinselected;
        xUI.inputModeColor.FLOATspinselected;
        xUI.inputModeColor.SECTIONspinselected;
//選択状態
        xUI.inputModeColor.NORMALselection;
        xUI.inputModeColor.EXTENDselection;
        xUI.inputModeColor.FLOATselection;
        xUI.inputModeColor.SECTIONselection;
//編集中
        xUI.inputModeColor.NORMALeddt;
        xUI.inputModeColor.EXTENDeddt;
        xUI.inputModeColor.FLOATeddt;
        xUI.inputModeColor.SECTIONeddt;
//フロートテキスト色
    xUI.floatTextColor;
//----------------------------------------------------------------------初期状態設定
    xUI.spinAreaColor;
    xUI.spinAreaColorSelect;
    xUI.sectionBodyColor;
// ---------------------- ここまでカラー設定
/**
    xUI.importBox
    複数データ対応ドキュメントインポーター
*/
    xUI.importBox={};//インポート情報トレーラー初期化
    xUI.importBox.overwriteProps    ={};
    xUI.importBox.maxSize  = 1000000;
    xUI.importBox.maxCount = 10;
    xUI.importBox.allowExtensions=new RegExp("\.(txt|csv|xps|ard|ardj|tsh)$",'i');
/**
    importBox リセット
    インポート操作の直前でリセットを行うこと
*/
xUI.importBox.reset = function(){
    this.targetContents    =[];
    this.selectedContents  =[];
    this.importCount= 0;
    this.callback = undefined;
console.log('importBox reset')
}
    xUI.importBox.reset();
/**
    変換ターゲットとなるFileオブジェクト配列を引数にして以下の関数を呼び出す
    全カット変換終了時のコールバック関数を与えることが可能
*/
xUI.importBox.import = function(targetFiles,callback){
    if(appHost.platform == "AIR"){
        return false;
//***AIR  用の分岐は　単ファイルのままで保留2018 0201
    // File APIを利用できるかをチェック
    if (window.File) {
      // 指定されたファイルを取得
      var input = targetFiles[0];
	fileBox.currentFile=new air.File(input.name);
	xUI.data_well.value =fileBox.readContent();
 }
    }else{
    // File APIを利用できるかをチェック
    if (window.File) {
      if(window.FileReader){
        xUI.importBox.reset();//ここで再初期化する
        xUI.importBox.callback=callback;
//処理に先行して拡張子とファイルサイズでフィルタして作業リストを作成する
//作業リストの進行度合いをチェックして終了判定をかける
        var targetQueue=[];
  for(var ix=0;ix<targetFiles.length;ix++){
    var check = targetFiles[ix];
    if(
        (check.name.match(this.allowExtensions)) &&
        (check.size <= this.maxSize) &&
        (ix < this.maxCount)
    ){
        targetQueue.push(check);
        this.importCount ++;
    }else{
        console.log("skip file "+check.name );
    }
  };
      // 指定されたファイルを取得してインポーターのプロパティとして記録
  for(var ix=0;ix<targetQueue.length;ix++){
    var input = targetQueue[ix];
//非同期で実行
(function(){
	var myEncode=(input.name.match(/\.(ard|csv|tsh)$/))?"Shift-JIS":"UTF-8";
      // ファイルリーダーオブジェクト初期化(Chrome/Firefoxのみ)
      var reader = new FileReader();
      reader.name=input.name;
      // ファイルの読み込みに成功したら、その内容をxUI.data_wellに反映
      reader.addEventListener('load', function(e) {
        var output = reader.result;//
        xUI.data_well.value = reader.result;//最後に読み込んだ内容で上書きされるので注意　20180220

        var myXps = convertXps(reader.result,divideExtension(reader.name)[1],xUI.importBox.overwriteProps);// 指定オプション無しで一旦変換する
        if(!myXps){
            alert(reader.name+' is not supported format');
        }
        xUI.importBox.targetContents.push({"name":reader.name,"content":reader.result,"xps":myXps,"checked":true});
        if ( xUI.importBox.importCount == xUI.importBox.targetContents.length ){
            console.log(xUI.importBox.targetContents)
            var firstFile=Xps.parseIdentifier(divideExtension(xUI.importBox.targetContents[0].name)[1]);
            xUI.importBox.overwriteProps={
                "title":String(firstFile.title),
                "episode":String(firstFile.opus),
                "description":String(firstFile.subtitle)
            }
    console.log(xUI.importBox.overwriteProps);
            xUI.importBox.resetTarget(xUI.importBox.targetContents,xUI.importBox.overwriteProps);
            var myDialog = $("#optionPanelSCI");
		    myDialog.dialog("open");myDialog.focus();
		    document.getElementById('optionPanelSCI_01_sc').focus();//第一カット(かならずある)にフォーカス
        };
      }, true);
      // ファイルの内容をテキストとして取得
      reader.readAsText(input, myEncode);
})();
  }
      }else{
//FileReaderが無いブラウザ(Safari等)では、お詫びしてオシマイ
var msg = "no FileReader! :\n　このブラウザはFileReaderオブジェクトをサポートしていません。\n残念ですが、この環境ではローカルファイルは読みだし出来ません。\nThis browser does not support the FileReader object. \n Unfortunately, you can't read local files now.";
	alert(msg);
      }
    }
  }
}
/**
    xUI.importBox.updateTarget()
    チェックのあるカットのみダイアログの値でターゲットのプロパティを更新して
    新規の配列を作成する
*/
xUI.importBox.updateTarget= function(){
    for(var tix=0;tix<xUI.importBox.targetContents.length;tix++){
        var doAction = document.getElementById('optionPanelSCI_'+nas.Zf(tix+1,2)+'_imptCB').checked;
        xUI.importBox.targetContents[tix].checked = doAction;
        if(! doAction ) continue;
        var modefiedXps = xUI.importBox.targetContents[tix].xps;//直に参照
        modefiedXps.title    = document.getElementById('optionPanelSCI_title').value
        modefiedXps.opus     = document.getElementById('optionPanelSCI_opus').value;
        modefiedXps.subtitle = document.getElementById('optionPanelSCI_subtitle').value;
        modefiedXps.scene    = '';
        modefiedXps.cut      = document.getElementById('optionPanelSCI_'+nas.Zf(tix+1,2)+'_sc').value;
    //  時間変更 短くなった場合は後方からフレームが削除される
        modefiedXps.setDuration(nas.FCT2Frm(document.getElementById('optionPanelSCI_'+nas.Zf(tix+1,2)+'_time').value));
    //  変更されたXpsのステータスをFloatingに変更（暫定処理）
        modefiedXps.currentStatus.content    = 'Floating';
        xUI.importBox.selectedContents.push(modefiedXps);
    }
    $("#optionPanelSCI").dialog("close");
    if(xUI.importBox.callback instanceof Function){xUI.importBox.callback();};
}
/**
    xUI.importBox.resetTarget(dataTrailer,optionTrailer)
    インポート用のダイアログを初期化する
    引数は初期化用データ
    optionTrailer が与えられない場合は書き直しは行われない
*/
xUI.importBox.resetTarget= function(dataTrailer,optionTrailer){
    if (! dataTrailer) dataTrailer=this.targetContents;
    if (! dataTrailer.length) return false;
    if (optionTrailer){
      document.getElementById('optionPanelSCI_title').value    = optionTrailer.title;
      document.getElementById('optionPanelSCI_opus').value     = optionTrailer.episode;
      document.getElementById('optionPanelSCI_subtitle').value = optionTrailer.description;
    } else {
      document.getElementById('optionPanelSCI_title').value    = dataTrailer[0].xps.title;
      document.getElementById('optionPanelSCI_opus').value     = dataTrailer[0].xps.opus;
      document.getElementById('optionPanelSCI_subtitle').value = dataTrailer[0].xps.subtitle;
    }
//以下マルチファイル対応に変更
    var listHolder=document.getElementById('optionPanelSCIs');
//子ノードをクリア
    while( listHolder.firstChild ){
        listHolder.removeChild( listHolder.firstChild );
    };
//新規の子ノードを作成
    var sciTemplate = document.getElementById('sciTemplate');
    var sciHTML="";
    for(var dix=0;dix<dataTrailer.length;dix++){
        sciHTML += sciTemplate.innerHTML.replace(/%ID%/g,nas.Zf(dix+1,2));
    }
    listHolder.innerHTML=sciHTML;
    if(dataTrailer.length > 1){
        $('.SCiImportCB').css('display','inline');
    }else{
        $('.SCiImportCB').css('display','none');
    };
    for(var dix=0;dix<dataTrailer.length;dix++){
        var IDnumber=nas.Zf(dix+1,2);
        console.log(dix);
        console.log(dataTrailer[dix]);
        document.getElementById('optionPanelSCI_'+IDnumber+'_imptCB').checked    = dataTrailer[dix].checked;
        document.getElementById('optionPanelSCI_'+IDnumber+'_sc').value    = dataTrailer[dix].xps.cut;
        document.getElementById('optionPanelSCI_'+IDnumber+'_time').value  = dataTrailer[dix].xps.getTC(dataTrailer[dix].xps.time());
    };
    if(optionTrailer){
        for(prp in optionTrailer){
            switch (prp){
                case "title":
    document.getElementById('optionPanelSCI_title').value    = String(optionTrailer[prp]);
                break;
                case "episode":
    document.getElementById('optionPanelSCI_opus').value    = String(optionTrailer[prp]);
                break;
                case "description":
    document.getElementById('optionPanelSCI_subtitle').value    = String(optionTrailer[prp]);
                break;
                case "cut":
     if(dataTrailer.length==1){
        document.getElementById('optionPanelSCI_01_sc').value    = String(optionTrailer[prp]);
    }
                break;
                case "time":
     if(dataTrailer.length==1){
        document.getElementById('optionPanelSCI_01_time').value    = String(optionTrailer[prp]);
        document.getElementById('optionPanelSCI_01_time').onchange();
    }
                break;
            }
        }
    }
    if(xUI.uiMode=='production'){
        var impt = (xUI.uiMode=='production')? true:false;
        document.getElementById('optionPanelSCI_title').disabled    = impt;
        document.getElementById('optionPanelSCI_opus').disabled     = impt;
        document.getElementById('optionPanelSCI_subtitle').disabled = impt;
        document.getElementById('optionPanelSCI_01_sc').disabled    = impt;
        document.getElementById('optionPanelSCI_01_time').disabled  = impt;
    }
    document.getElementById('resetSCiTarget').disabled = true ;
    return true;
}
/**
    xUI.importBox.checkValue(ctrlElement)
    ダイアログの変更状況をチェックしてUIの状態を更新する
     パラメータがひとつでも変更された場合はリセットボタンを有効に
    時間パラメータが変更された場合は、表記をTCに統一する
*/
xUI.importBox.checkValue = function(itm){
    var myProps=(String(itm.id).split('_')).reverse();
    switch(myProps[0]){
        case 'time':;
            itm.value = nas.clipTC(itm.value,Infinity,1,3);
        break;
        case 'imptCB':;
                document.getElementById('optionPanelSCI_'+myProps[1]+'_sc').disabled   = (! itm.checked);
                document.getElementById('optionPanelSCI_'+myProps[1]+'_time').disabled = (! itm.checked);
        break;
        case 'title':;
        case 'opus':;
        case 'subtitle':;
        case 'sc':;
        default:
    }
    document.getElementById('resetSCiTarget').disabled = false;
}
//そのほか
//    xUI.keyMethod        = KEYMethod;    //キー変換方式
//    xUI.aeVersion        = AEVersion;    //キーにつけるバージョン番号
/**     xUIオブジェクト初期化メソッド
 *      編集対象となるXpsオブジェクトを与えて初期化する。
 *      初期化時点の参照変数はconfig.js内で設定された値及び
 *      nas_common.jsで処理されたオブジェクト
 *      この手順は、読込の都度実行するのは重すぎるので
 *      アプリケーション初期化時に1回だけ実行するように変更される
 */
/**
      新規に動作モードxUI.uiModeを実装 2016 12
      モードは以下四態
    production  常に writeable 管理情報をユーザ編集することは無い
    management  ドキュメントに対してはreadonly 管理情報に対して writeable
    browsing    常に readonly
    floating    常に writeable 管理情報を編集可能　ただし作業セッション外になる

        各モード内で作業条件によって readonlyの状態が発生する
        セッション溯及ステータスを実装　2017 01

    sessionRetrace
        制作管理上の作業セッションはジョブに　１：１で対応する
        整数値で作業の状態を表す データを読み取った際にセットされる
        その都度のドキュメントの保存状態から計算される値なのでデータ内での保存はされない
    -1  所属セッションなし(初期値)　全てwriteable
    0   最新セッション 編集対象 wtiteable
    1~  数値分だけ遡ったセッション 編集対象外 常にreadonly

        ステータスがFloationgモードのドキュメントをサーバ(リポジトリ)に記録することはない
        要注意　ドキュメントステータスと動作モードの混同は避けること
*/
xUI.init    =function(editXps,referenceXps){
    this.XPS=editXps;                           //XPSを参照するオブジェクト必須引数
    this.sessionRetrace = -1;                   //管理上の作業セッション状態
    this.referenceXPS=new Xps(5,144);           //参照用Xps初期値
/**
引数に参照オブジェクトが渡されていたら、優先して解決
    マルチステージ拡張実装後、直接指定された参照ステージは、初期化時のみ優先 
    参照用XPSは初期化の引数で与える（優先）
    初期化時点で参照Xpsが与えられなかった場合は、XPSに含まれる参照ステージの内容、XPS内のステージストアにある現行ステージの前段のステージを利用する セットアップのタイミングはUIの初期化以降に保留される
*/
    if ((typeof referenceXps != "undefined") && (referenceXps instanceof Xps)){
        this.referenceXPS=referenceXps;
    };
/**
    参照Xpsのうち表示させる種別をプロパティ名の配列で与える　
    キーワード機能未実装:
        "all"=["replacement","timing","camerawork","effect","still","dialog","sound"],
        "cell(スチル含む)"=["timing","still"]
        "replacement",
        "timing",
        "camerawork",
        "effect",
        "still",
        "dialog",
        "sound"
 */
    this.referenceLabels=new Array();   //表示させる数（後で初期化）
    this.referenceView=["timing","cell","replacement"];      
    this.refRegex=new RegExp(xUI.referenceView.join("|"));
/** 
    以下UI動作制御変数
    viewMode    ページ単位表示か又は全体を1ページ1カラムで表示させるかのフラグ
    uiMode      編集/管理/閲覧モードのフラグ
        browsing
            サーバ上のデータを開いて内容をブラウズしている状態
            書込／変更は禁止
        production
            作業中　他ユーザはproductionに移行できない
        management
            管理中　カットのプロパティが変更できるが、内容は編集できない
    viewOnly    編集禁止（データのreadonlyではなくUI上の編集ブロック）
*/
    this.viewMode    = ViewMode;        // 表示モード Compact/WordProp
    this.uiMode      ='floating';      // ui基本動作モード production/management/browsing/floating 
    this.viewOnly    = false;            // 編集禁止フラグ
    this.hideSource  = false;           // グラフィック置き換え時にシートテキストを隠す
    this.showGraphic = true;            // 置き換えグラフィックを非表示　＝　テキスト表示
//if(appHost.platform=="AIR") this.showGraphic    = false;
    this.onSite   = false;           // Railsサーバ上での動作時サーバのurlが値となる
    this.currentUser = new  nas.UserInfo(myName); // 実行ユーザをmyNameから作成
    this.recentUsers = new nas.UserInfoCollection(myNames);//最近のユーザ情報
    sync("recentUsers");
/*
    recentUsers 配列の要素は、UserInfo オブジェクト
    myNamesは、アカウント文字列を要素とする配列
*/
    this.spinValue   = SpinValue;       // スピン量
    this.spinSelect  = SpinSelect;      // 選択範囲でスピン指定
    this.sLoop       = SLoop;           // スピンループ
    this.cLoop       = CLoop;           // カーソルループ
//    this.utilBar     = true;            // サブツールバーの初期状態
    this.SheetLength    = SheetLength;  // タイムシート1枚の表示上の秒数 コンパクトモードではシート長が収まる秒数に強制される
//コンパクトモード時はこのプロパティとcolsの値を無視するように変更
    this.SheetWidth= this.XPS.xpsTracks.length; // シートの幅(編集範囲)

//シートのルックを求めるためのプロパティ
    this.dialogCount    = 1;    // 音声トラックの総数
    this.stillCount     = 0;    // 静止画トラックの総数
    this.timingCount    = 4;    // 置換トラックの総数
    this.sfxCount       = 0;    // 効果トラックの総数
    this.cameraCount    = 0;    // カメラトラックの総数
    this.dialogSpan     = 1;    // シート左にある音声トラックの連続数
    this.cameraSpan     = 0;    // シート右の非置き換えトラックの連続数
    this.timingSpan     = this.XPS.xpsTracks.length-(this.cameraSpan+this.dialogSpan+1);//カメラ（非画像トラックの合計）
    this.SheetWidth     = this.XPS.xpsTracks.length;
    this._checkProp();


    this.PageLength         =this.SheetLength*Math.ceil(this.XPS.framerate);  //1ページの表示コマ数を出す
//    1秒のコマ数はドロップを考慮して切り上げ
    this.cPageLength        =Math.ceil(this.XPS.framerate);                  //カラム長だったけど一秒に変更
    this.sheetSubSeparator  =SheetSubSeparator;                         // サブセパレータの間隔
    this.PageCols           =SheetPageCols;                             // シートのカラム段数。
                //    実際問題としては１または２以外は使いづらくてダメ
                //    コンパクトモードでは1段に強制するのでこの値を無視する
    this.fct0               =Counter0;                                  // カウンタのタイプ
    this.fct1               =Counter1;                                  // 二号カウンタはコンパクトモードでは非表示

    this.favoriteWords      =FavoriteWords;                             // お気に入り単語
    this.footMark           =FootMark;                                  // フットマーク機能フラグ
    this.autoScroll         =AutoScroll;                                // 自動スクロールフラグ
    this.scrollStop         =false;                                     // 自動スクロール抑制フラグ
    this.tabSpin            =TabSpin;                                   // TABキーで確定操作

    this.noSync             =NoSync;                                    // 入力同期停止

    this.blmtd              =BlankMethod;                               // カラセル方式デフォルト値
                //["file","opacity","wipe","expression1","expression2"];
    this.blpos              =BlankPosition;                             // カラセル位置デフォルト値
                //["build","first","end","none"]
    this.fpsF               =FootageFramerate;                          // フッテージのフレームレート
                //コンポサイズdefeult
    this.dfX                =defaultSIZE.split(",")[0];                 // コンポサイズが指定されない場合の標準値
    this.dfY                =defaultSIZE.split(",")[1];                 //
    this.dfA                =defaultSIZE.split(",")[2];                 //
    this.timeShift          =TimeShift;                                 // 読み込みタイムシフト

//yank関連
    this.yankBuf            ={body:"",direction:""};                    // ヤンクバッファは、comma、改行区切りのデータストリームで
    this.yankBuf.valueOf=function(){return this.body;}
//undo関連
    this.flushUndoBuf();
//保存ポインタ関連

//ラピッド入力モード関連
    this.eXMode =0;         //ラピッドモード変数(0/1/2/3)
    this.eXCode =0;         //ラピッドモード導入キー変数
//シート入力関連
    this.eddt   ="";        //編集バッファ
    this.edchg  =false;     //編集フラグ
    this.edmode=0;          //編集操作モード　0:通常入力　1:ブロック移動　2:区間編集
    this.floatSourceAddress = [0,0];//選択範囲及び区間移動元アドレス
    this.floatDestAddress   = [0,0];//同移動先アドレス
    this.selectBackup       ;//カーソル位置バックアップ
    this.selectionBackup    ;//選択範囲バックアップ
//    this.spinBackup         ;//スピン量をバックアップ
//区間編集バッファ
    this.floatTrack         ;//区間編集対象トラック
    this.floatSectionId     ;//編集対象セクションのID（オブジェクトそのものだと変動するのでIDのみ）
    this.floatTrackBackup   ;//区間編集トラックバックアップ（加工参照用）
    this.floatSection       ;//編集ターゲット区間
    this.floatUpdateCount   ;//フロート編集中の更新カウント
//セクション操作変数
    this.sectionManipulateOffset = ['tail',0];//区間編集ハンドルオフセット
    
//    アクセス頻度の高いDOMオブジェクトの参照保持用プロパティ
    this["data_well"]       = document.getElementById("data_well");//データウェル
    this["snd_body"]        = document.getElementById("snd_body");//音声編集バッファ


///////////
//データ配列に対してUIオブジェクトにフォーカス関連プロパティ設置

                //[カラム,フレーム]
                //初期値は非選択状態
    this.Select    =[1, 0];
                //シート上のフォーカスセル位置
                //選択位置・常にいずれかをセレクト
    this.Selection    =[0, 0];
                //選択範囲・ベクトル正方向=右・下
};

//    xUIオブジェクト初期化終了 以下メソッド
//
/* ============================================================================ */
/**
    現在編集対象のXPS・referenceXPSをチェックしてxUIのシートビュープロパティを更新
    どちらか単独更新の場合でも画面全体を再描画する必要があるので、このルーチンは等しく実行される
*/
xUI._checkProp=function(){
    this.dialogCount=0;this.stillCount=0;this.timingCount=0;this.sfxCount=0;this.cameraCount=0;
    this.dialogSpan=0;this.cameraSpan=0;
    for(var idx=0;idx<(this.XPS.xpsTracks.length-1);idx++){
        this.XPS.xpsTracks[idx].sectionTrust=false;
        switch(this.XPS.xpsTracks[idx].option){
            case "comment": break;//末尾はコメント予約なので判定をスキップ
            case "sound" : ;
            case "dialog": this.dialogCount++;break;
            case "still" : this.stillCount++ ;break;
            case "effect": ;
            case "sfx"   : this.sfxCount++   ;break;
            case "camerawork":;
            case "camera": this.cameraCount++;break;
            case "cell": ;
            case "replacement": ;
            case "timing": this.timingCount++;break;
            default:       ;// NOP
        };
//表示域左側で連続した音声トラックの数を控える（最初に出てきたsound/dialog以外のトラックの位置で判定 ）
        if((this.XPS.xpsTracks[idx].option!="dialog")&&(! this.dialogSpan)){this.dialogSpan=this.dialogCount};
//フレームコメントの左側の連続したcamera/sfxトラックの数を控える(最後のcamera/sfx/effect以外のトラックの位置から計算)
        if((this.XPS.xpsTracks[idx].option != "camera")&&(this.XPS.xpsTracks[idx].option!="sfx")&&(this.XPS.xpsTracks[idx].option!="effect")){this.cameraSpan=this.XPS.xpsTracks.length-idx-2};
//カウントする、ただしこのルーチンはこの後プロパティに変換してレイヤ数が変わるたびにプロパティとして変更するように変更されるべき。
    }
//
    this.timingSpan=this.XPS.xpsTracks.length-(this.cameraSpan+this.dialogSpan+1);//カメラ（非画像トラックの合計）
    this.SheetWidth=this.XPS.xpsTracks.length;
/*
参照するトラック数をスイッチをもとに算出
*/
    this.referenceLabels=new Array();//クリア
    this.refRegex=new RegExp(xUI.referenceView.join("|"));//更新
    for(var ix=0;ix<xUI.referenceXPS.xpsTracks.length;ix++){
        var currentTrack=xUI.referenceXPS.xpsTracks[ix].option;
        var currentLabel=xUI.referenceXPS.xpsTracks[ix].id;
        if(currentLabel.length>2) currentLabel=currentLabel.slice(0,2);
        if(currentTrack.match(this.refRegex)) {
            this.referenceLabels.push(currentLabel)
        }
    }
}
/**
    setBackgroundColor(bgColor)
    背景色を色コードで指定する
*/
xUI.setBackgroundColor = function(bgColor){
SheetLooks = {
    SheetTextColor  :"#111111",
	SheetBaseColor	:"#ddeedd",
	SelectedColor	:"#9999FF",
	RapidModeColor	:"#ffff44",
	FloatModeColor	:"#88eeee",
	SectionModeColor:"#ff44ff",
	SelectionColor	:"#f8f8dd",
	FootStampColor	:"#ffffff",
	EditingColor	:"#eebbbb",
	SelectingColor	:"#ccccaa",
	CellWidthUnit	:"px",
	TimeGuideWidth	    :36,
	ActionWidth         :20,
	DialogWidth	        :36,
	SheetCellWidth	    :42,
	SheetCellNarrow	    :4,
	StillCellWidth	    :12,
	SfxCellWidth	    :46,
	CameraCellWidth     :52,
	CommentWidth        :120,
	ColumnSeparatorWidth:4
};
SheetLooks.SheetBaseColor=bgColor;
xUI.setSheetLook(SheetLooks);xUI.footstampPaint();

}
/**
    インターフェースルック設定
    カラー・及びシートルックを更新
    分離のみ　暗色のテーマにはまだ対応していないので注意　2017.02.04
    ラップ関数を作成した方が良いかも
*/
xUI.setSheetLook = function(sheetLooks){
    this.sheetLooks=sheetLooks;
/**
    シートのカラーデータを構築
    別の関数に分離予定
        指定引数は　SheetBaseColorのみ？
*/
    if (! String(sheetLooks.SheetBaseColor).match(/^#[0-9a-f]+/i)){sheetLooks.SheetBaseColor = nas.colorAry2Str(nas.colorStr2Ary(sheetLooks.SheetBaseColor));};

//編集不可領域の背景色 背景色を自動設定　やや暗　これは初期状態で対向色を設定してその間で計算を行うように変更

    this.sheetbaseColor     = sheetLooks.SheetBaseColor;                                        //タイムシート背景色
    var baseColor = nas.colorStr2Ary(this.sheetbaseColor);  //基本色をRBGのまま配列化
//    輝度出してフラグ立てる
    this.sheetbaseDark      = (((76*baseColor[0]+150*baseColor[0]+29*baseColor[0])/255) > 0.3)? false:true;//仮のしきい値0.5

    this.sheetTextColor     = sheetLooks.SheetTextColor;//基本テキストカラー
    this.annotationColor    = nas.colorAry2Str(div(add (nas.colorStr2Ary(this.sheetTextColor),nas.colorStr2Ary(this.sheetbaseColor)),2));
    
    this.sheetblankColor    = nas.colorAry2Str(mul(nas.colorStr2Ary(this.sheetbaseColor),.95)); //編集不可領域の背景色
    this.sheetborderColor   = nas.colorAry2Str(mul(nas.colorStr2Ary(this.sheetbaseColor),.75)); //罫線基本色
    this.footstampColor     = nas.colorAry2Str(div( add (nas.colorStr2Ary(sheetLooks.FootStampColor),nas.colorStr2Ary(this.sheetbaseColor)),2));                        //フット/差分　スタンプの色 背景色との中間値
//    this.footstampColor     = sheetLooks.FootStampColor;                                        //フット/差分　スタンプの色 背景色との中間値
//       this.inputModeColor   = new Object();                                      //  入力モード色
        this.inputModeColor.NORMAL  = nas.colorAry2Str(div( add (nas.colorStr2Ary(sheetLooks.SelectedColor),nas.colorStr2Ary(this.sheetbaseColor)),2));                      //  ノーマル色
        this.inputModeColor.EXTEND  = nas.colorAry2Str(div( add (nas.colorStr2Ary(sheetLooks.RapidModeColor),nas.colorStr2Ary(this.sheetbaseColor)),2));                    //  ラピッド入力基本色
        this.inputModeColor.FLOAT   = nas.colorAry2Str(div( add (nas.colorStr2Ary(sheetLooks.FloatModeColor),nas.colorStr2Ary(this.sheetbaseColor)),2));                    //  ブロック移動基本色
        this.inputModeColor.SECTION = nas.colorAry2Str(mul( add (nas.colorStr2Ary(sheetLooks.SectionModeColor),nas.colorStr2Ary(this.sheetbaseColor)),.5));                  //  範囲編集中の色
        this.inputModeColor.SECTIONtail = nas.colorAry2Str(mul( add (nas.colorStr2Ary(sheetLooks.SectionModeColor),nas.colorStr2Ary(this.sheetbaseColor)),.45));                  //  範囲編集中の色
//        this.inputModeColor.SECTIONselection = nas.colorAry2Str( mul( add (nas.colorStr2Ary(sheetLooks.SectionModeColor),nas.colorStr2Ary(this.sheetbaseColor)),1));                  //  範囲編集中の色

    this.selectedColor    = this.inputModeColor.NORMAL;                                     //選択セルの背景色
    this.selectionColor    = sheetLooks.SelectionColor;                                     //選択領域の背景色
    this.selectionColorTail    = sheetLooks.SelectionColor;                                     //選択領域末尾背景色(sectionTail)デフォルトは同色
    this.editingColor       = sheetLooks.EditingColor;                                      //セル編集中のインジケータ
    this.selectingColor      = sheetLooks.SelectingColor;                                   //セル選択中のインジケータ
//タイムライン・ラベル識別カラ－
    this.cameraColor    = nas.colorAry2Str(div(add([0,1,0],mul(nas.colorStr2Ary(this.sheetbaseColor),6)),7));
    this.sfxColor       = nas.colorAry2Str(div(add([0,0,1],mul(nas.colorStr2Ary(this.sheetbaseColor),5)),6));
    this.stillColor     = nas.colorAry2Str(div(add([1,0,0],mul(nas.colorStr2Ary(this.sheetbaseColor),6)),7));　//タイムライン全体に着色

//中間色自動計算
        this.inputModeColor.NORMALspin=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.NORMAL),mul(nas.colorStr2Ary(this.sheetbaseColor),3)),4));
        this.inputModeColor.EXTENDspin=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.EXTEND),mul(nas.colorStr2Ary(this.sheetbaseColor),3)),4));
        this.inputModeColor.FLOATspin=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.FLOAT),mul(nas.colorStr2Ary(this.sheetbaseColor),3)),4));
        this.inputModeColor.SECTIONspin=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.SECTION),mul(nas.colorStr2Ary(this.sheetbaseColor),3)),4));
//スピン選択状態
        this.inputModeColor.NORMALspinselected=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.NORMAL),mul(nas.colorStr2Ary(this.selectionColor),8)),10));
        this.inputModeColor.EXTENDspinselected=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.EXTEND),mul(nas.colorStr2Ary(this.selectionColor),8)),10));
        this.inputModeColor.FLOATspinselected=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.FLOAT),mul(nas.colorStr2Ary(this.selectionColor),8)),10));
        this.inputModeColor.SECTIONspinselected=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.SECTION),mul(nas.colorStr2Ary(this.selectionColor),8)),10));
//選択状態
        this.inputModeColor.NORMALselection=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.NORMAL),mul(nas.colorStr2Ary(this.selectionColor),5)),6));
        this.inputModeColor.EXTENDselection=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.EXTEND),mul(nas.colorStr2Ary(this.selectionColor),5)),6));
        this.inputModeColor.FLOATselection=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.FLOAT),mul(nas.colorStr2Ary(this.sheetbaseColor),5)),6));
        this.inputModeColor.SECTIONselection=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.SECTION),mul(nas.colorStr2Ary(this.sheetbaseColor),5)),6));
//編集中
        this.inputModeColor.NORMALeddt=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.NORMAL),mul([1,1,1],8)),9));
        this.inputModeColor.EXTENDeddt=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.EXTEND),mul([1,1,1],8)),9));
        this.inputModeColor.FLOATeddt=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.FLOAT),mul([1,1,1],8)),9));
        this.inputModeColor.SECTIONeddt=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.SECTION),mul([1,1,1],8)),9));

//フロートテキスト色
    this.floatTextColor =
    nas.colorAry2Str(div(add([0,0,0],mul(nas.colorStr2Ary(this.sheetbaseColor),3)),4));


//----------------------------------------------------------------------初期状態設定
    this.spinAreaColor          = this.inputModeColor.NORMALspin;
    this.spinAreaColorSelect    = this.inputModeColor.NORMALselection;
    this.sectionBodyColor       = nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.SECTION),mul(nas.colorStr2Ary(this.sheetbaseColor),3)),4));//?使わんかも
// ---------------------- ここまでカラー設定(再計算)
if(this.sheetbaseDark){
    this.sheetTextColor     = nas.colorAry2Str( div(sub([1,1,1],nas.colorStr2Ary(this.sheetTextColor)),2));
    this.annotationColor    = nas.colorAry2Str( div(sub([1,1,1],nas.colorStr2Ary(this.annotationColor)),2));

    this.sheetblankColor    = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.sheetblankColor)));
    this.sheetborderColor   = nas.colorAry2Str(div(sub([1,1,1],nas.colorStr2Ary(xUI.sheetborderColor)),2));
//    this.footstampColor     = nas.colorAry2Str(div(nas.colorStr2Ary(this.footstampColor),2));
    this.footstampColor     = nas.colorAry2Str(div(add (sub([1,1,1],nas.colorStr2Ary(sheetLooks.FootStampColor)),nas.colorStr2Ary(this.sheetbaseColor)),2));
        this.inputModeColor.NORMAL  = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.NORMAL)));
        this.inputModeColor.EXTEND  = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.EXTEND)));
        this.inputModeColor.FLOAT   = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.FLOAT)));
        this.inputModeColor.SECTION = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.SECTION)));
        this.inputModeColor.SECTIONtail = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.SECTIONtail)));

    this.selectedColor    = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.selectedColor)));
    this.selectionColor   = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.selectionColor)));
    this.selectionColorTail   = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.selectionColorTail)));
    this.editingColor      = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.editingColor)));
    this.selectingColor     = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.selectingColor)));
//タイムライン・ラベル識別カラ－
    this.cameraColor    = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.cameraColor)));
    this.sfxColor       = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.sfxColor)));
    this.stillColor     = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.stillColor)));

//中間色自動計算
        this.inputModeColor.NORMALspin　= nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.NORMALspin)));
        this.inputModeColor.EXTENDspin = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.EXTENDspin)));
        this.inputModeColor.FLOATspin = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.FLOATspin)));
        this.inputModeColor.SECTIONspin = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.SECTIONspin)));
//スピン選択状態
        this.inputModeColor.NORMALspinselected = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.NORMALspinselected)));
        this.inputModeColor.EXTENDspinselected = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.EXTENDspinselected)));
        this.inputModeColor.FLOATspinselected = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.FLOATspinselected)));
        this.inputModeColor.SECTIONspinselected = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.SECTIONspinselected)));
//選択状態
        this.inputModeColor.NORMALselection = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.NORMALselection)));
        this.inputModeColor.EXTENDselection = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.EXTENDselection)));
        this.inputModeColor.FLOATselection = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.FLOATselection)));
        this.inputModeColor.SECTIONselection = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.SECTIONselection)));
//編集中
        this.inputModeColor.NORMALeddt = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.NORMALeddt)));
        this.inputModeColor.EXTENDeddt = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.EXTENDeddt)));
        this.inputModeColor.FLOATeddt = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.FLOATeddt)));
        this.inputModeColor.SECTIONeddt = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.inputModeColor.SECTIONeddt)));

//フロートテキスト色
    this.floatTextColor = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.floatTextColor)));


//----------------------------------------------------------------------初期状態設定
    this.spinAreaColor          = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.spinAreaColor)));
    this.spinAreaColorSelect    = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.spinAreaColorSelect)));
    this.sectionBodyColor       = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(this.sectionBodyColor)));
}
//================================================================================================================================ルックの適用
//タイムシート背景色をsheetbaseColorに設定
    document.body.style.backgroundColor     = this.sheetbaseColor;
    document.body.style.color               = this.sheetTextColor;
// サブテキストカラーを設定
    nas.addCssRule("th.annotationText","color:"+this.annotationColor,"screen");
    nas.addCssRule('td.Sep','color:'+this.annotationColor,"screen");
    nas.addCssRule('td.ref','color:'+this.annotationColor,"screen");
    
//ヘッダとフッタの背景色をシート背景色で塗りつぶし
    document.getElementById("fixedHeader").style.backgroundColor = this.sheetbaseColor;

    nas.addCssRule("table.sheet","background-color:"+this.sheetbaseColor,"screen");
    nas.addCssRule("table","border-color:"+this.sheetbaseColor,"screen");
    nas.addCssRule("th","border-color:"+this.sheetborderColor,"screen");
    nas.addCssRule("td","border-color:"+this.sheetborderColor,"screen");

var mySections=[
    ["th.tcSpan"        ,"width" ,(sheetLooks.TimeGuideWidth        + sheetLooks.CellWidthUnit)],
    ["th.dialogSpan"    ,"width" ,(sheetLooks.DialogWidth           + sheetLooks.CellWidthUnit)],
    ["td.colSep"        ,"width" ,(sheetLooks.ColumnSeparatorWidth  + sheetLooks.CellWidthUnit)],
    ["th.referenceSpan" ,"width" ,(sheetLooks.ActionWidth           + sheetLooks.CellWidthUnit)],
    ["th.editSpan"      ,"width" ,(sheetLooks.SheetCellWidth        + sheetLooks.CellWidthUnit)],
    ["th.timingSpan"    ,"width" ,(sheetLooks.SheetCellWidth        + sheetLooks.CellWidthUnit)],
    ["th.stillSpan"     ,"width" ,(sheetLooks.StillCellWidth        + sheetLooks.CellWidthUnit)],
    ["th.sfxSpan"       ,"width" ,(sheetLooks.SfxCellWidth          + sheetLooks.CellWidthUnit)],
    ["th.cameraSpan"    ,"width" ,(sheetLooks.CameraCellWidth       + sheetLooks.CellWidthUnit)]
]

/*    cssにルールセットを追加する関数
    nas.addCssRule( セレクタ, プロパティ, 適用範囲 )
        セレクタ    cssのセレクタを指定
        プロパティ    プロパティを置く
        適用範囲    "screen""print"または"both"
        
        注意してJqueryに置き換える
 */
//トラックの幅を設定
/*    リスト
class=timelabel annotationText
class=timeguide? 
class=dtSep
class=ntSep
class=colSep
class=layerlabelR annotationText
class=layerlabel annotationText
 */

for(var idx=0;idx<mySections.length;idx++){
    nas.addCssRule( mySections[idx][0],mySections[idx][1]+":"+mySections[idx][2],"both");
//    $(mySections[idx][0]).css(mySections[idx][1],mySections[idx][2])
};

//    シートブランクの色設定
var mySeps=[
    "ltSep","dtSep","ntSep","ntSep",
    "lsSep","dsSep","nsSep","nsSep",
    "lnSep","dnSep","nnSep","nnSep"
];

for(var idx=0;idx<mySeps.length;idx++){
    nas.addCssRule("."+mySeps[idx]+"_Blank","background-color:"+xUI.sheetblankColor)
};
//================================================================================================================================ シートカラーcss設定


//================================================================================================================================ シートカラーcss設定2
//    シート境界色設定
    $('table').css('border-color',xUI.sheetbaseColor);
    $('th').css('border-color',xUI.sheetborderColor);
    $('td').css('border-color',xUI.sheetborderColor);
    $("th.stilllabel").css("background-color",xUI.stillColor);// ,"screen");
    $("th.sfxlabel").css("background-color",xUI.sfxColor);//   ,"screen");
    $("th.cameralabel").css("background-color",xUI.cameraColor);//,"screen");

//================================================================================================================================ シートカラーcss設定2
//    if(this.footstampPaint) this.footstampPaint();
    return true;
}
//初期化の一環で一度実行？

// xUI.setSheetLook(SheetLooks);

/**
    xUI.setDocumentStatus(myCommnad)
    ドキュメントのステータスを変更する
    引数：キーワード　activate/deactivate/checkin/checkout/abort/reseipt //sink/float
    ステータス変更成功時は、モードにあわせてアプリケーションのモードを設定
    引数がカラの場合は、現在のステータスを返す
    非同期のサービスレスポンス待ちなのでコールバック渡し
    activate        from Fixed/Hold     to Active
    deactivate      from Active         to Hold
    checkin         from Startup/Fixed  to Active
    checkout        from Active         to Fixed
    abort           from Fixed          to Aborted
    reseipt         from Fixed          to Startup
    flaot                                copy to Floating
      if(unactive)  from Startup/Fixed/Hold     No Change
      if(active)    from Active                 to Hold
    sink            from Floating       copy to Startup/Fixed
*/
xUI.setDocumentStatus = function(myCommand){
    if (typeof myCommand == 'undefined') return this.XPS.currentStatus;
    switch (myCommand){
        case 'float':
        // float /現在のドキュメントを複製して自由編集状態にする　元ドキュメントはActive状態を解除する
            if(this.XPS.currentStatus.content.match(/^Active/i)){
                serviceAgent.currentRepository.deactivateEntry(function(){
                    xUI.setDocumentStatus('float');
                },function(result){console.log(result);});
            }else{
//                xUI.XPS.job=new Job;
                xUI.XPS.currentStatus= new JobStatus('Floating');
                xUI.setUImode('floating');
            }
        break;
        case 'sink':
        //sink /現在のドキュメントをリポジトリにプッシュする 成功時はドキュメントのステータスを更新
        //処理パスをこのルーチンにしないで別に仕立てる
/*
    カレントデータの判定等が複雑なので別の関数を作って使用する方針で
*/
            console.log('NOP');
        break;
        case 'activate':
        //activate / 再開する
            if((this.XPS.currentStatus.content.match(/^Fixed|^Hold/i))&&
            //activate
//            (this.XPS.update_user.split(':').reverse()[0] == document.getElementById('current_user_id').value)){}
            (this.XPS.update_user.email == document.getElementById('current_user_id').value)){
            //Fixed/Holdからアクティベートする場合は、ジョブID/名称の変更はなし
                serviceAgent.activateEntry(function(){
                    //成功時はドキュメントのステータスを更新してアプリモードをproductionへ変更
                    xUI.XPS.job=newJob;
                    xUI.XPS.currentStatus= new JobStatus('Active');
                    xUI.viewOnly=false;
                    xUI.setUImode('production');
                },function(result){if(dbg) console.log('fail checkin:');if(dbg) console.log(result);});
            }
        break;
        case 'deavtivate':
            //deactivate / 保留
            if(this.XPS.currentStatus.content.match(/^Active/i)){
                serviceAgent.currentRepository.deactivateEntry(function(){
                    //成功時はドキュメントのステータスを更新してアプリモードをproductへ変更
                    xUI.XPS.currentStatus=new JobStatus('Hold');
                    xUI.viewOnly=true;
                    xUI.setUImode('browsing');
                },function(result){if(dbg) console.log('fail checkin:');if(dbg) console.log(result);});
            }
        break;
        case 'checkin':
            //check-in / 開く
            if(this.XPS.currentStatus.content.match(/^Startup|^Fixed/i)){
            //現テータスがStartup/Fixedの場合新しいジョブの名称が必要　ジョブ名は第二引数で置く　ジョブIDは繰り上がる 
//                     　var newJobName = (arguments[1])? arguments[1]:xUI.XPS.update_user.split(':')[0];
                     　var newJobName = (arguments[1])? arguments[1]:xUI.XPS.update_user.handle;
                       var newJob = new XpsStage([parseInt(xUI.XPS.job.id)+1,newJobName].join(':'));
                serviceAgent.currentRepository.checkinEntry(newJob,function(){
                    //成功時はドキュメントのステータスを更新してアプリモードをproductへ変更
                    xUI.XPS.job=newJob;
                    xUI.XPS.currentStatus=new JobStatus('Active');
                    xUI.viewOnly=false;
                    xUI.setUImode('production');
                },function(result){if(dbg) console.log('fail checkin:');if(dbg) console.log(result);});
            }
        break;
        case 'checkout':
            //check-out / 閉じる
            if(this.XPS.currentStatus.content.match(/^Active/i)){
                serviceAgent.currentRepository.checkoutEntry(false,function(){
                    //成功時はドキュメントのステータスを更新してアプリモードをproductへ変更
                    xUI.XPS.currentStatus=new JobStatus('Fixed');
                    xUI.viewOnly=true;
                    xUI.setUImode('browsing');
                },function(result){if(dbg) console.log('fail checkout:');if(dbg) console.log(result);});
            }
        break;
        case 'reseipt':
            //receipt / 検収
            if(this.XPS.currentStatus.content.match(/^Fixed/i)){
                serviceAgent.currentRepository.checkoutEntry(Xps.getIdentifier(this.XPS),function(){
                    //成功時はドキュメントのステータスを更新してアプリモードをproductへ変更
                    xUI.XPS.currentStatus=new JobStatus('Hold');
                    xUI.viewOnly=true;
                    xUI.setUImode('browsing');
                    sync('productStatus');
                });
            }
        break;
    }    
}
    
/**
    xUI.setUImode(newMode)
    uiMode変更　引数がなければ変更なし
    引数がモードキーワード以外ならば、モードを順次切り替えて
    現在のモード値を返す
    current モード変更なし
    production  作業モード
    management  管理モード
    browsing    閲覧モード
    floating    フリー入力モード
*/
xUI.setUImode = function (myMode){
    if(typeof myMode == 'undefined') myMode='current';
            document.getElementById('pmcui-checkin').innerHTML=((xUI.XPS.currentStatus.content =='Hold')||(xUI.XPS.currentStatus.content =='Active'))?nas.localize(nas.uiMsg.pMinUse):nas.localize(nas.uiMsg.pMcheckin);//'作業中':'作業開始'//
    switch (myMode){
        case 'current':;//NOP return
            return xUI.uiMode;
            break;
        case 'production':;
            if(xUI.XPS.currentStatus.content != 'Active'){return xUI.uiMode;}
            　xUI.viewOnly = false;//メニュー切替
    $('#ddp-man').hide();
	$('#pmaui').hide();
	$('#pmfui').hide();
	$('span.subControl_TC').each(function(){$(this).hide()})
    $("li#auiMenu").each(function(){$(this).hide()});
    document.getElementById('cutList').multiple = false;

            //作業中のドキュメントステータスは、必ずActiveなので以下のボタン状態
            //Active以外の場合はこのモードに遷移しない
            document.getElementById('pmcui-checkin').disabled    =true;
            document.getElementById('pmcui-update').disabled     =true;//初期値 diabled
            document.getElementById('pmcui-checkout').disabled   =false;
            document.getElementById('pmcui-activate').disabled   =true;
            document.getElementById('pmcui-deactivate').disabled =false;
            //インジケータカラー変更
            $('#pmcui').css('background-color','#bbbbdd');
            $('#pmcui').css('color','#666688');
            break;
        case 'floating':;
        if(xUI.XPS.currentStatus.content.indexOf("Floating")<0){return xUI.uiMode;}
         //floating で必要なメニュー
         /*
         新規登録　カレントドキュメントを現在のリポジトリに登録する
         
         */
            　xUI.viewOnly = false;//メニュー切替
    $('#ddp-man').hide();
	$('#pmaui').hide();
	$('#pmfui').show();
	$('span.subControl_TC').each(function(){$(this).show()})
    $("li#auiMenu").each(function(){$(this).show()});
    document.getElementById('cutList').multiple = true;
            document.getElementById('pmcui-checkin').disabled    =true;//すべてのボタンを無効
            document.getElementById('pmcui-update').disabled     =true;
            document.getElementById('pmcui-checkout').disabled   =true;
            document.getElementById('pmcui-activate').disabled   =true;
            document.getElementById('pmcui-deactivate').disabled =true;
            //インジケータカラー変更
            $('#pmcui').css('background-color','#ddbbbb');
            $('#pmcui').css('color','#886666');
            break;
        case 'management':;
// マネジメントモードに入るには条件あり
// スタッフリストで制作管理者であるか、またはオーナーユーザであること
    if(false){ return xUI.uiMode;}
            //メニュー切替
            　xUI.viewOnly =  true;
    $('#ddp-man').show();
	$('#pmaui').show();
	$('#pmfui').hide();
	$('span.subControl_TC').each(function(){$(this).show()})
    $("li#auiMenu").each(function(){$(this).show()});
    document.getElementById('cutList').multiple = true;
            document.getElementById('pmcui-checkin').disabled    =true;//すべてのボタンを無効
            document.getElementById('pmcui-update').disabled     =true;
            document.getElementById('pmcui-checkout').disabled   =true;
            document.getElementById('pmcui-activate').disabled   =true;
            document.getElementById('pmcui-deactivate').disabled =true;
            //インジケータカラー変更
            $('#pmcui').css('background-color','#ddbbbb');
            $('#pmcui').css('color','#886666');
            break;
        case 'browsing':;
            //メニュー切替
            　xUI.viewOnly = true;
    $('#ddp-man').hide();
	$('#pmaui').hide();
	$('#pmfui').hide();
	$('span.subControl_TC').each(function(){$(this).hide()})
    $("li#auiMenu").each(function(){$(this).hide()});
    document.getElementById('cutList').multiple = false;
            document.getElementById('pmcui-checkin').disabled    = ((xUI.sessionRetrace==0)&&((xUI.XPS.currentStatus.content =='Startup')||(xUI.XPS.currentStatus.content =='Fixed')))? false:true;                
            document.getElementById('pmcui-update').disabled     =true;
            document.getElementById('pmcui-checkout').disabled   = true;
            if (xUI.currentUser.sameAs(xUI.XPS.update_user)) {
            //ドキュメントオーナー
            document.getElementById('pmcui-activate').disabled   = ((xUI.sessionRetrace==0)&&((xUI.XPS.currentStatus.content =='Hold')||(xUI.XPS.currentStatus.content =='Fixed')||(xUI.XPS.currentStatus.content =='Active')))? false:true;
            }else{
            //オーナー外
            document.getElementById('pmcui-activate').disabled   = (xUI.XPS.currentStatus.content =='Fixed')?false:true;
            }
            document.getElementById('pmcui-deactivate').disabled = true;


            //インジケータカラー変更
            $('#pmcui').css('background-color','#bbddbb');
            $('#pmcui').css('color','#668866');
            break;
        default:;
            var nextMode = ['production','browsing','floating','management'].indexOf(xUI.uiMode);
            switch(xUI.uiMode){
            case "management":
                nextMode = (xUI.XPS.currentStatus.content=='Floating')? 'floating':'browsing';
            break;
            case "floating":
                nextMode = (xUI.XPS.currentStatus.content=='Floating')? 'management':'browsing';
            break;
            case "browsing":
                nextMode = (xUI.XPS.currentStatus.content=='Floating')? 'floating':'management';
            break;
            case "production":
                nextMode = (xUI.XPS.currentStatus.content=='Floating')? 'floating':'browsing';
            break;
            }
                return this.setUImode(nextMode);
    }
//プルダウンメニューの表示をステータスに合わせる
            this.pMenu('pMcheckin'      ,(document.getElementById('pmcui-checkin').disabled)?'disable':'enable');
            this.pMenu('pMsave'         ,(document.getElementById('pmcui-update').disabled)?'disable':'enable');
            this.pMenu('pMcheckout'     ,(document.getElementById('pmcui-checkout').disabled)?'disable':'enable');
            this.pMenu('pMactivate'     ,(document.getElementById('pmcui-activate').disabled)?'disable':'enable');
            this.pMenu('pMdeactivate'   ,(document.getElementById('pmcui-deactivate').disabled)?'disable':'enable');

            this.pMenu('pMdiscard'      ,(xUI.XPS.currentStatus.content =='Active')?'enable':'disable');

            this.pMenu('pMreceipt'      ,(document.getElementById('pmaui-receipt').disabled)?'disable':'enable');
            this.pMenu('pMcheckoutF'    ,(document.getElementById('pmaui-checkout').disabled)?'disable':'enable');
            this.pMenu('pMabort'        ,(document.getElementById('pmaui-abort').disabled)?'disable':'enable');
            this.pMenu('pMbranch'       ,(document.getElementById('pmaui-branch').disabled)?'disable':'enable');
            this.pMenu('pMmerge'        ,(document.getElementById('pmaui-merge').disabled)?'disable':'enable');
//
    xUI.uiMode=myMode;
    xUI.setRetrace();
    sync('productStatus');
    
    return xUI.uiMode;
}

/*    xUI.edChg(status boolean)
    セル編集フラグ 切り替えと同時に表示を調整
*/
xUI.edChg=function(status,opt){
    if(this.viewOnly) return xUI.headerFlash('#bb8080');
    this.edchg=status;
    document.getElementById("edchg").style.backgroundColor=
    (this.edchg)?
    this.editingColor:"";//表示
};
//
/*xUI.mdChg(myModes,opt)
引数:
    myModes    モードを数値または文字列で指定　数値で格納
    opt    オプション引数
    編集モードを変更してカラーをアップデートする
    リフレッシュつき
*/
xUI.mdChg=function(myModes,opt){
            //編集操作モード　0:通常入力　1:ブロック移動　2:区間編集　3:領域フロート状態
    if(typeof myModes == "undefined") myModes="normal";
//モード遷移にあわせてUIカラーの変更
    switch(myModes){
    case "float":
    case "section-float":
    case 3:
//セクション編集時のフローティングモード
// emode==2以外ではこの状態に入れない
    if((this.edmode==2)&&(! this.viewOnly)){
       this.edmode=3;
       console.log(this.edmode);
      this.floatSourceAddress=this.Select.slice();    //移動ソースアドレスを退避
        this.selectedColor    =this.inputModeColor.FLOAT;    //選択セルの背景色
        this.spinAreaColor    =this.inputModeColor.FLOATspin;    //非選択スピン背景色
        this.spinAreaColorSelect    =this.inputModeColor.FLOATspinselected;    //選択スピン背景色
        this.selectionColor    =this.inputModeColor.FLOATselection;    //選択領域の背景色
        this.selectionColorTail    =this.inputModeColor.FLOAT;    //
    };
    break;
    case "section":
    case 2:
/*
 *  モード'normal'かつトラックのダブルクリックでセクション編集モードに入る　抜けるには明示的にmdChg('normal')をコールする必要がある
 *  現行でタイムライン種別トラップあり　ダイアログトラックのみ遷移可能
  さらにダイアログトラックでは値のない区間は選択を抑制中
*/
//sectionManipulateOffsetは、ここでは初期化されない
//if((this.XPS.xpsTracks[this.Select[0]].option.match(/dialog|effect|camera/))){}
if((this.XPS.xpsTracks[this.Select[0]].option=='dialog')){
  if(this.edmode<2){
//      if(this.spin() > 1){this.spinBackup=this.spin();this.spin(1);};//スピン量をバックアップしてクリア ? これ実はいらない？
      this.selectBackup       = this.Select.concat();//カーソル位置バックアップ
      this.selectionBackup    = this.Selection.concat();//選択範囲バックアップ
      this.floatSourceAddress = this.Select.concat();    //移動元ソースアドレスを退避
      
      this.floatTrack       = this.XPS.xpsTracks[this.Select[0]];//編集破棄の際に復帰するためモード変更時のトラック全体を記録
      this.floatTrackBackup = this.floatTrack.duplicate();      //編集確定時のためトラック全体をバッファにとる

      this.floatSection     = this.floatTrackBackup.getSectionByFrame(this.Select[1]);
      if((this.floatTrack.option=='dialog')&&(! this.floatSection.value)){
    //操作対象セクションを選択状態にする
      this.selectCell([
	    this.Select[0],
	    this.floatSection.startOffset()
      ]);
      this.selection([
	    this.Select[0],
	    this.floatSection.startOffset()+this.floatSection.duration-1
      ]);

        this.floatTrack         = null;
        this.floatTrackBackup   = null;
        this.floatSection       = null;
//        this.spin(this.spinBackup);
        return false;
      }
      this.floatSectionId   = this.floatSection.id();
      this.floatUpdateCount = 0;//フロート編集中の更新カウントをリセット

    //操作対象セクションを選択状態にする
      this.selectCell([
	    this.Select[0],
	    this.floatSection.startOffset()
      ]);
      this.selection([
	    this.Select[0],
	    this.floatSection.startOffset()+this.floatSection.duration-1
      ]);
  }
      this.edmode=2;
     
      //未確定編集はxUI.put でなくxUI.XPS.putで更新する。
      //範囲確定はここで行う？
        this.selectedColor    =this.inputModeColor.SECTION;        //選択セルの背景色
        this.spinAreaColor    =this.inputModeColor.SECTIONselection;    //非選択スピン背景色
        this.spinAreaColorSelect    =this.inputModeColor.SECTIONselection;    //選択スピン背景色
        this.selectionColor    =this.inputModeColor.SECTIONselection;    //選択領域の背景色
        this.selectionColorTail    = this.inputModeColor.SECTIONtail;    //選択領域の末尾
        this.Mouse.action=false;
}
    break;
    case "block":    //ブロックフロートモードに遷移
    case 1:        //前モードがノーマルだった場合のみ遷移可能
    if(this.edmode==0){
      this.edmode=1;
//      if(this.spin()){this.spinBackup=this.spin();this.spin(1);};//スピン量をバックアップしてクリア
        this.floatSourceAddress  = this.Select.concat();    //移動ソースアドレスを退避
        this.selectedColor       = this.inputModeColor.FLOAT;    //選択セルの背景色
        this.spinAreaColor       = this.inputModeColor.FLOATspin;    //非選択スピン背景色
        this.spinAreaColorSelect = this.inputModeColor.FLOATspinselected;    //選択スピン背景色
        this.selectionColor      = this.inputModeColor.FLOATselection;    //選択領域の背景色
        this.selectionColorTail  = this.inputModeColor.FLOATselection;    //選択領域の背景色
    }
    break;
    case "normal":    //ノーマルモードに復帰
    case 0:        //前モードに従って終了処理をここで行う
    default :    //
    if(this.edmode>=2){
        //区間編集モード確定または編集破棄処理
/*
console.log(this.floatSourceAddress);
console.log(this.floatDestAddress);
console.log(this.floatSectionId);
console.log(this.floatSection);
*/
    this.sectionManipulateOffset = ['tail',0];//区間編集ハンドルオフセット
        if(true){
        //  確定処理はリリース毎に実行される
        /*
        //現在のトラックのストリームを処理バッファにとる
        var currentStream = this.floatTrack.join();
        var backupStream  = this.floatTrackBackup.join();

    var currentFrame=xUI.Select[1];
    var currentSelection=xUI.Selection[1];
    xUI.selectCell([xUI.Select[0],0]);//トラック冒頭へ移動
    xUI.selection();
    xUI.put(trackContents);
    xUI.selectCell([xUI.Select[0],currentFrame]);
    xUI.selection([xUI.Select[0],currentFrame+currentSelection]);

        //一旦バックアップを書き戻して
        xUI.XPS.put([xUI.Select[0],0],backupStream);
//        xUI.syncSheetCell([xUI.Select[0],0],[xUI.Select[0],xUI.XPS.xpsTracks[0].duration]);
        //改めてundo付きで処理
        xUI.selectCell([xUI.Select[0],0]);
        xUI.put(currentStream);
console.log(currentStream);
        */
        this.floatTrack         = null;
        this.floatTrackBackup   = null;
        this.floatSection       = null;
        this.floatSectionId     = null;
        this.floatUpdateCount   = 0;
        //  編集破棄はカウントした変更回数分のundoで行う
        }
        this.edmode=0;
        this.selectedColor    =this.inputModeColor.NORMAL;        //選択セルの背景色
        this.spinAreaColor    =this.inputModeColor.NORMALspin;    //非選択スピン背景色
        this.spinAreaColorSelect=this.inputModeColor.NORMALspinselected;//選択スピン背景色
        this.selectionColor    =this.sheetLooks.SelectionColor;            //選択領域の背景色
        this.selectionColorTail    =this.sheetLooks.SelectionColor;            //選択領域の背景色

//        this.selectCell(this.floatSourceAddress);//ソース位置を復帰廃止
//        this.selection(add(this.floatSourceAddress,this.selectionBackup));//選択範囲の復帰廃止
//        this.spin(this.spinBackup);//スピン量をバックアップから復帰
    }else if(this.edmode==1){
        this.edmode=0;
        this.selectedColor    =this.inputModeColor.NORMAL;        //選択セルの背景色
        this.spinAreaColor    =this.inputModeColor.NORMALspin;    //非選択スピン背景色
        this.spinAreaColorSelect=this.inputModeColor.NORMALspinselected;//選択スピン背景色
        this.selectionColor    =this.sheetLooks.SelectionColor;            //選択領域の背景色
        this.selectionColorTail    =this.sheetLooks.SelectionColor;            //選択領域の背景色
//if(dbg) dpgPut("select:"+this.floatSourceAddress+"\nmove:"+sub(this.floatDestAddress,this.floatSourceAddress));

        this.selectCell(this.floatSourceAddress);//ソース位置復帰
        this.move(sub(this.floatDestAddress,this.floatSourceAddress),opt);//ムーブコマンド発行

//        this.spin(this.spinBackup);//スピン量をバックアップから復帰
    }
    }
    //var bkRange=this.Selection.slice();
    this.selection(add(this.Select,this.Selection));
    SoundEdit.init();
    return this.edmode;
}
/**
    移動先セルを指定して区間選択範囲を更新する
    セクションの内容を自動編集してUndoバッファを更新せずに画面を書き換える処理はここで行う
    ここでの選択範囲はすべて編集中の仮範囲
    確定後にバックアップの選択範囲と置き換えまたは編集破棄の際はバックアップに復帰
    自動編集は常にバックアップ内容をベースに行う
引数:
    destination 移動先フレーム
参照プロパティ:    
    xUI.sectionManipulateOffset は[編集サブモード,選択中のセル（ヘッド）に対するオフセット]　ターゲットから計算する
    
 */
xUI.sectionPreview=function(destination){
    if((xUI.edmode<2)||(xUI.viewOnly)) return xUI.headerFlash('#ff8080');
//    if((xUI.edmode<2)||(xUI.viewOnly)) return false;
    if(typeof destination == 'undefined')   destination = this.Select[1];
    var hotpoint    = xUI.Select[1]+xUI.sectionManipulateOffset[1];
 //   this.sectionManipulateOffset[1]=hotpoint-this.Select[1];//オフセットがでる
//    if(        Math.abs(xUI.sectionManipulateOffset[1]-((xUI.Selection[1]+xUI.Select[1])/2)) >        Math.abs(xUI.Selection[1]/2)    ) return 'overRange';//有効範囲外指定
    switch(xUI.sectionManipulateOffset[0]){
    case    0   :
    case 'head' :
//先頭指定　末尾固定で伸縮
        var tail=xUI.getid('Selection');
        xUI.selectCell([xUI.Select[0],destination-xUI.sectionManipulateOffset[1]]);
        xUI.selection(tail);
        break;
    case    1   :
    case 'body' :
//移動 
        xUI.selectCell([xUI.Select[0],destination-xUI.sectionManipulateOffset[1]]);
        break;
    case    2   :
    case 'tail' :
    default     :
//末尾指定　先頭固定で伸縮 sectionManipulateOffsetを更新
        var duration=xUI.Selection[1]+(destination-hotpoint);
        xUI.selection(add(xUI.Select,[0,duration]));
        xUI.sectionManipulateOffset[1]=xUI.Selection[1];
    }
    return true;
}

//test
//xUI.mdChg(2);
//xUI.sectionPreview(3,4);
// 
/*
引数：　action
    セクション操作の結果を実際の画面に反映させるメソッド
    Xps.manipulateSection()に対応するxUI側の処理
    データ配置の際にトラック全体を書き直すので、カーソル位置を復帰させるためにundoStackに第４要素を積む
    xUI.putメソッドを経由せずにこのルーチン内で完結させる.
*/
xUI.sectionUpdate=function(){
     if(this.viewOnly) return xUI.headerFlash('#ff8080');
    var trackContents = xUI.floatTrack.sections.manipulateSection(xUI.floatSectionId,xUI.Select[1],xUI.Selection[1]);
//undo   保留の場合は以下のルーチンを使用
/* undo保留ではなくユーザが各工程を辿れるように１操作毎に書換を行い、一括undoのために操作回数を記録する。*/
//    xUI.XPS.put([xUI.Select[0],0],trackContents[0]);
//    xUI.syncSheetCell([xUI.Select[0],0],[xUI.Select[0],xUI.XPS.xpsTracks[0].duration]);

    var currentFrame     = xUI.Select[1];
    var currentSelection = xUI.Selection[1];
    xUI.scrollStop = true;
      xUI.selectCell([xUI.Select[0],0]);
        xUI.selection();
          xUI.put(trackContents[0]);
//対象トラックのセクションが（ダイアログ等）すべての要素を内包しない場合セレクション位置を更新する必要がある
//セクションの先頭を取得するためにパースするか
        xUI.floatUpdateCount ++;//increment
        xUI.selectCell([xUI.Select[0],currentFrame+trackContents[1]]);
      xUI.selection([xUI.Select[0],xUI.Select[1]+currentSelection]);
    xUI.scrollStop = false;
    if(SoundEdit)SoundEdit.getProp();
}
/*    xUI.floatTextHi()
引数:なし　モード変数を確認して動作
モードチェンジの際に編集（保留）中のテキストを薄く表示する/もどす
*/
xUI.floatTextHi=function(){
    if(this.edmode>1) return false;
    var paintColor=(this.edmode==0)?"black":this.floatTextColor;
var range=[this.floatSourceAddress,add(this.floatSourceAddress,this.Selection)];
//    dbgPut("selectionHi :\n"+range.join("\n"));
//指定範囲をハイライト
    for (C=range[0][0];C<=range[1][0];C++){
        for (L=range[0][1];L<=range[1][1];L++){
            if((C<0) || (L<0)||(C>=this.XPS.xpsTracks.length)||(L>=this.XPS.xpsTracks[C].length)){
//    当座のバグ回避とデバッグ C.Lが操作範囲外だったときの処置 値を表示
//                dbgPut(range.toString());
            }else{
  if(document.getElementById(C+"_"+L).style.color!=paintColor) document.getElementById(C+"_"+L).style.color=paintColor;
//文字色変更
            };
        };
    };
}
/*
    現在のファイルからファイル名を作成
    マクロを付けたい
*/
xUI.getFileName=function(myFileName){
//    myResult=(typeof myFileName=="undefined")?"$TITLE$OPUSs$SCENEc$CUT($TC)":myFileName;
    myResult=(typeof myFileName=="undefined")?"$TITLE$OPUSc$CUT":myFileName;
    myResult=myResult.replace(/\$TITLE/g,this.XPS.title);
    myResult=myResult.replace(/\$SUBTITLE/g,this.XPS.subtitle);
    myResult=myResult.replace(/\$OPUS/g,this.XPS.opus);
    myResult=myResult.replace(/\$SCENE/g,this.XPS.scene);
    myResult=myResult.replace(/\$CUT/g,this.XPS.cut);
    myResult=myResult.replace(/\$TIME/g,this.XPS.time());
    myResult=myResult.replace(/\$TC/g,this.XPS.getTC(this.XPS.time()));
    myResult=myResult.replace(/[\s\.]/g,"");
    myResult=myResult.replace(/:;\/\\|\,\*\?"＜＞/g,"_");//"
    
    return myResult;
}
/*    シートボディフラッシュ
        xUI.flush(content)
        現在のシートの入力領域をすべてcontentで埋める
        戻り値は常にtrue
        これは試験用関数：実用性は無い　確かもう使ってない　20161106
*/
//
xUI.flush=function(content){
    if(! content){content=""};
//強制的にnullデータで全レイヤ・全フレームを書き換え
    var myDuration = this.XPS.duration();
//    タイムラインループ
    for (T=0;T< this.XPS.xpsTracks.length;T++){
        this.XPS.xpsTracks[T].sectionTrust=false;
        this.XPS.xpsTracks[T].length= 0;
        this.XPS.xpsTracks[T].length= myDuration;
//        フレームループ
        for(F=0;F < myDuration;F++){this.XPS.xpsTracks[T][F]=content;};
    };
    this.syncSheetCell();
    return true;
};

/*    undoバッファ初期化
        undoバッファをクリアして初期化
            undoStackのデータ構造
        [セレクト座標,セレクション,入力データストリーム,[セレクト座標,セレクション]]
    または    [セレクト座標,セレクション,Xpsオブジェクト]

    座標と選択範囲(セレクション)は配列、入力データはcomma,改行区切りの2次元のstream
    第４要素が存在する場合は、その位置にカーソル移動を行う
    第３要素がXpsオブジェクトであった場合は、ドキュメント全体の更新が行われた場合である
    その際は、処理系を切り替えて以下の操作を行う
    従来、UNDOバッファをフラッシュしていた操作が行われた場合
    現状のXPSデータを、オブジェクト化してUndoバッファに積みundoポインタを加算する。
    オブジェクト化の際は参照が発生しないように新規のXpsオブジェクトを作成のこと

    セッション内で明示的にundoバッファをクリアする際はこのメソッドをコールする

clear    :    セッション開始/ユーザ指定時
NOP    :    新規作成/保存/ダウンロード

    undoに画面描画保留機能を追加
    undoカウンタが立っている限り画面の再描画を行わない
 */
xUI.flushUndoBuf=function(){
    this.inputFlag="nomal";//入力フラグ["nomal","undo","redo"]
    this.undoStack=new Array();//アンドウスタック
        this.undoStack.push([[0,1],[0,0],'']);
    this.undoPt  =0 ;      //アンドウポインタ初期化
    this.skipCt  =0 ;      //再描画抑制カウンタ初期化
    this.storePt =0 ;     //保存ポインタ初期化
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

/*
    html5対応 localStorageに対して保存する。AIRはWebStorageが無い
    AIR他のlocalStorageのない環境に対して操作互換のlocalStorageオブジェクトを作成 2016.06.17
*/
    if(typeof localStorage=="undefined"){
//localStorageのないブラウザならサーバストア・CGIダウンロード　どちらもダメなら別ウインドウに書き出し
//CGIダウンロード時にはリスタートが実行されるのでその部分の排除コードが必要
//↑==callEcho時点で先行で保存フラグを立てれば自動的に回避可能
//AIRならsaveAs tempSave モーダル保存があった方がよいかも
if(fileBox.saveFile){fileBox.saveFile();}else{writeXPS(this.XPS);}

    }else{
        localStorage.setItem("info.nekomataya.remaping.backupData",this.XPS.toString());
        if(this.referenceXPS){
//            alert(this.referenceXPS.toString());
          localStorage.setItem("info.nekomataya.remaping.referenceData",this.referenceXPS.toString());
//            alert(this.referenceXPS.toString());
        }
        if(false){
            var msg = localize(nas.uiMsg.dmBackupDone);//バックアップ終了
            alert(msg);
            };//表示は設定で抑制可能にする
        xUI.setStored("current");sync();
    }
//==================================== ここまでをシステムバックアップメソッドに移行
};

xUI.getBackup =function(){
//
    var myBackup=localStorage.getItem("info.nekomataya.remaping.backupData");
    if(myBackup!==null){
      if(confirm(localize(nas.uiMsg.dmBackupConfirm))){
        document.getElementById("data_well").value=myBackup;
    var myReference=localStorage.getItem("info.nekomataya.remaping.referenceData");
        if(this.XPS.readIN(xUI.data_well.value)){
            if(myReference){xUI.referenceXPS.parseXps(myReference);}
            xUI.resetSheet(xUI.XPS,xUI.referenceXPS);
            //if(xUI.footMark){xUI.footstampPaint()};
            //xUI.footstampPaint();
        }
     }
    }else{
      alert(localize(nas.uiMsg.dmBackupNodata));//バックアップにデータなし
    }
}
xUI.clearBackup =function(){
    var myBackup=localStorage.removeItem("info.nekomataya.remaping.backupData");
    var myReference=localStorage.removeItem("info.nekomataya.remaping.backupReference");
    alert(localize(nas.uiMsg.dmBackupClear));//バックアップクリア
}
/*    未保存時の処理をまとめるメソッド
未保存か否かを判別してケースごとのメッセージを出す
ユーザ判断を促して処理続行か否かをリザルトする
*/
xUI.checkStored=function(mode){
if(!mode){mode=null;}
    if(xUI.isStored()){return (true)};//保存済みなら即 true
if(fileBox.saveFile){
var    msg = localize(nas.uiMsg.dmDocumentNosave);
//ドキュメントの保存・保存しないで更新・処理をキャンセルの３分岐に変更 2013.03.18
    msg+="\n"+localize(nas.uiMsg.documentConfirmOkCancel)+"\n";
//    nas.showModalDialog("confirm2",msg,"ドキュメント更新",0,
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
    var msg  = localize(nas.uiMsg.dmDocumentNosaveExport);//エクスポートしますか？
    　　msg += "\n"+localize(nas.uiMsg.dmDocumentConfirmOKCancel)+"\n";//
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

/*    画面サイズの変更時等にシートボディのスクロールスペーサーを調整する
    固定ヘッダとフッタの高さをスクロールスペーサーと一致させる
    2010.08.28
    引数なし
 */
xUI.adjustSpacer=function(){
// ////////////alert("start adjust : "+$("#app_status").offset().top +":"+document.getElementById("fixedHeader").clientHeight );
    var headHeight=(this.viewMode=="Compact")? $("#app_status").offset().top-$("#pMenu").offset().top:document.getElementById("fixedHeader").clientHeight;
 var myOffset=(this.viewMode=="Compact")? $("#app_status").offset().top-headHeight:0;
    document.getElementById("scrollSpaceHd").style.height=(headHeight-myOffset)+"px";

    document.getElementById("UIheaderScrollH").style.top=(headHeight+$("#app_status").height())+"px";
    document.getElementById("UIheaderFix").style.top=(headHeight+$("#app_status").height())+"px";
    document.getElementById("UIheaderScrollV").style.top=(headHeight+$("#app_status").height())+"px";
    document.getElementById("scrollSpaceFt").style.height="1 px";
}
/**    xUI.adjustScale=function(myScale);
引数:
    myScale    Number又は配列 数値一つの場合はY方向のスケールとして扱う
    引数なしはスケール[1,1]にリセットする
戻値:
    なし
ターゲットエレメントは以下
"UIheaderFix"
"UIheaderScrollH"
"UIheaderScrollV"
"sheet_body"
ドキュメント内に存在しないエレメントは無視（印字用）
スケーリングするターゲットを別に指定する場合は　idまたはid の配列で
*/
xUI.adjustScale=function(myScale,scaleTargetID){
    if(typeof myScale == "undefined"){myScale=[1,1]}
    else if(! (myScale instanceof Array)){myScale=[1,(myScale)?myScale:1]};
    var myId=(scaleTargetID)?scaleTargetID:
    ["UIheaderFix","UIheaderScrollH","UIheaderScrollV","sheet_body"];
    if(! (myId instanceof Array )) myID=[myID];
    for (var ix=0;ix<myId.length;ix++){
        scaleTarget=document.getElementById(myId[ix]);
        if(! scaleTarget) continue;
        if(appHost.platform.match(/CSX|CEP|AIR/)){
          scaleTarget.style.WebkitTransformOrigin="0px 0px";
          scaleTarget.style.WebkitTransform='scale('+myScale.join(",")+')';
        }else{
          scaleTarget.style.transformOrigin="0px 0px";
          scaleTarget.style.transform='scale('+myScale.join(",")+')';
        }
    }
}
//xUI.adjustScale(1,0.65);
xUI.zoomSwitch =function(){
    var scalePresets=[
        [1,1],
        [1,0.75],
        [0.75,0.66666],
        [0.5,0.5],
        [0.3333,0.3333],
        [0.25,0.25]
    ];
    this.zoomSwitch.currentPreset=(this.zoomSwitch.currentPreset+1)%scalePresets.length;
    this.adjustScale(scalePresets[this.zoomSwitch.currentPreset]);
}
xUI.zoomSwitch.currentPreset=0;
/*        xUI.reInitBody(newTimelines,newDuration);
引数:
    newTimelines    Number 新規トラック数
    newDuration    Number 新規継続時間　フレーム数
戻値:
    指定された大きさにシートを書き直す。
    元データは可能な限り維持

    undoの構造上サイズが変わると弊害が大きいので
    undoバッファは初期化する。undoを改装するまでは必須
    undoバッファ改変中　0923

    データ構造上Xpsのメソッドの方が良いので、
    データ改変部分をXPSlibに移動して
    ここではXPSのメソッドを呼び出す形式に変更　2013.02.23
    タイムシートの拡縮をundo対象に拡張    2015.09.14
    新規に現在のXPSの複製をとって、それを拡縮した後putメソッドに渡す
    putメソッド内部でUNDO処理を行う

xUI.putメソッドがobject Xpsに対応したのでこのメソッド自体が意味を失ったので使用されない
 このメソッドは基本廃止

 */
xUI.reInitBody=function(newTimelines,newDuration){
    var newXPS=new Xps(newTimelines,newDuration);
    newXPS.readIN(this.XPS.toString());//別オブジェクトとして複製を作る
    //変更してputメソッドに渡す
    newXPS.reInitBody(newTimelines,newDuration);
if(dbg) console.log(newXPS.toString());
    this.put(newXPS);
};

xUI.switchStage=function(){
    alert(localize(nas.uiMsg.dmUnimplemented));//未実装
};
/**
    リファレンスエリアにデータをセットする
    引数がない場合は、現在のXPSデータをそのままセットする
*/
xUI.setReferenceXPS=function(myXps){
    documentDepot.currentReference = new Xps();
    if(typeof myXps == 'undefined'){
        documentDepot.currentReference.readIN(xUI.XPS.toString());
    } else if (myXps instanceof Xps) {
        documentDepot.currentReference=myXps;
    } else {
        return false
    }
        xUI.resetSheet(undefined,documentDepot.currentReference);
        return true;
    }
//////
/**
        xUI.drawSheetCell(HTMLTableCellElement)
    テーブルセルを引数で与えてグラフィック置換及びテキスト置換を行う
    trTdから分離して機能調整
    判定されたグラフィック状態はクラスとしてセルに追加される
    描画は遅延処理
*/
xUI.drawSheetCell = function (myElement){
    if(typeof myElement =="undefined"){return false;}
    var target=myElement;
    var targetJQ=$("#"+target.id);
    var formPostfix='';

    if(this.showGraphic){
        var tgtID=target.id.split("_").reverse();
        var myXps=(tgtID.length==2)? this.XPS:this.referenceXPS;
        formPostfix += (tgtID.length==2)? '':'-ref';
        if (myXps.xpsTracks[tgtID[1]].option.match(/^(efect|sfx|composite)$/)) formPostfix +='-sfx';
        var myStr = myXps.xpsTracks[tgtID[1]][tgtID[0]];
        var drawForm = false;
        var sectionDraw = false;
        var mySection = myXps.xpsTracks[tgtID[1]].getSectionByFrame(tgtID[0]);

//シートセルに　graph_*クラスがあれば削除
        var myClasses=targetJQ.attr('class').split(' ');
        for (var cix=0;cix<myClasses.length;cix++){
            if(myClasses[cix].indexOf('graph_')==0) targetJQ.removeClass(myClasses[cix]);
        }
//セクションキャッシュが信頼できる限りはセクションパースが保留されるように調整済み
/**
    判定時にトラック種別を考慮する
    ダイアログ、サウンド
    リプレースメント
    カメラ
    エフェクト
    それぞれに置き換え対象シンボルが異なるので注意
*/
        var currentTrackOption  = myXps.xpsTracks[tgtID[1]].option;
        switch(currentTrackOption){
          case "sound":;
          case "dialog":;
            if (myStr.match(/<([^>]+)>/)){
                myStr=xUI.trTd(target.id.split('_'));
            };//trTdにセルIDを渡す
            if (myStr.match(/[-_─━~＿￣〜]{2,}?/)){
              myStr=(this.showGraphic)?"<br>":"<hr>";
              if((mySection.startOffset()+mySection.duration-1) == tgtID[0]){
                drawForm =(myStr.match(/[_＿]/))? "line":"sound-section-open";
              }else{
                drawForm =(myStr.match(/[_＿]/))? "line":"sound-section-close";
              }
            };//セクションパース情報を参照
	        myStr=myStr.replace(/[-−ー─━]/g,"｜");//音引き縦棒
	        myStr=myStr.replace(/[~〜]/g,"⌇");//音引き縦棒
	        myStr=myStr.replace(/[…]/g,"︙");//三点リーダー
	        myStr=myStr.replace(/[‥]/g,"︰");//二点リーダー
/* 台詞中の文字置換のうち音引き、句読点は画面置き換えで処理
    ListStr=ListStr.replace(/\」/g,"---");//閉じ括弧は横棒
	ListStr=ListStr.replace(/\、/g,"・");//読点中黒
	ListStr=ListStr.replace(/\。/g,"");//句点空白(null)
*/
          break;
          case "timing":;
          case "replacement":;
            if (myStr.match(/[\|｜]/)){
                myStr=(this.showGraphic)?"<br>":"｜";                
                drawForm = "line";
            }
            else if (myStr.match(/[:：]/)){
                myStr=(this.showGraphic)?"<br>":":";                
                drawForm = "wave";
                formPostfix += (tgtID[0] % 2)? '-odd':'-evn';
            }
            else if (myStr.match(/\(([^\)]+)\)/)){
                myStr=(this.showGraphic)?RegExp.$1:myStr;
                drawForm = "circle";
           }
           else if (myStr.match(/<([^>]+)>/)){
                myStr=(this.showGraphic)?RegExp.$1:myStr;
                drawForm = "triangle";
            }
          break;
          case "camera":;
          case "camerawork":;
          case "geometry":;
            if (myStr.match(/^[\|｜]$/)){
                myStr=(this.showGraphic)?"<br>":"｜";                
                drawForm = "line";
                formPostfix +='-cam';
            }
            else if (myStr.match(/^[▼▽]$/)){
                myStr=(this.showGraphic)?"<br>":myStr;                
                drawForm = "section-open";
           }
            else if (myStr.match(/^[▲△]$/)){
                myStr=(this.showGraphic)?"<br>":myStr;                
                drawForm = "section-close";
           }
          break;
          case "effect":;
          case "sfx":;
            var drawForms ={"▲":"fi","▼":"fo","]><[":"transition"};//この配分は仮ルーチン　良くない
//        myXps.xpsTracks[tgtID[1]].sections[] tgtID[0]
            if (myStr.match(/^[\|｜↑↓\*＊]$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^▼$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^▲$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^\]([^\]]+)\[$/)){
                if(this.hideSource) myStr="<br>";
            }
//        if(((mySection.startOffset()+mySection.duration-1) == tgtID[0])&&(mySection.subSections)){}
            if((mySection.startOffset()+mySection.duration-1) == tgtID[0]){
                var formStr = myXps.xpsTracks[tgtID[1]][mySection.startOffset()];
                drawForm = drawForms[formStr];
                sectionDraw = true;
            }
          break;
    }
//    if(dbg) console.log(target.id+":"+currentTrackOption+":"+myXps.xpsTracks[tgtID[1]][tgtID[0]]+":"+myStr);
//    target.innerHTML=myStr;
target.innerHTML=myStr;
if(this.showGraphic){    
    if((sectionDraw)&&(drawForm)){
        
//        if(console) if(dbg) console.log([tgtID[1],mySection.startOffset()].join("_")+":"+formStr+":"+drawForm+":"+mySection.duration);
//        setTimeout(function(){xUI.Cgl.sectionDraw([tgtID[1],mySection.startOffset()].join("_"),drawForm,mySection.duration);},0);
        xUI.Cgl.sectionDraw([tgtID[1],mySection.startOffset()].join("_"),drawForm,mySection.duration);
    }else{
        if(drawForm) targetJQ.addClass('graph_'+drawForm+formPostfix);
//        setTimeout(function(){xUI.Cgl.draw(target.id,drawForm+formPostfix)},0);
    }
}
    return myStr;
}
}
/**
    テーブル表示用文字列置換
        xUI.trTd(Str);
引数:テーブルセルID配列または単独文字列
    テーブルセルのID からターゲット求め
    タグ等htmlで表示不能な文字を置き換える
    戻り値は変換後の文字列
    画面（テーブル）表示のみに使用する
    ＝XPSのデータは保全される
    要素が配列でない場合は直接ターゲットにする
*/
xUI.trTd=function(myID){
if(typeof myID =="undefined"){return false;}
//if(typeof arguments[0] =="undefined"){return false;}
    if(! (myID instanceof Array)){
        var target = myID;
        //var target=arguments[0];
    }else{
        var target = (myID[0]=='r') ?
            xUI.referenceXPS.xpsTracks[myID[1]][myID[2]]:
            xUI.XPS.xpsTracks[myID[0]][myID[1]];
    }
if(false){
    var result=String(target).replace( />/ig, "&gt;").replace(/</ig,"&lt;");//<>
}else{
/** HTML表示用に実体参照に置換
*/
  var str = String(target);//明示的に文字列化
  var result = "";
  for(var i = 0 ; i < str.length ; i++) {
    c = str.charAt(i);
    if((' ' <= c && c <= '~') || (c == '\r') || (c == '\n')) {
      if(c == '&') {
        cstr = "&amp;";
      } else if(c == '<') {
        cstr = "&lt;";
      } else if(c == '>') {
        cstr = "&gt;";
      } else {
        cstr = c.toString();
      }
    } else {
      cstr = "&#" + c.charCodeAt().toString() + ";";
    }
      result += cstr;
  }
}
//    if(this.Select[0]>0 && this.Select[0]<(this.SheetWidth-1)) target=target.toString().replace(/[\|｜]/ig,'|<br>');
//    if(target.match(/^[:：]$/)) return ':<br>';//波線
//    if(target.match(/[-_─━~]{2,}?/)) return "<hr>";//
return result;

};
//
/*    XPSのプロパティの配列要素を"_"でつないで返す(シート上のidに対応)
        getId(要素名)
    現在は"Select"のみが有効値
    "Selection"ではIDを計算する
*/

xUI.getid=function(name){

    if ((this[name].length==0)||(this[name][0]==null))　return '';
  switch(name){
    case "Selection":
        return add(this.Select,this[name]).join("_");
    case "Select":
        return this[name].join("_");
  }
};
/*    指定のシートセルを選択状態にしてカレントのカーソル位置を返す
        xUI.selectCell(HTMLElementID)
        xUI.selectCell([myTrack,myFrame]);
引数が配列の場合も受け付ける
フレームオフセットが加算される
*/
xUI.selectCell=function(ID,frameOffset){
//    if (typeof ID == "undefined") ID = '';//
    if (typeof ID == "undefined") ID = this.selectBackup;//バックアップ位置と換装
    if (typeof frameOffset == "undefined") frameOffset = 0;
if(dbg) document.getElementById("app_status").innerHTML=ID;//デバッグ用
//      現在のセレクトをフォーカスアウト 引数が偽ならば フォーカスアウトのみ(ここでリターン)
    if(! ID){return;};
//      選択セルの内容をXPSの当該の値で置換 新アドレスにフォーカス処理開始 = IDをセレクト
//      指定IDが稼働範囲外だったら丸め込む
if(! (ID instanceof Array)) ID = ID.split('_') ;
    var tRack = Number(ID[0]);
    var fRame = Number(ID[1])+frameOffset;

    if (tRack<0 || tRack>=this.SheetWidth){    tRack=(tRack<0)?0:this.XPS.xpsTracks.length-1;};
    if (fRame<0 || fRame>=this.XPS.duration()) {    fRame=(fRame<0)?0:this.XPS.duration()-1;};
    ID=tRack+'_'+fRame;
//    JQオブジェクトを取得
    var currentJQItem=$("#"+ID);
//    セレクションクリア
        this.selectionHi("clear");
//    フットマーク機能がオンならば選択範囲とそしてホットポイントをフミツケ
    var myTgtId = this.getid('Select');
    if(this.footMark && this.diff(myTgtId)){
        paintColor=this.footstampColor;//                    == footmark ==
    }else{
        paintColor=this.sheetbaseColor;//                    == clear ==
    };
    if(document.getElementById(myTgtId))
    document.getElementById(myTgtId).style.backgroundColor=paintColor;

//フレームの移動があったらカウンタ更新フラグ立てる
        var fctrefresh = (fRame==this.Select[1])? false : true ;
//レイヤの移動があったらボタンラベル更新フラグ立てる
        var lvlrefresh = (tRack==this.Select[0])? false : true ;
//セレクト更新
    this.Select=[tRack, fRame];
        if(fctrefresh) sync("fct");//
        if(lvlrefresh) sync("lvl");//カウンタ同期
//入力同期
    this.selectionHi("hilite");    //選択範囲とホットポイントをハイライト
    this.bkup([this.XPS.xpsTracks[tRack][fRame]]);    //編集前にバックアップする
    var eddt=this.XPS.xpsTracks[tRack][fRame];    //編集済データ取得
//    ヘッドライン
    if(document.getElementById("iNputbOx").value!=eddt)
    {    document.getElementById("iNputbOx").value=eddt;};//編集ラインに送る
/*    オートスクロールフラグが立っていたらスクロールを制御
    現在、オートスクロールで移動時にマウスによる選択処理をキャンセルしている
    オートスクロールのアルゴリズムが改善されたら処理を検討のこと
    コンパクトモードと通常モードで動作切り替え

    全体の位置に加えて、現在のスクーンサイズを条件に追加して使用感を改善すること
    2015-0331
    
  　区間選択状態または選択状態のドラグ時に選択セルに対するフォーカスオフセットが働くように改装
  　2017-0324

オートスクロール起動条件
縦方向    セルフォーカスが表示範囲上下一定（６または８？）フレーム以内であること(上下別の条件に)
横方向　セルフォーカスが表示範囲左右一定（２～４？）カラム以内であること（左右別条件に）
かつ移動余裕があること=各条件がシート端からの距離以上であること
スクロール停止フラグが立っていないこと

*/
    if ((this.autoScroll)&&(! this.scrollStop)){
        var targetID=add(xUI.Select,[0,xUI.sectionManipulateOffset[1]]).join('_');
        this.scrollTo(targetID); 
    };
    document.getElementById("iNputbOx").select();
    return this.Select;
};
/*    カラム移動
        xUI.changeColumn(カラムID,カラムブロック番号)
        カラムブロック番号は、タイムシートのひとかたまりのブロック番号
        2段シートならば第一ページにはブロック0および1がある
*/
xUI.changeColumn =function(ID,cols){
if(this.viewMode=="Compact"){
    var fr=this.Select[1];
}else{
//レイヤIDとカラムIDから移動位置を算出して実行。移動不能の場合は何もせずに復帰
    if(ID=="memo"){ID=this.XPS.xpsTracks.length -1};

    var lineOffset=this.Select[1]-Math.floor(this.Select[1]/(this.PageLength/this.PageCols))*(this.PageLength/this.PageCols);//ラインオフセット
    var fr=cols*(this.PageLength/this.PageCols)+lineOffset;
    if(fr>=this.XPS.duration()){return};
}
    this.selectCell(([ID,fr]).join("_"));
};
//
//
/*    マルチセレクト
        xUI.selection(ID)
        xUI.selection([myTrack,myFrame]);
        現在のカーソル位置からIDまでの範囲を選択状態にする
        引数が空なら選択解除
        引数が配列の場合も受け付ける 負の数もOK
*/
xUI.selection =function(ID){

//現行のセレクションハイライトクリア
//選択範囲とホットポイントをフミツケ
    this.selectionHi("clear");
//引数未指定ならクリアのみでリターン
    if((typeof ID=="undefined")||(ID==null)){
        this.Selection=[0 ,0];
        document.getElementById("edchg").style.backgroundColor="";//ここでUI表示をクリアする
        this.selectionHi("hilite");
        return;
    };
//ID値から、セレクションの値を導く
if(!(ID instanceof Array))ID=ID.split("_");
    this.Selection=[parseInt(ID[0])-this.Select[0],parseInt(ID[1])-this.Select[1]];

    document.getElementById("edchg").style.backgroundColor=this.selectingColor;//ここでUIインジケータ表示
    this.selectionHi("hilite");
};

/*    選択範囲のハイライト
        xUI.selectionHi(メソッド)
        範囲が許容外だった場合は範囲を維持して操作無し
        メソッドは["hilite","footmark","clear"]
        モード遷移毎にカラーを変更するのはモードチェンジメソッドで集中処理
        
*/
xUI.selectionHi    =function(Method)
{
switch (Method) {
case    "hilite"    :
                var paintColor=this.selectionColor;break;
case    "footmark"    :
                this.spinHi("clear");
                var paintColor=this.footstampColor;break;
case    "clear"        :
                this.spinHi("clear");
default            :
    var paintColor=this.sheetbaseColor;break;
};
var range=this.actionRange();
//    dbgPut("selectionHi :\n"+range.join("\n"));
//新選択範囲をハイライト スタートアドレスに負数を許容　150919
//セクション編集のために選択範囲の末尾を色変え可能に拡張
    for (C=range[0][0];C<=range[1][0];C++){
        for (L=range[0][1];L<=range[1][1];L++){
try{
            if((C<0) || (L<0)||(C>=this.XPS.xpsTracks.length)||(L>=this.XPS.xpsTracks[C].length)){
//    当座のバグ回避とデバッグ C.Lが操作範囲外だったときの処置 値を表示
//                dbgPut(range.toString());
            }else{
                if (!(this.Select[0]==C && ( this.Select[1]+this.spinValue > L && this.Select[1] <= L)))
                {
                    if(Method=="hilite")
                    {
                        if(((L==range[1][1])||(L==range[0][1]))&&(xUI.edmode>1)){
                            paintColor=xUI.selectionColorTail;
                        }else{
                            paintColor=xUI.selectionColor;
                        }
                    }else{
                        if(this.footMark && this.diff([C,L]))
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
}catch(err){dbgPut("range err :C="+C+"  :L= "+L)};
        };
        if(Method=="hilite"){this.spinHi("put")};
    };
};

/*    スピン範囲のハイライト処理
        xUI.spinHi(メソッド)
        メソッドは["clear"]またはそれ以外
*/
xUI.spinHi = function(Method)
{
//選択ポイントのハイライトおよびスピン範囲のハイライト
//    必ず
if(! document.getElementById(this.getid("Select"))){if(dbg) dbgPut(this.getid("Select")) ;return;};
if(Method == "clear") {
//    if(dbg) console.log('foooooooot');
//    if(dbg) console.log(this.getid("Select"));
    document.getElementById(this.getid("Select")).style.backgroundColor=this.footstampColor;
}else{
    document.getElementById(this.getid("Select")).style.backgroundColor=this.selectedColor;
};

//    スピン 1 以上を処理 選択範囲内外で色分け
    for(L=this.Select[1]+1;L<this.spinValue+this.Select[1];L++){
        if(L > 0 && L < this.XPS.xpsTracks[0].length){
            if(Method=="clear"){
//if(XPS.xpsTracks[this.Select[0]][L]!="" && this.footMark){}
if(this.diff([this.Select[0],L]) && this.footMark){
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
//スピン表示が現状と異なっていた場合更新
    if ( document.getElementById("spin_V").value != xUI.spinValue){
         document.getElementById("spin_V").value  = xUI.spinValue;
    }
};
//spinHi

/*    足跡をクリア
        xUI.footstampClear();
 */
xUI.footstampClear    =function(){

    if (this.footstampColor){
    var BGr=parseInt("0x"+this.footstampColor.substr(1,2),16);
    var BGg=parseInt("0x"+this.footstampColor.substr(3,2),16);
    var BGb=parseInt("0x"+this.footstampColor.substr(5,2),16);
} else {BGr=0;BGg=0;BGb=0;};
    var BGColor="rgb("+BGr+", "+BGg+", "+BGb+")";
    if (! this.footMark) {return;};
//足跡のお掃除
    for (c=0;c<(this.SheetWidth);c++){
        for(f=0;f<(this.XPS.duration());f++){
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
/*    足跡をチェック
        xUI.footstampPaint();
        現在のカーソル位置を控えて全選択して解除
        カーソル位置を戻す
 */
xUI.footstampPaint    =function(){

    var restoreValue=this.getid("Select");
        this.selectCell("0_0");
        this.selection((this.SheetWidth-1)+"_"+this.XPS.duration());
        this.selection();
        this.selectCell(restoreValue);
};
//
/**
    ヘッダ部分の背景色を点滅させる
引数:点滅色 未指定の際は'#808080'<> 背景色

*/
xUI.headerFlash = function(hilightColor){
var originalColor=xUI.sheetLooks.SheetBaseColor;
if(!hilightColor) hilightColor='#808080';

    $("#fixedHeader").css("background-color",hilightColor);
    setTimeout(function(){
        $("#fixedHeader").css("background-color",originalColor);
        if(! document.getElementById("forgetInputWarning").checked) document.getElementById("iNputbOx").blur();
/*        setTimeout(function(){
            $("#fixedHeader").css("background-color",hilightColor);
            setTimeout(function(){
                $("#fixedHeader").css("background-color",originalColor);
            },75);
        },120);*/
        if(! document.getElementById("forgetInputWarning").checked) {xUI.sWitchPanel("Rol");}
    },150);
    return false;
};

//test xUI.headerFlash();

/*    タイムシート本体のヘッダを返すメソッド(ページ単位)
        xUI.headerView(pageNumber)
        引数はページ番号を整数で
        第一ページ以外は省略形を返す
        戻り値はページヘッダのHTMLテキスト
 */
xUI.headerView = function(pageNumber){

var Pages=(this.viewMode=="Compact")? 1:Math.ceil(this.XPS.duration()/this.PageLength);//ページ長で割って切り上げ
var    _BODY ='';
//----印字用ページヘッダ・第一ページのみシートヘッダ---//
if(pageNumber>1){
//    _BODY+='<div class="pageBreak"> </div>';
    _BODY+='<br><table class=pageHeader>';
}else{
    _BODY+='<table class=sheetHeader>';
};
//　ページヘッダとシートヘッダの共通表示

    _BODY+='<tr>';
    _BODY+='<td class="pgHeader opusHeader" id="opus'+pageNumber+'">'+this.XPS.opus+'</td>';
    _BODY+='<td class="pgHeader titleHeader" id="title'+pageNumber+'">'+this.XPS.title+this.XPS.subtitle+'</td>';
    _BODY+='<td class="pgHeader scenecutHeader" id="scene_cut'+pageNumber+'">'+this.XPS.scene+this.XPS.cut+'</td>';
    _BODY+='<td class="pgHeader timeHeader" id="time'+pageNumber+'">'+nas.Frm2FCT(this.XPS.time(),3)+'</td>';
    _BODY+='<td class="pgHeader nameHeader" id="update_user'+pageNumber+'">'+(this.XPS.update_user.toString()).split(":")[0]+'</td>';
//    _BODY+='<td class=pgHeader id="update_user'+pageNumber+'">'+this.XPS.update_user.handle+'</td>';
//シート番号終了表示
if(pageNumber==Pages){
    _BODY+='<td class="pgHeader pageHeader" >'+'end / '+Pages+'</td>';
}else{
    _BODY+='<td class="pgHeader opusHeader">'+pageNumber+' / '+Pages+'</td>';
};
    _BODY+='</tr>';

    _BODY+='<tr><th class="headerLabel opusHeader">No.</th><th class="headerLabel titleHeader">TITLE</th><th class="headerLabel scenecutHeader">S-C</th><th class="headerLabel timeHeader">TIME</th><th class="headerLabel nameHeader">name</th><th class="headerLabel pageHeader">page</th></tr>';
//ページヘッダを閉じる
    _BODY+='</table>';

    _BODY+='<table  class=sheetHeaderMargin ><tr><td class=memoSpace>';
//第一ページのみシート全体のコメントを書き込む（印刷用）　表示用には別のエレメントを使用
if(pageNumber==1){
//シート書き出し部分からコメントを外す 印刷時は必要なので注意 2010/08/21
    _BODY+='<span class=top_comment ><u>memo:</u>';  
    _BODY+='<span id="transit_dataXXX">';
    if(this.XPS.trin[0]>0){
        _BODY+="△ "+this.XPS.trin[1]+'('+nas.Frm2FCT(this.XPS.trin[0],3)+')';
    };
    if((this.XPS.trin[0]>0)&&(this.XPS.trout[0]>0)){    _BODY+=' / ';};
    if(this.XPS.trout[0]>0){
    _BODY+="▼ "+this.XPS.trout[1]+'('+nas.Frm2FCT(this.XPS.trout[0],3)+')';
    };
    _BODY+='</span>';

        _BODY+='<div id="memo_prt" class=printSpace >';
        if(this.XPS.xpsTracks.noteText.toString().length){
            _BODY+=this.XPS.xpsTracks.noteText.toString().replace(/(\r)?\n/g,"<br>");
        }else{
            _BODY+="<br><br><br><br><br><br>";
        };
        _BODY+='</div>';

    _BODY+='</span>';
}else{
    _BODY+='<div class=printSpace ><br><br><br><br><br><br></div>';
};
    _BODY+='</td></tr></table>';


if(pageNumber==1){
//    document.getElementById("UIheaderScrollH").innerHTML=this.pageView(0);
//    document.getElementById("UIheaderScrollV").innerHTML=this.pageView(-2);
}

    return _BODY;
};
//end headerView()
/*    タイムシート本体のHTMLを返すメソッド(ページ単位)
 *        xUI.pageView(pageNumber)
 *        引数はページ番号を整数で
 *        戻り値はページ内容のHTMLテキスト
 *ページヘッダであった場合のみ固定のタイムラインヘッダーを出力する（画面表示専用）
 * 固定ヘッダの　第一第二第三　象限を出力する
 *   2  |  1 (横スクロール)
 *  ----+-----
 *  3   |   4
 *
 *引数:
 *0    第一象限(-1)
 *-1    第二象限(-2)
 *-2    第三象限(-3)
 *    内部パラメータでは各値ともに減算して使用　--
 *    0以上は通常ページの出力（0 org）
 *
 *
 */
xUI.pageView =function(pageNumber)
{
    var restoreValue=this.Select;
    var BODY_ = '';
//ページ数//プロパティに変更せよ
if(this.viewMode=="Compact"){
var Pages=1;//コンパクトモードでは固定
var SheetRows=Math.ceil(this.XPS.duration()/this.XPS.framerate)*Math.ceil(this.XPS.framerate);
var hasEndMarker=true;// 継続時間終了時のエンドマーカー配置判定(必ず描画)
}else{
var Pages=Math.ceil((this.XPS.duration()/this.XPS.framerate)/this.SheetLength);//総尺をページ秒数で割って切り上げ
var SheetRows=Math.ceil(this.SheetLength/this.PageCols)*Math.ceil(this.XPS.framerate);
var hasEndMarker=false;// 継続時間終了時のエンドマーカー配置判定(初期値)
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
引数    0でヘッドライン全体を第一象限用に
    -1で固定部第二象限に
    -2で第三象限に
    それぞれ出力する

簡易UIのために
タイムラインラベルを タイミング適用スイッチに兼用する拡張…可能？12/17

(2015/01/07)
    アクション欄をたたむ（非表示）
    アクション欄のタイムライン　表示プロパティの増設
(2016/07/16)
    アクション（リファレンス）欄の表示オプションを増設
    xUI.referenveView に　種別キーワードを配列で格納
    初期状態ではセル（置きかえ＋スチル）のみを表示する
(2016/08/19)
    xpsTracksとlayersの統合に伴うチューニング
(2017/07/20)
    リファレンスエリアのシート内容表示の際トラック抽出のバグがあったのを修正
(2017/07/21)
 ページ内に最終フレームが含まれるか否かを判定してカット記述終了マーカーを配置する拡張

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
    TimeGuideWidth    th.timeguidelabel
    ActionWidth    th.layerlabelR
    DialogWidth    th.dialoglabel
    SheetCellWidth    th.layerlabel
*new    cameraWidth    th.cameraLabel
    CommentWidth    th.framenotelabel
    ColumnSeparatorWidth colSep
印字に適さない設定(幅/高さオーバー)の場合は、一応警告を表示する。
印字用cssは、固定で作成する。A4,A3,B4,レターサイズくらいのところで作る

*/
/**/
if(this.viewMode=="Compact"){
var tableFixWidth=(
    this.sheetLooks.TimeGuideWidth +
    this.sheetLooks.ActionWidth*this.referenceLabels.length 
    );
var tableColumnWidth=(
    tableFixWidth+
    this.sheetLooks.DialogWidth*xUI.dialogCount +
    this.sheetLooks.StillCellWidth*xUI.stillCount +
    this.sheetLooks.SfxCellWidth*xUI.sfxCount +
    this.sheetLooks.CameraCellWidth*xUI.cameraCount +
    this.sheetLooks.SheetCellWidth*xUI.timingCount +
    this.sheetLooks.CommentWidth );//

/*+
    DialogWidth*(xUI.dialogSpan-1)
        (第二・第三象限固定幅)
    (
    参照レイヤ数*参照セル幅+
    タイムヘッダ幅+
    ダイアログ幅
    )
    TimeGuideWidth +
    ActionWidth*xUI.referenceLabels.length +
    DialogWidth*(xUI.dialogCount-xUI.dialogSpan)+
*/
//alert(    DialogWidth*(xUI.dialogCount-xUI.dialogSpan) );
    var tableBodyWidth=tableColumnWidth;
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
    var SheetLength=Math.ceil(this.XPS.duration()/this.XPS.framerate);
}else{
//シートワープロモード
/*    第二象限固定ヘッダは、タイムガイド幅
    第一象限ヘッダーはカラム数分繰り返し
    第三象限ヘッダーはシート枚数分繰り返し
UI設定に基づいて段組
*/
    var tableFixWidth=this.sheetLooks.TimeGuideWidth;

    var tableColumnWidth=(
    this.sheetLooks.TimeGuideWidth +
    this.sheetLooks.ActionWidth*this.referenceLabels.length +
    this.sheetLooks.DialogWidth*xUI.dialogCount +
    this.sheetLooks.StillCellWidth*xUI.stillCount +
    this.sheetLooks.SfxCellWidth*xUI.sfxCount +
    this.sheetLooks.CameraCellWidth*xUI.cameraCount +
    this.sheetLooks.SheetCellWidth*xUI.timingCount +
    this.sheetLooks.CommentWidth );
/*
    以前はテーブル内のタイムラン種別をここで判定していたが
    xUIのプロパティに変換してこちらでは計算のみを行う仕様に変更済み 2015/04.25
*/
    var tableBodyWidth=tableColumnWidth * this.PageCols +
        (this.sheetLooks.ColumnSeparatorWidth*(this.PageCols-1));//
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

    if(pageNumber==(Pages-1)){hasEndMarker=true;};
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
BODY_ +='style="width:'+(tableFixWidth)+this.sheetLooks.CellWidthUnit+'"';
    }else{
//第1,4象限用
BODY_ +='style="width:'+tableBodyWidth+this.sheetLooks.CellWidthUnit+'"';
    }
    if(pageNumber<0){
BODY_ +='id="qdr'+(-1*pageNumber)+'" ';
    }else{
BODY_ +='id="qdr4" ';
//BODY_ +='id="qdr4_'+String(pageNumber)+'" ';
    }
BODY_ +=' >';
BODY_ +='<tbody>';
    if(true){
//========================================シートヘッダ
/*    テーブルルックを決め込む為の幅配置及び将来的にリンクペアレントを表示する領域(かも)
    第一行目
    UI上は、イベント受信を担当するのは最も上に表示されるエレメント
*/
BODY_ +='<tr class=tlhead>';
//*==============================ページカラムループ処理
    for (cols=0;cols < PageCols;cols ++){
/*********** timeguide ********************/
BODY_ +='<th class="tcSpan tlhead"';
BODY_ +=' ></th>';

if((this.viewMode!="Compact")&&(pageNumber<=-2)){break;
//第二第三象限でかつコンパクトモードでない場合はここでブレイクしてヘッダーを縮小
}
/*********** Action Ref *************/
//=====================参照エリア
        for (r=0;r<this.referenceLabels.length;r++){
BODY_ +='<th class="referenceSpan tlhead" ';
BODY_ +='> </th>';
        };

/*********** Dialog Area*************/
//予約タイムラインの為一回分 別に出力
//BODY_ +='<th class=dialogSpan ';
//BODY_ +='> </th>';
/************左見出し固定時の処理*****************/
    if(pageNumber<=-2){
/*********** Edit Area *************/
//=====================編集セル本体の固定部分のみをタイムライン種別に合わせて配置(ラベル部分)
if(true){
        for (var r=0;r<(xUI.dialogSpan);r++){
    BODY_ +='<th class="dialogSpan tlhead"  id="TL'+(r+1)+'" ></th>';
        }
}else{
        for (var r=0;r<this.XPS.xpsTracks.length;r++){
//BODY_ +='<th class="editSpan" ';//editSpanは後で消しておくこと
 switch (this.XPS.xpsTracks[r].option)
 {
case "dialog":
    BODY_ +='<th class="dialogSpan tlhead" ';
    BODY_ +=' id="TL'+ r +'"';
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
        for (r=0;r<this.XPS.xpsTracks.length-1;r++){
            //末尾レコードはコメント固定なので判定せず（レコード長から1減算）　
 switch (this.XPS.xpsTracks[r].option)
 {
case "dialog":BODY_ +='<th class="dialogSpan tlhead" ';break;
case "still":BODY_ +='<th class="stillSpan tlhead" ';break;
case "sfx":BODY_ +='<th class="sfxSpan tlhead" ';break;
case "camera":BODY_ +='<th class="cameraSpan tlhead" ';break;
case "timing":
default:BODY_ +='<th class="timingSpan tlhead" ';
 }

BODY_ +=' id="TL'+(r+1)+'"';
BODY_ +=' > ';
BODY_ +='</th>';
        };
/*********** FrameNote Area *************/
BODY_ +='<th class="framenoteSpan tlhead"';
BODY_ +=' ></th>';
//カラムセパレータの空セル挿入
if (cols < PageCols-1) BODY_ +=('<td class="colSep tlhead" ></td>');
    };

    }
/************************************************/


BODY_ +='</tr>';//改段
    }
//第二行目========================================シート記入分ヘッダ
    
BODY_ +='<tr>';
    for (cols=0;cols < PageCols;cols ++){
/*********** timeguide ********************/
BODY_ +='<th rowspan=2 class="tclabel annotationText" ';
//BODY_ +='style=" width:'+this.sheetLooks.TimeGuideWidth+CellWidthUnit+'"';
BODY_ +=' ><span class=timeguide> TIME </span></th>';
/*********** Action Ref *************/
BODY_ +='<th colspan="'+this.referenceLabels.length+ '" id="rnArea" class="rnArea annotationText" ondblclick=sync("referenceLabel") title=""';
//　ここは参照シートの識別名に置き換え 
BODY_ +=' >Reference</th>';
/*********** Dialog Area*************/
BODY_ +='<th rowspan=2 class="dialoglabel annotationText" ';
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
BODY_ +='<th colspan='+xUI.timingSpan+' id=editArea class="editArea annotationText" ondblclick=sync("editLabel") title=""';
//ここは編集中のステージ名に置き換え予定
BODY_ +='>Animation</th>';

/*********** Edit Area 2 (camera+sfx) *************/
if(xUI.cameraSpan>0){
BODY_ +='<th colspan='+xUI.cameraSpan+' id=camArea class="camArea annotationText" ';
//
BODY_ +='>camera</th>';
}
/*********** FrameNote Area *************/
BODY_ +='<th rowspan=2 class="framenotelabel annotationText"';
/***
BODY_ +=' onMouseDown=\'xUI.changeColumn("memo" ,'+ (2 * pageNumber+cols) +');\'';
***/
BODY_ +=' >MEMO.</th>';
//カラムセパレータの空セル挿入
if (cols < PageCols-1) BODY_ +=('<td rowspan='+(2+SheetRows)+' id=colSep class=colSep ></td>');
    };

    }
BODY_ +='</tr>';//改段

//ヘッダ2行目
BODY_ +='<tr>';//改段

    for (cols=0;cols < PageCols;cols ++){

//=====================参照エリア
        for (r=0;r<this.referenceLabels.length;r++){

BODY_ +='<th id="rL';
BODY_ += r.toString();
BODY_ += '_';
BODY_ += pageNumber;
BODY_ += '_';
BODY_ += cols.toString();

BODY_ +='" class="layerlabelR annotationText"';
BODY_ +=' >';
var lbString=(this.referenceLabels[r].length<4)?this.referenceLabels[r]:'<a onclick="return false;" title="'+this.referenceLabels[r]+'">●</a>';


 if (this.referenceLabels[r].match(/^\s*$/)){
    BODY_ +='<span style="color:'+this.sheetborderColor+'";>'+nas.Zf(r,2)+'</span>';
 }else{
    BODY_ +=lbString;
 };

        };
    if(pageNumber>=-1){
//=====================編集セル本体(ラベル部分)

        for (var r=(xUI.dialogSpan);r<(this.XPS.xpsTracks.length-1);r++){
    if(this.XPS.xpsTracks[r].option=="comment"){break;}
BODY_ +='<th id="L';
BODY_ += r.toString();
BODY_ += '_';
BODY_ += pageNumber;
BODY_ += '_';
BODY_ += cols.toString();
 switch (this.XPS.xpsTracks[r].option){
case "still" :BODY_ +='" class="stilllabel annotationText" ' ;break;
case "effect":
case "sfx"   :BODY_ +='" class="sfxlabel annotationText" '   ;break;
case "camerawork":
case "camera":BODY_ +='" class="cameralabel annotationText" ';break;
case "replacement":
case "timing":
case "dialog":
case "sound":
default:BODY_ +='" class="layerlabel annotationText" ';
}

BODY_ +=' >';
if(this.XPS.xpsTracks[r].option=="still"){
 if (this.XPS.xpsTracks[r].id.match(/^\s*$/)){
    BODY_ +='<span style="color:'+xUI.sheetborderColor+'";>'+nas.Zf(r,2)+'</span>';
 }else{
    BODY_ +='<a onclick="return false" title="'+this.XPS.xpsTracks[r].id+'">▼</a>';
 };
}else{
 if (this.XPS.xpsTracks[r].id.match(/^\s*$/)){
    BODY_ +='<span style="color:'+xUI.sheetborderColor+'";>'+nas.Zf(r,2)+'</span>';
 }else{
    BODY_ +=this.XPS.xpsTracks[r].id;
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
    var currentSec=(currentPageNumber*SheetLength)+Math.floor(myFrameCount/Math.ceil(this.XPS.framerate));//処理中の秒
    var restFrm= myFrameCount % Math.ceil(this.XPS.framerate);//処理中の　ライン/秒
    var mySpt=(this.XPS.rate.match(/df/i))?";":":";
    var myTC=[Math.floor(currentSec/3600)%24,Math.floor(currentSec/60),currentSec%60].join(":")+mySpt+restFrm
    var current_frame= nas.FCT2Frm(myTC,this.XPS.framerate);//FCTからフレームインデックスを導くドロップ時はnull

//alert([myFrameCount,currentSec,restFrm].join("\n"));break;
// var current_frame=(this.PageLength*currentPageNumber)+cols*SheetRows+n;//カレントフレームの計算がTCベースになる必要あり
//現在処理中のフレームは有効か否かをフラグ　フレームがドロップまたは継続時間外の場合は無効フレーム
    var isBlankLine =((current_frame != null)&&(current_frame < this.XPS.duration()))? false:true;
// alert(isBlankLine+" : "+current_frame)

//セパレータ(境界線)設定
if(restFrm==(Math.ceil(this.XPS.framerate)-1)){
//秒セパレータ
    var tH_border= 'ltSep';
    var dL_border= 'dtSep';
    var sC_border= 'ntSep';
    var mO_border= 'ntSep';
}else{
    if (n%this.sheetSubSeparator==(this.sheetSubSeparator-1)){
//    サブセパレータ
        var tH_border= 'lsSep';
        var dL_border= 'dsSep';
        var sC_border= 'nsSep';
        var mO_border= 'nsSep';
    }else{
//    ノーマル(通常)指定なし
        var tH_border= 'lnSep';
        var dL_border= 'dnSep';
        var sC_border= 'nnSep';
        var mO_border= 'nnSep';
    };
};
//背景色設定
/*    判定基準を継続時間内外のみでなくドロップフレームに拡張
*/
//    if ((current_frame != null)&&(current_frame < this.XPS.duration())){}
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

BODY_ +=tcStyle ;
BODY_ +='class="Sep ';
BODY_ +=tH_border+cellClassExtention;
BODY_ +='"';
BODY_ +=' id=tcg_';
BODY_ +=String(current_frame);
BODY_ +=' >';
    if (restFrm==0) {BODY_ += "<span class=timeguide>[ "+ currentSec.toString()+"' ]</span>"};
    if  (((n+1)%2 ==0)&&(! isBlankLine))
    {BODY_ += (current_frame+1).toString();}else{BODY_+='<br>';};
//    {BODY_ += ((n+1)+cols*SheetRows).toString();}else{BODY_+='<br>';};
BODY_ +='</td>';

//参照シートセル
/*
    for(var ix=0;ix<xUI.referenceXPS.xpsTracks.length;ix++){
        var currentTrack=xUI.referenceXPS.xpsTracks[ix].option;
        var currentLabel=xUI.referenceXPS.xpsTracks[ix].id;
        if(currentLabel.length>2) currentLabel=currentLabel.slice(0,2);
        if(currentTrack.match(this.refRegex)) {
            this.referenceLabels.push(currentLabel)
        }
*/
    var refLabelID = 0; //for (var refLabelID=0;refLabelID< this.referenceLabels.length;refLabelID++)
    for (var r=0;r< this.referenceXPS.xpsTracks.length;r++){
        if(this.referenceLabels[refLabelID]!= this.referenceXPS.xpsTracks[r].id){continue;}
//参照ラベル抽出と同アルゴリズムで抽出を行うかまたはキャッシュをとる
BODY_ +='<td ';
    if (! isBlankLine){}
    if (current_frame<this.referenceXPS.xpsTracks[r].length){
BODY_ += 'id=\"r_';
BODY_ += r.toString()+'_'+ current_frame.toString();
// BODY_ +=refLabelID.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
BODY_ +='class="';
BODY_ +=sC_border+cellClassExtention + ' ref';
BODY_ +='"';
    }else{
BODY_ +='class="';
BODY_ +=sC_border+'_Blank';
BODY_ +='"';
    };
BODY_ +='>';
        if (current_frame>=this.referenceXPS.xpsTracks[r].length){
    BODY_+="<br>";
        }else{
    this.Select=[r,current_frame];
    if (this.referenceXPS.xpsTracks[r][current_frame]!=""){
        BODY_ += this.trTd(['r',r,current_frame]);
//        BODY_ += this.trTd(this.referenceXPS.xpsTracks[r][current_frame]);
//        BODY_ += this.trTd(document.getElementById(["r",[r],[current_frame]].join("_")));
    }else{
        BODY_+='<br>';
    };
        };
BODY_ +='</td>';
        refLabelID ++;
    };
/*
    ダイアログタイムラインとその他のタイムラインの混在を許容することになるので
    位置による決め打ちでなく、タイムライン種別の判定を行う。
    固定ヘッダ出力の場合は、ループ上限を冒頭ダイアログまでに限定
*/
    var outputColumus=(pageNumber<-2)?xUI.dialogSpan-1:this.XPS.xpsTracks.length-2;
for (var r=0;r<=outputColumus;r++){
    if((r==0)||(this.XPS.xpsTracks[r].option=="dialog"))    {
//ダイアログセル
BODY_ +='<td ';
//    if ((current_frame != null)&&(current_frame < this.XPS.duration())){}
    if (! isBlankLine){
BODY_ += 'id="';
BODY_ +=r.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
//BODY_ +='onclick="return xUI.Mouse(event)" ';
    };
BODY_ +='class="';
BODY_ += dL_border+cellClassExtention;
BODY_ +=' soundbody" ';
BODY_ +='"';
BODY_ +='>';
//        if((current_frame==null)||(current_frame>=this.XPS.duration()))
        if (isBlankLine){
    BODY_+="<br>";
        }else{
    this.Select=[0,current_frame];


    if (this.XPS.xpsTracks[r][current_frame]!=""){
        BODY_+=this.trTd([r,current_frame]);
//        BODY_+=this.trTd(this.XPS.xpsTracks[r][current_frame]);
    }else{
        BODY_ += '<BR>';
    }    };

BODY_ +='</td>';
    }else{
//シートセル
//極力インラインスタイルシートを書かないように心がける 05'2/25
BODY_ +='<td ';
//    if ((current_frame != null)&&(current_frame < this.XPS.duration())){}
    if (! isBlankLine){
BODY_ += 'id="';
BODY_ +=r.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
//BODY_ +='onclick="xUI.Mouse(event)" ';
    };
BODY_ +='class="';
BODY_ +=sC_border+cellClassExtention +'"';
BODY_ +='"';
BODY_ +='>';
//        if((current_frame==null)||(current_frame>=this.XPS.duration())){}
        if (isBlankLine){
    BODY_+="<br>";
        }else{
    this.Select=[r,current_frame];
    if ( this.XPS.xpsTracks[r][current_frame]!=""){
        BODY_+=this.trTd([r,current_frame]);
//        BODY_ += this.trTd(this.XPS.xpsTracks[r][current_frame]);
    }else{
        BODY_+='<br>';
    };
        };
BODY_ +='</td>';

    };
}

/*    メモエリア
 * 固定ヘッダー出力時はスキップ
 *
 */
 if(pageNumber>=0){
BODY_ +='<td ';
//    if (current_frame < this.XPS.duration()){}
    if (! isBlankLine){
BODY_ += 'id="';
BODY_ += (this.XPS.xpsTracks.length-1).toString()+'_'+ current_frame.toString();
BODY_ +='" ';
//BODY_ +='onclick="xUI.Mouse(event)" ';
    };
BODY_ +='class="';
BODY_ +=mO_border+cellClassExtention;
BODY_ +='"';
BODY_ +='>';
//        if(current_frame>=this.XPS.duration()){}
        if (isBlankLine){
    BODY_+="<br>";
        }else{
    this.Select=[this.XPS.xpsTracks.length-1,current_frame];
    if ( this.XPS.xpsTracks[this.XPS.xpsTracks.length-1][current_frame]!=""){
        BODY_ += this.trTd([this.XPS.xpsTracks.length-1,current_frame]);
//        BODY_ += this.trTd(this.XPS.xpsTracks[this.XPS.xpsTracks.length-1][current_frame]);
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
BODY_ +='\n';
/*タイムシート記述終了マーカーを配置*/
if((hasEndMarker)&&(pageNumber==currentPageNumber)){    
BODY_ +='<div id=endMarker class=endMarker>';
BODY_ += JSON.stringify([xUI.XPS.xpsTracks.length, xUI.XPS.xpsTracks.duration]);
BODY_ +='</div>';
//BODY_ +='<div id=endMarker-print class=endMarker-print>::print-end::';
//BODY_ +='<br></div>';
 };// */
BODY_ +='';
    this.Select=restoreValue;
    return BODY_;
};
/* エンドマーカー位置調整メソッド　endMarker
    上記で配置したendMarkerの位置を実際の終了フレームの真下に再配置するメソッド
    '#0_'+String(this.XPS.xpsTracks.duration-1);
    '#'+String(this.XPS.xpsTracks.length-1)+'_'+String(this.XPS.xpsTracks.duration-1);
    自動化のため参照エレメントの情報をendMakerのinnerHTML内に埋め込む
    [this.XPS.xpsTracks.length-1,this.XPS.xpsTracks.duration-1]
    この形式によって位置計算にjQueryを利用しないでマーカーの再配置を行う
    以下のメソッドは　単独の関数としても利用可能
 */
xUI.replaceEndMarker = function(endPoint,markerOffset){
    if(! document.getElementById('endMarker')) return;
    if (typeof endPoint == 'undefined'){
   try{
//    var endPoint = JSON.parse(document.getElementById('endMarker').innerHTML);
    var endPoint = [xUI.XPS.xpsTracks.length, xUI.XPS.xpsTracks.duration];
   }catch(er){return;}
    }
    if (typeof markerOffset == 'undefined'){
        markerOffset = 0;
    }

    if(!(endPoint instanceof Array)) {endPoint=[1,endPoint]};
    if(endPoint.length>2) markerOffset = endPoint[2];
    var endCellLeft  = document.getElementById('0_'+String(endPoint[1]-1));
    var endCellRight = document.getElementById(String(endPoint[0]-1)+'_'+String(endPoint[1]-1));
    var parentSheet  = document.getElementById('endMarker').parentNode;
    var endCellLeftRect  = endCellLeft.getBoundingClientRect();
    var endCellRightRect = endCellRight.getBoundingClientRect();
    var parentRect   = parentSheet.getBoundingClientRect();
    var markerRect   = document.getElementById('endMarker').getBoundingClientRect();
    var markerWidth  = String(endCellRightRect.right-endCellLeftRect.left)+'px';
    var markerTop    = String(endCellLeftRect.bottom - markerRect.top + markerOffset)+ 'px' ;
//    var markerTop    = String(endCellLeftRect.bottom - parentRect.bottom + (markerRect.height * 2.3))+ 'px' ;
    var markerLeft   = String(endCellLeftRect.left-parentRect.left)+'px'; 
   $("#endMarker").css({'top':markerTop,'left':markerLeft,'width':markerWidth });//ここでjQery使ってる
//   document.getElementById("endMarker").style.left  = markerLeft;
//   document.getElementById("endMarker").style.top   = markerTop;
//   document.getElementById("endMarker").style.width = markerWidth;
         //必要があればここで、endMarkerのテキストを書換
   document.getElementById("endMarker").innerHTML = ':: end ::';
}
//
//本体シートの表示を折り畳む（トグル）
xUI.packColumn=function(ID)
{
//    id((ID<0)||(ID>this.SheetWidth)){return;};
var Target=ID;
var PageCols=(this.viewMode=="Compact")?1:this.PageCols;
var PageCount=(this.viewMode=="Compact")?1:Math.ceil(this.XPS.duration()/this.PageLength);
//    switch(ID)
//    {
//case    0:myTarget=0;break;
//case    this.SheetWidth:myTarget="memo";break;
//    };
    for (Page=0 ;Page < PageCount;Page++)
    {
//レイヤラベルのID "L[レイヤID]_[ページID]_[カラムID]"
        for (cols=0;cols < PageCols;cols ++){
            alert("L"+Target+"_"+Page+"_"+cols+" : "+document.getElementById("L"+Target+"_"+Page+"_"+cols).style.width);
            var isNarrow=(document.getElementById("L"+Target+"_"+Page+"_"+cols).style.width=="4px")?true:false;
            document.getElementById("L"+Target+"_"+Page+"_"+cols).style.width=(isNarrow)? this.sheetLooks.SheetCellWidth:this.sheetLooks.SheetCellNarrow;
            alert(document.getElementById("L"+Target+"_"+Page+"_"+cols).style.width+" : "+isNarrow);

        };
    };
};

//参照シートの表示を折り畳む(トグル)
xUI.packRefColumns=function()
{
var PageCols=(this.viewMode=="Compact")?1:this.PageCols;
var PageCount=(this.viewMode=="Compact")?1:Math.ceil(this.XPS.duration()/this.PageLength);
   for (var Target=1;Target<=this.referenceLabels.length;Target++){
    for (Page=0 ;Page < PageCount ;Page++){
//レイヤラベルのID "L[レイヤID]_[ページID]_[カラムID]"
        for (var cols=0;cols < PageCols;cols ++){
            alert("rL"+Target+"_"+Page+"_"+cols+" : "+document.getElementById("rL"+Target+"_"+Page+"_"+cols).style.width);

            var isNarrow=(document.getElementById("rL"+Target+"_"+Page+"_"+cols).style.width=="4px")?true:false;
            document.getElementById("rL"+Target+"_"+Page+"_"+cols).style.width=(isNarrow)? this.sheetLooks.SheetCellWidth:this.sheetLooks.SheetCellNarrow;
//            alert(document.getElementById("rL"+Target+"_"+Page+"_"+cols).style.width+" : "+isNarrow);

        };
    };
   }
};

/*
UI関連メソッド
*/
/*
    スピンアクション
xUI.spin(vAlue)
引数:
設定するスピン量　数値
または
キーワード right/left/up/doun/fwd/back
引数無しで現在のスピン量を返す
戻値:更新あとのスピン量
*/
xUI.spin    =function(vAlue){
    if(typeof vAlue =="undefined"){return this.spinValue;}
    var NxsV=this.spinValue;    //spin値を取得
    var tRack=this.Select[0];//IDからカラムとラインを取得
    var fRame=this.Select[1];//
    var NxrA=tRack*1;
    var NxFr=fRame*1;//暫定的に次のフレームをもとのフレームで初期化

//スピンオプションにしたがって次の位置を計算する
switch (vAlue) {
case 'fwd' :    ;//スピン前方*
    NxFr =((NxFr + NxsV) % this.XPS.duration() );
    if (!this.sLoop) {if (fRame > NxFr) {NxFr = fRame}};
    break ;
case 'back' :    ;//スピン後方*
    NxFr =((NxFr + this.XPS.duration() - NxsV ) % this.XPS.duration() ) ;
    if (!this.sLoop) {if (fRame < NxFr) {NxFr = fRame }};
    break ;
case 'down' :    ;//\[down\]*
    NxFr = (NxFr + 1 )% this.XPS.duration() ;
    if ((!this.cLoop) && (fRame > NxFr)) {NxFr = fRame};
    break ;
case 'up' :    ;//\[up\]*
    NxFr = ((NxFr + this.XPS.duration() -1) % this.XPS.duration() );
    if ((!this.cLoop) && (fRame < NxFr)) {NxFr = fRame * 1};
    break ;
case 'right' :    ;//\[right\]データが未編集の場合のみ左右スピン
    if (! this.edchg)
    {
        NxrA =(NxrA < this.XPS.xpsTracks.length) ?
        (NxrA + 1 ) : (this.XPS.xpsTracks.length) ;
    };
    break ;
case 'left' :    ;//\[left\]編集中の場合は、システムに戻す*
    if (! this.edchg)
    {NxrA = (NxrA>0) ? (NxrA -1) : 0 ;};
    break ;
case 'pgup' :    ;//ページアップ*
    if (NxFr-this.cPageLength >= 0){
    NxFr=NxFr-this.cPageLength};
    break;
case 'pgdn' :    ;//ページダウン*
    if(NxFr+this.cPageLength < this.XPS.duration()){
    NxFr=NxFr+this.cPageLength};
    break;
case 'v_up' :    ;//spin値ひとつあげ
    NxsV++;if(NxsV > this.XPS.framerate) NxsV=1;
//return NxsV;
    break;
case 'v_dn' :    ;//spin値ひとつさげ
    NxsV--;if(NxsV <= 0) NxsV=this.XPS.framerate;
//return this.spinValue;
    break;
case 'v_loop' :    ;
    NxsV++;NxsV=[2,3][NxsV%2];//spin値を2,3 交互切り換え
//    NxsV--;NxsV=[2,3,4][NxsV%3];//spin値を2,3,4 交互切り換え
//return this.spinValue;
    break;

case 'update'    :    ;//セレクションの値からスピンの更新
//    if(this.Selection[0]==0 && this.Selection[1]>=0 &&this.spinSelect)
    if(this.Selection[0]==0 && this.Selection[1]>=0){
        NxsV=(Math.abs(this.Selection[1])+1);
    };
    break;
default :    ;//数値の場合は、spin値の更新 数値以外はNOP
    if (isNaN(vAlue)){return;false}else{NxsV=vAlue*1};
};

//スピン値の変更があった場合は、スピン表示の更新
    if(NxsV != this.spinValue)
    {
        this.spinHi("clear");
        this.spinValue=NxsV;
        document.getElementById("spin_V").value=this.spinValue;
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
/*    ダイアログ（くちぱく）指定タイムライン用のSpin動作
    現在値のinc/decをコマンドで行う
*/

xUI.dialogSpin=function(param)
{
    var doSpin=true;
    var entry=(this.eddt)?this.eddt:this.getCurrent();//

    if (! entry || entry=="blank"){syncInput("");return;};

    switch(param)
    {
    case "incr":    doSpin=false;entry++;break;
    case "decr":    doSpin=false;if(entry>1){entry--;break}else{return;break;};
    case "incrS":    entry++;break;
    case "decrS":    if(entry>1){entry--;break}else{return;break;};
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

/*xUI.getCurrent()
引数:なし
戻値:現在フォーカスのあるシートセルの持つ値

現行の関数は、timingタイムラインのみで意味を持つので、改修が必要2015.09.18

*/
xUI.getCurrent=function(){

    var currentValue=null;
    for(id=this.Select[1];id>=0;id--)
    {
        currentValue=dataCheck(this.XPS.xpsTracks[xUI.Select[0]][id]);
        if(currentValue && currentValue!="blank") break;
     };
    return currentValue;
};
//
//xUI.getCurrent=getCurrent_ ;
//


/*    ラピッドモードのコマンドを実行    */
xUI.doRapid=function(param){rapidMode.command[param]();};

/*    複写
引数:なし
戻値:なし
現在の操作対象範囲をヤンクバッファに退避
 */
xUI.copy    =function(){this.yank();};

/*    切り取り
引数:なし
戻値:なし
現在の操作対象範囲をヤンクバッファに退避して、範囲内を空データで埋める
選択範囲があれば解除してフォーカスを左上にセット

 */
xUI.cut    =function()
{
    this.yank();
//選択範囲を取得して全部空のストリームに作って流し込む。
    var actionRange=this.actionRange();
    var Columns=actionRange[1][0]-actionRange[0][0];//幅
    var Frames=actionRange[1][1]-actionRange[0][1];//継続時間
    var bulk_c='';
    var bulk= '';
    for (f=0;f<=Frames;f++) {bulk_c+=(f!=Frames)? ","    :"";};
    for (c=0;c<=Columns;c++) {bulk+=(c!=Columns)? bulk_c+"\n":bulk_c;};
    this.inputFlag="cut";
    this.put(bulk);
    this.selectCell(actionRange[0]);//
    this.selection();
};

/*    貼り付け
引数:なし
戻値:なし
現在の操作対象範囲左上を基点にヤンクバッファ内容をペースト
操作対象範囲左上をフォーカスして書き換え範囲を選択範囲にする

 */
xUI.paste    =function(){
    var bkPos=this.Select.slice();
    this.inputFlag="cut";
    this.put(this.yankBuf.body);
    this.selectCell(bkPos);
};
/*    移動
xUI.move(dest,dup);
引数:    dest    [deltaColumn,deltaLine]
    dup    複製フラグ trueで移動先に複製を配置
戻り値：移動成功時 true 失敗時は false

カットとペーストを自動で行うのではなくundoの対象を1回にするために、移動範囲のバウンディングボックスを生成してput一回で処理する

移動先が編集範囲外のデータは消去
移動が発生しなかった場合は移動失敗　undoバッファの更新は行われない
移動指定時に、フォーカスが範囲外に出るケースは、失敗とする
このルーチン内で完結させて xUI.putメソッドには渡さない

移動メソッドのケースは、UNDOデータの構造が以下のように拡張される
[書換基点,(ダミーの選択範囲),書換データ,[復帰用のフォーカス,選択範囲]]
UNDOデータが第４要素を保つ場合のみ、そのデータをもとにカーソル位置の復帰が行われる
*/
xUI.move    =function(dest,dup){
    if(xUI.viewOnly) return xUI.headerFlash('#ff8080');
    if(typeof dest =="undefined"){return false};//移動指定なし
    if ((dest[0]==0) && (dest[1]==0)){return false};//指定は存在するが移動はなし

    if(typeof dup =="undefined"){dup=false};//複製指定なし

    var bkPos=this.Select.slice();//現在のフォーカス位置を控える
    var bkRange=this.Selection.slice();//現在のセレクト範囲
    
    var myRange=this.actionRange();//移動対象範囲
    var destRange=[add(myRange[0],dest),add(myRange[1],dest)];//移動先範囲
    var fkPos=add(bkPos,dest);//[dest[0]+bkPos[0],dest[1]+bkPos[1]];//移動終了後のフォーカス
//alert(fkPos)
    if ((fkPos[0]<0)||(fkPos[1]<0)||(fkPos[0]>this.XPS.xpsTracks.length)||(fkPos[1]>this.XPS.xpsTracks[0].length)){return false}
    //いずれもシート外にフォーカスが出るので禁止　これを排除するので変更範囲は処理可能となる
//変更範囲を算出(この計算では範囲外の値が出るが、フォーカスがシートを外れないのでこのまま)
    var left  =(dest[0]<0)? dest[0]+myRange[0][0]:myRange[0][0];
    var top   =(dest[1]<0)? dest[1]+myRange[0][1]:myRange[0][1];
    var right =(dest[0]>0)? myRange[1][0]+dest[0]:myRange[1][0];
    var bottom=(dest[1]>0)?    myRange[1][1]+dest[1]:myRange[1][1];

//移動範囲を取得して配列に
    var moveBlockData= xUI.getRange();
        moveBlockData=moveBlockData.split("\n");
        for(var i=0;i<moveBlockData.length;i++){moveBlockData[i]=moveBlockData[i].split(",")}
//変更範囲内のデータをオブジェクトメソッドで取得(範囲外は空要素)
    var bulk=this.XPS.getRange([[left,top],[right,bottom]]);
        bulk=bulk.split("\n");
        for(var i=0;i<bulk.length;i++){bulk[i]=bulk[i].split(",");}
//変更配列の内容を入れ替え
    var leftOffset=(dest[0]>=0)?[bulk.length-moveBlockData.length,0]:[0,bulk.length-moveBlockData.length];
    var topOffset =(dest[1]>=0)?[bulk[0].length-moveBlockData[0].length,0]:[0,bulk[0].length-moveBlockData[0].length];
      
//    var topOffset =[0,bulk[0].length-moveBlockData[0].length];if(dest[1]>=0){topOffset.reverse()}
    for(var c=left;c<=right;c++){
    var cidx=c-left;
        for(var f=top;f<=bottom;f++){
    var fidx=f-top;
if(! dup){
    if((fidx>=topOffset[1])&&(fidx<(topOffset[1]+moveBlockData[0].length))){
      if((cidx>=leftOffset[1])&&(cidx<(leftOffset[1]+moveBlockData.length))){
        bulk[cidx][fidx]="";
      }
    }
}
    if((fidx>=topOffset[0])&&(fidx<(topOffset[0]+moveBlockData[0].length))){
      if((cidx>=leftOffset[0])&&(cidx<(leftOffset[0]+moveBlockData.length))){
        bulk[cidx][fidx]=moveBlockData[cidx-leftOffset[0]][fidx-topOffset[0]];
      }
    }
        }
    }
//オブジェクトメソッドで書き換え
    for(var ix=0;ix<bulk.length;ix++){bulk[ix]=bulk[ix].join(",")};
    var putResult=this.XPS.put([left,top],bulk.join("\n"));
//if(putResult){dbgPut(putResult[0].join("\n")+"\n"+putResult[1].join("\n")+"\n"+putResult[2].join("\n"))}
//UNDO配列を設定
//Selection互換のため[left,top]いずれかが負数の時は右下を仮のフォーカスとして与える
//実際のフォーカスと選択範囲は別に記録して上書きする
    var UNDO=new Array(4);
        UNDO[0]    =putResult[0][0];
        UNDO[1]    =[0,0];
        UNDO[2] =putResult[2];
        UNDO[3] =[bkPos,bkRange];//undoに第４要素を拡張
//    セル書き直し
    this.syncSheetCell(putResult[0][0],putResult[0][1]);

        this.undoPt++;
        this.undoGc=0;
        this.undoStack[this.undoPt]=UNDO;
        if (this.undoStack.length>(this.undoPt+1))
            this.undoStack.length=(this.undoPt+1);
// undoバッファの状態を表示
    sync("undo");sync("redo");

    if(this.edmode!=0){this.mdChg("normal")};//編集モードをノーマルに復帰

    this.selectCell(fkPos.join("_"));
    this.selection(add(fkPos,bkRange));
}

/**
    やり直し
引数: undoOffset 遡るべきundo回数 undoポインタを超えることはできない　省略時は 1
   
 */
xUI.undo    =function (undoOffset){
    if(this.undoPt==0) {
if(dbg) {dbgPut("UNDOバッファが空")};
        return;
    };
    //UNDOバッファが空なので失敗
    if(typeof undoOffset == 'undefined') undoOffset = 1;
    this.skipCt=(undoOffset-1);
while(undoOffset>0){
if(dbg) {dbgPut("undoPt:"+this.undoPt+":\n"+this.undoStack[this.undoPt].join("\n"))};
    this.inputFlag="undo";
    var putResult=this.put();
    if(putResult){
if(dbg) {dbgPut("putResult:\n"+putResult)};
//            this.selectCell(putResult[0]);
//            this.selection (putResult[1]);
//            this.selection ();
    }
    undoOffset --;
  }
};

/*    やり直しのやり直し    */
xUI.redo    =function(redoOffset){
    if((this.undoPt+1)>=this.undoStack.length) {
if(dbg){dbgPut("REDOバッファが空")};
        return;
    };
        //REDOバッファが空
    if(typeof redoOffset == 'undefined') redoOffset = 1;
while(redoOffset>0){
if(dbg) {dbgPut("undoPt:"+this.undoPt+"\n:"+this.undoStack[this.undoPt].join("\n"))};
    this.inputFlag="redo";
    var putResult=this.put();
    if(putResult){
if(dbg) {dbgPut("putResult:\n"+putResult)};
//            this.selectCell(putResult[0]);
//            this.selection (putResult[1]);
//            this.selection ();
    }
    redoOffset --;
}
};

/*    ヤンクバッファに選択範囲の方向と値を退避    */
xUI.yank=function(){
    this.yankBuf.direction=xUI.Selection.slice();
    this.yankBuf.body=this.getRange();
};

/*    xUI.actionRange(limit)
引数:limit:[c,f]
戻値:[[TrackStartAddress,FrameStartAddress],[TrackEndAddress,FrameEndAddress]]
    現在のUI上の操作範囲の抽出
     引数は、制限範囲を絶対量で与える。通常は入力データサイズ
    省略可能　省略時は選択範囲と同一
    指定時は、UNDOバッファ消費を押さえるために制限範囲と選択範囲の重なる部分を返す
    [0,0]が指定された場合は、該当セルのみを返すので開始終了アドレスが同一
    戻値は絶対座標で[左上座標、右下座標]の形式

*/
xUI.actionRange    =function(limit){
    if (! limit) limit=this.Selection.slice();
if(false){
//レイヤ操作範囲
//開始アドレスは、選択範囲と制限範囲のうち絶対値の小さい方で
    var TrackStartAddress    =(limit[0]<0)?limit[0]+this.Select[0]: this.Select[0];
    var RangeWidth    =Math.abs(limit[0]);
    var TrackEndAddress=TrackStartAddress+RangeWidth;
//フレーム操作範囲
    var FrameStartAddress    =(limit[1]<0)?this.Select[1]+limit[1]:this.Select[1];
    var RangeHeight    =Math.abs(limit[1]);
    var FrameEndAddress    =    FrameStartAddress+RangeHeight;
}else{
//レイヤ操作範囲
/*
//開始アドレスは、選択範囲と制限範囲のうち絶対値の小さい方で
//
    if((limit[0]*this.Selection[0])<0){
//
        var ColumnAddress=[0,0];
    }else{
        var ColumnAddress=[0,(Math.abs(limit[0])<Math.abs(this.Selection[0]))?limit[0]:this.Selection[0]];
        if(ColumnAddress[1]<0){ColumnAddress.reverse();}
    }
    if((limit[1]*this.Selection[1])<0){
        var FrameAddress=[0,0];
    }else{
        var FrameAddress=[0,(Math.abs(limit[1])<Math.abs(this.Selection[1]))?limit[1]:this.Selection[1]];
        if(FrameAddress[1]<0){FrameAddress.reverse();}
    }
*/
    
//    var TrackStartAddress    =(limit[0]<0)? (Math.abs(limit[0])<Math.abs(this.Selection[0]))?limit[0]+this.Select[0]:this.Selection[0]+this.Select[0]: this.Select[0];
    var TrackStartAddress    =(this.Selection[0]<0)? this.Selection[0] + this.Select[0]:this.Select[0];//左側の座標をとる
// if(isNaN(TrackStartAddress)){alert("Selection :"+this.Selection +"/ Select :"+this.Select)}
    var RangeWidth    =(Math.abs(limit[0])<Math.abs(this.Selection[0]))? Math.abs(limit[0]):Math.abs(this.Selection[0]);
//            引数と比較して小さいほう
    var TrackEndAddress    = TrackStartAddress+RangeWidth;
    if(TrackStartAddress<0) TrackStartAddress=0;//スタートアドレスが負数になったらクリップ（移動処理のため可能性がある）
    if (TrackEndAddress>this.SheetWidth) TrackEndAddress=this.SheetWidth;//トラック数以内にクリップ

//フレーム操作範囲
    var FrameStartAddress    =(this.Selection[1]<0)? this.Select[1] + this.Selection[1]: this.Select[1];
    var RangeHeight    =(Math.abs(limit[1])<Math.abs(this.Selection[1]))? Math.abs(limit[1]):Math.abs(this.Selection[1]);
//            引数と比較して小さいほう
    var FrameEndAddress    = FrameStartAddress+RangeHeight;
    if(FrameStartAddress<0) FrameStartAddress=0;//スタートアドレスに負数ならばクリップ
    if (FrameEndAddress>=this.XPS.duration()) FrameEndAddress=this.XPS.duration()-1;//継続時間内にクリップ
}
//配列で返す
//return [add(this.Select,[ColumnAddress[0],FrameAddress[0]]),add(this.Select,[ColumnAddress[1],FrameAddress[1]])];

    return [[TrackStartAddress,FrameStartAddress],[TrackEndAddress,FrameEndAddress]];
};

/*    xUI.getRange(Range:[[startC,startF],[endC,endF]])
    指定範囲内のデータをストリームで返す
    指定がない場合は、現在の選択範囲

ホットポイントの取得ルーチン

フォーカス    [C,F]

selection    [c,f]

ホットポイント    [(c>0)?C:C+c,(f>0)?F:F+f]
データRange    [Math.abs(c),Math.abs(f)]


*/
xUI.getRange    =function(Range)
{
    if (! Range) Range=this.actionRange();//指定がなければ現在の操作範囲を設定
// UNDOデータ拾いだしのために作成されたが編集全般に便利
// ストリームで返す
    return this.XPS.getRange(Range);
};


/*    xUI.putReference(dataStream[,direction])
引数
    :dataStream    シートに設定するデータ　単一の文字列　またはXpsオブジェクト または　配列　省略可
    :direction    データ開始位置ベクトル　配列　省略可　省略時は[0,0]
      参照シートに外部から値を流し込むメソッド
        xUI.putReference(データストリーム)
        読み込み時も使用
    xUI.put オブジェクトの機能サブセット
    undo/redo処理を行わない
    xUI.putのラッパ関数
*/
xUI.putReference    =function(datastream,direction){
    xUI.put(datastream,direction,true);
}
/*    xUI.put(dataStream[[,direction],toReference])
引数
    :dataStream     シートに設定するデータ　単一の文字列　またはXpsオブジェクト または　配列　省略可
    :direction      データ開始位置ベクトル　配列　省略可　省略時は[0,0]
    :toReference    ターゲットオブジェクト切り替えフラグ
    シートに外部から値を流し込むメソッド
        xUI.put(データストリーム)
        読込み時にも使用
    Xps.put オブジェクトメソッドに対応
    undo処理は戻り値から書き換えに成功した範囲と書き換え前後のデータが取得できるのでその戻値を利用する
    このメソッド内では、選択範囲方向の評価を行わないためフォーカス／セレクションは事前・事後に調整を要する場合がある
    選択範囲によるクリップはオブジェクトメソッドに渡す前に行う必要あり
    
    グラフィックレイヤー拡張によりシート上の画像パーツを更新する操作を追加
    Xps更新後に、xUI.syncSheetCell()メソッドで必要範囲を更新

    グラフィック描画queueを設置してキューに操作を追加してから更新メソッドをコールする形に変更する
    更新メソッドはキューを処理して不用な描画をスキップするようにする（未実装20170330）

    マクロ展開後には同様に必要範囲内のフットマーク再表示を行う
    
    参照エリアに対する描画高速化のために、このメソッドでリファレンスの書換をサポートする
    引数に変更がなければ従来動作　フラグが立っていればリファレンスを書換
    リファレンス操作時はundo/redoは働かない

    再描画抑制undoカウンタを設置
    カウンタの残値がある限り再描画をスキップしてカウンタを減算する
*/
xUI.put = function(datastream,direction,toReference){
  if(! toReference) toReference = false;
  if((xUI.viewOnly)&&(! toReference)) return xUI.headerFlash('#ff8080');//入力規制時の処理

  var targetXps= (toReference)? xUI.referenceXPS:xUI.XPS;
  
  var selectBackup = [this.Select.concat(),this.Selection.concat()];//カーソル配置をバックアップ
  
  if(typeof datastream == "undefined") datastream="";
  if(typeof direction  == "undefined") direction=[0,0];
  if(! toReference){
//  undo/redo 事前処理
    switch (this.inputFlag){
    case "redo":        this.undoPt++             ;   //REDO処理時
    case "undo":                                  ;   //UNDO処理時
        var undoTarget   = this.undoStack[this.undoPt];    //処理データ取得
// undo内容をオブジェクトメソッドでputするためにホットポイントを作成する
// ホットポイント設定
        var hotPoint=[
            (undoTarget[1][0]>0)?undoTarget[0][0]:undoTarget[0][0]+undoTarget[1][0],
            (undoTarget[1][1]>0)?undoTarget[0][1]:undoTarget[0][1]+undoTarget[1][1]
        ]
        this.selection();//セレクション解除
        this.selectCell(hotPoint);//ターゲットのシートセルにフォーカス
        datastream=undoTarget[2];
            break;
    default:              ;//通常のデータ入力
                        ;//NOP
    }
  };
/*
処理データが、Xpsオブジェクトだった場合は、現在のXPS（編集対象データ全体）を複製してUndoバッファに格納
その後引数オブジェクトでXPSを初期化する

    datastream の形式

やりとりするデータの基本形式は、コンマ区切り文字列
フレーム方向のストリームで、改行で次のレイヤに移動
制御トークン等は無し　データのみ
    '1,,,2,,\n1,,,,,\n"x",,,,,\n'

Xpsオブジェクトの際は、シート全体を入れ替え
構造変更や大規模な変更をまとめる際はこの方法を推奨

データテーブル以外の各プロパティは、配列を使用して指定
配列は[プロパティ名称,値]　で　UNDOスタックには[プロパティ名称,変更前の値]　を積む
2015.09.14　修正

    07/08/07    undoGroup着手

グループフラグが立っていたらグループカウントをかける

グループカウント中はグループID付きのputを受け付けて。
シート全体のコピーをとってそちらの編集を行う

カウント中はundoに値を積まない。undoポインタも固定する。
フラグがendGroupになるか、通常のputを受け取った時点で解除
コピーした配列から変更範囲全体をXPSに流し込んで、UNDOを更新する。
こんな予定、でもまだやってない

undoGroupは優先度低い　ほぼいらないような気がするのでまあアレだ
2015.09.14 

undoスタックに格納する値は
[Select],[Selection],[dataBody],[カーソル位置,選択範囲]
dataBodyは データストリーム,Xpsオブジェクト,またはプロパティの配列
プロパティ配列のフォーマットは後記
第４要素のカーソル位置と選択範囲はオプション

*/
    var lastAddress=this.Select.slice();//最終操作アドレス初期化
    if(!toReference){
//UNDO配列
    var UNDO=new Array(3);
        UNDO[0]    =this.Select.slice();
        UNDO[1]    =this.Selection.slice();
    }
if(this.edmode >= 2){
    UNDO[3]=[this.floatSourceAddress.concat(),this.selectionBackup.concat()];
};
/*    入力データを判定    */
if(datastream instanceof Xps){
/*    Xpsならばシートの入れ替えを行う。現在のシート複製をundoStackに格納　*/
    if(toReference){
//入力データをXPSに設定   
        xUI.resetSheet(undefined,datastream);//リファレンス更新
    }else{
        var prevXPS=new Xps();
        prevXPS.readIN(this.XPS.toString());
        UNDO[2]=prevXPS;
//入力データをXPSに設定   
        xUI.resetSheet(datastream);//編集画面更新
    }
}else if(datastream instanceof Array){
/*    引数が配列の場合は、Xps のプロパティを編集する
形式:    [kEyword,vAlue]
    キーワード列とプロパティの対応リストは以下を参照
    キーワードは基本的にプロパティ文字列　"parent""stage"等
    タイムラインコレクションの個別プロパティは　"id.1.xpsTracks"等の"."接続した倒置アドレスで指定

//        Xps標準のプロパティ設定
    parent      ;//親Xps参照用プロパティ　初期値はnull（参照無し）編集可
    stage       ;//初期化の際に設定する　編集不可
    mapfile     ;//初期化の際に設定する　編集不可
    opus        ;//編集対象
    title       ;//編集対象
    subtitle    ;//編集対象
    scene       ;//編集対象
    cut         ;//編集対象
    trin        ;//編集対象(ドキュメント構成変更)
    trout       ;//編集対象(ドキュメント構成変更)
    rate        ;//編集対象(ドキュメント構成変更)
    framerate   ;//編集対象(ドキュメント構成変更)
    create_time ;//システムハンドリング　編集不可
    create_user ;//システムハンドリング　編集不可
    update_time ;//システムハンドリング　編集不可
    update_user ;//システムハンドリング　編集不可

    xpsTracks   ;タイムラインコレクション　構成変更のケースと内容変更の両ケースあり
                ;コレクションのエントリ数が変更になる場合は全て構成変更　それ以外は内容編集

xpsTimelineTrackオブジェクトのプロパティ
    noteText    ;//編集対象
    
    id      ;//識別用タイムラインラベル　編集対象
    sizeX   ;//デフォルト幅 point    編集対象（編集価値低）
    sizeY   ;//デフォルト高 point    編集対象（編集価値低）
    aspect  ;//デフォルトのpixelAspect　編集対象（編集価値低）
    lot     ;//map接続データ　編集禁止（編集価値低）
    blmtd   ;//セレクター利用　
    blpos   ;//セレクター利用　
    option  ;//セレクター利用 トラック種別変更時はセクションキャッシュをクリア
    link    ;//セレクター利用　
    parent  ;//セレクター利用　


*/
    var myTarget= datastream[0].split(".");
//    新規設定値    datastream[1];
//現在のプロパティの値をバックアップして新規の値をセット
    if(myTarget.length>1){
//ターゲットの要素数が1以上の場合はタイムラインプロパティの変更
//        UNDO[2]=[入力ターゲット複製,現在値];
        UNDO[2]=[datastream[0],targetXps.xpsTracks[myTarget[1]][myTarget[0]]];
        targetXps.xpsTracks[myTarget[1]][myTarget[0]]=datastream[1];//入力値を設定
        if(myTarget[0] =="option"){targetXps.xpsTracks[myTarget[1]].sectionTrust = false;}
    }else{
//単独プロパティ変更
        UNDO[2]=[datastream[0],targetXps[myTarget[0]]];
        targetXps[myTarget[0]]=datastream[1];
    }
    if(toReference){
        xUI.resetSheet(undefined,targetXps);
    }else{
        xUI.resetSheet(targetXps);
    }
}else if(this.inputFlag != "move"){
/*
    move時は、データ処理が煩雑なのでこのメソッド内では処理しない
    2015.09.19
*/
//通常のデータストリームを配列に変換
        var srcData=String(datastream).split("\n");
        for (var n=0;n<srcData.length;n++){
            srcData[n]=srcData[n].split(",");
        }
//配列に変換(済) ソースからデータのサイズと方向を出す。
    var sdWidth    =Math.abs(srcData.length-1);
    var sdHeight    =Math.abs(srcData[0].length-1);
//データ処理範囲調整
    if (this.Selection.join() != "0,0"){
//セレクションあり。操作範囲を取得
        var actionRange=this.actionRange([sdWidth,sdHeight]);
//カレントセレクションの左上端から現在の配列にデータを流し込む。
        var TrackStartAddress=actionRange[0][0];//    左端
        var FrameStartAddress=actionRange[0][1];//    上端
//セレクションとソースのデータ幅の小さいほうをとる
        var TrackEndAddress=actionRange[1][0];//    右端
        var FrameEndAddress=actionRange[1][1];//    下端
    } else {
//セレクション無し
        var TrackStartAddress= this.Select[0];//    左端
        var FrameStartAddress= this.Select[1];//    上端
//シート第2象限とソースデータの幅 の小さいほうをとる
        var TrackEndAddress=((xUI.SheetWidth-this.Select[0])<sdWidth)?
    (this.SheetWidth-1):(TrackStartAddress+sdWidth)    ;//    右端
        var FrameEndAddress=((targetXps.duration()-this.Select[1])<sdHeight)?
    (targetXps.duration()-1):(FrameStartAddress+sdHeight)    ;//    下端
    };
//バックアップは遅延処理に変更・入力クリップをここで行う
        var Tracklimit=TrackEndAddress-TrackStartAddress+1;
        var Framelimit=FrameEndAddress-FrameStartAddress+1;
    if(srcData.length>Tracklimit){srcData.length=Tracklimit};
    if(srcData[0].length>Framelimit){for (var ix=0;ix<srcData.length;ix++){srcData[ix].length=Framelimit}};
//入力値をオブジェクトメソッドで設定
    switch(this.inputFlag){
    case "redo":
    case "undo":
    default:
        this.selectionHi("clear");//選択範囲のハイライトを払う
        var putResult=targetXps.put([TrackStartAddress,FrameStartAddress],srcData.join("\n"));
        this.syncSheetCell([TrackStartAddress,FrameStartAddress],[TrackEndAddress,FrameEndAddress],toReference);
    }
//設定値に従って、表示を更新（別メソッドにしてフォーカスを更新）
    lastAddress=[TrackEndAddress,FrameEndAddress];
/*UNDO配列を作成 Xps.put()メソッド以外は、各オブジェクトで*/
    if((! toReference)&&(putResult)){
if(dbg){dbgPut("XPS.put :\n"+putResult.join("\n"));}
//        UNDO[0]=putResult[0][0];//レンジが戻るので左上を設定する
//        UNDO[1]=sub(putResult[0][1],putResult[0][0]);//セレクションに変換
//        UNDO[1]=[0,0];//通常処理は選択解除で記憶
        UNDO[2]=putResult[2];//入れ替え前の内容
//処理前のカーソル位置とUNDO[0]が異なっていた場合修正要素を加える
//        if(UNDO[0].join()!=selectBackup[0].join()) UNDO[3]=selectBackup;
    }
}

//  if(this.undoStack[this.undoPt][0].join()!=selectBackup[0].join()) this.undoStack[this.undoPt][3]=selectBackup;
  if(! toReference){
//操作別に終了処理
switch (this.inputFlag){
case "undo":
case "redo":
        this.undoStack[this.undoPt][2]=UNDO[2];    //UNDO処理時
if(undoTarget.length>=4){
//第４要素がある場合のみredo用のデータを設定して、カーソル復帰処理を行う
    var currentAddress =undoTarget[3][0].slice();
    var currentRange   =undoTarget[3][1].slice();
    if(this.undoStack[this.undoPt][0].join()!=selectBackup[0].join()) this.undoStack[this.undoPt][3]=selectBackup;
    this.selection (add(this.Select,currentRange));
    this.selectCell(currentAddress);
}else{
    this.selection(add(undoTarget[0],undoTarget[1]));
    this.selectCell(undoTarget[0].join('_'));
};
        if(this.inputFlag=="undo") this.undoPt--;
        break;
case "nomal":   ;//通常のデータ入力
case "cut":     ;
  if(datastream instanceof Xps){
    this.selectCell("1_0");//
  }else{
//一行入力の際のみ処理後のスピン操作で次の入力位置へ移動できるポジションへ
//( = マクロ展開時に画面処理を行う)
    if(putResult){
if(dbg){
   dbgPut(putResult[0]+":"+add(putResult[0][1],[0,-(this.spinValue-1)]).join("_"));
}
      if(xUI.footMark){ this.selection(putResult[0][1]) };
      this.selection();
      if (selectBackup[1][1]>0){
        this.selectCell(([selectBackup[0][0],selectBackup[0][1]+selectBackup[1][1]]).join("_"));
      }else{
        this.selectCell(putResult[0][1].join("_"));//操作なしに最終アドレスへ
      }
    }
  }
case "move":
default:    ;//カット・コピー・ペースト操作の際はカーソル移動無し
        this.undoPt++;
        this.undoGc=0;
if(dbg){    dbgPut(    "UNDO stack add:\n"+UNDO.join("\n")); }
        this.undoStack[this.undoPt]=UNDO;
        if (this.undoStack.length>(this.undoPt+1)){ this.undoStack.length=(this.undoPt+1)};
};
    this.inputFlag="nomal";
// undoバッファの状態を表示
    sync("undo");sync("redo");
//編集バッファをクリア・編集フラグを下げる(バッファ変数をモジュールスコープに変更したので副作用発生)
    if(this.edchg){ this.edChg(false) };
    if(this.eXMode==1){this.eXMode=0;this.eXCode=0;};//予備モード解除
  }
// 処理終了アドレスを配列で返す(使わなくなったような気がする)
return [[TrackStartAddress,FrameStartAddress],lastAddress];
//処理終了時に記述修飾の同期を行う場合は、リターンの前に処理を行う
};
/*xUI.syncSheetCell(startAddress,endAddress,isReference)
    指定されたレンジのシートセルの内容を更新
    指定がない場合は、シート全て
    アドレス一致の場合は、一コマのみ
*/
xUI.syncSheetCell=function(startAddress,endAddress,isReference){
    if(this.skipCt > 0) {this.skipCt --;return;};//?
    var targetXps=(isReference)? this.referenceXPS:this.XPS;
    if((! startAddress)||(! endAddress)){
        startAddress=[0,0];
        endAddress  =[targetXps.xpsTracks.length-1,targetXps.xpsTracks.duration-1];
    }
    var TrackStartAddress =startAddress[0];
    var TrackEndAddress   =  endAddress[0];
    var FrameStartAddress =startAddress[1];
    var FrameEndAddress   =  endAddress[1];
//設定値に従って、表示を更新（別メソッドにしたい）
    for (r=TrackStartAddress;r<=TrackEndAddress;r++){
        for (f=FrameStartAddress;f<=FrameEndAddress;f++){
if((r>=0)&&(r<targetXps.xpsTracks.length)&&(f>=0)&&(f<targetXps.xpsTracks.duration)){
//シートデータを判別してGraphicシンボル置き換えを判定（単純置き換え）
//        配置データが未設定ならば<br>に置き換え
//            var td=(this.XPS.xpsTracks[r][f]=='')?"<br>" : this.trTd(this.XPS.xpsTracks[r][f]) ;
            var sheetCell=(isReference)? document.getElementById(["r",r,f].join("_")):document.getElementById([r,f].join("_"));
            if(sheetCell instanceof HTMLTableCellElement){
                if(document.getElementById(sheetCell.id)){xUI.Cgl.remove(sheetCell.id);}
                this.drawSheetCell(sheetCell);//関数内でシートセルを書き換える（同期処理）
//                var td=(targetXps.xpsTracks[r][f]=='')? "<br>" : this.trTd(targetXps.xpsTracks[r][f]) ;
//        シートテーブルは必要があれば書き換え
//                if (sheetCell.innerHTML!= td){ if(dbg) console.log(sheetCell.innerHTML);sheetCell.innerHTML=td;}
            }
//本体シート処理の際のみフットスタンプ更新
  if(! isReference){
//変更されたデータならフットスタンプ処理
    if (this.diff[r,f]){
            lastAddress=[r,f] ;        //最終入力操作アドレス控え
            var footstamp =(this.footMark)? 
            this.footstampColor:this.sheetbaseColor;//踏むぞー
            this.Select=([r,f]);
        //各ブラウザで試験して判定文字列を変更(未処置)
            if (document.getElementById(r+"_"+f).style.backgroundColor!=footstamp)
            document.getElementById(r+"_"+f).style.backgroundColor=footstamp; //セレクト位置を踏む！
    }else{
    //否変更なので、背景色がフットスタンプならフットスタンプを消す。
        //各ブラウザで試験して判定文字列を変更(未処置)
        if (document.getElementById(r+"_"+f).style.backgroundColor!=this.sheetbaseColor && this.footMark)
        document.getElementById(r+"_"+f).style.backgroundColor=this.sheetbaseColor; //踏み消す
    };
  }
}
        };
    };
    setTimeout(function(){xUI.Cgl.refresh([startAddress,endAddress],isReference)},0);//非同期処理
}
//syncSheetCell シートセルの表示を編集内容に同期させる　
/**
    リファレンス領域と編集領域のデータが異なっているか否かを返す関数
    標準で[トラックid,フレーム]を配列で、又は ID文字列"trc_frm"
    それ以外はXPSのプロパティ名(id)とみなす オブジェクト渡しは禁止
    指定IDの比較データが存在しない場合は、常にfalseを返す
*/
xUI.diff=function(target){
    if(String(target).match(/^\d+_\d+$/)){target = target.split('_');}
    if(target instanceof Array){
         if (
            (typeof this.XPS.xpsTracks[target[0]]                       == 'undefined')||
            (typeof this.referenceXPS.xpsTracks[target[0]]              == 'undefined')||
            (typeof this.XPS.xpsTracks[target[0]][target[1]]            == 'undefined')||
            (typeof this.referenceXPS.xpsTracks[target[0]][target[1]]   == 'undefined')
        ) return false;
        return (this.XPS.xpsTracks[target[0]][target[1]] != this.referenceXPS.xpsTracks[target[0]][target[1]]);
    }else{
        return (this.XPS[target] != this.referenceXPS[target]);
    }
}
//バックアップデータ入出力method作成
xUI.bkup    =function(Datas){
if (! Datas){return this.Backupdata[0]};
if (Datas.length==0){return this.Backupdata[0]}else{this.Backupdata=Datas;return true;};
};
/*
UI関数群
    これも、xUIのメソッドに

*/
/*=====================================*/

//メッセージをアプリケーションステータスに出力する。 引数なしでクリア
xUI.printStatus    =function(msg,prompt){
    if(! msg){msg="<br />"};
    if(! prompt){prompt=""};
    var bodyText=(prompt+msg);
    document.getElementById("app_status").innerHTML=bodyText.replace(/\n/g,"<br>");
}
//キーダウンでキー入力をサバく
//IEがプレスだとカーソルが拾えないようなのでキーダウン
xUI.keyDown    =function(e){
//フォーカスされたテーブル上の入力ボックスのキーダウンを検出
	key = e.keyCode;//キーコードを取得
	this.eddt = document.getElementById("iNputbOx").value;
	var interpKey=110;
//      console.log(key+':down:');
	switch(key) {
case	25	:if(! Safari) break;
case	9	:	//tab
if (! this.tabSpin) {
	if(!this.edchg) return;
	this.put(this.eddt);
	return false;break;
}
case	13	:		//Enter 標準/次スピン・シフト/前スピン・コントロール/interpSpin
	if(xUI.edmode>=2){
// 区間編集中
	    if(e.shiftKey){
	      if((e.ctrlKey)||(e.metaKey)){
	        if(xUI.edmode==3) this.sectionUpdate();
	        this.mdChg('normal');                           //[ctrl]+[shift]+[ENTER]:モード解除
	      }else{
	        this.mdChg('float');	                        //[shift]+[ENTER]:float遷移
	      }
	    }else if((e.ctrlKey)||(e.metaKey)){
            if(xUI.edmode==3) this.sectionUpdate();                           //[ctrl]+[ENTER]:確定のみ
	    }else{
	        if(xUI.edmode==3) this.sectionUpdate();
	        this.mdChg((xUI.edmode==3)?'section':'normal'); //[ENTER]:確定してモード遷移
	    }
	    return false;//スピン動作キャンセルのためここでリターン
    } else {
	    if((e.shiftKey)&&((e.ctrlKey)||(e.metaKey))){
	        xUI.mdChg('section');	               //[ctrl]+[shift]+[ENTER]:カーソル位置でモード遷移
	        return false;//スピン動作キャンセルのためここでリターン
	    }
/*   
     if(e.shiftKey){
	    }else{
	        interpSign();                           //[shift]+[ENTER]:中間値サイン
	    }
	}
*/	
	  if (this.edchg){
		this.put(nas_expdList(this.eddt));//更新
		this.selectCell(add(this.Select,[0,1]));//入力あり
	  }else{
	    if(e.shiftKey){
		if(expd_repFlag){
			this.spin("up");expd_repFlag=false;     //<マクロ展開中>[shift]+[ENTER]:スピンアップ
		}else{
			this.spin("back");                      //[shift]+[ENTER]:スピンバック
		}
	    }else{
		  if(expd_repFlag){
		    this.spin("down");expd_repFlag=false;   //<マクロ展開中>[ENTER]:スピンダウン
		  }else{
			this.spin("fwd");                       //[ENTER]:スピンフォワード
		  }
	    };
//処理終了時にコントロール（メタ）キーの同時押しがない場合は選択範囲を解除
	    if((! e.ctrlKey)&&(! e.metaKey)){
		if(this.getid("Selection")!="0_0")
			{this.selection();this.spinHi();};//選択範囲解除
	    }
	  }
	}
	return false;
	break;
case	27	:	//esc 選択範囲解除
//		編集中
	if (this.edchg){return false;}//バックアップ復帰のためスキップ(実処理はUP)
//      区間操作中
    if(this.edmode == 3 ){
//        this.selection(add(this.Select,this.selection));
        this.selectCell(this.floatSourceAddress);
        this.mdChg('section');
       break;
    } else if(this.edmode == 2 ){
	    if((e.ctrlKey)||(e.metaKey)){
            this.undo(this.floatUpdateCount);//まとめて開始点までUNDO
            this.mdChg('normal');
            this.selectCell();//編集を解除してバックアップ状態へ復帰
            this.selection(add(this.selectBackup,this.selectionBackup));
        }else{
            this.mdChg('normal');
            this.selection();
        }
        break;
    }
//		複数セレクト状態 
	if(this.getid("Selection")!="0_0")
		{this.selection();this.spinHi();break;};//選択範囲解除
		return false;break;//標準処理(NOP)

//case 32	:		//space 値を確定してフォーカスアウト
//	this.edchg=false;
//	this.focusCell();	break;
case	38	:		//カーソル上・下
case	40	:		//
/*
    通常編集時
        [shift]+[↑]/[↓] セレクションの調整
        [ctrl]+[shift]+[↑]/[↓]  セレクションの調整にスピン量の調整も兼ねる
    区間編集時
        [↑]/[↓] 全体移動に遷移
        [ctrl] +[↑]/[↓] 先頭移動に遷移
        [shift]+[↑]/[↓] 末尾移動に遷移
        [ctrl]+[shift]+[↑]/[↓]  現在の編集を確定して選択している区間を前後の区間に変更？
    区間フロート時
        [↑]/[↓] モードに従って移動
 */
		    var kOffset=(key==38)? -1:1;
//    if ( this.edmode == 3){		    this.sectionPreview(this.Select[1]+kOffset);}else
    if ( this.edmode == 3){
 	   if (	e.shiftKey &&
		    this.Select[1]+this.Selection[1]>=0 &&
		    this.Select[1]+this.Selection[1]<(this.XPS.duration()-1)
	    ){
	        this.sectionManipulateOffset=['tail',0];
//		    this.sectionPreview((this.Select[1]+this.Selection[1]+kOffset));
//		    if((e.ctrlKey)||(e.metaKey)) ;
		}else if(((e.ctrlKey)||(e.metaKey)) &&
		    this.Select[1]+this.Selection[1]>=0 &&
		    this.Select[1]+this.Selection[1]<(this.XPS.duration()-1)
		){
	        this.sectionManipulateOffset=['head',0];
	    }else{
		//通常移動処理
//	    if(! e.ctrlKey){
//		    if(this.getid("Selection")!="0_0"){this.selection();this.spinHi();};//選択範囲解除
//	    }
//		    if (this.edchg){this.put(this.eddt);}//更新
	        this.sectionManipulateOffset=['body',0];
//		    if(key==38){this.spin("up")}else{this.spin("down")};
	    };        
		    this.sectionPreview(this.Select[1]+kOffset);
//		    this.sectionUpdate();
/*		    
            var trackContents = xUI.floatTrack.sections.manipulateSection(xUI.floatSectionId,xUI.Select[1],xUI.Selection[1]);
    　if(false){
//undo保留の場合は上のルーチン
            xUI.XPS.put([xUI.Select[0],0],trackContents);
            xUI.syncSheetCell([xUI.Select[0],0],[xUI.Select[0],xUI.XPS.xpsTracks[0].duration]);
      }else{
            var currentFrame=xUI.Select[1];
            var currentSelection=xUI.Selection[1];
            xUI.selectCell([xUI.Select[0],0]);
            xUI.selection();
            xUI.put(trackContents);
            xUI.selectCell([xUI.Select[0],currentFrame]);
            xUI.selection([xUI.Select[0],currentFrame+currentSelection]);
      }
*/
    }else if(this.edmode == 2){
 	   if (	e.shiftKey &&
		    this.Select[1]+this.Selection[1]>=0 &&
		    this.Select[1]+this.Selection[1]<(this.XPS.duration()-1)
	    ){
	        this.sectionManipulateOffset=['tail',0];
		}else if(((e.ctrlKey)||(e.metaKey)) &&
		    this.Select[1]+this.Selection[1]>=0 &&
		    this.Select[1]+this.Selection[1]<(this.XPS.duration()-1)
		){
	        this.sectionManipulateOffset=['head',0];
	    }else{
		//通常移動処理
	    };
	    this.mdChg('float');         
    }else{
 	   if (	e.shiftKey &&
		    this.Select[1]+this.Selection[1]>=0 &&
		    this.Select[1]+this.Selection[1]<(this.XPS.duration()-1)
	    ){
		    var kOffset=(key==38)? -1:1;
		    this.selection(this.Select[0]+"_"+
		    (this.Select[1]+this.Selection[1]+kOffset));
		    if((e.ctrlKey)||(e.metaKey)||(this.spinSelect)) this.spin("update");
	    }else{
		//通常入力処理
	    if((! e.ctrlKey)&&(! e.metaKey)){
		    if(this.getid("Selection")!="0_0"){this.selection();this.spinHi();};//選択範囲解除
	    }
		    if (this.edchg){this.put(this.eddt);}//更新
		    if(key==38){this.spin("up")}else{this.spin("down")};
	    };
	};
	return false;	break;
case	39	:		//右[→]
case	37	:		//左[←]
	if ((this.edmode < 2)&&((! this.edchg)||(this.viewOnly))) {
	    if(key==37) {this.spin("left")} else {this.spin("right")};
	    return false;
	}else{
	    return true;
	};	break;
case 	33:		//ページアップ
	if (this.edchg){this.put(this.eddt);}//更新
	this.spin("pgup");return false;	break;
case 	34:		//ページダウン
	if (this.edchg){this.put(this.eddt);}//更新
	this.spin("pgdn");return false;	break;
case	35 :;//[END]
	this.selectCell(this.Select[0]+"_"+this.XPS.duration());
	break;
case	36 :;//[HOME]
	this.selectCell(this.Select[0]+"_0");
	break;
case	65 :		;	//[ctrl]+[A]/selectAll
 	if ((e.ctrlKey)||(e.metaKey))	{
		this.selectCell(this.Select[0]+"_0");
		this.selection(
			this.Select[0]+"_"+this.XPS.duration()
		);
		return false;}else{return true}
	break;
case	67 :		;	//[ctrl]+[C]/copy
	if ((e.ctrlKey)||(e.metaKey))	{
		this.yank();
		return false;}else{return true}
	break;
/*
case	79 :		;	//[ctrl]+[O]/ Open Document
	if ((e.ctrlKey)&&(! e.shiftKey))	{
		this.openDocument();
		return false;}else{return true}
	break;
case	83 :	alert("SSS");	//[ctrl]+[S]/ Save or Store document
	if (e.ctrlKey) {
		 if(e.shiftKey){this.storeDocument("as");}else{this.storeDocument();}
		return false;
	}else{
		return true
	}
	break;
*/
case	86 :		;	//[ctrl]+[V]/paste
	if ((e.ctrlKey)||(e.metaKey))	{
		this.paste();
		return false;}else{return true}
	break;
case	88 :		;	//[ctrl]+[X]/cut
	if ((e.ctrlKey)||(e.metaKey))	{
		this.cut();
		return false;}else{return true}
	break;
case	89 :		;	//[ctrl]+[Y]/redo
	if ((e.ctrlKey)||(e.metaKey))	{
		this.redo();
		return false;}else{return true}
	break;
case	90 :		;	//[ctrl]+[Z]/undo
	if ((e.ctrlKey)||(e.metaKey))	{
		this.undo();
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
	if(! this.edchg) {
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
case 8	:	this.spin("bs");	break;	//bs NOP
case 46	:	this.spin("del");	break;	//del 
case  :	window.status="[]";	break;	//
*/
default :	return true;
	}
//return false;
}
/*
if(false){    if(this.Mouse.action){return false};//マウス動作優先中
//フォーカスされたテーブル上の入力ボックスのキーダウンを検出
//window.status = e.keyCode+'/'+String.fromCharCode(e.keyCode)
//    alert(e.KeyCode)
    key = e.keyCode;//キーコードを取得
    this.eddt = document.getElementById("iNputbOx").value;
alert(this.eddt);
//    var eddt = document.getElementById("iNputbOx").value;
    switch(key) {
case    25    :if(! Safari) break;
case    9    :    ;//tab
if(! this.tabSpin){
    if(!this.edchg) return;
    this.put(this.eddt);
    return false;break;
};
case    13    :    ;//Enter 標準/次スピン・シフト/前スピン
alert("xUI.keyDown=ENTER");
    if (this.edchg){this.put(this.eddt);}//更新
    if(e.shiftKey) {this.spin("back")}else{this.spin("fwd")};
//    if(! e.ctrlKey){}
    if(! e.metaKey){
        if (this.Selection.join() != "0,0"){this.selection();this.spinHi();};//選択範囲解除
    };
    return false;
    break;
case    27    :    ;//esc
    if (this.edchg){this.put(this.eddt);}//更新
    if (this.Selection.join() != "0,0"){this.selection();this.spinHi();break;};
        //選択範囲解除
    break;
case    32    :    ;//space 値を確定してフォーカスアウト
    if (this.edchg){this.put(this.eddt);}//更新
//    this.focusCell();
    break;
case    38    :    ;//カーソル上・下
case    40    :    ;//シフト時はセレクション(+スピン)の調整
     if (    e.shiftKey &&
        this.Select[1]+this.Selection[1]>=0 &&
        this.Select[1]+this.Selection[1]<(this.XPS.duration()-1)
    )
    {    var kOffset=(key==38)? -1:1;
        this.selection(this.Select[0]+"_"+
        (this.Select[1]+this.Selection[1]+kOffset));
        this.spin("update");
    }else if(    e.ctrlKey){
        //選択範囲を維持したまま移動
    }else{
//        this.selection();this.spinHi();
if (this.Selection.join() != "0,0"){this.selection();this.spinHi();alert(123)};
    //あれば選択範囲クリアして
        if (this.edchg){this.put(this.eddt);}//更新
        if(key==38){this.spin("up")}else{this.spin("down")};
    }    ;return false;    break;
case    39    :        ;//右
    if (this.edchg){this.put(this.eddt);}//更新
    if (! this.edchg) {this.spin("right")    ;return false;
    }else{
    return true;
    };    break;
case    37    :        ;//左?
    if (this.edchg){this.put(this.eddt);}//更新
     if (! this.edchg) {this.spin("left")    ;return false;
    }else{
    return true;
    };    break;
case    33:        ;//ページアップ
    if (this.edchg){this.put(this.eddt);}//更新
    this.spin("pgup");    break;
case    34:    ;//ページダウン
    if (this.edchg){this.put(this.eddt);}//更新
    this.spin("pgdn");    break;
case    35 :;//[END]
    xUI.selectCell(xUI.Select[0]+"_"+this.XPS.duration());
//    xUI.selectCell(xUI.Select[0]+"_"+this.XPS.duration(),"end");
    break;
case    36 :;//[HOME]
//    xUI.selectCell(xUI.Select[0]+"_0","home");
    xUI.selectCell(xUI.Select[0]+"_0");
    break;
case    65 :        ;    //[ctrl]+[A]/selectAll
     if (e.ctrlKey)    {
    if (this.edchg){this.put(this.eddt);}//更新
        this.selectCell(this.Select[0]+"_0");//selall
        this.selection(this.Select[0]+"_"+this.XPS.duration());
        return false;}else{return true};
    break;
//case    :;//    break;
case    67 :        ;    //[ctrl]+[C]/copy
    if (e.ctrlKey)    {
    if (this.edchg){this.put(this.eddt);}//更新
        this.yank();
        return false;}else{return true};
    break;
case    79 :        ;    //[ctrl]+[O]/ Open Document
    if ((e.ctrlKey)&&(! e.shiftKey))    {
        this.openDocument();
        return false;}else{return true}
    break;
case    83 :    alert("SSS");    //[ctrl]+[S]/ Save or Store document
    if (e.ctrlKey) {
         if(e.shiftKey){this.storeDocument("as");}else{this.storeDocument();}
        return false;
    }else{
        return true
    }
    break;
case    86 :        ;    //[ctrl]+[V]/paste
    if (e.ctrlKey)    {
    if (this.edchg){this.put(this.eddt);}//更新
        this.paste();
        return false;}else{return true};
    break;
case    88 :        ;    //[ctrl]+[X]/cut
    if (e.ctrlKey)    {
    if (this.edchg){this.put(this.eddt);}//更新
        this.cut();
        return false;}else{return true};
    break;
case    89 :        ;    //[ctrl]+[Y]/redo
    if (e.ctrlKey)    {
    if (this.edchg){this.put(this.eddt);}//更新
        this.redo();
        return false;}else{return true};
    break;
case    90 :        ;    //[ctrl]+[Z]/undo
    if (e.ctrlKey)    {
    if (this.edchg){this.put(this.eddt);}//更新
        this.undo();
        return false;}else{return true};
    break;
*/
/* 保留
case     :        ;    //[ctrl]+[]/
case    8    :    this.spin("bs");    break;    //bs NOP
case    46    :    this.spin("del");    break;    //del 
case  :    window.status="[]";    break;    //
*/
/*
default :    return true;
    };
return false;
//return true;
};
*/
/**
//	フォーカスされたテーブル上の入力ボックスのキープレスを検出して
//	動作コントロールのために戻り値を調整

	    フロートモード判定
	フロート（ブロック移動/セクション編集）モードでは、キー動作の入力が制限される。
	最初にモード内動作を判定して処理
	モードを抜けるまでは他の機能に移行できない
	モードイン判定はノーマル入力モードアウト判定はこのルーチン内
-------------------------------------------------ブロック移動：
[↑][↓][→][←][h][j][k][l][8][2][4][6]	移動
[enter][5]			確定>モードアウト
[esc][0]			モードアウト
-------------------------------------------------セクション編集：
[↑]/[↓]             区間移動
[ctrl] +[↑]/[↓]     前端点移動
[shift]+[↑]/[↓]     後端点移動
[enter][5]          確定>モードアウト
[esc][0]            モードアウト

*/
xUI.keyPress = function(e){
	key = e.keyCode;//キーコードを取得
//      console.log(key+':press:');
	if(xUI.edmode>0){
if(xUI.edmode==1){
//ブロック移動モード
}else{
//セクション編集モード
}
	  return true;
	}
/*
	ラピッドモード!=0 分岐処理
	ラピッドキーモードでは、マウスの入力は受け入れない
	0:解除
	1:スタンバイ（導入キーが一度押しされた状態）
	2:ラピッドモード
	
 */
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
		}else{
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
		if(idx<(rapidMode.length-1)/2){
			xUI.doRapid([rapidMode[idx*2+1]]);
			return false;
		}else{
			if (key!=13 && key!=8 && key!=9)
			{
		//モード解除
				if(xUI.eXMode){
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
case	0	:if(Firefox){return true;};//キーコード0を返すコントロールキー群
//  fierfox　が keypress で全てキーコード0:を返す状態になっている　2017.12
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
	if ((e.ctrlKey)||(e.metaKey))	{return false;}else{return true;};
		break;
//case		: ;	//
default :;
	return true;
	}
//return true;
}
//
//xUI.keyPress    =keyPress_ ;
//
//キーアップもキャプチャする。UI制御に必要 今のところは使ってない?
xUI.keyUp = function (e){
	key = e.keyCode;//キーコードを取得
//      console.log(key+':up:');
	if(this.eXMode>=2){
		document.getElementById("iNputbOx").select();
		return false;
	}
	if(false){
//		通常状態なので予備モード遷移判定
	for (idx=0;idx<(rapidMode.length-1)/2;idx++)
	{
		
		if(key==rapidMode[idx*2].charCodeAt(0) && document.getElementById("iNputbOx").value.length==1)
		{
			this.eXMode=1;this.eXCode=key;break;//予備モードに入る
		}
	}
}
;
//	通常処理 入力コントロールとバックアップが食い違っているので編集中フラグON
	if(this.bkup()!=document.getElementById("iNputbOx").value){
if(dbg)document.getElementById("app_status").innerHTML=this.bkup()+" <> "+document.getElementById("iNputbOx").value;
	if(! this.edchg) this.edChg(true);//変更されていたらフラグ立て
	};
	switch(key) {
case  27:	;	//esc

	if(this.edchg){this.edChg(false);}
//		document.getElementById("iNputbOx").value=this.bkup();
		syncInput(this.bkup());
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
	if(this.viewOnly) return false;
	if(!this.edchg) document.getElementById("iNputbOx").select();
//	if(!this.edchg) document.getElementById("iNputbOx").focus();
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
	if ((e.ctrlKey)||(e.metaKey))	{
		return true;
	}
		break;
//case 110:;//.テンキー
//case 190:;//.>
//	if(!this.edchg) document.getElementById("iNputbOx").select();

//break;
//case 99 :	;	//[C]copy	このあたりは横取り
//case 118 :	;	//[V]paste
//case 120 :	;	//[X]cut	しないほうが良い?
case 8	:	;	//bs NOP
default :
//if(! this.edchg) this.edChg(true);
if(this.Select[0]>0){syncInput(document.getElementById("iNputbOx").value);};
	return true;
	}
return true;
}
//
//xUI.keyUp    =    keyUp_    ;
//
/*    xUI.Mouse(e)
引数:    e    マウスイベント
戻値:        UI制御用
    マウス動作
マウス処理を集中的にコントロールするファンクション
 */
xUI.Mouse=function(e){
//    console.log(e.target.id);
//    if(e.target.id=='dialogEdit'){return false};
    if((this.edmode==3)&&(e.target.id=='sheet_body')&&(e.type=='mouseout')){
        xUI.sectionUpdate();
        this.mdChg(2);
        this.Mouse.action=false;
        return false;
    };
if(dbg) dbgPut(e.target.id+":"+e.type.toString());
//document.getElementById("iNputbOx").focus();

if(this.edchg){ this.eddt= document.getElementById("iNputbOx").value };
//IEのとき event.button event.srcElement
//    if(MSIE){TargeT = event.srcElement ;Bt = event.button ;}else{};

        var TargeT=e.target;var Bt=e.which;//ターゲットオブジェクト取得
// dbgPut(TargeT.id);
//IDの無いエレメントは処理スキップ
    if(! TargeT.id){
        xUI.Mouse.action = false;
//         if (this.edmode==3){this.Mouse()}
        return false;
    }
//カラム移動処理の前にヘッダ処理を追加 2010/08
    if(TargeT.id.match(/^L([0-9]+)_(-?[0-9]+)_([0-9]+)$/)) {
        var tln=1*RegExp.$1;var pgn=1*RegExp.$2;var cbn=1*RegExp.$3;//timeline(column)ID/pageID/columnBlockID
switch(e.type){
case    "dblclick":
        reNameLabel((tln).toString());
break;
case    "mousedown":
    if(this.edmode==0)xUI.changeColumn(tln,2*pgn+cbn);
break;
}
    xUI.Mouse.action = false;
    return ;
    }
//-------------------ヘッダ処理解決

//    if(TargeT.id.split("_").length>2){return false};//判定を変更
//ページヘッダ処理終了
//=============================================モード別処理
if(this.edmode==3){
    var hottrack=TargeT.id.split('_')[0];
    var hotpoint=TargeT.id.split('_')[1];
/*
    セクション編集フローティング
*/
switch (e.type){
case    "dblclick"    :
case    "mousedown"    :    
	document.getElementById("iNputbOx").focus();
break;
case    "click"    :
case    "mouseup"    ://終了位置で解決
//[ctrl][shift]同時押しでオプション動作？
    xUI.sectionUpdate();
    this.mdChg(2);
    this.Mouse.action=false;

//    this.floatTextHi();
break;
case    "mouseover"    :
    if((hottrack!=xUI.Select[0])||(! xUI.Mouse.action)) {
        if(TargeT.id && TargeT.id.match(/r?L\d/)){
            xUI.sectionUpdate();
            this.mdChg(2);
            this.Mouse.action=false;
        }
        return false
    };
if(! this.Mouse.action){
    return false;

    if(this.Mouse.action){
        if (TargeT.id && xUI.Mouse.rID!=TargeT.id ){
            this.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(this.spinSelect)) this.spin("update");
            return false;
        }else{
            return true;
        };
    };
}else{
        this.sectionPreview(hotpoint);
}
    break;
default    :    return true;
};
    return false;

}else if(this.edmode==2){
	document.getElementById("iNputbOx").focus();
    var hottrack=TargeT.id.split('_')[0];
    var hotpoint=TargeT.id.split('_')[1];
/*
    モード遷移は他の状態からコール
    セクション編集モード
    トラック内限定で区間編集を行う。
    モード変更コマンドの発行はemode==0の際のみ有効
    モード変更のトリガは、ダブルクリック
基本操作
３種のターゲットがある
        body
セクション全体がトラック内を前後に移動する
フローティングムーブに準ずる処理　ホットポイントオフセットが存在する
        head
        tail
トラック内でセクションが伸縮
他のノードを固定してヘッドまたはテールノードが移動することでセクションを伸縮する　

edmode==3　中は、マウスオーバーでセクション body||head||tail 移動
リリースで移動（＝編集）を解決　1回毎に更新回数を記録
ダブルクリックまたは対象トラック外をクリックで解決してモード解除
エスケープまたは対象トラック外右クリックで変更を廃棄して編集前に戻す

キーボード操作(1フレームづつ移動なので要注意)
    モード遷移・確定 [ctrl]+[shift]+[ENTER]
    ボディ移動       [↑]/[↓]
    ヘッド移動       [ctrl]+[↑]/[↓]
    テール移動       [shift]+[↑]/[↓]
                     [shift]+[ctrl]+[↑]/[↓]
     編集破棄＋モード解除
                     [esc]
                     
    セクション操作オフセットをxUIのプロパティで設定する
    値が０なら前方伸長　値が末尾なら後方伸長それ以外は移動
    継続時間が1の場合は末尾として扱う
    解決順が　末尾＞先頭＞以外になれば操作種別を１種にできる
    すべてsectionMove(start,duration)に集約できそう
    
*/
switch (e.type){
case    "dblclick"    :
//セクション操作モードを抜けて確定処理を行う
//確定処理はmdChg メソッド内で実行
              this.mdChg("normal");
//              this.floatTextHi();//導入処理
//            this.selectCell(TargeT.id);
//    this.floatDestAddress=this.Select.slice();
break;            
case    "mousedown"    :
    //サブモードを設定
    if((
        Math.abs(hotpoint -(xUI.Select[1]+(xUI.Selection[1]/2))) >
        Math.abs(xUI.Selection[1]/2)
        )&&(hottrack == xUI.Select[0])
    ){
// return false;//レンジ外 処理スキップ
        if (e.shiftKey){
    xUI.sectionManipulateOffset[1] = this.Selection[1];
        xUI.sectionManipulateOffset[0] = 'tail'; 
        }else if((e.ctrlKey)||(e.metaKey)){
    xUI.sectionManipulateOffset[1] = 0;
        xUI.sectionManipulateOffset[0] = 'head'; 
        }else{
    xUI.sectionManipulateOffset[1] = Math.floor(this.Selection[1]/2);
        xUI.sectionManipulateOffset[0] = 'body';
        }
        this.sectionPreview(hotpoint);
        this.sectionUpdate();
}else{    xUI.sectionManipulateOffset[1] = hotpoint-this.Select[1];
        xUI.sectionManipulateOffset[0] = 'body';
    if(xUI.sectionManipulateOffset[1]==xUI.Selection[1]){
        xUI.sectionManipulateOffset[0] = 'tail';
    } else if(xUI.sectionManipulateOffset[1]==0){
        xUI.sectionManipulateOffset[0] = 'head';
    }
}
    xUI.mdChg(3);    
    xUI.Mouse.action=true;
//    console.log([xUI.edmode,hotpoint,xUI.sectionManipulateOffset,xUI.Mouse.action]);
break;
case    "click"    :;//クリックしたセルで解決　(any):body/+[ctrl]:head/+[shift]:tail 
    if(hottrack!=xUI.Select[0]) {
        //対象トラック外なら確定して解除
        this.mdChg("normal");        
    }
break;

case    "mouseup"    ://終了位置で解決
//[ctrl]同時押しで複製処理
    //  this.mdChg(0,(e.ctrlKey));
    this.Mouse.action=false;
    this.floatTextHi();
break;
case    "mouseover"    :
    
//トラックが異なる場合 NOP return
//    var sectionRegex=new RegExp('^'+String(xUI.Select[0])+'_([0-9]+)$');
//    if((!(TargeT.id.match(sectionRegex)))||(! xUI.Mouse.action)){return false};//ターゲットトラック以外を排除
    if((hottrack!=xUI.Select[0])||(! xUI.Mouse.action)) {return false};
if(! this.Mouse.action){
    return false;

    if(this.Mouse.action){
        if (TargeT.id && xUI.Mouse.rID!=TargeT.id ){
            this.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(this.spinSelect)) this.spin("update");
            return false;
        }else{
            return true;
        };
    };
}else{
            this.sectionPreview(hotpoint);
}
    break;
default    :    return true;
};
    return false;

}else if(this.edmode==1){
//return false;
//ブロックムーブ（フローティングモード）
/*
    基本動作:
マウスオーバーでセクションを移動
リリースで移動を解決してモード解除
ダブルクリック・クリック等は基本的に発生しないので無視
*/
switch (e.type){
case    "dblclick"    :
//              this.mdChg("section");
//              this.floatTextHi();//導入処理
//            this.selectCell(TargeT.id);
//    this.floatDestAddress=this.Select.slice();
            
case    "mousedown"    :
case    "click"    :
case    "mouseup"    ://終了位置で解決
    console.log("<<<<<<")
//[ctrl]同時押しで複製処理
      this.mdChg(0,((e.ctrlKey)||(e.metaKey)));
      this.floatTextHi();
break;
case    "mouseover"    ://可能な限り現在位置で変数を更新
    if(!(TargeT.id.match(/^([0-9]+)_([0-9]+)$/))){return false};//シートセル以外を排除
//オフセットを参照して　.Select .Selection を操作する
/*
    
*/
if(false){
    if(this.Mouse.action){
        if (TargeT.id && xUI.Mouse.rID!=TargeT.id ){
            this.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(this.spinSelect)) this.spin("update");
            return false;
        }else{
            return true;
        };
    };
}else{
            this.selectCell(TargeT.id);
    this.floatDestAddress=this.Select.slice();
}
    break;
default    :    return true;
};
    return false;
}
//=============================================カラム移動処理
    if(!(TargeT.id.match(/^([0-9]+)_([0-9]+)$/))){return false};//シートセル以外を排除

switch (e.type){
case    "dblclick"    :
            //ダブルクリック時はモード保留して（解除か？）タイムラインセクション編集モードに入る
            this.mdChg("section",TargeT.id);
            this.Mouse.action=false;
            return false;
break;
case    "mousedown"    :
//document.getElementById("iNputbOx").value=("mouseDown")
    if (this.edchg){this.put(this.eddt);}//更新

    this.Mouse.rID=this.getid("Select");//
    this.Mouse.sID=TargeT.id;
    this.Mouse.action=true;

//    if(TargeT.id==this.getid("Select"))
//    {    }else{    };

        if(this.Selection[0]!=0||this.Selection[1]!=0){
//選択範囲が存在した場合
//if(dbg) dbgPut(this.edmode+":"+this.getid("Select")+"=="+TargeT.id);
//        var CurrentSelect=TargeT.id.split("_");
/*
        var CurrentAction=this.actionRange();
        if(
        (CurrentAction[0][0]<=CurrentSelect[0] && CurrentAction[1][0]>=CurrentSelect[0])&&
        (CurrentAction[0][1]<=CurrentSelect[1] && CurrentAction[1][1]>=CurrentSelect[1])
        ){}
*/
        if(TargeT.id==this.getid("Select")){
              //フォーカスセルにマウスダウンしてブロック移動へモード遷移
            //クリック時とダブルクリック時の判定をしてスキップしたほうが良い
//            if(TargeT.id!=this.floatDestAddress.join("_")){}
            this.mdChg('block');
            this.floatTextHi();
            this.selectCell(TargeT.id);
            this.floatDestAddress=this.Select.slice();

            this.Mouse.action=false;
            return false;
          }else{
        if(e.shiftKey){
            this.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(this.spinSelect)) this.spin("update");
            return false;//マルチセレクト
        }else{
            this.selection();//セレクション解除
            this.Mouse.action=false;
            this.selectCell(TargeT.id);//セレクト移動
        }
            return false;
          }
        }else{
//選択範囲が存在しない場合
            this.selection();//セレクション解除
        };

        if(e.shiftKey){
            this.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(this.spinSelect)) this.spin("update");
            return false;//マルチセレクト
        }else{
            if ((! e.ctrlKey)&&(! e.metaKey)){this.selection()};//コントロールなければ選択範囲の解除

            //this.Mouse.action=false;
            this.selectCell(TargeT.id);
        };
    break;
case    "mouseup"    :
//document.getElementById("iNputbOx").value=("mouseUp")
        this.Mouse.action=false;
    if( this.Mouse.sID!=TargeT.id){
        if(e.shiftKey){
            this.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(this.spinSelect)) this.spin("update");
            return false;//マルチセレクト
        }else{
            return false;//セレクトしたまま移動
        };
    };
    break;
case    "click"    :

    break;
case    "mouseover"    :
    if(this.Mouse.action){
        if (TargeT.id && xUI.Mouse.rID!=TargeT.id ){
            this.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(this.spinSelect)) this.spin("update");
            return false;
        }else{
            return true;
        };
    };
default    :    return true;
};
    return false;
};
//
//    xUI.Mouse.action    =false    ;//マウスアクション保留フラグ
//    xUI.Mouse.rID=false    ;//マウスカーソルID
//ドキュメントを開く
xUI.openDocument=function(){
    if(fileBox.openFileDB){fileBox.openFileDB();}else{this.sWitchPanel("Data");}
}

//ドキュメントを保存
xUI.storeDocument=function(mode){
    if(fileBox.saveFile){
        if(mode){fileBox.saveAs()}else{fileBox.saveFile()}
    }else{this.sWitchPanel("Data")}
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
//左マージン    ２カラム
      borderOffset.left=this.sheetLooks.SheetCellWidth;
//上マージン    ４フレーム
      borderOffset.top=frameHeight*4;
//右マージン    レコード末コメント除き１カラム
      borderOffset.right=this.sheetLooks.CommentWidth;
//下マージン    ４フレーム内寄り
      borderOffset.bottom=frameHeight*6
}else{
//境界オフセット変数
    var borderOffset={};
//左マージン    ３カラム
      borderOffset.left=this.sheetLooks.SheetCellWidth*4;
//上マージン    ６フレーム
      borderOffset.top= frameHeight*4;
//右マージン    レコード末コメント除き２カラム
      borderOffset.right= this.sheetLooks.CommentWidth;
//下マージン    ６フレーム
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
//    var myLeft=clamp([currentOffset.left-offsetH],0,document.body.clientWidth-(clipBounds.right -clipBounds.left))[1];
//    var myTop =clamp([currentOffset.top-offsetV] ,0,document.body.clientHeight-(clipBounds.bottom-clipBounds.top))[1];
    var myLeft=(currentOffset.left-offsetH);
    var myTop =(currentOffset.top-offsetV );
//    dbgPut(myLeft+":"+myTop);

//    var moved=(myLeft+myTop)?true:false;
//    if(moved){this.Mouse.action=false;};//マウス選択キャンセル
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
     $('#UIheaderScrollV').offset( { top : $('#qdr4').offset().top} );
     $('#UIheaderScrollH').offset( { left : $('#qdr4').offset().left} );
   };
//===========================================
/**
    xUI.pMenu(target,mode)
    プルダウンメニューの有効／無効を切り替える
    引数:
        target  stging:メニューid
        mode    string:"disable","enable"
*/
    xUI.pMenu = function(target,mode){
        if (mode == 'enable'){
            $('#'+target+'-d').hide();
            $('#'+target).show();
        }else{
            $('#'+target).hide();
            $('#'+target+'-d').show();            
        }
    }
/*
	xUI.sWitchPanel(引数)
パネル類の表示をコントローする
引数="clear"または　なしの場合は、排他表示のパネル類を表示クリア（hide）して表示を初期化する

引数	JQobject	備考

//排他表示
login   #optionPanelLogin   //ログインUI（　排他）
memo    #optionPanelMemo    //メモ編集（　排他）
Data    #optionPanelData    //Import/Export（　排他）
AEKey   #optionPanelAEK     //キー変換（　排他）
Scn     #optionPanelScn     //シーン設定(モーダル)
SCIs    #optionPanelSCI    //複数対応簡易シーン設定(モーダル)
Pref    #optionPanelPref    //環境設定（モーダル）
Ver     #optionPanelVer     //about(モーダル)
File    #optionPanelFile    //ファイルブラウザ（モーダル）

Rol     #optionPanelFile    //入力ロック警告（モーダル）
Snd     #optionPnaleSnd     //音響パネル(共)

Dbg     #optionPanelDbg	//デバッグコンソール（排他）
Prog	#optionPanelProg	//プログレス表示（排他モーダル）
//フローティングツール
Tbx     #optionPanelTbx	//ソフトウェアキーボード
//常時パネル（ユーザ指定）
menu    #pMenu	//ドロップダウンメニュー(共)
ToolBr      div#toolbarHeader	//ツールバー(共)
SheetHdr    div#sheetHeaderTable	//シートヘッダー(共)
memoArea		//ヘッダメモ欄複合オブジェクト
Utl	#optionPanelUtl	//ユーティリティーコマンドバー(共)排他から除外
*/
xUI.sWitchPanel = function sWitchPanel(status){
//一括クリアするパネルのリスト
//	"#optionPanelProg",
var myPanels=["#optionPanelMemo",
	"#optionPanelLogin",
	"#optionPanelData",
	"#optionPanelAEK",
	"#optionPanelScn",
	"#optionPanelSCI",
	"#optionPanelPref",
	"#optionPanelVer",
	"#optionPanelSnd",
	"#optionPanelRol"
];
/*
オールクリアは可能だが、ウインドウがフロートに移行するので使用範囲は限定される。
一部のフロートパネルは一括消去対象外にする
	"#optionPanelUtl",
	"#optionPanelTbx",
	"#optionPanelDbg",
*/
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
	if((documentDepot.documents.length==0)&&(status=='File')){documentDepot.rebuildList();}
case	"Ver":	;//バージョンパネル
case	"Pref":	;//環境設定
case	"Scn":	;//ドキュメント設定
case	"SCI":	;//複数対応簡易ドキュメント設定
case	"Prog":	;//プログレスパネル
case	"Rol":	;//書き込み警告パネル
//case	"Snd":	;//音声編集パネル(スクロール追従)
	var myStatus=(myTarget.is(':visible'))? true:false;
		this.sWitchPanel("clear");
		if(myStatus){myTarget.dialog("close")}else{myTarget.dialog("open");myTarget.focus();};
		
	break;
//割り込みパネル
case	"Login":;//ログインパネル
case	"Data":	;//データパネル
case	"Dbg":	;//デバッグパネル
//case	"Snd":	;//音声編集パネル(固定時)
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
case	"Snd":	;//音声編集パネル(fixed)
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
		document.getElementById("rEsult").value=this.XPS.xpsTracks.noteText;
	}else{
		hideTarget.show();
		this.XPS.xpsTracks.noteText=document.getElementById("rEsult").value;
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
		    var msg=localize(nas.uiMsg.dmConfirmClosepMenu);//
			if(confirm(msg)){$("#pMenu").hide();}else{break;};
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

/**
    画像パーツを描画するローレベルファンクション
    bodyコレクションは、描画したテーブルセル内の画像エレメントへの参照が格納される
*/
xUI.Cgl = new Object();
xUI.Cgl.baseColorArray = (xUI.sheetTextColor)? nas.colorStr2Ary(xUI.sheetTextColor):[0,1,0,1,0,1];
xUI.Cgl.body={};
xUI.Cgl.formCashe = {};     // セル画像部品キャッシュ

xUI.Cgl.show=function(myId){
	if(! this.body[myId]){	this.body[myId] = document.getElementById("cgl"+myId)	;}
	if(this.body[myId]){$("#cgl"+myId).show();}else{delete this.body[myId];}
}
xUI.Cgl.hide=function(myId){
	if(! this.body[myId]){	this.body[myId] = document.getElementById("cgl"+myId)	;}
	if(this.body[myId]){$("#cgl"+myId).hide();}else{delete this.body[myId];}
}
xUI.Cgl.remove=function(myId){
	if(! this.body[myId]){	this.body[myId] = document.getElementById("cgl"+myId)	;}
	if(this.body[myId]){$("#cgl"+myId).remove();delete this.body[myId];}
}
xUI.Cgl.init=function(){
    for (var prp in this.body){
        $("#cgl"+prp).remove();
        delete this.body[prp];
    }
}
/*
    範囲を指定してグラフィック部品を再描画するラッパ関数
    レンジの書式はXpxの戻すレンジに準ずる
    [[開始トラック,開始フレーム],[終了トラック,終了フレーム]]
    リファレンスフラグが無い場合は編集対象のXPSを処理する
*/
xUI.Cgl.refresh=function(myRange,isReference){
    if (typeof myRange == "undefined") {
        myRange = [[0, 0], [xUI.XPS.xpsTracks.length - 1, xUI.XPS.xpsTracks[0].length - 1]]
    }//指定がなければ全体を更新 印刷時は明確に範囲を指定する必要あり？
    var StartAddress = myRange[0];
    var EndAddress   = myRange[1];
    var idPrefix     =(isReference)?"r_":"";
    /**
     * ループして更新
     */
    for (var t = StartAddress[0]; t <= EndAddress[0]; t++) {
        for (var f = StartAddress[1]; f <= EndAddress[1]; f++){
            this.draw(idPrefix+[t,f].join('_'));
        }
    }

    
}
/**
	セル画像部品描画コマンド
位置計算をブラウザに任せるため　絶対座標でなく相対座標で各テーブルセル自体にCANVASをアタッチする

基本部品はすべてキャッシュを行い　image Objectを作成する。

印字の際に描画の動作独立性を高める必要があるので、セルに埋め込んだ画像クラスを判定してその描画を行う仕様に変更
具体的には、myFormに優先してターゲットセルの"graph_"で開始されるクラス名からFormを取得するように変更
　170815
シートカラーを　ユーザ変更可能にしたので　暗色テーマへの対応が必要
描画カラーをオブジェクトプロパティ設ける事

*/
xUI.Cgl.draw=function addGraphElement(myId,myForm) {
	    var objTarget  = document.getElementById(myId);//ターゲットシートセルを取得
	    if(! objTarget){return false;};//シートセルが存在しない場合は操作失敗
        var jqTarget = $('#'+myId);

    var classes=jqTarget.attr('class').split(' ');
    for (var cix=0;cix<classes.length;cix++){if (classes[cix].indexOf('graph_')==0){myForm=classes[cix].replace(/^graph_/,'');break;}}
    if(typeof myForm == 'undefined') {return false};//指定無しでかつ取得に失敗した場合はリターン(印刷時に有効)
    /*区間描画時に形成されたIDの場合はパーセンテージを分解して描画*/
    if(myForm.match(/(.*)_(\d+)\-(\d+)$/)){ myForm=RegExp.$1; arguments[2]=(RegExp.$2/100); arguments[3]=(RegExp.$3/100);}
    
		if(! this.body[myId]){	this.body[myId] = document.getElementById("cgl"+myId)	;}
		if( this.body[myId] ){
			$("#cgl"+myId).remove();delete this.body[myId];
		//二重描画防止の為すでにエレメントがあればクリアして描画
		}
/**
    以下の場合分けは、ノーマル時の処理とAIR環境のバグ回避コード
    先の処理のほうがオーバヘッドが小さいので推奨だが、AIRで正常に処理されない
- td配下に置いたcanvasエレメントが、position=absoluteを指定するとページ全体又はテーブルを包括するdivの原点をベースに描画される。
- element.top/.left で指定した座標が反映されないことがある　element.style.top/.left は正常
 動作異状の検出ルーチンはまだ組んでいない。ビルド毎にAIRに当該のバグがあるか否か確認が必要
 2016.11.12
*/
if(appHost.platform != "AIR"){
        var objParent = objTarget;
        var myTop     = "0px";
        var myLeft    = "0px";
}else{
        var objParent  = ((xUI.viewMode=="Compact")&&(myId.indexOf("r")==0))?
                    document.getElementById("UIheaderScrollV"):
                    document.getElementById("qdr4");
//        var targetRect = objTarget.getBoundingClientRect();
//        var parentRect = document.getElementById("sheet_body").getBoundingClientRect();
        var myTop     = objTarget.offsetTop  + "px";
        var myLeft      = objTarget.offsetLeft + "px";
}
/**
    formCache　を作成する
    単一セルに対するformは初回描画時にpngにレンダリングCacheに格納される
    ２度め以降はその都度利用される。
    トランジション系は形状が安定しないため都度描画
*/
    if(xUI.Cgl.formCashe[myForm]){
	    var element = new Image(objTarget.clientWidth,objTarget.clientHeight); 
	    element.id      = 'cgl' + myId; 
	    element.className   = 'cgl';
        element.style.top  = myTop
        element.style.left = myLeft;
        element.src = xUI.Cgl.formCashe[myForm];
    }else{
	    var element = document.createElement('canvas'); 
	    element.id      = 'cgl' + myId; 
	    element.className   = 'cgl';
	    
//        element.style.position="absolute";
        element.style.top  = myTop
        element.style.left = myLeft;
	    element.width  = objTarget.clientWidth;
	    element.height = objTarget.clientHeight;
	    var ctx = element.getContext("2d");

switch(myForm){
case "line":	    //vertical-line
case "line-ref":	    //vertical-line
case "line-cam":	    //vertical-line
case "line-sfx":	    //vertical-line
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
		var lineWidth  =3;
		ctx.strokeStyle='rgb('+xUI.Cgl.baseColorArray.join(',')+')';
		ctx.strokeWidth=lineWidth;
		ctx.moveTo(element.width*0.5, 0);
		ctx.lineTo(element.width*0.5, element.height);
	    ctx.stroke();
	    xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
	}
break;
case "wave":;			//wave-line
case "wave-odd":;		//wave-line 偶数フレーム
case "wave-evn":;		//wave-line 奇数フレーム
case "wave-ref-odd":;		//wave-line 偶数フレーム
case "wave-ref-evn":;		//wave-line 奇数フレーム
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
		var waveSpan  =5;		var lineWidth  =3;
		ctx.strokeStyle='rgb('+xUI.Cgl.baseColorArray.join(',')+')';
		ctx.strokeWidth=lineWidth;
		ctx.moveTo(element.width*0.5, 0);
		if(parseInt(myId.split("_").reverse()[0]) % 2){	
	ctx.bezierCurveTo(element.width*0.5-waveSpan, element.height*0.5,element.width*0.5-waveSpan, element.height*0.5,  element.width*0.5, element.height);
		}else{
	ctx.bezierCurveTo(element.width*0.5+waveSpan, element.height*0.5,element.width*0.5+waveSpan, element.height*0.5,  element.width*0.5, element.height);
		}
	    ctx.stroke();
	    xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
	}
break;
case "fi":;		//fade-in
	var startValue = arguments[2]; var endValue= arguments[3];
	    ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
		ctx.moveTo((1-startValue)*element.width*0.5, 0);
		ctx.lineTo(element.width-(1-startValue)*element.width*0.5,0);
		ctx.lineTo(element.width-(1-endValue)*element.width*0.5,element.height);
		ctx.lineTo((1-endValue)*element.width*0.5,element.height);
		ctx.fill();
break;
case "fo":;		//fade-out
	var startValue = arguments[2]; var endValue= arguments[3];
	    ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
		ctx.moveTo(startValue*element.width*0.5, 0);
		ctx.lineTo(element.width-startValue*element.width*0.5,0);
		ctx.lineTo(element.width-endValue*element.width*0.5,element.height);
		ctx.lineTo(endValue*element.width*0.5,element.height);
		ctx.fill();
break;
case "transition":;		//transition
	var startValue = arguments[2]; var endValue= arguments[3];
	    ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
		ctx.moveTo(startValue*element.width, 0);//
		ctx.lineTo(element.width-startValue*element.width,0);
		ctx.lineTo(element.width-endValue*element.width,element.height);
		ctx.lineTo(endValue*element.width,element.height);
		ctx.fill();
break;
case "circle":;		 //circle
case "circle-ref":;	 //circle-reference
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
		var phi  = .9;		var lineWidth  =3;
		ctx.strokeStyle='rgb('+xUI.Cgl.baseColorArray.join(',')+')';
		ctx.strokeWidth=lineWidth;
		ctx.arc(element.width * 0.5, element.height * 0.5, element.height*phi*0.5, 0, Math.PI*2, true);
	    ctx.stroke();
	    xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
	}
break;
case "triangle":;		//triangle
case "triangle-ref":;	//triangle
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
		var lineWidth  =4;
		ctx.strokeStyle='rgb('+xUI.Cgl.baseColorArray.join(',')+')';
		ctx.strokeWidth=lineWidth;
		ctx.moveTo(element.width*0.5, -1);
		ctx.lineTo(element.width*0.5 + (element.height-2)/Math.sqrt(3), element.height-2);
		ctx.lineTo(element.width*0.5 - (element.height-2)/Math.sqrt(3), element.height-2);
		ctx.closePath();
	    ctx.stroke();
	    xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
	}
break;
case "section-open":;		//section-open
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
	var formFill = arguments[2];
	    ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
		ctx.moveTo(element.width * 0.5 - element.height/Math.sqrt(3), 0);
		ctx.lineTo(element.width * 0.5 + element.height/Math.sqrt(3), 0);
		ctx.lineTo(element.width * 0.5 , element.height);
		ctx.closePath();
		if(formFill) {ctx.fill();}else{ctx.stroke();}
	    xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
	}
break;
case "section-close":;		//section-close
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
	var formFill = arguments[2];
	    ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
		ctx.moveTo(element.width * 0.5, 0);
		ctx.lineTo(element.width * 0.5 + element.height/Math.sqrt(3), element.height);
		ctx.lineTo(element.width * 0.5 - element.height/Math.sqrt(3), element.height);
		ctx.closePath();
		if(formFill) {ctx.fill();}else{ctx.stroke();}
	    xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
	}
break;
case "sound-section-open":;		//section-open
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
	var lineWidth = 3;
	    ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
		ctx.moveTo(0, element.height-lineWidth);
		ctx.lineTo(element.width, element.height-lineWidth);
		ctx.stroke();
	    xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
	}
break;
case "sound-section-close":;		//section-close
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
	var lineWidth = 3;
	    ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
		ctx.moveTo(0, lineWidth);
		ctx.lineTo(element.width, lineWidth);
		ctx.stroke();
	    xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
	}
break;
case "area-fill":;	//fill sheet cell
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
		ctx.moveTo(0, 0);
	    ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
	    ctx.fillRect(0, 0, targetRect.width, targetRect.height);
	    xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
	}
break;
}
    }
	    element=objParent.appendChild(element); 
//	    element=objTarget.appendChild(objParent);
//	    element.top = myTop;
//	    element.left= myLeft;
//	    element.style.zIndex=1;//シートに合わせて設定
//		element.style.pointerEvents='none';//イベントは全キャンセル
//		element.style.brendMode="multiply";//乗算
//		element.style.opacity="0.2";//30%
this.body[myId]=element;
this.body[myId].formProp=myForm;

return element;
}
/**
    トランジション系セクションを一括描画するラッパー関数
    この関数を使用する場合は直接Gcl.drawを呼ばないようにすること。
*/
xUI.Cgl.sectionDraw = function(myId,myForm,myDuration){
    var Idx=myId.split("_").reverse();
    for (var offset = 0;offset< myDuration;offset ++){
//編集エリアとリファレンスエリアで分岐
        if(Idx.length==2){
          //this.draw(       [Idx[1],parseInt(Idx[0])+offset].join("_"),myForm,offset / myDuration, (offset+1) / myDuration);
          $('#'+[Idx[1],parseInt(Idx[0])+offset].join('_')).addClass('graph_'+myForm+'_'+String(parseInt(100 * offset / myDuration))+'-'+String(parseInt(100 *((offset+1) / myDuration))));
        }else{
          //this.draw([Idx[2],Idx[1],parseInt(Idx[0])+offset].join("_"),myForm,offset / myDuration, (offset+1) / myDuration);
          $('#'+[Idx[2],Idx[1],parseInt(Idx[0])+offset].join('_')).addClass('graph_'+myForm+'_'+String(parseInt(100 * offset / myDuration))+'-'+String(parseInt(100 *((offset+1) / myDuration))));
        }
    }
}
/**
    sessionRetrace 値の更新
    サーバ上での更新状態を示す
    -1  リポジトリ上にエントリがない
    0   最新のデータ作業続行可能
    1~  番号が増えるに従って1世代づつ古いデータとなる
*/
xUI.setRetrace = function(){
    var myIdentifier = Xps.getIdentifier(xUI.XPS);
    var currentEntry = serviceAgent.currentRepository.entry(myIdentifier);
    if((currentEntry)&&(xUI.uiMode!='floating')){
        for (var ix=0;ix<currentEntry.issues.length;ix++){
            if(Xps.compareIdentifier(currentEntry.toString(ix),myIdentifier)>4){
                xUI.sessionRetrace = ix;
                break;
            }
        }
    }else{
        xUI.sessionRetrace = -1;    
    }
}
/**
 *  xUIにターゲットオブジェクトを与えてシートをリセットする関数
 *  初期化手順を用いていた部分の置換え用途で作成
 *  初期化手順内でもこの手続を呼び出すように変更
 *  この手続内では基本的にundo処理は行わない
 *　したがって必要に従ってこの手続を呼ぶ前にundoの初期化を行うか、またはundo操作を行う必要がある。
 */
xUI.resetSheet=function(editXps,referenceXps){
//  現在のカーソル配置をバックアップ
    var restorePoint = this.Select.concat();
    var restoreSelection=this.Selection.concat();
    var reWriteXPS = false;
    var reWriteREF = false;
/*
    引数にeditXPSが与えられなかった場合は、現在のXPSのまま処理を続行（画面のrefreshのみを行う）
 */
    if ((typeof editXps != "undefined") && (editXps instanceof Xps)){
//編集エリアに対するreadINの条件判定
//      xUI.uiMode=='production' のケースではSCi情報を保持する
//      それ以外のケースでは引数側の情報で上書きされる
        var propertyBackup=Xps.parseIdentifier(Xps.getIdentifier(xUI.XPS));
        /*
        if(xUI.uiMode=='production'){
        var props = [
            "xMap","line","stage","job","currentStatus","mapfile",
            "opus","title","subtitle","scene","cut","trin","trout","rate","framerate",
            "create_time","create_user","update_time","update_user",
        ];
//"xpsTracks"　以外のプロパティを全て本体プロパティで置きかえ
            for(var pix=0;pix<prps.length;pix++){editXps[prps[pix]]=xUI.XPS[prps[pix]]};
        }
        */
        this.XPS.readIN(editXps.toString());    //XPSをバッファ更新
        // 書換え範囲にXPS全体を追加
        reWriteXPS = true;
    }
/*
        引数に参照シートが渡されていたら、優先して解決
        指定のない場合は現在の参照シートを保持して使用
 */
    if ((typeof referenceXps != "undefined") && (referenceXps instanceof Xps)){
        this.referenceXPS=referenceXps;
        // 書換え範囲に 参照XPS全体を追加
        reWriteREF=true;
    };
//  バックアップしたカーソル位置が新しいシートで範囲外になる場合は範囲内にまるめる
    if(restorePoint[0] >= xUI.XPS.xpsTracks.length)   restorePoint[0] = xUI.XPS.xpsTracks.length -1;
    if(restorePoint[1] >= xUI.XPS.xpsTracks.duration) restorePoint[1] = xUI.XPS.xpsTracks.duration -1;
//表示プロパティのリフレッシュを行う　シートが変更されていなければ不用
    this._checkProp();
//セルグラフィック初期化( = 画面クリア)
//    this.Cgl.init();
//タイムシートテーブルボディ幅の再計算
    var tableRefereneceWidth =  this.sheetLooks.ActionWidth * this.referenceLabels.length;
    var tableEditWidth = (
        this.sheetLooks.DialogWidth * this.dialogCount + 
        this.sheetLooks.SheetCellWidth * this.timingCount +
        this.sheetLooks.StillCellWidth * this.stillCount +
        this.sheetLooks.CameraCellWidth * this.cameraCount +
        this.sheetLooks.SfxCellWidth * this.sfxCount +
        this.sheetLooks.CommentWidth
    );//タイムシートの基礎トラック専有幅を算出
    var tableColumnWidth=this.sheetLooks.TimeGuideWidth + tableRefereneceWidth + tableEditWidth;
//if(this.viewMode != "Compact"){    };//マルチカラムの場合、マージン付きでカラム数複製する
    var tableBodyWidth = tableColumnWidth * this.PageCols +　(this.sheetLooks.ColumnSeparatorWidth * (this.PageCols-1) );
//  UI上メモとトランジション表示をシート表示と切り分けること 関連処理注意
    sync("memo");
//  シートボディの表示
    if(this.viewMode=="Compact"){
//コンパクトモード　コンパクトUI用のラベルヘッダーを作成
        document.getElementById("UIheaderFix").innerHTML=this.pageView(-1);
        document.getElementById("UIheaderScrollH").innerHTML=this.pageView(0);
        document.getElementById("UIheaderScrollV").innerHTML=this.pageView(-2);
        document.getElementById("UIheader").style.display="inline";
//コンパクトUI時は1ページ限定なのでボディ出力を１回だけ行う
        var SheetBody = '<div id=printPg1 class=printPage>';
        SheetBody += this.headerView(1);
        SheetBody += '<br>';//UI調整用に１行（ステータス行の分）
        SheetBody += this.pageView(1);
        SheetBody += '</div>';
    }else{
//ノーマルモード　コンパクトUI用のラベルヘッダーを隠す
        document.getElementById("UIheader").style.display="none";
        var SheetBody='';
        for (Page=1 ;Page <=Math.ceil(XPS.duration()/this.PageLength);Page++){
            SheetBody += '<div id=printPg'+String(Page) +' class=printPage>';
            SheetBody += this.headerView(Page);
            SheetBody += ' <span class=pgNm>( p '+nas.Zf(Page,3)+' )</span><br>';
            SheetBody += this.pageView(Page);
            SheetBody += '</div>';
        };
    }
//　シートボディを締める
    document.getElementById("sheet_body").innerHTML=SheetBody+"<div class=\"screenSpace\"></div>";

// グラフィックパーツを配置(setTimeoutで無名関数として非同期実行)
    window.setTimeout(function(){
//        if (reWriteXPS) 
            xUI.syncSheetCell(0,0,false);//シートグラフィック置換
//        if (reWriteREF)
            xUI.syncSheetCell(0,0,true);//referenceシートグラフィック置換
//フットスタンプの再表示
        if(xUI.footMark){xUI.footstampPaint()};
//  カーソル位置復帰（範囲外は自動でまるめる）
        xUI.selectCell(restorePoint);
        xUI.selection(add(restorePoint,restoreSelection));
    },0);
    this.bkup([XPS.xpsTracks[1][0]]);
//表示内容の同期
    sync("tool_");
    sync("info_");
/* ヘッダ高さの初期調整*/
    this.adjustSpacer();

//画像部品の表示前のカーソル位置描画,'width':markerWidth
    this.selectCell(restorePoint);
    this.selection(restoreSelection);
//セクション編集状態であれば解除
    if(this.edmode>0){this.mdChg('normal');}

/* エンドマーカー位置調整　endMarker
//印字用endマーカーは　印刷cssを参照して誤差を反映させること　フレームのピッチを計算すること
印刷画面は印刷画面出力時に再度同メソッドで調整　トラック間の
xUI.replaceEndMarker([トラック数,フレーム数],上下オフセットpx);
 */
    xUI.replaceEndMarker([xUI.XPS.xpsTracks.length,xUI.XPS.xpsTracks.duration],4);
    return ;
};

//test-    xUI.reset(new Xps(3,24),new Xps(5,72));

/**
    tcサブコントロールに設定してターゲット要素の値を編集する関数
    関数の最期にonChangeがあれば実行
引数:
    targetId   ターゲット要素のIDまたはターゲット要素
    tcForm     使用するTC型式
    myStep     クリック毎に加算するフレーム数値 
*/
xUI.tcControl = function(targetId,tcForm,myStep){
    var myTraget = document.getElementById(targetId);
    myTraget.value=nas.Frm2FCT(nas.FCT2Frm(myTraget.value)+myStep,tcForm);
    if(document.getElementById(targetId).onchange) document.getElementById(targetId).onchange();
    return false;
}



//オブジェクト戻す
return xUI;
};
    
/*
りまぴん スタートアップ

    スタートアップを他の位置へまとめる必要があるかも
    remaping.js　が充分すぎるほどスパゲッティなので神様が来そう　2015.06.09
*/
//ユーザ設定を予備加工
    var MaxFrames=nas.FCT2Frm(Sheet);//タイムシート尺
    var MaxLayers=[SoundColumns,SheetLayers,CameraworkColumns,SfxColumns];//セル重ね数
//    オブジェクト初期化用ダミーマップ
    var MAP=new xMap(MaxLayers);
//    新規XPSオブジェクト作成・初期化
var XPS          = new Object() ;//ダミーオブジェクトとして初期化
var startupXPS   = ''           ;//初期状態のXPS本文text
var referenceXPS = ''           ;//同参照XPStext
//始動オブジェクトとして空オブジェクトで初期化する スタートアップ終了までのフラグとして使用
var xUI         =new Object();
    xUI.Mouse   =function(){return};
    xUI.onScroll=function(){return};
//コード読込のタイミングで行う初期化
/** Startup
    nas_Rmp_Startup
プログラム及び全リソースをロード後に１回だけ実行される手続

    nas_Rmp_Init
データドキュメントロード時に毎回実行される手続　UI初期化を含む
画面書き換え用のメソッドxUI.resetSheet を内部で呼び出す

    nas_Rmp_reStart
ページリロード等の際に実行される手続
*/
function nas_Rmp_Startup(){
//バージョンナンバーセット
    sync("about_");
//クッキー指定があれば読み込む
    if(useCookie[0]){ldCk()}; 
//背景カラーを置換
    SheetLooks.SheetBaseColor=SheetBaseColor;
//シートロゴをアップデート
    document.getElementById("headerLogo").innerHTML=
    "<a href='"+ headerLogo_url +
    "' title='"+ headerLogo_urlComment +
    "' target='_new'>"+ headerLogo +"</a>";
//サービスCGIのアドレスを調整
    if(String(location).indexOf('https')==0) {ServiceUrl=HttpsServiceUrl};
/**
       グローバルの XPSを実際のXpsオブジェクトとして再初期化する
*/
    XPS=new Xps([SoundColumns,SheetLayers,CameraworkColumns,SfxColumns],MaxFrames);
 /*
    convertXps(datastream,optionString,overiteProps,streamOption)
引数:
    datestream
        コンバート対象のデータ
        基本的にテキストデータ
        バイナリデータの場合は1bite/8bit単位の数値配列として扱う（現在未実装）
    optionString
        コンバート対象のデータがXPSのプロパティ全てを持たない場合があるので
        最低限のプロパティ不足を補うための指定文字列
        URIencodedIdentifier または　TextIdentifierを指定
        通常はこのデータがファイル名の形式で与えられるのでファイル名をセットする
        空白がセットされた場合は、カット番号その他が空白となる
    overwriteProps
        コンバータ側で上書きするプロパティをプロパティトレーラーオブジェクトで与える
        インポーター側へ移設予定
    streamOption
        ストリームスイッチフラグがあればストリームで返す（旧コンバータ互換のため）

    複数データ用コンバート関数
    内部でparseXpsメソッドを呼んでリザルトを返す
    以下形式のオブジェクトで　overwriteProps を与えると固定プロパティの指定が可能
    {
        "title":"タイトル文字列",
        "epispde":"エピソード文字列",
        "description":" エピソードサブタイトル文字列",
        "cut":"カット番号文字列",
        "time":"カット尺文字列　フレーム数またはTC"
    }
    いずれのプロパテイも省略可能
    指定されたプロパティは、その値でダイアログを上書きして編集が固定される
    全て指定した場合は、ユーザの編集ができなくなるので注意
    単独ファイルの場合は、固定に問題は無いが
    複数ファイル処理の場合に問題が発生する
    
    固定プロパティ強制のケースでは複数のドキュメントに同一のカット番号をもたせることはできないので
    カット番号のロックは行われない
    不正データ等の入力でコンバートに失敗した場合はfalseを戻す
    旧来の戻り値と同じ形式が必要な場合は　convertXps(datastream,"",{},true) と指定する事
戻値:　Object Xps or XpsStream or false
    
*/
convertXps=function(datastream,optionString,overwriteProps,streamOption){
    if(! String(datastream).length ){
        return false;
    }else{
// streamOption
    if(!streamOption){streamOption=false;}
// オプションで識別子文字列を受け取る　（ファイル名を利用）
// 識別子はXps.parseIdentifierでパースして利用
    if(! optionString){optionString = ''};//'TITLE#EP[subtitle]//s-c=CUTNo.='
// optionStringが空文字列の場合は置換処理を行わない
    if(optionString.length){
        if(optionString.indexOf('_')>=0){optionString=optionString.replace(/_/g,'//');}
// オプション文字列がカット番号セパレータ'//'を含まない場合　文字列冒頭に'//'を補う
        if(optionString.indexOf('//') < 0 ){optionString='//' + optionString;}
        var optionTrailer=Xps.parseIdentifier(optionString);
    }else{
        var optionTrailer=false;
    }
// 上書きプロパティ指定がない場合は空オブジェクトで初期化
    if(! overwriteProps){overwriteProps={};}
//データが存在したら、種別判定して、コンバート可能なデータはコンバータに送ってXPS互換ストリームに変換する
//Xpxデータが与えられた場合は素通し
//この分岐処理は、互換性維持のための分岐
        switch (true) {
        case    (/^nasTIME-SHEET\ 0\.[1-5]/).test(datastream):
//    判定ルーチン内で先にXPSをチェックしておく（先抜け）
        break;
        case    (/^UTF\-8\,\ TVPaint\,\ \"CSV 1\.[01]\"/).test(datastream):
            datastream =TVP2XPS(datastream);
            //TVPaint csv
        break;
        case    (/^\"Frame\",/).test(datastream):
            datastream =StylosCSV2XPS(datastream);//ボタン動作を自動判定にする 2015/09/12 引数は使用せず
        break;
        case    (/^\{[^\}]*\}/).test(datastream):;
            try{datastream =ARDJ2XPS(datastream);console.log(datastream);}catch(err){console.log(err);return false;};
        break;
        case    (/^#TimeSheetGrid\x20SheetData/).test(datastream):
            try{datastream = ARD2XPS(datastream);console.log(datastream);}catch(err){console.log(err);return false;};
        break;
        case    (/^\x22([^\x09]*\x09){25}[^\x09]*/).test(datastream):
            try{datastream =TSH2XPS(datastream);}catch(err){return false}
        break;
        case    (/^Adobe\ After\ Effects\x20([456]\.[05])\ Keyframe\ Data/).test(datastream):
            try{datastream=AEK2XDS(datastream)}catch(err){alert(err);return false}
            //AEKey のみトラック情報がないので　ダミーXpsを先に作成してそのトラックにデータをputする
            var myXps=new Xps();
            myXps.put(datastream);
            datastream=myXps.toString();
        break;
        default :
/*
    元の判定ルーチンと同じくデータ内容での判別がほぼ不可能なので、
    拡張オプションがあってかつ他の判定をすべてすり抜けたデータを暫定的にTSXデータとみなす
 */
            if(TSXEx){
                try{datastream=TSX2XPS(datastream)}catch(err){alert(err);return false;}
            }
      }
        if(! datastream){return false}
    }

  if(datastream){
    var convertedXps=new Xps();
    convertedXps.parseXps(datastream);
//ここでセリフトラックのチェックを行って、シナリオ形式のエントリを検知したら展開を行う
    for(var tix=0;tix<convertedXps.xpsTracks.length;tix++){
        var targetTrack=convertedXps.xpsTracks[tix]
        if(targetTrack.option=='dialog'){
            var convertQueue=[];//トラックごとにキューを置く
            var currentEnd =false;//探索中の終了フレーム
            
            for(var fix=0;fix<targetTrack.length;fix++){
                var entryText=String(targetTrack[fix]);
//末尾検索中
                if((convertQueue.length>0)&&(currentEnd)){
//キューエントリが存在してかつブランクを検知、次のエントリの開始または、トラック末尾に達した場合はキューの値を更新
//トラック末尾の場合のみ検出ポイントが異なるので注意
                    if((nas.CellDescription.type(entryText)=='blank')||
                       ((entryText.length>1)&&(entryText.indexOf('「')>=0))||
                       (fix==(targetTrack.length-1))){
                        var endOffset = (fix==(targetTrack.length-1))? 2:1;  
                        convertQueue[convertQueue.length-1][2]=currentEnd+endOffset;
                        currentEnd=false;
                    }else{
                        currentEnd=fix;
                    }
                }
//開きカッコを持ったテキスト長１以上のエントリがあったらオブジェクトを作成してキューに入れ
//終了点探索に入る
                if((entryText.length>1)&&
                   (entryText.indexOf('「')>=0)){
                    var dialogValue=new nas.AnimationSound(targetTrack[fix]);
                    dialogValue.parseContent();//
                    convertQueue.push([dialogValue,fix,0]);// [値,開始フレーム,終了フレーム(未定義)]
                    currentEnd = fix;
                }
            }
//キューにあるダイアログを一括して処理
            for(var qix=0;qix<convertQueue.length;qix++){
                var dialogOffset = (String(convertQueue[qix][0].name).length)? 2:1;
                    dialogOffset += convertQueue[qix][0].attributes.length;
                var dialogDuration = convertQueue[qix][2]-convertQueue[qix][1]; 
                var startAddress =[tix,(convertQueue[qix][1] - dialogOffset)];
                var dialogStream =(convertQueue[qix][0].getStream(dialogDuration)).join(',');
                convertedXps.put(startAddress,dialogStream);
            }
        }
    }
//オプション指定文字列の反映（抽出データを一旦全て反映）
    if(optionTrailer){
        if ((optionTrailer.title).length)    convertedXps.title     = optionTrailer.title;
        if ((optionTrailer.opus).length)     convertedXps.opus      = optionTrailer.opus;
        if ((optionTrailer.subtitle).length) convertedXps.subtitle  = optionTrailer.subtitle;
        if ((optionTrailer.scene).length)    convertedXps.scene     = optionTrailer.scene;
        if ((optionTrailer.cut).length)      convertedXps.cut       = optionTrailer.cut;
    }
//リザルトを返す
    return (streamOption)?convertedXps.toString():convertedXps;
  }else{
    return false;    
  }
}

/**
        クラスメソッドを上書き
        データインポートを自動判定
        xUI.sessionRetrace == -1    通常の読み出し
        xUI.sessionRetrace == 0     内容のみ入れ替え
        xUI.sessionRetrace > 0     読み込んだ後に-1にリセット
        
*/
XPS.readIN=function(datastream){
    xUI.errorCode=0;//読み込みメソッドが呼ばれたので最終のエラーコードを捨てる。
    if(! datastream.toString().length ){
      xUI.errorCode=1;return false;
//"001:データ長が0です。読み込みに失敗したかもしれません",
    }else{
//データが存在したら、コンバータに送ってコンバート可能なデータをXPS互換ストリームに変換する
/**
        データインポートは自動判定
        xUI.sessionRetrace == -1    通常の読み出し
        xUI.sessionRetrace == 0     内容のみ入れ替え
        xUI.sessionRetrace > 0     読み込んだ後に-1にリセット
    import判定がtrueの場合、現データの以下のプロパティを保護する
 カット尺は、ユーザに問い合わせる必要があるかも…　いや無い！
 
 カット尺を保護する場合は、リファレンスに読み込んで部分コピーを行うべき
*/
        var isImport=((xUI.sessionRetrace==0)&&(xUI.uiMode=='production'))? true:false;
//        var newXps = convertXps(datastream,"",{},true);//旧メソッド互換ストリーム
        var newXps = convertXps(datastream);//新メソッド　コンバートとオブジェクト変換を同時に
/*
読み込まれたデータ内にシナリオ形式のダイアログ記述が存在する可能性があるので、これを探して展開する
現在は処理をハードコーディングしてあるが、この展開処理はトラックを引数にして処理メソッドに渡す形に変更する予定
*/
//ここでセリフトラックのチェックを行って、シナリオ形式のエントリを検知したら展開を行う
    for(var tix=0;tix<newXps.xpsTracks.length;tix++){
        var targetTrack=newXps.xpsTracks[tix]
        if(targetTrack.option=='dialog'){
            var convertQueue=[];//トラックごとにキューを置く
            var currentEnd =false;//探索中の終了フレーム
            
            for(var fix=0;fix<targetTrack.length;fix++){
                var entryText=String(targetTrack[fix]);
//末尾検索中
                if((convertQueue.length>0)&&(currentEnd)){
//キューエントリが存在してかつブランクを検知、次のエントリの開始または、トラック末尾に達した場合はキューの値を更新
//トラック末尾の場合のみ検出ポイントが異なるので注意
                    if((nas.CellDescription.type(entryText)=='blank')||
                       ((entryText.length>1)&&(entryText.indexOf('「')>=0))||
                       (fix==(targetTrack.length-1))){
                        var endOffset = (fix==(targetTrack.length-1))? 2:1;  
                        convertQueue[convertQueue.length-1][2]=currentEnd+endOffset;
                        currentEnd=false;
                    }else{
                        currentEnd=fix;
                    }
                }
//開きカッコを持ったテキスト長１以上のエントリがあったらオブジェクトを作成してキューに入れ
//終了点探索に入る
                if((entryText.length>1)&&
                   (entryText.indexOf('「')>=0)){
                    var dialogValue=new nas.AnimationSound(targetTrack[fix]);
                    dialogValue.parseContent();//
                    convertQueue.push([dialogValue,fix,0]);// [値,開始フレーム,終了フレーム(未定義)]
                    currentEnd = fix;
                }
            }
//キューにあるダイアログを一括して処理
            for(var qix=0;qix<convertQueue.length;qix++){
                var dialogOffset = (String(convertQueue[qix][0].name).length)? 2:1;
                    dialogOffset += convertQueue[qix][0].attributes.length;
console.log(dialogOffset);
                var dialogDuration = convertQueue[qix][2]-convertQueue[qix][1]; 
                var startAddress =[tix,(convertQueue[qix][1] - dialogOffset)];
console.log(startAddress);
                var dialogStream =(convertQueue[qix][0].getStream(dialogDuration)).join(',');
console.log(dialogStream);
                newXps.put(startAddress,dialogStream);
            }
        }
    }
//インポートが必要な場合は、新規オブジェクトに現行のドキュメントから固定対象のプロパティを転記する
//
        if(isImport){
/*
        var props=[
            "xMap",         ;//Object xMap      ドキュメント側を使用（xMap実装後はマージが必要マージメソッドを作成）
            "line",         ;//Object XpsLine   ドキュメント側を使用   
            "stage",        ;//Object XpsStage  ドキュメント側を使用
            "job",          ;//Object XpsStage  ドキュメント側を使用
            "currentStatus",;//Object JobStatus ドキュメント側を使用
            "mapfile",      ;//String           ドキュメント側を使用
            "opus",         ;//String           ドキュメント側を使用
            "title",        ;//String           ドキュメント側を使用
            "subtitle",     ;//String           ドキュメント側を使用
            "scene",        ;//String           ドキュメント側を使用
            "cut",          ;//String           ドキュメント側を使用
//          "trin",         ;//Array                        インポート側を使用
//          "trout",        ;//Array                        インポート側を使用
//          "rate",         ;//Strting                      インポート側を使用
//          "framerate",    ;//String                       インポート側を使用
            "create_time",  ;//String           ドキュメント側を使用
            "create_user",  ;//Object UserInfo  ドキュメント側を使用
            "update_time",  ;//Stirng           ドキュメント側を使用
            "update_user",  ;//Object UserInfo  ドキュメント側を使用
//          "xpsTracks"     ;//Object XpsTrackCollection    インポート側を使用
        ];

  */
        var props = [
            "xMap","line","stage","job","currentStatus",
            "mapfile","opus","title","subtitle","scene","cut",
            "create_time","create_user","update_time","update_user"
        ];
//             var props=[];
//            for (var prp in xUI.XPS){if(!(xUI.XPS[prp] instanceof Function)){props.push(prp)}};
// console.log(props);
            for (var ix=0;ix<props.length;ix++){newXps[props[ix]]=xUI.XPS[props[ix]]}
        }else{
        var props = [
            "xMap","line","stage","job","currentStatus",
            "mapfile","opus","title","subtitle","scene","cut",
            "create_time","create_user","update_time","update_user"
        ];
            if((xUI.importBox.importCount==1)&&(xUI.importBox.selectedContents.length)){
                for (var ix=0;ix<props.length;ix++){
                    if(xUI.importBox.selectedContents[0][props[ix]]) newXps[props[ix]]=xUI.importBox.selectedContents[0][props[ix]];
                }
            };
        }
//        if(xUI.sessionRetrace > 0) xUI.sessionRetrace= -1;
        return this.parseXps(newXps.toString());
    }
}

/** 識別子の情報でカットのプロパティを上書きする
    インポート時に必要な情報は識別子にすべて含まれるためそれで上書きを行う
    duration は
        元シートのデータを維持
        新シートに合わせる
    の二択となるので要注意
    新規作成時にライン〜ステータス情報が欠落するのでそれは判定して補う
    識別子に含まれる時間情報を同期させる場合は、引数withoutTimeにfalseを与える
    初期値はtrue(時間同期なし)
*/
XPS.syncIdentifier =function(myIdentifier,withoutTime){
    if(typeof withoutTime == 'undefined') withoutTime = true;
    var parseData   = Xps.parseIdentifier(myIdentifier);
    this.title      = parseData.title;
    this.cut        = parseData.cut;
    this.opus       = parseData.opus;
    this.subtitle   = parseData.subtitle;
    this.scene      = parseData.scene;
    if(parseData.currentStatus){
        this.line       = parseData.line;
        this.stage      = parseData.stage;
        this.job        = parseData.job;
        this.currentStatus = parseData.currentStatus;
    }
    if (! withoutTime){
        var newTime = nas.FCT2Frm(parseData.sci[0].time)+Math.ceil((this.trin[0]+this.trout[0])/2);
        console.log('時間調整 : '+newTime)
        console.log(this.setDuration(newTime));
    }
return parseData;
}

//    ダミーマップを与えて情報取り込み
//    var MAP=new xMap(SheetLayers);
//ダミーマップがある程度の機能を持ち始めたのでグローバルへ移行
/*
    Mapオブジェクトの改装を始めるので、いったん動作安定のため切り離しを行う
    デバッグモードでのみ接続
if(dbg)    XPS.getMap(MAP);
*/
/*============*     初期化時のデータ取得    *============*/
/*
 *  再優先・レンダリング時にドキュメント内にスタートアップデータが埋め込まれている
 */
//    ドキュメント内にスタートアップデータがあれば読み出し

if(document.getElementById( "startupXPS" )){
        startupXPS=document.getElementById("startupXPS").innerHTML;
        var dataStart=startupXPS.indexOf("nasTIME-SHEET");
        if(dataStart<0){
            startupXPS="";
        }else if(dataStart>0){
            startupXPS=startupXPS.slice(dataStart);
        }
        if(startupXPS.indexOf("&amp;")>=0){startupXPS=startupXPS.replace(/&amp;/g,"&");}
        if(startupXPS.indexOf("&lt;")>=0){startupXPS=startupXPS.replace(/&lt;/g,"<");}
        if(startupXPS.indexOf("&gt;")>=0){startupXPS=startupXPS.replace(/&gt;/g,">");}
}
//    同ドキュメント内にスタートアップ用参照データがあれば読み出し

if(document.getElementById( "referenceXPS" ) && document.getElementById( "referenceXPS" ).innerHTML.length){
        referenceXPS=document.getElementById("referenceXPS").innerHTML;
        if(referenceXPS.indexOf("&amp;")>=0){referenceXPS=referenceXPS.replace(/&amp;/g,"&");}
        if(referenceXPS.indexOf("&lt;")>=0){referenceXPS=referenceXPS.replace(/&lt;/g,"<");}
        if(referenceXPS.indexOf("&gt;")>=0){referenceXPS=referenceXPS.replace(/&gt;/g,">");}
}


//    起動時に AIR環境で引数があれば引数を解釈実行する。
//同様のルーチンで  invorkイベントがあれば引数を解釈して実行するルーチンが必要
//実態はair_UI.jsxに

//    UI生成
    xUI=new_xUI();
//    *** xUI オブジェクトは実際のコール前に必ずXPSを与えての再初期化が必要　要注意

//if(startupXPS.length == 0){};
if(false){
    if(appHost.platform == "AIR"){
        var myBackup=localStorage.getItem("info.nekomataya.remaping.backupData");
        var myReference=localStorage.getItem("info.nekomataya.remaping.referenceData");
   }else{
//CSX環境下ではローカルストレージが未サポートなのでローカルストレージの判定をするが吉
        try{
            var myBackup=localStorage.getItem("info.nekomataya.remaping.backupData");
            var myReference=localStorage.getItem("info.nekomataya.remaping.referenceData");
        }catch( err ){
            var myBackup="";
            var myReference="";
        }
    }
    if((startupXPS.length==0)&&(myBackup)&&(myBackup.length)){
//        var msg="バックアップ保存されたデータがあります。\n復元しますか？\n\nOK:復元 / CANCEL:新規";
//        if(confirm(msg)){        };
            startupXPS=myBackup;
            if(myReference){
                if(myReference.length>0){
                    referenceXPS=myReference;//ソーステキスト代入
                }else{
                    referenceXPS="";
                }
            }
    }
};//    記録されたバックアップデータが有れば読み出し(サーバ運用に向けて停止中) 

if((!startupXPS)&&(fileBox)&&(fileBox.contentText.length)){startupXPS=fileBox.contentText;}
if(startupXPS.length > 0){
    XPS.readIN(startupXPS);NameCheck=false;
}
//リファレンスシートデータがあればオブジェクト化して引数を作成
        var referenceX=new Xps(5,144);
    if((referenceXPS)&&(referenceXPS.length)){
        referenceX.readIN(referenceXPS);
    }
    xUI.init(XPS,referenceX);//初回実行時にxUIにデータを与えて初期化
/**
    シートのカラーデータを構築
*/
console.log(SheetLooks);
    xUI.setSheetLook(SheetLooks);//タイムシートルック初期化
    xUI.resetSheet();
    nas_Rmp_Init();
/* ================================css設定
//================================================================================================================================ シートカラーcss設定2
//    シート境界色設定
    $('table').css('border-color',SheetBaseColor);
    $('th').css('border-color',xUI.sheetborderColor);
    $('td').css('border-color',xUI.sheetborderColor);
//    識別用ラベル背景色設定
//    nas.addCssRule("th.stilllabel" ,"background-color:"+xUI.stillColor ,"screen");
//    nas.addCssRule("th.sfxlabel"   ,"background-color:"+xUI.sfxColor   ,"screen");
//    nas.addCssRule("th.cameralabel","background-color:"+xUI.cameraColor,"screen");
    $("th.stilllabel").css("background-color",xUI.stillColor);// ,"screen");
    $("th.sfxlabel").css("background-color",xUI.sfxColor);//   ,"screen");
    $("th.cameralabel").css("background-color",xUI.cameraColor);//,"screen");

//================================================================================================================================ シートカラーcss設定2
*/
//startupXPSがない場合でフラグがあればシートに書き込むユーザ名を問い合わせる
/*
    この時点のユーザ問い合わせ手順に問題あり
    問い合わせが必要か否かの条件を調整　かつ　問い合わせ時に記録からユーザの情報を取得して選択肢として提示するUIが必要
    ユーザ設定フラグを判定してUIを提示する
    html5のオートコンプリートを利用するのでinput初期値はカラに
    UIを提示しない場合は、デフォルトの値またはクッキーで記録した最後のユーザが設定される
*/
//  alert(xUI.currentUser); console.log(xUI.recentUsers);
if(! xUI.onSite){
if((NameCheck)||(myName=="")){
        var newName=null;
        var msg=welcomeMsg+"\n"+localize(nas.uiMsg.dmAskUserinfo)+
        "\n\n ハンドル:メールアドレス / handle:email@example.com \n";
        if(xUI.currentUser) msg += "\n current user / " + xUI.currentUser.toString(true);
        msg=[msg];
        msg.push("<hr><input id='confirmUID' type='text' autocomplete='on' list='recentUsers' size=48 value=''>");//初期値カラ
//console.log(myName)
        nas.showModalDialog("confirm",msg,localize(nas.uiMsg.userInfo),'',function(){
            if(this.status==0){
                var newName = new nas.UserInfo(document.getElementById('confirmUID').value);
                if(newName.handle){
                    xUI.currentUser = new nas.UserInfo(newName);
                }
                xUI.XPS.update_user = xUI.currentUser;
                xUI.recentUsers.add(xUI.currentUser);
                sync("recentUsers");
                sync("update_user");
                sync("current_user");
            }
        });
    document.getElementById("nas_modalInput").focus();
    }};
//    クッキーで設定されたspinValueがあれば反映
    if(xUI.spinValue){document.getElementById("spin_V").value=xUI.spinValue} ;
//ツールバー表示指定があれば表示 プロパティ廃止
//    if((xUI.utilBar)&&(!$("#optionPanelUtl").is(':visible'))){$("#optionPanelUtl").show();};//xUI.sWitchPanel('Utl');

document.getElementById("iNputbOx").focus();

};
/**
    印字用HTMLスタートアップ　（スタートアップのサブセット)




 */
function nas_Prt_Startup(callback){
/**
       グローバルの XPSを実際のXpsオブジェクトとして再初期化する
*/
//    XPS=new Xps(MaxLayers,MaxFrames);
    XPS=new Xps([SoundColumns,SheetLayers,CameraworkColumns,SfxColumns],MaxFrames);

/*============*     初期化時のデータ取得    *============*/
/*
 *  レンダリング時にドキュメント内にスタートアップデータが埋め込まれている
 */
//    ドキュメント内スタートアップデータを読み出し

if(document.getElementById( "startupXPS" )){
        startupXPS=document.getElementById("startupXPS").innerHTML;
}
//    同ドキュメント内にスタートアップ用参照データがあれば読み出し

if(document.getElementById( "referenceXPS" ) && document.getElementById( "referenceXPS" ).innerHTML.length){
        referenceXPS=document.getElementById("referenceXPS").innerHTML;
}
//    UI生成
    xUI=new_xUI();

//    *** xUI オブジェクトは実際のコール前に必ずXPSを与えての再初期化が必要　要注意

if(startupXPS.length > 0){ XPS.readIN(startupXPS) }
//リファレンスシートデータがあればオブジェクト化して引数を作成
        var referenceX=new Xps(5,144);
    if((referenceXPS)&&(referenceXPS.length)){
        referenceX.readIN(referenceXPS);
    }
    xUI.init(XPS,referenceX);//初回実行時にxUIにデータを与えて初期化
    
//    xUI.replaceEndMarker(undefined,4);//編集HTML用のみ
    var pgRect     = document.getElementById("printPg1").getBoundingClientRect();
    var headerRect = document.getElementById("pg1Header").getBoundingClientRect();
    var tableRect  = document.getElementsByClassName("sheet")[0].getBoundingClientRect();
    var baseWidth  = headerRect.width;
    var baseHeight = 1580;//
    var xScale = baseWidth/tableRect.width;
    var yScale = (baseHeight-headerRect.height)/tableRect.height;
    console.log(pgRect);
    console.log(headerRect);
    console.log(tableRect);
    console.log([xScale,yScale]);
    $(".sheet").css({"transform":"scale("+[xScale,yScale].join()+")","transform-origin":"0 0"});
    $(".printPage").css({"height":baseHeight,"width":baseWidth});
    xUI.replaceEndMarker(undefined,4);//編集HTML用のみ

    //スケーリング終了後のアイテム座標でマーカーを配置
    if(callback instanceof Function) callback();
};
//
/*
タイムシートのUIをリセットする手続き
タイムシートの変更があった場合はxUI.init(XPS)を先にコールしてxUIのアップデートを行うこと

引数としてuiModeを文字列で与えて　リセット後のuiModeを指定可能 未指定の場合はリセット前のモードを継続
    ↓
シート内容のみの変更の場合は、xUI.resetSheetを用いる　その際xUI.initを省略することが必要
xUI.initの初期化手続は１回のみに変更　コードを組み替えて整理すること。

シート変更時の画面リフレッシュを別の手続'xUI.resetSheet'へ移行
この手続は、UIの再初期化手続として利用される
この一連の手続内でxUI.resetSheet()メソッドがコールされる
*/
function nas_Rmp_Init(uiMode){
    var startupWait=false;
/*
console.log(xUI.XPS.toString())
console.log(xUI.referenceXPS.toString())
*/
if(false){
//プロパティのリフレッシュ
    xUI._checkProp();
    xUI.Cgl.init();//特にこの処理を重点的にチェック　このルーチンは実行回数が少ないほど良い
}
//    xUI.resetSheet();

/*　表示モード増設 
Compactモード時は強制的に
  表示１列　コンテの継続時間とページ長を一致させる
表示モードにしたがって
  タイトルヘッドラインの縮小
*/

/** 動作モードを新設
production/management/browsing
managementモードではシート編集はブロック
viewOnly プロパティは再初期化前の状態を再生
*/
    var vOcurrent=xUI.viewOnly;
    if(typeof uiMode != 'undefined'){xUI.setUImode(uiMode);}else{xUI.setUImode(xUI.setUImode());}
    xUI.viewOnly=vOcurrent;

    sync('productStatus');
/*
//タイムシートテーブルボディ幅の再計算 ここにトラック種別が反映されていない　注意
//(タイムヘッダ幅+ダイアログ幅+レイヤ数*幅+コメント欄幅+余分)×ページカラム数＋カラムセパレータ幅×(ページカラム数?1)

    var tableBodyWidth=(
        xUI.sheetLooks.TimeGuideWidth +
        xUI.sheetLooks.DialogWidth + 
        xUI.sheetLooks.ActionWidth * xUI.referenceLabels.length +
        xUI.sheetLooks.SheetCellWidth*(XPS.xpsTracks.length-2) +
        xUI.sheetLooks.CommentWidth
    )
    if(xUI.viewMode!="Compact"){
        tableBodyWidth=tableBodyWidth* xUI.PageCols +(xUI.sheetLooks.ColumnSeparatorWidth*(xUI.PageCols-1));//
    }
*/
//シートを初期化
if(dbg) var TimeStart=new Date();
/*

//UI上メモとトランジション表示をシート表示と切り分けること 関連処理注意
    sync("memo");

if(xUI.viewMode=="Compact"){
//    alert("compact xD:"+ XPS.duration()+" pL: "+xUI.PageLength );
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
    for (Page=1 ;Page <=Math.ceil(xUI.XPS.duration()/xUI.PageLength);Page++)
    {
        SheetBody+= xUI.headerView(Page);
        SheetBody+= ' <span class=pgNm>( p '+nas.Zf(Page,3)+' )</span><br>';
        SheetBody+= xUI.pageView(Page);
    };
}
*/
/*
サーバーオンサイトであるか否かを判定して表示を更新
     エレメントが存在すればon-site
 */
　   if(document.getElementById('backend_variables')){
console.log('application server-onsite');
        if (serviceAgent.servers.length==1) {
            serviceAgent.switchService(0);
        }else{
            serviceAgent.switchService(0);//デフォルトサーバのIDを置く
        }

        xUI.onSite = serviceAgent.currentServer.url.split('/').slice(0,3).join('/');
　       serviceAgent.currentStatus='online';
//  ドキュメント表示更新
　       document.getElementById('loginstatus_button').innerHTML = '=ONLINE=';
　       document.getElementById('loginstatus_button').disabled  = true;
         document.getElementById('loginuser').innerHTML = xUI.currentUser.handle;
         document.getElementById('serverurl').innerHTML = serviceAgent.currentServer.url;
//   カラーセット
        var sheetBaseColor=$("#backend_variables").attr("data-sheet_color");
        if (sheetBaseColor.match(/^rgba?\(([\d\s\.,]+)\)$/i)){
            var collorArray=(RegExp.$1).split(',');
            sheetBaseColor="#"+parseInt(collorArray[0],10).toString(16)+parseInt(collorArray[1],10).toString(16)+parseInt(collorArray[2],10).toString(16);
        }
        if(sheetBaseColor.match(/^#[0-9a-f]+$/i)){
            SheetLooks.SheetBaseColor = sheetBaseColor;
            xUI.setSheetLook(SheetLooks);
        }
//  ユーザ情報取得
        xUI.currentUser = new nas.UserInfo(
            $("#backend_variables").attr("data-user_name") + ":" +
            $("#backend_variables").attr("data-user_email")
        );

        myName = xUI.currentUser.toString();//旧変数互換 まとめて処理する関数が必要
//        myNames = xUI.recentUsers.covertStringArray();//要素を文字列可した配列

    　   if($("#backend_variables").attr("data-episode_token").length > 0){
console.log('bind single document');
//シングルドキュメント拘束モード
		    startupWait=true;//ウェイト表示を予約
　           serviceAgent.currentStatus='online-single';
document.getElementById('loginstatus_button').innerHTML='>ON-SITE<';
document.getElementById('loginstatus_button').disabled=true;

//インポート関連をロック　操作をsync('productStatus')に統合（タイミングが同じ）
// sync("importControllers");

//document.getElementById('loginuser').innerHTML = xUI.currentUser.handle;
//document.getElementById('serverurl').innerHTML = serviceAgent.currentServer.url;
　       $('#pMbrowseMenu').hide();
　       $('#ibMbrowse').hide();//設定表示
                 document.getElementById('toolbarHeader').style.backgroundColor='#ddbbbb';
//サーバ既存エントリ
            var isNewEntry = (startupXPS.length==0)? true:false;
//サーバ上で作成したエントリの最初の1回目はサーバの送出データが空
//空の状態でかつトークンがある場合が存在するので判定に注意！       　           
             if($("#backend_variables").attr("data-cut_token").length){
console.log('has cut token');
    　           serviceAgent.currentServer.getRepositories(function(){
                     var RepID = serviceAgent.getRepsitoryIdByToken($("#backend_variables").attr("data-organization_token"));
    　               serviceAgent.switchRepository(RepID,function(){
    　                   if(dbg) console.log('switched repository :' + RepID);
/*最小の情報をトークンベースで取得*/
                        var myProductToken = $('#backend_variables').attr('data-product_token');
                        var myEpisodeToken = $('#backend_variables').attr('data-episode_token');
                        var myCutToken = $('#backend_variables').attr('data-cut_token');

serviceAgent.currentRepository.getProducts(function(){
        serviceAgent.currentRepository.getEpisodes(function(){
                serviceAgent.currentRepository.getSCi(function(){
                    var myIdentifier=serviceAgent.currentRepository.getIdentifierByToken(myCutToken);
                    if((myIdentifier)&&(Xps.compareIdentifier(Xps.getIdentifier(XPS),myIdentifier) < 5)){
console.log('syncIdentifier:');
console.log(decodeURIComponent(myIdentifier));
                        xUI.XPS.syncIdentifier(myIdentifier,false);
                    }
                    if( startupXPS.length==0 ){
console.log('detect first open no content');//初回起動を検出　コンテント未設定
console.log('new Entry init');
                        xUI.XPS.line     = new XpsLine(nas.pmdb.pmTemplate.members[0]);
                        xUI.XPS.stage    = new XpsStage(nas.pmdb.pmTemplate.members[0].stages.getStage());
                        xUI.XPS.job      = new XpsStage(nas.pmdb.jobNames.getTemplate(nas.pmdb.pmTemplate.members[0].stages.getStage(),"init")[0]);
                        xUI.XPS.currentStatus   = new JobStatus("Startup");     
                        xUI.XPS.create_user=xUI.currentUser;
                        xUI.XPS.update_user=xUI.currentUser;

console.log(xUI.XPS.title);
//syncIdentifierでカット尺は調整されているはずだが、念のためここで変数を取得して再度調整をおこなう
//data-scale を廃止した場合は、不用
                        var myCutTime = nas.FCT2Frm($('#backend_variables').attr('data-scale'));
                        if(!(isNaN(myCutTime)) && (myCutTime != xUI.XPS.time())){xUI.XPS.setDuration(myCutTime)}
                    }
//ここで無条件でproductionへ移行せずに、チェックが組み込まれているactivateEntryメソッドを使用する
/*
xUI.sessionRetrace=0;
sync('info_');
xUI.setUImode('browsing');
serviceAgent.activateEntry()
                        xUI.setUImode('production');
                        //serviceAgent.activateEntry();*/
//                        console.log('========================');
                        xUI.setRetrace();
                        xUI.setUImode('browsing');
		                if (startupWait) xUI.sWitchPanel('Prog');//ウェイト表示消去
                        switch(xUI.XPS.currentStatus.content){
                            case "Active":
                        // チェックイン直後の処理の際はactivate処理が余分なのでケースわけが必要
                        // jobIDがフラグになる　スタートアップ直後の自動チェックインの場合のみ処理をスキップしてモード変更
                                if(xUI.XPS.job.id==1){
                                    xUI.setUImode('production');
                                }else{
                                    serviceAgent.activateEntry();
                                }
                            break;
                            case "Hold":
                        // 常にactivate
                                serviceAgent.activateEntry();
                            break;
                            case "Fixed":
                        //ユーザが一致しているケースでもactivateとは限らないので、Fixedに関してはスキップ 
                            break;
                            case "Startup":
                                serviceAgent.checkinEntry();
                            case "Aborted":
                            default:
                        //NOP
                        }
                        sync('info_');
console.log('初期化終了');
console.log(serviceAgent.currentRepository);                        
                },false,myEpisodeToken);//getSCi
        },false,myProductToken,myEpisodeToken);//getEpisodes
},false,myProductToken);//getProduct
    　               });
    　           });
    　       }else{
console.log('has no cut token');
//ドキュメント新規作成
/*    旧タイプの処理この状態には入らないはずなので順次削除      */
if(dbg) console.log('old style new document');
    　           serviceAgent.currentServer.getRepositories(function(){
    　               serviceAgent.switchRepository(1,function(){
    　                   var myIdentifier = serviceAgent.currentRepository.getIdentifierByToken($("#backend_variables").attr("data-episode_token"));
                          myIdentifier = myIdentifier+'('+xUI.XPS.time()+')';
                          var tarceValue = Xps.compareIdentifier(Xps.getIdentifier(xUI.XPS),myIdentifier);
                         if( traceValue < 0){
    　                       if(dbg) console.log('syncIdentifier new Entry');
    　                       if(dbg) console.log(Xps.getIdentifier(xUI.XPS));
    　                       if(dbg) console.log(myIdentifier);
    　                       if(dbg) console.log(Xps.compareIdentifier(Xps.getIdentifier(xUI.XPS),myIdentifier));
    　                       XPS.syncIdentifier(myIdentifier,false);
        xUI.XPS.line     = new XpsLine(nas.pm.pmTemplate[0].line);
        xUI.XPS.stage    = new XpsStage(nas.pm.pmTemplate[0].stages[0]);
        xUI.XPS.job      = new XpsStage(nas.pm.jobNames.getTemplate(nas.pm.pmTemplate[0].stages[0],"init")[0]);
        xUI.XPS.currentStatus   = new JobStatus("Startup");     
        xUI.XPS.create_user=xUI.currentUser;
        xUI.XPS.update_user=xUI.currentUser;
    　                       //var msg='新規カットです。カット番号を入力してください';
    　                       //var newCutName=prompt(msg);
    　                       //if()
                            xUI.setRetrace();
                            xUI.setUImode('browsing');
                            serviceAgent.activateEntry();
//                            xUI.setUImode('production');
                            sync('info_');
    　                   }
    　               });
    　           });
    　       }
　       } else {
//マルチドキュメントモード
// リポジトリのIDは不問 とりあえず１(ローカル以外)
if(dbg) console.log('onsite multi-document mode');
    　       serviceAgent.currentServer.getRepositories(function(){
//    　           serviceAgent.switchRepository(1,documentDepot.rebuildList);
    　           serviceAgent.switchRepository(1);
    　       });
            $("li#pMos").each(function(){$(this).hide()});//シングルドキュメントモード専用UI

　       }
//if(serviceAgent.currentRepository.entry(Xps.getIdentifier(xUI.XPS))),
　   }else{
if(dbg) console.log('Application Offsite');
//オフサイトモード
//オンサイト専用UIを隠す
            $("li#pMos").each(function(){$(this).hide()});
            $("li#pMom").each(function(){$(this).hide()});
            $("#ibMmenuBack").hide();
/** 現在のセッションが承認済みか否かを判定して表示を更新
    
*/
        if($("#server-info").attr('oauth_token')){
            serviceAgent.authorized('success');
        }else{
            serviceAgent.authorized();
        };
//        sync('server-info')
　   }
//シートボディを締める
//    document.getElementById("sheet_body").innerHTML=SheetBody+"<div class=\"screenSpace\"></div>";


/*
// 初回ページレンダリングでグラフィックパーツを配置
// setTimeoutで無名関数として実行
window.setTimeout(function(){
    xUI.syncSheetCell(0,0,false);//シートグラフィック置換
    xUI.syncSheetCell(0,0,true);//referenceシートグラフィック置換
//フットスタンプの再表示
    if(xUI.footMark){xUI.footstampPaint()};
},0);
*/

//書き出したら、セレクト関連をハイライト
//
//    XPS.selectionHi("hilite")
//    xUI.focusCell("1_0")    ;//フォーカスして
//    xUI.selectCell("1_0")    ;//フォーカスして,"startup"
    xUI.bkup([XPS.xpsTracks[1][0]]);
//    xUI.focusCell()    ;//リリース
//jquery関連　パネル類の初期化
//    initPanels();
/*
りまぴん
入出力関連プロシージャ

ウインドウの開閉コントロール
jQueryライブラリの使用に置き換えるので
ルーチンの見なおし
2013.02.26
*/
(function initPanels(){
//起動時に各種パネルの初期化を行う。主にjquery-ui-dialog
//aboutパネル
$("#optionPanelVer").dialog({
	autoOpen:false,
	modal	:true,
	width	:480,
	title	:localize(nas.uiMsg.aboutOf,"remaping…")
});
//:nas.uiMsg.Preference
$("#optionPanelPref").dialog({
	autoOpen:false,
	modal	:true,
	width	:520,
	title	:localize(nas.uiMsg.Preference)
});
//:nas.uiMsg.xSheetInfo
$("#optionPanelScn").dialog({
	autoOpen:false,
	modal	:true,
	width	:512,
	title	:localize(nas.uiMsg.xSheetInfo)
});
//:nas.uiMsg.document
$("#optionPanelFile").dialog({
	autoOpen:false,
	modal	:true,
	width	:720,
	title	:localize(nas.uiMsg.document)
});
})();

(function initPanelsII(){
//:nas.uiMsg.processing
$("#optionPanelProg").dialog({
	autoOpen:false,
	modal	:true,
	width	:240,
	title	:localize(nas.uiMsg.processing)
});
//:nas.uiMsg.inputWarning
$("#optionPanelRol").dialog({
	autoOpen:false,
	modal	:true,
	width	:480,
	title	:localize(nas.uiMsg.inputWarning)
});
//:シーンカット入力ダイアログパネル
$("#optionPanelSCI").dialog({
    autoOpen:false,
    modal	:true,
    width	:480,
    position :{
        my: "left top",
        at: "center-240 top+100",
    },
    title	:"IMPORT"
});

//:nas.uiMsg.Sounds
/* ダイアログをスクリーンに対して固定にする場合はJQuiry UIで初期化する
こちらで初期化するとスクロール追従となる
$("#optionPanelSnd").dialog({
	autoOpen:false,
	modal	:false, 
	width	:680,
	title	:localize(nas.uiMsg.Sounds),
    position: {
        of : window,
        at: 'center top',
        my: 'senter top'
    }
});
*/
})();
//インポート用ファイルドラッガ初期化
 $(function() {
        var localFileLoader = $("#data_well");
        // File API が使用できない場合は諦めます.
        if(!window.FileReader) {
          alert("File API がサポートされていません。");
          return false;
        }
        // イベントをキャンセルするハンドラです.
        var cancelEvent = function(event) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        // dragenter, dragover イベントのデフォルト処理をキャンセルします.
        localFileLoader.bind("dragenter", cancelEvent);
        localFileLoader.bind("dragover", cancelEvent);
        // ドロップ時のイベントハンドラを設定します.
        var handleDroppedFile = function(event) {
          // ドロップされたファイル配列を取得してファイルセレクタへ送る
          // 同時にonChangeを打つ
          document.getElementById('myCurrentFile').files = event.originalEvent.dataTransfer.files;
          // デフォルトの処理をキャンセルします.
          cancelEvent(event);
          return false;
        }
        // ドロップ時のイベントハンドラを設定します.
        localFileLoader.bind("drop", handleDroppedFile);
});

//ヘッドラインの初期化
    initToolbox();
//デバッグ関連メニューの表示
    if(dbg){
        $("button.debug").each(function(){$(this).show()});
        $("li#debug").each(function(){$(this).show()});
        if(appHost.platform=="AIR"){$("li#airDbg").each(function(){$(this).show()})};
    }else{
        $("button.debug").each(function(){$(this).hide()});
        $("li#debug").each(function(){$(this).hide()});
        $("li#airDbg").each(function(){$(this).hide()});
    }
//AIRを認識した場合cgiUIとairUIを切り換え
switch (appHost.platform){
case    "AIR":
//tableメニュー表記
        $("tr#cgiMenu").each(function(){$(this).hide()});
//ショートカットアイコンボタン
        $("#airMenu").show();//="inline";
        $("#psMenu").hide();//
        $("#cgiMenu").hide();//="none";
//        document.getElementById("airMenu").style.display="inline";
//        document.getElementById("cgiMenu").style.display="none";
//サンプル取得部
//        document.getElementById("cgiSample").style.display="none";
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
//        if((window.navigator.platform).indexOf("Win")>=0){$("#pMenu").hide()};
break;
case "CEP":
//    window.parent.psHtmlDispatch();
case    "CSX":
//tableメニュー表記
        $("tr#airMenu").each(function(){$(this).hide()});
//ショートカットアイコンボタン
        $("#airMenu").hide();//
        $("#psMenu").show();//
        $("#cgiMenu").hide();//
//サンプル取得部
//        document.getElementById("cgiSample").style.display="none";
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
//    $("#headerLogo").hide();
    $("#logoTable").hide();
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
    $("#memoArea").hide();
//タイムラインヘッダ
    $("#UIheader").show();
    if(document.getElementById("UIheaderScrollV").innerHTML==""){document.getElementById("UIheaderScrollV").innerHTML=xUI.paveView(-2);};
//    $("#UIheaderFix").show();
//    $("#UIheaderScroll").show();
    }else{
//ロゴ
    $("#logoTable").show();
//    $("#headerLogo").show();
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
    $("#memoArea").show();
//タイムラインヘッダ
    $("#UIheader").hide();
    $("#UIheaderScrollV").html("");
    
//    $("#UIheaderFix").hide();
//    $("#UIheaderScroll").hide();
    }

//オンサイト時の最終調整はこちらで？
    if(xUI.onSite){
//        xUI.sWitchPanel('Prog');
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
//xUI.spin(1);xUI.spin(SpinValue);
//ドキュメント設定オブジェクト初期化
    myScenePref    =new ScenePref();
//UI設定オブジェクト初期化
    myPref    =new Pref();
//UI表示状態のレストア
    for (var ix=0;ix<UIViewIdList.length;ix++){
        var myTgt=$("#"+UIViewIdList[ix]);
        if(ToolView.toString().charAt(ix)=="0"){myTgt.hide()}else{myTgt.show()} 
    }
//暫定　プラットホームを判定して保存関連のボタンを無効化したほうが良い　後でする

//開発用表示
if(dbg){
//    $("#optionPanelDbg").show();//
//    if(dbg){xUI.openSW("dbg_")};
//    $("#optionPanelDbg").show();
//    $("#optionPanelUtl").show();
//    $("#optionPanelTrackLabel").show();
//    $("#optionPanelEfxTrack").show();
//    $("#optionPanelTrsTrack").show();
        $("#serverSelector").show();
}
//表示内容の同期
    sync("tool_");sync("info_");
if(dbg){
    var TimeFinish=new Date();
    var msg="ただいまのレンダリング所要時間は、およそ "+ Math.round((TimeFinish-TimeStart)/1000) +" 秒 でした。\n レイヤ数は、 "+XPS.xpsTracks.length+ "\nフレーム数は、"+XPS.duration()+"\tでした。\n\t現在のspin値は :"+xUI.spinValue;
//    if(dbg) alert(msg);
    dbg=false;
}
/* ヘッダ高さの初期調整*/
xUI.adjustSpacer();
/* */
xUI.selection();
//スタートアップ中に時間のかかる処理をしていた場合はプログレスパネルで画面ロック　解除は操作側から行う
if(startupWait){xUI.sWitchPanel('Prog');};//ウェイト表示
};
/*
    ページ再ロード前に必要な手続群
*/
function nas_Rmp_reStart(evt){
//ファイルがオープン後に変更されていたら、警告する
/*
    変更判定は xUI.storePt と xUI.undoPtの比較で行う
storePtはオープン時および保存時に現状のundoPtを複製するので、
内容変化があれば (xUI.storePt != xUI.undoPt) となる

*/
//    if(! xUI.isStored()){
        /*
    evt = event || window.event;
    return evt.returnValue=localize({
        en:"The document change is not saved!",
        ja:"ドキュメントの変更が保存されていません！"
    });
        //xUI.setBackup();
        var msg=locallize({
            en:"I will move from this page (move can not be canceled).\n The document is not saved, but save it?",
            ja:"このページから移動します(移動のキャンセルはできません)\nドキュメントが保存されていませんが、保存しますか？"
        });
        */
/*データ保全は、モード／ケースごとに振り分け必要*/
//        if(confirm(msg)){ xUI.setBackup() };
//console.log('backup');
//        xUI.setBackup();
        //保存処理
//    };
    if(! xUI.isStored()){
        console.log('backup');
        xUI.setBackup();
    };
// if(confirm("TEST")){return true}else {return false};
//    クッキーを使用する設定なら、
//    現在のウィンドウサイズを取得してクッキーかき出し
    if (useCookie[0]) {
        writeCk(buildCk());
    };//現在　cookie:0 は常にfalse

//データ保存の有無に関係なくセッションチェックイン中ならば保留する（自動）
    if(xUI.uiMode=='production'){
        serviceAgent.deactivateEntry();
    }
// return true;
};

/*
メモ

アンドゥスタックの使用

通常入力
アンドゥポインタと配列の長さを比較
配列をアンドゥポインタの長さに揃える(切り取る)
アンドゥ要素(位置・セレクション・保存データストリーム)を
アンドゥ配列に積む・ポインタ1加算

タイムシート構成変更
現在のタイムシートをオブジェクト化してUNDOスタックに積む
UNDO/REDOともに準拠操作

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

2015 07 04
ペースト内容の挿入を実装
    指定位置からシート末尾までの範囲（不定スパン）を一次バッファにとる
    ヤンクまたは挿入範囲と一次バッファで新規の上書き用データを作る
    上書きデータをputする
    ＝undo一回分となる
指定範囲移動を実装する
実際に
ヤンク>クリア>ペースト（上書き移動）
ヤンク>

*/
/*　---------- sync.js
		パネル情報同期

ユニット名称	HTML-Elements　説明

	headline	ヘッドライン・常用ツール
	body		タイムシート本体
	info		情報表示・AEキーリザルト
	tool_		ツールボックス(実質上の常用ツール)
	map			マップ表示
	pref		プリファレンスパネル
	dataio		データI/O(XPS/AEload)

こんなもんかしら
こいつは相当いじらないと危ないかも
*/
//汎用表示同期プロシージャ
//同期プロシージャは発信側に置いたほうが、なにかとベンリなので本体に移動

//プロパティとセレクタの関連づけ
//	var PropLists = new Array();
var PropLists = new Object();
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
var workTitle=new Object();
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
server-info     ;//
historySelector ;//ヒストリセレクタ
referenceLabel  ;//リファレンスエリアのラベル
importControllers    ;//インポートリードアウトコントロール
*/
function sync(prop){
if (typeof prop == 'undefined') prop = 'NOP_';
	switch (prop){
case    "importControllers":
//読み出しコントローラ抑制
    if(
        (serviceAgent.currentStatus=='online-single')&&
        (xUI.XPS.currentStatus.content.indexOf('Active')<0)
    ){
        document.getElementById('updateSCiTarget').disabled=true;
        xUI.pMenu('pMimportDatas','desable');//プルダウンメニュー　
        xUI.pMenu('pMopenFS','disable');        //ファイルオープン
        xUI.pMenu('pMopenFSps','disable');      //Photoshop用ファイルオープン
        document.getElementById('ibMimportDatas').disabled=true;  //アイコンボタンインポート（オープン）
        document.getElementById('dataLoaderGet').disabled=true;   //変換パネルの取り込みボタン
        document.getElementById('myCurrentFile').disabled=true;   //ファイルインプット
    }else{
        document.getElementById('updateSCiTarget').disabled=false;
        xUI.pMenu('pMimportDatas','enable');//プルダウンメニュー　
        xUI.pMenu('pMopenFS','enable');        //ファイルオープン
        xUI.pMenu('pMopenFSps','enable');      //Photoshop用ファイルオープン
        document.getElementById('ibMimportDatas').disabled=false;  //アイコンボタンインポート（オープン）
        document.getElementById('dataLoaderGet').disabled=false;   //変換パネルの取り込みボタン
        document.getElementById('myCurrentFile').disabled=false;   //ファイルインプット
    }
case    "recentUsers":
//ダイアログ類から参照される最近のユーザリスト
    var rcuList = "";
    for (var i=0;i<xUI.recentUsers.length;i++){
        rcuList += '<option value="';
        rcuList += xUI.recentUsers[i].toString();
        rcuList += xUI.currentUser.sameAs(xUI.recentUsers[i])?'" selected=true >':'">';
    }
    if(document.getElementById('recentUsers')) document.getElementById('recentUsers').innerHTML = rcuList;
    break;
case    "editLabel":
//XPS編集エリアのラベル更新
/*
タイトルテキストは
    IDFをすべて
ラベル表示
    jobName
*/
    var myIdf  =Xps.getIdentifier(xUI.XPS);
    var editLabel = xUI.XPS.job.name;
    var editTitle = decodeURIComponent(myIdf);
// ラベルをすべて更新
    $("th").each(function(){
        if(this.id=='editArea'){
            this.innerHTML =(this.innerHTML == 'Animation')? editLabel:'Animation';
            this.title 　　= editTitle;
        };
    });
    break;
case    "referenceLabel":
//referenceXPSエリアのラベル更新
/*
    リファレンスが編集中のデータと同エントリーでステージ・ジョブ違いの場合はissueの差分表示を行う。
タイトルテキストは
    同ステージのジョブなら　　jobID:jobName
    別ステージのジョブならば　stageID:stageName//jobID:jobName
    別ラインのジョブならば　　lineID:lineName//stageID:stageName//jobID:jobName
    別カットならば　IDFをすべて
ラベル表示は上記の1単語省略形で
    同ステージのジョブなら　　jobName
    別ステージのジョブならば　stageName
    別ラインのジョブならば　　lineName
    別カットならば　cutIdf(Xps.getIdentifier(true))
*/
    var myIdf  =Xps.getIdentifier(xUI.XPS);
    var refIdf =Xps.getIdentifier(xUI.referenceXPS);
    var refDistance = Xps.compareIdentifier(myIdf,refIdf);
    if(refDistance < 1){
        var referenceLabel = "noReferenece";//xUI.referenceXPS.getIdentifier(true);
        var referenceTitle = decodeURIComponent(refIdf);
    }else if(refDistance == 1){
        var referenceLabel = xUI.referenceXPS.line.name;
        var referenceTitle = [
            xUI.referenceXPS.line.toString(true),
            xUI.referenceXPS.stage.toString(true),
            xUI.referenceXPS.job.toString(true)
        ].join('//');
    }else if(refDistance == 2){
        var referenceLabel = xUI.referenceXPS.stage.name;
        var referenceTitle = [
            xUI.referenceXPS.stage.toString(true),
            xUI.referenceXPS.job.toString(true)
        ].join('//');
    }else if(refDistance >= 3){
        var referenceLabel = xUI.referenceXPS.job.name;
        var referenceTitle = xUI.referenceXPS.job.toString(true);
    }
// ラベルをすべて更新
    $("th").each(function(){
        if(this.id=='rnArea'){
            this.innerHTML = (this.innerHTML == referenceLabel)? 'Referenece' : referenceLabel;
            this.title 　　= referenceTitle;
        };
    });
    break;
case    "historySelector":;
    var currentIdentifier = (xUI.uiMode == 'production')? Xps.getIdentifier(xUI.referenceXPS):Xps.getIdentifier(xUI.XPS);
    var currentEntry = serviceAgent.currentRepository.entry(currentIdentifier);
    if(! currentEntry) break;
    var myContentsStage='';var stid=-1;
    var myContentsJob='';
        for (var ix=currentEntry.issues.length-1;ix >= 0;ix--){
            var matchResult=Xps.compareIdentifier(currentEntry.issues[ix].identifier,currentIdentifier);
            if(decodeURIComponent(currentEntry.issues[ix][2]).split(":")[0] == 0){stid=ix-1}
            if((stid == ix)||(ix == (currentEntry.issues.length-1))){
                if(matchResult>4){
                    myContentsStage += '<li><span id="'+currentEntry.issues[ix].identifier+'" ' ;
                    myContentsStage += 'title="'+decodeURIComponent(currentEntry.issues[ix].identifier)+'" ';
                    myContentsStage += 'class="pM">*';
                    myContentsStage += decodeURIComponent(currentEntry.issues[ix][0])+"//"+decodeURIComponent(currentEntry.issues[ix][1]);
                    myContentsStage += '</span></li>'
                }else{
                    myContentsStage += '<li><a id="'+currentEntry.issues[ix].identifier+'" ' ;
                    myContentsStage += 'title="'+decodeURIComponent(currentEntry.issues[ix].identifier)+'" ';
                    myContentsStage += 'href="javascript:void(0)" ';
                    myContentsStage += 'onclick="serviceAgent.getEntry(this.id)"> ';
                    myContentsStage += decodeURIComponent(currentEntry.issues[ix][0])+"//"+decodeURIComponent(currentEntry.issues[ix][1]);
                    myContentsStage += '</a></li>'
                }
            }
            if(matchResult>2){
                myContentsJob += '<option value="'+currentEntry.issues[ix].identifier+'"' ;
                myContentsJob += (matchResult>4)?
                    'selected >':' >';
                myContentsJob += decodeURIComponent(currentEntry.issues[ix][2])+"/"+currentEntry.issues[ix][3];
                myContentsJob += '</option>'
            }
            
        }
        document.getElementById('pMstageList').innerHTML=myContentsStage;
        document.getElementById('jobSelector').innerHTML=myContentsJob;
    break;
case	"productStatus":;
	document.getElementById('pmcui_line').innerHTML  = xUI.XPS.line.toString(true);
	document.getElementById('pmcui_stage').innerHTML = xUI.XPS.stage.toString(true);
	document.getElementById('pmcui_job').innerHTML   = xUI.XPS.job.toString(true);
//	document.getElementById('pmcui_status').innerHTML= decodeURIComponent(xUI.XPS.currentStatus);
	document.getElementById('pmcui_status').innerHTML= xUI.XPS.currentStatus.toString();
	document.getElementById('pmcui_documentWriteable').innerHTML= (xUI.viewOnly)?'[編集不可]':'';
    if (xUI.viewOnly){
	document.getElementById('pmcui_documentWriteable').innerHTML= '[編集不可]';
    $('#documentWritable').show();
    }else{
	document.getElementById('pmcui_documentWriteable').innerHTML= '';
    $('#documentWritable').hide();
    }
	document.getElementById('pmcui_documentWriteable').innerHTML += String(xUI.sessionRetrace);
	switch (xUI.uiMode){
		case 'production':
	document.getElementById('pmcui').style.backgroundColor = '#bbbbdd';
	document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusEdit);
	break;
		case 'management':
	document.getElementById('pmcui').style.backgroundColor = '#ddbbbb';
	document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusAdmin);
	break;
		case 'browsing':
	document.getElementById('pmcui').style.backgroundColor = '#bbddbb';
	document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusView);
	break;
	    default:;// floating and other
	document.getElementById('pmcui').style.backgroundColor = '#dddddd';
	document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusView);
	}
//読み出しコントローラ抑制
    if(
        (serviceAgent.currentStatus=='online-single')&&
        (xUI.XPS.currentStatus.content.indexOf('Active')<0)
    ){
        document.getElementById('updateSCiTarget').disabled=true;
        xUI.pMenu('pMimportDatas','desable');//プルダウンメニュー　
        xUI.pMenu('pMopenFS','disable');        //ファイルオープン
        xUI.pMenu('pMopenFSps','disable');      //Photoshop用ファイルオープン
        document.getElementById('ibMimportDatas').disabled=true;  //アイコンボタンインポート（オープン）
        document.getElementById('dataLoaderGet').disabled=true;   //変換パネルの取り込みボタン
        document.getElementById('myCurrentFile').disabled=true;   //ファイルインプット
    }else{
        document.getElementById('updateSCiTarget').disabled=false;
        xUI.pMenu('pMimportDatas','enable');//プルダウンメニュー　
        xUI.pMenu('pMopenFS','enable');        //ファイルオープン
        xUI.pMenu('pMopenFSps','enable');      //Photoshop用ファイルオープン
        document.getElementById('ibMimportDatas').disabled=false;  //アイコンボタンインポート（オープン）
        document.getElementById('dataLoaderGet').disabled=false;   //変換パネルの取り込みボタン
        document.getElementById('myCurrentFile').disabled=false;   //ファイルインプット
    }
break;
case	"fct":	;
//フレームの移動があったらカウンタを更新
	document.getElementById("fct0").value=
		nas.Frm2FCT(xUI.Select[1],xUI.fct0[0],xUI.fct0[1]);
	document.getElementById("fct1").value=
		nas.Frm2FCT(xUI.Select[1],xUI.fct1[0],xUI.fct1[1]);
	break;
case	"lvl":	;
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
	document.getElementById("blmtd").disabled=stat;
	document.getElementById("blpos").disabled=stat;
	if(! document.getElementById("blpos").disabled) chkPostat();
	break;
case	"spinS":
	document.getElementById("spinCk").checked=xUI.spinSelect;
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
case	"update_user":	;
	document.getElementById(prop).innerHTML=
	(XPS[prop])? (XPS[prop].toString()).split(':')[0] : "<br />";
if(xUI.viewMode != "Compact"){
	for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
		document.getElementById(prop+pg).innerHTML=(XPS[prop])? (XPS[prop].toString()).split(':')[0] : "<br />";
}
	}
case	"create_user":	;
case    "current_user": ;
    document.getElementById("current_user_id").value=xUI.currentUser.email;
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
	$("#ibMundo").attr("disabled",stat);
}
	break;
case	"redo":	;
{
//redoバッファの状態を見てボタンラベルを更新
	stat=((xUI.undoPt+1)>=xUI.undoStack.length)? true:false ;
	$("#ibMredo").attr("disabled",stat);
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
		document.getElementById("L"+r.toString()+"_0_0").innerHTML='<span style="color:'+xUI.sheetborderColor+'";>'+nas.Zf(r+1,2)+'</span>';
		document.getElementById("L"+r.toString()+"_-1_0").innerHTML='<span style="color:'+xUI.sheetborderColor+'";>'+nas.Zf(r+1,2)+'</span>';
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
		document.getElementById("L"+r.toString()+"_"+Pg+"_"+Cm).innerHTML='<span style="color:'+xUI.sheetborderColor+'";>'+nas.Zf(r+1,2)+'</span>';
}else{
		document.getElementById("L"+r.toString()+"_"+Pg+"_"+Cm).innerHTML=XPS.xpsTracks[r].id;

}
	}}}
  }
	break;
case	"info_":	;//セット変更
    setTimeout(function(){sync('historySelector')},10);
	var syncset=
["opus","title","subtitle","time","trin","trout","scene","update_user","productStatus"];
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
case	"NOP_":	;
	break;
default	:	if(dbg){dbgPut(": "+prop+" :ソレは知らないプロパティなのです。");}
	}
//windowTitle及び保存処理系は無条件で変更
	if(xUI.init){
		var winTitle=xUI.XPS.getIdentifier('cut');// ウィンドウタイトル用のデータは
		if((appHost.platform == "AIR") && (fileBox.currentFile)){winTitle = fileBox.currentFile.name}
		//winTitle +=(xUI.isStored())?"":" *";
		if(! xUI.isStored()) winTitle = "*"+winTitle;
		if(document.title!=winTitle){document.title=winTitle};//違ってるときのみ書き直す
      if(document.getElementById('pmcui')){
        if(! xUI.isStored()){
            if(document.getElementById('pmcui-update').disabled == true) document.getElementById('pmcui-update').disabled = false;
            xUI.pMenu('pMsave','enable');            
        }else{
            if(document.getElementById('pmcui-update').disabled == false) document.getElementById('pmcui-update').disabled = true;
            xUI.pMenu('pMsave','false');
       }
      }
	}else{
console.log('xUI は初期化前: yet init xUI');
	}
//
}
function syncInput(entry)
{
	if((xUI.noSync)||(xUI.viewOnly)) return;
//カーソル入力同期
//		表示更新
	if (document.getElementById("iNputbOx").value!=entry)
	document.getElementById("iNputbOx").value=entry;
	if (document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).innerHTML!=entry)
		document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).innerHTML=(entry=="")?"<br>":entry;
	var paintColor=(xUI.eXMode>=2)?xUI.inputModeColor.EXTENDeddt:xUI.inputModeColor.NORMALeddt;
	if (! xUI.edchg) paintColor=xUI.selectedColor;
	if (document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).style.backgroundColor!=paintColor)
		document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).style.backgroundColor=paintColor;
}

/*						----- io.js
りまぴん
入出力関連プロシージャ

ウインドウの開閉コントロール
jQueryライブラリの使用に置き換えるので
ルーチンの見なおし
2013.02.26
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
/**
    テキストエリアに値を挿入する編集メソッド
    クリックの発生したエレメントの値 をinsertTargetのinsertメソッドに渡しフォーカスを移す
*/
editMemo=function(e,insertTarget){
	var myTarget=e.target;
	var myValue=(myTarget.value)?myTarget.value:myTarget.innerHTML;
	insertTarget.insert(myValue);
	insertTarget.focus();
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
引数:	ソース文字列　ListStr /   再帰呼出しフラグ　rcl
戻値:	putメソッドの引数ストリーム
	マクロ記法の文字列をputメソッドに引き渡し可能なストリームへ展開する
	リスト展開エンジンは汎用性を持たせたいので、無理やりグローバルに置いてある。
	要注意
	戻り値の形式は　"1,,2,,3,,4,,5"等のスピン展開後のカンマ区切りテキストストリーム
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
//	台詞トラックの場合、カギ括弧の中をすべてセパレートして戻す
//　ダイアログトラックは固定ではなくなったので判定を変更
//  コメントトラックを排除する必要あり
//この判定をxUIに依存すると汎用性がなくなるので、コール側で引数渡しに変更する必要あり？
	if (
		((xUI.Select[0]<(XPS.xpsTracks.length-2))&&
		(XPS.xpsTracks[xUI.Select[0]].option=="dialog"))
	){
        if(ListStr.indexOf('「')>=0){
            console.log(ListStr);
            var mySound = new nas.AnimationSound(ListStr);
            mySound.parseContent();
            console.log(mySound)
            var sectionLength= xUI.spinValue * (mySound.bodyText.length + mySound.comments.length);
    　      ListStr= mySound.getStream(sectionLength).join(',');
    　      return ListStr;
        }
/*
    201801変更
    ダイアログの展開をオブジェクトメソッドに移行
    引数がシナリオ形式であること　ListStr.indexOf("「")>0
    スピンの量をみて展開範囲を得る
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
	ListStr=ListStr.replace(/〜/g,"⌇");//音引き縦棒
*/
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
引数：動作モード
true時はhtmlをそのまま文字列でリザルトするがfalseの際は別ウィンドウを開いて書き出す
"body-only"　で<body>タグ内のHTML本体のみを返す
*/
function printHTML(mode){
/*
    画像パーツの転送を行うかまたは、自分自身でレンダリングできるようにする必要あり
    エンドマーカーの配置も必要 0814
 */

if(! mode){mode=false;}
var myBody="";

//body-only時省略分
    if(mode!='body-only'){
myBody+='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja">';
myBody+='<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>';
myBody+=XPS.scene.toString()+XPS.cut.toString();
// myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="http://www.nekomataya.info/test/remaping.js/template/printout.css">';
if((xUI.onSite)&&(window.location.href.indexOf(serviceAgent.currentRepository.url)>=0)){
    myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="/remaping/template/printout.css">';//for TEST onSite
    var libOffset = '/remaping/'
}else{
    myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="'+location+'template/printout.css">';//for TEST offSite
    var libOffset = './'   
}

/*
if(String(location).indexOf('https')!=0){
myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="http://www.nekomataya.info/test/remaping.js/template/printout.css">';//for TEST onWeb
}else{
myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="https://nekomataya.sakura.ne.jp/test/remaping.js/template/printout.css">';//for TEST on https
}
*/
/* ライブラリロード */
myBody+='<script src="'+libOffset+'lib/jquery.js"></script>';
myBody+='<script src="'+libOffset+'lib/jquery-ui.js"></script>';
myBody+='<script src="'+libOffset+'lib/ecl/ecl.js"></script>';
myBody+='<script src="'+libOffset+'config.js"></script>';
myBody+='<script src="'+libOffset+'nas/lib/nas_common.js"></script>';
myBody+='<script src="'+libOffset+'nas/lib/nas_common_HTML.js"></script>';
myBody+='<script src="'+libOffset+'nas/newValueConstractors.js"></script>';
myBody+='<script src="'+libOffset+'nas/pmio.js"></script>';
myBody+='<script src="'+libOffset+'nas/configPM.js"></script>';
myBody+='<script src="'+libOffset+'nas/lib/mapio.js"></script>';
myBody+='<script src="'+libOffset+'nas/lib/xpsio.js"></script>';
myBody+='<script src="'+libOffset+'nas/scripts/remaping/airUI.js"></script>';
myBody+='<script src="'+libOffset+'nas/scripts/remaping/remaping.js"></script>';


myBody += '<script>replaceEndMarker=function (){var endPoint = JSON.parse(document.getElementById("endMarker").innerHTML);    if(!(endPoint instanceof Array)) {endPoint=[1,endPoint]};    var endCellLeft  = document.getElementById("0_"+String(endPoint[1]-1));    var endCellRight = document.getElementById(String(endPoint[0]-1)+"_"+String(endPoint[1]-1));    var parentSheet  = document.getElementById("endMarker").parentNode;    var endCellLeftRect  = endCellLeft.getBoundingClientRect();    var endCellRightRect = endCellRight.getBoundingClientRect();    var parentRect   = parentSheet.getBoundingClientRect();    var markerRect   = document.getElementById("endMarker").getBoundingClientRect();    console.log (markerRect);    var markerWidth  = String(endCellRightRect.right-endCellLeftRect.left)+"px";var markerTop    = String(endCellLeftRect.bottom - parentRect.bottom + (markerRect.height))+ "px" ;    var markerLeft   = String(endCellLeftRect.left-parentRect.left)+"px";document.getElementById("endMarker").style.left  = markerLeft;   document.getElementById("endMarker").style.top   = markerTop;   document.getElementById("endMarker").style.width = markerWidth; document.getElementById("endMarker").innerHTML = ":: end ::";};resizePage2Paper=function(){var areaHeight = 1250;xUI.adjustScale([1,1]); var pgRect=document.getElementById("printPg1").getBoundingClientRect(); xUI.adjustScale([1,areaHeight/pgRect.height]);};</script>';
//myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="./template/printout.css">';
myBody+='<style type="text/css"> * { margin: 0; padding: 0;} #fixed {position: fixed;} #sheet_view {  margin:0; }</style></head>';//

myBody+='<body ';//"
myBody+= 'onload="var nRS = setTimeout(\'nas_Prt_Startup(function(){xUI.syncSheetCell();xUI.syncSheetCell(undefined,undefined,true);xUI.Cgl.refresh();})\',10);" ';//
//myBody+= 'onload="var nRS = setTimeout(\'nas_Prt_Startup(function(){xUI.syncSheetCell();xUI.syncSheetCell(undefined,undefined,true);xUI.Cgl.refresh();window.print();window.close();})\',10);" ';//
myBody+='" >';//
    };//ここまでbody-only時は省力

myBody+='<textarea id="startupXPS" >';
myBody+= xUI.XPS.toString();
myBody+='</textarea>';
myBody+='<textarea id="referenceXPS">';
myBody+= xUI.referenceXPS.toString();
myBody+='</textarea>';
myBody+='<div id="sheet_body">';//

	for (Page=1 ;Page <=Math.ceil(XPS.duration()/xUI.PageLength);Page++)
	{
	    myBody+= '<div class=printPage id=printPg'+String(Page)+'>';
	    myBody+= '<div class=headerArea id=pg'+String(Page)+'Header>';
		myBody+= xUI.headerView(Page);
		myBody+= '<span class=pgNm>( p '+nas.Zf(Page,3)+' )</span><br></div>';
	// myBody+= '<div class="tableArea"  id=pg'+String(Page)+'Table>';
		myBody+= xUI.pageView(Page);
	//myBody+= '</div></div>'
	    myBody+= '</div>'
	};
//myBody+='<div class="screenSpace"></div>';



myBody+='</div>';

if(mode != 'body-only') myBody+='</body></html>';

if(mode){return myBody;}else{
_w=window.open ("","xpsFile","width=1120,height=1600,scrollbars=yes,menubar=yes");

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

    印刷環境ではファイルの入出力自体をサポートしないのでイベントリスナの設定をスキップする
    id="myCurrentFile"のエレメントの有無で判定
*/
window.addEventListener('DOMContentLoaded', function() {
// ファイルが指定されたタイミングで、その内容を表示
  if(document.getElementById("myCurrentFile")){
    console.log('addEventListener');
  document.getElementById("myCurrentFile").addEventListener('change', function(e){
    xUI.importBox.import(this.files,processImport)}, true);//myCrrentFile.addEvent
  }
});//window.addEvent

/**
りまぴん用インポート処理関数
トリガーはファイルトレーラーの変更
複数ファイルの場合はファイル名でデータを補ってカレントリポジトリに一括送信（管理モードでのみ実行）
単一ファイルはデータウエルに読み込む
    ユーザ選択追加処理として以下のマトリクスで分岐

xUI.uiMode
floating    load/Floationg
management  load/Floationg
browsing    load/Floationg setUImode('floationg')
production  import/currentStatus


    
*/
var processImport=function(autoBuffer){
    if(typeof autoBuffer == 'undefined') autoBuffer = true;
  if(autoBuffer){
//        コンバート済みデータが格納されている配列はxUI.importBox.selectedContents
    if(xUI.importBox.selectedContents.length > 1){
        for(var dix=0;dix<xUI.importBox.selectedContents.length;dix++){
            console.log(xUI.importBox.selectedContents[dix].getIdentifier());
            console.log(xUI.importBox.selectedContents[dix].toString());
        }
    }else{
        if((xUI.uiMode=='production')&&(xUI.sessionRetrace == 0)){
//インポート時 undoが必要なケースでは xUI.putに渡す
            xUI.put(xUI.importBox.selectedContents[0]);
        }else{
//undoリセットが望ましい場合はxUI.resetSheetに渡してリセットする
            xUI.resetSheet(xUI.importBox.selectedContents[0]);
        }
    }
  }else{
    if(xUI.XPS.readIN(xUI.data_well.value)){
        xUI.resetSheet();
    }else{
        return false;
    }
  }
      if(xUI.uiMode=='browsing') {xUI.setUImode('floating')};
      xUI.sWitchPanel('Data');

}

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
	sWap.camColumns = (xUI.cameraSpan<CameraworkColumns)?CameraworkColumns:xUI.cameraSpan;//CameraworkColumns ; //現在固定4を標準にしてオーバー分を追加
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
                top:e.pageY  - jQuery("#optionPanelTbx").data("clickPointY")+myOffset.top+"px",
                left:e.pageX - jQuery("#optionPanelTbx").data("clickPointX")+myOffset.left+"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
/*
OptionPanelSnd
  パネル上で全体のonfocusイベントに対するiNputbOxへのフォーカス遷移を抑制することが必要
*/
jQuery(function(){
//    jQuery("#optionPanelSnd").unbind("mouseover");
    jQuery("a.openSnd").click(function(){
        jQuery("#optionPanelSnd").show();
        return false;
    })
    jQuery("#optionPanelSnd a.close").click(function(){
        jQuery("#optionPanelSnd").hide();
        return false;
    })
    jQuery("#optionPanelSnd a.minimize").click(function(){
        if(jQuery("#optionPanelSnd").height()>100){
           jQuery("#formSnd").hide();
           jQuery("#optionPanelSnd").height(24);
	}else{
           jQuery("#formSnd").show();
           jQuery("#optionPanelSnd").height(240);
	}
        return false;
    })
    jQuery("#optionPanelSnd dl dt").mousedown(function(e){
        jQuery("#optionPanelSnd")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelSnd").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelSnd").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelSnd").css({
                top:e.pageY  - jQuery("#optionPanelSnd").data("clickPointY")+myOffset.top+"px",
                left:e.pageX - jQuery("#optionPanelSnd").data("clickPointX")+myOffset.left+"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
//パネル上のデータリストを初期化する
//    document.getElementById("sndCastList")
//    document.getElementById("soundProplist")
//    SoundEdit.PanelInit();
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
/*          ---------- cookie.js
	汎用的なクッキー関連メソッド??

	nasオブジェクトのメソッドとして実装する。
	nas.cookie.toString()//クッキー文字列
	nas.cookie.write()
	nas.cookie.read()
*/
//クッキー文字列を作って書き込み

function buildCk(){
var myCookie = new Array();
///////	クッキー配列用のデータを取得。
//	クッキーID:0をシートカラー及び印刷用紙サイズに設定
//	[0] SheetProp
	if (useCookie.SheetProp){
		SheetBaseColor	=xUI.sheetLooks.SheetBaseColor;
	    pageAttributes=[SheetBaseColor];
	}else{
	    pageAttributes=[false];
	}
myCookie[0]=pageAttributes;

//	[1] XPSAttrib
	myTitle		= (useCookie.XPSAttrib)?XPS.title:null;
	mySubTitle	= (useCookie.XPSAttrib)?XPS.subtitle:null;
	myOpus		= (useCookie.XPSAttrib)?XPS.opus:null;
	myFrameRate	= (useCookie.XPSAttrib)?XPS.framerate:null;
	Sheet		= (useCookie.XPSAttrib)?nas.Frm2FCT(XPS.xpsTracks[0].length,3):null;//
    SoundColumns = (useCookie.XPSAttrib)?xUI.dialogCount:null;
	SheetLayers	= (useCookie.XPSAttrib)?xUI.timingCount:null;
    CameraworkColumns = (useCookie.XPSAttrib)?xUI.cameraCount:null;
    SfxColumns = (useCookie.XPSAttrib)?xUI.sfxCount:null;

myCookie[1]=[myTitle,mySubTitle,myOpus,myFrameRate,Sheet,SoundColumns,SheetLayers,CameraworkColumns,SfxColumns];

//	[2] UserName
	if(useCookie.UserName)	{
	    myName  = xUI.currentUser.toString();
	    myNames = xUI.recentUsers.convertStringArray();
	}else{
	    myName	= false;
	    myNames = [];
	}
myCookie[2]=[myName,myNames];

//	[3] KeyOptions
	BlankMethod	     = (useCookie.KeyOptions)?xUI.blmtd:null;
	BlankPosition    = (useCookie.KeyOptions)?xUI.blpos:null;
	AEVersion	     = (useCookie.KeyOptions)?xUI.aeVersion:null;
	KEYMethod	     = (useCookie.KeyOptions)?xUI.keyMethod:null;
	TimeShift	     = (useCookie.KeyOptions)?xUI.timeShift:null;
	FootageFramerate = (useCookie.KeyOptions)?xUI.fpsF:null;
	defaultSIZE	     = (useCookie.KeyOptions)?[xUI.dfX,xUI.dfY,xUI.dfA].toString():"auto";

myCookie[3]=[BlankMethod,BlankPosition,AEVersion,KEYMethod,TimeShift,FootageFramerate,defaultSIZE];

//	[4] SheetOptions
	SpinValue 	  = (useCookie.SheetOptions)?xUI.spinValue:null;
	SpinSelect	  = (useCookie.SheetOptions)?xUI.spinSelect:null;
	SheetLength	  = (useCookie.SheetOptions)?xUI.SheetLength:null;
	SheetPageCols = (useCookie.SheetOptions)?xUI.PageCols:null;
	FootMark	  = (useCookie.SheetOptions)?xUI.footMark:null;
	
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
//		ToolView.push(($('#'+UIViewIdList[ix]).is(':visible'))?1:0);				
//		ToolView.push(($('#'+UIViewIdList[ix]).isVisible())?1:0);				
		ToolView.push(($('#'+UIViewIdList[ix]).css('display')=='none')? 0:1);				
	};
	ToolView=ToolView.join("");
//	alert(ToolView);//　beforunloadで呼び出すのでその際のアラート、コンソールは読めない
};//記録チェックがない場合は元のデータを変更しない
myCookie[7]=ToolView;
if(dbg) console.log(ToolView);
//	alert(myCookie);

return myCookie;
}

function writeCk(myCookie){
	if (!navigator.cookieEnabled){
		if (dbg){alert("クッキーが有効でないカンジ?")};
		return false;
	}
if(typeof myCookie == "undefined") myCookie=buildCk();
//console.log(myCookie);
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
		var rEmaping = JSON.parse(breakValue(document.cookie,"rEmaping"));
	}else{
		return false;
	}
//	[0] SheetProps
	if (useCookie.SheetProp){
	if(rEmaping[0][0]) SheetBaseColor	= unescape(rEmaping[0][0]);
	}

//	[1] XPSAttrib
	if (useCookie.XPSAttrib){
	if(rEmaping[1][0]) myTitle      = unescape(rEmaping[1][0]);
	if(rEmaping[1][1]) mySubTitle   = unescape(rEmaping[1][1]);
	if(rEmaping[1][2]) myOpus       = unescape(rEmaping[1][2]);
	if(rEmaping[1][3]) myFrameRate  = unescape(rEmaping[1][3]);
	if(rEmaping[1][4]) Sheet        = unescape(rEmaping[1][4]);
    if(rEmaping[1][5]) SoundColumns      = unescape(rEmaping[1][5]);
    if(rEmaping[1][6]) SheetLayers       = unescape(rEmaping[1][6]);
    if(rEmaping[1][7]) CameraworkColumns = unescape(rEmaping[1][7]);
    if(rEmaping[1][8]) SfxColumns        = unescape(rEmaping[1][8]);
	}

//	[2] UserName
	if(useCookie.UserName){
	    if(rEmaping[2]) {
		    myName  = unescape(rEmaping[2][0]);
		    myNames = [];
		    for(var ix=0;ix<rEmaping[2][1].length;ix++){
			myNames.push(unescape(rEmaping[2][1][ix]));
			}
	    }else{
	        myName = "";
	        myNames = [myName];
	    }
	}

//	[3] KeyOptions
	if(useCookie.KeyOptions){
	if(rEmaping[3][0]) BlankMethod      = unescape(rEmaping[3][0]);
	if(rEmaping[3][1]) BlankPosition    = unescape(rEmaping[3][1]);
	if(rEmaping[3][2]) AEVersion	    = unescape(rEmaping[3][2]);
	if(rEmaping[3][3]) KEYMethod	    = unescape(rEmaping[3][3]);
	if(rEmaping[3][4]) TimeShift	    = (rEmaping[3][4]=="true")?true:false;
	if(rEmaping[3][5]) FootageFramerate = unescape(rEmaping[3][5]);
	if(rEmaping[3][6]) defaultSIZE	    = unescape(rEmaping[3][6].toString());
	}

//	[4] SheetOptions
	if(useCookie.SheetOptions){
	if(rEmaping[4][0]) SpinValue        =parseInt(rEmaping[4][0],10);
	if(rEmaping[4][1]) SpinSelect       =(rEmaping[4][1]=="true")?true:false;
	if(rEmaping[4][2]) SheetLength      =parseInt(rEmaping[4][2],10);
	if(rEmaping[4][3]) SheetPageCols    =parseInt(rEmaping[4][3],10);
	if(rEmaping[4][4]) FootMark         =(rEmaping[4][4]=="true")?true:false;
	}

//	[5] CounterType
	if(useCookie.CounterType){
	
	if(rEmaping[5][0] instanceof Array) Counter0 =	[parseInt(rEmaping[5][0][0],10),parseInt(rEmaping[5][0][1],10)];
	if(rEmaping[5][1] instanceof Array) Counter1 =	[parseInt(rEmaping[5][1][0],10),parseInt(rEmaping[5][1][1],10)];
	}

//	[6] UIOptions
	if(useCookie.UIOptions){
	if(rEmaping[6][0]) SLoop        = (rEmaping[6][0]=="true")?true:false;
	if(rEmaping[6][1]) CLoop        = (rEmaping[6][1]=="true")?true:false;
	if(rEmaping[6][2]) AutoScroll   = (rEmaping[6][2]=="true")?true:false;
	if(rEmaping[6][3]) TabSpin      = (rEmaping[6][3]=="true")?true:false;
	if(rEmaping[6][4]) ViewMode     = rEmaping[6][4];
	}
//	[7] UIView
	if(useCookie.UIView){
	if(rEmaping[7]) ToolView	=rEmaping[7];
	}
console.log(rEmaping)
}
//	クッキー削除
function dlCk() {
	ckName = 'rEmaping'; document.cookie = ckName + '=;expires=Thu,01-Jan-70 00:00:01 GMT';
	useCookie=false;
	alert(localize(nas.uiMsg.dmCookieRemoved));
}
function resetCk()
{
	dlCk();
	writeCk();
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

//
/*          ---------headline.js
情報エリア用データ更新モジュール

*/
//
//親ウィンドウを設定

function getProp(msg,prp){
	msg=(msg)?msg:prp+" : こちらの値を編集してください";
	var org_dat=XPS[prp];
	var new_dat=prompt(msg , org_dat);
	
	if (new_dat && new_dat!=org_dat)
	{
		XPS[prp]=new_dat;
		sync(prp);
	}
};
//各種設定表示更新
function chgDuration(targetProp,prevalue,newvalue)
{
	if( newvalue!=prevalue){
	var newTime= XPS.time();
	var newTrin=new Array();
		newTrin[0]= XPS["trin"][0];
		newTrin[1]= XPS["trin"][1];
	var newTrout=new Array();
		newTrout[0]= XPS["trout"][0];
		newTrout[1]= XPS["trout"][1];
	switch(targetProp){
case	"time":
	newTime = nas.FCT2Frm(newvalue);
		break;
case	"trin":
	if (newvalue.match(/(.+)\s\((.+)\)/))
		{
	newTrin[1]=RegExp.$1;
	newTrin[0]=nas.FCT2Frm(RegExp.$2);
		}else{
	alert(localize(nas.uiMsg.failed));//"処理できませんでした"
	return;
		};
		break;
case	"trout":
	if (newvalue.match(/([^\(]+)\s\((.+)\)/))
		{
	newTrout[1]=RegExp.$1;
	newTrout[0]=nas.FCT2Frm(RegExp.$2);
		}else{
	alert(localize(nas.uiMsg.failed));//"処理できませんでした"
	return;
		};
		break;
default	:return;
	}
	}else{	return;	}
//alert(newTime+"\n"+newTrin.join("/")+"\n"+newTrout.join("/"));
//	return;
//	現在の値からカット継続時間を一時的に生成
	var duration=newTime+(newTrin[0]+newTrout[0])/2;
	var oldduration= XPS.duration();
	var durationUp=(duration>oldduration)? true : false ;

//	カット尺更新確認
		if(duration!=oldduration){
		var msg = localize(nas.uiMsg.alertDurationchange);
		if (!durationUp) msg +="\n\t" + localize(nas.uiMsg.alertDiscardframes);
		msg += "\n" + localize(nas.uiMsg.confirmExecute);
//確認:
	if(confirm(msg)){
//	設定尺が現在の編集位置よりも短い場合は編集位置を調整
		if(oldduration>duration){
			xUI.selectCell ("1_"+(duration-1).toString());
		};
//ターゲットから複製を作ってサイズを調整
	var newXPS=new Xps();
	newXPS.readIN( xUI.XPS.toString());
    newXPS.setDuration(duration);
		newXPS["trin"]=newTrin;
		newXPS["trout"]=newTrout;
		xUI.put(newXPS);
		xUI.setStored("force");//変更フラグを立てる
	}
		sync("info_");
		}else{
	//
	xUI.setStored("force");
	if(XPS["trin"][1] != newTrin[1]){XPS.trin[1] =newTrin[1] ; sync("trin");};
	if(XPS["trout"][1]!=newTrout[1]){XPS.trout[1]=newTrout[1]; sync("trout");};
		}
//更新操作終了
}

function chkPostat(){
	var blmtd=document.getElementById("blmtd");
	var blpos=document.getElementById("blpos");
	switch(blmtd.value)
	{
	case "file"	:
		var status=false;break;
	case "opacity"	:	;
	case "wipe"	:	;
		var status=true;
		blpos.value="end";break;
	case "expression1"	:
		var status=true;
		blpos.value="first";break;
	case "expression2"	:
		var status=true;
		blpos.value="end";break;
	defaule	:
		var status=true;
		blpos.value="build";break;
	}
	if (blpos.disabled!=status)
		blpos.disabled=status;
}
function chgValue(id)
{
	var myTarget=document.getElementById(id);
	switch (id)
	{
case	"memo"	:
case	"noteText"	:
//		XPS["memo"]=myTarget.value;
		xUI.put(["noteText.xpsTracks",myTarget.value]);
		break;
		
case	"blmtd"	:
//		XPS["layers"][xUI.Select[0]-1][id]=myTarget.value;
		xUI.put([[id,xUI.Select[0],"xpsTracks"].join("."),myTarget.value]);
		chkPostat();
		break;

case	"blpos"	:
//		XPS["layers"][xUI.Select[0]-1][id]=myTarget.value;
		xUI.put([[id,xUI.Select[0],"xpsTracks"].join("."),myTarget.value]);
		break;

case	"aeVersion"	:
case	"keyMethod"	:
		xUI[id]=myTarget.value;
		break;

case	"fct0"	:
case	"fct1"	:
	xUI.selectCell(xUI.Select[0]+'_'+
		nas.FCT2Frm(myTarget.value));
	;break;
case	"selall"	:
		xUI.selectCell(xUI.Select[0]+"_0");
		xUI.selection(
			xUI.Select[0]+"_"+XPS.duration()
		);break;
case	"copy"	:	xUI.copy();break;
case	"cut"	:	xUI.cut();break;
case	"paste"	:	xUI.paste();break;
case	"keyArea"	:
	var Lvl=xUI.Select[0];
	if(Lvl>0 && Lvl<=(XPS.xpsTracks.length-1))
	{	writeAEKey(Lvl) }
	;break;
case	"areaXPS"	:
	document.getElementById("rEsult").value=XPS.toString();
	document.getElementById("rEsult").focus();
	;break;
case	"iNputbOx"	:	hello();break;
case	"ok"	:	hello();break;
case	"ng"	:	hello();break;
case	"undo"	:	xUI.undo();break;
case	"redo"	:	xUI.redo();break;
case	"up"	:	;//スピン
case	"down"	:	;
case	"right"	:	;
case	"left"	:	;
case	"fwd"	:	;
case	"back"	:	;
	xUI.spin(id);break;
case	"home"	:	;xUI.selectCell(xUI.Select[0]+"_0");break;
case	"end"	:	;xUI.selectCell(xUI.Select[0]+"_"+XPS.duration());break;
//
case	"spin_V"	:
	xUI.spin(myTarget.value);break;
case	"v_up"	:	;//スピン関連
case	"v_dn"	:	;//IDとキーワードを合わせてそのまま送る
case	"pgdn"	:	;
case	"pgup"	:
	xUI.spin(id);break;
case	"clearFS"	:	;//フットスタンプクリア
	xUI.footstampClear();break;
case	"layer"	:	;//レイヤ変更
	if (document.getElementById("single")){}

	xUI.selectCell(
		(myTarget.selectedIndex).toString()+
		"_"+xUI.Select[1]
	);
	reWriteCS();//cセレクタの書き直し
	break;
case	"cell"	:	;//セルの入力
	xUI.put((myTarget.selectedIndex+1));
	xUI.spin("fwd");

	break;
case	"fav"	:	;//文字の入力
	xUI.put(xUI.favoriteWords[myTarget.selectedIndex]);
	xUI.spin("fwd");

	break;
case	"TSXall"	:	return false;//捨てる
	break;
default:	alert(id);return false;
	}
//	alert(id);
return false;
}
//チェックボックストグル操作
function chg(id)
{
	var myCkBox=document.getElementById(id);
	myCkBox.checked=
	(myCkBox.checked) ?
	false	:	true	;
		chgValue(id);
	return false;
}
//単独書き換え

rewriteValueByEvt=function(e){
//ターゲットがクリックされた時、イベントから引数を組み立てて関数を呼ぶ
//alert(e);
if(xUI.viewOnly) return false;
	var TargeT=e.target;var Bt=e.which;//ターゲットオブジェクト取得
	var myPrp=TargeT.id;
	var msg="";
	var currentValue=null;
	if ($('#'+myPrp).attr('lock')=="yes") {return false;}
	switch(myPrp){
	case "time":
		msg="カットの時間を入力してください。\n";
	break;
	case "trin":
		msg="トランシット情報。時間は括弧で括って、キャプションとの間は空白。\n書式:caption (timecode) /例: c10-c11 wipe. (1+12.)";
		currentValue=this.XPS.trin[1]+"\ \("+nas.Frm2FCT(this.XPS.trin[0],3,0)+"\)";
	break;
	case "trout":
		msg="トランシット情報。時間は括弧で括って、キャプションとの間は空白。\n書式:caption (timecode) /例: c10-c11 wipe. (1+12.)";
		currentValue=this.XPS.trout[1]+"\ \("+nas.Frm2FCT(this.XPS.trout[0],3,0)+"\)";
	break;
	case "scene_cut":
 		msg="シーン・カットナンバーを変更します。データは 空白区切。\nひとつだとカット番号";
	break;
		case "update_user":
 		msg="作業ユーザ名を変更します。\n";
	break;
		case "opus":
 		msg="制作ナンバーを変更します。\n";
	break;
		case "title":
 		msg="タイトルを変更します。\n";
 		currentValue=this.XPS.title;
	break;
		case "subtitle":
 		msg="サブタイトルを変更します。\n";
	break;
	}
	xUI.printStatus(msg);

	var myFunction=function(){
		var prp=this.target.id
		var org_dat=XPS[prp];
		var new_dat=this.newContent;
		switch (prp){
		case "scene_cut":
		 var prevalue=this.orgContent
		 var newvalue=this.newContent;
		 if(newvalue != prevalue){
		 var newvalues=newvalue.split(" ");
		// XPS.scene=(newvalues.length>1)?newvalues[0]:"";
	xUI.put(["scene",(newvalues.length>1)?newvalues[0]:""]);
		 XPS.cut  =(newvalues.length>1)?newvalues[1]:newvalues[0];
	xUI.put(["cut",(newvalues.length>1)?newvalues[1]:newvalues[0]]);
//		 sync("scene");
		 xUI.setStored("force");
		 }
		 sync("cut");
			break;
		case "time":
		case "trin":
		case "trout":
		 var prevalue=this.orgContent
		 var newvalue=this.newContent;
		 if(newvalue != prevalue){chgDuration(prp,prevalue,newvalue);}else{sync("info_");}
			break;
		case "update_user":
		case "opus":
		case "title":
		case "subtitle":
		 default:
dbgPut("new_dat :"+new_dat)
//		 if (new_dat && new_dat!=org_dat)
		 if (new_dat!=org_dat)
		 {
		//	XPS[prp]=new_dat;
			xUI.put([prp,new_dat]);
			xUI.setStored("force");
		 }
			sync(prp);
		}
		xUI.printStatus();//クリア
	}
	if((TargeT.id)&&(TargeT instanceof HTMLTableCellElement)){
		nas.editTableCell(TargeT,"input",currentValue,myFunction);
//		document.getElementById(TargeT+"_ipt").style.padding="0";
	}
}

function rewriteValue(id){
    if(xUI.edchg) xUI.put(document.getElementById('iNputbOx').value);
var msg="";
var prp="";
	switch (id){
case	"opus":
	msg="制作ナンバーを変更します。\n";
	prp=id;
	getProp(msg,prp);
	break;
case	"title":
	msg="タイトルを変更します。\n";
	prp=id;
	getProp(msg,prp);
	break;
case	"subtitle":
	msg="サブタイトルを変更します。\n";
	prp=id;
	getProp(msg,prp);
	break;
case	"scene_cut":
	msg="シーン・カットナンバーを変更します。\nデータは 空白で区切ってふたつ書き込んでください。\n一つだけ書くとカット番号です";
	var prevalue=(XPS.scene)?XPS.scene+" "+XPS.cut:XPS.cut;

	var newvalue=prompt(msg,prevalue);
	if(newvalue != prevalue){
		var newvalues=newvalue.split(" ");
	XPS.scene	=(newvalues.length > 1)?newvalues[0]:"";
	XPS.cut	=(newvalues.length > 1)?newvalues[1]:newvalues[0];
//		sync("scene");
		sync("cut");
	}
	;break;
case	"time":
case	"trin":
case	"trout":
	chgDuration(id);
	break;

case	"update_user":
	msg="作業ユーザを変更します。\n";
	prp=id;
	getProp(msg,prp);
	break;
	}
//
xUI.setStored("force");sync();
}
/*	暫定版データエコーCGI 呼び出し
引数:DLファイル名    

	CGI呼び出しの際に、フォイル名の確認を行うように変更
	ただしオブションで機能を切り離し可能に
    引数によってダイアログを省略
    引数がなければ、自動生成のファイル名を作成してダイアログで確認
 */
function callEcho(dlName,callback){
var msg = localize(nas.uiMsg.confirmCallecho);
var title = localize(nas.uiMsg.saveToDonloadfolder);
    if(!dlName){
nas.showModalDialog(" prompt",msg,title,xUI.getFileName()+'\.xps',function(){
	if(this.status==0){
	  var storeName=this.value;
	  xUI.setStored("current");
	  sync();
		//ファイル保存を行うのであらかじめリセットする;
	  document.saveXps.action=ServiceUrl+'COMMAND=save&';
	  document.saveXps.COMMAND.value ='save';
	  document.saveXps.encode.value  ='utf8';
	  document.saveXps.XPSBody.value=encodeURI(XPS.toString());
	  document.saveXps.XPSFilename.value=storeName;
	  document.saveXps.submit();
      if(callback instanceof Function){callback();}; 
	}
})
    }else{
	  xUI.setStored("current");
	  sync();
		//ファイル保存を行うのであらかじめリセットする;
	  document.saveXps.action=ServiceUrl+'COMMAND=save&';
	  document.saveXps.COMMAND.value ='save';
	  document.saveXps.encode.value  ='utf8';
	  document.saveXps.XPSBody.value=encodeURI(XPS.toString());
	  document.saveXps.XPSFilename.value=dlName+'.xps';
	  document.saveXps.submit();
      if(callback instanceof Function){callback();}; 
    }
}
/*	拡張子を引数にしてコールする
txt,html,ard,tsh,eps,ard　など
送信データ本体は、document.saveXps.XPSBody.value なので　あらかじめ値をセットしてからコールする必要あり
:nas.uiMsg
*/
function callEchoExport(myExt)
{
   var myEncoding="utf8";//デフォルトutf-8
   var sendData=xUI.data_well.value;
   
var form={
html:"documentHTML",
xmap:"documentxMap",
xps:"documentXps",
ard:"documentArd",
ardj:"documentArdj",
csv:"documentCSV",
sts:"documentSTS",
tsh:"documentTSheet"
}
		//ファイル保存ではなくエクスポートなので環境リセットは省略;
   if(! myExt){myExt="txt";}
   switch (myExt){
	case "tsh":
		sendData=sendData.replace(/\r?\n/g,"\r")+"\n";
	case "eps":
	case "ard":
		myEncoding="sjis";
	break;
	default:
		myEncoding="utf8";
   }
  var msg = localize(nas.uiMsg.confirmCallechoSwap,localize(nas.uiMsg[form[myExt]]));
  var title = localize(nas.uiMsg.saveToDonloadfolderSwap,localize(nas.uiMsg[form[myExt]]))
nas.showModalDialog("prompt",msg,title,xUI.getFileName()+'\.'+myExt,function(){
	if(this.status==0){
//alert(myEncoding);
	document.saveXps.action=ServiceUrl+'COMMAND=save&';
	document.saveXps.COMMAND.value ='save';
	document.saveXps.encode.value  =myEncoding;
	switch (myEncoding){
	case "sjis" : document.saveXps.XPSBody.value =EscapeSJIS(sendData);break;
	case "eucjp": document.saveXps.XPSBody.value =EscapeEUCJP(sendData);break;
	default     : document.saveXps.XPSBody.value =encodeURI(sendData);
	}
	document.saveXps.XPSFilename.value=this.value;
	document.saveXps.submit();
	}
})
}
//現在のXPSデータを保存用HTMLに変換してエコーサービスへ送るルーチン

function callEchoHTML()
{
    var myEncoding="utf-8";//デフォルトutf8
    var sendData=printHTML(true);
    var myExt="html";
   
    var msg = localize(nas.uiMsg.confirmCallechoSwap,localize(nas.uiMsg.documentHTML));
    var title = localize(nas.uiMsg.saveToDonloadfolderSwap,localize(nas.uiMsg.documentHTML));
nas.showModalDialog("prompt",msg,title,xUI.getFileName()+'\.'+myExt,function(){
//	sendData=sendData.replace(/\r?\n/g,"\r\n");
	if(this.status==0){
	document.saveXps.action=ServiceUrl+'COMMAND=save&';
	document.saveXps.COMMAND.value ='save';
	document.saveXps.encode.value  =myEncoding;
	document.saveXps.XPSBody.value =sendData;
//	document.saveXps.XPSFilename.value=XPS.scene.toString()+XPS.cut.toString()+'\.'+myExt;
	document.saveXps.XPSFilename.value=this.value;//xUI.getFileName()+'\.'+myExt;
//send前にターゲットのiframeを確認して、無ければappendするコードをここへ挿入
	document.saveXps.submit();
	}
})
}
/*
	現行のデータをページ番号を指定してepsデータとして保存する関数
	epsデータは１ページ毎の別ファイルなので　複数葉の場合このダウンロードルーチンが
	ページごとに順次コールされる。
	名前付けや、番号付けはこの関数の外で行われる
*/

function callEchoEps(myContent,myName,myNumber)
{
   var myEncoding="sjis";//デフォルトsjis
   var sendData=myContent;
   var myExt="eps";

	sendData=sendData.replace(/\r?\n/g,"\r\n");

	document.saveXps.action=ServiceUrl+'COMMAND=save&';
	document.saveXps.target="window"+myNumber;
	document.saveXps.COMMAND.value ='save';
	document.saveXps.encode.value  =myEncoding;
	document.saveXps.XPSBody.value =EscapeSJIS(sendData);
	document.saveXps.XPSFilename.value=myName+"_"+myNumber+'\.'+myExt;
//send前にターゲットのiframeを確認して、無ければappendするコードをここへ挿入
	document.saveXps.submit();
}
/*				--------toolbox.js
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
case	"tBtrackSelect"	:	;//レイヤ変更
	if (document.getElementById("single")){}

	xUI.selectCell(
		(document.getElementById(id).selectedIndex).toString()+
		"_"+xUI.Select[1]
	);
	reWriteCS();//cセレクタの書き直し
	break;
case	"cell"	:	;//セルの入力
case	"tBitemSelect"	:	;//セルの入力
	xUI.put((document.getElementById(id).selectedIndex+1));
	xUI.spin("fwd");

	break;
case	"fav"	:	;//文字の一括入力
case	"tBkeywordSelect"	:	;//文字の一括入力
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
	document.getElementById("tBtrackSelect").innerHTML=Selector;
	reWriteCS();//cellセレクタの書き直し
	reWriteWS();//wordセレクタの書き直し
}

//入力補助セレクタを書き直す。
function reWriteCS(){
	var Selector='';
//セレクタはカレントのトラック種別で書き換えを行う。基本的にxMapエレメントを選択可能にするセレクタ
//xMapにグループが存在しないか、または不十分なときは基本データで埋める
switch (xUI.XPS.xpsTracks[xUI.Select[0]].option){
    case "timing":
		if(xUI.Select[0] < (XPS.xpsTracks.length-1))
	        var cOunt = (isNaN(XPS["xpsTracks"][xUI.Select[0]]["lot"]))?
            20 : XPS["xpsTracks"][xUI.Select[0]]["lot"];
        for(f=1;f<=cOunt;f++){Selector+='<option />'+String(f);};
    break;
    case "dialog":
//        var wOrds=["____","<SE>","<BGM>","<V.O>","<背>","!"];
//        for(f=1;f<=wOrds.length;f++){Selector+='<option value ="'+wOrds[f]+'">'+xUI.trTd(wOrds[f])+"</option>"};
//    break;
    default:
}
//	if(xUI.Select[0] >= xUI.dialogSpan || xUI.Select[0] < (XPS.xpsTracks.length-1)){};
	
	document.getElementById("tBitemSelect").innerHTML=Selector;
}
//お気に入り単語のセレクタを書き直す。
function reWriteWS(){
	var Selector='';
	var wCount=xUI.favoriteWords.length;
	for(id=0;id<wCount;id++){Selector+='<option />'+xUI.favoriteWords[id]};
		document.getElementById("tBkeywordSelect").innerHTML=Selector;
	}
//
function toss(target){document.getElementById(target).focus();};
//
function hello(){
    alert("この辺は、まだなのだ。\nのんびり待っててチョ。\n Unimplemented. Please wait and leisurely Jo ");
}
/**					------pref.js
	環境設定パネル
*/
//プリファレンスオブジェクト作成
function Pref(){
	this.changed=false;
//ブランク方式
	this.Lists = new Array();
	this.Lists["prefBlmtd"]=["file","opacity","wipe","channelShift","expression1"];
	this.Lists["prefBlpos"]=["first","end","none"];
	this.Lists["prefAeVersion"]=["8.0","10.0"];
/*	旧バージョンはサポート廃止
	this.Lists["prefAeVersion"]=["4.0","5.0","6.5","7.0","8.0"];
	this.Lists["prefKeyMethod"]=["min","opt","max"];
 */
	this.Lists["prefFpsF"]=["custom","auto","24","29.97","30","25","15","23.976","48","60"];
	this.Lists["prefFpsF"+"_name"]=["=CUSTOM=","コンポと同じ","FILM","NTSC","NDF","PAL","WEB","DF24","FR48","FR60"];
	this.Lists["prefDfSIZE"]=
["custom",
"640,480,1","720,480,0.9","720,486,0.9","720,540,1",
"1440,1024,1","2880,2048,1","1772,1329,1","1276,957,1",
"1280,720,1","1920,1080,1","1440,1080,1.333"];
	this.Lists["prefDfSIZE"+"_name"]=
["=CUSTOM=",
"VGA","DV","D1","D1sq",
"D4","D16","std-200dpi","std-144dpi",
"HD720","HDTV","HDV"];
//リスト検索 指配列内の定された要素のサブ要素をあたってヒットしたら要素番号を返す。
this.Lists.aserch=function(name,ael){if(this[name]){for (var n=0;n<this[name].length;n++){if(this[name][n]==ael)return n}};return -1;}

	this.userName=xUI.currentUser.toString();
//ユーザ名変更　プリファレンスパネルは大幅に変更があるのでこのメッセージの翻訳は保留　:nas.uiMsg.
this.chgMyName=function(newName){
	if(! newName){
		var msg = localize(nas.uiMsg.dmAskUserinfo)+
		        "\n\n ハンドル:メールアドレス / handle:uid@example.com ";
		    msg=[msg];
		    msg.push("<hr><input id='new_user_account' type='text' autocomplete='on' list='recentUsers' size=48 value=''>");
//ユーザ変更UIを拡充
/*
    ブラウザにユーザを複数記録する。
    記録形式は　handle:uid　に変更する
    UI上は、ユーザID(マスタープロパティ)とハンドル（補助プロパティ）を別に提示
    ユーザIDリストで表示する　 ユーザIDは、サインイン用のIDとして使用する

ユーザID
*/
		nas.showModalDialog("confirm",msg,localize(nas.uiMsg.userInfo),xUI.currentUser,function(){
		    if(this.status==0){
//このダイアログは直接xUIのプロパティを変更しない　一時オブジェクトを作成してPrefの表示のみを変更する
		        var newName = new nas.UserInfo(document.getElementById('new_user_account').value);
		        myPref.chgMyName(newName.toString());
		    }
		});
	}else{
	this.userName=newName;
	document.getElementById("myName").value=this.userName;
	if((!(xUI.currentUser.sameAs(this.userName)))&&(! this.changed)){this.changed=true;};
    }
}

//ブランク関連変更
this.chgblk=function(id)
{
	if (id!="prefBlpos")
	{
//	method変更
		switch (document.getElementById("prefBlmtd").value)
		{
		case "0":
			document.getElementById("prefBlpos").disabled=false;
			break	;
		case "1":	;
		case "2":	;
		case "4":	;
			document.getElementById("prefBlpos").value=1;//end
			document.getElementById("prefBlpos").disabled=true;
			break	;
		case "3":	;
		default :	;
			document.getElementById("prefBlpos").value=0;//first
			document.getElementById("prefBlpos").disabled=true;
		}

	}
		if(! this.changed){this.changed=true;};
}

//フッテージフレームレート変更
this.chgfpsF=function(id)
{
	if(id!="SetFpsF"){
//	値を直接書き換えた
	document.getElementById("SetFpsF").value=
(this.Lists.aserch("prefFpsF",document.getElementById("prefFpsF").value.toString())==-1)?
0 : this.Lists.aserch("prefFpsF",document.getElementById("prefFpsF").value.toString());
	}else{
//	セレクタを使った
	document.getElementById("prefFpsF").value=
(document.getElementById("SetFpsF").value == 0)?
document.getElementById("prefFpsF").value : this.Lists["prefFpsF"][document.getElementById("SetFpsF").value]
	}
		if(! this.changed){this.changed=true;};
}
//省略時サイズ変更
this.chgdfSIZE=function(id)
{
	if(id!="prefDfSizeSet"){
//	値を直接書き換えた
with(document){
	var name=[
	getElementById("prefDfX").value,
	getElementById("prefDfY").value,
	getElementById("prefDfA").value].join(",")}

	document.getElementById("prefDfSizeSet").value=
(this.Lists.aserch("prefDfSIZE",name)==-1)?
0 : this.Lists.aserch("prefDfSIZE",name);
	}else{
//	セレクタを使った

	var dfSIZE=this.Lists["prefDfSIZE"][document.getElementById("prefDfSizeSet").value];
		if(dfSIZE !="custom")
		{	with(document){
	getElementById("prefDfX").value=dfSIZE.split(",")[0];
	getElementById("prefDfY").value=dfSIZE.split(",")[1];
	getElementById("prefDfA").value=dfSIZE.split(",")[2];
			}
		}
	}
		if(! this.changed){this.changed=true;};
}

//フッテージフレームレート変更
this.chgprefFpsF=function(id)
{
	if(id!="SetFpsF"){
//	値を直接書き換えた
	document.getElementById("SetFpsF").value=
(this.Lists.aserch("prefFpsF",document.getElementById("prefFpsF").value.toString())==-1)?
0 : this.Lists.aserch("prefFpsF",document.getElementById("prefFpsF").value.toString());
	}else{
//	セレクタを使った
	document.getElementById("prefFpsF").value=
(document.getElementById("SetFpsF").value == 0)?
document.getElementById("prefFpsF").value : this.Lists["prefFpsF"][document.getElementById("SetFpsF").value]
	}
		if(! this.changed){this.changed=true;};
}
//チェックボックストグル操作
this.chg=function(id)
{
	document.getElementById(id).checked=
	(document.getElementById(id).checked) ?
	false	:	true	;
		if(! this.changed){this.changed=true;};
	return false;
}
//viewMode変更
this.chgVM=function(myValue)
{
		document.getElementById("vMWordProp").checked =(myValue=='WordProp')? true:false;
		document.getElementById("vMCompact").checked  =(myValue=='Compact')?  true:false;
	if(xUI.viewMode != myValue){
		if(! this.changed){this.changed=true;};
	}
	return false;
}
//
//各種設定表示初期化
this.getProp=function()
{
//作業ユーザ名
	this.chgMyName(xUI.currentUser.toString());
//表示モード
	this.chgVM(xUI["viewMode"]);
//カラセル関連
	var idNames =["prefBlmtd","prefBlpos","prefAeVersion"];//不要プロパティ＞,"prefKeyMethod"
	var iNames  =["blmtd"    ,"blpos"    ,"aeVersion"    ];//,"keyMethod"    
	for (var i=0;i<idNames.length;i++ ){
		idName=idNames[i];name=iNames[i];
		document.getElementById(idName).value=
		this.Lists.aserch(idName,xUI[name]);
	}
	this.chgblk();
//キーオプション
	var keyNames=["prefFpsF","prefDfX","prefDfY","prefDfA"];
	var kNames  =["fpsF"    ,"dfX"    ,"dfY"    ,"dfA"    ];
	for (var i=0;i<keyNames.length;i++){
		idName=keyNames[i];name=kNames[i];
		document.getElementById(idName).value=xUI[name];
	}
	this.chgprefFpsF();this.chgdfSIZE();

	document.getElementById("timeShift").checked=xUI["timeShift"];
// UI情報
//	document.getElementById("prefToolBar").checked=xUI["toolBar"];
//	document.getElementById("prefUtilBar").checked=xUI["utilBar"];

// シート情報
//ページ長・カラム・フットスタンプ
with(document){
	getElementById("prefSheetLength").value=xUI.SheetLength;//nas["SheetLength"];
	getElementById("prefPageCol").checked=(xUI["PageCols"]==2)? true : false ;
	getElementById("prefFootMark").checked=xUI["footMark"];

//カウンタ
	getElementById("FCTo0").value=10*(xUI["fct0"][0])+xUI["fct0"][1];
	getElementById("FCTo1").value=10*(xUI["fct1"][0])+xUI["fct1"][1];

//ループアクション
	getElementById("cLoop").checked=xUI["cLoop"];
	getElementById("sLoop").checked=xUI["sLoop"];
	getElementById("autoScroll").checked=xUI["autoScroll"];
	getElementById("tabSpin").checked=xUI["tabSpin"];

	getElementById("noSync").checked=xUI["noSync"];

//シートカラー
    getElementById("prefBGColor").value = xUI.sheetLooks.SheetBaseColor;
}
		if(this.changed){this.changed=false;};
}

//
//各種設定をドキュメントに反映
this.putProp=function ()
{
//名前変更
	var newUser=new nas.UserInfo(this.userName);
	if(!(xUI.currentUser.sameAs(newUser))){
		xUI.currentUser = newUser;//objectc
        xUI.recentUsers.add(newUser);//recentUsersにアイテム追加(トライ)
		XPS.update_user = xUI.currentUser;//object参照
		sync("recentUsers");
		sync("update_user");
		sync("current_user");
	};
//カラセル関連
	var blankNames=["prefBlmtd","prefBlpos","prefAeVersion"];//,"prefKeyMethod"
	var iNames    =["blmtd"    ,"blpos"    ,    "aeVersion"];//,    "keyMethod"
	for (var i=0;i<blankNames.length;i++){
		name=blankNames[i];
		xUI[iNames[i]]=this.Lists[name][document.getElementById(name).value];
	}
//キーオプション
	var kOptNames=["prefFpsF","prefDfX","prefDfY","prefDfA"];
	for (var i=0;i<kOptNames.length;i++){
		name=kOptNames[i];
		xUI[name]=document.getElementById(name).value;
	}
//読み込みタイムシフト
	xUI["timeShift"]=document.getElementById("timeShift").checked;
//UI情報
//	xUI["utilBar"]=document.getElementById("prefUtilBar").checked;
//viewMode
	var newMode=(document.getElementById("vMCompact").checked)?"Compact":"WordProp";
// シート情報
//ページ長・カラム・フットスタンプ
var cols=(document.getElementById("prefPageCol").checked==true)? 2 : 1;
if(	xUI.SheetLength !=document.getElementById("prefSheetLength").value ||
	xUI.PageCols !=  cols ||
	xUI.viewMode != newMode
)
{
//
	xUI["viewMode"] = newMode;
// シート外観の変更が必要なのでフォーカス関連を控えて再初期化する
//		Bkup=[xUI.Select,xUI.Selection];
	xUI.SheetLength=document.getElementById("prefSheetLength").value;
		xUI.PageLength	=xUI.SheetLength　*　XPS.framerate;
	xUI.PageCols= cols;
//実行
        xUI.resetSheet();
//		nas_Rmp_Init();
//フォーカス復帰
//		xUI.Select =Bkup[0];
//		xUI.Selection =Bkup[1];
//			xUI.selectCell();
}
	xUI.footMark=document.getElementById("prefFootMark").checked;

//カウンタ
	xUI["fct0"]=
	[Math.floor(document.getElementById("FCTo0").value/10),
	document.getElementById("FCTo0").value%10];
	xUI["fct1"]=
	[Math.floor(document.getElementById("FCTo1").value/10),
	document.getElementById("FCTo1").value%10];
	sync("fct");		
//ループアクション
	xUI["cLoop"]=document.getElementById("cLoop").checked;
	xUI["sLoop"]=document.getElementById("sLoop").checked;
	xUI["autoScroll"]=document.getElementById("autoScroll").checked;
	xUI["tabSpin"]=document.getElementById("tabSpin").checked;
//	これだけは一時変更(なくしても良いかも)
	xUI["noSync"]=document.getElementById("noSync").checked;

//背景色
if( document.getElementById("prefBGColor").value != xUI.sheetLooks.SheetBaseColor){
    xUI.setBackgroundColor(document.getElementById("prefBGColor").value);
}

		if(this.changed){this.changed=false;};
}
//
//パネル初期化

this.init=function(){	this.getProp(); }

//パネルを開く
//すでに開いていたらNOP Return
this.open=function(){
		if($("#optionPanelPref").is(":visible")){
			return false;
		}else{
			this.init();
			xUI.sWitchPanel("Pref");
		}
	return null;
}
/**
	パネルを閉じる
	変更フラグ立っていれば確認して操作を反映
 */
this.close=function(){
	if(this.changed){if(confirm(localize(nas.uiMsg.dmPrefConfirmSave
))){this.putProp();}};
		xUI.sWitchPanel("Pref");
}

}
//test
//プリファレンスオブジェクト作成
//	var myPref=new Pref();
//さらに初期化(初期化込みでコールされた時でも良いかも)
//	myPref.init();
/*						-------scene.js
シーン設定ボックス用関数
2007/06/24 ScenePrefオブジェクト化


シーンプロパティ編集UIにモードを設ける
通常時は
A	シーン（カット）登録　Title/Opus/S_C + time
B	シーン属性編集	各トラックのプロパティ編集
の２面UIとする
Aは管理DBにエントリ登録を行う専用UI
BはXps（ステージ）の属性編集UI
二つの概念を分離して、それぞれのUIを作成すること
*/

function ScenePref(){
//内容変更フラグ
	this.changed=false;
	document.getElementById("scnRest").disabled=(! this.changed);
//
	this.tracks=0;//ローカルの トラック数バッファ・スタートアップ内で初期化
//各種プロパティとセレクタの対応を格納する配列

	this.Lists = new Array();

	this.Lists["blmtd"]=["file","opacity","wipe","channelShift","expression1"];
	this.Lists["blpos"]=["first","end","none"];
	this.Lists["AEver"]=["8.0","10.0"];
	this.Lists["KEYmtd"]=["min","opt","max"];

	this.Lists["framerate"]=["custom","24","30","29.97","25","15","23.976","48","60"];
	this.Lists["framerate"+"_name"]=["=CUSTOM=","FILM","NTSC","NTSC-DF","PAL","WEB","DF24","FR48","FR60"];
	this.Lists["SIZEs"]=[	"custom",
							"640,480,1","720,480,0.9","720,486,0.9","720,540,1",
							"1440,1024,1","2880,2048,1","1772,1329,1","1276,957,1",
							"1280,720,1","1920,1080,1","1440,1080,1.333"];

	this.Lists["dfSIZE"+"_name"]=[	"=CUSTOM=",
									"VGA","DV","D1","D1sq",
									"D4","D16","std-200dpi","std-144dpi",
									"HD720","HDTV","HDV"];

//リストにaserchメソッドを付加 List.aserch(セクション,キー) result;index or -1 (not found)

this.Lists.aserch =function(name,ael){for (n=0;n<this[name].length;n++){if(this[name][n]==ael)return n};return -1;}

//変更関連
this.chgProp=function (id)
{
	var	name	=id.split("_")[0];
	var	number	=id.split("_")[1];
		switch (name)
		{
		case "scnLopt":	this.chgopt(name,number);break;
		case "scnLlbl":	this.chglbl(name,number);break;
		case "scnLlot":	this.chglot(name,number);break;
		case "scnLbmd":	;
		case "scnLbps":	this.chgblk(name,number);break;
		case "scnLszT":	;
		case "scnLszX":	;
		case "scnLszY":	;
		case "scnLszA":	this.chgSIZE(name,number);break;
		}
	this.changed=true;
	document.getElementById("scnRest").disabled=(! this.changed);
}
this.chgopt =function (){return;}
this.chglbl =function (name,number){
	var newLabels=[];
	for(var i=0;i<(this.tracks-1);i++){
		newLabels.push(document.getElementById(name+"_"+i).value);
	}
	document.getElementById("scnLayersLbls").value=newLabels.join();
	return;
}
this.chglot =function (){return;}

//レイヤ数変更
this.chglayers =function (id){

	if(id=="scnLayersLbls"){
//レイヤラベルボックス内で指定されたエレメントの数でレイヤ数を決定する
		document.getElementById("scnLayers").value=document.getElementById("scnLayersLbls").value.split(",").length;		
		if(this.tracks!=(document.getElementById("scnLayers").value)){
			this.layerTableUpdate();
		}else{
			this.layerTableNameUpdate();
		}
		this.changed=true;
    	document.getElementById("scnRest").disabled=(! this.changed);
		return;
	}
	if(id=="scnLayers"){
		if(isNaN(document.getElementById("scnLayers").value))
		{
			alert(localize(nas.uiMsg.requiresNumber));
			return;
		}
		if(document.getElementById("scnLayers").value<=0)
		{
			alert(localize(nas.uiMsg.requiresPositiveInteger));
			return;
		}
		if(document.getElementById("scnLayers").value>=27)
		{
var msg=localize(nas.uiMsg.dmAlertMenytracks);//レイヤ数多すぎの警告
if(! confirm(msg)){
		document.getElementById("scnLayers").value=this.tracks;//リセット
			return;
}
		}
//値を整数化しておく
		document.getElementById("scnLayers").value=Math.round(document.getElementById("scnLayers").value);

		document.getElementById("scnLayersLbls").value=this.mkNewLabels(document.getElementById("scnLayers").value-xUI.dialogSpan).join();

		if(this.tracks!=document.getElementById("scnLayers").value){
			this.layerTableUpdate();
		}else{
			this.layerTableNameUpdate();
		}
		this.changed=true;
	    document.getElementById("scnRest").disabled=(! this.changed);
		return;
	}

/*
	//tracks=//現在のテーブル上のトラック数（ダイアログ及びコメント含む）
	var chgLys=
	(document.getElementById("scnLayers").value!=this.tracks)?
	true	:	false	;//変更か?
//確認
	if (chgLys){
		if(confirm("レイヤテーブルを再描画します。\nシートを 更新/作成 するまでは、実際のデータの変更は行われません。\n\t再描画しますか？"))
		{
//			レイヤ数変わってテーブル変更なのでテーブル出力
			this.layerTableUpdate();
		}else{
			document.getElementById("scnLayers").value=this.tracks;//トラック数復帰
			this.layerTableUpdate();
		}
	}
*/

}
//
//ブランク関連変更
this.chgblk =function (name,number)
{
	if (name!="Lbps")
	{
//	methodの変更に合わせてposition変更
		switch (document.getElementById("scnLbmd_"+number).value)
		{
		case "expression1":
			document.getElementById("scnLbps_"+number).value="first";
			document.getElementById("scnLbps_"+number).disabled=true;
			break;
		case "file":
			document.getElementById("scnLbps_"+number).disabled=false;
			break;
		case "opacity":	;
		case "wipe":	;
		case "channelShift":	;
		default :
			document.getElementById("scnLbps_"+number).value="end";
			document.getElementById("scnLbps_"+number).disabled=true;
			break;
		}
	}
	this.changed=true;
	document.getElementById("scnRest").disabled=(! this.changed);
}
//コンポフレームレート変更
this.chgFRATE =function (id)
{
	if(id!="scnSetFps"){
//	値を直接書き換えた
	document.getElementById("scnSetFps").value=
(this.Lists.aserch("framerate",document.getElementById("scnFramerate").value.toString())==-1)?
0 : this.Lists.aserch("framerate",document.getElementById("scnFramerate").value.toString());
	}else{
//	セレクタを使った
	document.getElementById("scnFramerate").value=
(document.getElementById("scnSetFps").value == 0)?
document.getElementById("scnFramerate").value : this.Lists["framerate"][document.getElementById("scnSetFps").value] ;
	}
nas.FRATE=document.getElementById("scnFramerate").value;
nas.RATE=this.Lists["framerate_name"][document.getElementById("scnSetFps").value];
//内部計算用なので親のレートは変更しない
	this.changed=true;
	document.getElementById("scnRest").disabled=(! this.changed);
}
//省略時サイズ変更
this.chgSIZE =function (name,number)
{
	if(name!="scnLszT"){
//	値を直接書き換えた
with(document){
	var valset=[
	getElementById("scnLszX_"+number).value,
	getElementById("scnLszY_"+number).value,
	getElementById("scnLszA_"+number).value].join(",")}

	document.getElementById("scnLszT_"+number).value=
(this.Lists.aserch("SIZEs",valset)==-1)?
0 : this.Lists.aserch("SIZEs",valset);
	}else{
//	セレクタを使った

	var SIZE=this.Lists["SIZEs"][document.getElementById("scnLszT_"+number).value];
		if(SIZE !="custom")
		{	with(document){
	getElementById("scnLszX_"+number).value=SIZE.split(",")[0];
	getElementById("scnLszY_"+number).value=SIZE.split(",")[1];
	getElementById("scnLszA_"+number).value=SIZE.split(",")[2];
			}
		}
	}
	this.changed=true;
	document.getElementById("scnRest").disabled=(! this.changed);
}
//新規作成のスイッチトグル
this.chgNewSheet =function (){
	var dist=(! document.getElementById("scnNewSheet").checked)? true:false;
	this.changed=true;
	document.getElementById("scnRest").disabled=(! this.changed);

//新規作成から更新に戻した場合は、時間とレイヤ数を
//親オブジェクトから複写して上書き思ったが、どうせ暫定なのでとりあえずリセット
	if(dist) {this.getProp()}
}

//チェックボックストグル操作
this.chg =function (id)
{
	document.getElementById(id).checked=
	(document.getElementById(id).checked) ?
	false	:	true	;
		if (id=="newSheet") this.chgNewSheet();

	this.changed=true;
	document.getElementById("scnRest").disabled=(! this.changed);
}
//テキストボックス書き換え
this.rewrite =function (id)
{
if(dbg){dbgPut(id);}
	this.changed=true;
	document.getElementById("scnRest").disabled=(! this.changed);
	return false;//フォーム送信抑止
}
/*
    引数の数だけラベルを作って返す
    現行のドキュメント変更時は、現在のラベルを取得する
*/
this.mkNewLabels=function(timingLayers,dialogs){
    if (document.getElementById("scnNewSheet").checked){
        if(! dialogs) dialogs = 1
    }else{
        dialogs = xUI.dialogSpan;
    }
//現状のダイアログトラック数を取得するかまたはデフォルト値のダイアログ数1
	var myLabels=[];
	for(var Tidx=0;Tidx<(timingLayers+dialogs);Tidx++){
		if((! document.getElementById("scnNewSheet").checked)&&(Tidx<XPS.xpsTracks.length-1)){
			myLabels.push(XPS.xpsTracks[Tidx].id);
		}else{
		    if(Tidx<dialogs){
				myLabels.push("N"+((Tidx==0)?"":String(Tidx)));
			}else if((Tidx-dialogs)<26){
				myLabels.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Tidx-dialogs));
			}else{
					myLabels.push(String(Tidx));
			}
		}
	}
return myLabels;
}
//
/**
　201802改修　レイヤブラウザの位置づけ変更
　AE依存のパラメータを使用しない
　基本はデータ編集をロックして閲覧のみ
　引数はトラック数
*/
this.mkLayerSheet =function (lot){
//	レイヤブラウザを作る　終端のフレームコメントを除くすべて
//	引数はレイヤの数
var body_='<table cellspacing=0 cellpadding=0 border=0 >';//

//タイトルつける +1はタイトル
body_+='<tr><th colspan='+(lot+1)+'>詳細指定</th></tr>';//
//インデックスを配置 0-
			body_+='<tr><th>ID:</th>';//
for (i=0;i<lot;i++){	body_+='<td>'+ String(i)+'</td>'}
			body_+='</tr>';//

/*
var labelOptions=[
	"option","link","label","lot","blmtd","blpos",
	"size","sizeX","sizeY","aspect"
];
*/
var labelOptions=[
	"種別","リンク","親","ラベル",
	"セル枚数","カラセル","配置",
	"プリセット",
	"sizeX","sizeY","aspect"
];
var Labels=["Lopt_","Llnk_","Lpnt_","Llbl_","Llot_","Lbmd_","Lbps_","LszT_","LszX_","LszY_","LszA_"
];
	for (var opt=0;opt<labelOptions.length;opt++)
	{
if(dbg){dbgPut("check labelOptions : "+ opt)}
		body_+='<tr><th nowrap> '+labelOptions[opt]+' </th>';//
		for (i=0;i<lot;i++)
		{
// currentTimeline = xUI.XPS.xpsTimeline(i)
			body_+='<td class=layerOption>';//

//idは、種別前置詞+レイヤ番号で

//		if(confirm("Stop? : [ "+opt.toString()+" ]"+Labels[opt])){return false};

	switch(Labels[opt])
{
case	"Lopt_":	body_+='<SELECT id="scnLopt_';	//レイヤオプション:0
		break;
case	"Llnk_":	body_+='<input type=text id="scnLlnk_';	//リンクパス:1
		break;
case	"Lpnt_":	body_+='<input type=text id="scnLpnt_';	//Parentパス:2
		break;
case	"Llbl_":	body_+='<input type=text id="scnLlbl_';	//ラベル:3
		break;
case	"Llot_":	body_+='<input type=text id="scnLlot_';	//ロット:4
		break;
case	"Lbmd_":	body_+='<SELECT id="scnLbmd_';	//カラセルメソッド:5
		break;
case	"Lbps_":	body_+='<SELECT id="scnLbps_';	//カラセル位置:6
		break;
case	"LszT_":	body_+='<SELECT id="scnLszT_';	//サイズまとめ:7
		break;
case	"LszX_":	body_+='<input type=text id="scnLszX_';	//サイズX:8
		break;
case	"LszY_":	body_+='<input type=text id="scnLszY_';	//サイズY:9
		break;
case	"LszA_":	body_+='<input type=text id="scnLszA_';	//アスペクト:10
		break;
default	:alert(opt);
}
//番号追加
	body_+=String(i);


body_+='" onChange="myScenePref.chgProp(this.id)"';//共通
body_+=' style="text-align:center;width:100px"';//共通
	if (opt==1||opt==2||opt==3||opt==4||opt>7)
	{
body_+=' value=""'	;//text値はアトデ
body_+='>';
	}else{
body_+='>';

var optS=opt.toString(10);
	switch (optS)
	{
case	"0":
//オプション別/セレクタもの	レイヤオプション
body_+='<OPTION VALUE=still >still';//
body_+='<OPTION VALUE=timing >timing';//
body_+='<OPTION VALUE=dialog >dialog';//
body_+='<OPTION VALUE=sound >sound';//
body_+='<OPTION VALUE=camera >camera';//
body_+='<OPTION VALUE=sfx >effects';//
break;

case	"5":
//オプション別/セレクタもの	カラセルメソッド
body_+='<OPTION VALUE=file > ファイル ';//
body_+='<OPTION VALUE=opacity > 不透明度 ';//
body_+='<OPTION VALUE=wipe > リニアワイプ ';//
body_+='<OPTION VALUE=channelShift > チャンネルシフト';//
body_+='<OPTION VALUE=expression1 > 動画番号トラック';//
break;

case	"6":
//オプション別/セレクタもの	カラセル位置
body_+='<OPTION VALUE=build >--------';//
body_+='<OPTION VALUE=first >最初の絵を使う';//
body_+='<OPTION VALUE=end >最後の絵を使う';//
body_+='<OPTION VALUE=none >カラセルなし';//
break;

case	"7":
//オプション別/セレクタもの	サイズまとめ
body_+='<OPTION VALUE=0 >=CUSTOM=';//
body_+='<OPTION VALUE=1 >VGA(640x480,1.0)';//
body_+='<OPTION VALUE=2 >DV(720x480,0.9)';//
body_+='<OPTION VALUE=3 >D1(720x486,0.9)';//
body_+='<OPTION VALUE=4 >D1sq(720x540,1.0)';//
body_+='<OPTION VALUE=5 >D4(1440x1024,1.0)';//
body_+='<OPTION VALUE=6 >D16(2880x2048,1.0)';//
body_+='<OPTION VALUE=7 >std-200dpi(1772x1329,1.0)';//
body_+='<OPTION VALUE=8 >std-144dpi(1276x957,1.0)';//
body_+='<OPTION VALUE=9 >HD720(1280x720,1.0)';//
body_+='<OPTION VALUE=10 >HDTV(1980x1080,1.0)';//
body_+='<OPTION VALUE=11 >HDV(1440x1080,1.333)';//
break;
	}

body_+='</SELECT>';//セレクタものならば閉じる
}

body_+='<br></td>';//

		}
body_+='</tr>';//
	}
body_+='</table>';//

return body_;
}
//
this.openTable=function(){
	if(document.getElementById("scnCellTable").style.display=="inline"){

		document.getElementById("scnCellTable").style.display="none";
	}else{
		document.getElementById("scnCellTable").style.display="inline";
	}
}
//
this.layerTableNameUpdate=function(){
		var myNames=document.getElementById("scnLayersLbls").value.split(",");
		for(var i=0;i<this.tracks;i++){
			document.getElementById("scnLlbl_"+i).value=myNames[i];
		}

}
this.layerTableUpdate =function(){
		document.getElementById("scnLayerBrouser").innerHTML=
		this.mkLayerSheet(document.getElementById("scnLayers").value);
		this.getLayerProp();
		this.tracks=parseInt(document.getElementById("scnLayers").value);
		this.layerTableNameUpdate();
}

//各種設定表示初期化
this.getProp =function ()
{
    document.getElementById("scnRepository").innerHTML = (XPS.currentStatus.content != 'Floating')?
        [serviceAgent.currentRepository.url,serviceAgent.currentRepository.name].join("/"):
        "This data is not stored in any repository.";
//このデータはいずれのリポジトリにも保存されていません
// document.getElementById("scnNewSheet").checked=false;//新規フラグダウン
    if (XPS.currentStatus.content == 'Floating'){
        document.getElementById("scnPushentry").disabled=false;
    }else{
        document.getElementById("scnPushentry").disabled=true;
    }
//ドキュメントパネルから新規ドキュメントフラグを削除　削除に伴う変更まだ
//ドキュメント一覧からプロジェクト一覧を取得してリストに展開する
    var myProducts = documentDepot.products;
    　　this.titles   =[];    this.episodes =[];
    for (var pix=0;pix<documentDepot.products.length;pix++){
        var product=Xps.parseProduct(documentDepot.products[pix]);
        this.episodes.push(product);
        this.titles.add(product.title);
    }
    document.getElementById("scnTitleList").innerHTML="";//クリア
    for(var tix=0;tix<this.titles.length;tix++){
        var opt=document.createElement("option");
        opt.value = this.titles[tix];
        document.getElementById("scnTitleList").appendChild(opt);
    }
    this.reWrite("scnTitle");
//レイヤ数取得
	if (this.tracks != (XPS.xpsTracks.length-1)){
		this.tracks =  (XPS.xpsTracks.length-1);//バックアップとる
		document.getElementById("scnLayers").value=	this.tracks;
//ラベルウェルを書き換え
		document.getElementById("scnLayersLbls").value=this.mkNewLabels(this.tracks-xUI.dialogSpan).join();
//レイヤ数変わってテーブル変更なのでテーブル出力
		document.getElementById("scnLayerBrouser").innerHTML=
		this.mkLayerSheet(document.getElementById("scnLayers").value);

	}else{
		document.getElementById("scnLayers").value=this.tracks;
	}
	if(document.getElementById("scnNewSheet").checked){
        document.getElementById("scnLayers").disabled = false;
        document.getElementById("scnLayersLbls").disabled = false;
    }else{
        document.getElementById("scnLayers").disabled = true;
        document.getElementById("scnLayersLbls").disabled = true;
    }
//変換不要パラメータ "mapfile",
	var names=[
"title","subtitle","opus","scene","cut","framerate",
"create_time","create_user","update_time","update_user"
];
	var ids=[
"scnTitle","scnSubtitle","scnOpus","scnScene","scnCut","scnFramerate",
"scnCreate_time","scnCreate_user","scnUpdate_time","scnUpdate_user"
];
	for (var i=0;i<names.length;i++){
		document.getElementById(ids[i]).value = xUI.XPS[names[i]];
		document.getElementById(ids[i]).disabled = (xUI.onSite)? true:false;
	}
//シートメモ転記
		document.getElementById('scnMemo').value=xUI.XPS.xpsTracks.noteText;
        
	var names=["create_time","create_user","update_time","update_user"];
	var ids=["scnCreate_time","scnCreate_user","scnUpdate_time","scnUpdate_user"];
	for (var i=0;i<names.length;i++){
		document.getElementById(ids[i]+"TD").innerHTML=
		(document.getElementById(ids[i]).value=="")?"<br>":
		xUI.trTd(document.getElementById(ids[i]).value);
	}

//取得したシートのフレームレートをnasのレートに代入する
	nas.FRATE=document.getElementById("scnFramerate").value;
//nas側でメソッドにすべきダ
//	現在の時間を取得
		document.getElementById("scnTime").value=
		nas.Frm2FCT(XPS.time(),3,0);
		document.getElementById("scnTrin").value=
		XPS["trin"][1];
		document.getElementById("scnTrinT").value=
		nas.Frm2FCT(XPS["trin"][0],3,0);
		document.getElementById("scnTrot").value=
		XPS["trout"][1];
		document.getElementById("scnTrotT").value=
		nas.Frm2FCT(XPS["trout"][0],3,0);

//		document.getElementById("scn").value=
//		document.getElementById("scnLayers").value=

//	if(document.getElementById("scnCellTable").style.display!="none"){	};
		this.getLayerProp();
	this.changed=false;
	document.getElementById("scnRest").disabled=(! this.changed);
}
this.getLayerProp =function (){
//レイヤ情報テーブルに値をセット
	var myLabels=document.getElementById("scnLayersLbls").value.split(",");

	if (this.tracks >(xUI.XPS.xpsTracks.length-1)){this.tracks=xUI.XPS.xpsTracks.length-1}
	for (i=0;i<document.getElementById("scnLayers").value;i++)
	{
	    var currentTrack = xUI.XPS.xpsTracks[i];
		if (i<this.tracks &&! document.getElementById("scnNewSheet").checked)
		{
			document.getElementById("scnLopt_"+i).value=
			currentTrack["option"]; // 種別　0番は固定
	        document.getElementById("scnLopt_"+i).disabled = (i==0)? true:false;

			document.getElementById("scnLlnk_"+i).value=
			currentTrack["link"];//リンク　現在固定
			document.getElementById("scnLlnk_"+i).disabled=true;

			document.getElementById("scnLpnt_"+i).value=
			currentTrack["parent"];//ペアレント　現在固定
			document.getElementById("scnLpnt_"+i).disabled=true;

			document.getElementById("scnLlbl_"+i).value=
			currentTrack["id"];//ラベル

			document.getElementById("scnLlot_"+i).value=
			currentTrack["lot"];//数量
			document.getElementById("scnLlot_"+i).disabled=(currentTrack.option=="timing")?false:true;;

			document.getElementById("scnLszX_"+i).value=
			currentTrack["sizeX"];
			document.getElementById("scnLszX_"+i).disabled=(currentTrack.option=="timing")?false:true;;
			document.getElementById("scnLszY_"+i).value=
			currentTrack["sizeY"];
			document.getElementById("scnLszY_"+i).disabled=(currentTrack.option=="timing")?false:true;;
			document.getElementById("scnLszA_"+i).value=
			currentTrack["aspect"];
			document.getElementById("scnLszA_"+i).disabled=(currentTrack.option=="timing")?false:true;;

			document.getElementById("scnLbmd_"+i).value=
			currentTrack["blmtd"];
			document.getElementById("scnLbmd_"+i).disabled=(currentTrack.option=="timing")?false:true;
			document.getElementById("scnLbps_"+i).value=
			currentTrack["blpos"];
			document.getElementById("scnLbps_"+i).disabled=(currentTrack.option=="timing")?false:true;

		}else{

			document.getElementById("scnLopt_"+i).value=
			(i==0)?"dialog":"timing";
			document.getElementById("scnLopt_"+i).disabled=
			(i==0)?true:false;

			document.getElementById("scnLlnk_"+i).value=
			".";
//			document.getElementById("scnLpnt_"+i).disabled=true;

			document.getElementById("scnLpnt_"+i).value=
			".";
//			document.getElementById("scnLpnt_"+i).disabled=true;

			document.getElementById("scnLlbl_"+i).value=myLabels[i];

			document.getElementById("scnLlot_"+i).value=
			"=AUTO=";

			document.getElementById("scnLszX_"+i).value=
			xUI.dfX;

			document.getElementById("scnLszY_"+i).value=
			xUI.dfY;

			document.getElementById("scnLszA_"+i).value=
			xUI.dfA;


			document.getElementById("scnLbmd_"+i).value=
			xUI.blmtd;

			document.getElementById("scnLbps_"+i).value=
			xUI.blpos;
		}
				this.chgSIZE("LszA",i.toString());
				this.chgblk("Lbmd",i.toString());
	}
}
//バルクシートの設定
this.newProp =function (showMsg)
{
    if(showMsg){
	    var msg = localize(nas.uiMsg.dmComfirmNewxSheetprop);
        var go = confirm(msg);
    }else{
        var go = true;        
    }
  if (go){
	document.getElementById("scnNewSheet").checked=true;//新規チェック入れる

//レイヤ数デフォルトに設定
		document.getElementById("scnLayers").value=Number(SheetLayers)+Number(SoundColumns);
//レイヤ名表示更新
		document.getElementById("scnLayersLbls").value=this.mkNewLabels(Number(SheetLayers),Number(SoundColumns)).join();
		this.tracks=document.getElementById("scnLayers").value;
//レイヤテーブル出力
		document.getElementById("scnLayerBrouser").innerHTML=
		this.mkLayerSheet(document.getElementById("scnLayers").value);
//デフォルトパラメータを設定
  Now =new Date();
	document.getElementById("scnMapfile").innerHTML="no mapfile";
	document.getElementById("scnTitle").value=myTitle;
	document.getElementById("scnSubtitle").value=mySubTitle;
	document.getElementById("scnOpus").value=myOpus;
	document.getElementById("scnScene").value=myScene;
	document.getElementById("scnCut").value=myCut;
	document.getElementById("scnFramerate").value=myFrameRate;

	document.getElementById("scnCreate_time").value=Now.toNASString();
	document.getElementById("scnCreate_user").value=xUI.currentUser;//myName;
	document.getElementById("scnUpdate_time").value="";
	document.getElementById("scnUpdate_user").value=xUI.currentUser;//myName;

	document.getElementById("scnMemo").value="";
//	document.getElementById("scn").value=;
//	document.getElementById("").value=;
//	document.getElementById("").value=;
	var names=["scnCreate_time","scnCreate_user","scnUpdate_time","scnUpdate_user"];
	for (var i=0;i<names.length;i++){
		name=names[i];
		document.getElementById(name+"TD").innerHTML=
		(document.getElementById(name).value=="")?"<br>":
		xUI.trTd(document.getElementById(name).value);
console.log([name,document.getElementById(name).value]);
	}
//取得したシートのフレームレートをnasのレートに代入する
	nas.FRATE=document.getElementById("scnFramerate").value;
//nas側でメソッドにすべきダ
//	現在の時間を取得
		document.getElementById("scnTime").value=Sheet;
		document.getElementById("scnTrin").value="trin";
		document.getElementById("scnTrinT").value="00+00.";
		document.getElementById("scnTrot").value="trout";
		document.getElementById("scnTrotT").value="00+00.";
	this.layerTableUpdate();
	this.changed=true;
	document.getElementById("scnRest").disabled=(! this.changed);
  }else{
	return;
  }
}
//ダイアログの値更新にともなう動的変更
this.reWrite = function(eid){
    switch(eid){
    case "scnTitle":
        //タイトル変更にともなうリスト更新
        document.getElementById("scnOpusList").innerHTML="";//クリア
        for(var eix=0;eix<this.episodes.length;eix++){
            if ((this.episodes[eix].title == document.getElementById("scnTitle").value)||
            (document.getElementById("scnTitle").value=="")){
                var opt=document.createElement("option");
//            opt.value = this.episodes[eix].opus;
                opt.value = documentDepot.products[eix];
                document.getElementById("scnOpusList").appendChild(opt);
            }
        }
    break;
    case "scnOpus":
        //Opusの内容がリストと一致している場合のみサブタイトルとリストを更新する
        //Title文字列がカラの場合のみタイトルも変更する
        for(var pix=0;pix<documentDepot.products.length;pix++){
            if(documentDepot.products[pix]==document.getElementById("scnOpus").value){
                if(document.getElementById("scnTitle").value==""){
                    document.getElementById("scnTitle").value=this.episodes[pix].title;
                }
                document.getElementById("scnOpus").value= this.episodes[pix].opus;
                document.getElementById("scnSubtitle").value=this.episodes[pix].subtitle;
                break;
            }
        }
    break;
    }
	this.changed=true;
	document.getElementById("scnRest").disabled=(! this.changed);
}
//各種設定表示更新
this.putProp =function (){
//	現在のドキュメントは未保存か？
	if(! xUI.checkStored()){return}
//レイヤテーブルを自動更新で処理続行
//		this.layerTableUpdate();

//	現在の時間からカット継続時間を一時的に生成
//	framerate?
	var duration=(
nas.FCT2Frm(document.getElementById("scnTrinT").value)+
nas.FCT2Frm(document.getElementById("scnTrotT").value))/2+
nas.FCT2Frm(document.getElementById("scnTime").value);
	var oldduration=XPS.duration();
	var durationUp=(duration>oldduration)? true : false ;
//	レイヤ数の変更を一時変数に取得
	var newWidth=this.tracks;//新幅コメント含まず
	var oldWidth=XPS.xpsTracks.length-1;//もとの長さを控える
	var widthUp =(newWidth>oldWidth)?true:false;//増えたか?
//	新規作成ならば細かいチェックは不要
	if(document.getElementById("scnNewSheet").checked){
	var msg = localize(nas.uiMsg.alertNewdocumet) ;//新規シートを作成します。
    msg += "\n"+localize(nas.uiMsg.alertDiscardedit);//現在の編集内容は、破棄されます。
    msg += "\n\n"+localize(nas.uiMsg.confirmExecute);//実行してよろしいですか?
	}else{
//	現内容の変更なので一応確認
//	レイヤ数の変更確認
	var msg="";
		if(newWidth!=oldWidth){
			msg += localize(nas.uiMsg.alertTrackschange)+"\n";//レイヤ数が変更されます
			if (!widthUp)
			msg += "\t"+ localize(nas.uiMsg.alertDiscardtracks )+"\n";//消去されるレイヤの内容は破棄されます
		}
//	カット尺更新確認
		if(duration!=oldduration){
			msg+= localize(nas.uiMsg.alertDurationchange)+"\n";//カットの尺が変更されます
			if (!durationUp)
			msg += "\t"+localize(nas.uiMsg.alertDiscardframes)+"\n";//消去されるフレームの内容は破棄されます。
		}
//
		msg += localize(nas.uiMsg.confirmExecute);//実行してよろしいですか
	}
//確認
	if(confirm(msg)){
	if (
		(document.getElementById("scnNewSheet").checked)	||
		(newWidth!=oldWidth)	||
		(duration!=oldduration)
	)
	{ var changeSheet=true; }else{ var changeSheet=false; }
//	実際のデータ更新
    if(document.getElementById("scnNewSheet").checked) xUI.setUImode('floating');
//シートメモ転記
		XPS.xpsTracks.noteText = document.getElementById("scnMemo").value;
//値の変換不要なパラメータをまとめて更新　"mapfile"を削除　ユーザ編集は可能性自体が無い
	var names=[
"title","subtitle","opus","scene","cut"
	];//
	var ids=[
"scnTitle","scnSubtitle","scnOpus","scnScene","scnCut"
	];//
	for (var i=0;i<names.length;i++){
		XPS[names[i]]=document.getElementById(ids[i]).value;
	}


// //////新規作成なら現在のシート内容をフラッシュ ?
		if (document.getElementById("scnNewSheet").checked){xUI.flush();}
// /////////
//レイヤ数を設定
	this.tracks=parseInt(document.getElementById("scnLayers").value);
if(true){
dbgPut("元タイムシートは : "+oldWidth+" 列/ "+oldduration+"コマ\n 新タイムシートは : "+newWidth+" 列/ "+duration+"コマ です。\n ");
}
//継続時間とレイヤ数で配列を更新
	xUI.reInitBody((this.tracks+1),duration);

//		プロパティの更新
		xUI.XPS["trin"]=
[nas.FCT2Frm(document.getElementById("scnTrinT").value),
document.getElementById("scnTrin").value
];
		xUI.XPS["trout"]=
[nas.FCT2Frm(document.getElementById("scnTrotT").value),
document.getElementById("scnTrot").value
];

//本体シートのフレームレート更新
	xUI.XPS.framerate=nas.FRATE;
	xUI.XPS.rate=nas.RATE;
//書き直しに必要なUIのプロパティを再設定
	xUI.PageLength=
	xUI.SheetLength*Math.ceil(xUI.XPS.framerate);//1ページのコマ数
//新規作成時はundo関連をリセット
    if(document.getElementById("scnNewSheet").checked){
	    xUI.flushUndoBuf();
	    sync("undo");sync("redo");
    }
//	レイヤプロパティ更新
	this.putLayerProp();

//	尺または、レイヤ数の変更があるか、新規作成ならばシートを初期化

	if (changeSheet){
//	xUI.sWitchPanel("Prog");

//カーソル位置初期化
	xUI.selectCell("1_0");

        xUI.resetSheet();
		//nas_Rmp_Init();
//AIR環境の場合カレントファイルを初期化する
	if(isAIR){fileBox.currentFile=null;};//忘れていたとほほ
	}else{
//	それ以外はシート情報表示のみを更新
		sync("info_");
		sync("lbl");
	}
//タイトル初期化・保存フラグ強制アクティブ
	xUI.setStored("force");
	sync();
//パネルを再初期化
	this.getProp();
	this.chgFRATE();
	this.changed=false;
	document.getElementById("scnRest").disabled=(! this.changed);
		this.close();
//	xUI.sWitchPanel("Prog");
	}else{
	    alert(localize(nas.uiMsg.aborted));
	}
}
//更新操作終了
this.putLayerProp =function ()
{
//テーブルから読み出した値をXPSにセット
	var oldlayers=(xUI.XPS.xpsTracks.length-1);//もとの長さを控える

	var widthUp=(oldlayers<this.tracks)?true:false;
	for (i=0;i<this.tracks;i++)
	{
		if (i>=oldlayers){
			xUI.XPS.xpsTracks.insertTrack(new XpsTimelineTrack(
				"NABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(i),
				(i==0)?"dialog":"timing",
				xUI.XPS.xpsTracks,
				xUI.XPS.xpsTracks.duration,
				i
			));
			xUI.XPS["xpsTracks"][i]["lot"]= "=AUTO=";
			xUI.XPS["xpsTracks"][i]["sizeX"]= xUI.dfX;
			xUI.XPS["xpsTracks"][i]["sizeY"]= xUI.dfY;
			xUI.XPS["xpsTracks"][i]["aspect"]= xUI.dfA;
			xUI.XPS["xpsTracks"][i]["blmtd"]= xUI.blmtd;
			xUI.XPS["xpsTracks"][i]["blpos"]= xUI.blpos;
		}else{
			xUI.XPS["xpsTracks"][i]["option"]= document.getElementById("scnLopt_"+i).value;
			xUI.XPS["xpsTracks"][i]["link"]= document.getElementById("scnLlnk_"+i).value;
			xUI.XPS["xpsTracks"][i]["id"]= document.getElementById("scnLlbl_"+i).value;
			xUI.XPS["xpsTracks"][i]["lot"]= document.getElementById("scnLlot_"+i).value;
			xUI.XPS["xpsTracks"][i]["sizeX"]= document.getElementById("scnLszX_"+i).value;
			xUI.XPS["xpsTracks"][i]["sizeY"]= document.getElementById("scnLszY_"+i).value;
			xUI.XPS["xpsTracks"][i]["aspect"]= document.getElementById("scnLszA_"+i).value;
			xUI.XPS["xpsTracks"][i]["blmtd"]= document.getElementById("scnLbmd_"+i).value;
			xUI.XPS["xpsTracks"][i]["blpos"]= document.getElementById("scnLbps_"+i).value;
		}
	}
	xUI.XPS.xpsTracks.renumber();
}
//プロシジャ部分抜きだし
//パネル初期化
this.init =function (opt){
    switch (opt){
    case "edit":
        document.getElementById('scnNewSheet').checked="false";
        document.getElementById('scnNewDocument').style="display:none";
        document.getElementById('scnPushentry').style="display:none";
        document.getElementById('scnUpdate').style="display:inline";
        document.getElementById('scnNew').style="display:none";
    break;
    case "push":
        document.getElementById('scnNewSheet').checked="false";
        document.getElementById('scnNewDocument').style="display:none";
        document.getElementById('scnPushentry').style="display:inline";
        document.getElementById('scnUpdate').style="display:none";
        document.getElementById('scnNew').style="display:none";
    break;
    case "new":
    default:
        document.getElementById('scnNewSheet').checked="true";
        document.getElementById('scnNewDocument').style="display:inline";
        document.getElementById('scnPushentry').style="display:none";
        document.getElementById('scnUpdate').style="display:none";
        document.getElementById('scnNew').style="display:inline";
    };
	this.Lists = PropLists;//現状だとオブジェクト参照
	this.getProp();
	this.chgFRATE();
	this.changed=false;
	document.getElementById("scnRest").disabled=(! this.changed);
    if(opt=='new') this.newProp();
}
/** パネルを開く
 *すでに開いていたら NOP リターン
 */
this.open=function(opt){
    if(! opt) opt = 'edit';
		if(document.getElementById("optionPanelScn").style.display=="inline"){
			return false;
		}else{
			xUI.sWitchPanel("Scn");
			this.init(opt);
		}
	return null;
}
//パネルを閉じる

this.close=function(){
	//変更フラグ立っていれば確認して操作反映
	//新規作成モードの際は無条件でクロース
	if(
	    (document.getElementById("scnNewSheet").checked == false)&&
	    (this.changed)
	){if(confirm(localize(nas.uiMsg.dmPrefConfirmSave))){this.putProp();}};//設定変更確認
	//パネル閉じる
		xUI.sWitchPanel("Scn")
}

};
//ScenePrefオブジェクト終了
/**
    サウンド関連オブジェクト編集パネル
    201704現在はダイアログ関連のみ
*/
/*
    ダイアログ(SoundEdit)編集パネル
    サウンドオブジェクトプロパティを表示編集するUI
    変更内容は常時タイムシートと同期させる
*/
SoundEdit ={
    panel:document.getElementById('optionPanelSnd'),
    changed:false,
    duration:0,
    timeLock:0,
//0:inPointLock,1:outPointLock,2:durationLock
/*
label参照配列　カット／作品内のラベルをストアして入力候補として提示するためのデータ
タイトルごとの集積データを持つ　タイトルDB内の香盤データとして監理する
新規に入力されたラベルがあれば、香盤に加える（最終的にはそうする）
＊香盤への操作は香盤DBに対しての通信として実装する＊
新規入力ラベルはこのデータに対して最新候補として追加すること
*/
    labels:[
        "医者",
        "警官",
        "子供",
        "女",
        "男",
        "通行人"
    ],
/*
    ダイアログプロパティは、個人データとして監理する
    デフォルトでシステムDBの値を置く
*/
    props:[
        'アドリブ',
        'エコー',
        'N',
        '背',
        'V.O.',
        'off',
        ''
    ],
/*
    台詞間に挿入するコメントデータは、個人データとして管理する
    デフォルトでシステムDBの値を置く
*/
    notes:[
        '♪',
        '♬',
        '☓',
        '○',
        '◇',
        '効果',
        '音楽',
        'BGM',
        'SE',
        '間',
        '息'
    ]
}
/*
    パネル初期化
    xUI.edmode に従ってパネル状態を設定
    各コントロールの有効無効化　視覚化隠蔽等を行う
    
    現在はダイアログ関連のコントロールのみ

    フォーカス位置が有値のダイアログセクションであれば(既にedmode>=2の場合)
    コントロールを有効化して選択されているセクションの値を反映(getProp)
     :edmode==0
    フォーカスが値セクションの場合はフォーカスのあるセクションを選択
*/
SoundEdit.init = function(){
    if(xUI.edmode<2){
        document.getElementById('dialogEdit').disabled=true;
            document.getElementById('soundPanelApply').disabled=true;
            document.getElementById('soundPanelFix').disabled=true;
            document.getElementById('soundPanelRelease').disabled=true;
    }else{
        this.getProp();
        document.getElementById('dialogEdit').disabled=false;
            document.getElementById('soundPanelApply').disabled=false;
            document.getElementById('soundPanelFix').disabled=false;
            document.getElementById('soundPanelRelease').disabled=false;
    }
}

SoundEdit.panelInit = function(){
    var recentCast   =document.getElementById('sndCasts');
    recentCast.innerHTML='';
    for(ix=this.labels.length-1;ix>=0;ix--){
        var myOption = document.createElement('option');
        myOption.setAttribute('value',this.labels[ix]);
        recentCast.appendChild(myOption);
    }
    var propSelector =document.getElementById('soundPropSelector');
    propSelector.innerHTML='';
    for(ix=this.props.length-1;ix>=0;ix--){
        var myOption = document.createElement('option');
        myOption.setAttribute('value',this.props[ix]);
        myOption.innerHTML=this.props[ix];
        propSelector.appendChild(myOption);
    }
    var commentButtonCareer =document.getElementById('commentCareer');
    commentButtonCareer.innerHTML='';
    for(ix=this.notes.length-1;ix>=0;ix--){
        var myOption = document.createElement('button');
        myOption.setAttribute('value','<'+this.notes[ix]+'>');
        myOption.className  = 'dialogComment';
        myOption.innerHTML  = this.notes[ix];
        commentButtonCareer.appendChild(myOption);
    }
}


/*  UIロックパラメータ同期
引数：ロックするパラメータを文字列または数値 引数なしは同期のみ

*/
SoundEdit.syncTCL=function(ix){
    switch(ix){
    case 'inPoint':
    case 0:
        this.timeLock=0;
    break;
    case 'outPoint':
    case 1:
        this.timeLock=1;
    break;
    case 'duration':
    case 2:
        this.timeLock=2;
    default:
        //NOP
    }
    for(var idx=0;idx<3;idx++){
        var targetId = ['soundInpointLock','soundOutpointLock','soundDurationLock'][idx];
        if(this.timeLock==idx){
            document.getElementById(targetId).innerHTML= '🔒';//Lock
        }else{
            document.getElementById(targetId).innerHTML= '🔓';//unLock
        }
    }   
}
/*　編集対象のパネルのラベルを入れ替える
引数:ダイアログラベル文字列
*/
SoundEdit.setLabel = function(myName){
    if(typeof myName == 'undefined') return false;
    if(xUI.edmode<2) return;//NOP
    var targetTrack   = xUI.XPS.xpsTracks[xUI.Select[0]];
    var targetSection = targetTrack.sections[xUI.floatSectionId]
    targetSection.value.name = myName;
    document.getElementById('sndBody').value=targetSection.value.toString();
    xUI.sectionUpdate();
}
/*　編集対象のダイアログの属性を入れ替える
引数:属性配列または属性文字列
文字列の形式は,(コンマ)で区切られたリスト
引数が未定義または空文字列の場合は、属性を全削除
*/
SoundEdit.setProp = function(myProp){
    console.log(myProp);
    if(typeof myProp == 'undefined') myProp=[];
    if(xUI.edmode<2) return;//NOP
    var targetTrack   = xUI.XPS.xpsTracks[xUI.Select[0]];
    var targetSection = targetTrack.sections[xUI.floatSectionId]
    var myProps = (myProp instanceof Array)? myProp:myProp.split(',');
    targetSection.value.attributes.length = myProps.length;
    for(var itx=0;itx<myProps.length;itx++){
        targetSection.value.attributes[itx]=(String(myProps[itx]).match(/^\(.+\)$/))?
        String(myProps[itx]):targetSection.value.attributes[itx]="("+String(myProps[itx])+")";
    }
    document.getElementById('sndBody').value=targetSection.value.toString();
    console.log(targetSection.value.toString());
    xUI.sectionUpdate();
}
/** 編集対象のパネルの値をセットする
引数: 
    tc  TC文字列
    target 目的のプロパティ"inPoint","outPoint","duration"
ロックされているプロパティに値を設定しようとすると、自動でロックが入れ替わる
　　in点     → out点
　　out点    → in点
　　duration → in点
　　ただしあらかじめ他のロックが行われている場合は、自動変更は働かない
*/
SoundEdit.setTime = function(tc,target){
    if(xUI.edmode<2) return;//NOP
    var myFrame = nas.FCT2Frm(tc);
    if(myFrame < 0) myFrame = 0;
    if(myFrame > xUI.XPS.xpsTracks.duration) myFrame = xUI.XPS.xpsTracks.duration;
//     xUI.mdChg(3);
    switch(target){
    case 0:
    case 'inPoint':
        if(this.timeLock==0){this.syncTCL(1);}
        var headOffset = myFrame;
        var tailOffset = (this.timeLock == 1)?
            nas.FCT2Frm(document.getElementById('soundOutPoint').value)-tc:
            nas.FCT2Frm(document.getElementById('soundDuration').value);
    break;
    case 1:
    case 'outPoint':
        if(this.timeLock==1){this.syncTCL(0);}
        var headOffset = (this.timeLock == 0)?
            nas.FCT2Frm(document.getElementById('soundInPoint').value):
            tc-nas.FCT2Frm(document.getElementById('soundDuration').value);
        var tailOffset = (this.timeLock == 0)?
            tc-headOffset:nas.FCT2Frm(document.getElementById('soundDuration').value);
    break;
    case 2:
    case 'duration':
        if(this.timeLock==2){this.syncTCL(0);}
        var headOffset = (this.timeLock == 0)?
            nas.FCT2Frm(document.getElementById('soundInPoint').value):
            nas.FCT2Frm(document.getElementById('soundOutPoint').value)-tc;
        var tailOffset = tc-1;
    break;
    }
//  xUI.XPS.xpsTracks[xUI.Select[0]].sections.manipulateSection(xUI.floatSectionId,myFrame,tailOffset);
    xUI.selectCell([xUI.Select[0],headOffset]);
    xUI.selection([xUI.Select[0],headOffset+tailOffset])
    xUI.sectionUpdate();
}
/*
    編集パネル上の値を変更して仮の範囲を表示する
    モードをフロートに変更
*/
SoundEdit.floatTC = function(changeID){
    if(xUI.edmode<2) return false;
    if(xUI.edmode==2) if(xUI.mdChg('float') != 3) return false; //モード変更に失敗したのでメソッド終了
        var inPoint = nas.FCT2Frm(document.getElementById('soundInPoint').value);
        var outPoint = nas.FCT2Frm(document.getElementById('soundOutPoint').value);
        var duration = nas.FCT2Frm(document.getElementById('soundDuration').value);
    switch(changeID){
    case 0:
    case 'inPoint':
        if (inPoint < 0) inPoint = 0;
        if (inPoint >= xUI.XPS.xpsTracks.duration) inPoint = (xUI.XPS.xpsTracks.duration-1);
        if (this.timeLock == 0) this.syncTCL(1);
        if (this.timeLock == 1) duration = outPoint - inPoint + 1;
        else if (this.timeLock == 2) outPoint = inPoint + duration - 1 ;
    break;
    case 1:
    case 'outPoint':
        if (outPoint < 0) outPoint = 0;
        if (outPoint >= xUI.XPS.xpsTracks.duration) outPoint = (xUI.XPS.xpsTracks.duration-1);
        if (this.timeLock == 1) this.syncTCL(0);
        if (this.timeLock == 2) inPoint  = outPoint - duration + 1;
        else if (this.timeLock == 0) duration = outPoint - inPoint + 1;
    break;
    case 2:
    case 'duration':
        if (duration < 1) duration = 1;
        if (duration > xUI.XPS.xpsTracks.duration) duration = xUI.XPS.xpsTracks.duration;
        if (this.timeLock == 2) this.syncTCL(0);
        if (this.timeLock == 1) inPoint  = outPoint - duration + 1;
        else if (this.timeLock == 0) outPoint = inPoint + duration - 1;
    break;
    }
    document.getElementById('soundInPoint').value  = nas.Frm2FCT(inPoint ,2);
    document.getElementById('soundOutPoint').value = nas.Frm2FCT(outPoint,2);
    document.getElementById('soundDuration').value = nas.Frm2FCT(duration,2);
    xUI.selection([xUI.Select[0],xUI.Select[1]+duration-1]);
    xUI.selectCell([xUI.Select[0],inPoint]);
//    xUI.sectionUpdate();
}
/**
    シート上のダイアログのプロパティをパネルに反映
*/
SoundEdit.getProp = function(){
    if(xUI.edmode<2) return;//NOP
    var targetTrack   = xUI.XPS.xpsTracks[xUI.Select[0]];
    var targetSection = targetTrack.sections[xUI.floatSectionId]
//ターゲットセクションの値を取得して表示同期
    var inPoint  = targetSection.startOffset();
    var outPoint = inPoint + targetSection.duration - 1;
    document.getElementById('sndBody').value=targetSection.value.toString();
    document.getElementById('soundInPoint').value  = nas.Frm2FCT(inPoint ,2);
    document.getElementById('soundOutPoint').value = nas.Frm2FCT(outPoint,2);
    document.getElementById('soundDuration').value = nas.Frm2FCT(targetSection.duration,2);

    document.getElementById('soundLabel').value = targetSection.value.name;
    document.getElementById('soundProps').value = targetSection.value.attributes.join(",");
}
/** パネルの内容をシートに同期反映させる　値が同じプロパティはスキップ
    forceオプションが立っていたら強制的にスピン適用を行う
*/
SoundEdit.sync = function(force){
    if(xUI.edmode<2) return;//NOP
//台詞
    var targetTrack   = xUI.XPS.xpsTracks[xUI.Select[0]];
    var targetSection = targetTrack.sections[xUI.floatSectionId];
    var newContent    = new nas.AnimationSound(document.getElementById('sndBody').value);newContent.parseContent();
    var minLength     = newContent.bodyText.length+newContent.comments.length;
    if ((force)||(minLength > targetSection.duration)){
        targetSection.duration = xUI.spinValue*minLength;
        document.getElementById("soundDuration").value=xUI.spinValue*minLength;
        SoundEdit.floatTC(2);
    }
    targetSection.value.contentText = newContent.contentText;
    //テキストエリアの内容が正しいコンテンツ型式であるか保証されないので注意！
    //パーサにチェック機能を設けるか　またはフィルタすること
    targetSection.value.parseContent();

    //変更したデータでリストを更新する。変更が発生していればHTMLを書き直し
    var labelCount = this.labels.length;
        this.labels.add(targetSection.value.name);

    var propCount=this.props.length;
    for(var ix=0;ix<targetSection.value.attributes.length;ix++){
        this.props.add((targetSection.value.attributes[ix]).replace( /(^\(|\)$|^<|>$|^\[|\]$)/g ,''));
    }

    var noteCount = this.notes.length;
    for(var ix=0;ix<targetSection.value.comments.length;ix++){
        this.notes.add(targetSection.value.comments[ix][1].replace( /(^\(|\)$|^<|>$|^\[|\]$)/g ,''));
    }
    if( (labelCount != this.labels.length)||
        (propCount != this.props.length)||
        (noteCount != this.notes.length)){this.panelInit();}
    
    targetTrack.sections.manipulateSection(
        xUI.floatSectionId,
        nas.FCT2Frm(document.getElementById('soundInPoint').value),
        nas.FCT2Frm(document.getElementById('soundDuration').value)-1
    );
    xUI.sectionUpdate();
}
/**
    音響編集パネルを閉じる
*/
SoundEdit.close = function(){
	if($("#optionPanelSnd").is(":visible")){
	    //閉じる時に編集内容を確定しておく
	    if(xUI.edmode > 0) {
	        this.sync();
	        xUI.mdChg(0);
	    }
		xUI.sWitchPanel("Snd");
		
	}else{
		return false;
	}
	return null;
}
/*  パネルを開く
    すでに開いていたら最小化されていないか確認して開く　最小化もされていなければ　NOP Return
    開く際モードを確認して必要に合わせてモードを変更する
    null値セクションの場合は、選択範囲の前後にセクションノードを挿入して空の値セクションを作成して選択
    その後　mdChg(2)
*/
SoundEdit.open=function(){
    var targetTrack   = xUI.XPS.xpsTracks[xUI.Select[0]];

    if($("#optionPanelSnd").is(":visible")){
	    if(document.getElementById('optionPanelSnd').style.display=='none')
	      document.getElementById('optionPanelSnd').style.display='inline';
		return false;
	}else{
    //this.targetSection = this.targetTrack.sections[xUI.floatSectionId];
    if ((! xUI.viewOnly)&&(targetTrack.option=='dialog')&&(xUI.edmode<2)){
        var currentFrame=(xUI.Select[1]==0)? 1:xUI.Select[1];
//フロートセクションがないのでモード遷移をトライ
//モード遷移に失敗したら新規のセリフ(有値セクション)を作成してそれを選択する
        if(! xUI.mdChg('section')){
            xUI.selectCell([xUI.Select[0],currentFrame-1]);
            xUI.put('----,,----');//
            xUI.selectCell([xUI.Select[0],currentFrame]);
            xUI.mdChg('section');
        };
    }
		this.init();
		xUI.sWitchPanel("Snd");
	}
	return null;
}




// debaug デバグ用ルーチン		------ dbg.js

/*
	デバグ汎用
		デバッグ対象ルーチン側でロードすること
*/


	var dbg_info=new Array();
if(typeof console == 'undefined'){
    if(air.Introspector){
        console=air.Introspector.Console;
    }else{
        console = {};
if(dbg) console.log=function(aRg){
        //dbg_action(aRg)
            try{document.getElementById('msg_well').value += (String(aRg) + "\n");}catch(err){alert(err)}
        };
    }
}
//でばぐ出力
function dbgPut(aRg){
//	document.getElementById('msg_well').value += (aRg+"\n");
	if(console){if(dbg) console.log(aRg);}
}
function show_all_props(Obj){
	var Xalert="\n\tprops\n\n";
	for (prop in Obj) Xalert+=(prop+"\t:\t"+Obj[prop]+"\n\n\n");
	dbgPut(Xalert);
}
function dbg_action(cmd){
    if(appHost.platform=="AIR"){
        document.getElementById('msg_well').value += (":"+aRg+"\n");
        return;
    }
//エラー発生時はキャプチャしてそちらを表示する
	var body="";
	try{body=eval(cmd);}catch(er){body=er;};
	document.getElementById('msg_well').value += (body+'\n');
//	if(console){if(dbg) console.log(body);}

}


 