import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { CytoscapeComponent } from './cytoscape/cytoscape.component';

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

type subGraphType = Array<{id: number, name: string}>;
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

  title = "Graph table";
  //students: Student[] = studentsData;
  networkdatas: networkDatas[] = networkDataS;
  networkdataw: networkDatas[] = networkDataW;
  networkdataf: networkDatas[] = networkDataF;
  
  subgrapW: subGraphType = [];
  subgrapColumns = [
		{text: 'Id', datafield: 'id'},
		{text: 'SubGraphName', datafield: 'name'}
  ];
  subgrapSrc: any;
  
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

  constructor() { }

  ngOnInit(): void {
    this.loadNodesData();
    this.loadEdgesData();
  }

  loadNodesData(){
    
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
    this.subgrapW = [];
    var idxCount = 0 ;
    for (let obj of this.nodes) {
      if(!obj['data'].hasOwnProperty('parent')){
        this.subgrapW.push({"id": idxCount,"name":obj['data']["id"]});
        console.log(idxCount);
        idxCount += 1;
      }
    }
    this.subgrapSrc = new jqx.dataAdapter({
      localData: this.subgrapW
    });

  }

  loadEdgesData() {
    this.edgesW = [];
    for (let obj of this.edges) {
      this.edgesW.push(obj['data']);
    }

    this.edgesSrc = new jqx.dataAdapter({
      localData: this.edgesW
    });
  }

  selectChangeHandler (event: any) {
    //update the ui
    this.selectedgraph = event.target.value;
    this.loadNodesData();
    this.loadEdgesData();
    this.cygraph.setCrtGraph(this.selectedgraph);
    this.cygraph.redraw();
  }

  selectRow(event: any){
    var rowindexes = [];
    rowindexes = this.nodeGridList.getselectedrowindexes();
    console.log("rowindexes", rowindexes);

  }
}
