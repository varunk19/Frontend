import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as THREE from 'three';
import countries from '../../assets/custom.geo.json';
import lines from '../../assets/lines.json';
import map from '../../assets/map.json';
import ThreeGlobe from 'three-globe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent{

  loginForm: FormGroup;
  ctrs: any = JSON.parse(JSON.stringify(countries));
  mp: any = JSON.parse(JSON.stringify(map));

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({});
    setTimeout(() => {
      this.initThreeGlobe();
    }, 0);
  }

  initThreeGlobe() {
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('globeDiv')!.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight(0xbbbbbb,0.3);
    scene.add(ambientLight);
    scene.background = new THREE.Color(0x040d21);

    const camera = new THREE.PerspectiveCamera();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    const dLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dLight.position.set(-800, 2000, 400);
    camera.add(dLight);

    const dLight1 = new THREE.DirectionalLight(0x7982f6, 1);
    dLight1.position.set(-200, 500, 200);
    camera.add(dLight1);

    const dLight2 = new THREE.DirectionalLight(0x8566cc, 0.5);
    dLight2.position.set(-200, 500, 200);
    camera.add(dLight2);

    camera.position.z = 250;
    camera.position.y = 0;
    camera.position.x = 0;
    scene.add(camera);

    scene.fog = new THREE.Fog(0x535ef3, 400, 2000);

    const globe = new ThreeGlobe({
      waitForGlobeReady: true,
      animateIn: true,
    })
    .hexPolygonsData(this.ctrs.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .showAtmosphere(true)
    .atmosphereColor('#3a228a')
    .atmosphereAltitude(0.25);

    setTimeout(() => {
      globe.arcsData(lines['routes']).arcColor((e: any)=> {
        return '#ffffff';
      }).arcAltitude((e: any) => {
        return e.arcAlt;
      }).arcStroke((e: any) => {
        return 0.3;
      }).arcDashLength(0.9).arcDashGap(4).arcDashAnimateTime(1000).arcsTransitionDuration(1000)
      .arcDashInitialGap((e: any) => e.order*1)
      .pointsData(this.mp.maps).pointColor(() => "#ffffff").pointsMerge(true).pointAltitude(0).pointRadius(0.05);
    },500);


    globe.rotateY(-Math.PI*(5/9));
    globe.rotateX(-Math.PI/6);
    const globeMaterial = globe.globeMaterial() as THREE.MeshPhongMaterial;
    globeMaterial.color = new THREE.Color(0x3a228a);
    globeMaterial.emissive = new THREE.Color(0x220038);
    globeMaterial.emissiveIntensity = 0.1;
    globeMaterial.shininess = 0.7;

    scene.add(globe);

    const render = () => {
      globe.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), 0.002);
      renderer.render(scene, camera);
    };
    const animate = () => {
      requestAnimationFrame(animate);
      render();
    }
    animate();
  }

  // initGlobe() {
  //   // Initialize the globe
  //   const scene = new THREE.Scene();
  //   const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('globe')!});
  //   renderer.setSize(window.innerWidth, window.innerHeight-4);
  //   document.getElementById('globeDiv')!.appendChild(renderer.domElement);

  //   const earthGeometry = new THREE.SphereGeometry(0.55, 32, 32);
  //   const earthMaterial = new THREE.MeshPhongMaterial({
  //     map: new THREE.TextureLoader().load('assets/worldMap.jpg'),
  //     bumpMap: new THREE.TextureLoader().load('assets/earthBump.jpg'),
  //     bumpScale: 20
  //   });
  //   const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  //   scene.add(earthMesh);

  //   const starGeometry = new THREE.SphereGeometry(5, 64, 64);
  //   const starMaterial = new THREE.MeshBasicMaterial({
  //     map: new THREE.TextureLoader().load('assets/galaxy.png'),
  //     side: THREE.BackSide
  //   });
  //   const starMesh = new THREE.Mesh(starGeometry, starMaterial);
  //   scene.add(starMesh);

  //   const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  //   scene.add(ambientLight);
  //   const pointerLight = new THREE.PointLight(0x0099ff, 5,0,0);
  //   pointerLight.position.set(10, 10, 15);
  //   scene.add(pointerLight);

  //   const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  //   camera.position.z = 1.5;
  //   const render = () => {
  //     earthMesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), 0.002);
  //     renderer.render(scene, camera);
  //   };



  //   const animate = () => {
  //     requestAnimationFrame(animate);
  //     render();
  //   }
  //   animate();
  // }

  onSubmit() {
    this.router.navigate(['/dashboard']);
  }
}
