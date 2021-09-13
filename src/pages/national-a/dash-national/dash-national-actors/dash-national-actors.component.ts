import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';

import gql from 'graphql-tag';
import * as Highcharts from 'highcharts';

//-----------------------------------------------------------------------------
// Name:        dash-national-actors.components.ts
// Purpose:     This components will show a mat-card to display the top N threat
//              actor/type in a highchart pie chart. 
//              threatActor:[ThreatName with threatType== 'IntrusionSet']
// Author:
// Created:     2021/08/26
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

const TOPN_QUERY = gql`
query($dimension:String!,$filterDimension:String, $filterVal:String, $topN:Int) {
    threatEvents_nationalTopN(dimension:$dimension, filterDimension:$filterDimension, filterVal:$filterVal, topN:$topN)
}
`;

//------------------------------------------------------------------------------
@Component({
    selector: 'app-dash-national-actors',
    templateUrl: './dash-national-actors.component.html',
    styleUrls: ['./dash-national-actors.component.scss']
})

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
export class DashNationalActorsComponent implements OnInit, OnDestroy {
    @Output("showPopup") parentFun: EventEmitter<any> = new EventEmitter();
    
    public loadLabel: String;

    // top N data query
    private feedQuery: QueryRef<any>;
    private feed: Subscription;
    
    private options: any;

    //------------------------------------------------------------------------------
    constructor(private apollo: Apollo) {
        this.loadLabel = 'loading...';
        this.options = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
            },
            title: {
                text: 'Top-N Threat Actors'
            },
            tooltip: {
                //pointFormat: '{series.name}: <b>{point.y:.1f}</b>'
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
                    showInLegend: true
                },
                series: {
                    cursor: 'pointer',
                    events: {
                        click: null
                        //click: function (event) {alert('Shift: ' + String(this.data[0]));}
                    }
                }
            },
            series: [{
                name: 'actors',
                colorByPoint: true,
                data: []
            }]
        }
    }

    //------------------------------------------------------------------------------
    ngOnInit(): void {
        this.feedQuery = this.apollo.watchQuery<any>({
            query: TOPN_QUERY,
            variables: { 
                dimension: "threatName",  
                filterDimension: "threatType",
                filterVal: "IntrusionSet",
                topN:10,
        },
            fetchPolicy: 'network-only', // fetchPolicy: 'cache-first',
        });
        this.options.plotOptions.series.events.click = (event) => this.clickPie(event);
        this.fetchActorQuery();
    }

    ngOnDestroy(): void {
        if (this.feed != null) this.feed.unsubscribe();
        this.feed = null;
    }

    // All detail function methods (name sorted by alphabet):
    //------------------------------------------------------------------------------
    clickPie(event: any) {
        //handle Pie chart section click event.
        //console.log("clickPie()", event.point['name']);
        this.parentFun.emit({ 'type': 'actor', 'val': event.point['name'] });
    }

    //------------------------------------------------------------------------------
    fetchActorQuery(): void {
        this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
            let dataSet = data['threatEvents_nationalTopN']['0'];
            //console.log('Query actor data :', dataSet);
            //console.log('Query actor loading:', loading);
            if (!loading) {
                this.loadLabel = 'Chart Display Config : '
                let dataArr = [];
                for (let obj of dataSet['result']) {
                    dataArr.push({ name: obj['d0'], y: obj['a0'] }); 
                }
                this.options['series']['0']['data'] = dataArr;
            }
            this.redraw();
        });
    }

    //------------------------------------------------------------------------------
    redraw() {
        let chartG = Highcharts.chart('actorPieChart', this.options);
        chartG.reflow();
    }

    //------------------------------------------------------------------------------
    selectConfigN(event: any): void {
        let inputData = String(event.target.value).split(':');
        switch (inputData[0]) {
            case 'name': {
                this.feedQuery = this.apollo.watchQuery<any>({
                    query: TOPN_QUERY,
                    variables: {
                        dimension: "threatName",  
                        filterDimension: "threatType",
                        filterVal: "IntrusionSet",
                        topN: Number(inputData[1])
                    },
                    fetchPolicy: 'network-only',
                });
                this.fetchActorQuery();
                break;
            }
            default: {
                console.log("selectConfigN()input not valid", inputData);
                return;
            }
        }
    }

    //------------------------------------------------------------------------------
    showLegend(event: MatCheckboxChange): void {
        this.options.plotOptions.pie.showInLegend = event.checked;
        this.redraw();
    }

}
