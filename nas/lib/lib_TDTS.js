/**
 *    @fileoverview lib_TDTS
 *        tdts(ToeianimationDigitalTimeSheet) format 及び　xdts(eXchangeDigitalTimeSheet)に関する
 *        機能ライブラリ
 *
 *        XDTSフォーマットはTDTSフォーマットのサブセットであり、現在XDTSを扱うメインのアプリケーションである
 *        CLIP STUDIO PAINTがXDTSの範囲を超えたデータを受け取っても問題なく動作するためXDTSとTDTSの扱いの差異は
 *        ヘッダ文字列のみで処理される
 */
/*
タイムシートドキュメントオブジェクト
	tdts(ToeianimationDigitalTimeSheet) format 及び　xdts(eXchangeDigitalTimeSheet)兼用
将来仕様が分かれた場合は、独立にXDTSを書き起こすこと

Object Tdts{
	header     :Object DocumentHeader,
	timeTables :[Array of Object TimeTable],
	version    :Number 
}
*/
var TDTS = {};//ClassObject

function Tdts(){
	this.header = new TDTS.DocumentHeader()
	this.timeTables = [];
	this.version = 5 ;
}
/*
ドキュメントヘッダ
	ドキュメントプロパティトレーラー

Object DocumentHeader{
	colors    :[Array of 8bit3ch-colorValueArray x 3],
	cut       :"cutIdfString",
	direction :"String",
	eipsode   :"episodeString",
	scene     :"sceneIdfString"
}
*/
	TDTS.DocumentHeader = function(){
		this.colors    =[[255,255,255],[255,255,255],[255,255,255]];
		this.cut       ;
		this.direction ;
		this.eipsode   ;
		this.scene     ;
	};
/*
タイムテーブルオブジェクト
	テーブルはタイムシート１セットに相当する単位
	ドキュメント内に複数のタイムシートセットが許容される
	xdts出力時は、タイムテーブルIDを指定する必要がある
	
Object TimeTabele{
	books               :[Array of Object TimeTableField],
	color               :Number colorID,
	duration            :Number,
	headerMemoImageData :"String encoded Image", // 存在しない場合はプロパティごと無い
	fields              :[Array of Object TimeTableField],
	name                :"String teimeTabele name",
	opratorName         :"String operator name",
	timeTableHeaders    :[Array of Object TimeTableHeader],
	whiteBoardImageData :"String encoded Image", // 存在しない場合はプロパティごと無い
}
*/
	TDTS.TimeTable = function (){
		this.books               ;//[Array of Object TimeTableField],
		this.color               ;//Number colorID,
		this.duration            ;//Number,
		this.headerMemoImageData ;//"String encoded Image", // 存在しない場合はプロパティごと無い
		this.fields              ;//[Array of Object TimeTableField],
		this.name                ;//"String teimeTabele name",
		this.opratorName         ;//"String operator name",
		this.timeTableHeaders    ;//[Array of Object TimeTableHeader],
		this.whiteBoardImageData ;//"String encoded Image", // 存在しない場合はプロパティごと無い
		
	}
/*
タイムテーブルフィールド
	フィールドは、トラック種別ごとの集合
	画面上の配置は固定で左から順に 0,3,5
	
	fieldID
0:	replacement(CELL)
1:	<unknown>
2:	<unknown>
3:	sound(dialogue)
4:	<unknown>
5:	camarawork(effect and others)



Object TimeTableField{
	fieldId     :Number fieldID,
	tracks      :[Array of TimelineTrack]
}
*/
	TDTS.TimeTableField = function(fieldId){
		this.fieldId = fieldId ;//Number fieldID,
		this.tracks	           ;//[Array of String field name]
	}
/*
タイムテーブルヘッダ
	フィールドラベルを保持するオブジェクト
Object TimeTableHeader{
	fieldId     :Number fieldID,
	names	:[Array of String field name]
}
*/
	TDTS.TimeTableHeader = function(fieldId){
		this.fieldId = fieldId ;//Number fieldID,
		this.names	           ;//[Array of String field name]
	}
/*
タイムライントラックは二種作るべきかもしれない
	frames	トラックエントリの配列。通常のトラックが持つデータトレーラ
	texts	トラックの持つ値（文字列）BOOKトラックが持つ
	trackNo	フィールド内でのトラックID BOOKトラックの場合は親トラックを示す

Object TimelineTrack{
	frames        :[Array of TrackEntry],
	texts         :[Array of "String bookName"],
	trackNo       :Number trackID
}
*/
	TDTS.TimelineTrack = function(trackNo){
		this.frames            ;//[Array of TrackEntry],
		this.texts             ;//[Array of "String bookName"],
		this.trackNo = trackNo ;//Number trackID
	}
/*
トラックエントリオブジェクト
	データ（プロパティ）を保持して
	エントリポイントのフレームを与えるレイヤ

Object TrackEntry{
	data         :[Array of Object TarckData],
	frame        :Number startFrame
}
*/
	TDTS.TrackEntry = function(){
		this.data         ;//[Array of Object TarckData],
		this.frame        ;//Number startFrame
	}

/*
トラックデータオブジェクト
	attention　 注意喚起フラグ　falseの際はエントリの出力不要　true にするとコマの背景色が注意喚起色でハイライトされる
	cellReplace 「セル置き換え」フラグ falseの際はエントリの出力不要 true　にすると指定フレーム終端で当該トラックの上から下への置き換え指示線が表示される。トラック内で１回のみ記述が許されている…らしい
	memoは手書きメモがアタッチされている場合のみ存在するプロパティ
	values　は配列だが　通常は要素一つのみでトラックに記載されている値テキストまたはプリセット文字列（列挙子？）

Object TrackData{
	attention   : Boolean,
	cellReplace : Boolean,
	id          : Number Idf,
	memo        : Object MemoGraphic,
	values      : [Array of TimelineValue]
}
*/
	TDTS.TrackData = function(idf){
		this.attention   ;// Boolean,
		this.cellReplace ;// Boolean,
		this.id  = idf   ;// Number Idf,
		this.memo        ;// Object MemoGraphic,
		this.values      ;// [Array of TimelineValue]
	}
/*
トラックデータにアタッチするイメージデータオブジェクト
	color     シートセルの背景色で、セルに登録された画像メモが存在することを示している。　attentionカラーと混色	
	imageDate base64エンコーディングされたPNG
	offsetX,Y 画像のオフセット

Object MemoImage{
	color      : Number backgroundColorID,
	imageData  : "String encoded Image",
	offsetX    : Number image Offset X,
	offsetY    : Number image Offset Y
}
*/
	TDTS.MemoImage = function(){
		this.color      ;// Number backgroundColorID,
		this.imageData  ;// "String encoded Image",
		this.offsetX    ;// Number image Offset X,
		this.offsetY    ;// Number image Offset Y
	}

/*
	dataSYMBOLDB
	
*/
	TDTS.dataSymbol={
		"SYMBOL_TICK_1":"○",
		"SYMBOL_TICK_2":"●",
		"SYMBOL_NULL_CELL":"×",
		"SYMBOL_HYPHEN":"|"
	};

/*
CAMERAWORK_ITME={"29":"BL K",
"47":"BOKEH L",
"46":"BOKEH M",
"45":"BOKEH S",
"69":"Bar",
"65":"Blur1",
"66":"Blur2",
"67":"Blur3",
"7":"CAM SHAKE L",
"6":"CAM SHAKE M",
"5":"CAM SHAKE S",
"18":"CD",
"17":"CU",
"64":"CutIN",
"39":"DF1",
"40":"DF2",
"41":"DF3",
"19":"DOLLY",
"0":"FI",
"48":"FIX",
"1":"FO",
"16":"FOLLOW",
"21":"Fairing",
"55":"Focus IN",
"56":"Focus Out",
"42":"Fog1",
"43":"Fog2",
"44":"Fog3",
"51":"FollowPan",
"33":"HI CON",
"28":"Handy L",
"27":"Handy M",
"26":"Handy S",
"63":"Insert",
"61":"IrisIN",
"62":"IrisOut",
"38":"JumpSL",
"20":"MULTI",
"4":"OL",
"35":"OverEX",
"12":"PAN",
"14":"PAN DOWN",
"50":"PAN TB",
"49":"PAN TU",
"13":"PAN UP",
"37":"ParsSL",
"54":"Q TB",
"53":"Q TU",
"34":"Rack Focus",
"52":"Rolling",
"25":"Rotate TB",
"24":"Rotate TU",
"22":"SL",
"31":"SUBLINA",
"70":"Strobo1",
"71":"Strobo2",
"9":"TB",
"32":"TFlash",
"15":"TILT",
"8":"TU",
"36":"UnderEX",
"30":"W K",
"2":"WI",
"3":"WO",
"59":"WaveGlass L",
"58":"WaveGlass M",
"57":"WaveGlass S",
"60":"Wipe",
"68":"WipeIN",
"10":"ZI",
"11":"ZO"};



 var CAMERAWORK_ITEMS=["FI",
"FO",
"WI",
"WO",
"OL",
"CAM SHAKE S",
"CAM SHAKE M",
"CAM SHAKE L",
"TU",
"TB",
"ZI",
"ZO",
"PAN",
"PAN UP",
"PAN DOWN",
"TILT",
"FOLLOW",
"CU",
"CD",
"DOLLY",
"MULTI",
"Fairing",
"SL",
"Rotate TU",
"Rotate TB",
"Handy S",
"Handy M",
"Handy L",
"BL K",
"W K",
"SUBLINA",
"TFlash",
"HI CON",
"Rack Focus",
"OverEX",
"UnderEX",
"ParsSL",
"JumpSL",
"DF1",
"DF2",
"DF3",
"Fog1",
"Fog2",
"Fog3",
"BOKEH S",
"BOKEH M",
"BOKEH L",
"FIX",
"PAN TU",
"PAN TB",
"FollowPan",
"Rolling",
"Q TU",
"Q TB",
"Focus IN",
"Focus Out",
"WaveGlass S",
"WaveGlass M",
"WaveGlass L",
"Wipe",
"IrisIN",
"IrisOut",
"Insert",
"CutIN",
"Blur1",
"Blur2",
"Blur3",
"WipeIN",
"Bar",
"Strobo1",
"Strobo2"
,"",""]

0:TDTS/XDTS アイテム文字列
1:トラック種別　c: camerawork, e:effect, g:geometry
2:UAT置き換え対照配列　[区間文字列,開始ノード,終端ノード]
*/
TDTS.SectionItemTable = {
 0: ["FI","c",["|","▲"]],
 1: ["FO","c",["|","▼"]],
 2: ["WI","c",["|","△"]],
 3: ["WO","c",["|","▽"]],
 4: ["OL","c",["|","]OL["]],
 5: ["CAM SHAKE S","c",["/"]],
 6: ["CAM SHAKE M","c",["//"]],
 7: ["CAM SHAKE L","c",["///"]],
 8: ["TU","c",["|","▽","△"]],
 9: ["TB","c",["|","▽","△"]],
 10: ["ZI","c",["|","▽","△"]],
 11: ["ZO","c",["|","▽","△"]],
 12: ["PAN","c",["|","▽","△"]],
 13: ["PAN UP","c",["|","▽","△"]],
 14: ["PAN DOWN","c",["|","▽","△"]],
 15: ["TILT","c",["|","▽","△"]],
 16: ["FOLLOW","c",["┃","┳","┻"]],
 17: ["CU","c",["┃","┳","┻"]],
 18: ["CD","c",["｜","┬","┴"]],
 19: ["DOLLY","c",["｜","┬","┴"]],
 20: ["MULTI","c",["｜","┬","┴"]],
 21: ["Fairing","c",["｜","⇑","⇓"]],
 22: ["SL","c",["|","▽","△"]],
 23: ["Strobo","c",["|","]STROBO["]],
 24: ["Rotate TU","c",["|","▽","△"]],
 25: ["Rotate TB","c",["|","▽","△"]],
 26: ["Handy S","c",[":"]],
 27: ["Handy M","c",["::"]],
 28: ["Handy L","c",[":::"]],
 29: ["BL K","c",["■"]],
 30: ["W K","c",["□"]],
 31: ["SUBLINA","c",["＜SUBLINA"]],
 32: ["TFlash","c",["|","┬","┴"]],
 33: ["HI CON","c",["|","┬","┴"]],
 34: ["Rack Focus","c",["|","┬","┴"]],
 35: ["OverEX","c",["｜","┬","┴"]],
 36: ["UnderEX","c",["｜","┬","┴"]],
 37: ["ParsSL","c",["┃","┳","┻"]],
 38: ["JumpSL","c",["｜","┬","┴"]],
 39: ["DF1","c",["｜","┬","┴"]],
 40: ["DF2","c",["｜","┬","┴"]],
 41: ["DF3","c",["｜","┬","┴"]],
 42: ["Fog1","c",["｜","┬","┴"]],
 43: ["Fog2","c",["｜","┬","┴"]],
 44: ["Fog3","c",["｜","┬","┴"]],
 45: ["BOKEH S","c",["｜","┬","┴"]],
 46: ["BOKEH M","c",["｜","┬","┴"]],
 47: ["BOKEH L","c",["｜","┬","┴"]],
 48: ["FIX","c",["｜","┬","┴"]],
 49: ["PAN TU","c",["|","▽","△"]],
 50: ["PAN TB","c",["|","▽","△"]],
 51: ["FollowPan","c",["|","▽","△"]],
 52: ["Rolling","c",["｜","┬","┴"]],
 53: ["Q TU","c",["|","▽","△"]],
 54: ["Q TB","c",["|","▽","△"]],
 55: ["Focus IN","c",["|","▲"]],
 56: ["Focus Out","c",["|","▼"]],
 57: ["WaveGlass S","c",["!"]],
 58: ["WaveGlass M","c",["!!"]],
 59: ["WaveGlass L","c",["!!!"]],
 60: ["Wipe","c",["|","]WIPE["]],
 61: ["IrisIN","c",["|","]○["]],
 62: ["IrisOut","c",["|","]●["]],
 63: ["Insert","c",["＜INSERT"]],
 64: ["CutIN","c",["＜CUTIN"]],
 65: ["Blur1","c",["┃","┳","┻"]],
 66: ["Blur2","c",["┃","┳","┻"]],
 67: ["Blur3","c",["┃","┳","┻"]],
 68: ["WipeIN","c",["|","]▲["]],
 69: ["Bar","c",["‖"]],
 70: ["Strobo1","c",["|","▼▲"]],
 71: ["Strobo2","c",["|","▲▼"]]
 };
 TDTS.SectionItemTable.length = 72;
 TDTS.SectionItemTable.indexOf = function(item){
 	for (var ix = 0;ix < this.length; ix ++){
 		if(this[ix][0] == item) return ix;
 	}
 	return -1;
 }

/**
簡易コンバータ
引数はTDTS/XTDSオブジェクトまたは、データストリーム
XPSソース文字列を返す
 */
function TDTS2XPS(myTDTS,sheetID) {
	var dataForm = 'XDTS';
    /**
     * 引数の第一行目を確認してJSON部分を分離
     */
    if ((typeof myTDTS == 'string')&&(myTDTS.match(/^((toei|exchange)DigitalTimeSheet Save Data\n)/))){
    	myTDTS=myTDTS.slice((RegExp.$1).length);
    	dataForm = (RegExp.$2 == 'toei')? 'TDTS':'XDTS';
        /**
         * JSONオブジェクトあればトライ　失敗したらEvalで更にトライ
         */
        if (JSON) {
            try {
                myTDTS = JSON.parse(myTDTS);
            } catch (err) {
                myTDTS = false;
            }
        }
        if (!myTDTS) {
            try {
                myTDTS = eval(myTDTS);
            } catch (err) {
                myTDTS = false;
            }
    	}
    }
    if (!((myTDTS instanceof Object)&&(myTDTS.timeTables)&&(myTDTS.version==5))){
    	myTDTS=false;
    }
    if (!myTDTS) return myTDTS;

console.log(myTDTS);

//　変換対象のタイムシートを決定　指定があれば設定　dataForm == XDTSの場合、または指定のない場合は０番
	if ((typeof sheetID == 'undefined')||(dataForm == 'XDTS')) sheetID = 0;
	if (sheetID > myTDTS.timeTables.length) sheetID = myTDTS.timeTables.length;//トレーラー内のシート数を超過していたら最後のシートに
//　タイムテーブルの継続時間　tdtsはトランジションの概念を内包しないのでそのままTIMEに割り付ける
    var myFrames = myTDTS.timeTables[sheetID].duration;    
//　タイムライントラックの必要数を算出
	var soundTracks       = [];
	var replacementTracks = [];
	var cameraworkTracks  = [];


	var stillTracks = [];
	if (myTDTS.timeTables[sheetID].books){
		stillTracks = myTDTS.timeTables[sheetID].books[0].tracks;

/*	コンバート対照のシートからプロパティを転記
	timeTable.name タイムシート名　該当するプロパティなし　強いてあげるならステージ・ジョブ識別子に相当
	opratorName	 > upadeUser
*/
	};	
//通常トラックラベルをヘッダーから収集する
	if (myTDTS.timeTables[sheetID].timeTableHeaders){
		for (var hx = 0 ; hx < myTDTS.timeTables[sheetID].timeTableHeaders.length ; hx++ ){
			switch (myTDTS.timeTables[sheetID].timeTableHeaders[hx].fieldId){
			case 0:	;
				replacementTracks = myTDTS.timeTables[sheetID].timeTableHeaders[hx].names.slice();
			break;
			case 1: ;
			case 2:	;
			break;
			case 3:	;
				soundTracks = myTDTS.timeTables[sheetID].timeTableHeaders[hx].names.slice();
			break;
			case 4:	;
			break;
			case 5:	;
				cameraworkTracks = myTDTS.timeTables[sheetID].timeTableHeaders[hx].names.slice();
			break;
			}
		}
	};
console.log( soundTracks);
console.log( replacementTracks);
console.log( cameraworkTracks);

console.log( stillTracks);
console.log([["dialog",soundTracks.length],["timing",replacementTracks.length],["camera",cameraworkTracks.length]])
    var myXps = new Xps(
    	[["dialog",soundTracks.length],["timing",replacementTracks.length],["camera",cameraworkTracks.length]],
    	parseInt(myFrames),
    	24
    );
//new Xps([['sound',4],['timing',4],['camera',4]],120,30);
console.log(myXps);
//ドキュメント情報転記
	if(myTDTS.header){
    	if (myTDTS.header.cut)      { myXps.cut   = myTDTS.header.cut     };
    	if (myTDTS.header.scene)    { myXps.scene = myTDTS.header.scene   };
    	if (myTDTS.header.episode)  { myXps.opus  = myTDTS.header.episode };
    	if (myTDTS.header.direction){ myXps.xpsTracks.noteText = myTDTS.header.direction };
	};

//ラベルを初期化すると同時にトラックの内容を転記？
/*
	シートの初期化時点ではBG,BOOK類の挿入を行わず、ラベル初期化の際に該当位置へ挿入を行う
*/
	var insertStill = true;
	var trackOffset = 0;
//ダイアログラベル転記
	for (var ix = 0 ; ix < soundTracks.length ;ix ++){
		myXps.xpsTracks[ix].id = soundTracks[ix];
	}
	trackOffset = soundTracks.length;
//タイミングラベル転記
	for (var ix = 0 ; ix < replacementTracks.length ;ix ++){
console.log(trackOffset+ix);
		myXps.xpsTracks[trackOffset+ix].id = replacementTracks[ix];
	}
	trackOffset = soundTracks.length+replacementTracks.length;
//カメラワークラベル転記
	for (var ix = 0 ; ix < cameraworkTracks.length ;ix ++){
		myXps.xpsTracks[trackOffset+ix].id = cameraworkTracks[ix];
	}
	trackOffset = soundTracks.length+replacementTracks.length;


/* フィールドスキャン
トラックから記述(入力ストリーム)を組み立て　putメソッドで流し込む
フィールド種別ごとに別処理
*/
	if (myTDTS.timeTables[sheetID].fields){
		for (var fx = 0 ; fx < myTDTS.timeTables[sheetID].fields.length ; fx++ ){
			var fieldKind = myTDTS.timeTables[sheetID].fields[fx].fieldId;//フィールドID取得
			var trackOption = (["timing",'','','sound','','camerawork'])[fieldKind];//相当するxpsTrackOptionに割当
			for (var tx = 0 ; tx< myTDTS.timeTables[sheetID].fields[fx].tracks.length ; tx++){
				var trackId = tx;
				if (fieldKind == 0){
					trackId += soundTracks.length;
				} else if (fieldKind == 5){
					trackId += soundTracks.length + replacementTracks.length;
				}
/*
	フィールドID3,5のトラックはセクション長を取得して、次セクションの冒頭及びトラックの終端で解決する
*/
				var inputStream   = "";//入力はコンマ区切りストリーム
				var sectionStart  = 0 ;
				var sectionLength = 0 ;
				for (var ex = 0 ; ex< myTDTS.timeTables[sheetID].fields[fx].tracks[tx].frames.length ; ex++){
					var myEntry = myTDTS.timeTables[sheetID].fields[fx].tracks[tx].frames[ex];
					var targetFrame = myEntry.frame ;
					if(myEntry.data[0].memo){
						console.log('detect memo image');
						console.log(myEntry.data[0].memo);
					}
					if(myEntry.data[0].attention){
						console.log('detect attention property');
						console.log(myEntry.data);
					}
					if(! myEntry.data[0].values) continue;
					var inputValue = myEntry.data[0].values[0];
					if (fieldKind == 0){ ;//replacement
						if(myEntry.data[0].values[0].match(/^SYMBOL_/)){
							inputValue = TDTS.dataSymbol[myEntry.data[0].values[0]]
						}
						myXps.put([trackId,targetFrame],inputValue);
						continue;
					} else if (fieldKind == 3){ ;//sound
						if(myEntry.data[0].values[0].match(/^SYMBOL_HYPHEN$/)){
							sectionLength ++;
							continue;
						}else{
							myXps.put([trackId,sectionStart],inputStream.toString(sectionLength));
//遅延解決 して次のセクションの値をオブジェクトでセット（ビルドは遅延解決）
							sectionStart  = targetFrame;
							sectionLength = 1;
							inputStream = new nas.AnimationSound();
console.log(([myEntry.data[0].values[0],"「",myEntry.data[0].values[1],"」"]).join(''));
							inputStream.parseContent(([myEntry.data[0].values[0],"「",myEntry.data[0].values[1],"」"]).join(''));
							continue;
						}
					} else if (fieldKind == 5){ ;//camerawork
						if(myEntry.data[0].values[0].match(/^SYMBOL_HYPHEN$/)){
							sectionLength ++;
							continue;
						}else{
								var itmid = TDTS.SectionItemTable.indexOf(inputStream);
							if (inputStream){
								if(inputStream.match(/^\d+$/)) itmid = inputStream ;
							if(itmid >= 0){
								var currentWork = TDTS.SectionItemTable[itmid];
							}else {
								var currentWork = [inputStream,"c",["┃","┳","┻"]];//カメラワークに限定
							}
								var sectionStream=[];
								var sectionSign = (currentWork[2].length > 2)?currentWork[2][1]:inputStream;
								//if(sectionSign.indexOf('*')>=0)	sectionSign = sectionSign.replace(/\*/,currentWork[0]);
								for (var ct = 0 ; ct < sectionLength ; ct ++){
									if((currentWork[2].length > 1)&&(ct == 0)){
										sectionStream.push(currentWork[2][1]);
									}else if(ct == (sectionLength-1)){
										sectionStream.push(currentWork[2][currentWork[2].length-1]);
									}else{
										sectionStream.push(currentWork[2][0]);
									}
								}
								if(currentWork[2].length > 1) sectionStream.splice((Math.floor((sectionStream.length-1)/2)),1,"<"+currentWork[0]+">");
//							if((currentWork[1]=='e')) {myXps.xpsTracks[trackId].option = 'effect';}	
//							if((currentWork[1]=='g')) {myXps.xpsTracks[trackId].option = 'geometry';}	
								myXps.put([trackId,sectionStart],sectionStream.join(','));
								inputStream = '';
							}
//遅延解決して次のセクションの値を設定（未オブジェクト化）
console.log(myEntry);
							sectionStart  = targetFrame;
							sectionLength = 1;
							inputStream = myEntry.data[0].values[0];
							if(targetFrame == 0){
								if(inputStream.match(/^\d+$/)){
									if((TDTS.SectionItemTable[inputStream])&&(TDTS.SectionItemTable[inputStream][1]=='e')) myXps.xpsTracks[trackId].option = 'composite';
									if((TDTS.SectionItemTable[inputStream])&&(TDTS.SectionItemTable[inputStream][1]=='g')) myXps.xpsTracks[trackId].option = 'geomtry';
								}else{
									var itmId = TDTS.SectionItemTable.indexOf(inputStream);
									if ((itmid >= 0)&&(TDTS.SectionItemTable[itmid][1]=='e')) myXps.xpsTracks[trackId].option = 'effect';
									if ((itmid >= 0)&&(TDTS.SectionItemTable[itmid][1]=='g')) myXps.xpsTracks[trackId].option = 'geometry';
								}
								// if(inputStream.match())ここで文字列の場合の判定を入れる
							}
							continue;
						}
					}
				}
				if(fieldKind == 5){
					if (inputStream){
						var currentWork = TDTS.SectionItemTable[inputStream];
						if(! currentWork){
							var itmId=TDTS.SectionItemTable.indexOf(inputStream);
							currentWork = ( itmId >= 0 )? TDTS.SectionItemTable[itmId]:[inputStream,"e",["┃","┳","┻"]];
//							currentWork = ( itmId >= 0 )? TDTS.SectionItemTable[itmId]:[inputStream,"e",["┃","<"+inputStream+">","┻"]];
						}
						var sectionStream=[];
						var sectionSign = (currentWork[2].length > 2)?currentWork[2][1]:inputStream;
						//if(sectionSign.indexOf('*')>=0)	sectionSign = sectionSign.replace(/\*/,currentWork[0]);
						for (var ct = 0 ; ct < sectionLength ; ct ++){
									if((currentWork[2].length > 1)&&(ct == 0)){
										sectionStream.push(currentWork[2][1]);
									}else if(ct == (sectionLength-1)){
										sectionStream.push(currentWork[2][currentWork[2].length-1]);
									}else{
										sectionStream.push(currentWork[2][0]);
									}
						}
						if(currentWork[2].length > 1) sectionStream.splice((Math.floor((sectionStream.length-1)/2)),1,"<"+currentWork[0]+">");

						myXps.put([trackId,sectionStart],sectionStream.join(','));
						inputStream = '';
					}
				}else if(fieldKind == 3){
					myXps.put([trackId,sectionStart],inputStream.toString(sectionLength));
				}
			}
		}
	}
//フラグが立っている場合はIDを確認して後方から静止画トラックの挿入
	if(insertStill){
		for (var ix = stillTracks.length -1 ; ix >= 0 ; ix --){
			var insertPoint = stillTracks[ix].trackNo + soundTracks.length;
			var insertTracks = [];
			for (var tx = stillTracks[ix].texts.length -1  ; tx >= 0 ; tx -- ){
				insertTracks.push(
					new XpsTimelineTrack(
						stillTracks[ix].texts[tx],
						"still",
						myXps.xpsTracks,
						parseInt(myFrames)
					)
				)
			}
			myXps.xpsTracks.insertTrack(insertPoint,insertTracks);
		}
	}

    return myXps.toString();
}
/**
TDTS/XDTSデータを引数にしてTdtsオブジェクトを返す
引数が空の場合は、東映タイムシートツールと同仕様のブランクドキュメントを返す
*/
TDTS.parseTdts = function(dataStream){
	if((typeof dataStream != 'undefined') || (String(dataStream).match(/^((toei|exchange)DigitalTimeSheet Save Data\n)/))){
		return JSON.parse(dataStream.slice((RegExp.$1).length));
	} else {
		return JSON.parse(`
{
  "header": {
    "colors": [
      [
        255,
        255,
        255
      ],
      [
        255,
        255,
        255
      ],
      [
        255,
        255,
        255
      ]
    ],
    "cut": "",
    "direction": "",
    "episode": "",
    "scene": ""
  },
  "timeTables": [
    {
      "color": 0,
      "duration": 144,
      "name": "sheet1",
      "operatorName": "",
      "timeTableHeaders": [
        {
          "fieldId": 0,
          "names": [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G"
          ]
        },
        {
          "fieldId": 1,
          "names": [
            ""
          ]
        },
        {
          "fieldId": 2,
          "names": [
            ""
          ]
        },
        {
          "fieldId": 3,
          "names": [
            "S1",
            "S2"
          ]
        },
        {
          "fieldId": 4,
          "names": []
        },
        {
          "fieldId": 5,
          "names": [
            "1",
            "2"
          ]
        }
      ]
    }
  ],
  "version": 5
}`);

	}
}

/*

XPSオブジェクトを引数にしてTDTSフォーマットで出力
暫定的にXDTSと互換のある　1ドキュメント/1タイムシートの形式でコンバート

*/
XPS2TDTS=function(myXps,career){
	if(typeof career != Object) career = TDTS.parseTdts(career);
	var headerString = "toeiDigitalTimeSheet Save Data";
//キャリアオブジェクトにXps情報を転記
	if ((myXps.opus)||(myXps.subtitle)) career.episode = myXps.getIdentifier('episode');
	if (myXps.scene) career.scene = myXps.scene;
	if (myXps.cut) career.cut = myXps.cut;
	career.timeTables[0].opratorName = myXps.update_user.handle;
	career.direction = myXps.xpsTracks.noteText;
//Xpsトラックに合わせて	TDTSのトラックを編集
	career.timeTables[0].duration = myXps.xpsTarcks.duration;
//	xpsTracksを順にサーチして、振り分け
	var bookTrack    =[];
	var soundTracks  =[];
	var timingTracks =[];
	var cameraTracks =[];
	for (var tx = 0 ;tx < myXps.xpsTarcks.length;tx ++ ){
		switch (myXps.xpsTracks[tx].option){
		case "still":
			bookTracks.push(myXps.xpsTracks[tx]);
		break;
		case "dialog":
		case "sound":
			soundTracks.push(myXps.xpsTracks[tx]);
		break;
		case "cell":
		case "timing":
		case "replacement":
			timingTracks.push(myXps.xpsTracks[tx]);
		break;
		case "camera":
		case "camerawork":
		case "geometry":
		case "composite":
		case "effect":
		case "sfx":
			cameraTracks.push(myXps.xpsTracks[tx]);
		break;
		default :
			continue;
		}
	}
//振り分けたトラックを処理
	career.timeTables[0].timeTableHeaders[0] = new TDTS.TimeTableHeader(0);
	career.timeTables[0].fields[0] = new TDTS.TimeTableField(0);
	for (var tx=0;tx<timingTracks.length;tx++){
		career.timeTables[0].timeTableHeaders[0].names.push(timingTracks[tx].id);
	}
	
	
	career.timeTables[0].timeTableHeaders[3] = new TDTS.TimeTableHeader(3);
	career.timeTables[0].fields[1] = new TDTS.TimeTableField(3);
	for (var tx=0;tx<soundTracks.length;tx++){
		career.timeTables[0].timeTableHeaders[3].names.push(soundTracks[tx].id);
	}

	career.timeTables[0].timeTableHeaders[5] = new TDTS.TimeTableHeader(5);
	career.timeTables[0].fields[2] = new TDTS.TimeTableField(5);
	for (var tx=0;tx<cameraTracks.length;tx++){
		career.timeTables[0].timeTableHeaders[5].names.push(cameraTracks[tx].id);
	}
	
	if(bookTrack.length >0){
		
	}
	
	return headerString+JSON.stringify(career);
}
/*
XPSオブジェクトを引数にしてXDTSフォーマットで出力
*/
XPS2XDTS=function(myXps){
	var headerString = "exchangeDigitalTimeSheet Save Data";
	return myXps.toString();
}

