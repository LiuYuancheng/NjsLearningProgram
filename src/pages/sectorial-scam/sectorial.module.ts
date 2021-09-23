import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HighchartsChartModule } from 'highcharts-angular';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletMarkerClusterModule  } from '@asymmetrik/ngx-leaflet-markercluster';
import 'leaflet.zoomhome';
import { MarkdownModule } from 'ngx-markdown';
import { NgxTippyModule } from 'ngx-tippy-wrapper';

import {CardModule} from 'primeng/card';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {DialogModule} from 'primeng/dialog';
import {TableModule} from 'primeng/table';
import {TabViewModule} from 'primeng/tabview';
import {AccordionModule} from 'primeng/accordion';
import {DividerModule} from 'primeng/divider';

import { ScamComponent } from './scam/scam.component';
import { ScamSectorCardComponent } from './scam-sector-card/scam-sector-card.component';
import { ScamSectorDetailsComponent } from './scam-sector-details/scam-sector-details.component';

@NgModule({
  declarations: [
    ScamComponent,
    ScamSectorCardComponent,
    ScamSectorDetailsComponent
  ],
  imports: [
    CommonModule, HighchartsChartModule, LeafletModule, LeafletMarkerClusterModule,
    MarkdownModule.forChild(), NgxTippyModule, 
    CardModule, ScrollPanelModule, DialogModule, TableModule, TabViewModule, AccordionModule,
    DividerModule,
  ],
  exports: [
    ScamComponent
  ]
})
export class SectorialModule { }
