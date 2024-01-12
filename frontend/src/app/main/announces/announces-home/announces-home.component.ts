import { AfterViewInit, Component, Injector, OnInit, ViewChild } from "@angular/core";
import {
	Expression,
	FilterExpressionUtils,
	OButtonComponent,
	OFilterBuilderComponent,
	OGridComponent,
	OntimizeService,
} from "ontimize-web-ngx";
import { AnnouncesDetailComponent } from "../announces-detail/announces-detail.component";
import { MatDialog } from "@angular/material";
import * as L from "leaflet";
import { OMapComponent } from "ontimize-web-ngx-map";
import { getLoggedUser } from "src/app/shared/utils";
import { Observable, of } from "rxjs";
import { AnnouncesModule } from "../announces.module";

@Component({
	selector: "app-announces-home",
	templateUrl: "./announces-home.component.html",
	styleUrls: ["./announces-home.component.css"],
})
export class AnnouncesHomeComponent implements OnInit, AfterViewInit {
	protected userGeolocationService: OntimizeService;
	map: L.Map;
	latitudeown: number;
	longitudeown: number;
	user: string = getLoggedUser();
	error: string;
	locationObtained = false;

	markers: L.Marker[] = [];
	selectedService: string = null;

	@ViewChild("announcesGrid", { static: true }) grid: OGridComponent;
	@ViewChild("oMapHome", { static: false }) oMapMarker: OMapComponent;
	@ViewChild("filterBuilder", { static: false }) oFilterBuilder: OFilterBuilderComponent;

	constructor(protected dialog: MatDialog, protected injector: Injector) {
		this.userGeolocationService = this.injector.get(OntimizeService);
		this.geoLocation();
	}

	ngOnInit() {
		const conf = this.userGeolocationService.getDefaultServiceConfiguration("users");
		this.userGeolocationService.configureService(conf);
	}

	ngAfterViewInit() {}

	geoLocation() {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					this.latitudeown = position.coords.latitude;
					this.longitudeown = position.coords.longitude;
					this.locationObtained = true;

					this.updateUserLocation().subscribe((res) => {
						this.grid.reloadData();
					});
				},
				(err) => {
					this.error = `Error: ${err.message}`;
					this.locationObtained = true;
				}
			);
		} else {
			this.error = "Geolocalización no compatible en este navegador.";
			this.locationObtained = true;
		}
	}

	updateUserLocation(): Observable<any> {
		const conf = this.userGeolocationService.getDefaultServiceConfiguration("users");
		this.userGeolocationService.configureService(conf);
		if (this.locationObtained && this.userGeolocationService !== null) {
			const filter = {
				USER_: this.user,
			};
			const columns = { U_LATITUDE: this.latitudeown, U_LONGITUDE: this.longitudeown };
			return this.userGeolocationService.update(filter, columns, "user");
		}
		return of(null);
	}
	public openDetail(data: any): void {
		this.dialog.open(AnnouncesDetailComponent, {
			height: "660px",
			width: "1500px",
			data: data,
		});
	}

	loadAnnounces(event) {
		this.clearMarkers();
		const iconMapping = {
			BRICKWORK: "../assets/images/ladrillo.svg",
			PLUMBING: "../assets/images/gota.svg",
			ELECTRICITY: "../assets/images/rayo.svg",
			TECHNICAL_SERVICE: "../assets/images/memory_black_24dp.svg",
			CLEANING: "../assets/images/cleaning_services_black_24dp.svg",
			ANTENIST: "../assets/images/settings_input_antenna_black_24dp.svg",
			MOVING: "../assets/images/local_shipping_black_24dp.svg",
			LOCKSMITH: "../assets/images/key.svg",
		};
		for (const announce of event) {
			if (this.selectedService === null || announce.S_NAME === this.selectedService) {
				const iconUrl = iconMapping[announce.S_NAME] || "url_default.png";
				const icon = L.icon({
					iconUrl: iconUrl,
					iconSize: [32, 32],
					iconAnchor: [16, 32],
				});

				const marker = L.marker([announce.A_LATITUDE, announce.A_LONGITUDE], {
					icon: icon,
				})
					.addTo(this.oMapMarker.getLMap())
					.on("click", () => this.openDetail(announce));

				this.markers.push(marker);
			}
		}
		const ownmarker = L.marker([this.latitudeown, this.longitudeown]).addTo(
			this.oMapMarker.getLMap()
		);
		this.markers.push(ownmarker);
	}
	createFilter(values: Array<{ attr; value }>): Expression {
		let filters: Array<Expression> = [];
		let hourfilters: Array<Expression> = [];
		let differentDayFiltersStart: Array<Expression> = [];
		let differentDayFiltersEnd: Array<Expression> = [];
		let hour;
		values.forEach((fil) => {
			if (fil.value) {
				fil.value = fil.value.concat(':00');
				if (fil.attr === "announceCombo") {
					filters.push(FilterExpressionUtils.buildExpressionEquals("S_NAME", fil.value));
				}
				if (fil.attr === "hour") {
					const sameDayFilters = [];
				
					sameDayFilters.push(FilterExpressionUtils.buildExpressionLessEqual("A_START_HOUR", fil.value));
					sameDayFilters.push(FilterExpressionUtils.buildExpressionMoreEqual("A_FINISH_HOUR", fil.value));
					sameDayFilters.push(FilterExpressionUtils.buildExpressionLike("MULTI_DAY", "FALSE"))
				
					const sameDay = sameDayFilters.length > 0 ?
						sameDayFilters.reduce((exp1, exp2) => FilterExpressionUtils.buildComplexExpression(exp1, exp2, FilterExpressionUtils.OP_AND)) :
						null;
					
					hourfilters.push(sameDay);
					
					
					differentDayFiltersStart.push(FilterExpressionUtils.buildExpressionLessEqual("A_START_HOUR", fil.value))
					differentDayFiltersStart.push(FilterExpressionUtils.buildExpressionLike("MULTI_DAY", "TRUE"))
					
					const differentDayStart = differentDayFiltersStart.length > 0 ?
					differentDayFiltersStart.reduce((exp1, exp2) => FilterExpressionUtils.buildComplexExpression(exp1, exp2, FilterExpressionUtils.OP_AND)) :
					null;

					hourfilters.push(differentDayStart);

					differentDayFiltersEnd.push(FilterExpressionUtils.buildExpressionMoreEqual("A_FINISH_HOUR", fil.value))
					differentDayFiltersEnd.push(FilterExpressionUtils.buildExpressionLike("MULTI_DAY", "TRUE"))
					
					const differentDayEnd = differentDayFiltersEnd.length > 0 ?
					differentDayFiltersEnd.reduce((exp1, exp2) => FilterExpressionUtils.buildComplexExpression(exp1, exp2, FilterExpressionUtils.OP_AND)) :
					null;

					hourfilters.push(differentDayEnd);		
					
					if (hourfilters.length > 0){
						hour = hourfilters.reduce((exp1, exp2) => FilterExpressionUtils.buildComplexExpression(exp1, exp2, FilterExpressionUtils.OP_OR))
					};
					
					filters.push(hour);
				
				} 
			}

		});

		if (filters.length > 0) {
			return filters.reduce((exp1, exp2) =>
				FilterExpressionUtils.buildComplexExpression(exp1, exp2, FilterExpressionUtils.OP_AND)
			);
		} else {
			return null;
		}
	}

	clearMarkers() {
		for (const marker of this.markers) {
			marker.remove();
		}
		this.markers = [];
	}
	getPositionGPS() {
		if (!isNaN(this.latitudeown) && !isNaN(this.longitudeown)) {
			let location = `${this.latitudeown},${this.longitudeown}`;
			return location;
		}
	}
	getFormattedTime(time: string): string {
		// Formatear el tiempo para mostrar solo horas y minutos
		const [hours, minutes] = time.split(':');
		return `${hours}:${minutes}`;
	  }
	  
}
