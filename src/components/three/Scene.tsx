"use client";

import dynamic from "next/dynamic";

// 서버 렌더를 건너뛰고 브라우저에서만 공용 3D 캔버스 생성
export const Scene = dynamic(() => import("./SceneRoot"), { ssr: false });
