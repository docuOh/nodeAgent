const snmp = require ("net-snmp");
const fs = require("fs");
const request = require ("request");
const async = require ("async");
var exports = require ("exports");
//const fun = require ("./function.js");
const matchAll = require('match-all');
var bodyParser = require('body-parser');
function agentStart(){
	const jsonFile = fs.readFileSync('./config/equipmentList.json', 'utf8');
	if(jsonFile){
		const jsonData = JSON.parse(jsonFile);
		for(var i = 0; i < jsonData.length; i++){
			(function(i){
				oidSearch(jsonData[i], function(result){
					//console.log(result)
					const oidFile = fs.readFileSync('./config/equipmentList.json', 'utf8');
					const oidData = JSON.parse(oidFile);
					oidData[i].oidValue = result;
					fs.writeFileSync('./config/equipmentList.json', JSON.stringify(oidData));
				})
				scripingFn("count", jsonData[i], function(result){
					//console.log(result)
					var today = new Date();
					var year = today.getFullYear().toString().slice(-2);
					var month = ('0' + (today.getMonth() + 1)).slice(-2);
					var day = ('0' + today.getDate()).slice(-2);
					var hours = ('0' + today.getHours()).slice(-2); 
					var minutes = ('0' + today.getMinutes()).slice(-2);
					var seconds = ('0' + today.getSeconds()).slice(-2); 
					var dateString = year + '-' + month  + '-' + day + " "+ hours + ':' + minutes;
					result.update_time = dateString;
					const scripingCntFile = fs.readFileSync('./config/equipmentList.json', 'utf8');
					const scripingCntData = JSON.parse(scripingCntFile);
					scripingCntData[i].scirpingValue.count = result;
					fs.writeFileSync('./config/equipmentList.json', JSON.stringify(scripingCntData));
					
				});
				scripingFn("somo", jsonData[i], function(result){
					//console.log(result)
					var today = new Date();
					var year = today.getFullYear().toString().slice(-2);
					var month = ('0' + (today.getMonth() + 1)).slice(-2);
					var day = ('0' + today.getDate()).slice(-2);
					var hours = ('0' + today.getHours()).slice(-2); 
					var minutes = ('0' + today.getMinutes()).slice(-2);
					var seconds = ('0' + today.getSeconds()).slice(-2); 
					var dateString = year + '-' + month  + '-' + day + " "+ hours + ':' + minutes;
					result.update_time = dateString;
					const scripingCntFile = fs.readFileSync('./config/equipmentList.json', 'utf8');
					const scripingCntData = JSON.parse(scripingCntFile);
					scripingCntData[i].scirpingValue.somo = result;
					/*
					var keys = Object.keys(result)
					for(let i = 0; i < keys.length; i++){
						var key = keys[i];
						scripingCntData[i].scirpingValue.key = result[key];
					}
					console.log(scripingCntData[i])
					*/
					fs.writeFileSync('./config/equipmentList.json', JSON.stringify(scripingCntData));
				});
			}) (i);
		}
	}
	
}

async function oidSearch(oid, callback){
	var datas = {};
	var today = new Date();
	var year = today.getFullYear().toString().slice(-2);
	var month = ('0' + (today.getMonth() + 1)).slice(-2);
	var day = ('0' + today.getDate()).slice(-2);
	var hours = ('0' + today.getHours()).slice(-2); 
	var minutes = ('0' + today.getMinutes()).slice(-2);
	var seconds = ('0' + today.getSeconds()).slice(-2); 
	var dateString = year + '-' + month  + '-' + day + " "+ hours + ':' + minutes;
	var oidValue = oid.oid;
	var ipCheck = "N";
	var data = {};
	for(key in oidValue){
		await valueSearch(oid.ip, key, oidValue[key],function(result){
			if(result != "N"){
				var cutVal = result[0].split(":");
				var ckey = cutVal[0];
				var cval = cutVal[1];
				data[ckey] = cval;
				data['update_time'] = dateString
				datas = data;
				oidValue.oidValue = data
				callback(datas);
			}
		})
	}
		//console.log(datas)
	
	/*
	for(let i = 0; i < oid.length; i++){
		var today = new Date();
		var year = today.getFullYear();
		var month = ('0' + (today.getMonth() + 1)).slice(-2);
		var day = ('0' + today.getDate()).slice(-2);
		var hours = ('0' + today.getHours()).slice(-2); 
		var minutes = ('0' + today.getMinutes()).slice(-2);
		var seconds = ('0' + today.getSeconds()).slice(-2); 
		var dateString = year + '-' + month  + '-' + day + " "+ hours + ':' + minutes  + ':' + seconds;
		var oidValue = oid[i].oid;
		var ipCheck = "N";
		var data = {};
		for(key in oidValue){
			await valueSearch(oid[i].ip, key, oidValue[key],function(result){
				if(result != "N"){
					var cutVal = result[0].split(":");
					var ckey = cutVal[0];
					var cval = cutVal[1];
					data[ckey] = cval;
					data['update_time'] = dateString
					oid[i].value = data
				}
			})
		}
	}
	*/
	/*
	return new Promise(resolve=>{
		resolve(oid);
	});
	*/
	/*
	var aaa = JSON.stringify(oid);
	fs.writeFileSync('./config/equipmentList.json', aaa)
	const jsonFile = fs.readFileSync('./config/config.json', 'utf8');
	if(jsonFile){
		jsonData = JSON.parse(jsonFile);
		for(var i = 0; i < jsonData[0].ipset.length; i++){
			const options = {
								uri: "http://"+jsonData[0].ipset[i]+"/nodeAgent/nodeAgent_api.php",
								qs: {
										mode : "equipmentInfo",
										val : aaa
									}
							};
			var apiJson = request(options,function(err,response,body){
				//console.log(body);
			});
		}
	}
	*/
}
async function valueSearch(ip, key, oid, callback){
	const snmp = require ("net-snmp");
	const session = snmp.createSession (ip, "public");
	var datas = [];
	//return new Promise(resolve=>{
		session.get ([oid], function (error, varbinds) {
			if(error){
				datas.push("N")
			}else{
				for(var i = 0; i < varbinds.length; i++) {
					datas.push(key+":"+varbinds[i].value.toString())
				}
			}
			callback(datas);
		});
	//});
}
async function multValueSearch(ip, key, oid, callback){
	const snmp = require ("net-snmp");
	const session = snmp.createSession (ip, "public");
	var datas = {};
	return new Promise(resolve=>{
		session.get (oid, function (error, varbinds) {
			if(error){
				console.error (error);
			}else{
				for(var i = 0; i < varbinds.length; i++) {
					if(snmp.isVarbindError (varbinds[i])){
						datas[key[i]] = "N";
					}else{
						datas[key[i]] = varbinds[i].value.toString();
					}
				}
			}
			resolve(datas);
		});
	});
}

async function scrapeWeb(mode, jsonData, callback){
	scripingFn(mode, jsonData, function(result){
		callback(result)
	})
}
async function scripingFn(mode, jsonData, callback){
	var url = jsonData.ip;
	var fullurl = "http://"+jsonData.ip+"/";
	if(jsonData.desc.indexOf("FUJI XEROX") != -1){
		var scripingVal = [];
		var headers = {
						"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
						"Accept-Encoding": "gzip, deflate",
						"Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
						"Authorization": "Basic MTExMTE6eC1hZG1pbg==",
						"Connection": "keep-alive",
						"Set-Cookie": "sid=c0cb87559facf26530590d5c24c7305c23ad9d57",
						"Host": url,
						"Referer": fullurl,
						"Upgrade-Insecure-Requests": 1,
						"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36"
					  }
		if(mode == "count"){
			//카운터 스크랩핑
			
			return new Promise(resolve=>{
				const options = {
									uri: 'http://'+url+'/prcnt.htm',
									method:'GET',
									headers : headers
								}
				var apiJson = request(options, function(err,response,body){
					if(body){
						var regex = /var info=\[(.+)/;
						var matchVal = body.match(regex)
						var matchArr = [];
						matchArr = matchVal[0].split("=");
						matchArr = matchArr[1].split(",")
						var data = {}
						for(var k = 0; k < matchArr.length; k++){
							if(matchArr[k] == "'총프린트 페이지수'"){
								data.total_print = matchArr[(k+1)]
							}else if(matchArr[k] == "'총복사 페이지수'"){
								data.total_copy = matchArr[(k+1)]
							}else if(matchArr[k] == "'총컬러 프린트 페이지수'"){
								data.total_color_print = matchArr[(k+1)]
							}else if(matchArr[k] == "'총컬러 복사 페이지수'"){
								data.totol_color_copy = matchArr[(k+1)]
							}else if(matchArr[k] == "'총흑백 프린트 페이지수'"){
								data.total_gray_print = matchArr[(k+1)]
							}else if(matchArr[k] == "'총흑백 복사 페이지수'"){
								data.totol_gray_copy = matchArr[(k+1)]
							}
						}
						callback(data)
					}
				});
			});
		}else if(mode == "somo"){
			//소모품 스크랩핑
			const options2 = {
								uri: "http://"+url+"/stsply.htm",
								method:'GET',
								headers : headers
							}
			var apiJson = request(options2,function(err,response,body){
				if(body){
					var data = {};
					var regex = /info.concat\((.+)\)/;
					var matchVal = body.match(regex)
					var aaa = body.split("\r\n");
					for(var i = 0; i < aaa.length; i++){
						if(aaa[i].indexOf("info.concat") != -1){
							var regex2 = /\((.+)\)/;
							var regex3 = /\[(.+)\]/;
							var regex4 = /[\[\]\(\)]/gim;
							var bbb = aaa[i].match(regex2)
							if(bbb[1].indexOf("토너 카트리지") != -1){
								var eee = bbb[1].replace(regex4, "")
								eee = eee.split(",")
								for(let j = 0; j < eee.length; j++){
									if(eee[j].indexOf("Black") != -1){
										data.toner_balck = eee[(j+2)]
									}else if(eee[j].indexOf("Cyan") != -1){
										data.toner_cyan = eee[(j+2)]
									}else if(eee[j].indexOf("Magenta") != -1){
										data.toner_magenta = eee[(j+2)]
									}else if(eee[j].indexOf("Yellow") != -1){
										data.toner_yellow = eee[(j+2)]
									}
								}
							}else if(bbb[1].indexOf("토너 회수통") != -1){
								var ccc = bbb[1].replace(regex4, "")
								data.etc_hoisu = ccc.split(",")[2]
							}else if(bbb[1].indexOf("드럼 카트리지") != -1){
								//var ddd = bbb[1].replace("[['드럼 카트리지',", "")
								var ddd = bbb[1].replace(regex4, "")
								ddd = ddd.split(",")
								for(let j = 0; j < ddd.length; j++){
									if(ddd[j].indexOf("Black") != -1){
										data.drum_balck = ddd[(j+2)]
									}else if(ddd[j].indexOf("Cyan") != -1){
										data.drum_cyan = ddd[(j+2)]
									}else if(ddd[j].indexOf("Magenta") != -1){
										data.drum_magenta = ddd[(j+2)]
									}else if(ddd[j].indexOf("Yellow") != -1){
										data.drum_yellow = ddd[(j+2)]
									}
								}
							}
						}
					}
					callback(data)
				}
				//var zxc = matchAll(body, regex).toArray();
				/*
				preg_match_all($regex, $text, $matches);

				$matches[1][0] = str_replace("'",'"',$matches[1][0]);
				$matches[1][0] = json_decode($matches[1][0]);

				$matches[1][1] = str_replace("'",'"',$matches[1][1]);
				$matches[1][1] = json_decode($matches[1][1]);

				$matches[1][2] = str_replace("'",'"',$matches[1][2]);
				$matches[1][2] = json_decode($matches[1][2]);

				p($matches);
				var regex = /var info=\[(.+)/;
				var zxc = body.match(regex)
				var qaz = [];
				qaz = zxc[0].split("=");
				qaz = qaz[1].split(",")
				var data = {}
				
				for(var i = 0; i < qaz.length; i++){
					if(qaz[i] == "'총프린트 페이지수'"){
						data.total_print = qaz[(i+1)]
					}else if(qaz[i] == "'총복사 페이지수'"){
						data.total_copy = qaz[(i+1)]
					}else if(qaz[i] == "'총컬러 프린트 페이지수'"){
						data.total_color_print = qaz[(i+1)]
					}else if(qaz[i] == "'총컬러 복사 페이지수'"){
						data.totol_color_copy = qaz[(i+1)]
					}else if(qaz[i] == "'총흑백 프린트 페이지수'"){
						data.total_gray_print = qaz[(i+1)]
					}else if(qaz[i] == "'총흑백 복사 페이지수'"){
						data.totol_gray_copy = qaz[(i+1)]
					}
				}
				console.log(data)
				jsonData.count = data
				*/
			});
		}
	}else{
	}
}
module.exports = {
	agentStart		: agentStart,
	valueSearch		: valueSearch,
	multValueSearch : multValueSearch,
	scrapeWeb		: scrapeWeb,
};