import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashNationalComponent } from './dash-national/dash-national.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { MatCardModule } from '@angular/material/card';
import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
  declarations: [
    DashNationalComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    CardModule,
    MatCardModule,
    HighchartsChartModule,
  ]
})
export class DashNationalModule { }
