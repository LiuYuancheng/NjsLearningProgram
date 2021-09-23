// @ts-nocheck
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { BaseHighchartsComponent } from '../../../components/base-highcharts/base-highcharts.component';
import { Colors} from '../../../core/common/colors';

@Component({
  selector: 'app-scam-sector-card',
  templateUrl: './scam-sector-card.component.html',
  styleUrls: ['./scam-sector-card.component.scss']
})
export class ScamSectorCardComponent extends BaseHighchartsComponent  implements OnInit {
  @Input() sector: any;
  @Output() selectSector: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    super();

    this.chartOptions = {
      chart: {
        type: "areaspline",
        // renderTo: (options.chart && options.chart.renderTo) || (hasRenderToArg && a),
        backgroundColor: null,
        borderWidth: 0,
        type: 'area',
        margin: [2, 0, 2, 0],
        // width: 120,
        height: 20,
        style: {
            overflow: 'visible'
        },
        // small optimalization, saves 1-2 ms each sparkline
        skipClone: true
      },
      colors: [ Colors.WATER_COLOR ],
      title: {
        text: null,
      },
      legend: {
        enabled: false,
      },
      xAxis: {
        type: 'datetime',
        visible: false,
        labels: {
          enabled: false
        },
        title: {
          text: null
        },
        startOnTick: false,
        endOnTick: false,
        tickPositions: []
      },
      yAxis: {
        type: 'logarithmic',
        visible: false,
        endOnTick: false,
        startOnTick: false,
        labels: {
          enabled: false
        },
        title: {
          text: null
        },
        tickPositions: [0]
      },
      tooltip: {
        enabled: false,
        // hideDelay: 0,
        // outside: true,
        // shared: true
      },
      plotOptions: {
        series: {
          animation: false,
          lineWidth: 1,
          shadow: false,
          states: {
              hover: {
                  lineWidth: 1
              }
          },
          marker: {
              radius: 1,
              states: {
                  hover: {
                      radius: 2
                  }
              }
          },
          fillOpacity: 0.25
        }
      },
      series: [],
    };
  }

  ngOnInit(): void {
    // this.chartOptions.series = [ this.sector ];
    let series = [
      {
        // ...this.sector,
        "name": "Threat Count",
        "data": [ ...this.sector.data ],
        "type": "areaspline",
        // "step": true,
        // "lineWidth": 0,
        "id": "threatCountCard",
        "name": "Threat Count",
        "color": Colors.WATER_COLOR,
        // "color": "#073b4c",
      },
      // {
      //   "type": "trendline",
      //   "linkedTo": "threatCountCard",
      //   "color": "#d9ed92",
      // },
    ];
    this.chartOptions.series = series;
    this.updateFlag = true;
  }

  onClick(evt): void {
    // console.log("Clicked")
    this.selectSector.emit(this.sector)
  }
}
