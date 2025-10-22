// 导入地球纹理贴图
import earth_bump_roughness_clouds_4096 from "@/assets/textures/planets/earth_bump_roughness_clouds_4096.jpg"; // 凹凸图、粗糙度图、云层图（RGB通道分别存储不同数据）
import earth_day_4096 from "@/assets/textures/planets/earth_day_4096.jpg"; // 白天地球贴图
import earth_night_4096 from "@/assets/textures/planets/earth_night_4096.jpg"; // 夜晚地球贴图（城市灯光）

// 导入 GUI 控制器和轨道控制器
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// 导入 Three.js TSL (Threejs Shading Language) 节点系统
// TSL 是 Three.js 新的着色器语言，用于创建复杂的材质效果
import {
  bumpMap,        // 凹凸贴图函数，用于创建表面凹凸效果
  cameraPosition, // 相机位置节点
  color,          // 颜色节点创建函数
  max,            // 取最大值函数
  mix,            // 混合函数，类似 GLSL 的 mix
  normalGeometry, // 几何体法线节点
  normalize,      // 归一化函数
  output,         // 输出节点，获取材质的最终输出
  positionWorld,  // 世界空间位置节点
  step,           // 阶跃函数
  texture,        // 纹理采样函数
  uniform,        // 创建 uniform 变量（着色器全局变量）
  uv,             // UV 坐标节点
  vec3,           // 三维向量构造函数
  vec4,           // 四维向量构造函数
} from "three/tsl";

// 导入 Three.js WebGPU 版本（新一代渲染器）
import * as THREE from "three/webgpu";

// 组件 Props 接口定义
export interface ThreeClassProps {
  wrapperRef: React.RefObject<HTMLDivElement>; // React DOM 容器引用
}

/**
 * 地球 WebGPU 渲染类
 * 这是一个使用 Three.js WebGPU 渲染器创建逼真地球的示例
 * 主要特性：
 * - 使用 TSL 节点系统创建复杂的材质效果
 * - 昼夜交替（白天贴图和夜晚城市灯光）
 * - 大气层效果（菲涅尔效果）
 * - 云层和表面粗糙度
 * - 实时光照计算
 */
export default class {
  wrapperRef: React.RefObject<HTMLDivElement>; // DOM 容器引用
  camera?: THREE.PerspectiveCamera;             // 透视相机
  scene?: THREE.Scene;                          // 3D 场景
  renderer?: THREE.WebGPURenderer;              // WebGPU 渲染器
  controls?: OrbitControls;                     // 轨道控制器（鼠标交互）
  globe?: THREE.Mesh;                           // 地球网格对象
  clock?: THREE.Clock;                          // 时钟，用于计算动画时间差
  gui: GUI;                                     // GUI 控制面板
  sun?: THREE.DirectionalLight;                 // 太阳光（平行光）

  constructor(props: ThreeClassProps) {
    this.wrapperRef = props.wrapperRef;
    this.gui = new GUI(); // 创建 GUI 控制面板

    this.init(); // 初始化场景
  }
  /**
   * 初始化场景
   * 这是整个示例的核心方法，负责创建所有的 3D 对象和效果
   */
  init() {
    // 获取容器尺寸
    const width = this.wrapperRef.current?.clientWidth as number;
    const height = this.wrapperRef.current?.clientHeight as number;
    
    // 创建时钟，用于动画帧之间的时间计算
    this.clock = new THREE.Clock();
    
    // 创建透视相机
    // 参数：视场角25度（较窄，产生望远镜效果），宽高比，近裁剪面，远裁剪面
    this.camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100);
    this.camera.position.set(4.5, 2, 3); // 设置相机位置（x, y, z）
    
    // 创建场景
    this.scene = new THREE.Scene();

    // ========== 创建太阳光（平行光）==========
    // 平行光模拟太阳光，所有光线都是平行的
    this.sun = new THREE.DirectionalLight("#ffffff", 2); // 白色光，强度为2
    this.sun.position.set(0, 0, 3); // 设置光源位置
    this.scene.add(this.sun); // 添加到场景

    // ========== 创建 Uniform 变量 ==========
    // uniform 变量可以在着色器中使用，并且可以通过 JavaScript 动态修改
    const atmosphereDayColor = uniform(color("#4db2ff"));       // 白天大气层颜色（蓝色）
    const atmosphereTwilightColor = uniform(color("#bc490b"));  // 黄昏大气层颜色（橙红色）
    const roughnessLow = uniform(0.1);   // 最小粗糙度（海洋等光滑表面）
    const roughnessHigh = uniform(0.1);  // 最大粗糙度（陆地等粗糙表面）

    // ========== 加载纹理贴图 ==========
    const textureLoader = new THREE.TextureLoader();

    // 白天地球贴图（显示陆地、海洋等）
    const dayTexture = textureLoader.load(earth_day_4096);
    dayTexture.colorSpace = THREE.SRGBColorSpace; // 设置为 sRGB 颜色空间（正确的颜色显示）
    dayTexture.anisotropy = 8; // 各向异性过滤，提高斜视角的纹理清晰度

    // 夜晚地球贴图（显示城市灯光）
    const nightTexture = textureLoader.load(earth_night_4096);
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.anisotropy = 8;

    // 复合贴图（一张图的 RGB 通道分别存储三种数据）
    // R 通道：凹凸高度图（地形起伏）
    // G 通道：粗糙度图（海洋光滑，陆地粗糙）
    // B 通道：云层遮罩
    const bumpRoughnessCloudsTexture = textureLoader.load(
      earth_bump_roughness_clouds_4096
    );
    bumpRoughnessCloudsTexture.anisotropy = 8;

    // ========== 计算菲涅尔效果 ==========
    // 菲涅尔效果：物体边缘比中心更容易反射光，用于模拟大气层效果
    const viewDirection = positionWorld.sub(cameraPosition).normalize(); // 计算视线方向（从表面指向相机）
    const fresnel = viewDirection
      .dot(normalGeometry)  // 计算视线方向和表面法线的点积
      .abs()                // 取绝对值
      .oneMinus()          // 1 - 值（反转，边缘变大）
      .toVar();            // 转换为变量节点

    // ========== 计算太阳朝向 ==========
    // 判断地球表面每个点相对于太阳的朝向（正面受光，背面黑暗）
    const sunOrientation = normalGeometry
      .dot(normalize(this.sun.position)) // 表面法线与太阳方向的点积（>0 朝向太阳，<0 背向太阳）
      .toVar();

    // ========== 计算大气层颜色 ==========
    // 根据太阳朝向混合白天和黄昏的大气层颜色
    const atmosphereColor = mix(
      atmosphereTwilightColor,  // 黄昏颜色（橙红）
      atmosphereDayColor,       // 白天颜色（蓝色）
      sunOrientation.smoothstep(-0.25, 0.75) // 平滑过渡（-0.25到0.75之间渐变）
    );

    // ========== 创建地球材质 ==========
    const globeMaterial = new THREE.MeshStandardNodeMaterial(); // 使用节点材质系统

    // 从复合贴图的蓝色通道提取云层强度
    const cloudsStrength = texture(
      bumpRoughnessCloudsTexture,
      uv() // 使用 UV 坐标采样纹理
    ).b.smoothstep(0.2, 1); // 取蓝色通道，并用 smoothstep 平滑过渡（0.2以下为0，1以上为1）

    // 设置地球颜色：混合白天贴图和白色（云层）
    globeMaterial.colorNode = mix(
      texture(dayTexture),  // 白天地球贴图
      vec3(1),              // 白色（云层颜色）
      cloudsStrength.mul(2) // 云层强度 × 2（增强云层效果）
    );

    // 计算表面粗糙度
    const roughness = max(
      texture(bumpRoughnessCloudsTexture).g, // 从绿色通道获取粗糙度
      step(0.01, cloudsStrength)              // 有云的地方粗糙度至少为1（云是粗糙的）
    );
    // 将粗糙度从 0-1 重新映射到 roughnessLow - roughnessHigh 范围
    globeMaterial.roughnessNode = roughness.remap(
      0,              // 输入最小值
      1,              // 输入最大值
      roughnessLow,   // 输出最小值（0.25，海洋）
      roughnessHigh   // 输出最大值（0.35，陆地）
    );

    // ========== 昼夜交替效果 ==========
    const night = texture(nightTexture); // 夜晚贴图（城市灯光）
    // 计算白天强度：-0.25 到 0.5 之间平滑过渡（晨昏线）
    const dayStrength = sunOrientation.smoothstep(-0.25, 0.5);

    // ========== 大气层混合效果 ==========
    // 计算大气层在白天的强度
    const atmosphereDayStrength = sunOrientation.smoothstep(-0.5, 1);
    // 大气层混合强度 = 白天强度 × 菲涅尔效果²（边缘更明显）
    const atmosphereMix = atmosphereDayStrength.mul(fresnel.pow(2)).clamp(0, 1);

    // ========== 计算最终输出颜色 ==========
    // 第一步：混合夜晚和白天
    let finalOutput = mix(night.rgb, output.rgb, dayStrength);
    // 第二步：叠加大气层颜色
    finalOutput = mix(finalOutput, atmosphereColor, atmosphereMix);

    // 设置材质的最终输出（RGB + Alpha）
    globeMaterial.outputNode = vec4(finalOutput, output.a);

    // ========== 设置法线贴图（凹凸效果）==========
    // 从红色通道获取高度，并和云层强度取最大值
    const bumpElevation = max(
      texture(bumpRoughnessCloudsTexture).r, // 地形高度
      cloudsStrength                          // 云层也有凹凸
    );
    globeMaterial.normalNode = bumpMap(bumpElevation); // 将高度图转换为法线贴图

    // ========== 创建地球网格 ==========
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64); // 半径1，64×64分段（高精度球体）
    this.globe = new THREE.Mesh(sphereGeometry, globeMaterial); // 创建网格（几何体+材质）
    this.scene.add(this.globe); // 添加到场景

    // ========== 创建大气层效果 ==========
    const atmosphereMaterial = new THREE.MeshBasicNodeMaterial({
      side: THREE.BackSide,  // 渲染背面（从内部看）
      transparent: true,      // 启用透明度
    });
    
    // 计算大气层的透明度
    // fresnel.remap(0.73, 1, 1, 0)：将菲涅尔值从 0.73-1 映射到 1-0（边缘不透明，中心透明）
    let alpha = fresnel.remap(0.73, 1, 1, 0).pow(3); // 三次方，使过渡更锐利
    // 乘以太阳朝向强度（背向太阳的一面大气层更淡）
    alpha = alpha.mul(sunOrientation.smoothstep(-0.5, 1));
    
    // 设置大气层材质输出（颜色 + 透明度）
    atmosphereMaterial.outputNode = vec4(atmosphereColor, alpha);

    // 创建大气层网格（使用相同的球体几何）
    const atmosphere = new THREE.Mesh(sphereGeometry, atmosphereMaterial);
    atmosphere.scale.setScalar(1.04); // 放大 4%，包裹在地球外面
    this.scene.add(atmosphere);

    // ========== 创建 WebGPU 渲染器 ==========
    this.renderer = new THREE.WebGPURenderer(); // 使用新的 WebGPU 渲染器（性能更好）
    this.renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比（支持高清屏）
    this.renderer.setSize(width, height); // 设置渲染尺寸
    this.renderer.setAnimationLoop(this.animate); // 设置动画循环函数
    // this.renderer.inspector = new Inspector(); // 可选：启用检查器工具
    this.wrapperRef.current?.appendChild(this.renderer.domElement); // 将渲染器的 canvas 添加到 DOM

    // ========== 创建轨道控制器 ==========
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // 启用阻尼（惯性），使相机移动更平滑
    this.controls.minDistance = 0.1;    // 最小缩放距离
    this.controls.maxDistance = 50;     // 最大缩放距离

    // ========== 监听窗口大小变化 ==========
    window.addEventListener("resize", this.onWindowResize);

    // ========== 设置 GUI 控制面板 ==========
    this.setupGUI();
  }
  /**
   * 设置 GUI 控制面板
   * 提供交互式控制来调整太阳光参数
   */
  setupGUI() {
    const sunFolder = this.gui.addFolder("太阳光设置"); // 创建文件夹分组
    
    // 太阳光设置对象
    const sunSettings = {
      enabled: true,      // 是否显示太阳光
      color: "#ffffff",   // 太阳光颜色
      intensity: 2,       // 太阳光强度
    };

    // 添加开关控制
    sunFolder.add(sunSettings, "enabled").name("开启太阳光").onChange((value: boolean) => {
      if (this.sun) {
        this.sun.visible = value; // 切换太阳光的可见性
      }
    });

    // 添加颜色选择器
    sunFolder.addColor(sunSettings, "color").name("太阳光颜色").onChange((value: string) => {
      if (this.sun) {
        this.sun.color.set(value); // 更新太阳光颜色
      }
    });

    // 添加强度滑块（范围 0-5，步长 0.1）
    sunFolder.add(sunSettings, "intensity", 0, 5, 0.1).name("太阳光强度").onChange((value: number) => {
      if (this.sun) {
        this.sun.intensity = value; // 更新太阳光强度
      }
    });

    sunFolder.open(); // 默认展开文件夹
  }

  /**
   * 窗口大小调整处理函数
   * 当浏览器窗口大小改变时，更新相机和渲染器
   */
  onWindowResize = () => {
    // 更新相机宽高比
    this.camera.aspect = window.innerWidth / window.innerHeight;
    // 更新相机投影矩阵（必须调用才能生效）
    this.camera.updateProjectionMatrix();

    // 更新渲染器尺寸
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  /**
   * 动画循环函数
   * 由 setAnimationLoop 自动调用，每帧执行一次
   */
  animate = async () => {
    // 获取距离上一帧的时间差（秒）
    const delta = this?.clock?.getDelta();
    
    // 让地球自转
    this.globe.rotation.y += delta * 0.025; // Y 轴旋转（角度 = 时间差 × 速度）

    // 更新轨道控制器（应用阻尼效果）
    this.controls?.update();

    // 渲染场景
    this.renderer.render(this.scene, this.camera as THREE.Camera);
  };
}
