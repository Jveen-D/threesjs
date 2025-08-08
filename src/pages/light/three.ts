import Earth_Illumination from "@/assets/Earth_Illumination.jpg";
import earth_technology from "@/assets/earth_technology.jpg";
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


		// 加载纹理并设置
		textureLoader.load(earth_technology, (texture) => {
			// 设置纹理属性
			texture.colorSpace = THREE.SRGBColorSpace;
			texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
			
			globeMaterial.map = texture;
			globeMaterial.needsUpdate = true;
		});

		// 创建主球体
		const earthMesh = new Mesh(globeGgeometry, globeMaterial);
		this.scene.add(earthMesh);

		// 创建多层发光球体来增强发散效果
		interface GlowLayer {
			mesh: THREE.Mesh;
			material: THREE.MeshPhongMaterial;
			geometry: THREE.SphereGeometry;
		}
		
		const glowLayers: GlowLayer[] = [];
		const layerCount = 200; // 大幅增加层数，创造更平滑的渐变
		const baseRadius = 50;
		const maxRadius = 100; // 增加最大半径，让发光范围更大
		
		// 创建更多层，每层半径和透明度都平滑变化
		for (let i = 0; i < layerCount; i++) {
			const radius = baseRadius + (maxRadius - baseRadius) * (i / (layerCount - 1));
			// 使用更平滑的衰减函数
			const normalizedIndex = i / (layerCount - 1);
			const opacity = (1 - normalizedIndex) ** 2 * 0.8; // 使用平方衰减，创造更平滑的渐变
			
			const layerGeometry = new SphereGeometry(radius, 64, 64);
			const layerMaterial = new MeshPhongMaterial({
				color: 0x41BEFF,
				transparent: true,
				opacity: opacity,
				blending: AdditiveBlending,
				side: BackSide,
			});
			
			const layerMesh = new Mesh(layerGeometry, layerMaterial);
			this.scene.add(layerMesh);
			glowLayers.push({ mesh: layerMesh, material: layerMaterial, geometry: layerGeometry });
		}

		// 添加 GUI 控制
		const materialFolder = this.gui.addFolder('材质控制');
		materialFolder.add(globeMaterial, 'shininess', 0, 100).name('光泽度');
		materialFolder.add(ambientLight, 'intensity', 0, 5).name('环境光强度');
		materialFolder.add(directionalLight, 'intensity', 0, 3).name('方向光强度');
		materialFolder.add(this.renderer, 'toneMappingExposure', 0.1, 3).name('曝光度');
		
		// 发光效果控制
		const glowFolder = this.gui.addFolder('发光效果');
		
		// 控制所有发光层的颜色
		const glowColorController = glowFolder.addColor({ color: 0x41BEFF }, 'color').name('发光颜色');
		glowColorController.onChange((value: number) => {
			for (const layer of glowLayers) {
				layer.material.color.setHex(value);
			}
		});
		
		// 控制发光强度
		const glowIntensityController = glowFolder.add({ intensity: 0.624 }, 'intensity', 0, 2).name('发光强度');
		glowIntensityController.onChange((value: number) => {
			for (let i = 0; i < glowLayers.length; i++) {
				const normalizedIndex = i / (layerCount - 1);
				const baseOpacity = (1 - normalizedIndex) ** 2 * 0.8;
				glowLayers[i].material.opacity = baseOpacity * value;
			}
		});
		
		// 控制透明度
		const glowTransparencyController = glowFolder.add({ transparency: 1 }, 'transparency', 0, 1).name('透明度');
		glowTransparencyController.onChange((value: number) => {
			for (let i = 0; i < glowLayers.length; i++) {
				const normalizedIndex = i / (layerCount - 1);
				const baseOpacity = (1 - normalizedIndex) ** 2 * value;
				glowLayers[i].material.opacity = baseOpacity * glowIntensityController.getValue();
			}
		});

		// 控制衰减曲线
		const glowDecayController = glowFolder.add({ decay: 4 }, 'decay', 1, 4).name('衰减曲线');
		glowDecayController.onChange((value: number) => {
			for (let i = 0; i < glowLayers.length; i++) {
				const normalizedIndex = i / (layerCount - 1);
				const baseOpacity = (1 - normalizedIndex) ** value * glowTransparencyController.getValue();
				glowLayers[i].material.opacity = baseOpacity * glowIntensityController.getValue();
			}
		});

		// 控制发散范围
		const glowSpreadController = glowFolder.add({ spread: 0.5 }, 'spread', 0.5, 2).name('发散范围');
		glowSpreadController.onChange((value: number) => {
			for (let i = 0; i < glowLayers.length; i++) {
				const newRadius = baseRadius + (maxRadius - baseRadius) * (i / (layerCount - 1)) * value;
				glowLayers[i].geometry.dispose();
				glowLayers[i].geometry = new SphereGeometry(newRadius, 64, 64);
				glowLayers[i].mesh.geometry = glowLayers[i].geometry;
			}
		});
	}
}
