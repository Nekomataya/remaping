/** UAT
    documentPanel
    サーバ対応ドキュメントパネル機能
    調整後はxUIに統合予定
    
ドキュメントパネル自体が、データリストを保持する構造にする


実際にデータを保持しているモジュールに対してリスト取得リクエストを出し、自分自身のデータリストを管理する
アプリケーション内の請求手続きは一種類にしてサービスエージェントを通してモジュール間の差異を吸収する

ローカルストレージを使用した参考リポジトリを設計実装する
（サービスモジュールのデフォルト値として登録する）

UI上のドキュメントパネルのオプションリストは、表示用のバッファとして利用（保持リスト本体ではない）

リストのソート タイトルソート・話数ソート・フィルタ等の補助機能を実装
カット番号リストは、ソートを基本　逆順表示　番号フィルタ　を設計実装

ドキュメントエントリは、SCiオブジェクトにサービスへの参照を拡張して使用

*/

/**
    documentDepot.repositories
現在使用しているリポジトリのリスト
サービスにアクセスするごとに更新
サービスエージェント上のエントリへの参照

    documentDepot.products
プロダクトリスト　サービスにアクセスするごとに抽出更新
各プロダクトは独立したデータとして一覧アクセスできるようにしておく
フィルタは、Depotのオブジェクトメソッドで実装
nas.Pm.Opus オブジェクトを使用　リポジトリへの参照を加える
opusが同じでもリポジトリが異なる場合は、同エントリ内で複数を保持

主にローカルリポジトリや、ホームリポジトリでの使用を前提とする

    documentDepot.documents
ドキュメントエントリーコレクション　サービスにアクセスするごとに更新
ドキュメントエントリはカプセル化されたオブジェクトにする　SCi互換
*/
//エントリを格納するオブジェクト xUIを再初期化するのでこのコードが消える
//良くない

documentDepot = {
    products    :[],
    documents   :[],
    currentProduct:null,
    currentSelection:null,
    currentDocument:null,
    currentReferenece:null
};

documentDepot.documentsUpdate=function(){
    var myProducts  =[];
    var myDocuments =[];
/*======*/
    for (var idx = 0 ; idx < serviceAgent.repositories.length ; idx ++ ){
        myDocuments=myDocuments.concat(serviceAgent.repositories[idx].entryList);
    }
    for (var idx = 0 ; idx < myDocuments.length ; idx ++ ){
        var currentProduct=myDocuments[idx].toString().split( '//' )[0];
        var hasProduct =false;
        for (var idp = 0 ; idp < myProducts.length ; idp ++ ){
            if (currentProduct == myProducts[idp]){hasProduct = true;break;}
        }
        if(hasProduct) {
            if(myProducts[idp].scis){
                myProducts[idp].scis.push(myDocuments[idx]);
//console.log("push:"+decodeURIComponent(myProducts[idp])+':'+decodeURIComponent(myDocuments[idx]));
            }else{
//console.log("skip!!:"+decodeURIComponent(myProducts[idp])+':'+decodeURIComponent(myDocuments[idx]));
            }
        }else{
            myProducts.push(currentProduct);
            myProducts[myProducts.length-1].scis=[myDocuments[idx]];
//console.log("newEntry:"+decodeURIComponent(myProducts[idp])+':'+decodeURIComponent(myDocuments[idx]));
        }
    }
    this.products  = myProducts;
    this.documents = myDocuments;
    this.updateOpusSelector();
}
//OPUSセレクタを更新する
documentDepot.updateOpusSelector=function(myRegexp){
    if(typeof myRegexp != "RegExp"){ myRegexp = new RegExp(".+");}
// ここで正規表現フィルタを引数にする
    var myContents = ""
    myContents += '<option value="==newTitle=="> (*-- new title --*) ';
    for( var opid = 0 ; opid < this.products.length ; opid ++){
        var currentText = decodeURIComponent(this.products[opid]);
//console.log(currentText);
        if(currentText.match(myRegexp)){
            myContents += '<option';
            myContents += ' value="';
            myContents += this.products[opid];
            myContents += (this.currentProduct == this.products[opid])? '" selected>':'">';
            myContents += currentText;
        }
    }
    document.getElementById( "opusSelect" ).innerHTML = myContents;
}
//Documentセレクタを更新する
documentDepot.updateDocumentSelector=function(myRegexp){
// ここで正規表現フィルタを引数にする
    if(typeof myRegexp != "RegExp"){ myRegexp = new RegExp(".+");}
// 選択済みタイトルで抽出
    var myDocuments = [];
    for ( var dcid = 0 ; dcid < this.documents.length ; dcid ++){
        if(this.documents[dcid].toString().split('//')[0] == this.currentProduct){
            myDocuments.push(this.documents[dcid]);
        }
         continue;
    }
//console.log()
//  正規表現フィルタで抽出してHTMLを組む
    var myContents = ""
    myContents += '<option value="==newDocument=="> (*-- new document --*)';
    for ( var dlid = 0 ; dlid < myDocuments.length ; dlid ++){
        var currentText = decodeURIComponent(myDocuments[dlid].toString(0).split('//')[1]);
        if(currentText.match(myRegexp)){
            myContents += '<option';
            myContents += ' value="';
            myContents += myDocuments[dlid];
            myContents += (this.currentSelection == myDocuments[dlid])? '" selected>':'">';
            myContents += currentText;
        }
    }
    document.getElementById( "cutList" ).innerHTML = myContents;
    
}
/**
    読み出して編集エリアに取り込む
    識別子が指定されない場合は、セレクタの値を見る
    ドキュメントリストに識別子が存在しない場合は、falseを返す
*/
documentDepot.getEntry =function(myIdentifier){
    if(typeof myIdentifier == 'undefined'){
        myIdentifier = this.currentSelection;
    }
    for (var did = 0;did < this.documents.length ; did ++){
        if (this.documents[did].toString() == myIdentifier){
            this.documents[did].parent.getEntry(myIdentifier);
            return true;
        }
    }
    return false
}
/**
    現在のテキスト入力状態から識別子をビルドする。
*/
documentDepot.buildIdentifier = function(){
    var result="";
    result += (document.getElementById('titleInput').value.match(/\(\*/)) ? "no-Title":
        encodeURIComponent(document.getElementById('titleInput').value);
    result += (document.getElementById('opusInput').value.match(/\(\*/)) ? "#":
        '#'+encodeURIComponent(document.getElementById('opusInput').value);
    result += (document.getElementById('subtitleInput').value.match(/\(\*/)) ? '':
        '['+encodeURIComponent(document.getElementById('opusInput').value)+']';
    result += '//';
    result += (document.getElementById('cutInput').value.match(/\(\*/)) ? 's-c':
        's-c'+encodeURIComponent(document.getElementById('cutInput').value);
    result += '( '+nas.Frm2FCT(nas.FCT2Frm(document.getElementById('timeInput').value),3)+' )';
    return result;
}
/**
    ドキュメントリストを更新する
    ローカルリポジトリに加えて、アクティブなリポジトリの内容を取得して合成したリストをブラウザの保持リストとして更新する
    先に存在するリストは破棄
*/
documentDepot.rebuildList=function(){
    this.products    =[];
    this.documents   =[];
    this.currentProduct     =null;
    this.currentSelection   =null;
    this.currentDocument    =null;
    this.currentReferenece  =null;
/*=============*/
serviceAgent.repositories[0].getList();

  if ( serviceAgent.repositories.length > 0 ){
     for(var idr=1 ;idr < serviceAgent.repositories.length; idr ++){serviceAgent.repositories[idr].getList();}
  }
//  テスト中はこれで良いが、その後はあまり良くない 

}
/**
読み出し・請求
    明示的にリスト内のサーバにアクセスする場合は、その時点の最新リストを請求してリストを更新する
    キャッシュを利用する場合は、リストの更新はなし。
    
書き込み・更新
    データの保存は、
        アプリケーション終了（ウインドウクローズ）時の自動バックアップ
        明示的なバックアップへの退避（↑上と同じ領域）

        保存先「リポジトリ」を指定して保存
        上書き保存
            「リポジトリ」の指定がない場合は、上書き保存
        新規作成時
            カレントリポジトリを使用
            任意のリポジトリを指定するには保存前にカレントの変更が必要
            
リポジトリについて
    リポジトリは、このシステム上「データ保存場所」に識別用の名前を付けて管理対象としたもの。

    タイムシート・カット袋等の制作管理及びカット内容のメタデータ　及び将来的には、これらのデータに記載された制作データそのものを保存
    ユーザのリクエストに従って読み書き可能なサービスとする。

    リポジトリには、基本的に制作管理DBの機能はない。
    制作管理DBの機能は、一般のRDBMサービスを立ち上げそこで利用するものとする。
    基本的にリポジトリとは別の接続を使用する
    
    簡易的なデータの解釈は、リポジトリから読み出したデータをアプリケーションがパースして行う。
    簡易のパース結果を識別子としてリポジトリに送り、それをファイル名又はそれに類するメタ情報として保存して利用する
    リポジトリにはデータの解釈（解析）を求めない。
    
        １＞必要なデータを保存時に識別子としてデータにつけてアプリケーション側から送信する
        ２＞リポジトリサーバは、その識別子を利用して保存を行う
                リスト要素を分解するか否かはサーバ側の事情で使い分けて良い
                階層管理する場合は、要素ごとに分解してディレクトリを分ける等の処理を行うとデータの管理が容易になる
                 /(作品)/(話数)/(カット)/(ライン)/(ステージ)/(ジョブ)/(タイムシートデータ) 等のデータ配置にすると
                 バックアップやレストア等の処理に利便性あり
        
    識別子の型式（埋め込み情報）は以下の様にする（仮仕様　2016/11/20）
    
title＃opus[subtitle]//SsceneCcut(seconds+frames) / SsceneCcut(seconds+frames) / SsceneCcut(seconds+frames) //lineID//stageID//jobID//

例:
    origData
かちかち山Max#おためし[サンプルカット] // S-C10(72) //0//0//0
    encodeURIComponent
%E3%81%8B%E3%81%A1%E3%81%8B%E3%81%A1%E5%B1%B1Max#%E3%81%8A%E3%81%9F%E3%82%81%E3%81%97[%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%82%AB%E3%83%83%E3%83%88] // S-C10(72) //0//0//0


タイトル・カット番号・サブタイトル等のデータにはセパレータ等の予約文字列が含まれるケースがあるので識別子を作成前にURI置換を行う必要あり
置き換え又はエスケープの必要な文字列（使用禁止のセンも考慮）
\n  　　改行　           - 使用禁止
/   　　スラッシュ       - \###
#＃No.　ナンバーサイン   - 
[ ] 　　角括弧           - 
「 」 　カギ括弧         - 
"'  　　引用符           - 
encodeURIComponent() を識別子組み立て前に通す
必要に従ってdecodeURIComponent()

　  上記の型式で（今回実装のローカルリポジトリではこの方法を採用する）        
    簡易パース手順
        split("//")
            5要素なら上書き可
            6要素ならロック(fix)されて上書き不可
            
            第一要素　プロダクト識別子　パース手順あり
            第二要素　SCi識別子
                split("/")
                第一要素代表カット番号　第二要素以降は兼用番号　第一要素と同じ番号が入る場合があるがその場合は無視
                各要素はカット番号とカット尺に分解して利用　カット尺は省略可能
            第三要素    ラインID   (Int 通番)　 各要素にname要素を付加しても良い　0:本線//1:レイアウト//0:打合せ　等
            第四要素    ステージID (Int 通番)
            第五要素    ジョブID   (Int 通番)
            第六要素    ジョブ終了マーカー　値はなんでも良い　セパレータ自体が終了マーカーとなる

*   作業ステージを閉じる処理は、ユーザがアプリケーション側で行う
    その際、識別子にフィックスのサインを付加する（第六要素用のセパレータを加える）
    フィックスされたデータが上書きされることはない　データの請求は常に有効
    将来的には、ステージ/ジョブを内部に備えたXps,xMap 等が利用されるが、その際もこの識別子はそのまま使用可能

りまぴんで呼び出しの際は、基本的に既fixのデータはリファレンスに　未fixのデータは編集エリアに読み込む
    
    第一要素をパースしてタイトル/OPUS情報を取得可能
    第二要素を split("/")　で兼用情報が得られる　第一要素が当該のカット番号
        各カット情報は カット番号(カット尺) *durationではない　transition情報もない（この通信では不用）
        プロトコル上は(カッコ内)は補助情報とする
            duration,transition等の情報を追加することも可能？
        
以上の機能をアプリケーション側で処理することで、RDBMのない状態で通常のストレージをリポジトリとして使用可能になる
とくにローカルファイルシステムを使う際は
    URIエンコードを施しファイル名規則に抵触するのを避ける
    長いファイル名を利用できる環境を使用すること
    識別子は分解してディレクトリをわけて保存するか、又はエスケープしてスラッシュがファイル名に含まれるの避ける

    リポジトリに要求される機能は、
        1.アプリケーションからの請求に従って、保存しているデータの識別子リストを送り返す
        2.アプリケーションから送信された(識別子付き)データを受信して、
            同じ識別子のエントリがあれば上書きする
            エントリがない場合は新規に保存エントリを作成する
        3.アプリケーションからの請求に従って、指定された識別子の保存データを送信する
        
    1.      list(filter)
        あまりエントリ数が多いと待ち時間が増すので、フィルタ機能はあったほうが良い
        （アプリケーション側でもフィルタするので無くても良い）
    2.      write(identifier)
        識別子のエントリがない場合は、新規エントリを登録
    3.      read(identifier)
        識別子のエントリがない場合は。操作失敗のレスポンスを返す

* webStorage には一般的なリスト機能はないが　全キーを取得してリストを構築することは可能
    リストオブジェクトをJSONパースしてストレージに一括で納める？
ただし、ブラウザ全体で５MB程度ととして、シートエディタのみでこれを専有するわけにもいかないので基本的にはドキュメントエントリ数を限って扱う。
試験的には複数エントリが扱えるように組む（ローカルファイルやDropBox/GoogleDrive等のネットストレージに対応するため）


*/
/**
    入力されたタイトルを評価してセレクタを切り替える
*/
function selectBrowser(){
    var myTitle     = document.getElementById('titleInput').value;
    var myOpus      = document.getElementById('opusInput').value;
    var mySubtitle  = document.getElementById('subtitleInput').value;
    var myCutNo     = document.getElementById('cutInput').value;
    var myTime      = document.getElementById('timeInput').value;
/*
    セレクタの中から該当するエントリを検索して　存在すればそのエントリを選択状態にする
    手続きは、セレクタ側の各要素を分解して下位から順に評価
    明確に異なる値があった時点でエントリをリジェクト
    すべてリジェクトされた場合フリーエントリを選択状態にする
    サブタイトル・カット秒数は特に評価しない
*/

}
/**
    タイトルを選択して入力エリア/カットセレクタを更新
    productNameは以下の型式で分解する
    (タイトル)[#＃№](番号)[(サブタイトル)]
    
    ももたろう＃12 [キジ参戦！ももたろう地獄模様！！]
    源氏物語 #23帖 [初音]
    
    タイトルと話数はナンバーサイン[#＃№]で区切る
    サブタイトルが存在する場合は、[]角括弧,「」カギ括弧,""引用符で区切って記入する
*/
function setProduct(productName){
    if(typeof productName == "undefined"){
    //プロダクト名が引数で与えられない場合はセレクタの値をとる
//        productName= document.getElementById("opusSelect").options[document.getElementById("opusSelect").selectedIndex].text;
    //プロダクト名が引数で与えられない場合はセレクタの値をとる
    //選択されたアイテムがない場合は、デフォルト値を使用してフリー要素を選択する
    if ( document.getElementById("opusSelect").selectedIndex >= 0 ){
        productName = document.getElementById("opusSelect").options[document.getElementById("opusSelect").selectedIndex].text;
    }else{
        document.getElementById("opusSelect").selectedIndex = 0;
        productName = "(*-- new title --*)#(*--opus--*)";
    }
    }
    prductName=productName.toString();//明示的にストリング変換する
    if(productName.length <= 0){return false;}
    if(productName.match(/^(.+)(\[[^\]]+\]|「[^」]+」|\"[^\"]+\"|\'[^\']+\')$/)){
        productName = RegExp.$1;
        var subTitle = RegExp.$2; 
    }else{
        var subTitle = "";   
    }
    if(productName.match(/(.*)\s*[#＃№](.+)/)){
        var title = RegExp.$1;
        var opus  = RegExp.$2;
    }else{
        var title = productName;
        var opus  = "";
    }
// タイトルからカットのリストを構築して右ペインのリストを更新
    documentDepot.currentProduct=document.getElementById("opusSelect").options[document.getElementById("opusSelect").selectedIndex].value;
// 更新したリストからリスト表示を更新
    documentDepot.updateDocumentSelector();

/** パネルテキスト更新
リストに存在しないプロダクトの場合は、リスト側で'(* new product *)'を選択する
*/ 
    document.getElementById("titleInput").value    = (title.length)? title:"(*--title--*)";
    document.getElementById("opusInput").value     = (opus.length)? opus:"(*--opus--*)";
    document.getElementById("subtitleInput").value = (subTitle.length)? subTitle:"(*--subtitle--*)";
//
    selectSCi();    
//    document.getElementById("opusSelect").selected
}
//setProduct("源氏物語＃二十三帖「初音」");

function selectSCi(sciName){
    if(typeof sciName == "undefined"){
    //カット名が引数で与えられない場合はセレクタの値をとる
    //選択さ　れたアイテムがない場合は、デフォルト値を使用してフリー要素を選択する
    if ( document.getElementById("cutList").selectedIndex >= 0 ){
        sciName = document.getElementById("cutList").options[document.getElementById("cutList").selectedIndex].text;
    }else{
        document.getElementById("cutList").selectedIndex = 0;
        sciName = "(*--c#--*)";
    }
    }
    sciName=sciName.toString();//明示的にストリング変換する
    if(sciName.length <= 0){return false;}
    var sciArray=sciName.split( "/" );//セパレータ "/"で分離
    //代表カット番号 sciArray[0]
    
    if(sciArray[0].match(/^\s*(.+)\s*\(([^\)]+)\)\s*$/)){
        var cutNumber = RegExp.$1;
        var cutTime  = parseInt(nas.FCT2Frm(RegExp.$2)); 
    }else{
        var cutNumber = sciArray[0];
        var cutTime   =  0;  
    }

//  状態更新
//　パネルテキスト更新
    document.getElementById("cutInput").value    = (cutNumber.length)? cutNumber:"(*--c#--*)";
    document.getElementById("timeInput").value     = (cutTime)? nas.Frm2FCT(cutTime,3):"3 + 00 .";

    var myInputText=["titleInput","opusInput","subtitleInput","cutInput","timeInput"];
    if (document.getElementById("cutList").selectedIndex <= 0){
        document.getElementById("ddp-open").disabled         = true;
        for ( var tidx = 0 ; tidx < myInputText.length ; tidx ++ ){
            document.getElementById(myInputText[tidx]).disabled = false;
        }
        document.getElementById("ddp-newdocument").disabled  = false;
        documentDepot.currentSelection = documentDepot.buildIdentifier();//現在のテキスト入力状態から識別子をビルドする。
    }else{
        document.getElementById("ddp-open").disabled         = false;
        for ( var tidx = 0 ; tidx < myInputText.length ; tidx ++ ){
            document.getElementById(myInputText[tidx]).disabled = true;
        }
        document.getElementById("ddp-newdocument").disabled  = true ;
        documentDepot.currentSelection = document.getElementById("cutList").options[document.getElementById("cutList").selectedIndex].value;
    }
}

/**
プロダクト名　カット番号ともに編集可能とそうでないケースをグラフィックで表示する機能が必要
選択のみで編集不能な場合、文字をグレーアウトさせるか？
最初からグレーアウトで編集キーを押したときのみ編集可能（＝新規作成）とするか　要調整
*/