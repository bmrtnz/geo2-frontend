import { Injectable } from "@angular/core";
import { DatePipe } from "@angular/common";
import { OrdresIndicatorsService } from "./ordres-indicators.service";
import { LocalizationService } from "./localization.service";

let self;

@Injectable({
  providedIn: "root",
})
export class DateManagementService {
  constructor(
    private datePipe: DatePipe,
    public localization: LocalizationService,
    private ordresIndicatorsService: OrdresIndicatorsService
  ) {
    self = this;
  }

  formatDate(myDate, myFormat?) {
    return this.datePipe.transform(
      myDate.valueOf(),
      myFormat ? myFormat : "yyyy-MM-dd"
    );
  }

  friendlyDate(theDate, nosecs?) {
    // e.g. 17/09/2020 (11h37 44s)
    const mydate = new Date(theDate);
    let myTime =
      mydate.toLocaleTimeString().replace(":", "h").replace(":", " ") + "s";
    if (nosecs) myTime = myTime.slice(0, -4);
    return mydate.toLocaleDateString() + " (" + myTime + ")";
  }

  startOfDay(myDate = new Date()) {
    myDate.setHours(0, 0, 0);
    return myDate;
  }

  endOfDay(myDate = new Date()) {
    myDate.setHours(23, 59, 59, 999);
    return myDate;
  }

  periods() {
    const periodChoice = [
      {
        id: "J-1",
        code: "yesterday",
      },
      {
        id: "J",
        code: "today",
      },
      {
        id: "J+1",
        code: "tomorrow",
      },
      {
        id: "S-1",
        code: "lastweek",
      },
      {
        id: "S",
        code: "currentweek",
      },
      {
        id: "S+1",
        code: "nextweek",
      },
      {
        id: "7J",
        code: "7nextdays",
      },
      {
        id: "30J",
        code: "30nextdays",
      },
      {
        id: "MAC",
        code: "continuedmonth",
      },
      {
        id: "-30J",
        code: "since30days",
      },
      {
        id: "D1M",
        code: "sinceamonth",
      },
      {
        id: "D2M",
        code: "since2months",
      },
      {
        id: "D3M",
        code: "since3months",
      },
      {
        id: "D1A",
        code: "since12months",
      },
      {
        id: "M-1",
        code: "lastmonth",
      },
      {
        id: "M",
        code: "currentmonth",
      },
      {
        id: "T-1",
        code: "lastquarter",
      },
      {
        id: "T",
        code: "currentquarter",
      },
      {
        id: "DDA",
        code: "calendaryear",
      },
      {
        id: "DDC",
        code: "currentcampaign",
      },
      {
        id: "MSA-1",
        code: "sameweeklastyear",
      },
      {
        id: "MMA-1",
        code: "samemonthlastyear",
      },
    ];
    return periodChoice;
  }

  getDates(e) {
    const periode = e.value?.id;

    let deb: any;
    let fin: any;
    let temp: any;

    const dateNow = new Date();
    const now = this.datePipe.transform(dateNow);
    const year = dateNow.getFullYear();
    const month = dateNow.getMonth() + 1;
    const date = dateNow.getDate();

    const day = dateNow.getDay();
    const quarter = Math.floor((month + 2) / 3); // Current quarter
    const quarterStart = 1 + (quarter - 1) * 3; // Current quarter first month
    const prevQuarterStart = quarter === 1 ? 10 : quarterStart - 3; // Current quarter first month

    switch (periode) {
      case "J-1":
        deb = this.findDate(-1);
        break;
      case "J":
        deb = now;
        break;
      case "J+1":
        deb = this.findDate(1);
        break;
      case "S-1":
        deb = this.findDate(-day - 6);
        fin = this.findDate(-day);
        break;
      case "S":
        deb = this.findDate(-day + 1);
        fin = this.findDate(-day + 7);
        break;
      case "S+1":
        deb = this.findDate(-day + 8);
        fin = this.findDate(-day + 14);
        break;
      case "7J":
        deb = now;
        fin = this.findDate(7);
        break;
      case "30J":
        deb = now;
        fin = this.findDate(30);
        break;
      case "MAC":
        const dateTemp = dateNow;
        deb = dateTemp.setMonth(dateTemp.getMonth() - 1);
        fin = dateNow.setMonth(dateNow.getMonth() + 2);
        break;
      case "D1M":
        deb = dateNow.setMonth(dateNow.getMonth() - 1);
        fin = now;
        break;
      case "-30J":
        deb = this.findDate(-30);
        fin = now;
        break;
      case "D2M":
        deb = dateNow.setMonth(dateNow.getMonth() - 2);
        fin = now;
        break;
      case "D3M":
        deb = dateNow.setMonth(dateNow.getMonth() - 3);
        fin = now;
        break;
      case "D1A":
        deb = year - 1 + "-" + month + "-" + date;
        fin = now;
        break;
      case "M-1":
        temp =
          (month === 1 ? year - 1 : year) +
          "-" +
          (month === 1 ? 12 : month - 1);
        deb = temp + "-01";
        fin =
          temp +
          "-" +
          this.daysInMonth(
            month === 1 ? year - 1 : year,
            month === 1 ? 12 : month - 1
          );
        break;
      case "M":
        temp = year + "-" + month;
        deb = temp + "-01";
        fin = temp + "-" + this.daysInMonth(year, month);
        break;
      case "T-1":
        deb =
          (quarter === 1 ? year - 1 : year) + "-" + prevQuarterStart + "-01";
        fin =
          (quarter === 1 ? year - 1 : year) +
          "-" +
          (prevQuarterStart + 2) +
          "-" +
          this.daysInMonth(
            quarter === 1 ? year - 1 : year,
            prevQuarterStart + 2
          );
        break;
      case "T":
        deb = year + "-" + quarterStart + "-01";
        fin =
          year +
          "-" +
          (quarterStart + 2) +
          "-" +
          this.daysInMonth(year, quarterStart + 2);
        break;
      case "DDA":
        deb = year + "-01-01";
        fin = year + "-12-31";
        break;
      case "DDC":
        deb = (month <= 6 ? year - 1 : year) + "-07-01";
        fin = (month > 6 ? year + 1 : year) + "-06-30";
        break;
      case "MSA-1": {
        deb = this.getDateOfISOWeek(this.getWeekNumber(dateNow), year - 1);
        temp = new Date(deb);
        fin = temp.setDate(temp.getDate() + 6);
        deb = this.formatDate(deb);
        fin = this.formatDate(fin);
        break;
      }
      case "MMA-1":
        temp = year - 1 + "-" + month;
        deb = temp + "-01";
        fin = temp + "-" + this.daysInMonth(year - 1, month);
        break;
    }

    if (!fin) {
      fin = deb;
    }

    deb = new Date(deb);
    fin = new Date(fin);
    deb = this.startOfDay(deb);
    fin = this.endOfDay(fin);

    return { dateDebut: deb, dateFin: fin };
  }

  getPeriodFromId(periodId, periodes) {
    let myPeriod = periodes.slice(0);
    myPeriod = myPeriod.filter((p) => p.id === periodId);
    if (myPeriod.length) return myPeriod[0];
  }

  displayPeriodText(data) {
    return data ? self.localization.localize(data.code) : null;
  }

  findDate(delta) {
    return this.ordresIndicatorsService.getFormatedDate(
      new Date().setDate(new Date().getDate() + delta).valueOf()
    );
  }

  findDateTimeZero(delta) {
    const currDateTime0 = new Date();
    currDateTime0.setHours(0, 0, 0, 0);
    return this.ordresIndicatorsService.getFormatedDate(
      currDateTime0.setDate(currDateTime0.getDate() + delta).valueOf(),
      "yyyy-MM-ddTHH:mm:ss"
    );
  }

  getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart.valueOf()) / 86400000 + 1) / 7);
  }

  getDateOfISOWeek(w, y) {
    const simple = new Date(y, 0, 1 + (w - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
  }

  daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }
}
