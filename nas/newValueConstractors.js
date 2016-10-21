/*
    新規のオブジェクトは、基本的に　new コンストラクタ() ではなく
    Object.create(親オブジェクト)又は、各クラスの　クラス.newオブジェクト()　メソッドで作成すること
    各々のValueオブジェクトはnas.xMapElementのcnontentプロパティとなる
    置きかえタイムラインの（区間）値としては参照を持つ
    タイムシート上は回数未定で同じ値が再利用される


 */
/**
 *  置きかえタイムラインの値
 *  セル
 contentTextはｘMapの記述から前置のグループ情報・エレメント名及び空白文字を取り除いたもの
 データ型式は 第一、第二型式を自動判別
 レコードデリミタは"\n"

 第二型式（プロパティ名＝値）型式の場合はそのまま使用

 第二型式に当てはまらない場合は、第一型式とし最大２フィールドのタブ区切りテキストとみなす
 （最初のタブで二つに分ける）
 第一フィールドはcsvパーサを通してプロパティに割り付けを行う
 第二フィールドは、エレメントに対するコメントとなる
 
以上、各エレメント共通

以下種別ごとの第一型式情報並び(エレメントの配置)フォーマット
情報はすべて省略可能
    置きかえタイムラインエレメント
["file","size.x","size.y","offset.x","offset.y","offset.r"]（標準のcsvパーサでも良いが専用のパーサを作ったほうが早そう）
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
nas.AnimationReplacement=function(myContent){
    this.contentText=myContent;//xMapのソースを保存する　自動で再構築が行なわれるタイミングがある
    //myContent undefinedで初期化を行った場合の値は blank-cellで
    this.source         ;//string 画像データのurl　nas.FileObjectの使用は避ける　オブジェクトの整備が不十分
    this.source.duration       ;//ソースが時間情報を持ったデータだった場合の継続時間＊＊
    this.source.startOffset    ;//ソースが時間情報を持ったデータだった場合のオフセット＊＊
//ファイル情報を含むソースオブジェクトにした方が良さそう＊＊　>転用が可能
    this.source.formGeometry   ;//ソース内のオフセット情報　nas.AnimationFieldオブジェクト
    this.resolution     ;//要素の解像度   nas.UnitResolution()
    this.size           ;//要素のサイズ   nas.Size()
    this.offset         ;//要素の原点オフセット   nas.
    this.pegOffset;//要素のペグオフセット＊　これらはオブジェクトで統合？
//    this.timingNotes;//値に配置されるタイミングメモ　コレクション不要　これはタイムシートのプロパティなので不用
    this.comment;//コメント文字列　エレメントの注釈プロパティ-xMap編集UIのみで確認できる
    this.overlay;//カブセの対象となるエレメントへの参照
}
nas.AnimationReplacement.prototype.toString=function(exportForm){
    
//引数なし　または引数が１つでfalseと判断される場合は標準保存形式出力
    if ((arguments.length==0)||((arguments.length==1)&&(! arguments[0]))){
        return ['"'+this.source+'"',this.size.toString()].join();
    }
        //引数が一つ以上ある場合の処理
    else if(arguments[0] instanceof Array){
        var myResult="";
    }
    return myResult;
}

//nas.AnimationReplacement.prototype.valueOf=function(){
//    return nas.parseNumber(nas.normalizeStr(this.name).replace(/^[^0-9]*/,""))
//valueOfの設定自体にあまり意味が無いのでやめたほうがヨサゲ　
//}

nas.AnimationReplacement.prototype.interpolate= function(endValue,indexCount,indexOffset,frameCount,frameOffset,props){
    return this;//置きかえタイムラインの中間値は前方値で代表される
    /* オプション状態で中間タイミングで後方値に切り替える（時間で） return endValue;
    　 又はブランク状態のオブジェクトを返す return new nas.newAnimationReplacement("blank");
    */
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
    var blankRegex  = new RegExp("^(" + this.id + ")?\[?[\-_\]?[(\<]?\s?[ｘＸxX×〆0０]{1}\s?[\)\>]?\]?$");//システム変数として分離予定
    var interpRegex = new RegExp("^[\-\+=○●*・a-zア-ン]$|^\[[^\]]+\]$");//同上
    //自分自身(トラック)を親として新規セクションコレクションを作成
    var myCollectionBlank = new XpsTimelineSectionCollection(this);
    var myCollection      = new XpsTimelineSectionCollection(this);
    //継続時間０で値未定初期セクションを作成
    //値を持たないセクションをブランク値のオブジェクトとするか？
    var currentSection=myCollection.addSection(null);
    var currentSectionBlank=myCollectionBlank.addSection(null);
    var currentSubSection=null;
    var currentValue=this.parent.getDefaultValue();
    var isInterp = false;
    var isBlank  = ((currentValue != "blank")&&(currentValue))? false:true ;//第一フレームのブランク状態
/**
    タイムライントラックのデフォルト値は、以下の手続きで取得
    タイムラインラベルが指定するグループがあらかじめ存在する場合は、そのグループオブジェクトが保持する値
    存在しない場合は、新規にグループを作成する。その際にトラックの種別ごとのValueオブジェクトを初期値して登録するのでその値を使用
    XpsTimelineTrack.getDefeultValue()側で調整
    Replacementの場合、基本ブランクだが必ずしもブランクとは限らないので要注意
    トラック上で明示的なブランクが指定された場合は、値にfalse/null/"blank"を与える。
*/
    for (var fix=0;fix<this.length;fix++){
        var currentCell=Xps.sliceReplacementLabel(new String(this[fix]));//記述をラベルとエントリに分解
        if( currentCell[1]=="" ){ currentCell[1]=this.parent.id; }
        //グループラベル付き・なしを判定する機能が必要
        currentSection.duration ++; //
        currentSectionBlank.duration ++;     //セクション長加算
        
        //未記入データ　これが一番多いので最初に処理しておく(処理高速化のため)
        if(currentCell[0].match(/^([\|｜;]|\s+)$/)||currentCell.length==0) continue;
        //ブランク判定
        /*
            値処理に先立ってブランク関連の処理はすべて終了する
            ブランク切り替え判定 カレントを切り替えて新規セクションを積む
            blankDetect  && (! isBlank)  changeBlankMode true;
            interpDetect && (! isInterp) changeMode isInterp=true;
                valueDetect  && (isBlank)    changeBlankMode false;
                valueDetect  && (isInterp)   changeMode isInterp=false;
        */
        var blankDetect   = (currentCell[0].match(blankRegex))?  true:false;
        var interpDetect  = (currentCell[0].match(interpRegex))? true:false;//括弧つきの補間サインも同時検出へ
        var detectedValue = this.map.getElementByName(currentCell);
        var valueDetect   = (detectedValue)? true:false;
        //ブランク処理判定
        if(blankDetect){
                if(! isBlank){
                    isBlank=true;
                    currentSectionBlank=myCollectionBlank.addSection("blank");
                    continue;
                }
        }
        //中間値補間サインを検出したら中間値処理モード
        //既定値以外の補間サイン検出が必要
        if(interpDetect){
              if( isBalnk ){ isBlank = false;}
              if(! isInterp ){
                //中間値補間区間開始　カレントセクションを切り替え サブセクションを登録
                isInterp = true;
                currentSection=myCollection.addSection("interopration");
                currentSection.subSections.addSection(new ValueInterporator());
                //新規中間値補間セクションを立てる 以降は、モードを抜けるまでカレント固定
              }else{
                currentSection.subSections.addSection(new ValueInterporator());
                //中間値補間モード内ではサブセクションを登録
              }
              continue;
        }
        //区間の値を検出
        var currentElement=MAP.getElementByName([this.parent.id,currentCell].join("-"));
        if(currentElement) {
            
        }
        //グループラベルの無条件連結は問題アリ
        //セクション開始セパレータ
        if(this[fix].match(/^[]$/)){
            if(currentSection.value){
                currentSection.duration --;//加算した継続長をキャンセル
                currentSection.value.contentText=currentSound.toString();//先の有値セクションをフラッシュして
                currentSection=myCollection.addSection(false);//新規のカラセクションを作る
                currentSection.duration ++;//キャンセル分を後方区間に加算
                currentEffect=new nas.AnimationComposit("");//サウンドを新規作成
            }else{
                currentSection=myCollection.addSection(currentEffect);//新規有値セクション作成
            }
            continue;
        }
//判定を全て抜けたデータは本文又はラベル　ラベルは上書きで更新
        if(currentSection.value){
            if(this[fix]=="|") this[fix]="ー";
            currentSound.bodyText+=this[fix];
        }else{
            currentSound.name=this[fix];
        }
    }
    this.sections=myCollection;
    return myCollection.length;
}

/*test
MAP.new


*/


/**
 *  ジオメトリタイムラインの（区間）値
 *  カメラワーク
 */
nas.AnimationGeometry =function(){
//    this.source;//参照画像データのurl　nas.File ソースはオブジェクト化が必要
//    this.duration;//ソースが時間情報を持ったデータだった場合の継続時間
//    this.startOffset;//ソースが時間情報を持ったデータだった場合のオフセット
//    this.formGeometry;//nas.AnimationFieldオブジェクト
    this.size=new nas.Size();//要素のサイズ
    this.position=new nas.Position();//要素を配置する位置
    this.offset=new nas.GeometoryOffset();//要素の原点オフセット
    this.x = this.size.x;
    this.y = this.size.y;
    this.z = this.size.z;
    this.t = nas.AnimationTimeing();
    this.c = nas.AnimationCurve();
    this.comment="";//コメント文字列
}
nas.AnimationGeometry.prototype.constractor=nas.AnimationField.constractor
nas.AnimationGeometry.prototype.interpolate= function(endValue,indexCount,indexOffset,frameCount,frameOffset,props){
    return this;//置きかえタイムラインの中間値は前方値で代表される
    /* オプション状態で中間タイミングで後方値に切り替える（時間で） return endValue;
    　 又はブランク状態のオブジェクトを返す return new nas.newAnimationReplacement("blank");
    */
}
/**
 *  コンポジットタイムラインの（区間）値
 *  エフェクト
 */
nas.AnimationComposite =function(){
//    this.source;//参照画像データのurl　nas.File
//    this.duration;//ソースが時間情報を持ったデータだった場合の継続時間
//    this.startOffset;//ソースが時間情報を持ったデータだった場合のオフセット
//    this.formGeometry;//ソース内のオフセット情報　nas.AnimationFieldオブジェクト
    this.blendingMode="normal";
    this.strength;// ? 
    this.t = nas.AnimationTimeing();
    this.c = nas.AnimationCurve();
    this.comments;//コメントコレクション配列 これは区間のプロパティか？
}
nas.AnimationComposite.prototype.interpolate= function(endValue,indexCount,indexOffset,frameCount,frameOffset,props){
    myResult=Object.create(this);
    myResult.opacity=(this.opacity+endValue.opacity)*(indexCount/indexCount);// 仮値リニア補間
    return myResult;//コンポジットタイムラインの中間値は濃度値のみ

}
/*
    コンポジットトラックをパースしてセクションコレクションを返す
*/
_parseCompositeTrack=function(){
    var myCollection=new XpsTimelineSectionCollection(this);//自分自身を親としてセクションコレクションを新作
    //この実装では開始マーカーが０フレームにしか位置できないので必ずブランクセクションが発生する
    //継続時間０で先に作成 同時にカラのサウンドObjectを生成
    var currentSection=myCollection.addSection(false);
    var currentEffect=new nas.AnimationComposit("");//コンテンツはカラで初期化も保留
    for (var fix=0;fix<this.length;fix++){
        currentSection.duration ++;//currentセクションの継続長を加算
        //未記入データ　これが一番多いので最初に処理しておく
        if(this[fix]==""){
            continue;
        }
        //区間の値
        //セクション開始セパレータ
        if(this[fix].match(/開始セパレータ/)){
            
            if(currentSection.value){
                currentSection.duration --;//加算した継続長をキャンセル
                currentSection.value.contentText=currentSound.toString();//先の有値セクションをフラッシュして
                currentSection=myCollection.addSection(false);//新規のカラセクションを作る
                currentSection.duration ++;//キャンセル分を後方区間に加算
                currentEffect=new nas.AnimationComposit("");//サウンドを新規作成
            }else{
                currentSection=myCollection.addSection(currentEffect);//新規有値セクション作成
            }
            continue;
        }
//判定を全て抜けたデータは本文又はラベル　ラベルは上書きで更新
        if(currentSection.value){
            if(this[fix]=="|") this[fix]="ー";
            currentSound.bodyText+=this[fix];
        }else{
            currentSound.name=this[fix];
        }
    }
    this.sections=myCollection;
    return myCollection.length;
}

/*
簡易オブジェクトで実装
エレメントのラップもしない

nas.AnimationSound Object
　同名のオブジェクトとの互換はあまり考えない
　名前が同じだけと思うが吉
　タイムシートサウンドトラックの値となる
　外部ファイルリンクはこの際割愛

bodyStream();    タイムシート内のストリームをテキストで取り出す（メソッド）
contentText;    String    内容テキスト原文　"たぬきさん(off)「ぽん！(SE:ポン)ぽこ！<BGM:開始>りん！[光る！]」"
name;    String    ラベルとなる名称    "たぬきさん"
bodyText;    String    台詞本体のテキスト　"ぽん！ぽこ！りん！"
attributes;    Array    オブジェクト属性配列 ["(off)"] 
comments;    Array    ノートコメントコレクション配列 [[3,"(SE:ポン)"],[6,"<BGM:開始>"],[9,"[光る！]"]]
*/
nas.AnimationSound=function(myContent){
//    this.source;
//    this.duration;    ソースは別にオブジェクト化する
//    this.startOffset;
    this.contentText=myContent;
    this.name="";
    this.bodyText="";
    this.attributes=[];
    this.comments=[];
}
//
/*
    初期化時の内容テキスト（シナリオ型式）をパースしてオブジェクト化するメソッド
    本来は自動実行だが、今回は必要に従ってコールする
*/
nas.AnimationSound.prototype.parseContent=function(){
    if(this.contentText.length){
        if(this.contentText.match(/^([^"'「]*)["'「]([^"'」]*)["'」]?$/) ) { ;//"
            this.name=RegExp.$1;
            this.bodyText=RegExp.$2;
        }else{
            this.name="";
            this.bodyText=this.contentText;
        }
        var myAttributes=this.name.match(/\([^)]+\)/g)
        if(myAttributes){
            this.attributes=myAttributes;
            this.name=this.name.replace(/\([^)]+\)/g,"");
        }
        //                    本文内からコメントを抽出
        var myComments=this.bodyText.match(/(<[^<>]+>|\[[^\[\]]+\]|\([^\(\)]+\))/g);
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
            this.bodyText=this.bodyText.replace(/(<[^<>]+>|\[[^\[\]]+\]|\([^\(\)]+\))/g,"");
        }
        return this.toString();
    }else{return false;}    
}
/*
プロパティを組み上げてシナリオ型式のテキストを返す
*/
nas.AnimationSound.prototype.toString=function(){
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
//    test
//A=new  nas.AnimationSound("たぬきさん(off)「ぽん！(SE:ポン)ぽこ！<BGM:開始>りん！[光る！]とうりゃぁー！！」");
//A.parseContent();
//A

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
    var myCollection=new XpsTimelineSectionCollection(this);//自分自身を親としてセクションコレクションを新作
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
    return this.sections.length;
}

/** //test
XpsTimelineTrack.prototype.parseSoundTrack=_parseSoundTrack;
XPS.xpsTracks[0].parseSoundTrack();
XPS.xpsTracks[0].sections[1].toString();
*/
/**

    タイムラインをパースしてセクション及びその値を求めるxUIのメソッド
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
*/
