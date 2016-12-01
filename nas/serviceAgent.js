/**
    サービスエージェント
    一旦このモジュールを通すことで異なる種別のリポジトリ操作を統一する
    サービスエージェントは、ログインの管理も行う
    
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
*/
ServiceNode.prototype.setHeader = function(xhr){
    var myToken = $('#server-info').attr('current_token')
    if(myToken.length==0) return false;
//    console.log(myToken)
    xhr.setRequestHeader('Authorization', ( "Bearer " + myToken));    
//    console.log(xhr);
    return true;
}
/**
    データ取得
    参考コード　実際にはコールされない
*/
ServiceNode.prototype.getFromServer = function getFromServer(url, msg){
    that=this;
    $.ajax({
        url: this.url + url,
        type: 'GET',
        dataType: 'json',
        success: function(res) {
            console.log(msg);
            console.log(res);
        },
        beforeSend: this.setHeader
    });
}

/**
    認証手続きはノードのメソッド　ノード自身が認証と必要なデータの記録を行う
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
            $('#server-info').attr('current_token'  , result.access_token);
            $('#server-info').attr('last_authrized' , new Date().toString());
            serviceAgent.authorized('success');
		}).bind(this),
		error : function(result) {
		    /**
		        認証失敗 トークンと必要情報をクリアして表示を変更する
		    */            
            $('#server-info').attr('current_token'  , '');
            $('#server-info').attr('last_authrized' , '');
            serviceAgent.authorized('false');
		}
	});
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
/*
    履歴構造の実装には、XPSのデータを簡易パースする機能が必要
    プロパティを取得するのみ？
    
    サーバは自身でXPSをパースしない
    
    アプリケーションがパースした情報を識別情報として記録してこれを送り返す
    
(タイトル)[#＃№](番号)[(サブタイトル)]//S##C####(##+##)/S##C####(##+##)/S##C####(##+##)/不定数…//lineID//stageID//jobID//
    例:
ももたろう#SP-1[鬼ヶ島の休日]//SC123 ( 3 + 12 .)//0//0//1
 
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
    例:
0//0//0
0:本線//1:レイアウト//2:演出検査
 
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


    エントリの識別子自体にドキュメントの情報を埋め込めばサーバ側のパースの必要がない。
    ネットワークストレージをリポジトリとして使う場合はそのほうが都合が良い
    管理DBの支援は受けられないが、作業の管理情報が独立性を持てる
    
 //現状
 var myXps= XPS;
    [encodeURIComponent(myXps.title)+"#"+encodeURIComponent(myXps.opus)+"["+encodeURIComponent(myXps.subtitle)+"]",encodeURIComponent("S"+((myXps.scene)?myXps.scene:"-")+"C"+myXps.cut)+"("+myXps.time()+")",myXps.xMap.currentLine,myXps.xMap.currentStage,myXps.xMap.currentJob].join(" // ");
 //将来は以下で置き換え予定CSオブジェクト未実装
    myXps.sci.getIdentifier();
*/
//比較関数　3要素の管理情報配列　issuesを比較して先行の管理ノード順位を評価する関数

issuesSorter =function(val1,val2){
    return (parseInt(val1[0].split(':')[0]) * 10000 + parseInt(val1[1].split(':')[0]) * 100 + parseInt(val1[2].split(':')[0])) - ( parseInt(val2[0].split(':')[0]) * 10000 + parseInt(val2[1].split(':')[0]) * 100 + parseInt(val2[2].split(':')[0]));
};

/**
初期化引数:カット識別子[タイトルID,話数ID,カットID]

    ドキュメントリストにエントリされるオブジェクト
    parent  リポジトリへの参照
    product 作品と話数
    sci     カット番号（兼用情報含む）
    issues  管理情報　一次元配列
    実際のデータファイルはissueごとに記録される
    いずれも　URIエンコードされた状態で格納されているので画面表示の際は、デコードが必要

    ネットワークリポジトリに接続する場合は以下のプロパティが追加される
    listEntry.titleID   /int
    listEntry.episodeID /int
    listEntry.iassues[#].cutID  /int
    
*/
listEntry=function(myIdentifier){
    var dataArray=myIdentifier.split("//");
    this.parent;
    this.product = dataArray[0];
    this.sci     = dataArray[1];
    this.issues  = [dataArray.slice(2)];
if(arguments.length>1) {
        this.titleID    = arguments[1];
        this.episodeID  = arguments[2];
        this.issues[0].cutID = arguments[3];
    }
}
/**
    エントリは引数が指定されない場合、管理情報を除いたSCI情報分のみを返す
    引数があれば引数分の管理履歴をさかのぼって識別子を戻す
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
    フルサイズの識別子が与えられた場合は　SCI部分が一致しなければ操作失敗
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
A=new listEntry("%E3%81%8B%E3%81%A1%E3%81%8B%E3%81%A1%E5%B1%B1Max#%E3%81%8A%E3%81%9F%E3%82%81%E3%81%97[%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%82%AB%E3%83%83%E3%83%88]//S-C10(72)//0//0//1");
A
*/


localRepository={
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
    与えられたXpsオブジェクトから識別子を自動生成
    識別子にkeyPrefixを追加してこれをキーにしてデータを格納する
    後日識別子の正式なフォーマットを出してメソッドに変更予定
    キーが同名の場合は自動で上書きされるのでクリアは行わない
    エントリ数の制限を行う
    エントリ数は、キーの総数でなく識別子の第一、第二要素を結合してエントリとして認識する
*/
localRepository.pushEntry=function(myXps){
//この識別子作成は実験コードです　近々にXps.getIdentifier() メソッドと置換されます。2016.11.14
    var myIdentifier=[encodeURIComponent(myXps.title)+"#"+encodeURIComponent(myXps.opus)+"["+encodeURIComponent(myXps.subtitle)+"]",encodeURIComponent("S"+((myXps.scene)?myXps.scene:"-")+"C"+myXps.cut)+"("+myXps.time()+")",0,0,0].join("//");
    if(this.entryList.length>this.maxEntry){
    　//設定制限値をオーバーしたら、ローカルストレージから最も古いエントリを削除して　新しいエントリを追加する
        for (var iid=0;iid<this.entryList[0].issues.length;iid++){ localStorage.removeItem(this.keyPrefix+this.entryList[0].this.entryList[0].issues[iid]);};
        this.entryList=this.entryList.slice(1);
    }
    localStorage.setItem(this.keyPrefix+myIdentifier,myXps.toString());
}

/**
    識別子を引数にしてリスト内を検索
    一致したデータをローカルストレージから取得してXpsオブジェクトで戻す
    識別子に管理情報があればそれをポイントして、なければ最も最新のデータを返す
    コールバックを渡す
*/
localRepository.getEntry=function(myIdentifier,isReferenece,callback){
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
    var cx = this.entryList[ix].issues.length-1;
    myIssue = this.entryList[ix].issues[cx]; 
        targetArray=(myProductUnit.split('//')).concat(myIssue);//更新する
    } else {
    //指定管理部分からissueを特定する 連結して比較（後方から検索)リスト内に指定エントリがなければ失敗
        var targetIssue =  targetArray.splice(2).join('//');//
        checkIssues:{
            for (var cx = (this.entryList[ix].issues.length-1) ; cx <= 0 ;cx--){
                if ( this.entryList[ix].issues[cx].join('//') == targetIssue ){ myIssue = this.entryList[ix].issues[cx]; break checkIssues;}
            }
        if (! myIssue) return false;
        }
    }
    // 構成済みの情報を判定 (リファレンス置換 or 新規セッションか)
    if(targetArray.length == 6) isReference = true ;//指定データが既Fixなので自動的にリファレンス読み込みに移行
    // ソースデータ取得
    alert(targetArray.join( '//' ));
    myXpsSource=localStorage.getItem(this.keyPrefix+targetArray.join( '//' ));
    if(myXpsSource){
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
                if( myIssue[2] > 0 ){
                //ジョブIDが１以上なので　単純に一つ前のissueを選択する（必ず先行jobがある）
                    refIssue = this.entryList[ix].issues[cx-1];
                }else if(( myIssue[1] > 0 )&&( myIssue[2] > 0 )){
                //ステージが第二ステージ移行でジョブがIDが０のケースのみ前方に向かって検索
                //最も最初にステージIDが先行IDになった要素が参照すべき要素
                    for(var xcx = cx;xcx >= 0 ; xcx --){
                        if (parseInt(this.entryList[ix].issues[xcx][1].split(':')[0]) == (myIssue[1].split(':')[0]-1)){
                            refIssue = this.entryList[ix].issues[xcx];
                            break;
                        }
                    }
                }
                documentDepot.currentReference = new Xps();//カラオブジェクトを新規作成
                if(refIssue){
                    myRefSource=localStorage.getItem(this.keyPrefix+myProductUnit+refIssue);//リファレンスソースとる
                    if(myRefSource){
                        documentDepot.currentReference.readIN(myRefSource);
                    }
                }
            }
            xUI.init(documentDepot.currentDocument,documentDepot.currentReference);nas_Rmp_Init();
        }
    } else { 
        return false;
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
        
今回の試験実装では、リポジトリが設定されていないので、サーバとリポジトリは1対1の存在となる
一応オブジェクトはわけておく

*/
NetworkRepository=function(repositoryName,myServer){
    this.name = repositoryName;
    this.service = myServer;//リポジトリの所属するサーバ
    this.url=this.service.url;//サーバとurlが異なる場合はこれを上書きする
//今のところリポジトリオブジェクト内部にエントリのポインタを置く必要がないリストのみがあれば良さそう
//リストは素早いリポジトリの切り替えやリポジトリ同士のマージ処理に不可欠なのでここで保持
//    this.currentProduct;
//    this.currentSC;
//    this.currentLine;
//    this.currentStage;
//    this.currentJob;
    this.curentIssue;
    this.productsData=[];
    this.entryList=[];
}
/**
    タイトル一覧をクリアして更新する　エピソード更新を呼び出す
*/
NetworkRepository.prototype.getProducts = function (){
    this.productsData.length = 0;
 //   that = this; /api/v1
    $.ajax({
        url: this.url+'/products.json',
        type: 'GET',
        dataType: 'json',
        success: (function(result) {
//            console.log(msg);
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
//        console.log("get:"+this.productsData[idx].id) ; /api/v1
    $.ajax({
        url: this.url+'/products/'+this.productsData[idx].id+'.json',
        type: 'GET',
        dataType: 'json',
        success: (function(result) {
            for(var idx = 0 ;idx < this.productsData.length ;idx ++){
                //プロダクトデータを詳細データに「入替」
		        if(result.id == this.productsData[idx].id){this.productsData[idx]=result ; break;}
		    }
//    console.log(this.productsData);
		    this.episodesUpdate(idx);
        }).bind(this),
        beforeSend: (this.service.setHeader).bind(this)
    });

    }
}
/**
    プロダクトリストのIDを指定してエピソード詳細を取得
    カットリストを得る
    エピソードIDを指定して内部リストにコンバート
 */
NetworkRepository.prototype.episodesUpdate = function (pid) {
//    that = this;
        for( var eid = 0 ; eid < this.productsData[pid].episodes[0].length ; eid ++){
            if( typeof this.productsData[pid].episodes[0][eid].id == "undefined" ){
                //未取得の場合はurlを参照
               var targetURL = this.url+this.productsData[pid].episodes[0][eid].url;
 	        }else{
	            //取得済みの場合は更新 /api/v1
                var targetURL = this.url+'/episodes/'+this.productsData[pid].episodes[0][eid].id + '.json';
	        }
    console.log(targetURL);
/*
                $.getJSON (targetURL,function(result){
                    searchLoop:{
                    for( var idx = 0 ; idx < that.productsData.length ; idx ++){
                        if(that.productsData[idx].episodes[0].length == 0) continue;//エピソード数０の際は処理スキップ
                        for( var eid = 0 ; eid < that.productsData[idx].episodes[0].length ; eid ++){
                            if (typeof that.productsData[idx].episodes[0][eid].id == 'undefined') {
                                var myID = (that.productsData[idx].episodes[0][eid].url).split('/').reverse()[0].split('.')[0];
                            }else{
                                var myID = that.productsData[idx].episodes[0][eid].id;
                            }
                            if( result.id == myID ){ that.productsData[idx].episodes[0][eid] = result;break searchLoop;};
                        }
                    }}
                    that.getList();
	            });*/
	            $.ajax({
                    url: targetURL,
                    type: 'GET',
                    dataType: 'json',
                    success: (function(result) {
//                        console.log(result);
                      searchLoop:{
                        for( var idx = 0 ; idx < this.productsData.length ; idx ++){
                            if((typeof this.productsData[idx].episodes == 'undefined')||(this.productsData[idx].episodes[0].length == 0)) continue;//エピソード数０の際は処理スキップ
                            for( var eid = 0 ; eid < this.productsData[idx].episodes[0].length ; eid ++){
                                if (typeof this.productsData[idx].episodes[0][eid].id == 'undefined') {
                                    var myID = (this.productsData[idx].episodes[0][eid].url).split('/').reverse()[0].split('.')[0];
                                }else{
                                    var myID = this.productsData[idx].episodes[0][eid].id;
                                }
                                if( result.id == myID ){ this.productsData[idx].episodes[0][eid] = result;break searchLoop;};
                            }
                        }
                      }
                     this.getList();
                    }).bind(this),
                    beforeSend: (this.service.setHeader).bind(this)
                });
	    }
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
                if( currentEpisode.cuts[0].length == 0 ) continue;
                for(var cid = 0 ; cid < currentEpisode.cuts[0].length ;cid ++){
                //現在のサーバエントリ情報はサブタイトルと秒数なし 管理情報は[0,0,0]固定で　これは保存時にアプリ側から送る仕様にする
                //兼用カット情報はペンディング
                var myCutId=(typeof currentEpisode.cuts[0][cid].id == 'undefined')?
                    currentEpisode.cuts[0][cid].url.split( '/' ).reverse()[0].split( '.' )[0]:
                    currentEpisode.cuts[0][cid].id;//これは修正予定
                var entryArray = [
                    encodeURIComponent(currentTitle.name)+'#'+encodeURIComponent(currentEpisode.name) ,
                    'S-C'+encodeURIComponent(currentEpisode.cuts[0][cid].name),
                    0,0,0
                ];

                var myEntry=entryArray.slice(0,2).join( "//" );//管理情報を外してSCi部のみ抽出
                var hasEntry = false;
                var currentEntryID =false;
                for (var xid=0 ; xid < this.entryList.length; xid ++){
                //エントリリストにすでに登録されているか検査
                    if(myEntry == this.entryList[xid].toString()){ currentEntryID = eid; hasEntry=true; break; }
                }
                if((hasEntry)&&(currentEntryID)){
                    //登録済みプロダクトなので管理情報を追加
                    //this.entryList[currentEntryID].issues.push(entryArray.slice(2).join("//"));
                    //console.log(this.entryList[currentEntryID]);
                    this.entryList[currentEntryID].push(entryArray.slice(2).join("//"),currentTitle.id,currentEpisode.id,myCutId);
                }else{
                    //未登録新規プロダクトなのでエントリ追加
                    var newEntry = new listEntry(entryArray.join('//'),currentTitle.id,currentEpisode.id,myCutId)
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
*/
NetworkRepository.prototype.getEntry = function (myIdentifier,isReferenece,callback){
    if(typeof isReference == 'undefined'){isReference = false;}
    //引数の識別子を分解して配列化
    var targetArray     = String(myIdentifier).split('//');
    var myProductUnit   = targetArray.slice(0,2).join('//');
    var myIssue = false;
    var refIssue = false;
    checkProduct:{
        for (var ix=0;ix<this.entryList.length;ix++){
            if ( myProductUnit == this.entryList[ix].toString() ) break;
        }
        return false ;//プロダクトが無い
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
        if (! myIssue) return false;//ターゲットのデータが無い
            }
    }
    // 構成済みの情報を判定 (リファレンス置換 or 新規セッションか)
    if(targetArray.length == 6) isReference = true ;//指定データが既Fixなので自動的にリファレンス読み込みに移行
    //

//     myIssue; これがカットへのポインタ　episode.cuts配列のエントリ myIssue.url　にアドレスあり

/*
    if( myIssue[2] > 0 ){
        for (var cx=0;cx<this.entryList[ix].issues.length;cx++){
            if (myIssue.join('//') == this.entryList[ix].issues[cx].join('//')){ myIssue = this.entryList[ix].issues[cx]; break; }
        }
    }else if( myIssue[1] > 0){
        refIssue = [myIssue[0],myIsseu[1]-1,0];
    }
*/
  
//    that=this;
if(callback instanceof Function){
//  $.getJSON ( this.url + myIssue.url, callback );
    $.ajax({
        url: this.url + myIssue.url,
        type: 'GET',
        dataType: 'json',
        success: (function(result) {
            var myContent=result.content;
            callback(myContent);
        }).bind(this),
        beforeSend: (this.service.setHeader).bind(this)
    });
}else if(targetArray.length < 4){}
    if(isReference){
    //データ単独で現在のセッションのリファレンスを置換
/**  
  $.getJSON ( this.url + myIssue.url, function (result){
	var myContent=result.content;//XPSソーステキストをセット
	documentDepot.currentDocument=new Xps();
	documentDepot.currentDocument.readIN(myContent);
	if (refIssue){
	    $.getJSON ( that.url + refIssue.url, function (result){
        	var myContent=result.content;//XPSソーステキストをセット
	        documentDepot.currentReference=new Xps();
	        documentDepot.currentReference.readIN(myContent);
	        xUI.init(documentDepot.currentDocument,documentDepot.currentReference);
	        nas_Rmp_Init();
	    })
	}else{
	    if(xUI.XPS.readIN(myContent)){xUI.init(xUI.XPS);nas_Rmp_Init();}
	}
  });
*/
    $.ajax({
        url: this.url + refIssue.url,
        type: 'GET',
        dataType: 'json',
        success: (function(result) {
        	var myContent=result.content;//XPSソーステキストをセット
	        documentDepot.currentReference=new Xps();
	        documentDepot.currentReference.readIN(myContent);
	        xUI.init(documentDepot.currentDocument,documentDepot.currentReference);
	        nas_Rmp_Init();
        }).bind(this),
        beforeSend: (this.service.setHeader).bind(this)
    });

}else{
/**
    $.getJSON ( this.url + myIssue.url, function (result){
        var myContent=result.content;//XPSソーステキストをセット
	    documentDepot.currentReference=new Xps();
	    documentDepot.currentReference.readIN(myContent);
	    xUI.setReferenceXPS(documentDepot.currentReference);
    });
*/
    $.ajax({
        url: this.url + refIssue.url,
        type: 'GET',
        dataType: 'json',
        success: (function(result) {
            var myContent=result.content;//XPSソーステキストをセット
	        documentDepot.currentReference=new Xps();
	        documentDepot.currentReference.readIN(myContent);
	        xUI.setReferenceXPS(documentDepot.currentReference);
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
//この識別子作成は実験コードです　近々にXps.getIdentifier() メソッドと置換されます。2016.11.14
    var myIdentifier=[encodeURIComponent(myXps.title)+"#"+encodeURIComponent(myXps.opus)+"["+encodeURIComponent(myXps.subtitle)+"]",encodeURIComponent("S"+((myXps.scene)?myXps.scene:"-")+"C"+myXps.cut)+"("+myXps.time()+")",0,0,0].join("//");
//識別子を作成してネットワークリポジトリに送信する　正常に追加・更新ができた場合はローカルリストの更新を行う（コールバックで）

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
    this.repositories=[];

    this.repositories.push(localRepository);//ローカルリポジトリを0番として加える
if(xUI.onSite){
    var serviceA=new ServiceNode("SCIVONE",'http://remaping.scivone-dev.com');
}else{
    var serviceA=new ServiceNode("SCIVONE-v1",'http://remaping.scivone-dev.com/api/v1');
}
    this.servers.push(serviceA);
    this.currentServer = serviceA;
    var Home=new NetworkRepository("HOME",serviceA);
    this.repositories.push(Home);
/**
    組んだリポジトリでリポジトリリストを更新する
    ローカルリポジトリはすべての状況で利用可能
*/
    var myContents="";
    myContents +='<option selected value=0> = no selected =';
    for(var idr=1; idr < this.repositories.length;idr ++){
        myContents +='<option value="'+idr+'" >'+this.repositories[idr].name; 
    }
    document.getElementById('repositorySelector').innerHTML = myContents;

    this.switchRepository(0);
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
*/
serviceAgent.switchRepository = function(myRepositoryID){
    this.currentRepository=this.repositories[myRepositoryID];
    if((myRepositoryID > 0)&&(myRepositoryID<this.repositories.length)){
        this.currentServer=this.currentRepository.service;
    } else {
        this.currentServer     = null;
    }
    if(document.getElementById('repositorySelector').value != myRepositoryID) document.getElementById('repositorySelector').value=myRepositoryID;
};

/**
    引数を判定して動作を決定　カレントリポジトリの操作を呼び出す
    myRepository    対象リポジトリ　名前又はオブジェクト　指定がない場合はカレント
    myIdentifier    カット識別子　完全状態で指定されなかった場合は、検索で補う
    isReferenece    リファレンスとして呼び込むか否かのフラグ　指定がなければ自動判定
    callback    コールバック関数　指定が可能コールバックは以下の型式で
        function(xpsSourceText,callbackArguments){    }
    コールバックの指定がない場合は指定データをアプリケーションに読み込む
    コールバック関数以降の引数はコールバックに渡される
*/
serviceAgent.getEntry = function(myRepository,myIdentifier,isReferenece,callback){

};


//Test code
/**

Repos.getProducts();//一度初期化する
console.log(Repos.productsData);
Repos.getList();

*/