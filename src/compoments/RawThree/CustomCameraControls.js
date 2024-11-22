import * as THREE from 'three';


class CustomCameraControls extends THREE.Controls {
    constructor(object, domElement) {
        super(object, domElement);
        this.camera = this.object
        this.enabled = true;
        this.moveSpeed = 1.5;
        this.rotateSpeed = 1.0;
        this.keys = {}
        this._isDragging = false;
        this._mouseDownPosition = new THREE.Vector2();
        this._currentMousePosition = new THREE.Vector2();

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);
        this._onWheel = this._onWheel.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this.update = this.update.bind(this);

        this.domElement.addEventListener('pointerdown', this._onPointerDown);
        this.domElement.addEventListener('pointermove', this._onPointerMove);
        this.domElement.addEventListener('pointerup', this._onPointerUp);
        this.domElement.addEventListener('wheel', this._onWheel);
        console.log("window.addevent listener : keydown")
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
    }
    dispose() {
        this.domElement.removeEventListener('pointerdown', this._onPointerDown);
        this.domElement.removeEventListener('pointermove', this._onPointerMove);
        this.domElement.removeEventListener('pointerup', this._onPointerUp);
        
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }
    _onPointerDown(event) {
        if (!this.enabled) return;

        if (event.button === 0) { // 左键点击
            this._isDragging = true;
            this._mouseDownPosition.set(event.clientX, event.clientY);
            this.domElement.setPointerCapture(event.pointerId);
        }
    }
    _onPointerMove(event) {
        if (!this.enabled || !this._isDragging) return;

        this._currentMousePosition.set(event.clientX, event.clientY);

        const deltaX = (this._currentMousePosition.x - this._mouseDownPosition.x) * this.rotateSpeed;
        const deltaY = (this._currentMousePosition.y - this._mouseDownPosition.y) * this.rotateSpeed;

        // 获取摄像头当前的局部 Y 轴
        const localYAxis = new THREE.Vector3(0, 1, 0);
        const yawAngle = -deltaX * 0.003; // 调整航向角
        const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(localYAxis, yawAngle);
        this.camera.quaternion.premultiply(yawQuaternion);


        const standardXAxis = new THREE.Vector3(1, 0, 0);
        const localXAxis = standardXAxis.applyQuaternion(this.object.quaternion);
        const rowAngle = - deltaY * 0.003; // 调整航向角
        const rowuaternion = new THREE.Quaternion().setFromAxisAngle(localXAxis, rowAngle);
        this.camera.quaternion.premultiply(rowuaternion);


        this._mouseDownPosition.copy(this._currentMousePosition);
    }
    _onPointerUp(event) {
        if (!this.enabled || !this._isDragging) return;

        this._isDragging = false;
        this.domElement.releasePointerCapture(event.pointerId);
    }

    _onWheel(event) {
        if (!this.enabled) return;

        const delta = Math.max(-1, Math.min(1, event.deltaY)); // 获取滚轮的方向
        const zoomAmount = delta * this.moveSpeed;
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.camera.quaternion);

        // console.log("滚轮移动", forward, zoomAmount)
        this.camera.position.add(forward.clone().multiplyScalar(zoomAmount));
    }
    _onKeyDown( event) {
        if (!this.enabled) return;
        if (this.keys[event.key.toLowerCase()]) return ;
        this.keys[event.key.toLowerCase()] = true;
        // console.log("按下", event.key.toLowerCase() )
        if (event.key.toLowerCase() == 'shift') 
            this.moveSpeed *= 4;
        return ;
    }
    _onKeyUp( event) {
        if (!this.enabled) return;
        if (!this.keys[event.key.toLowerCase()]) return ;
        this.keys[event.key.toLowerCase()] = false;
        // console.log("松开", event.key.toLowerCase() )
        if (event.key.toLowerCase() == 'shift') 
            this.moveSpeed /= 4;
        return ;
    }
    update()
    {
        const keys = this.keys;
        var moveVector = new THREE.Vector3();
        var moveSpeed = this.moveSpeed; // 移动速度
        var direction = new THREE.Vector3(); 
        var right = new THREE.Vector3();
        var up = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        direction.y = 0
        direction.normalize()
        right.crossVectors(this.camera.up, direction).normalize();
        up.crossVectors(direction, right).normalize();
        
        if (keys["w"] || keys["W"]) {
            moveVector.addScaledVector(direction, moveSpeed); // 向前移动
        }
        if (keys["s"] || keys["S"]) {
            moveVector.addScaledVector(direction, -moveSpeed); // 向后移动
        }
        if (keys["a"] || keys["A"]) {
            moveVector.addScaledVector(right, moveSpeed); // 向左移动
        }
        if (keys["d"] || keys["D"]) {
            moveVector.addScaledVector(right, -moveSpeed); // 向右移动
        }
        if (keys["q"] || keys["Q"]) {
            moveVector.addScaledVector(up, -moveSpeed); // 向左移动
        }
        if (keys["e"] || keys["E"]) {
            moveVector.addScaledVector(up, moveSpeed); // 向右移动
        }
        this.camera.position.add(moveVector);
        if(this.camera.position.y <= 2) 
            this.camera.position.y = 2;
    }
}





export { CustomCameraControls };