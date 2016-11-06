const Analytics = require('./analytics')
const fs = require('fs')
const path = require('path')

const db = require('./db')

const loadDataFromFile = (file) => {
  if(!fs.existsSync(file)){
    console.log("Analytics file (" + file + ") doesn\'t exist.")
  }
  return JSON.parse(fs.readFileSync(file, "utf-8"))
}

const saveDataToFile = (data, file) => {
  fs.writeFileSync(file, stringify(data))
}

module.exports = {
  incoming: function(event, next) {
    db.saveIncoming(event)
    next()
  },

  outgoing: function(event, next) {
    db.saveOutgoing(event)
    next()
  },

  init: function(skin) {
    const dbFile = path.join(skin.projectLocation, skin.botfile.dataDir, 'skin-analytics.sqlite')
    console.log(dbFile)
    var knex = db.getOrCreate(dbFile)
    console.log(knex)
  },

  ready: function(skin) {
    const rawDatafile = path.join(skin.projectLocation, skin.botfile.dataDir, 'skin-analytics.raw.json')
    const chartsDatafile = path.join(skin.projectLocation, skin.botfile.dataDir, 'skin-analytics.charts.json')

    rawData = loadDataFromFile(rawDatafile);
    chartsData = loadDataFromFile(chartsDatafile)

    analytics = new Analytics(skin);

    skin.getRouter("skin-analytics")
    .get("/graphs", (req, res, next) => {
      res.send(analytics.getChartsGraphData())
    })

  }
}
