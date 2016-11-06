'use strict';

const db = require('./db')
const moment = require('moment')
const Promise = require('bluebird')

const oneDayMs = 1000 * 60 * 60 * 24

function rangeDates(dbFile) {
  return db.getOrCreate(dbFile)
  .then((knex) => {
    return knex('users').select(knex.raw('max(created_on) as max, min(created_on) as min'))
    .then().get(0).then((result) => {
      if(!result.min || !result.max) {
        return []
      }

      var range = result.max - result.min
      var ranges = []
      for(var i = 1; i <= 10; i++) {
        ranges.push(parseInt(result.min + (range/10*i)))
      }
      const ret = { min: result.min, max: result.max, format: null, ranges: ranges }
      if(range / oneDayMs < 1) {
        ret.format = (date) => moment(date).format('ha')
      } else if(range / oneDayMs < 360) {
        ret.format = (date) => moment(date).format('MMM Do')
      } else { // > 1year period
        ret.format = (date) => moment(date).format('MMM YY')
      }

      return ret
    })
  })
}

function getTotalUsers(dbFile) {
  // {name: 'Dec', facebook: 400, slack: 2400, kik: 2400, total: 5200}
  return rangeDates(dbFile)
  .then((dates) => {
    return db.getOrCreate(dbFile)
    .then((knex) => {
      return Promise.mapSeries(dates.ranges, (date) => {
        return knex('users').where('created_on', '<', date)
        .groupBy('platform').select(knex.raw('platform, count(*) as count'))
        .then((result) => {
          return result.reduce(function(acc, curr) {
            acc.total += curr.count
            acc[curr.platform] = curr.count
            return acc
          }, { total: 0, name: dates.format(date) })
        })
      })
    })
  })
}

function generate(dbFile) {
  getTotalUsers(dbFile)
  .then((result) => {
    console.log(result)
  })
}

module.exports = {
  getTotalUsers: getTotalUsers
}
