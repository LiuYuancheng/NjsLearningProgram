'use strict'

/**
 * statistics module
 * @module graphql/threatEvents/national
 */

const druid = require('@lib/druid.js')
const moment = require('moment');
//const testDataSrc = {"type": "table", "name": "ds-suspected-ip-2019"};

module.exports = {
    Query: {
        //graphquery example: threatEvents_nationalCount(queryType:"Actor", fieldStr:"APT37", threatType:"IntrusionSet", limitVal:1)
        threatEvents_nationalCount: (root, { queryType, fieldStr, threatType, dateStart, dateEnd, limitVal }, { user }) => {
            // setup the time interval.
            dateStart = dateStart?moment(dateStart).toISOString():"0000";
            dateEnd = dateEnd?moment(dateEnd).toISOString():"3000";
            let intervals =  {
                "type": "intervals",
                "intervals": [ `${dateStart}/${dateEnd}`]
            };
            // Basic query
            let query = {
                "queryType": "timeseries",
                "dataSource":druid.ds_suspected_ips,
                "intervals": intervals,
                "descending": false,
                "filter": null,
                "granularity": "HOUR",
                "aggregations": [
                    {
                        "type": "count",
                        "name": "countVal"
                    }
                ],
                "limit": limitVal?limitVal:null, // no limitation if the value is not set.
                "context": {
                    "skipEmptyBuckets": true,
                    "timestampResultField": "timestamp"
                }
            };

            switch (queryType) {
                case 'threatActor': {
                    query["filter"] = {
                        "type": "and",
                        "fields": [
                            {
                                "type": "selector",
                                "dimension": "threatType",
                                "value": threatType? threatType: "IntrusionSet",
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
                    query["context"]["sqlOuterLimit"] = 100;
                    break;
                }
                case 'threatName': {
                    query["filter"] = {
                        "type": "selector",
                        "dimension": "threatName",
                        "value": fieldStr,
                        "extractionFn": null
                    };
                    query["context"]["sqlOuterLimit"] = 100;
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
                    query["context"]["sqlOuterLimit"] = 100;
                    break;
                }
                default: { break;}
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
        // get the top N based on the input.
        threatEvents_nationalTopN: (root, { dimension, filterDimension, filterVal, dateStart, dateEnd, topN }, { user }) => {
            dateStart = dateStart?moment(dateStart).toISOString():"0000";
            dateEnd = dateEnd?moment(dateEnd).toISOString():"3000";
            let intervals =  {
                "type": "intervals",
                "intervals": [ `${dateStart}/${dateEnd}` ]
            };
            // baic query 
            let query = {
                "queryType": "topN",
                "dataSource":druid.ds_suspected_ips,
                "virtualColumns": [],
                "dimension": {
                    "type": "default",
                    "dimension": dimension,
                    "outputName": "topNKey",
                    "outputType": "STRING"
                },
                "metric": {
                    "type": "numeric",
                    "metric": "topNVal"
                },
                "threshold": topN?topN:10,
                "intervals":intervals,
                "filter": null,
                "granularity": {
                    "type": "all"
                },
                "aggregations": [
                    {
                        "type": "count",
                        "name": "topNVal"
                    }
                ],
                "postAggregations": [],
                "context": druid.context,
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
