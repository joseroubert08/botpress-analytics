const Analytics = require('./analytics')

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
    
  },

  ready: function(skin) {
    analytics = new Analytics(skin);

    skin.getRouter("skin-analytics")
    .get("/graphs", (req, res, next) => {
      res.send(analytics.getChartsGraphData())
    })

  }
}
