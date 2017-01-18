/**
 * nas_common.js
 * 共用可能スクリプト部分
 *
 * --- おことわり
 *
 * このプログラムの著作権は「ねこまたや」にあります。
 *
 * あなたは、このプログラムのこの著作権表示を改変しないかぎり
 * 自由にプログラムの使用・複製・再配布などを行うことができます。
 *
 * あなたは、このプログラムを自己の目的にしたがって改造することができます。
 * その場合、このプログラムを改造したものであることを明記して、この著作権表示を
 * 添付するように努めてください。
 *
 * このプログラムを使うも使わないもあなたの自由なのです。
 *
 * 作者はこのプログラムを使用したことによって起きたいかなる
 * 不利益に対しても責任を負いません。
 * あなたは、あなたの判断と責任においてこのプログラムを使用するのです。
 *
 * なんか、困ったことがあったら以下で連絡してもらえると何とかなるかもしれません。
 * http://www.nekomataya.info/
 * mailto:kiyo@nekomataya.info
 *
 * そんな感じです。
 *
 * 追伸
 * このプログラムは、汎用のモジュール群です。
 * 組み込みでつかえるかどうかは作者の作業時間とセンスに左右されます。
 * nas汎用オブジェクトとメソッドで構成することに決定。
 * 呼び出しかたが変わるのでこのバージョン以降互換性無し。
 *
 * 2015 07-11
 * 基礎オブジェクトの大幅変更
 * 以降のライブラリは基本的に後方互換性を失うので注意
 *
 * 2016 01-29
 * 懸案だったベクトル関連の演算ライブラリを少し整理してこのモジュールに組み込む
 * 関連の関数は全てnas.配下に組み入れるので、使用の際はコードの置きかえまたはエイリアスからのアクセスが必要
 * 移行した関数
 * preformvector add sub mul div clamp dot cross length normalize
 * degreesToRadians radiansToDegrees
 *
 * =======    現在のメソッド一覧 ======= 2016/01/29
 *
 * nas.dt2sc(z距離)
 * z軸距離(ピクセル)からスケールを求める
 *
 * nas.sc2dt(スケール)
 * スケールからz軸距離を求める。
 *
 * nas.fl2fr(撮影フレーム)
 * 撮影フレームからレタス撮影フレームを求める。
 *
 * nas.fr2fl(レタス撮影フレーム)
 * レタスフレームから撮影フレームを求める。
 *
 * nas.fl2sc(撮影フレーム)
 * 撮影フレームからスケールを求める。
 * nas.fr2sc(レタス撮影フレーム)
 * レタス撮影フレームからスケールを求める。
 * nas.sc2fl(スケール)
 * スケールから撮影フレームを求める。
 * nas.sc2fr(スケール)
 * スケールからレタス撮影フレームを求める。
 * nas.kac(開始寸法,終了寸法,助変数)
 * 開始寸法・終了寸法と助変数を与えて、対応する寸法を求める。
 * nas.cak(開始寸法,終了寸法,拡大率)
 * 開始寸法・終了寸法と任意寸法を与えて、寸法に対応する助変数を求める。
 *
 * nas.Zf(数値,桁数)
 * 数値を指定桁数のゼロで埋める。
 *
 * nas.ms2fr(ミリ秒数)
 * ミリ秒数から、フレーム数を求める。
 * nas.fr2ms(フレーム数)
 * フレーム数から、ミリ秒数を求める。
 * nas.ms2FCT(ミリ秒数,カウンタタイプ,オリジネーション[,フレームレート])
 * ミリ秒数から、カウンタ文字列への変換。
 * カウンタータイプ・オリジネーション・フレームレートを指定
 * nas.FCT2ms(カウンタ文字列)
 * カウンタ文字列から、ミリ秒数への変換。
 * nas.Frm2FCT(フレーム数,カウンタタイプ,オリジネーション[,フレームレート])
 * フレーム数(0オリジン)から、カウンタ文字列への変換
 * カウンタータイプ・オリジネーション・フレームレートを指定
 * nas.FCT2Frm(カウンタ文字列[,フレームレート])
 * カウンタ文字列から、フレーム数(0オリジン)への変換
 * フレームレート省略可能
 * nas.docodeUnit(入力値,変換単位)
 * 入力値の単位を変換した数値を戻す(mm,cm,px,pt,in)
 *
 * ==== 色彩関連(web用)
 * nas.colorStr2Ary(カラー文字列)
 * WEB色指定用の文字列を3次元の配列にして返す
 * nas.colorAry2Str([配列])
 * 配列で与えられたRGB値を16進文字列で返す。
 * ==== ベクトル関連
 * nas.vec2azi(ベクトル,[フォーマット])
 * 与えられたベクトルの方位角を返す。文字フォーマットも可
 * ==== 行列計算
 * 行列演算関数の行列は配列の組み合わせでなく、要素のストリーム文字列である。
 *
 * nas.showMatrix(ラベル,行列文字列,行数,列数)
 * 与えられた行列文字列に改行を加えて文字列で返す。
 * nas.mDeterminant(行列文字列)
 * 行列式(和)を返す。
 * nas.multiMatrix(行列文字列1,行列文字列2)
 * 行列積を求める。
 * nas.mInverse(行列文字列)
 * 逆行列を求める。
 * nas.transMatrix(行列文字列)
 * 行列を転置する。
 *
 * ==== 文字列操作(Stringクラスにオーバーライドするかも知れないので暫定)
 * nas.biteCount(文字列)
 * 文字列のバイト数を返す。
 * nas.biteClip(文字列,制限バイト数)
 * 文字列を指定バイト数以下にクリップ
 * nas.incrStr(文字列,step)
 * 文字列の末尾の番号部分を１くり上げて返す
 * nas.normalizeStr(文字列)
 * 文字列を半角数値で比較できるようにフォーマットして返す
 * ==== プロパティ操作
 * nas.propCount(オブジェクト,リストスイッチ)
 * オブジェクトのプロパティをカウントする
 * リストスイッチでプロパティ名の配列を返す
 * ==== 単位換算
 * nas.decodeUnit(入力値,変換単位)
 * 単位つきの文字列値を数値にして返すメソッド
 * 単位は mm cm in pt px
 *
 * ========    既存オブジェクトにオーバーライドするメソッド
 * "yy/mm/dd hh:mm:ss" 形式を拡張
 * Date.toNASString()
 * ;returns String
 * Date.setNASString("yy/mm/dd hh:mm:ss")
 * ; returns object
 *
 *
 * @fileoverview nas アニメーション一般ライブラリ
 * AE等のAdobe Script 環境で使用可能な関数およびプロパティをサポートします
 * 2016/01/29
 */

myFilename = ('nas_common.js');
myFilerevision = ('2.0');

/**
 * @description 実行環境の判定
 *	isAIR nas.isAIR等を参照していた部分を全面的に環境プロパティ appHostで書きなおす
 *  appHost はオブジェクトで作成してプラットフォーム及びバージョンを識別できる情報を与える HTML関連コードからこちらへ移動済み
 
 *  @class AppHost オブジェクト
 *	AppHost.ESTK　bool
 *	AppHost.platform string
 *	AppHost.version string
 *	AppHost.os    string
*/
function AppHost()
{
    this.ESTK;
	this.platform;
	this.version;
	this.os;
}

AppHost.prototype.init=function(){
    //AdobeESTKの判定
    this.ESTK=(typeof app =="undefined")? false:true;
    
	var uaName=navigator.userAgent;
	if(window.__adobe_cep__){
	//CEP
		this.platform="CEP";
		this.version=navigator.userAgent.match(/(\sChrome\/)([0-9\.]*)/)[2];;
	}else{
	 if(navigator.userAgent.indexOf("AdobeAIR") > -1){
	//AIR(フラッシュ)系
	  if (window.runtime){
		this.platform="AIR";
		this.version=navigator.userAgent.match(/(AdobeAIR\/)([0-9\.]*)/)[2];
		
	  }else{
		this.platform="CSX";
		this.version=navigator.userAgent.match(/(AdobeAIR\/)([0-9\.]*)/)[2];
	  }
	 }else{
	//その他普通のブラウザ
	if (uaName.indexOf("Chrome") > -1) {
		uaVer = uaName.match(/(Chrome\/)([0-9\.]*)/)[2];
		this.version = (uaVer.split("\.")[0]*1);
		this.platform = "Chrome";//chromeらしい
	}else{
	  if (uaName.indexOf("Safari") > -1) {
		uaVer = uaName.match(/(Safari\/)([0-9\.]*)/)[2];
		this.version = (uaVer.split("\.")[0]*1)+(uaVer.split("\.")[1]/10);
		this.platform = "Safari";//サファリらしい
	  }else{
	  if (uaName.indexOf("Opera") > -1) {
		this.version = uaName.match(/(Opera[\ \/])([0-9\.]*)/)[2];
		this.platform = "Opera";//オペラである
	    }else{
	    if (uaName.indexOf("MSIE") > -1) {
		this.version = uaName.match(/(MSIE[\ \/])([0-9\.]*)/)[2];
		this.platform = 'MSIE';
	      }else{
	      if (uaName.indexOf("Netscape") > -1) {
		uaVer = uaName.match(/(Netscape6?[\ \/])([0-9\.]*)/)[2];
		this.version = (uaVer.split("\.")[0]*1)+(uaVer.split("\.")[1]/10);
		this.platform = "NN";//NSにしてみる。
	        }else{
	        if (uaName.indexOf("Mozilla") > -1) {
		this.version = uaName.match(/(Mozilla[\ \/])([0-9\.]*)/)[2];
		this.platform = "Mozilla";//NSでないMozillaにしてみる。
		  }else{
		this.version = 'unKnown';
		this.platform = 'unKnown';//知らないブラウザである。
		}}}}}}
/*
		this.platform="other";
		this.version="unknown";
*/
	 }
	}
	//OSもチェックしておく
		this.os = "Other";//初期値として設定
	//判定の幅がでかすぎるひとまずは Mac Win Other で
	if ((window.navigator.platform).indexOf("Mac") > -1) {
		this.os = "Mac";//Mac OS X
	}else{
	 if ((window.navigator.platform).indexOf("Win") > -1) {
		this.os = "Win";//Windows
	 }
	}
}

var appHost=new AppHost();
	appHost.init();

// if (navigator.userAgent.indexOf("AdobeAIR") > -1) {isAIR=true}
//AIR 環境が 純正/CSX(Configurator)/CEP 三種あるので判定が必要になる
		if(window.runtime){
		  isAIR=true;
		}else{
		 isADX = 2;//初期値CEP
		  try{isADX=(window.__adobe_cep__)? 2:1;}catch(er){isADX = 0;}
		}


/**
 * 動作プラットフォームを判別してプラットフォーム別の初期化を行う
 */
if (typeof nas == 'undefined') {
    nas = {};
}
try {
    /**
     * appオブジェクトを確認してAdobeScript環境を判定
     */
    if (app) {
        /**
         * Adobe Scripts
         * @type {boolean}
         */
        nas.isAdobe = true;
        nas.Version["common"] = "common:" + myFilename + " :" + myFilerevision;
        try {
            if (app.isProfessionalVersion) {
                app.name = "Adobe AfterEffects";
            }
        } catch (ERR) {
        }
    } else {
        nas.isAdobe = false;
    }
} catch (ERR) {
    /**
     * app オブジェクトが無いのでAIRまたはブラウザ
     * @type {boolean}
     */
//var	nas	=new Object();//nas オブジェクトとの生成はこの時点より前に送る

    nas.isAdobe = false;

    try {
        /**
         * Folderオブジェクトを参照してAIR環境の場合nas.baseLocationを設定 psAxe用
         * @type {Folder}
         */
        nas.baseLocation = new Folder(Folder.userData.fullName + "/nas");//(Folder.current.name=="Startup")? new Folder("../nas/"):Folder.current;
    } catch (err) {
        nas.baseLocation = "";
    }
    var MSIE = navigator.userAgent.indexOf("MSIE") != -1;
    var Safari = navigator.userAgent.indexOf("Safari") != -1;
    var Firefox = navigator.userAgent.indexOf("Firefox") != -1;
}

/**
 * xUIオブジェクトはHTMLライブラリにおけるUI管理オブジェクトなのでHTML環境外ではfalseで初期化して判定する
 * HTML環境下であっても依存機能が初期化完了前にアクセスすることを抑制するためにfalseであらかじめ初期化するのを標準メソッドとする
 * @type {boolean}
 */
xUI = false;


/**
 *    @desc nas Lib base Object
 */
/**
 *@fileoverview	nas配下に基礎オブジェクト拡張
 *
 *基礎オブジェクト群は、基底プロパティの記述に使用するので最終的には従来のnas_common.jsよりも先にロードする必要がある。
 *又は基礎オブジェクトとしてnas_common.jsに編入
 *
 *現在はnas_common.jsよりも後にロードされている
 *
 *デバッグ終了後は、ロード順位が入れ替わるので注意
 *相互依存を考慮してマージ
 *または、基底プロパティをオブジェクト化しないメソッドを考慮すること 24-06 2016
 *
 *
 *単位付きカプセル化オブジェクトでは、演算の際に期待する値を確実に得るためには Object.as(Unit)で明示的に単位を指定すること
 *
 */
/**
    ユーザ情報オブジェクト nas.UserInfo
    表示名と識別用メールアドレスを持つ
var currentUser = new nas.UnserInfo("handle:user@example.co.jp")
var currentUser = new nas.UnserInfo("handle")
var currentUser = new nas.UnserInfo("user@example.co.jp")
    ドキュメント上の記録形式は以下

    displayName:uid@domain
例 ねこまたや:user@example.com

初期化引数に':'が含まれない場合は、メールアドレスか否かを判定して
メールアドレスなら uid部をハンドルとして使用
それ以外の場合は、全体をハンドルにしてメールアドレスをnullで初期化する
一致比較は、メールアドレスで行う　null,空白は いずれの場合も一致なしに
 */
nas.UserInfo = function UserInfo(nameDescription){
    if (typeof nameDescription == 'undefined'){nameDescription = 'handle:uid@example.com'}
    if (nameDescription instanceof nas.UserInfo){
            this.handle = nameDescription.handle;
            this.email  = nameDescription.email;
    } else if (nameDescription.indexOf(':') < 0){
//セパレータがない
        if(nameDescription.indexOf('@') < 1){
            this.handle = nameDescription;//メールアドレスでないと思われるので引数全体をハンドルにする
            this.email  = null;
        }else{
            this.handle = nameDescription.split('@')[0];//メールアドレスっぽいので＠から前をハンドルにする
            this.email  = nameDescription;
        }
    } else {
         var infoArray  = nameDescription.split(':');
        this.handle     = infoArray[0];
        this.email      = infoArray[1];
    }
    if(String(this.email).match(/\s/)){ this.email.replace(/\s/g,'') };
}
nas.UserInfo.prototype.toString = function(opt){
    if(! opt) opt = 0;
    switch (opt){
        case "email":
            return this.email; break;
        case "handle":
            return this.handle; break;
        default :
            return [this.handle,this.email].join(':')
    }
}
nas.UserInfo.prototype.sameAs = function(myName){
    if(!(myName instanceof nas.UserInfo)){ myName = new nas.UserInfo(myName)};
    return ((this.email)&&(this.email==myName.email))? true:false;
}

//UnitValuで利用可能な単位 px/pixels を与えるとその時点での基底解像度で処理してpointに換算、pxとしての保存は行わない
nas.UNITRegex=new RegExp('^(in|inches|mm|millimeters|cm|centimeters|pt|picas|points|mp|millipoints)$','i');

/*=============================================================================================再利用メソッド*/
//不正単位系の処理を追加　07-04 2016
/**
	common method
*/
nas.UNITString	=function(){return ([this.value,this.type]).join(' ');};
nas.UNITValue	=function(){return this.value;};
nas.UNITAs	=function(myUnit){return nas.decodeUnit(this.toString(),myUnit)};
nas.UNITConvert	=function(myUnit){this.value=nas.decodeUnit(this.toString(),myUnit);this.type=myUnit;return this;};

nas.ANGLEAs	=function(myUnit){
		var targetUnit=(myUnit.match(/^(d|degrees|°|度|)$/))?"degrees":"radians";
		if(targetUnit==this.type){
			return this.value
		}else{
			return (targetUnit=="degrees")? radiansToDegrees(this.value):degreesToRadians(this.value);
		}
	};
nas.ANGLEConvert=function(myUnit){
		var targetUnit=(myUnit.match(/^(d|degrees|°|度|)$/))?"degrees":"radians";
		this.value=(targetUnit=="degrees")? radiansToDegrees(this.value):degreesToRadians(this.value);
		this.type=targetUnit;
		return this;
	};
nas.RESOLUTIONAs	=function(myUnit){
		var targetUnit=(myUnit.match(/^(dpi|ppi|lpi|dpc|ppc|lpc)$/i))? RegExp.$1:'dpi';
		if(targetUnit.slice(1)==this.type.slice(1)){
			return this.value
		}else{
			return (targetUnit.indexOf('pc')<0)? this.value*2.540:this.value/2.540;
		}
	};
nas.RESOLUTIONConvert=function(myUnit){
		var targetUnit=(myUnit.match(/^(dpi|ppi|lpi|dpc|ppc|lpc)$/i))? RegExp.$1:'dpi';
		this.value=(targetUnit.indexOf('pc')<0)? this.value*2.540:this.value/2.540;
		this.type=targetUnit;
		return this;
	};
nas.LISTString=function(myUnit){
		if(typeof myUnit == "unidefined"){myUnit=false;}
		var myResult=[];
		for(var myDim=0;myDim<this.length;myDim++){
		  if(myUnit){
			myResult.push(this[this.props[myDim]].as(myUnit));
		  }else{
			myResult.push(this[this.props[myDim]].toString());
		  }
		}
		return myResult.join();//リスト文字列で
	};
nas.ARRAYValue	=function(myUnit){
		if(typeof myUnit == "unidefined"){myUnit=false;}
		var myResult=[];
		for(var myDim=0;myDim<this.length;myDim++){
		  if(myUnit){
			myResult.push(this[this.props[myDim]].as(myUnit))
		  }else{
			myResult.push(this[this.props[myDim]].value)
		  }
		}
		return myResult;//配列で
	};
/**
 * 	nas.UnitValue Object
 * コンストラクタ:
 * 	new nas.UnitValue("値"[,"単位"]);
 * 引数:
 * 	値　String 単位つき文字列または数値文字列又は数値
 * 	単位 String 単位を文字列で　省略可　省略時は'pt'
 * 
 * 例　	new nas.UnitValue("値"[,"単位"]);
 * 
 * 	A = new nas.UnitValue("123","mm");
 * 	A = new nas.UnitValue("-72pt","in");
 * 	A = new nas.UnitValue(25.4,"cm");
 * 	A = new nas.UnitValue("うさぎ",'カメ');// {value: 0, type: "pt"}
 * 	A = new nas.UnitValue('125 degree');// {value: 0, type: "pt"}
 * 
 * 単位が指定されない場合は第一引数の単位を使用、異なる場合は第一引数の値を第二引数の単位へ変換してオブジェクト化する
 * どちらも無効な場合は、第一引数の数値部分をpointで換算
 * 無効な単位系で初期化された場合は単位系を無効のまま数値のみ初期化して　無効単位系に対する要求はptで代用する？＜estk互換
 * 無効な値で初期化された場合は値を0に設定する。＜estk互換
 *  (Adobe Extend Script 準拠)
 * 有効な単位は	in,inches,mm,millimeters,cm,centimeters,pt,picas,points,mp,millipoints
 * 
 * オブジェクトメソッド：
 * 
 * nas.UnitValue.as("単位文字列")	指定された単位文字列に変換した数値を返す
 * nas.UnitValue.convert("単位文字列")	指定された単位文字列にオブジェクトを変換する 変換後の単位付き数値文字列を返す
 * 
 * nas.UnitValue=function(myNumberString,myUnitString){
 * 	this.value=0;
 * 	this.type='pt';
 * }
 */
nas.UnitValue=function(myNumberString,myUnitString){
	if(typeof myNumberString == "string"){
		var myNumberUnit=myNumberString.replace(/[\+\-\.\s0-9]/g,'')
	}else{
		var myNumberUnit='';//第一引数が文字列以外
		myNumberString=new String(myNumberString);
	};
	if(arguments.length<2){myUnitString=myNumberUnit;}
	if(!(myUnitString.match(nas.UNITRegex))) myUnitString="pt";// 

	this.value=(myNumberUnit=='')?parseFloat(myNumberString):nas.decodeUnit(myNumberString,myUnitString);
	if((! this.value)||(isNaN(this.value))){this.value=0.000000;}

	this.type=myUnitString;
}

nas.UnitValue.prototype.as	=nas.UNITAs;
nas.UnitValue.prototype.convert	=nas.UNITConvert;
nas.UnitValue.prototype.toString=nas.UNITString;
nas.UnitValue.prototype.valueOf	=nas.UNITValue;

/*	test
 *	A=new nas.UnitValue("125","mm");//2引数初期化
 *	B=new nas.UnitValue("125mm","cm");//2引数初期化
 *	C=new nas.UnitValue("5in");//1引数初期化
 *	D=new nas.UnitValue(-123,"mm");//数値初期化
 *	E=new nas.UnitValue("たぬきさん","mm");//不正値初期化
 *	console.log(A);
 *	console.log(B);
 *	console.log(C);
 *	console.log(D);
 *	console.log(E);
 *	console.log("A+B = ",A+B);
 *	//これは誤った答えが戻る。が、使い方を誤っているのでそれで正常
 *	console.log(A.as("mm")+B.as("mm"));
 *	//確実な値が必要な場合は .as(単位)で値を求める
 *	//直接演算でUnitValeが戻ることは無い
 *	
 */
/**	nas.UnitAngle
コンストラクタ	nas.UnitAngle("値"[,"単位"])
引数:
	値	Number or String 単位付き数値または数値
	単位	 String 単位文字列省略可能

使用可能な値は　/^(d|degrees|°|度|)$/)
指定値以外または単位なしで初期化された場合は radians
単位変換機能付き
例:	A=new nas.UnitAngle("180 degrees","radians");//	180度相当の値がラディアンで格納される
	A=new nas.UnitAngle(1);//1 rad
	A=new nas.UnitAngle("27.4 d");//27.4 degrees　として格納

オブジェクトメソッド:
nas.UnitAngle.as("単位文字列")	指定された単位文字列に変換した数値を返す
nas.UnitAngle.convert("単位文字列")	指定された単位文字列にオブジェクトを変換する 変換後の単位付き数値文字列を返す
*/
nas.UnitAngle=function(myNumberString,myUnitString){
	if(typeof myNumberString == "string"){
		var myNumberUnit=myNumberString.replace(/[\.\s0-9]/g,'')
	}else{
		var myNumberUnit='';//第一引数は未指定
		myNumberString=new String(myNumberString);
	};
	if(arguments.length<2){myUnitString=myNumberUnit;};
//	if(! myUnitString){myUnitString=myNumberString.replace(/[\.\s0-9]/g,'')};
	if(myUnitString.match(/^(d|degrees|°|度|)$/)){myUnitString='degrees'}else{myUnitString='radians'};
	this.value=((myNumberUnit=='')||(myUnitString==myNumberUnit))?parseFloat(myNumberString):
	(myUnitString=="degrees")?nas.radiansToDegrees(parseFloat(myNumberString)):nas.degreesToRadians(parseFloat(myNumberString));
	if(isNaN(this.value)){this.value=0.000000;}
	this.type=myUnitString;
//	this.objName="UnitAngle";
}
nas.UnitAngle.prototype.as	=nas.ANGLEAs;
nas.UnitAngle.prototype.convert	=nas.ANGLEConvert
nas.UnitAngle.prototype.toString=nas.UNITString;
nas.UnitAngle.prototype.valueOf	=nas.UNITValue;
/*
	nas.UnitResolution Object
コンストラクタ　単位付き解像度オブジェクト
	new nas.UnitResolution("解像度"[,"単位"])

引数:	解像度　String or Number 単位付き文字列または数値
	単位	String	単位を文字列で
	双方が異なっていれば指定単位に換算
	指定可能な単位は (/dpi|ppi|lpi|dpc|ppc|lpc/i)　実質は2種　デフォルトは dpc
	無効値で初期化された場合は　72dpi相当の密度に設定する(nas標準値か？)
	値0はどの単位系でも発散が起きるのでダメ　これも値を矯正する

例:	new Resolution('120dpi','dpc');
	new Resolution( 50,'dpc');
	new Resolution('200 dpi');

オブジェクトメソッド:
nas.UnitResolution.as("単位文字列")	指定された単位文字列に変換した数値を返す
nas.UnitResolution.convert("単位文字列")	指定された単位文字列にオブジェクトを変換する 変換後の単位付き数値文字列を返す

*/
nas.UnitResolution=function(myNumberString,myUnitString){
	if(typeof myNumberString == "string"){
		var myNumberUnit=myNumberString.replace(/[\.\s0-9]/g,'')
	}else{
		var myNumberUnit='dpc';
		myNumberString=new String(myNumberString);
	};
	if(arguments.length<2){myUnitString=myNumberUnit;};
	if(! (myUnitString.match(/^(dpi|ppi|lpi|dpc|ppc|lpc)$/i))){myUnitString='dpc'};
	this.value=(myUnitString==myNumberUnit)?parseFloat(myNumberString):
	(myUnitString.indexOf('pc')<0)?parseFloat(myNumberString)*2.540:parseFloat(myNumberString)/2.540;
//	if((isNaN(this.value))||(this.value<=0)){this.value=(myUnitString.indexOf('pc')<0)?72.:72./2.540;};
	if((isNaN(this.value))||(this.value<=0)){this.value=(myUnitString.indexOf('pc')<0)?nas.RESOLUTION*2.540:nas.RESOLUTION;};
	this.type=myUnitString;
//	this.objName="UnitResolution";
}
nas.UnitResolution.prototype.as		=nas.RESOLUTIONAs;
nas.UnitResolution.prototype.convert	=nas.RESOLUTIONConvert;
nas.UnitResolution.prototype.toString	=nas.UNITString;
nas.UnitResolution.prototype.valueOf	=nas.UNITValue;
/*================================  以下は単位付き数値オブジェクトを要素に持つ複合オブジェクト===============*/
/**
	座標オブジェクト
コンストラクタ:
	new nas.Point(x[,y[,z]])
1次元、2次元、3次元の値が初期化可能
引数は UnitValueまたは文字列で

第一引数の持つ単位を、代表単位として保存するが、オブジェクトの生成後に他の単位を設定することが可能

または
	new nas.Point(nas.Point)
第一引数がnas.Point　オブジェクトだった場合は、そのオブジェクトの複製を初期化する

または
	new nas.Point(値リスト/配列[,単位])
値リストでの初期化も可能　多くの実装で配列形式の座標を扱うので互換をもたせるものとする
　myPoint=new nas.Point([myX,myY]);
　myPoint=new nas.Point([0,128,255],"pt");

Point.length　で次数が取得できる

プロパティはUnitValue
引数が数値ならばptとして初期化する
与えられない次数の値を0として扱うことが可能
引数なしの場合は2次元 ["0pt","0pt"] で初期化される

	プロパティ
nas.Point.length	Int　整数　保持している値の次数
nas.Point.x	UnitValue x座標値
nas.Point.y	UnitValue y座標値
nas.Point.z	UnitValue z座標値
nas.Point.type String 単位

数値で値を得る場合は各プロパティのas()メソッドを使用のこと

例： [myPoint.x.as('pt'),myPoint.y.as('pt')]

オブジェクトメソッド:
nas.Point.toString([指定単位])	;指定単位に揃えてリストで返す
nas.Point.valueOf([指定単位])	;指定単位にそろえて配列を戻す
単位指定がない場合は、登録された単位で返す

nas.Position は古いので　nas.Pointを使えやゴルァ
コンストラクタと初期化クラスメソッドを割ったほうが良いかも？

*/
nas.Point=function(x,y,z){
	this.props = ['x','y','z'];
	this.x = new nas.UnitValue('0 pt');
	this.y = new nas.UnitValue('0 pt');
	this.z;
	this.length = 2;
	this.type="pt";
}
nas.Point.prototype.toString=nas.LISTString;
nas.Point.prototype.valueOf =nas.ARRAYValue;

nas.newPoint=function(){
//	this.props=['x','y','z'];
	if(arguments.length == 0){
		arguments=[new nas.UnitValue('0 pt'),new nas.UnitValue('0 pt')];
	}
	//第一引数がポイントオブジェクトであれば、その複製を返す
	if(arguments[0] instanceof nas.Point){
		return Object.create(arguments[0]);
	}
		var newPoint= new nas.Point();//戻り値用新規Point
	//第一引数が配列なら配列内容からポイントを作成して戻す
	if(arguments[0] instanceof Array){
		if(arguments[0].length == 1) return newPoint;//配列要素数0ならデフォルトオブジェクトで戻す
		newPoint.length=(arguments[0].length > 3)? 3:arguments[0].length;
		//DimensionLength==Array.length 3以下に限定
		var myType=(typeof arguments[1] == "undefined")? false :arguments[1];
		for(var myDim=0;myDim<3;myDim++){
			if(myDim >= newPoint.length){newPoint[newPoint.props[myDim]] = undefined;continue;}
			
			if(arguments[0][myDim] instanceof nas.UnitValue){
		    	newPoint[newPoint.props[myDim]]  =arguments[0][myDim];
	  		}else{
	  	  		newPoint[newPoint.props[myDim]] =(myType)?
	  	  		new nas.UnitValue(arguments[0][myDim],myType):new nas.UnitValue(arguments[0][myDim]);
	  		}
		}	
	}else{
		newPoint.length=(arguments.length > 3)? 3:arguments.length;
		//DimensionLength==引数の次数 | 3 以下に限定
		for(var myDim=0;myDim<3;myDim++){
			if(myDim >= newPoint.length){newPoint[newPoint.props[myDim]] = undefined;continue;}
	  		if(arguments[myDim] instanceof nas.UnitValue){
	   			newPoint[newPoint.props[myDim]]  =arguments[myDim];
	  		}else{
	    		newPoint[newPoint.props[myDim]]  =new nas.UnitValue(arguments[myDim]);
	  		}
		}
	}
	newPoint.type=newPoint.x.type;
	return newPoint;
}
/** test
	A= new nas.Point();//原点初期化

	myX= new nas.UnitValue("12mm");
	myY= new nas.UnitValue("25.4mm");
	myZ= new nas.UnitValue("-36mm");
	
	B= nas.newPoint(A);
	C= nas.newPoint(myX,myY,myZ);
	D= nas.newPoint([myX,myY,myZ]);
	E= nas.newPoint([myX,myY],'in');
	F= nas.newPoint('12cm','2.54cm','30mm');
	G= nas.newPoint(['12cm','2.54cm','30mm']);
	H= nas.newPoint(['12cm','2.54cm','30mm'],'in');

	I= nas.newPoint(['12cm']);

	console.log (A.toString());
	console.log (B.toString());
	console.log (C.toString());
	console.log (D.toString());
	console.log (E.toString());
	console.log (F.toString());
	console.log (G.toString());
	console.log (H.toString());
	console.log (I.toString());

 */
/**
 * 	位置オブジェクト
 * 	
 * 位置オブジェクトは、座標オブジェクトを主たるデータとして位置プロパティを保持する複合オブジェクト
 * 
 * コンストラクタ:
 * 	new nas.Position(x,y[,z])
 * 2次元、3次元の値が初期化可能
 * 引数は UnitValueまたは文字列、Pointオブジェクトの初期化に準ずる
 * Pointオブジェクトを与えて初期化することも可能？
 * 
 * Position.point.length　で次数が取得できる
 * 
 * プロパティはUnitValue
 * 引数が数値ならばptとして初期化する
 * 与えられない次数のプロパティは0として扱うことが可能
 * 引数なしの場合は2次元["0pt","0pt"]で初期化される
 * 
 * 	プロパティ
 * nas.Position.point	Object nas.Point　保持している座標の値
 * nas.Position.x	UnitValue   x座標値 this.point.x
 * nas.Position.y	UnitValue   y座標値 this.point.y
 * nas.Position.z	UnitValue   z座標値 this.point.z
 * nas.Position.c	arcCurve    初期値 undefined 
 * nas.Position.t	timingCurve 初期値 undefined
 * 
 * プロパティc,tは 各座標のプロパティとして付帯することも可能
 * 
 * nas.Position.toString([指定単位])  ;指定単位に揃えてリストで返す
 * nas.Position.valueOf([指定単位])   ;指定単位にそろえて配列を戻す
 * 単位指定がない場合は、登録された単位で返す
 * 
 * 引数なしの初期化を廃して、コードを整理したほうが良いかも？
 * 
 */
nas.Position=function(x,y,z){
	if(arguments.length==0){
		arguments=[new nas.UnitValue('0 pt'),new nas.UnitValue('0 pt')];
	}
	this.point=nas.newPoint(arguments);
    this.length=this.point.length;
	this.props=['x','y','z'];
	this.x=this.point.x;
	this.y=this.point.y;
	this.z=this.point.z;
/*
	for(var myDim=0;myDim<this.length;myDim++){
//		alert(myDim +":"+arguments[myDim]);
	  if(arguments[myDim] instanceof nas.UnitValue){
	  	alert(this.props[myDim]);
	    this[this.props[myDim]]  = arguments[myDim];
	  }else{
	    this[this.props[myDim]]  =new nas.UnitValue(arguments[myDim]);
	  }
	}
*/
	this.type=this.x.type;
}
nas.Position.prototype.toString=nas.LISTString;
nas.Position.prototype.valueOf =nas.ARRAYValue;

//nas.Position objectはPointオブジェクトに換装

/*
	 オフセットオブジェクト
オフセットを利用するための複合オブジェクト
positionとorientationを組み合わせたもの
初期化の引数は位置オブジェクトと方向オブジェクトで
*/
nas.Offset=function(myPos,myOrt){
	this.position=myPos;
	this.orientation=myOrt;
	this.x=this.position.x;
	this.y=this.position.y;
	this.r=this.orientation.rotationZ;
}
/*
	ベクトルオブジェクト
コンストラクタ:
	new nas.Vector(終点[,始点][,単位])
1次元、2次元、3次元の値が初期化可能
引数
	終点・始点　/nas.Point
	単位文字列

引数の次元のうち次数の高い方に合わせたVectorを初期化する
Vector.dimension　で次数が取得できる
単位文字列が指定されなかった場合は、第一引数の単位を使用する

プロパティは　nas.Point
与えられない次数のプロパティは0として扱う

引数なしの場合はデフォルトの単位値で原点を始点とする２次元の単位ベクトルを戻す

	プロパティ

nas.Vector.dimension	Int　整数　保持している値の次数1～3
nas.Vector.origin	Point 始点座標
nas.Vector.value	Point ベクトル値(=終点座標-始点座標)
nas.Vector.type	String　単位文字列

始点を省略した場合は、原点を始点に置く
オブジェクトメソッド:
nas.Vector.toString([指定単位])	;指定単位に揃えて数値をコンマ区切りリストで返す
nas.Vector.valueOf([指定単位])	;指定単位にそろえて数値配列を戻す

*/
nas.Vector=function(endPoint,startPoint,myUnit){
	if(arguments.length==0){
		this.dimension=2;
		this.origin=new nas.Point('0 pt','0 pt');
		this.value=new nas.Point('1 pt','1 pt');
		this.type="pt";
	}else{
		this.type=(arguments.length>2)? myUnit:endPoint.type;
		if(arguments.length>1){
			this.dimension=(startPoint.dimension>endPoint.dimension)?startPoint.dimension:endPoint.dimension;
		}else{
			this.dimension=endPoint.dimension;
			startPoint=new nas.Point(([0,0,0,0]).slice(0,this.dimension),this.type);
		}
		if(this.dimension>startPoint.dimension){
			this.origin=new nas.Point((startPoint.toString(this.type)+',0,0').split(',').slice(0,this.dimension),this.type);
		}else{
			this.origin=new nas.Point(startPoint.valueOf(this.type),this.type);
		}
		this.value=new nas.Point(nas.sub(endPoint.valueOf(this.type),this.origin.valueOf(this.type)),this.type);

		this.props=['origin','value'];
	}
}
nas.Vector.prototype.toString=nas.LISTString;
nas.Vector.prototype.valueOf =nas.ARRAYValue;
/**
	回転オブジェクト
	引数一つで初期化された場合は、ｚ軸回転
	それ以上の場合は、3軸の回転となる
	回転の解決順は z-y-x
コンストラクタ
	new nas.Rotation([x,y,] z)
引数はUnitAngleまたは文字列

*/
nas.Rotation=function(){
	if(arguments.length==0){
		arguments[0]=new nas.UnitAngle('0 radians');//記述がない場合はz軸のみで初期化
	}
	this.length=arguments.length;//DimensionLength
	this.props=["rotationZ","ritationY","rotationX"];
	if(this.length==1){
	  this.rotationZ=(arguments[0] instanceof nas.UnitAngle)? arguments[0]:new nas.UnitAngle(arguments[0]);
	  this.rotationY=new nas.UnitAngle('0 radians');
	  this.rotationX=new nas.UnitAngle('0 radians');
	}else{
	  for(var myDim=0;myDim<this.length;myDim++){
	    if(arguments[myDim] instanceof nas.UnitAngle){
	      this[this.props[myDim]]=arguments[myDim];
	    }else{
	      this[this.props[myDim]]=new nas.UnitAngle(arguments[myDim]);
	    }
	  }
	}
}
nas.Rotation.prototype.toString=nas.LISTString;
nas.Rotation.prototype.valueOf =nas.ARRAYValue;

/*
	方向オブジェクト
	引数一つで初期化された場合は、ｚ軸指定
	それ以上の場合は、3軸指定となる
	回転の解決順は z-y-x
コンストラクタ
	new nas.Orientation([x,y,] z)
引数はUnitAngleまたは文字列

*/
nas.Orientation=function(){
	if(arguments.length==0){
		arguments[0]=new nas.UnitAngle('0 radians');//記述がない場合はz軸のみで初期化
	}
	this.length=arguments.length;//DimensionLength
	this.props=["orientationX","orientationY","orientationZ"];
	if(this.length==1){
	  this.rotationZ=(arguments[0] instanceof nas.UnitAngel)? arguments[0]:new UnitAngle(arguments[0]);
	  this.rotationY=new nas.UnitAngle('0 radians');
	  this.rotationX=new nas.UnitAngle('0 radians');
	}else{
	  for(var myDim=0;myDim<this.length;myDim++){
	    if(arguments[myDim] instanceof nas.UnitAngle){
	      this[this.props[myDim]]=arguments[myDim];
	    }else{
	      this[this.props[myDim]]=new nas.UnitAngle(arguments[myDim]);
	    }
	  }
	}
}
nas.Orientation.prototype.toString=nas.LISTString;
nas.Orientation.prototype.valueOf =nas.ARRAYValue;

/*	フレームレートオブジェクト
コンストラクタ
	new nas.Framerate(rateString[,rate])?
引数:
	reteString String フレームレート文字列
	rate Number 省略可能　実フレームレート
	フレームレート文字列は任意　24FPS 25FPS等の\dFPS の場合はその数値を利用
	またはキーワード SMPTE(NDF),SMPTE60(NDF),SMPTE24NDF　で各 30/1.001 60/1.001 24/1.001 をセットする
	NDFをキーワードに含む場合はNDFコードを使用する
	フレームレート文字列に数値が含まれているかまたはキーワードの場合は、第二引数を省略可能
	不正な引数で初期化された場合は、クラスプロパティを使用する
初期化メソッドは、以下の動作に変更
	単一引数の場合
引数文字列を数値パースしてフレームレートを取得して、文字列自体をnameに設定
二つ以上の場合は、第一引数がname,第二引数がフレームレート
第一引数が数値のみの場合は"FPS”を補うが、それ以外の場合は文字列全体をnameとする
	
*/
//nas.Framerate={name:"24FPS",rate:24};

nas.Framerate=function(){
	this.name="24FPS";
	this.rate=24;
};

nas.Framerate.prototype.toString=function(){return this.name;}
nas.Framerate.prototype.valueOf=function(){return this.rate;}
nas.newFramerate=function(rateString,rate){
//	var newOne=Object.create(nas.Framerate);
	var newOne=new nas.Framerate();
	if(arguments.length){
	  if(arguments.length>1){
	    newOne.name=rateString;
	    newOne.rate=parseFloat(rate);
	  }else{
	      newOne.name=rateString;
	    if(rateString.indexOf('PAL')>=0){
	      newOne.rate=25.
	    }else{
	      if(rateString.indexOf('SMPTE')>=0){
	      switch(rateString){
	case	"SMPTE24":	newOne.rate=24/1.001;break;
	case	"SMPTE60":
	case	"SMPTE60NDF": newOne.rate=60/1.001;break;
	default	:          newOne.rate=30/1.001;break;
	        }
	      }else{
	        newOne.rate=parseFloat(rateString.replace(/^[^-\d]+/,""));
	      }
	    }
	  }
	}
	if(!(newOne.rate)){alert(newOne.rate);delete newOne.rate;delete newOne.name;}
	return newOne;
}

/*
	サイズオブジェクト
コンストラクタ
	new nas.Size(width,height[,depth])
引数は
	UnitValue	/	width,height,depth


	TimingCurve	/	timing	
引数がない場合は単位"pt"でサイズ 72x72　二次元のオブジェクトを初期化

コンストラクタでタイミングカーブを初期化する必要は無い
Size オブジェクトはPointを中核データとしたサイズを扱うオブジェクト

Size
	.x(width)
	.y(height)
	.z(depth)
size Object出力書式
form1:
    125mm,254mm
form2:
    size.X = 125mm
    size.Y = 254mm
*/
nas.Size=function(){
	if(arguments.length==0){
		arguments=[new nas.UnitValue("72 pt"),new nas.UnitValue("72 pt")];
	}
	this.length=arguments.length;//DimensionLength
	this.props=["x","y","z"];
	for(var myDim=0;myDim<this.length;myDim++){
		 this[this.props[myDim]]  =new nas.UnitValue(arguments[myDim]);
	}

	this.toString=function(opt){
    		var myResult=[];
	    if(! opt){
	    	for(var myDim=0;myDim<this.length;myDim++){
		        myResult.push(this[this.props[myDim]].toString())
		    }
		    return myResult.join(",");
		}else{
	    	for(var myDim=0;myDim<this.length;myDim++){
		        myResult.push("\tsize."+this.props[myDim] +" = "+this[this.props[myDim]].toString());
		    }
		    return myResult.join("\n");
		}
	};
	this.valueOf=function(asUnit){
		if(typeof asUnit == 'undefined') asUnit=this.type;
		var myResult=[];
		for(var myDim=0;myDim<this.length;myDim++){myResult.push(this[this.props[myDim]].as(asUnit))}
		return myResult;
	};
}

/* 
Position（座標）クラス
Vectorオブジェクト


1次元のVevtorはbool / 2次元のVectorは 1次元のOrientation（Z）/ 3次元のVeltorは 3次元のOrientation (XYZ)を持つ
プロパティで持たせるか、またはラムダ関数で導くか？　アクセス頻度？

*/
/*
Curve　Object
new nas.Curve(point1,point2,isAbs)
アークを指定するための複合Object
座標系のObjectに持たせるcurveプロパティの値
自分自身の座標を始点としてベジェの第一制御点と第二制御点を相対座標で持たせる
終点はタイムシート上に次に出現する値
したがって次の区間に値が存在しない場合は、指定自体が意味を失う
指定が絶対座標であった場合は、 親オブジェクト側で座標系の変換を行い相対座標にして格納する
カーブデータを必要とする区間は、直前の区間のカーブ値と直後の区間の値を参照する。
値を持っていてもカーブプロパティを持たないエントリがあっても良い
その場合は、標準値で補う
C=new Curve( new Point(0,0),new Point(1,1))
*/
nas.Curve=function(){
	this.parent;
	this.ctlrpt1;
	this.ctlrpt2;
}
/*
　TimingCurve　Object
　タイミング指定をするための配列ベースのObject
値を持つObjectに全て持たせることが可能
値は二次元に限定 / 値範囲は0-1に限定
始点を[0,0] 終点を[1,1]と置いて第一制御点と第二制御点を少数値で与える

キーワード文字列で初期化された場合、ライブラリ内にキーワードに対応する値が存在するならテキストを値として実際の値はクラスライブラリを参照する。
タイミングを解決するのは、値を持ったObjectの直後の中間値補間区間

T=new TimingCurve("linear"); //	戻値[[0,0],[1,1]]
nas.TimingCurve=function(){
	this.
}
.parent タイミングカーブが適用されるプロパティを与える
.ctlrPtは自身の配列要素を使用

*/
nas.TimingCurve=function(){
	this.parent;
	this.name;
	this.push([0,0]);this.push([1,1]);//デフォルトのlinearタイミング
}
/*
	リニアタイミング（均等タイミング）	0	0	1	1
	イーズ（両詰め）	0.5	0	0.5	1
	イーズアウト（前詰め）	0.5	0	1	0.5
	イーズイン（後詰め）	0	0.5	0.5	1
	クイック（極端な両詰め）	1	0	0	1
	クイックアウト（極端な前詰め）	1	0	1	0
	クイックイン（極端な後詰め）	0	1	0	1
	ステイ（中詰め）	0	0.5	1	0.5
	ステイストロング(極端な中詰め)	0	1	1	0
*/
nas.TimingCurve.keyWords={
	"linear":    [[  0,  0],[  1,  1]],
	"ease":      [[0.5,  0],[0.5,  1]],
	"easeOut":   [[0.5,  0],[  1,0.5]],
	"easeIn":    [[  0,0.5],[0.5,  1]],
	"quick":     [[  1,  0],[  0,  1]],
	"quickOut":  [[  1,  0],[  1,  0]],
	"quickIn":   [[  0,  1],[  0,  1]],
	"stay":      [[  0,0.5],[  1,0.5]],
	"stayStrong":[[  0,  1],[  1,  0]]
};


nas.TimingCurve.prototype =Array.prototype;
/*
nas.AnimationPeg Object
nasペグシステムでサポートするペグオブジェクト

以下のペグをサポートする
0:表示のないペグ　角合せ及び中央合せ	中央合わせがデフォルト値
	0:中央合せ
	1:左下合せ(ステージ第一象限)
	2:左上合せ(ステージ第二象限)
	3:右上合せ(ステージ第三象限)
	4:右下合せ(ステージ第四象限)
	5:他任意の位置
	プリセットで色々作る
　各ポイントは、ペグ（レジストレーション点）として扱う
	可視、不可視の属性を持ち、外見プロパティを持たせることができる。
	外見プロパティの登録がない場合簡易表示として、レジストリシンボルを使う
　エレメントグループ内部のみで角合わせを行うとレジストレーション点が画面中央で初期化されたりするが通常の動作である
　必要に従って、新たなタップを作成（ステージにタップ＝カメラワークフレームを設定＝設置）して其処にジオメトリネットワークを構築する
　実物線画台と異なり同じ位置に別のタップが置ける　干渉は無い

外見プロパティは以下から選択できるように設定
0:不可視、表示の際はシンボルで
1:ACME	ACME があれば問題ないと思う
2:丸あな2穴	穴径及び間隔は別に設定　またはシンボル
3:丸あな3穴	タイプはASAのみ用意する　ほかはいらん

ペグ（レジストレーション）システムとして考えた場合　角合せも中央整列もペグの位置指定と同じ
フレームからのレジストレーション点オフセットのデータ書式は同じ　→　ケースわけしない
レジストレーション代表点は、ペグの場合各ペグの中心（ACMEならセンターホール中心）、０番系列はポイントそのもの
向きはエレメントグループ内で揃っていれば同じ
データ上のオフセットは、レジストリ点のローカル座標とローテーション
pegオフセットは、フレーム中心からのペグ（レジストレーション点）のオフセットとローテーション

したがってフレーム中心のローカル座標は　sub(offset,pegOffset)となる。

基本構成は同じだが、AnimationPegはオブジェクトでなく　AnimationFrameオブジェクトのプロパティとして実装してそのプロパティの一部としてPegFormを設定する。
これがペグの外形を保持するように実装

オフセットプロパティ群の関連は以下のリスト

 GeometryOffset　オブジェクト　基底クラスオブジェクト
 位置オフセット+回転（オリエンテーション）値で成立する　回転に際して正規化が発生する

offset
	セルエレメントのローカル座標内のペグ位置オフセット
pegOffset
	プロパティとしては親座標系内のペグ位置
	デフォルトで使う限りは親がステージなのでワールド座標系での位置になる
	ネットワーク構築時のネスト時の親に注意
	乗り換え操作の際は、一旦ステージまでさかのぼってコンバートする方針で実装
frameOffset
	ペグ位置に対するフレームのオフセット
	エレメント（ローカル）座標系で記録する
*/
/*
myPeg =new nas.AnimationPegForm(pegForm)

*/
nas.AnimationPegForms={
	"invisible":0,
	"ACME":1,
	"jis2hales":2,
	"us3hales":3
}
nas.AnimationPegForm=function(pegName){
	this.name=pegName;//"invisible","ACME","jis2hales","ansi3holes"
}
nas.AnimationPegForm.prototype.toString=function(){return this.name;}
nas.AnimationPegForm.prototype.valueOf=function(){return nas.AnimationPegForms[this.name];}

nas.GeometryOffset=function(myPoint,myRotation){
	this.position=(myPoint)?myPoint:new nas.Point();
	this.x=this.position.x;
	this.y=this.position.y;
	this.rotation=(myRotation)?myRotation:new nas.Rotation();
	this.r=this.rotation.rotationZ;
}
/*
nas.AnimationField Object
作画アニメーションフレームを保持するオブジェクト
クリッピングフレーム（カメラワークオブジェクト）の基底クラス
10インチ標準フレームは、
	new nas.AnimationFrame(
		"10inSTD",
		new nas.UnitValue("720 pt"),
		16/9,
		myOffset =nas.GeometryOffset(new nas.Position("0mm","105mm"),new nas.Rotation(0))
	);

*/
nas.AnimationField=function(myName,baseWidth,frameAspect,scale,peg,pegOffset){
	this.name=(myName)?myName:"10in-HDTV";
	this.baseWidth=(baseWidth)?baseWidth:new nas.UnitValue("254 mm");
	this.frameAspect=(frameAspect)?frameAspect:16/9;
	this.scale=(scale)?scale:1.0;
	this.peg=(peg)?peg:new nas.AnimationPegForm("ACME");
	this.pegOffset=(pegOffset)?pegOffset:nas.GeometryOffset(new nas.Position("0 mm","104.775 mm"),new nas.Rotation(0));
}

//区間要素群のtoString()	メソッドの仕様

/*
	Obj.toString() 又は　Obj.toString(0 or false)
	代表値を保存形式出力で
	Obj.toString(出力キーワード) 又は　Obj.toString(1 or true)
	先頭 \t フィールドデリミタ \n でフルスペック出力
	Obj.toString([プロパティ名配列])
	指定プロパティを先頭 \t フィールドデリミタ \n で列挙
	
実際の使用時は以下の例のように利用
	xMapElement.content.toString("all");
	xMapElement.toString() //内部的にcontent.toString()にアクセス
	
メモ:
関数仕様
エレメント又はその値のtoString()で xMap の出力を得る

toString():引数なし	標準型
toString("all"):true ? 全プロパティ出力
toString(propName):プロパティ名　単独プロパティ
toString([propNames]):プロパティ名配列　指定プロパティを改行で区切って連続で与える


例(セル):
AnimationRreplacement.toString();

戻値
'A	A-1	"c:\myWorkshop\dataStore\work01\c001\A\0001.png",120 mm,360 mm '

AnimationRreplacement.toString(["size.x","size.y","size.t"]);

戻値
'	size.x=12 mm
	size.y=36 mm
	size.t=linear
'

xMapElement.toString("all");
戻値
'A	A-1	"c:\myWorkshop\dataStore\work01\c001\A\0001.png"
	size.x=12 mm
	size.y=36 mm
	size.t=linear
'

例:
AnimationReplacement.toString()
戻値
B	B-1	"c:\\\\Users\\Me\\Desktop\\Datas\\B_00001.png",640pt,480pt,

これらの値がグループの場合と要素の場合で共通に使える仕様とすること

値に名前（ラベル）を与えるのは上位オブジェクトの役目なので上位オブジェクト側で、これらの値をラップした出力を得る
	group
[A]
//最低限、名前のみ（これけっこう多い）
[A	CELL	720,405]
//標準形式、[label kind geometry]
//これ以上の情報が継承以外で保持されている場合geometryの追加情報を個別型式で出力

セルグループのプロパティ
	セッションユニークID
	名前
	値	アニメーションフィールド

	セッションユニークID
	所属グループ
	名前
	値	アニメーションリプレースメントエレメント　ファイル実体とアニメーションフィールドを持つ複合オブジェクト

[A	CELL	254mm,142.875mm,]



*/
/*
	区間の値としてのオブジェクトとMapの値を同一オブジェクトとするか否か？
	兼用して参照渡しにするのが最良と思われる

	作成するオブジェクトのリスト＞＞トラックの種類だけ必要
nas.AnimationSound	　音響
nas.AnimationReaplacement	置きかえ（画像ーセル＊静止画と動画を双方含む）
nas.AnimationGeometry	ジオメトリ（カメララーク）
nas.AnimationComposite	合成（撮影効果）

システムグループのエントリは各オブジェクトをすべて含む可能性がある == システムのみグループのタイプと値のタイプが異なる
XPSグループのエントリは時間属性を持ったリプレースメントオブジェクトとして扱う

TEXTグループは、タイムシート上には配置されず区間の値となることは無い…と思う
字幕等 の　AnimationSoundに準ずるAnimationTextオブジェクトは、そのうち必要かも  

これでOK？

*/

/**
 * nas.AnimationElementSource Object
 * 各エレメントのソースファイルを統合して扱うオブジェクト
 * 初期化引数:ターゲット記述テキスト
 * .file ソースファイル Fileオブジェクト又はパス文字列　初期値 "/"
 * .framerate ソースフレームレート 主に静止画、ムービーの際に利用　nas.Framerate Object
 * .duration ソース継続時間 主に静止画の際に利用　frames/int
 * .startOffset ソース継続時間に対するオフセット　frames/int
 */
nas.AnimationElementSource=function(targetDescription){
    this.file;
	this.framerate;
    this.duration;
    this.stratOffset;
}


/**

    Xps
        .stage  *
        .mapfile    *
        .opus
        .title
        .subtitle
        .create_time
        .create_user
        .cut
        .framerate
        .memo
        .rate
        .scene
        .trin
        .trout
        .update_time
        .update_user
        .xpsTracks(XpsTrackCollection)

        .duration()
        .deleteTL()
        .getIdentifier()
        .getMap()
        .getNormarizedStream()
        .getRange()
        .getTC()
        .init()
        .insertTL()
        .isSame()
        .newTracks()
        .parseXps()
        .put()
        .reInitBody()
        .readIN()
        .time()
        .timeLine()
        .toString()

    XpsTrackCollection
        .parentXps
        .jobIndex
        .length
        .duration
        .noteText

        .addSection()
        .duplicate()
        .getDuration()
        .insertTrack()
        .parseSoundTrack()?間違いなので削除
        .renumber()
        
    XpsTimelineTrack (track-collection member)
        .index
        .xParent
        .length
        .duration
        .id
        .option
        .sizeX
        .sizeY
        .aspect
        .lot
        .blmtd
        .blpos
        .link
        .parent
        .sections   (XpsTimelineSectionCollection)

        .getDefaultValue()
        .duplicate()
        .parseTm()          test
        .parseSoudTrack()   test

    XpsTimelineSectionCollection    セクションキャリア(配列ベース)
        .parent 親セクション又はトラック

        .addSection()   値を置いてセクションを追加する
        .getDuration()  セクションの値を合計して継続時間をフレーム数で戻す
        
    XpsTimelineSction   セクションメンバ
        .id             セクションの現行index　==parent.sections[id]
        .parent         タイムライントラック  
        .duration       継続時間（フレーム数）
        .value          .this.mapElement.value　または同等の値オブジェクト
        .mapElement     nas.xMapElement　値へは.value経由でアクセスする
        .subSections    


    nas.xMapElemnet
        .id uniq-index/int
        .parent xMapGroup
        .link   PmJob
        .type   parent.type / erement-type
        .name   element label
        .content    タイプごとの値オブジェクト
        .comment    申し送りコメント

 */
/**
 *    @desc nas Object base property
 */
/**
 * カレントユーザ文字列
 * ここで参照して、以降はグローバルを使用しないようにする2011/08/17
 */
nas.CURRENTUSER = myName;
/**
 * 時間関連設定
 * @type {number}
 */
nas.ccrate = 1000;	//最少計測単位(javascriptではミリ秒固定)
nas.MODE = "clock";	//表示の初期モード(時計) ストップウオッチ用共用変数
nas.ClockOption = 12;	//時計の初期モード (12時制) ストップウオッチ用共用変数
nas.STATUS = "stop";	// ストップウオッチ用共用変数
/**
 * フレームレート    ここの並びでループする 100fps 24FPS 30NDF 30DF 25FPS
 * @type {string[]}
 */
nas.RATEs = ['100fps', '24FPS', '23.976FPS', '30NDF', '30DF', '25FPS', '48FPS'];
nas.RATE = '24FPS';

//基準変数
//名前付け規則は、以下に準ずる
//スクリプト上の変数名は、大文字のみ
//フォーム上の同名のエレメントは 小文字で綴り初めて 大文字で綴り終わる記法で
//複合単語は、前置語を小文字、後置語を大文字

/**
 * サンプル基準値
 * サンプルフレームレート(フレーム継続時間に置き換えるか一考)
 * @type {number}
 */
nas.FRATE = 24;//	nas.FRATE = nas.newFramerate();
/**
 * サンプル解像度ppc(dpc)
 * @type {number}
 */
nas.RESOLUTION = 144. / 2.540;//nas.RESOLUTION = new nas.UnitResolution("144 dpc");
/**
 * サンプル基準寸法(mm)
 * @type {number}
 */
nas.LENGTH = 225.;//nas.LENGTH = new nas.UnitValue("254mm") ;//フレーム基準寸法(横幅)
/**
 * フレームアスペクト（参考値 横／縦）
 * @type {number}
 */
nas.ASPECT = 16 / 9;
/**
 * ピクセルアスペクト（参考値 横／縦）
 * @type {number}
 */
nas.PIXELASPECT = 1;
/**
 * サンプル基準フレーム(fl)
 * @type {number}
 */
nas.FRAME_L = 100;

/**
 * FCTインターフェース関連
 * タイムシート継続時間 秒/枚
 */
nas.SheetLength = SheetLength;

/**
 * @desc FCTインターフェースをドロップフレーム対応とする
 *
 * 基本的なドロップメソッドはカウント母数を Math.ceil(nas.FRATE)として
 * 誤差が蓄積次第秒の末尾フレームをドロップカウントする事で行う。
 * nas.SheetLengthは実際の消化フレームととらえると枚数ごとの不定値となるので
 * 秒数で置いて一定値を得ることにする(仕様変更)
 */


/**
 * fl : Fields アニメーション撮影フレーム(traditional)
 * 基準値は計算レタスフレームを基準にしたほうが計算回数がいくらか減りそう?
 * @type {number}
 */
nas.SCALE = 1;//サンプル拡大比率(実数)

/**
 * @desc for AEkey
 */

/**
 * @desc コンポ情報
 * 計算に必要な情報は、コンポを切り換えるタイミングで再初期化する?
 * または、手動で初期化トリガを打つか?
 */

/**
 * コンポジション３Ｄカメラ情報 > オブジェクト化すること
 * @type {number}
 */
nas.FOCUS_D = 50; //レンズ焦点距離 (mm)
nas.FILM_W = 36;//FILM Width (mm)
nas.FILM_H = 24;//FILM Height(mm)
/**
 * イメージサークル直径(mm)
 * @returns {number}
 * @constructor
 */
nas.IMAGE_CR = function () {
    return Math.sqrt(Math.pow(this.FILM_W, 2) + Math.pow(this.FILM_H, 2))
};


/**
 * コンポジション設定 > オブジェクト化すること
 * @type {number}
 */
nas.COMP_W = 720;//comp Width (px);
nas.COMP_H = 486;//comp Height(px);
nas.COMP_A = 0.9;//comp Aspect(W/H);

/**
 * @return {number}
 */
nas.COMP_D = function () {
    return Math.sqrt(Math.pow(this.COMP_W * this.COMP_A, 2) + Math.pow(this.COMP_H, 2));
};

/**
 * @return {number}
 */
nas.CAMERA_D = function () {
    return (this.COMP_D() * this.FOCUS_D) / this.IMAGE_CR();
};


/**
 * レイヤ・フッテージ設定
 * 今のところキーに添付するだけの値(変換には無関係)
 * @type {number}
 */
nas.SRC_W = 720;//source Width (px);
nas.SRC_H = 486;//source Height(px);
nas.SRC_A = 0.9;//source Aspect(W/H);
/**
 * AE-Key data 出力関連の変数(初期値)
 * @type {string}
 */
nas.AE_Ver = "8.0";// 4.0/5.0/6.0/6.5/7.0/8.0 AE CS3
nas.KEY_STYLE = "withTime";//or "valueOnly"
nas.KEY_TYPE = "Scale";// or "Position"

/**
 * @desc 子変数 親変数から導かれる表示データ(または派生データ)
 * 変数名は、大文字ではじまり 後ろは小文字のみ
 * フォーム上の同名のinputは極力大文字のみで表記
 */

/**
 * Resolution objectを作成してそちらへ移行
 *
 * nas.Resolution
 * nas.Resolution.dpc
 * nas.Resolution.dpi
 */

/**
 * RESOLUTION 派生変数 ラムダ関数試験
 * @return {number}
 */
nas.Dpi = function () {
    return this.RESOLUTION * 2.540;
};
//	nas.Dpi = function(){return this.RESOLUTION.as('dpi');} ;
/**
 *
 * @returns {number|*}
 * @constructor
 */
nas.Dpc = function () {
    return this.RESOLUTION;
};
//	nas.Dpc = function(){return this.RESOLUTION.as('dpc');} ;

/**
 * nas.ClipingFrame objectを作成してそちらへ移行
 * nas.ClipingFrame.size    :nas.Geometry
 * nas.ClipingFrame.height
 * nas.ClipingFrame.scale
 * nas.ClipingFrame.offset
 * nas.ClipingFrame.rotation
 * nas.ClipingFrame.traditionalFrames
 * nas.ClipingFrame.retasFrames
 * nas.ProductSpeckに統合？
 */

/**
 * FRAME_L 派生変数
 * nas.FRAMEl = function () {
 *            this.FRAME_L;
 *        };
 * nas.FRAMEr = function () {
 *            this.fl2fr(this.FRAME_L);
 *        };
 * ここまではプロパティ
 */

/**
 * DateオブジェクトにtoNASString形式処理を乗せる
 * @returns {string}
 */
Date.prototype.toNASString = function () {
    var h = this.getHours();
    var m = this.getMinutes();
    var s = this.getSeconds();
    var yy = this.getFullYear();
    var mm = this.getMonth() + 1;
    var dd = this.getDate();
    var Result = yy + "/" + mm + "/" + dd + "\ " + h + "\:" + m + "\:" + s;
    return Result;
};

/**
 * @param nasString
 * @returns {Date}
 */
Date.prototype.setNASString = function (nasString) {
    var yy = nasString.split("\ ")[0].split("/")[0];
    var mm = nasString.split("\ ")[0].split("/")[1] - 1;
    var dd = nasString.split("\ ")[0].split("/")[2];
    var h = nasString.split("\ ")[1].split(":")[0];
    var m = nasString.split("\ ")[1].split(":")[1];
    var s = nasString.split("\ ")[1].split(":")[2];
    this.setYear(yy);
    this.setMonth(mm);
    this.setDate(dd);
    this.setHours(h);
    this.setMinutes(m);
    this.setSeconds(s);

    return this;
};
/*
 String.camelize()
 */

/**
 * @returns {string}
 */
String.prototype.camelize = function () {
    return this.replace(/(?:[-_])(\w)/g, function (_, c) {
        return c ? c.toUpperCase() : '';
    });
};

/**
 * @desc nas 共通ライブラリ
 *
 * 数学関連とか映像関連の戻り値のある関数群
 * (メソッドで)
 *
 * 距離関連換算関数
 * dt2sc(Z軸位置)    戻り値:位置に相当する拡大比率
 * sc2dt(拡大比率)    戻り値:比率に相当するAEのZ軸位置
 * 双方、ともにコンポジションのプロパティに依存
 *
 * @param dt
 * @returns {number}
 */
nas.dt2sc = function (dt) {
    return (this.CAMERA_D() / ((1 * dt) + this.CAMERA_D()))
};
/**
 * @param sc
 * @returns {number}
 */
nas.sc2dt = function (sc) {
    return ((this.CAMERA_D() / (1 * sc)) - this.CAMERA_D())
};

/**
 * @desc フレーム関連換算関数
 * 一々書いても間違えそうなのでまとめておく。
 *
 * fl は、旧来のアニメーション撮影フレーム（field）・スタンダード値100：比例値
 * fr は、レタス撮影フレーム(要検証)・同スタンダード値100：比例値
 * sc は、倍率
 * FRAME_Lは、基礎情報として基準フレーム数をfl値で与えること
 *
 * @param fl
 * @returns {number}
 */
nas.fl2fr = function (fl) {
    return ((fl * 1 + 60) / 1.60)
};
/**
 * @param fr
 * @returns {number}
 */
nas.fr2fl = function (fr) {
    return ((fr * 1.60) - 60)
};

/**
 * @param fl
 * @returns {number}
 */
nas.fl2sc = function (fl) {
    return ((160 * ((this.FRAME_L * 1) + 60)) / (160 * ((fl * 1) + 60)))
};
/**
 * @param fr
 * @returns {number}
 */
nas.fr2sc = function (fr) {
    return (this.fl2sc(this.fr2fl(fr)))
};
/**
 * @param sc
 * @returns {number}
 */
nas.sc2fl = function (sc) {
    return ((((160 * (this.FRAME_L + 60)) / (sc * 1)) / 160) - 60)
};
/**
 * @param sc
 * @returns {number}
 */
nas.sc2fr = function (sc) {
    return (this.fl2fr(this.sc2fl(sc)))
};

/**
 * 拡大率変換関数
 * kac(基準量,目標量,助変数)
 * 戻り値は 序変数に対応する寸法
 *
 * @param StartSize
 * @param EndSize
 * @param timingValue
 * @returns {*}
 */
nas.kac = function (StartSize, EndSize, timingValue) {
    if (timingValue == 0 || timingValue == 1) {
        if (timingValue == 0) {
            resultS = StartSize
        }
        if (timingValue == 1) {
            resultS = EndSize
        }
    } else {
        /**
         * 求める寸法は
         *
         * まず開始寸法を1として終了寸法の開始寸法に対する比率を求める
         * EndSize/StartSize
         * 距離評価係数として 比の逆数を開始点と終了点で求める。
         * 開始点距離評価係数 1/1 = 1
         * 終了点距離評価係数 1/(EndSize/StartSize) = StartSize/EndSize
         *
         * 与えられた助変数に対応する距離評価係数を求める。
         * ((終了点距離評価係数 - 開始点距離評価係数) * 序変数) + 開始点距離評価係数
         * = (((StartSize/EndSize) - 1) * timingValue) + 1
         * 評価係数の逆数をとって比率を得る
         * 比率を開始寸法に掛ける
         * 開始寸法 * 距離評価係数
         * = StartSize / ((((Startsize/EndSize) - 1) * timingValue) + 1)
         */
//	resultS = (1-(timingValue)*(1-(StartSize/EndSize)));
        resultS = StartSize / ((((StartSize / EndSize) - 1) * timingValue) + 1);

    }
    return (resultS);
};

/**
 * kacの逆関数
 * cak(基準量,目標量,任意寸法)
 * 戻り値は助変数を最大精度で
 *
 * @param StartSize
 * @param EndSize
 * @param TargetSize
 * @returns {number}
 */
nas.cak = function (StartSize, EndSize, TargetSize) {
    /*
     まだ書いてないよ('o')
     */
    var resultT = 0;
    if (TargetSize == StartSize) {
        resultT = 0
    } else {
        if (TargetSize == EndSize) {
            resultT = 1
        } else {
            resultT = (((1 / TargetSize) - (1 / StartSize)) / ((1 / EndSize) - (1 / StartSize)))
        }
    }
    return (resultT);
};


/**
 * ゼロ埋め ZERROfilling
 * @param N
 * @param f
 * @returns {string}
 * @constructor
 */
nas.Zf = function (N, f) {
    var prefix = "";
    if (N < 0) {
        N = Math.abs(N);
        prefix = "-"
    }
    if (String(N).length < f) {
        return prefix + ('00000000' + String(N)).slice(String(N).length + 8 - f, String(N).length + 8);
    } else {
        return String(N);
    }
};

/**
 * 前後文字列つきゼロ埋め(動画番号正規化)
 *
 * @param myName
 * @param num
 * @returns {*}
 * @constructor
 */
nas.RZf = function (myName, num) {
    if (typeof num == "undefined") num = 4;
    if (myName.match(/([^\d]*)([\d]+)([^\d]?.*)/)) {
        return RegExp.$1 + nas.Zf(RegExp.$2, num) + RegExp.$3;
    } else {
        return myName;
    }
};

/**
 * 時間フレーム変換
 * @param ms
 * @returns {number}
 */
nas.ms2fr = function (ms) {
    return (Math.floor(this.FRATE * (ms / 1000)))
};//ミリ秒からフレーム数 実時間切捨て整数フレーム

/**
 * @param frm
 * @returns {number}
 */
nas.fr2ms = function (frm) {
    return (1000 * frm / this.FRATE)
};//フレームからミリ秒 浮動少数

/**
 * @param ms
 * @param type
 * @param ostF
 * @param fpsC
 */
nas.ms2FCT = function (ms, type, ostF, fpsC) {
    if (!type) {
        type = 0
    }
    if (!ostF) {
        ostF = 0
    }
    if (!fpsC) {
        fpsC = this.FRATE
    }
    if (type > 5) {
        fpsC = 29.97 * (type - 5)
    }
    /**
     * type 6 7の時にフレームレート強制
     * @type {number}
     */
    var myFrms = Math.round((ms * fpsC) / 1000);
    return this.Frm2FCT(myFrms, type, ostF, fpsC);
};

/**
 * @param fct
 * @returns {number}
 * @constructor
 */
nas.FCT2ms = function (fct) {
    return 1000 * (this.FCT2Frm(fct)) / this.FRATE
};


/**
 * カウンタ文字列生成
 * ドロップ対応版 2010/11/04
 * SMPTE ドロップ30対応 2010/11/05
 * モード指定 type6
 *
 * 30DF 60DF のみをサポートの予定 どちらのモードも0オリジン
 * 指定モードとしてtype6(30df)/7(60df)を与える
 * type7は30DF互換なので30DFと同じタイミングで4フレームドロップカウントする
 *
 * @param frames
 * @param type
 * @param ostF
 * @param fpsC
 * @returns {*}
 * @constructor
 */
nas.Frm2FCT = function (frames, type, ostF, fpsC) {
    if (!type) {
        type = 0
    }
    if (!fpsC) {
        fpsC = this.FRATE
    }
    if ((type == 6) || (type == 7)) {
        /*	SMPTE 30DF/type6 60DF/type7*/
        var dF = 2589408;
        var hF = 107892;
        var dmF = 17982;
        var lmFd = 1798;
        var lmFc = 1800;
        var sF = 30;
        var dropF = 2;
        if (type == 7) {
            dF = dF * 2;
            hF = hF * 2;
            dmF = dmF * 2;
            lmFd = lmFd * 2;
            lmFc = lmFc * 2;
            sF = sF * 2;
            dropF = dropF * 2;
        }
        /**
         * 負数は24hの補数化して解決
         * @type {number}
         */
        var FR = (frames < 0) ? dF + (frames % dF) : frames;
        var h = 0;
        var m = 0;
        var s = 0;
        var f = 0;
        h = Math.floor((FR / hF) % 24);//SMPTE TCは24時ループ
        /**
         * mを10分単位でクリップすると計算が単純化される
         * @type {number}
         */
        var fRh = FR % hF;//未処理フレーム
        var md = Math.floor(fRh / dmF);//10分単位
        var mu = ((fRh % dmF) < lmFc) ? 0 : Math.floor(((fRh % dmF) - lmFc) / lmFd) + 1;//10分以下の分数
        m = (md * 10) + mu;//加算して分数
        fRm = fRh - (dmF * md) - (lmFd * mu);//
        fRm -= (mu == 0) ? 0 : dropF;//正分まで処理を終えた残フレーム
        s = (mu == 0) ? Math.floor(fRm / sF) : Math.floor((fRm + dropF) / sF);//秒数・例外を除きドロップ2フレ補償
        fRs = ((mu == 0) || (s == 0)) ? fRm - (s * sF) : fRm - (s * sF) + dropF;
        f = ((mu == 0) || (s != 0)) ? fRs : fRs + dropF;
        return nas.Zf((h % 24), 2) + ":" + nas.Zf(m, 2) + ":" + nas.Zf(s, 2) + ";" + nas.Zf(f, 2);
    } else {
        /**
         *  通常のTCを作成
         */
        var negative_flag = false;
        if (frames < 0) {
            frames = Math.abs(frames);
            negative_flag = true;
        }
        if (ostF == 1) {
            PostFix = ' _';
        } else {
            ostF = 0;
            PostFix = ' .';
        }
//
//	default	00000
//	type 2	0:00:00
//	type 3	000 + 00
//	type 4	p 0 / 0 + 00
//	type 5	p 0 / + 000
//		type 6	00:00:00;00
//		type 7	00:00:00;00
//
        var m = Math.floor((frames + ostF) / (fpsC * 60));
        var s = Math.floor((frames + ostF) / fpsC);
        var SrM = s % 60;
        var p = Math.floor(s / this.SheetLength) + 1;//SheetLength秒数で計算
        var FrS = Math.floor(frames - (s * fpsC)) + ostF;//秒単位端数フレーム
        var FrP = Math.floor(frames - (((p - 1) * this.SheetLength) * fpsC)) + ostF;//ページ
        var SrP = s - ((p - 1) * this.SheetLength);//ページ単位端数 秒

        switch (type) {
            case 5:
                Counter = 'p ' + this.Zf(p, 1) + ' / + ' + this.Zf(FrP, 3) + PostFix;
                break;
            case 4:
                Counter = 'p ' + this.Zf(p, 1) + ' / ' + SrP + ' + ' + this.Zf(FrS, 2) + PostFix;
                break;
            case 3:
                Counter = this.Zf(s, 1) + ' + ' + this.Zf(FrS, 2) + PostFix;
                break;
            case 2:
                Counter = this.Zf(m, 1) + ':' + this.Zf(SrM, 2) + ':' + this.Zf(FrS, 2) + PostFix;
                break;
            default:
                Counter = this.Zf(frames + ostF, 4) + PostFix;
        }
        if (negative_flag) {
            Counter = "-( " + Counter + " )"
        }
        return Counter;
    }
};

/**
 * nas.FCT2Frm(Fct,fpsC)
 * 引数 :タイムカウンタ文字列[,カウンタフレームレート]
 * 戻値 :フレーム数
 *
 * カウンタ文字から0スタートのフレーム値を返す
 * カウンタ文字列と認識できなかった場合は'元の文字列'を返す[仕様変更]
 * ドロップフレームが指定された場合はフレームを戻さず上記に準ずる
 *
 * タイムカウンタ文字列はFrm2FCT()の文字列を全て認識して解決する
 * 負数対応
 * フレームレートの指定が可能なように拡張(2010/11/06)
 * 指定がない場合 nas.RATE を参照する
 * カウンタ文字列にページ指定がある場合は nas.SheetLength を参照する
 * この変数の一時指定はできないので、システムプロパティを直接書き直す必要がある
 *
 * SMPTEドロップを拡張(2010.11.05)
 * TC文字列判定 キーは
 * 最終セパレータが";"であるか否か
 * 文字列末尾のオリジネーション指定はあってもよいが無効（全て0オリジン）
 * フレームレートは30DF 60DFでは強制指定が行われたものとする。
 * 中間の45fpsを閾値としてnas.FRATEがそれ以下の場合は30DF
 * それ以上の場合は60DFのフレーム数を返す
 * 本来60DFはSMPTEの規格外なので扱いに注意すること
 * 
    近来　23.8 (ドロップ互換24fps)が広範に利用されているのでそろそろ考慮化必要？
 
 * @param Fct
 * @param fpsC
 * @returns {*}
 * @constructor
 */
nas.FCT2Frm = function (Fct, fpsC) {
    if (!fpsC) {
        fpsC = this.FRATE
    }
    fct = Fct.toString();
    var negative_flag = 1;
    /**
     * 負数表示がある場合ネガティブモードに遷移
     */
    if (fct.match(/^\-\(([^\(\)]*)\)$/)) {
        fct = RegExp.$1;
        negative_flag = -1;
    }
    /**
     * 空白を全削除
     * @type {string}
     */
    fct = fct.replace(/\s/g, '');
    /**
     * 文字列の最期の文字を評価してオリジネーションを取得
     */
    if (fct.charAt(fct.length - 1) == '_') {
        ostF = 1;
        PostFix = '_';
    } else {
        ostF = 0;
        PostFix = '.';
    }
    /**
     * 文字列の最期の文字がポストフィックスなら切り捨て
     */
//	alert(fct.charAt(fct.length - 1)+" : "+PostFix);
    if (fct.charAt(fct.length - 1) == PostFix) {
        fct = fct.slice(0, -1);
    }
    /**
     * 初期判定で SMPTE-DFを分離
     */
    if (fct.match(/^([0-9]+:){0,2}[0-9]+;[0-9]+$/)) {
        /**
         * SMPTE hh:mm:ss;ff
         * @type {string}
         */
        fct = fct.replace(/;/g, ":");//セミコロンを置換
        fpsC = (fpsC < 45) ? 29.97 : 59.94;//SMPTEドロップが指定されたので強制的にフレームレート調整
        ostF = 0;
        PostFix = "";

        /**
         * 一時係数設定
         * @type {number}
         */
        var dF = 2589408;
        var hF = 107892;
        var dmF = 17982;
        var lmFd = 1798;
        var lmFc = 1800;
        var sF = 30;
        var dropF = 2;
        if (fpsC >= 45) {
            dF = dF * 2;
            hF = hF * 2;
            dmF = dmF * 2;
            lmFd = lmFd * 2;
            lmFc = lmFc * 2;
            sF = sF * 2;
            dropF = 4;
        }
        //60DF
        /**
         * TCをスプリットして配列に入れる
         * @type {Array}
         */
        tmpTC = [];
        tmpTC = fct.split(":");
        var h = 0;
        var m = 0;
        var s = 0;
        var k = 0;

        switch (tmpTC.length) {
            case 4:
                h = tmpTC[tmpTC.length - 4] * 1;
            case 3:
                m = tmpTC[tmpTC.length - 3] * 1;
            case 2:
                s = tmpTC[tmpTC.length - 2] * 1;
            case 1:
                f = tmpTC[tmpTC.length - 1] * 1;
        }
        /**
         * フレームドロップ判定
         */
        if (((m % 10) > 0) && (s == 0) && (f < dropF)) {
            return null
        }
        /**
         * ドロップフレームはヌル戻し
         * @type {number}
         */
        var FR = h * hF;//時
        FR += Math.floor(m / 10) * dmF;//＋10分単位で加算
        FR += (m % 10) * lmFd;//ひとけた分乗算
        FR += ((m % 10) > 0) ? dropF : 0;//1分以上なら読み飛ばさなかったフレームを加算
        FR += s * sF;//秒数乗算
        FR -= (((m % 10) > 0) && (s > 0)) ? dropF : 0;//00 10 20 30 40 50 分の例外フレームを減算して解決
        FR += f;//フレームを加算
        FR -= (((m % 10) > 0) && (s == 0) && (f >= dropF)) ? dropF : 0;//例外ドロップフレームを減算
//ここで存在しないはずの ドロップされたフレームは減算対象外にして後ろに送る

        return FR * negative_flag;
    } else {
        /**
         * 標準処理(ドロップ含む)
         */
//	if (fct.match(/[0-9\:\p\/\+]/)) {return fct}
        /**
         * ローカル変数初期化
         * @type {number}
         */
        var p = 1;
        var h = 0;
        var m = 0;
        var s = 0;
        var k = 0;
        /**
         * type 1    00000 ドロップは存在しない FR
         */
        if (fct.match(/^[0-9]+$/)) {
            k = fct;
        } else {
            /**
             * type 2    0:00:00 少数フレームレートの際にドロップ発生  TC
             */
            if (fct.match(/^([0-9]+:){1,3}[0-9]+$/)) {
                /**
                 * TCなのでスプリットして配列に入れる
                 * @type {Array}
                 */
                tmpTC = [];
                tmpTC = fct.split(":");
                switch (tmpTC.length) {
                    case 4:
                        h = tmpTC[tmpTC.length - 4];
                    case 3:
                        m = tmpTC[tmpTC.length - 3];
                    case 2:
                        s = tmpTC[tmpTC.length - 2];
                    case 1:
                        k = tmpTC[tmpTC.length - 1];
                }
            } else {
                /**
                 * type 3    000 + 00   trad-JA
                 */
                if (fct.match(/^[0-9]+\+[0-9]+$/)) {
                    s = fct.substring(0, fct.search(/\+/));
                    k = fct.substr(fct.search(/\+/) + 1);
                } else {
                    /**
                     * type 4    p 0 / 0 + 00 page-SK
                     */
                    if (fct.match(/^p[0-9]+\/[0-9]+\+[0-9]+$/)) {
                        p = fct.slice(1, fct.search(/\x2F/));
                        s = fct.substring(fct.search(/\x2F/) + 1, fct.search(/\+/));
                        k = fct.substr(fct.search(/\+/) + 1);
                    } else {
                        /**
                         * type 5    p 0 / + 000 page-K
                         */
                        if (fct.match(/^p[0-9]+\/\+[0-9]+$/)) {
                            p = fct.slice(1, fct.search(/\x2F/));
                            k = fct.substr(fct.search(/\+/) + 1);
                        } else {
                            /**
                             * ダメダメ
                             */
                            return fct;
                        }
                    }
                }
            }
        }
        /**
         * 数値化して全加算
         * @type {Number}
         */
        p = parseInt(p, 10);
        h = parseInt(h, 10);
        m = parseInt(m, 10);
        s = parseInt(s, 10);
        k = parseInt(k, 10);
        /**
         * タイムコード的にはすべて整数であることが必須
         * フレームレートが少数点以下の値を含む場合はすべて切り上げてフレームを得る
         * → (1+10.5)は(1+11)にあたる
         */
        var Seconds = (p - 1) * this.SheetLength + h * (60 * 60) + m * (60) + s;
        var Frames = Math.ceil(( Seconds * fpsC ) + k) - ostF;

        /**
         * ナチュラルドロップフレームの判定 フレーム継続時間の末尾が秒境界をまたがった場合をドロップカウントする
         * 連続してフレームがドロップすることはありえないのでこのように判定
         * 整数フレームレート時に実行されていたので、トラップする 2012 0205
         */
        if (((fpsC % 1) != 0) && (Math.floor(Frames / fpsC) != (Seconds))) {
            return null
        }
//{alert ("drop :"+Frames+" >> "+(Frames)/fpsC+":"+Seconds)};
        /**
         * この判定のため電卓の計算式に使用するときのトラップが発生するので注意(2010/11/06)
         */
        return Frames * negative_flag;
    }
};
/**
 * お道具箱汎用データ操作関数群
 * お道具箱汎用データ操作関数群オワリ
 */

/**
 * ベクトル演算関数群
 */


/**
 * nas.preformvector(vec1,vec2)
 * 引数:    ベクトル（配列）２つ
 * 戻値:    次数の揃ったベクトル（配列）２つ
 * ベクトル演算事前処理
 * 与えられたベクトルの次数を多いものに揃えて不足分に0を加えて返す
 * 内部使なのでエイリアスは不要
 *
 * @param vec1
 * @param vec2
 * @returns {*[]}
 */
nas.preformvector = function (vec1, vec2) {
    /**
     * 単項スカラだった場合、要素数1の配列に変換しておく。
     */
    if (typeof(vec1) == "number") {
        vec1 = [vec1];
    }
    if (typeof(vec2) == "number") {
        vec2 = [vec2];
    }
    /**
     * ベクトルの次数を求める 二次元か三次元か四次元か
     * @type {number}
     */
    var difD = (vec1.length - vec2.length);
    var vecD = (vec1.length > vec2.length) ? vec1.length : vec2.length;
    /**
     * 要素数の多い方をとって不足する要素は0で補う
     */
    if (difD > 0) {
        for (var idx = 0; idx < difD; idx++) {
            vec2 = vec2.concat([0])
        }
    } else {
        if (difD < 0) {
            for (var idx = 0; idx > difD; idx--) {
                vec1 = vec1.concat([0])
            }
        }
    }
    return [vec1, vec2, vecD];
};

/**
 * nas.add(vec1,vec2)
 * 引数:ベクトル配列1 ベクトル配列2
 * 戻値:各項を加算したベクトル
 * ベクトル和を返す。
 *
 * @param vec1
 * @param vec2
 * @returns {Array}
 */
nas.add = function (vec1, vec2) {
    var preformedVec = this.preformvector(vec1, vec2);
    var vec3 = new Array(preformedVec[2]);
    /**
     * 和を求めて返す。
     */
    for (idx = 0; idx < vec3.length; idx++) {
        vec3[idx] = preformedVec[0][idx] + preformedVec[1][idx]
    }
    return vec3;
};

/**
 * nas.sub(vec1,vec2)
 * 引数:ベクトル配列1 ベクトル配列2
 * 戻値:各項を減算したベクトル
 * ベクトル差を返す
 *
 * @param vec1
 * @param vec2
 * @returns {Array}
 */
nas.sub = function (vec1, vec2) {
    var preformedVec = this.preformvector(vec1, vec2);
    var vec3 = new Array(preformedVec[2]);
    /**
     * 差を求めて返す。
     */
    for (idx = 0; idx < vec3.length; idx++) {
        vec3[idx] = preformedVec[0][idx] - preformedVec[1][idx]
    }
    return vec3;
};

/**
 * nas.mul(vec,amount)
 * 引数:ベクトル配列 乗数
 * 戻値:各項に乗数を積算したベクトル
 * ベクトル積を返す
 * @param vec
 * @param amount
 * @returns {Array}
 */
nas.mul = function (vec, amount) {
    if (typeof(vec) == "number") vec = [vec];
    /**
     * ベクトルの次数を求める 二次元か三次元か四次元か
     */
    var vecD = (vec.length);
    var vecNew = new Array(vecD);
    /**
     * 積を求めて返す。
     */
    for (idx = 0; idx < vecD; idx++) {
        vecNew[idx] = vec[idx] * amount
    }
    return vecNew;
};

/**
 * nas.div(vec,amount)
 * 引数:ベクトル配列 商数
 * 戻値:各項を商数で割ったベクトル
 * ベクトル商を返す
 * @param vec
 * @param amount
 * @returns {Array}
 */
nas.div = function (vec, amount) {
    if (typeof(vec) == "number") {
        vec = [vec];
    }
    /**
     * ベクトルの次数を求める 二次元か三次元か四次元か
     */
    var vecD = (vec.length);
    var vecNew = new Array(vecD);
    /**
     * 商を求めて返す。
     */
    for (idx = 0; idx < vecD; idx++) {
        vecNew[idx] = vec[idx] / amount
    }
    return vecNew;
};

/**
 * nas.clamp(vec, limit1, limit2)
 * 引数:ベクトル配列 制限値１ 制限値２
 * 戻値:制限値の範囲内にクランプされたベクトル
 * ベクトルを制限値でクランプする
 * @param vec
 * @param limit1
 * @param limit2
 * @returns {Array}
 */
nas.clamp = function (vec, limit1, limit2) {
    var max = limit1;
    var min = limit2;
    if (limit1 < limit2) {
        max = limit2;
        min = limit1
    }
    if (typeof(vec) == "number") {
        vec = [vec];
    }
    /**
     * ベクトルの次数を求める 二次元か三次元か四次元か
     */
    var vecD = (vec.length);
    var vecNew = new Array(vecD);
    /**
     * 要素ごとに値をクランプして返す。
     */
    for (idx = 0; idx < vecD; idx++) {
        if (vec[idx] >= min && vec[idx] <= max) {
            vecNew[idx] = vec[idx];
        } else {
            vecNew = (vec[idx] >= min ) ? vecNew.concat([max]) : vecNew = vecNew.concat([min]);
        }
    }
    return vecNew;
};

/**
 * nas.dot(vec1,vec2)
 * 引数:ベクトル配列1 ベクトル配列2
 * 戻値:ベクトル要素の内積
 * ベクトル内積
 * @param vec1
 * @param vec2
 * @returns {number}
 */
nas.dot = function (vec1, vec2) {
    var Result = 0;
    /**
     * 要素ごとに積算。
     */
    for (idx = 0; idx < preformedVec[2].length; idx++) {
        Result += (preformedVec[0][idx] * preformedVec[1][idx])
    }
    return Result;
};

/**
 * nas.cross(vec1, vec2)
 * 引数:ベクトル配列1 ベクトル配列2
 * 戻値:ベクトル要素の外積
 * AEの仕様に合わせて2次元と3次元の値のみを計算する
 * @param vec1
 * @param vec2
 * @returns {number}
 */
nas.cross = function (vec1, vec2) {
    var preformedVec = this.preformvector(vec1, vec2);
    vec1 = preformedVec[0];
    vec2 = preformedVec[1];
    var vecD = preformedVec[2];
    var Result = 0;
    /**
     * 2次元か3次元で分岐
     */
    switch (vecD) {
        case 2:
            /**
             * 2次元の時は外積を求めるためz座標値に0を補ってやる。(breakなし)
             * @type {Array.<T>|string}
             */
            vec1 = vec1.concat([0]);
            vec2 = vec2.concat([0]);
        case 3:
            Result = [vec1[1] * vec2[2] - vec1[2] * vec2[1],
                vec1[2] * vec2[0] - vec1[0] * vec2[2],
                vec1[0] * vec2[1] - vec1[1] * vec2[0]];
            break;
        default:
            Result = "2次元か3次元の値である必要があります。";
    }
    return Result;
};

/**
 * nas.length(vec)
 * 引数:ベクトル配列
 * 戻値:ベクトル長
 * ベクトルの長さを求める
 * @param vec
 * @returns {*}
 */
nas.length = function (vec) {
    /**
     * 引数がいくつかを求める
     */
    if (arguments.length == 2) {
        if (typeof(arguments[0]) == "number" &&
            typeof(arguments[1]) == "number"
        ) {
            vec = [arguments[0], argments[1]];
        } else {
            if (typeof(arguments[0][0]) == "number" &&
                typeof(arguments[0][1]) == "number" &&
                typeof(arguments[1][0]) == "number" &&
                typeof(arguments[1][1]) == "number"
            ) {
                vec = this.sub(arguments[0], arguments[1]);
            } else {
                return "配列を入力しましょう";
            }
        }
    }
    /**
     * ベクトルの次数を求める 二次元か三次元か四次元か
     */
    var vecD = (vec.length);
    if (isNaN(vecD)) {
        return
    }
    var Length;
    /**
     * 長さを求める
     */
    switch (vecD) {
        case 1:
            Length = vec[0];
            break;
        case 2:
        case 3:
            Length = Math.pow(Math.pow(vec[0], 2) + Math.pow(vec[1], 2), .5);
            if (vecD > 2) {
                for (idx = 2; idx < vecD; idx++) {
                    Length = Math.pow(Math.pow(Length, 2) + Math.pow(vec[idx], 2), .5)
                }
            }
            break;
        default:
            return "2次元または3次元の値を入力しましょう";
    }
    return Length;
};

/**
 * nas.normalize(vec)
 * 引数:ベクトル配列
 * 戻値:単位長ベクトル
 * 方向が同じで長さ１のベクトル
 * @param vec
 * @returns {Array}
 */
nas.normalize = function (vec) {
    return this.div(vec, this.length(vec))
};

/**
 * @desc ベクトル演算関数おしまい
 */

/**
 * AE ExpressionOtherMath 互換 角度<>ラジアン変換関数
 * 桁切らないほうが良いかも、運用してみて判断しましょう 2006/06/23
 * @param degrees
 * @returns {number}
 */
nas.degreesToRadians = function (degrees) {
    return Math.floor((degrees / 180.) * Math.PI * 100000000) / 100000000;
};
/**
 * @param radians
 * @returns {number}
 */
nas.radiansToDegrees = function (radians) {
    return Math.floor(180. * (radians / Math.PI) * 100000) / 100000;
};

/**
 * @desc 互換のためエイリアスを設定する
 */
if (typeof (preformvector) == "undefined") var preformvector = nas.preformvector;
if (typeof (add) == "undefined") var add = nas.add;
if (typeof (sub) == "undefined") var sub = nas.sub;
if (typeof (mul) == "undefined") var mul = nas.mul;
if (typeof (div) == "undefined") var div = nas.div;
if (typeof (clamp) == "undefined") var clamp = nas.clamp;
if (typeof (dot) == "undefined") var dot = nas.dot;
if (typeof (cross) == "undefined") var cross = nas.cross;
if (typeof (length) == "undefined") var length = nas.length;
if (typeof (normalize) == "undefined") var normalize = nas.normalize;
if (typeof (degreesToRadians) == "undefined") var degreesToRadians = nas.degreesToRadians;
if (typeof (radiansToDegrees) == "undefined") var radiansToDegrees = nas.radiansToDegrees;
/**
 * 以前のコードを洗ってエイリアスが不要なら削除のこと AEエクスプレッション準互換ベクター/数学関数
 */


/**
 * corveto 関連の関数
 * なんかまだつらそうだがとりあえず設定しておく
 * ベジェの一次式
 *
 * @param SP
 * @param CP1
 * @param CP2
 * @param EP
 * @param T
 * @returns {*}
 */
nas.bezier = function (SP, CP1, CP2, EP, T) {
    /**
     * この式は定義どおりの式
     * @type {number}
     */
    var Ax = EP - SP - (3 * (CP2 - CP1));
    var Bx = 3 * (CP2 - (2 * CP1) + SP);
    var Cx = 3 * (CP1 - SP);

    var Result = (Ax * Math.pow(T, 3)) + (Bx * Math.pow(T, 2)) + (Cx * T) + SP;

    return Result;
};

/**
 * 一次ベジェの逆関数 係数と値から序変数tをもとめる
 * この関数は範囲を限定してタイミングを求める関数として生かし
 * SP=0  EP=1
 *
 * @param CP1
 * @param CP2
 * @param Vl
 * @returns {*}
 */
nas.bezierA = function (CP1, CP2, Vl) {
    /**
     * 制御点の範囲を0-1に限定して値の増加傾向を維持することで、値に対する助変数を決定する 関数。
     * 一般値を求める関数ではありませんのでご注意ください。
     */
    if (Vl > 1 || CP1 > 1 || CP2 > 1 || Vl < 0 || CP1 < 0 || CP2 < 0) {
        return "rangeover";
    }
    var Ck = 0;
    if (Vl == 0) {
        var t = 0
    } else {
        if (Vl == 1) {
            var t = 1
        } else {
            /**
             * 初期化
             * 助変数の初期値を値にとる
             * テスト用仮値
             */
            t = Vl;
            /**
             * 求めた助変数でテスト値をとる
             * 助変数が
             * @type {*}
             */
            var TESTv = this.bezier(0, CP1, CP2, 1, t);//初期テスト値
            /**
             * 上限値
             * @type {number}
             */
            var UPv = 1;
            /**
             * 下限値
             * @type {number}
             */
            var DOWNv = 0;
            do {
                if (TESTv < Vl) {
                    DOWNv = t
                } else {
                    UPv = t
                }
                /**
                 * テスト値によって上限または下限を入れ換え
                 * @type {number}
                 */
                t = (DOWNv + UPv) / 2;
                /**
                 * チェック回数(デバック用)
                 * @type {number}
                 */
                Ck = Ck + 1;
                TESTv = this.bezier(0, CP1, CP2, 1, t);
            } while (TESTv / Vl < 0.999999999 || TESTv / Vl > 1.0000000001);
            /**
             * テスト値が目標値にたいして十分な精度になるまでループ(精度調整待ち 05/01)
             */
        }
    }
    t = Math.round(t * 100000000) / 100000000;

    if (dbg) dbg_info.notice = "loop-count is " + Ct;
    /**
     * デバッグメモにカウンタの値を入れる
     * 助変数
     * @type {number}
     */
    var Result = t;
    return Result;
};

/**
 * 一般式ﾍﾞｼﾞｪの弧の長さを求める
 * 引数は
 * bezierL(開始値,制御点1,制御点2,終了値[[,開始助変数,終了助変数],分割数])
 * 分割数が省略された場合は    10
 * 開始・終了助変数が省略された場合は    0-1
 *
 * @param SP
 * @param CP1
 * @param CP2
 * @param EP
 * @param sT
 * @param eT
 * @param Slice
 * @returns {*}
 */
nas.bezierL = function (SP, CP1, CP2, EP, sT, eT, Slice) {
    if (!SP)    SP = 0;
    if (!EP)    EP = 1;
    if (!CP1)    CP1 = 0;
    if (!CP2)    CP2 = 1;

    if (!Slice)    Slice = 10;
    if (!sT)    sT = 0;
    if (!eT)    eT = 1;

    /**
     * AEの仕様に合わせて 単項、2次元3次元のみを扱う
     * 次元数取得
     * @type {number}
     */
    var Dim = (typeof(SP) == "number") ? 1 : SP.length;

    /**
     * 分割長テーブルを作る
     * @type {Array}
     */
    var Ltable = new Array(Slice);

    for (i = 0; i < Slice; i++) {
        switch (Dim) {
            case    1:
                Ltable[i] = Math.abs(
                    this.bezier(SP, CP1, CP2, EP, sT + (eT - sT) * (i / Slice)) -
                    this.bezier(SP, CP1, CP2, EP, sT + (eT - sT) * ((i + 1) / Slice))
                );
                break;
            case    2:
                var p1x = this.bezier(SP[0], CP1[0], CP2[0], EP[0], sT + (eT - sT) * (i / Slice));
                var p1y = this.bezier(SP[1], CP1[1], CP2[1], EP[1], sT + (eT - sT) * (i / Slice));

                var p2x = this.bezier(SP[0], CP1[0], CP2[0], EP[0], sT + (eT - sT) * ((i + 1) / Slice));
                var p2y = this.bezier(SP[1], CP1[1], CP2[1], EP[1], sT + (eT - sT) * ((i + 1) / Slice));
// alert([p1x,p1y],[p2x,p2y]);

                Ltable[i] = this.length(this.sub([p1x, p1y], [p2x, p2y]));
                break;
            case    3:
                var p1x = this.bezier(SP[0], CP1[0], CP2[0], EP[0], sT + (eT - sT) * (i / Slice));
                var p1y = this.bezier(SP[1], CP1[1], CP2[1], EP[1], sT + (eT - sT) * (i / Slice));
                var p1z = this.bezier(SP[2], CP1[2], CP2[2], EP[2], sT + (eT - sT) * (i / Slice));

                var p2x = this.bezier(SP[0], CP1[0], CP2[0], EP[0], sT + (eT - sT) * ((i + 1) / Slice));
                var p2y = this.bezier(SP[1], CP1[1], CP2[1], EP[1], sT + (eT - sT) * ((i + 1) / Slice));
                var p2z = this.bezier(SP[2], CP1[2], CP2[2], EP[2], sT + (eT - sT) * ((i + 1) / Slice));
                Ltable[i] = this.length(this.sub([p1x, p1y, p1z], [p2x, p2y, p2z]));
                break;
            default    :
                return false;
        }
    }
    var T = 0;
    for (n in Ltable) {
        T += Ltable[n]
    }

    return T;
};

/**
 * 暫定色彩関連関数
 * @param colorString
 * @returns {*}
 */
nas.colorStr2Ary = function (colorString) {
    var Cr = .5;
    var Cg = .5;
    var Cb = .5;
    if (colorString.match(/^\#[0-9abcdef]+/i)) {
        Cr = eval("0x" + colorString.substr(1, 2) + " /255");
        Cg = eval("0x" + colorString.substr(3, 2) + " /255");
        Cb = eval("0x" + colorString.substr(5, 2) + " /255");
        return [Cr, Cg, Cb];
    }
    if (colorString.match(/^rgb\([\d]*\%?[\s\,]+[\d]*\%?[\s\,]+[\d]*\%?\)$/)) {
        var myColor = eval(
            colorString.replace(/rgb\(/, "\[").replace(/\)/ig, "\]").replace(/\%/g, "\*2.55")
        );
        return this.div(myColor, 255);
    }
    return [Cr, Cg, Cb];
};

/**
 * WEB色指定用の文字列を3次元の配列にして返す
 * @param colorArray
 * @returns {string}
 */
nas.colorAry2Str = function (colorArray) {
    var Sr = ((colorArray[0] * 255) >= 16) ?
        Math.round(colorArray[0] * 255).toString(16) :
    "0" + Math.round(colorArray[0] * 255).toString(16);
    var Sg = ((colorArray[1] * 255) >= 16) ?
        Math.round(colorArray[1] * 255).toString(16) :
    "0" + Math.round(colorArray[1] * 255).toString(16);
    var Sb = ((colorArray[2] * 255) >= 16) ?
        Math.round(colorArray[2] * 255).toString(16) :
    "0" + Math.round(colorArray[2] * 255).toString(16);
    return "#" + Sr + Sg + Sb;
};


/**
 * 配列形式のカラーデータを16進文字列で返す
 */

/**
 * 行列計算関数群
 * 原型となったtcl 処理系との互換のため引数はリスト文字列または1次元の配列で与える必要があるので注意
 */

/**
 * 行列表示(特設デバッグ表示)
 * @param Name
 * @param Matrix
 * @param L
 * @param C
 */
nas.showMatrix = function (Name, Matrix, L, C) {
    if ((Matrix instanceof Array)) Matrix = Matrix.toString();
    Matrix = Matrix.split(',');
    /**
     * 表示名 行列リスト 行数 列数
     * @type {string}
     */
    var Result = Name + ":\n";

    for (i = 0; i < L; i++) {
        for (j = 0; j < C; j++) {
//	puts -nonewline [format \t%\ 4.4f [lindex ${Matrix} [expr ${i} * ${C} + ${j}]]]
            Result += "\t " + Matrix[i * C + j];
        }
        Result += "\n";
    }
    alert(Result);

};
/**
 *  @desc 行列表示終わり
 */

/**
 * 行列式計算(2または3,4 の正方行列のみ)
 * @param myMatrix
 * @returns {*}
 */
nas.mDeterminant = function (myMatrix) {
    if ((myMatrix instanceof Array)) {
        myMatrix = myMatrix.toString().split(',');
    } else {
        myMatrix = myMatrix.split(',');
    }
    if (myMatrix.length != 4 && myMatrix.length != 9 && myMatrix.length != 16) {
        return null;
    }//ひとまずヌル返す？
    if (myMatrix.length == 4) {
//var Result [expr [lindex ${Matrix} 0] * [lindex ${Matrix} 3] - [lindex ${Matrix} 1] * [lindex ${Matrix} 2]]
        /**
         * 2×2の正方行列式
         * @type {number}
         */
        var Result = myMatrix[0] * myMatrix[3] - myMatrix[1] * myMatrix[2];
    } else {
        if (myMatrix.length == 9) {
            /**
             * 3×3の正方行列
             * @type {number}
             */
            var Result = 0;
            Result += (1 * myMatrix[0]) * (1 * myMatrix[4]) * (1 * myMatrix[8]);
            Result += (1 * myMatrix[1]) * (1 * myMatrix[5]) * (1 * myMatrix[6]);
            Result += (1 * myMatrix[2]) * (1 * myMatrix[3]) * (1 * myMatrix[7]);
            Result -= (1 * myMatrix[0]) * (1 * myMatrix[5]) * (1 * myMatrix[7]);
            Result -= (1 * myMatrix[1]) * (1 * myMatrix[3]) * (1 * myMatrix[8]);
            Result -= (1 * myMatrix[2]) * (1 * myMatrix[4]) * (1 * myMatrix[6]);
        } else {
            /**
             * 正方行列 4x4
             * @type {*[]}
             */
            myMatrix = [myMatrix.slice(0, 4), myMatrix.slice(4, 8), myMatrix.slice(8, 12), myMatrix.slice(12)];
            var Result = 1.0;
            var buf;
            var n = 4;  //配列の次数

            /**
             * 三角行列を作成
             */
            for (var i = 0; i < n; i++) {
                for (var j = 0; j < n; j++) {
                    if (i < j) {
                        var buf = myMatrix[j][i] / myMatrix[i][i];
                        for (var k = 0; k < n; k++) {
                            myMatrix[j][k] -= myMatrix[i][k] * buf;
                        }
                    }
                }
            }

            /**
             * 対角部分の積
             */
            for (i = 0; i < n; i++) {
                Result *= myMatrix[i][i]
            }
        }
    }
    return Result;
};
/**
 * @desc 行列式計算終わり
 */

/**
 * 行列の積算
 * @param M1
 * @param M2
 * @returns {*}
 */
nas.multiMatrix = function (M1, M2) {
    if (M1 instanceof Array) {
        M1 = M1.toString().split(',')
    } else {
        M1 = M1.split(",");
    }
    if (M2 instanceof Array) {
        M2 = M2.toString().split(',')
    } else {
        M2 = M2.split(",");
    }

    /**
     * M1 は、3×3の行列 M2は、3×? の行列でなくてはならない
     * それ以外の場合は、3×3 の単位行列を返す
     */
    if (M1.length != 9 || M2.length % 3 != 0) {
        return "1,0,0,0,1,0,0,0,1";
    }
    /**
     *  応答行列初期化
     * @type {Array}
     */
    var multiprideMatrix = [];
    /**
     * 行列の次数を設定
     * @type {number}
     */
    var D1C = 3;
    var D1L = 3;
    var D2C = Math.floor(M2.length / D1L);
    var D2L = D1C;
    for (Mi = 0; Mi < D1L; Mi++) {
        for (Mj = 0; Mj < D2C; Mj++) {
            var X = 0;
            for (count = 0; count < D1C; count++) {
                X = X + M1[Mi * D1C + count] * M2[Mj % D2C + D2C * count];
            }
            multiprideMatrix.push(X);
        }
    }
    return multiprideMatrix.toString();
};
/**
 * @desc 行列の積算終わり
 */


/**
 * 逆行列生成
 * 2次または3次/4次の正方行列である必要があります。
 * @param Matrix
 * @returns {*}
 */
nas.mInverse = function (Matrix) {
    if (Matrix instanceof Array) {
        Matrix = Matrix.toString().split(',')
    } else {
        Matrix = Matrix.split(',')
    }
    if (Matrix.length != 4 && Matrix.length != 9 && Matrix.length != 16) {
        return null;
    }
    /**
     * 逆行列初期化
     * @type {Array}
     */
    var InversedMatrix = [];
    /**
     * 行列の次数を取得
     * @type {number}
     */
    var D = Math.sqrt(Matrix.length);// expr int(sqrt ([llength ${Matrix}]))]
    /**
     * 余因数生成
     */
    for (j = 0; j < D; j++) {
        for (i = 0; i < D; i++) {
            var Cm = [];
            for (Cj = 0; Cj < D; Cj++) {
                for (Ci = 0; Ci < D; Ci++) {
                    if ((Cj - j) == 0) {

                    } else {
                        if ((Ci - i) == 0) {

                        } else {
                            Cm.push(Matrix[Cj * D + Ci]);
                        }
                    }
                }
            }
            var Mx = this.mDeterminant(Matrix);
            InversedMatrix.push(this.mDeterminant(Cm) * Math.pow(-1, i + j) / Mx)
        }
    }
    return this.transMatrix(InversedMatrix).toString();
};
/**
 * @desc 逆行列生成終わり
 */


/**
 * 行列の転置
 * @param Matrix
 * @returns {*}
 
    引数は以下の型式を受け入れる
    '1,0,0,1','1,0,0,0,1,0,0,0,1' ,'1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1'
コンマ区切り文字列リストただしコンマ区切りの要素数が4,9,16(それぞれ2,3,4次の正方行列)のみ
    ['1,0','0,1'],['1,0,0','0,1,0','0,0,1'],['1,0,0,0','0,1,0,0','0,0,1,0','0,0,0,1']
コンマ区切りリスト文字列を要素とする１次配列　同上それぞれ2,3,4次の正方行列のみ
    [[1,2,3],[4,5,6],[7,8,9],[10,11,12]]
２次元配列　要素数は自由　引数配列の要素すべてが配列でなければならない　次数は自由
内包要素の次数はすべて揃っている必要がある。
戻り値は配列に変更

*/
nas.transMatrix = function (Matrix) {
    var dx = 0;var dy = 0;
    if (Matrix instanceof Array) {
        if(Matrix[0] instanceof Array){
            dy=Matrix.length;
            dx=Matrix[0].length;
            //２次元配列なら要素数を検査して不整合があればリジェクト
            for (var idx=0;idx<dy;idx++){
                if(Matrix[idx].length != dx){return false;}
            }
        }
        Matrix = Matrix.toString().split(',');
    } else {
        Matrix = Matrix.split(',')
    }
    if ((dx == 0) && (dy == 0) &&
    (Matrix.length != 4 && Matrix.length != 9 && Matrix.length != 16)
    ) {
        return null;
    } else {
            /**
     * 行列の次数を取得
     * @type {number}
     */
        dx = Math.sqrt(Matrix.length);
        dy = dx;
    }
    /**
     * 転置配列の初期化
     * @type {Array}
     */
    var tranposedMatrix = [];
    /**
     * 転置
     */
    for (var j = 0; j < dx; j++) {
        for (var i = 0; i < dy; i++) {
            tranposedMatrix.push(Matrix[i * dx + j]);
        }
    }
    return tranposedMatrix;
};
// nas.transMatrix([[1,2,3],[4,5,6],[7,8,9]]);
/**
 * 行列の転置終わり
 * 行列関数群終わり
 */

/**
 * 回転角関連
 * azimuth（アジマス）は地図・海図等で使用する方位角。
 * ここでは時計の12時方向(北=N)を0度として時計回り方向に 1周360°の単位系とします。
 * 方位角の概念は AEには存在しない
 * @param degrees
 * @returns {number}
 */
nas.deg2azi = function (degrees) {//傾斜角から方位へ
    return (-1 * degrees + 90);
};
nas.azi2deg = function (azimuth) {//方位から傾斜角へ
    return (-1 * (azimuth - 90))
};

/**
 * 2次元のベクトルを与えて方位角を求める。長さを加えるべきか？
 * 引数formは戻し値の形式を指定。デフォルトは方位角
 * @param Vector
 * @param form
 * @returns {*}
 */
function vec2deg(Vector, form) {
    if (Vector.length != 2) {
        return false
    }
    if (!form) {
        form = "degrees"
    }
    var x = Vector[0];
    var y = Vector[1];
    var myRadians = (y == 0) ? 0 : Math.atan(y / x);
    if (x < 0) {
        myRadians += Math.PI
    }
    switch (form) {
        case        "redians":
            var result = myRadians;
            break;
        case        "degrees":
            var result = Math.floor(180. * (myRadians / Math.PI) * 10000) / 10000;//degrees;
            break;
        case        "azimuth":
        default    :
            var result = nas.deg2azi(radiansToDegrees(myRadians));
            break;
    }
    return result;
}
/**
 * 暫定文字列操作メソッド
 * バイト数を返す。
 * 実装によっては内部コードが違うのでマルチバイト部分のバイト数は同じとは限らない。
 * @param myString
 * @returns {number}
 */
nas.biteCount = function (myString) {
    if (!myString) {
        myString = "";
    }
    var btCount = 0;
    for (cid = 0; cid < myString.length; cid++) {
        cXV = myString.charCodeAt(cid);
        while (cXV > 0) {
            btCount++;
            cXV = Math.floor(cXV / 256);
        }
    }
    return btCount;
};


/**
 * 文字列のバイト数を勘定して、指定バイト以下の文字列に区切って返す。
 * AEのラベル31バイト制限用なので、デフォルトは 31
 * @param myString
 * @param count
 * @returns {*}
 */
nas.biteClip = function (myString, count) {
    if (!myString) {
        myString = "";
    }
    if (!count) {
        count = 31
    }
    var btCount = 0;
    for (cid = 0; cid < myString.length; cid++) {
        cXV = myString.charCodeAt(cid);
        while (cXV > 0) {
            btCount++;
            cXV = Math.floor(cXV / 256);
        }
        if (btCount > count) {
            return myString.slice(0, cid);
        }
    }
    return myString;//抜けたら全部返す
};

/**
 * nas.incrStr(myString,Step,Opt)
 * 引数　任意文字列
 * 戻値	文字列の末尾の番号部分をステップ数くり上げて返す
 * ステップに負の数を与えると減算 戻り値が0負の数の場合は元の文字列を戻す
 * １０進数値のみサポート
 * 数字の末尾にサブバージョン表記として[a-z]の
 * postfixがあってもそれを切り捨てて評価するのでちょっとだけ便利
 * 番号がなければそのまま戻す
 * オプションでpostfixを付けて戻す
 *
 * @param myString
 * @param myStep
 * @param myOpt
 * @returns {*}
 */
nas.incrStr = function (myString, myStep, myOpt) {
    if (typeof myOpt == "undefined") {
        myOpt = false
    }
    //if true with postFix
    if (isNaN(myStep)) {
        myStep = 1
    }
    if (myString.match(/^(.*[^\d])?(\d+)([^0-9]*)$/i)) {
        var myPreFix = RegExp.$1;
        var myNumber = RegExp.$2;
        var myPstFix = (myOpt) ? RegExp.$3 : "";
        var newNum = ((parseInt(myNumber, 10) + myStep) > 0) ? nas.Zf(parseInt(myNumber, 10) + myStep, myNumber.length) : myNumber;
        return myPreFix + newNum + myPstFix;
    }
    return myString;
};

/**
 * nas.propCount(myObject,option)
 * 引数:	任意のオブジェクト,リストスイッチ
 * 戻値	オブジェクトのもつプロパティの数
 *
 * 単純にオブジェクトの総数を返す
 * 削除されたが参照が残っているために無効になったオブジェクトを検査するために作成
 * ただしそれ以外の用途で使用できないわけではない
 * リストスイッチを入れるとプロパティを配列で返す
 *
 * @param myObject
 * @param myOption
 * @returns {*}
 */
nas.propCount = function (myObject, myOption) {
    if (!myObject) {
        return false;
    }
    if (myOption) {
        var resultArray = [];
    }
    var myResult = 0;
    for (prp in myObject) {
        myResult++;
        if (myOption) {
            resultArray.push(prp)
        }
    }
    if (myOption) {
        return resultArray;
    } else {
        return myResult;
    }
};


/**
 * 単位つきの文字列値を数値にして返すメソッド
 *
 * nas.decodeUnit(入力値,変換単位)
 *
 * 解釈できる単位は millimeters mm centimeters cm points picas pt pixels px inches in
 * 戻し値の単位も同じく
 * デフォルトの単位は入りも戻しも pt
 * 不明な単位は ptとして扱う
 *
 * @param myValue
 * @param resultUnit
 * @returns {*}
 */
nas.decodeUnit = function (myValue, resultUnit) {
    if ((myValue != undefined) && (myValue.match(/^([0-9]+.?[0-9]*)\s?(millimeters|mm|centimeters|cm|points|picas|pt|pixels|px|inches|in)?$/i))) {
        var baseValue = parseFloat(myValue);
        var myUnit = RegExp.$2;
    } else {
        return false;
    }
    if((typeof resultUnit == 'undefined')||(!(resultUnit.match(/^(millimeters|mm|centimeters|cm|points|picas|pt|pixels|px|inches|in)?$/i)))) {
        resultUnit = "pt";
    }
    if (myUnit == resultUnit) {
        return baseValue
    }
    /**
     * 入出力単位が一致した場合はコンバート不要
     * すべてptに変換 (ここに誤差が乗る原因あり)
     */
    switch (myUnit) {
        case    "inches":
        case    "in":
            myValue = 72. * baseValue;
            break;
        case    "pixels":
        case    "px":
            myValue = 72. * baseValue / this.Dpi();
            break;
        case    "centimeters":
        case    "cm":
            myValue = 72. * baseValue / 2.54;
            break;
        case    "millimeters":
        case    "mm":
            myValue = 72. * baseValue / 25.4;
            break;
        case    "millipoints":
        case    "mp":
            myValue = baseValue / 1000.;
            break;
        case    "points":
        case    "paicas":
        case    "pt":
        default    :
            myValue = baseValue;
    }
    switch (resultUnit) {
        case    "inches":
        case    "in":
            myResult = myValue / 72.;
            break;
        case    "pixels":
        case    "px":
            myResult = this.Dpi() * myValue / 72.;
            break;
        case    "centimeters":
        case    "cm":
            myResult = 2.54 * (myValue / 72.);
            break;
        case    "millimeters":
        case    "mm":
            myResult = 25.4 * (myValue / 72.);
            break;
        case    "millipoints":
        case    "mp":
            myResult = myValue * 1000.;
            break;
        case    "points":
        case    "paicas":
        case    "pt":
        default    :
            myResult = myValue;
    }
    return myResult;
};


/**
 * nas.labelNormalization(myString,mySep)
 * 引数：ラベル文字列 ,新規セパレータ
 * 戻値:正規化されたラベル文字列
 * ラベル文字列を正規化する
 * セパレータを払ってプレフィックス,12桁あわせ整数,ポストフィックスを指定のセパレータで結合したもの
 * セパレータが指定されない場合は""
 *
 * @param myString
 * @param mySep
 * @returns {*}
 */
nas.labelNormalization = function (myString, mySep) {
    if (typeof myString == "undefined") {
        return false
    }
    if (typeof mySep == "undefined") {
        mySep = ""
    }
    if (myString.toString().match(/([^\s\._\-]*)[\s\._\-]?([0-9]+)[\s\._\-]?([^0-9].*)/)) {
        var myPrefix = RegExp.$1;
        var myBodyNum = parseInt(RegExp.$2);
        var myPostfix = RegExp.$3;
        return [myPrefix, nas.Zf(myBodyNum, 32), myPostfix].join(mySep);
    } else {
        return myString.toString();
    }
};


//nas.labelNormalization("a 012a下")

//比較補助関数
/** nas.normalizeStr(myString)
 * 
 *  myString.normalizeメソッドが存在すればnormalize("NFKC")をもどす
 */

nas.normalizeStr = function(str){
if(str.normalize){return str.normalize("NFKC");}
// ノーマライズが無い時は半角化のみ実行

  str=str.replace(/[！-～]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);//char-code shift
  });
  // 文字コードシフトで対応できない文字の変換
  return str.replace(/”/g, "\"")
    .replace(/’/g, "'")
    .replace(/‘/g, "`")
    .replace(/￥/g, "\\")
    .replace(/　/g, " ")
    .replace(/〜/g, "~");
}


//nas.normalizeStr("安全ｶｸﾆﾝＢＡＮＤ（12３５）");


/**
 * 文字列中に最初に現れる数値部分を整数化して返す関数
 * 正規化フィルタを通し
 * 最初の数値の前の数字以外の文字を払い１０進で整数化して返す
 * 数値部分が含まれない場合は NaN が戻る
 *
 * 先行する数字以外をラベル
 * 数字の連続部分を数字部
 * それ以降を後置部と定義する
 * ＞小数点以下は後置部となる
 */
nas.parseNumber=function(str){
	if(! str.replace){str=str.toString();}
	return parseInt((this.normalizeStr(str)).replace(/^[^0-9]*/,""),10) 
}
/*
nas.parseNumber("A-125.3");
nas.parseNumber("１２３９３２");
nas.parseNumber("Final-A 123-under");
*/