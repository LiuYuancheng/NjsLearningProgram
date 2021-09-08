import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import * as Highcharts from "highcharts";
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';

import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';


import { DashNationalActorsComponent } from "../dash-national-actors/dash-national-actors.component";
import { DashNationalClientComponent } from "../dash-national-client/dash-national-client.component";
import { DashNationalPopupComponent } from "../dash-national-popup/dash-national-popup.component";


const COUTN_QUERY = gql`
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

@Component({
    selector: 'app-dash-national',
    templateUrl: './dash-national.component.html',
    styleUrls: ['./dash-national.component.scss']
})

export class DashNationalComponent implements OnInit, OnDestroy {
    private nativeElement: HTMLElement;

    //Total threat count query paramters
    loadingCount: boolean;  // query data finished flag
    countDataSet: any;
    public threatCountTS: String;
    private feedCouQuery: QueryRef<any>;
    private feedCount: Subscription;

    // top-N sector query parameters
    loadingSector: boolean;
    sectorDataSet: any;
    public threatSectorTS: String;
    private feedSecQuery: QueryRef<any>;
    private feedSector: Subscription;

    // the client we want to show in the summery section.
    clientArr1: String[];
    clientArr2: String[];

    // pop-up dialog parameters
    popup = false;
    popName: String;
    popCliIconPath: String;
    popupType: String;
    popupName: String;

    // high chart options
    public areOptions: any;
    public pieOption: any;

    constructor(private apollo: Apollo) {
        this.threatSectorTS = "Loading ...";
        this.clientArr1 = ["GOVERNMENT", "INFOCOMM", "MANUFACTURING", "ENERGY"];
        this.clientArr2 = ["TRANSPORTATION SERVICES", "HEALTH AND SOCIAL SERVICES", "SECURITY AND EMERGENCY", "BANKING AND FINANCE"];
        this.sectorDataSet = {};
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
                    text: 'Thread count'
                }
            },
            legend: {
                enabled: true
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
                text: 'Top-N Threat Sectors'
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
                        format: '<b>{point.name}</b>: {point.y:.1f}'
                        //format: '<b>{point.name}</b>: {point.percentage:.2f}%'
                    },
                    showInLegend: false,
                },
            },
            series: [{
                name: 'Brands',
                colorByPoint: true,
                data: []
            }]
        }
    }

    ngOnInit(): void {

        this.feedCouQuery = this.apollo.watchQuery<any>({
            query: COUTN_QUERY,
            variables: {},
            fetchPolicy: 'network-only',
        });
        this.fetchCountQuery();

        this.feedSecQuery = this.apollo.watchQuery<any>({
            query: SECTOR_QUERY,
            variables: {},
            fetchPolicy: 'network-only',
        });
        this.fetchSectorQuery();
    }

    ngOnDestroy(): void {
        if (this.feedSector != null) this.feedSector.unsubscribe();
        if (this.feedCount != null) this.feedCount.unsubscribe();
    }

    redrawTotal(): void {
        let chartG = Highcharts.chart('totalCount', this.areOptions);
        chartG.reflow();
    }

    redrawSector(): void {
        let chartG = Highcharts.chart('sectorPie', this.pieOption);
        chartG.reflow();
    }


    fetchCountQuery(): void {
        this.feedCount = this.feedCouQuery.valueChanges.subscribe(({ data, loading }) => {
            this.countDataSet = JSON.parse(data['threatHourCounts']);
            this.loadingCount = loading;
            //console.log('Query count data:', this.countDataSet);
            //console.log('Query count loading:', loading);
            let countdata = [];
            if (!this.loadingCount) {
                for (let obj of this.countDataSet) {
                    let actor = [
                        Number(obj['d0']),
                        Number(obj['a0']),
                    ]
                    countdata.push(actor);
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

    fetchSectorQuery(): void {
        this.feedSector = this.feedSecQuery.valueChanges.subscribe(({ data, loading }) => {
            this.sectorDataSet = JSON.parse(data['threatSector'])['0'];
            this.loadingSector = loading;
            //console.log('Query sector data:', this.sectorDataSet);
            //console.log('Query sector loading:', loading);
            if (!this.loadingSector) {
                this.threatSectorTS = 'Dataset timestamp : ' + this.sectorDataSet['timestamp'];
                let data = [];
                for (let obj of this.sectorDataSet['result']) {
                    let actor = {
                        name: obj['d0'],
                        y: obj['a0'],
                    }
                    data.push(actor);
                }
                this.pieOption['series']['0']['data'] = data;
                this.redrawSector();
            }
        });
    }

    showClientPopup(popName: String): void {
        this.popCliIconPath = "assets/images/icons/cii/icons/" + popName + ".png";
        this.popName = popName;
        this.popupType = 'Client';
        this.popupName = '' + popName;
        this.popup = true;
    }

    showNamePopup(popName: String): void {
        this.popCliIconPath = "assets/images/icons/cii/icons/hackingtool.png";
        this.popName = popName;
        this.popupType = 'Tname';
        this.popupName = '' + popName;
        this.popup = true;
    }

    showActorPopup(popName: String): void {
        this.popCliIconPath = "assets/images/icons/cii/icons/MALWARE.png";
        this.popName = popName;
        this.popupType = 'Actor';
        this.popupName = '' + popName;
        this.popup = true;
    }
}
