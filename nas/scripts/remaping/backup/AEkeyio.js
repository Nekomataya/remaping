//	AWKeyデータ走査第二パス以降の処理 このファイルは作成時のメモです
//	このファイルのコードは実行されません。
//	実際のコードは io.js を参照
/*
 第二パスで以下の情報を取得
 第二パスでは、仮想のAEオブジェクトを作成して、キーデータをすべて取り込む。

 AEKey データから判定する情報リスト
 ○フレームレート
 キーから読み取れるのはコンポのフレームレートなので、
 フーテージのフレームレートが違う場合は、要ユーザ指定(後で)。
 キーデータが複数セットある場合は、1セットごとに照合
 レートが食い違っていた場合は、処理中断・または最初と違うセットをスキップ

 ○いくつキーセットがあるか
 レイヤ数の判定
 複数セットがある場合は、有効なセット数分のレイヤを作成

 ○各レイヤのキーの最大フレーム数
 最大数を取得して XPS(コンポ)の長さにする。
 フレームレートにしたがってキーデータが納まる長さを
 最小ユニット単位で求める。
 最小ユニットは慣例に従って1/5秒から1/4,1/3,1/2.または1秒。

 ユニットの優先順位は、1/5 1/4 1/3 1/2 1
 フレームレートを割って割り切れる限りは小さい値をとる。
 このまま、サブセパレータの値に使えるか?と思ったが使わない
 サブセパレータはユーザ指定

 ○各レイヤ(ソース)の寸法(X,Y,A)
 素直に記録

 ○各キーの種別(判定基準メモ)
 タイミング / カメラワーク

 "Time\ Remap"タイムラインが存在するレイヤ

 または

 "スライダ制御"または他の特定の名称の"スライダ"タイムラインで
 かつ「キーの値が正の整数とゼロのみのもの」が単独で存在するレイヤ

 の存在を確認したら。タイミングフラグを立てる。

 タイミングフラグが立った場合はサブプロパティが必要。以下の3点

 ブランクメソッド(file/wipe/Opacity/expression)
 -(ユーザ指定 / ワイプ・不透明度・スライダの確認と判定)
 ブランクポジション(build/first/end/none)
 -(メソッド別判定＋ユーザ指定)
 フーテージのフレームレート

 取得後、第三パスの前にユーザ指定を促す。

 以上の情報から、読み出し時に必要なプロパティを形成
 タイミング用のターゲットラインの特定(リマップ or スライダ)
 タイミング読み取りオフセット(0 or 1)
 ブランクの対応フラグ(0/max/none)
 ブランクプロパティ・サイズ は レイヤごとに保存して、シートに反映

 他のシートプロパティは、デフォルト値で初期化してユーザに入力を促す。

 カメラワークフラグは現在保留(常にfalse)
 トランスフォーム各プロパティ・トランスフォームエフェクト・オフセットエフェクトを基本的に解析する。これは、XPS側のジオメトリ設計が終わってから実装する。
 それまでは、判定のみ。

 */


function ssUnit(UpS) {
//	引数 UpS は、Units Per Second 秒あたりのフレーム数
//	戻り値は、自動設定されるサブユニットの長さ
//	サブセパレータの値とは別。
    if (isNaN(UpS)) {
        switch (UpS) {
            case "NTSC"    :
                return 6;
                break;
            case "PAL"    :
                return 5;
                break;
            case "drop"    :
                return 6;
                break;
            default    :
                return UpS;
        }
    } else {
        UpS = Math.round(UpS);
//		ドロップフレーム系処置・どのみち整数でないとイヤだけど、暫定
        for (ssu = 4; ssu > 1; ssu--) {
            if (UpS % ssu == 0)return UpS / ssu;
        }
        return UpS;
    }
//	4から1へ順に約数をあたる。マッチした時点で返す。
//	すべて失敗した場合は、元の数値を返す。
}


function readAEKey_(SrcData) {

//グローバルプロパティ (何かのオブジェクトに登録した方が良さそう)
    var thisTime = 0;

    /*	合成キャリアオブジェクト設定
     キャリアオブジェクト単体は使用しないが、
     座標系オブジェクトの基礎オブジェクトになる。
     座標系の基本メソッドはここから取得する。
     合成バッファのたぐいは、コレ!
     */
    function Carrier() {
        this.width = 0;
        this.height = 0;
        this.pixelAspect = 1;
        this.frameRate = 1;
        this.duration = 0;
    }

    new Carrier();

//	プロトタイプメソッド
    Carrier.prototype.setFrameRate =
        function (rate) {
            if (!rate) {
                rate = this.frameRate
            } else {
                this.frameRate = rate
            }
            ;
            this.frameDuration = 1 / rate;
            return rate;
        }
    Carrier.prototype.setFrameDuration =
        function (duration) {
            if (!duration) {
                duration = this.frameDuration
            } else {
                this.frameDuration = duration
            }
            ;
            this.frameRate = 1 / duration;
            return duration;
        }
    Carrier.prototype.setGeometry =
        function (w, h, a) {
            if (w) {
                this.width = w
            }
            ;
            if (h) {
                this.height = h
            }
            ;
            if (a) {
                this.pixelAspect = a
            }
            ;
            return [w, h, a];
        }
    /*	キーフレーム設定
     キーフレームの次元を与えて初期化する。
     一つのキーフレームは、以下のプロパティを持つ
     時間,		//秒数で
     [値],		//タイムラインのプロパティにしたがって多次元
     [[値の制御変数1],[2]],//値と同次元で、二つ一組
     [[タイミングの制御変数1],[2]],//二次元、二つ一組
     キーアトリビュート,//AE用キー補完フラグ
     */
    function KeyFrame(time, value, valueCp, timingCp, keyAtrib) {
        if (!time)    time = thisTime;
        this.time = time;
        if (!value)    value = null;
        this.value = value;
        if (!valueCp)    valueCp = [1 / 3, 2 / 3];
        this.valueCp = valueCp;
        if (!timingCp)    timingCp = [[1 / 3, 1 / 3], [2 / 3, 2 / 3]];
        this.timingCp = timingCp;
        if (!keyAtrib)    keyAtrib = "linear";
        this.keyAtrib = keyAtrib;
    }

    new KeyFrame();
//		inherit(KeyFrame,Array);//これ不要

//	タイムライン設定
    function TimeLine() {
    }

//{	this.name = atrib	;}
    new TimeLine();
    inherit(TimeLine, Array);

    TimeLine.prototype.keyPush = function (KeyFrame) {
//タイムラインのメソッド
//キーフレームをプッシュする。すでに登録されているキーフレームのうち、同じtime値を持つものがあれば上書き、それ以外は新規登録する。
        for (id = 0; id < this.length; id++) {
            if (KeyFrame[0] == this[id][0]) {
                this[id] = KeyFrame;
                return id;
            }
        }
        this.push(KeyFrame)
        return (this.length - 1);
    }
    /*	レイヤ設定
     レイヤのメンバはタイムライン
     デフォルトで以下のタイムラインがある。
     タイムリマップ**
     アンカーポイント
     位置
     回転
     不透明度
     カラセル**
     ワイプ
     エクスプレッション
     **印は、りまぴんのみ
     */
    function Layer() {

        this.width = 640;
        this.height = 480;
        this.pixelAspect = 1;
        this.frameRate = 24;
        this.duration = 0;
        this.activeFrame = 0;
//
        this.inPoint = 0;
        this.outPoint = this.duration;
//タイムラインプロパティなので後から初期化?
        this.init = function () {

            this.timeRemap = new TimeLine("timeRemap");
            this.timeRemap[0] = new KeyFrame(0, "blank");
            this.anchorPoint = new TimeLine("anchorPoint");
            this.anchorPoint[0] = new KeyFrame(0, [thisComp.width / 2, thisComp.heigth / 2, 0]);
            this.position = new TimeLine("position");
            this.position[0] = new TimeLine(0, [this.width / 2, this.height / 2, 0]);
            this.rotation = new TimeLine("rotation");
            this.rotation[0] = new TimeLine(0, [0, 0, 0]);
            this.opacity = new TimeLine("opacity");
            this.opacity[0] = new TimeLine(0, 100);
        }

    }

    new Layer();
    inherit(Layer, Carrier);//Carrierのメソッドを取得
    inherit(Layer, Array);//Arrayのメソッドを取得

    Layer.prototype.setClip = function (ip, op) {
        if (ip && ip >= 0 && ip <= duration) this.inPoint = ip;
        if (op && op >= 0 && op <= duration) this.outPoint = op;
        return [ip, op];
    }
    /*
     Layer.prototype.=function(){
     }
     Layer.prototype.=function(){
     }
     Layer.prototype.=function(){
     }
     */
//	コンポジション設定
    function Composition() {
        this.width = 640;
        this.height = 480;
        this.pixelAspect = 1;
        this.frameRate = 24;
        this.duration = 0;
    }

    new Composition();
    inherit(Composition, Carrier);//Carrierのメソッドを取得
    inherit(Composition, Array);//配列としてのメソッドを取得

//	仮にデータを取得するコンポを作成
    var thisComp = new Composition();
//		thisComp.setFrameRate(0);
    ly_id = 0;//レイヤID初期化
    tl_id = 0;//タイムラインID初期化
    kf_id = 0;//いらないか?
//		第二パス開始
//	データをスキャンしてコンポ(オブジェクト)に格納
    for (line = SrcData.startLine; line < SrcData.length; line++) {
        // キーデータに含まれるレイヤ情報の取得
        if (MSIE) {
            var choped = SrcData[line].charCodeAt(SrcData[line].length - 1);
            if (choped <= 32)
                SrcData[line] = SrcData[line].slice(0, -1);
        }
        //データ前処理・なぜだかナゾ、なぜに一文字多いのか?
//一番エントリの多いデータ行を最初に処理
        if (SrcData[line].match(/^\t.*/)) {
            var SrcLine = SrcData[line].split(\t
        )
            ;

            if (thisComp.thisLayer.length == 0) {

//レイヤヘッダなのでレイヤのプロパティを検証してオブジェクトに登録
                switch (SrcLine[1]) {
                    case    "Units\ Per\ Second"    :
                        ;//コンポフレームレート
                        thisComp.frameRate = SrcLine[2];
                        break;
                    //この部分をこのまま放置するとコンポのフレームレートが、最後のレイヤで決定されるので注意。

                    case    "Source\ Width"    :
                        ;//レイヤソース幅
                        thisComp.thisLayer.width = SrcLine[2];
                        break;
                    case    "Source\ Height"    :
                        ;//レイヤソース高さ
                        thisComp.thisLayer.height = SrcLine[2];
                        break;
                    case    "Source\ Pixel\ Aspect\ Ratio"    :
                        ;//ソースの縦横比
                        thisComp.thisLayer.pixelAspect = SrcLine[2];
                        break;
                    case    "Comp\ Pixel\ Aspect\ Ratio"    :
                        ;//コンポの縦横比
                        thisComp.pixelAspect = SrcLine[2];
                        break;
                    default:
                        ;//時間関連以外
                        thisComp.thisLayer[SrcData[1]] = SrcLine[2];
                        break;
//	判定した値をプロパティで控える。とりあえずレイヤのプロパティ
                }
            } else {
//タイムラインデータなのでアクティブなタイムラインに登録
                time = SrcLine[1];
                value = SrcLine.slice(2, SrcLine.length);
                thisComp.thisLayer.thisTimeLine.push(new KeyFrame(time, value));
            }

            continue;//次の判定は、当然パスして次の行を処理
        }

//レイヤ開始判定
        if (SrcData[l].match(/^Adobe\ After\ Effects\x20([456]\.[015])\ Keyframe\ Data$/)) {
            //レイヤ作成
            thisComp[ly_id] = new Layer();
            thisComp.thisLayer = thisComp[ly_id];//ポインタ設定

            continue;
        }
//タイムライン開始判定または、レイヤ終了
        if (!SrcData[l].match(/^$/)) {
// 1レイヤ終了のため終了処理
//
            if (SrcData[line].match(/^End\ of\ Keyframe\ Data$/)) {
                ly_id++;
                tl_id = 0;
                //レイヤIDインクリメント・タイムラインID初期化
            } else {

//	最上位階層はデータブロックのセパレータなので読み取り対象を切り換え	//	タイムラインを判定して作成
                if (!SrcData[line].match(/^\s*$/)) {
                }

                SrcLine = SrcData[line].split("\t");
                switch (SrcLine[0]) {
                    case    "Time\ Remap":
                        tl_id = "timeRemap";
                        break;
                    case    "Anchor\ Point":
                        tl_id = "anchorPoint";
                        break;
                    case    "Position":
                        tl_id = "position";
                        break;
                    case    "Scale":
                        tl_id = "scale";
                        break;
                    case    "Rotation":
                        tl_id = "rotation";
                        break;
                    case    "Opacity":
                        tl_id = "opacity";
                        break;
                    default:
                        tlid = SrcLine[0];
                }
                if (thisComp.thisLayer[tl_id]) {
                    this.Comp.thisLayer[tl_id] = new TimeLine()
                }
//			なければ作る＝デフォルトのタイムラインならスキップ
                thisComp.thisLayer.thisTimeLine = thisComp.thisLayer[tl_id];
                continue;


            }
            continue;
        }
    }

}
//
XPS.readAEKey = readAEKey_;
//


/*
 AEKeyデータ変換関数
 読み込んでput可能なストリームで返す
 2005/10/28
 */
/*
 ssUnit(UpS)
 サブユニット長を自動設定して戻す
 引数 UpS は、Units Per Second・秒あたりのフレーム数 または キーワード
 戻り値は、フレームレートにしたがって自動設定されるサブユニットの長さ
 サブセパレータの値とは別。
 */
function ssUnit(UpS) {
    if (isNaN(UpS)) {
        switch (UpS) {
            case "NTSC"    :
                return 6;
                break;
            case "PAL"    :
                return 5;
                break;
            case "drop"    :
                return 6;
                break;
            default    :
                return UpS;
        }
    } else {
        UpS = Math.round(UpS);//	ドロップフレーム系の処置・どのみち整数でないとイヤだけど、暫定で
        for (ssu = 4; ssu > 1; ssu--) {
            if (UpS % ssu == 0)return UpS / ssu;
        }
        return UpS;
    }
//	4から1へ順に約数をあたる。マッチした時点で返す。
//	すべて失敗した場合は、元の数値を返す。
}
/*
 ckBlank(timeLine)
 制御レイヤ(現在カラセル制御のみ)の判定
 判定するtimelineオブジェクトを与える。
 すべての値が 0 || 100 	ならばカラセルレイヤであると判定

 現在はブーリアンで返しているが、要調整か?
 */
function ckBlank(timeLine) {
    for (xid = 0; xid < timeLine.length; xid++) {
        if (timeLine[xid].value[0] % 100 != 0) {
            return false
        }
    }
    return true;
}

/*
 AEKey2txstream_(datastream)

 */
function AEKey2txstream(datastream) {
//	ローカル変数で処理
    var thisComp = null;
    var thisLayer = null;
    var thisTimeLine = null;
//
//ラインで分割して配列に取り込み
    var SrcData = new Array();
    SrcData = datastream.split("\n");

//データストリームを判定する
    SrcData.startLine = 0;//データ開始行
    SrcData.dataClass = "AEKey";//データ種別(XPS/AEKey/TSX)

//ソースデータのプロパティ
    SrcData.layerHeader = 0;//レイヤヘッダ開始行
    SrcData.layerProps = 0;//レイヤプロパティエントリ数
    SrcData.layerCount = 0;//レイヤ数
    SrcData.layers = new Array();//レイヤ情報トレーラー
    SrcData.layerBodyEnd = 0;//レイヤ情報終了行
    SrcData.frameCount = 0;//読み取りフレーム数
//第一パス
//冒頭ラインが識別コードまたは空行でなかった場合は、さようなら御免ね
//IEのデータの検証もここでやっといたほうが良い?
    for (l = 0; l < SrcData.length; l++) {
        if (SrcData[l].match(/^\s*$/)) {
            continue;
        } else {

            if (MSIE) {
                var choped = SrcData[l].charCodeAt(SrcData[l].length - 1);
                if (choped <= 32)
                    SrcData[l] = SrcData[l].slice(0, -1);
            }
            //なぜだかナゾなぜに一文字多いのか?

            /*
             どうしましょったら、どーしましょ まだ思案中 シアンは赤の補色です。
             */
            if (SrcData[l].match(/^Adobe\ After\ Effects\x20([456]\.[05])\ Keyframe\ Data$/)) {
                SrcData.dataClass = "AEKey";//データ種別
                SrcData.startLine = l;//データ開始行
                break;
            } else {
                alert("どうもすみません。このデータは読めないみたいダ\n" + SrcData[l]);
                return false;
            }
        }
    }
//第一パスおしまい。なんにもデータが無かったらサヨナラ
    if (SrcData.startLine == 0 && SrcData.length == l) {
        alert("読み取るデータがないのです。");
        xUI.riseSW("data_");//子供オブジェクトに依存しとる ヨクナイ
        return false;
    }
//##変数名とプロパティ名の対照テーブル//
    var varNames = [
        "MAPPING_FILE",
        "TITLE",
        "SUB_TITLE",
        "OPUS",
        "SCENE",
        "CUT",
        "TIME",
        "TRIN",
        "TROUT",
        "FRAME_RATE",
        "CREATE_USER",
        "UPDATE_USER",
        "CREATE_TIME",
        "UPDATE_TIME"
    ];
    var propNames = [
        "mapfile",
        "title",
        "subtitle",
        "opus",
        "scene",
        "cut",
        "time",
        "trin",
        "trout",
        "framerate",
        "create_user",
        "update_user",
        "create_time",
        "update_time"
    ];
    var props = new Array(varNames.length);
    for (i = 0; i < varNames.length; i++) {
        props[varNames[i]] = propNames[i];
    }

//	データ走査第二パス(AEKey)

    if (SrcData.dataClass == "AEKey") {


//	仮にデータを取得するコンポを初期化
        thisComp = new Composition();
        thisComp.maxFrame = 0;//キーの最大時間を取得するプロパティを初期化
        ly_id = 0;//レイヤID初期化
        tl_id = 0;//タイムラインID初期化
        kf_id = 0;//キーフレームID初期化 いらないか?

//		第二パス開始
//	データをスキャンしてコンポ(オブジェクト)に格納
        for (line = SrcData.startLine; line < SrcData.length; line++) {
            // キーデータに含まれるレイヤ情報の取得
            if (MSIE) {
                var choped = SrcData[line].charCodeAt(SrcData[line].length - 1);
                if (choped <= 32) SrcData[line] = SrcData[line].slice(0, -1);
            }
            //データ前処理・なぜだかナゾ、なぜに一文字多いのか?

//空白行のスキップ
            if (SrcData[line] == '') continue;

//一番エントリの多いデータ行を最初に処理
            if (SrcData[line].match(/^\t.*/)) {
//if(dbg) dbgPut("\tDATALINEs\nLayer No."+ly_id+" TimeLineID :"+tl_id+ " "+line+":"+SrcData[line]);
                var SrcLine = SrcData[line].split("\t");

                if (SrcLine[1] == "Frame") continue;//フィールドタイトル行スキップ

                if (tl_id == 0) { //レイヤ内で一度もタイムラインを処理していない。
//if(dbg) dbgPut(SrcLine);

//レイヤヘッダなのでレイヤのプロパティを検証してオブジェクトに登録
                    switch (SrcLine[1]) {
                        case    "Units\ Per\ Second"    :
                            ;//コンポフレームレート
                            thisComp.frameRate = SrcLine[2];
                            break;
                        //この部分をこのまま放置するとコンポのフレームレートが、最後のレイヤで決定されるので注意。

                        case    "Source\ Width"    :
                            ;//レイヤソース幅
                            thisLayer.width = SrcLine[2];
                            break;
                        case    "Source\ Height"    :
                            ;//レイヤソース高さ
                            thisLayer.height = SrcLine[2];
                            break;
                        case    "Source\ Pixel\ Aspect\ Ratio"    :
                            ;//ソースの縦横比
                            thisLayer.pixelAspect = SrcLine[2];
                            break;
                        case    "Comp\ Pixel\ Aspect\ Ratio"    :
                            ;//コンポの縦横比
                            thisComp.pixelAspect = SrcLine[2];
                            break;
                        default:
                            ;//時間関連以外
                            thisLayer[SrcLine[1]] = SrcLine[2];
                            break;
//	判定した値をレイヤのプロパティに控える。
                    }
                } else {
//タイムラインデータなのでアクティブなタイムラインに登録
//if(dbg) dbgPut("timelinedata line No."+line+":"+SrcData[line]);
                    frame = SrcLine[1] * 1;
                    if (frame > thisComp.maxFrame) thisComp.maxFrame = frame;
                    //	キーフレームの最大時間を記録
                    value = SrcLine.slice(2, SrcLine.length);

//	タイムラインの最大値を控える 999999 は予約値なのでパス
//	実際問題ここで控えた方が良いのかこれは?
//	if (thisTimeLine.maxValue<value && value < 999999)
//	thisTimeLine.maxValue=value;

//result=thisTimeLine.push(new KeyFrame(frame,value));
//thisComp.layers[ly_id][tl_id][kf_id] = new KeyFrame(frame,value);
//kf_id ++;
//result=thisComp.layers[ly_id][tl_id].setKeyFrame(new KeyFrame(frame,value));

                    thisComp.layers[ly_id][tl_id].push(new KeyFrame(frame, value));
                    result = thisComp.layers[ly_id][tl_id].length;

//	if(dbg) dbgPut(">>set "+thisComp.layers[ly_id][tl_id].name+
//	" frame:"+frame+"  to value:"+value+"<<"+result+
//	"::and maxFrame is :" + thisComp.maxFrame);

//if(dbg) dbgPut(">>> "+ thisComp.layers[ly_id][tl_id][kf_id].frame +"<<<");
                }

                continue;//次の判定は、当然パスして次の行を処理
            }
            ;

//レイヤ開始判定
            if (SrcData[line].match(/^Adobe\ After\ Effects\x20([456]\.[015])\ Keyframe\ Data$/)) {
//if(dbg) dbgPut("\n\nNew Layer INIT "+l+":"+SrcData[line]);
                //レイヤ作成
                thisComp.layers[ly_id] = new Layer();
//		thisComp.layers[ly_id].init();
                thisLayer = thisComp.layers[ly_id];//ポインタ設定

                continue;
            }
//		タイムライン開始判定または、レイヤ終了
            if (SrcData[line].match(/^[\S]/)) {
// タイムライン終了処理があればここに
// レイヤ終了処理
//if(dbg)	dbgPut(line+" : "+SrcData[line]);
                if (SrcData[line].match(/^End\ of\ Keyframe\ Data$/)) {
//			thisComp.setFrameDuration()
                    ly_id++;
                    tl_id = 0;
                    kf_id = 0;
                    //レイヤIDインクリメント・タイムラインID初期化
                } else {

//	最上位階層はデータブロックのセパレータなので読み取り対象を切り換え	//	タイムラインを判定して作成


//	if(! SrcData[line].match(/^\s*$/)){}

//新規タイムライン設定


                    SrcLine = SrcData[line].split("\t");

                    switch (SrcLine[0]) {
                        case    "Time\ Remap":
                            tl_id = "timeRemap";
                            break;
                        case    "Anchor\ Point":
                            tl_id = "anchorPoint";
                            break;
                        case    "Position":
                            tl_id = "position";
                            break;
                        case    "Scale":
                            tl_id = "scale";
                            break;
                        case    "Rotation":
                            tl_id = "rotation";
                            break;
                        case    "Opacity":
                            tl_id = "opacity";
                            break;
                        case    "変換終了":
                            tl_id = "wipe";//AE 4.0-5.5 wipe/トランジション
                            break;
                        case "スライダ":
                            tl_id = "slider";//AE 4.0-5.5 スライダ制御
                            break;
                        case    "Effects":	//AE 6.5 (6.0? 要確認) エフェクトヘッダサブ判定が必要
                            switch (SrcLine[1].slice("\ ")[0]) {
                                case "変換終了":
                                    tl_id = "wipe";
                                    break;
                                case "スライダ制御":
                                    tl_id = "slider";
                                    break;
//	case "":	tl_id="";break;
//	case "":	tl_id="";break;
//	case "":	tl_id="";break;
                                    defaulet:    tlid = SrcLine[1];
                            }
                            break;
                        default:
                            tlid = SrcLine[0];
                    }

//	if(! thisLayer[tl_id]){thisLayer[tl_id]= new TimeLine(tl_id)}else{if(dbg) dbgPut(tl_id)}
//	if(! thisComp.layers[ly_id][tl_id]){thisComp.layers[ly_id][tl_id]= new TimeLine(tl_id)}else{if(dbg) dbgPut(tl_id)}


                    if (!thisComp.layers[ly_id][tl_id]) {
                        thisComp.layers[ly_id][tl_id] = new Array();
                        thisComp.layers[ly_id][tl_id].name = [tl_id];
                        thisComp.layers[ly_id][tl_id].maxValue = 0;
                        thisComp.layers[ly_id][tl_id].valueAtTime = valueAtTime_;
                    }
                    ;//else{	if(dbg) dbgPut(tl_id + " is exist")	}
//			なければ作る＝すでにあるタイムラインならスキップ
                    thisTimeLine = thisComp.layers[ly_id][tl_id];
//		if(dbg) dbgPut("set TIMELINE :"+ly_id+":"+tl_id);
                    continue;
                }
                continue;
            }


        }
//		all_AEfake();
//	キーの読み込みが終わったのでキーデータを解析
//キーの最後のフレームをみて、カットの継続時間を割り出す。
        thisComp.duration =
            nas.FCT2ms(
                ssUnit(thisComp.frameRate) *
                Math.ceil(thisComp.maxFrame / ssUnit(thisComp.frameRate))
            ) / 1000;//最小単位はキリの良いところで設定
//
//タイムラインをチェックしてタイミング情報を抽出
//レイヤでループ
        for (var lyr = 0; lyr < thisComp.layers.length; lyr++) {
            /*
             コンポジションのレイヤ情報を読んで、変換のパラメータを判定する
             現在認識して読み取るタイムライン
             timeRemap	タイミング情報有り
             slider	タイミング情報の可能性有り
             opacity	タイミング情報の可能性有り
             wipe	タイミング情報の可能性有り
             **カメラワーク判定は、現在なし 常にfalse

             */
//ソースデータ用情報トレーラ
            SrcData.layers[lyr] = new Object();

// 初期化
            SrcData.layers[lyr].haveTimingData = false;
            SrcData.layers[lyr].haveCameraWork = false;

//メソッド・位置をデフォルトに設定
            SrcData.layers[lyr].blmtd = xUI.blmtd;
            SrcData.layers[lyr].blpos = xUI.blpos;
            SrcData.layers[lyr].lot = "=AUTO=";
            //仮のブランクレイヤ
            var bTimeLine = false;
            var tBlank = false;
//リマップはある?
            if (thisComp.layers[lyr].timeRemap) {
                SrcData.layers[lyr].haveTimingData = true;

//カラセル制御レイヤはあるか
                if (thisComp.layers[lyr].opacity) {
                    if (ckBlank(thisComp.layers[lyr].opacity)) {
                        SrcData.layers[lyr].blmtd = "opacity";
                        SrcData.layers[lyr].blpos = "end";
                        //仮のブランクレイヤ
                        bTimeLine = thisComp.layers[lyr].opacity;
                        tBlank = 0;
                    }
                } else {
                    if (thisComp.layers[lyr].wipe) {
                        if (ckBlank(thisComp.layers[lyr].wipe)) {
                            SrcData.layers[lyr].blmtd = "wipe";
                            SrcData.layers[lyr].blpos = "end";
                            //仮のブランクレイヤ
                            bTimeLine = thisComp.layers[lyr].wipe;
                            tBlank = 100;
                        }
                    }
                }
//キーを全数検査
                var isExpression = false;//エクスプレッションフラグ
                var MaxValue = 0;//最大値を控える変数
                var blAP = false;//カラセル出現フラグ
                var tmpBlank = (SrcData.layers[lyr].blmtd == "opacity") ? 0 : 100;//仮のブランク値
                for (kid = 0; kid < thisComp.layers[lyr].timeRemap.length; kid++) {
                    if (thisComp.layers[lyr].timeRemap[kid].value[0] >= 999999) {
                        isExpression = true;
                        blAP = true;
                    }
                    ;//これが最優先(最後に判定して上書き)
//最大値を取得
                    if (MaxValue < 1 * thisComp.layers[lyr].timeRemap[kid].value[0] &&
                        1 * thisComp.layers[lyr].timeRemap[kid].value[0] < 999999) {
                        MaxValue = 1 * thisComp.layers[lyr].timeRemap[kid].value[0];

//最大値が更新されたらキーに対応するカラセル制御をチェック
                        if (bTimeLine) {
//制御ラインあるか
//キーフレームの位置にブランク指定があれば、そこをブランク値に設定
                            if (bTimeLine.valueAtTime(thisComp.layers[lyr].timeRemap[kid].frame) == tBlank) {
                                blAP = true;//カラセル出現
                            }
                        }

                    }
                }
                if (isExpression) {
                    SrcData.layers[lyr].blmtd = "expression2";
                    SrcData.layers[lyr].blpos = "end";
                }

                SrcData.layers[lyr].maxValue = MaxValue;

                /*	初期値を設定して上書きしたのでこの判定は不要
                 if(false) {
                 switch(SrcData.layers[lyr].blmtd){
                 case "wipe"	:
                 case "opacity"	:
                 case "expression2":
                 SrcData.layers[lyr].blpos="end";
                 break;
                 case "file"	:
                 SrcData.layers[lyr].blpos=xUI.blpos;
                 break;
                 }
                 }
                 */
//	フレームレート取り出し
                var FrameDuration = (thisComp.layers[lyr].frameDuration) ?
                    thisComp.layers[lyr].frameDuration :
                    thisComp.frameDuration();
//	セル枚数推定
                switch (SrcData.layers[lyr].blpos) {
                    case "end":
                        SrcData.layers[lyr].lot = (blAP) ?
                            Math.floor(MaxValue / FrameDuration) :
                        Math.floor(MaxValue / FrameDuration) + 1;//end
                        if (isExpression && blAP)    SrcData.layers[lyr].lot++;
                        break;
                    case "first":
                        SrcData.layers[lyr].lot =
                            Math.floor(MaxValue / FrameDuration);//first
                        break;
                    case "none":
                    default:
//	SrcData.layers[lyr].lot="=AUTO=";//end && MaxValue==0
                }
            } else {
//	スライダ制御はある?
                if (thisComp.layers[lyr].slider) {
                    /*	スライダ=エクスプレッションの可能性有り
                     エクスプレッションだとするとexpression1なので、
                     同一レイヤにタイムラインが二つ以上あってはならないものとする。
                     が、二つ目以降のスライダは、現在正常に読めない。混ざる

                     何とかする
                     */
//キーを全検査する。
                    var MaxValue = 0;
                    var isTiming = true;
                    for (kid = 0; kid < thisComp.layers[lyr].slider.length; kid++) {
//	整数か
                        if (thisComp.layers[lyr].slider[kid].value[0] % 1 != 0) {
                            isTiming = false;
                            break;
                        }

//最大値を取得
                        if (MaxValue < 1 * thisComp.layers[lyr].slider[kid].value[0]) {
                            MaxValue = thisComp.layers[lyr].slider[kid].value[0]
                        }
//	alert(thisComp.layers[lyr].slider[kid].value[0])
                    }
//すべて整数値ならば一応エクスプレッションによるタイミングと認識
                    if (isTiming) {
                        SrcData.layers[lyr].haveTimingData = true;
                        SrcData.layers[lyr].blmtd = "expression1";
                        SrcData.layers[lyr].blpos = "first";
                        SrcData.layers[lyr].lot = MaxValue;
                        SrcData.layers[lyr].maxValue = MaxValue;
                    }
//			
                }
            }
//両方の判定を抜けたならタイミング情報がないのでこのレイヤはただの空レイヤ

            /*
             //	タイミングだと思われる場合はフラグ立てる。
             //case	"slider":
             //case	"timeRemap":	;break;
             //キーを全数検査する。
             //制御レイヤが付属していたらそちらを優先させる。
             //制御レイヤの値とリマップの値を比較してカラセルメソッドとポジションを出す

             //タイムリマップとスライダの時のみの判定
             //値の最大量を控える
             if(SrcData.layers[ly_id].maxValue<value) SrcData.layers[ly_id].maxValue= value;

             //スライダかつ整数以外の値があるときは削除フラグを立てる
             if(tl_id=="slider" && value%1 != 0) SrcData.layers[ly_id].isExpression=false;

             //タイムリマップでかつ値に"999999"がある場合はメソッドをexp2に
             if(tlid=="timeRemap" && value==999999) SrcData.leyers[ly_id].blmtd="exp2";

             */

        }
//	解析したプロパティの転記
//		暫定処理だけど現在のカットの情報で埋めることにする
        if (true) {
            SrcData.mapfile = "(no file)";
            SrcData.title = this.title;
            SrcData.subtitle = this.subtitle;
            SrcData.opus = this.opus;
            SrcData.scene = this.scene;
            SrcData.cut = this.cut;
            SrcData.create_user = this.create_user;
            SrcData.update_user = this.update_user;
            SrcData.create_time = this.create_time;
            SrcData.update_time = this.update_time;
            SrcData.framerate = thisComp.frameRate;
            SrcData.layerCount = thisComp.layers.length;
            SrcData.memo = this.memo;
            SrcData.time = thisComp.duration * thisComp.frameRate;//読み取り
            SrcData.trin = [this.trin[0], this.trin[1]];
            SrcData.trout = [this.trout[0], this.trout[1]];
        } else {
            SrcData.mapfile = "(no file)";
            SrcData.title = "";
            SrcData.subtitle = "";
            SrcData.opus = "";
            SrcData.scene = "";
            SrcData.cut = "";
            SrcData.create_user = "";
            SrcData.update_user = "";
            SrcData.create_time = "";
            SrcData.update_time = "";
            SrcData.framerate = thisComp.frameRate;
            SrcData.layerCount = thisComp.layers.length;
            SrcData.memo = "";
            SrcData.time = thisComp.duration * thisComp.frameRate;//読み取り
            SrcData.trin = [0, "trin"];
            SrcData.trout = [0, "trout"];//キーフレームからは読まない(ユーザが後で指定)
        }
//	SrcData.frameCount	=;
//	SrcData.	="";
//	SrcData.	="";
//	SrcData.	="";	
//	SrcData.	="";


        /*
         タイムリマップとスライダ制御の両方がない場合は、
         レイヤは「camerawork」(保留)
         スライダ制御があって、かつデータエントリーがすべて整数の場合は、
         exp1 それ以外はスライダ制御を破棄
         スライダ制御とタイムリマップが両方ある場合はタイムリマップ優先


         */

    }
    ;
//
//	第二パス終了・読み取った情報でXPSオブジェクトを再初期化(XPS/AEKey共通)
    SrcData.duration =
        Math.ceil(SrcData.time + (SrcData.trin[0] + SrcData.trout[0]) / 2);
//		トランシット時間の処理は要再考。現状は切り上げ
    var SheetDuration = (SrcData.duration > (SrcData.frameCount - 1)) ?
        SrcData.duration : (SrcData.frameCount - 1);//大きいほう

//		ここから後戻り不可なので警告を出すべきかもね

    if (SrcData.dataClass == "XPS") {

//	読み込み確認(XPS)
        if (!confirm("XPSデータの読み込みを行います。\n読み込みを行うと以前の編集内容は消去されます。\nこの操作は、取り消しできません。\n\n----- よろしいですか?"))
            return false;
    }
    if (SrcData.dataClass == "AEKey") {

//	読み込み確認(AEKey)
//ここは、後からオプションセレクタに変更すること。

        if (!confirm("AEKeyデータの読み込みを行います。\n読み込みを行うと以前の編集内容は消去されます。\nこの操作は、取り消しできません。\n\n----- よろしいですか?")) {
            return false;
        } else {
//	SrcData.blank_offset=0;// 0 or 1
//	SrcData.key_shift=false;
        }
    }

    if (SrcData.dataClass == "TSX") {

//	読み込み確認(TSX)
        if (!confirm("TSXデータの読み込みを行います。\n読み込みを行うと以前の編集内容は消去されます。\nこの操作は、取り消しできません。\n\n----- よろしいですか?"))
            return false;
    }
    ;
//	///////////////////////
//	if(dbg) dbgPut("count/duration:"+SrcData.layerCount+":"+SheetDuration);
    this.init(SrcData.layerCount, SheetDuration);//再初期化
//	///////////////////////
//	第二パスで読み取ったプロパティをXPSに転記
    for (id = 0; id < propNames.length; id++) {
        prpName = propNames[id];
        if (SrcData[prpName] && prpName != "time") {
            this[prpName] = SrcData[prpName];
//					タイム以外はそのまま転記

        }
    }

//	読み取りデータを調べて得たキーメソッドとブランク位置を転記
    for (var lyr = 0; lyr < SrcData.layers.length; lyr++) {
        this.layers[lyr].blmtd = SrcData.layers[lyr].blmtd;
        this.layers[lyr].blpos = SrcData.layers[lyr].blpos;
        this.layers[lyr].lot = SrcData.layers[lyr].lot;
    }

    if (SrcData["memo"]) this["memo"] = SrcData["memo"];//memoがあれば転記


// ///// 各エントリのレイヤプロパティとシート本体情報を取得(第三パス)

    if (SrcData.dataClass == "AEKey") {
//読み出したAEオブジェクトから情報を再構成する
        var preValue = '';//直前の値を控えておく変数
        var AETransStream = new String();//リザルト文字列の初期化

//=================================================================
// XPSに直接転送する代りに、put可能なデータストリームに再構成する
// このルーチンを使用する場合は、仮のシートプロパティを転記しないように

        for (layer = 0; layer < SrcData.layerCount; layer++) {
//レイヤ数回す

            timingTL = (SrcData.layers[layer].blmtd == "expression1") ? "slider" : "timeRemap";//	タイミング保持タイムラインをblmtdで変更


            BlankValue = (SrcData.layers[layer].blpos == "first") ?
                0 : (SrcData.layers[layer].lot + 1);
//	レイヤごとのブランク値を設定する。999999は、とりあえずパス

            for (kid = 0; kid < thisComp.layers[layer][timingTL].length; kid++) {
//タイミング保持タイムラインのキー数で転送
                if (preValue != thisComp.layers[layer][timingTL][kid].value[0]) {
                    frame = thisComp.layers[layer][timingTL][kid].frame;

//キーフレームの存在するコマのみ時間値からセル番号を取り出して転送
                    /*
                     if(xUI.timeShift){
                     timeShift=(Math.abs((thisComp.layers[layer][timingTL][kid].value[0]/thisComp.frameDuration())-Math.floor(thisComp.layers[layer][timingTL][kid].value[0]/thisComp.frameDuration()))< 0.05)?
                     thisComp.frameDuration()*0.5	:	0;
                     }else{
                     timeShift=0;
                     };
                     */
//if (timeShift!=0){alert(Shift);}
                    timeShift = (xUI.timeShift) ?
                    thisComp.frameDuration() * 0.5 : 0;


                    blank_offset = (SrcData.layers[layer].blpos == "first") ?
                        0 : 1;

//あらかじめセル番号を計算
                    cellNo = (timingTL == "timeRemap") ?
                    Math.floor((thisComp.layers[layer][timingTL][kid].value[0] + timeShift) / thisComp.frameDuration()) + blank_offset :
                        thisComp.layers[layer][timingTL][kid].value[0];


                    if (SrcData.layers[layer].blpos == "first") {
                        if (cellNo == BlankValue) {
                            cellNo = "X"
                        }
                    } else {
                        if (cellNo >= BlankValue) {
                            cellNo = "X"
                        }
                    }

                    /*
                     if (thisComp.layers[layer][timingTL][kid].value[0]==BlankValue)
                     {	cellNo="X";
                     }else{
                     cellNo=(timingTL=="timeRemap")?
                     Math.floor((thisComp.layers[layer][timingTL][kid].value[0]+timeShift)/thisComp.frameDuration())-blank_offset:
                     thisComp.layers[layer][timingTL][kid].value[0];
                     };
                     */
//if(dbg) dbgPut(thisComp.layers[layer][timingTL][kid].value);


//swith(thisComp.layers[layer].blpos){
//case "first"	: BlankValue=0;break;
//case "end"	: BalnkValue=;break;
//
//}


//	this[layer+1][frame]=cellNo; //XPSに設定する代りにストリームを生成

                    AETransStream += cellNo;
                    if (kid < thisComp.layers[layer][timingTL].length - 1) {
                        var currentframe = thisComp.layers[layer][timingTL][kid].frame;
                        var nextframe = thisComp.layers[layer][timingTL][kid + 1].frame;
                        for (fr = currentframe; fr < nextframe; fr++) {
                            AETransStream += ","
                        }
                    }
                    ;

                    preValue = thisComp.layers[layer][timingTL][kid].value[0];
                }
            }
            preValue = '';//1レイヤ終わったら再度初期化
        }
//====================================================================
        xUI.put(AETransStream);
        return false;
    }

    if (TSXEx && SrcData.dataClass == "TSX") {
//カウンタ初期化
        SrcData.time = 0;//初期化
        var LayerTime = 0;
        SrcData.layerCount = 0;//初期化
        LayerCount = 0;
        var RepeatBuf = new Array();
        var repIdx = 0;
//	var readCountLine	=	0;
//	var readCountLayer	=	0;
//本体データ読み取り
        for (line = SrcData.startLine; line < SrcData.length; line++) {

            if (SrcData[line].match(/^[\/eE].*$/)) {
                if (LayerCount != SrcData.layerCount) {
                    LayerTime = 0;
                    LayerCount++;
                }
                //記述終了・継続時間加算リセット・レイヤ加算
            } else {
                if (LayerCount == SrcData.layerCount) {
                    if (RepeatBuf.length) {
                        RepeatBuf.length = 0;
                        repIdx = 0;
                    }
                    SrcData.layerCount++;
                }
                body_data = SrcData[line].replace(/^([^\#]*)(\-\-|\#).*$/, "$1");
                if (body_data.match(/^[1-9][0-9]*$/)) {
                    if (RepeatBuf.length) {
                        RepeatBuf.length = 0;
                        repIdx = 0;
                    }
                    this[LayerCount + 1][LayerTime] = body_data;
                } else {
                    if (body_data == "") {
                        if (RepeatBuf.length) {
                            this[LayerCount + 1][LayerTime] = RepeatBuf[repIdx % RepeatBuf.length];
                            repIdx++;
                        } else {
                            this[LayerCount + 1][LayerTime] = body_data;
                        }
                    } else {
                        RepeatBuf = TSX_expdList(body_data);
                        repIdx = 0;
                        this[LayerCount + 1][LayerTime] = RepeatBuf[repIdx];
                        repIdx++;
                    }

                }
                LayerTime++;
                if (SrcData.time < LayerDuration) {
                    SrcData.time = LayerDuration;
                }
            }

        }
    }
// ///// 読み取ったデータを検査する(データ検査は別のメソッドにしろ!??)
    /*
     //	マップファイルは、現在サポート無し
     //		サポート開始時期未定
     //この情報は、他の情報以前に判定して、マップオブジェクトの生成が必要。
     //マップ未設定状態では、代用マップを作成して使用。
     //代用マップは、デフォルトで存在。
     <<
     現在は、代用MAPオブジェクトを先行して作成してあるが、
     本来のマップが確定するのはこのタイミングなので、注意!
     >>
     */
    if (false) {
//MAPPING_FILE=(no file)//値は未設定時の予約値?nullで初期化すべきか?
        if (!this.mapfile) this.mapfile = '(no file)';

//マップファイルが未設定ならば、代用マップを使用
//この判定はあまりに雑なので後でなんとかすれ
        if (false) {
            if (this.mapfile == '(no file)') {
                MapObj = MAP;	//とりあえず既存のダミーマップを代入しておく。
            }
        }
//マップファイルを読み込んでマップオブジェクトを初期化
        //	そのうちね、今はまだない
//日付関連

//制作日付と制作者が無い場合は、空白で初期化?無視したほうが良いかも
//CREATE_USER=''
//CREATE_TIME=''
        if (!this.create_time) this.create_time = '';
        if (!this.create_user) this.create_user = '';
//最終更新日付と最終更新者が無い場合は、空白で初期化?
//(これは、どのみち保存時に現在のデータで上書き)
//UPDATE_USER=''
//UPDATE_TIME=''
        if (!this.update_time) this.update_time = '';
        if (!this.update_user) this.update_user = '';
//
//FRAME_RATE=24//
//フレームレート読み取れてなければ、現在の値で初期化(組み込み注意)
        if (!this.framerate) {
            this.framerate = nas.newFramerate(nas.FRATE.toString());
        } else {
            nas.FRATE = nas.newFramerate(this.framerate);
        }
//トランシット展開しておく
//TRIN=(時間文字列),(トランシット種別)
        if (!this.trin) {
            this.trin = [0, "trin"]
        } else {
            time = nas.FCT2Frm(this.trin.split(",")[0]);
            if (isNaN(time)) {
                time = 0
            }
            ;
            name = (this.trin.split(",")[1]) ? this.trin.split(",")[1] : "trin";
            this.trin = [time, name];
        }
//TROUT=(時間文字列),(トランシット種別)
        if (!this.trout) {
            this.trout = [0, "trout"];
        } else {
            time = nas.FCT2Frm(this.trout.split(",")[0]);
            if (isNaN(time)) {
                time = 0
            }
            ;
            name = (this.trout.split(",")[1]) ? this.trout.split(",")[1] : "trout";
            this.trout = [time, name];
        }
//TIMEも一応取り込んでおく。
//実際のデータの継続時間とこの情報の「長いほう」を採る
//TIME=(時間文字列)
        this.time = nas.FCT2Frm(this.time);
        if (isNaN(this.time)) {
            this.time = 0
        }

//作品データ
//情報が無い場合は、空白で初期化。マップをみるようになったら。
//マップの情報を参照
//最終作業情報(クッキー)を参照
//ユーザ設定によるデフォルトを参照 などから選択


//TITLE=(未設定とかのほうが良いかも)
        if (!this.title) this.title = '';
//SUB_TITLE=(未設定とかのほうが良いかも)
        if (!this.subtitle) this.subtitle = '';
//OPUS=()
        if (!this.opus) this.opus = '';
//SCENE=()
        if (!this.scene) this.scene = '';
//CUT=()
        if (!this.cut) this.cut = '';

//シーン?・カット番号は最終状態でもデフォルトは空白に。紛らわしいから。

    }

    return true;
//return this;
};
//
//XPS.readIN	=	readIN_	;
//
if (SrcData[l].match(/^\.timeremap\/INT9\/1.0\/(utf-?(8|16)|euc-?jp|shift(-_)jis|sjis)\/(lf|cr|lfcr)$/g)) {
}


