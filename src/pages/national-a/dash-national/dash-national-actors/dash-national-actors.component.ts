import { Component, OnInit, EventEmitter, Output, OnDestroy} from '@angular/core';


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

const ACTOR_QUERY = gql`
query($ActorStr:String!) {
  threatActor(ActorStr:$ActorStr)
}
`;

@Component({
  selector: 'app-dash-national-actors',
  templateUrl: './dash-national-actors.component.html',
  styleUrls: ['./dash-national-actors.component.scss']
})
export class DashNationalActorsComponent implements OnInit, OnDestroy {
  @Output("showPopup") parentFun: EventEmitter<any> = new EventEmitter();
  loading: boolean;
  timestamp: String;
  posts: any;
  dataSet: any;
  private feedQuery: QueryRef<any>;
  private feed: Subscription;


  public options: any =  {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
    },
    title: {
        text: 'Top Threat Actors'
    },
    tooltip: {
        //pointFormat: '{series.name}: <b>{point.y:.1f}</b>'
        pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    // accessibility: {
    //     point: {
    //         valueSuffix: '%'
    //     }
    // },

    
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                //format: '<b>{point.name}</b>: {point.y:.1f}'
                format: '<b>{point.name}</b>: {point.percentage:.2f}%'
            },
            showInLegend: true
        },
        series: {
          cursor: 'pointer',
          events: {
              click: function (event) {
                  alert(
                      'Shift: ' + String(this.data[0])
                  );
              }
          }
      }
    },
    series: [{
      name: 'Brands',
      colorByPoint: true,
      data: []
    }]
}

  constructor(private apollo: Apollo) {
    this.loading = true;
    this.timestamp = 'loading...';

    this.dataSet = {};
  }

  ngOnInit(): void {

    // get the data 
    this.feedQuery = this.apollo.watchQuery<any>({
      query: ACTOR_QUERY,
      variables: {
        //page: 0,
        ActorStr: "topN",
      },
      fetchPolicy: 'network-only',
      // fetchPolicy: 'cache-first',
    });

    // the below part is asynchronous operation, a subthread will be started. 
    this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
      this.dataSet = JSON.parse(data['threatActor'])['0'];
      this.loading = loading;
      console.log('Query data 0:', this.dataSet);
      console.log('Query loading:', loading);
      if (!this.loading) {
        this.timestamp = 'Dataset timestamp : '+this.dataSet['timestamp'];
        let data =[]; 
        for (let obj of this.dataSet['result']) {
          let actor = {
            name: obj['d0'],
            y: obj['a0'],
            //sliced: true,
            //selected: true
          }
          data.push(actor);
        }
        this.options['series']['0']['data'] = data;
      }
      this.redraw();
    });

    this.redraw();
  }

  redraw(){
    this.options.plotOptions.series.events.click = (event) => this.clickBars(event);
    let chartG = Highcharts.chart('actorPieChart', this.options);
    chartG.reflow();
  }


  clickBars(event:any){
    console.log("---------------", event.point['name']);
    //this.parentFun.emit(event.point['name']);
    this.parentFun.emit({'type':'actor', 'val':event.point['name']});
  }

  ngOnDestroy() {
    this.feed.unsubscribe();
  }

}
