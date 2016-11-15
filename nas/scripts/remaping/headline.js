//
/*
情報エリア用データ更新モジュール

*/
//
//親ウィンドウを設定

function getProp(msg,prp){
	msg=(msg)?msg:prp+" : こちらの値を編集してください";
	var org_dat=XPS[prp];
	var new_dat=prompt(msg , org_dat);
	
	if (new_dat && new_dat!=org_dat)
	{
		XPS[prp]=new_dat;
		sync(prp);
	}
};
//各種設定表示更新
function chgDuration(targetProp,prevalue,newvalue)
{
/*
if(false){
	switch(targetProp){
case	"time":
	msg="カットの時間を入力してください。";
	prevalue = nas.Frm2FCT(XPS.time(),3,0);
		break;
case	"trin":
	msg="トランシット情報を入力してください。\n時間は括弧で括って、キャプションとの間には空白を置いてください。\n書式:caption (timecode) /例: c10-c11 wipe. (1+12.)";
	prevalue = XPS.trin[1]+"\ \("+nas.Frm2FCT(XPS.trin[0],3,0)+"\)";
		break;
case	"trout":
	msg="トランシット情報を入力してください。\n時間は括弧で括って、キャプションとの間には空白を置いてください。\n書式:caption (timecode) /例: c10-c11 wipe. (1+12.)";
	prevalue = XPS.trout[1]+"\ \("+nas.Frm2FCT(XPS.trout[0],3,0)+"\)";
		break;
default	:return;
	}
};//保留
//nas.alert("test")
	
//	newvalue=prompt(msg , prevalue);
//	prevalue=;
//	newvalue=;
// */
//入力インターフェースをnas.editTableCellに変更したので、こちら側では確認のみにする
	if( newvalue!=prevalue){
	var newTime= XPS.time();
	var newTrin=new Array();
		newTrin[0]= XPS["trin"][0];
		newTrin[1]= XPS["trin"][1];
	var newTrout=new Array();
		newTrout[0]= XPS["trout"][0];
		newTrout[1]= XPS["trout"][1];
	switch(targetProp){
case	"time":
	newTime = nas.FCT2Frm(newvalue);
		break;
case	"trin":
	if (newvalue.match(/(.+)\s\((.+)\)/))
		{
	newTrin[1]=RegExp.$1;
	newTrin[0]=nas.FCT2Frm(RegExp.$2);
		}else{
	alert("処理できませんでした。");return;
		};
		break;
case	"trout":
	if (newvalue.match(/([^\(]+)\s\((.+)\)/))
		{
	newTrout[1]=RegExp.$1;
	newTrout[0]=nas.FCT2Frm(RegExp.$2);
		}else{
	alert("処理できませんでした。");return;
		};
		break;
default	:return;
	}
	}else{	return;	}
//alert(newTime+"\n"+newTrin.join("/")+"\n"+newTrout.join("/"));
//	return;
//	現在の値からカット継続時間を一時的に生成
	var duration=newTime+(newTrin[0]+newTrout[0])/2;
	var oldduration= XPS.duration();
	var durationUp=(duration>oldduration)? true : false ;

//	カット尺更新確認
		if(duration!=oldduration){
		var msg="";
		msg+="カットの継続時間が変更されます。\n";
		if (!durationUp)
			msg +="\t消去されるフレームの内容は破棄されます。\n";
//
		msg +="\n実行してよろしいですか。?";
//確認
	if(confirm(msg)){
//	設定尺が現在の編集位置よりも短い場合は編集位置を調整
		if(oldduration>duration){
			xUI.selectCell ("1_"+(duration-1).toString());
		};
//ターゲットから複製を作ってサイズを調整
	var newXPS=new Xps();
	newXPS.readIN( xUI.XPS.toString());

	for (i=0;i<newXPS.xpsTracks.length;i++)
	{
		newXPS.xpsTracks[i].length=duration;
		if(durationUp)
			for(f=oldduration;f<duration;f++)
			newXPS.xpsTracks[i][f]='';
	}

		newXPS["trin"]=newTrin;
		newXPS["trout"]=newTrout;

		xUI.put(newXPS);
		xUI.setStored("force");//変更フラグを立てる
	}
		sync("info_");
		}else{
	//
	xUI.setStored("force");
	if(XPS["trin"][1] != newTrin[1]){XPS.trin[1] =newTrin[1] ; sync("trin");};
	if(XPS["trout"][1]!=newTrout[1]){XPS.trout[1]=newTrout[1]; sync("trout");};
		}
//更新操作終了
}

function chkPostat(){
	var blmtd=document.getElementById("blmtd");
	var blpos=document.getElementById("blpos");
	switch(blmtd.value)
	{
	case "file"	:
		var status=false;break;
	case "opacity"	:	;
	case "wipe"	:	;
		var status=true;
		blpos.value="end";break;
	case "expression1"	:
		var status=true;
		blpos.value="first";break;
	case "expression2"	:
		var status=true;
		blpos.value="end";break;
	defaule	:
		var status=true;
		blpos.value="build";break;
	}
	if (blpos.disabled!=status)
		blpos.disabled=status;
}
function chgValue(id)
{
	var myTarget=document.getElementById(id);
	switch (id)
	{
case	"memo"	:
case	"noteText"	:
//		XPS["memo"]=myTarget.value;
		xUI.put(["noteText.xpsTracks",myTarget.value]);
		break;
		
case	"blmtd"	:
//		XPS["layers"][xUI.Select[0]-1][id]=myTarget.value;
		xUI.put([[id,xUI.Select[0],"xpsTracks"].join("."),myTarget.value]);
		chkPostat();
		break;

case	"blpos"	:
//		XPS["layers"][xUI.Select[0]-1][id]=myTarget.value;
		xUI.put([[id,xUI.Select[0],"xpsTracks"].join("."),myTarget.value]);
		break;

case	"aeVersion"	:
case	"keyMethod"	:
		xUI[id]=myTarget.value;
		break;

case	"fct0"	:
case	"fct1"	:
	xUI.selectCell(xUI.Select[0]+'_'+
		nas.FCT2Frm(myTarget.value));
	;break;
case	"selall"	:
		xUI.selectCell(xUI.Select[0]+"_0");
		xUI.selection(
			xUI.Select[0]+"_"+XPS.duration()
		);break;
case	"copy"	:	xUI.copy();break;
case	"cut"	:	xUI.cut();break;
case	"paste"	:	xUI.paste();break;
case	"keyArea"	:
	var Lvl=xUI.Select[0];
	if(Lvl>0 && Lvl<=(XPS.xpsTracks.length-1))
	{	writeAEKey(Lvl) }
	;break;
case	"areaXPS"	:
	document.getElementById("rEsult").value=XPS.toString();
	document.getElementById("rEsult").focus();
	;break;
case	"iNputbOx"	:	hello();break;
case	"ok"	:	hello();break;
case	"ng"	:	hello();break;
case	"undo"	:	xUI.undo();break;
case	"redo"	:	xUI.redo();break;
case	"up"	:	;//スピン
case	"down"	:	;
case	"right"	:	;
case	"left"	:	;
case	"fwd"	:	;
case	"back"	:	;
	xUI.spin(id);break;
case	"home"	:	;xUI.selectCell(xUI.Select[0]+"_0");break;
case	"end"	:	;xUI.selectCell(xUI.Select[0]+"_"+XPS.duration());break;
//
case	"spin_V"	:
	xUI.spin(myTarget.value);break;
case	"v_up"	:	;//スピン関連
case	"v_dn"	:	;//IDとキーワードを合わせてそのまま送る
case	"pgdn"	:	;
case	"pgup"	:
	xUI.spin(id);break;
case	"clearFS"	:	;//フットスタンプクリア
	xUI.footstampClear();break;
case	"layer"	:	;//レイヤ変更
	if (document.getElementById("single")){}

	xUI.selectCell(
		(myTarget.selectedIndex).toString()+
		"_"+xUI.Select[1]
	);
	reWriteCS();//cセレクタの書き直し
	break;
case	"cell"	:	;//セルの入力
	xUI.put((myTarget.selectedIndex+1));
	xUI.spin("fwd");

	break;
case	"fav"	:	;//文字の入力
	xUI.put(xUI.favoriteWords[myTarget.selectedIndex]);
	xUI.spin("fwd");

	break;
case	"TSXall"	:	return false;//捨てる
	break;
default:	alert(id);return false;
	}
//	alert(id);
return false;
}
//チェックボックストグル操作
function chg(id)
{
	var myCkBox=document.getElementById(id);
	myCkBox.checked=
	(myCkBox.checked) ?
	false	:	true	;
		chgValue(id);
	return false;
}
//単独書き換え

rewriteValueByEvt=function(e){
//ターゲットがクリックされた時、イベントから引数を組み立てて関数を呼ぶ
//alert(e);

	var TargeT=e.target;var Bt=e.which;//ターゲットオブジェクト取得
	var myPrp=TargeT.id;
	var msg="";
	var currentValue=null;
	switch(myPrp){
	case "time":
		msg="カットの時間を入力してください。\n";
	break;
	case "trin":
		msg="トランシット情報。時間は括弧で括って、キャプションとの間は空白。\n書式:caption (timecode) /例: c10-c11 wipe. (1+12.)";
		currentValue=this.XPS.trin[1]+"\ \("+nas.Frm2FCT(this.XPS.trin[0],3,0)+"\)";
	break;
	case "trout":
		msg="トランシット情報。時間は括弧で括って、キャプションとの間は空白。\n書式:caption (timecode) /例: c10-c11 wipe. (1+12.)";
		currentValue=this.XPS.trout[1]+"\ \("+nas.Frm2FCT(this.XPS.trout[0],3,0)+"\)";
	break;
	case "scene_cut":
 		msg="シーン・カットナンバーを変更します。データは 空白区切。\nひとつだとカット番号";
	break;
		case "update_user":
 		msg="作業ユーザ名を変更します。\n";
	break;
		case "opus":
 		msg="制作ナンバーを変更します。\n";
	break;
		case "title":
 		msg="タイトルを変更します。\n";
 		currentValue=this.XPS.title;
	break;
		case "subtitle":
 		msg="サブタイトルを変更します。\n";
	break;
	}
	xUI.printStatus(msg);

	var myFunction=function(){
		var prp=this.target.id
		var org_dat=XPS[prp];
		var new_dat=this.newContent;
		switch (prp){
		case "scene_cut":
		 var prevalue=this.orgContent
		 var newvalue=this.newContent;
		 if(newvalue != prevalue){
		 var newvalues=newvalue.split(" ");
		// XPS.scene=(newvalues.length>1)?newvalues[0]:"";
	xUI.put(["scene",(newvalues.length>1)?newvalues[0]:""]);
		 XPS.cut  =(newvalues.length>1)?newvalues[1]:newvalues[0];
	xUI.put(["cut",(newvalues.length>1)?newvalues[1]:newvalues[0]]);
//		 sync("scene");
		 xUI.setStored("force");
		 }
		 sync("cut");
			break;
		case "time":
		case "trin":
		case "trout":
		 var prevalue=this.orgContent
		 var newvalue=this.newContent;
		 if(newvalue != prevalue){chgDuration(prp,prevalue,newvalue);}else{sync("info_");}
			break;
		case "update_user":
		case "opus":
		case "title":
		case "subtitle":
		 default:
dbgPut("new_dat :"+new_dat)
//		 if (new_dat && new_dat!=org_dat)
		 if (new_dat!=org_dat)
		 {
		//	XPS[prp]=new_dat;
			xUI.put([prp,new_dat]);
			xUI.setStored("force");
		 }
			sync(prp);
		}
		xUI.printStatus();//クリア
	}
	if((TargeT.id)&&(TargeT instanceof HTMLTableCellElement)){
		nas.editTableCell(TargeT,"input",currentValue,myFunction);
//		document.getElementById(TargeT+"_ipt").style.padding="0";
	}
}

function rewriteValue(id){
var msg="";
var prp="";
	switch (id){
case	"opus":
	msg="制作ナンバーを変更します。\n";
	prp=id;
	getProp(msg,prp);
	break;
case	"title":
	msg="タイトルを変更します。\n";
	prp=id;
	getProp(msg,prp);
	break;
case	"subtitle":
	msg="サブタイトルを変更します。\n";
	prp=id;
	getProp(msg,prp);
	break;
case	"scene_cut":
	msg="シーン・カットナンバーを変更します。\nデータは 空白で区切ってふたつ書き込んでください。\n一つだけ書くとカット番号です";
	var prevalue=(XPS.scene)?XPS.scene+" "+XPS.cut:XPS.cut;

	var newvalue=prompt(msg,prevalue);
	if(newvalue != prevalue){
		var newvalues=newvalue.split(" ");
	XPS.scene	=(newvalues.length > 1)?newvalues[0]:"";
	XPS.cut	=(newvalues.length > 1)?newvalues[1]:newvalues[0];
//		sync("scene");
		sync("cut");
	}
	;break;
case	"time":
case	"trin":
case	"trout":
	chgDuration(id);
	break;

case	"update_user":
	msg="作業ユーザを変更します。\n";
	prp=id;
	getProp(msg,prp);
	break;
	}
//
xUI.setStored("force");sync();
}
/*	暫定版データエコーCGI 呼び出し
	CGI呼び出しの際に、フォイル名の確認を行うように変更
	ただしオブションで機能を切り離し可能に



 */
function callEcho()
{
var msg="次の名前でダウンロードフォルダにタイムシートを保存します。\nよろしいですか？";
nas.showModalDialog(" prompt",msg,"ダウンロードフォルダに保存",xUI.getFileName()+'\.xps',function(){
	if(this.status==0){
	var storeName=this.value;
	xUI.setStored("current");
	sync();
		//ファイル保存を行うのであらかじめリセットする;
	document.saveXps.action=ServiceUrl+'COMMAND=save&';
	document.saveXps.COMMAND.value ='save';
	document.saveXps.encode.value  ='utf8';
	document.saveXps.XPSBody.value=encodeURI(XPS.toString());
	document.saveXps.XPSFilename.value=storeName;
	document.saveXps.submit();
	}
})
}
/*	拡張子を引数にしてコールする
txt,html,ard,tsh,eps,ard　など
送信データ本体は、document.saveXps.XPSBody.value なので　あらかじめ値をセットしてからコールする必要あり
*/
function callEchoExport(myExt)
{
   var myEncoding="utf8";//デフォルトutf-8
   var sendData=xUI.data_well.value;
		//ファイル保存ではなくエクスポートなので環境リセットは省略;
   if(! myExt){myExt="txt";}
   switch (myExt){
	case "tsh":
		sendData=sendData.replace(/\r?\n/g,"\r")+"\n";
	case "eps":
	case "ard":
		myEncoding="sjis";
	break;
	default:
		myEncoding="utf8";
   }
  var msg="次の名前でダウンロードフォルダにファイルを保存します。\nよろしいですか？";
  
nas.showModalDialog("prompt",msg,"ダウンロードフォルダにファイルを保存",xUI.getFileName()+'\.'+myExt,function(){
	if(this.status==0){
//alert(myEncoding);
	document.saveXps.action=ServiceUrl+'COMMAND=save&';
	document.saveXps.COMMAND.value ='save';
	document.saveXps.encode.value  =myEncoding;
	switch (myEncoding){
	case "sjis" : document.saveXps.XPSBody.value =EscapeSJIS(sendData);break;
	case "eucjp": document.saveXps.XPSBody.value =EscapeEUCJP(sendData);break;
	default     : document.saveXps.XPSBody.value =encodeURI(sendData);
	}
	document.saveXps.XPSFilename.value=this.value;
	document.saveXps.submit();
	}
})
}
//現在のXPSデータを保存用HTMLに変換してエコーサービスへ送るルーチン

function callEchoHTML()
{
   var myEncoding="utf-8";//デフォルトutf8
   var sendData=printHTML(true);
   var myExt="html";
	var msg="表示用HTMLデータを次の名前でダウンロードフォルダに保存します。\nよろしいですか？";
nas.showModalDialog("prompt",msg,"ダウンロードフォルダにファイルを保存",xUI.getFileName()+'\.'+myExt,function(){
//	sendData=sendData.replace(/\r?\n/g,"\r\n");
	if(this.status==0){
	document.saveXps.action=ServiceUrl+'COMMAND=save&';
	document.saveXps.COMMAND.value ='save';
	document.saveXps.encode.value  =myEncoding;
	document.saveXps.XPSBody.value =sendData;
//	document.saveXps.XPSFilename.value=XPS.scene.toString()+XPS.cut.toString()+'\.'+myExt;
	document.saveXps.XPSFilename.value=this.value;//xUI.getFileName()+'\.'+myExt;
//send前にターゲットのiframeを確認して、無ければappendするコードをここへ挿入
	document.saveXps.submit();
	}
})
}
/*
	現行のデータをページ番号を指定してepsデータとして保存する関数
	epsデータは１ページ毎の別ファイルなので　複数葉の場合このダウンロードルーチンが
	ページごとに順次コールされる。
	名前付けや、番号付けはこの関数の外で行われる
*/

function callEchoEps(myContent,myName,myNumber)
{
   var myEncoding="sjis";//デフォルトsjis
   var sendData=myContent;
   var myExt="eps";

	sendData=sendData.replace(/\r?\n/g,"\r\n");

	document.saveXps.action=ServiceUrl+'COMMAND=save&';
	document.saveXps.target="window"+myNumber;
	document.saveXps.COMMAND.value ='save';
	document.saveXps.encode.value  =myEncoding;
	document.saveXps.XPSBody.value =EscapeSJIS(sendData);
	document.saveXps.XPSFilename.value=myName+"_"+myNumber+'\.'+myExt;
//send前にターゲットのiframeを確認して、無ければappendするコードをここへ挿入
	document.saveXps.submit();

}

function initInfo()
{
	alert("headline-Init")
}
//
