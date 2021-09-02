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

const GV_QUERY = gql`
query {
  threatClient(ClientName:"GOVERNMENT")
}
`;

const IF_QUERY = gql`
query {
  threatClient(ClientName:"INFOCOMM")
}
`;

const MF_QUERY = gql`
query {
  threatClient(ClientName:"MANUFACTURING")
}
`;

const UT_QUERY = gql`
query {
  threatClient(ClientName:"UTILITIES")
}
`;

const TS_QUERY = gql`
query {
  threatClient(ClientName:"TRANSPORT")
}
`;
const HT_QUERY = gql`
query {
  threatClient(ClientName:"HEALTHCARE")
}
`;
const SE_QUERY = gql`
query {
  threatClient(ClientName:"SECURITY AND EMERGENCY")
}
`;
const BF_QUERY = gql`
query {
  threatClient(ClientName:"BANKING AND FINANCE")
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
        text: document.ontouchstart === undefined ?
          'from 18/10/2019 to 18/10/2019':'Threat Counts'
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
      this.iconPath = "assets/images/icons/cii/"+iconName[0].toUpperCase() + iconName.substr(1).toLowerCase()+".png";

      let querStr:any

      switch(this.customTitle){
        case "GOVERNMENT":{
          querStr = GV_QUERY;
          break;
        }
        case "INFOCOMM":{
          querStr = IF_QUERY;
          break;
        }
        case "MANUFACTURING":{
          querStr = MF_QUERY;
          break;
        }
        case "UTILITIES":{
          querStr = UT_QUERY;
          break;
        }
        case "TRANSPORT":{
          querStr = TS_QUERY;
          break;
        }
        case "HEALTHCARE":{
          querStr = HT_QUERY;
          break;
        }
        case "SECURITY AND EMERGENCY":{
          querStr = SE_QUERY;
          break;
        }
        default:{
          querStr = BF_QUERY;
        }
      }
      console.log("Client Query String", querStr)
      this.feedQuery = this.apollo.watchQuery<any>({
        query: querStr,
        variables: {
          //page: 0,
        },
        fetchPolicy: 'network-only',
        // fetchPolicy: 'cache-first',
      });
      this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
        this.dataSet = JSON.parse(data['threatClient'])['0'];
        this.loading = loading;
        console.log('Query client data :', this.dataSet);
        console.log('Query client loading:', loading);
        if (!this.loading) {
          this.timestamp = 'Data timestamp : '+this.dataSet['timestamp'];
          this.data =[]; 
          for (let obj of this.dataSet['result']) {
            let actor =[
              Number(obj['d0']),
              Number(obj['a0']),
            ]
            this.data.push(actor);
          }
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
