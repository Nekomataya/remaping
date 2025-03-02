﻿/**
 * @fileoverview psAxe include function
 */

/**
 * この関数は、CSX環境下では不要
 * @param arg
 * @returns {Object}
 */
function getApplicationResult(arg) {
    return eval(arg);
}


if (typeof app.nas == "undefined") {
    var myInstallFolder = Folder.userData.fullName + "/nas";
    /**
     * @desc すでに１回以上インストールされている場合は選択的にインストール・アンインストールを行う
     */
    if (!(File(myInstallFolder).exists) || !(File(myInstallFolder + "/lib/nas_psAxeLib.js").exists)) {
        alert(localize({
            en: "Installation is not complete.\nPlease complete the installation in the upper left corner of the ax icon of panel",
            ja: "インストールは完了していません\nパネルの左上の斧アイコンでインストールを完了して下さい"
        }));
        //$.evalFile("psAxe/scripts/psAxeSplash.jsx");

    } else {
        /**
         * @desc ここでnasオブジェクトの初期化を行う、
         * 同様のinitializeをCSX環境下ではnas(u)PsAXE.xml内部に書き込む
         */

        /**
         * Photoshop用ライブラリ読み込み CS6以降　初期化専用
         * @type {Array}
         */
        var includeLibs = [];//読み込みライブラリを格納する配列

        /**
         * iclude nasライブラリに必要な基礎オブジェクトを作成する
         * @type {Object}
         */
        var nas = {};
        nas.Version = {};
        nas.isAdobe = true;
        nas.axe = {};
        nas.baseLocation = new Folder(Folder.userData.fullName + "/nas");
        var nasLibFolderPath = nas.baseLocation + "/lib/";
        
        /**
         * @desc ライブラリのロード　CS6-CC用
         * ライブラリを登録して事前に読み込む
         *
         * includeLibs配列に登録されたファイルを順次読み込む。
         * 登録はパスで行う。(Fileオブジェクトではない)
         * $.evalFile メソッドが存在する場合はそれを使用するがCS2以前の環境ではglobal の eval関数で読み込む
         * ＝＝＝　ライブラリリスト（以下は読み込み順位に一定の依存性があるので注意）
         * config.js        一般設定ファイル（デフォルト値書込）このルーチン外では参照不能
         * nas_common.js        AE・HTML共用一般アニメライブラリ
         * nas_GUIlib.js        Adobe環境共用GUIライブラリ
         * nas_psAxeLib.js    PS用環境ライブラリ
         * nas_preferenceLib.js    Adobe環境共用データ保存ライブラリ
         *
         * nasXpsStore.js    PSほかAdobe汎用XpsStoreライブラリ(AE用は特殊)
         * xpsio.js        汎用Xpsライブラリ
         * mapio.js        汎用Mapライブラリ
         * lib_STS.js        Adobe環境共用STSライブラリ
         * dataio.js        Xpsオブジェクト入出力ライブラリ（コンバータ部）
         * fakeAE.js        中間環境ライブラリ
         * io.js            りまぴん入出力ライブラリ
         * psAnimationFrameClass.js    PS用フレームアニメーション操作ライブラリ
         * xpsQueue.js        PS用Xps-FrameAnimation連携ライブラリ
         */

        /**
         * @type {*[]}
         */
        includeLibs = [
            nasLibFolderPath + "config.js",
            nasLibFolderPath + "nas_common.js",
            nasLibFolderPath + "nas_GUIlib.js",
            nasLibFolderPath + "nas_psAxeLib.js",
            nasLibFolderPath + "nas_preferenceLib.js",
            nasLibFolderPath + "nas_axeEventHandler.js",
            nasLibFolderPath + "nas_locale.js",
            nasLibFolderPath + "messages.js",
            nasLibFolderPath + "psCCfontFix.js"
        ];
//==============================　Application Objectに参照をつける
        
        app.nas = nas;
        bootFlag = true;
        /**	
         * @desc ライブラリ読み込み
         * ここで必要なライブラリをリストに加えてから読み込みを行う
         * includeLibs.push(nasLibFolderPath+"psAnimationFrameClass.js");
         */
        includeLibs.push(nasLibFolderPath + "nas.XpsStore.js");
        includeLibs.push(nasLibFolderPath + "xpsio.js");
        includeLibs.push(nasLibFolderPath + "mapio.js");
        includeLibs.push(nasLibFolderPath + "lib_STS.js");
        includeLibs.push(nasLibFolderPath + "dataio.js");
        includeLibs.push(nasLibFolderPath + "fakeAE.js");
        includeLibs.push(nasLibFolderPath + "io.js");
        includeLibs.push(nasLibFolderPath + "xpsQueue.js");

        for (prop in includeLibs) {
            var myScriptFileName = includeLibs[prop];
            //$.evalFile ファンクションで実行する
            $.evalFile(myScriptFileName);
        }
//=====================================保存してあるカスタマイズ情報を取得
        nas.readPreference();
        nas.workTitles.select();
//=====================================startup

    }
} else {
    nas = app.nas;
}

//+++++++++++++++++++++++++++++++++初期化終了