/*
	HTML言語リソース抽出用プロシジャ

	指定したidのリソースを nas.LanguagePack　形式で書き出す
	チェックするエレメントは、
a/input/button/textarea/option
	idを持ち、かつ	title　または innerHTML　プロパティに値がある
	出力形式は
	[id,property,value]

	idはユニークであることを期待される
	実際は、最初にヒットしたエレメントに対して置換が行われる



*/
var myResult=[];

	//全エレメント取得
var tags=document.getElementsByTagName("*");

for (var idx=0;idx<tags.length;idx ++){
  if(tags[idx].tagName.match(/^(A|input|button|textarea|option)$/i)){
	if((typeof tags[idx].id != "undefined")&&(tags[idx].id != "")){
var myID=tags[idx].id;
		if(typeof tags[idx].title != "undefined"){
	myResult.push([myID,"title",tags[idx].title]);
		}
		if(tags[idx].innerHTML.length > 0){
	myResult.push([myID,"innerHTML",tags[idx].innerHTML]);
		}
	}
  }
}

//myResult.length
JSON.stringify(myResult);
