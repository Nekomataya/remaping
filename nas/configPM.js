/**
 * configPM.js
 * nas.system で利用する各管理情報の基礎データテーブル
 * この内容はDB側で保持してアプリケーションに送る　これはスタンドアロン動作用のデフォルトのデータ群となる
 * DBとの通信が正常に初期化された後、DBから　受信したデータで上書きが行なわれる
 * 又はDBとの通信が確立できなかった場合に読み込まれるように調整される 
 */

/**
 *	アセット分類
 *
 *assets[assetName] = {name:"アセット表記名",hasXPS:シートありか？,code:コード,shortName:短縮名,description:解説,endNode:終了ノードか？,linkStage:[呼び出しステージ配列]};
 *
 *呼び出しステージ配列は　アセット側としては、アセットを受けて開始することが可能なステージ群
 *ステージ側から見るとそのステージの開始に最低限必要なアセット
 *呼び出しステージ配列が空のアセットはストアにストックされるのみで、次のステージを開始しない
*/
nas.Pm.assets.addAsset("SCInfo"	,["コンテチップ",true,"SCI","コンテ","絵コンテから生成した基礎情報",false,["laika","animatic","roughSketch","layout","1stKeydrawing"]]);
nas.Pm.assets.addAsset("draft"	,["ラフスケッチ",true,"DRFT","ラフ","「原図のない」ラフスケッチ",false,["laika","animatic","roughSketch","layout","1stKeydrawing"]]);
nas.Pm.assets.addAsset("layout"	,["レイアウト",true,"__LO","LO","レイアウト（原図構成）付きの時間情報ありのスケッチ",false,["laika","animatic","roughSketch","layout","1stKeydrawing","layoutProof","layoutA-D","keydrawing","2ndKeydrawing"]]);
nas.Pm.assets.addAsset("keyAnimatin",["原画",true,"__KD","原","キーアニメーション　keyDrawing",false,["KDA-D","2ndKdA-D","checkKD","preProofAD","AD"]]);
nas.Pm.assets.addAsset("AnimationDrawing",["動画",true,"__AD","動","アニメーションドローイング",false,["ADA-D","proofAD","A-D"]]);
nas.Pm.assets.addAsset("cell"	,["セル",true,"CELL","仕","員数の揃ったコンポジット素材（未完成のものも含む）",true,["AdcleanUp","paint","proofPaint","retouchCell"]]);
nas.Pm.assets.addAsset("characterDesign",["キャラクター設定",false,"chrD","キャラ","キャラクターデザイン",true,["undefined"]]);
nas.Pm.assets.addAsset("propDesign"	,["プロップ設定",false,"crpD","プロップ","プロップデザイン",true,[]]);
nas.Pm.assets.addAsset("BGDesign"	,["美術設定",false,"bgaD","美設","美術デザイン",true,[]]);
nas.Pm.assets.addAsset("referenceSheet"	,["参考設定",false,"refD","参考","その他参考設定",true,[]]);
nas.Pm.assets.addAsset("colorDesign"	,["色彩設計",false,"colD","色設","メインの色彩設計（打込みデータを除く）",true,[]]);
nas.Pm.assets.addAsset("colorCoordiante"	,["色指定",true,"colC","指定","色指定（打込みデータ）",true,[]]);
nas.Pm.assets.addAsset("backgroundArt"	,["背景",true,"_BGA","背景","背景画",true,[]]);
nas.Pm.assets.addAsset("cast3D"	,["3Dアニメーション",true,"3DCC","3D","3D-CGICast",true,[]]);
nas.Pm.assets.addAsset("EXTRA"	,["（空アセット）",false,"NULL","EXTRA","無情報・EXTRAライン導入のため空の本線が出すアセット",true,[]]);
nas.Pm.assets.addAsset("ALL"	,["（全アセット）",true,"_ALL","ALL","全素材・コンポジットに必要な全素材シンボル　一時アセット",false,[]]);
/**
 *	ステージ分類
 *ステージの持つプロパティ
 *stageName	定義名称：オブジェクトのコールに使用する　キャメル記法で
 *name	名称
 *code	省略表記コード
 *shortName	日本語用省略表記コード
 *description	日本語の名称を兼ねた説明？
 *output	ステージの出力するアセット種別　文字列
 *
 *nas.Pm.stages[ステージ名]={name:一般名,code:短縮コード,shortName:短縮名,description:解説,output:出力アセット};
 *
 *nas.Pm.stages　には、その作品で定義されたステージのリファレンスが格納される。
 *管理DBと連結される場合は、このオブジェクトとDB上のステージ定義テーブルが対照・連結される
 *ここでは、独立駆動のためのテーブルを定義している
 */

nas.Pm.stages.addStage("undefined"		,["未定義"	,"(undef)"	,"(undefined)"	,"未定義ステージ　制作預りとして扱う。基本的にアセットストアへの編入を指す"	,"SCInfo"]);
nas.Pm.stages.addStage("init"			,["初期化"	,"init"	,"開始"	,"初期化ステージ　制作預りとして扱う。制作開始前処理"	,"SCInfo"]);
nas.Pm.stages.addStage("characterDesign",["キャラクターデザイン"	,"chrD"	,"キャラデ"	,"プロダクション管理デザイン（各話発注デザイン）＊メインデザインは別管理"	,"characterDesign"]);
nas.Pm.stages.addStage("propDesign"		,["プロップデザイン"	,"prpD"	,"プロップ"	,"プロダクション管理デザイン（各話発注デザイン）"	,"propDesign"]);
nas.Pm.stages.addStage("colorDesign"	,["色彩設計"	,"CD"	,"色彩設計"	,"カラーデザイン（基本色彩設計）"	,"colorDesign"]);
nas.Pm.stages.addStage("colorModel"		,["色彩設計カラーモデル"	,"coMD"	,"色彩設計M"	,"カラーモデル（パレット）型基本色彩設計(animo　toonz等)"	,"colorDesign"]);
nas.Pm.stages.addStage("colorCoordination",["色指定"	,"CC"	,"色指定"	,"カット別彩色指定データ"	,"colorDesign"]);
nas.Pm.stages.addStage("coordinationModel",["色指定カラーモデル"	,"_ccM"	,"色指定M"	,"カラーモデル（パレット）型カット別彩色指定データ(animo　toonz等)"	,"colorDesign"]);
nas.Pm.stages.addStage("bgDesign"		,["美術設定"	,"artD"	,"美設"	,"プロダクション内デザインワーク"	,"BGDsign"]);
nas.Pm.stages.addStage("SCInfo"			,["コンテチップ"	,"_SCI"	,"コンテチップ"	,"絵コンテを分解してシーンをプロジェクトデータ化したものイニシャルデータなのでこれを出力する同名ステージは無い"	,"SCInfo"]);
nas.Pm.stages.addStage("laika"			,["ライカ"	,"lika"	,"ライカ"	,"タイミングを構成したモーションラフ"	,"draft"]);
nas.Pm.stages.addStage("animatic "		,["プリビジュアライゼーション"	,"__pv"	,"PV"	,"同上"	,"layout"]);
nas.Pm.stages.addStage("roughSketch"	,["ラフ原画"	,"drft"	,"ラフ原"	,"同上"	,"drfat"]);
nas.Pm.stages.addStage("layout"			,["レイアウト"	,"LO"	,"LO"	,"レイアウト上がり(原図あり)"	,"layout"]);
nas.Pm.stages.addStage("LayoutAD"		,["LOスキャン"	,"LO-D"	,"レイアウトA/D"	,"layout to Data レイアウトをデータ化したもの"	,"layout"]);
nas.Pm.stages.addStage("fstKeydrawing"	,["第一原画"	,"1G"	,"一原"	,"レイアウトを含むラフ原画シート付き"	,"layout"]);
nas.Pm.stages.addStage("fstKdAD"		,["第一原画A/D"	,"1G-D"	,"一原A/D"	,""	,"layout"]);
nas.Pm.stages.addStage("keydrawing"		,["原画"	,"KD"	,"原"	,"原画上がり作画監督修正含む　keyDrawing"	,"keyAnimation"]);
nas.Pm.stages.addStage("KDAD"			,["原画A/D"	,"KD-D"	,"原画A/D"	,"keyAnimation to Data 原画をデータ化したもの"	,"keyAnimation"]);
nas.Pm.stages.addStage("sndKeydrawing"	,["第二原画"	,"2G"	,"二原"	,"第一原画を原画としてフィニッシュしたもの"	,"keyAnimation"]);
nas.Pm.stages.addStage("sndKdAD"		,["第二原画A/D"	,"2G-D"	,"二原A/D"	,"第二原画は原画相当"	,"keyAnimation"]);
nas.Pm.stages.addStage("checkKD"		,["原画作監修正"	,"KD+"	,"作監"	,"上がりは原画として扱う"	,"keyAnimation"]);
nas.Pm.stages.addStage("preProofAD"		,["発注前動画検査"	,"2G+"	,"前動検"	,"実質上の第三原画又は第二原画修正"	,"keyAnimation"]);
nas.Pm.stages.addStage("BGOrderMeeting"	,["BG打合せ"	,"BGOM"	,"BG打ち"	,"グロス発注のための打合せステージ。素材の変更なし"	,"layout"]);
nas.Pm.stages.addStage("layoutProof"	,["美術原図整理"	,"BGLP"	,"原図整理"	,"レイアウト原図を整理加筆してFIXしたもの"	,"backgroundArt"]);
nas.Pm.stages.addStage("layoutAD"		,["背景原図スキャン"	,"LP-D"	,"原図スキャン"	,""	,"backgroundArt"]);
nas.Pm.stages.addStage("bgArt"			,["背景美術"	,"BG"	,"背景"	,"完成背景美術"	,"backgroundArt"]);
nas.Pm.stages.addStage("chaeckBgArt"	,["美術検査"	,"BG+"	,"美監検査"	,""	,"backgroundArt"]);
nas.Pm.stages.addStage("BgArtAD"		,["美術A/D"	,"BG-D"	,"背景スキャン"	,""	,"backgroundArt"]);
nas.Pm.stages.addStage("AD"				,["動画"	,"AD"	,"動"	,"動画上がり animationDrawing"	,"AnimationDrawing"]);
nas.Pm.stages.addStage("ADAD"			,["動画A/D"	,"AD/D"	,"動画A/D"	,"animation to Data 動画をデータ化したもの"	,"AnimationDrawing"]);
nas.Pm.stages.addStage("proofAD"		,["動画検査"	,"AD+"	,"動検"	,"上がりは動画"	,"AnimationDrawing"]);
nas.Pm.stages.addStage("AD"				,["スキャン"	,"AD-D"	,"スキャン"	,"彩色データ作成のためのデジタイズ処理・半製品ペイントデータ"	,"cell"]);
nas.Pm.stages.addStage("AdcleanUp"		,["動画クリンアップ"	,"ADCL"	,"Adcleanup"	,"デジタイズされた動画をクリンアップしたもの(これをトレースと呼ぶソフトもある)"	,"cell"]);
nas.Pm.stages.addStage("paint"			,["彩色"	,"PT"	,"PAINT"	,"ソフトウェア作業によるセル彩色"	,"cell"]);
nas.Pm.stages.addStage("proofPaint"		,["彩色検査"	,"PT+"	,"セル検"	,"彩色済みデータ"	,"cell"]);
nas.Pm.stages.addStage("retouchCell"	,["セル特効"	,"PTfx"	,"特効"	,"加工済みデータ"	,"cell"]);
nas.Pm.stages.addStage("HMechanicalTrace",["マシントレース"	,"H-mt"	,"M-trace"	,"動画をセルに機械転写したもの(古い形式のデータを記述するためのエントリ)"	,"cell"]);
nas.Pm.stages.addStage("Htrace"			,["ハンドトレース"	,"H-tr"	,"トレス"	,"セル時代の作業を記録するためのエントリ"	,"cell"]);
nas.Pm.stages.addStage("HcolorTrace"	,["色トレス"	,"H-ct"	,"色T"	,"セル時代の作業を記録するためのエントリ"	,"cell"]);
nas.Pm.stages.addStage("Htrace"			,["ペイント"	,"H-pt"	,"彩色"	,"セル時代の作業を記録するためのエントリ"	,"cell"]);
nas.Pm.stages.addStage("HproofPaint"	,["セル検査"	,"H-pp"	,"セル検"	,"セル時代の作業を記録するためのエントリ"	,"cell"]);
nas.Pm.stages.addStage("HretouchCell"	,["エアブラシ特効"	,"H-fx"	,"エアブラシ"	,"セル時代の作業を記録するためのエントリ"	,"cell"]);
nas.Pm.stages.addStage("composite"		,["コンポジット"	,"COMP"	,"撮影"	,"コンポジット工程をプロダクションに入れるべきか否かは結構悩む 制作工程上終端なので出力は無し　終了シンボルを作るか？"	,"ALL"]);
nas.Pm.stages.addStage("preCompositCheck",["撮出し検査"	,"PCC"	,"撮出し"	,"撮影前全検査(古い工程を記述するためのエントリ)"	,"ALL"]);

/**
 *	ライン分類
 *	管理モデルの簡略化のため　本線・傍線ともに分離後の個別の合流はないものとする
 *	必要なアセットはストアから引き出す
 *	制作ラインの前方にはスタートラインがあり　SCinfoで始まる
 *	後方コンポジット工程の手前にアセットストア（合流）ラインがあり、ここをストアとして全ての素材がマージされる
 *	カット情報を持ったコンポジット素材はコンポジット情報を元に各カットへ配分される　それ以外のアセットは参照アセットとして格納される
 *	参照アセットは随時引き出し可能
 *
 *nas.Pm.lines　には、その作品で定義された工程のリファレンスが格納される。
 *管理DBと連結される場合は、このオブジェクトとDB上のライン定義テーブルが対照・連結される
 *ここでは、独立駆動のためのテーブルを定義している
 *
*/
nas.Pm.lines.addLine("null"           ,["(未設定)"        ,"(未)"    ,"null"           ,"null"   ,"null","初期化前のオブジェクトに設定するダミーライン"]);
nas.Pm.lines.addLine("ALL"            ,["(全素材)"        ,"全"      ,"ALL"            ,"ALL"    ,"_all","カット情報を持って一時的に集積されるライン"]);
nas.Pm.lines.addLine("trunk"          ,["本線"            ,"本線"    ,"cell"           ,"SCInfo" ,"cell","管理本線となるセルライン"]);
nas.Pm.lines.addLine("backgroundArt"  ,["背景美術"        ,"背景"    ,"backgroundArt"  ,"layout" ,"bg"  ,"美術作業"]);
nas.Pm.lines.addLine("cast3D"         ,["3Dアニメーション","3D"      ,"3DCast"         ,"SCInfo" ,"__3D","3Dアニメーションキャスト"]);
nas.Pm.lines.addLine("characterDesign",["キャラクター設定","キャラ設","characterDesign","EXTRA"  ,"cd"  ,"キャラクター設定"]);
nas.Pm.lines.addLine("propDesign"     ,["プロップ設定"    ,"プロップ","propDesign"     ,"EXTRA"  ,"_prp","プロップ設定"]);
nas.Pm.lines.addLine("BGDesign"       ,["美術設定"        ,"美設"    ,"BGDesign"       ,"EXTRA"  ,"_bga","美術設定作業"]);
nas.Pm.lines.addLine("colorDesign"    ,["色彩設計"        ,"色設計"  ,"colorDesign"    ,"EXTRA"  ,"colD","色彩設計"]);
nas.Pm.lines.addLine("colorCoordiante",["色指定"          ,"指定"    ,"colorDesign"    ,"SCInfo" ,"__cc","色指定"]);
nas.Pm.lines.addLine("composite"      ,["コンポジット"    ,"撮影"    ,"ALL"            ,"ALL"    ,"comp","撮影"]);

/*========================================================================*/

/**
 *	タイトルDB
 *
 *タイトル文字列　	,[ID(リレーションID)	,フルネーム	,ショートネーム	,コード	,フレームレート	,定尺	,入力メディア"	,"出力メディア"]
 *
 *このタイトル分類と同内容のデータがDBとの通信で扱われる
 *各アプリケーションのタイトルDBをこの形式に統一
 */
nas.Pm.titles.addTitle("TVshowSample"	,["0000"	,"名称未設定"	,"未定"	,"_UN"	,"24FPS"	,"21:00:00"	,"10in-HDTV"	,"HDTV-720p"]);
nas.Pm.titles.addTitle("kachi"		,["0001"	,"かちかちやま"	,"か"	,"_KT"	,"24FPS"	,"20:12:00"	,"10in-HDTV"	,"HDTV-720p"]);
nas.Pm.titles.addTitle("kachi"		,["0002"	,"ももたろう"	,"も"	,"_MT"	,"24FPS"	,"19:21:00"	,"10in-HDTV"	,"HDTV-720p"]);

/*
 *	メディアDB
 *mediaName	,[ID(リレーションID)	,animationField,	baseResolution	,mediaType	,tcType	,pegForm	,pixelAspect	,description]
 */
nas.Pm.medias.addMedia("作画フレーム200dpi"	,["0001"	,"10in-HDTV"	,"200dpi"	,"drawing"	,"trad-JA"	,"ACME" ,"1" ,"参考用作画フレーム"]);
nas.Pm.medias.addMedia("作画フレーム192dpi"	,["0001"	,"10in-HDTV"	,"192dpi"	,"drawing"	,"trad-JA"	,"ACME" ,"1" ,"参考用作画フレーム"]);


