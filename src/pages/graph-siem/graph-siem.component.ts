import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import {FormControl} from '@angular/forms';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { CytoscapeComponent } from './cytoscape/cytoscape.component';
import { NodedetailComponent } from './nodedetail/nodedetail.component';

import networkDataS from './data/data_fortinet.json';
import networkDataW from './data/data_windows.json';
import networkDataF from './data/data_fortinet.json';
import {elements as elementsW}  from './data/windows.json' ;
import {elements as elementsS} from './data/snort.json';
import {elements as elementsF} from './data/fortinet.json';

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

type subGraphType = Array<{name: string, score:number}>;

type edgesType = Array<{
  source: String,
  target: String,
  gini_t_port: Number,
  signature: String[],  
  unique_t_port_count: Number,
  gini_s_port: Number,
  signature_id: String[],
  span: Number,
  unique_s_port_count: Number,
  dispersion: Number,
  final_score: Number,
  key: Number,
}>; 

@Component({
  selector: 'app-graph-siem',
  templateUrl: './graph-siem.component.html',
  styleUrls: ['./graph-siem.component.scss']
})
export class GraphSiemComponent implements OnInit {
  @ViewChild('nodeGrid') nodeGridList: jqxGridComponent;
  @ViewChild('cygraph') cygraph: CytoscapeComponent;
  @ViewChild('nodegraph') nodegraph: NodedetailComponent;

  title = "Graph table";
  selectedIndex = false;
  selected = new FormControl(0);

  //students: Student[] = studentsData;
  networkdatas: networkDatas[] = networkDataS;
  networkdataw: networkDatas[] = networkDataW;
  networkdataf: networkDatas[] = networkDataF;
  
  subgrapsSelected: subGraphType = [];

  subgrapColumns = [
		{text: 'SubGraphName', datafield: 'name'},
    {text: 'Score', datafield: 'score'}
  ];
  subgrapSrc: any;
  
  nodesDis = [];
  edgesDis = []; 

  edgesW: edgesType = [];

  edgesWColumns = [
		{text: 'Source', datafield: 'source'},
		{text: 'Target', datafield: 'target'},
    {text: 'Gini_t_port', datafield: 'gini_t_port'},
    {text: 'Signature', datafield: 'signature'},
    {text: 'Span', datafield: 'span'},
    {text: 'Unique_t_port_count', datafield: 'unique_t_port_count'},
    {text: 'Gini_s_port', datafield: 'gini_s_port'},
    {text: 'Signature_id', datafield: 'signature_id'},
    {text: 'Unique_s_port_count', datafield: 'unique_s_port_count'},
    {text: 'Dispersion', datafield: 'dispersion'},
    {text: 'Final_score', datafield: 'final_score'},
    {text: 'Key', datafield: 'key'}
  ];

  edgesSrc: any;

  nodes = elementsW['nodes'];
  edges = elementsW['edges'];

  columns = [
		{text: 'Id', datafield: 'id'},
		{text: 'Name', datafield: 'name'}
  ];
 
  source = new jqx.dataAdapter({
		localData: [
		  {id: 1, name: 'Hydrogen'},
		  {id: 2, name: 'Helium'},
		  {id: 3, name: 'Lithium'},
		  {id: 4, name: 'Beryllium'},
		  {id: 5, name: 'Boron'},
		  {id: 6, name: 'Carbon'},
		  {id: 7, name: 'Nitrogen'},
		  {id: 8, name: 'Oxygen'},
		  {id: 9, name: 'Fluorine'},
		  {id: 10, name: 'Neon'},
		  {id: 11, name: 'Sodium'},
		  {id: 12, name: 'Magnesium'},
		  {id: 13, name: 'Aluminum'},
		  {id: 14, name: 'Silicon'},
		  {id: 15, name: 'Phosphorus'},
		  {id: 16, name: 'Sulfur'},
		  {id: 17, name: 'Chlorine'},
		  {id: 18, name: 'Argon'},
		  {id: 19, name: 'Potassium'},
		  {id: 20, name: 'Calcium'}
		]
	 });

   selectedgraph: String = 'windows';
   //nodeIDlist: String[] = [] // list to store all the nodes ID shown in the graph.
   loadProMode: String = "indeterminate";

  constructor() { }

  ngOnInit(): void {
    this.loadGraphsData();
  }

  loadGraphsData():void{
    // load subgraphs data based on user's selection:  
    if(this.selectedgraph == 'windows'){   
      this.nodes = elementsW['nodes'];
      this.edges = elementsW['edges'];
    }
    else  if(this.selectedgraph == 'snort'){   
      this.nodes = elementsS['nodes'];
      this.edges = elementsS['edges'];
    }
    else{  
        this.nodes = elementsF['nodes'];
        this.edges = elementsF['edges'];
    }
    // build the subgraph table: 
    this.subgrapsSelected = [];
    for (let obj of this.nodes) {
      if(!obj['data'].hasOwnProperty('subgraphs')){
        this.subgrapsSelected.push({"name":obj['data']["id"], "score":obj['data']["score"]});
      }
    }
    this.subgrapSrc = new jqx.dataAdapter({
      localData: this.subgrapsSelected
    });
    // buidl the edges table: 
    this.buildEdgesTable([]);
  }


  parentFun(nodeID:String):void{
    this.selected.setValue(1);
    //alert("parent component function.:"+nodeID.toString());
  }



  selectChangeHandler (event: any) {
    //update the ui
    this.loadProMode = "indeterminate"; 
    this.selectedgraph = event.target.value;
    this.loadGraphsData();

    //this.loadEdgesData();
    // update the siem graph.
    this.cygraph.clearGraph();
    //this.cygraph.setCrtGraph(this.selectedgraph);
    //this.cygraph.redraw();

    this.loadProMode = "determinate"; 
  }

  selectRow(event: any){

    let value = this.nodeGridList.getselectedrowindexes();
    var subgraphNames = [];  
    for(let idx of value){
      subgraphNames.push(this.nodeGridList.getcelltext(idx,'name'));
    }

    this.buildNodesTable(subgraphNames);
    this.buildEdgesTable(subgraphNames);
    this.cygraph.setCrtSubGraph(subgraphNames, this.nodesDis, this.edgesDis);
  }

  buildNodesTable(subgraphNames: string[]){
    this.nodesDis = [];
    for (let subgName of subgraphNames) {
      for (let obj of this.nodes) {
        if(obj['data'].hasOwnProperty('subgraphs') && obj['data']['subgraphs'].includes(subgName)){
          this.nodesDis.push(obj);
        }
      }
    }
  }

  buildEdgesTable(subgraphNames: string[]){
    // find all nodes's id belongs to the sub graph list: 
    let nodeIDlist = []; // Clear the node list
    for (let subgName of subgraphNames) {
      for (let obj of this.nodes) {
        if(obj['data'].hasOwnProperty('subgraphs') && obj['data']['subgraphs'].includes(subgName)){
          nodeIDlist.push(obj['data']['id']);
        }
      }
    }

    // find all edges src+tgt nodes are all in the subgraph list.
    this.edgesDis = [];
    this.edgesW = [];


    for (let obj of this.edges) {
      //if(this.nodeIDlist.indexOf(obj['data']['source']) !== -1 || this.nodeIDlist.indexOf(obj['data']['target']) !== -1)
      
      
      if(nodeIDlist.includes(obj['data']['source']) && nodeIDlist.includes(obj['data']['target']))
      {
        this.edgesDis.push(obj);
        this.edgesW.push(obj['data']);
      }
    }
    
    // build the Edges table
    this.edgesSrc = new jqx.dataAdapter({
      localData: this.edgesW
    });  
  }

}
