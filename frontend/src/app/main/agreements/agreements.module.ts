import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AgreementsRoutingModule } from "./agreements-routing.module";
import { OntimizeWebModule } from "ontimize-web-ngx";
import { AgreementsNewComponent } from "./agreements-new/agreements-new.component";
import { SharedModule } from "src/app/shared/shared.module";
import { AgreementsDetailComponent } from "./agreements-detail/agreements-detail.component";
import { AgreementsNavigationComponent } from "./agreements-navigation/agreements-navigation.component";
import { AgreementsDetailClientComponent } from "./agreements-detail-client/agreements-detail-client.component";
import { AgreementsDetailRatingComponent } from './agreements-detail-rating/agreements-detail-rating.component';

@NgModule({
	declarations: [
		AgreementsNewComponent,
		AgreementsNavigationComponent,
		AgreementsDetailComponent,
		AgreementsDetailClientComponent,
		AgreementsDetailRatingComponent,
	],
	imports: [CommonModule, AgreementsRoutingModule, OntimizeWebModule, SharedModule],
	exports: [
		AgreementsNavigationComponent,
		AgreementsNewComponent,
		AgreementsDetailComponent,
		AgreementsDetailClientComponent,
	],
})
export class AgreementsModule {}
