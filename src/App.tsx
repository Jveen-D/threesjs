import type { MenuProps } from "antd";
import { Button, Menu } from "antd";
import { ThemeProvider } from "antd-style";
import React, { useState } from "react";
import GuiControl from "./pages/GuiControl";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
	{
		key: "/guiControl",
		label: "GUI调试"
	},
];

function App() {
	const [current, setCurrent] = useState("/guiControl");

	const [collapsed, setCollapsed] = useState(localStorage.getItem("collapsed") === "true");
  
	const toggleCollapsed = () => {
		setCollapsed(!collapsed);
	};
	const navigate = useNavigate();
	// 获取当前路由
	const location = useLocation();
	const onClick: MenuProps["onClick"] = (e) => {
		setCurrent(e.key);
		navigate(e.key);
	};

	React.useEffect(() => {
		// 如果当前路径为空，则设置为demo01
		if (location.pathname === "/") {
			navigate("/guiControl");
			setCurrent("/guiControl");
		}
	}, [location, navigate]);

	return (
		<ThemeProvider>
			<div className="flex w-screen h-screen">
				<div className={`w-[${collapsed ? 80 : 256}px] bg-gray-100`}>
					<Button
						type="primary"
						onClick={toggleCollapsed}
						style={{ width: '100%',marginBottom: 16 }}
					>
						{collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
					</Button>
					<Menu
						onClick={onClick}
						defaultSelectedKeys={[current]}
						defaultOpenKeys={["firstScene"]}
						mode="inline"
						items={items}
            inlineCollapsed={collapsed}
					/>
				</div>
				<div className="flex flex-1 h-full">
					<Routes>
						<Route path="/guiControl" element={<GuiControl />} />
					</Routes>
				</div>
			</div>
		</ThemeProvider>
	);
}

export default App;
