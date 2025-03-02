*transformTracking

「パース引き(通称)」の支援用テンプレートプロジェクトです。

**概要
	トランスフォームートラッキング
	transformTracking.aep


こちらは、通称「パース引き」と呼ばれることの多い撮影手法用の設定支援用テンプレートプロジェクトです。
AE 6.5 以降の書式のエクスプレッションでレイヤを連結して「(通称)パース引き」をそこそこ直感的に設定することを目的にしています。
また、引きの指定方式をフレーム指示ではなく画面上の特定点の引き速度と消失点を指定して行います。


AE5.5以前の環境のではエクスプレッションに使用している空間トランスフォーム関数が無い為対象バージョンは6.5以降となります。

同梱のアニメーションテンプレートを組み合わせて手動でセットアップすることも可能ですが、手間がかかります。

デバッグの終了後に半自動のセットアップスクリプトを作成する予定ですが、現在は保留中です。

ご試用の際は、テンプレートプロジェクトをインポートしてサンプルの背景フッテージを入れ替える等なさってご使用ください。


このテンプレートプロジェクトは、トランスフォームエフェクトを使用して素材を平面的に変形させることによって背景等に擬似的な立体感を与える処理を行います。

アニメーションプリセットは、単体では機能しません。外部にコントロール用のレイヤを必要とします。


コンポジション内で引き幅の指定を[mm/k]形式で行うので、レイアウトの指定が[mm/k]形式の場合の計算がラクになるかもしれません。

**演出家、原画作業者の皆様へ
このテンプレートの処理を画面構成に組み込む場合は、速度指定とともに、その速度が画面内のどの部分の速度であるかを指定してください。
具体的には、以下のように速度指定を行って、そのポイントの移動方向と速度が明示していただけるようお願いいたします。

fig03.jpg
従来の変形のない指定	方向と速度のみがわかる

fig04.jpg
この処理で望ましい指定	方向と速度にくわえてその正確な位置がわかる指定
fig05.png
方向を示す矢印の一部を使用してその線の交点での速度を指定するモノとします


またパースペクティブにそった移動感が発生しますので、以下のうちいずれかの方法で消失点が特定できる指定を加えてください

fig06.jpg
１.上記の指定に加えて補助の速度／位置指定を行う
２カ所の速度と位置が指定されると、そこからパースを計算できます。
この指定方法は、主に横位置でのfollowの指定に適しています。

fig07.jpg
fig08.jpg
２.移動に必要な消失点 または、消失点に向かう２本以上の補助線
消失点が画面外の場合は補助線で指示してください。
補助線は正確に画かれていれば３本以上あってもかまいません。
この方法は、奥行き方向のfollowの指定に適しています。


指定を実現するために必要な素材のサイズは、[perspectiveGuide]コンポに速度を記入して確認することができます。

**処理の名称について
ここではこの処理の名称を「transformTracking(トランスフォーム トラッキング)」または「変形トラック」と呼びます。

また、表記上の略号は"tt"とします。

処理範囲は、一枚の静止画または動画の平面画像を3次元計算「しない」で擬似的な立体効果を与える範囲に留め、その中でも「移動速度と指定位置が明確に指示されたもの」だけを扱います。

トランスフォームトラッキングはさらに変形の種類で2つの処理が選択できます。

***skewTraucking(スキュートラッキング)
	横フォローの際のカメラの移動感を模倣する為にskew(平行四辺形ゆがみ)を使用します。
	効果的にはよくにていますが、分割素材を3D空間で配置したものとは異なりますのでご注意ください。
	
***scaleTracking(スケールトラッキング)
	奥行き方向フォロートラッキングの代りにスケール(拡大縮小)を使用して素材の大きさを変えます。
	これはごく狭い意味での「デジタルT.U/T.B」に相当します。

この処理は、Adobe AfterEffect Version6.5以降のすべてのバージョンで標準の機能のみで使用することができます。
この処理をカットに適用する場合は、コンポジット担当者宛にこの記事のURLまたはこのプリセットのコピーとともに
レイアウトに引き速度と一緒に上のいずれかの処理を指定してください。

fig09.png

コンポジット担当者様へ　上の指定は2008年夏現在で、広範囲には使用されていない造語です。
この記事に基づく処理にたいして上のような名前を与えますので
これらの指定があった場合は、この記事のテンプレートを使用するか、または等価もしくは実質上等価な処理と置き換えて処置をお願いいたします。
これは、あくまで希望です。

何らかの理由で、処置を置き換えた場合は処理指示を行った責任者（通常演出家）に　変更理由と内容(なぜその素材ではその処理が出来ないか等)を申し送りしていただけるとありがたいと思います。


---(
技術情報グループのみなさんへ

実はこの処理の名称は現在「仮称」です。
なんかよい名前募集中

デフォームT.F(トラッキングフォロー)　デフォームT.I/T.O(トラックイン／アウト)
deform-T.F/T.I/T.O
df-T.F/T.I/T.O
デフォームトラッキングフォロー／デフォームトラックイン／デフォームトラックアウト
キーワードとしては、より適用範囲の狭い「スキュー」等の方が望ましげ
---)


---(
注
現在 mm/k による速度指定は、演出段階で精密な計算のもとに指定されたものと、
平面処理の場合の引き速度の「気分」だけを指定したものの両方が見受けられます。
後者の場合はその数値を素材上に厳密に再現できない場合がありますので、
指定内容をよく確認してから適宜調整の上ご使用ください。
---)
**サンプルプロジェクトのコンポジション
以下は、サンプルプロジェクトのコンポジションの説明です。

設定に必要な素材は、transformTracking.aep プロジェクトにすべて入っています。
sample.aepは transformTracking.aepの内容すべてとサンプル画像を使用した参考設定が納められた参考データです。

***ttSideFollow
ttSlideFoloiw は skewTracking の参考コンポです。

skewTrackingは、以下のようなレイアウトのショットで視線に対して直角またはそれにごく近い移動撮影風の処理に使用できます。

fig01.jpg(図1)
-背景素材は、分離型(壁面と床面がそれぞれフラットに別々に描かれたもの)ではなく1枚に透視画として描かれたもの。
-レイアウトは1点透視 またはそれと同様と見なせるものであること。
-想定上のカメラの移動方向が視線に対してほぼ直角なモノであること。

***ttT.O/T.I
ttトラックアウト(イン)は、scaleTracking の参考コンポです。

scaleTracking は以下のようなレイアウトで視線方向対して平行またはそれに近い移動撮影風の処理に使用できます。
fig02.jpg(図2)
-レイアウトは1点透視 またはそれと同様と見なせるものであること。
-想定上のカメラの移動方向が視線に対して平行またはそれに近い物であること。
-カメラワークの消失点は画面内でも、画面外であってもかまわないが画面構成次第で、不自然なカメラワークとなる事があるので配慮が必要

***perspectiveGuide
おまけのパースガイドです。特に画像の変形は行いませんが、他のコンポと同様のインターフェースを使用して画面から以下のパース情報を取得可能です。

-消失点の座標(px)推定(測定)
-カットの長さと引き幅の推移に基づくコンポジットに必要な背景サイズの推定
-比較的正確な撮影フレームの割り出し

メインコントローラの isScaleプロパティを切り換えることでskewTrackingとscaleTrackingの切り替えが出来ます。

---(
*注*
この撮影処理は業界一般的には、「デジタルT.U/T.B」または
「パース引き」等と呼ばれる処理のうちの一部です。(全部ではありません)

「デジタルT.U/T.B」または「パース引き」等の用語は、拡大縮小系の
処理でフィルム時代に通常撮影では困難だった「処理全般」にたいして
「便利な代替語」として定着してしまった為、実際の用法では処理対象が
広すぎて限定できず、現在すでに厳密な処理指定とはなりません。

このプロジェクトは、その特定の処理をきり出して比較的きちんとした
「定義づけ」を行う試みです。


名前をつけて分類するのは便利ですが、共通認識のとれない名前は混乱の
もとなので、ご注意ご注意

昔でいうと謎の呪文「オプチカル」相当でしょうか？
あれも、厳密な指定はレイアウトと仕込みで千変万化。一定の処理など
ないので、実際にはひとつの名前で呼ぶのは意味がない状態でした。
…ま、直接の担当者以外は「オプチカル合成」で済ませていましたが、
多分皆その旨の自覚は…あったと思いますけどね…
---)

*このプリセットで処理可能なパターン

この処理は、ここで定義した範囲に厳密に名前をつけたものです。
AEで処理テンプレートを書きましたが、スキュー変形が使えるソフトならば
他のコンポジットソフトでも完全に同等の処理が可能です。

**skewTracking
スキュートラッキング(トラック)(skewTracking) は、スライドの名がつけてありますが、実際には平行四辺形ゆがみです。

すでに線遠近法で描かれた平面の背景を「ゆがめ」てあたかもカメラ位置が変化しているように見せかける手法です。

トランスフォームエフェクトの歪曲(スキュー=平行四辺形ゆがみ)を利用しています。

(歪曲の図3)

この処理は一般に以下のような効果をねらうレイアウトに対して有効です。

また、画面全体に対して適用するだけではなく、特定のレイヤ、またはさらにその一部分に対しても適用可能です。

-例.A	(図4)床全面変形つきfollow
-例.B	(図5)床部分のみ変形してfollow
-例.C	(図6)壁面なめこみクレーンアップ/ダウン

平面素材に適用する効果である為 比較的手軽でL/Oさえ対応済みなら特殊な仕込みや別素材を準備する必要があまりないのが特徴です。
ようするに「お気楽処理」ですね。

歪曲による処理である為のいくつかの制限があります。

-一枚の静止画を変形する為、変形率が大きくなると絵が不自然になりやすい。
-変形率を大きくしすぎると素材の端が「バレ」る
-適用部分がかなり平滑な場所でないと不自然
-適用部分とそうでない部分の接合部が直線でない場合は不自然になりやすい。

ようするにしょせん「ゴマカシ」なので「画面を選ばないとダメになる」ってカンジです。

***レイアウト作成上の注意
主に、原画や演出の方へ

この処理を使用する場合は、いくつか配慮しておくとよい点があります。

主に上にかいた理由でこの効果は適用面が「平ら」でないと「変な絵になりやすい」効果です。

基本的には、地面、床、壁等で「平らな部分」のみに使用してください。

また、壁床の接合部分は、基本的に直線で、かつfollow(slide)方向と一致していないといけません。
それ以外の場合はこの簡単な処理ではなく、背景の分離や隠れている部分の作画などもう少し複雑な仕込みが必要になります。
詳細は、それぞれのコンポジット(撮影)責任者とご相談ください。

この処理は、「作業コストが比較的低い簡易処理」です。魔法の万能処理ではありませんのでご注意ください。 
どんな背景でも立体化処理ができるという傾向のものではありません。

例(向いている
(図7)
例(向いていない
(図8)

また効果的には、背景に擬似的な立体感を与える処理なので
立体感の低い(図7)のようなレイアウトよりも(図8)のようなレイアウトの方が「目立ち」ます。


まぁ、常に「目立てば良い」かというとむろんそんなことはないので、目立つことの善し悪しはケースごとに個別にご判断ください。

**scaleTracking
スケールトラッキング(トラック)(scaleTracking) は、通称「デジタルT.U/TB」と呼ばれることの多い事例の「一部分」に当たる処理です。

このテンプレートでは、画面全体でなく背景画像、またはBook セル 等の一部の素材を本体カットとは別の割合で拡大縮小(スケーリング)する処理を指します。
レイアウトの設計が適切な場合は実写のプッシュイン・アウトのような擬似的な立体感のある画面効果が得られます。

旧来のフィルム処理では同様の効果を別撮りのマスク合成やエリアル合成等で処理可能でしたが、ご存じの方はご存じの理由(値段が高い)により多用されることはありませんでした。
現在では一般的なオーダーとなりましたが、けっこう適切な撮影指定が行われていない代表的な処理でもあります。


この効果は一般に以下のようなレイアウトに対して有効です。

主に背景に対して適用して、移動(トラック)撮影の効果を模すことが多いようです。
-例.A	(図9)トラックfollow正面
-例.B	(図10)トラックfollowアオリ
-例.C	(図11)トラックfollow俯瞰

背景を1枚の平面素材から作成する効果である為 比較的手軽で、L/Oさえ対応済みなら特殊な仕込みや別素材を準備する必要があまりない。

	コレも、ようするにお気楽処理です

この処理は素材の部分的な拡大縮小 以外のなにものでもありません。
拡大・縮小(またはスケーリング 以下「拡縮」と省略します)による処理である為の制限があります。

どちらもコンピュータ合成に限らずですが、

-一枚の静止画を拡縮する為、拡大率が大きくなると絵の「アラ」がよく見える
	最大の寄りフレームを20F (200%拡大)程度にみておくべきでしょう。
	必要に従ったサイズの素材をご用意ください。

-縮小しすぎると大きなサイズの素材が必要になる。
	あまりに大きな素材は、扱いに窮します。実際の巨大な背景画(画用紙とかパネルとか)と同じく
	データの背景素材であっても大きすぎると困難が発生します。
	たとえば今回のプロジェクトのAdobe AEには各所に「30000pixelでオーバーフローを起す」という
	プログラム上の制約(仕様)があります。
	無制限なサイズの指定はお控えください。

***レイアウト作成上の注意
主に、原画や演出の方へ

この処理を使用する場合は、いくつか配慮しておくとよい点があります。

主に上にかいた理由でこの効果は 素材的には、フィルム時代のオプチカル合成とおなじ制限を受けます。
カット内容と狙う効果の組み合わせはさほど広くないのを意識してください。

詳細は、カット毎に変わると思いますので それぞれの(作画・コンポジット等)担当者とご相談ください。


演出効果的に、(実写の)トラックイン・アウトの効果を狙う場合は、意図的に遠近法をゆがめた作画を行うと良い効果を得られる場合があります。

例(静止画的には自然だがこの効果に使用するとリピート不可能
(図12)wall2.jpg
例(遠近法的には不自然だが、この効果の場合はリピートが行えるので長時間ショットが作れる。
(図13)wall1.jpg

上図のように線遠近法的には、遠くのモノほど奥行きが圧縮して見えるほうが自然ですが、この処理を使用する場合でかつ連続パターンをくり返して長時間のショットを作成する場合にかぎり
ですが、各ブロックを同比率の画像の連続にすると、合成上のサイクルを形成して素材をリピート使用することが可能になります。

また原図としては上と似た物になりますが、サイクルで使用しない場合でも、人間が小さい(遠い)モノの形をあまりはっきり認識しない事を利用して、遠距離の位置の事物を近距離のパースペクティブで描いておくと、
拡縮処理である不自然さが緩和されるケースがあります。

ケースによりますが、有効な場合がありますのでご検討ください。

例(静止画的には自然だがこの効果に使用すると背景の平面感がきわだつ。
(図14)

例(遠近法的には不自然だが、この効果の場合は逆に遠近感が変化しないのがバレにくい(かえって自然に見える)。
(図15)


また、この処理は、「作業コストが比較的低い簡易処理」です。魔法の万能処理ではありませんのでご注意ください。 
「一枚の背景を無限にプッシュイン・アウトできる」わけではありません。
長時間のショットでこれらの処理を採用すると「素材バレ」しやすいです。
素材のリピート使用や乗り換えを仕込まない限り長時間のカットには対応できません。

もっと、複雑な立体感の表現や移動撮影を行う必要がある場合は、別の撮影処理を またさらに作業コストはかかりますが3D-CGIによるモデリングや作画による背景動画等の別の選択肢を検討してください。

*プロジェクトの操作
テンプレートプロジェクトを開いてください

**コントローラ操作
まずコントローラの挙動を理解してもらう為に [perspectiveGude]コンポを開いてください。
	図18
コントローラとなるレイヤオブジェクトがあります。サンプル背景以外はガイドレイヤとしてありますので、実際のレンダリング画面には影響しません。

[メインコントローラ]と[ガイドポイント]をドラッグしてガイドラインをレイアウトのパースを指定したいポイントに移動します。

[メインコントローラ]は、そのレイアウトで、移動速度の指定を行いたいポイント上へ配置してください。

[ガイドポイント]は、パース設定用の補助線の一端です。可能な限りメインコントローラから離して、ガイドラインがみやすい位置に廃止してください。

次に[消失点コントローラ]をメインコントローラからみて消失点のある「方向」へ正確に配置します。

デフォルトで消失点と[消失点コントローラ]は一致していますので、画面上に消失点がある場合は、消失点上に配置して、設定終了です。

消失点が画面外にある場合は、[メインコントローラ]レイヤにある設定パラメータ[消失点オフセット(%)]を調整すると消失点が[メインコントローラ]と[消失点コントローラ]を結ぶ線上で移動しますのでガイドラインをみながら、消失点を希望の位置まで移動させてください。

[メインコントローラ]の[速度(mm/k)]エフェクトに引き速度を指定します。

一般に拡縮系の処理では拡縮率で指定を行うのが普通ですが、このテンプレートでは「指定ポイントの通過速度」で指定を行います。

また、指定位置と速度だけでは実際の拡縮率が得られませんので、同時に何フレーム目が100%サイズであるかを指示する必要があります。

[メインコントローラ]の[正比率点オフセット]エフェクトの第一キーフレームで100%表示にするフレームを指定してください。

このプロジェクトではコンポの継続時間内に100%表示を行うフレームを必ず1フレーム必要とします。これはプログラム上の仕様です。

状況によっては、カット継続時間中に100%表示を行わない場合もあるとは思いますが、その場合はコンポの前方または後方にダミーの捨て尺を置いて対応してください。


以上の操作でそのレイアウトのパース設定ができます。

このコンポでは、とくに変形などの操作はしていませんがテキストレイヤに設定された値が数値表示されていますので値を確認してください。

また、コンポ内任意の時間位置での撮影フレームを表示する機能があります。
[メインコントローラ][参照フレーム]のキー位置を設定することで、その時間位置での撮影フレームが表示されます。
撮影素材（背景）サイズの確認等にご使用ください。

他のコンポでは、この情報をもとに対象画像の変形を行います。


[メインコントローラ]の[isScale]プロパティをオン／オフすることで、ガイドタイプをskewTrackingまたはscaleTrackingのいずれかに切り替えることができます。
適宜切り替えて撮影指定フレームを確認してください。

[メインコントローラ]にはパラメータ設定用のエフェクトが多数登録してありますが、これらのパラメータの詳細は後述します。

**スケールトラッキング(トラック)
このコンポは、消失点を利用した拡縮処理を支援します。
コンポ[scaleTracking]を開いてください。
サンプルのレイアウトに速度指定がありますので、速度指定点にメインコントローラを配置します。
実際のコンポジションに使用する時は、コンポを適切なサイズにリサイズして使用してください。
メインコントローラの[正比率点オフセット]のキーフレームがデフォルトでtime=0の位置にあります。
このキーフレームの時間位置で拡縮率が100％になります。必要にしたがってキーフレームの時間位置を調整してください。

[消失点コントローラ]と[ガイドポイント]を配置してパースを確認してください。
サンプルのレイアウトで下図の位置にコントロールを配置した場合[消失点オフセット]パラメータは約15%となります。

このテンプレートはデフォルトでトラックインとして動作します。
トラックアウトが必要な場合は、速度の値をマイナスにするか、反転スイッチをオンにしてご利用ください。

[メインコントローラ]の[速度(mm/k)]パラメータには、キーフレームを作って値をアニメーションすることが可能です。
速度0で静止、マイナス値で逆方向に移動します。お試しください。

**スキュートラッキング(トラック)
このコンポは、消失点を指定して素材を部分的に歪曲して横方向のトラッキングfollowの効果を模します。

コンポ[skewTracking]を開いてください。
サンプルのレイアウトに速度指定がありますので、速度指定点にメインコントローラを配置します。
実際のコンポジションに使用する時は、コンポを適切なサイズにリサイズして使用してください。
メインコントローラの[正比率点オフセット]のキーフレームがデフォルトでtime=0の位置にあります。
このキーフレームの時間位置で歪曲パラメータが 0度 になります。
歪曲パラメータは、平行四辺形ゆがみの傾斜角度で、±70度までの変形が可能です。
必要にしたがってキーフレームの時間位置を調整してください。
このパラメータは大きくなればなるほどもとの画像からのゆがみも大きくなりますので、通常とくに理由が無ければコンポの継続時間の中央に配置するのがお勧めです。
最もゆがみの少なくい状態で素材を使用できます。

[消失点コントローラ]と[ガイドポイント]を配置してパースを確認してください。
サンプルのレイアウトで下図の位置にコントロールを配置した場合[消失点オフセット]パラメータは約15%となります。

[メインコントローラ][follow方向]を設定してください。サンプルのレイアウトでは 78度 になります。
このテンプレートには、消失点コントローラの位置でfollow方向に平行なラインで上下を分けるマスクが付属しています。
壁付きの床follow等の不変形部分を必要とするカットでご利用ください。
マスクの位置と角度は[消失点コントローラ]の位置と[follow方向]パラメータに追従しますが、独自の位置調整を上乗せすることも可能です。
レイアウトにしたがって調整してください。
[マスク反転]スイッチで、マスクの上下を反転することが可能です。望まない方向にマスクがある場合切り換えてご使用ください。

[メインコントローラ]の[速度(mm/k)]パラメータには、キーフレームを作って値をアニメーションすることが可能です。
速度0で静止、マイナス値で逆方向に移動します。お試しください。

*コンポのセッティング
各自のプロジェクトでこのテンプレートを利用する方法を紹介します。

**フッテージの入れ替え
各自の作業でこの効果をご利用になる場合は、フッテージの入れ替えとコンポサイズの調整が必要になるかと思います。
入れ替えの手順をかいておきます。
このテンプレートをプロジェクトにインポートする。
効果をかけたい素材に同梱のアニメーションプリセット(エフェクトテンプレートセット)をつかってエフェクトを設定する。
このアニメーションプリセットには、必要なエフェクトすべてが含まれています。
このエフェクトは、コントロールレイヤがなくても動作します。

ただし、コントローラレイヤとガイドがない場合は、パース情報の設定がタイヘン不便です。
テンプレートコンポを開いてそれぞれのコントローラをコピーペーストしてください。
コピーの順序によっては一時的にエクスプレッションエラーが発生する場合がありますのでご了承ください。
コピーのあとでエクスプレッションを有効にすると動作します。
また、アニメーションプリセットを適用する前にコントローラレイヤを配置(コピー)しないように注意してください。
コントローラレイヤは、本体のプリセットの値を参照しているので、エラーがたくさんでます。

**スクリプトで設定
nasライブラリをご使用の場合は、同梱のセットアップスクリプトが利用可能です。
コンポ上で、効果をかけたいレイヤをセレクトして[scaleTracking設定][skewTracking設定]または[パースガイド設定]スクリプトを実行してください。
選択されたレイヤをプリコンポーズして変名した上で各コントローラレイヤを配置します。
またすでに同名のレイヤが存在する場合は、それらの配置をスキップしますのでご注意ください。


同一コンポ内で複数のレイヤに対してskewTracking/scaleTrackingを設定した場合でも参照するコントローラレイヤは一組です。
複数のパース設定が必要なショットでは、それぞれをプリコンポーズするなどして対処してください。

コントローラパラメータ解説

	解像度(dpi)	素材解像度
合成素材の基本解像度をdpiで指定します。デフォルトは144dpi

	正比率オフセット	レイヤの変形率が０となる時間を指定します。
背景を変形させてスライド効果を得る都合上、変形率が大きくなると画質が低下します。

第一キーの時間を起点として前後で逆方向の変形を適用しますので変形なしのポイントを第一キーフレームで指定してください。

二つ目以降のキーフレームは無視されます。

エフェクトから取り出せる値は当該のフレームが変形率0のフレームから何フレーム分はなれているかをあらわす整数値です。

この値から変形量を計算します。

この値はフレームスキッププロパティに影響されます。

	消失点オフセット(%)	変形のための消失点位置を指定するパラメータ
このパラメータで消失点位置の計算を行います。

消失点コントローラが、メインコントローラと消失点を結ぶ線分の何パーセントに当たるかを指定します。
-消失点　—　100%
-消失点コントローラ　—　指定
-メインコントローラ　—　0%
0%では値が発散して消失点の距離が決定できなくなりますので、0%を入力することはできません。

100%以上の値を与えると消失点は、メインコントローラと消失点コントローラの内側に入ります。

マイナスの値を与えると消失点は、メインコントローラからみて消失点コントローラの逆側にできます。

	フレームスキップ	駒うち指定
動画とのシンクロ等で駒うちを可変するときに指定します。次に指定するまでの間有効です。
-1コマ撮り＞スキップ０
-2コマ撮り＞スキップ１
AEのコントローラと同じスキップ数指定です。

	速度(mm/k)	引き速度を指定
変形によるスライド効果なので、速度を指定する場合は、画面内のどの位置の速度なのかを指定する必要があります。

このテンプレートではメインコントローラの中心位置での移動速度をmm/k形式で指定してください。

キーフレームを作って値をアニメーションすることが可能です。

	方向反転	引き方向反転
scaleTrackingのみ

チェックを入れると移動方向を反転します。

この機能を使わず、速度をマイナスにすることで動作を反転させることも可能です。

	マスク反転	クリップマスクの上下を入れ替えます。
skewTrackingのみ

背景マスクを反転させます。カットの必要にしたがって切り換えてください。

	　follow方向	follow方向を指定
skewTrackingのみ

フォロー方向を方位角（１２時方向を０度／６時方向を１８０度で表す３６０度指定）で指定します。

キーフレームがない場合は、メインコントローラの方向が適用されます。


----

