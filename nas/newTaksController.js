/**
    ｘUIにタスクコントローラを設けてバックグラウンド処理をコントロールする
    以下のプロパティを新設
    
*/
var startupTaskController=function(){
        xUI.player = {};
    xUI.player.startClick = (new Date()).getTime();
    xUI.player.status     = 'stop';
    xUI.player.loop       = false;
    xUI.player.wait       = 0;
    xUI.player.waitCount  = 0;
    xUI.player.countStack = [];
    
    xUI.player.start = function(waitClocks){
        xUI.player.startClick = (new Date()).getTime();
        waitClocks = (isNaN(waitClocks))? 0:parseInt(waitClocks);
        xUI.selectBackup      = xUI.Select.slice();
        xUI.selectionBackup   = xUI.Selection.slice();
        xUI.selection();//バックアップとってクリア
        xUI.player.wait       = (waitClocks)?  waitClocks : 0;
        xUI.player.waitCount     = parseInt(xUI.player.wait);
        xUI.player.currentFrame  = 0 ;//処理中のフレーム
        xUI.player.getCount      = false ;//フレーム取得フラグ
        xUI.player.countStack    = [];//clear data stack
        xUI.player.status        = 'run';
        console.log(xUI.player.wait);
        console.log(waitClocks);
    };
    xUI.player.stop      = function(){
        xUI.player.status   = 'stop';
        xUI.selection(add(xUI.Select,xUI.selectionBackup));
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
//wait
      if(xUI.player.waitCount > 0){
        var count = xUI.player.wait-(ClockClicks-xUI.player.startClick);
//        var countString = ([Math.floor (xUI.player.waitCount / 1000),(xUI.player.waitCount%1000)/100]).join('_');
        if(xUI.player.waitCount) {
            var countString = ([Math.ceil(xUI.player.waitCount / 1000),('---------|').slice(-1*Math.floor(xUI.player.waitCount%1000/100))]).join('');
            if(document.getElementById("app_status").innerHTML!=countString) xUI.printStatus(countString);
            xUI.player.waitCount = count;
        }else{
            xUI.printStatus();
        }
      } else if(document.getElementById("app_status").innerHTML) {xUI.printStatus();}
      
        var currentOffset = (xUI.selectBackup[1]+frms);//再生開始後の経過フレーム
        if((! xUI.player.loop)&&(currentOffset >= xUI.XPS.xpsTracks.duration)){
            xUI.player.stop();xUI.selectCell([xUI.Select[0],0]);
            console.log(xUI.player.countStack);
        }else{
            var currentFrame = currentOffset % xUI.XPS.xpsTracks.duration;
            if(xUI.Select[1] != currentFrame) xUI.selectCell([xUI.Select[0],currentFrame]);
            if(currentFrame != xUI.player.currentFrame){
                xUI.player.currentFrame = currentFrame;
                if(xUI.player.getCount){
                     xUI.player.countStack.push(currentFrame);
                     document.getElementById([xUI.Select[0],currentFrame].join('_')).innerHTML="XXX";
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
//  タスク監視スタートアップはこのプロシジャ全体をxUIの最初期化あとに実行する必要あり  2018 08 29
// test
