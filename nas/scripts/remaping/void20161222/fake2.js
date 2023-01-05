//	レイヤコンストラクタ
function Layer()
{
//	this.prototype=parentCompo;
	for (prop in parentCompo) this.prototype[prop]=parentCompo[prop];

	this.timeLines=new Array();//データ配列
/*		コンポから受け継ぐ分なので初期化不要
	this.width=w;//幅(バッファ幅・px)
	this.height=h;//高さ(バッファ高さ・px)
	this.pixelAspect=a;//ピクセル縦横比
	this.duration=l;//長さ(継続時間・秒)
	this.framerate=f;//フレームレート(fps)
*/
function layer_init(parentCompo)
{
	for (prop in parentCompo) this.prototype[prop]=parentCompo[prop];
}
function init_(ip,op,apX,apY,poX,poY,scX,scY,rot,opt)
{
		if (! ip) ip=0;
		if (! op) op=this.duration;
	this.inPoint=ip;//イン点(時間・秒)
	this.outPoint=ip;//アウト点(時間・秒)

		if (! apX) apX=0;
		if (! apY) apY=0;
		if (! poX) poX=this.width/2;
		if (! poY) poY=this.heght/2;
		if (! scX) scX=1.0;
		if (! scY) scY=1.0;
		if (! rot) rot=0;
		if (! opt) opt=1.0;
	this.geometry=[apX,apY,poX,poY,scX,scY,rot,opt];
}
//
this.init = init_;
//
	this.init();
}//レイヤ初期化終了

/*
タイムラインの初期化

*/
//	タイムラインコンストラクタ
function TimeLine(parentLayer)
{
	this.prototype=parentLayer;
	this.keyFrames=new Array();//キーフレーム配列
/*
	キーフレームのデータ構造
keyFrame[id]=[TIME,[[値,第一制御点,第二制御点,時間第一制御点,時間第二制御点,空間属性,時間属性],[…],[…]]]

値	キーの値
	プロパティの次数が高い場合はこの値のセットが次数分だけ配列に組まれる
第一制御点	
	空間制御点
	始点位置からの相対位置で与えられる。
第二制御点	
	空間制御点
	終点位置からの相対位置で与えられる。
時間第一制御点	
	時間制御点
	始点時間から区間比で与えられる。
時間第二制御点	
	時間制御点
	終点時間から区間比で与えられる。
空間属性
	補完フラグ
	linear/curve/stop
時間属性	
	補完フラグ
	linear/curve/stop
タイムラインは、それぞれの種別によって保持するデータ内容や、振る舞いが異なるのでクラスを与えて再初期化する必要がある。
*/
function init_(TimeLineClass)
{
	switch (timeLineClass){
case	"TimeRemap"	:	;//タイムリマップ・次数1・実数値
case	"anchorPoint"	:	;//
case	"position"	:	;//
case	"scale"	:	;//
case	"rotation"	:	;//
case	"opacity"	:	;//
case	"スライダ制御"	:	;//
case	"変換終了"	:	;//
case	"Effects"	:	;//
default	:
	this.timelineClass=timeLineClass;
	}
}
//
this.init	=	init_	;
//
//
/*
	valueAtTime(){キーフレームを補完した値を返すメソッド}
//タイムライン種別 ジオメトリ・エフェクト・リマップなどなど
//(TimeRemap)/AnchorPoint/Position/Scale/Rotation/(Opacity)/
//(Effects)
*/
function ValueAtTime_(time)
{
	if (time<0 || time>this.duration)return null;
		for (i=0 ; i<this.KeyFrames.length;i++)
	if (Math.abs(time-KeyFrames[i][0])<this.frameDuration) 
	{
		resultValue=KeyFrames[i][1][0];
		break;
	}else{
		resultValue="no_hit";
	}

	return resultValue;
}
//
	this.valueAtTime=ValueAtTime_;
//
}//タイムライン初期化おしまい


