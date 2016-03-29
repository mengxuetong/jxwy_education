angular.module('utils',['utils.services'])
    .config(function($compileProvider,$httpProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|sms|weixin):/);
        $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        $httpProvider.defaults.transformRequest = function(data) {
            var param = function(obj) {
                var query = '';
                var name, value, fullSubName, subName, subValue, innerObj, i;

                for (name in obj) {
                    value = obj[name];

                    if (value instanceof Array) {
                        for (i = 0; i < value.length; ++i) {
                            subValue = value[i];
                            fullSubName = name + '[' + i + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value instanceof Object) {
                        for (subName in value) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value !== undefined && value !== null) {
                        query += encodeURIComponent(name) + '='
                        + encodeURIComponent(value) + '&';
                    }
                }

                return query.length ? query.substr(0, query.length - 1) : query;
            };

            return angular.isObject(data) && String(data) !== '[object File]'
                ? param(data)
                : data;
        };
    });
angular.module('utils.services',[])
    .factory('localstorage',['$window', function($window){
        return {
            set: function(key,value){
                $window.localStorage[key] = value;
            },
            get: function(key,defaultValue){
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function(key,value){
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key){
                return JSON.parse($window.localStorage[key]);
            }
        }
    }])
    .factory('sessionStorage',['$window', function($window){
        return {
            set: function(key,value){
                $window.sessionStorage[key] = value;
            },
            get: function(key,defaultValue){
                return $window.sessionStorage[key] || defaultValue;
            },
            setObject: function(key,value){
                $window.sessionStorage[key] = JSON.stringify(value);
            },
            getObject: function(key){
                return JSON.parse($window.sessionStorage[key]);
            }
        }
    }])
