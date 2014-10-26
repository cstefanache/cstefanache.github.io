(function(ns) {
  ns.SearchService = function() {

    this.getBlogItems = function() {
      return [
        {
          'heading' : 'Hello World',
          'description' : 'loading screen CSS3 animation',
          'dl': 'loadinganimation',
          'tags' : 'less css3 animation',
          'url' : 'pages/blogpages/testcssless.html'
        }
      ]
    }

  }

})(org.mrc);
