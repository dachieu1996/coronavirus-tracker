import { WorldMap } from './../../assets/WorldMap';
import { Component, ViewChild, ViewEncapsulation, Inject, OnInit } from '@angular/core';
import { MapsTheme, MapsTooltip, DataLabel, Maps, Marker, ILoadEventArgs, ILoadedEventArgs, Annotations } from '@syncfusion/ej2-angular-maps';
import { Slider, SliderChangeEventArgs, SliderTooltipEventArgs, SliderTickEventArgs } from '@syncfusion/ej2-inputs';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { MapAjax, Zoom } from '@syncfusion/ej2-maps';
import { HttpClient } from '@angular/common/http';

Maps.Inject(Marker, MapsTooltip, DataLabel, Annotations, Zoom);
let colorCodes: string[] = ['#7E9CDC', '#DCD57E', '#7EDCA2', '#6EB5D0', '#A6DC7E', '#DCA87E', '#d075c6'];
let sliderVal: number | number[] = [-2, 4];
declare var require: any;
@Component({
  selector: 'app-corona-virus-tracking',
  templateUrl: './corona-virus-tracking.component.html',
  styleUrls: ['./corona-virus-tracking.component.less']
})
export class CoronaVirusTrackingComponent implements OnInit {
  @ViewChild('maps', { static: false })
  maps: Maps
  // custom code start
  load = (args: ILoadEventArgs) => {
    let theme: string = location.hash.split('/')[1];
    theme = theme ? theme : 'Material';
    args.maps.theme = <MapsTheme>(theme.charAt(0).toUpperCase() + theme.slice(1));
  }

  margin: object = {
    bottom: 20
  };
  zoomSettings: object = {
    enable: true
  }

  dataSource = [];

  loaded = (args: ILoadedEventArgs) => {
  };
  layers: object[] = [
    {
      shapeData: WorldMap,
      shapePropertyPath: 'admin',
      shapeDataPath: 'country',
      dataSource: this.dataSource,
      shapeSettings: {
        fill: '#c2b6b6',
        colorValuePath: 'confirmed',
        colorMapping: [
          {
            from: 1, to: 500, color: ['lightseagreen', 'yellowgreen']
          },
          {
            from: 501, to: 2000, color: ['yellowgreen', 'gold']
          },
          {
            from: 2001, to: 5000, color: ['gold', 'orange']
          },
          {
            from: 5001, to: 250000, color: ['orange', 'tomato']
          },
          {
            from: 250001, to: 500000, color: ['tomato', 'orangered']
          },
          {
            from: 500001, to: 1000000, color: ['orangered', 'red']
          },
          {
            from: 1000001, to: 1500000, color: ['red', 'darkred']
          }
        ]
      },
      tooltipSettings: {
        visible: true,
        format: '[ ${country} ] Mắc: ${confirmed} | Tử vong: ${deaths} | Hồi phục: ${recovered}'
      }
    }

  ];

  min: number = new Date("2020-1-1").getTime();
  max: number = new Date("2020-1-1").getTime();
  step: number = 86400000;
  value: number = new Date("2020-1-1").getTime();
  currentDate: string = "Đang cập nhật dữ liệu ...";

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.http.get('https://coronavirus-tracker-api.herokuapp.com/all').subscribe((res: any) => {
      this.dataSource = this.getDataSource(res);
      this.drawSlider(res);
    });
  }

  getDataSource(res) {
    const confirmed: any = this.calculateByStatus(res, 'confirmed');
    const deaths: any = this.calculateByStatus(res, 'deaths');
    const recovered: any = this.calculateByStatus(res, 'recovered');

    let dataSource = [];
    for (let i = 0; i < confirmed.length; i++) { // loop country
      let tmp = confirmed[i].history[0]; // get key, key is day here
      for (const day in tmp) {
        dataSource.push({
          country: confirmed[i].country,
          time: new Date(day),
          confirmed: confirmed[i].history[0][day],
          deaths: deaths[i].history[0][day],
          recovered: recovered[i].history[0][day]
        })
      }
    }
    return dataSource;
  }

  drawSlider(res) {
    const confirmed: any = this.calculateByStatus(res, 'confirmed');
    let tmp = confirmed[0].history[0]; // get key, key is day here
    let days = [];
    for (const day in tmp) {
      days.push(day);
    }

    this.min = new Date(days[0]).getTime();
    this.max = new Date(days[days.length - 1]).getTime();
    this.value = this.max;
  }

  drawMap(dateTime: Date) {
    this.maps.layers[0].dataSource = this.dataSource.filter(x => x.time.getTime() == dateTime.getTime());
    // this.maps.titleSettings.text = dateTime.getDate() + '/' + (dateTime.getMonth() + 1);
    this.maps.refresh();
  }

  calculateByStatus(data: any, key: string) {
    let result = Array.from(data[key].locations.reduce((m, { country, history }) =>
      m.set(country, [...(m.get(country) || []), history]), new Map
    ), ([country, history]) => ({ country, history })
    );

    result.forEach(x => {
      if (x.history.length > 1) {
        x.history = [this.sumObjectsByKey(x.history)];
      }
    })
    return result.sort((a, b) => a.country.localeCompare(b.country));
  }

  sumObjectsByKey(objs: any[]) {
    return objs.reduce((a, b) => {
      for (let k in b) {
        if (b.hasOwnProperty(k))
          a[k] = (a[k] || 0) + b[k];
      }
      return a;
    }, {});
  }


  onChangedSlider(args: SliderChangeEventArgs) {

  }

  onChangeSlider(args: SliderChangeEventArgs) {
    this.drawMap(new Date(Number(args.value)))

    let dateTime = new Date(Number(args.value));
    this.currentDate = dateTime.getDate() + '/' + (dateTime.getMonth() + 1) + '/' + dateTime.getFullYear();
  }
}

