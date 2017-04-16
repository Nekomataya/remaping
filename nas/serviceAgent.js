/**
    サービスエージェント
    一旦このモジュールを通すことで異なる種別のリポジトリ操作を統一する
    サービスエージェントは、ログイン管理を行う
    
test data:

    var username = kiyo@nekomataya.info
    var password = 'devTest'
    var client_id = "b115aead773388942473e77c1e014f4d7d38e4d4829ae4fd1fa0e48e1347b4cd";
    var client_secret = "54c0f02c38175436df16a058cc0c0e037038c82d3cc9ce4c212e3e4afe0449dd";

http://remaping.scivone-dev.com/oauth/token?
Object ServiceAgent
    .servers    サーバコレクション
    .repositories リポジトリコレクション
    .currentRepository  現在選択されているリポジトリへの参照


    サーバは複数のリポジトリを持つことができる
    リポジトリは、いずれかのサーバに属しそのサーバへの参照を持つ
    ローカルリポジトリはアプリケーション自身がサーバの代用をする

アプリケーションはリポジトリセレクタでリポジトリを選ぶ

ドキュメントリストにはリポジトリから取得した内容と、実際にオープンした内容の履歴を表示する
履歴は、ローカルリポジトリにするか？
そうする場合は、ローカルリポジトリはセレクタに入れずに表示にマーキングをする
特に現在開いている（又は開いていない）リポジトリのカットとカブっている場合

    リポジトリ分類
以下のような段階的な差を付けてアカウントを取得してもらう＋制作会社に有料サービスを販売しやすくしたい

    ローカルリポジトリ
オフライン作業用のリポジトリ
常に使用可能、このリポジトリのデータは対応する作品を管理するサーバと同期可能にする    
作業中に認証を失ったり、ネットワーク接続が切れた作業はこのリポジトリに保存することが可能
サービスノード（サーバ）としてはダミーの値を持たせる
（作業バックアップ領域とは別 作業バックアップは常時使用可能）
ローカルリポジトリは容量が制限されるので保存できるカット数に制限がある（現在５カット 2016.11.15）
この部分は作業履歴や作業キャッシュとして扱うべきかも
履歴として扱う場合は、「最終5カットのリングバッファ」という風に

    ホームリポジトリ
ログインしたサーバ上でデフォルトで提供されるリポジトリ
ログイン時は常に使用可能

    追加リポジトリ
個人用のリポジトリとは別に設定される共同制作用リポジトリ
ある程度の管理サービスが追加される

    プロダクションリポジトリ（有料サービス）
個人用のリポジトリとは別に設定される業務用リポジトリ
会社単位での作品制作のための管理サービスが追加される

こんな感じか？

同時にアクセス可能なリポジトリの数を制限したほうが良い
あまり多くのリポジトリを開いて一律に表示すると混乱する

とくに、ローカルリポジトリはバックアップの性格が強くなるので、他のリポジトリのタイトルを表示することになる
リポジトリセレクタで選んだ単一のリポジトリのみにアクセスするように設定する



サーバのメニュー上でリポジトリにプロダクト（制作管理単位）を登録すると、そのプロダクトに対してカットの読み書きが可能になる

プロダクト毎にアクセス可能な（リポジトリ共有）ユーザを登録することができる

登録されたユーザはそのリポジトリにアクセスしてデータを編集又は閲覧することが可能

エントリごとにグループに対して以下の権利を設定することができる

X    リスト
R    読み込み
W    書き込み

権利に対してのレイヤー構造がある
リポジトリはプロダクトを含む
プロダクトはドキュメントを含む

各ドキュメントはライン/ステージ/ジョブの構造を持つ

このアトリビュート毎・ユーザ毎に 権限が異なるケースがある

                
リポジトリ   *
プロダクト   *
カット       *
ライン       *
ステージ     * 
ジョブ       *

    サーバごとに権限グループを設ける基本は作業部毎
制作管理部 
演出部     
撮影部     
美術部     
原画部     
動画部     
仕上部     

等

グループ・ユーザの権限は、エントリ毎に設定可能に
基本はグループに対する権限設定
イレギュラー処理が必要なケースのみユーザごとの権限をエントリの設定に追記する

イレギュラーや変更がなければエントリの権限設定は上位のレイヤから継承するので記載は無くとも良い

グループ権限・作品データ・管理基礎データ等の保存管理

基本的なDBへの登録等は、リポジトリ内に設定データを置いてその読み書きで対処する
RDBMのサポートのないファイル（ストレージ）上でリポジトリを築く際に必要
サービスエージェントを介してのDBへの情報請求をここで解決
*/
/**
    サービスモードオブジェクト
    複数あるサーバ（ログイン先）の必要な情報を保持するオブジェクト
    複数のサービス情報をプログラム内に保持しないようにドキュメント内の属性として監理する
    同時に記録する認証は一つ、複数のログイン情報を抱える必要はない
    最期に認証したノード一つで運用 トークンは毎に再取得
*/
ServiceNode=function(serviceName,serviceURL){
    this.name = serviceName;//識別名称
    this.url  = serviceURL;//ベースになるURL localStorageの際は"localStorage:"
    this.type = "scivon"///localStrage/scivon/localfilesystem 等のキーワード
//    this.uid  = '';//uid ログインユーザID パスワードは控えない 必要時に都度請求
//    this.lastAuthorized = "";//最期に認証したタイミング
//    this.accessToken="";//アクセストークン
//    this.username = kiyo@nekomataya.info
//    this.password = 'devTest'
//  以下の情報は、テスト用に埋め込み あとで分離処置
    this.client_id = "b115aead773388942473e77c1e014f4d7d38e4d4829ae4fd1fa0e48e1347b4cd";
    this.client_secret = "54c0f02c38175436df16a058cc0c0e037038c82d3cc9ce4c212e3e4afe0449dd";
}
/**
    リクエストのヘッダにトークンを載せる
    トークンの期限が切れていた場合は、再度のトークン取得（再ログイン）を促す
    v1向けのコーデーデングは考慮しない
*/
ServiceNode.prototype.setHeader = function(xhr){
    
    var oauth_token = (xUI.onSite)? 
    $('#backend_variables').attr('data-user_access_token'):$('#server-info').attr('oauth_token');
if(dbg) console.log("setHeader :: ");
if(dbg) console.log(oauth_token);
    var organizationToken = (typeof serviceAgent.currentRepository.token != 'undefined')? serviceAgent.currentRepository.token:'';
    if(oauth_token.length==0) return false;
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*' );
        xhr.setRequestHeader('Authorization', ( "Bearer " + oauth_token));    
        xhr.setRequestHeader('OrganizationToken', organizationToken );
    return true;
}
/**
    データ取得
    参考コード 実際にはコールされない
*/
ServiceNode.prototype.getFromServer = function getFromServer(url, msg){
//V1
    $.ajax({
        url: this.url + url,
        type: 'GET',
        dataType: 'json',
        success: function(res) {
if(dbg) console.log(msg);
if(dbg) console.log(res);
        },
        beforeSend: this.setHeader
    });
//V2    
        $.ajax({
          url: this.url + url,
          type: 'GET',
          dataType: 'json',
          success: function(res) {
if(dbg) console.log(msg);
if(dbg) console.log(res);

            if( url == '/api/v2/organizations.json' ){
              organization_token = res[0]["token"];
              $('#organization_needed').fadeIn("slow");
              $('#organization_name').text(res[0]["name"]);
            }else if ( msg == '作品一覧取得'){
              product_token = res[0]["token"]
            }else if (msg == 'エピソード一覧取得'){
              episode_token = res[0]["token"]
            }else if (msg == 'カット一覧取得'){
              cut_token = res[0]["token"]
            }


          },
          beforeSend: setHeader
        });
}

/**
    認証手続きはサービスノードのメソッド ノード自身が認証と必要なデータの記録を行う
    パスワードは記録しない
    認証毎にパスワードをユーザに要求する
        myService.authorize()
    パスワードとUIDは、ページ上のフォームから読む
 
    
*/
ServiceNode.prototype.authorize=function(callback){
if(dbg) console.log("authorize::execute");
    var noW =new Date();
    var myUserId   = document.getElementById('current_user_id').value;
    var myPassword = document.getElementById('current_user_password').value;
    if ((myUserId.length<1) || (myPassword.length<1)) return false;
//    if((this.accessToken.length)&&(new Date(this.lastAuthorized) < new Date())){return true}
    var data = {
        username: myUserId,
        password: myPassword,
        client_id: this.client_id,
        client_secret: this.client_secret,
        grant_type: 'password'
    };
    var oauthURL=serviceAgent.currentServer.url+"/oauth/token.json";//.split('/').slice(0,3).join('/');
if(dbg) console.log(oauthURL);
    $.ajax({
        type: "POST",
        url: oauthURL,
        data: data,
		success : function(result) {
if(dbg) console.log(serviceAgent.currentServer.name + ": success")
if(dbg) console.log(result.access_token)
            $('#server-info').attr('oauth_token'  , result.access_token);
            $('#server-info').attr('last_authrized' , new Date().toString());
            serviceAgent.authorized('success');
            serviceAgent.currentServer.getRepositories(callback);
		},
		error : function(result) {
		    /**
		        認証失敗 エラーメッセージ表示　トークンと必要情報をクリアして表示を変更する
		    */
		    alert(localize(nas.uiMsg.dmAlertFailAuthorize));
            $('#server-info').attr('oauth_token'  , '');
            $('#server-info').attr('last_authrized' , '');
            serviceAgent.authorized('false');
		}
	});
}
/**
    リポジトリ（TEAM）一覧を取得してUIを更新する
*/
ServiceNode.prototype.getRepositories=function(callback){
if(dbg) console.log("url : "+serviceAgent.currentServer.url + '/api/v2/organizations.json');
//      var myURL = serviceAgent.currentRepository.service.url + '/api/v2/organizations.json',
        var myURL = serviceAgent.currentServer.url + '/api/v2/organizations.json';
        $.ajax({
          url : myURL,
          type : 'GET',
          dataType : 'json',
          success : function(result) {
//if(dbg) console.log("getRepositories:::::::::::");
//if(dbg) console.log(result);
            serviceAgent.repositories.splice(1);//ローカルリポジトリを残してクリア(要素数１)
            for( var rix=0 ; rix<result.length ; rix ++){
                serviceAgent.repositories.push(new NetworkRepository(result[rix].name,serviceAgent.currentServer));
                serviceAgent.repositories[serviceAgent.repositories.length - 1].token = result[rix].token;
            };
            var myContents="";
    myContents += '<option selected value=0> = local Repository =' ;
    for(var idr=1; idr < serviceAgent.repositories.length;idr ++){
        myContents +='<option value="'+idr+'" >'+serviceAgent.repositories[idr].name; 
    }
    document.getElementById('repositorySelector').innerHTML = myContents;
    if(callback instanceof Function){setTimeout(function(){callback();},10)};
          },
          error : function(result){
console.log("getRepositories::fail");
console.log(JSON.stringify(result));
          },
          beforeSend: serviceAgent.currentServer.setHeader
        });
}
/*
    履歴構造の実装には、XPSのデータを簡易パースする機能が必要
    プロパティを取得するのみ？
    
    サーバは自身でXPSをパースしない
    
    アプリケーションがパースした情報を識別情報として記録してこれを送り返す
    
(タイトル)[#＃№](番号)[(サブタイトル)]//S##C####(##+##)/S##C####(##+##)/S##C####(##+##)/不定数…//lineID//stageID//jobID//documentStatus
    例:
ももたろう#SP-1[鬼ヶ島の休日]//SC123 ( 3 + 12 .)//0//0//1//Hold
 
タイトル/話数/サブタイトル/カット番号等の文字列は、少なくともリポジトリ内/そのデータ階層でユニークであることが要求される
例えば現存のタイトルと同じと判別されるタイトルが指定された場合は、新規作品ではなく同作品として扱う
似ていても、別のタイトルと判別された場合は別作品として扱われるので注意

＊判定時に

    タイトル内のすべての空白を消去
    半角範囲内の文字列を全角から半角へ変換
    連続した数字はparseInt

等の処置をして人間の感覚に近づける操作を行う（比較関数必要）


ラインID ステージID 及びジョブIDはカット（管理単位）毎の通番 同じIDが必ずしも同種のステージやジョブを示さない。
管理工程の連続性のみが担保される
識別子に管理アイテム識別文字列を加えても良い

第４要素は作業状態を示す文字列

    例:
0//0//0//Stratup
0:本線//1:レイアウト//2:演出検査//Active
 
    ラインID
ラインが初期化される毎に通番で増加 整数
0   本線 primaryライン
1   本線から最初に分岐したライン
1-1 ライン１から分岐したライン
2   本線から分岐した２番めのライン

    ステージID
各ラインを結んで全通番になる作業ステージID
0//0
0//1
0//2    1//2
0//3    1//3

    ジョブID
ステージごとに初期化される作業ID
0//0//0
0//0//1
0//0//2
0//1//0
0//1//1

    ステータス
作業状態を表すキーワード
Startup/Active/Hold/Fixed/Aborted (開始/作業/保留/終了/削除) の５態

    エントリの識別子自体にドキュメントの情報を埋め込めばサーバ側のパースの必要がない。
    ファイルシステムや一般的なネットワークストレージ、キー／値型のDBをリポジトリとして使う場合はそのほうが都合が良い
    管理DBの支援は受けられないが、作業の管理情報が独立性を持ち、アプリケーションからの管理が容易
    
 //現状
 var myXps= XPS;
    [encodeURIComponent(myXps.title)+"#"+encodeURIComponent(myXps.opus)+"["+encodeURIComponent(myXps.subtitle)+"]",encodeURIComponent("S"+((myXps.scene)?myXps.scene:"-")+"C"+myXps.cut)+"("+myXps.time()+")",myXps.xMap.currentLine,myXps.xMap.currentStage,myXps.xMap.currentJob].join(" // ");
 //将来は以下で置き換え予定 CSオブジェクト未実装
    myXps.sci.getIdentifier();
 //Xpsオブジェクトのクラスメソッドとして仮実装済み オブジェクトメソッドとして同名の機能の異なる関数があるので要注意
  Xps.getIdentifier(myXps);
  
*/
/**
比較関数 管理情報 3要素の管理情報配列 issuesを比較して先行の管理ノード順位を評価する関数
ライン拡張時は追加処理が必要
*/
issuesSorter =function(val1,val2){
    if(typeof val1 == 'undefined'){ return -1 } 
    if(typeof val2 == 'undefined'){ return  1 } 

    return (parseInt(String(val1[0]).split(':')[0]) * 10000 + parseInt(String(val1[1]).split(':')[0]) * 100 + parseInt(String(val1[2]).split(':')[0])) - ( parseInt(String(val2[0]).split(':')[0]) * 10000 + parseInt(String(val2[1]).split(':')[0]) * 100 + parseInt(String(val2[2]).split(':')[0]));
};

/**
    ソート比較関数
    カット番号（文字列内の最初の整数クラスタ）を整数化して比較
*/
numSorter =function(val1,val2){ return (nas.parseNumber(val1) - nas.parseNumber(val2))};

/**
初期化引数:カット識別子[タイトルID,話数ID,カットID]

    ドキュメントリストにエントリされるオブジェクト
    parent  リポジトリへの参照
    product 作品と話数
    sci     カット番号（兼用情報含む）
    issues  管理情報 ４要素一次元配列 [line,stage,job,status]
    実際のデータファイルはissueごとに記録される
    いずれも URIエンコードされた状態で格納されているので画面表示の際は、デコードが必要
    issues には　オリジナル（初期化時）の識別子を保存する
    ネットワークリポジトリに接続する場合は以下のプロパティが設定される
    listEntry.titleID   /string token
    listEntry.episodeID /string token
    listEntry.issues[#].cutID  /string token
    listEntry.issues[#].versionID  /string token
    
    オブジェクトメソッド
    listEntry.toString(Index)   
    listEntry.push(Identifier)
    listEntry.getStatus()
*/
listEntry=function(myIdentifier){
    this.dataInfo = Xps.parseIdentifier(myIdentifier);//dataInfoそのものを拡張すればプロパティが不要となる？
    this.parent;//初期化時にリポジトリへの参照を設定
    this.product = encodeURIComponent(this.dataInfo.product.title)+"#"+encodeURIComponent(this.dataInfo.product.opus);
    this.sci     = encodeURIComponent(this.dataInfo.sci[0].cut);
if(typeof this.dataInfo.line == 'undefined'){
//識別子にバージョン情報が含まれない場合は初期バーションで補填（nullとかのほうが良いかも）
    this.issues  = [[
        new XpsLine(nas.pm.pmTemplate[0].line).toString(true),
        new XpsStage(nas.pm.pmTemplate[0].stages[0]).toString(true),
        new XpsStage(nas.pm.jobNames.getTemplate(nas.pm.pmTemplate[0].stages[0],"init")[0]).toString(true),
        "Startup"
    ]];
}else{
    this.issues  = [[
        encodeURIComponent(this.dataInfo.line.toString(true)),
        encodeURIComponent(this.dataInfo.stage.toString(true)),
        encodeURIComponent(this.dataInfo.job.toString(true)),
        this.dataInfo.currentStatus
    ]];
}
    this.issues[0].identifier=myIdentifier;
    this.issues[0].time=nas.FCT2Frm(this.dataInfo.sci[0].time);
if(arguments.length>1) {
        this.titleID             = arguments[1];
        this.episodeID           = arguments[2];
        this.issues[0].cutID     = arguments[3];
        this.issues[0].versionID = null;
    }
}
/**
    エントリは引数が指定されない場合、管理情報を除いたSCI情報分のみを返す
    引数があれば引数分の管理履歴をさかのぼって識別子を戻す
    このメソッド全体がIssues配列の並びが発行順であることを期待している
    リスト取得の際にソートをかけることで解決
    ライン拡張後はソートで解決できなくなるので要注意
    方針としては、各ラインをまたがずに開始点まで遡れるように設定する
*/
listEntry.prototype.toString=function(myIndex){
    if(typeof myIndex == "undefined"){myIndex = -1;}
    if(myIndex < 0){
        return [this.product,this.sci].join("//");
    }else{
        if(myIndex<this.issues.length){
            return this.issues[this.issues.length - 1 - myIndex].identifier;
//            return [this.product,this.sci].join("//")+"//"+ this.issues[this.issues.length - 1 - myIndex].join("//");
            //この部分の手続はラインをまたぐと不正な値を戻すので要修正 11.23
        }else{
            return this.issues[this.issues.length - 1].identifier;
//            return [this.product,this.sci].join("//")+"//"+ this.issues[this.issues.length - 1].join("//");
        }
    }
}
/**
    識別子を引数にして管理情報をサブリストにプッシュする
    管理情報のみが与えられた場合は無条件で追加
    フルサイズの識別子が与えられた場合は SCI部分までが一致しなければ操作失敗
    追加成功時は管理情報部分を配列で返す
    
    
    SCI部分のみでなく ラインとステージが一致しないケースも考慮すること（今回の実装では不用）
    
    ネットワークリポジトリ・DB接続用にIDを増設
    
    
*/
listEntry.prototype.push=function(myIdentifier){
    if(Xps.compareIdentifier(this.issues[0].identifier,myIdentifier) < 1){return false;}
    var dataInfo=Xps.parseIdentifier(myIdentifier);
    if(dataInfo.currentStatus){
        var issueArray = [
            encodeURIComponent(dataInfo.line.toString(true)),
            encodeURIComponent(dataInfo.stage.toString(true)),
            encodeURIComponent(dataInfo.job.toString(true)),
            dataInfo.currentStatus
        ];
    }else{
        var issueArray = [];
    }
        issueArray.identifier=myIdentifier;
        issueArray.time=nas.FCT2Frm(dataInfo.sci[0].time);
    if(arguments.length>1) {
//        this.titleID         = arguments[1];
//        this.episodeID       = arguments[2];
        issueArray.cutID     = arguments[3];
        issueArray.versionID = arguments[4];
    }
        for (var iid = 0 ; iid < this.issues.length ; iid ++ ){
            if(this.issues[iid].join('//')==issueArray.join('//')) return false;
        }
        this.issues.push(issueArray);
        this.issues.sort(issuesSorter);
        return this.issues;
}
/**
A=new listEntry("%E3%81%8B%E3%81%A1%E3%81%8B%E3%81%A1%E5%B1%B1Max#%E3%81%8A%E3%81%9F%E3%82%81%E3%81%97[%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%82%AB%E3%83%83%E3%83%88]//S-C10(72)//0:primary//1:layout//1://");
A
*/
/**
    エントリのステータスを取得する
    記録位置は、最終ジョブ
    エントリにステータスを設定する機能は設けない
    新規の状況更新はすべてリポジトリ本体からの再読出で行う
      
*/
listEntry.prototype.getStatus=function(){
    return this.issues[this.issues.length-1][3];
}
/**
    エントリリストを操作する拡張メソッド
    エントリリストは配列ベースなので配列に拡張するメソッドとして記述
.store(entry)       ;
.remove(idf)        ;
.getByIdf(idf)      ;idf指定でエントリを戻す
.getByToken(token)  ;ネットワークのみ
*/
_getByIdf=function getByIdf(myIdentifier,opt){
    if(typeof opt == 'undefined') opt = 1;
    for (var ix = 0 ; ix < this.length ; ix ++){
        if (this[ix].toString().split('//')[0] != myIdentifier.split('//')[0]) continue;
        if (Xps.compareIdentifier(this[ix].toString(true),myIdentifier()) >= opt ) return this[ix];
    }
    return null;
}
/**
    ローカルリポジトリ
    主に最近の作業データをキャッシュする役目
    カットのデータを履歴付きで保持できる
    複数カットを扱う 制限カット数内のリングバッファ動作
    xUIから見るとサーバの一種として働く
    ローカルストレージを利用して稼働する

保存形式
info.nekomataya.remaping.dataStore
内部にオブジェクト保存

*/
localRepository={
    name:'localStrageStore',
//    currentProduct:"",
//    currentSC:"",
//    currentLine:"",
//    currentStage:"",
//    currentJob:"",
    entryList:[],
    keyPrefix:"info.nekomataya.remaping.dataStore.",
    maxEntry:10
};
/** productList追加
    プロダクトは　OPUSに等価タイトル情報を含む
    内部的にデータを整理して利用するためのコレクション
    listProdut オブジェクトを格納
*/
/**
    getListメソッドは、ストアリストをクリア
    ローカルストレージ内のデータをすべて走査してストアリストに格納
    エントリリストの更新を行う

    戻り値はストアされたエントリの数
    実際のデータ・エントリリストが必要な場合は、localRepository.entryList を参照すること
    ドキュメントセレクタの値を更新するためには、
    リポジトリの更新 ドキュメントリストの再構築の順で実行… まとめたほうが良いかも
*/
/**
    フィルタ引数 myFilter,isRegex
    if(typeof myFilter == "undefined") {myFilter=".+";};
    var myFilterRegex =(isRegex)? new RegExp(myFilter):new RegExp(".*"+myFilter+".*");
//エントリ数を少なく制限するのでここでは実際はフィルタは意味をなさない フィルタのフォーマットは一考
forceオプションは、引数の統一のために存在するNetworkRepositoryで必要なオプション
localStorageでは意味を持たないダミーオプション
*/

localRepository.getList=function(force,callback){
    var keyCount=localStorage.length;//ローカルストレージのキー数を取得
    this.entryList.length=0;//配列初期化
    var currentEntryID;
    for (var kid=0;kid<keyCount;kid++){
        if(localStorage.key(kid).indexOf(this.keyPrefix)==0){
            var currentIdentifier=localStorage.key(kid).slice(this.keyPrefix.length);
            var hasEntry = false;
            for (var eid=0 ; eid < this.entryList.length; eid ++){
                //エントリリストにすでに登録されているか検査
                if(Xps.compareIdentifier(currentIdentifier,this.entryList[eid].toString()) == 1){
                    currentEntryID = eid; hasEntry=true; break; 
                }
            }
            if(hasEntry){
if(dbg) console.log("push issues :" + decodeURIComponent(currentIdentifier));
                //登録済みプロダクトなのでエントリに管理情報を追加
                this.entryList[currentEntryID].push(currentIdentifier);
            }else{
if(dbg) console.log("add :: "+decodeURIComponent(currentIdentifier));
                //未登録新規プロダクトなのでエントリ追加
                var newEntry = new listEntry(currentIdentifier);
                newEntry.parent = this;
                this.entryList.push(newEntry);
            }
        }
    }
    //リスト更新を行ったのでエントリをドキュメントブラウザに送る
    documentDepot.documentsUpdate();
    if(callback instanceof Function) callback();
    return this.entryList.length;
}
/**
    ローカルリポジトリにエントリを追加
    引数:Xpsオブジェクト
    与えられたXpsオブジェクトから識別子を自動生成
    識別子にkeyPrefixを追加してこれをキーにしてデータを格納する
    ここでステータスの解決を行う？
    キーが同名の場合は自動で上書きされるのでクリアは行わない
    エントリ数の制限を行う
    エントリ数は、キーの総数でなく識別子の第一、第二要素を結合してエントリとして認識する
*/
localRepository.pushEntry=function(myXps,callback,callback2){
    if(myXps.cut==''){
        var msg=localize({
            en:"you can't save entry without cutNo.",
            ja:"カット番号のないエントリは記録できません。"
        });
        alert(msg);
        console.log("can't save without cut name");
        return false;
    };
//クラスメソッドで識別子取得
    var myIdentifier=Xps.getIdentifier(myXps);
if (dbg) console.log("pushEntry :"+myIdentifier);
//識別子に相当するアイテムがローカルストレージ内に存在するかどうかを比較メソッドで検査
    for (var pid=0;pid<this.entryList.length;pid++){
        if(Xps.compareIdentifier(this.entryList[pid].toString(),myIdentifier) > 3){
            //既存のエントリが有るのでストレージとリストにpushして終了
            try{
                this.entryList[pid].push(myIdentifier);
                localStorage.setItem(this.keyPrefix+myIdentifier,myXps.toString());
                if (xUI.XPS === myXps){
                    xUI.setStored('current');
                    sync();
                }
            }catch(err){
                if(callback2 instanceof Function){callback2();}                
            }
            sync();
            serviceAgent.currentRepository.getList(true);//リストステータスを同期
            documentDepot.rebuildList();
            if(callback instanceof Function){callback();}
            return this.entryList[pid];
        };
    };
if (dbg) console.log("既存エントリなし :追加処理");
//既存エントリが無いので新規エントリを追加
//設定制限値をオーバーしたら、 警告する。　OKならば　ローカルストレージから最も古いエントリを削除して実行
    try{
        if ( this.entryList.length >= this.maxEntry ){
            var msg=localize({en:"over limit!\n this entry will remove [%1]\n ok?",ja:"制限オーバーです!\nこのカットを登録するとかわりに[%1]が消去されます。\nよろしいですか？"},decodeURIComponent(this.entryList[0].toString()));
            if(confirm(msg)){
if(dbg) console.log("removed Item !");
                for (var iid=0; iid < this.entryList[0].issues.length ; iid++ ){
                    localStorage.removeItem( this.keyPrefix + this.entryList[0].issues[iid].identifier );
                };
                this.entryList=this.entryList.slice(1);
                localStorage.setItem(this.keyPrefix+myIdentifier,myXps.toString());
                this.entryList.push(new listEntry(myIdentifier)) 
if(dbg) console.log(this.entryList.length +":entry/max: "+ this.maxEntry)
                this.getList();
            }
        }else{
            localStorage.setItem(this.keyPrefix+myIdentifier,myXps.toString());
            this.entryList.push(new listEntry(myIdentifier)) 
            //this.getList();
        }
    }catch(err){
        if(callback2 instanceof Function){callback2();}                
    }
    sync();
    serviceAgent.currentRepository.getList(true);//リストステータスを同期
    documentDepot.rebuildList();
    if(callback instanceof Function){callback();}
    return this.entryList[this.entryList.length-1];
}

/**
    識別子を引数にしてリスト内を検索
    一致したデータをローカルストレージから取得してXpsオブジェクトで戻す
    識別子に管理情報があればそれをポイントして、なければ最も最新のデータを返す
    コールバック渡し可能
    引数は、Object
    読み出し直後は必ず書き込み禁止のモードとなる
*/
localRepository.getEntry=function(myIdentifier,isReference,callback){
    if(typeof isReference == 'undefined'){isReference = false;}
    //識別子をパース
    var targetInfo = Xps.parseIdentifier(myIdentifier);//

    var myIssue = false;
    var refIssue = false;

    var myEntry = this.entry(myIdentifier);
    if(! myEntry){
if(dbg) console.log("noProduct : "+ decodeURIComponent(myIdentifier));//プロダクトが無い
        return false;
    }
    if(! targetInfo.currentStatus){
   //引数に管理部分がないので、最新のissueとして補う
        var cx = myEntry.issues.length-1;//最新のissue
        myIssue = myEntry.issues[cx];//配列で取得
    } else {
    //指定管理部分からissueを特定する 連結して文字列比較（後方から検索) リスト内に指定エントリがなければ失敗
        checkIssues:{
            for (var cx = (myEntry.issues.length-1) ; cx >= 0 ;cx--){
                if ( Xps.compareIdentifier(myEntry.issues[cx].identifier,myIdentifier) > 4){
                    myIssue = myEntry.issues[cx];
                    break checkIssues;
                }
            }
            if (! myIssue){
if(dbg) console.log( 'no target data :'+ decodeURIComponent(myIdentifier) );//ターゲットのデータが無い
                return false;
            }
        }
    }

    // 構成済みの情報を判定 (リファレンス置換 or 新規セッションか)
    // ソースデータ取得
if(dbg) console.log("readin XPS");
if(dbg) console.log(decodeURIComponent(myIssue.identifier));

    var myXpsSource=localStorage.getItem(this.keyPrefix+myIssue.identifier);
//識別子を再結合してもキーが得られない場合があるのでエントリから対応キーの引き出しを行う

    if(myXpsSource){
        if(isReference){            
        //データ単独で現在のセッションのリファレンスを置換
            documentDepot.currentReference = new Xps();
            documentDepot.currentReference.readIN(myXpsSource);
            xUI.resetSheet(undefined,documentDepot.currentReference);
        }else{
        //新規セッションを開始する
            documentDepot.currentDocument = new Xps();
            documentDepot.currentDocument.readIN(myXpsSource);
            documentDepot.currentReference = new Xps(5,144);//カラオブジェクトをあらかじめ新規作成
           //自動設定されるリファレンスはあるか？
            //指定管理部分からissueを特定する 文字列化して比較
            if ( cx > 0 ){
                if(parseInt(decodeURIComponent(myIssue[2]).split(':')[0]) > 0 ){　　  
                //ジョブIDが１以上なので 単純に一つ前のissueを選択する
                //必ず先行jobがある  =  通常処理の場合は先行JOBが存在するが、単データをエントリした場合そうでないケースがあるので対処が必要　2016 12 29
                    refIssue = myEntry.issues[cx-1];
                }else if(decodeURIComponent(myIssue[1]).split(':')[0] > 0 ){
                //第2ステージ以降前方に向かって検索
                //最初にステージIDが先行IDになった要素が参照すべき要素
                    for(var xcx = cx-1 ;xcx >= 0 ; xcx --){
                        if (parseInt(decodeURIComponent(myEntry.issues[xcx][1]).split(':')[0]) == (parseInt(decodeURIComponent(myIssue[1]).split(':')[0])-1)){
                            refIssue = myEntry.issues[xcx];
                            break;
                        }
                    }
                };//cx==0 のケースでは、デフォルトで参照すべき先行ジョブは無い
//              if(dbg) console.log('refIssue');
//              if(dbg) console.log(refIssue);
                if(refIssue){
if(dbg) console.log(this.keyPrefix + refIssue.identifier);
                    myRefSource=localStorage.getItem(this.keyPrefix + refIssue.identifier);//リファレンスソースとる
                    if(myRefSource){
if(dbg) console.log('myRefSource:');
if(dbg) console.log(myRefSource);
                        documentDepot.currentReference.readIN(myRefSource);
                    }
                }
            }
if(dbg) console.log(documentDepot.currentReference);//単エントリで直前のエントリ取得不能の可能性あり
            xUI.resetSheet(documentDepot.currentDocument,documentDepot.currentReference);
            xUI.sessionRetrace = myEntry.issues.length-cx-1;
            xUI.setUImode('browsing');sync("productStatus");
            //読込実行後にコールバックが存在したら実行
            if(callback instanceof Function){setTimeout(callback,10)};
        }
    } else { 
        return false;
    }
}
/**
    DBにタイトルを作成する。
    confirmなし 呼び出し側で済ませること
    必要あれば編集UI追加
引数
    タイトル（必須）
    備考テキスト
    Pmオブジェクト
    コールバック関数２種
識別子は受け入れない　必要に従って前段で分解のこと
*/
localRepository.addTitle = function (myTitle,myDescription,myPm,callback,callback2){
//現在ローカルリポジトリ側で行う処理は存在しない コールバックの実行のみを行う
　if(callback instanceof Function) callback();
    return true;
}
/**
    DBにOPUS(エピソード)を作成する。
引数
    タイトルを含む識別子　カット番号は求めない
    コールバック関数２種
    識別子のみ受け入れ
    このルーチンを呼び出す時点で、タイトルは存在すること
*/
localRepository.addOpus = function (myIdentifier,prodIdentifier,callback,callback2){
//現在ローカルリポジトリ側で行う処理は存在しない コールバックの実行のみを行う
　if(callback instanceof Function) callback();
    return true;
}
/**
    識別子を指定してローカルリポジトリから相当エントリを消去する
    リストは再構築
    ローカルリポジトリに関しては、各ユーザは編集権限を持つ
    
    また、ステータス変更のため内部ルーチンがこのメソッドを呼ぶ
    直接要素編集をしても良い？
*/
localRepository.removeEntry=function(myIdentifier){
    var myEntry = this.entry(myIdentifier);
    if(myEntry){
       //関連するエントリをすべて削除
            for (var iid=0;iid < myEntry.issues.length;iid++){
                localStorage.removeItem(this.keyPrefix+myEntry.issues[iid].identifier);
            };
            this.getList();
            return myEntry;
    };    
};
/**
    識別子でエントリリストを検索して該当するリストエントリを返す操作をメソッド可
    issuesは受取先で評価
    NetroekRepositoryにも同メソッドを
    引数　opt を加えると　プロダクトまで一致で最初のエントリを返す
 */
localRepository.entry=function(myIdentifier,opt){
    if(! opt) {opt = 0}else{opt = -1};
    for (var pid=0;pid<this.entryList.length;pid++){
        if(Xps.compareIdentifier(this.entryList[pid].toString(),myIdentifier) > opt){
            return this.entryList[pid]
        }
    }
    return null;        
}
/**
    以下、ステータス操作コマンドメソッド
    serviceAgentの同名メソッドから呼び出す下位ファンクション

*/
/**
    現在のドキュメントをアクティベートする
*/
localRepository.activateEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
        var newXps = new Xps();
        var currentContents = localStorage.getItem(this.keyPrefix+currentEntry.toString(0));
        if (currentContents) { newXps.readIN(currentContents); }else {return false;}
        //ここ判定違うけど保留 あとでフォーマット整備 USERNAME:uid@domain(mailAddress)  型式で暫定的に記述
        //':'が無い場合は、メールアドレスを使用
if(dbg) console.log(xUI.currentUser.sameAs(newXps.update_user));
        if ((newXps)&&(xUI.currentUser.sameAs(newXps.update_user))){
             //同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
            newXps.currentStatus = 'Active';
if(dbg) console.log('activate : '+decodeURIComponent(Xps.getIdentifier(newXps)));
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var result = (localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps)) == newXps.toString())?true:false;
            if(result){
                localStorage.removeItem (this.keyPrefix+currentEntry.toString(0));
if(dbg) console.log('activated');
                this.getList();//リストステータスを同期
                documentDepot.rebuildList();
                xUI.XPS.currentStatus='Active';//ドキュメントステータスを更新
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
            }else{
if(dbg) console.log('ステータス変更失敗 :');
                delete newXps ;
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
                return false;
            }
if(dbg) console.log(newXps)
            xUI.setUImode('production');
            xUI.sWitchPanel();//パネルクリア
            if(callback instanceof Function){ setTimeout (callback,10);}
            return true;
        }else{
if(dbg) console.log('ステータス変更不可 :'+ Xps.getIdentifier(newXps));
            if(callback2 instanceof Function) {setTimeout(callback2,10);}
            return false
        }
}
//作業を保留する リポジトリ内のエントリを更新してステータスを変更 
localRepository.deactivateEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
            //Active > Holdへ
        var newXps = new Xps();
        var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
        //ユーザ判定は不用
        if (newXps){
             //同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
            newXps.currentStatus = 'Hold';//（ジョブID等）status以外の変更はない
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var result = (localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps)) == newXps.toString())?true:false;
            if(result){
if(dbg) console.log('deactivated');
                localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
                this.getList();//リストステータスを同期
                documentDepot.rebuildList();
                xUI.XPS.currentStatus='Hold';//ドキュメントステータスを更新
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
            }else{
            //保存に失敗
if(dbg) console.log('保留失敗')
                delete newXps ;
			    if(callback2 instanceof Function) setTimeout(callback2,10);
                return false;
            }
            //データをホールドしたので、リストを更新 編集対象をクリアしてUIを初期化
            xUI.setUImode('browsing');
            xUI.sWitchPanel();//パネルクリア
			if(callback instanceof Function) setTimeout(callback,10);
        }else{
if(dbg) console.log('保留可能エントリが無い :'+ Xps.getIdentifier(newXps));
			if(callback2 instanceof Function) setTimeout(callback2,10);
            return false ;
        }
}
/** 
    作業にチェックイン
    リポジトリ種別にかかわらないので
    このメソッドを呼ぶ前段でジョブ名称は確定しておくこと
    ジョブ名指定のない場合は操作失敗    
*/
localRepository.checkinEntry=function(myJob,callback,callback2){
    if( typeof myJob == 'undefined') return false;
    myJob = (myJob)? myJob:xUI.currentUser.handle;
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry){
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
            //次のJobへチェックイン 読み出したデータでXpsを初期化 
        var newXps = new Xps();
        var currentContents = localStorage.getItem(this.keyPrefix+currentEntry.toString(0));
        if (currentContents) {
            newXps.readIN(currentContents);
        } else {
if(dbg) console.log('読み出し失敗')
            return false;
        }
        // ユーザ判定は不用（権利チェックは後ほど実装）
        if (newXps){
            newXps.job.increment(myJob);
            newXps.update_user = xUI.currentUser;
            newXps.currentStatus = 'Active';
if(dbg) console.log(newXps.toString());//
             //引数でステータスを変更したエントリを作成 新規に保存 JobIDは必ず繰り上る
            // newXps.job=new XpsStage(jobName+':'+(parseInt(newXps.job.id)+jobIDoffset));
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var resultData = localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps));
if(dbg) console.log(resultData);
            var result = ( resultData == newXps.toString()) ? true:false;
            if(result){
if(dbg) console.log('checkin');
                //delete newXps ;
if(dbg) console.log(newXps.currentStatus);
                this.getList();//リストステータスを同期
                documentDepot.rebuildList();
                xUI.setReferenceXPS();
                xUI.XPS.job.increment(myJob);
                xUI.XPS.currentStatus='Active';//ドキュメントステータスを更新
                xUI.XPS.update_user=xUI.currentUser;//ユーザ更新
                xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                xUI.setUImode('production');//モードをproductionへ
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
//                sync('historySelector');//ここで　履歴セレクタの更新を行う
                if(callback instanceof Function){ setTimeout(function(){callback()},10)};
                return result;
            }else{
if(dbg) console.log(result);
            }
        }
if(dbg) console.log('編集権利取得失敗');
        // すべてのトライに失敗
        if(callback2 instanceof Function){ setTimeout(function(){callback2()},10)};
        return false ;
}
/**
    作業終了
*/
localRepository.checkoutEntry=function(callback,callback2){
if(dbg) console.log('localRepository.checkoutEntry');
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry) {
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        return false;
    }
            //Active > Fixed
        var newXps = new Xps();
        var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
        //ユーザ判定は不用 JobID変わらず
        if (newXps){
             //同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
            newXps.currentStatus = 'Fixed';
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());

            var result = (localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps))==newXps.toString())? true:false;
            if(result){
if(dbg) console.log(decodeURIComponent(Xps.getIdentifier(newXps)));
if(dbg) console.log(decodeURIComponent(currentEntry.toString(0)));
                localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
                this.getList();//リストステータスを同期
                documentDepot.rebuildList();
                xUI.XPS.currentStatus='Fixed';//ドキュメントステータスを更新
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                xUI.setUImode('browsing');//モードをbrousingへ
                if(callback instanceof Function){ setTimeout('callback()',10)};
                return result;
            }
        }
if(dbg) console.log('終了更新失敗');
        delete newXps ;
        if(callback2 instanceof Function){ setTimeout('callback2()',10)};
        return false ;
}
/**
    検収処理receiptEntry/receiptEntry
*/
localRepository.receiptEntry=function(stageName,jobName,callback,callback2){
    if( typeof stageName == 'undefined') return false;
    var myStage = nas.pm.stages.getStage(stageName) ;//ステージDBと照合　エントリが無い場合はエントリ登録
    /*  2106-12 の実装では省略して　エラー終了*/
    if(! myStage) return false;
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry){
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
            //次のステージを立ち上げるため 読み出したデータでXpsを初期化 
        var newXps = new Xps();
        var currentContents = localStorage.getItem(this.keyPrefix+currentEntry.toString(0));
        if (currentContents) {
            newXps.readIN(currentContents);
        } else {
if(dbg) console.log('読み出し失敗')
            return false;
        }
        // ユーザ判定は不用（権利チェックは後ほど実装）
        if (newXps){
            newXps.stage.increment(stageName);
            newXps.job.reset(jobName);
            newXps.update_user = xUI.currentUser;
            newXps.currentStatus = 'Startup';
if(dbg) console.log(newXps.toString());//
             //引数でステータスを変更したエントリを作成 新規に保存 stageIDは必ず繰り上る jobは0リセット
            // newXps.job=new XpsStage(jobName+':'+(parseInt(newXps.job.id)+jobIDoffset));
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var resultData = localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps));
if(dbg) console.log(resultData);
            var result = ( resultData == newXps.toString()) ? true:false;
            if(result){
if(dbg) console.log('receipt');
                //delete newXps ;
if(dbg) console.log(newXps.currentStatus);
                this.getList();//リストステータスを同期
                documentDepot.rebuildList();
                xUI.XPS.stage.increment(stageName);
                xUI.XPS.job.reset(jobName);
                xUI.XPS.currentStatus='Startup';//ドキュメントステータスを更新
                xUI.XPS.update_user=xUI.currentUser;//ユーザ更新
                xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                xUI.setUImode('browsing');//モードをbrowsingへ
                xUI.sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                if(callback instanceof Function){ setTimeout('callback()',10)};
                return result;
            }else{
if(dbg) console.log(result);
            }
        }
if(dbg) console.log('編集権利取得失敗');
        // すべてのトライに失敗
        if(callback2 instanceof Function){ setTimeout('callback2()',10)};
        return false ;
}
/**
    作業中断処理
*/
localRepository.abortEntry=function(myIdentifier){
    var currentEntry = this.entry(myIdentifier);
    if(! currentEntry) return false;
    switch (currentEntry.getStatus()){
        case 'Startup':
        case 'Hold':
        case 'Fixed':
        case 'Active':
            //管理モード下でのみ処理 このメソッドのコール自体が管理モード下でのみ可能にする
            //リポジトリに対して
        break;
    }
}


/*  test data 
    localRepository.currentProduct = "ももたろう#12[キジ参戦！ももたろう地獄模様！！]";
    localRepository.currentSC      = "S-C005 (12+00)/011(3+00)/014(3+00)";
    localRepository.currentLine    = 0;
    localRepository.currentStage   = 0;
    localRepository.currentJob     = 0;

JSON.stringify(localRepository);

localRepository.pushStore(XPS);
localRepository.getList();
//localRepository.entryList[0];
localRepository.getEntry(localRepository.entryList[0]);
*/
/**
    最終作業の破棄
    バックアップ作業これを呼び出す側で処理
    ここを直接コールした場合はバックアップは実行されない
    ユーザメッセージはここでは処理されない
    
*/
localRepository.destroyJob=function(callback,callback2){
    if(xUI.XPS.currentStatus != 'Active'){return false}
 //   カレントの作業に対応するステレージ上のキーを消去
  //  成功すれば
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry){
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
    }
    try {
        localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
		currentEntry.issues.pop();
        xUI.resetSheet(new Xps(5,144),new Xps(5,144));
        if(callback instanceof Function) callback();
    }catch(er){
        if(callback2 instanceof Function) callback2();
    }
}

/**
    ネットワーク上のリポジトリオブジェクト
    識別名とサーバを与えて初期化する
        リポジトリとしての共通メソッド
    .getList()
    .getEntry(myIdentifier)
    .pushEntry(myXps)
        
リポジトリに 相当する構造は Team
チームごとにリポジトリが設定される
Teamへアクセスするためのトークンは、アクセス毎に設定される
*/
NetworkRepository=function(repositoryName,myServer,repositoryURI){
    this.name = repositoryName;
    this.service = myServer;//リポジトリの所属するサーバ
    this.url=(typeof repositoryURI == 'undefined')?this.service.url:repositoryURI;//サーバとurlが異なる場合は上書き
    this.token=null;//nullで初期化
//サーバ内にTeamが実装 Teamをリポジトリとして扱うのでその切り分けを作成 12/13
//リストは素早いリポジトリの切り替えやリポジトリ同士のマージ処理に不可欠なのでここで保持
//    this.currentProduct;
//    this.currentSC;
//    this.currentLine;
//    this.currentStage;
//    this.currentJob;
//    this.product_token      = $('#server-info').attr('product_token');
//    this.episode_token      = $('#server-info').attr('episode_token');
//    this.cut_token          = $('#server-info').attr('cut_token');
// ?idの代替なので要らないか？ 
    this.currentIssue;
    this.productsData=[];
    this.entryList=[];
}
/**
    タイトル一覧をクリアして更新する エピソード更新を呼び出す
    受信したデータを複合させてサービス上のデータ構造を保持する単一のオブジェクトに
    getXx で概要（一覧）を取得
    xxUpdateが詳細を取得して this.productsData を上書きしてゆく
    プロダクト詳細は、各個に取得するように変更
    引き続きの処理を行う際はコールバック渡し
    コールバックがない場合は、全プロダクトの詳細を取得？
    プロダクトデータ取得のみの場合は　空動作のコールバックを渡す必要あり
*/
NetworkRepository.prototype.getProducts = function (callback,callback2){
    //this.productsData.length = 0;
    serviceAgent.currentRepository.productsData.length = 0;//プロパティを初期化（クリア）
    $.ajax({
        url: serviceAgent.currentRepository.url+'/api/v2/products.json',
        type: 'GET',
        dataType: 'json',
        success: function(result) {
		    serviceAgent.currentRepository.productsData=result;
		    if(callback instanceof Function){
		        callback();
		    }else{
		        serviceAgent.currentRepository.productsUpdate();
		    }
        },
        error : function(result){
            if(dbg) console.log('fail productsData::');
            if(dbg) console.log(result);
		    if(callback2 instanceof Function){callback2()}
        },
        beforeSend: serviceAgent.currentRepository.service.setHeader
    });

}
/**
    タイトルごとの詳細（エピソードリスト含む）を取得してタイトルに関連付ける
    引数がない場合はすべてのプロダクトを更新
    必要に従ってエントリリストの更新を行う
    引数がカラの場合は動作が止まるので注意
*/
NetworkRepository.prototype.productsUpdate = function(callback,callback2,myToken){
    if(typeof myToken == 'undefined'){
            myToken = [];
        for(var idx = 0 ;idx < serviceAgent.currentRepository.productsData.length ;idx ++){
            myToken.push(serviceAgent.currentRepository.productsData[idx].token);
        }
    }else{
        if(!(myToken instanceof Array)) myToken=[myToken];
    }
    for(var idx = 0 ;idx < myToken.length ;idx ++){
    $.ajax({
        url: serviceAgent.currentRepository.url+'/api/v2/products/'+myToken[idx]+'.json' ,
        type: 'GET',
        dataType: 'json',
        success: function(result) {
            var productUpdated=false;
            for(var idx = 0 ;idx < serviceAgent.currentRepository.productsData.length ;idx ++){
                //プロダクトデータを詳細データに「入替」
		            if(result.token == serviceAgent.currentRepository.productsData[idx].token){
if(dbg) console.log("update product data detail:"+serviceAgent.currentRepository.productsData[idx].name) ;
if(dbg) console.log(serviceAgent.currentRepository.productsData);
		                serviceAgent.currentRepository.productsData[idx]=result ;
		                productUpdated=true;
		                break;
		            }
		    };
//		    if(update) serviceAgent.currentRepository.getEpisodes(idx,callback);//カレントのID渡し（タイミングずれでエラー発生の可能性高い）
console.log("updated : "+productUpdated)
		    if(productUpdated) {
		        if(callback instanceof Function){
		            console.log("exec callback");
//		            console.log(callback)
		            callback();
		        }else{
		            serviceAgent.currentRepository.getEpisodes(false,false,serviceAgent.currentRepository.productsData[idx].token);
                };
		        //プロダクトトークン渡し
		    }else{
if(dbg) console.log('fail productsData update no entry in Repository::');
if(dbg) console.log(result);
		        //指定されたトークンが ,リポジトリ内に存在しないのでエラー
		        if(callback2 instanceof Function){callback2();}
		    };
        },
        error : function(result){
if(dbg) console.log('fail productsData update::');
if(dbg) console.log(result);
		    if(callback2 instanceof Function){callback2();}
        },
        beforeSend: (serviceAgent.currentRepository.service.setHeader)
    });

    }
}
/**
    プロダクトごとにエピソード一覧を再取得してデータ内のエピソード一覧を更新
    引数 product_token
*/
NetworkRepository.prototype.getEpisodes = function (callback,callback2,myToken) {
//        var myProduct = this.getNodeElementByToken(myToken);
        var myProduct = serviceAgent.currentRepository.getNodeElementByToken(myToken);
        if(! myProduct) return false;
console.log("getEpisodeList : "+myToken+' : '+myProduct.name) ;
    $.ajax({
        url: serviceAgent.currentRepository.url+'/api/v2/episodes.json?product_token='+myProduct.token ,
        type: 'GET',
        dataType: 'json',
        success: function(result) {
                //プロダクトデータのエピソード一覧を「入替」
console.log(result);
		    if(result){
//		      serviceAgent.currentRepository.productsData[pid].episodes[0]=result ;
		        myProduct.episodes[0]=result
console.log(myProduct);
//        if(dbg) console.log('get Episodes :'+myProduct.name);
                if(callback instanceof Function){
                    callback();
                }else{
                    for(var eid=0;eid<myProduct.episodes[0].length;eid++){
		                serviceAgent.currentRepository.episodesUpdate(callback,callback2,myProduct.episodes[0][eid].token);
		            }
		        }
		    }else{
console.log('fail get no episodes::');
console.log(result);
		        if(callback2 instanceof Function){callback2();}		        
		    }
        },
        error : function(result){
console.log('fail getting Episodes::');
console.log(result);
		    if(callback2 instanceof Function){callback2();}
        },
        beforeSend: serviceAgent.currentRepository.service.setHeader
    });
}
/**
    episode_token を指定して詳細を取得 内部リストにコンバート
 */
NetworkRepository.prototype.episodesUpdate = function (callback,callback2,epToken) {
        var  myEpisode = this.getNodeElementByToken(epToken);
        if(! myEpisode) return false;
console.log("get Episodes Detail for : "+myEpisode.name) ;
console.log("get Episodes Token : "+myEpisode.token) ;
	            // /api/v2
                var targetURL = serviceAgent.currentRepository.url+ '/api/v2/episodes/'+myEpisode.token +'.json';
console.log(targetURL);
	    $.ajax({
            url: targetURL,
            type: 'GET',
            dataType: 'json',
            success: function(result) {
console.log('get episode details:');
console.log(result);
//オブジェクト入れ替えでなくデータの追加アップデートに変更
//内容は等価だがAPIの変更時は注意
//この時点でカットの総数が取得されるのでカット一覧詳細取得時総数を参照して分割取得
                myEpisode.cuts = result.cuts;
                myEpisode.created_at = result.created_at;
                myEpisode.updated_at = result.updated_at;
//    console.log(serviceAgent.currentRepository.getNodeElementByToken(myEpisode.token));
                if(callback instanceof Function){
                    callback();
                }else{
                    //標準処理
                    serviceAgent.currentRepository.getSCi(callback,callback2,myEpisode.token);
                }
            },
            error : function(result){
console.log('fail getting episode details::');
console.log(result);
		        if(callback2 instanceof Function){callback2();}
            },
            beforeSend: serviceAgent.currentRepository.service.setHeader
        });
};
/**
    エピソード毎にカットリストを再取得
    エピソード詳細の内部情報にコンバート
    カット一覧にdescriptionを出してもらう
    
引数
    epToken   ターゲットの話数キー
    pgNo      リストのページID　1 origin
    ppg       ページごとのエントリ数
 */
NetworkRepository.prototype.getSCi = function (callback,callback2,epToken,pgNo,ppg) {
    var myEpisode = this.getNodeElementByToken(epToken);
    if((! myEpisode)||(! myEpisode.cuts)) return false;
    if(typeof pgNo == 'undefined') pgNo = '1';
    if(typeof ppg  == 'undefined')  ppg = myEpisode.cuts[0].length;
    var targetURL = serviceAgent.currentRepository.url+ '/api/v2/cuts.json?episode_token='+epToken+'&page_no='+parseInt(pgNo)+'&per_page='+parseInt(ppg);
console.log(targetURL);
	            $.ajax({
                    url: targetURL,
                    type: 'GET',
                    dataType: 'json',
                    success: function(result){
console.log('episode:'+myEpisode.name);
console.log(result);
console.log(myEpisode);
//                        if(myEpisode.cuts){};
                            if(myEpisode.cuts[0].length!=result.length)
                            myEpisode.cuts[0]=result;
//                            myEpisode.cuts[1]=result;
                        
                      searchLoop:{
                        for( var idx = 0 ; idx < serviceAgent.currentRepository.productsData.length ; idx ++){
                            if((typeof serviceAgent.currentRepository.productsData[idx].episodes == 'undefined')||(serviceAgent.currentRepository.productsData[idx].episodes[0].length == 0)) continue;//エピソード数０の際は処理スキップ
                            for( var eid = 0 ; eid < serviceAgent.currentRepository.productsData[idx].episodes[0].length ; eid ++){
                                if(epToken == serviceAgent.currentRepository.productsData[idx].episodes[0][eid].token ){
//                                    console.log(serviceAgent.currentRepository.productsData[idx]);
//                                    serviceAgent.currentRepository.productsData[idx].episodes[0][eid].cuts[1]=result;//cuts[1] としてアクセス
/**
エントリ取得タイミングで仮にcutのdescription を追加するcuts[1][cid].description を作成して調整に使用する
本番ではデータ比較ありで、入替えを行う　サーバ側のプロパティ優先
*/
    var myIdentifier_opus =
        encodeURIComponent(serviceAgent.currentRepository.productsData[idx].name) +
        '#'+encodeURIComponent(serviceAgent.currentRepository.productsData[idx].episodes[0][eid].name) +
        ((serviceAgent.currentRepository.productsData[idx].episodes[0][eid].description)?
            '['+encodeURIComponent(serviceAgent.currentRepository.productsData[idx].episodes[0][eid].description) +']':''
        );
for ( var cid = 0 ; cid < result.length ; cid ++){
    if(serviceAgent.currentRepository.productsData[idx].episodes[0][eid].cuts[0][cid].name == null){
        serviceAgent.currentRepository.productsData[idx].episodes[0][eid].cuts[0][cid].name = "";
//        serviceAgent.currentRepository.productsData[idx].episodes[0][eid].cuts[1][cid].name = "";
    };
    var myIdentifier_cut = encodeURIComponent(serviceAgent.currentRepository.productsData[idx].episodes[0][eid].cuts[0][cid].name);

    // デスクリプションに識別子がない場合issuen部の無い識別子を補う
    // 他はDB側の識別子を優先して識別子を更新する
    if(! serviceAgent.currentRepository.productsData[idx].episodes[0][eid].cuts[0][cid].description){
        serviceAgent.currentRepository.productsData[idx].episodes[0][eid].cuts[0][cid].description=[myIdentifier_opus,myIdentifier_cut].join('//');
    } else {
        var currentIssue = serviceAgent.currentRepository.productsData[idx].episodes[0][eid].cuts[0][cid].description.split("//").slice(2);
        serviceAgent.currentRepository.productsData[idx].episodes[0][eid].cuts[0][cid].description=([myIdentifier_opus,myIdentifier_cut].concat(currentIssue)).join('//');
        
    }
}
                                   break searchLoop;
                                };//epsode serch hit
                            };//episodes
                        };//products
                      };//serchloop
                        if(callback instanceof Function){
                            callback();
                        }else{
                            serviceAgent.currentRepository.getList(false);
                        }
                    },
                    error : function(result){
if(dbg) console.log('getSCi ::');
if(dbg) console.log(result);
		                if(callback2 instanceof Function){callback2();}
                    },
                    beforeSend: serviceAgent.currentRepository.service.setHeader
                });
};

/**
リポジトリ内のentryListを更新する
documentsDataの更新が必要なケースでは、force スイッチを置く
force スイッチが与えられるかまたはプロダクトリストに値がない場合はプロダクトの取得から処理が開始され
現在のリストはクリアされずに（バッファリストを作って比較）更新が行われる

このメソッド自体　サービス内のエントリを取得してentryListを更新するのが目的なので
一括取得をやめるまたはこのメソッドの再帰的な呼び出しをやめるかいずれかの処置が必要
getProductsからの再呼び出しは再クリアがあるのでOK
それ以外のメソッドからの再呼び出しは厳禁
代わりに　entryListに編集メソッドを設けて出力はそちらにつなぐものとする
entryList.store(entry)    エントリを加える　同じidfのエントリは上書きする
entryList.remove(idf)    エントリを削除する　idf指定
entryList.get(idf)    エントリを加える　同じトークンのエントリは上書きする


documentDepot.documents は　serviceAgent.currentRepository.entryList への参照

更新時点の新規データを常に参照可能　リポジトリを切り替える際に参照を切り替えれば、特に問題はない？

オブジェクトをクリアしなければ問題ないはず
entryListの機能性を高めてスタティックオブジェクト化する

getList等のentrListを更新するメソッドはリストのメソッドを使ってリストを更新する

store(listEntry)


*/
NetworkRepository.prototype.getList = function (force,callback){
console.log("clear entryList \n rebuild entryList from documentsData");
console.log(this.productsData);
//    serviceAgent.currentRepository.entryList.length=0;

    this.entryList.length=0;//エントリリスト初期化

    var newList = []; //新規配列作成
    
    if((force)||(serviceAgent.currentRepository.productsData.length==0)) {
console.log('call getProducts');//プロダクト取得を設定して関数終了＝一旦処理を中断
        serviceAgent.currentRepository.getProducts();
        return;//最終工程でこの関数が再度呼び出される
    }else{
console.log('call productsUpdate');//プロダクト情報更新
       for(var idx = 0 ;idx < serviceAgent.currentRepository.productsData.length ;idx ++){
            var currentTitle = serviceAgent.currentRepository.productsData[idx];//Object取得
            if(typeof currentTitle.episodes == "undefined"){
                if(! force){console.log('skiped :') ;continue;}
                serviceAgent.currentRepository.productsUpdate(function(){
                    serviceAgent.currentRepository.getEpisodes(false,false,currentTitle.token);
                },false,currentTitle.token);
                return;//情報不足中断
            }
            if( currentTitle.episodes[0].length == 0 ) continue;
            for(var eid = 0 ;eid < serviceAgent.currentRepository.productsData[idx].episodes[0].length ; eid ++){
                var currentEpisode = currentTitle.episodes[0][eid];
                if(typeof currentEpisode.cuts == "undefined"){
                if(! force){console.log('skip :'+currentEpisode.name) ;continue;}
                    serviceAgent.currentRepository.episodesUpdate(false,false,currentEpisode.token);
                    return;//中断
                }
console.log('products check clear');console.log(currentEpisode);
//                if( currentEpisode.cuts.length==1){serviceAgent.currentRepository.getSCi(false,false,currentEpisode.token);return;}
                if( currentEpisode.cuts[0].length == 0 ) continue;
                for(var cid = 0 ; cid < currentEpisode.cuts[0].length ;cid ++){
/*
    管理情報は識別子から取得する
APIの情報は、識別子と一致しているはずだが　照合の上異なる場合はAPIの情報で上書きを行う
識別子として　cut.description を使用　上位情報は、エントリから再作成
サブタイトルは　episode.discriptionを使用
兼用カット情報はペンディング
*/
                var myCutToken = currentEpisode.cuts[0][cid].token;
                var myCutLine  = (currentEpisode.cuts[0][cid].line_id)?
                    currentEpisode.cuts[0][cid].line_id:
                    (new XpsLine(nas.pm.pmTemplate[0].line.toString())).toString(true);
                var myCutStage = (currentEpisode.cuts[0][cid].stage_id)?
                    currentEpisode.cuts[0][cid].stage_id:
                    (new XpsStage(nas.pm.pmTemplate[0].stages[0].toString())).toString(true);
                var myCutJob   = (currentEpisode.cuts[0][cid].job_id)?
                    currentEpisode.cuts[0][cid].job_id:
                    (new XpsStage(nas.pm.jobNames.members[0].toString())).toString(true);
                var myCutStatus= (currentEpisode.cuts[0][cid].status)?
                    currentEpisode.cuts[0][cid].status:'Startup';

//管理情報が不足の場合は初期値で補う description情報が未登録の場合は、APIの情報からビルドする？
if(! currentEpisode.cuts[0][cid].description){
    currentEpisode.cuts[0][cid].description="";
if(dbg)    console.log(currentEpisode.cuts[0][cid]);
};
                var entryArray = (
                    String(currentEpisode.cuts[0][cid].description).split('//').concat([
                        encodeURIComponent(myCutLine),
                        encodeURIComponent(myCutStage),
                        encodeURIComponent(myCutJob),
                        myCutStatus
                    ])
                ).slice(0,6);//

                var myEntry=entryArray.slice(0,2).join( "//" );//管理情報を外してSCi部のみ抽出
//                var hasEntry = false;
//                var currentEntryID =false;

                var currentEntry=serviceAgent.currentRepository.entry(currentEpisode.cuts[0][cid].description);//既登録エントリを確認
                if(currentEntry){
                    //データ構造上このパートが実行されるケースは無い…はず　versionIDがつかない＝エラーエントリになる
                    currentEntry.push(entryArray.slice(2).join("//"),currentTitle.token,currentEpisode.token,myCutToken);
                }else{
                    var newEntry = new listEntry(entryArray.join('//'),currentTitle.token,currentEpisode.token,myCutToken);
                    newEntry.parent = serviceAgent.currentRepository;
                    serviceAgent.currentRepository.entryList.push(newEntry);
                    // エントリ配下にversionsがあればそのままpush
if(! currentEpisode.cuts[0][cid].versions){
    currentEpisode.cuts[0][cid].versions=[];//
/*
        new XpsLine(nas.pm.pmTemplate[0].line).toString(true),
        new XpsStage(nas.pm.pmTemplate[0].stages[0]).toString(true),
        new XpsStage(nas.pm.jobNames.getTemplate(nas.pm.pmTemplate[0].stages[0],"init")[0]).toString(true),
        "Startup"
*/
//    console.log(currentEpisode.cuts[0][cid]);
};
                    for (var vid = 0;vid<currentEpisode.cuts[0][cid].versions.length;vid++){
                        var myVersionString=(currentEpisode.cuts[0][cid].versions[vid].description)?
                            currentEpisode.cuts[0][cid].versions[vid].description:entryArray.join("//");
                        var myVersionToken = currentEpisode.cuts[0][cid].versions[vid].version_token;
if(dbg) console.log("push entry : "+ myVersionString);
                       newEntry.push(myVersionString,currentTitle.token,currentEpisode.token,myCutToken,myVersionToken);
                    }
                }
            }
        }
    }
    }
    documentDepot.documentsUpdate();
    //現在すべてのデータを取得後にドキュメントブラウザの更新を行っているためレスポンスが途絶える
    //これを解消するためにドキュメントブラウザが逐次更新を行えるように改装を行う
    if(callback instanceof Function) callback();
    return serviceAgent.currentRepository.entryList.length;
}

/**
online-sigleモード用にエントリを一つだけ（高速に）作って固定する

以下の構造の productsDataを組む

タイトル/詳細は、該当タイトル一つのみ
エピソード/詳細も当該カットの親一つのみ
カットも当該カット一つのみ

NetworkRepository.prototype.buildProducts=function(){
    serviceAgent.currentServer.getRepositories(function(){
        serviceAgent.currentRepository.getEntry();
    });
}    
*/
/**
識別子（ユーザの選択）を引数にして実際のデータを取得
識別子に管理情報が付いている場合はそれを呼ぶ
管理情報なしの場合は、当該エントリの最新ジョブの内容を呼ぶ
管理情報が未fixの場合は編集エリア、既fixの場合はリファレンスエリアに読み込む

ターゲットジョブに先行するジョブがある場合は、そのジョブをリファレンスとしてコールバック内で呼ぶ

動作仕様調整
識別子引数は同じだが、完全型式の引数＋動作を渡してここでは判定を行わないように変更
判定はブラウザ又はサービスエージェントの同名関数が行う
引数の自動補完もしない

サーバからの読み出し後に、データ照合を行ってデータから生成される識別子がサーバの識別子と一致するように調整
サーバ側指定を優先してデータは自動更新される
詳細情報を受け取った際に補助情報又は受け取ったオブジェクトそのものをバックアップすること
*/
NetworkRepository.prototype.getEntry = function (myIdentifier,isReference,callback,callback2){
    if(typeof isReference == 'undefined'){isReference = false;}
    //識別子をパース
    var targetInfo     = Xps.parseIdentifier(myIdentifier);//?

    var myIssue = false;
    var refIssue = false;

    var myEntry = this.entry(myIdentifier);
    if(! myEntry){
if(dbg) console.log("noProduct : "+ decodeURIComponent(myIdentifier));//プロダクトが無い
        return false;
    }
    if(! targetInfo.currentStatus){
    //ターゲットに管理部分がないので、最新のissueとして補う
        var cx = myEntry.issues.length-1;
        myIssue = myEntry.issues[cx];
    }else{
    //指定管理部分からissueを特定する 連結して比較（後方から検索)リスト内に指定エントリがなければ失敗
        checkIssues:{
            for (var cx = (myEntry.issues.length-1) ; cx >= 0 ;cx--){
               if ( Xps.compareIdentifier(myEntry.issues[cx].identifier,myIdentifier) > 4){
                    myIssue = myEntry.issues[cx];
                    break checkIssues;
                }
            }
            if (! myIssue){
if(dbg) console.log( 'no target data :'+ decodeURIComponent(myIdentifier) );//ターゲットのデータが無い
                return false;
            }
        }
    }
// 構成済みの情報を判定 (リファレンス置換 or 新規セッションか)
//      myIssue; これがカットへのポインタ episode.cuts配列のエントリ myIssue.url にアドレスあり
//      urlプロパティが無い場合はid があるのでidからurlを作成する
    if(! myIssue.versionID){
        var targetURL=(myIssue.url)? myIssue.url: '/api/v2/cuts/'+myIssue.cutID.toString()+'.json';
    }else{
        var targetURL=(myIssue.url)? myIssue.url: '/api/v2/cuts/'+myIssue.cutID.toString()+'/'+String(myIssue.versionID)+'.json';
if(dbg) console.log(targetURL);
    }
    if(! isReference){
/**
暫定補助情報フォーマット
    product.name
        decoded name
    product.description
    episode.name
        decoded name
    episode.description
        decoded subtitle 
    cut.name
        decoded name
    cut.description
        identifier-fullformat
*/
    $.ajax({
        url: this.url + targetURL,
        type: 'GET',
        dataType: 'json',
        success: function(result) {
if(dbg) console.log(result);
//データ請求に成功したので、現在のデータを判定して処理の必要があれば処理
        	var myContent=result.content;//XPSソーステキストをセット
        	var currentXps = new Xps(5,144);
	        if(myContent){ currentXps.parseXps(myContent);};
//myContent==nullのケースは、サーバに空コンテンツが登録されている場合なので単純にエラー排除してはならない
//エラーではなく初期化時点の初期状態のXpsのままで処理を継続する
            //xUI.userPermissions=result.permissions;
//読み込んだXPSが識別子と異なっていた場合識別子優先で同期する
	            xUI.resetSheet(currentXps);
console.log(xUI.XPS);
                xUI.XPS.syncIdentifier(myIssue.identifier);
	            if(myEntry.issues.length>1){
                    documentDepot.currentReference = new Xps(5,144);//カラオブジェクトをあらかじめ新規作成
                    //自動設定されるリファレンスはあるか？
                    //指定管理部分からissueを特定する 文字列化して比較
                    if ( cx > 0 ){
                        if(parseInt(decodeURIComponent(myIssue[2]).split(':')[0]) > 0 ){
                    //ジョブIDが１以上なので 単純に一つ前のissueを選択する
                    //必ず先行jobがある  =  通常処理の場合は先行JOBが存在するが、単データをエントリした場合そうでないケースがあるので対処が必要　2016 12 29
                        refIssue = myEntry.issues[cx-1];
                        }else if(decodeURIComponent(myIssue[1]).split(':')[0] > 0 ){
                    //第2ステージ以降前方に向かって検索
                    //最初にステージIDが先行IDになった要素が参照すべき要素
                            for(var xcx = cx-1 ;xcx >= 0 ; xcx --){
                                if (parseInt(decodeURIComponent(myEntry.issues[xcx][1]).split(':')[0]) == (parseInt(decodeURIComponent(myIssue[1]).split(':')[0])-1)){
                                    refIssue = myEntry.issues[xcx];
                                    break;
                                }
                            }
                        };//cx==0 のケースでは、デフォルトで参照すべき先行ジョブは無い
	                }
	                if(refIssue) serviceAgent.currentRepository.getEntry(refIssue.identifier,true);
	            }
	            //xUI.resetSheet(XPS);
                xUI.sessionRetrace = myEntry.issues.length-cx-1;
                xUI.setUImode('browsing');sync("productStatus");
                if(callback instanceof Function) callback();
        },
        error:function(result){
if(dbg) console.log(result);
            if(callback2 instanceof Function) callback2();
        },
        beforeSend: this.service.setHeader
    });

}else{
    //データ単独で現在のセッションのリファレンスを置換
    $.ajax({
        url: this.url + targetURL,
        type: 'GET',
        dataType: 'json',
        success: function(result) {
            var myContent=result.content;//XPSソーステキストをセット
if(dbg) console.log('import Reference'+myContent);
	        documentDepot.currentReference=new Xps();
	        documentDepot.currentReference.readIN(myContent);
	        xUI.setReferenceXPS(documentDepot.currentReference);
//	        xUI.sWitchPanel('File');
            if(callback instanceof Function) callback();
        },
        error: function(result){
if(dbg) console.log(result);
            if(callback2 instanceof Function) callback2();
        },
        beforeSend: this.service.setHeader
    });
}
  return null;
}
/**
    標準コールバックを作る
    コールバック関数が引数で与えられなかった場合は xUIに新規Xpsとして与えて読み込ませる
    読み出したエントリに前方のジョブがあれば、それをリファレンスとして与えるルーチンも必要

function(result){
	var myContent=result.content;//XPSソーステキストをセット
//以下が標準の読み込み時の初期化
	if(xUI.XPS.readIN(myContent)){xUI.resetSheet(xUI.XPS);}
    if(that.
}
function(result){
	var myContent=result.content;//XPSソーステキストをセット
	myXps=new Xps();
    xUI.setReferenceXPS(myXps)
}
    外部からコールバックを与える場合は、以下のようなケース
未fixのXPSをリファレンスペインに読み込む操作（これに関してはオプションをつけたほうが良さそう？）


 */
/**
    DBにタイトルを作成する。
    confirmなし 呼び出し側で済ませること
    必要あれば編集UI追加
引数:
    タイトル（必須）
    備考テキスト
    Pmオブジェクト
    コールバック関数２種
戻値:
     なし

識別子は受け入れない　必要に従って前段で分解のこと
*/
NetworkRepository.prototype.addTitle = function (myTitle,myDescription,myPm,callback,callback2){
/*
    識別子を検出（呼び出し側で）このルーチンまで来た場合は、引数を分解しておくこと
    2107.01.28時点でAPIにtemplateが出ていないのでpmの処理は省略　遅延で詳細編集を行っても良い
    serviceAgent.currentRepository.addTitle("tST2","testTitlewith API")
    作成時に検査を行い、既存タイトルならば処理を中断する（呼び出し側で）
    タイトル作成前に確認メッセージを出す（これも呼び出し側）
    現在はPmオブジェクトは機能していない　2/9 2017
*/
    if(! myTitle) return false;
    if(! myDescription) myDescription="";
//      var parseData = Xps.parseIdentifier(myTitle);
//      if(parseData){myTitle=parseData.title};
    var data = {
        product: {
          name          : myTitle,
          description   : myDescription,
        } 
    };

	$.ajax({
		type : 'POST',
		url : serviceAgent.currentRepository.url+"/api/v2/products.json",
		data : data,
		success : function(result) {
if(dbg) console.log('success');
if(dbg) console.log(result);
            if(callback instanceof Function) callback();
		},
		error:function(result) {
if(dbg) console.log('error');
if(dbg) console.log(result);
            if(callback2 instanceof Function) callback2();
		},
		beforeSend: serviceAgent.currentRepository.service.setHeader
	});
}
/**
    DBにOPUS(エピソード)を作成する。
引数
    タイトルを含む識別子　カット番号は求めない
    コールバック関数２種
    識別子のみ受け入れ
    このルーチンを呼び出す時点で、タイトルは存在すること
    手続的には、カット作成を主眼にして
    Title/Opus 等の上位のオブジェクトが存在しない時点で自動でコールされるように調整する？
    
*/
NetworkRepository.prototype.addOpus = function (myIdentifier,prodIdentifier,callback,callback2){
/*
    listEntry.titleID
*/
    var parseData = Xps.parseIdentifier(myIdentifier);
    if(! parseData){
        if(callback2 instanceof Function) callback2;
        return;
    }
    var myProduct = parseData.product;
    
    var myEntry=false;
    if(typeof prodIdentifier == 'undefined'){
        for (var pid=0;pid<documentDepot.products.length;pid ++){
        //productsのメンバをオブジェクト化したほうが良いかも
            var prdInfo=Xps.parseProduct(documentDepot.products[pid]);
            if(prdInfo.title==myProduct.title) {
                 myEntry = serviceAgent.currentRepository.entry(documentDepot.products[pid]);
                break;
            }
        };
    }else{
        myEntry = serviceAgent.currentRepository.entry(prodIdentifier+"//",true);
    }
    if(!myEntry){
        if(callback2 instanceof Function) callback2;
        return;
    }
    var data = {
        episode: {
          product_token : myEntry.productID,
          name          : myProduct.opus,
          description   : myProduct.subtitle
        } 
    };

	$.ajax({
		type : 'POST',
		url : serviceAgent.currentRepository.url+"/api/v2/episodes.json",
		data : JSON.stringify(data),
		success : function(result) {
		    if( callback instanceof Function) callback();
		},
		error:function(result) {
		    if( callback2 instanceof Function) callback2();
		},
		beforeSend: serviceAgent.currentRepository.service.setHeader
	});
}
/**
データオブジェクトを渡してリポジトリにプッシュする
一致エントリがあれば上書き
一致エントリで先行の管理情報がロックされている場合はリジェクト
管理情報の世代が上がっていれば追加の管理情報を添えて保存
タイトルがDBに登録されていない場合は、ユーザの確認をとってタイトルを作成
エピソードがDBに登録されていない場合も同様

これは保存系のAPIが出てから調整
*/

NetworkRepository.prototype.pushEntry = function (myXps,callback,callback2){
//識別子取得
    var myIdentifier=Xps.getIdentifier(myXps,true);//６要素で取得
    
//識別子に相当するアイテムがリポジトリに存在するかどうかをチェック
//    var targetArray = String(myIdentifier).split( '//' );//ここでは必ず6要素ある?
//    var myProductUnit   = targetArray.slice(0,2).join( '//' );//プロダクトユニットを抽出?

    var currentEntry=this.entry(myIdentifier);
    if(currentEntry){
            //既存のエントリが有るのでストレージとリストにpushして処理終了
        this.pushData('PUT',currentEntry,myXps,callback,callback2)
    }else{
/**
    currentEntry==null なので、ターゲットのエピソードtokenを再取得して引数で渡す必要あり １２・２１
*/
            //新規エントリなので新たにPOSTする (空エントリを引数に付ける)
//        var tmpEntry= new listEntry(Xps.getIdentifier(myXps));
        var tmpEntry= this.entry(Xps.getIdentifier(myXps),true);
        this.pushData('POST',tmpEntry,myXps,callback,callback2)    
    }
};
/**
    サーバにデータを送信する（メンテナンスメソッド）
    引数:
        メソッド
        myProduct
        Xpsオブジェクト
        成功時コールバック関数
        失敗時コールバック関数

リポジトリ上に既存エントリはPUT 新規エントリはPOSTで　送信
タイトルや、エピソードが存在しないデータはリジェクト
オンサイト時は　各種データをbackend_variablesから取得
それ以外の場合は、documentDepotから取得をトライする
取得に失敗した場合は送信失敗



<span id="backend_variables" data-user_access_token="4dcb5a249c94aa21529a522e23de730f176d032d8e1e1bf621c8f09b0d733566"
                               data-user_token="aWWMWNKW2HAfuRHWANZKbETy"
                               data-user_name="ねこまたや"
                               data-user_email="kiyo@nekomataya.info"
                               data-episode_id="17"
                               data-cut_id="24"　
                               data-episode_token="mfjVjBUuG6Q8GHu7u6nzJTa2"
                               data-cut_token="73o16nRYK7oqNNmeGDHWizLV"
                               data-line_id="0:(primary)"
                               data-stage_id="0:Startup"
                               data-job_id="1:work"
                               data-status="Active"
  ></span>
  myEntry を myProduct に換装
  listEntry > productsData.episodes[0]
*/
NetworkRepository.prototype.pushData = function (myMethod,myEntry,myXps,callback,callback2){
if(dbg) console.log(myEntry);
if (myEntry instanceof listEntry){
//エントリオブジェクト渡し
	var lastIssue   = myEntry.issues[myEntry.issues.length-1];

    var title_name     = myEntry.product.split('#')[0];
    var episode_name   = myEntry.product.split('#')[1];
    var cut_name       = (myMethod == 'PUT')? myEntry.sci:'s'+((myXps.scene)? myXps.scene:'-')+'c'+myXps.cut+"("+nas.Frm2FCT(myXps.time(),3)+")";
    var line_id        = myXps.line.toString(true);
    var stage_id       = myXps.stage.toString(true);
    var job_id         = myXps.job.toString(true);
    var status         = myXps.currentStatus;
/*
    var line_id        = lastIssue[0];
    var stage_id       = lastIssue[1];
    var job_id         = lastIssue[2];
    var status         = lastIssue[3];
*/
}else{
//プロダクト(該当カットはなし)
	var lastIssue   = ['0:','0:','0:','Startup'];

    var title_name     = myEntry.product.split('#')[1];
    var episode_name   = encodeURIComponent(myEntry.name);
    var cut_name       = (myMethod == 'PUT')? myEntry.sci:'s'+((myXps.scene)? myXps.scene:'-')+'c'+myXps.cut+"("+nas.Frm2FCT(myXps.time(),3)+")";
    var line_id        = myXps.line.toString(true);
    var stage_id       = myXps.stage.toString(true);
    var job_id         = myXps.job.toString(true);
    var status         = myXps.currentStatus;
/*
    var line_id        = lastIssue[0];
    var stage_id       = lastIssue[1];
    var job_id         = lastIssue[2];
    var status         = lastIssue[3];
*/
    
}
//オンサイト・シングルドキュメントバインドの場合はbackend_variablesから情報を取得
  if(serviceAgent.currentStatus=="online-single"){
//  if(document.getElementById('backend_variables')){}
	var episode_token   = $('#backend_variables').attr('data-episode_token');
	var cut_token       = $('#backend_variables').attr('data-cut_token');
  }else{
	var episode_token   = myEntry.episodeID;
	var cut_token       = (myMethod == 'PUT')? lastIssue.cutID:false;
  }
if(dbg) console.log(episode_token);
if(dbg) console.log(cut_token);
if(dbg) console.log(decodeURIComponent(cut_name));
//return
/**
	保存時に送り出すデータに
		タイトル・エピソード番号（文字列）・サブタイトル
		カット番号+カット尺
	を加えて送出する
	型式をきめこむ
	サーバ側では、これが保存状態と異なる場合は、エラーを返すか又は新規タイトルとして保存する必要がある。
	アプリケーション側は、この文字列が異なる送出を抑制して警告を出す？
このメソッドは、既存のエピソードに対しての追加機能のみ
タイトル作成及びエピソード作成は別に用意する	
*/
if(myMethod=='POST'){
//新規エントリ作成
	json_data = {cut:{
		     		episode_token   : episode_token,
	                name            : decodeURIComponent(cut_name),
	                description     : Xps.getIdentifier(myXps,true),
			 		status          : myXps.currentStatus,
			 		job_id          : decodeURIComponent(myXps.job.toString(true)),
			 		stage_id        : decodeURIComponent(myXps.stage.toString(true)),
			 		line_id         : decodeURIComponent(myXps.line.toString(true)),
			 		content         : myXps.toString()
				}};
		method_type = 'POST';
		target_url = '/api/v2/cuts.json';
}else{
//エントリ更新
	json_data = {
		     		token: cut_token,
		     		cut:{
	                   name         : decodeURIComponent(cut_name),
//	                   description  : myEntry.toString(true),
	                   description  : Xps.getIdentifier(myXps,true),
			 		   content      : myXps.toString(),
//			 		 cut_token   : cut_id,
//			 		 title_name  : title_name,
//			 		 episode_name: episode_name,
//			 		 cut_name    : cut_name,
			 		   line_id     : decodeURIComponent(line_id),
			 		   stage_id    : decodeURIComponent(stage_id),
			 		   job_id      : decodeURIComponent(job_id),
			 		   status      : status
				}};
		method_type = 'PUT';
		target_url = '/api/v2/cuts/' + cut_token + '.json'
}

/*
開発中の 制作管理DB/MAP/XPS で共通で使用可能なnas.SCInfoオブジェクトを作成中
これに一意のIDを持たせる予定です。
*/
if(dbg) console.log(method_type+' :'+serviceAgent.currentRepository.url+target_url +'\n' +JSON.stringify(json_data));
	$.ajax({
		type : method_type,
		url : serviceAgent.currentRepository.url+target_url,
		data : JSON.stringify(json_data),
		contentType: 'application/JSON',
		dataType : 'JSON',
		scriptCharset: 'utf-8',
		success : function(result) {
                if (xUI.XPS === myXps) xUI.setStored('current');
//			xUI.setStored("current");//UI上の保存ステータスをセット
			sync();//保存ステータスを同期
            
			if( method_type == 'POST'){
if(dbg) console.log("new cut!");
if(dbg) console.log(result);
				$('#backend_variables').data('cut_token', result['token']);
			}else{
if(dbg) console.log('existing cut!');
			}

            serviceAgent.currentRepository.getList(true);//リストステータスを同期
            documentDepot.rebuildList();
            if(callback instanceof Function){callback();}
		},
		error : function(result) {
            if(callback2 instanceof Function){callback2();}
			// Error
if(dbg) console.log("error");
if(dbg) console.log(result);
		},
		beforeSend: serviceAgent.currentRepository.service.setHeader
	});

};

/**
    ネットワークリポジトリのエントリをアプリケーションから削除することは無いので以下のメソッドは不用？
    APIにハードデリートとソフトデリートを出してもらう？
    削除が可能な条件は
    自分自身が開始した作業セッションであること && 最終の作業セッションであること
    エントリをすべて削除するにはオプションが必要
    識別子がフル（）
    
    
*/
NetworkRepository.prototype.removeEntry = function (myIdentifier){
//
//識別子 からエントリを特定して削除する？
};
/**
    エントリリストを検索して該当するリストエントリを返す操作をメソッド可
引数:
    識別子
    プロダクト検索オプション
戻値:
    識別子に該当するlistEntry
    または episode情報
    データ照合に失敗した場合はnull
    
    issues他のプロパティは受取先で評価
    指定の識別子との比較は
    title,opus,scene,cut の４点の比較で行う(秒数とサブタイトルは比較しない)
    optを加えるとtitle,opusのみを比較
*/
NetworkRepository.prototype.entry=function(myIdentifier,opt){
    opt = (opt)? -1 : 0;
  if(serviceAgent.currentRepository.entryList.length){
    for (var pid=0;pid<serviceAgent.currentRepository.entryList.length;pid++){
        if(Xps.compareIdentifier(serviceAgent.currentRepository.entryList[pid].toString(),myIdentifier) > opt){
                return serviceAgent.currentRepository.entryList[pid]
        }
    }
  }else if(opt){
    for (var pid=0;pid<serviceAgent.currentRepository.productsData.length;pid++){
      for (var oid=0;oid<serviceAgent.currentRepository.productsData[pid].episodes[0].length;oid++){
        var checkTitle = serviceAgent.currentRepository.productsData[pid].name;
        var checkOpus  = serviceAgent.currentRepository.productsData[pid].episodes[0][oid].name;
        if(
    Xps.compareIdentifier([decodeURIComponent(checkTitle),decodeURIComponent(checkOpus)].join('#')+'//',myIdentifier) > opt
        ){
                return opt;
        }
      }
    }
  }
    return null;        
}
/**
    カットトークン又はエピソードトークンから識別子を取得する
    エピソードトークンで得られた識別子はカット番号を自動で補う
    タイトル等の文字列が必要な場合はダミーのカット番号を捨てる必要あり
*/
NetworkRepository.prototype.getIdentifierByToken=function(myToken){
    search_loop:
    for (var pid=0;pid<this.productsData.length;pid++){
        //先にカットの照合を行う
        //要素内に情報の不足がある場合はそのブロックをスキップする
        if(! this.productsData[pid].episodes) continue;
        for (var eid=0;eid<this.productsData[pid].episodes[0].length;eid++){
            if(! this.productsData[pid].episodes[0][eid].cuts) continue;
            for (var cid=0;cid<this.productsData[pid].episodes[0][eid].cuts[0].length;cid++){
                if(this.productsData[pid].episodes[0][eid].cuts[0][cid].token==myToken){
                    return this.productsData[pid].episodes[0][eid].cuts[0][cid].description;
                }
            if(this.productsData[pid].episodes[0][eid].token==myToken){
                var lastName = (this.productsData[pid].episodes[0][eid].cuts[0].length)?
                this.productsData[pid].episodes[0][eid].cuts[0][this.productsData[pid].episodes[0][eid].cuts[0].length-1].name:'0';
                var myIdentifier = encodeURIComponent(this.productsData[pid].name)+'#'+
                    encodeURIComponent(this.productsData[pid].episodes[0][eid].name)+
                    ((this.productsData[pid].episodes[0][eid].description)?
                    '['+encodeURIComponent(this.productsData[pid].episodes[0][eid].description)+']':''
                )+'//'+nas.incrStr(lastName);
                return myIdentifier;   
            }
            }
        }
    }
    return null;        
}
/**
    tokenの一致するproductsData内のノードエレメントを戻す
    product>episodes>cut の順で検索　種別指定があればそのエレメントを先に検索
*/
NetworkRepository.prototype.getNodeElementByToken=function(myToken,myKind){
    if(! myToken) return null;
    if(! myKind) myKind = '*';
products:
    for (var pid=0;pid<this.productsData.length;pid++){
        if(((myKind=="product")||(myKind=="*"))&&(this.productsData[pid].token == myToken))
        return this.productsData[pid];
episodes:
        if(this.productsData[pid].episodes){
        for (var eid=0;eid<this.productsData[pid].episodes[0].length;eid++){
            // episodes[0]がトレーラー配列なので注意
            if(((myKind=="episode")||(myKind=="*"))&&(this.productsData[pid].episodes[0][eid].token == myToken))
            return this.productsData[pid].episodes[0][eid];
cuts:
            if(this.productsData[pid].episodes[0][eid].cuts){
            for (var cid=0;cid<this.productsData[pid].episodes[0][eid].cuts[0].length;cid++){
//                if(this.productsData[pid].episodes[0][eid].cuts[0].token == myToken) return this.productsData[pid].episodes[0][eid].cuts[0];
                if(((myKind=="cut")||(myKind=="*"))&&(this.productsData[pid].episodes[0][eid].cuts[0].token == myToken))
                return this.productsData[pid].episodes[0][eid].cuts[0];
                //cuts[0]がトレーラーオブジェクト　cuts[1] を廃止する準備中
            }}
        }}
    }
    return null;
}
/**
    エントリステータス操作コマンドメソッド群
    ServiceAgentの同名メソッドから呼び出す下位ファンクション

    caller側のルーチンで判定基準にしたデータが最新である保証が無いので
    各メソッドの書込み前にステータスの再確認が必要
    読み出しを前段に置いて成功時の関数内で再判定か？
    または、サービス側で変更要求に対する処理基準を明確にしてリジェクトを実装してもらう 2016.12.23
*/
/**
    現在のドキュメント XPS に対応するリポジトリ上のエントリをアクティベートする
    アクティベート前に、データの現状を取得してコールバックでアクティベート処理を渡す

    引数:処理成功時と失敗時のコールバック関数
*/
NetworkRepository.prototype.activateEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    var newXps = Object.create(xUI.XPS);//現在のデータの複製をとる
if(dbg) console.log(xUI.currentUser.sameAs(newXps.update_user));
    if (xUI.currentUser.sameAs(newXps.update_user)){
    //同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
if(dbg) console.log('activate : '+decodeURIComponent(Xps.getIdentifier(newXps)));
        newXps.currentStatus = 'Active';
/*
    サーバからデータの最新状況を取得する
    ステータスを確認して
 */
        var data = {
                token: currentEntry.issues[0].cutID,
                cut: {
                    name:   decodeURIComponent(currentEntry.toString().split('//')[1]),
                    description: Xps.getIdentifier(newXps)
                }
        };
if(dbg) console.log(data);
	    $.ajax({
		    type : 'GET',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		    data : data,
		    success : function(){},
		    error : function(result) {
			// Error
if(dbg) console.log("error");
if(dbg) console.log(result);
if(dbg) console.log('ステータス変更不可 :'+ Xps.getIdentifier(newXps));
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
		    },
		    beforeSend: this.service.setHeader
	    });

/**
    サービス側での排他が完了したら下の処理でOK
*/
        var data = {
                token: currentEntry.issues[0].cutID,
                cut: {
                    name:   decodeURIComponent(currentEntry.toString().split('//')[1]),
                    description: Xps.getIdentifier(newXps)
                }
        };
if(dbg) console.log(data);
	    $.ajax({
		    type : 'PUT',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		    data : data,
		    success : function(result) {
if(dbg) console.log('activated');
                serviceAgent.currentRepository.getList(true);//リストステータスを同期
                documentDepot.rebuildList();
                xUI.XPS.currentStatus='Active';//ドキュメントステータスを更新
//            xUI.XPS.update_user=xUI.currentUser;//ここはもともとユーザ一致なのでコレ不用
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                xUI.setUImode('production');
                xUI.sWitchPanel();//パネルクリア
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
if(dbg) console.log("error");
if(dbg) console.log(result);
if(dbg) console.log('ステータス変更不可 :'+ Xps.getIdentifier(newXps));
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
		    },
		    beforeSend: this.service.setHeader
	    });
    }else{
            return false
    }
}
/**
    作業を保留する リポジトリ内の対応エントリデータを更新してステータスを変更 
*/
NetworkRepository.prototype.deactivateEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
            //Active > Holdへ
if(true){
    var newXps = Object.create(xUI.XPS);//現在のデータの複製をとる
}else{
    var newXps = new Xps();
    var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
}
        //ユーザ判定は不用
        if (newXps){
             //同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
            newXps.currentStatus = 'Hold';//（ジョブID等）status以外の変更はない
    //ここでサーバに現在のエントリへのステータス変更要求を送信する 成功時と失敗時の処理を渡し、かつcallback を再度中継
    //カットの name,description のみを送信してステータスを変更
        var data = {
                token: currentEntry.issues[0].cutID,
                cut: {
                    name        : decodeURIComponent(currentEntry.toString().split('//')[1]),
                    description : Xps.getIdentifier(newXps),
                    content     : newXps.toString(),
			 		line_id     : newXps.line.toString(true),
			 		stage_id    : newXps.stage.toString(true),
			 		job_id      : newXps.job.toString(true),
			 		status      : newXps.currentStatus
                }
        };
if(dbg) console.log(data);
	    $.ajax({
		    type : 'PUT',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		    data : data,
		    success : function(result) {
if(dbg) console.log('deactivated');
                serviceAgent.currentRepository.getList(true);//リストステータスを同期
                documentDepot.rebuildList();
                xUI.XPS.currentStatus='Hold';//ドキュメントステータスを更新
//            xUI.XPS.update_user=xUI.currentUser;//ここはもともとユーザ一致なのでコレ不用
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                xUI.setUImode('browsing');
                xUI.sWitchPanel();//パネルクリア
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
if(dbg) console.log("error");
if(dbg) console.log(result);
if(dbg) console.log('保留失敗 :'+ Xps.getIdentifier(newXps));
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
                delete newXps;
		    },
		    beforeSend: this.service.setHeader
	    });
    }else{
if(dbg) console.log('保留可能エントリ無し :'+ decodeURIComponent(Xps.getIdentifier(newXps)));
             return false ;
    }
}
/** 
    作業にチェックイン
    リポジトリ種別にかかわらないので
    このメソッドを呼ぶ前段でジョブ名称は確定しておくこと
    ジョブ名指定のない場合は操作失敗    
*/
NetworkRepository.prototype.checkinEntry=function(myJob,callback,callback2){
    if( typeof myJob == 'undefined') return false;
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry){
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
            //次のJobへチェックイン 
            //リポジトリのステータスを変更する XPSの内容は変更不用
        var newXps = new Xps();
        var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
        // ユーザ判定は不用（権利チェックは後ほど実装）
    if (newXps){
        newXps.job.increment(myJob);
        newXps.update_user = xUI.currentUser;
        newXps.currentStatus = 'Active';
if(dbg) console.log(newXps.toString());//
    //引数でステータスを変更したエントリを作成 新規に保存 JobIDは必ず繰り上げる
    //ここでサーバに現在のエントリへのステータス変更要求を送信する 
    //成功時と失敗時の処理を渡し、かつcallback を再度中継
    //カットを送信してステータスを変更(ステータスのみの変更要求は意味が無い・内部データと不整合を起こすので却下)
    //descriptionのステータスを優先するならその方法も可能だが、バックアップタイミングを逃す？

        var data = {
                token: currentEntry.issues[0].cutID,
                cut: {
                    name:   decodeURIComponent(currentEntry.toString().split('//')[1]),
                    description: Xps.getIdentifier(newXps),
                    content: newXps.toString()
                }
        };
if(dbg) console.log(data);
	    $.ajax({
		    type : 'PUT',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		    data : data,
		    success : function(result) {
if(dbg) console.log('check-in');
                serviceAgent.currentRepository.getList(true);//リストステータスを同期
                documentDepot.rebuildList();
                xUI.setReferenceXPS()
                xUI.XPS.job.increment(myJob);
                xUI.XPS.currentStatus='Active';//ドキュメントステータスを更新
                xUI.XPS.update_user=xUI.currentUser;//ユーザ更新
                xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                xUI.setUImode('production');
                xUI.sWitchPanel();//パネルクリア
//                sync('historySelector');//ここで　履歴セレクタの更新を行う
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
if(dbg) console.log("error");
if(dbg) console.log(result);
if(dbg) console.log('ステータス変更不可 :'+ Xps.getIdentifier(newXps));
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
		    },
		    beforeSend: this.service.setHeader
	    });
    }
}
/**
    作業終了
*/
NetworkRepository.prototype.checkoutEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry) {
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        return false;
    }
            //Active > Fixed
if(true){
        var newXps = Object.create(xUI.XPS);//現在のデータの複製をとる
}else{
        var newXps = new Xps();
        var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
};//下の複製のほうが安全？
        //ユーザ判定は不用 JobID変わらず
    if (newXps){
             //同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
            newXps.currentStatus = 'Fixed';//（ジョブID等）status以外の変更はない
    //ここでサーバに現在のエントリへのステータス変更要求を送信する 成功時と失敗時の処理を渡し、かつcallback を再度中継
    //カットの name,description のみを送信してステータスを変更
        var data = {
                token: currentEntry.issues[0].cutID,
                cut: {
                    name        : decodeURIComponent(currentEntry.toString().split('//')[1]),
                    description : Xps.getIdentifier(newXps),
                    content     : newXps.toString(),
 			 		line_id     : newXps.line.toString(),
			 		stage_id    : newXps.stage.toString(),
			 		job_id      : newXps.job.toString(),
			 		status      : newXps.currentStatus
               }
        };
if(dbg) console.log(data);
	    $.ajax({
		    type : 'PUT',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		    data : data,
		    success : function(result) {
if(dbg) console.log('deactivated');
                serviceAgent.currentRepository.getList(true);//リストステータスを同期
                documentDepot.rebuildList();
                xUI.XPS.currentStatus='Fixed';//ドキュメントステータスを更新
//            xUI.XPS.update_user=xUI.currentUser;//ここはもともとユーザ一致なのでコレ不用
			    xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                xUI.setUImode('browsing');
                xUI.sWitchPanel();//パネルクリア
                if(serviceAgent.currentStatus=="online-single"){backToDocumentList('cut');}
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error :function(result) {
			// Error
if(dbg) console.log("error");
if(dbg) console.log(result);
if(dbg) console.log('終了更新失敗 :'+ Xps.getIdentifier(newXps));
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
                delete newXps;
		    },
		    beforeSend: this.service.setHeader
	    });
    }
if(dbg) console.log('終了更新失敗');
        delete newXps ;
        if(callback2 instanceof Function){ setTimeout('callback2()',10)};
        return false ;
}
/**
    検収処理
引数:
    nas.Pm.ProductionStageオブジェクト
    Xps.Stage
    または
    Stage名文字列("layout"等)
*上二つのオブジェクトからの処理は未実装2016-1230
    初期化用Job名文字列
    現在の工程（作業は既Fixed）を閉じて次の工程を開始する手続き
    現在のデータのステータスを変更
        ステージを新規オブジェクトでincrement = Jobは初期状態にリセット
        
    
*/
NetworkRepository.prototype.receiptEntry=function(stageName,jobName,callback,callback2){
    if( typeof stageName == 'undefined') return false;
    if( typeof stageName == 'undefined') return false;
    var myStage = nas.pm.stages.getStage(stageName) ;//ステージDBと照合　エントリが無い場合はエントリ登録
    /*  2106-12 の実装では省略して　エラー終了*/
    if(! myStage) return false;
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry){
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
            //次のステージを立ち上げるため 読み出したデータでXpsを初期化 
if(true){
        var newXps = Object.create(xUI.XPS);//現在のデータの複製をとる
}else{
        var newXps = new Xps();
        var currentContents = xUI.XPS.toString();
        newXps.readIN(currentContents);
};//下の複製のほうが安全？
        // ユーザ判定は不用（権利チェックは後ほど実装）
    if (newXps){
        newXps.stage.increment(stageName);
        newXps.job.reset(jobName);
        newXps.update_user = xUI.currentUser;
        newXps.currentStatus = 'Startup';
if(dbg) console.log(newXps.toString());//
             //引数でステータスを変更したエントリを作成 新規に保存 stageIDは必ず繰り上る jobは0リセット
    //ここでサーバに現在のエントリへのステータス変更要求を送信する 成功時と失敗時の処理を渡し、かつcallback を再度中継
    //カットの name,description のみを送信してステータスを変更
    //明示的なエントリ変更の要求が必要ならば処理
        var data = {
                token: currentEntry.issues[0].cutID,
                cut: {
                    name:   decodeURIComponent(currentEntry.toString().split('//')[1]),
                    description: Xps.getIdentifier(newXps),
                    content: newXps.toString()
                }
        };
if(dbg) console.log(data);
	    $.ajax({
		    type : 'PUT',
		    url : this.url+'/api/v2/cuts/'+currentEntry.issues[0].cutID+'.json',
		    data : data,
		    success : function(result) {
if(dbg) console.log('check-in');
                serviceAgent.currentRepository.getList(true);//リストステータスを同期
                documentDepot.rebuildList();
                xUI.XPS.stage.increment(stageName);
                xUI.XPS.job.reset(jobName);
                xUI.XPS.currentStatus='Startup ';//ドキュメントステータスを更新
                xUI.XPS.update_user=xUI.currentUser;//ユーザ更新
                xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                xUI.setUImode('browsing');
                xUI.sWitchPanel();//パネルクリア
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
if(dbg) console.log("error");
if(dbg) console.log(result);
if(dbg) console.log('ステータス変更不可 :'+ Xps.getIdentifier(newXps));
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
		    },
		    beforeSend: this.service.setHeader
	    });
    }
}
/**
    作業中断処理
*/
NetworkRepository.prototype.abortEntry=function(myIdentifier){
    var currentEntry = this.entry(myIdentifier);
    if(! currentEntry) return false;
    switch (currentEntry.getStatus()){
        case 'Startup':
        case 'Hold':
        case 'Fixed':
        case 'Active':
            //管理モード下でのみ処理 このメソッドのコール自体が管理モード下でのみ可能にする
            //リポジトリに対して
        break;
    }
}

/**
    最終作業の破棄
    バックアップ作業これを呼び出す側で処理
    ここを直接コールした場合はバックアップは実行されない
    ユーザメッセージはここでは処理されない
    
*/
NetworkRepository.prototype.destroyJob=function(callback,callback2){
    if(xUI.XPS.currentStatus != 'Active'){return false}
 //    カレントのtokenを添えてdestroyコマンドを発行する
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry){
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
    }
    
        //currentEntry.issues[0].cutID
if(dbg) console.log(currentEntry.issues[0].cutID);
	    $.ajax({
		    type : 'PATCH',
		    url : this.url+'/api/v2/cuts/:'+currentEntry.issues[0].cutID+'/discard',
		    success : function(result) {
		        currentEntry.issues.pop();
                xUI.resetSheet(new Xps(5,144),new Xps(5,144)) ;
                serviceAgent.currentRepository.getList(true);//リストステータスを同期
                documentDepot.rebuildList();
                xUI.setStored("current");//UI上の保存ステータスをセット
			    sync();//保存ステータスを同期
                xUI.setUImode('browsing');
                if(callback instanceof Function){ setTimeout (callback,10);}
		    },
		    error : function(result) {
			// Error
if(dbg) console.log("error");
if(dbg) console.log(result);
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
		    },
		    beforeSend: this.service.setHeader
	    });

}
//serviceAgent.currentRepository.destroyJob();
/**
サービスエージェントオブエジェクト

ログインするサーバを選んでログイン処理をする
ログイン情報を保持して
状態は offline/onnline/online-single の3状態
モードによっては機能が制限される
UI上モードを表示するシンボルが必要

servers ServiceNode
*/


serviceAgent = {
    servers     :[],
    repositories:[],
    currentStatus       :'offlline',
    currentServer       :null,
    currentRepository   :null
};
/**
    サービスエージェントの初期化(テスト版)
 リポジトリの初期化は 最終的には作業記録とサーバからの受信情報でアプリケーション初期化のタイミングで組む
*/
serviceAgent.init= function(){
    this.repositories=[localRepository]; //ローカルリポジトリを0番として加える
    if(document.getElementById('backend_variables')){
    ;//本番用
      if($("#backend_variables").attr("data-server_url")){
//ローカルテスト時はこちらで
      　var myUrl = $("#backend_variables").attr("data-server_url");
      }else{
        var loc = String(window.location).split('/');//
        var locOffset = (loc[loc.length-1]=="edit")? 3:2;
        var myUrl = loc.splice(0,loc.length-locOffset).join('/');
//      var myUrl = 'http://remaping.scivone-dev.com';//テスト用決め打ち
//      var myUrl = 'https://remaping-stg.u-at.net';//テスト用に決め打ち
//      var myUrl = 'https://u-at.net';//テスト用決め打ち
      }
      this.servers.push(new ServiceNode("CURRENT",myUrl));
    }else{
      var myServers={
        UAT: {name:'U-AT',url:'https://u-at.net'},
        Srage:{name:'Stage',url:'https://remaping-stg.u-at.net'},
        devFront:{name:'devFront',url:'http://remaping.scivone-dev.com'}
      };
      for(svs in myServers){this.servers.push(new ServiceNode(myServers[svs].name,myServers[svs].url));}
    }
/*
    仮のサーバセレクタを設定
*/
    var mylistContents="";
    mylistContents +='<option selected value="-1" > +no server selected+';
    for(var ids=0; ids < this.servers.length;ids ++){
        mylistContents +='<option value="'+ids+((ids==0)? '" selected >':'" >')+this.servers[ids].name; 
    }
    document.getElementById('serverSelector').innerHTML = mylistContents;

//    var Home=new NetworkRepository("HOME",serviceA);
//    this.repositories.push(Home);
/**
    組んだリポジトリでリポジトリリストを更新する
    ローカルリポジトリはすべての状況で利用可能
*/
    var myContents="";
    myContents +='<option selected value=0> = local Repository =';
    for(var idr=1; idr < this.repositories.length;idr ++){
        myContents +='<option value="'+idr+'" >'+this.repositories[idr].name; 
    }
    document.getElementById('repositorySelector').innerHTML = myContents;

    this.switchRepository(0);
    this.switchService(0);
//    this.currentServer = this.severs[0];//初期化時点のサーバは 最初のサーバ(U-AT);
}
/**
    ユーザ認証
カレントサービスを認証又は解除する

カレントサービスが"0:=no selected="の場合は,
単純にすべてのサービスからログアウトする

 */
serviceAgent.authorize = function(){
if(dbg) console.log("authorize!::");
    switch (this.currentStatus){
    case 'online-single':
        return false;
    break;
    case 'online':
        if(xUI.onSite){return 'online'};
//            this.currentServer     = null;
//            this.currentRepository = null;
            this.authorized(false);
        return 'offline';
    break;
    case 'offline':
    default:
        if(this.currentServer) this.currentServer.authorize();
        return 'online';
    }
}
/**
    認証/解除時の画面処理
*/
serviceAgent.authorized = function(status){
    if (status == 'success'){
        this.currentStatus = 'online';
//二回目以降のUI初期化時は ローカルリポジトリにフォーカスが移ってカレントサーバがないケースがあるので注意
          if(serviceAgent.currentServer){
            document.getElementById('serverurl').innerHTML = serviceAgent.currentServer.url.split('/').slice(0,3).join('/');//?
            document.getElementById('loginuser').innerHTML = document.getElementById('current_user_id').value;
            document.getElementById('loginstatus_button').innerHTML = "=ONLINE=";
            document.getElementById('login_button').innerHTML = "signin \\ SIGNOUT";
          };//二度目以降の表示更新はサーバの切り替えが無い限り特に不用
    }else{
        this.currentStatus = 'offline';
            document.getElementById('serverurl').innerHTML = localize(nas.uiMsg.noSigninService);//?
            document.getElementById('loginuser').innerHTML = '';
            document.getElementById('loginstatus_button').innerHTML = "=OFFLINE=";
            document.getElementById('login_button').innerHTML = "SIGNIN / signout";
    }
}
/**
    サーバを切り替える
引数: myServer / Object ServiceNode
サーバ名・URL・ID またはキーワードで指定
キーワードと同名のサーバは基本的に禁止？
サーバにログインしていない場合は、各サーバごとの認証を呼ぶ
既にサービスにログインしている場合は、その認証を解除してから次のサービスを認証する

内部的にはともかくユーザ視点での情報の輻輳を避けるため サーバ/リポジトリを多層構造にせず 
リポジトリに対する認証のみをUIで扱う
リポジトリの切り替えに対してログイン/ログアウトを行うUI仕様とする。
サービスの切り替えは内部での呼び出しのみになるので引数は整理する
*/
serviceAgent.switchService = function(myServer){
    if((myServer instanceof ServiceNode )&&(myServer !== this.currentServer)) {
        this.currentServer = myServer; 
    }else if((myServer >= 0)&&(myServer<this.servers.length)){
        this.currentServer = this.servers[myServer];
    }else{
        this.currentServer = null;
    }
    sync();

return this.currentServer;
};
/**
    リポジトリを切り替える
    UIから直接呼び出されるのはこちら
    カレントのリポジトリを切り替え、
    リポジトリに関連付けられたサービスをカレントにする
    サービスが現在のログイン先と異なる場合も認証は実際のアクセスまで保留
    （解除前にもとのサービスに戻った際に再ログインを行わないため）
    引数は、現在のリポジトリID
    リポジトリIDは以下のように決定
    
    0:ローカルリポジトリ固定
    1~ 以降登録順　現在同時に処理できるサーバは１つ サーバ内のリポジトリは複数
    
     リポジトリ切替時にドキュメントリストの更新をバックグラウンドで行う
     
*/
serviceAgent.switchRepository = function(myRepositoryID,callback){
    if(this.currentRepository === this.repositories[myRepositoryID]){
        //同オブエジェクトに切り替える必要はないのでそのままリターン
        return this.currentRepository;
    }else{
        this.currentRepository = this.repositories[myRepositoryID];
        if((myRepositoryID > 0)&&(myRepositoryID<this.repositories.length)){
            this.currentServer=this.currentRepository.service;
        } else {
            this.currentServer     = null;
        };
        if(document.getElementById('repositorySelector').value != myRepositoryID){
            document.getElementById('repositorySelector').value　=　myRepositoryID;
        }
        if(callback instanceof Function){ callback(); }else{
        /*== ドキュメントリスト更新 ==*/
            documentDepot.rebuildList(callback);
        }
    };
    return this.currentRepository;
};
/**
    title-token  又は　episode-token が含まれるRepositoryをカレントに切り替えて返す
*/
serviceAgent.getRepsitoryIdByToken = function(myToken){
    var RIX=0;
    search_loop:
    for (var rix=1;rix<this.repositories.length;rix++){
        if(myToken==this.repositories[rix].token){
            RIX=rix;
            break search_loop;            
        }
        //リポジトリ内のプロダクトデータを検索（エントリ総当りはしない）
        for (var pix=0;pix<this.repositories[rix].productsData.length;pix++){
            if(myToken==this.repositories[rix].productsData[pix].token){
                RIX=rix;
                break search_loop;
            };
            for (var eix=0;eix<this.repositories[rix].productsData[pix].episodes[0].length;eix++){
                if(myToken == this.repositories[rix].productsData[pix].episodes[0][eix].token){
                    RIX=rix;
                    break search_loop;                    
                };
            };
        };
    };
    if(RIX)  {return RIX}else{return false}
    
};

/**
    引数を判定して動作を決定 カレントリポジトリの操作を呼び出す
    myIdentifier    カット識別子 完全状態で指定されなかった場合は、検索で補う
    isReference    リファレンスとして呼び込むか否かのフラグ 指定がなければ自動判定
    callback    コールバック関数指定が可能コールバックは以下の型式で
    コールバックの指定がない場合は指定データをアプリケーションに読み込む
    コールバック関数以降の引数はコールバックに渡される
*/
serviceAgent.getEntry = function(myIdentifier,isReference,callback){
if(dbg) console.log('getEntry ::' + decodeURIComponent(myIdentifier));
    if(typeof isReference == 'undefined'){isReference = false;}
    //識別子をパース
    var targetInfo = Xps.parseIdentifier(myIdentifier);
    var myIssue = false;
    var refIssue = false;

    var myEntry = serviceAgent.currentRepository.entry(myIdentifier);
    if(! myEntry){
if(dbg) console.log("noProduct : "+ decodeURIComponent(myIdentifier));//プロダクトが無い
        return false;
    }
    if(! targetInfo.currentStatus){
   //引数に管理部分がないので、最新のissueとして補う
        var cx = myEntry.issues.length-1;//最新のissue
        myIssue = myEntry.issues[cx];//配列で取得
    } else {
    //指定管理部分からissueを特定する 連結して文字列比較（後方から検索) リスト内に指定エントリがなければ失敗
        checkIssues:{
            for (var cx = (myEntry.issues.length-1) ; cx >= 0 ;cx--){
//if(dbg) console.log ( String(myEntry.issues[cx].identifier)+'\n'+String(myIdentifier));
//if(dbg) console.log ( Xps.compareIdentifier(myEntry.issues[cx].identifier,myIdentifier))
                if ( Xps.compareIdentifier(myEntry.issues[cx].identifier,myIdentifier) > 4){
                    myIssue = myEntry.issues[cx];
                    break checkIssues;
                }
            }
            if (! myIssue){
if(dbg) console.log( 'no target data :'+ decodeURIComponent(myIdentifier) );//ターゲットのデータが無い
                return false;
            }
        }
    }
    console.log(myEntry.issues[cx].identifier);
if((! isReference)&&(Xps.compareIdentifier(myEntry.issues[cx].identifier,Xps.getIdentifier(xUI.XPS)) > 3)){
    console.log('ジョブ一致　ロードスキップ');
}
    if((xUI.uiMode=='production')&&(xUI.XPS.currentStatus=='Active')){
console.log("need deactivate");
            if(xUI.edchg) xUI.put(document.getElementById('iNputbOx').value);
            this.currentRepository.deactivateEntry(function(){
                serviceAgent.currentRepository.getEntry(myIdentifier,isReference,function(){
console.log("get ");
                    sync('historySelector');
                    //if($("#optionPanelFile").is(':visible')) xUI.sWitchPanel('File');
                    if (callback instanceof Function) callback();
                },function(){
console.log("fail getting ");
                    if (callback2 instanceof Function) callback2();
                });
            },function(){
console.log("fail getting ");
                    if (callback2 instanceof Function) callback2();
            });
    }else{
        this.currentRepository.getEntry(myIdentifier,isReference,function(){
            sync('historySelector');
            if (callback instanceof Function) callback();
        },function(){
console.log("fail getting ");
            if (callback2 instanceof Function) callback2();
        });
    }
    if($("#optionPanelFile").is(':visible')) xUI.sWitchPanel('File');
};

/**
    ドキュメント操作メソッド群
    実行時に実際の各リポジトリに対してコマンドを発行して エントリのステータスを更新する
    ステータスによっては、ジョブ名引数を必要とする
    変更をトライして成功時／失敗時に指定のコールバック関数を実行する
    
    操作対象ドキュメントは、必ずUI上でオープンされている (xUI.XPS が対象)
    引数で識別子を与えることは無い
    
    activate(callback,callback2)
                Active > Active  例外操作 作業セッションの回復時のみ実行 データにチェック機能が必要
        ステータス変更なし
                Hold   > Active
                Fixed  > Active （Fixedの取り消し操作）
        ステータスのみ変更(カレントユーザのみが可能)
    
    deactivate(callback,callback2)
                Active > Hold
        現データをpush
        ステータス変更(カレントユーザのみが可能)
    
    checkin(ジョブ名,callback,callback2)
                Startup > Active
                Fixed   > Active

    checkout/fix/close(callback,callback2)
                Active  > Fixed
        現データをpush
        ステータス変更(カレントユーザのみが可能)
    

        引数としてJob名が必要
    
Abort > 最終JobのステータスをAbortに変更して保存する
ストレージタイプの場合、同内容でステータスの異なるデータを保存して成功時に先行データを削除して更新する
サービス型の場合は変更リクエストを発行して終了

この場合の違いを吸収するためにRepositry.changeStatus() メソッドを実装する
エントリステータスの変更は単純な変更にならない かつ リポジトリ通信先のデータ更新にかかわるのでエントリのメソッドにはしない

    checkin(開く)
Startup/Fixed/(Active) > Active
新規ジョブを開始

    checkout(fix)(閉じる)
Active > Fixed
カレントジョブを終了

    activate(再開)
Hold/Fixed > Active
カレントジョブの状態を変更
データをActiveにできるのは、updateユーザのみ

    deactivate(保留)
Acive > Hold   
カレントジョブの状態を変更

=================== ここまでproductionMode での操作
ドキュメントブラウザパネルの表示は
[ CHECKIN][CHECKOUT][ACTIVATE][DEACTIVATE]
[作業開始][作業終了][作業保留][作業再開]
となる
=================== 

    receipt(検収)
fixed > Startup
新規ステージを開始(管理者権限)

＊管理者権限での作業時はステータスの遷移を抑制する
=読み出してもactiveにならない？

    abort(中断)
*   > Aborted
エントリの制作を中断(管理者権限)
すべての状態から移行可能性あり

状況遷移を単純化するために、読み込まれていないデータの状況遷移を抑制する。
基本的にユーザのドキュメント操作の際に状況の遷移が自動で発生する。

プログラム上の手続きとして

リポジトリのステータス更新
ドキュメントリスト上のステータスを同期
バッファ上のデータのステータス同期
を上の順序で行う必要があるので注意

*/
/**
    現在のドキュメントをアクティベートする
    
*/
serviceAgent.activateEntry=function(callback,callback2){
    var currentEntry = this.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry) {
if(dbg) console.log ('noentry in this repository :' +  decodeURIComponent(currentEntry))
        return false;
    }
    switch (currentEntry.getStatus()){
        case 'Active':
/**     例外処理 ロストセッションの回復
    編集中に保存せずに作業セッションを失った場合 この状態となる
    また同一ユーザで編集中に他のブラウザからログインした場合も可能性あり
    ここに確認用のメッセージが必要
    checkinの手続内でここがコールされている？
*/
            if(xUI.currentUser.sameAs(xUI.XPS.update_user)){
                var msg = localize(nas.uiMsg.alertAbnomalPrccs);
                msg += '\n'+localize(nas.uiMsg.dmPMrecoverLostSession);
                msg += '\n\n'+localize(nas.uiMsg.confirmOk);
               if(confirm(msg)){
                    xUI.setUImode('production');
//  必要があればここでリポジトリの操作（基本不用）
                    xUI.sWitchPanel();//パネルクリア
                    return true;
                }
            }
        break;
        case 'Aborted':case 'Startup':
            alert(localize(nas.uiMsg.dmAlertCantActivate));//アクティベート不可 
            //NOP return
            return false;
        break;
        case 'Hold':case 'Fixed':
            //ユーザが同一の場合のみ 再アクティベート可能(activate)
            //Fixed>Active の場合は、通知が必要かも
        if (xUI.currentUser.sameAs(xUI.XPS.update_user)){
            this.currentRepository.activateEntry(callback,callback2);//コールバックはリレーする
            return true;
        } else {
            alert(localize(nas.uiMsg.dmAlertDataBusy));//ユーザ違い
            return false;
        }
        break;
    }
}
/**
    作業を保留する リポジトリ内のエントリを更新してステータスを変更
    ユーザ判定は不用
    現データの送信（保存）後にリスト更新とドキュメントブラウザの更新
*/
serviceAgent.deactivateEntry=function(callback,callback2){
    var currentEntry = this.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry) {
if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        return false;
    }
    switch (currentEntry.getStatus()){
        case 'Aborted': case 'Startup': case 'Hold': case 'Fixed':
            //NOP
//            if(dbg) console.log('fail deactivate so :'+ currentEntry.getStatus());
            alert(localize(nas.uiMsg.dmAlertCantDeactivate));//アクティブでない
            return false;
            break;
        case 'Active':
            //編集を確認して Active > Holdへ
            if(xUI.edchg) xUI.put(document.getElementById('iNputbOx').value);
            this.currentRepository.deactivateEntry(callback,callback2);
        break;
    }
}
/** 
    作業にチェックイン
    リポジトリ種別にかかわらないので
    このメソッド内でジョブ名称を確定しておく  
*/
serviceAgent.checkinEntry=function(myJob,callback,callback2){
//  ここで処理前にリストを最新に更新する
//    this.currentRepository.getList(true);
    var currentEntry = this.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry){
        alert(localize(nas.uiMsg.dmAlertNoEntry));//対応エントリが無い
//        if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
    switch (currentEntry.getStatus()){
        case 'Aborted': case 'Active': case 'Hold':
            alert(localize(nas.uiMsg.dmAlertCheckinFail)+"\n>"+currentEntry.getStatus(myJob,callback,callback2));
            //NOP return
if(dbg) console.log('fail checkin so :'+ currentEntry.getStatus(myJob,callback,callback2));
            return false;
        break;
        case 'Fixed':case 'Startup':
            //次のJobへチェックイン
            //ジョブ名称を請求
            var title   = localize(nas.uiMsg.pMcheckin);//'作業開始 / チェックイン';
            var msg     = localize(nas.uiMsg.dmPMnewItemSwap,localize(nas.uiMsg.pMjob));
            //'新規作業を開始します。\n新しい作業名を入力してください。\nリストにない場合は、作業名を入力してください。';
            var msg2    = '<br> <input id=newJobName  type=text list=newJobList></input><datalist id=newJobList>';
//            if(dbg) console.log(xUI.XPS.stage.name +","+ ((xUI.XPS.job.id == 0) ? 'primary':'*'));
            var newJobList = nas.pm.jobNames.getTemplate(xUI.XPS.stage.name,((xUI.XPS.job.id == 0) ? 'primary':'*'));//ここは後ほどリポジトリ個別のデータと差替
            for(var idx = 0 ; idx < newJobList.length;idx ++){
                msg2   += '<option value="';
                msg2   += newJobList[idx];
                msg2   += '"></option>';
            };
                msg2 += '</datalist>';
//            if(dbg) console.log(newJobList);
//            if(dbg) console.log(msg2);
            nas.showModalDialog('confirm',[msg,msg2],title,false,function(){
                var newJobName=document.getElementById('newJobName').value;
                if((this.status == 0)&&(newJobName)){
                    serviceAgent.currentRepository.checkinEntry(newJobName,function(){
                        //成功時は現在のデータをリファレンスへ複製しておく
                        //putReference();　このタイミングで行うと　ステータス変更後のデータがリファレンスへ入るので　ダメ　各メソッド側に実装
//                        sync('productStatus');//ここで　ステータスの更新を行う
//                        sync('historySelector');//ここで　履歴セレクタの更新を行う
                        if(callback instanceof Function) callback();
                    },
                    function(){
                        alert(localize(nas.uiMsg.dmAlertCheckinFail));//チェックイン失敗
//                        sync('productStatus');//ここで　ステータスの更新を行う
//                        sync('historySelector');//ここで　履歴セレクタの更新を行う
                        if(callback2 instanceof Function) callback2();
                    });
                }
            });
        break;
    }
}
/**
    作業を終了する リポジトリ内のエントリを更新してステータスを変更
    ユーザ判定は不用
    現データの送信（保存）後にリスト更新とドキュメントブラウザの更新
*/
serviceAgent.checkoutEntry=function(callback,callback2){
    var currentEntry = this.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
//    this.currentRepository.checkoutEntry(callback,callback2);

    if(! currentEntry) {
//        if(dbg) console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
        alert(localize(nas.uiMsg.dmAlertNoEntry)+'\n>'+decodeURIComponent(currentEntry));//対応エントリが無い
        return false;
    }
    switch (currentEntry.getStatus()){
        case 'Startup': case 'Hold': case 'Fixed':
            //NOP
//            if(dbg) console.log('fail checkout so :'+ currentEntry.getStatus());
            alert(localize(nas.uiMsg.dmAlertCantCheckout));//作業データでない
            return false;
        break;
        case 'Active':
            //編集状態を確認の上　Active > Fixed
            if(xUI.edchg) xUI.put(document.getElementById('iNputbOx').value);
            this.currentRepository.checkoutEntry(callback,callback2);
        break;
    }
}
/**
     新規カットを追加登録
     現在のリポジトリに存在しないタイトル・エピソードを指定する場合は、必ずXpsオブジェクトを指定すること
     引数無しで呼び出された場合は、現在のタイトル・エピソードに新規カットを登録するダイアログを開く
     現在のTitle-Opusに既存のカットは処理できないので排除
     データ内容の指定は不可・尺のみ指定可能　最小テンプレートでカット番号のある空エントリのみが処理対象
     初期状態の、ライン／ステージ／ジョブの指定が可能
*/
serviceAgent.addEntry = function(myXps){
    if(!myXps){
        var myIdentifier = documentDepot.buildIdentifier();
if(dbg)console.log(decodeURIComponent(myIdentifier));
        var entryInfo = Xps.parseIdentifier(myIdentifier);
                myXps = new Xps(5,entryInfo.time);
                myXps.title      = entryInfo.title;
                myXps.opus       = entryInfo.opus;
                myXps.subtitle   = entryInfo.subtitle;
                myXps.cut        = entryInfo.cut;
                myXps.createUser = xUI.currentUser;
                myXps.updateUser = xUI.currentUser;

        if((String(myXps.cut).length==0)||(serviceAgent.currentRepository.entry(myIdentifier))){
            var msg = "";
            if (String(myXps.cut).length==0){
                msg += localize(nas.uiMsg.alertCutIllegal);//"カット番号不正"
            }else{
                msg += localize(nas.uiMsg.alertCutConflict);//"カット番号衝突"
            }
            alert(msg);
            return false;
        }else{
            serviceAgent.addEntry(myXps);
        };
        return;

    }else{
        var myIdentifier = Xps.getIdentifier(myXps);
//既存カットと一致(排除)
        if(this.currentRepository.entry(myIdentifier)){
                alert(localize(nas.uiMsg.alertCutConflict));
             return false
        }
        if(this.currentRepository.entry(myIdentifier,true)){
//既存プロダクトあり（作成処理不用）
            serviceAgent.currentRepository.pushEntry(myXps);
        }else{
//既存のタイトルがあるか？あればエピソードのみ新作
//なければタイトルを作成後にエピソードを新作して処理続行
// confirmあり
            　var hasTitle = false;
            　var hasOpus  = false;
            　for (var pid=0;pid<documentDepot.products.length;pid ++){
            　   //productsのメンバをオブジェクト化したほうが良いかも
            　   var prdInfo=Xps.parseProduct(documentDepot.products[pid]);
            　   if(prdInfo.title== myXps.title) {
            　       hasTitle = documentDepot.products[pid];
            　       if(prdInfo.opus == myXps.opus) {hasOpus  = documentDepot.products[pid];break;}
            　   }
            　}
            　if((hasTitle)&&(! hasOpus)){
            　   var msg=localize({
            　       en:"",
            　       ja:"この共有には指定の制作話数 #%1[%2] が登録されていません。\n新規に制作話数 #%1[%2] を登録しますか？\n共有を変更するする場合は一旦キャンセルして手続をやり直してください。"},myXps.opus,myXps.subtitle);
            　   if(confirm(msg))
            　   serviceAgent.currentRepository.addOpus(myIdentifier,hasProd,function(){
            　       serviceAgent.currentRepository.pushEntry(myXps);
            　   });
            　 }else if((! hasTitle)&&(! hasOpus)){
            　   var msg=localize({
            　       en:"",
            　       ja:"この共有には指定された作品 %1#%2[%3] が登録されていません。\n新規に %1#%2[%3] を登録しますか？\n共有を変更するする場合は一旦キャンセルして手続をやり直してください。"},myXps.title,myXps.opus,myXps.subtitle);
            　   if(confirm(msg))
            　   serviceAgent.currentRepository.addTitle(myXps.title,"","",function(){
            　       serviceAgent.currentRepository.addOpus(myIdentifier,function(){
            　           serviceAgent.currentRepository.pushEntry(myXps);
            　       });
            　   });
            　}else{
            　   serviceAgent.currentRepository.pushEntry(myXps);
            　};
            　          
        };
    };
};
/**
     工程を閉じて次の工程を開始する手続き
     逆戻り不能なのでチェックを厳重に
     
*/
serviceAgent.receiptEntry=function(){
    var currentEntry = this.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
//    var currentEntry = (typeof myIdentifier == 'undefined')?this.currentRepository.entry(Xps.getIdentifier(xUI.XPS)):this.currentRepository.entry(myIdentifier);
    if(! currentEntry) return false;
    switch (currentEntry.getStatus()){
        case 'Startup': case 'Active': case 'Hold':
            return false;
        break;
        case 'Fixed':
            //Fixedのみを処理
            var newStageList = nas.pm.stages.getTemplate(xUI.XPS.stage.name);
            var newJobList   = nas.pm.jobNames.getTemplate(xUI.XPS.stage.name);
            var title = localize(nas.uiMsg.pMreseiptStage);//'作業検収 / 工程移行';
            var msg   = localize(nas.uiMsg.dmPMnewStage);//'現在の工程を閉じて次の工程を開きます。\n新しい工程名を入力してください。\nリストにない場合は、工程名を入力してください。';
            var msg2  = '<br><span>'+localize(nas.uiMsg.pMcurrentStage)+' : %currentStage% <br>'+localize(nas.uiMsg.pMnewStage)+' : '+ nas.incrStr(xUI.XPS.stage.id)
                    + ' :</span><input id=newStageName type=text list=taragetStageList onChange="serviceAgent.updateNewJobName(this.value);"></input><datalist id=taragetStageList>';
                msg2　= msg2.replace(/%currentStage%/,xUI.XPS.stage.toString(true));
            for(var idx = 0 ; idx < newStageList.length;idx ++){
                msg2   += '<option value="';
                msg2   += newStageList[idx];
                msg2   += '"></option>';
            };
                msg2   += '</datalist>';
                msg2   += '<input id=newJobName type=text list=taragetJobList ></input><datalist id=taragetJobList></datalist>';
            nas.showModalDialog('confirm',[msg,msg2],title,false,function(){
                var newStageName = document.getElementById('newStageName').value;
                var newJobName = document.getElementById('newJobName').value;
                if ((this.status == 0)&&(newStageName)&&(newJobName)){
                    //if(dbg) console.log([newStageName,newJobName]);
                    serviceAgent.currentRepository.receiptEntry(newStageName,newJobName);
                }
            });
            
        break;
    }
}
/**
    当該エントリの制作を中断する。
    以降は複製のみ可能
*/
serviceAgent.abortEntry=function(myIdentifier){
    var currentEntry = (typeof myIdentifier == 'undefined')? this.currentRepository.entry(Xps.getIdentifier(xUI.XPS)):this.currentRepository.entry(myIdentifier);
    if(! currentEntry) return false;
    switch (currentEntry.getStatus()){
        case 'Startup': case 'Hold': case 'Fixed': case 'Active':
            //管理モード下でのみ処理 このメソッドのコール自体が管理モード下でのみ可能にする
            //リポジトリに対して
        break;
    }
}
/**
    閉じる
    ドキュメントの扱いが変わったので
    XPSをカラ（初期状態）にして編集をロックする
    エントリは、ActiveならHoldに変更
*/
serviceAgent.closeEntry=function(){
    //  ドキュメントがアクティブで変更フラグが立っている場合　holdしてカレントリポジトリにプッシュ
     if((xUI.currentStatus=="Active")&&(! xUI.isStored())){
    //  成功したらカレントドキュメントをクリアしてロック
        this.currentRepository.deactivateEntry(function(){
            xUI.resetSheet(new Xps(5,144),new Xps(5,144)) ;
        },function(){
            xUI.errorCode=9;
        }
        );
    }else{
            xUI.resetSheet(new Xps(5,144),new Xps(5,144)) ;        
    }
}
/**
    最終ジョブを破棄する（巻き戻し）
    現在のジョブ内容を、保存含めて破棄する
    破棄可能な条件は、
    現在作業中のジョブまたは作業可能なジョブであること（Activeドキュメントのみに適用）
    closeに手順がにているが、ハードデリートを伴う点が異なる
    ハードデリートを伴うため　バックアップコピーを作成して保険として使う    
*/
serviceAgent.destroyJob=function(callback,callback2){
    if(xUI.XPS.currentStatus!="Active"){return false;}
//ドキュメントがアクティブでない場合は操作不能
    xUI.setBackup();//自動でバックアップをとる（undoではない）
    serviceAgent.currentRepository.destroyJob(callback,callback2)
}

/**
    選択可能な参考ジョブリストの更新
    更新されたリスト以外のジョブ名称も認められる
*/
serviceAgent.updateNewJobName = function(stageName,type){
    var targetList=document.getElementById("taragetJobList");
    if(! targetList) return false;
    for (var i = targetList.childNodes.length-1; i>=0; i--) {
        targetList.removeChild(targetList.childNodes[i]);
    }
    if(!type) type='init';
    var newJobList = nas.pm.jobNames.getTemplate(stageName,type);
    for(var idx = 0 ; idx < newJobList.length;idx ++){
        var option = document.createElement('option');
        option.id = idx;
        option.value = newJobList[idx];
        targetList.appendChild(option);
    };
//    if(dbg) console.log(newJobList);
}
//Test code
/**
    サーバエージェントを経由してリポジトリにデータを送出する
    保存データが最新のissueでない場合はリジェクト
    この場合はデータの更新があるかないかは問わない()
*/
serviceAgent.pushEntry = function(myXps,callback,callback2){
    if (typeof myXps == 'undefined') myXps = xUI.XPS;
    if((xUI.XPS === myXps)&&(xUI.sessionRetrace > 0)){
        xUI.errorCode=8;//確定済データを更新することはできません
        alert(localize(xUI.errorMsg[xUI.errorCode]));
        return false;
    }
    if (!( myXps instanceof Xps)){
        if(callback2 instanceof Function){callbakc2();}
        return false;
    }
    this.currentRepository.pushEntry(myXps,callback,callback2);
}
/**

Repos.getProducts();//一度初期化する
if(dbg) console.log(Repos.productsData);
Repos.getList();

*/
/**
    入力テキストをパースしてカットを集計した配列を返す
    入力書式は別紙
*/
function parseCutText(sourceText){
    var sepChar      = '\t';//セパレータ初期値H-TAB
    var commentRegex = new RegExp('(#|;|//)');
    var cutRegex     = new RegExp('cut(#|＃|no\.|№)?','i');
    var timeRegex    = new RegExp('(time|duration|seconds|秒|時間|尺)','i');
    var sourceArray=sourceText.split('\n');
    var dataStartLine     = -1;
    var namePosition = -1;var timePosition= -1;
    
    for (var lid=0;lid<sourceArray.length;lid++){
        if(String(sourceArray[lid]).match(/^\s*$/)||String(sourceArray[lid]).match(commentRegex)){
            continue;
        }else{
            dataStartLine = lid;
            if(String(sourceArray[lid]).match(/,/)){sepChar = ','};
            var myFields = String(sourceArray[lid]).split(sepChar);
            for (var fid=(myFields.length-1);fid>=0;fid--){
                if(myFields[fid].match(cutRegex)) {namePosition=fid};
                if(myFields[fid].match(timeRegex)){timePosition=fid};
            }
            break;
        }
    }
console.log(dataStartLine)
    
    if(namePosition==-1){
        namePosition=0;
        if(timePosition != -1){dataStartLine ++};
        timePosition=1;
    }else{
        dataStartLine ++;
    }

console.log(dataStartLine)
    var resultArray=[];
    var cutName="";var cutTime="";
    var currentName="";var currentTime=0;
    
    for (var lid=dataStartLine;lid<sourceArray.length;lid++){
        if(String(sourceArray[lid]).match(/^\s*$/)||String(sourceArray[lid]).match(commentRegex)){
            continue;
        }else{
            var myFields = String(sourceArray[lid]).split(sepChar);
            cutName = (myFields[namePosition])? String(myFields[namePosition]) :currentName;
                if (cutName.match(/^"([^"]*)"$/)){cutName=RegExp.$1};//"
            cutTime = (timePosition < 0)? "":String(myFields[timePosition]);
                if (cutTime.match(/^"([^"]*)"$/)){cutTime=RegExp.$1};//"
                cutTime = parseInt(nas.FCT2Frm(decodeURI(cutTime)),10);
//            console.log(cutName+":"+currentName);
            if((cutName != currentName)&&(currentName.length>0)){
                resultArray.push([currentName,currentTime]);
                currentTime = cutTime;
            }else{
                currentTime+=cutTime;
            }
            currentName = cutName;
        }
    }
    resultArray.push([currentName,currentTime]);
    return resultArray;
}
// test
//sourceText="1,24\n2,48\n3,12\n,12";
/**
sourceText=([
"cut\tb\ttime\td\te",
"1\tX\t30\tA\tA",
"2\tW\t30\tA\tA",
"3\tZ\t30\tA\tA",
"\t''\t30\tA\tA",
]).join("\n");
sourceText=document.getElementById('data_well').value;
parseCutText(sourceText);
*/

/*
     インポート/エクスポートウェルに置いたカット登録テキストを識別子に変換して
     entryQueueを作成
     これを引数にしてpushEntryを順次コールする。
     
*/
    serviceAgent.entryQueue = [];
    serviceAgent.entryQueue.select = 0;

makeNewEntriesFromFormatedText = function(ix){
    if(typeof ix == 'undefined'){
        var sourceText=document.getElementById('data_well').value;
        serviceAgent.entryQueue = parseCutText(sourceText);
        for (var qid=0;qid<serviceAgent.entryQueue.length;qid++){
            var cutNo   = serviceAgent.entryQueue[qid][0];
            var cutTime = serviceAgent.entryQueue[qid][1];//整数化が済んでいるものとする
            if((String(cutNo).length > 0)&&(cutTime > 0)){
                // ビルドの際にXPSを参照するのはあまり良くない これは引数で与えるか、またはdocumentDepotのプロパティから取得する
                var myXps = new Xps(5,cutTime);
                myXps.title     = xUI.XPS.title;
                myXps.opus      = xUI.XPS.opus;
                myXps.subtitle  = xUI.XPS.subtitle;
                myXps.cut       = cutNo;//sciはやく
                myXps.create_user = xUI.currentUser;
            }else{
                myXps=null;
            }
                serviceAgent.entryQueue[qid] = myXps;
        }
        serviceAgent.entryQueue.select = 0;//エントリ用のキューを初期化
        ix = 0;
    }
        //カット番号が空・カット尺が0　の場合は処理スキップ
        
console.log("queue entry : "+ix);

        if(serviceAgent.entryQueue[ix]){
console.log(serviceAgent.entryQueue[ix]);
console.log(decodeURIComponent(Xps.getIdentifier(serviceAgent.entryQueue[ix])));
            serviceAgent.currentRepository.pushEntry(serviceAgent.entryQueue[ix],function(){
                serviceAgent.entryQueue.select ++;
                if(serviceAgent.entryQueue.select < serviceAgent.entryQueue.length){
                    makeNewEntriesFromFormatedText(serviceAgent.entryQueue.select);
                }else{
                    //終了
                    alert('エントリ終了だと思われるナリ :' + serviceAgent.entryQueue.select+"/"+serviceAgent.entryQueue.length)
                }
            });
        }else{
                 //エントリ不正の場合は、処理スキップ
                serviceAgent.entryQueue.select ++;
                if(serviceAgent.entryQueue.select < serviceAgent.entryQueue.length)
                    makeNewEntriesFromFormatedText(serviceAgent.entryQueue.select);
        }
};

//makeNewEntriesFromFormatedText();