import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';

import gql from 'graphql-tag';
import * as Highcharts from 'highcharts';

//-----------------------------------------------------------------------------
// Name:        dash-national-.components.ts
// Purpose:     This components will show a mat-card to display the top N theat
//              sector in a highchart pie chart.
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

    cliIconPath: String; // top left icon 
    malIconPath: String; // malware icon
    intIconPath: String; // intrustionSet icon

    // highchart query
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
        this.cliIconPath = ICON_PATH + this.customTitle + ".png";
        this.malIconPath = ICON_PATH + "MALWARE.png";
        this.intIconPath = ICON_PATH + "hackingtool.png";

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
    }

    // All detail function methods (name sorted by alphabet):
    //------------------------------------------------------------------------------
    clickPie(): void {
        //handle Pie chart section click event.
        this.parentFun.emit({ 'type': 'client', 'val': this.customTitle });
    }
    //------------------------------------------------------------------------------
    fetchSectorQuery(): void {
        this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
            //let dataSet = JSON.parse(data['threatClient']);
            let dataSet = data['threatEvents_nationalCount'];
            let dataArr = [];
            if (!loading) {
                let totalCount = 0;
                for (let obj of dataSet) {
                    let actor = [Number(obj['d0']), Number(obj['a0'])]
                    totalCount += actor[1];
                    dataArr.push(actor);
                }
                this.options['subtitle']['text'] = 'Threat Count : ' + String(totalCount);
                this.options['title']['text'] = this.customTitle;
                this.options['series']['0']['data'] = dataArr;
                this.redraw();
            }
        });
    }
    //------------------------------------------------------------------------------
    redraw(): void {
        let chartG = Highcharts.chart(this.customTitle, this.options);
        chartG.reflow();
    }
}
