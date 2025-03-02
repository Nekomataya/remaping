﻿/**
 * @fileoverview Adobeスクリプトで実行するインストーラ
 * アプリケーションの判別
 * インストール先
 * 環境取得・設定など
 * $version
 */

var thisFileName = "nasLibInstall.js";//識別用自己ファイル名
var thisDataFileName = "nas_lib_install.dat";//データファイル名識別用 同ディレクトリのみ
var thisPackageSign = "//(nas_lib_installer_data)";//データの第一行目をすべて。これが一致しないと動作終了
//	nasライブラリを前提としない、単独で動作するスクリプトである。


try {
    /**
     * @desc app オブジェクトがあればAdobeScript環境と判断する。
     * エラーがでれば、たぶんHTMLブラウザってことで
     */
    if (app) {
    }

} catch (ERR) {
    abortProcess("Adobe環境から起動してください。");
}

var nas_Installer = {};

/**
 * インストール手順本体格納オブジェクト
 * @type {{}}
 */
nas_Installer.myInstall = {};
nas_Installer.debug = false;
nas_Installer.job = "install";//"install" or "uninstall"
nas_Installer.isShutdown = false;//shutdown Flag
nas_Installer.installLog = [];//actionLog
nas_Installer.pushLog = function (myString) {
    this.installLog.push(myString);
};
/**
 * @todo ログプッシュ…あとでログの構造変えるかも…
 */
nas_Installer.pushLog("startup Install:" + new Date().toString());

/**
 * リプレース用パスのトレーラ
 * @type {{}}
 */
nas_Installer.replacePath = {};

/**
 * 簡易識別
 * @type {boolean}
 */
var isWindows = ($.os.match(/windows/i)) ? true : false;//windowsフラグ
if (isWindows) {
    nas_Installer.replacePath.startup = Folder.startup.path + "/" + Folder.startup.name;	///c/Program%20Files/Adobe/Adobe%20Photoshop%20CS5.1/Presets/Scripts for Windows
} else {
    switch (app.version.split(".")[0]) {
        case    "7":
        case    "8":
            nas_Installer.replacePath.startup = Folder.startup.path.split("/").slice(0, Folder.startup.path.split("/").length - 3).join("/");///c/Program%20Files/Adobe/Adobe%20Photoshop%20CS5.1/Presets/Scripts forMacCS
            break;
        default:
            nas_Installer.replacePath.startup = Folder.startup.path.split("/").slice(0, Folder.startup.path.split("/").length - 2).join("/");///c/Program%20Files/Adobe/Adobe%20Photoshop%20CS5.1/Presets/Scripts forMacCS
    }
}

/**
 * 簡易GUIライブラリを搭載する。
 * @type {string}
 */
var LineFeed = (isWindows) ? "\x0d\x0a" : "\x0d";//改行コード設定

/**
 * @desc GUI Setup
 * 簡易GUIライブラリ
 */
var leftMargin = 12;
var rightMargin = 24;
var topMargin = 2;
var bottomMargin = 24;
var leftPadding = 8;
var rightPadding = 8;
var topPadding = 2;
var bottomPadding = 2;
var colUnit = 120;
var lineUnit = 24;
var quartsOffset = (isWindows) ? 0 : 4;
/**
 * @param col
 * @param line
 * @param width
 * @param height
 * @returns {*[]}
 */
function nasGrid(col, line, width, height) {
    left = (col * colUnit) + leftMargin + leftPadding;
    top = (line * lineUnit) + topMargin + topPadding;
    right = left + width - rightPadding;
    bottom = (height <= lineUnit) ? top + height - bottomPadding - quartsOffset : top + height - bottomPadding;
    return [left, top, right, bottom];
}

/**
 * アプリケーション別シャットダウンメソッド
 */
applicationShutdown = function () {
    switch (app.name) {
        case    "Adobe AfterEffects":
            app.quit();
            break;
        case    "Adobe Photoshop":
            executeAction(charIDToTypeID("quit"), undefined, DialogModes.NO);
            break;
        default:
            alert("アプリケーションを終了してください");
    }
};

/**
 * インストラーの位置を指定
 * @type {boolean}
 */
var checkNG = true;
var installerFile = new File("./" + thisFileName);//カレントにインストーラを設定してあるかどうか確認

if (nas_Installer.debug) {
    alert(installerFile.fsName);
}

while (checkNG) {
    if ((!installerFile.exists) || (installerFile.name != thisFileName)) {
        installerFile = File.openDialog("現在実行しているインストーラーを指定してください。", Folder.current);
    }
    if ((installerFile) && (installerFile.name == thisFileName)) {
        /**
         * @desc 同階層のインストール設定を確認
         * @type {Folder}
         */
        var checkFolder = new Folder(new File(installerFile).path);
        var checkFiles = checkFolder.getFiles();
        for (var idx = 0; idx < checkFiles.length; idx++) {
            if (checkFiles[idx].name == thisDataFileName) {
                myCheckFile = new File(checkFiles[idx].fsName);
                myCheckFile.open("r");
                var magickNumber = myCheckFile.readln(1);
                myCheckFile.close();
                if (magickNumber == thisPackageSign) {
                    checkNG = false;
                    Folder.current = checkFolder;

                    nas_Installer.replacePath.source = Folder.current.path + "/" + Folder.current.name;

                    break;

                }
            }
        }
    }
}


/**
 * @desc Photoshop    パスの取得/ライブラリの設定。
 * ライブラリをロードするのに
 * "//@include"をつかいたいが、その場合は、インストールするスクリプト自体を改変する必要がある。
 * 別のロードを使用した方が良いかも。
 *
 *
 * 方法は基本的にふたつ
 *
 * includeに相当する機能を自前で書く。
 * 参照用の変数や、そのあたりが充実していれば、有用性大きい
 * これがないと結局オーバーヘッドがでかくなるのでダメぽい。
 * 要調査
 *
 * include文を含む部分をインストール時に生成してスクリプト冒頭に埋め込む。
 * 環境が変わったら再インストールだけど、オーバーヘッドは小さい
 * ソース内でinclude擬似命令のある部分は、パスの置換をおこなう。
 * %STARUP%    Folder.startup.path+nameと置換
 * /c/Program%20Files/Adobe/Adobe%20Photoshop%20CS5.1/Presets/Scripts/nas        nasフォルダのパスと置換
 * ‾/AppData/Roaming/nas    ユーザ指定のインストール先のパスと置換
 * /f/psScripts/PsAXE    ユーザ指定のインストール元のパスと置換
 * ‾/AppData/Roaming/nas        設定ファイル内のユーザパスと置換
 *
 */


/**
 * インストーラ内で使用する関数-インストーラクラスのメソッド
 * メッセージ出力
 * @param msg
 */
nas_Installer.showMsg = function (msg) {
    alert(msg);
};


/**
 * プロセス中断メッセージ
 * @param msg
 * @returns {boolean}
 */
nas_Installer.abortProcess = function (msg) {
    alert("ぎゃー! なんか想定外のことが起きたヨ\n=================\n" + msg + "\n======================\n上のメッセージをねこまたやまでお知らせくださると、なんとかなるかも知れません。\nダメならあきらめてチョ");
    this.pushLog("想定外エラー :" + msg);

    return false;
};

/**
 * パスの置換
 * @param myString
 * @returns {XML|string|*}
 */
nas_Installer.pathReplace = function (myString) {
    myString = myString.replace(/\%STARTUP\%/g, this.replacePath.startup);
    myString = myString.replace(/\%NAS\%/g, this.replacePath.nas);
    myString = myString.replace(/\%INSTALL\%/g, this.replacePath.install);
    myString = myString.replace(/\%SOURCE\%/g, this.replacePath.source);
    myString = myString.replace(/\%USER\%/g, this.replacePath.user);
    return myString;
};

/**
 * 置換つきファイル複写
 * @param readfile
 * @param writefile
 * @returns {boolean}
 */
nas_Installer.copyScriptWithReplace = function (readfile, writefile) {
    if (readfile.exists && readfile.name.match(/\.jsx?$/i)) {
        var myOpenfile = new File(readfile.fsName);
        myOpenfile.open("r");
        myContent = myOpenfile.read();

        //alert(myContent);
        if (writefile && writefile.name.match(/\.jsx?$/i)) {
            var myWritefile = new File(writefile.fsName);
            myWritefile.open("w");
            myWritefile.write(this.pathReplace(myContent));
            myWritefile.close();
        } else {
            return false
        }
        this.pushLog("copy scriptfile with repalacement ok:" + readfile.fsName + " > " + writefile.fsName);
        return true;
    } else {
        this.pushLog("copy scriptfile with repalacement miss:" + readfile.fsName + " > " + writefile.fsName);
        return false;
    }
};

/**
 * @param actionFlag
 * @returns {boolean}
 */
nas_Installer.doInstall = function (actionFlag) {
    if (actionFlag == "uninstall") {
        this.myInstall = this.myUnInstall;
        this.installLog.push("change mode Uninstall.")
    }

    //インデックス順にインストールを実行 いまは分岐もループもないからね。(2008/02/05)
    //そんな動作が欲しけりゃfunctionに直接書きなヨ

    for (var idx = 0; idx < this.myInstall.length; idx++) {

        var myAction = "NOP";
        if (this.myInstall[idx][0] instanceof Function) {
            myAction = "doFunction"
        } else {
            switch (this.myInstall[idx][0]) {
                case    "mkdir":
                    myAction = "makeFolder";
                    break;
                case    "rmdir":
                    myAction = "removeFolder";
                    break;
                case    "cd":
                    myAction = "changeDir";
                    break;
                case    "confirm":
                    myAction = "confirm";
                    break;
                case    "shutdown":
                    myAction = "shutdown";
                    break;
                case    "cp":
                    myAction = "copyFile";
                    break;
                case    "mv":
                    myAction = "renameFile";
                    break;
                case    "rm":
                    myAction = "deleteFile";
                    break;
                case    "clearAll":
                    myAction = "clearSelfFiles";
                    break;
                default    :
                    if (this.myInstall[idx].length = 2) {
                        myAction = "copyFile";
                    }
            }
        }
        switch (myAction) {
            case    "confirm":
                if (!confirm(this.pathReplace(this.myInstall[idx][1]))) {
                    return false;
                }
                break;
            case    "shutdown":
                nas_Installer.isShutdown = true;
                return false;
                break;
            case    "makeFolder":
                var targetDir = new Folder(this.pathReplace(this.myInstall[idx][1]));
                if (!targetDir.exists) {
                    if (this.debug) {
                        alert(targetDir.fsName + " を作った気分");
                    } else {
                        try {
                            targetDir.create();
                        } catch (err) {
                            this.abortProcess(myAction + ":\n" + err);
                            return false;
                        }
                    }
                    this.pushLog(myAction + " : " + targetDir.fsName);
                } else {
                    this.showMsg("フォルダ " + targetDir.fsName + " がすでにあるっぽいのでパス");
                    this.pushLog(myAction + " : " + targetDir.fsName + "allready exists");
                }
                break;
            case    "removeFolder":
                var targetDir = new Folder(this.pathReplace(this.myInstall[idx][1]));
                if (targetDir.exists) {
                    if (this.debug) {
                        if (targetDir.getFiles().length != 0) {
                            this.showMsg("フォルダが空でないけど " + targetDir.fsName + " を削除した気分");
                        } else {
                            this.showMsg(targetDir.fsName + " を削除した気分");
                        }
                    } else {
                        /**
                         * @desc フォルダコンテンツ確認
                         */
                        if (targetDir.getFiles().length != 0) {
                            this.abortProcess(myAction + ":\nフォルダが空でない様");
                            return false;
                        } else {
                            try {
                                targetDir.remove();
                            } catch (err) {
                                this.abortProcess(myAction + ":\n" + err);
                                return false;
                            }
                        }
                    }
                    this.pushLog(myAction + " : " + targetDir.fsName);
                } else {
                    this.showMsg("フォルダ " + targetDir.fsName + " は無い様");
                    this.pushLog(myAction + " : " + targetDir.fsName + "cannot remove");
                }
                break;
            case    "changeDir":
                if (!this.myInstall[idx][1]) {
                    Folder.current = new Folder(this.replacePath.source);//ソースフォルダに戻る
                } else {
                    Folder.current = new Folder(this.myInstall[idx][1]);
                }
                this.pushLog(myAction + " : " + Folder.current.fsName);
                break;
            case    "copyFile":
                if (this.myInstall[idx][0] == "cp") {
                    var destFile = new File(this.pathReplace(this.myInstall[idx][1]));
                    var targetFile = new File(this.pathReplace(this.myInstall[idx][2]));
                } else {
                    var destFile = new File(this.pathReplace(this.myInstall[idx][0]));
                    var targetFile = new File(this.pathReplace(this.myInstall[idx][1]));
                }
                if ((destFile.exists) && (!targetFile.exists)) {
                    if (destFile.name.match(/\.jsx?$/)) {
                        this.pushLog(myAction);
                        this.pushLog("file copy with WordReplace :");

                        //include 置換コピー
                        if (this.debug) {
                            alert(destFile.fsName + " を " + targetFile.fsName + " に置換コピーした気分");
                        } else {
                            try {
                                if (!this.copyScriptWithReplace(destFile, targetFile)) {
                                    this.abortProcess(myAction + ":\n" + err);
                                    return false;
                                }

                            } catch (err) {
                                this.abortProcess(myAction + ":\n" + err);
                                return false;
                            }
                        }
                    } else {

                        //単純ファイルコピー
                        if (this.debug) {
                            alert(destFile.fsName + " を " + targetFile.fsName + " にコピーした気分");
                        } else {
                            try {
                                destFile.copy(targetFile)
                            } catch (err) {
                                this.abortProcess(myAction + ":\n" + err);
                                return false;
                            }
                        }
                        this.pushLog("file copy :" + destFile.fsName + " > " + targetFile.fsName);
                    }
                } else {
                    this.showMsg("ファイル\n" + destFile.fsName + " : " + targetFile.fsName + "\nを確認しましょう。");
                }
                break;
            case    "renameFile":
                var destFile = new File(this.pathReplace(this.myInstall[idx][1]));
                var targetFile = new File(this.pathReplace(this.myInstall[idx][2]));

                if ((destFile.exists) && (!targetFile.exists)) {

                    //ファイルをコピーして元ファイルを消去
                    if (this.debug) {
                        alert(destFile.fsName + " を " + targetFile.fsName + " に移動した気分");
                    } else {
                        //Adobeスクリプトにmoveメソッドは無いので、copy + remove にする。
                        try {
                            if (destFile.copy(targetFile)) {
                                destFile.remove();
                            }
                        } catch (err) {
                            this.abortProcess(myAction + ":\n" + err);
                            return false;
                        }
                    }
                    this.pushLog(myAction + " :" + destFile.fsName + " > " + targetFile.fsName);
                } else {
                    this.showMsg("ファイル\n" + destFile.fsName + " : " + targetFile.fsName + "\nを確認しましょう。");
                    this.pushLog(myAction + " : (error) " + destFile.fsName + " > " + targetFile.fsName);
                }
                break;
            case    "deleteFile":
                var targetFile = new File(this.pathReplace(this.myInstall[idx][1]));

                if (targetFile.exists) {
                    if (this.debug) {
                        alert(targetFile.fsName + " を削除した気分");
                    } else {
                        try {
                            targetFile.remove();
                        } catch (err) {
                            this.abortProcess(myAction + ":\n" + err);
                            return false;
                        }
                    }
                    this.pushLog(myAction + " : " + targetFile.fsName);
                } else {
                    alert(targetFile.fsName + " は無い様");
                    this.pushLog(myAction + " : " + targetFile.fsName + "is not exists.");
                }
                break;
            case    "doFunction":
                try {
                    var myResult = (this.myInstall[idx][0](this.myInstall[idx][1]));
                    if (!myResult) {
                        return false;
                    }
                    this.pushLog("do userFunction");
                } catch (err) {
                    this.abortProcess(myAction + ":\n" + err);
                    return false;
                }
                break;
            default:
                this.abortProcess(myAction + ":\n" + this.myInstall[idx].toString());
                return false;

        }
    }
    /**
     * @desc アンインストールとインストールは、
     * 実行するコマンド配列が異なるだけで同じ関数で処理される
     */
    return true;
};

/**
 * @desc ここで設定ファイルを読み込んで実行
 */

//	alert(decodeURI(Folder.current.name));
myOpenFile = new File(thisDataFileName);
myOpenFile.open("r");
var setting = myOpenFile.read();
myOpenFile.close();
if (setting) {
    eval(setting);
    //	アプリケーションの言語環境を取得locale一本じゃダメー

    /**
     * app.locale PhotoshopCS2以降
     * app.language AfterEffect6.5以降(6.0もいけるかも?)
     * PhotoshopCS 7 の言語環境取得方法が今のところ不明
     * JPの確認だけならFolder.startupの内容を見る手はあるけどそんなもん書きたくない。
     * ひとまず無視して進めることに
     */

//================================================================(syetemCheck)
    if (!(app.name.match(nas_Installer.myAppRegExp)) || !(app.version.match(nas_Installer.myVersionRegExp))) {
        var stopInstall = true;
    } else {
        var stopInstall = false;
    }
//====================================================================(install)

    if (stopInstall) {
//中断表示
        var msg = "\n=====================\nこの環境ではインストールできないようです。\nアプリケーションやバージョンを確認してから再度実行してみてください。";

        alert(app.name + " / " + app.version + msg);
    } else {

        /**
         * @desc インストール先の存在を確認してインストール済ならば、
         * アンインストールモードにする。
         * @type {Folder}
         */
        myInstallLocation = new Folder(nas_Installer.replacePath.install);
        myInstallDataFile = new File(nas_Installer.replacePath.install + "/" + thisDataFileName);
//	インストールパスとソースパスが一致していたらアンインストールなのでユーザに確認

        /**
         * インストール先のパッケージ名が
         */
        if ((myInstallLocation.exists) && (myInstallDataFile.exists)) {
            nas_Installer.job = "uninstall";
        }


        /**
         * @desc 実際のインストール処理
         */
        switch (nas_Installer.job) {
            case    "uninstall":
                myResult = nas_Installer.doInstall("uninstall");
                break;
            case    "install":
            default    :
                myResult = nas_Installer.doInstall("install");
                break;
        }
        if (!myResult) {
            nas_Installer.pushLog("aborted");
        }
    }
} else {
    nas_Installer.abortProcess("インストール設定がないっぽい…");
}

if (nas_Installer.isShutdown) {
    nas_Installer.pushLog("user select shutdown Application")
}

nas_Installer.pushLog("log close :" + new Date().toString());
if (myInstallLocation.exists) {
//		インストール終了時は、フォルダあり
    var myLogFile = new File(nas_Installer.replacePath.install + "/install.log");
} else {
//		アンインストールの際はフォルダがないのでソースパスに保存
    var myLogFile = new File(nas_Installer.replacePath.source + "/install.log");
}
if (new Folder(myLogFile.path).exists) {
    myLogFile.open("w");
    for (var idx = 0; idx < nas_Installer.installLog.length; idx++) {
        myLogFile.writeln(nas_Installer.installLog[idx].toString());
    }
    myLogFile.close();
}
//ログファイルをインストール先に(上書きで?)残して終了
//シャットダウンフラグがあればシャットダウンして終了
if (nas_Installer.isShutdown) {
    applicationShutdown();
}