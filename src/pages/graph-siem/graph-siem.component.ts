import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import networkDataS from './data/data_fortinet.json';
import networkDataW from './data/data_windows.json';
import networkDataF from './data/data_fortinet.json';
import {elements} from './data/windows.json';



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

@Component({
  selector: 'app-graph-siem',
  templateUrl: './graph-siem.component.html',
  styleUrls: ['./graph-siem.component.scss']
})
export class GraphSiemComponent implements OnInit {

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


  nodes = elements['nodes'];

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




  constructor() { }

  ngOnInit(): void {
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

}
