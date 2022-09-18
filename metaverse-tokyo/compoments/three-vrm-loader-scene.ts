import { WebGLRenderer, Scene, PerspectiveCamera, DirectionalLight, Color, Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRM } from '@pixiv/three-vrm';
import { OrbitControls } from 'three-orbitcontrols-ts';

export class ThreeVrmLoaderScene {
  private canvas: HTMLCanvasElement | null = null;
  private scene: Scene | null = null;
  private camera: PerspectiveCamera | null = null;
  private renderer: WebGLRenderer | null = null;
  private frameId: number | null = null;
  private targetScene: Scene | Group | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.animate = this.animate.bind(this);
    this.updatePositionLikeThirdPerson = this.updatePositionLikeThirdPerson.bind(this);
    this.initScene(canvas)
  }

  async updateVrmUrl(url: string): Promise<VRM> {
    const gltfLoader = new GLTFLoader();
    const gltf = await gltfLoader.loadAsync(url);
    const vrm = await VRM.from(gltf);
    if (this.scene) {
      this.scene.add(vrm.scene);
    }
    this.targetScene = vrm.scene;
    return vrm;
  }

  async updateVrmArryaBuffer(arrayBuffer: string | ArrayBuffer): Promise<VRM> {
    const gltfLoader = new GLTFLoader();
    const gltf = await gltfLoader.parseAsync(arrayBuffer, '');
    const vrm = await VRM.from(gltf);
    if (this.scene) {
      this.scene.add(vrm.scene);
    }
    this.targetScene = vrm.scene;
    return vrm;
  }

  private updatePositionLikeThirdPerson() {
    if (this.renderer && this.scene && this.camera && this.targetScene) {
      const targetPosition = this.targetScene.position;
      this.camera.position.set(targetPosition.x, targetPosition.y + 1.5, targetPosition.z + 3);
      this.camera.lookAt(this.targetScene.position);
    }
  }

  private initScene(canvas: HTMLCanvasElement) {
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
    const camera = new PerspectiveCamera(75, width / height);
    camera.position.set(0, 6, 18);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    scene.add(camera);
    this.camera = camera;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.render(scene, camera);
    this.renderer = renderer;
    this.animate();
  }

  animate() {
    // 次のフレームを要求
    this.frameId = window.requestAnimationFrame(this.animate);
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
      this.updatePositionLikeThirdPerson();
    }
  }
}
