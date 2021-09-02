import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import * as Highcharts from "highcharts";
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';

import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';

import {DashNationalActorsComponent} from "../dash-national-actors/dash-national-actors.component";
import {DashNationalClientComponent} from "../dash-national-client/dash-national-client.component"


const COUTN_QUERY =  gql`
query {
    threatHourCounts
}
`;



const SECTOR_QUERY = gql`
query {
    threatSector
}
`;

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
    private nativeElement: HTMLElement;

    //Query data paramters
    loadingCount: boolean;
    countDataSet: any;
    public threatCountTS: String;
    private queryCountSubscription: Subscription;
    private feedCouQuery: QueryRef<any>;
    private feedCount: Subscription;
    


    loadingSector: boolean;
    sectorDataSet: any;
    public threatSectorTS: String;
    private querySecotrSubscription: Subscription;
    private feedSecQuery: QueryRef<any>;
    private feedSector: Subscription;


    posts: any;
    
    public countdata = [];
    
    
    clientArr1: String[];
    clientArr2: String[]; 

    
    
    
    countSrc: any;
    nameSrc: any;
    sectorSrc: any;

    
    public threatSectorArr: threatNType = [];


    nameColumns = [
        { text: 'Threat Name', datafield: 'name'},
        { text: 'Threat Count', datafield: 'count' },
      ]; // landing page subgraph table

    sectorColumns = [
        { text: 'Sector Name', datafield: 'name'},
        { text: 'Total Threat Count', datafield: 'count' },
      ]; // landing page subgraph table


    public options: any = {
        chart: {
            zoomType: 'x'
        },
        title: {
            text: 'Threat Counts'
        },
        subtitle: {
            text: 'from (local pre-saved data)'
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
            name: 'All Threats Counts (K)',
            data: this.countdata
        }]
    };
    
    // word cloud option
    wcOptions = {
        accessibility: {
            screenReaderSection: {
                beforeChartFormat: '<h5>{chartTitle}</h5>' +
                    '<div>{chartSubtitle}</div>' +
                    '<div>{chartLongdesc}</div>' +
                    '<div>{viewTableButton}</div>'
            }
        },
        series: [{
            type: 'wordcloud',
            data: [['loading',1]],
            name: 'Occurrences'
        }],
        title: {
            text: ''
        }
    };

    constructor(private apollo: Apollo) {
        
        this.threatSectorTS = "Loading ...";
        //this.clientArr1 = ["GOVERNMENT"];
        this.clientArr2 = [];
        this.clientArr1 = ["GOVERNMENT", "INFOCOMM", "Manufacturing", "UTILITIES"];
        //this.clientArr2 = ["TRANSPORT", "HEALTHCARE", "SECURITY AND EMERGENCY", "BANKING AND FINANCE"];

        
        this.sectorDataSet ={};
    }

    ngOnInit(): void {

        this.feedCouQuery = this.apollo.watchQuery<any>({
            query: COUTN_QUERY,
            variables: {
                // page: this.page,
                // rowsPerPage: this.rowsPerPage,
                page: 0,
            },
            fetchPolicy: 'network-only',
            // fetchPolicy: 'cache-first',
        });
        this.fetchCountQuery();





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




        // this.nameSrc = new jqx.dataAdapter({
        //     localData: [],
        //     sortcolumn: 'count',
        //     sortdirection: 'dsc',
        // });

        this.nameSrc = new jqx.dataAdapter({
            localData: [],
            sortcolumn: 'count',
            sortdirection: 'dsc',
        });

    }

    ngOnDestroy() {
        //this.queryNameSubscription.unsubscribe();
        this.querySecotrSubscription.unsubscribe();
    }

    redraw():void {
        let chartG = Highcharts.chart('container', this.options);
        chartG.reflow();
    }

    fetchCountQuery():void{
        this.feedCount = this.feedCouQuery.valueChanges.subscribe(({ data, loading }) => {
            // console.log("threatEvents_list", this.threatEvents_list)
            this.countDataSet = JSON.parse(data['threatHourCounts']);
            this.loadingCount = loading;
            console.log('Query count  0:', this.countDataSet);
            //console.log('Query data 1:', darrary[1]);
            console.log('Query count loading:', loading);
            this.countdata = [];
            if (!this.loadingCount) {
                for (let obj of this.countDataSet) {
                    let actor =[
                      Number(obj['d0']),
                      Number(obj['a0']),
                    ]
                    this.countdata.push(actor);
                  }
                let timestamp1 = this.countdata[0][0];
                let date1 = new Date(timestamp1).toLocaleDateString("en-us");
                let timestamp2 = this.countdata[this.countdata.length-1][0];
                let date2 = new Date(timestamp2).toLocaleDateString("en-us");
                this.options['subtitle']['text'] = 'From '+ date1 + ' to ' +date2;
                this.options['series']['0']['data'] = this.countdata;
                this.redraw();
            }
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
                this.threatSectorTS = 'Dataset timestamp : ' + this.sectorDataSet['timestamp'];
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
