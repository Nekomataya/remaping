﻿/**
 * @fileoverview Xpsオブジェクト生成
 *
 * 2007.04.03 エラーメッセージ分離
 * 2013.04.02 外部フォーマット解析部分分離
 * 2015.06.12 Xps及びMap関連オブジェクトをnas.配下に移動
 * 2016.04.15 psAxe系とりまぴん系のマージ
 * 2016.08.20 データ構造の変更Xps.layersとXps.xpsBodyをXps.xpsTracksに統合
 * 2016.12.01 オブジェクトに Line/Stage/Jobのプロパティを増設パーサと出力も対応
 * Xpsオブジェクト初期化手順
 * Xpsオブジェクトの新規作成
 * コンストラクタ
 * myXPS=new Xps([layer count][,frame length]);//現処理
 * myXPS=new nas.Xps([layer count][,frame length]);//こちらに移行予定
 *
 * Xpsクラスオブジェクトコンストラクタ
 *
 * 引数は、省略可能。
 * 省略時はレイヤ数4，フレーム数その時点のフレームレートで１秒分
 * セルの初期値は全て""(ヌルストリング)
 * マップの設定はなし(ダミーマップも参照していない)
 *
 * このオブジェクトはフレーム優先。
 * フレームレートを変えるとコマうちが変わるのではなく、カットの継続時間が変わる。
 * アニメーターの振ったコマ打ち優先
 *
 *
 * XPSオブジェクトの再初期化
 *
 * method    [object Xps].init([int trackcount(layerCount)][,int frames])
 * 自分自身を再初期化する。
 * すべてのプロパティをリセット
 * 指定されたレイヤ数とフレーム長で空の値のテーブルを作成する。
 * 以前のデータは消去。new_XPSは、内部でこのメソッドを呼ぶ。
 *
 * 現在の継続時間を返す
 * method    [object Xps].duration()
 * このメソッドは、プロパティに変更予定
 *
 * 現在のカット尺を返す
 * method    [object Xps].time()
 * このメソッドは、プロパティに変更予定
 *
 * カット尺をフレーム数で返す
 * method    [object Xps].getTC(フレーム数)
 * 暫定メソッド、消えそう
 *
 * テキスト形式データを読み込んでオブジェクトに反映
 * method    [object Xps].readIN(テキストデータ)
 * parseXpsのラッパとして残置
 *
 * method    [object Xps].parseXps(xpsStreamText)
 * 与えられたテキストストリームをパースしてオブジェクトを再初期化する
 * 現在のプロパティはすべて破棄
 * 戻値:取り込み成功時にtrue/失敗の際はfalse
 * テキスト形式で出力
 * method    [object Xps].toString(セパレータ)
 * そのうち拡張
 * と思っていたが、コンバータは別立てにしてXpsオブジェクトの汎用性を高めるが吉
 *
 * method    [object Xps].mkAEKey(レイヤID)
 * モードよっては不要ぽい
 * 同上
 *
 * オブジェクトメソッド一覧
 *
 * Xps.newLayers= function(layerCount)://レイヤプロパティトレーラを作成して返す（削除されました）
 * Xps.newTracks= function(TrackCount);//タイムシートの本体オブジェクトを作成して戻す
 */
/**
Xpsをフルスペックに拡張するための基礎情報
区間パースに必要な予約後の設定
dialog
    ダイアログセクション開ノード
    ダイアログセクション閉ノード
sound
    サウンドセクション開ノード
    サウンドセクション閉ノード
still
cell
timing
replacement
    プロパティサイン原画、原画アタリ（参考）、中間値補間サイン、ブランクサイン
camera
camerawork
geometry
    セクション開ノード
    セクション閉ノード
    中間値補間サイン
effect
sfx
composite
    セクション開ノード
    セクション閉ノード
    中間値補間サイン
*/
var XpsTrackProperties=[
    "dialog","sound",
    "cell","timing","replacement","still",
    "camerawork","camera","geometry",
    "effect","sfx","composit",
    "comment"
];
var XpsTrackPropRegex=new RegExp(XpsTrackProperties.join("|"),"i");
/**
 * @constructor XpsStageオブジェクトコンストラクタ
 *
 * ステージプロパティとして参照される
 * ステージのツリー構造はペアレントツリーをたどることで再構成される
 * 各ステージ・ジョブは一連の識別名で分離される
 * ステージボディとしてストリームを配列で持つ
 *
 * 各識別子は制作単位内で一意であることを期待される
 *
 * 将来的に、実運用上ステージオブジェクトは親プロセスに問い合わせの上DBとリンクした親オブジェクトを受け取るケースの方が多い？
 * ただしカットごとのステージングは優先される
 * 基本的には、カット制作ルートから組み上げたステージングで物事が決定される？
 * ステージ識別名称が新規に作成された場合は、親DBへの登録/更新が必要
 * ステージ.bodyの配列
 *
 * @param myParent
 * @param myStage
 * @param myJob
 ラインを含めて統合されたnas.PmU オブジェクトと置換する予定
 */
/*
function XpsStage(myParent, myStage, myJob) {
    this.body = myParent;//ステージ・ジョブストリームを記録する配列
    this.name = myStage;//Stringステージ識別名称（任意文字列）
    this.job = myJob;//Stringジョブ識別名称（任意文字列）
    this.stageIndex = 0;//Int
    this.jobIndex = 0;//Int
}
XpsStage.prototype.toString=function(){
    return "["+this.name+"][["+this.job+"]]";//?
}
*/
/**　Xpsに単独記録する制作管理オブジェクト
    ライン記述を与えてオブジェクトを初期化する
    
    ライン記述は　'(本線):0',1:(背景),'(背景3D-build):1:1','1-1:(背景3D-build)' 等
     識別名の(括弧)は払う
     前置型式後置型式どちらでも解釈
     引数記述が数値のみ指定は許されない（初期化に失敗させる）
    
     ライン・ステージ・ジョブの三点を初期化後にXpsがリンクするxMapと対照を行い
     当該のObjectに対するリンクを記録する？　⇒　常に検索が可能なので記録しない
     
     当該ライン・ステージ・ジョブがxMapに存在しない場合は、xMapドキュメントを初期化の際に同期
     
     
*/
function XpsLine (lineString){
	this.id	=	[0];//
	this.name ='本線';//又は'trunk'
    if(lineString){
      lineString=String(lineString);
      if(lineString.match(/^[0-9]+$/)){lineString+=':-'}
      var prpArray=lineString.split(':');
      if(prpArray.length > 2){
//要素数3以上ならば必ずID後置
        this.name = prpArray[0].replace(/^\(|\)$/g,"");
        this.id = prpArray.slice(1);
      } else if(lineString.length > 0){
        if(prpArray[0].match(/^[\d\-]+$/)){prpArray.reverse();}
        if (prpArray[1]) this.id = prpArray[1].split('-');
        this.name = prpArray[0].replace(/^\(|\)$/g,"");
      }
    }
}
XpsLine.prototype.toString = function(opt){
    if(opt)     return [this.id.join('-'),'(' + this.name +')'].join(':');
    return ['(' + this.name +')',this.id.join(':')].join(':');
}

/*
    ステージ記述を与えてプロパティを設定する
    "1:原画" , "原画:1" どちらの型式でも良い
    ':' は省略不可
    記録時は後方型式
*/
function XpsStage (stageString){
    this.id = 0 ;this.name = 'init';
    if(stageString){
      stageString=String(stageString);
      var prpArray=stageString.split(':');
      if(prpArray.length){
        if(prpArray[0].match(/^\d+$/)){prpArray.reverse();}
        this.id=(String(prpArray[1]).match(/^\d$/))? prpArray[1]:0;
        this.name=prpArray[0];
      }
    }
}
XpsStage.prototype.toString = function(opt){
    if(opt)     return [this.id,this.name].join(':');
    return [this.name,this.id].join(':');
}
XpsStage.prototype.increment = function(myString){
    this.id   = nas.incrStr(String(this.id));
    this.name = (myString)? myString:nas.Zf(this.id,3);
    return this;
}
XpsStage.prototype.reset = function(myString){
    this.id   = 0;
    this.name = (myString)? myString:'init';
    return this;
}

/**
    XPS上では特にJobがサブステージとしての傾向が強いのでオブジェクトごと兼用でも良い
    今コードが同じ…
    だが、IDのインクリメントが違うか…

function XpsJob (jobString){
    this.id = 0 ;this.name = '';
    var prpArray=jobString.split(':');
    if(prpArray.length){
        if(prpArray[0].match(/^\d+$/)){prpArray.reverse();}
        this.id=prpArray[1];
        this.name=prpArray[0];
    }
}
XpsJob.prototype.toString=function(){
    return [this.name,this.id].join(':');
}
*/
/*
    JobStatus
    Jobの状況（＝カットの作業状態）
    content:作業状態を示すキーワードStartup/Active/Hold/Fixed/Aborted//Floating
初期値は"Startup" > 'Floating' 初期値変更
    assign:アクティブまたは中断状態でない作業が持つ次作業者の指名UIDまたは文字列（特にチェックはない）
初期値は長さ0の文字列
    アサインメント情報として予約値'stageCompleted'を持つことができる。これは当該ステージの終了フラグとして機能する
    
    message:次の作業に対する申し送りフリーテキスト
初期値は長さ0の文字列

    stageComleted:工程の終了フラグ ブーリアン
どのユーザでも立てることができるが、このフラグ自体は工程の完了を直接意味しない。
このフラグが立ったカットを、適切な管理者がチェックして実際の完了処理を行う。
完了処理は次のステージを開くことで行われるので注意が必要
初期値 false

初期化引数はステータス識別子または 配列[content,assign,message]いずれか
assin/messageが存在する場合は出力が以下の形式の文字列となる
"content:assign:message"
アサイン、メッセージ情報は、ステータスがFixed,Satartupの際は、次作業へのアサインメントとなる
Aborted.Floatingはアサインメントメッセージを持たない

Active,Hold はサーバからエクスポートされた
現在のユーザ情報をもつ
*/
function JobStatus (statusArg){
    this.content = "Floating";
//初期値は "Startup"から"Floating"に変更Startupステータスはリポジトリ登録成功時に割り当てられるステータスとする
    this.assign  = "";
    this.message = "";
    if (statusArg instanceof Array){
        var prpArray = statusArg;
        if(prpArray.length){
          this.content =prpArray[0];
          this.assign  =(prpArray.length > 1)? (prpArray[1]):"";
          this.message =(prpArray.length > 2)? (prpArray.splice(2).join(':')):"";
        }
    }else if(statusArg){
        var prpArray = String(statusArg).split(':');
        if(prpArray.length){
          this.content =prpArray[0];
          this.assign  =(prpArray.length > 1)? decodeURIComponent(prpArray[1]):"";
          this.message =(prpArray.length > 2)? decodeURIComponent(prpArray.splice(2).join(':')):"";
        }
    }
}

JobStatus.prototype.toString=function(opt){
    if(
        (opt)&&
        ((this.content=="Fixed")||(this.content=="Startup"))&&
        ((this.assign!="")&&(this.message!=""))
      ){
     return [this.content,encodeURIComponent(this.assign),encodeURIComponent(this.message)].join(':');
    }else{
     return this.content;   
    }
}

/**
 * タイムライントラックの標準値を取得するメソッド
 *  タイムラインラベルが指定するグループがあらかじめ存在する場合は、そのグループオブジェクトが保持する値
 *  存在しない場合は、新規にグループを作成する。その際にトラックの種別ごとのValueオブジェクトを初期値として登録するのでその値を使用
 *  XpsTimelineTrack.getDefeultValue()側で調整
 *  Replacementの場合、基本ブランクだが必ずしもブランクとは限らないので要注意
 *  トラック上で明示的なブランクが指定された場合は、値にfalse/null/"blank"を与える。

 
 
 * @param myOption
 * @returns {*}
 */
function _getMapDefault(myOption) {
    var myGroup=this.xParent.parentXps.xMap.getElementByName(this.id);
    if((typeof myGroup == "undefined")||(! myGroup)){
//console.log("no group detect. new grou setup");
/*
console.log([
        this.id,
        this.option,
        this.xParent.parentXps.xMap,
        ""
        ]);
*/
        myGroup=this.xParent.parentXps.xMap.new_xMapElement(
        this.id,
        this.option,
        this.xParent.parentXps.xMap.currentJob,
        ""
        );
    }
    if (myOption == undefined) {
        return myGroup.content;
        myOption = myGroup.type;
    }
    switch (myOption) {
        case "dialog":
        case "sound":
            return new nas.AnimationDialog(null,"");
            break;
        case "camera":
        case "camerawork":
        case "geometry":
            return new nas.AnimationGeometry(null,"");
            break;
        case "composit":
        case "effect":
        case "sfx":
            return new nas.AnimationComposit(null,"normal");
            break;
        case "cell":
        case "replacement":
        case "timing":
        case "still":
        default:
            return new nas.AnimationReplacement(null,"blank-cell");
    }
}

/**
 * @description セクション（区間）の実装について
 *
 * タイムラインはセクションの連続として表現される
 *
 * セクションに関して
 * 他のアプリケーションではクリップという名前で実装されている場合もある
 *
 * セクションはフレーム単位の継続時間とその区間の値を持つ
 * 一般的にセクションが継続している間はその値は変化しない
 *
 * 区間値を持たないセクションがある
 *
 * ブランクセクションは単純に値を持たない
 * 空セル・無音状態等のタイムラインが特定の値を必要としない状態を表現するために使用される。
 *
 * 確定した値を持たない特殊なセクションがある
 *
 * 中間値補間セクションは、特定の値を持たず前後のセクションの中間値を自動で生成する。
 * 日本のアニメーション業界的には「中割区間」とも呼ばれる
 *
 * 中間値補間セクションは、その区間値としてセクションコレクションを持ち複数のサブセクションを保持する
 * 実際に値を持つのはサブセクションである
 *
 * フォーマット上はID:0のルートセクションが存在するが、これはトラック全体を継続時間として持つルートセクションとして実装する
 * ルートセクションは、規定値となるそのセクションの値と、セクションを保持するセクショントレーラを持つ？
 *
 * セクショントレーラーは、そのトラックを構成するセクションを格納するトレーラーとして機能するオブジェクト
 *
 * 中間値生成セクションは、値としてセクショントレーラーを持ち、サブセクションの配列を持つ。
 *
 * 配列INDEXは、セクションインデックスと１番ずれるので要注意
 *
 *
 * エレメントは値に名前を与えて、名前を利用したアクセスを可能にする
 *
 * セクションの値はMAPエレメント
 * MAPエレメントは、オブジェクトとして値を持つ
 *
 * MAPエレメントのvalueOfは自身の値オブジェクトを返す？
 *
 * セクション
 * .toString    >    Xps用ストリーム
 * .valueOf    >    Xps用配列戻し
 * MAPエレメント
 * .toString    >    xMapデータ用テキストエンコーダモードつき
 * 値
 * .toString    >    xMapデータ用テキストエンコーダ
 * .valueOf    >    必要にしたがって各種演算数値又は自身のオブジェクト（オーバーライド不要）
 */

/**
 * xpsTracks Object
 * Array based Class
 * 親のXpsが保持しているのでトラックコレクション内部にカット情報を保存する必要なし
 * jobへの参照のみをプロパティとして持つ固定プロパティ
 * 上流の工程情報はJobに内包・管理情報（user/date）はこのオブジェクトが保持する
 * 別のプロパティを保持する必要はない
 * 管理情報DBを利用しない場合もデフォルトのJobオブジェクトはユーザ及び日付情報を持つ
 * このオブジェクトに記録される情報はJob本体ではなく参照情報Job-ID(Int)
 * コレクションの初期化は、ライン、ステージ、ジョブの新規発行の際にシステムにより行なわれる
 * リファレンスエリアの一時バッファとして、リファレンスステージを設定する
 * このステージにはJobが１つだけしか存在しない常にデータの最終状態のリファレンスエリアの内容を維持する
 * 個人作業用としてはリファレンスバックアップと同一だが、クライアント環境をまたいで使用することが可能
 * JobID=-1

 IDは初期化時に外部情報で指定
 DB接続の無いケースでは、
 ドキュメント記載のIDを与える
 初期化時にセッション限定のユニークIDを作成して与える
 等のケースとなる

 オブジェクト初期化時は、デフォルトの音声トラック＋コメントトラックのみを初期化する
 必要に従って呼び出し側でオブジェクトメソッドを用いてトラック編集を行う
 */
XpsTrackCollection = function(parent,index,duration){
	this.parentXps=parent;//固定情報親Xps
	this.jobIndex=index;//固定情報JobID
	this.duration=duration;
	this.noteText="";//property dopesheet note-text
	this.length=2;//メンバーをundefinedで初期化する。
		this[0]=new XpsTimelineTrack("N","dialog",this,this.duration);
		this[1]=new XpsTimelineTrack("","comment",this,this.duration);
//以下はオブジェクトメソッド（配列ベースなのでArrayオブジェクトのメソッド書き換えを防ぐためこの表記に統一）
//オブジェクトメソッド群
/**
 * タイムラインを挿入
 * XpsTrackCollection.insertTrack(id,XpsTimelineTrack)
 * Timeline(XpsTimelineTrack object オブジェクト渡し)
 * idの前方に引数のタイムラインを挿入
 * idが未指定・範囲外の場合、後方へ挿入
 * 0番タイムラインの前方へは挿入不能(固定のデフォルトタイムライン)
 * @param myId
 * @param myTimeline
 */
    this.insertTrack = function(myId,myTrack){
        var insertCount=0;
        if (!(myTrack instanceof Array)) { myTrack=[myTrack] };
    //挿入位置を確定
        if ((!myId ) || (myId < 1) || ( myId >= this.length - 2)) {myId = this.length - 1;}
    //挿入
        for(var tc=0;tc<myTrack.length;tc++){
            if(myTrack[tc] instanceof XpsTimelineTrack) {
                this.splice(myId+tc, 0, myTrack[tc]);
                insertCount++;
            }
        }
        this.renumber();
        return insertCount;
    };
/**
 * XpsTrackCollection.removeTrack([id])
 * 指定idのタイムラインを削除する
 * デフォルトの音声トラックとフレームコメントトラック及び最後のタイミングトラックの削除はできない
 * IDを単独又は配列渡しで
 * @param args
 */
    this.removeTrack = function(args){
        var removeCount=0;
        if (!(args instanceof Array)) {
            args = [args]
        }
        args.sort().reverse();//ソートして反転後方から順次削除しないと不整合が起きる
        for (var idx = 0; idx < args.length; idx++) {
        //操作範囲外の値は無視
            var targetIndex = args[idx];
            if (isNaN(targetIndex)) {
                continue;
            }
            if ((targetIndex > 0) && (targetIndex < this.length - 1)&&(this.length >3)) {
                this.splice(targetIndex, 1);
                removeCount ++;
            }
        }
        if(removeCount){this.renumber();}
        return removeCount;//削除カウントを返す
    };
/**
 * トラックコレクションのindexをチェックして揃える
 * タイムライントラックのindexは親配列のindexそのもの
 */
    this.renumber = function(args){
	    for (var idx=0;idx<this.length;idx++){
		    if(this[idx].xParent !== this) { this[idx].xParent=this; }
		    if(this[idx].index != idx)     { this[idx].index  =idx ; }
	    }
    }
}

XpsTrackCollection.prototype = Array.prototype;

/**
 * @constructor XpsTimelineTrackオブジェクトコンストラクタ
 *
 * タイムラインのトラックとなるオブジェクト
 * 配列ベースで、xpsTracks(トラックコレクション)のメンバーとなる
 * タイムライントラックのプロパティ及びコンテンツを保持する
 * contentStreamを要求された場合は、配列のメソッドでコンテントストリームを生成して返す（obj.join(",")）
 * contentSectionsを要求された場合は、同様にセクションコレクションを生成して戻す（オブジェクトメソッド）
 * トラックは、セクションで構成されるものとして扱うことができる
 * ラベル、トラック種別、継続フレーム数 を与えて初期化する
 * ジオメトリを持たないオブジェクトもある
 * タイムライントラックを抽象化するためのレイヤーとして機能する
 * 旧来のXPSLayerの代替となるのである程度の互換を考慮すること
 * xpsBodyとXps.layersを統合するデータ構造である
 *
 * @param myLabel
 * @param myType
 * @param myParent 
 * @param myLength	
 * @param myIndex
 タイムライントラックは、内部処理のため自身を外部からアクセスする際のidを内部にプロパティとして持つ
 親のXpsにアクセスする必要があるので、トラックの属するトラックコレクションへのポインタを持たせる。
 トラックコレクションが実質上のタイムシート本体である
 マルチステージ拡張のために必須
 */
function XpsTimelineTrack(myLabel, myType, myParent, myLength) {
	
	this.index;//indexは自動制御生成時点ではundefinedタイムラインコレクションへの組み込み時点で設定される
	this.xParent=myParent;//親オブジェクトへの参照（トラックコレクションxpsTracksへの参照）
	this.length=myLength;//配列メンバーを空文字列に設定する
		for(var ix=0;ix<this.length;ix++){this[ix]="";}
    this.duration=this.length;
    this.id = myLabel;//識別用タイムラインid(文字列)タイムライン名
    this.option = (typeof myType == "undefined") ? "timing" : myType;//still/timing/dialog/sound/camera/camerawork/effect/composit/commentのいずれか
    this.sizeX = "640";//デフォルト幅 point
    this.sizeY = "480";//デフォルト高 point
    this.aspect = "1";//デフォルトのpixelAspect
    this.lot = "=AUTO=";//旧オブジェクト互換
    this.blmtd = "file";//旧オブジェクト互換
    this.blpos = "end";//旧オブジェクト互換
    this.tag =(this.option=='still')? this.id:'';
    this.link = ".";
    this.parent = ".";//
    this.sections = new XpsTimelineSectionCollection(this);
    this.sectionTrust = false;//セクションコレクションが最新の場合のみtrueとなるインジケータ変数

//以下はオブジェクトメソッド（配列ベースなのでArrayオブジェクトのメソッド書き換えを防ぐためこの表記に統一）
//オブジェクトメソッド群
/**
 * 削除メソッドをトラックオブジェクトに実装する	
 * XpsTimelineTrack.remove()
 * 削除の派生機能としてトラックオブジェクト側にremoveメソッドを作る
 * =自分自身の削除命令を親コレクションに対して発行する
 */
    this.remove=function(){
        return this.xParent.removeTrack(this.index);
    }
/**
 * 複製メソッド
 * 自分自身を複製して返す。
 * 複製のindex/xParentを含めて複製するので注意
 実質使いドコロが無さそう？
 */
    this.duplicate=function(){
        var newOne = Object.create(this);
        return newOne;
    }
/**
    @desc トラックのセルエントリの識別文字列を作成する
    
*/
    this.getCellIdentifier=function(myStr){
        if(this.option!="timing"){return null;}
        this.LabelRegex=new RegExp("^"+this.id.replace(/[\\\-\+\[\]\(\)\.\^\$]/g,"\\$&") + "[\s\-_]?(.*)$")
        if(myStr.match(LableRegex)){
            myName  = RegExp.$1;
            myLabel = this.id;
        }else{
            mName = myStr;
        }
    }
/**
 * @desc タイムラインの中間処理メソッド
 * タイムラインをパースして有効データで埋まった１次元配列を返す
 これは、汎用セクションパーサが稼働すれば不要になるメソッドなので扱いに注意
 * Tm(開始フレーム,取得フレーム数)
 *
 * @param myStart
 * @param myLength
 * @returns {*}
 */
    this.parseTm = function (myStart, myLength) {
        if ((!myStart) || (myStart > this.length) || (myStart < 0)) {
            myStart = 0
        }
        if ((!myLength) || (myLength > (this.length - myStart))) {
            myLength = (this.length - myStart)
        }

    /**
     * @todo: 将来、データツリー構造が拡張される場合は、機能開始時点でツリーの仮構築必須
     */
        if (this.option !== "timing") { return false;}
    /**
     * 現在は、timing専用タイミングタイムライン以外の要求にはfalseを戻す
     * タイミングタイムラインの内部処理に必要な環境を作成
     * @type {String}
     */
        var myLabel = this.id;
        var blank_pos = this.blpos;
        var bflag = (blank_pos == "none") ? false : true;//ブランク処理フラグ

    /**
     * 前処理 シート配列からキー変換前にフルフレーム有効データの配列を作る
     * var bufDataArray = new Array(myStart + myLength);
     * @type {Array}
     */
        var bufDataArray = new Array(myStart + myLength);
    /**
     * 第一フレーム評価・エントリが無効な場合空フレームを設定
     * @type {*}
     */
        var myData = dataCheck(this[0], myLabel, bflag);
        if (myData == "interp") myData = false;
        bufDataArray[0] = (myData) ? myData : bufDataArray[f - 1];//有効データ以外は直前のデータを使用
    /**
     * 2--ラストフレームループ
     */
        for (var f = 1; f < bufDataArray.length; f++) {
        /**
         * 有効データを判定して無効データエントリを直前のコピーで埋める
         * @type {*}
         */
            var myData = dataCheck(this[f], myLabel, bflag);
            if (myData == "interp") myData = false;
            bufDataArray[f] = (myData) ? myData : bufDataArray[f - 1];//有効データ以外は直前のデータを使用
        }
        return bufDataArray.slice(myStart, bufDataArray.length);
    }
/**
    タイムライントラックを走査してプライマリセクションの切れ目を探してそこまでのカウントを返す
    内部処理用関数
*/
    this.countSectionLength=function(startFrame){
        if (typeof startFrame == "undefined" ) startFrame = 0;
        var mySections=this.parseTimelineTrack();
        var mySectionId = 0;
        for(var idx=0; idx < mySections.length ; idx ++){
            var startOffset = mySections[idx].startOffset();
            if (( startOffset<= startFrame)&&((mySections[idx].duration+startOffset)>startFrame) ){
                return mySections[idx].duration;
                break;
            }
        }
        return false;
    }
//汎用関数設定
    this.getDefaultValue = _getMapDefault;//
}

XpsTimelineTrack.prototype = Array.prototype;
//test
//
/**
 * セクション追加メソッド超暫定版
 * 第一トラックのダイアログのみしか処理しません
 * 
 * @param myValue
 * @returns {XpsTimelineSection}
 セクションの追加メソッドはセクションコレクションに移動・このメソッドの新規利用は不可
 暫定コードを潰し終えたら削除

XpsTimelineTrack.prototype.addSection = function (myValue) {
    var newSection = new XpsTimelineSection(this, 0);//親Collection、継続時間
    newSection.value = myValue;
    this.sections.push(newSection);
    return newSection;
};
 */
 
/*test
    XPS.xpsTracks[5].countSectionLength(1); 
*/

/**
 * @constructor XpsTimelineSectionCollection
 *
 * トラック・セクションオブジェクトのプロパティとなるセクショントレーラー配列
 * セクションオブジェクトは、内包サブセクションを持つことができる
 * @param myParent as nas.XpsTimelineTrack
 */
function XpsTimelineSectionCollection(myParent) {
    this.parent = myParent;// Object XpsTimelineTrack
//以下はオブジェクトメソッド（配列ベースなのでArrayオブジェクトのメソッド書き換えを防ぐためこの表記に統一）
//オブジェクトメソッド群
/**
 * セクション追加メソッド
 * 
 セクション追加の際の引数はタイムラインに必要な値オブジェクト
 値オブジェクトは、直接AnimationValueを持つオブジェクト又はxMapElementとして与える
 値のみが与えられた場合はエレメントなしで登録する。
 中間値補間セクションを初期化する場合 キーワード"interpolation"を引数として与える
 中間値補間サブセクションを初期化する場合指定されたValueを無視して新規にValueInterpolator Objectを作成して初期化する
 エレメント新規作成が必要な場合はあらかじめ事前にエレメント新規作成を行って引数とする
 * @param myValue
 * @returns {XpsTimelineSection}
 */
    this.addSection = function (myValue) {
//console.log(this.parent.xParent.parentXps.xMap);
        var newSection = new XpsTimelineSection(this, 0 );//親Collection、継続時間 0
        if(this.parent.subSections){
//親が中間値補間セクションであった場合無条件でサブセクションを登録
            newSection = new XpsTimelineSection(this, 0 );
            newSection.mapElement;//エレメントは登録されない
            newSection.value = new nas.ValueInterpolator(newSection);
        } else if(myValue instanceof nas.xMapElement){
    //引数がxMapエレメントなのでそのまま有値セクション初期化
            newSection = new XpsTimelineSection(this, 0 );
            newSection.mapElement = myValue;
            newSection.value = newSection.mapElement.content;
        } else if(myValue == "interpolation"){
    //プライマリ中間値補間セクション
            newSection = new XpsTimelineSection(this, 0, true);
            newSection.subSections=new XpsTimelineSectionCollection(newSection);
            newSection.mapElement;
            newSection.value=null;//new nas.ValueInterpolator();   
        } else {
    //中間値補間サブセクション以外の
            newSection = new XpsTimelineSection(this, 0 );
            newSection.mapElement;//エレメントは登録されない
            newSection.value = myValue;
        }
//        if(newSection.value) newSection.value.parseContent();
        this.push(newSection);
        return newSection;
    };

/* XpsTimelineSectionCollection.getDuration()メソッドは、セクションのdurationを合計するメソッド
 * 
 */
    this.getDuration = function () {
        var myDuration = 0;
        for (var ix = 0; ix < this.length; ix++) {
            myDuration += this[ix].duration;
        }
        return myDuration;
    };
/*  セクション編集メソッド
 *      insertSection(id,newSection)
 *  指定idの前方にセクションを挿入する後方のセクションは、継続時間を維持したままさらに後方へ再配置される
 *  カットの時間範囲を越えたセクションは消去または後方をカットされる（配列データとして後方へ「ブロックインサート」してフレーム単位で削除その後再パース）

 *      removeSection(id)
 *  指定されたidのセクションを消去、前後のセクションの値が同じ場合は結合　異なる場合は別のセクションとして残置（相当部分の配列要素を削除して前方へ詰める「ブロックデリート」のほうが良いかも…）

 *      editSection(id,startOffset,duration)
 *      manipulateSection(id,startOffset,duration)
 *  指定idのセクションを指定の開始時間+継続時間で再配置する。
 *  前後のセクションは以下のルールで自動的に再配置される

    新規の開始位置は、前方セクション群の最小フレーム数または、０フレームよりも小さくなることが許されない
    新規の終了位置は、後方セクション群の最小フレーム数をカットの継続時間から引いたものまたは最終フレームを超えることが許されない

    開始端が移動した場合、前方区間は、オプションにより以下の３種の選択処理となる
        1.すべてのセクションの継続時間は原則としてオリジナル通りで、はみ出したセクションがカットされる
        2.編集対象セクションに近い側から順次伸縮される、各セクションの最終継続長以下になった場合そこで伸縮が止まり、次に遠いセクションが短縮される
        3.編集対象セクションに遠い側から順次伸縮される、各セクションの最終継続長以下になった場合そこで伸縮が止まり、次に遠いセクションが短縮される
             
    終了端が移動する場合も開始端の変更に準ずる。

    値の再配置は値の種別ごとに処理が異なるので要注意

戻り値は、セクションを加工したトラック全体のストリーム（xUI.put Xps.putメソッドの引数として使用可能なストリーム）
+ フォーカス位置のオフセット(0~)
例：['1,,,3,,,4,,,7,,,8,,,9,,,0,,',0]

対編集対象トラックを以下の区間に分類して処理を行う

    [前方区間外新規セクション]
編集対象が第一区間である場合のみ発生　このエリアが発生した場合は新規セクションが追加され既存区間のIDがインクリメントする
    [前方残置レンジ]
現行のトラック内容をそのまま引き継ぐ範囲 (0)~(id-2) までのセクションが含まれる可能性がある
    [前方影響セクション]
ストリームを再構築する必要のあるセクション　操作オプションとオーダ範囲に寄り対象が変わりる　単一とは限らない

    [編集対象セクション]
フォーカスの存在するセクション

    [後方影響セクション]
ストリームを再構築する必要のあるセクション　操作オプションとオーダ範囲に寄り対象が変わりる　単一とは限らない
    [後方残置レンジ]
現行のトラック内容をそのまま引き継ぐ範囲 (id+2)~(sections.length) までのセクションが含まれる可能性がある
    [後方方区間外新規セクション]
特定条件で発生　編集対象が最終セクションである場合のみ発生する　既存区間のIDに変更はないが新規セクションが追加される。

編集中に編集対象セクションが入れ替わる現象は、仕様変更により特例処理となるので本メソッド内で処理20181227

呼び出し側で発生するので要デバッグ　201802

     */
/**
引数:
    id  編集対象の区間ID
    headOffset  編集対象区間の新規開始点
    tailOffset  開始点からの編集対象区間の終了点オブセット（= duration - 1）
    manipulateOption  編集オプション 整数　"near"/"far"
*/
    this.manipulateSection = function (id,headOffset,tailOffset,manipulateOption) {
        if (! manipulateOption)　manipulateOption = "near";
        if(headOffset < 0) headOffset = 0 ;
        var targetSection  = this[id];
        var myResult = [];//Collectionの編集を行わず、直接トラックのセル値を組み上げる=区間のメソッドは最低限で使う
        var startFrame = (tailOffset < 0)? headOffset + tailOffset  : headOffset;//逆転時に頭尾入替
        var endOffset  = Math.abs(tailOffset);

console.log(["startFrame : ",startFrame,"/ endOffset :",endOffset].join(''))

//トラック内のセクション最短継続長を取得       
/*
dialog 区間は「コンテンツの文字数」それ以外は 1 にコメント数を加えたもの。
空白区間の最低長は前後のコンテンツによる。＝headMargin tailMarginの被侵入合算サイズ
＊＊負数になるケースがあるので注意
空白区間にコメントは許可されない（値無しでコメントのみの区間が発生するため）

ユーザ入力を失わないためコメントはフレームを一つ消費する。
移動時にコメントのフレーム位置は保証されない
*/
        var newDurations = 0;
        var minimumDurations = [];//区間最小値配列
        var headLimit = 0;
        var tailLimit = 0;
        for (var six = 0 ; six < this.length ; six ++){
            var minimumContentLength = 1;

            if(this[six].value){
                    if((this.parent.option == 'dialog')&&(this[six].value.bodyText)) minimumContentLength = this[six].value.bodyText.length;
                    if((this[six].value.comments)&&(this[six].value.comments.length)) minimumContentLength += this[six].value.comments.length;
            }else{
                minimumContentLength = -(this[six].headMargin + this[six].tailMargin);
                if((this.parent.option.match(/^(camera|camerawork)$/))&&(minimumContentLength > 1)){
                    var currentContent = this[six].getContent();
                    if(currentContent[0] == currentContent[currentContent.length-1]) minimumContentLength -- ;
                }
           }
            if(six < id) headLimit += minimumContentLength  ;//先行区間最小値を集計
            if(six > id) tailLimit += minimumContentLength  ;//後方区間最小値を集計
            minimumDurations.push(minimumContentLength)     ;//最小区間継続長配列
        }
console.log(minimumDurations);
console.log(["headLimit:",headLimit," / tailLimit",tailLimit].join(''));
//指定範囲補正　入力保護のため指定位置の補正を強制的に行う
        if(endOffset < minimumDurations[id]){
            endOffset = minimumDurations[id]-1;
        }
        if(startFrame < headLimit){
            startFrame =  headLimit;
        }
        if((this.parent.length-(startFrame+endOffset)) < tailLimit){
            startFrame -= tailLimit;
        }
console.log(["targetSection.startOffset : ",targetSection.startOffset(),"/ Offset :",targetSection.duration - 1].join(''))
console.log(["startFrame : ",startFrame,"/ endOffset :",endOffset].join(''))
//補正確定後に以前の状態と前後位置が等しい場合は処理スキップ
/*
    区間長は同じだが、内容が変化するケースがあるので、ここに内容判別が必要
    sectionTrustを参照して現在のセクション内容がは信頼可能な場合のみスキップする
    セクション内容を改める外部プロシジャはこのあらかじめこのフラグを下ろす必要がある。
*/
        if((this.parent.sectionTrust)&&(startFrame==targetSection.startOffset())&&(endOffset==targetSection.duration - 1)) return [this.parent.join(),startFrame,endOffset];
        //暫定的に元データで返す 呼び出し側で無変更をトラップするか、または戻り値の判定が必要
//前方に新規挿入セクションが発生する場合その部分をあらかじめカラ要素で埋めておく
        if ((id == 0)&&(startFrame > 0)) {
            myResult = new Array(startFrame);
console.log('前方処理既存区間なし　空白セルを補充 frames: '+(startFrame-targetSection.headMargin));
        }
/*　==========================前方区間処理　*/
        if((startFrame > 0)&&(id > 0)){
            var changeLength = startFrame - targetSection.startOffset();
console.log('前方区間伸縮パラメタ' + changeLength);
            if(changeLength == 0){
//変更なし現在のタイムラインをコピー
                myResult = myResult.concat(this.parent.slice(0,startFrame-targetSection.headMargin));
console.log('前方区間複製' + myResult.toString());
            }else{
                var restMargin = startFrame - headLimit;
                var newDurations = [];
                for (var ix = 0 ; ix < id ;ix ++){
                    var tix = (manipulateOption=='near')? ix : id - ix - 1;
                    if(changeLength > 0){
//延長時対象端区間で差分を吸収
                        if(
                            ((manipulateOption =='far')  && (tix == 0))||
                            ((manipulateOption =='near') && (tix == (id-1)))
                        ){
                            newDurations.push(this[tix].duration+changeLength);
                        }else{
                            newDurations.push(this[tix].duration);
                        }
                    }else{        
//短縮時前方空白区間と最短区間合算を比較して一致するまで区間長をスタックする
                        if(restMargin == 0){
                            newDurations.push(minimumDurations[tix]);
                        }else if((restMargin + minimumDurations[tix]) >= this[tix].duration){
                            newDurations.push(this[tix].duration);
                            restMargin -= (this[tix].duration - minimumDurations[tix]);
                        } else if(restMargin > 0){
                            newDurations.push(restMargin + minimumDurations[tix]);
                            restMargin = 0;
                        }
                    }
                }
                if (manipulateOption == 'far') newDurations.reverse();
console.log(newDurations);
                for (var ix = 0 ; ix < id ;ix ++){
                        myResult = myResult.concat(this[ix].getStream(newDurations[ix]));
                    if((newDurations[ix]+this[ix].headMargin+this[ix].tailMargin) < 0){
console.log(newDurations[ix]+this[ix].headMargin+this[ix].tailMargin);
                        myResult.splice(newDurations[ix]+this[ix].headMargin+this[ix].tailMargin);
                    }
                }
            }
}
//==========================ターゲット区間
console.log(id);
    myResult = myResult.concat(targetSection.getStream (endOffset+1));
/*==========================後続区間処理　*/
    var endFrame = startFrame+endOffset;
if(((endFrame) < (this.parent.length-1))&&(id < (this.length-1))){
    changeLength = (targetSection.startOffset()+targetSection.duration-1)-(startFrame+endOffset);
console.log('後続区間伸縮パラメタ' + changeLength);
    if(changeLength==0){
//変更なしなので現在のタイムラインをコピーして終了
        myResult = myResult.concat(this.parent.slice(startFrame+endOffset+1+targetSection.tailMargin));
console.log('後続区間複製' + this.parent.slice(startFrame+endOffset+1+targetSection.tailMargin));
    }else{
//後続空白区間と最短区間合算を比較して一致するまで区間を拡張する
        var restMargin = this.parent.length - 1 - endFrame - tailLimit;
        var newDurations = [];
        for (var ix = id+1 ; ix < this.length ;ix ++){
            var tix = (manipulateOption=='near')? this.length - (ix-id) : ix;
            if(changeLength > 0){
//延長時対象端区間で差分を吸収
                if(
                    ((manipulateOption =='far')  && (tix == (this.length-1)))||
                    ((manipulateOption =='near') && (tix == (id+1)))
                ){
                    newDurations.push(this[tix].duration+changeLength);
                }else{
                    newDurations.push(this[tix].duration);
                }
            }else{
//短縮時後続空白区間と最短区間合算を比較して一致するまで区間長をスタックする
                if(restMargin == 0){
                    newDurations.push(minimumDurations[tix]);
                }else if((restMargin + minimumDurations[tix]) >= this[tix].duration){
                    newDurations.push(this[tix].duration);
                    restMargin -= (this[tix].duration - minimumDurations[tix]);
                } else if(restMargin > 0){
                    newDurations.push(restMargin + minimumDurations[tix]);
                    restMargin = 0;
                }
            }
        }
        if (manipulateOption == 'near') newDurations.reverse();
//alert(newDurations.join());
        for (var ix = 0 ; ix < newDurations.length ;ix ++){
            myResult = myResult.concat(this[id+1+ix].getStream(newDurations[ix]));
console.log([newDurations[ix],this[id+1+ix].headMargin,this[id+1+ix].tailMargin]);
            if((newDurations[ix]+this[id+1+ix].headMargin+this[id+1+ix].tailMargin) < 0){
                myResult.splice(newDurations[ix]+this[id+1+ix].headMargin+this[id+1+ix].tailMargin);
            }
        }
    }
}
//リザルトがトラック長に満たない場合はカラ要素で埋める
    if(myResult.length < this.parent.length){
console.log('fill empty :' +( this.parent.length-myResult.length));
        myResult = myResult.concat(new Array(this.parent.length-myResult.length));
    }
//リターン
console.log([myResult.join(),startFrame,endOffset]);
    return [myResult.join(),startFrame,endOffset];
}


}
XpsTimelineSectionCollection.prototype = Array.prototype;
/*
    ターゲットセクションの値種別が範囲外記述を含む場合
    かつ
    ターゲット前方区間の合計継続時間がターゲットセクションの前方範囲外記述(topFlow)の数を下回る場合
     (* この時点でmyResult.length=0)
     前方範囲外記述分のオフセットが必要になる
*/

/**
 * @constructor XpsTimelineSection
 *
 * セクションオブジェクト
 * りまぴんではセクション編集時に都度生成される
 * セクションはトラックの要素でありセクションコレクションに格納される
 * 中間値生成セクションはそのプロパティとしてCollectionを持ち中間値生成サブセクションを内包する
 * parentにトラックオブジェクトを与えて初期化すると標準セクションセクションオブジェクトを与えると中間値補間サブセクションとして機能する
  * 継続時間は調整可能
 * 値は後から設定する初期値はundefined
 * 区間は必ずしも値をもたない
 値なし(undefined)のケースは、
 	-デフォルト値を継承 
 	-前後のセクションが値を持ち、サブセクションが値を得るための情報を持つ
 の2ケースがあるので注意
 
 セクションを中間値生成セクションとして初期化するためには、引数isInterpをtrueにする
 subSectionsが初期化されデフォルトのサブセクションが登録される

 * @param myParent
 * @param myDuration
 * @param isInterp
 */
function _getSectionId () {
    for (var idx = 0; idx < this.parent.length; idx++) {
        if (this.parent[idx] === this) return idx;
    }
};
function _getSectionStartOffset() {
    var myOffset = 0;
    for (var idx = 0; idx < this.parent.length; idx++) {
        if (this.parent[idx] === this) {
            return myOffset;
        } else {
            myOffset += this.parent[idx].duration;
        }
    }
};
/**
 * ValueInterpolatorは必要な情報を収集して、value プロパティに対して中間値を請求するオブジェクト
 * 実際の計算は各値のValue自身が行い仮のオブジェクトを作成して返す
 * 値エージェントとなるオブジェクト
 各valueプロパティには中間値補間
 startValue.interpolate(endValue,indexCount,indexOffset,frameCount,frameOffset,props)
 が実装される
 ただし、Sound等中間値補間の存在しないオブジェクトには当該メソッドは不用（undefined）
 そもそも補間区間を作らないので、ValueInterpolatorオブジェクトが作成されない

XpsTimelineSection.valueプロパティはnas.xMapElement
 */

nas.ValueInterpolator = function ValueInterpolator (parent){
    this.parent=parent;//interpolateSection
}


nas.ValueInterpolator.prototype.valueOf = function valueOf(myProp){
        var indexCount=parseInt(this.parent.subSections.length);//サブセクションの総数なので親の親のサブセクション
        var indexOffset=this.parent.id()
        var startValue=this.parent.parent.sections[currentIndex-1].value;
        var frameCount=this.parent.duration;
        var frameOffset=this.parent.startOffset();
        var endValue=this.parent.parent.sections[currentIndex+1].value;
        return startValue.interpolate(endValue,indexCount,indexOffset,frameCount,frameOffset,myProp);

/*
        var indexCount=parseInt(this.parent.parent.subSections.length);//サブセクションの総数なので親の親のサブセクション
        var indexOffset=this.parent.id()
        var startValue=this.parent.parent.parent.sections[currentIndex-1].value;
        var frameCount=this.parent.parent.duration;
        var frameOffset=this.parent.startOffset();
        var endValue=this.parent.parent.parent.sections[currentIndex+1].value;
        return startValue.interpolate(endValue,indexCount,indexOffset,frameCount,frameOffset,myProp);
*/
}

nas.ValueInterpolator.prototype.getStream = function getStream(frameCount){
    if(! frameCount) frameCount=this.parent.duration;
    var resultContent = new Array(frameCount);
    resultContent[0] = this.parent.getContent()[0];
    return resultContent;
}


/**
 * タイムラインセクションは使用の都度初期化される一時オブジェクト
 * セクションコレクションにトラックごとに変更フラグを設けて、変更がない限りは再ビルドを避ける
 * セクションオブジェクトはparentプロパティにコレクションを含むオブジェクトを持つ XpsTimelineTrack || XpsTimelineSection
 * (直接メンバーとなるコレクションではなくコレクションを保持する上位オブジェクトで)
 *
 * parent   : 親となるXpsTimelineSectionCollection または XpsTimelineSelection
 * duration : セクションの長さ 通常０で初期化されてパーサにより更新される
 * isInterp : 初期化時に中間値補完サブセクションとして初期化が可能
 
 *  parentがXpsTimelineSelectionCollection の場合は、基礎セクション(有値セクション及び中間値補間セクション)となる
 *    有値セクションは、セクションのvalueとしてnas.xMapElementのcontentプロパティを指し かつsectionsプロパティがundefinedとなる。
 *      中間値補間セクションは、valueを持たない(undefined)かつsectionsプロパティにメンバーを持つ
 *   parentがXpsTimelineSectionの場合は、サブセクション（中間値補間サブセクション）となる
 *       中間値補間サブセクションは valueプロパティとしてValueInterpolatorオブジェクトを持ちmapElementを持たない
 */
function XpsTimelineSection(parent, duration, isInterp) {
    this.parent   = parent      ;
    this.duration = duration    ;
    this.headMargin = 0;
    this.tailMargin = 0;
    if(this.parent instanceof XpsTimelineSection){
        this.mapElement;//this.parent.parent.xParent.parentXps.xMap.getElementByName(this.value.)
        this.value=new nas.ValueInterpolator(this);
        this.subSections;//サブセクションコレクションを持たない
    }else{
        this.mapElement;//mapElementはxMapElementへの参照  undefinedで初期化してパーサが値を設定する
        this.value;//valueは this.mapElement.contentへの参照又はundefined  undefinedで初期化してパーサが値を設定する
        this.subSections =(isInterp)? new XpsTimelineSectionCollection(this):undefined;
    }
    this.toString = function (opt) {
        if(opt){
            if(this.value){
                return this.value.getStream(this.duration).join(',');
                // **値によって戻り値がdurationと異なる場合があるので要注意
            }else{
                return new Array(this.duration).join(',');
            }
        }else{
            return this.duration + ":" + this.value;
        }
    }
}
/** セクションの範囲のセルの値を配列で返す
引数: なし
返値: 配列
*/
XpsTimelineSection.prototype.getContent = function(){
        var startframe = this.startOffset();
        var timeline   = this.parent.parent;
    if(this.parent.parent instanceof XpsTimelineSection){
    //サブセクション　親セクションのオフセットを追加する
        startframe += this.parent.parent.startOffset();
        timeline = this.parent.parent.parent.parent;
    }
    return timeline.slice(startframe,startframe+this.duration);
}
/** 指定の長さに従ってセクションの内容を返す
指定長が、コンテンツの最小長を割る場合は、value自身が（ユーザ入力を失わないために）指定を無視して最小の長さのストリームを返す。
そのため　リザルトが引数のと一致しない場合がある
引数: frameCount
返値: 配列+offset

セクションがサブセクションを持つ場合は、現在のサブセクションの構造を保って伸縮するように試みる。
指定された継続長が現在よりも短ければ内容をカット
長い場合は最初のサブセクションを繰り返す
負数が指定された場合は空配列を戻す（duration==0）
特殊条件
((frameCount ==  1)&&(headMargin == -1)&&(tailMargin == -1))


(this.getContent)
*/
XpsTimelineSection.prototype.getStream = function(frameCount){
console.log(frameCount);
    if( frameCount < 0 ) return [];
    if(! frameCount ) frameCount = this.duration;
    if(this.subSections){
        if (frameCount < this.dutarion){
            return this.getContent().slice(0,frameCount);
        }else{
            var newContent = this.getContent();//オリジナルを展開
            var sourceSection = this.subSections[0];
            while (newContent.length < frameCount){
               newContent = newContent.concat(sourceSection.getStream());
                if (newContent.length > frameCount) break;
            }
            return newContent.slice(0,frameCount);
        }
    }else{
        if(!(this.value)) frameCount = frameCount + this.headMargin + this.tailMargin;
        if(frameCount < 0) frameCount = 0;
console.log(this);
        var myResult=(this.value)? this.value.getStream(frameCount): new Array(frameCount);
        return myResult
    }
}

XpsTimelineSection.prototype.id = _getSectionId;
XpsTimelineSection.prototype.startOffset = _getSectionStartOffset;


/**
 * @constructor XpsTimelineSubSection
    中間値生成サブセクション
    セクション内のサブセクション
    動画中割及びジオメトリ、コンポジットタイムラインの中間値を生成するオブジェクト
    区間内インデックスをもち
    親タイムライン上の先行するセクションの値と後方セクションの間の値を生成して返す
    valueプロパティはnas.ValueInterpolator Object
* parentにはセクションオブジェクトを与えて初期化する
   サブセクションはセクションオブジェクトを兼用？？＞＞兼用する
    

function XpsTimelineSubSection(myParent, myDuration) {
    this.parent = myParent;
    this.duration = myDuration;
    this.value=new nas.ValueInterpolator(this);//valueはnas.ValueInterpolator
    this.toString = function () {
        return this.duration + ":" + this.value;
    }
}
XpsTimelineSubSection.prototype.id = _getSectionId;
XpsTimelineSubSection.prototype.strtOffset = _getSectionStartOffset;
 */

/**
 * @constructor object Xps コンストラクタ
 * @param Layers タイムライントラックのうちデフォルトのダイアログ(1)を抜いた数
 * @param Length 継続長 フレーム数
 * @param Framerate フレームレート Object nas.Framerate or Number fps
 *
 *     Xpsオブジェクトの初期化引数を拡張
 * 第一引数はかつて「レイヤ数」であったが、これを拡張して配列を受け取れるようにする
 * 引数がスカラの場合は、従来互換として「リプレースメントトラック数」とする
 * 配列であった場合は、以下の順で解決を行う
 * 
[リプレースメントトラック数]
[ダイアログトラック数,リプレースメントトラック数]
[ダイアログトラック数,リプレースメントトラック数,ジオメトリトラック数]
[ダイアログトラック数,リプレースメントトラック数,ジオメトリトラック数,コンポジットトラック数]

配列長が1の場合は、特例でリプレースメントトラック数とする
ダイアログトラック数は、1以上とする1以下の値が与えられた際は1として初期化される。

完全な指定を行う場合は、引数として専用の指定オブジェクトを渡す
例:
{
    dialog:1,
    still:1,
    replacement:2,
    still:1,
    replacement:2,
    camera:1,
    replacement:2,
    effects:1,
    sound:2
}
 *  各プロパティの出現順位置・回数は任意
 *  冒頭は基本的にdialigで1以上の値にすること
 *  末尾プロパティはcommentで値1とすること
 *  冒頭プロパティがdialogでない場合は、{dialog:1} が補われる
 *  末尾プロパティがcommentでない場合にはデフォルトの{comment:1}が補われる
 * 
 */
function Xps(Layers, Length, Framerate) {
    if (typeof Framerate == 'undefined'){
        Framerate = false;
    } else if (!(Framerate instanceof nas.Framerate)){
         Framerate = nas.newFramerate(String(Framerate));
    }
    if (! Framerate) Framerate = nas.newFramerate(nas.FRATE.toString());

    if (!Layers) Layers = 4;	//標準的なA,B,C,D の4レイヤで初期化
    if(!isNaN(Layers)) Layers = [Layers];//単独スカラ引数の場合配列化
    //配列引数の場合トラック配置用のオブジェクトに展開
    var trackSpec=[];
    if(! (Layers[0] instanceof Array)){
        switch (Layers.length){
            case 0:trackSpec=[["dialog",1],["timing",4]];break;
            case 1:trackSpec=[["dialog",1],["timing",Layers[0]]];break;
            case 2:trackSpec=[["dialog",Layers[0]],["timing",Layers[1]]];break;
            case 3:trackSpec=[["dialog",Layers[0]],["timing",Layers[1]],["camera",Layers[2]]];break;
            case 4:
            default:
                trackSpec=[["dialog",Layers[0]],["timing",Layers[1]],["camera",Layers[2]],["effect",Layers[3]]];
        }
    }else{
        for(var pix=0;pix<Layers.length;pix++){
            if(! String(Layers[pix][0]).match(XpsTrackPropRegex)){
                trackSpec=[["dialog",1],["timing",4]];
                break;
            }else{
                trackSpec.push(Layers[pix]);
            }
        };
    //引数が配置オブジェクトでなければ、デフォルトの配置オブジェクトを置いてブレイク
    }
//if(dbg) console.log(trackSpec);
    if(isNaN(Length)){Length = nas.FCT2Frm(Length,Framerate)}
    if (!Length){
        Length = Math.ceil(Framerate.rate);//現状のレートで1秒を初期化
//console.log (Framerate);
//console.log (Length);
    }
    /**
     * デフォルト値がレイヤなし継続長なしだと弊害があるのでデフォルト値を変更 2009/10/12
     * 旧オブジェクトに存在したエラーメッセージ群はUIオブジェクトへ分離
     * Xps標準のプロパティ設定
     */
    /**
     * すべてのプロパティでXpsを初期化するのは、基準値トレーラーとしての基底オブジェクトのみ
     * (Xps.parentStage == null)
     * 以降のステージは、基底オブジェクトをprototypeとして作成される。
     prptotype継承案は廃止ステージを新設する毎に必要ならば複製を作ってそれを編集する
     xpsTracksに複製メソッドが必要
     addLine又はbranch,add(new)Stage,add(new)Job,
     */
    this.parent;//親Xps参照用プロパティ初期値は undefined（参照無し）
    /**
    XpsのstageオブジェクトはxMap共用のPm.Issueオブジェクトと置換する
    Issueオブジェクトの文字列化メソッドは標準でxMap記録文字列
    オプションでXps文字列・カット識別子文字列の切り替え
    */

    this.xMap =new xMap();//参照用xMapを初期化

//    this.stage = new XpsStage(this, "", "");
//    this.stage = new nas.Pm.Issue(this, "", "");
    this.line  = new XpsLine("(本線):0");
    this.stage = new XpsStage("layout:0");
    this.job   = new XpsStage('init:0');
//    this.currentStatus = 'Startup';//old
    this.currentStatus = new JobStatus();//new
    /**
     * オブジェクトでないほうが良いかも＞line/stage/job のオブジェクトに変更予定
     * ファイルパスでなく参照オブジェクトに変更予定オブジェクト側に参照可能なパスがあるものとする
     * @type {string}
     */
    this.mapfile = "";

    /**
     * @desc ここからオブジェクト化を検討中
     * @type {string}
     *
    this.opus = (myOpus) ? myOpus : "--";
    this.title = (myTitle) ? myTitle : "noTitle";
    this.subtitle = (mySubTitle) ? mySubTitle : "--";
    this.scene = (myScene) ? myScene : "";
    this.cut = (myCut) ? myCut : "";
     */
    this.opus     = "";
    this.title    = "";
    this.subtitle = "";
    this.scene    = "";
    this.cut      = "";
/*
	CSInfoオブジェクトがコンテの内容を保持しているのでそこから作成
	XPSの記録自体はオブジェクトプロパティとしての保持のみでOKか？
 */
    this.trin = [0, "trin"];
    this.trout = [0, "trout"];
    this.framerate = nas.newFramerate(Framerate.toString());
    this.rate = this.framerate.toString(true); //互換維持のため残置順次削除

    var Now = new Date();
    this.create_time = Now.toNASString();
    this.create_user = (xUI.currentUser)? xUI.currentUser:new nas.UserInfo(myName);
    this.update_time = Now.toNASString();
    this.update_user = (xUI.currentUser)? xUI.currentUser:new nas.UserInfo(myName);

//  this.memo = "";
    //メモはトラックコレクションのプロパティへ移行プロパティ名はXps.xpsTracks.noteText

    /**
     * タイムライントラックコレクション配列
     */
//    this.xpsTracks = this.newTracks(Layers, Length);
    this.xpsTracks = this.newTracks(trackSpec, Length);
//if(dbg) console.log(this.xpsTracks);
    //コレクションの初期化で同時にシートメモが空文字列で初期化される
}

/**
 * 新規タイムライントレーラを作成
 * 固定のダイアログタイムライン及びフレームコメントタイムラインがある。
 * この二つのタイムラインは、レコードの開始及び終了マーカーを兼ねるため削除できないので注意
 *現状で以前の引数を踏襲しているため旧のレイヤーカウントで初期化が行なわれる
 *  トラックカウントに変更の予定
trackSpec オブジェクトで初期化に変更
 * @param trackCount
 * @param frameCount
 * @returns {Array}
 * タイムライントラックトレーラはプロパティトレーラを兼ねる
 * 初期化時のみ利用
 * 初期化時にカメラトラックを作成しない
 */
Xps.prototype.newTracks = function (trackSpec,trackDuration) {
    var myTimelineTracks = new XpsTrackCollection(this,this.jobIndex,trackDuration);//parent,index,duration
    var trackCount  = 0;
    var dialogIndex = 1;
    var soundIndex = 1;
    var stilIndex = 1;
    var cellIndex = 0;
    var cameraIndex = 1;
    var effectIndex = 1;
    var defaultNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for(var pix=0;pix<trackSpec.length;pix++){
        switch (trackSpec[pix][0]){
            case "dialog":
                if(trackCount==0) {trackSpec[pix][1] --;trackCount ++;}
                for(var ix=0;ix <trackSpec[pix][1];ix++){
                    myTimelineTracks.splice( myTimelineTracks.length-1, 0,
                        new XpsTimelineTrack("N"+dialogIndex, trackSpec[pix][0],this.xpsTracks,trackDuration,trackCount)
                    );
                    dialogIndex ++;
                };
            break;
            case "sound":
                for(var ix=0;ix <trackSpec[pix][1];ix++){
                    myTimelineTracks.splice( myTimelineTracks.length-1, 0,
                        new XpsTimelineTrack("S"+dialogIndex, trackSpec[pix][0],this.xpsTracks,trackDuration,trackCount)
                    );
                    soundIndex ++;
                };
            break;
            case "cell":
            case "replacement":
            case "timing":
                for(var ix=0;ix <trackSpec[pix][1];ix++){
                    myTimelineTracks.splice( myTimelineTracks.length-1, 0,
                        new XpsTimelineTrack(defaultNames.charAt(cellIndex % 26), trackSpec[pix][0],this.xpsTracks,trackDuration,trackCount)
                    );
                    cellIndex ++;
                };
            break;
            case "still":
                for(var ix=0;ix <trackSpec[pix][1];ix++){
                    myTimelineTracks.splice( myTimelineTracks.length-1, 0,
                        new XpsTimelineTrack(nas.Zf(trackCount,2), trackSpec[pix][0],this.xpsTracks,trackDuration,trackCount)
                    );
                    stillIndex ++;
                };
            break;
            case "camera":
            case "camerawork":
            case "geometry":
                for(var ix=0;ix <trackSpec[pix][1];ix++){
                    myTimelineTracks.splice( myTimelineTracks.length-1, 0,
                        new XpsTimelineTrack("cam"+cameraIndex, trackSpec[pix][0],this.xpsTracks,trackDuration,trackCount)
                    );
                    cameraIndex ++;
                };
            break;
            case "sxf":
            case "effect":
            case "composite":
                for(var ix=0;ix <trackSpec[pix][1];ix++){
                    myTimelineTracks.splice( myTimelineTracks.length-1, 0,
                        new XpsTimelineTrack("ex"+effectIndex, trackSpec[pix][0],this.xpsTracks,trackDuration,trackCount)
                    );
                    effectIndex ++;
                };
            break;
            default:
                continue;//コメント等他のトラックはスキップ
        }
        trackCount ++;
    }
/*
//old-one
    var trackCount = layerCount+2;
    var camCount = 0;
    var sfxCount = 0;
    var cellCount = trackCount - camCount - sfxCount - 2 ;
    var myJobIndex=0;
if(true){    
    var myTimelineTracks = new XpsTrackCollection(this,this.jobIndex,trackDuration);//parent,index,duration
}else{
    var myTimelineTracks = [];
}
//    myTimelineTracks.push(new XpsTimelineTrack("N","dialog",this.xpsTracks,trackDuration,0));//default dialog track
    var defaultNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var idx = 0; idx < cellCount; idx++) {
        myTimelineTracks.splice( myTimelineTracks.length-1, 0, new XpsTimelineTrack(defaultNames.charAt(idx % 26), "timing",this.xpsTracks,trackDuration,idx+1));
    }
    for (var idx = 0; idx < camCount; idx++) {
        myTimelineTracks.splice( myTimelineTracks.length-1, 0, new XpsTimelineTrack("cam"+idx , "camera" ,this.xpsTracks,trackDuration,idx+1));
    }
    //レコード末尾にコメントトレーラを置く
//    myTimelineTracks.push(new XpsTimelineTrack("","comment",this.xpsTracks,trackDuration,cellCount+1));
    //コレクションのプロパティとしてメモ欄の伝達事項を置く
//    myTimelineTracks.noteText="";
*/
    //トラックのインデックス更新正規化
    myTimelineTracks.renumber();
//if(dbg) console.log(myTimelineTracks);
    return myTimelineTracks;
};

/**
 * XPS.のメソッドを定義
 * xpsTracksのメンバーをタイムラインオブジェクトとしてアクセスする抽出メソッド
 *
 * @param idx
 * @returns {*}
 */
Xps.prototype.timeline = function (idx) {
    return this.xpsTracks[idx];
};
/**
 * 再初期化
 
 現状旧オブジェクトの影響でレイヤ数(==トラック数-2)で初期化されるようになっているトラック数で初期化に変更する準備中

 * @param Tracks
 * @param Length
 * @param Framerate
 */
Xps.prototype.init = function (Tracks, Length, Framerate) {
    if (!(Framerate instanceof nas.Framerate)) Framerate = nas.newFramerate(String(Framerate));
    if (Framerate) this.framerate = Framerate;//falseに判定される不正値が戻された場合は処理スキップ
    if (!Tracks) Tracks = 6;
//trackSpec の作成コードが複製なので後ほど処理を検討
    if(!isNaN(Tracks)) Tracks = [Tracks];//単独スカラ引数の場合配列化
    //配列引数の場合トラック配置用のオブジェクトに展開
    var trackSpec=[];
    if(! (Tracks[0] instanceof Array)){
        switch (Tracks.length){
            case 0:trackSpec=[["dialog",1],["timing",4]];break;
            case 1:trackSpec=[["dialog",1],["timing",Tracks[0]]];break;
            case 2:trackSpec=[["dialog",Tracks[0]],["timing",Tracks[1]]];break;
            case 3:trackSpec=[["dialog",Tracks[0]],["timing",Tracks[1]],["camera",Tracks[2]]];break;
            case 4:
            default:
                trackSpec=[["dialog",Tracks[0]],["timing",Tracks[1]],["camera",Tracks[2]],["effect",Tracks[3]]];
        }
    }else{
        for(var pix=0;pix<Tracks.length;pix++){
            if(! String(Tracks[pix][0]).match(XpsTrackPropRegex)){
                trackSpec=[["dialog",1],["timing",4]];
                break;
            }else{
                trackSpec.push(Tracks[pix]);
            }
        };
    //引数が配置オブジェクトでなければ、デフォルトの配置オブジェクトを置いてブレイク
    }
    if(isNaN(Length)){Length = nas.FCT2Frm(Length,Framerate)}
    if (!Length) Length = Math.ceil(this.framerate);
    /**
     * Xps標準のプロパティ設定
     * @type {string}
     */
    this.xMap =new xMap();//参照用xMapを初期化
//    if (this.mapfile);//Xps初期化手順に注意初期化時にxMapを与えるのが正道
    this.opus = myOpus;
    this.title = myTitle;
    this.subtitle = mySubTitle;
    this.scene = myScene;
    this.cut = myCut;

    this.trin = [0, "trin"];
    this.trout = [0, "trout"];

//    this.framerate = nas.newFramerate(nas.FRATE.toString());//初期パラメータのチェックで更新済
    this.rate = this.framerate.name;
    var Now = new Date();
    this.create_time = Now.toNASString();
    this.create_user = (xUI.currentUser)? xUI.currentUser:new nas.UserInfo(myName);
    this.update_time = Now.toNASString();
    this.update_user = (xUI.currentUser)? xUI.currentUser:new nas.UserInfo(myName);

//    this.memo = "";

    /**
     * タイムライントレーラー作成
     * @type {Array}
     */
//    this.xpsTracks = this.newTracks(Tracks, Length);
    this.xpsTracks = this.newTracks(trackSpec, Length);
};

/*
    getMAPメソッド自体が不要（）
 */
Xps.prototype.getMap = function (MAP) {
     /**
     * マップ無ければ失敗
     */
    if (!MAP) {
        xUI.errorCode = 5;
        return false;
    }

    /**
     * レイヤプロパティ設定()
     */
//xMapの性質が変わったため、mapBodyプロパティは廃止Mapを参照してレイヤ数を決定する必要なし

//    this.xpsTracks.length = (MAP.mapBody.length - 2 > this.xpsTracks.length) ?
//  MAP.mapBody.length - 2 : this.xpsTracks.length;//大きいほうを採る
    /**
     * レイヤプロパティを取得する。マップに無い情報はパスする。
     * マップが小さい場合は元に情報が残る?不足分はデフォルトで埋めるか?
     */
    for (id = 0; id < (MAP.mapBody.length - 2); id++) {
        /**
         * レイヤのプロパティをMAPオブジェクトのプロパティから読み込む(ダミーだけど)
         * 読み込んだジオメトリは、セル(グループ)のジオメトリであって、
         * 個々のエントリのジオメトリではない点に注意。
         */
        if (id + 1 < MAP.groups.length) {
            var name = MAP.groups[id + 1][0];
            var sizeX = MAP.getgeometry(id + 1, "sizeX");
            var sizeY = MAP.getgeometry(id + 1, "sizeY");
            var aspect = MAP.getgeometry(id + 1, "aspect");
            var lot = MAP.getmaxlot(id + 1);
        } else {
            var name = "noValue";
            var sizeX = 1280;
            var sizeY = 720;
            var aspect = 1;
            var lot = 10;
        }
        /**
         * りまぴん専用?
         * @type {string}
         */
        var blmtd = "wipe";
        var blpos = "end";
        var option = "timing";
        /**
         * リンクする親オブジェクト
         * "."区切りでIDナンバでパスを(暫定)
         * @type {string}
         */
        var link = ".";

        this.xpsTracks[id] = new XpsTimelineTrack(name,option,this.xpsTracks,"",id);
        this.xpsTracks[id]["sizeX"] = sizeX;
        this.xpsTracks[id]["sizeY"] = sizeY;
        this.xpsTracks[id]["aspect"] = aspect;
        this.xpsTracks[id]["lot"] = lot;
        this.xpsTracks[id]["blmtd"] = blmtd;
        this.xpsTracks[id]["blpos"] = blpos;
        this.xpsTracks[id]["link"] = link;
        this.xpsTracks[id]["parent"] = link;
    }
};

/**
 * カット識別子を返すオブジェクトメソッド
 * Xps.getIdentifier(識別オプション,)
 * カット識別文字列を返す
 * カット識別子はタイトル、制作番号、シーン、カット番号の各情報をセパレータ"_"で結合した文字列
 * カット番号以外の情報はデフォルトの文字列と比較して一致した場合セパレータごと省略
 * オプションで要素の結合状態を編集して返す
 *
 セパレータ文字列は[(__)#\[]
 出力仕様をクラスメソッド互換に変更
 オブジェクトメソッドを利用する場合はURIEncodeを使用しないプレーン文字列でやり取りが行われるものとする
 旧:     TITLE_OPUS_SCENE_CUT
 新:     TITLE#OPUS[subtitle]__sSCENE-cCUT(time)

 基本的に’結合文字列をファイル名として使用できる’’ユーザ可読性がある’ことを前提にする
    プロダクションIDとSCiは"__(二連アンダーバー)"でセパレートする
    部分エンコーディング
    各要素は、自身の要素のセパレータを含む場合'%'を前置して部分的にURIエンコーディングを行う
    要素の文字列は識別子をファイル名等に利用する場合、ファイルシステムで使用できない文字が禁止されるが、この文字も併せて部分エンコードの対象となる。
    対象文字列は、Windowsの制限文字である¥\/:*?"<>| に加えて . 及びエンコード前置文字の %
    (これらは関数側で記述)
    
TITLE"#"が禁止される
OPUS    "#","[","__" が禁止される
subtitle "["."]","__"が禁止される
SCi     "__","("が禁止される
 options:
 'full' 全ての要素を含む識別文字列で返す
        TITLE#OPUS[subtitle]__sSCENE-cCUT(time)
 'episode'
        #OPUS[subtitle]
 'cut'
        #OPUS__sSCENE-cCUT
 'simple'
        TITLE#OPUS__sSCENE-cCUT
 'complex'
        TITLE#OPUS[subtitle]__sSCENE-cCUT
 * @param opt
 * @returns {string}
 */
Xps.prototype.getIdentifier = function (opt) {
if(false){
    if (opt) {
        return [this.title, this.opus, this.scene, this.cut].join("_");
    } else {
        var myDatas = [this.title, this.opus, this.scene];
        var myDefaults = [myTitle, myOpus, myScene];
        var myResult = [];
        for (i in myDatas) {
            if (myDatas[i] != myDefaults[i]) {
                myResult.push(myDatas[i])
            }
        }
        myResult.push(this.cut);
        return myResult.join("__");
    }
}else{
    var myResult=""
    switch (opt){
    case 'cut':
        myResult='#'+nas.IdfEncode(this.opus,"#_\[")+'__'+nas.IdfEncode('s'+this.scene +'-c'+this.cut,"_");
    break;
    case 'simple':
        myResult=this.title+'#'+nas.IdfEncode(this.opus,"#_\[")+'__'+nas.IdfEncode('s'+this.scene +'-c'+this.cut,"_");
    break;
    case 'complex':
        myResult=nas.IdfEncode(this.title,"#")+'#'+nas.IdfEncode(this.opus,"#_\[")+'['+nas.IdfEncode(this.subtitle,"\[\]_")+']__'+ nas.IdfEncode('s'+this.scene +'-c'+this.cut,"_");
    break;
    case 'episode':
        myResult='#'+nas.IdfEncode(this.opus,"#_\[");
        if(this.subtitle) myResult = myResult +'['+nas.IdfEncode(this.subtitle,"\[\]_")+']';
    break;   
    case 'full':
    default    :
        var timeString=(this.framerate.opt=="smpte")?
        ((this.framerate.rate < 45)?nas.Frm2FCT(this.time(),6):nas.Frm2FCT(this.time(),7)):
        nas.Frm2FCT(this.time(),3,0,this.framerate);
        myResult=this.title+'#'+this.opus+'['+this.subtitle+']__s'+this.scene+'-c'+this.cut+'('+ timeString+')';
    }

    return myResult;
}   
};

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
Xps.prototype.syncIdentifier =function(myIdentifier,withoutTime){
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
    }
return parseData;
}

/**
 * 継続時間をフレーム数で返す
 * ダイアログタイムラインの要素数で返す
 * 初期状態でボディの存在しないシートが存在しないように注意
 * 未記述でも空ボディのタイムラインが存在する。
 * エラー関連コードは排除の方向で
 *チェックが進んだら関数自体を廃してxpsTracks.durationの参照に切り替える
 * @returns {*}
 */
Xps.prototype.duration = function () {
    if(this.xpsTracks.duration){
        return this.xpsTracks.duration;
    }else{
        return this.xpsTracks[0].length;
    }
};
Xps.prototype.getDuration =function () { return this.xpsTracks.duration; }

/**
 * カット尺をフレーム数で返す
 * @returns {number}
 */
Xps.prototype.time = function () {
    return (this.duration() - Math.ceil((this.trin[0] + this.trout[0]) / 2));
};
/**
 * フレーム数からTCを返す
 * @param mtd
 * @returns {string}
 */
Xps.prototype.getTC = function (mtd) {
    return (nas) ? nas.Frm2FCT(mtd, 3, 0, this.framerate) : Math.floor(mtd / this.framerate) + "+" + mtd % this.framerate + ".";
};
/**
 * @todo 仮メソッドアトでキチンとカケ
 * 編集関連メソッド
 */


/**
 * Xpsにタイムラインを挿入
 データ構造変更により挿入・削除系操作はリニューアルが必要
 具体的には別オブジェクトの同期操作が不用になるので、単純化した操作系に変更するナリ
 引数はタイムラインオブジェクトを求める
 指定がない場合は、デフォルトの新規オブジェクトを作成して挿入するように変更
 * Xps.insertTL(id,Timelines)
 * Timelines(複数可・配列渡し)
 * idの前方に引数のタイムラインを挿入
 * idが未指定・範囲外の場合、後方へ挿入
 * 0番タイムラインの前方へは挿入不能(固定のデフォルトタイムライン)
 * 現状ではデータを持ったままタイムラインを挿入することはできない。
 * 必ず空のタイムラインが挿入される。
 *
 * @param myId
 * @param myTimelines
 */
Xps.prototype.insertTL = function (myId, myTimelines) {
    //引数が配列ではないまたは単独のタイムライントラックオブジェクトである場合配列化する
    /**
        XpsTimelineTrackが配列ベースのためか、通常の配列をinstanceof XpsTimelineTrack で判定すると trueが戻るので
        プロパティで判定を行う
        obj.id(トラックラベル)があればタイムライントラック
        typeofobj.length== "undefined"ならば 配列以外
    */
    if ((myTimelines.id) || (typeof myTimelines.length == "undefined")){
        myTimelines = [myTimelines];
    }
    if ((!myId ) || (myId < 1) || ( myId > this.xpsTracks.length - 2)) {
        myId = this.xpsTracks.length - 1
    }
    for (var idx = 0; idx < myTimelines.length; idx++) {
        /**
         * 挿入データの検査
         * 挿入データがタイムライントラック以外なら挿入データをラベルに持つtimingタイムラインを作成する
         */
        if (!(myTimelines[idx].id)) {
            if (myTimelines[idx]) {
                myTimelines[idx] = new XpsTimelineTrack(myTimelines[idx], "timing",this.xpsTracks,this.duration());
            } else {
                myTimelines[idx] = new XpsTimelineTrack(nas.Zf(idx + myId, 2), "timing",this.xpsTracks,this.duration());
            }
        }
        /**
         * 挿入データを揃えて挿入
         */
        this.xpsTracks.splice(myId + idx, 0, myTimelines[idx]);
    }
    return myTimelines;
};
//test insertTL(挿入点id,挿入するタイムラインオブジェクト配列)
//var myNewTracks=new XpsTimelineTrack("ins1","timing",XPS.xpsTracks,"")
// XPS.insertTL()
/**
 * Xps.deleteTL([id])
 * 指定idのタイムラインを削除する。1～
 * デフォルトの音声タイムラインとフレームコメントの削除はできない
 * IDを単独又は配列渡しで
 * XpsLayerとxpsTracks はそのうちタイムラインとして統合すべきかと思う。
 *
 * @param args
 */
Xps.prototype.deleteTL = function (args) {
    if (!(args instanceof Array)) {
        args = [args]
    }
    args.sort().reverse();
    for (var idx = 0; idx < args.length; idx++) {
        //操作範囲外の値は無視
        var targetIndex = args[idx];
        if (isNaN(targetIndex)) {
            continue;
        }
        if ((targetIndex > 0) && (targetIndex < this.xpsTracks.length - 1)) {
            this.xpsTracks.splice(targetIndex, 1);
        }
    }

};
/**
     Xpsの継続時間を変更する
     引数：int フレーム数
     現在の値と同じ場合は何もしない
     継続時間が減少する場合はシート後方から削除
     増加の場合は""で初期化
     0は処理失敗
*/
Xps.prototype.setDuration =function(myDuration){
    if(! myDuration) return false;
    if(myDuration != this.xpsTracks.duration){
        var currentDuration = this.xpsTracks.duration;
        for(var tid = 0 ; tid < this.xpsTracks.length ; tid ++){
            this.xpsTracks[tid].length = myDuration;
            if(myDuration > currentDuration){
                for (var fid=currentDuration;fid<myDuration;fid++){
                    this.xpsTracks[tid][fid]="";
                }
            }
        }
        this.xpsTracks.duration = myDuration;
    }
    return this.xpsTracks.duration;
}
/**
 * Xps.reInitBody(newTimelines:int,newDuration:int)
 *
 * Xps本体データのサイズを変更する。
 * 元あったデータ内容は可能な限り保存
 * 切り捨て分はなくなる。
 * 新たに出来たレコードは、ヌルストリングデータで埋める。
 * セクションキャッシュはすべて無効
 トラック引数の値はコメントトラックの値を含めたトラック全数
 トラック状態を[dialog,timing,comment]にするためには３を与える
 レイヤー数にあらず 
 * @param newTimelines
 * @param newDuration
 * @returns {boolean}
 */
Xps.prototype.reInitBody = function (newTimelines, newDuration) {
    var oldWidth = (this.xpsTracks.length);
    if (!newTimelines) newTimelines = oldWidth;
    var oldDuration = this.duration();//this.xpsTracks.duration;
    if (!newDuration) newDuration = oldDuration;
    if (newTimelines < 1 || newDuration <= 0) {
        return false;
    }
    var widthUp    = (newTimelines > oldWidth)   ? 1 : (newTimelines == oldWidth)   ? 0 : -1 ;
    var durationUp = (newDuration > oldDuration) ? 1 : (newDuration == oldDuration) ? 0 : -1 ;
//  トラック数を先に編集トラック数が増えた場合は空白ラベルで挿入減っている場合は削除メソッドを発行
    if(widthUp > 0){
        var newTracks=[];
        var widthUpCount = newTimelines-oldWidth;
                        alert("add new "+widthUpCount+ ' tracks!');
        for (var tid = 0 ; tid < widthUpCount ; tid ++){
            newTracks.push(new XpsTimelineTrack('','timing',this.xpsTracks,this.duration()));
        }
        this.xpsTracks.insertTrack(0,newTracks);
//if(dbg) console.log(this.xpsTracks);
    }else if(widthUp < 0){
        for (var tid = (this.xpsTracks.length-2);tid >= (newTimelines-1);tid --){
            this.xpsTracks[tid].remove();
        }
    }
//  トラック長を変更する
    if(durationUp != 0){
        this.setDuration(newDuration);
    }
     return true;

if(this.xpsTracks.duration){
    // NOP
}else{
    this.xpsTracks.length = newTimelines;//配列長(タイムライン数)の設定 メソッドに置きかえ予定

    /**
     * 延長したらカラデータで埋める
     * この部分はxpsTracksへの変更にともなって更新が必要
     */
    if (widthUp) {
        for (var i = 0; i < oldWidth; i++) {
            this.xpsTracks[i].length = newDuration;
            if (durationUp) {
                for (var f = oldDuration; f < newDuration; f++) {
                    this.xpsTracks[i][f] = '';
                }
            }
        }
        for (var i = oldWidth; i < newTimelines; i++) {
 //           this.xpsTracks[i] = new Array(newDuration);
//	XpsTimelineTrack(myLabel, myType, myParent, myLength, myIndex)
            this.xpsTracks[i] = new XpsTimelineTrack(i,option,this.xpsTracks,newDuration,i);
//if(durationUp)
            for (var f = 0; f < newDuration; f++) {
                this.xpsTracks[i][f] = '';
            }
        }
    } else {
        for (var i = 0; i < newTimelines; i++) {
            this.xpsTracks[i].length = newDuration;
            if (durationUp) {
                for (var f = oldDuration; f < newDuration; f++) {
                    this.xpsTracks[i][f] = '';
                }
            }
        }
    }

    /**
     * タイムラインが増えた場合は、再描画前にグループ情報の追加が必要
     * 空データを自動生成してやる必要あり
     * 現在はラベル名以外は直前タイムラインの複製
     * @type {number}
     */
//    this["layers"].length = (newTimelines - 2);//(現在決め打ち)
	this.xpsTracks.length = newTimelines;
    if (widthUp) {
        for (i = oldWidth - 2; i < (newTimelines - 2); i++) {
            this.xpsTracks[i] = new XpsTimelineTrack(i,"timing",this.xpsTracks,newDuration);//myLabel, myType, myParent, myLength
            this.xpsTracks[i]["id"] = ("00" + i).slice(-2);
            this.xpsTracks[i]["sizeX"] = this.xpsTracks[oldWidth - 3]["sizeX"];
            this.xpsTracks[i]["sizeY"] = this.xpsTracks[oldWidth - 3]["sizeY"];
            this.xpsTracks[i]["aspect"] = this.xpsTracks[oldWidth - 3]["aspect"];
            this.xpsTracks[i]["lot"] = this.xpsTracks[oldWidth - 3]["lot"];
            this.xpsTracks[i]["blmtd"] = this.xpsTracks[oldWidth - 3]["blmtd"];
            this.xpsTracks[i]["blpos"] = this.xpsTracks[oldWidth - 3]["blpos"];
            this.xpsTracks[i]["option"] = this.xpsTracks[oldWidth - 3]["option"];
            this.xpsTracks[i]["link"] = this.xpsTracks[oldWidth - 3]["link"];
            this.xpsTracks[i]["parent"] = this.xpsTracks[oldWidth - 3]["parent"];
        }
    }
}
    return true;
};
/**
 * Xps.getRange(Range:[[startC,startF],[endC,endF]])
 * 範囲内のデータをストリームで返す
 * xpsのメソッドに移行 2013.02.23
 * 範囲外のデータは、ヌルストリングを返す2015.09.18
 * 負のアドレスを許容150919
 * 全てシートの範囲外を指定された場合は、範囲のサイズの空ストリームを返す
 * チェックはない（不要）空ストリームを得る場合に使用可能
 * 開始と終了のアドレスが一致している場合は、該当セルの値を返す
 * 第一象限と第三象限の指定は無効
 *
 * @param Range
 * @returns {Array}
 */
Xps.prototype.getRange = function (Range) {
    if (typeof Range == "undefined") {
        Range = [[0, 0], [this.xpsTracks.length - 1, this.xpsTracks[0].length - 1]]
    }//指定がなければ全体をストリーム変換
    StartAddress = Range[0];
    EndAddress = Range[1];
//	if(StartAddress==EndAddress){return xpsTracks[StartAddress[0]][StartAddress[1]]}
    var xBUF = [];
    var yBUF = [];
    var zBUF = [];
    /**
     * ループして拾い出す
     */
    for (var r = StartAddress[0]; r <= EndAddress[0]; r++) {
        if (r < this.xpsTracks.length && r >= 0) {
            for (var f = StartAddress[1]; f <= EndAddress[1]; f++)
                xBUF.push((f < this.xpsTracks[r].length && f >= 0) ? this.xpsTracks[r][f] : "");
            yBUF.push(xBUF.join(","));
            xBUF.length = 0;
        } else {
            yBUF.push(new Array(EndAddress[1] - StartAddress[1] + 1).join(","));
        }
    }
    zBUF = yBUF.join("\n");
// ストリームで返す
    return zBUF;
};
/**
 * Xps.put(書込開始アドレス:[startC,startF],データストリーム)
 * 書込開始アドレスを起点にストリームでデータ置き換え
 * Xpsオブジェクトメソッド
 * undo/redo等はUIレベルの実装なのでここでは関知しない
 * 書込開始アドレスに負の数を与えると、書込アドレスが負の場合レンジ外となる
 * レンジ外データは無視される
 * このメソッドでは本体データとしてセパレータの",""\n"を与えることはできない（禁則事項）
 * リザルトとして書き込みに成功したベクトル（左上、右下）、書き換え前のデータストリーム、書き込みに成功したデータを返す
 *
 * @param myAddress
 * @param myStream
 * @returns {*}
 */
Xps.prototype.put = function (myAddress, myStream) {
    if ((!myAddress) || (typeof myStream == "undefined")) {
        return false
    }//指定がなければ操作失敗

    /**
     * データストリームが空文字列の場合は要素数１の配列に展開する
     * データストリームを配列に展開
     * @type {Array}
     */
    var srcData = new Array(myStream.toString().split("\n").length);
    for (var n = 0; n < srcData.length; n++) {
        srcData[n] = myStream.toString().split("\n")[n].split(",");
    }
    /**
     * 指定アドレスから書き込み可能な範囲をクリップする
     * @type {*[]}
     */
    var writeRange = [myAddress.slice(), add(myAddress, [srcData.length - 1, srcData[0].length - 1])];
    if (writeRange[0][0] < 0) writeRange[0][0] = 0;
    if (writeRange[0][0] >= this.xpsTracks.length)    writeRange[0][1] = this.xpsTracks.length - 1;
    if (writeRange[0][1] < 0) writeRange[0][1] = 0;
    if (writeRange[0][1] >= this.xpsTracks[0].length) writeRange[1][1] = this.xpsTracks[0].length - 1;
    if (writeRange[1][0] < writeRange[0][0]) writeRange[1][0] = writeRange[0][0];
    if (writeRange[1][0] >= this.xpsTracks.length)    writeRange[1][0] = this.xpsTracks.length - 1;
    if (writeRange[1][1] < writeRange[0][1]) writeRange[1][1] = writeRange[0][1];
    if (writeRange[1][1] >= this.xpsTracks[0].length) writeRange[1][1] = this.xpsTracks[0].length - 1;
    /**
     * 書き込み範囲をバックアップ
     * @type {Array}
     */
    var currentData = this.getRange(writeRange);
    /**
     * ループして置き換え
     */
    //var updatedRange=new Array();
    for (var c = 0; c < srcData.length; c++) {
        var writeColumn = c + myAddress[0];
        this.xpsTracks[writeColumn].sectionTrust=false;
        for (var f = 0; f < srcData[0].length; f++) {
            var writeFrame = f + myAddress[1];
            if (
                (writeColumn >= 0) && (writeColumn < this.xpsTracks.length) &&
                (writeFrame >= 0) && (writeFrame < this.xpsTracks[0].length)
            ) {
                this.xpsTracks[writeColumn][writeFrame] = srcData[c][f];
                //updatedRange.push([writeColumn,writeFrame]);
            }
        }
    }
    /**
     * 戻り値は、書き込みに成功したレンジ
     */
//	return this.getRange([updatedRange[0],updatedRange[updatedRange.length-1]]);
    return [writeRange, this.getRange(writeRange), currentData];
};

/**
 * 読み込みメソッド
 * ラッパとして残置されるが、内部には他フォーマットの判定部分を置かない。
 * インポーターとして使用する場合は、更にこの外側にデータ前処理部分をおくか、
 * このメソッドをオーバーライドして使用すること。
 * 戻り値として、parseXps の戻り値を返すこと。2013.04.06
 *
 * @param datastream
 * @returns {Boolean}
 */
Xps.prototype.readIN = function (datastream) {
    if (datastream instanceof Boolean) {
        return datastream
    }
    return this.parseXps(datastream);
};

/**
 * 読み込みメソッドのXpsパーサを分離
 * 元の読み込みメソッドは、このパーサのラッパとして残置
 * 他フォーマットのデータパーサはライブラリに分離される。
 * このメソッドはXpsのパース専用になる
 * (将来の拡張用として必須)2013.04.06
 * パース成功時はオブジェクト自身を返す。
 * @param datastream
 * @returns {boolean}
 * パーサにフラグを与えて、フレームレートが確定するまでフレーム計算を行わないように修正
 */
Xps.prototype.parseXps = function (datastream) {
/**
 *  マルチステージ拡張を行うため以前のコードに存在したエラーハンドリングは全廃
 */
    if ((! datastream)||(!(datastream.match))) {
//console.log('bad datestream:') ;console.log(datastream);
//console.log(datastream instanceof String);
        return false;
    }
    /**
     * ラインで分割して配列に取り込み
     * @type {Array}
     */
    var SrcData = [];
    if (datastream.match(/\r/)) {
        datastream = datastream.replace(/\r\n?/g, ("\n"))
    }
    SrcData = datastream.split("\n");
//		var AEK=true;//AEKey read-formatTestFlag
    /**
     * データストリーム判別プロパティ
     * @type {number}
     */
    SrcData.startLine = -1;//データ開始行
//	SrcData.dataClass	="";//データバージョン識別用に流用？
    /**
     * データ種別判定は、削除作業開始2013.04.04
     * ソースデータのプロパティ
     * @type {number}
     */
    SrcData.layerHeader = 0;//レイヤヘッダ開始行
    SrcData.layerProps = 0;//レイヤプロパティエントリ数
    SrcData.trackCount = 0;//トラック数
    SrcData.layers = [];//レイヤ情報トレーラー
    SrcData.layerBodyEnd = 0;//レイヤ情報終了行
    SrcData.frameCount = 0;//読み取りフレーム数
    SrcData.framerate = this.framerate ;//フレームレート（現ドキュメントの値）
    
    /**
     * 第一パス
     * データ冒頭の空白行を無視して、データ開始行を取得
     * 識別行の確認
     * 冒頭ラインが識別コードまたは空行でなかった場合は、さようなら御免ね
     * IEのデータの検証もここでやっといたほうが良い?
     * 第一パスでフレームレートの取得を行う
     * パースデータにフレームレートが指定されていない場合は、現在の値を維持
     */
    for (l = 0; l < SrcData.length; l++) {
        if (SrcData[l].match(/^\s*$/)) {

        } else {

            if (MSIE) {
                var choped = SrcData[l].charCodeAt(SrcData[l].length - 1);
                if (choped <= 32)
                    SrcData[l] = SrcData[l].slice(0, -1);
            }
            //なぜだかナゾなぜに一文字多いのか?
            /**
             *  データ処理中に含まれていた他フォーマットの解析部分は、別ライブラリで吸収
             *  バージョンは 0.5 まで拡張
             */
            if (SrcData[l].match(/^nasTIME-SHEET\ 0\.[1-5]$/)) {
                SrcData.startLine = l;//データ開始行
            } else if((SrcData.startLine >= 0)&&(SrcData[l].match(/^##FRAME_RATE=(.*)$/))){
                SrcData.framerate= nas.newFramerate(RegExp.$1);
                break;//データ開始行のあとにフレームレート指定があればブレーク
            }
        }
    }
    /**
     * 第一パス終了
     * データ識別行がなければ処理中断
     * データ行が無かったらサヨナラ
     * "読み取るデータがないのです。";
     */
    if(SrcData.startLine < 0){
//	this.errorMsg[10]=SrcData[l];//message10に当該トークンを格納
        xUI.errorCode = 2;
        return false;
//	"002:どうもすみません。このデータは読めないみたいダ\n"
    }
    if ((SrcData.length - SrcData.startLine) < 1) {
        xUI.errorCode = 3;
        return false;
    }
    /*
     if(! SrcData.dataClass){
     this.errorMsg[10]=("009:想定外エラー\n"+SrcData.dataClass + "error!");
     xUI.errorCode=9;return false;
     }
     */

    /**
     * 変数名とプロパティ名の対照テーブル
     * @type {string[]}
     */
    var varNames = [
        "MAPPING_FILE",
        "TITLE",
        "SUB_TITLE",
        "OPUS",
        "SCENE",
        "CUT",
        "TIME",
        "TRIN",
        "TROUT",
        "FRAME_RATE",
        "CREATE_USER",
        "UPDATE_USER",
        "CREATE_TIME",
        "UPDATE_TIME",
        "Line",
        "LineStatus",
        "Stage",
        "StageStatus",
        "Job",
        "JobStatus",
        "CurrentStatus"
    ];
    /**
     * @type {string[]}
     */
    var propNames = [
        "mapfile",
        "title",
        "subtitle",
        "opus",
        "scene",
        "cut",
        "time",
        "trin",
        "trout",
        "framerate",
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
    ];
    var props = new Array(varNames.length);
    for (i = 0; i < varNames.length; i++) {
        props[varNames[i]] = propNames[i];
    }
    /**
     * データ走査第二パス
     * 時間プロパティ欠落時のために初期値設定
     * @type {*[]}
     */
     var readMessage=false;
//		SrcData.time="6+0";
    SrcData.trin = [0, "trin"];
    SrcData.trout = [0, "trout"];

    for (line = SrcData.startLine; line < SrcData.length; line++) {
        /**
         * 前置部分を読み込みつつ、本体情報の確認
         */
        if (MSIE) {
            var choped = SrcData[line].charCodeAt(SrcData[line].length - 1);
            if (choped <= 32)
                SrcData[line] = SrcData[line].slice(0, -1);
        }
        //なぜだかナゾなぜに一文字多いのか?
        /**
         * 申し送り取得フラグが立っていればコメントと他の有効記述以外をメッセージに加算
         * 終了サインまたは他の有効記述で取得終了
         */
        if(readMessage){
            if(SrcData[line].match(/^#\[|^\[.*|^\#\#([A-Z].*)=(.*)$/)){
                readMessage=false;
            }else{
                if(! (SrcData[line].match(/^\#.*/))) SrcData.currentStatus.message+="\n"+SrcData[line];
            }
            continue;
        }
        /**
         *  シートプロパティにマッチ
         */
        if (SrcData[line].match(/^\#\#([A-Z].*)=(.*)$/i)) {
            nAme = RegExp.$1;
            vAlue = RegExp.$2;
            /**
             * 時間関連プロパティを先行して評価。
             * 読み取ったフレーム数と指定時間の長いほうでシートを初期化する。
             */
console.log(nAme);
            switch (nAme) {
                case    "FRAME_RATE":
                    //フレームレートは第一パスで取得
                break;
                case    "TRIN":
                case    "TROUT":
                /**
                 * トランシットイン
                 * トランシットアウト
                 * @type {*}
                 */
                    var tm = nas.FCT2Frm(vAlue.split(",")[0],SrcData.framerate.rate);
                    if (isNaN(tm)) {
                        tm = 0
                    }
                    var nm = vAlue.split(",")[1];
                    if (!nm) {
                        nm = props[nAme]
                    }
                    SrcData[props[nAme]] = [tm, nm];
                    break;
                case    "TIME":
                    /**
                     * カット尺
                     * @type {*}
                     */
                    var tm = nas.FCT2Frm(vAlue,SrcData.framerate.rate);
                    if (isNaN(tm)) {
                        tm = 0
                    }
                    SrcData[props[nAme]] = tm;
                    break;
                  /**
                   *  user_info
                   *   ユーザ関連情報はオブジェクトに置き換え
                   */
                  case  "CREATE_USER":
                  case  "UPDATE_USER":
                   SrcData[props[nAme]] = new nas.UserInfo(vAlue);
                    break;
                    /**
                     * 管理情報シングルステージドキュメントの際のみ処理
                     *
                     */
                case   "Line":;
                   SrcData[props[nAme]] = (vAlue)?
                       new XpsLine(vAlue):new XpsLine("0:"+nas.pmdb.pmTemplates.members[0].line);
                  break;
                case   "Stage":;
                   SrcData[props[nAme]] = (vAlue)?
                       new XpsStage(vAlue):new XpsStage("0:"+nas.pmdb.pmTemplates.members[0].stages.members[0]);
                  break;
                case   "Job":;
                   SrcData[props[nAme]] = (vAlue)?
                       new XpsStage(vAlue):new XpsStage("0:"+nas.Pm.jobNames[0]);
                  break;
                  /**
                   *   ステータス関連
                   *    指名情報及び申し送りはステータスのサブプロパティとして扱う
                   *    ステータスがない場合は無視する
                   */
                case   "CurrentStatus":;
                   SrcData.currentStatus = new JobStatus(vAlue);
                  break;
                case   "JobAssign":;
                   if(SrcData.currentStatus) SrcData.currentStatus.assign = vAlue;
                  break;
                case   "Message":;
                               //messageは複数行にわたるので読み出しルーチンが必要
                   if(SrcData.currentStatus) SrcData.currentStatus.message = vAlue;
                                //申し送りメッセージ取得フラグを立てて次のループに入る
                     readMessage=true;continue;
                  break;
                case    "additionalData":;
                    console.log(vAlue);
                break;
                default:
                    /**
                     * 時間関連以外
                     * @type {string|*}
                     */
                    SrcData[props[nAme]] = vAlue;
                /**
                 * 判定した値をプロパティで控える
                 */
            }
        }
        /**
         * タイムラインプロパティまたは終了識別にマッチ
         */
        if (SrcData[line].match(/^\[(([a-zA-Z]+)\t?.*)\]$/)) {
            /**
             * シート終わっていたらメモを取り込んで終了
             */
            if (SrcData[line].match(/\[END\]/)) {
                /**
                 * シートボディ終了ライン控え
                 */
                SrcData.layerBodyEnd = line;
                SrcData["memo"] = '';
                for (li = line + 1; li < SrcData.length; li++) {
                    SrcData["memo"] += SrcData[li];
                    if ((li + 1) < SrcData.length) {
                        SrcData["memo"] += "\n"
                    }
                    /**
                     *  最終行以外は改行を追加
                     */
                }

                break;
            } else {
                /**
                 * 各レイヤの情報を取得
                 * レイヤヘッダの開始行を記録
                 */
                if (SrcData.layerHeader == 0) {
                    SrcData.layerHeader = line
                }
                /**
                 * ロットを記録(最大の行を採る)
                 * @type {number}
                 */
                var trackCount =
                    SrcData[line].split("\t").length - 1;
                SrcData.trackCount =
                    (SrcData.trackCount < trackCount) ?
                        trackCount : SrcData.trackCount;
                /**
                 * エントリ数を記録
                 */
                SrcData.layerProps++;
            }
        } else {
            /**
             * シートデータ本体の行数を加算
             */
            if (!SrcData[line].match(/^\#.*$/)) {
                SrcData.frameCount++;	//読み取りフレーム数
            }
        }
    }
    /*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
    /**
     * 第二パス終了・読み取った情報でXPSオブジェクトを再初期化(共通)
     * @type {number}
     */
    SrcData.duration =
        Math.ceil(SrcData.time + (SrcData.trin[0] + SrcData.trout[0]) / 2);
    /**
     * トランシット時間の処理は要再考。現状は切り上げ
     * @type {number}
     */
    var SheetDuration = (SrcData.duration > (SrcData.frameCount - 1)) ?
        SrcData.duration : (SrcData.frameCount - 1);//大きいほうで

//	///////////////////////
//if(dbg) dbgPut("count/duration:"+SrcData.layerCount+":"+SheetDuration);

    this.init(SrcData.trackCount-2, SheetDuration,SrcData.framerate);//再初期化

    /**
     * 第二パスで読み取ったプロパティをXPSに転記
     * タイム以外はそのまま転記
     */
    for (id = 0; id < propNames.length; id++) {
        prpName = propNames[id];
        if (SrcData[prpName] && prpName != "time") {
            this[prpName] = SrcData[prpName];
        }
    }

    /**
     * 読み取りデータを調べて得たキーメソッドとブランク位置を転記
     */
    for (var lyr = 0; lyr < SrcData.layers.length; lyr++) {
        this.xpsTracks[lyr].blmtd = SrcData.layers[lyr].blmtd;
        this.xpsTracks[lyr].blpos = SrcData.layers[lyr].blpos;
        this.xpsTracks[lyr].lot = SrcData.layers[lyr].lot;
    }

    if (SrcData["memo"]) this.xpsTracks.noteText = SrcData["memo"];//memoがあれば転記


    /**
     * 各エントリのトラックプロパティとシート本体情報を取得(第三パス)
     * @type {number}
     */
    var frame_id = 0;//読み取りフレーム初期化

    for (line = SrcData.layerHeader; line < SrcData.layerBodyEnd; line++) {
        /**
         * 角括弧で開始するデータはタイムライントラックプロパティ
         */
        if (SrcData[line].match(/^\[(([a-zA-Z]+)\t.*)\]$/)) {
            var layerProps = RegExp.$1.split("\t");
            var layerPropName = RegExp.$2;
            /**
             * "CELL"のみシート表記とプロパティ名が一致していないので置換 一致が少ない場合はテーブルが必要になる
             */
            if (layerPropName == "CELL") {
                layerPropName = "id";//cahanged "name" to "id" 20160818
            }
            /**
             *  レイヤプロパティが空白の場合があるので適切なデータで置き換える?
             *  読み込みで例外処理を作るべきか？
             */
            for (c = 0; c < SrcData.trackCount; c++) {
            	if(layerProps[c + 1]==""){
            		if (layerPropName=="option"){
            			layerProps[c + 1]=(c==0)?"dialog":"comment";
            		}
            	}
            	
//                this["layers"][c][layerPropName] = layerProps[c + 1]
                this.xpsTracks[c][layerPropName] = layerProps[c + 1]
            }
        } else {
            /**
             * ほかコメント以外はすべてシートデータ
             */
            if (!SrcData[line].match(/^\#.*$/)) {
                myLineAry = (SrcData[line].match(/\t/)) ? SrcData[line].split("\t") : SrcData[line].replace(/[\;\:\,]/g, "\t").split("\t");
                for (col = 1; col <= (SrcData.trackCount); col++) {
                    /**
                     * シート本体データの取得
                     */
                    this.xpsTracks[col - 1][frame_id] =
                        (myLineAry[col] != undefined) ?
                            myLineAry[col].replace(/(^\s*|\s*$)/, "") : "";
                }
                frame_id++;
            }
        }
    }


    /**
     * 読み取ったデータを検査する(データ検査は別のメソッドにしろ!??)
     * マップファイルは、現在サポート無し
     * サポート開始時期未定
     * この情報は、他の情報以前に判定して、マップオブジェクトの生成が必要。
     * マップ未設定状態では、代用マップを作成して使用。
     * 代用マップは、デフォルトで存在。
     * 現在は、代用MAPオブジェクトを先行して作成してあるが、
     * 本来のマップが確定するのはこのタイミングなので、注意!
     */
    if (false) {
        /**
         * MAPPING_FILE=(no file)//値は未設定時の予約値?nullで初期化すべきか?
         */
        if (!this.mapfile) this.mapfile = '(no file)';

        /**
         * マップファイルが未設定ならば、代用マップを使用
         * この判定はあまりに雑なので後でなんとかすれ
         */
        if (false) {
            if (this.mapfile == '(no file)') {
                MapObj = MAP;	//とりあえず既存のダミーマップを代入しておく。
            }
        }
        /**
         * マップファイルを読み込んでマップオブジェクトを初期化
         * そのうちね、今はまだない
         */

        /**
         * 日付関連
         * 制作日付と制作者が無い場合は、空白で初期化?無視したほうが良いかも
         */
//CREATE_USER=''
//CREATE_TIME=''
        if (!this.create_time) this.create_time = '';
        if (!this.create_user) this.create_user = '';
        /**
         * 最終更新日付と最終更新者が無い場合は、空白で初期化?
         * (これは、どのみち保存時に現在のデータで上書き)
         */
//UPDATE_USER=''
//UPDATE_TIME=''
        if (!this.update_time) this.update_time = '';
        if (!this.update_user) this.update_user = '';
//FRAME_RATE=24//
        /**
         * フレームレート読み取れてなければ、現在の値で初期化(組み込み注意)
         */
        if (!this.framerate) {
            this.framerate = nas.FRATE;
        } else {
            nas.FRATE = this.framerate;
        }
        /**
         * トランシット展開しておく
         * TRIN=(時間文字列),(トランシット種別)
         */
        if (!this.trin) {
            this.trin = [0, "trin"]
        } else {
            time = nas.FCT2Frm(this.trin[0]);
            if (isNaN(time)) {
                time = 0
            }
            name = (this.trin[1]) ? this.trin[1] : "trin";
            this.trin = [time, name];
        }
        /**
         * TROUT=(時間文字列),(トランシット種別)
         */
        if (!this.trout) {
            this.trout = [0, "trout"];
        } else {
            time = nas.FCT2Frm(this.trout[0]);
            if (isNaN(time)) {
                time = 0
            }
            name = (this.trout[1]) ? this.trout[1] : "trout";
            this.trout = [time, name];
        }
        /**
         * TIMEも一応取り込んでおく。
         * 実際のデータの継続時間とこの情報の「長いほう」を採る
         * TIME=(時間文字列)
         *            this.time=nas.FCT2Frm(this.time);
         *            if(isNaN(this.time)){this.time=0*} 
         * 作品データ
         * 情報が無い場合は、空白で初期化。マップをみるようになったら。
         * マップの情報を参照
         * 最終作業情報(クッキー)を参照
         * ユーザ設定によるデフォルトを参照 などから選択
         */

        /**
         * TITLE=(未設定とかのほうが良いかも)
         */
        if (!this.title) this.title = '';
        /**
         * SUB_TITLE=(未設定とかのほうが良いかも)
         */
        if (!this.subtitle) this.subtitle = '';
        /**
         * OPUS=()
         */
        if (!this.opus) this.opus = '';
        /**
         * SCENE=()
         */
        if (!this.scene) this.scene = '';
        /**
         * CUT=()
         */
        if (!this.cut) this.cut = '';

        /**
         * シーン?・カット番号は最終状態でもデフォルトは空白に。紛らわしいから。
         */

    }
    if (xUI.errorCode) {
        alert("error :" + localize(xUI.errorMsg[xUI.errorCode]));
//	xUI.errorCode=0;
    }
//console.log(this.toString());
//   仮設　ｘMap初期化　2018.12
if (! (this.xMap.currentJob)) this.xMap.syncProperties(this); 
    return this;
};

/**
 * 書きだしメソッド
 * @returns {string}
 */
Xps.prototype.toString = function () {
    var Now = new Date();
    /**
     * セパレータ文字列調整
     * @type {string}
     */
    var bold_sep = '\n#';
    for (n = this.xpsTracks.length ; n > 0; n--) bold_sep += '========';
    var thin_sep = '\n#';
    for (n = this.xpsTracks.length ; n > 0; n--) thin_sep += '--------';
    /**
     * ヘッダで初期化
     * @type {string}
     */
//    var result = 'nasTIME-SHEET 0.4';//出力変数初期化(旧バージョン)
    var result = 'nasTIME-SHEET 0.5';//出力変数初期化
    /**
     * 共通プロパティ変数設定
     * @type {string}
     */
    result += '\n##MAPPING_FILE=' + this.mapfile;
    result += '\n##TITLE=' + this.title;
    result += '\n##SUB_TITLE=' + this.subtitle;
    result += '\n##OPUS=' + this.opus;
    result += '\n##SCENE=' + this.scene;
    result += '\n##CUT=' + this.cut;
    result += '\n##TIME=' + nas.Frm2FCT(this.time(), 3, 0, this.framerate);
    result += '\n##TRIN=' + nas.Frm2FCT(this.trin[0], 3, 0, this.framerate ) + "," + this.trin[1];
    result += '\n##TROUT=' + nas.Frm2FCT(this.trout[0], 3, 0, this.framerate) + "," + this.trout[1];
    result += '\n##CREATE_USER=' + this.create_user;
    result += '\n##UPDATE_USER=' + this.update_user;
    result += '\n##CREATE_TIME=' + this.create_time;
    result += '\n##UPDATE_TIME=' + Now.toNASString();
    result += '\n##FRAME_RATE=' + this.framerate.toString();
    result += '\n##Line='+this.line.toString();
    result += '\n##Stage='+this.stage.toString();
    result += '\n##Job='+this.job.toString();
    result += '\n##CurrentStatus='+this.currentStatus.toString();
if((this.currentStatus.assign)&&(this.currentStatus.assign.length))
    result += '\n##JobAssign='+this.currentStatus.assign;
if((this.currentStatus.message)&&(this.currentStatus.message.length))
    result += '\n##Message='+this.currentStatus.message;
//result+='\n##FOCUS='	+11//
//result+='\n##SPIN='	+S3//
//result+='\n##BLANK_SWITCH='	+File//
    result += '\n#';
    result += bold_sep;//セパレータ####################################
    /**
     * レイヤ別プロパティをストリームに追加
     * @type {string[]}
     */
    var Lprops = ["sizeX", "sizeY", "aspect", "lot", "blmtd", "blpos", "option", "link", "tag", "id"];
//	var Lprops=["sizeX","sizeY","aspect","lot","blmtd","blpos","option","link","CELL"];
    for (var prop = 0; prop < Lprops.length; prop++) {
        var propName = Lprops[prop];
        var lineHeader = (propName == "id") ?
            '\n[CELL' : '\n[' + propName;
        result += lineHeader;
        for (id = 0; id < this.xpsTracks.length; id++) {
            result += "\t" + this.xpsTracks[id][propName];
        }
        result += ']';//
    }
    /**
     * セパレータ
     * @type {string}
     */
    result += bold_sep;//セパレータ####################################
    /**
     * シートボディ
     */
    for (line = 0; line < this.duration(); line++) {
        result += '\n.';//改行＋ラインヘッダ
        for (column = 0; column < (this.xpsTracks.length); column++) {
            address = column + '_' + line;
//			if(! Separator){}else{};

            result += '\t' + this.xpsTracks[column][line];
//				result+=Separator+this.xpsTracks[column][line];

        }
        /**
         * 1/4秒おきにサブセパレータ/秒セパレータを出力
         */
        if ((line + 1) % Math.round(this.framerate / 4) == 0) {
            if ((line + 1) % Math.round(this.framerate) == 0) {
                result += bold_sep;
            } else {
                result += thin_sep;
            }
        }
    }
    /**
     * ボディ終了セパレータ
     * @type {string}
     */
    result += bold_sep;//セパレータ####################################
    /**
     * ENDマーク
     * @type {string}
     */
    result += '\n[END]\n';
    /**
     * メモ
     * @type {string|*}
     */
//    result += this.memo;
    result += this.xpsTracks.noteText;

    /**
     *  返す(とりあえず)
     */

    /**
     * 引数を認識していくつかの形式で返すように拡張予定
     * セパレータを空白に変換したものは必要
     * 変更前(開始時点)のバックアップを返すモード必要/ゼロスクラッチの場合は、カラシートを返す。
     */
    if (xUI.errorCode) {
        xUI.errorCode = 0
    }
    return result;
};

/**
 * Xps.isSame(targetXps)
 * 引数    比較するXpsオブジェクト
 * シート内容比較メソッド 相互の値が同じか否か比較する関数
 * ユーザ名・時間等は比較しないでシート内容のみ比較する
 * コメント類は連続する空白をひとつにまとめて比較する
 * フレームレートを比較するオプションのデフォルト値はfalse
 * @param targetXps
 * @param compareFramerate bool
 * @returns {boolean}
 */
Xps.prototype.isSame = function (targetXps,compareFramerate) {
    if(typeof compareFramerate == 'undefined') compareFramerate = false;

    if( (compareFramerate) &&
        ((this.framarate.rate != targetXps.framerate.rate) ||
         (this.framarate.opt != targetXps.framerate.opt))
    ){ return false }
    var rejectRegEx = new RegExp("framerate|errorCode|errorMsg|mapfile|create_time|create_user|update_time|update_user|layers|xpsTracks|memo|line|stage|job|currentStatus|JobAssign|Message");
    /**
     * プロパティリスト
     */
//    errorCode, errorMsg, mapfile, opus, title, subtitle, scene, cut, trin, trout, framerate, create_time, create_user, update_time, update_user, layers, memo, xpsTracks, mkStage, getInfo, guessLink, init, getMap, duration, time, getTC, readIN, toString, mkAEKey;
/**
    フレームレートを比較するオプションのデフォルト値はfalse
*/
    for (var myProp in this) {
        if ((myProp.match(rejectRegEx)) || (this[myProp] instanceof Function)) {
            continue
        }
        /**
         *  ここでは比較しないものをリジェクト
         */
        if ((this[myProp] instanceof Array)) {
            continue
        }
        /**
         * 配列プロパティをスキップしているので注意後で配列比較を書く
         */
        if ((this[myProp] == targetXps[myProp])) {
            continue
        }
        /**
         * プロパティがあれば比較してマッチしていればスキップ(targetXps[myProp])&&
         */
//		return [this[myProp],targetXps[myProp]].join(" != ");//抜けたデータがあればNG判定で終了
        return false;//
    }
//opus,title,subtitle,scene,cut,trin,trout,framerate,
//nas.otome.writeConsole(this.xpsTracks.length);

    if (this.xpsTracks.length != targetXps.xpsTracks.length) {
        return false
    }

    /**
     * TimelineTracksのサブプロパティ比較
     */
    for (var lIdx = 0; lIdx < this.xpsTracks.length; lIdx++) {
        for (var myProp in this.xpsTracks[lIdx]) {
            if ((this.xpsTracks[lIdx][myProp] == targetXps.xpsTracks[lIdx][myProp])) {
                continue
            }
            //(targetXps.layers[lIdx][myProp])&&
            return false;
        }
    }

    /**
     * メモ比較
     */
    if (this.xpsTracks.noteText.replace(/¥s+/g, " ").replace(/¥n/g, "") != targetXps.xpsTracks.noteText.replace(/¥s+/g, " ").replace(/¥n/g, "")) {
        return false
    }
    /**
     * ボディ比較
     */
    if (this.xpsTracks.length != targetXps.xpsTracks.length) {
        return false
    }
    if (this.xpsTracks[0].length != targetXps.xpsTracks[0].length) {
        return false
    }
    for (var L = 0; L < this.xpsTracks.length; L++) {
        for (var F = 0; F < this.xpsTracks[0].length; F++) {
            if (this.xpsTracks[L][F] == targetXps.xpsTracks[L][F]) {
                continue
            }
            return false;
        }
    }
    /**
     * 比較順序は後で見直しが必要多分
     */
    return true;
};
/**
    グループ記述の有る文字列を分解して要素名とグループ名を分離するXpsクラスメソッド
    引数の文字列を評価してそのラベルとエントリ文字列に分解して返す
    Reaplacmentトラック用

引数:セルエントリ文字列
戻値:配列[エントリ文字列,グループラベル]

グループラベルが存在しない文字列の戻値は要素数１の配列
 */
Xps.sliceReplacementLabel = function (myStr){
    if(myStr.match(/^(.+)[\s\-_]([^\s\-_].*)$/)){
        myLabel = RegExp.$1;
        myName  = RegExp.$2;
    } else
    if (myStr.match(/^([A-Z])(\(?.+\)?|\[?.+\]?|<?.+>?)$/)){
        myLabel = RegExp.$1;
        myName  = RegExp.$2;
    } else {
        return [myStr];
    }
    return [myName,myLabel];
}
// test
/*
   var myResult="";
   var testStrings=[
    "123","A123","A(123)","A<_=123>","A[123x]","A下-123","A--(123x)",A[◯]
   ];
    for(var idx=0;idx<testStrings.length;idx++){
        myResult += testStrings[idx]+" : "+Xps.sliceReplacementLabel(testStrings[idx])+"\n";
    }
//if(dbg) console.log(myResult);
*/
/**
     Xpsオブジェクトから識別子を作成するクラスメソッド
     名前を変更するか又はオブジェクトメソッドに統合
     このメソッドは同名別機能のオブジェクトメソッドが存在するので厳重注意
     クラスメソッドはURIencodingを行い、オブジェクトメソッドは'%'エスケープを行う

*** 識別子のフレームレート拡張（予定）
    (括弧)でくくられた時間情報は、カット尺であり素材継続時間ではない。
    フレームレートを追加情報として補うことが可能とする
    その際は以下のルールに従う
    (FCT/FPS)
    単独のカットに対して設定されたフレームレートは、そのカットのみで有効
    基本的には、タイトルのプロパティからフレームレートを取得してそれを適用する。
    識別子には、基本的にフレームレートを含める必要性はない。
    タイトルのフレームレートと異なる場合のみ、識別子にフレームレートを埋め込む。

    このコーディングは、pmdb実装後に行われる。2018.07.16

引数  opt
"title"#"opus"//"s-c"("time")//"line"//"stage"//"job"//"status"
'episode'(or 'product')//'cut'//'statsu'

デフォルトでは制作管理情報が付加されたフルフォーマットの識別子が戻る

*/

Xps.getIdentifier=function(myXps,opt){
//この識別子作成は実験コードです2016.11.14
    if(typeof opt=='undefined') opt ='status';
    var myIdentifier=[
            encodeURIComponent(myXps.title)+
        "#"+encodeURIComponent(myXps.opus)+
        ((String(myXps.subtitle).length > 0)? "["+encodeURIComponent(myXps.subtitle)+"]":''),
            encodeURIComponent(
                "s" + ((myXps.scene)? myXps.scene : "-" )+
                "c" + myXps.cut) +
                "(" + myXps.time() +")",
            encodeURIComponent(myXps.line.toString(true)),
            encodeURIComponent(myXps.stage.toString(true)),
            encodeURIComponent(myXps.job.toString(true)),
            myXps.currentStatus.toString(true)
        ];
    var order = 2;     
    switch(opt){
    case 'title':
    case 'opus':
    case 'episode':
    case 'product':
        order = 1;break;
    case 'cut':
        order = 2;break;
    case 'line':
        order = 3;break;
    case 'stage':
        order = 4;break;
    case 'job':
        order = 5;break;
    case 'status':
    case 'full':
    default:
        order = 6;break;
    }
//識別子をネットワークリポジトリに送信後正常に追加・更新ができた場合は（コールバックで）ローカルリストの更新を行うこと
    return myIdentifier.slice(0,order).join("//");;
}


/*
    仮の比較関数
    SCiオブジェクトに統合予定
    一致推測は未実装
    戻値:数値  -2   :no match
               -1   :title match
                0   :product match
                1   :product + cut match
                2   :line match
                3   :stage match
                4   :job match
                5   :status match

ステータス情報のうちassign/messageの比較は行わないステータス自体の比較もほぼ利用されないので省略を検討
*/
Xps.compareIdentifier =function (target,destination){
    var tgtInfo  = Xps.parseIdentifier(target);
    var destInfo = Xps.parseIdentifier(destination);
    //title
        if(tgtInfo.title != destInfo.title) { return -2;}
    //title+opus
        if( tgtInfo.opus != destInfo.opus ) { return -1;}
    //Scene,Cut
        tgtSC = tgtInfo.cut;
        dstSC = destInfo.cut;
        if((! tgtSC)||(! dstSC)) return 0;
        if(tgtSC != dstSC){return 0;}
        var result = 1;
    //version status
        if (((tgtInfo.line)&&(destInfo.line))&&(tgtInfo.line.id.join() == destInfo.line.id.join() )){
            result = 2;}else{return result;}
        if (((tgtInfo.stage)&&(destInfo.stage))&&(tgtInfo.stage.id == destInfo.stage.id )){
            result = 3;}else{return result;}
        if (((tgtInfo.job)&&(destInfo.job))&&(tgtInfo.job.id  == destInfo.job.id )){
            result = 4;}else{return result;}
        if ((tgtInfo.currentStatus)&&(destInfo.currentStatus)&&(tgtInfo.currentStatus.content == destInfo.currentStatus.content)) result = 5;
        return result;
}
/*  TEST
var A =[
    "うなぎ",0,"ニョロ",
    "","12","2+0",
    "0:(本線)","1:原画","2:演出チェック","Startup:kiyo@nekomataya.info:TEST"
    ];
var B =[
    "うなぎ",0,"ニョロ",
    "","12","2+0",
    "0:(本線)","1:原画","2:演出チェック","Startup"
    ];
Xps.compareIdentifier("35%E5%B0%8F%E9%9A%8A_PC#RBE//04d",'35%E5%B0%8F%E9%9A%8A_PC#RBE[ベルセルク・エンチャント演出]')
//console.log(Xps.compareIdentifier(Xps.stringifyIdf(A),Xps.stringifyIdf(B)))
*/
/**
    識別子をパースする関数
    SCiオブジェクトで戻す？
    Identifier の持ちうる情報は以下

    title
        .name
    opus
        .name
        .subtitle
    [sci]
        .name
        .times
    
    [issues]
        Line
            .id
            .name
        Stage
            .id
            .name
        Job
            .id
            .name
    status
        JobStatus
            .content
            .assign
            .message
*/
/**
    プロダクト識別子をパースして返す
    サブタイトルは一致比較時に比較対象から外す
    引数がまたは第一要素がカラの場合はfalse
*/
Xps.parseProduct = function(productString){
    var dataArray = String(productString).replace( /[\[\]]/g ,'#').split('#');
//     if((dataArray.length==0)||(String(dataArray[0]).length==0)){ return false};
    return {
        title     :   ((typeof dataArray[0]=='undfined')||(String(dataArray[0])=='undefined'))? "":decodeURIComponent(dataArray[0]),
        opus      :   ((typeof dataArray[1]=='undfined')||(String(dataArray[1])=='undefined'))? "":decodeURIComponent(dataArray[1]),
        subtitle  :   ((typeof dataArray[2]=='undfined')||(String(dataArray[2])=='undefined'))? "":decodeURIComponent(dataArray[2])
    };
}
/** test
//if(dbg) console.log (Xps.parseProduct('%E3%82%BF%E3%82%A4%E3%83%88%E3%83%AB%E6%9C%AA%E5%AE%9A#%E7%AC%AC%20%20%E8%A9%B1'));
*/
/**
    sci識別子をパースして返す
    識別子に付属する時間情報はトランジション／継続時間ではなくカット尺のみ
    補助情報は持たせない。かつ対比時に比較対象とならないものとする
    カット番号情報は、ここではscene-cutの分離を行わない
    比較の必要がある場合に始めて比較を行う方針でコーディングする
    sciString末尾の（括弧内）は時間情報部分
    (括弧)による記述が2つ以上ある場合は最初の開き括弧の前がカット識別子で、時間情報は最後の（括弧）内の情報を用いる
    
    書式は(TC//framareteString) or (TC) フレームレートの指定のない場合はデフォルトの値で補われる
    (1+12),(1+12//24FPS),(1:12//30),(01:12//30DF),(00:00:01:12//59.94)等
    デフォルト値は、タイトルから取得
    sciStringに時間情報が含まれないケースあり
    time指定の存在しない識別子の場合"6:0"を補う

    引数が与えられない場合は''とする
*/
Xps.parseSCi = function(sciString){
    if(typeof sciString == 'undefined') sciString = '';
    var dataArray = String(sciString).split('/');
//    if((dataArray.length==0)||(String(dataArray[0]).length==0)){return false};
    var result = [];
    for (var ix=0;ix < dataArray.length ;ix ++){
        var currentEntry=dataArray[ix].split('(');
        result.push({
        'cut'   :   decodeURIComponent(currentEntry[0]),
        'time'  :   (currentEntry.length ==1 )? "6:0":decodeURIComponent(currentEntry[currentEntry.length-1]).replace(/[\(\)]/g,'')
        });
    }
    return result;
}
/** test
    console.log (Xps.parseSCi('s-cC%23%20(16)/s-c96(13)'));
    console.log (Xps.parseSCi('s-cC%23%20(16)(18)'));
*/
/**
セル記述を整形して比較評価用に正規化された文字列を返すクラスメソッド
戻り値は、<グループ名>-<セル番号>[-<ポストフィックス>]

A_(001)_ovl  A-1-ovl
*/
Xps.normalizeCell = function(myString){
    return nas.normalizeStr(myString.replace( /[-_ー＿\s]/g ,"-")).replace( /([^\d.])0+/g ,"$1");
}
//test
//Xps.normalizeCell("A_００１２ー上");
//Xps.normalizeCell("");
//Xps.normalizeCell("");
//Xps.normalizeCell("");
//Xps.normalizeCell("");
//Xps.normalizeCell("");
//Xps.normalizeCell("");
/**
SCiデータ上のカット名をセパレータで分離するクラスメソッド
この場合のカット名には時間情報・ステータス等を含まないものとする
パースされたカット名は、カット、シーンの順の配列で戻す有効最大２要素

    [cut,scene,<void>,~];//第三要素以降は分離しても使用されないことに注意
    [cut,scene]
    [cut]

要素数が識別子に含まれる情報の深度を示す
*/
Xps.parseCutIF = function(myIdentifier){
    var result = String(myIdentifier).replace(/[\ _\-]+/g,"_").split("_").reverse();
    for (var ix=0;ix<result.length;ix++){
        if(ix==0){result[ix]=result[ix].replace(/^[CcＣｃ]/,"");};//cut
        if(ix==1){result[ix]=result[ix].replace(/^[SsＳｓ]/,"");};//scene
//        if(ix==2){result[ix]=result[ix].replace(/^[OoＯｏ#＃]/,"");};//opus
        result[ix]=result[ix].replace(/^[#＃№]|^(No.)/,"");//ナンバーサインを削除
    };
    return result;
}
//test
//if(dbg) console.log(Xps.parseCutIF("00123#31[124]__s-c123"));
//
/**
パース済みのカット識別子を比較してマッチ情報を返す
シーンカットともに一致した場合のみtrueそれ以外は false
引数に秒表記部が含まれないよう調整が必要
*/
Xps.compareCutIdf=function(tgt,dst){
    if(tgt.match(/\(.+\)/)){tgt = Xps.parseSCi(tgt)[0].cut};
    if(dst.match(/\(.+\)/)){dst = Xps.parseSCi(dst)[0].cut};
    var tgtArray = Xps.parseCutIF("-"+tgt);
    var dstArray = Xps.parseCutIF("-"+dst);
    if (
    (((tgtArray[1]=="")&&(dstArray[1]==""))||
    (nas.RZf(nas.normalizeStr(tgtArray[1]),12)==nas.RZf(nas.normalizeStr(dstArray[1]),12)))&&
    (nas.RZf(nas.normalizeStr(tgtArray[0]),12)==nas.RZf(nas.normalizeStr(dstArray[0]),12))
    ) return true ;
    return false ;
}
/*TEST
Xps.compareCutIdf("C12","s-c012");
Xps.compareCutIdf("0012","title_opus_s-c012");
Xps.compareCutIdf("C００１２","s-c012");
Xps.compareCutIdf("S#1-32","s01-c0３２");
*/

/**
    配列指定で識別子をビルドするテスト用関数
引数: [title,opus,subtitle,scene,cut,time,line,stage,job,status]
*/
Xps.stringifyIdf = function(myData){
//myDataはlength==10の配列であること
//この識別子作成は実験コードです2016.11.14
    var myIdentifier=[
            encodeURIComponent(String(myData[0]))+
        "#"+encodeURIComponent(String(myData[1]))+
        ((String(myData[2]).length > 0)? "["+encodeURIComponent(myData[2])+"]":''),
            encodeURIComponent(
                "s" + ((myData[3])? myData[3] : "-" )+
                "c" + myData[4]) +
                "(" + myData[5] +")",
            encodeURIComponent(myData[6]),
            encodeURIComponent(myData[7]),
            encodeURIComponent(myData[8]),
            myData[9]
    ].join("//");
    return myIdentifier;
}
//TEST
/*
Xps.stringifyIdf([
    "たぬき",
    "12",
    "ポンポコリン",
    "",
    123,
    "1+12",
    "0:(本線)",
    "1:原画",
    "2:演出チェック",
    "Startup:kiyo@nekomataya.info"
]);
*/
/**
     データ識別子をパースして無名オブジェクトで戻す
     データ判定を兼ねる
     分割要素がカット番号を含まない（データ識別子でない）場合はfalseを戻す
     SCi/listEntryオブジェクトとの兼ね合いを要調整20170104
     
     asign/
     オブジェクトメソッドの識別子も解釈可能にする
    
    '//（二連スラッシュ）'を認識できなかったケースに限り'__（二連アンダーバー）'をセパレータとして認識するように変更
    **"_(アンダーバー単独)"はセパレータ以外で使用するケースがあるため要注意
*/
Xps.parseIdentifier = function(myIdentifier){
    if(! myIdentifier) return false;
    if(myIdentifier.indexOf( '//' )<0 ){ myIdentifier=myIdentifier.replace(/__/g,'//'); }
    var dataArray = myIdentifier.split('//');
    var result={};
    result.product  = Xps.parseProduct(dataArray[0]);
    result.sci      = Xps.parseSCi(dataArray[1]);
    result.title    = result.product.title;
    result.opus     = result.product.opus;
    result.subtitle = result.product.subtitle;
    var sep = Xps.parseCutIF(result.sci[0].cut);
    result.scene    = (sep.length > 1)? sep[1]:'';
    result.cut      = sep[0];
    result.time     = result.sci[0].time;
    if(dataArray.length == 6){
        result.line     = new XpsLine(decodeURIComponent(dataArray[2]));
        result.stage    = new XpsStage(decodeURIComponent(dataArray[3]));
        result.job      = new XpsStage(decodeURIComponent(dataArray[4]));
        result.currentStatus   = new JobStatus(dataArray[5]);
        //ステータスはデコード不用(オブジェクト自体がデコードする)
    }
    /*ここでは初期化しないundefined で戻す
    {
        result.line     = new XpsLine(nas.pm.pmTemplate[0].line);
        result.stage    = new XpsStage(nas.pm.pmTemplate[0].stages[0]);
        result.job      = new XpsStage(nas.pm.jobNames.getTemplate(nas.pm.pmTemplate[0].stages[0],"init")[0]);
        result.currentStatus   = "Startup";        
    }*/
//if(dbg) console.log(result);
    return result;
}
/** test 
//if(dbg) console.log(Xps.parseIdentifier('%E3%81%8B%E3%81%A1%E3%81%8B%E3%81%A1%E5%B1%B1Max#%E3%81%8A%E3%81%9F%E3%82%81%E3%81%97//s-c10(72)//0%3A(%E6%9C%AC%E7%B7%9A)//0%3Alayout//0%3Ainit//Startup'));
*/
/** =====================================機能分割 20130221
 * レイヤストリームを正規化する
 * 内部処理用
 * レイヤのデータ並びと同じ要素数の有効データで埋まった配列を返す
 *
 * キー作成に必要な機能だが、汎用性があるので分離してXpsのメソッドに
 * キー作成はXPSのメソッドとして独立させる
 * 中間値補間サインはオプションでその挙動を制御する？
 *
 * タイムラインの種別によってデータが変化するのでその仕組みを組み込む
 * 正規化されたストリーム形成は、同時にセクションの解析でもあるので、
 * このルーチンに組み込むか否か判断が必要
 *
 * 取扱タイムライン種別が"timing"限定でなくなるので、他種別の処置を設定
 * 引数の種別を最初に判定する
 * 引数範囲をシフトする
 *
 * 以下の正規化ストリーム取得関数はセクションが実装されたら不要
 
 2016 08 の改修でセクションオブジェクトを実装するので
 （少なくともタイミング向けに実装）この正規化メソッドの修正はしない
 *
 * @param layer_id
 * @returns {Array}
 */
Xps.prototype.getNormarizedStream = function (layer_id) {
    var layerDataArray = this.xpsTracks[layer_id + 1];
    layerDataArray.label = (layer_id < 0) ? "N" : this.xpsTracks[layer_id].id;
    if (layer_id < 0) {
        var blank_pos = "end";
        var key_max_lot = 0;
    } else {
        var blank_pos = this.xpsTracks[layer_id].blpos;
        var key_max_lot = (isNaN(this.xpsTracks[layer_id].lot)) ?
            0 : this.xpsTracks[layer_id].lot;
    }
    /**
     * ブランク処理フラグ
     * @type {boolean}
     */
    var bflag = (blank_pos) ? false : true;
    /**
     * レイヤロット変数の初期化
     * @type {number}
     */
    var layer_max_lot = 0;
    /**
     * シートのタイムラインからフルフレーム有効データの配列を作る
     * 全フレーム分のバッファ配列を作る
     * @type {Array}
     */
    var bufDataArray = new Array(layerDataArray.length);
    /**
     * 第一フレーム評価・エントリが無効な場合空フレームを設定
     * @type {*}
     */
    var currentValue = dataCheck(layerDataArray[0], layerDataArray.label, bflag);
    if (currentValue == "interp") currentValue = false;
    bufDataArray[0] = (currentValue) ? currentValue : "blank";

    /**
     * 2>>ラストフレーム ループ
     */
    for (f = 1; f < layerDataArray.length; f++) {
        /**
         * 有効データを判定して無効データエントリを直前のコピーで埋める
         * @type {*}
         */
        currentValue = dataCheck(layerDataArray[f], layerDataArray.label, bflag);
        if (currentValue == "interp") currentValue = false;//キー変換 && timing 限定
        bufDataArray[f] = (currentValue) ? currentValue : bufDataArray[f - 1];

        if ((bufDataArray[f] != "blank") && (bufDataArray[f] != "interp")) {
            layer_max_lot = (layer_max_lot > bufDataArray[f]) ?
                layer_max_lot : bufDataArray[f];
        }
    }
    max_lot = (layer_max_lot > key_max_lot) ?
        layer_max_lot : key_max_lot;
    /**
     * あらかじめ与えられた最大ロット変数と有効データ中の最大の値を比較して
     * 大きいほうをとる
     * ここで、layer_max_lot が 0 であった場合変換すべきデータが無いので処理中断
     *  >全部ブランクであってもリザルトは返すように変更
     */
    if (false) {
        if (layer_max_lot == 0) {
            xUI.errorCode = 4;
            return;
// "変換すべきデータがありません。\n処理を中断します。";
        }
    }

    if (xUI.errorCode) {
        xUI.errorCode = 0
    }
    return bufDataArray;
};


/*
        タイムラインをダイアログパースする
    タイムライントラックのメソッド
    引数なし
    音響開始マーカーのために、本来XPSのプロパティを確認しないといけないが、
    今回は省略
    開始マーカーは省略不可でフレーム０からしか位置できない（＝音響の開始は第１フレームから）
    後から仕様に合わせて再調整
    判定内容は
    /^[-_]{3,4}$/    開始・終了マーカー
    /^\([^\)]+\)$|^<[^>]+>$|^\[[^\]]+\]$/    インラインコメント
    その他は
    ブランク中ならばラベル
    音響Object区間ならばコンテントテキストに積む空白は無視する
    ⇒セリフ中の空白は消失するので、空白で調整をとっている台詞は不可
    オリジナルとの照合が必要な場合は本文中の空白を削除した状態で評価すること
    
    トラックの内容をパースしてセクションコレクションを構築する機能はトラック自身に持たせる
    その際、トラックの種別毎に別のパーサを呼び出すことが必要なのでその調整を行う
    
        タイムライントラックのメソッドにする
        ストリームはトラックの内容を使う
        新規にセクションコレクションを作り、正常な処理終了後に先にあるセクションコレクションを上書きする
        ＊作成中に、同じ内容のセクションはキャッシュとして使用する？
        戻り値はビルドに成功したセクション数(最低で１セクション)
        値として無音区間の音響オブジェクト（値）を作るか又は現状のままfalse(null)等で処理するかは一考
*/
/*
*/
/** //test
XpsTimelineTrack.prototype.parseSoundTrack=_parseSoundTrack;
XPS.xpsTracks[0].parseSoundTrack();
XPS.xpsTracks[0].sections[1].toString();

XpsTimelineTrack.prototype.parseSoundTrack=_parseSoundTrack;
//XpsTimelineTrack.prototype.parseDialogTrack=_sectionTrack;

//XpsTimelineTrack.prototype.parseKeyAnimationTrack=_parsekeyAnimationTrack;
//XpsTimelineTrack.prototype.parseAnimationTrack=_parseAnimationTrack;
XpsTimelineTrack.prototype.parseReplacementTrack=_parseReplacementTrack;

XpsTimelineTrack.prototype.parseCameraWorkTrack=_parseCameraworkTrack;

XpsTimelineTrack.prototype.parseCompositeTrack=_parseCompositeTrack;//コンポジット

//XpsTimelineTrack.prototype.parseTrack=_parseTrack;
//XpsTimelineTrack.prototype.parseTrack=_parseTrack;
*/

/**
 以下は、別ソースでセットアップしたメソッドを導入するテストコード
*/

XpsTimelineTrack.prototype.parseSoundTrack=_parseSoundTrack;
//XpsTimelineTrack.prototype.parseDialogTrack=_parseDialogTrack;

//XpsTimelineTrack.prototype.parseKeyAnimationTrack=_parsekeyAnimationTrack;
//XpsTimelineTrack.prototype.parseAnimationTrack=_parseAnimationTrack;
XpsTimelineTrack.prototype.parseReplacementTrack=_parseReplacementTrack;

XpsTimelineTrack.prototype.parseCameraworkTrack=_parseCameraworkTrack;

XpsTimelineTrack.prototype.parseGeometryTrack=_parseGeometryTrack;
XpsTimelineTrack.prototype.parseCompositeTrack=_parseCompositeTrack;//コンポジット

//XpsTimelineTrack.prototype.parseTrack=_parseTrack;
//XpsTimelineTrack.prototype.parseTrack=_parseTrack;
/**

    タイムラインをパースしてセクション及びその値を求めるxUIのメソッド
    タイムライン種別ごとにパースするオブジェクトが異なるので
    各オブジェクトに特化したパーサが必要
    別々のパーサを作ってセクションパーサから呼び出して使用する
    Sound
        parseSoundTrack
        *parseDialogTrack
    Replacement
        parseKyeDrawind(補間区間あり)
        parseAnimationCell(確定タイムライン)
    Geometry
        parseCameraworkTrack
    Composite
        parseEffectTrack
    各々のパーサは、データ配列を入力としてセクションコレクションを返す
    各コレクションの要素はタイムラインセクションオブジェクト
    値はタイムライン種別ごとに異なるがセクション自体は共通オブジェクトとなる

    セクションパースは、非同期で実行される場合がありそうなので、重複リクエストを排除するためにキュー列を作って運用する必要ありそう
    その場合は、このルーチンがコントロールとなる?1105memo
    もう一つ外側（トラックコレクション又はXps側）に必要かも

*/
XpsTimelineTrack.prototype.parseTimelineTrack = function(){
    var myResult = false;
    var defaultElementGroup = this.xParent.parentXps.xMap.getElementByName(this.id);
    if(! defaultElementGroup) defaultElementGroup=this.xParent.parentXps.xMap.new_xMapElement(this.id,this.option,this.xParent.parentXps.xMap.currentJob);
//    console.log(defaultElementGroup);
    switch(this.option){
        case "dialog":;
//            myResult =  this.parseDialogTrack();
//        break;
        case "sound":;
            myResult =  this.parseSoundTrack();
        break;
        case "camerawork":;
        case "camera":;
        case "geometry":;
            myResult =  this.parseCameraworkTrack();
        break;
        case "effect":;
        case "sfx":;
        case "composit":;
            myResult =  this.parseCompositeTrack();
        break;
        case "cell":;
        case "timing":;
        case "still":;
        case "replacement":;
        default:
            myResult =  this.parseReplacementTrack();
    }
    if (myResult){this.sectionTrust=true;}
    return myResult;
}
/**
フレームを指定してタイムライントラック上のセクションを返す
セクションバッファが最新でない場合は、セクションパースを実施する
当該のセクションが存在しない場合はnullを戻す
*/
XpsTimelineTrack.prototype.getSectionByFrame = function(myFrame){
    if((typeof myFrame == "undefined") ||(! myFrame < 0)) return null;
    var myResult = null;
    var mySections = this.sections;
    if(!(this.sectionTrust)) mySections = this.parseTimelineTrack();
    //ここは非同期実行不可
    if(mySections){
        for (var ix=0;ix<mySections.length;ix ++){
            if(myFrame < (mySections[ix].startOffset()+mySections[ix].duration)){
            myResult = this.sections[ix];
            break;
            }
        }
    }
    return myResult;
}
/**
 * xMap getElementByName/new_xMapElementをラップするタイムライントラックのメソッド
 * 既存のエレメントを指定した場合は、当該エレメントを返し
 * 存在しないエレメントを指定した場合は、エレメントを作成して返す
 * 同一の手続きが多いため補助関数を作成
 引数はエレメント名、グループ名
 
 */
XpsTimelineTrack.prototype.pushEntry = function (elementName,groupName){
//console.log(arguments);
    var myGroup   = this.xParent.parentXps.xMap.getElementByName(groupName);
    var myElement = this.xParent.parentXps.xMap.getElementByName([groupName,elementName].join("-"));//請求するターゲットジョブ処理は保留
        if(!myElement){
//console.log('no detect Element :'+[groupName,elementName].join("-"));
        if(!myGroup){;//new_xMapElement(name,type,Object Job)
//console.log('no detect Group :'+groupName);
            myGroup = this.xParent.parentXps.xMap.new_xMapElement(groupName,this.option,this.xParent.parentXps.xMap.currentJob);
//console.log(myGroup);
        }
        myElement = this.xParent.parentXps.xMap.new_xMapElement(elementName,myGroup,this.xParent.parentXps.xMap.currentJob,[groupName,elementName].join('\t'));
    }
//console.log(myElement);
    return myElement;
}
