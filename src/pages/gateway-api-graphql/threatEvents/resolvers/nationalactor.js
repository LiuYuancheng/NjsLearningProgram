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
    threatActor: () => {
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

      console.log('p3', 'p3');
      console.log('p2', feedback);
      return feedback;

      //return 'Test Success, GraphQL server is up & running !!' 
    }
  }
}