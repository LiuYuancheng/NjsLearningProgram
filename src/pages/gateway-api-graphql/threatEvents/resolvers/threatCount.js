'use strict'

/**
 * threat counts module
 * @module graphql/threatEvents/threatCounts
 */

const logger = require('@shared-lib/logger');
const dbconn = require('@lib/arango.js');
const druid = require('@lib/druid.js')
const db = new dbconn();
const moment = require('moment');

module.exports = {
  Query: {
    threatEvents_topNThreatNameCountTimeSeries: ( root, { topN, dateFrom, timeseries, sectors }, { user } ) => {
      logger.debug("threatEvents_topNThreatNameCountTimeSeries", topN, dateFrom, sectors);

      // let bindVars = { topN, sectors }

      // if (user.isEnterpriseUser) {
      //   bindVars.enterpriseId = user.enterpriseId;
      // }

      // if (dateFrom) {
      //   bindVars.from = moment().subtract(dateFrom.numUnits, dateFrom.unit).valueOf()
      // }
      
      let intervals = dateFrom?
        [ `${moment().subtract(dateFrom.numUnits, dateFrom.unit).toISOString()}/${moment().toISOString()}` ]:
        [ "0000/3000" ]

      // let bindVars = { offset:rowsPerPage*page, count: rowsPerPage }
      // filter out synonly connections
      let filter = {
        "type": "and",
        "fields": [
          {
            "type": "not",
            "field": {
              "type": "selector",
              "dimension": "app",
              "value": "synonly"
            }
          }
        ]
      }

      if (user.isEnterpriseUser) {
        filter.fields.push({
          "type": "or",
          "fields": [
            {
              "type": "selector",
              "dimension": "srcEnterpriseId",
              "value": user.enterpriseId,    
            },
            {
              "type": "selector",
              "dimension": "dstEnterpriseId",
              "value": user.enterpriseId,      
            }
          ]
        })
      }

      if (sectors) {
        filter.fields.push({
          "type": "or",
          "fields": [
            {
              "type": "in",
              "dimension": "srcSector",
              "value": sectors,
            },
            {
              "type": "in",
              "dimension": "dstSector",
              "value": sectors,      
            }
          ]
        })
      }

      // console.log(query)
      let p1 = new Promise((resolve, reject) => {
        let query = {
          "queryType": "topN",
          "dataSource": druid.ds_suspected_threats,
          "granularity": "hour",
          intervals,
          "threshold": topN,
          filter,
          "dimension": "threatName",
          "metric": "threatCount",
          "aggregations": [
            { "type": "longSum", "name": "threatCount", "fieldName": "count" }
          ],
          context: druid.context,
        }

        // console.log("query", JSON.stringify(query, null, "  "))
        druid.query.post('/', query).then(res => {
          // console.log(`statusCode: ${res.statusCode}`)
          // console.log("p1", JSON.stringify(res.data, null, "  "))
          // get list of threats
          let myset = {}
          for (let ele of res.data) {
            for (let res of ele.result) {
              myset[res.threatName] = []
            }
            if (myset.length >= topN)
              break;
          }
          // console.log("myset", myset)
          let results = Object.keys(myset).map(name => {
            let data = res.data.map(ele => {
              let res = ele.result.find(row => row.threatName === name)
              let timestamp = moment(ele.timestamp).valueOf()
              if (res) {
                return [ timestamp, res.threatCount ]
              } else {
                return [ timestamp, 0 ]
              }
            })
            return {
              name,
              data,
            }
          })
          resolve(results)
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
      })

      // get total count
      let p2 = new Promise((resolve, reject) => {
        let query = {
          "queryType": "groupBy",
          "dataSource": druid.ds_suspected_threats,
          "granularity": "all",
          intervals,
          filter,
          "dimensions": [
            "threatName"
          ],
          "aggregations": [
            { "type": "longSum", "name": "threatCount", "fieldName": "count" }
          ],
          context: druid.context,
        }

        druid.query.post('/', query).then(res => {
          // console.log(`statusCode: ${res.statusCode}`)
          // console.log("p2", JSON.stringify(res.data, "  "))
          let totalCount = res.data.reduce( (acc, curr ) => {
            acc += curr.event.threatCount
            return acc;
          }, 0)
          let data = res.data.reduce((acc, curr) => {
            acc[curr.event.threatName] = curr.event.threatCount / totalCount * 100;
            return acc;
          }, {})
          resolve(data)
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })    
      })

      return Promise.all([p1,p2]).then(values => {
        // console.log("values", values)
        // console.log("result0", values[0]);
        // console.log("result1", values[1]);
        let data = values[0].map( ele => {
          ele.y = values[1][ele.name]
          return ele;
        })
        return data;
      }).catch(err => {
        console.log("query error", err)
      })

    }, // threatEvents_topNThreatNameCountTimeSeries


  } // Query
}
