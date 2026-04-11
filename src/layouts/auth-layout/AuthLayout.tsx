"use client";

import ThreeBackgroundParticle from "@/components/three-background/ThreeBackgroundParticle";
import { Stack, Switch } from "@mantine/core";
import { ReactNode, useEffect, useState } from "react";

type TProps = {
    children: ReactNode;
};

export function isWebGLAvailable() {
    try {
        const canvas = document.createElement("canvas");
        return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
    } catch {
        return false;
    }
}

export default function AuthLayout({ children }: TProps) {
    const [showParticles, setShowParticles] = useState(true);
    const [canUseWebGL, setCanUseWebGL] = useState(false);

   useEffect(() => {
        const webglOk = isWebGLAvailable();
        setCanUseWebGL(webglOk);

        const saved = localStorage.getItem("showParticles");
        if (saved !== null) {
            setShowParticles(saved === "true" && webglOk);
        } else {
            setShowParticles(webglOk);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("showParticles", String(showParticles));
    }, [showParticles]);

    return (
        <Stack
            sx={{
                height: "100vh",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
            }}
        >
            {canUseWebGL && showParticles && <ThreeBackgroundParticle />}

            {children}

            <Switch
                sx={{
                    position: "absolute",
                    bottom: 12,
                    right: 16,
                }}
                size="sm"
                checked={showParticles}
                onChange={(e) => setShowParticles(e.currentTarget.checked)}
            />
        </Stack>
    );
}
