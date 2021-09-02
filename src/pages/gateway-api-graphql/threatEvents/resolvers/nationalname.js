'use strict'

/**
 * statistics module
 * @module graphql/threatEvents/statistics
 */

const druid = require('@lib/druid.js');
module.exports = {
    Query: {
        threatName: () => {
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
                  for (let obj of res.data){
                    msg.push(obj['result']);
                  }
                    feedback = JSON.stringify(msg, '');
                    resolve(feedback);
                }).catch(err => {
                    console.error(err)
                    reject(err)
                })
            });
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

        threatClient: (ClientName) => {
            let feedback = '123';
            //let nameString = '"'+ClientName+'"';
            let query = {
                "queryType": "topN",
                "dataSource": {
                  "type": "table",
                  "name": "ds-suspected-ip-2019"
                },
                "virtualColumns": [],
                "dimension": {
                  "type": "default",
                  "dimension": "__time",
                  "outputName": "d0",
                  "outputType": "LONG"
                },
                "metric": {
                  "type": "dimension",
                  "previousStop": null,
                  "ordering": {
                    "type": "numeric"
                  }
                },
                "threshold": 100,
                "intervals": {
                  "type": "intervals",
                  "intervals": [
                    "-146136543-09-08T08:23:32.096Z/146140482-04-24T15:36:27.903Z"
                  ]
                },
                "filter": {
                  "type": "selector",
                  "dimension": "srcSector",
                  "value": ClientName,
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
                  "sqlQueryId": "44dca133-f753-4468-a5ff-8e8d772dacde"
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
    }
}