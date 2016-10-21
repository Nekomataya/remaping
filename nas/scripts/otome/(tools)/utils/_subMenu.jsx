﻿/*(便利) *	このスクリプトは、NasMenu.jsx のサブスクリプトです。 *	このスクリプトの名前を変更しないでください。 * *	このファイルのあるフォルダをコマンドランチャーに登録したい場合は、 *	一行目の /\/\/no\ launch$/ を削除してボタンラベルが第一行目になる様にしてください。 *	この行があるとランチャーはそのフォルダを無視します。 * *	ボタンラベルはこのフォルダに対するボタンラベルと置き換えます。 *	初期値のままの場合は、フォルダ名がボタンラベルとして登録されます。 *///	ボタンパレットのサイズ	nas.ToolBox.buttonColumn=1;//ボタン列数	nas.ToolBox.buttonWidth=2;//ボタン幅	nas.ToolBox.buttonLineMax=20;//ボタン列数/*		以下で設定されたアイテムはパレットの上方に並びます。		参考書式にしたがってお好きなアイテムを登録してください。		フォルダ内のファイルは自動で登録されます。 *//* ***********		ユーザ登録のファイルは以下のエリアを書き直してください		********* *//* *	メニューアイテムを登録できます *	書式	[buttonLabel,scriptDir,scriptName] or [Label,function] or [Folder] * *	[ボタンラベル,スクリプトのディレクトリ,スクリプト名]	スクリプトボタンを登録 *	[ボタンラベル,ファンクションオブジェクト]	ファンクションボタンを登録 *	[フォルダオブジェクト]	サブパレットにするフォルダを登録 * * *	特定のフォルダをサブパレットのベースフォルダとして登録できます。 *	サブパレットフォルダのファイルは検索されてサブパレットに登録されます。 *	サブパレットにフォルダ外のスクリプトやアイテムを登録する場合は、 *	サブフォルダ内に .SubMenu.jsx をコピーして編集してください。 *	引数は["サブパレットフォルダ"] *	サンプルは、デモスクリプトフォルダです。Folder.startupを使って指定します。 *	ボタンタイトルはプロパティとして設定してください。設定のない場合はフォルダ名が使用されます。*/// nas.ToolBox.ItemList.push(Folder(Folder.startup.path.toString()+"/"+Folder.startup.name.toString()+"/Scripts/(demos)"));// nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btTitle="デモスクリプト"; nas.ToolBox.ItemList.push(Folder(Folder.nas.fullName+"/scripts/otome/(actions)")); nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btTitle="アクションフォルダ"; nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btIcon=nas.GUI.systemIcons["cabinet"]; nas.ToolBox.ItemList.push(Folder(Folder.nas.fullName+"/scripts/otome/(ffx)")); nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btTitle="テンプレートフォルダ"; nas.ToolBox.ItemList[nas.ToolBox.ItemList.length-1].btIcon=nas.GUI.systemIcons["template_f"];/* *			スクリプトをボタンに登録 *	引数は配列 [buttonLabel,スクリプトのディレクトリ,スクリプトファイル名] / [ボタンラベル,関数オブジェクト] */// nas.ToolBox.ItemList.push(["ほげほげ","/Users/hoge/myScripts/","ほげほげ.jsx"]);/* *	関数を直接指定してコマンドボタンを登録 *	引数は配列 [buttonLabel,function] / [ボタンラベル,関数オブジェクト] */// nas.ToolBox.ItemList.push(["close",function(){this.parent.close();}]);//パレットを閉じるボタン/* * *	アイテムは、書いた順にパレットの上から並びますので、順番のコントロールに使っても良いでしょう。 * */