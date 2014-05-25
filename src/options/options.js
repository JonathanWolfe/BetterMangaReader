var optionsApp = angular.module('optionsApp', []);

optionsApp.controller('optionsList', function ($scope) {
  $scope.phones = $.getJSON('../test-json.json', function(data){ return data; });

  $scope.orderProp = 'id';
});