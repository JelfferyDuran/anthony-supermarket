import { useEffect, useRef } from 'react';

const REDUCE_MOTION = '(prefers-reduced-motion: reduce)';

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message || 'Shader compile failed');
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(message || 'Program link failed');
  }
  return program;
}

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_scroll;
  uniform vec2 u_pointer;
  uniform float u_mode;

  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  float grid(vec2 uv, float scale, float thickness) {
    vec2 cell = abs(fract(uv * scale) - 0.5);
    float axis = min(cell.x, cell.y);
    return 1.0 - smoothstep(0.0, max(0.004, thickness * 0.018), axis);
  }

  float ring(vec2 uv, float radius, float width) {
    float dist = abs(length(uv) - radius);
    return 1.0 - smoothstep(width, width + 0.012, dist);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec2 pointer = (u_pointer - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float time = u_time * 0.08;
    float scroll = u_scroll * 0.0009;
    vec2 warped = uv;
    warped *= rotate2d(sin(time + scroll) * 0.14);

    float waveA = sin((warped.x * 8.0) + time * 2.8 + scroll * 4.0);
    float waveB = cos((warped.y * 10.0) - time * 2.2 + scroll * 2.0);
    float field = waveA * waveB;

    float paramGrid = grid(warped + field * 0.018, 7.0 + sin(time) * 1.2, 0.9);
    float halo = ring(warped - pointer * 0.18, 0.35 + sin(time * 1.8) * 0.06, 0.018);
    float sweep = smoothstep(-0.35, 0.75, warped.x + warped.y + sin(time) * 0.25);

    vec3 deep = mix(vec3(0.006, 0.007, 0.006), vec3(0.032, 0.040, 0.026), sweep * 0.35);
    vec3 neon = mix(vec3(0.19, 1.0, 0.11), vec3(1.0, 0.82, 0.18), smoothstep(-0.25, 0.8, field));
    vec3 ops = vec3(0.14, 0.55, 1.0);
    vec3 accent = mix(neon, ops, u_mode * 0.45);

    float vignette = smoothstep(1.15, 0.25, length(uv));
    float strength = (paramGrid * 0.105 + halo * 0.22 + abs(field) * 0.045) * vignette;
    vec3 color = deep + accent * strength;

    gl_FragColor = vec4(color, 0.82);
  }
`;

function useScrollPhysics() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(REDUCE_MOTION).matches;
    if (reduceMotion) return undefined;

    const root = document.documentElement;
    let raf = 0;
    let target = window.scrollY || 0;
    let current = target;
    let velocity = 0;
    let last = target;

    const onScroll = () => {
      target = window.scrollY || 0;
    };

    const tick = () => {
      current += (target - current) * 0.12;
      velocity += ((current - last) - velocity) * 0.2;
      last = current;
      root.style.setProperty('--motion-scroll', current.toFixed(2));
      root.style.setProperty('--motion-velocity', Math.max(-18, Math.min(18, velocity)).toFixed(2));
      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(raf);
      root.style.removeProperty('--motion-scroll');
      root.style.removeProperty('--motion-velocity');
    };
  }, []);
}

function useRevealMotion() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(REDUCE_MOTION).matches;
    if (reduceMotion || !('IntersectionObserver' in window)) return undefined;

    const selectors = [
      '.hero-banner',
      '.category-tab',
      '.product-card',
      '.cart-line',
      '.admin-tab',
      '.pricing-panel',
      '.pricing-card',
      '.k-card',
      '.store-card'
    ];
    const targets = [...document.querySelectorAll(selectors.join(','))];
    targets.forEach((target, index) => {
      target.classList.add('motion-reveal');
      target.style.setProperty('--reveal-delay', `${Math.min(index * 28, 280)}ms`);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('motion-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);
}

export default function ExperienceLayer({ mode = 'customer' }) {
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: 0.78, y: 0.2 });
  useScrollPhysics();
  useRevealMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const reduceMotion = window.matchMedia(REDUCE_MOTION).matches;
    if (!canvas || reduceMotion) return undefined;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      canvas.dataset.fallback = 'true';
      return undefined;
    }

    let program;
    try {
      program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    } catch (error) {
      console.warn('Decorative WebGL layer disabled:', error);
      canvas.dataset.fallback = 'true';
      return undefined;
    }

    let frame = 0;
    let width = 1;
    let height = 1;
    const buffer = gl.createBuffer();
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const scrollLocation = gl.getUniformLocation(program, 'u_scroll');
    const pointerLocation = gl.getUniformLocation(program, 'u_pointer');
    const modeLocation = gl.getUniformLocation(program, 'u_mode');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = Math.max(1, Math.floor(window.innerWidth * dpr));
      height = Math.max(1, Math.floor(window.innerHeight * dpr));
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };

    const onPointerMove = (event) => {
      pointerRef.current = {
        x: event.clientX / Math.max(window.innerWidth, 1),
        y: 1 - (event.clientY / Math.max(window.innerHeight, 1)),
      };
    };

    const render = (timeMs) => {
      const pointer = pointerRef.current;
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, width, height);
      gl.uniform1f(timeLocation, timeMs * 0.001);
      gl.uniform1f(scrollLocation, window.scrollY || 0);
      gl.uniform2f(pointerLocation, pointer.x, pointer.y);
      gl.uniform1f(modeLocation, mode === 'ops' ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frame = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    frame = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.cancelAnimationFrame(frame);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [mode]);

  return (
    <div className={`experience-stage experience-stage-${mode}`} aria-hidden="true">
      <canvas ref={canvasRef} className="experience-webgl" />
      <div className="experience-orbit experience-orbit-one" />
      <div className="experience-orbit experience-orbit-two" />
      <div className="experience-noise" />
    </div>
  );
}
