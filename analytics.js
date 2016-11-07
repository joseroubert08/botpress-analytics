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
      .then(() => stats.getDailyGender(this.dbFile))
      .then(data => this.savePartialData('genderUsage', data))
      .then(() => stats.getInteractionRanges(this.dbFile))
      .then(data => this.savePartialData('interactionsRange', data))
    }, 1000)
    // }, 30 * 1000 * 60) // every 30min

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
    stats.getInteractionRanges(this.dbFile)
  }

  getChartsGraphData() {
    const chartsData = loadDataFromFile(this.chartsDatafile)

    return {
      totalUsersChartData: chartsData.totalUsers,
      activeUsersChartData: chartsData.activeUsers,
      genderUsageChartData: chartsData.genderUsage,
      typicalConversationLengthInADay: chartsData.interactionsRange,
      specificMetricsForLastDays: this.fictiveSpecificMetrics
    }
  }
}

module.exports = Analytics;
