import React, { type RefObject, useRef } from "react";
import type { WebGLRenderer } from "three";
import ThreeClass from "./three";

type LoadObjProps = Record<string, never>;

const LoadObj: React.FC<LoadObjProps> = () => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const renderer = useRef<WebGLRenderer | null>(null);

	React.useEffect(() => {
		if(renderer.current) return
    	renderer.current = new ThreeClass({ wrapperRef: wrapperRef as RefObject<HTMLDivElement> });
	}, []);

	return <div className="w-full h-full" ref={wrapperRef} />;
};

export default LoadObj;
