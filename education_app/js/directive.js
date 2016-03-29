define(function(require){
    var app = require('./app');
    app.directive('contentHeight',[function(){
            return {
                restrict: 'EA',
                link: function(scope,ele,attrs){
                    var clientH = $(window).height();
                    $(ele).height(clientH - 60);
                }
            }
        }])
    .directive('treeView',['$rootScope',function($rootScope){
        return {
            restrict: 'E',
            require: 'ngModel',
            templateUrl: '/treeView.html',
            scope: {
                treeData: '=',
                canChecked: '=',
                checked: '=',
                identity:'@',
                textField: '@',
                itemClicked: '&',
                itemCheckedChanged: '&',
                changeCheck: '&',
                itemTemplateUrl: '@'
            },
            controller:['$scope', function($scope){
                //是否扩展打开状态
                $scope.itemExpended = function(item, $event){
                    item.$$isExpend = ! item.$$isExpend;
                    $event.stopPropagation();
                };

                //项目图标
                $scope.getItemIcon = function(item){
                    var isLeaf = $scope.isLeaf(item);
                    if(isLeaf){
                        return 'fa fa-leaf';
                    }
                    return item.$$isExpend ? 'fa fa-minus': 'fa fa-plus';
                };

                $scope.isLeaf = function(item){
                    return !item.sub || !item.sub.length;
                };
                function uncheckAll(item){
                    if(item.sub && item.sub.length > 0){
                        angular.forEach(item.sub,function(item,i){
                            item.$$isChecked = false;
                            uncheckAll(item);
                        })
                    }else{
                        return false;
                    }
                }

                function checkSubAll(item){
                    if(item.$$isChecked){
                        if(item.sub && item.sub.length > 0){
                            angular.forEach(item.sub,function(item,i){
                                item.$$isChecked = true;
                                checkSubAll(item);
                            })
                        }else{
                            return false;
                        }
                    }
                }
                $scope.changeCheck = function(item){
                    //checkParent($scope.$parent.notifyContent.userIds.teachers,item);
                    //checkParent($scope.$parent.notifyContent.userIds.parents,item);
                    console.log($scope.$parent)
                    $rootScope.safeApply(function(){
                        if(!item.$$isChecked){
                            //uncheckAll(item);
                            checkP($scope.$parent.notifyContent.userIds.teachers,item,false);
                            checkP($scope.$parent.notifyContent.userIds.parents,item,false);
                        }else{
                            //checkSubAll(item);
                            checkP($scope.$parent.notifyContent.userIds.teachers,item,true);
                            checkP($scope.$parent.notifyContent.userIds.parents,item,true);
                        }
                    });
                }
                function checkP(arr,item,flag){
                    for(var i=0,j=arr && arr.length; i<j; i++){
                        if(!(arr[i] == item)){
                            if(arr[i].sub){
                                var n = 0;
                                for(var h = 0,k = (arr[i].sub ? arr[i].sub.length:0); h<k;h++){
                                    n++;
                                    if(arr[i].sub[h] == item){
                                        arr[i].$$isChecked = flag;
                                        arr[i].sub[h].$$isChecked = flag;
                                    }else if(n == arr[i].sub.length - 1){
                                        console.log('yes');
                                        checkP(arr[i].sub,item,flag);
                                    }
                                }
                            }
                        }else{
                            arr[i].$$isChecked = flag;
                        }
                    }

                    console.log($scope)
                }
                function checkParent(arrs,item){
                    angular.forEach(arrs,function(ele,i){
                        if(ele.sub && ele.sub.length > 0){
                            angular.forEach(ele.sub,function(e,n){
                                if(item == e){
                                    ele.$$isChecked = true;
                                    //return true;
                                }else{

                                }
                            })
                        }
                    })
                }
                $scope.warpCallback = function(callback, item, $event,index){
                    ($scope[callback] || angular.noop)({
                        $item:item,
                        $event:$event,
                        index: index
                    });
                };
            }]
        };
    }])
    .directive('dropzone',['$rootScope','URL_PATH','$window',function($rootScope,URL_PATH, $window){
        return {
            restrict: 'C',
            link: function(scope, element, attrs) {

                var config = {
                    url: URL_PATH+'notify/imageUpload',
                    maxFilesize: 100,
                    headers: {"Authorization": ($window.sessionStorage.token ? $window.sessionStorage.token : "")},
                    paramName: "file",
                    maxThumbnailFilesize: 5,
                    maxFiles: 5,
                    parallelUploads: 5,
                    acceptedFiles: 'image/jpeg,image/png,image/gif,image/jpg', //允许的文件类型
                    autoProcessQueue: false   // 是否自动上传
                    //previewsContainer: '',
                    //clickable: '#upFile'
                };

                var eventHandlers = {
                    //'addedfile': function(file) {
                    //    scope.file = file;
                    //    if (this.files[1]!=null) {
                    //        this.removeFile(this.files[0]);
                    //    }
                    //    scope.$apply(function() {
                    //        scope.fileAdded = true;
                    //    });
                    //},
                    'sending': function(file, xhr, formData){
                        formData.append('notify_id',scope.notifyJson.notify_id);
                    },
                    'addedfile': function(file){
                        file.previewElement.addEventListener("click", function() {
                            dropzone.removeFile(file);
                            scope.$apply(function() {
                                scope.fileAdded = true;
                                scope.notifyJson.upPreview = true;
                            });
                        });
                    },
                    'success': function (file, response) {
                        this.removeFile(file); //上传成功移除图片
                        if(dropzone.getAcceptedFiles().length === 0){
                            $rootScope.upImgFlag = false;
                            //scope.searchNotice(1,function(){
                            //    scope.state.go('home.notice')
                            //});
                            scope.state.transitionTo('home.notice.list')
                        }

                    }

                };

                dropzone = new Dropzone(element[0], config);

                angular.forEach(eventHandlers, function(handler, event) {
                    dropzone.on(event, handler);
                });

                //上传图片
                scope.processDropzone = function(fn) {
                    if(dropzone.getAcceptedFiles().length > 0){
                        $rootScope.upImgFlag = true;
                        dropzone.processQueue(); //上传图片动作
                    }else {
                        if(fn){
                            fn();
                        }
                    }
                };
                //取消图片选择
                scope.resetDropzone = function() {
                    dropzone.removeAllFiles();
                }
            }
        }
    }])
})


