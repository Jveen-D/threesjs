import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "antd-style";
import { useEffect, useRef, useState } from "react";
import MonacoEditor from "./components/monacoEditor";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

type MenuItem = Required<MenuProps>["items"][number];

import initCodeDemo1 from "./pages/Demo01/initCode";
const items: MenuItem[] = [
  {
    key: "firstScene",
    label: "第一个场景",
    children: [{ key: "demo01", label: "demo01" }],
  },
];
function App() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState("demo01");
  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
  };
  useEffect(() => {
    navigate(current);
  }, [current, navigate]);

  const [sceneCode, setSceneCode] = useState<string>(initCodeDemo1);
  const threeRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null); // 存储 renderer

  useEffect(() => {
    const container = threeRef.current;
    if (!container) return;
    container.innerHTML = "";

    // 1️⃣ 先清理旧的 renderer（如果存在）
    if (rendererRef.current) {
      rendererRef.current.dispose(); // 销毁旧的 WebGLRenderer
      rendererRef.current = null;
    }

    // 2️⃣ 初始化新场景
    try {
      const initScene = new Function(
        "THREE",
        "container",
        "OrbitControls",
        sceneCode
      );
      const cleanup = initScene(THREE, container, OrbitControls);

      // 3️⃣ 如果返回 cleanup 函数，存储 renderer
      if (typeof cleanup === "function") {
        rendererRef.current = cleanup(); // 存储新的 renderer
      }
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
