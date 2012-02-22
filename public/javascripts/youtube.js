//////////////////////////
//
// Youtube API Class
//
//////////////////////////

function YouTube(params){
  params          = params || {};
  this.apiVersion = params.apiVersion       || 2;
  this.user       = params.user             || null;
  this.orderby    = params.orderby          || 'published'; // 'rating', 'viewCount', 'published', 'relevance
  this.perpage    = params.perpage          || 10;
  this.page       = params.page             || 1;
  this.safeSearch = params.safeSearch       || 'moderate'; // 'none', 'moderate', 'strict'
  this.embed      = { width : params.width  || 425,
                     height : params.height || 344 };

  this.videoInfo = function(id, callback){
    var id          = id       || null;
    var callback    = callback || function(){};
    //requires a video id and callback
    if(id != null && callback != null)
      return this._request("http://gdata.youtube.com/feeds/api/videos/"+id+"?v="+this.apiVersion+"&alt=json-in-script", callback);
    else
      return false;
  };
  
  this.forEach = function(obj, iterator, context){
    for (var i = obj.length - 1; i >= 0; i--){
      iterator.call(context, obj[i], i, obj);
    };
  };
  
  this.videoFeed = function(params, callback){
    var params      = params || {};
    var callback    = callback || function(){};
    var user        = params.user                    || this.user;
    var orderby     = params.orderby                 || this.orderby;
    var perpage     = params.perpage                 || this.perpage;
    var start       = (params.page*perpage)/perpage  || this.page;
    
    //requires a user's username and callback
    if(user != null && callback != null){
      return this._request("http://gdata.youtube.com/feeds/api/videos?v="+this.apiVersion+"&author="+user+"&alt=json-in-script&format=5&orderby="+orderby+"&max-results="+perpage+"&start-index="+start, callback);
    }else{
      return false;
    }
  };
  
  this.videoSearch = function(params, callback){
    var params      = params    || {};
    var callback    = callback  || function(){};

    var query       = params.query                   || null;
    var orderby     = params.orderby                 || this.orderby;
    var perpage     = params.perpage                 || this.perpage;
    var start       = (params.page*perpage)/perpage  || this.page;
    var safeSearch  = params.safeSearch              || this.safeSearch;
    
    //requires a query and callback
    if(query != null && callback != null)
      return this._request("http://gdata.youtube.com/feeds/api/videos?v="+this.apiVersion+"&q="+escape(query)+"&alt=json-in-script&format=5&orderby="+orderby+"&safeSearch="+safeSearch+"&max-results="+perpage+"&start-index="+start, callback);
    else
      return false;
  };
  
  this._processData = function(data){
    var videos = [];
    //build the video array.
    if(data.entry != undefined){
      //single video
      videos.push( this._parseVideoData( data.entry ) );
    }else if( data.feed != undefined ){
      //video feed
      var total = data.feed.entry.length;
      for (var i=0; i < total; i++) {
        videos.push( this._parseVideoData( data.feed.entry[i] ) );
      }
    }
    
    return videos;
  };
  
  this._request = function(url, callback){
    var params = params || {};
    var jsc = new Date().getTime();
    // Build temporary JSONP function
    var jsonp = "jsonp"+ jsc++;
    
    var url = url+ '&callback='+jsonp;

    // Handle JSONP-style loading
    var obj_callback_context = this;
    window[ jsonp ] = window[ jsonp ] || function( data ) {
      
      var videos = obj_callback_context._processData(data);
      callback(videos);
      
      // Garbage collect
      window[ jsonp ] = undefined;

      try {
        delete window[ jsonp ];
      } catch(e) { }

      if ( head ) {
        head.removeChild( script );
      }

    };

    // If we're requesting a remote document
    // and trying to load JSON or Script with a GET
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    var script = document.createElement("script");
    script.src = url;

    // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
    head.insertBefore( script, head.firstChild );

    // We handle everything using the script element injection
    return undefined;

  };

  this._getVideoId = function(url){
    //strip the video id out of the uri-style id field that we get from the api
    var results = url.match("[\\?&]v=([^&#]*)");
    var id = ( results === null ) ? url : results[1];
    return id;
  };
  
  this._parseVideoData = function (data) {
    //process video data from api into a common data structure for our use
    //this centralizes a single point for filtering the data we get from 
    //google in the event that the objects from them change structure in the future.
    
    var video = {};
    if(data){
      video.id            = this._getVideoId(data.media$group.media$player.url);
      video.author        = data.author[0].name.$t;
      video.title         = data.media$group.media$title.$t;
      video.description   = data.media$group.media$description.$t;
      video.keywords      = data.media$group.media$keywords.$t;
      video.statistics    = data.yt$statistics;
      video.url           = data.media$group.media$player.url;
      video.published     = data.published.$t;
      video.updated       = data.updated.$t;
      video.duration      = this._parseVideoDuration(data.media$group.yt$duration.seconds);
      video.thumbnails    = this._sortThumbnails(data.media$group.media$thumbnail);
    }
    
    if( video.id === undefined ) video = false;
    return video;
  };
  
  this._sortThumbnails = function(thumbnails){
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
  };
  
  this._parseVideoDuration = function (seconds){
    min = Math.floor(seconds/60);
    sec = seconds % 60;
    return min+":"+sec;
  };
  
  this.embedCode = function(videoObjOrID, flashParams){
    var video = ('string' === typeof videoObjOrID) ? {id: videoObjOrID} : videoObjOrID;
    //configuration of flash video object
    var flashParams = flashParams || {};
    var flashParams = {
      id      : video.id,
      width   : flashParams.width || this.embed.width,
      height  : flashParams.width || this.embed.height,
      url     : 'http://www.youtube.com/v/'+video.id+'&rel=0&hl=en&fs=1&'
    };
    
    var embedCode ='<object width="'+flashParams.width+'" height="'+flashParams.height+'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">'
      +'<param name="movie" value="'+flashParams.url+'"></param>'
      +'<param name="allowFullScreen" value="true"></param>'
      +'<param name="allowscriptaccess" value="always"></param>'
      +'<embed src="'+flashParams.url+'" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="'+flashParams.width+'" height="'+flashParams.height+'"></embed>'
      +'</object>';
    return embedCode;
  };
};