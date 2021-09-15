import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';

import gql from 'graphql-tag';
import * as Highcharts from 'highcharts';

//-----------------------------------------------------------------------------
// Name:        dash-national-popup.components.ts
// Purpose:     This components will show a pop-up dialog in the mid of the page 
//              with a count area chart of the item selected by user on the left
//              side and item description text on the right side.
// Author:
// Created:     2021/09/05
// Copyright:    n.a    
// License:      n.a
//------------------------------------------------------------------------------

declare var require: any;
const More = require('highcharts/highcharts-more');
More(Highcharts);

const Exporting = require('highcharts/modules/exporting');
Exporting(Highcharts);

const ExportData = require('highcharts/modules/export-data');
ExportData(Highcharts);

const Accessibility = require('highcharts/modules/accessibility');
Accessibility(Highcharts);


const COUNT_QUERY = gql`
query($queryType:String!, $fieldStr:String, $threatType:String, $limitVal:Int){
    threatEvents_nationalCount(queryType:$queryType, fieldStr:$fieldStr, threatType:$threatType, limitVal:$limitVal)
}
`;

const DES_QUERY = gql`
query($threatName:String!) {
    profile_threatName(threatName:$threatName)
}
`;

const AREA_COLOR = '#2E6B9A'; // area highchart color

//------------------------------------------------------------------------------
@Component({
    selector: 'app-dash-national-popup',
    templateUrl: './dash-national-popup.component.html',
    styleUrls: ['./dash-national-popup.component.scss']
})

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
export class DashNationalPopupComponent implements OnInit, OnDestroy {
    @Input() popupType: String;
    @Input() popupName: String;

    // highchart query
    private feedQuery: QueryRef<any>;
    private feed: Subscription;

    // description query 
    public threatDesStr: String;
    private feedDesQuery: QueryRef<any>;
    private feedDes: Subscription;

    public options: any

    //------------------------------------------------------------------------------
    constructor(private apollo: Apollo) {
        this.threatDesStr = 'Loading ...';
        this.options = {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'Threat Counts'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Thread Counts'
                }
            },
            legend: {
                enabled: false,
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, AREA_COLOR],
                            [1, Highcharts.color(AREA_COLOR).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null,
                },
                showInLegend: true
            },
            series: []
        }
    }

    //------------------------------------------------------------------------------
    ngOnInit(): void {
        switch (this.popupType) {
            case 'Sector': {
                this.getThreatCount('threatSector', 'Malware');
                this.getThreatCount('threatSector', 'IntrusionSet');
                this.threatDesStr = 'No infomation from database.'
                break;
            }
            case 'Name': {
                this.getThreatCount('threatName');
                this.getThreatDes();
                break;
            }
            case 'Actor': {
                this.getThreatCount('threatActor');
                this.getThreatDes();
                break;
            }
            default: {
                console.log('ngOnInit() input popupType invalied:', this.popupType);
                return;
            }
        }
    }

    //------------------------------------------------------------------------------
    ngOnDestroy(): void {
        if (this.feed != null) this.feed.unsubscribe();
        if (this.feedDes != null) this.feedDes.unsubscribe();
    }

    // All detail function methods (name sorted by alphabet):
    //-----------------------------------------------------------------------------
    getThreatCount(queryName: String, threatType?: String): void {
        // get the threat count and plot the high chart based on the input queryName.
        let queryItem: any;
        let variablesItem: any;
        let seriesItem = {
            type: 'area',
            name: this.popupName,
            data: [],
        };
        switch (queryName) {
            case 'threatActor': {
                queryItem = COUNT_QUERY;
                variablesItem = {
                    queryType: "threatActor",
                    fieldStr: this.popupName,
                    threatType: "IntrusionSet",
                    limitVal: 100
                };
                break;
            }
            case 'threatName': {
                queryItem = COUNT_QUERY;
                variablesItem = {
                    queryType: "threatName",
                    fieldStr: this.popupName,
                    limitVal: 100
                };
                break;
            }
            case 'threatSector': {
                if (threatType == null) return; // the input threat type is missing
                queryItem = COUNT_QUERY;
                variablesItem = {
                    queryType: "threatSector",
                    fieldStr: this.popupName,
                    threatType: threatType
                };
                seriesItem.name = threatType;
                break;
            }
            default: {
                console.log("getThreatCount(): input query name invalied: ", queryName);
                return;
            }

        }
        this.feedQuery = this.apollo.watchQuery<any>({
            query: queryItem,
            variables: variablesItem,
            fetchPolicy: 'network-only',
        });

        this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
            let dataSet = data["threatEvents_nationalCount"];
            if (!loading) {
                let series = seriesItem;
                for (let obj of dataSet) {
                    series['data'].push([Number(obj['timestamp']), Number(obj['countVal'])]);
                }
                this.options['series'].push(series);
                this.redraw();
            }
        });
    }

    //-----------------------------------------------------------------------------
    getThreatDes(): void {
        // Get the threat keyword(name/type) description string.
        this.feedDesQuery = this.apollo.watchQuery<any>({
            query: DES_QUERY,
            variables: {
                threatName: this.popupName,
            },
            fetchPolicy: 'network-only',
        });
        this.feedDes = this.feedDesQuery.valueChanges.subscribe(({ data, loading }) => {
            //console.log('getThreatDes():', data);
            let dataSet = data['profile_threatName'];
            if (!loading) this.threatDesStr = dataSet['threat']['description'];
        });
    }

    //-----------------------------------------------------------------------------
    redraw(): void {
        let chartG = Highcharts.chart('popupHighChart', this.options);
        chartG.reflow();
    }

}
