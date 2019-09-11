let express = require( 'express' );
let twitter = require( 'twitter' );
require('dotenv').config();
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 7000;


app.get('/' , function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection',function(socket){
	socket.on('message',function(msg){
		console.log(msg);
	});
})

http.listen(PORT, function(){
  console.log('server listening. Port:' + PORT);
});


let client = new twitter( {
	consumer_key: process.env.consumer_key,
	consumer_secret: process.env.consumer_secret,
	access_token_key: process.env.access_token_key,
	access_token_secret: process.env.access_token_secret
} );


let keywords = "動画コンテナ,#鍵有り,#鍵なし,#鍵無し";
console.log(keywords);
client.stream( 'statuses/filter', {
	track: keywords
}, function ( stream ) {
	stream.on( 'data', function ( tweet ) {
		var screen_name = tweet.user.screen_name;
		var tweet_text = tweet.text;
		var tweet_url = "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;
		var pass = getPass(tweet_text);
		var item = createItemElem(screen_name,tweet_text,tweet_url,pass);
		io.emit('message',item);
	} );

	stream.on( 'error', function ( error ) {
		console.log(error);
	} );
} );
function getPass(tweet_text){
	console.log(tweet_text);
	var array = tweet_text.split(/( +|　+|\n+)/);
	console.log(array);
	var passwords = [];
	array.forEach(function(e){
		if(e.length == 8){
			let regresult = e.match(/([a-z]|[A-Z]|\d){8}/);
			if(regresult != null && regresult[0].length == 8){
				passwords.push(regresult[0]);
			}
        }
		if(e.match(/【+([a-z]|[A-Z]|\d){8}】+/)){
			let p = e.match(/【+([a-z]|[A-Z]|\d){8}】+/)[0].replace(/(【+|】+)/g,"");
			passwords.push(p);
		}
	})
	return passwords;
}
function createItemElem(screen_name,tweet_text,tweet_url,pass){
	var elem = '<li class="item">'+
    '<a href="'+tweet_url+'" target="_blank">'+
      '<div class="item_screen_name">@'+screen_name+'</div>'+
    '</a>'+
    '<div class="child">'+
      '<div class="item_tweet">'+tweet_text+'</div>';
	  pass.forEach(function(e){
			elem += '<div class="item_pass" onclick="window.open(\'https://movie-container.com?action_DownloadPassword=true&password='+e+'\')">'+e+'</div>';
	  })
    elem += '</div>'+
	'</li>';
	return elem;
}
