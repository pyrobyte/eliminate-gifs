var AWS = require('aws-sdk'); 
var fs = require('fs');
var http = require('http');
var mysql = require('mysql');
var https = require('https');

var connection = mysql.createConnection({
	host     : '',
	user     : '',
	password : '',
	database : ''
});

connection.connect();

AWS.config.loadFromPath('./aws.json');

var s3 = new AWS.S3();
var s32 = new AWS.S3({region: "us-west-2"});
var elastictranscoder = new AWS.ElasticTranscoder({region: "us-west-2"});

var guid = (function() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
				   .toString(16)
				   .substring(1);
	}
	return function() {
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			   s4() + '-' + s4() + s4() + s4();
	};
})();
	
var hash = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


process.on('uncaughtException', function(err) {
	console.log(err.stack);
});

var transcode = function(url, callback) {

	var id = hash();
	
	connection.query('SELECT hash FROM gifs WHERE hash=' + connection.escape(id), function(err, rows, fields) {
		if (err) throw err;

		if(typeof rows != "undefined" && rows.length > 0) {
			console.log("Collision detected: " + id);
		}
	
		var uuid = guid();

		url = url.replace(/^(https:\/\/|http:\/\/)/, '');
		
		var parts = url.split('/', 2);
		var host = parts[0];
		var path = parts[1];
		
		console.log(host + ", " + path);
		
		var req = http.request({ 
			host: host,
			port: 80,
			path: path,
			method: 'HEAD' }, 
			function(res) {
				var size = res.headers['content-length'];
				
				console.log("Size of gif: " + size);
				if(size > 1500000) {
				
		
					console.log("That's big enough");
					var file = fs.createWriteStream("tmp/" + uuid + ".gif");
					var request = http.get(url, function(response) {
				
						var r = response.pipe(file);

						r.on('finish', function() {
			
				
				
							var gif  = {url: url, hash: id};
							var query = connection.query('INSERT INTO gifs SET ?', gif, function(err, result) {
	
								fs.readFile("tmp/" + uuid + ".gif", function (err, data) {
									var params = {Bucket: 'io.nebulur', Key: "tmp/" + uuid + ".gif", Body: data};

									s3.putObject(params, function(err, data) {

									  if (err)  {     

										  console.log(err)     

									 } else {
	  
										elastictranscoder.createJob({ 
											PipelineId: "1406943041938-l0fe04",
											OutputKeyPrefix: 'c/',
											Input: { 
												Key: "tmp/" + uuid + ".gif", 
												FrameRate: 'auto', 
												Resolution: 'auto', 
												AspectRatio: 'auto', 
												Interlaced: 'auto', 
												Container: 'auto' 
											}, 
											Output: { 
												Key: id + ".mp4", 
												ThumbnailPattern: '', 
												PresetId: "1351620000001-100070",
												Rotate: 'auto' 
											} 
										},  function(error, data) { 
											if(error) {
												console.log(error);
											} else {
								
												elastictranscoder.createJob({ 
															PipelineId: "1406943041938-l0fe04",
															OutputKeyPrefix: 'c/',
															Input: { 
																Key: "tmp/" + uuid + ".gif", 
																FrameRate: 'auto', 
																Resolution: 'auto', 
																AspectRatio: 'auto', 
																Interlaced: 'auto', 
																Container: 'auto' 
															}, 
															Output: { 
																Key: id + ".webm", 
																ThumbnailPattern: '', 
																PresetId: "1407009422782-bzfluv",s
																Rotate: 'auto' 
															}
														},  function(error, data) { 
															if(error) {
																console.log(error);
															} else {
																callback({id: id});
															}
														});
											}
										});
									  }   

									});
									});
							});
						});
					});
				
				}
				
			}).end();
	});
}

var getObjectSize = function(params, callback) {
	s3.getObject(params).on('success', function(response) {
	  console.log(response.request.params);
	})
	.on('error', function(data) {
		console.log(data);
	}).send();
}

module.exports.transcode = transcode;

