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

// 전문가 목록 컨트롤러 시작 //
ctrl.controller('expertListCtrl', function($scope, $http, socket, $ionicModal) {
//  console.log('expertListCtrl 설정 - 2');
  var search_sql = {
    filter : {
      term : {
        register_done : true
      }
    }
  };  // ES 검색 쿼리.

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
    location : "",
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
    price_max : 0,
    price_min : 0,
    max_price_val : 0,
    searchword : ""
  };

  $scope.getMetaData = function(){
    $http.get('http://'+config_obj.host + ":" +config_obj.port+'/metadata').success(function(data){
      //console.log(data);
      alert(data.category[1].name);
    }).error(function(error){
      console.log("error : "+error);
    });
  }

  //땡겨서 리프레쉬
  $scope.doRefresh = function() {

    var req_data = {
      index : "users",
      type : "user",
      emit: "expertList",
      query : search_sql
    }
    socket.emit('getHits',req_data);
    //socket.emit('getExpertList',search_sql);
    socket.emit('getMetaData');
    $scope.$broadcast('scroll.refreshComplete');
    $scope.$apply();
  };

  //최초 데이터 호출.
  var req_data = {
    index : "users",
    type : "user",
    emit: "expertList",
    query : search_sql
  }
  socket.emit('getHits',req_data);
  //socket.emit('getExpertList',search_sql);
  socket.emit('getMetaData');

  socket.on('expertList', function(data){
    //console.log(data);
    $scope.expertList = [];
    for(var i=0; i < data.hits.length; i++){
      //console.log(data.hits[i]._source);
      $scope.expertList.push(data.hits[i]._source);
    }
  });

  socket.on('metaData', function(data){
    $scope.metaData = data;
    //검색용 obj 에 카테고리 값 셋팅.
    $scope.search_obj.category = data.category;
    for(var i=0; i < data.category.length; i++){
      $scope.search_obj.category[i].ischecked = true;
    }
    $scope.search_obj.location = data.location[1];
    //console.log($scope.metaData);
  });

  //Max 가격값 가져오는 aggs 질의.
  var max_price_sql = {
    index : "users",
    type : "user",
    emit : "max_price",
    query: {
      size: 0,
      aggs : {
        max_price : {
          max : { field : "max_amount" }
        }
      }
    }
  }
  socket.emit('getAggs',max_price_sql);
  socket.on('max_price', function(data){
    //console.log(data);
    $scope.search_obj.max_price_val = data.max_price.value;
    $scope.search_obj.price_max = data.max_price.value;
    $scope.search_obj.price_min = 0;
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

    var filter_arr = [];

    // 회원가입 끝난 값만.
    filter_arr.push( { term : { register_done : true } } );

    //전문분야 질의값
    var cate_vals = [];
    for(var i=0; i < $scope.search_obj.category.length; i++){
      if($scope.search_obj.category[i].ischecked === true){
        cate_vals.push($scope.search_obj.category[i].name);
      }
    }
    filter_arr.push( { terms : { category : cate_vals } } );

    //방식 질의값
    var price_vals = [];
    if($scope.search_obj.price.phone === true){
      price_vals.push("phone");
    }
    if($scope.search_obj.price.email === true){
      price_vals.push("email");
    }
    if($scope.search_obj.price.message === true){
      price_vals.push("message");
    }
    if($scope.search_obj.price.interview === true){
      price_vals.push("interview");
    }
    filter_arr.push( { terms : { "price.enable_list" : price_vals } } );

    //지역 질의값
    var location_val = [ $scope.metaData.location[0], $scope.search_obj.location ];
    filter_arr.push( { terms : { location : location_val } } );

    //가격 범위 질의값
    filter_arr.push( { range : { "price.min_amount" : { lte : $scope.search_obj.price_max } } } );
    filter_arr.push( { range : { "price.max_amount" : { gte : $scope.search_obj.price_min } } } );

    search_sql = {
      filter : {
        and : filter_arr
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
    //console.log($scope.search_obj);
    //socket.emit('getExpertList',search_sql);
    var req_data = {
      index : "users",
      type : "user",
      emit: "expertList",
      query : search_sql
    }
    socket.emit('getHits',req_data);

  };

  //검색 모달 오픈.
  $scope.filterShow = function() {
    $scope.searchModal.show();
  };

});
// 전문가 목록 컨트롤러 끝 //

// 전문가 상세 컨트롤러 시작 //
ctrl.controller('ExpertCtrl', function($scope, $stateParams, socket) {
  $scope.configObj = config_obj;
  //console.log($stateParams.expertId); //id 가져옴.
  var search_sql = {
    filter : {
      term : { "_id" : $stateParams.expertId }
    }
  };
  //console.log(JSON.stringify(search_sql));

  var req_data = {
    index : "users",
    type : "user",
    id : $stateParams.expertId,
    element : "_source",
    emit: "expertDetail"
  }
  socket.emit('getDocument',req_data);
  //socket.emit('getExpertList',search_sql);
  //socket.emit('getMetaData');

  socket.on('expertDetail', function(data){
    //console.log(data);
    $scope.expert = data;

    //HTML값 직접 가져와서 하려고 했더니 안되서 부득이하게 html 값 만들어 입력하는 방식으로 함.
    var profile_div = $('#profile_div');
    var p_width = profile_div.width();
    var profile_style_val = '';
    profile_style_val += 'padding:0px;';
    profile_style_val += 'margin:0px;';
    profile_style_val += 'position:relative;';
    profile_style_val += 'width:100%;';
    profile_style_val += 'height:'+(p_width/2)+'px;';
    profile_style_val += 'background-size:100%;';
    profile_style_val += "background-image:url('http://"+$scope.configObj.host+":"+$scope.configObj.port+$scope.expert.profile_bg_img+"');";
    $scope.profile_style = profile_style_val;

  });

  $scope.tab_val="info";

});
// 전문가 상세 컨트롤러 끝 //
