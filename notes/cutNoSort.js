/**
カット番号のソート関数

*/
/*
    nas_common.js　を使用する場合
    xpsio.js
*/
//カット番号が秒数等を含まない場合
Array.sortByCutNumber(function(str1,str2){return (nas.parseNumber(str1)-nas.parseNumber(str2))});
//カット番号が秒数等を含む場合
Array.sortByCutNumber(function(str1,str2){return (nas.parseNumber(Xps.parseSCi(str1).cut)-nas.parseNumber(Xps.parseSCi(str2).cut))});

/*
    nasライブラリを使用しない場合
        以下の処理を行ってから比較する
    String.normalize("NFKC");//正規化して全角文字列等を半角化する
    String.replace(/^[^\d]*/,'');//数字以外の前置文字列を評価対象から外す
    parseInt(String,10);//10進整数化
*/
//カット番号
Array.sortByCutNumber(function(str1,str2){ return (parseInt(String(str1).normalize("NFKC").replace(/^[^\d]*/,''),10)-parseInt(String(str2).normalize("NFKC").replace(/^[^\d]*/,''),10));});
