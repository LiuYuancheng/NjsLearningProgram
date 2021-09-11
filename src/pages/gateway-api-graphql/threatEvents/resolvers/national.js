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
        // threatEvents_nationalCount(queryType:"Actor", fieldStr:"APT37", threatType:"IntrusionSet", limitVal:1)
        threatEvents_nationalCount: (root, { queryType, fieldStr, threatType, limitVal }, { user }) => {
            // Basic query
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

            let threatTypeVal = "IntrusionSet";
            if (threatType) threatTypeVal = threatType;

            switch (queryType) {
                case 'threatActor': {
                    query["filter"] = {
                        "type": "and",
                        "fields": [
                            {
                                "type": "selector",
                                "dimension": "threatType",
                                "value": threatTypeVal,
                                "extractionFn": null
                            },
                            {
                                "type": "selector",
                                "dimension": "threatName",
                                "value": fieldStr,
                                "extractionFn": null
                            }
                        ]
                    };
                    if (limitVal) query["limit"] = limitVal;
                    query["context"]["sqlOuterLimit"] = 100;
                    query["context"]["sqlQueryId"] = "452d2e8e-cfd6-4da9-ae22-60ac207d177b";
                    break;
                }
                case 'threatName': {
                    query["filter"] = {
                        "type": "selector",
                        "dimension": "threatName",
                        "value": fieldStr,
                        "extractionFn": null
                    };
                    if (limitVal) query["limit"] = limitVal;
                    query["context"]["sqlOuterLimit"] = 100;
                    query["context"]["sqlQueryId"] = "06b793c8-c8c6-487b-8e39-723f56aed450";
                    break;
                }
                case 'threatSector': {
                    if (threatType == 'All') {
                        query["filter"] = {
                            "type": "selector",
                            "dimension": "srcSector",
                            "value": fieldStr,
                            "extractionFn": null
                        };
                    } else {
                        query["filter"] = {
                            "type": "and",
                            "fields": [
                                {
                                    "type": "selector",
                                    "dimension": "srcSector",
                                    "value": fieldStr,
                                    "extractionFn": null
                                },
                                {
                                    "type": "selector",
                                    "dimension": "threatType",
                                    "value": threatType,
                                    "extractionFn": null
                                }
                            ]
                        }
                    }
                    if (limitVal) query["limit"] = limitVal;
                    query["context"]["sqlOuterLimit"] = 100;
                    query["context"]["sqlQueryId"] = "c8e13274-06c7-4c9d-84f8-af30436dddc4";
                    break;
                }
                default: {

                }
            }

            return new Promise((resolve, reject) => {
                druid.query.post('/', query).then(res => {
                    let msgJson = [];
                    for (let obj of res.data) { msgJson.push(obj['result']); }
                    resolve(msgJson);
                }).catch(err => {
                    console.error(err)
                    reject(err)
                })
            });
        },
        // get the top N based on the input 
        threatEvents_nationalTopN: (root, { dimension, filterDimension, filterVal, topN }, { user }) => {
            let thresholdVal = 10;
            if (topN) thresholdVal = Number(topN);
            // baic query 
            let query = {
                "queryType": "topN",
                "dataSource": {
                    "type": "table",
                    "name": "ds-suspected-ip-2019"
                },
                "virtualColumns": [],
                "dimension": {
                    "type": "default",
                    "dimension": dimension,
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

            if (filterDimension && filterVal) {
                query["filter"] = {
                    "type": "selector",
                    "dimension": filterDimension,
                    "value": filterVal,
                    "extractionFn": null
                }
            }

            return new Promise((resolve, reject) => {
                druid.query.post('/', query).then(res => {
                    resolve(res.data);
                }).catch(err => {
                    console.error(err)
                    reject(err)
                })
            });
        }
    }
}
