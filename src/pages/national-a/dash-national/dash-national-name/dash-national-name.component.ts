import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import * as Highcharts from "highcharts";

import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';




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

import wordCloud from "highcharts/modules/wordcloud.js";
const Wordcloud = require('highcharts/modules/wordcloud');
Wordcloud(Highcharts);

const NAME_QUERY = gql`
query {
    threatName
}
`;


@Component({
  selector: 'app-dash-national-name',
  templateUrl: './dash-national-name.component.html',
  styleUrls: ['./dash-national-name.component.scss']
})
export class DashNationalNameComponent implements OnInit {
  public activity;
  public xData;
  public label;
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
        text: 'Threat Name'
      }
    };
  }

  ngOnInit(): void {
    this.threatNameTS = "Loading ...";
    this.nameDataSet = {};

    this.feedNameQuery = this.apollo.watchQuery<any>({
      query: NAME_QUERY,
      variables: {
        // page: this.page,
        // rowsPerPage: this.rowsPerPage,
        page: 0,
      },
      fetchPolicy: 'network-only',
      // fetchPolicy: 'cache-first',
    });
    this.fetchNameQuery();

  }

  ngOnDestroy() {
    this.queryNameSubscription.unsubscribe();
  }

  redrawNameChart(): void {

    /*   Highcharts.seriesTypes.wordcloud.prototype.deriveFontSize = function (relativeWeight){ 
        var maxFontSize = 25; 
        let rweight = Math.floor(maxFontSize * relativeWeight);
        let size = rweight < 8? 10: rweight
        return size
      }; */
    let chartG2 = Highcharts.chart('nameContainer', this.options);

    chartG2.reflow();
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
        this.threatNameTS = 'Dataset timestamp : ' + this.nameDataSet['timestamp'];
        for (let obj of this.nameDataSet) {
          //this.threatNameArr.push({ "name": obj['d0'], "count": Number(obj['a0']) });
          this.threatNameArr.push([obj['d0'], Number(obj['a0'])]);
        }
        this.options['series']['0']['data'] = this.threatNameArr;
        this.redrawNameChart();
      }

      /*             this.nameSrc = new jqx.dataAdapter({
                localData: this.threatNameArr,
                sortcolumn: 'count',
                sortdirection: 'dsc',
            }); */
    });
  }

}
