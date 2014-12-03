// main.js

var timer;
var timer_start;

$(function(){
	var clickCount = 0;
	var active = true;
	var opened = [];
	var totalCount = 0;
	var totalClickCount = 0;

	var img = 'cells/1.jpg';
	var idx = _.take(_.shuffle(_.range(1,13)),8);
	idx = idx.concat(idx);
	idx = _.shuffle(idx);
	for(var i=0;i<16;i++){
		$('#cell'+(i+1)).html('<img class="card" data-idx="'+idx[i]+'" src="cells/'+idx[i]+'.jpg">');
	}
	$('.cell.notyet').on('click',function(e){
		if(!active){
			return;
		}

		clickCount += 1;
		totalClickCount += 1;
		if(totalClickCount == 1){
			timer_start = new Date();
			timer = window.setInterval(function(){
				var d = new Date() - timer_start;
				$('#timer').html(''+Math.floor(d/1000)+' sec.');
			},200)
		}
		var img = $(e.target).find('img');
		img.addClass('open');
		opened.push(img.attr('data-idx'));
		if(clickCount == 2){
			active = false;
			if(opened[0] == opened[1]){
				$('img[data-idx='+opened[0]+']').parent().removeClass('notyet');
				$('img[data-idx='+opened[1]+']').parent().removeClass('notyet');
				opened = [];
				totalCount += 2;
				if(totalCount == 16){
					congrats();
				}else{
					nice();
				}
			}else{

			}
			window.setTimeout(function(){
				clickCount = 0;
				$('img.card').removeClass('open');
				active = true;
				opened = [];
			},500);
		}
	});
});

var timeout;
var msg_timer;

function message(html){
	$('#msg').html(html);
	$('#msg').show();
	timeout = new Date() + 900;
	console.log(timeout);
	msg_timer = window.setTimeout(function(){
			$('#msg').hide();
	},2000);
}

function nice(){
	message('You got it.');
}
function congrats(){
	$('#msg').html('Congratulations!');
	$('#msg').show();
	window.clearInterval(msg_timer);
	window.clearInterval(timer);
}