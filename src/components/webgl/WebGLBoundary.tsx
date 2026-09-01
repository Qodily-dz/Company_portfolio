"use client";

import { Component } from "react";
import type { ReactNode } from "react";

type WebGLBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type WebGLBoundaryState = {
  failed: boolean;
};

/**
 * Catches a renderer-construction failure inside a WebGL effect so a broken
 * GL implementation can never take down the surrounding section. The styled
 * fallback takes the canvas's place if three.js throws at mount.
 */
export class WebGLBoundary extends Component<WebGLBoundaryProps, WebGLBoundaryState> {
  state: WebGLBoundaryState = { failed: false };

  static getDerivedStateFromError(): WebGLBoundaryState {
    return { failed: true };
  }

  componentDidCatch() {
    /* the fallback already covers the section; nothing to surface */
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}