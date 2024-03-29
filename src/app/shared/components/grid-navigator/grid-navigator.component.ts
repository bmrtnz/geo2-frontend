import {
  Component,
  OnInit,
  NgModule,
  ElementRef,
  Input,
  ViewChild,
} from "@angular/core";
import { DxButtonModule, DxDataGridComponent } from "devextreme-angular";
import { Location, CommonModule } from "@angular/common";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { EntrepotsListComponent } from "app/pages/tiers/entrepots/list/entrepots-list.component";

const BACK_STATE = "BACK_NESTED";

@Component({
  selector: "app-grid-navigator",
  templateUrl: "./grid-navigator.component.html",
  styleUrls: ["./grid-navigator.component.scss"],
})
export class GridNavigatorComponent {
  backBtnDisabled = true;
  returnBtnTxt: string;
  isEntrepotsList: boolean;
  @Input() dataGrid: DxDataGridComponent;
  clientID: string;

  constructor(
    public location: Location,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public element: ElementRef
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd)
        this.backBtnDisabled = !/^\/pages\/nested\/.*(details|entrepot).*/.test(
          event.url
        );
      const url = window.location.href;
      const idx = url.indexOf("/clients/");
      if (idx > 0) this.clientID = url.substring(idx + 9).split("/")[0];
      this.isEntrepotsList = url.indexOf("/entrepots/") !== -1;
      this.returnBtnTxt = this.isEntrepotsList ? "Client" : "Retour";
    });
  }

  public hasNext() {
    if (!this.dataGrid) {
      return false;
    }

    if (
      this.dataGrid.focusedRowIndex + 1 >=
        this.dataGrid.instance.totalCount() &&
      this.dataGrid.instance.pageIndex() + 1 >=
        this.dataGrid.instance.pageCount()
    ) {
      return false;
    }

    return true;
  }

  public async selectNext() {
    const backRowIndex = this.dataGrid.focusedRowIndex;
    const backPageIndex = this.dataGrid.instance.pageIndex();
    let nextIndex = this.dataGrid.focusedRowIndex + 1;

    if (nextIndex >= this.dataGrid.instance.pageSize()) {
      await this.dataGrid.instance.pageIndex(
        this.dataGrid.instance.pageIndex() + 1
      );
      nextIndex = 0;
    }

    this.dataGrid.focusedRowIndex = nextIndex;
    this.dataGrid.instance.selectRowsByIndexes([nextIndex]);
    if (
      !(await this.navToDetail(
        this.dataGrid.instance.getSelectedRowsData()[0].id
      ))
    ) {
      await this.dataGrid.instance.pageIndex(backPageIndex);
      this.dataGrid.focusedRowIndex = backRowIndex;
      this.dataGrid.instance.selectRowsByIndexes([backRowIndex]);
    }
  }

  public hasPrevious() {
    if (!this.dataGrid) {
      return false;
    }

    return !(
      this.dataGrid.focusedRowIndex === 0 &&
      this.dataGrid.instance.pageIndex() === 0
    );
  }

  public async selectPrevious() {
    const backRowIndex = this.dataGrid.focusedRowIndex;
    const backPageIndex = this.dataGrid.instance.pageIndex();
    let previousIndex = this.dataGrid.focusedRowIndex - 1;

    if (previousIndex < 0) {
      await this.dataGrid.instance.pageIndex(
        this.dataGrid.instance.pageIndex() - 1
      );
      previousIndex = this.dataGrid.instance.pageSize() - 1;
    }

    this.dataGrid.focusedRowIndex = previousIndex;
    this.dataGrid.instance.selectRowsByIndexes([previousIndex]);
    if (
      !(await this.navToDetail(
        this.dataGrid.instance.getSelectedRowsData()[0].id
      ))
    ) {
      await this.dataGrid.instance.pageIndex(backPageIndex);
      this.dataGrid.focusedRowIndex = backRowIndex;
      this.dataGrid.instance.selectRowsByIndexes([backRowIndex]);
    }
  }

  navToDetail(id: string) {
    const details = this.router
      .createUrlTree([])
      .root.children.primary.children.primary.segments.map(({ path }) =>
        path === "list" ? id : path
      )
      .join("/");
    return this.router.navigate([{ outlets: { details } }], {
      relativeTo: this.activatedRoute,
    });
  }

  scrollToDetails(options = { behavior: "smooth" }) {
    this.element.nativeElement.scrollIntoView(options);
  }

  backClick() {
    if (this.isEntrepotsList) {
      this.router.navigateByUrl(
        `/pages/nested/n/(tiers/clients/list//details:tiers/clients/${this.clientID})`
      );
    } else {
      this.location.back();
    }
  }
}

@NgModule({
  imports: [CommonModule, DxButtonModule],
  declarations: [GridNavigatorComponent],
  exports: [GridNavigatorComponent],
})
export class GridNavigatorModule {}
