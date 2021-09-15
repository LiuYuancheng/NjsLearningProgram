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
const lookup = require('country-code-lookup')
const trend = require('trend');

// console.log("lookup", lookup)

module.exports = {
  Query: {
    /**
     * Resolver for threatEvents_topNThreatNameCountTimeSeries
     */
    threatEvents_topNThreatNameCountTimeSeries: ( root, { topN, dateFrom, timeseries, filter, having }, { user } ) => {
      logger.debug("threatEvents_topNThreatNameCountTimeSeries", topN, dateFrom, filter, having);

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
      let myfilter = {
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
        myfilter.fields.push({
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

      /*
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
      */

      if (filter) {
        // myfilter.fields = [...myfilter.fields, filter]
        myfilter.fields.push(filter)
      }

      // console.log(query)
      let p1 = new Promise((resolve, reject) => {
        let query = {
          "queryType": "topN",
          "dataSource": druid.ds_suspected_threats,
          "granularity": "hour",
          intervals,
          "threshold": topN,
          filter: myfilter,
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
          filter: myfilter,
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

    /**
     * Resolver for threatEvents_threatCountTimeSeries
     */
    threatEvents_threatCountTimeSeries: ( root, { dateStart, dateEnd, filter, having }, { user } ) => {
      logger.debug("threatEvents_threatCountTimeSeries", dateStart, dateEnd, filter, having);
      
      // let intervals = dateFrom?
      //   [ `${moment().subtract(dateFrom.numUnits, dateFrom.unit).toISOString()}/${moment().toISOString()}` ]:
      //   [ "0000/3000" ]
      dateStart = dateStart?moment(dateStart).toISOString():"0000";
      dateEnd = dateEnd?moment(dateEnd).toISOString():"3000";
      let intervals = [ `${dateStart}/${dateEnd}` ]

      // let bindVars = { offset:rowsPerPage*page, count: rowsPerPage }
      // filter out synonly connections
      let myfilter = {
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
        myfilter.fields.push({
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

      if (filter) {
        // myfilter.fields = [...myfilter.fields, filter]
        myfilter.fields.push(filter)
      }

      // console.log(query)
      return new Promise((resolve, reject) => {
        let query = {
          "queryType": "groupBy",
          "dataSource": druid.ds_suspected_threats,
          "granularity": "hour",
          intervals,
          filter: myfilter,
          "dimensions": [ "connectionType" ],
          "aggregations": [
            { "type": "longSum", "name": "threatCount", "fieldName": "count" }
          ],
          context: druid.context,
        }

        // console.log("query", JSON.stringify(query, null, "  "))
        druid.query.post('/', query).then(res => {
          // console.log(`statusCode: ${res.statusCode}`)
          // console.log("p1", JSON.stringify(res.data, null, "  "))
          let ip = [];
          let dns = [];
          let totalIP = 0;
          let totalDNS = 0;
          for (let row of res.data) {
            let timestamp = moment(row.timestamp).valueOf()
            if (row.event.connectionType === "IP") {
              ip.push([ timestamp, row.event.threatCount ]);
              totalIP += row.event.threatCount
            } else {
              dns.push([ timestamp, row.event.threatCount ])
              totalDNS += row.event.threatCount
            }
          }
          resolve([
            {
              "name": "IP",
              "y": totalIP,
              "data": ip  
            },
            {
              "name": "DNS",
              "y": totalDNS,
              "data": dns
            },
          ])
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
      })

    }, // threatEvents_threatCountTimeSeries

    /**
     * Resolver for threatEvents_threatCountBySectorTimeSeries
     */
    threatEvents_threatCountBySectorTimeSeries: ( root, { dateStart, dateEnd, filter, having, outgoing }, { user } ) => {
      logger.debug("threatEvents_threatCountBySectorTimeSeries", dateStart, dateEnd, filter, having, outgoing);
      
      // let intervals = dateFrom?
      //   [ `${moment().subtract(dateFrom.numUnits, dateFrom.unit).toISOString()}/${moment().toISOString()}` ]:
      //   [ "0000/3000" ]
      dateStart = dateStart?moment(dateStart).toISOString():"0000";
      dateEnd = dateEnd?moment(dateEnd).toISOString():"3000";
      let intervals = [ `${dateStart}/${dateEnd}` ]

      let sectorAttr = outgoing?"srcSector":"dstSector";

      // let bindVars = { offset:rowsPerPage*page, count: rowsPerPage }
      // filter out synonly connections
      let myfilter = {
        "type": "and",
        "fields": [
          {
            "type": "not",
            "field": {
              "type": "selector",
              "dimension": "app",
              "value": "synonly"
            }
          },
          {
            "type": "not",
            "field": {
              "type": "selector",
              "dimension": "sector",
              "value": ""
            }
          }
        ]
      }

      if (user.isEnterpriseUser) {
        myfilter.fields.push({
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

      if (filter) {
        // myfilter.fields = [...myfilter.fields, filter]
        myfilter.fields.push(filter)
      }

      // console.log(query)
      return new Promise((resolve, reject) => {
        let query = {
          "queryType": "groupBy",
          "dataSource": druid.ds_suspected_threats,
          "granularity": "hour",
          intervals,
          "virtualColumns": [
            {
              "type": "expression",
              "name": "sector",
              "expression": sectorAttr,
              "outputType": "STRING"
            }
          ],
          filter: myfilter,
          "dimensions": [ "sector" ],
          "aggregations": [
            { "type": "longSum", "name": "threatCount", "fieldName": "count" }
          ],
          context: druid.context,
        }

        // console.log("query", JSON.stringify(query, null, "  "))
        druid.query.post('/', query).then(res => {
          // console.log(`statusCode: ${res.statusCode}`)
          // console.log("p1", JSON.stringify(res.data, null, "  "))
          let result = {};
          for (let row of res.data) {
            let timestamp = moment(row.timestamp).valueOf()
            if (result[row.event.sector]) {
              result[row.event.sector].y += row.event.threatCount;
              result[row.event.sector].data.push([ timestamp, row.event.threatCount ])
            } else {
              result[row.event.sector] = {
                "name": row.event.sector,
                "y": row.event.threatCount,
                "data": [ [ timestamp, row.event.threatCount] ]
              }
            }
          }
          let data = Object.values(result).map(e => {
            let chart = e.data.map(item => item[1]);
            // console.log("chart", chart);
            e.growth = trend(chart)
            return e;
          })
          resolve(data)
        })
        .catch(err => {
          logger.error(err)
          reject(err)
        })
      })

    }, // threatEvents_threatCountBySectorTimeSeries

    /**
     * Resolver for threatEvents_threatCountByCountry
     */
    threatEvents_threatCountByCountry: ( root, { dateStart, dateEnd, filter, having, outgoing }, { user } ) => {
      logger.debug("threatEvents_threatCountByCountry", dateStart, dateEnd, filter, having, outgoing);
      
      // let intervals = dateFrom?
      //   [ `${moment().subtract(dateFrom.numUnits, dateFrom.unit).toISOString()}/${moment().toISOString()}` ]:
      //   [ "0000/3000" ]
      dateStart = dateStart?moment(dateStart).toISOString():"0000";
      dateEnd = dateEnd?moment(dateEnd).toISOString():"3000";
      let intervals = [ `${dateStart}/${dateEnd}` ]

      // let countryAttr = outgoing?"srcCountry":"dstCountry";
      let countryAttr = outgoing?"dstCountry":"srcCountry";

      // let bindVars = { offset:rowsPerPage*page, count: rowsPerPage }
      // filter out synonly connections
      let myfilter = {
        "type": "and",
        "fields": [
          {
            "type": "not",
            "field": {
              "type": "selector",
              "dimension": "app",
              "value": "synonly"
            }
          },
          {
            "type": "not",
            "field": {
              "type": "selector",
              "dimension": "country",
              "value": ""
            }
          }
        ]
      }

      if (user.isEnterpriseUser) {
        myfilter.fields.push({
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

      if (filter) {
        // myfilter.fields = [...myfilter.fields, filter]
        myfilter.fields.push(filter)
      }

      // console.log(query)
      return new Promise((resolve, reject) => {
        let query = {
          "queryType": "groupBy",
          "dataSource": druid.ds_suspected_threats,
          "granularity": "all",
          intervals,
          "virtualColumns": [
            {
              "type": "expression",
              "name": "country",
              "expression": countryAttr,
              "outputType": "STRING"
            }
          ],
          filter: myfilter,
          "dimensions": [ "country" ],
          "aggregations": [
            { "type": "longSum", "name": "threatCount", "fieldName": "count" }
          ],
          context: druid.context,
        }

        // console.log("query", JSON.stringify(query, null, "  "))
        druid.query.post('/', query).then(res => {
          // console.log(`statusCode: ${res.statusCode}`)
          // console.log("p1", JSON.stringify(res.data, null, "  "))
          let results = res.data.map(e => {
            let c = lookup.byIso(e.event.country)
            return {
              country: c.country,
              iso2: c.iso2,
              iso3: c.iso3,
              threatCount: e.event.threatCount
            }
          });
          resolve(results)
        })
        .catch(err => {
          logger.error(err)
          reject(err)
        })
      })

    }, // threatEvents_threatCountByCountry

  } // Query
}
