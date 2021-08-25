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
        }
    }
}