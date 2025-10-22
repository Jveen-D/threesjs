import GUI from "lil-gui";
import * as THREE from "three";
import {
    AdditiveBlending,
    Mesh,
    ShaderMaterial,
    SphereGeometry,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export interface ThreeClassProps {
	wrapperRef: React.RefObject<HTMLDivElement>;
}
export default class {
	wrapperRef: React.RefObject<HTMLDivElement>;
	scene: THREE.Scene;
	renderer: THREE.WebGLRenderer;
	composer?: EffectComposer;
	bloomPass?: UnrealBloomPass;
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
		// 初始化 Bloom 后期
		this.composer = new EffectComposer(this.renderer);
		const renderPass = new RenderPass(this.scene, this.camera);
		this.composer.addPass(renderPass);
		this.bloomPass = new UnrealBloomPass(
			new THREE.Vector2(width, height),
			5.0, // strength
			1.0, // radius
			0.299 // threshold
		);
		this.composer.addPass(this.bloomPass);

		// 先进行一次渲染
		this.composer.render();

		this.wrapperRef.current?.appendChild(this.renderer.domElement);

		this.init();
		const render = () => {
			this.composer?.render();
			requestAnimationFrame(render);
		};
		render();
	}
	init() {
		const axesHelper = new THREE.AxesHelper(200);
		this.scene.add(axesHelper);

		// 半球几何体（上半球），不使用任何纹理
		const globeGgeometry: SphereGeometry = new SphereGeometry(
			50, // 半径
			100, // 水平分段
			100, // 垂直分段
			0, // phiStart
			Math.PI * 2, // phiLength（经度范围）
			0, // thetaStart
			Math.PI / 2 // thetaLength（纬度范围，PI/2 生成上半球）
		);


        // 辉光半球（Shader）：顶端最亮，边缘透明（基于法线的渐变）
        const glowMaterial = new ShaderMaterial({
            uniforms: {
                uColor: { value: new THREE.Color(0x41beff) },
                uMaxOpacity: { value: 1.0 },
                uEdge: { value: 0.5 }, // 边缘起始
                uPower: { value: 5.0 }, // 衰减指数
                uCeil: { value: 1.0 }, // 顶端截断
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uMaxOpacity;
                uniform float uEdge;
                uniform float uPower;
                uniform float uCeil;
                varying vec3 vNormal;
                void main() {
                    float n = clamp(vNormal.y, 0.0, 1.0);
                    float t = smoothstep(uEdge, uCeil, n);
                    float alpha = uMaxOpacity * pow(t, uPower);
                    gl_FragColor = vec4(uColor, alpha);
                }
            `,
            blending: AdditiveBlending,
            transparent: true,
            depthWrite: false,
        });
        const glowMesh = new Mesh(globeGgeometry, glowMaterial);
        glowMesh.scale.set(1.02, 1.02, 1.02);
        glowMesh.renderOrder = 2;
        this.scene.add(glowMesh);


		// GUI：控制半球颜色与 Bloom
        const materialFolder = this.gui.addFolder('材质控制');
        const params = {
            glowColor: '#41beff',
            maxOpacity: 1.0,
            edge: 0.5,
            power: 5.0,
            ceil: 1.0,
            powerMode: false,
        };
        materialFolder.addColor(params, 'glowColor').name('辉光颜色').onChange((v: string) => {
            (glowMaterial.uniforms.uColor.value as THREE.Color).set(v);
        });
        materialFolder.add(params, 'maxOpacity', 0, 1).name('最大不透明度').onChange((v: number) => {
            glowMaterial.uniforms.uMaxOpacity.value = v;
        });
        materialFolder.add(params, 'edge', 0, 0.5).name('边缘起始').onChange((v: number) => {
            glowMaterial.uniforms.uEdge.value = v;
        });
        materialFolder.add(params, 'power', 0.5, 5, 0.1).name('衰减指数').onChange((v: number) => {
            glowMaterial.uniforms.uPower.value = v;
        });
        materialFolder.add(params, 'ceil', 0.6, 1.0, 0.001).name('顶端截断').onChange((v: number) => {
            glowMaterial.uniforms.uCeil.value = v;
        });
		materialFolder.add(params, 'powerMode').name('强力模式').onChange((v: boolean) => {
			if (!this.bloomPass) return;
			if (v) {
				this.bloomPass.strength = 3.0;
				this.bloomPass.radius = 0.85;
				this.bloomPass.threshold = 0.0;
                glowMaterial.uniforms.uMaxOpacity.value = Math.max(glowMaterial.uniforms.uMaxOpacity.value, 0.7);
                glowMaterial.uniforms.uCeil.value = Math.min(glowMaterial.uniforms.uCeil.value, 0.95);
                (glowMaterial.uniforms.uColor.value as THREE.Color).set('#57c9ff');
			} else {
				this.bloomPass.strength = 2.0;
				this.bloomPass.radius = 0.6;
				this.bloomPass.threshold = 0.0;
			}
		});

		const bloomFolder = this.gui.addFolder('Bloom 泛光');
		bloomFolder.add({ strength: this.bloomPass?.strength ?? 2.0 }, 'strength', 0, 5)
			.name('强度')
			.onChange((v: number) => { if (this.bloomPass) this.bloomPass.strength = v; });
		bloomFolder.add({ radius: this.bloomPass?.radius ?? 0.6 }, 'radius', 0, 1)
			.name('半径')
			.onChange((v: number) => { if (this.bloomPass) this.bloomPass.radius = v; });
		bloomFolder.add({ threshold: this.bloomPass?.threshold ?? 0.0 }, 'threshold', 0, 1)
			.name('阈值')
			.onChange((v: number) => { if (this.bloomPass) this.bloomPass.threshold = v; });
	}
}
