import { Component, OnInit, ViewChild } from '@angular/core';
import { OFormComponent, OntimizeService } from 'ontimize-web-ngx';

@Component({
  selector: 'app-agreements-detail-rating',
  templateUrl: './agreements-detail-rating.component.html',
  styleUrls: ['./agreements-detail-rating.component.css']
})
export class AgreementsDetailRatingComponent implements OnInit {
  @ViewChild("agreementFormRating", { static: false }) form: OFormComponent;
	protected service: OntimizeService;
	ag_rating: number;
  constructor() { }

  ngOnInit() {
  }

  setValue(input: any, value: any) {
    input.setValue(value);
    this.ag_rating = input.getValue();
		this.form.setFieldValues({ AG_RATING: this.ag_rating });
		this.form.update();
  }

  onDataLoaded(data: any) {
		this.ag_rating = data.AG_RATING;
  }

}
