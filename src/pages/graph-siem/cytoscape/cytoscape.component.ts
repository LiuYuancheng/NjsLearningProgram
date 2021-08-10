import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, AfterViewInit} from '@angular/core';

// import { SidebarModule } from 'primeng/sidebar';
import { PrimeNGConfig } from 'primeng/api';
import { Colors } from 'src/app/core/common/colors';

import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import cxtmenu from 'cytoscape-cxtmenu';

//-----------------------------------------------------------------------------
// Name:        cytoscapte.components.ts
// Purpose:     This module is used to generate a node-edge graph of based on the 
//              the input data of SIEM experiment. 
// Author:
// Created:     2021/07/25
// Copyright:    n.a    
// License:      n.a
//------------------------------------------------------------------------------

// use fcose layout.
cytoscape.use(fcose);

// Node data type
export interface NodeDataType {
  id?: String;
  value?: String;
  name?: String;
  geo?: String[];
  subgraphs?: String[];
}

//Edge data type 
export interface EdgeDataType {
  source?: String;
  target?: String;
  gini_t_port?: Number;
  signature?: String[];
  unique_t_port_count?: Number;
  gini_s_port?: Number;
  signature_id?: String[];
  span?: Number;
  unique_s_port_count?: Number;
  dispersion?: Number;
  final_score?: Number;
  key?: Number;
}

//-----------------------------------------------------------------------------
@Component({
  selector: 'app-cytoscape',
  templateUrl: './cytoscape.component.html',
  styles: [`
  :host ::ng-deep button {
      margin-right: .35em;
  }
`]
})

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
export class CytoscapeComponent implements OnInit, AfterViewInit {
  @ViewChild('cygraph') cyRef: ElementRef;
  @Output("parentFun") parentFun: EventEmitter<any> = new EventEmitter();
  static MY_COLOR: string = Colors.COLORS[0];
  static NODE_COLOR: string = Colors.COLORS[3];

  // define parameters : 
  nodes: cytoscape.NodeDefinition[] = []; // nodes data will shown in the graph. 
  edges: cytoscape.EdgeDefinition[] = []; // edges data will shown in the graph. 
  style: cytoscape.Stylesheet[];
  subgraphNameArr: string[];
  cy: any = null;
  
  selectNode: NodeDataType; 
  selectEdge: EdgeDataType;
  nodePopperRef: any = null;

  showNode: boolean = false
  showContry:boolean = false
  showEdge: boolean = false
  //visibleSidebar2:boolean = false;

  private nativeElement: HTMLElement;
  private options: any;

  // data show in the subgrap graph are
  subGpar:string ='';
  subGid:string =  '';
  subGscore:number = 0;
  selectEdgeIdx:Number = -1;
  subGcon:string[] = [];

  protected layoutOptions: any = {
    name: 'fcose',
    nodeDimensionsIncludeLabels: true,
    nodeRepulsion: 9000,
    idealEdgeLength: 400,
    nodeSeparation: 150,
    nodeSep: 120,
    fit: true,
}

//-----------------------------------------------------------------------------
  constructor(element: ElementRef, primengConfig: PrimeNGConfig) {
    // Init all parameters
    this.nativeElement = element.nativeElement;
    this.subgraphNameArr = [];
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

    this.selectNode = {
      id: '',
      value: '',
      name: '',
      geo: [],
      subgraphs: []
    };

    this.style  = <cytoscape.Stylesheet[]>[
      {
        selector: 'nodes', // default node style
        style: {
          'label': 'data(id)',
          "width": "60px",
          "height": "60px",
          'background-width': '60px',
          'background-height': '60px',
          "text-wrap": "ellipsis",
          "text-max-width": "100px",
          "font-size": "8px",
          "text-valign": "bottom",
          "text-halign": "center",
          "background-color": CytoscapeComponent.NODE_COLOR,
          "background-opacity": 1,
          // "text-outline-color": "#555",
          // "text-outline-width": "2px",
          "color": "#fff",
          // "overlay-padding": "6px",
          // "padding": "0",
          // 'shape': 'round-rectangle',
          "background-image": 'assets/images/icons/ip.png',
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
        selector: 'node[type = "other"]',
        style: {
          'background-image': 'assets/images/icons/ep.png',
        }
      },

      {
        selector: 'edges', // default edge style
        style: {
          // 'label': 'data(relationshipType)',
          'width': 1,
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          "font-size": "12px",
          "color": "#fff",
        }
      },

      {
        selector: 'edge:selected', // default edge style
        style: {
          'width': 2,
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          "font-size": "12px",
          "color": "yellow",
          "border-color": "yellow",
        }
      },

       {
         selector: 'edge[idx='+this.selectEdgeIdx+']', // default edge style
         style: {
           'select':true,
           'width': 2,
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          "font-size": "12px",
           "color": "yellow",
           "line-color": "yellow",
         }
      },
      // {
      //   selector: '[target = "' + this.selectNode['id'] + '"]',
      //   style: {
      //     "line-color": "#e76f51",
      //   }
      // },
    ];

    this.selectEdge = {
      source: '',
      target: '',
      gini_t_port: 0,
      signature: [],
      unique_t_port_count: 0,
      gini_s_port: 0,
      signature_id: [],
      span: 0,
      unique_s_port_count: 0,
      dispersion: 0,
      final_score: 0,
      key: 0
    };

    this.nodePopperRef = null;
  }

  //-----------------------------------------------------------------------------
  ngOnInit(): void {
    //this.redraw();
  }

  //-----------------------------------------------------------------------------
  ngAfterViewInit(): void {
    //this.redraw()
  }

  // All detail function methods (name sorted by alphabet):
  //-----------------------------------------------------------------------------
  buildGraph() : void {
    // Create the cytoscape graph. 
    this.cy = cytoscape({
      container: this.cyRef.nativeElement,
      boxSelectionEnabled: false,
      elements: {
        nodes: this.nodes,
        edges: this.edges
      },
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
          div.innerHTML = '<small>Node : ' + node.id() + '</small>';
          //+'<small>Parent subgraph : [' + node.data('subgraphs')+']</small>';
          document.body.appendChild(div);
          return div;
        },
        popper: {} // my popper options here
      });
      // below section is added for remove the popper remaining on the page bug.
      if (this.nodePopperRef) {
        this.nodePopperRef.destroy();
        this.nodePopperRef = null
      } else {
        this.nodePopperRef = node.popperRef;
      }
    });

    this.cy.on('mouseout', 'node', evt => {
      let node = evt.target;
      if (node.popperRef) {
        node.popperRef.destroy();
        node.popperRef = null;
        this.nodePopperRef = null;
      }
    });

    this.cy.on('cxttapstart', 'node', evt => {
      let node = evt.target;
      if (node.popperRef) {
        node.popperRef.destroy()
        node.popperRef = null;
        this.nodePopperRef = null;
      }
    })

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

    this.cy.cxtmenu( defaults );
  }

  //-----------------------------------------------------------------------------
  clearGraph() : void {
    // clear the current graph for redraw.
    if (this.cy != null) { this.cy.destroy(); }
  }

  //----------------------------------------------------------------------------- 
  evtListener() : void {
    // Handle the node and edge click event. 
    this.cy.one('tap', (event) => {
      var evtTarget = event.target;
      if(evtTarget==null){ return;}
      if (evtTarget.isNode()) {
        this.selectNode = {
          id: evtTarget.data('id'),
          value: evtTarget.data('value'),
          name: evtTarget.data('name'),
          geo:evtTarget.data('geo'),
          subgraphs: evtTarget.data('subgraphs')
        };
        this.showNode = true;
        if (this.selectNode['subgraphs'].includes('unknown')){
          this.showContry = false;
        }
        this.showEdge = false;
        //this.visibleSidebar2 = true;
      }
      else if (evtTarget.isEdge()) {
        this.selectEdge = {
          source: evtTarget.data('source'),
          target: evtTarget.data('target'),
          signature_id: evtTarget.data('signature_id'),
          signature: evtTarget.data('signature'),
          dispersion: evtTarget.data('dispersion'),
          span: evtTarget.data('span'),
          unique_s_port_count: evtTarget.data('unique_s_port_count'),
          gini_s_port: evtTarget.data('gini_s_port'),
          unique_t_port_count: evtTarget.data('unique_t_port_count'),
          gini_t_port: evtTarget.data('gini_t_port'),
          final_score: evtTarget.data('final_score'),
          key: evtTarget.data('key')
        };
        this.showNode = false;
        this.showEdge = true;
        //this.visibleSidebar2 = true;
      }
      else {
        console.log('this is the background');
      }
    });
  }

  //----------------------------------------------------------------------------- 
  setCrtSelect(eleIdx:Number){
    // set the current selected element. 
    this.selectEdgeIdx = eleIdx;
    //this.cy.edges.styles 
    //this.cy.;
  }

  //----------------------------------------------------------------------------- 
  setCrtSubGraph(subgraphNames: string[], nodesDis: any[], edgesDis: any[]): void {
    // update the current displayed subgraph
    if (nodesDis.length == 0 || edgesDis.length == 0) {
      this.subgraphNameArr = [];
      this.clearGraph();
      return
    }
    this.subgraphNameArr = subgraphNames;
    this.nodes = nodesDis;
    this.edges = edgesDis;
    this.redraw();
  }

  //----------------------------------------------------------------------------- 
  setSubgraphInfo(subPar: string, subId: string, subScore: number, subCon: string[]): void {
    // Set the subgraph info on the left side. 
    this.subGpar = subPar + ' [ ' + subId + ' ] ';
    this.subGscore = subScore;
    this.subGcon = subCon;
  }  

  //-----------------------------------------------------------------------------  
  showNodeDetail(nodeID:String) : void {
    // Call the parent function
    //console.log('call parent function', nodeID);
    this.parentFun.emit(nodeID);
  }

  //-----------------------------------------------------------------------------
  redraw(): void {
    // Redraw the graph.
    this.buildGraph();
    this.cy.zoom({ level: 2 });
    this.cy.pan({ x: 200, y: 200 });
    this.cy.fit()
    let layout = this.cy.elements().layout(this.layoutOptions); 
    layout.run();
  }


//-----------------------------------------------------------------------------  
  // setCrtGraph(ghNmae: String) {
  // // Currently not used. 
  //   if (ghNmae == 'windows') {
  //     this.nodes = elementsW['nodes'];
  //     this.edges = elementsW['edges'];
  //   }
  //   else if (ghNmae == 'snort') {
  //     this.nodes = elementsS['nodes'];
  //     this.edges = elementsS['edges'];
  //   }
  //   else if (ghNmae == 'fortinet') {
  //     this.nodes = elementsF['nodes'];
  //     this.edges = elementsF['edges'];
  //   }
  //   else {
  //     this.nodes = elementsL['nodes'];
  //     this.edges = elementsL['edges'];
  //   }
  // }

}
