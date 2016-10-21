/*
シーン設定ボックス用関数
2007/06/24 ScenePrefオブジェクト化


シーンプロパティ編集UIにモードを設ける
通常時は
A	シーン（カット）登録　Title/Opus/S_C + time
B	シーン属性編集	各トラックのプロパティ編集
の２面UIとする
Aは管理DBにエントリ登録を行う専用UI
BはXps（ステージ）の属性編集UI
二つの概念を分離して、それぞれのUIを作成すること
*/

function ScenePref(){
//内容変更フラグ
	this.changed=false;
//
	this.layers=0;//ローカルのレイヤ数バッファ・スタートアップ内で初期化
//各種プロパティとセレクタの対応を格納する配列

	this.Lists = new Array();

	this.Lists["blmtd"]=["file","opacity","wipe","channelShift","expression1"];
	this.Lists["blpos"]=["first","end","none"];
	this.Lists["AEver"]=["8.0","10.0"];
	this.Lists["KEYmtd"]=["min","opt","max"];

	this.Lists["framerate"]=["custom","24","30","29.97","25","15","23.976","48","60"];
	this.Lists["framerate"+"_name"]=["=CUSTOM=","FILM","NTSC","NTSC-DF","PAL","WEB","DF24","FR48","FR60"];
	this.Lists["SIZEs"]=[	"custom",
							"640,480,1","720,480,0.9","720,486,0.9","720,540,1",
							"1440,1024,1","2880,2048,1","1772,1329,1","1276,957,1",
							"1280,720,1","1920,1080,1","1440,1080,1.333"];

	this.Lists["dfSIZE"+"_name"]=[	"=CUSTOM=",
									"VGA","DV","D1","D1sq",
									"D4","D16","std-200dpi","std-144dpi",
									"HD720","HDTV","HDV"];

//リストにaserchメソッドを付加 List.aserch(セクション,キー) result;index or -1 (not found)

this.Lists.aserch =function(name,ael){for (n=0;n<this[name].length;n++){if(this[name][n]==ael)return n};return -1;}

//変更関連
this.chgProp=function (id)
{
	var	name	=id.split("_")[0];
	var	number	=id.split("_")[1];
		switch (name)
		{
		case "scnLopt":	this.chgopt(name,number);break;
		case "scnLlbl":	this.chglbl(name,number);break;
		case "scnLlot":	this.chglot(name,number);break;
		case "scnLbmd":	;
		case "scnLbps":	this.chgblk(name,number);break;
		case "scnLszT":	;
		case "scnLszX":	;
		case "scnLszY":	;
		case "scnLszA":	this.chgSIZE(name,number);break;
		}
	this.changed=true;
}
this.chgopt =function (){return;}
this.chglbl =function (name,number){
	var newLabels=new Array
	for(var i=0;i<this.layers;i++){
		newLabels.push(document.getElementById(name+"_"+i).value);
	}
	document.getElementById("scnLayersLbls").value=newLabels.join();
	return;
}
this.chglot =function (){return;}

//レイヤ数変更
this.chglayers =function (id){

	if(id=="scnLayersLbls"){
//レイヤラベルボックス内で指定されたエレメントの数でレイヤ数を決定する
		document.getElementById("scnLayers").value=document.getElementById("scnLayersLbls").value.split(",").length;		
		if(this.layers!=document.getElementById("scnLayers").value){
			this.layerTableUpdate();
		}else{
			this.layerTableNameUpdate();
		}
		this.changed=true;
		return;
	}
	if(id=="scnLayers"){
		if(isNaN(document.getElementById("scnLayers").value))
		{
			alert("数値を指定してほしいのョ!と");
			return;
		}
		if(document.getElementById("scnLayers").value<=0)
		{
			alert("正の数がいいなぁ…");
			return;
		}
		if(document.getElementById("scnLayers").value>=26)
		{
if(! confirm("止めないけど…そんなにレイヤが多いとツライよ\nレイヤ名を自動でつけるのは「Z」までなので\nその先は自分でつけてね。"))
{
		document.getElementById("scnLayers").value=this.layers;//リセット
			return;
}
		}
//値を整数化しておく
		document.getElementById("scnLayers").value=Math.round(document.getElementById("scnLayers").value);

		document.getElementById("scnLayersLbls").value=this.mkNewLabels(document.getElementById("scnLayers").value).join();

		if(this.layers!=document.getElementById("scnLayers").value){
			this.layerTableUpdate();
		}else{
			this.layerTableNameUpdate();
		}
		this.changed=true;
		return;
	}

/*
	//layers=//現在のテーブル上のレイヤ数
	var chgLys=
	(document.getElementById("scnLayers").value!=this.layers)?
	true	:	false	;//変更か?
//確認
	if (chgLys){
		if(confirm("レイヤテーブルを再描画します。\nシートを 更新/作成 するまでは、実際のデータの変更は行われません。\n\t再描画しますか？"))
		{
//			レイヤ数変わってテーブル変更なのでテーブル出力
			this.layerTableUpdate();
		}else{
			document.getElementById("scnLayers").value=this.layers;//レイヤ数復帰
			this.layerTableUpdate();
		}
	}
*/

}
//
//ブランク関連変更
this.chgblk =function (name,number)
{
	if (name!="Lbps")
	{
//	methodの変更に合わせてposition変更
		switch (document.getElementById("scnLbmd_"+number).value)
		{
		case "expression1":
			document.getElementById("scnLbps_"+number).value="first";
			document.getElementById("scnLbps_"+number).disabled=true;
			break;
		case "file":
			document.getElementById("scnLbps_"+number).disabled=false;
			break;
		case "opacity":	;
		case "wipe":	;
		case "channelShift":	;
		default :
			document.getElementById("scnLbps_"+number).value="end";
			document.getElementById("scnLbps_"+number).disabled=true;
			break;
		}
	}
	this.changed=true;
}
//コンポフレームレート変更
this.chgFRATE =function (id)
{
	if(id!="scnSetFps"){
//	値を直接書き換えた
	document.getElementById("scnSetFps").value=
(this.Lists.aserch("framerate",document.getElementById("scnFramerate").value.toString())==-1)?
0 : this.Lists.aserch("framerate",document.getElementById("scnFramerate").value.toString());
	}else{
//	セレクタを使った
	document.getElementById("scnFramerate").value=
(document.getElementById("scnSetFps").value == 0)?
document.getElementById("scnFramerate").value : this.Lists["framerate"][document.getElementById("scnSetFps").value] ;
	}
nas.FRATE=document.getElementById("scnFramerate").value;
nas.RATE=this.Lists["framerate_name"][document.getElementById("scnSetFps").value];
//内部計算用なので親のレートは変更しない
	this.changed=true;
}
//省略時サイズ変更
this.chgSIZE =function (name,number)
{
	if(name!="scnLszT"){
//	値を直接書き換えた
with(document){
	var valset=[
	getElementById("scnLszX_"+number).value,
	getElementById("scnLszY_"+number).value,
	getElementById("scnLszA_"+number).value].join(",")}

	document.getElementById("scnLszT_"+number).value=
(this.Lists.aserch("SIZEs",valset)==-1)?
0 : this.Lists.aserch("SIZEs",valset);
	}else{
//	セレクタを使った

	var SIZE=this.Lists["SIZEs"][document.getElementById("scnLszT_"+number).value];
		if(SIZE !="custom")
		{	with(document){
	getElementById("scnLszX_"+number).value=SIZE.split(",")[0];
	getElementById("scnLszY_"+number).value=SIZE.split(",")[1];
	getElementById("scnLszA_"+number).value=SIZE.split(",")[2];
			}
		}
	}
	this.changed=true;
}
//新規作成のスイッチトグル
this.chgNewSheet =function (){
	var dist=(! document.getElementById("scnNewSheet").checked)? true:false;
	this.changed=true;

//新規作成から更新に戻した場合は、時間とレイヤ数を
//親オブジェクトから複写して上書き思ったが、どうせ暫定なのでとりあえずリセット
	if(dist) {this.getProp()}
}

//チェックボックストグル操作
this.chg =function (id)
{
	document.getElementById(id).checked=
	(document.getElementById(id).checked) ?
	false	:	true	;
		if (id=="newSheet") this.chgNewSheet();

	this.changed=true;
}
//テキストボックス書き換え
this.rewrite =function (id)
{
	if(dbg){dbgPut(id);}
	this.changed=true;
	return false;//フォーム送信抑止
}
//
this.mkNewLabels=function(lot){
//値の数だけラベルを作って表示
	var myLabels=new Array();
	for(var Lidx=0;Lidx<lot;Lidx++)
	{
		if((! document.getElementById("scnNewSheet").checked)&&(Lidx<XPS.xpsTracks.length-2)){
			myLabels.push(XPS.xpsTracks[Lidx+1].id);
		}else{
			if(Lidx<26){
				myLabels.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Lidx));
			}else{
					myLabels.push("");
			}
		}
	}
return myLabels;
}
//
this.mkLayerSheet =function (lot){
//	レイヤブラウザを作る
//	引数はレイヤの数
var body_='<table cellspacing=0 cellpadding=0 border=0 >';//

//タイトルつける
body_+='<tr><th colspan='+(lot+1)+'>詳細指定</th></tr>';//
//インデックスを配置
			body_+='<tr><th>ID:</th>';//
for (i=0;i<lot;i++){	body_+='<td>'+(i+1).toString()+'</td>'}
			body_+='</tr>';//

/*
var labelOptions=[
	"option","link","label","lot","blmtd","blpos",
	"size","sizeX","sizeY","aspect"
];
*/
var labelOptions=[
	"種別","リンク","親","ラベル","セル枚数","カラセル","配置",
	"プリセット","sizeX","sizeY","aspect"
];
var Labels=["Lopt_","Llnk_","Lpnt_","Llbl_","Llot_","Lbmd_","Lbps_","LszT_","LszX_","LszY_","LszA_"
];
	for (var opt=0;opt<labelOptions.length;opt++)
	{
if(dbg){dbgPut("check labelOptions : "+ opt)}
		body_+='<tr><th nowrap> '+labelOptions[opt]+' </th>';//
		for (i=0;i<lot;i++)
		{
			body_+='<td class=layerOption>';//

//idは、種別前置詞+レイヤ番号で

//		if(confirm("Stop? : [ "+opt.toString()+" ]"+Labels[opt])){return false};

	switch(Labels[opt])
{
case	"Lopt_":	body_+='<SELECT id="scnLopt_';	//レイヤオプション:0
		break;
case	"Llnk_":	body_+='<input type=text id="scnLlnk_';	//リンクパス:1
		break;
case	"Lpnt_":	body_+='<input type=text id="scnLpnt_';	//Parentパス:2
		break;
case	"Llbl_":	body_+='<input type=text id="scnLlbl_';	//ラベル:3
		break;
case	"Llot_":	body_+='<input type=text id="scnLlot_';	//ロット:4
		break;
case	"Lbmd_":	body_+='<SELECT id="scnLbmd_';	//カラセルメソッド:5
		break;
case	"Lbps_":	body_+='<SELECT id="scnLbps_';	//カラセル位置:6
		break;
case	"LszT_":	body_+='<SELECT id="scnLszT_';	//サイズまとめ:7
		break;
case	"LszX_":	body_+='<input type=text id="scnLszX_';	//サイズX:8
		break;
case	"LszY_":	body_+='<input type=text id="scnLszY_';	//サイズY:9
		break;
case	"LszA_":	body_+='<input type=text id="scnLszA_';	//アスペクト:10
		break;
default	:alert(opt);
}
//番号追加
	body_+=i.toString();


body_+='" onChange="myScenePref.chgProp(this.id)"';//共通
body_+=' style="text-align:center;width:100px"';//共通
	if (opt==1||opt==2||opt==3||opt==4||opt>7)
	{
body_+=' value=""'	;//text値はアトデ
body_+='>';
	}else{
body_+='>';

var optS=opt.toString(10);
	switch (optS)
	{
case	"0":
//オプション別/セレクタもの	レイヤオプション
body_+='<OPTION VALUE=still >still';//
body_+='<OPTION VALUE=timing selected>timing';//
body_+='<OPTION VALUE=dialog >dialog';//
body_+='<OPTION VALUE=camera >camera';//
body_+='<OPTION VALUE=sfx >effects';//
break;

case	"5":
//オプション別/セレクタもの	カラセルメソッド
body_+='<OPTION VALUE=file > ファイル ';//
body_+='<OPTION VALUE=opacity > 不透明度 ';//
body_+='<OPTION VALUE=wipe > リニアワイプ ';//
body_+='<OPTION VALUE=channelShift > チャンネルシフト';//
body_+='<OPTION VALUE=expression1 > 動画番号トラック';//
break;

case	"6":
//オプション別/セレクタもの	カラセル位置
body_+='<OPTION VALUE=build >--------';//
body_+='<OPTION VALUE=first >最初の絵を使う';//
body_+='<OPTION VALUE=end >最後の絵を使う';//
body_+='<OPTION VALUE=none >カラセルなし';//
break;

case	"7":
//オプション別/セレクタもの	サイズまとめ
body_+='<OPTION VALUE=0 >=CUSTOM=';//
body_+='<OPTION VALUE=1 >VGA(640x480,1.0)';//
body_+='<OPTION VALUE=2 >DV(720x480,0.9)';//
body_+='<OPTION VALUE=3 >D1(720x486,0.9)';//
body_+='<OPTION VALUE=4 >D1sq(720x540,1.0)';//
body_+='<OPTION VALUE=5 >D4(1440x1024,1.0)';//
body_+='<OPTION VALUE=6 >D16(2880x2048,1.0)';//
body_+='<OPTION VALUE=7 >std-200dpi(1772x1329,1.0)';//
body_+='<OPTION VALUE=8 >std-144dpi(1276x957,1.0)';//
body_+='<OPTION VALUE=9 >HD720(1280x720,1.0)';//
body_+='<OPTION VALUE=10 >HDTV(1980x1080,1.0)';//
body_+='<OPTION VALUE=11 >HDV(1440x1080,1.333)';//
break;
	}

body_+='</SELECT>';//セレクタものならば閉じる
}

body_+='<br></td>';//

		}
body_+='</tr>';//
	}
body_+='</table>';//

return body_;
}
//
this.openTable=function(){
	if(document.getElementById("scnCellTable").style.display=="inline"){

		document.getElementById("scnCellTable").style.display="none";
	}else{
		document.getElementById("scnCellTable").style.display="inline";
	}
}
//
this.layerTableNameUpdate=function(){
		var myNames=document.getElementById("scnLayersLbls").value.split(",");
		for(var i=0;i<this.layers;i++){
			document.getElementById("scnLlbl_"+i).value=myNames[i];
		}

}
this.layerTableUpdate =function(){
		document.getElementById("scnLayerBrouser").innerHTML=
		this.mkLayerSheet(document.getElementById("scnLayers").value);
		this.getLayerProp();
		this.layers=1*document.getElementById("scnLayers").value;
//		this.layerTableNameUpdate();
}

//各種設定表示初期化
this.getProp =function ()
{
document.getElementById("scnNewSheet").checked=false;//新規フラグダウン
//レイヤ数取得
	if (this.layers != (XPS.xpsTracks.length-2)){
		this.layers=1*XPS.xpsTracks.length-2;//バックアップとる
		document.getElementById("scnLayers").value=	this.layers;
//ラベルウェルを書き換え
		document.getElementById("scnLayersLbls").value=this.mkNewLabels(this.layers).join();
//レイヤ数変わってテーブル変更なのでテーブル出力
		document.getElementById("scnLayerBrouser").innerHTML=
		this.mkLayerSheet(document.getElementById("scnLayers").value);

	}else{
		document.getElementById("scnLayers").value=this.layers;
	}

//変換不要パラメータ
	var names=[
"mapfile","title","subtitle","opus","scene","cut","framerate",
"create_time","create_user","update_time","update_user","memo"
];
//
	var ids=[
"scnMapfile","scnTitle","scnSubtitle","scnOpus","scnScene","scnCut","scnFramerate",
"scnCreate_time","scnCreate_user","scnUpdate_time","scnUpdate_user","scnMemo"
];
//
	for (var i=0;i<names.length;i++){
		document.getElementById(ids[i]).value=
		XPS[names[i]];
	}

	var names=["create_time","create_user","update_time"];
	var ids=["scnCreate_time","scnCreate_user","scnUpdate_time"];
	for (var i=0;i<names.length;i++){
		document.getElementById(ids[i]+"TD").innerHTML=
		(document.getElementById(ids[i]).value=="")?"<br>":
		xUI.trTd(document.getElementById(ids[i]).value);
	}

//取得したシートのフレームレートをnasのレートに代入する
	nas.FRATE=document.getElementById("scnFramerate").value;
//nas側でメソッドにすべきダ
//	現在の時間を取得
		document.getElementById("scnTime").value=
		nas.Frm2FCT(XPS.time(),3,0);
		document.getElementById("scnTrin").value=
		XPS["trin"][1];
		document.getElementById("scnTrinT").value=
		nas.Frm2FCT(XPS["trin"][0],3,0);
		document.getElementById("scnTrot").value=
		XPS["trout"][1];
		document.getElementById("scnTrotT").value=
		nas.Frm2FCT(XPS["trout"][0],3,0);

//		document.getElementById("scn").value=
//		document.getElementById("scnLayers").value=

//	if(document.getElementById("scnCellTable").style.display!="none"){	};
		this.getLayerProp();
	this.changed=false;
}
this.getLayerProp =function (){
//レイヤ情報テーブルに値をセット
	var myLabels=document.getElementById("scnLayersLbls").value.split(",");

	if (this.layers>XPS.xpsTracks.length-2){this.layers=XPS.tracks.length-2}
	for (i=0;i<document.getElementById("scnLayers").value;i++)
	{
		if (i<this.layers &&! document.getElementById("scnNewSheet").checked)
		{
			document.getElementById("scnLopt_"+i).value=
			XPS["xpsTracks"][i+1]["option"];
//			document.getElementById("scnLopt_"+i).disabled=true;

			document.getElementById("scnLlnk_"+i).value=
			XPS["xpsTracks"][i+1]["link"];
//			document.getElementById("scnLlnk_"+i).disabled=true;

			document.getElementById("scnLpnt_"+i).value=
			XPS["xpsTracks"][i+1]["parent"];
//			document.getElementById("scnLpnt_"+i).disabled=true;

			document.getElementById("scnLlbl_"+i).value=
			XPS["xpsTracks"][i+1]["id"];

			document.getElementById("scnLlot_"+i).value=
			XPS["xpsTracks"][i+1]["lot"];

			document.getElementById("scnLszX_"+i).value=
			XPS["xpsTracks"][i+1]["sizeX"];
			document.getElementById("scnLszY_"+i).value=
			XPS["xpsTracks"][i+1]["sizeY"];
			document.getElementById("scnLszA_"+i).value=
			XPS["xpsTracks"][i+1]["aspect"];

			document.getElementById("scnLbmd_"+i).value=
			XPS["xpsTracks"][i+1]["blmtd"];
			document.getElementById("scnLbps_"+i).value=
			XPS["xpsTracks"][i+1]["blpos"];

		}else{

			document.getElementById("scnLopt_"+i).value=
			"timing";
//			document.getElementById("scnLopt_"+i).disabled=true;

			document.getElementById("scnLlnk_"+i).value=
			".";
//			document.getElementById("scnLpnt_"+i).disabled=true;

			document.getElementById("scnLpnt_"+i).value=
			".";
//			document.getElementById("scnLpnt_"+i).disabled=true;

			document.getElementById("scnLlbl_"+i).value=myLabels[i];

			document.getElementById("scnLlot_"+i).value=
			"=AUTO=";

			document.getElementById("scnLszX_"+i).value=
			xUI.dfX;

			document.getElementById("scnLszY_"+i).value=
			xUI.dfY;

			document.getElementById("scnLszA_"+i).value=
			xUI.dfA;


			document.getElementById("scnLbmd_"+i).value=
			xUI.blmtd;

			document.getElementById("scnLbps_"+i).value=
			xUI.blpos;
		}
				this.chgSIZE("LszA",i.toString());
				this.chgblk("Lbmd",i.toString());
	}
}
//バルクシートの設定
this.newProp =function ()
{
	var msg="デフォルトの値で新規にシートを設定します。\n\tよろしいですか?";
if (confirm(msg)){
	document.getElementById("scnNewSheet").checked=true;//新規チェック入れる

//レイヤ数デフォルトに設定
		document.getElementById("scnLayers").value=SheetLayers;
//レイヤ名表示更新
		document.getElementById("scnLayersLbls").value=this.mkNewLabels(SheetLayers).join();
		this.layers=XPS.xpsTracks.length-2;
//レイヤテーブル出力
		document.getElementById("scnLayerBrouser").innerHTML=
		this.mkLayerSheet(document.getElementById("scnLayers").value);
//デフォルトパラメータを設定
Now =new Date();
	document.getElementById("scnMapfile").value="";
	document.getElementById("scnTitle").value=myTitle;
	document.getElementById("scnSubtitle").value=mySubTitle;
	document.getElementById("scnOpus").value=myOpus;
	document.getElementById("scnScene").value=myScene;
	document.getElementById("scnCut").value=myCut;
	document.getElementById("scnFramerate").value=myFrameRate;

	document.getElementById("scnCreate_time").value=Now.toNASString();
	document.getElementById("scnCreate_user").value=myName;
	document.getElementById("scnUpdate_user").value=myName;
	document.getElementById("scnUpdate_time").value="";

	document.getElementById("scnMemo").value="";
//	document.getElementById("scn").value=;
//	document.getElementById("").value=;
//	document.getElementById("").value=;
	var names=["scnCreate_time","scnCreate_user","scnUpdate_time"];
	for (var i=0;i<names.length;i++){
		name=names[i];
		document.getElementById(name+"TD").innerHTML=
		(document.getElementById(name).value=="")?"<br>":
		xUI.trTd(document.getElementById(name).value);
	}


//取得したシートのフレームレートをnasのレートに代入する
	nas.FRATE=document.getElementById("scnFramerate").value;
//nas側でメソッドにすべきダ
//	現在の時間を取得
		document.getElementById("scnTime").value=Sheet;
		document.getElementById("scnTrin").value="trin";
		document.getElementById("scnTrinT").value="00+00.";
		document.getElementById("scnTrot").value="trout";
		document.getElementById("scnTrotT").value="00+00.";

	this.layerTableUpdate();

	this.changed=true;

}else{
	return;
}
}
//各種設定表示更新
this.putProp =function ()
{
//	現在のドキュメントは未保存か？
	if(! xUI.checkStored()){return}
//レイヤテーブルを自動更新で処理続行
//		this.layerTableUpdate();

//	現在の時間からカット継続時間を一時的に生成
//	framerate?
	var duration=(
nas.FCT2Frm(document.getElementById("scnTrinT").value)+
nas.FCT2Frm(document.getElementById("scnTrotT").value))/2+
nas.FCT2Frm(document.getElementById("scnTime").value);
	var oldduration=XPS.duration();
	var durationUp=(duration>oldduration)? true : false ;
//	レイヤ数の変更を一時変数に取得
	var newWidth=this.layers+2;//新幅
	var oldWidth=XPS.xpsTracks.length;//もとの長さを控える
	var widthUp =(newWidth>oldWidth)?true:false;//増えたか?
//	新規作成ならば細かいチェックは不要
	if(document.getElementById("scnNewSheet").checked){
	var msg="指定の内容で新規シートを作成します。\n現在の編集内容は、破棄されます。\n\n実行してよろしいですか?"
	}else{
//	現内容の変更なので一応確認
//	レイヤ数の変更確認
	var msg="";
		if(newWidth!=oldWidth){
			msg +="レイヤ数が変更されます。\n";
			if (!widthUp)
			msg +="\t消去されるレイヤの内容は破棄されます。\n";
		}
//	カット尺更新確認
		if(duration!=oldduration){
			msg+="カットの尺が変更されます。\n";
			if (!durationUp)
			msg +="\t消去されるフレームの内容は破棄されます。\n";
		}
//
		msg +="\n実行してよろしいですか。?";
	}
//確認
	if(confirm(msg)){
	if (
		(document.getElementById("scnNewSheet").checked)	||
		(newWidth!=oldWidth)	||
		(duration!=oldduration)
	)
	{ var changeSheet=true }else{ var changeSheet=false }
//	実際のデータ更新


//値の変換不要なパラメータをまとめて更新
	var names=[
"mapfile","title","subtitle","opus","scene","cut","update_user","memo"
	];//
	var ids=[
"scnMapfile","scnTitle","scnSubtitle","scnOpus","scnScene","scnCut","scnUpdate_user","scnMemo"
	];//
	for (var i=0;i<names.length;i++){
		XPS[names[i]]=document.getElementById(ids[i]).value;
	}

// //////新規作成なら現在のシート内容をフラッシュ
		if (document.getElementById("scnNewSheet").checked){xUI.flush();}
// /////////
//レイヤ数を設定
	this.layers=1*document.getElementById("scnLayers").value;

if(dbg){
dbgPut("元タイムシートは : "+oldWidth+" 列/ "+oldduration+"コマ\n 新タイムシートは : "+newWidth+" 列/ "+duration+"コマ です。\n ");
}
//継続時間とレイヤ数で配列を更新
	xUI.reInitBody(newWidth,duration);

//		プロパティの更新
		XPS["trin"]=
[nas.FCT2Frm(document.getElementById("scnTrinT").value),
document.getElementById("scnTrin").value
];
		XPS["trout"]=
[nas.FCT2Frm(document.getElementById("scnTrotT").value),
document.getElementById("scnTrot").value
];

//本体シートのフレームレート更新
	XPS.framerate=nas.FRATE;
	XPS.rate=nas.RATE;
//	親ウインドウのnas.FRATEも更新(同期)
	nas.FRATE=nas.FRATE;
	nas.RATE=nas.RATE;
//書き直しに必要なUIのプロパティを再設定

	xUI.PageLength=
	xUI.SheetLength*Math.ceil(XPS.framerate);//1ページのコマ数

//undo関連
//	xUI.flushUndoBuf();
//	sync("undo");sync("redo");

//	レイヤプロパティ更新
	this.putLayerProp();

//	尺または、レイヤ数の変更があるか、新規作成ならばシートを初期化

	if (changeSheet){
	sWitchPanel("Prog");

//カーソル位置初期化
	xUI.selectCell("1_0");

		nas_Rmp_Init();
//AIR環境の場合カレントファイルを初期化する
	if(isAIR){fileBox.currentFile=null;};//忘れていたとほほ
	}else{
//	それ以外はシート情報表示のみを更新
		sync("info_");
		sync("lbl");
	}
//タイトル初期化・保存フラグ強制アクティブ
	xUI.setStored("force");
	sync();
//パネルを再初期化
	this.getProp();
	this.chgFRATE();
	this.changed=false;
		this.close();
	}else{alert("処理を中断します。")}
}
//更新操作終了
this.putLayerProp =function ()
{
//テーブルから読み出した値をXPSにセット
	var oldlayers=XPS.xpsTracks.length-2;//もとの長さを控える

	var widthUp=(oldlayers<this.layers)?true:false;
	for (i=0;i<this.layers;i++)
	{
		if (i>=oldlayers){
			XPS.xpsTracks.insertTrack(new XpsTimelineTrack(
				"ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(i),
				"timing",
				XPS.xpsTracks,
				XPS.xpsTracks.duration,
				i+1
			));
			XPS["xpsTracks"][i+1]["lot"]= "=AUTO=";
			XPS["xpsTracks"][i+1]["sizeX"]= xUI.dfX;
			XPS["xpsTracks"][i+1]["sizeY"]= xUI.dfY;
			XPS["xpsTracks"][i+1]["aspect"]= xUI.dfA;
			XPS["xpsTracks"][i+1]["blmtd"]= xUI.blmtd;
			XPS["xpsTracks"][i+1]["blpos"]= xUI.blpos;
		}else{
			XPS["xpsTracks"][i+1]["option"]= document.getElementById("scnLopt_"+i).value;
			XPS["xpsTracks"][i+1]["link"]= document.getElementById("scnLlnk_"+i).value;
			XPS["xpsTracks"][i+1]["id"]= document.getElementById("scnLlbl_"+i).value;
			XPS["xpsTracks"][i+1]["lot"]= document.getElementById("scnLlot_"+i).value;
			XPS["xpsTracks"][i+1]["sizeX"]= document.getElementById("scnLszX_"+i).value;
			XPS["xpsTracks"][i+1]["sizeY"]= document.getElementById("scnLszY_"+i).value;
			XPS["xpsTracks"][i+1]["aspect"]= document.getElementById("scnLszA_"+i).value;
			XPS["xpsTracks"][i+1]["blmtd"]= document.getElementById("scnLbmd_"+i).value;
			XPS["xpsTracks"][i+1]["blpos"]= document.getElementById("scnLbps_"+i).value;
		}
	}
	XPS.xpsTracks.renumber();
}
//プロシジャ部分抜きだし
//パネル初期化
this.init =function ()
{
	this.Lists = PropLists;//現状だとオブジェクト参照
	this.getProp();
	this.chgFRATE();
	this.changed=false;
}
/** パネルを開く
 *すでに開いていたら NOP リターン
 */
this.open=function(){
		if(document.getElementById("optionPanelScn").style.display=="inline"){
			return false;
		}else{
			sWitchPanel("Scn");
			this.init();
		}
	return null;
}
//パネルを閉じる

this.close=function (){
	//変更フラグ立っていれば確認して操作反映
	if(this.changed){if(confirm("設定が変更されています。反映させますか?")){this.putProp();}};
	//パネル閉じる
		sWitchPanel("Scn")
}

};
//ScenePrefオブジェクト終了


