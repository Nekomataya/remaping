/*
	 サービス試験用分離ソース
	 2016.07.16
*/
/*
	テストバージョンなのでこの先変更多くあります
	ご注意
	targetObjは、古い構成の名残です。
	今回(2016)の改修で全て削除される予定です。
	XPSはグローバルに同じオブジェクトがあります。
	直接呼んでください。
	
	データ保存のためのリポジトリを複数扱えるように考慮すること
	サーバ（アドレス）を作品（タイトル）毎に記録するようにする？
	
	サーバリストを持つ
	
	
	
*/
/**
サーバ保存用　仮ルーチン
	2016.07.16
*/
//サーバへプッシュ
//この関数名で
function pushStore(){
	var episode_id = $('#backend_variables').attr('data-episode_id');
	json_data = {
			 		content: XPS.toString(),
		     		episode_id: episode_id,
			 		cut_id: gon.cut_id
				};
/*
	json_data = {
			 		content: XPS.toString(),
		     		episode_id: XPS.episode_id,
			 		cut_id: XPS.cut_id
				};
*/

/*
episode_id,cut_idに関しては、データ内に専用のプロパティを置いて記録するのが良いと思います。

				
開発中の　制作管理DB/MAP/XPS　で共通で使用可能なnas.SCInfoオブジェクトを作成中です。
これが、作品（制作単位）ごとの情報を保持します。

*/
	$.ajax({
		type : 'post',
		url : '/cuts.json',
		data : JSON.stringify(json_data),
		contentType: 'application/JSON',
		dataType : 'JSON',
		scriptCharset: 'utf-8',
		success : function(data) {
			xUI.setStored("current");//UI上の保存ステータスをセット
			sync();//保存ステータスを同期
//			console.log();
		},
		error : function(data) {

			// Error
//			console.log("error");
//			console.log(data);
		}
	});

};
//サーバから取込
function pullStore(){
	alert("まだ機能していません"); return;
	
	var myContent=XPS.toString();//XPSテキストをセットしてください
//以下が標準の読み込み時の初期化です
	if(XPS.readIN(myContent)){xUI.init(XPS);nas_Rmp_Init();}

};

//暫定


