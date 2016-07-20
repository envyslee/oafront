/**
 * Created by libin on 2016/4/13.
 */

define([], function () {
  var defaultService = function (commonService) {


    var baseapi=app.service.baseapi;





    var modifyExceptionRecord = function(json){
      var url = baseapi + "modifyException";
      var param={
        'json': json
      };
      return commonService.PostRequest(url,param);
    }



    return {
      ModifyExceptionRecord:modifyExceptionRecord
    };
  };

  defaultService.$inject = ['commonService'];
  app.register.factory('defaultService', defaultService);
});
