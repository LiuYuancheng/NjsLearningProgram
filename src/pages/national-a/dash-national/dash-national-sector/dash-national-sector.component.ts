import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';

import gql from 'graphql-tag';
import * as Highcharts from 'highcharts';

//-----------------------------------------------------------------------------
// Name:        dash-national-sector.components.ts
// Purpose:     This components will show a mat-card to display the sectors threat
//              timeseries hour count in a highchart line-area chart. 
// Author:
// Created:     2021/09/10
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

const AREA_COLOR = '#2E6B9A';
const ICON_PATH = "assets/images/icons/cii/icons/";

//------------------------------------------------------------------------------
@Component({
    selector: 'app-dash-national-sector',
    templateUrl: './dash-national-sector.component.html',
    styleUrls: ['./dash-national-sector.component.scss']
})

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
export class DashNationalSectorComponent implements OnInit {
    @Input() customTitle: string;
    @Output("showPopup") parentFun: EventEmitter<any> = new EventEmitter();

    public secIconPath: String; // top left icon 
    public malIconPath: String; // malware icon
    public intIconPath: String; // intrustionSet icon

    // timeseries data query
    private feedQuery: QueryRef<any>;
    private feed: Subscription;

    private options: any;

    //------------------------------------------------------------------------------
    constructor(private apollo: Apollo) {
        this.options = {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'Threat Counts'
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Threat Counts'
                }
            },
            legend: {
                enabled: false
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
                }
            },
            series: [{
                type: 'area',
                name: 'Threat Counts',
                data: [],
                color: AREA_COLOR
            }]
        }
    }

    //------------------------------------------------------------------------------
    ngOnInit(): void {
        this.secIconPath = ICON_PATH + this.customTitle + ".png";
        this.malIconPath = ICON_PATH + "MALWARE.png";
        this.intIconPath = ICON_PATH + "hackingtool.png";
        this.options['title']['text'] = this.customTitle;
        //graphql example: threatEvents_nationalCount(queryType:"threatSector",fieldStr:"GOVERNMENT", threatType:"All", limitVal:1000)
        this.feedQuery = this.apollo.watchQuery<any>({
            query: COUNT_QUERY,
            variables:
            {
                queryType: "threatSector",
                fieldStr: this.customTitle,
                threatType: 'All'
            },
            fetchPolicy: 'network-only',
        });
        this.fetchSectorQuery();
    }

    ngOnDestroy(): void {
        if (this.feed != null) this.feed.unsubscribe();
        this.feed = null;
    }

    // All detail function methods (name sorted by alphabet):
    //------------------------------------------------------------------------------
    fetchSectorQuery(): void {
        // fetch the data with the query and redraw the highchart.
        this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
            let dataSet = data['threatEvents_nationalCount'];
            let dataArr = [];
            if (!loading) {
                let totalCount = 0;
                for (let obj of dataSet) {
                    let secotr = [Number(obj['timestamp']), Number(obj['countVal'])] // d0: timestamp, a0:count value
                    totalCount += secotr[1];
                    dataArr.push(secotr);
                }
                this.options['subtitle']['text'] = 'Threat Count : ' + String(totalCount);
                this.options['series']['0']['data'] = dataArr;
                this.redraw();
            }
        });
    }
    //------------------------------------------------------------------------------
    showPopupDialog(): void {
        //handle panel click event and show popup dialog.
        this.parentFun.emit({ 'type': 'sector', 'val': this.customTitle });
    }
    //------------------------------------------------------------------------------
    redraw(): void {
        let chartG = Highcharts.chart(this.customTitle, this.options);
        chartG.reflow();
    }
}
