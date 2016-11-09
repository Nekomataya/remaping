/**
	環境設定パネル
*/
//プリファレンスオブジェクト作成
function Pref(){
	this.changed=false;
//ブランク方式
	this.Lists = new Array();
	this.Lists["prefBlmtd"]=["file","opacity","wipe","channelShift","expression1"];
	this.Lists["prefBlpos"]=["first","end","none"];
	this.Lists["prefAeVersion"]=["8.0","10.0"];
/*	旧バージョンはサポート廃止
	this.Lists["prefAeVersion"]=["4.0","5.0","6.5","7.0","8.0"];
	this.Lists["prefKeyMethod"]=["min","opt","max"];
 */
	this.Lists["prefFpsF"]=["custom","auto","24","29.97","30","25","15","23.976","48","60"];
	this.Lists["prefFpsF"+"_name"]=["=CUSTOM=","コンポと同じ","FILM","NTSC","NDF","PAL","WEB","DF24","FR48","FR60"];
	this.Lists["prefDfSIZE"]=
["custom",
"640,480,1","720,480,0.9","720,486,0.9","720,540,1",
"1440,1024,1","2880,2048,1","1772,1329,1","1276,957,1",
"1280,720,1","1920,1080,1","1440,1080,1.333"];
	this.Lists["prefDfSIZE"+"_name"]=
["=CUSTOM=",
"VGA","DV","D1","D1sq",
"D4","D16","std-200dpi","std-144dpi",
"HD720","HDTV","HDV"];
//リスト検索 指配列内の定された要素のサブ要素をあたってヒットしたら要素番号を返す。
this.Lists.aserch=function(name,ael){if(this[name]){for (var n=0;n<this[name].length;n++){if(this[name][n]==ael)return n}};return -1;}

	this.userName="";
//ユーザ名変更
this.chgMyName=function(newName)
{
	if(! newName){
		var msg="シートに入れる名前を入力してください。\n";
		nas.showModalDialog("prompt",msg,"作業者の名前",myName,function(){if(this.status==0){newName=this.value;myName=newName;XPS.update_user=this.value;sync("update_user");}});
		if(newName==null){newName=XPS.update_user}
	}
	this.userName=newName;
		document.getElementById("myName").innerHTML=

'<a href="javascript:return false" title="名前を変更する。">'+
this.userName+'</a>';
		if(! this.changed){this.changed=true;};
}

//ブランク関連変更
this.chgblk=function(id)
{
	if (id!="prefBlpos")
	{
//	method変更
		switch (document.getElementById("prefBlmtd").value)
		{
		case "0":
			document.getElementById("prefBlpos").disabled=false;
			break	;
		case "1":	;
		case "2":	;
		case "4":	;
			document.getElementById("prefBlpos").value=1;//end
			document.getElementById("prefBlpos").disabled=true;
			break	;
		case "3":	;
		default :	;
			document.getElementById("prefBlpos").value=0;//first
			document.getElementById("prefBlpos").disabled=true;
		}

	}
		if(! this.changed){this.changed=true;};
}

//フッテージフレームレート変更
this.chgfpsF=function(id)
{
	if(id!="SetFpsF"){
//	値を直接書き換えた
	document.getElementById("SetFpsF").value=
(this.Lists.aserch("prefFpsF",document.getElementById("prefFpsF").value.toString())==-1)?
0 : this.Lists.aserch("prefFpsF",document.getElementById("prefFpsF").value.toString());
	}else{
//	セレクタを使った
	document.getElementById("prefFpsF").value=
(document.getElementById("SetFpsF").value == 0)?
document.getElementById("prefFpsF").value : this.Lists["prefFpsF"][document.getElementById("SetFpsF").value]
	}
		if(! this.changed){this.changed=true;};
}
//省略時サイズ変更
this.chgdfSIZE=function(id)
{
	if(id!="prefDfSizeSet"){
//	値を直接書き換えた
with(document){
	var name=[
	getElementById("prefDfX").value,
	getElementById("prefDfY").value,
	getElementById("prefDfA").value].join(",")}

	document.getElementById("prefDfSizeSet").value=
(this.Lists.aserch("prefDfSIZE",name)==-1)?
0 : this.Lists.aserch("prefDfSIZE",name);
	}else{
//	セレクタを使った

	var dfSIZE=this.Lists["prefDfSIZE"][document.getElementById("prefDfSizeSet").value];
		if(dfSIZE !="custom")
		{	with(document){
	getElementById("prefDfX").value=dfSIZE.split(",")[0];
	getElementById("prefDfY").value=dfSIZE.split(",")[1];
	getElementById("prefDfA").value=dfSIZE.split(",")[2];
			}
		}
	}
		if(! this.changed){this.changed=true;};
}

//フッテージフレームレート変更
this.chgprefFpsF=function(id)
{
	if(id!="SetFpsF"){
//	値を直接書き換えた
	document.getElementById("SetFpsF").value=
(this.Lists.aserch("prefFpsF",document.getElementById("prefFpsF").value.toString())==-1)?
0 : this.Lists.aserch("prefFpsF",document.getElementById("prefFpsF").value.toString());
	}else{
//	セレクタを使った
	document.getElementById("prefFpsF").value=
(document.getElementById("SetFpsF").value == 0)?
document.getElementById("prefFpsF").value : this.Lists["prefFpsF"][document.getElementById("SetFpsF").value]
	}
		if(! this.changed){this.changed=true;};
}
//チェックボックストグル操作
this.chg=function(id)
{
	document.getElementById(id).checked=
	(document.getElementById(id).checked) ?
	false	:	true	;
		if(! this.changed){this.changed=true;};
	return false;
}
//viewMode変更
this.chgVM=function(myValue)
{
	if(xUI.viewMode != myValue){
		document.getElementById("vM"+myValue).checked=true;
		if(! this.changed){this.changed=true;};
	}
	return false;
}
//
//各種設定表示初期化
this.getProp=function()
{
//作業ユーザ名
	this.chgMyName(XPS.update_user);
//表示モード
	this.chgVM(xUI["viewMode"]);
//カラセル関連
	var idNames =["prefBlmtd","prefBlpos","prefAeVersion"];//不要プロパティ＞,"prefKeyMethod"
	var iNames  =["blmtd"    ,"blpos"    ,"aeVersion"    ];//,"keyMethod"    
	for (var i=0;i<idNames.length;i++ ){
		idName=idNames[i];name=iNames[i];
		document.getElementById(idName).value=
		this.Lists.aserch(idName,xUI[name]);
	}
	this.chgblk();
//キーオプション
	var keyNames=["prefFpsF","prefDfX","prefDfY","prefDfA"];
	var kNames  =["fpsF"    ,"dfX"    ,"dfY"    ,"dfA"    ];
	for (var i=0;i<keyNames.length;i++){
		idName=keyNames[i];name=kNames[i];
		document.getElementById(idName).value=xUI[name];
	}
	this.chgprefFpsF();this.chgdfSIZE();

	document.getElementById("timeShift").checked=xUI["timeShift"];
// UI情報
//	document.getElementById("prefToolBar").checked=xUI["toolBar"];
	document.getElementById("prefUtilBar").checked=xUI["utilBar"];

// シート情報
//ページ長・カラム・フットスタンプ
with(document){
	getElementById("prefSheetLength").value=nas["SheetLength"];
	getElementById("prefPageCol").checked=(xUI["PageCols"]==2)? true : false ;
	getElementById("prefFootMark").checked=xUI["footMark"];

//カウンタ
	getElementById("FCTo0").value=10*(xUI["fct0"][0])+xUI["fct0"][1];
	getElementById("FCTo1").value=10*(xUI["fct1"][0])+xUI["fct1"][1];

//ループアクション
	getElementById("cLoop").checked=xUI["cLoop"];
	getElementById("sLoop").checked=xUI["sLoop"];
	getElementById("autoScroll").checked=xUI["autoScroll"];
	getElementById("tabSpin").checked=xUI["tabSpin"];

	getElementById("noSync").checked=xUI["noSync"];
}
		if(this.changed){this.changed=false;};
}

//
//各種設定をドキュメントに反映
this.putProp=function ()
{
//名前変更
	var newName=this.userName;
	if(newName != myName)
	{
		myName=newName;
		XPS.update_user=newName;
		sync("update_user");
	}

//カラセル関連
	var blankNames=["prefBlmtd","prefBlpos","prefAeVersion"];//,"prefKeyMethod"
	var iNames    =["blmtd"    ,"blpos"    ,    "aeVersion"];//,    "keyMethod"
	for (var i=0;i<blankNames.length;i++){
		name=blankNames[i];
		xUI[iNames[i]]=this.Lists[name][document.getElementById(name).value];
	}
//キーオプション
	var kOptNames=["prefFpsF","prefDfX","prefDfY","prefDfA"];
	for (var i=0;i<kOptNames.length;i++){
		name=kOptNames[i];
		xUI[name]=document.getElementById(name).value;
	}
//読み込みタイムシフト
	xUI["timeShift"]=document.getElementById("timeShift").checked;
//UI情報
	xUI["utilBar"]=document.getElementById("prefUtilBar").checked;
//viewMode
	var newMode=(document.getElementById("vMCompact").checked)?"Compact":"WordProp";
// シート情報
//ページ長・カラム・フットスタンプ
var cols=(document.getElementById("prefPageCol").checked==true)? 2 : 1;
if(	xUI.SheetLength !=document.getElementById("prefSheetLength").value ||
	xUI.PageCols !=  cols ||
	xUI.viewMode != newMode
)
{
//
	xUI["viewMode"]=newMode;
// シート外観の変更が必要なのでフォーカス関連を控えて再初期化する
		Bkup=[xUI.Select,xUI.Selection,xUI.Focus];
	xUI.SheetLength=document.getElementById("prefSheetLength").value;
		xUI.PageLength	=xUI.SheetLength*
		XPS.framerate;
	xUI.PageCols= cols;
//実行。
		nas_Rmp_Init();
//フォーカス復帰
		xUI.Select =Bkup[0];
		xUI.Selection =Bkup[1];
		xUI.Focus =Bkup[2];
			xUI.selectCell();
}
	xUI.footMark=document.getElementById("prefFootMark").checked;

//カウンタ
	xUI["fct0"]=
	[Math.floor(document.getElementById("FCTo0").value/10),
	document.getElementById("FCTo0").value%10];
	xUI["fct1"]=
	[Math.floor(document.getElementById("FCTo1").value/10),
	document.getElementById("FCTo1").value%10];
	sync("fct");		
//ループアクション
	xUI["cLoop"]=document.getElementById("cLoop").checked;
	xUI["sLoop"]=document.getElementById("sLoop").checked;
	xUI["autoScroll"]=document.getElementById("autoScroll").checked;
	xUI["tabSpin"]=document.getElementById("tabSpin").checked;
//	これだけは一時変更(なくしても良いかも)
	xUI["noSync"]=document.getElementById("noSync").checked;

		if(this.changed){this.changed=false;};
}
//
//パネル初期化

this.init=function(){	this.getProp(); }

//パネルを開く
//すでに開いていたらNOP Return
this.open=function(){
		if($("#optionPanelPref").is(":visible")){
			return false;
		}else{
			this.init();
			sWitchPanel("Pref");
		}
	return null;
}
/**
	パネルを閉じる
	変更フラグ立っていれば確認して操作を反映
 */
this.close=function(){
	if(this.changed){if(confirm("設定が変更されています。反映させますか?")){this.putProp();}};
		sWitchPanel("Pref");
}

}
//test
//プリファレンスオブジェクト作成
//	var myPref=new Pref();
//さらに初期化(初期化込みでコールされた時でも良いかも)
//	myPref.init();
