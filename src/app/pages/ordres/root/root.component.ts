import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DxTabPanelComponent, DxTemplateHost } from 'devextreme-angular';
import { dxTabPanelItem } from 'devextreme/ui/tab_panel';
import { OrdresAccueilComponent } from '../accueil/ordres-accueil.component';
import { OrdresDetailsComponent } from '../details/ordres-details.component';

export type QueryParams = { indicateurs?: string[], ordres?: string[] };
type TabPanelItem = dxTabPanelItem & { icon?: string, component? };

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class RootComponent implements OnInit {

  @ViewChild(DxTabPanelComponent) tabPanel: DxTabPanelComponent;
  @ViewChild(OrdresAccueilComponent) ordresAccueilComponent: OrdresAccueilComponent;

  public items: TabPanelItem[] = [
    {
      icon: 'home',
      component: OrdresAccueilComponent,
    },
    // {
    //   title: 'indicator',
    //   itemTemplate: this.defaultTemplate,
    // },
    // {
    //   title: 'ordre',
    //   component: OrdresDetailsComponent,
    // },
  ];

  constructor(
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((res: ParamMap) => console.log(res));
    this.route.queryParamMap.subscribe((res: ParamMap) => console.log(res));
  }

}
