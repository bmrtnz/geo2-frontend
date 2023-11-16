import {
  Component,
  NgModule,
  Output,
  Input,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { VersionService } from "app/shared/services/version.service";
import {
  DxTreeViewModule,
  DxTreeViewComponent,
} from "devextreme-angular/ui/tree-view";

import * as events from "devextreme/events";
import { SharedModule } from "../../shared.module";

@Component({
  selector: "app-side-navigation-menu",
  templateUrl: "./side-navigation-menu.component.html",
  styleUrls: ["./side-navigation-menu.component.scss"],
})
export class SideNavigationMenuComponent implements AfterViewInit, OnDestroy {
  @ViewChild(DxTreeViewComponent, { static: true })
  menu: DxTreeViewComponent;

  @Output() selectedItemChanged = new EventEmitter<string>();

  @Output() openMenu = new EventEmitter<any>();

  @Input() items: any[];

  @Input()
  set selectedItem(value: string) {
    if (this.menu.instance) {
      this.menu.instance.selectItem(value);
    }
  }

  private compactModeP = false;
  @Input()
  get compactMode() {
    return this.compactModeP;
  }
  set compactMode(val) {
    this.compactModeP = val;
    if (val && this.menu.instance) {
      this.menu.instance.collapseAll();
    }
  }

  public copyrightYear = "";

  constructor(
    private elementRef: ElementRef,
    public versionService: VersionService,
  ) {
    const year = new Date().getFullYear();
    this.copyrightYear = "-" + year;
  }


  updateSelection(event) {
    const nodeClass = "dx-treeview-node";
    const selectedClass = "dx-state-selected";
    const leafNodeClass = "dx-treeview-node-is-leaf";
    const element: HTMLElement = event.element;

    const rootNodes = element.querySelectorAll(
      `.${nodeClass}:not(.${leafNodeClass})`
    );
    Array.from(rootNodes).forEach((node) => {
      node.classList.remove(selectedClass);
    });

    let selectedNode = element.querySelector(`.${nodeClass}.${selectedClass}`);
    while (selectedNode && selectedNode.parentElement) {
      if (selectedNode.classList.contains(nodeClass)) {
        selectedNode.classList.add(selectedClass);
      }

      selectedNode = selectedNode.parentElement;
    }
  }

  onItemClick(event) {
    this.selectedItemChanged.emit(event);
  }

  onMenuInitialized(event) {
    event.component.option("deferRendering", false);
  }

  ngAfterViewInit() {
    events.on(this.elementRef.nativeElement, "dxclick", (e) => {
      this.openMenu.next(e);
    });
    this.versionService.updateCopyrightTextDisplay();
  }

  ngOnDestroy() {
    events.off(this.elementRef.nativeElement, "dxclick");
  }
}

@NgModule({
  declarations: [SideNavigationMenuComponent],
  exports: [SideNavigationMenuComponent],
  imports: [DxTreeViewModule, SharedModule]
})
export class SideNavigationMenuModule { }
