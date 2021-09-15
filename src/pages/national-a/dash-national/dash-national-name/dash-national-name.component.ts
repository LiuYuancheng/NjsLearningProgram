import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';

import gql from 'graphql-tag';
import * as Highcharts from "highcharts";
import wordCloud from "highcharts/modules/wordcloud.js";

//-----------------------------------------------------------------------------
// Name:        dash-national-name.components.ts
// Purpose:     This components will show a mat-card to display the top N threat
//              name in a highchart word cloud.
// Author:
// Created:     2021/08/30
// Copyright:    n.a    
// License:      n.a
//------------------------------------------------------------------------------

declare var require: any;
const More = require('highcharts/highcharts-more');
More(Highcharts);

import Histogram from 'highcharts/modules/histogram-bellcurve';
Histogram(Highcharts);

const Exporting = require('highcharts/modules/exporting');
Exporting(Highcharts);

const ExportData = require('highcharts/modules/export-data');
ExportData(Highcharts);

const Accessibility = require('highcharts/modules/accessibility');
Accessibility(Highcharts);

const Wordcloud = require('highcharts/modules/wordcloud');
Wordcloud(Highcharts);

const TOPN_QUERY = gql`
query($dimension:String!,$filterDimension:String, $filterVal:String, $topN:Int) {
    threatEvents_nationalTopN(dimension:$dimension, filterDimension:$filterDimension, filterVal:$filterVal, topN:$topN)
}
`;

//------------------------------------------------------------------------------
@Component({
    selector: 'app-dash-national-name',
    templateUrl: './dash-national-name.component.html',
    styleUrls: ['./dash-national-name.component.scss']
})

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
export class DashNationalNameComponent implements OnInit, OnDestroy {
    @Output("showPopup") parentFun: EventEmitter<any> = new EventEmitter();

    public loadLabel: String;
    //  top N data query
    private feedNameQuery: QueryRef<any>;
    private feedName: Subscription;
    
    private options: any;

    //------------------------------------------------------------------------------
    constructor(private apollo: Apollo) {
        this.loadLabel = "Loading ...";
        this.options = {
            accessibility: {
                screenReaderSection: {
                    beforeChartFormat: '<h5>{chartTitle}</h5>' +
                        '<div>{chartSubtitle}</div>' +
                        '<div>{chartLongdesc}</div>'
                }
            },
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    events: {
                        click: null
                        //click: function (event) {alert( 'Shift: ' + String(this.data[0]));}
                    }
                }
            },
            series: [{
                type: 'wordcloud',
                data: [],
                maxFontSize: 25,
                minFontSize: 7,
                rotation: { // layout all words horizontal
                    from: 0,
                    to: 0,
                },
                name: 'Occurrences',
            }],
            title: {
                text: 'Top Threats'
            }
        };
    }

    //------------------------------------------------------------------------------
    ngOnInit(): void {
        this.feedNameQuery = this.apollo.watchQuery<any>({
            query: TOPN_QUERY,
            variables: { 
                dimension: "threatName",  
                topN:10,
        },
            fetchPolicy: 'network-only', // fetchPolicy: 'cache-first',
        });
        // add the chart word click handler
        this.options.plotOptions.series.events.click = (event) => this.clickWords(event);
        this.fetchNameQuery();
    }

    ngOnDestroy(): void {
        if (this.feedName != null) this.feedName.unsubscribe();
        this.feedName = null;
    }

    // All detail function methods (name sorted by alphabet):
    //-----------------------------------------------------------------------------
    clickWords(event: any): void {
        //handle word click event.
        //console.log("clickWords(): ", event.point['name']);
        this.parentFun.emit({ type: 'name', 'val': event.point['name'] });
    }

    //------------------------------------------------------------------------------
    redrawNameChart(): void {
        /*   Highcharts.seriesTypes.wordcloud.prototype.deriveFontSize = function (relativeWeight){ 
            var maxFontSize = 25; 
            let rweight = Math.floor(maxFontSize * relativeWeight);
            let size = rweight < 8? 10: rweight
            return size
          }; */
        let chartG2 = Highcharts.chart('nameContainer', this.options);
        chartG2.reflow();
    }

    //------------------------------------------------------------------------------
    selectConfigN(event: any): void {
        // handle the top-N drop down menu selection event.
        let inputData = String(event.target.value).split(':');
        switch (inputData[0]) { // use swith if need to add more filter condition.
            case 'name': {
                this.feedNameQuery = this.apollo.watchQuery<any>({
                    query: TOPN_QUERY,
                    variables: {
                        dimension: "threatName", 
                        topN: Number(inputData[1])
                    },
                    fetchPolicy: 'network-only', // fetchPolicy: 'cache-first',
                });
                this.fetchNameQuery();
                break;
            }
            default: {
                console.log("selectConfigN() input not valid", inputData);
                return;
            }
        }
    }

    //------------------------------------------------------------------------------
    fetchNameQuery(): void {
        this.feedName = this.feedNameQuery.valueChanges.subscribe(({ data, loading }) => {
            let nameDataSet  = data['threatEvents_nationalTopN']['0']
            //console.log('Query name data:', nameDataSet);
            //console.log('Query name loading:', loading);
            let threatNameArr = [];
            if (!loading) {
                //this.loadLabel = 'Dataset timestamp : ' + this.nameDataSet['timestamp'];
                this.loadLabel = 'Chart Display Config : '
                for (let obj of nameDataSet['result']) {
                    if(obj['topNKey']==null) continue;
                    threatNameArr.push([obj['topNKey'], Number(obj['topNVal'])]);
                }
                this.options['series']['0']['data'] = threatNameArr;
                this.redrawNameChart();
            }
        });
    }
}
