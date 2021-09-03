import { Component, OnInit, Input, OnDestroy} from '@angular/core';


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
query($srcSector:String!) {
  threatClient(ClientName:$srcSector)
}
`;


@Component({
  selector: 'app-dash-national-client',
  templateUrl: './dash-national-client.component.html',
  styleUrls: ['./dash-national-client.component.scss']
})

export class DashNationalClientComponent implements OnInit, OnDestroy {
  @Input() customTitle: string;
 
  iconPath; String;
  loading: boolean;
  timestamp: String;
  querySector: String;

  posts: any;
  dataSet: any;
  private feedQuery: QueryRef<any>;
  private feed: Subscription;
  public data = [];

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
        name: 'Threat Count',
        data: this.data
    }]
}

  constructor(private apollo: Apollo) {
    this.timestamp = 'Loading ...';

    this.querySector = String(this.customTitle);
  }

  ngOnInit(): void {
        // get the data 
      let iconName = this.customTitle;
      //this.iconPath = "assets/images/icons/cii/icons"+iconName[0].toUpperCase() + iconName.substr(1).toLowerCase()+".png";
      this.iconPath = "assets/images/icons/cii/icons/"+iconName+".png";
      this.feedQuery = this.apollo.watchQuery<any>({
        query: QUERY,
        variables: {
          srcSector: this.customTitle,
        },
        fetchPolicy: 'network-only',
      });
    this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
      this.dataSet = JSON.parse(data['threatClient']);
      this.loading = loading;
      console.log('Query client data :', this.dataSet);
      console.log('Query client loading:', loading);

      if (!this.loading) {
        let totalCount = 0;
        for (let obj of this.dataSet) {
          let actor = [
            Number(obj['d0']),
            Number(obj['a0']),
          ]
          totalCount += actor[1];
          this.data.push(actor);
        }
        let timestamp1 = this.data[0][0];
        let date1 = new Date(timestamp1).toLocaleDateString("en-us");
        let timestamp2 = this.data[this.data.length - 1][0];
        let date2 = new Date(timestamp2).toLocaleDateString("en-us");
        
        //this.options['subtitle']['text'] = 'From ' + date1 + ' to ' + date2;
        this.options['subtitle']['text'] = 'Threat Count : ' + String(totalCount);
        this.options['title']['text'] = this.customTitle;
        this.options['series']['0']['data'] = this.data;
        this.redraw();
      }
    });
  }

  
  redraw(){
    let chartG = Highcharts.chart(this.customTitle, this.options);
    chartG.reflow();
  }

  ngOnDestroy() {
    this.feed.unsubscribe();
  }

}
