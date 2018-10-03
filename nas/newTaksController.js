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
    xUI.player.standbyStart = true;
    xUI.player.wait       = 0;
    xUI.player.keyboard	  = false;
    xUI.player.markSwap   = false
    xUI.player.waitCount  = 0;
    xUI.player.countStack = [];
    xUI.player.countAnimation=['■■■■#■■■■','□■■■#■■■■','□□■■#■■■■','□□□■#■■■■','□□□□#■■■■','□□□□#□■■■','□□□□#□□■■','□□□□#□□□■','□□□□#□□□□','＝＝＝＝③＝＝＝＝','＝＝＝＝②＝＝＝＝','ーーーー◆ーーーー']
    
    xUI.player.start = function(withMark,clickClock){
        xUI.player.startClick = (new Date()).getTime();
        if(clickClock)xUI.player.startClick =clickClock;
//        waitClocks = (isNaN(waitClocks))? 0:parseInt(waitClocks);
        xUI.selectBackup      = xUI.Select.slice();
        xUI.selectionBackup   = xUI.Selection.slice();
        xUI.selection();//バックアップとってクリア
        xUI.player.waitCount     = parseInt(xUI.player.wait);
        xUI.player.currentFrame  = 0 ;//処理中のフレーム
        if(withMark){
//	        xUI.player.markFrame(document.getElementById(xUI.Select.join('_')));
	        xUI.player.markFrame(xUI.Select);
//            xUI.player.countStack.push(xUI.Select);
            xUI.player.getCount      = true  ;//フレーム取得フラグセット
        }else{
            xUI.player.getCount      = false ;//フレーム取得フラグリセット
        }
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
/** ストップウオッチ機能のための補助機能

*/
/**
 *    セルにマーカーを配置してマークをスタックする
 */
xUI.player.markFrame=function(element){
    if(element instanceof Array){
        this.countStack.push(element);
        element=document.getElementById(element.join('_'))
    }else{
        this.countStack.push(element.id.split('_'));
    }
    element.classList.add("trackMarker");
}
/**
 *    セルマーカー及びスタックをクリア
 */
xUI.player.clearMark=function(){
    (function(){
        for (var trk = 0 ;trk < xUI.XPS.xpsTracks.length ; trk++){
            for (var frm = 0 ;frm < xUI.XPS.xpsTracks[0].length ; frm++){
                var cell = document.getElementById([trk,frm].join('_'));
                if(cell.classList.contains('trackMarker')) cell.classList.remove('trackMarker');
            }
        }
    })();
    xUI.player.countStack=[];
}
/**
 *    
 */
xUI.player.buildCount=function(trackID){
    var currentFrame = xUI.Select[1];
    var targetTrack = xUI.XPS.xpsTracks[xUI.Select[0]];
    var buidTarget=new Array(xUI.XPS.xpsTracks.length);
    for (idx=0;idx < buidTarget.length;idx++){buidTarget[idx]=[];}    
//マークをソート
    xUI.player.countStack.sort(function(a,b){
        if (a[0] < b[0]) return -1
        else if (a[0] > b[0]) return 1
        else if (a[1] < b[1]) return -1
        else if (a[1] > b[1]) return 1
        return 0;
    });
//重複マークを削除してトラック別にソート
    var currentMark=[null,null];
    for (var cix = 0 ; cix < xUI.player.countStack.length ;cix ++){
        if((xUI.player.countStack[cix][0]==currentMark[0])&&(xUI.player.countStack[cix][1]==currentMark[1])) continue;
         buidTarget[xUI.player.countStack[cix][0]].push(xUI.player.countStack[cix][1]);
         currentMark=xUI.player.countStack[cix];
    }
//ターゲットトラックを区間パース
    var buildSections=[{
        startFrame:0,
        duration:0,
        value:false
    }];
    var currentSection = buildSections[0];
    if(buidTarget[xUI.Select[0]].length==0){
        currentSection.duration=targetTrack.length;
    }else{
        if (buidTarget[xUI.Select[0]][0] != 0){
            currentSection.value = false;
            currentSection.duration = buidTarget[xUI.Select[0]][0];
            currentSection = buildSections[ buildSections.push({
                startFrame:buidTarget[xUI.Select[0]][0],
                duration:1,
                value:true
            })-1];
        }else{
            currentSection.value = true;
            currentSection.duration = 1;            
        }
        for(var ix = 1; ix < buidTarget[xUI.Select[0]].length; ix++){
            if(buidTarget[xUI.Select[0]][ix]==(buidTarget[xUI.Select[0]][ix-1]+1)){
                currentSection.duration ++;
            }else{
                buildSections.push({
                    startFrame:buidTarget[xUI.Select[0]][ix-1]+1,
                    duration:buidTarget[xUI.Select[0]][ix]-buidTarget[xUI.Select[0]][ix-1]-1,
                    value:false
                });
                currentSection = buildSections[buildSections.push({
                    startFrame:buidTarget[xUI.Select[0]][ix],
                    duration:1,
                    value:true
                })-1];
            }
        }
        if((currentSection.startFrame + currentSection.duration) < targetTrack.length){
            buildSections.push({
                startFrame:currentSection.startFrame+currentSection.duration,
                duration:targetTrack.length-currentSection.startFrame-currentSection.duration,
                value:false
            });        }
    }
    if (targetTrack.option.match(/dialog|camera|camerawork|geometry|effect|sfx|composite/)){
        var backup=[xUI.Select.slice(),xUI.Selection.slice()];
        for(var sx=0;sx < buildSections.length; sx ++){
            if (buildSections[sx].value){
                xUI.selection();
                if(targetTrack.option=='dialog'){
                    xUI.selectCell([xUI.Select[0],buildSections[sx].startFrame-2]);
                    var extCount = (buildSections[sx].duration <= 4)? 0 : buildSections[sx].duration-4;
                    xUI.put('名前,----,セ,リ,フ, ~,'+(new Array(extCount).join(','))+',----')
                }else{
                    xUI.selectCell([xUI.Select[0],buildSections[sx].startFrame]);
                    var writeContent=["▽"];
                    for(var cc=0;cc<(buildSections[sx].duration-2);cc++) writeContent.push('|');
                    writeContent.push("△");
                    xUI.put(writeContent.join(','));
                }
            }
        }
        xUI.selectCell(backup[0]);
        xUI.selection(add(backup[0],backup[1]));
    }else{
        for(var sx=0;sx < buildSections.length; sx ++){
            if (
                (buildSections[sx].startFrame<=xUI.Select[1])&&
                ((buildSections[sx].startFrame+buildSections[sx].duration)>xUI.Select[1])
            ){
                xUI.selectCell([xUI.Select[0],buildSections[sx].startFrame]);
                xUI.selection([xUI.Select[0],buildSections[sx].startFrame+buildSections[sx].duration-1]);
                return;
            }
        }
        
    }  

console.log(buildSections);    
}
    
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
            var currentTrack = (! xUI.player.loop)? xUI.Select[0]:Math.floor(currentOffset/xUI.XPS.xpsTracks.duration);            if((xUI.Select[0] != currentTrack) || (xUI.Select[1] != currentFrame))xUI.selectCell([currentTrack,currentFrame]);
            if(currentFrame != xUI.player.currentFrame){
                xUI.player.currentFrame = currentFrame;
                if(xUI.player.getCount){
                     xUI.player.markFrame([currentTrack,currentFrame]);
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
