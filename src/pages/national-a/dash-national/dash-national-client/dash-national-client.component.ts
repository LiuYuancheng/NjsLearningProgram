import { Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-dash-national-client',
  templateUrl: './dash-national-client.component.html',
  styleUrls: ['./dash-national-client.component.scss']
})
export class DashNationalClientComponent implements OnInit {
  @Input() customTitle: string;

  constructor() { }

  ngOnInit(): void {
  }

}
