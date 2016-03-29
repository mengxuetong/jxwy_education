define(function (require) {
    var app = require('./app');

    app.config(['$stateProvider','$urlRouterProvider','$httpProvider','$alertProvider','USER_ROLES', function ($stateProvider,$urlRouterProvider,$httpProvider,$alertProvider,USER_ROLES) {

        $httpProvider.interceptors.push(['$injector', function ($injector) {
            return $injector.get('AuthInterceptor');
        }]);

        angular.extend($alertProvider.defaults, {
            animation: 'am-fade-and-slide-top',
            placement: 'top'
        });

        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

        $urlRouterProvider.otherwise('/home/organization');
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'UserController'
            })
            .state('home', {
                url: '/home',
                abstract: true,
                templateUrl: 'templates/home.html',
                controller: 'HomeController',
                data: {
                    authorizedRoles:[USER_ROLES.school,USER_ROLES.area,USER_ROLES.city,USER_ROLES.province]
                }
            })
            .state('home.info',{
                url: '/info',
                templateUrl: 'templates/info.html',
                controller: 'UserInfoController',
                data: {
                    authorizedRoles:[USER_ROLES.school,USER_ROLES.area,USER_ROLES.city,USER_ROLES.province]
                }

            })
            .state('home.organization', {
                url: '/organization',
                templateUrl: 'templates/organization.html',
                controller: 'OrganizationController',
                data: {
                    authorizedRoles:[USER_ROLES.school,USER_ROLES.area,USER_ROLES.city,USER_ROLES.province]
                }
            })
            .state('home.notice',{
                url: '/notice',
                abstract: true,
                template: "<div ui-view></div>"
            })
            .state('home.notice.list',{
                url: '/list',
                templateUrl: 'templates/notice/notice.list.html',
                controller: 'NoticeListController',
                data: {
                    authorizedRoles:[USER_ROLES.school,USER_ROLES.area,USER_ROLES.city,USER_ROLES.province]
                }
            })
            .state('home.notice.insert',{
                url: '/insert',
                templateUrl: 'templates/notice/notice.insert.html',
                controller: 'NoticeInsertController as notice',
                data: {
                    authorizedRoles:[USER_ROLES.school,USER_ROLES.area,USER_ROLES.city,USER_ROLES.province]
                }
            })
            .state('home.notice.detail',{
                url: '/detail/:articleId',
                templateUrl: 'templates/notice/notice.detail.html',
                controller: 'NoticeDetailController',
                data: {
                    authorizedRoles:[USER_ROLES.school,USER_ROLES.area,USER_ROLES.city,USER_ROLES.province]
                }
            })
            .state('home.notice.article',{
                url: '/article/:articleId',
                templateUrl: 'templates/notice/notice.article.html',
                controller: 'NoticeArticleController as article',
                data: {
                    authorizedRoles:[USER_ROLES.school,USER_ROLES.area,USER_ROLES.city,USER_ROLES.province]
                }
            })
            .state('home.usermanager',{
                url: '/usermanager',
                abstract: true,
                template: '<div ui-view></div>'
            })
            .state('home.usermanager.list',{
                url: '/usermanger/list',
                templateUrl: 'templates/usermanager/user.list.html',
                controller: 'UsersListController',
                data: {
                    authorizedRoles:[USER_ROLES.school,USER_ROLES.area,USER_ROLES.city,USER_ROLES.province]
                }
            })
            .state('home.usermanager.add',{
                url: '/usermanager/add',
                templateUrl: 'templates/usermanager/user.add.html',
                controller: 'UsersInsertController',
                data: {
                    authorizedRoles:[USER_ROLES.school,USER_ROLES.area,USER_ROLES.city,USER_ROLES.province]
                }
            })
            .state('home.usermanager.edit',{
                url: '/usermanager/edit/:userId',
                templateUrl: 'templates/usermanager/user.edit.html',
                controller: 'UserEditController',
                data: {
                    authorizedRoles:[USER_ROLES.school,USER_ROLES.area,USER_ROLES.city,USER_ROLES.province]
                }
            })
    }]);
});