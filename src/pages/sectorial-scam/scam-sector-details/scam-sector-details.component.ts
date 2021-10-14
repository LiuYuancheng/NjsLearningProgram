// @ts-nocheck
import { Component, OnInit, OnDestroy, OnChanges, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import * as d3 from 'd3';
import moment from "moment";

import { BaseHighchartsComponent } from '../../../components/base-highcharts/base-highcharts.component';
import { Colors} from '../../../core/common/colors';

//-----------------------------------------------------------------------------
// Name:        scam-sector-detail.components.ts
// Purpose:     create data chart shown in the pop-up dialog.
//
// Author:      Liu Yuancheng
// Created:     2021/09/22
// Copyright:    n.a    
// License:      n.a
//------------------------------------------------------------------------------

const SECTOR_QUERY = gql`
query($filter:JSON, $sector:String!) {
  threatEvents_sectorScamDetails(filter:$filter, sector:$sector)
}
`;

const COUNTRY_SEC_QUERY = gql`
query($countryCode:String!) {
  threatEvents_sectorScamCount(countryCode:$countryCode)
}
`;

const COUNTRY_CAM_QUERY = gql`
query($countryCode:String!) {
  threatEvents_campaignScamCount(countryCode:$countryCode)
}
`;

const COUNTRY_COUNT_QUERY = gql`
query($countryCode:String!) {
  threatEvents_countryScamCount(countryCode:$countryCode)
}
`;
//------------------------------------------------------------------------------
@Component({
  selector: 'app-scam-sector-details',
  templateUrl: './scam-sector-details.component.html',
  styleUrls: ['./scam-sector-details.component.scss']
})

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
export class ScamSectorDetailsComponent extends BaseHighchartsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() sector: any;

  private feedQuery: QueryRef<any>;
  private feed: Subscription;

  private feedCmQuery: QueryRef<any>;
  private feedCm: Subscription;

  private feedCtQuery: QueryRef<any>;
  private feedCt: Subscription;

  public countries: [any];
  public campaigns: [any];
  public campaignsInfo: any = {};
  public campaignsInfoArray: [any] = [];
  public activeIndex: [number] = [0]

  public updateFlag1:boolean;
  public updateFlag2:boolean;
  public updateFlag3:boolean;

  public chartOptions1: any;
  public chartOptions2: any;
  public chartOptions3: any;

  //------------------------------------------------------------------------------
  constructor(private apollo: Apollo) {
    super();
    this.updateFlag1 = false;
    this.updateFlag2 = false;
    this.updateFlag3 = false;

    this.chartOptions1 = {
      chart: { type: "areaspline", },
      // colors: [ Colors.WATER_COLOR ],
      title: {
        text: "Threat Count",
        text: null,
        // floating: true,
        // style: { "fontSize": "16px" },
        style: { "fontSize": "12px" },
      },
      legend: {
        enabled: true,
        // align: "right",
        // verticalAlign: "top",
        // layout: "vertical",
      },
      xAxis: {
        type: 'datetime',
        events: {
          afterSetExtremes: evt => {
            // console.log("afterSetExtremes", evt.min, evt.max)
            // setTimes(evt)
          }        
        }
      },
      yAxis: {
        // type: 'logarithmic',
        title: {
          // text: "Threat Count"
          text: null,
        },
        gridLineWidth: 0,
      },
      plotOptions: {
        series: {
            connectNulls: false,
            showInLegend: true,
        },
        spline: {
          marker: {
            radius: 1,
          }
        },
        column: {
          stacking: 'normal'
        },
        area: {
            stacking: 'normal',
            marker: { radius: 2, }
        },
        trendline: {
          marker: {
            radius: 0,
          }
        },
        sma: {
          marker: {
            radius: 0,
          }
        }
      },
      series: [],
      rangeSelector: {
        buttons: [{
          type: 'hour',
          count: 12,
          text: '12h'
        }, {
          type: 'day',
          count: 1,
          text: '1d'
        }, {
          type: 'day',
          count: 2,
          text: '2d'
        }, {
          type: 'all',
          count: 1,
          text: 'All'
        }],
        selected: 3,
        inputEnabled: false
      },
    }; // chartOptions

    this.chartOptions2 = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        exporting: {
          enabled: false,
        }
      },
      title: {
        text: "Country Breakdown",
        style: { "fontSize": "12px" },
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y}</b>'
        // valueDecimals: 2,
        // valueSuffix: '%',
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            distance: 10,
            format: '<b>{point.name}</b>: {point.percentage:.1f}% '
          },
          showInLegend: true
        }
      },
      series: [],      
    } // chartOptions2

    this.chartOptions3 = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        exporting: {
          enabled: false,
        }
      },
      title: {
        text: "Campaign Breakdown",
        style: { "fontSize": "12px" },
      },
      legend: {
        enabled: true,
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y}</b>'
        // valueDecimals: 2,
        // valueSuffix: '%',
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            distance: 10,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
          },
          showInLegend: true
        }
      },
      series: [],      
    } // chartOptions3

  }

  //------------------------------------------------------------------------------
  ngOnInit(): void {
    // read campaign data
    let p1 = d3.json('assets/data/scams/scam_campaign_1a.json');
    let p4 = d3.json('assets/data/scams/scam_campaign_4a.json');
    let p5 = d3.json('assets/data/scams/scam_campaign_5a.json');
    let p7 = d3.json('assets/data/scams/scam_campaign_7a.json');
    Promise.all([p1,p4,p5,p7]).then(values => {
      this.campaignsInfo["scam_campaign_1"] = values[0];
      this.campaignsInfo["scam_campaign_4"] = values[1];
      this.campaignsInfo["scam_campaign_5"] = values[2];
      this.campaignsInfo["scam_campaign_7"] = values[3];
      // console.log("campaignsInfo", this.campaignsInfo)
      this.campaignsInfoArray = Object.values(this.campaignsInfo);
      // console.log("campaignsInfoArray", this.campaignsInfoArray)
    })
  }

  //------------------------------------------------------------------------------
  ngOnChanges(): void {
    if (!this.sector) return;
    console.log("sector", this.sector)
    console.log("sector type:", this.sector.type)
    if (this.sector.type == 'Sector') {
      this.buildSectorPopup();
    }
    else {
      this.buildCountryPopup(String(this.sector.type));
    }
  }

  //------------------------------------------------------------------------------
  ngOnDestroy(): void {
    if(this.feed) this.feed.unsubscribe();
    if(this.feedCm) this.feedCm.unsubscribe();
    if(this.feedCt) this.feedCt.unsubscribe();
  }

  // All detail function methods (name sorted by alphabet):
  //------------------------------------------------------------------------------
  buildCountryPopup(countryCode:String):void{
    this.feedQuery = this.apollo.watchQuery<any>({
      query: COUNTRY_SEC_QUERY,
      variables: {
        "countryCode": countryCode
      },
      fetchPolicy: 'network-only',
      // fetchPolicy: 'cache-and-network',
    });

    this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
      let dataSet = data['threatEvents_sectorScamCount'];
      //console.log('Query actor data :', dataSet);
      //console.log('Query actor loading:', loading);
      if (!loading) {
        let dataArr = [];
        for (let obj of dataSet) {
          if (obj['sectorStr'] == null) continue;
          dataArr.push({ name: obj['sectorStr'], y: obj['count'] });
        }
        this.chartOptions2.title.text = "Sector Breakdown";
        this.chartOptions2.series = [{ name: "Threat Count", colorByPoint: true, data: dataArr }];
        this.updateFlag2 = true;
      }
    });

    this.feedCmQuery = this.apollo.watchQuery<any>({
      query: COUNTRY_CAM_QUERY,
      variables: {
        "countryCode": countryCode
      },
      fetchPolicy: 'network-only',
      // fetchPolicy: 'cache-and-network',
    });

    this.feedCm = this.feedCmQuery.valueChanges.subscribe(({ data, loading }) => {
      let dataSet = data['threatEvents_campaignScamCount'][0];
      //console.log('Query campaign data :', dataSet);
      //console.log('Query campaign loading:', loading);
      if (loading) return;
      let dataArr = [];
      for (let obj of dataSet) {
        dataArr.push({ name: this.campaignsInfo[obj['campaignId']].shortTitle, y: obj['count'] });
      }
      //console.log('Query campaign loading:', dataArr);
      //this.chartOptions2.title.text = "Sector Breakdown";
      this.chartOptions3.series = [{ name: "Threat Count", colorByPoint: true, data: dataArr }];
      this.updateFlag3 = true;
    });

    this.feedCtQuery = this.apollo.watchQuery<any>({
      query: COUNTRY_COUNT_QUERY,
      variables: {
        "countryCode": countryCode
      },
      fetchPolicy: 'network-only',
      // fetchPolicy: 'cache-and-network',
    });

    this.feedCt = this.feedCtQuery.valueChanges.subscribe(({ data, loading }) => {
      let countDataSet = data['threatEvents_countryScamCount'];
      //console.log('Query actor data :', dataSet);
      //console.log('Query actor loading:', loading);
      let countdata = [];
      if (loading) return;
      for (let obj of countDataSet) {
        countdata.push([obj["timestamp"], obj["count"]]);
      }
      this.chartOptions1.series = [
        {
          "name": "Threat Count",
          "data": countdata,
          "type": "column",
          "step": true,
          "id": "threatCount",
          "name": "Threat Count",
          "color": "#073b4c",
        },
        {
          "type": "trendline",
          "linkedTo": "threatCount",
          "color": "#d9ed92",
        },
        {
          "type": "sma",
          "linkedTo": "threatCount",
          "color": "#f2cc8f",
          "params": { period: 10, }
        }
      ];
      this.updateFlag1 = true;
    });
  }

  //------------------------------------------------------------------------------
  buildSectorPopup(): void{
    this.activeIndex = [0];
    this.chartOptions1.series = [
      {
        // ...this.sector,
        "name": "Threat Count",
        "data": [ ...this.sector.data ],
        "type": "column",
        "step": true,
        // "lineWidth": 0,
        "id": "threatCount",
        "name": "Threat Count",
        // "color": Colors.WATER_COLOR,
        "color": "#073b4c",
      },
      {
        "type": "trendline",
        "linkedTo": "threatCount",
        "color": "#d9ed92",
      },
      {
        "type": "sma",
        "linkedTo": "threatCount",
        "color": "#f2cc8f",
        "params": {
          period: 10,
        }
      }
    ];
    this.updateFlag1 = true;

    this.feedQuery = this.apollo.watchQuery<any>({
      query: SECTOR_QUERY,
      variables: {
        "filter": {
          "type":"selector",
          "dimension":"threatType",
          "value":"Scam"
        },
        "sector": this.sector.name,
      },
      fetchPolicy: 'network-only',
      // fetchPolicy: 'cache-and-network',
    });

    this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
      if (loading) return;
      let data1 = data.threatEvents_sectorScamDetails;
      // console.log("data1", data1)
      this.countries = data1.countries;
      this.campaigns = data1.campaigns;
      let totalCount = this.countries.reduce((acc, cur) => {
        acc += cur.threatCount;
        return acc;
      }, 0);

      // make pie chart for countries
      let pieData = this.countries.map(e => ({
        name: e.country,
        // name: e.iso2,
        // y: e.threatCount / totalCount * 100,
        y: e.threatCount,
      }));
      // console.log("pieData", pieData)
      this.chartOptions2.title.text = "Country Breakdown";
      this.chartOptions2.series = [{ name:"Threat Count", colorByPoint: true, data: pieData }];
      this.updateFlag2 = true;

      // make pie chart by campaign
      let pieData2 = this.campaigns.map(e => ({
        name: this.campaignsInfo[e.campaignId].shortTitle,
        y: e.threatCount,
      }));
      this.chartOptions3.series = [{ name:"Threat Count", colorByPoint: true, data: pieData2 }];
      this.updateFlag3 = true;
    });
  }

  //------------------------------------------------------------------------------
  showLegend(event:any, pTag:String){
    switch(pTag){
      case 'P1':{
        this.chartOptions2.legend.enabled = event.checked;
        this.updateFlag2 = true;
        break;
      }
      case 'P2':{
        this.chartOptions3.legend.enabled = event.checked;
        this.updateFlag3 = true;
        break;
      }
      default:{
        console.log("Invalid input p tag:", pTag)
      }
    }
  }

}
