import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import * as Highcharts from "highcharts";
import wordCloud from "highcharts/modules/wordcloud.js";

//-----------------------------------------------------------------------------
// Name:        dash-national-name.components.ts
// Purpose:     This components will show a mat-card to display the top N theat
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

const NAME_QUERY = gql`
query($NameStr:String!, $topN:Int) {
    threatName(NameStr:$NameStr, topN:$topN)
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

    public threatNameTS: String;
    // highchart query
    private feedNameQuery: QueryRef<any>;
    private feedName: Subscription;
    private options: any;

    //------------------------------------------------------------------------------
    constructor(private apollo: Apollo) {
        this.threatNameTS = "Loading ...";
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
                text: 'TOP-N Threat Names'
            }
        };
    }

    //------------------------------------------------------------------------------
    ngOnInit(): void {
        this.feedNameQuery = this.apollo.watchQuery<any>({
            query: NAME_QUERY,
            variables: { NameStr: "topN" },
            fetchPolicy: 'network-only', // fetchPolicy: 'cache-first',
        });
        // add the chart word click handler
        this.options.plotOptions.series.events.click = (event) => this.clickWords(event);
        this.fetchNameQuery();
    }

    ngOnDestroy(): void {
        if (this.feedName != null) this.feedName.unsubscribe();
    }

    // All detail function methods (name sorted by alphabet):
    //-----------------------------------------------------------------------------
    clickWords(event: any): void {
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
                    query: NAME_QUERY,
                    variables: {
                        NameStr: "topN",
                        topN: Number(inputData[1])
                    },
                    fetchPolicy: 'network-only',
                    // fetchPolicy: 'cache-first',
                });
                this.fetchNameQuery();
                break;
            }
            default: {
                console.log("selectConfigN() input not valid", inputData);
            }
        }
    }

    //------------------------------------------------------------------------------
    fetchNameQuery(): void {
        this.feedName = this.feedNameQuery.valueChanges.subscribe(({ data, loading }) => {
            let nameDataSet = JSON.parse(data['threatName'])['0'];
            //console.log('Query data:', this.nameDataSet);
            //console.log('Query name loading:', loading);
            let threatNameArr = [];
            if (!loading) {
                //this.threatNameTS = 'Dataset timestamp : ' + this.nameDataSet['timestamp'];
                this.threatNameTS = 'Chart Display Config : '
                for (let obj of nameDataSet) {
                    threatNameArr.push([obj['d0'], Number(obj['a0'])]);
                }
                this.options['series']['0']['data'] = threatNameArr;
                this.redrawNameChart();
            }
        });
    }
}
