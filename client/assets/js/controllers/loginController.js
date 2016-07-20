/**
 * Created by leebin on 2016/6/17.
 */

define([], function () {
  var loginController = function ($scope, $state, $stateParams, $sessionStorage,commonService) {
      var url=app.service.baseapi;
      $scope.userInfo={
        account:'',//登录账户
        password:'',//登录密码
      }
      $scope.login=function () {
        commonService.PostRequest(url+"login",$scope.userInfo).then(function (data) {
          $sessionStorage['userName']=data.userName;
          $sessionStorage['workPlaceId']=data.workPlace;
          $sessionStorage['userId']=data.id;
          $state.go('home',{tab:"0",error:""});
        },function (e) {
          alert(e.message);
        });
      }

  }
  loginController.$inject = ['$scope', '$state', '$stateParams', '$sessionStorage','commonService'];
  app.register.controller('loginController', loginController);

});

