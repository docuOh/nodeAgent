const request = require ("request");
var exports = require ("exports");
const fs = require("fs");
const snmp = require ("net-snmp");

function modelSearch(ip, oid){
	var data = new Object();
	var modelArr = new Array();
	var session = snmp.createSession (ip, "public");
	modelArr.ip = ip;
	return new Promise(resolve=>{
		session.get (oid, function (error, varbinds) {
			if(error){
				console.error (error);
			}else{
				for(var i = 0; i < varbinds.length; i++) {
					if(snmp.isVarbindError (varbinds[i])){
						console.error (snmp.varbindError (varbinds[i]));
					}else{
						if(varbinds[i].oid == "1.3.6.1.2.1.1.5.0"){
							modelArr.modelName = varbinds[i].value.toString();
						}
						if(varbinds[i].oid == "1.3.6.1.2.1.43.5.1.1.17.1"){
							var serial_num =
							modelArr.serialNum = varbinds[i].value.toString();
						}
					}
				}
				resolve(modelArr);
			}
			session.close ();
		});

		session.trap (snmp.TrapType.LinkDown, function (error) {
			if (error) {
				console.error (error);
			}
		});
	});
}

function oidSearch(model_name, serial_num, ip){
	return new Promise(resolve=>{
		var eArr = new Array();
		var oid = {};
		var max = {};
		var data = new Object();
		if(model_name){
			data.modelName = model_name;
			data.serialNum = serial_num;
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
						/*
						if(sJson[j]['cmd'] == "08.05.00.13"){
							oid.printer_name = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.14"){
							oid.serial_num = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.17"){
							oid.mac_address = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.19"){
							oid.printer_desc = sJson[j]['oid'].substr(1);
						}
						//프린터
						if(sJson[j]['cmd'] == "08.05.00.31"){
							oid.total_print = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.33"){
							oid.total_gray_print = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.A3"){
							oid.print_gray_a4 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.A4"){
							oid.print_gray_a3 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.32"){
							oid.total_color_print = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.A1"){
							oid.print_color_a4 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.A2"){
							oid.print_color_a3 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.A6"){
							oid.print_color_two = sJson[j]['oid'].substr(1);
						}
						//복사
						if(sJson[j]['cmd'] == "08.05.00.34"){
							oid.total_copy = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.36"){
							oid.total_gray_copy = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.B3"){
							oid.copy_gray_a4 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.B4"){
							oid.copy_gray_a3 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.35"){
							oid.totol_color_copy = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.B1"){
							oid.copy_color_a4 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.B2"){
							oid.copy_color_a3 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.B5"){
							oid.copy_color_one = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.B6"){
							oid.copy_color_two = sJson[j]['oid'].substr(1);
						}
						//스캔
						if(sJson[j]['cmd'] == "08.05.00.37"){
							oid.total_scan = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.39"){
							oid.total_gray_scan = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.C3"){
							oid.scan_gray_a4 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.C4"){
							oid.scan_gray_a3 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.38"){
							oid.total_color_scan = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.C1"){
							oid.scan_color_a4 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.C2"){
							oid.scan_color_a3 = sJson[j]['oid'].substr(1);
						}
						//팩스
						if(sJson[j]['cmd'] == "08.05.00.3A"){
							oid.total_fax = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.3B"){
							oid.total_fax_send = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.3C"){
							oid.total_fax_rcv = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.3D"){
							oid.total_fax_rcv_print = sJson[j]['oid'].substr(1);
						}

						//토너
						if(sJson[j]['cmd'] == "08.05.00.41"){
							oid.toner_balck = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.49"){
							oid.toner_balck2 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.43"){
							oid.toner_cyan = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.44"){
							oid.toner_magenta = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.42"){
							oid.toner_yellow = sJson[j]['oid'].substr(1);
						}
						//드럼
						if(sJson[j]['cmd'] == "08.05.00.51"){
							oid.drum_balck = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.53"){
							oid.drum_cyan = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.54"){
							oid.drum_magenta = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.52"){
							oid.drum_yellow = sJson[j]['oid'].substr(1);
						}
						//기타
						if(sJson[j]['cmd'] == "08.05.00.61"){
							oid.etc_hoisu = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.62"){
							oid.etc_install = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.63"){
							oid.etc_beltcleaner = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.64"){
							oid.etc_2bias = sJson[j]['oid'].substr(1);
						}
						*/
					}
				}
				
				data.oid = oid;
				data.somoMax = max;
				data = JSON.stringify(data);
				eArr.push(data);
				resolve(eArr);
			});
			/*
			var data = new Object();
			data.modelName = model_name;
			data.serialNum = serial_num;
			data.ip = ip;
			const options = {
								uri: "http://domslicense.officehub.kr:7300/device/device_infos_provide_curl2.php",
								qs:{
									model_name : model_name,
									serial_num : serial_num
									}
								};
			var apiJson = request(options,function(err,response,body){
				var sJson = JSON.parse(body);
				for(var j = 0; j < sJson.length; j++){
					if(sJson[j]['oid'] != null){
						if(sJson[j]['cmd'] == "08.05.00.13"){
							data.printer_name = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.14"){
							data.serial_num = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.17"){
							data.mac_address = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.19"){
							data.printer_desc = sJson[j]['oid'].substr(1);
						}
						//프린터
						if(sJson[j]['cmd'] == "08.05.00.31"){
							data.total_print = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.33"){
							data.total_gray_print = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.A3"){
							data.print_gray_a4 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.A4"){
							data.print_gray_a3 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.32"){
							data.total_color_print = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.A1"){
							data.print_color_a4 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.A2"){
							data.print_color_a3 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.A6"){
							data.print_color_two = sJson[j]['oid'].substr(1);
						}
						//복사
						if(sJson[j]['cmd'] == "08.05.00.34"){
							data.total_copy = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.36"){
							data.total_gray_copy = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.B3"){
							data.copy_gray_a4 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.B4"){
							data.copy_gray_a3 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.35"){
							data.totol_color_copy = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.B1"){
							data.copy_color_a4 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.B2"){
							data.copy_color_a3 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.B5"){
							data.copy_color_one = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.B6"){
							data.copy_color_two = sJson[j]['oid'].substr(1);
						}
						//스캔
						if(sJson[j]['cmd'] == "08.05.00.37"){
							data.total_scan = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.39"){
							data.total_gray_scan = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.C3"){
							data.scan_gray_a4 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.C4"){
							data.scan_gray_a3 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.38"){
							data.total_color_scan = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.C1"){
							data.scan_color_a4 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.C2"){
							data.scan_color_a3 = sJson[j]['oid'].substr(1);
						}
						//팩스
						if(sJson[j]['cmd'] == "08.05.00.3A"){
							data.total_fax = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.3B"){
							data.total_fax_send = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.3C"){
							data.total_fax_rcv = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.3D"){
							data.total_fax_rcv_print = sJson[j]['oid'].substr(1);
						}

						//토너
						if(sJson[j]['cmd'] == "08.05.00.41"){
							data.toner_balck = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.49"){
							data.toner_balck2 = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.43"){
							data.toner_cyan = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.44"){
							data.toner_magenta = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.42"){
							data.toner_yellow = sJson[j]['oid'].substr(1);
						}
						//드럼
						if(sJson[j]['cmd'] == "08.05.00.51"){
							data.drum_balck = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.53"){
							data.drum_cyan = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.54"){
							data.drum_magenta = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.52"){
							data.drum_yellow = sJson[j]['oid'].substr(1);
						}
						//기타
						if(sJson[j]['cmd'] == "08.05.00.61"){
							data.etc_hoisu = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.62"){
							data.etc_install = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.63"){
							data.etc_beltcleaner = sJson[j]['oid'].substr(1);
						}
						if(sJson[j]['cmd'] == "08.05.00.64"){
							data.etc_2bias = sJson[j]['oid'].substr(1);
						}
					}
				}
				eArr.push(data);
				resolve(eArr);
			});
			*/
		}
		/*
		console.log(eArr);
		const dataJson = JSON.stringify(eArr);
		console.log(dataJson);
		//fs.writeFileSync("./config/equipmentList.json", dataJson);
		*/
	});
}

function jsonValue(ip, oids){
	return new Promise(resolve=>{
		modelSearch(ip, oids)
		.then(function(result){
			oidSearch(result.modelName, result.serialNum, result.ip)
				.then(function(result){
				resolve(result);
			})
		})
	})
}
module.exports = {
	modelSearch: modelSearch,
	oidSearch: oidSearch,
	jsonValue : jsonValue,
};