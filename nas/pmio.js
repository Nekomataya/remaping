/**
 *  pmio.js
 *  production managemaent io
 *
 *  nas.Pm は 管理情報を分離するためのオブジェクト群
 *
 *  PmUnitを中核にしてそれに含まれる被管理情報をオブジェクトとして保持する
 *
 *  PmUnitは Management Unit(マネジメントユニット)を表す
 *  ＝カット袋に相当するオブジェクトの拡張機能＝
 *
 *  制作ライン及びステージングを管理するためのオブジェクト
 *  カレントの ライン、ステージ、ジョブの値をひとまとめに保持する
 *  制作上の既経路を保持
 *  エレメントグループに対する変更権の保持（ラインが持つ情報）
 *  及びこれらの情報に対するアクセスを受け持つ
 *  開始時間 伝票番号 担当ユーザなどを参照・設定・変更が可能
 *  オブジェクト初期化時点では、空のオブジェクトを作成する
 *
 *  カット管理を行う場合は ALLアセットを、他の個別素材の場合は個別アセットを引数にして初期化のこと

nas.Pm配下のDB通信オブジェクトは、アクセスポイントとして
nas.pmdb オブジェクトを置いてその配下に参照を配置する
配置されたオブジェクト群は基本的な情報テンプレートとして働く

Object nas.Pm がアプリケーションとしてのテンプレートキャリア
初期状態ではnas.pmdbを実アクセスポイントとして参照を置く
nas.pmdb  は、リポジトリ切り替え毎に各リポジトリの.pmdbに参照先が切り替えられる？

    nas.pmdb.users
         関連ユーザ一覧　ユーザ情報コレクション
    nas.pmdb.staff
        スタッフ一覧　スタッフコレクション
    nas.pmdb.lines
        ライン一覧テーブル   ラインコレクション
    nas.pmdb.stages
        ステージ一覧テーブル  ステージコレクション
    nas.pmdb.pmTemplate
        制作管理テンプレートコレクション
            ラインテンプレート（ライン定義）
                ラインテンプレートの内容は自分自身と自分で保持するステージコレクション
    nas.pmdb.jobNames
        ジョブテンプレートコレクション
        
    nas.pmdb.workTitles
        .workTitles[titleIndex].episodes
            .episodes[episodeIndex].works ?
    nas.pmdb.medias
    等々 その際にparent  経由で相互の参照を行うので初期化時のパラメータ注意    
    nas オブジェクト内では以下の相互関係を持つ

    nas.Pm.~    マスターとなるクラスデータ
    nas.Repository.pmd.~    サーバごとのカスタマイズデータ
    nas.pmdb.~    実アクセスポイント
    配下の各オブジェクトのparentは、それぞれの親をポイントして初期化

    Pmモジュールに設定パーサを実装
    設定パーサは設定ストリームを入力として、リジョン毎に分離
    各リジョンを適切のパーサに振り分けて、自身のコレクションDBを再初期化する
    各パーサは、追加処理を行うが、設定パーサ側でデータのクリアを行い、再初期化動作とする
    nas.Pm.parseConfig(ストリーム)
    nas.pmdb.users
    nas.pmdb.staff

    nas.pmdb.assets
    nas.pmdb.medias

    nas.pmdb.lines
    nas.pmdb.stages
    nas.pmdb.jobNames


// workTitles はPmクラスのみに存在するキャッシュオブジェクトなので要注意
    nas.Pm.workTitles

Object PmDomain
    nas.Pm.WorkTitle.pmd
    　・
    　・

pmdbオブジェクトは親オブジェクトへの参照 pmdb.parent を持つ
このプロパティは、pmdbが持つ情報の親ノードへの参照
親ノードは以下のオブジェクトに対応する

organization   = Repository.pmdb                 //pmdb.parent = Repository      ; Repository.parent='.';
product(title) = products/product.pmdb           //product.pmdb.parent = product ; product.parent = Repository;
episode(opus)  = product/episodes/episode.pmdb   //episode.pmdb.parent = episode ; episode.parent = product;
cut(work)      = episode/cuts/cut.pmdb           //cut.pmdb.parent = cut         ; cut.parent = episode
各ノードはツリー内を相互にアクセスするための .parentプロパティをもつ
pmdbはノードに対する.parent参照を持つ
pmdb からツリー上位のpmdbにアクセスするためには　this.parent.parent.pmdbをアクセスする必要がある　OK？
 */

nas.Pm = {};
nas.Pm.users= new nas.UserInfoCollection();
nas.pmdb = nas.Pm;
/*
    PmDomain オブジェクトは、制作管理上の基礎データを保持するキャリアオブジェクト
    制作管理ディレクトリノード毎に保持される。
    基礎データを必要とするプログラムに基礎データをサービスする
    基本データが未登録の場合は親オブジェクトの同データを参照してサービスを行う
    
*/
nas.Pm.PmDomain=new function(myParent){
    this.parent=myParent;
    this.users;     //
    this.staff;     //
    this.lines;     //
    this.stages;    //
    this.jobNames;  //
    
    this.medias;

}

/**
 * @method
 * クラスメソッド
 * @desc
 * ターゲットコレクション内にkeywordに一致するプロパティを持っているメンバーがあればコレクションメンバーのキー値を返す
 * keyword がメンバーキーだった場合はそのまま返す
 * 検索に失敗したらfalse
 * オブジェクト本体が必要な場合は、Object.members[key]またはこの検索関数を間接的にコールする_getMemberメソッドを使用
 * タイトル/エピソード/メディア/アセット/ライン/ステージ　共用
 * @param {string} keyword
 * @return {property}
 * memberProp 
 * キーワードは、各コレクションの共通プロパティで、検索対象となるもの
    id          DBアクセス用のキー値（予約）
    projectName 作品としてのタイトル　タイトルに所属する情報の場合に有効だが、検索キーとしてはタイトルコレクション以外では無効
    name        コレクションメンバーの一般名称
    shortName   コレクションメンバーの省略表記
    fullName    コレクションメンバーの正式表記
    code        コレクションメンバーの短縮アイテムコード
 *
 */
nas.Pm.searchProp = function(keyword,target){
    if(target.members[keyword]) return keyword;
    for (var prp in target.members){
        if( (target.members[prp].id          ==keyword)||
            (target.members[prp].name        ==keyword)||
            (target.members[prp].projectName ==keyword)||
            (target.members[prp].episodeName ==keyword)||
            (target.members[prp].shortName   ==keyword)||
            (target.members[prp].fullName    ==keyword)||
            (target.members[prp].code        ==keyword) ) return prp;
    }
    return false;
}
/**
    クラスメソッド　nas.Pm.searchPropを使ってキーを検索して対応するメンバーを返すオブジェクトメソッド
    検索に失敗したケースではnullを戻す
    引数を与えない場合に限り、メンバー内の最初のエントリを戻す
    デフォルトエントリとして使用
    デフォルトエントリを必ず最初に登録する必要がある
*/
nas.Pm._getMember = function(keyword){
    if(typeof keyword=='undefined'){for (itm in this.members){return itm;break;}}
    if(this.members[keyword]) return this.members[keyword];
    var prp = nas.Pm.searchProp(keyword,this);
    if(prp){return this.members[prp]}else{return null}
}

/**
    コレクションメンバーをテキストとしてダンプ出力するメソッド　汎用
    対象コレクション
 nas.Pm.WorkTitleCollection //nas.pmdb.workTitles.toString(true);
 nas.Pm.MediaCollection     //nas.pmdb.medias.toString(true);
 nas.Pm.AssetCollection     //nas.pmdb.assets.toString(true);
 nas.Pm.StageCollection     //nas.pmdb.stages.toString(true);
 nas.Pm.LineCollection      //nas.pmdb.lines.toString(true);
 nsa.Pm.//nas.pmdb.jobNames.toString(true);　これは別わけ　コレクションの構造が異なる
 nas.pmdb.//nas.pmdb.pmTemplate.toString(true);
    
    引数なし    メンバーあたり1要素のカンマ区切りテキスト
    
    "dump"      プレーンテキスト設定ファイル用のダンプストリーム
                コレクションの　add  メソッドで処理可能なテキストデータの配列を
                改行区切りで出力する
                
    "JSON"      JSONによるダンプ（可能な場合のみ　いらんかも　現在使ってない 2018.01）
*/
/**
    各コレクションメンバーは、toString　メソッドで自身のテキスト値を返す
    引数の形式により内容を変化させる。
    引数なし　代表値　例えばステージならばステージ名
    "dump"  プレーンテキスト設定ファイル用のダンプストリームを1レコード
    "JSON"  JSONによるダンプ（可能な場合) ほぼないので、やめておくか？
*/
nas.Pm._toString = function(form){
    switch (form){
    case "JSON":
        try {
            var result = JSON.stringify(this.members);//JSON.stringify不能なオブジェクトがあるので注意
        }catch(er){var result = false;}
        return result;
        break;
    case "dump":
        var result="";
        //コレクションのキャリアが配列ベースの場合
        if(this.members instanceof Array){
            for (var ix =0 ; ix<this.members.length;ix++){
                if (ix > 0) result +=",\n";
                result += this.members[ix].toString('dump');
            }
            result += '\n';
       }else{
            for (var prp in this.members){
                result += '"'+prp+'",';
                result += this.members[prp].toString('dump');
                result += '\n';
            }
        }
        return result;
        break;
    default:
        var result = new Array;
        //コレクションのキャリアが配列ベースの場合
        if(this.members instanceof Array){
            for (var ix =0 ; ix<this.members.length;ix++){
                result.push(this.members[ix].toString());
            }
       }else{
            for (var prp in this.members){
                result.push(this.members[prp].toString());
            }
        }
        return result.toString();
    }
}
//test 上記共用メソッドの関与するコレクションの出力確認
// nas.pmdb.workTitles.toString(true)
// nas.pmdb.medelias
/** ProductionManagementNode
 * 制作管理オブジェクト
 * @constractor
 * 制作管理オブジェクトは、それぞれの管理単位（PmUnit=カット袋）についての制作管理部分を抽出したオブジェクトである。
 * BANK等の管理移管時データ独立性を持たせるために分離される
 * ラインごとに各PmUnitのプロパティとして登録され、ラインの開始条件及び終了条件の判定を含む
 *  カット袋よりも上位となるエピソード・タイトルについては、このオブジェクトでなくnas.Pm.PmUnitをコレクションメンバーとする上層ノードオブジェクトを作る
 ＞＞管理がノードベースでありアセット単位にならないため
 */
nas.Pm.PmNode = function PmNode(targetAsset,myName){
    this.target     = targetAsset;//管理単位ごとのゴールを設定
    this.name       = myName;
    this.jobID      ;
    this.jobs       = [];//空コレクションで初期化
    this.stageID    ;
    this.stages     = [];
    this.lineID     ;
    this.line       ;
}
/*
Pmuコンストラクタ

PMU = new PmUnit(scObjects);
カット袋に相当するワークキャリア（ワークトレーラー）
    SCiCオブジェクトを配列で与えて初期化する。
複数オブジェクトを持つ場合は 兼用カットとして処理する
クラスメソッドを使って後から編集可能
カット番号等のムービー内での識別情報が複数入っている
また、集合全体の進捗情報が格納されている
作品情報・管理フラグ・カットコレクション・進捗情報・素材DBを持つ
素材DBはPMUと関連付けられたxMapが保持する。
管理情報をこのユニットが受け持つ
*/

nas.Pm.PmUnit=function(mySCs){
    //初期パラメータの中の第一要素の情報で識別名を作る
    this.body           = mySCs;//
    this.cut            = this.body[0].cut;//
    this.scene          = this.body[0].myScene;//
    this.subtitle       = mySubTitle;//文字列又は参照
//サブタイトル記述はDBと接続のない場合は別途入力するか、又は空白のまま保留
    this.opus           = myOpus;//識別文字列（リレーション または ProductOpusオブジェクト）
    this.title          = myTitle;//識別文字列（リレーション または ProductTitleオブジェクト）
    this.inherit        =   mySCs;
    this.pmNode         =   new nas.PmNode();
}
/*
制作管理単位の内容ダンプメソッド
引数：　form 文字列可形式
指定がない場合は　Sciオブジェクトのリストを"//（ダブルスラッシュ）"で区切って戻す

*/
nas.Pm.PmUnit.prototype.toString=function(form){
    if(! form){
        return this.body.reverse().join("//");
    }else{
        return "yet coding";
    }
//toString()メソッドは、出力用に調整する
//
}
//制作管理用 WorkTitelオブジェクト　サーバ上のProductに対応する
/*
nas.Pm.newWorkTitle(タイトル識別子)
オブジェクトメソッドで初期化する
戻り値はタイトル情報オブジェクト
実運用上はDBとリンクして動作するように調整

クラスメソッドとしての初期化機能は保留
タイトル情報及びタイトルの制作母体となる組織(Organization)へのペアレントリンクを保持する
親オブジェクト内のタイトルコレクションのメンバー
タイトル内にOpusコレクションを持たせる
*/
nas.Pm.WorkTitle = function(){
    this.id;   //DB接続用index - UATサーバの場合はtoken　tokenはidへの参照
    this.projectName; //タイトル - UATサーバの場合はname name はprojectNameへの参照
    this.fullName;  //完全なタイトル文字列（なるべく公式に）
    this.shortName;  //表示用短縮名
    this.code;   //ファイル名使用の略号2~3文字アルファベット限定
    this.framerate;  //Object nas.Framerate フレームレート
    this.length;  //String 納品定尺フレーム数 または nasTC
    this.inputMedia; //Object nas.AnimationField スタンダードフレーム
    this.outputMedia; //Object nas.AnimationField 編集スペック

    this.pmTemplate;    //作品内の標準工程テンプレート
    this.staff; //作品のスタッフ一覧　スタッフコレクションオブジェクト
    this.opuses = new nas.Pm.OpusCollection(this);    //Object nas.Pm.OpusCollection タイトル配下の話数コレクション
//UATサーバのためのプロパティ
    this.token = this.id;
    this.name = this.projectName;
    this.updated_at;
    this.created_at;  
    this.description;//タイトル識別子として使用？
}
/* タイトル文字列化
引数
    なし      メインタイトルフルネームで返す
    "dump"  
*/
nas.Pm.WorkTitle.prototype.toString = function(form){
    if(form == 'dump'){
        return JSON.stringify([
            this.id,
            this.fullName,
            this.shortName,
            this.code,
            this.framerate.toString(true),
            nas.Frm2FCT(this.length,2),
            this.inputMedia,
            this.outputMedia
        ]);
    }
    return this.projectName;
}
nas.Pm.WorkTitle.prototype.valueOf=function(){return this.id;}
/**
       ワークタイトルコレクションオブジェクト
       一般に組織の配下に入るが、システム配下のリセント情報としても利用される
*/
nas.Pm.WorkTitleCollection = function(myParent){
    this.parent  = myParent;
    this.members = {};
}
nas.Pm.WorkTitleCollection.prototype.entry = nas.Pm._getMember;

nas.Pm.WorkTitleCollection.prototype.toString = nas.Pm._toString;
/*
function(keyword){
    if(keyword){  return this.entry(keyword)};
    return JSON.stringify(this.members);
}
*/
//タイトル登録メソッド
nas.Pm.WorkTitleCollection.prototype.addTitle = function(titleName,propList){
    this.members[titleName]             = new nas.Pm.WorkTitle();
    this.members[titleName].projectName = titleName;
    this.members[titleName].id          = propList[0];
    this.members[titleName].fullName    = propList[1];
    this.members[titleName].shortName   = propList[2];
    this.members[titleName].code        = propList[3];
    this.members[titleName].framerate   = new nas.Framerate(propList[4]);
    this.members[titleName].length      = nas.FCT2Frm(propList[5]);
    this.members[titleName].inputMedia  = propList[6];
    this.members[titleName].outputMedia = propList[7];
}

//テンプレート用コレクション
/*
    UI上で参照されるコレクション
    使用したタイトルを記録してテンプレートとして利用
    recentTitles
    プロダクションオブジェクトの配下のコレクションは別に設定される
*/
nas.Pm.workTitles = new nas.Pm.WorkTitleCollection(nas.Pm);

//制作管理用 Opusオブジェクト　サーバ上のEpisodeに対応する
/*
 *nas.Pm.newOpus(タイトル識別子)
 * // nas.Pm.newOpus(識別ID)
 *nas.Pm.newOpus(管理話数名,タイトル)
 *オブジェクトメソッドで初期化する
 *戻り値は管理単位情報オブジェクト
 *実運用上はDBとリンクして動作するように調整
 *
 *クラスメソッドとしての初期化機能は保留
 制作話数(Opus/Episode)が所属するタイトル(Title/Product)へのリンクを持つ
 
*/
nas.Pm.Opus = function Opus(myID,myOpus,mySubtitle,myTitle){
    this.id         = myID          ;//DB接続用index
    this.name       = myOpus        ;//表示名 話数／制作番号等
    this.subTitle   = mySubtitle    ;//サブタイトル文字列
    this.workTitle  = myTitle       ;//Object nas.Pm.WorkTitle=parentTitleNode
    this.valueOf    = function(){return this.id};
    this.pmunits ;//カット袋コレクション
}
/**
toStringメソッド　引数がなければ識別子用の文字列を返す
引数を与えると設定ファイル形式のJSONを返す
*/
nas.Pm.Opus.prototype.toString   = function(form){
    if(form == 'dump'){
        return JSON.stringify([
            this.episodeName
        ])
    }
    return this.name+(this.subTitle)?"["+this.subTitle+"]":"";
};

nas.Pm.newOpus = function(){
    
}
/**
    各話（エピソード）コレクションオブジェクト　OpusCorrection
    一般にタイトルの配下に入るが、システム配下でキャッシュとしても利用
*/
nas.Pm.OpusCollection = function(myParent){
    this.parent  = myParent;//parentTitle
    this.members = {};
}
nas.Pm.OpusCollection.prototype.entry = nas.Pm._getMember;

nas.Pm.OpusCollection.prototype.toString = function(keyword){
    if(keyword){  return this.entry(keyword)};
    return JSON.stringify(this.members);
}

//タイトル登録メソッド
//例　addOpus("001",["0s12376","ep001",""])
nas.Pm.OpusCollection.prototype.addOpus = function(episodeName,propList){
    this.members[titleName].episodeName = episodeName;
    this.members[titleName].id          = propList[0];
    this.members[titleName].name    = propList[1];
    this.members[titleName].subTitle   = propList[2];
    this.members[titleName].pmunits   = new nas.PMUCollection();
}



//メディアDB
/*
メディアDBは、入出力のメディアスペックを記述するための複合オブジェクト
MAP内部ではワークタイトルに付属する情報として処理
*/
nas.Pm.ProductionMedia = function(mediaName,animationField,frameRate){
    this.id             ;
    this.animationField = new nas.AnimationField();//
    this.mediaName      = this.animationField.name;//
    this.baseResolution = new nas.UnitResolution();//
    this.type           ;//mediaType drawing/video
    this.baseWidth      = this.animationField.baseWidth;
    this.frameAspect    = this.animationField.frameAspect;
    this.frameRate      = new nas.Framerate();
    this.tcType         ;//string tradJA/SMPTE/TC/frame
    this.pegForm        = this.animationField.peg;//animationField.peg
    this.pegOffset      = this.animationField.pegOffset;
    this.pixelAspect    ;//float
    this.description    ;
}

nas.Pm.ProductionMedia.prototype.toString = function(form){
    if(form == 'dump'){
        return JSON.stringify([
        this.id,
        this.animationField,
        this.baseResolution,
        this.mediaType,
        this.tcType,
        this.pegForm,
        this.pixelAspect,
        this.description
        ]);
    }
    return this.mediaName;
}
//
nas.Pm.MediaCollection= function(myParent){
    this.parent  = myParent;
    this.members = {};
}
nas.Pm.MediaCollection.prototype.entry = nas.Pm._getMember;

nas.Pm.MediaCollection.prototype.toString = nas.Pm._toString;

nas.Pm.MediaCollection.prototype.addMedia = function(mediaName,propList){
    
    this.members[mediaName]                 = new nas.Pm.ProductionMedia();
    this.members[mediaName].mediaName       = mediaName;
    this.members[mediaName].id              = propList[0];
    this.members[mediaName].animationField  = propList[1];//現在は文字列のまま
    // 本日は仕様変更が主眼なのでこのまま保留　12/04
    this.members[mediaName].baseResolution  = propList[2];
    this.members[mediaName].mediaType       = propList[3];
    this.members[mediaName].tcType          = propList[4];//nas.Framerate Objectする場合は nas.newFramerate(this.tcType)
    this.members[mediaName].pegForm         = propList[5];
    this.members[mediaName].pixelAspect     = propList[6];
    this.members[mediaName].description     = propList[7];
}

nas.Pm.medias = new nas.Pm.MediaCollection(nas.Pm);

/*制作管理用 Assetオブジェクト
 *アセットベースの管理を行う
 *このシステム上のアセットは、通常XPSを介して時間／空間的に配置された再利用可能データ群を指す
 *XPSを持たない場合もある（時間構造を持たない）
 *
 *作品内でユニークな識別名を持つ管理用のキーオブジェクトに結合されたデータ群を総称するもの、
 *管理用オブジェクトは以下のプロパティを持つ
 * name String 識別名称:作品内での一意性を求められる
 * hasXPS Boolean アセットがXPS（時間構造）を持つかのフラグ
 * code String 省略表記用短縮コード ２〜３バイトを推奨 ユニークであること
 * shortName String 画面表示用略称 ８文字程度までを推奨 指定のない場合はnameを転用
 * description String アセットの説明 ユーザのために必用
 * endNode Boolean アセットがラインを終了させうるか否かのフラグ このフラグのあるアセットは、制作ラインの目標となりラインを収束させる
 * callStage Array ステージ識別名配列 当該アセットを受けて（入力として）開始することが可能なステージ群 ユーザが選択する 一つのアセットを受けて２つ以上のステージを開始する場合、ライン分岐が発生する
 *
*/
nas.Pm.Asset = function(){
    this.name           ;
    this.hasXPS         ;
    this.code           ;
    this.shortName      ;
    this.description    ;
    this.endNode        ;
    this.callStage      ;
}

nas.Pm.Asset.prototype.toString = function(form){
    if (form == 'dump') {
        return JSON.stringify([this.name,this.hasXPS,this.code,this.shortName,this.description,this.endNode,this.callStage]);
    }
    return nas.Pm.searchProp(this.name,nas.pmdb.assets);
}
/**
    アセットコレクション
*/
nas.Pm.AssetCollection = function(myParent){
    this.parent  = myParent;
    this.members = {};
}
nas.Pm.AssetCollection.prototype.entry = nas.Pm._getMember;

nas.Pm.AssetCollection.prototype.toString = nas.Pm._toString;

//アセット登録メソッド
nas.Pm.AssetCollection.prototype.addAsset = function(assetName,propList){
    this.members[assetName]             = new nas.Pm.Asset();
    this.members[assetName].name        = propList[0];
    this.members[assetName].hasXPS      = (propList[1])?true:false;
    this.members[assetName].code        = propList[2];
    this.members[assetName].shortName   = propList[3];
    this.members[assetName].description = propList[4];
    this.members[assetName].endNode     = (propList[5])?true:false;
    this.members[assetName].callStage   = propList[6];
}
/* 
    return [ this[assetName].name,
    this[assetName].hasXPS,
    this[assetName].code,
    this[assetName].shortName,
    this[assetName].description,
    this[assetName].endNode,
    "["+(this[assetName].callStage).join()+"]"
    ];
*/
nas.Pm.assets = new nas.Pm.AssetCollection(nas.Pm);
/*制作管理用 PmTemplateオブジェクト
 *プロパティ すべて配列
 *  lineNames   ライン名称コレクション
 *  stageNames  ステージ名称コレクション
 *  jobName     ジョブ名称コレクション
 *  
 *  .getLines()             設定されているラインのリストを返す
 *  .getStageName(myLine)   ラインごとのステージ候補セットを設定順で戻す
 *  .getJobNames(myStage)   指定ステージのジョブ候補セットを設定順で戻す
 *  
 *  タイトルごとに設定される工程テンプレート
 *  ユーザが管理情報を入力する際に提示される参考データとして提示される
 *  記録データ的には、コレクション外の入力はOK
 *  コレクション外の入力は入力時にコレクションに追加されて必要に従ってマスターDBへ送信される
 *  アクセスメソッドを介して情報セットを引き出す
 *    
lineNames[line]=[stage1,stage2,stage3];
stageNames[stage]=[line1,line2];
jobNames[job]=[stage1,stage2]
line null,ALL,trunk,backgroundArt,
 */
//ラインテンプレートコレクション配列
nas.Pm.PmTemplateCollection   = function(myParent){
        this.parent  = myParent;
        this.members = [];
};
nas.Pm.PmTemplateCollection.prototype.addTemplates = function(templates){
        if(! templates[0] instanceof Array){templates = [templates];}
    for (var eid = 0;eid<templates.length ; eid ++){
        //引数: トレーラーオブジェクトの参照,ライン識別名,ステージコレクションの内容配列
        this.members[eid] = new nas.Pm.LineTemplate(this,templates[eid][0],templates[eid][1]);
    }
};
nas.Pm.PmTemplateCollection.prototype.toString = nas.Pm._toString;

/**
    ラインテンプレート　ステージデータコレクションを持つ
引数
lineName    ライン識別名称

*/
nas.Pm.LineTemplate = function(myParent,lineName,myStages){
    if (!(myStages instanceof Array)) myStages = [myStages];
    this.parent = myParent;//親参照は不要？
//    this.lineName   = lineName;
    this.line   = this.parent.parent.lines.getLine(lineName);
//    this.stages = myStages;
    this.stages = new nas.Pm.StageCollection(this);
    for (var ix=0;ix< myStages.length;ix++){
//        this.stages.addStage(myStages[ix],this.line);
        var stageKey= nas.Pm.searchProp(myStages[ix],this.parent.parent.stages)
        this.stages.addStage(stageKey,this.parent.parent.stages.members[stageKey]);
    }
};
/*
toString(true)　でテキスト設定形式で書き出す

*/
nas.Pm.LineTemplate.prototype.toString = function(form){
    if(form == 'dump'){
      return JSON.stringify([
        this.line.toString(),
        this.stages.toString().split(',')
      ]);
    }
    return this.line.toString();
};

nas.Pm.pmTemplate = new nas.Pm.PmTemplateCollection(nas.Pm);

/*制作管理用 Jobオブジェクト
 *プロパティ
 * name String: ジョブ名
 * // line Object:Line 所属ライン＜＜不要 stage にライン情報が含まれるので不用
 * stage Object:Stage 所属ステージ
 * type Number:typeID 0:init/1:primary/2~:check/ 当該Jobのタイプ
 * id Number:Index ステージ内でのユニークID 自己アクセスのための配列インデックスを内部保持
 * jobId生成規則
 * 管理単位所属ステージ内部でユニークな整数ID 重複不可 飛び番等は許容される
 * DB連結時はDBへの照合プロパティになるので初期化時には引数として外部から与えるのが基本
 * 引数が与えられない（＝DB連結が無い）場合は、その場での自動生成を行う
 * その際のルールは、同PmStage内部での出現順連番 0はStartupJobとして予約 
 * currentStatus String:ステータス startup|active<>hold|fixed
 * createUser String:UID
 * createDate String:DATE
 * updateUser String:UID
 * updateDate String:DATE
 * slipNumber String:伝票番号
 *new Job(jobName?)
*/
nas.Pm.ProductionJob = function ProductionJob(myName,myStage,myIndex,mySlipNumber){
    this.name           = myName;
    this.stage          = myStage;
// if(! myStage){alert("stage Argument is :"+myStage)}
    this.type           ;
    this.id             = (typeof myIndex == "undefined")? null:myIndex;//
    this.currentStatus  ;//
    this.createUser     ;//
    this.createDate     = new Date();//
    this.updateUser     ;//
    this.updateDate     ;//
    this.slipNumber     ;//
};
nas.Pm.ProductionJob.prototype.getPath = function(){return [this.name,this.stage.getPath()].join(".");}

nas.Pm.ProductionJob.prototype.toString = function(){
    var myResult        = "";
// myResult            += "##["+this.stage.name+"][["+this.name+"]"+"id:"+this.id+"]\n";
    myResult            += "##[["+this.name+"]"+"id:"+this.id+"]\n";
    myResult            += "##created="+this.createDate+"/"+this.createUser+";\n";
    myResult            += "##updated="+this.createDate+"/"+this.createUser+";\n";
    var myGroups        = new Array();
    var myMapElements   = this.stage.line.parent.elementStore;
    //エレメント総当りで ジョブに対応するグループを抽出
    for (var eID=0 ; eID < myMapElements.length ; eID++){
     if((myMapElements[eID] instanceof nas.xMapGroup)&&(myMapElements[eID].link===this.stage)){
      myGroups.push(myMapElements[eID].link); 
     }
    }
    //登録グループごとにエレメント総当りで ジョブ内のグループに対応するエレメントを抽出して出力に加算
    for (var gID=0;gID<myGroups.length;gID++){
        myResult+="["+myGroup[gID].name+"\t"+myGroup[gID].type+"]\n";
        for (var eID=0;eID<myMapElements.length;eID++){
            if((myMapElements[eID] instanceof nas.xMapElement)&&(myMapElements[eID].link===this)){
                myResult+=myMapElements[eID].toString();//
            }
        }
//  myResult+="["+myGroup[gID].name+"]/\n";//グループ終了子は省略可
    }
    myResult+="##[["+this.name+"]]/\n";
    return myResult;
};
/**
    JOB名称ストア
    クラス内でDBとして働くコレクション
    このオブジェクト（配列）がDBと通信を行う
    引数:   jobName,targetStage,jobType
            ジョブ名,所属ステージ名,ジョブタイプ
    配列要素は引数の配列である必要あり。
    実際のジョブは定義されるものではなく、名称をその場で決めて開始することが可能
    これらの設定は、
 */
nas.Pm.JobTemplate = function(jobName,targetStage,jobType){
    this.name   = jobName    ;
    this.stage  = targetStage;
    this.type   = jobType    ;
};
nas.Pm.JobTemplate.prototype.toString = function(form){
    if(form == 'dump'){
        return JSON.stringify([this.name,this.stage,this.type]);
    }
        return this.name;
};
nas.Pm.JobTemplateCollection = function(myParent){
    this.parent  = myParent ;
    this.members = [];
}
/**
    ジョブテンプレートコレクション
    一括登録メソッド
    
*/
nas.Pm.JobTemplateCollection.prototype.addNames = function(names){
    if(! names[0] instanceof Array){names = [names];}
    for (var eid = 0;eid<names.length ; eid ++){
        this.members[eid] = new nas.Pm.JobTemplate(names[eid][0],names[eid][1],names[eid][2]);
    }
}
/**
    テンプレート取得
    引数に従ってJobテンプレートから必要な集合を抽出して返す
引数:
    ステージキーワード   layout LO レイアウト　等
    ジョブタイプ  init/primary/check/* ジョブタイプ'*'は primary+check (! init)
*/
nas.Pm.JobTemplateCollection.prototype.getTemplate = function(stage,type){
console.log(stage+':'+type)
    if((! stage)||(! type)){return []};
    var result=[];
console.log(this.members);
    for (var eid = 0;eid<this.members.length ; eid ++){
console.log(eid +'/'+ this.members.length);
console.log(this.members[eid]);
        if((this.members[eid].type == type)||(this.members[eid].type == "*")||(type == "*")&&(this.members[eid].type != "init")){
            if((this.parent.stages.getStage(this.members[eid].stage) === this.parent.stages.getStage(stage))||(this.members[eid].stage == "*")){
                var jobName         = this.members[eid].name;
                var parentStage = this.parent.stages.getStage(stage);
                if(( jobName.indexOf("*") >= 0)&&(parentStage)){
                    var myString = jobName.replace(/\*/,parentStage.name);
                }else{
                    var myString = jobName;
                }
                result.push(myString);
            }
        }
    }
    return result;
}
nas.Pm.JobTemplateCollection.prototype.toString = nas.Pm._toString;
/*
function(form){
    if(form == 'JSON'){
        return JSON.stringify(this.members);//JSON.stringify不能なオブジェクトがあるので注意
    }else if(form == 'dump'){
        var result="[";
        for (var ix =0 ; ix<this.members.length;ix++){
            result += this.members[ix].toString('dump');
            result += ((ix+1)<this.members.length)? ",\n":"]\n";
        }
        return result;
    }else{
        var result="[";
        for (var ix =0 ; ix<this.members.length;ix++){
            result += this.members[ix].toString(true);
            result += ((ix+1)<this.members.length)? ",\n":"]\n";
        }
        return result;
    }
}
*/
nas.Pm.jobNames = new nas.Pm.JobTemplateCollection(nas.Pm);



/*制作管理用 Stageオブジェクト
 *
 * name String 識別名称:作品内での一意性を求められる
 * line Object ステージが所属するラインへの参照
 * code String 省略表記用短縮コード ２〜３バイトを推奨 ユニークであること
 * shortName String 画面表示用略称 ８文字程度までを推奨 指定のない場合はnameを転用
 * description String ステージの説明 ユーザのために必用
 * output Asset ステージの出力アセット
 * staffs Object スタッフリスト（リスト）
 * ステージは必ずステージコレクションを介してラインに所属するので、親ラインの参照はコレクション側のline属性で保持する。
 * ステージ内では、コレクションを parent プロパティで示す　従って親のラインス参照するパスは this.parent.line
*/
nas.Pm.ProductionStage=function(myName,myParent){
    this.parent=myParent;
    this.name=myName;
    this.code;
    this.shortName;
    this.description;
    this.output;
}
nas.Pm.ProductionStage.prototype.getPath=function(){return [this.name,this.parent.line.getPath()].join(".")}
nas.Pm.newStage=function(myStage,myLine){
    var newStage= nas.Pm.stages.getStage(myStage);//参照をとっているが、これは複製？
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
nas.Pm.ProductionStage.prototype.toString=function(form){
    if(form == 'dump'){
        return JSON.stringify([
            this.name,
            this.code,
            this.shortName,
            this.description,
            this.output
        ]);
    }
    return this.name;
};
/*    ステージコレクション
 *
 *クラス内でDBとして働くオブジェクト
 *このオブジェクトがDBと通信する
 ステージにテンプレートとしてスタッフコレクションを持たせる拡張を行う
*/
nas.Pm.StageCollection = function(myParent){
    this.parent  = myParent;
    this.members = {};
}

nas.Pm.StageCollection.prototype.toString = nas.Pm._toString;

//ステージコレクション追加メソッド
/*
引数：
stageName
myStage ステージオブジェクト　または　プロパティリスト配列
*/
nas.Pm.StageCollection.prototype.addStage=function(stageName,myStage){
    if(myStage instanceof nas.Pm.ProductionStage){
        this.members[stageName]= myStage;
    }else if(myStage instanceof Array){
    this.members[stageName] = new nas.Pm.ProductionStage(myStage[0],null);
//    this.members[stageName].name=myStage[0];
    this.members[stageName].code        = myStage[1];
    this.members[stageName].shortName   = myStage[2];
    this.members[stageName].description = myStage[3];
    this.members[stageName].output      = myStage[4];
    }
}

nas.Pm.StageCollection.prototype.getStage = nas.Pm._getMember;
/**
    次のステージの候補を抽出する関数
引数:
    ライン識別子
    ステージ識別子
基本構造
    引数のステージの出力アセットから、そのアセットが呼び出し可能なステージを得て展開する
    
*/
nas.Pm.StageCollection.prototype.getTemplate = function(stageName){
    var result=[];
    var myStageAsset =this.parent.assets.entry(this.getStage(stageName).output);
    var newStageList=(myStageAsset)? myStageAsset.callStage:[];
    for (var idx = 0 ;idx < newStageList.length ; idx ++){
        var myStage = this.getStage(newStageList[idx]);//null可能性あり
        if(myStage) result.push(myStage.name);
    }
    return result;
}
/**
    ステージコレクション内からスタートアップ候補（開始デフォルト）のステージを取得するメソッド
    第一ステージとなるアイテムはステージコレクションに最初に置かれたステージ
    for( itm in this.menbers) で最初に出てくるステージのこと
    ↑これはgetStage=_getMember に統合　したので不要

nas.Pm.StageCollection.prototype.getStartup =function(){
    for(itm in this.members){return itm;break;}
}
*/

nas.Pm.stages = new nas.Pm.StageCollection(nas.Pm);
/*
定義テーブルからテンプレートを取得するための機能
名前と検索先(指定がない場合はcallerから判定)を与えて、その定義テーブル内のオブジェクト引数を返す
あたるべきプロパティはname,code,shortName,fullName オブジェクトによってはいくつかのプロパティを持たないものものある

*/

/*制作管理用 ProductionLineオブジェクト

name String 識別名称:作品内での一意性を求められる
shortName String 画面表示用略称 ８文字程度までを推奨 指定のない場合はnameを転用
outputAsset Asset ラインの出力アセット
initAsset Asset ラインの入力アセット
code String 省略表記用短縮コード ２〜３バイトを推奨 ユニークであること
description String ラインの説明 ユーザのために必用

*/

nas.Pm.ProductionLine=function(){
    this.name;
    this.shortName;
    this.outputAsset;
    this.initAsset;
    this.code;
    this.description;
}

nas.Pm.ProductionLine.prototype.getPath = function(){return this.name;}

nas.Pm.ProductionLine.prototype.toString = function(form){
    if(form == 'dump'){
        return JSON.stringify([
            this.name,
            this.shortName,
            (this.outputAsset)?this.outputAsset.toString():this.outputAsset,
            (this.initAsset)?this.initAsset.toString():this.initAsset,
            this.code,
            this.description
        ])
    }
    return this.name
};
/*    ラインストア

クラス内でDBとして働くコレクションオブジェクト
このオブジェクトがタイトルの下に入り上位オブジェクトがDBと通信する
*/
nas.Pm.LineCollection = function(myParent){
    this.parent  = myParent;
    this.members = {};
}

nas.Pm.LineCollection.prototype.toString = nas.Pm._toString;
//function(){    return JSON.stringify(this.members);}

/**
ラインテンプレートの中から指定された名前と一致するオブジェクトを戻す
lineNameと一致していればそのまま、一致するものがない場合はname/shortName/codeを検索してその順で最初に一致したものを戻す
*/
nas.Pm.LineCollection.prototype.getLine = nas.Pm._getMember;

/*
    ライン編集メソッド
*/

nas.Pm.LineCollection.prototype.addLine =function(lineName,propList){
    this.members[lineName]              =new nas.Pm.ProductionLine();
    this.members[lineName].name         =propList[0];
    this.members[lineName].shortName    =propList[1];
    this.members[lineName].outputAsset  =propList[2];
    this.members[lineName].initAsset    =nas.Pm.assets.entry(propList[3]);
    this.members[lineName].code         =propList[4];
    this.members[lineName].description  =propList[5];
}


nas.Pm.lines = new nas.Pm.LineCollection(nas.Pm);

//制作管理用 SCオブジェクト
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
nas.Pm.SC = function SC(cutName,sceneName,myOpus,myTime,myTRin,myTRout,myRate,myFrate){
    this.id;//DB連結用 DBに接続していない場合はundefined
    this.cut     = cutName;//
    this.scene      = sceneName;//
    this.opus       = myOpus;//Object nas.Pm.Opus
    this.workTitle  = this.opus.workTitle ;//Object nsa.Pm.WorkTitle参照
    this.time       = myTime;//ここでは静的プロパティ  フレーム数で記録
    this.trin       = myTRin;//[0,"trin"];//後で初期化
    this.trout      = myTRout;//[0,"trout"];//後で初期化
    this.framerate  = myFrate; //Object nas.Framerate;
}
nas.Pm.SC.prototype.toString =function(){
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
nas.Pm.SC.prototype.valueOf =function(){return this.id;};//

/**
       引数をまとめて解釈してSCiオブジェクトを返すPmクラスメソッド


*/
nas.Pm.newSC=function(myTitleString,myTimeString,myRateString){
    var myInfo      = nas.separateTitleString(myTitleString)
    var myOpus      = nas.newOpus(myInfo[2],myInfo[3]);
    var myTimeInfo  = nas.perseTimeString(myTimeString);
    var myRate      = (myRateString)? new nas.Framerate(myRateString):myOpus.workTitle.framerate;
    var myTime      = myTimeInfo[0];
    var myTrin      = myTimeInfo[1];
    return new nas.Pm.SC(myInfo[0],myInfo[1],myOpus,myTimeInfo[0],myTimeInfo[1],myTimeInfo[2],myRate);
}
//Test
// A=nas.Pm.newSC("mte02")

/*
    管理ライン

new nas.Pm.Issue(Line or LineName,IssueID)
発行されたライン情報
.lineId; String/ 識別ID  文字列処理 専用のパーサを作る
.lineName; String/ 識別名
.line Object/Line 
.checkOut; string/ date / user
.checkOutDate; string/ date / user
.checkIn; String/ date / user
.checkInDate; String/ date / user
.currentStatus; String/ Startup,Active,Hold,Fixed,Aborted
制御関連は各ステージの持つアセットがステージ内で完結する構造により無用の概念となる
更新権利の概念は消失したので不要 これを持って制御する事項が無い
アセット（ステージ）間の衝突の検知は必用

作業状態の遷移
     startup 初期化状態（未着手）
     ↓（一方通行）
     active ⇐⇒ hold
     ↓    ↓
        fixed/aborted
activeには本作業中とチェック作業中が含まれる
holdは、作業をサーバ側で預かっている状態 作業権限の無いユーザはアクティブに遷移出来ない
fixedは、ラインの作業が完成した状態
abortedは、ライン自体が中断（破棄）された状態 中断からの復帰が可能なので reject.discard,destruct 等では無いが実質同等
ステータス属性はラインの状態

*/
nas.Pm.Issue=function(myLine,myID){
    this.line=(myLine instanceof nas.Pm.ProductionLine)? myLine:undefined;//Object:Pm.line if exists link
    //名前指定時は 次の拡張では初期化時点でシステム上の既存ラインを検索、存在しない場合はライン新規登録用の機能を呼び出す
    this.lineId             = new String(myID);//String:index 
    this.lineName           = (myLine instanceof nas.Pm.ProductionLine)? this.line.name:myLine;//String:name
    this.lineCheckOut       = nas.CURRENTUSER;//String:uid
    this.lineCheckOutDate   = new Date();//Date;
    this.lineCheckIn        ;//String:uid undefined
    this.lineCheckInDate    ;//Date: undefined
    this.currentStatus      = "startup";//String:startup active hold fixed aborted 
}
nas.Pm.Issue.prototype.toString = function(){
    var myResult = "";
    myResult     += "##CHECK_OUT=("+this.lineName+"):"+this.lineId+" / "+this.lineCheckOutDate.toNASString()+" / "+this.lineCheckOut +";\n";
    if(this.lineCheckInDate)
    myResult     += "##CHECK_IN=("+this.lineName+"):"+this.lineId+" / "+this.lineCheckInDate+" / "+this.lineCheckIn +";\n";
    return myResult
}
/*
    LineIssues
    issue  コレクション
    発行されたライン記述をパースする機能と文字列化する機能をオブジェクトメソッドで加える
    支線の発行/合流機能を持たせる
    LineIssues.branch(newIssue) : boranchedLines
     自分自身の現在のコピーをつくって新たなIssues オブジェクトで返す
    LineIssues.merge(LineIssues) : mergedLines
     与えられたIssuesをマージする。コンフリクト判定が必用
    LineIssues.parse(LineString) : initLinesItself
    


    本体にチェックインされてクローズされたブランチを戻す
    引数無しでコールされた場合、条件をチェックして可能なら本体をクローズする
    
    LineIssues.toString() : LineString
    LineIssues.valueOf() : currentIssue

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
/* branch(新規ライン名)
    ブランチ
    既存のラインと同名のブランチが指定された場合ブランチは失敗 false を戻す
    ただし現在の実装だと、支線側で親のラインを把握していないので 重複の可能性を排除できない
    DB接続時は、マスターDBに問い合わせを行う処理が必用
    最終的には同名のラインは許容される
*/
nas.Pm.LineIssues.prototype.branch=function(newLineName){
    for(var ix =0;ix<this.body.length;ix++){if(this.body[ix].lineName==newLineName) return false;};//重複をリジェクト
    var currentDepth    = this.body[this.currentId].lineId.split(":").length;//現在の分岐深度
    var branchCount     = 0;
    for(var ix =0;ix<this.body.length;ix++){if(this.body[ix].lineId.split(":").length==currentDepth) branchCount++;};
    var newBranchId     = (this.body[this.currentId].lineId=="0")? branchCount :this.body[this.currentId].lineId+":"+branchCount;
    var newIssue        = new nas.Pm.Issue(newLineName,newBranchId);
    this.body.push(newIssue);
    var newIssues       = new nas.Pm.LineIssues(newIssue);
    return newIssues;
}
/* merge(Issueオブジェクト)
//支線のIssues配列をマージする 今日は検査は保留20160505
マージの手順
マージされる側のラインのステータスを検査 startup,active,hold のラインはマージ不可 処理失敗
fixed,abortedのラインのみがマージ可能
マージ側のトランクに対する被マージ（親）側の該当するラインを閉じる（チェックイン）
同時にマージ側のラインを同じタイムスタンプで閉じる
親ラインに未登録のサブラインは、ここでマージされる。
この時点で発給されたラインにマージ（チェックイン）されていないラインはこれ以降のマージは親ラインに対して行なわれる。
＝クローズした子ラインに対するマージは、データの整合性を脅かすので禁止

*/
nas.Pm.statuses={"startup":0,"active":1,"hold":2,"fixed":3,"aborted":4};

nas.Pm.LineIssues.prototype.merge = function(myBranch){
    if(nas.Pm.statuses[myBranch.body[myBranch.currentId].currentStatus]<3) return false;
    //カレントラインがフィックスしていない場合失敗
    for(var ix=0;ix<this.body.length;ix++){
        if(this.body[ix].lineId==myBranch.body[0].lineId){
      //マージ側のラインが被マージ側にあるか否か確認
            if(typeof this.body[ix].lineCheckIn !="undefined"){
                return false;//既にマージ済みの場合もリジェクト
            }else{
                this.body[ix].lineCheckIn=nas.CURRENTUSER;
                this.body[ix].lineCheckInDate   =new Date();
                myBranch.body[0].lineCheckIn    =this.body[ix].lineCheckIn;//転記
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
nas.Pm.parseIssue = function(datastream){
    if(! datastream.match){return false};
//ラインで分割して配列に取り込み
    var SrcData     = new Array();
    if(datastream.match(/\r/)){datastream=datastream.replace(/\r\n?/g,("\n"))};
    SrcData=datastream.split("\n");
    var newIssues   = false;
    for (l=0;l<SrcData.length;l++){
        if(SrcData[l].match(/^\#\#([\[<A-Z][^=]+)=?(.*)$/)){var nAme=RegExp.$1;var vAlue=RegExp.$2;}
        switch (nAme){
        case "LINE_ID":
            if(! newIssues) {
                var myContent   = vAlue.split(":");
                var myLineName  = myContent[0].replace(/^\(|\)$/g,"");
       // alert("setupLine :"+myLineName);
                var myLineId    = myContent.slice(1,myContent.length).join(":");
                newIssues       = new nas.Pm.LineIssues(new nas.Pm.Issue(myLineName,myLineId));
            }else{continue;}
        break;
        case "CHECK_OUT":
        case "CHECK_IN":
            var myContentIssue  = vAlue.split(";")[0].split("/");
            var myIndex = myContentIssue[0].split(":");myIndex[1] = nas.chopString(myIndex[1]);
            var myDate          = myContentIssue.slice(1,myContentIssue.length-1).join("/");
            var myUser          = nas.chopString(myContentIssue[myContentIssue.length-1]);
            if((newIssues)&&(newIssues.body[newIssues.body.length-1].lineId==myIndex[1])){
                var myIssue     = newIssues.body[newIssues.body.length-1];
            }else{
                var myIssue     = new nas.Pm.Issue(myIndex[0].replace(/^\(|\)$/g,""),myIndex[1]);
                newIssues.body.push(myIssue);
            }
            if(nAme=="CHECK_OUT"){
                myIssue.lineCheckOut    = myUser;
                myIssue.lineCheckOutDate= new Date(myDate);
            }else{
                myIssue.lineCheckIn     = myUser;
                myIssue.lineCheckInDate = new Date(myDate);
            }
        break;
        case "currentStatus":
            newIssues.currentStatus  = nas.chopString(vAlue)  ;
        break;
        }
    }
    return newIssues;
}
/*
ライン情報は、１セットのxMap/Xpsに対して１種類発行される
Pm.PmUには同時に複数セットのラインが記録され 複数の

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
    toStringにXps保存用の形式も必要 ","区切りで倒置
*/
nas.TimeUnit = function(myName,myFrames){
    this.name   = myName;
    this.frames = myFrames;
this.toString   = function(myForm){
    if(myForm){
        return (this.name)?([nas.Frm2FCT(this.frames,3) , this.name ]).join(","):nas.Frm2FCT(this.frames,3);
    }else{ 
        return (this.name)? this.name+" ( "+nas.Frm2FCT(this.frames,3)+" )":nas.Frm2FCT(this.frames,3);
    }
}
this.valueOf = function(){return this.frames;}
}
/**
     カット用の時間記述を解釈してTimeUnitオブジェクトの配列で返す
    nas.parseTimeString("timeString")
    "1+12,OL(3+0),4+0" コンマ区切りでいくつでも配列で返す
    ⇒[{name:"time",frames:Frames-Int},{name:"tr-in",frames:Frames-Int},{name:"tr-out",frames:Frames-Int}]
 **解釈の幅を広げてパターン調整が必要
*/
nas.parseTimeString = function(myTimeString){
    var myTarget    = myTimeString.split(",");
    var myResult    = new Array();
    for (var t = 0; t < myTarget.length; t ++){
        myResult[t]   =new nas.TimeUnit();
        if(myTarget[t].match(/(.*)\(([^\)]+)\)$/)){
            myResult[t]   =new nas.TimeUnit(RegExp.$1,nas.FCT2Frm(RegExp.$2));
        }else{
            myResult[t]=new nas.TimeUnit("",nas.FCT2Frm(myTarget[t]));
        }
    }
    return myResult;
}
//test nas.pareseTimeString("12+6,trin(0),tr-out(0)");

/* nas.separateTitleString(titleString)
     識別文字列を分解して配列戻し
     カット識別文字列の詳細はドキュメントを参照
引数:カット識別文字列 "title.opus.scene.cut"
戻値:配列[cut,scene,opus,title]
例：
nas.separateTitleString("Title#12_s12-c#123B") == ["123B","12","12","Title"]
nas.separateTitleString("XAv/10/s-c0023") == ["0023","","10","XAv"]
セパレータは . / _ -
プレフィックスは Oo#Ss#Cc#
ポストフィックスはカット番号に含まれるものとします。＞必要にしたがって別途パースすること
*/
nas.separateTitleString = function(myName){
// alert(myName);
    var regSep      = new RegExp("[\\.\/\-]+","g");//セパレータ("_"以外)
    var myString    = myName.toString().replace(regSep,"_");//セパレータを統一
     myString       = myString.replace(/[cCｃＣsSｓＳoOｏＯ#＃№][#＃№]?([0-9]+)/g,"_$1")
// プレフィクスをセパレータに変換
// alert(myString);
     myString       = myString.replace(/_+/g,"_");//連続セパレータを縮小
// alert(myString);
    var myParse     = myString.split("_").reverse();
    var newCut      = (myParse.length>0)?myParse[0]:"";
// var newCut=(myParse.length>0)?new String(myParse[0]).replace(/^[cCｃＣ]?[#＃№]?/,""):"";
    var newScene    = (myParse.length>1)?new String(myParse[1]).replace(/^[sSｓＳ]?[#＃№]?/g,""):myScene;
// var newOpus      = (myParse.length>2)?new String(myParse[2]).replace(/^[oOｏＯ]?[#＃№]?/g,""):myOpus;
    var newOpus     = (myParse.length>2)?myParse[2]:myOpus;
    var newTitle    = (myParse.length>3)?myParse[3]:myTitle;
    return [newCut,newScene,newOpus,newTitle];
}
// nas.separateTitleString("Title#12_s12-c#123B");
// nas.separateTitleString("TitleO#12s#12c#123B");
// timeString
// 1+12 (trin:0+00)(trout:0+00)
// test
// var A=new SC("c012","s")
/** nas.Pm.Orgnization
    システム内で参照される組織の
*/
/** nas.Pm.Staff
作業許可/拒否の判定基準となるスタッフオブジェクト
.type   String  //自動設定スタッフエントリのタイプ識別名
.user   Object nas.UserInfo or null or * //
.duty   Object dutyName or null or * //
.section  Object sectionName or null or * //
.access 　bool  //アクセス権
.alias   String  //スタッフユーザの表示名称　ユーザ指定可能　デフォルトは""　データがある場合は、優先的にユーザハンドルと置換される

""(ヌルストリング)　nullエントリとして扱う
nullエントリは、自身を含む全てのエントリとマッチしない

特殊なエントリとして"*"(スターエントリ)を扱う
アクセス権を判定する場合、設定可能な全てのユーザとマッチする特殊なエントリ
*同士は判定対象外（マッチがおきない）
 
    以下のエントリは全ての部門、役職及びユーザのアクセスを禁止する （一般に指定されない）
false,"*","*","*"

    以下のエントリは演出部のユーザ全てのアクセスを許す
true,"*","*","演出"
    以下のエントリ役職が演出である演出部所属のユーザのアクセスを許す
true,"*","演出","演出"
    以下のエントリは役職が演出である全てのユーザのアクセスを許す、このエントリは上記のエントリの内容を包括する
true,"*","演出","*"
    以下のエントリは役職が演出でいずれの部門にも属さないユーザのアクセスを許す
true,"*","演出",""

    以下のエントリは演出部の全て役職のアクセスを許す
true,"*","*","演出"
*/
nas.Pm.Staff = function(user,duty,section,access,alias){
    this.type ;                             //String  タイプ識別名　section/duty/user
//    if(!(user instanceof nas.UserInfo)) user =new nas.UserInfo(user);
    this.user    = (user)? user:null;//Object nas.UserInfo or * or null
    this.duty    = (duty)? duty:null;       //StringID of duty
    this.section = (section)? section:null; //StringID of section
    this.access  = (typeof access == "undefined")? true:(access); //bool  アクセス権
    this.alias   = (alias)? alias:"";  //String  表示名称　ユーザ指定可能　デフォルトは""
    this.typeSet();
}
/*
  テキスト形式の指定を受けてスタッフオブジェクトを最初期化するオブジェクトメソッド
  palin形式の文字列は、単一レコードでは初期化に必要な情報に欠けるので扱わない
  dump形式のみを判定　それ以外はfullフォーマットとして扱う

*/
nas.Pm.Staff.prototype.parseStaff = function(staffString){
    if (staffString.match(/^\[([^\[]+)\]$/)) {;//]dump形式
        var myProps=JSON.parse(staffString);
        if (myProps.length!=5) return false;
        this.access  = myProps[0];
        this.alias   = myProps[1];
        this.user    = (myProps[2])? new nas.UserInfo(myProps[2]):null;
        this.duty    = myProps[3];
        this.section = myProps[4];
    } else {
        staffString= staffString.replace(/\s+/g,'\t');//空白をタブに置換
        var myProps = staffString.split('\t');//配列化
        if ((myProps.length<2)||(myProps.length>6)) return false;//フィールド数0,1,6~は不正データ
        this.access=myProps[0];//第一フィールドは、固定でアクセス可否
        //第二フィールド〜ラストまでループでチェック
        for (var ix=1;ix<myProps.length;ix++){
            if(myProps[ix].match(/^\*([^\*]+)\*$/)){
                this.section=RegExp.$1;
            }else if(myProps[ix].match(/^\[([^\[])\]$/)){
                this.duty=RegExp.$1;
            }else if(myProps[ix].match(/^[^:]+:[^:]+/)){
                this.user=new nas.UserInfo(myProps[ix]);
            }else{
                this.alias = myProps[ix]
            }
        }
        this.typeSet();
    }
    return this;
}
/*TEST

*/
/*
    データの内容を確認してtypeプロパティをセットする。
    同時に必要なエントリにスタープロパティを補う
    初期化以後プロパティの変更の際にコールする必要がある
*/
nas.Pm.Staff.prototype.typeSet = function(){
    if((this.user)&&(this.user!="*")){
        this.type = "user";
    }else{
        if((this.duty)&&(this.duty!="*")){
            this.type = "duty";
        }else if((this.section)&&(this.section!="*")){
            this.type = "section"; 
        }else{
            this.type = null;
        }
    }
    return this.type;
}
/*　　.samaAs
    同値判定用メソッド
    アクセス可否判定を含めてエントリが完全に一致した場合のみtrueを返す
    ユーザ情報はメールアドレスのみでなくハンドルまで一致した場合にtrue
*/
nas.Pm.Staff.prototype.sameAs = function(target){
    if(!(target instanceof nas.Pm.Staff)) return null; 
    var result = 0;
    //user プロパティに値がある　双方がUserInfoオブジェクトだった場合のみ文字列化して比較　それ以外は直接比較
    if(this.user){
      if ((this.user instanceof nas.UserInfo)&&(target.user instanceof nas.UserInfo)){
            if(this.user.toString()==target.user.toString()) result += 4;
      }else{
            if(this.user==target.user) result +=4;
      }
    }else{
    //値がない＞相手先に値がない場合のみマッチ　（nullが"",0,false等とマッチする）
        if(! target.user) result += 4;
    }
    if (this.duty){
        if(String(this.duty)==String(target.duty)) result += 2;//文字列比較
    }else{
        if(! target.duty) result += 2;        
    }
    if (this.section){
        if(String(this.section)==String(target.section)) result += 1;//文字列比較
    }else{
        if(! target.section) result += 1;        
    }
    if ((this.access)==(target.access)) result += 8 ;//比較先にアクセス権がなければ負数へ
    return (result==15);
}
/*TEST
 var A = new nas.Pm.Staff("*","*","作画");
 var B = new nas.Pm.Staff("","作画監督","作画");
 var C = new nas.Pm.Staff("","演出","");
 var D = new nas.Pm.Staff(new nas.UserInfo("kiyo:kiyo@nekomataya.info"),"作画監督","作画");
 D.alias="ねこまたや";

A.sameAs(A);
A.sameAs(B);
A.sameAs(C);
A.sameAs(D);
A.sameAs();
A.sameAs("kjsadhjakshdjkh");

B.parseStaff(A.toString("dump"))
*/

/*
    .compareWith(target)
    比較用に与えられたオブジェクトとの比較係数を返す
特殊エントリ "*"
    比較先が"*"エントリの場合、"*","",nullを除く全てのエントリに対してマッチが発生する
    比較元が"*"の場合は、 比較先"*"を含めてなにものにもマッチしない

    片方向判定を行うので、thisとtargetを入れ替えた場合の戻り値は一致しない

特殊エントリ　"" == null
    比較元が及び比較先が""またはnullの場合""同士、null同士を含めてマッチが発生しない
「比較先」のアクセス可否情報を見てfalseの場合　得られた係数を正負反転させて戻す。
（自身の可否情報は見ない　必要があれば戻り値に対して自身のアクセス可否情報を乗せる）

var A=[true   *      *     演出]
var B=[false  *      監督  演出]
var C=[true   タヌキ 監督  演出]
    として
    A.cpmpareWith(A)    result 1
    A.cpmpareWith(B)    result -1
    A.cpmpareWith(C)    result 1
    B.cpmpareWith(A)    result 3
    B.cpmpareWith(B)    result -3
    B.cpmpareWith(C)    result 3
    C.compareWith(A)　　result 7
    C.compareWith(B)　　result -7
    C.compareWith(C)　　result 7
    
用途: 自身に対する相手の比較係数を得て自身のアクセスの可否を判定するのが主
副用途として、エントリコレクション中の完全一致するエントリを検出して重複エントリの排除を行う?
--完全一致の判定が出来ない？
*/
nas.Pm.Staff.prototype.compareWith = function(target){
    if(!(target instanceof nas.Pm.Staff)) return false; 
    var result = 0;
//  一致条件 
//  相手先が nullと*以外の場合で自身が*　>マッチ
//  自身の値が存在して（null以外） ＞相手を判定　相手先が
//   ＞相手先問わずアンマッチ
//  自身と相手先の判別
    if (
        (this.user!="*")&&
        (((this.user)&&(target.user=="*"))||
        ((this.user instanceof nas.UserInfo)&&(this.user.sameAs(target.user))))
    )        result += 4;
    if (
        (this.duty!="*")&&
        (((this.duty)&&(target.duty=="*"))||
        (this.duty == target.duty))
    )       result += 2;
    if (
        (this.section!="*")&&
        ((this.section)&&(target.section=="*"))||
        ((this.section)&&(this.section == target.section))
    )       result += 1;
//比較先にアクセス権がなければ負数へ(自身のアクセス権は問わない)
    if (! target.access) result *= -1 ;
    return result;
}
/*TEST　(user,duty,section,access,alias)
var A=new nas.Pm.Staff("*","*","演出");
var B=new nas.Pm.Staff("*","監督","演出",false);
var C=new nas.Pm.Staff(new nas.UserInfo("タヌキ:tanuki@animal.example.com"),"監督","演出",true);
//    として
    console.log(A.compareWith(A))    ;//result 1
    console.log(A.compareWith(B))    ;//result -1
    console.log(A.compareWith(C))    ;//result 1
    console.log(B.compareWith(A))    ;//result 3
    console.log(B.compareWith(B))    ;//result -3
    console.log(B.compareWith(C))    ;//result 3
    console.log(C.compareWith(A))　　;//result 7
    console.log(C.compareWith(B))　　;//result -7
    console.log(C.compareWith(C))　　;//result 7
*/
/*
     文字列化して返す
     typeオプション
plainフォーマット
        'plain'
        
この書式は、スタッフコレクションから呼び出された時のみに意味を持つので注意
     sction
部門                  \t部門名
     duty
役職                  \t\t役職名
     user
ユーザ                \t\t\tハンドル:e-メール

スタッフコレクションの'plain'オプションに対応する機能


fullフォーマット     
        'full'

アクセス可否  UID [役職] *部門* 別名

    スペース区切りで、第一フィールドはアクセス可否
    最終フィールドは別名
    UIDは通常文字列
    役職はブラケットで囲む
    部門はスターで囲む
    それぞれのエントリが無い場合はフィールドごと省略するのでフィールド数は可変
   
dumpフォ−マット
        'dump'テキスト記録用文字列で返す

    [アクセス可否,"別名","UID","役職","部門"]
配列型文字列　フィールド数固定
        
    エントリーの全情報をカンマ区切りで出力する。
    コレクションのエントリ追加メソッドの引数形式

        
     上記以外の返り値の文字列はtypeにより異なる
     section（部門）エントリーはセクション名の前後に'*'を付けて返す
        ex:*演出* *作画*
    duty（役職）エントリーは役職名の前後をブラケットで囲んで返す
        ex:[監督][作画監督]
    部門エントリがあればそれを添付する
    
    ユーザエントリーは、ユーザの表示名を返す　オブジェクトに設定されたALIASまたはユーザ情報オブジェクトのハンドル
    
*/
nas.Pm.Staff.prototype.toString = function(type){
    if(type == 'plain'){
        var result=(this.access)?"\t":"FALSE\t";
        switch(this.type){
case "section":
        result += this.section;
break;
case "duty":
        result += "\t";
        result += this.duty;
break;
case "user":
        if(this.alias.length){this.user.handle=this.alias}
        result += "\t";
        result += "\t";
        result += this.user.toString(true);
break;
        }
        return result;
    }else if (type=='dump'){
        var result=(this.access)?[true]:[false];
        result.push(this.alias);
        result.push((this.user)?this.user.toString():'');
        result.push(this.duty);
        result.push(this.section);
        return JSON.stringify(result);
    }else if(type=='full'){
        var result='';
        result +=(this.access)? "":"-";
        if(this.user){
            result +="\t";
            result += (this.user instanceof nas.UserInfo)? this.user.toString():String(this.user);
        }
        if(this.duty){
            result +="\t";
            result += "["+String(this.duty)+"]";
        }
        if (this.section){
            result +="\t";
            result += "*"+String(this.section)+"*"  ;
        }
        if (this.alias){
            result +="\t";
            result += String(this.alias)  ;
        }
      return result;
    }else{
        var result='';
      switch(this.type){
        case "duty"   :
            result += "["+String(this.duty)+"]";
        break;
        case "section":
            result += "*"+String(this.section)+"*"  ;
        break;
        case "user"   :
            if(this.alias.length){
                result += String(this.alias);
            }else{
                result += String(this.user.handle);
            }
        break;
        default:
            return false;
      }
      return result;
    }
}
//test　初期化引数　user,duty,section,access,alias
/*
 var A = new nas.Pm.Staff("*","*","作画");
 var B = new nas.Pm.Staff("","作画監督","作画");
 var C = new nas.Pm.Staff("","演出","");
 var D = new nas.Pm.Staff(new nas.UserInfo("kiyo:kiyo@nekomataya.info"),"作画監督","作画");
 D.alias="ねこまたや";
F= new nas.Pm.StaffCollection(nas.pm);
F.addStaff([A,B,C,D]);

//console.log(F)
//A.sameAs(B);
D.sameAs(C);
*/
/** nas.Pm.StaffCollection
スタッフコレクションオブジェクト
スタッフを収集したスタッフコレクションをエントリノード毎に保持する
問い合わせに対して権利の解決を行う
ペアレント属性には、自身が所属するノードが格納される
ノードのペアレント属性に親子関係にあるノードがあるので、継承及び参照の解決は当該の情報パスをたどる。
コレクションのメンバー数が０の場合、コレクションは上位ディレクトリの内容を返す
.parent     Object      所属するノード　親ノードのstaffをアクセスするパスは this.parent.parent.staffs
.members    Array       オブジェクトトレーラー配列
.add()      Function    メンバー追加メソッド　戻り値 追加成功時 Object staff 失敗時 false
.addStaff() Function    設定ファイルのストリームからメンバーを追加？
.toString() Function    
.remove()   エントリを削除


*/
nas.Pm.StaffCollection = function(myParent){
    this.parent = myParent;
    this.members = [];
}
/*
toStringは、二種の出力フォーマットを持つ
 full/引数なし または dump
フルフォーマットは可読テキストとして出力
    第一フィールドに何らかのデータのあるレコードは拒否エントリになる
    第４フィールドはalias　個々にデータがある場合、そのエントリの表示名称として優先して使用される
        例　\t演出\t監督\t\tbigBoss
        例　\t作画\t原画\tcitten:cat@animals.example.com\tキティちゃん
    各フィールドの値として、h-tabは使用できない
ダンプフォーマットは、機械読み取り用のフォーマットでaddStaffメソッドの引数形式
    
*/
nas.Pm.StaffCollection.prototype.toString = function(form){
    var result="";
    switch (form){
    case "full":
        break;
    case "dump":
            for (var ix =0 ; ix<this.members.length;ix++){
                if (ix > 0) result +=",\n";
                result += this.members[ix].toString('dump');
            }
            result += '\n';
        return result;
        break;
    default:
        var result = new Array;
            for (var ix =0 ; ix<this.members.length;ix++){
                result.push(this.members[ix].toString());
            }
        return result.toString();
    }
}
/*
  コレクションをソートする
  ソート基準は
  部門　役職　ユーザ
  メンバーをタイプ別にわける
  タイプごとに部門でソートする
    部門エントリを抽出して　辞書ソート
    部門１エントリ毎に役職エントリを抽出して辞書ソート
    役職１エントリ毎にユーザエントリを抽出して
    役職エントリ  部門ソート　辞書ソート
    ユーザエントリ　部門ソート　役職ソート　辞書ソート

*/
nas.Pm.StaffCollection.prototype.sort = function(){
    
};
/*
    コレクション内の指定条件にマッチするエントリを新たなコレクションで返すメソッド
    引数　staffString
    フルフォーマット文字列
    "*演出*"    部門・演出　のエントリをタイプ問わず
    "*演出* [演出助手]","user"　部門・演出 && 役職・演出助手　のユーザエントリ
    " [作画監督]","section" 役職・作画監督　を含む部門エントリ
    '馬:hose@animal.example.com','duty' ユーザ・馬が所属する役職エントリ
エントリの問い合わせがあった場合、コレクションメンバーを検索してアクセスの可否を返す。
コレクションのエントリ数が０の場合のみ、親オブジェクトの持つスタッフコレクションに問い合わせを行いその結果を返す。
*/
nas.Pm.StaffCollection.prototype.getMenmber = function(staffString,type){
    var result=new nas.Pm.staffCollection(this.parent);
    var sect='';    var dut ='';    var usr ='';
}
/*    .parseStaff
    スタッフ初期化文字列をパースしてスタッフコレクションを更新するオブエジェクトメソッド
    引数はレコード改行区切りテキストストリーム
    受け入れ形式は3つ　形式をしているするか、またはストリームの第一レコードで判定
    いずれも行頭 '#'はコメント行　空行は無視 

    dump 引数配列形式
##_staff_template_type-dump
[アクセス可否,"別名","UID","役職","部門"]

    full スペース分離　不定フィールドテキスト
##_staff_template_type-full
アクセス	handle:UID	[役職]	*部門*	別名

    plain    タブ区切りフィールド
##_staff_template_type-plain
アクセス可否\t部門\t役職\tユーザ\t別名
            
*/
nas.Pm.StaffCollection.prototype.parseStaff = function(dataStream,form){
    var myStream = String(dataStream).split("\n");
    var myMembers =[];
    var myForm   = form;
    // 形式が指定されない場合は第一レコードで判定 第一レコード以外で形式指定しているデータは不正データとする
    if(! form ){
        if(myStream[0].indexOf('##_staff_template_type-full')==0)  form='full' ;
        else if(myStream[0].indexOf('##_staff_template_type-dump')==0)  form='dump' ;
        else if(myStream[0].indexOf('##_staff_template_type-plain')==0) form='plain';
        else {console.log('bad data-type');return false;}
    }
    if ((form == 'dump')||(form == 'full')){
      for (var rix=0;rix<myStream.length;rix++){
      if(myStream[rix].indexOf('#')==0) continue;
        var currentStaff=new nas.Pm.Staff();
        currentStaff.parseStaff(myStream[rix]);
        if (currentStaff) myMembers.push(currentStaff);
      }
    } else if (form == 'plain'){
      var currentSection;var currentDuty;
      for (var rix=0;rix.myStream.length;rix++) {
        if(myStream[rix].indexOf('#')==0) continue;
        var currentRecord=myStream[rix].split('\t');
        //plainフォーマットはタブ区切り　タブ１つは部門　２つで役職　３つでユーザ　ユーザ指定のレコードには別名の指定も可
        if(currentRecord[0]) {currenAccess   = (currentRecord[0].match(/\+|true/i))?true:false;}else{currenRecord.access=true;}
        if(currentRecord[1]) {
            currentSection = currentRecord[1];
            myMembers.push(new nas.Pm.Staff(null,null,currentSection,currentAccess,""));
        }
        if(currentRecord[2]) {
            currentDuty    = currentRecord[2];
            myMembers.push(new nas.Pm.Staff(null,currentDuty,currentSection,currentAccess,""));
        }
        if(currentRecord[3]) {
            var currentUser    = new nas.UserInfo(currentRecord[3]);
            var currentAlias   = (currentRecord[4])? currentRecord[4]:"";
            myMembers.push(new nas.Pm.Staff(currentUser,currentDuty,currentSection,currentAccess,currentAlias));
        }
      }        
    }
    return this.addStaff(myMembers);
}
/*
      ターゲットになるユーザまたはスタッフとコレクションの内容を比較して、
      一致したエントリIDを返すメソッド
      ヒットしなかった場合は　-1
*/
nas.Pm.StaffCollection.prototype.indexOf = function(target){
    for (var ix =0 ;ix <this.members.length;ix ++){
        if(this.members[ix].sameAs(target)) return ix;
    }
    return -1;
}
/*  スタッフの追加メソッド
    引数は　nas.Pm.Staff　オブジェクト
    引数形式は、Staffオブジェクトまたはオブジェクトの配列
    可読テキストの再ロードはparseStaffメソッドを利用
    parseStaffメソッドは、可読テキストをdump形式にコンバートしてこのメソッドを内部で呼び出す
    同内容のエントリがあった場合は追加されない。
    
    追加時に既存のsection/dutyエントリに存在しないプロパティを持ったuserエントリがあった場合は、
  　当該のエントリを新規に作成して追加する？　ユーザの設定を変更することになるのでコレは行わない　
    戻り値は、追加に成功したエントリ数（エントリ配列か？）
    
*/
nas.Pm.StaffCollection.prototype.addStaff = function(members){
    var result=0;
    if(!( members instanceof Array)) members = [members];
    for(var ix =0 ; ix<members.length;ix++){
      if(!(members[ix] instanceof nas.Pm.Staff)){
/*
        member[0]// access
        member[1]// alias
        member[2]// user
        member[3]// duty
        member[4]// section
*/
        var member=new nas.Pm.Staff();
        member.parseStaff(members[ix]);//文字列としてパースする　不正データの場合は初期化できないのでスキップ
      }else{
        var member = members[ix]
      }
//console.log(member)
      var checkHint = this.indexOf(member);
//console.log("checkHint :")      
//console.log(checkHint)      
//一致エントリがないので追加
      if (checkHint < 0){
        this.members.push(member);
        result ++;
//console.log('push member :'+member.toString('dump'));
        continue;
      }
    }
    return result;
}

nas.Pm.staff=new nas.Pm.StaffCollection(nas.Pm);
/*TEST
新設が必要な設定群
ユーザDB
    U-AT の場合はサーバから取得   Repository.pmd.users? この管理はサーバに任せて、スタッフだけもらうべき
    ローカルストレージ等の
スタッフDB
    部門、役職、ユーザを合成したスタッフDB
        Repository.pmd.staff ~ タイトル、エピソード、カット（ライン、ステージ）までのツリー状の構造の各所でそれぞれのデータを参照可能にするための構造
        
        

*/
