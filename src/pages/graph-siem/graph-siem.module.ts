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
import { FlexLayoutModule } from '@angular/flex-layout';
import { HelloWorld } from './hello-word/hello-world.component';
import { CytoscapeComponent } from './cytoscape/cytoscape.component';
import { CardModule } from 'primeng/card';
import { NodedetailComponent } from './nodedetail/nodedetail.component';

//import cytoscape from 'cytoscape';
//import cxtmenu from 'cytoscape-cxtmenu';
//cytoscape.use(cxtmenu);

@NgModule({
  declarations: [
    HelloWorld,
    CytoscapeComponent,
    GraphSiemComponent,
    NodedetailComponent, 
  ],
  imports: [
    CommonModule,
    MatTabsModule,
    CardModule,
    jqxGridModule,
    MatGridListModule,
    FlexLayoutModule
  ]
})
export class GraphSiemModule { }
