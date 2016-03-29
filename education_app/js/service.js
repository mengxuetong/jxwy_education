/**
 * Created by meng on 15-11-13.
 */
define(function(require){
    var app = require('./app');
    // 用户认证过滤器
    app.factory('AuthInterceptor',['$rootScope','$q','$window','AUTH_EVENTS', function ($rootScope,$q,$window,AUTH_EVENTS) {
            return {
                request: function(config){
                    config.headers = config.headers || {};
                    if($window.sessionStorage.token){
                        config.headers.Authorization = $window.sessionStorage.token;
                    }
                    $rootScope.loading = true;
                    return config;
                },
                response: function(res){
                    $rootScope.loading = false;
                    return res;
                },
                responseError: function(res){
                    $rootScope.$broadcast({
                        401: AUTH_EVENTS.notAuthenticated,
                        403: AUTH_EVENTS.notAuthorized,
                        419: AUTH_EVENTS.sessionTimeout,
                        440: AUTH_EVENTS.sessionTimeout
                    }[res.status], res);
                    return $q.reject(res);
                }
            }
        }])
        // 用户身份数据
        .service('Session', [function () {
            this.create = function (userId, userName, userRole, identity) {
                //this.id = sessionId;
                this.userId = userId;
                this.name = userName;
                this.userRole = userRole;
                this.identity =  identity;
            };
            this.destroy = function () {
                //this.id = null;
                this.userId = null;
                this.userRole = null;
                this.name = null;
                this.identity = null;
            };
            return this;
        }])
        // 用户登录与登出认证
        .factory('AuthService', ['$http','Session','URL_PATH','$resource','$q',function ($http, Session, URL_PATH, $resource, $q) {

            var authService = {
                login: $resource(URL_PATH+'system/login'), //用户登录
                logout: $resource(URL_PATH+'system/loginOut') //用户登出
            };

            authService.getUserInfo = function () {  //每次刷新请求认证信息
                return $http.get(URL_PATH+'user/getUser');
            };

            //验证用户ID存在与否
            authService.isAuthenticated = function () {
                return !!Session.userId;
            };

            // 验证用户权限
            authService.isAuthorized = function (authorizedRoles) {
                if (!angular.isArray(authorizedRoles)) {  //验证是否数组数据
                    authorizedRoles = [authorizedRoles];
                }
                return (authService.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1); // 返回 true 或 false
            };

            return authService;
        }])
        .factory('HomeMain',['$resource','URL_PATH',function($resource,URL_PATH){
            return {
                getHomes: $resource(URL_PATH+'statistics/school'),
                getUser: $resource(URL_PATH+'user/getUser')
            }
        }])
        .factory('UserInfo',['$resource','URL_PATH',function($resource,URL_PATH){
            return {
                getInfo : function(){
                    return $resource(URL_PATH+'usermanager/getUserDetailInfo');
                },
                setPhone: function(){
                    return $resource(URL_PATH+'usermanager/updateMobile');
                },
                setPwd:function(){
                    return $resource(URL_PATH+'usermanager/updatePas')
                }
            }
        }])
        .factory('Notice',['$resource','URL_PATH',function($resource,URL_PATH){
            return {
                getNotice: $resource(URL_PATH+'notify/getNotifyList'),
                noticePeople: $resource(URL_PATH+'statistics/school'),
                sentNotice: $resource(URL_PATH+'notify/insert'),
                noticeDetail: $resource(URL_PATH+'notify/detail/:articleId',{articleId: '@articleId'}),
                noticeArticle: $resource(URL_PATH+'notify/article/:articleId',{articleId: '@articleId'})
            }
        }])
        .factory('Users',['$resource','URL_PATH',function($resource,URL_PATH){
            return {
                getUserList: $resource(URL_PATH+'user/getUserList'),
                getCurrentArea: $resource(URL_PATH+'user/getCurrentArea'),
                queryRegions: $resource(URL_PATH+'user/queryRegions'),
                addUser: $resource(URL_PATH+'user/addUser'),
                delUser: $resource(URL_PATH+'user/delUser/:userId',{userId: '@userId'}),
                getUserDetail: $resource(URL_PATH+'user/getUserById/:userId',{userId: '@userId'}),
                updateUser: $resource(URL_PATH+'user/updateUserInfo')
            }
        }])
        .factory('Ripple',[function(){
            return {
                init : function(){$.material.init();}
            }
        }])
       .factory('DateUtils',[function(){
            return {
                strToDateYMD: function(str){
                    var tempStrs = str.split(" ");
                    var dateStrs = tempStrs[0].split("-");
                    var year = parseInt(dateStrs[0], 10);
                    var month = parseInt(dateStrs[1], 10) - 1;
                    var day = parseInt(dateStrs[2], 10);
                    var date = new Date(year, month, day);
                    return date;
                },
                strToDateYMDHMS: function(str){
                    var tempStrs = str.split(" ");
                    var dateStrs = tempStrs[0].split("-");
                    var year = parseInt(dateStrs[0], 10);
                    var month = parseInt(dateStrs[1], 10) - 1;
                    var day = parseInt(dateStrs[2], 10);
                    var timeStrs = tempStrs[1].split("-");
                    var hour = parseInt(timeStrs [0], 10);
                    var minute = parseInt(timeStrs[1], 10) - 1;
                    var second = parseInt(timeStrs[2], 10);
                    var date = new Date(year, month, day);
                    return date;
                }
            }
        }])
       .factory('ComUtilService',[function(){
            return {
                replace_em : function(str){
                    str = str.replace(/\</g,'&lt;');
                    str = str.replace(/\>/g,'&gt;');
                    str = str.replace(/\n/g,'<br/>；');
                    str = str.replace(/\[em_([0-9]*)\]/g,'<images src="./face/$1.gif" border="0" />');
                    return str;
                },
                loadimg: function(arr,funLoading,funOnLoad,funOnError){ // 图片集合，当前图片加载完成，所有图片都加载完成，图片加载失败时
                    var numLoaded=0, //加载完成总个数
                        numError=0, //完成中失败的个数
                        isObject=Object.prototype.toString.call(arr)==="[object Object]" ? true : false;

                    var arr=isObject ? arr.get() : arr;
                    for(a in arr){
                        //var src=isObject ? $(arr[a]).attr("data-src") : arr[a];
                        var src=isObject ? $(arr[a]).attr("src") : arr[a];
                        preload(src,arr[a]);
                    }

                    function preload(src,obj){
                        var img=new Image();
                        img.src=src;

                        img.onload=function(){
                            numLoaded++;
                            funLoading && funLoading(numLoaded,arr.length,src,obj);
                            funOnLoad && numLoaded==arr.length && funOnLoad(numError);
                        };
                        img.onerror=function(){
                            numLoaded++;
                            numError++;
                            funOnError && funOnError(numLoaded,arr.length,src,obj);
                        }
                    }
                    /*
                     n：已加载完成的数量；
                     total：总共需加载的图片数量；
                     src：当前加载完成的图片路径；
                     obj：当loadimg函数中传入的arr为存放图片路径的数组时，obj=src，是图片路径，
                     当arr为jquery对象时，obj是当前加载完成的img dom对象。
                     */
                }
            }
        }])
        .factory('CopyObj',[function(){
            return {
                cp: function copy(object) {
                    var map = new Map()
                    function cp(object) {

                        var _object = map.get(object)
                        if (_object) return _object

                        _object = {}
                        map.set(object, _object)

                        for (var key in object) {
                            if (object.hasOwnProperty(key)) {
                                var value = object[key]
                                // 还需要过滤 Node/Window 等原生对象，以及一些其他情况
                                if (value && typeof value === 'object') {
                                    _object[key] = cp(value)
                                }
                                else {
                                    _object[key] = value
                                }
                            }
                        }

                        return _object
                    }

                    return cp(object)
                }
            }
        }])
});



