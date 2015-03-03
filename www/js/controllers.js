
// 코치 배열 객체. 초반에 어떻게 가져올지는 연구 해 봅시다.
var expert_list = [
  { name: '정진', id: 'jin', photo:'http://www.maumgori.com/img/jin_photo.png', eval_score : 5,
    introduction : '국제코치연맹 소속 라이프 코치 겸 강사'
  },
  { name: '김종민', id: 'min', photo:'http://www.maumgori.com/img/min_photo.png', eval_score : 3.5,
    introduction : '캔두잇소프트(스타트업) CTO'
  },
  { name: '김진선', id: 'sun', photo:'http://www.maumgori.com/img/sun_photo.png', eval_score : 4,
    introduction : '프리랜서, 웹퍼블리셔'
  }
];


angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
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
})

.controller('ExpertListCtrl', function($scope, $stateParams) {
//  console.log('ExpertListCtrl 설정 - 2');
  // 서버에서 전문가 목록을 가져와서 $scope.expertlist 에 배열로 셋팅.
  $scope.expertlist = expert_list;

  $scope.getStars = function(num){
    var starArr = new Array(5);
    for(var i=0; i<5; i++){
      if((i+1) <= num){
        starArr[i] = 'ion-ios7-star';
      } else if(((i+1) > num) && ((i) < num)){
        starArr[i] = 'ion-ios7-star-half';
      } else {
        starArr[i] = 'ion-ios7-star-outline';
      }
    }
    return starArr;
  }

})

.controller('ExpertCtrl', function($scope) {
  console.log('ExpertCtrl 설정');

})

.controller('ExpertCtrl', function($scope, $stateParams, $location) {

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
