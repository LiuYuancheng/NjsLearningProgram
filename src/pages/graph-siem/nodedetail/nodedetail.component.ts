import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

import {elements as elementsW}  from '../data/windows.json' ;
//import {elements as elementsS} from '../data/snort.json';
//import {elements as elementsF} from '../data/fortinet.json';

cytoscape.use(fcose);

@Component({
  selector: 'app-nodedetail',
  templateUrl: './nodedetail.component.html',
  styleUrls: ['./nodedetail.component.scss']
})

export class NodedetailComponent implements OnInit, AfterViewInit {
  @ViewChild('cyvpn') cyRef: ElementRef;

  // temporary use the simple test data
  nodes: cytoscape.NodeDefinition[] = elementsW['nodes'];
  edges: cytoscape.EdgeDefinition[] = elementsW['edges'];
  style: cytoscape.Stylesheet[];
  //cy: cytoscape.Core;
  cy: any = null;

  private nativeElement: HTMLElement;
  private options: any;

  public graph: any = {
    nodes: [
      { data: { id: 'R1', name: 'Resistor', value: 1000,  type:'node', line1:'missing', line2:0} },
      { data: { id: 'C1', name: 'Capacitor', value: 1001, type:'node', line1:0, line2:1, line3:3} },
      { data: { id: 'I1', name: 'Inductor', value: 1002, type:'node', line1:1, line2:'missing' } }
    ],
    edges: [
      { data: { id: 0, source: 'R1', target: 'C1', type: "bendPoint"} },
      { data: { id: 1, source: 'C1', target: 'I1', type: "bendPoint"} }
    ]
  };


  constructor(element: ElementRef) {
    this.nativeElement = element.nativeElement;
    this.options = {
      name: 'fcose',
      positions: undefined, // map of (node id) => (position obj); or function(node){ return somPos; }
      zoom: 1, // the zoom level to set (prob want fit = false if set)
      pan: undefined, // the pan level to set (prob want fit = false if set)
      fit: true, // whether to fit to viewport
      padding: 30, // padding on fit
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function (node, i) { return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position) { return position; } // transform a given node position. Useful for changing flow direction in discrete layouts 
    };

    this.options = {
      name: 'fcose',
      positions: undefined, // map of (node id) => (position obj); or function(node){ return somPos; }
      zoom: 1, // the zoom level to set (prob want fit = false if set)
      pan: undefined, // the pan level to set (prob want fit = false if set)
      fit: true, // whether to fit to viewport
      padding: 30, // padding on fit
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      animateFilter: function (node, i) { return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position) { return position; } // transform a given node position. Useful for changing flow direction in discrete layouts 
    };

    this.style  = <cytoscape.Stylesheet[]>[
      {
        selector: 'nodes', // default node style
        style: {
          "width": "20px",
          "height": "20px",
          'background-width': '20px',
          'background-height': '20px',
          "text-wrap": "ellipsis",
          "text-max-width": "100px",
          "font-size": "16px",
          "text-valign": "bottom",
          "text-halign": "center",
          "background-color": "#1234",
          "background-opacity": 2,
          "text-outline-color": "#555",
          "text-outline-width": "2px",
          "color": "#123",
          "overlay-padding": "6px",
          "padding": "0",
          'shape': 'round-rectangle',
          'label': 'data(id)'
        }
      },
      {
        selector:'node[name="Resistor"]',
        style:{
          'label': 'data(id)',
          'background-image':'url("")'
        }
      },
      {
        selector: 'edges', // default edge style
        style: {
          'label': 'data(source)',
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          "font-size": "8px",
          "color": "#454434",
        }
      },
      {
      selector: 'node[type= "bendPoint"]',
      style:{
        'width': '1.00001px',
        'height': '1.00001px'
      }
    },
    {
      selector:'node[type = "node"]',
      style:{
        'width': '60px',
        'height': '40px',
        'content': 'data(id)',
        'font-size': 6,
        'text-valign': 'center',
        'text-halign': 'center'
      }
    },
    {
      selector:'edge[type = "bendPoint" ]',
      style:{
        'width': 1,  
        'target-arrow-shape': 'none',
        'opacity': 1
      }
    },
    ];

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void{
    this.redraw()
  }
  
  redraw() {

    this.buildGraph();
    this.cy.pan({
      x: 200,
      y: 200 
    });
    this.cy.fit()
  }

  buildGraph(){
    this.cy = cytoscape({
      container: this.cyRef.nativeElement,
      boxSelectionEnabled: false,
      //container:document.getElementById('cy'),
      elements: {
        nodes: this.graph['nodes'],
        edges: this.graph['edges'],
      },
      //elements: this.graph,

      style: this.style,
      layout: this.options,
      autoungrabify: true,
      wheelSensitivity: 0.25,
      minZoom: 0.1,
      maxZoom: 5,
    });

    this.cy.on('mouseover', 'node', evt => {
      let node = evt.target;
      node.popperRef = node.popper({
        content: () => {
          let div = document.createElement('div');
          div.classList.add("popper");
          div.innerHTML = 'Node:' + node.id();
          document.body.appendChild(div);
          return div;
        },
        popper: {} // my popper options here
      })
    });

    this.cy.on('mouseout', 'node', evt => {
      let node = evt.target;
      if (node.popperRef) {
        node.popperRef.destroy()
        node.popperRef = null;
      }
    });

    this.cy.on('cxttapstart', 'node', evt => {
      let node = evt.target;
      if (node.popperRef) {
        node.popperRef.destroy()
        node.popperRef = null;
      }
    })



    //-------------------
  }


  evtListener() {
    this.cy.one('tap', (event) => {
      var evtTarget = event.target;
      if (evtTarget.isNode()) {
        //this.menuState = 'out';
      }
      else if (evtTarget.isEdge()) {
  
        //this.menuState = 'out';
      }
      else {
        console.log('this is the background');
        //this.menuState = 'in';
      }
    });
    

    /*this.cy.on('mousedown', (event) => {
      var evtTarget = event.target;
      console.log('here now');
      this.cy.edgehandles('drawon');
    });

    this.cy.on('mouseup', (event) =>{
      var evtTarget = event.target;
      console.log('quit now');
      this.cy.edgehandles('drawoff');
    });*/
  }





}
