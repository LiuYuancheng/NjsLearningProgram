'use strict'

/**
 * statistics module
 * @module graphql/threatEvents/statistics
 */
const logger = require('@shared-lib/logger');
const dbconn = require('@lib/arango.js');
const druid = require('@lib/druid.js')
const db = new dbconn();
const moment = require('moment');

module.exports = {
  Query: {

    threatHourCounts: () => {
      let feedback = '';
      let query = {
        "queryType": "timeseries",
        "dataSource": {
          "type": "table",
          "name": "ds-suspected-ip-2019"
        },
        "intervals": {
          "type": "intervals",
          "intervals": [
            "-146136543-09-08T08:23:32.096Z/146140482-04-24T15:36:27.903Z"
          ]
        },
        "descending": false,
        "virtualColumns": [],
        "filter": null,
        "granularity": "HOUR",
        "aggregations": [
          {
            "type": "count",
            "name": "a0"
          }
        ],
        "postAggregations": [],
        "limit": 2147483647,
        "context": {
          "skipEmptyBuckets": true,
          "sqlQueryId": "2324b14f-0397-4697-859c-9aeffec7c32b",
          "timestampResultField": "d0"
        }
      };

      return new Promise((resolve, reject) => {
        druid.query.post('/', query).then(res => {
          let msg = [];
          for (let obj of res.data) {
            msg.push(obj['result']);
          }
          feedback = JSON.stringify(msg, '');
          resolve(feedback);
        }).catch(err => {
          console.error(err)
          reject(err)
        })
      });
      return feedback;
    },

    threatActor: (root, { ActorStr, topN }, { user }) => {
      let feedback = '123';
      let thresholdVal = 10;
      if (topN) thresholdVal = Number(topN);

      if (ActorStr == 'topN') {
        let query = {
          "queryType": "topN",
          "dataSource": {
            "type": "table",
            "name": "ds-suspected-ip-2019"
          },
          "virtualColumns": [],
          "dimension": {
            "type": "default",
            "dimension": "threatName",
            "outputName": "d0",
            "outputType": "STRING"
          },
          "metric": {
            "type": "numeric",
            "metric": "a0"
          },
          "threshold": thresholdVal,
          "intervals": {
            "type": "intervals",
            "intervals": [
              "-146136543-09-08T08:23:32.096Z/146140482-04-24T15:36:27.903Z"
            ]
          },
          "filter": {
            "type": "selector",
            "dimension": "threatType",
            "value": "IntrusionSet",
            "extractionFn": null
          },
          "granularity": {
            "type": "all"
          },
          "aggregations": [
            {
              "type": "count",
              "name": "a0"
            }
          ],
          "postAggregations": [],
          "context": {
            "sqlOuterLimit": 100,
            "sqlQueryId": "108fdecb-bce0-4f74-b5a9-8d9df97dbe8c"
          },
          "descending": false,
          context: druid.context,
        };

        return new Promise((resolve, reject) => {
          druid.query.post('/', query).then(res => {
            feedback = JSON.stringify(res.data, '');
            console.log('p1', feedback);
            //resolve(res.data);
            resolve(feedback);
          }).catch(err => {
            console.error(err)
            reject(err)
          })
        });
      } else {
        let query = {
          "queryType": "timeseries",
          "dataSource": {
            "type": "table",
            "name": "ds-suspected-ip-2019"
          },
          "intervals": {
            "type": "intervals",
            "intervals": [
              "-146136543-09-08T08:23:32.096Z/146140482-04-24T15:36:27.903Z"
            ]
          },
          "descending": false,
          "virtualColumns": [],
          "filter": {
            "type": "and",
            "fields": [
              {
                "type": "selector",
                "dimension": "threatType",
                "value": "IntrusionSet",
                "extractionFn": null
              },
              {
                "type": "selector",
                "dimension": "threatName",
                "value": ActorStr,
                "extractionFn": null
              }
            ]
          },
          "granularity": "HOUR",
          "aggregations": [
            {
              "type": "count",
              "name": "a0"
            }
          ],
          "postAggregations": [],
          "limit": 100,
          "context": {
            "skipEmptyBuckets": true,
            "sqlOuterLimit": 100,
            "sqlQueryId": "452d2e8e-cfd6-4da9-ae22-60ac207d177b",
            "timestampResultField": "d0"
          }
        }
        return new Promise((resolve, reject) => {
          druid.query.post('/', query).then(res => {
            let msg = [];
            for (let obj of res.data) {
              msg.push(obj['result']);
            }
            feedback = JSON.stringify(msg, '');
            console.log('p1', feedback);
            resolve(feedback);
          }).catch(err => {
            console.error(err)
            reject(err)
          })
        });
      }
    }
    //return 'Test Success, GraphQL server is up & running !!' 
  }
}
