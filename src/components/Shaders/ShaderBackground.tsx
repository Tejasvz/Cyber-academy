import React, { useEffect, useRef } from 'react';

export type ShaderPreset = 'grid' | 'pulse' | 'scanline' | 'vortex';

interface ShaderBackgroundProps {
  preset?: ShaderPreset;
  className?: string;
}

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADERS: Record<ShaderPreset, string> = {
  grid: `
  precision highp float;
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_resolution;

  float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
  }

  float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
      vec2 uv = v_texCoord;
      vec2 centered_uv = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

      vec3 color = vec3(0.02, 0.04, 0.07);
      float n = noise(centered_uv * 3.0 + u_time * 0.1);
      color += n * vec3(0.0, 0.15, 0.25) * 0.5;

      vec2 grid = fract(uv * 50.0 - u_time * 0.05);
      float line = smoothstep(0.02, 0.0, abs(grid.x)) + smoothstep(0.02, 0.0, abs(grid.y));
      color += line * vec3(0.0, 0.8, 1.0) * 0.06;

      float stream = smoothstep(0.1, 0.0, abs(fract(uv.y * 2.0 + u_time * 0.2 + hash(vec2(floor(uv.x * 20.0)))) - 0.5));
      color += stream * vec3(0.0, 1.0, 0.8) * 0.04;

      gl_FragColor = vec4(color, 1.0);
  }
  `,

  pulse: `
  precision highp float;
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_resolution;

  void main() {
      vec2 uv = v_texCoord;
      vec2 p = (uv - 0.5);
      float d = length(p);

      float pulse = sin(u_time * 3.0) * 0.1 + 0.9;
      float ring = smoothstep(0.4 * pulse, 0.38 * pulse, d) - smoothstep(0.38 * pulse, 0.36 * pulse, d);
      float glow = exp(-d * 4.0) * (sin(u_time * 2.0) * 0.2 + 0.8);

      vec3 color = vec3(0.0, 0.85, 1.0) * (ring * 1.5 + glow * 0.4);
      float scan = smoothstep(0.1, 0.0, abs(uv.y - fract(u_time * 0.5)));
      color += scan * vec3(0.0, 1.0, 0.6) * 0.15;

      gl_FragColor = vec4(color, 1.0);
  }
  `,

  scanline: `
  precision highp float;
  varying vec2 v_texCoord;
  uniform float u_time;

  float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
  }

  void main() {
      vec2 uv = v_texCoord;
      float scanline = sin(uv.y * 600.0 + u_time * 4.0) * 0.03;
      vec2 g = fract(uv * 35.0 - 0.5);
      float grid = (smoothstep(0.02, 0.0, abs(g.x)) + smoothstep(0.02, 0.0, abs(g.y))) * 0.12;

      float p = smoothstep(0.4, 0.5, sin(uv.y * 2.5 - u_time * 0.6));
      vec3 baseColor = vec3(0.01, 0.04, 0.08);
      vec3 cyan = vec3(0.0, 0.95, 1.0);

      vec3 finalColor = baseColor + (grid + scanline + p * 0.08) * cyan;
      gl_FragColor = vec4(finalColor, 1.0);
  }
  `,

  vortex: `
  precision highp float;
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_resolution;

  void main() {
      vec2 uv = v_texCoord;
      vec2 p = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
      float angle = atan(p.y, p.x);
      float dist = length(p);

      float spiral = sin(angle * 6.0 + dist * 20.0 - u_time * 3.0);
      float rings = sin(dist * 30.0 - u_time * 2.0);

      vec3 cyan = vec3(0.0, 0.9, 1.0);
      vec3 purple = vec3(0.6, 0.1, 0.9);

      vec3 color = mix(cyan, purple, sin(angle + u_time) * 0.5 + 0.5);
      color *= (spiral * 0.5 + 0.5) * (rings * 0.5 + 0.5) * exp(-dist * 1.5);

      gl_FragColor = vec4(color + vec3(0.02, 0.03, 0.06), 1.0);
  }
  `
};

export const ShaderBackground: React.FC<ShaderBackgroundProps> = ({ preset = 'grid', className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (!gl) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      let frame = 0;
      const renderFallback = () => {
        canvas.width = canvas.clientWidth || window.innerWidth;
        canvas.height = canvas.clientHeight || window.innerHeight;
        ctx.fillStyle = '#050a12';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        const offset = (frame * 0.5) % gridSize;

        for (let x = offset; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = offset; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        frame++;
        animId = requestAnimationFrame(renderFallback);
      };
      renderFallback();
      return () => cancelAnimationFrame(animId);
    }

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fsSource = FRAGMENT_SHADERS[preset] || FRAGMENT_SHADERS.grid;
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);

    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');

    const handleResize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const startTime = performance.now();
    const render = () => {
      handleResize();
      const elapsed = (performance.now() - startTime) / 1000;

      if (timeLoc) gl.uniform1f(timeLoc, elapsed);
      if (resLoc) gl.uniform2f(resLoc, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (program) gl.deleteProgram(program);
    };
  }, [preset]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
    />
  );
};
