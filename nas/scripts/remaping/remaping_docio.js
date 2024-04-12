/*
	nas.UserSigunatureをHTMLに変換する追加メソッド
	アプリごとにテンプレートが異なるので注意
*/
nas.UserSignature.prototype.toHTML = function(stage,template){
	if(! template) template = "\t<span class='signbox' id='sig_%1' onclick='xUI.showSignatueInfo(%1)'>\n\t\t<span class = signlabel>%2 </span>\n\t\t<span class = 'signature %3 ' title = '%6'>\n\t\t%4 <br>%7<span class=signdate>%5 </span>\n\t\t</span>\n\t</span>\n";

	var HTML_TEMPLATE = "\t<span class='signbox' id='sig_%1' onclick='xUI.showSignatueInfo(%1)'>\n\t\t<span class = signlabel>%2 </span>\n\t\t<span class = 'signature %3 ' title = '%6'>\n\t\t%4 <br>%7<span class=signdate>%5 </span>\n\t\t</span>\n\t</span>\n";

	var status = this.status;
	var stamp  = "";
	if(this.stamp){
		status = 'box';
		stamp  = '<img class=sigunature-stamp src ="'+this.stamp+'">'
	};
	return (nas.localize(template,
		String(xUI.XPS.signatures.members.indexOf(this)),
		(stage)? this.node.split(':')[0]:".",
		'signature-'+status,
		(this.text)?(this.text.slice(0,3)):this.user.handle,
		this.date.toNASString('mm/dd'),
		this.toString('full'),
		stamp
	));//
/* 
	nas.localize(template,
		%1:"INDEX" signature index Number Int,
		%2:"STAGE" stage name|index ,
		%3:"CLASS" className,
		%4:"TEXT"  sigunature note (or user handle),
		%5:"DATE"  date of sign,
		%6:"TITLE" description (if exists),
		%7:"STAMP" stamp image url (if exists)
	);// */
};
/**
	シグネチャコレクションをスタンプパレードに展開する
	末尾に空白のチェックイン｜アウト+スタンプ登録UIの呼び出しを設定する
 */
nas.UserSignatureCollection.prototype.toHTML = function(){
	var result       = "";
	var currentStage = "";
	this.members.forEach(function(e){
		if(e.node != currentStage){
			result += e.toHTML(true);
			currentStage = e.node;
		}else{
			result += e.toHTML(false);
		};
	});
	result +='\t<span class = signbox onclick=alert(123)>\n\t\t<span class = signlabel>.</span>\n\t\t<span class = signature></span>\n\t</span>';
	return result;
}

/* シグネチャボックスの情報をモーダル表示 */
xUI.showSignatueInfo = function showSignatueInfo(id){
	var infoMsg = JSON.stringify(xUI.XPS.signatures.members[id],0,2);
	var dialogTitle = localize({ja:'署名詳細',us:'Signature Details'});
	nas.HTML.showModalDialog('alert',infoMsg,dialogTitle);
}
/*TEST
var stream = `
CT:0
	[	2022.01.23	kiyo:kiyo@nekomataya.info]
	(composite	2022.01.24	たぬき:tanuki@animal.example.com)
LO:1
	[-済-	2022.01.24	kiyo:kiyo@nekomataya.info]
	<監督OK	2022.01.25	鮒:funa@animal.example.com>
	<演出	2022.01.25	亀:kame@animal.example.com>
	(演出	2022.01.25	亀:kame@animal.example.com)
`;
xUI.XPS.signatures.parse(stream);

document.getElementById('signbox').innerHTML = xUI.XPS.signatures.toHTML();
//xUI.showSignatueInfo(1)
*/
/*
	作業チェックアウト
ライン	0:	(本線)
ステージ	2:	原画
ジョブ	2:	原画演出検査


作業終了の署名をして「原画演出検査」を終了しますか？

[取消] [サイン][カスタムスタンプ]
	┌───┐	
	│ICN│	
	└───┘	
	kiyo	
CT: 09/10	
					」
チェックアウト後は他のスタッフが作業を開始できるようになります
*/




/*
    application UI synctable
    xUI.syncTable

    xUI.sync UI表示同期プロシジャ要素テーブル
    オンメモリの編集バッファとHTML上の表示を同期させる
    共通(標準)キーワードは以下の通り

    about_
    undo
    redo
    windowTitle

    renameDigits
    prefix
    suffix
    preview
    ThumbnailSize
    PreviewSize
    Search

    各アプリケーションごとのキーは個別にこのテーブルに追加または上書きする
    テーブルの値は、同期情報オブジェクト、関数、文字列
    同期情報オブジェクトは{type:<同期タイプ>,value:<表示を切り替える判定条件式|設定する値を得る式>,items:[要素名の配列]}
    タイプ menu-enable|menu-check|radio-check|menu-value|show-hide
    関数|文字列式の場合は、定形外の処理を行うために単純に実行

このファイルはdocioにマージするためのソース 2023 12 14

*/
xUI.syncTable = {
	"scale":function(){
			document.getElementById('pageZoom').value = Math.round(xUI.viewScale * 100);//Xの値のみを参照する
			document.getElementById('pageZoomSlider').value = document.getElementById('pageZoom').value;//Xの値のみを参照する
	},
	"paintColor"   :function(){ xUI.canvasPaint.syncColors();},
	"paintPalette" :function(){ xUI.canvasPaint.syncTools();},
	"paintTool"	:function(){ xUI.canvasPaint.syncTools();},
	"imgAdjust":function(){},
	"docImgAppearance":function(){
		document.getElementById('ImgAppearanceSlider').value = Math.floor(xUI.XPS.timesheetImages.imageAppearance*100);
		document.getElementById('ImgAppearance').value = document.getElementById('ImgAppearanceSlider').value;
	},
	"server-info":function(){
		document.getElementById('headerRepository').innerHTML='<a onclick="serviceAgent.currentRepository.showInformation();" title="'+serviceAgent.currentRepository.owner.handle+'"><b>'+serviceAgent.currentRepository.name+'</b></a>';
	},
	"importControllers":function(){
//読み出しコントローラ抑制
		if(
			(serviceAgent.currentStatus=='online-single')&&
			(xUI.XPS.currentStatus.content.indexOf('Active')<0)
		){
			document.getElementById('updateSCiTarget').disabled = true;
			xUI.pMenu('pMimportDatas','desable');//プルダウンメニュー  
			xUI.pMenu('pMopenFS','disable')     ;//ファイルオープン
			xUI.pMenu('pMopenFSps','disable')   ;//Photoshop用ファイルオープン
			document.getElementById('ibMimportDatas').disabled = true;  //アイコンボタンインポート（オープン）
			document.getElementById('dataLoaderGet').disabled  = true;   //変換パネルの取り込みボタン
			document.getElementById('myCurrentFile').disabled  = true;   //ファイルインプット
		}else{
			document.getElementById('updateSCiTarget').disabled=false;
			xUI.pMenu('pMimportDatas','enable');//プルダウンメニュー  
			xUI.pMenu('pMopenFS','enable')     ;//ファイルオープン
			xUI.pMenu('pMopenFSps','enable')   ;//Photoshop用ファイルオープン
			document.getElementById('ibMimportDatas').disabled = false ;  //アイコンボタンインポート（オープン）
			document.getElementById('dataLoaderGet').disabled  = false ;   //変換パネルの取り込みボタン
			document.getElementById('myCurrentFile').disabled  = false ;   //ファイルインプット
		};
	},
	"recentUsers":function(){
//ダイアログ類から参照される最近のユーザリスト
		var rcuList = "";
		for (var i=0;i<xUI.recentUsers.length;i++){
			rcuList += '<option value="';
			rcuList += xUI.recentUsers[i].toString();
			rcuList += xUI.currentUser.sameAs(xUI.recentUsers[i])?'" selected=true >':'">';
		}
		if(document.getElementById('recentUsers')) document.getElementById('recentUsers').innerHTML = rcuList;
	},
	"editLabel":function(){
//XPS編集エリアのラベル更新
/*
タイトルテキストは
	IDFをすべて
ラベル表示
	jobName
*/
	var myIdf	 = Xps.getIdentifier(xUI.XPS);
	var editLabel = xUI.XPS.job.name;
	var editTitle = decodeURIComponent(myIdf);
// ラベルをすべて更新
	$("th").each(function(){
		if(this.id=='editArea'){
			this.innerHTML =(this.innerHTML == 'Animation')? editLabel:'Animation';
			this.title	 = editTitle;
		};
	});
	},
	"referenceLabel":function(){
//referenceXPSエリアのラベル更新
/*
	リファレンスが編集中のデータと同エントリーでステージ・ジョブ違いの場合はissueの差分表示を行う。
タイトル(ポップアップ)テキストは
	同ステージのジョブなら	jobID:jobName
	別ステージのジョブならば  stageID:stageName//jobID:jobName
	別ラインのジョブならば	lineID:lineName//stageID:stageName//jobID:jobName
	別カットならば  IDFをすべて
ラベル表示は上記の1単語省略形で
	同ステージのジョブなら	jobName
	別ステージのジョブならば  stageName
	別ラインのジョブならば	lineName
	別カットならば  cutIdf(Xps.getIdentifier(true))
*/
		var myIdf  =Xps.getIdentifier(xUI.XPS);
		var refIdf =Xps.getIdentifier(xUI.referenceXPS);
		var refDistance = Xps.compareIdentifier(myIdf,refIdf);
		if(refDistance < 1){
			var referenceLabel = "noReferenece";//xUI.referenceXPS.getIdentifier(true);
			var referenceTitle = decodeURIComponent(refIdf);
		}else if(refDistance == 1){
			var referenceLabel = xUI.referenceXPS.line.name;
			var referenceTitle = [
				xUI.referenceXPS.line.toString(true),
				xUI.referenceXPS.stage.toString(true),
				xUI.referenceXPS.job.toString(true)
			].join('//');
		}else if(refDistance == 2){
			var referenceLabel = xUI.referenceXPS.stage.name;
			var referenceTitle = [
				xUI.referenceXPS.stage.toString(true),
				xUI.referenceXPS.job.toString(true)
			].join('//');
		}else if(refDistance >= 3){
			var referenceLabel = xUI.referenceXPS.job.name;
			var referenceTitle = xUI.referenceXPS.job.toString(true);
		}
// ラベルをすべて更新
		$("th").each(function(){
			if(this.id=='rnArea'){
				this.innerHTML = (this.innerHTML == referenceLabel)? 'Referenece' : referenceLabel;
				this.title	 = referenceTitle;
			};
		});
	},
	"historySelector":function(){
		var currentIdentifier = (xUI.uiMode == 'production')? Xps.getIdentifier(xUI.referenceXPS):Xps.getIdentifier(xUI.XPS);
		var currentEntry = serviceAgent.currentRepository.entry(currentIdentifier);
		if(! currentEntry) return;
		var myContentsLine ='';
		var myContentsStage=''; var stid=-1;
		var myContentsJob  ='';
		for (var ix=currentEntry.issues.length-1;ix >= 0;ix--){
			var matchResult=Xps.compareIdentifier(currentEntry.issues[ix].identifier,currentIdentifier);
			if(decodeURIComponent(currentEntry.issues[ix][2]).split(":")[0] == 0){stid=ix-1}
			if((stid == ix)||(ix == (currentEntry.issues.length-1))){
				if(matchResult>4){
					myContentsStage += '<li><span id="'+currentEntry.issues[ix].identifier+'" ' ;
					myContentsStage += 'title="'+decodeURIComponent(currentEntry.issues[ix].identifier)+'" ';
					myContentsStage += 'class="pM">*';
					myContentsStage += decodeURIComponent(currentEntry.issues[ix][0])+"//"+decodeURIComponent(currentEntry.issues[ix][1]);
					myContentsStage += '</span></li>'
				}else{
					myContentsStage += '<li><a id="'+currentEntry.issues[ix].identifier+'" ' ;
					myContentsStage += 'title="'+decodeURIComponent(currentEntry.issues[ix].identifier)+'" ';
					myContentsStage += 'href="javascript:void(0)" ';
					myContentsStage += 'onclick="serviceAgent.getEntry(this.id)"> ';
					myContentsStage += decodeURIComponent(currentEntry.issues[ix][0])+"//"+decodeURIComponent(currentEntry.issues[ix][1]);
					myContentsStage += '</a></li>'
				};
			};
			if(matchResult>2){
				myContentsJob += '<option value="'+currentEntry.issues[ix].identifier+'"' ;
				myContentsJob += (matchResult>4)?
					'selected >':' >';
				myContentsJob += decodeURIComponent(currentEntry.issues[ix][2])+"//"+currentEntry.issues[ix][3];
				myContentsJob += '</option>'
			};
		};
		document.getElementById('pMstageList').innerHTML=myContentsStage;
		document.getElementById('jobSelector').innerHTML=myContentsJob;
	},
	"productStatus":function(){
		document.getElementById('documentIdf').innerHTML  = decodeURIComponent(Xps.getIdentifier(xUI.XPS));
		document.getElementById('pmcui_line').innerHTML  = xUI.XPS.line.toString(true);
		document.getElementById('pmcui_stage').innerHTML = xUI.XPS.stage.toString(true);
		document.getElementById('jobSelector').innerHTML ='<option value="'+Xps.getIdentifier(xUI.XPS)+'" selected >'+[xUI.XPS.job.toString(true),decodeURIComponent(xUI.XPS.currentStatus)].join('//') +'</option>';
//		document.getElementById('pmcui_status').innerHTML= xUI.XPS.currentStatus.toString();
		document.getElementById('headerInfoWritable').innerHTML= (xUI.viewOnly)?'[編集不可] ':' ';
		if (xUI.viewOnly){
			document.getElementById('pmcui_documentWritable').innerHTML= '[編集不可] ';
			$('#documentWritable').show();
		}else{
			document.getElementById('pmcui_documentWritable').innerHTML= ' ';
			$('#documentWritable').hide();
		};
		document.getElementById('headerInfoWritable').innerHTML += String(xUI.sessionRetrace);
		document.getElementById('pmcui_documentWritable').innerHTML += String(xUI.sessionRetrace);
		switch (xUI.uiMode){
		case 'production':
			document.getElementById('pmcui').style.backgroundColor = '#bbbbdd';
			document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusEdit);
		break;
		case 'management':
			document.getElementById('pmcui').style.backgroundColor = '#ddbbbb';
			document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusAdmin);
		break;
		case 'browsing':
			document.getElementById('pmcui').style.backgroundColor = '#bbddbb';
			document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusView);
		break;
		default:;// floating and other
			document.getElementById('pmcui').style.backgroundColor = '#dddddd';
			document.getElementById('edchg').innerHTML=localize(nas.uiMsg.statusView);
		};
//読み出しコントローラ抑制
		if(
			(serviceAgent.currentStatus=='online-single')&&
			(xUI.XPS.currentStatus.content.indexOf('Active')<0)
		){
			document.getElementById('updateSCiTarget').disabled=true;
			xUI.pMenu('pMimportDatas','desable');//プルダウンメニュー  
			xUI.pMenu('pMopenFS','disable');		//ファイルオープン
			xUI.pMenu('pMopenFSps','disable');	  //Photoshop用ファイルオープン
			document.getElementById('ibMimportDatas').disabled=true;  //アイコンボタンインポート（オープン）
			document.getElementById('dataLoaderGet').disabled=true;   //変換パネルの取り込みボタン
			document.getElementById('myCurrentFile').disabled=true;   //ファイルインプット
		}else{
			document.getElementById('updateSCiTarget').disabled=false;
			xUI.pMenu('pMimportDatas','enable');//プルダウンメニュー  
			xUI.pMenu('pMopenFS','enable');		//ファイルオープン
			xUI.pMenu('pMopenFSps','enable');	  //Photoshop用ファイルオープン
			document.getElementById('ibMimportDatas').disabled=false;  //アイコンボタンインポート（オープン）
			document.getElementById('dataLoaderGet').disabled=false;   //変換パネルの取り込みボタン
			document.getElementById('myCurrentFile').disabled=false;   //ファイルインプット
		};
	},
	"fct":function(){
//フレームの移動があったらカウンタを更新
		document.getElementById("fct0").value = nas.Frm2FCT(xUI.Select[1],xUI.fct0[0],xUI.fct0[1],0,this.XPS.framerate);
		document.getElementById("fct1").value = nas.Frm2FCT(xUI.Select[1],xUI.fct1[0],xUI.fct1[1],0,this.XPS.framerate);
	},
	"lvl":function(){
//レイヤの移動があったらボタンラベルを更新
//ボタンラベルと同時にブランクメソッドセレクタを更新
//フォーカスのあるトラックの情報を取得
		if (xUI.Select[0]>0 && xUI.Select[0]<XPS.xpsTracks.length){
			var label=XPS.xpsTracks[xUI.Select[0]]["id"];
			var bmtd=XPS.xpsTracks[xUI.Select[0]]["blmtd"];
			var bpos=XPS.xpsTracks[xUI.Select[0]]["blpos"];
			stat=(XPS.xpsTracks[xUI.Select[0]]["option"].match(/still|timing|replacement/))? false:true;
		}else{
			var label=(xUI.Select[0]==0)? "台詞":"メモ";//
			var bmtd=xUI.blmtd;
			var bpos=xUI.blpos;
			stat=true;
		};
		document.getElementById("activeLvl").value=label;
		document.getElementById("activeLvl").disabled=stat;
		if(document.getElementById('tBtrackSelect').link){
			document.getElementById('tBtrackSelect').link.select(xUI.Select[0]);
			document.getElementById('tBtrackSelect').onchange();
		};
//現在タイムリマップトラック以外はdisable  将来的には各トラックごとの処理あり
		document.getElementById("blmtd").value=bmtd;
		document.getElementById("blpos").value=bpos;
		document.getElementById("blmtd").disabled=stat;
		document.getElementById("blpos").disabled=stat;
		if(! document.getElementById("blpos").disabled) chkPostat();
	},
	"spinS":function(){
		document.getElementById("spinCk").checked	   = xUI.spinSelect;
		document.getElementById('spinSlider').innerText = (xUI.spinSelect)? '連動' : '';
	},
	"ipMode":function(){
//表示
		document.getElementById("iptChange").value	 = xUI.ipMode;
		$("#iptChange").css('background-color',["#eee","#ddd","#ccc"][xUI.ipMode]);
		document.getElementById('iptSlider').innerText = ['','動画','原画'][xUI.ipMode];
		$('#iptSlider').css('left',["1px","22px","44px"][xUI.ipMode]);
	},
	"title":function(){
		var titleStyle=0;
		if(useworkTitle && workTitle[XPS["title"]]){
			if(workTitle[XPS["title"]].linkURL){
				var linkURL=workTitle[XPS["title"]].linkURL;
				var titleText=(workTitle[XPS["title"]].titleText)?workTitle[XPS["title"]].titleText:workTitle[XPS["title"]].linkURL;
				titleStyle += 1;
			};
			if(workTitle[XPS["title"]].imgSrc){
				var imgSrc=workTitle[XPS["title"]].imgSrc;
				var ALTText=(workTitle[XPS["title"]].ALTtext)?
				workTitle[XPS["title"]].ALTtext:workTitle[XPS["title"]].imgSrc;
				titleStyle += 10;
			};
			switch(titleStyle){
			11:	;//画像ありリンクあり
				var titleString="<a href=\""+linkURL+"\" title=\""+titleText+"\"  target=_new><img src=\""+imgSrc+"\" ALT=\""+ALTText+"\" border=0></a>";
			break;
			10:	;//画像のみ
				var titleString="<img src=\""+imgSrc+"\" ALT=\""+ALTText+"\" border=0>";
			break;
			1:		;//画像なしリンクあり
				var titleString="<a href=\""+linkURL+"\" title=\""+titleText+"\" target=_new>"+XPS["title"]+" </a>";
			break;
			default:
				var titleString=(xUI.XPS["title"])? xUI.XPS["title"] : "";
			};

		}else{
			var titleString=(xUI.XPS["title"])? xUI.XPS["title"] : "";
		};
		if(document.getElementById("title")) document.getElementById("title").innerHTML=titleString;
		if(xUI.viewMode != "Compact"){
			for (pg=1;pg<=Math.ceil(xUI.XPS.duration()/xUI.PageLength);pg++){
				document.getElementById(prop+pg).innerHTML=titleString+"/"+XPS.subtitle;
			};
		};
		document.getElementById("XpsIdentifier").innerHTML=decodeURIComponent(Xps.getIdentifier(xUI.XPS,'cut'));
	},
	"opus":function(){
		if(document.getElementById(prop)) document.getElementById(prop).innerHTML=(XPS[prop])? XPS[prop] : "";
		xUI.sync("title");
	},
	"subtitle":function(){
		if(document.getElementById(prop)) document.getElementById(prop).innerHTML=(XPS[prop])? XPS[prop] : "";
		xUI.sync("title");
	},
	"create_time":function(){
		document.getElementById(prop).innerHTML = (xUI.XPS[prop])? xUI.XPS[prop] : "<br />";
		if(xUI.viewMode != "Compact"){
			for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
				document.getElementById(prop+pg).innerHTML=(xUI.XPS[prop])? xUI.XPS[prop] : "<br />";
			};
		};
	},
	"update_time":function(){
		document.getElementById(prop).innerHTML = (xUI.XPS[prop])? xUI.XPS[prop] : "<br />";
		if(xUI.viewMode != "Compact"){
			for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
				document.getElementById(prop+pg).innerHTML=(xUI.XPS[prop])? xUI.XPS[prop] : "<br />";
			};
		};
	},
	"update_user":function(){
		document.getElementById(prop).innerHTML = (XPS[prop])? (XPS[prop].toString()).split(':')[0] : "<br />";
		if(xUI.viewMode != "Compact"){
			for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
				document.getElementById(prop+pg).innerHTML=(XPS[prop])? (XPS[prop].toString()).split(':')[0] : "<br />";
			};
		};
	},
	"create_user":function(){
		document.getElementById("current_user_id").value=xUI.currentUser.email;
	},
	"current_user":function(){
		document.getElementById("current_user_id").value=xUI.currentUser.email;
	},
	"scene":function(){
		var scn= xUI.XPS["scene"]; 
		var cut= xUI.XPS["cut"];
		var myValue=(xUI.XPS["scene"] || xUI.XPS["cut"])?  "s" + scn + "-c" + cut :"<br />";
		document.getElementById("scene_cut").innerHTML=myValue;
		if(xUI.viewMode !="Compact"){
			for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
				document.getElementById("scene_cut"+pg).innerHTML=(myValue)? myValue : "<br />";
			};
		};
	},
	"cut":function(){
		var scn= xUI.XPS["scene"]	; 
		var cut= xUI.XPS["cut"]	;
		var myValue=(xUI.XPS["scene"] || xUI.XPS["cut"])?  "s" + scn + "-c" + cut :"<br />";
		document.getElementById("scene_cut").innerHTML=myValue;
		if(xUI.viewMode !="Compact"){
			for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
				document.getElementById("scene_cut"+pg).innerHTML=(myValue)? myValue : "<br />";
			};
		};
	},
	"winTitle":function(){},
	"framerate":function(){},
	"undo":function(){
//undoバッファの状態を見てボタンラベルを更新
		stat=(xUI.activeDocument.undoBuffer.undoPt==0)? true:false ;
		$("#ibMundo").attr("disabled",stat);
	},
	"redo":function(){
//redoバッファの状態を見てボタンラベルを更新
		stat=((xUI.activeDocument.undoBuffer.undoPt+1)>=xUI.activeDocument.undoBuffer.undoStack.length)? true:false ;
		$("#ibMredo").attr("disabled",stat);
	},
	"time":function(){
//時間取得
		var timestr=nas.Frm2FCT(XPS.time(),3,0,XPS.framerate);
		document.getElementById(prop).innerHTML=timestr;
		if(xUI.viewMode !="Compact"){
			for (pg=1;pg<=Math.ceil(XPS.duration()/xUI.PageLength);pg++){
				document.getElementById(prop+pg).innerHTML=(timestr)? timestr : "<br />";
			};
		};
	},
	"trin":function(){xUI.sync('trout');};
	"trout":function(){
		var timestr=nas.Frm2FCT(XPS[prop][0],3,0,XPS.framerate);
		var transit=XPS[prop][1];
		document.getElementById(prop).innerHTML=(XPS[prop][0]==0)? "-<br/>" : " ("+timestr+")";
		var myTransit="";
		if(XPS.trin[0]>0){
			myTransit+="△ "+XPS.trin[1]+'('+nas.Frm2FCT(XPS.trin[0],3,0,XPS.framerate)+')';
		};
		if((XPS.trin[0]>0)&&(XPS.trout[0]>0)){	myTransit+=' / ';}
		if(XPS.trout[0]>0){
			myTransit+="▼ "+XPS.trout[1]+'('+nas.Frm2FCT(XPS.trout[0],3,0,XPS.framerate)+')';
		};
		document.getElementById("transit_data").innerHTML=myTransit;
	},
	"memo":function(){xUI.sync('noteText')},
	"noteText":function(){
		var memoText=XPS.xpsTracks.noteText.toString().replace(/(\r)?\n/g,"<br>");
		if(document.getElementById("memo")) document.getElementById("memo").innerHTML = memoText;//screen画面表示
		if(document.getElementById("memo_prt")){
			document.getElementById("memo_prt").innerHTML = memoText;//printout表示
		};
		var memoImage = xUI.XPS.noteImages.getByLinkAddress('description:');
		if(memoImage){
			document.getElementById('memo_image').style.top = document.getElementById('memo').offsetTop+'px'
//			document.getElementById("memo_image").src = memoImage.img.src;
//			document.getElementById("memo_image_prt").src = memoImage.img.src;
		};
	},
	"tag":	xUI.resetSheet,
	"lbl":	xUI.resetSheet,
	"info_":function(){
//セット変更
		setTimeout(function(){xUI.sync('historySelector')},10);
		var syncset=["opus","title","subtitle","time","trin","trout","scene","update_user","productStatus"];
//		["opus","title","subtitle","time","trin","trout","scene","update_user","memo"];
		for(var n=0;n<syncset.length;n++){xUI.sync(syncset[n])};
	},
	"tool_":function(){
//セット変更
		var syncset=["fct","lvl","undo","redo","spinS","scale"];
		for(var n=0;n<syncset.length;n++){xUI.sync(syncset[n])};
	},
	"pref_":function(){
//セット変更	
	},
	"scene_":function(){
//セット変更
	},
	"about_":function(){
//セット変更
		for(var N=0;N<2;N++){
			if(document.getElementById("myVer"+N)){document.getElementById("myVer"+N).innerHTML= windowTitle};
			if(document.getElementById("myServer"+N)){
				document.getElementById("myServer"+N).innerHTML=(xUI.onSite)? xUI.onSite:"[no server]";
			};
		};
	},
	"data_":function(){},
	"dbg_":function(){},
	"NOP_":function(){}
}

/**
 *  UI同期テーブルをマージ
 *  @params {Object} obj
 *    同期テーブルオブジェクト
 *     <呼びだしキー文字列>:<同期関数>,
 *    テーブルマージ
 *      コンフリクトしたメンバーアイテムはマージされない
 */
xUI.syncTableMergeItems = function(obj){
	let conflictItems = [];
	for( var f in obj){
		if(xUI.syncTable[f]){
			conflictItems.push(f);
		}else{
			xUI.syncTable[f] = obj[f];
		};
	};
	if(conflictItems.length) console.log(conflictItems);
};
/**
 *  @params {String} prop
 *      同期キーワード
 *  @params {Array of String} param
 *      同期ファンクションに与える引数
 *      メニュー類にアプリケーションのステータスを反映させる
 *      xUI.sync() method
 */
xUI.sync = function sync(prop,param){
	if(! (param instanceof Array)) param = [param];
	if(xUI.syncTable[prop] instanceof Function){
//as Function execute
		(xUI.syncTable[prop])(...param);
	}else if(typeof xUI.syncTable[prop] == 'string'){
//as Expression
		Function(xUI.syncTable[prop])();
	}else if(typeof xUI.syncTable[prop] == 'object'){
		let status = Function(xUI.syncTable[prop].value)();//引数を得る式を実行
		if(appHost.platform =='Electron'){
//Electron menu
			if(nas.menuItems.get(prop)){
				uat.MH.parentModule.window.postMessage({
					channel:'system',
					from:{name:xUI.app,id:uat.MH.objectIdf},
					command:xUI.syncTable[prop].type,
					content:[prop,status]
				});
			};
		};
//WEBメニューアイテム・ボタンアイテム等の表示更新
console.log([prop,status]);
		xUI.syncTable[prop].items.forEach((e)=>{
			if(document.getElementById(e)){
				if(xUI.syncTable[prop].type == 'menu-enable'){
//menu-enable
					if(e.indexOf('ibC') == 0){
						$("#"+e).attr("disabled",((status)?false:true));//アイコンボタンメニュー
					}else if((e.indexOf('pM') == 0)||(e.indexOf('cM') == 0)){
						xUI.pMenu(e,(status)?"enable":"disable");//プルダウン|コンテキスト メニュー
					};
				}else if(xUI.syncTable[prop].type == 'menu-check'){
//menu-check
//					$("#"+e).attr("checked",((status)?true:false));//チェックメニュー
					if(document.getElementById(e).id.indexOf('ibC') == 0){
						if(status){
							document.getElementById(e).innerText = "✓";
							nas.HTML.addClass(document.getElementById(e),'boxButtonChecked');
						}else{
							document.getElementById(e).innerText = "";
							nas.HTML.removeClass(document.getElementById(e),'boxButtonChecked');
						};
					}else{
						document.getElementById(e).checked = (status)? true:false;//チェックメニュー
					};
				}else if(xUI.syncTable[prop].type == 'radio-check'){
//radio-check(20220121現在renameDigitsのみ)
					if((e.indexOf('pM') == 0)||(e.indexOf('cM') == 0)){
						$("#"+e+status).attr("checked",true);//プルダウン|コンテキスト メニュー
					}else if(e.indexOf('ibC') == 0){
						$("#"+e).attr("checked",true);//アイコンボタンメニュー
					}else if(document.getElementById(e) instanceof HTMLSelectElement){
						document.getElementById(e).value = document.getElementById(e+status).value;
//						if(document.getElementById(e).onchange) document.getElementById(e).onchange();
					};
				}else if(xUI.syncTable[prop].type == 'item-value'){
//item-value
					document.getElementBy(e).value = status;
				}else if(xUI.syncTable[prop].type == 'show-hide'){
//show-hide
					if(status){$("#"+e).show();}else{$("#"+e).hide();};
				};
			};
		});
	};
//windowTitle及び保存処理系をアプリごとに変更??
	if(xUI.app == 'remaping'){
//windowTitle及び保存処理系は無条件で変更
		if(xUI.init){
// ウィンドウタイトル
			var winTitle=decodeURIComponent(xUI.XPS.getIdentifier('cut'));
			if((appHost.platform == "AIR") && (fileBox.currentFile)){
				winTitle = fileBox.currentFile.name;
			};
			if(! xUI.isStored()) winTitle = "*"+winTitle;//未保存
			if(document.title != winTitle) document.title = winTitle ;//異なる場合のみ書き直す
			if(document.getElementById('pmcui')){
				if(! xUI.isStored()){
					if(document.getElementById('pmcui-update').disabled == true) document.getElementById('pmcui-update').disabled = false;
					xUI.pMenu('pMsave','enable');
				}else{
					if(document.getElementById('pmcui-update').disabled == false) document.getElementById('pmcui-update').disabled = true;
					xUI.pMenu('pMsave','false');
				};
			};
			if(xUI.canvasPaint.active) xUI.canvasPaint.syncCommand();
		};
//	}else if(xUI.app == 'pman_reName'){
//	}else if(xUI.app == 'pman'){
//	}else if(xUI.app == 'xpseditor'){
//	}else if(xUI.app == 'sbdConvert'){
	}else{
		document.title = xUI.app;
	};
}
