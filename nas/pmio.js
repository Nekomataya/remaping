/**
 *  pmio.js
 *  production managemaent io
 *
 *  nas.Pm は 管理情報を分離するためのオブジェクト群
 *
 *  PmUnitを中核にしてそれに含まれる被管理情報をオブジェクトとして保持する
 *
 *  PmUnitは Production(or Project) Management Unit(マネジメントユニット)を表す
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

ClassObject nas.Pm がアプリケーションとしてのテンプレートキャリア
初期状態ではnas.pmdbを実アクセスポイントとして参照を置く
nas.pmdb  は、リポジトリ切り替え毎に各リポジトリの.pmdbに参照先が切り替えられる？

    nas.pmdb.organizations
         関連組織一覧　組織情報コレクション
            プライマリエントリーとしてpmdbの組織情報をエントリーする
            他組織のエントリは、接続情報のみでusersには通常自身のエントリのみを複製する
    nas.pmdb.users
         関連ユーザ一覧　ユーザ情報コレクション
    nas.pmdb.staff
        スタッフ一覧　スタッフコレクション

    nas.pmdb.lines
        ライン一覧テーブル   ラインコレクション
    nas.pmdb.stages
        ステージ一覧テーブル  ステージコレクション
    nas.pmdb.pmTemplates
        制作管理テンプレートコレクション
            ラインテンプレート（ライン定義）
                ラインテンプレートの内容は自分自身と自分で保持するステージコレクション
    nas.pmdb.jobNames
        ジョブテンプレートコレクション
        
    nas.pmdb.workTitles
        .workTitles[titleIndex].episodes
            .episodes[episodeIndex].works ?

	nas.pmdb.products
		
	nas.pmdb.assets
		アセット情報コレクション
			制作時に管理対象となるアセットの定義テーブル
    nas.pmdb.medias
    	制作メディアコレクション
    		制作に供されるメディア情報のトレーラー

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


// products/workTitles はPmクラスのみに存在するキャッシュオブジェクトなので要注意
   nas.Pm.products	リポジトリ内に記録されたエピソード単位のキャッシュ
   nas.Pm.workTitles	同、作品単位のデータコレクション

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

organization:
repository:
   product
    title:
     opus:
      pmu:
      cut:
    

pmdbの各オブジェクトにはユニークなプロパティを格納するunique配列をもたせる
この配列に値がある場合、新規メンバー登録の比較条件としてそのプロパティを参照する
RDBMのuniqueインデックスの付いたフィールドに同じ

*/

nas.Pm = {};
//nas.Pm.organization = new nas.Pm.Organization() 
nas.Pm.users        = new nas.UserInfoCollection();
nas.pmdb            = nas.Pm;

/*
    PmDomain オブジェクトは、制作管理上の基礎データを保持するキャリアオブジェクト
    制作管理ディレクトリノード毎に保持される。
    基礎データを必要とするプログラムに基礎データをサービスする
    基本データが未登録の場合は親オブジェクトの同データを参照してサービスを行う

case:localRepository    
    localRepository.pmdb = new nas.Pm.PmDomain(localRepository);
case:NetworkRepository
    NetworkRepository.pmdb = new nas.Pm.PmDomain(NetworkRepository);
*/
nas.Pm.PmDomain=new function(myParent){
    this.parent=myParent;
    this.users;     //
    this.staff;     //
    this.lines;     //
    this.stages;    //
    this.jobNames;  //
    this.organization
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
            (target.members[prp].mediaName   ==keyword)||
            (target.members[prp].shortName   ==keyword)||
            (target.members[prp].fullName    ==keyword)||
            (target.members[prp].code        ==keyword) ) return prp;
    }
    return false;
}
/*
    コレクションメンバーキャリアが配列の場合は以下を使用
    使えないかも
*/
nas.Pm.searchPropA = function(keyword,target){
    if(! target.unique) return false;
    //メンバー総当たり
    for (var mix = 0 ; mix < target.menbers.length ; mix ++){
    //オブジェクトのプロパティ内で　unique情報のあるプロパティのみを検索
        for (var uix = 0 ; uix < target.unique.length ; uix ++){
            if(
                ((target.members[mix][target.unique[uix]].sameAs)&&(target.members[mix][target.unique[uix]].sameAs(keyword))) ||
                (target.members[mix][target.unique[uix]].toString()==keyword)
            ) return target.members[mix]
        }
    }
    return null;
}

/**
    クラスメソッド　nas.Pm.searchPropを使ってキーを検索して対応するメンバーを返すオブジェクトメソッド
    検索に失敗したケースではnullを戻す
    引数を与えない場合に限り、メンバー内の最初のエントリを戻す
    これは　デフォルトエントリとして使用される
    デフォルトエントリを必ず最初に登録する必要がある
    通常は各コレクションの.entryメソッドにマッピングされる
*/
nas.Pm._getMember = function(keyword){
    if(typeof keyword=='undefined'){for (itm in this.members){return this.members[itm];break;}}
    if(this.members[keyword]) return this.members[keyword];
    var prp = nas.Pm.searchProp(keyword,this);
    if(prp){return this.members[prp]}else{return null}
}

/**
    コレクションメンバーをテキストとしてダンプ出力するメソッド　汎用
    対象コレクション
 nas.Pm.OrganizationCollection //nas.pmdb.Organizations.dump();
 nas.Pm.WorkTitleCollection //nas.pmdb.workTitles.dump();
 nas.Pm.MediaCollection     //nas.pmdb.medias.dump();
 nas.Pm.AssetCollection     //nas.pmdb.assets.dump();
 nas.Pm.StageCollection     //nas.pmdb.stages.dump();
 nas.Pm.LineCollection      //nas.pmdb.lines.dump();

 nsa.Pm.//nas.pmdb.jobNames.dump(true);　これは別わけ　コレクションの構造が異なる
 nas.pmdb.//nas.pmdb.pmTemplates.dump(true);
    
    引数なし        メンバーあたり1要素のカンマ区切りテキスト  改行なし
                    代表値　例えばステージならばステージ名を単独でコンマ区切りで戻す

     plain/text     プレーンテキスト　文章形式 config.pmdb用
                    可読性の高い平文フォーマット改行あり
                    １要素１行とは限らないので注意

    full/dump      プレーンテキスト設定ファイル用のダンプストリーム　config.pmdb用
                   コレクションの　addMember メソッドで直接処理可能なテキストデータの配列を改行区切りで出力する
                   １要素１レコード

    JSON        JSONによるダンプ 汎用的なデータ交換用
                オブジェクトごとに戻りデータは構造が異なる

データ形式の複雑なものは汎用メソッドを使用せずに専用メソッドを持つ
ただし仕様は汎用メソッドに準ずる
*/
nas.Pm._dumpList = function(form){
    switch (form){
    case "JSON":
        //コレクションのキャリアが配列ベースの場合
        if(this.members instanceof Array){
        var result = [];
            for (var ix =0 ; ix<this.members.length;ix++){
                result.push(JSON.parse((this.members[ix].dump)?this.members[ix].dump(form):this.members[ix].toString(form)));
            }
       }else{
        //キャリアがオブジェクトベースの場合
        var result = {};
            for (var prp in this.members){
                result[prp]=JSON.parse((this.members[prp].dump)?this.members[prp].dump(form):this.members[prp].toString(form));
            }
        }
        return JSON.stringify(result);
        break;
    case "full-dump":
    case "full":
    case "dump":
        var result="";
        //コレクションのキャリアが配列ベースの場合
        if(this.members instanceof Array){
            for (var ix =0 ; ix<this.members.length;ix++){
//                if (ix > 0) result +=",\n";
                if (ix > 0) result +="\n";
                result += (this.members[ix].dump )? this.members[ix].dump('full'):this.members[ix].toString('full');
            }
            result += '\n';
       }else{
         //キャリアがオブジェクトベースの場合
            for (var prp in this.members){
                result += '"'+prp+'",';
                result += (this.members[prp].dump)? this.members[prp].dump('full') : this.members[prp].toString('full');
                result += '\n';
            }
        }
        return result;
        break;
    case 'plain-text':
    case 'plain':
    case 'text':
    default:
        var result = new Array;
        //コレクションのキャリアが配列ベースの場合
        if(this.members instanceof Array){
            for (var ix =0 ; ix<this.members.length;ix++){
                result.push((this.members[ix].dump)? this.members[ix].dump(form) : this.members[ix].toString(form));
            }
       }else{
        //キャリアがオブジェクトベースの場合
            for (var prp in this.members){
                result.push((this.members[prp].dump)? this.members[prp].dump(form) : this.members[prp].toString(form));
            }
        }
        return result.join((form)? '\n':',');
    }
}
/*      コレクションオブジェクトのメンバ追加オブジェクト
    引数  メンバオブジェクトの配列
    戻値  追加に成功したエントリ数
    重複メンバーは登録しない
    重複の条件は、Collection.unique配列を参照　いずれかのバッティングを（_getMember() で）検出

*/
nas.Pm._addMembers = function(members){
    var result = 0;
    if(!(members instanceof Array)) members = [members];
if (this.members instanceof Array){
    for (var ix = 0 ; ix < members.length ; ix++ ){
        var tempMember = members[ix];
        var conflict = false;
        if((this.unique)&&(this.entry)){
            for (var uix = 0 ; uix < this.members.length ; uix++ ){
                if (this.entry(tempMember[this.unique[uix]])!=null){ conflict = true;break;}
            }
        }
        if(! conflict){
            var idx = this.members.add(tempMember)>=0;
            if(ix == idx) result++;
        }
    }
}else{
    for (var ix = 0 ; ix < members.length ; ix++ ){
        var tempMember = members[ix];
        var conflict = false;
        for (var uix = 0 ; uix < this.unique.length ; uix++ ){
            if (this.entry(tempMember[this.unique[uix]])!=null){ conflict = true;break;}
        }
        if(! conflict){
            this.members[tempMember[this.unique[0]]]=tempMember;
            result++;
        }
    }
}
    return result;
}
/*
 コレクションオブジェクトの設定読み込みメソッド
    不正データの排除と重複データの排除はコレクションのaddMembersメソッドが受け持つ
    これは使用されない　メンバーごとのオブジェクトの相関が記述できていない　9/3
*/
/*
nas.Pm._parseConfig = function(dataStream,form){
    var myMembers =[];
    // 形式が指定されない場合は、第一有効レコードで判定
    if(! form ){
            if (dataStream.match(/\[\s*(\{[^\}]+\}\s*,\s*)+(\{[^\}]+\})?\s*\]/)) form='JSON';//配列JSON
            else if (dataStream.match(/(\n|^)\s*\[\s*.+\]($|\n)/)) form='full-dump';
            else  form='plain-text';
    }
    switch(form){
    case    'JSON':
        var tempObject=JSON.parse(dataStream);
        for (var rix=0;rix<tempObject.length;rix++){
            var currentMember=new nas.Pm.Object(
                tempObject[rix].
                
            );
            currentMember[]=tempObject[rix][];
            
            myMembers.push(currentMember);
        }
    break;
    case    'full-dump':	
        dataStream = String(dataStream).split("\n");
        for (var rix=0;rix<dataStream.length;rix++){
            if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
            var currentMember=new nas.Pm.Object(
            );
            currentMember.parse(dataStream[rix]);
            if (currentMember) myMembers.push(currentMember);
        }
    break;
    case    'plain-text':
    default:
        dataStream = String(dataStream).split("\n");
      var currentMember=false;
      for (var rix=0;rix<dataStream.length;rix++) {
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
        var currentField=dataStream[rix];
plainフォーマット
entryName
	prop:value
	prop:value

        if((currentMember)&&(currentField.match(/^\t([^:])+:(.+)/))){
        	currentMember[RegExp.$1]=RegExp.$2;
        } else if(currentField.match(/^[a-z].*$/)) {
        	if(currentMember) myMembers.push(currentMember);
        	currentMember=new nas.Pm.Object(currentField);
        }
      }
      myMembers.push(currentMember);
    }
    return this.addStaff(myMembers);
}
*/
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
    this.jobs       = [];//空配列で初期化 コレクションが望ましい
    this.stageID    ;
    this.stages     = [];//空配列で初期化 コレクションが望ましい
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
引数：　form 文字列可形式　html,plain,
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
//制作管理用 Organizationオブジェクト　各Repositoryに対応する
/*
nas.Pm.Organization(組織名)

    name        =;//識別名　            eg."nekomataya"
    fullName    =;//正式名称            eg.'ねこまたや'
    code        =;//省略コード          eg.'nkmt'
    id          =;//DB接続用Index　     eg.'0001'
    serviceUrl  =;//サービス接続情報    eg.'localRepository:info.nekomataya.pmdb'
    shortName   =;//表示用短縮名　      eg.'(ね)'
    contact     =;//コンタクト情報 　   eg.'ねこまたや;//nekomataya@nekomataya.info'
    description =;//説明　所在住所等自由記述

オブジェクトメソッドで初期化する
戻り値は組織情報オブジェクト
実運用上はDBとリンクして動作するように調整
初期化段階ではプライマリオブジェクトとしてRepositoryに関連付けられた組織一つだけが登録される

Organization.usersには、pmdbのusersへの参照か　またはカレントのuserのみを登録した一時的ユーザコレクションを用いる？　
*/
nas.Pm.Organization = function(repoitoryName){
    this.name        =repoitoryName;
    this.fullName    =repoitoryName;
    this.code        =String(repoitoryName).slice(0,4);
    this.id          ;
    this.serviceUrl  ='localRepository:info.nekomataya.pmdb';
    this.shortName   =String(repoitoryName).slice(0,2);
    this.contact     =repoitoryName;
    this.description =""; 
}
nas.Pm.Organization.prototype.toString = function(form){
    switch(form){
    case 'full-dump':
    case 'full':
    case 'dump':
        return JSON.stringify([
            this.fullName,
            this.code,
            this.id,
            this.serviceUrl,
            this.shortName,
            this.contact,
            this.description
        ]);
    break;
    case    'plain-text':
    case    'plain':
    case    'text':
        var result=[
            this.name,
            "\tfullName:"+this.fullName,
            "\tcode:"+this.code,
            "\tid:"+this.id,
            "\tserviceUrl:"+this.serviceUrl,
            "\tshortName:"+this.shortName,
            "\tcontact:"+this.contact,
            "\tdescription:"+this.description
        ];
            return result.join('\n');
    break;
    case    'JSON':
        return JSON.stringify({
            "name":this.name,
            "fullName":this.fullName,
            "code":this.code,
            "id":this.id,
            "serviceUrl":this.serviceUrl,
            "shortName":this.shortName,
            "contact":this.contact,
            "description":this.contact
        });
    break;
    default:
        if(this[form]){
          return this[form]
        }else{
            return this.name;
        }
    }
}
/**
組織コレクション
プライマリの組織はデータベースを維持する組織本体の情報

*/
nas.Pm.OrganizationCollection = function(myParent){
    this.parent = myParent;
    this.members = {};
    this.unique =["name","id","fullName","serviceUrl","shortName","code"];
}
nas.Pm.OrganizationCollection.prototype.entry = nas.Pm._getMember;
nas.Pm.OrganizationCollection.prototype.addMembers = nas.Pm._addMembers;
nas.Pm.OrganizationCollection.prototype.dump = nas.Pm._dumpList;
/*
    設定パーサ
*/
nas.Pm.OrganizationCollection.prototype.parseConfig = function(configStream){
    if(String(configStream).length==0) return false;
    var newMembers=[];
    this.members = {};//clear
    var form = 'plain-text';
    if(configStream.match(/\{[^\}]+\}/)){
        form = 'JSON';
    } else if(configStream.match(/.+\,\[.+\]/)){
        form = 'full-dump';
    }
    switch(form){
    case 'JSON':
        var configData=JSON.parse(configStream);
        for(prp in configData){
            var tempData = configData[prp];
            var newEntry         = new nas.Pm.Organization(prp);
            newEntry.fullName    = tempData.fullName;
            newEntry.code        = tempData.code;
            newEntry.id          = tempData.id;
            newEntry.serviceUrl  = tempData.serviceUrl;
            newEntry.shortName   = tempData.shortName;
            newEntry.contact     = tempData.contact;
            newEntry.description   = tempData.description;
            newMembers.push(newEntry);
        }
    break;
    case 'full-dump':
        configStream=String(configStream).split('\n');
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            var tempData = JSON.parse("["+configStream[ir]+"]");
            var newEntry         = new nas.Pm.Organization(tempData[0]);
            newEntry.fullName    = tempData[1][0];
            newEntry.code        = tempData[1][1];
            newEntry.id          = tempData[1][2];
            newEntry.serviceUrl  = tempData[1][3];
            newEntry.shortName   = tempData[1][4];
            newEntry.contact     = tempData[1][5];
            newEntry.description = tempData[1][6];
            newMembers.push(newEntry);
        }
    break;
    default:
        configStream=String(configStream).split('\n');
        var currentEntry=null;
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(currentEntry)){
                currentEntry[RegExp.$1]=RegExp.$2;//プロパティ設定
            }else{
                if (currentEntry) newMembers.push(currentEntry);
                currentEntry=new nas.Pm.Organization(configStream[ir]);
            }
        }
        newMembers.push(currentEntry);
    }
    return this.addMembers(newMembers);
}

nas.Pm.organizations = new nas.Pm.OrganizationCollection(nas.Pm);

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
//****************************************************************
//    this.pmTemplates;    //作品内の標準工程テンプレート 不要
//   this.staff; //作品のスタッフ一覧　スタッフコレクションオブジェクト　不要
//    this.opuses = new nas.Pm.OpusCollection(this);    //Object nas.Pm.OpusCollection タイトル配下の話数コレクション　不要
//****************************************************************
//UATサーバのためのプロパティ
    this.token = this.id;
    this.name = this.projectName;
    this.updated_at;
    this.created_at;  
    this.description;//タイトル識別子として使用？
}
/* タイトル文字列化
引数
    なし          プロジェクト名で返す
    propName      一致したプロパティを単独で返す 文字列またはオブジェクト
    "full"        設定ダンプ形式 
    "plain"       設定ダンプ形式 プレーンテキスト　ダンプと同形式？
    "JSON"          データ交換用JSONフォーマット
*/
nas.Pm.WorkTitle.prototype.toString = function(form){
    switch (form){
    case    'full-dump':
    case    'full':
    case    'dump':
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
    break;
    case    'plain-text':
    case    'plain':
    case    'text':
        var result=[
            this.projectName,
            "\tid:"+this.id,
            "\tfullName:"+this.fullName,
            "\tshortName:"+this.shortName,
            "\tcode:"+this.code,
            "\tframerate:"+this.framerate.toString(true),
            "\tformat:"+nas.Frm2FCT(this.length,2),
            "\tinputMedia:"+this.inputMedia,
            "\toutputMedia:"+this.outputMedia
        ];
            return result.join('\n');
    break;
    case    'JSON':
        return JSON.stringify({
            "projectName":this.projectName,
            "id":this.id,
            "fullName":this.fullName,
            "shortName":this.shortName,
            "code":this.code,
            "framerate":this.framerate.toString(true),
            "format":nas.Frm2FCT(this.length,2),
            "inputMedia":this.inputMedia,
            "outputMedia":this.outputMedia
        });
    break;
    default:
        if(this[form]){
            return this[form];
        }else{
            return this.projectName;
        }
    }
}
nas.Pm.WorkTitle.prototype.valueOf=function(){return this.id;}
/**
       ワークタイトルコレクションオブジェクト
       一般に組織の配下に入るが、システム配下のリセント情報としても利用される
*/
nas.Pm.WorkTitleCollection = function(myParent){
    this.parent  = myParent;
    this.members = {};
    this.unique =["projectName","id","fullName","shortName","code"];
}
nas.Pm.WorkTitleCollection.prototype.entry = nas.Pm._getMember;
nas.Pm.WorkTitleCollection.prototype.addMembers = nas.Pm._addMembers;
nas.Pm.WorkTitleCollection.prototype.dump = nas.Pm._dumpList;
/*
function(keyword){
    if(keyword){  return this.entry(keyword)};
    return JSON.stringify(this.members);
}
*/
/*
    タイトル登録メソッド
    引数  メンバーオブジェクトの配列
    戻値  エントリに成功したメンバー数

    重複メンバーは登録しない
    重複の条件は、projectName,id,fullName,shortName,code　いずれかのバッティングを検出（_getMember）
    他のプロパティは比較対象外
    propListの形式は
    projectName,[id,fullName,shortName,code,framerate,format,inputMedia,outputMedia]
*/
/*
function(members){
    var result = 0;
    if(!(members instanceof Array)) members = [members];
    for (var ix = 0 ; ix < members.length ; ix++ ){
        var tempTitle = members[ix];
        if( (this.entry(tempTitle.projectName)==null)&&
            (this.entry(tempTitle.id)==null)&&
            (this.entry(tempTitle.fullName)==null)&&
            (this.entry(tempTitle.shortName)==null)&&
            (this.entry(tempTitle.code)==null)
        ){
            this.members[tempTitle.projectName]=tempTitle;
            result++;
        }
    }
    return result;
}
*/
/*
    設定パーサ
*/
nas.Pm.WorkTitleCollection.prototype.parseConfig = function(configStream){
    if(String(configStream).length==0) return false;
    var newMembers=[];
    this.members = {};//clear
    var form = 'plain-text';
    if(configStream.match(/\{[^\}]+\}/)){
        form = 'JSON';
    } else if(configStream.match(/.+\,\[.+\]/)){
        form = 'full-dump';
    }
    switch(form){
    case 'JSON':
        var configData=JSON.parse(configStream);
        for(prp in configData){
            var tempData = configData[prp];
            var newTitle         = new nas.Pm.WorkTitle();
            newTitle.projectName = prp;
            newTitle.id          = tempData.id;
            newTitle.fullName    = tempData.fullName;
            newTitle.shortName   = tempData.shortName;
            newTitle.code        = tempData.code;
            newTitle.framerate   = new nas.Framerate(tempData.framerate);
            newTitle.length      = nas.FCT2Frm(tempData.format);
            newTitle.inputMedia  = tempData.inputMedia;
            newTitle.outputMedia = tempData.outputMedia;
            newMembers.push(newTitle);
        }
    break;
    case 'full-dump':
        configStream=String(configStream).split('\n');
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            var tempData = JSON.parse("["+configStream[ir]+"]");
            var newTitle         = new nas.Pm.WorkTitle();
            newTitle.projectName = tempData[0];
            newTitle.id          = tempData[1][0];
            newTitle.fullName    = tempData[1][1];
            newTitle.shortName   = tempData[1][2];
            newTitle.code        = tempData[1][3];
            newTitle.framerate   = new nas.Framerate(tempData[1][4]);
            newTitle.length      = nas.FCT2Frm(tempData[1][5]);
            newTitle.inputMedia  = tempData[1][6];
            newTitle.outputMedia = tempData[1][7];
            newMembers.push(newTitle);
        }
    break;
    default:
        configStream=String(configStream).split('\n');
        var currentTitle=null;
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(currentTitle)){
                var prop = RegExp.$1;var value = RegExp.$2;
                switch(prop){
                case 'format':currentTitle['length']=nas.FCT2Frm(value);//納品フォーマット尺
                break;
                case 'framerate':currentTitle['framerate'] = new nas.Framerate(value);
                break;
                default:currentTitle[prop] = value;
                }
            }else{
                if (currentTitle) newMembers.push(currentTitle);
                currentTitle=new nas.Pm.WorkTitle();
                currentTitle.projectName=String(configStream[ir]);
            }
        }
        newMembers.push(currentTitle);
    }
    return this.addMembers(newMembers);
}
/*  タイトル登録メソッド　試験用
    パーサのfull-dumpの部分
*/
nas.Pm.WorkTitleCollection.prototype.addTitle = function(titleName,propList){
    var newTitle         = new nas.Pm.WorkTitle();
    newTitle.projectName = titleName;
    newTitle.id          = propList[0];
    newTitle.fullName    = propList[1];
    newTitle.shortName   = propList[2];
    newTitle.code        = propList[3];
    newTitle.framerate   = new nas.Framerate(propList[4]);
    newTitle.length      = nas.FCT2Frm(propList[5]);
    newTitle.inputMedia  = propList[6];
    newTitle.outputMedia = propList[7];

    this.addMembers(newTitle);
}

//テンプレート用コレクション
/*
    UI上で参照されるコレクション
    使用したタイトルを記録してテンプレートとして利用
    recentTitles
    プロダクションオブジェクトの配下のコレクションは別に設定される
*/
nas.Pm.workTitles = new nas.Pm.WorkTitleCollection(nas.Pm);

nas.Pm.activeTitle = nas.Pm.workTitles.entry();
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
    this.id         = myID          ;//DB接続用index　UATtoken
    this.name       = myOpus        ;//表示名 話数／制作番号等 UATname
    this.subtitle   = mySubtitle    ;//サブタイトル文字列 UATdescription
    this.title      = myTitle       ;//String タイトルキー　または　Object　nas.Pm.WorkTitle
    this.valueOf    = function(){return this.id};
//    this.pmunits ;//カット袋コレクション 不要
}

nas.Pm.newOpus = function(identifier,index){
    if(! identifier) return false;
    var arg = Xps.parseIdentifier(identifier);
    if(arg){
        return new nas.Pm.Opus(index,arg.opus,arg.subtitle,arg.title);
    }else{
        return arg;
    }
}
/**
引数
    なし          識別名を返す
    propName      一致したプロパティを単独で返す 文字列またはオブジェクト
    "full"        設定ダンプ形式 
    "plain"       設定ダンプ形式 プレーンテキスト　ダンプと同形式？
    JSON          データ交換用JSONフォーマット
toStringメソッド　引数がなければ識別子用の文字列を返す
引数を与えると設定ファイル形式のJSONを返す
*/
nas.Pm.Opus.prototype.toString   = function(form){
    switch (form){
    case 'full':
        return JSON.stringify([
            this.id,
            this.name,
            this.subtitle,
            this.title
        ]);
    break;
    case    'plain':
        var result=[
            this.name,
            "\tid:"+this.id,
            "\tname:"+this.name,
            "\tsubTitle:"+this.subtitle,
            "\ttitle:"+this.title.toString()
        ];
            return result.join('\n');
    break;
    case    'JSON':
        return JSON.stringify({
            "id":this.id,
            "name":this.name,
            "subTitle":this.subtitle,
            "title":this.title.toString()
        });
    break;
    default:
    //デフォルトは識別子を組んで返す
    return this.title+"#"+this.name+(this.subtitle)?"["+this.subtitle+"]":"";
    }
};
/**
    各話（エピソード）コレクションオブジェクト　OpusCorrection
    一般にタイトルの配下に入るが、システム配下でキャッシュとしても利用
*/
nas.Pm.OpusCollection = function(myParent){
    this.parent  = myParent;//parentTitle
    this.members = {};
    this.unique =["name","id"];
}
nas.Pm.OpusCollection.prototype.entry = nas.Pm._getMember;
nas.Pm.OpusCollection.prototype.addMembers = nas.Pm._addMembers;
nas.Pm.OpusCollection.prototype.dump =  nas.Pm._dumpList;
/*


nas.Pm.OpusCollection.prototype.addMembers = function(members){
    var result = 0;
    if(!(members instanceof Array)) members = [members];
    for (var ix = 0 ; ix < members.length ; ix++ ){
        var tempOpus = members[ix];
        if( (this.entry(tempOpus.name)==null)&&
            (this.entry(tempOpus.id)==null)
        ){
            this.members[tempOpus.name]=tempOpus;
            result++;
        }
    }
    return result;

}
*/
/*
    設定パーサ
*/
nas.Pm.OpusCollection.prototype.parseConfig = function(configStream){
    if(String(configStream).length==0) return false;
    var newMembers=[];
    this.members = {};//clear
    var form = 'plain-text';
    if(configStream.match(/\{[^\}]+\}/)){
        form = 'JSON';
    } else if(configStream.match(/.+\,\[.+\]/)){
        form = 'full-dump';
    }
    switch(form){
    case 'JSON':
        var configData=JSON.parse(configStream);
        for(prp in configData){
            var tempData = configData[prp];
            var newOpus  = new nas.Pm.Opus(tempData.id,prp,tmpData.subtitle,this.parent.entry(tempData.title));
            newMembers.push(newTitle);
        }
    break;
    case 'full-dump':
        configStream=String(configStream).split('\n');
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            var tempData = JSON.parse("["+configStream[ir]+"]");
            var newOpus  = new nas.Pm.Opus(tempData.id,prp,tmpData.subtitle,this.parent.entry(tempData.title));
            newMembers.push(newTitle);
        }
    break;
    default:
        configStream=String(configStream).split('\n');
        var currentOpus=null;
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(currentOpus)){
                currentOpus[RegExp.$1]=RegExp.$2;//プロパティ設定
            }else{
                if (currentOpus) newMembers.push(currentOpus);
                currentOpus=new nas.Pm.WorkTitle();
                currentOpus.projectName=String(configStream[ir]);
            }
        }
        newMembers.push(currentOpus);
    }
    return this.addMembers(newMembers);
}


nas.Pm.opuses= new nas.Pm.OpusCollection(nas.Pm);

//メディアDB
/*
メディアDBは、入出力のメディアスペックを記述するための複合オブジェクト
MAP内部ではワークタイトルに付属する情報として処理する
animationField,framerate,baseResolution等は、オブジェクトで保持
初期化時は、デフォルトの値で作成　再初期化が必用
idは初期化時は未設定
コレクション加入時に設定される
DBとの連結時は連結時に再設定
*/
nas.Pm.ProductionMedia = function(mediaName,animationField,framerate){
    this.id             ;
    this.animationField = new nas.AnimationField(animationField);
    this.mediaName      = mediaName;//
    this.baseResolution = new nas.UnitResolution();//
    this.type           ;//mediaType drawing/video
    this.baseWidth      = this.animationField.baseWidth;
    this.frameAspect    = this.animationField.frameAspect;
    this.framerate      = nas.newFramerate(framerate);
    this.tcType         ;//string tradJA/SMPTE/TC/frame
    this.pegForm        = this.animationField.peg;//animationField.peg
    this.pegOffset      = this.animationField.pegOffset;
    this.pixelAspect    ;//float
    this.description    ;
}
/*

*/
nas.Pm.ProductionMedia.prototype.toString = function(form){
    switch (form){
    case 'JSON':
        return JSON.stringify({
            "mediaName"     :this.mediaName,
            "id"            :this.id,
            "animationField":this.animationField.toString(),
            "baseResolution":this.baseResolution.toString(),
            "mediaType"     :this.mediaType,
            "tcType"        :this.tcType,
            "pegForm"       :this.pegForm.toString(),
            "pixelAspect"   :this.pixelAspect,
            "description"   :this.description
        });
    break;
    case 'dump':
    case 'full':
        return JSON.stringify([
            this.id,
            this.animationField.toString(),
            this.baseResolution.toString(),
            this.mediaType,
            this.tcType,
            this.pegForm.toString(),
            this.pixelAspect,
            this.description
        ]);
    break;
    case 'plain':
    case 'text':
        return ([
            this.mediaName,
            "\tid:"+this.id,
            "\tanimationField:"+this.animationField.toString(),
            "\tbaseResolution:"+this.baseResolution.toString(),
            "\tmediaType:"+this.mediaType,
            "\ttcType:"+this.tcType,
            "\tpegForm:"+this.pegForm.toString(),
            "\tpixelAspect:"+this.pixelAspect,
            "\tdescription:"+this.description
        ]).join('\n');
    break;
    default:
        return this.mediaName;
    }
}
//
nas.Pm.MediaCollection= function(myParent){
    this.parent  = myParent;
    this.members = {};
//    this.unique =["mediaName","id"];
    this.unique =["mediaName"];
}
nas.Pm.MediaCollection.prototype.entry = nas.Pm._getMember;
nas.Pm.MediaCollection.prototype.addMembers= nas.Pm._addMembers;
nas.Pm.MediaCollection.prototype.dump = nas.Pm._dumpList;
/*
    コレクションメンバー登録メソッド
    引数  メンバーオブジェクト配列
    戻値  エントリに成功したメンバー数
    重複メンバーは登録しない
    重複の条件は、mediaName,id　いずれかのバッティングを検出（_getMember）
    他のプロパティは比較対象外
    full-dump の形式は
    mediaName,[id,animationField,baseResolution,mediaType,tcType,pegForm,pixelAspect,description]
nas.Pm.MediaCollection.prototype.addMembers=function(members){
    var result = 0;
    if(!(members instanceof Array)) members = [members];
    for (var ix = 0 ; ix < members.length ; ix++ ){
        var tempOpus = members[ix];
        if( (this.entry(tempOpus.mediaName)==null)&&
            (this.entry(tempOpus.id)==null)
        ){
            this.members[tempOpus.name]=tempOpus;
            result++;
        }
    }
    return result;
}
*/
/*
*/
nas.Pm.MediaCollection.prototype.parseConfig = function(configStream){
    if((! configStream)||(String(configStream).length==0)) return false;
    var newMembers=[];
    this.members = {};//clear
    var form = 'plain-text';
    if(configStream.match(/\{[^\}]+\}/)){
        form = 'JSON';
    } else if(configStream.match(/.+\,\[.+\]/)){
        form = 'full-dump';
    }
    switch(form){
    case 'JSON':
        var configData=JSON.parse(configStream);
        for(prp in configData){
            var tempData = configData[prp];
            var newMedia  = new nas.Pm.ProductionMedia(tempData.mediaName,tempData.animationField,tempData.framerate);
                newMedia.id             = tempData.id;
//              newMedia.mediaName      = tempData.mediaName;//
//              newMedia.animationField = tempData.new nas.AnimationField(tempData.animationField);
//              newMedia.baseWidth      = newMedia.animationField.baseWidth;
//              newMedia.frameAspect    = newMedia.animationField.frameAspect;
//              newMedia.pegForm        = newMedia.animationField.peg;//animationField.peg
//              newMedia.pegOffset      = newMedia.animationField.pegOffset;
                newMedia.baseResolution = new nas.UnitResolution(tempData.baseResolution);//
                newMedia.type           = tempData.type;//mediaType drawing/video
//              newMedia.framerate      = nas.newFramerate(tempData.framerate);
                newMedia.tcType         = tempData.tcType;//string tradJA/SMPTE/TC/frame
                newMedia.pixelAspect    = parseFloat(tempData.pixelAspect);//float
                newMedia.description    = tempData.description;
            newMembers.push(newMedia);
        }
    break;
    case 'full-dump':
        configStream=String(configStream).split('\n');
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            var tempData = JSON.parse("["+configStream[ir]+"]");
            var newMedia  = new nas.Pm.ProductionMedia(tempData[0],tempData[1][1]);
    newMedia.id             = tempData[1][0];
//    newMedia.animationField = tempData[1][1];//new nas.AnimationField(animationField);
//    newMedia.mediaName      = tempData[0];// mediaName;//
    newMedia.baseResolution = tempData[1][2];// new nas.UnitResolution();//
    newMedia.type           = tempData[1][3];// ;//mediaType drawing/video
//    newMedia.baseWidth      = ;// newMedia.animationField.baseWidth;
//    newMedia.frameAspect    = ;// newMedia.animationField.frameAspect;
//    newMedia.framerate      = ;// nas.newFramerate(framerate);
    newMedia.tcType         = tempData[1][4];// ;//string tradJA/SMPTE/TC/frame
    newMedia.pegForm        = tempData[1][5];// newMedia.animationField.peg;//animationField.peg
//    newMedia.pegOffset      = newMedia.animationField.pegOffset;
    newMedia.pixelAspect    = parseFloat(tempData[1][6])  ;//float
    newMedia.description    = tempData[1][7];

            newMembers.push(newMedia);
        }
    break;
    case 'plain-text':
    default:
        configStream=String(configStream).split('\n');
        var currentMedia=false;
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(currentMedia)){
                currentMedia[RegExp.$1]=RegExp.$2;//プロパティ設定
            }else{
                if (currentMedia) newMembers.push(currentMedia);
                currentMedia=new nas.Pm.ProductionMedia(configStream[ir]);
            }
        }
        newMembers.push(currentMedia);
    }
    return this.addMembers(newMembers);


    if(   (this.entry(mediaName)==null)&&
        (this.entry(propList[0])==null)
    ){
        var tempMedia = new nas.Pm.ProductionMedia(mediaName);
        var tempField = new nas.AnimationField(
            name,
            basewidth,
            frameaspect,
            scale,
            pegform,
            pegOffset
        );
        tempMedia.id              = (propList[0]=='')? nas.Zf(Object.keys(this.members).length,4):propList[0];
        tempMedia.animationField  = propList[1];//現在は文字列のまま
    // 本日は仕様変更が主眼なのでこのまま保留　12/04
        tempMedia.baseResolution  = propList[2];
        tempMedia.mediaType       = propList[3];
        tempMedia.tcType          = propList[4];//nas.Framerate Objectする場合は nas.newFramerate(this.tcType)
        tempMedia.pegForm         = propList[5];
        tempMedia.pixelAspect     = propList[6];
        tempMedia.description     = propList[7];
        this.members[mediaName]=tempMedia;
    }
}


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
/*
nas.Pm.MediaCollection.prototype.addMembers = function (members){
    if(!(members instanceof Array)) members =[members];
    for (var ix=0 ;ix< members.length;ix++) this.addMember(members[ix])
}
*/
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
    this.assetName      ;
    this.name           ;
    this.hasXPS         ;
    this.code           ;
    this.shortName      ;
    this.description    ;
    this.endNode        ;
    this.callStage      ;
}

nas.Pm.Asset.prototype.toString = function(form){
    switch (form) {
    case 'JSON':
        return JSON.stringify({
            name:this.name,
            hasXPS:this.hasXPS,
            code:this.code,
            shortName:this.shortName,
            descripion:this.description,
            endNode:this.endNode,
            callStage:this.callStage
        });
    case 'full-dump':
    case 'full':
    case 'dump':
        return JSON.stringify([
            this.name,
            this.hasXPS,
            this.code,
            this.shortName,
            this.description,
            this.endNode,
            this.callStage
        ]);
    case 'plain-text':
    case 'plain':
    case 'text':
        return ([
            this.assetName,
            '\tname:'+this.name,
            '\thasXPS:'+this.hasXPS,
            '\tcode:'+this.code,
            '\tshortName:'+this.shortName,
            '\tdescription:'+this.description,
            '\tendNode:'+this.endNode,
            '\tcallStage:'+this.callStage
        ]).join('\n');
    default:
        return this.name;
//        return nas.Pm.searchProp(this.name,nas.pmdb.assets);
    }
}
/**
    アセットコレクション
*/
nas.Pm.AssetCollection = function(myParent){
    this.parent  = myParent;
    this.members = {};
    this.unique = ["assetName","name","code","shortName"];
}
nas.Pm.AssetCollection.prototype.entry = nas.Pm._getMember;
nas.Pm.AssetCollection.prototype.addMembers = nas.Pm._addMembers;
nas.Pm.AssetCollection.prototype.dump = nas.Pm._dumpList;

//アセット登録メソッド
nas.Pm.AssetCollection.prototype.addAsset = function(assetName,propList){
    this.members[assetName]             = new nas.Pm.Asset();
    this.members[assetName].assetName   = assetName;
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
/*データパーサ

*/
nas.Pm.AssetCollection.prototype.parseConfig =function(configStream){
    if(String(configStream).length==0) return false;
    var newMembers=[];
    this.members = {};//clear
    var form = 'plain-text';
    if(configStream.match(/\{[^\}]+\}/)){
        form = 'JSON';
    } else if(configStream.match(/.+\,\[.+\]/)){
        form = 'full-dump';
    }        
    switch(form){
    case    'JSON':
        var configData=JSON.parse(configStream);
        for(prp in configData){
            var tempData = configData[prp];
            var newEntry        = new nas.Pm.Asset();
            newEntry.assetName   = prp;
            newEntry.name        = tempData.name;
            newEntry.hasXPS      = tempData.hasXPS;
            newEntry.code        = tempData.code;
            newEntry.shortName   = tempData.shortName;
            newEntry.description = tempData.description;
            newEntry.endNode     = tempData.endNode;
            newEntry.callStage   = tempData.callStage;
            newMembers.push(newEntry);
        }
    break;
    case    'full-dump':
    case    'full':
    case    'dump':
        configStream=String(configStream).split('\n');
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            var tempData = JSON.parse("["+configStream[ir]+"]");
            var newEntry         = new nas.Pm.Asset();
            newEntry.assetName    = tempData[0];
            newEntry.name        = tempData[1][0];
            newEntry.hasXPS      = tempData[1][1];
            newEntry.code        = tempData[1][2];
            newEntry.shortName   = tempData[1][3];
            newEntry.description = tempData[1][4];
            newEntry.endNode     = tempData[1][5];
            newEntry.callStage   = tempData[1][6];
            newMembers.push(newEntry);
        }
    break;
    case    'plain-text':
    case    'plain':
    case    'text':
    default:
        configStream=String(configStream).split('\n');
        var currentEntry=false;
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(currentEntry)){
                currentEntry[RegExp.$1]=(RegExp.$1=='callStage')?(RegExp.$2).split(','):RegExp.$2;//プロパティ設定
            }else{
                if (currentEntry) newMembers.push(currentEntry);
                currentEntry=new nas.Pm.Asset();
                currentEntry.assetName=String(configStream[ir]);
            }
        }
        newMembers.push(currentEntry);
    }
    return this.addMembers(newMembers)
}

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
        this.unique =["line"];
};
/*テンプレートコレクションメンバー追加メソッド
配列型のみを受け取る
重複チェックはなし　上書き
*/
nas.Pm.PmTemplateCollection.prototype.addTemplate = function(templates){
        if(! templates[0] instanceof Array){templates = [templates];}
    for (var eid = 0;eid<templates.length ; eid ++){
        //引数: トレーラーオブジェクトの参照,ライン識別名,ステージコレクションの内容配列
        this.members[eid] = new nas.Pm.LineTemplate(this,templates[eid][0],templates[eid][1]);
    }
};
nas.Pm.PmTemplateCollection.prototype.entry = nas.Pm._getMember;
nas.Pm.PmTemplateCollection.prototype.addMembers = nas.Pm._addMembers;
/*
    設定データストリームパーサ
*/
nas.Pm.PmTemplateCollection.prototype.parseConfig = function(dataStream,form){
    if(! dataStream) return false;
    var myMembers =[];
    // 形式が指定されない場合は、第一有効レコードで判定
    if(! form ){
            if (dataStream.match(/\[\s*(\{[^\}]+\}\s*,\s*)+(\{[^\}]+\})?\s*\]/)) form='JSON';//配列JSON
            else if (dataStream.match(/(\n|^)\[.+\]($|\n)/)) form='full-dump';
            else  form='plain-text';
    }
    switch(form){
    case    'JSON':
        var tempObject=JSON.parse(dataStream);
        for (var rix=0;rix<tempObject.length;rix++){
            var currentMember=new nas.Pm.LineTemplate(
                this,
                tempObject[rix].line,
                tempObject[rix].stages
            );
            myMembers.push(currentMember);
        }
    break;
    case    'full-dump':	
        dataStream = String(dataStream).split("\n");
        for (var rix=0;rix<dataStream.length;rix++){
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
            var currentRecord=JSON.parse(dataStream[rix]);
            var currentMember=new nas.Pm.LineTemplate(
                this,
                currentRecord[0],
                currentRecord[1]
            );
            if (currentMember) myMembers.push(currentMember);
        }
    break;
    case    'plain-text':
    default:
        dataStream = String(dataStream).split("\n");
      var currentMember=false;
      for (var rix=0;rix<dataStream.length;rix++) {
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
        var currentField=dataStream[rix];
/*plainフォーマット
entryName
	prop:value
	prop:value
*/
        if((currentMember)&&(currentField.match( /^\t([a-z]+)\:(.+)$/i ))){
            if(RegExp.$1=='stages'){
                var stages=(RegExp.$2).split(',');
                for (var sid=0;sid<stages.length;sid++){
                   currentMember.stages.addStage(stages[sid],currentMember.parent.parent.stages.entry(stages[sid]));
                }
            }else{
        	    currentMember[RegExp.$1]=RegExp.$2;//追加プロパティ用
        	}
        } else if(currentField.match( /^.+$/i )) {
        	if(currentMember) myMembers.push(currentMember);
        	currentMember = new nas.Pm.LineTemplate(this,currentField,[]);
        }
      }
      myMembers.push(currentMember);
    }
    return this.addMembers(myMembers);
}
nas.Pm.PmTemplateCollection.prototype.dump = nas.Pm._dumpList;
/**
    ラインテンプレート　ステージデータコレクションを持つ
引数
myParent    
lineName    ライン識別名称
[myStarges]   ラインの標準的なステージ並びを配列で与える 空配列で初期化可能

*/
nas.Pm.LineTemplate = function(myParent,lineName,myStages){
    if (!(myStages instanceof Array)) myStages = [myStages];
    this.parent = myParent;//親参照は不要？
    this.line   = this.parent.parent.lines.getLine(lineName);
    this.stages = new nas.Pm.StageCollection(this);
    for (var ix=0;ix< myStages.length;ix++){
        var stageKey= nas.Pm.searchProp(myStages[ix],this.parent.parent.stages)
        this.stages.addStage(stageKey,this.parent.parent.stages.entry(stageKey));
    }
};
/*
toString(true)　でテキスト設定形式で書き出す

*/
nas.Pm.LineTemplate.prototype.toString = function(form){
    switch(form){
    case 'JSON':
        return JSON.stringify({
           line: this.line.toString(),
           stages:(this.stages.dump()).split(',')
        });
    case 'full-dump':
    case 'full':
    case 'dump':
      return JSON.stringify([
        this.line.toString(),
        (this.stages.dump()).split(',')
      ]);
    break;
    case 'plain-text':
    case 'plain':
    case 'text':
      return ([
        this.line.toString(),
        '\tstages:'+this.stages.dump()
      ]).join('\n');
    break;
    default:
        return this.line.toString();
    }
};

nas.Pm.pmTemplates = new nas.Pm.PmTemplateCollection(nas.Pm);

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
    this.name           = myName;//*
    this.stage          = myStage;
// if(! myStage){alert("stage Argument is :"+myStage)}
    this.type           ;
    this.id             = (typeof myIndex == "undefined")? null:myIndex;//*
    this.currentStatus  ;//
    this.createUser     ;//
    this.createDate     = new Date();//
    this.updateUser     ;//
    this.updateDate     ;//
    this.slipNumber     ;//*
};
nas.Pm.ProductionJob.prototype.getPath = function(){return [this.name,this.stage.getPath()].join(".");}

nas.Pm.ProductionJob.prototype.toString = function(){
    var myResult        = "";
// myResult            += "##["+this.stage.name+"][["+this.name+"]"+"id:"+this.id+"]\n";
    myResult            += "##[["+this.name+"]"+"id:"+this.id+"]\n";
    myResult            += "##created="+this.createDate+"/"+this.createUser+";\n";
    myResult            += "##updated="+this.createDate+"/"+this.createUser+";\n";

    if(this.manager)    myResult += "##manager="+this.manager+";\n";
    if(this.worker)     myResult += "##worker="+this.worker+";\n";
    if(this.slipNumber) myResult += "##slipNumber="+this.slipNumber+";\n";

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
//    myResult+="##[["+this.name+"]]/\n";//終了子をここでは出力しない　呼び出し側で処置　
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
    this.jobName   = jobName    ;
    this.targetStage  = targetStage;
    this.jobType   = jobType    ;
};
nas.Pm.JobTemplate.prototype.toString = function(form){
    switch(form){
    case    'JSON':
        return JSON.stringify({
            jobName:this.jobName,
            targetStage:this.targetStage,
            jobType:this.jobType
        });
    break;
    case    'full-dump':
    case    'full':
    case    'dump':
        return JSON.stringify([this.jobName,this.targetStage,this.jobType]);
    break;
    case    'plain-text':
    case    'plain':
    case    'text':
        return ([
            this.jobName,
            "\ttargetStage:"+this.targetStage,
            "\tjobType:"+this.jobType
        ]).join('\n');
    break;
    default:
        return this.jobName;
    }
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
nas.Pm.JobTemplateCollection.prototype.addMembers = nas.Pm._addMembers;
/**
    テンプレート取得
    引数に従ってJobテンプレートから必要な集合を抽出して返す
引数:
    ステージキーワード   layout LO レイアウト　等
    ジョブタイプ  init/primary/check/* ジョブタイプ'*'は primary+check (! init)
*/
nas.Pm.JobTemplateCollection.prototype.getTemplate = function(stage,type){
    if((! stage)||(! type)){return []};
    var result=[];
    for (var eid = 0;eid<this.members.length ; eid ++){
        if((this.members[eid].jobType == type)||(this.members[eid].jobType == "*")||(type == "*")&&(this.members[eid].jobType != "init")){
            if((this.parent.stages.getStage(this.members[eid].targetStage) === this.parent.stages.getStage(stage))||(this.members[eid].targetStage == "*")){
                var jobName         = this.members[eid].jobName;
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
nas.Pm.JobTemplateCollection.prototype.dump = nas.Pm._dumpList;
/*  設定パーサ
nas.Pm.JobTemplate (jobName,targetStage,jobType)
*/
nas.Pm.JobTemplateCollection.prototype.parseConfig = function(dataStream,form){
    var myMembers =[];
    // 形式が指定されない場合は、第一有効レコードで判定
    if(! form ){
            if (dataStream.match(/\[\s*(\{[^\}]+\}\s*,\s*)+(\{[^\}]+\})?\s*\]/)) form='JSON';//配列JSON
            else if (dataStream.match(/(\n|^)\[.+\]($|\n)/)) form='full-dump';
            else  form='plain-text';
    }
    switch(form){
    case    'JSON':
        var tempObject=JSON.parse(dataStream);
        for (var rix=0;rix<tempObject.length;rix++){
            var currentMember=new nas.Pm.JobTemplate(
                tempObject[rix].jobName,
                tempObject[rix].targetStage,
                tempObject[rix].jobType
            );
            myMembers.push(currentMember);
        }
    break;
    case    'full-dump':	
        dataStream = String(dataStream).split("\n");
        for (var rix=0;rix<dataStream.length;rix++){
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
            var currentRecord=JSON.parse(dataStream[rix]);
            var currentMember=new nas.Pm.JobTemplate(
                currentRecord[0],
                currentRecord[1],
                currentRecord[2]
            );
            if (currentMember) myMembers.push(currentMember);
        }
    break;
    case    'plain-text':
    default:
        dataStream = String(dataStream).split("\n");
      var currentMember=false;
      for (var rix=0;rix<dataStream.length;rix++) {
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
        var currentField=dataStream[rix];
/*plainフォーマット
entryName
	prop:value
	prop:value
*/
        if((currentMember)&&(currentField.match( /^\t([a-z]+)\:(.+)$/i ))){
        	currentMember[RegExp.$1]=RegExp.$2;
        } else if(currentField.match( /^.+$/i )) {
        	if(currentMember) myMembers.push(currentMember);
        	currentMember = new nas.Pm.JobTemplate(currentField);
        }
      }
      myMembers.push(currentMember);
    }
    return this.addMembers(myMembers);
}
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
 * ステージ内では、コレクションを parent プロパティで示す　従って親のラインを参照するパスは this.parent.line
*/
nas.Pm.ProductionStage=function(myName,myParent){
    this.parent=myParent;
    this.name=myName;
    this.code;
    this.shortName;
    this.description;
    this.output;
    this.stageName;
}
//nas.Pm.ProductionStage.prototype.getPath=function(){return [this.name,this.parent.line.getPath()].join(".")}
nas.Pm.ProductionStage.prototype.getPath=function(){return [this.name,this.line.getPath()].join(".")}
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
    
    switch(form){
    case 'JSON':
        return JSON.stringify({
            name:this.name,
            code:this.code,
            shortName:this.shortName,
            description:this.description,
            output:this.output,
            stageName:this.stageName
        });
    break;
    case 'full-dump':
    case 'full':
    case 'dump':
        return JSON.stringify([
            this.name,
            this.code,
            this.shortName,
            this.description,
            this.output
        ]);
    break;
    case 'plain-text':
    case 'plain':
    case 'text':
        return ([
            this.stageName,
            "\tname:"+this.name,
            "\tcode:"+this.code,
            "\tshortName:"+this.shortName,
            "\tdescription:"+this.description,
            "\toutput:"+this.output
        ]).join('\n');

    default:
    return this.name;
    }
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
    this.unique =["stageName","name","code","shortName"];
}

nas.Pm.StageCollection.prototype.dump = nas.Pm._dumpList;
nas.Pm.StageCollection.prototype.getStage = nas.Pm._getMember;
nas.Pm.StageCollection.prototype.entry = nas.Pm._getMember;
nas.Pm.StageCollection.prototype.addMembers = nas.Pm._addMembers
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
    this.members[stageName].stageName   = stageName;
    }
}

/*
設定パーサ
*/
nas.Pm.StageCollection.prototype.parseConfig = function(configStream){
    if(String(configStream).length==0) return false;
    var newMembers=[];
    this.members = {};//clear
    var form = 'plain-text';
    if(configStream.match(/\{[^\}]+\}/))          form = 'JSON';
    else if(configStream.match(/.+\,\[.+\]/)) form = 'full-dump';
    switch(form){
    case 'JSON':
        var configData=JSON.parse(configStream);
        for(prp in configData){
            var tempData = configData[prp];
            var newStage         = new nas.Pm.ProductionStage(prp,this);
            newStage.stageName   = prp;
            newStage.name        = tempData.name;
            newStage.code        = tempData.code;
            newStage.shortName   = tempData.shortName;
            newStage.description = tempData.description;
            newStage.output      = tempData.output;
            newMembers.push(newStage);
        }
    break;
    case 'full-dump':
        configStream=String(configStream).split('\n');
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            var tempData = JSON.parse("["+configStream[ir]+"]");
            var newStage         = new nas.Pm.ProductionStage(tempData[1][0],this);
            newStage.stageName   = tempData[0];
            newStage.name        = tempData[1][0];
            newStage.code        = tempData[1][1];
            newStage.shortName   = tempData[1][2];
            newStage.description = tempData[1][3];
            newStage.output      = tempData[1][4];
            newMembers.push(newStage);
        }
    break;
    default:
        configStream=String(configStream).split('\n');
        var currentStage=false;
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(currentStage)){
                currentStage[RegExp.$1]=RegExp.$2;//プロパティ設定
            }else{
                if (currentStage) newMembers.push(currentStage);
                currentStage=new nas.Pm.ProductionStage(configStream[ir],this);
                currentStage.stageName=String(configStream[ir]);
            }
        }
        newMembers.push(currentStage);
    }
    return this.addMembers(newMembers);
}
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

nas.Pm.ProductionLine=function(lineName){
    this.lineName;
    this.name;
    this.shortName;
    this.outputAsset;
    this.initAsset;
    this.code;
    this.description;
}

nas.Pm.ProductionLine.prototype.getPath = function(){return this.name;}

nas.Pm.ProductionLine.prototype.toString = function(form){
    switch (form){
    case 'JSON':
        return JSON.stringify({
            name:this.name,
            shortName:this.shortName,
            outputAsset:((this.outputAsset)?this.outputAsset.toString():this.outputAsset),
            initAsset:((this.initAsset)?this.initAsset.toString():this.initAsset),
            code:this.code,
            description:this.description
        });
    break;
    case 'full-dump':
    case 'full':
    case 'dump':
        return JSON.stringify([
            this.name,
            this.shortName,
            (this.outputAsset)?this.outputAsset.toString():this.outputAsset,
            (this.initAsset)?this.initAsset.toString():this.initAsset,
            this.code,
            this.description
        ]);
    break;
    case 'plain-text':
    case 'plain':
    case 'text':
        return ([
            this.lineName,
            '\tname:'+this.name,
            '\tshortName:'+this.shortName,
            '\toutoputAsset:'+((this.outputAsset)?this.outputAsset.toString():null),
            '\tinitAsset:'+((this.initAsset)?this.initAsset.toString():null),
            '\tcode:'+this.code,
            '\tdescription:'+this.description
        ]).join('\n');
    break;
    default:
        return this.name
    }
};
/*    ラインストア

クラス内でDBとして働くコレクションオブジェクト
このオブジェクトがタイトルの下に入り上位オブジェクトがDBと通信する
*/
nas.Pm.LineCollection = function(myParent){
    this.parent  = myParent;
    this.members = {};
    this.unique =["lineName","name","code","shortName"];
}

nas.Pm.LineCollection.prototype.dump = nas.Pm._dumpList;
//function(){    return JSON.stringify(this.members);}
nas.Pm.LineCollection.prototype.addMembers = nas.Pm._addMembers;

/**
ラインテンプレートの中から指定された名前と一致するオブジェクトを戻す
lineNameと一致していればそのまま、一致するものがない場合はname/shortName/codeを検索してその順で最初に一致したものを戻す
*/
nas.Pm.LineCollection.prototype.getLine = nas.Pm._getMember;
nas.Pm.LineCollection.prototype.entry = nas.Pm._getMember;

/*設定パーサ

*/

nas.Pm.LineCollection.prototype.parseConfig =function(configStream){
    if(String(configStream).length==0) return false;
    var newMembers=[];
    this.members = {};//clear
    var form = 'plain-text';
    if(configStream.match(/\{[^\}]+\}/)){
        form = 'JSON';
    } else if(configStream.match(/.+\,\[.+\]/)){
        form = 'full-dump';
    }        
    switch(form){
    case    'JSON':
        var configData=JSON.parse(configStream);
        for(prp in configData){
            var tempData = configData[prp];
            var newLine         = new nas.Pm.ProductionLine();
            newLine.lineName    = prp;
            newLine.name        = tempData.name;
            newLine.shortName   = tempData.shortName;
            newLine.outputAsset = tempData.outputAsset;
            newLine.initAsset   = tempData.initAsset;
            newLine.code        = tempData.code;
            newLine.description  = tempData.description;
            newMembers.push(newLine);
        }
    break;
    case    'full-dump':
    case    'full':
    case    'dump':
        configStream=String(configStream).split('\n');
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            var tempData = JSON.parse("["+configStream[ir]+"]");
            var newLine         = new nas.Pm.ProductionLine();
            newLine.lineName    = tempData[0];
            newLine.name        = tempData[1][0];
            newLine.shortName   = tempData[1][1];
            newLine.outputAsset = tempData[1][2];
            newLine.initAsset   = tempData[1][3];
            newLine.code        = tempData[1][4];
            newLine.description = tempData[1][5];
            newMembers.push(newLine);
        }
    break;
    case    'plain-text':
    case    'plain':
    case    'text':
    default:
        configStream=String(configStream).split('\n');
        var currentLine=false;
        for(var ir = 0;ir<configStream.length;ir++){
            if((configStream[ir].indexOf("#")==0)||(configStream[ir].length==0)) continue;//コメント/空行スキップ
            if((configStream[ir].match( /^\t([a-z]+)\:(.+)$/i ))&&(currentLine)){
                currentLine[RegExp.$1]=RegExp.$2;//プロパティ設定
            }else{
                if (currentLine) newMembers.push(currentLine);
                currentLine=new nas.Pm.ProductionLine();
                currentLine.lineName=String(configStream[ir]);
            }
        }
        newMembers.push(currentLine);
    }
    return this.addMembers(newMembers)
}
/*
    ライン編集メソッド
*/

nas.Pm.LineCollection.prototype.addLine =function(lineName,propList){
    this.members[lineName]              =new nas.Pm.ProductionLine();
    this.members[lineName].lineName     =lineName;
    this.members[lineName].name         =propList[0];
    this.members[lineName].shortName    =propList[1];
    this.members[lineName].outputAsset  =nas.Pm.assets.entry(propList[2]);
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
nas.Pm.newSC("ktc#01.s-c123","3+12,OL(1+12),--(0+0)",framerate)

*/
/**
 * SCオブジェクトコンストラクタ
 * コンストラクタの引数は、分離を終えた状態で与える
 * プロパティの不足は呼び出し側（newSCi）で行う
 * コンストラクタ内でのチェックはしない
 */
nas.Pm.SCi = function SC(cutName,sceneName,myOpus,myTitle,myTime,myTRin,myTRout,myRate,myFrate,myId){
    this.id         = myId ;//DB連結用 DBに接続していない場合はundefined
    this.cut        = cutName;//
    this.scene      = sceneName;//
    this.opus       = myOpus;//Object nas.Pm.Opus
    this.title      = myTitle;//Object nsa.Pm.WorkTitle参照
    this.time       = myTime;//ここでは静的プロパティ  フレーム数で記録
    this.trin       = myTRin;//[0,"trin"];//後で初期化
    this.trout      = myTRout;//[0,"trout"];//後で初期化
    this.framerate  = myFrate; //Object nas.Framerate;
}
nas.Pm.newSCi = function(idString,index){
    var mySCi=Xps.parseIdentifier(idString)
    var mySC= new nas.PM.SC(
        mySCi.cut,
        mySCi.scene,
        mySCi.opus,
        mySCi.title,
        nas.FCT2Frm(mySCi.time),
        "",
        "",
        mySCi.framerate
    )
    return mySC
}


nas.Pm.SCi.prototype.toString =function(){
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
        myResult+=["s",this.scene,"-c",this.cut].join("");
    }
       return myResult;
};//
nas.Pm.SCi.prototype.valueOf =function(){return this.id;};//

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
    return new nas.Pm.SCi(myInfo[0],myInfo[1],myOpus,myTimeInfo[0],myTimeInfo[1],myTimeInfo[2],myRate);
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
/*
    IssueにJSONの入出力を設置する必用あり
*/
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
nas.Pm.LineIssues.prototype.valueOf =function(){return this.body[this.id]};
/*
    Issue
*/
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
  テキスト形式の指定を受けてスタッフオブジェクトを再初期化するオブジェクトメソッド
  palin形式の文字列は、単一レコードでは初期化に必要な情報に欠けるのでここでは扱わない
  StaffCollectionのメソッドのみが受け付ける
  ここではdump形式のみを判定　それ以外はfullフォーマットとして扱う
*/
nas.Pm.Staff.prototype.parseStaff = function(staffString){
    if (staffString.match(/^\[([^\[\]]+)\]$/)) {;
/*
[access ,alias  ,user   ,duty   ,section]
    dump format
*/
        var myProps=JSON.parse(staffString);
        if (myProps.length!=5) return false;
        this.access  = (String(myProps[0]).match(/-|false/i))?false:true;
        this.alias   = myProps[1];
        this.user    = (myProps[2])? new nas.UserInfo(myProps[2]):null;
        this.duty    = myProps[3];
        this.section = myProps[4];
    } else {
//full format
/*
Access *SECTION* [DUTY] handle:email ALIAS

    Access　以外は順不同
    ALIAS は、スタッフユーザの表示エイリアスなのでuserエントリがnullの場合は意味を持たないことに注意
*/
        staffString= staffString.replace(/\s+/g,'\t');//空白をタブに置換
        var myProps = staffString.split('\t');//配列化
        if ((myProps.length<2)||(myProps.length>6)) return false;//フィールド数0,1,6~は不正データ
        this.access=(myProps[0].match( /-|false/i ))?false:true;//第一フィールドは、固定でアクセス可否 bool
        //第二フィールド〜ラストまでループでチェック
        for (var ix=1;ix<myProps.length;ix++){
            if(myProps[ix].match(/^\*([^\*]+)\*$/)){
                this.section=RegExp.$1;// *SECTION*
            }else if(myProps[ix].match(/^\[([^\]]+)\]$/)){
                this.duty=RegExp.$1;// [duty]
            }else if(myProps[ix].match(/^[^:]+:[^:]+/)){
                this.user=new nas.UserInfo(myProps[ix]);// Handle:email
            }else{
                this.alias = myProps[ix]
            }
        }
    }
    this.typeSet();
    return this;
}
/*TEST
var A = new nas.Pm.Staff();
A.parseStaff('[false,"","","プロデューサ","制作管理"]');
A.parseStaff(' *うなぎ*　[海遊館]　ハンドル:sample@example.com ほげら');

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
    null,"" は、いずれのエントリとも一致しない
    マッチングの順位あり
タイプ    部署　役職　ユーザ　ハンドル　アクセス可否
user        全マッチ以外はfalse
section
duty
*/
nas.Pm.Staff.prototype.sameAs = function(target){
    if(!(target instanceof nas.Pm.Staff)) return false; 
    var result = 0;
    //user プロパティに値がある　双方がUserInfoオブジェクトだった場合のみ文字列化して比較　それ以外は直接比較
    if(this.user){
      if ((this.user instanceof nas.UserInfo)&&(target.user instanceof nas.UserInfo)){
            if(this.user.toString()==target.user.toString()) result += 4;
      } else {
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
     formオプション
plain-textフォーマット
        'plain-text'
        'plain'
        'text'
この書式は、スタッフコレクションから呼び出された時のみに意味を持つので注意
     sction
部門                  \t部門名
     duty
役職                  \t\t役職名
     user
ユーザ                \t\t\tハンドル:e-メール

スタッフコレクションの'plain'オプションに対応する機能


full-dumpフォーマット     
        'full-dump'
        'full'
        'dump'

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

JSONフォーマット
    他のDBとのデータ交換用にJSON文字列化したデータを返す
*/
nas.Pm.Staff.prototype.toString = function(form){
    switch(form){
    case 'JSON':
        return JSON.stringify({
            acsess:this.access,
            type:this.type,
            alias:this.alias,
            user:((this.user)?this.user.toString():null),
            duty:this.duty,
            section:this.section
        });
    break;
    case    'plain-text':
    case    'plain':
    case    'text':
        var result=(this.access)?"\t":"-\t";
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
                result += "\t\t";
                result += this.user.toString(true);
        break;
        }
        return result;
    break
    case    'full-dump':
    case    'full':
    case    'dump':
        var result=(this.access)?[true]:[false];
        result.push(this.alias);
        result.push((this.user)?this.user.toString():'');
        result.push(this.duty);
        result.push(this.section);
        return JSON.stringify(result);
    break;
/*    case 'void':
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
*/
    default:
        var result=(this.access)?'':'-';
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
.parseConfig() Function    設定ファイルのストリームからメンバーを入れ替え
.dump() Functio         ダンプリストを取得
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
    第１フィールドに何らかのデータのあるレコードは拒否エントリになる
    第４フィールドはalias　個々にデータがある場合、そのエントリの表示名称として優先して使用される
        例　\t演出\t監督\t\tbigBoss
        例　\t作画\t原画\tcitten:cat@animals.example.com\tキティちゃん
    各フィールドの値として、h-tabは使用できない
ダンプフォーマットは、機械読み取り用のフォーマットでaddStaffメソッドの引数形式
    

nas.Pm.StaffCollection.prototype.toString = function(form){
    var result="";
    switch (form){
    case "full":
            for (var ix =0 ; ix<this.members.length;ix++){
                if (ix > 0) result +="\n";
                result += this.members[ix].toString('full');
            }
            result += '\n';
        return result;
        break;
    case "plain":
            for (var ix =0 ; ix<this.members.length;ix++){
                if (ix > 0) result +="\n";
                result += this.members[ix].toString('plain');
            }
            result += '\n';
        return result;
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
*/
nas.Pm.StaffCollection.prototype.dump=nas.Pm._dumpList;
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
nas.Pm.StaffCollection.prototype.getMember = function(staffString,type){
    var result=new nas.Pm.staffCollection(this.parent);
    var sect='';    var dut ='';    var usr ='';
}
/*    .parseConfig
    設定ファイルのスタッフ初期化文字列をパースしてスタッフコレクションを更新するオブエジェクトメソッド
    引数はレコード改行区切りテキストストリーム
    受け入れ形式は3つ
    ストリームの第一有効レコードで判定する
    
    いずれも行頭 '#'はコメント行　空行は無視 
    JSON   データ交換用JSON
{access:<ACESS>,alilas:<ALIAS>,user:<USER>,duty:<DUTY>,section:<SECTION>,type:<TYPE>}
    full-dump 引数配列形式
[アクセス可否,"別名","UID","役職","部門"]

    plain-text    タブ区切りフィールド
アクセス可否\t部門\t役職\tユーザ\t別名

    free-form スペース分離　不定フィールドテキスト
アクセス可否	handle:UID	[役職]	*部門*	別名
例：
true	*演出*
false	*作画*	[原画]

** Free-Formは、スタッフDB記述の独自記法なので充分に留意のこと　これに類する記法は他に　Line,Stage,Job　にみられる


*/
nas.Pm.StaffCollection.prototype.parseConfig = function(dataStream,form){
    var myMembers =[];
    // 形式が指定されない場合は、第一有効レコードで判定
    if(! form ){
            if (dataStream.match(/\[\s*(\{[^\}]+\}\s*,)\s*(\{[^\}]+\})?\s*\]/)) form='JSON';//配列JSON
            else if (dataStream.match(/(\n|^)\[.+\]($|\n)/)) form='full-dump';
            else if (dataStream.match(/\*[^\*]+\*|\[[^\[\]]+\]/)) form='free-form';//]
            else  form='plain-text';
    }
    switch(form){
    case    'JSON':
        var tempObject=JSON.parse(dataStream);
        for (var rix=0;rix<tempObject.length;rix++){
            var currentStaff=new nas.Pm.Staff(
                tempObject[rix].user,
                tempObject[rix].duty,
                tempObject[rix].section,
                tempObject[rix].access,
                tempObject[rix].alias
            );
            myMembers.push(currentStaff);
        }
    break;
    case    'full-dump':
    case    'free-form':
        dataStream = String(dataStream).split("\n");
        for (var rix=0;rix<dataStream.length;rix++){
            if(dataStream[rix].indexOf('#')==0) continue;
            var currentStaff=new nas.Pm.Staff();
            currentStaff.parseStaff(dataStream[rix]);
            if (currentStaff) myMembers.push(currentStaff);
        }
    break;
    case    'plain-text':
    default:
        dataStream = String(dataStream).split("\n");
      var currentSection=null;var currentDuty=null;
      for (var rix=0;rix<dataStream.length;rix++) {
        if((dataStream[rix].indexOf('#')==0)||(dataStream[rix].length == 0)) continue;
        var currentRecord=dataStream[rix].split('\t');
        var currentAccess=true;var currentUser=null;var currentAlias="";
//plainフォーマットはタブ区切り　タブ１つは部門　２つで役職　３つでユーザ　ユーザ指定のレコードには別名の指定も可
//例:  ^access  section duty user alias
        if(currentRecord[0]) currentAccess = (String(currentRecord[0]).match( /-|false/i ))?false:true;
        if(currentRecord[1]) {
            var mySection = currentRecord[1].replace(/\/$/,"");
            if(mySection != currentSection) {currentSection=mySection;currentDuty=null;}
            //myMembers.push(new nas.Pm.Staff(null,null,currentSection,currentAccess,""));
        }
        if(currentRecord[2]) {
            currentDuty    = currentRecord[2];
//            myMembers.push(new nas.Pm.Staff(null,currentDuty,currentSection,currentAccess,""));
        }
        if(currentRecord[3]) {
            var currentUser    = new nas.UserInfo(currentRecord[3]);
            var currentAlias   = (currentRecord[4])? currentRecord[4]:"";
//            myMembers.push(new nas.Pm.Staff(currentUser,currentDuty,currentSection,currentAccess,currentAlias));
        }
        myMembers.push(new nas.Pm.Staff(currentUser,currentDuty,currentSection,currentAccess,currentAlias));
      }
    }
    return this.addStaff(myMembers);
}
/*TEST

*/



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
    可読テキストの再ロードはparseConfigメソッドを利用
    parseConfigメソッドは、可読テキストをdump形式にコンバートしてこのメソッドを内部で呼び出す
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
      if(! member) continue;
      var checkHint = this.indexOf(member);
//console.log("checkHint : " + checkHint)  ;   
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

nas.Pm.inportDB(settingStream)
 
DBとの通信は基本的に serviceAgent配下で各ServiceNodeが行う
読み出しは低レベル関数をそれぞれのオブジェクトが受け持ち
設定ファイル読み出しに相当するひとまとまりのアクションを親オブジェクト側で実装する

統一形式
Object.parseConfig(dataStream)

perseStaff等もリネーム

*/
