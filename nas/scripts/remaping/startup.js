/*
	ユーザエージェントを確認してフラグを返す
	判定基準はユーザエージェント文字列
*/
isAIR=false; //AdobeAIR純正環境
function ckUA(){
//許可リスト
//ここにユーザエージェント文字列を記載したエージェントは拒否リストに載らないかぎりフラグを立てて返す。エントリは、ユーザエージェント文字列すべて。
agentsAllow=['Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)','Mozilla/5.0 (Macintosh; U; PPC Mac OS X; ja-jp) AppleWebKit/412 (KHTML, like Gecko) Safari/412','void'];
//拒否リスト 最優先に処理
agentsDeny=['Mozilla/4.0 (compatible; MSIE 5.23; Mac_PowerPC)','void'];
//標準的なエージェントとバージョン 指定値以上を許可
	var ckvs=new Array();
		ckvs['AIR']=1.1;
		ckvs['MSIE']=5.5;
		ckvs['Opera']=10;
		ckvs['Safari']=126;
		ckvs['NN']=6.0;
		ckvs['Mozilla']=5.0;//その他のモジラ
	var agentFlag=-1;//初期値 判別不能時に初期値を返す
	var uaName = navigator.userAgent;//ユーザエージェント文字列を取得
	var uaVer = '';
	if (uaName.indexOf("AdobeAIR") > -1) {
		uaVer = uaName.match(/(AdobeAIR\/)([0-9\.]*)/)[2];
		uaName = "AIR";//AIRです
//AIR 環境が 純正/CSX(Configurator)/CEP　三種あるので判定が必要になる　とりあえずブロック
		if(window.runtime){
		  isAIR=true;
		}
	}else{
	if (uaName.indexOf("Safari") > -1) {
		uaVer = uaName.match(/(Safari\/)([0-9\.]*)/)[2];
//		ver = new Array();
//		ver["85"] = "1.0";ver["100"] = "1.1";
//		ver["125"] = "1.2";ver["312"] = "1.5";ver["412"] = "2.0";
//		n = uaVer.split(".")[0];uaVer = ver[n];
		uaVer = (uaVer.split("\.")[0]*1)+(uaVer.split("\.")[1]/10);
		uaName = "Safari";//サファリらしい
	}else{
		if (uaName.indexOf("Opera") > -1) {
		uaVer = uaName.match(/(Opera[\ \/])([0-9\.]*)/)[2];
		uaName = "Opera";//オペラである
		}else{
			if (uaName.indexOf("MSIE") > -1) {
		uaVer = uaName.match(/(MSIE[\ \/])([0-9\.]*)/)[2];
		uaName = 'MSIE';
			}else{
				if (uaName.indexOf("Netscape") > -1) {
		uaVer = uaName.match(/(Netscape6?[\ \/])([0-9\.]*)/)[2];
		uaVer = (uaVer.split("\.")[0]*1)+(uaVer.split("\.")[1]/10);
		uaName = "NN";//NSにしてみる。
				}else{
			if (uaName.indexOf("Mozilla") > -1) {
		uaVer = uaName.match(/(Mozilla[\ \/])([0-9\.]*)/)[2];
		uaName = "Mozilla";//NSでないMozillaにしてみる。
			}else{
		uaVer = 'unKnown';
		uaName = 'unKnown';//知らないブラウザである。
		}}}}}}
	if (! uaName.match(/unKnown/)){
//ブラウザ名とバージョンから判定をとる
		if (uaVer >=ckvs[uaName]){
			agentFlag=1;//大丈夫
		}else{
			agentFlag=0;//ダメダメ
		}
	}
//	確認ブラウザか?
	for (var aGent=0;aGent<agentsAllow.length;aGent++) {
	if (agentsAllow[aGent] == navigator.userAgent){agentFlag=1;break;}
	}
//	確認否定ブラウザか?
	for (var aGent=0;aGent<agentsDeny.length;aGent++) {
	if (agentsDeny[aGent] == navigator.userAgent){agentFlag=0;break;}
	}
return [agentFlag,uaName,uaVer];
}
  //--キーeventをセットする

//  document.onkeydown = nas_InputD ;
//  document.onkeypress = nas_InputP ;
//  if(document.layers)
//                document.captureEvents(Event.KEYPRESS)
//  self.focus()
//試験関数
function eCho(){return "indeECHOOOOOO!";}
/*
りまぴん スタートアップ
*/
function nas_Rmp_Startup0(){
alert("startup")
//ブラウザとプラットフォームを識別
	if (ckUA()[0]) {
//機種判定通過時の初期化処理
//		alert(ckUA());return false;
//クッキーがあれば読み込んでウィンドウデータを取得する
if (document.cookie)
{
	alert("cookie:"+ breakValue(document.cookie,"reMaping"));
};
if(navigator.userAgent.match(/AdobeAIR/)){
//AIR環境の場合のみウィンドウオブジェクトを上書き
//	var defaultHost = new HTMLHost(true);
	window.location="./template/remaping.html";
}


window.name="REMAPING";//自身のウインドウに名前をつける
var myLocation=window.location.href.replace(/(remaping[0-9]*\/)(index\.html.*)?$/,"$1template\/remaping.html");
if(navigator.userAgent.match(/AdobeAIR/)){
	myLocation="app:/template/index.html";
	window.location.href=myLocation;
//	defaultHost.
}else{
if(dbg) alert(myLocation);
	window.location.href=myLocation;
}
if(dbg) alert(window.location.href);
	return ;

	}else{
//	機種不適合のお詫び
	var msg="申し訳ございません。\r\nアプリケーションは、現在の環境では動作いたしません。\r\nブラウザを変更して試してみてください。\n\n";
		alert(msg);return false;
	}
};

