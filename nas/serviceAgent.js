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
とくに現在開いている（又は開いていない）リポジトリのカットとカブっている場合

    リポジトリ分類 kiyo
以下のような段階的な差を付けてアカウントを取得してもらう＋制作会社に有料サービスを販売しやすくしたい

    ローカルリポジトリ
オフライン作業用のリポジトリ
常に使用可能、このリポジトリのデータは対応する作品を管理するサーバと同期可能にする    
作業中に認証を失ったり、ネットワーク接続が切れた作業はこのリポジトリに保存することが可能
（作業バックアップ領域とは別　作業バックアップは常時使用可能）
ローカルリポジトリは容量が制限されるので保存できるカット数に制限がある（現在５カット　2016.11.15）
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

このアトリビュート毎・ユーザ毎に　権限が異なるケースがある

                
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



*/
/**
    ユーザ情報オブジェクト nas?
    表示名称と識別用メールアドレスを持つ
    ドキュメント上の記録形式は以下

    displayName:uid@domain
例　ねこまたや:user@example.com

初期化引数に':'が含まれない場合は、メールアドレスか否かを判定して
メールアドレスなら　uid部を名前として使用
それ以外の場合は、メールアドレスを空白で初期化する
一致比較は、メールアドレスで行う
 */
UserInfo = function UserInfo(nameDescription){
    if(nameDescription instanceof UserInfo){
            this.handle = nameDescription.handle;
            this.email  = nameDescription.email;
    } else if (nameDescription.indexOf(':') < 0){
    //セパレータがない
        if(nameDescription.indexOf('@') < 1){
            this.handle = nameDescription;//メールアドレスでないと思われるので引数全体をハンドルにする
            this.email  = '';
        }else{
            this.handle = nameDescription.split('@')[0];//メールアドレスっぽいので＠から前をハンドルにする
            this.email  = nameDescription;
        }
    } else {
         var infoArray  = nameDescription.split(':');
        this.handle     = infoArray[0];
        this.email      = infoArray[1];
    }
}
UserInfo.prototype.toString = function(opt){
    if(! opt) opt = 0;
    switch (opt){
        case "email":
            return this.email; break;
        case "handle":
            return this.handle; break;
        default :
            return [this.handle,this.email].join(':')
    }
}
UserInfo.prototype.sameAs = function(myName){
    if(!(myName instanceof UserInfo)){
        myName = new UserInfo(myName);
    }
    return (this.email==myName.email)?true:false;
}
/**
    サービスモードオブジェクト
    複数あるサーバ（ログイン先）の必要な情報を保持するオブジェクト
    複数のサービス情報をプログラム内に保持しないようにドキュメント内の属性として監理する
    同時に記録する認証は一つ、複数のログイン情報を抱える必要はない
    最期に認証したノード一つで運用　トークンは毎に再取得
*/
ServiceNode=function(serviceName,serviceURL){
    this.name = serviceName;//識別名称
    this.url  = serviceURL;//ベースになるURL
//    this.uid  = '';//uid ログインユーザID パスワードは控えない　必要時に都度請求
//    this.lastAuthorized = "";//最期に認証したタイミング
//    this.accessToken="";//アクセストークン
//    this.username = kiyo@nekomataya.info
//    this.password = 'devTest'
//  以下の情報は、テスト用に埋め込み　あとで分離処置
    this.client_id = "b115aead773388942473e77c1e014f4d7d38e4d4829ae4fd1fa0e48e1347b4cd";
    this.client_secret = "54c0f02c38175436df16a058cc0c0e037038c82d3cc9ce4c212e3e4afe0449dd";
}
/**
    リクエストのヘッダにトークンを載せる
    トークンの期限が切れていた場合は、再度のトークン取得（再ログイン）を促す
v1向けのコーデーデングは考慮しない
*/
ServiceNode.prototype.setHeader = function(xhr){
    var oauth_token = $('#server-info').attr('oauth_token');
    var organizationToken = (serviceAgent.currentRepository)? serviceAgent.currentRepository.token:false;
//    console.log(organizationToken)
    if(oauth_token.length==0) return false;
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*' );//?
        xhr.setRequestHeader('Authorization', ( "Bearer " + oauth_token));    
        if(organizationToken) xhr.setRequestHeader('OrganizationToken', organizationToken );
//    console.log(xhr);
    return true;
}
/**
    データ取得
    参考コード　実際にはコールされない
*/
ServiceNode.prototype.getFromServer = function getFromServer(url, msg){
//V1
    $.ajax({
        url: this.url + url,
        type: 'GET',
        dataType: 'json',
        success: (function(res) {
            console.log(msg);
            console.log(res);
        }).bind(this),
        beforeSend: this.setHeader
    });
//V2    
        $.ajax({
          url: this.url + url,
          type: 'GET',
          dataType: 'json',
          success: function(res) {
            console.log(msg);
            console.log(res);

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
    認証手続きはサービスノードのメソッド　ノード自身が認証と必要なデータの記録を行う
    パスワードは記録しない
    認証毎にパスワードをユーザに要求する
        myService.authorize()
    パスワードとUIDは、ページ上のフォームから読む
 
    
*/
ServiceNode.prototype.authorize=function(){
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
    var oauthURL=this.url.split('/').slice(0,3).join('/');
    $.ajax({
        type: "POST",
        url: oauthURL+"/oauth/token.json",
        data: data,
		success : (function(result) {
		    console.log(result)
		    console.log(this)
            $('#server-info').attr('oauth_token'  , result.access_token);
            $('#server-info').attr('last_authrized' , new Date().toString());
            serviceAgent.authorized('success');
            this.getRepositories();
		}).bind(this),
		error : function(result) {
		    /**
		        認証失敗 トークンと必要情報をクリアして表示を変更する
		    */            
            $('#server-info').attr('oauth_token'  , '');
            $('#server-info').attr('last_authrized' , '');
            serviceAgent.authorized('false');
		}
	});
}
/**
    リポジトリ（TEAM）一覧を取得してUIを更新する
*/
ServiceNode.prototype.getRepositories=function(){
    if(false){
//v1code 不用
        this.repositories.splice(1);//localRepositoryを残してクリア
        this.repositories.push(new NetworkRepository('*',this,this.url+'/v1'));
      }
        $.ajax({
          url : this.url + '/organizations.json',
          type : 'GET',
          dataType : 'json',
          success : (function(result) {
            console.log(result);
            serviceAgent.repositories.splice(1);//ローカルリポジトリを残してクリア(要素数１)
            for( var rix=0 ; rix<result.length ; rix ++){
                serviceAgent.repositories.push(new NetworkRepository(result[rix].name,this));
                serviceAgent.repositories[serviceAgent.repositories.length - 1].token = result[rix].token;
            };
            var myContents="";
    myContents += '<option selected value=0> = local Repository =' ;
    for(var idr=1; idr < serviceAgent.repositories.length;idr ++){
        myContents +='<option value="'+idr+'" >'+serviceAgent.repositories[idr].name; 
    }
    document.getElementById('repositorySelector').innerHTML = myContents;

          }).bind(this),
          error : function(result){
            console.log(result);
          },
          beforeSend: (this.setHeader).bind(this)
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


ラインID　ステージID　及びジョブIDはカット（管理単位）毎の通番　同じIDが必ずしも同種のステージやジョブを示さない。
管理工程の連続性のみが担保される
識別子に管理アイテム識別文字列を加えても良い

第４要素は作業状態を示す文字列

    例:
0//0//0//Stratup
0:本線//1:レイアウト//2:演出検査//Active
 
    ラインID
ラインが初期化される毎に通番で増加 整数
0   本線　primaryライン
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
 //将来は以下で置き換え予定　CSオブジェクト未実装
    myXps.sci.getIdentifier();
 //Xpsオブジェクトのクラスメソッドとして仮実装済み オブジェクトメソッドとして同名の機能の異なる関数があるので要注意
 　Xps.getIdentifier(myXps);
 　
*/
/**
比較関数　管理情報3要素の管理情報配列　issuesを比較して先行の管理ノード順位を評価する関数
ライン拡張時は追加処理が必要
*/
issuesSorter =function(val1,val2){
    return (parseInt(val1[0].split(':')[0]) * 10000 + parseInt(val1[1].split(':')[0]) * 100 + parseInt(val1[2].split(':')[0])) - ( parseInt(val2[0].split(':')[0]) * 10000 + parseInt(val2[1].split(':')[0]) * 100 + parseInt(val2[2].split(':')[0]));
};

/**
初期化引数:カット識別子[タイトルID,話数ID,カットID]

    ドキュメントリストにエントリされるオブジェクト
    parent  リポジトリへの参照
    product 作品と話数
    sci     カット番号（兼用情報含む）
    issues  管理情報　４要素一次元配列 [line,stage,job,status]
    実際のデータファイルはissueごとに記録される
    いずれも　URIエンコードされた状態で格納されているので画面表示の際は、デコードが必要

    ネットワークリポジトリに接続する場合は以下のプロパティが追加される
    listEntry.titleID   /int
    listEntry.episodeID /int
    listEntry.iassues[#].cutID  /int
    
*/
listEntry=function(myIdentifier){
    var dataArray=myIdentifier.split("//");
    this.parent;//初期化時にリポジトリへの参照を設定
    this.product = dataArray[0];
    this.sci     = dataArray[1];
    this.issues  = [dataArray.slice(2)];
    // this.status  = (dataArray[5])?dataArray[5]:'fixed';
if(arguments.length>1) {
        this.titleID    = arguments[1];
        this.episodeID  = arguments[2];
        this.issues[0].cutID = arguments[3];
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
            return [this.product,this.sci].join("//")+"//"+ this.issues[this.issues.length - 1 - myIndex].join("//");
            //この部分の手続はラインをまたぐと不正な値を戻すので要修正　11.23
        }else{
            return [this.product,this.sci].join("//")+"//"+ this.issues[this.issues.length - 1].join("//");
        }
    }
}
/**
    識別子を引数にして管理情報をサブリストにプッシュする
    管理情報のみが与えられた場合は無条件で追加
    フルサイズの識別子が与えられた場合は　SCI部分までが一致しなければ操作失敗
    追加成功時は管理情報部分を配列で返す
    
    
    SCI部分のみでなく　ラインとステージが一致しないケースも考慮すること（今回の実装では不用）
    
    ネットワークリポジトリ・DB接続用にIDを増設
    
    
*/
listEntry.prototype.push=function(myIdentifier){
    var dataArray=myIdentifier.split("//");
    if(dataArray.length > 5){
        if((dataArray[0]!=this.product)||(dataArray[1]!=this.sci)){return false;}
        issueArray = dataArray.slice(2);
    } else {
        issueArray = dataArray;
    }
    if(arguments.length>1) {
        this.titleID     = arguments[1];
        this.episodeID   = arguments[2];
        issueArray.cutID = arguments[3];
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
    ローカルリポジトリ
    主に最近の作業データをキャッシュする役目
    カットのデータを履歴付きで保持できる
    複数カットを扱う　制限カット数内のリングバッファ動作
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
    maxEntry:5
};

/**
    getListメソッドは、ストアリストをクリア
    ローカルストレージ内のデータをすべて走査してストアリストに格納
    エントリリストの更新を行う

    戻り値はストアされたエントリの数
    実際のデータ・エントリリストが必要な場合は、localRepository.entryList を参照すること
    ドキュメントセレクタの値を更新するためには、
    リポジトリの更新　ドキュメントリストの再構築の順で実行…　まとめたほうが良いかも
*/
/**
    フィルタ引数　myFilter,isRegex
    if(typeof myFilter == "undefined") {myFilter=".+";};
    var myFilterRegex =(isRegex)? new RegExp(myFilter):new RegExp(".*"+myFilter+".*");
//エントリ数を少なく制限するのでここでは実際はフィルタは意味をなさない　フィルタのフォーマットは一考


*/

localRepository.getList=function(){
    var keyCount=localStorage.length;//ローカルストレージのキー数を取得
    this.entryList.length=0;//配列初期化
    var currentEntryID;
    for (var kid=0;kid<keyCount;kid++){
        if(localStorage.key(kid).indexOf(this.keyPrefix)==0){
            var currentIdentifier=localStorage.key(kid).slice(this.keyPrefix.length);
            var entryArray=currentIdentifier.split( "//" );//分離して配列化
            var myEntry=entryArray.slice(0,2).join( "//" );//管理情報を外してSCi部のみ抽出
            var hasEntry = false;
            for (var eid=0 ; eid < this.entryList.length; eid ++){
                //エントリリストにすでに登録されているか検査
                if(myEntry == this.entryList[eid]){ currentEntryID = eid; hasEntry=true; break; }
            }
            if(hasEntry){
                //登録済みプロダクトなのでエントリに管理情報を追加
                this.entryList[currentEntryID].push(entryArray.slice(2).join("//"))
            }else{
                //未登録新規プロダクトなのでエントリ追加
                var newEntry = new listEntry(currentIdentifier);
                newEntry.parent = this;
                this.entryList.push(newEntry);
            }
        }
    }
    //リスト更新を行ったのでエントリをドキュメントブラウザに送る
    documentDepot.documentsUpdate();
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
localRepository.pushEntry=function(myXps){
//クラスメソッドで識別子取得
    var myIdentifier=Xps.getIdentifier(myXps);
//識別子に相当するアイテムがローカルストレージに存在するかどうかをチェック
    var targetArray = String(myIdentifier).split( '//' );//ここでは必ず6要素ある
    var myProductUnit   = targetArray.slice(0,2).join( '//' );//プロダクトユニットを抽出(この時点でサブタイトルが評価値に含まれるので要注意)
    for (var pid=0;pid<this.entryList.length;pid++){
        if(this.entryList[pid].toString() == myProductUnit){
            //既存のエントリが有るのでストレージとリストにpushして終了
            this.entryList[pid].push(myIdentifier);
            localStorage.setItem(this.keyPrefix+myIdentifier,myXps.toString());
            return this.entryList[pid];
        };
    };
//既存エントリが無いので新規エントリを追加
    localStorage.setItem(this.keyPrefix+myIdentifier,myXps.toString());
    this.entryList.push(new listEntry(myIdentifier))

    if(this.entryList.length>this.maxEntry){
    　//設定制限値をオーバーしたら、ローカルストレージから最も古いエントリを削除
        for (var iid=0;iid<this.entryList[0].issues.length;iid++){
             localStorage.removeItem(this.keyPrefix+this.entryList[0].this.entryList[0].issues[iid]);
        };
        this.entryList=this.entryList.slice(1);
    }
    this.getList();
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
    //引数の識別子を分解して配列化
    var targetArray = String(myIdentifier).split( '//' );//引数検査は行わない
    var myProductUnit   = targetArray.slice(0,2).join( '//' );//引数の状況に関係なく設定
    var myIssue = false;
    var refIssue = false;
    checkProduct:{
        for (var ix=0;ix<this.entryList.length;ix++){
            if ( myProductUnit == this.entryList[ix].toString() ) break checkProduct;
        }
        return false ;//プロダクトが無いので失敗
    }
    if( targetArray.length == 2){
   //引数に管理部分がないので、最新のissueとして補う
    var cx = this.entryList[ix].issues.length-1;//最新のissue
    myIssue = this.entryList[ix].issues[cx];//配列で取得
        targetArray=(myProductUnit.split('//')).concat(myIssue);//連結更新
    } else {
    //指定管理部分からissueを特定する 連結して文字列比較（後方から検索) リスト内に指定エントリがなければ失敗
        var targetIssue =  targetArray.splice(2).join('//');//
        checkIssues:{
            for (var cx = (this.entryList[ix].issues.length-1) ; cx <= 0 ;cx--){
                if ( this.entryList[ix].issues[cx].join('//') == targetIssue ){ myIssue = this.entryList[ix].issues[cx]; break checkIssues;}
            }
        if (! myIssue) return false;
        }
    }
    // 構成済みの情報を判定 (リファレンス置換 or 新規セッションか)
//    if(targetArray.length == 6) isReference = true ;//指定データが既Fixなので自動的にリファレンス読み込みに移行 
// ここの自動判定は削除
    // ソースデータ取得
    console.log(targetArray.join( '//' ));
    var myXpsSource=localStorage.getItem(this.keyPrefix+targetArray.join( '//' ));
    if(myXpsSource){
        if(callback instanceof Function){
            //コールバック渡しの場合はリファレンス指定は無効
            console.log(callback);
            //setTimeout('callback('+myXpsSource+')',10);
            return true;
        }
        if(isReference){
            
        //データ単独で現在のセッションのリファレンスを置換
            documentDepot.currentReference = new Xps();
            documentDepot.currentReference.readIN(myXpsSource);
            xUI.setReferenceXPS(documentDepot.currentReference);
        }else{
        //新規セッションを開始する
            documentDepot.currentDocument = new Xps();
            documentDepot.currentDocument.readIN(myXpsSource);
            //自動設定されるリファレンスはあるか？
            //指定管理部分からissueを特定する 文字列化して比較
            if ( cx > 0 ){
//                console.log(myIssue);
                if(parseInt(decodeURIComponent(myIssue[2]).split(':')[0]) > 0 ){
                //ジョブIDが１以上なので　単純に一つ前のissueを選択する（必ず先行jobがある）
                    refIssue = this.entryList[ix].issues[cx-1];
                }else if(( myIssue[1].split(':')[0] > 0 )&&( myIssue[2].split(':')[0] > 0 )){
                //第2ステージ以降前方に向かって検索
                //最初にステージIDが先行IDになった要素が参照すべき要素
                    for(var xcx = cx;xcx >= 0 ; xcx --){
                        if (parseInt(decodeURIComponent(this.entryList[ix].issues[xcx][1]).split(':')[0]) == (parseInt(decodeURIComponent(myIssue[1]).split(':')[0])-1)){
                            refIssue = this.entryList[ix].issues[xcx];
                            break;
                        }
                    }
                };//cx==0 のケースでは、デフォルトで参照すべき先行ジョブは無い
//              console.log(refIssue)
                documentDepot.currentReference = new Xps(5,144);//カラオブジェクトを新規作成
                if(refIssue){
                    console.log(this.keyPrefix + myProductUnit + '//' + refIssue.join('//'))
                    myRefSource=localStorage.getItem(this.keyPrefix + myProductUnit + '//' + refIssue.join('//'));//リファレンスソースとる
                    if(myRefSource){
                        documentDepot.currentReference.readIN(myRefSource);
                    }
                }
            }
            console.log(documentDepot.currentReference);
            　XPS=documentDepot.currentDocument;xUI.init(XPS,documentDepot.currentReference);nas_Rmp_Init();
            　xUI.setUImode('browsing');sync("productStatus");
            　sWitchPanel('File');
        }
    } else { 
        return false;
    }
}
/**
    識別子を指定してローカルリポジトリから相当エントリを消去する
    リストは再構築
    ローカルリポジトリに関しては、各ユーザは編集権限を持つ
    
    また、ステータス変更のため内部ルーチンがこのメソッドを呼ぶ
    直接要素編集をしても良い？
*/
localRepository.removeEntry=function(myIdentifier){
    var targetArray = String(myIdentifier).split( '//' );
    var myProductUnit   = targetArray.slice(0,2).join( '//' );//プロダクトユニットを抽出
    for (var pid=0;pid<this.entryList.length;pid++){
        if(this.entryList[pid].toString() == myProductUnit){
    　  //関連するエントリをすべて削除
            for (var iid=0;iid<this.entryList[pid].issues.length;iid++){
                localStorage.removeItem(this.keyPrefix+this.entryList[pid].toString(iid));
            };
            var removedEntry = this.entryList.splice(pid,1);
            this.getList();
            return removedEntry;
        }
    }    
}
/**
    識別子でエントリリストを検索して該当するリストエントリを返す操作をメソッド可
    issuesは受取先で評価
    NetroekRepositoryにも同メソッドを
*/
localRepository.entry=function(myIdentifier){
    var targetArray     = String(myIdentifier).split( '//' );
    var myProductUnit   = targetArray.slice(0,2).join( '//' );//プロダクトユニットを抽出
//    var myIssues        = if( targetArray.length == 2)? null :targetArray.slice(2,6).join( '//' );
    for (var pid=0;pid<this.entryList.length;pid++){
        if(this.entryList[pid].toString() == myProductUnit){
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
        //ここ判定違うけど保留 あとでフォーマット整備 USERNAME:uid@domain(mailAddress)　 型式で暫定的に記述
        //':'が無い場合は、メールアドレスを使用
        console.log(xUI.currentUser.sameAs(newXps.update_user));
        if ((newXps)&&(xUI.currentUser.sameAs(newXps.update_user))){
            　//同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
            newXps.currentStatus = 'Active';
            console.log('activate : '+decodeURIComponent(Xps.getIdentifier(newXps)));
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var result = (localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps)) == newXps.toString())?true:false;
            if(result){
                console.log('activated');
                localStorage.removeItem (this.keyPrefix+currentEntry.toString(0));
                this.getEntry();//リストステータスを同期
                documentDepot.rebuildList();
                xUI.XPS.currentStatus='Active';//ドキュメントステータスを更新
            }else{
                console.log('ステータス変更失敗　:');
                delete newXps ;
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
                return false;
            }
            console.log(newXps)
            xUI.setUImode('production');
            sWitchPanel();//パネルクリア
            if(callback instanceof Function){ setTimeout (callback,10);}
            return true;
        }else{
            console.log('ステータス変更不可　:'+ Xps.getIdentifier(newXps));
            if(callback2 instanceof Function) {setTimeout(callback2,10);}
            return false
        }
}
//作業を保留する　リポジトリ内のエントリを更新してステータスを変更 
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
//            console.log(result);
            if(result){
                console.log('deactivated');
                localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
                this.getEntry();//リストステータスを同期
                documentDepot.rebuildList();
                xUI.XPS.currentStatus='Hold';//ドキュメントステータスを更新
            }else{
            //保存に失敗
                console.log('保留失敗')
                delete newXps ;
                return false;
            }
            //データをホールドしたので、リストを更新　編集対象をクリアしてUIを初期化
            xUI.setUImode('production');
            sWitchPanel();//パネルクリア
        }else{
            console.log('保留可能エントリが無い　:'+ Xps.getIdentifier(newXps));
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
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry){
        console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
            //次のJobへチェックイン　読み出したデータでXpsを初期化 
        var newXps = new Xps();
        var currentContents = localStorage.getItem(this.keyPrefix+currentEntry.toString(0));
        if (currentContents) {
            newXps.readIN(currentContents);
        } else {
            console.log('読み出し失敗')
            return false;
        }
        //　ユーザ判定は不用（権利チェックは後ほど実装）
        if (newXps){
            newXps.job=new XpsStage((myJob)? myJob:xUI.currentUser.handle + ':1');
            newXps.currentStatus = 'Active';
            console.log(newXps.toString());//
            　//引数でステータスを変更したエントリを作成 新規に保存　JobIDは必ず繰り上る
            // newXps.job=new XpsStage(jobName+':'+(parseInt(newXps.job.id)+jobIDoffset));
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var resultData = localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps));
            console.log(resultData);
            var result = ( resultData == newXps.toString()) ? true:false;
            if(result){
                console.log('checkin');
                //delete newXps ;
                console.log(newXps.currentStatus);
                xUI.XPS.currentStatus='Active';//ドキュメントステータスを更新
                if(callback instanceof Function){ setTimeout('callback()',10)};
                sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                this.getEntry();//リストステータスを同期
                documentDepot.rebuildList();
                xUI.setUImode('production');//モードをproductionへ
                return result;
            }else{
                console.log(result);
            }
        }
        console.log('編集権利取得失敗');
        //　すべてのトライに失敗
        if(callback2 instanceof Function){ setTimeout('callback2()',10)};
        return false ;
}
/**
    作業終了
*/
localRepository.checkoutEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry) {
        console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
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
                localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
                this.getEntry();//リストステータスを同期
                documentDepot.rebuildList();
                xUI.XPS.currentStatus='Fixed';//ドキュメントステータスを更新
                if(callback instanceof Function){ setTimeout('callback()',10)};
                sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                xUI.setUImode('browsing');//モードをbrousingへ
                return result;
            // データをFixしたので、編集対象をクリアしてUIを初期化
            // XPS=new Xps(5,144);xUI.init(XPS);nas_Rmp_Init();
            }
        }
        console.log('終了更新失敗');
        delete newXps ;
        if(callback2 instanceof Function){ setTimeout('callback2()',10)};
        return false ;
}
/**
    検収処理
*/
localRepository.receiptEntry=function(myIdentifier){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry) return false;
    switch (currentEntry.getStatus()){
        case 'Startup':
        case 'Active':
        case 'Hold':
            //条件付きで処理
        break;
        case 'Fixed':
            //処理
        break;
    }
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
            //管理モード下でのみ処理　このメソッドのコール自体が管理モード下でのみ可能にする
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
    ネットワーク上のリポジトリオブジェクト
    識別名とサーバを与えて初期化する
        リポジトリとしての共通メソッド
    .getList()
    .getEntry(myIdentifier)
    .putEntry(myXps)
        
リポジトリに　相当する構造は　Team
チームごとにリポジトリが設定される
Teamへアクセスするためのトークンは、アクセス毎に設定される
*/
NetworkRepository=function(repositoryName,myServer,repositoryURI){
    this.name = repositoryName;
    this.service = myServer;//リポジトリの所属するサーバ
    this.url=(typeof repositoryURI == 'undefined')?this.service.url:repositoryURI;//サーバとurlが異なる場合は上書き
    this.token=null;//nullで初期化
//サーバ内にTeamが実装　Teamをリポジトリとして扱うのでその切り分けを作成　12/13
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
    this.curentIssue;
    this.productsData=[];
    this.entryList=[];
}
/**
    タイトル一覧をクリアして更新する　エピソード更新を呼び出す
    受信したデータを複合させてサービス上のデータ構造を保持する単一のオブジェクトに
    getXx で概要（一覧）を取得
    xxUpdateが詳細を取得して this.productsData を上書きしてゆく

*/
NetworkRepository.prototype.getProducts = function (){
    this.productsData.length = 0;
    $.ajax({
        url: this.url+'/products.json',
        type: 'GET',
        dataType: 'json',
        success: (function(result) {
            console.log('get productsData');
            console.log(result);
		    this.productsData=result;
		    this.productsUpdate();
        }).bind(this),
        beforeSend: (this.service.setHeader).bind(this)
    });

}
/**
    タイトルごとの詳細（エピソードリスト含む）を取得してタイトルに関連付ける
    エントリリストの更新を行う
*/
NetworkRepository.prototype.productsUpdate = function(){
    for(var idx = 0 ;idx < this.productsData.length ;idx ++){
        console.log("product :"+this.productsData[idx].name) ;
    $.ajax({
        url: this.url+'/products/'+this.productsData[idx].token+'.json' ,
        type: 'GET',
        dataType: 'json',
        success: (function(result) {
            for(var idx = 0 ;idx < this.productsData.length ;idx ++){
                //プロダクトデータを詳細データに「入替」
		            if(result.token == this.productsData[idx].token){
		                this.productsData[idx]=result ;
		                
/*        if( this.productsData[idx].description != encodeURIComponent(this.productsData[idx].name )){
            this.productsData[idx].description  = encodeURIComponent(this.productsData[idx].name);
        }*/
		                break;
		            }
		    }
		console.log('update products detail')
        console.log(this.productsData);
		    this.getEpisodes(idx);
        }).bind(this),
        beforeSend: (this.service.setHeader).bind(this)
    });

    }
}
/**
    プロダクトごとにエピソード一覧を再取得してデータ内のエピソード一覧を更新
*/
NetworkRepository.prototype.getEpisodes = function (pid) {
        console.log("getEpisodeList for : "+pid+' : '+this.productsData[pid].name) ;
        
    $.ajax({
        url: this.url+'/episodes.json?product_token='+this.productsData[pid].token ,
        type: 'GET',
        dataType: 'json',
        success: (function(result) {
                //プロダクトデータのエピソード一覧を「入替」
		            if(result){
		                this.productsData[pid].episodes[0]=result ;
		            }
    console.log('get Episodes :'+this.productsData[pid].name);
    console.log(result);
		    this.episodesUpdate(pid);
        }).bind(this),
        beforeSend: (this.service.setHeader).bind(this)
    });
}
/**
    プロダクトリストのIDを指定してエピソード詳細を取得
    エピソードIDを指定して内部リストにコンバート
 */
NetworkRepository.prototype.episodesUpdate = function (pid) {
        console.log("get Episodes Detail for : "+pid+' : '+this.productsData[pid].name) ;
        for( var eid = 0 ; eid < this.productsData[pid].episodes[0].length ; eid ++){
	            // /api/v2
                var targetURL = this.url+ '/episodes/'+this.productsData[pid].episodes[0][eid].token +'.json';
//    console.log(targetURL);
	            $.ajax({
                    url: targetURL,
                    type: 'GET',
                    dataType: 'json',
                    success: (function(result) {
                        console.log('episode:');
                        console.log(result);
                      searchLoop:{
                        for( var idx = 0 ; idx < this.productsData.length ; idx ++){
                            if((typeof this.productsData[idx].episodes == 'undefined')||(this.productsData[idx].episodes[0].length == 0)) continue;//エピソード数０の際は処理スキップ
                            for( var eid = 0 ; eid < this.productsData[idx].episodes[0].length ; eid ++){
                                    var myToken = this.productsData[idx].episodes[0][eid].token;
                                if( result.token == myToken ){
                                    this.productsData[idx].episodes[0][eid] = result;
/*                                    if( this.productsData[idx].episodes[0][eid].description != encodeURIComponent(this.productsData[idx].episodes[0][eid].name )){
                                        this.productsData[idx].episodes[0][eid].description  = encodeURIComponent(this.productsData[idx].episodes[0][eid].name);
                                    }*/
                                    break searchLoop;
                                };
                            }
                        }
                      }
                      this.getSCi(myToken);
//                     this.getList();
                    }).bind(this),
                    beforeSend: (this.service.setHeader).bind(this)
                });
	    }
};
/**
    エピソード毎にカットリストを再取得
    エピソード詳細の内部情報にコンバート
    カット一覧にdescriptionを出してもらう
 */
NetworkRepository.prototype.getSCi = function (epToken) {
                var targetURL = this.url+ '/cuts.json?episode_token='+epToken ;
	            $.ajax({
                    url: targetURL,
                    type: 'GET',
                    dataType: 'json',
                    success: (function(result) {
                        console.log('episode:'+epToken);
                        console.log(result);
                      searchLoop:{
                        for( var idx = 0 ; idx < this.productsData.length ; idx ++){
                            if((typeof this.productsData[idx].episodes == 'undefined')||(this.productsData[idx].episodes[0].length == 0)) continue;//エピソード数０の際は処理スキップ
                            for( var eid = 0 ; eid < this.productsData[idx].episodes[0].length ; eid ++){
                                if(epToken == this.productsData[idx].episodes[0][eid].token ){
                                    this.productsData[idx].episodes[0][eid].cuts[1]=result;//cuts[1] としてアクセス
/**
エントリ取得タイミングで仮にcutのdescription を追加するcuts[1][cid].description を作成して調整に使用する
本番ではデータ比較ありで、入替えを行う
サーバ側のプロパティ優先
*/
    var myIdentifier_opus =
        encodeURIComponent(this.productsData[idx].name) +
        '#'+encodeURIComponent(this.productsData[idx].episodes[0][eid].name) +
        ((this.productsData[idx].episodes[0][eid].description.length)?'['+encodeURIComponent(this.productsData[idx].episodes[0][eid].description) +']':'');
for ( var cid = 0 ; cid < result.length ; cid ++){
    var myIdentifier_cut = encodeURIComponent(this.productsData[idx].episodes[0][eid].cuts[0][cid].name);
    this.productsData[idx].episodes[0][eid].cuts[1][cid].description=[myIdentifier_opus,myIdentifier_cut].join('//');
}            
                                    
                                    
                                    break searchLoop;
                                };
                            }
                        }
                      }
                     this.getList();
                    }).bind(this),
                    beforeSend: (this.service.setHeader).bind(this)
                });
};

/**
リポジトリ内のentryListを更新する
*/
NetworkRepository.prototype.getList = function (){
    this.entryList.length=0;
    if(this.productsData.length==0) {
        this.getProducts();
        return;//最終工程でこの関数が呼び出されるので一旦処理中断
    }else{
        for(var idx = 0 ;idx < this.productsData.length ;idx ++){
            currentTitle = this.productsData[idx];//
            if(typeof currentTitle.episodes == "undefined"){
                this.productsUpdate();
                return;//情報不足　中断
            }
            if( currentTitle.episodes[0].length == 0 ) continue;
            for(var eid = 0 ;eid < this.productsData[idx].episodes[0].length ; eid ++){
                currentEpisode = currentTitle.episodes[0][eid];
                if(typeof currentEpisode.cuts == "undefined"){
                    this.episodesUpdate(idx);
                    return;//中断
                }
                if( currentEpisode.cuts.length==1){this.getSCi(currentEpisode.token);return;}
                if( currentEpisode.cuts[1].length == 0 ) continue;
                for(var cid = 0 ; cid < currentEpisode.cuts[1].length ;cid ++){
                //現在のサーバエントリ情報はサブタイトルと秒数なし 管理情報は[0,0,0,'fixed']固定で　これは保存時にアプリ側から送る仕様にする
                //兼用カット情報はペンディング
//                var myCutId=(typeof currentEpisode.cuts[0][cid].id == 'undefined')?
 //                   currentEpisode.cuts[0][cid].url.split( '/' ).reverse()[0].split( '.' )[0]:
  //                  currentEpisode.cuts[0][cid].id;//これは修正予定
                var myCutToken = currentEpisode.cuts[1][cid].token;

/*                var entryArray = [
                    encodeURIComponent(currentTitle.name)+'#'+encodeURIComponent(currentEpisode.name) ,
                    'S-C'+encodeURIComponent(currentEpisode.cuts[1][cid].name),
                    0,0,0,'fixd'
                ];*/
                //管理情報が不足の場合は初期値で補う
                var entryArray = (currentEpisode.cuts[1][cid].description.split('//').concat(['0:primary','0:Startup','0:Startup','Startup'])).slice(0,6);//

                var myEntry=entryArray.slice(0,2).join( "//" );//管理情報を外してSCi部のみ抽出
                var hasEntry = false;
                var currentEntryID =false;
                for (var xid=0 ; xid < this.entryList.length; xid ++){
                //エントリリストにすでに登録されているか検査
                    if(myEntry == this.entryList[xid].toString()){ currentEntryID = eid; hasEntry=true; break; }
                }
                if((hasEntry)&&(currentEntryID)){
                    //登録済みプロダクトなので管理情報を追加
                    this.entryList[currentEntryID].push(entryArray.slice(2).join("//"),currentTitle.token,currentEpisode.token,myCutToken);
                }else{
                    //未登録新規プロダクトなのでエントリ追加
                    var newEntry = new listEntry(entryArray.join('//'),currentTitle.token,currentEpisode.token,myCutToken)
                    newEntry.parent = this;
                    this.entryList.push(newEntry);
                }
            }
        }
    }
    }
    documentDepot.documentsUpdate();
    return this.entryList.length;
}
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
*/
NetworkRepository.prototype.getEntry = function (myIdentifier,isReference,callback,callback2){
    console.log('getEntry :' + decodeURIComponent(myIdentifier));
    if(typeof isReference == 'undefined'){isReference = false;}
    //引数の識別子を分解して配列化
    var targetArray     = String(myIdentifier).split( '//' );
    var myProductUnit   = targetArray.slice(0,2).join('//');
    var myIssue = false;
    var refIssue = false;
    checkProduct:{
        for (var ix=0;ix<this.entryList.length;ix++){
            if ( myProductUnit == this.entryList[ix].toString() ) break checkProduct;
        }
        return "noProduct :"+ myProductUnit;//プロダクトが無い
    }
    if( targetArray.length == 2 ){
    //ターゲットに管理部分がないので、最新のissueとして補う
        var cx = this.entryList[ix].issues.length-1;
        myIssue = this.entryList[ix].issues[cx];
        targetArray=(myProductUnit.split('//')).concat(myIssue);
    }else{
    //指定管理部分からissueを特定する 連結して比較（後方から検索)リスト内に指定エントリがなければ失敗
        var targetIssue =  targetArray.splice(2).join('//');//
        checkIssues:{
            for (var cx = (this.entryList[ix].issues.length-1) ; cx <= 0 ;cx--){
                if ( this.entryList[ix].issues[cx].join('//') == targetIssue ){ myIssue = this.entryList[ix].issues[cx]; break checkIssues; }
            }
        if (! myIssue) return 'no target data'+ targetIssue ;//ターゲットのデータが無い
            }
    }
    // 構成済みの情報を判定 (リファレンス置換 or 新規セッションか)
//    if(targetArray.length == 6) isReference = true ;//指定データが既Fixなので自動的にリファレンス読み込みに移行
    //この判定は不用

//      myIssue; これがカットへのポインタ　episode.cuts配列のエントリ myIssue.url　にアドレスあり
//      urlプロパティが無い場合はid があるのでidからurlを作成する
    var targetURL=(myIssue.url)? myIssue.url: '/cuts/'+myIssue.cutID.toString()+'.json';
/*
    if( myIssue[2] > 0 ){
        for (var cx=0;cx<this.entryList[ix].issues.length;cx++){
            if (myIssue.join('//') == this.entryList[ix].issues[cx].join('//')){ myIssue = this.entryList[ix].issues[cx]; break; }
        }
    }else if( myIssue[1] > 0){
        refIssue = [myIssue[0],myIsseu[1]-1,0];
    }
*/
//    console.log(targetURL);
  
//    that=this;
if(callback instanceof Function){
    $.ajax({
        url: this.url + targetURL,
        type: 'GET',
        dataType: 'json',
        success: (function(result) {
            var myContent=result.content;
            callback(myContent);
        }).bind(this),
        beforeSend: (this.service.setHeader).bind(this)
    });
/**
    以下コールバック指定なし（標準処理）
    
 */
}else
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
        success: (function(result) {
        	var myContent=result.content;//XPSソーステキストをセット
console.log("road :"+myContent);
	        //documentDepot.currentDocument=new Xps();
	        //documentDepot.currentDocument.readIN(myContent);//カレントドキュメントを設定
	        XPS.readIN(myContent)
//　読み込んだXPSが識別子と異なっていた場合識別子優先で同期する
            XPS.syncIdentifier(targetArray.join('//'));
	        xUI.init(XPS);
	        nas_Rmp_Init();
            sWitchPanel('File');
            if(callback instanceof Function) callback();
        }).bind(this),
        error:(function(result){
           console.log(result);
            if(callback2 instanceof Function) callback2();
        }).bind(this),
        beforeSend: (this.service.setHeader).bind(this)
    });

}else{
    //データ単独で現在のセッションのリファレンスを置換
    $.ajax({
        url: this.url + targetURL,
        type: 'GET',
        dataType: 'json',
        success: (function(result) {
            var myContent=result.content;//XPSソーステキストをセット
            console.log('import Reference'+myContent);
	        documentDepot.currentReference=new Xps();
	        documentDepot.currentReference.readIN(myContent);
	        xUI.setReferenceXPS(documentDepot.currentReference);
	        sWitchPanel('File');
            if(callback instanceof Function) callback();
        }).bind(this),
        error:(function(result){
           console.log(result);
            if(callback2 instanceof Function) callback2();
        }).bind(this),
        beforeSend: (this.service.setHeader).bind(this)
    });
}
  return null;
}
/**
    標準コールバックを作る
    コールバック関数が引数で与えられなかった場合は　xUIに新規Xpsとして与えて読み込ませる
    読み出したエントリに前方のジョブがあれば、それをリファレンスとして与えるルーチンも必要

function(result){
	var myContent=result.content;//XPSソーステキストをセット
//以下が標準の読み込み時の初期化
	if(xUI.XPS.readIN(myContent)){xUI.init(xUI.XPS);nas_Rmp_Init();}
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
データオブジェクトを渡してリポジトリにプッシュする
一致エントリがあれば上書き
一致エントリで先行の管理情報がロックされている場合はリジェクト
管理情報の世代が上がっていれば追加の管理情報を添えて保存
これは保存系のAPIが出てから調整
*/

NetworkRepository.prototype.pushEntry = function (myXps){
//識別子取得
    var myIdentifier=Xps.getIdentifier(myXps);
//識別子に相当するアイテムがリポジトリに存在するかどうかをチェック
    var targetArray = String(myIdentifier).split( '//' );//ここでは必ず6要素ある
    var myProductUnit   = targetArray.slice(0,2).join( '//' );//プロダクトユニットを抽出


    for (var pid=0;pid<this.entryList.length;pid++){
        if(this.entryList[pid].toString() == myProductUnit){
            //既存のエントリが有るのでストレージとリストにpushして処理終了
            var currentEntry=this.entryList[pid].push(myIdentifier);
            
            this.pushData(currentEntry,myXps.toString());
            return this.entryList[pid];
        };
    };
//既存エントリが無いので新規エントリを追加
    var newEntry = this.entryList.push(new listEntry(myIdentifier))
    this.pushData(newEntry,myXps.toString());
    this.getList();
    return this.entryList[this.entryList.length-1];

};
/**
    実際にサーバにデータを送る
    
*/
NetworkRepository.prototype.pushData = function (myEntry,myContents){
    console.log(myEntry);
//    var targetArray = myIdentifier.split('//');
	var episode_id  = myEntry.episodeID;
	var lastIssue   = myEntry.issues[myEntry.issues.length-1];
	var cut_id      = lastIssue.cutID;
	var method_type = '';
	var target_url  = '';
 var title_name     = myEntry.product.split('#')[0];
 var episode_name   = myEntry.product.split('#')[1];
 var cut_name       = myEntry.product.sci;
 var line_id        = lastIssue[0];
 var stage_id       = lastIssue[1];
 var job_id         = lastIssue[2];
 var status         = lastIssue[3];
/**
  if(document.getElementById('backend_variables')){
	var episode_id = $('#backend_variables').attr('data-episode_id');
	var cut_id = $('#backend_variables').attr('data-cut_id');
	var method_type = '';
	var target_url = '';
  }else{
  	alert('no network service');
  }

	保存時に送り出すデータに
		タイトル・エピソード番号（文字列）・サブタイトル
		カット番号+カット尺
	を加えて送出する
	型式をきめこむ
	サーバ側では、これが保存状態と異なる場合は、エラーを返すか又は新規タイトルとして保存する必要がある。
	アプリケーション側は、この文字列が異なる送出を抑制して警告を出す？
	
*/
	json_data = {
			 		content: myContent,
		     		episode_id: episode_id,
			 		cut_id: cut_id,
			 		title_name: title_name,
			 		episode_name: episode_name,
			 		cut_name: cut_name,
			 		line_id: line_id,
			 		stage_id: stage_id,
			 		job_id: job_id,
			 		status: status
				};


	if ((typeof cut_id == 'undefined')||( cut_id == '' )){
		method_type = 'POST';
		target_url = '/cuts.json';
	}else{
		method_type = 'PUT';
		target_url = '/cuts/' + cut_id + '.json'
	}

/*
episode_id,cut_idに関しては、データ内に専用のプロパティを置いて記録するのが良いと思います。

開発中の　制作管理DB/MAP/XPS　で共通で使用可能なnas.SCInfoオブジェクトを作成中です。
これに一意のIDを持たせる予定です。
*/

	console.log(method_type+' :'+this.url+target_url +'\n' +JSON.stringify(json_data));
	$.ajax({
		type : method_type,
		url : this.url+target_url,
		data : JSON.stringify(json_data),
		contentType: 'application/JSON',
		dataType : 'JSON',
		scriptCharset: 'utf-8',
		success : function(data) {
			xUI.setStored("current");//UI上の保存ステータスをセット
			sync();//保存ステータスを同期

			if( method_type == 'POST'){
				console.log("new cut!");
				$('#backend_variables').data('cut_id', data['id']);
			}else{
				console.log('existing cut!');
			}

		},
		error : function(data) {

			// Error
			console.log("error");
			console.log(data);
		},
		beforeSend: (this.service.setHeader).bind(this)
	});

};

/**
    ネットワークリポジトリのエントリをアプリケーションから削除することは無いので以下のメソッドは不用？
*/
NetworkRepository.prototype.removeEntry = function (myIdentifier){
//
//識別子 からエントリを特定して削除する？
};
/**
    エントリリストを検索して該当するリストエントリを返す操作をメソッド可
    issues他のプロパティは受取先で評価
    指定の識別子との比較は
    title,opus,scene,cut の４点の比較で行う(秒数とサブタイトルは比較しない)
    
    
*/
NetworkRepository.prototype.entry=function(myIdentifier){
    for (var pid=0;pid<this.entryList.length;pid++){
        if(Xps.compareIdentifier(this.entryList[pid].toString(),myIdentifier) > 0){
                return this.entryList[pid]
        }
    }
    return null;        
}
/**
    エントリステータス操作コマンドメソッド
    ServiceAgentの同名メソッドから呼び出す　下位ファンクション
*/
/**
    現在のドキュメントをアクティベートする
*/
NetworkRepository.prototype.activateEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
//本来は上が望ましいが、現状でドキュメントの識別子はサーバ上のエントリと一致しないので以下を使用
//現在セレクタ上で選択されているエントリ
//必ずしも現在編集中のデータとマッチしないので注意が必要
//     var currentEntry = this.entry(documentDepot.currentSelection);//documentDepot.currentSelection.toString(true)

// console.log( decodeURIComponent(currentEntry.toString().split('//')[1]));
// console.log( currentEntry.toString(true));
   
//        var newXps = new Xps();
//        var currentContents = localStorage.getItem(this.keyPrefix+currentEntry.toString(0));
//        var currentContents = xUI.XPS.toString();//現在のデータの複製をとる（一時オブジェクトなのでObject.createのほうが良いか？）
        var newXps = Object.create(xUI.XPS);//現在のデータの複製をとる
//        if (currentContents) { newXps.readIN(currentContents); }else {return false;}
        //ここ判定違うけど保留 あとでフォーマット整備 USERNAME:uid@domain(mailAddress)　 型式で暫定的に記述
        //':'が無い場合は、メールアドレスを使用
        console.log(xUI.currentUser.sameAs(newXps.update_user));
        if (xUI.currentUser.sameAs(newXps.update_user)){
            　//同内容でステータスを変更したエントリを作成 新規に保存して成功したら先のエントリを消す
            newXps.currentStatus = 'Active';
            console.log('activate : '+decodeURIComponent(Xps.getIdentifier(newXps)));
            //ここでサーバに現在のエントリへのステータス変更要求を送信する　成功時と失敗時の処理を渡しかつcallback を再度中継
            var data = {
                token: currentEntry.issues[0].cutID,
                cut: {
                    name:   decodeURIComponent(currentEntry.toString().split('//')[1]),
                    description: currentEntry.toString(true)
                }
            };
            console.log(data);
	$.ajax({
		type : 'PUT',
		url : this.url+'/cuts/'+currentEntry.issues[0].cutID+'.json',
		data : data,
		success : (function(result) {
            console.log('activated');
            this.getEntry();//リストステータスを同期
            documentDepot.rebuildList();
            xUI.XPS.currentStatus='Active';//ドキュメントステータスを更新
            xUI.XPS.update_user=xUI.currentUser;//ドキュメントステータスを更新
			xUI.setStored("current");//UI上の保存ステータスをセット
			sync();//保存ステータスを同期
            xUI.setUImode('production');
            sWitchPanel();//パネルクリア
            if(callback instanceof Function){ setTimeout (callback,10);}
		})bind(this),
		error :(function(result) {
			// Error
			console.log("error");
			console.log(result);
            console.log('ステータス変更不可　:'+ Xps.getIdentifier(newXps));
            if(callback2 instanceof Function) {setTimeout(callback2,10);}
		}).bind(this),
		beforeSend: (this.service.setHeader).bind(this)
	});

                
            if(result){
            }else{
                console.log('ステータス変更失敗　:');
                delete newXps ;
                if(callback2 instanceof Function) {setTimeout(callback2,10);}
                return false;
            }
            console.log(newXps)
            return true;
        }else{
            return false
        }
}
//作業を保留する　リポジトリ内のエントリを更新してステータスを変更 
NetworkRepository.prototype.deactivateEntry=function(callback,callback2){
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
//            console.log(result);
            if(result){
                console.log('deactivated');
                localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
                this.getEntry();//リストステータスを同期
                documentDepot.rebuildList();
                xUI.XPS.currentStatus='Hold';//ドキュメントステータスを更新
            }else{
            //保存に失敗
                console.log('保留失敗')
                delete newXps ;
                return false;
            }
            //データをホールドしたので、リストを更新　編集対象をクリアしてUIを初期化
            xUI.setUImode('production');
            sWitchPanel();//パネルクリア
        }else{
            console.log('保留可能エントリが無い　:'+ Xps.getIdentifier(newXps));
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
        console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
            //次のJobへチェックイン　読み出したデータでXpsを初期化 
        var newXps = new Xps();
        var currentContents = localStorage.getItem(this.keyPrefix+currentEntry.toString(0));
        if (currentContents) {
            newXps.readIN(currentContents);
        } else {
            console.log('読み出し失敗')
            return false;
        }
        //　ユーザ判定は不用（権利チェックは後ほど実装）
        if (newXps){
            newXps.job=new XpsStage((myJob)? myJob:xUI.currentUser.handle + ':1');
            newXps.currentStatus = 'Active';
            console.log(newXps.toString());//
            　//引数でステータスを変更したエントリを作成 新規に保存　JobIDは必ず繰り上る
            // newXps.job=new XpsStage(jobName+':'+(parseInt(newXps.job.id)+jobIDoffset));
            localStorage.setItem(this.keyPrefix+Xps.getIdentifier(newXps),newXps.toString());
            var resultData = localStorage.getItem(this.keyPrefix+Xps.getIdentifier(newXps));
            console.log(resultData);
            var result = ( resultData == newXps.toString()) ? true:false;
            if(result){
                console.log('checkin');
                //delete newXps ;
                console.log(newXps.currentStatus);
                xUI.XPS.currentStatus='Active';//ドキュメントステータスを更新
                if(callback instanceof Function){ setTimeout('callback()',10)};
                sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                this.getEntry();//リストステータスを同期
                documentDepot.rebuildList();
                xUI.setUImode('production');//モードをproductionへ
                return result;
            }else{
                console.log(result);
            }
        }
        console.log('編集権利取得失敗');
        //　すべてのトライに失敗
        if(callback2 instanceof Function){ setTimeout('callback2()',10)};
        return false ;
}
/**
    作業終了
*/
NetworkRepository.prototype.checkoutEntry=function(callback,callback2){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry) {
        console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
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
                localStorage.removeItem(this.keyPrefix+currentEntry.toString(0));
                this.getEntry();//リストステータスを同期
                documentDepot.rebuildList();
                xUI.XPS.currentStatus='Fixed';//ドキュメントステータスを更新
                if(callback instanceof Function){ setTimeout('callback()',10)};
                sWitchPanel();//ドキュメントパネルが表示されていたらパネルクリア
                xUI.setUImode('browsing');//モードをbrousingへ
                return result;
            // データをFixしたので、編集対象をクリアしてUIを初期化
            // XPS=new Xps(5,144);xUI.init(XPS);nas_Rmp_Init();
            }
        }
        console.log('終了更新失敗');
        delete newXps ;
        if(callback2 instanceof Function){ setTimeout('callback2()',10)};
        return false ;
}
/**
    検収処理
*/
NetworkRepository.prototype.receiptEntry=function(myIdentifier){
    var currentEntry = this.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry) return false;
    switch (currentEntry.getStatus()){
        case 'Startup':
        case 'Active':
        case 'Hold':
            //条件付きで処理
        break;
        case 'Fixed':
            //処理
        break;
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
            //管理モード下でのみ処理　このメソッドのコール自体が管理モード下でのみ可能にする
            //リポジトリに対して
        break;
    }
}


/**
サービスエージェントオブエジェクト

ログインするサーバを選んでログイン処理をする
ログイン情報を保持して
状態は　offline/onnline/online-single の3状態
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
 リポジトリの初期化は　最終的には作業記録とサーバからの受信情報でアプリケーション初期化のタイミングで組む
*/
serviceAgent.init= function(){
    this.repositories=[localRepository];　//ローカルリポジトリを0番として加える
    
if(xUI.onSite){
    var serviceA=new ServiceNode("SCIVONE",'http://remaping.scivone-dev.com');
}else{
//    var serviceA=new ServiceNode("SCIVONE-v1",'http://remaping.scivone-dev.com/api/v1');
    var serviceA=new ServiceNode("SCIVONE-v2",'http://remaping.scivone-dev.com/api/v2');
}
    this.servers.push(serviceA);

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
    this.currentServer = serviceA;
}
/**
    ユーザ認証
カレントサービスを認証又は解除する

カレントサービスが"0:=no selected="の場合は,
単純にすべてのサービスからログアウトする

 */
serviceAgent.authorize = function(){
    switch (this.currentStatus){
    case 'online-single':
        return false;
    break;
    case 'online':
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
            document.getElementById('loginuser').innerHTML = document.getElementById('current_user_id').value;
            document.getElementById('loginstatus_button').innerHTML = "=ONLINE=";
            document.getElementById('login_button').innerHTML = "signin \\ SIGNOUT";
    }else{
        this.currentStatus = 'offline';
            document.getElementById('loginuser').innerHTML = '';
            document.getElementById('loginstatus_button').innerHTML = "=OFFLINE=";
            document.getElementById('login_button').innerHTML = "SIGNIN / signout";
    }
}
/**
    サーバを切り替える
引数: myServer / Object ServiceNode
サーバ名・URL・ID　またはキーワードで指定
キーワードと同名のサーバは基本的に禁止？
サーバにログインしていない場合は、各サーバごとの認証を呼ぶ
既にサービスにログインしている場合は、その認証を解除してから次のサービスを認証する

内部的にはともかくユーザ視点での情報の輻輳を避けるため　サーバ/リポジトリを多層構造にせず　
リポジトリに対する認証のみをUIで扱う
リポジトリの切り替えに対してログイン/ログアウトを行うUI仕様とする。
サービスの切り替えは内部での呼び出しのみになるので引数は整理する
*/
serviceAgent.switchService = function(myServer){
    if(myServer instanceof ServiceNode ) currentServer = myServer; 
return currentServer;
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
    1~ 以降登録順
    
     リポジトリ切替時にドキュメントリストの更新をバックグラウンドで行う
*/
serviceAgent.switchRepository = function(myRepositoryID){
    this.currentRepository=this.repositories[myRepositoryID];
    if((myRepositoryID > 0)&&(myRepositoryID<this.repositories.length)){
        this.currentServer=this.currentRepository.service;
    } else {
        this.currentServer     = null;
    }
    if(document.getElementById('repositorySelector').value != myRepositoryID) document.getElementById('repositorySelector').value=myRepositoryID;
    /*== ドキュメントリスト更新 ==*/
    documentDepot.rebuildList();
};

/**
    引数を判定して動作を決定　カレントリポジトリの操作を呼び出す
    myRepository    対象リポジトリ　名前又はオブジェクト　指定がない場合はカレント
    myIdentifier    カット識別子　完全状態で指定されなかった場合は、検索で補う
    isReference    リファレンスとして呼び込むか否かのフラグ　指定がなければ自動判定
    callback    コールバック関数指定が可能コールバックは以下の型式で
        function(xpsSourceText,callbackArguments){    }
    コールバックの指定がない場合は指定データをアプリケーションに読み込む
    コールバック関数以降の引数はコールバックに渡される
*/
serviceAgent.getEntry = function(myRepository,myIdentifier,isReference,callback){
    alert('test');
};

/**
    ドキュメント操作メソッド群
    実行時に実際の各リポジトリに対してコマンドを発行して エントリのステータスを更新する
    ステータスによっては、ジョブ名引数を必要とする
    変更をトライして成功時／失敗時に指定のコールバック関数を実行する
    
    操作対象ドキュメントは、必ずUI上でオープンされている　(xUI.XPS が対象)
    引数で識別子を与えることは無い
    
    activate(callback,callback2)
                Active > Active  例外操作 作業セッションの回復時のみ実行　データにチェック機能が必要
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
エントリステータスの変更は単純な変更にならない　かつ　リポジトリ通信先のデータ更新にかかわるのでエントリのメソッドにはしない

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

===================　ここまでproductionMode　での操作
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
        console.log ('noentry in this repository :' +  decodeURIComponent(currentEntry))
        return false;
    }
    switch (currentEntry.getStatus()){
        case 'Active':
/**     例外処理　ロストセッションの回復
    編集中に保存せずに作業セッションを失った場合　この状態となる
    また同一ユーザで編集中に他のブラウザからログインした場合も可能性あり
    ここに確認用のメッセージが必要
*/
            if(xUI.currentUser.sameAs(xUI.XPS.update_user)){
                var msg = '[！！注意！！]　異常処理です\n';
                msg += 'このデータは現在あなたのアカウントで編集中です\n';
                msg += '他の環境でドキュメントを開きっぱなしになっていないか確認してください\n';
                msg += 'OKを押すと、現在のデータから作業を再開できます\n';
                msg += 'よろしいですか？';
                if(confirm(msg)){
                    xUI.setUImode('production');
//  必要があればここでリポジトリの操作（基本不用）
                    sWitchPanel();//パネルクリア
                    return true;
                }
            }
        break;
        case 'Aborted':case 'Startup':
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
            return false;
        }
        break;
    }
}
/**
    作業を保留する　リポジトリ内のエントリを更新してステータスを変更
    ユーザ判定は不用
    現データの送信（保存）後にリスト更新とドキュメントブラウザの更新
*/
serviceAgent.deactivateEntry=function(callback,callback2){
    var currentEntry = this.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry) {
        console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        return false;
    }
    switch (currentEntry.getStatus()){
        case 'Aborted': case 'Startup': case 'Hold': case 'Fixed':
            //NOP 
            console.log('fail deactivate so :'+ currentEntry.getStatus());
            return false;
            break;
        case 'Active':
            //Active > Holdへ
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
    var currentEntry = this.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
    if(! currentEntry){
        console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        //当該リポジトリにエントリが無い
         return false;
      }
    switch (currentEntry.getStatus()){
        case 'Aborted': case 'Active': case 'Hold':
            //NOP return
            console.log('fail checkin so :'+ currentEntry.getStatus(myJob,callback,callback2));
            return false;
        break;
        case 'Fixed':case 'Startup':
            //次のJobへチェックイン
            //ジョブ名称を請求
            var msg= '新規作業を開始します。新しい作業名を入力してください（仮）';
            var newJobName = prompt(msg,'チェック');
            if(newJobName){
                this.currentRepository.checkinEntry(newJobName,callback,callback2);
                return true;
            } else {
                return false;
            }
        break;
    }
}
/**
    作業を終了する　リポジトリ内のエントリを更新してステータスを変更
    ユーザ判定は不用
    現データの送信（保存）後にリスト更新とドキュメントブラウザの更新
*/
serviceAgent.checkoutEntry=function(callback,callback2){
    var currentEntry = this.currentRepository.entry(Xps.getIdentifier(xUI.XPS));
    this.currentRepository.checkoutEntry(callback,callback2);

    if(! currentEntry) {
        console.log ('noentry in repository :' +  decodeURIComponent(currentEntry))
        return false;
    }
    switch (currentEntry.getStatus()){
        case 'Startup': case 'Hold': case 'Fixed': 
            //NOP
            console.log('fail checkout so :'+ currentEntry.getStatus());
            return false;
        break;
        case 'Active':
            //Active > Fixed
            this.currentRepository.checkoutEntry(callback,callback2);
        break;
    }
}
/**
     工程を閉じて次の工程を開始する手続き
     逆戻り不能
*/
serviceAgent.receiptEntry=function(myIdentifier){
    var currentEntry = (typeof myIdentifier == 'undefined')?this.currentRepository.entry(Xps.getIdentifier(xUI.XPS)):this.currentRepository.entry(myIdentifier);
    if(! currentEntry) return false;
    switch (currentEntry.getStatus()){
        case 'Startup': case 'Active': case 'Hold':
            //条件付きで処理　又は一旦強制的にfixしてから中断に？
        break;
        case 'Fixed':
            //処理
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
            //管理モード下でのみ処理　このメソッドのコール自体が管理モード下でのみ可能にする
            //リポジトリに対して
        break;
    }
}




//Test code
/**

Repos.getProducts();//一度初期化する
console.log(Repos.productsData);
Repos.getList();

*/