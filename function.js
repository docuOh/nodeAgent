const agent = require ("./agent.js");
var exports = require ("exports");
var express = require('express');
var path = require('path');
var app = express();
//var router = express.Router();
var bodyParser = require('body-parser');
const request = require ("request");
const fs = require("fs");
const cookieParser = require('cookie-parser')
const expressSession = require('express-session');
//const open = require ('open');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

function webStart(){
	app.use(cookieParser());
	app.use(expressSession({
		secret: 'loginCheck',
		resave: true,
		saveUninitialized: true
	}));
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(express.static(path.join(__dirname, 'www')));
	app.set('views', __dirname + '/views');
	app.set('veiw engine', 'ejs');
	app.use(express.static(__dirname+'/img'));
	app.use(express.static(__dirname+'/css'));
	app.use('/script', express.static(path.join(__dirname, 'jss')));
	app.use('/js', express.static(path.join(__dirname,  'node_modules', 'bootstrap', 'dist', 'js')));
	app.use('/css', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css')));
	app.post('/userCheck', function(req, res){
		const options = {
							uri: "http://"+req.body.domain+"/ymapi.php",
							qs: {
									mode : "userCheck",
									userid : req.body.userid,
									password :req.body.password,
								}
						};
		var apiJson = request(options,function(err,response,body){
			if(body == "Y"){
				var loginId = req.body.userid || req.query.userid;
				var loginPw = req.body.password || req.query.password;
				if(req.session.user){
					res.end(body);
				}else{
					req.session.user = {
						id : loginId,
						name : 'Admin',
						authorized : true
					};
					res.end(body);
				}
			}else{
				res.end(body);
			}
		});
	});
	
	app.post('/equipmentList', function(req, res){
		const equipmentFile = fs.readFileSync('./config/equipmentList.json', 'utf8');
		const configFile = fs.readFileSync('./config/config.json', 'utf8');
		var returnData = {};
		returnData.equipmentData = "";
		returnData.configData = "";
		if(equipmentFile || configFile){
			if(equipmentFile){
				const equipmentData = JSON.parse(equipmentFile);
				returnData.equipmentData = equipmentData;
			}
			if(configFile){
				const configData = JSON.parse(configFile);
				returnData.configData = configData;
			}
		}
		res.render('equipmentList.ejs', returnData, function(err, html){
			if(err){
				console.log(err)
			}
			res.end(html)
		});
	});
	app.post('/service', function(req, res){
		res.render('ipSetting.ejs', function(err, html){
			if(err){
				console.log(err)
			}
			res.end(html)
		});
		//res.sendFile(__dirname+'/views/ipSetting.html');
	});
	app.get('/valuePop', function(req, res){
		var returnData = {};
		const equipmentFile = fs.readFileSync('./config/equipmentList.json', 'utf8');
		const equipmentData = JSON.parse(equipmentFile);
		returnData.equipmentData = equipmentData[req.query.idx];
		returnData.mode = req.query.mode;
		returnData.idx = req.query.idx;
		res.render('valuePop.ejs', returnData);
		//res.sendFile(__dirname+'/views/ipSetting.html');
	});
	app.get('/equipmentLink', function(req, res){
		console.log(req.query.idx)
		var returnData = {};
		const options = {
							uri: "http://222.112.245.100:8822/nodeAgent/nodeAgent_api.php",
							qs:{ mode : "linkList" , idx : req.query.idx}
						};
		var apiJson = request(options,function(err,response,body){
			returnData.equipmentList = JSON.parse(body);
			res.render('equipmentLink.ejs', returnData);
		})
		
		//res.sendFile(__dirname+'/views/ipSetting.html');
	});
	app.post('/modelSearch', function(req, res){
		//var oid = ['1.3.6.1.2.1.1.5.0', '1.3.6.1.2.1.43.5.1.1.17.1', '1.3.6.1.2.1.2.2.1.6.1', '1.3.6.1.2.1.1.1.0'];
		//var oid = ['1.3.6.1.2.1.1.5.0', '1.3.6.1.2.1.43.5.1.1.17.1', '1.3.6.1.2.1.2.2.1.6.1', '1.3.6.1.2.1.43.8.2.1.14.1.1'];
		var oid = ['1.3.6.1.2.1.1.5.0', '1.3.6.1.2.1.43.5.1.1.17.1', '1.3.6.1.2.1.2.2.1.6.1', '1.3.6.1.2.1.1.1.0'];
		var oidKey = ['modelName', 'seralNum', 'mac', 'desc'];
		agent.multValueSearch(req.body.searchIp, oidKey, oid)
		.then(function(result){
			res.json(result);
		})
	});
	app.post('/modelAdd', function(req, res){
		oidSearch(req.body.modelName, req.body.serialNum, req.body.ip, req.body.desc)
		.then(function(result){
			var returnVal = JSON.parse(result[0]);
			var overlapping = "Y";
			var jsonCount = 0;
			var jsonData = [];
			const jsonFile = fs.readFileSync('./config/equipmentList.json', 'utf8');
			if(jsonFile){
				jsonData = JSON.parse(jsonFile);
				for(var i = 0; i < jsonData.length; i++){
					if(req.body.serialNum == jsonData[i].serialNum){
						overlapping = "N";
						break;
					}
					jsonCount++;
				}
			}else{
				
			}
			if(overlapping == "Y"){
				jsonData[jsonCount] = returnVal;
				var aaa = JSON.stringify(jsonData);
				fs.writeFileSync('./config/equipmentList.json', aaa)
			}
			res.json(overlapping);
		})
	});
	app.post('/customerSearch', function(req, res){
		const options = {
							uri: "http://222.112.245.100:8822/nodeAgent/nodeAgent_api.php",
							qs:{
								mode : req.body.mode,
								customerSearchVal : req.body.customerSearchVal,
								}
						};
		var apiJson = request(options,function(err,response,body){
			var sJson = JSON.parse(body);
			res.json(sJson);
		})
	});
	app.post('/customerAdd', function(req, res){
		var jsonCount = 0;
		const jsonData = [];
		const customer = {};
		var data = new Object();
		const jsonFile = fs.readFileSync('./config/config.json', 'utf8');
		if(jsonFile){
			var data = JSON.parse(jsonFile)
			data[0].customer.seq = req.body.seq;
			data[0].customer.name = req.body.name;
			var aaa = JSON.stringify(data);
		}else{
			customer.seq = req.body.seq;
			customer.name = req.body.name;
			data.customer = customer
			jsonData[0] = data;
			var aaa = JSON.stringify(jsonData);
		}
		fs.writeFileSync('./config/config.json', aaa)
	});
	app.post('/configSet', multipartMiddleware, function(req, res){
		const jsonFile = fs.readFileSync('./config/config.json', 'utf8')
		const jsonData = [];
		
		if(jsonFile){
			var data = JSON.parse(jsonFile)
			data[0].sendTime = parseInt(req.body.sendTime)
			if(req.body.ipset){
				if(Array.isArray(req.body.ipset) == true){
					data[0].ipset = req.body.ipset;
				}else{
					data[0].ipset = [req.body.ipset];
				}
			}
			var aaa = JSON.stringify(data)
			fs.writeFileSync('./config/config.json', aaa)
			res.end("Y");
		}else{
			var data = new Object();
			data.sendTime = req.body.sendTime
			jsonData[0] = data;
			var aaa = JSON.stringify(jsonData)
			fs.writeFileSync('./config/config.json', aaa)
			res.end("Y");
		}
	});
	app.post('/equipmentModify', function(req, res){
		const jsonFile = fs.readFileSync('./config/equipmentList.json', 'utf8')
		var data = JSON.parse(jsonFile)
		if(req.body.mode == "modelName"){
			data[req.body.num].modelName = req.body.val
		}else if(req.body.mode == "serialNum"){
			data[req.body.num].serialNum = req.body.val
		}else if(req.body.mode == "ip"){
			data[req.body.num].ip = req.body.val
		}else if(req.body.mode == "sort"){
			data[req.body.num].sort = req.body.sort
		}
		console.log(data[req.body.num])
		var aaa = JSON.stringify(data)
		fs.writeFileSync('./config/equipmentList.json', aaa)
		res.end("Y");
	});
	app.post('/logout', function(req, res){
		if(req.session.user){
			console.log('로그아웃');
			
			req.session.destroy(function(err){
				if(err) throw err;
				res.end("logout");
			});
		}
		else{
			console.log('로그인 상태 아님');
			res.end("noLogin");
		}
	});
	app.get('/', (req,res)=>{
		if(req.session.user){
			res.sendFile(__dirname+'/views/equipmentList.ejs');
		}else{
			res.sendFile(__dirname+'/main.html');
		}
	});
	app.listen(3000,(err)=>{
		if(!err){
			console.log('DOMS Agent Start');
		}
	});
}
function oidSearch(model_name, serial_num, ip, desc){
	return new Promise(resolve=>{
		var eArr = new Array();
		var oid = {};
		var max = {};
		var data = new Object();
		if(model_name){
			data.modelName = model_name;
			data.serialNum = serial_num;
			data.desc = desc;
			data.ip = ip;
			const options = {
								uri: "http://domslicense.officehub.kr:7300/device/device_infos_provide_curlNode.php",
								qs:{
									model_name : model_name
									}
								};
			var apiJson = request(options,function(err,response,body){
				var sJson = JSON.parse(body);
				for(var j = 0; j < sJson.length; j++){
					if(sJson[j]['oid'] != null){
						oid[sJson[j]['cmd_name']] = sJson[j]['oid'].substr(1);
						if(sJson[j]['somoMax']){
							max[sJson[j]['cmd_name']+"Max"] = sJson[j]['somoMax'];
						}
					}
				}
				data.oid = oid;
				data.somoMax = max;
				data = JSON.stringify(data);
				eArr.push(data);
				resolve(eArr);
			});
		}
	});
}
module.exports = {
	webStart: webStart,
	//router : router,
};