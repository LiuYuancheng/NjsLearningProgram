import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
//import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgxGraphModule} from '@swimlane/ngx-graph';
import { Layout, Edge, Node } from '@swimlane/ngx-graph';
import { DagreNodesOnlyLayout } from './customDagreNodesOnly';
import { stepRound } from './customStepCurved';

import cytoscape from 'cytoscape';

//import studentsData from './graph-siem.json';
import networkDataS from './data/data_snort.json';
import networkDataW from './data/data_windows.json';
import networkDataF from './data/data_fortinet.json';


import * as d3 from 'd3';

/*
interface Student {  
    id: Number;  
    name: String;  
    email: String;  
    gender: String;  
}  
*/

interface networkDatas {  
  source: String;  
  target: String;
  gini_t_port: Number;
  signature: String[];  
  unique_t_port_count: Number;
  gini_s_port: Number;
  signature_id: String[];
  span: Number;
  unique_s_port_count: Number;
  dispersion: Number;
  final_score: Number;
}

interface networkDatas {  
  source: String;  
  target: String;
  gini_t_port: Number;
  signature: String[];  
  unique_t_port_count: Number;
  gini_s_port: Number;
  signature_id: String[];
  span: Number;
  unique_s_port_count: Number;
  dispersion: Number;
  final_score: Number;
}

const BOX_COLOR = '#4f5d75';

@Component({
  selector: 'app-graph-siem',
  templateUrl: './graph-siem.component.html',
  styleUrls: ['./graph-siem.component.scss']
})
export class GraphSiemComponent implements OnInit, AfterViewInit {
  elements: any;
  @ViewChild('cy') cyRef: ElementRef;
  private cy: any;
  legends: any[];


  title = "Graph table";
  //students: Student[] = studentsData;
  networkdatas: networkDatas[] = networkDataS;
  networkdataw: networkDatas[] = networkDataW;
  networkdataf: networkDatas[] = networkDataF;

  curve: any = stepRound;
  layout: Layout = new DagreNodesOnlyLayout();
  links: Edge[] = [
    {
      id: 'a',
      source: 'first',
      target: 'second',
      label: 'is parent of'
    },
    {
      id: 'b',
      source: 'first',
      target: 'third',
      label: 'custom label'
    },
    {
      id: 'c',
      source: 'first',
      target: 'fourth',
      label: 'custom label'
    }
  ];
  nodes: Node[] = [
    {
      id: 'first',
      label: 'A'
    },
    {
      id: 'second',
      label: 'B'
    },
    {
      id: 'third',
      label: 'C'
    },
    {
      id: 'fourth',
      label: 'D'
    }
  ];


  constructor() {}
  ngOnInit(): void {


    this.legends = [
      { 'name': 'Org', 'color': BOX_COLOR, 'icon': 'fas fa-industry' },
      // { 'name': 'Subnet', 'color': GROUP_COLOR, 'icon': 'fas fa-ethernet' },
      { 'name': 'Site', 'color': BOX_COLOR, 'icon': 'fas fa-ethernet' },
      { 'name': 'Device', 'color': BOX_COLOR, 'icon': 'fas fa-server' },
      { 'name': 'Database', 'color': BOX_COLOR, 'icon': 'fas fa-database' },
      { 'name': 'Facility', 'color': BOX_COLOR, 'icon': 'fas fa-building' },
      { 'name': 'Website', 'color': BOX_COLOR, 'icon': 'fab fa-internet-explorer' },
    ]

  }

  ngAfterViewInit(){

    let layoutOptions = {
      // name: 'dagre',
      // name: 'breadthfirst',
      // name: 'cose',
      // name: 'fcose',
      // name: 'klay',
      // name: 'cola',
      name: 'cose-bilkent',
      // name: 'concentric',
      // name: 'elk',
      // fit: false,
      // quality: 'proof',
      nodeDimensionsIncludeLabels: true,
      // nodeRepulsion: 9000,
      nodeRepulsion: 4000,
      // idealEdgeLength: 500,
      idealEdgeLength: 100,
      // nodeSeparation: 200,
      // nodeSep: 120,
      // fit: false,
      // flow: { axis: 'y', minSeparation: 80 }
      // packComponents: false,
      concentric: node => {
        let type = node.data("type")
        switch (type) {
          case "ORG":
            return 3;
          case "SUBNET":
            return 2;
          default:
            return 1;
        }
      },
      elk: {
        algorithm: 'box',
        // algorithm: 'mrtree',
        // algorithm: 'force',
        // algorithm: 'layered',
      },
      levelWidth: nodes => {
        return 1;
      }
  }




    this.cy = cytoscape({
      container: this.cyRef.nativeElement,
      boxSelectionEnabled: false,
      autounselectify: true,
      layout: layoutOptions,
      elements: this.elements,
      style: [
        {
          selector: 'node', // default node style
          style: {
            "width": "10px",
            "height": "10px",
            "font-size": "12px",
            "text-valign": "center",
            "text-halign": "center",
            "background-color": "#555",
            "background-opacity": 1,
            // "text-outline-color": "#555",
            // "text-outline-width": "2px",
            "color": "#fff",
            // "overlay-padding": "6px",
            // "padding": "0",
            "z-index": 10000,
          }
        },
        {
          selector: 'node[type="ORG"]',
          style: {
            'background-color': BOX_COLOR,
            "width": "46px",
            "height": "46px",
          },
        },
        {
          selector: 'node[type="SUBNET"]',
          style: {
            'label': 'data(name)',
            'text-valign': 'bottom',
            'background-color': BOX_COLOR,
            // "shape": 'rectangle',
            // "width": "70px",
            // "height": "30px",
            "width": "30px",
            "height": "30px",
          },
        },
        {
          selector: 'node[type="SITE"]',
          style: {
            'label': 'data(name)',
            'text-valign': 'bottom',
            'background-color': BOX_COLOR,
            // "shape": 'rectangle',
            // "width": "70px",
            // "height": "30px",
            "width": "40px",
            "height": "40px",
          },
        },
        {
          selector: 'node[type="DEVICE"]',
          style: {
            'label': 'data(name)',
            'text-valign': 'bottom',
            // 'shape': ele => ele.cy().zoom() > 2?'ellipse':'rectangle',
            // 'shape': ele => 'rectangle',
            'background-color': BOX_COLOR,
            // 'background-color': BOX_COLOR,
            'border-width': 3,
            // 'border-color': '#ffffff22',
            // 'color': ele => ele.data("has_findings")?WARNING_COLOR:'white',
            'color': 'white',
            'border-color': ele => ele.data("has_findings")?BOX_COLOR:BOX_COLOR,
            // "width": "126px",
            "width": "40px",
            "height": "40px",
          },
        },
        {
          selector: 'node[type="DATABASE"]',
          style: {
            'label': 'data(name)',
            'text-valign': 'bottom',
            // 'shape': ele => ele.cy().zoom() > 2?'ellipse':'rectangle',
            // 'shape': ele => 'rectangle',
            'background-color': BOX_COLOR,
            // 'background-color': BOX_COLOR,
            'border-width': 3,
            // 'border-color': '#ffffff22',
            'border-color': BOX_COLOR,
            // "width": "126px",
            "width": "30px",
            "height": "30px",
          },
        },
        {
          selector: 'node[type="FACILITY"]',
          style: {
            'label': 'data(name)',
            'text-valign': 'bottom',
            // 'shape': ele => ele.cy().zoom() > 2?'ellipse':'rectangle',
            // 'shape': ele => 'rectangle',
            'background-color': BOX_COLOR,
            // 'background-color': BOX_COLOR,
            'border-width': 3,
            // 'border-color': '#ffffff22',
            'border-color': BOX_COLOR,
            // "width": "126px",
            "width": "30px",
            "height": "30px",
          },
        },
        {
          selector: 'node[type="WEBSITE"]',
          style: {
            'label': 'data(name)',
            'text-valign': 'bottom',
            // 'shape': ele => ele.cy().zoom() > 2?'ellipse':'rectangle',
            // 'shape': ele => 'rectangle',
            'background-color': BOX_COLOR,
            // 'background-color': BOX_COLOR,
            'border-width': 3,
            // 'border-color': '#ffffff22',
            'border-color': BOX_COLOR,
            // "width": "126px",
            "width": "30px",
            "height": "30px",
          },
        },

        // , ...
      ]
    });
  }

}
