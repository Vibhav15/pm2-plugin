# 🔍 PM2 Monitoring Plugin for New Relic

This Node.js plugin monitors processes managed by **PM2** and sends their key performance metrics — including memory, CPU usage, uptime, and restart count — to **New Relic Metrics API**. This allows you to visualize and alert on PM2 process performance in New Relic dashboards.

---

## 🚀 Features

- 📈 Tracks metrics for all PM2-managed processes:
  - ✅ CPU usage
  - ✅ Memory usage
  - ✅ Restart count
  - ✅ Uptime
- 🔁 Sends data to New Relic at a configurable interval
- 🛠 Configurable via a simple `config.json` file
- 💡 Lightweight and runs alongside your Node.js services

---

## 📦 Requirements

- Node.js v12+
- PM2 installed globally (`npm install -g pm2`)
- A valid [New Relic license key](https://docs.newrelic.com/docs/accounts/install-new-relic/account-setup/new-relic-api-keys/#ingest-license)

---

## 📁 Installation & Setup

### 1. Install PM2 (if not already installed):

```
npm install -g pm2
```

### 2. Clone this plugin or add the files to your Node.js app:

``` git clone https://github.com/Vibhav15/pm2-plugin.git ```
``` cd pm2-newrelic-monitor ```

### 3. Create a config.json file:

 •	create a config.json file refer config-template.json in repo:
    
``` 
{
  "nrlicense": "YOUR_NEW_RELIC_LICENSE_KEY",
  "nrurl": "https://metric-api.newrelic.com/metric/v1",
  "pollinterval": 10000
} 
```

•	nrlicense: New Relic license key
•	nrurl: New Relic Metric API endpoint
•	pollinterval: (Optional) Polling interval in milliseconds (default is 5000 ms)


### 4.  Run the Plugin

``` node pm2plugin.js ```


### Visualizing Metrics in New Relic

Once metrics are sent, you can build a custom dashboard in New Relic using the following NRQL query:

``` 
SELECT 
  latest(memory / (1024 * 1024)) AS 'Memory (MiB)',
  latest(cpu) AS 'Cpu (%)',
  latest(uptime / 60) AS 'Uptime (min)', 
  latest(restarts) AS 'Restart Count'
FROM Metric 
WHERE metricName = 'pm2ProcessList'
AND process.name = '<service name where pm2 is running>'
FACET host.name AS 'Pod Name', process.id AS 'Process ID'
SINCE 60 minutes ago 
LIMIT MAX UNTIL now
```

Steps to Create Dashboard:
	1.	Open New Relic → Dashboards
	2.	Create or open a dashboard
	3.	Click “Add chart” → Choose NRQL
	4.	Paste the above query
	5.	Replace <service name where pm2 is running> with your actual PM2 process name
	6.	Click Run Query, then Save chart


### How It Works
 •	Connects to PM2 using its programmatic API
 •	Collects metrics from each running PM2 process:
 •	cpu usage
 •	memory usage in bytes
 •	restarts count
 •	uptime in seconds
 •	Pushes the data to New Relic every pollInterval milliseconds
 •	Uses HTTPS POST requests with proper New Relic headers


🛑 Troubleshooting
	•	Make sure PM2 is running:
     ``` pm2 list ```
  •	Check if your firewall/network allows outbound HTTPS to metric-api.newrelic.com
	•	Confirm your New Relic license key is correct and has proper permissions

📬 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.


🙏 Acknowledgements

Inspired by the need to monitor background services in Kubernetes and send observability data to New Relic.
