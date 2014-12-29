var app = angular.module('algorithmik', []);

app.controller('Algorithmik', ['$scope', function ($scope) {

    var problem = 0;
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

    dataMirror.setValue(JSON.stringify(problems[problem].data));

    var code = $.jStorage.get("problem"+problem);
    if (code) {
        codeMirror.setValue(code);
    } else {
        codeMirror.setValue(problems[problem].template);
    }



    //Public variables
    $scope.statusType = 0;
    $scope.message = "Execute the code";
    $scope.switch = 0;

    //Private variables
    $scope.getDescription = function() {
        return problems[problem].description;
    };

    $scope.switchData = function() {
        if ($scope.switch == 2) {
            dataMirror.setValue(JSON.stringify(problems[problem].data));
            $scope.switch = 1;
        } else if ($scope.switch == 1) {
            dataMirror.setValue(JSON.stringify(executionOutput));
            $scope.switch = 2;
        }
    };

    $scope.getDataPanelClass = function() {
        if ($scope.switch == 2) {
            return 'panel panel-primary';
        } else {
            return 'panel panel-default';
        }
    };

    $scope.reset = function() {
        codeMirror.setValue(problems[problem].template);
        $.jStorage.deleteKey("problem"+problem);
    }

    $scope.execute = function(event) {
        if (!event || (event.key === 'F9' || event.keyCode === 120)) {
            $.jStorage.set("problem"+problem, codeMirror.getValue());
            evaluate();
        }
    };

    function evaluate() {
        try {
            var input = _.clone(problems[problem].data);
            var start = new Date;
            eval(codeMirror.getValue());
            var time = new Date - start;
            executionOutput = output;
            var correct = problems[problem].evaluate(output);

            if (!correct) {
                $scope.statusType = 2;
                $scope.message = "Output does not meet the requirements";
            } else {
                $scope.statusType = 3;
                $scope.message = "Completed in "+time+" ms";
            }

            $scope.switch = 2;
            dataMirror.setValue(JSON.stringify(executionOutput));
        } catch (error) {
            $scope.switch = 0;
            $scope.statusType = 1;
            $scope.message = error.message;
            dataMirror.setValue(input);
        }

    }
}]);

var problems = [

    {
        'name': 'Simple Sort',
        'data': [1, 2, 3, 4, 5, 6, 7, 3, 2, 9, 3, 7, 2],
        'description' : 'Sort the array asc',
        'template': '//var input = [data values]; \nconsole.log(input); \n var output = input',
        'evaluate': function(output) {
            var correct = true;
            var last;
            _.each(output, function (item) {
                if (correct && last && last > item) {
                    correct = false;
                }
                last = item;
            });

            return correct;
        }
    }


]