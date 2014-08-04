var transcoder = require('./transcoder');
var http = require('http');
var request = require('request');
var shortener = require('./shorten');


var headers = {
	'User-Agent' : 'GIF to HTML5 video bot/1.0 by Pyrobyte'
}

var username = "";
var password = "";

var login = function(username, password, callback) {  
  var options = {
      url     : 'https://ssl.reddit.com/api/login?api_type=json&user=' + username + '&passwd=' + password + '&rem=True',
      headers : headers,
      method  : 'POST'
  };

  request(options, function (err, res, body) {
    if (err) {
      console.log('LOGIN ERROR:');
      console.log(err.json.errors);
      return;
    } else {
      console.log("Logged in");
      var parsedBody = JSON.parse(body);
      headers['X-Modhash'] = parsedBody.json.data.modhash;
      headers['Cookie'] = "reddit_session=" + parsedBody.json.data.cookie + ";";
      callback();
    }
  });
}

login(username, password, function() {

	console.log("Searching for gifs");
	var comments = {
		host	: 'www.reddit.com',
		path	: '/r/all-pics-funny-askreddit-wtf-gifs-adviceanimals/comments.json',
		headers : headers
	};

	setInterval(function() {
		http.get(comments, function(res) {
			var body = '';
			
			res.on('data', function(chunk) {
				body += chunk;
			});
			
			res.on('end', function() {
				if(typeof res.headers['set-cookie'] != 'undefined') {
					headers['Cookie'] += ' ' + res.headers['set-cookie'][0].split(';')[0];
				}


				var data = JSON.parse(body);
				data.data.children.forEach(function(val, index, array) {
		
					var msg =  val.data.body;
					var parent_id = val.data.name;
					var score = val.data.score;
					
						var gifs = msg.match(/(http|https):\/\/.*\.gif/g);
			
						if(gifs != null && gifs.length > 0) {
							console.log("Gif spotted: " + gifs[0]);
						
							transcoder.transcode(gifs[0], function(data) {
								console.log("Converted to mp4: " + data.id);
								var theId = data.id;
								shortener.shorten("http://gif.nu.cm/" + data.id, function(data) {
									post(parent_id, 
"I noticed your GIF was bigger than 1.5MB, so I converted it to an [HTML5 video!](http://nu.cm/" + data.url.hash + "). ^beta\n\n*You can link to this video.*\n\n***\n\n^by ^/u/Pyrobyte. ^Feedback? ^PM ^me ^or ^reply ^to ^this ^comment. ^| ^[FAQ](http://www.reddit.com/wiki/eliminate_gifs)"); 
								});
							});
						}
					
				});
				delete body;
			});
		});
	}, 5000);

});

var post = function(parentId, message) {
  var text     = message
    , options  = {
        url      : 'https://en.reddit.com/api/comment?api_type=json&text=' + encodeURIComponent(text) + '&thing_id=' + parentId,
        headers  : headers,
        method : 'POST'      };

  request(options, function (err, res, body) {
    if (err) {
      console.log('Error commenting:');
      console.log(err.stack);
      return;
    } else {
      console.log(body);
    }
  });
}
