// debaug デバグ用ルーチン集

/*	デバグ汎用
		デバッグ対象ルーチン側でロードすること

 */

if (dbg)
{

var dbg_info=new Array();
//ふらぐガ立ッテリャでばぐういんどヲひらく
//	if(! xUI.SWap["dbg_"]) xUI.openSW("dbg_");

//でばぐ出力
function dbgPut(aRg)
{
/*
	if (! xUI.SWap["dbg_"]) {
		 alert(aRg);xUI.openSW("dbg_");
	}else{
//		xUI["dbg_"].
	}
*/
	document.getElementById('msg_well').value += (aRg+"\n");
}

function show_all_props(Obj)
{
	var Xalert="\n\tprops\n\n";
	for (prop in Obj) Xalert+=(prop+"\t:\t"+Obj[prop]+"\n\n\n");
	dbgPut(Xalert);
}

function dgb_action(cmd)
{
//エラー発生時はキャプチャしてそちらを表示する
	var body="";
	try{body=eval(cmd);}catch(er){body=er;};
//	if (! xUI.SWap["dbg_"]) xUI.openSW("dbg_");
// 	xUI["dbg_"].
	document.getElementById('msg_well').value+=(body+'\n');
}

}

 