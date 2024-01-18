import { Component, Input, OnInit, AfterContentInit, Injector } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { OntimizeService } from "ontimize-web-ngx";
import { getLoggedUser } from "src/app/shared/utils";
import { AgreementsDetailRatingComponent } from "../agreements-detail-rating/agreements-detail-rating.component";

@Component({
	selector: "app-agreements-navigation",
	templateUrl: "./agreements-navigation.component.html",
	styleUrls: ["./agreements-navigation.component.css"],
})
export class AgreementsNavigationComponent implements OnInit, AfterContentInit {
	@Input() data: any;
	protected service: OntimizeService;
	user: string = getLoggedUser();
	viewOfferClient: boolean = false;
	c_id: number;
	ag_id: number;
	agreement: any;
	accepted: any;
	isClient: boolean = true;
	dataIsLoaded: boolean = false;
	workDone: any;

	constructor(protected dialog: MatDialog, private router: Router, private route: ActivatedRoute, protected injector: Injector) {
		this.service = this.injector.get(OntimizeService);
	}

	ngOnInit() {
		setTimeout(() => {
			if (this.data.CLIENT == this.user) {
				this.viewOfferClient = true;
			}
		}, 300);
		this.route.params.subscribe((params) => {
			this.c_id = params["C_ID"];
		});
	}

	onDataLoaded(event: any) {
		this.ag_id = event.AG_ID;
		this.accepted = event.AG_ACCEPTED;
		this.agreement = event.AG_ID;
		this.dataIsLoaded = event;
		this.workDone = event.C_END_DATETIME;
	}

	public openAgreementFormNew() {
		this.router.navigateByUrl(`main/agreements/new/${this.c_id}?isdetail=true`);
	}
	public openAgreementFormDetail() {
		this.router.navigateByUrl(`main/agreements/${this.ag_id}?isdetail=true`);
	}
	public openAgreementFormDetailRating() {
		this.router.navigateByUrl(`main/agreements/${this.ag_id}/rating?isdetail=true`)
	}
	public openAgreementFormDetailClient() {
		this.router.navigateByUrl(`main/agreements/${this.ag_id}/client?isdetail=true`);
	}

	public openDetail(data: any): void {
		this.dialog.open(AgreementsDetailRatingComponent, {
			height: "300px",
			width: "600px",
			data: data
		});
	}

	ngAfterContentInit() {}
}
