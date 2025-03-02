/*(仮設版XPSリンカ)
 *
 *	Nekomataya/kiyo	2005.11.15
 *		XPSシートをAEコンポジションに適用します。
 *		暫定試験版です。
 *	部分調整 : *.ard(AE-Remap) *.tsh(T-sheet) 暫定対応しました [読み込みのみ]2006.05.11
 *	バグ(Macのみedittextの不備) 対応
 *	AE7でAERemapのシートが読み込めなかったバグに対処 2006/11/12
 *		読み込み障害の対応版(検出のみ)
 *	AE CS3 カラセル処理時にエラー停止する現象に対処	2009/08/21
 * 	自動セルの推測部分をレタスのセルに仮対応	2009/08/21
 *	既存のXPSオブジェクトがあれば再初期化しないように変更
 *	プロジェクト内のタイムシートの読み書きに部分対応
 *	（明示的にタイムラインのないレイヤに対する仮タイムラインを実装）
 *	シートをプロジェクト内に保存する機能を実装中なのでイロイロ機能追加中　2009/10/10
 */
//	モジュール情報設定
var myFilename=("$RCSfile: easyXPSLink.jsx,v $").split(":")[1].split(",")[0];
var myFilerevision=("$Revision: 1.1.2.9 $").split(":")[1].split("$")[0];
var exFlag=true;
var moduleName="easyXPS";//モジュール名で置き換えてください。
			if(false){
//二重初期化防止トラップ
try{
	if(nas.Version)
	{	nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
	
		try{
if(nas[moduleName]){
	nas[moduleName].show();
	exFlag=false;
}else{
nas[moduleName]=new Object();
}
		}catch(err){
nas[moduleName]=new Object();}
	}
}catch(err){
	alert("nasライブラリが必要です。\nnasStartup.jsx を実行してください。");
	exFlag=false;
}
			}else{
//デバッグ中は二重起動防止トラップは邪魔なのでパス。フィックスした時は入れ換え
nas.Version[moduleName]=moduleName+" :"+myFilename+" :"+myFilerevision;
nas[moduleName]=new Object();
			}
if(exFlag){
/*
	edittextに初期状態で256バイトでペーストや手入力が打ち止めになる現象がある。
	スクリプトでのデータ追加を行うと動的にメモリが確保されているようなので、
	これは、edittextに無理やり空白を追加してフラッシュするメソッド。
	このバグが解消したら不要。	引数はループ回数。1回アタリ1kb
*/

//代用マップ初期化
//var MAP=new Object();
//alert(MAP.toSource().length);
var MAP=new Map(3);
//alert(MAP.toSource().length);

/*
	仮モジュール初期化
 */

//	alert(MAP.toSource());
//XPS初期化
//	りまぴん互換用ダミーオブジェクト
var MSIE=false;
var xUI=new Array();
	xUI.blmtd=BlankMethod;
	xUI.blpos=BlankPosition;
	xUI.timeShift=TimeShift;
	xUI.keyMethod=KEYMethod;
	xUI.aeVersion=AEVersion;
	xUI.fpsF=FootageFramerate;
	xUI.Selection=[0,0];
	xUI.spinValue=3;
	xUI.Select=[1,0];
	xUI.spin=function(sv){this.spinValue=(isNaN(sv))?this.spinValue:sv;};
//	xUI.put=function(stream){alert("put :"+ stream);};
	xUI.put=function(stream){
		for(lyrs=0;lyrs<stream.split("\n").length;lyrs++)
		{
			kyLyr=stream.split("\n")[lyrs].split(",");
			for(frms=0;frms<kyLyr.length;frms++)
			{
				if(lyrs<XPS.xpsBody.length && frms < XPS[0].length)
				{
					XPS[lyrs+1][frms]=kyLyr[frms];
				}
			}
		}
	};

/*
	xUI.=;
	xUI.=;
	xUI.=;
	xUI.=;
*/
//	var XPS=new Object();
//	XPS=new_XPS(SheetLayers,nas.FCT2Frm(Sheet));
//	MAP=new Map(SheetLayers);
//var XPS=new Xps(SheetLayers,nas.FCT2Frm(Sheet));
/*	立ち上げ時にXPSオブジェクトがすでに存在する場合は、そのデータを引き継ぐのでここでの初期化は不要
	プロジェクトのＸＰＳバッファはnas立ち上げ時に初期化するのが望ましいと思うよ
 */
try{var myXPS=XPS}catch(err){
	XPS=new Xps(SheetLayers,nas.FCT2Frm(Sheet));
}
//	ダミーマップを与えて情報取り込み

//XPS.getMap(MAP);


//コントロール上のXPSデータをXPSオブジェクトに展開 展開後に再書き出し

function updateXPS(){
XPSbody=nas.easyXPS.sheetView.text.replace(/(\r\n?|\n)/g,"\n");
	if(XPS.readIN(XPSbody)){
		nas.easyXPS.sheetView.clear();
//読み込み成功した場合だけコントロールをクリア(いただきます)
		return true;
	}else{
		return false;
	}
}
function updateControl()
{
//メモリ上のXPSデータを文字列でコントロールに反映

/*	表示をシートサマリーに変更(仮)
	if(isWindows){
nas.easyXPS.sheetView.text=XPS.toString().replace(/(\r\n?|\n)/g,nas.GUI.LineFeed);
	}else{
nas.easyXPS.sheetView.text=XPS.toString(";").replace(/(\r\n?|\n)/g,nas.GUI.LineFeed);
	}
*/
//var XPSSummary="nasTIME-SHEET 0.4"+nas.GUI.LineFeed;
var XPSSummary="#--- nas.XPSSummary (for TEST) ---#"+nas.GUI.LineFeed;
if(true)
{
XPSSummary+="TITLE\t:"+XPS.title+"\tOPUS\t:"+XPS.opus+nas.GUI.LineFeed;
XPSSummary+="SUB_TITLE\t:"+XPS.subtitle+nas.GUI.LineFeed;
XPSSummary+="SCENE/CUT\t:"+XPS.scene+"\t/\t"+XPS.cut+nas.GUI.LineFeed;
XPSSummary+="TIME\t:(\t"+XPS.getTC(XPS.time())+"\t)"+nas.GUI.LineFeed;
XPSSummary+="TRIN\t:"+XPS.trin.toString()+"\t/TROUT\t:"+XPS.trout.toString()+nas.GUI.LineFeed;
XPSSummary+="FRAME_RATE\t:"+XPS.framerate+" fps"+nas.GUI.LineFeed;
XPSSummary+="CREATE_USER\t:"+XPS.create_user+nas.GUI.LineFeed;
//XPSSummary+="UPDATE_USER\t:"+XPS.update_user+nas.GUI.LineFeed;
XPSSummary+="CREATE_TIME\t:"+XPS.create_time;
//XPSSummary+="UPDATE_TIME\t:"+XPS.update_time+nas.GUI.LineFeed;
//	レイヤ別プロパティをストリームに追加
	var Lprops=["option","link","name"];
	for (prop in Lprops)
	{
		var propName=Lprops[prop];
		var lineHeader=(propName=="name")? 
		nas.GUI.LineFeed+'[CELL\tN' : nas.GUI.LineFeed+'[' + propName + '\t';
		XPSSummary+=lineHeader;
	for (id=0;id<XPS.layers.length;id++)
	{
		XPSSummary+="\t"+XPS["layers"][id][propName];
	}
	XPSSummary+='\t]';//
		}
XPSSummary+="=============================================== memo:"+nas.GUI.LineFeed;
XPSSummary+=XPS.memo.replace(/(\r\n?|\n)/g,nas.GUI.LineFeed);
}else{
XPSSummary+="##MAPPING_FILE="+XPS.mapfilr+nas.GUI.LineFeed;
XPSSummary+="##TITLE="+XPS.title+nas.GUI.LineFeed;
XPSSummary+="##SUB_TITLE="+XPS.subtitle+nas.GUI.LineFeed;
XPSSummary+="##OPUS="+XPS.opus+nas.GUI.LineFeed;
XPSSummary+="##SCENE="+XPS.scene+nas.GUI.LineFeed;
XPSSummary+="##CUT=" +XPS.cut+nas.GUI.LineFeed;
XPSSummary+="##TIME="+XPS.getTC(XPS.time())+nas.GUI.LineFeed;
XPSSummary+="##TRIN="+XPS.trin.toString()+nas.GUI.LineFeed;
XPSSummary+="##TROUT="+XPS.trout.toString()+nas.GUI.LineFeed;
XPSSummary+="##CREATE_USER="+XPS.create_user+nas.GUI.LineFeed;
XPSSummary+="##UPDATE_USER="+XPS.update_user+nas.GUI.LineFeed;
XPSSummary+="##CREATE_TIME="+XPS.create_time+nas.GUI.LineFeed;
XPSSummary+="##UPDATE_TIME="+XPS.update_time+nas.GUI.LineFeed;
XPSSummary+="##FRAME_RATE="+XPS.framerate+nas.GUI.LineFeed;
	XPSSummary+="####################################"
//	レイヤ別プロパティをストリームに追加
	var Lprops=["sizeX","sizeY","aspect","lot","blmtd","blpos","option","link","name"];
	for (prop in Lprops)
	{
		var propName=Lprops[prop];
		var lineHeader=(propName=="name")? 
		nas.GUI.LineFeed+'[CELL\tN' : nas.GUI.LineFeed+'[' + propName + '\t';
		XPSSummary+=lineHeader;
	for (id=0;id<XPS.layers.length;id++)
	{
		XPSSummary+="\t"+XPS["layers"][id][propName];
	}
	XPSSummary+='\t]';//
		}
XPSSummary+=nas.GUI.LineFeed+"[END]"+nas.GUI.LineFeed;
XPSSummary+=XPS.memo.replace(/(\r\n?|\n)/g,nas.GUI.LineFeed);
}
nas.easyXPS.sheetView.text=XPSSummary;

	nas.easyXPS.sheetView.chgFlag=false;

//edFlag=(nas.easyXPS.sheetView.chgFlag)?"◎":"　";//"\["+edFlag+"\] : "+
//nas.easyXPS.XPSTLSelector.text=[XPS.title,XPS.opus,XPS.subtitle,XPS.scene,XPS.cut].join("/");//ボタン書換え
//nas.easyXPS.XPSTLSelector.enabled=(nas.easyXPS.sheetView.chgFlag)?true:false;
nas.easyXPS.updateButton.text=[XPS.scene,XPS.cut].join("_");//ボタン書換え
nas.easyXPS.updateButton.enabled=(nas.easyXPS.sheetView.chgFlag)?true:false;
//セレクタの配列書き換え。
var newOptions=new Array();
newOptions.push("<no-select>");
newOptions.push("[BG/BOOK]");
for (idx=0;idx<XPS.layers.length;idx++){newOptions.push(XPS.layers[idx].name);};
	for (idx=0;idx<5;idx++){
	nas.easyXPS.LayerLink[idx].Button.text="<no-select>";
	nas.easyXPS.LayerLink[idx].Button.options=newOptions;
	}
}
//リンク先自動判定
function guessLink(string)
{if(XPS.layers.length){
//BG/LO/をスキップ
	if(string.match(/(^[-_].*|bg|lo|book)/i)){return 1;}

//検査(完全一致はやめた　冒頭一致で後ろの文字列は主に数値として許容)
	for (Xid=0;Xid<XPS.layers.length;Xid++){
		var Label=new RegExp("^"+XPS.layers[Xid].name+".*$","i");
	if(string.match(Label)){return(Xid+2);}
	}
	return 0;
}else{return 0;}}
//レイヤリンク
function goLink()
{
//操作対象コンポがないときはリターン
	if(nas.easyXPS.compSelector.selected<=0){return false;};
//操作対象コンポ取得
		var selectedCompId=nas.easyXPS.compSelector.value.match(/\[\s(\d+)\s\]/)[1]*1;
		var activeComp=app.project.items[selectedCompId];
		var activeLayerLot=activeComp.layers.length;
//	var activeComp=thisProject.composition[nas.easyXPS.compSelector.selected-1];

//コンポ操作系
//undoブロック開始
	nas.otome.beginUndoGroup("シート適用");
//ターゲットコンポのフレームレートがXPSと食い違っていたら警告してシートにあわせる。
	if((1/activeComp.frameDuration)!=XPS.framerate){if(confirm("コンポとタイムシートのフレームレートが違います。\コンポのフレームレートを変更します。\n処理を続行しますか。"))
{activeComp.frameDuration=(1/XPS.framerate);}else{return;}}

//ターゲットコンポがXPSの尺に満たない場合、XPSのサイズまで拡張する。ボールドや予備コマは、設定しだい。このあたりは仕様固めて要調整
	if((activeComp.duration/activeComp.frameDuration)<XPS.duration())
{
//ここから先の操作はundoブロックにすること。
//undoブロック開始	app.beginUndoGroup("コンポ尺調整");
		activeComp.setFrames(XPS.duration());//拡張メソッドで処理

//undoブロック終了	app.endUndoGroup();
}
//	レイヤ毎に処理
	for(var idx=0;idx<activeLayerLot;idx++){
//処理指定のないレイヤをパス
if((nas.easyXPS.lyrSelector.Links[idx]==0) && (! activeComp.layer(idx+1).name.match(/(bg|book|lo)/i) ) ){continue}
if( nas.easyXPS.lyrSelector.Links[idx]==0){continue};
if( nas.easyXPS.lyrSelector.Links[idx]==1){
	var TargetLayer=activeComp.layer(idx+1)
	if (TargetLayer.source.duration==0){continue};//タイムリマップできないレイヤをパス
//キーリマップが現在あるなら一端消去
	if(TargetLayer.timeRemapEnabled) {TargetLayer.timeRemapEnabled=false;};
	TargetLayer.timeRemapEnabled=true;//その後再度有効化
//	キーの値はそのままでin/out ポイント調整
	if(TargetLayer.inPoint != 0)
	{	TargetLayer.inPoint=0 ;};
	if(TargetLayer.outPoint<activeComp.duration)
	{	TargetLayer.outPoint=activeComp.duration ;};
//	最初のキーを残して他のキーを削除
if(TargetLayer.property("ADBE Time Remapping").numKeys>1)
{for (var kId=TargetLayer.property("ADBE Time Remapping").numKeys;kId>1;kId--){TargetLayer.property("ADBE Time Remapping").removeKey(kId);}
	}
	continue;
	};//このケースは特別にタイムリマップだけを生成してフッテージ長の調整をする（別ライン）
//	if( activeComp.layer(idx+1)){continue};
//	有効処理レイヤ操作undoブロック
// undoText=(nas.easyXPS.lyrSelector.Links[idx]!=0)?
//XPS.layers[nas.easyXPS.lyrSelector.Links[idx]-1].name+"セル キー設定":"静止画レイヤ調整";
//	app.beginUndoGroup(undoText);

//静止画フッテージと平面以外をレイヤ処理(リマップ)
if(! isStill(activeComp.layer(idx+1))){
//	linkXPSToAE([nas.easyXPS.lyrSelector.Links[idx]-1,activeComp.layer(idx+1)]);
	linkXPSToAE([nas.easyXPS.lyrSelector.Links[idx]-2,activeComp.layer(idx+1)]);
}
//	in/out ポイント調整
	if(activeComp.layer(idx+1).inPoint != 0)
	{	activeComp.layer(idx+1).inPoint=0 ;};
	if(activeComp.layer(idx+1).outPoint<activeComp.duration)
	{	activeComp.layer(idx+1).outPoint=activeComp.duration ;};

//	レイヤ操作undoブロック終了(まとめるために保留) app.endUndoGroup();
	}
//undoブロック終了
	nas.otome.endUndoGroup();
}
/*
乙女専用AEキー生成関数
与える引数は、[XPS側レイヤID,コンポ側レイヤID]
戻り値は ブーリアン で機能成功時にtrue 処理に問題があった場合 false
*/
function linkXPSToAE(tArget)
{
var XPSLyrID=tArget[0];
var TargetLayer=tArget[1];
//alert(XPS.layers[XPSLyrID].name+" / "+TargetLayer.name);//後でステータス表示へ移動
//return;
//将来、データツリー構造が拡張された場合、機能開始時点でツリーの仮構築必須
//現在は、決め打ち
//内部処理に必要な環境を作成
//alert([XPSLyrID]+":"+XPS.layers[XPSLyrID].name)
var	layerDataArray	=XPS.xpsBody[XPSLyrID+1];
		layerDataArray.label=XPS.layers[XPSLyrID].name;
var	blank_method	=XPS.layers[XPSLyrID].blmtd;
var	blank_pos	=XPS.layers[XPSLyrID].blpos;
var	key_method	=xUI.keyMethod;
var	key_max_lot	=(isNaN(XPS.layers[XPSLyrID].lot))?
			0 : XPS.layers[XPSLyrID].lot;

var	bflag=(blank_pos)? false : true ;//ブランク処理フラグ
//
//
var	AE_version	=xUI.aeVersion;
var	compFramerate	=XPS.framerate;
var	footageFramerate=xUI.fpsF;
	if(isNaN(footageFramerate)){footageFramerate=compFramerate}
var	sizeX	=XPS.layers[XPSLyrID].sizeX;
var	sizeY	=XPS.layers[XPSLyrID].sizeY;
var	aspect	=XPS.layers[XPSLyrID].aspect;
//alert("カラセル方式は :"+blank_method+"\n フーテージのフレームレートは :"+footageFramerate);

	var layer_max_lot=0;//レイヤロット変数の初期化

//前処理 シート配列からキー変換前にフルフレーム有効データの配列を作る
//全フレーム分のバッファ配列を作る
	var bufDataArray=new Array(layerDataArray.length);
//キースタック配列を宣言
	var keyStackArray=new Array;//キースタックは可変長
	keyStackArray["remap"]= new Array();
	keyStackArray["blank"]= new Array();
		//ふたつ リマップキー/ブランクキー 用
//第一フレーム評価・エントリが無効な場合空フレームを設定
	bufDataArray[0]= (dataCheck(layerDataArray[0],layerDataArray.label,bflag))?
	dataCheck(layerDataArray[0],layerDataArray.label,bflag):"blank";

//2?ラストフレームループ
	for (f=1;f<layerDataArray.length;f++){
//有効データを判定して無効データエントリを直前のコピーで埋める
	bufDataArray[f]=(dataCheck(layerDataArray[f],layerDataArray.label,bflag))?
	dataCheck(layerDataArray[f],layerDataArray.label,bflag):bufDataArray[f-1];

		if (bufDataArray[f]!="blank")
		{
			layer_max_lot=(layer_max_lot>bufDataArray[f]) ?
			layer_max_lot : bufDataArray[f] ;
		}
	}
	max_lot = (layer_max_lot>key_max_lot)?
	layer_max_lot:key_max_lot;

//あらかじめ与えられた最大ロット変数と有効データ中の最大の値を比較して
//大きいほうをとる
//ここで、layer_max_lot が 0 であった場合変換すべきデータが無いので処理中断

	if(layer_max_lot==0){
	return "変換すべきデータがありません。\n処理を中断します。";
	}

//前処理第二 (配列には、キーを作成するフレームを積む)

	keyStackArray["remap"].push(0);
	keyStackArray["blank"].push(0);//最初のフレームには無条件でキーを作成

//有効データで埋まった配列を再評価(2?ラスト)
	for (f=1;f<bufDataArray.length;f++){
//キーオプションにしたがって以下の評価でキー配列にスタック(フレームのみ)
switch (key_method){
case	"opt"	:	//	最適化キー(変化点の前後にキー)
			//	○前データと同じで、かつ後ろのデータと
			//	同一のエントリをスキップ
	if (bufDataArray[f]!=bufDataArray[f-1] || bufDataArray[f]!=bufDataArray[f+1])
	{keyStackArray["remap"].push(f)}
	break;
case	"min"	:	//	最少キー(変化点の前後にキー)
			//	○前データと同じエントリをスキップ
	if (bufDataArray[f]!=bufDataArray[f-1])
	{keyStackArray["remap"].push(f)}
	break;
case	"max"	:	//	全フレームキー(スキップ無し)
default:
	keyStackArray["remap"].push(f);
}	
//ブランクメソッドにしたがってブランクキーをスタック(フレームのみ)
	var prevalue	=(bufDataArray[f-1]	=="blank")?	"blank":"cell";
	var currentvalue=(bufDataArray[f]	=="blank")?	"blank":"cell";
	var postvalue	=(bufDataArray[f+1]	=="blank")?	"blank":"cell";
switch (key_method){
case	"opt"	:	//	最適化キー(変化点の前後にキー)
	if (currentvalue!=prevalue || currentvalue!=postvalue)
	{keyStackArray["blank"].push(f)}
	break;
case	"min"	:	//	最少キー(変化点の前後にキー)
	if (currentvalue!=prevalue)
	{keyStackArray["blank"].push(f)}
	break;
case	"max"	:	//	全フレームキー(スキップ無し)
default:
	keyStackArray["blank"].push(f);
}	
	}

//レイヤ操作系　undoブロックは、一階層上で処理済
//キー文字列を作成
//blankoffsetは、カラセル挿入によるタイミングの遷移量・冒頭挿入以外は基本的に0
switch (blank_pos){
case	"first"	:var blankoffset=1;break;
case	"end"	:var blankoffset=0;break;
case	"none"	:var blankoffset=0;break;
default	:var blankoffset=0;
}
var footage_frame_duration=(1/footageFramerate);
//var TargetLayer=thisProject.composition(nas.easyXPS.compSelector.selected).layer(COMPLyrID)
//	タイムリマップがすでに存在する場合、全消去
if(TargetLayer.timeRemapEnabled) {TargetLayer.timeRemapEnabled=false;};
//	リマップキーを作成/適用
if(blank_method !="expression1"){
	for (n=0;n<keyStackArray["remap"].length;n++)
	{
	if(bufDataArray[keyStackArray["remap"][n]]=="blank")
	{	var seedValue=(blank_pos=="first")? 1 : max_lot+1 ;
	}else{	var seedValue=bufDataArray[keyStackArray["remap"][n]]*1 + blankoffset;
	}
	var Fr=keyStackArray["remap"][n]/XPS.framerate;
if(	blank_method=="expression2" && 
	bufDataArray[keyStackArray["remap"][n]]=="blank"){
//エクスプレッション2のカラ
	var Vl=999999;
}else{
//通常処理
	var Vl=(seedValue-0.5)*footage_frame_duration;
}
if(! TargetLayer.timeRemapEnabled) {TargetLayer.timeRemapEnabled=true;};
	var kid=TargetLayer.property("ADBE Time Remapping").addKey(Fr);
if (Vl>TargetLayer.source.duration){Vl=TargetLayer.source.duration;};
	TargetLayer.property("ADBE Time Remapping").setValueAtKey(kid,Vl);
if(kid==1 && TargetLayer.property("ADBE Time Remapping").numKeys>1)
{
	for(i=2;i<=TargetLayer.property("ADBE Time Remapping").numKeys;i++)
	{	TargetLayer.property("ADBE Time Remapping").removeKey(i);	};
};
	TargetLayer.property("ADBE Time Remapping").setInterpolationTypeAtKey(kid,KeyframeInterpolationType.HOLD);
	}
}

//	エクスプレッション型
//var expBody='スライダ\tスライダ制御\tEffect\ Parameter\ #1\t\n\tFrame\t\t\n';
if(blank_method =="expression1"){
var timingTimeLine=TargetLayer.property("ADBE Effect Parade").addProperty("ADBE Slider Control")
	timingTimeLine.name="XPS_data";
	timingTimeLine("ADBE Slider Control-0001").expression="//expression-TEST";

	for (n=0;n<keyStackArray["remap"].length;n++)
	{
		Fr=keyStackArray["remap"][n]/XPS.framerate;
		if (bufDataArray[keyStackArray["remap"][n]]=="blank")
		{
			Vl=0;
		}else{
			Vl=(bufDataArray[keyStackArray["remap"][n]]);
		}
	var kid=timingTimeLine("ADBE Slider Control-0001").addKey(Fr);
	timingTimeLine("ADBE Slider Control-0001").setValueAtKey(kid,Vl);

if(kid==1 && timingTimeLine.numKeys>1)
{for(i=2;i<=timingTimeLine("ADBE Slider Control-0001").numKeys;i++){timingTimeLine("ADBE Slider Control-0001").removeKey(i);}};
	timingTimeLine("ADBE Slider Control-0001").setInterpolationTypeAtKey(kid,KeyframeInterpolationType.HOLD);
	}
}

//	ブランクキーを作成
//	エクスプレッション型/ブランクセル無し の場合は不要
if(blank_method !="expression1" && blank_pos!="none"){
switch(blank_method){
case "opacity":
//不透明度
	var blank_='0';
	var cell_='100';
//やはりこの処理は、ちと無理が
	break;
case "wipe":
//ワイプ
	var blank_='100';
	var cell_='0';
// ブランクタイムラインがすでにあるか否か確認
if(TargetLayer.property("ADBE Effect Parade")("blankTimeLine")){
// すでにある場合、既存タイムラインを削除。
TargetLayer.property("ADBE Effect Parade")("blankTimeLine").remove();
//この処理は、アマアマなので、あとで確定処理に要変更 1/10
}
// ブランク新作
var blankTimeLine=TargetLayer.property("ADBE Effect Parade").addProperty("ADBE Linear Wipe");
	blankTimeLine.name="blankTimeLine";
	blankTimeLine("ADBE Linear Wipe-0001").expression="//--otomeBlankEffecte--\neffect(\"blankTimeLine\")(1);";
	blankTimeLine("ADBE Linear Wipe-0001").expressionEnabled=false;
break;
}
	for (n=0;n<keyStackArray["blank"].length;n++)
	{
		if(bufDataArray[keyStackArray["blank"][n]]=="blank")
		{Vl=blank_}else{Vl=cell_};
	Fr=keyStackArray["blank"][n]/XPS.framerate;
		switch(blank_method){
case "opacity":
var kid=TargetLayer.property("ADBE Opacity").addKey(Fr);
	TargetLayer.property("ADBE Opacity").setValueAtKey(kid,Vl);
if(kid==1 && TargetLayer.property("ADBE Opacity").numKeys>1){for(i=2;i<=TargetLayer.property("ADBE Opacity").numKeys;i++){TargetLayer.property("ADBE Opacity").removeKey(i);}};
TargetLayer.property("ADBE Opacity").setInterpolationTypeAtKey(kid,KeyframeInterpolationType.HOLD);
	break;
case "wipe":
var kid=blankTimeLine("ADBE Linear Wipe-0001").addKey(Fr);
	blankTimeLine("ADBE Linear Wipe-0001").setValueAtKey(kid,Vl);
if(kid==1 && blankTimeLine("ADBE Linear Wipe-0001").numKeys>1){for(i=2;i<=blankTimeLine("ADBE Linear Wipe-0001").numKeys;i++){blankTimeLine("ADBE Linear Wipe-0001").removeKey(i);}};
blankTimeLine("ADBE Linear Wipe-0001").setInterpolationTypeAtKey(kid,KeyframeInterpolationType.HOLD);
		}
	}
}
if(false){
//出力
if (blank_method !="expression1")
{
	if (blank_method =="opacity")
	{
//		ブランク
		Result += blankBody;
	}
//	リマップ
	Result += remapBody;
	if (blank_method =="wipe")
	{
//		ブランク
		Result += blankBody;
	}
//
} else {
//エクスプレッション1
	Result += expBody;}
}
//return Result
return true;
}


//ファイルからシート読み込み()
function getSheet(sheetFile)
{
	var myContent="";
	if(sheetFile){
		var myOpenfile = new File(sheetFile.fsName);
		myOpenfile.encoding="UTF8";
		myOpenfile.open("r");
		myContent = myOpenfile.read();
//		alert(myContent);
		if(myContent.length==0){alert("Zero Length!");}
		myOpenfile.close();

			if(XPS.readIN(myContent)){return true;
		}else{alert(XPS.errorMsg[XPS.errorCode]);return false;};

	}else{
		if(isWindows)
		{
			var mySheetFile = File.openDialog("読み込むタイムシートを選んでください","timeSheetFile(*.xps;*.ard;*.tsh;*.sts):*.XPS;*.ard;*.tsh;*.sts");
		}else{
			var mySheetFile = File.openDialog("読み込むタイムシートを選んでください","");
		}
		if (! mySheetFile){return false;};
		if (mySheetFile.name.match(/^[a-z_\-\#0-9]+\.(xps|ard|tsh|sts)$/i))
		{
			var myOpenfile = new File(mySheetFile.fsName);
			myOpenfile.open("r");
			if (mySheetFile.name.match(/\.sts$/i))
			{
				myContent = STS2XPS(myOpenfile).replace(/(\r\n?|\n)/g,"\n");
			}else{
				myOpenfile.encoding="UTF8";
				myContent = myOpenfile.read();
			}
			myOpenfile.close();
			if(XPS.readIN(myContent))
			{
				if(! isNaN(nas.XPSStore.getLength())){
					nas.XPSStore.select(0)
				}
				updateControl();
				nas.easyXPS.XPSTLSelector.init();
			}else{
				alert(XPS.errorMsg[XPS.errorCode]);
			};
	return true;
		}else {
	alert("タイムシートファイルを選択してください。")
	return false;
		};
	}
}

//シート書き出し
function saveSheet()
{
if (! nas.easyXPS.sheetView.text){alert("保存するデータがありません");return false;}
if(isWindows)
{
	var mySavefile = File.saveDialog("書き出しのファイル名を指定してください","nasXPSheet(*.xps):*.XPS");
}else{
	var mySavefile = File.saveDialog("書き出しのファイル名を指定してください","");
}
if(! mySavefile){return};
if(mySavefile.exists)
{
if(! confirm("同名のファイルがすでにあります.\n上書きしてよろしいですか?")){return false;};
}

if (mySavefile && mySavefile.name.match(/^[a-z_\-\#0-9]+\.xps$/i)){
var myOpenfile = new File(mySavefile.fsName);
	myOpenfile.open("w");
	myOpenfile.write(XPS.toString());
//	myOpenfile.write(nas.easyXPS.sheetView.text);
	myOpenfile.close();
}else {
	alert("タイムシートファイルを選択してください。")
	return false;
};
}
//プロジェクトからシート読み込み()
function popSheet()
{
	if(nas.XPSStore.getLength())
		{
			if(! nas.XPSStore.toString()){nas.XPSStore.setBody();}
			if(confirm ("XPSStoreからシートを取得します")){var myIndex=nas.XPSStore.pop();nas.otome.writeConsole("poped XPSStore:"+myIndex+" : "+nas.XPSStore.selected.name)};
			return;
		}
if(false){
//暫定　あとで乙女のタイムシートフォルダをオブジェクト化する
if(
(app.project.items.getByName(nas.ftgFolders.ftgBase[0])) &&
(app.project.items.getByName(nas.ftgFolders.ftgBase[0]).items.getByName(nas.ftgFolders.etc[0]))
){
var myTimesheetStore=app.project.items.getByName(nas.ftgFolders.ftgBase[0]).items.getByName(nas.ftgFolders.etc[0]).items.getByName(nas.sheetBinder);

alert(myTimesheetStore.name);
}
if((!(myTimesheetStore))||(! (myTimesheetStore instanceof CompItem))){alert("no timesheet");return;}
//ループで読み出し　エントリがなければ何もしない
var tsIdx=1;
	var myContent=myTimesheetStore.layers[tsIdx].sourceText.value.text.replace(/\\r\\n/g,"\n");
		if(myContent.length==0){alert("Zero Length!");}

		if(XPS.readIN(myContent)){updateControl();return true;
		}else{alert(XPS.errorMsg[XPS.errorCode]);return false;};
}
}

//プロジェクトにシート書き出し
function pushSheet()
{
	if(! isNaN(nas.XPSStore.getLength()))
	{
		if(! nas.XPSStore.toString()){nas.XPSStore.setBody();}
		if(confirm ("XPSStoreにシートを(書戻)保存します\n変更がなければ何もしません")){nas.XPSStore.push();}
		return;
	}
if(false)
{
	if(
(app.project.items.getByName(nas.ftgFolders.ftgBase[0])) &&
(app.project.items.getByName(nas.ftgFolders.ftgBase[0]).items.getByName(nas.ftgFolders.etc[0]))
){
var myTimesheetStore=app.project.items.getByName(nas.ftgFolders.ftgBase[0]).items.getByName(nas.ftgFolders.etc[0]).items.getByName("[timeSsheetBinder]")
}
if(isNaN(nas.XPSStore.getLength())){alert("no timesheetStore");return;}

if(! nas.XPSStore.body){alert("no timesheetStore");return;}

if (! nas.easyXPS.sheetView.text){alert("保存するデータがありません");return false;}
var storeName=[XPS.scene,XPS.cut].join("_");//
var myContent=XPS.toString();

// myTimesheetStore.layer(1).sourceText.setValue(new TextDocument(myContent.replace(/\n/g,"\\r\\n")));
nas.XPSStore.set(myContent);
//プロパティ転記
// この場合はXPSオブジェクトのプロパティから生成する必要あり？
// ファイルのプロパティと混同しないよう注意
// 名前の自動生成必要　シーンカット番号を使って生成すること
// 最終変更時はtoSTring()が生成するので任せる
//　レイヤ的には記録時を設定?
// データ長は識別のため特定値を使う null か　undf
					var newProp="{";
					newProp+="\"name\" :\""+storeName +"\",";
					newProp+="\"modified\" :\""+new Date().toNASString() +"\",";
					newProp+="\"length\" :\"=="+myContent.length +"==\"}";
//					myXpsStore.layers[fIdx].comment=newProp;
			nas.XPSStore.setProp(newProp);
//レイヤ名を識別子で置き換え
//					myXpsStore.layers[fIdx].name=targetFile.name;
			nas.XPSStore.setName(targetFile.name)
}
}
/*
 *	現在編集中のプロジェクトをスキャンして
 *	必要な情報を入手するサブプロシジャ
 *
 *	戻り値はオブジェクト
 *		リソース共用のため、AEプロジェクトを拡張して乙女タグをぶら下げる。
 *		乙女タグは、可能なら初期化時点で、ダメでも必要になるたび。
 *
 */
//グローバルオブジェクト 現在のプロジェクトの状態を記録する
	var thisProject = new Object();

function checkComp()
{
	if (app.project==null) {
		//開いているプロジェクトが無い
		alert("no project open");return false;
	}else{
//		thisProject初期化
	thisProject.folder	=new Array();
	thisProject.composition	=new Array();
	thisProject.footage	=new Array();

	for(itemIndex=1;itemIndex<=app.project.items.length;itemIndex++){
switch (app.project.item(itemIndex).typeName){
case	"フォルダ":
//	thisProject.folder.push([itemIndex,app.project.item(itemIndex).name]);
	thisProject.folder.push(app.project.item(itemIndex));
	break;
case	"コンポジション":
//	thisProject.composition.push([itemIndex,app.project.item(itemIndex).name]);
	thisProject.composition.push(app.project.item(itemIndex));
	break;
case	"フッテージ":
default	:	;
//	thisProject.footage.push([itemIndex,app.project.item(itemIndex).name]);
	thisProject.footage.push(app.project.item(itemIndex));

}
	app.project.item(itemIndex).index=itemIndex;
	}


	}
return true;
}
//

//コンポジションの配下のレイヤをスキャン

function checkLayer()
{
	for (idx=0;idx<thisProject.composition.length;idx++){
		thisProject.composition[idx].isStill=new Array();
for(Lid=1;Lid<=thisProject.composition[idx].layers.length;Lid++){
//isComp/Footage?
/*	レイヤソースによる分類
	Layer.source.type
				Comp/Footage
	Layer.source.mainSource.type
				Footage.solidSource
				Footage.fileSource(movie)
				Footage.fileSource(stil)
 */

	if(thisProject.composition[idx].layer(Lid).source.typeName=="コンポジション")
	{//comp
		srcType="movie";
	}else{//footage
		if(thisProject.composition[idx].layer(Lid).source.mainSource.toString()=="[object FileSource]"){
if(thisProject.composition[idx].layer(Lid).source.mainSource.isStill){
		srcType="still";
}else{
		srcType="movie";
}
		}else{
		srcType="still";
		}
	}

		thisProject.composition[idx].isStill.push(srcType);
}
	}
}
//AVLayerオブジェクトをわたしてスチルかムービーかを判定　戻り値はboorien
function isStill(obj)
{
//isComp/Footage?
/*	レイヤソースによる分類
	Layer.source.type
				Comp/Footage
	Layer.source.mainSource.type
				Footage.solidSource
				Footage.fileSource(movie)
				Footage.fileSource(stil)
 */

	if(obj.source.typeName=="コンポジション")
	{//comp
		srcType="movie";
	}else{//footage
		if(obj.source.mainSource.toString()=="[object FileSource]"){
if(obj.source.mainSource.isStill){
		srcType="still";
}else{
		srcType="movie";
}
		}else{
		srcType="still";
		}
	}

		result=(srcType=="still")?true:false;
		return result;
}

//コンポセレクタ初期化(コンポサーチしてオプションの再セット)
function initCompSelector_(){
	thisProject.composition=app.project.pickItems("composition");//選択対象のコンポアイテムを全抽出
//
		new_options=new Array();
		new_options.push("<コンポ選択>");//国際化リソース注意
			for (idx=0;idx<thisProject.composition.length;idx++){
				var isSystem=false;
				//システムファイルを候補から除外
				if (thisProject.composition[idx].parentFolder.parentFolder)
				{
					isSystem=(thisProject.composition[idx].parentFolder.parentFolder.name==nas.mapFolders.mapBase)?true:false
				}
				if(thisProject.composition[idx].name==nas.sheetBinder){isSystem=true};
				if(! isSystem){
					myEntry="\[\x20"+thisProject.composition[idx].index+"\x20\]\x20\x20"+thisProject.composition[idx].name;
					new_options.push(myEntry);
				}
//			if(thisProject.composition[idx] == app.project.activeItem){activeSelect=idx;};
			};
			this.options=new_options;//オプションセット
	return;
}
//
function chgCompSelect_(){
	this.init();//再初期化

	if (this.options.length<=1)
	{
		this.select(0);
		this.parent.lyrSelector.init();
		return;
	}else {
//コール時点のコンポ数が1の場合無条件で選択
//コール時点のコンポ数が2以上の場合は、オプションセレクタに選択用の配列を渡して引数に1加えて使う

		var nextSelect=((this.selected+1)%this.options.length)?(this.selected+1)%this.options.length:1;
//			泥臭いけどとりあえず0スキップで対処
//			var nextSelect=mySelection;
//			this.select(nextSelect);
			this.select(
				nas.GUI.selectOptions(
					this.options.slice(1,this.options.length),
					this.selected-1,
					this
				)+1
			);
			this.parent.lyrSelector.init();
			return;
	}
/*
	if (this.selected==0){
	}else{
		if(app.project==null){this.select(0);};
		this.select(1+(this.selected%(this.options.length-1)));
	}
//コンポを切り換えたので、レイヤセレクタを更新
this.parent.lyrSelector.init();
*/
}
// GUI Setup
/*	基本機能というか。ボタン

*	クリップボード書き出し
*	クリップボード読み込み
このふたつは廃止 クリップボード操作系のオブジェクトはなかった
危険だからねぇ

ファイルオープン
保存
*	名前を付けて保存(保存で代用)

フィールドクリア

プロジェクトへ保存
プロジェクトから読み出し

ビルド
タイミング取得

シート選択
コンポ選択
レイヤ関連づけ
レイヤセレクタ作成>スクロールバーのプロパティとメソッドで実装

*/
//------- GUI設定・スタートアップ -------
//ウィンドウ位置レストア
	var myLeft=(nas.GUI.winOffset["easyXPS"])?
		nas.GUI.winOffset["easyXPS"][0]:nas.GUI.dafaultOffset[0];
	var myTop=(nas.GUI.winOffset["easyXPS"])?
		nas.GUI.winOffset["easyXPS"][1]:nas.GUI.dafaultOffset[1];

// window初期化
	nas.easyXPS= nas.GUI.newWindow("palette","仮設XPSリンカ nas(u) tools (Nekomataya/2006)",8,21,myLeft,myTop);
// ファイルコントロール
	nas.easyXPS.loadButton=nas.GUI.addButton(nas.easyXPS,"シート開く",0,1,2,1);
	nas.easyXPS.saveButton=nas.GUI.addButton(nas.easyXPS,"シート保存",2,1,2,1);
//	nas.easyXPS.saveAsButton=nas.GUI.addButton(nas.easyXPS,"SAVE as",4,1,2,1);
//	nas.easyXPS.clearSheetButton=nas.GUI.addButton(nas.easyXPS,"clearSheet",6,1,2,1);

//	nas.easyXPS.getCBButton=nas.GUI.addButton(nas.easyXPS,"getClipBoard",0,2,2,1);
//	nas.easyXPS.putCBButton=nas.GUI.addButton(nas.easyXPS,"putClipBoard",2,2,2,1);
	nas.easyXPS.readPjButton=nas.GUI.addButton(nas.easyXPS,"ストア読出",4,1,2,1);
	nas.easyXPS.writePjButton=nas.GUI.addButton(nas.easyXPS,"ストア書込",6,1,2,1);
//メッセージウェル
	nas.easyXPS.messageWell=nas.GUI.addStaticText(nas.easyXPS,"シートを読み込むか、ペーストしてください",0,2.3,4,0.8)
//シート更新ボタン
	nas.easyXPS.updateButton=nas.GUI.addButton(nas.easyXPS,"<sheetName>",4,2,4,1);
// タイムシート表示
	nas.easyXPS.sheetView=nas.GUI.addEditText(nas.easyXPS," ",0,3,8,7);
		nas.easyXPS.sheetView.addBuf=nas.GUI.addBuf_;
		nas.easyXPS.sheetView.multiline=true;
		nas.easyXPS.sheetView.backupText=" ";
		nas.easyXPS.sheetView.chgFlag=false;
		
nas.easyXPS.sheetView.clear= function ()
{this.text="";this.backupText="";this.chgFlag=false;};
nas.easyXPS.sheetView.onChange = function ()
{
		if(! this.chgFlag)
		{	this.chgFlag=true;
//edFlag=(nas.easyXPS.sheetView.chgFlag)?"◎":"　";//"\["+edFlag+"\] : "+
nas.easyXPS.updateButton.text=[XPS.scene,XPS.cut].join("_");//ボタン書換え
nas.easyXPS.updateButton.enabled=(this.chgFlag)?true:false;

			this.backupText=this.text
		}else{
		};
};

// シートセレクタ
	nas.easyXPS.XPSTLSelector=nas.GUI.addSelectButton(nas.easyXPS,"[　] <無題>",0,0,10,8,1);

// コンポセレクタ
nas.easyXPS.compSelector=nas.GUI.addSelectButton(nas.easyXPS,"<コンポ選択>",0,0,11,8,1);
// リンクブラウザ ダミーデータ
	dummyLayers =new Array();
	dummyLayers=["","","","",""];
// リンクブラウザ
	nas.easyXPS.LayerLink =new Array();

for (idx=0;idx<dummyLayers.length;idx++){
	nas.easyXPS.LayerLink[idx]=new Object();
	nas.easyXPS.LayerLink[idx].Button=nas.GUI.addSelectButton(nas.easyXPS,"<no-select>",0,0,12+idx,2,1);
	nas.easyXPS.LayerLink[idx].Button.options=["<no-select>","A","B","C","D","E","F"];
//	nas.easyXPS.LayerLink[idx].lyNames=nas.GUI.addEditText(nas.easyXPS,"===",2,12+idx,5.6,1);
	nas.easyXPS.LayerLink[idx].lyNames=nas.easyXPS.add("edittext",nas.GUI.Grid(2,12+idx,5.6,1,nas.easyXPS),dummyLayers[idx],{readonly:true});
}
// スクロールバー(レイヤセレクタ)
 	nas.easyXPS.lyrSelector=nas.GUI.addScrollBar(nas.easyXPS,0,0,0,7,12,5,"right");

// セレクタ ラベル
nas.easyXPS.lb0=nas.GUI.addStaticText(nas.easyXPS,"(SHEET)",0,17,2,1);
nas.easyXPS.lb0.justify="center";
nas.easyXPS.lb1=nas.GUI.addStaticText(nas.easyXPS,"(LAYER)",2,17,5,1);
nas.easyXPS.lb1.justify="center";

// リンクコマンドボタン
	nas.easyXPS.linkButton=nas.GUI.addButton(nas.easyXPS,"シートをコンポへ適用",0,18,4,1);
	nas.easyXPS.readButton=nas.GUI.addButton(nas.easyXPS,"コンポからシートを作成",4,18,4,1);

//ストア操作
	nas.easyXPS.addSheet=nas.GUI.addButton(nas.easyXPS,"新規ストア",0,19,2,1);
	nas.easyXPS.viewSheet=nas.GUI.addButton(nas.easyXPS,"シート全表示",2,19,2,1);
	nas.easyXPS.removeSheet=nas.GUI.addButton(nas.easyXPS,"カレントシート削除",4,19,2,1);
	nas.easyXPS.infoSheet=nas.GUI.addButton(nas.easyXPS,"シート情報",6,19,2,1);
	
//	ファンクションボタン
	nas.easyXPS.cluButton=nas.GUI.addButton(nas.easyXPS,"バッファ初期化",0,20,2,1);
	nas.easyXPS.clbButton=nas.GUI.addButton(nas.easyXPS,"ウェル消去",2,20,2,1);
	nas.easyXPS.tstButton=nas.GUI.addButton(nas.easyXPS,"再表示",4,20,2,1);
	nas.easyXPS.closeButton=nas.GUI.addButton(nas.easyXPS,"close",6,20,2,1);

//GUI-FunctionSetup
//	ボタンファンクション割り付け
for (idx=0;idx<5;idx++){
//	nas.easyXPS.LayerLink[idx].Button.onClick=function(){alert(this.text);};
//		nas.easyXPS.LayerLink[idx].lyNames.justify="left";
	nas.easyXPS.LayerLink[idx].Button.id= idx;
	nas.easyXPS.LayerLink[idx].Button.onClick= function(){this.parent.lyrSelector.chgLink(this.id)};
}
//	上段ドキュメント関連
//	nas.easyXPS.loadButton.onClick= function(){getSheet();nas.easyXPS.compSelector.onClick();};
	nas.easyXPS.loadButton.onClick= function(){getSheet();nas.easyXPS.lyrSelector.init();};
	nas.easyXPS.saveButton.onClick= function(){saveSheet();};
//	nas.easyXPS.saveAsButton.onClick= function(){saveSheet();};
//	nas.easyXPS.clearSheetButton.onClick= function(){this.parent.sheetView.clear();};
//	nas.easyXPS.getCBButton.onClick=function(){alert("まだです。");};
//	nas.easyXPS.putCBButton.onClick=function(){alert("まだ書いてませんです。");};
	nas.easyXPS.readPjButton.onClick = function (){popSheet();nas.easyXPS.lyrSelector.init();updateControl();};
//	nas.easyXPS.readPjButton.enabled = false;
	nas.easyXPS.writePjButton.onClick = function (){pushSheet();};
//	nas.easyXPS.writePjButton.enabled = false;
	nas.easyXPS.updateButton.onClick = function (){
		if(this.parent.sheetView.chgFlag){if(updateXPS()){updateControl();}};
		//	nas.easyXPS.compSelector.onClick();
			nas.easyXPS.lyrSelector.init();
	};

//	中段コマンド
//	nas.easyXPS.XPSTLSelector.onClick = function (){alert("temp")}

	nas.easyXPS.linkButton.onClick = function (){goLink();};
	nas.easyXPS.readButton.onClick = function (){alert("できるといいよね");};
	nas.easyXPS.readButton.enabled = false;

	nas.easyXPS.compSelector.onClick = chgCompSelect_;
	nas.easyXPS.compSelector.init = initCompSelector_;
//　ストア操作
	nas.easyXPS.addSheet.onClick=function()
	{
		nas.XPSStore.add();
		this.parent.XPSTLSelector.init();
		updateControl();
	};
	nas.easyXPS.viewSheet.onClick=function()
	{
		this.parent.sheetView.text=XPS.toString()
	};
	nas.easyXPS.removeSheet.onClick=function()
	{
		if(nas.XPSStore.getLength()){
			nas.XPSStore.remove();
			this.parent.XPSTLSelector.init();
			updateControl();
			if(nas.otomeFEP.uiPanel){nas.otomeFEP.uiPanel.reloadInfo()}
		}else{
			//タイムシートがストア領域にありません
		}
	};
	nas.easyXPS.infoSheet.onClick=function()
	{
		var myInfo=nas.XPSStore.getInfo();
		nas.easyXPS.sheetView.clear();
		nas.easyXPS.sheetView.text="";
		for (prp in myInfo){nas.easyXPS.sheetView.text+=prp +":"+myInfo[prp]+nas.GUI.LineFeed;};
	};

//	下段ファンクションボタン
	nas.easyXPS.cluButton.onClick = function ()
	{
//var XPS=new Object();
	XPS=new Xps(SheetLayers,nas.FCT2Frm(Sheet));
//	ダミーマップを与えて情報取り込み
	XPS.getMap(new Map(SheetLayers));
		updateControl();
	};
	nas.easyXPS.clbButton.onClick = function (){nas.easyXPS.sheetView.clear();};
	nas.easyXPS.tstButton.onClick = function (){updateControl();};
	nas.easyXPS.closeButton.onClick = function (){this.parent.close();};
// コンポセレクタにコンポを与えて処理対象ならそのコンポを選択
	nas.easyXPS.compSelector.setLayer=function(myItem)
	{
		if(! myItem){return false;}
		for(var idx=1;idx<this.options.length;idx++){
			var myIndex=this.options[idx].match(/\[\s(\d+)\s\]/)[1]*1;
			if(myItem.index==myIndex){
				this.select(idx);
				return true;
			}
		}
		return false;
	}
//	シートセレクタ初期化
{
	nas.easyXPS.XPSTLSelector.init=function()
	{
		var myOptions=new Array();
		myOptions.push("<<　------------ no  selected ------------　>>");//0番
		for(var idx=1;idx<=nas.XPSStore.getLength();idx++){
			var myXps=nas.XPSStore.get(idx);
			myOptions.push("[ "+idx+" ] "+[myXps.title,myXps.opus,myXps.subtitle,myXps.scene,myXps.cut].join("/"));
		}
		this.options=myOptions;
		if(nas.XPSStore.selected){this.select(nas.XPSStore.selected.index);}else{this.select(0);}
	}
	nas.easyXPS.XPSTLSelector.onChange=function()
	{
		nas.XPSStore.pop(this.selected);
		updateControl();
	}
}

//	レイヤセレクタ初期化
{
//5段(固定)分・初期化
//	var activeLayerLot=0;//グローバルだった どひー
//	nas.easyXPS.lyrSelector.Layers=new Array();//クリア
//	nas.easyXPS.lyrSelector.Links=new Array();

nas.easyXPS.lyrSelector.init=function()
{
	if(this.parent.compSelector.selected==0)
	{
		var activeLayerLot=0;
		this.Layers=new Array();//クリア
		this.Links=new Array();
		this.minvalue=0;
		this.maxvalue=0;
		this.value=0;
		this.chgSRB();
	}else{
		var selectedCompId=this.parent.compSelector.value.match(/\[\s(\d+)\s\]/)[1]*1;
//		var activeComp=thisProject.composition[this.parent.compSelector.selected-1];
		activeComp=app.project.items[selectedCompId];
//		alert(selectedLyId);
//		var activeLayerLot=thisProject.composition[selectedLyId].layers.length;
		activeLayerLot=activeComp.layers.length;

		this.Layers=new Array(activeLayerLot);
		this.Links=new Array(activeLayerLot);
			for (idx=0;idx<activeLayerLot;idx++){
this.Layers[idx]="\[\x20"+(idx+1).toString()+"\x20\]\x20\x20"+activeComp.layer(idx+1).name;
this.Links[idx]=guessLink(activeComp.layer(idx+1).name);//接続リンクを推測。マッチなければ0で初期化

			}
	this.minvalue=0;
	this.maxvalue=(activeLayerLot>5)?(activeLayerLot-5):0;
	this.value=(activeLayerLot>5)?(activeLayerLot-5):0;
//	this.activePoint=(activeLayerLot>5)?(activeLayerLot-5):0;
	this.chgSRB();
	}
};

	nas.easyXPS.lyrSelector.chgSRB=function()
{
for(idx=0;idx<5;idx++){
		if(idx<this.Layers.length){
	this.parent.LayerLink[idx].lyNames.text=this.Layers[idx+Math.round(this.value)];
	this.parent.LayerLink[idx].Button.select(this.Links[idx+Math.round(this.value)]);
		}else{
	this.parent.LayerLink[idx].lyNames.text="";
	this.parent.LayerLink[idx].Button.select(0);
		}
}
};
	nas.easyXPS.lyrSelector.onChange=function(){this.chgSRB()};

	nas.easyXPS.lyrSelector.chgLink=function(btid)
{//ボタン押した
	if((btid+this.value)< this.Layers.length){
//	this.parent.LayerLink[btid].Button.select("next");
	var myLocation=nas.GUI.screenLocation(this.parent.LayerLink[btid].Button);
	this.parent.LayerLink[btid].Button.select(nas.GUI.selectOptions(
		this.parent.LayerLink[btid].Button.options,
		this.parent.LayerLink[btid].Button.selected,
		this.parent.LayerLink[btid].Button
	));
	this.Links[btid+this.value]=this.parent.LayerLink[btid].Button.selected;
	}
};
}
//	イベント設定
//	nas.easyXPS.sheetView.onChange = function (){alert("change");};
//	ウィンドウ位置保存
	nas.easyXPS.onMove=function(){
nas.GUI.winOffset["easyXPS"] =
[ nas["easyXPS"].bounds[0],nas["easyXPS"].bounds[1]];
	}
	
//	GUI設定終了/表示
			nas.easyXPS.show();

			nas.easyXPS.sheetView.addBuf(20);
//			nas.easyXPS.sheetView.text="<<初期化中>>";


//理由はわからないが初期状態だと256bでペーストが打ち止めになるのでスクリプト側からedittextの拡張をかけてあります。20kb分
			updateControl();
}
if(! isNaN(nas.XPSStore.getLength()))
{
/*起動時にXPSStoreが存在すれば、そちらにフォーカスを切り替え
	シートセレクタを更新してセレクトされたシートをバッファに読み込む
 */
//	if(! nas.XPSStore.toString()){nas.XPSStore.setBody();}
	nas.easyXPS.XPSTLSelector.init();
	if(nas.XPSStore.selected){nas.XPSStore.pop(nas.XPSStore.selected.index)};
}else{
/* 
 *	nas-カレントフォルダにタイムシートが存在すれば、読み込む
	リクエストあり・素材(レイヤフッテージ)を基点にシートを検索する機能
 *複数存在する場合は、カレントフォルダ名に一致したものがあればそれを
 *なければ、システムソートで読み込む。(将来は、設定ファイル数読み込み)
 *対応フォーマットは XPS/ARD/TSH/STS
 * STSのみバイナリファイルなので動作を分岐
 **  起動時にカレントアイテムがコンポならコンポを選択する動作を追加
 */
		var files = nas.GUI.currentFolder.getFiles(); //内包エントリ取得
			var mySheets=new Array();//シートエントリ
		for(myEntry in files){
			if(files[myEntry].name.match(/.*\.(xps|ard|tsh|sts)/i)){mySheets.push(files[myEntry])};
		};
		if(mySheets.length)
		{//シートあれば…なければスキップ
			//読み込み対象シートを絞る
			var myReadXPS=mySheets[0];//最初のエントリを設定
			for(sheet in mySheets){
				if(mySheets[sheet].name.indexOf(nas.GUI.currentFolder.name,0)>0)
				{
					nas.writeConsole("readout XPS from Store :"+mySheets[sheet].name);
					myReadXPS=mySheets[sheet];};
			}
				if(getSheet(myReadXPS)){updateControl()};
		}
}
//ボタンを1回押す(やめ)
//		nas.easyXPS.compSelector.onClick();
//	立ち上げ時にアクティブアイテムがコンポジションならそのコンポを選択した状態で開始する様に変更
var activeSelect=0;
var myComps=app.project.pickItems("composition");
for (idx=0;idx<myComps.length;idx++){
	if(myComps[idx] == app.project.activeItem){activeSelect=app.project.activeItem;};
			};
		nas.easyXPS.XPSTLSelector.init();
		nas.easyXPS.compSelector.init();
		nas.easyXPS.compSelector.setLayer(activeSelect);
		nas.easyXPS.lyrSelector.init();


//	読み込み不良は未対処(07/04/02)
