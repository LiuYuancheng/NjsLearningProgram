import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
//import { DragAndDropModule } from '@angular/angular-draggable-droppable';


import {GraphSiemComponent} from './graph-siem.component';

import { EditorComponent } from './editor/editor.component';

@NgModule({
  declarations: [GraphSiemComponent],
  imports: [
    CommonModule,
    BrowserModule, FormsModule, EditorComponent,
    GraphSiemComponent,
  ], 
  exports: [
    GraphSiemComponent,
  ],
})
export class GraphSiemModule { }
