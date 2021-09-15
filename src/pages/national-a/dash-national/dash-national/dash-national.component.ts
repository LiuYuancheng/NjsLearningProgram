import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';

import gql from 'graphql-tag';
import * as Highcharts from "highcharts";

//-----------------------------------------------------------------------------
// Name:        dash-national.components.ts
// Purpose:     Show the main dashboard.
// Author:
// Created:     2021/08/23
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

const TOPN_QUERY = gql`
query($dimension:String!,$filterDimension:String, $filterVal:String, $topN:Int) {
    threatEvents_nationalTopN(dimension:$dimension, filterDimension:$filterDimension, filterVal:$filterVal, topN:$topN)
}
`;

const ICON_PATH = "assets/images/icons/cii/icons/";

//------------------------------------------------------------------------------
@Component({
    selector: 'app-dash-national',
    templateUrl: './dash-national.component.html',
    styleUrls: ['./dash-national.component.scss']
})

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
export class DashNationalComponent implements OnInit, OnDestroy {
    private nativeElement: HTMLElement;

    public loadLabel: String;
    //Total threat count query paramters
    private feedCouQuery: QueryRef<any>;
    private feedCount: Subscription;

    // top-N sector query parameters
    private feedSecQuery: QueryRef<any>;
    private feedSector: Subscription;

    // the secotrs we want to show in the summery section.
    public sectorArr: String[]; 

    // pop-up dialog parameters
    public popup = false;
    public popName: String;
    public popSecIconPath: String;
    public popupType: String;
    public popupName: String;

    // high chart options
    public areOptions: any;
    public pieOption: any;

    //------------------------------------------------------------------------------
    constructor(private apollo: Apollo) {
        this.loadLabel = "Loading ...";
        this.sectorArr = ["GOVERNMENT", "INFOCOMM", "MANUFACTURING", "ENERGY" ,
                            "TRANSPORTATION SERVICES", "HEALTH AND SOCIAL SERVICES","SECURITY AND EMERGENCY", "BANKING AND FINANCE"];
        // Init the threat count area highchart option.
        this.areOptions = {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'Total Threat Counts'
            },
            subtitle: {
                text: 'from (local pre-saved data)'
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
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
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
                    threshold: null
                }
            },
            series: [{
                type: 'area',
                name: 'All Threats Counts',
                data: [],

            }]
        };

        // Init the top-N sector pie highchart option.
        this.pieOption = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
            },
            title: {
                text: 'Top Threat Sectors'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.y}</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        //format: '<b>{point.name}</b>: {point.y:.1f}'
                        format: '<b>{point.name}</b>: {point.percentage:.2f}%'
                    },
                    showInLegend: true,
                },
            },
            series: [{
                name: 'Threat Count',
                colorByPoint: true,
                data: []
            }]
        }
    }

    //------------------------------------------------------------------------------
    ngOnInit(): void {
        this.feedCouQuery = this.apollo.watchQuery<any>({
            query: COUNT_QUERY,
            variables: {
                queryType: 'All'
            },
            fetchPolicy: 'network-only',
        });
        this.fetchCountQuery();

        this.feedSecQuery = this.apollo.watchQuery<any>({
            query: TOPN_QUERY,
            variables: {
                dimension: 'srcSector',
                topN: 10
            },
            fetchPolicy: 'network-only',
        });
        this.fetchSectorQuery();
    }

    ngOnDestroy(): void {
        if (this.feedSector != null) this.feedSector.unsubscribe();
        if (this.feedCount != null) this.feedCount.unsubscribe();
        this.feedSector = null;
        this.feedCount = null;
    }

    // All detail function methods (name sorted by alphabet):
    //------------------------------------------------------------------------------
    fetchCountQuery(): void {
        this.feedCount = this.feedCouQuery.valueChanges.subscribe(({ data, loading }) => {
            let countDataSet = data['threatEvents_nationalCount'];
            //console.log('Query count data:', countDataSet);
            //console.log('Query count loading:', loading);
            let countdata = [];
            if (!loading) {
                for (let obj of countDataSet) {
                    countdata.push([obj["timestamp"], obj["countVal"]]);
                }
                let timestamp1 = countdata[0][0];
                let date1 = new Date(timestamp1).toLocaleDateString("en-us");
                let timestamp2 = countdata[countdata.length - 1][0];
                let date2 = new Date(timestamp2).toLocaleDateString("en-us");
                this.areOptions['subtitle']['text'] = 'From ' + date1 + ' to ' + date2;
                this.areOptions['series']['0']['data'] = countdata;
                this.redrawTotal();
            }
        });
    }

    //------------------------------------------------------------------------------
    fetchSectorQuery(): void {
        this.feedSector = this.feedSecQuery.valueChanges.subscribe(({ data, loading }) => {
            let sectorDataSet = data['threatEvents_nationalTopN']['0']
            //console.log('Query sector data:', sectorDataSet);
            //console.log('Query sector loading:', loading);
            if (!loading) {
                this.loadLabel = 'Chart Display Config : '
                let dataArr = [];
                for (let obj of sectorDataSet['result']) {
                    if(obj['topNKey']==null) continue;
                    dataArr.push({ name: String(obj['topNKey']), y: obj['topNVal'] });
                }
                this.pieOption['series']['0']['data'] = dataArr;
                this.redrawSector();
            }
        });
    }

    //------------------------------------------------------------------------------
    selectConfigN(event: any): void {
        let inputData = String(event.target.value).split(':');
        switch (inputData[0]) {
            case 'sector': {
                this.feedSecQuery = this.apollo.watchQuery<any>({
                    query: TOPN_QUERY,
                    variables: {
                        dimension: 'srcSector',
                        topN: Number(inputData[1])
                    },
                    fetchPolicy: 'network-only',
                });
                this.fetchSectorQuery();
                break;
            }
            default: {
                console.log("selectConfigN(): input not valid", inputData);
                return;
            }
        }
    }

    //------------------------------------------------------------------------------
    showPopup(popupDic: any) {
        switch (popupDic['type']) {
            case 'sector': {
                this.popSecIconPath = ICON_PATH + popupDic['val'] + ".png";
                this.popupType = 'Sector';
                break;
            }
            case 'name': {
                this.popSecIconPath = ICON_PATH + "hackingtool.png";
                this.popupType = 'Name';
                break;
            }
            case 'actor': {
                this.popSecIconPath = ICON_PATH + "MALWARE.png";
                this.popupType = 'Actor';
                break;
            }
            default: {
                console.log("showPopup(): input invalid", popupDic);
                return;
            }
        }
        this.popName = popupDic['val'];
        this.popupName = '' + popupDic['val'];
        this.popup = true;
    }

    //------------------------------------------------------------------------------
    showSectorLegend(event:MatCheckboxChange): void {
        this.pieOption.plotOptions.pie.showInLegend = event.checked;
        this.redrawSector();
    }

    //------------------------------------------------------------------------------
    redrawSector(): void {
        // Draw sector pie chart.
        let chartG = Highcharts.chart('sectorPie', this.pieOption);
        chartG.reflow();
    }

    //------------------------------------------------------------------------------
    redrawTotal(): void {
        // Draw total threat account chart.
        let chartG = Highcharts.chart('totalCount', this.areOptions);
        chartG.reflow();
    }

}
