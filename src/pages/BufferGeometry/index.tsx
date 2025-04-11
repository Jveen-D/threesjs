import React, { type RefObject, useRef } from "react";
import ThreeClass from "./three";
import type { WebGLRenderer } from "three";

type BufferGeometryProps = Record<string, never>;

const BufferGeometry: React.FC<BufferGeometryProps> = () => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const renderer = useRef<WebGLRenderer | null>(null);

	React.useEffect(() => {
		if(renderer.current) return
    	renderer.current = new ThreeClass({ wrapperRef: wrapperRef as RefObject<HTMLDivElement> });
	}, []);

	return <div className="w-full h-full" ref={wrapperRef} />;
};

export default BufferGeometry;
