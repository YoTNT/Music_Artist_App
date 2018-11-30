const http = require('http');
const https = require('https');
const querystring = require('querystring');
const fs = require('fs');
const url = require('url');

const credentials_json = fs.readFileSync('./auth/credentials.json', 'utf-8');
const credentials = JSON.parse(credentials_json);
let post_data = {
	'client_id': credentials.client_id,
	'client_secret': credentials.client_secret,
	'grant_type': 'client_credentials'
}
post_data = querystring.stringify(post_data);
let options ={
	'method': 'POST',
	'headers':{
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': post_data.length
	}
}

const server_address = 'localhost';
const port = 3000;

let search_url = '';
let token = '';
const endpoints = 'https://api.spotify.com/v1/search';

let html_stream = fs.createReadStream('./html/search-form.html','utf8');
let image_stream = fs.createReadStream('./artists/5c3cf2ee3494e2da71dcf26303202ec491b26213.jpg','utf8');

function recieved_authentication(authentication_res, res, user_input, request_sent_time){
	authentication_res.setEncoding("utf8");
	let body = "";
	authentication_res.on("data", data => {body += data;});
	authentication_res.on("end", () => {
		let authentication_res_data = JSON.parse(body);
		console.log(authentication_res_data);
	
		token = authentication_res_data.access_token;
	
//		create_cache(authentication_res_data);
//		create_search_req(authentication_res_data, res, res, user_input, request_sent_time);

		let search_endpoints = endpoints;
		let search_artist_name = user_input.artist.replace(' ', '%20');
		let search_type = 'type=artist';
		let search_authentication = 'Authorization=Bearer%20' + authentication_res_data.access_token;
		search_url = search_endpoints + '?q=' +
						search_artist_name + '&' +
						search_type + '&' +
						search_authentication;
		console.log(search_url);
		
		let search_req = https.request(search_url, search_res => {
			search_res.on("data", data => {console.log(data)});
		});
	});
}
<<<<<<< HEAD
/*
function recieve_search(search_res){
=======

/*
function recieved_search_object(search_res, res, user_input, search_sent_time){
>>>>>>> 01674ea03cd06d7cdb1d5ff200903a682de5075d
	search_res.setEncoding("utf8");
	let body2 = "";
	search_res.on("data", data => {body2 += data;});
	search_res.on("end", () => {
		let search_res_data = JSON.parse(body2);
		console.log(search_res_data);
<<<<<<< HEAD
	});
}
*/
=======
	
	});
}
*/


>>>>>>> 01674ea03cd06d7cdb1d5ff200903a682de5075d
let server = http.createServer((req,res)=>{
	if(req.url === '/'){
		res.writeHead(200,{'Content-Type':'text/html'});
		html_stream.pipe(res);
	} else if(req.url.includes('favicon')){
		res.writeHead(404, {'Content-Type':'text/plain'});
		res.write('404 Not Found\n');
		res.end();
	} else if(req.url.includes('artists')){
		res.writeHead(200,{'Content-Type':'image/jpeg'});
		image_stream.pipe(res);
		image_stream.on('error', function(err){
			console.log(err);
			res.writeHead(404);
			return res.end();
		});
	} else if(req.url.includes('search')){
		let user_input = url.parse(req.url, true).query;
		console.log(user_input);
		const authentication_req_url = 'https://accounts.spotify.com/api/token';
		let request_sent_time = new Date();
		let authentication_req = https.request(authentication_req_url, options, authentication_res => {
			recieved_authentication(authentication_res, res, user_input, request_sent_time);
		});
		authentication_req.on('error', (e) => {
			console.error(e);
		});
		authentication_req.write(post_data);
		console.log("Requesting Token");
		authentication_req.end();
<<<<<<< HEAD
=======

		let artist_name = user_input.artist;
		console.log(artist_name);

		const search_req_url = 'https://api.spotify.com/v1/search';
/*		let search_sent_time = new Date();
		let search_req = https.request(search_req_url, search_res => {
			recieved_search_object(search_req, res, user_input, search_sent_time);
		});
		search_req. on('error', (e) => {
			console.error(e);
		});
		console.log("Requesting Searching Object");
		search_req.end();
*/		

>>>>>>> 01674ea03cd06d7cdb1d5ff200903a682de5075d
		
	} else{
		res.writeHead(404, {'Content-Type':'text/plain'});
		res.write('404 Not Found\n');
		res.end();
	}
});

server.listen(port,server_address);
