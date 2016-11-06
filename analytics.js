const fs = require('fs')
const path = require('path')
const EventEmitter = require('eventemitter2');

const stats = require('./stats')

const loadDataFromFile = (file) => {
  if(!fs.existsSync(file)){
    console.log("Analytics file (" + file + ") doesn\'t exist.")
  }
  return JSON.parse(fs.readFileSync(file, "utf-8"))
}

class Analytics extends EventEmitter {
  constructor(skin) {
    super()

    if (!skin){
      throw new Error('You need to specify skin');
    }

    this.chartsDatafile = path.join(skin.projectLocation, skin.botfile.dataDir, 'skin-analytics.charts.json')    
    this.dbFile = path.join(skin.projectLocation, skin.botfile.dataDir, 'skin-analytics.sqlite')

    setInterval(() => {
      stats.getTotalUsers(this.dbFile)
      .then(data => this.savePartialData('totalUsers', data))
      .then(() => stats.getDailyActiveUsers(this.dbFile))
      .then(data => this.savePartialData('activeUsers', data))
    }, 1000)
    // }, 30 * 1000 * 60) // every 30min

    this.fictiveGenderUsageData = [
      //Last 7 days + active users
      {name: 'Date', male: 400, female: 2400},
      {name: 'Date', male: 2400, female: 700},
      {name: 'Date', male: 400, female: 700},
      {name: 'Date', male: 2400, female: 2400},
      {name: 'Date', male: 700, female: 700},
      {name: 'Date', male: 2400, female: 2400},
      {name: 'Date', male: 400, female: 700},
      {name: 'Date', male: 400, female: 2400}
    ]

    this.fictiveConversationData = [
      {name: '[0-5]', percentage: 0.253},
      {name: '[6-10]', percentage: 0.102},
      {name: '[11-15]', percentage: 0.124},
      {name: '[16-20]', percentage: 0.075},
      {name: '[21-30]', percentage: 0.335},
      {name: '[31-50]', percentage: 0.072},
      {name: '[51-100]', percentage: 0.058}
    ]

    this.fictiveSpecificMetrics = {
      numberOfInteractionInAverage: 12.4,
      numberOfUsersYesterday: 5234,
      numberOfNewUsersInLast7days: 981
    }
  }

  getData() {
    return loadDataFromFile(this.chartsDatafile)
  }

  savePartialData(property, data) {
    const chartsData = loadDataFromFile(this.chartsDatafile)
    chartsData[property] = data
    fs.writeFileSync(this.chartsDatafile, JSON.stringify(chartsData))
  }

  beta() {
    stats.getDailyActiveUsers(this.dbFile)
  }

  getChartsGraphData() {
    const chartsData = loadDataFromFile(this.chartsDatafile)

    return {
      totalUsersChartData: chartsData.totalUsers,
      activeUsersChartData: chartsData.activeUsers,
      genderUsageChartData: this.fictiveGenderUsageData,
      typicalConversationLengthInADay: this.fictiveConversationData,
      specificMetricsForLastDays: this.fictiveSpecificMetrics
    }
  }
}

module.exports = Analytics;
