import { Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as maps from '../../assets/map.json';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map,Observable, of, startWith, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { FlightDataService } from '../services/flight-data/flight-data.service';

@Component({
  selector: 'app-flight-plan',
  templateUrl: './flight-plan.component.html',
  styleUrl: './flight-plan.component.scss'
})
export class FlightPlanComponent {

  @ViewChild('map') mapContainer!: ElementRef;
  src = new FormControl();
  exc = new FormControl();
  inc = new FormControl();
  dest = new FormControl();

  filteredOptions1: Observable<string[]> | undefined;
  filteredOptions2: Observable<string[]> | undefined;
  filteredOptions3: Observable<string[]> | undefined;
  filteredOptions4: Observable<string[]> | undefined;
  
  addinc: boolean = false;
  addexc: boolean = false;
  loading: boolean = false;
  viewportHeight: number | undefined;
  
  namesWithCoords: any[] = [];
  airportsDropdown: any[] = [];
  routes: any[] = [];
  dashboard: boolean = false;
  selectedRoute: any = {};
  err: String = '';

  constructor(private router: Router, private flightDataService: FlightDataService) { 
    if(!sessionStorage.getItem('userId')) {
      sessionStorage.clear();
      this.router.navigate(['/login']);
    }
    if(sessionStorage.getItem('dashboard') === 'true') {
      this.dashboard = true;
    }
    this.filteredOptions1 = this.src.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this._filter(value || '')),
      map(options => {
        this.updateViewportHeight(options.length);
        return options;
      })
    );
    this.filteredOptions3 = this.exc.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this._filter(value || '')),
      map(options => {
        this.updateViewportHeight(options.length);
        return options;
      })
    );
    this.filteredOptions2 = this.inc.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this._filter(value || '')),
      map(options => {
        this.updateViewportHeight(options.length);
        return options;
      })
    );
    this.filteredOptions4 = this.dest.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this._filter(value || '')),
      map(options => {
        this.updateViewportHeight(options.length);
        return options;
      })
    );
  }

  private _filter(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    return of(this.namesWithCoords.filter(option => option.name.toLowerCase().includes(filterValue)));
  }

  selectRoute(route: any) {
    this.selectedRoute = route;
    this.drawMap(route.stops);
  }

  private updateViewportHeight(numberOfOptions: number): void {
    const itemSize = 48; // height of each item
    const maxVisibleItems = 5; // maximum number of items to display without scrolling
    this.viewportHeight = Math.min(numberOfOptions, maxVisibleItems) * itemSize;
  }

  createFlightPlan() {
    let temp:any[] = [];
    this.selectedRoute.stops.forEach((stop: any) => {
      temp.push(stop.coords);
    });
    this.flightDataService.createFlightPlan(sessionStorage.getItem('userId')!, JSON.stringify(temp)).subscribe((res) => {
      this.router.navigate(['/dashboard']);
      sessionStorage.setItem('dashboard', 'true');
    }, (err) => {
      this.err = 'Error creating flight plan';
      setTimeout(() => {
        this.err = '';
      }, 5000);
    });
  }

  fetchRoutes() {
    this.flightDataService.getRoutes(this.src.value,this.dest.value,this.inc.value,this.exc.value).subscribe((res) => {
      res.forEach((route: any) => {
        let temp = '';
        route.stops.forEach((stop: any,i: number) => {
          temp += stop.name;
          temp += i === route.stops.length-1 ? '' : ' -> ';
        });
        this.routes.push({route: temp, duration: route.duration});
      });
    }, (err) => {
      this.err = 'Error fetching routes';
      setTimeout(() => {
        this.err = '';
      }, 5000);
    });
  }

  drawMap(stops: any) {
    const width = 900;
    const height = 765;
    const svg = d3.select(this.mapContainer.nativeElement).append('svg')
      .attr('width', width)
      .attr('height', height);
    const projection = d3.geoMercator().scale(140).translate([width/2, height/2*1.3]);
    const links = [
      {type: "LineString", coordinates: [
        ...stops
      ]}
    ];
    const g = svg.append('g');
    const mapGroup = g.append('g'); // Group for map paths and airport circles
  
    let currentTransform = d3.zoomIdentity;
  
    let imgPath = '/assets/circle.svg';
    let img = svg.append('image')
      .attr('xlink:href', imgPath)
      .attr('width', 20)
      .attr('height', 20)
      .attr('x', 0)
      .attr('y', 0)
      .attr('transform', 'rotate(270, 10, 10');
  
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 100])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        mapGroup.attr('transform', event.transform);
        currentTransform = event.transform;
      });
    svg.call(zoom);
  
    const path = d3.geoPath().projection(projection);
    const airports: any[] = [];
    const names: any[] = [];
    const uniqueAirports = Object.values(maps['maps'].reduce((acc: any, obj) => {
      if (obj.text.length <= 4) {
        if (!acc[obj.city] || obj.text.length > acc[obj.city].text.length) {
          acc[obj.city] = obj;
        }
      }
      return acc;
    }, {}));
    uniqueAirports.forEach((d: any) => {
      let temp = [parseFloat(d.lng)*(-1),parseFloat(d.lat)];
      airports.push([temp[0]*(-1), temp[1]]);
      names.push(d.text);
      this.namesWithCoords.push({name: d.text, coords: JSON.stringify([temp[0]*(-1), temp[1]])});
    });
  
    d3.json('assets/custom.geo.json').then((data: any) => {
      const mapPaths = mapGroup.selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("fill", "#0328fc")
        .attr("d", path as any)
        .style("stroke", "#fff")
        .style("stroke-width", 0);
  
      const airportLabels = mapGroup.selectAll("text")
        .data(names)
        .enter().append("text")
        .attr("x", (d, i) => projection(airports[i])![0])
        .attr("y", (d, i) => projection(airports[i])![1])
        .text(d => d)
        .attr("font-family", "sans-serif")
        .attr("font-size", "0.5px")
        .attr("fill", "white");
  
      const airportCircles = mapGroup.selectAll("circle")
        .data(airports)
        .enter().append("circle")
        .filter(d => {
          const projectedCoords = projection(d);
          return projectedCoords != null && !isNaN(projectedCoords![0]) && !isNaN(projectedCoords![1]);
        })
        .attr("cx", d => projection(d)![0])
        .attr("cy", d => projection(d)![1])
        .attr("r", 0.07)
        .style("fill", "white");
  
      let currentLinkIndex = 0;
      const pathNodes: SVGPathElement[] = [];
  
      links.forEach(link => {
        const pathNode = mapGroup.append("path")
          .attr("d", path(link as any))
          .style("fill", "none")
          .style("stroke", "orange")
          .style("stroke-width", 2)
          .style("opacity", 0.7)
          .node() as SVGPathElement;
  
        pathNodes.push(pathNode);
      });
  
      function tick() {
        let t = (Date.now() % 3000) / 3000;
        let point = pathNodes[0].getPointAtLength(t * pathNodes[0].getTotalLength());
        let angle;
        if (currentLinkIndex === 0) {
          angle = Math.atan2(point.y, point.x) * (180 / Math.PI) - 90+140;
          currentLinkIndex = 1;
        } else {
          // let prevPoint = pathNodes[0].getPointAtLength((t - 0.01) * pathNodes[0].getTotalLength());
          angle = angle = Math.atan2(point.y, point.x) * (180 / Math.PI) - 90+140+180;
          currentLinkIndex = 0;
        }
        let transformedPoint = currentTransform.apply([point.x, point.y]);
        img.attr('x', transformedPoint[0] - 10)
            .attr('y', transformedPoint[1] - 10)
            .attr('transform', `rotate(${angle}, ${transformedPoint[0]}, ${transformedPoint[1]})`);
    
        requestAnimationFrame(tick);
      }
  
       
  
      tick();
  
      svg.style("background-color", "black");
    });
  }
}
