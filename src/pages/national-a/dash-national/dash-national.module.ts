import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashNationalComponent } from './dash-national/dash-national.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { jqxGridModule } from 'jqwidgets-ng/jqxgrid';
import { MatCardModule } from '@angular/material/card';
import { HighchartsChartModule } from 'highcharts-angular';
import { DashNationalActorsComponent } from './dash-national-actors/dash-national-actors.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatCheckboxModule} from '@angular/material/checkbox';

import { FlexLayoutModule } from '@angular/flex-layout';
import { DashNationalClientComponent } from './dash-national-client/dash-national-client.component';
import { DashNationalNameComponent } from './dash-national-name/dash-national-name.component';
import { DashNationalPopupComponent } from './dash-national-popup/dash-national-popup.component';

@NgModule({
  declarations: [
    DashNationalComponent,
    DashNationalActorsComponent,
    DashNationalClientComponent,
    DashNationalNameComponent,
    DashNationalPopupComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    jqxGridModule,
    FlexLayoutModule,
    CardModule,
    MatCardModule,
    MatTooltipModule,
    MatCheckboxModule,
    HighchartsChartModule,
  ]
})
export class DashNationalModule { }
