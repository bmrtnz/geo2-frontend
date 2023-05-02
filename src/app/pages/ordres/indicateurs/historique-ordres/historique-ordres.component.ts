import { Component, OnInit } from "@angular/core";
import { AuthService } from "app/shared/services";

@Component({
  selector: "app-historique-ordres",
  templateUrl: "./historique-ordres.component.html",
  styleUrls: ["./historique-ordres.component.scss"],
})
export class HistoriqueOrdresComponent {
  constructor(public authService: AuthService) {}
}

export default HistoriqueOrdresComponent;
