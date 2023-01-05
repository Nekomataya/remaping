// debaug デバグ用ルーチン集		------ dbg.js

/*	デバグ汎用
		デバッグ対象ルーチン側でロードすること

 */

if (dbg){
	var dbg_info=new Array();
//でばぐ出力
function dbgPut(aRg){
	document.getElementById('msg_well').value += (aRg+"\n");
	if(console){console.log(aRg);}
}
function show_all_props(Obj){
	var Xalert="\n\tprops\n\n";
	for (prop in Obj) Xalert+=(prop+"\t:\t"+Obj[prop]+"\n\n\n");
	dbgPut(Xalert);
}
function dbg_action(cmd){
//エラー発生時はキャプチャしてそちらを表示する
	var body="";
	try{body=eval(cmd);}catch(er){body=er;};
	document.getElementById('msg_well').value += (body+'\n');
	if(console){console.log(body);}
}
}

 