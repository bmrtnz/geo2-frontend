import { Injectable } from "@angular/core";
import Envois from "app/shared/models/envois.model";

@Injectable({
  providedIn: "root"
})
export class FluxArService {

  private ignoredTiers: string[] = [];
  private reasons: Record<string, string> = {};

  constructor() { }

  get hasData() {
    return !!this.ignoredTiers.length || !!Object.keys(this.reasons).length;
  }

  pushIgnoredTier(code: Envois["codeTiers"]) {
    this.ignoredTiers.push(code);
  }
  setReason(tier: string, reason: string) {
    this.reasons[tier] = reason;
  }

  get(): {
    ignoredTiers: FluxArService["ignoredTiers"],
    reasons: FluxArService["reasons"],
  } {
    return JSON.parse(JSON.stringify({
      ignoredTiers: this.ignoredTiers,
      reasons: this.reasons,
    }));
  }

  clear() {
    this.ignoredTiers = [];
    this.reasons = {};
  }

}
