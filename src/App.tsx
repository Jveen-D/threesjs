import type { MenuProps } from "antd";
import { Menu } from "antd";
import { ThemeProvider } from "antd-style";
import { useEffect, useRef, useState } from "react";
import MonacoEditor from "./components/monacoEditor";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from 'lil-gui';

type MenuItem = Required<MenuProps>["items"][number];

import initCodeDemo1 from "./pages/Demo01/initCode";
import initCodeDemo2 from "./pages/Demo02/initCode";
const items: MenuItem[] = [
  {
    key: "firstScene",
    label: "第一个场景",
    children: [
      { key: "demo01", label: "demo01" },
      { key: "demo02", label: "demo02" },
    ],
  },
];
function App() {
  const [current, setCurrent] = useState("demo01");
  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
  };

  const [sceneCode, setSceneCode] = useState<string>(initCodeDemo1);
  const threeRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null); // 存储 renderer
  const guiRef = useRef<GUI | null>(null);

  useEffect(() => {
    if (current === "demo01") {
      setSceneCode(initCodeDemo1);
    } else if (current === "demo02") {
      setSceneCode(initCodeDemo2);
    }
  }, [current]);

  useEffect(() => {
    const container = threeRef.current;
    if (!container) return;
    container.innerHTML = "";

    // 2️⃣ 初始化新场景
    try {
      const initScene = new Function(
        "THREE",
        "container",
        "OrbitControls",
        "GUI",
        "gui",
        sceneCode
      );
      initScene(THREE, container, OrbitControls, GUI, guiRef.current);
    } catch (error) {
      console.error("Scene initialization error:", error);
    }

    // 4️⃣ 组件卸载时清理
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [sceneCode]); // ✅ 依赖 sceneCode，变化时重新执行

  return (
    <ThemeProvider>
      <div className="flex w-screen h-screen">
        <div className="w-64 bg-gray-100">
          <Menu
            onClick={onClick}
            style={{ width: 256 }}
            defaultSelectedKeys={[current]}
            defaultOpenKeys={["firstScene"]}
            mode="inline"
            items={items}
          />
        </div>
        <div className="flex flex-1 h-full">
          <div className="w-1/2 h-full">
            <div ref={threeRef} className="w-full h-full" />
          </div>
          <div className="w-1/2 h-full">
            <MonacoEditor code={sceneCode} setCode={setSceneCode} />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
