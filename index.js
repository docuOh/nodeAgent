const agent = require ("./agent.js");
const webStart = require ("./function.js");
const cron = require('node-cron');
const oidSearch = require ("./search.js");
const fs = require("fs");

/*
oidSearch.oidSearch('ApeosPort-VI C3371', '','')
.then(function(result){
	var aaa = JSON.parse(result[0])
})
*/
//const jsonFile = fs.readFileSync('./config/equipmentList2.json', 'utf8');
//const jsonData = JSON.parse(jsonFile);
//console.log(jsonData);

webStart.webStart();
agent.agentStart()

var task = cron.schedule('* * * * *', function () {
	agent.agentStart()
}, {
	scheduled: false
});

task.start();
/*
function valueSet(oidArr){
	var oidValue = "";
	var session = snmp.createSession ("192.168.0.199", "public");
	session.get (oidArr, function (error, varbinds) {
		if (error) {
			oidValue = "N";
		} else {
			for (var i = 0; i < varbinds.length; i++) {
				if (snmp.isVarbindError (varbinds[i])) {
					console.error (snmp.varbindError (varbinds[i]));
				} else {
					console.log (varbinds[i].oid + " = " + varbinds[i].value);
					oidValue =  varbinds[i].value;
				}
			}
		}
		return oidValue;
		session.close ();
	});
}
var eArr = new Array();
var sJson = "";
function oidSet(oids){
	var session = snmp.createSession ("192.168.0.199", "public");
	
	session.get (oids, function (error, varbinds) {
		if(error){
			console.error (error);
		}else{
			for(var i = 0; i < varbinds.length; i++) {
				if(snmp.isVarbindError (varbinds[i])){
					console.error (snmp.varbindError (varbinds[i]));
				}else{
					if(varbinds[i].oid == "1.3.6.1.2.1.1.5.0"){
						var model_name = varbinds[i].value;
					}
					if(varbinds[i].oid == "1.3.6.1.2.1.43.5.1.1.17.1"){
						var serial_num = varbinds[i].value;
					}
				}
			}
			search.oidSearch(model_name.toString(), serial_num.toString(), "192.168.0.199")
				.then(function(result){
				console.log(result);
			})
		}
		
		session.close ();
	});

	session.trap (snmp.TrapType.LinkDown, function (error) {
		if (error) {
			console.error (error);
		}
	});
}
*/