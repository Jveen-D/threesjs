import Earth_Illumination from "@/assets/Earth_Illumination.jpg";
import earth_technology from "@/assets/earth_technology.jpg";
import satelliteObg from '@/assets/satellite.obj'
import GUI from "lil-gui";
import * as THREE from "three";
import {
	AdditiveBlending,
	AmbientLight,
	BackSide,
	DirectionalLight,
	Group,
	Mesh,
	MeshPhongMaterial,
	MeshStandardMaterial,
	Object3D,
	SphereGeometry,
	TextureLoader,
} from "three";
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
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.gui = new GUI();
		this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		this.camera.position.set(200, 200, 200);
		this.camera.lookAt(0, 0, 0);

		this.renderer.setSize(width, height);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.2;
		this.renderer.render(this.scene, this.camera);

		this.wrapperRef.current?.appendChild(this.renderer.domElement);

		this.init();
		const render = () => {
			this.renderer.render(this.scene, this.camera as THREE.Camera);
			requestAnimationFrame(render);
		};
		render();
	}
	init() {
		// 增强环境光
		const ambientLight: AmbientLight = new AmbientLight(0xffffff, 2.0);
		this.scene.add(ambientLight);

		// 添加方向光来增强纹理细节
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
		directionalLight.position.set(100, 100, 100);
		this.scene.add(directionalLight);

		// 添加补光
		const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
		fillLight.position.set(-100, -100, -100);
		this.scene.add(fillLight);

		const textureLoader = new THREE.TextureLoader();
		const axesHelper = new THREE.AxesHelper(200);
		this.scene.add(axesHelper);

		const globeGgeometry: SphereGeometry = new SphereGeometry(50, 100, 100);
		
		// 使用 MeshPhongMaterial 来获得更好的光照效果
		const globeMaterial: MeshPhongMaterial = new MeshPhongMaterial({
			shininess: 10,
			specular: 0x222222,
		});
        const globeMaterial2: MeshPhongMaterial = new MeshPhongMaterial({
			shininess: 10,
			specular: 0x222222,
			transparent: true, // 启用透明度
			opacity: 0.7, // 设置透明度值 (0-1)
			blending: AdditiveBlending, // 使用加法混合模式
		});

		// 加载纹理并设置
		textureLoader.load(earth_technology, (texture) => {
			// 设置纹理属性
			texture.colorSpace = THREE.SRGBColorSpace;
			texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
			
			globeMaterial.map = texture;
			globeMaterial.needsUpdate = true;
		});
        // 加载纹理并设置
		textureLoader.load(Earth_Illumination, (texture) => {
			// 设置纹理属性
			texture.colorSpace = THREE.SRGBColorSpace;
			texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
			
			globeMaterial2.map = texture;
			globeMaterial2.needsUpdate = true;
		});

		const earthMesh = new Mesh(globeGgeometry, globeMaterial);
		const earthMesh2 = new Mesh(globeGgeometry, globeMaterial2);
		this.scene.add(earthMesh);
		this.scene.add(earthMesh2);

		// 添加 GUI 控制
		const materialFolder = this.gui.addFolder('材质控制');
		materialFolder.add(globeMaterial, 'shininess', 0, 100).name('光泽度');
		materialFolder.add(globeMaterial2, 'opacity', 0, 1).name('第二个纹理透明度');
		materialFolder.add(ambientLight, 'intensity', 0, 5).name('环境光强度');
		materialFolder.add(directionalLight, 'intensity', 0, 3).name('方向光强度');
		materialFolder.add(this.renderer, 'toneMappingExposure', 0.1, 3).name('曝光度');
	}
}
