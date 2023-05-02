import { Injectable } from "@angular/core";

export class Log {
  id: number;
  DateHeureSauvegarde: string;
  Qui: string;
}
export class Comm {
  id: number;
  Qui: string;
  Quand: string;
  Quoi: string;
}

const logs: Log[] = [
  {
    id: 1,
    DateHeureSauvegarde: "23/12/20 17:55",
    Qui: "Paul",
  },
  {
    id: 2,
    DateHeureSauvegarde: "22/12/20 17:55",
    Qui: "Jérôme",
  },
  {
    id: 3,
    DateHeureSauvegarde: "22/12/20 17:55",
    Qui: "Pascal",
  },
];

const commentaires: Comm[] = [
  {
    id: 1,
    Quand: "23/12/20 17:55",
    Qui: "Paul",
    Quoi: "Lorem ipsum",
  },
  {
    id: 2,
    Quand: "22/12/20 17:55",
    Qui: "Jérôme",
    Quoi: "Lorem ipsum",
  },
  {
    id: 3,
    Quand: "22/12/20 17:55",
    Qui: "Pascal",
    Quoi: "Lorem ipsum",
  },
];

@Injectable()
export class LogService {
  getLog() {
    return logs;
  }
}
export class CommService {
  getComm() {
    return commentaires;
  }
}
