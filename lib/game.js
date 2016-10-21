/*
game.gr.jp のライブラリ
*/

/*/////////////// 押されたキ－コード取得用関数   UseFree
========================================================
 Win  n4 n6 moz e4 e5 e6,
 Mac  n4 n6 moz e4.5 e5,
 Linux n4 n6 moz         
========================================================
 押されたキ－コードを取得します。
 キ－の文を取得したい場合は、getKEYSTR(e)を
 参照してください

 使用例  //押されたキ－コードをダイアログに表示する
  alert( getKEYCODE(e) )

 Support http://game.gr.jp/js/
=======================================================*/

  //--ブラウザを調べてNNとIEの分岐を微調整します
  MSIE = navigator.userAgent.indexOf("MSIE")!=-1 ;
  Safari = navigator.userAgent.indexOf("Safari")!=-1 ;
  //--押されたキ－コードを返す
  function getKEYCODE(e){  

      if(document.all)           return  event.keyCode;
      else if($) 
            return (e.keyCode!=0)?e.keyCode:e.charCode;
      else if(document.layers)   return  e.which;
  }


//--修飾キーのための処理
//イベントを渡して CTRL/ALT/SHIFT 各キーの状態をチェック
function chkCtrl(e){ 

      if($ && !MSIE )
			return (appHost.os=="Mac")? e.metaKey:e.ctrlKey;
//			return  e.ctrlKey;//一時的にメタキーで判定
      else if(document.all)       return  event.ctrlKey;
      else if(document.layers){
        var ctl=e.modifiers;
        if( ctl==2 || ctl==3 || ctl==6 || ctl==7 ) 
             return  true;
        else return  false;
      }
}

function chkAlt(e){ 

      if($ && !MSIE )  
                                  return  e.altKey;
      else if(document.all)       return  event.altKey;
      else if(document.layers){
        var ctl=e.modifiers;
        if( ctl==1 || ctl==3 || ctl==5 || ctl==7 ) 
             return  true;
        else return  false;
      }
}

function chkShift(e){ 

      if($ && !MSIE )  
                                  return  e.shiftKey;
      else if(document.all)       return  event.shiftKey;
      else if(document.layers){
        var ctl=e.modifiers;
        if(  ctl==4 || ctl==5 || ctl==6 || ctl==7 ) 
             return  true;
        else return  false;
      }
}


/*///////////////////////////// HTML出力用関数   UseFree
========================================================
 Win  n4 n6 moz e4 e5 e6,
 Mac  n4 n6 moz e4.5 e5,
 Linux n4 n6 moz         
========================================================
  使用例
  outputLAYER('レイヤ－名',出力するHTML) 

 Support http://game.gr.jp/js/
=======================================================*/

  function outputLAYER(layName,html){

    if($){       //N6,Moz,IE5,IE6用
      document.getElementById(layName).innerHTML=html;

    } else if(document.all){                      //IE4用
      document.all(layName).innerHTML=html;

    } else if(document.layers) {                  //NN4用
       with(document.layers[layName].document){
         open();
         write(html);
         close();
      }
    }

  }

/*///////////////////////////// HTML出力用関数ここまで 
*/

// http://www.fureai.or.jp/~tato/DHTML/simple/part3/cross/

 //内幅(paddingを含み、スクロールバー,border,marginを除く)を求める
  function getINNERWIDTH(oj){
    if(!arguments[0])oj=self;
    if(window.opera)
      return oj.innerWidth;          //o6,o7用
    else if(document.all)
      return oj.document.body.clientWidth;  //e4,e5,e6用
    else if(document.layers)
      return oj.innerWidth;          //n4用
    else if($)
      return  oj.innerWidth;         //n6,n7,m1,s1用
    return null;
  }


 //内高(paddingを含み、スクロールバー,border,marginを除く)を求める
  function getINNERHEIGHT(oj){
    if(!arguments[0])oj=self;
    if(window.opera)
      return oj.innerHeight;         //o6,o7用
    else if(document.all)
      return oj.document.body.clientHeight; //e4,e5,e6用
    else if(document.layers)
      return  oj.innerHeight;        //n4用
    else if($)
      return oj.innerHeight;         //n6,n7,m1,s1用
    return null;
  };


function resizeToWIN(width,height,oj){
    if(!arguments[2])oj=self;
    //--リサイズしてみて内寸取得
    oj.resizeTo(width,height);
    if(window.opera||document.layers){  //n4,o6,o7用
      var w = oj.innerWidth;
      var h = oj.innerHeight;
    } else if(document.all){            //e4,e5,e6用
      var w = oj.document.body.clientWidth;
      var h = oj.document.body.clientHeight;
    } else if($){ //n6,n7,m1,s1用
      var w = oj.innerWidth;   
      var h = oj.innerHeight; 
    }
    //resizeToの結果内寸が 正しければ、そのまま。
    //                     違うなら、差分を加算。
    if(width!=w||height!=h){
      oj.resizeBy((width-w),(height-h));
      if(document.layers)
        oj.location.reload(0); //n4はreloadでresizeバグ回避 
    }
    oj.focus();                //フォーカスする
}