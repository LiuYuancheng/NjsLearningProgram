//import { Component, OnInit } from '@angular/core';

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataSet } from 'vis-data';
import { Network } from 'vis-network';
import studentsData from './graph-siem.json';


interface Student {  
    id: Number;  
    name: String;  
    email: String;  
    gender: String;  
}  
    

@Component({
  selector: 'app-graph-siem',
  templateUrl: './graph-siem.component.html',
  styleUrls: ['./graph-siem.component.scss']
})
export class GraphSiemComponent implements OnInit {

  students: Student[] = studentsData;
  constructor() {}

  ngOnInit(): void {
  }

}
