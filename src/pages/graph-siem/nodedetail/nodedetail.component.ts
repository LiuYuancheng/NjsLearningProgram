import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

cytoscape.use(fcose);

export interface NodeData {
  id?: String;
  value?: String;
  name?: String;
  subgraphs?: String[];
}

@Component({
  selector: 'app-nodedetail',
  templateUrl: './nodedetail.component.html'
  //styleUrls: ['./nodedetail.component.scss']
})

export class NodedetailComponent implements OnInit, AfterViewInit {
  @ViewChild('cyvpn') cyRef: ElementRef;

  // temporary use the simple test data
  nodes: cytoscape.NodeDefinition[] = [];
  edges: cytoscape.EdgeDefinition[] = [];
  style: cytoscape.Stylesheet[];
  //cy: cytoscape.Core;
  cy: any = null;

  private nativeElement: HTMLElement;
  private options: any;
  nodeName: String;
  selectNode: NodeData; 
  edgelabelStr: string;

  protected layoutOptions: any = {
    // name: 'dagre',
    // name: 'breadthfirst',
    // name: 'cose',
    name: 'fcose',
    // name: 'klay',
    // name: 'cola',
    // name: 'cose-bilkent',
    // name: 'concentric',
    // name: this.layout,
    // fit: false,
    // quality: 'proof',
    nodeDimensionsIncludeLabels: true,
    nodeRepulsion: 9000,
    idealEdgeLength: 200,
    nodeSeparation: 50,
    nodeSep: 20,
    fit: true,
    // flow: { axis: 'y', minSeparation: 80 }
    // packComponents: false,
}


  constructor(element: ElementRef) {
    this.nativeElement = element.nativeElement;
    this.nodeName = "";
    this.edgelabelStr = "";
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
      name:'',
      subgraphs: []
    };

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void{
    this.redraw();
  }
  
  redraw() {

    this.buildGraph();
    this.cy.zoom({level:1});
    this.cy.pan({
      x: 200,
      y: 200 
    });
    this.cy.fit()
    let layout = this.cy.elements().layout(this.layoutOptions); 
    layout.run();
  }

  setlabelStr(tag:string){
    if(tag == 'score'){
      this.edgelabelStr = 'data(final_score)';
    } else if(tag == 'sig'){
      this.edgelabelStr = 'data(signature)';
    } else{
      this.edgelabelStr = '';
    }
    this.redraw();
  }

  setCrtSubGraph(subgraphNames: String, nodesDis: any[], edgesDis: any[]): void {
    if (nodesDis.length == 0 || edgesDis.length == 0) {
      this.nodeName = null;
      //this.clearGraph();
      return
    }
  
    this.nodeName = subgraphNames;
    this.nodes = nodesDis;
    this.edges = edgesDis;

    this.redraw();

    //this.buildGraph();
    //this.cy.fit();
  }


  buildGraph(){

    this.style = <cytoscape.Stylesheet[]>[
      {
        selector: 'nodes', // default node style
 /*        style: {
          "width": "20px",
          "height": "20px",
          'background-width': '20px',
          'background-height': '20px',
          "text-wrap": "ellipsis",
          "text-max-width": "100px",
          "font-size": "6px",
          "text-valign": "bottom",
          "text-halign": "center",
          "background-color": "#e9c46a",
          "background-opacity": 2,
          "text-outline-color": "#555",
          "text-outline-width": "1px",
          "color": "#FFFFFF",
          "border-color": "#33FFFC",
          "overlay-padding": "6px",
          "padding": "0",
          //'shape': 'round-rectangle',
          'background-image': 'assets/images/icons/ip.png',
          'label': 'data(id)',
        } */
        style: {
          'label': 'data(id)',
          "width": "40px",
          "height": "40px",
          'background-width': '40px',
          'background-height': '40px',
          "text-wrap": "ellipsis",
          "text-max-width": "100px",
          "font-size": "8px",
          "text-valign": "bottom",
          "text-halign": "center",
          "background-color":"#e9c46a",
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
        selector: 'node[id *= "' + this.nodeName + '"]',
        style: {
          'label': 'data(id)',
          "width": "60px",
          "height": "60px",
          "background-color": "#e76f51",
          "border-width": "2px",
          "border-color": "yellow",
          "border-opacity": 0.7,
          "font-size": "10px",
          "text-outline-color": "#e76f51"
          // "background-color": "yellow",
          // "text-outline-color": "yellow",
        }
      },

      {
        selector: 'node[type = "other"]',
        style: {
          'background-image': 'assets/images/icons/program.png',
        }
      },

      {
        selector: 'edges', // default edge style
        style: {
          'label': this.edgelabelStr,
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          "font-size": "8px",
          "color": "#FFFFFF",
        }
      },

      {
        selector: 'node[type= "bendPoint"]',
        style: {
          'width': '1.00001px',
          'height': '1.00001px'
        }
      },
      {
        selector: 'node[type = "node"]',
        style: {
          'width': '60px',
          'height': '40px',
          'content': 'data(id)',
          'font-size': 6,
          'text-valign': 'center',
          'text-halign': 'center'
        }
      },
      {
        selector: 'edge[type = "bendPoint" ]',
        style: {
          'width': 1,
          'target-arrow-shape': 'none',
          'opacity': 1
        }
      },
    ];

    this.cy = cytoscape({
      container: this.cyRef.nativeElement,
      boxSelectionEnabled: false,
      //container:document.getElementById('cy'),
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

    this.cy.on('mouseover', 'node', evt => {
      let node = evt.target;
      node.popperRef = node.popper({
        content: () => {
          let div = document.createElement('div');
          div.classList.add("popper");
          //div.innerHTML = 'Node : ' + node.id()+'<br> subgraph : [' + node.data('subgraphs')+']';
          div.innerHTML = '<p style="font-size:14px;">Node ID: ' + node.id()+'</p>'+
                          '<p style="font-size:10px;">Node Name: ' + node.id()+'</p>'+
                          '<p style="font-size:10px;">Node Geo: ' + node.data('geo')+'</p>'+
                          '<p style="font-size:10px;">Parent subgraph : [' + node.data('subgraphs')+']</p>';
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
    //this.
    this.cy.zoom({level:1});

  }


  evtListener() {
    this.cy.one('tap', (event) => {
      var evtTarget = event.target;
      if(evtTarget==null){
        return;
      }
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
