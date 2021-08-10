import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { CytoscapeComponent } from './cytoscape/cytoscape.component';
import { NodedetailComponent } from './nodedetail/nodedetail.component';

import networkDataS from './data/data_fortinet.json';
import networkDataW from './data/data_windows.json';
import networkDataF from './data/data_fortinet.json';

import { elements as elementsW } from './data/windows.json';
import { elements as elementsS } from './data/snort.json';
import { elements as elementsF } from './data/fortinet.json';
import { elements as elementsL } from './data/linked.json';

// 
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
};

// Define the data type used in jqxGrid table: 
type subGraphType = Array<{
  name: string,
  score: number,
  consequences: string[]
}>;

// basic node type
type nodeType = Array<{
  id: string,
  subgraphs: string[],
  type: string,
  geo: string[]
}>;

//
type nodeRelType = Array<{
  name:string,
  score: number,
  subgraphs: string[]
}>;

type nodePrtType = Array<{
  id: string,
  score: number,
  consequences: string[]
}>;

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
  idx: Number,
}>;

@Component({
  selector: 'app-graph-siem',
  templateUrl: './graph-siem.component.html',
  styleUrls: ['./graph-siem.component.scss']
})
export class GraphSiemComponent implements AfterViewInit, OnInit{
  @ViewChild('nodeGrid') nodeGridList: jqxGridComponent;
  @ViewChild('subGrid') subGridList: jqxGridComponent;
  @ViewChild('edgeGrid') edgeGridList: jqxGridComponent; 
  @ViewChild('cygraph') cygraph: CytoscapeComponent;
  @ViewChild('nodegraph') nodegraph: NodedetailComponent;

  title = "Graph table";
  selectedIndex = false;
  selected = new FormControl(0);

  networkdatas: networkDatas[] = networkDataS;
  networkdataw: networkDatas[] = networkDataW;
  networkdataf: networkDatas[] = networkDataF;
  
  subgrapsSelected: subGraphType = [];
  nodePrtList: nodePrtType = [];
  nodeRelList: nodeRelType = [];
  edgeRelList: edgesType = []; 

  subgrapSrc: any;
  nodePrtSrc: any;
  nodeRelSrc: any;
  edgeRelSrc: any;


  nodesDis = [];
  edgesDis = []; 

  nodesW: nodeType = [];
  edgesW: edgesType = [];


  subgrapColumns = [
		{text: 'ID', datafield: 'name', width:'50px' },
    {text: 'Score', datafield: 'score',  width:'60px'},
    {text: 'Consequences', datafield: 'consequences'},
  ];
  
  subgraphsWColumns =[
    {text: 'ID', datafield: 'id', width:'70px'},
    {text: 'Score', datafield: 'score', width:'50px'},
    {text: 'Consequences', datafield: 'consequences'}
  ];

  nodesLColums = [
    {text: 'ID', datafield: 'id', width:'100px'},
    {text: 'Type', datafield: 'type'},
    {text: 'Subgraph', datafield: 'subgraphs'},
    {text: 'Country', datafield: 'geo'},
  ];

  nodesWColumns = [
    {text: 'NodeID', datafield: 'name', width:'80px'},
    {text: 'Risk score', datafield: 'score', width:'80px'},
    {text: 'Subgraph', datafield: 'subgraphs'}
  ];

  edgesWColumns = [
		{text: 'Source', datafield: 'source', width:'100px'},
		{text: 'Target', datafield: 'target', width:'100px'},
    {text: 'Signature', datafield: 'signature', width:'200px'},
    {text: 'Gini_t_port', datafield: 'gini_t_port'},
    {text: 'Span', datafield: 'span',  width:'80px'},
    {text: 'Unique_t_port_count', datafield: 'unique_t_port_count',width:'120px'},
    {text: 'Gini_s_port', datafield: 'gini_s_port'},
    {text: 'Signature_id', datafield: 'signature_id'},
    {text: 'Unique_s_port_count', datafield: 'unique_s_port_count', width:'120px'},
    {text: 'Dispersion', datafield: 'dispersion'},
    {text: 'Final_score', datafield: 'final_score'},
    {text: 'Key', datafield: 'key',  width:'40px'},
    {text: 'Idx', datafield: 'idx'}
  ];

  nodesSrc: any;
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

   selectedgraph: string = 'windows';
   selectednodeID: String ='';
   selectedfilter: String = '';
   //nodeIDlist: String[] = [] // list to store all the nodes ID shown in the graph.
   loadProMode: String = "indeterminate";
   theCheckbox = false;

   counter: number = 1;
  //  tooltiprenderer = (element: any): void => {
  //    let id = <code>toolTipContainer${this.counter}</code>;
  //    element[0].id = id;
  //    let content = element[0].innerHTML;
  //    setTimeout(_ => jqwidgets.createInstance(<code>#${id}</code>, 'jqxTooltip', { position: 'mouse', content: content }))
  //    this.counter++;
  //  }

  //  cellhovertooltiprenderer = (element: any, pageX: number, pageY: number): void => {
	// 	setTimeout(_ => jqwidgets.createInstance('.jqx-item', 'jqxTooltip', { position: 'mouse', content: "Hello!" }));
	// };

  constructor() { }

  ngOnInit(): void {
    this.loadGraphsData();
  }

  ngAfterViewInit() {
    this.subGridList.refreshdata()
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
    else if (this.selectedgraph == 'fortinet'){  
        this.nodes = elementsF['nodes'];
        this.edges = elementsF['edges'];
    }
    else {
      this.nodes = elementsL['nodes'];
      this.edges = elementsL['edges'];
    }
    // build the subgraph table: 
    this.subgrapsSelected = [];
    for (let obj of this.nodes) {
      if(!obj['data'].hasOwnProperty('subgraphs')){
        this.subgrapsSelected.push({"name":obj['data']["id"],
                                    "score":Number(obj['data']["score"].toFixed(2)),
                                    "consequences":obj['data']["consequences"]
                                  });
      }
    }
    // set up the node list which sort by score
    this.subgrapSrc = new jqx.dataAdapter({
      localData: this.subgrapsSelected,
      sortcolumn: 'score',
      sortdirection: 'dsc',
    });
    
     this.nodePrtList.push({
       "id": "0",
       "score": 6,
       "consequences": []
     });
    //this.nodePrtList = [];
    this.nodePrtSrc = new jqx.dataAdapter({
      localData: this.nodePrtList,
    });

    
    this.nodeRelList.push({
      "name":"0",
      "score": 0 ,
      subgraphs:[]
    })
    this.nodeRelSrc = new jqx.dataAdapter({
      localData: this.nodeRelList,
    });

    this.edgeRelSrc = new jqx.dataAdapter({
      localData: [],
    });


    
    // buidl the edges table: 
    this.buildEdgesTable([]);
  }

  parentFun(nodeID:String):void{
    this.selected.setValue(1);
    //alert("parent component function.:"+nodeID.toString());
    this.selectednodeID = nodeID;
    let nodesToNP = []; // nodes shown in the 
    let edgesToNP = []; 
    let nodesNames = [nodeID,];
    this.nodeRelList = [];
    this.edgeRelList = []; 

    for (let obj of this.edges) {
      //if(this.nodeIDlist.indexOf(obj['data']['source']) !== -1 || this.nodeIDlist.indexOf(obj['data']['target']) !== -1)
      if(obj['data']['source'] == nodeID)
      {
        edgesToNP.push(obj);
        nodesNames.push(obj['data']['target']);
        this.edgeRelList.push(obj['data']);
      }
      if(obj['data']['target'] == nodeID)
      {
        edgesToNP.push(obj);
        this.edgeRelList.push(obj['data'])
        nodesNames.push(obj['data']['source']);
      }
    }

    for (let obj of this.nodes) {
      if(nodesNames.includes(obj['data']['id'])){
        nodesToNP.push(obj);
        this.nodeRelList = this.nodeRelList.concat({"name":obj['data']['id'], "score":0,"subgraphs":obj['data']['subgraphs']})
      }
    }

    // setup the subgrap table 
    let parentNames = [];
    
    for (let obj of this.nodes) {
      if (obj['data']['id'] == nodeID) {
        parentNames = parentNames.concat(obj['data']['subgraphs']);
      }
    }
    console.log("parents:", parentNames);
    


    this.nodePrtList = [] ;
    for (let obj of this.nodes) {
      if(parentNames.includes(obj['data']['id'])){
        this.nodePrtList.push({"id":obj['data']['id'], "score":obj['data']['score'], "consequences":obj['data']['consequences']});
      }
    }

    console.log("Data to node page", this.nodePrtList);
    
    //set the node page sub graph
    this.nodegraph.setCrtSubGraph(nodeID, nodesToNP, edgesToNP);
    
    // set the node page subgraph table: 
    this.nodePrtSrc = new jqx.dataAdapter({
      localData: this.nodePrtList,
    });

    this.nodeRelSrc =  new jqx.dataAdapter({
      localData: this.nodeRelList,
    });

    this.edgeRelSrc = new jqx.dataAdapter({
      localData: this.edgeRelList,
    });


    //this.subGridList.refresh();

  }

  rowdetailstemplate: any =
  {
      //rowdetails: "<div style='margin: 10px; width:250px; overflow-y: auto;'>Consquences: </div>",
      rowdetails: "<div class=\"vertical-menu\" style='width:90%; height: 250px;'> Consquences:  </div>" ,
      rowdetailsheight: 150
  };

  edgedetailstemplate: any =
  {
    rowdetails: "<div style='margin: 10px;'></div>",
    rowdetailsheight: 240
  };


  initrowdetails = (index: any, parentElement: any, gridElement: any, datarecord: any): void => {
    
    if (parentElement == null){
      return;
    }
    
    let rowdetails = parentElement.children[0];
    console.log("rowdetails", index)

    let conString = String(this.nodeGridList.getcelltext(index,'consequences')).split(',')

    const createNameValue = (name, value) => {
      let tr = document.createElement("a");
      tr.appendChild(document.createTextNode( ' - ' + name))
      return tr;
    }

    let container = document.createElement('a');
    //container.appendChild(createNameValue("consquences","")); 
    for(let conStr of conString){
      container.appendChild(createNameValue(conStr,""));
      //container.appendChild(document.createTextNode( ' - ' + conStr))
    }
    rowdetails.appendChild(container);
  }

  initedgedetails = (index: any, parentElement: any, gridElement: any, datarecord: any): void => {
    
    if (parentElement == null){
      return;
    }
    let rowdetails = parentElement.children[0];
    // console.log("rowdetails", rowdetails)

    const createNameValue = (name, value) => {
      let tr = document.createElement("tr");
      let th = document.createElement("th")
      th.setAttribute("style","text-align: right;")
      th.appendChild(document.createTextNode(name))
      tr.appendChild(th)
      let td = document.createElement("td")
      td.setAttribute("style","padding-left: 5px;")
      td.appendChild(document.createTextNode(value))
      tr.appendChild(td)
      return tr;
    }

    let container = document.createElement('table');
    container.appendChild(createNameValue('Signature :', String(this.edgeGridList.getcelltext(index,'signature'))));
    container.appendChild(createNameValue('Gini_t_port :', String(this.edgeGridList.getcelltext(index,'gini_t_port'))));
    container.appendChild(createNameValue('Span :', String(this.edgeGridList.getcelltext(index,'span'))));
    container.appendChild(createNameValue('Unique_t_port_count :', String(this.edgeGridList.getcelltext(index,'unique_t_port_count'))));
    container.appendChild(createNameValue('Gini_s_port :', String(this.edgeGridList.getcelltext(index,'gini_s_port'))));
    container.appendChild(createNameValue('Signature_id :', String(this.edgeGridList.getcelltext(index,'signature_id'))));
    container.appendChild(createNameValue('Unique_s_port_count :', String(this.edgeGridList.getcelltext(index,'unique_s_port_count'))));
    container.appendChild(createNameValue('Dispersion :', String(this.edgeGridList.getcelltext(index,'dispersion'))));
    container.appendChild(createNameValue('Final_score :', String(this.edgeGridList.getcelltext(index,'final_score'))));
    container.appendChild(createNameValue('Key :', String(this.edgeGridList.getcelltext(index,'key'))));
    rowdetails.appendChild(container);
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
     // clear the previous grid selection. 
    this.loadProMode = "determinate";
    this.cygraph.setSubgraphInfo(this.selectedgraph, '', 0, [])
  }

  filterSelHandler(event: any) {
    this.selectedfilter = event.target.value;
    console.log('filterSelHandler', this.selectedfilter);
  }

  
  selectEdgeLabel (event:any){
    let selectedLb = event.target.value;
    this.nodegraph.setEdgeLabelStr(selectedLb);
  }

  selectRow(event: any){

    let args = event.args;
    console.log("row selected", args.rowindex)

    //let value = this.nodeGridList.getselectedrowindexes();
    //console.log('selectRow', value);
    //var subgraphNames = [];
    var subgraphName = this.nodeGridList.getcelltext(args.rowindex,'name')
    var subgraphNames = [subgraphName];  
    var subgrapshScore = Number(this.nodeGridList.getcelltext(args.rowindex,'score'))
    var subgrapshCons = String(this.nodeGridList.getcelltext(args.rowindex,'consequences')).split(',')

    this.buildNodesTable(subgraphNames);
    this.buildEdgesTable(subgraphNames);
    
    this.cygraph.setSubgraphInfo(this.selectedgraph, subgraphName, subgrapshScore, subgrapshCons)

    this.cygraph.setCrtSubGraph(subgraphNames, this.nodesDis, this.edgesDis);

    this.cygraph.redraw();
  }

  selectEdgeRow(event: any){
    let args = event.args;
    console.log("row selected", args.rowindex)
    var selectEdgeIdx = this.edgeGridList.getcelltext(args.rowindex,'idx')
    this.cygraph.setCrtSelect(Number(selectEdgeIdx));
  }



  buildNodesTable(subgraphNames: string[]){
    console.log('buildNodesTable', subgraphNames)
    this.nodesDis = [];
    this.nodesW = [];
    for (let subgName of subgraphNames) {
      for (let obj of this.nodes) {
        if(obj['data'].hasOwnProperty('subgraphs') && obj['data']['subgraphs'].includes(subgName)){
          this.nodesDis.push(obj);
          if(obj['data'].hasOwnProperty("geo")){
            let ctString = obj['data']['geo'];
            if(ctString[0] == 'unknown'){
              ctString = ['']
            }else 
            {
              ctString.pop();
            }

            this.nodesW.push({"id":obj['data']["id"],
                              "subgraphs":obj['data']['subgraphs'],
                              "type":obj['data']['type'],
                              "geo":ctString});
          }
        }
      }
    }
    //
    this.nodesSrc = new jqx.dataAdapter({
      localData: this.nodesW
    });  

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
        obj['data']['span'] = obj['data']['span'] / (60 * 60 * 24);
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
