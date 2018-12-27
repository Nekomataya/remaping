﻿/*　タイムシート記述カメラワークDB

書式:
(キーワード)
	name:(キーワード)
	type:String "simbol","geometry","composite" サブタイプとしてエフェクト名称を使用
	aliases:[別名の配列]　正規表現サブセットで記述可能
	nodeSigns:[中間値補完サイン,セクション開始サイン,セクション終了サイン]
	description:記述の説明

name	ー	識別用名称

データベース内でユニークになるように注意
アルファベットのみ、空白不可
複合単語はキャメル記法で記述　"frame in"→"frameIn"


type	ー	抽象化された記述を分類する文字列


    geometry
geometryトラックに直接展開可能な一般記述
slide,rotation等が含まれるがそれだけにとどまらない
通常はフレーミング情報を値として持つことができる


    composite(.effectName)
compositeトラックに直接展開可能な一般記述
BK,WK,fi,fo　等
ベクトル以外の一つ以上のスカラー値を値として持つことができる
フィルタ類もこのタイプ

    transition(.effectName)
transition記述
２素材以上のcomposite値の複合オブジェクト
２つ以上のトラックに展開される効果


    simbol(.effectName)
複合された概念、または単純にトラックに展開できないものの記述
オプチ、パーススライド等の定義が定まらない効果も含む？


aliases	ー	記述の別名

実際のタイムシートの記述は、この別名のうちいずれかが使用可能
使用された記述がDB内にない場合は
一時的にデフォルトの "unknown" が適用される。
あとから新規登録が可能

nodeSigns	ー　ノード記号配列

タイムシート上でのテキスト表示用記号
第一要素	中間値補完サイン　記述範囲を埋める記号　登録がない場合は"|(縦棒)"
第二要素	セクション開始サイン　セクションの冒頭を示す記号　登録がない場合は第一要素を使う
第三要素	セクション終了サイン　セクションの末尾を示す記号　登録がない場合は第二要素を使う


description	ー	記述の簡単な説明

記述内容の説明を付加


演出手法
カメラワーク
ステージワーク

*/
nas.cameraworkDescriptions.parseConfig(`
unknown
	name:unknown
	type:simbol
	aliases:["未登録"]
	nodeSigns:["┃","┳","┻"]
	description:未登録シンボル(デフォルトの値)
fadeIn
	name:fadeIn
	type:composite
	aliases:["FI","F.I","フェード・イン","フェードイン","fade-in","▲","溶明"]
	nodeSigns:["|","▲"]
	description:画面が暗転状態から徐々に明るくなる演出手法
fadeOut
	name:faseOut
	type:composite
	aliases:["FO","F.O","フェード・アウト","フェードアウト","fade-out","▼","溶暗"]
	nodeSigns:["|","▼"]
	description:画面が徐々に暗転する演出手法
whiteIn
	name:whiteIn
	type:composite
	aliases:["WI","W.I","W/in","ホワイト・イン","ホワイトイン","white-in","△"]
	nodeSigns:["|","△"]
	description:白画面からフェードインする演出手法
whiteOut
	name:whiteOut
	type:composite
	aliases:["WO","W.O","W/out","ホワイト・アウト","ホワイトアウト","white-out","▽"]
	nodeSigns:["|","▽"]
	description:白画面へフェードアウトする演出手法
overlap
	name:overlap
	type:transition
	aliases:["OL","diss","オーバーラップ","closs-dissolve","]X[","]OL[","]diss[","]><[","]⋈["]
	nodeSigns:["|","]><["]
	description:経過中の画面が二重写しになる転換のための演出手法
cameraShakeS
	name:shake
	type:geometry
	aliases:["ぶれ","画面動","画ぶれ","カメラブレ"]
	nodeSigns:["/"]
	description:カメラを揺するような効果（弱）
cameraShake
	name:shake
	type:geometry
	aliases:["ぶれ","画面動","画ぶれ","カメラブレ"]
	nodeSigns:["//"]
	description:カメラを揺するような効果
cameraShakeL
	name:shake
	type:geometry
	aliases:["ぶれ(強)","画面動(強)","画ぶれ(強)"]
	nodeSigns:["///"]
	description:カメラを揺するような効果（強）
trackUp
	name:trackUp
	type:geometry
	aliases:["TU","T.U","トラックアップ"]
	nodeSigns:["|","▽","△"]
	description:カメラが被写体に近づいてゆく演出手法
trackBack
	name:trackBack
	type:geometry
	aliases:["TB","T.B","トラックバック"]
	nodeSigns:["|","▽","△"]
	description:カメラが被写体から遠ざかる演出手法
zoomIn
	name:zoomIn
	type:geometry
	aliases:["ZI","Z.I","ズームイン"]
	nodeSigns:["|","▽","△"]
	description:画角を調整して被写体を拡大する演出手法
zoomOut
	name:zoomOut
	type:geometry
	aliases:["ZO","Z.O","ズームアウト"]
	nodeSigns:["|","▽","△"]
	description:画角を調整して被写体を縮小する演出手法
pan
	name:pan
	type:simbol
	aliases:["PAN","パン","pnning"]
	nodeSigns:["|","▽","△"]
	description:カメラを主に横方向に振る演出手法
panUp
	name:panUp
	type:simbol
	aliases:["PANUP","pan.up","パンアップ"]
	nodeSigns:["|","▽","△"]
	description:カメラを画面上方向に振る演出手法　チルトアップ
panDown
	name:panDown
	type:geometry
	aliases:["PANDOWN","pan.down","パンダウン"]
	nodeSigns:["|","▽","△"]
	description:カメラを画面下方向に振る演出手法　チルトダウン
tilt
	name:tilt
	type:geometry
	aliases:["TILT","チルト","tilting"]
	nodeSigns:["|","▽","△"]
	description:カメラを画面上下方向に振る演出手法
tiltUp
	name:tiltUp
	type:simbol
	aliases:["TILT-UP","チルトアップ"]
	nodeSigns:["|","▽","△"]
	description:カメラを画面上方向に振る演出手法
tiltDown
	name:tiltDown
	type:geometry
	aliases:["TILT-DOWN","チルトダウン"]
	nodeSigns:["|","▽","△"]
	description:カメラを画面下方向に振る演出手法
follow
	name:follow
	type:simbol
	aliases:["follow","フォロー","フォロウ"]
	nodeSigns:["|","▽","△"]
	description:画面が被写体を追って移動する演出手法
bigcloseUp
	name:bigcloseUp
	type:simbol
	aliases:["BC","ビッグクローズアップ","大寄り"]
	nodeSigns:["┃","┳","┻"]
	description:特定の一部分を大写しにする演出手法
closeUp
	name:closeUp
	type:simbol
	aliases:["CU","クローズアップ","寄りアップ"]
	nodeSigns:["┃","┳","┻"]
	description:顔などの注目範囲を画面いっぱいに写す演出手法
upShot
	name:upShot
	type:simbol
	aliases:["US","アップショット","アップ"]
	nodeSigns:["┃","┳","┻"]
	description:顔などの注目範囲が主体になるように画面を構成する演出手法
bustShot
	name:bustShot
	type:simbol
	aliases:["BS","バストショット","バスト寄り"]
	nodeSigns:["┃","┳","┻"]
	description:人物撮影の際に胸部から上を主体に画面を構成する演出手法
westShot
	name:westShot
	type:simbol
	aliases:["WS","ウエストショット","腰高"]
	nodeSigns:["┃","┳","┻"]
	description:人物撮影の際に腹部から上を主体に画面を構成する演出手法
kneeShot
	name:kneeShot
	type:simbol
	aliases:["KS","ニーショット","膝上"]
	nodeSigns:["┃","┳","┻"]
	description:人物撮影の際に膝部から上を主体に画面を構成する演出手法
fullFigure
	name:fullFigure
	type:simbol
	aliases:["FF","フルフィギュア","全身"]
	nodeSigns:["┃","┳","┻"]
	description:人物撮影の際に全身像を主体に画面を構成する演出手法
middleShot
	name:middleShot
	type:simbol
	aliases:["MS","ミドルショット","やや引き"]
	nodeSigns:["┃","┳","┻"]
	description:人物撮影の際に全身像とその周囲の環境を主体に画面を構成する演出手法
longShot
	name:longShot
	type:simbol
	aliases:["LS","ロングショット","引き"]
	nodeSigns:["┃","┳","┻"]
	description:人物撮影の際に人物の周辺環境を主体として画面を構成する演出手法
fullLong
	name:fullLong
	type:simbol
	aliases:["FL","フルロング","大引き"]
	nodeSigns:["┃","┳","┻"]
	description:人物撮影の際にステージ全体を主体として画面を構成する演出手法
crane
	name:crane
	type:simbol
	aliases:["クレーン","クレーンショット","carne-shot"]
	nodeSigns:["｜","┬","┴"]
	description:クレーン先端にカメラを搭載して画像を収録する演出手法
dolly
	name:dolly
	type:simbol
	aliases:["DLY","ドリー","トロッコ","台車"]
	nodeSigns:["｜","┬","┴"]
	description:移動台車にカメラを搭載して画像を収録する演出手法
multi
	name:multi
	type:simbol
	aliases:["MULTI","マルチ","密着マルチ","マルチスピードスライド","多段引き","多段スライド"]
	nodeSigns:["｜","┬","┴"]
	description:移動感を表すために多段の撮影指定が存在する旨の撮影指定
multiPlain
	name:multiPlain
	type:simbol
	aliases:["マルチプレーン","マルチ台"]
	nodeSigns:["｜","┬","┴"]
	description:立体型マルチプレーン撮影台を使用する旨の撮影指定
fairing
	name:fairing
	type:simbol
	aliases:["フェアリング","加速","減速","徐々に"]
	nodeSigns:["‖","⇑","⇓"]
	description:スライド等の値の切り替わりを滑らかにコントロールすること
slide
	name:slide
	type:geometry
	aliases:["SL","引き","スライド","移動"]
	nodeSigns:["|","▽","△"]
	description:合成素材の移動
rotation
	name:rotation
	type:geometry
	aliases:["RT","回転","ローテーション"]
	nodeSigns:["|","▽","△"]
	description:合成素材の回転移動
rotatePan
	name:rotatePan
	type:geometry
	aliases:["回転PAN","rtPAN","PAN(回転加味)"]
	nodeSigns:["|","▽","△"]
	description:カメラを試写体に対して回転を加えてPANする演出手法
roteteSlide
	name:roteteSlide
	type:geometry
	aliases:["回転スライド","rtSL","引き（回転加味）"]
	nodeSigns:["|","▽","△"]
	description:合成素材をスライドさせながら回転を加える撮影指定
rotateTu
	name:rotateTu
	type:geometry
	aliases:["回転TU","rtTU","TU（回転加味）"]
	nodeSigns:["|","▽","△"]
	description:カメラを試写体に対して回転を加えながら接近させる演出手法
rateteTb
	name:rateteTb
	type:geometry
	aliases:["回転TB","rtTB","TB（回転加味）"]
	nodeSigns:["|","▽","△"]
	description:カメラを試写体に対して回転を加ながら引き離す演出手法
handyShake
	name:handyShake
	type:geometry
	aliases:["ハンディブレ","手持ちカメラ風画面動"]
	nodeSigns:["//"]
	description:手持ちカメラのような振動を画面に与える演出手法
kurokoma
	name:kurokoma
	type:composite
	aliases:["黒コマ","BK","■"]
	nodeSigns:["■"]
	description:黒い画面を挿入する演出手法
shirokoma
	name:shirokoma
	type:composite
	aliases:["白コマ","WK","□"]
	nodeSigns:["□"]
	description:白い画面を挿入する演出手法
sublina
	name:sublina
	type:composite
	aliases:["サブリナ","SUBLINA"]
	nodeSigns:["＜"]
	description:一コマだけ露出オーバー、または前後に繋がりのない絵を挿入する演出手法
backlight
	name:backlight
	type:composite
	aliases:["T光","透過光","backlight","TFlash","backlight bleed","backlight glow"]
	nodeSigns:["|","┬","┴"]
	description:バックライトで撮影を行う演出手法
highContrast
	name:highContrast
	type:simbol
	aliases:["ハイコン","High\-Con"]
	nodeSigns:["|","┬","┴"]
	description:ハイコントラスト状態
rackFocus
	name:rackFocus
	type:simbol
	aliases:["ピン送り","ピント送り","ラック・フォーカス","フォーカス送り"]
	nodeSigns:["｜","┬","┴"]
	description:実写のピント送りを模した演出手法
overExposure
	name:overExposure
	type:composite
	aliases:["露出オーバー","露光超過"]
	nodeSigns:["｜","┬","┴"]
	description:露出オーバーの画像を使用する演出手法
underExposure
	name:underExposure
	type:composite
	aliases:["露出アンダー","露光不足"]
	nodeSigns:["｜","┬","┴"]
	description:露出アンダーの画像を使用する演出手法
perspectiveTransform
	name:perspectiveTransform
	type:simbol
	aliases:["パース変形","パース引き"]
	nodeSigns:["┃","┳","┻"]
	description:素材の立体感を補助する変形を素材に加える撮影手法
jumpSlide
	name:jumpSlide
	type:simbol
	aliases:["ジャンプスライド","ジャンプ引き","間欠スライド"]
	nodeSigns:["｜","┬","┴"]
	description:一定の合成素材をグループごとに基点を与えて処理する撮影手法
diffusionFilter
	name:diffusionFilter
	type:composite
	aliases:["DF","ディフュージョンフィルタ"]
	nodeSigns:["｜","┬","┴"]
	description:画像を拡散させるフィルター
clossFilter
	name:clossFilter
	type:composite
	aliases:["ClOSS","クロスフィルタ"]
	nodeSigns:["｜","┬","┴"]
	description:光源から光条を発生させるフィルター
foggyFilter
	name:foggyFilter
	type:composite
	aliases:["FOGGY","フォギーフィルタ"]
	nodeSigns:["｜","┬","┴"]
	description:画像を霧のように柔らかく拡散させるフィルター
bokeh
	name:bokeh
	type:composite
	aliases:["BOKEH","ボケ","ピントぼかし","オフフォーカス"]
	nodeSigns:["｜","┬","┴"]
	description:画像をぼやけさせる演出手法
fix
	name:fix
	type:simbol
	aliases:["FIX","フィックス","止め"]
	nodeSigns:["｜","┬","┴"]
	description:カメラを据えて画面を固定する演出手法
panTU
	name:panTU
	type:simbol
	aliases:["PAN-UP","パンTU","TUpaning"]
	nodeSigns:["|","▽","△"]
	description:PANとTUを併用する演出手法
panTB
	name:panTB
	type:simbol
	aliases:["PAN-TB","パンTB","TBpaning"]
	nodeSigns:["|","▽","△"]
	description:PANとTBを併用する演出手法
followTracking
	name:followTracking
	type:simbol
	aliases:["つけPAN","フォローパン","フォロートラッキング"]
	nodeSigns:["|","▽","△"]
	description:カメラの移動で被写体を追従する演出手法
followSlide
	name:followSlide
	type:geometry
	aliases:["Follow","台引き","引き","台SL"]
	nodeSigns:["|","▽","△"]
	description:被写体以外の合成素材をスライドすることでフォロー状態を表現する撮影手法
rolling
	name:rolling
	type:simbol
	aliases:["ローリング","roll.","↻","↺"]
	nodeSigns:["|","▽","△"]
	description:合成素材の周期的なスライドで被写体のモーションを表現する撮影手法
quickTU
	name:quickTU
	type:geometry
	aliases:["Q-TU","クイックTU","QTU"]
	nodeSigns:["|","▽","△"]
	description:急速なTU
quickTB
	name:quickTB
	type:geometry
	aliases:["Q-TB","クイックTB","QTB"]
	nodeSigns:["|","▽","△"]
	description:急速なTB
quickPAN
	name:quickPAN
	type:geometry
	aliases:["Q-PAN","クイックPAN","QPAN"]
	nodeSigns:["|","▽","△"]
	description:急速なPAN
focusIn
	name:focusIn
	type:composite
	aliases:["focus-IN","フォーカスイン"]
	nodeSigns:["|","▲"]
	description:ショット内でフォーカスを合わせる演出手法
focusOut
	name:focusOut
	type:composite
	aliases:["focus-OUT","フォーカスアウト"]
	nodeSigns:["|","▼"]
	description:ショット内でフォーカスをはずす演出手法
waveGlass
	name:waveGlass
	type:composite
	aliases:["波ガラス","distorted glass"]
	nodeSigns:["//"]
	description:波ガラスを使用して画面に歪みをもたせる撮影手法　またはその模倣
wipe
	name:wipe
	type:transition
	aliases:["wipe","]wipe[","ワイプ"]
	nodeSigns:["|","]><["]
	description:トラベリングマスクを利用して行うトランジション
wipeIn
	name:wipeIn
	type:transition
	aliases:["WIPE-IN","ワイプイン"]
	nodeSigns:["|","▲"]
	description:被写体がワイプで画面に現れること
wipeOut
	name:wipeOut
	type:transition
	aliases:["WIPE-OUT","ワイプアウト"]
	nodeSigns:["|","▼"]
	description:被写体がワイプで画面から消えること
transition
	name:transition
	type:transition
	aliases:["トランジション","transition"]
	nodeSigns:["|","]><["]
	description:２つのショットが継続時間をもって入れ替わること
iris
	name:iris
	type:transition
	aliases:["iris","アイリス","アイリスワイプ"]
	nodeSigns:["|","]><["]
	description:アイリス（虹彩＝絞り）状のマスクを用いたワイプ
irisIn
	name:irisIn
	type:transition
	aliases:["IRIS-IN","アイリスイン"]
	nodeSigns:["|","▲"]
	description:ショットがアイリスワイプで現れること
irisOut
	name:irisOut
	type:transition
	aliases:["IRIS-OUT","アイリスアウト"]
	nodeSigns:["|","▼"]
	description:ショットがアイリスワイプで消えること
insert
	name:insert
	type:simbol
	aliases:["ins.","insert","インサート","挿入"]
	nodeSigns:["＜"]
	description:場面に別場面のショットを挿入する演出手法
cutIn
	name:cutIn
	type:simbol
	aliases:["カットイン","CUTIN"]
	nodeSigns:["＜＜"]
	description:カットの切り替え
blur
	name:blur
	type:composite
	aliases:["ぼかし","ブラー"]
	nodeSigns:["｜","┬","┴"]
	description:画面をぼやけさせる撮影手法
bar
	name:bar
	type:simbol
	aliases:["バー","BAR","縦棒"]
	nodeSigns:["‖"]
	description:指定の区間を表す棒線
strobo
	name:strobo
	type:simbol
	aliases:["ストロボ","Strobo"]
	nodeSigns:["|","]S["]
	description:連続した動画の置き換えにオーバーラップトランジションを使う演出手法
stroboOdd
	name:stroboOdd
	type:simbol
	aliases:["ストロボ1","Strobo1"]
	nodeSigns:["|","▼▲"]
	description:ストロボ
stroboEvn
	name:stroboEvn
	type:simbol
	aliases:["ストロボ2","Strobo2"]
	nodeSigns:["|","▲▼"]
	description:ストロボ
`)
/**  追加予定メモ
offFocus
scale
scaleUP
scaleDown
gondola

	中OL
*/
/*
    区間開始・終了ノードの予約語
    これはコーディングしちゃったほうが良さそう
    開始ノードを定義して終了ノードは対で使用ただし省略は可能
    データ構造は、[開始シンボル,終了シンボル]の配列
    終了シンボルは開始シンボル再利用固定、対応シンボル固定、またはフリー
    常に終了シンボルは省略可能
    フォーマットで規定してしまったほうが良さそうなのであった
    

var CamNodeSigns	=[["▽","△"],["▼","▲"],["┳","┻"],["┬","┴"],["↑","↓"],["⇑","⇓"]];//["◎"],["＊"],["○"],["●"],["□"],["■"],["◇"],["◆"],["☆"],["★"]
//カメラノードサインは、配列で登録する  要素数１の配列は開始と終了を同じサインで行う
var TrnNodeSigns	=["].+[","]><[","]X[","]⋈["];
//トランジションノードサインは、開始サインと終了サインを一致させる。継続長２フレーム以下の場合は開始サインのみでOK
var FxNodeSigns	=[").+(","△","▽","▲","▼","┳","┻","┬","┴","↑","↓","⇑","⇓","◎","＊","○","●","□","■","◇","◆","☆","★"];
//効果ノードサインは、開始サインと終了サインを一致させる。トランジションタイプの効果はトランジションサインを使用する
var NodeSigns =[").+(","]X[","]⋈[","[.+]","△","▽","▲","▼","┳","┻","┬","┴","↑","↓","⇑","⇓","◎","＊","○","●","□","■","◇","◆","☆","★"];
			//範囲ノード予約記述  インターポレーションサインの機能も併せ持つ  詳細別紙
var DialogSigns=["(*)","____","----","⁀⁀⁀⁀","‿‿‿‿"];
			//ダイアログ（サウンド）タイムライン専用のセパレーター  詳細別紙
*/
