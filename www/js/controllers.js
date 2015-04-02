
var ctrl = angular.module('starter.controllers', ['services']);

var config_obj;
var socket;

ctrl.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http) {

  //1. config.json 파일 읽어들임.
  //2. socket.io 설정.
  /*
  $http.get('config/config.json').then(function(res){
    config_obj = res.data;
    socket = io(config_obj.host + ":" +config_obj.port);  //socket.io 생성.

    socket.emit('getExpertList',{});
    socket.emit('getMetaData');

    socket.on('expertList', function(data){
      //console.log(data);
      $scope.$broadcast('expert_list', data); // 전체 Scope에 반영될 수 있도록 알림. $scope.$on 에서 리슨.
    });

    socket.on('metaData', function(data){
      $scope.$broadcast('meta_data', data); // 전체 Scope에 반영될 수 있도록 알림. $scope.$on 에서 리슨.
    });
  });
  */
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
  $scope.getMetaData = function(){
    console.log('metadata');
    $http.get('http://'+config_obj.host + ":" +config_obj.port+'/metadata').success(function(data){
      console.log(data);
      alert(data.category[1].name);
    }).error(function(error){
      console.log("error : "+error);
    });
  }

/*
  // 서버에서 전문가 목록을 가져와서 $scope.expertlist 에 배열로 셋팅.
  $scope.$on('expert_list',function(event, data){
    $scope.expertlist = data;
    $scope.configObj = config_obj;
    $scope.$apply();  // 이벤트나 소켓 한 다음에는 꼭 반영할것.
    console.log($scope.expertlist);
    //console.log($scope.configObj);
  });

  $scope.$on('meta_data',function(event, data){
    $scope.metaData = data;
    //선택된 카테고리 리턴. 필터에 사용.
    $scope.filterByCategory = function(expected, actual){
      //console.log("expected : "+expected);
      //console.log("actual : "+actual);
      return actual.indexOf(expected) > -1;
    };
    $scope.$apply();  // 이벤트나 소켓 한 다음에는 꼭 반영할것.
    console.log($scope.metaData);
  });
  */

  //땡겨서 리프레쉬
  $scope.doRefresh = function() {
    socket.emit('getExpertList',{});
    socket.emit('getMetaData');
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply();
  };

  $http.get('config/config.json').then(function(res){
    $scope.configObj = res.data;
  });

  socket.emit('getExpertList',{});
  socket.emit('getMetaData');

  socket.on('expertList', function(data){
    //console.log(data);
    $scope.expertlist = data;
    console.log($scope.expertlist);
  });

  socket.on('metaData', function(data){
    $scope.metaData = data;
    //선택된 카테고리 리턴. 필터에 사용.
    $scope.filterByCategory = function(expected, actual){
      //console.log("expected : "+expected);
      //console.log("actual : "+actual);
      return actual.indexOf(expected) > -1;
    };
    console.log($scope.metaData);
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
