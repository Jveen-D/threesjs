import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "antd-style";
import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import MonacoEditor from "./components/monacoEditor";
type MenuItem = Required<MenuProps>["items"][number];

import Demo01 from "./pages/Demo01";
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

	const [sceneCode, setSceneCode] = useState<string>("");
	return (
		<ThemeProvider>
			<div className="flex h-screen w-screen">
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
						<Routes>
							<Route path="/demo01" element={<Demo01 />} />
						</Routes>
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
