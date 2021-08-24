import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import * as Highcharts from "highcharts";

import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';

const QUERY = gql`
query {
    test
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

@Component({
    selector: 'app-dash-national',
    templateUrl: './dash-national.component.html',
    styleUrls: ['./dash-national.component.scss']
})
export class DashNationalComponent implements OnInit, OnDestroy  {
    loading: boolean;
    posts: any;
    private querySubscription: Subscription;
    private feedQuery: QueryRef<any>;
    private feed: Subscription;

    private nativeElement: HTMLElement;

    public data = cdata.TimeChartData;
    public options: any = {
        chart: {
            zoomType: 'x'
        },
        title: {
            text: 'from 08/05/2019 to 20/10/2019'
        },
        subtitle: {
            text: document.ontouchstart === undefined ?
                'Drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
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


    constructor(private apollo: Apollo) { }

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
            console.log('Query data:', data);
            console.log('Query loading:', loading);

          });

        console.log('Query data:', this.posts);

        Highcharts.chart('container', this.options);
    }


    ngOnDestroy() {
        this.querySubscription.unsubscribe();
    }

}
