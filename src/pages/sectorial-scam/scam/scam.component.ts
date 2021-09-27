// @ts-nocheck
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BaseHighchartsComponent } from '../../../components/base-highcharts/base-highcharts.component';

import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';

import moment from "moment";

import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.zoomhome';

import { Colors } from '../../../core/common/colors';
import { CountryCode } from '../data/countryCode.json';


//-----------------------------------------------------------------------------
// Name:        scam.components.ts
// Purpose:     
//
// Author:
// Created:     2021/09/18
// Copyright:    n.a    
// License:      n.a
//------------------------------------------------------------------------------

const Countries = require('src/assets/geojson/countries-geojson.json');
// console.log("Countries", Countries)

const QUERY = gql`
query($filter:JSON) {
  threatEvents_threatCountBySectorTimeSeries(filter:$filter) {
    name
    y
    growth
    data
  }
  threatEvents_threatCountByCountry(filter:$filter)
}
`;



//------------------------------------------------------------------------------
@Component({
  selector: 'app-scam',
  templateUrl: './scam.component.html',
  styleUrls: ['./scam.component.scss']
})

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
export class ScamComponent extends BaseHighchartsComponent implements OnInit, OnDestroy {
  private feedQuery: QueryRef<any>;
  private feed: Subscription;

  public data1: [any];
  private countryThreatCount: any;
  private map: any;
  private geojsonLayer: any;
  public chartOptions: any;
  public selectedSector: any;
  public mapLegend: [any]; 
  public showSamGraph:boolean;

  //------------------------------------------------------------------------------
  constructor(private apollo: Apollo) {
    super();
    this.chartOptions = {
      chart: {
        type: "areaspline",
      },
      colors: [Colors.WATER_COLOR],
      title: {
        text: null,
        style: { "fontSize": "12px" },
      },
      legend: {
        enabled: false,
        align: "right",
        verticalAlign: "top",
        layout: "vertical",
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
        title: { text: null },
        gridLineWidth: 0,
      },
      plotOptions: {
        series: {
          connectNulls: false
        },
        spline: {
          marker: { radius: 1 }
        },
        column: { stacking: 'normal' },
        area: {
          stacking: 'normal',
          marker: { radius: 2 }
        },
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
    };

    // this.mapLegend = [
    //   { color: '#ea8c55', max: 1, label: '1 - 200' },
    //   { color: '#c75146', max: 200, label: '200 - 500' },
    //   { color: '#ad2e24', max: 500, label: '500 - 1000' },
    //   { color: '#81171b', max: 1000, label: '1000 - 10000' },
    //   { color: '#540804', max: 10000, label: '> 10000' },
    // ];

    this.mapLegend = [
      { color: '#794a2f', max: 1, label: '1 - 200' },
      { color: '#682D27', max: 200, label: '200 - 500' },
      { color: '#81171b', max: 500, label: '500 - 1000' },
      { color: '#451012', max: 1000, label: '1000 - 10000' },
      { color: '#2E0806', max: 10000, label: '> 10000' },
    ];

    this.showSamGraph = false;
  }

  //------------------------------------------------------------------------------
  ngOnInit(): void {
    if (!this.map) this.createMap();

    this.feedQuery = this.apollo.watchQuery<any>({
      query: QUERY,
      variables: {
         "filter": {
          "type":"selector",
          "dimension":"threatType",
          "value":"Scam"
        }
      },
      // fetchPolicy: 'network-only',
      fetchPolicy: 'cache-and-network',
    });

    this.feed = this.feedQuery.valueChanges.subscribe(({ data, loading }) => {
      if (loading) return;
      let data1 = data.threatEvents_threatCountBySectorTimeSeries.filter(e => e.name !== "OTHERS");
      // console.log("data1", this.data1)

      // sum of time series to single series
      let totalCount = 0;
      let ts = data1.reduce((acc, cur) => {
        totalCount += cur.y;
        for (let obj of cur.data) {
          if (acc[obj[0]])
            acc[obj[0]] += obj[1]
          else
            acc[obj[0]] = obj[1]
        }
        return acc;
      }, {});
      // console.log("ts", ts)
      // console.log("totalCount", totalCount)
      // console.log("data", data1)

      this.data1 = data1.map(e => {
        let percentCount = (e.y / totalCount * 100).toFixed(2);
        let obj = Object.assign({ percentCount }, e);
        return obj;
      });

      let keys = Object.keys(ts).sort();
      this.chartOptions.series = {
        "name": "Scam Count",
        "data": keys.map(e => [ parseInt(e), ts[e] ])
      };
      this.updateFlag = true;

      this.countryThreatCount = data.threatEvents_threatCountByCountry.reduce((acc, cur) => {
        acc[cur.iso3] = cur.threatCount;
        return acc;
      }, {})
      this.addHeatLayer();
    });
  }

  //------------------------------------------------------------------------------
  ngOnDestroy(): void {
    if (this.feed) this.feed.unsubscribe();
  }

  //------------------------------------------------------------------------------
  // create leaflet map
  createMap(): void {
    // add map
    const zoom = 2;
    this.map = L.map("map",{
      preferCanvas: true,
      dragging: true,
      zoomControl: false,
      // center: [1.352083, 50],
      center: [0, 0],
      zoom,
      // minZoom: zoom,
      // maxZoom: zoom,
    })
    // .setView([1.352083, 50], 1.6);
    const map_darkall = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
    const map_midnight = 'https://cartocdn_{s}.global.ssl.fastly.net/base-midnight/{z}/{x}/{y}.png';
    const map_lightall = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
    L.tileLayer(map_darkall, {
      // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      // maxZoom: 12,
      // noWrap: true,
    }).addTo(this.map);

    let zoomHome = L.Control.zoomHome();
    zoomHome.setHomeCoordinates([0,0])
    zoomHome.setHomeZoom(zoom)
    zoomHome.addTo(this.map);
    this.map.on('click', this.onMapClick);

    // this.map.fitWorld().zoomIn()
  }

  //------------------------------------------------------------------------------
  onMapClick(event: any) {
    // Zoom and focus to the position.
    this.flyTo(event.latlng, 6, {
      animate: true,
      duration: 2 // in seconds
    });
  }

  //------------------------------------------------------------------------------
  onLayerClick(event: any, parentRef:any, feature:any) {
    let countryName = feature.properties.name;
    console.log('Selected country:', countryName);
    if (CountryCode.hasOwnProperty(countryName)){
      parentRef.showSamGraph = true;
      parentRef.selectedSector = {
        "name": countryName,
        "type": CountryCode[countryName],
        "data": []
      };
    }
  }

  //------------------------------------------------------------------------------
  getColor(threatCounts): void {
    const threshold = [10000, 1000, 500, 200, 1 ]
    return threatCounts > threshold[0] ? '#540804' :
           threatCounts > threshold[1] ? '#81171b' :
           threatCounts > threshold[2] ? '#ad2e24' :
           threatCounts > threshold[3] ? '#c75146' :
           threatCounts > threshold[4] ? '#ea8c55' :
            // Colors.WATER_COLOR;
            // '#FFEDA0'; 
            '#051923'
  }

  //------------------------------------------------------------------------------
  addHeatLayer(): void {
    const style = (feature) => {
      // let fillColor = MAP_COLORS[0]
      let fillColor = 'black'
      return {
        fillColor: this.getColor(feature.properties.threatCount),
        weight: 1,
        opacity: 1,
        color: '#003554',
        dashArray: '1',
        fillOpacity: 0.5
      }
    }

    let onEachFeature = (feature, layer) => {
      // console.log("onEachFeature", feature, layer);
      layer.bindTooltip(feature.properties.name + ' ['+ String(feature.properties.threatCount) +']' , { direction: 'bottom', sticky: true, className: 'tooltip' });
      // layer.bindPopup(popUp(feature), popUpStyle)
      // layer._leaflet_id = feature.id;
      layer.on({
        //     mouseover: highlightFeature,
        //     mouseout: resetHighlight,
        click: (event) => this.onLayerClick(event, this, feature)
      });
    };

    this.geojsonLayer = L.geoJSON(null, { style, onEachFeature }).addTo(this.map);
    this.geojsonLayer.clearLayers();
    Countries.features.forEach(item => {
      // console.log("test", item);
      item.properties.threatCount = this.countryThreatCount[item.id]?this.countryThreatCount[item.id]:0;
      // console.log("item", item.properties)
      this.geojsonLayer.addData(item);
    });
  }

  //------------------------------------------------------------------------------
  onSelectSector(sector): void {
    console.log("onSelectSector", sector)
    this.showSamGraph = false
    this.selectedSector = sector;
    this.selectedSector.type = 'Sector';
    
  }
}
