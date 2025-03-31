import { type FC, useState } from "react";
import Editor from "@monaco-editor/react";

type MonacoEditorProps = {
	code: string;
	setCode: (code: string) => void;
};

const MonacoEditor: FC<MonacoEditorProps> = (props) => {
	const { code, setCode } = props;
	const [language, setLanguage] = useState<string>("javascript");

    const isValidJSON = (value: string): boolean => {
		try {
			const parsed = JSON.parse(value);
			return parsed && typeof parsed === 'object' && !Array.isArray(parsed);
		} catch (e) {
			return false;
		}
	};
	const handleEditorChange = (value: string | undefined) => {
		if (value !== undefined) {
			if (isValidJSON(value)) {
				setCode(value);
			} else {
				console.error("Invalid JSON");
			}
		}
	};
	return (
		<div className="w-full h-full">
			<Editor
				height="100%"
				language={language}
				value={code}
				onChange={handleEditorChange}
				theme="vs-dark" // 可选: "vs", "vs-dark", "hc-black"
				options={{
					minimap: { enabled: false }, // 关闭右侧缩略图
					fontSize: 14,
					wordWrap: "on",
					autoClosingBrackets: "always",
				}}
			/>
		</div>
	);
};

export default MonacoEditor;
