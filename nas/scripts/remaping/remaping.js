/**
 * Remaping本体スクリプト
 *     XPSオブジェクトとMAPオブジェクトについては、
 *     以下のドキュメントを参照のこと
 *     http://www.nekomataya.info/remaping/teck.html
 *     $Id: remaping.js,v 1.66 2014/11/29 kiyo Exp $
 * CEP動作のための修正開始
 */
// http://d.hatena.ne.jp/amachang/20071010/1192012056 //
/*@cc_on _d=document;eval('var document=_d')@*/

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
    xUI.backupStore    ="12345";    //作業バックアップ

//------------------------ 以下インターフェースカラープロパティ
//カラー・トラック幅等のルック決定要素はundefinedで初期化して　遅延解決に移行する

    xUI.sheetbaseColor   ;        //タイムシート背景色
    xUI.sheetblankColor;        //編集不可領域の背景色
    xUI.footstampColor;        //フットスタンプの色
    xUI.inputModeColor =new Object();            //入力モード色
    xUI.inputModeColor.NORMAL;    //    ノーマル色
    xUI.inputModeColor.EXTEND;    //    ラピッド入力基本色
    xUI.inputModeColor.FLOAT;    //    ブロック移動基本色
    xUI.inputModeColor.SECTION;    //    範囲編集中の色
         
    xUI.selectedColor;    //選択セルの背景色
    xUI.selectionColor;        //選択領域の背景色
    xUI.editingColor;            //セル編集中のインジケータ
    xUI.selectingColor;        //セル選択中のインジケータ
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

//そのほか
    this.keyMethod        = KEYMethod;    //キー変換方式
    this.aeVersion        = AEVersion;    //キーにつけるバージョン番号


/**     xUIオブジェクト初期化メソッド
 *      編集対象となるXpsオブジェクトを与えて初期化する。
 *      初期化時点の参照変数はconfig.js内で設定された値及び
 *      nas_common.jsで処理されたオブジェクト
 *
 */

/**
      新規に動作モードを実装 2016 12
      モードは以下三態
    production  
    management  
    browsing    

        各モード内で作業条件によって read onlyの状態がある

        セッション溯及ステータスを実装　2017 01
        sessionRetrace
        制作管理上の作業セッションはジョブに　１：１で対応する
        整数値で作業の状態を表す データを読み取った際にセットされる
        その都度のドキュメントの保存状態から計算される値なのでデータ内での保存はされない
    -1  所属セッションなし(初期値)
    0   最新セッション
    1~  数値分だけ遡ったセッション
        
*/
xUI.init    =function(XPS,referenceXps){

    this.XPS=XPS;                           //XPSを参照するオブジェクト
    this.sessionRetrace = -1;               //管理上の作業セッション状態
/*
    以下の情報を　グローバルの変数でなくXPSから取得するように変更
*/
    this.dialogSpan    = SoundColumns;      //シート上の配置に合わせてXPSを初期化する
    this.timingSpan    = SheetLayers;       //シートは便宜上サウンド/タイミング（セル）/カメラ の３エリアに分けられるが
    this.cameraSpan    = CompositColumns;   //実際は各タイムラインは混在可能である
    this.dialogCount   = SoundColumns;      //タイムライン種別数控え
    this.stillCount    = 0;                 //背景を標準的に読み込む場合はここに数値を入れる
    this.timingCount   = SheetLayers;       //
    this.sfxCount      = 0;                 //
    this.cameraCount   = CompositColumns;   //空欄でも良いと思われるが

    this.referenceXPS=new Xps();
    this.referenceXPS.init(5,144);
/**    引数に参照オブジェクトが渡されていたら、優先して解決
マルチステージ拡張実装後、直接指定された参照ステージは、初期化時のみ優先 */
    if ((typeof referenceXps != "undefined") && (referenceXps instanceof Xps)){
        this.referenceXPS=referenceXps;
    };

/**
    参照用XPSは初期化の引数で与える（優先）
    初期化時点で参照Xpsが与えられなかった場合は、XPSに含まれる参照ステージの内容、XPS内のステージストアにある現行ステージの前段のステージを利用する セットアップのタイミングはUIの初期化以降に保留される
*/
    this.referenceView=["timing"];      //表示させる種別を配列で　
    //キーワード:"all"=["replacement","timing","camerawork","effect","still","dialog","sound"],"cell(スチル含む)"=["timing","still"]
    //"replacement","timing","camerawork","effect","still","dialog","sound"
    this.referenceLabels=new Array();   //表示させる数（後で初期化）　
/** 
    以下UI動作制御変数
    viewMode    ページ単位表示か又は全体を1ページ1カラムで表示させるかのフラグ
    uiMode      編集/管理/閲覧モードのフラグ
    viewOnly    編集禁止（データのreadonlyではなくUI上の編集ブロック）
*/
    this.viewMode    = ViewMode;        //表示モード Compact/WordProp
    this.uiMode      = 'browsing';    // ui基本動作モード production/management/browsing
    this.viewOnly    = true;           //編集禁止フラグ
    this.hideSource  = false;           //グラフィック置き換え時にシートテキストを隠す
    this.showGraphic = true;            //置き換えグラフィックを非表示　＝　テキスト表示

//if(appHost.platform=="AIR") this.showGraphic    = false;

    this.onSite      = false;           //Railsサーバ上での動作時サーバのurlが値となる
    this.currentUser = new  nas.UserInfo(myName);//実行ユーザをmyNameから作成
    
    this.spinValue   = SpinValue;       //スピン量
    this.spinSelect  = SpinSelect;      //選択範囲でスピン指定
    this.sLoop       = SLoop;           //スピンループ
    this.cLoop       = CLoop;           //カーソルループ
    this.utilBar     = true;            //サブツールバーの初期状態
    this.SheetLength    = SheetLength;  //タイムシート1枚の表示上の秒数 コンパクトモードではシート長が収まる秒数に強制される
//コンパクトモード時はこのプロパティとcolsの値を無視するように変更
    this.SheetWidth= this.XPS.xpsTracks.length; //シートの幅(編集範囲)
    this._checkProp=function(){

//XPSをチェックしてxUIのシートビュープロパティを更新
    this.dialogCount=0;this.stillCount=0;this.timingCount=0;this.sfxCount=0;this.cameraCount=0;
    this.dialogSpan=0;this.cameraSpan=0;
for(var idx=0;idx<(this.XPS.xpsTracks.length-1);idx++){
//for(var idx=0;idx<this.XPS.xpsTracks.length;idx++){}
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
     case "replacement": ;
     case "timing": this.timingCount++;break;
     default:       ;// NOP
    };
//表示域左側で連続した音声トラックの数を控える（最初に出てきたsound/dialog以外のトラックの位置で判定 ）
    if((XPS.xpsTracks[idx].option!="dialog")&&(! this.dialogSpan)){this.dialogSpan=this.dialogCount};
//フレームコメントの左側の連続したcamera/sfxトラックの数を控える(最後のcamera/sfx/effect以外のトラックの位置から計算)
    if((XPS.xpsTracks[idx].option != "camera")&&(XPS.xpsTracks[idx].option!="sfx")&&(XPS.xpsTracks[idx].option!="effect")){this.cameraSpan=XPS.xpsTracks.length-idx-2};
//カウントする、ただしこのルーチンはこの後プロパティに変換してレイヤ数が変わるたびにプロパティとして変更するように変更されるべき。
}
//
    this.timingSpan=XPS.xpsTracks.length-(this.cameraSpan+this.dialogSpan+1);//カメラ（非画像トラックの合計）
    this.SheetWidth=XPS.xpsTracks.length;
/*
参照するトラック数をスイッチをもとに算出
*/
    this.referenceLabels=new Array();//クリア
    this.refRegex=new RegExp(xUI.referenceView.join("|"));
        for(var ix=0;ix<xUI.referenceXPS.xpsTracks.length;ix++){
            var currentTrack=xUI.referenceXPS.xpsTracks[ix].option;
            var currentLabel=xUI.referenceXPS.xpsTracks[ix].id;
            if(currentLabel.length>2) currentLabel=currentLabel.slice(0,2);
            if(currentTrack.match(this.refRegex)) {
                this.referenceLabels.push(currentLabel)
            }
        }
    }
    this._checkProp();
    this.PageLength         =this.SheetLength*Math.ceil(XPS.framerate);  //1ページの表示コマ数を出す
//    1秒のコマ数はドロップを考慮して切り上げ
    this.cPageLength        =Math.ceil(XPS.framerate);                  //カラム長だったけど一秒に変更
    this.sheetSubSeparator  =SheetSubSeparator;                         //サブセパレータの間隔
    this.PageCols           =SheetPageCols;                             //シートのカラム段数。
                //    実際問題としては１または２以外は使いづらくてダメ
                //    コンパクトモードでは1段に強制するのでこの値を無視する
    this.fct0               =Counter0;                                  //カウンタのタイプ
    this.fct1               =Counter1;                                  //二号カウンタはコンパクトモードでは非表示

    this.favoriteWords      =FavoriteWords;                             //お気に入り単語
    this.footMark           =FootMark;                                  //フットマーク機能フラグ
    this.autoScroll         =AutoScroll;                                //自動スクロールフラグ
    this.tabSpin            =TabSpin;                                   //TABキーで確定操作

    this.noSync             =NoSync;                                    //入力同期停止

    this.blmtd              =BlankMethod;                               //カラセル方式デフォルト値
                    //["file","opacity","wipe","expression1","expression2"];
    this.blpos              =BlankPosition;                             //カラセル位置デフォルト値
                    //["build","first","end","none"]

    this.fpsF               =FootageFramerate;                          //フッテージのフレームレート
                            //コンポサイズdefeult
    this.dfX                =defaultSIZE.split(",")[0];                 //コンポサイズが指定されない場合の標準値
    this.dfY                =defaultSIZE.split(",")[1];                 //
    this.dfA                =defaultSIZE.split(",")[2];                 //
    this.timeShift          =TimeShift;                                 //読み込みタイムシフト

//yank関連
    this.yankBuf            ={body:"",direction:""};                    //ヤンクバッファは、comma、改行区切りのデータストリームで
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
    this.floatSourceAddress =[0,0];
    this.floatDestAddress   =[0,0];
    this.spinBackup         =this.spin();//スピン量をバックアップ

//    アクセス頻度の高いDOMオブジェクトの参照保持用プロパティ
    this["data_well"]       =document.getElementById("data_well");//データウェル
    this["snd_body"]        =document.getElementById("snd_body");//音声編集バッファ


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
    インターフェースルック設定
    カラー・及びシートルックを更新
    分離のみ　暗色のテーマにはまだ対応していないので注意　2017.02.04
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
    this.sheetblankColor    = nas.colorAry2Str(mul(nas.colorStr2Ary(this.sheetbaseColor),.95)); //編集不可領域の背景色
    this.sheetborderColor   = nas.colorAry2Str(mul(nas.colorStr2Ary(this.sheetbaseColor),.75)); //罫線基本色
    this.footstampColor     = sheetLooks.FootStampColor;                                        //フット/差分　スタンプの色
//       this.inputModeColor   = new Object();                                      //  入力モード色
        this.inputModeColor.NORMAL  = sheetLooks.SelectedColor;                     //  ノーマル色
        this.inputModeColor.EXTEND  = sheetLooks.RapidModeColor;                    //  ラピッド入力基本色
        this.inputModeColor.FLOAT   = sheetLooks.FloatModeColor;                    //  ブロック移動基本色
        this.inputModeColor.SECTION = sheetLooks.SectionModeColor;                  //  範囲編集中の色

    this.selectedColor    = this.inputModeColor.NORMAL;                                     //選択セルの背景色
    this.selectionColor    = sheetLooks.SelectionColor;                                     //選択領域の背景色
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
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.FLOAT),mul(nas.colorStr2Ary(this.selectionColor),5)),6));
        this.inputModeColor.SECTIONselection=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(this.inputModeColor.SECTION),mul(nas.colorStr2Ary(this.selectionColor),5)),6));
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


//================================================================================================================================ルックの適用
//タイムシート背景色をsheetbaseColorに設定
    document.body.style.backgroundColor     = this.sheetbaseColor;
    console.log(this.sheetbaseColor);
//ヘッダとフッタの背景色をシート背景色で塗りつぶし
    document.getElementById("fixedHeader").style.backgroundColor = this.sheetbaseColor;

    nas.addCssRule("table.sheet","background-color:"+this.sheetbaseColor,"screen");


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
//    $(mySections[idx][0]).css(mySections[idx][1],mySections[idx][2])
};

//    シートブランクの色設定
var mySeps=[
    "ltSep","dtSep","ntSep","ntSep",
    "lsSep","dsSep","nsSep","nsSep",
    "lnSep","dnSep","nnSep","nnSep"
];

for(var idx=0;idx<mySeps.length;idx++){
    nas.addCssRule("."+mySeps[idx]+"_Blank","background-color:"+xUI.sheetBlankColor)
};
//================================================================================================================================ シートカラーcss設定


//================================================================================================================================ シートカラーcss設定2
//    シート境界色設定
    $('table').css('border-color',xUI.sheetbaseColor);
    $('th').css('border-color',xUI.sheetBorderColor);
    $('td').css('border-color',xUI.sheetBorderColor);
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
    引数：キーワード　activate/deactivate/checkin/checkput/abort/reseipt
    ステータス変更成功時は、モードにあわせてアプリケーションのモードを設定
    引数がカラの場合は、現在のステータスを返す
    非同期のサービスレスポンス待ちなのでコールバック渡し
*/
xUI.setDocumentStatus = function(myCommand){
    if (typeof myCommand == 'undefined') return this.XPS.currentStatus;
    switch (myCommand){
        case 'activate':
        //activate / 再開する
            if((this.XPS.currentStatus.match(/Fixed|Hold/i))&&
            //activate
//            (this.XPS.update_user.split(':').reverse()[0] == document.getElementById('current_user_id').value)){}
            (this.XPS.update_user.email == document.getElementById('current_user_id').value)){
            //Fixed/Holdからアクティベートする場合は、ジョブID/名称の変更はなし
                serviceAgent.activateEntry(function(){
                    //成功時はドキュメントのステータスを更新してアプリモードをproductionへ変更
                    xUI.XPS.job=newJob;
                    xUI.XPS.currentStatus='Active';
                    xUI.viewOnly=false;
                    xUI.setUImode('production');
                },function(result){if(dbg) console.log('fail checkin:');if(dbg) console.log(result);});
            }
        break;
        case 'deavtivate':
            //deactivate / 保留
            if(this.XPS.currentStatus.match(/Active/i)){
                serviceAgent.currentRepository.deactivateEntry(function(){
                    //成功時はドキュメントのステータスを更新してアプリモードをproductへ変更
                    xUI.XPS.currentStatus='Hold';
                    xUI.viewOnly=true;
                    xUI.setUImode('browsing');
                },function(result){if(dbg) console.log('fail checkin:');if(dbg) console.log(result);});
            }
        break;
        case 'checkin':
            //check-in / 開く
            if(this.XPS.currentStatus.match(/Startup|Fixed/i)){
            //現テータスがStartup/Fixedの場合新しいジョブの名称が必要　ジョブ名は第二引数で置く　ジョブIDは繰り上がる 
//                     　var newJobName = (arguments[1])? arguments[1]:xUI.XPS.update_user.split(':')[0];
                     　var newJobName = (arguments[1])? arguments[1]:xUI.XPS.update_user.handle;
                       var newJob = new XpsStage([parseInt(xUI.XPS.job.id)+1,newJobName].join(':'));
                serviceAgent.currentRepository.checkinEntry(newJob,function(){
                    //成功時はドキュメントのステータスを更新してアプリモードをproductへ変更
                    xUI.XPS.job=newJob;
                    xUI.XPS.currentStatus='Active';
                    xUI.viewOnly=false;
                    xUI.setUImode('production');
                },function(result){if(dbg) console.log('fail checkin:');if(dbg) console.log(result);});
            }
        break;
        case 'checkout':
            //check-out / 閉じる
            if(this.XPS.currentStatus.match(/active/i)){
                serviceAgent.currentRepository.checkoutEntry(function(){
                    //成功時はドキュメントのステータスを更新してアプリモードをproductへ変更
                    xUI.XPS.currentStatus='Fixed';
                    xUI.viewOnly=true;
                    xUI.setUImode('browsing');
                },function(result){if(dbg) console.log('fail checkout:');if(dbg) console.log(result);});
            }
        break;
        case 'Startup':
            //receipt / 検収
            if(this.XPS.currentStatus.match(/fixed/i)){
                serviceAgent.currentRepository.checkoutEntry(Xps.getIdentifier(this.XPS),function(){
                    //成功時はドキュメントのステータスを更新してアプリモードをproductへ変更
                    xUI.XPS.currentStatus='Hold';
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
*/
xUI.setUImode = function (myMode){
    if(typeof myMode == 'undefined') myMode='current';
            document.getElementById('pmcui-checkin').innerHTML=((xUI.XPS.currentStatus =='Hold')||(xUI.XPS.currentStatus =='Active'))?nas.localize(nas.uiMsg.pMinUse):nas.localize(nas.uiMsg.pMcheckin);//'作業中':'作業開始'//
    switch (myMode){
        case 'current':;//NOP return
            return xUI.uiMode;
            break;
        case 'production':;
            if(xUI.XPS.currentStatus != 'Active'){return this.setUImode('browsing');}
            　xUI.viewOnly = false;//メニュー切替
    $('#ddp-man').hide();
	$('#pmaui').hide();
    $("li#auiMenu").each(function(){$(this).hide()});
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
        case 'management':;
            //メニュー切替
            　xUI.viewOnly =  true;
    $('#ddp-man').show();
	$('#pmaui').show();
    $("li#auiMenu").each(function(){$(this).show()});
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
    $("li#auiMenu").each(function(){$(this).hide()});
            document.getElementById('pmcui-checkin').disabled    = ((xUI.sessionRetrace==0)&&((xUI.XPS.currentStatus=='Startup')||(xUI.XPS.currentStatus=='Fixed')))? false:true;                
            document.getElementById('pmcui-update').disabled     =true;
            document.getElementById('pmcui-checkout').disabled   = true;
            if (xUI.currentUser.sameAs(xUI.XPS.update_user)) {
            //ドキュメントオーナー
            document.getElementById('pmcui-activate').disabled   = ((xUI.sessionRetrace==0)&&((xUI.XPS.currentStatus=='Hold')||(xUI.XPS.currentStatus=='Fixed')||(xUI.XPS.currentStatus=='Active')))? false:true;
            }else{
            //オーナー外
            document.getElementById('pmcui-activate').disabled   = (xUI.XPS.currentStatus=='Fixed')?false:true;
            }
            document.getElementById('pmcui-deactivate').disabled = true;


            //インジケータカラー変更
            $('#pmcui').css('background-color','#bbddbb');
            $('#pmcui').css('color','#668866');
            break;
        default:;
            var nextMode = ['production','management','browsing'].indexOf(xUI.uiMode);
            return this.setUImode(['browsing','production','management'][nextMode]);
    }
//プルダウンメニューの表示をステータスに合わせる
            this.pMenu('pMcheckin'      ,(document.getElementById('pmcui-checkin').disabled)?'disable':'enable');
            this.pMenu('pMsave'         ,(document.getElementById('pmcui-update').disabled)?'disable':'enable');
            this.pMenu('pMcheckout'     ,(document.getElementById('pmcui-checkout').disabled)?'disable':'enable');
            this.pMenu('pMactivate'     ,(document.getElementById('pmcui-activate').disabled)?'disable':'enable');
            this.pMenu('pMdeactivate'   ,(document.getElementById('pmcui-deactivate').disabled)?'disable':'enable');

            this.pMenu('pMreceipt'      ,(document.getElementById('pmaui-receipt').disabled)?'disable':'enable');
            this.pMenu('pMcheckoutF'    ,(document.getElementById('pmaui-checkout').disabled)?'disable':'enable');
            this.pMenu('pMabort'        ,(document.getElementById('pmaui-abort').disabled)?'disable':'enable');
            this.pMenu('pMbranch'       ,(document.getElementById('pmaui-branch').disabled)?'disable':'enable');
            this.pMenu('pMmerge'        ,(document.getElementById('pmaui-merge').disabled)?'disable':'enable');
//
    xUI.uiMode=myMode;
    sync('productStatus');
    return xUI.uiMode;
}

/*    xUI.edChg(status boolean)
    セル編集フラグ 切り替えと同時に表示を調整
*/
xUI.edChg=function(status){
    if(this.viewOnly) return false;
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
            //編集操作モード　0:通常入力　1:ブロック移動　2:区間編集
    if(typeof myModes == "undefined") myModes="normal";
//モード遷移にあわせてUIカラーの変更
    switch(myModes){
    case "section":
    case 2:
    this.edmode=2;
        this.selectedColor    =this.inputModeColor.SECTION;        //選択セルの背景色
        this.spinAreaColor    =this.inputModeColor.SECTIONspin;    //非選択スピン背景色
        this.spinAreaColorSelect    =this.inputModeColor.SECTIONspinselected;    //選択スピン背景色
        this.selectionColor    =this.inputModeColor.SECTIONselection;    //選択領域の背景色
    break;
    case "block":    //フロートモードに遷移
    case "float":    //前モードがsectionだった場合は編集を解決
    case 1:        //前モードがノーマルだった場合はNOP
      if(this.emode==2){}
      this.edmode=1;
      this.spinBackup=this.spin();this.spin(0);//スピン量をバックアップしてクリア
      this.floatSourceAddress=this.Select.slice();    //移動ソースアドレスを退避
        this.selectedColor    =this.inputModeColor.FLOAT;    //選択セルの背景色
        this.spinAreaColor    =this.inputModeColor.FLOATspin;    //非選択スピン背景色
        this.spinAreaColorSelect    =this.inputModeColor.FLOATspinselected;    //選択スピン背景色
        this.selectionColor    =this.inputModeColor.FLOATselection;    //選択領域の背景色
    break;
    case "normal":    //ノーマルモードに復帰
    case 0:        //前モードに従って終了処理をここで行う
    default :    //
    if(this.edmode==2){
        
    }
    if(this.edmode==1){
        this.edmode=0;
        this.selectedColor    =this.inputModeColor.NORMAL;        //選択セルの背景色
        this.spinAreaColor    =this.inputModeColor.NORMALspin;    //非選択スピン背景色
        this.spinAreaColorSelect=this.inputModeColor.NORMALspinselected;//選択スピン背景色
        this.selectionColor    =this.sheetLooks.SelectionColor;            //選択領域の背景色
//if(dbg) dpgPut("select:"+this.floatSourceAddress+"\nmove:"+sub(this.floatDestAddress,this.floatSourceAddress));

        this.selectCell(this.floatSourceAddress);//ソースに位置を復帰して
        this.move(sub(this.floatDestAddress,this.floatSourceAddress),opt);//ムーブコマンド発行

        this.spin(this.spinBackup);//スピン量をバックアップから復帰
    }
    }
    //var bkRange=this.Selection.slice();
    this.selection(add(this.Select,this.Selection));
    return this.edmode;
}

/*    xUI.floatTextHi()
引数:なし　モード変数を確認して動作
モードチェンジの際に編集（保留）中のテキストを薄く表示する/もどす
*/
xUI.floatTextHi=function(){
    var paintColor=(this.edmode==0)?"black":this.floatTextColor;
var range=[this.floatSourceAddress,add(this.floatSourceAddress,this.Selection)];
//    dbgPut("selectionHi :\n"+range.join("\n"));
//指定範囲をハイライト
    for (C=range[0][0];C<=range[1][0];C++){
        for (L=range[0][1];L<=range[1][1];L++){
            if((C<0) || (L<0)||(C>=XPS.xpsTracks.length)||(L>=XPS.xpsTracks[C].length)){
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
    myResult=myResult.replace(/\$TITLE/g,XPS.title);
    myResult=myResult.replace(/\$SUBTITLE/g,XPS.subtitle);
    myResult=myResult.replace(/\$OPUS/g,XPS.opus);
    myResult=myResult.replace(/\$SCENE/g,XPS.scene);
    myResult=myResult.replace(/\$CUT/g,XPS.cut);
    myResult=myResult.replace(/\$TIME/g,XPS.time());
    myResult=myResult.replace(/\$TC/g,XPS.getTC(XPS.time()));
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
//        フレームループ
        for(F=0;F < myDuration;F++){
            try {this.XPS.xpsTracks[T][F]=content;this.syncSheetCell();}catch(e) {alert(e);return;};
        };
    };
    return true;
};

/*    undoバッファ初期化
        undoバッファをクリアして初期化
            undoStackのデータ構造
        [セレクト座標,セレクション,入力データストリーム,[セレクト座標,セレクション]]
    または    [セレクト座標,セレクション,Xpsオブジェクト]

    座標と選択範囲は配列で、入力データはcomma、改行区切りで2次元のstream
    第３要素がXpsオブジェクトであった場合は、ドキュメント全体の更新が行われた場合である
    その際は、処理系を切り替えて以下の操作を行う
    従来、UNDOバッファをフラッシュしていた操作が行われた場合
    現状のXPSデータを、オブジェクト化してUndoバッファに積みundoポインタを加算する。
    オブジェクト化の際は参照が発生しないように新規のXpsオブジェクトを作成のこと

    セッション内で明示的にundoバッファをクリアする際はこのメソッドをコールする

clear    :    セッション開始/ユーザ指定時
NOP    :    新規作成/保存/ダウンロード

 */
xUI.flushUndoBuf=function(){
    this.inputFlag="nomal";//入力フラグ["nomal","undo","redo"]
    this.undoStack=new Array();//アンドウスタック
        this.undoStack.push([[0,1],[0,0],'']);
    this.undoPt=0;    //アンドウポインタ初期化
    this.storePt=0;    //保存ポインタ初期化
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
if(fileBox.saveFile){fileBox.saveFile();}else{writeXPS(XPS);}

    }else{
        localStorage.setItem("info.nekomataya.remaping.backupData",XPS.toString());
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
        if(XPS.readIN(xUI.data_well.value)){
            xUI.init(XPS);
            //nas_Rmp_Init();
        }
        if(myReference){xUI.referenceXPS.parseXps(myReference);}
            nas_Rmp_Init();
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
"UIheaderFix"
"UIheaderScrollH"
"UIheaderScrollV"
*/
xUI.adjustScale=function(myScale){
    if(typeof myScale == "undefined"){myScale=[1,1]}
    else if(! (myScale instanceof Array)){myScale=[1,(myScale)?myScale:1]};
    var myId=["UIheaderFix","UIheaderScrollH","UIheaderScrollV","sheet_body"];
    for (var ix=0;ix<myId.length;ix++){
        if(appHost.platform.match(/CSX|CEP|AIR/)){
          document.getElementById(myId[ix]).style.WebkitTransformOrigin="0px 0px";
          document.getElementById(myId[ix]).style.WebkitTransform='scale('+myScale.join(",")+')';
        }else{
          document.getElementById(myId[ix]).style.transformOrigin="0px 0px";
          document.getElementById(myId[ix]).style.transform='scale('+myScale.join(",")+')';
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
    var newXPS=new Xps();
    newXPS.readIN(XPS.toString());//別オブジェクトとして複製を作る
    //変更してputメソッドに渡す
    newXPS.reInitBody(newTimelines,newDuration);
if(dbg) console.log(newXPS);
    this.put(newXPS);
};

xUI.switchStage=function(){
    alert(localize(nas.uiMsg.dmUnimplemented));//未実装
};
/**
    リファレンスエリアにデータをセットする
    引数がない場合は、現在のデータをそのまま利用する
*/
xUI.setReferenceXPS=function(myXps){
    if(typeof myXps == 'undefined'){
        this.referenceXPS.readIN(xUI.XPS.toString());
    } else if (myXps instanceof Xps) {
        this.referenceXPS=myXps;
    } else {
        return false
    }
        nas_Rmp_Init();
        //sync("reference");//書き直しの少ない穏やかな同期をあとで書く2016
        return true;
    }
//////
/**
        xUI.drawSheetCell(HTMLTableCellElement)
    テーブルセルを引数で与えてグラフィック置換及びテキスト置換を行う
    trTdから分離して機能調整
*/
xUI.drawSheetCell = function (myElement){
if(typeof myElement =="undefined"){return false;}
var target=myElement;

if(this.showGraphic){
    var tgtID=target.id.split("_").reverse();
    var myXps=(tgtID.length==2)? this.XPS:this.referenceXPS;
    var myStr = myXps.xpsTracks[tgtID[1]][tgtID[0]];
    var drawForm = false;
    var sectionDraw = false;
    var mySection = myXps.xpsTracks[tgtID[1]].getSectionByFrame(tgtID[0]);
/**
    判定時にトラック種別を考慮する
    ダイアログ、サウンド
    リプレースメント
    カメラ
    エフェクト
    それぞれに置き換え対象シンボルが異なるので注意
*/
    var currentTrackOption  = myXps.xpsTracks[tgtID[1]].option;
//    var currentSectionID    = 
//    xUI.Cgl.remove(target.id);//古いグラフパーツがあれば削除↓
// グラフパーツの削除はセルエントリの消去時に行わないと画面が乱れるので注意
    switch(currentTrackOption){
        case "sound":;
        case "dialog":;
            if (myStr.match(/[-_─━~]{2,}?/)){
               myStr=(this.showGraphic)?"<br>":"<hr>";
               drawForm = "sound-section-open";
            };//あとでセクションパース版と置き換え
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
            if (myStr.match(/^[\|｜]$/)){
                myStr=(this.showGraphic)?"<br>":"｜";                
                drawForm = "line";
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
           }
            else if (myStr.match(/^▲$/)){
                if(this.hideSource) myStr="<br>";                
           }
            else if (myStr.match(/^\]([^\]]+)\[$/)){
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
    if(sectionDraw){
//        if(console) if(dbg) console.log([tgtID[1],mySection.startOffset()].join("_")+":"+formStr+":"+drawForm+":"+mySection.duration);
        setTimeout(function(){xUI.Cgl.sectionDraw([tgtID[1],mySection.startOffset()].join("_"),drawForm,mySection.duration);},0);
    }else{
        setTimeout(function(){xUI.Cgl.draw(target.id,drawForm)},0);
    }
}
    return myStr;
}
}
/**
    テーブル表示用文字列置換
        xUI.trTd(Str);
    タグ等htmlで表示不能な文字を置き換える
    戻り値は変換後の文字列
*/
xUI.trTd=function(){
if(typeof arguments[0] =="undefined"){return false;}
var target=arguments[0];

    target=target.toString().replace( />/ig, "&gt;").replace(/</ig,"&lt;");//<>
//    if(this.Select[0]>0 && this.Select[0]<(this.SheetWidth-1)) target=target.toString().replace(/[\|｜]/ig,'|<br>');
//    if(target.match(/^[:：]$/)) return ':<br>';//波線
//    if(target.match(/[-_─━~]{2,}?/)) return "<hr>";//
return target;

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
/*    指定のシートセルを選択状態にする
        xUI.selectCell(HTMLElementID)
        xUI.selectCell([myTrack,myFrame]);
引数が配列の場合も受け付ける
*/
xUI.selectCell=function(ID){
    if (typeof ID == "undefined") ID='';
if(dbg) document.getElementById("app_status").innerHTML=ID;//デバッグ用
//      現在のセレクトをフォーカスアウト 引数が偽ならば フォーカスアウトのみ(ここでリターン)
    if(! ID){return;};
//      選択セルの内容をXPSの当該の値で置換 新アドレスにフォーカス処理開始 = IDをセレクト
//      指定IDが稼働範囲外だったら丸め込む
if(ID instanceof Array){
    var tRack = ID[0];
    var fRame = ID[1];
}else{
    var tRack = ID.split("_")[0]*1;
    var fRame = ID.split("_")[1]*1;
}
    if (tRack<0 || tRack>=this.SheetWidth){    tRack=(tRack<0)?0:XPS.xpsTracks.length-1;};
    if (fRame<0 || fRame>=XPS.duration()) {    fRame=(fRame<0)?0:XPS.duration()-1;};
    ID=tRack+'_'+fRame;
//    JQオブジェクトを取得
    var currentJQItem=$("#"+ID);
//    セレクションクリア
        this.selectionHi("clear");
//    フットマーク機能がオンならば選択範囲とそしてホットポイントをフミツケ
    if(this.footMark && this.diff(this.getid('Select'))){
        paintColor=this.footstampColor;//                    == footmark ==
    }else{
        paintColor=this.sheetbaseColor;//                    == clear ==
    };
//      footstamp
    document.getElementById(this.getid("Select")).style.backgroundColor=paintColor;
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
    this.bkup([XPS.xpsTracks[tRack][fRame]]);    //編集前にバックアップする
    var eddt=XPS.xpsTracks[tRack][fRame];    //編集済データ取得
//    ヘッドライン
    if(document.getElementById("iNputbOx").value!=eddt)
    {    document.getElementById("iNputbOx").value=eddt;};//編集ラインに送る
/*    オートスクロールフラグが立っていたらスクロールを制御
    現在、オートスクロールで移動時にマウスによる選択処理をキャンセルしている
    オートスクロールのアルゴリズムが改善されたら処理を検討のこと
    コンパクトモードと通常モードで動作切り替え

    全体の位置に加えて、現在のスクーンサイズを条件に追加して使用感を改善すること
    2015-0331

オートスクロール起動条件
縦方向    セルフォーカスが表示範囲上下一定（６または８？）フレーム以内であること(上下別の条件に)
横方向　セルフォーカスが表示範囲左右一定（２～４？）カラム以内であること（左右別条件に）
かつ移動余裕があること=各条件がシート端からの距離以上であること
*/
    if (this.autoScroll){ this.scrollTo(ID) };
    document.getElementById("iNputbOx").select();
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
    if(ID=="memo"){ID=XPS.xpsTracks.length -1};

    var lineOffset=this.Select[1]-Math.floor(this.Select[1]/(this.PageLength/this.PageCols))*(this.PageLength/this.PageCols);//ラインオフセット
    var fr=cols*(this.PageLength/this.PageCols)+lineOffset;
    if(fr>=XPS.duration()){return};
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
    for (C=range[0][0];C<=range[1][0];C++){
        for (L=range[0][1];L<=range[1][1];L++){
try{
            if((C<0) || (L<0)||(C>=XPS.xpsTracks.length)||(L>=XPS.xpsTracks[C].length)){
//    当座のバグ回避とデバッグ C.Lが操作範囲外だったときの処置 値を表示
//                dbgPut(range.toString());
            }else{
                if (!(this.Select[0]==C && ( this.Select[1]+this.spinValue > L && this.Select[1] <= L)))
                {
                    if(Method=="hilite")
                    {
                        paintColor=xUI.selectionColor
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
    for(L=this.Select[1]+1;L<this.spinValue+this.Select[1];L++)
    {
        if(L > 0 && L < XPS.xpsTracks[0].length){
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
/*    足跡をチェック
        xUI.footstampPaint();
        現在のカーソル位置を控えて全選択して解除
        カーソル位置を戻す
 */
xUI.footstampPaint    =function(){

    var restoreValue=this.getid("Select");
        this.selectCell("0_0");
        this.selection((this.SheetWidth-1)+"_"+XPS.duration());
        this.selection();
        this.selectCell(restoreValue);
};
//
/*    タイムシート本体のヘッダを返すメソッド(ページ単位)
        xUI.headerView(pageNumber)
        引数はページ番号を整数で
        第一ページ以外は省略形を返す
        戻り値はページヘッダのHTMLテキスト
 */
xUI.headerView = function(pageNumber){

var Pages=(this.viewMode=="Compact")? 1:Math.ceil(XPS.duration()/this.PageLength);//ページ長で割って切り上げ
var    _BODY ='';
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
    _BODY+='<td class=pgHeader id="update_user'+pageNumber+'">'+(XPS.update_user.toString()).split(":")[0]+'</td>';
//    _BODY+='<td class=pgHeader id="update_user'+pageNumber+'">'+XPS.update_user.handle+'</td>';
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
    if((XPS.trin[0]>0)&&(XPS.trout[0]>0)){    _BODY+=' / ';};
    if(XPS.trout[0]>0){
    _BODY+="▼ "+XPS.trout[1]+'('+nas.Frm2FCT(XPS.trout[0],3)+')';
    };
    _BODY+='</span>';

        _BODY+='<div id="memo_prt">';
        if(XPS.xpsTracks.noteText.toString().length){
            _BODY+=XPS.xpsTracks.noteText.toString().replace(/(\r)?\n/g,"<br>");
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
var tableBodyWidth=(
    tableFixWidth+
    this.sheetLooks.DialogWidth*xUI.dialogCount +
    this.sheetLooks.StillCellWidth*xUI.stillCount +
    this.sheetLooks.SfxCellWidth*xUI.sfxCount +
    this.sheetLooks.CameraCellWidth*xUI.cameraCount +
    this.sheetLooks.SheetCellWidth*xUI.timingCount +
    this.sheetLooks.CommentWidth );//
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
/*    第二象限固定ヘッダは、タイムガイド幅
    第一象限ヘッダーはカラム数分繰り返し
    第三象限ヘッダーはシート枚数分繰り返し
UI設定に基づいて段組
*/
var tableFixWidth=this.sheetLooks.TimeGuideWidth;

/*
    以前はテーブル内のタイムラン種別をここで判定していたが
    xUIのプロパティに変換してこちらでは計算のみを行う仕様に変更済み 2015/04.25
*/
var tableBodyWidth=(
    this.sheetLooks.TimeGuideWidth +
    this.sheetLooks.ActionWidth*this.referenceLabels.length +
    this.sheetLooks.DialogWidth*xUI.dialogCount +
    this.sheetLooks.StillCellWidth*xUI.stillCount +
    this.sheetLooks.SfxCellWidth*xUI.sfxCount +
    this.sheetLooks.CameraCellWidth*xUI.cameraCount +
    this.sheetLooks.SheetCellWidth*xUI.timingCount +
    this.sheetLooks.CommentWidth ) * this.PageCols +
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
    }
BODY_ +=' >';
BODY_ +='<tbody>';
    if(true){
//========================================シートヘッダ
/*    テーブルルックを決め込む為の幅配置及び将来的にリンクペアレントを表示する領域(かも)
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
        for (r=0;r<this.referenceLabels.length;r++){
BODY_ +='<th class="referenceSpan" ';
BODY_ +='> </th>';
        };

/*********** Dialog Area*************/
//予約タイムラインの為一回分別に出力
//BODY_ +='<th class=dialogSpan ';
//BODY_ +='> </th>';
/************左見出し固定時の処理*****************/
    if(pageNumber<=-2){
/*********** Edit Area *************/
//=====================編集セル本体の固定部分のみをタイムライン種別に合わせて配置(ラベル部分)
if(true){
        for (var r=0;r<(xUI.dialogSpan);r++){
    BODY_ +='<th class=dialogSpan  id="TL'+(r+1)+'" ></th>';
        }
}else{
        for (var r=0;r<XPS.xpsTracks.length;r++){
//BODY_ +='<th class="editSpan" ';//editSpanは後で消しておくこと
 switch (XPS.xpsTracks[r].option)
 {
case "dialog":
    BODY_ +='<th class=dialogSpan ';
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
        for (r=0;r<XPS.xpsTracks.length-1;r++){
            //末尾レコードはコメント固定なので判定せず（レコード長から1減算）　
 switch (XPS.xpsTracks[r].option)
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
//BODY_ +='style=" width:'+this.sheetLooks.TimeGuideWidth+CellWidthUnit+'"';
BODY_ +=' ><span class=timeguide> TIME </span></th>';
/*********** Action Ref *************/
BODY_ +='<th colspan="'+this.referenceLabels.length+ '" id="rnArea" class="rnArea" ondblclick=alert(this.id)';
//　ここは参照ステージ名に置き換え予定
BODY_ +=' >Reference</th>';
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
//ここは編集中のステージ名に置き換え予定
BODY_ +='>Animation</th>';

/*********** Edit Area 2 (camera+sfx) *************/
if(xUI.cameraSpan>0){
BODY_ +='<th colspan='+xUI.cameraSpan+' id=editArea class=editArea ondblclick="alert(this.id)"; '
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
        for (r=0;r<this.referenceLabels.length;r++){

BODY_ +='<th id="rL';
BODY_ += r.toString();
BODY_ += '_';
BODY_ += pageNumber;
BODY_ += '_';
BODY_ += cols.toString();

BODY_ +='" class="layerlabelR"';
BODY_ +=' >';
var lbString=(this.referenceLabels[r].length<4)?this.referenceLabels[r]:'<a onclick="return false;" title="'+this.referenceLabels[r]+'">●</a>';


 if (this.referenceLabels[r].match(/^\s*$/)){
    BODY_ +='<span style="color:'+this.sheetBorderColor+'";>'+nas.Zf(r,2)+'</span>';
 }else{
    BODY_ +=lbString;
 };

        };
    if(pageNumber>=-1){
//=====================編集セル本体(ラベル部分)

        for (var r=(xUI.dialogSpan);r<(XPS.xpsTracks.length-1);r++){
    if(XPS.xpsTracks[r].option=="comment"){break;}
BODY_ +='<th id="L';
BODY_ += r.toString();
BODY_ += '_';
BODY_ += pageNumber;
BODY_ += '_';
BODY_ += cols.toString();
 switch (XPS.xpsTracks[r].option){
case "still" :BODY_ +='" class="stilllabel" ' ;break;
case "effect":
case "sfx"   :BODY_ +='" class="sfxlabel" '   ;break;
case "camerawork":
case "camera":BODY_ +='" class="cameralabel" ';break;
case "replacement":
case "timing":
case "dialog":
case "sound":
default:BODY_ +='" class="layerlabel" ';
}

BODY_ +=' >';
if(XPS.xpsTracks[r].option=="still"){
 if (XPS.xpsTracks[r].id.match(/^\s*$/)){
    BODY_ +='<span style="color:'+SheetBorderColor+'";>'+nas.Zf(r,2)+'</span>';
 }else{
    BODY_ +='<a onclick="return false" title="'+XPS.xpsTracks[r].id+'">▼</a>';
 };
}else{
 if (XPS.xpsTracks[r].id.match(/^\s*$/)){
    BODY_ +='<span style="color:'+SheetBorderColor+'";>'+nas.Zf(r,2)+'</span>';
 }else{
    BODY_ +=XPS.xpsTracks[r].id;
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
//秒セパレータ
    var tH_border= 'class=ltSep';
    var dL_border= 'class=dtSep';
    var sC_border= 'class="ntSep';
    var mO_border= 'class=ntSep';
}else{
    if (n%this.sheetSubSeparator==(this.sheetSubSeparator-1)){
//    サブセパレータ
        var tH_border= 'class=lsSep';
        var dL_border= 'class=dsSep';
        var sC_border= 'class="nsSep';
        var mO_border= 'class=nsSep';
    }else{
//    ノーマル(通常)指定なし
        var tH_border= 'class=lnSep';
        var dL_border= 'class=dnSep';
        var sC_border= 'class="nnSep';
        var mO_border= 'class=nnSep';
    };
};
//背景色設定
/*    判定基準を継続時間内外のみでなくドロップフレームに拡張
*/
//    if ((current_frame != null)&&(current_frame < XPS.duration())){}
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
//    {BODY_ += ((n+1)+cols*SheetRows).toString();}else{BODY_+='<br>';};
BODY_ +='</td>';
//参照シートセル
    for (var r=1;r<= this.referenceLabels.length;r++){
//仮表示（シート本体と同内容）2013 01 29
//参照XPSに切替　02 17
BODY_ +='<td ';
    if (! isBlankLine){}
    if (current_frame<this.referenceXPS.xpsTracks[r].length){
BODY_ += 'id=\"r_';
BODY_ +=r.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
BODY_ +=sC_border+cellClassExtention + ' ref"';
    }else{
BODY_ +=sC_border+'_Blank"';
};
BODY_ +='>';
        if (current_frame>=this.referenceXPS.xpsTracks[r].length){
    BODY_+="<br>";
        }else{
    this.Select=[r,current_frame];
    if (this.referenceXPS.xpsTracks[r][current_frame]!=""){
        BODY_ += this.trTd(this.referenceXPS.xpsTracks[r][current_frame]);
//        BODY_ += this.trTd(document.getElementById(["r",[r],[current_frame]].join("_")));
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
    var outputColumus=(pageNumber<-2)?xUI.dialogSpan-1:XPS.xpsTracks.length-2;
for (var r=0;r<=outputColumus;r++){
if((r==0)||(XPS.xpsTracks[r].option=="dialog"))    {
//ダイアログセル
BODY_ +='<td ';
//    if ((current_frame != null)&&(current_frame < XPS.duration())){}
    if (! isBlankLine){
BODY_ += 'id="';
BODY_ +=r.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
//BODY_ +='onclick="return xUI.Mouse(event)" ';
    };
BODY_ += dL_border+cellClassExtention;
BODY_ +='>';
//        if((current_frame==null)||(current_frame>=XPS.duration()))
        if (isBlankLine){
    BODY_+="<br>";
        }else{
    this.Select=[0,current_frame];
    if (XPS.xpsTracks[r][current_frame]!=""){
        BODY_+=this.trTd(XPS.xpsTracks[r][current_frame]);
    }else{
        BODY_ += '<BR>';
    }    };

BODY_ +='</td>';
    }else{
//シートセル
//極力インラインスタイルシートを書かないように心がける 05'2/25
BODY_ +='<td ';
//    if ((current_frame != null)&&(current_frame < XPS.duration())){}
    if (! isBlankLine){
BODY_ += 'id="';
BODY_ +=r.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
//BODY_ +='onclick="xUI.Mouse(event)" ';
    };
BODY_ +=sC_border+cellClassExtention +'"';
BODY_ +='>';
//        if((current_frame==null)||(current_frame>=XPS.duration())){}
        if (isBlankLine){
    BODY_+="<br>";
        }else{
    this.Select=[r,current_frame];
    if ( XPS.xpsTracks[r][current_frame]!=""){
        BODY_ += this.trTd(XPS.xpsTracks[r][current_frame]);
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
//    if (current_frame < XPS.duration()){}
    if (! isBlankLine){
BODY_ += 'id="';
BODY_ += (XPS.xpsTracks.length-1).toString()+'_'+ current_frame.toString();
BODY_ +='" ';
//BODY_ +='onclick="xUI.Mouse(event)" ';
    };
BODY_ +=mO_border+cellClassExtention;
BODY_ +='>';
//        if(current_frame>=XPS.duration()){}
        if (isBlankLine){
    BODY_+="<br>";
        }else{
    this.Select=[XPS.xpsTracks.length-1,current_frame];
    if ( XPS.xpsTracks[XPS.xpsTracks.length-1][current_frame]!=""){
        BODY_ += this.trTd(XPS.xpsTracks[XPS.xpsTracks.length-1][current_frame]);
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
//    id((ID<0)||(ID>this.SheetWidth)){return;};
var Target=ID;
var PageCols=(this.viewMode=="Compact")?1:this.PageCols;
var PageCount=(this.viewMode=="Compact")?1:Math.ceil(XPS.duration()/this.PageLength);
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
var PageCount=(this.viewMode=="Compact")?1:Math.ceil(XPS.duration()/this.PageLength);
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
    NxFr =((NxFr + NxsV) % XPS.duration() );
    if (!this.sLoop) {if (fRame > NxFr) {NxFr = fRame}};
    break ;
case 'back' :    ;//スピン後方*
    NxFr =((NxFr + XPS.duration() - NxsV ) % XPS.duration() ) ;
    if (!this.sLoop) {if (fRame < NxFr) {NxFr = fRame }};
    break ;
case 'down' :    ;//\[down\]*
    NxFr = (NxFr + 1 )% XPS.duration() ;
    if ((!this.cLoop) && (fRame > NxFr)) {NxFr = fRame};
    break ;
case 'up' :    ;//\[up\]*
    NxFr = ((NxFr + XPS.duration() -1) % XPS.duration() );
    if ((!this.cLoop) && (fRame < NxFr)) {NxFr = fRame * 1};
    break ;
case 'right' :    ;//\[right\]データが未編集の場合のみ左右スピン
    if (! this.edchg)
    {
        NxrA =(NxrA < XPS.xpsTracks.length) ?
        (NxrA + 1 ) : (XPS.xpsTracks.length) ;
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
    if(NxFr+this.cPageLength < XPS.duration()){
    NxFr=NxFr+this.cPageLength};
    break;
case 'v_up' :    ;//spin値ひとつあげ
    NxsV++;if(NxsV > XPS.framerate) NxsV=1;
//return NxsV;
    break;
case 'v_dn' :    ;//spin値ひとつさげ
    NxsV--;if(NxsV <= 0) NxsV=XPS.framerate;
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
//
//xUI.dialogSpin=dialogSpin_;
//

/*xUI.getCurrent()
引数:なし
戻値:現在フォーカスのあるシートセルの持つ値

現行の関数は、timingタイムラインのみで意味を持つので、改修が必要2015.09.18

*/
xUI.getCurrent=function(){

    var currentValue=null;
    for(id=this.Select[1];id>=0;id--)
    {
        currentValue=dataCheck(XPS.xpsTracks[xUI.Select[0]][id]);
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
xUI.copy    =function(){    this.yank();};

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
    if(xUI.viewOnly) return false;
    if(typeof dest =="undefined"){return false};//移動指定なし
    if ((dest[0]==0) && (dest[1]==0)){return false};//指定は存在するが移動はなし

    if(typeof dup =="undefined"){dup=false};//複製指定なし

    var bkPos=this.Select.slice();//現在のフォーカス位置を控える
    var bkRange=this.Selection.slice();//現在のセレクト範囲
    
    var myRange=this.actionRange();//移動対象範囲
    var destRange=[add(myRange[0],dest),add(myRange[1],dest)];//移動先範囲
    var fkPos=add(bkPos,dest);//[dest[0]+bkPos[0],dest[1]+bkPos[1]];//移動終了後のフォーカス
//alert(fkPos)
    if ((fkPos[0]<0)||(fkPos[1]<0)||(fkPos[0]>XPS.xpsTracks.length)||(fkPos[1]>XPS.xpsTracks[0].length)){return false}
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
    var bulk=XPS.getRange([[left,top],[right,bottom]]);
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

    if(this.edMode!=0){this.mdChg("normal")};//編集モードをノーマルに復帰

    this.selectCell(fkPos.join("_"));
    this.selection(add(fkPos,bkRange));
}

/*    やり直し    */
xUI.undo    =function (){
    if(this.undoPt==0) {
if(dbg) {dbgPut("UNDOバッファが空")};
        return;
    };
    //UNDOバッファが空
if(dbg) {dbgPut("undoPt:"+this.undoPt+":\n"+this.undoStack[this.undoPt].join("\n"))};
    this.inputFlag="undo";
    var putResult=this.put();
    if(putResult){
if(dbg) {dbgPut("putResult:\n"+putResult)};
    }
};

/*    やり直しのやり直し    */
xUI.redo    =function(){
    if((this.undoPt+1)>=this.undoStack.length) {
if(dbg){dbgPut("REDOバッファが空")};
        return;
    };
        //REDOバッファが空
if(dbg) {dbgPut("undoPt:"+this.undoPt+"\n:"+this.undoStack[this.undoPt].join("\n"))};
    this.inputFlag="redo";
    var putResult=this.put();
    if(putResult){
if(dbg) {dbgPut("putResult:\n"+putResult)};
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
    if (FrameEndAddress>=XPS.duration()) FrameEndAddress=XPS.duration()-1;//継続時間内にクリップ
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
    return XPS.getRange(Range);
};


/*    xUI.put(dataStream[,direction])
引数    :dataStream    シートに設定するデータ　単一の文字列　またはXpsオブジェクト または　配列　省略可
    :direction    データ開始位置ベクトル　配列　省略可　省略時は[0,0]
    シートに外部から値を流し込むメソッド
        xUI.put(データストリーム)
        読み込みとかにもつかえるべし
    Xps.put オブジェクトメソッドを変更したのでそれに対応
    戻り値から書き換えに成功した範囲と書き換え前後のデータが取得できるのでその戻値を利用する
    このメソッド内では、選択範囲方向の評価を行わないためフォーカス／セレクションは事前・事後に調整を要する場合がある
    選択範囲によるクリップはオブジェクトメソッドに渡す前に行う必要あり
    
    グラフィックレイヤー拡張によりシート上の画像パーツを更新する操作を追加
    Xps更新後に、xUI.syncSheetCell()メソッドで必要範囲を更新のこと
*/
xUI.put    =function(datastream,direction){
  if(xUI.viewOnly) return false;
  if(typeof datastream == "undefined") datastream="";
  if(typeof direction  == "undefined") direction=[0,0];
// var Cexpand=true;//コンマ展開フラグ 不使用
  switch (this.inputFlag){
  case "redo":        this.undoPt++;                //REDO処理時
  case "undo":    ;//UNDO処理時
    var undoTarget=this.undoStack[this.undoPt];    //処理データ取得
// undo内容をオブジェクトメソッドでputするためにホットポイントを作成する
// Select=undoTarget[0] Selection=undoTarget[1];
// ホットポイント設定
    var hotPoint=[
        (undoTarget[1][0]>0)?undoTarget[0][0]:undoTarget[0][0]+undoTarget[1][0],
        (undoTarget[1][1]>0)?undoTarget[0][1]:undoTarget[0][1]+undoTarget[1][1]
    ]
    this.selection();//セレクション解除
//    this.selection(add(undoTarget[0],undoTarget[1]));//処理範囲を直接設定（負数を）指定可能 startDirection=undoTarget[1];

//    this.selectCell(undoTarget[0]);//ターゲットのシートセルにフォーカス
    this.selectCell(hotPoint);//ターゲットのシートセルにフォーカス
    datastream=undoTarget[2];
        break;
  default:                ;//通常のデータ入力
                    //
  };
/*
処理データが、Xpsオブジェクトだった場合は、現在のXPS（編集対象データ全体）を複製してUndoバッファに格納
その後dataStreamのXpsでXPSを初期化する

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
[Select],[Selection],[dataBody]
dataBodyは データストリーム,Xpsオブジェクト,またはプロパティの配列
プロパティ配列のフォーマットは後記

*/
    var lastAddress=this.Select.slice();//最終操作アドレス初期化
//UNDO配列
    var UNDO=new Array(3);
        UNDO[0]    =this.Select.slice();
        UNDO[1]    =this.Selection.slice();

/*    入力データを判定    */
if(datastream instanceof Xps){
/*    Xpsならばシートの入れ替えを行うので
    現在のシートを複製してundoStackに格納
*/
    var prevXPS=new Xps();
    prevXPS.readIN(XPS.toString());
    UNDO[2]=prevXPS;
//入力データをXPSに設定（複製か？）
    this.XPS.readIN(datastream.toString());
//新規のXpsのサイズを確認して    
    nas_Rmp_Init();//画面全体更新
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
        UNDO[2]=[datastream[0],XPS.xpsTracks[myTarget[1]][myTarget[0]]];
        this.XPS.xpsTracks[myTarget[1]][myTarget[0]]=datastream[1];//入力値を設定
        if(myTarget[0] =="option"){this.XPS.xpsTracks[myTarget[1]].sectionTrust = false;}
    }else{
//単独プロパティ変更
        UNDO[2]=[datastream[0],this.XPS[myTarget[0]]];
        this.XPS[myTarget[0]]=datastream[1];
    }
    nas_Rmp_Init();//sync系で置き換えが望ましい

/*  if{}else if((this.inputFlag != "move")&&(typeof datastream != "undefined")){} */
}else if(this.inputFlag != "move"){
//moveを増設したのでひとまずスキップ
//alert(this.inputFlag);
/*
    move時は、データ処理が煩雑なのでこのメソッド内では処理しない
    2015.09.19
*/
//通常のデータストリームを配列に変換
//        try {var srcData=datastream.toString().split("\n");}catch(err){alert(err +":\n"+datastream)}
        var srcData=datastream.toString().split("\n");
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
        var FrameEndAddress=((this.XPS.duration()-this.Select[1])<sdHeight)?
    (this.XPS.duration()-1):(FrameStartAddress+sdHeight)    ;//    下端
    };
//バックアップは遅延処理に変更・入力クリップをここで行う
        var Tracklimit=TrackEndAddress-TrackStartAddress+1;
        var Framelimit=FrameEndAddress-FrameStartAddress+1;
    if(srcData.length>Tracklimit){srcData.length=Tracklimit};
    if(srcData[0].length>Framelimit){for (var ix=0;ix<srcData.length;ix++){srcData[ix].length=Framelimit}};
/*
バックアップを遅延処理に変更
//レンジ内のデータをストリームでバックアップする***
    UNDO[2]=this.getRange(
        [[TrackStartAddress,FrameStartAddress],
         [TrackEndAddress  ,FrameEndAddress  ]]
    );
*/
//入力値をオブジェクトメソッドで設定
    switch(this.inputFlag){
    case "redo":
    case "undo":
//        var putReslt=this.XPS.put(undoTarget[0],srcData.join("\n"));
//    this.syncSheetCell([TrackStartAddress,FrameStartAddress],[TrackEndAddress,FrameEndAddress]);
//    break;
    default:
        this.selectionHi("clear");//選択範囲のハイライトを払う
        var putResult=this.XPS.put([TrackStartAddress,FrameStartAddress],srcData.join("\n"));
    this.syncSheetCell([TrackStartAddress,FrameStartAddress],[TrackEndAddress,FrameEndAddress]);
    }
//設定値に従って、表示を更新（別メソッドにしてフォーカスを更新）
//    alert("SYNC :\n"+ [[TrackStartAddress,FrameStartAddress],[TrackEndAddress,FrameEndAddress]]);
    lastAddress=[TrackEndAddress,FrameEndAddress];
//{}

/*UNDO配列を作成 Xps.put()メソッド以外は、各オブジェクトで*/
    if(putResult){
if(dbg){dbgPut("XPS.put :\n"+putResult.join("\n"));}
//        UNDO[0]=putResult[0][0];//レンジが戻るので左上を設定する
//        UNDO[1]=sub(putResult[0][1],putResult[0][0]);//セレクションに変換
//        UNDO[1]=[0,0];//通常処理は選択解除で記憶
        UNDO[2]=putResult[2];//入れ替え前の内容

    }else{

if((dbg)&&(typeof dataStream!="Xps")&&(typeof dataStream!="Array")){
    dbgPut(
        "XPS.put :\n!!!fault!!! :"+putResult+
        "\nAddress:"+[TrackStartAddress,FrameStartAddress]+
        "\nsrcData:"+srcData.join("\n")
    );
}
//        UNDO[2]="!!!fault!!!"
    }
}
//操作別に終了処理
switch (this.inputFlag){
case "undo":
case "redo":
        this.undoStack[this.undoPt][2]=UNDO[2];    //UNDO処理時
if(undoTarget.length==4){
//第４要素がある場合のみredo用のデータを設定して、カーソル復帰処理を行う
    var currentAddress=undoTarget[3][0].slice();
    var currentRange=undoTarget[3][1].slice();
    this.undoStack[this.undoPt][3]=[this.Select.slice(),this.Selection.slice()];

    this.selection (add(this.Select,currentRange));
    this.selectCell(currentAddress);
}else{
    this.selection(add(undoTarget[0],undoTarget[1]));
    this.selectCell(undoTarget[0]);
};
        if(this.inputFlag=="undo")this.undoPt--;
        break;
case "nomal":    ;//通常のデータ入力
if(datastream instanceof Xps){
    this.selectCell("1_0");//
}else{
//一行入力の際のみ処理後のスピン操作で次の入力位置へ移動できるポジションへ
  if(putResult){
//    alert(putResult[0]+":"+add(putResult[0][1],[0,-(this.spinValue-1)]).join("_"));
//    this.selectCell(add(putResult[0][1],[0,-(this.spinValue-1)]).join("_"));
    this.selection();
    this.selectCell(putResult[0][1].join("_"));//操作なしに最終アドレスへ
//
  }
}
case "move":
default:    ;//カット・コピー・ペースト操作の際はカーソル移動無し
        this.undoPt++;
        this.undoGc=0;
if(dbg){
    dbgPut(    "UNDO stack add:\n"+UNDO.join("\n"));
}
        this.undoStack[this.undoPt]=UNDO;
        if (this.undoStack.length>(this.undoPt+1))
            this.undoStack.length=(this.undoPt+1);
//        this.selectCell([TrackStartAddress,FrameStartAddress]);
};
        this.inputFlag="nomal";
// undoバッファの状態を表示
    sync("undo");sync("redo");
//編集バッファをクリア・編集フラグを下げる(バッファ変数をモジュールスコープに変更したので副作用発生)
    if(this.edchg)    this.edChg(false);
    if(this.eXMode==1){this.eXMode=0;this.eXCode=0;};//予備モード解除
// 処理終了アドレスを配列で返す(使わなくなったような気がする)
return lastAddress;
};
/*xUI.syncSheetCell(startAddress,endAddress,isReference)
    指定されたレンジのシートセルの内容を更新
    指定がない場合は、シート全て
    アドレス一致の場合は、一コマのみ
*/
xUI.syncSheetCell=function(startAddress,endAddress,isReference){
    var targetXps=(isReference)? this.referenceXPS:this.XPS;
    if((! startAddress)||(! endAddress)){
        startAddress=[0,0];
        endAddress  =[targetXps.xpsTracks.length,targetXps.xpsTracks[0].length];
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
this.drawSheetCell(sheetCell);//関数内でシートセルを書き換える
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
	switch(key) {
case	25	:if(! Safari) break;
case	9	:	//tab
if (! this.tabSpin) {
	if(!this.edchg) return;
	this.put(this.eddt);
	return false;break;
}
case	13	:		//Enter 標準/次スピン・シフト/前スピン・コントロール/interpSpin
	if(e.ctrlKey){interpSign();return false;}
	if (this.edchg){
		this.put(nas_expdList(this.eddt));//更新
//		alert("xstop");
//		this.selection();
		this.selectCell(add(this.Select,[0,1]));//入力あり
	}else{
	    if(e.shiftKey){
		if(expd_repFlag){
			this.spin("up");expd_repFlag=false;
		}else{
			this.spin("back");
		}
	    }else{
		if(expd_repFlag){
		this.spin("down");expd_repFlag=false;
		}else{
			this.spin("fwd");//入力なしカラ送り
//			this.selectCell(add(this.Select,[0,1]));//入力あり
		}
	    };
//	if(! e.ctrlKey){}
	    if(! e.ctrlKey){
		if(this.getid("Selection")!="0_0")
			{this.selection();this.spinHi();};//選択範囲解除
	    }
	}
	return false;
	break;
case	27	:	//esc 選択範囲解除
//		編集中
	if (this.edchg){return false;}//バックアップ復帰のためスキップ(実処理はUP)
//		複数セレクト状態
	if(this.getid("Selection")!="0_0")
		{this.selection();this.spinHi();break;};//選択範囲解除
		return false;break;//標準処理(NOP)

//case 32	:		//space 値を確定してフォーカスアウト
//	this.edchg=false;
//	this.focusCell();	break;
case	38	:		//カーソル上・下
case	40	:		//[shift]+時はセレクションの調整 [ctrl]+時はさらにスピン量の調整も兼ねる
 	if (	e.shiftKey &&
		this.Select[1]+this.Selection[1]>=0 &&
		this.Select[1]+this.Selection[1]<(XPS.duration()-1)
	){
		var kOffset=(key==38)? -1:1;
		this.selection(this.Select[0]+"_"+
		(this.Select[1]+this.Selection[1]+kOffset));
		if((e.ctrlKey)||(this.spinSelect)) this.spin("update");
	}else{
		//通常入力処理
	 if(! e.ctrlKey){
		if(this.getid("Selection")!="0_0"){this.selection();this.spinHi();};//選択範囲解除
	 }
		if (this.edchg){this.put(this.eddt);}//更新
		if(key==38){this.spin("up")}else{this.spin("down")};
	}	;return false;	break;
case	39	:		//右
	if ((! this.edchg)||(this.viewOnly)) {this.spin("right")	;return false;
	}else{
	return true;
	};	break;
case	37	:		//左?
	if ((! this.edchg)||(this.viewOnly)) {this.spin("left")	;return false;
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
	this.selectCell(this.Select[0]+"_"+XPS.duration());
	break;
case	36 :;//[HOME]
	this.selectCell(this.Select[0]+"_0");
	break;
case	65 :		;	//[ctrl]+[A]/selectAll
 	if (e.ctrlKey)	{
		this.selectCell(this.Select[0]+"_0");
		this.selection(
			this.Select[0]+"_"+XPS.duration()
		);
		return false;}else{return true}
	break;
case	67 :		;	//[ctrl]+[C]/copy
	if (e.ctrlKey)	{
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
	if (e.ctrlKey)	{
		this.paste();
		return false;}else{return true}
	break;
case	88 :		;	//[ctrl]+[X]/cut
	if (e.ctrlKey)	{
		this.cut();
		return false;}else{return true}
	break;
case	89 :		;	//[ctrl]+[Y]/redo
	if (e.ctrlKey)	{
		this.redo();
		return false;}else{return true}
	break;
case	90 :		;	//[ctrl]+[Z]/undo
	if (e.ctrlKey)	{
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
        this.Select[1]+this.Selection[1]<(XPS.duration()-1)
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
    xUI.selectCell(xUI.Select[0]+"_"+XPS.duration());
//    xUI.selectCell(xUI.Select[0]+"_"+XPS.duration(),"end");
    break;
case    36 :;//[HOME]
//    xUI.selectCell(xUI.Select[0]+"_0","home");
    xUI.selectCell(xUI.Select[0]+"_0");
    break;
case    65 :        ;    //[ctrl]+[A]/selectAll
     if (e.ctrlKey)    {
    if (this.edchg){this.put(this.eddt);}//更新
        this.selectCell(this.Select[0]+"_0");//selall
        this.selection(this.Select[0]+"_"+XPS.duration());
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
[ctrl] +[↑]/[↓]		端点移動
[shift]+[↑]/[↓]		セクション移動
[enter][5]			確定>モードアウト
[esc][0]			モードアウト

*/
xUI.keyPress = function(e){
	key = e.keyCode;//キーコードを取得
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
//xUI.keyPress    =keyPress_ ;
//
//キーアップもキャプチャする。UI制御に必要 今のところは使ってない?
xUI.keyUp = function (e){
	key = e.keyCode;//キーコードを取得
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
	if (e.ctrlKey)	{
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
//alert("mouse:"+e.type.toString())
//document.dbg.Console.value=("mouse:"+e.type.toString())+"\n"+document.dbg.Console.value;
//if(dbg) dbgPut("mouse:"+e.type.toString());
//document.getElementById("iNputbOx").focus();

if(this.edchg){ this.eddt= document.getElementById("iNputbOx").value };
//IEのとき event.button event.srcElement
//    if(MSIE){TargeT = event.srcElement ;Bt = event.button ;}else{};

        var TargeT=e.target;var Bt=e.which;//ターゲットオブジェクト取得
// dbgPut(TargeT.id);
//IDの無いエレメントは処理スキップ
    if(! TargeT.id){return false;}

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
return         ;
    }
//-------------------ヘッダ処理解決

//    if(TargeT.id.split("_").length>2){return false};//判定を変更
//ページヘッダ処理終了
//=============================================モード別処理
if(this.edmode==2){
    
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
//[ctrl]同時押しで複製処理
      this.mdChg(0,(e.ctrlKey));
      this.floatTextHi();
break;
case    "mouseover"    ://可能な限り現在位置で変数を更新
    if(!(TargeT.id.match(/^([0-9]+)_([0-9]+)$/))){return false};//シートセル以外を排除

if(false){
    if(this.Mouse.action){
        if (TargeT.id && xUI.Mouse.rID!=TargeT.id ){
            this.selection(TargeT.id);
            if((e.ctrlKey)||(this.spinSelect)) this.spin("update");
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
//              alert("section edit mode :"+TargeT.id);
//              this.mdChg("section");
//              this.floatTextHi();//導入処理
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
            this.mdChg("block");
            this.floatTextHi();
            this.selectCell(TargeT.id);
            this.floatDestAddress=this.Select.slice();

            this.Mouse.action=false;
            return false;
          }else{
        if(e.shiftKey){
            this.selection(TargeT.id);
            if((e.ctrlKey)||(this.spinSelect)) this.spin("update");
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
            if((e.ctrlKey)||(this.spinSelect)) this.spin("update");
            return false;//マルチセレクト
        }else{
            if (!e.ctrlKey){this.selection()};//コントロールなければ選択範囲の解除

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
            if((e.ctrlKey)||(this.spinSelect)) this.spin("update");
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
            if((e.ctrlKey)||(this.spinSelect)) this.spin("update");
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
*/
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

xUI.Cgl.body={};

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
/**
	セル画像部品描画コマンド
位置計算をブラウザに任せるため　絶対座標でなく相対座標で各テーブルセル自体にCANVASをアタッチする

*/
xUI.Cgl.draw=function addGraphElement(myId,myForm) {
		if(! this.body[myId]){	this.body[myId] = document.getElementById("cgl"+myId)	;}
		if( this.body[myId] ){
			$("#cgl"+myId).remove();delete this.body[myId];
		//二重描画防止の為すでにエレメントがあればクリアして描画
		}
	    var objTarget  = document.getElementById(myId);//ターゲットシートセルを取得
	    if(! objTarget){return false;};//シートセルが存在しない場合は操作失敗
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
		var lineWidth  =3;
		ctx.strokeStyle="rgb(0,0,0)";
		ctx.strokeWidth=lineWidth;
		ctx.moveTo(element.width*0.5, 0);
		ctx.lineTo(element.width*0.5, element.height);
	    ctx.stroke();
break;
case "wave":;			//wave-line	 
		var waveSpan  =5;		var lineWidth  =3;
		ctx.strokeStyle="rgb(0,0,0)";
		ctx.strokeWidth=lineWidth;
		ctx.moveTo(element.width*0.5, 0);
		if(parseInt(myId.split("_").reverse()[0]) % 2){	
	ctx.bezierCurveTo(element.width*0.5-waveSpan, element.height*0.5,element.width*0.5-waveSpan, element.height*0.5,  element.width*0.5, element.height);
		}else{
	ctx.bezierCurveTo(element.width*0.5+waveSpan, element.height*0.5,element.width*0.5+waveSpan, element.height*0.5,  element.width*0.5, element.height);
		}
	    ctx.stroke();
break;
case "fi":;		//fade-in
	var startValue = arguments[2]; var endValue= arguments[3];
	    ctx.fillStyle="rgba(0,0,0,1)";
		ctx.moveTo((1-startValue)*element.width*0.5, 0);
		ctx.lineTo(element.width-(1-startValue)*element.width*0.5,0);
		ctx.lineTo(element.width-(1-endValue)*element.width*0.5,element.height);
		ctx.lineTo((1-endValue)*element.width*0.5,element.height);
		ctx.fill();
break;
case "fo":;		//fade-out
	var startValue = arguments[2]; var endValue= arguments[3];
	    ctx.fillStyle="rgba(0,0,0,1)";
		ctx.moveTo(startValue*element.width*0.5, 0);
		ctx.lineTo(element.width-startValue*element.width*0.5,0);
		ctx.lineTo(element.width-endValue*element.width*0.5,element.height);
		ctx.lineTo(endValue*element.width*0.5,element.height);
		ctx.fill();
break;
case "transition":;		//transition
	var startValue = arguments[2]; var endValue= arguments[3];
	    ctx.fillStyle="rgba(0,0,0,1)";
		ctx.moveTo(startValue*element.width, 0);//
		ctx.lineTo(element.width-startValue*element.width,0);
		ctx.lineTo(element.width-endValue*element.width,element.height);
		ctx.lineTo(endValue*element.width,element.height);
		ctx.fill();
break;
case "circle":;		//circle
		var phi  = .9;		var lineWidth  =3;
		ctx.strokeStyle="rgb(0,0,0)";
		ctx.strokeWidth=lineWidth;
		ctx.arc(element.width * 0.5, element.height * 0.5, element.height*phi*0.5, 0, Math.PI*2, true);
	    ctx.stroke();
break;
case "triangle":;		//triangle
		var lineWidth  =4;
		ctx.strokeStyle="rgb(0,0,0)";
		ctx.strokeWidth=lineWidth;
		ctx.moveTo(element.width*0.5, -1);
		ctx.lineTo(element.width*0.5 + (element.height-2)/Math.sqrt(3), element.height-2);
		ctx.lineTo(element.width*0.5 - (element.height-2)/Math.sqrt(3), element.height-2);
		ctx.closePath();
	    ctx.stroke();
break;
case "section-open":;		//section-open
	var formFill = arguments[2];
	    ctx.fillStyle="rgba(0,0,0,1)";
		ctx.moveTo(element.width * 0.5 - element.height/Math.sqrt(3), 0);
		ctx.lineTo(element.width * 0.5 + element.height/Math.sqrt(3), 0);
		ctx.lineTo(element.width * 0.5 , element.height);
		ctx.closePath();
		if(formFill) {ctx.fill();}else{ctx.stroke();}
break;
case "section-close":;		//section-close
	var formFill = arguments[2];
	    ctx.fillStyle="rgba(0,0,0,1)";
		ctx.moveTo(element.width * 0.5, 0);
		ctx.lineTo(element.width * 0.5 + element.height/Math.sqrt(3), element.height);
		ctx.lineTo(element.width * 0.5 - element.height/Math.sqrt(3), element.height);
		ctx.closePath();
		if(formFill) {ctx.fill();}else{ctx.stroke();}
break;
case "sound-section-open":;		//section-open
	var lineWidth = 3;
	    ctx.fillStyle="rgba(0,0,0,1)";
		ctx.moveTo(0, element.height-lineWidth);
		ctx.lineTo(element.width, element.height-lineWidth);
		ctx.stroke();
break;
case "sound-section-close":;		//section-close
	var lineWidth = 3;
	    ctx.fillStyle="rgba(0,0,0,1)";
		ctx.moveTo(0, lineWidth);
		ctx.lineTo(element.width, lineWidth);
		ctx.stroke();
break;
case "area-fill":;	//fill sheet cell
		ctx.moveTo(0, 0);
	    ctx.fillStyle="rgba(0,0,0,1)";
	    ctx.fillRect(0, 0, targetRect.width, targetRect.height);
break;
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
        if(Idx.length==2){
          this.draw(       [Idx[1],parseInt(Idx[0])+offset].join("_"),myForm,offset / myDuration, (offset+1) / myDuration);
        }else{
          this.draw([Idx[2],Idx[1],parseInt(Idx[0])+offset].join("_"),myForm,offset / myDuration, (offset+1) / myDuration);
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
    if(currentEntry){
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

//オブジェクト戻す
return xUI;
};
/*
りまぴん スタートアップ

    スタートアップを他の位置へまとめる必要があるかも
    remaping.js　が充分すぎるほどスパゲッティなので神様が来そう　2015.06.09
*/
//var MSIE = navigator.userAgent.indexOf("MSIE")!=-1;
//ユーザ設定を予備加工
    var MaxFrames=nas.FCT2Frm(Sheet);//タイムシート尺
    var MaxLayers=SheetLayers;//セル重ね数
//    オブジェクト初期化用ダミーマップ
    var MAP=new xMap(SheetLayers);
//    新規XPSオブジェクト作成・初期化
var        XPS= new Object() ;//ダミーオブジェクトとして初期化
var startupXPS   = ''           ;//初期状態のXPS本文text
var referenceXPS = ''           ;//同参照XPStext
//始動オブジェクトとして空オブジェクトで初期化する スタートアップ終了までのフラグとして使用
var    xUI=new Object();
        xUI.Mouse=function(){return};
        xUI.onScroll=function(){return};
//コード読込のタイミングで行う初期化


/** Startup
    nas_Rmp_Startup
プログラム及び全リソースをロード後に１回だけ実行される手続
    nas_Rmp_Init
データドキュメントロード時に毎回実行される手続　UI初期化を含む
    nas_Rmp_reStart
ページリロード等の際に実行される手続
*/
function nas_Rmp_Startup(){
//バージョンナンバーセット
    sync("about_");
//クッキー指定があれば読み込む
    if(useCookie[0]){ldCk()};

//シートロゴをアップデート
    document.getElementById("headerLogo").innerHTML=
    "<a href='"+ headerLogo_url +
    "' title='"+ headerLogo_urlComment +
    "' target='_new'>"+ headerLogo +"</a>";
//

/**
        XPSを実際のXpsオブジェクトとして再初期化する
*/
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
            try{datastream =ARDJ2XPS(datastream);}catch(err){return false};
        break;
        case    (/^#TimeSheetGrid\x20SheetData/).test(datastream):
            try{datastream =ARD2XPS(datastream);}catch(err){return false}
        break;
        case    (/^\x22([^\x09]*\x09){25}[^\x09]*/).test(datastream):
            try{datastream =TSH2XPS(datastream);}catch(err){return false}
        break;
        case    (/^Adobe\ After\ Effects\x20([456]\.[05])\ Keyframe\ Data/).test(datastream):
            try{datastream=AEK2XDS(datastream)}catch(err){alert(err);return false}
        xUI.put(datastream);return true;
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
        return datastream;
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
//      "mapfile"  ,マップデータは現在どちらでも意味は無いが読み込み側優先
//      "time"     ,関数なので入れ替え不用
//      "trin"     ,読み込んだデータのものを使用
//      "trout"    ,同上
//      "framerate",同上
 */
        var props=[
            "title",
            "subtitle",
            "opus",
            "scene",
            "cut",
            "create_user",
            "update_user",
            "create_time",
            "update_time",
            "line",
            "lineStatus",
            "stage",
            "stageStatus",
            "job",
            "jobStatus",
            "currentStatus"
        ]
        var isImport=((xUI.sessionRetrace==0)&&(xUI.uiMode=='production'))? true:false;
        var newXps = new Xps();
        newXps.parseXps(convertXps(datastream));
        if(isImport){
            for (var ix=0;ix<props.length;ix++){newXps[props[ix]]=XPS[props[ix]]}
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
*/
XPS.syncIdentifier =function(myIdentifier){
    var parseData   = Xps.parseIdentifier(myIdentifier);
    this.title      = parseData.title;
    this.opus       = parseData.opus;
    this.subtitle   = parseData.subtitle;
    this.scene      = parseData.scene;
    this.cut        = parseData.cut;
    if(parseData.currentStatus){
        this.line       = parseData.line;
        this.stage      = parseData.stage;
        this.job        = parseData.job;
        this.currentStatus = parseData.currentStatus;
    }
/*    {
        this.line     = new XpsLine(nas.pm.pmTemplate[0].line);
        this.stage    = new XpsStage(nas.pm.pmTemplate[0].stages[0]);
        this.job      = new XpsStage(nas.pm.jobNames.getTemplate(nas.pm.pmTemplate[0].stages[0],"init")[0]);
        this.currentStatus   = "Startup";     
    }*/
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
//================================================================================================================================

/**
    シートのカラーデータを構築
    別の関数に分離予定
        指定引数は　SheetBaseColorのみ？
*/
//    xUI.setSheetLook(SheetLooks);

if(false){
    if (! SheetBaseColor.toString().match(/^#[0-9a-f]+/i)){
        SheetBaseColor = nas.colorAry2Str(nas.colorStr2Ary(SheetBaseColor));
    };
//タイムシート背景色をconfigで設定した色に置き換え(css固定に変更)
    document.body.style.backgroundColor=SheetBaseColor;
//ヘッダとフッタの背景色をシート背景色で塗りつぶし
    document.getElementById("fixedHeader").style.backgroundColor=SheetBaseColor;
    nas.addCssRule("table.sheet","background-color:"+SheetBaseColor,"screen")

//編集不可領域の背景色
    SheetBlankColor    = nas.colorAry2Str(mul(nas.colorStr2Ary(SheetBaseColor),.95));

//シート境界色
    SheetBorderColor    =nas.colorAry2Str(mul(nas.colorStr2Ary(SheetBaseColor),.75));

//フットスタンプの色    FootStampColor    =document.getElementById("bgStamp").style.backgroundColor;

//選択セルの背景色    SelectedColor    =document.getElementById("bgSelect").style.backgroundColor;
//選択領域の背景色    SelectionColor    =document.getElementById("bgSelection").style.backgroundColor;

//    EditingColor    =document.getElementById("spanEdit").style.backgroundColor;
//セル編集中のインジケータ
//    SelectingColor    =document.getElementById("spanSelection").style.backgroundColor;
//セル選択中のインジケータ
/*
    ["th.timelabel","width:"+(this.sheetLooks.TimeGuideWidth + this.sheetLooks.CellWidthUnit)],
    [".dtSep","width:"+(this.sheetLooks.DialogWidth + this.sheetLooks.CellWidthUnit)],
    [".ntSep","width:"+(this.sheetLooks.CommentWidth + this.sheetLooks.CellWidthUnit)],
    ["td.colSep","width:"+(this.sheetLooks.ColumnSeparatorWidth +this.sheetLooks.CellWidthUnit)],
    ["th.layerlabelR","width:"+(this.sheetLooks.ActionWidth + this.sheetLooks.CellWidthUnit)],
    ["th.layerlabel","width:"+(this.sheetLooks.SheetCellWidth + this.sheetLooks.CellWidthUnit)],
    ["th.framenoteSpan","width",(this.sheetLooks.CommentWidth + this.sheetLooks.CellWidthUnit)],
    ["timeguide","width:"+],
*/
var mySections=[
    ["th.tcSpan"        ,"width" ,(this.sheetLooks.TimeGuideWidth + this.sheetLooks.CellWidthUnit)],
    ["th.dialogSpan"    ,"width" ,(this.sheetLooks.DialogWidth + this.sheetLooks.CellWidthUnit)],
    ["td.colSep"        ,"width" ,(this.sheetLooks.ColumnSeparatorWidth + this.sheetLooks.CellWidthUnit)],
    ["th.referenceSpan" ,"width" ,(this.sheetLooks.ActionWidth + this.sheetLooks.CellWidthUnit)],
    ["th.editSpan"      ,"width" ,(this.sheetLooks.SheetCellWidth + this.sheetLooks.CellWidthUnit)],
    ["th.timingSpan"    ,"width" ,(this.sheetLooks.SheetCellWidth + this.sheetLooks.CellWidthUnit)],
    ["th.stillSpan"     ,"width" ,(this.sheetLooks.StillCellWidth + this.sheetLooks.CellWidthUnit)],
    ["th.sfxSpan"       ,"width" ,(this.sheetLooks.SfxCellWidth + this.sheetLooks.CellWidthUnit)],
    ["th.cameraSpan"    ,"width" ,(this.sheetLooks.CameraCellWidth + this.sheetLooks.CellWidthUnit)]
]

/*    cssにルールセットを追加する関数
    nas.addCssRule( セレクタ, プロパティ, 適用範囲 )
        セレクタ    cssのセレクタを指定
        プロパティ    プロパティを置く
        適用範囲    "screen""print"または"both"
 */
//トラックの幅を設定
/*    リスト
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
//    $(mySections[idx][0]).css(mySections[idx][1],mySections[idx][2])
};

//    シートブランクの色設定
var mySeps=[
    "ltSep","dtSep","ntSep","ntSep",
    "lsSep","dsSep","nsSep","nsSep",
    "lnSep","dnSep","nnSep","nnSep"
];

for(var idx=0;idx<mySeps.length;idx++){
    nas.addCssRule("."+mySeps[idx]+"_Blank","background-color:"+ this.sheetBlankColor)
};

//================================================================================================================================ シートカラーcss設定
}
if(false){
//    設定幅適用
    $("th.tcSpan").width        = (this.sheetLooks.TimeGuideWidth   + this.sheetLooks.CellWidthUnit);
    $("th.referenceSpan").width = (this.sheetLooks.ActionWidth      + this.sheetLooks.CellWidthUnit);
    $("th.dialogSpan").width    = (this.sheetLooks.DialogWidth      + this.sheetLooks.CellWidthUnit);
    $("th.editSpan").width      = (this.sheetLooks.SheetCellWidth   + this.sheetLooks.CellWidthUnit);
    $("th.framenoteSpan").width = (this.sheetLooks.CommentWidth     + this.sheetLooks.CellWidthUnit);
}
//サブルーチンの位置は後で一考

/*============*     初期化時のデータ取得    *============*/

/*
 *  再優先・レンダリング時にドキュメント内にスタートアップデータが埋め込まれている
 */
//    ドキュメント内にスタートアップデータがあれば読み出し

if(document.getElementById( "startupXPS" )){
        startupXPS=document.getElementById("startupXPS").innerHTML;
}
//    同ドキュメント内にスタートアップ用参照データがあれば読み出し

if(document.getElementById( "referenceXPS" ) && document.getElementById( "referenceXPS" ).innerHTML.length){
        referenceXPS=document.getElementById("referenceXPS").innerHTML;
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
    if((referenceXPS)&&(referenceXPS.length)){
        var referenceX=new Xps();
        referenceX.readIN(referenceXPS);
    }
    xUI.init(XPS,referenceX);
/**
    シートのカラーデータを構築
*/
    console.log(SheetLooks);
    xUI.setSheetLook(SheetLooks);
    nas_Rmp_Init();
/* ================================css設定
//================================================================================================================================ シートカラーcss設定2
//    シート境界色設定
    $('table').css('border-color',SheetBaseColor);
    $('th').css('border-color',SheetBorderColor);
    $('td').css('border-color',SheetBorderColor);
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
if(false){    myPref.chgMyName(); document.getElementById("nas_modalInput").focus();}
if((NameCheck)||(myName=="")){   var msg=welcomeMsg+"\n"+localize(nas.uiMsg.dmAskUserinfo)+
        "\n\n ハンドル:メールアドレス / handle:uid@example.com ";
        var newName=null;
        ;//
        nas.showModalDialog("prompt",msg,localize(nas.uiMsg.userInfo),myName,function(){
            if(this.status==0){
                myName = this.value;
                xUI.currentUser = new nas.UserInfo(this.value);
                xUI.XPS.update_user = xUI.currentUser;
                sync("update_user");
                sync("current_user");
            }
        });

    document.getElementById("nas_modalInput").focus();

    };

//    クッキーで設定されたspinValueがあれば反映
    if(xUI.spinValue){document.getElementById("spin_V").value=xUI.spinValue} ;
//ツールバー表示指定があれば表示
    if((xUI.utilBar)&&(!$("#optionPanelUtl").is(':visible'))){$("#optionPanelUtl").show();};//xUI.sWitchPanel('Utl');

document.getElementById("iNputbOx").focus();

};

/*
タイムシートのUIをリセットする手続き
タイムシートの変更があった場合はxUI.init(XPS)を先にコールしてxUIのアップデートを行うこと
引数としてuiModeを文字列で与えて　リセット後のuiModeを指定可能 未指定の場合はリセット前のモードを継続
このルーチンの呼出回数が増えたので、もっと軽量なリセットを考慮すること　2017.02
*/
function nas_Rmp_Init(uiMode){
    var startupWait=false;
//プロパティのリフレッシュ
    xUI._checkProp();
    xUI.Cgl.init();//特にこの処理を重点的にチェック　このルーチンは実行回数が少ないほど良い

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

//タイムシートテーブルボディ幅の再計算 ここにトラック種別が反映されていない　注意
//(タイムヘッダ幅+ダイアログ幅+レイヤ数*幅+コメント欄幅+余分)×ページカラム数＋カラムセパレータ幅×(ページカラム数?1)

var tableBodyWidth=(
    xUI.sheetLooks.TimeGuideWidth + xUI.sheetLooks.DialogWidth + 
    xUI.sheetLooks.ActionWidth*xUI.referenceLabels.length + xUI.sheetLooks.SheetCellWidth*(XPS.xpsTracks.length-2) +
    xUI.sheetLooks.CommentWidth )
    if(xUI.viewMode!="Compact"){
        tableBodyWidth=tableBodyWidth* xUI.PageCols +(xUI.sheetLooks.ColumnSeparatorWidth*(xUI.PageCols-1));//
    }
//全体幅の指定を停止
//    nas.addCssRule("table.sheet","width:"+(tableBodyWidth + CellWidthUnit),"screen");

/* この計算はシート表示初期化の際にのみ必要な計算なのでこちらに移動    07/07/08    */
//シートを初期化
if(dbg) var TimeStart=new Date();

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
    for (Page=1 ;Page <=Math.ceil(XPS.duration()/xUI.PageLength);Page++)
    {
        SheetBody+= xUI.headerView(Page);
        SheetBody+= ' <span class=pgNm>( p '+nas.Zf(Page,3)+' )</span><br>';
        SheetBody+= xUI.pageView(Page);
    };
}
/*
サーバーオンサイトであるか否かを判定して表示を更新
     エレメントが存在すればon-site
 */
　   if(document.getElementById('backend_variables')){
if(dbg) console.log('application server-onsite');
        if (serviceAgent.servers.length==1) {
            serviceAgent.switchService(0);
        }else{
            serviceAgent.switchService(1);//デフォルトサーバのIDを置く
        }
        xUI.onSite = serviceAgent.currentServer.url.split('/').slice(0,3).join('/');
　       serviceAgent.currentStatus='online';
//  ドキュメント表示更新
　       document.getElementById('loginstatus_button').innerHTML = '=ONLINE=';
　       document.getElementById('loginstatus_button').disabled  = true;
         document.getElementById('loginuser').innerHTML = xUI.currentUser.handle;
         document.getElementById('serverurl').innerHTML = serviceAgent.currentServer.url;
//  ユーザ情報取得
        xUI.currentUser = new nas.UserInfo(
            $("#backend_variables").attr("data-user_name") + ":" +
            $("#backend_variables").attr("data-user_email")
        );

        myName = xUI.currentUser.toString();//旧変数互換 まとめて処理する関数が必要

    　   if($("#backend_variables").attr("data-episode_token").length > 0){
if(dbg) console.log('bind single document');
//シングルドキュメント拘束モード
		    startupWait=true;//ウェイト表示を予約
　           serviceAgent.currentStatus='online-single';
document.getElementById('loginstatus_button').innerHTML='>ON-SITE<';
document.getElementById('loginstatus_button').disabled=true;
//document.getElementById('loginuser').innerHTML = xUI.currentUser.handle;
//document.getElementById('serverurl').innerHTML = serviceAgent.currentServer.url;
　       $('#pMbrowseMenu').hide();
　       $('#ibMbrowse').hide();//設定表示
if(dbg) console.log('000000000000000000000=');
                 document.getElementById('toolbarHeader').style.backgroundColor='#ddbbbb';
//サーバ既存エントリ
            var isNewEntry = (startupXPS.length==0)? true:false;
//サーバ上で作成したエントリの最初の1回目は送出データが空            　           
             if($("#backend_variables").attr("data-cut_token").length){
if(dbg) console.log('has cut token');
    　           serviceAgent.currentServer.getRepositories(function(){
                     var RepID = serviceAgent.getRepsitoryIdByToken($("#backend_variables").attr("data-organization_token"));
    　               serviceAgent.switchRepository(RepID,function(){
    　                   if(dbg) console.log('switched repository :' + RepID);
/*最小の情報をトークンベースで取得*/
var myProductToken = $('#backend_variables').attr('data-product_token');
var myEpisodeToken = $('#backend_variables').attr('data-episode_token');
var myCutToken = $('#backend_variables').attr('data-cut_token');

serviceAgent.currentRepository.getProducts(function(){
    serviceAgent.currentRepository.productsUpdate(function(){
        serviceAgent.currentRepository.getEpisodes(function(){
            serviceAgent.currentRepository.episodesUpdate(function(){
                serviceAgent.currentRepository.getSCi(function(){
                    serviceAgent.currentRepository.getList(false,function(){
    　                   var myIdentifier=serviceAgent.currentRepository.getIdentifierByToken(myCutToken);
                         if(Xps.compareIdentifier(Xps.getIdentifier(XPS),myIdentifier) < 5){
    　                       if(dbg) console.log('syncIdentifier:');
    　                       if(dbg) console.log(decodeURIComponent(myIdentifier));
    　                       XPS.syncIdentifier(myIdentifier);
//
if( startupXPS.length==0 ){
if(dbg) console.log('detect first open no content');
if(dbg) console.log('new Entry init');
        xUI.XPS.line     = new XpsLine(nas.pm.pmTemplate[0].line);
        xUI.XPS.stage    = new XpsStage(nas.pm.pmTemplate[0].stages[0]);
        xUI.XPS.job      = new XpsStage(nas.pm.jobNames.getTemplate(nas.pm.pmTemplate[0].stages[0],"init")[0]);
        xUI.XPS.currentStatus   = "Startup";     
        xUI.XPS.create_user=xUI.currentUser;
        xUI.XPS.update_user=xUI.currentUser;
}
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
                switch(xUI.XPS.currentStatus){
                    case "Active":
                    case "Hold":
                    case "Fixed":
                        serviceAgent.activateEntry();
                    break;                        
                    case "Startup":
                        serviceAgent.checkinEntry();
                    case "Aborted":
                    default:
                    //NOP
                }
                        sync('info_');
if(dbg) console.log('初期化終了');
if(dbg) console.log(serviceAgent.currentRepository);                        
                    });
                },false,myEpisodeToken);
            },false,myEpisodeToken);
        },false,myProductToken);
    },false,myProductToken)
},false);
    　               });
    　           });
    　       }else{
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
    　                       XPS.syncIdentifier(myIdentifier);
        xUI.XPS.line     = new XpsLine(nas.pm.pmTemplate[0].line);
        xUI.XPS.stage    = new XpsStage(nas.pm.pmTemplate[0].stages[0]);
        xUI.XPS.job      = new XpsStage(nas.pm.jobNames.getTemplate(nas.pm.pmTemplate[0].stages[0],"init")[0]);
        xUI.XPS.currentStatus   = "Startup";     
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
    　           serviceAgent.switchRepository(1,documentDepot.rebuildList);
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
    document.getElementById("sheet_body").innerHTML=SheetBody+"<div class=\"screenSpace\"></div>";
//"<div class=\"screenSpace\"></div>"+;
// 初回ページレンダリングでグラフィックパーツを配置
// setTimeoutで無名関数として実行
window.setTimeout(function(){
    xUI.syncSheetCell(0,0,false);//シートグラフィック置換
    xUI.syncSheetCell(0,0,true);//referenceシートグラフィック置換
//フットスタンプの再表示
    if(xUI.footMark){xUI.footstampPaint()};
},0);
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
//:nas.uiMsg.processing
$("#optionPanelProg").dialog({
	autoOpen:false,
	modal	:true,
	width	:720,
	title	:localize(nas.uiMsg.processing)
});
})();


//ヘッドラインの初期化
    initToolbox();
//デバッグ関連メニューの表示
    if(dbg){
        $("li#debug").each(function(){$(this).show()});
        if(appHost.platform=="AIR"){$("li#airDbg").each(function(){$(this).show()})};
    }else{
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
//xUI.spin(0);xUI.spin(SpinValue);
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
    if(! xUI.isStored()){
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
/*データ保全は、モード／ケースごとに振り分け必要*/
        if(confirm(msg)){ xUI.setBackup() };
        //保存処理
    };
//データ保存の有無に関係なくセッションチェックイン中ならば保留する（自動）
if(xUI.uiMode=='production'){setTimeout(serviceAgent.deactivateEntry,10);}

// if(confirm("TEST")){return true}else {return false};
//    クッキーを使用する設定なら、
//    現在のウィンドウサイズを取得してクッキーかき出し
 if (useCookie[0]) {writeCk(buildCk());};//現在　cookie:0 は常にfalse

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
server-info
*/
function sync(prop){
if (typeof prop == 'undefined') prop = 'NOP_';
	switch (prop){
case    "historySelector":;
    var currentIdentifier = Xps.getIdentifier(xUI.XPS);
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
	document.getElementById('pmcui_status').innerHTML= xUI.XPS.currentStatus;
	document.getElementById('pmcui_documentWriteable').innerHTML= (xUI.viewOnly)?'[編集不可]':'';
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
		var winTitle=xUI.XPS.getIdentifier();//これは修正予定1/9
		if((appHost.platform == "AIR") && (fileBox.currentFile)){winTitle = fileBox.currentFile.name}
		//winTitle +=(xUI.isStored())?"":" *";
		if(! xUI.isStored()) winTitle = "*"+winTitle;
		if(document.title!=winTitle){document.title=winTitle};//違ってるときのみ書き直す
        if(! xUI.isStored()){
            if(document.getElementById('pmcui-update').disabled == true) document.getElementById('pmcui-update').disabled = false;
            xUI.pMenu('pMsave','enable');            
        }else{
            if(document.getElementById('pmcui-update').disabled == false) document.getElementById('pmcui-update').disabled = true;
            xUI.pMenu('pMsave','false');
       }
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
		}else{alert("reading-Body : "+localize(xUI.errorMsg[xUI.errorCode]) )};
break;
case "ref":	var myStream=convertXps(xUI.data_well.value);
		if(xUI.referenceXPS.readIN(myStream)){
			nas_Rmp_Init();xUI.sWitchPanel("clear");
		}else{alert("reading-Ref : "+localize(xUI.errorMsg[xUI.errorCode]) )};
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
		}else{alert("reading-Body : "+localize(xUI.errorMsg[xUI.errorCode]) )};
break;
case "ref":
		if(xUI.referenceXPS.readIN(convertXps(xUI.data_well.value))){
			nas_Rmp_Init();xUI.sWitchPanel("clear");
		}else{alert("reading-Ref : "+localize(xUI.errorMsg[xUI.errorCode]) )};
break;
}
		document.getElementById("loadShortcut").value="false";
	}
      }, true);
      // ファイルの内容をテキストとして取得（3）
      reader.readAsText(input, myEncode);
}else{
//FileReaderが無いブラウザ(Safari等)では、お詫びしてオシマイ
var msg = "no FileReader! :\n　このブラウザはFileReaderオブジェクトをサポートしていません。\n残念ですが、この環境ではローカルファイルは読みだし出来ません。\nThis browser does not support the FileReader object. \n Unfortunately, you can't read local files now.";
	alert(msg);
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
//	フラグの無いものは"false"をエントリして配列の要素数を合わせる。
/*	[0] WindowSize
	if (useCookie.WinSize){
		sheetAllWidth	=getINNERWIDTH(window.parent);
		sheetAllHeight	=getINNERHEIGHT(window.parent);

		sheetHeadHeight	=getINNERHEIGHT(window.parent.headline);
		sheetInfoWidth	=getINNERWIDTH(window.parent.info);
	winSizes=[sheetAllWidth,sheetAllHeight,sheetHeadHeight,sheetInfoWidth];
	}else{}
*/
	winSizes=[false,false,false,false];
	
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
//	[0] WindowSize
	if (useCookie.WinSize){
	if(rEmaping[0][0]) sheetAllWidth	= unescape(rEmaping[0][0]);
	if(rEmaping[0][1]) sheetAllHeight	= rEmaping[0][1];

	if(rEmaping[0][2]) sheetHeadHeight	= rEmaping[0][2];
	if(rEmaping[0][3]) sheetInfoWidth	= rEmaping[0][3];
	}

//	[1] XPSAttrib
	if (useCookie.XPSAttrib){
	if(rEmaping[1][0]) myTitle      = unescape(rEmaping[1][0]);
	if(rEmaping[1][1]) mySubTitle   = unescape(rEmaping[1][1]);
	if(rEmaping[1][2]) myOpus       = unescape(rEmaping[1][2]);
	if(rEmaping[1][3]) myFrameRate  = unescape(rEmaping[1][3]);
	if(rEmaping[1][4]) Sheet        = unescape(rEmaping[1][4]);
	if(rEmaping[1][5]) SheetLayers  = unescape(rEmaping[1][5]);
	}

//	[2] UserName
	if(useCookie.UserName){
	if(rEmaping[2]) {
						myName  = unescape(rEmaping[2]);
//						if(xUI.currentUser) xUI.currentUser = new  nas.UserInfo(myName);
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
if(dbg) console.log( ToolView)
}
//	クッキー削除
function dlCk() {
	ckName = 'rEmaping'; document.cookie = ckName + '=;expires=Thu,01-Jan-70 00:00:01 GMT';
	useCookie=false;
	alert(localize(nas.uiMsg.dmCookieRemoved));
}
function resetCk()
{
// alert(myPreferences)
	dlCk();
	writeCk(myPreferences);
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
	CGI呼び出しの際に、フォイル名の確認を行うように変更
	ただしオブションで機能を切り離し可能に


 */
function callEcho()
{
var msg = localize(nas.uiMsg.confirmCallecho);
var title = localize(nas.uiMsg.saveToDonloadfolder);
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
	}
})
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

	this.userName="";
//ユーザ名変更　プリファレンスパネルは大幅に変更があるのでこのメッセージの翻訳は保留　:nas.uiMsg.
this.chgMyName=function(newName)
{
	if(! newName){
		var msg = localize(nas.uiMsg.dmAskUserinfo)+
		        "\n\n ハンドル:メールアドレス / handle:uid@example.com ";
		nas.showModalDialog("prompt",msg,localize(nas.uiMsg.userInfo),myName,function(){
		    if(this.status==0){
if(dbg) console.log(this.value)
		        newName = this.value;
		        myName = newName;
		        xUI.currentUser = new nas.UserInfo(this.value);//objectc
		        XPS.update_user = xUI.currentUser;//object参照
		        sync("update_user");
		        sync("current_user");
		    }
		});
		if(newName==null){newName=xUI.currentUser.toString()}
	}
	this.userName=newName;
		document.getElementById("myName").innerHTML=
'<a href="javascript:return false" title="名前を変更する。">'+
this.userName+'</a>';
		if(! this.changed){this.changed=true;};
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
	if(xUI.viewMode != myValue){
		document.getElementById("vM"+myValue).checked=true;
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
	getElementById("prefSheetLength").value=nas["SheetLength"];
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
}
		if(this.changed){this.changed=false;};
}

//
//各種設定をドキュメントに反映
this.putProp=function ()
{
//名前変更
	var newName=this.userName;
	if(newName != myName)
	{
		myName=newName;
        xUI.currentUser = new nas.UserInfo(myName)
		XPS.update_user = xUI.currentUser;
		sync("update_user");
	}

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
		Bkup=[xUI.Select,xUI.Selection];
	xUI.SheetLength=document.getElementById("prefSheetLength").value;
		xUI.PageLength	=xUI.SheetLength　*　XPS.framerate;
	xUI.PageCols= cols;
//実行。
		nas_Rmp_Init();
//フォーカス復帰
		xUI.Select =Bkup[0];
		xUI.Selection =Bkup[1];
			xUI.selectCell();
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
//
	this.layers=0;//ローカルのレイヤ数バッファ・スタートアップ内で初期化
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
}
this.chgopt =function (){return;}
this.chglbl =function (name,number){
	var newLabels=new Array
	for(var i=0;i<this.layers;i++){
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
		if(this.layers!=document.getElementById("scnLayers").value){
			this.layerTableUpdate();
		}else{
			this.layerTableNameUpdate();
		}
		this.changed=true;
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
		if(document.getElementById("scnLayers").value>=26)
		{
var msg=localize(nas.uiMsg.dmAlertMenytracks);//レイヤ数多すぎの警告
if(! confirm(msg)){
		document.getElementById("scnLayers").value=this.layers;//リセット
			return;
}
		}
//値を整数化しておく
		document.getElementById("scnLayers").value=Math.round(document.getElementById("scnLayers").value);

		document.getElementById("scnLayersLbls").value=this.mkNewLabels(document.getElementById("scnLayers").value).join();

		if(this.layers!=document.getElementById("scnLayers").value){
			this.layerTableUpdate();
		}else{
			this.layerTableNameUpdate();
		}
		this.changed=true;
		return;
	}

/*
	//layers=//現在のテーブル上のレイヤ数
	var chgLys=
	(document.getElementById("scnLayers").value!=this.layers)?
	true	:	false	;//変更か?
//確認
	if (chgLys){
		if(confirm("レイヤテーブルを再描画します。\nシートを 更新/作成 するまでは、実際のデータの変更は行われません。\n\t再描画しますか？"))
		{
//			レイヤ数変わってテーブル変更なのでテーブル出力
			this.layerTableUpdate();
		}else{
			document.getElementById("scnLayers").value=this.layers;//レイヤ数復帰
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
}
//新規作成のスイッチトグル
this.chgNewSheet =function (){
	var dist=(! document.getElementById("scnNewSheet").checked)? true:false;
	this.changed=true;

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
}
//テキストボックス書き換え
this.rewrite =function (id)
{
if(dbg){dbgPut(id);}
	this.changed=true;
	return false;//フォーム送信抑止
}
//
this.mkNewLabels=function(lot){
//値の数だけラベルを作って表示
	var myLabels=new Array();
	for(var Lidx=0;Lidx<lot;Lidx++)
	{
		if((! document.getElementById("scnNewSheet").checked)&&(Lidx<XPS.xpsTracks.length-2)){
			myLabels.push(XPS.xpsTracks[Lidx+1].id);
		}else{
			if(Lidx<26){
				myLabels.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Lidx));
			}else{
					myLabels.push("");
			}
		}
	}
return myLabels;
}
//
this.mkLayerSheet =function (lot){
//	レイヤブラウザを作る
//	引数はレイヤの数
var body_='<table cellspacing=0 cellpadding=0 border=0 >';//

//タイトルつける
body_+='<tr><th colspan='+(lot+1)+'>詳細指定</th></tr>';//
//インデックスを配置
			body_+='<tr><th>ID:</th>';//
for (i=0;i<lot;i++){	body_+='<td>'+(i+1).toString()+'</td>'}
			body_+='</tr>';//

/*
var labelOptions=[
	"option","link","label","lot","blmtd","blpos",
	"size","sizeX","sizeY","aspect"
];
*/
var labelOptions=[
	"種別","リンク","親","ラベル","セル枚数","カラセル","配置",
	"プリセット","sizeX","sizeY","aspect"
];
var Labels=["Lopt_","Llnk_","Lpnt_","Llbl_","Llot_","Lbmd_","Lbps_","LszT_","LszX_","LszY_","LszA_"
];
	for (var opt=0;opt<labelOptions.length;opt++)
	{
if(dbg){dbgPut("check labelOptions : "+ opt)}
		body_+='<tr><th nowrap> '+labelOptions[opt]+' </th>';//
		for (i=0;i<lot;i++)
		{
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
	body_+=i.toString();


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
body_+='<OPTION VALUE=timing selected>timing';//
body_+='<OPTION VALUE=dialog >dialog';//
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
		for(var i=0;i<this.layers;i++){
			document.getElementById("scnLlbl_"+i).value=myNames[i];
		}

}
this.layerTableUpdate =function(){
		document.getElementById("scnLayerBrouser").innerHTML=
		this.mkLayerSheet(document.getElementById("scnLayers").value);
		this.getLayerProp();
		this.layers=1*document.getElementById("scnLayers").value;
//		this.layerTableNameUpdate();
}

//各種設定表示初期化
this.getProp =function ()
{
// document.getElementById("scnNewSheet").checked=false;//新規フラグダウン
//ドキュメントパネルから新規ドキュメントフラグを削除　削除に伴う変更まだ

//レイヤ数取得
	if (this.layers != (XPS.xpsTracks.length-2)){
		this.layers=1*XPS.xpsTracks.length-2;//バックアップとる
		document.getElementById("scnLayers").value=	this.layers;
//ラベルウェルを書き換え
		document.getElementById("scnLayersLbls").value=this.mkNewLabels(this.layers).join();
//レイヤ数変わってテーブル変更なのでテーブル出力
		document.getElementById("scnLayerBrouser").innerHTML=
		this.mkLayerSheet(document.getElementById("scnLayers").value);

	}else{
		document.getElementById("scnLayers").value=this.layers;
	}

//変換不要パラメータ
	var names=[
"mapfile","title","subtitle","opus","scene","cut","framerate",
"create_time","create_user","update_time","update_user"
];
//
	var ids=[
"scnMapfile","scnTitle","scnSubtitle","scnOpus","scnScene","scnCut","scnFramerate",
"scnCreate_time","scnCreate_user","scnUpdate_time","scnUpdate_user"
];
//
	for (var i=0;i<names.length;i++){
		document.getElementById(ids[i]).value=
		XPS[names[i]];
	}
//シートメモ転記
		document.getElementById('scnMemo').value=xUI.XPS.xpsTracks.noteText;
        
	var names=["create_time","create_user","update_time"];
	var ids=["scnCreate_time","scnCreate_user","scnUpdate_time"];
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
}
this.getLayerProp =function (){
//レイヤ情報テーブルに値をセット
	var myLabels=document.getElementById("scnLayersLbls").value.split(",");

	if (this.layers>XPS.xpsTracks.length-2){this.layers=XPS.tracks.length-2}
	for (i=0;i<document.getElementById("scnLayers").value;i++)
	{
		if (i<this.layers &&! document.getElementById("scnNewSheet").checked)
		{
			document.getElementById("scnLopt_"+i).value=
			XPS["xpsTracks"][i+1]["option"];
//			document.getElementById("scnLopt_"+i).disabled=true;

			document.getElementById("scnLlnk_"+i).value=
			XPS["xpsTracks"][i+1]["link"];
//			document.getElementById("scnLlnk_"+i).disabled=true;

			document.getElementById("scnLpnt_"+i).value=
			XPS["xpsTracks"][i+1]["parent"];
//			document.getElementById("scnLpnt_"+i).disabled=true;

			document.getElementById("scnLlbl_"+i).value=
			XPS["xpsTracks"][i+1]["id"];

			document.getElementById("scnLlot_"+i).value=
			XPS["xpsTracks"][i+1]["lot"];

			document.getElementById("scnLszX_"+i).value=
			XPS["xpsTracks"][i+1]["sizeX"];
			document.getElementById("scnLszY_"+i).value=
			XPS["xpsTracks"][i+1]["sizeY"];
			document.getElementById("scnLszA_"+i).value=
			XPS["xpsTracks"][i+1]["aspect"];

			document.getElementById("scnLbmd_"+i).value=
			XPS["xpsTracks"][i+1]["blmtd"];
			document.getElementById("scnLbps_"+i).value=
			XPS["xpsTracks"][i+1]["blpos"];

		}else{

			document.getElementById("scnLopt_"+i).value=
			"timing";
//			document.getElementById("scnLopt_"+i).disabled=true;

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
this.newProp =function ()
{
	var msg=localize(nas.uiMsg.dmComfirmNewxSheetprop);
if (confirm(msg)){
	document.getElementById("scnNewSheet").checked=true;//新規チェック入れる

//レイヤ数デフォルトに設定
		document.getElementById("scnLayers").value=SheetLayers;
//レイヤ名表示更新
		document.getElementById("scnLayersLbls").value=this.mkNewLabels(SheetLayers).join();
		this.layers=XPS.xpsTracks.length-2;
//レイヤテーブル出力
		document.getElementById("scnLayerBrouser").innerHTML=
		this.mkLayerSheet(document.getElementById("scnLayers").value);
//デフォルトパラメータを設定
Now =new Date();
	document.getElementById("scnMapfile").value="";
	document.getElementById("scnTitle").value=myTitle;
	document.getElementById("scnSubtitle").value=mySubTitle;
	document.getElementById("scnOpus").value=myOpus;
	document.getElementById("scnScene").value=myScene;
	document.getElementById("scnCut").value=myCut;
	document.getElementById("scnFramerate").value=myFrameRate;

	document.getElementById("scnCreate_time").value=Now.toNASString();
	document.getElementById("scnCreate_user").value=xUI.currentUser;//myName;
	document.getElementById("scnUpdate_user").value=xUI.currentUser;//myName;
	document.getElementById("scnUpdate_time").value="";

	document.getElementById("scnMemo").value="";
//	document.getElementById("scn").value=;
//	document.getElementById("").value=;
//	document.getElementById("").value=;
	var names=["scnCreate_time","scnCreate_user","scnUpdate_time"];
	for (var i=0;i<names.length;i++){
		name=names[i];
		document.getElementById(name+"TD").innerHTML=
		(document.getElementById(name).value=="")?"<br>":
		xUI.trTd(document.getElementById(name).value);
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

}else{
	return;
}
}
//各種設定表示更新
this.putProp =function ()
{
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
	var newWidth=this.layers+2;//新幅
	var oldWidth=XPS.xpsTracks.length;//もとの長さを控える
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
	{ var changeSheet=true }else{ var changeSheet=false }
//	実際のデータ更新
//シートメモ転記
		XPS.xpsTracks.noteText = document.getElementById("scnMemo").value;
//値の変換不要なパラメータをまとめて更新
	var names=[
"mapfile","title","subtitle","opus","scene","cut","update_user"
	];//
	var ids=[
"scnMapfile","scnTitle","scnSubtitle","scnOpus","scnScene","scnCut","scnUpdate_user"
	];//
	for (var i=0;i<names.length;i++){
		XPS[names[i]]=document.getElementById(ids[i]).value;
	}

// //////新規作成なら現在のシート内容をフラッシュ
		if (document.getElementById("scnNewSheet").checked){xUI.flush();}
// /////////
//レイヤ数を設定
	this.layers=1*document.getElementById("scnLayers").value;
if(dbg){
dbgPut("元タイムシートは : "+oldWidth+" 列/ "+oldduration+"コマ\n 新タイムシートは : "+newWidth+" 列/ "+duration+"コマ です。\n ");
}
//継続時間とレイヤ数で配列を更新
	xUI.reInitBody(newWidth,duration);

//		プロパティの更新
		XPS["trin"]=
[nas.FCT2Frm(document.getElementById("scnTrinT").value),
document.getElementById("scnTrin").value
];
		XPS["trout"]=
[nas.FCT2Frm(document.getElementById("scnTrotT").value),
document.getElementById("scnTrot").value
];

//本体シートのフレームレート更新
	XPS.framerate=nas.FRATE;
	XPS.rate=nas.RATE;
//	親ウインドウのnas.FRATEも更新(同期)
	nas.FRATE=nas.FRATE;
	nas.RATE=nas.RATE;
//書き直しに必要なUIのプロパティを再設定

	xUI.PageLength=
	xUI.SheetLength*Math.ceil(XPS.framerate);//1ページのコマ数

//undo関連
//	xUI.flushUndoBuf();
//	sync("undo");sync("redo");

//	レイヤプロパティ更新
	this.putLayerProp();

//	尺または、レイヤ数の変更があるか、新規作成ならばシートを初期化

	if (changeSheet){
	xUI.sWitchPanel("Prog");

//カーソル位置初期化
	xUI.selectCell("1_0");

		nas_Rmp_Init();
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
		this.close();
	}else{
	    alert(localize(nas.uiMsg.aborted));
	}
}
//更新操作終了
this.putLayerProp =function ()
{
//テーブルから読み出した値をXPSにセット
	var oldlayers=XPS.xpsTracks.length-2;//もとの長さを控える

	var widthUp=(oldlayers<this.layers)?true:false;
	for (i=0;i<this.layers;i++)
	{
		if (i>=oldlayers){
			XPS.xpsTracks.insertTrack(new XpsTimelineTrack(
				"ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(i),
				"timing",
				XPS.xpsTracks,
				XPS.xpsTracks.duration,
				i+1
			));
			XPS["xpsTracks"][i+1]["lot"]= "=AUTO=";
			XPS["xpsTracks"][i+1]["sizeX"]= xUI.dfX;
			XPS["xpsTracks"][i+1]["sizeY"]= xUI.dfY;
			XPS["xpsTracks"][i+1]["aspect"]= xUI.dfA;
			XPS["xpsTracks"][i+1]["blmtd"]= xUI.blmtd;
			XPS["xpsTracks"][i+1]["blpos"]= xUI.blpos;
		}else{
			XPS["xpsTracks"][i+1]["option"]= document.getElementById("scnLopt_"+i).value;
			XPS["xpsTracks"][i+1]["link"]= document.getElementById("scnLlnk_"+i).value;
			XPS["xpsTracks"][i+1]["id"]= document.getElementById("scnLlbl_"+i).value;
			XPS["xpsTracks"][i+1]["lot"]= document.getElementById("scnLlot_"+i).value;
			XPS["xpsTracks"][i+1]["sizeX"]= document.getElementById("scnLszX_"+i).value;
			XPS["xpsTracks"][i+1]["sizeY"]= document.getElementById("scnLszY_"+i).value;
			XPS["xpsTracks"][i+1]["aspect"]= document.getElementById("scnLszA_"+i).value;
			XPS["xpsTracks"][i+1]["blmtd"]= document.getElementById("scnLbmd_"+i).value;
			XPS["xpsTracks"][i+1]["blpos"]= document.getElementById("scnLbps_"+i).value;
		}
	}
	XPS.xpsTracks.renumber();
}
//プロシジャ部分抜きだし
//パネル初期化
this.init =function ()
{
	this.Lists = PropLists;//現状だとオブジェクト参照
	this.getProp();
	this.chgFRATE();
	this.changed=false;
}
/** パネルを開く
 *すでに開いていたら NOP リターン
 */
this.open=function(){
		if(document.getElementById("optionPanelScn").style.display=="inline"){
			return false;
		}else{
			xUI.sWitchPanel("Scn");
			this.init();
		}
	return null;
}
//パネルを閉じる

this.close=function (){
	//変更フラグ立っていれば確認して操作反映
	if(this.changed){if(confirm(localize(nas.uiMsg.dmPrefConfirmSave))){this.putProp();}};//設定変更確認
	//パネル閉じる
		xUI.sWitchPanel("Scn")
}

};
//ScenePrefオブジェクト終了

// debaug デバグ用ルーチン		------ dbg.js

/*	デバグ汎用
		デバッグ対象ルーチン側でロードすること

 */

if (dbg){
	var dbg_info=new Array();
if(typeof console == 'undefined'){
    if(air.Introspector){
        console=air.Introspector.Console;
    }else{
        console = {};
if(dbg) console.log=function(aRg){ 
        //dbg_action(aRg)
            document.getElementById('msg_well').value += (aRg+"\n");
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
}

 