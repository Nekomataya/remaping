/**
 * $fileOverview
 *  <pre>Remaping本体スクリプト
 *     XPSオブジェクトとMAPオブジェクトについては、
 *     以下のドキュメントを参照のこと
 *     http://www.nekomataya.info/remaping/teck.html
 *     $Id: remaping.js,v 1.66 2014/11/29 kiyo Exp $
 * CEP動作のための修正開始 </pre>
 */
// http://d.hatena.ne.jp/amachang/20071010/1192012056 //
/*@cc_on _d=document;eval('var document=_d')@*/
//  JQ isVisible mathod
$.fn.isVisible = function() {
    return $.expr.filters.visible(this[0]);
};
//定数仮置 xpsTrack.option <> Css CalssName xpsio.jsとremaping.js二重登録なので解決が必要
                var trackHeaderClass = {
                    "action"     :"referenceSpan",
                    "tracknote"  :"tracknoteSpan",
                    "dialog"     :"dialogSpan",
                    "sound"      :"soundSpan",
                    "still"      :"stillSpan",
                    "effect"     :"sfxSpan",
                    "composite"  :"sfxSpan",
                    "sfx"        :"sfxSpan",
                    "stage"      :"geometrySpan",
                    "stagework"  :"geometrySpan",
                    "geometry"   :"geometrySpan",
                    "camerawork" :"cameraSpan",
                    "camera"     :"cameraSpan",
                    "cell"       :"timingSpan",
                    "replacement":"timingSpan",
                    "timing"     :"timingSpan",
                    "reference"  :"referenceSpan",
                    "action"     :"referenceSpan",
                    "comment"    :"framenoteSpan"
                };
//xpsTrack option <> label Css ClassName  xpsio.jsとremaping.js二重登録なので解決が必要
    			var trackLabelClass = {
                    "timecode"   :"tclabel",
                    "tracknote"  :"tracknotelable",
                    "dialog"     :"dialoglabel",
                    "sound"      :"soundlabel",
                    "still"      :"stilllabel",
                    "effect"     :"sfxlabel",
                    "composite"  :"sfxSpan",
                    "sfx"        :"sfxSpan",
                    "stage"      :"geometryArea",
                    "stagework"  :"geometryArea",
                    "geometry"   :"geometryArea",
                    "camerawork" :"camArea",
                    "camera"     :"camArea",
                    "cell"       :"editArea",
                    "replacement":"editArea",
                    "timing"     :"editArea",
                    "reference"  :"rnArea",
                    "action"     :"rnArea",
                    "comment"    :"framenoteSpan"
    			};
//----------------------------------- UIコントロールオブジェクトを作成、初期化
function new_xUI(){
/**  @class
 *<pre>     UIコントロールオブジェクト
 *  エディタ・アプリケーション本体のクラスオブジェク
 *</pre>
 */
    var xUI = {};
/*
 * xUI のエラーメッセージは旧Xpsオブジェクトから移転されたもの
 * XpsオブジェクトにUIエラーハンドリングは不用
 */
/*
    xUI.errorCode    = 0;
    xUI.errorMsg     = [
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
// */
//------- UIオブジェクト初期化前の未定義参照エラーを回避するためのダミーメソッド
    xUI.flipContextMenu=function(evt){return true;};
    xUI.Mouse=function(evt){return true;};
    xUI.Touch=function(evt){return true;};
//	初期化前にバックアップデータの処理が発生するので暫定的に初期化しておく
    xUI.backupStore    ="0123456789";    //作業バックアップ

//------------------------ 以下インターフェースカラープロパティ
//カラー・トラック幅等のルック決定要素はundefinedで初期化して  遅延解決に移行する
//Xmap
    xUI.baseColor             ; //背景色

//Xpst タイムシートルック
    xUI.sheetbaseColor        ; //タイムシート背景色 ***
    xUI.sheetblankColor       ; //編集不可領域の背景色
    xUI.footstampColor        ; //フットスタンプの色
    xUI.inputModeColor = {}   ; //入力モード色
    xUI.inputModeColor.NORMAL ; //ノーマル
    xUI.inputModeColor.EXTEND ; //ラピッド編集色
    xUI.inputModeColor.FLOAT  ; //範囲編集色
    xUI.inputModeColor.SECTION; //区間編集色
         
    xUI.selectedColor         ; //選択セル色
    xUI.selectionColor        ; //選択領域色
    xUI.editingColor          ; //セル編集中のインジケータ
    xUI.selectingColor        ; //セル選択中のインジケータ

//テキストカラー
    xUI.sheetTextColor        ;//本文標準色

    xUI.annnotationColor        ;//本文注釈色
    xUI.linkColor        ;//リンク色
    xUI.hoverColor       ;//リンクホーバー色
    xUI.activeColor      ;//リンクアクティブ色

//メニュー関連
    xUI.toolView         ;//ツールパネル表示状態(cookieの値)
    xUI.closeWindowAtCheckout = true;//
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
 *    xUI.importBox
 *    複数データ対応ドキュメントインポーター
 */
    xUI.importBox={};//インポート情報トレーラー初期化
    xUI.importBox.overwriteProps    ={};
    xUI.importBox.importTarget  = false;
    xUI.importBox.maxSize  = 1000000;
    xUI.importBox.maxCount = 10;
    xUI.importBox.allowExtensions    = new RegExp("\.(txt|csv|xps|xpst|ard|ardj|tsh|xdts|tdts|sts)$",'i');
    xUI.importBox.allowImgExtensions = nas.Image.allowImgExtensions;

/**
 *  @function
 *    importBox リセット
 *   インポート操作の直前でリセットを行うこと
 */
xUI.importBox.reset = function(){
    this.targetContents    =[];
    this.selectedContents  =[];
    this.importTarget  = false;
//    if((document.getElementById('loadTarget').value=='ref')){}
    if((document.getElementById('loadTarget'))&&(document.getElementById('loadTarget').value=='ref')){
        this.importTarget=xUI.referenceXPS;
    } else {
        this.importTarget=xUI.XPS;
    }
    this.importCount= 0;
    this.callback = undefined;
//console.log('importBox reset')
}
    xUI.importBox.reset();
/**
    Xpst画像をデータから設定
    ファイルの画像を取得して既存のドキュメント画像を更新する
    画像形式確認は事前に済
    引数アイテムは
    	１．編集可能ドキュメントのみ操作可能
		    WEB系フォーマット限定（暫定
		２．フォーカスに対応する画像がある場合のみ登録（複数画像操作保留）
		３．従来モードの場合はリファレンス画像の登録？
	ケース分け操作・既存オブジェクトの画像を更新する｜新規オブジェクトを生成
	Referenceとして読むかマスターとするかは、状況次第では問題にならない
	画像タイムシートを操作可能なのは ページモードのみ
	画像登録時は、全てxUI.putへ送るものとする
	１操作につき複数画像アイテムが含まれていてもｘUI.put１回分で
*/
xUI.importBox.setImage = function(files){
console.log(files);
//Xpst専用・新規ドキュメントかドキュメント画像の入れ替えかを判定(汎用でない)
    if(xUI.viewMode == 'Compact') return false;
    var newData = new Xps(xUI.XPS.sheetLooks);
    newData.parseXps(xUI.XPS.toString(false));
    var changeCount = 0;
	files.forEach(function(e){
console.log('set image :'+e.name);
console.log(e);
		if(
			(((xUI.uiMode == 'production')&&(xUI.sessionRetrace == 0))||
			(xUI.uiMode == 'floating'))&&
			(e.name.match(xUI.importBox.allowImgExtensions))
		){
console.log('allowImgExtensions type match');
//画像登録操作可能
			var targetImage  = null;//更新対象画像を設定
			var targetPageId = Math.floor(xUI.Select[1] / xUI.PageLength);//配列IDで参照

			if(xUI.XPS.timesheetImages.members.length > targetPageId){
//既存画像の更新確定
				targetImage = newData.timesheetImages.members[targetPageId];
				targetImage.setImage(e);
				changeCount ++ ;
			}else{
//オブジェクト追加確定
				var idf = e.name;
//ファイル名にtype文字列を含む場合は埋められたタイプキーを削除
	if(idf.match(/(dope|xst|xps|xpst|xdts|tdts|sheet|st|ts)/i)) idf = idf.replace(/[_\-\s]?(dope|xst|xps|xpst|xdts|tdts|sheet|st|ts)[_\-\s]?[0-9]*/i,"");
console.log(idf);
				var itmInf = nas.Pm.parseIdentifier(nas.Pm.normalizeIdf(idf));
console.log('append New pageImage');
console.log(itmInf);
console.log(nas.Pm.normalizeIdf(e.name));
console.log(nas.Pm.stringifyIdf([
				itmInf.title,
				itmInf.opus,,
				itmInf.scene,
				itmInf.cut
			]));
console.log(e,'page:'+(targetPageId+1),newData.timesheetImages);
				newData.timesheetImages.addMember(new nas.NoteImage(e,'page:'+(targetPageId+1),"297mm,420mm",newData.timesheetImages));
				changeCount ++ ;
console.log(targetPageId,xUI.activeDocument.undoBuffer.undoPt);
				if((targetPageId == 0)&&(xUI.activeDocument.undoBuffer.undoPt == 0)){
//読み込みページが冒頭ページで、かつ入力履歴のない場合のみInfの情報を反映
console.log('syncIdentifier : '+e.name);
					newData.syncIdentifier(nas.Pm.stringifyIdf([
						itmInf.title,
						itmInf.opus,,
						itmInf.scene,
						itmInf.cut
					]));
				};
//				xUI.resetSheet();//画像ドキュメントを追加したので画面更新
			};
console.log(changeCount)
			if(changeCount > 0){
console.log(newData.toString(false));
				xUI.put(newData);
				if(xUI.XPS.timesheetImages.imageAppearance == 0)
				xUI.setAppearance(1,true);
			};
		}else{
console.log('unmatch nop');
		    console.log(e);
		};
	});
}
/**
 *  @function
 *   変換ターゲットとなるFileオブジェクト配列を引数にして呼び出す
 *   全カット変換終了時のコールバック関数を与えることが可能
 *  @params {Array of File} targetFiles
 *  @params {Function} callback
 */
xUI.importBox.read = function (targetFiles,callback){
    if(appHost.platform == "AIR"){
//***AIR  用の分岐は  単ファイルのままで保留2018 0201
    // File APIを利用できるかをチェック
        if (window.File) {
      // 指定されたファイルを取得
            var input = targetFiles[0];
	        fileBox.currentFile=new air.File(input.name);
	        xUI.data_well.value =fileBox.readContent();
        }else{
            return false;
        }
    }else{
    // File APIを利用できるかをチェック
  if(window.File){
    if(window.FileReader){
        xUI.importBox.reset();//ここで再初期化する
        xUI.importBox.callback=callback;
//処理に先行して拡張子とファイルサイズでフィルタして作業リストを作成する
//作業リストの進行度合いをチェックして終了判定をかける
        var targetQueue = [];
        var imageQueue  = [];
  for(var ix=0;ix<targetFiles.length;ix++){
    var check = targetFiles[ix];
//拡張子でふるい分け
    if(
        (check.name.match(this.allowExtensions)) && 
        (check.size <= this.maxSize) && 
        (ix < this.maxCount)
    ){
        targetQueue.push(check); this.importCount ++;
    }else if(check.name.match(xUI.importBox.allowImgExtensions)){
        imageQueue.push(check);
    }else{
        console.log("skip file "+check.name );
    };
  };
  if(imageQueue.length){
//画像インポート
console.log(imageQueue);
    xUI.importBox.setImage(imageQueue);
  }else if(targetQueue.length){
//タイムシートドキュメントインポート
console.log(targetQueue);
// 指定されたファイルを取得してインポーターのプロパティとして記録
    for(var ix=0;ix<targetQueue.length;ix++){
        var input = targetQueue[ix];
//最初のファイルをターゲットに読込
        if(this.importTarget){
	        var myEncode=(input.name.match(/\.(ard|csv|tsh|sts)$/))?"Shift-JIS":"UTF-8";
// ファイルリーダーオブジェクト初期化(Chrome/Firefoxのみ)
            var reader = new FileReader();
            reader.name=input.name;
// ファイルの読み込みに成功したら、その内容をxUI.data_wellに反映
            reader.addEventListener('load', function(e) {
                var output = reader.result;//
                xUI.data_well.value = reader.result;//最後に読み込んだ内容で上書きされるので注意
//エリアターゲット 
                var areaTarget = (document.getElementById('loadTarget').value == 'ref')? 0:undefined;
                var myXps = xUI.convertXps(
                    reader.result,
                    nas.File.divideExtension(reader.name)[1],
                    xUI.importBox.overwriteProps,
                    false,
                    areaTarget
                );// 指定オプション無しで一旦変換する
                if(!myXps){
                    alert(reader.name+' is not supported format');
                };
                if((xUI.uiMode == 'production')&&(xUI.importBox.importTarget===xUI.XPS)){
                    if( (xUI.XPS.xpsTracks.duration != myXps.xpsTracks.duration)||
                        (xUI.XPS.xpsTracks.length != myXps.xpsTracks.length)
                    ) xUI.reInitBody(myXps.xpsTracks.length,myXps.xpsTracks.duration);
                    xUI.selection();xUI.selectCell([0,0]);
                    xUI.put(myXps.getRange());
                }else{
                    if((xUI.uiMode != 'floating')&&(xUI.importBox.importTarget===xUI.XPS)){
                        xUI.resetSheet(myXps,undefined,importBox.callback);
                        xUI.setUImode('floating');
                    }else{
                        xUI.importBox.importTarget.parseXps(myXps.toString(false));
                        xUI.resetSheet(undefined,undefined,importBox.callback);
                    };
                };
            }, true);
            if(input.name.match(/\.sts$/)){
// ファイルの内容をarrayBufferとして取得(sts)
                reader.readAsArrayBuffer(input);
            }else{
// ファイルの内容をテキストとして取得
                reader.readAsText(input, myEncode);
            };
            break;
        };
//非同期で実行
(function(){
	var myEncode=(input.name.match(/\.(ard|csv|tsh|sts)$/))?"Shift-JIS":"UTF-8";
      // ファイルリーダーオブジェクト初期化(Chrome/Firefoxのみ)
      var reader = new FileReader();
      reader.name=input.name;
      // ファイルの読み込みに成功したら、その内容をxUI.data_wellに反映
      reader.addEventListener('load', function(e) {
        var output = reader.result;//
        xUI.data_well.value = reader.result;//最後に読み込んだ内容で上書きされるので注意  20180220
//エリアターゲット 
        var areaTarget = (document.getElementById('loadTarget').value == 'ref')? 0:undefined;
        var myXps = xUI.convertXps(
            reader.result,
            nas.File.divideExtension(reader.name)[1],
            xUI.importBox.overwriteProps,
            false,
            areaTarget
        );// 指定オプション無しで一旦変換する
        if(!myXps){
            alert(reader.name+' is not supported format');
        };
        xUI.importBox.targetContents.push({
            "name":reader.name,
            "content":reader.result,
            "xps":myXps,
            "checked":true
        });
        if ( xUI.importBox.importCount == xUI.importBox.targetContents.length ){
            console.log(xUI.importBox.targetContents)
            var firstFile=Xps.parseIdentifier(nas.File.divideExtension(xUI.importBox.targetContents[0].name)[1]);
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
        if(input.name.match(/\.sts$/)){
// ファイルの内容をarrayBufferとして取得(sts)
            reader.readAsArrayBuffer(input);
        }else{
// ファイルの内容をテキストとして取得
            reader.readAsText(input, myEncode);
        }
})();//キューの各エントリを処理
    };//loop
  };
      }else{
//FileReaderが無いブラウザ(Safari等)では、お詫びしてオシマイ
var msg = "no FileReader! :\n  このブラウザはFileReaderオブジェクトをサポートしていません。\nこの環境ではローカルファイルは読みだし出来ません。\nThis browser does not support the FileReader object. \n you can't read local files now.";
	alert(msg);
      };//if(window.FileReader)
    };//if(window.File)
  };//if(appHost.platform == "AIR")
};//
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
        modefiedXps.setDuration(
            nas.FCT2Frm(
                document.getElementById('optionPanelSCI_'+nas.Zf(tix+1,2)+'_time').value)+
                Math.ceil(modefiedXps.headMargin+modefiedXps.tailMargin)
            );
//  変更されたXpsのステータスをFloatingに変更（暫定処理）
//        modefiedXps.currentStatus.content    = 'Floating';
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
        $('.timeInputButtons').css('display','none')
    }else{
        $('.timeInputButtons').css('display','inline')
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
 /*
    xUI.convertXps(datastream,optionString,overiteProps,streamOption,targetOption)
引数:
    @params {Staring}    datestream
        コンバート対象のデータ 
        String | ArrayBuffer
        バイナリデータの場合は1bite/8bit単位の数値配列として扱う（ArrayBuffer）
    @params {String}    optionString
        コンバート対象のデータがXPSのプロパティ全てを持たない場合があるので
        最低限のプロパティ不足を補うための指定文字列
        URIencodedIdentifier または TextIdentifierを指定
        通常はこのデータがファイル名の形式で与えられるのでファイル名をセットする
        空白がセットされた場合は、カット番号その他が空白となる
    @params {Object}    overwriteProps
        コンバータ側で上書きするプロパティをプロパティトレーラーオブジェクトで与える
        インポーター側へ移設予定
    @params {boolean}    streamOption
        ストリームスイッチフラグがあればストリームで返す（旧コンバータ互換のため）
    @params {String}    targetOption
        コンバート対象になるデータに複数のタイムシートが含まれている場合にその対象データを指定するオプション
        引数が与えらえない場合は、最後にヒットしたタイムシートを戻す（ステージ指定用）

    複数データ用コンバート関数
    内部でparseXpsメソッドを呼んでリザルトを返す
    以下形式のオブジェクトで  overwriteProps を与えると固定プロパティの指定が可能
    {
        "title":"タイトル文字列",
        "epispde":"エピソード文字列",
        "description":" エピソードサブタイトル文字列",
        "cut":"カット番号文字列",
        "time":"カット尺文字列  フレーム数またはTC"
    }
    いずれのプロパテイも省略可能
    指定されたプロパティは、その値でダイアログを上書きして編集が固定される
    全て指定した場合は、ユーザの編集ができなくなるので注意
    単独ファイルの場合は、固定に問題は無いが
    複数ファイル処理の場合に問題が発生する
    
    固定プロパティ強制のケースでは複数のドキュメントに同一のカット番号をもたせることはできないので
    カット番号のロックは行われない
    不正データ等の入力でコンバートに失敗した場合はfalseを戻す
    旧来の戻り値と同じ形式が必要な場合は  xUI.convertXps(datastream,"",{},true) と指定する事
戻値:  Object Xps or XpsStream or false
    
*/
xUI.convertXps=function(datastream,optionString,overwriteProps,streamOption,targetOption){
console.log([datastream,optionString,overwriteProps,streamOption,targetOption]);
    if(! String(datastream).length ){
        return false;
    }else{
// streamOption
    if(!streamOption){streamOption=false;}
// オプションで識別子文字列を受け取る  （ファイル名を利用）
// 識別子はXps.parseIdentifierでパースして利用
    if(! optionString){optionString = ''};//'=TITLE=#=EP=[=subtitle=]//s-c=CUTNo.=';}
// optionStringが空文字列の場合は置換処理を行わない
    if(optionString.length){
//ファイル名等でsciセパレータが'__'だった場合'//'に置換
        if(optionString.indexOf('__')>=0){optionString=optionString.replace(/__/g,'//');}
// 文字列がsciセパレータ'//'を含まない場合、冒頭に'//'を補って文字列全体をカット番号にする
        if(optionString.indexOf('//') < 0 ){optionString='//' + optionString;}
        var optionTrailer=Xps.parseIdentifier(optionString);
    }else{
        var optionTrailer=false;
    }
// 上書きプロパティ指定がない場合は空オブジェクトで初期化
    if(! overwriteProps){overwriteProps={};}
// シート指定引数は、存在すればそのままコンバート関数に渡す。存在しない場合はfalse|undefinedを渡す

//データが存在したら、種別判定して、コンバート可能なデータはコンバータに送ってXPS互換ストリームに変換する
//Xpxデータが与えられた場合は素通し
//この分岐処理は、互換性維持のための分岐
//ArrayBufferを先に判定して別処理をする
      if(datastream instanceof ArrayBuffer){
            var arrB = new Uint8Array(datastream);
            console.log(arrB);
            datastream = STS2XPS(arrB);
      }else{
        switch (true) {
        case    (/^nasTIME-SHEET\ 0\.[1-9].*/).test(datastream):
//    判定ルーチン内で先にXPSをチェックしておくNOP（先抜け）
        break;
        case    (/^(exchangeDigitalTimeSheet Save Data\n)/).test(datastream):
            datastream =TDTS2XPS(datastream);
            //ToeiDigitalTimeSheet / eXchangeDigitalTimeSheet
        break;
        case    (/^(toeiDigitalTimeSheet Save Data\n)/).test(datastream):
            datastream =TDTS2XPS(datastream,targetOption);
            //ToeiDigitalTimeSheet / eXchangeDigitalTimeSheet
        break;
        case    (/^UTF\-8\,\ TVPaint\,\ \"CSV 1\.[01]\"/).test(datastream):
            datastream =TVP2XPS(datastream);
            //TVPaint csv
        break;
        case    (/^\"Frame\",/).test(datastream):
            datastream =StylosCSV2XPS(datastream,targetOption);//ボタン動作を自動判定にする 2015/09/12 引数は使用せず
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
            //AEKey のみトラック情報がないので  ダミーXpsを先に作成してそのトラックにデータをputする
            var myXps = new Xps();
            myXps.put(datastream);
            datastream = myXps.toString(false);//内部コンバートフラグ
        break;
        default :
/*
    元の判定ルーチンと同じくデータ内容での判別がほぼ不可能なので、
    拡張オプションがあってかつ他の判定をすべてすり抜けたデータを暫定的にTSXデータとみなす
 */
            if(TSXEx){
                try{datastream=TSX2XPS(datastream)}catch(err){alert(err);return false;}
            }
        };
      };
        if(! datastream){return false}
    };
  if(datastream){
    var convertedXps=new Xps();
console.log(datastream);
    convertedXps.parseXps(datastream);
console.log(convertedXps.toString(false));
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
                    var dialogValue=new nas.AnimationDialog(targetTrack[fix]);
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
console.log(convertQueue[qix][0]);//AnimationDialogueは、できているが不正データが戻る
console.log(convertQueue[qix][0].getStream(dialogDuration));//undefinedを戻す　ダイアログオブジェクト本体が不正

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
    return (streamOption)? convertedXps.toString():convertedXps;
  }else{
    return false;    
  }
}
//そのほか  コレはAE用の旧バージョン変数なので要注意
    xUI.keyMethod        = KEYMethod;    //キー変換方式
    xUI.aeVersion        = AEVersion;    //キーにつけるバージョン番号

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
    floating    常に writeable 管理情報を編集可能  ただし作業セッション外になる

        各モード内で作業条件によって readonlyの状態が発生する
        セッション溯及ステータスを実装  2017 01

    sessionRetrace
        制作管理上の作業セッションはジョブに  １：１で対応する
        整数値で作業の状態を表す データを読み取った際にセットされる
        その都度のドキュメントの保存状態から計算される値なのでデータ内での保存はされない
    -1  所属セッションなし(初期値)          全てwriteable
    0   最新セッション           編集対象      wtiteable
    1~  数値分だけ遡ったセッション 編集対象外 常にreadonly

        ステータスがFloationgモードのドキュメントをサーバ(リポジトリ)に記録することはない
        要注意  ドキュメントステータスと動作モードの混同は避けること
    >>>>>>ドキュメントモードのFloationgは廃止 2019.12
マルチドキュメント拡張    2018 09
XPSシングルドキュメントではなくxMapシングルドキュメントに変更
xMapに関連つけられる１以上複数のタイムシート（=SCi）
アプリケーション的には、Object XpsCollectionを作成してやる必要がある

従来の XPS,sessionRetrace,referenceXPS 等のSCiにアタッチされるべきバッファはコレクションに収容される
UNDOバッファもドキュメント切り替えのたびにリセットではなく、セッション内ではドキュメントごとに保持
XpsはxMapの配下にアタッチする？
ドキュメントコレクション
xUI.documents = new xUI.documentCollection()

xUI.documents[idx]= new xUI.xMapDocument(xMap);
xUI.documents[idx].Xpsts=[];
xUI.documents[idx].sessionRetarace
xUI.documents[0].referenceContent;
xUI.documents[0].yank;
xUI.documents[0].yank;

xMap,Xpst(,Xpst,Xpst,Xpst,Xpst,…） タブに対応
undo関連
sessionRetrace  セッション
referenceXPS 一時参照バッファ

*/
xUI.Document=function(targetObject,referenceObject){
        this.content          = targetObject;
        this.type             =(targetObject instanceof xMap)? "xmap":"xpst";
        this.undoBuffer       = new xUI.UndoBuffer();
        this.sessionRetrace   = -1;
        this.referenceContent =(typeof referenceObject == 'undefined')? null:referenceObject;
}
/**
    ドキュメントトレーラー配列
    内容は現在編集中のドキュメントすべて
    ID:0  は必ずxMap
    ID:1  は必ずXpst
    兼用カットがある場合は、順次IDが増す
*/
xUI.documents=[];
xUI.documents.activate=function(idx){
console.log(idx)
        xUI.activeDocumentId=idx
        xUI.activeDocument=xUI.documents[idx]
    if(idx == 0){
        xUI.XMAP=xUI.activeDocument.content;
    }else{
console.log(xUI.activeDocument);
        xUI.XPS = xUI.activeDocument.content;
        if(XPS) XPS = xUI.XPS;//同期
        xUI.XPS.readIN = xUI._readIN ;
    }
}

xUI.documents.clear=function(){
    xUI.documents.length=0;
}
/**
        Xpsクラスメソッドを上書きするためのファンクション
        データインポートを自動判定
        xUI.sessionRetrace == -1    通常の読み出し
        xUI.sessionRetrace ==  0     内容のみ入れ替え
        xUI.sessionRetrace >   0     読み込んだ後に-1にリセット
        
*/
xUI._readIN=function(datastream){
    if(! datastream.toString().length ){
        return false;
//"001:データ長が0です。読み込みに失敗したかもしれません",
    }else{
//データが存在したら、コンバータに送ってコンバート可能なデータをXPS互換ストリームに変換する
/**
        データインポートは自動判定
        xUI.sessionRetrace == -1     通常の読み出し
        xUI.sessionRetrace ==  0     内容のみ入れ替え
        xUI.sessionRetrace >   0     読み込んだ後に-1にリセット
    import判定がtrueの場合、現データの以下のプロパティを保護する
    カット尺を保護する場合は、リファレンスに読み込んで部分コピーを行う
*/
        var isImport=((xUI.sessionRetrace==0)&&(xUI.uiMode=='production'))? true:false;
        var newXps = xUI.convertXps(datastream);
if(newXps.sheetLooks){
    console.log(newXps.sheetLooks);
    alert('880: has sheetLooks');
}else{
    console.log(newXps.toString());
    alert(' no sheetLooks ');
};
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
                    var dialogValue=new nas.AnimationDialog(targetTrack[fix]);
                    dialogValue.parseContent();//
                    convertQueue.push([dialogValue,fix,0]);// [値,開始フレーム,終了フレーム(未定義)]
                    currentEnd = fix;
                }
            }
//キューにあるダイアログを一括して処理
            for(var qix=0;qix<convertQueue.length;qix++){
                var dialogOffset = (String(convertQueue[qix][0].name).length)? 2:1;
                    dialogOffset += convertQueue[qix][0].attributes.length;
//console.log(dialogOffset);
                var dialogDuration = convertQueue[qix][2]-convertQueue[qix][1]; 
                var startAddress =[tix,(convertQueue[qix][1] - dialogOffset)];
//console.log(startAddress);
                var dialogStream =(convertQueue[qix][0].getStream(dialogDuration)).join(',');
//console.log(dialogStream);
                newXps.put(startAddress,dialogStream);
            }
        }
    }
//インポートが必要な場合は、新規オブジェクトに現行のドキュメントから固定対象のプロパティを転記する
//
        if(isImport){
/*
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

  */
            var props = ["xMap","line","stage","job","currentStatus","mapfile","opus","title","subtitle","scene","cut","create_time","create_user","update_time","update_user"];
            for (var ix=0;ix<props.length;ix++){newXps[props[ix]]=xUI.XPS[props[ix]]}
        }else{
            var props = ["xMap","line","stage","job","currentStatus","mapfile","opus","title","subtitle","scene","cut","create_time","create_user","update_time","update_user"];
            if((xUI.importBox.importCount==1)&&(xUI.importBox.selectedContents.length)){
                for (var ix=0;ix<props.length;ix++){
                    if(xUI.importBox.selectedContents[0][props[ix]]) newXps[props[ix]]=xUI.importBox.selectedContents[0][props[ix]];
                }
            };
        }
        return this.parseXps(newXps.toString(false));//内部コンバート
    }
}

/** xUIの初期化メソッド
引数にdocumentオブジェクト（Xps/xMap）を渡す
    オブジェクトがxMapの場合は、アタッチされたXpsをすべてドキュメントトレーラーにセットして開始
    Xpsが未設定の場合は、Xpsの初期化を保留
    
    オブジェクトがXpsの場合は、Xpsに関連づけられたxMapを初期化してドキュメントトレーラーを設定
    xMapが存在しない場合は、新しいxMapを初期化して使用する
  
*/
xUI.init = function(targetObj,referenceObj){
console.log("Init xUI !");
console.log(targetObj);
console.log(referenceObj);
    var initializeDocument= (targetObj instanceof xUI.Document)?
    targetObj : new xUI.Document(targetObj,referenceObj);
    if(! initializeDocument.content) return false;//不正引数のため初期化失敗

xUI.contextMenu = $('#contextMenu');

    if(initializeDocument.type == "xpst"){
/*Xpst
    タイムシートオブジェクトが与えられた場合
    Xpstに関連つけられたxMapを検索して取得
    存在しない場合は新規のxMapを作成
    初期化オブジェクトをdocID:1/xMapをdocID:0としてxUIを初期化する
    リファレンスオブジェクトが存在していればそれを利用する
    リポジトリからXpstが得られなかった場合は、
    xMap上のカットに対応するXpsを新規に作成してドキュメントトレーラーに登録する
*/
        var editXpst = initializeDocument.content;
        var editxMap = editXpst.xMap;

        this.documents.clear();
        this.documents.push(new xUI.Document(editxMap));
        this.documents.push(initializeDocument);
        
    }else if((initializeDocument.type == "xMap")){
/*xMap
    xMapが与えられた場合
    ｘMapに関連つけられたXpstを検索してすべて登録する
    リポジトリからXpstが得られなかった場合は、
    xMap上のカットに対応するXpsを新規に作成してドキュメントトレーラーに登録する
*/
        var editxMap = initializeDocument.content;
        this.documents.push(initializeDocument);
      for(var six=0;six<editxMap.sci.length;six++){
        var Idf = editxMap.sci[six].toString('full');
        var myXps = serviceAgent.currentRepository.getEntry(Idf);
        if(! myXps){
            myXps = new Xps();
            myXps.syncIdentifier(Idf);
        }
        this.documents.push(new xUI.Document(myXps));
      }
        var editXpst = this.documents[1].content;

        this.documents.push(new xUI.Document(editxMap));
 
    }else{
        var editxMap = new xMap();
console.log(editxMap);
        var editXpst = XPS;//暫定的にグローバルのXPSを利用
        initializeDocument = new Document(editXpst,new Xps());
    }


/** 以下は  Xmapに対しての拡張
    xMap コントロールは分離可能に？
    acriveDocumentIdは、以下の遷移をする
    0   ドキュメントの代表となるxMap
        xMapは１番以降のドキュメントにはならない
    1~  0番ドキュメントに含まれるCSCiにアタッチされるXpst
        一個以上、複数
        ど
*/
    this.XMAP = editxMap;               //編集対象のxMap
    this.XPS  = editXpst;               //XPSを参照する編集バッファ

    this.activeDocumentId = 1;//仮設プロパティ マルチシート拡張を行った後にシートの切り替えを行うようになる

    this.tabCount=3;


    this.activeDocument     =  this.documents[this.activeDocumentId];

    this.sessionRetrace = -1;                   //管理上の作業セッション状態
    var reftarcks = xUI.XPS.sheetLooks.trackSpec.find(function(e){return((e[0]=='reference')||(e[0]=='replacement'));})[1];//
    this.referenceXPS   = new Xps(
		reftarcks,
		editXpst.duration()
	);            //参照用Xps初期値
/**
引数に参照オブジェクトが渡されていたら、優先して解決
    マルチステージ拡張実装後、直接指定された参照ステージは、初期化時のみ優先 
    参照用XPSは初期化の引数で与える（優先）
    初期化時点で参照Xpsが与えられなかった場合は、XPSに含まれる参照ステージの内容
    XPS内のステージストアにある現行ステージの前段のステージを利用する
    セットアップのタイミングはUIの初期化以降に保留される
*/
    if ((typeof referenceObj != "undefined") && (referenceObj instanceof Xps)){
        this.referenceXPS=referenceObj;
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
    this.referenceLabels = new Array();   //表示させるトラックのID配列（後ほど初期化）
    this.referenceView   = ["timing","cell","replacement"];//拡張時はoptionを加える
    this.refRegex = new RegExp(xUI.referenceView.join("|"));
/** 
    以下UI動作制御変数

    viewMode    ページ単位表示か又は全体を1ページ1カラムで表示させるかのフラグ
        Compact     (scroll mode) Xps.documentMode == 'scroll'
          WordProp  (page mode without document Image) Xps.documentMode == 'page'
          PageImage (page mode with document Image) 新設モード Xps.documentMode == 'pageImage'
    uiMode      編集/管理/閲覧モードのフラグ
        browsing
            サーバ上のデータを開いて内容をブラウズしている状態
            書込／変更は禁止
        production
            作業中  他ユーザはproductionに移行できない
        management
            管理中  カットのプロパティが変更できるが、内容は編集できない
    viewOnly    編集禁止（データのreadonlyではなくUI上の編集ブロック）
    pageDirection   ページ送り方向(ページモードでのみ有効)
        tb|topToBottom
        lr|leftToRight
    viewScale       表示サイズ比率
*/
    this.restriction    = false;           // 操作制限フラグ boolean
    this.viewMode       = ViewMode;        // 表示モード Compact|WordProp|PageImage Scroll/Page を等価に
    this.ipMode         = InputMode;       // 編集モード変数 0:フィルタなし 1:動画補完 2:原画補完
    this.uiMode         ='floating';       // ui基本動作モード production/management/browsing/floating 
    this.pageDirection  = 'tb';            // ページ送り方向 tb = topToBottom|lr = leftToRight
    this.viewScale      = 1;               // ドキュメント表示スケール配列
    this.wheelZoom      = false;           // マウスホイールによるズーム動作スイッチ

    this.viewOnly    = false;           // 編集禁止フラグ
    this.hideSource  = false;           // グラフィック置き換え時にシートテキストを隠す
    this.showGraphic = true;            // 置き換えグラフィックを非表示  ＝  テキスト表示
//if(appHost.platform=="AIR") this.showGraphic    = false;
    this.onSite   = false;           // Railsサーバ上での動作時サーバのurlが値となる
    this.currentUser = new  nas.UserInfo(myName); // 実行ユーザをmyNameから作成
    this.recentUsers = new nas.UserInfoCollection(myNames);//最近のユーザ情報
    sync("recentUsers");
/*
    recentUsers 配列の要素は、UserInfo オブジェクト
    myNamesは、アカウント文字列を要素とする配列
    ユーザインフォコレクションの構造変更で配列ベースでなく  メンバー配列を持ったオブジェクトに更新
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
    this.tcCount        = 1;    // タイムコードトラックの総数
    this.dialogCount    = 1;    // 音声トラックの総数
    this.soundCount     = 0;    // 音響トラックの総数
    this.stillCount     = 0;    // 静止画トラックの総数
    this.timingCount    = 4;    // 置換トラックの総数
    this.stageworkCount = 0;    // ステージワークトラックの総数
    this.sfxCount       = 0;    // 効果トラックの総数
    this.cameraCount    = 0;    // カメラトラックの総数
    this.noteCount      = 0;    // フレーム注釈トラック総数
//    this.dialogSpan     = 1;    // シート左で連続する音声トラック数 廃止
//    this.soundSpan      = 0;    // シート左で連続する音響トラック数 廃止
//    this.cameraSpan     = 0;    // シート右の非置き換えトラックの連続数 廃止

//    this.timingSpan     = this.XPS.xpsTracks.length-(this.cameraSpan+this.dialogSpan+1);//カメラ（非画像トラックの合計専有幅） 廃止
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
//systemCLipboardに対するイベント設定
// ------------------------------------------------------------
// カット操作が行われると実行されるイベント
// ------------------------------------------------------------
window.addEventListener("cut" , function(evt){
    if(evt.target===document.getElementById("iNputbOx")){
	    evt.preventDefault();	// デフォルトのカット処理をキャンセル
	    var data_transfer = (evt.clipboardData) || (window.clipboardData);// DataTransferオブジェクト取得
	    data_transfer.setData( "text" , xUI.yankBuf.toString() );// 文字列データを格納する
    }
});
window.addEventListener("copy" , function(evt){
    if(evt.target===document.getElementById("iNputbOx")){
    	evt.preventDefault();	// デフォルトの処理をキャンセル
	    var data_transfer = (evt.clipboardData) || (window.clipboardData);// DataTransferオブジェクト取得
	    data_transfer.setData( "text" , xUI.yankBuf.toString() );// 文字列データを格納する
	}
});
window.addEventListener("paste" , function(evt){
    if(evt.target===document.getElementById("iNputbOx")){
	    var data_transfer = (evt.clipboardData) || (window.clipboardData);// DataTransferオブジェクト取得
console.log('event paste');
	    var myContent = data_transfer.getData( "text" );// 文字列データを取得
	    if ((myContent.indexOf('\n')>=0)||(myContent.indexOf('\t')>=0)){
console.log(myContent);
	        evt.preventDefault();	// デフォルトの処理をキャンセル
	        xUI.yank(myContent);
	    }
console.log(xUI.yankBuf);
            xUI.paste();
    }else{
console.log(evt.target);
    };
});

//yank関連
    this.yankBuf            ={body:"",direction:"",noteimage:""};// ヤンクバッファは、comma、改行区切りのデータストリーム
    this.yankBuf.valueOf=function(){return this.body;}
    this.yankBuf.toString=function(){
        var matrixArray=this.body.split('\n');
        for (var rix=0;rix<matrixArray.length;rix++){matrixArray[rix]=matrixArray[rix].split(",");};
        var transArray=[];
        for(var f=0;f<matrixArray[0].length;f++){
            transArray[f]=[];
            for (var r=0;r<matrixArray.length;r++){
            transArray[f].push(matrixArray[r][f]);
            }
            transArray[f]=transArray[f].join('\t');
        }
        return transArray.join('\n');
    }
//undo関連
    this.flushUndoBuf();
//保存ポインタ関連

//ラピッド入力モード関連
    this.eXMode = 0;         //ラピッドモード変数(0/1/2/3)
    this.eXCode = 0;         //ラピッドモード導入キー変数
//シート入力関連
    this.eddt   = "";        //編集バッファ
    this.edchg  = false;     //入力ラインバッファ編集フラグ
    this.edmode = 0;         //編集操作モード  0:通常入力  1:ブロック移動  2:区間編集
    this.floatSourceAddress = [0,0];//選択範囲及び区間移動元アドレス
    this.floatDestAddress   = [0,0];//同移動先アドレス
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
    this.Select        = [1, 0];
    this.selectBackup  = this.Select.concat();//カーソル位置バックアップ
                //シート上のフォーカスセル位置
                //選択位置・常にいずれかをセレクト
    this.Selection       =[0, 0];
    this.selectionBackup = this.Selection.concat();//選択範囲バックアップ
                //選択範囲・ベクトル正方向=右・下
    this.noteFocus    =false
                //ノートエリアへのフォーカス

    return this;
};
//    xUIオブジェクト初期化終了 以下メソッド
//
/* ============================================================================ */
/**
    現在編集対象のXPS・referenceXPSをチェックしてxUIのシートビュープロパティを更新
    どちらか単独更新の場合でも画面全体を再描画する必要があるので、このルーチンは等しく実行される
*/
xUI._checkProp=function(){
//リセット
    this.tcCount        = 0;    // タイムコードトラックの総数
    this.dialogCount    = 0;    // 音声トラックの総数
    this.soundCount     = 0;    // 音響トラックの総数
    this.stillCount     = 0;    // 静止画トラックの総数
    this.timingCount    = 0;    // 置換トラックの総数
    this.stageworkCount = 0;    // ステージワークトラックの総数
    this.sfxCount       = 0;    // 効果トラックの総数
    this.cameraCount    = 0;    // カメラトラックの総数
    this.noteCount      = 0;    // フレーム注釈トラック総数
//    this.dialogSpan     = 0;    // 初出の台詞音声トラック数
//    this.soundSpan      = 0;    // 初出の台詞音響トラック数
//    this.cameraSpan     = 0;    // 末尾エリアの幅

//タイムコードトラックはxpsTracksに含まれないので先にareaOrderから取得
    xUI.XPS.xpsTracks.areaOrder.forEach(function(e){if(e.timecode != 'none') xUI.tcCount += (e.timecode == 'bodth')? 2:1;});
//カウント
    for(var idx=0;idx<(this.XPS.xpsTracks.length-1);idx++){
        this.XPS.xpsTracks[idx].sectionTrust=false;
        switch(this.XPS.xpsTracks[idx].option){
            case "comment"    : break;//終端レコードはコメント予約なので判定をスキップ
            case "timecode"   :
            case "note"       : this.noteCount++    ;break;//trackNote トラックコメントはエリアを作らない
            case "sound"      : this.soundCount++   ;break;
            case "dialog"     : this.dialogCount++  ;break;
            case "still"      : this.stillCount++   ;break;
            case "effect"     : ;
            case "sfx"        : this.sfxCount++     ;break;
            case "stage"      :
            case "stagework"  :
            case "geometry"   : this.stageworkCount++;break;
            case "camerawork" : ;
            case "camera"     : this.cameraCount++   ;break;
            case "cell"       : ;
            case "replacement": ;
            case "timing"     : this.timingCount++   ;break;
            default:          ;// NOP
        };
//書式を形成するエリアを計算する

/*
    areaOrderテーブルとtrackSpecを比較して
*/
//表示領域左側の固定列をtrackSpecから確定

/*
//表示域左側で連続した音声トラックの数を控える（最初に出てきたXpsAreaOption が sound以外のトラックの位置で判定 ）
//        if((Xps.AreaOptions[this.XPS.xpsTracks[idx].option] != "sound")&&(this.dialogSpan+this.soundSpan > 0)){
//            this.dialogSpan = this.dialogCount;
//            this.soundSpan  = this.soundCount;
//仕様変更によりxUI.dialogSpan+soundSpanは、役割を喪失のため削除予定
//        };// */
//フレームコメントの左側の連続したcamera/sfxトラックの数を控える(最後のcamera/sfx/effect/geometry以外のトラックの位置から計算)
        if((this.XPS.xpsTracks[idx].option != "camera")&&(this.XPS.xpsTracks[idx].option!="geometry")&&(this.XPS.xpsTracks[idx].option!="sfx")&&(this.XPS.xpsTracks[idx].option!="effect")){this.cameraSpan=this.XPS.xpsTracks.length-idx-2};
//カウントする、ただしこのルーチンはこの後プロパティに変換してレイヤ数が変わるたびにプロパティとして変更するように変更されるべき。
    }
//
//    this.timingSpan = this.XPS.xpsTracks.length-(this.cameraSpan+this.dialogSpan+this.soundSpan+1);//カメラ（非画像トラックの合計）
    this.SheetWidth = this.XPS.xpsTracks.length;
/*
参照するトラック数をスイッチをもとに算出
*/
    this.referenceLabels.length = 0;//クリア
    this.refRegex        = new RegExp(xUI.referenceView.join("|"));//更新
    for(var ix=0;ix<xUI.referenceXPS.xpsTracks.length;ix++){
        var currentTrack=xUI.referenceXPS.xpsTracks[ix].option;
        if(currentTrack.match(this.refRegex)) this.referenceLabels.push(ix);//array of index
    };
//チェックと同時にtrackSpecを補正(双方向マッチ)trackspecは補正しないように仕様変更
//    var referenceArea = this.XPS.xpsTracks.areaOrder.find(function(e){return (e.type == "reference")});
//    if((referenceArea)&&(this.referenceLabels.length != referenceArea.tracks)) referenceArea.tracks = this.referenceLabels.length;
}
/*
    setBackgroundColor(bgColor)
    背景色を色コードで指定する
    より包括的な新規コードのラッパー関数
    単体の文字列値を与えた場合、値を背景色として動作する

*/
xUI.setBackgroundColor = function(bgColor){
    if(! bgColor) return false;
    xUI.XPS.sheetLooks.SheetBaseColor = bgColor;
    xUI.applySheetlooks();
//    xUI.footstampPaint();
}
/*
 *  @params {Boolean|String}   stat
 *  モバイル環境を設定|解除する
 *  引数は、appHost.platform
 */
xUI.setMobileUI = function(stat){
    if(stat){
//標準のドラグスクロールを停止
//iNputbOx
//        document.getElementById("iNputbOx").disabled = true;
//        document.getElementById("iNputbOx").style.display = 'none';
//optionPanelTbx
        Array.from(document.getElementsByClassName('optionPanelTbx')).forEach(function(e){
            nas.HTML.addClass(e,'optionPanelTbx-mobile');
        });
        Array.from(document.getElementsByClassName('tBSelector')).forEach(function(e){
            nas.HTML.addClass(e,'tBSelector-mobile');
        });
        Array.from(document.getElementsByClassName('skb_key')).forEach(function(e){
            nas.HTML.addClass(e,'skb_key-mobile');
        });
//optionPanleFloat
        Array.from(document.getElementsByClassName('optionPanelFloat')).forEach(function(e){
            nas.HTML.addClass(e,'optionPanelFloat-mobile');
        });
        Array.from(document.getElementsByClassName('iconButton')).forEach(function(e){
            nas.HTML.addClass(e,'iconButton-mobile');
        });
//アイコンボタンを使用しているoptionPanel類を調整
        nas.HTML.addClass(document.getElementById('optionPanelPaint'),'optionPanelPaint-mobile');
        nas.HTML.addClass(document.getElementById('optionPanelSnd'),'optionPanelSnd-mobile');
//メニュー高さ調整
        nas.HTML.setCssRule('#pMenu','height:24px;');
    }else{
//標準のドラグスクロールを停止解除
//マウスドラッグスクロールの停止
//	nas.HTML.mousedragscrollable.movecancel = false;
//タッチスクロール・ホイルスクロールの停止
//	document.removeEventListener('pointerdown',nas.HTML.disableScroll,{ passive: false });
//	document.removeEventListener('touchstart' ,nas.HTML.disableScroll,{ passive: false });
//iNputbOx
//        document.getElementById("iNputbOx").disabled = false;
//        document.getElementById("iNputbOx").style.display = 'inline';
//optionPanelTbx
        Array.from(document.getElementsByClassName('optionPanelTbx')).forEach(function(e){
            nas.HTML.removeClass(e,'optionPanelTbx-mobile');
        });
        Array.from(document.getElementsByClassName('tBSelector')).forEach(function(e){
            nas.HTML.removeClass(e,'tBSelector-mobile');
        });
        Array.from(document.getElementsByClassName('skb_key')).forEach(function(e){
            nas.HTML.removeClass(e,'skb_key-mobile');
        });
//optionPanleFloat
        Array.from(document.getElementsByClassName('optionPanelFloat')).forEach(function(e){
            nas.HTML.removeClass(e,'optionPanelFloat-mobile');
        });
        Array.from(document.getElementsByClassName('iconButton')).forEach(function(e){
            nas.HTML.removeClass(e,'iconButton-mobile');
        });
//optionPanelPaint
        nas.HTML.removeClass(document.getElementById('optionPanelPaint'),'optionPanelPaint-mobile');
        nas.HTML.removeClass(document.getElementById('optionPanelSnd'),'optionPanelSnd-mobile');
//メニュー高さ調整
        nas.HTML.setCssRule('#pMenu','height:20px;');
    };
//    xUI.syncIconbarButton();
}
/*
 *  ツールバースクロールボタン表示制御
 */
xUI.syncIconbarButton = function(){
    [['ibMRibbon','ibMibSelect'],['ibMUtlRibbon','ibMtbSelect']].forEach(function(e){
        var bar   = document.getElementById(e[0]);
        var barBt = document.getElementById(e[1]);
        if(bar.scrollWidth > bar.clientWidth){
            barBt.style.display = 'inline';
        }else{
            barBt.style.display = 'none';
        };
    });
}
/*ボタンバースクロール*/
xUI.buttonbarScrollTo = function(bar,count){
    var buttonSpan = document.getElementById('ibMredo').offsetLeft - document.getElementById('ibMundo').offsetLeft;
    bar.scrollTo(bar.scrollX+(count*buttonSpan),0);
}
/*
    スクロール時にボタン幅単位に移動をスナップさせる
    イベントリスナに登録する
    document.getElementById('ibMRibbon').addEventListener('scroll',xUI.buttonbarOnScroll)
    document.getElementById('ibMUtlRibbon').addEventListener(xUI.buttonbarOnScroll)
*/
xUI.buttonbarOnScroll = function(){
    var buttonSpan = document.getElementById('ibMredo').offsetLeft - document.getElementById('ibMundo').offsetLeft;
    this.scrollTo(Math.round(this.scrollLeft/buttonSpan)*buttonSpan,0);
}
/**
    @params {Boolean}    byUndo
    @params {Function}   callback
    ドキュメントフォーマットオブジェクトが持っている情報をUIに反映させる
    フォーマットエディタがアクティブ｜ドキュメント情報パネルがアクティブな場合は、UNDOなし
    それらの開いていない場合は、UNDO付きで更新が行われる
    ||($('#optionPanelScn').isVisible())
*/
xUI.applyDocumentFormat = function(byUndo,callback){
    if(!(byUndo)||(documentFormat.active)){
console.log('applyDocumentFormat widthout UNOD :'+ documentFormat.FormatName);
        xUI.applySheetlooks(documentFormat.toJSON());
        if(callback instanceof Function) callback();
    }else{
console.log('applyDocumentFormat width UNOD :'+ documentFormat.FormatName)
        var newData = new Xps();
        newData.parseXps(xUI.XPS.toString(false));
        newData.parseSheetLooks(documentFormat.toJSON());
        xUI.put(newData,undefined,false,callback);
//        xUI.applySheetlooks();
// putメソッドにXpsドキュメントを与えた場合resetsheetがSheetLooksを呼び出すので不要
//        xUI.resetSheet()
    };
//    documentFormat.adjustTrack();
}
/**
 *  @params {Object|String} sheetLooks
 *  @returns {Object}
 *        sheetlooks
 *
 *   インターフェースルック反映・適用
 *   カラー・及びシートルックを更新
 *   分離のみ  暗色のテーマにはまだ対応していないので注意  2017.02.04
 *      書式オブジェクトがアプリテーマと独立の情報に変更されたためダークモードの影響はないものとする 2024
 *   標準状態で、右の2つの書式情報は同じオブジェクトを指す xUI.sheetLooks === xUI.XPS.sheetLooks
 *      Object sheetLooksまたは シリアライズ文字列を与えて、ドキュメント及び画面に反映する
 *      引数が与えられなかった場合はドキュメントの持つsheetLooksを使用してルックの更新を行う
 *  トラック数、配置変更を伴うのでtrackSpecの反映はこのメソッドでは行われない
 *  トラック配置変更の際は、あらかじめドキュメントにsheetLooksを適用した後にresetSheetで画面をリフレッシュする必要がある
 *  このプロシジャはresetSheetを呼び出さない
 *  UNDOも考慮されていないので、UNDO処理が必要な場合はこの別に呼び出しを行う必要がある
 *
 *  主にresetSheetから呼び出しを受けるが、それ以外でも呼び出しは可能
 *  処理が多いため、このメソッドの呼び出しはなるべく控えるのが良い
 *  必要ならば各サブプロシジャを呼んだほうが負担は減る
 */
xUI.applySheetlooks = async function(sheetLooks,callback){
//引数があればドキュメント・アプリのプロパティを更新する
    if(typeof sheetLooks != 'undefined'){
console.log(sheetLooks);
//================================ 引数が存在する場合はドキュメントに適用
        xUI.XPS.parseSheetLooks(sheetLooks);
//================================ アプリ側のモードでドキュメントを上書きする（ここではモード変更はサポートされない）
        xUI.XPS.documentMode = ({PageImage :'pageImage',WordProp :'page',Compact :'scroll'})[xUI.viewMode];
    };
//================================ 参照を更新
    if(xUI.sheetLooks !== xUI.XPS.sheetLooks) xUI.sheetLooks = xUI.XPS.sheetLooks;
//================================ シートカラーcss設定
    xUI.applyDocumentColor();
//================================ 書式配置適用
    xUI.applySheetHeader();
//================================ タイムシートセルハイトcss設定
    xUI.applySheetCellHeight(xUI.sheetLooks.SheetColHeight);
//================================ タイムシートトラック幅css設定
    xUI.applySheetTrackWidth();
//================================ タイムシートマージン・カラー等をcss設定
    xUI.setAppearance();
//================================ footStampを再描画してシートセルの背景を更新する
    xUI.footstampPaint();
//================================ canvasPaintの調整
    xUI.canvasPaint.backdropColor = xUI.sheetbaseColor;
    xUI.canvasPaint.pencilColorB  = xUI.sheetbaseColor;
    xUI.canvasPaint.syncColors();
    if(callback instanceof Function) calllback();
    return xUI.sheetLooks;
}
/*
    xUI.sheetLooksを参照してドキュメントのカラーデータを構築・反映
    引数なし
    戻り値なし
*/
xUI.applyDocumentColor = function(){
    if (! String(xUI.sheetLooks.SheetBaseColor).match(/^#[0-9a-f]+/i)){xUI.sheetLooks.SheetBaseColor = nas.colorAry2Str(nas.colorStr2Ary(xUI.sheetLooks.SheetBaseColor));};

//編集不可領域の背景色 背景色を自動設定  やや暗  これは初期状態で対向色を設定してその間で計算を行うように変更

    xUI.sheetbaseColor     = xUI.sheetLooks.SheetBaseColor;                                        //タイムシート背景色
    var baseColor           = nas.colorStr2Ary(xUI.sheetbaseColor);  //基本色をRBGのまま配列化
// 輝度出してフラグ立てる
    xUI.sheetbaseDark      = (((76*baseColor[0]+150*baseColor[0]+29*baseColor[0])/255) > 0.3)? false:true;//仮のしきい値0.3

    xUI.sheetTextColor     = xUI.sheetLooks.SheetTextColor;//基本テキストカラー

    xUI.sheetblankColor    = nas.colorAry2Str(mul(nas.colorStr2Ary(xUI.sheetbaseColor),.95)); //編集不可領域の背景色
    xUI.sheetborderColor   = nas.colorAry2Str(mul(nas.colorStr2Ary(xUI.sheetbaseColor),.75)); //罫線基本色
    xUI.trackLabelColor    = xUI.sheetborderColor;//ラベルカラーは罫線色に変更

    xUI.footstampColor     = nas.colorAry2Str(div( add (nas.colorStr2Ary(xUI.sheetLooks.FootStampColor),nas.colorStr2Ary(xUI.sheetbaseColor)),2));                        //フット/差分  スタンプの色 背景色との中間値
        xUI.inputModeColor.NORMAL  = nas.colorAry2Str(div( add (nas.colorStr2Ary(xUI.sheetLooks.SelectedColor),nas.colorStr2Ary(xUI.sheetbaseColor)),2));                      //  ノーマル色
        xUI.inputModeColor.EXTEND  = nas.colorAry2Str(div( add (nas.colorStr2Ary(xUI.sheetLooks.RapidModeColor),nas.colorStr2Ary(xUI.sheetbaseColor)),2))            ;//ラピッド入力
        xUI.inputModeColor.FLOAT   = nas.colorAry2Str(div( add (nas.colorStr2Ary(xUI.sheetLooks.FloatModeColor),nas.colorStr2Ary(xUI.sheetbaseColor)),2))            ;//ブロック移動
        xUI.inputModeColor.SECTION = nas.colorAry2Str(mul( add (nas.colorStr2Ary(xUI.sheetLooks.SectionModeColor),nas.colorStr2Ary(xUI.sheetbaseColor)),.5))         ;//範囲先頭(編集中)
        xUI.inputModeColor.SECTIONtail = nas.colorAry2Str(mul( add (nas.colorStr2Ary(xUI.sheetLooks.SectionModeColor),nas.colorStr2Ary(xUI.sheetbaseColor)),.45))    ;//範囲末尾(編集中)
//      xUI.inputModeColor.SECTIONselection = nas.colorAry2Str( mul( add (nas.colorStr2Ary(sheetLooks.SectionModeColor),nas.colorStr2Ary(xUI.sheetbaseColor)),1));//範囲編集中

    xUI.selectedColor      = xUI.inputModeColor.NORMAL        ;//選択セルの背景色.NORMAL
    xUI.selectionColor     = xUI.sheetLooks.SelectionColor     ;//選択領域の背景色
    xUI.selectionColorTail = xUI.sheetLooks.SelectionColor     ;//選択領域末尾背景色(sectionTail)デフォルトは同色
    xUI.editingColor       = xUI.sheetLooks.EditingColor       ;//セル編集中のインジケータ
    xUI.selectingColor     = xUI.sheetLooks.SelectingColor     ;//セル選択中のインジケータ
//タイムライン・ラベル識別カラ－
    xUI.cameraColor = nas.colorAry2Str(div(add([0,1,0],mul(nas.colorStr2Ary(xUI.sheetbaseColor),6)),7));
    xUI.sfxColor    = nas.colorAry2Str(div(add([0,0,1],mul(nas.colorStr2Ary(xUI.sheetbaseColor),5)),6));
    xUI.stillColor  = nas.colorAry2Str(div(add([1,0,0],mul(nas.colorStr2Ary(xUI.sheetbaseColor),6)),7));//タイムライン全体に着色

//中間色自動計算
        xUI.inputModeColor.NORMALspin=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.NORMAL),mul(nas.colorStr2Ary(xUI.sheetbaseColor),3)),4));
        xUI.inputModeColor.EXTENDspin=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.EXTEND),mul(nas.colorStr2Ary(xUI.sheetbaseColor),3)),4));
        xUI.inputModeColor.FLOATspin=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.FLOAT),mul(nas.colorStr2Ary(xUI.sheetbaseColor),3)),4));
        xUI.inputModeColor.SECTIONspin=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.SECTION),mul(nas.colorStr2Ary(xUI.sheetbaseColor),3)),4));
//スピン選択状態
        xUI.inputModeColor.NORMALspinselected=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.NORMAL),mul(nas.colorStr2Ary(xUI.selectionColor),8)),10));
        xUI.inputModeColor.EXTENDspinselected=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.EXTEND),mul(nas.colorStr2Ary(xUI.selectionColor),8)),10));
        xUI.inputModeColor.FLOATspinselected=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.FLOAT),mul(nas.colorStr2Ary(xUI.selectionColor),8)),10));
        xUI.inputModeColor.SECTIONspinselected=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.SECTION),mul(nas.colorStr2Ary(xUI.selectionColor),8)),10));
//選択状態
        xUI.inputModeColor.NORMALselection=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.NORMAL),mul(nas.colorStr2Ary(xUI.selectionColor),5)),6));
        xUI.inputModeColor.EXTENDselection=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.EXTEND),mul(nas.colorStr2Ary(xUI.selectionColor),5)),6));
        xUI.inputModeColor.FLOATselection=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.FLOAT),mul(nas.colorStr2Ary(xUI.sheetbaseColor),5)),6));
        xUI.inputModeColor.SECTIONselection=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.SECTION),mul(nas.colorStr2Ary(xUI.sheetbaseColor),5)),6));
//編集中
        xUI.inputModeColor.NORMALeddt=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.NORMAL),mul([1,1,1],8)),9));
        xUI.inputModeColor.EXTENDeddt=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.EXTEND),mul([1,1,1],8)),9));
        xUI.inputModeColor.FLOATeddt=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.FLOAT),mul([1,1,1],8)),9));
        xUI.inputModeColor.SECTIONeddt=
    nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.SECTION),mul([1,1,1],8)),9));

//フロートテキスト色
    xUI.floatTextColor =
    nas.colorAry2Str(div(add([0,0,0],mul(nas.colorStr2Ary(xUI.sheetbaseColor),3)),4));


//----------------------------------------------------------------------初期状態設定
    xUI.spinAreaColor          = xUI.inputModeColor.NORMALspin;
    xUI.spinAreaColorSelect    = xUI.inputModeColor.NORMALselection;
    xUI.sectionBodyColor       = nas.colorAry2Str(div(add(nas.colorStr2Ary(xUI.inputModeColor.SECTION),mul(nas.colorStr2Ary(xUI.sheetbaseColor),3)),4));//?使わんかも
// ---------------------- ここまでカラー設定(再計算)
if(xUI.sheetbaseDark){
    xUI.sheetTextColor     = nas.colorAry2Str( div(sub([1,1,1],nas.colorStr2Ary(xUI.sheetTextColor)),2));
    xUI.trackLabelColor    = nas.colorAry2Str( div(sub([1,1,1],nas.colorStr2Ary(xUI.trackLabelColor)),2));

    xUI.sheetblankColor    = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.sheetblankColor)));
    xUI.sheetborderColor   = nas.colorAry2Str(div(sub([1,1,1],nas.colorStr2Ary(xUI.sheetborderColor)),2));
//    xUI.footstampColor     = nas.colorAry2Str(div(nas.colorStr2Ary(xUI.footstampColor),2));
    xUI.footstampColor     = nas.colorAry2Str(div(add (sub([1,1,1],nas.colorStr2Ary(xUI.sheetLooks.FootStampColor)),nas.colorStr2Ary(xUI.sheetbaseColor)),2));
        xUI.inputModeColor.NORMAL  = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.NORMAL)));
        xUI.inputModeColor.EXTEND  = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.EXTEND)));
        xUI.inputModeColor.FLOAT   = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.FLOAT)));
        xUI.inputModeColor.SECTION = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.SECTION)));
        xUI.inputModeColor.SECTIONtail = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.SECTIONtail)));

    xUI.selectedColor    = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.selectedColor)));
    xUI.selectionColor   = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.selectionColor)));
    xUI.selectionColorTail   = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.selectionColorTail)));
    xUI.editingColor      = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.editingColor)));
    xUI.selectingColor     = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.selectingColor)));
//タイムライン・ラベル識別カラ－
    xUI.cameraColor    = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.cameraColor)));
    xUI.sfxColor       = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.sfxColor)));
    xUI.stillColor     = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.stillColor)));

//中間色自動計算
        xUI.inputModeColor.NORMALspin  = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.NORMALspin)));
        xUI.inputModeColor.EXTENDspin = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.EXTENDspin)));
        xUI.inputModeColor.FLOATspin = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.FLOATspin)));
        xUI.inputModeColor.SECTIONspin = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.SECTIONspin)));
//スピン選択状態
        xUI.inputModeColor.NORMALspinselected = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.NORMALspinselected)));
        xUI.inputModeColor.EXTENDspinselected = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.EXTENDspinselected)));
        xUI.inputModeColor.FLOATspinselected = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.FLOATspinselected)));
        xUI.inputModeColor.SECTIONspinselected = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.SECTIONspinselected)));
//選択状態
        xUI.inputModeColor.NORMALselection = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.NORMALselection)));
        xUI.inputModeColor.EXTENDselection = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.EXTENDselection)));
        xUI.inputModeColor.FLOATselection = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.FLOATselection)));
        xUI.inputModeColor.SECTIONselection = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.SECTIONselection)));
//編集中
        xUI.inputModeColor.NORMALeddt = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.NORMALeddt)));
        xUI.inputModeColor.EXTENDeddt = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.EXTENDeddt)));
        xUI.inputModeColor.FLOATeddt = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.FLOATeddt)));
        xUI.inputModeColor.SECTIONeddt = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.inputModeColor.SECTIONeddt)));

//フロートテキスト色
    xUI.floatTextColor = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.floatTextColor)));


//----------------------------------------------------------------------初期状態設定
    xUI.spinAreaColor          = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.spinAreaColor)));
    xUI.spinAreaColorSelect    = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.spinAreaColorSelect)));
    xUI.sectionBodyColor       = nas.colorAry2Str(sub([1,1,1],nas.colorStr2Ary(xUI.sectionBodyColor)));
}
//================================================================================================================================ルックの適用
//タイムシート背景色をsheetbaseColorに設定
    document.body.style.backgroundColor     = xUI.sheetbaseColor;
    document.body.style.color               = xUI.sheetTextColor;
    nas.HTML.setCssRule('.qdr-left','background-color:'+xUI.sheetbaseColor,"both");//スクロールパッチ背景色
// サブテキストカラーを設定
    nas.HTML.setCssRule(".headerInfoLabel"  ,"color:"+xUI.trackLabelColor,"both");
    nas.HTML.setCssRule(".trackLabel"       ,"color:"+xUI.trackLabelColor,"both");
    nas.HTML.setCssRule('td.Sep'            ,'color:'+xUI.trackLabelColor,"both");
//    nas.HTML.setCssRule('td.ref'            ,'color:'+xUI.trackLabelColor,"screen");
    
//ヘッダとフッタの背景色をシート背景色で塗りつぶし
//    document.getElementById("fixedHeader").style.backgroundColor = xUI.sheetbaseColor;
    nas.HTML.setCssRule("#fixedHeader","background-color:"+xUI.sheetbaseColor,"both");

    nas.HTML.setCssRule("table.sheet","background-color:"+xUI.sheetbaseColor,"both");
    nas.HTML.setCssRule("table"      ,"border-color:"+xUI.sheetbaseColor,"both");
    nas.HTML.setCssRule("th"         ,"border-color:"+xUI.sheetborderColor,"both");
    nas.HTML.setCssRule("td"         ,"border-color:"+xUI.sheetborderColor,"both");

//    シートブランクの色設定
var mySeps=[
    "ltSep","dtSep","ntSep","ntSep",
    "lsSep","dsSep","nsSep","nsSep",
    "lnSep","dnSep","nnSep","nnSep"
];

for(var idx=0;idx<mySeps.length;idx++){
    nas.HTML.setCssRule("."+mySeps[idx]+"_Blank","background-color:"+xUI.sheetblankColor,'both')
};
//============================================= シートカラーcss設定
//  タブUIに  背景色を設定
    nas.HTML.setCssRule('.tabControll','backgroundColor:'+xUI.sheetbaseColor,'both');
    nas.HTML.setCssRule('#tabSelector','backgroundColor:'+xUI.sheetbaseColor,'both');

//============================================= シートカラーcss設定2
//    シート境界色設定
    nas.HTML.setCssRule('table'        ,'border-color:'+xUI.sheetbaseColor  ,'both');
    nas.HTML.setCssRule('.tlhead'      ,'border-color:'+xUI.sheetborderColor,'both');
    nas.HTML.setCssRule('.trackLabel'  ,'border-color:'+xUI.sheetborderColor,'both');
    nas.HTML.setCssRule('td.sheetbody' ,'border-color:'+xUI.sheetborderColor,'both');

/*
    nas.HTML.setCssRule('th.stilllabel'  ,'background-color:'+xUI.stillColor  ,"screen");
    nas.HTML.setCssRule('th.sfxlabel'    ,'background-color:'+xUI.sfxColor    ,"screen");
    nas.HTML.setCssRule('th.cameralabel' ,'background-color:'+xUI.cameraColor ,"screen");
// */
//================================ シートカラーcss設定2
//    if(this.footstampPaint) this.footstampPaint();
}
/*
 *	シートヘッダ部に書式を適用
 */
xUI.applySheetHeader = function(sheetLooks){
    if(typeof sheetLooks == 'undefined') sheetLooks = xUI.XPS.sheetLooks;
//シート・ページヘッダサイズを調整
	var selector = "";
	var top    = sheetLooks.HeaderMarginTop ;
	var left   = sheetLooks.HeaderMarginLeft;
	var height = sheetLooks.HeaderBoxHeight;
	var width  = 0;
	sheetLooks.headerItemOrder.forEach(function(e){
		width += (e[2] == 'hide')? 0 : e[1];//合計
	});
	(['div.sheetHeader','.pageHeader']).forEach(function(e){
		nas.setCssRule( e ,
		'left:'   + left   + sheetLooks.CellWidthUnit + ';' +
		'top:'    + top    + sheetLooks.CellWidthUnit + ';' +
		'height:' + height + sheetLooks.CellWidthUnit + ';' +
		'width:'  + width  + sheetLooks.CellWidthUnit + ';',
		'both'
	);});
	(['.pgHeader ','.pgHeader-label']).forEach(function(e){
		nas.setCssRule( e ,
		'height:' + height + sheetLooks.CellWidthUnit + ';',
		'both'
	);});
//内容を書き換え
	var headers = Array.from(document.getElementsByClassName('sheetHeader'),function(e){return (e instanceof HTMLDivElement); });
	for (var i = 0 ;i < headers.length ; i++ ){
		headers[i].innerHTML = xUI.pageHeaderItemOrder(i+1,headers.length);
	};
	sheetLooks.headerItemOrder.forEach(function(e){
		var type  = e[0];
		var width = e[1];
		var hide  = (e[2] == 'hide')? true:false;

		if(! hide) nas.setCssRule(
			documentFormat.headerItemWidthClass[type],
			'width:'+width + sheetLooks.CellWidthUnit + ';',
			'both'
		);
	});
//サインボックス・メモ欄
	(['HeaderSign','HeaderNote']).forEach(function(e){
		selector = (e == 'HeaderSign')? '.signArea':'.noteArea';
		nas.setCssRule(
			selector,
			'left:'+ sheetLooks[e][0] + sheetLooks.CellWidthUnit + ';'+
			'top:' + sheetLooks[e][1] + sheetLooks.CellWidthUnit + ';'+
			'height:'+(sheetLooks[e][3] - sheetLooks[e][1]) + sheetLooks.CellWidthUnit + ';'+
			'width:' +(sheetLooks[e][2] - sheetLooks[e][0]) + sheetLooks.CellWidthUnit + ';'
			,'both'
		);
	});
}
/*TEST 
xUI.applySheetHeader()
*/
/*
    トラック幅を設定
    sheetLooksの値をcssに対して反映させる
*/
xUI.applySheetTrackWidth = function(sheetLooks){
    if(typeof sheetLooks == 'undefined') sheetLooks = xUI.XPS.sheetLooks;
/*
    sheetLooksの示すサイズは罫線を含むトータルなので罫線分の計算が必要
    tdはデフォルトで罫線を含んでいるか？
    各プロパティは Number|nas.UnitValue なので直接加算が可能
    UnitValueの場合は必ず単位と合致する仕様
*/
    var ofst = 0;
    var mySections=[
        ["th.tcSpan"        ,"width" ,(sheetLooks.TimeGuideWidth       + ofst + sheetLooks.CellWidthUnit)],
        ["th.dialogSpan"    ,"width" ,(sheetLooks.DialogWidth          + ofst + sheetLooks.CellWidthUnit)],
        ["th.soundSpan"     ,"width" ,(sheetLooks.SoundWidth           + ofst + sheetLooks.CellWidthUnit)],
        ["td.colSep"        ,"width" ,(sheetLooks.ColumnSeparatorWidth + ofst + sheetLooks.CellWidthUnit)],
        ["th.referenceSpan" ,"width" ,(sheetLooks.ActionWidth          + ofst + sheetLooks.CellWidthUnit)],
        ["th.editSpan"      ,"width" ,(sheetLooks.SheetCellWidth       + ofst + sheetLooks.CellWidthUnit)],
        ["th.timingSpan"    ,"width" ,(sheetLooks.SheetCellWidth       + ofst + sheetLooks.CellWidthUnit)],
        ["th.stillSpan"     ,"width" ,(sheetLooks.StillCellWidth       + ofst + sheetLooks.CellWidthUnit)],
        ["th.geometrySpan"  ,"width" ,(sheetLooks.GeometryCellWidth    + ofst + sheetLooks.CellWidthUnit)],
        ["th.sfxSpan"       ,"width" ,(sheetLooks.SfxCellWidth         + ofst + sheetLooks.CellWidthUnit)],
        ["th.cameraSpan"    ,"width" ,(sheetLooks.CameraCellWidth      + ofst + sheetLooks.CellWidthUnit)],
        ["th.framenoteSpan" ,"width" ,(sheetLooks.CommentWidth         + ofst + sheetLooks.CellWidthUnit)]
    ];
/*    cssにルールセットを追加する関数
    nas.HTML.setCssRule( セレクタ, プロパティ, 適用範囲 )
        セレクタ    cssのセレクタを指定
        プロパティ    プロパティを置く
        適用範囲    スタイルシートIDの配列、またはキーワード"screen""print"または"both"
 */
//トラックの幅を設定
/*    リスト
class=timelabel trackLabel
class=timeguide? 
class=dtSep
class=ntSep
class=colSep
class=layerlabelR trackLabel
class=layerlabel trackLabel
 */
    for(var idx=0;idx<mySections.length;idx++){
        nas.HTML.setCssRule( mySections[idx][0],mySections[idx][1]+":"+mySections[idx][2],"both");
    };
}
/*
    カラム高さを文字列で与えてシートセルの高さを設定する
    設定したシート列高を返す
*/
xUI.applySheetCellHeight = function(colHeight){
    if(typeof colHeight != 'undefined') xUI.sheetLooks.SheetColHeight = colHeight;
    if((xUI.sheetLooks.SheetColHeight)&&(document.getElementById('page_1'))){
//カラムあたりのフレーム数 = シート長 / カラム数
        var fpc = nas.FCT2Frm(xUI.sheetLooks.PageLength,nas.FRATE)/xUI.sheetLooks.SheetColumn;
        var offset = document.getElementById('page_1').getBoundingClientRect().bottom - document.getElementById('0_0').getBoundingClientRect().top - ( new nas.UnitValue(nas.getCssRule("td.sheetbody",'height'),'mm').as('px')* fpc);
        var newHeight = (new nas.UnitValue(xUI.sheetLooks.SheetColHeight + xUI.sheetLooks.CellWidthUnit,'mm').as('px')
            - offset ) / fpc;
        if ( newHeight > 10) xUI.sheetLooks.SheetCellHeight = newHeight; 
    }
    nas.HTML.setCssRule('td.sheetbody','height:'+xUI.sheetLooks.SheetCellHeight + xUI.sheetLooks.CellWidthUnit,'both');
    return xUI.sheetLooks.SheetCellHeight;
}
/**
    @params {Boolean}   opt
    タイムシートセルテーブルの表示マージンを設定する
    画像マッチ時は設定値通りに
    ヘッドマージン部分は印字用ヘッダーテーブルを表示
    オフの際はすべて 0
 */
xUI.applySheetMargin = function(opt){
console.log(opt);console.log(xUI.viewMode);
    if(! opt) opt = 0;
//スクロール|ページモードのために0で初期化（制限モードを含む）
	var sheetOffsetTop    = 0;//0固定
	var sheetOffsetLeft   = xUI.XPS.sheetLooks.SheetLeftMargin - 2;
	var sheetMarginBottom = 0;//0固定

	if((xUI.viewMode != 'Compact')&&(document.getElementById('0_0'))){
//ページモード(2 modes) 初期化済（cell"0_0"が存在する）ならば
		sheetOffsetTop = xUI.XPS.sheetLooks.SheetHeadMargin - (document.getElementById('0_0').offsetTop - document.getElementById('page_1').parentNode.offsetTop + document.getElementsByClassName('pgNm')[0].offsetHeight) - 4;
//ページ画像のサイズで
// ((opt)&&(document.getElementById('pageImage-1')))?
	    if(document.getElementById('pageImage-1')){
	        sheetMarginBottom =
		        document.getElementById('pageImage-1').naturalHeight
		        * (96/nas.NoteImage.guessDocumentResolution(document.getElementById('pageImage-1'),'A3'))
		        - xUI.XPS.sheetLooks.SheetHeadMargin
		        - xUI.sheetLooks.SheetColHeight;
		}else{
		    sheetMarginBottom =
		        new nas.UnitValue("420mm").as('px')
		        - xUI.XPS.sheetLooks.SheetHeadMargin
		        - xUI.sheetLooks.SheetColHeight;
		};
	};
console.log(sheetOffsetTop,sheetMarginBottom,sheetOffsetLeft);
//シートヘッダ領域位置合わせ(表示濃度ではなくviewModeに従って変更)

    if(xUI.viewMode == 'PageImage'){
//ページ画像モード
        nas.HTML.setCssRule('.headerArea','display:block;',"both");
        nas.HTML.setCssRule('.headerArea','height:'+sheetOffsetTop+'px;',"both");
    }else{
//スクロール｜ページモード
        nas.HTML.setCssRule('.headerArea','display:none;' ,"screen");
        nas.HTML.setCssRule('.headerArea','display:block;',"print");
        nas.HTML.setCssRule('.headerArea','height:'+sheetOffsetTop+'px;',"print");
    };

//タイムシートテーブル&オーバレイ画像の位置合わせ
console.log('table.sheet',"margin-top:"+sheetOffsetTop+"px ;margin-bottom:"+sheetMarginBottom+"px ;margin-left:"+sheetOffsetLeft+"px ;","both");

	if(xUI.viewMode == 'PageImage'){
console.log('SET-SHEET-OFFSET 0');
// pageimage シート位置をシフト
		nas.HTML.setCssRule('table.sheet',"margin-top:"+sheetOffsetTop+"px ;margin-bottom:"+sheetMarginBottom+"px ;margin-left:"+sheetOffsetLeft+"px ;","both");
		nas.HTML.setCssRule('.overlayDocmentImage',"top:0px ;","both");

	}else if(xUI.viewMode == 'WordProp'){
console.log('==============SET-SHEET-OFFSET :'+ sheetOffsetTop );
// page スクリーンシート位置はデフォルト プリント位置はシフト
		nas.HTML.setCssRule('table.sheet',"margin-top:0px ;margin-bottom:0px ;margin-left:"+sheetOffsetLeft+"px ;","screen");
		nas.HTML.setCssRule('table.sheet',"margin-top:"+sheetOffsetTop+"px ;margin-bottom:"+sheetMarginBottom+"px ;margin-left:"+sheetOffsetLeft+"px ;","print");
//画像位置を スクリーンでシフト プリントでデフォルト 
		nas.HTML.setCssRule('.overlayDocmentImage',"top: -"+(sheetOffsetTop)+"px ;","screen");
		nas.HTML.setCssRule('.overlayDocmentImage',"top:0px ;","print");
	}else{
//scroll
		nas.HTML.setCssRule('table.sheet',"margin-top:0px ;margin-bottom:0px ;margin-left:"+sheetOffsetLeft+"px ;","all");
	};
//for screen && print
//	nas.HTML.setCssRule('table.sheet',"margin-top:0px ;margin-bottom:0px ;margin-left:0px ;","print");//for printout
}
/** 
 *  @params {Number}  appearance
 *  @params {Boolean} update
 *      パラメータ更新フラグ default undefined
 *  @returns {Numver}
 *          表示状態を返す
 *         
 *  ドキュメント表示状態を設定する
 *  画像表示状態パラメタを引数として与え ドキュメントの画像イメージを調整する
 *	引数のない場合はドキュメントモードを確認して不整合のある部分を再設定
 *	状態フラグと表示パラメータとが必要
 画像表示 ON|OFF	xUI.XPS.sheetLooks.ShowDocumentImage
 
blendmode(合成モード)は、独自形式 エディタ側は罫線のカラーを背景色との中間値で計算・画像は比較暗で固定
そのため指定パラメータは意味を失う

appearance(画像表示状態)パラメータ 値範囲は .0-1.0

(slider)   0  <  50 >  100
(image )   0 <> 100 <> 100 %
(editor) 100 <> 100 <>   0 %

連動スライダで操作
これにより画像の ON|OFF は意味を失うため、.sheetImages.imageAppearance に appearance値を記録してopacityは不要となる

エディタUIは
フォーマットエディタ上では   罫線のみ（ラベルとボディは背景色）
画像マスターモード上 では    ボディのみ
ノーマルモード上    では    スイッチで切り替え

ページモード(viewMode == WordProp|PageImage)で画像編集(xUI.canvasPaint.active == true)時は アピアランス値0が禁止される
切替時に0の場合は１に変換
画像ハンドリングオフの際は 0~1 可変

スクロール表示(モード)中はアピアランス値変更禁止(202310仕様)
アピアランスの値は旧ページモードではそのままopacityとして扱う

 */
xUI.setAppearance = function(appearance,update){
console.log(arguments);
    if(xUI.viewMode == 'Compact'){
        appearance = 0;//document-image appearance
    }else{
	    if(typeof appearance == 'undefined') appearance   = xUI.XPS.timesheetImages.imageAppearance;
	    if(
	        (xUI.canvasPaint.active)&&
	        (xUI.viewMode != 'Compact')&&
	        (xUI.XPS.timesheetImages.imageAppearance == 0)
	    ){
	        xUI.XPS.timesheetImages.imageAppearance = 1.0;
	        appearance = 1.0;
	    };//*/
	};
if(xUI.viewMode == 'PageImage'){
//パラメータ算出
	var documentColor = xUI.sheetborderColor;
	if (appearance > 0.5){
		documentColor = nas.colorAry2Str(add(
			mul(nas.colorStr2Ary(xUI.sheetborderColor),1 - ((appearance - 0.5) * 2)),
			mul(nas.colorStr2Ary(xUI.sheetbaseColor),((appearance - 0.5) * 2))
		));
	};
//罫線色をアピアランス値に合わせて設定　PageImageモードのみ
//	$('.Sep'       ).css('border-color',documentColor);
//	$('.tlhead'    ).css('border-color',documentColor);
//	$('.trackLabel').css('border-color',documentColor);
	nas.HTML.setCssRule('div.sheetHeader','border-color:'+ documentColor+';','both');

	nas.HTML.setCssRule('.tlhead'     ,'border-color:'+ documentColor+';','both');
	nas.HTML.setCssRule('th.headerLabel','color:'+ documentColor+';border-color:'+ documentColor +';','both');

	nas.HTML.setCssRule('.trackLabel' ,'border-color:'+ documentColor+';','both');
	nas.HTML.setCssRule('td.sheetbody','border-color:'+ documentColor+';','both');
	nas.HTML.setCssRule('td.soundbody','border-color:'+ documentColor+';','both');
	nas.HTML.setCssRule('td.ltSep'    ,'border-bottom-color:'+ documentColor+';','both');
	nas.HTML.setCssRule('td.ltSep_Blank','border-bottom-color:'+ documentColor+';','both');
//	nas.HTML.setCssRule('td.Sep'      ,'border-color:'+ documentColor+';','both');
//テキストラベル色設定
//	$('.Sep'       ).css('color',documentColor);
//	$('.tlhead'    ).css('color',documentColor);
//	$('.trackLabel').css('color',documentColor);
//	nas.HTML.setCssRule('td.Sep'      ,'color:'+ documentColor+';','both');
	nas.HTML.setCssRule('.tlhead'     ,'color:'+ documentColor+';','both');
	nas.HTML.setCssRule('.trackLabel' ,'color:'+ documentColor+';','both');
	nas.HTML.setCssRule('.pgHeader-label','color:'+ documentColor+';','both');
	nas.HTML.setCssRule('.timeguide','color:'+ documentColor+';','both');
	nas.HTML.setCssRule('.frameguide','color:'+ documentColor+';','both');
	nas.HTML.setCssRule('.cameralabel' ,'color:'+ xUI.sheetborderColor+';','both');//消さない
//タグ配色設定
}
//シートマージン設定
    xUI.applySheetMargin((appearance > 0));
//画像設定
    if(xUI.viewMode == 'Compact'){
        document.querySelectorAll('.overlayNoteImage').forEach((e) =>{
        		e.style.display      = 'inline';//表示
        		e.style.mixBlendMode = xUI.XPS.noteImages.imageBlendMode;//設定モード
        		e.style.opacity      = xUI.XPS.noteImages.imageAppearance;//設定表示濃度
        });
    }else{
        if(xUI.viewMode == 'PageImage'){
        	document.querySelectorAll('.overlayDocmentImage').forEach((e) =>{
        		e.style.display      = 'inline-block';//表示
        		e.style.mixBlendMode = 'darken';//'multiply';//xUI.XPS.timesheetImages.imageBlendMode;
        		e.style.opacity      = (appearance > 0.5)? 1.0:((appearance) / 0.50);//xUI.XPS.timesheetImages.imageAppearance;
	        });
        }else{
//trad = WordProp
        	document.querySelectorAll('.overlayDocmentImage').forEach(function(e){
		        e.style.display      = 'inline-block';//トレーラーは表示
        		e.style.opacity      = appearance ;//xUI.XPS.timesheetImages.imageAppearance;
//        		e.style.opacity      = 1;//imageAppearance値にかかわらず 100%;
	        });
        	document.querySelectorAll('.pageDocumentImage').forEach(function(e){
		        e.style.display      = 'none';//画像は非表示
	        });
            
        };
        if(update) xUI.XPS.timesheetImages.imageAppearance = appearance;
        sync('docImgAppearance');;
    };
    return appearance;
}
/*
timeSheetDocumentImageの調整
Xps.TimesheetImageコレクション内のオブジェクト1点ずつのoffsetを調整する
mode変数は、キーボード及び微調整ボタンの編集プロパティを示す inclination|move|scale
scale変数は２次元
*/
xUI.imgAdjust = {
    targetImg : null,
    backup    :{
        offset    : new nas.Offset(),
        scale     : new nas.Scale(1,1)
    },
    mode      : 'scale',
    baseline  : new nas.UnitValue('65mm')
}
/*Adjust control*/
xUI.imgAdjust.ctp0 = document.createElement('div');
xUI.imgAdjust.ctp0.id = 'uiHandle01';
xUI.imgAdjust.ctp0.className = 'node_handle node_handle-red';
xUI.imgAdjust.ctp0.innerHTML = '<svg class="float" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="red" stroke-width="2" d="M 12,1 L 23,12 L 12,23 L 1,12 z" /><path fill="none" stroke="red" stroke-width="1" d="M 12,1 L 12,11 M 23,12 L 13,12 M 12,23 L 12,13 M 1,12 L 11,12" /></svg>';

xUI.imgAdjust.ctp1 = document.createElement('div');
xUI.imgAdjust.ctp1.id = 'uiHandle02';
xUI.imgAdjust.ctp1.className = 'node_handle node_handle-green';
xUI.imgAdjust.ctp1.innerHTML = '<svg class="flaot" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="green" stroke-width="2" d="M 1,12 A 11 11 10 1 0 23,12 A 11 11 10 1 0 1,12" /><path fill="none" stroke="green" stroke-width="1" d="M 12,1 L 12,11 M 23,12 L 13,12 M 12,23 L 12,13 M 1,12 L 11,12" /></svg>';

/*
 * 画像位置補正UIの展開|収容
 */
	xUI.imgAdjust.expand = function(status){
		if(typeof status == 'undefined') status = !($('#imgAdjustDetail').isVisible());
		if(status){
			$('#imgAdjustDetail').show();
//			$('#optionPanelImgAdjust').width(152);
			$('#formImgAdjust').height(236);
			document.getElementById('imgAdjustExpand').innerHTML = '▲';
		}else{
			$('#imgAdjustDetail').hide();
//			$('#optionPanelImgAdjust').width(152);
			$('#formImgAdjust').height(134);
			document.getElementById('imgAdjustExpand').innerHTML = '▼';
		};
	}
/*
 * モード変更
 */
    xUI.imgAdjust.setMode = function(mode){
        if(typeof mode == 'undefined') mode = ["inclination","move","scale"][["scale","inclination","move"].indexOf(this.mode)];
        if(["inclination","move","scale"].indexOf(mode) < 0) return this.mode;
        this.mode = mode;
        document.getElementById('imgAdjustStatus').src = [
            "/remaping/images/ui/imgStatHolizon.png",
            "/remaping/images/ui/imgStatMove.png",
            "/remaping/images/ui/imgStatResize.png"
        ][["inclination","move","scale"].indexOf(this.mode)];
        return this.mode;
    }
/*
 *  キー入力及びボタン操作による詳細編集
 */
    xUI.imgAdjust.adjust = function(e){
        console.log(e);
            var value = 1;
        if ((e.target.id == 'imgAdjustUp')){
            value = value * -2;
        }else if((e.target.id == 'imgAdjustDown')){
            value = value * 2;
        }else if((e.target.id == 'imgAdjustLeft')){
            value = value * -1;
        }else if((e.target.id == 'imgAdjustRight')){
            value = value * 1;
        };
        if (this.mode == 'inclination'){
//inclination 0.1|0.05°
            this.targetImg.offset.r.setValue(Math.floor(this.targetImg.offset.r.as('degrees')*20 + value)/20+'degrees');// 1/20°(0.05°)刻み
        }else if(this.mode == 'move'){
//move 0.1mm
            if(Math.abs(value) == 1){
                this.targetImg.offset.x.setValue(Math.floor(this.targetImg.offset.x.as('mm')*10 + value)/10+'mm');
            }else{
                this.targetImg.offset.y.setValue(Math.floor(this.targetImg.offset.y.as('mm')*5 + value)/5+'mm');
            };
        }else if(this.mode == 'scale'){
//scale 0.1|0.05%
            if(Math.abs(value) == 1){
                this.targetImg.scale.x.setValue(Math.floor(this.targetImg.scale.x.as('%')*20 + value)/20+'%');// 1/20%(0.05%)刻み
            }else{
                this.targetImg.scale.y.setValue(Math.floor(this.targetImg.scale.y.as('%')*10 + value)/10+'%');// 1/20%(0.05%)刻み
            };
        };
console.log(this.targetImg.scale);
        this.apply();
    }
/*
    ドキュメント画像の配置を反映
    xUI.imgAdjust.targetImgの設定が必要
    引数は、offset,scaleを分けて与える object|string
*/
    xUI.imgAdjust.apply = function (offset,scale){
        if(! this.targetImg) return;
        if(typeof offset != 'undefined') this.targetImg.offset.setValue(offset.toString());
        if(typeof scale  != 'undefined') this.targetImg.scale.setValue(scale.toString());
console.log("translate(" + this.targetImg.offset.position.toString('px')+") scale("+ this.targetImg.scale.toString()+") rotate("+ this.targetImg.offset.r.as('degrees')+"deg)");
        this.targetImg.img.style.transformOrigin = (this.targetImg.offset.position.x.as('px') + xUI.XPS.sheetLooks.SheetLeftMargin) +'px '+ ( - this.targetImg.offset.position.y.as('px') + xUI.XPS.sheetLooks.SheetHeadMargin)+ 'px';
        this.targetImg.img.style.transform = "scale("+ this.targetImg.scale.toString()+")"+" rotate("+ this.targetImg.offset.r.as('degrees')+"deg)"+" translate(" + this.targetImg.offset.position.toString('px')+")";
        this.sync();
        return this;
    }
/*オフセットとスケールを初期化する*/
    xUI.imgAdjust.reset = function (){
        if(! this.targetImg) return;
        xUI.imgAdjust.apply('0mm,0mm,0degrees','100%,100%');
    }
/*バックアップを書き戻す*/
    xUI.imgAdjust.restore = function (){
        if(! this.targetImg) return;
        xUI.imgAdjust.apply(this.backup.offset,this.backup.scale);
    }
/*編集UIの値を反映*/
    xUI.imgAdjust.chkValue = function(idx){
        if(! this.targetImg) return;
        if(idx == 'imgAdjustRotation'){
            this.targetImg.offset.r.setValue(document.getElementById('imgAdjustRotation').value +'degrees');
        }else if(idx == 'imgAdjustScaleX'){
            this.targetImg.scale.x.setValue(document.getElementById('imgAdjustScaleX').value +'%');
        }else if(idx == 'imgAdjustScaleY'){
            this.targetImg.scale.y.setValue(document.getElementById('imgAdjustScaleY').value +'%');
        }else if(idx == 'imgAdjustPositionX'){
            this.targetImg.offset.x.setValue(document.getElementById('imgAdjustPositionX').value +'mm');
        }else if(idx == 'imgAdjustPositionY'){
            this.targetImg.offset.y.setValue(document.getElementById('imgAdjustPositionY').value +'mm');
        };
        this.apply();
    }
/*編集対象のイメージオフセットをUIに同期*/
    xUI.imgAdjust.sync = function(){
        document.getElementById('imgAdjustRotation').value  = Math.round(this.targetImg.offset.r.as('degrees')*100)/100;
        document.getElementById('imgAdjustScaleX').value    = Math.round(this.targetImg.scale.x.as(10000))/100;
        document.getElementById('imgAdjustScaleY').value    = Math.round(this.targetImg.scale.y.as(10000))/100;
        document.getElementById('imgAdjustPositionX').value = Math.round(this.targetImg.offset.x.as('mm')*100)/100;
        document.getElementById('imgAdjustPositionY').value = Math.round(this.targetImg.offset.y.as('mm')*100)/100;
    }
//原点コントロールハンドラ(保留　未使用)
    xUI.imgAdjust.handleMove_0 = function(e){
				var pgOffset=document.getElementById('uiHandle01').parentNode.getBoundingClientRect();
				$("#uiHandle01").css({ 
					top:e.pageY  - $(target).data("clickPointY") - ( window.scrollY + pgOffset.top  ) +"px",
					left:e.pageX - $(target).data("clickPointX") - ( window.scrollX + pgOffset.left ) +"px"
				});
				$("#uiHandle02").css({ 
					top:e.pageY  - $(target).data("clickPointY") - ( window.scrollY + pgOffset.top  ) + xUI.imgAdjust.guiOffset.x.as('px') +"px",
					left:e.pageX - $(target).data("clickPointX") - ( window.scrollX + pgOffset.left ) + xUI.imgAdjust.guiOffset.y.as('px') +"px"
				});
    }
/*
    編集を反映させて調整モードを抜ける
 */
    xUI.imgAdjust.close = function (){
        if(! this.targetImg) return;
        this.backup.offset.setValue(0,0,0);//backup clear
        this.backup.scale.setValue(1,1);
        this.targetImg.img.parentNode.style.pointerEvents = 'none';
        this.targetImg = null;//編集対象をクリア
        this.ctp0.parentNode.removeChild(this.ctp1);
        this.ctp0.parentNode.removeChild(this.ctp0);
    }
/*
    ドキュメント画像配置調整機能初期化
*/
    xUI.imgAdjust.startup = function (pgid){
        var currentPageId = Math.floor(xUI.Select[1]/nas.FCT2Frm(xUI.XPS.sheetLooks.PageLength,new nas.Framerate(xUI.XPS.sheetLooks.FrameRate).rate));
        if(typeof pgid == 'undefined') pgid = currentPageId;
        var pgOrigin  = [0,pgid*nas.FCT2Frm(xUI.XPS.sheetLooks.PageLength,new nas.Framerate(xUI.XPS.sheetLooks.FrameRate).rate)];
        var focusCell = (pgid == currentPageId)? xUI.Select:pgOrigin;
        this.targetImg = xUI.XPS.timesheetImages.members[pgid];//編集対象を設定
        this.backup.offset.setValue(this.targetImg.offset.toString());
        this.backup.scale.setValue(this.targetImg.scale.toString());//backup
        this.baseline.setValue(xUI.getAreaWidth('document'));//mm | px
        xUI.selectCell(focusCell);//シートセルを再選択して表示を整える
        if((xUI.XPS.timesheetImages.imageAppearance == 0)||(xUI.XPS.timesheetImages.imageAppearance == 1))
            xUI.setAppearance(0.5,true);//画像が表示されていない場合は表示させる

        xUI.imgAdjust.sync();
//this.targetImg.offset.setValue('2mm','3mm','-45d');
//this.targetImg.scale.setValue(1.0,0.6);
//原点オフセット初期値 [document.getElementById('printPg'+(pgid+1)).offsetTop - document.getElementById(pgOrigin.join('_')).offsetTop + 'px',document.getElementById(pgOrigin.join('_')).offsetLeft +'px'];//キーエレメントの位置
;//sheetLooksの値
/*
this.targetImg.offset.setValue([
    xUI.XPS.sheetLooks.SheetLeftMargin + xUI.XPS.sheetLooks.CellWidthUnit,
    xUI.XPS.sheetLooks.SheetHeadMargin + xUI.XPS.sheetLooks.CellWidthUnit
    ]);//*/
//画像調整UI配置
        this.targetImg.img.parentNode.style.pointerEvents = 'auto';
        this.targetImg.img.parentNode.appendChild(this.ctp0);
        this.targetImg.img.parentNode.appendChild(this.ctp1);
            xUI.imgAdjust.ctp0.style.left = xUI.XPS.sheetLooks.SheetLeftMargin - (xUI.imgAdjust.ctp0.clientWidth / 2)  +'px';
            xUI.imgAdjust.ctp0.style.top  = xUI.XPS.sheetLooks.SheetHeadMargin - (xUI.imgAdjust.ctp0.clientHeight / 2) +'px';
            xUI.imgAdjust.ctp1.style.left = xUI.XPS.sheetLooks.SheetLeftMargin + xUI.imgAdjust.baseline.as('px') - (xUI.imgAdjust.ctp1.clientWidth / 2) + 'px';
            xUI.imgAdjust.ctp1.style.top  = xUI.XPS.sheetLooks.SheetHeadMargin - (xUI.imgAdjust.ctp1.clientHeight / 2) +'px';
//画像調整UI原点(CT-0)初期化
        $('#uiHandle01').mousedown(function(e){
            var target = e.target;
            $(target)
                .data("clickPointX" , e.pageX - $("#uiHandle01").offset().left)
                .data("clickPointY" , e.pageY - $("#uiHandle01").offset().top);
        $('#uiHandle01').css('cursor','none');
            $(document).mousemove(function(e){
//画像位置の調整 テキストボックスのパラメータを連続して更新
				var pgOffset=document.getElementById('uiHandle01').parentNode.getBoundingClientRect();
				$("#uiHandle01").css({ 
					top:e.pageY  - $(target).data("clickPointY") - ( window.scrollY + pgOffset.top  ) +"px",
					left:e.pageX - $(target).data("clickPointX") - ( window.scrollX + pgOffset.left ) +"px"
				});
				$("#uiHandle02").css({ 
					top:e.pageY  - $(target).data("clickPointY") - ( window.scrollY + pgOffset.top  ) + "px",
					left:e.pageX - $(target).data("clickPointX") - ( window.scrollX + pgOffset.left ) + xUI.imgAdjust.baseline.as('px') +"px"
				});
//差分をonchangeを保留してテキストボックスに反映させる 解決はマウスアップイベント
                document.getElementById('imgAdjustPositionX').value = xUI.imgAdjust.targetImg.offset.x.as('mm') + new nas.UnitValue(xUI.imgAdjust.ctp0.offsetLeft + (xUI.imgAdjust.ctp0.clientWidth / 2)  - xUI.XPS.sheetLooks.SheetLeftMargin + 'px','mm').as('mm') * -1;//as 'mm'
                document.getElementById('imgAdjustPositionY').value = xUI.imgAdjust.targetImg.offset.y.as('mm') + new nas.UnitValue(xUI.imgAdjust.ctp0.offsetTop  + (xUI.imgAdjust.ctp0.clientHeight / 2) - xUI.XPS.sheetLooks.SheetHeadMargin + 'px','mm').as('mm') * -1;//as 'mm'
            }).mouseup(function(e){
console.log('unbind');
//移動をoffsetに展開して解決
            xUI.imgAdjust.apply(
                document.getElementById('imgAdjustPositionX').value+'mm,'+
                document.getElementById('imgAdjustPositionY').value+'mm,'+
                document.getElementById('imgAdjustRotation').value+'degrees'
            );
//ctp位置リセット
            xUI.imgAdjust.ctp0.style.left = xUI.XPS.sheetLooks.SheetLeftMargin - (xUI.imgAdjust.ctp0.clientWidth / 2)  +'px';
            xUI.imgAdjust.ctp0.style.top  = xUI.XPS.sheetLooks.SheetHeadMargin - (xUI.imgAdjust.ctp0.clientHeight / 2) +'px';
            xUI.imgAdjust.ctp1.style.left = xUI.XPS.sheetLooks.SheetLeftMargin + xUI.imgAdjust.baseline.as('px') - (xUI.imgAdjust.ctp1.clientWidth / 2) + 'px';
            xUI.imgAdjust.ctp1.style.top  = xUI.XPS.sheetLooks.SheetHeadMargin - (xUI.imgAdjust.ctp1.clientHeight / 2) +'px';

                $(document).unbind("mousemove");
                $('#uiHandle01').css('cursor','move');
                $(document).unbind("mouseup");
            });
        });
//画像調整UI制御点(CT-1)初期化
        $('#uiHandle02').mousedown(function(e){
            var target = e.target;
            $(target)
                .data("clickPointX" , e.pageX - $("#uiHandle02").offset().left)
                .data("clickPointY" , e.pageY - $("#uiHandle02").offset().top);
        $('#uiHandle02').css('cursor','none');
            $(document).mousemove(function(e){
//画像サイズ・傾斜の調整 テキストボックスのパラメータを連続して更新
				var pgOffset=document.getElementById('uiHandle01').parentNode.getBoundingClientRect();
				$("#uiHandle02").css({ 
					top:e.pageY  - $(target).data("clickPointY") - ( window.scrollY + pgOffset.top  ) +"px",
					left:e.pageX - $(target).data("clickPointX") - ( window.scrollX + pgOffset.left ) +"px"
				});
//差分をonchangeを保留してテキストボックスに反映させる　解決はマウスアップイベント
                var unitPt = [xUI.imgAdjust.ctp1.offsetLeft - xUI.imgAdjust.ctp0.offsetLeft,xUI.imgAdjust.ctp1.offsetTop - xUI.imgAdjust.ctp0.offsetTop];//正規化座標（[x,y]as px）
                document.getElementById('imgAdjustRotation').value = nas.radiansToDegrees(xUI.imgAdjust.targetImg.offset.r.as('radians') - Math.atan2(unitPt[1],unitPt[0]));//as 'degrees' ctp0 - ctp1 間の傾斜角度
                document.getElementById('imgAdjustScaleX').value = Math.round(xUI.imgAdjust.targetImg.scale.x.as(10000) * (xUI.imgAdjust.baseline.as('px')/nas.length(unitPt)))/100 ;//as percent
                document.getElementById('imgAdjustScaleY').value = Math.round(xUI.imgAdjust.targetImg.scale.y.as(100) * parseFloat(document.getElementById('imgAdjustScaleX').value))/100 ;//as percent
            }).mouseup(function(e){
console.log('unbind');
//移動をoffset,scale に展開して解決
            xUI.imgAdjust.apply(
                document.getElementById('imgAdjustPositionX').value +'mm,'+
                document.getElementById('imgAdjustPositionY').value +'mm,'+
                document.getElementById('imgAdjustRotation').value  +'degrees',
                document.getElementById('imgAdjustScaleX').value    +'%,'+
                document.getElementById('imgAdjustScaleY').value    +'%'
            );
//ctp位置リセット
            xUI.imgAdjust.ctp1.style.left = xUI.XPS.sheetLooks.SheetLeftMargin + xUI.imgAdjust.baseline.as('px') - (xUI.imgAdjust.ctp1.clientWidth / 2) + 'px';
            xUI.imgAdjust.ctp1.style.top  = xUI.XPS.sheetLooks.SheetHeadMargin - (xUI.imgAdjust.ctp1.clientHeight / 2) +'px';

                $(document).unbind("mousemove");
                $('#uiHandle02').css('cursor','move');
            });
        });
//初期化終了
        xUI.imgAdjust.apply();
        
    }
/*
    各調整UIの初期化
    type inclination|scale|position
 */
    xUI.imgAdjust.init = function(type){
        if(typeof type == 'undefined') type = 'inclination';
        switch(type){
        case 'inclination':
//回転(傾き)入力
        break;
        case 'scale':
        break;
        case 'position':
        break;
        default :
//クリア
            //カーソルクリア
            //UIバーツ非表示
            //マウス入力解除
            //キー入力解除
        }
    }

/*
    @params {Boolean} opt
        戻り値を文字列に

    現在のパネルの表示状態を返す
    アイコンバーパネルのサブidは含まない
*/
xUI.checkToolView = function(opt){
    var result = [];
    var ix = 0;
    for(var prp in xUI.panelTable){
        if(document.getElementById(xUI.panelTable[prp].elementId)){
            result.push([
                prp,
                xUI.panelTable[prp].elementId,
                ($("#"+xUI.panelTable[prp].elementId).isVisible())? 1:0
            ]);
        }else{
            let v = 0;
            if((xUI.panelTable[prp].type == 'float')&&(xUI.toolView)) v = xUI.toolView[ix];
            result.push([
                prp,
                xUI.panelTable[prp].elementId,
                v
            ]);
        };
        ix ++;
    };
console.log (result.join('\n'));
    if(opt) return Array.from(result,e => e[2]).join('');
    return result;
};//デバッグ｜チェック用 仮関数
/**
    @params {string} toolView
    toolView 文字列
    @returns {string}
        表示状態を表す文字列（checkToolViewの出力と同じ）
    引数・戻値は2進数値文字列

    またはキーワード引数
full        フルサイズUI 
minimum     フルサイズUI環境下で最小のツールセット（入力可能）
default     特に指定のない場合の標準セット
compact     コンパクトUI
restriction 動作制限下でのセット
{
    'full'   :["account_box","pmui","headerTool","inputControl","sheetHeaderTable","memoArea"],
    'minimum':["headerTool","inputControl"],
    'default':["account_box","pmui","headerTool","inputControl"],
    'compact':["account_box","headerTool","inputControl"]
}
配列が引数として渡された場合は、配列全体を連結"join('')"して文字列とする
// */
xUI.setToolView = function(toolView){
    if(toolView instanceof Array) toolView = toolView.join('');//連結
    if(typeof toolView == 'undefined') toolView = 'default';//引数が与えられない場合はキーワード'default'
    var currentView = [];var ix = 0;
    for (var prp in xUI.panelTable){
        if(document.getElementById(xUI.panelTable[prp].elementId)){
            currentView.push(($('#'+xUI.panelTable[prp].elementId).isVisible())? 1:0);
        }else{
            currentView.push((xUI.toolView)?xUI.toolView[ix]:ToolView[ix]);
        };
        ix ++;
    };

console.log('currentView :'+currentView.join(''));
console.log('currentView :'+xUI.checkToolView(true));

    xUI.toolView = currentView;//配列で控える
    currentView  = currentView.join("");//文字列化

    if(String(toolView).match(/^[01]+$/)){
            xUI.toolView = Array.from(toolView);
    }else{
console.log(toolView);
        if(xUI.restriction) toolView = 'restriction';
        if(String(toolView).match(/full|minimum|default|compact|restriction/i)){
            var limit = {
                restriction:0,
                minimum:1,
                compact:2,
                default:3,
                full:4
            };
            var tv = [];ix = 0;
            for (var prp in xUI.panelTable){
                if(prp != '_exclusive_item_'){
                    if(
                        (document.getElementById(xUI.panelTable[prp].elementId))&&
                        (xUI.panelTable[prp].uiOrder >= 0)
                    ){
//UIオーダーが存在する
console.log(xUI.panelTable[prp]);
                        tv.push((xUI.panelTable[prp].uiOrder <= limit[toolView])?1:0);
                    }else if(
                        (xUI.panelTable[prp].type == 'modal')|| 
                        (xUI.panelTable[prp].uiOrder < 0)
                    ){
                        tv.push(0);
                    }else{
                        tv.push((xUI.toolView)?xUI.toolView[ix]:ToolView[ix]);
                    };
                }
                ix ++;
            };
            toolView = tv.join('');
        }else{
            toolView = ToolView;
        };
    };
console.log(toolView);
    if(toolView != currentView){
//UI表示状態設定
        var changePost = false;
        var ix = 0;
        for (var prp in xUI.panelTable){
            if(prp != '_exclusive_items_'){
                if(xUI.panelTable[prp].elementId == 'toolbarPost'){
                    changePost = (String(toolView).charAt(ix)==currentView.charAt(ix))? false:true;
                }else{
console.log(prp,(String(toolView).charAt(ix)=="0")?"hide":"show")
                    if(document.getElementById(xUI.panelTable[prp].elementId)) xUI.sWitchPanel(
                        prp,
                        (String(toolView).charAt(ix)=="0")?"hide":"show"
                    );
                };
            };
            ix ++;
        };
/*        xUI.adjustSpacer();
        if(changePost){
            xUI.sWitchPanel('ibC','switch');
            xUI.ibCP.switch(xUI.ibCP.activePalette);
        };// */
    };
console.log([toolView,xUI.toolView]);
    return toolView;
}
/* TEST
xUI.setToolView()
*/
/**
	@params   {String} modeString
	@params   {Function} callback
	@returns  {String}

	xUI.setDocumentMode(modeString)
	documentMode&&viewMode 変更  引数がなければ変更なし
	引数がモードキーワード以外ならば、モードを順次切り替え
	画面リセットを伴う
	callbackを引き渡す
	現在のdocumentMode値を返す

	page	  ページモード
	pageImage ページ画像モード
	scroll	スクロールモード
*/
xUI.setDocumentMode =function(modeString,callback){
	if(typeof modeString == 'undefined') return xUI.XPS.documentMode;
	switch (modeString){
	case	'PageImage':
	case	'pageImage':
		xUI.viewMode = 'PageImage';
		xUI.XPS.documentMode = 'pageImage';
        document.getElementById('sheetHeaderTable').style.display='none';
		(['extSig','memoArea']).forEach(function(e){xUI.sWitchPanel(e,'hide')})
        xUI.resetSheet(undefined,undefined,callback);
        return 'pageImage';
	break;
	case	'WordProp':
	case	'page':
		xUI.viewMode = 'WordProp';
		xUI.XPS.documentMode = 'page';
	break;
	case	'Compact':
	case	'scroll':
		xUI.viewMode = 'Compact';
		xUI.XPS.documentMode = 'scroll';
	break;
	default :
		var modelist=["WordProp","Compact","PageImage"];
		return xUI.setDocumentMode(modelist[(modelist.indexOf(xUI.viewMode)+1) % modelist.length]);
	};
    document.getElementById('sheetHeaderTable').style.display='inline';
	(['extSig','memoArea']).forEach(function(e){xUI.sWitchPanel(e,'show')})
//    xUI.adjustSpacer();
    xUI.resetSheet(undefined,undefined,callback);
	return xUI.XPS.documentMode;
}
/*TEST
	xUI.setDocumentMode('pageImage');
*/
/**
    制限モードへ移行
    
*/
xUI.setRestriction = function(mode){
    if(typeof mode == 'undefined') mode=true;
    if(mode){
//true Restriction ON
        xUI.restriction = true;
        xUI.viewMode    = "WordProp";//?
        xUI.resetSheet(undefined,undefined,function(){
            xUI.setToolView('minimum');
            xUI.flipRefColumns('hide');
        });
    }else{
//false Restriction OFF
        xUI.restriction = false;
        xUI.viewMode    = "WordProp";//?
        xUI.resetSheet(undefined,undefined,function(){
            xUI.setToolView('default');
            xUI.flipRefColumns('show');
        });
    };
    return xUI.restriction;
}
/**
    xUI.setDocumentStatus(myCommnad)
    ドキュメントのステータスを変更する
    引数：キーワード  activate/deactivate/checkin/checkout/abort/reseipt //sink/float
    ステータス変更成功時は、モードにあわせてアプリケーションのモードを設定
    引数がカラの場合は、現在のステータスを返す
    非同期のサービスレスポンス待ちなのでコールバック渡し
    activate        from Fixed/Hold     to Active
    deactivate      from Active         to Hold
    checkin         from Startup/Fixed  to Active
    checkout        from Active         to Fixed
    abort           from Fixed          to Aborted
    reseipt         from Fixed          to Startup
    flaot                                copy to Floating 廃止
      if(unactive)  from Startup/Fixed/Hold     No Change
      if(active)    from Active                 to Hold
    sink            from Floating       copy to Startup/Fixed
*/
xUI.setDocumentStatus = function(myCommand){
    if (typeof myCommand == 'undefined') return this.XPS.currentStatus;
    switch (myCommand){
        case 'float':
        // float /現在のドキュメントを複製して自由編集状態にする  元ドキュメントはActive状態を解除する
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
            //現テータスがStartup/Fixedの場合新しいジョブの名称が必要  ジョブ名は第二引数で置く  ジョブIDは繰り上がる 
//                       var newJobName = (arguments[1])? arguments[1]:xUI.XPS.update_user.split(':')[0];
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
    uiMode変更  引数がなければ変更なし
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
	$('#pmcui').show();
	$('#pmfui').hide();
	$('span.subControl_TC').each(function(){$(this).hide()})
    $("li.auiMenu").each(function(){$(this).hide()});
    $("li.cuiMenu").each(function(){$(this).show()});
    $("li.fuiMenu").each(function(){$(this).hide()});
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
        if(xUI.XMAP.dataNode){return xUI.uiMode;}
    
//        if(xUI.XPS.currentStatus.content.indexOf("Floating")<0){return xUI.uiMode;}
         //floating で必要なメニュー
         /*
         新規登録  カレントドキュメントを現在のリポジトリに登録する
         
         */
              xUI.viewOnly = false;//メニュー切替
    $('#ddp-man').hide();
	$('#pmaui').hide();
	$('#pmcui').show();
	$('#pmfui').show();
	$('span.subControl_TC').each(function(){$(this).show()})
    $("li.auiMenu").each(function(){$(this).hide()});
    $("li.cuiMenu").each(function(){$(this).hide()});
    $("li.fuiMenu").each(function(){$(this).show()});
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
	$('#pmcui').show();
	$('#pmfui').hide();
	$('span.subControl_TC').each(function(){$(this).show()})
    $("li.auiMenu").each(function(){$(this).show()});
    $("li.cuiMenu").each(function(){$(this).hide()});
    $("li.fuiMenu").each(function(){$(this).hide()});
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
	$('#pmcui').show();
	$('#pmfui').hide();
	$('span.subControl_TC').each(function(){$(this).hide()})
    $("li.auiMenu").each(function(){$(this).hide()});
    $("li.cuiMenu").each(function(){$(this).hide()});
    $("li.fuiMenu").each(function(){$(this).hide()});
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
                nextMode = (! xUI.XMAP.dateReposiroty)? 'floating':'browsing';
            break;
            case "floating":
                nextMode = (! xUI.XMAP.dateReposiroty)? 'management':'browsing';
            break;
            case "browsing":
                nextMode = (! xUI.XMAP.dateReposiroty)? 'floating':'management';
            break;
            case "production":
                nextMode = (! xUI.XMAP.dateReposiroty)? 'floating':'browsing';
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
/*    xUI.ipChg(status boolean)
    入力モード変更 原画|動画モードを切り替えと同時に表示を調整

xUI.ipChg=function(newMode){
    xUI.ipMode =  (newMode)? 1:0 ;
    document.getElementById('iptSlider').innerText = (xUI.ipMode > 0)? '動画' : '原画';
    if(document.getElementById("iptChange").checked != (xUI.ipMode > 0)){
        document.getElementById("iptChange").checked = (xUI.ipMode > 0);
    };
    document.getElementById("iNputbOx").focus();
    return this.ipMode;
};
// */

/**
 *  @params {Boolean}   status
 *    タイムシートセル編集フラグ 切り替えと同時に表示を調整
 */
xUI.edChg=function(status,opt){
    if(this.viewOnly) return xUI.headerFlash('#bb8080');
    this.edchg=status;
    if(document.getElementById("edchg")) document.getElementById("edchg").style.backgroundColor = (this.edchg)? this.editingColor:"";//表示
};
//
/*
 *  @paramas {Number|String} myModes
 *  @params  {Object any} opt
 *
 *    myModes    モードを数値または文字列で指定  数値で格納
 *    opt    オプション引数
 *    編集モードを変更してカラーをアップデートする
 *    リフレッシュつき
 */
xUI.mdChg=function(myModes,opt){
            //編集操作モード  0:通常入力  1:ブロック移動  2:区間編集  3:領域フロート状態
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
        this.floatSourceAddress     = this.Select.slice();    //移動ソースアドレスを退避
        this.selectedColor          = this.inputModeColor.FLOAT;    //選択セルの背景色
//        this.spinAreaColor          = this.inputModeColor.FLOATspin;    //非選択スピン背景色
//        this.spinAreaColorSelect    = this.inputModeColor.FLOATspinselected;    //選択スピン背景色
        this.spinAreaColor          = this.inputModeColor.FLOATselection;    //非選択スピン背景色
        this.spinAreaColorSelect    = this.inputModeColor.FLOATselection;    //選択スピン背景色
        this.selectionColor         = this.inputModeColor.FLOATselection;    //選択領域の背景色
        this.selectionColorTail     = this.inputModeColor.FLOAT;    //
    };
    break;
    case "section":
    case 2:
/*
 *  モード'normal'かつトラックのダブルクリックでセクション編集モードに入る  抜けるには明示的にmdChg('normal')をコールする必要がある
 *  現行でタイムライン種別トラップあり  ダイアログトラックのみ遷移可能
  さらにダイアログトラックでは値のない区間は選択を抑制中
*/
//sectionManipulateOffsetは、ここでは初期化されない
//if((this.XPS.xpsTracks[this.Select[0]].option.match(/dialog|effect|camera/))){}
//if((this.XPS.xpsTracks[this.Select[0]].option=='dialog')){}
if(true){
  if(this.edmode<2){
//      if(this.spin() > 1){this.spinBackup=this.spin();this.spin(1);};//スピン量をバックアップしてクリア ? これ実はいらない？
      this.selectBackup         = this.Select.concat()      ;       //カーソル位置バックアップ
      this.selectionBackup      = this.Selection.concat()   ;       //選択範囲バックアップ
      this.floatSourceAddress   = this.Select.concat()      ;       //移動元ソースアドレスを退避
      this.floatTrack           = this.XPS.xpsTracks[this.Select[0]];//編集破棄の際に復帰するためモード変更時のトラック全体を記録
      this.floatTrackBackup     = this.floatTrack.duplicate()       ;//編集確定時のためトラック全体をバッファにとる

      this.floatSection         = this.floatTrackBackup.getSectionByFrame(this.Select[1]);

      if((this.floatTrack.option =='dialog')&&(! this.floatSection.value)){
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
        this.selectedColor          = this.inputModeColor.SECTION           ;    //選択セルの背景色
        this.spinAreaColor          = this.inputModeColor.SECTIONselection  ;    //非選択スピン背景色
        this.spinAreaColorSelect    = this.inputModeColor.SECTIONselection  ;    //選択スピン背景色
        this.selectionColor         = this.inputModeColor.SECTIONselection  ;    //選択領域の背景色
        this.selectionColorTail     = this.inputModeColor.SECTIONtail       ;    //選択領域の末尾
        this.Mouse.action=false;
};//セクション編集モード遷移
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
//console.log(this.floatSourceAddress);
//console.log(this.floatDestAddress);
//console.log(this.floatSectionId);
//console.log(this.floatSection);
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
//console.log(currentStream);
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
    
//    if(xUI.XPS.xpsTracks[xUI.Select[0]].option.match( /dialog|sound/ ))    SoundEdit.init();
    switch(xUI.XPS.xpsTracks[xUI.Select[0]].option){
    case 'dialog':
    case 'sound' :
        SoundEdit.init();
    break;
    default:
        //NOP
    }
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
    xUI.sectionManipulateOffset は[編集サブモード,選択中のセル（ヘッド）に対するオフセット]  ターゲットから計算する
    
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
//先頭指定  末尾固定で伸縮
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
//末尾指定  先頭固定で伸縮 sectionManipulateOffsetを更新
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
引数：  action
    セクション操作の結果を実際の画面に反映させるメソッド
    Xps.xpsTracks.menber.manipulateSection()に対応するxUI側の処理
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
    xUI.floatSectionId = xUI.XPS.xpsTracks[xUI.Select[0]].getSectionByFrame(trackContents[1]).id();
         xUI.selectCell([xUI.Select[0],trackContents[1]]);
//      xUI.selection([xUI.Select[0],xUI.Select[1]+Math.abs(currentSelection)]);
//        this.selection([
//	        this.Select[0],
//	        trackContents[1]+this.floatSection.duration-1
//        ]);
      xUI.selection([xUI.Select[0],trackContents[1]+trackContents[2]]);
    xUI.scrollStop = false;

    if(xUI.XPS.xpsTracks[xUI.Select[0]].option.match( /dialog|sound/ )) SoundEdit.getProp();
}
/*    xUI.floatTextHi()
引数:なし  モード変数を確認して動作
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
    引数でマクロを受け付ける
    引数が空の場合は標準識別子で返す $TITLE$#$OPUS$[$SUBTITLE$]__s$SCENE$-c$CUT$($TC$)
    
*/
xUI.getFileName=function(myFileName){
//    myResult=(typeof myFileName=="undefined")?"$TITLE$OPUSs$SCENEc$CUT($TC)":myFileName;
//    myResult=(typeof myFileName=="undefined")?"$TITLE$#$OPUS$[$SUBTITLE$]__s$SCENE$-c$CUT$($TC$)":myFileName;
    myResult=(typeof myFileName=="undefined")?"$TITLE$#$OPUS$__s$SCENE$-c$CUT$":myFileName;
    myResult=myResult.replace(/\$TITLE\$/g,this.XPS.title);
    myResult=myResult.replace(/\$SUBTITLE\$/g,this.XPS.subtitle);
    myResult=myResult.replace(/\$OPUS\$/g,this.XPS.opus);
    myResult=myResult.replace(/\$SCENE\$/g,this.XPS.scene);
    myResult=myResult.replace(/\$CUT\$/g,this.XPS.cut);
    myResult=myResult.replace(/\$TIME\$/g,this.XPS.time());
    myResult=myResult.replace(/\$TC\$/g,this.XPS.getTC(this.XPS.time()));
    myResult=myResult.replace(/[\s\.]/g,"");
    myResult=myResult.replace(/:;\/\\|\,\*\?"＜＞/g,"_");//"
    
    return myResult;
}
/*    シートボディフラッシュ
        xUI.flush(content)
        現在のシートの入力領域をすべてcontentで埋める
        戻り値は常にtrue
        これは試験用関数：実用性は無い  確かもう使ってない  20161106
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
/** xUI.UndoBuffer オブジェクト
 * @constractor
 *
 */
xUI.UndoBuffer=function(){
    this.undoStack= []       ;//アンドウスタック
    this.undoPt  = 0         ;//アンドウポインタ初期化
    this.skipCt  = 0         ;//再描画抑制カウンタ初期化
    this.storePt = 0         ;//保存ポインタ初期化
}
/*    undoバッファ初期化
        undoバッファをクリアして初期化
            undoStackのデータ構造

        [セレクト座標,セレクション,入力データストリーム,[セレクト座標,セレクション]]
eg.[
    [0,4],
    [0,0],
    "3,,,6,,,7,,,\n1,,,,,,X,,,\n",
    [0,4],
    [0,0],
]
    または
        [セレクト座標,セレクション,Xpsオブジェクト]
eg.[
    [0,4],
    [0,0],
    {object Xps}
]

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

xUI.activeDocument.undoBuffer.

 */
 
xUI.flushUndoBuf=function(){
    this.inputFlag= "nomal";//入力フラグ["nomal","undo","redo"]
    this.activeDocument.undoBuffer.undoStack= [] ;//アンドウスタック
    if(this.activeDocument.type=='xpst')
        this.activeDocument.undoBuffer.undoStack.push([[0,1],[0,0],'']);
    this.activeDocument.undoBuffer.undoPt  =0 ;      //アンドウポインタ初期化
    this.activeDocument.undoBuffer.skipCt  =0 ;      //再描画抑制カウンタ初期化
    this.activeDocument.undoBuffer.storePt =0 ;     //保存ポインタ初期化
};
/*
    保存ポインタを参照してドキュメントが保存されているか否かを返す関数
    保存状態の変更とリセットも可能

 */
xUI.isStored=function(){return (this.activeDocument.undoBuffer.undoPt==this.activeDocument.undoBuffer.storePt)};//このリザルトが保存状態を表す
xUI.setStored=function(myPt){
    switch(myPt){
    case "current":this.activeDocument.undoBuffer.storePt=this.activeDocument.undoBuffer.undoPt;
    break;
    case "zero":this.activeDocument.undoBuffer.storePt=0;
    break;
    case "force":this.activeDocument.undoBuffer.storePt=-1;//常にfalseになる値
    break;
    default:
        if(myPt>=0){
            this.activeDocument.undoBuffer.storePt=Math.floor(myPt);//正の数値ならその数値を整数でセット
        }
    }
    return (this.activeDocument.undoBuffer.undoPt==this.activeDocument.undoBuffer.storePt);//セット後の状態を戻す
};
/*
    作業用バックアップオブジェクト
    ユーザによる保存指定可能
    明示的に破棄することが可能
    実行環境の違いによる動作の違いはメソッド内で吸収する。

    xUI.buildBackup();現在の作業バックアップをビルドして返す
    バックアップは無名オブジェクトで
        {
            documents:[ドキュメント配列],
            references:[リファレンスデータ配列],
            activeDocumentId:<Number.ID>,
            sessionId:[セッション追跡ID配列],
            undoBuffers:[配列]
        }
    xUI.setBackup();現在の作業バックアップをストアする
    xUI.getBackup();現状のバックアップデータを返す  バックアップデータがない場合はfalse
    xUI.clearBackup();現在のバックアップデータを廃棄する。
*/
xUI.buildBackup=function(){
    var backupClast={
            documents:[this.documents[0].content.toString()],
            references:[],
            activeDocumentId:parseInt(this.activeDocumentId),
            sessionId:[String(this.documents[0].sessionRetrace)]
    };
//    ,undoBuffers:[JSON.stringify(this.documents[0].undoBuffer)]        

    for (var bix=1;bix<this.documents.length;bix++){
        backupClast.documents.push(this.documents[bix].content.toString());
        backupClast.references.push((this.documents[bix].referenceContent)? this.documents[bix].referenceContent.toString():null );
        backupClast.sessionId.push(String(this.documents[bix].sessionRetrace));
//        backupClast.undoBuffers.push(JSON.stringify(this.documents[bix].undoBuffer));
    }
console.log(backupClast);
console.log(JSON.stringify(backupClast));
    return JSON.stringify(backupClast);
}

xUI.restoreBackup=function(BackupStream){
console.log(BackupStream)
    var backupClast= JSON.parse(BackupStream);
console.log(backupClast);
    if(backupClast.documents.length){
        this.documents.clear();//アプリケーションドキュメントバッファクリア
        this.documents.push(
            new xUI.Document(
                new xMap().parsexMap(backupClast.documents[0]),
                null
            )
        );
        this.documents[0].undoBuffer=new xUI.UndoBuffer();
//        Object.assign(this.documents[0].undoBuffer,JSON.parse(backupClast.undoBuffers[0]));
        this.documents[0].sessionRetrace=backupClast.sessionId[0];
        for (var bix=1;bix<backupClast.documents.length;bix++){
//console.log(backupClast.documents[bix]);
//console.log(new Xps().parseXps(backupClast.documents[bix]));
            this.documents.push(
                new xUI.Document(
                    new Xps().parseXps(backupClast.documents[bix]),
                    new Xps().parseXps(backupClast.references[bix-1])
                )
            );
            this.documents[bix].undoBuffer=new xUI.UndoBuffer();
//            Object.assign(this.documents[bix].undoBuffer,JSON.parse(backupClast.undoBuffers[bix]));
            this.documents[bix].sessionRetrace=backupClast.sessionId[bix];
        }
        this.documents.activate(backupClast.activeDocumentId);
        this.resetSheet();
    }
}

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
//localStorageのないブラウザならサーバストア・CGIダウンロード  どちらもダメなら別ウインドウに書き出し
//CGIダウンロード時にはリスタートが実行されるのでその部分の排除コードが必要
//↑==callEcho時点で先行で保存フラグを立てれば自動的に回避可能
//AIRならsaveAs tempSave モーダル保存があった方がよいかも
if(fileBox.saveFile){fileBox.saveFile();}else{writeXPS(this.XPS);}

    }else{
        localStorage.setItem("info.nekomataya.remaping.backupData",this.buildBackup());
/*リファレンスデータ込みでまるごとバックアップクラスタにまとめたので、このエリアは不要
        if(this.referenceXPS){
//            alert(this.referenceXPS.toString());
          localStorage.setItem("info.nekomataya.remaping.referenceData",this.referenceXPS.toString());
//            alert(this.referenceXPS.toString());
        }*/
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
      if(confirm(localize(nas.uiMsg.dmBackupConfirm))) xUI.restoreBackup(myBackup);
    }else{
      alert(localize(nas.uiMsg.dmBackupNodata));//バックアップにデータなし
    }
}
xUI.clearBackup =function(){
    var myBackup=localStorage.removeItem("info.nekomataya.remaping.backupData");
    //var myReference=localStorage.removeItem("info.nekomataya.remaping.backupReference");
    alert(localize(nas.uiMsg.dmBackupClear));//バックアップクリア
}
/**
 *    @params {String}    mode
 *    未保存時の処理をまとめるメソッド
 *    未保存か否かを判別してケースごとのメッセージを出す
 *    ユーザ判断を促して処理続行か否かをリザルトする
 *    modeは以下の何れかの値をとる
 *    null
 *    "saveAndOpenDropFile"
 *    "saveAndOpen"
 */
xUI.checkStored=function(mode){
    if(!mode) mode=null;
    if(xUI.isStored()) return (true);//保存済
//以下未保存の編集内容がある場合の処理
    if(fileBox.saveFile){
        var msg = localize(nas.uiMsg.dmDocumentNosave);//"ドキュメントは保存されていません。保存しますか？"
//ドキュメントの保存・保存しないで更新・処理をキャンセルの３分岐に変更 2013.03.18
//        msg += "\n"+localize(nas.uiMsg.documentConfirmOkCancel)+"\n";
//    nas.HTML.showModalDialog("confirm2",msg,"ドキュメント更新",0,
        var myAction=confirm(msg);
        if(myAction){
//保存処理  後でテンポラリファイルを実装しておくこと        
            fileBox.openMode=mode;//ファイル保存に続行処理モードが必要  デフォルトは保存のみ
            fileBox.saveFile();
            return false;
        }else{
            xUI.setStored("current");sync();return true;// キャンセルの場合は保存しないで続行
        };
    }else{
        var msg  = localize(nas.uiMsg.dmDocumentNosaveExport);//エクスポートしますか？
//        msg += "\n"+localize(nas.uiMsg.dmDocumentConfirmOkCancel)+"\n";//
        var myAction=confirm(msg);
        if(myAction){
//保存処理  後でテンポラリファイルを実装しておくこと        
//            writeXPS();
            callEcho();xUI.setStored("current");sync();
            return true
//HTMLモードの保存は頻繁だと作業性が低下するので一考
//            if(ServiceUrl){callEcho()};//CGIエコー

        }else{
//破棄して続行
            xUI.setStored("current");sync();return true
        };
    };
}

/**
    @params {Number}    x
    @params {Number}    y
    操作スクリーンを加算シフトさせる(オフセットを設定)
    x,y (pixels)
    右揃えのアイテムをシフトした分だけ左に寄せて画面内に収める処理つき
    現在の値に引数を加える。戻りは想定されないので注意
*/
xUI.screenShift = [0,0];
xUI.shiftScreen = function(x,y){
//　body '(top),right,bottom,(left)'
    var currentBox = ($('body').css('padding')).split(' ');
    currentBox.forEach(function(itm,idx,itself){itself[idx]=parseInt(itm);});
    var currentFr = parseInt($('.floating-right').css('padding-right'));
    var currentAb = parseInt($('#account_box').css('padding-right'));
    var currentSh = parseInt($('#sheetHeaderTable').css('padding-right'));
    var currentLp = parseInt($('#optionPanelLogin').css('padding-right'));
//left,raightをリセット
    if(currentBox[3]>0){
       currentFr -= currentBox[3];
       currentAb -= currentBox[3];
       currentLp -= currentBox[3];        
       currentSh -= currentBox[3];
    }
    $('body').css('padding',[y,currentBox[1],currentBox[2],x].join('px ')+'px');
    $('.floating-right').css('padding-right',(currentFr+x)+'px');
    $('#account_box').css('padding-right'   ,(currentAb+x)+'px');
    $('#optionPanelLogin').css('padding-right'    ,(currentLp+x)+'px');
    $('#sheetHeaderTable').css('padding-right'    ,(currentSh+x)+'px');
    xUI.screenShift = [x,y];
    xUI.adjustSpacer();
}
/*  TEST
xUI.shiftScreen(50,50);
*/

/**
 *    画面サイズの変更時等にシートボディのスクロールスペーサーを調整する
 *    固定UIの高さをスクロールスペーサーと一致させる
 *    2010.08.28
 *    引数なし
 *    構成変更に伴い値を調整
 *  タッチデバイス対応により上下切り替えを実装
 *      2024.01.05
 */
xUI.adjustSpacer=function(){
    if(! document.getElementById('fixedHeader')) return;
    if(appHost.touchDevice){
        if(xUI.viewMode == "Compact"){
            var headHeight   = 0;
            var statusOffset = 0;//$("#app_status").height();
            var footHeight   = document.getElementById("fixedHeader").clientHeight;
        }else{
            var headHeight   = 0;
            var statusOffset = 0;
            var footHeight   = document.getElementById("fixedHeader").clientHeight;
        };
    }else{
        if(xUI.viewMode == "Compact"){
            var headHeight   = document.getElementById("fixedHeader").clientHeight;
            var statusOffset = 0;
//            var headHeight   = $("#app_status").offset().top-$("#pMenu").offset().top;
//            var statusOffset = $("#app_status").height();
            var footHeight   = 0;
        }else{
            var headHeight   = document.getElementById("fixedHeader").clientHeight;
            var statusOffset = 0;
            var footHeight   = 0;
        };
        
    };
//一時コード  あとで調整  20180916
    if(document.getElementById("scrollSpaceHd"))
        document.getElementById("scrollSpaceHd").style.height     = (headHeight)+"px";
    document.getElementById("UIheaderScrollH").style.top  = (headHeight+statusOffset)+"px";//qdr1
    document.getElementById("UIheaderFix").style.top      = (headHeight+statusOffset)+"px";//qdr2
    document.getElementById("UIheaderScrollV").style.top  = (headHeight+statusOffset)+"px";//qdr3

//    document.getElementById("areaFixImageField").style.top= (headHeight+statusOffset)+"px";//qdr3.img

    document.getElementById("sheet_body").style.top  = (statusOffset)+"px";

    if(document.getElementById("scrollSpaceFt"))
        document.getElementById("scrollSpaceFt").style.height     = (footHeight)+"px";
}
/**
 *  @params {Number} myScale
 *      Number又は配列 数値一つの場合はX,Y方向のスケールとして扱う
 *      引数なしは、現在のスケールを返す
 *      単一数で0が指定された場合はfitWindow(page/A3 96ppiとして自動計算)
 *  @params {Array|String}   scaleTargetID
 *      設定されたスケールを返す
 *  ターゲットエレメントは以下
 *  "UIheaderFix"
 *  "UIheaderScrollH"
 *  "UIheaderScrollV"
 *  "sheet_body"
 *  ドキュメント内に存在しないエレメントは無視（印字用）
 *  スケーリングするターゲットを別に指定する場合は  idまたはid の配列で
 */
xUI.adjustScale=function(myScale,scaleTargetID){
    if(typeof myScale == "undefined") return xUI.viewScale;
    if(myScale == 0){
        var sheetPage = new nas.Size('297mm','420mm');
        var viewWidth  = window.innerWidth;
        var sheetWidth = sheetPage.x.as('px');
        var widthRatio = viewWidth / sheetWidth;
        var viewHeight  = window.innerHeight - document.getElementById('fixedHeader').clientHeight - 16;//スクロールバー16pxを減じておく
        var sheetHeight = sheetPage.y.as('px');
        var heightRatio = viewHeight / sheetHeight;
        myScale = (widthRatio < heightRatio)? widthRatio : heightRatio;
    };
    xUI.viewScale = Math.round(myScale*100) / 100;
    var myId = (scaleTargetID)?
        scaleTargetID:["UIheaderFix","UIheaderScrollH","UIheaderScrollV","xpsDocumentField"];
    if(! (myId instanceof Array )) myId=[myId];
    for (var ix=0;ix<myId.length;ix++){
        scaleTarget=document.getElementById(myId[ix]);
        if(! scaleTarget) continue;
        if(appHost.platform.match(/CSX|CEP|AIR/)){
          scaleTarget.style.WebkitTransformOrigin="0px 0px";
          scaleTarget.style.WebkitTransform='scale('+xUI.viewScale+')';
        }else{
          scaleTarget.style.transformOrigin="0px 0px";
          scaleTarget.style.transform = 'scale('+xUI.viewScale+')';
        };
    };
    if(xUI.viewScale >= 1) xUI.resetSheet();//リセット
    sync('scale');
    return xUI.viewScale;
}
/*
    @params {Number} opt
    
    スケーリングによるタイムシート部分のズーム処理
    引数をオフセットとして現在の値からスイッチする
    不適合引数の場合は+1で順次表示比率を選択する（大→小）

*/
//xUI.adjustScale(1,0.65);
xUI.zoomSwitch =function(opt){
    if(typeof opt == 'undefined') opt = 1
    this.zoomSwitch.currentPreset = (this.zoomSwitch.currentPreset + opt) % this.zoomSwitch.scalePresets.length;
    return this.adjustScale(this.zoomSwitch.scalePresets[this.zoomSwitch.currentPreset]);
}
xUI.zoomSwitch.scalePresets  = [2,1.5,1,.75,.5,0];
xUI.zoomSwitch.currentPreset = 2;
/*
        xUI.adjustPageImage()
    タイムシートUIを参照画像と一致させる
    一致パラメータは、画像ごとに保持（保存）された情報を使用する
    指定UIを使って編集可能
*/
xUI.adjustPageImage = function(){
    if(
        (xUI.XPS.pageImages.length == 0)||
        (xUI.viewMode != 'PageImage')||
        (true)
    ) return false;
    
}
/* xUI.adjustPageImage// */
/*        xUI.reInitBody(newTimelines,newDuration);
引数:
    newTimelines    Number 新規トラック数
    newDuration    Number 新規継続時間  フレーム数
戻値:
    指定された大きさにシートを書き直す。
    元データは可能な限り維持

    undoの構造上サイズが変わると弊害が大きいので
    undoバッファは初期化する。undoを改装するまでは必須
    undoバッファ改変中  0923

    データ構造上Xpsのメソッドの方が良いので、
    データ改変部分をXPSlibに移動して
    ここではXPSのメソッドを呼び出す形式に変更  2013.02.23
    タイムシートの拡縮をundo対象に拡張    2015.09.14
    新規に現在のXPSの複製をとって、それを拡縮した後putメソッドに渡す
    putメソッド内部でUNDO処理を行う

xUI.putメソッドがobject Xpsに対応したのでこのメソッド自体が意味を失ったので使用されない
 このメソッドは基本廃止

 */
xUI.reInitBody=function(newTimelines,newDuration){
    var newXPS=new Xps(newTimelines,newDuration);
    newXPS.readIN(this.XPS.toString(false));//別オブジェクトとして複製を作る
    //変更してputメソッドに渡す
    newXPS.reInitBody(newTimelines,newDuration);
if(dbg) console.log(newXPS.toString(false));
    this.put(newXPS);
};
/*
*/
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
        documentDepot.currentReference.readIN(xUI.XPS.toString(false));
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
    シートマーカー判定を追加
*/
xUI.drawSheetCell = function (myElement){
    if(typeof myElement =="undefined"){return false;}
    var target=myElement;
    var targetJQ=$("#"+target.id);
    var formPostfix='';
    var marker = null;
    if(target.children.endMarker){
        marker = target.children.endMarker;
    }
    if(this.showGraphic){
        var tgtID=target.id.split("_").reverse();
        var myXps=(tgtID.length==2)? this.XPS:this.referenceXPS;
        formPostfix += (tgtID.length==2)? '':'-ref';
        if (myXps.xpsTracks[tgtID[1]].option.match(/^(efect|sfx|composite)$/)) formPostfix +='-sfx';
        var myStr = myXps.xpsTracks[tgtID[1]][tgtID[0]];
        var drawForm    = '';
        var sectionDraw = false;
        var mySection = myXps.xpsTracks[tgtID[1]].getSectionByFrame(tgtID[0]);
//シートセルに  graph_*クラスがあれば削除
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
                myStr=xUI.trTd(myStr);
            };//trTdにセルIDを渡す
            if (myStr.match(/[-_─━~＿￣〜]{2,}?/)){
//セクション開始判定
              myStr=(this.showGraphic)?"<br>":"<hr>";//
//              if((mySection.startOffset()+mySection.duration-1) != tgtID[0]){}
              if(mySection.startOffset() == tgtID[0]){
                drawForm =(myStr.match(/[_＿]/))? "line":"dialogClose";
              }else{
                drawForm =(myStr.match(/[_＿]/))? "line":"dialogOpen";
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
          case "still":;
          case "timing":;
          case "replacement":;
            if (myStr.match(/[\|｜]/)){
                myStr=(this.showGraphic)?"<br>":"｜";                
                drawForm = "line";
            }
            else if (myStr.match(nas.CellDescription.blankRegex)){
                myStr=(this.showGraphic)?"<br>":"×";                
                drawForm = "blankCloss";
            }
            else if (myStr.match(/[:：]/)){
                myStr=(this.showGraphic)?"<br>":":";                
                drawForm = "wave";
                formPostfix += (tgtID[0] % 2)? '-odd':'-evn';
            }
            else if (myStr.match(/\(([^\)]+)\)/)){
                myStr=(this.showGraphic)?RegExp.$1:xUI.trTd(myStr);
                drawForm = "circle";
           }
           else if (myStr.match(/<([^>]+)>/)){
                myStr=(this.showGraphic)?RegExp.$1:xUI.trTd(myStr);
                drawForm = "triangle";
            }
          break;
          case "camera":;
          case "camerawork":;
        if(! mySection.value) break;
        if(mySection.value.type[0]=='geometry'){
            if (myStr.match(/^[\|｜]$/)){
                myStr=(this.showGraphic)?"<br>":"｜";                
                drawForm = "line";
                formPostfix +='-gom';
            } else if (myStr.match(/^([!|！|\/|／|\\|＼]+)$/)){
                myStr=(this.showGraphic)?"<br>":xUI.trTd(myStr);                
                drawForm = "shake";
                formPostfix +='-gom';
                formPostfix += (tgtID[0] % 2)? '-odd':'-evn';
                if (RegExp.$1.length > 2){
                    formPostfix +='_l';
                }else if(RegExp.$1.length == 2){
                    formPostfix +='_m';
                }else{
                    formPostfix +='_s';
                }
            } else if (myStr.match(/^([:：]+)$/)){
                myStr=(this.showGraphic)?"<br>":xUI.trTd(myStr);                
                drawForm = "wave";
                formPostfix +='-gom';
                formPostfix += (tgtID[0] % 2)? '-odd':'-evn';
                if (RegExp.$1.length > 2){
                    formPostfix +='_l';
                }else if(RegExp.$1.length == 2){
                    formPostfix +='_m';
                }else{
                    formPostfix +='_s';
                }
            } else if (myStr.match(/^[▽]$/)){
                myStr=(this.showGraphic)?"<br>":xUI.trTd(myStr);                
                drawForm = "sectionOpen";
            } else if (myStr.match(/^[△]$/)){
                myStr=(this.showGraphic)?"<br>":xUI.trTd(myStr);                
                drawForm = "sectionClose";
            } else {
                myStr = xUI.trTd(myStr);
            }
        }else if(mySection.value.type[0]=='composite'){
            var drawForms ={"▲":"fi","▼":"fo"};//この配分は仮ルーチン  良くない,"△":"fi","▽":"fo"
if(myStr.match(/^</)) console.log(myStr);
            var drawForms ={"▲":"fi","▼":"fo","]><[":"transition"};//この配分は仮ルーチン  良くない,"△":"fi","▽":"fo"
            if (myStr.match(/^[\|｜↑↓\*＊]$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^[▽]$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^[△]$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^\]([^\]]+)\[$/)){
                if(this.hideSource) myStr="<br>";
            } else {
                myStr = xUI.trTd(myStr);
            }
if(! mySection) console.log(myElement);
            if((mySection.startOffset()+mySection.duration-1) == tgtID[0]){
                var formStr = myXps.xpsTracks[tgtID[1]][mySection.startOffset()];
                drawForm = drawForms[formStr];
                sectionDraw = true;
            }
        }else if(mySection.value.type[0]=='transition'){
            if((mySection.startOffset()+mySection.duration-1) == tgtID[0]){
                var formStr = myXps.xpsTracks[tgtID[1]][mySection.startOffset()];
                drawForm = 'transition';
                sectionDraw = true;
            }
            myStr = xUI.trTd(myStr);
        } else {
                myStr = xUI.trTd(myStr);
            }

          break;
          case "geometry":;
          case "stage":;
          case "stagework":;
myStr = xUI.trTd(myStr); break;
            if (myStr.match(/^[\|｜]$/)){
                myStr=(this.showGraphic)?"<br>":"｜";                
                drawForm = "line";
                formPostfix +='-gom';
            } else if (myStr.match(/^([!|！|\/|／|\\|＼]+)$/)){
                myStr=(this.showGraphic)?"<br>":xUI.trTd(myStr);                
                drawForm = "shake";
                formPostfix +='-gom';
                formPostfix += (tgtID[0] % 2)? '-odd':'-evn';
                if (RegExp.$1.length > 2){
                    formPostfix +='_l';
                }else if(RegExp.$1.length == 2){
                    formPostfix +='_m';
                }else{
                    formPostfix +='_s';
                }
            } else if (myStr.match(/^[▼▽]$/)){
                myStr=(this.showGraphic)?"<br>":xUI.trTd(myStr);                
                drawForm = "sectionOpen";
            } else if (myStr.match(/^[▲△]$/)){
                myStr=(this.showGraphic)?"<br>":xUI.trTd(myStr);                
                drawForm = "sectionClose";
            } else {
                myStr = xUI.trTd(myStr);
            }
          break;
          case "composite":;
          case "effect":;
          case "sfx":;
            if(! mySection.value) break;
if(myStr.match(/^</)) console.log(myStr);
            var drawForms ={"▲":"fi","▼":"fo","]><[":"transition"};//この配分は仮ルーチン  良くない
            if (myStr.match(/^[\|｜↑↓\*＊]$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^▼$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^▲$/)){
                if(this.hideSource) myStr="<br>";                
            } else if (myStr.match(/^\]([^\]]+)\[$/)){
                if(this.hideSource) myStr="<br>";
            } else {
                myStr = xUI.trTd(myStr);
            }
if(! mySection) console.log(myElement);
            if((mySection.startOffset()+mySection.duration-1) == tgtID[0]){
                var formStr = myXps.xpsTracks[tgtID[1]][mySection.startOffset()];
                drawForm = drawForms[formStr];
                sectionDraw = true;
            }
          break;
          case "comment":;
              myStr = xUI.trTd(myStr);
          break;
    }
    target.innerHTML=myStr;
    if(this.showGraphic){    
        if((sectionDraw)&&(drawForm)){        
            xUI.Cgl.sectionDraw([tgtID[1],mySection.startOffset()].join("_"),drawForm,mySection.duration);
        }else{
            if(drawForm) targetJQ.addClass('graph_'+drawForm+formPostfix);
        }
    }
    if(marker) target.appendChild(marker);
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
if(typeof myID == "undefined"){return false;}
//if(typeof arguments[0] =="undefined"){return false;}
    if(! (myID instanceof Array)){
        var target = myID;
        //var target=arguments[0];
    }else{
        var target = (myID[0]=='r') ?
            xUI.referenceXPS.xpsTracks[myID[1]][myID[2]]:
            xUI.XPS.xpsTracks[myID[0]][myID[1]];
    }
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
    return result;

};
//
/*    XPSのプロパティの配列要素を"_"でつないで返す(シート上のidに対応)
        getId(要素名)
    現在は"Select"のみが有効値
    "Selection"ではIDを計算する
*/

xUI.getid=function(name){

    if ((this[name].length==0)||(this[name][0]==null))  return '';
  switch(name){
    case "Selection":
        return add(this.Select,this[name]).join("_");
    case "Select":
        return this[name].join("_");
  }
};
/**
 *  @params {String|Array} ID
 *  @params {Number}       frameOffset
 *    指定のシートセルを選択状態にしてカレントのカーソル位置を返す
 *        xUI.selectCell(HTMLElementID)
 *        xUI.selectCell([myTrack,myFrame]);
 *引数が配列の場合も受け付ける
 *フレームオフセットが加算される
 */
xUI.selectCell = function(ID,frameOffset){
if(! document.getElementById("fixedHeader")) return this.Select;
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

    if ((tRack < 0) || (tRack >= this.XPS.xpsTracks.length)){tRack=(tRack<0)?0:this.XPS.xpsTracks.length-1;};
    if ((fRame < 0) || (fRame >= this.XPS.duration())){fRame=(fRame<0)?0:this.XPS.duration()-1;};
    ID = tRack+'_'+fRame;
//    JQオブジェクトを取得
    var currentJQItem=$("#"+ID);
//    セレクションクリア
        this.selectionHi("clear");
//    フットマーク機能がオンならば選択範囲とそしてホットポイントをフミツケ
    var myTgtId = this.getid('Select');
    if(this.footMark && this.diff(myTgtId)){
        paintColor=this.footstampColor;//                    == footmark ==
    }else{
        paintColor='transparent';//this.sheetbaseColor;//                    == clear ==
    };
    if(document.getElementById(myTgtId))
    document.getElementById(myTgtId).style.backgroundColor=paintColor;

//フレームの移動があったらカウンタ更新フラグ立てる
        var fctrefresh = (fRame==this.Select[1])? false : true ;
//レイヤの移動があったらボタンラベル更新フラグ立てる
        var lvlrefresh = (tRack==this.Select[0])? false : true ;
//セレクト更新
    this.Select=[tRack, fRame];
        if(fctrefresh) sync("fct");//フレームカウンタ同期
        if(lvlrefresh) sync("lvl");//トラックカウンタ同期
//入力同期
    this.selectionHi("hilite");    //選択範囲とホットポイントをハイライト
    this.bkup([this.XPS.xpsTracks[tRack][fRame]]);    //編集前にバックアップする
    var eddt=this.XPS.xpsTracks[tRack][fRame];    //編集済データ取得
//    ヘッドライン
    if(document.getElementById("iNputbOx").value!=eddt){
        document.getElementById("iNputbOx").value=eddt;
//        document.getElementById("iNputbOx").focus();
//        document.getElementById("iNputbOx").select();
    };//編集ラインに送る
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
横方向  セルフォーカスが表示範囲左右一定（２～４？）カラム以内であること（左右別条件に）
かつ移動余裕があること=各条件がシート端からの距離以上であること
スクロール停止フラグが立っていないこと

*/
    if ((this.autoScroll)&&(! this.scrollStop)){
        var targetID=add(xUI.Select,[0,xUI.sectionManipulateOffset[1]]).join('_');
        this.scrollTo(targetID); 
    };
//セルイメージ表示中で、選択セルに画像アイテムがアタッチされている場合、画像をハイライトする
    if(
        (xUI.canvasPaint.active)&&
        (xUI.viewMode == 'Compact')
    ) xUI.hilightImage('cell:'+xUI.Select.join('_'));
//        &&(xUI.XPS.noteImages.getByLinkAddress('cell:'+xUI.Select.join('_')))
    if(
        (!(xUI.edchg))&&
        (!(xUI.canvasPaint.active))&&
        (!(documentFormat.active))
    ){
        document.getElementById("iNputbOx").focus();
        document.getElementById("iNputbOx").select();
    };
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
/**
    @params {String|Array|Ofject} ID
    IDは文字列|配列
    @params {Array}
    xUI.Selectionの値(のみ)を返す(仕様変更 202309)
    
    マルチセレクト
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
        if(document.getElementById("edchg")) document.getElementById("edchg").style.backgroundColor="";//ここでUI表示をクリアする
        this.selectionHi("hilite");
        return Array.from(this.Selection);
    };
//ID値から、セレクションの値を導く
    if(!(ID instanceof Array)) ID=ID.split("_");
    this.Selection=[parseInt(ID[0])-this.Select[0],parseInt(ID[1])-this.Select[1]];
    if(document.getElementById("edchg")) document.getElementById("edchg").style.backgroundColor=this.selectingColor;//ここでUIインジケータ表示
    this.selectionHi("hilite");
    return Array.from(this.Selection);
};

/**
 *  @params {String} Method
 *    選択範囲のハイライト
 *        xUI.selectionHi(メソッド)
 *        範囲が許容外だった場合は範囲を維持して操作無し
 *        メソッドは "hilite"|"footmark"|"clear"
 *        モード遷移毎にカラーを変更するのはモードチェンジメソッドで集中処理
 *        印刷モード時はハイライト関連をスキップ
 */
xUI.selectionHi    =function(Method){
    if(! document.getElementById("spin_V")) return;
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
//新選択範囲をハイライト スタートアドレスに負数を許容  150919
//セクション編集のために選択範囲の末尾を色変え可能に拡張
    for (C=range[0][0];C<=range[1][0];C++){
        for (L=range[0][1];L<=range[1][1];L++){
          try{
            if((C<0) || (L<0)||(C>=this.XPS.xpsTracks.length)||(L>=this.XPS.xpsTracks[C].length)){
//    当座のバグ回避とデバッグ C.Lが操作範囲外だったときの処置 値を表示
//                dbgPut(range.toString());
            }else{
                if (!(this.Select[0] == C && ( ((this.edmode>0)? 1:this.spinValue)+this.Select[1] > L && this.Select[1] <= L)))
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
//                            paintColor=xUI.sheetbaseColor;
                            paintColor='transparent';
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
xUI.spinHi = function(Method){
if(! document.getElementById("spin_V")) return;
//選択ポイントのハイライトおよびスピン範囲のハイライト
    if(! document.getElementById(this.getid("Select"))){if(dbg) dbgPut(this.getid("Select")) ;return;};
    if(Method == "clear") {
        document.getElementById(this.getid("Select")).style.backgroundColor=(this.diff(this.Select)&&(this.footMark))? this.footstampColor:'transparent';
    }else{
        document.getElementById(this.getid("Select")).style.backgroundColor=this.selectedColor;
    };
//    スピン 1 以上を処理 選択範囲内外で色分け
    for(L=this.Select[1]+1;L<((this.edmode > 0)? 1:this.spinValue)+this.Select[1];L++){
        if(L > 0 && L < this.XPS.xpsTracks[0].length){
            if((Method=="clear")){
                if(this.diff([this.Select[0],L]) && this.footMark){
                    document.getElementById(this.Select[0]+"_"+L).style.backgroundColor = this.footstampColor;//スピンエリア表示解除
                }else{
                    if(document.getElementById(this.Select[0]+"_"+L).style.backgroundColor)
                        document.getElementById(this.Select[0]+"_"+L).style.backgroundColor = 'transparent';//スピンエリア表示解除
                };
            }else{
                if(L>(this.Selection[1]+this.Select[1])){
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
/*  足跡（差分表示）をリセット
引数があれば状況をセット
         有効状態ならば、Paint
         無効状態ならば、Clear
         
*/
xUI.footstampReset    =function(opt){
    if(typeof opt != 'undefined'){this.footMark=(opt)?true:false;};
    if(this.footMark){this.footstampPaint()}else{this.footstampClear()};
    if(document.getElementById("ibMfootStamp")){
        document.getElementById("ibMfootStamp").innerHTML=(xUI.footMark)?"✓":"";
    }
}
/*    足跡をクリア
        xUI.footstampClear();
 */
xUI.footstampClear    =function(){
//    var flipStatus=false
//    if(! this.footMark){flipStatus=true;this.footMark=true;}
    if (this.footstampColor){
        var BGr=parseInt("0x"+this.footstampColor.substr(1,2),16);
        var BGg=parseInt("0x"+this.footstampColor.substr(3,2),16);
        var BGb=parseInt("0x"+this.footstampColor.substr(5,2),16);
    } else {BGr=0;BGg=0;BGb=0;};
    var BGColor="rgb("+BGr+", "+BGg+", "+BGb+")";
//    if (! this.footMark) {return;};
//足跡のお掃除
    for (c=0;c<(this.SheetWidth);c++){
            for(f=0;f<(this.XPS.duration());f++){
        if (this.getid("Select")!=(c+"_"+f)){
    if (
        document.getElementById(c+"_"+f).style.backgroundColor==BGColor ||
        document.getElementById(c+"_"+f).style.backgroundColor==this.footstampColor
    ){
//        document.getElementById(c+"_"+f).style.backgroundColor=this.sheetbaseColor;
        document.getElementById(c+"_"+f).style.backgroundColor='transparent';
    };
        };
            };
    };
//    if(flipStatus){this.footMark=false;}
};
/*    足跡をチェック
        xUI.footstampPaint();
        現在のカーソル位置を控えて全選択して解除
        カーソル位置を戻す
 */
xUI.footstampPaint    =function(){
    var flipStatus=false
    if(! this.footMark){flipStatus=true;this.footMark=true;}
    var restoreValue=this.getid("Select");
        this.selectCell("0_0");
        this.selection((this.SheetWidth-1)+"_"+this.XPS.duration());
        this.selection();
        this.selectCell(restoreValue);
    if(flipStatus){this.footMark=false;}
};
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
/**
 *	@paramas {Number} pageNumber
 *	@paramas {Number} pages
 *	ヘッダアイテムオーダに従ったページヘッダの内容をHTMLで返す
 */
xUI.pageHeaderItemOrder = function(pageNumber,pages){
//  ページヘッダとシートヘッダの共通表示 テーブルのオーダーで表示
    var headerItem = {
        ep   :{template:'<span class="pgHeader opusHeader"     id="opus%1"       >%2</span>',label:'話数.',class:"opusHeader",value:this.XPS.opus},
        title:{template:'<span class="pgHeader titleHeader"    id="title%1"      >%2</span>',label:'TITLE.',class:"titleHeader",value:this.XPS.title},
        sci  :{template:'<span class="pgHeader scenecutHeader" id="scene_cut%1"  >%2</span>',label:'CUT.',class:"scenecutHeader",value:['s'+this.XPS.scene,'c'+this.XPS.cut].join('-')},
        time :{template:'<span class="pgHeader timeHeader"     id="time%1"       >%2</span>',label:'TIME.',class:"timeHeader",value:nas.Frm2FCT(this.XPS.time(),3,0,this.XPS.framerate)},
        user :{template:'<span class="pgHeader nameHeader"     id="update_user%1">%2</span>',label:'NAME.',class:"nameHeader",value:xUI.XPS.update_user.handle},
        page :{template:'<span class="pgHeader pageHeader"     id="page_cont%1"  >%2</span>',label:'.',class:"pageHeader",value:(pageNumber==pages)?'end / '+pages : pageNumber+' / '+pages}
    };
    var _BODY = "";
    _BODY += '<div style="display:table-tr;">';
    xUI.XPS.sheetLooks.headerItemOrder.forEach(function(e){
        if(e[2] != 'hide')
        _BODY += nas.localize(headerItem[e[0]].template,String(pageNumber),headerItem[e[0]].value);
    });
    _BODY += '</div>';
    _BODY += '<div style="display:table-tr;position:absolute;top:0px;">';
    xUI.XPS.sheetLooks.headerItemOrder.forEach(function(e){
        if(e[2] != 'hide')
        _BODY += nas.localize('<span class ="pgHeader-label %1">%2</span>',headerItem[e[0]].class,headerItem[e[0]].label);
    });
    _BODY += '</div>';

	return _BODY;
};
/*TEST 
	console.log(xUI.pageHeaderItemOrder(1,1));
*/
/*    タイムシート本体のヘッダを返すメソッド(ページ単位)
        xUI.headerView(pageNumber)
        引数はページ番号を整数で
        第一ページ以外は省略形を返す
        戻り値はページヘッダのHTMLテキスト
 */
xUI.headerView = function(pageNumber){
    var Pages=(this.viewMode=="Compact")? 1:Math.ceil(this.XPS.duration()/this.PageLength);//全ページ数・ページ長で割って切り上げ
    var _BODY ='';

//----印字用ページヘッダ・第一ページのみシートヘッダ---//
    _BODY += nas.localize('<div class="printPageStatus">%1</div><div id=pageHeader%2 class=sheetHeader>',
        decodeURIComponent(Xps.getIdentifier(xUI.XPS,'job')) +' : '+new Date().toNASString(),
        String(pageNumber),
    );
    _BODY += xUI.pageHeaderItemOrder(pageNumber,Pages);//========印字用ページヘッダを生成
    _BODY += '</div>';//Sheet|Page header
// */

//第一ページのみシート全体のコメントを書き込む（印刷用）  表示用には別のエレメントを使用
    if(pageNumber==1){
//シート書き出し部分からコメントを外す 印刷時は必要なので注意 2010/08/21
//        _BODY += '<span class=top_comment >'
//シグネチャエリア
        _BODY += '<div class=signArea ><span class="memoLabel">sig.</span>';
        _BODY += '<br><div id=signparade style="display:flex;"><br>--------</div><hr></div>';
//メモエリア
        _BODY +='<div class=noteArea><span class="memoLabel">memo:</span>';
        _BODY += '<span id="transit_dataXXX">';
        if(this.XPS.trin>0){
            _BODY += "△ "+this.XPS.trin.toString();//[1]+'('+nas.Frm2FCT(this.XPS.trin[0],3,0,this.XPS.framerate)+')';
        };
        if((this.XPS.trin > 0)&&(this.XPS.trout > 0)){_BODY += ' / ';};
        if(this.XPS.trout[0]>0){
        _BODY += "▼ "+this.XPS.trout.toString();//[1]+'('+nas.Frm2FCT(this.XPS.trout[0],3,0,this.XPS.framerate)+')';
        };
        _BODY += '</span><br>';

        _BODY+='<div id="memo_prt" class=printSpace >';
        if(this.XPS.xpsTracks.noteText.toString().length){
            _BODY+=this.XPS.xpsTracks.noteText.toString().replace(/(\r)?\n/g,"<br>");
        }else{
            _BODY+="<br><br><br><br><br><br>";
        };
        _BODY+='</div>';
        _BODY+='</div>';
    }else{
        _BODY+='<div class=printSpace ><br><br><br><br><br><br></div>';
    };
    return _BODY;
};
//end headerView()
/**
 *   ページヘッダを、初期化後に更新するメソッド
 *   事前にXPSを更新する必要あり
 *     eg.
 *      xUI.XPS.parseSheetLooks(documentFormat.toJSON());
 *      xUI.rewritePageHeaderItemOrder();
 */
xUI.rewritePageHeaderItemOrder = function(){
	Array.from(document.getElementsByClassName('sheetHeader')).forEach(function(e){
		var pageNumber = nas.parseNumber(e.id);
		var Pages = (xUI.viewMode=="Compact")? 1:Math.ceil(xUI.XPS.duration()/xUI.PageLength);
		e.innerHTML = xUI.pageHeaderItemOrder(pageNumber,Pages);
	});
}
/*TEST
	xUI.reWritePageHeaderItemOrder();
 */
/**
 *	@params {string}	type
 *	リザルトのタイプは引数で指定
 *	fix|column|document
 *	
 *	sheetLooksを参照して指定のブロックの幅をpixelで返す関数
 *	指定がない場合はすべてをまとめてオブジェクトで返す
 *	
 */
xUI.getAreaWidth = function(type){
	var tableFixWidth    = 0;
	var tableColumnWidth = 0;
	var tableDocWidth    = 0;
	xUI.XPS.xpsTracks.areaOrder.forEach(function (e){
		var areaWidth = 0;//as CellWidthUnit
		if(e.type == 'reference'){
//トラックテーブル上に存在しないリファレンスはトラックスペックから取得
			areaWidth += xUI.XPS.sheetLooks[Xps.TrackWidth["reference"]] * e.tracks; 
		}else{
//その他はアサインテーブルの値を合算
			e.members.forEach(function(ex){
				areaWidth += xUI.XPS.sheetLooks[Xps.TrackWidth[ex.option]];
			});
		};
//タイムコードトラックの幅を加算
		if(e.timecode != 'none') areaWidth += xUI.XPS.sheetLooks[Xps.TrackWidth["timecode"]] * ((e.timecode == 'both')? 2:1);
//変数を取得
		if(e.fix)	 tableFixWidth	+= areaWidth;//固定エリア幅
		if(!(e.hide)) tableColumnWidth += areaWidth;//全幅
	});
	tableDocWidth = tableColumnWidth * xUI.PageCols + (xUI.XPS.sheetLooks.ColumnSeparatorWidth*(xUI.PageCols-1));
//リザルトのコンバート　なくても良いが将来的には必要

	tableDocWidth    = new nas.UnitValue(tableDocWidth    +xUI.XPS.sheetLooks.CellWidthUnit,'mm');
	tableFixWidth    = new nas.UnitValue(tableFixWidth    +xUI.XPS.sheetLooks.CellWidthUnit,'mm');
	tableColumnWidth = new nas.UnitValue(tableColumnWidth +xUI.XPS.sheetLooks.CellWidthUnit,'mm');

	if(type == 'fix'){
		return tableFixWidth;
	}else if(type == 'column'){
		return tableColumnWidth;
	}else if(type == 'document'){
		return tableDocWidth;
	};
	return {
		"fix"     : tableFixWidth,
		"column"  : tableColumnWidth,
		"document": tableDocWidth
	};
}

/*
 *  @params {Number}    pageNumber
 *  @returns {String}
 *      HTML timesheet page content
 *    タイムシート本体のHTMLを返すメソッド(ページ単位)
 *        xUI.pageView(pageNumber)
 *        引数はページ番号を整数で
 *        戻り値はページ内容のHTMLテキスト
 *
 *ページヘッダであった場合のみ固定のタイムラインヘッダーを出力する（画面表示専用）
 * 固定ヘッダの  第一第二第三  象限を出力する
 *   2  |  1 (横スクロール)
 *  ----+-----
 *   3  |  4
 *
 *引数:   pageNumber
 * 0    第一象限(-1)
 *-1    第二象限(-2)
 *-2    第三象限(-3)
 *    内部パラメータでは各値ともに減算して使用  --
 *    0以上は通常ページの出力（0 org）
 * 1~   第四象限(0 ~ ) 1 origin
 *
 *      xUI.XPS.xpsTracks.areaOrder
 *      xUI.XPS.sheetLooks.trackSpec(xUI.sheetLooks.trackspec)を参照
 * 
 */
/*トラック/トラックエリア/CSSクラスの関連をテーブル化する*/


xUI.pageView = function(pageNumber){
//console.log("++++++++++++++++++++++++++++ 可変書式対応")
    var restoreValue=this.Select;
    var BODY_ = '';
//    var headlineHeight=36;
//ページ数//プロパティに変更
    if(this.viewMode=="Compact"){
//compact(scroll)
        var Pages        = 1;//コンパクトモードでは固定
        var SheetRows    = Math.ceil(this.XPS.duration() / this.XPS.framerate) * Math.ceil(this.XPS.framerate);//ショット内フレーム数
        var hasEndMarker = true;// 継続時間終了時のエンドマーカー配置判定(必ず描画)
    }else{
//wordparo(page)
        var Pages        = Math.ceil((this.XPS.duration() / this.XPS.framerate) / this.SheetLength);//総尺をページ秒数で割って切り上げ
        var SheetRows    = Math.ceil(this.SheetLength / this.PageCols) * Math.ceil(this.XPS.framerate);//カラム内フレーム数
        var hasEndMarker = false;// 継続時間終了時のエンドマーカー配置判定(初期値)
//コンパクトモード用の固定表示が残っている場合1〜3象限の値を消去
        if((document.getElementById('qdr3'))&&(document.getElementById('qdr3').innerHTML)){
            document.getElementById('qdr1').innerHTML='';
            document.getElementById('qdr2').innerHTML='';
            document.getElementById('qdr3').innerHTML='';
        };
    };
/*
(2010/11/06)
    現在  PageLengthは冗長フレームを含む <秒数×フレーム母数>
    シート秒数が指定カラムで割り切れない場合は最後のカラムの秒数を1秒短縮して対応する仕様にする
    5秒シート  2段組みの場合  2.5秒2段でなく  3秒と2秒の段を作る
    従って1段のフレーム数は  切り上げ（指定秒数/指定段数）×フレーム母数

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
    アクション欄のタイムライン  表示プロパティの増設
(2016/07/16)
    アクション（リファレンス）欄の表示オプションを増設
    xUI.referenveView に  種別キーワードを配列で格納
    初期状態ではセル（置きかえ＋スチル）のみを表示する
(2016/08/19)
    xpsTracksとlayersの統合に伴うチューニング
(2017/07/20)
    リファレンスエリアのシート内容表示の際トラック抽出のバグがあったのを修正
(2017/07/21)
 ページ内に最終フレームが含まれるか否かを判定してカット記述終了マーカーを配置する拡張
(2018/03/10)
 トラック注釈を引き出し線付きで表示する機能増設
(2019/01/20)
 固定オーバーレイが参照非表示の際に表示乱れするのを抑制（高さ）
(2023/02/04)
 画像マスタードキュメント機能を拡張
 画像-UI一致のためsheetLooks拡張
 trackSpecをもとにareaOrderを作成してこれを表示のためのテーブルとして使用する
 左エンドの罫線＋マージンをテーブルセルとして処理することで、cssを簡略化

 (2023/06/28)
 sheetlooksオブジェクト分離のため ブロック幅算出の汎用関数を分離

 (2023/10/07)
 TDTS互換の画像表示を追加
 (2024/03/04)
 マージンラインを追加（マージン0の際は表示されない）
*/
//ページ番号が現存のページ外だった場合丸める
    if (pageNumber >=Pages){
        pageNumber=Pages;
    } else {
        if(pageNumber<=-3) pageNumber=0;
    };
    pageNumber--;//内部値に補正

//タイムシートテーブル

//タイムシートテーブルボディ幅の算出
/*
タイムシートのルック調整の為のおぼえがき
画面上は、規定幅のエレメントをすべて設定した状態で配置(cssに設定)
全体幅は自動計算

画像マスター機能の導入に伴う変更

印字上は全体幅の規定が存在するので、規定幅をテーブル全体幅に設定して
印刷時点で横方向をスケーリングして印字範囲内に収める

対応する変数とcssクラス
    SheetCellHeight      td.sheet
    LeftMargin           
    TimeGuideWidth       th.timeguidelabel
    ActionWidth          th.layerlabelR
    DialogWidth          th.dialoglabel
    SheetCellWidth       th.layerlabel
    cameraWidth          th.cameraLabel
    CommentWidth         th.framenotelabel
    ColumnSeparatorWidth .colSep

印字に適さない設定の場合は、一応警告を表示する。
印字用cssは、固定で作成する
現在A3サイズ固定

オーバー時は横幅を縮小

A4サイズオプションは検討中 202302
 */
/*
referenceデータは、本体Xpstに含まれないためここで整合性をチェックする

console.log("========================================================================");
console.log(this.referenceLabels);
    var referenceArea = this.XPS.xpsTracks.areaOrder.find(function(e){return (e.type == "reference")});
console.log(referenceArea);
    if((referenceArea)&&(referenceArea.tracks < this.referenceLabels.length)) referenceArea.tracks = this.referenceLabels.length;
 */
 /*
    表示モードは
    画像表示 ON|OFF
    ページ・スクロール切り替え Compact|Wordprop
    制限モード
    jp|us切り替え（レイヤーの上下逆転）を検討（UI上の変更はない）
*/
/*
    スクロール固定幅（第2/3象限）
    スクロールエリア幅
    xUI.XPS.xpsTracks.areaOrder テーブルを参照するように切り替え 2023 02
*/
console.log(this === xUI);
console.log(this.sheetLooks);
console.log(xUI.XPS.toString(false));



    var tableFixWidth    = 0;
    var tableColumnWidth = 0;

    xUI.XPS.xpsTracks.areaOrder.forEach(function (e){
        var areaWidth = 0;
        if(e.type == 'reference'){
//トラックテーブル上に存在しないリファレンスはトラックスペックから取得
            areaWidth += xUI.XPS.sheetLooks[Xps.TrackWidth["reference"]] * e.tracks; 
        }else{
//その他はアサインテーブルの値を合算
console.log(e);
            e.members.forEach(function(ex){
console.log(ex.option,Xps.TrackWidth[ex.option],xUI.XPS.sheetLooks[Xps.TrackWidth[ex.option]]);
                areaWidth += xUI.XPS.sheetLooks[Xps.TrackWidth[ex.option]];
            });
        };
//タイムコードトラックの幅を加算
        if(e.timecode != 'none') areaWidth += xUI.XPS.sheetLooks[Xps.TrackWidth["timecode"]] * ((e.timecode == 'both')? 2:1);
//変数を取得
        if(e.fix)     tableFixWidth    += areaWidth;//固定エリア幅
        if(!(e.hide)) tableColumnWidth += areaWidth;//全幅
    });
    var areaWidth = xUI.getAreaWidth();
    if(this.viewMode=="Compact"){
//Compact(スクロール)モード
        var tableBodyWidth = tableColumnWidth;
        var PageCols = 1;
        var SheetLength = Math.ceil(this.XPS.duration()/this.XPS.framerate);
/*
    コンパクト(スクロール）モード
    １段組に固定
    第１象限    トラックラベル縦方向固定ヘッダ・横スクロール
    第２象限    縦横固定部
    第３象限    横方向固定フィールド・縦スクロール
    第４象限    本体ドキュメント・縦横スクロール
*/
    }else{
//WordProp(ページ)モード
        var tableBodyWidth = tableColumnWidth * this.PageCols + 
            (xUI.XPS.sheetLooks.ColumnSeparatorWidth*(this.PageCols-1));//
        var PageCols    = this.PageCols;
        var SheetLength = this.SheetLength
        if(pageNumber==(Pages-1)){hasEndMarker=true;};

console.log(tableColumnWidth , this.PageCols ,xUI.XPS.sheetLooks.ColumnSeparatorWidth,this.PageCols);

/*
    シートワープロ（ページ）モード
    第１、２、３象限非表示
    第４象限のみを使用
*/
    };

console.log(xUI.sheetLooks);
console.log(tableFixWidth+":"+tableBodyWidth);

BODY_ +='<div class=sheetArea>';//open sheetArea
//============= ページテーブル出力開始
BODY_ +='<table cellspacing=0 ';
    if(pageNumber<=-2){
//第2,3象限用
BODY_ +='style="width:' + tableFixWidth  + this.sheetLooks.CellWidthUnit+'"';
    }else{
//第1,4象限用
console.log('style="width:' + tableBodyWidth + this.sheetLooks.CellWidthUnit+'"');
//BODY_ +='style="width:' + tableBodyWidth + this.sheetLooks.CellWidthUnit+'"';
    };
    if(pageNumber<0){

BODY_ +='id="qdr'+(-1*pageNumber)+'" class="sheet"';
    }else{
//BODY_ +='id="qdr4" ';
BODY_ +='id="page_'+String(pageNumber+1)+'" class="qdr4 sheet"';
    }
BODY_ +=' >';
BODY_ +='<tbody>';
//*========================================不可視｜タグ表示シートヘッダ
/*    テーブルルックを決め込む為の幅配置及び将来的にリンクペアレントを表示する領域(かも)
    第一行目 height:2px class:tlhead  (timelineheader)
    不可視シートヘッダ内には、タグを表示するspanを格納するので注意
*/
BODY_ +='<tr class=tlhead ';
    if(this.viewMode=="Compact") BODY_ +='id=tlhead';
    if(pageNumber==0) BODY_ +='Parent';
BODY_ +='>';
//左マージンセル
BODY_ +='<td class="sheetMargin-left left-top" ></td>';//
//*==============================ページカラムループ処理
    for (var cols=0;cols < PageCols;cols ++){
//*==============================トラックエリアループ処理
console.log(this.XPS.xpsTracks.areaOrder);
        for (var area = 0 ;area < this.XPS.xpsTracks.areaOrder.length ; area ++){
            var areaOrder = this.XPS.xpsTracks.areaOrder[area];
console.log(areaOrder.timecode);
//第二第三象限でかつコンパクトモードでない場合はここでブレイクしてヘッダーを縮小
            if((!(areaOrder.fix))&&(this.viewMode=="Compact")&&(pageNumber<=-2)) break;
            if((areaOrder.timecode == 'both')||(areaOrder.timecode == 'head')){
/*********** timeguide ********************/
BODY_ +='<th class="tcSpan tlhead"';
BODY_ +=' ></th>';
            };
            if(areaOrder.type == 'reference'){
//*==============================リファレンスメンバ処理
                for (var r = 0 ; r < this.referenceLabels.length ; r++){
/*********** Action Ref *************/
BODY_ +='<th class="referenceSpan tlhead ref" ';
BODY_ +='> </th>';
                };
//*==============================リファレンスメンバ処理//
            }else{
//*==============================エリアメンバ処理
                for (var m = 0; m < areaOrder.members.length; m++ ){
BODY_ +='<th class="'+ trackHeaderClass[areaOrder.members[m].option] +' tlhead" ';
BODY_ +=' id="TL'+ areaOrder.members[m].index +'"';
BODY_ +=' > ';
/*********** span for track tag *************/
//=====================編集セル本体をタイムライン種別に合わせて配置(ラベル部分)
                    if(this.XPS.xpsTracks[areaOrder.members[m].index].tag){
                        var noteStep = 0;//tag深度 
                        for (var r = areaOrder.members[m].index ; r >= 0 ;r --) if(this.XPS.xpsTracks[r].tag) noteStep ++ ;
                        var trackId = ['p',pageNumber,'c',cols,'t',areaOrder.members[m].index].join('');
BODY_ += '<span id="';
BODY_ += trackId;
BODY_ += '" class="noteOverlay'
BODY_ += ' note'+((noteStep - 1) % 5 +1);
BODY_ += '"><span id="'
BODY_ += trackId;
BODY_ += '_L" class=overlayLabel>'+this.XPS.xpsTracks[areaOrder.members[m].index].tag+'</span></span>'
                    };
BODY_ +='</th>';
                };
//*==============================エリアメンバ処理//
            };
            if((areaOrder.timecode == 'both')||(areaOrder.timecode == 'tail')){
/*********** timeguide ********************/
BODY_ +='<th class="tcSpan tlhead"';
BODY_ +=' ></th>';
            };
        };
//*==============================トラックエリアループ処理//
//カラムセパレータの空セル挿入
        if (cols < (PageCols-1)){
BODY_ +=('<td class="colSep tlhead" ></td>');
        };
    };
//*==============================ページカラムループ処理//
//*========================================不可視｜タグ表示シートヘッダ//
BODY_ +='</tr>';//改段
//*第２行目========================================シート記入部ヘッダ
BODY_ +='<tr>';
//左マージンセル
BODY_ +='<td class="trackLabel left-end" ></td>';//
//*==============================ページカラムループ処理
	for (cols=0;cols < PageCols;cols ++){
//*==============================トラックエリアループ処理
		for (var area = 0 ;area < this.XPS.xpsTracks.areaOrder.length ; area ++){
            var areaOrder = this.XPS.xpsTracks.areaOrder[area];
            if((pageNumber<-1)&&(!(areaOrder.fix))) break;//第２・３象限ではfix以外をスキップ
            if((areaOrder.timecode == 'both')||(areaOrder.timecode == 'head')){
/*********** timeguide ********************/
BODY_ +='<th rowspan=2 class="tclabel trackLabel trackLabel-tall" ';
BODY_ +=' ><span class=timeguide> </span></th>';
            };
            if(areaOrder.type.match(/sound|dialog/i)){
//単段 複数トラック テープルヘッダー・テキストセンタリング
                var text ={
                    sound:"N",
                    dialog:"台<BR>詞"
                }[areaOrder.type];
                var cellclass;
/*********** Dialog|Sound Area*************/
BODY_ +='<th rowspan=2 class="dialoglabel trackLabel trackLabel-tall';
                if(areaOrder.timecode == 'tail')
BODY_ +=' dialoglabel-join';
BODY_ +='" ';
                if(areaOrder.members.length > 1)
BODY_ +='colspan ="'+areaOrder.members.length+'" ';//ダイアログ|soundの幅は可変 1~
BODY_ +='>'+text+'</th>';
    		}else if(areaOrder.type.match(/comment/i)){
//単段処理 確定１トラック
/*********** FrameNote Area *************/
BODY_ +='<th rowspan=2 class="framenotelabel trackLabel trackLabel-tall" title="';
BODY_ +='MEMO.';
BODY_ +='"></th>';
    		}else if(areaOrder.type.match(/reference/i)){
/*********** Reference Area *************/
BODY_ +='<th ';
BODY_ +='class="referencelabel rnArea trackLabel ref" ondblclick=sync("referenceLabel") title="" '
BODY_ +='colspan=' + this.referenceLabels.length+' ';//
BODY_ +='>reference</th>';
                var text = ((areaOrder.members.length <= 2)?"ref.":"reference");
    		}else if(areaOrder.members.length > 0){
//二段・複数トラック消費型 可変 0~
                var text = {
                    replacement :"cell",
                    camera      :((areaOrder.members.length == 1)?"cam.":"camera"),
                    action      :"action"
                }[areaOrder.type];
                var cellclass = {
                    replacement :'class="editArea trackLabel" ondblclick=sync("editLabel") title="" ',
                    camera      :'class="camArea trackLabel" title="" ',
                    action      :'class="editArea trackLabel" ondblclick=sync("editLabel") title="" '
                }[areaOrder.type];
BODY_ +='<th ';
BODY_ += cellclass
                if(areaOrder.members.length > 1)
BODY_ +='colspan='+areaOrder.members.length+' ';//
BODY_ +='>'+text+'</th>';
            };
            if((areaOrder.timecode == 'both')||(areaOrder.timecode == 'tail')){
/*********** timeguide ********************/
BODY_ +='<th rowspan=2 class="tclabel trackLabel" ';
BODY_ +=' ><span class=timeguide> </span></th>';
            };
		};
//*==============================トラックエリアループ処理//
//カラムセパレータの空セル挿入
        if (cols < (PageCols-1)){
BODY_ +=('<td class="trackLabel left-end" ></td>');
        };
	};
//*==============================ページカラムループ処理//
BODY_ +='</tr>';
//*第２行目========================================シート記入部ヘッダ//

//*第３行目========================================シート記入部ヘッダ
//ヘッダラベル等を出力するライン
BODY_ +='<tr>';
//左マージンセル
BODY_ +='<td class="trackLabel left-end" ></td>';//
//*==============================ページカラムループ処理
	for (cols=0;cols < PageCols;cols ++){
//*==============================トラックエリアループ処理
		for (var area = 0 ;area < this.XPS.xpsTracks.areaOrder.length ; area ++){

            var areaOrder = this.XPS.xpsTracks.areaOrder[area];
            if((pageNumber<-1)&&(!(areaOrder.fix))) break;//第２・３象限ではfix以外をスキップ
            if(areaOrder.type.match(/dialog|sound|comment/i)){
//先行処理済なのでスキップ
                continue;
            }else if(areaOrder.type == 'reference'){
//*==============================リファレンスメンバ処理
                for (var r = 0 ; r < this.referenceLabels.length ; r++){
BODY_ +='<th id="rL';
BODY_ += r.toString();
BODY_ += '_';
BODY_ += pageNumber;
BODY_ += '_';
BODY_ += cols.toString();
BODY_ +='" class="layerlabelR trackLabel ref"';
BODY_ +=' >';
                    var currentRefLabel = (this.referenceXPS.xpsTracks[this.referenceLabels[r]])?this.referenceXPS.xpsTracks[this.referenceLabels[r]].id:"";
                    var lbString=(currentRefLabel.length<3)?
                    currentRefLabel:
                    '<a onclick="return false;" title="'+currentRefLabel+'">'+currentRefLabel.slice(0,2)+'</a>';
                    if (currentRefLabel.match(/^\s*$/)){
BODY_ +='<span style="color:'+this.sheetborderColor+'";>'+nas.Zf(r,2)+'</span>';
                    }else{
BODY_ +=lbString;
                    };
                };
//*==============================リファレンスメンバ処理//
            }else{
//*==============================エリアメンバループ処理
    			for (var m = 0;m < areaOrder.members.length ; m ++){
    if(pageNumber>=-1){    };

//=====================編集セル本体(ラベル部分)
                    var r = areaOrder.members[m].index;
                    var currentLabel=this.XPS.xpsTracks[r].id;
                    var currentElementId= 'L' + String(r) + '_' + pageNumber + '_' + String(cols);
BODY_ +='<th id="' + currentElementId ;
                    switch (this.XPS.xpsTracks[r].option){
                    case "still" :
BODY_ +='" class="stilllabel trackLabel" ' ;
                    break;
                    case "stagework":
                    case "geometry":
BODY_ +='" class="geometrylabel trackLabel" ';
                    break;
                    case "effect":
                    case "sfx"   :
BODY_ +='" class="sfxlabel trackLabel" ';
                    break;
                    case "camerawork":
                    case "camera":
BODY_ +='" class="cameralabel trackLabel" ';
                    break;
                    case "replacement":
                    case "timing":
                    case "dialog":
                    case "sound":
                    default:
BODY_ +='" class="layerlabel trackLabel" ';
                    }

BODY_ +=' >';
                    if(this.XPS.xpsTracks[r].option=="still"){
                        if (currentLabel.match(/^\s*$/)){
BODY_ +='<span id ="'+currentElementId+'" style="color:'+xUI.sheetborderColor+'";>'+nas.Zf(r,2)+'</span>';
                        }else{
BODY_ +='<span id ="'+currentElementId+'" title="'+currentLabel+'">▼</span>';
                        };
                    }else{
                        if (this.XPS.xpsTracks[r].id.match(/^\s*$/)){
BODY_ +='<span id ="'+currentElementId+'" style="color:'+xUI.sheetborderColor+'";>'+nas.Zf(r,2)+'</span>';
                        }else{
BODY_ +=(currentLabel.length<5)?
    currentLabel:
    '<span id ="'+currentElementId+'" title="'+currentLabel+'">'+currentLabel.slice(0,4)+'</span>';
                        };
                    };
BODY_ +='</th>';
	    		};
//*==============================エリアメンバループ処理//
            };
		};
//*==============================トラックエリアループ処理//
//カラムセパレータの空セル挿入
        if (cols < (PageCols-1)){
BODY_ +=('<td class="trackLabel left-end" ></td>');
        };
	};
//*==============================ページカラムループ処理//
BODY_ +='</tr>';
//*第３行目========================================シート記入部ヘッダ//

//*========================================以下  シートデータ本体
//pageNumberが-3以下(第２象限)の場合は固定(fix指定エリア)部分まで出力
//
    if((pageNumber>=0)||(pageNumber<-2)){
/*=========================シートデータエリア==========================*/
//alert("SheetRows : "+ SheetRows +"\nthis.PageCols : "+this.PageCols);
        var currentPageNumber = (pageNumber < -2)? 0:pageNumber;
//*==============================シートライン処理
		for (var n = 0 ; n < SheetRows ; n ++){
BODY_ +='<tr>';
//*==============================ページカラムループ処理
		    for (cols=0;cols < PageCols;cols ++){

//フレーム毎のプロパティを設定
                var myFrameCount = cols * SheetRows + n;//ページ内フレームカウント
                var currentSec   = (currentPageNumber * SheetLength) + Math.floor(myFrameCount / Math.ceil(this.XPS.framerate));//処理中の秒
                var restFrm= myFrameCount % Math.ceil(this.XPS.framerate);//処理中の  ライン/秒
                var mySpt=(this.XPS.framerate.opt=='smpte')?";":":";
                var myTC=[Math.floor(currentSec/3600)%24,Math.floor(currentSec/60),currentSec%60].join(":")+mySpt+restFrm
                var current_frame= nas.FCT2Frm(myTC,this.XPS.framerate);//FCTからフレームインデックスを導くドロップ時はnull
                var count_frame = (current_frame < xUI.XPS.headMargin)?
                    xUI.XPS.headMargin - current_frame:
                    current_frame - xUI.XPS.headMargin + 1;
//現在処理中のフレームは有効か否かをフラグ  フレームがドロップまたは継続時間外の場合は無効フレーム
                var isBlankLine =((current_frame != null)&&(current_frame < this.XPS.duration()))? false:true;
//現在処理中のフレームがマージンに含まれるか否か
                var isMargin = ((current_frame < this.XPS.headMargin)||((this.XPS.xpsTracks.duration - current_frame) > this.XPS.headMargin))? true:false;
//セパレータ(境界線)設定
                if(restFrm==(Math.ceil(this.XPS.framerate)-1)){
//秒セパレータ
                    var tH_border= 'ltSep';
                    var dL_border= 'dtSep';
                    var sC_border= 'ntSep';
                    var mO_border= 'ntSep';
                }else{
                    if (n % this.sheetSubSeparator==(this.sheetSubSeparator-1)){
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
//    判定基準を継続時間内外のみでなくドロップフレームに拡張
//      ヘッド｜テールマージン拡張も必要（未処理 2023 02）
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

//左マージンセル 兼 シート罫線の左端(マーカーは遅延解決する)
				if(cols == 0){
BODY_ +='<td class="sheetbody left-end" id="le'+current_frame.toString()+'">';//
                    if((xUI.XPS.headMargin)&&(current_frame == xUI.XPS.headMargin)){
BODY_ +='<span class=marginMarker id=headMarker></span>';//CSSのテスト用コード
                    }else if((xUI.XPS.tailMargin)&&(current_frame == (xUI.XPS.xpsTracks.duration - xUI.XPS.tailMargin))){
BODY_ +='<span class=marginMarker id=tailMarker></span>';//CSSのテスト用コード
                    };
BODY_ +='</td>';
				};
//*==============================トラックエリアループ処理
			    for (var area = 0 ;area < this.XPS.xpsTracks.areaOrder.length ; area ++){
                    var areaOrder = this.XPS.xpsTracks.areaOrder[area];
                    if((pageNumber<-1)&&(!(areaOrder.fix))) break;
                    if((areaOrder.timecode == 'both')||(areaOrder.timecode == 'head')){
/*********** timeguide ********************/
// timeguide のアライメントをはみ出し付き右寄せにするため directipn:rtl を使用 そのため 単位記号としての引用符は左置きとなる//
BODY_ +='<td nowrap ';
BODY_ +='class="tcbody Sep ';
//BODY_ += tH_border;if(cellClassExtention) 
BODY_ += tH_border+cellClassExtention;
BODY_ +='"';
BODY_ +=' id=tcg_' + String(current_frame);
BODY_ +=' >';
                        if (restFrm == 0)
BODY_ += "<span class=timeguide>['"+ currentSec.toString()+"]</span>";
                        if (((n+1)%2 ==0)&&(! isBlankLine)){
BODY_ += "<span class=frameguide>"+String(count_frame)+"</span>";
                        }else{
BODY_+='<br>';
                        };
BODY_ +='</td>';
                    };
//
				    if(areaOrder.type == 'reference'){
//*----refecece area
                        for (var refLabelID=0;refLabelID< this.referenceLabels.length;refLabelID++){
                            var r = this.referenceLabels[refLabelID];
BODY_ +='<td ';
BODY_ +='class="sheetbody ref ';
BODY_ +=sC_border;
BODY_ +='"';
                            if (current_frame<this.referenceXPS.xpsTracks[r].length){
//表示可能な内容あり
BODY_ += 'id=\"r_';
BODY_ += r.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
BODY_ +='class="';
BODY_ +=sC_border + cellClassExtention + ' ref';
BODY_ +='"';
                            }else{
//ブランクセル
BODY_ +='class="';
BODY_ +=sC_border + '_Blank';
BODY_ +='"';
                            };
BODY_ +='>';
//セル内容を転記
                            if(current_frame >= this.referenceXPS.xpsTracks[r].length){
BODY_+="<br>";
                            }else{
                                this.Select = [r,current_frame];
                                if (this.referenceXPS.xpsTracks[r][current_frame]!=""){
BODY_ += this.trTd(['r',r,current_frame]);
                                }else{
BODY_+='<br>';
                                };
                            };
BODY_ +='</td>';
                        };
//*----refecece area//
				    }else if(areaOrder.type == 'comment'){
//レコード終端フィールド処理    メモエリア
                        if(pageNumber >=0){
BODY_ +='<td ';
                            if (! isBlankLine){
BODY_ += 'id="';
BODY_ += (this.XPS.xpsTracks.length-1).toString()+'_'+ current_frame.toString();
BODY_ +='" ';
                            };
BODY_ +='class="sheetbody ';
BODY_ +=mO_border+cellClassExtention;
BODY_ +='"';
BODY_ +='>';
                            if (isBlankLine){
BODY_+="<br>";
                            }else{
                                this.Select = [this.XPS.xpsTracks.length-1,current_frame];
                                if ( this.XPS.xpsTracks[this.XPS.xpsTracks.length-1][current_frame]!=""){
BODY_ += this.trTd([this.XPS.xpsTracks.length-1,current_frame]);
                                }else{
BODY_+='<br>';
                                };
                            };
BODY_+='</td>';
                        };
				    }else{
//*----sheet data area    各種タイムライン混在
//*==============================エリアメンバループ処理
					    for (var m = 0;m < areaOrder.members.length ; m ++){
                            var r = areaOrder.members[m].index;
//                        if((r==0)||(this.XPS.xpsTracks[r].option=="dialog")){}
                            if((areaOrder.members[m].option == 'dialog')||(areaOrder.members[m].option == 'sound')){
//ダイアログ|サウンド
BODY_ +='<td ';
                                if (! isBlankLine){
BODY_ += 'id="';
BODY_ +=r.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
                               };
BODY_ +='class="';
BODY_ +=' soundbody ';
                                if(areaOrder.timecode == 'tail')
BODY_ +=' soundbody-join ';
//BODY_ +=' sheetbody ';
BODY_ += dL_border+cellClassExtention;
BODY_ +='"';
BODY_ +='>';
                                if (isBlankLine){
BODY_+="<br>";
                                }else{
                                    this.Select=[0,current_frame];
                                    if (this.XPS.xpsTracks[r][current_frame]!=""){
BODY_+=this.trTd([r,current_frame]);
                                    }else{
BODY_ += '<BR>';
                                    };
                                };
BODY_ +='</td>';
                            }else{
//音響以外のシートセル
BODY_ +='<td ';
                                if (! isBlankLine){
BODY_ += 'id="';
BODY_ +=r.toString()+'_'+ current_frame.toString();
BODY_ +='" ';
                                };
BODY_ +='class="sheetbody ';
BODY_ +=sC_border+cellClassExtention;
BODY_ +='"';
BODY_ +='>';
                                if (isBlankLine){
BODY_+="<br>";
                                }else{
                                    this.Select = [r,current_frame];
                                    if (this.XPS.xpsTracks[r][current_frame]!=""){
BODY_+=this.trTd([r,current_frame]);
                                    }else{
BODY_+='<br>';
                                    };
                                };
BODY_ +='</td>';
                            };
//*----sheet data area//
				    	};
//*==============================エリアメンバループ処理//
				    };
                    if((areaOrder.timecode == 'both')||(areaOrder.timecode == 'tail')){
/*********** timeguide ********************/
BODY_ +='<td nowrap ';
BODY_ +='class="tcbody Sep ';
//BODY_ +=tH_border;if(cellClassExtention) 
BODY_ +=tH_border+cellClassExtention;
BODY_ +='"';
BODY_ +=' id=tcg_' + String(current_frame);
BODY_ +=' >';
                        if (restFrm == 0)
BODY_ += "<span class=timeguide>[ '"+ currentSec.toString()+" ]</span>";
                        if (((n+1)%2 ==0)&&(! isBlankLine)){
BODY_ += "<span class=frameguide>"+String(count_frame)+"</span>";
                        }else{
BODY_+='<br>';
                        };
BODY_ +='</td>';
                    };
			    };
//*==============================トラックエリアループ処理//
//カラムセパレータの空セル挿入
                if (cols < (PageCols-1)){
BODY_ +=('<td class="sheetbody left-end" ></td>');
                };
			};
//*==============================ページカラムループ処理//
BODY_ +='</tr>';
		};
//*==============================シートライン処理//
    };
BODY_ +='</tbody></table>';
BODY_ +='\n';
//============= テーブル出力終了
/*タイムシート記述終了マーカーはxUIクラスメソッドで配置に変更*/
//============= ページフッター出力
//BODY_ +='<biv class=pageFooter></div>';
//BODY_ +='\n';
//============= ページフッター出力終了
BODY_ +='</div>';//close sheetArea//

//画像タイムシート用エレメントを加える
//第4象限限定
    if(pageNumber >= 0){
        if(xUI.viewMode != 'Compact'){
//ページモード
BODY_ +='\t<div id="sheetImage-'+pageNumber+'" class="overlayDocmentImage" >';//place page image field// 
BODY_ +='\t</div>\n';//close pageImage//
//console.log('================ for sheet image ====================//')
        }else{
//スクロールモード 
BODY_ +='\t<div id="noteImageField" class="overlayNoteImage" >';//place note image field// 
BODY_ +='\t</div>\n';//close noteImage//
//console.log('================ for note image ====================//')
        };
    };
BODY_ +='';
        this.Select =   restoreValue;
        return BODY_;
};
//******************************** pageView//
/**
    @params {Array|Number} endPint
    @returns {Object HTMLElement}
     エンドマーカー配置メソッド  placeEndMarker
    タイムシート記述最終フレームの注釈トラックにタイムシートにオーバーレイする形でマーカーを配置する
    マーカーはspan要素として シートセルを基準に下方オフセットで置く
 */
xUI.replaceEndMarker = async function replaceEndMarker(endPoint){
//すでにマーカーがあれば削除
    if(document.getElementById('endMarker')) document.getElementById('endMarker').remove();
    if (typeof endPoint == 'undefined'){
        try{
            var endPoint = [xUI.XPS.xpsTracks.length, xUI.XPS.xpsTracks.duration];
        }catch(er){return;}
    };
    if(!(endPoint instanceof Array)) {endPoint=[xUI.XPS.xpsTracks.length,endPoint]};
    var endCellLeft  = document.getElementById([0,endPoint[1]-1].join('_'));
    var endCellRight = document.getElementById([endPoint[0]-1,endPoint[1]-1].join('_'));
    endCellRight.innerHTML += '<span id=endMarker class=endMarker> :: end ::</span>'

//JQueryの使用をこの部分のみに制限（ここも削除予定）
/*    $("#endMarker").css({
        'top'  :(endCellRight.clientHeight),
        'left' :(endCellLeft.offsetLeft - endCellRight.offsetLeft ),
        'width':(endCellRight.offsetLeft + endCellRight.clientWidth - endCellLeft.offsetLeft) 
    });//offsetParentをシートテーブルと共用してスケールを合わせる */

    nas.HTML.setCssRule("#endMarker",
        'top:  '+(endCellRight.clientHeight)+'px;'+
        'left: '+(endCellLeft.offsetLeft - endCellRight.offsetLeft )+'px;'+
        'width:'+(endCellRight.offsetLeft + endCellRight.clientWidth - endCellLeft.offsetLeft) +'px;'
    );//offsetParentをシートテーブルと共用してスケールを合わせる 

    return document.getElementById('endMarker');
}
/**
     マージンマーカー配置メソッド  placeMarginMarker
    タイムシート記述最終フレームの注釈トラックにタイムシートにオーバーレイする形でマーカーを配置する
    マーカーはspan要素として シートセルを基準に上方オフセットで置く
    罫線上に1pxの赤ライン
 */
xUI.placeMarginMarker = async function placeMarginMarker(){
//すでにマーカーがあれば削除
	var marks = Array.from(document.getElementsByClassName('marginMarker'));
	marks.forEach(function(e){e.remove();});
	var markCell  = null;
	var markRight = null;
	var markWidth = 0;
	['headMargin','tailMargin'].forEach(function(mgn){
		if(xUI.XPS[mgn]>0){
			var eid = (mgn == 'headMargin' )? 'headMarker':'tailMarker';
			var mgnPoint = (mgn == 'headMargin' )?
				xUI.XPS.headMargin:xUI.XPS.xpsTracks.duration-xUI.XPS.tailMargin;//head|tail
			markCell  = document.getElementById('le' + mgnPoint);//トラック左端
			markRight = document.getElementById([xUI.XPS.xpsTracks.length-1,mgnPoint].join('_')).getBoundingClientRect();
			markWidth = markRight.right - markCell.getBoundingClientRect().left;
			var mrk = document.createElement('span');
			mrk.id = eid;
			mrk.className = 'marginMarker';
			markCell.append(mrk);
		};
	});
	if(markWidth) nas.setCssRule('.marginMarker','width:'+markWidth+'px;');
}
/* TEST
	xUI.placeMarginMarker();
 */
/**
 *  @params {String} ID
 * 本体シートの表示を折り畳む（トグル）
 */
xUI.packColumn=function(ID){
var Target=ID;
var PageCols=(this.viewMode=="Compact")?1:this.PageCols;
var PageCount=(this.viewMode=="Compact")?1:Math.ceil(this.XPS.duration()/this.PageLength);
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
//参照シートの非表示/表示
/*
tableColumnWidth
$('.ref').each(function(index,elem){$(elem).show/hide()});組み合わせ処理が必要
表示状態を他のメソッドから参照する必要あり（重要）
*/
xUI.flipRefColumns=function(action){
        var status=$('.rnArea').isVisible();
    if(action){
        action = (action == 'hide')? false:true;
        if(action ==  status) return;
    }else{
        action = !(status);
    }
    var flipSpan = (this.sheetLooks.ActionWidth*this.referenceLabels.length)*((this.viewMode=="Compact")?1:this.PageCols);
    if(action){
        $('.ref').show();
//        $('#qdr4.sheet').width($('#qdr4.sheet').width()+flipSpan);
        $('.qdr4.sheet').width($('.qdr4.sheet').width()+flipSpan);
        if(this.viewMode=="Compact"){
            $('#qdr3.sheet').width($('#qdr3.sheet').width()-flipSpan);
            $('#qdr2.sheet').width($('#qdr2.sheet').width()-flipSpan);
            $('#qdr1.sheet').width($('#qdr1.sheet').width()+flipSpan);
        }
    }else{
        $('.ref').hide();
//        $('#qdr4.sheet').width($('#qdr4.sheet').width()-flipSpan);
        $('.qdr4.sheet').width($('.qdr4.sheet').width()-flipSpan);
        if(this.viewMode=="Compact"){
            $('#qdr3.sheet').width($('#qdr3.sheet').width()-flipSpan);
            $('#qdr2.sheet').width($('#qdr2.sheet').width()-flipSpan);
            $('#qdr1.sheet').width($('#qdr1.sheet').width()-flipSpan);
        }
    }
//    xUI.replaceEndMarker(xUI.XPS.xpsTracks.duration);
};

/**  UI関連メソッド

ユーザインターフェースコントロール

*/
/*
    スピンアクション
xUI.spin(vAlue)
引数:
設定するスピン量  数値
または
キーワード right/left/up/doun/fwd/back
引数無しで現在のスピン量を返す
戻値:更新あとのスピン量
*/
xUI.spin =function(vAlue){
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
        this.eddt = entry;
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
//xUI.doRapid=function(param){rapidMode.command[param]();};
xUI.doRapid=function(param){xUI.rapidMode.command[param]();};

/*    複写
引数:なし
戻値:なし
現在の操作対象範囲をヤンクバッファに退避
 */
xUI.copy    =function(){
    this.yank();
    if(ClipboardEvent){
        
    }
};

/*    切り取り
引数:なし
戻値:なし
現在の操作対象範囲をヤンクバッファに退避して、範囲内を空データで埋める
選択範囲があれば解除してフォーカスを左上にセット

セクション選択の場合(xUI.emode==2)　ヤンクバッファにはセクションオブジェクトが入る
 */
xUI.cut    =function()
{
    this.yank();
//noteImageを持っていたら参照を削除
    if(this.yankBuf.noteimage){
        xUI.yankBuf.noteimage.remove();
    }
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
ヤンクバッファにnoteimageが存在すればペースト
 */
xUI.paste    =function(){
    var bkPos=this.Select.slice();
    this.inputFlag="cut";
    this.put(this.yankBuf.body);
    this.selectCell(bkPos);
    if(xUI.yankBuf.noteimage){
        xUI.yankBuf.noteimage.setAddress(xUI.Select.join('_'));
        xUI.resetSheet();
    };//xUI.putはセレクションの移動をともなうので先に貼り付ける　またはセレクトの後
};
/*    移動
xUI.move(dest,dup);
引数:    dest    [deltaColumn,deltaLine]
    dup    複製フラグ trueで移動先に複製を配置
戻り値：移動成功時 true 失敗時は false

カットとペーストを自動で行うのではなくundoの対象を1回にするために、移動範囲のバウンディングボックスを生成してput一回で処理する

移動先が編集範囲外のデータは消去
移動が発生しなかった場合は移動失敗  undoバッファの更新は行われない
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
    //いずれもシート外にフォーカスが出るので禁止  これを排除するので変更範囲は処理可能となる
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

        this.activeDocument.undoBuffer.undoPt++;
        this.undoGc=0;
        this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt]=UNDO;
        if (this.activeDocument.undoBuffer.undoStack.length>(this.activeDocument.undoBuffer.undoPt+1))
            this.activeDocument.undoBuffer.undoStack.length=(this.activeDocument.undoBuffer.undoPt+1);
// undoバッファの状態を表示
    sync("undo");sync("redo");

    if(this.edmode!=0){this.mdChg("normal")};//編集モードをノーマルに復帰

    this.selectCell(fkPos.join("_"));
    this.selection(add(fkPos,bkRange));
}

/**
    やり直し
引数: undoOffset 遡るべきundo回数 undoポインタを超えることはできない  省略時は 1
   
 */
xUI.undo    =function (undoOffset){
    if(this.activeDocument.undoBuffer.undoPt==0) {
if(dbg) {dbgPut("UNDOバッファが空")};
        return;
    };
    //UNDOバッファが空なので失敗
    if(typeof undoOffset == 'undefined') undoOffset = 1;
    this.activeDocument.undoBuffer.skipCt=(undoOffset-1);
while(undoOffset>0){
if(dbg) {dbgPut("undoPt:"+this.activeDocument.undoBuffer.undoPt+":\n"+this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt].join("\n"))};
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
    if((this.activeDocument.undoBuffer.undoPt+1)>=this.activeDocument.undoBuffer.undoStack.length) {
if(dbg){dbgPut("REDOバッファが空")};
        return;
    };
        //REDOバッファが空
    if(typeof redoOffset == 'undefined') redoOffset = 1;
while(redoOffset>0){
if(dbg) {dbgPut("undoPt:"+this.activeDocument.undoBuffer.undoPt+"\n:"+this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt].join("\n"))};
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

/**
    @params {String} tabText
    @params {Object|String} note
    ヤンクバッファに選択範囲の方向と値を格納
引数としてタブ区切りテキストが与えられた場合は、行列置換してヤンクバッファの値を更新する
ノート画像拡張、NoteImageキャッシュへの参照を格納する
*/
xUI.yank=function(tabText,note){
    if(arguments.length){
        tabText = (typeof tabText == 'string')? String(tabText):'';
        var dataArray = tabText.split('\n');
        var fieldCount = 0;
        for (var r=0;r<dataArray.length;r++){
            dataArray[r]=dataArray[r].split('\t');
            if(dataArray[r].length >= fieldCount) fieldCount=dataArray[r].length;
        };
        var myBody=[];
        for (var f = 0; f < fieldCount;f++){
            var frameData=[];
            for (var r=0;r<dataArray.length;r++){
                frameData.push((dataArray[r][f])?dataArray[r][f]:"");
            };
            myBody.push(frameData.join(','));
        };
        this.yankBuf.direction = [fieldCount-1,dataArray.length-1];
        this.yankBuf.body = myBody.join('\n');
        if(note){
            if(note instanceof nas.NoteImage){
                this.yankBuf.noteimage = note;
            }else if(typeof note =='string'){
                if(note.indexOf('cell:')==0){
                    this.yankBuf.noteimage = xUI.XPS.noteImages.getByLinkAddress(note);
                }else {
                    this.yankBuf.noteimage = xUI.XPS.noteImages.members.find(function(e){
                        return ((e.id == note)||(e.link == note))
                    });
                };
            };
        };
    }else{
        this.yankBuf.direction=xUI.Selection.slice();
        this.yankBuf.body=this.getRange();
        this.yankBuf.noteimage = xUI.XPS.noteImages.getByLinkAddress(xUI.getTargetImageAddress());
    };
};

/*    xUI.actionRange(limit)
引数:limit:[c,f]
戻値:[[TrackStartAddress,FrameStartAddress],[TrackEndAddress,FrameEndAddress]]
    現在のUI上の操作範囲の抽出
     引数は、制限範囲を絶対量で与える。通常は入力データサイズ
    省略可能  省略時は選択範囲と同一
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

/**
 *    @params {Array of Array} Range
 *
 *    xUI.getRange(Range:[[startColumn,startFrame],[endColumn,endFrame]])
 *    指定範囲内のデータをストリームで返す
 *    指定がない場合は、現在の選択範囲
 *
 *ホットポイントの取得ルーチン
 *
 *フォーカス    [C,F]
 *
 *selection    [c,f]
 *
 *ホットポイント    [(c>0)?C:C+c,(f>0)?F:F+f]
 *データRange    [Math.abs(c),Math.abs(f)]
 *
 */
xUI.getRange = function(Range){
    if (! Range) Range=this.actionRange();//指定がなければ現在の操作範囲を設定
// UNDOデータ拾いだしのために作成されたが編集全般に便利
// ストリームで返す
    return this.XPS.getRange(Range);
};


/*    xUI.putReference(datastream[,direction])
 *  @params {String|Object Xps|Array}  datastream
 *  @params {Array} direction
 *  @params {Function} callback
引数
    :datastream    シートに設定するデータ  単一の文字列  またはXpsオブジェクト または  配列  省略可
    :direction    データ開始位置ベクトル  配列  省略可  省略時は[0,0]
      参照シートに外部から値を流し込むメソッド
        xUI.putReference(データストリーム)
        読み込み時も使用
    xUI.put オブジェクトの機能サブセット
    undo/redo処理を行わない
    xUI.putのラッパ関数として残置
*/
xUI.putReference    =function(datastream,direction,callback){
    xUI.put(datastream,direction,true,callback);
}
/**
 *  タイムシートデータの入力を行う - UNDO処理つき
 *
 *    <pre>
 *    シートに外部から値を流し込むメソッド
 *    xUI.put(datastream[[,direction],toReference])
 *        読込み時にも使用
 *    Xps.put オブジェクトメソッドに対応
 *    undo処理は戻り値から書き換えに成功した範囲と書き換え前後のデータが取得できるのでその戻値を利用する
 *    このメソッド内では、選択範囲方向の評価を行わないためフォーカス／セレクションは事前・事後に調整を要する場合がある
 *    選択範囲によるクリップはオブジェクトメソッドに渡す前に行う必要あり
 *    
 *    グラフィックレイヤー拡張によりシート上の画像パーツを更新する操作を追加
 *    Xps更新後に、xUI.syncSheetCell()メソッドで必要範囲を更新
 *
 *    グラフィック描画queueを設置してキューに操作を追加してから更新メソッドをコールする形に変更する
 *    更新メソッドはキューを処理して不用な描画をスキップするようにする（未実装20170330）
 *
 *    マクロ展開後には同様に必要範囲内のフットマーク再表示を行う
 *    
 *    参照エリアに対する描画高速化のために、このメソッドでリファレンスの書換をサポートする
 *    引数に変更がなければ従来動作  フラグが立っていればリファレンスを書換
 *    リファレンス操作時はundo/redoは働かない
 *
 *    再描画抑制undoカウンタを設置
 *    カウンタの残値がある限り再描画をスキップしてカウンタを減算する
 *    </pre>
 *  @params {String|Object Xps|Array}  datastream
 *     シートに設定するデータ  単一の文字列  またはXpsオブジェクト または  配列  省略可<br />
 *  
 *  @params {Array} direction
 *     データ入力ベクトル  配列  省略可  省略時は[0,0]
 *  @params {Boolean} toReference
 *    ターゲットオブジェクト切り替えフラグ
 *  @params {Function} callback
 *    コールバック関数 主にリセット時に使用
 *  @returns {Array} 入力開始アドレス、終了アドレス
 *      [[TrackStartAddress,FrameStartAddress],lastAddress];
 */
xUI.put = function(datastream,direction,toReference,callback){
  if(! toReference) toReference = false;
  if((xUI.viewOnly)&&(! toReference)) return xUI.headerFlash('#ff8080');//入力規制時の処理

  var targetXps= (toReference)? xUI.referenceXPS:xUI.XPS;
  
  var selectBackup = [this.Select.concat(),this.Selection.concat()];//カーソル配置をバックアップ
  
  if(typeof datastream == "undefined") datastream="";
  if(typeof direction  == "undefined") direction=[0,0];
//
  if(! toReference){
//  undo/redo 事前処理
    switch (this.inputFlag){
    case "redo":        this.activeDocument.undoBuffer.undoPt++             ;   //REDO処理時
    case "undo":                                  ;   //UNDO処理時
        var undoTarget   = this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt];    //処理データ取得
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
制御トークン等は無し  データのみ
    '1,,,2,,\n1,,,,,\n"x",,,,,\n'

Xpsオブジェクトの際は、シート全体を入れ替え
構造変更や大規模な変更をまとめる際はこの方法を推奨

データテーブル以外の各プロパティは、配列を使用して指定
配列は[プロパティ名称,値]  で  UNDOスタックには[プロパティ名称,変更前の値]  を積む
2015.09.14  修正

    07/08/07    undoGroup着手

グループフラグが立っていたらグループカウントをかける

グループカウント中はグループID付きのputを受け付けて。
シート全体のコピーをとってそちらの編集を行う

カウント中はundoに値を積まない。undoポインタも固定する。
フラグがendGroupになるか、通常のputを受け取った時点で解除
コピーした配列から変更範囲全体をXPSに流し込んで、UNDOを更新する。
こんな予定、でもまだやってない

undoGroupは優先度低い  ほぼいらないような気がするのでまあアレだ
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
/*    Xpsならばシートの入れ替えを行う。現在のシート複製をundoStackに格納  */
    if(toReference){
//入力データをXPSに設定   UNDO対象外
        xUI.resetSheet(undefined,datastream,callback);//リファレンス更新
    }else{
        var prevXPS=new Xps();
        prevXPS.readIN(xUI.XPS.toString(false));
        UNDO[2]=prevXPS;
//入力データをXPSに設定
console.log(datastream);
        if(documentFormat.compareSheetLooks(datastream.sheetLooks)){
            xUI.resetSheet(datastream,undefined,callback);//書式情報一致
        }else{
            xUI.XPS.parseSheetLooks(datastream.sheetLooks);
            xUI.resetSheet(datastream,undefined,xUI.applySheetlooks(null,callback));//書式更新
        };
console.log(xUI.XPS);
    };
}else if(datastream instanceof Array){
/*    引数が配列の場合は、Xps のプロパティを編集する
形式:    [kEyword,vAlue]
    キーワード列とプロパティの対応リストは以下を参照
    キーワードは基本的にプロパティ文字列  "parent""stage"等
    タイムラインコレクションの個別プロパティは  "id.1.xpsTracks"等の"."接続した倒置アドレスで指定

//        Xps標準のプロパティ設定
    parent      ;//親Xps参照用プロパティ  初期値はnull（参照無し）編集可
    stage       ;//初期化の際に設定する  編集不可
    mapfile     ;//初期化の際に設定する  編集不可
    opus        ;//編集対象
    title       ;//編集対象
    subtitle    ;//編集対象
    scene       ;//編集対象
    cut         ;//編集対象
    trin        ;//編集対象(ドキュメント構成変更)
    trout       ;//編集対象(ドキュメント構成変更)
    rate        ;//編集対象(ドキュメント構成変更)
    framerate   ;//編集対象(ドキュメント構成変更)
    create_time ;//システムハンドリング  編集不可
    create_user ;//システムハンドリング  編集不可
    update_time ;//システムハンドリング  編集不可
    update_user ;//システムハンドリング  編集不可

    xpsTracks   ;タイムラインコレクション  構成変更のケースと内容変更の両ケースあり
                ;コレクションのエントリ数が変更になる場合は全て構成変更  それ以外は内容編集

xpsTimelineTrackオブジェクトのプロパティ
    noteText    ;//編集対象
    
    id      ;//識別用タイムラインラベル  編集対象
    tag;//トラック補助情報　編集対象
    sizeX   ;//デフォルト幅 point    編集対象（編集価値低）
    sizeY   ;//デフォルト高 point    編集対象（編集価値低）
    aspect  ;//デフォルトのpixelAspect  編集対象（編集価値低）
    lot     ;//map接続データ  編集禁止（編集価値低）
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
        if((targetXps.xpsTracks[myTarget[1]].option == 'still')&&(myTarget[0] == 'id')){
            targetXps.xpsTracks[myTarget[1]]["tag"]=datastream[1];//
        }
        if(myTarget[0] =="option"){targetXps.xpsTracks[myTarget[1]].sectionTrust = false;}
    }else{
//単独プロパティ変更
        UNDO[2]=[datastream[0],targetXps[myTarget[0]]];
        targetXps[myTarget[0]]=datastream[1];
    }
    if(toReference){
        xUI.resetSheet(undefined,targetXps,callback);
    }else{
        xUI.resetSheet(targetXps,undefined,callback);
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

//  if(this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt][0].join()!=selectBackup[0].join()) this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt][3]=selectBackup;
  if(! toReference){
//操作別に終了処理
switch (this.inputFlag){
case "undo":
case "redo":
        this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt][2]=UNDO[2];    //UNDO処理時
if(undoTarget.length>=4){
//第４要素がある場合のみredo用のデータを設定して、カーソル復帰処理を行う
    var currentAddress =undoTarget[3][0].slice();
    var currentRange   =undoTarget[3][1].slice();
    if(this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt][0].join()!=selectBackup[0].join()) this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt][3]=selectBackup;
    this.selection (add(this.Select,currentRange));
    this.selectCell(currentAddress);
}else{
    this.selection(add(undoTarget[0],undoTarget[1]));
    this.selectCell(undoTarget[0].join('_'));
};
        if(this.inputFlag=="undo") this.activeDocument.undoBuffer.undoPt--;
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
        this.activeDocument.undoBuffer.undoPt++;
        this.undoGc=0;
if(dbg){    dbgPut(    "UNDO stack add:\n"+UNDO.join("\n")); }
        this.activeDocument.undoBuffer.undoStack[this.activeDocument.undoBuffer.undoPt]=UNDO;
        if (this.activeDocument.undoBuffer.undoStack.length>(this.activeDocument.undoBuffer.undoPt+1)){ this.activeDocument.undoBuffer.undoStack.length=(this.activeDocument.undoBuffer.undoPt+1)};
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
};//xUI.put
/**
 *    @params {Array}    startAddress
 *    @params {Array}    endAddress
 *    @params {Boolean}  isReference
 *    @params {Function} callback
 *    @return {Array}
 *xUI.syncSheetCell(startAddress,endAddress,isReference)
 *    指定されたレンジのシートセルの内容を更新
 *    指定がない場合は、シート全て
 *    アドレス一致の場合は、一コマのみ
 *      戻り値は処理した範囲配列 [startAddress,endAddress]
 */
xUI.syncSheetCell = async function syncSheetCell(startAddress,endAddress,isReference,callback){
    if(this.activeDocument.undoBuffer.skipCt > 0) {this.activeDocument.undoBuffer.skipCt --;return;};//?
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
            var sheetCell=(isReference)? document.getElementById(["r",r,f].join("_")):document.getElementById([r,f].join("_"));
            if(sheetCell instanceof HTMLTableCellElement){
                if(document.getElementById(sheetCell.id)){xUI.Cgl.remove(sheetCell.id);}
                this.drawSheetCell(sheetCell);//関数内でシートセルを書き換える（同期処理）
//                var td=(targetXps.xpsTracks[r][f]=='')? "<br>" : this.trTd(targetXps.xpsTracks[r][f]) ;
//        シートテーブルは必要があれば書き換え
//                if (sheetCell.innerHTML!= td){ if(dbg) console.log(sheetCell.innerHTML);sheetCell.innerHTML=td;}
            }
//本体シート処理の際のみフットスタンプ更新
  var targetElement=document.getElementById(r+"_"+f);
  if((targetElement)&&(! isReference)){
//変更されたデータならフットスタンプ処理
    if (this.diff[r,f]){
            lastAddress=[r,f] ;        //最終入力操作アドレス控え
            var footstamp =(this.footMark)? 
//            this.footstampColor:this.sheetbaseColor;//踏むぞー
            this.footstampColor:'transparent';//踏むぞー
            this.Select=([r,f]);
        //各ブラウザで試験して判定文字列を変更(未処置)
            if (targetElement.style.backgroundColor != footstamp)
            targetElement.style.backgroundColor = footstamp; //セレクト位置を踏む！
    }else{
    //否変更なので、背景色がフットスタンプならフットスタンプを消す。
        //各ブラウザで試験して判定文字列を変更(未処置)
//        if (targetElement.style.backgroundColor != this.sheetbaseColor && this.footMark)
        if (targetElement.style.backgroundColor != 'transparent' && this.footMark)
//        targetElement.style.backgroundColor = this.sheetbaseColor; //踏み消す
        targetElement.style.backgroundColor = 'transparent'; //踏み消す
    };
  };
};
        };
    };
    return await xUI.Cgl.refresh([startAddress,endAddress],isReference,callback);//非同期処理
//    return [startAddress,endAddress];
}
//syncSheetCell シートセルの表示を編集内容に同期させる  
/**
    リファレンス領域と編集領域のデータが異なっているか否かを返す関数
    標準で[トラックid,フレーム]を配列で、又は ID文字列"trc_frm"
    それ以外はXPSのプロパティ名
    (id)とみなす オブジェクト渡しは禁止
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
/**
 *  シートセル入力バックアップ
 *      キー入力等で編集前のセル内容のバッファを送受するメソッド
 *  @params {Array} Datas
 *       セルの内容データ　省略時は現在の値を戻す。
 *  @returns {String} バックアップ内容　または　受領フラグ
 *
 */
xUI.bkup    =function(Datas){
    if ((! Datas)||(Datas.length==0)){
        return this.cellBackup[0];
    }else{
        this.cellBackup=Datas;return true;
    };
};
/*
UI関数群
    これも、xUIのメソッドに

*/
/*=====================================*/

/**
 *   メッセージをアプリケーションステータスに出力する。
 *   引数なしでクリア
 *  @params {String}    msg
 *      メッセージ本体
 *  @params {String}    prompt
 *      プロンプトサイン
 */
xUI.printStatus    =function(msg,prompt){
    if(! msg){msg=" "};
    if(! prompt){prompt="> "};
    var bodyText=(prompt+msg);
//    document.getElementById("app_status").innerHTML=bodyText.replace(/\n/g,"<br>");
    $("#app_status").text(bodyText);
}
/**    キーダウンでキー入力をサバく

IEがプレスだとカーソルが拾えないようなのでキーダウン
iNputbOx以外の入力もこのメソッドで受ける
フォーカスがiNputbOx以外にある場合は、トラップする特定キー以外はNOPで戻す
*/
xUI.keyDown    =function(e){
//書式エディタ処理
	if((documentFormat.active)||(xUI.onCanvasedit)) return;
//	if(documentFormat.active) return;
//stopwatch処理 
	if((xUI.player)&&(xUI.player.keyboard)){
	if(e.keyCode == 32) {
		if(xUI.player.status=='stop'){
				xUI.player.start();
		} else {
			if(xUI.player.markSwap){
				xUI.player.getCount=true;
			}else{
				xUI.player.stop();
			}
		}
		return false;
	} else if(e.keyCode == 13){
		if(xUI.player.status=='run'){
			if(xUI.player.markSwap){
				xUI.player.stop()
			}else{
				xUI.player.getCount=true
			}
			return false;
		}else{
			if(xUI.player.countStack.length){xUI.player.clearMark();return false;}
		}
	}else if (e.keyCode == 77) {
	    if(xUI.player.status=='run'){
	        xUI.player.getCount=true;
	    }else{
	        xUI.player.start('mark');	        
	    }
	    return false;
	}else if((e.keyCode == 35)||(e.keyCode == 36)){
		if(xUI.player.status=='run') return false;
	}
}
//ブラウザ全体のキーダウンを検出
	key = e.keyCode;//キーコードを取得
//入力中以外のショートカット処理
	switch(key) {
case	66 :		;	//[ctrl]+[B]/ パネルセット切り替え
	if ((e.ctrlKey)||(e.metaKey))	{
		xUI.setToolView();
		return false;}else{return true}
	break;
case	68 :		;	//[ctrl]+[D]/　スクロール・ページ表示モード切り替え [meta+D]がchrome のショートカットとかぶるのでなにか対策が必要
	if ((e.ctrlKey)||(e.metaKey))	{
        xUI.setDocumentMode('next');//画面リセットを含む
		return false;}else{return true}
	break;
case	79 :		;	//[ctrl]+[O]/ Open Document
	if ((e.ctrlKey)||(e.metaKey)) {
		 if(e.shiftKey){
		    this.openDocument("localFile");
		}else{
		    this.openDocument();
		}
		return false;
	}
	return true;
	break;
case	80 :		;	//[ctrl]+[P]/ Open PrintPage
	if ((e.ctrlKey)||(e.metaKey)) {
		 if(e.shiftKey){
		    printHTML("png");// [shift]+[ctrl]+[P]
		}else{
		    printHTML("print");
		}
		return false;
	}
	return true;
	break;
case	83 :    ;	//[ctrl]+[S]/ Save or Store document
	if ((e.ctrlKey)||(e.metaKey)) {
		 if(e.shiftKey){
		    this.storeDocument("as");
		}else{
		    this.storeDocument();
		}
		return false;
	}
		return true;
	break;
    }
    if(document.activeElement!==document.getElementById("iNputbOx")){
//フォーカスエレメントがiNputbOx以外なら入力を戻す
        if(((key==79)||(key==83))&&((e.ctrlKey)||(e.metaKey))){
        console.log("capt")
            return false;
        }else{
            return true;
        }
    }
	this.eddt = document.getElementById("iNputbOx").value;
    var currentTrack = xUI.XPS.xpsTracks[xUI.Select[0]];
    var exch = ((e.ctrlKey)||(e.metaKey))? true:false;
	var interpKey=110;
//      console.log(key+':down:');
	switch(key) {
case	25	:if(! Safari) break;
case	9	:	//tab
if (! this.tabSpin) {
	if(!this.edchg) return;
	this.put(iptFilter(this.eddt,currentTrack,xUI.ipMode,exch));
	return false;break;
}
case	13	:		//Enter 標準/次スピン・シフト/前スピン・コントロール/interpSpin
	if(xUI.edmode>=2){
// 区間編集中
		if(e.shiftKey){
			if((e.ctrlKey)||(e.metaKey)){
				if(xUI.edmode==3) this.sectionUpdate();
				this.mdChg('normal');						   //[ctrl]+[shift]+[ENTER]:モード解除
			}else{
				this.mdChg('float');						//[shift]+[ENTER]:float遷移
			};
		}else if((e.ctrlKey)||(e.metaKey)){
			if(xUI.edmode==3) this.sectionUpdate();						   //[ctrl]+[ENTER]:確定のみ
		}else{
			if(xUI.edmode==3) this.sectionUpdate();
			this.mdChg((xUI.edmode==3)?'section':'normal'); //[ENTER]:確定してモード遷移
		};
		return false;//スピン動作キャンセルのためここでリターン
	}else{
		if((e.shiftKey)&&((e.ctrlKey)||(e.metaKey))){
			xUI.mdChg('section');				   //[ctrl]+[shift]+[ENTER]:カーソル位置でモード遷移
			return false;//スピン動作キャンセルのためここでリターン
		};
		if(this.ipMode >= 2){
			if((e.ctrlKey)||(e.metaKey)){
				interpSign('=');return false;//[ctrl|meta]+[ENTER]:中間値サイン
			}else if(e.altKey){
				interpSign('-');return false;//[alt]+[ENTER]:中間値サイン
			};
		};
/*   
	 if(e.shiftKey){
		}else{
			interpSign();						   //[shift]+[ENTER]:中間値サイン
		}
*/	
		if (this.edchg){
//入力ボックスに入力中
			var expdList = iptFilter(nas_expdList(this.eddt).split(","),currentTrack,xUI.ipMode,exch);
			this.put(expdList);//更新
			this.selectCell(add(this.Select,[0,1]));//入力あり
		}else{
			if(e.shiftKey){
				if(expd_repFlag){
					this.spin("up");expd_repFlag=false;	 //<マクロ展開中>[shift]+[ENTER]:スピンアップ
				}else{
					this.spin("back");					  //[shift]+[ENTER]:スピンバック
				};
			}else{
				if(expd_repFlag){
					this.spin("down");expd_repFlag=false;   //<マクロ展開中>[ENTER]:スピンダウン
				}else{
					if((xUI.Selection[0]==0)&&(xUI.Selection[1]>0)){
						this.selectCell([xUI.Select[0],xUI.Select[1]+xUI.Selection[1]+1]);
//選択範囲有りのカラ[ENTER] 自動的にカラ移動
					}else{
						this.spin("fwd");					   //[ENTER]:スピンフォワード
					};
				};
			};
//処理終了時にコントロール（メタ）キーの同時押しがない場合は選択範囲を解除
			if((! e.ctrlKey)&&(! e.metaKey)){
				if(this.getid("Selection")!="0_0"){
					this.selection();this.spinHi();
				};//選択範囲解除
			};
		};
	};
	return false;
	break;
case	27	:	//esc 選択範囲解除
//ラピッドモード解除
	if(xUI.eXMode){
		return rapidMode.command.exit();
	}
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
	        this.sectionManipulateOffset=['body',0];
	    };        
		    this.sectionPreview(this.Select[1]+kOffset);
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
            if (this.edchg) this.put(iptFilter(this.eddt,currentTrack,xUI.ipMode,exch));//更新
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
    if (this.edchg) this.put(iptFilter(this.eddt,currentTrack,xUI.ipMode,exch));//更新
	this.spin("pgup");return false;	break;
case 	34:		//ページダウン
    if (this.edchg) this.put(iptFilter(this.eddt,currentTrack,xUI.ipMode,exch));//更新
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
		return true;}else{return true}
	break;
case	69 :		;	//[ctrl]+[E]/export AE Key
	if ((e.ctrlKey)||(e.metaKey))	{
        console.log(writeAEKey);
		writeAEKey();
		return true;}else{return true}
	break;
case	73 :		;	//[ctrl]+[I]/information 
	if ((e.ctrlKey)||(e.metaKey))	{
	    myScenePref.open("edit");
		return false;}else{return true}
	break;
case	86 :		;	//[ctrl]+[V]/paste
	if ((e.ctrlKey)||(e.metaKey))	{
//		this.paste();
		return true;
		return false;}else{return true}
	break;
case	88 :		;	//[ctrl]+[X]/cut
	if ((e.ctrlKey)||(e.metaKey))	{
		this.cut();
		return true;}else{return true}
	break;
case	89 :		;	//[ctrl]+[Y]/redo
	if ((e.ctrlKey)||(e.metaKey))	{
		this.redo();
		return false;}else{return true}
	break;
case	90 :		;	//[ctrl]+[Z]/undo
	if ((e.ctrlKey)||(e.metaKey))	{
		if(e.shiftKey){
		    this.redo();
		}else{
		    this.undo();
		}
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
    if(xUI.onCanvasedit) return false;
	key = e.keyCode;//キーコードを取得
      console.log(key+':press:'+e.target.id);
    if(e.target.id != "iNputbOx") return ;
//      console.log(xUI.edmode+':xUI.edmode:');
    if(this.ipMode >= 2){
//iNputbOxでかつ原画モード時は補完サインをショートカット入力 160([alt]+[space]) 8211([alt]+[-])
        if(((key==160)||(key==8211))&&(e.altKey)){
            interpSign(); return false;
        };
    };
    if((key==8776)&&(e.altKey)){
//ブランクを入力[alt]+[X]
        xUI.put(nas_expdList('X'));xUI.spin("down");return false;
    };
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
if((key<48)||(key>57)){
if(xUI.eXMode){
	//ラピッドモード前駆状態フラグONなのでラピッドモード判定
	if(xUI.eXMode==1 && document.getElementById("iNputbOx").value.length==1){
//	入力が前キーと同一ならばモードアクティブ
		if(
		    xUI.eXCode==key &&
		    document.getElementById("iNputbOx").value.charCodeAt(0)==key
		){
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
//テスト　ラピッドコマンドを必ず実行するその後通常処理へ（ノースキップ）
if(false){
	for (var idx=0;idx<(rapidMode.length-1)/2;idx++){if(key==rapidMode[idx*2].charCodeAt(0))break;};
		if(idx<(rapidMode.length-1)/2){
			xUI.doRapid([rapidMode[idx*2+1]]);
		}
}
//モード変更直後でも1回はラピッド動作する
	if(xUI.eXMode>=2){
		if(xUI.eXMode==2){
//	モード遷移直後なので、現在の入力コントロールとバッファをクリアしてモードを確定する
			xUI.eXMode++;
			if(xUI.eddt==xUI.bkup())xUI.edChg(false);
			syncInput(xUI.bkup());
		};
	for (var idx=0;idx<(rapidMode.length-1)/2;idx++){if(key==rapidMode[idx*2].charCodeAt(0))break;};
		if(idx<(rapidMode.length-1)/2){
			xUI.doRapid([rapidMode[idx*2+1]]);
			return false;
		}else{
//		    return true;
			if (key!=13 && key!=8 && key!=9 ){
		//モード解除
				if(xUI.eXMode){
		xUI.eXMode=0;	xUI.eXCode=0;

		xUI.selectedColor=xUI.inputModeColor.NORMAL;
		xUI.spinAreaColor=xUI.inputModeColor.NORMALspin;
		xUI.spinAreaColorSelect=xUI.inputModeColor.NORMALselection;
		xUI.spinHi();
		return true;
				}
//        console.log(124)
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
}}
//		通常判定
	switch(key) {
case	27	: 			;//esc
	return false;
case	25	:if(! Safari) break;
case	0	:if(Firefox){return true;};//キーコード0を返すコントロールキー群
//  fierfox  が keypress で全てキーコード0:を返す状態になっている  2017.12
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
/**
    キーアップをキャプチャ。UI制御に必要 今のところは使ってない?
*/
xUI.keyUp = function (e){
//    if(xUI.onCanvasedit) return false;
//書式エディタ処理
	if((documentFormat.active)) return;
	if(xUI.player.keyboard){
		if(xUI.player.markSwap){
			if((e.keyCode == 32)&&(xUI.player.status=='run')) xUI.player.getCount=false;
		}else{
			if((e.keyCode == 13)&&(xUI.player.status=='run')) xUI.player.getCount=false;
		};
        if (e.keyCode == 77) {
	        if(xUI.player.status=='run') xUI.player.getCount=false;
	    };
	};
	key = e.keyCode;//キーコードを取得
    if(this.ipMode >= 2){
//原画モード時はショートカット入力 F-1 ,2 , 
//FunctionKey割当（TDTS互換）
        if(key==112){
            interpSign('○');return false;
        }else if(key==113){
            interpSign('●');return false;
        }else if(key==114){
            xUI.put(nas_expdList('X'));xUI.spin("down");return false;
        };
    };// */
//フォーカスエレメントがiNputbOx以外なら入力を戻す
    if(document.activeElement !== document.getElementById("iNputbOx")){
        if(((key==79)||(key==83))&&((e.ctrlKey)||(e.metaKey))){
        console.log("capt")
            return false;
        }else{
            return true;
        };
    };
    if((this.eXMode>=2)&&((key<48)||(key>57))){
		document.getElementById("iNputbOx").select();//live
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
case  112:	;	//F-1
    if(this.ipMode >= 2) interpSign('○');return false;
break;
case  113:	;	//F-2
    if(this.ipMode >= 2) interpSign('●');return false;
break;
case  114:	;	//F-3
    xUI.put(nas_expdList('X'));xUI.spin("down");return false;
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
	if(
        (!(xUI.edchg))&&
        (!(xUI.canvasPaint.active))&&
        (!(documentFormat.active))
	){
	    document.getElementById("iNputbOx").select();
	    document.getElementById("iNputbOx").focus();
	};
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
/**
 * コンテキストメニュー表示切り替え
 *  @params {Object Event}  e
 * メニュー表示位置をなるべく画面内に収めるように調整を追加
 *  開いた際にイベントの伝播を停止
 */
xUI.flipContextMenu=function(e){

    if(
        (xUI.canvasPaint.active)||
        (document.getElementsByClassName('ui-widget-overlay').length > 0)
    ) return false;//ペイントアクティブ モーダルウインドウ使用時は抑制
//スマートフォン判定
if((appHost.touchDevice)&&(!(appHost.tablet))){
	return false;//コンテキストメニューを一旦停止
};
    if(
        (xUI.contextMenu.isVisible())&&(
        (e.type == 'mousedown')||(e.type == 'touchend')
        )
    ){
console.log(e.target);
        if(e.target.onclick){
//クリックされたコマンドを実行
            e.target.onclick();
        }
//メニューを隠す
        xUI.contextMenu.hide();
        return false;
    }else if(
        ((e.button == 2 )&&(e.type == 'mousedown'))||
        ((e.button == 0 )&&(e.type == 'mousedown')&&(e.originalEvent))||
        (e.type == 'touchstart')
    ){
        e.stopPropagation();e.preventDefault();
console.log(e)
        var point ={x:0,y:0};
        if(e.type == 'touchstart'){
            point.x = e.originalEvent.touches[0].clientX;point.y = e.originalEvent.touches[0].clientY;//JQ.longtouch
//        point.x = e.touches[0].clientX;point.y = e.touches[0].clientY;//touchstart
        }else{
            point.x = e.clientX;point.y = e.clientY;
        };
//初期位置設定
        xUI.contextMenu.css('top' ,point.y-xUI.screenShift[1]);
        xUI.contextMenu.css('left',point.x-xUI.screenShift[0]);
        var onHeadline=false;
        var onTrackLabel=false;
        var onTimelineTrack=false;
        var onReference=false;
        var onTimeguide=false;
        var onReferenceHeader=false;
        var onTimelineTrackHeader=false;
        var outer = true;
        if(point.y <= document.getElementById('fixedHeader').clientHeight){
            onHeadline=true;outer = false;
        }else{
            if(e.target.id.match(/^\d+_\d+$/)){
                onTimelineTrack = true;outer = false;//sheet-cell-track
            }else if(e.target.id.match(/^r_\d+_\d+$/)){
                onReference  = true;outer = false;//referensce-sheet_cell-track
            }else if(e.target.id.match(/^tc.+$/)){
                onTimeguide  = true;outer = false;//timecode-track
            }else if(e.target.className.match(/^.+ref$/)){
                onReferenceHeader  = true;outer = false;//referennce-header-label
            }else if(e.target.className.match(/^camArea|editArea|^framenotelabel|^dialoglabel/)){
                onTimelineTrackHeader  = true;outer = false;//
            }else if(e.target.id.match(/^L\d+_\-?\d+_\d+$/)){
                onTrackLabel  = true;outer = false;
            };
        };
console.log('onHeadline:'+onHeadline);
        if(onHeadline){
            $('ul.cMonHeadline').each(function(){$(this).show();});
            if($('#pMenu').isVisible()){
                $('.noDm').each(function(){$(this).hide();});
            }else{
                $('.noDm').each(function(){$(this).show();});
            };
            if($('#pmui').isVisible()){
                $('.noPm').each(function(){$(this).hide();});
            }else{
                $('.noPm').each(function(){$(this).show();});
            };
        }else{
            $('ul.cMonHeadline').each(function(){$(this).hide();});    
        };
        if(onTrackLabel){
            $('.cMonTrackLabel').each(function(){$(this).show();});
        }else{
            $('.cMonTrackLabel').each(function(){$(this).hide();});    
        };
        if(onTimelineTrack){
console.log('onTrack')
            if(appHost.touchDevice) return;
            $('.cMonTrack').each(function(){$(this).show();});
            switch(xUI.XPS.xpsTracks[xUI.Select[0]].option){
            case 'dialog':
                $('.onDialog').each(function(){$(this).show();});
                $('.onTiming').each(function(){$(this).hide();});
                $('.onCamera').each(function(){$(this).hide();});
            break;
            case 'timing':
                $('.onDialog').each(function(){$(this).hide();});
                $('.onTiming').each(function(){$(this).show();});
                $('.onCamera').each(function(){$(this).hide();});
            break;
            case 'camera':
                $('.onDialog').each(function(){$(this).hide();});
                $('.onTiming').each(function(){$(this).hide();});
                $('.onCamera').each(function(){$(this).show();});
            break;
            default:
            };
        }else{
            $('.cMonTrack').each(function(){$(this).hide();});    
        };
        if(onTimelineTrackHeader){
            $('.cMonTrackHeader').each(function(){$(this).show();});
        }else{
            $('.cMonTrackHeader').each(function(){$(this).hide();});    
        };
        if(onReference){
            $('.cMonReference').each(function(){$(this).show();});
        }else{
            $('.cMonReference').each(function(){$(this).hide();});    
        };
        if(onReferenceHeader){
            $('.cMonReferenceHeader').each(function(){$(this).show();});
        }else{
            $('.cMonReferenceHeader').each(function(){$(this).hide();});    
        };
        if(outer){
            $('.cMouter').each(function(){$(this).show();});
        }else{
            $('.cMouter').each(function(){$(this).hide();});
        };
/*    
    if(xUI.edmode==0){
        $('.emode0').each(function(){$(this).show();});
    }else{
        $('.emode0').each(function(){$(this).hide();});
    }
    if(xUI.uiMode=='management'){
        $('.pmad').each(function(){$(this).show();});
    }else{
        $('.pmad').each(function(){$(this).hide();});
    }
*/

/*
xUI.contextMenu.html([
('#'+e.target.id+':'+e.target.className)+'<hr>',
'onHeadline           :'+onHeadline,
'onTimelineTrack      :'+onTimelineTrack,
'onReferenece         :'+onReferenece,
'onTimeguide          :'+onTimeguide,
'onReferenceHeader     :'+onReferenceHeader,
'onTimelineTrackHeader:'+onTimelineTrackHeader,
'Select     :'+xUI.Select,
'Selection  :'+xUI.Selection,
'edmode     :'+xUI.edmode,
'viewOnly   :'+xUI.viewOnly,
'viewMode   :'+xUI.viewMode
].join('<br>\n'));
*/
        xUI.contextMenu.show();
//表示前に確定したサイズから画面外に隠れるケースで位置を調整
//上下

        if((window.innerHeight - (xUI.contextMenu.position().top+xUI.contextMenu.height())) < 0){
            xUI.contextMenu.css('top',(point.y-xUI.screenShift[1]-xUI.contextMenu.height())+'px')
        };
        if(xUI.contextMenu.position().top < 0){
            xUI.contextMenu.css('top','0px');
        };
//左右 タイムシートセルとそれ以外で切り分け
        if(e.target instanceof HTMLTableCellElement){
            if((window.innerWidth - (xUI.contextMenu.position().left+xUI.contextMenu.width())) < 0){
                xUI.contextMenu.css('left',point.x-xUI.screenShift[0]-xUI.contextMenu.width()-e.target.clientWidth);
            };
        }else{
            if((window.innerWidth - (xUI.contextMenu.position().left+xUI.contextMenu.width())) < 0){
                xUI.contextMenu.css('left',point.x-xUI.screenShift[0]-xUI.contextMenu.width()-32);
            };
        };
console.log(e);
        return false;
    };
    return true;
}
/*
onTouchStart
onTouchEnd
onTouchMove
*/
xUI.Touch = function(e){
    console.log(e);
//     if(e.id == "iNputbOx"){e.stopPropagation();e.preventDefault();}
//タッチデバイス（ドラグムーブが標準であるタブレット・モバイル）
    if(e.type == 'touchstart'){
        if(! xUI.Touch.tapCount){
            xUI.Touch.tapCount ++;
            xUI.Touch.tapItem = e.target;
            setTimeout(function(){xUI.Touch.tapCount = 0;xUI.Touch.tapItem = null;},500);
        }else{
// ビューポートの変更(ズーム)を防止
            e.preventDefault() ;
// ダブルタップイベントの処理内容
            if((xUI.Touch.tapCount)&&(xUI.Touch.tapItem == e.target)) console.log(xUI.Touch.tapCount + " : !! doubleTap !!" ) ;
            xUI.Touch.tapCount ++;
// タップ回数をリセット
//            xUI.Touch.tapCount = 0 ;
        };
    }
/*    if((e.target.className)&&(e.target.className.match(/floatPanel/))){
        e.stopPropagation();e.preventDefault();
        return false;
    };// */
    return true;

    return xUI.Mouse(e);
}
xUI.Touch.tapCount = 0;
xUI.Touch.tapItem  = null;

/*    xUI.Mouse(e)
引数:    e    マウス｜タッチイベント
戻値:        UI制御用
    マウス動作
ポインタ処理を集中的にコントロールするファンクション

関連プロパティ
    xUI.edmode
0 : 通常編集
1 : ブロック編集
2 : セクション編集
3 : セクション編集フローティング
モード変更はxUI.mdChg関数を介してい行う

モード別テーブルセル編集操作一覧


ポインタイベント対応開始
マルチポイント対応変数を増設

xUI.Mouse.pointerCash : []
xUI.Mouse.down        : Bool
xUI.Mouse.moveDelta   : []
 */
xUI.Mouse=function(e){
if(e.type == 'click') console.log('CLICK!');
	if((documentFormat.active)||(xUI.onCanvasedit)) return;
    var currentTrack = xUI.XPS.xpsTracks[xUI.Select[0]];
    var exch = ((e.ctrlKey)||(e.metaKey));
    if((xUI.edmode==3)&&(e.target.id=='sheet_body')&&(e.type=='pointerout')){
        xUI.sectionUpdate();
        xUI.mdChg(2);
        xUI.Mouse.action=false;
        return false;
    };
if(dbg) dbgPut(e.target.id+":"+e.type.toString());
if(xUI.edchg){ xUI.eddt= document.getElementById("iNputbOx").value };
//IEのとき event.button event.target
//    if(MSIE){TargeT = event.target ;Bt = event.button ;}else{};
        var TargeT=e.target;var Bt=e.which;//ターゲットオブジェクト取得
//IDの無いエレメントは処理スキップ
    if(! TargeT.id){
        xUI.Mouse.action = false;
//         if (xUI.edmode==3){xUI.Mouse()}
        return false;
    }
//カラム移動処理の前にヘッダ処理を追加 2010/08
    if(TargeT.id.match(/^L([0-9]+)_(-?[0-9]+)_([0-9]+)$/)) {
        var tln=1*RegExp.$1;var pgn=1*RegExp.$2;var cbn=1*RegExp.$3;//timeline(column)ID/pageID/columnBlockID
switch(e.type){
case    "dblclick":
        reNameLabel((tln).toString());
break;
case    "pointerdown":
case    "mousedown":
case    "touchstart":
    if(xUI.edmode==0)xUI.changeColumn(tln,2*pgn+cbn);
break;
}
    xUI.Mouse.action = false;
    return ;
    }
//-------------------ヘッダ処理解決

//    if(TargeT.id.split("_").length>2){return false};//判定を変更
//ページヘッダ処理終了
//=============================================モード別処理
if(xUI.edmode==3){
/*
    セクション編集フローティング
    フローティング移動中
*/
    var hottrack=TargeT.id.split('_')[0];
    var hotpoint=TargeT.id.split('_')[1];
switch (e.type){
case    "pointerdown" :
case    "dblclick"    :
case    "mousedown"   :
case    "touchstart"  :
//	document.getElementById("iNputbOx").focus();
break;
case    "click"       :
case    "pointerup"   :
case    "mouseup"     ://終了位置で解決
case    "touchend"    ://終了位置で解決
//[ctrl][shift]同時押しでオプション動作
    xUI.sectionUpdate();
    xUI.mdChg(2);
    xUI.Mouse.action=false;
break;
case    "pointerenter":
case    "pointerover" :
case    "mouseover"   :
    if((hottrack!=xUI.Select[0])||(! xUI.Mouse.action)) {
        if(TargeT.id && TargeT.id.match(/r?L\d/)){
            xUI.sectionUpdate();
            xUI.mdChg(2);
            xUI.Mouse.action=false;
        }
        return false
    };
if(! xUI.Mouse.action){
    return false;

    if(xUI.Mouse.action){
        if (TargeT.id && xUI.Mouse.rID!=TargeT.id ){
            xUI.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(xUI.spinSelect)) xUI.spin("update");
            return false;
        }else{
            return true;
        };
    };
}else{
        xUI.sectionPreview(hotpoint);
}
    break;
default    :    return true;
};
    return false;

}else if(xUI.edmode==2){
//	document.getElementById("iNputbOx").focus();
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
フローティングムーブに準ずる処理  ホットポイントオフセットが存在する
        head
        tail
トラック内でセクションが伸縮
他のノードを固定してヘッドまたはテールノードが移動することでセクションを伸縮する  

edmode==3  中は、マウスオーバーでセクション body||head||tail 移動
リリースで移動（＝編集）を解決  1回毎に更新回数を記録
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
    値が０なら前方伸長  値が末尾なら後方伸長それ以外は移動
    継続時間が1の場合は末尾として扱う
    解決順が  末尾＞先頭＞以外になれば操作種別を１種にできる
    すべてsectionMove(start,duration)に集約できそう
    
*/
switch (e.type){
case    "dblclick"    :
//セクション操作モードを抜けて確定処理を行う
//確定処理はmdChg メソッド内で実行
              xUI.mdChg("normal");
break;            
case    "pointerdown"  :
case    "mousedown"    :
case    "touchstart"   :
    //サブモードを設定
    if((
        Math.abs(hotpoint -(xUI.Select[1]+(xUI.Selection[1]/2))) >
        Math.abs(xUI.Selection[1]/2)
        )&&(hottrack == xUI.Select[0])
    ){
//レンジ外
        if (e.shiftKey){
//近接端で移動
            xUI.sectionManipulateOffset[1] = (hotpoint<xUI.Select[1])? 0:xUI.Selection[1];
            xUI.sectionManipulateOffset[0] = 'body';
        }else if((e.ctrlKey)||(e.metaKey)){
//近接端で延伸
            xUI.sectionManipulateOffset[1] = (hotpoint<xUI.Select[1])? 0:xUI.Selection[1];
            xUI.sectionManipulateOffset[0] = (hotpoint<xUI.Select[1])? 'head':'tail'; 
        }else{
            return xUI.mdChg(0);//モード解除
        }
        xUI.sectionPreview(hotpoint);
        xUI.sectionUpdate();
    }else{
//フロートモードへ遷移
        xUI.sectionManipulateOffset[1] = hotpoint-xUI.Select[1];
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
case    "click"    :;//クリックしたセルで解決  (any):body/+[ctrl]:head/+[shift]:tail 
    if(hottrack!=xUI.Select[0]) {
        //対象トラック外なら確定して解除
        xUI.mdChg("normal");        
    }
break;

case    "pointerup"  ://
case    "mouseup"    ://
case    "touchend"   ://終了位置で解決
//[ctrl]同時押しで複製処理
    //  xUI.mdChg(0,(e.ctrlKey));
    xUI.Mouse.action=false;
    xUI.floatTextHi();
break;
case    "pointerenter" :
case    "pointerover"  :
case    "mouseover"    :
    
//トラックが異なる場合 NOP return
//    var sectionRegex=new RegExp('^'+String(xUI.Select[0])+'_([0-9]+)$');
//    if((!(TargeT.id.match(sectionRegex)))||(! xUI.Mouse.action)){return false};//ターゲットトラック以外を排除
    if((hottrack!=xUI.Select[0])||(! xUI.Mouse.action)) {return false};
if(! xUI.Mouse.action){
    return false;

    if(xUI.Mouse.action){
        if (TargeT.id && xUI.Mouse.rID!=TargeT.id ){
            xUI.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(xUI.spinSelect)) xUI.spin("update");
            return false;
        }else{
            return true;
        };
    };
}else{
            xUI.sectionPreview(hotpoint);
}
    break;
default    :    return true;
};
    return false;

}else if(xUI.edmode==1){
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
//              xUI.mdChg("section");
//              xUI.floatTextHi();//導入処理
//            xUI.selectCell(TargeT.id);
//    xUI.floatDestAddress=xUI.Select.slice();
            
    case    "pointerdown" :
    case    "mousedown"   :
//  case    "touchstart"   :
    case    "click"       :
    case    "pointerup"   :
    case    "mouseup"     :
    case    "touchend"    ://終了位置で解決
//    console.log("<<<<<<")
//[ctrl]同時押しで複製処理
      xUI.mdChg(0,((e.ctrlKey)||(e.metaKey)));
      xUI.floatTextHi();
    break;
    case    "pointerover"  ://
    case    "pointerenter" ://
    case    "mouseover"    ://可能な限り現在位置で変数を更新
        if(!(TargeT.id.match(/^([0-9]+)_([0-9]+)$/))){return false};//シートセル以外を排除
//オフセットを参照して  .Select .Selection を操作する
/*
*/
    if(false){
        if(xUI.Mouse.action){
            if (TargeT.id && xUI.Mouse.rID!=TargeT.id ){
                xUI.selection(TargeT.id);
                if(((e.ctrlKey)||(e.metaKey))||(xUI.spinSelect)) xUI.spin("update");
                return false;
            }else{
                return true;
            };
        };
    }else{
        xUI.selectCell(TargeT.id);
        xUI.floatDestAddress=xUI.Select.slice();
    };
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
            xUI.mdChg("section",TargeT.id);
            xUI.Mouse.action=false;
            return false;
    break;
    case    "pointerdown"  :
    case    "mousedown"    :
    case    "touchstart"   :
//document.getElementById("iNputbOx").value=("mouseDown")
        if(xUI.edchg){
		    var expdList = iptFilter(nas_expdList(xUI.eddt).split(","),currentTrack,xUI.ipMode,exch);
		    xUI.put(expdList);//更新
		    xUI.selectCell(add(xUI.Select,[0,1]));//入力あり
        }
        xUI.Mouse.rID=xUI.getid("Select");//
        xUI.Mouse.sID=TargeT.id;
        xUI.Mouse.action=true;

//    if(TargeT.id==xUI.getid("Select"))
//    {    }else{    };

        if(xUI.Selection[0]!=0||xUI.Selection[1]!=0){
//選択範囲が存在した場合
//if(dbg) dbgPut(xUI.edmode+":"+xUI.getid("Select")+"=="+TargeT.id);
//        var CurrentSelect=TargeT.id.split("_");
/*
        var CurrentAction=xUI.actionRange();
        if(
        (CurrentAction[0][0]<=CurrentSelect[0] && CurrentAction[1][0]>=CurrentSelect[0])&&
        (CurrentAction[0][1]<=CurrentSelect[1] && CurrentAction[1][1]>=CurrentSelect[1])
        ){}
*/
        if(TargeT.id==xUI.getid("Select")){
              //フォーカスセルにマウスダウンしてブロック移動へモード遷移
            //クリック時とダブルクリック時の判定をしてスキップしたほうが良い
//            if(TargeT.id!=xUI.floatDestAddress.join("_")){}
            xUI.mdChg('block');
            xUI.floatTextHi();
            xUI.selectCell(TargeT.id);
            xUI.floatDestAddress=xUI.Select.slice();

            xUI.Mouse.action=false;
            return false;
          }else{
        if(e.shiftKey){
            xUI.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(xUI.spinSelect)) xUI.spin("update");
            return false;//マルチセレクト
        }else{
            xUI.selection();//セレクション解除
            xUI.Mouse.action=false;
            xUI.selectCell(TargeT.id);//セレクト移動
        }
            return false;
          }
        }else{
//選択範囲が存在しない場合
            xUI.selection();//セレクション解除
        };

        if(e.shiftKey){
            xUI.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(xUI.spinSelect)) xUI.spin("update");
            return false;//マルチセレクト
        }else{
            if ((! e.ctrlKey)&&(! e.metaKey)){xUI.selection()};//コントロールなければ選択範囲の解除

            //xUI.Mouse.action=false;
            xUI.selectCell(TargeT.id);
        };
    break;
case    "pointerup"  :
case    "mouseup"    :
case    "touchend"   :
        xUI.Mouse.action=false;
    if( xUI.Mouse.sID!=TargeT.id){
        if(e.shiftKey){
            xUI.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(xUI.spinSelect)) xUI.spin("update");
            return false;//マルチセレクト
        }else{
            return false;//セレクトしたまま移動
        };
    };
//    break;
case    "click"    :
    if(!(document.getElementById("iNputbOx").disabled)){
//        document.getElementById("iNputbOx").focus();
    };
    break;
case    "pointerenter" :
case    "pointerover"  :
case    "mouseover"    :
    if(xUI.Mouse.action){
        if (TargeT.id && xUI.Mouse.rID!=TargeT.id ){
            xUI.selection(TargeT.id);
            if(((e.ctrlKey)||(e.metaKey))||(xUI.spinSelect)) xUI.spin("update");
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
//    xUI.Mouse.rID=false           ;//マウスカーソルID
/** ドキュメントを開く
    引数'localFile'の場合は、サーバリポジトリでなくローカルファイルインポートを優先する。
    fileBox.openFileDBが関数として存在する場合は、  AIR準拠環境でローカルファイルの操作が可能なので実行
    それ以外は、インポート手順に従ってローカルファイルチューザーを提示
    失敗時はNOP
    引数なしのケースでは、リポジトリの操作を行う。（リポジトリドキュメントチューザーを提示）
    ドキュメント編集中はリポジトリの操作がブロックされるので、強制的にローカルインポートモードに遷移
    
*/
xUI.openDocument=function(mode){
    if(xUI.uiMode=='production') {mode='localFile';}
//    document.getElementById('loadShortcut').value='true';
    document.getElementById('loadTarget').value  ='body';
    if(mode=='localFile'){
        if(fileBox.openFileDB){
            fileBox.openFileDB();
        }else{
//        this.sWitchPanel("Data");//インポート・エクスポートパネルを呼び出す必要はなくなったので削除
//            if(document.getElementById('optionPanelData').style.display!='inline'){xUI.sWitchPanel('Data')};
            document.getElementById('myCurrentFile').value = '';
            document.getElementById('myCurrentFile').click();
        }
    }else{
        xUI.sWitchPanel("File");   
    }
}
/**
りまぴん-WEB-用　ローカルファイルインポートコマンド
loadTarget 変数の設定とファイルセレクタのクリアを同時に行い
クリックイベントを送出する
*/
xUI.importDocument =function(targetArea){
    if(! targetArea) targetArea = '';
    document.getElementById('loadTarget').value = targetArea;
    if(fileBox.openFileDB){
        fileBox.openFileDB();
    }else{
        document.getElementById('myCurrentFile').value = '';//これをカラにしないとchangeイベントが発火しないケースがある。
        document.getElementById('myCurrentFile').click();
    }
}

/** ドキュメントを保存
    @params {String} mode
    
    現在のドキュメントをしかるべきロケーションに上書き保存する。
    保存ロケーションの判定はxUI.uiModeによって判別
    case "floating":  //ローカルファイルを扱える唯一のモード
         AIRローカルファイル:fileBox.saveFile/fileBox.saveAs
         その他:serviceAgent.addEntry/callEcho;
    case "production": // ネットワークドキュメント編集中
     ネットワークリポジトリドキュメント:serviceAgent.pushEntry(xUI.XPS,function(){xUI.setStored("current");sync();})/
     
    default:

    trueに判定される引数が与えられた場合、可能な限りローカルファイルシステムヘの別名保存を行う。
    AIR環境の場合は、fileBox.saveAs()  それ以外の場合はエコーサーバ経由のダウンロード
*/
xUI.storeDocument=function(mode){
//        this.sWitchPanel("Data");//インポート・エクスポートパネルを呼び出す必要はなくなったので削除
    switch(xUI.uiMode){
        case 'floating':;
            if(fileBox.saveFile){
                if(mode){
                    fileBox.saveAs();
                }else{
                    fileBox.saveFile();//setStoredeの判定はsaveFileメソッド内で行うのでここでは不要
                }
            }else{
                if(mode){
                    callEcho();//ダウンロード保存
                }else{
                    serviceAgent.addEntry(xUI.XPS,function(){
                        var myIdentifier = Xps.getIdentifier(xUI.XPS,'job');
                        serviceAgent.currentRepository.getSCi(function(){
                            serviceAgent.currentRepository.getEntry(myIdentifier);
                        },false,myIdentifier);
                    },function(){
                    alert("データ登録失敗");
                    });
                }
            }
        break;
        case 'production':;
            if(mode){
                callEcho();//ダウンロード保存
            }else{
    	        if(! (this.setStored())){
	                serviceAgent.pushEntry(
	                    xUI.XPS,
	                    function(){xUI.setStored("current");sync();}
                    );
                };//現行ドキュメントの上書き、最終保存から変更なければ処理スキップ
            }
        break;
        case 'browsing':;
        case 'management':;
            if(mode){
                callEcho();//ダウンロード保存
            }
        break;
    }
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
      currentOffset.left = $(document).scrollLeft();//window.scrollX
      currentOffset.top  = $(document).scrollTop() ;//window.scrollY

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
        scrollTo(myLeft,myTop);
      if(appHost.platform=="CSX"){
        this.onScroll();
      };
    };
}

/* xUI.onScroll
    SheetBody(document.body)のスクロールイベントに合わせ相当量の移動をヘッダに与える
３秒目からセルの高さが減少するのは、出力ルーチン側のカラム処理の問題だと思われる
スクロールが外れるのは、Rmp_initを通過しない書き換え部分で  body の初期化が発生するためと推測
onscrollの設定位置を一考
マージン部分のカバーをするか、または全体paddingが必要
キーボードによるスクロールが発生した場合、ケースを見て対応が必要

2015.04.22
*/
   xUI.onScroll=function() {
    xUI.contextMenu.hide();
    var scrollOffsetV = (appHost.touchDevice)? 0:document.getElementById("app_status").getBoundingClientRect().bottom;
    document.getElementById('UIheaderScrollV').style.top  = (scrollOffsetV - window.scrollY)+'px';//qdr3
    document.getElementById('UIheaderScrollH').style.left = - window.scrollX +'px';
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
 *  xUI.panelTable
 *      <key>:{
 *          elementId :<String HTMLElementId>,
 *          type      :<String fix|modal|float|doc>,
 *          status    :<optional {function|expression}>,
 *          uiOrder   :<optional {Number}>,
 *          exclusive :<排他フラグ>
 *      }
 type
    fix     固定位置パネル
        固定
    float   フロートタイプダイアログパネル(jqui)
        モバイル運用の際は位置固定・排他
    modal   モーダルダイアログパネル（jqui疑似モーダルダイアログ）
        常に排他
    doc     ドッキングタイプ（未実装 - 予約）
    exclusive_item_group アプリ別排他グループリスト
    またはキー値の配列
    [<key>.....]
 status
    function または 実行エクスプレッション
 uiOrder       数値の低いほど表示優先順位が高い 低優先指定の場合は高位のアイテムを包括する
   -1:other             番外・優先度なし 比較対象外 このアトリビュートを持たない場合もこれに準ずる
    0:restriction       制限モード入力規制
    1:input-minimum     入力最小モード
    2:compact           コンパクトモード
    3:default-basic     標準モード
    4:full              フルサイズモード
 */
xUI.panelTable = {
// modal-dialog
    'Ver'      :{elementId:"optionPanelVer"      ,type:'modal',note:"アバウト(汎)"},
    'NodeChart':{elementId:"optionPanelNodeChart",type:'modal',note:"ノードチャート(汎)"},
    'Pref'     :{elementId:"optionPanelPref"     ,type:'modal',note:"環境設定(汎)"},
    'Rol'      :{elementId:"optionPanelRol"      ,type:'modal',note:"書込み制限警告(汎)"},
    'File'     :{elementId:"optionPanelFile"     ,type:'modal',note:"サーバ｜ローカル ドキュメントブラウザ(汎)"},
    'SCI'      :{elementId:"optionPanelSCI"      ,type:'modal',note:"Xpsインポートパネル Importer(汎)"},
    'Prog'     :{elementId:"optionPanelProg"     ,type:'modal',note:"プログレス表示（汎）"},
    'Scn'      :{elementId:"optionPanelScn"      ,type:'modal',note:"Xpsタイムシート情報"},
// 
    'Item'     :{elementId:"optionPanelInsertItem" ,type:'modal',note:"新規アイテム挿入"},
//float-panel
    'Paint'    :{elementId:"optionPanelPaint" ,uiOrder: -1,type:'float',note:"手書きメモ(汎)",func(elm,status){
        var currentStatus = $("#optionPanelPaint").isVisible();
        var opt = (status == 'switch')? (!(currentStatus)) : ((status == 'show')? true:false);
        if(opt != currentStatus){
            if(opt){
//show
                $("#optionPanelPaint").show();
                xUI.canvasPaint.active = true;
                if((xUI.viewMode == 'PageImage')&&(xUI.XPS.timesheetImages.imageAppearance == 0)){
                    xUI.setAppearance(1,true);
                };
                xUI.canvasPaint.syncTools();
            }else{
//hide
                if(xUI.canvas) xUI.canvasPaint.unset();
                xUI.canvasPaint.active = false;
                $("#optionPanelPaint").hide();
            };
            if(appHost.touchDevice){
                document.getElementById('fixedPanels').style.display = (opt)? 'none':'';
                xUI.adjustSpacer();
            };
        };
    }},
    'Draw'     :{elementId:"optionPanelDraw"  ,uiOrder:-1,type:'float',note:"手書きメモv(汎)"},
    'Stamp'    :{elementId:"optionPanelStamp" ,uiOrder:-1,type:'float',note:"スタンプ選択"},
    'Text'     :{elementId:"optionPanelText"  ,uiOrder:-1,type:'float',note:"テキストパネル"},
    'Timer'    :{elementId:"optionPanelTimer" ,uiOrder:-1,type:'fix'  ,note:"ストップウォッチ(汎)"},
    'Sign'     :{elementId:"optionPanelSign"  ,uiOrder:-1,type:'float',note:"署名パネル(汎)"},
    'Snd'      :{elementId:"optionPanelSnd"   ,uiOrder:-1,type:'float',note:"remaping Dialog|Snd"},
    'Ref'      :{elementId:"optionPanelRef"   ,uiOrder:-1,type:'float',note:"remaping 参考画像パネル"},
    'DocFormat':{elementId:"optionPanelDocFormat",uiOrder:-1,type:'float',note:"書式編集パネル",func:function(elm,status){
//パネル立ち上げと同時に現在のドキュメントのsheetLooksを渡す
        var currentStatus = $("#optionPanelDocFormat").isVisible();
        var opt = (status == 'switch')? (!(currentStatus)) : ((status == 'show')? true:false);
        if(xUI.viewMode == 'Compact') opt = false;
        if(opt != currentStatus){
            if(opt){
//show
                if((xUI.XPS.timesheetImages.imageAppearance == 0)||(xUI.XPS.timesheetImages.imageAppearance == 1)) xUI.setAppearance(0.5,true);
                documentFormat.startup(JSON.stringify(xUI.XPS.sheetLooks));//現仕様でxUI.XPSは必ず sheetLooksを持つのでそれを渡す
                $("#optionPanelDocFormat").show();
                documentFormat.expand(false);//true|false
            }else{
//hide
                documentFormat.close(true);//消去ボタンで消すとデータを終了後にデータ更新を行う（保存終了）
                $("#optionPanelDocFormat").hide();
            };
            if(appHost.touchDevice){
                document.getElementById('fixedPanels').style.display = (opt)? 'none':'';
                xUI.adjustSpacer();
            };
        };
    }},
    'ImgAdjust':{elementId:"optionPanelImgAdjust",uiOrder:-1,type:'float',note:"画像調整パネル",func:function(elm,status){
//パネル立ち上げ時に現在のタイムシートの画像を取得
        var pgid = Math.floor(xUI.Select[1]/nas.FCT2Frm(xUI.XPS.sheetLooks.PageLength,new nas.Framerate(xUI.XPS.sheetLooks.FrameRate).rate));
        var currentImg = (xUI.XPS.timesheetImages.members[pgid])? xUI.XPS.timesheetImages.members[pgid]:null;
        if(! currentImg){alert('noimage');return;};
        var currentStatus = $("#optionPanelImgAdjust").isVisible();
        var opt = (status == 'switch')? (!(currentStatus)) : ((status == 'show')? true:false);
        if(opt != currentStatus){
            if(opt){
//show
                if((xUI.XPS.timesheetImages.imageAppearance == 0)||(xUI.XPS.timesheetImages.imageAppearance == 1)) xUI.setAppearance(0.5);
                xUI.imgAdjust.startup(pgid);
                $("#optionPanelImgAdjust").show();
                xUI.imgAdjust.expand(false);
            }else{
//hide
                xUI.imgAdjust.close();
                $("#optionPanelImgAdjust").hide();
            };
//            xUI.setAppearance();
        };
    }},
    'Cam'      :{elementId:"optionPanelCam"   ,uiOrder:-1,type:'float',note:"remaping カメラワーク入力補助パネル"},
    'Stg'      :{elementId:"optionPanelStg"   ,uiOrder:-1,type:'float',note:"remaping ステージワーク入力補助パネル"},
    'Sfx'      :{elementId:"optionPanelSfx"   ,uiOrder:-1,type:'float',note:"remaping コンポジット入力補助パネル"},
    'Tbx'      :{elementId:"optionPanelTbx"   ,uiOrder:-1,type:'float',note:"remaping ツールボックス"},
    'Memo'     :{elementId:"optionPanelMemo"  ,uiOrder:-1,type:'float',note:"Xpsメモ編集(xpsedit)",func:function(elm,status){
        var currentStatus = $("#optionPanelMemo").isVisible();
        var opt = (status == 'switch')? (!(currentStatus)) : ((status == 'show')? true:false);
        if(opt != currentStatus){
            if(opt){
//show
//パネル立ち上げ時に編集ボタンテーブルの内容を更新	
				if((document.getElementById("myWords").innerHTML=="word table")&&(myWords)){
					document.getElementById("myWords").innerHTML=putMyWords();
				};
				document.getElementById("rEsult").value = xUI.XPS.xpsTracks.noteText;
				$("#optionPanelMemo").show();
			}else{
//hide
				xUI.XPS.xpsTracks.noteText = document.getElementById("rEsult").value;
				$("#optionPanelMemo").hide();
			};
		};
    }},
//inplace-UI-panel common
    'Login'         :{elementId:"optionPanelLogin"        ,uiOrder:-1,type:'fix', note:"サーバログイン(汎)"},
    'menu'          :{elementId:'pMenu'                   ,uiOrder: 3,type:'fix', note:"WEB pulldown menu(汎)"},
    'Dbg'           :{elementId:'optionPanelDbg'          ,uiOrder:-1,type:'fix', note:"debug console(汎)"},
    'ibC'           :{elementId:'toolbarPost'             ,uiOrder: 1,type:'fix', note:"iconButtonColumn(汎)"},
    'ToolBr'        :{elementId:'toolbarHeader'           ,uiOrder: 3,type:'fix', note:"remaping ツールバー"},
    'Utl'           :{elementId:'optionPanelUtl'          ,uiOrder: 3,type:'fix', note:"remaping ユーティリティツール"},
    'SheetHdr'      :{elementId:'sheetHeaderTable'        ,uiOrder: 3,type:'fix', note:"remaping シートヘッダ"},
    'headerTool'    :{elementId:'headerTool'              ,uiOrder: 1,type:'fix', note:"remaping シートヘッダツール(カウンタ等)"},
    'inputControl'  :{elementId:'inputControl'            ,uiOrder: 1,type:'fix', note:"remaping 入力コントロール" ,func:function(elm,status){
        var currentStatus = (elm.getAttribute('class').indexOf('inputControl-show') >= 0)? true:false;
        var opt = (status == 'switch')? (!(currentStatus)) : ((status == 'show')? true:false);
        if(opt != currentStatus){
            if(opt){
                elm.setAttribute('class','inputControl inputControl-show');
            }else{
                elm.setAttribute('class','inputControl inputControl-hide');
            };
            xUI.adjustSpacer();
        };
    }},
    'account_box'   :{elementId:'account_box'             ,uiOrder: 3,type:'fix', note:"remaping アカウント表示"},
    'pmui'          :{elementId:'pmui'                    ,uiOrder: 2,type:'fix', note:"remaping 作業管理バー(旧)"},
    'pmcui'         :{elementId:'pmcui'                   ,uiOrder: 1,type:'fix', note:"remaping 作業管理バーアイコン(新)"},
    'appHdBr'       :{elementId:'applicationHeadbar'      ,uiOrder: 1,type:'fix', note:"uat アプリケーションヘッドバー"},

//inplace-UI-panel xpst editor
    'extSig'        :{elementId:"extSig"                  ,uiOrder: 3,type:'fix', note:"拡張署名欄(xpsedit)"},

    'memoArea'      :{elementId:"memoArea"                ,uiOrder: 3,type:'fix', note:"Xpsメモ欄(xpsedit)"},
    'Data'          :{elementId:"optionPanelData"         ,uiOrder:-1,type:'fix', note:"remaping Import|Export(汎)"},
    'AEKey'         :{elementId:"optionPanelAEK"          ,uiOrder:-1,type:'fix', note:"remaping AEKey"},

//inplace-UI-panel pman\reName\xmap browser
    'Search'         :{elementId:"optionPanelSearch"       ,sync:"search"         ,uiOrder: 4,type:'fix', note:"reName検索(汎)"},
    'PreviewSize'    :{elementId:"optionPanelPreviewSize"  ,sync:"preview"        ,uiOrder: 4,type:'fix', note:"reNameプレビュー指定UI"},
    'ThumbnailSize'  :{elementId:"optionPanelThumbnailSize",sync:"thumbnail"      ,uiOrder: 4,type:'fix', note:"reNameサムネイルサイズ｜表示UI"},
    'prefix'         :{elementId:"prefixStrip"             ,sync:"prefix"         ,uiOrder: 4,type:'fix', note:"reNameプレフィクスUI"},
    'suffix'         :{elementId:"suffixStrip"             ,sync:"suufix"         ,uiOrder: 4,type:'fix', note:"reNameサフィックスUI"},
    'rename_setting' :{elementId:'rename_setting'          ,sync:"rename_setting" ,uiOrder: 4,type:'fix', note:"reName 操作設定"},
    'flip_control'   :{elementId:'flip_control'            ,sync:"flipControl"    ,uiOrder: 4,type:'fix', note:"reName フリップコントローラ"},
    'flip_seekbar'   :{elementId:'flip_seekbar'            ,sync:"flipSeekbar"    ,uiOrder: 4,type:'fix', note:"reName フリップ再生シークバー"},
    'lightBoxControl':{elementId:'lightBoxControl'         ,sync:"lightBoxControl",uiOrder: 4,type:'fix', note:"reName ライトボックススイッチ"},
    'lightBoxProp'   :{elementId:'lightBoxProperty'        ,sync:"lightBoxProp"   ,uiOrder: 4,type:'fix', note:"reName ライトボックス設定"},
    'Zoom'        :{elementId:'screenZoom'              ,uiOrder: 4,type:'fix', note:"ズーム設定"},
    'Appearance'  :{elementId:'docImgAppearance'        ,uiOrder: 4,type:'fix', note:"アピアランス設定"},
/*
    '':{elementId:'',type:''},
    '':{elementId:'',type:''},
    '':{elementId:'',type:''},

//*/
    '_exclusive_items_':{
        type:'exclusive_item_group',
        'remaping'   :['Data','AEKey','Tbx','Sfx','Stg','Cam','ImgAdjust','DocFormat','Ref','Sign','Stamp','Draw','Paint','Item','Scn','File','Snd'],
        'xpsedit'    :["Memo","Data","AEKey"],
        'pman_reName':[]
    }
    
};
/**
    @params {String}    itm
	りまぴんフロートウィンドウ初期化
	
	モバイルデバイス上ではフローティングパネル不使用
	スタティックパネルとして初期化される
	ヘッドバーは非表示
	パネルは他のパネル類と排他
	パネル幅は、ウインドウ全幅
	パネル高さは、内容による
*/
xUI.initFloatingPanel = function(itm){
	if(
		(xUI.panelTable[itm].type != 'float')||
		(!(document.getElementById(xUI.panelTable[itm].elementId)))
	) return;
	var target = xUI.panelTable[itm].elementId;
	if(appHost.touchDevice){
console.log('init : '+ target)
//モバイルデバイスモード初期化
		if(xUI.panelTable[itm].type == 'float'){
//パネル要素から'OptionPanelFloat'クラスを削除
			nas.HTML.removeClass(document.getElementById(target),'optionPanelFloat');
//パネル要素から'OptionPanelFloat'クラスを削除
			nas.HTML.addClass(document.getElementById(target),'optionPanelFloat-mobile');
		};
//ヘッドバー（ターゲットの第一アイテムで<dl>）非表示
		if(document.getElementById(target).children[0] instanceof HTMLDataListElement){
			document.getElementById(target).children[0].style.display = 'none';
		};
//クローズ(down)のみを設定
		$(function(){
			$("#"+target+" a.down").click(function(){
				xUI.sWitchPanel(itm,'hide');
				return false;
			});
		});
	}else{
//従来処理
		$(function(){
			$("#"+target+" a.close").click(function(){
				xUI.sWitchPanel(itm,'hide');
				return false;
			});
			$("#"+target+" a.minimize").click(function(){
				if($("#"+target).height() > 50){
					$("#form"+itm).hide();
					$("#"+target).height(24);
				}else{
					$("#form"+itm).show();
					$("#"+target).height('');
				};
				return false;
			});
			$("#"+target+" dl dt").on('pointerdown',function(e){
//マウスドラッグスクロールの停止
				nas.HTML.mousedragscrollable.movecancel = true;
//タッチスクロール・ホイルスクロールの停止
				document.addEventListener('pointerdown',nas.HTML.disableScroll,{ passive: false });
//				document.addEventListener('mousedown'  ,nas.HTML.disableScroll,{ passive: false });
				document.addEventListener('touchmove'  ,nas.HTML.disableScroll,{ passive: false });
				$("#"+target)
					.data("clickPointX" , ((e.pageX)? e.pageX:e.targetTouches[0].pageX) - $("#"+target).offset().left)
					.data("clickPointY" , ((e.pageY)? e.pageY:e.targetTouches[0].pageY) - $("#"+target).offset().top);
				$(document).on('pointermove',function(e){
					var myOffset=document.body.getBoundingClientRect();
					$("#"+target).css({
						top:e.pageY  - $("#"+target).data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
						left:e.pageX - $("#"+target).data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
					});
				});
			}).on('pointerup', function(e){
					$(document).unbind("pointermove");
//マウスドラッグスクロール再開
				nas.HTML.mousedragscrollable.movecancel = false;//(xUI.canvasPaint.currentTool == 'hand')? false:true;
//タッチスクロール・ホイルスクロール再開
				document.removeEventListener('pointerdown',nas.HTML.disableScroll,{ passive: false });
//				document.removeEventListener('mousedown'  ,nas.HTML.disableScroll,{ passive: false });
				document.removeEventListener('touchmove'  ,nas.HTML.disableScroll,{ passive: false });
			});
		});
	};
}
xUI.floatPanelMvHandle = function(e){
	var myOffset=document.body.getBoundingClientRect();
	if(e.pageX){
		var pgX = e.pageX;
		var pgY = e.pageY;
	}else{
		var pgX = e.targetTouches[0].pageX;
		var pgY = e.targetTouches[0].pageY;
	}
	$("#"+target).css({
		top: pgY - $("#"+target).data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
		left:pgX - $("#"+target).data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
	});
};
/*
	xUI.sWitchPanel(target,statsu)
	@params {String} kwd
	    パネルアイテムキーワード
	@params {String} status
	    switch|show|hide 未指定はswitch(現在の状態を反転)現在の状態と一致している場合はNOP
パネル類の表示をコントロールする
引数="clear"または  なしの場合は、排他表示のパネル類を表示クリア（hide）して表示を初期化する

引数	JQobject	備考
//一括クリア除外オブジェクト
menu
ibC
_exclusive_items_
headerTool
SheetHdr
memoArea
inputControl
//排他表示グループ
login   #optionPanelLogin   //ログインUI（  排他）
memo    #optionPanelMemo    //メモ編集（  排他）
Data    #optionPanelData    //Import/Export（  排他）
AEKey   #optionPanelAEK     //キー変換（  排他）
Scn     #optionPanelScn     //シーン設定(モーダル)
SCIs    #optionPanelSCI    //複数対応簡易シーン設定(モーダル)
Pref    #optionPanelPref    //環境設定（モーダル）
Ver     #optionPanelVer     //about(モーダル)
File    #optionPanelFile    //ファイルブラウザ（モーダル）
Timer       #optionPanelTimer       //ストップウオッチ(共)
NodeChart   #optionPanelNOdeChart   //ノードチャート（モーダル）

Rol     #optionPanelRol    //入力ロック警告（モーダル）
Snd     #optionPanelSnd     //音響パネル(共)
Img     #optionPanelImg     //画像パネル(共)

Dbg     #optionPanelDbg	//デバッグコンソール（排他）
Prog	#optionPanelProg	//プログレス表示（排他モーダル）
//フローティングツール
Tbx     #optionPanelTbx	//ソフトウェアキーボード
//常時パネル（ユーザ指定）
menu    #pMenu	//ドロップダウンメニュー(共)
ToolBr      div#toolbarHeader	//ツールバー(共)
SheetHdr    div#sheetHeaderTable	//シートヘッダー(共)
memoArea		//ヘッダメモ欄複合オブジェクト
Search  検索・置換UI
Utl	#optionPanelUtl	//ユーティリティーコマンドバー(共)排他から除外
//新UIツールポスト
モバイルモードの際は、フローティングパネルはすべて排他
フローティングパネル呼び出し時に通常パネルをすべて閉じる
*/
xUI.sWitchPanel = function sWitchPanel(kwd,status){
    if(! kwd) kwd = 'ibC';
    if(kwd == 'clear'){
//clearコマンド
        for(var prp in xUI.panelTable){
            if(
                (prp == '_exclusive_items_')||
                (xUI.panelTable[prp].uiOrder <= 3)||
                (! document.getElementById(xUI.panelTable[prp].elementId))
            ) continue ;//除外
            if(
                ((xUI.panelTable[prp].type == 'float')||(xUI.panelTable[prp].type == 'fix'))&&
                ($("#"+xUI.panelTable[prp].elementId).isVisible())
            ){
//表示中のフロートアイテムをすべてhideする
                $("#"+xUI.panelTable[prp].elementId).hide();
            }else if(
                (xUI.panelTable[prp].type == 'modal')&&
                ($("#"+xUI.panelTable[prp].elementId).isVisible())
            ){
//ダイアログをすべて閉じる
                nas.HTML.removeClass(document.body,'scroll-lock');
                $("#"+xUI.panelTable[prp].elementId).dialog("close");
            };
        };
        xUI.adjustSpacer();
        return;
    };
//status  'switch'|'show'|'hide'
    if((typeof status == 'undefined')||(!(String(status).match(/show|hide/)))) status = 'switch';
    let itm = xUI.panelTable[kwd];
    if((!(itm))&&(document.getElementById(kwd))){
        for(var prp in xUI.panelTable){
            if(xUI.panelTable[prp].elementId == kwd){
                itm = xUI.panelTable[prp];//document.getElementById(kwd);
                kwd = prp;
                break;
            };
        };
    };
    if((itm)&&(document.getElementById(itm.elementId))){
//操作対象エレメントが存在する場合のみ実行
        let currentStatus = $("#"+itm.elementId).isVisible();
        if(itm.status){
            if(itm.status instanceof Function){
                currentStatus = itm.status();
            }else{
                currentStatus = Function(String(itm.status))();
            };
        };
        let opt = (status == 'switch')? (!(currentStatus)):(status == 'show');// true|false
        if (opt != currentStatus){
//前処理 排他アイテムグループメンバー表示の場合他のウインドウをすべて非表示
            if((opt)&&(xUI.panelTable['_exclusive_items_'][xUI.app])&&(xUI.panelTable['_exclusive_items_'][xUI.app].indexOf(kwd) >= 0)){
                xUI.panelTable['_exclusive_items_'][xUI.app].forEach(e => {
                    if((e != kwd)&&(document.getElementById(xUI.panelTable[e].elementId))){
                        if(xUI.panelTable[e].type == 'modal'){
                            $("#"+xUI.panelTable[e].elementId).dialog("close");//modal
                        }else{
                            $("#"+xUI.panelTable[e].elementId).hide();//fix||float
                        };
                    };
                });
            };
/*            if((itm.type == 'float')&&(appHost.touchDevice)){
//タッチデバイスの際はモバイルデバイス用排他リストを参照
                for(var prp in xUI.panelTable){
                    if((xUI.panelTable[prp].type == 'fix')||(xUI.panelTable[prp].type == 'float')){
                        if (xUI.panelTable[prp] !== itm){
                            $("#"+xUI.panelTable[prp].elementId).hide();//fix||float
                        };
                    };
                };
            };// */
            if(itm.type == 'modal'){
                if(opt){
//モーダル処理確認
                    $("#"+itm.elementId).dialog("open");
                    nas.HTML.addClass(document.body,'scroll-lock');
//                    xUI.setDialog($("#"+itm.elementId));
                    $("#"+itm.elementId).focus();
                }else{
                    nas.HTML.removeClass(document.body,'scroll-lock');
                    $("#"+itm.elementId).dialog("close");
                };
            }else if((itm.func)&&(itm.func instanceof Function)){
//func プロパティがあればfuncを実行（イレギュラー処理    ）
                return itm.func(document.getElementById(itm.elementId),status);
            }else{
                if(opt){
                    $("#"+itm.elementId).show();
                }else{
                    $("#"+itm.elementId).hide();
                };
            };
//後処理 syncテーブルを参照してメニュー表示UI同期・固定アイテムの場合アジャスト
            if(appHost.touchDevice){
                if((itm.type == 'float')&&(opt)){
                    document.getElementById('fixedPanels').style.display = 'none';
                }else{
                    document.getElementById('fixedPanels').style.display = '';
                };
            };
            if(xUI.panelTable[kwd].sync) xUI.sync(xUI.panelTable[kwd].sync);
            if(kwd == 'ibC'){
                if($('#toolbarPost').isVisible()){
                    xUI.shiftScreen(50,0);
                }else{
                    xUI.shiftScreen(0,0);
                };
            };
            if(
                (document.getElementById('applicationHeadbar'))&&
                (((kwd == 'ibC'))||(kwd == 'menu'))
            ) $('#toolbarPost').css('margin-top',$('#applicationHeadbar').position().top);
            if(itm.type == 'fix') xUI.adjustSpacer();
        };
    };
}
/*
 *    @params {String}    kwd
 *          パネルテーブルの要素名
 *    @params {String}    status
 *           変更ステータス expand|minimise
 *           引数がない場合は変更を行わず状態のみを返す
 *    @returns {String}
 *           切り替え後の状態を文字列で返す expand|minimize
 *
 *    最大化最小化に対応しているパネルを切り替える
 */
xUI.eXpandPanel = function(kwd,status){
    let itm = xUI.panelTable[kwd];
    if(
        (itm)&&
        (document.getElementById(itm.elementId))&&
        (document.getElementById(itm.elementId+'_expand'))&&
        (document.getElementById(itm.elementId+'_minimise'))
    ){
console.log(itm);
        let currentStatus = ($('#'+itm.elementId+'_expand').isVisible())? 'expand':'minimise';
        if(status == currentStatus) return currentStatus;//NOP
        if(status == 'expand'){
            $('#'+itm.elementId+'_expand').show();
            $('#'+itm.elementId+'_minimise').hide();
            currentStatus = status;
        }else if(status == 'minimise'){
            $('#'+itm.elementId+'_expand').hide();
            $('#'+itm.elementId+'_minimise').show();
            currentStatus = status;
        };
        if(itm.type == 'fix') xUI.adjustSpacer();
        return currentStatus;
    };
}
/*
	メモ欄の編集機能と閲覧を交互に切りかえる
	引数なし
ノート編集をフローティングパネルに変更するため、このメソッドは廃止
 */
xUI.sWitchNotetext = function sWitchNotetext(){
	var myTarget   = $("#optionPanelMemo");//置き換え
	var hideTargets = [$("#memo"),$("#memo_image")];

	if(! myTarget.is(':visible')){
		xUI.sWitchPanel("clear");

		if((document.getElementById("myWords").innerHTML=="word table")&&(myWords)){
			document.getElementById("myWords").innerHTML=putMyWords();
		}

		hideTargets.forEach(function(e){e.hide();});
		myTarget.show();
		document.getElementById("rEsult").value=this.XPS.xpsTracks.noteText;
		xUI.adjustSpacer();
		document.getElementById("rEsult").focus();
	}else{
		hideTargets.forEach(function(e){e.show();});
		xUI.XPS.xpsTracks.noteText=document.getElementById("rEsult").value;
		sync("memo");
		myTarget.hide();
		xUI.adjustSpacer();
//		document.getElementById("iNputbOx").focus();
	};
}
/*TEST
sWitchNotetext();
 */
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
    };
}
/**
 *    @params {Array}     myRange
 *    @params {Boolean}   isReference
 *    @params {Function}  callback
 *    @return {Array}
 *    範囲を指定してグラフィック部品を再描画するラッパ関数
 *    レンジの書式はXpsの戻すレンジに準ずる
 *    [[開始トラック,開始フレーム],[終了トラック,終了フレーム]]
 *    リファレンスフラグが無い場合は編集対象のXPSを処理する
 
 */
xUI.Cgl.refresh = async function(myRange,isReference,callback){
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
    };
    if(callback instanceof Function) callback();
    return myRange;
}
/**
	シートセル画像部品描画コマンド
位置計算をブラウザに任せるため  絶対座標でなく相対座標で各テーブルセル自体にCANVASをアタッチする

基本部品はすべてキャッシュを行い  image Objectを作成する。

印字の際に描画の動作独立性を高める必要があるので、セルに埋め込んだ画像クラスを判定してその描画を行う仕様に変更
具体的には、myFormに優先してターゲットセルの"graph_"で開始されるクラス名からFormを取得するように変更
  170815
シートカラーを  ユーザ変更可能にしたので  暗色テーマへの対応が必要
描画カラーをオブジェクトプロパティ設ける事
引数myFormの書式は以下
    Shape[[-Track]-Cycle]_Start-End
    後ほどShapeごとにプラグイン処理が可能なように変更を行う予定

  引数として以下の形式も受け入れる
addGraphElement(myId,myForm,start,end)

myForm を事前処理してtargetShapeを事前抽出するように変更20180513
*/
xUI.Cgl.draw=function addGraphElement(myId,myForm) {
	var objTarget  = document.getElementById(myId);//ターゲットシートセルを取得
	if(! objTarget) return false;//シートセルが存在しない場合は操作失敗
	var jqTarget = $('#'+myId);
	var classes=jqTarget.attr('class').split(' ');
//シートセルのクラス名を検索して graph で開始する場合formの値を取得する
	for (var cix=0;cix<classes.length;cix++){
		if (classes[cix].indexOf('graph_') == 0){ myForm=classes[cix].replace(/^graph_/,'');break; };
	};
	if(typeof myForm == 'undefined') {return false};//指定無しでかつ取得に失敗した場合はリターン(印刷時に有効)

/*
	区間描画時に形成されたIDの場合はパーセンテージを分解して描画する  開始・終了率を先行して分離
	終了率が省略された場合は、開始率で補う
	キーワードとして m,l,s が 100,50,25 を表す。
*/
	if(myForm.match(/(.*)_(\d+)(\-(\d+))?$/)){
			myForm=RegExp.$1; arguments[2]=(RegExp.$2/100);
		if(RegExp.$4){
			arguments[3]=(RegExp.$4/100);
		}
	}else if(myForm.match(/(.*)_([mls])$/)){
		switch(RegExp.$2){
			case 'l':
				arguments[2]=(100/100);
			break;
			case 'm':
				arguments[2]=(50/100);
			break;
			case 's':
				arguments[2]=(25/100);
			break;
		};
	};
//	myForm を分解して目標形状、目標トラック、Cycle値を取得
	var targetShape = (myForm.split('_')[0]).split('-')[0];//ターゲット形状
	var tragetTrack = (myForm.match(/-(ref|stl|rmt|cam|sfx)/i))? RegExp.$1:"";//トラック指定  ヒットがない場合は全トラック適用
//	サイクルターゲットパラメータは配列で持つ  [参照値,母数]
	var cycleTarget=[0,1];
	if (myForm.indexOf('evn')>=0){
		cycleTarget = [0,2];//evnを数値化
	} else if(myForm.indexOf('odd')>=0){
		cycleTarget = [1,2];//oddを数値化
	} else if(myForm.match(/\-(\d+)/)){
		cycleTarget = RegExp.$1;
		var myLength=Math.floor(cycleTarget.length/2);
		cycleTarget=[cycleTarget.slice(0,myLength),cycleTarget.slice(cycleTarget.length-myLength)];
	};
	if(! this.body[myId]) this.body[myId] = document.getElementById("cgl"+myId)	;
	if( this.body[myId] ){
		$("#cgl"+myId).remove();delete this.body[myId];
//二重描画防止の為すでにエレメントがあればクリアして描画
	};
/**
    以下の場合分けは、ノーマル時の処理とAIR環境のバグ回避コード
    先の処理のほうがオーバヘッドが小さいので推奨だが、AIRで正常に処理されない
- td配下に置いたcanvasエレメントが、position=absoluteを指定するとページ全体又はテーブルを包括するdivの原点をベースに描画される。
- element.top/.left で指定した座標が反映されないことがある  element.style.top/.left は正常
 動作異状の検出ルーチンはまだ組んでいない。ビルド毎にAIRに当該のバグがあるか否か確認が必要
 2016.11.12
*/
if(appHost.platform != "AIR"){
        var objParent = objTarget;
        var myTop     = "0px";
        var myLeft    = "0px";
}else{
        var objParent  = ((xUI.viewMode=="Compact")&&(myId.indexOf("r")==0))?
                    document.getElementById("UIheaderScrollV-table"):
                    document.getElementById("page_1");
//                    document.getElementById("qdr4");
//        var targetRect = objTarget.getBoundingClientRect();
//        var parentRect = document.getElementById("sheet_body").getBoundingClientRect();
        var myTop     = objTarget.offsetTop  + "px";
        var myLeft      = objTarget.offsetLeft + "px";
}
/**
    formCache  を作成する
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

switch(targetShape){
case "blankCloss":;		//transition
/*
    ブランク用ばつ印
    セルいっぱいに描く
*/		var lineWidth  =4;
		ctx.strokeStyle='rgb('+xUI.Cgl.baseColorArray.join(',')+')';
		ctx.strokeWidth=lineWidth;
		ctx.moveTo(element.width, 0);//
		ctx.lineTo(0,element.height);
		ctx.moveTo(0, 0);//
		ctx.lineTo(element.width,element.height);
		ctx.stroke();
break;case "line":	    //vertical-line
/*
case "line-ref":	    //vertical-line
case "line-cam":	    //vertical-line
case "line-sfx":	    //vertical-line
*/
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
/*
奇遇フレームのみでなくサイクル動作するフォームを全てサポートする
Waveは奇遇サイクル
case "wave-odd":;		//wave-line 偶数フレーム
case "wave-evn":;		//wave-line 奇数フレーム
case "wave-ref-odd":;		//wave-line 偶数フレーム
case "wave-ref-evn":;		//wave-line 奇数フレーム
*/
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
		var waveSpan  =(arguments[2])? element.width*arguments[2]/2:element.width/4;
		//var waveSpan  =7.5;
		var lineWidth  =3;
		ctx.strokeStyle='rgb('+xUI.Cgl.baseColorArray.join(',')+')';
		ctx.strokeWidth=lineWidth;
		ctx.moveTo(element.width*0.5, 0);
		if(cycleTarget[0]%cycleTarget[1]){
	ctx.bezierCurveTo(element.width*0.5-waveSpan, element.height*0.5,element.width*0.5-waveSpan, element.height*0.5,  element.width*0.5, element.height);
		}else{
	ctx.bezierCurveTo(element.width*0.5+waveSpan, element.height*0.5,element.width*0.5+waveSpan, element.height*0.5,  element.width*0.5, element.height);
		}
	    ctx.stroke();
	    xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
	}
break;
case "shake":;			//shake-line
/*
シェイク形状は、大中小の副形状をサポートする  ウェーブと初期位相を反転させる
case "shake-odd":;		//shake-line 偶数フレーム
case "shake-evn":;		//shake-line 奇数フレーム
case "shake-cam-odd":;		//shake-line 偶数フレーム
case "shake-cam-evn":;		//shake-line 奇数フレーム
*/
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
		var shakeSpan  =(arguments[2])? element.width*arguments[2]/2:element.width/4;
		var lineWidth  =2;
		ctx.strokeStyle='rgb('+xUI.Cgl.baseColorArray.join(',')+')';
		ctx.strokeWidth=lineWidth;
		ctx.moveTo(element.width*0.5, 0);
		if(cycleTarget[0]%cycleTarget[1]){
	ctx.lineTo(element.width*0.5+shakeSpan, element.height*0.5);
	ctx.lineTo(element.width*0.5, element.height);
		}else{
	ctx.lineTo(element.width*0.5-shakeSpan, element.height*0.5);
	ctx.lineTo(element.width*0.5, element.height);
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
/*
case "circle-ref":;	 //circle-reference
*/
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
/*
case "triangle-ref":;	//triangle
*/
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
case "sectionOpen":;		//sectionOpen
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
case "sectionClose":;		//sectionClose
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
case "dialogOpen":;		//dialogsectionOpen
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
	var lineWidth = 3;
	    ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
		ctx.moveTo(0, element.height-lineWidth);
		ctx.lineTo(element.width, element.height-lineWidth);
		ctx.stroke();
	    xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
	}
break;
case "dialogClose":;		//dialogsectionClose
    if(typeof xUI.Cgl.formCashe[myForm] == 'undefined'){
	var lineWidth = 3;
	    ctx.fillStyle="rgba("+xUI.Cgl.baseColorArray.join(',')+",1)";
		ctx.moveTo(0, lineWidth);
		ctx.lineTo(element.width, lineWidth);
		ctx.stroke();
	    xUI.Cgl.formCashe[myForm] = element.toDataURL("image/png");
	}
break;
case "areaFill":;	//fill sheet cell
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
 *  @params {String} myId
 *        シートセルID "0_0","0_1"...
 *  @params {String} myForm
 *        図形キーワード transition
 *  @params {String} myDuration
    トランジション系セクションを一括描画するラッパー関数
    この関数を使用する場合は直接Gcl.drawを呼ばないようにすること。
*/
xUI.Cgl.sectionDraw = function(myId,myForm,myDuration){
    var Idx=myId.split("_").reverse();
    for (var offset = 0;offset< myDuration;offset ++){
//編集エリアとリファレンスエリアで分岐
        if(Idx.length==2){
//編集エリア
          //this.draw(       [Idx[1],parseInt(Idx[0])+offset].join("_"),myForm,offset / myDuration, (offset+1) / myDuration);
          $('#'+[Idx[1],parseInt(Idx[0])+offset].join('_')).addClass('graph_'+myForm+'_'+String(parseInt(100 * offset / myDuration))+'-'+String(parseInt(100 *((offset+1) / myDuration))));
        }else{
//リファレンスエリア()
          //this.draw([Idx[2],Idx[1],parseInt(Idx[0])+offset].join("_"),myForm,offset / myDuration, (offset+1) / myDuration);
          $('#'+[Idx[2],Idx[1],parseInt(Idx[0])+offset].join('_')).addClass('graph_'+myForm+'_'+String(parseInt(100 * offset / myDuration))+'-'+String(parseInt(100 *((offset+1) / myDuration))));
        };
    };
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
    return xUI.sessionRetrace;
}
/*

*/
/**
 *  @params {Object Xps} editXps
 *      主ターゲットXps　省略可
 *  @params {Object Xps} referenceXps
 *      参照ターゲットXpa  省略可
 *  @params {Function} callback
 *      参照ターゲットXpa  省略可
 *
 *  xUIにターゲットオブジェクトを与えてシートをリセットする関数<pre>
 *  初期化手順を用いていた部分の置換え用途で作成
 *  初期化手順内でもこの手続を呼び出すように変更
 *  この手続内では基本的にundo処理は行わない
 *  したがって必要に従ってこの手続を呼ぶ前にundoの初期化を行うか、またはundo操作を行う必要がある。
 *  引数省略時は画面のリフレッシュのみを行う。
 *  画像マスター時の処理を追加実装
 *      viewMode=='Compact' の場合は画像表示をキャンセル（将来はサポート）
 *      202302 現在画像マスター状態の場合 Compact(スクロール)モードをキャンセル(将来サポート?)
 *      callback関数を持てるように変更
 *  </pre>
 */
xUI.resetSheet = async function(editXps,referenceXps,callback){
//UI切り替え 別のポイントへ移動
    if(xUI.viewMode == 'PageImage'){
        $('#docImgAppearance').show();//page
    }else if(xUI.viewMode == 'WordProp'){
        
    }else{
        $('#docImgAppearance').hide();//scroll
    };
//現在のカーソル配置をバックアップ
    var restorePoint     = this.Select.concat();
    var restoreSelection = this.Selection.concat();
    this.selection();//選択解除
//画像編集状態
    if(xUI.canvas){
//編集中事前処理
        xUI.canvasPaint.syncColors();
        xUI.canvasPaint.syncCommand();
        xUI.canvasPaint.syncTools();
    };
//画像表示状態をバックアップ
//    var appearance = xUI.setAppearance();
//    var scale      = xUI.viewScale;
//    var scrollPt   = window.

    var reWriteXPS = false;
    var reWriteREF = false;
    var Refstatus = (document.getElementsByClassName('rnArea').length > 0)? $('.rnArea').isVisible():true;
    if(! Refstatus) xUI.flipRefColumns('show');
/*
    引数にeditXPSが与えられなかった場合は、現在のXPSのまま処理を続行（画面のrefreshのみを行う）
    sheetLooksのみが行われている可能性が更新が
 */
    if ((typeof editXps != "undefined") && (editXps instanceof Xps)){
//編集エリアに対するreadINの条件判定
//      xUI.uiMode=='production' のケースではSCi情報を保持する
//      それ以外のケースでは引数側の情報で上書きされる
        var propertyBackup = Xps.parseIdentifier(Xps.getIdentifier(xUI.XPS));
        this.XPS.parseXps(editXps.toString(false));    //XPSをバッファ更新
// 書換え範囲にXPS全体を追加
        reWriteXPS = true;
    };
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
//幅計算に先立って xpsTracks.areaOrderを更新
    xUI.XPS.xpsTracks.initAreaOrder(); xUI.XPS.xpsTracks.assignAreaOrderMember();
//表示プロパティのリフレッシュを行う  シートが変更されていなければ不用
    this._checkProp();
//セルグラフィック初期化( = 画面クリア)
//    this.Cgl.init();
//タイムシートテーブルボディ幅の再計算
    var tableRefereneceWidth =  this.sheetLooks.ActionWidth * this.referenceLabels.length;
    var tableEditWidth = (
        this.sheetLooks.DialogWidth       * this.dialogCount + 
        this.sheetLooks.SheetCellWidth    * this.timingCount +
        this.sheetLooks.StillCellWidth    * this.stillCount +
        this.sheetLooks.SfxCellWidth      * this.sfxCount +
        this.sheetLooks.GeometryCellWidth * this.stageworkCount +
        this.sheetLooks.CameraCellWidth   * this.cameraCount +
        this.sheetLooks.TrackNoteWidth    * this.noteCount +
        this.sheetLooks.CommentWidth
    );//タイムシートの基礎トラック専有幅を算出
    var tableColumnWidth = this.sheetLooks.TimeGuideWidth + tableRefereneceWidth + tableEditWidth;
    var tableBodyWidth   = tableColumnWidth * this.PageCols + (this.sheetLooks.ColumnSeparatorWidth * (this.PageCols-1));
//  UI上メモとトランジション表示をシート表示と切り分けること 関連処理注意
    sync("memo");
//  シートボディの表示
    if(this.viewMode=="Compact"){
//コンパクト|スクロールモード  スクロールUI用のラベルヘッダーを作成
        document.getElementById("UIheaderFix").innerHTML     = this.pageView(-1);//qdr2
        document.getElementById("UIheaderScrollH").innerHTML = this.pageView(0) ;//qdr1
        document.getElementById("UIheaderScrollV-table").innerHTML = this.pageView(-2);//qdr3
        document.getElementById("UIheader").style.display    = "inline";
//        document.getElementById("UIheaderLeft").style.display    = "inline";
//スクロールUI時は1ページ限定なのでボディ出力を１回だけ行う
        var SheetBody = '<div id=printPg1 class=printPage>';
        SheetBody += '<div class=headerArea id=pg1Header>';
        SheetBody += this.headerView(1);
        SheetBody += '</div>';//UI調整用に１行（ステータス行の分）<br><div id=spcHd class=application_status ><br></div>
        SheetBody += this.pageView(1);
        SheetBody += '</div>';
    }else{
//ページモード  スクロールUI用のラベルヘッダーを隠す
        if(document.getElementById("noteImageField")) document.getElementById("noteImageField").style.display="none";
        if(document.getElementById("UIheader"))       document.getElementById("UIheader").style.display="none";
//        if(document.getElementById("UIheaderLeft"))   document.getElementById("UIheaderLeft").style.display="none";
        var SheetBody='';
        for (Page=1 ;Page <= Math.ceil(this.XPS.duration()/this.PageLength);Page++){
            SheetBody += '<div id=printPg'+String(Page) +' class=printPage>';
            SheetBody += '<div class=headerArea id=pg'+String(Page)+'Header>';
            SheetBody += this.headerView(Page);
            SheetBody += '</div><span class=pgNm>( p '+nas.Zf(Page,3)+' )</span><br>';
            SheetBody += this.pageView(Page);
            SheetBody += '</div>';
        };
    };
console.log(SheetBody);
//  sheet_body配下のエレメントを削除
    var sheet_body = document.getElementById("sheet_body");
    while (sheet_body.firstChild) {
        sheet_body.removeChild(sheet_body.firstChild);
    };
//  シートボディを締める
	sheet_body.innerHTML = SheetBody+"<div class=\"screenSpace\"></div>";
// モードに関わらずドキュメントイメージ要素があれば内容を再配置
//syncメソッドに渡すことを検討 syncNoteImage
//*****
//タイムシート画像再配置(ドキュメント画像またはドキュメントテンプレート画像・ページモードのみ)
if(xUI.viewMode != 'Compact'){

	var imgs = document.querySelectorAll('.overlayDocmentImage');
	var ix   = 0;
	imgs.forEach(function(e){
		ix = nas.parseNumber(e.id);
console.log(e.id,)
//        if(xUI.viewMode == 'WordProp'){
//			e.style.top = -(xUI.sheetLooks.SheetHeadMargin-document.getElementById('0_0').offsetTop +3)+'px';//?
//        }
//		e.style.top = e.parentNode.parentNode.offsetTop+'px';//常時 0px

		if(documentFormat.active){
			var docImg = e.appendChild(documentFormat.img);
			docImg.style.width = (docImg.naturalWidth *96 / nas.NoteImage.guessDocumentResolution(docImg,'A3')) +'px';//A3 width 96ppi
		}else{
			if(
				(xUI.XPS.timesheetImages.members[ix])&&
				(xUI.XPS.timesheetImages.members[ix].content != '')&&
				(xUI.XPS.timesheetImages.members[ix].img)
			){
//ドキュメントイメージ配置 img==null(content=='')のケースあり
console.log(xUI.XPS.timesheetImages.members[ix].img);
				var docImg = e.appendChild(xUI.XPS.timesheetImages.members[ix].img);
				docImg.id  = "pageImage-"+ (ix+1);//uniqe id
				docImg.className = "pageDocumentImage";//image class name
				docImg.style.width = (xUI.XPS.timesheetImages.members[ix].img.naturalWidth *96 / xUI.XPS.timesheetImages.members[ix].resolution) +'px';//A3 width 96ppi
//ドキュメントcanvasBuffer配置 canvas==nullのケースあり
			}else{
//フォーマットテンプレート画像を再配置
				var docImg = e.appendChild(new Image());
				if(xUI.XPS.sheetLooks.TemplateImage == ""){
					xUI.XPS.sheetLooks.TemplateImage = documentFormat.TemplateImage;//フォーマッタから転記
				};
				docImg.src = xUI.XPS.sheetLooks.TemplateImage;//ドキュメントが持つテンプレート画像
				docImg.id  = "pageImage-"+ (ix+1);//uniqe id
				docImg.className = "pageDocumentImage";//image class name
				docImg.addEventListener('load',function(){
				docImg.style.width = (docImg.naturalWidth *96 / nas.NoteImage.guessDocumentResolution(docImg,'A3')) +'px';//"1122px = 297mm 96ppi;A3 width 96ppi 推定処理
				},{once:true});
			};
//svg contentデータがあれば読み込み時にsvgに展開する（ここでは行わない）
			if(
				(xUI.XPS.timesheetImages.members[ix])&&
				(xUI.XPS.timesheetImages.members[ix].svg)&&
				(xUI.XPS.timesheetImages.members[ix].svg instanceof HTMLElement)
			){
console.log(xUI.XPS.timesheetImages.members[ix].svg);
				e.appendChild(xUI.XPS.timesheetImages.members[ix].svg);
			};
		};
	});
};
//***** 
//ノート画像再配置
if(xUI.viewMode == 'Compact'){
	if(document.getElementById('noteImageField')){
		xUI.XPS.noteImages.members.forEach(function(e){
            if(e.type =='cell'){
                if(xUI.XPS.xpsTracks.getAreaOrder(e.link).fix){
                    document.getElementById('areaFixImageField').appendChild(e.svg);
                }else{
                    document.getElementById('noteImageField').appendChild(e.svg);
                };
            };
		});
	};
};
//ディスクリプション画像再配置
    var dsImg = xUI.XPS.noteImages.getByLinkAddress('description:');
    if(dsImg){
        document.getElementById('memo_image').appendChild(dsImg.svg)
    }
//編集中の画像を再配置
    if(xUI.canvas){
        xUI.canvasPaint.wrapParent = document.getElementById(xUI.canvasPaint.wrapParent.id);
        xUI.canvasPaint.wrapParent.appendChild(xUI.canvasPaint.canvasWrap);
        if(xUI.canvasPaint.targetItem.type=='cell'){
			var linkElement = document.getElementById(xUI.canvasPaint.targetItem.link);//cell-id
console.log(linkElement);
console.log([linkElement.offsetLeft+xUI.canvasPaint.targetItem.offset.x.as('px'),linkElement.offsetTop+xUI.canvasPaint.targetItem.offset.y.as('px')]);

			xUI.canvasPaint.canvasWrap.style.left  = (linkElement.offsetLeft + xUI.canvasPaint.targetItem.offset.x.as('px'))+'px';
			xUI.canvasPaint.canvasWrap.style.top   = (linkElement.offsetTop  + xUI.canvasPaint.targetItem.offset.y.as('px'))+'px';
        };
    };
//if(documentFormat.orderbox) document.getElementById('sheet_body').appendChild(documentFormat.orderbox);

// グラフィックパーツを配置(setTimeoutで無名関数として非同期実行)
    window.setTimeout(function(){
        xUI.syncSheetCell(0,0,false);//シートグラフィック置換
        xUI.syncSheetCell(0,0,true);//referenceシートグラフィック置換
//フットスタンプの再表示
        if(xUI.footMark) xUI.footstampPaint();
//  カーソル位置復帰（範囲外は自動でまるめる）
        xUI.selectCell(restorePoint);
        xUI.selection(add(restorePoint,restoreSelection));
//ドキュメントモードに従って画像アピアランスを設定
/*        if(xUI.XPS.imgMaster()){
            if(xUI.XPS.timesheetImages.imageAppearance == 0) xUI.setAppearance(1,true);//xUI.XPS.timesheetImages.imageAppearance;
        }else{
            if(xUI.XPS.timesheetImages.imageAppearance >= 1) xUI.setAppearance(0,true);
        };// */
    },0);
//    this.bkup([XPS.xpsTracks[1][0]]);
//画像部品の表示前のカーソル位置描画,'width':markerWidth
//    this.selectCell(restorePoint);
//    this.selection(restoreSelection);
//    this.selection(add(restorePoint,restoreSelection));
//セクション編集状態であれば解除
    if(this.edmode>0){this.mdChg('normal');}
//表示内容の同期
    sync("tool_");
    sync("info_");
/*
    viewMode設定
*/
//コンパクトモードが有効 docImage非表示
    if(xUI.viewMode=="Compact"){
//ロゴ
//		$("#logoTable").hide();
//第二カウンタ
		$("#fct1").hide();
//ツールバーボタン
		$("#ok").hide();
		$("#ng").hide();
//シートヘッダ
//		$("#opusL").hide();
//		$("#titleL").hide();
//		$("#subtitleL").hide();
		$("#nameL").hide();
//		$("#opus").hide();
//		$("#title").hide();
//		$("#subtitle").hide();
		$("#update_user").hide();
//メモエリア 切り替えなし
//		$("#memoArea").hide();
//タイムラインヘッダ
		$("#UIheader").show();
		if(document.getElementById("UIheaderScrollV-table").innerHTML==""){document.getElementById("UIheaderScrollV-table").innerHTML=xUI.pageView(-2);};
//		$("#UIheaderFix").show();
//		$("#UIheaderScroll").show();
//タグ表示域高さ調整
		$('.tlhead').each(function(){$(this).height($('#tlheadParent').height())});
	}else{
//ロゴ
//		$("#logoTable").show();
//		$("#headerLogo").show();
//第二カウンタ
		$("#fct1").show();
//ツールバーボタン
		$("#ok").show();
		$("#ng").show();

//シートヘッダ
//		$("#opusL").show();
//		$("#titleL").show();
//		$("#subtitleL").show();
		$("#nameL").show();
//		$("#opus").show();
//		$("#title").show();
//		$("#subtitle").show();
		$("#update_user").show();
//メモエリア
//		$("#memoArea").show();
//タイムラインヘッダ
		$("#UIheader").hide();
		$("#UIheaderScrollV-table").html("");

//		$("#UIheaderFix").hide();
//		$("#UIheaderScroll").hide();
	};
//===================== トラックラベルの高さ調整
        var ht=0;
        Array.from(document.getElementsByClassName('trackLabel-tall')).forEach(function(e){if(ht < e.clientHeight) ht = e.clientHeight});
        nas.HTML.setCssRule('.trackLabel-tall','height:'+ht+'px;'); // */
//===================== ヘッダ高さの初期調整
    this.adjustSpacer();
//===================== 入力モードスイッチ初期化
    sync('ipMode');
/* エンドマーカー位置調整 はadjustSpacerに内包
//印字用endマーカーは  印刷cssを参照して誤差を反映させること  フレームのピッチを計算すること
印刷画面は印刷画面出力時に再度同メソッドで調整  トラック間の
xUI.replaceEndMarker([トラック数,フレーム数],上下オフセットpx);
 */
console.log('endmarker');
    xUI.replaceEndMarker(xUI.XPS.xpsTracks.duration);
console.log('marginmarker');
    xUI.placeMarginMarker();
if(! Refstatus) xUI.flipRefColumns('hide');
    if(xUI.viewMode != "Compact") xUI.setAppearance();
    if(reWriteXPS) reWriteTS();
console.log('reset Sheet ');
    if(callback instanceof Function) callback();
    return ;
};

//test-    xUI.resetSheet(new Xps(3,24),new Xps(5,72));
/**
 *   @params {Number} page
 *   指定のドキュメントページを表示する（指定以外のページを隠す）
 *   存在しないページが指定された場合はすべてのページを表示する
 */
xUI.showPage = function showPage(page){
	if (xUI.XPS instanceof Xps){
		var pgStart = 1;
		var pgEnd   = Math.ceil(xUI.XPS.duration()/xUI.PageLength);
		if((page > 0)&&(page <= pgEnd)){
			for (var pg = pgStart ;pg <= pgEnd ;pg++){
				if(pg == page){
					$('#printPg'+String(pg)).show();
				}else{
					$('#printPg'+String(pg)).hide();
				};
			};
		}else{
			for (var pg = pgStart ;pg <= pgEnd ;pg++){
				$('#printPg'+String(pg)).show();
			};
		};
	};
	xUI.replaceEndMarker();
}

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
    myTraget.value=nas.Frm2FCT(nas.FCT2Frm(myTraget.value)+myStep,tcForm,0,this.XPS.framerate);
    if(document.getElementById(targetId).onchange) document.getElementById(targetId).onchange();
    return false;
}
/**
    xUI.XPS < 編集対象のXpstが参照される
    xUIに編集対象Xpsトレーラを増設
    各Xpsごとにテータスを持つのでそれを参照して切り替えを行うようにする
*/
/** タブコントロール
引数 tabID 0:project 1~ :Xpst 1~

0
    xmap    if(xpst1)? left-active-overlay:left-active;
    xpst    if(xpst[ix+1])? right-dectivate:mid-deactivate-overlay;   
1~
    xmap    if(xpst[1] == active)? left-dective:left-deactive-overlay;
    xpst    if(xpst[ix+1])? mid: right;
            if(idx==ix)? active:(midd) ? dective-overlay : deactive;
*/
xUI.tabSelect =function(tabId){
        if(xUI.activeDocumentId != tabId){xUI.activeteDocument(tabId)}
    if(tabId){
        $('.xpst').show();$('.xmap').hide();
    }else{
        $('.xpst').hide();$('.xmap').show();
    }
    xUI.adjustSpacer();
    return this.activeDocumentId;
}
xUI.activeteDocument  = function(tabId){
    if((typeof tabId == 'undefined')||(tabId == this.activeDocumentId)) return this.activeDocumentId;
//タブループ
    for (var tix=0;tix<this.tabCount; tix++){
        targetTab = $('#tab_'+tix);
        var prefix=(tix==0)?'left':'midd';
        var currentStatus=(tix==this.activeDocumentId)?'active':'deactive';
        var status=(tix==tabId)?'active':'deactive';
        var currentPostfix=((prefix=='mid')&&(currentStatus=='deactive')&&(tix-1!=this.activeDocumentId))?'overlay':false;
        var postfix=((prefix=='midd')&&(status=='deactive')&&(tix-1!=tabId))?'overlay':false;
        var currentClass=(currentPostfix)?['tabControll',prefix,currentStatus,currentPostfix].join('-'):['tabControll',prefix,currentStatus].join('-');
        var newClass=(postfix)?['tabControll',prefix,status,postfix].join('-'):['tabControll',prefix,status].join('-');
        if(tix==(this.tabCount-1)){
            var endTab = $('#tab_end');
            var curreentEndClass = (currentStatus=='active')? 'tabControll-end-active':'tabControll-end-deactive';
            var newEndTabClass   = (status=='active')?     'tabControll-end-active':'tabControll-end-deactive';
            if(endTab.hasClass(curreentEndClass)){
                endTab.removeClass(curreentEndClass).addClass(newEndTabClass);
            }else{
                endTab.addClass(newEndTabClass);            
            }
        }
        if(targetTab.hasClass(currentClass)){
            targetTab.removeClass(currentClass).addClass(newClass);
        }else{
            targetTab.addClass(newClass);            
        }
    }
    this.activeDocumentId=tabId;
    return this.activeDocumentId;
}
// sync エイリアスを設定
    xUI.sync = sync;
//オブジェクト戻す
    if(nas.CanvasAddon) return nas.CanvasAddon(xUI);
    return xUI;
};
/*================================================================================================ 
 *  アプリケーションスタートアップ
 *
 *   スタートアップを他の位置へまとめる必要があるかも
 *   リロードの際に一度だけ自校される部分
 */
//ユーザ設定を予備加工
    var MaxFrames = nas.FCT2Frm(SheetLooks.PageLength);//タイムシート尺 global:Sheet
//    var MaxLayers = SheetLooks.node;//セル重ね数

//始動オブジェクトとして空オブジェクトで初期化する スタートアップ終了までのフラグとして使用
var xUI          = new Object();
    xUI.Mouse    = function(){return};
    xUI.onScroll = function(){return};

//    オブジェクト初期化用ダミーマップ
//    var MAP=new xMap(MaxLayers);
//    新規XPSオブジェクト作成・初期化
    var XPS          = {} ;//ダミーオブジェクトとしてグローバル変数を初期化
    var XMAP         = {} ;//ダミーオブジェクトとしてグローバル変数を初期化
    var startupDocument   = ''           ;//初期ドキュメント XPSまたはXMAP
    var referenceDocuemnt = ''           ;//初期参照ドキュメントXpst

//コード読込のタイミングで行う初期化

/** Startup
    nas_Rmp_Startup
プログラム及び全リソースをロード後に１回だけ実行される手続

    nas_Rmp_Init
データドキュメントロード時に毎回実行される手続  UI初期化を含む
画面書き換え用のメソッドxUI.resetSheet を内部で呼び出す

    nas_Rmp_reStart
ページリロード等の際に実行される手続
*/
function nas_Rmp_Startup(){
//モーダルパネルの背景色を設定
//JQuery-UIのcssを上書き(cssのurlをローカルにする必要あり)
//    nas.HTML.setCssRule('.ui-widget-content','background:#efefef;',[3]);
        Array.from(document.getElementsByClassName('optionPanelModal')).forEach(function(e){e.style.backgroundColor='#efefef'})
//モバイルデバイスを検知してUIを設定
    if(appHost.touchDevice){
//上部のシステム領域を下へ
        document.getElementById('fixedHeader').style.bottom = '0px';
//ドロップダウンメニューを上へ展開する
        nas.HTML.deleteCssRule('#pMenu li ul',0);
        nas.HTML.addCssRule('#pMenu li ul' ,'display: none;position: absolute;bottom: 24px;left: -1px;padding: 5px;width: 150px;background: #eee;border: solid 1px #ccc;',0)
//メニューの間隔を開く
        nas.HTML.setCssRule('#pMenu li','height:24px;',0);
//被せロゴの位置調整
        document.getElementById('underlay').className = 'underlay-mobile';
    };
//バージョンナンバーセット
    sync("about_");
//クッキー指定があれば読み込む
    if(useCookie[0]) ldCk(); 
console.log(SheetLooks);

//ドキュメントフォーマットマネージャー初期化
    documentFormat.init();
//WEB-UI解像度の設定
    nas.RESOLUTION.setValue('96ppi');
//ライブラリフレームレートの設定
    nas.FRATE=nas.newFramerate(SheetLooks.FrameRate);
//背景カラーを置換 入れ替えで不要に
//    SheetLooks.SheetBaseColor=SheetBaseColor;
console.log('startup')
console.log(SheetLooks);
//シートロゴをアップデート
/*
    応急処置
    ロケーションを確認して  開発／試験サーバ  であった場合はヘッダロゴ画像を差し替える
*/
if(location.hostname.indexOf("scivone-dev")>=0){
    headerLogo="<img src='/images/logo/UATimesheet_dev.png' alt='Nekomataya' width=141 height=24 border=0 />"
};
if(location.hostname.indexOf("remaping-stg")>=0){
    headerLogo="<img src='/images/logo/UATimesheet_staging.png' alt='Nekomataya' width=141 height=24 border=0 />"
};
    document.getElementById("headerLogo").innerHTML=
    "<a href='"+ headerLogo_url +
    "' title='"+ headerLogo_urlComment +
    "' target='_new'>"+ headerLogo +"</a>";
// サービスCGIのアドレスを調整
    if(String(location).indexOf('https')==0) {ServiceUrl=HttpsServiceUrl};
// グローバルの XPSを実際のXpsオブジェクトとして再初期化する
    XPS = new Xps(SheetLooks,MaxFrames);
/*
    Mapオブジェクトの改装を始めるので、いったん動作安定のため切り離しを行う
    デバッグモードでのみ接続 mapの扱いが異なるため完全に不要
if(dbg)    XPS.getMap(MAP);
*/
/*============*     初期化時のデータ取得    *============*/
/*
 *  最優先・レンダリング時にドキュメント内にスタートアップデータが埋め込まれている
 *  読み取ったスタートアップデータを判別して
 */
//    ドキュメント内にスタートアップデータがあれば読み出し  startupContent >startupDocument

if(document.getElementById( "startupContent" )){
         startupDocument=$("#startupContent").text();
//        var dataStart= startupDocument.indexOf("nasMAP-FILE");//テストコード
        var dataStart= startupDocument.indexOf("nasTIME-SHEET");
        if(dataStart<0){
             startupDocument="";
        }else if(dataStart>0){
             startupDocument= startupDocument.slice(dataStart);
        }
        if( startupDocument.indexOf("&amp;")>=0){ startupDocument= startupDocument.replace(/&amp;/g,"&");}
        if( startupDocument.indexOf("&lt;")>=0){ startupDocument= startupDocument.replace(/&lt;/g,"<");}
        if( startupDocument.indexOf("&gt;")>=0){ startupDocument= startupDocument.replace(/&gt;/g,">");}
}
//    同ドキュメント内にスタートアップ用参照データがあれば読み出し startupReference > referenceDocument

if(document.getElementById( "startupReference" ) && document.getElementById( "startupReference" ).innerHTML.length){
        referenceDocument=$("#startupReference").text();
        if(referenceDocument.indexOf("&amp;")>=0){referenceDocument=referenceDocument.replace(/&amp;/g,"&");}
        if(referenceDocument.indexOf("&lt;")>=0){referenceDocument=referenceDocument.replace(/&lt;/g,"<");}
        if(referenceDocument.indexOf("&gt;")>=0){referenceDocument=referenceDocument.replace(/&gt;/g,">");}
}else{
        referenceDocument='';

}


//    起動時に AIR環境で引数があれば引数を解釈実行する。
//同様のルーチンで  invorkイベントがあれば引数を解釈して実行するルーチンが必要
//実態はair_UI.jsxに

//    UI生成
    xUI = new_xUI();
//app設定
    xUI.app = 'remaping';

//floating window 初期化
	if(appHost.touchDevice){
	    Array.from(document.getElementsByClassName("minimize")).forEach(e => e.style.display = 'none');
	    Array.from(document.getElementsByClassName("close")).forEach(e => e.style.display = 'none');
	}else{
	    Array.from(document.getElementsByClassName("down")).forEach(e => e.style.display = 'none');
	};//一括調整
    for(var prp in xUI.panelTable){if(xUI.panelTable[prp].type == 'float') xUI.initFloatingPanel(prp);};
console.log(xUI.XPS)
    XPS.readIN=xUI._readIN;
//    *** xUI オブジェクトは実際のコール前に必ずXPSを与えての再初期化が必要  要注意
//if( startupDocument.length == 0){};
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
    if((startupDocument.length==0)&&(myBackup)&&(myBackup.length)){
        myBackup=JSON.parse(myBackup);
        /*
            [0]~[n]配列化テキストで
        */
        console.log(myBackup);
//        var msg="バックアップ保存されたデータがあります。\n復元しますか？\n\nOK:復元 / CANCEL:新規";
//        if(confirm(msg)){        };
            startupDocument=myBackup;
            if(myReference){
                if(myReference.length>0){
                    referenceDocument=myReference;//ソーステキスト代入
                }else{
                    referenceDocument="";
                }
            }
    }
};//    記録されたバックアップデータが有れば読み出し(サーバ運用に向けて停止中) 

if((! startupDocument)&&(fileBox)&&(fileBox.contentText.length)){ startupDocument=fileBox.contentText;}
if( startupDocument.length > 0){
console.log(startupDocument);
console.log(XPS);
console.log(XPS.parseXps(startupDocument));
    NameCheck=false;
}
//リファレンスシートデータがあればオブジェクト化して引数を作成
        var referenceX=new Xps(SheetLooks.trackSpec,nas.SheetLength+':00.');
    if((referenceDocument)&&(referenceDocument.length)){
        referenceX.readIN(referenceDocument);
    }
console.log(XPS.toString(false));
console.log(JSON.stringify(SheetLooks,0,2));
    xUI.init(XPS,referenceX);//初回実行時にxUIにデータを与えて初期化


/*暫定コード
XPS内のxMapをXPSの制作管理情報とシンクロさせる

*/
if(! xUI.XPS.xMap.currentJob) xUI.XPS.xMap.syncProperties(xUI.XPS);

/**
    シートのカラーデータを構築
*/
    xUI.applySheetlooks();//タイムシートルック初期化
    xUI.resetSheet();
/**
    UIパネル関連の初期化をここへ  2023 11.23
*/
//試験的に 拡張セレクタを起動 これは起動手順の最後でも良い　その場合はセレクタの設定をHTML側でエレメントの形で行う必要あり
    Array.from(document.getElementsByClassName('nasHTMLSliderSelect')).forEach(function(e){var SSel = new nas.HTML.SliderSelect(e,null,'vertical');e.link.init();});
//キーパッドの初期化に先立って拡張セレクタの初期化が必要
//キーパッド初期化
    initToolbox();

    if(appHost.touchDevice){xUI.setMobileUI(true);}else{xUI.setMobileUI(false);}
    nas_Rmp_Init();
/* ================================css設定
//================================================================================================================================ シートカラーcss設定2
//    シート境界色設定
    $('table').css('border-color',SheetBaseColor);
    $('th').css('border-color',xUI.sheetborderColor);
    $('td').css('border-color',xUI.sheetborderColor);
//    識別用ラベル背景色設定
//    nas.HTML.setCssRule("th.stilllabel" ,"background-color:"+xUI.stillColor ,"screen");
//    nas.HTML.setCssRule("th.sfxlabel"   ,"background-color:"+xUI.sfxColor   ,"screen");
//    nas.HTML.setCssRule("th.cameralabel","background-color:"+xUI.cameraColor,"screen");
    $("th.stilllabel").css("background-color",xUI.stillColor);// ,"screen");
    $("th.sfxlabel").css("background-color",xUI.sfxColor);//   ,"screen");
    $("th.cameralabel").css("background-color",xUI.cameraColor);//,"screen");

//================================================================================================================================ シートカラーcss設定2
*/
// startupDocumentがない場合でフラグがあればシートに書き込むユーザ名を問い合わせる
/*
    この時点のユーザ問い合わせ手順に問題あり
    問い合わせが必要か否かの条件を調整  かつ  問い合わせ時に記録からユーザの情報を取得して選択肢として提示するUIが必要
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
        nas.HTML.showModalDialog("confirm",msg,localize(nas.uiMsg.userInfo),'',function(){
            if(this.status==0){
                var newName = new nas.UserInfo(document.getElementById('confirmUID').value);
                if(newName.handle){
                    xUI.currentUser = new nas.UserInfo(newName);
                }
                xUI.XPS.update_user = xUI.currentUser;
                xUI.recentUsers.addMember(xUI.currentUser);
                sync("recentUsers");
                sync("update_user");
                sync("current_user");
            }
        });
    document.getElementById("nas_modalInput").focus();
    }};
//    クッキーで設定されたspinValueがあれば反映
    if(xUI.spinValue){document.getElementById("spin_V").value=xUI.spinValue} ;
//  クッキーで設定された差分表示をコントロールに反映
    xUI.footstampReset();
//ツールバー表示指定があれば表示 プロパティ廃止
//    if((xUI.utilBar)&&(!$("#optionPanelUtl").is(':visible'))){$("#optionPanelUtl").show();};//xUI.sWitchPanel('Utl');
/*
	UATimesheet(remaping)　イベント処理
*/
// タイムシート領域のポインタハンドラを設定
//qdr3
    document.getElementById('UIheaderScrollV').addEventListener('pointerdown',xUI.Mouse);
    document.getElementById('UIheaderScrollV').addEventListener('pointerup',xUI.Mouse);
    document.getElementById('UIheaderScrollV').addEventListener('pointerover',xUI.Mouse);
    document.getElementById('UIheaderScrollV').addEventListener('dblclick',xUI.Mouse);
//qdr1
    document.getElementById('UIheaderScrollH').addEventListener('pointerdown',xUI.Mouse);
    document.getElementById('UIheaderScrollH').addEventListener('pointerup',xUI.Mouse);
    document.getElementById('UIheaderScrollH').addEventListener('pointerover',xUI.Mouse);
    document.getElementById('UIheaderScrollH').addEventListener('dblclick',xUI.Mouse);
//qdr2 イベント受信なし

//qdr4 sheet_body
    document.getElementById('sheet_body').addEventListener('pointerdown',xUI.Mouse);
    document.getElementById('sheet_body').addEventListener('pointerup',xUI.Mouse);
    document.getElementById('sheet_body').addEventListener('pointerover',xUI.Mouse);
    document.getElementById('sheet_body').addEventListener('pointerout',xUI.Mouse);
    document.getElementById('sheet_body').addEventListener('click',xUI.Mouse);
    document.getElementById('sheet_body').addEventListener('dblclick',xUI.Mouse);

//ドキュメント全体のキーボードハンドラを設定
    document.body.addEventListener('keydown', function(e) {
console.log(e);
console.log(e.target.id+":"+e.keyCode);
        if(e.target.id == "iNputbOx") return (xUI.keyDown(e));
        
        if(e.composedPath().indexOf(document.getElementById('memo')) < 0){
            xUI.noteFocus = false;
            nas.HTML.removeClass(document.getElementById('memo'),'memoSpace-selected');
            xUI.canvasPaint.syncCommand();
        };
        if(
            (e.target instanceof HTMLInputElement)||
            (e.target instanceof HTMLTextAreaElement)||
            (e.target instanceof HTMLSelectElement)||
            (e.target instanceof HTMLButtonElement)
        ){
            return ;
        }else if(documentFormat.active){
            e.stopPropagation();e.preventDefault();documentFormat.kbHandle(e);return;
        }else if(xUI.onCanvasedit){
            if(!(xUI.canvasPaint.kbHandle(e))){e.stopPropagation();e.preventDefault();};
        }else{
            if(!(xUI.keyDown(e))){e.stopPropagation();e.preventDefault();};
        };
//console.log(document.getElementById("iNputbOx").disabled);
        if(document.getElementById("iNputbOx").disabled){
            document.getElementById("iNputbOx").disabled = false;
        };
        document.getElementById("iNputbOx").focus() ;//live
        document.getElementById("iNputbOx").select();//live
    },false);
    document.body.addEventListener('keypress', function(e) {
        if(e.target.id == "iNputbOx") return (xUI.keyPress(e)) ;
        if(xUI.onCanvasedit){
            if(!(xUI.canvasPaint.kbHandle(e))){e.stopPropagation();e.preventDefault();};
//        }else{
//            if(!(xUI.keyPress(e))){e.stopPropagation();e.preventDefault();};
        };
    },false);

    document.body.addEventListener('keyup', function(e) {
        if(e.target.id == "iNputbOx") return (xUI.keyUp(e)) ;
        if(e.composedPath().indexOf(document.getElementById('memo')) < 0){
            xUI.noteFocus = false;
            nas.HTML.removeClass(document.getElementById('memo'),'memoSpace-selected');
            xUI.canvasPaint.syncCommand();
        };
        if(
            (e.target instanceof HTMLInputElement)||
            (e.target instanceof HTMLSelectElement)||
            (e.target instanceof HTMLButtonElement)
        ){
            return ;
        }else         if(documentFormat.active){
            e.stopPropagation();e.preventDefault();documentFormat.kbHandle(e);return;
        }else if((xUI.onCanvasedit)){
            if(!(xUI.canvasPaint.kbHandle(e))){e.stopPropagation();e.preventDefault();};
        }else{
            if(!(xUI.keyUp(e))){e.stopPropagation();e.preventDefault();};
        };
    },false);
    window.addEventListener('scroll',xUI.onScroll);
//    document.body.addEventListener('keydown',xUI.keyDown);
//    document.body.addEventListener('keyup'  ,xUI.keyUp);

    document.getElementById("iNputbOx").addEventListener('keyPress', xUI.keyPress);


    document.body.addEventListener('dragover', function(e) {
		if((documentFormat.active)||(xUI.onCanvasedit)) return;
        e.stopPropagation();e.preventDefault();
//console.log(e);
//ドラグオーバーされたファイルの種類でカラーを変更するか?
        this.style.background = xUI.selectedColor;//
    }, false);
    document.body.addEventListener('dragleave', function(e) {
		if((documentFormat.active)||(xUI.onCanvasedit)) return;
        e.stopPropagation();e.preventDefault();
        this.style.background = xUI.sheetbaseColor;//
    }, false);
    document.body.addEventListener('drop', async function(e) {
		if((documentFormat.active)||(xUI.onCanvasedit)) return;
        e.stopPropagation();e.preventDefault();
        this.style.background = xUI.sheetbaseColor;//
console.log('droped');
console.log(e.composedPath());

//        const itmid = pman.reName.parseId(e.dataTransfer.getData('text/plain'));
        const files = e.dataTransfer.files; //ドロップされたファイルを取得
        const items = e.dataTransfer.items;

console.log([files,items]);
//タイムシートデータと画像をふるい分け
//  note
//    xUI.importBox.allowExtensions    = new RegExp("\.(txt|csv|xps|xpst|ard|ardj|tsh|xdts|tdts|sts)$",'i');
//    xUI.importBox.allowImgExtensions = new RegExp("\.(jpg|jpeg|jfif|png|gif|tga|targa|psd|psb)$",'i');

        var imgItems  = [];
        var xpstItems = [];
        Array.from(items).forEach(function(e){
console.log(e)
            if(e.type == 'file'){
                var name = e.getAsFile().name;
                if(e.webkitGetAsEntry().isFile){
                    if(name.match(xUI.importBox.allowExtensions))    xpstItems.add(e);
                    if(name.match(xUI.importBox.allowImgExtensions)) imgItems.add(e); 
                };
console.log(e.getAsFile().name);
console.log(e.type);
console.log(e.webkitGetAsEntry().isFile);
            }
        });
/*
        if(itmid >= 0){
//アイテムドロップ
            var itm = pman.reName.getItem(itmid);
            if(e.composedPath().indexOf(document.getElementById('fileStrip')) >= 0){
//            if(e.composedPath()[0].id == 'fileStrip'){};//
console.log('droped to fileStrip end');
//リスト領域内でアイテム外にドロップ ルートの最後尾にアタッチ
				let targetIdx = pman.reName.parseId(e.composedPath()[0].id);
//				let placement = pman.reName.parseId((e.composedPath()[0].id);
				let checkedItems = pman.reName.getSelected();
				if(checkedItems.length){
					pman.reName.move(checkedItems,-1,'PLACEATEND');
				}else{
					pman.reName.move(itm,-1,'PLACEATEND');
				};
				pman.reName.pending = false;
            }else{
//リスト領域外（削除？）
                alert('OUT of RANGE!!');
            };
        }else ;// */  
        if((items.length == 1)&&(items[0].webkitGetAsEntry().isFile)){
console.log(items[0].webkitGetAsEntry().isFile);
console.log(e.dataTransfer.files);
//        if(xpstItems.length){}
//  タイムシートドキュメントファイルの単独ドロップ
//    非活性時は読込｜活性時はリファレンス読込 判別はimportBoxサイドで行う
            xUI.importBox.read(e.dataTransfer.files,processImport);
//        {}
/* エレクトロン拡張時に使用
            if((files.length == 1)&&(files[0].path)){
//fileにpath拡張があるのでhub&&spoke:メッセージ通信でバックグラウンド処理へ移行
				uat.MH.parentModule.window.postMessage({
					channel:'callback',
					from:{name:xUI.app,id:uat.MH.objectIdf},
					to:{name:'hub',id:uat.MH.parentModuleIdf},
					command:'return electronIpc.getEntryFileList(...arguments)',
					content:[files[0].path,3,pman.reName.maxItemCount],
					callback:"pman.reName.initItems(...arguments)"
				});
			}else if ((files.length == 1)&&(items.length == 1)){
			} ;// */
        }else if((items[0].webkitGetAsEntry().isFile)&&(files.length > 1)){
//マルチファイルドロップ
//タイムシートファイルが複数ある場合のみ複数アイテムでread
        }else{
console.log(files);
console.log(items);
        };
    }, false);

//シート領域のドラグスクロール等を設定
    document.getElementById('memo').addEventListener('mousedown', function(e) {
        if(e.composedPath().indexOf(document.getElementById('optionPanelPaint')) < 0)
            xUI.noteFocus = true;
            nas.HTML.addClass(document.getElementById('memo'),'memoSpace-selected');
            xUI.canvasPaint.syncCommand();
    });// */
//カーソル変更
    document.body.addEventListener('mousemove', function(e) {
xUI.printStatus(e.target.className);
if(e.composedPath().indexOf(document.getElementById('sheet_view')) >= 0){
        var point = [
            (e.pageX-document.getElementById('sheet_view').offsetLeft)/document.getElementById('sheet_view').clientWidth,
            (e.pageY-document.getElementById('sheet_view').offsetTop)/document.getElementById('sheet_view').clientHeight
        ];
        if(
            (e.target.className=='assetItemBox')||
            (e.target.className=='thumbnailBoxPreview')||
            (e.target.className=='elementThumbnail')
        ){
            document.getElementById('sheet_view').style.cursor = 'auto';
        }else if(
            (!(nas.HTML.mousedragscrollable.movecancel))&&
            (nas.HTML.mousedragscrollable.footmark)
        ){
            document.getElementById('sheet_view').style.cursor = 'grabbing';
        }else if(
            (document.getElementById('imgPreview'))&&
            (!(xUI.onCanvasedit))&&
            (!(nas.HTML.mousedragscrollable.footmark))&&(
                (document.getElementById('sheet_view').clientWidth  <= document.getElementById('imgPreview').width)||
                (document.getElementById('sheet_view').clientHeight <= document.getElementById('imgPreview').height)
            )&&(point[0] >= 0.2)&&(point[0] <= 0.8)&&(point[1] >= 0.2)&&(point[1] <= 0.8)
        ){
            document.getElementById('sheet_view').style.cursor = 'grab';
        }else{
            document.getElementById('sheet_view').style.cursor = 'auto';
        };
};
    });
//右クリックコンテキストメニュー呼び出し notoFocusリリース
    document.body.addEventListener('mousedown', function(e) {
//console.log(e);
//console.log('context :' + e.target.id);
        xUI.flipContextMenu(e);
        if(
            (e.composedPath().indexOf(document.getElementById('memo')) < 0)&&
            (e.composedPath().indexOf(document.getElementById('optionPanelPaint')) < 0)
        ){
            xUI.noteFocus = false;
            nas.HTML.removeClass(document.getElementById('memo'),'memoSpace-selected');
            xUI.canvasPaint.syncCommand();
        };
    },false);
//ロングプレスによるコンテキスメニュー呼び出し
    $(document.body).longpress(
        function(e){
//console.log('longpress') ;console.log(e);
//console.log(e.originalEvent.composedPath());
//console.log([e.target.id,e.target.className]);
            if(!(
                (e.target.value)||
                (e.target.onclick)||
                (e.target instanceof HTMLLIElement)||
                (e.target instanceof SVGElement)||
                (
                    (e.target.id.match(/^[0-9]+_[0-9]+$/))&&
                    (xUI.Selection.join('_')!='0_0')
                )||(
                    (e.target.id.indexOf('optionPanel')>=0)||
                    (e.target.className.indexOf('float')>=0)
                )
            )) xUI.flipContextMenu(e);},
        function(e){
//console.log('shortpress');console.log(e);
            if(!(
                (e.target.value)||
                (e.target.onclick)||
                (e.target instanceof HTMLLIElement))||
                (e.target instanceof SVGElement)||
                (
                    (e.target.id.match(/^[0-9]+_[0-9]+$/))&&
                    (xUI.Selection.join('_')!='0_0')
                )||(
                    (e.target.id.indexOf('optionPanel')>=0)||
                    (e.target.className.indexOf('float')>=0)
                )
            ) xUI.flipContextMenu(e);},
    500);

//シート領域 マウスオペレーション終了時の処理
    document.getElementById('sheet_view').addEventListener('mouseup', function(e) {
//console.log(e);
        if(!(nas.HTML.mousedragscrollable.movecancel)){
//フットマークが存在すればマウスドラグ移動の解決
        if(nas.HTML.mousedragscrollable.footmark){
            var itemPos   = $('#sheet_view').position();
            if (itemPos) xUI.previewPoint = [
                (document.getElementById('sheet_view').clientWidth/2 - itemPos.left)/document.getElementById('sheet_view').width,
                (document.getElementById('sheet_view').clientHeight/2 - itemPos.top)/document.getElementById('sheet_view').height
            ];
//console.log(xUI.previewPoint);// */
                nas.HTML.mousedragscrollable.footmark = false ;
                return ;
            };
        };
//console.log(e);
//console.log([e.target.clientWidth,e.layerX]);
//        xUI.flipContextMenu(e);
        if(
            (xUI.onCanvasedit)||
//            (pmanreName.focus < 0)||
            (e.button != 0)||
//            (e.target.className == 'assetItemBox')||
//            (e.target.className == 'thumbnailBoxPreview')||
//            (e.target.className == 'elementThumbnail')||
            (e.target.clientWidth  < e.layerX)||
            (e.target.clientHeight < e.layerY)
        ) return true;
        var clickPoint = [
            (e.pageX-document.getElementById('sheet_view').offsetLeft)/document.getElementById('sheet_view').clientWidth,
            (e.pageY-document.getElementById('sheet_view').offsetTop)/document.getElementById('sheet_view').clientHeight
        ];

/*        if(pman.numOrderUp){
            if((clickPoint[1] < 0.2)||(clickPoint[0] > 0.8)){
                pmanreName.select('prev');//上・右
            }else if((clickPoint[1] > 0.8)||(clickPoint[0] < 0.2)){
                pmanreName.select('next');//下・左
            };
        }else{
            if((clickPoint[1] < 0.2)||(clickPoint[0] < 0.2)){
                pmanreName.select('prev');//上・左
            }else if((clickPoint[1] > 0.8)||(clickPoint[0] > 0.8)){
                pmanreName.select('next');//下・右
            };
        };// */
    }, false);

/*
 *    シート画面のホイルアクション
 *    通常はスクロール
 *    画像編集中にショートカット割付ありでホイルズーム
 */
    document.getElementById('sheet_view').addEventListener('wheel', function(e) {
        if(!(xUI.wheelZoom)) return;//NOP return
        if(e.composedPath().indexOf(document.getElementById('fixedHeader')) >= 0){
            return;
        };
        var current = xUI.zoomSwitch.scalePresets.findIndex(function(e){return (e <= xUI.viewScale)});
        let size = (e.deltaY > 0)? current + 1:current -1;
        if(size >= xUI.zoomSwitch.scalePresets.length){
            size = xUI.zoomSwitch.scalePresets.length-1;
        } else if(size < 0){
            size = 0;
        };
        xUI.adjustScale(xUI.zoomSwitch.scalePresets[size]);
        e.preventDefault();
    },false);
/*ウインドウ上のペースト*/
    document.body.addEventListener('paste', function(e) {
//console.log(e);
        if(true){
// event からクリップボードのアイテムを取り出す
	    var data_transfer = (e.clipboardData) || (window.clipboardData);// DataTransferオブジェクト取得
//console.log('event paste');
	    var myImg = data_transfer.getData( "image" );// 文字列データを取得

            var items = e.clipboardData.items; //clipboard item
            for (var i = 0 ; i < items.length ; i++) {
                var item = items[i];
                if (item.type.indexOf("image") != -1) {
// 画像拾い出す
                    var file = item.getAsFile();
                    console.log(file);
//      upload_file_with_ajax(file);
                };
            };
        };
    });
//ドラグスクロール開始
    nas.HTML.mousedragscrollable();
//入力スタンバイ
//    document.getElementById("iNputbOx").focus();
//test タスクコントローラ起動
    startupTaskController();
};
/**
 *    @params {String}   mode
 *    自動処理 "print"||"png"|| other
 *      body=onlyはこの関数へ渡されない
 *    @params {String}   form
 *    コンテント処理モード "action"|| other
 *    @params {String}   appealance
 *    コンテント処理モード "action"|| other
 *    @params {Number}   page
 *    指定ページ番号
 *    @parmsc {Function} callback
 *
 *    印字|保存用HTMLスタートアップ  （スタートアップのサブセット)
 *    印字｜保存用ページのみで実行
 *    印刷ページが、インラインフレーム前提となるのでプロパティの引き渡しを親ウインドウ経由で行うように改変
 *    
 */
function nas_Prt_Startup(mode,form,page,callback){
    if(! mode) mode = '';//print,png　
    if(! form) form = '';
    if(! page) page = 0;

//ドキュメントフォーマットマネージャー初期化
    documentFormat.init();
//WEB-UI解像度の設定
    nas.RESOLUTION.setValue('96ppi');
//ライブラリフレームレートの設定
    nas.FRATE=nas.newFramerate(SheetLooks.FrameRate);
console.log('printout startup')
console.log(SheetLooks);
//       グローバルの XPSを実際のXpsオブジェクトとして再初期化する
    XPS = new Xps(SheetLooks,MaxFrames);
/*============*     初期化時のデータ取得    *============*/
/*
 *  レンダリング時にドキュメント内にスタートアップデータが埋め込まれていることが前提
 */
//    ドキュメント内スタートアップデータを読み出し
    var startupDocument;var referenceDocument
    if(document.getElementById( "startupContent" )){
         startupDocument=$("#startupContent").text();
    };
//    同ドキュメント内にスタートアップ用参照データがあれば読み出しstartupReference
    if(
        document.getElementById( "startupReference" ) &&
        document.getElementById( "startupReference" ).innerHTML.length
    ){
        referenceDocument=$("#startupReference").text();
    }
//    UI生成
    xUI = new_xUI();
    XPS.readIN=xUI._readIN;
console.log(xUI);
//*** xUI オブジェクトは実際のコール前に必ずXPSを与えての再初期化が必要  要注意
    if( startupDocument.length > 0){ XPS.readIN(startupDocument) }
//リファレンスシートデータがあればオブジェクト化して引数を作成
    var referenceX = new Xps(SheetLooks.trackSpec,nas.SheetLength+':00.');
    if((referenceDocument)&&(referenceDocument.length)){
        referenceX.parseXps(referenceDocument);
    };
    if(xUI.init(XPS,referenceX)){
//ドキュメント上の値でパラメータを更新
/*
//ページ長・カラム
//    xUI.replaceEndMarker([xUI.XPS.xpsTracks.length,xUI.XPS.xpsTracks.duration]);//終了マーカー配置
    xUI.PageCols    = document.getElementById("prefPageCols").value;
    xUI.SheetLength = document.getElementById("prefSheetLength").value;
    xUI.PageLength  = xUI.SheetLength  *  XPS.framerate;
//単一ページレンダリングのための引数を取得
//タイムシート領域を印字範囲内にスケーリング
    var pgRect     = document.getElementById("printPg1").getBoundingClientRect();
//    var headerRect = document.getElementById("pg1Header").getBoundingClientRect();
    var headerRect = {width:1058,height:320};
    var tableRect  = document.getElementsByClassName("sheet")[0].getBoundingClientRect();
    var baseWidth  = headerRect.width;//ヘッダ幅に合わせる
    var baseHeight = 1584;//A3height.96ppi.8px/unit
    var xScale = baseWidth/tableRect.width;
    var yScale = (baseHeight-headerRect.height)/tableRect.height;
//    $(".sheet").css({"transform":"scale("+[xScale,yScale].join()+")","transform-origin":"0 0"});
    $(".sheetArea").css({"transform":"scale("+[xScale,yScale].join()+")","transform-origin":"0 0"});
    $(".printPage").css({"height":baseHeight,"width":baseWidth});
//    xUI.replaceEndMarker([xUI.XPS.xpsTracks.length,xUI.XPS.xpsTracks.duration]);//終了マーカー配置
// */
//パラメータのコピー
//        xUI.sheetLooks = (window.parent.xUI.sheetLooks);
//
console.log(xUI);
        xUI.applySheetlooks(window.parent.xUI.sheetLooks);
/*
    親ウインドウのviewモードを継承しない
    Compactは、印刷に不適 なため WordProp モードに転換
    PageImageは、印刷時のWordPropモードに等価
    そのため、PageImageに統一するのが妥当
 */
        xUI.viewMode = 'PageImage';
        xUI.resetSheet();

//PageImageの場合は 1 ,WordPropの場合は、親ウインドウの値を継承
        xUI.setAppearance(0.01);
        if(window.parent.xUI.viewMode == 'PageImage'){
            xUI.setAppearance(1);
        }else{
            xUI.setAppearance(XPS.timesheetImages.imageAppearance);
        };
//スケーリング終了後のアイテム座標でマーカーを配置
        if(form == 'action') buildActionSheet();
        adjustSheetA3(true);
        xUI.syncSheetCell(undefined,undefined,false,()=>{
            xUI.syncSheetCell(undefined,undefined,true,()=>{

                xUI.replaceEndMarker().then(()=>{
                    xUI.showPage(page);
                    if(mode == 'print'){
                        window.print();
                    }else if(mode == 'png'){
                        sheetSaveAsPng(0,()=>{
//                            window.parent.document.getElementById('printFrame').remove()
                        });
                    };
                    if(callback instanceof Function) callback();
                });
            });
        });
//        xUI.Cgl.refresh();
    }else{
        window.close()
    };
};
//
/** タイムシートのUIをリセットする手続き
タイムシートの変更があった場合はxUI.init(XPS)を先にコールしてxUIのアップデートを行うこと

引数としてuiModeを文字列で与えて  リセット後のuiModeを指定可能 未指定の場合はリセット前のモードを継続
    ↓
シート内容のみの変更の場合は、xUI.resetSheetを用いる  その際xUI.initを省略することが必要
xUI.initの初期化手続は１回のみに変更  コードを組み替えて整理すること。

シート変更時の画面リフレッシュを別の手続'xUI.resetSheet'へ移行
この手続は、UIの再初期化手続として利用される
この一連の手続内でxUI.resetSheet()メソッドがコールされる
*/
function nas_Rmp_Init(uiMode){
    var startupWait=false;
/*
//console.log(xUI.XPS.toString())
//console.log(xUI.referenceXPS.toString())
*/
if(false){
//プロパティのリフレッシュ
    xUI._checkProp();
    xUI.Cgl.init();//特にこの処理を重点的にチェック  このルーチンは実行回数が少ないほど良い
}
//    xUI.resetSheet();

/*  表示モード増設 
Compactモード時は強制的に
  表示１列  コンテの継続時間とページ長を一致させる
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
//タイムシートテーブルボディ幅の再計算 ここにトラック種別が反映されていない  注意
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
//コンパクトモード  コンパクトUI用のラベルヘッダーを作成
document.getElementById("UIheaderFix").innerHTML=xUI.pageView(-1);
document.getElementById("UIheaderScrollH").innerHTML=xUI.pageView(0);
document.getElementById("UIheaderScrollV-table").innerHTML=xUI.pageView(-2);
document.getElementById("UIheader").style.display="inline";
//コンパクトUI時は1ページ限定なのでボディ出力を１回だけ行う
        var SheetBody= xUI.headerView(1);
        SheetBody+= '<br>';//UI調整用に１行（ステータス行の分）
        SheetBody+= xUI.pageView(1);
}else{
//ノーマルモード  コンパクトUI用のラベルヘッダーを隠す
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
     if(
        (document.getElementById('backend_variables'))&&
        ($("#backend_variables").attr("data-organization_token").indexOf('<%=')!= 0)
    ){
//オンサイト
console.log('Application server-onsite');
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
/*
オンサイト時にiFrame表示を行う場合
以下のエレメントを非表示にする
スクリーンをメニュー幅シフトする
*/
    $('#headerLogo').hide();
    $('#headerRepository').hide();
    $('#account_box').hide();
//    xUI.shiftScreen(50,50);//旧UIでは不要

//  サーバ指定のフレームレートが存在する場合は最優先で取得してデフォルト値を設定する
        var frtString=$("#backend_variables").attr("data-frame_rate");
        if(String(frtString).length){
console.log("framerate specified : " + frtString);
            nas.FRATE = nas.newFramerate(frtString);//ここでnas.FRATEを変更するか否か…  一時変数とするケースを考慮のこと
        }else{
console.log("no framerate specified");
        };
//  データスケール指定が有効ならばフレーム数として取得
	    var spcFrames=nas.FCT2Frm($('#backend_variables').attr('data-scale'),nas.FRATE);
//   カラーセット
        var sheetBaseColor=$("#backend_variables").attr("data-sheet_color");
        if (sheetBaseColor.match(/^rgba?\(([\d\s\.,]+)\)$/i)){
            var collorArray=(RegExp.$1).split(',');
            sheetBaseColor="#"+parseInt(collorArray[0],10).toString(16)+parseInt(collorArray[1],10).toString(16)+parseInt(collorArray[2],10).toString(16);
        }
        if(sheetBaseColor.match(/^#[0-9a-f]+$/i)){
            SheetLooks.SheetBaseColor = sheetBaseColor;
            xUI.applySheetlooks(SheetLooks);
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

//新規作成メニューをブロック
    xUI.pMenu('pMnewdoc','disabled');
    xUI.pMenu('pMnewEntry','disabled');
//インポート関連をロック  操作をsync('productStatus')に統合（タイミングが同じ）
// sync("importControllers");//document.getElementById('loginuser').innerHTML = xUI.currentUser.handle;//document.getElementById('serverurl').innerHTML = serviceAgent.currentServer.url;//document.getElementById('ibMdiscard').disabled=true;//document.getElementById('ibMfloat').disabled=true;
         $('#ibMdiscard').hide();
         $('#ibMfloat').hide();
         $('#pMbrowseMenu').hide();
         $('#ibMbrowse').hide();
//設定表示
                 document.getElementById('toolbarHeader').style.backgroundColor='#ddbbbb';
//サーバ既存エントリ
            var isNewEntry = ( startupDocument.length==0)? true:false;
//サーバ上で作成したエントリの最初の1回目はサーバの送出データが空
//空の状態でかつトークンがある場合が存在するので判定に注意！
//トークンあり、送出データが存在する場合は、識別子同期自体を省略すること
//カットトークンがない場合はマルチドキュメントモードで初期化
            if($("#backend_variables").attr("data-cut_token").length){ ;//この判定は仕様変更で不要になっている  ここでトークンのないケースはエラーケース
 /* ========= シンクルドキュメントバインド時の初期化 ========= */
console.log('has cut token');
                 serviceAgent.currentServer.getRepositories(function(){
                     var RepID = serviceAgent.getRepsitoryIdByToken($("#backend_variables").attr("data-organization_token"));
                     serviceAgent.switchRepository(RepID,function(){
                         if(dbg) console.log('switched repository :' + RepID);

console.log(nas.FRATE);
/*  最小の情報をトークンベースで取得
最短時間で情報を構築するためにAPIを直接コール
*/
//get product information
$.ajax({
        url:serviceAgent.currentRepository.url+'/api/v2/products/'+ $('#backend_variables').attr('data-product_token') +'.json',
        type:'GET',
        dataType: 'json',
        success: function(productResult) {
console.log('get ProductResult');
console.log(productResult);
            serviceAgent.currentRepository.productsData=[productResult.data.product];
//get episode information
    $.ajax({
        url:serviceAgent.currentRepository.url+'/api/v2/episodes/'+ $('#backend_variables').attr('data-episode_token') +'.json',
        type:'GET',
        dataType: 'json',
        success: function(episodeResult) {
console.log('get EpisodeResult');
console.log(episodeResult);
            serviceAgent.currentRepository.productsData[0].episodes=[[episodeResult.data.episode]];
//get cut information
        $.ajax({
        url:serviceAgent.currentRepository.url+'/api/v2/cuts/'+ $('#backend_variables').attr('data-cut_token') +'.json',
        type:'GET',
        dataType: 'json',
        success: function(cutResult){
console.log('get CutResult')
console.log(cutResult)
//データ請求に成功
        	var myContent=cutResult.data.cut.content;//XPSソーステキストをセット
console.log('create new Xps');
    //data-scaleに有効な値が存在する場合は、その値を参照  後ほど調整する処理を減らす
            
        	var currentXps = new Xps(SheetLooks.tarckSpec,(spcFrames)?spcFrames:nas.SheetLength+':00.');//一時オブジェクトを作成

currentXps.title    = productResult.data.product.name;
currentXps.opus     = episodeResult.data.episode.name;
currentXps.subtitle = episodeResult.data.episode.description;
currentXps.cut      = cutResult.data.cut.name;
currentXps.line      = new XpsLine(cutResult.data.cut.line_id);
currentXps.stage      = new XpsStage(cutResult.data.cut.stage_id);
currentXps.job      = new XpsStage(cutResult.data.cut.job_id);
currentXps.currentStatus      = new JobStatus(cutResult.data.cut.status);

var curentAPIIdentifier = Xps.getIdentifier(currentXps); 
/*
    有効なリザルトを得た場合は、最新データなので startupDocumentを入れ換える。
    ロードのタイミングで他のユーザが書き換えを行った可能性があるので、最新のデータと換装
    myContent==nullのケースは、サーバに空コンテンツが登録されている場合なので単純にエラー排除してはならない
    
    稀なケースで、登録直後のデータを開いて作業にはいり、アクシデント等で未編集のままサーバの接続を断って自動保存が発生した場合、
    タイムシートの内容がデフォルト1秒でタイトル・エピソード・カット番号等を失う場合がある  要検出
    
*/
console.log('getStartupContent')
//console.log(myContent);
	        if(myContent){
console.log('has Content')
                var checkSheet = new Xps();
                checkSheet.parseXps(myContent);//取得した内容で一時データ作成
                //一時データの整合性を検査
                var checkIdf=Xps.compareIdentifier(Xps.getIdentifier(checkSheet),Xps.getIdentifier(currentXps));
                if(checkIdf > 0){
                     startupDocument=myContent;
                    //currentXps.parseXps(myContent);
                    currentXps=checkSheet;//Swapで
                }
console.log(currentXps);
                
//if(currentXps.time()!=spcFrames)
	        } else if(myContent == null){
console.log('no Content get');
	            var myParseData = Xps.parseSCi((cutResult.data.cut.description)?cutResult.data.cut.description:cutResult.data.cut.name);
	            currentXps.cut = myParseData[0].cut;
//ディスクリプション領域に識別子があればそちらを優先、更にdata-scaleが存在すればそれを優先  名前 < 識別子 < data-scale
                if(spcFrames){
console.log('data scale specified :');
console.log(spcFrames);
console.log(nas.FRATE);
                    myParseData[0].time=String(spcFrames);
console.log(myParseData);
                }
console.log( myParseData[0].time );
console.log( 'setDuration :'+nas.FCT2Frm(myParseData[0].time,nas.FRATE));
	            currentXps.setDuration(nas.FCT2Frm(myParseData[0].time,nas.FRATE));
//このケースでは必ずFloatingステータスのデータができるので、ステータスを強制的にStartupへ変更する
                currentXps.currentStatus= new JobStatus('Startup');
	        };
console.log(currentXps);
console.log([
    currentXps.line.toString(true),
    currentXps.stage.toString(true),
    currentXps.job.toString(true),
    currentXps.currentStatus.toString(true)
].join('//'));
console.log(Xps.getIdentifier(currentXps));
console.log(currentXps.getIdentifier(true));

//本体情報からエントリを作成して要素一つだけのproductsDataリストを作る
            serviceAgent.currentRepository.productsData[0].episodes[0][0].cuts=[[{
                token:cutResult.data.cut.token,
                name:cutResult.data.cut.name,
//                description:cutResult.data.cut.description,
                description:Xps.getIdentifier(currentXps),
                created_at:cutResult.data.cut.created_at,
                updated_at:cutResult.data.cut.updated_at,
                versions:cutResult.data.versions
            }]];
            serviceAgent.currentRepository.convertPDEL();//エントリリストに変換
//
//currentXpsのプロパティをリザルトに同期させる
                    var myIdentifier=serviceAgent.currentRepository.getIdentifierByToken($('#backend_variables').attr('data-cut_token'));
                    if((myIdentifier)&&(Xps.compareIdentifier(Xps.getIdentifier(XPS),myIdentifier) < 5)){
                        xUI.XPS.syncIdentifier(myIdentifier,false);
                        
//同期が行われたのでフラグを立てる
//console.log(xUI.XPS)
                    }
                    
                    if( startupDocument.length==0 ){
console.log('detect first open no content');//初回起動を検出  コンテント未設定
//console.log(XPS)
                        xUI.XPS.line     = new XpsLine(nas.pmdb.pmTemplates.members[0]);
                        xUI.XPS.stage    = new XpsStage(nas.Pm.pmTemplates.members[0].stages.members[0]);
                        //xUI.XPS.stage    = new XpsStage((xUI.XPS.line.stages).split(',')[0]);
                        xUI.XPS.job      = new XpsStage(nas.pmdb.jobNames.getTemplate(xUI.XPS.stage,"init")[0]);
                        xUI.XPS.currentStatus   = new JobStatus("Startup");     
                        xUI.XPS.create_user=xUI.currentUser;
                        xUI.XPS.update_user=xUI.currentUser;
//syncIdentifierでカット尺は調整されているはずだが、念のためここで変数を取得して再度調整をおこなう
//data-scale を廃止した場合は、不用
                        var myCutTime = nas.FCT2Frm($('#backend_variables').attr('data-scale'));
                        if((myCutTime) && (!(isNaN(myCutTime))) && (myCutTime != xUI.XPS.time())){
//console.log('setDuration with data-scale')
                            xUI.XPS.setDuration(myCutTime);
                        }
                    }
                    xUI.resetSheet(currentXps);
//ここで無条件でproductionへ移行せずに、チェックが組み込まれているactivateEntryメソッドを使用する
                        xUI.setRetrace();
                        xUI.setUImode('browsing');//初期値設定
		                if (startupWait) xUI.sWitchPanel('Prog');//ウェイト表示消去
                        switch(xUI.XPS.currentStatus.content){
                            case "Active":
                        // チェックイン直後の処理の際はactivate処理が余分なのでケースわけが必要
                        // jobIDがフラグになる  スタートアップ直後の自動チェックインの場合のみ処理をスキップしてモード変更
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
                        xUI.setUImode(xUI.setUImode());//現モードで再設定
console.log('初期化終了');
                },
        error : function(result){console.log(result)},
        beforeSend: serviceAgent.currentRepository.service.setHeader
        });//get cut information
        },
        error : function(result){console.log(result)},
        beforeSend: serviceAgent.currentRepository.service.setHeader
    });//get episode information
        },
        error : function(result){console.log(result)},
        beforeSend: serviceAgent.currentRepository.service.setHeader
});//get product information

                     });//set Repository
                 });//get Repository
             };//カットトークンの確認  これがなければ不正処理
/* ========= シンクルドキュメントバインド時の初期化 ========= */
         } else {
//マルチドキュメントモード
// リポジトリのIDは不問 とりあえず１(ローカル以外)
//console.log('onsite multi-document mode');
             serviceAgent.currentServer.getRepositories(function(){
//                 serviceAgent.switchRepository(1,documentDepot.rebuildList);
                 serviceAgent.switchRepository(1);
             });
            $("li#pMos").each(function(){$(this).hide()});//シングルドキュメントモード専用UI

         }
//if(serviceAgent.currentRepository.entry(Xps.getIdentifier(xUI.XPS))),
     }else{
//console.log('Application Offsite');
//オフサイトモード
    console.log(serviceAgent.currentServer);
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
//localRepositoryの設定を行う
    serviceAgent.currentRepository.getProducts();
    serviceAgent.switchRepository();
        sync('server-info');
     }
//シートボディを締める
//    document.getElementById("sheet_body").innerHTML=SheetBody+"<div class=\"screenSpace\"></div>";

    console.log(serviceAgent.currentServer);

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
//jquery関連  パネル類の初期化
//    initPanels();
/*
りまぴん
入出力関連プロシージャ

ウインドウの開閉コントロール
jQueryライブラリの使用に置き換えるので
ルーチンの見なおし
2013.02.26
パネル類の初期化を Rmp_InitからStartupへ移動するのが望ましい
ロード後に一回のみの実行で充分　モード変更のたびに行う必要はない
2023.11.23
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
	width	:((appHost.touchDevice))? '100%':'720px',
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
        // File API が使用できない場合は諦め
        if(!window.FileReader) {
        console.log("File API がサポートされていません。:"+new Date());
          return false;
        }
        // イベントをキャンセルするハンドラ
        var cancelEvent = function(event) {
            event.preventDefault();event.stopPropagation();
            return false;
        }
        // dragenter, dragover イベントのデフォルト処理をキャンセル
        localFileLoader.bind("dragenter", cancelEvent);
        localFileLoader.bind("dragover", cancelEvent);
        // ドロップ時のイベントハンドラを設定します.
        var handleDroppedFile = function(event) {
          // ドロップされたファイル配列を取得してファイルセレクタへ
          // 同時にonChangeを打つ
          document.getElementById('myCurrentFile').files = event.originalEvent.dataTransfer.files;
          // デフォルトの処理をキャンセル
          cancelEvent(event);
          return false;
        }
        // ドロップ時のイベントハンドラを設定
        localFileLoader.bind("drop", handleDroppedFile);
});

//ヘッドラインの初期化
//    initToolbox();//ローカル起動はここでもよいが サーバ起動時にはここでは遅い
//デバッグ関連メニューの表示
    if(dbg){
        $("button.debug").each(function(){$(this).show()});
        $("li.debug").each(function(){$(this).show()});
        if(appHost.platform=="AIR"){$("li.airDbg").each(function(){$(this).show()})};
    }else{
        $("button.debug").each(function(){$(this).hide()});
        $("li.debug").each(function(){$(this).hide()});
        $("li.airDbg").each(function(){$(this).hide()});
    }
//AIR|Node.js(+Electron)を認識した場合cgiUIとlocalUIを切り換え

//switch (appHost.platform){
    if ((appHost.Nodejs)||(appHost.platform == "AIR")){
//case    "AIR":
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
                case "cMair":
                case "dMair":$(this).show();break;
                case "cMps":
                case "dMps":
                case "cMcgi":
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
//break;
    }else if((appHost.platform == "CEP")||(appHost.platform == "CSX")){
//case "CEP":
//    window.parent.psHtmlDispatch();    xUI.shiftScreen(50,50);
//case    "CSX":
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
                case "cMps":
                case "dMps":$(this).show();break;
                case "cMair":
                case "dMair":
                case "cMcgi":
                case "dMcgi":$(this).hide();break;
                }
            });
//ブラウザ用ドロップダウンメニュー表示
        $("#pMenu").show();
//ドロップダウンメニューの初期化
        $("#pMenu li").hover(function() {
            $(this).children('ul').show();
        }, function() {$(this).children('ul').hide();});
//表示切り替え
        xUI.setToolView('compact');
//break;
    }else{
console.log(ToolView)
//default:
//標準的なブラウザ
        $("tr#airMenu").each(function(){$(this).hide()});
//ショートカットアイコンボタン
        $("#airMenu").hide();//
        $("#psMenu").hide();//
        $("#cgiMenu").show();//
//ドロップダウンメニュー用表記切り替え
        $("li").each(function(){
                switch(this.id){
                case "cMcgi":
                case "dMcgi":$(this).show();break;
                case "cMair":
                case "dMair":
                case "cMps":
                case "dMps":$(this).hide();break;
                }
            });
//ブラウザ用ドロップダウンメニュー表示
        $("div#pMenu").show();
//ドロップダウンメニューの初期化
        $("#pMenu li").hover(function() {
            $(this).children('ul').show();
        }, function() {$(this).children('ul').hide();});
    }
// }
//Node.js(+electron)環境の際airMenuを再表示
    if(appHost.Nodejs) $("#airMenu").show();//="inline";
//オンサイト時の最終調整はこちらで？
    if(xUI.onSite){
//        xUI.sWitchPanel('Prog');
    };
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
    xUI.setToolView(ToolView);
//暫定  プラットホームを判定して保存関連のボタンを無効化したほうが良い  後でする

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
//起動時の画面幅で制限モードON
    if((window.innerWidth<640)||
    (window.parent.screen.width<640)){
        xUI.setRestriction(true);
    }
/* ヘッダ高さの初期調整*/
//xUI.adjustSpacer();
xUI.tabSelect(xUI.activeDocumentId);
/* */
xUI.selection();
//スタートアップ中に時間のかかる処理をしていた場合はプログレスパネルで画面ロック  解除は操作側から行う
if(startupWait){xUI.sWitchPanel('Prog');};//ウェイト表示
};
/*
    ページ再ロード前に必要な手続群
*/
function nas_Rmp_reStart(evt){
//ファイルがオープン後に変更されていたら、警告する
/*
    変更判定は xUI.activeDocument.undoBuffer.storePt と xUI.activeDocument.undoBuffer.undoPtの比較で行う
storePtはオープン時および保存時に現状のundoPtを複製するので、
内容変化があれば (xUI.activeDocument.undoBuffer.storePt != xUI.activeDocument.undoBuffer.undoPt) となる

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
//パネル類を閉じる
    xUI.sWitchPanel('clear');
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
    };//現在  cookie:0 は常にfalse

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
メモ  シートの秒数を減らす際にスクロールスペーサーのサイズ計算が間違っている
計算違いではなく  ステータス表示エレメントの位置がズレて、その値から計算しているのでおおきくなる
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
/*  ---------- sync.js
		パネル情報同期

ユニット名称	HTML-Elements  説明

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
	PropLists["framerate"]=["custom","23.976","24","30","29.97","59.96","25","50","15","48","60"];
	PropLists["framerate_name"]=["=CUSTOM=","23.98","FILM","NTSC","SMPTE","SMPTE-60","PAL","PAL-50","WEB","FR48","FR60"];
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
	UI表示同期プロシジャ
オンメモリの編集バッファとHTML上の表示を同期させる。キーワードは以下の通り
fct	;//フレームカウンタ *
lvl	;//キー変換ボタン *
spinS	;//スピンセレクタ *
title	;//タイトル *
subtitle	;//サブタイトル *
opus	;//制作番号 *
create_time	;//作成時間 **
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
tag     ;//タイムラインタグ
lbl	    ;//タイムラインラベル
info_	;//セット変更 シート上書き
tool_	;//セット変更 ツールボックス
pref_	;//セット変更 設定パネル
scene_	;//セット変更 ドキュメントパネル
about_	;//セット変更 りまぴんについて
data_	;//
dbg_	;//
winTitle;//ウィンドウタイトル文字列
productStatus	;//制作ステータス
scale   ;//タイムシート領域表示スケール 
docImgAppearance;//画像表示状態・Number 0-1
server-info     ;//
historySelector ;//ヒストリセレクタ
referenceLabel  ;//リファレンスエリアのラベル
importControllers    ;//インポートリードアウトコントロール
*/
function sync(prop){
if(! document.getElementById('edchg')) return;
if (typeof prop == 'undefined') prop = 'NOP_';
if(prop=='layer')sync.layer++;
	switch (prop){
case    "scale":
            document.getElementById('pageZoom').value = Math.round(xUI.viewScale * 100);//Xの値のみを参照する
            document.getElementById('pageZoomSlider').value = document.getElementById('pageZoom').value;//Xの値のみを参照する
        break;
case    "paintColor":
            xUI.canvasPaint.syncColors();
        break;
case    "paintPalette" :
case    "paintTool" :
            xUI.canvasPaint.syncTools();
        break;
case    "imgAdjust":
        break;
case    "docImgAppearance":
        document.getElementById('ImgAppearanceSlider').value = Math.floor(xUI.XPS.timesheetImages.imageAppearance*100);
        document.getElementById('ImgAppearance').value = document.getElementById('ImgAppearanceSlider').value;
        break;
case    "server-info":
        document.getElementById('headerRepository').innerHTML='<a onclick="serviceAgent.currentRepository.showInformation();" title="'+serviceAgent.currentRepository.owner.handle+'"><b>'+serviceAgent.currentRepository.name+'</b></a>';
        break;
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
        break;
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
            this.title     = editTitle;
        };
    });
    break;
case    "referenceLabel":
//referenceXPSエリアのラベル更新
/*
    リファレンスが編集中のデータと同エントリーでステージ・ジョブ違いの場合はissueの差分表示を行う。
タイトルテキストは
    同ステージのジョブなら    jobID:jobName
    別ステージのジョブならば  stageID:stageName//jobID:jobName
    別ラインのジョブならば    lineID:lineName//stageID:stageName//jobID:jobName
    別カットならば  IDFをすべて
ラベル表示は上記の1単語省略形で
    同ステージのジョブなら    jobName
    別ステージのジョブならば  stageName
    別ラインのジョブならば    lineName
    別カットならば  cutIdf(Xps.getIdentifier(true))
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
            this.title     = referenceTitle;
        };
    });
    break;
case    "historySelector":;
    var currentIdentifier = (xUI.uiMode == 'production')? Xps.getIdentifier(xUI.referenceXPS):Xps.getIdentifier(xUI.XPS);
    var currentEntry = serviceAgent.currentRepository.entry(currentIdentifier);
    if(! currentEntry) break;
    var myContentsLine ='';
    var myContentsStage='';var stid=-1;
    var myContentsJob  ='';
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
                myContentsJob += decodeURIComponent(currentEntry.issues[ix][2])+"//"+currentEntry.issues[ix][3];
                myContentsJob += '</option>'
            }
            
        }
        document.getElementById('pMstageList').innerHTML=myContentsStage;
        document.getElementById('jobSelector').innerHTML=myContentsJob;
    break;
case	"productStatus":;
	document.getElementById('documentIdf').innerHTML  = decodeURIComponent(Xps.getIdentifier(xUI.XPS));

	document.getElementById('pmcui_line').innerHTML  = xUI.XPS.line.toString(true);
	document.getElementById('pmcui_stage').innerHTML = xUI.XPS.stage.toString(true);
    document.getElementById('jobSelector').innerHTML =
        '<option value="'+Xps.getIdentifier(xUI.XPS)+'" selected >'+[xUI.XPS.job.toString(true),decodeURIComponent(xUI.XPS.currentStatus)].join('//') +'</option>';
//	document.getElementById('pmcui_status').innerHTML= xUI.XPS.currentStatus.toString();
	document.getElementById('headerInfoWritable').innerHTML= (xUI.viewOnly)?'[編集不可] ':' ';
    if (xUI.viewOnly){
	document.getElementById('pmcui_documentWritable').innerHTML= '[編集不可] ';
    $('#documentWritable').show();
    }else{
	document.getElementById('pmcui_documentWritable').innerHTML= ' ';
    $('#documentWritable').hide();
    }
	document.getElementById('headerInfoWritable').innerHTML += String(xUI.sessionRetrace);
	document.getElementById('pmcui_documentWritable').innerHTML += String(xUI.sessionRetrace);
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
		nas.Frm2FCT(xUI.Select[1],xUI.fct0[0],xUI.fct0[1],0,this.XPS.framerate);
	document.getElementById("fct1").value=
		nas.Frm2FCT(xUI.Select[1],xUI.fct1[0],xUI.fct1[1],0,this.XPS.framerate);
	break;
case	"lvl":	;
//レイヤの移動があったらボタンラベルを更新
//ボタンラベルと同時にブランクメソッドセレクタを更新
	//フォーカスのあるトラックの情報を取得
	if (xUI.Select[0] > 0 && xUI.Select[0] < xUI.XPS.xpsTracks.length){
		var label = xUI.XPS.xpsTracks[xUI.Select[0]]["id"];
		var bmtd  = xUI.XPS.xpsTracks[xUI.Select[0]]["blmtd"];
		var bpos  = xUI.XPS.xpsTracks[xUI.Select[0]]["blpos"];
stat=(xUI.XPS.xpsTracks[xUI.Select[0]]["option"].match(/still|timing|replacement/))?
		false:true;
	}else{
		var label = (xUI.Select[0]==0)? "台詞":"メモ";//
		var bmtd  = xUI.blmtd;
		var bpos  = xUI.blpos;
		stat = true;
	}
	document.getElementById("activeLvl").value=label;
	document.getElementById("activeLvl").disabled=stat;
	if(document.getElementById('tBtrackSelect').link){
		document.getElementById('tBtrackSelect').link.select(xUI.Select[0]);
		document.getElementById('tBtrackSelect').onchange();
	}
	//現在タイムリマップトラック以外はdisable  将来的には各トラックごとの処理あり
	document.getElementById("blmtd").value = bmtd;
	document.getElementById("blpos").value = bpos;
	document.getElementById("blmtd").disabled = stat;
	document.getElementById("blpos").disabled = stat;
	if(! document.getElementById("blpos").disabled) chkPostat();
	break;
case	"spinS": ;//spin-select 動作連動切り替え
	document.getElementById("spinCk").checked       = xUI.spinSelect;
    document.getElementById('spinSlider').innerText = (xUI.spinSelect)? '連動' : '';
	break;
case	"ipMode": ;// 入力フィルタ表示
	document.getElementById("iptChange").value     = xUI.ipMode;
	$("#iptChange").css('background-color',["#eee","#ddd","#ccc"][xUI.ipMode]);
    document.getElementById('iptSlider').innerText = ['','動画','原画'][xUI.ipMode];
    $('#iptSlider').css('left',["1px","22px","44px"][xUI.ipMode]);
	break;
case	"title":
// title style 00:01:10:11

    var titleStyle=0;
	if(useworkTitle && workTitle[XPS["title"]]){
        if(workTitle[XPS["title"]].linkURL){
	        var linkURL=workTitle[XPS["title"]].linkURL;
	        var titleText=(workTitle[XPS["title"]].titleText)?workTitle[XPS["title"]].titleText:workTitle[XPS["title"]].linkURL;
	        titleStyle += 1;
        };
        if(workTitle[XPS["title"]].imgSrc){
	        var imgSrc=workTitle[XPS["title"]].imgSrc;
	        var ALTText=(workTitle[XPS["title"]].ALTtext)?
	        workTitle[XPS["title"]].ALTtext:workTitle[XPS["title"]].imgSrc;
	        titleStyle += 10;
        };

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
	var titleString=(xUI.XPS["title"])? xUI.XPS["title"] : "";
};

	}else{
	    var titleString=(xUI.XPS["title"])? xUI.XPS["title"] : "";
	}
	if(document.getElementById("title")) document.getElementById("title").innerHTML=titleString;
    if(xUI.viewMode != "Compact"){
	    for (pg=1;pg<=Math.ceil(xUI.XPS.duration()/xUI.PageLength);pg++){
    		if(document.getElementById(prop+pg))
    		 document.getElementById(prop+pg).innerHTML = titleString + ((xUI.XPS.subtitle)?("*/*"+xUI.XPS.subtitle):"");
        }
	}
    document.getElementById("XpsIdentifier").innerHTML=decodeURIComponent(Xps.getIdentifier(xUI.XPS,'cut'));

	break;
case	"opus":	;
case	"subtitle":	;
	if(document.getElementById(prop)) document.getElementById(prop).innerHTML=(XPS[prop])? XPS[prop] : "";
	sync("title");
	break;
case	"create_time":	;
case	"update_time":	;//?これは要らない
	document.getElementById(prop).innerHTML=
	(xUI.XPS[prop])? xUI.XPS[prop] : "<br />";
if(xUI.viewMode != "Compact"){
	for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
		document.getElementById(prop+pg).innerHTML=(xUI.XPS[prop])? xUI.XPS[prop] : "<br />";
}
	}
	break;
case	"update_user":	;
	document.getElementById(prop).innerHTML=
	(XPS[prop])? (XPS[prop].toString()).split(':')[0] : "<br />";
	if(xUI.viewMode != "Compact"){
		for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
			if(document.getElementById(prop+pg))
			document.getElementById(prop+pg).innerHTML=(XPS[prop])? (XPS[prop].toString()).split(':')[0] : "<br />";
		};
	};
case	"create_user":	;
case    "current_user": ;
    document.getElementById("current_user_id").value=xUI.currentUser.email;
	break;
case	"scene":	;
case	"cut":	;
	var scn= xUI.XPS["scene"]	; 
	var cut= xUI.XPS["cut"]	;
	
	var myValue=(xUI.XPS["scene"] || xUI.XPS["cut"])?  "s" + scn + "-c" + cut :"<br />";
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
	stat=(xUI.activeDocument.undoBuffer.undoPt==0)? true:false ;
	$("#ibMundo").attr("disabled",stat);
}
	break;
case	"redo":	;
{
//redoバッファの状態を見てボタンラベルを更新
	stat=((xUI.activeDocument.undoBuffer.undoPt+1)>=xUI.activeDocument.undoBuffer.undoStack.length)? true:false ;
	$("#ibMredo").attr("disabled",stat);
}
	break;
case	"time":	;//時間取得
	var timestr=nas.Frm2FCT(XPS.time(),3,0,XPS.framerate);
	document.getElementById(prop).innerHTML=timestr;
if(xUI.viewMode !="Compact"){
	for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
		document.getElementById(prop+pg).innerHTML=(timestr)? timestr : "<br />";
}
	}
	break;
case	"trin":	;
case	"trout":	;
//	var timestr =nas.Frm2FCT(nas.FCT2Frm(xUI.XPS[prop].time),3,0);//([0],3,0,XPS.framerate);
//	var transit=XPS[prop][1];
	document.getElementById(prop).innerHTML=
	(XPS[prop]==0)? "-" : xUI.XPS[prop].toString();
	var myTransit="";
	if(XPS.trin>0){
		myTransit+="△ "+xUI.XPS.trin.toString();//;
	}
	if((XPS.trin>0)&&(XPS.trout>0)){	myTransit+=' / ';}
	if(XPS.trout>0){
	myTransit+="▼ "+xUI.XPS.trout.toString();//;
	}
	document.getElementById("transit_data").innerHTML=myTransit;
	break;
case	"memo":
case	"noteText":
	var memoText=XPS.xpsTracks.noteText.toString().replace(/(\r)?\n/g,"<br>");
	if(document.getElementById("memo")) document.getElementById("memo").innerHTML = memoText;//screen画面表示
	if(document.getElementById("memo_prt")){
		document.getElementById("memo_prt").innerHTML = memoText;//printout表示
	};
	var memoImage = xUI.XPS.noteImages.getByLinkAddress('description:');
	if(memoImage){
		document.getElementById('memo_image').style.top = document.getElementById('memo').offsetTop+'px'
//		document.getElementById("memo_image").src = memoImage.img.src;
//		document.getElementById("memo_image_prt").src = memoImage.img.src;
	};
	break;
case	"tag":	;
case	"lbl":	;
//ラベルとタグはUNDOの対象となったのでxUI.resetSheetが処理する
//    xUI.resetSheet(); ここではNOP
    break;
case	"info_":	;//セット変更
    setTimeout(function(){sync('historySelector')},10);
	var syncset=
["opus","title","subtitle","time","trin","trout","scene","update_user","productStatus"];
//["opus","title","subtitle","time","trin","trout","scene","update_user","memo"];
	for(var n=0;n<syncset.length;n++){sync(syncset[n])};
	break;
case	"tool_":	;//セット変更
	var syncset=["fct","lvl","undo","redo","spinS","scale"];
	for(var n=0;n<syncset.length;n++){sync(syncset[n])};
	break;
case	"pref_":	;//セット変更	
	break;
case	"scene_":	;//セット変更
	break;
case	"about_":	;//セット変更
	for(var N=0;N<2;N++){
		if(document.getElementById("myVer"+N)){document.getElementById("myVer"+N).innerHTML= windowTitle};
		if(document.getElementById("myServer"+N)){
		    document.getElementById("myServer"+N).innerHTML=(xUI.onSite)? xUI.onSite:"[no server]";
		};
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
		var winTitle = decodeURIComponent(xUI.XPS.getIdentifier('simple'));// ウィンドウタイトル用のデータは
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
	if(xUI.canvasPaint.active) xUI.canvasPaint.syncCommand();
	}else{
//console.log('xUI は初期化前: yet init xUI');
	}
//
}
/**
 *  @params {String} entry
 *   シートセルの入力同期
 *  入力バッファとフォーカスされたシートセルの内容を同期させる
 */
function syncInput(entry){
	if((xUI.noSync)||(xUI.viewOnly)) return;
//カーソル入力同期
//表示更新
//入力バッファを更新
	if (document.getElementById("iNputbOx").value != entry){
		document.getElementById("iNputbOx").value = entry;
console.log('sync input entry')
	};
//タイムシートUI上の表示を更新
	var htmlEntry = xUI.trTd(entry);
	if (document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).innerHTML!= htmlEntry)
		document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).innerHTML=(entry=="")?"<br>":htmlEntry;
	var paintColor=(xUI.eXMode>=2)? xUI.inputModeColor.EXTENDeddt:xUI.inputModeColor.NORMALeddt;
	if (! xUI.edchg) paintColor=xUI.selectedColor;
	if (document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).style.backgroundColor!=paintColor)
		document.getElementById(xUI.Select[0]+"_"+xUI.Select[1]).style.backgroundColor=paintColor;
//    if(!(xUI.canvas)) document.getElementById('note_item').innerHTML = xUI.getTargetImageAddress();
//	if (document.getElementById("iNputbOx").disabled == false){
//	    document.getElementById("iNputbOx").focus();
//	    document.getElementById("iNputbOx").select();
//	};
/*
	if(xUI.noteFocus){
		nas.HTML.addClass(document.getElementById('memo'),'memoSpace-selected');
	}else{
		nas.HTML.removeClass(document.getElementById('memo'),'memoSpace-selected');
	};//*/
	if(
		(!(xUI.edchg))&&
		(!(xUI.canvasPaint.active))&&
		(!(documentFormat.active))
	){
		document.getElementById("iNputbOx").focus();//live
		document.getElementById("iNputbOx").select();//live
	};
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
		    var buttonValue = myWords[idx][idxw];
			if(idx == (myWords.length-1)){
                if(buttonValue.match( /\%/ )){
                    buttonValue = buttonValue.replace(/\%stage\%/g,xUI.XPS.stage.name);
                    buttonValue = buttonValue.replace(/\%user\%/g,xUI.currentUser.handle);
                    buttonValue = buttonValue.replace(/\%date\%/g,new Date().toLocaleDateString());
                }
//			    myResult+="<input type=button class='toolTip sig' value=\""+buttonValue+"\"><br>";
//			}else{
//			    myResult+="<input type=button class=toolTip value=\""+buttonValue+"\"><br>";
			};
			myResult+="<input type=button class=toolTip value=\""+buttonValue+"\"><br>";
		};
		myResult+="\n</td>";
	}
	myResult+="\n</table>";
	return myResult;
}
/**
 *  @params {Event} e
 *  @params {HTMLInputElement|HTMLTextareaElement} insertTarget
 *    テキストエリアに値を挿入する編集メソッド
 *    クリックの発生したエレメントの値 をinsertTargetのinsertメソッドに渡しフォーカスを移す
*/
editMemo=function(e,insertTarget){
	var myTarget=e.target;
	if(
		(myTarget instanceof HTMLInputElement)||
		(myTarget instanceof HTMLButtonElement)
	){
		var myValue=(myTarget.value)?myTarget.value:myTarget.innerHTML;
		if(myTarget.classList.contains('sig')){
			if(insertTarget.value.indexOf("sig.")<0){
				insertTarget.value = "sig. "+ myValue +"\n<hr>"+ insertTarget.value;
			}else{
				var isp = insertTarget.value.indexOf('\n');
				insertTarget.setSelectionRange(isp,isp);
				insertTarget.insert(myValue);
			};
		}else{
			insertTarget.insert(myValue);
		};
		insertTarget.focus();
	};
}
/**
	AEキー書き出し
	現状ではタイミングタイムラインだけが変換対象
*/
function writeAEKey(n){
if(! n){n=xUI.Select[0]; }
		document.getElementById("AEKrEsult").value=XPS2AEK(XPS,n-1);
		if(appHost.platform != "Safari"){document.getElementById("AEKrEsult").focus();}
		if((appHost.platform=="AIR")&&(air.Clipboard)){
//AIRだった場合はここでクリップボードへ転送
			writeClipBoard(XPS2AEK(XPS,n-1));
		}else{
//ブラウザの場合もコピーにトライ
            if(navigator.clipboard){
                navigator.clipboard.writeText(document.getElementById("AEKrEsult").value);
            }
            if(document.getElementById('opnAEKpnl').checked){
//リザルトエリアが表示されていない場合表示させる。
	            if (! $("#optionPanelAEK").is(':visible')){xUI.sWitchPanel("AEKey","show");}
			    document.getElementById("AEKrEsult").select();
			    if(document.execCommand) document.execCommand("copy");
			}
		}
	return document.getElementById("AEKrEsult").value;
}


//リスト展開プロシージャ
/**
    @params  {String}   ListStr
            ソース文字列
    @params  {Boolean}  rcl
            再帰呼出しフラグ
    @params  {Boolean}  normalize
            データのノーマライズフラグ default true
    @returns    {String}
            putメソッド入力引数ストリーム

	マクロ記法の文字列をputメソッドに引き渡し可能なストリームへ展開する
	リスト展開エンジンは汎用性を持たせたいので、無理やりグローバルに置いてある。
	要注意
	戻り値の形式は  "1,,2,,3,,4,,5"等のスピン展開後のカンマ区切りテキストストリーム
	スイッチを解釈してリスト展開時に文字の入れ替えフィルタリングを行う
	展開時のトラックを取得する必要あり
    リスト展開はxUIのメソッドに移行予定

リスト展開に際して、入力の正規化を行うオプションを追加（デフォルトでON
）
*/
	var expd_repFlag	= false	;
	var expd_skipValue	= 0	;//グローバルで宣言


function nas_expdList(ListStr,rcl,normalize){
console.log(ListStr);
	if(typeof normalize == 'undefined') normalize = true;
	if(normalize) ListStr = nas.normalizeStr(ListStr);
console.log(ListStr);
	if(typeof rcl=="undefined"){rcl=false}else{rcl=true}
	var leastCount=(xUI.Selection[1])? xUI.Selection[1]:XPS.duration()-xUI.Select[1];
	if(!rcl){
		expd_repFlag=false;
		expd_skipValue=xUI.spinValue-1;
	//再帰呼び出し以外はスピン値で初期化
	}
//(スキップ量はスピン-１)この値はグローバルの値を参照
	var SepChar="\.";

//カメラワークトラックの値を展開
//キーワードに'\(バックスラッシュ)が前置された場合 '<>'で囲まれた場合は 選択範囲のカメラワーク記述に展開する'
	if (
		((xUI.Select[0]<(xUI.XPS.xpsTracks.length-1))&&
		(xUI.XPS.xpsTracks[xUI.Select[0]].option=="camera"))
	){
console.log('camwork expand');
        if(ListStr.match(/^\\(.+)$|^\<(.+)\>$/)){
            ListStr = RegExp.$1;
            var myWork = new nas.AnimationCamerawork(null,ListStr);
console.log(myWork)
            var minimumLength = myWork.getStream(1).length;
            var sectionLength= (xUI.Selection[1])? (xUI.Selection[1]+1):minimumLength * xUI.spinValue;
            if(sectionLength < minimumLength) sectionLength = minimumLength;
            ListStr= myWork.getStream(sectionLength).join(',');
            return ListStr;
        }
	}
//	台詞トラックの場合、カギ括弧・引用符の中をすべてセパレートして戻す
//  ダイアログトラックは固定ではなくなったので判定を変更
//  コメントトラックを排除する必要あり	
//この判定をxUIに依存すると汎用性がなくなるので、コール側で引数渡しに変更する必要あり？
	if (
		((xUI.Select[0]<(xUI.XPS.xpsTracks.length-1))&&
		(xUI.XPS.xpsTracks[xUI.Select[0]].option=="dialog"))
	){
        if(ListStr.match(/[\"\'「]/)){
            console.log(ListStr);
            var mySound = new nas.AnimationDialog(null,ListStr);
//            mySound.parseContent();//パーサの起動は不要
            console.log(mySound)
            var sectionLength= xUI.spinValue * (mySound.bodyText.length + mySound.comments.length);
            ListStr= mySound.getStream(sectionLength).join(',');
            return ListStr;
        }
/*
    201801変更
    ダイアログの展開をオブジェクトメソッドに移行
    引数がシナリオ形式であること  ListStr.indexOf("「")>0
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
//ダイアログトラック以外はカギカッコ開くまたは引用符で開始される引数は、先頭文字を払ってコマ単位で縦に展開して戻す
if(ListStr.match(/^[\'\"「](.+)/)){    return (RegExp.$1).replace(/./g,"$&,"); };
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

//フィルタリングスイッチがあれば強制的にノーマライズ
//    if(xUI.ipMode > 0) ListStr = nas.normalizeStr(ListStr);
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
			if (sDepth==0){
			    EndCt=ct2;
//	最初の括弧が閉じたので括弧の繰り返し分を取得/ループ
			    var rT=RegExp.$2*1;
			    if(rT<1) rT = 1;
			    if(RegExp.$2=="") expd_repFlag = true;
			    var ct3=0;//関数スコープにするために宣言する
			    for(ct3=1;ct3<=rT;ct3++){
			        if((StartCt+1)!=EndCt){
//alert("DPS= "+sDepth+" :start= "+StartCt+"  ;end= "+EndCt +"\n"+ srcList.slice(StartCt+1,EndCt).join(SepChar)+"\n\n-- "+rT);
                        var rca = nas_expdList(
                                srcList.slice(StartCt+1,EndCt).join(SepChar),
                                "Rcall"
                        );
                        expdList = expdList.concat(rca.split(','));
//括弧の中身を自分自身に渡して展開させる
//展開配列が規定処理範囲を超過していたら処理終了
console.log(expdList.length)
	                    if(expdList.length >= leastCount) return expdList.join(",");
                    }
			    }
			    ct=EndCt;break;
			}//if block end
		}//ct2 loop end
		if(rT==0){expdList.push(srcList[ct]);s_kip();}//ct++;
	}else{
//	トークンが展開可能なら展開して生成データに積む
		if (tcn.match(/^([1-9]{1}[0-9]*)\-([1-9]{1}[0-9]*)$/)){
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
		return expdList.join(",");//文字列で戻す
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
	if(appHost.platform != 'ESTK'){
		if(true){xUI.setStored("current");sync();};//書き出すのでフラグリセット(ブラウザのみ)
		_w=window.open ("","xpsFile","width=480,height=360,scrollbars=yes,menubar=yes");

		_w.document.open("text/plain");
		_w.document.write("<html><body><pre>");
		_w.document.write(obj.toString());
		_w.document.write("</pre></body></html>");
		_w.document.close();
		_w.window.focus();//書き直したらフォーカス入れておく

		return false;//リンクのアクションを抑制するためにfalseを返す
	}else{
		return obj.toString();
	};
}

/**
	XPSデータを印刷および閲覧用htmlに変換
    @params {String} mode
    動作モード
        true時はhtmlをそのまま文字列でリザルトするがfalseの際は別ウィンドウを開いて書き出す

    "body-only" : <body>タグ内のHTML本体のみを返す<不使用・削除>
    "png"       : dom-to-image でレンダリングして保存(用紙アジャストあり)
    "print"     : プリントアウトダイアログを呼び出す(用紙アジャストあり)

    @params {String} form
    出力形式 前加工
        "action" : アクションシート相当の加工を施す
    @params {Number} page    単ページ指定 falseで全ページを出力する all|sigle page

印刷と閲覧HTMLに用途を限定する?
画像保存を別に設定したほうが良い?
レンダリングをシングルページに限定する機能を加えるほうが良いか？

インラインフレームを利用するように変更
2022.09.12

インラインフレーム方式を中止
モード変更とスケーリングを加えてベース画面をそのまま利用
2024 04 11
*/
function printHTML(mode,form,page){
//alert(['printout or image export .' ,mode ,form ,page].join(":"));
    if(! form) form = '';
//以下のブロックは印字用のiFrameを使用しないバージョン　2024.04 ブロックを解除
if(true){
    var undoData  = null ;
    var viewMode  = String(xUI.viewMode);//表示モードをバックアップ
// プリント及び画像保存は、必ずページモードで行われる
// viewModeがPageImage以外であった場合は一時的にPageImageに設定する
// iframeを使用せず本体HTMLを利用
console.log('set page mode PageImage for print | export');
    if(xUI.viewMode != 'PageImage') xUI.viewMode = 'PageImage';
    if(form == 'action') undoData = buildActionSheet();
    xUI.showPage(page);

    switch(mode){
    case "print":
        adjustSheetA3(true,0);
        window.onafterprint   = ()=>{
//アクション処理の際はバックアップを復帰
            if(undoData){
             xUI.resetSheet(...undoData);//[backupXps,backupRef];
            }
            if(viewMode != xUI.viewMode) xUI.viewMode = viewMode;//復帰
            adjustSheetA3(false);
//            xUI.resetSheet();
        };
        xUI.resetSheet(undefined,undefined,function(){print()});
    break;
    case "png"  :
//        xUI.resetSheet(undefined,undefined,function(){
            adjustSheetA3(true,80);//80ピクセルオフセット
            sheetSaveAsPng(0,()=>{
//アクション処理の際はバックアップを復帰
                if(undoData) xUI.resetSheet(...undoData);//[backupXps,backupRef];
//viewMode復帰
                if(viewMode != xUI.viewMode){
console.log('reset page mode '+ viewMode);
                    xUI.viewMode = viewMode;//復帰
                    xUI.resetSheet();//復帰
                };
                adjustSheetA3(false);
            })
//        });
    break;
    };
//アクション処理の際はバックアップを復帰・本体はUNDOバッファで戻す
//    if(undoData) xUI.resetSheet(...undoData);//backupXps,backupRef);  
    return false;//リンクのアクションを抑制するためにfalseを返す
}else{
// */
/* 以下はiframeを利用する処理
    出力をページ画像モードに対応
*/
var myBody="";
//body-only時省略分
    if(mode!='body-only'){
    myBody += '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja">';
    myBody += '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>';
    myBody += XPS.scene.toString()+XPS.cut.toString();
    myBody+='</title>';
    if((xUI.onSite)&&(window.location.href.indexOf(serviceAgent.currentRepository.url)>=0)){
//on site
        var myAddress = document.location.origin + '/remaping/';
        var libOffset = myAddress +'/remaping/';
    }else{
//off site
        var myAddress = window.location.href;
        if (myAddress.match(/(.+\/)(\S+\.html?$)/i)) myAddress = RegExp.$1;
        var libOffset = './';
    };
    myBody+='<link REL=stylesheet TYPE="text/css" HREF="'+myAddress+'template/remaping_.css"    media="screen,tv">';
    myBody+='<link REL=stylesheet TYPE="text/css" HREF="'+myAddress+'template/remaping_prt.css" media="print">';
/* ライブラリロード */
  var lib = [
    'lib/jquery.js',
    'lib/jquery-ui.js',
    'lib/jquery.longpress.js',
    'lib/ecl/ecl.js',
    'lib/csv/csvsimple.js',
    'nas/ext-lib/dom-to-image.min.js',
    'nas/ext-lib/fabric.js/dist/fabric.min.js',
    'nas/ext-lib/crc32.js',
    'nas/ext-lib/png-metadata.js',
    'config.js',
    'nas/lib/nas_common.js',
    'nas/lib/nas_common_HTML.js',
    'nas/newValueConstractors.js',
    'nas/pmio.js',
    'nas/configPM.js',
    'nas/lib/mapio.js',
    'nas/lib/xpsio.js',
    'nas/scripts/remaping/airUI.js',
    'nas/lib/cameraworkDescriptionDB.js',
    'nas/scripts/remaping/remaping.js',
    'nas/scripts/remaping/documentFormat.js',
    'nas/scripts/remaping/canvasaddon.js',
    'nas/scripts/remaping/utils.js',
//言語リソース
    'nas/lib/nas_locale.js',
    'nas/lib/messages.js',
    'nas/scripts/remaping/messages.js'
  ];
    lib.forEach(function(e){ myBody+='<script src="'+libOffset+e+'"></script>'});
//myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="./template/printout.css">';

//myBody+='<style type="text/css"> * { margin: 0; padding: 0;} #fixed {position: fixed;} #sheet_view {  margin:0; }</style></head>';//

/*
myBody+='<script src="'+libOffset+'lib/jquery.js"></script>';
myBody+='<script src="'+libOffset+'lib/jquery-ui.js"></script>';
myBody+='<script src="'+libOffset+'lib/jquery.longpress.js"></script>';
myBody+='<script src="'+libOffset+'lib/ecl/ecl.js"></script>';
myBody+='<script src="'+libOffset+'lib/csv/csvsimple.js"></script>';
myBody+='<script src="'+libOffset+'nas/ext-lib/html2canvas.min.js"></script>';
myBody+='<script src="'+libOffset+'nas/ext-lib/fabric.js/dist/fabric.min.js"></script>';
myBody+='<script src="'+libOffset+'nas/ext-lib/crc32.js"></script>';
myBody+='<script src="'+libOffset+'nas/ext-lib/png-metadata.js"></script>';

myBody+='<script src="'+libOffset+'config.js"></script>';
myBody+='<script src="'+libOffset+'nas/lib/nas_common.js"></script>';
myBody+='<script src="'+libOffset+'nas/lib/nas_common_HTML.js"></script>';
myBody+='<script src="'+libOffset+'nas/newValueConstractors.js"></script>';
myBody+='<script src="'+libOffset+'nas/pmio.js"></script>';
myBody+='<script src="'+libOffset+'nas/configPM.js"></script>';
myBody+='<script src="'+libOffset+'nas/lib/mapio.js"></script>';
myBody+='<script src="'+libOffset+'nas/lib/xpsio.js"></script>';
myBody+='<script src="'+libOffset+'nas/scripts/remaping/airUI.js"></script>';
myBody+='<script src="'+libOffset+'nas/lib/cameraworkDescriptionDB.js"></script>';
myBody+='<script src="'+libOffset+'nas/scripts/remaping/remaping.js"></script>';
myBody+='<script src="'+libOffset+'nas/scripts/remaping/documentFormat.js"></script>';
myBody+='<script src="'+libOffset+'nas/scripts/remaping/canvasaddon.js"></script>';
myBody+='<script src="'+libOffset+'nas/scripts/remaping/utils.js"></script>';
//言語リソース
myBody+='<script src='+libOffset+'nas/lib/nas_locale.js></script>';
myBody+='<script src='+libOffset+'nas/lib/messages.js></script>';
myBody+='<script src='+libOffset+'nas/scripts/remaping/messages.js></script>';

//myBody+='</title><link REL=stylesheet TYPE="text/css" HREF="./template/printout.css">';

//myBody+='<style type="text/css"> * { margin: 0; padding: 0;} #fixed {position: fixed;} #sheet_view {  margin:0; }</style></head>';//

// */
myBody+='<body ';//"
var startup = '() => nas_Prt_Startup(\''+mode+'\',\''+form+'\',\''+page+'\')';
myBody+= 'onload="console.log(9998988887);var nRS = setTimeout('+startup+',10);" ';//
myBody+='" >';//
    };//ここまでbody-only時は省力
//UNDOシステム外で原画トラック情報を削除
    var mainXps = new Xps();
    mainXps.parseXps(xUI.XPS.toString(false));
myBody+='<textarea id="startupContent" >';
myBody+= mainXps.toString();
myBody+='</textarea>';
myBody+='<textarea id="startupReference">';
myBody+= xUI.referenceXPS.toString();
myBody+='</textarea>';
myBody+='<div class=hideParams><input id=prefPageCols type=hidden value='+xUI.PageCols+'></input><input id=prefPageCols type=hidden value='+xUI.PageCols+'></input><input id=prefSheetLength type=hidden value='+xUI.SheetLength+'></input></div>'
myBody+='<div id="sheet_body">';//
    var pgStart = 1;
    var pgEnd   = Math.ceil(XPS.duration()/xUI.PageLength);
	for (var pg = pgStart ;pg <= pgEnd ;pg++){
	    myBody+= '<div class=printPage id=printPg'+String(pg)+'>';
	    myBody+= '<div class=headerArea id=pg'+String(pg)+'Header>';
		myBody+= xUI.headerView(pg);
		myBody+= '<span class=pgNm>( p '+nas.Zf(pg,3)+' )</span><br></div>';
		myBody+= xUI.pageView(pg);
	    myBody+= '</div>'
	};
    myBody+='</div>';
    if(mode != 'body-only') myBody+='</body></html>';

    if((mode == 'body-only')||(mode == false)) return myBody;
    if(mode == 'dbg'){
console.log(myBody);
        var pgview = window.open('','_blank');
        pgview.window.document.write(myBody);
    }else{
// mode png|print // iframeを作成してソースを流し込む
	    var pgview = document.getElementById('printFrame');
	    if(!pgview){
		    pgview = document.createElement('iframe');
		    pgview.id     = 'printFrame'; 
	    	pgview.width  = 1120;// A3 width  1120px
		    pgview.height = 1584;// A3 height 1584px
	    }
	    pgview.srcdoc = myBody;
	    document.body.appendChild(pgview);
        switch(mode){
	    case "print":
            pgview.contentWindow.onbeforeunload = ()=> document.body.removeChild(pgview);
            pgview.contentWindow.onafterprint   = ()=> document.body.removeChild(pgview);
	    break;
	    case "png": 
    	break;
        };
    };
	return false;//リンクのアクションを抑制するためにfalseを返す
}}
/*
	File API を使用したデータの読み込み（ブラウザでローカルファイルを読む）
	File API  は、Chrome Firefoxではローカルファイルの読み出し可能だが、
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
        document.getElementById("myCurrentFile").addEventListener('change', function(e){
            xUI.importBox.read(this.files,processImport)},
            true
        );//myCrrentFile.addEvent
    }
});//window.addEvent

/*
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


xUIの状況を確認して必要に従ってimportDocumentを呼ぶ  
 */
/**
 *  @paramas    {boolean}   autoBuffer
 *      ドロップされたファイルの内容をインポート
 *      ドロップアイテムが画像の場合はデータを読み込んでurlに展開して使用
 */
var processImport = function(autoBuffer){
    
    if(typeof autoBuffer == 'undefined') autoBuffer = true;
  if(autoBuffer){
//        コンバート済みデータが格納されている配列はxUI.importBox.selectedContents
    if(xUI.importBox.selectedContents.length > 1){
        for(var dix=0;dix<xUI.importBox.selectedContents.length;dix++){
            console.log(xUI.importBox.selectedContents[dix].getIdentifier());
            console.log(xUI.importBox.selectedContents[dix].toString());
        }
    }else{
        if((document.getElementById('loadTarget').value != 'ref')&&(xUI.uiMode == 'production')&&(xUI.sessionRetrace == 0)){
//インポート時 undoが必要なケースでは xUI.putに渡す
            xUI.put(xUI.importBox.selectedContents[0]);
        }else{
//undoリセットが望ましい場合はxUI.resetSheetに渡してリセットする
            if(document.getElementById('loadTarget')=='ref'){
console.log('ref')
                xUI.resetSheet(false,xUI.importBox.selectedContents[0]);
            }else{
console.log('body');
                xUI.resetSheet(xUI.importBox.selectedContents[0]);
            }
        }
    }
  }else{
     var loading=false;
    if(document.getElementById('loadTarget')!='ref'){
console.log('>>body')
        if(xUI.uiMode == 'production'){
            var tempDocument = new Xps();
            tempDocument.readIN=xUI._readIN;
            tempDocument.readIN(xUI.data_well.value);
            if(tempDocument){
                if( (xUI.XPS.xpsTracks.duration != tempDocument.xpsTracks.duration)||
                    (xUI.XPS.xpsTracks.length != tempDocument.xpsTracks.length)
                ) xUI.reInitBody(tempDocument.xpsTracks.length,tempDocument.xpsTracks.duration);
                xUI.selection();xUI.selectCell([0,0]);
                xUI.put(tempDocument.getRange());
                return ;
            }
        }else{
            loading=xUI.XPS.readIN(xUI.data_well.value);
        }
    }else{
console.log('>>ref')
        loading=xUI.referenceXPS.readIN(xUI.data_well.value);
    }
    if(loading){
        xUI.resetSheet();
    }else{
        return false;
    }
  }
      if(xUI.uiMode=='browsing') {xUI.setUImode('floating')};
}
/*
	テンプレートを利用したeps出力
テンプレートは、サーバ側で管理したほうが良いのだけど  一考

*/
/*
	XPSから出力に必要な本体データを切り出し、1ページづつepsエンコードして返す

	引数は整数  ページナンバー 1から開始
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
	引数はページナンバー  1から開始
	引数が0  又は無ければ全ページを返す
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
"camColumns"	現在固定  ただしカメラワーク指定可能になり次第xUIから転記

Columns	XPSの値から計算
	各フォーマットごとに規定数あり
	規定数以下なら規定数を確保（読みやすいので）
	規定数をオーバーした際は段組変更を警告
	A3 2段組  規定 6/3 最大8/4
	A3 1段組  規定10/5 最大18/9

トランジションの尺と注釈を転記してない！
MemoTextの前に挿入する  

この部分は epser としてソース分離すべき
eapエクスポータ自体が不要コード 202401
*/
var pushEps= function (myTemplate){
//テンプレート取得後に呼び出される。
 myTemplate=decodeURI(myTemplate);
/*====================置換え用データ生成
置き換えのためのキャリアオブジェクトを作成してevalを避ける  13/06/22
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
	geometry:"GeometryCellWidth",
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

	if(XPS.trin>0){
		sWap.transitionText+="△ "+XPS.trin.toString();//[1]+'\('+nas.Frm2FCT(XPS.trin[0],3,0,XPS.framerate)+')';
	};
	if((XPS.trin>0)&&(XPS.trout>0)){	sWap.transitionText+=' / ';};
	if(XPS.trout>0){
		sWap.transitionText+="▼ "+XPS.trout.toString();//[1]+'\('+nas.Frm2FCT(XPS.trout[0],3,0,XPS.framerate)+')';
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
	//SJIS化もできていないのでOUT callEchoEpsに準じた処理が必要  CEP CSXも同様の処理が必要
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
//現在EPSエクスポートは不使用　呼び出さることはない 2024 01
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

//xUI.initFloatingPanel();
console.log('skip floating panel group')
            if(false) {
//htmlUIなのでここじゃないんだけどパネル関連ということで暫定的にこちら
/*
	jQueryでフローティングウインドウを初期化
	イベントリスナ設定
	初期位置はcss上で設定するのでこちらではない
	

*/


/*
optionPanelStamp
*/
jQuery(function(){
    jQuery("#optionPanelStamp a.close").click(function(){
        jQuery("#optionPanelStamp").hide();
        return false;
    });
    jQuery("#optionPanelStamp a.minimize").click(function(){
        if(jQuery("#optionPanelStamp").height()>100){
           jQuery("#formStamp").hide();
           document.getElementById("optionPanelStamp").style.hight='24px';
	}else{
           jQuery("#formStamp").show();
           document.getElementById("optionPanelStamp").style.hight='';
	};
        return false;
    });
    jQuery("#optionPanelStamp dl dt").mousedown(function(e){
        jQuery("#optionPanelStamp")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelStamp").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelStamp").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelStamp").css({
                top:e.pageY  - jQuery("#optionPanelStamp").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelStamp").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            });
        });
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    });
});
/*
OptionPanelText
*/
jQuery(function(){
    jQuery("#optionPanelText a.close").click(function(){
        jQuery("#optionPanelText").hide();
        return false;
    });
    jQuery("#optionPanelText a.minimize").click(function(){
        if(jQuery("#optionPanelText").height()>100){
           jQuery("#formText").hide();
           document.getElementById("optionPanelText").style.hight='24px';
	}else{
           jQuery("#formText").show();
           document.getElementById("optionPanelText").style.hight='';
	};
        return false;
    });
    jQuery("#optionPanelText dl dt").mousedown(function(e){
        jQuery("#optionPanelText")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelText").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelText").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelText").css({
                top:e.pageY  - jQuery("#optionPanelText").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelText").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            });
        });
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    });
});
/*
optionPanelSign
*/
jQuery(function(){
    jQuery("#optionPanelSign a.close").click(function(){
        jQuery("#optionPanelSign").hide();
        return false;
    });
    jQuery("#optionPanelSign a.minimize").click(function(){
        if(jQuery("#optionPanelSign").height()>100){
           jQuery("#formSign").hide();
           jQuery("#optionPanelSign").height(24);
	}else{
           jQuery("#formSign").show();
           jQuery("#optionPanelSign").height(165);
	};
        return false;
    });
    jQuery("#optionPanelSign dl dt").mousedown(function(e){
        jQuery("#optionPanelSign")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelSign").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelSign").offset().top );
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();

            jQuery("#optionPanelSign").css({
                top:e.pageY  - jQuery("#optionPanelSign").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelSign").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            });
        });
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    });
});
/*
OptionPanelTbx
*/
jQuery(function(){
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
           jQuery("#optionPanelTbx").height(210);
	}
        return false;
    })
    jQuery("#optionPanelTbx dl dt").mousedown(function(e){
        jQuery("#optionPanelTbx")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelTbx").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelTbx").offset().top );
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();

            jQuery("#optionPanelTbx").css({
                top:e.pageY  - jQuery("#optionPanelTbx").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelTbx").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
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
           jQuery("#optionPanelSnd").height(248);
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
                top:e.pageY  - jQuery("#optionPanelSnd").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelSnd").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
/*
OptionPanelCam
*/
jQuery(function(){
    jQuery("#optionPanelCam a.close").click(function(){
        jQuery("#optionPanelCam").hide();
        return false;
    })
    jQuery("#optionPanelCam a.minimize").click(function(){
        if(jQuery("#optionPanelCam").height()>100){
           jQuery("#formCam").hide();
           jQuery("#optionPanelCam").height(24);
	}else{
           jQuery("#formCam").show();
           jQuery("#optionPanelCam").height(165);
	}
        return false;
    })
    jQuery("#optionPanelCam dl dt").mousedown(function(e){
        jQuery("#optionPanelCam")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelCam").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelCam").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelCam").css({
                top:e.pageY  - jQuery("#optionPanelCam").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelCam").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
/*
OptionPanelStg
*/
jQuery(function(){
//close
    jQuery("#optionPanelStg a.close").click(function(){
        jQuery("#optionPanelStg").hide();
        return false;
    })
//minimaize/maxinaiz
    jQuery("#optionPanelStg a.minimize").click(function(){
        if(jQuery("#optionPanelStg").height()>100){
           jQuery("#formStg").hide();
           jQuery("#optionPanelStg").height(24);
	}else{
           jQuery("#formStg").show();
           jQuery("#optionPanelStg").height(165);
	}
        return false;
    })
//move
    jQuery("#optionPanelStg dl dt").mousedown(function(e){
        jQuery("#optionPanelStg")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelStg").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelStg").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelStg").css({
                top:e.pageY  - jQuery("#optionPanelStg").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelStg").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
//resize
    jQuery("#StgPanelCorner").mousedown(function(e){
        jQuery("#StgPanelCorner")
            .data("cornerPointX" , e.pageX - jQuery("#StgPanelCorner").offset().left)
            .data("cornerPointY" , e.pageY - jQuery("#StgPanelCorner").offset().top );
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
 console.log({
                 width: e.pageX - jQuery("#StgPanelCorner").data("cornerPointX")+16+myOffset.left - xUI.screenShift[1]-jQuery("#optionPanelStg").offset().left,
                height:e.pageY - jQuery("#StgPanelCorner").data("cornerPointY")+16+myOffset.top  - xUI.screenShift[0]-jQuery("#optionPanelStg").offset().top   

 });
           jQuery("#optionPanelStg").css({
                width: e.pageX - jQuery("#StgPanelCorner").data("cornerPointX")+16+myOffset.left - xUI.screenShift[1]-jQuery("#optionPanelStg").offset().left,
                height:e.pageY - jQuery("#StgPanelCorner").data("cornerPointY")+16+myOffset.top  - xUI.screenShift[0]-jQuery("#optionPanelStg").offset().top   
            }) 
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })});
/*
OptionPanelSfx
*/
jQuery(function(){
    jQuery("#optionPanelSfx a.close").click(function(){
        jQuery("#optionPanelSfx").hide();
        return false;
    })
    jQuery("#optionPanelSfx a.minimize").click(function(){
        if(jQuery("#optionPanelSfx").height()>100){
           jQuery("#formSfx").hide();
           jQuery("#optionPanelSfx").height(24);
	}else{
           jQuery("#formSfx").show();
           jQuery("#optionPanelSfx").height(165);
	}
        return false;
    })
    jQuery("#optionPanelSfx dl dt").mousedown(function(e){
        jQuery("#optionPanelSfx")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelSfx").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelSfx").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelSfx").css({
                top:e.pageY  - jQuery("#optionPanelSfx").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelSfx").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
/*
	optionPanelRef floating Panel
	任意画像参照用パネル
*/
jQuery(function(){
    jQuery("#optionPanelRef a.close").click(function(){
        jQuery("#optionPanelRef").hide();
        return false;
    })
    jQuery("#optionPanelRef a.minimize").click(function(){
        if(jQuery("#optionPanelRef").height()>60){
           jQuery("#referenceImageBox").hide();
           jQuery("#optionPanelRef").height(52);
    }else{
           jQuery("#referenceImageBox").show();
           jQuery("#optionPanelRef").height(360);
    }
        return false;
    })
    jQuery("#optionPanelRef dl dt").mousedown(function(e){
        jQuery("#optionPanelRef")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelRef").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelRef").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelRef").css({
                top:e.pageY  - jQuery("#optionPanelRef").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelRef").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
// ====ReferenceImageBox//


//optionPanelPaint floating Panel

jQuery(function(){
    jQuery("#optionPanelPaint a.close").click(function(){
        xUI.canvasPaint.active = false;
        jQuery("#optionPanelPaint").hide();
        return false;
    })
    jQuery("#optionPanelPaint a.minimize").click(function(){
        if(jQuery("#optionPanelPaint").height()>100){
           jQuery("#formPaint").hide();
           jQuery("#optionPanelPaint").height(24);
    }else{
           jQuery("#formPaint").show();
           jQuery("#optionPanelPaint").height(400);
    }
        return false;
    })
    jQuery("#optionPanelPaint dl dt").mousedown(function(e){
        jQuery("#optionPanelPaint")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelPaint").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelPaint").offset().top);
        nas.HTML.mousedragscrollable.movecancel = true;
        jQuery(document).mousemove(function(e){
            e.preventDefault();e.stopPropagation();
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelPaint").css({
                top:e.pageY  - jQuery("#optionPanelPaint").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelPaint").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        nas.HTML.mousedragscrollable.movecancel = (xUI.canvasPaint.currentTool == 'hand')? false:true;
        jQuery(document).unbind("mousemove")
    })
});
// ====Paint//
/*
OptionPanelDraw
*/
jQuery(function(){
    jQuery("#optionPanelDraw a.close").click(function(){
        jQuery("#optionPanelDraw").hide();
        return false;
    })
    jQuery("#optionPanelDraw a.minimize").click(function(){
        if(jQuery("#optionPanelDraw").height()>100){
           jQuery("#formDraw").hide();
           jQuery("#optionPanelDraw").height(24);
	}else{
           jQuery("#formDraw").show();
           jQuery("#optionPanelDraw").height(165);
	}
        return false;
    })
    jQuery("#optionPanelDraw dl dt").mousedown(function(e){
        jQuery("#optionPanelDraw")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelDraw").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelDraw").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelDraw").css({
                top:e.pageY  - jQuery("#optionPanelDraw").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelDraw").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
// 書式編集パネル
jQuery(function(){
    jQuery("#optionPanelDocFormat a.close").click(function(){
        xUI.sWitchPanel('DocFormat','close');
//        jQuery("#optionPanelDocFormat").hide();
        return false;
    })
//minimize/maximaize
    jQuery("#optionPanelDocFormat a.minimize").click(function(){
        if(jQuery("#optionPanelDocFormat").height()>54){
           jQuery("#formDocFormat").hide();
           jQuery("#optionPanelDocFormat").height(24);
	}else{
           jQuery("#formDocFormat").show();
           jQuery("#optionPanelDocFormat").height(184+24);
	}
        return false;
    })
//move
    jQuery("#optionPanelDocFormat dl dt").mousedown(function(e){
        jQuery("#optionPanelDocFormat")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelDocFormat").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelDocFormat").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelDocFormat").css({
                top:e.pageY  - jQuery("#optionPanelDocFormat").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelDocFormat").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
//resize(不要につき削除)
/*
    jQuery("#RefPanelCorner").mousedown(function(e){
        jQuery("#optionPanelDocFormat")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelDocFormat").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelDocFormat").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelDocFormat").css({
                top:e.pageY  - jQuery("#optionPanelDocFormat").data("clickPointY")+myOffset.top+"px",
                left:e.pageX - jQuery("#optionPanelDocFormat").data("clickPointX")+myOffset.left+"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    });// */
});


// ドキュメント画像調整ミニパネル
jQuery(function(){
    jQuery("#optionPanelImgAdjust a.close").click(function(){
        xUI.sWitchPanel('ImgAdjust','hide');
        return false;
    })
//minimize/maximaize
    jQuery("#optionPanelImgAdjust a.minimize").click(function(){
        if(jQuery("#optionPanelImgAdjust").height()>100){
           jQuery("#formImgAdjust").hide();
           jQuery("#optionPanelImgAdjust").height(24);
	}else{
           jQuery("#formImgAdjust").show();
           jQuery("#optionPanelImgAdjust").height(($('#imgAdjustDetail').isVisible())? 236:158);//236|158
	}
        return false;
    })
//move
    jQuery("#optionPanelImgAdjust dl dt").mousedown(function(e){
        jQuery("#optionPanelImgAdjust")
            .data("clickPointX" , e.pageX - jQuery("#optionPanelImgAdjust").offset().left)
            .data("clickPointY" , e.pageY - jQuery("#optionPanelImgAdjust").offset().top);
        jQuery(document).mousemove(function(e){
var myOffset=document.body.getBoundingClientRect();
            jQuery("#optionPanelImgAdjust").css({
                top:e.pageY  - jQuery("#optionPanelImgAdjust").data("clickPointY") + myOffset.top - xUI.screenShift[1] +"px",
                left:e.pageX - jQuery("#optionPanelImgAdjust").data("clickPointX") + myOffset.left- xUI.screenShift[0] +"px"
            })
        })
    }).mouseup(function(){
        jQuery(document).unbind("mousemove")
    })
});
        }//void xUI.initFloatingPanelsに移行
console.log('skiped floating panel group')
//パネル上のデータリストを初期化する
//    document.getElementById("sndCastList")
//    document.getElementById("soundProplist")
//    SoundEdit.PanelInit();
/*
// IE用コードとのこと  今回はもうIEは動作対象外なので勘弁
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
//グローバルのSheetBaseColorを廃してsheetLooksに統合（用紙サイズも含む）
	if (useCookie.SheetProp){
        var pageAttributes=[JSON.stringify(xUI.sheetLooks)];
	}else{
	    var pageAttributes=[false];
	}
myCookie[0]=pageAttributes;

//	[1] XPSAttrib
/*	myTitle		= (config.useCookie.XPSAttrib)?XPS.title:null;
	mySubTitle	= (config.useCookie.XPSAttrib)?XPS.subtitle:null;
	myOpus		= (config.useCookie.XPSAttrib)?XPS.opus:null;
	myFrameRate	= (config.useCookie.XPSAttrib)?XPS.framerate.toString():null;
	Sheet		= (config.useCookie.XPSAttrib)?nas.Frm2FCT(XPS.xpsTracks[0].length,3,0,XPS.framerate):null;//
    SoundColumns = (config.useCookie.XPSAttrib)?xUI.dialogCount:null;
	SheetLayers	= (config.useCookie.XPSAttrib)?xUI.timingCount:null;
    CameraworkColumns = (config.useCookie.XPSAttrib)?xUI.cameraCount:null;
    StageworkColumns = (config.useCookie.XPSAttrib)?xUI.stageworkCount:null;
    SfxColumns = (useCookie.XPSAttrib)?xUI.sfxCount:null;
// ======= */
	myTitle		= (useCookie.XPSAttrib)?XPS.title:null;
	mySubTitle	= (useCookie.XPSAttrib)?XPS.subtitle:null; 
	myOpus		= (useCookie.XPSAttrib)?XPS.opus:null;
	myFrameRate	= (useCookie.XPSAttrib)?XPS.framerate.toString():null;
	Sheet		= (useCookie.XPSAttrib)?nas.Frm2FCT(XPS.xpsTracks[0].length,3,0,XPS.framerate):null;//
    SoundColumns = (useCookie.XPSAttrib)?xUI.dialogCount:null;
	SheetLayers	= (useCookie.XPSAttrib)?xUI.timingCount:null;
    CameraworkColumns = (useCookie.XPSAttrib)?xUI.cameraCount:null;
    StageworkColumns = (useCookie.XPSAttrib)?xUI.stageworkCount:null;
    SfxColumns = (useCookie.XPSAttrib)?xUI.sfxCount:null;

myCookie[1]=[myTitle,mySubTitle,myOpus,myFrameRate,Sheet,SoundColumns,SheetLayers,CameraworkColumns,StageworkColumns,SfxColumns];

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
	InputMode	=(useCookie.UIOptions)?xUI.ipMode:null;
myCookie[6]=[SLoop,CLoop,AutoScroll,TabSpin,ViewMode,InputMode];

//	[7] UIView
if(useCookie.UIView){
	var toolView=[];
	var ix = 0
	for (var prp in xUI.panelTable){
		if(prp == '_exclusive_items_') continue;
		if(document.getElementById(xUI.panelTable[prp].elementId)){
			if(xUI.panelTable[prp].uiOrder <= 0){
				toolView.push(0);//オーダー外なので開かない(0を置く)
			}else{
				toolView.push(($('#'+xUI.panelTable[prp].elementId).isVisible())? 1:0);//表示状態を保存
			};
		}else{
			toolView.push(ToolView[ix]);//エレメント自体がないので旧来の値をコピー
		};
		ix++;
	};
//	var toolViewIbCs = xUI.ibCP.activePalette;//toolViewIbCs;
console.log(ToolView);
console.log(xUI.toolView);
console.log(toolView);
	toolView = Array.from(toolView,(e) => (e)?'1':'0');
};//記録チェックがない場合は元のデータを変更しない
myCookie[7]=toolView;
return myCookie;
}
// buildCk //
/*
    cookieを書き込む
    引数は配列
 */
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
/**
    クッキー文字列を配列に戻し、グローバル変数に展開する
    グローバル変数は、設定ファイルの値を持っているので関数の呼び出し後に必用な参照を行う
    関数内では、ケース毎特定の処理は行わない。
*/
function ldCk(ckStrings){
	if (!navigator.cookieEnabled){return false;}
	if(breakValue(document.cookie,"rEmaping")){
		var rEmaping = JSON.parse(breakValue(document.cookie,"rEmaping"));
	}else{
		return false;
	}
//	[0] SheetProps
//グローバルのSheetBaseColorを廃止してグローバルのSheetLooks置き換える
	if (useCookie.SheetProp){
	    if(rEmaping[0][0]){
            if(rEmaping[0][0].match(/^%7B/)){
	            SheetLooks       = JSON.parse(unescape(rEmaping[0][0]));
	            SheetBaseColor   = SheetLooks.SheetBaseColor;//転記
	        }else{
//旧クッキー処理
	            SheetBaseColor   = unescape(rEmaping[0][0]);
	            SheetLooks.SheetBaseColor = SheetBaseColor;//転記
	        };
	    };
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
    if(rEmaping[1][8]) StageworkColumns  = unescape(rEmaping[1][8]);
    if(rEmaping[1][9]) SfxColumns        = unescape(rEmaping[1][9]);
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
	if(rEmaping[6][5]) InputMode    = parseInt(rEmaping[6][5]);
	}
//	[7] UIView
	if(useCookie.UIView){
	if(rEmaping[7]) ToolView	=rEmaping[7];
	}
//console.log(rEmaping)
}
//	クッキー削除
function dlCk() {
	ckName = 'rEmaping'; document.cookie = ckName + '=;expires=Thu,01-Jan-70 00:00:01 GMT';
	useCookie=false;
	var reloadNow=confirm(localize(nas.uiMsg.dmCookieRemoved));
	if(reloadNow){document.location.reload()}
}
function resetCk()
{
	dlCk();
	writeCk();
	ldCk();
}
//
/*
    配列内の文字列をクッキー用にエスケープ文字列に変換
    入れ子配列は再帰処理
*/
function tosRcs(obj)
{
//console.log(obj);
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
/*
    各種設定表示更新
 */
function chgDuration(targetProp,prevalue,newvalue){
	if( newvalue != prevalue){
		var newTime= xUI.XPS.time();
		var newTrin  = new nas.ShotTransition(xUI.XPS.trin);
		var newTrout = new nas.ShotTransition(xUI.XPS.trout);
		var newHeadMargin = xUI.XPS.headMargin;
		var newTailMargin = xUI.XPS.tailMargin;
		switch(targetProp){
		case	"time":
			newTime = nas.FCT2Frm(newvalue);
		break;
		case	"trin":
			if (newvalue.match(/(.+)\s*\((.+)\)/)){
				newTrin.setValue(newvalue);
			}else{
				alert(localize(nas.uiMsg.failed)+" : "+newvalue);//"処理できませんでした"
				return;
			};
		break;
		case	"trout":
			if (newvalue.match(/([^\(]+)\s*\((.+)\)/)){
				newTrout.setValue(newvalue);
			}else{
				alert(localize(nas.uiMsg.failed)+" : "+newvalue);//"処理できませんでした"
				return;
			};
		break;
		case "headMargin":
			newHeadMargin = nas.FCT2Frm(newvalue);
		break;
		case "tailMargin":
			newTailMargin = nas.FCT2Frm(newvalue);
		break;
		default	:return;
		}
	}else{
		return;
	};
//	現在の値からカット継続時間を一時的に生成
	if(newHeadMargin < newTrin / 2)  newHeadMargin = newTrin / 2;
	if(newTailMargin < newTrout / 2) newTailMargin = newTrout / 2;
	var duration    = newTime + newHeadMargin + newTailMargin;
	var oldduration = XPS.duration();
	var durationUp  = (duration > oldduration)? true : false ;

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
			newXPS.readIN( xUI.XPS.toString(false));
			newXPS.setDuration(duration);
			newXPS["trin"].setValue(newTrin);
			newXPS["trout"].setValue(newTrout);
			newXPS["headMargin"] = newHeadMargin;
			newXPS["tailMargin"] = newTailMargin;
			newXPS.adjustMargin();
			xUI.put(newXPS);
			xUI.setStored("force");//変更フラグを立てる
		};
		sync("info_");
	}else{
	//
		xUI.setStored("force");
		if(xUI.XPS.trin.toString()  != newTrin.toString() ){xUI.XPS.trin.setValue(newTrin)  ; sync("trin"); };
		if(xUI.XPS.trout.toString() != newTrout.toString()){xUI.XPS.trout.setValue(newTrout); sync("trout");};
	};
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
/*
    
 */
function chgValue(id){
	var myTarget=document.getElementById(id);
	switch (id){
case	"iptChange":
		xUI.ipMode = parseInf(myTarget.value);
		sync('ipMode');
		break;
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
	xUI.selectCell(
		(myTarget.selectedIndex).toString()+
		"_"+xUI.Select[1]
	);
	reWriteCS();//cellセレクタの書き直し
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
		currentValue=this.XPS.trin.toString();
//		currentValue=this.XPS.trin[1]+"\ \("+nas.Frm2FCT(this.XPS.trin[0],3,0,this.XPS.framerate)+"\)";
	break;
	case "trout":
		msg="トランシット情報。時間は括弧で括って、キャプションとの間は空白。\n書式:caption (timecode) /例: c10-c11 wipe. (1+12.)";
		currentValue=this.XPS.trout.toString();
//		currentValue=this.XPS.trout[1]+"\ \("+nas.Frm2FCT(this.XPS.trout[0],3,0,this.XPS.framerate)+"\)";
	break;
	case "headMargin":
		msg="タイムライン前方マージン。フレーム数またはタイムコードで\n";
		currentValue = nas.Frm2FCT(nas.FCT2Frm(this.XPS.headMargin),3.0);
	break;
	case "tailMargin":
		msg="タイムライン後方マージン。フレーム数またはタイムコードで\n";
		currentValue = nas.Frm2FCT(nas.FCT2Frm(this.XPS.tailMargin),3.0);
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
		var prp     = this.target.id
		var org_dat = XPS[prp];
		var new_dat = this.newContent;
		switch (prp){
		case "scene_cut":
			var prevalue=this.orgContent
			var newvalue=this.newContent;
			if(newvalue != prevalue){
				var newvalues=newvalue.split(" ");
				xUI.put(["scene",(newvalues.length>1)?newvalues[0]:""]);
				XPS.cut  =(newvalues.length>1)?newvalues[1]:newvalues[0];
				xUI.put(["cut",(newvalues.length>1)?newvalues[1]:newvalues[0]]);
				xUI.setStored("force");
			};
			sync("cut");
		break;
		case "time":
		case "trin":
		case "trout":
		case "headMargin":
		case "tailMargin":
			var prevalue=this.orgContent
			var newvalue=this.newContent;
			if(newvalue != prevalue){chgDuration(prp,prevalue,newvalue);}else{sync("info_");}
		break;
		case "update_user":
		case "opus":
		case "title":
		case "subtitle":
		default:
			if (new_dat!=org_dat){
				xUI.put([prp,new_dat]);
				xUI.setStored("force");
			};
			sync(prp);
		};
		xUI.printStatus();//クリア
	};
	if((TargeT.id)&&(TargeT instanceof HTMLTableCellElement)){
console.log(TargeT);
		nas.HTML.editTableCell.edit(TargeT,"input",currentValue,myFunction);
	};
}

function rewriteValue(id){
	if(xUI.edchg) xUI.put(document.getElementById("iNputbOx").value);
	var msg = "";
	var prp = "";
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
		};
	break;
	case	"time":
	case	"trin":
	case	"trout":
	case	"headMargin":
	case	"tailMargin":
		chgDuration(id);
	break;

	case	"update_user":
		msg="作業ユーザを変更します。\n";
		prp=id;
		getProp(msg,prp);
		break;
	};
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
var msg = localize(nas.uiMsg.confirmCallecho)+"\n"+localize(nas.uiMsg.confirmOk)+"\n"+localize(nas.uiMsg.confirmEdit)+"\n";
var title = localize(nas.uiMsg.saveToDonloadfolder);
    if(!dlName){
nas.HTML.showModalDialog("prompt",msg,title,xUI.getFileName()+'\.xps',function(){
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
/**
    @params {String} myExt
    保存形式の拡張子
    html|xmap|xps|xpst|tdts|xdts|ard|ardj|csv|sts|tsh|eps|txt  など
送信データ本体は、document.saveXps.XPSBody.value なので  あらかじめ値をセットしてからコールする必要あり
:nas.uiMsg
*/
function callEchoExport(myExt)
{
   var myEncoding="utf8";//デフォルトutf-8
   var sendData=xUI.data_well.value;
   
var form={
html: "documentHTML",
xmap: "documentxMap",
xps : "documentXps",
tdts:"documentTdts",
xdts:"documentXdts",
ard : "documentArd",
ardj: "documentArdj",
csv : "documentCSV",
sts : "documentSTS",
tsh : "documentTSheet"
}
		//ファイル保存ではなくエクスポートなので環境リセットは省略;
   if(! myExt){myExt="txt";}
   switch (myExt){
	case "tdts":
	case "xdts":
		sendData=sendData.replace(/\r?\n/g,"\n");
		myEncoding="utf8";
	break;
	case "tsh":
		sendData=sendData.replace(/\r?\n/g,"\r")+"\n";
	case "eps":
	case "ard":
		myEncoding="sjis";
	break;
	default:
		myEncoding="utf8";
   }
  var msg = localize(nas.uiMsg.confirmCallechoSwap,localize(nas.uiMsg[form[myExt]]))+"\n"+localize(nas.uiMsg.confirmOk)+"\n"+localize(nas.uiMsg.confirmEdit)+"\n";
  var title = localize(nas.uiMsg.saveToDonloadfolderSwap,localize(nas.uiMsg[form[myExt]]))
nas.HTML.showModalDialog("prompt",msg,title,xUI.getFileName()+'\.'+myExt,function(){
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
   
    var msg = localize(nas.uiMsg.confirmCallechoSwap,localize(nas.uiMsg.documentHTML))+"\n"+localize(nas.uiMsg.confirmOk)+"\n"+localize(nas.uiMsg.confirmEdit)+"\n";
    var title = localize(nas.uiMsg.saveToDonloadfolderSwap,localize(nas.uiMsg.documentHTML));
nas.HTML.showModalDialog("prompt",msg,title,xUI.getFileName()+'\.'+myExt,function(){
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
	epsデータは１ページ毎の別ファイルなので  複数葉の場合このダウンロードルーチンが
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
jquery導入に合わせて、ドラッガブルでミニマイズ可能な作りに変更  2013.04.07

*/
/**
	ソフトウェアキーボード処理
	ツールボックス上のソフトウェアキーボードの入力をxUIに送る
	シートセルの同期を行う
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
	case	"←":if(textBody.length){document.getElementById("iNputbOx").value=textBody.slice(0,-1);};
	break;
	case	"esc":chkValue("ng");return;
	break;
	default	:document.getElementById("iNputbOx").value += Chr;//
	}
	if(textBody != document.getElementById("iNputbOx").value){
	    xUI.eddt = document.getElementById("iNputbOx").value;
        syncInput(xUI.eddt);
		xUI.edChg(true);//編集フラグ立て
	};//(! xUI.edchg)
//	document.getElementById("iNputbOx").focus();
}
/**
	UIControlの値を検査して値に従ったアクションに変換する
	@params {String}    id
	    動作キーワード
*/
function chkValue(id){
	document.getElementById("iNputbOx").select();//live
	switch (id){
case	"imgUse":
            console.log(
                document.getElementById("imgUse").checked,
                document.getElementById("ImgBMOde").value,
                parseInt(document.getElementById("ImgAppearance").value)/100
            );
            if(document.getElementById("imgUse").checked){
                xUI.setAppearance(xUI.XPS.timesheetImages.imageAppearance);
            }else{
                xUI.setAppearance(0);
            };
break;
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
	if(Lvl>0&&Lvl<=(xUI.XPS.xpsTracks.length-1)) writeAEKey(Lvl);
	return;
break;
case	"iNputbOx"	:	hello();break;
case	"ok"	:
	if (xUI.edchg){
        var expdList = nas_expdList(xUI.eddt);
		xUI.put(iptFilter(
		    expdList.split(","),
		    xUI.XPS.xpsTracks[xUI.Select[0]],
		    xUI.ipMode,
		    false
		));//更新
	}
	if(expd_repFlag){
		xUI.spin("down");expd_repFlag=false;
	}else{
		xUI.spin("down")
//		xUI.spin("fwd")
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
	xUI.spin(id);
break;
case	"home"	:	xUI.selectCell(xUI.Select[0]+"_0");break;
case	"end"	:	xUI.selectCell(xUI.Select[0]+"_"+XPS.duration());break;
//
case	"spin_V":	xUI.spin(document.getElementById(id).value);break;
case	"v_up"	:	;//スピン関連
case	"v_dn"	:	;//IDとキーワードを合わせてそのまま送る
case	"pgdn"	:	;
case	"pgup"	:	xUI.spin(id);
break;

case	"iptChange":	;//スイッチ変更
    xUI.ipMode = parseInt(document.getElementById("iptChange").value);
	sync("ipMode");
			break;
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
	xUI.selectCell(
		(document.getElementById(id).selectedIndex).toString()+
		"_"+xUI.Select[1]
	);
	reWriteCS();//cセレクタの書き直し
	document.getElementById('tBtrackSelect').focusItm.focus();//再フォーカス
	break;
case	"cell"	:	;//セルの入力
case	"tBitemSelect"	:	;//セルの入力
	var itm = document.getElementById(id).children[document.getElementById(id).selectedIndex];
//トラックタイプで分岐
	var type = Xps.AreaOptions[xUI.XPS.xpsTracks[xUI.Select[0]].option];
		switch(type){
//	case "camerawork":
//	case "camera":
//	case "cam":
//	break;
	case "dialog":
		if(itm.innerHTML.match(/^(<.*\>|\(.*\)|\[.*\])$/)){
			xUI.put(itm.innerHTML);//展開しない
		}else{
			xUI.put(nas_expdList(itm.innerHTML));//展開する
		};
		xUI.spin("down");
	break;
//	case "sound":
//	case "geometry":
//	case "stage":
//	case "stagework":
//	case "effect":
//	case "sfx":
//	case "composite":
//	case "comment":
//	case "tracknote":

//	case "reference":
//	case "action":
//	case "timecode":
	case "still":
	case "cell":
	case "timing":
	case "replacement":
		xUI.put(iptFilter(
			itm.innerHTML,
			xUI.XPS.xpsTracks[xUI.Select[0]],
			xUI.ipMode,
			false
		));
		xUI.spin("fwd");
		document.getElementById(id).link.select(itm);
	break;
	default:
		xUI.put(nas_expdList(itm.innerHTML));xUI.spin("down");
			};// */
	break;
case	"fav"	:	;//文字の一括入力
case	"tBkeywordSelect"	:	;//文字の一括入力
EXword=xUI.favoriteWords[document.getElementById(id).selectedIndex];
TGword=XPS.xpsTracks[xUI.Select[0]][xUI.Select[1]];
//指定文字列の場合は、登録された関数を呼び出し

if(EXword.match(nas.CellDescription.ellipsisRegex)){
    console.log('bar : '+ EXword);
}else if(EXword.match(nas.CellDescription.blankRegex)){
    console.log('brank : '+ EXword);
}else if(EXword.match(nas.CellDescription.modifiedRegex)){
    console.log('modified : '+ EXword);

}else if(EXword.match(/\*/)){
//文字列に*があれば、現在の値と置換
    EXword=EXword.replace(/\*/,TGword);
}else if(EXword.match(/\#/)){
//#があれば現在の値の数値部分と置換
	if(TGword.match(/(\D*)([0-9]+)(.*)/)){
		var prefix=RegExp.$1;var num=RegExp.$2;var postfix=RegExp.$3;
		EXword=EXword.replace(/\#/,num);
		EXword=prefix+EXword+postfix;
	}
}else if(EXword.match(nas.CellDescription.interpRegex)){
	interpSign(EXword);
	break;
}else if(EXword.match(/.* /)){
	
};
	xUI.put(EXword);
	xUI.spin("fwd");
	document.getElementById(id).link.select(document.getElementById(id).focus);
	break;
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
	reWriteTS();//trackセレクタの書き直し
	reWriteCS();// cellセレクタの書き直し
	reWriteWS();// wordセレクタの書き直し
}
//トラックセレクタの更新
function reWriteTS(){
	var Selector= '';
	var options = [];
	var selected = xUI.Select[0];
//var dialogS = xUI.XPS.xpsTracks.areaOrder.find(function(e){return(e.type=='dialog')});
//    if(! dialogS) dialogS = 1;
	for(c = 0;c < xUI.XPS.xpsTracks.length;c++){
		var myLabel=(c == xUI.XPS.xpsTracks.length-1)?"MEMO.":xUI.XPS.xpsTracks[c]["id"];

//		if(c < dialogS ) myLabel="台詞"+ ((c>0)?c:"");

			options.push(myLabel);
			Selector+=(selected==c)?'<option selected/>':'<option />';
			Selector+=myLabel;
	};
	if(document.getElementById("tBtrackSelect")){
    	if(
	        (document.getElementById("tBtrackSelect").link)
	    ){
		    document.getElementById("tBtrackSelect").link.setOptions(options);
		    document.getElementById("tBtrackSelect").link.select(options[selected]);
	    }else{
		    document.getElementById("tBtrackSelect").innerHTML=Selector;
	    };
	};
}
//入力補助セレクタを書き直す。
function reWriteCS(){
	var Selector='';
	var options = [];
//セレクタはカレントのトラック種別で書き換えを行う。基本的にxMapエレメントを選択可能にするセレクタ
//xMapにグループが存在しないか、または不十分なときは基本データで埋める
	switch (xUI.XPS.xpsTracks[xUI.Select[0]].option){
	case "timing":
	case "cell":
	case "replacement":
		if(xUI.Select[0] < (XPS.xpsTracks.length-1))
			var cOunt = (isNaN(xUI.XPS["xpsTracks"][xUI.Select[0]]["lot"]))?
			20 : xUI.XPS["xpsTracks"][xUI.Select[0]]["lot"];
		for(f=1;f<=cOunt;f++){
			options.push(String(f));
			Selector+='<option />'+String(f);
		};
	break;
	case "dialog":
		options = ['\"dialog...','「セリフ...','----','(off)','(背)','(vo)','こぼし','こぼれ'];
		options.forEach(function(e){Selector+='<option />'+String(e);});
	break;
	case "camera":
        options = ["\\PAN","\\Follow","\\TU","\\TB","\\Slide","\\Scale","\\ブレ","\\画面動","\\OL","\\FI","\\FO","\\透過光","\\WXP"];
		options.forEach(function(e){
			let cItem = nas.cameraworkDescriptions.get(e.replace(/\\/g,''));
			Selector += '<button';
			if(cItem) Selector += ' title ="' + cItem.description +'"';
			Selector += '>'+String(e)+'</button>'
		});
	break;
	default:
	};
//	if(xUI.Select[0] >= xUI.dialogSpan || xUI.Select[0] < (XPS.xpsTracks.length-1)){};
	if (document.getElementById("tBitemSelect").link){
		document.getElementById("tBitemSelect").link.setOptions(options);
		document.getElementById("tBitemSelect").link.select(options[0]);
		document.getElementById("tBitemSelect").scrollTo(0,0);
	}else{
		document.getElementById("tBitemSelect").innerHTML=Selector;
	};
}
//お気に入り単語のセレクタを書き直す。
function reWriteWS(){
	var Selector='';
	var wCount=xUI.favoriteWords.length;
	for(id=0;id<wCount;id++){Selector+='<option />'+xUI.favoriteWords[id]};
	if (document.getElementById("tBkeywordSelect").link){
		document.getElementById("tBkeywordSelect").link.setOptions(xUI.favoriteWords);
		document.getElementById("tBkeywordSelect").link.select(xUI.favoriteWords[0]);
	}else{
		document.getElementById("tBkeywordSelect").innerHTML=Selector;
	};
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
    this.Lists["bgColorList"]=
["=CUSTOM=,=CUSTOM=,=CUSTOM=",
"#fff1ba,レモン,れもん",
"#f8b500,山吹,やまぶき",
"#88a3af,浅葱,あさぎ",
"#bce2e8,水色,みずいろ",
"#fef4f4,さくら,さくらいろ",
"#e198b4,桃色,ももいろ",
"#f2c288,びわ,びわ",
"#afafb0,銀鼠,ぎんねず",
"#f8f8f8,白練,しろねり"];
//リスト検索 指配列内の定された要素のサブ要素をあたってヒットしたら要素番号を返す。
this.Lists.aserch=function(name,ael){if(this[name]){for (var n=0;n<this[name].length;n++){if(this[name][n]==ael)return n}};return -1;}

	this.userName=xUI.currentUser.toString();
//ユーザ名変更  プリファレンスパネルは大幅に変更があるのでこのメッセージの翻訳は保留  :nas.uiMsg.
this.chgMyName=function(newName){
	if(! newName){
		var msg = localize(nas.uiMsg.dmAskUserinfo)+
		        "\n\n ハンドル:メールアドレス / handle:uid@example.com ";
		    msg=[msg];
		    msg.push("<hr><input id='new_user_account' type='text' autocomplete='on' list='recentUsers' size=48 value=''>");
//ユーザ変更UIを拡充
/*
    ブラウザにユーザを複数記録する。
    記録形式は  handle:uid  に変更する
    UI上は、ユーザID(マスタープロパティ)とハンドル（補助プロパティ）を別に提示
    ユーザIDリストで表示する   ユーザIDは、サインイン用のIDとして使用する

ユーザID
*/
		nas.HTML.showModalDialog("confirm",msg,localize(nas.uiMsg.userInfo),xUI.currentUser,function(){
		    if(this.status==0){
//このダイアログは直接xUIのプロパティを変更しない  一時オブジェクトを作成してPrefの表示のみを変更する
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
//背景カラー変更  引数はエレメントid
/*  
    "prefBGColor",  "prefColorpick" または 候補ボタンID "bgColorList##" が引数として与えられる  
*/
this.chgColor = function(id){
	if (! id) id="prefBGColor";
    var targetColor = document.getElementById(id).value;
//    if(targetColor == "=CUSTOM="){targetColor=document.getElementById("prefBGColor").value;}
    document.getElementById("prefBGColor").value = targetColor;
    document.getElementById("prefColorpick").value = targetColor;
    document.getElementById("bgColorList").style.backgroundColor = targetColor;
    
    document.getElementById("bgColorList").style.backgroundColor = targetColor;
    return;
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
this.chgVM = function(myValue){
		document.getElementById("vMWordProp").checked  =(myValue=='WordProp')?  true:false;
		document.getElementById("vMCompact").checked   =(myValue=='Compact')?   true:false;
		document.getElementById("vMPageImage").checked =(myValue=='PageImage')? true:false;
	if(xUI.viewMode != myValue){
		if(! this.changed){this.changed=true;};
	}
	return false;
}
//
//各種設定表示初期化
this.getProp=function(){
//作業ユーザ名
	this.chgMyName(xUI.currentUser.toString());
//表示モード
	this.chgVM(xUI["viewMode"]);
//カラセル関連
	var idNames =["prefBlmtd","prefBlpos","prefAeVersion"];//不要プロパティ＞,"prefKeyMethod"
	var iNames  =["blmtd"    ,"blpos"    ,"aeVersion"    ];//,"keyMethod"    
	for (var i=0;i<idNames.length;i++ ){
		var idName = idNames[i];var name = iNames[i];
		document.getElementById(idName).value=
		this.Lists.aserch(idName,xUI[name]);
	}
	this.chgblk();
//キーオプション
	var keyNames=["prefFpsF","prefDfX","prefDfY","prefDfA"];
	var kNames  =["fpsF"    ,"dfX"    ,"dfY"    ,"dfA"    ];
	for (var i=0;i<keyNames.length;i++){
		var idName = keyNames[i];var name = kNames[i];
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
    getElementById("prefColorpick").value = xUI.sheetLooks.SheetBaseColor;
    var selectButtons = "";
    for(var btid=0;btid<this.Lists["bgColorList"].length;btid++){
        var myProps = String(this.Lists["bgColorList"][btid]).split(",");
        selectButtons += '<button class=colorSelect id="bgColorList'
        selectButtons += nas.Zf(btid,2);
        selectButtons += '" onClick="myPref.chgColor(this.id)" value="';
        selectButtons += (myProps[0]=="=CUSTOM=")? xUI.sheetLooks.SheetBaseColor:myProps[0];
        selectButtons += '" title="';
        selectButtons += myProps[2];
        selectButtons += '" style="background-color:';
        selectButtons += (myProps[0]=="=CUSTOM=")? xUI.sheetLooks.SheetBaseColor:myProps[0];
        if (myProps[0]=="=CUSTOM="){
            selectButtons += ';border-color:black;border-width:1px;'
        }
        selectButtons += '"> </button>';
    }
    getElementById("bgColorList").innerHTML = selectButtons;
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
		xUI.recentUsers.addMember(newUser);//recentUsersにアイテム追加(トライ)
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
//ページ長・カラム
var cols=(document.getElementById("prefPageCol").checked==true)? 2 : 1;
if(	xUI.SheetLength !=document.getElementById("prefSheetLength").value ||
	xUI.PageCols !=  cols ||
	xUI.viewMode != newMode
){
	xUI["viewMode"] = newMode;
// シート外観の変更が必要なので再初期化する
	xUI.SheetLength = document.getElementById("prefSheetLength").value;
		xUI.PageLength	=xUI.SheetLength  *  XPS.framerate;
	xUI.PageCols= cols;
//実行
        xUI.resetSheet();
}
//フットスタンプ
    if(xUI.footMark != document.getElementById("prefFootMark").checked){
	    xUI.footstampReset(document.getElementById("prefFootMark").checked);
    }
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

this.init=function(){
    this.getProp();
// userID control disabled if onSite
    if (xUI.onSite){
        document.getElementById('myName').disabled = true;
    }else{
        document.getElementById('myName').disabled = false;        
    }
    if(serviceAgent.currentStatus=='online-single'){
        document.getElementById('prefBGColor').disabled = true;
    }else{
        document.getElementById('prefBGColor').disabled = false;        
    }
}

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
A	シーン（カット）登録  Title/Opus/S_C + time
B	シーン属性編集	各トラックのプロパティ編集
の２面UIとする
Aは管理DBにエントリ登録を行う専用UI
BはXps（ステージ）の属性編集UI
二つの概念を分離して、それぞれのUIを作成すること
*/

function ScenePref(){
//内容変更フラグ
	this.changed = false;
	document.getElementById("scnReset").disabled=(! this.changed);
//編集フォーカス 
	this.focus   = null;
	this.focusItems = [
		"scnTitle","scnOpus","scnSubtitle",
		"scnScene","scnCut",
		"scnHeadMargin","scnTrin","scnTrinT",
		"scnTime",
		"scnTrot","scnTrotT","scnTailMargin",
		"scnFormatList"
	];

//
	this.tracks=0;//ローカルの トラック数バッファ・スタートアップ内で初期化
	this.sheetLooks = documentFormat.toJSON();//データ一時領域としてdocumentFormatを直に使うか？
//各種プロパティとセレクタの対応を格納する配列

	this.Lists = new Array();

	this.Lists["blmtd"]=["file","opacity","wipe","channelShift","expression1"];
	this.Lists["blpos"]=["first","end","none"];
	this.Lists["AEver"]=["8.0","10.0"];
	this.Lists["KEYmtd"]=["min","opt","max"];

	this.Lists["framerate"]=["custom","23.976","24","30","29.97","59.96","25","50","15","48","60"];
	this.Lists["framerate_name"]=["=CUSTOM=","23.98","FILM","NTSC","SMPTE","SMPTE-60","PAL","PAL-50","WEB","FR48","FR60"];

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
this.chgProp = function (id){
	var	name	= id.split("_")[0];
	var	number	= id.split("_")[1];
		switch (name){
		case "scnLopt": this.chgopt(name,number);break;
		case "scnLlbl": this.chglbl(name,number);break;
		case "scnLlot": this.chglot(name,number);break;
		case "scnLbmd": ;
		case "scnLbps": this.chgblk(name,number);break;
		case "scnLszT": ;
		case "scnLszX": ;
		case "scnLszY": ;
		case "scnLszA": this.chgSIZE(name,number);break;
		case "scnFormatList": this.chgFormat(document.getElementById(id).value);break;
		};
	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);
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

//フォーマット変更
this.chgFormat = function(kwd){
    if(! kwd) kwd = xUI.XPS.sheetLooks.FormatName;
    var fmt = documentFormat.formatList.find(function(e){return ((e[1]==kwd)||(e[0]==kwd)||(e[2]==kwd));});
    if(fmt) {
console.log(fmt);
//リストに該当エントリーがあれば内容を取得してプレビュー
		$.ajax({
			url:fmt[2],
			type:'GET',
			dataType:'json',
			success:function(result){
				console.log(result);//データチェックをしたほうが良いかも？
				documentFormat.parse(result);//データ一時領域としてdocumentFormatを直に使う
				document.getElementById("scnFormPreview").src  = result.TemplateImage;
				console.log(result.trackSpec);
//				documentFormat.applyFormat(newName);
//				document.getElementById("scnFormPreview").src  = documentFormat.TemplateImage;
			}
		});
	};
}
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
    	document.getElementById("scnReset").disabled=(! this.changed);
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
	    document.getElementById("scnReset").disabled=(! this.changed);
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
	document.getElementById("scnReset").disabled=(! this.changed);
}
//ドキュメント情報パネル上のフレームレート変更禁止 関数廃止 2024 02 10
this.chgFRATE =function (id){
console.log(id);
return ;

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
nas.RATE = this.Lists["framerate_name"][document.getElementById("scnSetFps").value];
nas.FRATE = nas.newFramerate(nas.RATE,Number(document.getElementById("scnFramerate").value));
//内部計算用なので親のレートは変更しない
	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);
}

//省略時サイズ変更
this.chgSIZE =function (name,number){
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
	document.getElementById("scnReset").disabled=(! this.changed);
}
//新規作成のスイッチトグル
this.chgNewSheet =function (){
	var dist=(! document.getElementById("scnNewSheet").checked)? true:false;
	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);

//新規作成から更新に戻した場合は、時間とレイヤ数を
//親オブジェクトから複写して上書き思ったが、どうせ暫定なのでとりあえずリセット
	if(dist) {this.getProp()}
}

//チェックボックストグル操作
this.chg =function (id){
	document.getElementById(id).checked=
	(document.getElementById(id).checked) ?
	false	:	true	;
		if (id=="newSheet") this.chgNewSheet();

	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);
}
//テキストボックス書き換え
this.rewrite =function (id){
if(dbg){dbgPut(id);}
	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);
	return false;//フォーム送信抑止
}
/*
    引数の数だけラベルを作って返す
    現行のドキュメント変更時は、現在のラベルを取得する
*/
this.mkNewLabels=function(timingLayers,dialogs,camLayers){
    if (document.getElementById("scnNewSheet").checked){
        if(! dialogs) dialogs = 1
    }else{
        dialogs = xUI.dialogCount;
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
  201802改修  レイヤブラウザの位置づけ変更
  AE依存のパラメータを使用しない
  基本はデータ編集をロックして閲覧のみ
  引数はトラック数
*/
this.mkLayerSheet =function (lot){
//	レイヤブラウザを作る  終端のフレームコメントを除くすべて
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
	"option","link","tag","label","lot","blmtd","blpos",
	"size","sizeX","sizeY","aspect"
];
*/
var labelOptions=[
	"種別","リンク","親","タグ","ラベル",
	"セル枚数","カラセル","配置",
	"プリセット",
	"sizeX","sizeY","aspect"
];
var Labels=["Lopt_","Llnk_","Lpnt_","Ltag_","Llbl_","Llot_","Lbmd_","Lbps_","LszT_","LszX_","LszY_","LszA_"
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
case	"Ltag_":	body_+='<input type=text id="scnLtag_';	//タグ:3
		break;
case	"Llbl_":	body_+='<input type=text id="scnLlbl_';	//ラベル:4
		break;
case	"Llot_":	body_+='<input type=text id="scnLlot_';	//ロット:5
		break;
case	"Lbmd_":	body_+='<SELECT id="scnLbmd_';	//カラセルメソッド:6
		break;
case	"Lbps_":	body_+='<SELECT id="scnLbps_';	//カラセル位置:7
		break;
case	"LszT_":	body_+='<SELECT id="scnLszT_';	//サイズまとめ:8
		break;
case	"LszX_":	body_+='<input type=text id="scnLszX_';	//サイズX:9
		break;
case	"LszY_":	body_+='<input type=text id="scnLszY_';	//サイズY:10
		break;
case	"LszA_":	body_+='<input type=text id="scnLszA_';	//アスペクト:11
		break;
default	:alert(opt);
}
//番号追加
	body_+=String(i);


body_+='" onChange="myScenePref.chgProp(this.id)"';//共通
body_+=' style="text-align:center;width:100px"';//共通
	if (opt==1||opt==2||opt==3||opt==4||opt==5||opt>8)
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
body_+='<OPTION VALUE=sfx >geometry';//
body_+='<OPTION VALUE=sfx >effects';//
break;

case	"6":
//オプション別/セレクタもの	カラセルメソッド
body_+='<OPTION VALUE=file > ファイル ';//
body_+='<OPTION VALUE=opacity > 不透明度 ';//
body_+='<OPTION VALUE=wipe > リニアワイプ ';//
body_+='<OPTION VALUE=channelShift > チャンネルシフト';//
body_+='<OPTION VALUE=expression1 > 動画番号トラック';//
break;

case	"7":
//オプション別/セレクタもの	カラセル位置
body_+='<OPTION VALUE=build >--------';//
body_+='<OPTION VALUE=first >最初の絵を使う';//
body_+='<OPTION VALUE=end >最後の絵を使う';//
body_+='<OPTION VALUE=none >カラセルなし';//
break;

case	"8":
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
//フォーカスターゲット変更
this.chgFocus = function(evt){myScenePref.focus = evt.target;}
//シート情報各種設定表示初期化
this.getProp =function (){
//フォーマットセレクタを最新値に更新
    this.sheetLooks = JSON.parse(JSON.stringify(xUI.XPS.sheetLooks));
    var selectlist = document.getElementById("scnFormatList");
    if(selectlist){
//リストを一旦クリア
        Array.from(selectlist.children).forEach(function(e){selectlist.removeChild(e);console.log('removed :'+e.value);});
        documentFormat.formatList.forEach(function(e){
            var opt = document.createElement('option');
            opt.value = e[0];opt.innerHTML = e[1];
            if((opt.value == xUI.sheetLooks.FormatName)||(opt.innerHTML == xUI.sheetLooks.FormatName)){
                opt.selected = true;
                document.getElementById('scnFormPreview').src = xUI.sheetLooks.TemplateImage;
            };
            selectlist.appendChild(opt);
        });
//        this.sheetLooks = 
    };
//リポジトリ取得
    document.getElementById("scnRepository").innerHTML = (! xUI.XMAP.dataNode)?
        [serviceAgent.currentRepository.url,serviceAgent.currentRepository.name].join("/"):
        "This data is not stored in any repository.";
//このデータはいずれのリポジトリにも保存されていません
        document.getElementById("scnNewSheet").checked=false;//新規フラグダウン
    if (! xUI.XMAP.dataNode){
        document.getElementById("scnPushentry").disabled=false;
    }else{
        document.getElementById("scnPushentry").disabled=true;
    };
//ドキュメントパネルから新規ドキュメントフラグを削除  削除に伴う変更まだ
//ドキュメント一覧からプロジェクト一覧を取得してリストに展開する
    var myProducts = documentDepot.products;
        this.titles = [];this.episodes = [];
    for (var pix=0;pix<documentDepot.products.length;pix++){
        var product=Xps.parseProduct(documentDepot.products[pix]);
        this.episodes.push(product);
        this.titles.add(product.title);
    };
    document.getElementById("scnTitleList").innerHTML="";//クリア
    for(var tix=0;tix<this.titles.length;tix++){
        var opt=document.createElement("option");
        opt.value = this.titles[tix];
        document.getElementById("scnTitleList").appendChild(opt);
    }
    this.reWrite("scnTitle");
//レイヤ数(トラックの状態)を取得 / 新規ドキュメントフラグが立っている場合はsheetLooksを使用
	if (this.tracks != (XPS.xpsTracks.length-1)){
		this.tracks =  (XPS.xpsTracks.length-1);//バックアップとるコメントトラックを除いたトラック数
		document.getElementById("scnLayers").value = this.tracks;
//ラベルウェルを書き換え
		document.getElementById("scnLayersLbls").value = this.mkNewLabels(this.tracks-xUI.dialogSpan).join();
//レイヤ数変わってテーブル変更なのでテーブル出力
		document.getElementById("scnLayerBrouser").innerHTML=
		this.mkLayerSheet(document.getElementById("scnLayers").value);
	}else{
		document.getElementById("scnLayers").value = this.tracks;
	};

	if(document.getElementById("scnNewSheet").checked){
        document.getElementById("scnLayers").disabled = false;
        document.getElementById("scnLayersLbls").disabled = false;
    }else{
        document.getElementById("scnLayers").disabled = true;
        document.getElementById("scnLayersLbls").disabled = true;
    }
//変換不要パラメータ "mapfile","framerate"
	var names=[
"title","subtitle","opus","scene","cut",
"create_time","create_user","update_time","update_user"
];
	var ids=[
"scnTitle","scnSubtitle","scnOpus","scnScene","scnCut",
"scnCreate_time","scnCreate_user","scnUpdate_time","scnUpdate_user"
];
	for (var i=0;i<names.length;i++){
		document.getElementById(ids[i]).value = xUI.XPS[names[i]];
		document.getElementById(ids[i]).disabled = (xUI.onSite)? true:false;
	}

//シートメモ転記 メモ欄削除231004
//		document.getElementById('scnMemo').value=xUI.XPS.xpsTracks.noteText;
        
	var names=["create_time","create_user","update_time","update_user"];
	var ids=["scnCreate_time","scnCreate_user","scnUpdate_time","scnUpdate_user"];
	for (var i=0;i<names.length;i++){
		document.getElementById(ids[i]+"TD").innerHTML=
		(document.getElementById(ids[i]).value=="")?"<br>":
		xUI.trTd(document.getElementById(ids[i]).value);
	};

//取得したシートのフレームレートをnasのレートに代入する
//	nas.FRATE= nas.newFramerate(document.getElementById("scnFramerate").value);
//  nas.FRATE.setValue(document.getElementById("scnFramerate").value);
//nas側でメソッドにすべきダ
//	現在の時間を取得
		document.getElementById("scnTime").value  = nas.Frm2FCT(xUI.XPS.time(),3,0,xUI.XPS.framerate);
		document.getElementById("scnTrin").value  = xUI.XPS.trin.name;//["trin"][1];
		document.getElementById("scnTrinT").value = xUI.XPS.trin.time;//nas.Frm2FCT(xUI.XPS["trin"][0],3,0,xUI.XPS.framerate);
		document.getElementById("scnTrot").value  = xUI.XPS.trout.name;//["trout"][1];
		document.getElementById("scnTrotT").value = xUI.XPS.trout.time;//nas.Frm2FCT(xUI.XPS["trout"][0],3,0,XPS.framerate);

		document.getElementById("scnHeadMargin").value = nas.Frm2FCT(nas.FCT2Frm(xUI.XPS.headMargin),3,0,xUI.XPS.framerate);
		document.getElementById("scnTailMargin").value = nas.Frm2FCT(nas.FCT2Frm(xUI.XPS.tailMargin),3,0,xUI.XPS.framerate);

//		document.getElementById("scn").value=
//		document.getElementById("scnLayers").value=

//	if(document.getElementById("scnCellTable").style.display!="none"){	};
		this.getLayerProp();
	this.changed=false;
	document.getElementById("scnReset").disabled=(! this.changed);
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
			currentTrack["option"]; // 種別  0番は固定
	        document.getElementById("scnLopt_"+i).disabled = (i==0)? true:false;

			document.getElementById("scnLlnk_"+i).value=
			currentTrack["link"];//リンク  現在固定
			document.getElementById("scnLlnk_"+i).disabled=true;

			document.getElementById("scnLpnt_"+i).value=
			currentTrack["parent"];//ペアレント  現在固定
			document.getElementById("scnLpnt_"+i).disabled=true;

			document.getElementById("scnLtag_"+i).value=
			currentTrack["tag"];//tag
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

			document.getElementById("scnLtag_"+i).value=
			'';
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
this.newProp = function (showMsg)
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
	document.getElementById("scnMapfile").innerHTML ="no mapfile";
	document.getElementById("scnTitle").value       = xUI.XPS.title;
	document.getElementById("scnSubtitle").value    = xUI.XPS.subtitle;
	document.getElementById("scnOpus").value        = xUI.XPS.opus;
	document.getElementById("scnScene").value       = xUI.XPS.scene;
	document.getElementById("scnCut").value         = xUI.XPS.cut;
//	document.getElementById("scnFramerate").value   = xUI.XPS.framerate;

	document.getElementById("scnCreate_time").value = Now.toNASString();
	document.getElementById("scnCreate_user").value = xUI.currentUser;//myName;
	document.getElementById("scnUpdate_time").value = "";
	document.getElementById("scnUpdate_user").value = xUI.currentUser;//myName;

//	document.getElementById("scnMemo").value="";
//	document.getElementById("scn").value=;
//	document.getElementById("").value=;
//	document.getElementById("").value=;
	var names=["scnCreate_time","scnCreate_user","scnUpdate_time","scnUpdate_user"];
	for (var i=0;i<names.length;i++){
		name=names[i];
		document.getElementById(name+"TD").innerHTML=
		(document.getElementById(name).value=="")?"<br>":
		xUI.trTd(document.getElementById(name).value);
//console.log([name,document.getElementById(name).value]);
	}
//取得したシートのフレームレートをnasのレートに代入する
//	nas.FRATE= nas.newFramerate(document.getElementById("scnFramerate").value);
//nas側でメソッドにすべきダ
//	現在の時間を取得
		document.getElementById("scnTime").value  = Sheet;
		document.getElementById("scnTrin").value  = "trin";
		document.getElementById("scnTrinT").value = "00+00.";
		document.getElementById("scnTrot").value  = "trout";
		document.getElementById("scnTrotT").value = "00+00.";

		document.getElementById("scnHeadMargin").value  = "00+00.";
		document.getElementById("scnTailMargin").value  = "00+00.";

	this.layerTableUpdate();
	this.changed=true;
	document.getElementById("scnReset").disabled=(! this.changed);
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
	document.getElementById("scnReset").disabled=(! this.changed);
}
/*
 *      設定値をドキュメントに更新
 *      新規作成を含む
*/
this.putProp =function (){
//	現在のドキュメントは未保存か？
	if(! xUI.checkStored()){return};
//レイヤテーブルを自動更新で処理続行
//		this.layerTableUpdate();
//  書類形式の確認
    var changeFormat = !(documentFormat.compareSheetLooks());
//	現在の時間からカット継続時間を一時的に生成
	var duration =
	(
        nas.FCT2Frm(document.getElementById("scnTrinT").value)+
        nas.FCT2Frm(document.getElementById("scnTrotT").value)
    )/2+
nas.FCT2Frm(document.getElementById("scnHeadMargin").value)+
nas.FCT2Frm(document.getElementById("scnTailMargin").value)+
nas.FCT2Frm(document.getElementById("scnTime").value);
	var oldduration = xUI.XPS.duration();
	var durationUp = (duration>oldduration)? true : false ;
//	レイヤ数の変更を一時変数に取得
	var newArea     = [];//比較用の仮トラック構成 TC,membersは不定でエリアのみを作成
	documentFormat.trackSpec.forEach(function(e){
	    if(e[0]!='timecode'){
	        newArea.push(new XpsTrackArea(e[0]));
	        newArea[newArea.length-1].tracks = e[1]
	    };
	});
	var currentArea = xUI.XPS.xpsTracks.areaOrder;//現在のトラック構成
//トラック構成の比較のみを行う（TCは評価しない）トラック配置・トラック数いずれかが不一致ならフラグを立てる
	var trackChange = false;//トラック変更
    for(var i = 0 ;i < currentArea.length ; i ++){
        if(newArea[i]){
            if(
                (currentArea[i].type != newArea[i].type)||
                (currentArea[i].tracks != newArea[i].tracks)
            ) trackChange = true;
        }else{
            trackChange = true;
        };
        if(trackChange) break;
    };
//	新規作成ならば細かいチェックは不要
	if(document.getElementById("scnNewSheet").checked){
		var msg = localize(nas.uiMsg.alertNewdocumet)   ;//新規シートを作成します。
        msg += "\n"+localize(nas.uiMsg.alertDiscardedit);//現在の編集内容は、破棄されます。
        msg += "\n\n"+localize(nas.uiMsg.confirmExecute);//実行してよろしいですか?
	}else{
//	現内容の変更なのでユーザに承認を得る
//	レイヤ数の変更確認
	var msg="";
		if(changeFormat){
			msg += localize({
				ja:"書式が変更されます",
				us:"DocumentFormat will be changed"
			})+"\n";//ドキュメント書式が変更されます
		};

		if(trackChange){
			msg += localize(nas.uiMsg.alertTrackschange)+"\n";//トラック数が変更されます
//			if (!widthUp)
			msg += "\t"+ localize(nas.uiMsg.alertDiscardtracks )+"\n";//消去されるレイヤの内容は破棄されます
		};
//	カット尺更新確認
		if(duration!=oldduration){
			msg+= localize(nas.uiMsg.alertDurationchange)+"\n";//カットの尺が変更されます
			if (!durationUp)
			msg += "\t"+localize(nas.uiMsg.alertDiscardframes)+"\n";//消去されるフレームの内容は破棄されます。
		};
//
		msg += localize(nas.uiMsg.confirmExecute);//実行してよろしいですか
	};
//確認
	if(confirm(msg)){
		if(changeFormat){
console.log('change Format :'+ documentFormat.FormatName);

			xUI.applyDocumentFormat((document.getElementById("scnNewSheet").checked)?false:true);
		};

		if (
			(document.getElementById("scnNewSheet").checked)	||
			(trackChange)	||
			(duration!=oldduration)
		){
			var changeSheet = true;
		}else{
			var changeSheet = false;
		};
//	実際のデータ更新
		if(document.getElementById("scnNewSheet").checked) xUI.setUImode('floating');
//シートメモ転記 廃止
//		XPS.xpsTracks.noteText = document.getElementById("scnMemo").value;
//値の変換不要なパラメータをまとめて更新  "mapfile"を削除  ユーザ編集は可能性自体が無い
		var names=[
			"title","subtitle","opus","scene","cut"
		];//
		var ids=[
			"scnTitle","scnSubtitle","scnOpus","scnScene","scnCut"
		];//
		for (var i=0;i<names.length;i++){
			xUI.XPS[names[i]] = document.getElementById(ids[i]).value;
		};
// //////新規作成なら現在のシート内容をフラッシュ ?
		if (document.getElementById("scnNewSheet").checked){xUI.flush();}
// /////////

//レイヤ数を設定
//		this.tracks=parseInt(document.getElementById("scnLayers").value);
//		if(true){
//dbgPut("元タイムシートは : "+oldWidth+" 列/ "+oldduration+"コマ\n 新タイムシートは : "+newWidth+" 列/ "+duration+"コマ です。\n ");
//		};
//継続時間とレイヤ数で配列を更新
//		xUI.reInitBody((this.tracks+1),duration);

//		トランジションプロパティの更新
		xUI.XPS["trin"]=[
			nas.FCT2Frm(document.getElementById("scnTrinT").value),
			document.getElementById("scnTrin").value
		];
		xUI.XPS["trout"]=[
			nas.FCT2Frm(document.getElementById("scnTrotT").value),
			document.getElementById("scnTrot").value
		];
//本体シートのフレームレート更新
//		xUI.XPS.framerate = nas.newFramerate(nas.FRATE.toString());
//		xUI.XPS.rate=xUI.XPS.framerate.name;

//書き直しに必要なUIのプロパティを再設定
		xUI.PageLength =
		xUI.SheetLength*Math.ceil(xUI.XPS.framerate);//1ページのコマ数
//新規作成時はundo関連をリセット
		if(document.getElementById("scnNewSheet").checked){
			xUI.flushUndoBuf();
			sync("undo");sync("redo");
		};
//	レイヤプロパティ更新
	//this.putLayerProp();
//	尺または、レイヤ数の変更があるか、新規作成ならばシートを初期化
	if (changeSheet){
//	xUI.sWitchPanel("Prog");

//カーソル位置初期化
	xUI.selectCell("1_0");

		xUI.resetSheet();
// トラックセレクタ更新
		reWriteTS();
		//nas_Rmp_Init();
//AIR環境の場合カレントファイルを初期化する
//	if(isAIR){fileBox.currentFile=null;};//忘れていたとほほ
	}else{
//	それ以外はシート情報表示のみを更新
		sync("info_");
//		sync("lbl");//NOP
	}
//タイトル初期化・保存フラグ強制アクティブ
	xUI.setStored("force");
	sync();
//パネルを再初期化
	this.getProp();
//	this.chgFRATE();
	this.changed=false;
	document.getElementById("scnReset").disabled=(! this.changed);
		this.close();
//	xUI.sWitchPanel("Prog");
	}else{
	    alert(localize(nas.uiMsg.aborted));
	}
}
//更新操作終了
this.putLayerProp =function (){
//テーブルから読み出した値をXPSにセット
	var oldlayers=(xUI.XPS.xpsTracks.length-1);//もとの長さを控える
//	var widthUp=(oldlayers<this.tracks)?true:false;
	for (i=0;i<this.tracks;i++){
		if (i>=oldlayers){
			xUI.XPS.xpsTracks.insertTrack(new XpsTimelineTrack(
				"NABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(i),
				(i==0)?"dialog":"timing",
				xUI.XPS.xpsTracks,
				xUI.XPS.xpsTracks.duration,
				i
			));
			xUI.XPS["xpsTracks"][i]["lot"]    = "=AUTO=";
			xUI.XPS["xpsTracks"][i]["sizeX"]  = xUI.dfX;
			xUI.XPS["xpsTracks"][i]["sizeY"]  = xUI.dfY;
			xUI.XPS["xpsTracks"][i]["aspect"] = xUI.dfA;
			xUI.XPS["xpsTracks"][i]["blmtd"]  = xUI.blmtd;
			xUI.XPS["xpsTracks"][i]["blpos"]  = xUI.blpos;
		}else{
			xUI.XPS["xpsTracks"][i]["option"] = document.getElementById("scnLopt_"+i).value;
			xUI.XPS["xpsTracks"][i]["link"]   = document.getElementById("scnLlnk_"+i).value;
			xUI.XPS["xpsTracks"][i]["tag"]    = document.getElementById("scnLtag_"+i).value;
			xUI.XPS["xpsTracks"][i]["id"]     = document.getElementById("scnLlbl_"+i).value;
			xUI.XPS["xpsTracks"][i]["lot"]    = document.getElementById("scnLlot_"+i).value;
			xUI.XPS["xpsTracks"][i]["sizeX"]  = document.getElementById("scnLszX_"+i).value;
			xUI.XPS["xpsTracks"][i]["sizeY"]  = document.getElementById("scnLszY_"+i).value;
			xUI.XPS["xpsTracks"][i]["aspect"] = document.getElementById("scnLszA_"+i).value;
			xUI.XPS["xpsTracks"][i]["blmtd"]  = document.getElementById("scnLbmd_"+i).value;
			xUI.XPS["xpsTracks"][i]["blpos"]  = document.getElementById("scnLbps_"+i).value;
		};
	};
	xUI.XPS.xpsTracks.renumber();
	reWriteTS();//トラックセレクタ更新する
	sync("lvl");//選択更新
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
//	this.chgFRATE();
	this.changed=false;
    this.focus = null;
//フォーカス初期化（１回のみ）
    this.focusItems.forEach(function(ix){
	    document.getElementById(ix).removeEventListener('focus',this.chgFocus);
	    document.getElementById(ix).addEventListener('focus',this.chgFocus);
    },this);
	document.getElementById("scnReset").disabled=(! this.changed);
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
label参照配列  カット／作品内のラベルをストアして入力候補として提示するためのデータ
タイトルごとの集積データを持つ  タイトルDB内の香盤データとして監理する
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
    各コントロールの有効無効化  視覚化隠蔽等を行う
    
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
/*  編集対象のパネルのラベルを入れ替える
引数:ダイアログラベル文字列
*/
SoundEdit.setLabel = function(myName){
    if(typeof myName == 'undefined') return false;
    if(xUI.edmode<2) return;//NOP
    var targetTrack   = xUI.XPS.xpsTracks[xUI.Select[0]];
    var targetSection = targetTrack.sections[xUI.floatSectionId]
    targetSection.value.name = myName;
    document.getElementById('sndBody').value=targetSection.value.toString();
    targetTrack.sectionTrust=false;
    xUI.sectionUpdate();
}
/*  編集対象のダイアログの属性を入れ替える
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
    targetTrack.sectionTrust=false;
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
    document.getElementById('soundInPoint').value  = nas.Frm2FCT(inPoint ,2,0,xUI.XPS.framerate);
    document.getElementById('soundOutPoint').value = nas.Frm2FCT(outPoint,2,0,xUI.XPS.framerate);
    document.getElementById('soundDuration').value = nas.Frm2FCT(duration,2,0,xUI.XPS.framerate);
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
    var targetSection = targetTrack.sections[xUI.floatSectionId];
//if(!(targetSection.value)){console.log(xUI);alert('break');}
//ターゲットセクションの値を取得して表示同期
    var inPoint  = targetSection.startOffset();
    var outPoint = inPoint + targetSection.duration - 1;
    document.getElementById('sndBody').value=targetSection.value.toString();
    document.getElementById('soundInPoint').value  = nas.Frm2FCT(inPoint ,2,0,xUI.XPS.framerate);
    document.getElementById('soundOutPoint').value = nas.Frm2FCT(outPoint,2,0,xUI.XPS.framerate);
    document.getElementById('soundDuration').value = nas.Frm2FCT(targetSection.duration,2,0,xUI.XPS.framerate);
    document.getElementById('soundLabel').value = targetSection.value.name;
    document.getElementById('soundProps').value = targetSection.value.attributes.join(",");
}
/** パネルの内容をシートに同期反映させる  値が同じプロパティはスキップ
    forceオプションが立っていたら強制的にスピン適用を行う
*/
SoundEdit.sync = function(force){
    if(xUI.edmode<2) return;//NOP
//台詞
    var targetTrack   = xUI.XPS.xpsTracks[xUI.Select[0]];
    var targetSection = targetTrack.sections[xUI.floatSectionId];
    var newContent    = new nas.AnimationDialog(targetTrack,document.getElementById('sndBody').value);newContent.parseContent();
    var minLength     = newContent.bodyText.length+newContent.comments.length;
    if ((force)||(minLength > targetSection.duration)){
        targetSection.duration = xUI.spinValue*minLength;
        document.getElementById("soundDuration").value=xUI.spinValue*minLength;
        SoundEdit.floatTC(2);
    }
    targetSection.value.contentText = newContent.contentText;
    //テキストエリアの内容が正しいコンテンツ型式であるか保証されないので注意！
    //パーサにチェック機能を設けるか  またはフィルタすること
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
    
    var myContent = targetTrack.sections.manipulateSection(
        xUI.floatSectionId,
        nas.FCT2Frm(document.getElementById('soundInPoint').value),
        nas.FCT2Frm(document.getElementById('soundDuration').value)-1
    );
    xUI.floatSectionId = xUI.XPS.xpsTracks[xUI.Select[0]].getSectionByFrame(myContent[1]).id();
    targetTrack.sectionTrust=false;
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
    すでに開いていたら最小化されていないか確認して開く  最小化もされていなければ  NOP Return
    開く際モードを確認して必要に合わせてモードを変更する
    null値セクションの場合は、選択範囲の前後にセクションノードを挿入して空の値セクションを作成して選択
    その後  mdChg(2)
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
        var myDuration=((xUI.Selection[0]==0)&&(xUI.Selection[1]>0))?parseInt(xUI.Selection[1],10):1;
//フロートセクションがないのでモード遷移をトライ
//モード遷移に失敗したら新規のセリフ(有値セクション)を作成してそれを選択する
//        if(! xUI.mdChg('section')){}
        if(false){
            xUI.selection();
            xUI.selectCell([xUI.Select[0],currentFrame-1]);
            xUI.put('----,'+(new Array(myDuration+1).join(','))+',----')
            xUI.selectCell([xUI.Select[0],currentFrame]);
            xUI.mdChg('section');
        };
    }
		this.init();
		xUI.sWitchPanel("Snd");
	}
	return null;
}
/**
 *    @params {Number} page
 *    @returns {undefined}
 *	download timesheet as png image file
 *  実験コード printモードでは正常だが編集モードではcssが異なるのでヘッダが欠ける
 *      2022 09.07
 *  ヘッダの欠落を防止するために動作時は常に PageImageモードになるようにあらかじめ調整
 *      2024 03.31
 *    ページ指定引数があれば、そのページのみを出力する
 
 */
async function sheetSaveAsPng(page,callback){
//カーソル類を非表示に
	xUI.selectionHi('clear');
	var startPg = 1;
	var endPg   = Math.ceil(XPS.duration()/xUI.PageLength);
    if((page >= startPg)&&(page <= endPg)){
        startPg = parseInt(page);
        endPg   = startPg;
    };
    var imgDensity = (xUI.sheetLooks.ExportDensity)?
        new nas.UnitResolution(xUI.sheetLooks.ExportDensity):new nas.UnitResolution(nas.RESOLUTION);
    var imgScale = imgDensity / 96;//HTML標準
//出力解像度は、事前に設定するか？
	var pgCount = endPg - startPg + 1;
	for (var Page = startPg ;Page <= endPg ;Page++){
		var pgNo = String(Page);
		var node = document.getElementById("printPg"+pgNo);
		var img_file_name = decodeURIComponent(XPS.getIdentifier('simple')) + "__xps";
		var pgRect = {width:new nas.UnitValue('297mm'),height:new nas.UnitValue('420mm')};//node.getBoundingClientRect();

		nas.HTML.setCssRule('#'+node.id,'transform:scale('+imgScale+');transform-origin:0 0;');
//ページ表示のノード背景色をバックアップして塗りつぶす
		var bkcol = node.style.backgroundColor;
		node.style.backgroundColor = document.body.style.backgroundColor;
/*
    {width:1000,height:1141,bgcolor:'red'}
    domtoimageのレンダリングオプション
    wodth,height は、クリップ領域　事前のスケーリングが必要
    bgcolor は、有効
*/
//		domtoimage.toPng(node,{})
		domtoimage.toBlob(node,{
			width :Math.round(pgRect.width.as('px')  * imgScale),
			height:Math.round(pgRect.height.as('px') * imgScale),
			bgcolor:xUI.sheetbaseColor
		}).then(async function (blob) {
            var buf = await blob.arrayBuffer();
            var meta = readMetadata(new Uint8Array(buf));
            meta["pHYs"] = { 
                "x": imgDensity * 39.37,
                "y": imgDensity * 39.37,
                "units": RESOLUTION_UNITS.METERS
            };
            meta["tEXt"] = {
                "Title":            decodeURIComponent(xUI.XPS.getIdentifier('simple')) + "__xps",
                "Author":           xUI.currentUser.toString(),
                "Description":      "Universal Animtion Timesheet exported image",
                "Copyright":        "http://www.u-at.net/",
                "Software":         "universal animation timesheet",
            };
			var newBlob = await writeMetadataB(blob,meta);
console.log( readMetadata(new Uint8Array(await newBlob.arrayBuffer())) );

			var link = document.createElement('a');
			link.download = img_file_name+'-'+pgNo+'.png';
			link.href = URL.createObjectURL(newBlob);
			link.click();
			node.style.backgroundColor = bkcol;
			nas.HTML.setCssRule('#'+node.id,'transform:none;');
		});
/* html2cavasよりもdom-to-imageのほうが安定しているので転換
		await html2canvas(
			document.getElementById("printPg"+pgNo),
			{scale:imgScale,width:1120,height:1584,backgroundColor:xUI.sheetbaseColor}
		).then(function(canvas){
			var pg = pgNo;
			document.body.appendChild(canvas);
//toBlob(callback, mimeType, qualityArgument)
			canvas.toBlob((blob)=>{
				if (XPS.duration() > xUI.PageLength){
				};
				var url = URL.createObjectURL(blob);
				var dl = document.createElement("a");
				document.body.appendChild(dl);
				dl.href = url;
				dl.download = XPS.getIdentifier('simple') + "__xps";
				if (XPS.duration() > xUI.PageLength){
					dl.download += pg;
				};
				dl.click();
				document.body.removeChild(dl);
				document.body.removeChild(canvas);
				pgCount --;
				if((pgCount <= 0)&&(callback instanceof Function)) callback();
			},"image/png");
		});// */
	};
	xUI.selectCell();
	if(callback instanceof Function) callback();
	return ;
}
//sheetSaveAsPng//
/**
 *	download timesheet as png image
 */
async function sheetSaveAsPngi(callback){
//canvasを画像として保存
	var endPg = Math.ceil(XPS.duration()/xUI.PageLength);
    var imgDensity = 200;
    var imgScale = imgDensity / 96;
    var pgCount = endPg;
	for (Page=1 ;Page <= endPg ;Page++){
//metadata
    var metadata ={
  "pHYs": { 
    "x": 30000,
    "y": 30000,
    "units": RESOLUTION_UNITS.INCHES
  },
  "tEXt": {
    "Title":            xUI.XPS.getIdentifier('simple') + "__xps",
    "Author":           xUI.currentUser.toString(),
    "Description":      "Universal Animtion Timesheet exported image",
    "Copyright":        "http://www.u-at.net/",
    "Software":         "universal animation timesheet",
  }
};//
		var pgNo = String(Page);
		await html2canvas(
			document.getElementById("printPg"+pgNo)
		).then(function(canvas){
			var pg = pgNo;
			document.body.appendChild(canvas);
//(callback, mimeType, qualityArgument)
			canvas.toBlob((blob)=>{
blob.arrayBuffer().then((buf)=>{
	var dat = new Uint8Array(buf);
//	console.log(readMetadata(dat));
			var newBlob = writeMetadataB(blob,metadata);

				var url = URL.createObjectURL(newBlob);//blob
				var dl = document.createElement("a");
				document.body.appendChild(dl);
				dl.href = url;
				dl.download = XPS.getIdentifier('simple') + "__xps";
				if (XPS.duration() > xUI.PageLength) dl.download += pg;
				dl.click();
				document.body.removeChild(dl);
				document.body.removeChild(canvas);
				pgCount --;
				if((pgCount <= 0)&&(callback instanceof Function)) callback();
});
//				const item= new ClipboardItem({"image/png": blob});
//				navigator.clipboard.write([item]);
			},"image/png");
		});
	};
}
//sheetSaveAsPng Alt(test)//

/**
 * 画像保存のためのタイムシートの変形と解除
 *   @params {Boolean} opt
 *   @params {Number}  heightOffset
 * 印刷及び画像出力のためにページ画面をA3サイズ以下に整形する
 * 解除までの間は編集をロックする
 * セレクト・フットスタンプ等のハイライト類は非表示に
 * 縦方向の変形オフセット量は pix/(96ppi)で指定する
 */
//アプリケーションヘッダエリアはもとより印刷されないか出力範囲に含まれないので操作範囲外
function adjustSheetA3(opt,heightOffset){
    if(! heightOffset) heightOffset = 48;//pixels (96ppi 1/2in)
/*
//ページステータス	printPageStatus ON|OFF
	var stats = document.getElementsByClassName("printPageStatus");
	for( var i = 0; i<stats.length; i++ ) stats[i].style.display = (opt)? 'block':'none';
//シートヘッダ		sheetHeader pgHeader ON|OFF
	var pgheaders = document.getElementsByClassName("headerArea");
	for( var i = 0; i<pgheaders.length; i++ ) pgheaders[i].style.display = (opt)? 'block':'none';
//ページノンブル	pgnm OFF|ON
	var pgnm = document.getElementsByClassName("pgNm");
	for( var i = 0; i<pgnm.length; i++ ) pgnm[i].style.display = (opt)? 'none':'inline';
// */
//現在のシート記述範囲を取得
	var pgRect         = document.getElementById("printPg1").getBoundingClientRect();
	var sheetTableRect = document.getElementsByClassName("qdr4")[0].getBoundingClientRect();

//	var headerRect = document.getElementsByClassName("headerArea")[0].getBoundingClientRect();
//	var tableRect  = document.getElementsByClassName("sheet")[0].getBoundingClientRect();
	var baseWidth  = pgRect.width;//ページ幅
	var baseHeight = 1584;//A3height.96ppi.8px/unit
	var xScale = 1; var yScale = 1;
//	(baseHeight-headerRect.height - heightOffset)/tableRect.height
	if(opt){
//シート記述範囲に用紙合わせの変形を適用
		if(pgRect.width < sheetTableRect.width){
			xScale = pgRect.width/sheetTableRect.width;
		};
		if(pgRect.height < sheetTableRect.width){
			yScale = pgRect.height/sheetTableRect.height;
		};
		
		$(".sheetArea").css({"transform":"scale("+[xScale,yScale].join()+")","transform-origin":"0 0"});
		$(".printPage").css({"height":baseHeight,"width":baseWidth});
//フットスタンプを消去・ハイライトを隠蔽
		xUI.selectBackup = xUI.Select;
		xUI.selectionHi('clear');
		document.getElementById(xUI.Select.join('_')).style.backgroundColor = 'transparent';
	}else{
//変形解除
		$(".sheetArea").css({"transform":"scale("+[1,1].join()+")","transform-origin":"0 0"});
//ハイライトを再表示
		xUI.selectCell();
	};
}
/* TEST
adjustSheetA3(true);
adjustSheetA3(false);
*/
/*
    xUI.SignBoxパネル機能オブジェクト
    signatureオブジェクトを作成して返す
    シグネチャオブジェクトは、生成ごとのuuidを持つ
    user 
    uuid
    date
    text
    label
 */
SignBox = {
    stampText:"%user%",
    stampNames:['%user%','監督','演出','作監','総作監','動検','仕検','特効','撮影'],
    stampPicture:"fixed",
    stampPictures:['%user%','=済=','=OK=','=NG='],
    stampColor:"#ff4444",
    stampColors:["#888888","#ff4444","#22CC22","#8888ff"]
};
SignBox.init = function init(name){
    document.getElementById('sigStage').innerText = nas.pmdb.stages.entry(xUI.XPS.stage.name).shortName;
    document.getElementById('sigLabel').value = (this.stampText == '%user%')?
    xUI.currentUser.handle:this.stampText;
    document.getElementById('sigDate').value  = new Date().toNASString('mm/dd');

};

SignBox.update = function init(name){
    this.stampText    = document.getElementById('sigLabel').value;
    this.stampPicture = '';
    document.getElementById('signature').innerText = "[" + 
        document.getElementById('sigLabel').value + " " +
        document.getElementById('sigDate').value  + "]";

};

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
console.log('+++++++++LOADED remaping JS')