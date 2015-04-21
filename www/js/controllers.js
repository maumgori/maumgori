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
  $scope.configObj = config_obj;

  //검색 SQL 객체 초기값 설정. 회원가입 완료 된 건만 검색 - 공통 적용.
  // search_sql.filter.and.push(); 로 필터 추가.
  var search_sql = {
    filter : {
      and : [ { term : { register_done : true } } ]
    }
  };

  var search_sql_init = JSON.stringify(search_sql);

  //검색 쿼리 저장하는 객체. 기본 값 셋팅.
  var req_data = {
    index : "users",
    type : "user",
    id : null,
    emit: "expertList",
    query : search_sql
  }

  //검색 화면에서 사용하는 옵션들을 저장하는 객체
  $scope.filter_obj = {
    category_list : [],
    location_list : [],
    location : "전국",
    location_all : true,
    method_list : [],
    method_price_max : 0,
    method_price_min : 0,
    method_price_max_val : 0,
    searchword : ''
  };

  //검색 화면에서 사용하는 함수들.
  $scope.filter_func = {
    categoryCheckedAll : false,
    categoryCheckAll : function(check_val){
      //console.log(check_val);
      for(var i=0; i < $scope.filter_obj.category_list.length; i++){
        $scope.filter_obj.category_list[i].checked = check_val;
      }
      $scope.filter_func.categoryCheckedAll = check_val;
    },
    methodCheckedAll : false,
    methodCheckAll : function(check_val){
      //console.log(check_val);
      for(var i=0; i < $scope.filter_obj.method_list.length; i++){
        $scope.filter_obj.method_list[i].checked = check_val;
      }
      $scope.filter_func.methodCheckedAll = check_val;
    },
    filterHide : function() {
      //검색 메뉴에서 취소 버튼 클릭. 검색 창 종료.
      $scope.searchModal.hide();
    },
    filterSearch : function() {
      //검색 메뉴에서 확인 버튼 클릭. 검색 수행.
      $scope.searchModal.hide();
      search_sql = JSON.parse(search_sql_init);

      //전문분야 질의값
      var cate_vals = [];
      for(var i=0; i < $scope.filter_obj.category_list.length; i++){
        if($scope.filter_obj.category_list[i].checked === true){
          cate_vals.push($scope.filter_obj.category_list[i].name);
        }
      }
      search_sql.filter.and.push( { terms : { category : cate_vals } } );

      //방식 질의값
      var method_vals = [];
      for(var i=0; i < $scope.filter_obj.method_list.length; i++){
        if($scope.filter_obj.method_list[i].checked === true){
          method_vals.push($scope.filter_obj.method_list[i].name);
        }
      }
      search_sql.filter.and.push( { terms : { method : method_vals } } );

      //지역 질의값. 전체인 경우 검색 옵션 넣지 않음.
      if($scope.filter_obj.location !== "전체"){
        if($scope.filter_obj.location_all){
          search_sql.filter.and.push( { terms : { location : [ $scope.filter_obj.location_list[0], $scope.filter_obj.location ] } } );
        } else {
          search_sql.filter.and.push( { term : { location : $scope.filter_obj.location } } );
        }
      }

      //가격 범위 질의값
      search_sql.filter.and.push( { range : { method_price_min : { lte : $scope.filter_obj.method_price_max } } } );
      search_sql.filter.and.push( { range : { method_price_max : { gte : $scope.filter_obj.method_price_min } } } );

      if($scope.filter_obj.searchword.length > 0){
        var query_obj = {
          match : {
            _all : $scope.filter_obj.searchword
          }
        }
        search_sql.query = query_obj;
      }
      //console.log(JSON.stringify(search_sql));
      //console.log($scope.filter_obj);
      req_data.emit = "expertList";
      req_data.query = search_sql;
      socket.emit('getHits',req_data);
    }
  }

  //전문가 목록 화면에서 사용되는 함수들.
  $scope.expertList_func = {
    doRefresh : function() {
      //땡겨서 리프레쉬
      //console.log(JSON.stringify(search_sql));
      req_data.emit = "expertList";
      req_data.query = search_sql;
      socket.emit('getHits',req_data);
      //socket.emit('getMetaData');
      //socket.emit('getAggs',maxPrice_req);
      $scope.$broadcast('scroll.refreshComplete');
    },
    filterShow : function() {
      //검색 모달 오픈.
      $scope.searchModal.show();
    },
    jjim : function(){
      //찜 버튼 눌렀을 때 이벤트 처리.
    }
  }

  //소켓 이벤트.
  //전문가 목록 호출.
  socket.on('expertList', function(data){
    //console.log(data);
    $scope.expertList = [];
    for(var i=0; i < data.hits.length; i++){
      //console.log(data.hits[i]._source);
      $scope.expertList.push(data.hits[i]._source);
    }
  });

  //메타데이터 호출
  socket.on('metaData', function(data){
    //$scope.metaData = data;
    //카테고리 값 설정.
    $scope.filter_obj.category_list = data.category;
    $scope.filter_obj.method_list = data.method;
    $scope.filter_obj.location_list = data.location;
    //console.log($scope.filter_obj);
    $scope.filter_func.categoryCheckAll(true);
    $scope.filter_func.methodCheckAll(true);
  });

  //Max 가격값 가져오는 aggs 질의. 검색 메뉴의 가격 최대값으로 셋팅.
  var maxPrice_req = {
    index : "users",
    type : "user",
    emit : "maxPrice",
    query: {
      size: 0,
      aggs : {
        max_price : {
          max : { field : "method_price_max" }
        }
      }
    }
  }
  socket.on('maxPrice', function(data){
    //console.log(data);
    $scope.filter_obj.method_price_max_val = data.max_price.value;
    $scope.filter_obj.method_price_max = data.max_price.value;
  });

  //최초 데이터 호출.
  socket.emit('getHits',req_data);
  socket.emit('getMetaData');
  socket.emit('getAggs',maxPrice_req);

  //검색 모달.
  $ionicModal.fromTemplateUrl('templates/expertFilter.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.searchModal = modal;
  });

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
