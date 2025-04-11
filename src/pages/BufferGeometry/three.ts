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
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);


        this.camera.position.set(200, 200, 200);
        this.camera.lookAt(0, 0, 0);

        this.renderer.setSize(width, height)
        this.renderer.render(this.scene, this.camera);

        this.wrapperRef.current?.appendChild(this.renderer.domElement);

        this.init();
        const render = () => {
            this.renderer.render(this.scene, this.camera as THREE.Camera);
            requestAnimationFrame(render);
        }
        render();
    }
    init() {
        const pointLight = new THREE.PointLight(0xffffff, 10000);
        pointLight.position.set(80, 80, 80);
        this.scene.add(pointLight);

        const axesHelper = new THREE.AxesHelper(200);
        this.scene.add(axesHelper);

        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color('orange'),
            side: THREE.DoubleSide // 添加这一行
            // wireframe: true
        });

        // 创建组
        const group = new THREE.Group();

        const vertices = new Float32Array([
            0, 0, 0,
            100, 0, 0,
            0, 100, 0,
            0, 0, 10,
            0, 0, 100,
            100, 0, 10,
            10, 10, 10,
            100, 10, 10,
            100, 100, -100
        ]);
        const geometry1 = new THREE.BufferGeometry();
        const attribute = new THREE.BufferAttribute(vertices, 3);
        geometry1.attributes.position = attribute;

        const vertices2 = new Float32Array([
            0, 0, 0,
            100, 0, 0,
            0, 100, 0,

            // 下面两组数据可以省略，因为属于重复点
            // 0, 100, 0,
            // 100, 0, 0,

            100, 100, 0,
        ]);
        const geometry2 = new THREE.BufferGeometry();
        const attribute2 = new THREE.BufferAttribute(vertices2, 3);
        geometry2.attributes.position = attribute2;

        const indexes = new Uint16Array([
            0, 1, 2, 2, 1, 3
        ]);
        geometry2.index = new THREE.BufferAttribute(indexes, 1);

        const geometry3 = new THREE.PlaneGeometry(100, 100);
        const mesh3 = new THREE.Mesh(geometry3, material);
        console.log('🚀 ~ init ~ mesh3:', mesh3)

        const geometry = new THREE.BoxGeometry(100, 100, 100);
        const mesh4 = new THREE.Mesh(geometry, material);
        console.log('🚀 ~ init ~ mesh4:', mesh4)

        const vertices3 = new Float32Array([
            50, 50, 50,
            50, 50, -50,
            50, -50, 50,
            50, -50, -50,
            -50, 50, -50,
            -50, 50, 50,
            -50, -50, -50,
            -50, -50, 50,
            -50, 50, -50,
            50, 50, -50,
            -50, 50, 50,
            50, 50, 50,
            -50, -50, 50,
            50, -50, 50,
            -50, -50, -50,
            50, -50, -50,
            -50, 50, 50,
            50, 50, 50,
            -50, -50, 50,
            50, -50, 50,
            50, 50, -50,
            -50, 50, -50,
            50, -50, -50,
            -50, -50, -50
        ]);
        const geometry5 = new THREE.BufferGeometry();
        const attribute5 = new THREE.BufferAttribute(vertices3, 3);
        geometry5.attributes.position = attribute5;
        const geometry5Indexes = new Uint16Array([
            0, 2, 1, 2, 3, 1, 4, 6, 5, 6, 7, 5, 8, 10, 9, 10, 11, 9, 12, 14, 13, 14, 15, 13, 16, 18, 17, 18, 19, 17, 20, 22, 21, 22, 23, 21
        ]);
        geometry5.index = new THREE.BufferAttribute(geometry5Indexes, 1);

        const mesh5 = new THREE.Mesh(geometry5, material);
        console.log('🚀 ~ init ~ mesh5:', mesh5)

        // 优化之后的立方体
        const vertices6 = new Float32Array([
            // 8个顶点
            50, 50, 50,    // 0
            50, 50, -50,   // 1
            50, -50, 50,   // 2
            50, -50, -50,  // 3
            -50, 50, -50,  // 4
            -50, 50, 50,   // 5
            -50, -50, -50, // 6
            -50, -50, 50   // 7
        ]);

        const geometry6 = new THREE.BufferGeometry();
        const attribute6 = new THREE.BufferAttribute(vertices6, 3);
        geometry6.attributes.position = attribute6;

        const geometry6Indexes = new Uint16Array([
            // 前面
            0, 2, 5, 2, 7, 5,
            // 右面
            0, 1, 2, 2, 1, 3,
            // 后面
            1, 3, 4, 3, 6, 4,
            // 左面
            4, 6, 5, 6, 7, 5,
            // 上面
            0, 5, 1, 1, 5, 4,
            // 下面
            2, 7, 3, 3, 7, 6
        ]);

        geometry6.index = new THREE.BufferAttribute(geometry6Indexes, 1);
        const mesh6 = new THREE.Mesh(geometry6, material);

        // group.add(new THREE.Mesh(geometry1, material));
        // group.add(new THREE.Mesh(geometry2, material));
        // group.add(mesh3);
        // group.add(mesh4);
        // group.add(mesh5);
        group.add(mesh6);
        this.scene.add(group);
    }
}

