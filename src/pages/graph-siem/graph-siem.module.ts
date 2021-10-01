import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar'
import { MatInputModule } from '@angular/material/input';
import { MarkdownModule } from 'ngx-markdown';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';

import { ScrollPanelModule } from 'primeng/scrollpanel';
// import other modules: 
import { jqxGridModule } from 'jqwidgets-ng/jqxgrid';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { GraphSiemComponent } from './graph-siem.component';
import { CytoscapeComponent } from './cytoscape/cytoscape.component';
import { CardModule } from 'primeng/card';
import { NodedetailComponent } from './nodedetail/nodedetail.component';

@NgModule({
  declarations: [
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
    SidebarModule,
    MarkdownModule.forChild(),
    TabViewModule,
    ScrollPanelModule,
    AccordionModule,
  ]
})
export class GraphSiemModule { }
