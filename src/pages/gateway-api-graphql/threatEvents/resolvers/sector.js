'use strict'

/**
 * sector module
 * @module graphql/threatEvents/sector
 */

const logger = require('@shared-lib/logger');
const druid = require('@lib/druid.js')
var dbconn = require('@lib/arango.js');
var db = new dbconn();

const moment = require("moment");
const lookup = require('country-code-lookup')
const _ = require("lodash")

module.exports = {
  Query: {
    /**
     * threatEvents_sectorDetails
     */
    threatEvents_sectorDetails: ( root, { dateStart, dateEnd, sector, filter, having, outgoing }, { user } ) => {
      logger.debug("threatEvents_sectorDetails", dateStart, dateEnd, sector)

      // let intervals = dateFrom?
      //   [ `${moment().subtract(dateFrom.numUnits, dateFrom.unit).toISOString()}/${moment().toISOString()}` ]:
      //   [ "0000/3000" ]
      dateStart = dateStart?moment(dateStart).toISOString():"0000";
      dateEnd = dateEnd?moment(dateEnd).toISOString():"3000";
      let intervals = [ `${dateStart}/${dateEnd}` ]

      let sectorAttr = outgoing?"srcSector":"dstSector";
      let nodeAttr = outgoing?"dstNodeId":"srcNodeId";
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
            "type": "selector",
            "dimension": "sector",
            "value": sector
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

      // retrieve counts by country
      let p1 = new Promise((resolve, reject) => {
        let query = {
          "queryType": "groupBy",
          "dataSource": druid.ds_suspected_threats,
          "granularity": "all",
          intervals,
          "virtualColumns": [
            {
              "type": "expression",
              "name": "sector",
              "expression": sectorAttr,
              "outputType": "STRING"
            },
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
          results.sort((e1, e2) => e2.threatCount - e1.threatCount)
          resolve(results)
        })
        .catch(err => {
          logger.error(err)
          reject(err)
        })
      }) // p1

      // retrieve counts by domain
      let p2 = new Promise((resolve, reject) => {
        let myfilter2 = _.cloneDeep(myfilter)
        myfilter2.fields.push({
          "type": "selector",
          "dimension": "connectionType",
          "value": "HTTP",    
        })
        let query = {
          "queryType": "groupBy",
          "dataSource": druid.ds_suspected_threats,
          "granularity": "all",
          intervals,
          "virtualColumns": [
            {
              "type": "expression",
              "name": "sector",
              "expression": sectorAttr,
              "outputType": "STRING"
            },
          ],
          filter: myfilter2,
          "dimensions": [ "domain" ],
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
            return {
              domain: e.event.domain,
              threatCount: e.event.threatCount
            }
          });
          results.sort((e1, e2) => e2.threatCount - e1.threatCount)
          resolve(results)
        })
        .catch(err => {
          logger.error(err)
          reject(err)
        })
      }) // p2

      let p3 = new Promise((resolve, reject) => {
        let myfilter2 = _.cloneDeep(myfilter)
        myfilter2.fields.push({
          "type": "selector",
          "dimension": "connectionType",
          "value": "IP",    
        })
        let query = {
          "queryType": "groupBy",
          "dataSource": druid.ds_suspected_threats,
          "granularity": "all",
          intervals,
          "virtualColumns": [
            {
              "type": "expression",
              "name": "sector",
              "expression": sectorAttr,
              "outputType": "STRING"
            },
            {
              "type": "expression",
              "name": "ip",
              "expression": nodeAttr,
              "outputType": "STRING"
            },
          ],
          filter: myfilter2,
          "dimensions": [ "dstNodeId" ],
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
            return {
              domain: e.event.domain,
              threatCount: e.event.threatCount
            }
          });
          results.sort((e1, e2) => e2.threatCount - e1.threatCount)
          resolve(results)
        })
        .catch(err => {
          logger.error(err)
          reject(err)
        })
      }) // p3

      return Promise.all([p1, p2, p3]).then(values => {
        return {
          countries: values[0],
          domains: values[1],
          ips: values[2],
        }
      })

    }, // threatEvents_sectorDetails

    /**
     * threatEvents_sectorScamDetails
     */
    threatEvents_sectorScamDetails: ( root, { dateStart, dateEnd, sector, filter, having, outgoing }, { user } ) => {
      logger.debug("threatEvents_sectorScamDetails", dateStart, dateEnd, sector)

      let dataSource = druid.ds_findings_scams_matched_results;

      // let intervals = dateFrom?
      //   [ `${moment().subtract(dateFrom.numUnits, dateFrom.unit).toISOString()}/${moment().toISOString()}` ]:
      //   [ "0000/3000" ]
      dateStart = dateStart?moment(dateStart).toISOString():"0000";
      dateEnd = dateEnd?moment(dateEnd).toISOString():"3000";
      let intervals = [ `${dateStart}/${dateEnd}` ]

      let sectorAttr = outgoing?"srcSector":"dstSector";
      let nodeAttr = outgoing?"dstNodeId":"srcNodeId";
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
            "type": "selector",
            "dimension": "sector",
            "value": sector
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

      // retrieve counts by country
      let p1 = new Promise((resolve, reject) => {
        let query = {
          "queryType": "groupBy",
          "dataSource": druid.ds_suspected_threats,
          "granularity": "all",
          intervals,
          "virtualColumns": [
            {
              "type": "expression",
              "name": "sector",
              "expression": sectorAttr,
              "outputType": "STRING"
            },
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
          results.sort((e1, e2) => e2.threatCount - e1.threatCount)
          resolve(results)
        })
        .catch(err => {
          logger.error(err)
          reject(err)
        })
      }) // p1

      // retrieve counts by domain
      let p2 = new Promise((resolve, reject) => {
        // let myfilter2 = _.cloneDeep(myfilter)
        // myfilter2.fields.push({
        //   "type": "selector",
        //   "dimension": "connectionType",
        //   "value": "HTTP",    
        // })
        let query = {
          "queryType": "groupBy",
          "dataSource": dataSource,
          "granularity": "all",
          intervals,
          "virtualColumns": [
            {
              "type": "expression",
              "name": "sector",
              "expression": sectorAttr,
              "outputType": "STRING"
            },
          ],
          filter,
          "dimensions": [ "campaignId" ],
          "aggregations": [
            { "type": "longSum", "name": "threatCount", "fieldName": "count" }
          ],
          context: druid.context,
        }

        // console.log("query", JSON.stringify(query, null, "  "))
        druid.query.post('/', query).then(res => {
          // console.log(`statusCode: ${res.statusCode}`)
          // console.log("p1", JSON.stringify(res.data, null, "  "))
          let results = res.data.map(e => e.event);
          results.sort((e1, e2) => e2.threatCount - e1.threatCount)
          resolve(results)
        })
        .catch(err => {
          logger.error(err)
          reject(err)
        })
      }) // p2

      return Promise.all([p1, p2]).then(values => {
        return {
          countries: values[0],
          campaigns: values[1],
        }
      })

    }, // threatEvents_sectorScamDetails

    threatEvents_sectorScamCount: (root, { countryCode, dateStart, dateEnd, limitVal }, { user }) => {
      let query = {
        "queryType": "groupBy",
        "dataSource": {
          "type": "table",
          "name": "ds-findings-scams-matched-results"
        },
        "intervals": {
          "type": "intervals",
          "intervals": [
            "-146136543-09-08T08:23:32.096Z/146140482-04-24T15:36:27.903Z"
          ]
        },
        "virtualColumns": [],
        "filter": {
          "type": "selector",
          "dimension": "dstNodeId",
          "value": "SG",
          "extractionFn": {
            "type": "registeredLookup",
            "lookup": "lookup-ip-country",
            "retainMissingValue": false,
            "replaceMissingValueWith": null,
            "injective": null,
            "optimize": true
          }
        },
        "granularity": {
          "type": "all"
        },
        "dimensions": [
          {
            "type": "default",
            "dimension": "srcSector",
            "outputName": "sectorStr",
            "outputType": "STRING"
          }
        ],
        "aggregations": [
          {
            "type": "count",
            "name": "count"
          }
        ],
        "postAggregations": [],
        "having": null,
        "limitSpec": {
          "type": "NoopLimitSpec"
        },
        "context": {
          "sqlQueryId": "6c6daf36-d347-41da-84f9-7e0f60cb02e6"
        },
        "descending": false
      }
      return new Promise((resolve, reject) => {
        druid.query.post('/', query).then(res => {
            let msgJson = [];
            for (let obj of res.data) { msgJson.push(obj['event']); }
            resolve(msgJson);
        }).catch(err => {
            console.error(err)
            reject(err)
        })
    });
    },
  } // Query
}