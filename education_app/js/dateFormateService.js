define(function(require,exports,module){
   exports.dateUtils = function(){
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
    }
})