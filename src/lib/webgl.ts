/**
 * WebGL capability detection shared by every three.js-backed effect.
 *
 * The probe allocates a real context with the same attributes three.js uses,
 * then verifies it actually exposes the GL API (a context that allocates but
 * cannot run is treated as unsupported). The context is force-released so the
 * probe costs nothing. Only ever called from client effects — never during SSR.
 */
export function supportsWebGL(): boolean {
  try {
    if (typeof document === "undefined") return false;
    const canvas = document.createElement("canvas");
    const attrs: WebGLContextAttributes = {
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: false,
    };
    const gl = (
      canvas.getContext("webgl2", attrs) ||
      canvas.getContext("webgl", attrs) ||
      canvas.getContext("experimental-webgl", attrs)
    ) as WebGLRenderingContext | WebGL2RenderingContext | null;
    if (!gl) return false;
    const usable = typeof gl.getParameter(gl.VERSION) === "string";
    try {
      const loseContext = gl.getExtension("WEBGL_lose_context");
      loseContext?.loseContext();
    } catch {
      /* releasing the probe context is best-effort */
    }
    return usable;
  } catch {
    return false;
  }
}