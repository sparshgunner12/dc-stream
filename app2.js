var fs = require('fs');
var regexp=require('node-regexp');
var re = regexp().end('.mp4').toRegExp(),re1=regexp().end('.flv').toRegExp(),re5=regexp().end('.dctmp').toRegExp(),re2=regexp().end('.mkv').toRegExp(),re3=regexp().end('.ogg').toRegExp();
var express=require('express');
var bodyParser     =         require("body-parser");
var app=express();
var map={};
var map2={};
var http = require('http'),fs = require('fs'),util = require('util');
var util  = require('util'),
    spawn = require('child_process').spawn,
    ls    = spawn('./../../airdc/airdcnano');
    var co=0;
    var has_conn=0;
    var search_req=0;
    var map={};
    var cur_mov_str;
ls.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
  if(search_req!=3)search_req+=1;
  co=co+1;
   if(co==3 && !has_conn)
  {
    ls.stdin.setEncoding = 'utf-8';
    ls.stdin.write('connect adc://10.9.0.8:2780\n');
    ls.stdin.write('connect adc://10.10.12.55:2780\n');
    // std::string adr("adc://10.9.0.8:2780");
    // std::string adr("adc://10.10.12.55:2780");
      has_conn=1;
  }
});

ls.stderr.on('data', function (data) {
  co=co+1;
  console.log('stderr: ' + data+ co);
  if(co==3 && !has_conn)
  {
    ls.stdin.setEncoding = 'utf-8';
    ls.stdin.write('connect adc://10.9.0.8:2780\n');
     ls.stdin.write('connect adc://10.10.12.55:2780\n');
    // std::string adr("adc://10.9.0.8:2780");
    // std::string adr("adc://10.10.12.55:2780");
      has_conn=1;
  }
});

ls.on('exit', function (code) {
  console.log('child process exited with code ' + code);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', function (req, res) {
	if(has_conn)
	{
		var str='<html><body><h1>Enter Search query!</h1><input type="TEXT" id="search" size="40"><button type="button" id="submit">Submit</button> </body>\n';
		var js='<script>$(document).ready(function(){$("#submit").click(function(){var sea=$("#search").val();$.post("http://localhost:3001/search",{search: sea}, function(data){console.log(data);if(data=="done"){window.location="http://localhost:3001/listing"}});});})</script>\n';
		var incl='<script src="http://localhost:3001/readjquery"></script></html>\n';
		res.send(str+incl+js);
	}
	else
	{
		res.send('<html><p>Connecting to the hub</p><meta http-equiv="refresh" content="1; URL=http://localhost:3001"></html>');
	}
});
app.post('/search',function(req,res){
	console.log('received request'+req.body.search);
	ls.stdin.write('search '+req.body.search+'\n');
	search_req=0;
	res.send('done');
});
app.post('/download',function(req,res){
	console.log('received request'+req.body.no);
	ls.stdin.write('download '+req.body.no+'\n');
	cur_mov_str=map[req.body.no];
	res.send('done');
});
app.get('/download',function(req,res){
	res.send('<html><meta http-equiv="refresh" content="5; URL=http://localhost:3001/stream"></html>');
});
app.get('/stream',function(req,res){	
  var path1 = '/home/arsenal/Downloads/'+cur_mov_str;
  var path2=path1+'.dctmp';
  fs.exists(path2, function(exists) {
      if(exists)
      {
        var stat = fs.statSync(path2);
        var total = stat.size;
        if (req.headers['range']) {
          var range = req.headers.range;
          var parts = range.replace(/bytes=/, "").split("-");
          var partialstart = parts[0];
          var partialend = parts[1];
       
          var start = parseInt(partialstart, 10);
          var end = partialend ? parseInt(partialend, 10) : total-1;
          var chunksize = (end-start)+1;
          console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
       
          var file = fs.createReadStream(path2, {start: start, end: end});
          res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
          file.pipe(res);
        } else {
          console.log('ALL: ' + total);
          res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
          fs.createReadStream(path2).pipe(res);
        }
    }
    else
    {
         fs.exists(path1, function(exist) {
            if (exist) {
               var stat = fs.statSync(path1);
                var total = stat.size;
                if (req.headers['range']) {
                  var range = req.headers.range;
                  var parts = range.replace(/bytes=/, "").split("-");
                  var partialstart = parts[0];
                  var partialend = parts[1];
               
                  var start = parseInt(partialstart, 10);
                  var end = partialend ? parseInt(partialend, 10) : total-1;
                  var chunksize = (end-start)+1;
                  console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
               
                  var file = fs.createReadStream(path1, {start: start, end: end});
                  res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
                  file.pipe(res);
                } else {
                  console.log('ALL: ' + total);
                  res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
                  fs.createReadStream(path1).pipe(res);
                }

            }
            else
            {
                res.send('<html><p>Downloading!!!Please Wait!!!</p><meta http-equiv="refresh" content="1; URL=http://localhost:3001/stream"></html>');
            }
          });
    }
  });
});
app.get('/listing',function(req,res){
	var html='',js='<script src="http://localhost:3001/readjquery"></script>';
	//fs.createReadStream('searchresult').pipe(split()).on('data', function (line) {
     		 //each chunk now is a seperate line! 
    	//	html+='<p>'+line+'</p>';
    	//}
		fs.readFile('searchresult', 'utf8', function (err,data) {
  		if (err) {
    			 console.log(err);
  		}
  		 data=data.split('\n');
  		 html='<html><table>';
  		 html+='<tr><td>Name</td><td>Size</td></tr>'
  		 for(var i=1;i<data.length;i+=2)
  		 {
                 console.log(data[i+1]);
  		 	if(re.test(data[i+1])|re1.test(data[i+1])|re2.test(data[i+1])|re3.test(data[i+1]))
  		 	{
				html+='<tr>';
				html+='<td><button id='+((i/2)|0)+'>'+data[i+1]+'</button></td>';
				html+='<td>'+data[i]+'</td>';
				html+='</tr>';
				js+='<script>$(document).ready(function(){$("#'+((i/2)|0)+'").click(function(){$.post("http://localhost:3001/download",{no:'+((i/2)|0)+'}, function(data){console.log(data);if(data=="done"){window.location="http://localhost:3001/download"}});});})</script>\n';
  		 	}
  		 	map[((i/2)|0)]=data[i+1];
  		 }
  		 //console.log(data);
  		res.send(html+js+'</table><meta http-equiv="refresh" content="5; URL=http://localhost:3001/listing"></html>');
		});
});
app.get('/readjquery',function(req,res){
	fs.readFile('jquery.min.js', 'utf8', function (err,data) {
  		if (err) {
    			 console.log(err);
  		}
  		res.send(data);
	});
});
app.get('/allstreams', function (req, res) {
var files=[];
var str='<html><body><p> FIles </p><table> ';
var js='<script src="http://localhost:3001/readjquery">  </script>';
var id=0;
fs.readdir('/home/arsenal/Downloads',function(err,files){
    if(err) throw err;
    files.forEach(function(file){
      if(re.test(file)|re1.test(file)|re2.test(file)|re3.test(file))
      {
        str+='<tr><td><button type="TEXT" id="'+id+'" size="40">'+file+'<br></td></td>';
      js+='<script>$(document).ready(function(){$("#'+id+'").click(function(){window.location="http://localhost:3001/movie'+id+'";});})</script>';
    map2[id]='/home/arsenal/Downloads/'+file;
    id+=1;
  }
  // do something with each file HERE!
    });
str+='</table>'+js+' </body></html>';
console.log(str);
    res.send(str);  
 });
  });
app.get('/partials', function (req, res) {
var files=[];
var str='<html><body><p> FIles </p><table> ';
var js='<script src="http://localhost:3001/readjquery">  </script>';
var id=0;
fs.readdir('/home/arsenal/Downloads',function(err,files){
    if(err) throw err;
    files.forEach(function(file){
      if(re5.test(file))
      {
        str+='<tr><td><button type="TEXT" id="'+id+'" size="40">'+file+'<br></td></td>';
      js+='<script>$(document).ready(function(){$("#'+id+'").click(function(){window.location="http://localhost:3001/partial'+id+'";});})</script>';
    map2[id]='/home/arsenal/Downloads/'+file;
    id+=1;
  }
  // do something with each file HERE!
    });
str+='</table>'+js+' </body></html>';
console.log(str);
    res.send(str);  
 });
  });
app.get('/movie*', function (req, res) {
  var id='';
  for(var i=6;i<req.url.length;i++)id+=req.url[i];
    console.log(id);
  var path = map2[id];
  var stat = fs.statSync(path);
  var total = stat.size;
  if (req.headers['range']) {
    var range = req.headers.range;
    var parts = range.replace(/bytes=/, "").split("-");
    var partialstart = parts[0];
    var partialend = parts[1];
 
    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : total-1;
    var chunksize = (end-start)+1;
    console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
 
    var file = fs.createReadStream(path, {start: start, end: end});
    res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
    file.pipe(res);
  } else {
    console.log('ALL: ' + total);
    res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
    fs.createReadStream(path).pipe(res);
  }
});
app.get('/partial*', function (req, res) {
  var id='';
  for(var i=6;i<req.url.length;i++)id+=req.url[i];
    console.log(id);
  var path = map2[id];
  var stat = fs.statSync(path);
  var total = stat.size;
  if (req.headers['range']) {
    var range = req.headers.range;
    var parts = range.replace(/bytes=/, "").split("-");
    var partialstart = parts[0];
    var partialend = parts[1];
 
    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : total-1;
    var chunksize = (end-start)+1;
    console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
 
    var file = fs.createReadStream(path, {start: start, end: end});
    res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
    file.pipe(res);
  } else {
    console.log('ALL: ' + total);
    res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
    fs.createReadStream(path).pipe(res);
  }
});
app.listen(3001);