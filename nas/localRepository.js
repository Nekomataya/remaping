/**
    ローカルリポジトリ
    作業データをストックする
    カットのデータを履歴付きで保持できる
    複数カットを扱うか？
    可能だが扱わないほうが良いような気がする
    （それだけで済ませようとするユーザはキケン）
    xUIから見るとサーバの一種として働く
    ローカルストレージを利用して稼働する

保存形式
info.nekomataya.remaping.dataStore
内部にオブジェクト保存
*/
/*
    履歴構造の実装には、XPSのデータを簡易パースする機能が必要
    プロパティを取得するのみ？
    
    サーバは自身でXPSをパースして（データ全送りはしない）識別データを送る
    
(タイトル)[#＃№](番号)[(サブタイトル)]//S##C####(##+##)/S##C####(##+##)/S##C####(##+##)/不定数…//lineID//stageID//jobID//
 
 XPSオブジェクトから識別テキストを組む関数が必要
 ステージID　及びジョブIDはカット（管理単位）毎の通番　同じIDが同じステージや同じジョブを示すとは限らないが作業の連続性は担保される
 
 
 
 //現状
 var myXps= XPS;
    [encodeURIComponent(myXps.title)+"#"+encodeURIComponent(myXps.opus)+"["+encodeURIComponent(myXps.subtitle)+"]",encodeURIComponent("S"+((myXps.scene)?myXps.scene:"-")+"C"+myXps.cut)+"("+myXps.time()+")",myXps.xMap.currentLine,myXps.xMap.currentStage,myXps.xMap.currentJob].join(" // ");
 //将来は以下で置き換え予定CSオブジェクト未実装
    myXps.sci.getIdentifier();
*/
localRepository={
    currentProduct:"",
    currentSC:"",
    currentLine:"",
    currentStage:"",
    currentJob:"",
    entryList:[],
    storeList:[],
    keyPrefix:"info.nekomataya.remaping.dataStore.",
    maxEntry:5
};
/**
    getListメソッドは、ストアリストをクリア
    ローカルストレージ内のデータをすべて走査してストアリストに格納
    エントリリストの更新を行う

    戻り値はストアされたエントリの数
    実際のデータ・エントリリストが必要な場合は、localRepository.storeList/localRepository.entryListを参照すること
    
*/
localRepository.getList=function(myFilter,isRegex){
    if(typeof myFilter == "undefined") {myFilter=".+";};
    var myFilterRegex =(isRegex)? new RegExp(myFilter):new RegExp(".*"+myFilter+".*");
//実質エントリ数を少なく制限するのでフィルタは意味をなさない　フィルタのフォーマットは一考

    var keyCount=localStorage.length;//ローカルストレージのキー数を取得
    this.entryList=[];//配列初期化
    this.storeList=[];//配列初期化
    var currentEntryID;
    for (var kid=0;kid<keyCount;kid++){
        if(localStorage.key(kid).indexOf(this.keyPrefix)==0){
            var currentIdentifier=localStorage.key(kid).slice(this.keyPrefix.length);
            if(currentIdentifier.match(myFilter)){
//                this.storeList.push(currentIdentifier);
                var entryArray=currentIdentifier.split( "//" );//分離して配列化
                var myEntry=entryArray.slice(0,2).join( "//" );//管理情報を外してSCi部のみ抽出
                var hasEntry = false;
                for (var eid=0 ; eid < this.entryList.length; eid ++){
                //エントリリストにすでに登録されているか検査
                    if(myEntry == this.entryList[eid]){ currentEntryID = eid; hasEntry=true; break; }
                }
                if(hasEntry){
                    //登録済みプロダクトなので管理情報を追加
                    this.entryList[currentEntryID].issues.pusy(entryArry.slice(2).join("//"))
                }else{
                    //未登録新規プロダクトなのでエントリ追加
                    this.entryList.push(myEntry);
                    this.entryList[this.entryList.length-1].issues=[entryArry.slice(2).join("//")];//管理情報配列を追加
                }
            }
        }
    }
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
localRepository.putStore=function(myXps){
//この識別子作成は実験コードです　近々にXps.getIdentifier() メソッドと置換されます。2016.11.14
    var myIdentifier=[encodeURIComponent(myXps.title)+"#"+encodeURIComponent(myXps.opus)+"["+encodeURIComponent(myXps.subtitle)+"]",encodeURIComponent("S"+((myXps.scene)?myXps.scene:"-")+"C"+myXps.cut)+"("+myXps.time()+")",myXps.xMap.currentLine,myXps.xMap.currentStage,myXps.xMap.currentJob].join(" // ");
    if(this.entryStore.length>this.maxEntry){
    　//設定制限値をオーバーしたら、ローカルストレージから古いエントリを削除して　新しいエントリを追加する
        for (var iid=0;iid<this.entryStore[0].issues.length;iid++){ localStorage.removeItem(this.keyPrefix+this.entryStore[0].this.entryStore[0].issues[iid]);};
        this.entryStore=this.entryStore.slice(1);
    }
    localStorage.setItem(this.keyPrefix+myIdentifier,myXps.toString());
}

/**
    識別子を引数にして保存されたデータを取得する
    識別子に管理情報があればそれを、なければ最も最新のデータを返す
    オブジェクトもどし
*/
localRepository.getStore=function(myIdentifier){
    if(myIdentifier.split("//").length>4){
        myXpsSource=localStorage.getItem(this.keyPrefix+myIdentifier);
    }else{
        for(var ix=0;ix<this.entryStore.length;ix++){if (myIdentifier==this.entryStore[ix]) break;}
        myXpsSource=localStorage.getItem(this.keyPrefix+myIdentifier+"//"+this.entryStore[ix].issues[this.entryStore[ix].issues.length-1]);        
    }
    var myXps=new Xps();
    myXps.readIN(myXpsSource);
    return myXps;
}

/*  test data 
    localRepository.currentProduct = "ももたろう#12[キジ参戦！ももたろう地獄模様！！]";
    localRepository.currentSC      = "S-C005 (12+00)/011(3+00)/014(3+00)";
    localRepository.currentLine    = 0;
    localRepository.currentStage   = 0;
    localRepository.currentJob     = 0;

JSON.stringify(localRepository);
localRepository.getList();
*/
