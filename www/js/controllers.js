
var ctrl = angular.module('starter.controllers', ['services']);

ctrl.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('로그인 중', $scope.loginData);
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

});

ctrl.controller('ExpertListCtrl', function($scope, $stateParams, $http, socket) {
//  console.log('ExpertListCtrl 설정 - 2');
  $scope.configObj = config_obj;

  $scope.getMetaData = function(){
    console.log('metadata');
    $http.get('http://'+config_obj.host + ":" +config_obj.port+'/metadata').success(function(data){
      console.log(data);
      alert(data.category[1].name);
    }).error(function(error){
      console.log("error : "+error);
    });
  }

  //땡겨서 리프레쉬
  $scope.doRefresh = function() {
    socket.emit('getExpertList',{});
    socket.emit('getMetaData');
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply();
  };

  socket.emit('getExpertList',{});
  socket.emit('getMetaData');

  socket.on('expertList', function(data){
    $scope.expertlist = data;
    //console.log($scope.expertlist);
  });

  socket.on('metaData', function(data){
    $scope.metaData = data;
    //선택된 카테고리 리턴. 필터에 사용.
    $scope.filterByCategory = function(expected, actual){
      //console.log("expected : "+expected);
      //console.log("actual : "+actual);
      if(actual !== null){
        //가입 하다가 만 경우 actual == null 나옴.
        return actual.indexOf(expected) > -1;
      }
    };
    //console.log($scope.metaData);
  });

});

ctrl.controller('ExpertCtrl', function($scope, $stateParams, $location) {
  console.log($scope.expertList);
//  console.log('ExpertCtrl 설정 - 2');
  var eid=$location.$$path;
  eid = eid.replace("app/expert","");
  eid = eid.replace("/","");
  eid = eid.replace("/","");
//  console.log(eid);
  // id 가 url의 Id 인 녀석을 찾아 해당 객체를 expert에 리턴.
  var exp;
  for(var e=0; e<expert_list.length; e++){
    if(expert_list[e].id === eid){
      exp = expert_list[e];
    }
  }
  $scope.expert = exp;

});
