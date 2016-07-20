/**
 * Created by dell on 2016/7/18.
 */
define([], function () {
  var exceptionController = function ($scope, $state, $stateParams, $sessionStorage,commonService,FoundationApi) {
    var url=app.service.baseapi;
    //错误提示
    $scope.exErrorMsg='网络异常';

    var name=$stateParams.employeeName;
    //异常详情
    $scope.details={
    }

    $scope.all={
      choose:false,//是否全选
      reason:0,//多选原因
    }



    var map=function (id,name,date,arrive,leave,am,pm) {
      this.id=id;
      this.name=name;
      this.date=date;
      this.arriveTime=arrive;
      this.leaveTime=leave;
      this.am=am;
      this.pm=pm;
    }

    //页面初始化
    $scope.exDetailInit=function () {
      getException();
    }

    //提交异常处理
    $scope.exceptionSubmit=function () {
      //FoundationApi.publish('backModel','open');
      submitResult();
    }

    var getException=function () {
      var param={
        employeeId:$stateParams.employeeId
      };
      commonService.PostRequest(url+"getExceptionDetail",param).then(function (data) {
        if(data.length>0){
          var array=[];
          for(var i=0;i<data.length;i++){
            var a=data[i].arriveTime==null?'未打卡':new Date(data[i].arriveTime).toLocaleTimeString();
            var l=data[i].leaveTime==null?'未打卡':new Date(data[i].leaveTime).toLocaleTimeString();
            array[i]=new map(data[i].id,name,new Date(data[i].today).toLocaleDateString(),a,l,data[i].amStatus,data[i].pmStatus);
          }
          $scope.details=array;
        }else{
          $scope.details=[];
          FoundationApi.publish('backModel','open');
        }
      },function (e) {
        $scope.exErrorMsg=e.message;
        FoundationApi.publish('exErrorModel','open');
      });
    }

    var submitResult=function () {
      var c=window.confirm('确定提交？');
      if(!c){
        return;
      }
      var j=JSON.stringify($scope.details);
      var param={
        json:j,
        user:$sessionStorage['userId']
      }
      commonService.PostRequest(url+"modifyException",param).then(function (data) {
        getException();
      },function (e) {
        $scope.exErrorMsg=e.content;
        FoundationApi.publish('exErrorModel','open');
      })
    }


    //单一原因异常结果提交
    $scope.singleReasonSubmit=function () {
      var hasChoosed=false;
        for (var i=0;i<$scope.details.length;i++){
          if($scope.details[i].choose){
            hasChoosed=true;
            break;
          }
        }
      if (hasChoosed){
        if($scope.all.reason==0){
          $scope.exErrorMsg='未选择异常原因';
          FoundationApi.publish('exErrorModel','open');
        }else{
          for (var j=0;j<$scope.details.length;j++){
            if($scope.details[j].choose){
              $scope.details[j].amReason=$scope.all.reason;
              $scope.details[j].pmReason=$scope.all.reason;
            }
          }
          submitResult();
        }
      }else{
        $scope.exErrorMsg='未选中任何一项';
        FoundationApi.publish('exErrorModel','open');
      }
    }


    //全选
    $scope.allChoose=function () {
      if ($scope.all.choose){
        for(var i=0;i<$scope.details.length;i++){
          $scope.details[i].choose=true;
        }
      }else{
        for(var i=0;i<$scope.details.length;i++){
          $scope.details[i].choose=false;
        }
      }
    }

    //单个选中
    $scope.singleChoose=function () {
        for(var i=0;i<$scope.details.length;i++){
          if(!$scope.details[i].choose){
            $scope.all.choose=false;
            return;
          }
        }
      $scope.all.choose=true;
    }


    $scope.goBack=function () {
      $state.go('home',{tab:3,error:''});
    }

  }
  exceptionController.$inject = ['$scope', '$state', '$stateParams', '$sessionStorage','commonService','FoundationApi'];
  app.register.controller('exceptionController', exceptionController);

});
