﻿UserControlオブジェクトを作成する

UserControl
    .users  nas.UserInfoCollention object
    .groups nas.GroupInfoCollection object
    .roles  nas.RoleInfoCollection object
    
    

セクション:
セクション情報は、組織に対して記録される＜組織のプロパティ

セクション情報には、セクションの所属ユーザがあり？
組織名簿的な扱い

ロール:
ロール情報は、タイトルの配下とエピソードの配下に記録される。<それぞれが独立したタイトルのプロパティとエピソードのプロパティ

実際の使用時は1つのロール情報として扱う


エピソードのロール情報は、タイトルのロール情報の複製をとってそれを編集する形で作成する。

設定書式は、ユーザの感覚と齟齬が無い方が良い

組織に部門をつける　スッタフ登録は可能（参照される）実効はない
タイトルにスタッフを登録
さらにエピソードにスタッフを登録　一部タイトルのスタッフを継承（上書きはできない）

全てのレイヤーで整合性のある役職と部門が求められるので注意

ユーザが期待すると思われるのは、
    実際の組織と一致すること
    タイトルクレジットとして使用可能なこと
    実際のスタッフを全て把握、連絡等の役に立つこと

設定テキスト及び設定のUIは、現在慣習化しているスタッフ構成を踏襲して画面を構成する

組織上の部門設定
サブグループ的に役職を一覧表記する
TEXT UIは、テキストを反映した構造にする

部門/    役職/   ユーザ
制作管理/
	プロデューサ/
	統括デスク/
	デスク/
	制作進行/
演出/
	監督/
	演出/
	演出助手/
文芸/
    シリーズ構成/
	脚本/
	設定管理/
	デザイナー/
	キャラ設定/
	美術設定/
	小物設定/
	色彩設計/
作画/
	総作画監督/
	作画監督/
	作画監督補/
	メカ作画監督/
	メカ作画監督補/
	原画/
	第一原画/
	第二原画/
	動画検査/
	動画監督/
	動画/
美術/
	美術監督/
	美術監督補佐/
	原図整理/
	背景/
仕上/
	色指定/
	トレース/
	ペイント/
	特殊効果/
撮影/
	撮影監督/
	撮影/
	撮影助手/
3D/
    
無所属/
	＊	
オブザーバ/
	オブザーバ/
	時代考証/
ExelかGoogleスプレッドシートのテンプレートを出して編集を促す

タイトルをスタッフ情報のルートにする
エピソードはタイトルから部分的「継承」を行ったテンプレートを自動生成する。

JSON設定（設定記録ファイル）
/タイトル/_config.json
/**
設定用のオブジェクトをそのままJSONで入力/出力
内部オブジェクトではなく
*/
//Titel
{"title":"かちかちやま"}