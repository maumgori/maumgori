/**
  앱에서 사용되는 기본 설정들.
*/
var config_obj = {
  host : "172.20.10.4",
  port : 3000
};

//토스터 옵션. 사용법은 http://codeseven.github.io/toastr/demo.html 참고.
toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": true,
  "progressBar": false,
  "positionClass": "toast-top-full-width",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "2000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
