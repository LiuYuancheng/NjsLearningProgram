import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import * as Highcharts from "highcharts";
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';

import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';

import {DashNationalActorsComponent} from "../dash-national-actors/dash-national-actors.component";


const QUERY = gql`
query {
    threatName
}
`;

import * as cdata from './data';
declare var require: any;
const More = require('highcharts/highcharts-more');
More(Highcharts);

const Exporting = require('highcharts/modules/exporting');
Exporting(Highcharts);

const ExportData = require('highcharts/modules/export-data');
ExportData(Highcharts);

const Accessibility = require('highcharts/modules/accessibility');
Accessibility(Highcharts);

// define the name type
type threatNType = Array<{
    name: String,
    count: Number,
  }>; 

@Component({
    selector: 'app-dash-national',
    templateUrl: './dash-national.component.html',
    styleUrls: ['./dash-national.component.scss']
})
export class DashNationalComponent implements OnInit, OnDestroy  {
    loading: boolean;
    posts: any;
    nameDataSet: any;
    public threatNameTS: String;

    private querySubscription: Subscription;
    private feedQuery: QueryRef<any>;
    private feed: Subscription;

    private nativeElement: HTMLElement;

    nameSrc: any;
    public threatNameArr: threatNType = [];



    nameColumns = [
        { text: 'Threat Name', datafield: 'name'},
        { text: 'Threat Count', datafield: 'count' },
      ]; // landing page subgraph table


    public data = cdata.TimeChartData;
    public options: any = {
        chart: {
            zoomType: 'x'
        },
        title: {
            text: 'Threat Counts'
        },
        subtitle: {
            text: document.ontouchstart === undefined ?
              'from 08/05/2019 to 20/10/2019':'Threat Counts'
            //'Drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Thread Number(k)'
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
            name: 'USD to EUR',
            data: this.data
        }]
    }


    constructor(private apollo: Apollo) {
        this.threatNameTS = "Loading ...";
        this.nameDataSet = {};

    }

    ngOnInit(): void {

    this.feedQuery = this.apollo.watchQuery<any>({
        query: QUERY,
        variables: {
            // page: this.page,
            // rowsPerPage: this.rowsPerPage,
            page: 0,
        },
        fetchPolicy: 'network-only',
        // fetchPolicy: 'cache-first',
        });

        this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
        // console.log("threatEvents_list", this.threatEvents_list)
        this.nameDataSet = JSON.parse(data['threatName'])['0'];
        this.loading = loading;
        console.log('Query name 0:', this.nameDataSet);
        //console.log('Query data 1:', darrary[1]);
        console.log('Query name loading:', loading);
        this.threatNameArr = [];
        if (!this.loading) {
            this.threatNameTS = 'Date set timestamp : '+this.nameDataSet['timestamp'];
            for (let obj of this.nameDataSet['result']) {
                this.threatNameArr.push({"name":obj['d0'], "count":Number(obj['a0'])});
            }
          }
          this.nameSrc = new jqx.dataAdapter({
            localData: this.threatNameArr,
            sortcolumn: 'count',
            sortdirection: 'dsc',
          });
        }); 

        console.log('Query data:', this.posts);

        let chartG = Highcharts.chart('container', this.options);
        chartG.reflow();


        this.nameSrc = new jqx.dataAdapter({
            localData: [],
            sortcolumn: 'count',
            sortdirection: 'dsc',
          });


    }

    ngOnDestroy() {
        this.querySubscription.unsubscribe();
    }

}
