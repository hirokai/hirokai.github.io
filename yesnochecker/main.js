cellCountApp = angular.module('cellCountApp',['ui.bootstrap']);

cellCountApp.controller('CellCountCtrl',['$scope',function($scope){
	$scope.images = _.map(_.range(150),function(i){
		return {num: i+1, state: -1};
	});
//	$scope.numlist = 'hoge';
	$scope.numlist = function(){
		var s = _.compact(_.map($scope.images,function(img){
			return img.state > 0 ? img.num : null;
		})).join(',');
		return s == '' ? ' ' : s;
	};
	$scope.done = function(img){
		return img.state != null && img.state != -1;
	};

}]);