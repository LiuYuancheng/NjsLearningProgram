import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
// import other modules: 
import { jqxGridModule } from 'jqwidgets-ng/jqxgrid';
import { GraphSiemComponent } from './graph-siem.component';
import { HelloWorld } from './hello-word/hello-world.component';
import { CytoscapeComponent } from './cytoscape/cytoscape.component';


@NgModule({
  declarations: [
    GraphSiemComponent, 
    HelloWorld,
    CytoscapeComponent,
  ],
  imports: [
    CommonModule,
    MatTabsModule,
    jqxGridModule,
    MatGridListModule,
  ]
})
export class GraphSiemModule { }
