/*	convertDialog2Text.jsx
	タイムシートからダイアログをパースして
	（主にTVPコンバートのため）
	テキストレイヤに変換するスクリプト
	無理やりだー　とは思うが実は結構役に立ちそうな気もする
	自動処理はまたそのうち
	
	新規に作成するワークセット名は _dialog_ _dialog2_ _dialog3_ 等　/_dialog\b*_/
	オプションでタイムシートにトラックを作成して積む　指定パネルがいるかも？
*/
// テキストレイヤに使用するフォント
var dialogFont="UDShinMGoPr6N-Light";

//Photoshop用ライブラリ読み込み
if(typeof app.nas =="undefined"){
   $.evalFile(new File(Folder.userData.fullName+'/nas/lib/Photoshop_Startup.jsx'));
}else{
   nas=app.nas;
}
//+++++++++++++++++++++++++++++++++ここまで共用
/*
追加ライブラリのロード
startupロードのオブジェクトは消失するので
nasオブジェクト配下以外のものは必要に従って以下のルーチンで読み込む
*/
var includeLibs=[];//読み込みライブラリを格納する配列
var nasLibFolderPath =  Folder.userData.fullName+"/nas/lib/";
var extLibFolderPath =  Folder.userData.fullName+"/nas/ext-lib/";
/*	ライブラリ読み込み
ここで必要なライブラリをリストに加えてから読み込みを行う
includeLibs.push(nasLibFolderPath+"psAnimationFrameClass.js");
*/
    includeLibs.push(nasLibFolderPath+"config.js");
    includeLibs.push(nasLibFolderPath+"nas.XpsStore.js");
    includeLibs.push(nasLibFolderPath+"xpsio.js");
    includeLibs.push(nasLibFolderPath+"mapio.js");
    includeLibs.push(nasLibFolderPath+"lib_STS.js");
    includeLibs.push(nasLibFolderPath+"lib_AEK.js");
    includeLibs.push(nasLibFolderPath+"lib_ARD.js");
    includeLibs.push(nasLibFolderPath+"lib_ARDJ.js");
    includeLibs.push(nasLibFolderPath+"lib_TSH.js");
    includeLibs.push(nasLibFolderPath+"lib_TSX.js");
    includeLibs.push(nasLibFolderPath+"lib_TVP.js");
    includeLibs.push(nasLibFolderPath+"lib_stylosCSV.js");
    includeLibs.push(nasLibFolderPath+"dataio.js");
    includeLibs.push(nasLibFolderPath+"fakeAE.js");
    includeLibs.push(nasLibFolderPath+"io.js");
    includeLibs.push(nasLibFolderPath+"xpsQueue.js");

    includeLibs.push(extLibFolderPath+"JSON/json2.js");
    includeLibs.push(extLibFolderPath+"ecl/ecl.js");
for(var ix=0 ;ix<includeLibs.length;ix++){
	var myScriptFileName=includeLibs[ix];
	//$.evalFile ファンクションで実行する
		$.evalFile(myScriptFileName);
}
//+++++++++++++++++++++++++++++++++追加ロード終了
//処理条件判定
/*
	ドキュメントが存在する
	対照ドキュメントと同名のxpsデータが存在する
	未処理である（ドキュメント上にレイヤセット"/_dialog[0-9]*_/"が無い）
*/
var EXFlag=true;var msg=""

try{
	var TargetDocument=app.activeDocument;
	var myTargetXPS=new File((app.activeDocument.path.fullName+"/"+ app.activeDocument.name).replace(/psd$/i,"xps"));
	EXFlag=(TargetDocument.layers.length)?false:true;
	EXFlag=myTargetXPS.exists;
}catch(er){
	EXFlag=false;
	msg="処理対象のデータがありません";
}
if(EXFlag){
try{
		EXFlag=(TargetDocument.layerSets.getByName("_dialog_"))?EXFlag:true;//ここはエラー出るとtrue?
		if(!EXFlag) msg="既に処理済みです。再実行の前に台詞ボールドは削除して下さい。";
}catch(er){
	EXFlag=true;
}
}
if(! EXFlag){
	alert(msg);
}else{

/*
	XPS用簡易ダイアログ他音声トラックパーサ

	音声系トラックのパースを行いセクションコレクションを戻すアルゴリズム
	単純
	データ列を順次チェック
	MAPへの問い合わせは基本的に無し
*/
/*
簡易オブジェクトで実装
エレメントのラップもしない

nas.AnimationDialog Object
　同名のオブジェクトとの互換はあまり考えない
　名前が同じだけと思うが吉
　タイムシートサウンドトラックの値となる
　外部ファイルリンクはこの際割愛

bodyStream();	タイムシート内のストリームをテキストで取り出す（メソッド）
contentText;	String	内容テキスト原文　"たぬきさん(off)「ぽん！(SE:ポン)ぽこ！<BGM:開始>りん！[光る！]」"
name;	String	ラベルとなる名称	"たぬきさん"
bodyText;	String	台詞本体のテキスト　"ぽん！ぽこ！りん！"
attributes;	Array	オブジェクト属性配列 ["(off)"] 
comments;	Array	ノートコメントコレクション配列 [[3,"(SE:ポン)"],[6,"<BGM:開始>"],[9,"[光る！]"]]
*/
nas.AnimationDialog=function(myContent){
//	this.source;
//	this.duration;
//	this.startOffset;
	this.contentText=myContent;
	this.name="";
	this.bodyText="";
	this.attributes=[];
	this.comments=[];
}
//
/*
	初期化時の内容テキスト（シナリオ型式）をパースしてオブジェクト化するメソッド
	本来は自動実行だが、今回は必要に従ってコールする
*/
nas.AnimationDialog.prototype.parseContent=function(){
	if(this.contentText.length){
		if(this.contentText.match(/^([^"'「]*)["'「]([^"'」]*)["'」]?$/)){ ;//"
			this.name=RegExp.$1;
			this.bodyText=RegExp.$2;
		}else{
			this.name="";
			this.bodyText=this.contentText;
		}
		var myAttributes=this.name.match(/\([^)]+\)/g)
		if(myAttributes){
			this.attributes=myAttributes;
			this.name=this.name.replace(/\([^)]+\)/g,"");
		}
		//					本文内からコメントを抽出
		var myComments=this.bodyText.match(/(<[^<>]+>|\[[^\[\]]+\]|\([^\(\)]+\))/g);
		if(myComments){
			this.comments=[];//newArray　再初期化
			var myString=this.bodyText;//修正テキスト
			var prevIndex=0;var noteOffset=0;
			for (var cix=0;cix<myComments.length;cix++){
                noteOffset=myString.indexOf(myComments[cix]);//修正テキスト内コメント挿入位置
				this.comments.push([prevIndex+noteOffset,myComments[cix]]);
				prevIndex += noteOffset;
				myString=myString.slice(noteOffset+myComments[cix].length);
			}
			this.bodyText=this.bodyText.replace(/(<[^<>]+>|\[[^\[\]]+\]|\([^\(\)]+\))/g,"");
		}
		return this.toString();
	}else{return false;}	
}
/*
プロパティを組み上げてシナリオ型式のテキストを返す
*/
nas.AnimationDialog.prototype.toString=function(){
	var myResult=this.name;
	myResult+=this.attributes.join("");
	myResult+="「";
	var startPt=0;
	if(this.comments.length){var endPt=this.comments[0][0]}else{var endPt=0};
for(var cix=0;cix<this.comments.length;cix++){
	myResult+=this.bodyText.slice(startPt,endPt)+this.comments[cix][1];
	startPt=endPt;
	if(cix<this.comments.length-1){endPt=this.comments[cix+1][0]};
}
if(startPt<this.bodyText.length){myResult+=this.bodyText.slice(startPt)};
	myResult+="」";
 return myResult;
}
//	test
//A=new  nas.AnimationDialog("たぬきさん(off)「ぽん！(SE:ポン)ぽこ！<BGM:開始>りん！[光る！]とうりゃぁー！！」");
//A.parseContent();
//A

//タイムラインをダイアログパースする
/*
	引数は、ストリーム文字列又は配列
	配列は１次のみ
	音響開始マーカーのために、本来XPSのプロパティを確認しないといけないが、
	今回は省略
	開始マーカーは省略不可でフレーム０からしか位置できない（＝音響の開始は第１フレームから）
	後から仕様に合わせて再実装
	判定内容は
	/^[-_]{3,4}$/	開始・終了マーカー
	/^\([^\)]+\)$|^<[^>]+>$|^\[[^\]]+\]$/	インラインコメント
	その他は
	ブランク中ならばラベル
	音響Object区間ならばコンテントテキストに積む　空白は無視する
	⇒セリフ中の空白は消失するので、空白で調整をとっている台詞は不可
	オリジナルとの照合が必要な場合は本文中の空白を削除した状態で評価すること
	
*/
parseSoundTrack =function(myStream){
	if(!(myStream instanceof Array)){myStream=myStream.split(",")};
	var myResultTL=new XpsTimelineTrack("temp","dialog");
	//この実装では開始マーカーが０フレームにしか位置できないので必ずブランクセクションが発生する
	//継続時間０で先に作成 同時にカラのサウンドObjectを生成
	var currentSection=myResultTL.addSection(false);
	var currentSound=new nas.AnimationDialog("");//コンテンツはカラで初期化も保留
	for (var fix=0;fix<myStream.length;fix++){
		currentSection.duration ++;//currentセクションの継続長を加算
		//未記入データ　これが一番多いので最初に処理しておく
		if(myStream[fix]==""){
			continue;
		}
		//括弧でエスケープされたコメント又は属性
		if(myStream[fix].match(/^(\([^\)]+\)$|^<[^>]+>$|^\[[^\]]+\])$/)){
			if(currentSection.value){
				currentSound.comments.push([currentSound.bodyText.length,RegExp.$1]);
			}else{
				currentSound.attributes.push(RegExp.$1);
			}
			continue;
		}
		//セクションセパレータ　少ない
		if(myStream[fix].match(/^[-_]{3,4}$/)){
			if(currentSection.value){
				currentSection.duration --;//加算した継続長をキャンセル
				currentSection.value.contentText=currentSound.toString();//先の有値セクションをフラッシュして
				currentSection=myResultTL.addSection(false);//新規のカラセクションを作る
				currentSection.duration ++;//キャンセル分を後方区間に加算
				currentSound=new nas.AnimationDialog("");//サウンドを新規作成
			}else{
				currentSection=myResultTL.addSection(currentSound);//新規有値セクション作成
			}
			continue;
		}
//判定を全て抜けたデータは本文又はラベル　ラベルは上書きで更新
		if(currentSection.value){
			if(myStream[fix]=="|") myStream[fix]="ー";
			currentSound.bodyText+=myStream[fix];
		}else{
			currentSound.name=myStream[fix];
		}
	}
	return myResultTL;
}

//	 ダイアログタイムラインからから置きかえタイムラインへ変換したストリームを返すメソッド
/*
	 この置換えタイムラインの扱いを簡略化するために、タイムラインの統合は行なわない
	 台詞ボールドは必ず、トラックごとにレイヤセットを設けること
	 
	 Xpsに台詞用置きかえタイムラインを挿入するのは望ましくないので
	 まず行わない
	 望ましくは、psAxeではダイアログタイムラインのまま台詞ボールドを扱う
	 TVPaint用としては"[layerID][frameNo] _dialog#_-#"レイヤ名を与える
*/

XpsTimelineTrack.prototype.convertReplacement=function(){
	var myResult="";var currentIdx=1;
	for(var ix=0;ix<this.sections.length;ix++){
		currentSectionArray= new Array(this.sections[ix].duration);
		if(this.sections[ix].value){
			currentSectionArray[0]=currentIdx;
			currentIdx++;
		}else{
			currentSectionArray[0]="X";
		}
		myResult+=currentSectionArray.join(",");
	}
	return myResult;
}
// ダイアログタイムラインデータから台詞入りテキストを作成する
/*
	引数はダイアログタイムライン
*/
function addDialogLayers(myDialog,trackCount){
		var targetWorkset;
		var setName="_dialog"+((trackCount>1)?trackCount:"")+"_";
	try{
		targetWorkset = app.activeDocument.layers.getByName(setName);
	}catch(err){
		targetWorkset = false;
	}
	if(targetWorkset){
		alert("既にダイアログレイヤセットがあります　処理は中断されました");
	}else{
		targetWorkset=app.activeDocument.layerSets.add();
		targetWorkset.name=setName;
		var lyId=1;
		for (var ix=0;ix<myDialog.sections.length;ix++){
			var currentDialog=myDialog.sections[ix].value;
	if(currentDialog){
//各種テキストを配置
var myTextLayer=targetWorkset.artLayers.add();//レイヤ追加
  myTextLayer.kind = LayerKind.TEXT;//テキストレイヤに変換
  myTextLayer.textItem.contents = currentDialog.toString();
  myTextLayer.name=setName+"-"+lyId;
  lyId++;
  myTextLayer.textItem.font=dialogFont;
	app.preferences.rulerUnits = Units.POINTS;
  myTextLayer.textItem.size = 32;//32ポ
	//バグが発生した場合指定ポイント数と異なるデータが返るのでそれを判定
if (Math.round(myTextLayer.textItem.size.as("point"))!=32){
  nas.PSCCFontSizeFix.setFontSizePoints( myTextLayer, 32);//32ポ
}
var myTextOffsetX=(((myTextLayer.bounds[2]-myTextLayer.bounds[0])/2)+myTextLayer.bounds[0]).as("mm");
var myTextOffsetY=(((myTextLayer.bounds[3]-myTextLayer.bounds[1])/2)+myTextLayer.bounds[1]).as("mm");

  myTextLayer.translate(
	new UnitValue((app.activeDocument.width.as("mm")/2-myTextOffsetX)+" mm" ),
	new UnitValue(((app.activeDocument.height.as("mm")-30)-myTextOffsetY)+" mm" )
  );//センタリング・ドキュメント上から170mmへ
	}
		}
	}

}
/* test data
var testData=",,,娘,(VO),----,だ,,,っ,,,て,,,だ,,,っ,,,て,,----,,,,,<息>,----,ソ,,,レ,,,じ,,,ゃ,,,ダ,,,メ,,,じ,,,ゃ,,,ん,,,!,,,も,,,|,,,,,,,,----,,,,,,,,,,,,,,,,,,,,,,,,"
A=parseSoundTrack(testData);
// A.convertReplacement();

addDialogLayers(A);
アクティブドキュメントを確認
対応するシートを開く
ダイアログトラックを確認して動作確認ダイアログでユーザの実行承認をとる
ドキュメントにテキストレイヤを追加
TVP用のレイヤー名を割りつける…？
*/
	var XPS=new Xps();
	var myContent="";

	var myOpenfile = new File(myTargetXPS.fsName);
	myOpenfile.encoding="UTF8";
	myOpenfile.open("r");
	myContent = myOpenfile.read();
	if(myContent.length==0){alert("Zero Length!");}
	myOpenfile.close();

	if(!(XPS.readIN(myContent))){
		alert("XXX:"+XPS.errorMsg[XPS.errorCode]);
	}else{
		var currentType="dialog";var trackCount=1;
		for (var dix=0;dix<XPS.xpsBody.length-1;dix++){
			if(dix>0){currentType=XPS.layers[dix-1].option};
			if(currentType=="dialog"){
				addDialogLayers(parseSoundTrack(XPS.xpsBody[dix]),trackCount);
				trackCount++;
			}
		}
	}
}