(function(ns) {

  ns.BlogController = function($scope, $routeParams, searchable) {

    var dl = $routeParams.dl;
    var blogItems = searchable.getBlogItems()
    var blogItem = blogItems[0];
    var foundIndex = 0;

    if (dl) {
      var foundBlogItem = _.find(blogItems, function(item, index){
        var found = item.dl === dl;
        if (found)
          foundIndex = index;
        return found;
      });

      if (foundBlogItem) {
        console.log(foundIndex);
        blogItem = foundBlogItem;
      }
    }

    $scope.current = blogItem;

    if (foundIndex>0) {
      $scope.previous = blogItems[foundIndex-1];
    }

    if (foundIndex<blogItems.length-1) {
      $scope.next = blogItems[foundIndex+1];
    }

    $scope.loaded = function(){
      SyntaxHighlighter.highlight();
      less.refresh();
    };

  }
})(org.mrc);
