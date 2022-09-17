import React from 'react';
import { WebGLRenderer, Scene, PerspectiveCamera, DirectionalLight, Color } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRM } from '@pixiv/three-vrm';

export class ThreeScene extends React.Component {
  private canvas: HTMLCanvasElement | null = null;
  private scene: Scene | null = null;
  private camera: PerspectiveCamera | null = null;
  private renderer: WebGLRenderer | null = null;
  private frameId: number | null = null;

  constructor(props: any) {
    super(props);
    this.animate = this.animate.bind(this);
  }

  componentDidMount() {}

  async updateVrmUrl(url: string): Promise<VRM> {
    const gltfLoader = new GLTFLoader();
    const gltf = await gltfLoader.loadAsync(url);
    const vrm = await VRM.from(gltf);
    if (this.scene) {
      this.scene.add(vrm.scene);
    }
    return vrm;
  }

  async updateVrmArryaBuffer(arrayBuffer: string | ArrayBuffer): Promise<VRM> {
    const gltfLoader = new GLTFLoader();
    const gltf = await gltfLoader.parseAsync(arrayBuffer, '');
    const vrm = await VRM.from(gltf);
    if (this.scene) {
      this.scene.add(vrm.scene);
    }
    return vrm;
  }

  private initScene(canvas: HTMLCanvasElement) {
    if (!canvas) {
      return;
    }
    const renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    this.canvas = canvas;
    const scene = new Scene();
    scene.background = new Color(0x212121);

    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(0, 1, -2);
    scene.add(directionalLight);

    this.scene = scene;
    const camera = new PerspectiveCamera(50, width / height, 0.01);
    camera.position.set(0, 1.5, -1.5);
    this.camera = camera;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer = renderer;
    this.animate();
  }

  onCanvasLoaded = (canvas: HTMLCanvasElement) => {
    this.initScene(canvas);
  };

  animate() {
    // 次のフレームを要求
    this.frameId = window.requestAnimationFrame(this.animate);
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  render() {
    return (
      <div>
        <canvas style={{ width: "100%", height: "100vh" }} ref={this.onCanvasLoaded} />
      </div>
    );
  }
}