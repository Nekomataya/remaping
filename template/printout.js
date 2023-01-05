/** printout.js
印刷用画面整形スクリプトサブセット
　replaceEndMarker    タイムシートの終了マーカーを再配置
　replaceGraphics    画像パーツ置きかえ
*/
replaceEndMarker=function (){
    var endPoint = JSON.parse(document.getElementById("endMarker").innerHTML);
    var endCellLeft  = document.getElementById("0_"+String(endPoint[1]-1));
    var endCellRight = document.getElementById(String(endPoint[0]-1)+"_"+String(endPoint[1]-1));
    var parentSheet  = document.getElementById("endMarker").parentNode;
    var endCellLeftRect  = endCellLeft.getBoundingClientRect();
    var endCellRightRect = endCellRight.getBoundingClientRect();
    var parentRect   = parentSheet.getBoundingClientRect();
    var markerRect   = document.getElementById("endMarker").getBoundingClientRect();
    var markerWidth  = String(endCellRightRect.right-endCellLeftRect.left)+"px";
    var markerTop    = String(endCellLeftRect.bottom - parentRect.bottom + (markerRect.height))+ "px" ;
    var markerLeft   = String(endCellLeftRect.left-parentRect.left)+"px";
    document.getElementById("endMarker").style.left  = markerLeft;
    document.getElementById("endMarker").style.top   = markerTop;
    document.getElementById("endMarker").style.width = markerWidth;
    document.getElementById("endMarker").innerHTML = ":: end ::";
}
resizePage2Paper=function(){
    var areaHeight = 1250;
    xUI.adjustScale([1,1]);//reset
    var pgRect=document.getElementById("printPg1").getBoundingClientRect();
    xUI.adjustScale([1,areaHeight/pgRect.height]);
}
resizePage2Paper();

印刷時のサイズ調整スケーリング(高さのみ)    
    var tableRect  = document.getElementsByClassName("sheet")[0].getBoundingClientRect();
    var baseHeight = 1580;//
    var xScale = 1;
    var yScale = (baseHeight-280)/tableRect.height;
    $(".sheet").css({"transform":"scale("+[xScale,yScale].join()+")","transform-origin":"0 0"});
    $(".printPage").css({"height":baseHeight});
    xUI.replaceEndMarker(undefined,4);//編集HTML用のみ
