YouTube.js
==========

A simple JS class for working with YouTube's json API.

Usage:
------

Create a YouTube object, passing in params.

Call a method, passing it an options hash and a function. 

    var youtube = new YouTubeJS();

    youtube.videoFeed({
      user : 'sxtxixtxcxh'
    }, function(videos){
      // do whatever with the results.
      // for example: 
      youtube.forEach(videos, function(video){ console.log( youtube.embedCode(video.id) ) })
    });
    
Public methods:
---------------

- `videoInfo( videoId (string), callback (function) )`
- `videoFeed( params (object), callback (function) )`
  valid params:
  - `user` (string, required) - a youtube username 
  - `orderby` (string) - can be `published` (default), `rating`, or `viewCount`
  - `perpage` (int) - videos to return per page (default: 10)
  - `start` (int) - page number to start on (default: 10)  
- `videoSearch( params (object), callback (function) )`
  valid params:
  - `query` (string, required) - a search term 
  - `orderby` (string) - can be `relevance` (default), `published`, `rating`, or `viewCount`
  - `perpage` (int) - videos to return per page (default: 10)
  - `start` (int) - page number to start on (default: 10)
  - `safesearch` (string) - can be `none`, `moderate`, or `strict`

Helper methods:
---------------
- `forEach( object, function, context)`
- `embedCode( video (string or video object), flashParams (object) )`
  valid flash params:
  - `width` - int (default: 425)
  - `height` - int (default: 344)

I'll be honest, I haven't looked at this code in almost a year, and I've nearly forgotten how to use it.

Hopefully, I'll get more time and clean this up a bit more. The code looks to be fairly well commented, but I don't have time to go through it; I just wanted to get this on github.