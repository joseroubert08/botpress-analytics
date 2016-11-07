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
      .then(() => stats.getAverageInteractions(this.dbFile))
      .then(averageInteractions => {
        stats.getNumberOfUsers(this.dbFile)
        .then(nbUsers => {
          this.savePartialData('fictiveSpecificMetrics', {
            numberOfInteractionInAverage: averageInteractions,
            numberOfUsersToday: nbUsers.today,
            numberOfUsersYesterday: nbUsers.yesterday,
            numberOfUsersThisWeek: nbUsers.week
          })
        })
      })
      .then(() => stats.usersRetention(this.dbFile))
      .then(data => this.savePartialData('retentionHeatMap', data))
    }, 5000)
    // }, 30 * 1000 * 60) // every 30min

    this.fictiveBusyHour = {
      'Oct 31': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
      'Oct 30': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
      'Oct 29': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
      'Oct 28': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
      'Oct 27': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
      'Oct 26': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
      'Oct 25': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
      'Oct 24': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1, 0.4, 0.3, 0.1],
    }

    this.fictiveRetentionHeatMap = {
      'Oct 31': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1],
      'Oct 30': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1],
      'Oct 29': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1],
      'Oct 28': [1.0, 0.9, 0.8, 0.7, 0.4, 0.9, 0.1],
      'Oct 27': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1],
      'Oct 26': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1],
      'Oct 25': [1.0, 0.9, 0.8, 0.7, 0.4, 0.9, 1.0],
      'Oct 24': [1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.1]
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
    stats.usersRetention(this.dbFile)
  }

  getChartsGraphData() {
    const chartsData = loadDataFromFile(this.chartsDatafile)

    return {
      totalUsersChartData: chartsData.totalUsers,
      activeUsersChartData: chartsData.activeUsers,
      genderUsageChartData: chartsData.genderUsage,
      typicalConversationLengthInADay: chartsData.interactionsRange,
      specificMetricsForLastDays: chartsData.fictiveSpecificMetrics,
      retentionHeatMap: chartsData.fictiveRetentionHeatMap,
      busyHoursHeatMap: this.fictiveBusyHour
    }
  }
}

module.exports = Analytics;
