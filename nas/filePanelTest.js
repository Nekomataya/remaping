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
xUI.documentDepot = {};//エントリを格納するオブジェクト

xUI.documentDepot.repositories = [];//リポジトリのリスト　サービスにアクセスするごとに更新　参照でも良い
//  名前,url,使用ライブラリは、ここでは不用? サービスエージェント上のサーバへの参照が望ましい
xUI.documentDepot.products = [];//プロダクトリスト　サービスにアクセスするごとに抽出更新
// 各プロダクトは独立したデータとして一覧アクセスできるようにしておく
// フィルタは、Depotのオブジェクトメソッドで実装
// opusオブジェクトを使用　リポジトリリストの参照を加える　opusが同じでリポジトリが異なる場合は、同エントリ内で複数を保持
// 主にローカルリポジトリや、ホームリポジトリでの使用を前提とする
xUI.documentDepot.documents = [];//ドキュメントエントリーコレクション　サービスにアクセスするごとに更新
//  ドキュメントエントリはカプセル化されたオブジェクトにする　SCi互換
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
            「リポジトリ」の指定がない場合は、上書き
            新規作成時にリポジトリを要求する。
            
リポジトリについて
    リポジトリは、このシステム上「データ保存場所」に識別用の名前を付けて管理対象としたもの。

    タイムシート・カット袋等の制作管理及びカット内容のメタデータ　及び将来的には、メタデータに記載された制作データそのものを保存
    ユーザのリクエストに従って読み書き可能なサービスとする。

    リポジトリには、制作管理DBの機能はない。
    制作管理DBの機能は、一般のRDBMサービスを立ち上げそこで利用するものとする。
    
    簡易的なデータの解釈は、リポジトリから読み出したデータをアプリケーションがパースして行う。
    可能ならリポジトリ側でのパースがあれば処理速度的により望ましい。

    ＊簡易のバース結果を識別子に折り込めば双方のパフォーマンスに寄与するかも…
        １＞必要なデータを保存時にURIエンコードして識別子としてアプリケーション側から送信する
        ２＞リポジトリサーバは、その識別子を利用して保存を行う
    その場合の識別子は
title＃opus[subtitle]//SsceneCcut(seconds+frames) / SsceneCcut(seconds+frames) / SsceneCcut(seconds+frames) //stageID//jobID//
　  上記の型式で（ローカルリポジトリではこの方法を採用する）        
    簡易パース手順
        decodeURI 
        split("//")
            4要素なら上書き可
            5要素ならロックされて上書き不可
            第一要素　プロダクト識別子　パース手順あり
            第二要素　SCi識別子
                split("/")
                第一要素カット番号　第二要素以降は兼用番号　第一要素と同じ番号が入る場合があるがその場合は無視
                各要素はカット番号とカット尺に分解して利用
            第三要素    ステージ識別子
            第四要素    ジョブ識別子
            第五要素    ジョブ終了マーカー　値はなんでも良い　セパレータ自体が終了マーカーとなる

*   作業ステージを閉じる処理は、ユーザがアプリケーション側で行う
    その際、識別子にクローズドのサインを付加する（第五要素用のセパレータを加える）
    クロースドされたデータが上書きされることはない　請求は常に可能
    将来的には、ステージ/ジョブを内部に備えたXps,xMap 等が利用されるが、その際もこの識別子はそのまま使用可能

以上の機能をアプリケーション側で処理することで、通常のストレージがリポジトリとして使用可能になる
        
            
    リポジトリに要求される機能は、
        1.アプリケーションから送信された(識別子付き)データを受信して、新規に保存エントリを作成、識別子（リポジトリ内でユニーク）を返送する
        2.アプリケーションから送信された(識別子付き)データを受信して、同識別子のデータを上書きする
        3.アプリケーションからの請求に従って、保存しているデータのリスト（必ず識別子を含める）を送り返す
        4.アプリケーションからの請求に従って、保存されているデータを送信する
        
    1.write
    2.write as
    3.list
    4.read

* webStorage には一般的なリスト機能はないが　全キーを取得してリストを構築することは可能

ただし、ブラウザ全体で５MB程度ととして、シートエディタのみでこれを専有するわけにもいかないので基本的にはドキュメント１エントリを扱うだけに留める。
試験的には複数エントリが扱えるように組む（ローカルファイルやDropBox/GoogleDrive等のネットストレージに対応するため）


*/

/**
    タイトルを選択して入力エリア/カットセレクタを更新
    productNameは以下の型式で分解する
    (タイトル)[#＃№](番号)[(サブタイトル)]
    
    ももたろう＃12 [キジ参戦！ももたろう地獄模様！！]
    源氏物語 #23帖 [初音]
    
    タイトルと話数は空白又はナンバーサイン[\s#＃№]で区切る
    サブタイトルが存在する場合は、[]角括弧,「」カギ括弧,""引用符で区切って記入するものとする
*/
function setProduct(productName){
    if(typeof productName == "undefined"){
    //プロダクト名が引数で与えられない場合はセレクタの値をとる
        productName= document.getElementById("opusSelect").options[document.getElementById("opusSelect").selectedIndex].text;
    }
    prductName=productName.toString();//明示的にストリング変換する
    if(productName.length <= 0){return false;}
    if(productName.match(/^(.+)(\[[^\]]+\]|「[^」]+」|\"[^\"]+\"|\'[^\']+\')$/)){
        productName = RegExp.$1;
        var subTitle = RegExp.$2; 
    }else{
        var subTitle = "";   
    }
    if(productName.match(/(.*)\s*[#＃№第](.+)/)){
        var title = RegExp.$1;
        var opus  = RegExp.$2;
    }else{
        var title = productName;
        var opus  = "";
    }
// タイトルからカットのリストを構築してリストを更新
// 更新したリストからリスト表示を更新
// パネルテキスト更新    
    document.getElementById("titleInput").value    = (title.length)? title:"(title)";
    document.getElementById("opusInput").value     = (opus.length)? opus:"(opus)";
    document.getElementById("subtitleInput").value = (subTitle.length)? subTitle:"(subtitle)";
}
//setProduct("源氏物語＃二十三帖「初音」");
function selectSCi(sciName){
    if(typeof sciName == "undefined"){
    //プロダクト名が引数で与えられない場合はセレクタの値をとる
        sciName= document.getElementById("cutList").options[document.getElementById("cutList").selectedIndex].text;
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
//　パネルテキスト更新    
    document.getElementById("cutInput").value    = (cutNumber.length)? cutNumber:"(c#)";
    document.getElementById("timeInput").value     = (cutTime)? nas.Frm2FCT(cutTime,3):"6+0";

}

/**
プロダクト名　カット番号ともに編集可能とそうでないケースをグラフィックで表示する機能が必要
選択のみで編集不能な場合、文字をグレーアウトさせるか？
最初からグレーアウトで編集キーを押したときのみ編集可能（＝新規作成）とするか　要調整
*/