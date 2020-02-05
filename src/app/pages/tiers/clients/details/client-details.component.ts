import {Component, OnInit} from '@angular/core';
import {ClientsService} from '../../../../shared/services';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit {

  client: any;

  constructor(
    private clientsService: ClientsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.clientsService.get(params.get('id')))
    ).subscribe(c => {
      this.client = c;
    });
  }

}
