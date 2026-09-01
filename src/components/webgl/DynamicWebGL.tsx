"use client";

import { useEffect, useState } from "react";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { supportsWebGL } from "@/lib/webgl";
import { WebGLBoundary } from "./WebGLBoundary";

export type WebGLComponentProps = {
  className?: string;
  style?: CSSProperties;
};

export type EffectKind = "digital-field";

const loaderMap: Record<
  EffectKind,
  () => Promise<{ default: ComponentType<WebGLComponentProps> }>
> = {
  "digital-field": () => import("./DigitalField"),
};

type LoadState = {
  kind: EffectKind;
  Component: ComponentType<WebGLComponentProps> | null;
  error: boolean;
};

type DynamicWebGLProps = WebGLComponentProps & {
  kind: EffectKind;
  fallback?: ReactNode;
  /** Skips loading the effect entirely (e.g. reduced-motion users). */
  disabled?: boolean;
};

/**
 * Runs `task` during browser idle time, falling back to a short timeout for
 * browsers without requestIdleCallback. Keeps the heavy three.js chunk out of
 * the critical path while still mounting the effect almost immediately.
 */
function whenIdle(task: () => void): () => void {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    task();
  };
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(finish, { timeout: 2500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(finish, 250);
  return () => window.clearTimeout(id);
}

/**
 * Dynamically loads a WebGL effect component only when it's needed.
 * Each effect is a separate chunk, loaded on demand to keep the
 * initial bundle lean. The provided `kind` selects which effect to mount.
 */
export function DynamicWebGL({
  kind,
  fallback = null,
  disabled = false,
  className,
  style,
}: DynamicWebGLProps) {
  const [state, setState] = useState<LoadState>({
    kind,
    Component: null,
    error: false,
  });

  useEffect(() => {
    if (state.kind === kind && (state.Component || state.error)) return;
    if (disabled || !supportsWebGL()) {
      // Never let a WebGL failure break the page — the styled fallback
      // stays mounted and the three.js chunk is never fetched.
      return;
    }

    let cancelled = false;
    const cancelIdle = whenIdle(() => {
      loaderMap[kind]()
        .then((mod) => {
          if (cancelled) return;
          setState({ kind, Component: mod.default, error: false });
        })
        .catch(() => {
          if (cancelled) return;
          setState({ kind, Component: null, error: true });
        });
    });

    return () => {
      cancelled = true;
      cancelIdle();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, disabled]);

  const { Component } = state;
  if (!Component) return <>{fallback}</>;

  return (
    <WebGLBoundary fallback={<>{fallback}</>}>
      <Component className={className} style={style} />
    </WebGLBoundary>
  );
}

export { WebGLContainer } from "./WebGLContainer";
