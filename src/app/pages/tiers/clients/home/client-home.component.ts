import {AfterViewChecked, Component, OnInit, ViewChild} from '@angular/core';
import { Location } from '@angular/common';
import {ActivatedRoute, ActivationEnd, NavigationEnd, Router} from '@angular/router';
import {Client} from '../../../../shared/models';
import {ClientsListComponent} from '../list/clients-list.component';
import {ClientDetailsComponent} from '../details/client-details.component';

@Component({
  selector: 'app-client-home',
  templateUrl: './client-home.component.html',
  styleUrls: ['./client-home.component.scss']
})
export class ClientHomeComponent implements OnInit {

  backBtnDisabled = false;
  collapseMode = true;
  @ViewChild(ClientsListComponent, { static: true }) clientsList;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.backBtnDisabled = !/\/tiers\/clients\/\d+\/.*/.test(e.url);
      }
      if (e instanceof ActivationEnd) {
        if (e.snapshot.component === ClientDetailsComponent) {
          this.clientsList.setInitialKey(e.snapshot.params.id);
        }
      }
    });
  }

  ngOnInit() {
  }

  hideGrid() {
    if (this.collapseMode) {
      this.toggleCollapse(true);
    } else {
      document.getElementById('router').scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleCollapse(forceHide = false) {
    const classList = document.querySelector('.collapse').classList;

    if (!forceHide) {
      classList.toggle('collapsed');
    } else {
      if (classList.contains('collapsed')) {
        classList.remove('collapsed');
      }
    }
  }

  selectRow(client: Client) {
    this.router.navigate([`/tiers/clients/${client.id}`]);
    this.hideGrid();
  }

  // TODO Create directive backButton
  backClick() {
    this.location.back();
  }

  activate(event) {
    console.log(event);
  }
}
