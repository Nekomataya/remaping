/**
 *	@desc グラフィック部品のための試験コード
 *	最終的にはxUIの配下に入れてxUIのプロパティを参照すること
 *	引数:配置するグラフィックの種別と開始フレーム、継続時間
 *	戻値:グラフィックパーツオブジェクト
 */
/*
グラフィックパーツオブジェクトは、自身に可変数のcanvasオブジェクトへの参照を持って、自律的に自分自身の再描画を行う
リフレッシュ、又はリドローメソッドを装備して自分自身で呼び出す
リフレッシュの際は、開始フレームから継続時間に従って自分自身を何パーツに分解するかを決定して再描画を行う
既存のエレメントはなるべく再利用する。

new xUI.SheetGraph(pattern,startFrame,duration)
メソッド
　.show
　.hide
　.clear
　.hilite
　.draw
　下位オブジェクトに同名のメソッドを置く
　必要に従ってコール
*/
function addGraphElement() {
	    var objTarget = document.getElementById(xUI.Select.join("_")); 
	    var targetParent =document.getElementById("sheet_body"); 
	    
	    var targetRect=objTarget.getBoundingClientRect();
	    var parentRect=targetParent.getBoundingClientRect();
var myTop=targetRect.top-parentRect.top;
var myLeft=targetRect.left-parentRect.left;

	    var element = document.createElement('canvas'); 
	    element.id = "myCanvas"; 
element.style.position="absolute";
element.style.top=myTop+"px";
element.style.left=myLeft+"px";

	    element.width=targetRect.width;
	    element.height=targetRect.height*12;
	    var ctx = element.getContext("2d");
	    ctx.fillStyle="rgba(0,0,0,0.2)";
	    ctx.fillRect(Math.floor(targetRect.width/2),0, 1, targetRect.height*12);
	 
	    element=targetParent.appendChild(element); 
	    element.style.zIndex=1;//シートに合わせて設定
		element.style.pointerEvents='none';//イベントは全キャンセル
return element;
}
addGraphElement();

/*
追加したcanvas要素が、クリックイベントを横取りしてシートのイベントが発火しない
これは、
	オーバレイ側がイベントを受け取って不発になる
	追加したHTML要素のイベント発火に問題がある
の二点に問題があるらしい
正常にイベント発火が起きるように設定することは可能
その状態で
	アンダーレイにしてイベントが発火するようにする
		または
	　canvasのイベントを受け取ってクリックされたセルを計算する
いずれかの処置が必要

ただしpointerEventsプロパティで要素自体のイベントを全キャンセル可能
今回の処理では、テキストの代用なのでこちらで処理
置換えテキストは、ヌルストリングではなくスペースにしたほうが良いか？
→現状でテキスト選択自体ができないので無意味


*/
/*
	部分パーツ
	描画範囲:
		offset:開始フレーム左上
		width :トラック幅
		height:フレームいっぱい=開始フレーム上端〜終了フレーム下端
開始フレームと終了フレームは親オブジェクトから計算して分割
*/
//=========== 矢印付き区間表示線
//=========== スポッティング記号
//=========== 原画囲い強調　丸　三角　四角
//=========== 縦線
/*
	波線は、開始フレームの高さと同一幅で２フレームあたりの繰り返し素材をあらかじめ作成
繰り返し素材形状
始点 		(-振幅*0.5 ,0)
第一制御点	(-振幅*0.5 ,サイクル高さ*0.25)
第二制御点	( 振幅*0.5 ,サイクル高さ*0.25)
終点		( 振幅*0.5 ,サイクル高さ*0.5)

始点 		前終点
第一制御点	( 振幅*0.5　,サイクル高さ*0.75)
第二制御点	(-振幅*0.5  ,サイクル高さ*0.75)
終点		(-振幅*0.5  ,サイクル高さ)
*/
//=========== 波線
/*
	波線部品（１サイクル分）を出力する関数
	　引数:
	　	span	振幅(px)	セル高さ÷2
	　	cycle	サイクル高さ(px) タイムシートセルハイト
	　	offset	スタートオフセットfloat（0-1）default 0.5
	　戻り値:
	　	１cycle分の　HTML-Canvas　エレメント
	　	始点を(0,0)に置いた画像を返す
	　	クリッピングは受け取り側のCanvasで行うこと
	　	
*/
	    var objTarget = document.getElementById(xUI.Select.join("_")); 
	    var targetParent =document.getElementById("sheet_body"); 
	    var targetRect=objTarget.getBoundingClientRect();
	    var parentRect=targetParent.getBoundingClientRect();

var myTop=targetRect.top-parentRect.top;
var myLeft=targetRect.left-parentRect.left;
	
	var unitHeight=targetRect.height*2;
	var waveSpan  =10;
//=========波線のパターンブロック生成（＋描画キャッシュ）
if(document.getElementById("waveUnit")){
	var waveUnit=document.getElementById('waveUnit');
}else{	
	var waveUnit=document.createElement('canvas');
	waveUnit.ctx=waveUnit.getContext('2d');
	waveUnit.ctx.strokeStyle="rgb(0,0,0)";
	waveUnit.ctx.strokeWidth=1;
    waveUnit.width=waveSpan+2;
    waveUnit.height=unitHeight;
	waveUnit.ctx.moveTo(waveSpan+1, 0);
	waveUnit.ctx.bezierCurveTo(waveSpan+1, unitHeight*0.25, 1 , unitHeight*0.25,  1 , unitHeight*0.5);
	waveUnit.ctx.bezierCurveTo(1 , unitHeight*0.75, waveSpan+1, unitHeight*0.75, waveSpan+1, unitHeight);
	waveUnit.ctx.stroke();
	
//	var myView=document.getElementById("sheet_body");
	var myView=document.getElementById("sheet_view");
	waveUnit=myView.appendChild(waveUnit);
	waveUnit.id = "waveUnit"; 
    waveUnit.style.zIndex=1;//シートに合わせて設定
	waveUnit.style.pointerEvents='none';//イベントは全キャンセル
	waveUnit.style.position="absolute";
	waveUnit.style.top=0+"px";
	waveUnit.style.left=0+"px";
}
//=========ここまでパターン生成


	var waveline=document.createElement('canvas');
	var cellWidth =targetRect.width;
	var cellHeight=targetRect.height*12;

	waveline.ctx=waveline.getContext('2d');
//	var wavePtn=waveline.ctx.createPattern(document.getElementById("waveUnit"),"repeat-y");
	var wavePtn=waveline.ctx.createPattern(waveUnit,"repeat-y");
	var startOffset=0.25;
    waveline.width=cellWidth;
    waveline.height=cellHeight+unitHeight*startOffset;
//	waveline.ctx.fillStyle=wavePtn;
	waveline.ctx.strokeStyle=wavePtn;
	waveline.ctx.lineWidth=waveSpan+2;
	waveline.ctx.moveTo(waveSpan/2,unitHeight*startOffset);
	waveline.ctx.lineTo(waveSpan/2 ,cellHeight+unitHeight*startOffset);
	waveline.ctx.stroke();

//	waveline.ctx.beginPath();
//	waveline.ctx.fillRect(0,-12,waveSpan+2,cellHeight+12);
//	waveline.ctx.fill();
	
    waveline.id = "waveLine"; 

    waveline=targetParent.appendChild(waveline); 
    waveline.style.zIndex=1;//シートに合わせて設定
	waveline.style.pointerEvents='none';//イベントは全キャンセル
	waveline.style.position="absolute";
	waveline.style.top=myTop-unitHeight*startOffset+"px";
	waveline.style.left=myLeft+(cellWidth/2)-(waveSpan/2)+"px";
	waveline.style.brendMode="multiply";
	waveline.style.opacity="0.2";
//waveline.style.backgroundBlendMode="lighten";
/*
	始点からカーブ繰り返し
*/
//=========== クロスディソルブ
▼
▲
//=========== フェードイン
▲
//=========== フェードアウト
▼
/*
ミッドレベルでは、以下のファンクションが必要
引数:図形、開始フレーム、継続フレーム
戻値:HTMLCanvas(Image/Svg等)オブジェクトへの参照を一つだけ持ったグラフィックサブセクションエレメント
無名オブジェクトで、セクショングラフィックスのメンバー識別のためのIDは持たせる？エレメントIDは割りつけるー＞連番
*/
xUI.GraphElement=function(){
	this.element;
	this.form;
	this.start;
	this.duration;
}

/*
	XPSフォーマット自体がテキストベースなので、テキスト代替グラフィックパーツの位置づけとなる
	ただし、ユーザの感覚的には線、エフェクト等の区間を持ったデータは区間ごとに１つのエレメントとして認識されることに加え、描画上も個々の区間を１エレメントとして扱うほうがパフォーマンスが高い
	
	テキスト代替エレメントと区間エレメントの両方で扱うことが可能なように作成されるのが好ましい
	置きかえルーチンでは、画像オブジェクトに置きかえられる表示を選出して
	""(ヌルストリング)に置きかえ
	セクション内の図形代用表示以外は（基本的にコメントなので）すべて残す
	セクショングラフィック表示をコメント部分で分割するか否かはペンディング
	路線は「分割しない」方向だが　分割のクチは残す
	セクションパースとは混ぜない
	パースされたデータからセクションを作成して　セクション内の独立オブジェクトとして実装する
*/
/**
 *	ローレベルでは以下の機能が必要
引数:テンプレート図形オブジェクト,表示座標,クリッピングウインドウ
戻値:新規に作成されたHTMLCnavasObject

セクションオブジェクトの配下に置くメソッド
テンプレートの画像をクリップした画像エレメントを作成して返す


	
 */
