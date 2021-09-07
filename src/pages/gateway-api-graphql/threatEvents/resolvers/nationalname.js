'use strict'

/**
 * statistics module
 * @module graphql/threatEvents/statistics
 */

const druid = require('@lib/druid.js');
module.exports = {
  Query: {
    threatName: (root, { NameStr }, { user }) => {
      let feedback = '123';
      let query = {};
      // Top N 
      if (NameStr == 'topN') {
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
          "threshold": 10,
          "intervals": {
            "type": "intervals",
            "intervals": [
              "-146136543-09-08T08:23:32.096Z/146140482-04-24T15:36:27.903Z"
            ]
          },
          "filter": null,
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
            "sqlQueryId": "ab7e2e38-ba23-4b15-82bc-a31d052fcdaa"
          },
          "descending": false
        };

        return new Promise((resolve, reject) => {
          druid.query.post('/', query).then(res => {
            let msg = []
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



      }
      else {
        query = {
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
            "type": "selector",
            "dimension": "threatName",
            "value": NameStr,
            "extractionFn": null
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
            "sqlQueryId": "06b793c8-c8c6-487b-8e39-723f56aed450",
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
      //return 'Test Success, GraphQL server is up & running !!' 
    },

    threatSector: () => {
      let feedback = '123';
      let query = {
        "queryType": "topN",
        "dataSource": {
          "type": "table",
          "name": "ds-suspected-ip-2019"
        },
        "virtualColumns": [],
        "dimension": {
          "type": "default",
          "dimension": "srcSector",
          "outputName": "d0",
          "outputType": "STRING"
        },
        "metric": {
          "type": "numeric",
          "metric": "a0"
        },
        "threshold": 100,
        "intervals": {
          "type": "intervals",
          "intervals": [
            "-146136543-09-08T08:23:32.096Z/146140482-04-24T15:36:27.903Z"
          ]
        },
        "filter": null,
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
          "sqlQueryId": "71970e7d-0820-4afd-b3aa-575e08a5b0d6"
        },
        "descending": false
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
      //return 'Test Success, GraphQL server is up & running !!' 
    },

    threatClient: (root, { ClientName, ThreatType }, { user }) => {
      let feedback = '123';
      //let nameString = '"'+ClientName+'"';
      console.log('>>>threat Client', ClientName);
      let filterDict = {
        "type": "selector",
        "dimension": "srcSector",
        "value": ClientName,
        "extractionFn": null
      };

      if (ThreatType != 'All') {
        filterDict = {
          "type": "and",
          "fields": [
            {
              "type": "selector",
              "dimension": "srcSector",
              "value": ClientName,
              "extractionFn": null
            },
            {
              "type": "selector",
              "dimension": "threatType",
              "value": ThreatType,
              "extractionFn": null
            }
          ]
        }
      }

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
        "filter": filterDict,
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
          "sqlQueryId": "c8e13274-06c7-4c9d-84f8-af30436dddc4",
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
          console.log('p1', feedback);
          resolve(feedback);
        }).catch(err => {
          console.error(err)
          reject(err)
        })
      });
      //return 'Test Success, GraphQL server is up & running !!' 
    },
  }
}