define(function (require) {
    var app = require('./app');
    app
        .controller('MainController', ['$rootScope','$scope','$state','$alert','USER_ROLES','AuthService', function ($rootScope,$scope,$state,$alert,USER_ROLES,AuthService) {
            $scope.userRoles = USER_ROLES;
            $scope.isAuthorized = AuthService.isAuthorized;

            $rootScope.upImgFlag = false;
            $rootScope.loading = false;
            $rootScope.loadingText = '';
            $rootScope.main = {
                allInfo: {}
            }

            $scope.myAlert = $alert({title: "", content: "",container:'#alert-wrap', placement: 'top', type: "", show: false, duration: 3});
            $scope.showAlert = function(type,title,content){
                this.myAlert.$scope.title = title;
                this.myAlert.$scope.content = content;
                this.myAlert.$scope.type = type;
                this.myAlert.show();
            }
            $scope.setCurrentUser = function (user) {
                $scope.currentUser = user;
            };
            $scope.$on('auth-login-success',function(){
                $state.go('home.organization');
            });
            $scope.$on('auth-login-failed',function(err,data){
                $scope.showAlert('danger','',data.message);
            });
            $scope.$on('auth-logout-success',function(){
                // 跳到登录页
                $state.transitionTo('login');
            });
            $scope.$on('auth-session-timeout',function(response){
                // 弹出登录框
                $state.transitionTo('login');
            });
            $scope.$on('auth-not-authenticated',function(){
                $state.transitionTo('login');
            });
            $scope.$on('auth-not-authorized',function(){
                $state.transitionTo('login');
            });
        }])
        .controller('UserController',['$rootScope','$scope','$cookies','AUTH_EVENTS','AuthService','Session','$window','USER_ROLES',function ($rootScope, $scope,$cookies, AUTH_EVENTS, AuthService, Session, $window, USER_ROLES){
            $scope.credentials = {
                username: '',
                password: ''
            };
            //是否记住密码
            $scope.rememberME = false;
            $scope.remember = function(){
                $scope.rememberME = !$scope.rememberME;
            }
            var credentials = $cookies.get('users');
            if(credentials){
                $scope.credentials = angular.fromJson(credentials);
            }

            $scope.loginFlag = true;
            $scope.login = function (credentials) {
                if($scope.loginFlag){
                    $scope.loginFlag = false;
                    if(credentials.username === '' || credentials.password === ''){
                        $scope.loginFlag = true;
                        $scope.showAlert('danger','','用户名或密码不能为空');
                        return;
                    }
                    // 提交登录
                    AuthService.login.save(credentials,function(user,status, headers, config){
                        $scope.loginFlag = true;
                        if(user.code == 1){
                            $window.sessionStorage.token = user.data.token; //存储token
                            //$rootScope.showAll = true;
                            // 每次运行或刷新浏览器请求身份数据并存储到Session服务
                            AuthService.getUserInfo()
                                .success(function(res,status,headers,config){
                                    var res = res;
                                    if(res.code == 1){
                                        var role;
                                        switch(res.data.identity){
                                            case "4":
                                                role = USER_ROLES.school;
                                                break;
                                            case "5":
                                                role = USER_ROLES.area;
                                                break;
                                            case "6":
                                                role = USER_ROLES.city;
                                                break;
                                            case "7":
                                                role = USER_ROLES.province;
                                                break;
                                        }
                                        Session.create(res.data.userId, res.data.userName, role, res.data.identity);
                                        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess); //广播登录成功
                                    }else{
                                        console.log('login error');
                                        $scope.myAlert('danger','',data.message);
                                    }
                                })
                                .error(function(data,status,headers,config){
                                    console.log('身份认证失败');
                                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                                    return;
                                });


                            // 监听路由变化之前
                            function stateChage(){
                                $rootScope.$on('$stateChangeStart', function (event, next) {
                                    if(Object.getOwnPropertyNames(next).indexOf('data') !== -1){
                                        var authorizedRoles = next.data.authorizedRoles; //去往路由的用户权限规则
                                        if (!AuthService.isAuthorized(authorizedRoles)) { //检测用户是否登录和用户权限，验证不通过时：
                                            event.preventDefault();
                                            if (AuthService.isAuthenticated()) {
                                                // 用户没有权限
                                                $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                                            } else {
                                                // 用户未登录
                                                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                                            }
                                        }

                                    }
                                });
                            }

                            //是否记住密码，保存cookies
                            if($scope.rememberME){
                                var expireDate = new Date();
                                expireDate.setDate(expireDate.getDate() + 5);
                                $cookies.put('users', angular.toJson(credentials), {'expires': expireDate});
                            }
                            $scope.credentials = {
                                username: '',
                                password: ''
                            };
                        }else if(user.code == 0){
                            $scope.loginFlag = true;
                            $rootScope.$broadcast(AUTH_EVENTS.loginFailed,user); //广播登录失败
                        }
                    },function(data,status,headers,config){
                        delete $window.sessionStorage.token;
                    });
                }
            };
        }])
        .controller('HomeController',['$rootScope','$scope','HomeMain','AuthService','Session','AUTH_EVENTS',function($rootScope,$scope,HomeMain,AuthService,Session,AUTH_EVENTS){
            var User = HomeMain.getUser;
            User.get(function(res){
                if(res.code == 1){
                    $scope.user = res.data;
                }
            });

            var Logout = AuthService.logout;
            //$scope.username = Session.name;
            //退出登录
            $scope.logout = function (){
                Logout.get(function(res){
                    if(res.code == 1){
                        Session.destroy();
                        $scope.safeApply(function(){
                            $scope.username = Session.name;
                            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                            //$rootScope.showAll = false;
                        })
                    }else if(res.code == 0){
                        $scope.myAlert.$scope.content = res.message;
                        $scope.myAlert.$scope.type = 'danger';
                        $scope.myAlert.show();
                    }
                })

            };
        }])
        .controller('UserInfoController',['$scope','$uibModal','UserInfo','Session','AuthService',function($scope,$uibModal,UserInfo,Session,AuthService){
            //var Info = AuthService.getUserInfo();
            var Phone = UserInfo.setPhone();
            var Pwd = UserInfo.setPwd();

            $scope.phoneEnable = true;
            $scope.pwdEnable = true;

            AuthService.getUserInfo().success(function(res){
                $scope.infoRes = res;
                if(res.code == 1){
                    $scope.infos = res.data;
                }
            }).error(function(res){

            });
            $scope.pwdJson = {};
            $scope.openPwd = function(pwd){
                var pwd = pwd;
                var pwdInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'pwd.html',
                    controller: 'UserInstanceCtrl',
                    resolve: {
                        pwdModal: function () {
                            $scope.pwdJson.pwd = pwd;
                            return $scope.pwdJson
                        }
                    }
                });

                pwdInstance.result.then(function (pwds) { //确定
                    $scope.infos.pwd = pwds.newPwd;
                    $scope.enable('pwd');
                    $scope.pwdJson = {
                        pwd: '',
                        oldPwd: '',
                        confirmPwd: ''
                    }
                }, function () {  //取消
                    $scope.pwdJson = {
                        pwd: '',
                        oldPwd: '',
                        confirmPwd: ''
                    }
                });
            };
            $scope.enable = function(name){
                var name = name;
                if(name == 'phone'){
                    $scope.phoneEnable = !$scope.phoneEnable;
                    if($scope.phoneEnable){
                        var ph = Phone.save({phone: $scope.infos.mobile},function(res){
                            if(res.code == 1){
                                $scope.myAlert.$scope.content = '保存成功';
                                $scope.myAlert.$scope.type = 'success';
                                $scope.myAlert.show();
                            }else if(res.code == 0){
                                $scope.myAlert.$scope.content = '保存失败';
                                $scope.myAlert.$scope.type = 'danger';
                                $scope.myAlert.show();
                            }
                        });
                    }
                }else if(name == 'pwd'){
                    //$scope.pwdEnable = !$scope.pwdEnable;
                    //if($scope.pwdEnable){
                    var p = Pwd.save({pwd: $scope.infos.pwd},function(res){
                        if(res.code == 1){
                            $scope.myAlert.$scope.content = '保存成功';
                            $scope.myAlert.$scope.type = 'success';
                            $scope.myAlert.show();
                        }else if(res.code == 0){
                            $scope.myAlert.$scope.content = '保存失败';
                            $scope.myAlert.$scope.type = 'danger';
                            $scope.myAlert.show();
                        }
                    });
                    //}
                }
            }
        }])
        .controller('UserInstanceCtrl',['$scope','$uibModalInstance','pwdModal',function($scope, $uibModalInstance,pwdModal){
            $scope.pwds = pwdModal;

            $scope.pwdErrors = {
                oldFlag: false,
                newFlag: false,
                confirmFlag: false
            };
            $scope.ok = function () {
                $scope.pwdErrors = {
                    oldFlag: false,
                    newFlag: false,
                    confirmFlag: false
                };
                if($scope.pwds.oldPwd != pwdModal.pwd){
                    $scope.pwdErrors.oldFlag = true;
                    return;
                }else if($scope.pwds.oldPwd == pwdModal.pwd && $scope.pwds.newPwd !== $scope.pwds.confirmPwd){
                    $scope.pwdErrors.confirmFlag = true;
                    return;
                }else if($scope.pwds.oldPwd && $scope.pwds.newPwd && $scope.pwds.confirmPwd && $scope.pwds.oldPwd == pwdModal.pwd && $scope.pwds.newPwd === $scope.pwds.confirmPwd){
                    $uibModalInstance.close($scope.pwds);
                }
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }])
        .controller('OrganizationController',['$scope','HomeMain',function($scope,HomeMain){
           var Main = HomeMain.getHomes;
            Main.get(function(res){
                $scope.organizationRes = res;
            });

            $scope.lastClicked = null;
            $scope.buttonClick = function($event, node) {
                $scope.lastClicked = node;
                $event.stopPropagation();
            }
            $scope.showSelected = function(sel) {
                $scope.selectedNode = sel;
            };
            $scope.opts = {
                nodeChildren: "sub"
            };
        }])
        .controller('NoticeListController',['$scope','Notice',function($scope,Notice){
            var notice = Notice.getNotice;
            $scope.currentPage = 1;
            $scope.showStrip = 10;
            $scope.noticeRes = null;
            $scope.noticeData = null;
            $scope.totalItems = null;
            $scope.maxSize = 5;
            $scope.goPage;
            $scope.noticeObj = {};
            $scope.searchNotice = function(currentPage,cb){
                notice.get({currentPage: currentPage,showStrip: $scope.showStrip, title: $scope.noticeObj.searchTitle},function(res){
                    $scope.noticeRes = res;
                    if(res.code == 1){
                        $scope.currentPage = res.data.pageInfo.currentPage;
                        $scope.noticeData = res.data;
                        $scope.totalItems = res.data.pageInfo.count;
                        if(cb){
                            cb();
                        }
                    }
                })
            };
            $scope.searchNotice(1);
            $scope.pageChanged = function(currentPage){
                $scope.searchNotice(currentPage);
            }
            $scope.jumpTo = function(numPages,goPage){
                if(parseInt(goPage) && goPage <= numPages){
                    $scope.searchNotice(goPage);
                }
            }
            $scope.search = function(currentPage){
                $scope.searchNotice(currentPage);
            }
        }])
        .controller('NoticeInsertController',['$scope','Notice',function($scope,Notice){
            var vm = this;
            var people = Notice.noticePeople;
            var noticeSent = Notice.sentNotice;
            vm.checked = false;
            $scope.notifyJson = {};
            $scope.notifyJson.upPreview = false;

            $scope.selectAll = function(master){
                if(master){
                    checkAll(vm.teacherTree);
                    checkAll(vm.parentTree);
                }else{
                    uncheckAll(vm.teacherTree);
                    uncheckAll(vm.parentTree);
                }
            };
            //function checkAll(arr){
            //    var arr = arr;
            //    angular.forEach(arr,function(item,i){
            //        if(!item.$$isChecked){
            //            item.$$isChecked = true;
            //        }
            //        if(item.sub && item.sub.length > 0){
            //            angular.forEach(item.sub,function(item,i){
            //                item.$$isChecked = true;
            //            })
            //        }
            //    })
            //}
            function checks(arr){
                if(!item.$$isChecked){
                    item.$$isChecked = true;
                }
                if(item.sub && item.sub.length > 0){
                    angular.forEach(item.sub,function(item,i){
                        item.$$isChecked = true;
                    })
                }
            }
            //function uncheckAll(arr){
            //    var arr = arr;
            //    angular.forEach(arr,function(item,i){
            //        if(item.$$isChecked){
            //            item.$$isChecked = false;
            //        }
            //        if(item.sub && item.sub.length > 0){
            //            angular.forEach(item.sub,function(item,i){
            //                item.$$isChecked = false;
            //            })
            //        }
            //    })
            //}
            var p,t;
            people.get(function(res){
                $scope.organizationRes = res;
                if(res.code == 1){
                    p = res.data.subParent;
                    t = res.data.subTeacher;
                    vm.teacherTree = res.data.subTeacher;
                    vm.parentTree = res.data.subParent;
                    $scope.notifyContent = {
                        title: '',
                        content: '',
                        userIds: {
                            teachers: vm.teacherTree,
                            parents:  vm.parentTree
                        }
                    };
                }
            });

            vm.itemClicked = function ($item) {
                vm.selectedItem = $item;
                vm.selectedItem.$$isChecked = !vm.selectedItem.$$isChecked;
            };

            vm.itemCheckedChanged = function($item){
                $scope.safeApply(function(){
                    var ele = event.target;
                    if(!$item.$$isChecked){ //当前为假时
                        $(ele).siblings("ul").find('input[type="checkbox"]').prop('checked',false);  // 子级不选中
                        $(ele).siblings("ul").find('input[type="checkbox"]').prop('ngModel',false);  // 子级不选中
                    }else{ //当前为真时
                        $scope.safeApply(function(){
                            if(!($(ele).parent('li').siblings("li").find("input").prop('checked'))){
                                $(ele).parents().siblings('input[type="checkbox"]').prop('checked',true); //父级选中
                                $(ele).parents().siblings('input[type="checkbox"]').prop('ngModel',true); //父级选中
                            }
                        })
                    }
                });
            };
            function chooseArrs(arr){
                var newArr = [];
                var cpArr = arr && arr.slice(0);
                if(cpArr && cpArr.length>0){
                    angular.forEach(cpArr,function(ele,n){
                        if(ele.$$isChecked){
                            newArr.push(ele);
                            if(ele.sub && ele.sub.length> 0){
                                angular.forEach(ele.sub,function(e,n){
                                    if(!e.$$isChecked){
                                        ele.sub.splice(n,1);
                                    }
                                })
                            }
                        }
                    })
                }
                return newArr;
            }

            vm.sendMessage = function(){
                //var nP = [] = p.slice(0);
                //var nT = [] = t.slice(0);
                var selectPerson = false;
                if(!$scope.notifyContent.title){
                    $scope.showAlert('danger','','请填写标题');
                    return;
                }
                if(!$scope.notifyContent.content){
                    $scope.showAlert('danger','','请填写通知内容');
                    return;
                }
                function searchSelect(arrs){
                    angular.forEach(arrs,function(item,i){
                        if(item.$$isChecked && item.sub && item.sub.length > 0){
                            angular.forEach(item.sub,function(ele,j){
                                if(ele.$$isChecked){
                                    selectPerson = true;
                                    return;
                                }
                            })
                        }
                    });
                }
                searchSelect($scope.notifyContent.userIds.teachers);
                searchSelect($scope.notifyContent.userIds.parents);

                if(!selectPerson){
                    $scope.showAlert('danger','','请选择联系人');
                    return;
                }
                var parents = chooseArrs(vm.parentTree);
                var teachers = chooseArrs(vm.teacherTree);
                $scope.notifyContent.userIds.parents = parents;
                $scope.notifyContent.userIds.teachers = teachers;
                noticeSent.save({notifyContent: JSON.stringify($scope.notifyContent)},function(res){
                    if(res.code == 1){
                        $scope.notifyJson.notify_id = res.data.id;
                        $scope.uploadFile(function(){
                            $scope.notifyContent = {
                                title: '',
                                content: '',
                                userIds: []
                            };
                            $scope.state.transitionTo('home.notice.list');
                            //$scope.searchNotice(1,function(){
                            //    $scope.state.go('home.notice')
                            //});
                        }); //上传图片
                    }
                })
            }

            $scope.uploadFile = function(fn) {
                $scope.processDropzone(fn);
            };

            $scope.reset = function() {
                $scope.resetDropzone();
                $scope.state.transitionTo('home.notice.list');
            };
            return vm;
        }])
        .controller('NoticeDetailController',['$scope','Notice',function($scope,Notice){
            var noticeDetail = Notice.noticeDetail;
            $scope.isRead = 2;
            $scope.receivePerson = '';
            $scope.readItems = [
                {id: '',val: '全部'},
                {id: 1,val: '已查看'},
                {id: 0,val: '未查看'}
            ];
            $scope.filterRread = $scope.readItems[0].id;
            function search(){
                $scope.filterRread = '';
                noticeDetail.get({articleId:$scope.stateParams.articleId, receivePerson: $scope.receivePerson},function(res){
                    if(res.code == 1){
                        $scope.noticeDetials = res.data;
                    }
                })
            }
            search();
            $scope.searchNoticeDetail = function(){
                if($scope.receivePerson){
                    search();
                }
            }
        }])
        .controller('NoticeArticleController',['$scope','Notice',function($scope,Notice){
            var _this = this;
            var sendPeople = Notice.noticePeople;
            var noticeArticle = Notice.noticeArticle;
            noticeArticle.get({articleId: $scope.stateParams.articleId},function(res){
                if(res.code == 1){
                    $scope.noticeArticle = res.data;
                    _this.teacherTree = res.data.teachers;
                    _this.parentTree = res.data.parents;
                }
            })
            return _this;
        }])
        .controller('UsersListController',['$scope','$uibModal','Users','$q',function($scope,$uibModal,Users,$q){
            var GetUsers = Users.getUserList;
            var DelUser = Users.delUser;
            $scope.usersOptions = {};
            $scope.usersOptions.currentPage = 1;
            $scope.usersOptions.showStrip = 10;
            $scope.usersRes = null;
            $scope.usersData = null;
            $scope.usersOptions.totalItems = null;
            $scope.usersOptions.maxSize = 5;
            $scope.goPage;
            $scope.searchUser = function(currentPage,showStrip,title,cb){
                var options = {
                    currentPage: currentPage,
                    showStrip: showStrip,
                    title: (title ? title: '')
                }
                GetUsers.get(options,function(res){
                    $scope.usersRes = res;
                    if(res.code == 1){
                        $scope.usersOptions.currentPage = res.data.pageInfo.currentPage;
                        $scope.usersData = res.data;
                        $scope.usersOptions.totalItems = res.data.pageInfo.count;
                        if(cb){
                            cb();
                        }
                    }
                });
            };
            $scope.searchUser(1,$scope.usersOptions.showStrip);
            $scope.pageChanged = function(currentPage,showStrip,title){
                $scope.searchUser(currentPage,showStrip,title);
            };
            $scope.jumpTo = function(numPages,goPage){
                if(parseInt(goPage) && goPage <= numPages){
                    $scope.goPage = null;
                    $scope.searchUser(goPage,$scope.usersOptions.showStrip,$scope.usersOptions.searchName);
                }
            };
            $scope.delUser = function(userId,userName){
                var userId = userId;
                var delUserInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'confirm.html',
                    controller: 'UserDelInstanceCtrl',
                    resolve: {
                        userDelModal: function(){
                            var userJson = {
                                title: '提示',
                                content: '您确认要删除用户“'+userName+'”同学么？'
                            }
                            return userJson
                        }
                    }
                });
                delUserInstance.result.then(function () {
                    DelUser.get({userId: userId},function(res){
                        if(res.code == 1){
                            deleteId($scope.usersData.userList,userId);
                        }
                    })
                }, function () {

                });
            }
            function deleteId(arr,id){
                angular.forEach(arr,function(o,i){
                    if(id == o.id){
                        arr.splice(i,1);
                        return;
                    }
                })
            }
        }])
        .controller('UserDelInstanceCtrl',['$scope','$uibModalInstance','userDelModal',function($scope,$uibModalInstance,userDelModal){
            $scope.confirm = userDelModal; //给模板赋数据
            $scope.ok = function () {
                $uibModalInstance.close();
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }])
        .controller('UsersInsertController',['$scope','Users','$q',function($scope,Users,$q){
            var CurrentArea = Users.getCurrentArea;
            var QueryRegions = Users.queryRegions;
            var User = Users.addUser;
            $scope.areas = {
                one:[],
                two: [],
                three: []
            };
            $scope.areaSelecteds = {};
            $scope.userCurrentData = {};
            var getCurrent = function(){
                var deferred = $q.defer();
                CurrentArea.get(function(res){
                    deferred.notify('请求当前权限信息');
                    if(res.code == 1){
                        $scope.userCurrentData = res.data;
                        deferred.resolve(res.data);
                    }
                });
                return deferred.promise;
            };
            $scope.newUsers = {};
            $scope.getArea = function(seleteId,identity){
                switch(identity){
                    case 7:
                        $scope.areas.two = null,
                        $scope.areas.three = null,
                        $scope.areas.four = null;
                        break;
                    case 6:
                        $scope.areas.three = null,
                        $scope.areas.four = null;
                        break;
                    case 5:
                        $scope.areas.four = null;
                }
                $scope.areaId = seleteId;
                getRegions({currentAreaId:seleteId,identity: identity});
            };
            var currentPromise = getCurrent();
            currentPromise.then(function(data){
                var options = {currentAreaId:data.currentAreaId,identity: data.identity};
                getRegions(options);
            });
            function getRegions(options){
                QueryRegions.get(options,function(res){
                    if(res.code == 1){ //一级,省、直辖市
                        var identity = parseInt(res.data.identity);
                        $scope.safeApply(function(){
                            switch(identity){
                                case 7:  //省、直辖市
                                    console.log(7)
                                    $scope.areas.one = res.data.regions;
                                    $scope.areas.one.unshift({id:0,name:'请选择省/直辖市'});
                                    $scope.areaSelecteds.one = $scope.areas.one[0].id;
                                    break;
                                case 6: //市
                                    console.log(6)
                                    $scope.areas.two = res.data.regions;
                                    $scope.areas.two.unshift({id:0,name:'请选择市'});
                                    $scope.areaSelecteds.two = $scope.areas.two[0].id;
                                    break;
                                case 5: //区、县
                                    console.log(5)
                                    $scope.areas.three = res.data.regions;
                                    $scope.areas.three.unshift({id:0,name:'请选择区'});
                                    $scope.areaSelecteds.three = $scope.areas.three[0].id;
                                    break;
                                case 4:
                                    console.log(4)
                                    $scope.areas.four = res.data.regions;
                                    $scope.areas.four.unshift({id:0,name:'请选择学校'});
                                    $scope.areaSelecteds.four = $scope.areas.four[0].id;
                                    break;
                            }
                        })
                    }
                });
            }
            $scope.save = function(){
                $scope.newUsers.areaId = $scope.areaId;
                var tel=/^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/;
                if(!($scope.newUsers.userName)){
                    $scope.showAlert('danger','错误提示！','请填写用户名');
                    return;
                }
                if(!($scope.newUsers.departmentName)){
                    $scope.showAlert('danger','错误提示！','请填部门名称');
                    return;
                }
                if(!($scope.newUsers.areaId)){
                    $scope.showAlert('danger','错误提示！','请选择分配权限范围');
                    return;
                }
                if(!(tel.test($scope.newUsers.mobile))){
                    $scope.showAlert('danger','错误提示！','请选填写手机号');
                    return;
                }
                if(!($scope.newUsers.password)){
                    $scope.showAlert('danger','错误提示！','请设置密码');
                    return;
                }
                var saveOptions = $scope.newUsers;
                User.save(saveOptions,function(res){
                    if(res.code == 1){
                        $scope.state.transitionTo('home.usermanager.list');
                    }else{
                        $scope.showAlert('danger','错误提示',res.message);
                    }
                })
            }
        }])
        .controller('UserEditController',['$scope','Users',function($scope,Users){
            var UserDetail = Users.getUserDetail;
            var UserUpdate = Users.updateUser;
            UserDetail.get({userId: $scope.stateParams.userId},function(res){
                if(res.code == 1){
                    $scope.userDetail = res.data;
                }
            });
            $scope.save = function(){
                var tel=/^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/;
                if(!(tel.test($scope.userDetail.mobile))){
                    $scope.showAlert('danger','','请填写正确的手机号');
                    return;
                }
                if(!($scope.userDetail.password)){
                    $scope.showAlert('danger','密码不能为空');
                    return;
                }
                UserUpdate.save({userId: $scope.userDetail.id,password: $scope.userDetail.password,mobile: $scope.userDetail.mobile},function(res){
                    if(res.code == 1){
                        $scope.state.transitionTo('home.usermanager.list');
                    }else{
                        $scope.showAlert('danger','',res.message);
                    }
                })
            };
        }])

});