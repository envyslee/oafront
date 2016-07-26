/**
 * Created by leebin on 2016/6/17.
 */

define([], function () {
  var homeController = function ($scope, $state,$sessionStorage, $stateParams,commonService,FoundationApi) {

    var userId=$sessionStorage['userId'];
    if (userId==undefined||userId==null) {
      $state.go('login');
    }


    var url=app.service.baseapi;
    //标记为节假日
    var tagDay;

    //当前选中tag
    $scope.currentTag=$stateParams['tab'];

    $scope.tag={
      leaveDate:'', //离职日期
      employeeId:'' //离职员工id
    }


    //错误提示
    $scope.msg={
      confirmMsg:'',
      errorMsg:'网络异常，请稍后再试'
    }


    var error=$stateParams['error'];
    if(error!=undefined&&error!=null&&error!=""){
       switch (error){
         case 'no_upload_employee_file':
           alert('未获取到员工表excel');
           $state.go('home',{tab:0,error:''});
           break;
         case 'employee_excel_is_null':
           alert('员工表excel为空');
           $state.go('home',{tab:0,error:''});
           break;
         case 'employee_import_error':
           alert('员工表excel导入出错');
           $state.go('home',{tab:0,error:''});
           break;
         case 'no_upload_work_file':
           alert('未获取到考勤表excel');
           $state.go('home',{tab:1,error:''});
           break;
         case 'work_excel_is_null':
           alert('考勤表excel为空');
           $state.go('home',{tab:1,error:''});
           break;
         case 'work_import_error':
           alert('考勤表excel导入出错');
           $state.go('home',{tab:1,error:''});
           break;
         case 'work_scan_error':
           alert('考勤表excel扫描出错');
           $state.go('home',{tab:1,error:''});
           break;
         default:
           break;
       }
       //$scope.errorMsg=error;
       //FoundationApi.publish('errorModel','open');
     }

    var workPlaceId=$sessionStorage['workPlaceId'];
    if(workPlaceId==1){//上海、苏州恒宇
      $scope.currentPlace='上海';
      $scope.xlsUrl="SH.xls";
    }else if(workPlaceId==10){//苏州凤凰
      $scope.currentPlace='苏州凤凰';
      $scope.xlsUrl="SZ-FH.xls";
    }else if(workPlaceId==11){
      $scope.currentPlace='苏州恒宇';
      $scope.xlsUrl="SZ-HY.xls";
    }

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
      this.amReason=0;
      this.pmReason=0;
    }


    $scope.currentUser={
      name:$sessionStorage['userName'],
      workPlace:workPlaceId,
      userId:userId,
      callbackUrl:'http://122.192.49.98:8090'
      //callbackUrl:'http://localhost:8000',
    }

    $scope.btn={
      employee:false,
      work:false
    }

    $scope.queryInfo={
      year:2016,
      month:new Date().getMonth()+1,
      workPlace:workPlaceId,
      jobStatus:0,
      tagHoliday:'',
      employeeId:'',
      nationalId:'',
      employeeName:'',
      department:''
    }

    $scope.employeeQueryInfo={
      employeeId:'',
      employeeName:'',
      department:'',
      jobStatus:0,
      queryTime:0,
      fromDate:'',
      endDate:''
    }

    $scope.exceptionQueryInfo={
      employeeId:'',
      employeeName:'',
      nationalId:'',
      department:''
    }

    $scope.employeeCount={
      total:0,
      arrive:0,
      leave:0
    }

    $scope.days={}

    $scope.addUser={
      employeeId:'',
      nationalId:'',
      machineId:'',
      employeeName:'',
      department:'',
      position:'',
      workPlaceId:workPlaceId,
      userId:userId,
      joinTime:''
    }

    var count={
      exception:0,
      late:0,
      earlyLeave:0,
      forget:0,
      yearVacation:0,
      affair:0,
      disease:0,
      marry:0,
      maternity:0,
      pregnant:0,
      nursing:0,
      funeral:0,
      homeLeave:0,
      absenteeism:0,
      business:0,
      notMonth:0,
      attendance:0,
    }

    $scope.chooseTab=function (tab) {
      $scope.currentTag=tab;
      var path=window.location.hash.split('/');
      window.location.hash=path[0]+'/'+path[1]+'/'+tab+'/'+path[3];
      if(tab==3){
          getException();
      }else if(tab==0){
        if($scope.employeeData==null||$scope.employeeData==undefined){
          getEmployeeCount();
        }
      }else if(tab==6){
        getLogInfo();
      }
    }

    var getLogInfo=function () {
      var param={
        userId:userId
      }
      commonService.PostRequest(url+"getLogInfo",param).then(function (data) {
        $scope.logInfo=data;
      },function (e) {
        $scope.msg.errorMsg=e.message;

        FoundationApi.publish('errorModel','open');
      });
    }

    $scope.employeeInit=function () {
      switch ($scope.currentTag){
        case '0':
          getEmployeeCount();
          break;
        case '3':
          getException();
          break;
        case '6':
          getLogInfo();
          break;
      }
    }

    //查询
    $scope.query=function () {
        if ($scope.queryInfo.year==0){
          $scope.msg.errorMsg='请输入查询年份';
          FoundationApi.publish('errorModel','open');
          return;
        }
      if ($scope.queryInfo.month==0){
        $scope.msg.errorMsg='请输入查询月份';
        FoundationApi.publish('errorModel','open');
        return;
      }
      queryRecord();
    }

    //导出
    $scope.output=function () {
      var blob = new Blob([document.getElementById('exportable').innerHTML], {
        type: "application/vnd.ms-excel;charset=utf-8"
      });
      saveAs(blob, "Report.xls");
    }

    //上传用户花名册
    $scope.uploadEmployee=function () {
      commonService.Loading();
      document.getElementById('eForm').submit();
    }

    //上传考勤原始数据
    $scope.uploadWorkSrc=function () {
      commonService.Loading();
      document.getElementById('wForm').submit();
    }

    $scope.workChange=function () {
      var file = event.target.files[0];
      if (file.type.indexOf('vnd.ms-exce')<0) {
        $scope.btn.work=false;
        $scope.msg.errorMsg='上传文件格式有误，请选择.xls格式文件';
        FoundationApi.publish('errorModel','open');
      }else{
        $scope.btn.work=true;
        $scope.$apply();
      }
    }

    $scope.employeeChange=function () {
      var file = event.target.files[0];
      if (file.type.indexOf('vnd.ms-exce')<0) {
        $scope.btn.employee=false;
        $scope.msg.errorMsg='上传文件格式有误，请选择.xls格式文件';
        FoundationApi.publish('errorModel','open');
      }else{
        $scope.btn.employee=true;
        $scope.$apply();
      }
    }


    //添加单个员工
    $scope.addEmployee=function () {
      commonService.PostRequest(url+"addEmployee",$scope.addUser).then(function () {
        FoundationApi.publish('singleUserModal', 'close');
        getEmployee();
      },function (e) {
        if(e.content!=null){
          $scope.msg.errorMsg=e.content;
        }else {
          $scope.msg.errorMsg=e.message;
        }
        FoundationApi.publish('errorModel','open');
      });
    }

    //标记为离职
    $scope.tagOff=function () {

      var  confirm=window.confirm('确定标记该员工为离职？');
      if(!confirm){
        return;
      }
      var param={
          employeeId:$scope.tag.employeeId,
          userId:userId,
          leaveDate:$scope.tag.leaveDate.toLocaleDateString()
      }
      commonService.PostRequest(url+"tagOffEmployee",param).then(function () {
        for(var i=0;i<$scope.employeeData.length;i++){
          if($scope.employeeData[i].employeeId==$scope.tag.employeeId){
            $scope.employeeData[i].status='离职员工';
            $scope.employeeData[i].leaveTime=param.leaveDate;
            break;
          }
        }
        getEmployeeCount();
        FoundationApi.publish('tagModel','close');
      },function (e) {
        if(e.content!=null){
          $scope.msg.errorMsg=e.content;
          FoundationApi.publish('tagModel','close');
          FoundationApi.publish('errorModel','open');
        }
      });
    }

    $scope.openTagModel=function (e) {
      $scope.tag.employeeId=e.employeeId;
      FoundationApi.publish('tagModel','open');
    }


    var getEmployee=function () {
      commonService.Loading();
      var param={
        workPlaceId:workPlaceId,
        employeeId:$scope.employeeQueryInfo.employeeId,
        employeeName:$scope.employeeQueryInfo.employeeName,
        department:$scope.employeeQueryInfo.department
      }
      if($scope.employeeQueryInfo.queryTime!=0){
        if($scope.employeeQueryInfo.fromDate==''||$scope.employeeQueryInfo.endDate==''){
          commonService.LoadingEnd();
          $scope.msg.errorMsg='请选择起止时间';
          FoundationApi.publish('errorModel','open');
          return;
        }else{
          param.queryTime=$scope.employeeQueryInfo.queryTime;
          param.fromDate=$scope.employeeQueryInfo.fromDate.toLocaleDateString();
          param.endDate=$scope.employeeQueryInfo.endDate.toLocaleDateString();
        }
      }

      commonService.PostRequest(url+"getEmployee",param).then(function (data) {
        for(var i=0;i<data.length;i++){
          switch (data[i].workPlace){
            case 10:
              data[i].workPlace='苏州凤凰';
              break;
            case 11:
              data[i].workPlace='苏州恒宇';
              break;
            case 1:
              data[i].workPlace='上海';
              break;
          }
          switch (data[i].status){
            case 1:
              data[i].status='在职员工';
              break;
            case -1:
              data[i].status='离职员工';
              break;
            case 0:
              data[i].status='无效员工';
              break;
          }
          data[i].joinTime=data[i].joinTime==null?'':new Date(data[i].joinTime).toLocaleDateString();
          data[i].leaveTime=data[i].leaveTime==null?'':new Date(data[i].leaveTime).toLocaleDateString();
        }
        $scope.employeeData=data;
        commonService.LoadingEnd();
      },function (e) {
        if(e.message==undefined||e.message==null){
          $scope.msg.errorMsg='网络异常，请稍后再试';
        }else{
          $scope.msg.errorMsg=e.message;
        }
        commonService.LoadingEnd();
        FoundationApi.publish('errorModel','open');
      });
    }

    var getEmployeeCount=function () {
      var param={
        workPlace:$scope.currentUser.workPlace
      }
      commonService.PostRequest(url+"getEmployeeCount",param).then(function (data) {
        $scope.employeeCount.total=data.total;
        $scope.employeeCount.leave=data.leave;
        $scope.employeeCount.join=data.join;
        getEmployee();
      },function (e) {
        commonService.LoadingEnd();
        if(e.message!=null&&e.message!=undefined){
          $scope.msg.errorMsg=e.message;
        }
        FoundationApi.publish('errorModel','open');
      })
    }

    var queryRecord=function () {
      commonService.PostRequest(url+"getRecord",$scope.queryInfo).then(function (data) {
        if(data.length>0){
          var date=new Date($scope.queryInfo.year, $scope.queryInfo.month,0);
          var days=date.getDate();
          for(var j=1;j<=days;j++){
            var d=new Date($scope.queryInfo.year, $scope.queryInfo.month-1,j);
            var w=d.getDay();
            if(w==0||w==6){
              dayCalc(j,0);
            }else {
              dayCalc(j,1);
            }
          }

          data=data.sort(function (a,b) {
            if(a.department>b.department){
              return -1;
            } else if(a.department<b.department){
              return 1;
            }else{
              return 0;
            }
          });
          for (var i=0;i<data.length;i++){
            for (var item in count){
              count[item]=0;
            }
            data[i].day1a=transfer(data[i].day1a);
            data[i].day1p=transfer(data[i].day1p);
            data[i].day2a=transfer(data[i].day2a);
            data[i].day2p=transfer(data[i].day2p);
            data[i].day3a=transfer(data[i].day3a);
            data[i].day3p=transfer(data[i].day3p);
            data[i].day4a=transfer(data[i].day4a);
            data[i].day4p=transfer(data[i].day4p);
            data[i].day5a=transfer(data[i].day5a);
            data[i].day5p=transfer(data[i].day5p);
            data[i].day6a=transfer(data[i].day6a);
            data[i].day6p=transfer(data[i].day6p);
            data[i].day7a=transfer(data[i].day7a);
            data[i].day7p=transfer(data[i].day7p);
            data[i].day8a=transfer(data[i].day8a);
            data[i].day8p=transfer(data[i].day8p);
            data[i].day9a=transfer(data[i].day9a);
            data[i].day9p=transfer(data[i].day9p);
            data[i].day10a=transfer(data[i].day10a);
            data[i].day10p=transfer(data[i].day10p);
            data[i].day11a=transfer(data[i].day11a);
            data[i].day11p=transfer(data[i].day11p);
            data[i].day12a=transfer(data[i].day12a);
            data[i].day12p=transfer(data[i].day12p);
            data[i].day13a=transfer(data[i].day13a);
            data[i].day13p=transfer(data[i].day13p);
            data[i].day14a=transfer(data[i].day14a);
            data[i].day14p=transfer(data[i].day14p);
            data[i].day15a=transfer(data[i].day15a);
            data[i].day15p=transfer(data[i].day15p);
            data[i].day16a=transfer(data[i].day16a);
            data[i].day16p=transfer(data[i].day16p);
            data[i].day17a=transfer(data[i].day17a);
            data[i].day17p=transfer(data[i].day17p);
            data[i].day18a=transfer(data[i].day18a);
            data[i].day18p=transfer(data[i].day18p);
            data[i].day19a=transfer(data[i].day19a);
            data[i].day19p=transfer(data[i].day19p);
            data[i].day20a=transfer(data[i].day20a);
            data[i].day20p=transfer(data[i].day20p);
            data[i].day21a=transfer(data[i].day21a);
            data[i].day21p=transfer(data[i].day21p);
            data[i].day22a=transfer(data[i].day22a);
            data[i].day22p=transfer(data[i].day22p);
            data[i].day23a=transfer(data[i].day23a);
            data[i].day23p=transfer(data[i].day23p);
            data[i].day24a=transfer(data[i].day24a);
            data[i].day24p=transfer(data[i].day24p);
            data[i].day25a=transfer(data[i].day25a);
            data[i].day25p=transfer(data[i].day25p);
            data[i].day26a=transfer(data[i].day26a);
            data[i].day26p=transfer(data[i].day26p);
            data[i].day27a=transfer(data[i].day27a);
            data[i].day27p=transfer(data[i].day27p);
            data[i].day28a=transfer(data[i].day28a);
            data[i].day28p=transfer(data[i].day28p);
            data[i].day29a=transfer(data[i].day29a);
            data[i].day29p=transfer(data[i].day29p);
            data[i].day30a=transfer(data[i].day30a);
            data[i].day30p=transfer(data[i].day30p);
            data[i].day31a=transfer(data[i].day31a);
            data[i].day31p=transfer(data[i].day31p);

            data[i].exception=count.exception;
            data[i].exception=count.exception;
            data[i].late=count.late;
            data[i].earlyLeave=count.earlyLeave;
            data[i].forget=count.forget;
            data[i].yearVacation=count.yearVacation;
            data[i].affair=count.affair;
            data[i].disease=count.disease;
            data[i].marry=count.marry;
            data[i].maternity=count.maternity;
            data[i].pregnant=count.pregnant;
            data[i].nursing=count.nursing;
            data[i].funeral=count.funeral;
            data[i].homeLeave=count.homeLeave;
            data[i].absenteeism=count.absenteeism;
            data[i].business=count.business;
            data[i].notMonth=count.notMonth;
            data[i].attendance=count.attendance;
          }
          $scope.queryResult=data;
        }else {
          $scope.queryResult=null;
          $scope.msg.errorMsg='找到0条记录';
          FoundationApi.publish('errorModel','open');
        }
      },function (e) {
        $scope.queryResult=null;
        $scope.msg.errorMsg=e.message;
        FoundationApi.publish('errorModel','open');
      });
    }

    var getException=function () {
      commonService.Loading();
      var param={
        workPlaceId:workPlaceId,
        employeeId:$scope.exceptionQueryInfo.employeeId,
        employeeName:$scope.exceptionQueryInfo.employeeName,
        nationalId:$scope.exceptionQueryInfo.nationalId,
        department:$scope.exceptionQueryInfo.department
      }
      commonService.PostRequest(url+"getExceptionEmployee",param).then(function (data) {
          if(data.length>0)
          {
            $scope.exceptionEmployee=data;
          }else {
            $scope.exceptionEmployee=[];
          }
        commonService.LoadingEnd();
      },function (e) {
        commonService.LoadingEnd();
        if(e.message!=null&&e.message!=undefined){
          $scope.msg.errorMsg=e.message;
        }
        FoundationApi.publish('errorModel','open');
      })
    }

    var transfer=function ( status) {
      if (status==null||status==undefined){
        return;
      }
      var symble='';
      switch (status){
        case 0:
          symble='异';
          count.exception+=1;
              break;
        case 1:
          symble='/';
          count.attendance+=0.5;
              break;
        case 2:
          symble='×';
          count.earlyLeave+=1;
          break;
        case 3:
          symble='忘';
          count.forget+=1;
          count.attendance+=0.5;
          break;
        case 4:
          symble='⊙';
          count.affair+=0.5;
          break;
        case 5:
          symble='⊕';
          count.disease+=0.5;
          break;
        case 6:
          symble='◎';
          count.maternity+=0.5;
          break;
        case 7:
          symble='年';
          count.yearVacation+=0.5;
          break;
        case 8:
          symble='Δ';
          count.marry+=0.5;
          break;
        case 9:
          symble='★';
          count.pregnant+=0.5;
          break;
        case 10:
          symble='※';
          count.nursing+=0.5;
          break;
        case 11:
          symble='▲';
          count.funeral+=0.5;
          break;
        case 12:
          symble='☆';
          break;
        case 13:
          symble='回';
          count.homeLeave+=0.5;
          break;
        case 14:
          symble='公';
          count.absenteeism+=0.5;
          break;
        case 15:
          symble='差';
          count.business+=0.5;
          break;
        case 16:
          symble='－';
          count.notMonth+=0.5;
          break;
        case 17:
          symble='○';
          count.absenteeism+=0.5;
          break;
        case 18:
          symble='﹟';
          count.late+=1;
          count.attendance+=0.5;
          break;
      }
      return symble;
    }

    var dayCalc=function (day,value) {
        switch (day){
          case 1:
            $scope.days.d1=value;
                break;
          case 2:
            $scope.days.d2=value;
            break;
          case 3:
            $scope.days.d3=value;
            break;
          case 4:
            $scope.days.d4=value;
            break;
          case 5:
            $scope.days.d5=value;
            break;
          case 6:
            $scope.days.d6=value;
            break;
          case 7:
            $scope.days.d7=value;
            break;
          case 8:
            $scope.days.d8=value;
            break;
          case 9:
            $scope.days.d9=value;
            break;
          case 10:
            $scope.days.d10=value;
            break;
          case 11:
            $scope.days.d11=value;
            break;
          case 12:
            $scope.days.d12=value;
            break;
          case 13:
            $scope.days.d13=value;
            break;
          case 14:
            $scope.days.d14=value;
            break;
          case 15:
            $scope.days.d15=value;
            break;
          case 16:
            $scope.days.d16=value;
            break;
          case 17:
            $scope.days.d17=value;
            break;
          case 18:
            $scope.days.d18=value;
            break;
          case 19:
            $scope.days.d19=value;
            break;
          case 20:
            $scope.days.d21=value;
            break;
          case 22:
            $scope.days.d22=value;
            break;
          case 23:
            $scope.days.d23=value;
            break;
          case 24:
            $scope.days.d24=value;
            break;
          case 25:
            $scope.days.d25=value;
            break;
          case 26:
            $scope.days.d26=value;
            break;
          case 27:
            $scope.days.d27=value;
            break;
          case 28:
            $scope.days.d28=value;
            break;
          case 29:
            $scope.days.d29=value;
            break;
          case 30:
            $scope.days.d30=value;
            break;
          case 31:
            $scope.days.d31=value;
            break;
        }
    }

    //标记某天为节假日
    $scope.tagHolidayChange=function () {
      tagDay=$scope.queryInfo.tagHoliday.toLocaleDateString();
      $scope.tagHolidayMsg='你确定要设置'+tagDay+'为节假日吗？';
      FoundationApi.publish('tagHolidayModal','open');
    }

    $scope.agree=function () {
      var param={
        date:tagDay,
        workPlaceId:workPlaceId,
        userId:userId
      }
      commonService.PostRequest(url+"tagHoliday",param).then(function (data) {
        $scope.logInfo=data;
      },function (e) {
        $scope.msg.errorMsg=e.message;
        FoundationApi.publish('errorModel','open');
      });
    }
    $scope.refuse=function (type) {
      if(type==1){
        FoundationApi.publish('tagHolidayModal','close');
      }else if(type==2){
        FoundationApi.publish('exceptionSubmitModal','close');
      }

    }

    $scope.joinTimeFocus=function () {
      var picker=document.getElementById('joinTimePicker');
      picker.type='date';
    }

    $scope.joinTimeBlur=function () {
      var picker=document.getElementById('joinTimePicker');
      picker.type='text';
    }

    //按查询条件查询员工
    $scope.employeeQuery=function () {
      getEmployee();
    }

    //按条件查询异常
    $scope.exceptionQuery=function () {
      getException();
    }


    $scope.submitResultAgree=function () {
      var j=JSON.stringify($scope.details);
      var param={
        json:j,
        user:$sessionStorage['userId']
      }
      var employee={
        employeeId:$scope.details[0].id,
        employeeName:$scope.details[0].name
      }
      commonService.PostRequest(url+"modifyException",param).then(function (data) {
        FoundationApi.publish('exceptionSubmitModal','close');
        getEmployeeException(employee);
      },function (e) {
        $scope.msg.errorMsg=e.content;
        FoundationApi.publish('exceptionSubmitModal','close');
        FoundationApi.publish('errorModel','open');
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
          $scope.msg.errorMsg='未选择异常原因';
          FoundationApi.publish('errorModel','open');
        }else{
          for (var j=0;j<$scope.details.length;j++){
            if($scope.details[j].choose){
              $scope.details[j].amReason=$scope.all.reason;
              $scope.details[j].pmReason=$scope.all.reason;
            }
          }
          FoundationApi.publish('exceptionSubmitModal','open');
        }
      }else{
        $scope.msg.errorMsg='未选中任何一项';
        FoundationApi.publish('errorModel','open');
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

    var getEmployeeException=function (employee) {
      var param={
        employeeId:employee.employeeId
      };
      commonService.PostRequest(url+"getExceptionDetail",param).then(function (data) {
        if(data.length>0){
          var array=[];
          for(var i=0;i<data.length;i++){
            var a=data[i].arriveTime==null?'未打卡':new Date(data[i].arriveTime).toLocaleTimeString();
            var l=data[i].leaveTime==null?'未打卡':new Date(data[i].leaveTime).toLocaleTimeString();
            array[i]=new map(data[i].id,employee.employeeName,new Date(data[i].today).toLocaleDateString(),a,l,data[i].amStatus,data[i].pmStatus);
          }
          $scope.details=array;
        }
        else{
          $scope.details=[];
        }
      },function (e) {
        $scope.msg.errorMsg=e.message;
        FoundationApi.publish('errorModel','open');
      });
    }

    //进入异常详情
    $scope.exceptionDetail=function (employee) {
      $scope.currentTag='5';
      getEmployeeException(employee);
    }

    //提交异常处理
    $scope.exceptionSubmit=function () {
      FoundationApi.publish('exceptionSubmitModal','open');
    }
  }
  homeController.$inject = ['$scope', '$state', '$sessionStorage','$stateParams','commonService','FoundationApi'];
  app.register.controller('homeController', homeController);
});

