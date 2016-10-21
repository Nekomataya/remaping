/**
 *  pmio.js
 *  production managemaent io
 *
 *  nas.Pm　は　管理情報を分離するためのオブジェクト群
 *
 *  PmUnitを中核にしてそれに含まれる被管理情報をオブジェクトとして保持する
 *
 *  PmUnitは Management Unit(マネジメントユニット)を表す
 *  ＝カット袋に相当するオブジェクトの拡張機能＝
 *
 *  制作ライン及びステージングを管理するためのオブジェクト
 *  カレントの　ライン、ステージ、ジョブの値をひとまとめに保持する
 *  制作上の既経路を保持
 *  エレメントグループに対する変更権の保持（ラインが持つ情報）
 *  及びこれらの情報に対するアクセスを受け持つ
 *  開始時間　伝票番号　担当ユーザなどを参照・設定・変更が可能
 *  オブジェクト初期化時点では、空のオブジェクトを作成する
 *
 *  カット管理を行う場合は　ALLアセットを、他の個別素材の場合は個別アセットを引数にして初期化のこと
 */

nas.Pm = {};

/**
 * @method
 * オブジェクトメソッド
 * @desc
 *	コレクション内にkeywordに一致するプロパティを持っているメンバーがあればそれを返す 汎用
 * @param {string}	keyword
 * @return {property}
 *	memberProp 
 * 検索に失敗したらfalse
 *
 */
nas.Pm._getTemplate=function(keyword){
　if(this[keyword]) return this[keyword];
　for (var prp in this){
　	if(	(this[prp].id==keyword)||
　		(this[prp].name==keyword)||
　		(this[prp].projectName==keyword)||
　		(this[prp].shortName==keyword)||
　		(this[prp].fullName==keyword)||
		(this[prp].code==keyword)) return this[prp];
　}
　return false;
}

/** ProductionManagementNode
 * 制作管理オブジェクト
 * @constractor
 *　制作管理オブジェクトは、それぞれの管理単位（PmUnit=カット袋）についての制作管理部分を抽出したオブジェクトである。
 * BANK等の管理移管時データ独立性を持たせるために分離される
 * ラインごとに各PmUnitのプロパティとして登録され、ラインの開始条件及び終了条件の判定を含む
 *
 */
nas.Pm.PmNode=function PmNode(targetAsset,myName){
	this.target = targetAsset;//管理単位のゴールを設定
	this.name=myName;
	this.jobID;
	this.jobs=[];//空コレクションで初期化
	this.stageID;
	this.stages=[];
	this.lineID;
	this.lines=[];
}
/*
Pmuコンストラクタ

PMU= new PmUnit(scObjects);

	SCiCオブジェクトを配列で与えて初期化する。
複数オブジェクトを持つ場合は　兼用カットとして処理する
クラスメソッドを使って後から編集可能
カット番号等のムービー内での識別情報が複数入っている
また、集合全体の進捗情報が格納されている
作品情報・管理フラグ・カットコレクション・進捗情報・素材DBを持つ
素材DBは、
*/

nas.Pm.PmNode=function(mySCs){
	//初期パラメータの中の第一要素の情報で識別名を作る
	this.body	=	mySCs;//
	this.cut	=	this.body[0].cut;//
	this.scene	=	this.body[0].myScene;//
	this.subtitle	=	mySubTitle;//文字列又は参照
//サブタイトル記述はDBと接続のない場合は別途入力するか、又は空白のまま保留
	this.opus	=	myOpus;//識別文字列（リレーション　または　ProductOpusオブジェクト）
	this.title	=	myTitle;//識別文字列（リレーション　または　ProductTitleオブジェクト）
	this.inherit=mySCs;
	this.pmNode=new nas.PmNode();
}

nas.Pm.PmNode.prototype.toString=function(){
	return this.body.reverse().join("_");
//toString()メソッドは、出力用に調整する
}
//制作管理用　WorkTitelオブジェクト
/*
nas.Pm.newWorkTitle(タイトル識別子)
オブジェクトメソッドで初期化する
戻り値はタイトル情報オブジェクト
実運用上はDBとリンクして動作するように調整

クラスメソッドとしての初期化機能は保留
*/
nas.Pm.WorkTitle = function(){
	this.id;			//DB接続用index
	this.projectName;	//タイトル
	this.fullName;		//完全な文字列
	this.shortName;		//表示用短縮名
	this.code;			//ファイル名使用の略号2~3文字アルファベット限定
	this.framerate;		//Object nas.Framerate	フレームレート
	this.length;		//String 納品定尺フレーム数　または　nasTC
	this.inputMedia;	//Object nas.AnimationField スタンダードフレーム
	this.outputMedia;	//Object nas.AnimationField 編集スペック
}
nas.Pm.WorkTitle.prototype.toString=function(tragetProp){
		if(typeof tragetProp == "undefined") tragetProp="projectName";
				return this[tragetProp];
	}
nas.Pm.WorkTitle.prototype.valueOf=function(){return this.id;}

nas.Pm.titles= function(title){
	var result=this.getTitle(title);
};

//タイトル登録メソッド
nas.Pm.titles.addTitle=function(titleName,propList){
	this[titleName]=new nas.Pm.WorkTitle();
	this[titleName].projectName	=titleName;
	this[titleName].id	=propList[0];
	this[titleName].fullName	=propList[1];
	this[titleName].shortName	=propList[2];
	this[titleName].code	=propList[3];
	this[titleName].framerate	=new nas.Framerate(propList[4]);
	this[titleName].length	=nas.FCT2Frm(propList[5]);
	this[titleName].inputMedia	=propList[6];
	this[titleName].outputMedia	=propList[7];
}

nas.Pm.titles.getTitle=nas.Pm._getTemplate;
//メディアDB
/*
メディアDBは、入出力のメディアスペックを記述するための複合オブジェクト
MAP内部ではワークタイトルに付属する情報として処理
*/
nas.Pm.ProductionMedia= function(mediaName,animationField,frameRate){
	this.id=
	this.animationField=new nas.AnimationField();
	this.mediaName=this.animationField.name;
	this.baseResolution=new nas.UnitResolution();//
	this.type;//mediaType	drawing/video
	this.baseWidth=this.animationField.baseWidth;
	this.frameAspect=this.animationField.frameAspect;
	this.frameRate=new nas.Framerate();
	this.tcType;//string tradJA/SMPTE/TC/frame
	this.pegForm=this.animationField.peg;//animationField.peg
	this.pegOffset=this.animationField.pegOffset;
	this.pixelAspect;//float
	this.description;
}
//
nas.Pm.medias=function(mediaName){
	return this.getMedeia(mediaName);
}
nas.Pm.medias.addMedia=function(mediaName,propList){
	this[mediaName]=new nas.Pm.ProductionMedia();
	this[mediaName].mediaName	=mediaName;
	this[mediaName].id	=propList[0];
	this[mediaName].animationField	=propList[1];
	this[mediaName].baseResolution	=propList[2];
	this[mediaName].mediaType	=propList[3];
	this[mediaName].tcType	=new nas.Framerate(propList[4]);
	this[mediaName].pegForm	=nas.FCT2Frm(propList[5]);
	this[mediaName].pixelAspect	=propList[6];
	this[mediaName].description	=propList[7];
}
nas.Pm.medias.getMedia=nas.Pm._getTemplate;

//制作管理用　Opusオブジェクト
/*
 *nas.Pm.newOpus(タイトル識別子)
 *　// nas.Pm.newOpus(識別ID)
 *nas.Pm.newOpus(管理話数名,タイトル)
 *オブジェクトメソッドで初期化する
 *戻り値は管理単位情報オブジェクト
 *実運用上はDBとリンクして動作するように調整
 *
 *クラスメソッドとしての初期化機能は保留
*/
nas.Pm.Opus = function Opus(myID,myOpus,mySubtitle,myTitle){
	this.id=myID;		//DB接続用index
	this.name=myOpus;		//表示名　話数／制作番号等
	this.subTitle=mySubtitle;	//サブタイトル文字列
	this.workTitle=myTitle;	//Object nas.WorkTitle
	this.toString=function(){return this.name} 
	this.valueOf=function(){return this.id} 
}
/*制作管理用	Assetオブジェクト
 *アセットベースの管理を行う
 *このシステム上のアセットは、通常XPSを介して時間／空間的に配置された再利用可能データ群を指す
 *XPSを持たない場合もある（時間構造を持たない）
 *
 *作品内でユニークな識別名を持つ管理用のキーオブジェクトに結合されたデータ群を総称するもの、
 *管理用オブジェクトは以下のプロパティを持つ
 *	name	String	識別名称:作品内での一意性を求められる
 *	hasXPS	Boolean　アセットがXPS（時間構造）を持つかのフラグ
 *	code	String	省略表記用短縮コード　２〜３バイトを推奨　ユニークであること
 *	shortName	String	画面表示用略称	８文字程度までを推奨　指定のない場合はnameを転用
 *	description	String	アセットの説明	ユーザのために必用
 *	endNode	Boolean	アセットがラインを終了させうるか否かのフラグ　このフラグのあるアセットは、制作ラインの目標となりラインを収束させる
 *	callStage	Array　ステージ識別名配列　当該アセットを受けて（入力として）開始することが可能なステージ群　ユーザが選択する　一つのアセットを受けて２つ以上のステージを開始する場合、ライン分岐が発生する
 *
*/
nas.Pm.Asset = function(){
	this.name;
	this.hasXPS;
	this.code;
	this.shortName;
	this.description;
	this.endNode;
	this.callStage;
}

nas.Pm.Asset.prototype.toString=function(){return this.name}


nas.Pm.assets = function(assetName){
	var result= this.assets.getAsset(assetName)
	return result;
};
//アセット登録メソッド
nas.Pm.assets.addAsset=function(assetName,propList){
	this[assetName]=new nas.Pm.Asset();
	this[assetName].name=propList[0];
	this[assetName].hasXPS=(propList[1])?true:false;
	this[assetName].code=propList[2];
	this[assetName].shortName=propList[3];
	this[assetName].description=propList[4];
	this[assetName].endNode=(propList[5])?true:false;
	this[assetName].callStage=propList[6];
}

nas.Pm.assets.getAsset=nas.Pm._getTemplate;
/*	
	return [	this[assetName].name,
				this[assetName].hasXPS,
				this[assetName].code,
				this[assetName].shortName,
				this[assetName].description,
				this[assetName].endNode,
				"["+(this[assetName].callStage).join()+"]"
	];
*/	

/*制作管理用	Jobオブジェクト
 *プロパティ
 *	name	String:	ジョブ名
 *　//	line	Object:Line 所属ライン＜＜不要 stage にライン情報が含まれるので不用
 *	stage	Object:Stage 所属ステージ　
 *	type	Number:typeID 0:init/1:primary/2~:check/　当該Jobのタイプ
 *	id	Number:Index ステージ内でのユニークID　自己アクセスのための配列インデックスを内部保持
 * jobId生成規則
 * 管理単位内部でユニークな整数ID　重複不可　飛び番等は許容される
 * DB連結時はDBへの照合プロパティになるので初期化時には引数として外部から与えるのが基本
 * 引数が与えられない（＝DB連結が無い）場合は、その場での自動生成を行う
 *　その際のルールは、同PmUnit内部での出現順連番 
 *	currentStatus	String:ステータス　startup|active<>hold|fixed
 *	createUser	String:UID
 *	createDate	String:DATE
 *	updateUser	String:UID
 *	updateDate	String:DATE
 *	slipNumber	String:伝票番号
 *new Job(jobName?)
*/
nas.Pm.ProductionJob=function ProductionJob(myName,myStage,myIndex,mySlipNumber){
	this.name=myName;
	this.stage=myStage;
//	if(! myStage){alert("stage Argument is :"+myStage)}
	this.type;
	this.id = (typeof myIndex == "undefined")? null:myIndex;//
	this.currentStatus;//
	this.createUser;//
	this.createDate=new Date();//
	this.updateUser;//
	this.updateDate;//
	this.slipNumber;//
};
nas.Pm.ProductionJob.prototype.getPath=function(){return [this.name,this.stage.getPath()].join(".");}

nas.Pm.ProductionJob.prototype.toString=function(){
	var myResult="";
//	myResult+="##["+this.stage.name+"][["+this.name+"]"+"id:"+this.id+"]\n";
	myResult+="##[["+this.name+"]"+"id:"+this.id+"]\n";
	myResult+="##created="+this.createDate+"/"+this.createUser+";\n";
	myResult+="##updated="+this.createDate+"/"+this.createUser+";\n";
		var myGroups=new Array();
	var myMapElements=this.stage.line.parent.elementStore;
	//エレメント総当りで　ジョブに対応するグループを抽出
	for (var eID=0;eID<myMapElements.length;eID++){
		if((myMapElements[eID] instanceof nas.xMapGroup)&&(myMapElements[eID].link===this.stage)){
			myGroups.push(myMapElements[eID].link);	
		}
	}
	//登録グループごとにエレメント総当りで　ジョブ内のグループに対応するエレメントを抽出して出力に加算
	for (var gID=0;gID<myGroups.length;gID++){
		myResult+="["+myGroup[gID].name+"\t"+myGroup[gID].type+"]\n";
	  for (var eID=0;eID<myMapElements.length;eID++){
		if((myMapElements[eID] instanceof nas.xMapElement)&&(myMapElements[eID].link===this)){
			myResult+=myMapElements[eID].toString();//
		}
	  }
//		myResult+="["+myGroup[gID].name+"]/\n";//グループ終了子は省略可
	}
	myResult+="##[["+this.name+"]]/\n";
	return myResult;
};
/*制作管理用 Stageオブジェクト
 *
 *	name	String	識別名称:作品内での一意性を求められる
 *	line	Object	ステージが所属するラインへの参照
 *	code	String	省略表記用短縮コード　２〜３バイトを推奨　ユニークであること
 *	shortName	String	画面表示用略称	８文字程度までを推奨　指定のない場合はnameを転用
 *	description	String	ステージの説明	ユーザのために必用
 *	output	Asset	ステージの出力アセット
*/
nas.Pm.ProductionStage=function(){
	this.line=nas.Pm.lines("null");
	this.name;
	this.code;
	this.shortName;
	this.description;
	this.output;
}
nas.Pm.ProductionStage.prototype.getPath=function(){return [this.name,this.line.getPath()].join(".")}
nas.Pm.newStage=function(myStage,myLine){
	var newStage= nas.Pm.stages.getStage(myStage);
	if(newStage){
		newStage.line=myLine;
		return newStage;
	}else{
		//ステージは未登録なので、新規ステージ編集？
		newStage= new nas.Pm.Stage();
		newStage.line=myLine;newStage.name=myStage;
		return newSatge;
　　}
}
nas.Pm.ProductionStage.prototype.toString=function(){return this.name};
/*				ステージストア
 *
 *クラス内でDBとして働くオブジェクト
 *このオブジェクトがDBと通信する
*/
nas.Pm.stages = function(stageName){
		var result = this.stages.getStage(stageName);
	result.jobs=new Array();
	return result;
};
//ステージコレクション追加メソッド
nas.Pm.stages.addStage=function(stageName,propList){
	this[stageName]=new nas.Pm.ProductionStage();//ラインと
	this[stageName].name=propList[0];
	this[stageName].code=propList[1];
	this[stageName].shortName=propList[2];
	this[stageName].description=propList[3];
	this[stageName].output=propList[4];
}

nas.Pm.stages.getStage=nas.Pm._getTemplate;

/*
定義テーブルからテンプレートを取得するための機能
名前と検索先(指定がない場合はcallerから判定)を与えて、その定義テーブル内のオブジェクト引数を返す
あたるべきプロパティはname,code,shortName,fullName オブジェクトによってはいくつかのプロパティを持たないものものある

*/

/*制作管理用	ProductionLineオブジェクト

	name	String	識別名称:作品内での一意性を求められる
	shortName	String	画面表示用略称	８文字程度までを推奨　指定のない場合はnameを転用
	outputAsset	Asset	ラインの出力アセット
	initAsset	Asset	ラインの入力アセット
	code	String	省略表記用短縮コード　２〜３バイトを推奨　ユニークであること
	description	String	ラインの説明	ユーザのために必用

*/

nas.Pm.ProductionLine=function(){
	this.name;
	this.shortName;
	this.outputAsset;
	this.initAsset;
	this.code;
	this.description;
}

nas.Pm.ProductionLine.prototype.getPath=function(){return this.name;}

nas.Pm.ProductionLine.prototype.toString=function(){return this.name};
/*				ラインストア

クラス内でDBとして働くオブジェクト
このオブジェクトがDBと通信する
*/
nas.Pm.lines= function(lineName){
	var result = this.lines.getLine(lineName);
	result.stages=new Array();
	return result;
};

//ライン編集メソッド
nas.Pm.lines.addLine=function(lineName,propList){
	this[lineName]=new nas.Pm.ProductionLine();
	this[lineName].name=propList[0];
	this[lineName].shortName=propList[1];
	this[lineName].outputAsset=propList[2];
	this[lineName].initAsset=nas.Pm.assets(propList[3]);
	this[lineName].code=propList[4];
	this[lineName].description=propList[5];
}
/*ラインテンプレートの中から指定された名前と一致するオブジェクトを戻す
lineNameと一致していればそのまま、一致するものがない場合はname/shortName/codeを検索してその順で最初に一致したものを戻す
*/
nas.Pm.lines.getLine=nas.Pm._getTemplate;

//制作管理用	SCオブジェクト
/*
新規オブジェクト作成は以下のクラスメソッドを利用されたし

nas.Pm.newSC(カット識別子,時間指定文字列);

カット識別子を与えて初期化
分解はクラスメソッドで行う
格納はプロパティを分けて、可能ならばDBと比較対照して校正する？
識別子がフルで与えられなかった場合は、現在アクティブなPmでポイントしている作品で補う

識別子はMapフォーマットドキュメントを参照
[TITLE(セパレータ)][Oo#]OPUS(セパレータ)][[Ss]SCENE(セパレータ)?[Cc]CUT
例：
nas.Pm.newSC("ktc#01.s-c123","3+12,OL(1+12),--(0+0)",frameRate)

*/
/**
 * SCオブジェクトコンストラクタ
 * コンストラクタの引数は、分離を終えた状態で与える
 * プロパティの不足は呼び出し側（newSCi）で行う
 * コンストラクタ内でのチェックはしない
 */
nas.Pm.SC =function SC(cutName,sceneName,myOpus,myTime,myTRin,myTRout,myRate,myFrate){
	this.id;//DB連結用　DBに接続していない場合はundefined
	this.cut	=	cutName;//
	this.scene	=	sceneName;//
	this.opus	=	myOpus;//Object nas.Pm.Opus
	this.workTitle	=	this.opus.workTitle ;//Object nsa.Pm.WorkTitle参照
	this.time	=	myTime;//ここでは静的プロパティ  フレーム数で記録
	this.trin	=	myTRin;//[0,"trin"];//後で初期化
	this.trout	=	myTRout;//[0,"trout"];//後で初期化
	this.framerate=myFrate;	//Object nas.Framerate;
}
nas.Pm.SC.prototype.toString	=function(){
	var myResult="";
	if(arguments.length){
		myResult+= "##CUT="+this.cut+"\n";
		myResult+= "##SCENE="+this.scene+"\n";
		myResult+= this.opus.toString(true)+"\n";
		myResult+= "##TIME="+this.time+"\n";
		myResult+= "##TRIN="+this.trin+"\n";
		myResult+= "##TROUT="+this.trout+"\n";
		myResult+= "##FRAME_RATE="+this.cut+"\n";
	}else{ 
		myResult+=["s",this.scene,"-",this.cut].join("");
	}
	return myResult;
	};//
nas.Pm.SC.prototype.valueOf	=function(){return this.id;};//

/**
Pmクラスメソッド


*/
nas.Pm.newSC=function(myTitleString,myTimeString,myRateString){
	var myInfo=nas.separateTitleString(myTitleString)
		var myOpus = nas.newOpus(myInfo[2],myInfo[3]);
			var myTimeInfo=nas.perseTimeString(myTimeString);
			var myRate =(myRateString)? new nas.Framerate(myRateString):myOpus.workTitle.framerate;
	var myTime=myTimeInfo[0];
	var myTrin=myTimeInfo[1];
	return new nas.Pm.SC(myInfo[0],myInfo[1],myOpus,myTimeInfo[0],myTimeInfo[1],myTimeInfo[2],myRate);
}
//Test
//　A=nas.Pm.newSC("mte02")

/*
	管理ライン

new nas.Pm.Issue(Line or LineName,IssueID)
発行されたライン情報
.lineId;	String/ 識別ID　	文字列処理　専用のパーサを作る
.lineName;	String/ 識別名
.line	Object/Line	
.checkOut;	string/	date / user
.checkOutDate;	string/	date / user
.checkIn;	String/	date / user
.checkInDate;	String/	date / user
.currentStatus;	String/ Startup,Active,Hold,Fixed,Aborted
制御関連は各ステージの持つアセットがステージ内で完結する構造により無用の概念となる
更新権利の概念は消失したので不要　これを持って制御する事項が無い
アセット（ステージ）間の衝突の検知は必用

作業状態の遷移
		startup	初期化状態（未着手）
		↓（一方通行）
		active	⇐⇒	hold
		↓				↓
		   fixed/aborted
activeには本作業中とチェック作業中が含まれる
holdは、作業をサーバ側で預かっている状態　作業権限の無いユーザはアクティブに遷移出来ない
fixedは、ラインの作業が完成した状態
abortedは、ライン自体が中断（破棄）された状態　中断からの復帰が可能なので　reject.discard,destruct 等では無いが実質同等
ステータス属性はラインの状態

*/
nas.Pm.Issue=function(myLine,myID){
	this.line=(myLine instanceof nas.Pm.ProductionLine)?　myLine:undefined;//Object:Pm.line if exists link
	//名前指定時は　次の拡張では初期化時点でシステム上の既存ラインを検索、存在しない場合はライン新規登録用の機能を呼び出す
	this.lineId=new String(myID);//String:index 
	this.lineName=(myLine instanceof nas.Pm.ProductionLine)? this.line.name:myLine;//String:name
	this.lineCheckOut=nas.CURRENTUSER;//String:uid
	this.lineCheckOutDate=new Date();//Date;
	this.lineCheckIn;//String:uid undefined
	this.lineCheckInDate;//Date: undefined
	this.currentStatus="startup";//String:startup active hold fixed aborted 
}
nas.Pm.Issue.prototype.toString=function(){
	var myResult="";
	myResult+="##CHECK_OUT=("+this.lineName+"):"+this.lineId+" / "+this.lineCheckOutDate.toNASString()+" / "+this.lineCheckOut +";\n";
	if(this.lineCheckInDate)
	myResult+="##CHECK_IN=("+this.lineName+"):"+this.lineId+" / "+this.lineCheckInDate+" / "+this.lineCheckIn +";\n";
	return myResult
}
/*
	LineIssues
	issue  コレクション
	発行されたライン記述をパースする機能と文字列化する機能をオブジェクトメソッドで加える
	支線の発行/合流機能を持たせる
	LineIssues.branch(newIssue)	:	boranchedLines
		自分自身の現在のコピーをつくって新たなIssues オブジェクトで返す
	LineIssues.merge(LineIssues)	:	mergedLines
		与えられたIssuesをマージする。コンフリクト判定が必用
	LineIssues.parse(LineString)	:	initLinesItself
	


	本体にチェックインされてクローズされたブランチを戻す
	引数無しでコールされた場合、条件をチェックして可能なら本体をクローズする
	
	LineIssues.toString()	:	LineString
	LineIssues.valueOf()	:	currentIssue

これらのメソッドは、さらに外側のｘMapにも同名メソッドが必用
このメソッドはそちらから呼ばれるのが前提でありユーザやアプリケーションが直接呼び出すことは無いとしておく
不正引数のハンドリングはしない

ライン発行コレクションはラインの作業状態を保持するコレクション
作業状態はアクティブなラインの作業状態を保存する＞＞ステージ／ジョブの作業状態が反映される
日付情報は、チェックアウト・チェックインを独自に保存
*/
nas.Pm.LineIssues=function LineIssues(myIssue,myParent){
	this.currentId=0;//Int currentLine Array index
	this.body=[myIssue];// Object Array;
	this.parent=myParent;//Object xMap;
}
/*
*/
nas.Pm.LineIssues.prototype.valueOf =function(){return this.body[this.id]};
nas.Pm.LineIssues.prototype.toString=function(){
	var myResult="";
	myResult+="##LINE_ID=("+ this.body[this.currentId].lineName +"):"+this.body[this.currentId].lineId+"\n";
	myResult+="##currentStatus="+ this.body[this.currentId].currentStatus+"\n";
	for (var iix=0;iix<this.body.length;iix++){myResult+=this.body[iix].toString();}
	return myResult;
}
/*	branch(新規ライン名)
	ブランチ
	既存のラインと同名のブランチが指定された場合ブランチは失敗 false を戻す
	ただし現在の実装だと、支線側で親のラインを把握していないので　重複の可能性を排除できない
	DB接続時は、マスターDBに問い合わせを行う処理が必用
	最終的には同名のラインは許容される
*/
nas.Pm.LineIssues.prototype.branch=function(newLineName){
	for(var ix =0;ix<this.body.length;ix++){if(this.body[ix].lineName==newLineName) return false;};//重複をリジェクト
	var currentDepth=this.body[this.currentId].lineId.split(":").length;//現在の分岐深度
	var branchCount=0;
	for(var ix =0;ix<this.body.length;ix++){if(this.body[ix].lineId.split(":").length==currentDepth) branchCount++;};
	var newBranchId=(this.body[this.currentId].lineId=="0")? branchCount :this.body[this.currentId].lineId+":"+branchCount;
	var newIssue=new nas.Pm.Issue(newLineName,newBranchId);
	this.body.push(newIssue);
	var newIssues=new nas.Pm.LineIssues(newIssue);
	return newIssues;
}
/*	merge(Issueオブジェクト)
//支線のIssues配列をマージする 今日は検査は保留20160505
マージの手順
マージされる側のラインのステータスを検査 startup,active,hold のラインはマージ不可　処理失敗
fixed,abortedのラインのみがマージ可能
マージ側のトランクに対する被マージ（親）側の該当するラインを閉じる（チェックイン）
同時にマージ側のラインを同じタイムスタンプで閉じる
親ラインに未登録のサブラインは、ここでマージされる。
この時点で発給されたラインにマージ（チェックイン）されていないラインはこれ以降のマージは親ラインに対して行なわれる。
＝クローズした子ラインに対するマージは、データの整合性を脅かすので禁止

*/
nas.Pm.statuses={"startup":0,"active":1,"hold":2,"fixed":3,"aborted":4};
nas.Pm.LineIssues.prototype.merge=function(myBranch){
	if(nas.Pm.statuses[myBranch.body[myBranch.currentId].currentStatus]<3) return false;
	//カレントラインがフィックスしていない場合失敗
	for(var ix=0;ix<this.body.length;ix++){
		if(this.body[ix].lineId==myBranch.body[0].lineId){
			//マージ側のラインが被マージ側にあるか否か確認
			if(typeof this.body[ix].lineCheckIn !="undefined"){
				return false;//既にマージ済みの場合もリジェクト
			}else{
				this.body[ix].lineCheckIn=nas.CURRENTUSER;
				this.body[ix].lineCheckInDate=new Date();
					myBranch.body[0].lineCheckIn=this.body[ix].lineCheckIn;//転記
					myBranch.body[0].lineCheckInDate=this.body[ix].lineCheckInDate;//転記
				for(var mix=1;mix<myBranch.body.length;mix++){
					this.body.push(myBranch.body[mix]);//残り情報を転記
				}
			}
		}
	}
	return myBranch;
}
//クラスメソッド
nas.Pm.parseIssue=function(datastream){
		if(! datastream.match){return false};
//ラインで分割して配列に取り込み
	var SrcData=new Array();
	if(datastream.match(/\r/)){datastream=datastream.replace(/\r\n?/g,("\n"))};
	SrcData=datastream.split("\n");
	var newIssues=false;
	for (l=0;l<SrcData.length;l++){
		if(SrcData[l].match(/^\#\#([\[<A-Z][^=]+)=?(.*)$/)){var nAme=RegExp.$1;var vAlue=RegExp.$2;}
		switch (nAme){
		case "LINE_ID":
			if(! newIssues) {
				var myContent=vAlue.split(":");
				var myLineName=myContent[0].replace(/^\(|\)$/g,"");
				//	alert("setupLine :"+myLineName);
				var myLineId=myContent.slice(1,myContent.length).join(":");
				newIssues=new nas.Pm.LineIssues(new nas.Pm.Issue(myLineName,myLineId));
			}else{continue;}
		break;
		case "CHECK_OUT":
		case "CHECK_IN":
			var myContentIssue=vAlue.split(";")[0].split("/");
			var myIndex=myContentIssue[0].split(":");myIndex[1]=nas.chopString(myIndex[1]);
			var myDate=myContentIssue.slice(1,myContentIssue.length-1).join("/");
			var myUser=nas.chopString(myContentIssue[myContentIssue.length-1]);
			if((newIssues)&&(newIssues.body[newIssues.body.length-1].lineId==myIndex[1])){
				var myIssue=newIssues.body[newIssues.body.length-1];
			}else{
				var myIssue=new nas.Pm.Issue(myIndex[0].replace(/^\(|\)$/g,""),myIndex[1]);
				newIssues.body.push(myIssue);
			}
			if(nAme=="CHECK_OUT"){
				myIssue.lineCheckOut=myUser;
				myIssue.lineCheckOutDate=new Date(myDate);
			}else{
				myIssue.lineCheckIn	=myUser;
				myIssue.lineCheckInDate	=new Date(myDate);
			}
		break;
		case "currentStatus":
				newIssues.currentStatus=nas.chopString(vAlue)  ;
		break;
		}
	}
	return newIssues;
}
/*
ライン情報は、１セットのxMap/Xpsに対して１種類発行される
Pm.PmUには同時に複数セットのラインが記録され　複数の

A= "##LINE_ID=(本線):0\n##CHECK_OUT=(本線):0/ 2016/01/31 18:45:22 / kiyo;"
B=nas.Pm.parseIssue(A);
C=B.branch("BG").toString();
B.body[B.currentId].lineId

*/
/*========================================================================この下は整理が済んだらcommonライブラリへ移行*/
/**
    カット表記用時間文字列オブジェクト
    名前とフレーム数で初期化する
    toString()メソッドは 秒＋コマ 又は 名前（秒＋コマ）型式文字列
    valueOf() メソッドは フレーム数を返す
    toStringにXps保存用の形式も必要　","区切りで倒置
*/
nas.TimeUnit=function(myName,myFrames){
	this.name=myName;
	this.frames=myFrames;
this.toString=function(myForm){
    if(myForm){
        return (this.name)?([nas.Frm2FCT(this.frames,3) , this.name ]).join(","):nas.Frm2FCT(this.frames,3);
    }else{ 
        return (this.name)? this.name+" ( "+nas.Frm2FCT(this.frames,3)+" )":nas.Frm2FCT(this.frames,3);
    }
}
this.valueOf=function(){return this.frames;}
}
/**
		カット用の時間記述を解釈してTimeUnitオブジェクトの配列で返す
	nas.parseTimeString("timeString")
	"1+12,OL(3+0),4+0"	コンマ区切りでいくつでも配列で返す
	⇒[{name:"time",frames:Frames-Int},{name:"tr-in",frames:Frames-Int},{name:"tr-out",frames:Frames-Int}]
	**解釈の幅を広げてパターン調整が必要
*/
nas.parseTimeString=function(myTimeString){
	var myTarget=myTimeString.split(",");
	var myResult=new Array();
	for (var t =0;t<myTarget.length;t++){
			myResult[t]=new nas.TimeUnit();
		if(myTarget[t].match(/(.*)\(([^\)]+)\)$/)){
			myResult[t]=new nas.TimeUnit(RegExp.$1,nas.FCT2Frm(RegExp.$2));
		}else{
			myResult[t]=new nas.TimeUnit("",nas.FCT2Frm(myTarget[t]));
		}
	}
	return myResult;
}
//test nas.pareseTimeString("12+6,trin(0),tr-out(0)");

/*	nas.separateTitleString(titleString)
		識別文字列を分解して配列戻し
		カット識別文字列の詳細はドキュメントを参照
引数:カット識別文字列 "title.opus.scene.cut"
戻値:配列[cut,scene,opus,title]
例：
nas.separateTitleString("Title#12_s12-c#123B") == ["123B","12","12","Title"]
nas.separateTitleString("XAv/10/s-c0023") == ["0023","","10","XAv"]
セパレータは . / _ -
プレフィックスは　Oo#Ss#Cc#
ポストフィックスはカット番号に含まれるものとします。＞必要にしたがって別途パースすること
*/
nas.separateTitleString=function(myName){
//	alert(myName);
	var regSep=new RegExp("[\\.\/\-]+","g");//セパレータ("_"以外)
	var myString=myName.toString().replace(regSep,"_");//セパレータを統一
		myString=myString.replace(/[cCｃＣsSｓＳoOｏＯ#＃№][#＃№]?([0-9]+)/g,"_$1")
		//プレフィクスをセパレータに変換
//	alert(myString);
		myString=myString.replace(/_+/g,"_");//連続セパレータを縮小
//	alert(myString);
	var myParse=myString.split("_").reverse();
	var newCut=(myParse.length>0)?myParse[0]:"";
//	var newCut=(myParse.length>0)?new String(myParse[0]).replace(/^[cCｃＣ]?[#＃№]?/,""):"";
	var newScene=(myParse.length>1)?new String(myParse[1]).replace(/^[sSｓＳ]?[#＃№]?/g,""):myScene;
//	var newOpus =(myParse.length>2)?new String(myParse[2]).replace(/^[oOｏＯ]?[#＃№]?/g,""):myOpus;
	var newOpus =(myParse.length>2)?myParse[2]:myOpus;
	var newTitle=(myParse.length>3)?myParse[3]:myTitle;
	return [newCut,newScene,newOpus,newTitle];
}
// nas.separateTitleString("Title#12_s12-c#123B");
// nas.separateTitleString("TitleO#12s#12c#123B");
// timeString
// 1+12 (trin:0+00)(trout:0+00)
// test
// var A=new SC("c012","s")