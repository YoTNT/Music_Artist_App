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
//let image_stream = fs.createReadStream('./artists/5c3cf2ee3494e2da71dcf26303202ec491b26213.jpg','utf8');

let genres = '';
let image_url = '';
let name = '';


function recieved_authentication(authentication_res, res, user_input, request_sent_time){
	authentication_res.setEncoding("utf8");
	let body = "";
	authentication_res.on("data", data => {body += data;});
	authentication_res.on("end", () => {
		let authentication_res_data = JSON.parse(body);
		console.log(authentication_res_data);
	
		token = authentication_res_data.access_token;
	
//		create_cache(authentication_res_data);
		create_search_req(authentication_res_data, res, user_input, request_sent_time);
	});
}

function create_search_req(authentication_res_data, res, user_input, request_sent_time){
	let detail_object = {'access_token': authentication_res_data.access_token,
						 'q': user_input.artist,
						 'type': 'artist'
						 }
	let detail_string = querystring.stringify(detail_object);
	let search_url = endpoints + '?' + detail_string;
	
	console.log(search_url);

	let search_req = https.request(search_url, search_res => {
		search_res.setEncoding("utf8");	
		let body = "";
		search_res.on("data", data => {body += data});
		search_res.on("end", () => {
			let search_res_data = JSON.parse(body);
			console.log(search_res_data);
			genres = search_res_data.artists.items[0].genres;
			image_url = search_res_data.artists.items[0].images[0].url;
			name = search_res_data.artists.items[0].name;
			console.log(genres);
			console.log(image_url);
			console.log(name);

			download_image(image_url);
		});
	});
    search_req.end();
}

function download_image(image_url){
	let image_req = https.get(image_url, image_res => {
		let n = image_url.lastIndexOf('/');
		let file_name = image_url.substring(n + 1);
		file_name += '.jpg';
		console.log(file_name);

		let img_path = './artists/' + file_name;
		let new_img = fs.createWriteStream(img_path, {'encoding':null});
		image_res.pipe(new_img);
		new_img.on('finish', function(){
			let webpade = `<h1>${name}</h1><p>${genres.join()}</p><img src="./artists/${file_name}" />`;	
		});
	});
	image_req.on('error', function(err){console.log(err);});

	image_req.end();
}

let server = http.createServer((req,res)=>{
	if(req.url === '/'){
		res.writeHead(200,{'Content-Type':'text/html'});
		html_stream.pipe(res);
	} else if(req.url.includes('favicon')){
		res.writeHead(404, {'Content-Type':'text/plain'});
		res.write('404 Not Found\n');
		res.end();
	} else if(req.url.includes('/artists/')){
		let file_name = req.url;
		file_name = '.' + file_name;
		console.log(file_name);	// Don't forget the dot
		
		let image_stream = fs.createReadStream(file_name, 'utf-8');

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
	} else{
		res.writeHead(404, {'Content-Type':'text/plain'});
		res.write('404 Not Found\n');
		res.end();
	}
});

server.listen(port,server_address);
