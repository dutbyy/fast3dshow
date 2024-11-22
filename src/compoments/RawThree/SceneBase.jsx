import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { CustomCameraControls } from "./CustomCameraControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";

const NAME2MODEL = new Map([
  [
    "tank",
    {
      model: "t-90a.gltf",
      scale: [200, 200, 200],
      texture: "ddss/tank1.png",
      bias: [-1 / 200, 77 / 200, 12 / 200],
    },
  ],
  [
    "quadcopter",
    {
      model: "Quadcopter.stl",
      scale: [0.2, 0.2, 0.2],
    },
  ],
  [
    "mq1",
    {
      model: "MQ-1 Predator.stl",
      scale: [0.03, 0.03, 0.03],
    },
  ],
]);

class UnitMesh {
  constructor(config) {
    this.config = config;
    this.name = config.name;
    this.type = config.type; // "tank" | "quadcopter" | "mq1"
    this.mesh = null;
    this.model = null;
    this.add_to = this.add_to.bind(this);

    this.larser = null;
    this.larserTarget = null;
    this.search = null;
    this.searchConfig = null;
  }

  add_to(scene) {
    if (!this.mesh) {
      // console.log(`get model :  [${this.type}]`);
      let model_config = NAME2MODEL.get(this.type);
      // console.log(`model_config: ${model_config}`);
      // console.log(`model name : ${model_config.model}`, model_config);
      if (model_config.model.endsWith(".gltf")) {
        const loader = new GLTFLoader();
        const texture_loader = new TextureLoader();
        const texture = texture_loader.load("ddss/tank1.png");
        loader.load(model_config.model, (gltf) => {
          const model = gltf.scene;
          model.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
              child.material = new THREE.MeshBasicMaterial({
                map: texture,
                color: 0xffffff,
              });
              // console.log("child position is ", child.position)
              child.position.set(-1 / 200, 77 / 200, 12 / 200);
            }
          });
          model.scale.set(...model_config.scale);
          this.model = model;
          this.mesh = new THREE.Group();
          this.mesh.add(model);
          this.mesh.position.set(...this.config.position);
          scene.add(this.mesh);
        });
      } else {
        const loader = new STLLoader();
        loader.load(model_config.model, (geometry) => {
          const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.2,
            roughness: 0.5,
          });
          const model = new THREE.Mesh(geometry, material);
          model.scale.set(...model_config.scale);
          this.mesh = new THREE.Group();
          this.model = model;
          this.mesh.add(model);
          this.mesh.position.set(...this.config.position);
          scene.add(this.mesh);
        });
      }
    }
  }

  update(config) {
    if (!this.mesh) {
      return;
    }
    // console.log("Unit Mesh update :", config)
    // console.log("Unit Mesh update :", config.position)
    this.config = config;
    this.mesh.position.set(...config.position);
    if (config.angle && this.model) this.model.rotation.y = config.angle;
    if (this.larserTarget && this.larser) {
      // console.log("updateLarser!")
      this.updateLarser();
    }
  }

  laserToMesh(meshB, color = 0xff0000, radius = 1) {
    let meshA = this.mesh;
    this.larserTarget = meshB;
    console.log("calling create Larser!");
    // 获取两个Mesh的位置
    const startPoint = meshA.position.clone();
    const endPoint = meshB.position.clone();

    // 计算激光束的方向向量
    const direction = new THREE.Vector3();
    direction.subVectors(endPoint, startPoint);
    const length = direction.length();
    direction.normalize();

    // 创建圆柱体几何体
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 32);
    // 创建材质
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true, // 启用透明度
      opacity: 0.5,
    });
    // 创建激光束Mesh
    const laserBeam = new THREE.Mesh(geometry, material);

    // 设置激光束的位置和旋转
    laserBeam.position.set(0, 0, 0);
    laserBeam.position.add(direction.clone().multiplyScalar(length / 2));
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    laserBeam.quaternion.copy(quaternion);
    this.larser = laserBeam;
    this.mesh.add(this.larser);
    console.log("已经添加激光！！！");
  }

  updateLarser() {
    // return;
    // console.log("calling update Larser!")

    const meshA = this.mesh;
    const meshB = this.larserTarget;
    const laserBeam = this.larser;

    // 获取两个Mesh的位置
    const startPoint = meshA.position.clone();
    const endPoint = meshB.position.clone();
    // 计算激光束的方向向量
    const direction = new THREE.Vector3();
    direction.subVectors(endPoint, startPoint);
    const length = direction.length();
    direction.normalize();

    let radius = laserBeam.geometry.radius;
    laserBeam.geometry.dispose();
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 32);
    laserBeam.geometry = geometry;

    // 设置激光束的位置和旋转
    laserBeam.position.set(0, 0, 0);
    laserBeam.position.add(direction.clone().multiplyScalar(length / 2));
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    laserBeam.quaternion.copy(quaternion);
    this.larser = laserBeam;
    this.mesh.add(this.larser);
    // console.log("已经添加激光！！！")
  }

  createSearch2(meshA, radius, range = 10) {
    // 创建圆锥几何体
    console.log("creating Searching");
    const geometry = new THREE.ConeGeometry(1200, 1200, 32);
    // 创建材质
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.2,
      transparent: true,
    });
    // 创建圆锥Mesh
    const searchCone = new THREE.Mesh(geometry, material);
    // 设置圆锥的位置
    searchCone.position.set(600, 0, 0); // 圆锥中心位置在meshA前方range/2处
    searchCone.rotation.z = 3.1415926 / 2;
    // 将圆锥添加为meshA的子对象
    meshA.add(searchCone);
  }

  createSearch(meshA, radius, angle = Math.PI / 4, range = 10) {
    console.log("creating Searching");

    // 创建部分球体几何体
    const geometry = new THREE.SphereGeometry(
      radius,
      32,
      32,
      0,
      2 * Math.PI,
      0,
      angle
    );

    // 创建材质
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.2,
      transparent: true,
    });

    // 创建部分球体Mesh
    const searchSpherePart = new THREE.Mesh(geometry, material);

    // 设置部分球体的位置
    searchSpherePart.position.set(range / 2, 0, 0); // 球体中心位置在meshA前方range/2处

    // 将部分球体添加为meshA的子对象
    meshA.add(searchSpherePart);
  }
}

class ThreeSceneManager {
  constructor(mountRef) {
    this.mountRef = mountRef;
    this.scene = null;
    this.env = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.units = new Map();

    this.updateUnits = this.updateUnits.bind(this);
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize, false);
    window.addEventListener("UnitsEvent", this.updateUnits, false);
  }

  init() {
    this.initScene();
    this.initEnv();
    this.initCamera();
    this.initRenderer();
    this.initControls();
    this.mountRef.current.appendChild(this.renderer.domElement);
  }

  dispose() {
    window.removeEventListener("resize", this.handleResize, false);
    window.removeEventListener("UnitsEvent", this.updateUnits, false);
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement = null;
    this.renderer = null;
    this.mountRef.current.innerHTML = null;
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  updateUnits(units) {
    // console.log("updateUnits ", units)
    let uids = [];
    for (let unit_id in units) {
      let unit = units[unit_id];
      uids.push(unit.id);
      if (!this.units.get(unit.id)) {
        console.log(`new a Unit : ${unit}`);
        let unit_mesh = new UnitMesh(unit);
        unit_mesh.add_to(this.scene);
        this.units.set(unit.id, unit_mesh);
      } else {
        // console.log("lazy update unit : ", unit)
        const unit_mesh = this.units.get(unit.id);
        unit_mesh.update(unit);
      }
    }
    for (let unit_id in this.units) {
      if (!uids.includes(unit_id)) {
        if (this.units[unit_id].mesh) {
          this.scene.remove(this.units[unit_id].get());
        }
        delete this.units[unit_id];
        this.units.set(unit_id, null);
      }
      console.log("removing unit ", unit_id);
    }
  }

  update() {
    // for(let unit_id in this.units){
    //   this.units[unit_id].update();
    // }
    if (this.controls) this.controls.update();
    if (this.renderer) this.renderer.render(this.scene, this.camera);
  }

  initScene() {
    this.scene = new THREE.Scene();
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    this.camera.position.set(-600, 600, -600);
    this.camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), (-3 * Math.PI) / 4);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  initEnv() {
    this.env = new THREE.Group();
    this.initSky();
    this.initGround();
    this.initLight();
    const axesHelper = new THREE.AxesHelper(1000);
    this.env.add(axesHelper);
    this.scene.add(this.env);
  }

  initSky() {
    const skyGeometry = new THREE.SphereGeometry(10000, 128, 64);
    const texture = new THREE.TextureLoader().load("sky.png");
    console.log("loading map");
    const skyMaterial = new THREE.MeshBasicMaterial({
      map: texture, // 天空蓝
      side: THREE.BackSide, //默认正面可见，设置为背面可见即可
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.env.add(sky);
  }

  initGround(radius = 10000) {
    var textureLoader = new THREE.TextureLoader();
    var cubeMaterial = new THREE.MeshBasicMaterial({
      map: textureLoader.load("caodi.png"),
    });
    cubeMaterial.map.wrapS = THREE.RepeatWrapping;
    cubeMaterial.map.wrapT = THREE.RepeatWrapping;
    cubeMaterial.map.repeat.set(30, 30);
    const planeGeometry = new THREE.CircleGeometry((radius = radius));
    const ground = new THREE.Mesh(planeGeometry, cubeMaterial);
    ground.rotation.x = -0.5 * Math.PI;
    this.env.add(ground);
  }

  initLight() {
    const ambient = new THREE.AmbientLight(0xffffff, 2.4);
    this.env.add(ambient);
  }

  initControls() {
    this.controls = new CustomCameraControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
  }

  getUnit(unit_id) {
    // console.log(this.units);
    return this.units.get(unit_id);
  }
}
export { ThreeSceneManager };
