import Earth_Illumination from "@/assets/Earth_Illumination.jpg";
import earth_technology from "@/assets/earth_technology.jpg";
import GUI from "lil-gui";
import * as THREE from "three";
// @ts-ignore - three 提供的字体 JSON
import helvetiker from "three/examples/fonts/helvetiker_regular.typeface.json";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import type { FontData } from "three/examples/jsm/loaders/FontLoader.js";

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
	textGroup: THREE.Group;
	textParams: { text: string; radius: number; size: number; depth: number; speed: number; spacing: number };
	constructor(props: ThreeClassProps) {
		this.wrapperRef = props.wrapperRef;
		const width = this.wrapperRef.current?.clientWidth as number;
		const height = this.wrapperRef.current?.clientHeight as number;
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.gui = new GUI();
		this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		this.textGroup = new THREE.Group();
		this.textParams = { text: "THREE • TEXT AROUND EARTH", radius: 70, size: 6, depth: 1, speed: 0.01, spacing: 1.0 };

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
			// 文本环绕动画
			this.textGroup.rotation.y += this.textParams.speed;
			this.controls?.update();
			this.renderer.render(this.scene, this.camera as THREE.Camera);
			requestAnimationFrame(render);
		};
		render();
	}
	init() {
		// 增强环境光
		const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 2.0);
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

		const globeGgeometry: THREE.SphereGeometry = new THREE.SphereGeometry(50, 100, 100);
		
		// 使用 MeshPhongMaterial 来获得更好的光照效果
		const globeMaterial: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({
			shininess: 10,
			specular: 0x222222,
		});
		const globeMaterial2: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({
			shininess: 10,
			specular: 0x222222,
			transparent: true, // 启用透明度
			opacity: 0.7, // 设置透明度值 (0-1)
			blending: THREE.AdditiveBlending, // 使用加法混合模式
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

		const earthMesh = new THREE.Mesh(globeGgeometry, globeMaterial);
		const earthMesh2 = new THREE.Mesh(globeGgeometry, globeMaterial2);
		this.scene.add(earthMesh);
		this.scene.add(earthMesh2);

		// ===== 文本环绕 =====
		this.buildTextRing();
		this.scene.add(this.textGroup);

		// 添加 GUI 控制
		const materialFolder = this.gui.addFolder('材质控制');
		materialFolder.add(globeMaterial, 'shininess', 0, 100).name('光泽度');
		materialFolder.add(globeMaterial2, 'opacity', 0, 1).name('第二个纹理透明度');
		materialFolder.add(ambientLight, 'intensity', 0, 5).name('环境光强度');
		materialFolder.add(directionalLight, 'intensity', 0, 3).name('方向光强度');
		materialFolder.add(this.renderer, 'toneMappingExposure', 0.1, 3).name('曝光度');

		const textFolder = this.gui.addFolder('文字环绕');
		textFolder.add(this.textParams, 'radius', 55, 120, 1).name('环半径').onChange(() => this.rebuildTextRing());
		textFolder.add(this.textParams, 'size', 2, 12, 1).name('文字大小').onChange(() => this.rebuildTextRing());
		textFolder.add(this.textParams, 'speed', -0.05, 0.05, 0.001).name('旋转速度');
		textFolder.add(this.textParams, 'spacing', 0.8, 2.0, 0.01).name('字间距').onChange(() => this.rebuildTextRing());
	}

	buildTextRing() {
		// 清空旧内容
		while (this.textGroup.children.length) {
			const child = this.textGroup.children[0];
			this.textGroup.remove(child);
			(child as THREE.Object3D).traverse?.((obj) => {
				const maybeMesh = obj as THREE.Mesh;
				if (maybeMesh.geometry) maybeMesh.geometry.dispose?.();
				const mat = maybeMesh.material as unknown;
				if (Array.isArray(mat)) {
					for (const m of mat) {
						(m as THREE.Material).dispose?.();
					}
				} else if (mat && (mat as THREE.Material).dispose) {
					(mat as THREE.Material).dispose();
				}
			});
		}

		const fontLoader = new FontLoader();
		const font = fontLoader.parse(helvetiker as unknown as FontData);
		const text = this.textParams.text;
		const letters = Array.from(text);
		const radius = this.textParams.radius;
		const size = this.textParams.size;
		const depth = this.textParams.depth;
		const spacingScale = this.textParams.spacing; // 1.0 紧密，>1 更松
		const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x66ccff, metalness: 0.2, roughness: 0.3 });

		// 先生成所有字符几何以测量宽度
		const glyphs: { char: string; geo: TextGeometry; width: number }[] = [];
		for (const char of letters) {
			if (char === ' ') {
				// 用一个基于 size 的空格宽度（TextGeometry 不为 ' ' 生成轮廓）
				const spaceWidth = size * 0.5 * spacingScale;
				// 用一个占位空几何，宽度用于角度累计
				const dummy = new TextGeometry('.', { font, size: 0.0001, depth: 0.0001, curveSegments: 2, bevelEnabled: false });
				glyphs.push({ char: ' ', geo: dummy, width: spaceWidth });
				continue;
			}
			const geo = new TextGeometry(char, { font, size, depth, curveSegments: 12, bevelEnabled: false });
			geo.computeBoundingBox();
			const bbox = geo.boundingBox as THREE.Box3;
			const width = (bbox.max.x - bbox.min.x) * spacingScale;
			glyphs.push({ char, geo, width });
		}

		// 计算总角度用于整体居中
		let totalAngle = 0;
		for (const g of glyphs) totalAngle += g.width / radius;
		let currentAngle = -totalAngle / 2;

		for (const g of glyphs) {
			// 空格：不渲染网格，只推进角度
			if (g.char === ' ') {
				currentAngle += g.width / radius;
				continue;
			}
			g.geo.center();
			const mesh = new THREE.Mesh(g.geo, baseMaterial.clone());
			const charAngle = g.width / radius;
			const centerAngle = currentAngle + charAngle / 2;
			mesh.position.set(Math.cos(centerAngle) * radius, 0, Math.sin(centerAngle) * radius);
			mesh.lookAt(0, 0, 0);
			mesh.rotateY(Math.PI);
			this.textGroup.add(mesh);
			currentAngle += charAngle;
		}
	}

	rebuildTextRing() {
		this.buildTextRing();
	}
}
