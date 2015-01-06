var app = angular.module('algorithmik', []);

app.controller('Algorithmik', ['$scope', function ($scope) {

    var test = 0;
    var executionOutput;

    var codeMirror = CodeMirror(document.getElementById('cm'), {
        mode: "javascript",
        lineNumbers: true,
        tabSize: 2,
        smartIndent: true
    });

    var dataMirror = CodeMirror(document.getElementById('data'), {
        mode: "javascript",
        lineNumbers: false,
        tabSize: 2,
        readOnly: true
    });

    function prepareData() {
        dataMirror.setValue(JSON.stringify(tests[test].data));
        var code = $.jStorage.get("test" + test);
        if (code) {
            codeMirror.setValue(code);
        } else {
            codeMirror.setValue(tests[test].template);
        }


        //Public variables
        $scope.statusType = 0;
        $scope.message = "Execute the code";
        $scope.switch = 0;
    }

    prepareData()

    $scope.loadTest = function (index) {
        test = index;
        prepareData();
    }

    $scope.tests = _.map(tests, function (item) {
        return item.name;
    });

    //Private variables
    $scope.getDescription = function () {
        return tests[test].description;
    };

    $scope.switchData = function () {
        if ($scope.switch == 2) {
            dataMirror.setValue(JSON.stringify(tests[test].data));
            $scope.switch = 1;
        } else if ($scope.switch == 1) {
            dataMirror.setValue(JSON.stringify(executionOutput));
            $scope.switch = 2;
        }
    };

    $scope.getDataPanelClass = function () {
        if ($scope.switch == 2) {
            return 'panel panel-primary';
        } else {
            return 'panel panel-default';
        }
    };

    $scope.reset = function () {
        codeMirror.setValue(tests[test].template);
        $.jStorage.deleteKey("test" + test);
    }

    $scope.execute = function (event) {
        if (!event || (event.key === 'F9' || event.keyCode === 120)) {
            $.jStorage.set("test" + test, codeMirror.getValue());
            evaluate();
        }
    };

    function evaluate() {
        $(".CodeMirror-linenumber").removeClass('line-error')
        var input = _.clone(tests[test].data);
        var start = new Date;
        try {
            var funk = new Function('input', codeMirror.getValue());
            var time = new Date - start;
            var output = executionOutput = funk(input);

            if (!output) {
                $scope.statusType = 2;
                $scope.message = "output value not returned. Use: return variable to provide output result.";
            } else {
                var result = tests[test].evaluate(output);

                if (!result.correct) {
                    $scope.statusType = 2;
                    $scope.message = result.message;
                } else {
                    $scope.statusType = 3;
                    $scope.message = "Completed in " + time + " ms";
                }

                $scope.switch = 2;
                dataMirror.setValue(JSON.stringify(output));
            }

        } catch (e) {
            $scope.switch = 0;
            $scope.statusType = 1;
            $scope.message = e.message;

            if (e.lineNumber) {
                var lineNumber = $(".CodeMirror-linenumber")[e.lineNumber-1];
                if (lineNumber) lineNumber.className += ' line-error';
            }

            console.log(e.stack);

        }

    }
}]);

var tests = [

    {
        'name': 'Simple Sort',
        'data': [1, 2, 3, 4, 5, 6, 7, 3, 2, 9, 3, 7, 2],
        'description': 'Sort the array asc',
        'template': 'var output = input; \n \n \n //enter code here \n \n \n return output;',
        'evaluate': function (output) {

            var correct = true;
            var message = "Output does not meet the requirements";

            if (!(output instanceof Array)) {
                message = "Output must be an array";
                correct = false;
            }

            if (correct) {
                var last;
                _.each(output, function (item) {
                    if (correct && last && last > item) {
                        correct = false;
                        message = "List not sorted."
                    }
                    last = item;
                });
            }

            return {'correct' : correct, 'message' : message};
        }
    }

]