import { MapsModule } from '@syncfusion/ej2-angular-maps';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { SliderModule } from '@syncfusion/ej2-angular-inputs';
import { AppComponent } from './app.component';
import { CoronaVirusTrackingComponent } from './corona-virus-tracking/corona-virus-tracking.component';

@NgModule({
   declarations: [
      AppComponent,
      CoronaVirusTrackingComponent
   ],
   imports: [
      BrowserModule,
      MapsModule,
      SliderModule,
      HttpClientModule
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
