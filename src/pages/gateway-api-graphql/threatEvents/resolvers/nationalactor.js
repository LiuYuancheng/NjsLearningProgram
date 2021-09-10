'use strict'

/**
 * statistics module
 * @module graphql/threatEvents/statistics
 */

const dbconn = require('@lib/arango.js');
const druid = require('@lib/druid.js')
const moment = require('moment');

module.exports = {
    Query: {
        // threatHourCounts: count all the threats and group by hours
        //SELECT DATE_TRUNC('hour', __time), count(*) as threatCount
        //FROM "ds-suspected-ip-2019"
        //GROUP BY DATE_TRUNC('hour', __time)
        threatHourCounts: () => {
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
                "limit": 2147483647, // no limitation.
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
                    resolve(JSON.stringify(msg, '')); // return a Json string.
                }).catch(err => {
                    console.error(err)
                    reject(err)
                })
            });
        },

        // threatActor: ActorStr='topN' count topN threats and group by hours.            
        // SELECT
        // threatName, count(*) as threatCount
        // FROM "ds-suspected-ip-2019"
        // WHERE threatType='IntrusionSet'
        // GROUP BY threatName
        // ORDER BY threatCount DESC
        // LIMIT 10
        threatActor: (root, { ActorStr, topN }, { user }) => {
            let thresholdVal = 10; // default limit top 10.
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
                        let feedback = JSON.stringify(res.data, '');
                        //console.log('threatActor', feedback);
                        resolve(feedback);
                    }).catch(err => {
                        console.error(err)
                        reject(err)
                    })
                });
            }
            else {
                // SELECT
                // DATE_TRUNC('hour', __time), count(*) as threatCount
                // FROM "ds-suspected-ip-2019"
                // WHERE threatName='ActorStr' and threatType = 'IntrusionSet'
                // GROUP BY DATE_TRUNC('hour', __time)
                // ORDER BY DATE_TRUNC('hour', __time)
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
                        let feedback = JSON.stringify(msg, '');
                        //console.log('threatActor', feedback);
                        resolve(feedback);
                    }).catch(err => {
                        console.error(err)
                        reject(err)
                    })
                });
            }
        }
    }
}
