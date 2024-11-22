import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import { CustomCameraControls } from "./CustomCameraControls.js";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { ThreeSceneManager } from './SceneBase.jsx';

let scene;
let camera;
let renderer;
let controls;
let tank;
let model;
let units = {};

const RawThree = () => {
  const mount = useRef(null);
  useEffect(() => {
    console.log("Calling Use Effect for RawThree");
    // 创建场景
    const scene_manager = new ThreeSceneManager(mount);
    scene_manager.init();

    const clock = new THREE.Clock()
    // 渲染循环
    var frame = 0;
    var flag = false;
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta()
      frame++;
      if (frame % 1000 === 0)
      {
        const delta = clock.getDelta();
        console.log(`1000 frame cost ${delta} ms`)
      }

      unit_step(scene_manager);
       
      const mesh_1 = scene_manager.getUnit(1);
      const mesh_2 = scene_manager.getUnit(2);
      if(mesh_1 && mesh_2 && !flag && mesh_1.mesh && mesh_2.mesh)
      {
        mesh_1.laserToMesh(mesh_2.mesh, 0xff0000,  10);
        flag = true;
      }
      scene_manager.update()
    };
    animate();

    scene_manager.updateUnits(
      [
        {
          id: 1,
          name: "tank-1",
          type: "tank",
          position: [0, 0, 0],
          angle: 0,
        },
        {
          id: 2,
          name: "四旋翼",
          type: "quadcopter",
          position: [300, 300, 50],
        },
      ]
    )
    

    // 清理函数
    return () => {
      console.log("清理所有资源")
      scene_manager.dispose();
    };
  }, []);

  return <div ref={mount} style={{ width: "100vw", height: "100vh" }}></div>; 
};
export default RawThree;


var cnt = 0
let units_info = [
  {
    id: 1,
    name: "tank-1",
    type: "tank",
    position: [0, 0, 0],
    angle: 0,
  },
  {
    id: 2,
    name: "四旋翼",
    type: "quadcopter",
    position: [300, 300, 50],
    angle: 0,
  },
]
function unit_step(scene_manager) {
  cnt +=1;
  if (cnt % 3 == 0) {
    tank = units_info[0];
    tank.position[0] += Math.sin(tank.angle) * 1;
    tank.position[2] += Math.cos(tank.angle) * 1;
    tank.angle = (tank.angle + 0.004) % (2 * Math.PI);
    scene_manager.updateUnits(units_info);
  }
  if (cnt % 5 == 0) {
    tank = units_info[1];
    tank.position[0] += Math.sin(tank.angle) * 1;
    tank.position[2] += Math.cos(tank.angle) * 1;
    tank.angle = (tank.angle + 0.001) % (2 * Math.PI);
    scene_manager.updateUnits(units_info);
  }

}
