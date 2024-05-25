import { Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as map from '../../assets/map.json';
import { FlightDataService } from '../services/flight-data/flight-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @ViewChild('map') mapContainer!: ElementRef;


  activeTab: String = 'Risks';
  loading: boolean = false;
  callApi: boolean = false;
  weatherAlerts: any = [];
  err: String = '';
  risks: any = [];
  selectedTabData: any = [];
  tabs: any[] = [ 
    {
      name: 'Risks',
      link: '/risks',
      showDotOnTab1: false
    },
    {
      name: 'Weather',
      link: '/weather',
      showDotOnTab1: false
    },
  ];
  weatherMetrics: any = {
    wind: '',
    vsblty: '',
    temp: '',
    hmdty: '',
    press: ''
  };
  flightMetrics: any = {
    alt: 0,
    grSpeed: '',
    heading: 0
  };
  constructor(private flightDataService: FlightDataService, private router: Router) {
    if(!sessionStorage.getItem('userId')) {
      sessionStorage.clear();
      this.router.navigate(['/login']);
    }
    this.callApi = true;
    this.fetchFlightPlan();
    
    setInterval(() => {
      this.callApi = true;
    }, 5000);
    // setInterval(() => {
    //   this.fetchRisks(); 
    // },10000);
  }
  
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  drawMap(stops: any) {
    d3.select(this.mapContainer.nativeElement).selectAll("svg").remove();
    const width = 900;
    const height = 765;
    const svg = d3.select(this.mapContainer.nativeElement).append('svg')
      .attr('width', width)
      .attr('height', height);
    const projection = d3.geoMercator().scale(140).translate([width/2, height/2*1.3]);
    const links: any[] = [
      {type: "LineString", coordinates: []}
    ];
    links[0].coordinates = [...stops];
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
    const uniqueAirports = Object.values(map['maps'].reduce((acc: any, obj) => {
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
  
      const tick = () => {
        let t = (Date.now() % 10000) / 10000;
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
        let latLong = projection.invert!([point.x, point.y]);
        let latitude = latLong![1];
        let longitude = latLong![0];
        if(this.callApi) {
          this.callWeather(latitude, longitude);
          this.callFlightHealth(latitude, longitude);
          this.callWeatherAlerts(latitude, longitude);
          this.callStaticWeatherAlerts(latitude, longitude);
          this.fetchRisks();
        }
        img.attr('x', transformedPoint[0] - 10)
            .attr('y', transformedPoint[1] - 10)
            .attr('transform', `rotate(${angle}, ${transformedPoint[0]}, ${transformedPoint[1]})`);
    
        requestAnimationFrame(tick);
      }
  
       
  
      tick();
  
      svg.style("background-color", "black");
    });
  }

  tabClicked(tab: any) {
    this.activeTab = tab;
    if(this.selectedTabData == 'Risks') {
      this.selectedTabData = this.risks;
    } else if(this.selectedTabData == 'Weather') {
      this.selectedTabData = this.weatherAlerts;
    }
  }

  selectRoute(route: any) {
    this.drawMap(route);
  }

  fetchFlightPlan() {
    this.flightDataService.getFlightPlan(sessionStorage.getItem('userId') || '').subscribe((data: any) => {
      this.drawMap(data);
      sessionStorage.setItem("dashboard", 'true');
    }, (error) => {
      this.err = 'Failed to fetch flight plan';
      this.router.navigateByUrl('/flight-plan');
      sessionStorage.setItem("dashboard", 'false');
    });
  }

  fetchRisks() {
    let risks = [
      'Risk of fuel shortage due to unexpected weather conditions.',
      'Risk of engine failure due to mechanical issues.',
      'Risk of tire burst during landing.',
      'Risk of hydraulic system failure.',
      'Risk of electrical system malfunction.'
    ];
  
    let randomIndex = Math.floor(Math.random() * risks.length);
    this.risks.push(risks[randomIndex]);
  }

  callWeather(lat: any, lon: any) {
    this.flightDataService.callWeather(lat, lon).subscribe((data: any) => {
      this.weatherMetrics.wind = ''+data.wind.deg+''+parseInt(data.wind.speed)+'G'+parseInt(data.wind.gust)+'KT';
      this.weatherMetrics.vsblty = ''+data.visibility/10000;
      this.weatherMetrics.temp = parseInt((data.main.temp-273.15).toString())+'°C';
      this.weatherMetrics.hmdty = parseInt(data.main.humidity)+'%';
      this.weatherMetrics.press = parseInt(data.main.pressure)+'hPa';
    });
    this.callApi = false;
  }

  callFlightHealth(lan: any, lon: any) {
    this.flightDataService.getAirlineFlights('AIC').subscribe((data: any) => {
      let obj = data.find((e: any) => {
        return parseInt(e.latitude) == parseInt(lan) && parseInt(e.longitude) == parseInt(lon); 
      });
      if(obj && obj.altitude)
        this.flightMetrics.alt = obj.altitude || 3000;
      if(obj && obj.groundspeed)
        this.flightMetrics.grSpeed = obj.groundspeed || 400;
      if(obj && obj.heading)
        this.flightMetrics.heading = obj.heading;
      console.log(this.flightMetrics);
    });
    this.callApi = false;
  }

  callWeatherAlerts(lat: any, lon: any) {
    this.flightDataService.getWeatherAlerts(lat, lon).subscribe((data: any) => {
      this.weatherAlerts = data.alerts;
    });
    this.callApi = false;
  }

  callStaticWeatherAlerts(lat: any, lon: any) {
    let alerts = [
    `Severe Thunderstorm Alert: Expect heavy rain and strong winds at ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      `Turbulence Alert: Fasten your seatbelts and stay seated at ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      `Fog Alert: Low visibility conditions expected, proceed with caution at ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      `Snow Alert: Heavy snowfall predicted, potential for icy conditions at ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      `Rain Alert: Heavy rainfall expected, potential for slippery runways at ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    ];
  
    let randomIndex = Math.floor(Math.random() * alerts.length);
    this.weatherAlerts.push(alerts[randomIndex]);
  }
}
