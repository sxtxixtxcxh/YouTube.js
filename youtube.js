//////////////////////////
//
// Youtube API Class
//
//////////////////////////

function YouTube(params){
  params          = params || {};
  this.user       = params.user             || null;
  this.orderby    = params.orderby          || 'published'; // 'viewCount', 'published', 'relevance
  this.perpage    = params.perpage          || 10;
  this.page       = params.page             || 1;
  this.safeSearch = params.saveSearch       || 'moderate'; // 'none', 'moderate', 'strict'
  this.embed      = {width  : params.width  || 425,
                     height : params.height || 344 };
  
  YouTube.prototype.request = function(url){
      //makes a script object, and executes the script
      //seems to be the only way to get data through youtube's api
      var head = document.getElementsByTagName("head")[0];
      var script = document.createElement("script");
      script.src = url;

      // Handle Script loading
      var done = false;

      // Attach handlers for all browsers
      script.onload = function(){
        // Handle memory leak in IE
        script.onload =  null;
        head.removeChild( script );
      };
      head.appendChild(script);
      return true;
  }
  
  YouTube.prototype.videoInfo = function(params){
    id          = params.id       || null;
    callback    = params.callback || null;
    //requires a video id and callback
    if(id != null && callback != null)
      return this.request("http://gdata.youtube.com/feeds/api/videos/"+id+"?v=2&alt=json-in-script&callback="+callback);
    else
      return false;
  }
  
  YouTube.prototype.videoFeed = function(params){
    user        = params.user                    || this.user;
    callback    = params.callback                || null;
    orderby     = params.orderby                 || this.orderby;
    perpage     = params.perpage                 || this.perpage;
    start       = (params.page*perpage)/perpage  || this.page;
    
    //requires a user's username and callback
    if(user != null && callback != null)
      return this.request("http://gdata.youtube.com/feeds/api/videos?v=2&author="+user+"&alt=json-in-script&format=5&orderby="+orderby+"&max-results="+perpage+"&start-index="+start+"&callback="+callback);
    else
      return false;
  }
  
  YouTube.prototype.videoSearch = function(params){
    query       = params.query                   || null;
    callback    = params.callback                || null;
    orderby     = params.orderby                 || this.orderby;
    perpage     = params.perpage                 || this.perpage;
    start       = (params.page*perpage)/perpage  || this.page;
    safeSearch  = params.safeSearch              || this.safeSearch;
    
    //requires a query and callback
    if(query != null && callback != null)
      return this.request("http://gdata.youtube.com/feeds/api/videos?v=2&q="+escape(query)+"&alt=json-in-script&format=5&orderby="+orderby+"&safeSearch="+safeSearch+"&max-results="+perpage+"&start-index="+start+"&callback="+callback);
    else
      return false;
  }
  
  YouTube.prototype.processData = function(data){
    var videos = [];
    //build the video array.
    if(data.entry != undefined){
      //single video
      videos.push( this.parseVideoData( data.entry ) );
    }else if( data.feed != undefined ){
      //video feed
      var total = data.feed.entry.length;
      for (var i=0; i < total; i++) {
        videos.push( this.parseVideoData( data.feed.entry[i] ) );
      }
    }
    if(videos.length > 0)
      this.data = videos;
    
    return videos;
  }
  
  YouTube.prototype.getVideoId = function(url){
    //strip the video id out of the uri-style id field that we get from the api
    var results = url.match("[\\?&]v=([^&#]*)");
    var id = ( results === null ) ? url : results[1];
    return id;
  }
  
  YouTube.prototype.parseVideoData = function (data) {
    //process video data from api into a common data structure for our use
    //this centralizes a single point for filtering the data we get from 
    //google in the event that the objects from them change structure in the future.
    
    var video = {};
    if(data){
      video.id            = this.getVideoId(data.media$group.media$player.url);
      video.author        = data.author[0].name.$t;
      video.title         = data.media$group.media$title.$t;
      video.description   = data.media$group.media$description.$t;
      video.keywords      = data.media$group.media$keywords.$t;
      video.statistics    = data.yt$statistics;
      video.url           = data.media$group.media$player.url;
      video.published     = data.published.$t;
      video.updated       = data.updated.$t;
      video.duration      = this.parseVideoDuration(data.media$group.yt$duration.seconds);
      video.thumbnails    = this.sortThumbnails(data.media$group.media$thumbnail);
    }
    
    if( video.id === undefined ) video = false;
    return video;
  }
  
  YouTube.prototype.sortThumbnails = function(thumbnails){
    //sort thumbnails by url/filename.
    //default.jpg, hqdefault, then by filename(chronologically)
    
    //sort by url first...
    var sorted = thumbnails.sort(function(a, b){
                            var x = a.url.toLowerCase();
                            var y = b.url.toLowerCase();
                            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                          });
                          

    //... then set the default jpg to 0, and hq default to 1...
    defaults_then_numeric = [];
    for (var i=0; i < sorted.length; i++) {
      if(sorted[i].url.indexOf('/default.jpg')> 1){
        defaults_then_numeric[0] = sorted[i];
        delete sorted[i];
      }else if(sorted[i].url.indexOf('/hqdefault.jpg')> 1){
        defaults_then_numeric[1] = sorted[i];
        delete sorted[i];
      };
    };
    
    // ... then push everything else.
    for (var i=0; i < sorted.length; i++) {
      if(sorted[i] != undefined)
        defaults_then_numeric.push(sorted[i]);
    };
    
    return defaults_then_numeric;
  }
  
  YouTube.prototype.parseVideoDuration = function (seconds){
    min = Math.floor(seconds/60);
    sec = seconds % 60;
    return min+":"+sec;
  }
  
  YouTube.prototype.embedCode = function(params){
    //configuration of flash video object
    var flash_params = {
      id      : params.id,
      width   : params.width || this.embed.width,
      height  : params.width || this.embed.height,
      url     : 'http://www.youtube.com/v/'+params.id+'&rel=0&hl=en&fs=1&'  
    }
    
    var embedCode ='<object width="'+flash_params.width+'" height="'+flash_params.height+'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">'
      +'<param name="movie" value="'+flash_params.url+'"></param>'
      +'<param name="allowFullScreen" value="true"></param>'
      +'<param name="allowscriptaccess" value="always"></param>'
      +'<embed src="'+flash_params.url+'" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="'+flash_params.width+'" height="'+flash_params.height+'"></embed>'
      +'</object>';
    return embedCode;
  }
};