var pm2 = require('/usr/local/lib/node_modules/pm2');
var os = require('os');
var https = require('https');
var url = require('url');

// Plugin version
var version = '2.0.0';


// Use eithe Env Variables or Config 

// Environment Variables 
// var newRelicLicenseKey = process.env.NEW_RELIC_LICENSE_KEY;
// var pollIntervalMs = process.env.POLL_INTERVAL || 5000;
// var newRelicMetricApiUrl = 'https://metric-api.newrelic.com/metric/v1';

// Plugin Variables via configs , create a config file seeing template in repo 
var config = require('./config.json');
var newRelicLicenseKey = config.nrlicense;
var newRelicMetricApiUrl = config.nrurl;
var pollIntervalMs = config.pollinterval || 5000; // in milliseconds


// Track PM2 restart counts
var restartTracker = {};

function monitorPm2Processes() {
  pm2.connect(function (err) {
    if (err) {
      console.error('Error connecting to PM2:', err);
      return;
    }

    pm2.list(function (err, processList) {
      if (err) {
        console.error('Error retrieving PM2 process list:', err);
        return;
      }

      // Prepare payload for New Relic
      var payload = [
        {
          metrics: [],
        },
      ];

      processList.forEach(function (processInfo) {
        var processMetrics = {
          name: 'pm2ProcessListProd',
          type: 'gauge',
          value: 0,
          timestamp: Date.now(),
          attributes: {
            'host.name': os.hostname(),
            'process.id': processInfo.pid,
            restarts: processInfo.pm2_env.restart_time,
            cpu: processInfo.monit.cpu,
            memory: processInfo.monit.memory,
            uptime: calculateProcessUptime(processInfo.pm2_env.pm_uptime),
            'process.name': processInfo.pm2_env.name,
          },
        };

        payload[0].metrics.push(processMetrics);
      });

      sendMetricsToNewRelic(payload);
      pm2.disconnect();
    });
  });

  setTimeout(monitorPm2Processes, pollIntervalMs);
}

function sendMetricsToNewRelic(metricsPayload) {
  var metricsPayloadString = JSON.stringify(metricsPayload);

  var parsedUrl = url.parse(newRelicMetricApiUrl);
  var requestOptions = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-License-Key': newRelicLicenseKey,
      'Content-Length': Buffer.byteLength(metricsPayloadString),
    },
  };

  var request = https.request(requestOptions, (response) => {
    let responseBody = '';

    response.on('data', (chunk) => {
      responseBody += chunk;
    });

    response.on('end', () => {
      if (responseBody) {
        //console.log('Response from New Relic:', responseBody);
      }
    });
  });

  request.on('error', (err) => {
    console.log('*** ERROR while pushing metric to NewRelic *** ', metricsPayloadString);
    console.error(err);
  });

  request.write(metricsPayloadString);
  request.end();
}

function calculateProcessUptime(startTime) {
  return Math.floor((new Date() - startTime) / 1000);
}

console.log('Starting PM2 Monitoring Plugin version: ' + version);
monitorPm2Processes();
