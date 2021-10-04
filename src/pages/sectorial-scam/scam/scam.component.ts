// @ts-nocheck
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { BaseHighchartsComponent } from '../../../components/base-highcharts/base-highcharts.component';

import { Subscription } from 'rxjs';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';

import moment from "moment";

import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.zoomhome';

import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

import { Colors } from '../../../core/common/colors';
import { CountryCode } from '../data/countryCode.json';
import { entries } from 'lodash';


//-----------------------------------------------------------------------------
// Name:        scam.components.ts
// Purpose:     
//
// Author:
// Created:     2021/09/18
// Copyright:    n.a    
// License:      n.a
//------------------------------------------------------------------------------
cytoscape.use(fcose);

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

const GRAPH_QUERY = gql`
query($countryCode:String!) {
  threatEvents_countryScamN2N(countryCode:$countryCode)
}
`;

const SEC_GRAPH_QUERY = gql`
query($sectorName:String!) {
  threatEvents_sectorScamGraph(sectorName:$sectorName)
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
export class ScamComponent extends BaseHighchartsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cygraph') cyRef: ElementRef;

  static MY_COLOR: string = Colors.COLORS[0];
  static NODE_COLOR: string = Colors.COLORS[3];
  // Top lineare graph query.
  private feedQuery: QueryRef<any>;
  private feed: Subscription;
  // pop-up window node graph query.
  private feedNgQuery: QueryRef<any>;
  private feedNg: Subscription;
  // pop-up window's sector graph query
  private feedSgQuery: QueryRef<any>;
  private feedSg: Subscription;

  public data1: [any];
  private countryThreatCount: any;
  private map: any;
  private geojsonLayer: any;
  public chartOptions: any;
  public selectedSector: any;
  public mapLegend: [any];
  public showSamGraph: boolean;
  public edgelabelStr:String;
  public graphFilterStr:String;

  // cytoscape graph parameters.
  public graphType: String;
  public showSNode: boolean;
  public cy: any = null;
  dataSet:[any];
  filterDataSet:[any];
  nodes: cytoscape.NodeDefinition[] = [];
  edges: cytoscape.EdgeDefinition[] = [];
  style: cytoscape.Stylesheet[];
  public options: any;
  public customEdgeStyle: any = [];
  protected layoutOptions: any = {
    name: 'fcose',
    nodeDimensionsIncludeLabels: true,
    nodeRepulsion: 9000,
    idealEdgeLength: 400,
    nodeSeparation: 150,
    nodeSep: 120,
    fit: true,
  }
  public filterStrExpl: String;


  //------------------------------------------------------------------------------
  constructor(private apollo: Apollo, element: ElementRef) {
    super();
    this.nativeElement = element.nativeElement;
    this.edgelabelStr = 'data(value)';
    this.graphFilterStr = '';
    //this.nativeElement = document.getElementById('cy'),
    this.chartOptions = {
      chart: { type: "areaspline"},
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

    // Old maplegend color without adding layout color on the map.
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

    this.options = {
      name: 'fcose',
      positions: undefined, // map of (node id) => (position obj); or function(node){ return somPos; }
      zoom: 1, // the zoom level to set (prob want fit = false if set)
      pan: undefined, // the pan level to set (prob want fit = false if set)
      fit: true, // whether to fit to viewport
      padding: 50, // padding on fit
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function (node, i) { return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position) { return position; } // transform a given node position. Useful for changing flow direction in discrete layouts 
    };
    this.graphType = '';
    this.showSNode = false;
    this.dataSet = [];
    this.filterDataSet = [];
    this.nodes =  []; 
    this.edges = [];
    this.filterStrExpl = '';

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

  ngAfterViewInit(): void {
    this.redraw();
  }


  //------------------------------------------------------------------------------
  ngOnDestroy(): void {
    if (this.feed) this.feed.unsubscribe();
    if (this.feedNg) this.feedNg.unsubscribe();
    if (this.feedSg) this.feedSg.unsubscribe();
  }

  //------------------------------------------------------------------------------
  buildGraph() : void {
    // Create the cytoscape graph. 
    if (this.nodes.length == 0) return;
    this.style = <cytoscape.Stylesheet[]>[
      {
        selector: 'nodes', // default node style
        style: {
          'label': 'data(id)',
          "width": "60px",
          "height": "60px",
          'background-width': '60px',
          'background-height': '60px',
          "text-wrap": "ellipsis",
          "text-max-width": "150px",
          "font-size": "10px",
          "text-valign": "bottom",
          "text-halign": "center",
          "background-color": ScamComponent.NODE_COLOR,
          "background-opacity": 1,
          "color": "#fff",
          "background-image": 'assets/images/stix/stix2-ttp-icons-png/malware-noback-flat-300-dpi.png',
        }
      },

      {
        selector: 'node:selected',
        style: {
          'label': 'data(id)',
          "background-color": "#e76f51",
          "border-width": "2px",
          "border-color": "yellow",
          "border-opacity": 0.7,
          "font-size": "10px",
          "text-outline-width": "2px",
          "text-outline-color": "#e76f51"
        }
      },
      {
        selector: 'node[type = "nodeE"]',
        style: {
          'background-image': 'assets/images/icons/ep.png',
        }
      },

      {
        selector: 'node[type = "nodeS"]',
        style: {
          'background-image': 'assets/images/icons/sn.png',
        }
      },
      // The parent we draw it as a big node.
      {
        selector: 'node[type = "enterprise"]',
        style: {
          'label': 'data(id)',
          "width": "300px",
          "height": "300px",
          'background-width': '300px',
          'background-height': '600px',
          "border-width": "5px",
          "text-wrap": "ellipsis",
          "text-max-width": "300px",
          "font-size": "30px",
          "text-valign": "bottom",
          "text-halign": "center",
          "background-color": "#262626",
          "background-opacity": 5,
          'background-image': 'assets/images/icons/transparentBG.png',
          "color": "#fff",
        }
      },

      {
        selector: 'node[type = "country"]',
        style: {
          'label': 'data(id)',
          "width": "300px",
          "height": "600px",
          'background-width': '300px',
          'background-height': '300px',
          "border-width": "5px",
          "border-color": "#81171b",
          "text-wrap": "ellipsis",
          "text-max-width": "300px",
          "font-size": "30px",
          "text-valign": "bottom",
          "text-halign": "center",
          "background-color": "#794a2f",
          "background-opacity": 5,
          'background-image': 'assets/images/icons/transparentBG.png',
          "color": "#fff",
        }
      },

      {
        selector: 'edges', // default edge style
        style: {
          'label': this.edgelabelStr,
          'width': 1,
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          "font-size": "20px",
          "color": "#fff",
        }
      },
      ...this.customEdgeStyle, // edges style with different color
      {
        selector: 'edge:selected', // default edge style
        style: {
          'label': this.edgelabelStr,
          'width': 2,
          "font-size": "30px",
          "target-arrow-color": "blue",
          "line-color": "blue",
        }
      },
    ];
    
    this.cy = cytoscape({
      container: this.cyRef.nativeElement,
      boxSelectionEnabled: false,
      elements: {
        nodes: this.nodes,
        edges: this.edges,
      },    
      style: this.style,
      layout: this.options,
      autoungrabify: true,
      wheelSensitivity: 0.25,
      minZoom: 0.1,
      maxZoom: 5,
    });

    let defaults = {
      menuRadius: function(ele){ return 60; }, // the outer radius (node center to the end of the menu) in pixels. It is added to the rendered size of the node. Can either be a number or function as in the example.
      selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
      commands: [ // an array of commands to list in the menu or a function that returns the array
        
        { 
          fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
          content: 'View Node Detail', // html/text content to be displayed in the menu
          contentStyle: {}, // css key:value pairs to set the command's css in js if you want
          select: ele => { this.showNodeDetail(ele.id()); },
          enabled: true // whether the command is selectablele
        },

        {
          content: 'Zoom To',
          select: ele => {
            // console.log("Zoom", ele.id())
            let cy = ele.cy();
            cy.zoom({ level: 1 });
            cy.center(ele);
          },
          enabled: true // whether the command is selectable
        }

      ], // function( ele ){ return [ /*...*/ ] }, // a function that returns commands or a promise of commands
      fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
      activeFillColor: 'rgba(1, 105, 217, 0.75)', // the colour used to indicate the selected command
      activePadding: 10, // additional size in pixels for the active command
      indicatorSize: 24, // the size in pixels of the pointer to the active command, will default to the node size if the node size is smaller than the indicator size, 
      separatorWidth: 3, // the empty spacing in pixels between successive commands
      spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
      adaptativeNodeSpotlightRadius: false, // specify whether the spotlight radius should adapt to the node size
      minSpotlightRadius: 15, // the minimum radius in pixels of the spotlight (ignored for the node if adaptativeNodeSpotlightRadius is enabled but still used for the edge & background)
      maxSpotlightRadius: 20, // the maximum radius in pixels of the spotlight (ignored for the node if adaptativeNodeSpotlightRadius is enabled but still used for the edge & background)
      openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
      itemColor: 'white', // the colour of text in the command's content
      itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
      zIndex: 9999, // the z-index of the ui div
      atMouse: false, // draw menu at mouse position
      outsideMenuCancel: false // if set to a number, this will cancel the command if the pointer is released outside of the spotlight, padded by the number given
    };

  }

//------------------------------------------------------------------------------
  redraw(): void {
    // Redraw the graph.
    //console.log("graph init", this.cyRef.nativeElement);
    this.buildGraph();
    this.resetLayout();
  }

  resetLayout(event?: any): void {
    if (this.cy == null) return;
    this.cy.zoom({ level: 1 });
    this.cy.pan({ x: 200, y: 200 });
    this.cy.fit()
    let layout = this.cy.elements().layout(this.layoutOptions);
    layout.run();
  }

  //------------------------------------------------------------------------------
  queryNodeGraph(countryCode: String): void {
    this.feedNgQuery = this.apollo.watchQuery<any>({
      query: GRAPH_QUERY,
      variables: { "countryCode": countryCode },
      fetchPolicy: 'network-only',
    });
    this.feedNg = this.feedNgQuery.valueChanges.subscribe(({ data, loading }) => {
      this.dataSet = data['threatEvents_countryScamN2N'];
      //console.log('Query campaign data :', dataSet);
      //console.log('Query campaign loading:', loading);
      if (loading) return;
      this.graphType = 'country';
      if(this.parseDataSet(false)) this.redraw();
    });
  }

  parseDataSet(filter:boolean):boolean{
    this.edges = [];
    this.nodes = [];
    let dataArr = filter? this.filterDataSet:this.dataSet;
    switch (this.graphType) {
      case 'country': {
        this.nodes = [{ data: { id: 'Malicious-Nodes', type: "country" } }];
        if(this.showSNode){
          for (let obj of dataArr) {
            let enterpriseIdString = obj.srcEnterpriseId ? String(obj.srcEnterpriseId) : 'undefined';
            let enprNode = { data: { id: enterpriseIdString, type: "enterprise" } }
            if (!this.nodes.includes(enprNode)) this.nodes.push(enprNode);
            this.nodes.push({ data: { id: obj.srcNodeId, type: 'nodeS', parent: enterpriseIdString } });
            this.nodes.push({ data: { id: obj.dstNodeId, type: 'ip', parent: 'Malicious-Nodes' } });
            this.edges.push({ data: { source: obj.srcNodeId, target: obj.dstNodeId, value: String(obj.count), type: "bendPoint" } });
          }
        }
        else {
          for (let obj of dataArr) {
            let enterpriseIdString = obj.srcEnterpriseId ? String(obj.srcEnterpriseId) : 'undefined';
            let enprNode = { data: { id: enterpriseIdString, type: 'nodeE' } }
            if (!this.nodes.includes(enprNode)) this.nodes.push(enprNode);
            this.nodes.push({ data: { id: obj.dstNodeId, type: 'ip', parent: 'Malicious-Nodes' } });
            this.edges.push({ data: { source: enterpriseIdString, target: obj.dstNodeId, value: String(obj.count), type: "bendPoint" } });
          }
        }
        break;
      }

      case 'sector': {
        if(this.showSNode){
          for (let obj of dataArr) {
            //Add country as parent. 
            let countryString = obj.countryCode ? String(obj.countryCode) : '[NF]';
            let ctryNode = { data: { id: countryString, type: "country" } }
            if (!this.nodes.includes(ctryNode)) this.nodes.push(ctryNode);
            let enterpriseIdString = obj.srcEnterpriseId ? String(obj.srcEnterpriseId) : 'undefined';
            let enprNode = { data: { id: enterpriseIdString, type: "enterprise" } }
            if (!this.nodes.includes(enprNode)) this.nodes.push(enprNode);
            this.nodes.push({ data: { id: obj.srcNodeId, type: 'nodeS', parent: enterpriseIdString } });
            this.nodes.push({ data: { id: obj.dstNodeId, type: 'ip', parent: countryString } });
            this.edges.push({ data: { source: obj.srcNodeId, target: obj.dstNodeId, value: String(obj.count), type: "bendPoint" } });
          }
        }
        else {
          for (let obj of dataArr) {
            //Add country as parent. 
            let countryString = obj.countryCode ? String(obj.countryCode) : '[NF]';
            let ctryNode = { data: { id: countryString, type: "country" } }
            if (!this.nodes.includes(ctryNode)) this.nodes.push(ctryNode);
            let enterpriseIdString = obj.srcEnterpriseId ? String(obj.srcEnterpriseId) : 'undefined';
            let enprNode = { data: { id: enterpriseIdString, type: "nodeE" } }
            if (!this.nodes.includes(enprNode)) this.nodes.push(enprNode);
            this.nodes.push({ data: { id: obj.dstNodeId, type: 'ip', parent: countryString } });
            this.edges.push({ data: { source: enterpriseIdString, target: obj.dstNodeId, value: String(obj.count), type: "bendPoint" } });
          }
        }
        break;
      }
      default: {
        console.log("parseDataSet: invalid graph type:", this.graphType)
        return false;
      }
    }
    return true;
  }

  querySectorGraph(sectorName: String): void {
    this.feedSgQuery = this.apollo.watchQuery<any>({
      query: SEC_GRAPH_QUERY,
      variables: { "sectorName": sectorName },
      fetchPolicy: 'network-only',
    });
    this.feedSg = this.feedSgQuery.valueChanges.subscribe(({ data, loading }) => {
      this.dataSet = data['threatEvents_sectorScamGraph'];
      //console.log('Query campaign data :', dataSet);
      //console.log('Query campaign loading:', loading);
      if (loading) return;
      this.graphType = 'sector';
      if(this.parseDataSet(false)) this.redraw();
    });

  }

  showScamCount(event:any){
    this.edgelabelStr = event.checked? 'data(value)' : '';
    this.redraw();
  }

  selectGraphType(event:any):void{
    this.showSNode = event.target.value == 'subscriber'? true: false;
    if(this.parseDataSet(false)) this.redraw();
  }

  onSubGraphFilter(input:String):void{
    let foundNum = input.match(/[+-]?\d+(\.\d+)?/g); // get the float number from the string.
    if (foundNum == null || foundNum.length == 0) return;
    let filterScore = parseInt(''+foundNum[0]);

    if (input.includes('<=')) {
        this.filterDataSet = this.dataSet.filter(e => e.count <= filterScore);
    } else if (input.includes('<')) {
      this.filterDataSet = this.dataSet.filter(e => e.count < filterScore);
    } else if (input.includes('==')) {
      this.filterDataSet = this.dataSet.filter(e => e.count == filterScore);
    } else if (input.includes('>=')) {
      this.filterDataSet = this.dataSet.filter(e => e.count >= filterScore);
    }
    else {
      this.filterDataSet = this.dataSet.filter(e => e.count > filterScore);
    }
    if(this.parseDataSet(true)) this.redraw();
  }

  selectFilterHandler(event:any):void{
    let graphFilterKey = event.target.value;
    switch (graphFilterKey) {
      case 'count':{
        this.filterStrExpl = 'Example:>=6';
        break;
      }
      default:{
        this.filterStrExpl = '';
        if(this.parseDataSet(false)) this.redraw();
      }
    }
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
    parentRef.queryNodeGraph(CountryCode[countryName]);
    parentRef.graphFilterStr = "Country [ " + countryName +" ]";
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
      layer.bindTooltip(feature.properties.name , { direction: 'bottom', sticky: true, className: 'tooltip' });
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
    this.querySectorGraph(this.selectedSector.name);
    this.graphFilterStr = "Sector [ " + this.selectedSector.name +" ]";
  }

}
