﻿/*                      ------ new ValueConstractors.js
コーディング中なので、マージは保留   2016- 12.24
    xMap/Xpsで使用する値オブジェクト群

    新規のオブジェクトは、基本的に　new コンストラクタ() ではなく
    Object.create(親オブジェクト)又は、各クラスの　クラス.newオブジェクト()　メソッドで作成すること
    各々のValueオブジェクトはnas.xMapElementのcnontentプロパティとなる
    置きかえタイムラインの（区間）値としては参照を持つ
    タイムシート上は回数未定で同じ値が再利用される

このソースは、nasライブラリの基底オブジェクトを組み合わせて構成される
タイムライントラックの値（=xMapに登録されるelementの値）となるオブジェクト群

ライブラリを分割して　nas_AnimationValues.js　として　nas_common.jsの後　xpsio mapioの前に読み込むものとする
 */
/**
 *  置きかえ（セル）タイムラインのパース
 *  
 contentTextはxMapの記述の該当部分を改行区切りテキストで与える
 
 データ型式は 第一、第二型式を自動判別

    第一型式
^<group>\t<elementID>[\t<optionString>[\t<comment>]]$   
エントリーの定義を兼ねる
 
    第二型式
^\t<property> = <value>$
 第二型式（プロパティ名＝値）型式の場合はそのまま使用


 第二型式に当てはまらない場合は、第一型式とし最大4フィールドのタブ区切りテキストとみなす
 =冒頭から３つまでのタブで分割する


 第一フィールドは、グループ名パース時点のみの情報
 第二フィールドは、エレメント名　エレメント名にグループ記述が欠けている場合はこれを補う？
 第三フィールドは、オプションプロパティ URI,width,height,offsetX,offsetY,offsetR
 第四フィールドは、エレメントに対するコメント
 
  csvパーサを通してプロパティに割り付けを行う
第3フィールド以降、データ内のタブを含めすべての記述がエレメントに対するコメントプロパティとなる
 
情報はすべて省略可能
省略時は、各要素の親となるグループの持つプロパティを引き継ぐ

以上、各エレメント共通


以下種別ごとの第一型式情報並び(エレメントの配置)フォーマット

    置きかえタイムラインエレメント    
["file","size.x","size.y","offset.x","offset.y","offset.r"]

    カメラワークタイムラインエレメント
[フィールドテキスト]     フィールド記述テキストは別定義のパーサに通す　16夏改装では保留

    エフェクトタイムラインエレメント
[エフェクトテキスト]     エフェクト記述テキストは別定義のパーサに通す　16夏改装では保留

xMapのパース時は、ドキュメントの記述を整形してそれを引数としてオブジェクトを初期化する

XPSのデータをパースする場合は、データ記述からキーワードを抽出して適合するｘMapエレメントを検索する
検索に外れた場合は、デフォルトでオブジェクトを初期化
都度値を与えてxMapに登録する

xMapがない場合（暫定コード）では、仮のｘMapデータにエントリを送り以降の再利用に供する

 */
nas.AnimationReplacement=function(myParent,myContent){
    this.parent = (myParent)? myParent : null     ;
    this.contentText = (myContent)? myContent : '';//xMap上のコンテントソースを保存する　自動で再構築が行なわれるタイミングがある
                                                   //myContent undefined で初期化を行った場合の値は blank-cell
    this.source                                   ;//nas.AnimationElementSource
    this.formGeometry                             ;//nas.AnimationFieldオブジェクト
    this.resolution                               ;   //要素の解像度   nas.Resolution()
    this.size                                     ;   //要素のサイズ   nas.Size()
    this.offset                 ;                       //要素の原点オフセット   nas.Offset()
    this.pegOffset              ;                       //要素のペグオフセット＊　これらはオブジェクトで統合？
    this.comment                ;                       //コメント文字列　エレメントの注釈プロパティ-xMap編集UIのみで確認できる
    this.overlay                ;                       //カブセの対象となるエレメントへの参照 　< elementのプロパティへ移行が必要？
    
    this.parseContent();
}
/**
    //  引数なし　または引数が１つで文字列'basic'またはfalseと判断される場合は標準保存形式出力
    標準保存形式
^<group>\t<cellDescription>\t< ここまではElementObjectの出力範囲
<proppertyValues>\t<comment>
    例
"./stages/kd/kt#00[pilot]__s-c001_kd.psd///kd/A/0001+",254mm,142.875mm,127mm,71.4375mm	testOverlay

proppertyValuesは、comma区切りで以下の順のデータ
["<source>"[,size.X,size.Y[,offset.X,offset.Y[,offset.R]]]]
末尾から順にすべて省略可能
各エントリに登録のない場合はデフォルトの値が使用される

    //  引数が 'extended'の場合は拡張保存形式で返す
    拡張保存形式
^\t<propname> = <proppertyValue>$\n
    例
	file = "./stages/kd/kt#00[pilot]__s-c001_kd.psd///kd/A/0001+"
	
	
    //  引数が一つ以上ある場合の処理

*/
nas.AnimationReplacement.prototype.toString=function(exportForm){
    if(exportForm == 'extended'){
        var resultArray=[];
        if(this.source)   resultArray.push('\tfile = "'    + this.source.toString(true)+'"');
        if(this.size)     resultArray.push('\tsize = '     + this.size.toString(true));
        if(this.offset)   resultArray.push('\toffset = '   + this.offset.toString(true));
        if(this.rotation) resultArray.push('\trotation = ' + this.rotation.toString(true));
        if(this.comment)  resultArray.push('\tcomment = '  + this.comment);
        return resultArray.join("\n");
    }else if ((arguments.length==0)||((arguments.length==1)&&(! arguments[0]))){
        var resultArray=[];
        if(this.source) {
            resultArray.push('"'+this.source.toString()+'"');
        }else{
            resultArray.push("");
        }
        if(this.size)     resultArray.push(this.size.toString());
        if(this.offset)   resultArray.push(this.offset.toString());
        if(this.rotation) resultArray.push(this.rotation.toString());
        resultArray = [resultArray.join(",")];
        resultArray.push(this.comment);
        return resultArray.join("\t");
    }
}
//nas.AnimationReplacement.prototype.valueOf=function(){
//    return nas.parseNumber(nas.normalizeStr(this.name).replace(/^[^0-9]*/,""))
//valueOfの設定自体にあまり意味が無いのでやめたほうがヨサゲ　
//}
/**　与えられたオブジェクトとプロパティ同士を比較して　変更状態を返す
    引数
対照する基準値（オブジェクト）
    戻り値
変更状態コード
0   変化なし    最小標準出力に対応
1   標準変更    拡張標準出力に対応
2   重度変更    フルダンプに対応
*/
nas.AnimationReplacement.prototype.compareWith= function(targetValue){
    var igunoreProps    =['contentText','source'];
    var basicProp       =['size','offset','comment'];
    var extendProps     =['pegOffset',];
}
/** タイミングパラメータに従って指定されたフレームのキー間の補完値を返す

  　置きかえタイムラインの中間値は前方値で代表されるので基本的に戻り値は自分自身
    オプションの状態によって（時間的）中間タイミングで後方値に切り替える
    return endValue;
    又はブランク状態のオブジェクトを返す
  　return new nas.newAnimationReplacement("blank");
*/
nas.AnimationReplacement.prototype.interpolate= function(endValue,indexCount,indexOffset,frameCount,frameOffset,props){
    return this;
}

/** Contentをパースして　プロパティを設定する内部メソッド
引数でcontentを与えてオブジェクト全体の値を更新することも可能
引数がAnimationRepalcementであった場合は、全プロパティを継承して引き写す
ただし引数と同じジョブ内のコレクションに追加を行う場合は、失敗するので要注意

xMap形式のデータをパースする　nas.AnimationXXX シリーズオブジェクトの共通メソッド
xMapパーサから呼び出す際に共通でコールされる
引数が与えられない場合は、現在の保持コンテンツを再パースする
*/
nas.AnimationReplacement.prototype.parseContent = function(myContent){
    var blankRegex  = new RegExp("^[ｘＸxX×〆0０]$");//カラ判定　システム変数として分離予定
    var interpRegex = new RegExp("^[\-\+=○●*・a-zア-ン]$|^\[[^\]]+\]$");//中間値補間（動画記号）サイン　同上
    var valueRegex  = new RegExp("^[\(<]?[0-9]+[>\)]?$");//無条件有効値 同上

//引数がなければ現在のコンテンツを再パース
    if(typeof myContent == 'undefined'){
        myContent = this.contentText;
    }

//第一形式 ^<group>\t<name>[\t<option-text>[\t<comment>]]$
    myContent = String(myContent).split('\n');
    for ( var line = 0 ; line < myContent.length ; line++){
        if(myContent[line].match(/^\t(\S+)\s*=\s*(.+)\s*$/)){
            //第二形式でプロパティ別のデータ更新を行う
            var myProp=RegExp.$1;var valueArray=scvSimple.parse(RegExp.$2)[0];
            switch(myProp){
            case "file":
                this.file = valueArray[0];
            break;
            case "resolution":
                this.resolution= new nas.Resolution(valueArray.join(','));
            break;
            case "resolution.X":
                this.resolution.x = new nas.UnitResolution(valueArray[0],this.resolution.type);
            break;
            case "resolution.Y":
                this.resolution.y = new nas.UnitResolution(valueArray[0],this.resolution.type);
            break;
            case "size":
                this.size = (valueArray.length<3)?
                    new nas.Size(valueArray[0],valueArray[1]):new nas.Size(valueArray[0],valueArray[1],valueArray[2]);
            break;
            case "size.X":
                this.size.x = valueArray[0];
            break;
            case "size.Y":
                this.size.y = valueArray[0];
            break;
            case "offset":
                this.offset = (valueArray.length<3)?
                    new nas.Offset(valueArray[0],valueArray[1]):new nas.Offset(valueArray[0],valueArray[1],valueArray[2]);
            break;
            case "offset.X":
                this.offset.x
            break;
            case "offset.Y":
            break;
            case "offset.R":
            break;
            case "pegOffset":
            break;
            case "pegOffset.X":
            break;
            case "pegOffset.Y":
            break;
            case "pegOffset.R":
            break;
          　default:
                this[myProp]=valueString;
            }
        }
        
    }
    this.contentText = myContent.join('\n');
    return this;    
}
/**
    置きかえタイムライントラックをパースしてセクションコレクションを返す
    セクションの値を各トラックごとの値オブジェクトからxMapを介したxMapエレメントに変更する

    パース時にセクションの値判定を行う
    ・無効記述
    ・有効記述　値あり（xMap既存エレメント）・なし（新規エレメント）
    
 タイムライントラックをパースする際に統一手順としてトラックに対応するxMapエレメントグループの有無を確認する。
現行Jobにトラックと同名のエレメントグループが、存在しなかった場合（Stageには存在する可能性あり）は、新規にグループを作成してエントリすること。
この処理は、トラックパースの前段階で共通で行うことにする

確認手段は xMap.getElementByName(グループ名)を使用
//XpsTimelineTrack.parseTimelineTrack()　メソッドに置く


中間値補間区間の空セルに対応するために全体のブランク処理をサブセクションコレクションに置く
置きかえタイムラインのみの処置
カラ状態のみを扱うsctionCollectionを併置してセットで扱うので注意
各セクションのvalueは　on/off(true/false)のみでオブジェクトは使用されない　エレメントへのリンクも無い
一つのトラックをパースして二つのセクションコレクションを得る
値側のコレクションは、従来のカラを含むことができるが、このパーサが書き出すデータ上は従来型のカラが含まれることは無い
カラ区間の値は先行区間の値となる
カラセル区間コレクションは2つの状態しか持ち得ないので、サブセクションは発生しない

　*/
_parseReplacementTrack=function(){
    var blankRegex  = new RegExp("^[ｘＸxX×〆0０]$");//カラ判定　システム変数として分離予定
    var interpRegex = new RegExp("^[\-\+=○●*・a-zア-ン]$|^\[[^\]]+\]$");//中間値補間（動画記号）サイン　同上
    var valueRegex  = new RegExp("^[\(<]?[0-9]+[>\)]?$");//無条件有効値 同上
    //自分自身(トラック)を親として新規セクションコレクションを作成
    var myCollectionBlank = new XpsTimelineSectionCollection(this);//ブランクベースコレクション
    var myCollection      = new XpsTimelineSectionCollection(this);//ベースコレクション
    //継続時間０で値未定初期セクションを作成
    //値を持たないセクションをブランク値のオブジェクトとするか？
    var currentSection=myCollection.addSection(null);
    var currentSectionBlank=myCollectionBlank.addSection(null);

    var currentSubSection=null;
    var currentValue=this.getDefaultValue();
    var isInterp = false;
    var isBlank  = ((currentValue != "blank")&&(currentValue))? false:true ;//第一フレームのブランク状態を設定
    var valueDetect = false;
/**
    タイムライントラックのデフォルト値は、以下の手続きで取得
    タイムラインラベルが指定するグループがあらかじめ存在する場合は、そのグループオブジェクトが保持する値
    存在しない場合は、新規にグループを作成する。その際にトラックの種別ごとのValueオブジェクトを初期値として登録するのでその値を使用
    XpsTimelineTrack.getDefeultValue()側で調整
    Replacementの場合、基本ブランクだが必ずしもブランクとは限らないので要注意
    トラック上で明示的なブランクが指定された場合は、値にfalse/null/"blank"を与える。
*/
    for (var fix=0;fix<this.length;fix++){
        var currentCell=Xps.sliceReplacementLabel(new String(this[fix]));//記述をラベルとエントリに分解
        if( currentCell.length == 1 ){ currentCell.push(this.id); }
        //グループラベル付き・なしを判定する機能が必要
        currentSection.duration ++; //
        currentSectionBlank.duration ++;     //セクション長加算        
        //未記入データ　これが一番多いので最初に処理しておく(処理高速化のため)
        if(currentCell[0].match(/^([\|｜;]|\s+)$/)||currentCell.length==0) continue;
        //ブランク判定
        /*
            値処理に先立ってブランク関連の処理はすべて終了する
            ブランク状態切り替え判定 カレントを切り替えて新規セクションを積む
        */
        var valueDetect   = (detectedValue)? true:false;
        var blankDetect   = (new String(currentCell[0]).match(blankRegex))?  true:false;
        var interpDetect  = (new String(currentCell[0]).match(interpRegex))? true:false;//括弧つきの補間サインも同時検出へ
//        console.log(fix+":"+this[fix]+" interp:"+interpDetect + "  blank: " + blankDetect);
        var detectedValue = this.xParent.parentXps.xMap.getElementByName(currentCell);
        //ブランク処理判定
        if(blankDetect){
                if(! isBlank){
                    isBlank=true;
                    currentSectionBlank=myCollectionBlank.addSection("blank");
                }
                continue;
        }
        //中間値補間サインを検出したら中間値処理モード
        //既定値以外の補間サイン検出が必要
        if(interpDetect){
              if( isBlank ){ isBlank = false;}
              if(! isInterp ){
                //中間値補間区間開始　カレントセクションを切り替え サブセクションを登録
                isInterp = true;
                currentSection=myCollection.addSection("interpolation");
                currentSection.subSections.addSection();
                //新規中間値補間セクションを立てる 以降は、モードを抜けるまでカレント固定
              }else{
                currentSection.subSections.addSection();
                //中間値補間モード内ではサブセクションを登録
              }
              continue;
        }
        //区間値を処理
/**
    既存エントリがない場合、エントリ文字列が条件を満たせば新規エントリとしてxMapにグループとエントリを登録して使用する
    それ以外は、無効エントリとなる
*/
        var currentElement = this.xParent.parentXps.xMap.getElementByName(currentCell.reverse().join("-"));
        if(currentElement) {
            valueDetect=true;
        }else{
            if(currentCell[0].match(valueRegex)){
                valueDetect = true;
                currentElement=this.pushEntry(currentCell[0],currentCell[1])
            }
        }
        if(valueDetect){
            if(isBlank){
                isBlank = false;
                currentSectionBlank.duration --;
            }
            if(isInterp){
                isInterp = false;
                currentSection.duration --;
                currentSection = myCollection.addSection(currentElement.value);
                currentSection.duration ++;
            }
        }
        continue
    }
    this.sections       = myCollection;
    this.sectionsBlank  = myCollectionBlank;
//    console.log("sections-length:"+myCollection.length +":blank:"+myCollectionBlank.length);
    return this.sections;//ブランク情報の返し方を考えたほうが良いかも
}

/*test


*/


/**
 *  ジオメトリタイムラインの（区間）値
 *  カメラワーク
 基本的なサイズは、トラックに設定されたデフォルト値から継承する
 
 */
nas.AnimationGeometry =function(myContent){
    this.contnentText=(myContent)?myContent:'';   //xMapのソースを保存する　自動で再構築が行なわれるタイミングがある
    this.source;//参照画像データソース　存在する場合は、type="still-reference"で初期化される
    this.formGeometry;//nas.AnimationFieldオブジェクト
    this.position;//要素を配置する位置
    this.offset;//要素の原点オフセット
    this.scale;//要素スケール
    this.x = this.size.x;
    this.y = this.size.y;
    this.z = this.size.z;
    this.t;
    this.c;
    this.comment="";//コメント文字列
    
    this.parseContent(contentText);
}

nas.AnimationGeometry.prototype.constractor=nas.AnimationField.constractor


/**
    文字列化して返す
    exportForm
    basic
source+
    extend
*/
nas.AnimationGeometry.prototype.toString=function(exportForm){
    if(exportForm=='extended'){
        var resultData=[];
        if(this.source)     resultData.push(this.source.toString(true));   
        if(this.size)       resultData.push(this.size.toString(true));
        if(this.position)   resultData.push(this.position.toString(true));
    }else{
    }
    return this.contentText;
}
/**
    コンテンツを与えてパースする
    引数がない場合は自身のコンテンツデータを再パースする
*/
nas.AnimationGeometry.prototype.parseContent=function(myContent){
    if(typeof myContent == 'undefined'){
        myContent = this.contentText ;
    }
    this.contentText = (myContent)?String(myContent):"";
    return this;
}

nas.AnimationGeometry.prototype.interpolate= function(endValue,indexCount,indexOffset,frameCount,frameOffset,props){
    return this;//置きかえタイムラインの中間値は前方値で代表される
    /* オプション状態で中間タイミングで後方値に切り替える（時間で） return endValue;
    　 又はブランク状態のオブジェクトを返す return new nas.newAnimationReplacement("blank");
    */
}
/**
    カメラワークトラックをパースしてセクションコレクションを返す
    option:(camerawork|camera)
    セクションの状態は
    値：
        あり>有値セクション
            何らかの値オブジェクトを持つ値セクション　この継続時間中トラックの持つ値は変化しない最短で１フレーム
        なし>中間値補間セクション
            valueプロパティが空で値オブジェクトを持たない
            中間値補間サブセクションコレクションを持つ
    cameraworkタイムライントラックセクションの開始、終了判定
    セクションは「値区間(セクション)」と「中間値補間区間(セクション)」の２種に分類される
    中間値セクションは必ず前後に値セクションを持つ
    値区間は連続することが可能
    値区間は最低でも１フレームの継続時間を持ち、そのトラックの返す値nas.AnimationGeometryオブジェクトを保持する

    補間区間は、値オブジェクトを持たず、サブセクションコレクションを持ち　前後の値区間の中間値を補間して戻す
    サブセクションは値としてnas.ValueInterpolatorオブジェクトを持つ
    
    補間区間は補間区間開始ノードで開始され終了ノードで閉じる
    
    入力としては開始ノードと終了ノードはそれぞれ対応するサインを対で使用することが求められる
    特定の開始ノードで初期化された補間区間は、明示的に開始ノードと対の終了ノードで閉じられるか又は
    後続の値エントリが宣言されて値区間が開始されるまでの間継続される
    中間値補間区間はその区間が閉じられるまでの間　基本的にすべての空白以外のエントリが副補間区間を初期化する。
    開始ノードは必ず副補間区間を開始するが、終了ノードは副補間区間を開始するとは限らない。
        
    終了ノードが中間値補間ノードとなるかならないかの判定
  　
  　区間内の終了ノードを除く中間値生成ノードの数がdurationの整数分の１である（割り切れる）場合（＝ 均等フレーミング）の場合
  　終了ノードは中間値を初期化しない。
  　
  　タイミングが乱れ打ちの中間値補間を行う場合は、終了ノードを利用せずにタイミング指定を行うものとする
  　実際に開始ノードと終了ノードのみの区間があった場合は、中間値指定ノードでシートセルを埋めるように促すほうが良い
*/
_parseCameraworkTrack= function(){
    var myCollection    = new XpsTimelineSectionCollection(this);//自分自身を親としてセクションコレクションを新作
    var currentSection  = myCollection.addSection(false);//開始セクションを作成　継続時間０　値は保留
    var currentSubSection  = null;//操作サブセクションへの参照　値はカラ 処理中は操作対象オブジェクトへの参照
    var currentEffect   = new nas.AnimationGeometry("");//コンテンツはカラで初期化も保留
    var currentNodeSign = false;//否で初期化(確認用)
    var valueDetect     = false;//否で初期化(確認用)
    var startNodeRegex=new RegExp("^[▼▽↑●◯◎◆◇★☆]$");
    var endNodes={
        "▼":"▲",
        "▽":"△",
        "↑":"↓",
        "●":"●",
        "○":"◯",
        "◎":"◎",
        "◆":"◆",
        "◇":"◇",
        "☆":"☆",
        "★":"★"
    };
    for (var fix=0;fix<this.length;fix++){
        currentSection.duration ++;//currentセクションの継続長を加算
        if( currentSubSection ) currentSubSection.duration ++;//currentセクションの継続長を加算
//未記入データ　これが一番多いので最初に処理しておく
        if(this[fix]==""){
            continue;
        }
//中間値補間セクション終了ノード(対で処理する方)
        if(this[fix]==currentNodeSign){
            //補間サブセクションを初期化するかどうかを判定
            if( currentSection.duration % currentSection.subSections.length ) {
                currentSubSection = currentSection.subSections.addSection();//割り切れない場合サブセクションを初期化
                currentSubSection.duration = 1;//必ず1
            }
            currentNodeSign=false;//補間区間終了ノードクリア
            currentSection=myCollection.addSection(false); // 新規値セクション追加
            continue;
        } else
/** この正規表現は仮でハードコーディング　あとで設定ファイルからの反映に変更予定*/
        if(this[fix].match(startNodeRegex)){
/**
    予約開始ノードサイン検出
予約語の開始ノードサインを検出したので対応する終了ノードをセットする
第一区間が補間区間であった場合、トラックのデフォルト値を先行区間の値とする。
第一区間は、値区間　補間区間のいずれでも良いので初期区間の値は保留されている
検出したサインがカレントノードサインと一致していたら補間区間終了それ以外は副補間区間のエントリ初期化
セクションノードサイン
予約語
    /^[▼▽↑●○◎◆◇★☆]$/
    特殊ノードとして中間値補間区間を開き、同じサインで当該の区間を閉じる
    予約語以外の中間値指定ノードには閉鎖機能がない
    値指定ノード以外は基本的にすべて中間値指定ノードとする
    空白エントリ・予約語以外の記述は値を指定するノードか否かを判定する。
    明示的に値を生成するノードを切り分け　残るエントリはｘMapに問い合わせを行い値を持たないエントリを中間値発生ノードとして扱う
*/
            if(currentNodeSign==false){
                currentNodeSign=endNodes[this[fix]];//予約語で開いたので終了ノードを設定する
                if(fix == 0){
                    currentSection.subSections=new XpsTimelineSectionCollection(currentSection);//第一フレームだった場合のみ第一セクションを補間区間に変換
                    currentSubSection=currentSection.subSections.addSection();//同時に第一サブセクションを初期化
                    currentSubSection.duration = 1;
                }else{
                    currentSection.duration --;
                    currentSection = myCollection.addSection("interpolation"); //それ以外は新規補間セクション追加
                    currentSection.duration = 1;
                    currentSubSection = currentSection.subSections.addSection();
                    currentSubSection.duration = 1;
                }
            } else {
                currentSubSection = currentSection.subSections.addSection();
            }
            currentSubSection.duration = 1;
        } else {
//予約ノードサイン外
/**
valueDetect = fale;
値指定ノード\[[^\]]+\]を検出した場合、セルエントリーの角括弧を払って評価値を得る　かつ　フラグを立てる　(valueDetect = true)
それ以外はセルエントリーを評価値とする
    xMapで評価値をエントリ検索
    マップエントリがない場合でかつ　valueDetect == true なら　エントリを作成してそれを値として使用
    エントリがあれば valueDetect = true なければ false
valueDetect==true
    カレントセクションが中間値補間セクションだった場合はカレントセクションをクロースして検出した値をもつ値セクションを初期化する
    カレントセクションの値が未設定の場合、カレントセクションの値を設定
    カレントセクションに値がある場合は新規の値セクションを初期化
valueDetect==false
    エントリがない場合は中間値指定ノードとなる
    カレントセクションが中間値補間セクションだった場合は新規に副補間区間を初期化
    値区間だった場合は新規に中間値補間セクションを初期化して第一副補間区間を初期化する
    トラック内無効記述（コメント）は現在許可されない。
*/
    valueDetect = false;
    if(this[fix].match(/^\[([^\]])\]$/)){
        var checkValue=RegExp.$1;
        valueDetect=true;
    }else{
        var checkValue= this[fix];
    }
    var currentEntry = this.xParent.parentXps.xMap.getElementByName(checkValue);//グループIDを加える
    if((! currentEntry) && (valueDetect)){
        //new_MapElement(name,Object xMapGroup,Object Job)
//        currentEntry=xMap.new_xMapElement(checkValue,MAP.getElementByName(this.id),this.xParent.parentXps.currentJob);
        currentEntry=checkValue;
    }else{
        valueDetect=(currentEntry)?true:false;
    }
            if(currentEntry){
                if(currentNodeSign){
                    currentSection.duration--;//閉鎖ノード無しで前セクションを閉じるので加算したdurationをキャンセル
                    currentNodeSign = false;//補間区間終了ノードクリア
                    currentSection = myCollection.addSection(currentEntry);//新規セクション追加
                    currentSubSection = null;
                } else {
                    if (currentSection.value){
                        currentSection.duration--;//閉鎖ノード無しで前セクションを閉じるので加算したdurationをキャンセル
                        currentSection = myCollection.addSection(currentEntry);//新規セクション追加
                        currentSubSection = null;
                    }else{
                        currentSection.value=currentEntry;//値を遅延設定
                    }
                }               
            } else if(currentNodeSign) {
//               console.log("fix:"+fix);
　　　         currentSubSection = currentSection.subSections.addSection();
　　　         currentSubSection.duration = 1;
            }
        }
    }
    this.sections=myCollection;
    return this.sections;
}

/**
 *  コンポジットタイムラインの（区間）値
 *  エフェクト
 */
nas.AnimationComposite =function(myContent){
    this.contentText=(myContent)?myContent:'';   //xMapのソースを保存する　自動で再構築が行なわれるタイミングがある
    this.source;//参照画像データのurl　nas.AnimationElementSource
//    this.duration;//ソースが時間情報を持ったデータだった場合の継続時間
//    this.startOffset;//ソースが時間情報を持ったデータだった場合のオフセット
//    this.formGeometry;//ソース内のオフセット情報　nas.AnimationFieldオブジェクト
    this.effect = '';
    this.blendingMode="normal";
    this.strength;// ? 
    this.t = new nas.TimingCurve();
    this.c = new nas.Curve();
    this.comments;//コメントコレクション配列 これは区間のプロパティか？
}
nas.AnimationComposite.prototype.interpolate= function(endValue,indexCount,indexOffset,frameCount,frameOffset,props){
    myResult=Object.create(this);
    myResult.opacity=(this.opacity+endValue.opacity)*(indexCount/indexCount);// 仮値リニア補間
    return myResult;//コンポジットタイムラインの中間値は濃度値のみ

}
/**
    xMapデータのために文字列化して返す　予定だが
    今はダミー
*/
nas.AnimationComposite.prototype.toString=function(){
    return (this.contentText);
    
    var props=['effect','blendingMode','strength','t','c','comment'];
    var myResult = '';
    for (var pid=0;pid<props.length;pid++){
        if(this[props[pid]]){
            myResult += '\t'+props[pid]+' = '+this[props[pid]]
        }
    }

}
/**
    コンテンツを与えてパースする
    引数がない場合は自身のコンテンツデータを再パースする
*/
nas.AnimationComposite.prototype.parseContent=function(myContent){
    if(typeof myContent == 'undefined'){
        myContent = this.contentText ;
    }
    this.contentText = (myContent)?String(myContent):"";
    this.contentText = this.toString();
    return this;
}
/**
    コンポジットトラックをパースしてセクションコレクションを返す
    option:(effect|sfx|composite)
    セクションの状態は
    値：
        あり>有値セクション
            何らかの値オブジェクトを持つ値セクション　この継続時間中トラックの持つ値は変化しない最短で１フレーム
        なし>中間値補間セクション
            valueプロパティが空で値オブジェクトを持たない
            中間値補間サブセクションコレクションを持つ
    compositeタイムライントラックセクションの開始、終了判定
    セクションは「値区間(セクション)」と「中間値補間区間(セクション)」の２種に分類される
    中間値セクションは必ず前後に値セクションを持つ
    値区間は連続することが可能
    値区間は最低でも１フレームの継続時間を持ち、そのトラックの返す値を保持する
    補間区間は、値オブジェクトを持たず、サブセクションコレクションを持ち　前後の値区間の中間値を補間して戻す
    補間区間は補間区間開始セパレータで開始され終了セパレータで閉じる
    入力としては開始セパレータと終了セパレータが同一のエントリを対で使用することが求められる
    開始セパレータで宣言された補間区間は、明示的に開始セパレータと対の終了セパレータで閉じられるか又は
    後続の値エントリを宣言して値区間を開始されくまでの間継続される
    補間区間はその区間が閉じられるまでの間　すべての空白以外のエントリが副補間区間を開始する。
    補間区間中すべてのエントリが空白であった場合に限り、空白区間がすべて副補間区間のエントリとなる
    （＝補間区間に何も間に置かなかったトラックは１コマ撮りの補間区間となる）
*/
_parseCompositeTrack=function(){
    var myCollection    = new XpsTimelineSectionCollection(this);//自分自身を親としてセクションコレクションを新作
    var currentSection  = myCollection.addSection(false);//開始セクションを作成　継続時間０　値は保留
    var currentSubSection  = null;//操作サブセクションへの参照　値はカラ 処理中は操作対象オブジェクトへの参照
    var currentEffect   = new nas.AnimationComposite("");//コンテンツはカラで初期化も保留
    var currentNodeSign = false;//否で初期化(確認用)
    var valueDetect     = false;//否で初期化(確認用)
    
    for (var fix=0;fix<this.length;fix++){
        currentSection.duration ++;//currentセクションの継続長を加算
        //未記入データ　これが一番多いので最初に処理しておく
        if(this[fix]==""){
            continue;
        }
        //区間の値
        //中間値補間セクション開始セパレータ(対で処理する方)
        
/** この正規表現は仮でハードコーディング　あとで設定ファイルからの反映に変更予定*/
        if(this[fix].match(/^[▼▲▽△●○◎◆◇☆★]$|^\][^\]]+\[$|^\)[^\(]+\($/)){
/**
    ノードサイン検出
第一区間が補間区間であった場合、トラックのデフォルト値を先行区間の値とする。
第一区間は、値区間　補間区間のいずれでも良いので初期区間の値は保留されている
currentNodeSignがfalseであった場合はセクション開始
それ以外の場合、補間区間のエントリ中でのサイン検出
検出したサインがカレントノードサインと一致していたら補間区間終了それ以外は副補間区間のエントリ初期化
セクションノードサイン
予約語
    /^[▼▲▽△●○◎◆◇☆★]$|^\][^\]+]\[$|^\)[^\(+]\($/
    特殊ノードとして中間値補間区間を開き、同じサインで当該の区間を閉じる
    予約語以外の中間値指定ノードには閉鎖機能がない
    値指定ノード以外は基本的にすべて中間値指定ノードとする
    空白エントリ・予約語以外の記述は値を指定するノードか否かを判定する。
    明示的に値を生成するノードを切り分け　残るエントリはｘMapに問い合わせを行い値を持たないエントリを中間値発生ノードとして扱う
*/
            if(currentNodeSign==false){
                currentNodeSign=this[fix];//予約語で開いたのでノードを控える
                if(fix==0){
                    currentSection.subSections=new XpsTimelineSectionCollection(currentSection);//第一フレームだった場合のみ第一セクションを補間区間に変換
                    currentSubSection=currentSection.subSections.addSection();//同時に第一サブセクションを初期化
                    currentSubSection.duration = 1;
                }else{
                    currentSection.duration --;
                    currentSection = myCollection.addSection("interpolation"); //それ以外は新規補間セクション追加
                    currentSection.duration = 1;
                    currentSubSection = currentSection.subSections.addSection();
                    currentSubSection.duration = 1;
                }
                currentSection.subSections.addSection();//オープンと同時に第一サブセクションを初期化
            } else if (currentNodeSign==this[fix]){
                //開始ノードと一致
                if( currentSection.duration % currentSection.subSections.length ) {
                    currentSection.subSections.addSection();//割り切れない場合サブセクションを初期化
                }
                currentNodeSign=false;//補間区間終了ノードクリア
                currentSection = myCollection.addSection(false); // 新規セクション追加　終了ノードで閉じたので加算はなし
            } else {
                currentSection.subSections.addSection();
            }
        } else {
//予約ノードサイン外
/**
valueDetect = fale;
値指定ノード<[^>]+>を検出した場合、セルエントリー矢括弧を払って評価値を得る　かつ　フラグを立てる　(valueDetect = true)
それ以外はセルエントリーを評価値とする
    xMapで評価値をエントリ検索
    マップエントリがない場合でかつ　valueDetect == true なら　エントリを作成してそれを値として使用
    エントリがあれば valueDetect = true なければ false
valueDetect==true
    カレントセクションが中間値補間セクションだった場合はカレントセクションをクロースして検出した値をもつ値セクションを初期化する
    カレントセクションの値が未設定の場合、カレントセクションの値を設定
    カレントセクションに値がある場合は新規の値セクションを初期化
valueDetect==false
    エントリがない場合は中間値指定ノードとなる
    カレントセクションが中間値補間セクションだった場合は新規に副補間区間を初期化
    値区間だった場合は新規に中間値補間セクションを初期化して第一副補間区間を初期化する
    トラック内無効記述（コメント）は現在許可されない。
*/
    valueDetect = false;
    if(this[fix].match(/^<([^>]+)>$/)){
        var checkValue=RegExp.$1;
        valueDetect=true;
    }else{
        var checkValue= this[fix];
    }
    var currentEntry = this.xParent.parentXps.xMap.getElementByName(checkValue);
    if((! currentEntry) && (valueDetect)){
        //new_MapElement(name,Object xMapGroup,Object Job)
//        currentEntry=xMap.new_xMapElement(checkValue,MAP.getElementByName(this.id),this.xParent.parentXps.currentJob);
        currentEntry=checkValue;
    }else{
        valueDetect=(currentEntry)?true:false;
    }
            if(currentEntry){
                if(currentNodeSign){
                    currentSection.duration--;//閉鎖ノード無しで前セクションを閉じるので加算したdurationをキャンセル
                    currentNodeSign = false;//補間区間終了ノードクリア
                    currentSection = myCollection.addSection(currentEntry);//新規セクション追加
                } else {
                    if (currentSection.value){
                        currentSection.duration--;//閉鎖ノード無しで前セクションを閉じるので加算したdurationをキャンセル
                        currentSection = myCollection.addSection(currentEntry);//新規セクション追加
                    }else{
                        currentSection.value=currentEntry;//値を遅延設定
                    }
                }               
            } else if(currentNodeSign) {
　　　         currentSubSection=currentSection.subSections.addSection();
　　　         currentSubSection.duration = 1;
            }
        }
    }
    this.sections=myCollection;
    return this.sections;
}

/*
簡易オブジェクトで実装
エレメントのラップもしない

nas.AnimationSound Object
　同名のオブジェクトとの互換はあまり考えない
　名前が同じだけと思うが吉
　タイムシートサウンドトラックの値となる
　外部ファイルリンクはこの際割愛

    現在のプロパティ

    getStream(cellCount);
タイムシート用のストリームを配列で返す（内部利用メソッド）
引数のカウントはデータを配置するオブジェクト継続フレーム数　０〜
（値は継続時間を持たない）
引数０の際はラベルとセパレータ分の配列を返す

    toString(cellCount);
引数のカウントに従ってタイムシート上での利用のためcsvストリームで戻す
それ以外の場合はコンテントテクストを戻す（メソッド）

    contentText;    String
内容テキスト原文　"たぬきさん(off)「ぽん！(SE:ポン)ぽこ！<BGM:開始>りん！[光る！]」"
    name;    String
ラベルとなる名称    "たぬきさん"

    bodyText;    String
台詞本体のテキスト　"ぽん！ぽこ！りん！"

    attributes;    Array
オブジェクト属性の配列 ["(off)"] 

    comments;    Array
ノートコメントコレクション配列 [[3,"(SE:ポン)"],[6,"<BGM:開始>"],[9,"[光る！]"]]
コメントのインデックスはbodyText内の挿入点　シート展開時は、bodyText.length+comments.length のフレームを再配置する
*/
nas.AnimationSound=function(myContent){
    this.contentText=(myContent)?String(myContent):"";//xMapのソースを保存する　自動で再構築が行なわれるタイミングがある
    this.source;
//    this.duration;    ソースは別にオブジェクト化する
//    this.startOffset;
    this.name="";
    this.bodyText="";
    this.attributes=[];
    this.comments=[];
    
    this.parseContent();//作成時に一回パースする
}
//
/*
    初期化時の内容テキスト（シナリオ型式）をパースしてオブジェクト化するメソッド
    本来は自動実行だが、今回は必要に従ってコールする
    
*/
nas.AnimationSound.prototype.parseContent=function(myContent){
    if(typeof myContent == 'undefined') myContent = this.contentText;
    if(myContent.length){
//        if(myContent.match(/^([^"'「]*)["'「]([^"'」]*)["'」]?\s$/) ) {;//"
//        if(myContent.match(/^([^「]*)「([^」]*)」?\s$/) ) {
if(myContent.match(/^([^「]*)「(.*)/)){

            this.name=RegExp.$1;
            this.bodyText=RegExp.$2.replace(/」\s*$/,"");
        }else{
            this.name="";
            this.bodyText=myContent;
        }
        var myAttributes=this.name.match(/\([^)]+\)/g)
        if(myAttributes){
            this.attributes=myAttributes;
            this.name=this.name.replace(/\([^)]+\)/g,"");
        }
        //                    本文内からコメントを抽出
        var myComments=this.bodyText.match(/(<[^<>]+>|\[[^\[\]]+\]|\([^\(\)]+\))|＜[^＜]+＞|〈[^〈]+〉|（[^（]+）|［[^［]+］/g);
        if(myComments){
            this.comments=[];//newArray　再初期化
            var myString=this.bodyText;//修正テキスト
            var prevIndex=0;var noteOffset=0;
            for (var cix=0;cix<myComments.length;cix++){
                noteOffset=myString.indexOf(myComments[cix]);//修正テキスト内コメント挿入位置
                this.comments.push([prevIndex+noteOffset,myComments[cix]]);
                prevIndex += noteOffset;
                myString=myString.slice(noteOffset+myComments[cix].length);
            }
            this.bodyText=this.bodyText.replace(/(<[^<>]+>|\[[^\[\]]+\]|\([^\(\)]+\))|＜[^＜]+＞|〈[^〈]+〉|（[^（]+）|［[^［]+］/g,"");
        }
        this.contnentText = this.toString();
        return this
    }else{
    //内容テキストが空
        return false;
    }
}
/*
toStringはプロパティを組み上げてMap記述用のテキストを返す
ダイアログの場合はシナリオ型式のテキスト

引数に正の数値でセルカウントが与えられた場合は、XPS上への展開配列ストリームで戻す。
展開配列は　getStream() メソッドで得る
＊各Valueの標準形式

toString メソッドの共通オプションとして
引数
    なし/basic    ｘMAP保存標準形式
    extended      ｘMap保存拡張形式
dialogオブジェクトに関しては、標準形式と拡張形式は同じものとなるので注意

*/
nas.AnimationSound.prototype.toString=function(counts){
  if((isFinite(counts))&&(counts > 0)){
//受け渡しをJSON経由にするか否かはペンディング　JSONStringの場合はString.split厳禁 
//    return JSON.stringify(this.getStream(counts));
    return (this.getStream(counts)).join();
  }else{
    var myResult=this.name;
    myResult+=this.attributes.join("");
    myResult+="「";
    var startPt=0;
    if(this.comments.length){var endPt=this.comments[0][0]}else{var endPt=0};
      for(var cix=0;cix<this.comments.length;cix++){
        myResult+=this.bodyText.slice(startPt,endPt)+this.comments[cix][1];
        startPt=endPt;
        if(cix<this.comments.length-1){endPt=this.comments[cix+1][0]};
      }
    if(startPt<this.bodyText.length){myResult+=this.bodyText.slice(startPt)};
    myResult+="」";
    return myResult;
  }
}
/*    test
A=new  nas.AnimationSound("たぬきさん(off)「ぽん！(SE:ポン)ぽこ！<BGM:開始>りん！[光る！]とうりゃぁー！！」");
A.parseContent();
console.log(A)

*/
/** 値を配列でもどす
引数: cellCount
戻値: セルのデータ並び配列
cellCountが与えられることが前提で配列を組む
ダイアログ展開時に限り、与えられた引数に対して　前方側にname,attributes+開始セパレータ　後方側に終了セパレータ分のフレームが追加される
引数が０でもラベルとセパレータ分のデータが戻る
指定の継続フレーム数より要素数が増えるので注意
*/
nas.AnimationSound.prototype.getStream=function(cellCounts){
    if(isNaN(cellCounts)) cellCounts = (this.contents.length+this.comments.length+this.attributes.length+3);
    if(cellCounts<0)cellCounts=Math.abs(cellCounts);
  if(cellCounts){
    var myResult=[];
    if(String(this.name).length) myResult.push(this.name);//ラベルあれば
    for(var aid=0;aid<this.attributes.length;aid++){myResult.push(this.attributes[aid])};//アトリビュート
    myResult.push('----');//開始セパレータ
    var entryCount = this.bodyText.length+this.comments.length;//テキスト文字数とコメント数を加算
    var dataCount = 0;//データカウントを０で初期化
    var textIndex = 0;//テクストインデックス
    var commentIndex = 0;//コメントインデックス
    var dataStep = cellCounts/entryCount ;//データステップ
    for(var cnt = 0; cnt < cellCounts; cnt ++){
        var myIndex = (entryCount >= cellCounts) ? cnt:Math.floor(cnt/dataStep);//配置Index
        //挿入点判定
        if(dataCount==myIndex){
            if((this.comments[commentIndex])&&(this.comments[commentIndex][0]==textIndex)){
                myResult.push(this.comments[commentIndex][1]);
                commentIndex++;
            }else{
                myResult.push(this.bodyText.charAt(textIndex));
                textIndex++;
            }
            dataCount++;
        }else{
            myResult.push('');
        }
    } 
    myResult.push('----');
    return myResult;
  }
}
//TEST 
/*
        タイムラインをダイアログパースする
    タイムライントラックのメソッド
    引数なし
    音響開始マーカーのために、本来XPSのプロパティを確認しないといけないが、
    今回は省略
    開始マーカーは省略不可でフレーム０からしか位置できない（＝音響の開始は第１フレームから）
    後から仕様に合わせて再調整
    判定内容は
    /^[-_]{3,4}$/    開始・終了マーカー
    /^\([^\)]+\)$|^<[^>]+>$|^\[[^\]]+\]$/    インラインコメント
    その他は
    ブランク中ならばラベル
    音響Object区間ならばコンテントテキストに積む　空白は無視する
    ⇒セリフ中の空白は消失するので、空白で調整をとっている台詞は不可
    オリジナルとの照合が必要な場合は本文中の空白を削除した状態で評価すること
    
    トラックの内容をパースしてセクションコレクションを構築する機能はトラック自身に持たせる
    その際、トラックの種別毎に別のパーサを呼び出すことが必要なのでその調整を行う
    
        タイムライントラックのメソッドにする
        ストリームはトラックの内容を使う
        新規にセクションコレクションを作り、正常な処理終了後に先にあるセクションコレクションを上書きする
        ＊作成中に、同じ内容のセクションはキャッシュとして使用する？
        戻り値はビルドに成功したセクション数(最低で１セクション)
        値として　無音区間の音響オブジェクト（値）を作るか又は現状のままfalse(null)等で処理するかは一考
*/
_parseSoundTrack =function(){
    var myCollection = new XpsTimelineSectionCollection(this);//自分自身を親としてセクションコレクションを新作
    //この実装では開始マーカーが０フレームにしか位置できないので必ずブランクセクションが発生する
    //継続時間０で先に作成 同時にカラのサウンドObjectを生成
    var currentSection=myCollection.addSection(null);//区間値false
    var currentSound=new nas.AnimationSound("");//第一有値区間の値　コンテンツはカラで初期化も保留
    for (var fix=0;fix<this.length;fix++){
        currentSection.duration ++;//currentセクションの継続長を加算
        //未記入データ　最も多いので最初に判定しておく
        if(this[fix]=="") continue;
        //括弧でエスケープされたコメント又は属性
        if(this[fix].match(/(^\([^\)]+\)$|^<[^>]+>$|^\[[^\]]+\]$)/)){
            if(currentSection.value){
                currentSound.comments.push([currentSound.bodyText.length,RegExp.$1]);
            }else{
                currentSound.attributes.push(RegExp.$1);
            }
            continue;
        }
        //セクションセパレータ　少ない
        if(this[fix].match(/^[-_]{3,4}$/)){
            if(currentSection.value){
                currentSection.duration --;//加算した継続長をキャンセル
                currentSection.value.contentText=currentSound.toString();//先の有値セクションをフラッシュして
                currentSection=myCollection.addSection(null);//新規のカラセクションを作る
                currentSection.duration ++;//キャンセル分を後方区間に加算
                currentSound=new nas.AnimationSound("");//サウンドを新規作成
            }else{
//引数をサウンドオブジェクトでなくxMapElementに変更予定
//                nas.new_MapElement(name,Object xMapGroup,Object Job);
                currentSection=myCollection.addSection(currentSound);//新規有値セクション作成
//                currentSection.value.
            }
                        continue;
        }
//判定を全て抜けたデータは本文又はラベル　ラベルは上書きで更新
//ラベル無しの音声オブジェクトは無しのまま保存　必要に従って先行オブジェクトのラベルを引継ぐ
        if(currentSection.value){
            if(this[fix]=="|") this[fix]="ー";
            currentSound.bodyText+=this[fix];
        }else{
            currentSound.name=this[fix];
        }
    }
    this.sections=myCollection;
    return this.sections;
}

/** //test
XpsTimelineTrack.prototype.parseSoundTrack=_parseSoundTrack;
XPS.xpsTracks[0].parseSoundTrack();
XPS.xpsTracks[0].sections[1].toString();

XpsTimelineTrack.prototype.parseSoundTrack=_parseSoundTrack;
//XpsTimelineTrack.prototype.parseDialogTrack=_parseDialogTrack;

//XpsTimelineTrack.prototype.parseKeyAnimationTrack=_parsekeyAnimationTrack;
//XpsTimelineTrack.prototype.parseAnimationTrack=_parseAnimationTrack;
XpsTimelineTrack.prototype.parseReplacementTrack=_parseReplacementTrack;

XpsTimelineTrack.prototype.parseCameraWorkTrack=_parseCameraworkTrack;

XpsTimelineTrack.prototype.parseCompositeTrack=_parseCompositeTrack;//コンポジット

//XpsTimelineTrack.prototype.parseTrack=_parseTrack;
//XpsTimelineTrack.prototype.parseTrack=_parseTrack;
*/
/**

    タイムラインをパースしてセクション及びその値を求めるメソッド
    タイムライン種別ごとにパースするオブジェクトが異なるので
    各オブジェクトに特化したパーサが必要
    別々のパーサを作ってセクションパーサから呼び出して使用する
    Sound
        parseSoundTrack
        *parseDialogTrack
    Replacement
        parseKyeDrawind(補間区間あり)
        parseAnimationCell(確定タイムライン)
    Geometry
        parseCameraworkTrack
    Composite
        parseEffectTrack
    各々のパーサは、データ配列を入力としてセクションコレクションを返す
    各コレクションの要素はタイムラインセクションオブジェクト
    値はタイムライン種別ごとに異なるがセクション自体は共通オブジェクトとなる

XpsTimelineTrack.prototype.parseTimelineTrack = function(){
    switch(this.option){
        case "dialog":;
            return this.parseDialogTrack();
        break;
        case "sound":;
            return this.parseSoundTrack();
        break;
        case "cell":;
        case "timing":;
        case "replacement":;
            return this.parseReplacementTrack();
        break;
        case "camerawork":;
        case "camera":;
            return this.parseCameraworkTrack();
        break;
        case "effect":;
        case "sfx":;
        case "composit":;
            return this.parseCompositeTrack();
        break;
    }
}
*/
/** 単純な記録が必要な場合のオブジェクト
 *　基礎的なデータを保持
 *  コンテの記述等はこの値で保持される
 *  また共通に要求されるメソッドの雛形
 *
 *　
 *
 *
 *
 *
 *
 *
 */
nas.AnimationDescription=function(myContent){
    this.contentText=(myContent)?String(myContent):"";//xMapのソースを保存する　自動で再構築が行なわれるタイミングがある
    this.source;
    this.type;  //typeString　storyBoard/
    this.attributes=[];
    this.comments=[];
}
/**
    文字列化して返す
*/
nas.AnimationDescription.prototype.toString=function(counts){
    return this.contentText;
}
/**
    コンテンツを与えてパースする
    引数がない場合は自身のコンテンツデータを再パースする
*/
nas.AnimationDescription.prototype.parseContent=function(myContent){
    if(typeof myContent == 'undefined'){
        myContent = this.contentText ;
    }else{
        this.contentText = myContent;
    }
    this.contentText = (myContent)?String(myContent):"";
    return this;
}

