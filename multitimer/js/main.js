var TimerApp = angular.module('TimerApp', []);


TimerApp.controller('EntireCtrl', function ($scope) {
	$scope.timers = _.map(_.range(5),function(i){
		return {name: ''+(i+1),value: 0};
	});

	$scope.fullTime = 5;

	$scope.addTimer = function(){
		$scope.timers.push({name: mkName(),value:0});
	};
	$scope.removeTimer = function(obj) {
		var idx = findIndex($scope.timers,obj.timer.name);
		if(idx>=0)
			$scope.timers.splice(idx,1);
	};
	function findIndex(arr,name){
		var idx = -1;
		for(var i = 0; i < arr.length; i++){
			if(arr[i].name == name) return i;
		}
		return idx;
	}
	function mkName(){
		var c = $scope.timers.length;
		var n = ""+(c+1);
		while(findIndex($scope.timers,n) >= 0){
			c += 1;
			n = ""+(c+1);
		}
		return n;
	}

	$scope.keyDown = function(event){
		console.log(event,event.keyCode);
		if(event.keyCode>=48 && event.keyCode <=57){
			var num = (event.keyCode - 48);
			var idx = findIndex($scope.timers,+num);
			console.log(num,idx);
			if(idx>=0){
//				_.map($scope.timers,function(t){t.selected = false;});
				$scope.timers[idx].selected = true;
			}
		}
		console.log($scope.timers);
	};
});

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToStr(c){
	return '#' + _.map(c,function(e){return e.toString(16);}).join('');
};

TimerApp.controller('TimerCtrl',function ($scope,$interval) {
	$scope.running = false;
	$scope.selected = false;
	$scope.start = function(){
		if($scope.timerObj) return;

		$scope.startTime = new Date().getTime();
		$scope.running = true;
		var factor = 1;
		$scope.timerObj = $interval(function(){
			$scope.timer.value = (new Date().getTime() - $scope.startTime)/1000*factor;
			$scope.barWidth = ""+Math.min($scope.timer.value / ($scope.fullTime*60) * 100,123)+"px";
			var r = Math.min($scope.timer.value / ($scope.fullTime*60),1);
		//	$scope.barColor = r < 0.5 ? 'lightblue' : (r < 0.8 ? 'orange' : 'red');
			$scope.barColor = rgbToStr(hslToRgb(0.5*(1-r),0.5,0.5));
		},200);
	};
	$scope.timerStr = function(){
		return numeral($scope.timer.value).format('00:00:00');
	};
	$scope.stop = function(){
		$scope.running = false;
		$interval.cancel($scope.timerObj);
		$scope.timerObj = null;
	};
	$scope.reset = function(){
		$scope.timer.value = 0;
	};
	$scope.remove = function(){
		$scope.removeTimer(this);
	};
});

