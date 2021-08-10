import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar'
import {MatInputModule} from '@angular/material/input';



// import other modules: 
import { jqxGridModule } from 'jqwidgets-ng/jqxgrid';

import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';


import { FlexLayoutModule } from '@angular/flex-layout';
import { HelloWorld } from './hello-word/hello-world.component';
import { GraphSiemComponent } from './graph-siem.component';
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
    FormsModule,
    MatInputModule,
    CardModule,
    jqxGridModule,
    MatGridListModule,
    MatProgressBarModule,
    FlexLayoutModule,
    ButtonModule,
    SidebarModule
  ]
})
export class GraphSiemModule { }
