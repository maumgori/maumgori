var ctrl = angular.module('starter.controllers', ['services']);

ctrl.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
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

ctrl.controller('ExpertListCtrl', function($scope, $stateParams, $http, socket, $ionicModal) {
//  console.log('ExpertListCtrl 설정 - 2');
  var search_sql = {};  // ES 검색 쿼리.

  $scope.configObj = config_obj;
  $scope.search_obj = {
    category : {},
    categoryIsCheckedAll : true,
    categoryCheckAll : function(){
      if($scope.search_obj.categoryIsCheckedAll){
        for(var i=0; i < $scope.search_obj.category.length; i++){
          $scope.search_obj.category[i].ischecked = false;
        }
        $scope.search_obj.categoryIsCheckedAll = false;
      } else {
        for(var i=0; i < $scope.search_obj.category.length; i++){
          $scope.search_obj.category[i].ischecked = true;
        }
        $scope.search_obj.categoryIsCheckedAll = true;
      }
    },
    price : {
      phone : true,
      email : true,
      message : true,
      interview : true
    },
    priceIsCheckedAll: true,
    priceCheckAll : function(){
      if($scope.search_obj.priceIsCheckedAll){
        $scope.search_obj.price.phone = false;
        $scope.search_obj.price.email = false;
        $scope.search_obj.price.message = false;
        $scope.search_obj.price.interview = false;
        $scope.search_obj.priceIsCheckedAll = false;
      } else {
        $scope.search_obj.price.phone = true;
        $scope.search_obj.price.email = true;
        $scope.search_obj.price.message = true;
        $scope.search_obj.price.interview = true;
        $scope.search_obj.priceIsCheckedAll = true;
      }
    },
    price_min : 5000,
    price_max : 100000,
    searchword : ""
  };

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
    socket.emit('getExpertList',search_sql);
    socket.emit('getMetaData');
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply();
  };

  //최초 데이터 호출.
  socket.emit('getExpertList',search_sql);
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

    //검색용 obj 에 카테고리 값 셋팅.
    $scope.search_obj.category = data.category;
    for(var i=0; i < data.category.length; i++){
      $scope.search_obj.category[i].ischecked = true;
    }
    //console.log($scope.metaData);
  });

  //검색 모달.
  $ionicModal.fromTemplateUrl('templates/expertFilter.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.searchModal = modal;
  });

  //검색 모달 숨김.
  $scope.filterHide = function() {
    $scope.searchModal.hide();
  };

  $scope.filterSearch = function() {
    $scope.searchModal.hide();
    //var cate_str = "";
    var cate_vals = [];
    for(var i=0; i < $scope.search_obj.category.length; i++){
      if($scope.search_obj.category[i].ischecked === true){
//        cate_str += $scope.search_obj.category[i].name+" ";
        cate_vals.push($scope.search_obj.category[i].name);
      }
    }
    search_sql = {
      filter : {
        bool : {
          must : [
            {
              terms : {
                category : cate_vals
              }
            }
          ]
        }
      }
    };
    if($scope.search_obj.searchword !== ""){
      var query_obj = {
        match : {
          _all : $scope.search_obj.searchword
        }
      }
      search_sql.query = query_obj;
    }
    //console.log(JSON.stringify(search_sql));
    socket.emit('getExpertList',search_sql);
  };

  //검색 모달 오픈.
  $scope.filterShow = function() {
    $scope.searchModal.show();
  };

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
