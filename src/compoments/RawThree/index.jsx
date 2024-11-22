import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import { CustomCameraControls } from "./CustomControls.js";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

var scene;
var camera;
var renderer;
var controls;
var tank;
var model;
var units = {};

const RawThree = () => {
  const mount = useRef(null);
  const mount2 = useRef(null);
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log(mount.current);
    // if (mount2.current) return ;
    mount2.current = 1;
    console.log("mount.current", mount.current)
    init_scene();
    scene = new THREE.Scene();
    camera = init_camera()
    renderer = init_renderer()
    mount.current.appendChild(renderer.domElement);
    let environment = init_env()
    scene.add(environment);
    controls = init_controls()

    // const fetchData = async () => {
    //   try {
    //     const response = await axios.get('https://api.example.com/data'); // 请替换为实际的API地址
    //     setData(response.data); // 更新状态
    //     console.log(response.data); // 打印数据到控制台
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //   }
    // };
    // fetchData();
    // const intervalId = setInterval(fetchData, 1000);
    // const stats = new Stats();

    const clock = new THREE.Clock()
    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta()
      // stats.update();
      // console.log("delta is ", delta)
      // console.log("stats is ", stats)
      // limitCameraYPosition();
      tank_step();
      // update_units(units);
      controls.update();
      renderer.render(scene, camera);
      if(units['mq-1'] && units['tank'] )
      { 
        // console.log(units['mq-1'], units['tank'] )
        if (!units['larser'])
        {
          var larser = createLaser(units['mq-1'], units['tank']);
          units['larser'] = larser;
          scene.add(larser);
        }
        else
          updateLarser(units["larser"], units['mq-1'], units['tank'])
      }
      
    };
    animate();

    // 监听窗口大小变化
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    const handleMessage = (event) => {
      console.log("UnitsEveet", event)
    };

    window.addEventListener('UnitsEveet', handleMessage);

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("UnitsEveet", handleMessage);
      renderer.dispose();
      scene.clear();
      mount.current.innerHTML = "";
      // clearInterval(intervalId);
    };
  }, []);

  return <div ref={mount} style={{ width: "100vw", height: "100vh" }}></div>; 
};
export default RawThree;

function init_scene() {
    console.log("init sceneray!");
}

function init_controls() {

  // const controller = new MapControls(camera, renderer.domElement);
  const controller = new CustomCameraControls(camera, renderer.domElement);
  controller.moveSpeed = 2;
  return controller;
}

function init_camera() {
  var camera = new THREE.PerspectiveCamera(
    50, // FOV 广角
    window.innerWidth / window.innerHeight,
    0.01,
    2000000,
  );
  camera.setFocalLength(10)
  camera.position.set(10, 500, 0);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}

function init_renderer() {
    var render = new THREE.WebGLRenderer({ antialias: true });
    render.setSize(window.innerWidth, window.innerHeight);
    return render;
}

function init_env() {
    const env_group = new THREE.Group();
  
    // 创建天空球
    // const sky = createSkyBox();
    const sky = createSky();
    env_group.add(sky);

    // 创建地面（岛屿）
    // const island = createIsland();
    const island = createPlaneGeometryBasicMaterial();
    env_group.add(island);

    // 创建水面
    // const water = createWater();
    // env_group.add(water);

    const axesHelper = new THREE.AxesHelper(1000);
    // env_group.add(axesHelper);

   
    // 创建光源
    const directionalLight = createDirectionalLight();
    env_group.add(directionalLight);

    load_ludeng();


    return env_group;
}


// 创建天空球
function createSky() {
  const skyGeometry = new THREE.SphereGeometry(10000, 128, 64);
  const texture = new THREE.TextureLoader().load("image.png");
  console.log("loading map");
  const skyMaterial = new THREE.MeshBasicMaterial({
    // color: 0x00ccff,        // 天空蓝
    map: texture, // 天空蓝
    side: THREE.BackSide, //默认正面可见，设置为背面可见即可
  });
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  return sky;
}

function createPlaneGeometryBasicMaterial() {
  var textureLoader = new THREE.TextureLoader();
  var cubeMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load("caodi.png"),
  });
  cubeMaterial.map.wrapS = THREE.RepeatWrapping;
  cubeMaterial.map.wrapT = THREE.RepeatWrapping;
  cubeMaterial.map.repeat.set(30, 30);


  // 创建地平面并设置大小
  var planeGeometry = new THREE.CircleGeometry(10000)
  // var planeGeometry = new THREE.PlaneGeometry(800, 800);
  var plane = new THREE.Mesh(planeGeometry, cubeMaterial);

  // 设置平面位置并旋转
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 0;
  plane.position.z = 0;
  return plane;
}

// 创建光源
function createDirectionalLight() {
  const env_group = new THREE.Group();

  // const directionalLight = new THREE.DirectionalLight(0xffffff, 5.0);
  // directionalLight.position.set(50000, 50000,  8000);
  // env_group.add(directionalLight);

  // const directionalLight2 = new THREE.DirectionalLight(0xffffff, 104.0);
  // directionalLight.position.set(-50000, -50000,  8000);

  const ambient = new THREE.AmbientLight(0xffffff, 2.4);
  env_group.add(ambient); 
  // env_group.add(directionalLight2);
  return env_group;
}

function load_ludeng() {
  create_tank();
}

function create_tank() {
  const loader = new GLTFLoader();
  const texture_loader = new TextureLoader();
  const texture = texture_loader.load('ddss/tank1.png');
  loader.load('t-90a.gltf', function ( gltf ) {
    model = gltf.scene;
    model.traverse( function(child) {

      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({
          map: texture,
          color: 0xffffff
        });
        // console.log("child position is ", child.position)
        child.position.set(-1/200,77/200,12/200)
      }
    })
    model.position.set(0, 0, 0);
    model.scale.set(200, 200, 200);
    tank = new THREE.Object3D()
    tank.add(model);
    tank.position.set(0, 0, 0);
    units['tank'] = tank;
    scene.add(tank);
    createSearch(tank, 80, 1);
  });

  var stlloader = new STLLoader()
  stlloader.load('Quadcopter.stl', function (geometry) {
    const material = new THREE.MeshStandardMaterial ({ color: 0xffffff, metalness: 0.2, roughness: 0.5 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(30, 30, 100)
    mesh.scale.set(0.05, 0.05, 0.05);
    scene.add(mesh);
    units['quad'] = mesh;
    // createSearch(mesh, 1, 1);
  });

  stlloader.load('MQ-1 Predator.stl', function (geometry) {
    const material = new THREE.MeshStandardMaterial ({ color: 0xffffff, metalness: 0.2, roughness: 0.5 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(-30, 30, 100)
    mesh.scale.set(0.03, 0.03, 0.03);
    scene.add(mesh);
    units['mq-1'] = mesh;
  });


}


function update_units(units) {
  console.log("calling update units")
  units.map(item => item*2);
}

function update_unit(unit) {
  console.log(unit);
}

var cnt = 0
function tank_step() {
  // return;
  if (!tank) return;
  cnt+=1;
  if (1 )
  {
      // const localYAxis = new THREE.Vector3(0, 1, 0);
      // const yawAngle = - 3.141592653 / 2 / 90 / 4;
      // const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(localYAxis, yawAngle);
      // tank.quaternion.premultiply(yawQuaternion);
      tank.rotation.y = 2 * Math.PI / 700 * (cnt % 700);
  }
  if(1) {
    var moveSpeed = 1; // 移动速度
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(tank.quaternion);
    tank.position.add(forward.clone().multiplyScalar(moveSpeed));
  }
}

function createLaser(meshA, meshB, color = 0xff0000, radius = 0.2) {
    console.log("calling create Larser!")
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
    const material = new THREE.MeshBasicMaterial({ color: color });

    // 创建激光束Mesh
    const laserBeam = new THREE.Mesh(geometry, material);

    // 设置激光束的位置和旋转
    laserBeam.position.copy(startPoint);
    laserBeam.position.add(direction.clone().multiplyScalar(length / 2));

    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    laserBeam.quaternion.copy(quaternion);

    return laserBeam;
}


function updateLarser(laserBeam, meshA, meshB) {
  // 获取两个Mesh的位置
  const startPoint = meshA.position.clone();
  const endPoint = meshB.position.clone();

  // 计算激光束的方向向量
  const direction = new THREE.Vector3();
  direction.subVectors(endPoint, startPoint);
  const length = direction.length();
  direction.normalize();

  // 更新激光束的几何体
  laserBeam.geometry.dispose();
  laserBeam.geometry = new THREE.CylinderGeometry(0.05, 0.05, length, 32);

  // 更新激光束的位置和旋转
  laserBeam.position.copy(startPoint);
  laserBeam.position.add(direction.clone().multiplyScalar(length / 2));

  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  laserBeam.quaternion.copy(quaternion);
}

function createSearch(meshA, radius, range = 10) {
  // 创建圆锥几何体
  console.log("creating Searching")
  const geometry = new THREE.ConeGeometry(1200, 1200, 32);
  // 创建材质
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.2, transparent: true });
  // 创建圆锥Mesh
  const searchCone = new THREE.Mesh(geometry, material);
  // 设置圆锥的位置
  searchCone.position.set(600, 0, 0); // 圆锥中心位置在meshA前方range/2处
  searchCone.rotation.z = 3.1415926 / 2
  // 将圆锥添加为meshA的子对象
  meshA.add(searchCone);
}


//