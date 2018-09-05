/**
 * configPM.js
 * nas.system で利用する各管理情報の基礎データテーブル
 * この内容はDB側で保持してアプリケーションに送る これはスタンドアロン動作用のデフォルトのデータ群となる
 * DBとの通信が正常に初期化された後、DBから 受信したデータで上書きが行なわれる
 * 又はDBとの通信が確立できなかった場合に読み込まれるように調整される
 
 これらのデータは、リポジトリ内部に設定として分散して配置され、必要に従って編集、更新が可能なように調整される
 
 設定書式は、パーサを共通化するために統一されるのが望ましい　2017 12 02
 パーサは、text,dump,JSON 全形式に対応する
 ユーザは好みの方式で記述を行うことができる
 リジョンごとの記述は、後置優先で後からデータを読み込む際に一切のデータを消去して上書き
 
 */
/**
 組織情報
 組織オブジェクトは、組織情報トレーラーとして働く
 pmdbオブジェクト内に一つだけ存在して、それらの共通参照情報となる
 
 
プロパティ名  organization
 name:通常表記名
 fullName:正式名
 code:ファイル名等使用コード
 id:DBリンク用インデックス(UAT token)
 shortName:短縮名
 description:解説
 contact:組織連絡先

    organizationName   name    code    id  shortName   description contact users
 */
nas.Pm.organization ={
    name:       "nekomataya"  ,
    fullName:   'ねこまたや',
    code:       'nkmt',
    id:         '0001',
    shortName:  'ね',
    contact:    'ねこまたや:kiyo@nekomataya.info',
    description:'住所等',
};
nas.Pm.organization.toString= function(){return this.name;}
nas.Pm.organization.valueOf = function(){return parseInt( this.id );}

nas.Pm.organizations=[];//組織コレクションにするか？
nas.Pm.organizations.push(nas.Pm.organization);//0番要素として基準組織のエントリの参照を置く
/**
 * アセット分類
 *
 *  assets[assetName] = {name:"アセット表記名",hasXPS:シートありか？,code:コード,shortName:短縮名,description:解説,endNode:終了ノードか？,linkStage:[呼び出しステージ配列]};
 *
 *  呼び出しステージ配列は アセット側としては、アセットを受けて開始することが可能なステージ群
 *  ステージ側から見るとそのステージの開始に最低限必要なアセット
 *  呼び出しステージ配列が空のアセットはストアにストックされるのみで、次のステージを開始しない
 *  assetName  は重複不可のindex
アセットは、システムごとに定義してユーザによる編集（追加・削除・内容の変更）が可能

 クラスのコレクションはテンプレートとして機能
                        assetName           name            hasXPS      code    shortName   description     endNode     linkStages
*/
nas.Pm.assets.addAsset("SCInfo"          ,["コンテチップ"      ,true  ,"SCI"  ,"コンテ","絵コンテから生成した基礎情報",false,["leica","animatic","roughSketch","layout","1stKeydrawing"]]);
nas.Pm.assets.addAsset("leica"          ,["プリビズ"      ,true  ,"prev"  ,"プリビズ","プリビジュアライゼーション素材",false,["leica","animatic","roughSketch","layout","1stKeydrawing"]]);
nas.Pm.assets.addAsset("draft"           ,["ラフスケッチ"      ,true  ,"DRFT" ,"ラフ"  ,"「原図のない」ラフスケッチ",false,["leica","animatic","roughSketch","layout","1stKeydrawing"]]);
nas.Pm.assets.addAsset("layout"          ,["レイアウト"        ,true  ,"__LO" ,"LO"    ,"レイアウト（原図構成）付きの時間情報ありのスケッチ",false,["leica","animatic","roughSketch","layout","1stKeydrawing","layoutProof","layoutA-D","keydrawing","2ndKeydrawing"]]);
nas.Pm.assets.addAsset("keyAnimation"    ,["原画"              ,true  ,"__KD" ,"原"    ,"キーアニメーション keyDrawing",false,["KDA-D","2ndKdA-D","checkKD","preProofAD","AD"]]);
nas.Pm.assets.addAsset("AnimationDrawing",["動画"              ,true  ,"__AD" ,"動"    ,"アニメーションドローイング",false,["ADA-D","proofAD","A-D","ADscan","ADcleanUp",'HMechanicalTrace']]);
nas.Pm.assets.addAsset("cell"            ,["セル"              ,true  ,"CELL" ,"仕"    ,"員数の揃ったコンポジット素材（未完成のものも含む）",true,["AdcleanUp","paint","proofPaint","retouchCell"]]);
nas.Pm.assets.addAsset("characterDesign" ,["キャラクター設定"  ,false ,"chrD" ,"キャラ","キャラクターデザイン",true,["undefined"]]);
nas.Pm.assets.addAsset("propDesign"      ,["プロップ設定"      ,false ,"crpD" ,"プロップ","プロップデザイン",true,[]]);
nas.Pm.assets.addAsset("BGDesign"        ,["美術設定"          ,false ,"bgaD" ,"美設"  ,"美術デザイン",true,[]]);
nas.Pm.assets.addAsset("referenceSheet"  ,["参考設定"          ,false ,"refD" ,"参考"  ,"その他参考設定",true,[]]);
nas.Pm.assets.addAsset("colorDesign"     ,["色彩設計"          ,false ,"colD" ,"色設"  ,"メインの色彩設計（打込みデータを除く）",true,[]]);
nas.Pm.assets.addAsset("colorCoordiante" ,["色指定"            ,true  ,"colC" ,"指定"  ,"色指定（打込みデータ）",true,[]]);
nas.Pm.assets.addAsset("backgroundArt"   ,["背景"              ,true  ,"_BGA" ,"背景"  ,"背景画",true,[]]);
nas.Pm.assets.addAsset("cast3D"          ,["3Dアニメーション"  ,true  ,"3DCC" ,"3D"    ,"3D-CGICast",true,[]]);
nas.Pm.assets.addAsset("EXTRA"           ,["（空アセット）"    ,false ,"NULL" ,"EXTRA" ,"無情報・EXTRAライン導入のため空の本線が出すアセット",true,[]]);
nas.Pm.assets.addAsset("ALL"             ,["（全アセット）"    ,true  ,"_ALL" ,"ALL"   ,"全素材・コンポジットに必要な全素材シンボル 一時アセット",false,[]]);
/**
 * ステージ分類
 *ステージの持つプロパティ
 *stageName 定義名称：オブジェクトのコールに使用する キャメル記法で
 *name 名称
 *code 省略表記コード
 *shortName 日本語用省略表記コード
 *description 日本語の名称を兼ねた説明？
 *output ステージの出力するアセット種別 文字列
 *
 *nas.Pm.stages[ステージ名]={name:一般名,code:短縮コード(4biteまで),shortName:短縮名,description:解説,output:出力アセット};
 *
 *nas.Pm.stages には、その作品で定義されたステージのリファレンスが格納される。
 *管理DBと連結される場合は、このオブジェクトとDB上のステージ定義テーブルが対照・連結される
 *ここでは、独立駆動のためのテーブルを定義している
 
ステージを定義する際にステージにグループ・スタッフロール・個人ユーザを連結することができる
明示的な連結のないステージは　＊（全ユーザ）に連結される。
連結テーブルは別に設ける
リンクのキーはステージID(stageName)
                        stageName             name                          code    shortName   description output
 */
nas.Pm.stages.addStage("undefined"         ,["未定義"                    ,"(undef)" ,"(undefined)" ,"未定義ステージ 制作預りとして扱う。基本的にアセットストアへの編入を指す" ,"SCInfo"]);
nas.Pm.stages.addStage("init"              ,["初期化"                    ,"init"    ,"開始" ,"初期化ステージ 制作預りとして扱う。制作開始前処理" ,"SCInfo"]);
nas.Pm.stages.addStage("characterDesign"   ,["キャラクターデザイン"      ,"chrD"    ,"キャラデ" ,"プロダクション管理デザイン（各話発注デザイン）＊メインデザインは別管理" ,"characterDesign"]);
nas.Pm.stages.addStage("propDesign"        ,["プロップデザイン"          ,"prpD"    ,"プロップ" ,"プロダクション管理デザイン（各話発注デザイン）" ,"propDesign"]);
nas.Pm.stages.addStage("colorDesign"       ,["色彩設計"                   ,"CD"      ,"色彩設計" ,"カラーデザイン（基本色彩設計）" ,"colorDesign"]);
nas.Pm.stages.addStage("colorModel"        ,["色彩設計カラーモデル"       ,"coMD"    ,"色彩設計M" ,"カラーモデル（パレット）型基本色彩設計(animo toonz等)" ,"colorDesign"]);
nas.Pm.stages.addStage("colorCoordination" ,["色指定"                     ,"CC"      ,"色指定" ,"カット別彩色指定データ" ,"colorDesign"]);
nas.Pm.stages.addStage("coordinationModel" ,["色指定カラーモデル"         ,"_ccM"    ,"色指定M" ,"カラーモデル（パレット）型カット別彩色指定データ(animo toonz等)" ,"colorDesign"]);
nas.Pm.stages.addStage("bgDesign"          ,["美術設定"                   ,"artD"    ,"美設" ,"プロダクション内デザインワーク" ,"BGDsign"]);
nas.Pm.stages.addStage("SCInfo"            ,["コンテチップ"               ,"_SCI"    ,"コンテチップ" ,"絵コンテを分解してシーンをプロジェクトデータ化したものイニシャルデータなのでこれを出力する同名ステージは無い" ,"SCInfo"]);
nas.Pm.stages.addStage("leica"             ,["ライカ"                     ,"leica"   ,"ライカ" ,"タイミングを構成したモーションラフ" ,"draft"]);
nas.Pm.stages.addStage("contChip"          ,["絵コンテ撮"                 ,"cntC"    ,"コンテ撮" ,"コンテチップを構成したモーションラフ" ,"draft"]);
nas.Pm.stages.addStage("animatic"          ,["プリビジュアライゼーション" ,"__pv"    ,"PV" ,"同上" ,"layout"]);
nas.Pm.stages.addStage("roughSketch"       ,["ラフ原画"                   ,"drft"    ,"ラフ原" ,"同上" ,"drfat"]);
nas.Pm.stages.addStage("layout"            ,["レイアウト"                 ,"LO"      ,"LO" ,"レイアウト上がり(原図あり)" ,"layout"]);
nas.Pm.stages.addStage("LayoutAD"          ,["LOスキャン"                 ,"LO-D"    ,"レイアウトA/D" ,"layout to Data レイアウトをデータ化したもの" ,"layout"]);
nas.Pm.stages.addStage("fstKeydrawing"     ,["第一原画"                   ,"1G"      ,"一原" ,"レイアウトを含むラフ原画シート付き" ,"layout"]);
nas.Pm.stages.addStage("fstKdAD"           ,["第一原画A/D"                ,"1G-D"    ,"一原A/D" ,"" ,"layout"]);
nas.Pm.stages.addStage("keydrawing"        ,["原画"                       ,"KD"      ,"原" ,"原画上がり作画監督修正含む keyDrawing" ,"keyAnimation"]);
nas.Pm.stages.addStage("KDAD"              ,["原画A/D"                    ,"KD-D"    ,"原画A/D" ,"keyAnimation to Data 原画をデータ化したもの" ,"keyAnimation"]);
nas.Pm.stages.addStage("sndKeydrawing"     ,["第二原画"                   ,"2G"      ,"二原" ,"第一原画を原画としてフィニッシュしたもの" ,"keyAnimation"]);
nas.Pm.stages.addStage("sndKdAD"           ,["第二原画A/D"                ,"2G-D"    ,"二原A/D" ,"第二原画は原画相当" ,"keyAnimation"]);
nas.Pm.stages.addStage("checkKD"           ,["原画作監修正"               ,"KD+"     ,"作監" ,"上がりは原画として扱う" ,"keyAnimation"]);
nas.Pm.stages.addStage("preProofAD"        ,["発注前動画検査"             ,"2G+"     ,"前動検" ,"実質上の第三原画又は第二原画修正" ,"keyAnimation"]);
nas.Pm.stages.addStage("BGOrderMeeting"    ,["BG打合せ"                   ,"BGOM"    ,"BG打ち" ,"グロス発注のための打合せステージ。素材の変更なし" ,"layout"]);
nas.Pm.stages.addStage("layoutProof"       ,["美術原図整理"               ,"BGLP"    ,"原図整理" ,"レイアウト原図を整理加筆してFIXしたもの" ,"backgroundArt"]);
nas.Pm.stages.addStage("layoutAD"          ,["背景原図スキャン"           ,"LP-D"    ,"原図スキャン" ,"" ,"backgroundArt"]);
nas.Pm.stages.addStage("bgArt"             ,["背景美術"                   ,"BG"      ,"背景" ,"完成背景美術" ,"backgroundArt"]);
nas.Pm.stages.addStage("chaeckBgArt"       ,["美術検査"                   ,"BG+"     ,"美監検査" ,"" ,"backgroundArt"]);
nas.Pm.stages.addStage("BgArtAD"           ,["美術A/D"                    ,"BG-D"    ,"背景スキャン" ,"" ,"backgroundArt"]);
nas.Pm.stages.addStage("AD"                ,["動画"                       ,"AD"      ,"動" ,"動画上がり animationDrawing" ,"AnimationDrawing"]);
nas.Pm.stages.addStage("ADAD"              ,["動画A/D"                    ,"AD/D"    ,"動画A/D" ,"animation to Data 動画をデータ化したもの" ,"AnimationDrawing"]);
nas.Pm.stages.addStage("proofAD"           ,["動画検査"                   ,"AD+"     ,"動検" ,"上がりは動画 動画検査をステージ扱いする場合に使用" ,"AnimationDrawing"]);
nas.Pm.stages.addStage("ADscan"            ,["スキャン"                   ,"AD-D"    ,"スキャン" ,"彩色データ作成のためのデジタイズ処理・半製品ペイントデータ" ,"cell"]);
nas.Pm.stages.addStage("ADcleanUp"         ,["動画クリンアップ"           ,"ADCL"    ,"Adcleanup" ,"デジタイズされた動画をクリンアップする作業(これをトレースと呼ぶソフトもある)" ,"cell"]);
nas.Pm.stages.addStage("paint"             ,["彩色"                       ,"PT"      ,"PAINT" ,"ソフトウェア作業によるセル彩色" ,"cell"]);
nas.Pm.stages.addStage("proofPaint"        ,["彩色検査"                   ,"PT+"     ,"セル検" ,"彩色済みデータ" ,"cell"]);
nas.Pm.stages.addStage("retouchCell"       ,["セル特効"                   ,"PTfx"    ,"特効" ,"加工済みデータ" ,"cell"]);
nas.Pm.stages.addStage("HMechanicalTrace"  ,["マシントレース"             ,"H-mt"    ,"M-trace" ,"動画をセルに機械転写したもの(古い形式のデータを記述するためのエントリ)" ,"cell"]);
nas.Pm.stages.addStage("Htrace"            ,["ハンドトレース"             ,"H-tr"    ,"トレス" ,"セル時代の作業を記録するためのエントリ" ,"cell"]);
nas.Pm.stages.addStage("HcolorTrace"       ,["色トレス"                   ,"H-ct"    ,"色T" ,"セル時代の作業を記録するためのエントリ" ,"cell"]);
nas.Pm.stages.addStage("Htrace"            ,["ペイント"                   ,"H-pt"    ,"彩色" ,"セル時代の作業を記録するためのエントリ" ,"cell"]);
nas.Pm.stages.addStage("HproofPaint"       ,["セル検査"                   ,"H-pp"    ,"セル検" ,"セル時代の作業を記録するためのエントリ" ,"cell"]);
nas.Pm.stages.addStage("HretouchCell"      ,["エアブラシ特効"             ,"H-fx"    ,"エアブラシ" ,"セル時代の作業を記録するためのエントリ" ,"cell"]);
nas.Pm.stages.addStage("composite"         ,["コンポジット"               ,"COMP"    ,"撮影" ,"コンポジット工程をプロダクションに入れるべきか否かは結構悩む 制作工程上終端なので出力は無し 終了シンボルを作るか？" ,"ALL"]);
nas.Pm.stages.addStage("preCompositCheck"   ,["撮出し検査"   ,"PCCk" ,"撮出し" ,"撮影前全検査(古い工程を記述するためのエントリ)" ,"ALL"]);
nas.Pm.stages.addStage("generalDirectorCheck"   ,["監督チェック"                 ,"GDCk" ,"監督チェック" ,"監督による作業検査" ,"ALL"]);
nas.Pm.stages.addStage("directorCheck"   ,["演出チェック"                 ,"DcCk" ,"演出チェック" ,"担当演出による作業検査" ,"ALL"]);

/**
以下の複合ステージを追加する
海外発注等の一括作業のため本来工程として扱っていたものを複合された１工程として扱う
ステージ内では新規ステージを初期化する手間を省き、全て連続したジョブとして制作を進める
ステージの成果物は最終的な成果物をターゲットアセットとする。

    仕上(スキャン、トレース、ペイント等をステージ内ジョブとして持つ複合ステージ)
    動仕(上記の他に動画を含む複合ステージ)
    二原動画仕上(上記に更に第二原画を加えたもの)

制作担当者によるステージの切り替えが自動化された場合は、これらの複合ステージを利用せず、外注先でもUATをそのまま利用してもらうことが望ましい。
                        stageName             name                    code    shortName   description output
*/
nas.Pm.stages.addStage("TP"             ,["仕上"                     ,"T&P"      ,"仕上" ,"仕上げ一括(複合)" ,"cell"]);
nas.Pm.stages.addStage("ATP"            ,["動仕"                     ,"AT&P"     ,"動画仕上" ,"動画仕上一括(複合)" ,"cell"]);
nas.Pm.stages.addStage("sKATP"          ,["二原動仕"                 ,"sKAT&P"   ,"二原動仕" ,"二原動画仕上一括(複合)" ,"cell"]);
nas.Pm.stages.addStage("KATP"           ,["原動仕"                   ,"KAT&P"    ,"原動仕" ,"原画動画仕上一括(複合)" ,"cell"]);

/**
 * ライン分類
 * 管理モデルの簡略化のため 本線・傍線ともに分離後の個別の合流はないものとする
 * 必要なアセットはストアから引き出す
 * 制作ラインの前方にはスタートラインがあり SCinfoで始まる
 * 後方コンポジット工程の手前にアセットストア（合流）ラインがあり、ここをストアとして全ての素材がマージされる
 * カット情報を持ったコンポジット素材はコンポジット情報を元に各カットへ配分される それ以外のアセットは参照アセットとして格納される
 * 参照アセットは随時引き出し可能
 *
 *nas.Pm.lines には、その作品で定義された工程のリファレンスが格納される。
 *管理DBと連結される場合は、このオブジェクトとDB上のライン定義テーブルが対照・連結される
 *ここでは、独立駆動のためのテーブルを定義している
 *
                    id                ,[識別名称         ,shortName  ,outputAsset      ,initAsset,code  ,description]
*/
//デフォルト
nas.Pm.lines.addLine("trunk"          ,["本線"            ,"本線"    ,"cell"           ,"SCInfo" ,"cell","管理本線となるセルライン"]);

nas.Pm.lines.addLine("backgroundArt"  ,["背景美術"        ,"背景"    ,"backgroundArt"  ,"layout" ,"bg__"  ,"美術作業"]);
nas.Pm.lines.addLine("cast3D"         ,["3Dアニメーション","3D"      ,"3DCast"         ,"SCInfo" ,"__3D","3Dアニメーションキャスト"]);
nas.Pm.lines.addLine("characterDesign",["キャラクター設定","キャラ設","characterDesign","EXTRA"  ,"cd"  ,"キャラクター設定"]);
nas.Pm.lines.addLine("propDesign"     ,["プロップ設定"    ,"プロップ","propDesign"     ,"EXTRA"  ,"_prp","プロップ設定"]);
nas.Pm.lines.addLine("BGDesign"       ,["美術設定"        ,"美設"    ,"BGDesign"       ,"EXTRA"  ,"_bga","美術設定作業"]);
nas.Pm.lines.addLine("colorDesign"    ,["色彩設計"        ,"色設計"  ,"colorDesign"    ,"EXTRA"  ,"colD","色彩設計"]);
nas.Pm.lines.addLine("colorCoordiante",["色指定"          ,"指定"    ,"colorDesign"    ,"SCInfo" ,"__cc","色指定"]);
nas.Pm.lines.addLine("composite"      ,["コンポジット"    ,"撮影"    ,"ALL"            ,"ALL"    ,"comp","撮影"]);
nas.Pm.lines.addLine("ALL"            ,["(全素材)"        ,"全"      ,"ALL"            ,"ALL"    ,"_all","カット情報を持って一時的に集積されるライン"]);
nas.Pm.lines.addLine("null"           ,["(未設定)"        ,"(未)"    ,"NULL"           ,"NULL"   ,"null","初期化前のオブジェクトに設定するダミーライン"]);
/*========================================================================*/

/**
 *   制作基準テンプレート
 *  制作管理のため基準値として利用
 *   このデータは基礎データとしてユーザが編集する必要あり
 *　 サイトごとのライン内のステージの流れをテンプレートとして保存する
 *   以下に設定するのは参考用テンプレート
 * 引数
 *   親オブジェクト    (nas.Pmは参照用マスターDB　他はリポジトリを置く 対応する　lines,stages,jobNames　を配下に持っているオブジェクト)
 *   ライン    (ライン識別名で)
 *   ラインごとのステージ標準並び (出現順に配列で名称を列記)
 *  各ラインの持つステージ群の最初のエントリがデフォルトのエントリとなり、ドキュメント初期化の際に候補される　または自動処理で割り当てられる
 'startup'ステージは、テンプレート未設定の場合の汎用アウターとアップステージとする
nas.Pm.pmTemplate.members.push(new nas.Pm.LineTemplate(nas.Pm,"本線",["レイアウト","原画","動画","色指定","トレス","色トレス","ペイント","セル特効","撮出し検査","撮影"]));
nas.Pm.pmTemplate.members.push(new nas.Pm.LineTemplate(nas.Pm,"背景美術",["原図整理","背景","美術検査"]));
*/
nas.Pm.pmTemplates.addTemplate([
    ["本線",["Startup","コンテ撮","レイアウト","原画","第一原画","作画監督修正","第二原画","発注前動画検査","動画","色指定","スキャン","トレス","色トレス","ペイント","セル特効","撮出し検査","撮影"]],
    ["背景美術",["原図整理","背景","美術検査"]]
    ])
/*
    ["本線",["レイアウト","原画","動画","色指定","トレス","色トレス","ペイント","セル特効","撮出し検査","撮影"]],
    ["本線",["コンテ撮","レイアウト","原画","第一原画","作画監督修正","第二原画","発注前動画検査","動画","色指定","トレス","色トレス","ペイント","セル特効","撮出し検査","撮影"]],
    ["本線",["コンテ撮","レイアウト","原画","動画","色指定","トレス","色トレス","ペイント","セル特効","撮出し検査","撮影"]],
*/
/**
 *  ジョブは、ステージごとに定義される
 *  正確には作業中に初期状態の名称リストの他に逐次新しい名前を定義して良い
 *  定義された名称はステージごとに蓄積される
 *  以降の同ステージの作業者はそのリストから自分の作業にふさわしいジョブ名称を選択することができる
 *  新しい作業名を入力して良い
 *  ジョブの名称、順序は各ステージオブジェクト（カット）毎に異なっていて良い
 *
 *  どのステージでも０番ジョブは予約で、制作管理者が立ち上げる
 * ０番ジョブは手続き的なジョブであり、実際に素材が作成されることはほぼない
 * 名称はステージごとに定義されるが、通常は 「初期化」「開始」「作打済」「準備」 等の名称が与えられる
 * 伝票が発行されるのは０番ジョブに対して行なわれる場合が多い
 *
 *  １番ジョブは、通常そのステージの主作業
 * 原画ステージなら「原画」作業 動画ステージならば「動画」作業となる
 *
 *  ２番ジョブ以降は、主作業に対するチェック作業となる場合が多い
 *  原画ステージならば「演出検査」「作監検査」「監督検査」など
 *  ステージ内の差し戻し作業（やり直し）が発生した場合は、リテイク処理とは別に ステージ内差し戻し作業が発生する
 *  例えば演出検査で演技の変更指示が発生した場合などは、ジョブ番号を増加させて原画作業者が再度作業を行う
 *  ジョブ番号の上限は無い
 *  ステージが求めるアセットが完成するまでジョブを重ねてステージを終了させるものとする。
 
＊＊特殊事例として、「作画キャラクター制」での制作作業では、一般に作画作業者間での頻繁なやり取りが想定される。
この場合は素材の引き渡し毎に何度も「（原画）作画」作業が繰り返されることになる。
「作画キャラクター制」の場合、キャラクター統一のための作画監督作業は一般に存在しない （アニメーションディレクターとしてのチェックはある）

 *  JobDB =エントリーリスト は、ステージ・カットごとの独立したデータとなる
 *  カットとしての保存位置は、ドキュメントのエントリー記録そのもの
 *  ステージとして参照のための保存は システムの配下にJobコレクションをおいてそこに追記してゆく
 *  各エントリの名称は重複が考えられるので、Jobコレクションにエントリされたアイテム（名称）はステージに対するリレーションを保存する
 *  アイテムエントリは、以下のメソッドで随時行う
        nas.Pm.jobNames.addName("Job名" , relStage);

工程テンプレートの構成は

ラインの出力アセットでステージをフィルタする

    ライン.outputAsset==ステージ.output

抽出されたステージが入力候補となる

ステージのidでジョブ名をフィルターして
そのステージで使用可能なジョブの入力候補を取得する

ジョブ名のDBは単純な名称とリレーションするステージのセットとする
ジョブ名,ステージ名,プロパティ(init/primary/check)
ジョブ名の'*'は置換予約語でこの記述は、指定ステージ名の名称と同一の名称を用いる
ステージidの'*'は、ワイルドカード展開を行いすべてのステージに対して同じジョブを追加する


    以下は、初期値
 
nas.Pm.jobNames.addNames([
	["作業開始","*","init"],
	["初期化","*","init"],
	["作打済","*","init"],
	["準備","*","init"],
	["演出チェック","*","check"],
	["監督チェック","*","check"],
	["作監チェック","*","check"],
	["総作監チェック","*","check"],
	["メカ作監チェック","*","check"],
	["美監チェック","bgArt","check"],
	["動画検査","AD","check"],
	["動画検査","ADAD","check"],
	["セル検査","H-pt","check"],
	["彩色検査","PT","check"],
	["トレース検査","H-tr","check"],
	["トレース検査","ADscan","check"],
	["クリンアップ検査","ADcleanup","check"],
	["*作業","*","primary"]
]);

下は英訳分だけどどうも日本式の役職の英語訳はワカラン　というか　ムチャじゃね？
nas.Pm.jobNames.addNames([
	["startup","*","init"],
	["init","*","init"],
	["standby","*","init"],
	["ready","*","init"],
	["Director","*","check"],
	["ChiefDirector","*","check"],
	["AnimationDirector","*","check"],
	["ChiefAnimationDirector","*","check"],
	["","*","check"],
	["ArtDirector","bgArt","check"],
	["AnimationChecker","AD","check"],
	["動画検査","ADAD","check"],
	["セル検査","H-pt","check"],
	["PaintCheck","PT","check"],
	["トレース検査","H-tr","check"],
	["ScanCheck","ADscan","check"],
	["CleanupCheck","ADcleanup","check"],
	["*-job","*","primary"]
]);

テンプレートは、作品ごとの標準工程を示す
ユーザの入力時に入力値候補として提示される
line(並列)
stage(ラインごと順次)
job(ステージごとtype別)

line
    stage
        job
        job
    stage
        job
        job
        job
    stage
        job
        job
        job

3層のデータ構造を持つ
ジョブ名は重複が多いので省略表記設定を採用

実処理の際に展開？
又は
初期化時に展開？

展開メソッドを設けて使用時に展開するのが最もヨサゲ

ProductionLine/ProductionStage/ProductionJob
各オブジェクトを初期化するのは実際にエントリを作成するタイミングで

*/
nas.Pm.jobNames.addNames([
    ["作業開始","*","init"],
    ["初期化","*","init"],
    ["作打済","*","init"],
    ["準備","*","init"],
    ["*打合せ","*","init"],
    ["*発注","*","init"],
    ["作画打合せ","LO","init"],
    ["作画打合せ","KD","init"],
    ["作画打合せ","1G","init"],
    ["作画打合せ","2G","init"],
    ["*","*","primary"],
    ["*作業","*","primary"],
    ["演出チェック","*","check"],
    ["監督チェック","*","check"],
    ["作監チェック","*","check"],
    ["総作監チェック","*","check"],
    ["メカ作監チェック","*","check"],
    ["美監チェック","bgArt","check"],
    ["動画検査","AD","check"],
    ["動画検査","ADAD","check"],
    ["セル検査","H-pt","check"],
    ["彩色検査","PT","check"],
    ["トレース検査","H-tr","check"],
    ["トレース検査","ADscan","check"],
    ["クリンアップ検査","ADcleanup","check"]
]);

/**
 * タイトルDB
 *
 *タイトル文字列  ,[ID(リレーションID) ,フルネーム ,ショートネーム ,コード ,フレームレート ,定尺 ,入力メディア" ,"出力メディア"]
 *
 *このタイトル分類と同内容のデータがDBとの通信で扱われる
 *各アプリケーションのタイトルDBをこの形式に統一
 タイトルごとの製作工程テンプレートが必要
    テンプレートの作成用UIをサーバ上に構築
    タイトルの付随情報としてテンプレートオブジェクトを持たせる
    テンプレートオブジェクトを介して nas.PmのDBオブジェクトをアクセスする
    テンプレートにないアイテムも使用可能
        
 */
/*
nas.Pm.workTitles.addTitle("TVshowSample" ,["0000" ,"名称未設定"   ,"未定"   ,"_UN" ,"24FPS" ,"21:00:00" ,"10in-HDTV" ,"HDTV-720p"]);
nas.Pm.workTitles.addTitle("kachi"        ,["0001" ,"かちかちやま" ,"か"     ,"_KT" ,"24FPS" ,"20:12:00" ,"10in-HDTV" ,"HDTV-720p"]);
nas.Pm.workTitles.addTitle("Momotaro"     ,["0002" ,"ももたろう"   ,"も"     ,"_MT" ,"24FPS" ,"19:21:00" ,"10in-HDTV" ,"HDTV-720p"]);
nas.Pm.workTitles.addTitle("Urashima"     ,["0003" ,"うらしまたろう"   ,"う"     ,"_UR" ,"30DF" ,"19:20;00" ,"12in-HDTV" ,"HDTV-1080p"]);
*/
nas.Pm.workTitles.parseConfig('"TVshowSample",["0000","名称未設定","未定","_UN","24FPS","21:00:00 .","10in-HDTV","HDTV-720p"]\n"kachi",["0001","かちかちやま","か","_KT","24FPS","20:12:00 .","10in-HDTV","HDTV-720p"]\n"Momotaro",["0002","ももたろう","も","_MT","24FPS","19:21:00 .","10in-HDTV","HDTV-720p"]\n"Urashima",["0003","うらしまたろう","う","_UR","24FPS","24:08:12 .","12in-HDTV","HDTV-1080p"]');

/*
　* メディアDB

 *mediaName ,[ID(リレーションID) ,animationField, baseResolution ,mediaType ,tcType ,pegForm ,pixelAspect ,description]
mediaName               名称　識別名
ID                      リレーションID　登録順連番整数　DB接続時に再解決する
animationField          作画時の標準フィールドのリンク又は識別名称　主に画面縦横比（画郭）を指定するための要素
baseResolution          基本的な画像解像度（走査線密度==縦方向解像度）String　単位付き文字列で
mediaType               メディアタイプキーワード string　"drawing"=="input"||"intermediate"||"movie"=="output"
tcType                  タイムコードタイプ   frames,trag-JA,SMPTE,SMPTE-drop,page-Frames,page-SK　等の文字列で指定？
pegForm                 タップの型式         invisible,ACME,jis2hales,us3hales ビデオ等のタップと無関係のデータはinvisible　　
pixelAspect             ピクセル縦横比　縦方向を１として対する横方向の比率を浮動小数点数値で
description             コメントテキスト


nas.Pm.medias.addMedia("" ,["" ,"" ,"" ,"" ,"" ,"" ,"" ,""]);

 */
nas.Pm.medias.addMedia("作画フレーム300ppi" ,["0000" ,"12in-HDTV" ,"300dpi" ,"drawing" ,"SMPTE" ,"ACME" ,"1" ,"参考用作画フレーム"]);
nas.Pm.medias.addMedia("作画フレーム200dpi" ,["0001" ,"10in-HDTV" ,"200dpi" ,"drawing" ,"trad-JA" ,"ACME" ,"1" ,"参考用作画フレーム"]);
nas.Pm.medias.addMedia("作画フレーム192dpi" ,["0002" ,"10in-HDTV" ,"192dpi" ,"drawing" ,"trad-JA" ,"ACME" ,"1" ,"参考用作画フレーム"]);
nas.Pm.medias.addMedia("HDTV-720p"          ,["0003" ,"HDTV" ,"72dpi" ,"movie" ,"SMPTE-drop" ,"invisible" ,"1" ,"HDTV省力原版"]);
nas.Pm.medias.addMedia("HDTV-1080p"         ,["0004" ,"HDTV2K" ,"108dpi" ,"movie" ,"SMPTE" ,"invisible" ,"1" ,"HDTV"]);
nas.Pm.medias.addMedia("HDTV-2160p"         ,["0005" ,"HDTV4K" ,"216dpi" ,"movie" ,"SMPTE" ,"invisible" ,"1" ,"4KHDTV"]);


/**
    productionStaff
##team_users
#
#   組織に属する全ユーザのリスト
#   リストにないユーザは、作業に参加できない
#   書式:
#   handle:e-mail[:{option}]
#   例:
#   ねこまたや:kiyo@nekomataya.info
#
#   同形式のリストはローカルファイルシステム上はない
#   グループ（スタッフ）リストに
#      
#
*/
/*
nas.Pm.users.add(new nas.UserInfo("ねずみ:mouse@animals.example.com"));
nas.Pm.users.add(new nas.UserInfo("うし:cow@animals.example.com"));
nas.Pm.users.add(new nas.UserInfo("とら:tiger@animals.example.com"));
nas.Pm.users.add(new nas.UserInfo("うさぎ:rabbit@animals.example.com"));
nas.Pm.users.add(new nas.UserInfo("たつ:dragon@legend.example.com"));
nas.Pm.users.add(new nas.UserInfo("へび:snake@animals.example.com"));
nas.Pm.users.add(new nas.UserInfo("うま:horse@animals.example.com"));
nas.Pm.users.add(new nas.UserInfo("ひつじ:sheep@animals.example.com"));
nas.Pm.users.add(new nas.UserInfo("さる:monkey@animals.example.com"));
nas.Pm.users.add(new nas.UserInfo("とり:bird@animals.example.com"));
nas.Pm.users.add(new nas.UserInfo("いぬ:dog@animals.example.com"));
nas.Pm.users.add(new nas.UserInfo("いのしし:boar@animals.example.com"));
nas.Pm.users.add(new nas.UserInfo("アイナメ:ainame@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("イワシ:iwashi@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ウナギ:unagi@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("エソ:eso@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("オコゼ:okoze@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("カサゴ:kasago@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("キス:kisu@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("クロダイ:kurodai@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ケショウフグ:kesyoufugu@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("コノシロ:konoshiro@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("サバ:saba@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("シラウオ:shirauo@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("スズキ:suzuki@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ソメワケベラ:somewake@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("セトダイ:setodai@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("タナゴ:tanago@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("チヌ:chinu@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ツボダイ:tsubodai@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("テッポウウオ:teppouuo@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("トラフグ:torafugu@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ナマズ:namazu@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ニシキゴイ:nishikigoi@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ヌタウナギ:nutaunagi@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ネコザメ:nekozame@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ハゼ:haze@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ヒラメ:hirame@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("フグ:fugu@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ノドグロ:nodoguro@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ヘラ:hera@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ホッケ:hokke@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("マグロ:maguro@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ミゾレフグ:mizorefugu@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ムツゴロウ:mutsugoro@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("メゴチ:megochi@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("モンガラカワハギ:monngarakawahagi@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ヤツメウナギ:yatsumeunagi@fish.exapmle.com"));
nas.Pm.users.add(new nas.UserInfo("ユメカサゴ:yumekasago@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ヨシキリザメ:yoshikirizame@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ライギョ:raigyo@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("リュウグウノツカイ:ryuuguunotsukai@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ルリハタ:rurihata@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("レモンスズメダイ:remonnsuzumedai@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ロウソクギンポ:rousokuginnpo@fish.example.com"));
nas.Pm.users.add(new nas.UserInfo("ワカサギ:wakasagi@fish.example.com"));
*/
nas.Pm.users.parseConfig("\nねずみ:mouse@animals.example.com\nうし:cow@animals.example.com\nとら:tiger@animals.example.com\nうさぎ:rabbit@animals.example.com\nたつ:dragon@legend.example.com\nへび:snake@animals.example.com\nうま:horse@animals.example.com\nひつじ:sheep@animals.example.com\nさる:monkey@animals.example.com\nとり:bird@animals.example.com\n犬丸:dog@animals.example.com\nいのしし:boar@animals.example.com\nたぬきスタジオ:tanuki-st@animal.example.com\nたぬき:tanuki.tanuki-st@animal.example.com\nムジナ:mjina.tanuki-st@animal.example.com\n穴熊:anaguma.tanuki-st@animal.example.com\nアイナメ:ainame@fish.example.com\nイワシ:iwashi@fish.example.com\nエソ:eso@fish.example.com\nオコゼ:okoze@fish.example.com\nカサゴ:kasago@fish.example.com\nキス:kisu@fish.example.com\nクロダイ:kurodai@fish.example.com\nケショウフグ:kesyoufugu@fish.example.com\nコノシロ:konoshiro@fish.example.com\nサバ:saba@fish.example.com\nシラウオ:shirauo@fish.example.com\nスズキ:suzuki@fish.example.com\nソメワケベラ:somewake@fish.example.com\nセトダイ:setodai@fish.example.com\nタナゴ:tanago@fish.example.com\nチヌ:chinu@fish.example.com\nツボダイ:tsubodai@fish.example.com\nテッポウウオ:teppouuo@fish.example.com\nトラフグ:torafugu@fish.example.com\nナマズ:namazu@fish.example.com\nニシキゴイ:nishikigoi@fish.example.com\nヌタウナギ:nutaunagi@fish.example.com\nネコザメ:nekozame@fish.example.com\nハゼ:haze@fish.example.com\nヒラメ:hirame@fish.example.com\nフグ:fugu@fish.example.com\nノドグロ:nodoguro@fish.example.com\nヘラ:hera@fish.example.com\nホッケ:hokke@fish.example.com\nマグロ:maguro@fish.example.com\nミゾレフグ:mizorefugu@fish.example.com\nムツゴロウ:mutsugoro@fish.example.com\nメゴチ:megochi@fish.example.com\nモンガラカワハギ:monngarakawahagi@fish.example.com\nヤツメウナギ:yatsumeunagi@fish.exapmle.com\nユメカサゴ:yumekasago@fish.example.com\nヨシキリザメ:yoshikirizame@fish.example.com\nライギョ:raigyo@fish.example.com\nリュウグウノツカイ:ryuuguunotsukai@fish.example.com\n絶滅寸前:ztm@fish.example.com\nウナギ:unagi.ztm@fish.example.com\nねこ:cat@animal.example.com\nこねこ:kitty@animal.example.com\nいぬ:dog@animal.example.com\nこいぬ:puppy@animal.example.com\nかもめ:gull@bird.example.com\n回遊館:kaiyu@fish.example.com\n海洋工房:st-sea@fish.example.com\nマグロ:mgr.st-sea@fish.example.com\nスジクロギンポ:sjk.st-sea@fish.example.com\nワカサギ:wakasagi.st-sea@fish.example.com\nサバ:saba.st-sea@fish.example.com\nレモンスズメダイ:remonnsuzumedai.st-sea@fish.example.com\nロウソクギンポ:rousokuginnpo.st-sea@fish.example.com\nルリハタ:rurihata.st-sea@fish.example.com\nツバメ:swallow@bird.example.com\nスタジオ鳥類:st-bird@bird.example.com\nハト:pigeon@bird.example.com\nスズメ:sparrow@bird.example.com\nオウム:parrot@bird.example.com\nシジュウカラ:tits@bird.example.com\nワシ:eagle@bird.example.com\nアイガモ:duck.aigamo@bird.example.com");
//nas.Pm.staff.parseConfig("flase	*制作管理*\n-	*制作管理*	[プロデューサ]\n	*制作管理*	[統括デスク]\n	*制作管理*	[デスク]\n	*制作管理*	[制作進行]\n	*演出*\n	*演出*	[監督]\n	*演出*	[演出]\n	*演出*	[演出助手]\n	*文芸*\n	*文芸*	[脚本]\n	*文芸*	[設定]\n	*文芸*	[デザイナー]\n	*文芸*	[キャラ設定]\n	*文芸*	[美術設定]\n	*文芸*	[小物設定]\n	*文芸*	[色設計]\n	*作画*\n	*作画*	[総作画監督]\n	*作画*	[作画監督]\n	*作画*	[メカ作画監督]\n	*作画*	[原画]\n	*作画*	[第一原画]\n	*作画*	[第二原画]\n	*作画*	[動画監督]\n	*作画*	[動画検査]\n	*作画*	[動画]\n	*美術*\n	*作画*	[美術監督]\n	*作画*	[美術監督補佐]\n	*作画*	[原図整理]\n	*作画*	[背景]\n	*仕上*\n	*仕上*	[色指定]\n	*仕上*	[トレース]\n	*仕上*	[ペイント]\n	*仕上*	[特殊効果]\n	*撮影*\n	*撮影*	[撮影監督]\n	*撮影*	[撮影監督補佐]\n	*撮影*	[撮影]\n	*無所属*\n	*無所属*	[無所属]\n	*オブザーバ*\n	*オブザーバ*	[オブザーバ]\n-	*オブザーバ*	[時代考証]",'full');
nas.Pm.staff.parseConfig("false\t制作管理/\n\t\tプロデューサ\nfalse\t\t\tねずみ\n\t\t統括デスク\n\t\t\tうし\n\t\tデスク\n\t\t\tとら\n\t\t制作進行\n\t\t\tとり\n\t\t\tたつ\n\t\t\tうま\n\t\t\tひつじ\n\t演出/\n\t\t監督\n\t\t\t犬丸:dog@animal.example.com\n\t\t演出\n\t\t\t犬丸:dog@animal.example.com\n\t\t演出助手\n\t\t\tいのしし:boar@animals.example.com\n\t文芸/\n\t\t脚本\n\t\t\tウナギ\n\t\t設定制作\n\t\t\tへび\n\t\tデザイナー\n\t\t\tアイナメ\n\t\tキャラ設定\n\t\t\tいわし\n\t\t美術設定\n\t\t\tワカサギ\n\t\t小物設定\n\t\t\tクロダイ\n\t\t色彩設計\n\t\t\tツバメ:swallow@bird.example.com\n\t作画/\n\t\t総作画監督\n\t\t作画監督\n\t\t\tいわし:iwashi@fish.example.com\n\t\t作画監督補\n\t\tメカ作画監督\n\t\tメカ作画監督補\n\t\t原画\n\t\t\tねこ:cat@animal.example.com\n\t\t\tこねこ:kitty@animal.example.com\n\t\t\tいぬ:dog@animal.example.com\n\t\t\tこいぬ:puppy@animal.example.com\n\t\t\tオコゼ:okoze@fish.example.com\n\t\t\tカサゴ:kasago@fish.example.com\n\t\t\tキス:kisu@fish.example.com\n\t\t第一原画\n\t\t第二原画\n\t\t\tねこ:cat@animal.example.com\n\t\t\tかもめ:gull@bird.example.com\n\t\t動画検査\n\t\t\tサバ:saba@fish.example.com\n\t\t動画監督\n\t\t動画\n\t\t\tスズキ:suzuki@fish.example.com\n\t\t\tソメワケベラ:somewake@fish.example.com\n\t\t\tセトダイ:setodai@fish.example.com\n\t\t\tタナゴ:tanago@fish.example.com\n\t\t\tチヌ:chinu@fish.example.com\n\t\t\tたぬきスタジオ\n\t\t\tたぬき:tanuki.tanuki-st@animal.example.com\n\t\t\tムジナ:mjina.tanuki-st@animal.example.com\n\t\t\t穴熊:anaguma.tanuki-st@animal.example.com\n\t\n\t\t\t回遊館:kaiyu@fish.example.com\n\t美術/\n\t\t美術監督\n\t\t\tマグロ:mgr.st-sea@fish.example.com\n\t\t美術監督補佐\n\t\t\tスジクロギンポ:sjk.st-sea@fish.example.com\n\t\t原図整理\n\t\t\tスジクロギンポ:sjk.st-sea@fish.example.com\n\t\t背景\n\t\t\t海洋工房:st-sea@fish.example.com\n\t\t\tワカサギ:wakasagi.st-sea@fish.example.com\n\t\t\tサバ:saba.st-sea@fish.example.com\n\t\t\tレモンスズメダイ:remonnsuzumedai.st-sea@fish.example.com\n\t\t\tロウソクギンポ:rousokuginnpo.st-sea@fish.example.com\n\t\t\tルリハタ:rurihata.st-sea@fish.example.com\n\t仕上/\n\t\t色指定\n\t\t\tツバメ:swallow@bird.example.com\n\t\tトレース\n\t\t\tアイガモ:duck.aigamo@bird.example.com\n\t\tペイント\n\t\t\tアイガモ:duck.aigamo@bird.example.com\n\t\t\tスズメ:sparrow@bird.example.com\n\t\t\tオウム:parrot@bird.example.com\n\t\t\tシジュウカラ:tits@bird.example.com\n\t\t\tワシ:eagle@bird.example.com\n\t\t特殊効果\n\t\t\tたぬきスタジオ:tanuki-st@animal.example.com\n\t\t\t穴熊:meles.tanuki-st@animal.example.com\n\t撮影/\n\t\t撮影監督\n\t\t\t　さる:mnk@animal.example.com\n\t\t撮影\n\t\t\t猿山撮影所\n\t\t\tさる:mnk.mt-mnk@animal.example.com\n\t\t\tごりら:gori.mt-mnk@animal.example.com\n\t\t\tオランウータン:ora.mt-mnk@animal.example.com\n\t\t\tチンパンジー:pan.mt-mnk@animal.example.com\n\t\t\tニホンザル:mac.mt-mnk@animal.example.com\n\t\t撮影助手\n\t3D/\n\t無所属/\n\t\t＊\t\n\tオブザーバ/\n\t\tオブザーバ\n\t\t時代考証\n\t\nfalse\t\t\tガンモドキ");