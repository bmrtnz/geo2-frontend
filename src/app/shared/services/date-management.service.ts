import { Injectable } from "@angular/core";
import { DatePipe } from "@angular/common";
import { OrdresIndicatorsService } from "./ordres-indicators.service";

@Injectable({
    providedIn: "root",
})
export class DateManagementService {
    constructor(
        private datePipe: DatePipe,
        private ordresIndicatorsService: OrdresIndicatorsService,
    ) { }

    formatDate(myDate, myFormat?) {
        return this.datePipe.transform(
            myDate.valueOf(),
            myFormat ? myFormat : "yyyy-MM-dd",
        );
    }

    friendlyDate(theDate, nosecs?) {
        // e.g. 17/09/2020 (11h37 44s)
        const mydate = new Date(theDate);
        let myTime =
            mydate.toLocaleTimeString().replace(":", "h").replace(":", " ") +
            "s";
        if (nosecs) myTime = myTime.slice(0, -4);
        return mydate.toLocaleDateString() + "  (" + myTime + ")";
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
            "Hier",
            "Aujourd'hui",
            "Demain",
            "Semaine dernière",
            "Semaine en cours",
            "Semaine prochaine",
            "7 prochains jours",
            "30 prochains jours",
            "Mois à cheval",
            "Depuis 30 jours",
            "Depuis 1 mois",
            "Depuis 2 mois",
            "Depuis 3 mois",
            "Depuis 12 mois",
            "Mois dernier",
            "Mois en cours",
            "Trimestre dernier",
            "Trimestre en cours",
            "Année civile en cours",
            "Campagne en cours",
            "Même semaine année dernière",
            "Même mois année dernière",
        ];
        return periodChoice;
    }

    getDates(e) {
        // We check that this change is coming from the user, not following a prog change
        if (!e.event) return;

        const periode = e.value;

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
            case "Hier":
                deb = this.findDate(-1);
                break;
            case "Aujourd'hui":
                deb = now;
                break;
            case "Demain":
                deb = this.findDate(1);
                break;
            case "Semaine dernière":
                deb = this.findDate(-day - 6);
                fin = this.findDate(-day);
                break;
            case "Semaine en cours":
                deb = this.findDate(-day + 1);
                fin = this.findDate(-day + 7);
                break;
            case "Semaine prochaine":
                deb = this.findDate(-day + 8);
                fin = this.findDate(-day + 14);
                break;
            case "7 prochains jours":
                deb = now;
                fin = this.findDate(7);
                break;
            case "30 prochains jours":
                deb = now;
                fin = this.findDate(30);
                break;
            case "Mois à cheval":
                deb =
                    (month === 1 ? year - 1 : year) +
                    "-" +
                    (month === 1 ? 12 : month - 1) +
                    "-" +
                    date;
                fin =
                    (month === 12 ? year + 1 : year) +
                    "-" +
                    (month === 12 ? 1 : month) +
                    "-" +
                    date;
                break;
            case "Depuis 1 mois":
                deb =
                    (month === 1 ? year - 1 : year) +
                    "-" +
                    (month === 1 ? 12 : month - 1) +
                    "-" +
                    date;
                fin = now;
                break;
            case "Depuis 30 jours":
                deb = this.findDate(-30);
                fin = now;
                break;
            case "Depuis 2 mois":
                deb =
                    (month <= 2 ? year - 1 : year) +
                    "-" +
                    (month <= 2 ? 10 + month : month - 2) +
                    "-" +
                    date;
                fin = now;
                break;
            case "Depuis 3 mois":
                deb =
                    (month <= 3 ? year - 1 : year) +
                    "-" +
                    (month <= 3 ? 9 + month : month - 3) +
                    "-" +
                    date;
                fin = now;
                break;
            case "Depuis 12 mois":
                deb = year - 1 + "-" + month + "-" + date;
                fin = now;
                break;
            case "Mois dernier":
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
                        month === 1 ? 12 : month - 1,
                    );
                break;
            case "Mois en cours":
                temp = year + "-" + month;
                deb = temp + "-01";
                fin = temp + "-" + this.daysInMonth(year, month);
                break;
            case "Trimestre dernier":
                deb =
                    (quarter === 1 ? year - 1 : year) +
                    "-" +
                    prevQuarterStart +
                    "-01";
                fin =
                    (quarter === 1 ? year - 1 : year) +
                    "-" +
                    (prevQuarterStart + 2) +
                    "-" +
                    this.daysInMonth(
                        quarter === 1 ? year - 1 : year,
                        prevQuarterStart + 2,
                    );
                break;
            case "Trimestre en cours":
                deb = year + "-" + quarterStart + "-01";
                fin =
                    year +
                    "-" +
                    (quarterStart + 2) +
                    "-" +
                    this.daysInMonth(year, quarterStart + 3);
                break;
            case "Année civile en cours":
                deb = year + "-01-01";
                fin = year + "-12-31";
                break;
            case "Campagne en cours":
                deb = (month <= 6 ? year - 1 : year) + "-07-01";
                fin = (month > 6 ? year + 1 : year) + "-06-30";
                break;
            case "Même semaine année dernière": {
                deb = this.getDateOfISOWeek(
                    this.getWeekNumber(dateNow),
                    year - 1,
                );
                temp = new Date(deb);
                fin = temp.setDate(temp.getDate() + 6);
                deb = this.formatDate(deb);
                fin = this.formatDate(fin);
                break;
            }
            case "Même mois année dernière":
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

    findDate(delta) {
        return this.ordresIndicatorsService.getFormatedDate(
            new Date().setDate(new Date().getDate() + delta).valueOf(),
        );
    }

    findDateTimeZero(delta) {
        const currDateTime0 = new Date();
        currDateTime0.setHours(0, 0, 0, 0);
        return this.ordresIndicatorsService.getFormatedDate(
            currDateTime0.setDate(currDateTime0.getDate() + delta).valueOf(), "yyyy-MM-ddTHH:mm:ss"
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
        if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        return ISOweekStart;
    }

    daysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }
}
