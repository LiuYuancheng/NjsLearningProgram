import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, AfterViewInit} from '@angular/core';
//import { trigger, state, style, transition, animate } from '@angular/animations';

import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import cxtmenu from 'cytoscape-cxtmenu';

import {elements as elementsW}  from '../data/windows.json' ;
import {elements as elementsS} from '../data/snort.json';
import {elements as elementsF} from '../data/fortinet.json';

// use fcose layout.
//cytoscape.use(cxtmenu);
cytoscape.use(fcose);

export interface NodeData {
  id?: String;
  value?: String;
  name?: String;
  parent?: String;
}
export interface EdgeData {  
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
  key?:Number;
}

@Component({
  selector: 'app-cytoscape',
  templateUrl: './cytoscape.component.html'
})

export class CytoscapeComponent implements OnInit, AfterViewInit {
  @ViewChild('cyvpn') cyRef: ElementRef;
  @Output("parentFun") parentFun: EventEmitter<any> = new EventEmitter();
  
  //@Input() nodes: cytoscape.NodeDefinition[];
  //@Input() edges: cytoscape.EdgeDefinition[];
  //@Input() style: cytoscape.Stylesheet[];
  //@Input() layout: cytoscape.LayoutOptions;
  
  // temporary use the simple test data
  nodes: cytoscape.NodeDefinition[] = elementsW['nodes'];
  edges: cytoscape.EdgeDefinition[] = elementsW['edges'];
  style: cytoscape.Stylesheet[];
  //cy: cytoscape.Core;
  cy: any = null;

  selectNode: NodeData; 
  selectEdge: EdgeData;
  showNode: boolean = true
  //menuState:String = 'out';

  title1 = "N ode info";
  private nativeElement: HTMLElement;
  private options: any;
  
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
          "background-opacity": 2,
          "text-outline-color": "#555",
          "text-outline-width": "2px",
          "color": "#123",
          "overlay-padding": "6px",
          "padding": "0",
          'shape': 'round-rectangle',
          //'label': 'data(id)'
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
    //
    this.selectNode = {
      id: '',
      value: '',
      name:'',
      parent: ''
    };

    this.selectEdge = {
      source:'',
      target:'',
      gini_t_port:0,
      signature: [],
      unique_t_port_count:0,
      gini_s_port:0,
      signature_id:[],
      span:0,
      unique_s_port_count:0,
      dispersion:0,
      final_score:0,
      key:0
    };

  }

  ngOnInit(): void {
    //this.redraw();
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


    //var collection = this.cy.elements('node[id == "127.0.0.1"]');
    //this.cy.remove(collection);
    // Get a new layout, which can be used to algorithmically position the nodes in the graph.
    //let layout = this.cy.layout(this.options); 
    //layout.run();

  }

  buildGraph(){
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

    //this.createContextMenu();
    let defaults = {
      menuRadius: function(ele){ return 60; }, // the outer radius (node center to the end of the menu) in pixels. It is added to the rendered size of the node. Can either be a number or function as in the example.
      selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
      commands: [ // an array of commands to list in the menu or a function that returns the array
  
        // { // example command
        //   fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
        //   content: 'View Node Deail', // html/text content to be displayed in the menu
        //   contentStyle: {}, // css key:value pairs to set the command's css in js if you want
        //   select: function(ele){ // a function to execute when the command is selected
        //     console.log( ele.id() ); // `ele` holds the reference to the active element
        //     window.open(`/#/abstraction-layer-domain?domain=${ele.id()}`, '_blank');
        //   },
        //   enabled: true // whether the command is selectable
        // },

        { 
          fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
          content: 'View Node Deail', // html/text content to be displayed in the menu
          contentStyle: {}, // css key:value pairs to set the command's css in js if you want
          select: ele => {
            this.chileFunction(ele.id());
          },
          enabled: true // whether the command is selectablele
        },

        {
          content: 'Zoom To',
          select: ele => {
            // console.log("Zoom", ele.id())
            // let pos = ele.position();
            let cy = ele.cy();
            cy.zoom({ level: 1 });
            cy.center(ele);
            //this.chileFunction(ele.id());
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

    //-------------------
  }

  chileFunction(nodeID:String){
    console.log('test', "123");
    this.parentFun.emit(nodeID);
  }


  setCrtGraph(ghNmae: String) {
    if (ghNmae == 'windows') {
      this.nodes = elementsW['nodes'];
      this.edges = elementsW['edges'];
    }
    else if (ghNmae == 'snort') {
      this.nodes = elementsS['nodes'];
      this.edges = elementsS['edges'];
    }
    else {
      this.nodes = elementsF['nodes'];
      this.edges = elementsF['edges'];
    }

    //this.redraw();
  }

  setCrtSubGraph(graphIdArr: Number[]){
    
    //this.graphIdArr.indexOf(obj['data']['source']) !== -1
    this.buildGraph();

    var graphNameArr:String[] = [];
    for (let idx of graphIdArr) {
      graphNameArr.push("subgraph"+idx.toString());
    }
    console.log("This: ", graphNameArr)
    //this.cy.nodes().filter(ele => ele.data('parent') == "subgraph1").remove();
    this.cy.nodes().filter(ele => graphNameArr.indexOf(ele.data('parent')) !== -1).remove();
    //for (let prtName of graphNameArr) {
    //  this.cy.nodes().filter(ele => ele.data('parent') == prtName).remove();
    //}

   this.cy.fit();
  }

  evtListener() {
    this.cy.one('tap', (event) => {
      var evtTarget = event.target;
      if (evtTarget.isNode()) {
        this.selectNode = {
          id: evtTarget.data('id'),
          value: evtTarget.data('value'),
          name: evtTarget.data('name'),
          parent: evtTarget.data('parent')
        };
        this.showNode = true;
        //this.menuState = 'out';
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
