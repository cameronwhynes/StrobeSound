import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

// Native Plugins
import { DBMeter } from '@ionic-native/db-meter';
import { Flashlight } from '@ionic-native/flashlight';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  minDbValue = 50;
  maxDbValue = 80;
  prevDbMeterValue = 0;
  dbMargin = 0.5;

  constructor(public navCtrl: NavController,
    private dbMeter: DBMeter,
    private platform: Platform,
    private flashlight: Flashlight) {
      this.platform.ready().then(source => {
        console.log("Home.ts ctor: Platform.isReady() success, source: ",source);
        this.initListening();
      })
  }

  initListening() {
    // Start listening
    let subscription = this.dbMeter.start().subscribe(
      data => this.updateStrobe(data)
    );
  }

  updateStrobe(dbMeterData: number) {
    console.log(dbMeterData)


    if (dbMeterData <= this.minDbValue)
    {
      this.flashlight.switchOff();
      this.prevDbMeterValue = dbMeterData;
      return;
    }

    if (dbMeterData >= this.maxDbValue)
    {
      this.flashlight.switchOn();
      this.prevDbMeterValue = dbMeterData;
      return;
    }


    // Handle cases where flashlight is currently switched on
    if (this.flashlight.isSwitchedOn())
    {
      if ( dbMeterData - this.prevDbMeterValue > this.dbMargin )
      {
        // db have increased
        this.flashlight.switchOff().then(() => {
          this.flashlight.switchOn();
        })
      }

      else if ( dbMeterData - this.prevDbMeterValue < -this.dbMargin )
      {
        // db have decreased
        this.flashlight.switchOff();
      }

      else {
        // db remains within the margin, not increasing or decreasing
        this.flashlight.switchOff();
      }
    }


    // Handle cases where flashlight is currently switched off
    else {
      if ( dbMeterData - this.prevDbMeterValue > this.dbMargin )
      {
        // db have increased
        this.flashlight.switchOn();
      }

      else if ( dbMeterData - this.prevDbMeterValue < -this.dbMargin )
      {
        // db have decreased
        this.flashlight.switchOff();
      }

      else {
        // db remains within the margin, not increasing or decreasing
        this.flashlight.switchOff();
      }
    }



    // Store the current dbValue for the next update comparison
    this.prevDbMeterValue = dbMeterData;

  }

}
