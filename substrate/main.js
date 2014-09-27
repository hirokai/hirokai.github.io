

function calc(x1,y1,x2,y2,r){
	var q = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
	var x3 = (x1+x2)/2;
	var y3 = (y1+y2)/2;
	var x = x3 + Math.sqrt(r*r-(q/2)*(q/2))*(y1-y2)/q;
	var y = y3 + Math.sqrt(r*r-(q/2)*(q/2))*(x2-x1)/q;

  var x_ = x3 - Math.sqrt(r*r-(q/2)*(q/2))*(y1-y2)/q;
	var y_ = y3 - Math.sqrt(r*r-(q/2)*(q/2))*(x2-x1)/q;

	return [x,y,x_,y_];
}

$(function(){
  $('#calc').click(function(){
    var x1 = parseFloat($('#x1').val());
    var y1 = parseFloat($('#y1').val());
    var x2 = parseFloat($('#x2').val());
    var y2 = parseFloat($('#y2').val());
    var r = parseFloat($('#r').val());
    var ans = calc(x1,y1,x2,y2,r);

    
    var xs = parseFloat($('#xs').val());
    var ys = parseFloat($('#ys').val());

    console.log(x1,y1,x2,y2,r,ans);
    var f = function(v){return numeral(v).format('0.00');};

    $('#answer').val([f(ans[0]+xs),f(ans[1]+ys)].join("\t"));
    $('#answer2').val([f(ans[2]+xs),f(ans[3]+ys)].join("\t"));    
  });
});
