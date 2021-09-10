'use strict'

/**
 * statistics module
 * @module graphql/enterpriseStatistics/statistics
 */

const logger = require('@shared-lib/logger');
const druid = require('@lib/druid.js')
var dbconn = require('@lib/arango.js');
var db = new dbconn();

const moment = require("moment")

module.exports = {
  Query: {
    threatEvents_list: ( root, { dateStart, dateEnd, page, rowsPerPage, sort, filter, having }, { user } ) => {
      logger.debug("threatEvents_list", page, rowsPerPage, sort)
      // console.log("threatEvents_list filters", JSON.stringify(filter, null, "  "))
      const dimensions = [
        "srcNodeId",
        "srcSector",
        "srcEnterpriseId",
        "dstNodeId",
        "dstPort",
        "dstSector",
        "protocol",
        "dstEnterpriseId",
        "threatName",
        "threatType",
        "app",
        "url",
        "domain",
        "connectionType"
      ]      

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
        // bindVars.enterpriseId = user.enterpriseId;
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

      // let having = null;
      /*
      if (filters) {
        let [ where, tmpHaving ] = druid.jqxGridFilters(filters, ["threatCount"])
        // console.log("where", JSON.stringify(where, null, "  "))
        // console.log("tmpHaving", JSON.stringify(tmpHaving, null, "  "))

        if (where.length > 0)
          filter.fields = [...filter.fields, ...where]
        if (tmpHaving.length > 0) {
          if (tmpHaving.length == 1) {
            having = {
              "type": "filter",
              "filter": tmpHaving[0],
            }
          } else {
            having = {
              "type": "filter",
              "filter": {
                "type": "and",
                "fields": tmpHaving,              
              }
            }
          }
        }
      }
      // console.log("query filter", JSON.stringify(filter, null, " "))
      */
      if (filter) {
        // myfilter.fields = [...myfilter.fields, filter]
        myfilter.fields.push(filter)
      }

      let columns = null;
      if (sort) {
        columns = [{
          "dimension": sort.sortdatafield,
          "direction": sort.sortorder,
        }]
      }
      // console.log("final filter", JSON.stringify(myfilter,null," "))

      // get paged events
      let p1 = new Promise((resolve, reject) => {
        let query = {
          "queryType": "groupBy",
          "dataSource": druid.ds_suspected_threats,
          "granularity": "hour",
          intervals,
          "limitSpec": {
            "type": "default",
            "limit": rowsPerPage,
            "offset": rowsPerPage * page,
            columns,
          },
          filter: myfilter,
          having,
          dimensions,
          "aggregations": [
            { "type": "longSum", "name": "threatCount", "fieldName": "count" }
          ],
          "context": {
            "sortByDimsFirst": "true"
          },
          "context": {
            ...druid.context,
            sortByDimsFirst: true,
          },
        }

        // console.log("query", JSON.stringify(query, null, "  "))
        druid.query.post('/', query).then(res => {
          // console.log(`statusCode: ${res.statusCode}`)
          // console.log("p1", JSON.stringify(res.data, null, "  "))
          let data = res.data.map(ele => ({
            eventTime: ele.timestamp,
            ...ele.event
          }))
          // console.log("res", JSON.stringify(data, "  "))
          resolve(data)
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
          "granularity": "all",
          "intervals": [ "1000/3000" ],
          "dataSource": {
            "type": "query",
            "query": {
              "queryType": "groupBy",
              "dataSource": druid.ds_suspected_threats,
              "granularity": "hour",
              intervals,
              filter: myfilter,
              having,
              dimensions     
            }
          },
          "aggregations": [
            { "type": "count", "name": "totalCount" }
          ],
          "context": druid.context,
        }

        druid.query.post('/', query).then(res => {
          // console.log(`statusCode: ${res.statusCode}`)
          // console.log("p2", JSON.stringify(res.data, "  "))
          if (res.data.length > 0)
            resolve(res.data[0].event.totalCount)
          else
            resolve(0)
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
        return { totalCount:values[1], events: values[0] }
      }).catch(err => {
        console.log("query error", err)
      })
    },

    threatEvents_filters: ( root, { dateFrom }, { user } ) => {
      console.log("threatEvents_filters", dateFrom)

      let bindVars = { }

      if (user.isEnterpriseUser) {
        bindVars.enterpriseId = user.enterpriseId;
      }

      if (dateFrom) {
        bindVars.from = moment().subtract(dateFrom.numUnits, dateFrom.unit).valueOf()
      }

      let query = `
LET res1 = (
FOR doc in ThreatEventProfile
  ${bindVars.enterpriseId?"FILTER doc.srcEnterprise == @enterpriseId || doc.dstEnterprise == @enterpriseId":""}
  ${bindVars.from?"FILTER doc.eventTime >= @from":""}
  FILTER doc.srcEnterprise == @enterpriseId || doc.dstEnterprise == @enterpriseId
  //FILTER doc.app != "synonly"
  COLLECT
    threatType = doc.threatType,
    threatName = doc.threatName
  RETURN { threatType, threatName }
)
LET res2 = (
FOR doc in ThreatEventProfile
  ${bindVars.enterpriseId?"FILTER doc.srcEnterprise == @enterpriseId || doc.dstEnterprise == @enterpriseId":""}
  ${bindVars.from?"FILTER doc.eventTime >= @from":""}
  //FILTER doc.app != "synonly"
  COLLECT
    srcSector = doc.srcSector,
    dstSector = doc.dstSector
  RETURN { srcSector, dstSector }
)
LET threatNameList = UNIQUE(res1[*].threatName)
LET threatTypeList = UNIQUE(res1[*].threatType)
LET sectorList = UNIQUE(REMOVE_VALUE(APPEND(res2[*].srcSector, res2[*].dstSector), ""))
RETURN { threatNameList, threatTypeList, sectorList }
`
      // console.log(ADBQuery)
      return new Promise((resolve, reject) => {
        db.query({
          query,
          bindVars
        }).then(cursor => cursor.all())
        .then(doc => {
          console.log("doc", doc)
          resolve(doc[0])
        })
        .catch (err => {
          err => console.error('Failed to execute query:', err.message)
          reject("Query error")
        })
      })
      // console.log('---------------------------------------------------');
    }
    
  }
}