define(function (require, exports, module) {
    var angular = require('angular');
    var asyncLoader = require('angular-async-loader');

    var $ = require('jquery');
    require('material');
    require('ripples');
    require('angular-ui-router');
    require('angular-resource');
    require('angular-animate');
    require('angular-cookies');
    require('angular-strap');
    require('angular-strap-tpl');
    require('angular-utils');
    require('angular-sanitize');
    require('angular-tree-control');
    require('dropZone');
    require('angular-bootstrap');
    require('angular-bootstrap-tpl');

    var app = angular.module('app', ['ui.router','ui.bootstrap','ngResource','ngSanitize','ngAnimate','ngCookies','mgcrea.ngStrap.alert','utils','treeControl']);
    //用户url 配置
    app.constant('URL_PATH','http://localhost:8080/jxwy_notify/eduapp/');
    //app.constant('URL_PATH','http://192.168.0.109:8080/jxwy_notify/eduapp/');
    app.constant('ADDRESS','182.92.165.57:8086/jxwy_notify/eduapp/');

    //用户状态配置
    app.constant("AUTH_EVENTS",{
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    })
    //用户权限规则
    .constant('USER_ROLES', {
        school: 'school',
        area: 'area',
        city: 'city',
        province: 'province'
    });
    //初始化或刷新浏览器执行
    app.run(['$rootScope', '$state', '$stateParams','$templateCache','AUTH_EVENTS', 'AuthService', 'Session', 'URL_PATH','USER_ROLES',function ($rootScope, $state, $stateParams,$templateCache, AUTH_EVENTS, AuthService, Session, URL_PATH,USER_ROLES) {
        // 赋值全局路由状态方便全局使用
        $rootScope.state = $state;
        $rootScope.stateParams = $stateParams;
        $rootScope.URL_PATH = URL_PATH; // 共用URL路径
        //手动更新视图函数
        $rootScope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            }else {
                this.$apply(fn);
            }
        };

        // 每次运行或刷新浏览器请求身份数据并存储到Session服务
        AuthService.getUserInfo()
            .success(function(res,status,headers,config){
                var res = res;
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
                    default:
                        $state.go('login')
                }
                Session.create(res.data.userId, res.data.userName, role, res.data.identity);
                stateChage();
            })
            .error(function(data,status,headers,config){
                console.log('身份认证失败');
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                stateChage();
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

        $rootScope.$on('stateChangeSuccess',function(){
            $templateCache.removeAll();
        })
        $rootScope.$on('$viewContentLoaded',function(event, next){
            $.material.ripples();
            //$.material.input();
        })
    }])

    asyncLoader.configure(app);
    module.exports = app;
});