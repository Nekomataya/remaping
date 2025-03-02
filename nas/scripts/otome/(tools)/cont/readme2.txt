絵コンテ分解プロジェクト

インストール
配布パッケージを解凍して得られたファイルを
Scripts/nas/(tools)/cont/
以下に保存してください。

使用時は、NasMenu または NasMenuII から使用します。

簡単な使い方
1.
絵コンテをスキャンした画像データを準備してください。

印刷のことを考えると切り出し一コマの横幅が 640px 〜 720px程度になるようにするのが望ましいです。
(図版)

サンプルの A4 コンテ用紙の場合は200dpiでスキャンしてあります。
(図版)

2.
切り出しの精度を上げる為に絵コンテのデータをスタビライズして位置揃えをしてください。
(図版)

位置揃えの方法には以下のようなモノが有ります。

(図版)
スキャンソフトにOCR用の位置揃え機能がある

(図版)
スキャン時に(タップ・角合わせ等)物理的な位置揃えをする

(図版)
AEのスタビライズ機能をつかう
AEのモーショントラック機能を使用した位置合わせが、テンプレート(サンプル)データに含まれています。
この機能を使用する場合はご参照ください。


スタビライズは、どのような方法でも構いません。
また極端な場合としては 「少々傾いていても平気」ならば、位置揃え自体を省略してもOKです。

3.
AEを開いて ランチャーメニューを (tools)>コンテ分解 とたどってください。
このメニューにすべての機能が含まれています。

以下メニュー解説

	テンプレートを開く/001openTemplate.jsx
絵コンテ分解用のマスタープロジェクトを開きます。
サンプルデータが入っていますので、操作練習などを行えます。
本番は、このサンプルデータを差し換えて作業してください。

	フッテージ置き替え/002replaceFootage.jsx
編集する絵コンテデータを差し換えます。
プログラムの指示にしたがって操作してください。

	スタビライズガイド/003motionTrack.jsx
AEのモーショントラック/スタビライズ機能を使用して画像スタビライズを行う場合の
ガイドを表示します。スタビライズをつかったことがない人向き。

	タイトル変更/04changeTitel.jsx
絵コンテのタイトルを変更します。
この文字列がコンポ名のプレフィックスになりますので、わかりやすくあまり長くない名称をつけてください。
デフォルトでは"TITLE"なので 仕事につかうとちょっと格好わるいかも

	入力操作メニュー表示/010storyBoard.jsx 020libCont.jsx
絵コンテ情報の操作・入力メニューを表示します。
このメニューから主に絵コンテのデータ編集をおこないます。
このメニューが表示(初期化)される時に開いているプロジェクトがプログラムの操作対象なので、
絵コンテプロジェクトを開き直した場合には、メニューをいったん閉じて「再度開く」操作を行ってください。
それを行わないと操作対象をロストしてエラーが発生します。

	プロジェクト初期化/020clearProject.jsx
プロジェクト内の登録情報(キーフレーム)を削除して、情報登録前のプロジェクトに戻します。
フッテージの差し替えや差し戻しは行いません。
コンポの継続時間も変更しません。
入力したデータはすべて削除されます。

	ライカコンポ作成/090makeComp.jsx
絵コンテを分解しないでそのまま素材としてライカリールを作成する為に
カット毎のコンポをプロジェクト内に作成します。
コンテに登録された時間にきりだしたステージコンポと、ボールドを加えたカメラコンポのセットです。
必要にしたがって複製を作って保存してください。
現在の状態では、メニューを実行すると
レンダリング先のディレクトリを問い合わせして
すべてのカットに対するコンポセットをルートフォルダに作成しさらに
レンダーキューに対してカメラコンポを登録します。
中途メニューの選択肢は作成してありません。そのうち

	PS出力コンポ作成/091makeAll.jsx
通常のコンテ撮影に対応するためのPSファイルを書き出します。
使用するレイアウト用紙は、出力バッファ上で編集してください。
用紙サイズを A3/A4で切り換え可能です。用紙サイズに納まるようにフレームの回転、分割を行い
ルートフォルダに印刷1枚毎に対応した継続時間1フレームのコンポを作成し レンダーキューに登録します。


	コンテチップ書き出し/092makeCC.jsx
絵コンテのコマを コマごとに原寸・余白なしで書き出すためのコンポをルートフォルダに作成し、同時にレンダーキューに登録します

	/093clearAll.jsx
ルートフォルダにある出力用一時コンポをクリア(削除)します。この操作はコンポの削除です。
削除したコンポを登録したレンダーキューアイテムも同時に消去されます。


	ファイル名成形/100renameFile.jsx
レンダリング済の画像ファイルの末尾についている フレームナンバー"_00"を削除成形します。
レンダリング後に一度だけ実行してください。
レンダーキューでフレーム番号をつけないようにする設定がわからなかったので後付けです。
やり方知っている人がいたら私に教えてください。

末尾に番号がついていても平気ならば ほっといても害はありません。。

	ファイル振り分け/101fileDivider.jsx
レンダリング済の画像データをカット毎にフォルダを作成して振り分けます。
印刷作業等は、画像がひとつのフォルダにまとまっていた方がバッチ処理がラクなので
振り分けは必要ないかもしれません。


	XPS出力/xpsoutput.jsx
絵コンテの尺に合わせた空のXPSファイルを作成して指定のフォルダに書き出します。
あまり使い道ないです。

	(開発メニュー)/dev
この階層の下には開発用のメニューが有ります。技術資料等も有りますので興味のある方はご覧ください。


4.
プロジェクト立ち上げ

それまで編集していたデータがあれば必要に応じて保存をしてください。
メニューから「テンプレートを開く」を選択してテンプレートプロジェクトを開きます。
同時に 「絵コンテ分解/入力」メニューが表示されます。
このメニューは、このプロジェクト専用です。

テンプレートには、サンプルデータが入っています。
これを使って操作の説明をします。

5.入力のクリア
テンプレートは、開発中なので余計なデータが入っていると思います。

まずクリアします。

メニューから「プロジェクト初期化」をクリックしてください。
入力状態が初期化されます。

この操作は、後から入力したカット番号・尺・セリフ・ト書きなどのデータをすべてクリアします。
この操作を行う前に必要なデータがあれば記録を行ってください。

テキスト保存はまだありません。

プロジェクトを別名保存すると、現状のデータをすべて保存することが出来ます。
絵コンテプロジェクトはプログラムのバージョンが上がると操作不能になる可能性が有りますが、データが失われることはありません。


6
サンプルを使用してカットの入力を行ってみましょう。
プロジェクトウインドウから「03カラムコレクション」を開いてください。

コンポジションウインドウとタイムラインウインドウが開きます。

タイムラインウインドウは最小化しても構いません。
作業がラクなように配置してください

絵コンテはタテナガなので 全画面がみやすいように配置するのが良いでしょう。

入力メニュー説明
	タイトルバー
ウインドウタイトルです。
クリックするとウインドウがタイトルだけの表示になります。

	リロードボタン
パレット上の情報はときどき表示画面と一致しなくなります。(そういう仕様なので)
合わなくなったら、このボタンでパレットの表示をコンポウインドウに一致させてください。
読み込んで表示を更新するだけなのでデータの変更はありません。

	ページ
現在操作中のカラムの ページを表示しています。
変更すると「そのページの名前が変わります」(ページの移動ではありません ご注意!)

	カラム
ページ内で何番目のカラムを編集しているかを表示します。変更はできません。

	挿入ボタン
現在操作中カラムの後方に、空き領域を挿入します。
ボタンをクリックした後に出るメッセージにしたがって挿入するコマ数を指定してください。
コンポの長さが変わります。

	削除ボタン
現在操作中カラムを含めてその後方を指定数分削除します。
削除した領域はその後ろのデータが前方に移動します。
ボタンをクリックした後に出るメッセージにしたがって削除するコマ数を指定してください。
コンポの長さが変わります。

	カット番号
カット番号を3桁合わせで入力します。
日頃は自動的に増番しますので手間いらず。
A/B分割・抜け番などの場合は、手作業で入力してください。

	サブカラム番号
同じカットの何番目のカラムであるかが表示されます。
編集はできません

	オートフィットスイッチ
このスイッチの入っているカラムは、出力時にレイアウト用紙にサイズが合うように強制的に変形を行います。
絵コンテの正規位置でない場所に描かれた小さなコマなどは、スイッチを入れてください。
(図版)
スイッチが入っていないカットは、コンテ用紙の大きさから逆算していますので、絵コンテの枠に合わせて書いてあれば、印刷結果はほぼ同じです。

	移動ボタン上下(前後)
編集(入力)済のカットの間を移動します。
未編集の部分にかかると移動できなくなりますのでそこでデータを入力してください。

*タイムラインウインドウで移動を行うとコンポ内のどの時間位置にも移動可能です。
タイムラインで移動した際は、パレットの表示が更新されません。
上記のリロードボタンを使用して表示を一致させてください。

	ト書き入力
ト書き部分を入力します。
コンテ撮のためだけに絵コンテを分解する場合は、特に入力しなくても問題ないです。
入力しておくとそのうち再利用可能データとして出力可能になるでしょう

チェックボックスのチェックをはずすと、そのカラムの入力を破棄できます。

	セリフ入力
セリフ部分を入力します。
コンテ撮のためだけに絵コンテを分解する場合は、特に入力しなくても問題ないです。
入力しておくとそのうち再利用可能データとして出力可能になるでしょう

チェックボックスのチェックをはずすと、そのカラムの入力を破棄できます。

	秒数
秒数(カット尺)を入力します。
絵コンテに合わせて空白のカラムは空白のままにしておいてください。
自動で集計します。

入力形式は、nas(U) タイムコード形式ですが
ボックス入力時は、補完が行われます。
 「秒+コマ」 スタイルで入力してください。

数字のみ>秒数
.-+(空白) 秒とコマの区切り

特に".(ポイント)"は注意
小数点には なりません。(5.5 は 5+12 ではなく 5+5 に変換される )
 「秒+コマ」スタイル以外の記述はメモとして計算から除外されます。

1+12	36コマ加算
(1+12)	メモとして無視(集計されない)

入力の下のボックスはそのカットまでの累計時間です。

	ページ移行ボタン
編集点を次のページに進めます。
カットの変更はしません。

ページの下端のコマで次のページの冒頭が次のカットだった場合は下記の
「NEXT」ボタンで進めてください


	カラム追加ボタン
現在のカットに次のコマを追加
現在のカットを保持して次のカラムに移動します。
ページの下端のコマでクリックすると次のページへ自動的に進みます。

	次カットボタン
入力を次のカットへ進める
次のカットへ進んで、コマを移動します。
ページの下端のコマでクリックすると次のページへ自動的に進みます。

カット番号は自動で[+1]で登録されますので、A/B分割 抜け番などの場合は
自分で編集してください。
その次からは数字部分だけをみてまた[+1]で増番が続きます。

	閉じるボタン
ウインドウを閉じます。プロジェクトは閉じません。

	移動スライダ
上下移動ボタンと同じ範囲をスライダで移動できます。

	インデックス
インデックスは「 現在のコマ数/全登録コマ数 」が表示されています。
編集はできません。

===以下技術編へ移動
テンプレートプロジェクトには、10枚ほどのサンプルデータと絵コンテを構造化データにする為のエクスプレッションが入っています。

データの構造は次のようになっています

	00スタビライズ
基礎コンポーネントです。
分解する絵コンテをこのコンポに登録します。
スタビライズが必要な場合は、このコンポ上でスタビライズが終了しているようにしてください。

	01用紙登録
絵コンテの画像位置を登録します。
ここで登録した位置を参照して半自動割り付けを行います。

この半自動割り付けを正確に行う為には、データのスタビライズを行っておくのが望ましいです。


	02ページコレクション
絵コンテ1ページを1フレームとして展開するコンポーネントです。
このコンポ上でページに名前をつけることが可能です。
ページインデックスは、なにもしなければ 3桁揃えで0からのフレーム番号と一致します。
コンポ上のPageIndexレイヤのソーステキストにキーを作って名前を与えるとそのフレームは与えたページ名になります。

例:	015 > 014B

名前を与えられたページ以降のインデックスは名前の数値部分から再度積み上げが始まります。

例	014B の 次のページが 015 になる

	03カラムコレクション
このプログラムでは、絵コンテの1段を「カラム」と呼びます。

カラムは、カラムコレクションコンポのフレーム番号をインデックスとして1フレームあたり1カラムで管理されます。
