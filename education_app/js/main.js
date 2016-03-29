/**
 * Created by meng on 16-1-26.
 */
require.config({
    baseUrl: './',
    paths: {
        'app': 'js/app',
        'angular': 'components/angular/angular.min',
        'jquery': 'components/jquery/dist/jquery.min',
        'angular-ui-router': 'components/angular-ui-router/release/angular-ui-router.min',
        'angular-ui-grid': 'components/angular-ui-grid/ui-grid.min',
        'angular-bootstrap': 'components/angular-bootstrap/ui-bootstrap.min',
        'angular-bootstrap-tpl': 'components/angular-bootstrap/ui-bootstrap-tpls.min',
        'angular-animate': 'components/angular-animate/angular-animate.min',
        'angular-cookies': 'components/angular-cookies/angular-cookies.min',
        'angular-resource': 'components/angular-resource/angular-resource.min',
        'angular-strap': 'components/angular-strap/dist/angular-strap.min',
        'angular-strap-tpl': 'components/angular-strap/dist/angular-strap.tpl.min',
        'angular-sanitize': 'components/angular-sanitize/angular-sanitize.min',
        'material': 'components/bootstrap-material-design/dist/js/material.min',
        'ripples': 'components/bootstrap-material-design/dist/js/ripples.min',
        'angular-async-loader': 'components/angular-async-loader/dist/angular-async-loader',
        'angular-tree-control': 'js/angular-tree-control',
        'angular-utils': 'js/angular-utils',
        'dropZone': 'components/dropzone/dist/min/dropzone.min',
        'material-bootstrap': 'js/bootstrap-theme.min'
    },
    shim: {
        'angular': {exports: 'angular'},
        'app': {deps: ['angular']},
        'angular-ui-router': {deps: ['angular']},
        'angular-async-loader': {deps: ['angular']},
        'angular-resource': {deps: ['angular']},
        'angular-animate': {deps: ['angular']},
        'angular-bootstrap': {deps: ['angular']},
        'angular-bootstrap-tpl': {exports: 'angular-bootstrap-tpl',deps: ['angular','angular-bootstrap']},
        'angular-cookies': {deps: ['angular']},
        'angular-sanitize': {deps: ['angular']},
        'angular-strap': {deps: ['angular']},
        'angular-tree-control': {deps: ['angular']},
        'angular-strap-tpl': {deps: ['angular','angular-strap']},
        'dropzone': {deps: ['angular']},
        'angular-utils': {deps: ['angular'], exports: 'angular-utils'},
        'material': {deps: ['jquery']},
        'ripples': {deps: ['jquery']},
        'material-bootstrap':{deps:['jquery']}
    }
});
require(['angular','js/route','js/controller','js/service','js/directive'],function(angular){
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['app']);
        angular.element(document).find('html').addClass('ng-app');
    });
});
