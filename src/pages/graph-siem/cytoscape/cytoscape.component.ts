import { Component, OnInit, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
//import { BaseGraphComponent } from '../../../components/base-graph/base-graph.component';
import {elements} from '../data/windows.json';
import { nodes, edges } from '../data/test.json';

// use fcose layout. 
cytoscape.use(fcose);

@Component({
  selector: 'app-cytoscape',
  //template: '<div #cyvpn [className]="\'cy\'"></div>'
  templateUrl: './cytoscape.component.html'
})

export class CytoscapeComponent implements OnInit, AfterViewInit {
  @ViewChild('cyvpn') cyRef: ElementRef;
  //@Input() nodes: cytoscape.NodeDefinition[];
  //@Input() edges: cytoscape.EdgeDefinition[];
  //@Input() style: cytoscape.Stylesheet[];
  //@Input() layout: cytoscape.LayoutOptions;
  
  // temporary use the simple test data
  nodes: cytoscape.NodeDefinition[] = elements['nodes'];
  edges: cytoscape.EdgeDefinition[] = elements['edges'];
  style: cytoscape.Stylesheet[];
  cy: cytoscape.Core;

  private nativeElement: HTMLElement;
  private options: any;

  // temporary use the simple test data
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
    //super();
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
          "background-opacity": 1,
          "text-outline-color": "#555",
          "text-outline-width": "2px",
          "color": "#123",
          "overlay-padding": "6px",
          "padding": "0",
          'shape': 'round-rectangle',
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
          // 'label': 'data(relationshipType)',
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
    //this.redraw();
  }

  ngAfterViewInit(): void{
    this.redraw()
  }

  redraw() {

    this.cy = cytoscape({
      container: this.cyRef.nativeElement,
      boxSelectionEnabled: false,
      //container:document.getElementById('cy'),
      elements: {
        nodes: this.nodes,
        edges: this.edges
      },
      //elements: this.graph,

      style: this.style,
      layout: this.options,
      autoungrabify: true,
      wheelSensitivity: 0.25,
      minZoom: 0.1,
      maxZoom: 5,
    });
    this.cy.pan({
      x: 200,
      y: 200 
    });
    this.cy.fit()


    // Get a new layout, which can be used to algorithmically position the nodes in the graph.
    //let layout = this.cy.layout(this.options); 
    //layout.run();

  }

}
