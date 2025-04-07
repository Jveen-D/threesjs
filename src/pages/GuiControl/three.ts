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
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.camera
        this.controls
        this.gui = new GUI();
    }
    init() {
        const geometry = new THREE.BoxGeometry(100, 100, 100);
        const material = new THREE.MeshLambertMaterial(({
            color: new THREE.Color('orange')
        }));
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0);
        this.scene.add(mesh);

        const pointLight = new THREE.PointLight(0xffffff, 10000);
        pointLight.position.set(80, 80, 80);
        this.scene.add(pointLight);

        const axesHelper = new THREE.AxesHelper(200);
        this.scene.add(axesHelper);

        const width = this.wrapperRef.current?.clientWidth as number;
        const height = this.wrapperRef.current?.clientHeight as number;


        this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
        this.camera.position.set(200, 200, 200);
        this.camera.lookAt(0, 0, 0);

        this.renderer.setSize(width, height)

        this.renderer.render(this.scene, this.camera);

        this.wrapperRef.current?.appendChild(this.renderer.domElement);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        const render = () => {
            this.renderer.render(this.scene, this.camera as THREE.Camera);
            requestAnimationFrame(render);
        }

        render();
        const meshSizeFolder = this.gui.addFolder('立方体-大小');
        meshSizeFolder.add({ width: 100 }, 'width', 10, 200).step(10).onChange((value: number) => {
            mesh.scale.x = value / 100;
        });
        meshSizeFolder.add({ height: 100 }, 'height', 10, 200).step(10).onChange((value: number) => {
            mesh.scale.y = value / 100;
        });
        meshSizeFolder.add({ depth: 100 }, 'depth', 10, 200).step(10).onChange((value: number) => {
            mesh.scale.z = value / 100;
        });
        const meshFolder = this.gui.addFolder('立方体-位置');
        meshFolder.addColor(mesh.material, 'color');
        meshFolder.add({ x: 0 }, 'x', -100, 100).step(10).onChange((value: number) => {
            mesh.position.x = value;
        });
        meshFolder.add({ y: 0 }, 'y', -100, 100).step(10).onChange((value: number) => {
            mesh.position.y = value;
        });
        meshFolder.add({ z: 0 }, 'z', -100, 100).step(10).onChange((value: number) => {
            mesh.position.z = value;
        });
        const lightFolder = this.gui.addFolder('灯光-位置');
        lightFolder.add({ x: 80 }, 'x', -100, 200).step(10).onChange((value: number) => {
            pointLight.position.x = value;
        });
        lightFolder.add({ y: 80 }, 'y', -100, 200).step(10).onChange((value: number) => {
            pointLight.position.y = value;
        });
        lightFolder.add({ z: 80 }, 'z', -100, 200).step(10).onChange((value: number) => {
            pointLight.position.z = value;
        });
        const otherFolder = this.gui.addFolder('其他控件类型');
        const obj = {
            aaa: '天王盖地虎',
            bbb: false,
            ccc: 0,
            ddd: '111',
            fff: 'Bbb',
            logic: () => {
                alert('执行一段逻辑!');
            }
        };

        otherFolder.add(obj, 'aaa').onChange((value: string) => {
            console.log(value);
        });
        otherFolder.add(obj, 'bbb').onChange((value: boolean) => {
            console.log(value);
        });
        otherFolder.add(obj, 'ccc').min(-10).max(10).step(0.5).onChange((value: number) => {
            console.log(value);
        });
        otherFolder.add(obj, 'ddd', ['111', '222', '333']);
        otherFolder.add(obj, 'fff', { Aaa: 0, Bbb: 0.1, Ccc: 5 });
        otherFolder.add(obj, 'logic');


        return {
            renderer: this.renderer,
            scene: this.scene,
            camera: this.camera,
            controls: this.controls
        }

    }
}

