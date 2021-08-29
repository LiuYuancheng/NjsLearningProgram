import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import * as Highcharts from "highcharts";
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';

import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';

import {DashNationalActorsComponent} from "../dash-national-actors/dash-national-actors.component";
import {DashNationalClientComponent} from "../dash-national-client/dash-national-client.component"

const NAME_QUERY = gql`
query {
    threatName
}
`;

const SECTOR_QUERY = gql`
query {
    threatSector
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
    loadingName: boolean;
    loadingSector: boolean;
    posts: any;
    nameDataSet: any;
    sectorDataSet: any;
    public threatNameTS: String;
    public threatSectorTS: String;
    clientArr1: String[];
    clientArr2: String[]; 

    private queryNameSubscription: Subscription;
    private querySecotrSubscription: Subscription;
    private feedQuery: QueryRef<any>;
    private feedName: Subscription;
    private feedSecQuery: QueryRef<any>;
    private feedSector: Subscription;



    private nativeElement: HTMLElement;

    nameSrc: any;
    sectorSrc: any;
    public threatNameArr: threatNType = [];
    public threatSectorArr: threatNType = [];


    nameColumns = [
        { text: 'Threat Name', datafield: 'name'},
        { text: 'Threat Count', datafield: 'count' },
      ]; // landing page subgraph table

    sectorColumns = [
        { text: 'Sector Name', datafield: 'name'},
        { text: 'Total Threat Count', datafield: 'count' },
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
        this.threatSectorTS = "Loading ...";
        this.clientArr1 = ["GOVERNMENT"];
        this.clientArr2 = [];
        //this.clientArr1 = ["GOVERNMENT", "INFOCOMM", "MANIFATURE", "UTILITI"];
        //this.clientArr2 = ["TRANSPORT", "HEALTHCARE", "SECURITY AND EMERGENCY", "BANKING AND FINANCE"];

        this.nameDataSet = {};
        this.sectorDataSet ={};
    }

    ngOnInit(): void {

        this.feedQuery = this.apollo.watchQuery<any>({
            query: NAME_QUERY,
            variables: {
                // page: this.page,
                // rowsPerPage: this.rowsPerPage,
                page: 0,
            },
            fetchPolicy: 'network-only',
            // fetchPolicy: 'cache-first',
        });
        this.fetchNameQuery();

        this.feedSecQuery = this.apollo.watchQuery<any>({
            query: SECTOR_QUERY,
            variables: {
                // page: this.page,
                // rowsPerPage: this.rowsPerPage,
                page: 0,
            },
            fetchPolicy: 'network-only',
            // fetchPolicy: 'cache-first',
        });
        this.fetchSectorQuery();

        console.log('Query data:', this.posts);

        let chartG = Highcharts.chart('container', this.options);
        chartG.reflow();


        this.nameSrc = new jqx.dataAdapter({
            localData: [],
            sortcolumn: 'count',
            sortdirection: 'dsc',
        });

        this.nameSrc = new jqx.dataAdapter({
            localData: [],
            sortcolumn: 'count',
            sortdirection: 'dsc',
        });

    }

    ngOnDestroy() {
        this.queryNameSubscription.unsubscribe();
        this.querySecotrSubscription.unsubscribe();
    }
    fetchNameQuery(): void{
        this.feedName = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
            // console.log("threatEvents_list", this.threatEvents_list)
            this.nameDataSet = JSON.parse(data['threatName'])['0'];
            this.loadingName = loading;
            console.log('Query name 0:', this.nameDataSet);
            //console.log('Query data 1:', darrary[1]);
            console.log('Query name loading:', loading);
            this.threatNameArr = [];
            if (!this.loadingName) {
                this.threatNameTS = 'Date set timestamp : ' + this.nameDataSet['timestamp'];
                for (let obj of this.nameDataSet['result']) {
                    this.threatNameArr.push({ "name": obj['d0'], "count": Number(obj['a0']) });
                }
            }
            this.nameSrc = new jqx.dataAdapter({
                localData: this.threatNameArr,
                sortcolumn: 'count',
                sortdirection: 'dsc',
            });
        });
    }

    fetchSectorQuery(): void {
        console.log("123", "123");
        this.feedSector = this.feedSecQuery.valueChanges.subscribe(({ data, loading }) => {
            // console.log("threatEvents_list", this.threatEvents_list)
            this.sectorDataSet = JSON.parse(data['threatSector'])['0'];
            this.loadingSector = loading;
            console.log('Query sector 0:', this.sectorDataSet);
            //console.log('Query data 1:', darrary[1]);
            console.log('Query sector loading:', loading);
            this.threatSectorArr = [];
            if (!this.loadingSector) {
                this.threatSectorTS = 'Date set timestamp : ' + this.sectorDataSet['timestamp'];
                for (let obj of this.sectorDataSet['result']) {
                    this.threatSectorArr.push({ "name": obj['d0'], "count": Number(obj['a0']) });
                }
            }

            this.sectorSrc = new jqx.dataAdapter({
                localData: this.threatSectorArr,
                sortcolumn: 'count',
                sortdirection: 'dsc',
            });
        });


    }

}
