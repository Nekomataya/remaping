/*
	サンプルデータ取得用プロシジャ(ajaxお試し)
	prototype.js　置き換え　2013.02.10
	Chrome　はローカルファイルだと弾かれる。
	File API 版を作ること
	なんだかprototypeよりもjQueryのほうがイロイロ楽なので
	更にjQueryに置き換えてみる。2013.02.24
 */
var mySample="";
var myAjax=new Object();
function getSample(Number){
	var url="./template/blank.txt";
	switch(Number){
case	0:url="./template/timeSheet_eps.txt";break;
case	9:url="./sample/encoded/sample9.txt";break;
case	8:url="./sample/encoded/sample8.txt";break;
case	7:url="./sample/encoded/sample7.txt";break;
case	6:url="./sample/encoded/sample6.txt";break;
case	5:url="./sample/encoded/sample5.txt";break;
case	4:url="./sample/encoded/sample4.txt";break;
case	3:url="./sample/encoded/sample3.txt";break;
case	2:url="./sample/encoded/sample2.txt";break;
case	1:url="./sample/encoded/sample1.txt";break;
	default:url="./sample/encoded/sample1.txt";
	}
	myAjax= jQuery.ajax({
		type    :"GET",
		 url    : url ,
		dataType:"text",
		success : putSample
	});
//	jQuery("data_well").load(url);
//		error :putSample

};
function putSample(request , stts ,oth){
//	if(oth){alert(oth);alert(stts);alert(request);}
//	confirm("stop");
//	if(!request){request=myAjax};
//	var myContent= request.transport.responseText;
	var myContent= request;
//	if(true){request=myAjax}
	xUI.data_well.value=decodeURI(myContent);
//xUI.data_well.value=myContent;
};

