import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Cesium3DTileset } from 'three-cesium';

const Earth = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        // 初始化场景
        const scene = new THREE.Scene();
        
        // 创建相机
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 2;

        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // 加载地球纹理
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/earth.jpg');

        // 创建地球几何体
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ map: earthTexture });
        const earth = new THREE.Mesh(geometry, material);
        scene.add(earth);

        // 添加光源
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 3, 5);
        scene.add(light);

        // 渲染函数
        const animate = () => {
            requestAnimationFrame(animate);
            earth.rotation.y += 0.005; // 地球自转
            renderer.render(scene, camera);
        };

        animate();

        // 监听窗口大小改变事件，更新渲染器大小
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        });

        return () => {
            // 组件卸载时清理工作
            window.removeEventListener('resize', () => {});
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default Earth;