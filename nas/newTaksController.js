/**
    ｘUIにタスクコントローラを設けてバックグラウンド処理をコントロールする
    以下のプロパティを新設

 ■□◀▶◇◆①
    
*/

var startupTaskController=function(){
        xUI.player = {};
    xUI.player.startClick = (new Date()).getTime();
    xUI.player.stopClick  = xUI.player.startClick;
    xUI.player.status     = 'stop';
    xUI.player.loop       = false;
    xUI.player.standbyStart = false;
    xUI.player.wait       = 10000;
    xUI.player.keyboard	  = false;
    xUI.player.markSwap   = false
    xUI.player.waitCount  = 0;
    xUI.player.countStack = [];
    xUI.player.countAnimation=['■■■■#■■■■','□■■■#■■■■','□□■■#■■■■','□□□■#■■■■','□□□□#■■■■','□□□□#□■■■','□□□□#□□■■','□□□□#□□□■','□□□□#□□□□','＝＝＝＝③＝＝＝＝','＝＝＝＝②＝＝＝＝','ーーーー◆ーーーー']
    
    xUI.player.start = function(clickClock){
        xUI.player.startClick = (new Date()).getTime();
        if(clickClock)xUI.player.startClick =clickClock;
//        waitClocks = (isNaN(waitClocks))? 0:parseInt(waitClocks);
        xUI.selectBackup      = xUI.Select.slice();
        xUI.selectionBackup   = xUI.Selection.slice();
        xUI.selection();//バックアップとってクリア
        xUI.player.waitCount     = parseInt(xUI.player.wait);
        xUI.player.currentFrame  = 0 ;//処理中のフレーム
        xUI.player.getCount      = false ;//フレーム取得フラグリセット
//        xUI.player.countStack    = [];//スタート時点の自動クリアを行わない　明示的なクリアまでマークと共に保持する
        xUI.player.status        = 'run';
    };
    xUI.player.stop      = function(clickClock){
        xUI.player.stopClick = (new Date()).getTime();
        xUI.player.status   = 'stop';
        if(clickClock)xUI.player.stopClick =clickClock;
        xUI.selection(add(xUI.Select,xUI.selectionBackup));
        if(this.waitCount !=0 ){ this.waitCount=0;if(document.getElementById("timerDisplay").innerHTML) document.getElementById("timerDisplay").innerHTML='';}
    };
    
      xUI.taskQueue = [];//タスク待ち配列
/*
    配列メソッドのpush/popは使用可能
    編集も基本的には配列メソッドを使用
    add(task)
    タスク優先度の編集が可能なようにする
    繰り返しタスクの実行間隔はタスク自身で制御可能なようにする
    タスクにwaitプロパティを置いてインターバル毎に減算を行う？
    インターバルプロパティにインターバル間隔をミリ秒で設定する  実行間隔０のタスクは毎スキャン毎に実行される？
    ウェイトプロパティはタスク自身が１タスク終了時に次のタスク実行時限を設定する
    タスク実行時限に達しないタスクは実行されない
    タスク実行時限により実行されたタスクのwaitプロパティは、実行コントローラにより０に設定される。
    このタスクはタスク自身がwaitプロパティを適切に変更しない限りコントローラの次回巡回時に削除される
    
    タスクの初期化をコンストラクタ関数一回で行うようにしたい
ex:
    A= new UItask(
        function(){ヘゲへげ},
        interval,
        wait,
        status
    )
     タスク自身を関数として実行すると自身のプロパティをコントロールした後procを実行するように設定する
     コントローラは、直接はproxを実行しない。
 */
      xUI.taskQueue.ctrl=function(){
         
      }
      function UItask(proc,interval,wait,status){
         this.prox     = proc;
         this.status   = status;
         this.interval = interval;
         this.wait     = wait;
         this.execute  = function(){
             this.prox();
         }
         this.abort  = function(){
             
         }
         this.stop   =function(){
             
         }
      };
/**
    xUIタスク監視手続
    タスクウオッチャーは、一定時間でコールされてタスクキューを処理する
    xUI.taskQueueコレクションにタスクを積む
    少数のリアルタイム性を要するタスクに関しては、キューの機能をコントローラ自身で監理する
    キューに格納されるオブジェクトは、基本的には実行可能な関数を引数として持つ
    それぞれのオブジェクトは以下のステータスを持つ
    ステータスは実行状態により変化する
    UItask.status = "waiting";

    waiting/実行待ち  コントローラはこのタスクを実行してステータスをrunningに変更する
    running/実行中 既にファイアしているので何も処理しない
    holding/実行がホールドされている。既にファイアしているので何も処理しない
    closed/実行が終了している。コントローラは、このタスクを消去する
    UItask.proc  
        実際に実行されるプロシジャ
     タスク自身のオブジェクトメソッドにはしないでコントロール関数を置く
     タスク実行用のインターバルプロシジャはなるべく小さくする。
*/
xUI.tskWatcher = function(){
	var ClockClicks = (new Date()).getTime();
    var frms = Math.floor((ClockClicks - (xUI.player.startClick+xUI.player.wait)) / (1000 / xUI.XPS.framerate));
//play head move
    if(xUI.player.status  ==  'run'){
      if(xUI.player.waitCount > 0){
    	//waiting
        var count = xUI.player.wait-(ClockClicks-xUI.player.startClick);//スタート後の経過時間をウエイトから減算して残ウエイトを出す
        if(xUI.player.waitCount) {
            var waitCountSecond = Math.ceil(xUI.player.waitCount / 1000);//(Math.floor(xUI.player.waitCount%1000/100) < 10)? "":waitCountSecond;//?
            if(xUI.player.waitCount < 1001){
            	var countString = (xUI.player.waitCount < 916)?'':xUI.player.countAnimation[11];
            }else if(xUI.player.waitCount < 3001){	
            	var countString = ((xUI.player.waitCount%1000) < 750)?'':(xUI.player.countAnimation[12-waitCountSecond]);
            }else{
            	var countString = xUI.player.countAnimation[Math.floor((xUI.player.waitCount%1000)/125)+1].replace(/\#/,String(waitCountSecond));	
            }
            if(document.getElementById("timerDisplay").innerHTML!=countString)
            	document.getElementById("timerDisplay").innerHTML=countString;
            xUI.player.waitCount = count;
        }else{
            if(document.getElementById("timerDisplay").innerHTML) document.getElementById("timerDisplay").innerHTML='';
        }
      }else{ 
        var currentOffset = (xUI.selectBackup[1]+frms);//再生開始後の経過フレーム
        if((! xUI.player.loop)&&(currentOffset >= xUI.XPS.xpsTracks.duration)){
        	var standbyFrame=(xUI.player.standbyStart)? 0:xUI.XPS.xpsTracks.duration-1;
            xUI.player.stop();xUI.selectCell([xUI.Select[0],standbyFrame]);//終了フレーム
        }else{
            var currentFrame = currentOffset % xUI.XPS.xpsTracks.duration;
            if(xUI.Select[1] != currentFrame) xUI.selectCell([xUI.Select[0],currentFrame]);
            if(currentFrame != xUI.player.currentFrame){
                xUI.player.currentFrame = currentFrame;
                if(xUI.player.getCount){
                     xUI.player.countStack.push([xUI.Select[0],currentFrame]);
                     markFrame(document.getElementById([xUI.Select[0],currentFrame].join('_')));
                }
            }
        }
      }
	}
/*   タスク列処理  */
    for(var tid = xUI.taskQueue.length -1 ;tid >= 0; tid --){
        if(xUI.taskQueue[tid].status == 'waiting'){
            xUI.taskQueue[tid].status = 'closed';
            setTimeout(xUI.taskQueue[tid].proc,0);
        }else if(xUI.taskQueue[tid].status == 'closed') {
            xUI.taskQueue.splice(tid,1);
        }
    }
}
xUI.taskQueue.push(new UItask());
setInterval(xUI.tskWatcher,10);
}
//  タスク監視スタートアップはこのプロシジャ全体をxUIの再初期化あとに実行する必要あり  2018 08 29
// test
/** ストップウオッチ機能のための補助機能

*/
markFrame=function(element){
     element.style.backgroundColor='red';//フォーカスの通過でクリアされるのであまり意味がない?
     element.innerHTML='<span style="color:red;">◆</span>';
}
clearMark=function(){
	xUI.selectCell([xUI.Select[0],0]);
	xUI.resetSheet();
    xUI.player.countStack=[];
}
buildCount=function(trackID){
    var buidTarget=[];
    for (var cix = 0 ; cix < xUI.countStack.length ;cix ++){
        if(xUI.countStack[cix][0]==trackID) buidTarget.push(xUI.countStack[cix][1])
    }
    for (var fix = 0 ; fix < buitdTarget.length ; fix ++){
        var sectionStart=0;        sectionEnd=0
    }
    
}