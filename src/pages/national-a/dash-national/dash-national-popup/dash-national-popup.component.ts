import { Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';


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

const QUERY =  gql`
query($srcSector:String!, $threatType:String!) {
  threatClient(ClientName:$srcSector, ThreatType:$threatType)
}
`;

const AREA_COLOR = '#2E6B9A';

@Component({
  selector: 'app-dash-national-popup',
  templateUrl: './dash-national-popup.component.html',
  styleUrls: ['./dash-national-popup.component.scss']
})
export class DashNationalPopupComponent implements OnInit, OnDestroy {
  //@Input() queryType: string;
  //@Input() queryName: string;

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



  public options: any = {
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
        }
    },
    series: [{
        type: 'area',
        name: 'Threat Count',
        data: this.data,
        color: '#2E6B9A'
    }]
}





  constructor(private apollo: Apollo) { 

  }

  ngOnInit(): void {
    console.log('popup>>>>>>>>>>>>>>:', 'Init !');
  }

  createGraph(showType:String, showName:String):void{
    //this.queryType = showType;
    //this.queryName = showName;
  }

  ngOnDestroy() {
    //this.feed.unsubscribe();
  }


}
