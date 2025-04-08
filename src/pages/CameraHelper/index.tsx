import React, { type RefObject, useRef } from "react";
import ThreeClass from "./three";
import type { WebGLRenderer } from "three";

type CameraHelperProps = Record<string, never>;

const CameraHelper: React.FC<CameraHelperProps> = () => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const renderer = useRef<WebGLRenderer | null>(null);

	React.useEffect(() => {
		if(renderer.current) return
    	const threeClass = new ThreeClass({ wrapperRef: wrapperRef as RefObject<HTMLDivElement> });
		renderer.current = threeClass.init();
	}, []);

	return <div className="w-full h-full" ref={wrapperRef} />;
};

export default CameraHelper;
