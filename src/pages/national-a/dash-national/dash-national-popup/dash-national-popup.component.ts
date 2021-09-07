import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';


import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';


import * as Highcharts from 'highcharts';
declare var require: any;
const More = require('highcharts/highcharts-more');
More(Highcharts);

const Exporting = require('highcharts/modules/exporting');
Exporting(Highcharts);

const ExportData = require('highcharts/modules/export-data');
ExportData(Highcharts);

const Accessibility = require('highcharts/modules/accessibility');
Accessibility(Highcharts);

const SECTOR_QUERY = gql`
query($srcSector:String!, $threatType:String!) {
  threatClient(ClientName:$srcSector, ThreatType:$threatType)
}
`;


const NAME_QUERY = gql`
query($NameStr:String!) {
    threatName(NameStr:$NameStr)
}
`;

const ACTOR_QUERY = gql`
query($ActorStr:String!) {
  threatActor(ActorStr:$ActorStr)
}
`;

const AREA_COLOR = '#2E6B9A';

@Component({
    selector: 'app-dash-national-popup',
    templateUrl: './dash-national-popup.component.html',
    styleUrls: ['./dash-national-popup.component.scss']
})
export class DashNationalPopupComponent implements OnInit, OnDestroy {
    @Input() popupType: String;
    @Input() popupName: String;

    loading: boolean;
    timestamp: String;
    querySector: String;

    posts: any;
    dataSet: any;
    private feedQuery: QueryRef<any>;
    private feed: Subscription;
    public data = [];

    // queryType:String;
    // queryName;String;


    public options: any 


    constructor(private apollo: Apollo) {
        this.options ={
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
                    text: 'Thread Number'
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
                    
                },
                showInLegend: true
            },
            series: []
        }
    }

    ngOnInit(): void {


        if (this.popupType == 'Client') {
            this.getThreatTCount('Malware');
            this.getThreatTCount('IntrusionSet');
        }
        else if (this.popupType == 'Tname') {
            this.getThreadNCount();
        }
        else if (this.popupType== 'Actor')
        {
            this.getThreatACount();

        }

    }

    getThreatACount():void{
        this.feedQuery = this.apollo.watchQuery<any>({
            query: ACTOR_QUERY,
            variables: {
                ActorStr: this.popupName,
            },
            fetchPolicy: 'network-only',
        });

        this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
            this.dataSet = JSON.parse(data['threatActor']);
            this.loading = loading;
            if (!this.loading) {
                let totalCount = 0;
                let series = {
                    type: 'area',
                    name: this.popupName,
                    data: [],
                }
                for (let obj of this.dataSet) {
                    let actor = [
                        Number(obj['d0']),
                        Number(obj['a0']),
                    ]
                    totalCount += actor[1];
                    series['data'].push(actor);
                }
                this.options['series'].push(series);
                    this.redraw();
            }
        });
    }

    getThreadNCount():void{
        this.feedQuery = this.apollo.watchQuery<any>({
            query: NAME_QUERY,
            variables: {
                NameStr: this.popupName,
            },
            fetchPolicy: 'network-only',
        });

        this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
            this.dataSet = JSON.parse(data['threatName']);
            this.loading = loading;
            if (!this.loading) {
                let totalCount = 0;
                let series = {
                    type: 'area',
                    name: this.popupName,
                    data: [],
                }
                for (let obj of this.dataSet) {
                    let actor = [
                        Number(obj['d0']),
                        Number(obj['a0']),
                    ]
                    totalCount += actor[1];
                    series['data'].push(actor);
                }
                this.options['series'].push(series);
                    this.redraw();
            }
        });
    }

    getThreatTCount(threatType: String): void {
        this.feedQuery = this.apollo.watchQuery<any>({
            query: SECTOR_QUERY,
            variables: {
                srcSector: this.popupName,
                threatType: threatType,
            },
            fetchPolicy: 'network-only',
        });

        this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
            this.dataSet = JSON.parse(data['threatClient']);
            this.loading = loading;
            if (!this.loading) {
                let totalCount = 0;
                let series = {
                    type: 'area',
                    name: threatType,
                    data: [],
                }
                for (let obj of this.dataSet) {
                    let actor = [
                        Number(obj['d0']),
                        Number(obj['a0']),
                    ]
                    totalCount += actor[1];
                    series['data'].push(actor);
                }
                this.options['series'].push(series);
                    this.redraw();
            }
        });

    }

    redraw() {
        let chartG = Highcharts.chart('popupHighChart', this.options);
        chartG.reflow();
    }

    ngOnDestroy() {
        if(this.feed != null) this.feed.unsubscribe();
    }

}
