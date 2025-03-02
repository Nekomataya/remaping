readme.txt
=========================================================================MAP/XPS　自動ビルド試験中

2009/10/28 Nekomataya/kiyo

ただいま自動ビルドの実装中です。ご意見ご感想お聞かせいただくと幸いです

長らく懸案だったタイムシートベースの自動ビルドをやっております。
実は自分のところで必要になりました。
そこそこ動くものにしておいて、後は使いながら様子を見て行こうかと考えております。

nasライブラリは、自動ビルド対応のための拡張が行なわれております。
以前のライブラリに依存したコードも一応は動作可能なはずなのですが、
誤動作等に遭遇なされた方はお知らせいただければできる限り対応させていただきます。


今回は
	「タイムシートを先に記述してからカットをビルド」
		と
	「機能はなるべくオブジェクトのメソッドで部品化」

を主眼において開発してます。
XPSタイムシートの拡張を見越してコードが書かれておりますので、部分的に冗長な構成に感じられる部分があるかと思いますがご勘弁ください。

タイムシートは従来どおり XPS AERemap T-Sheet STS のシートが利用可能です。

使い方

従来のカットフォルダにあらかじめタイムシートを記述してファイルで保存しておいて下さい。
タイムシートの保存位置は限定されていません。カットフォルダの配下であればどの位置でもかまいませんが
標準構成として "(カットフォルダ)/_etc/" または "(カットフォルダ)/_timesheet/" をお勧めします。


フォルダ構成は、デフォルトでもかなりのケースに対応可能だと思いますが、必要に応じて設定ファイルを書き換えてご対応ください。
（設定ファイルの記述は後述）

プロジェクトは、可能なかぎりビルド開始時に空のプロジェクトにしておいてください
全体の自動ビルドを重複して行なうと、アイテムの状態によっては現在の構成（アイテム配置）が壊れることがあります。


素材が準備できたらサンプルスクリプトの"00buildAll.jsx"を実行して、カットフォルダの位置を指定してください。
以下の操作が順次実行されて自動ビルドが行なわれます

１素材インポート
	再帰検索でフッテージを取得します
２振り分け
	プロジェクトアイテムをパスを頼りに振り分けてフォルダアイテムに分類します。
３シート読み込み
	最初に指定されたフォルダの下を再帰検索して発見した全てのタイムシートをプロジェクトに読み込みます。
４MAPビルド１
	タイムシートの構築にMAPグループを空のコンポとして作ります。
	たとえばＡ〜Ｄセルがシートにあれば４つの空のコンポを作成してＡ〜Ｄと名づけて必要なセル数分のフレームに調整します。
５MAPビルド２
	フッテージ群の中からＢＧであると思われるものを抽出。継続時間１フレームでBG素材としてMAPグループにエントリーします。
	これは、現在のタイムシートのＢＧ記述部の仕様が不定なための措置です。
	BGは置き換えが少ないために、記述自体が省略されることが多いこともあり
	現状　「そこにあるＢＧは全てとり込み」でやってます。
６MAPビルド３
	MAPのエントリごとにフッテージを検索してファイル名とパスから、そのグループに合致すると思われるフッテージを選び
	MAPコンポに登録します。
	このとき、実際の素材にあわせてサイズおよびフレーム数の調整が行なわれます。
７ステージ構築
	タイムシートの数だけ、ステージを作ります
	タイムシートの長さのコンポを作り、ＢＧとセルを登録。
	素材の最大サイズにコンポを設定してタイミングの適用を自動で行ないます。

	カメラレイヤの設定・カメラコンポ作成・最終サイズのボールド付きコンポなどを
	ステージ構築の最後に自動処理で行なうことができます。
	タイムシート内にカメラワークの記述を拡張してカメラワークもグループエントリーとして扱うよう準備中です。

	
自動ビルドに必要な機能は各機能ごとのモジュールとなっているため、作業形態や作品ごとにカスタマイズして別途利用することが可能です。
各機能の使用サンプルは以下のスクリプトをご覧ください

サンプルの実行はnasのスクリプトランチャーでtools/オートビルダ試験/ と階層をたどっていただくと便利です
スクリプトソース内にコメントがありますので、そちらもご参照ください。
 

00．一括ビルド
	手順参考です。
	実行するとフォルダを指定するダイアログが開きます。
	カット素材のあるフォルダを指定するとインポートおよびタイムシートがあればシートに従ったビルドが自動的に行われます。

以下は、各手順ごとにファイルを機能を分割してそれぞれの機能に対する解説を加えたファイルです。
ご自身のスクリプトに機能を組み込む参考にして下さい。


01．素材インポート
	指定フォルダ配下のファイルを再帰検索して素材らしきファイルを自動でインポートします。
	nas.importFilter を使用して必要と考えられる素材をピックアップしています。
	この変数を書き直すことで不要なファイルを除外したり、サイトに特有なファイルをインポートすることが可能です。
	編集は　nas/lib/nas_Otome_config.js　を直接書き換えてください。

02．素材振り分け
	指定(選択)されたフッテージをフッテージ格納フォルダに振り分けます。
	指定ファイルがない場合はRootフォルダのAVアイテムを対象とします。
	設定ファイルにしたがって背景・レイアウト・セル・原画等に分類が行なわれます。
	振り分けはファイル名およびファイルパスで行なわれます。
	あやしい動作を発見した方はお知らせいただくか、ご自身でフィルタの調整をお願いいたします。
	編集は　nas/lib/nas_Otome_config.js　を直接書き換えてください。

	振り分けルーチン内で「素材格納フォルダ」と「[MAP]フォルダ」の作成が行なわれます。

　　素材格納フォルダ作成
	あらかじめ与えられた設定にしたがって、素材格納フォルダを作ります。
	デフォルトでは以下のフォルダができる
		[footages]
			|- _bg  	背景フォルダ "_bg/(BGフォルダ)" 配下にあれば自動登録
			|- _etc 	各種素材フォルダ(タイムシートはここ)
			|- _frame	フレーム設定フォルダ
			|- _lo  	レイアウト格納フォルダ　"_lo/(レイアウトフォルダ)"配下にあれば自動登録
			|- _paint	セル格納フォルダ　"_paint/(セルフォルダ)"配下にあれば自動登録
			|- _other	分類に失敗したアイテムをこの直下に移動します
			---------------------------この下現在は標準では作成していません　将来の拡張用です
			|- _sound	(予約)
			|- _system	(予約)
			|- _lough	(予約)ラフ原用
			|- _key　	(予約)原画用
			|- _draw(ing)	(予約)動画用


　　[MAP]フォルダ作成
	タイムシート情報を参照してバルクマップを作成します。
		[MAP]
			|- [CAMERAWORK]	カメラワークフォルダ
			|- [CELL]	セルグループフォルダ　＜現在はこのフォルダのみ使用しています。
			|- [EFFECT]	撮影効果フォルダ
			|- [SOUND]	サウンドフォルダ
			|- [SYSTEM]	システム使用

		マップの[CELL]フォルダにはファイルフッテージの素材全てがコンポの形で格納されます。
		[CELL]配下のコンポはコンポひとつがエレメントグループひとつに相当。
		コンポのフレームがエレメントIDに相当します
		エレメント名は作成の必要があればテキストレイヤの形で与えられる（未実装）
		一般的なアニメ撮影業務で「セルコンポ」と呼ばれるものだとお考えください。ほぼ同じです
		フォルダ作成時点では、タイムシートにあるタイムラインラベルを参照して同数のコンポを作成します。
		初期状態ではタイムシートに記載のサイズで１秒の継続時間レイヤのエントリは未解決（空っぽ）です
		現在のタイムシート仕様では背景の解決ができませんので背景用のコンポはグループビルド１で仮に解決します。仮実装です

03．タイムシートインポート
	コンポ内にタイムシートを読み込み、同時にXPSバッファを更新します。
	複数ファイルも指定できます。

	サンプルとは別に指定フォルダの再帰検索でタイムシートファイルが存在する場合は全て取り込むメソッドもあります。
	
	タイムシートは、タイムシート格納用コンポジションをフッテージ格納フォルダアイテム配下に格納用コンポを作ってこれにテキストレイヤの値として取り込みます
	ファイル名・ファイル更新日時・ファイルサイズ　をファイル識別情報としてレイヤコメントに記録してあります。

04．グループビルド１(ＢＧ・ＢＯＯＫ)
	フッテージ格納フォルダ/背景格納フォルダ内　のフッテージからタイムライングループを作成してエレメントを登録します。
	「背景プリコンポ」ができます。
	本来はタイムシートから作成すべきですが、現在タイムシートの背景記述が標準化できていないので、
	ここでタイムライングループを作ります。
	psdファイルがコンポとして読み込まれている場合は、そのコンポをグループとして扱い、ファイルのレイヤを格納したフォルダを
	フッテージとして背景フッテージフォルダへ移動します。

	背景素材のあるだけタイムライングループを作成するので従来作業よりも構成が冗長になる場合があります。

05．グループビルド２（ＣＥＬＬ）
	フッテージ格納フォルダ/セル格納フォルダ内のフッテージをタイムライングループに割り付けます。
	「セルコンポ」ができます。
	キー抜きのみ処理済　スムージングはここでも可能　あとでも可能

06．グループビルド３(未実装)
	フッテージ格納フォルダ/レイアウト格納フォルダ　/フレーム格納フォルダ　内のフッテージをタイムライングループに割り付けます。
	「カメラ参照コンポ」ができます。
07．グループビルド４(未実装)
	タイムシートを参照してエフェクトタイムライングループを作成します。
	「エフェクト参照コンポ」ができます。

08．ステージ生成
	XPS.mkStage() メソッドをコールすると、[CELL]フォルダ内のコンポをタイムシートに合わせて登録したコンポを作成します。
	コンポ継続時間はタイムシートの長さにあわせ、指定がない限り使用するフッテージの最大サイズのコンポを作ります。
	タイムラインの適用は行ないませんが、このビルドの直後に以下の手順を実行するとタイムラインの適用が行なえます。
	二度目以降のコールでは、別の名前を指定しない限りtake2-3　とテイクナンバーが追加されて新しいステージが生成されます。
	戻り値は生成されたステージコンポです。
	クリッピングターゲット(カメラ)オブジェクトは作成されません。あとで必要に応じて作成してください。

09．タイムライン適用
	タイムライン(タイミング)はCompItemのメソッドとして実行されます。
	CompItem.applyXPS(Xps)をコールすると、引数で指定したXPSのタイミングがコンポに適用されます。
	引数を省略した場合は、標準のXPSまたはプロジェクト内のタイムシートのうち
	コンポの名前とマッチしたタイムシートの内容が適用されます。
	二度目以降の適用は、以前のタイムリマップを全て消去して新しいタイミングを適用しなおします。


10．クリップターゲット（カメラレイヤ）配置
	CompItem.addClipTarget()メソッドをコールすると
	クリップターゲット（カメラ）レイヤを最上段に追加します。
	プロジェクト内に流用可能な平面があれば、それを使用します。
	カメラのサイズは引数または、入力メディアDBから取得します。
	ターゲットを作成した際に同時にターゲットを参照するコンポ(通称「カメラコンポ」)を作成しています。

入力メディアDBは　nas.inputMedias　オブジェクトです。
	選択を切り替えるにはnasPref.jsxスクリプトを使用するか、
	またはnas/lib/nas_Otome_config.js　を直接書き換えてください。

11．クリップコンポを作る
	クリップターゲットのあるコンポのCompItem.mkClipWindow()メソッドをコールすると
	ステージをクリップするコンポを作成します(通称「カメラコンポ」)
	10.のスクリプトの最後の機能の単独抜き出しです。クリップコンポの数は制限されません。
	クリップコンポを作る際に定形処理を行うことができます。
	オプションでボールドを追加します。(ボールドのテンプレートの位置は要調整？)

12．出力コンポを作る
	クリップコンポに対してCompItem.mkOutput()メソッドをコールすると、出力用のコンポが
	ボールド付きで生成されます。
	生成時に定形処理を行うことができます。

出力メディアDBは　nas.outputMedias　オブジェクトです。
	選択を切り替えるにはnasPref.jsxスクリプトを使用するか、
	またはnas/lib/nas_Otome_config.js　を直接書き換えてください。



タイムシートアクセスに関して

	タイムシートは、標準状態では　/[footages]/_etc/[timesheetBinder]　コンポにテキストレイヤとして格納されます。
	スクリプト上は nas.XPSStore　オブジェクトとして操作可能です。

	タイムシートのアクセスは可能な限りスクリプトを介して行なってください。

/* XPSStore　(シートトレーラ)
	XPSheetStore オブジェクト
	プロジェクト内部にタイムシートを複数記録維持して切り換えて使用するためのオブジェクトです。
	フッテージストア内部にコンポの形で記録しています。
	オブジェクトにはインデックスがあり、IDを切り換えてバッファとやりとりを行います
	バッファはXPS(=従来のXPSオブジェクト)をそのまま使用しています。

XpsStore.body		実際にシートを格納してあるコンポ
			コンポの下にはテキストレイヤを置いてXPSテキストを置く改行は"\\r\\n"に置換

XpsStore.selected	カレントのタイムシートレイヤをさす。カレントがない場合もあるその場合はnull または　false
			デフォルトの値ではnullレイヤが存在する場合はfalseを与える

メソッド
XpsStore.getLength()	シート総数を返す
XpsStore.get(index)	indexで指定されたレイヤからXpsオブジェクトを取得
XpsStore.set(index,Xps)	indexで指定されたレイヤにXpsオブジェクトを登録する
XpsStore.pop(index)	indexで指定されたシートのデータをXPSバッファに転送する。

XpsStore.push(index)	indexで指定されたシートにXPSバッファのデータをセットする。内部でsetInfo()を実行する。
			indexが指定されなければカレントのシートに対して実行
XpsStore.pop(index)	indexで指定されたシートのデータをXPSバッファに転送する。
			indexが指定されなければカレントのシートに対して実行
XpsStore.select(index)	カレントインデックスを切り替える。戻り値は選択されているシートのインデックス。

XpsStore.getInfo(index)	指定indexのシートのモディファイド情報を取得
			戻り値は情報オブジェクト
			indexが指定されなければカレントのシートに対して実行
XpsStore.setInfo(index)	指定indexのシートに現行のXPSバッファのモディファイド情報を設定
			indexが指定されなければカレントのシートに対して実行
			戻り値は情報オブジェクト
XpsStore.add(Xps)	Xpsオブジェクトを直接渡して新規にシート(テキストレイヤ)を作成する。
			XPSバッファを同時更新
			カラ指定の場合はXPSバッファから作成
			既存シートとの重複は関知しないのであらかじめ確認は必要
XpsStore.remove(index)	指定indexのシートをプロジェクトから削除する。インデックスは必ず指定すること。

XpsStore.setBody()	内部で使用するメソッド、ライブラリを参照してbodyを自身のオブジェクトとして再設定する
			設定済みの場合は何もしない。外部アクセス禁止

XpsStore.initBody()	内部で使用する初期化メソッド
			カラのトレーラを作るので注意

XPSStoreオブジェクトが使用可能か否かは以下のようにgetLengthメソッドをコールして確認してください。

		if(isNaN(nas.XPSStore.getLength())){return;}

タイムシートにアクセス可能な場合は、現在使用可能なタイムシートの数が整数値（0の可能性もある）でもどります。
それ以外の　false/null 等が帰る場合は何らかの形でシートが使えない状態にありますので、シート操作をしないでください。


またXPSStoreオブジェクトの直接操作は、わりとめんどうなので以下のメソッドをご利用ください


		タイムシート読み込み

============================================================
nas.otome.loadXPS(targetFile)

	引数:	File or [File,File..] ターゲットのファイルオブジェクトまたはその配列
	戻値:	読み込み(またはアップデート)成功したXPSオブジェクトの数

	与えられたXPSファイルを読み出して、Root/[footages]/_etc/[timeSheetBinder]　コンポへ登録する
	プロジェクト内では所定のコンポ内へテキストレイヤのソーステキストとして保存する
	テキストレイヤのコメントデータとして、
		オリジナルファイルのサイズ
		オリジナルファイルのパス
		最終更新日付
	を維持して、いずれかが変更されたとき　内容変更の確認が可能なようにしておく
	ファイルがすでに読み込まれていて、かつ変更されていない場合は読み込みをスキップする

新メソッドでは、ビルドに先立ってXpsオブジェクトが必要なのでMAPビルドに先行して何らかのXPSを初期化する必要がある
読み込んだだけではデフォルトのXPSバッファが初期化されないので、この関数のあとに以下のように初期化操作が必要

nas.XPSStore.select(1);//スタック内のシート１番を選択状態にしてXPSを１番シートの内容に置き換える

nas.XPSStore.select(0);//スタックの選択を解除するXPSの内容は置き換えない

		タイムシート読み込み�U
============================================================
nas.otome.getXPSheets(Folder)

	引数　:Folder　検索の基点フォルダ
	戻値	:読み込んだシートの数

	与えられたフォルダを基点として再帰検索を行い発見したタイムシートをプロジェクトに取り込む
	すでにプロジェクト内にあるシート、現在のシートと異なっている場合のみ上書きで読み込む。

タイムシートの切り替えには、簡易XPSリンカを使用するかまたは　XPSStoerオブジェクトのselect()メソッドをご使用ください。

=====================================================================================================
設定ファイルのカスタマイズ

設定ファイルを"nas/lib/nas_Otome_config.js"として分離しました。
設定内容をカスタマイズする場合はこの内容を書き換えてください。

細かい書き換え方法はスクリプト内部のコメントをご参照ください
ここでは各設定の概要を説明します。

	nas.ftgFolders
フッテージふりわけの基礎情報です
ディスク上ここに登録された名前のフォルダに格納されたファイルはそれぞれの種別に分類されます。
配列として列記してある値は、これらの名前全てを認識します。
プロジェクト内では、配列の一番先頭の名前のフォルダアイテムを作成してそこに振分を行ないます

	nas.sheetBinder
タイムシート保存用のコンポの名前です
特に必要ない限りは書き換えないようお願いいたします

	nas.mapFolders
MAPグループを格納するためのデータベースです
プロジェクト内のフォルダアイテムの名前を定義しています
特に必要ない限りは書き換えないようお願いいたします

	nas.importFilter 
インポート制限をかけるための正規表現オブジェクトです
現状は拡張子の羅列です。素材の制限に使われています

そのほか各種の正規表現フィルタがあります

	作画フレームDB	nas.inputMedias
素材サイズと解像度のデータベースです
カメラレイヤを作成する場合などに参照しています。
エントリを追加するには、データをpushメソッドで加えてください。
追加直後はそのデータが選択状態になります。

データを切り替えるには　
nas.inputMedias.select(index) メソッドで切り替えます

	出力メディアDB	nas.outputMedias
出力メディアのデータベースです
出力コンポを作成する場合などに参照しています。

操作方法は作画フレームDBに準じます


作画フレームDBと出力メディアDBは、nasライブラリの初版から存在するので切り替えのために
nasPref.jsx　スクリプトを使用することも可能です。



