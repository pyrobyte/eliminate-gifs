var request = require('request');

var headers = {};

var login = function (username, password, callback) {
    var options = {
        url: 'http://nu.cm/user/signin?email=' + username + '&password=' + password + '&rem=True',
        headers: headers,
        method: 'POST'
    };

    request(options, function (err, res, body) {
        if (err) {
            console.log('Couldn\'t log in to nu.cm');
            console.log(err.json.errors);
            return;
        } else {
            console.log("Logged in to nu.cm");
            console.log(res.headers);
            if (typeof res.headers['set-cookie'] != 'undefined') {
                headers['Cookie'] = res.headers['set-cookie'][0];
            }
            callback();
        }
    });
}

login("email@email.com", "password", function () {

    console.log("Login success to nu.cm");

});

var shorten = function (url, callback) {
    var options = {
        url: 'http://nu.cm/?url=' + url,
        headers: headers,
        method: 'POST'      };

    request(options, function (err, res, body) {
        if (err) {
            console.log('Could not shorten');
            console.log(err.stack);
            return;
        } else {
            callback(JSON.parse(body));
        }
    });
}

module.exports.shorten = shorten;