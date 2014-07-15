var TimerApp = angular.module('TimerApp', []);


TimerApp.controller('EntireCtrl', function ($scope) {
	$scope.timers = _.map(_.range(5),function(i){
		return {name: ''+(i+1),value: 0};
	});

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

TimerApp.controller('TimerCtrl',function ($scope,$interval) {
	$scope.running = false;
	$scope.selected = false;
	$scope.start = function(){
		if($scope.timerObj) return;

		$scope.startTime = new Date().getTime();
		$scope.running = true;
		$scope.timerObj = $interval(function(){
			$scope.timer.value = (new Date().getTime() - $scope.startTime)/1000;
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

