import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import * as Highcharts from "highcharts";

import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import wordCloud from "highcharts/modules/wordcloud.js";

declare var require: any;
const More = require('highcharts/highcharts-more');
More(Highcharts);

import Histogram from 'highcharts/modules/histogram-bellcurve';
Histogram(Highcharts);

const Exporting = require('highcharts/modules/exporting');
Exporting(Highcharts);

const ExportData = require('highcharts/modules/export-data');
ExportData(Highcharts);

const Accessibility = require('highcharts/modules/accessibility');
Accessibility(Highcharts);


const Wordcloud = require('highcharts/modules/wordcloud');
Wordcloud(Highcharts);

const NAME_QUERY = gql`
query($NameStr:String!, $topN:Int) {
    threatName(NameStr:$NameStr, topN:$topN)
}
`;

@Component({
  selector: 'app-dash-national-name',
  templateUrl: './dash-national-name.component.html',
  styleUrls: ['./dash-national-name.component.scss']
})
export class DashNationalNameComponent implements OnInit, OnDestroy {
  @Output("showPopup") parentFun: EventEmitter<any> = new EventEmitter();

  options: any;

  loadingName: boolean;
  nameDataSet: any;
  public threatNameTS: String;
  private queryNameSubscription: Subscription;
  private feedNameQuery: QueryRef<any>;
  private feedName: Subscription;
  public threatNameArr: any;


  constructor(private apollo: Apollo) {
    this.options = {
      accessibility: {
        screenReaderSection: {
          beforeChartFormat: '<h5>{chartTitle}</h5>' +
            '<div>{chartSubtitle}</div>' +
            '<div>{chartLongdesc}</div>' +
            '<div>{viewTableButton}</div>'
        }
      },

      plotOptions: {
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
        type: 'wordcloud',
        data: [['123', 1]],
        maxFontSize: 25,
        minFontSize: 7,
        rotation: {
          from: 0,
          to: 0,
        },
        name: 'Occurrences',
      }],
      title: {
        text: 'TOP-N Threat Names'
      }
    };
  }

  ngOnInit(): void {
    this.threatNameTS = "Loading ...";
    this.nameDataSet = {};

    this.feedNameQuery = this.apollo.watchQuery<any>({
      query: NAME_QUERY,
      variables: {
        NameStr: "topN",
      },
      fetchPolicy: 'network-only',
      // fetchPolicy: 'cache-first',
    });
    this.fetchNameQuery();

  }

  ngOnDestroy() {
    this.feedName.unsubscribe();
  }

  redrawNameChart(): void {

    /*   Highcharts.seriesTypes.wordcloud.prototype.deriveFontSize = function (relativeWeight){ 
        var maxFontSize = 25; 
        let rweight = Math.floor(maxFontSize * relativeWeight);
        let size = rweight < 8? 10: rweight
        return size
      }; */
    this.options.plotOptions.series.events.click = (event) => this.clickWords(event);
    let chartG2 = Highcharts.chart('nameContainer', this.options);

    chartG2.reflow();
  }

  clickWords(event: any) {
    //console.log("---------------", event.point['name']);
    this.parentFun.emit({ type: 'name', 'val': event.point['name'] });
  }


  selectConfigN(event: any): void {
    let inputData = String(event.target.value).split(':');
    switch (inputData[0]) {
      case 'name': {
        this.feedNameQuery = this.apollo.watchQuery<any>({
          query: NAME_QUERY,
          variables: {
            NameStr: "topN",
            topN: Number(inputData[1])
          },
          fetchPolicy: 'network-only',
          // fetchPolicy: 'cache-first',
        });
        this.fetchNameQuery();
        break;
      }
      default: {
        console.log("input not valid");
      }
    }
  }


  fetchNameQuery(): void {
    this.feedName = this.feedNameQuery.valueChanges.subscribe(({ data, loading }) => {
      // console.log("threatEvents_list", this.threatEvents_list)
      this.nameDataSet = JSON.parse(data['threatName'])['0'];
      this.loadingName = loading;
      console.log('Query name 0:', this.nameDataSet);
      //console.log('Query data 1:', darrary[1]);
      console.log('Query name loading:', loading);
      this.threatNameArr = [];
      if (!this.loadingName) {
        //this.threatNameTS = 'Dataset timestamp : ' + this.nameDataSet['timestamp'];
        this.threatNameTS = 'Chart Display Config : '
        for (let obj of this.nameDataSet) {
          //this.threatNameArr.push({ "name": obj['d0'], "count": Number(obj['a0']) });
          this.threatNameArr.push([obj['d0'], Number(obj['a0'])]);
        }
        this.options['series']['0']['data'] = this.threatNameArr;
        this.redrawNameChart();
      }
    });
  }

}
