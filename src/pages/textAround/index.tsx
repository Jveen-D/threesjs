import React, { type RefObject, useRef } from "react";
import type { WebGLRenderer } from "three";
import ThreeClass from "./three";

type SphereGeometryProps = Record<string, never>;

const SphereGeometry: React.FC<SphereGeometryProps> = () => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const renderer = useRef<WebGLRenderer | null>(null);

	React.useEffect(() => {
		if(renderer.current) return
    	renderer.current = new ThreeClass({ wrapperRef: wrapperRef as RefObject<HTMLDivElement> });
	}, []);

	return <div className="w-full h-full" ref={wrapperRef} />;
};

export default SphereGeometry;
