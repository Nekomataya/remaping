/**
 * @overview プリファレンスの読み込みと保存
 *
 * 保存するオブジェクトをそれぞれ１ファイルで設定フォルダへjsonテキストで保存する
 * 拡張子は.json
 * ファイル名はオブジェクト名をそのまま
 * 例: nas.inputMedias.body.json 等
 * プリファレンスとして保存するオブジェクトはこのファイルの設定として固定
 * 読み込みは記録フォルダの内部を検索してオブジェクトの存在するもの全て
 * 新規のオブジェクトは作成しない
 * 乙女のローカルで作成したファンクションをadobeライブラリ全体へ拡張
 * あとで乙女の部当該分を換装すること
 *
 * ホストアプリケーション別の切り分けを組み込んで、ファイルを共用に変更
 *
 * @todo ただし、アプリケーションごとのプロパティの切り分けは別ファイルの方が望ましいので、次の機会に各ホストごとの設定ファイルへ移行の予定
 * 2016.05.31
 */

Folder.nas = nas.baseLocation;
//alert(Folder.nas.fsName)
//alert (nas.baseLocation)
//nas.prefarenceFolder=new Folder(Folder.nas.path+"/scripts/lib/etc");//保存場所固定
//nas.prefarenceFolder=new Folder(Folder.nas.path+"/nas/lib/etc");//保存場所固定
nas.prefarenceFolder = new Folder(Folder.userData.fullName + "/nas/lib/etc");//保存場所固定


/**
 * @param myPropName
 */
nas.readPrefarence = function (myPropName) {
    if (!myPropName) {
        myPropName = "*"
    }
    var myPrefFiles = this.prefarenceFolder.getFiles(myPropName + ".json");
    for (var idx = 0; idx < myPrefFiles.length; idx++) {
        var myPropName = myPrefFiles[idx].name.replace(/\.json$/, "");
        try {
            myProp = eval(myPropName);
        } catch (er) {
            //               alert(myPropName +"if  not Exists. loading aborted");
            continue;
        }
        if (eval(myPropName)) {
            var myOpenFile = new File(myPrefFiles[idx].fsName);
            var canRead = myOpenFile.open("r");
            if (canRead) {
                myOpenFile.encoding = "UTF-8";
                var myContent = myOpenFile.read();
                myOpenFile.close();
                if (nas.otome) {
                    nas.otome.writeConsole(myContent);
                }
                if (myContent.match(/\(new\sNumber\(([0-9\.]+)\)\)/)) {
                    myContent = myContent.replace(/\(new\sNumber(\([0-9\.]+\))\)/g, RegExp.$1);
                    if ((myPropName.match(/(.*[^\.])\.selected/)) && (eval(RegExp.$1 + "  instanceof nTable"))) {
                        eval(RegExp.$1 + ".select\(" + myContent + "\)");
                        //	alert(myContent);
                    } else {
                        eval(myPropName + " =(" + myContent + ")");
                    }
                } else {
                    if (myContent.match(/\(new\sString\((.+)\)\)/)) {
                        myContent = myContent.replace(/\(new\sString(\(.+)\)\)/g, RegExp.$1);
                        eval(myPropName + " =" + myContent);
                    } else {
                        if (nas.otome) {
                            nas.otome.writeConsole(myPropName + " = eval(" + myContent + ")");
                        }
                        eval(myPropName + " =eval(" + myContent + ")");
                    }
                }
            }
        } else {
            if (nas.otome) {
                nas.otome.writeConsole("cannot Replace prop " + myPropName);
            }
        }
    }
};

/**
 * @param myPrefs
 */
nas.writePrefarence = function (myPrefs) {
    if (!myPrefs) {
        myPrefs = [];
    }
    if (!(myPrefs instanceof Array)) {
        myPrefs = [myPrefs];
    }//配列に

    if (myPrefs.length == 0) {
        /**
         * @todo 試験用あとで調整
         * @type {string[]}
         */
        myPrefs = [
            "nas.registerMarks.bodys",
            "nas.registerMarks.selected",
            "nas.inputMedias.bodys",
            "nas.inputMedias.selected",
            "nas.outputMedias.bodys",
            "nas.outputMedias.selected",
            "nas.workTitles.bodys",
            "nas.workTitles.selected",
            "nas.CURRENTUSER",
            "nas.RESOLUTION",
            "nas.FRATE",
            "nas.SheetLength",
            "nas.importFilter",
            "nas.cellRegex",
            "nas.bgRegex",
            "nas.mgRegex",
            "nas.loRegex"
        ];
        if (isAdobe) {
            /**
             * @desc AE専用
             */
            if (app.name.indexOf("AfterEffects") > 0) {
                myPref.push("nas.expressions");
                //		"nas.ftgFolders"
            }
            /**
             * @desc PS専用
             */
            if (app.name.indexOf("Photoshop") > 0) {
                myPref.push("nas.axe");
            }
        }
    }
    if ((this.prefarenceFolder.exists) && (!(this.prefarenceFolder.readonly))) {
        for (var idx = 0; idx < myPrefs.length; idx++) {
            if (eval(myPrefs[idx]) != undefined) {
                if ((eval(myPrefs[idx])) instanceof RegExp) {
                    var myContent = eval(myPrefs[idx] + ".toString()");
                    if (myContent.match(/\/([ig]+)$/)) {
                        var myRegOpt = RegExp.$1;
                    } else {
                        var myRegOpt = "";
                    }
                    var myContentBody = myContent.slice(1, myContent.length - myRegOpt.length - 1).replace(/\\/g, "\\\\");
                    myContent = "\(new RegExp\(\"" + myContentBody + "\",\"" + myRegOpt + "\"\)\)";
                } else {
                    var myContent = eval(myPrefs[idx] + ".toSource()")
                }
                var myFileName = myPrefs[idx] + ".json";
                if (nas.otome) {
                    nas.otome.writeConsole(myContent);
                }
                var myOpenFile = new File(this.prefarenceFolder.path + "/" + this.prefarenceFolder.name + "/" + myFileName);
                var canWrite = myOpenFile.open("w");
                if (canWrite) {
                    if (nas.otome) {
                        nas.otome.writeConsole(myOpenFile.fsName);
                    }
                    myOpenFile.encoding = "UTF-8";
                    myOpenFile.write(myContent);
                    myOpenFile.close();
                } else {
                    var msg = myOpenFile.fsName + nas.localize({en: ": It failed to write", ja: ": これなんか書けないカンジ"});
                    if (nas.otome) {
                        nas.otome.writeConsole(msg)
                    } else {
                        alert(msg)
                    }
                }//ファイルが既存かとか調べない うほほ

            } else {
                var msg = nas.localize({
                    en: "object :%1 does not seem to exist. It can not be saved.",
                    ja: "object :%1 は存在しないようです。保存できません。"
                }, myPrefs[idx]);
                if (nas.otome) {
                    nas.otome.writeConsole(msg)
                } else {
                    alert(msg)
                }
            }
        }
    }//else{alert("GOGO")}
};

//nas.writePrefarence();


/**
 * @desc 個人情報をクリアする。最後に再初期化を促すメッセージを出力
 */
nas.cleraPrefarence = function () {

    /**
     * 023
     * var msg="個人領域に記録した情報をすべてクリアします。"+nas.GUI.LineFeed;
     * msg+="nasライブラリを使用するすべてのアプリケーションの情報をクリアしますので、"+nas.GUI.LineFeed;
     * msg+="AEとPSでnasライブラリを使用している方は特にご注意ください。"+nas.GUI.LineFeed;
     * msg+="クリアして良いですか？"+nas.GUI.LineFeed;
     */
    var msg = nas.localize(nas.uiMsg.dm023);

    var doFlag = confirm(msg);

    if ((doFlag) && (this.prefarenceFolder.exists) && (!(this.prefarenceFolder.readonly))) {
        var myPrefFiles = this.prefarenceFolder.getFiles("*.json");
        var clearCount = 0;
        if (myPrefFiles.length) {
            for (var idx = 0; idx < myPrefFiles.length; idx++) {
                try {
                    myPrefFiles[idx].remove();
                    clearCount++;
                } catch (er) {

                }
            }

            /**
             * 024
             * 個人領域に記録した情報 :%COUNT% 個のデータをクリアしました。
             * 現在の情報は、メモリ上にあります。\nデータはアプリケーション再起動の際に初期化されます。
             * 初期化を希望する場合は、保存せずにアプリケーションを再起動してください。"
             */
            msg = nas.localize(nas.uiMsg.dm024, clearCount);//
        } else {
            //no data
            msg = nas.localize(nas.uiMsg.noRemoveData);//"消去するデータがありませんでした"
        }
        alert(msg);
    }//else{alert("GOGO")}
};
//nas.clearPrefarence();


/**
 * nas.importPrefarence(myFolder)
 * 引数:ターゲットフォルダ　指定のない場合はフォルダターゲットを取得
 * 戻値: インポート成功時はtrue失敗時はfalse
 * 外部供給されたプリファレンスを個人領域に取り込むメソッド
 * @param myFolder
 */
nas.importPrefarence = function (myFolder) {
    var goFlag = true;
    if (typeof myFolder != "Folder") {
        var myMsg = nas.localize(nas.uiMsg.dm025);//"インポートする設定のあるフォルダを指定して下さい";
        myFolder = Folder.selectDialog(myMsg);
        if (myFolder) {
            myMsg = myFolder.fullName + nas.localize(nas.uiMsg.dm027);//027":\n上のフォルダの設定をインポートします。\n同名の設定は上書きされて取り消しはできません\n実行してよろしいですか？"
            goFlag = confirm(myMsg);
        }
    }
    if (goFlag) {
        var currentPrefFolder = nas.prefarenceFolder;
        nas.prefarenceFolder = myFolder;//設定
        nas.readPrefarence();//全て読む
        nas.prefarenceFolder = currentPrefFolder;//復帰
        nas.writePrefarence();//書き込む
    }
};

/**
 * nas.exportPrefarence(myFolder)
 * 引数:ターゲットフォルダ　指定のない場合はフォルダターゲットを取得
 * 戻値: インポート成功時はtrue失敗時はfalse
 * プリファレンス書き出しメソッド
 * @param myFolder
 */
nas.exportPrefarence = function (myFolder) {
    var goFlag = true;
    if (typeof myFolder != "Folder") {
        var myMsg = nas.localize(nas.uiMsg.dm026);//"設定を書き出すフォルダを指定して下さい";
        myFolder = Folder.selectDialog(myMsg);
        if (myFolder) {
            myMsg = myFolder.fullName + nas.localize(nas.uiMsg.dm028);//028":\n上のフォルダに設定をエクスポートします。\n空きフォルダ推奨します\n実行してよろしいですか？"
            goFlag = confirm(myMsg);
        }
    }
    if (goFlag) {
        var currentPrefFolder = nas.prefarenceFolder;
        nas.prefarenceFolder = myFolder;//設定
        nas.writePrefarence();//書き込む
        nas.prefarenceFolder = currentPrefFolder;//復帰
    }
};