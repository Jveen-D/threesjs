import * as THREE from "three";
import GUI from 'lil-gui';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface ThreeClassProps {
    wrapperRef: React.RefObject<HTMLDivElement>;
}
export default class {
    wrapperRef: React.RefObject<HTMLDivElement>;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    controls?: OrbitControls;
    camera?: THREE.PerspectiveCamera;
    gui: GUI;
    constructor(props: ThreeClassProps) {
        this.wrapperRef = props.wrapperRef;
        const width = this.wrapperRef.current?.clientWidth as number;
        const height = this.wrapperRef.current?.clientHeight as number;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.gui = new GUI();

        this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
        this.camera.position.set(200, 200, 200);
        this.camera.lookAt(0, 0, 0);
        this.renderer.setSize(width, height)
        this.renderer.render(this.scene, this.camera);
        this.wrapperRef.current?.appendChild(this.renderer.domElement);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        this.init();
        const render = () => {
            this.renderer.render(this.scene, this.camera as THREE.Camera);
            requestAnimationFrame(render);
        }

        render();
    }
    init() {

        const camera2 = new THREE.PerspectiveCamera(20, 16 / 9, 100, 300);
        const cameraHelper = new THREE.CameraHelper(camera2);
        this.scene.add(cameraHelper);

        
        function onChange() {
            camera2.updateProjectionMatrix();
            cameraHelper.update();
        }
        this.gui.add(camera2, 'fov', [30, 60, 10]).onChange(onChange);
        this.gui.add(camera2, 'aspect', {
            '16/9': 16/9,
            '4/3': 4/3
        }).onChange(onChange);
        this.gui.add(camera2, 'near', 0, 300).onChange(onChange);
        this.gui.add(camera2, 'far', 300, 800).onChange(onChange);

    }
}

