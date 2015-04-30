var ctrl = angular.module('starter.controllers', ['services']);

// 로그인 및 기타 컨트롤러.
ctrl.controller('AppCtrl', function($scope, $ionicModal, $ionicPopup, $timeout, socket) {
  $scope.configObj = config_obj;

  // 회원가입/로그인에 사용되는 객체.
  $scope.user_obj = {
    id: "",
    email: "",
    passwd: "",
    passwd_re: "",
    passwd_enc: "",
    name: "",
    nicname: "",
    gender: "male",
    birthday: null,
    phone: "",
    register_date : null,
    jjim: [],
    messages: []
  };

  //초기값 임시 저장. 날짜 형식은 stringify => parse 오류남.
  var user_obj_temp = JSON.stringify($scope.user_obj);
  $scope.user_obj.birthday = new Date(1990, 0, 1);

  // 회원가입/로그인에 사용되는 함수 모음.
  $scope.login_func = {
    signingin: false,
    loggedin: false,
    openLogin: function(){
      $scope.loginModal.show();
    },
    closeLogin : function() {
      var confirmPopup = $ionicPopup.show({
        title: '로그아웃 하시겠습니까?',
        buttons: [
          {
            text: '취소',
            type: 'button-stable'
          },
          {
            text: '확인',
            type: 'button-positive',
            onTap: function(e) {
              $scope.user_obj = JSON.parse(user_obj_temp);
              $scope.user_obj.birthday = new Date(1990, 0, 1);
              $scope.login_func.signingin = false;
              $scope.login_func.loggedin = false;
              delete sessionStorage["maum_app_user_obj"];
            }
          }
        ]
      });
    },
    hideLogin: function(){
      $scope.loginModal.hide();
    },
    login: function(){
      var login_data = {
        index : "users",
        type : "user",
        id : $scope.user_obj.id,
        passwd : $scope.user_obj.passwd,
        emit: "appUserLoginRes",
        user_obj : $scope.user_obj
      }
      socket.emit('login',login_data);
      //웹 화면 로그인 모듈 재사용.
    },
    signin: function(){
      var id_check_obj = {
        index : "users",
        type : "user",
        id : $scope.user_obj.id,
        element : "found",
        emit : "appUserIdExusts"
      }
      socket.emit('getDocument',id_check_obj);
    },
    jjim: function(expert_id){
      //찜 버튼 눌렀을 때 이벤트 처리.
      //더 먼저 선언된 컨트롤러의 함수는 이후 컨트롤러도 불러올 수 있는듯.
      var exIdIndex = $scope.user_obj.jjim.indexOf(expert_id);
      if(exIdIndex > -1){
        $scope.user_obj.jjim.splice(exIdIndex,1);
      } else {
        $scope.user_obj.jjim.push(expert_id);
      }
      //console.log($scope.user_obj.jjim);
      var signin_data = {
        index : "users",
        type : "user",
        emit: "appUserUpdate",
        user_obj : $scope.user_obj
      }
      socket.emit('appUserSignin',signin_data);
    }
  };

  //id 존재하는지 체크.
  socket.on('appUserIdExusts',function(data){
    if(data){
      toastr.error('이미 사용중인 아이디입니다.', '회원가입 실패')
    } else {
      var signin_data = {
        index : "users",
        type : "user",
        emit: "appUserSigninRes",
        user_obj : $scope.user_obj
      }
      socket.emit('appUserSignin',signin_data);
    }
  });

  //회원정보 업데이트. 토스트 안함.
  socket.on('appUserUpdate',function(data){
  });

  //회원가입 후 처리.
  socket.on('appUserSigninRes',function(data){
    toastr.success('정상적으로 회원가입이 완료되었습니다.', '저장 완료');
    $timeout(function() {
      $scope.login_func.login();
    }, 1000);
  });

  //로그인 후 처리
  socket.on('appUserLoginRes',function(data){
    if(!data.idExist){
      toastr.error('존재하지 않는 아이디입니다.', '로그인 실패')
    } else {
      if(!data.correctPasswd){
        toastr.error('패스워드가 일치하지 않습니다.', '로그인 실패');
      } else {
        //$scope.user_obj = data.user_obj;
        sessionStorage["maum_app_user_obj"] = JSON.stringify($scope.user_obj);

        var obj_keys = Object.keys(data.user_obj); // key Array 가져옴. ["signin_step","id","type","passwd", ...];
        for(var i=0; i < obj_keys.length; i++){
          if(obj_keys !== 'birthday' && obj_keys !== 'register_date'){
            $scope.user_obj[obj_keys[i]] = data.user_obj[obj_keys[i]];
          }
        }
        $scope.user_obj.passwd_enc = data.user_obj.passwd;
        $scope.user_obj.passwd = "";
        $scope.user_obj.passwd_re = "";
        if($scope.user_obj.id !== ''){
          $scope.login_func.loggedin = true;
        }
        $scope.user_obj.birthday = new Date(data.user_obj.birthday);
        $scope.user_obj.register_date = new Date(data.user_obj.register_date);
        //console.log($scope.user_obj);
        $scope.loginModal.hide();
      }
    }
  });

  //세션 체크해서 로그인.
  if(sessionStorage["maum_app_user_obj"]){
    //console.log(sessionStorage["maum_login_obj"]);
    var app_user_session = JSON.parse(sessionStorage["maum_app_user_obj"]);
    $scope.user_obj.id = app_user_session.id;
    $scope.user_obj.passwd = app_user_session.passwd;
    $scope.login_func.login();
  }

  // 로그인 모달 생성
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.loginModal = modal;
  });

  //socket.on 은 상위 컨트롤에서 해야 함. 전문가상세에서 하면 계속 중복 실행됨.
  socket.on('expertDetail', function(data){
    //console.log(data);
    $scope.expert = data;
    //타이틀 배경 : HTML값 직접 가져와서 하려고 했더니 안되서 부득이하게 html 값 만들어 입력하는 방식으로 함.
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

  socket.on('messageSent', function(data){
    toastr.success('메시지가 송신되었습니다.', '메시지 송신 완료.');
    var data_obj = JSON.parse(data);
    var expert_id = data_obj['_type'];
    expert_id = expert_id.replace('-'+$scope.user_obj.id,'');
    //console.log(expert_id);
    var exIdIndex = $scope.user_obj.messages.indexOf(expert_id);
    if(exIdIndex > -1){
      $scope.user_obj.messages.splice(exIdIndex,1);
    }
    $scope.user_obj.messages.push(expert_id);
    //console.log($stateParams.expertId);
    //console.log($scope.user_obj.messages);
    //console.log($scope.user_obj);
    //사용자 정보 업데이트.
    var signin_data_message = {
      index : "users",
      type : "user",
      emit: "appUserUpdate",
      user_obj : $scope.user_obj
    }
    socket.emit('appUserSignin',signin_data_message);

  });

});

// 전문가 목록 컨트롤러 시작 //
ctrl.controller('expertListCtrl', function($scope, $ionicModal, socket) {

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
    index : "experts",
    type : "expert",
    id : null,
    emit: "expertList",
    query : search_sql
  }

  //검색 화면에서 사용하는 옵션들을 저장하는 객체
  $scope.filter_obj = {
    category_list : [],
    location_list : [],
    location : "전체",
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
    index : "experts",
    type : "expert",
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
ctrl.controller('ExpertCtrl', function($scope, $stateParams, socket, $ionicPopup) {
  //console.log($stateParams.expertId); //id 가져옴.
  var search_sql = {
    filter : {
      term : { "_id" : $stateParams.expertId }
    }
  };
  //console.log(JSON.stringify(search_sql));

  var req_data = {
    index : "experts",
    type : "expert",
    id : $stateParams.expertId,
    element : "_source",
    emit: "expertDetail"
  }
  socket.emit('getDocument',req_data);
  //socket.emit('getExpertList',search_sql);
  //socket.emit('getMetaData');

  $scope.tab_val="info";

  $scope.message_obj = {
    user_id: $scope.user_obj.id,
    name: "비공개",
    phone: "비공개",
    nicname: $scope.user_obj.nicname,
    user_sent: true,
    send_time: null,
    read_time: null,
    message: ""
  };

  var message_template = "";
  message_template += '<label class="checkbox col" style="margin-left:20px;"><input type="checkbox" ng-model="expertDetail_func.info_name"> <div style="padding-left:15px;margin-top:5px;">실명 공개</div></label>';
  message_template += '<label class="checkbox col" style="margin-left:20px;"><input type="checkbox" ng-model="expertDetail_func.info_phone"> <div style="padding-left:15px;margin-top:5px;">전화번호 공개</div></label>';
  message_template += '<textarea rows=6 ng-model="message_obj.message" placeholder="문의할 내용을 입력하세요."></textarea>';
  $scope.expertDetail_func = {
    info_name:true,
    info_phone:true,
    messageWrite: function(){
      var messagePopup = $ionicPopup.show({
        title: ' to. '+$scope.expert.name+' 전문가',
        template: message_template,
        scope: $scope,
        buttons: [
          {
            text: '취소',
            type: 'button-stable'
          },
          {
            text: '전송',
            type: 'button-positive',
            onTap: function(e) {
              if($scope.expertDetail_func.info_name){
                $scope.message_obj.name =  $scope.user_obj.name;
              } else {
                $scope.message_obj.name =  "비공개";
              }
              if($scope.expertDetail_func.info_phone){
                $scope.message_obj.phone =  $scope.user_obj.phone;
              } else {
                $scope.message_obj.phone =  "비공개";
              }
              $scope.message_obj.send_time = new Date();

              var message_req_obj = {
                index : "messages",
                type : $stateParams.expertId+"-"+$scope.user_obj.id,
                doc_data: $scope.message_obj,
                emit: "messageSent"
              }
              socket.emit('insertDocument',message_req_obj);
            }
          }
        ]
      });
    }
  }

});
// 전문가 상세 컨트롤러 끝 //
