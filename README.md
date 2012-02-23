YouTube.js
==========

A simple JS class for working with YouTube's json API.

Usage:
------

Create a YouTube object, passing in params.

Call a method, passing it a function name as a callback param. 

    var youtube = new YouTube();

    youtube.videoFeed({
      user : 'sxtxixtxcxh'
    }, function(videos){
      // do whatever with the results.
    });
    
I'll be honest, I haven't looked at this code in almost a year, and I've nearly forgotten how to use it.

Hopefully, I'll get more time and clean this up a bit more. The code looks to be fairly well commented, but I don't have time to go through it; I just wanted to get this on github.