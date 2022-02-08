const agent = require ("./agent.js");
const webStart = require ("./function.js");
const cron = require('node-cron');
const oidSearch = require ("./search.js");
const fs = require("fs");

webStart.webStart();
agent.agentStart()

var task = cron.schedule('* * * * *', function () {
	agent.agentStart()
}, {
	scheduled: false
});

task.start();