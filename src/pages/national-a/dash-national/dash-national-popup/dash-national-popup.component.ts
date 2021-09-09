import { Component, OnInit, Input, OnDestroy } from '@angular/core';
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

const DES_QUERY = gql`
query($threatName:String!) {
    profile_threatName(threatName:$threatName)
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

    private dataSet: any;
    private feedQuery: QueryRef<any>;
    private feed: Subscription;

    public threatDesStr:String;
    private feedDesQuery: QueryRef<any>;
    private feedDes: Subscription;

    public options: any 

    constructor(private apollo: Apollo) {
        this.threatDesStr = 'Loading ...'; 
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
            this.threatDesStr = 'No Info from database.'
        }
        else if (this.popupType == 'Tname') {
            this.getThreadNCount();
            this.getThreatDes();
        }
        else if (this.popupType== 'Actor')
        {
            this.getThreatACount();
            this.getThreatDes();

        }
    }

    getThreatDes(): void {
        this.feedDesQuery = this.apollo.watchQuery<any>({
            query: DES_QUERY,
            variables: {
                threatName: this.popupName,
            },
            fetchPolicy: 'network-only',
        });
        this.feedDes = this.feedDesQuery.valueChanges.subscribe(({ data, loading }) => {
            //console.log('getThreatDes():', data);
            let dataSet = data['profile_threatName'];
            if (!loading) this.threatDesStr = dataSet['threat']['description'];
        });
    }

    getThreatACount(): void {
        this.feedQuery = this.apollo.watchQuery<any>({
            query: ACTOR_QUERY,
            variables: {
                ActorStr: this.popupName,
            },
            fetchPolicy: 'network-only',
        });

        this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
            this.dataSet = JSON.parse(data['threatActor']);
            if (!loading) {
                let series = {
                    type: 'area',
                    name: this.popupName,
                    data: [],
                }
                for (let obj of this.dataSet) {
                    series['data'].push([Number(obj['d0']), Number(obj['a0']),]);
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
            if (!loading) {
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
            if (!loading) {
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
        if(this.feedDes!=null) this.feedDes.unsubscribe();
    }

}
