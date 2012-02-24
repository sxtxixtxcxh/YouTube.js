var youtube = new YouTubeJS();

$(function(){
  
  var userForm = document.getElementById('usernameForm');
  var searchForm = document.getElementById('searchForm');
  
  $('input[type="text"]').focus(function(){
    var input = this;
    setTimeout(function(){input.select();}, 100);
  });

  function replaceVideos(videos){
    var embeds = '';
    youtube.forEach(videos, function(video){
      embeds = '<div class="row"><div class="span6 offset1"><div class="well">'+
                  '<div class="videoThumb" id="'+video.id+'" style="background: url('+video.thumbnails[1].url+')">'+
                    '<div class="blurred"><h2 class="video-meta"><span>'+video.title+'</span></h2>'+
                    '<p class="video-meta"><span>'+video.author+'</span></p></div>'+
                  '</div>'+
                '</div></div></div>'+embeds;
    });

    document.getElementById('videoContainer').innerHTML = embeds;
    
    $('#videoContainer .videoThumb').click(function(){
      var videoId = $(this)[0].id;
      var $container = $(this).parent();
      $container.empty();
      $container.append(youtube.embedCode(videoId));
    });
  };
  

  $(userForm).submit(function(){
    var username = document.getElementById('youtube_username').value;
    if(username){
      youtube.videoFeed({
        user: username
      }, replaceVideos);
      document.getElementById('youtube_username').blur();
    }
    return false;
  });


  $(searchForm).submit(function(){
    var query = document.getElementById('youtube_query').value;
    var searchSort = document.getElementById('searchSort').value;
    if(query){
      youtube.videoSearch({
        query: query,
        orderby: searchSort
      }, replaceVideos);
      document.getElementById('youtube_query').blur();
    }
    return false;
  });
  
  $('#searchSort').change(function(){
    $(searchForm).submit();
  });
});