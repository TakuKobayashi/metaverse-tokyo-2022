import React from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import { WebGLRenderer, Scene, PerspectiveCamera, DirectionalLight, Color, Group, Camera, Matrix4, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRM } from '@pixiv/three-vrm';
import { ThreeVrmLoaderScene } from './three-vrm-loader-scene';

// Grab the access token from your Mapbox account
// I typically like to store sensitive things like this
// in a .env file
//mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN!;
mapboxgl.accessToken = 'pk.eyJ1IjoidGFwdGFwcHVuIiwiYSI6ImNrMXlmYm5wNDBtbXYzaHBpa2lvNGtqN2IifQ.ptcQL38Jnzl53W22zgpM-A';
export class MapScene extends React.Component {
  //private threeScene?: ThreeVrmLoaderScene;

  private scene: Scene | null = null;
  private camera: Camera | null = null;
  private renderer: WebGLRenderer | null = null;
  private map: mapboxgl.Map | null = null

  constructor(props: any) {
    super(props);
  }

  componentDidMount() {}

  initScene() {
    // create the map and configure it
    // check out the API reference for more options
    // https://docs.mapbox.com/mapbox-gl-js/api/map/
    const map = new mapboxgl.Map({
      container: 'map',
      //      style: "mapbox://styles/mapbox/satellite-streets-v11",
      style: 'mapbox://styles/mapbox/light-v10',
      center: {
        lat: 35.6796449,
        lng: 139.735763,
      },
      zoom: 18,
      pitch: 60,
    });
    //this.threeScene = new ThreeVrmLoaderScene(map.getCanvas());
    // https://docs.mapbox.com/jp/mapbox-gl-js/example/3d-buildings/ 建物を3Dで表示する
    map.on('load', () => {
      // Insert the layer beneath any symbol layer.
      const layers = map.getStyle().layers;
      const labelLayerId = layers.find((layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']);
      map.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            // Use an 'interpolate' expression to
            // add a smooth transition effect to
            // the buildings as the user zooms in.
            'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
            'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
            'fill-extrusion-opacity': 0.6,
          },
        },
        labelLayerId?.id,
      );

      const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
        {
          lat: 35.6796449,
          lng: 139.735763,
        },
        0,
      );

      // transformation parameters to position, rotate and scale the 3D model onto the map
      const modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z!,
        rotateX: Math.PI / 2,
        rotateY: 0,
        rotateZ: 0,
        /* Since the 3D model is in real world meters, a scale transform needs to be
         * applied since the CustomLayerInterface expects units in MercatorCoordinates.
         */
        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
      };

      const customLayer: mapboxgl.CustomLayerInterface = {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: (map: mapboxgl.Map, gl: WebGLRenderingContext) => {
          this.camera = new Camera();
          this.scene = new Scene();

          const directionalLight = new DirectionalLight(0xffffff);
          directionalLight.position.set(0, -70, 100).normalize();
          this.scene.add(directionalLight);
          const directionalLight2 = new DirectionalLight(0xffffff);
          directionalLight2.position.set(0, 70, 100).normalize();
          this.scene.add(directionalLight2);

          const url = 'https://taptappun.s3.ap-northeast-1.amazonaws.com/AliciaSolid.vrm'
          //          const url = 'https://github.com/TakuKobayashi/metaverse-tokyo-2022/raw/master/metaverse-tokyo/public/AliciaSolid.vrm'
          axios.get(url, { responseType: 'arraybuffer' }).then(async (vrmRes) => {
            const gltfLoader = new GLTFLoader();
            const gltf = await gltfLoader.parseAsync(vrmRes.data, '');
            const vrm = await VRM.from(gltf);
            if (this.scene) {
              this.scene.add(vrm.scene);
            }
          })

          /*
          const loader = new GLTFLoader();
          loader.load('https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf', (gltf) => {
            this.scene?.add(gltf.scene);
          });
          */

          this.map = map;
          this.renderer = new WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true,
          });

          this.renderer.autoClear = false;

          /*
          const threeScene = new ThreeVrmLoaderScene(map.getCanvas(), gl);
          const url = 'https://taptappun.s3.ap-northeast-1.amazonaws.com/AliciaSolid.vrm'
//          const url = 'https://github.com/TakuKobayashi/metaverse-tokyo-2022/raw/master/metaverse-tokyo/public/AliciaSolid.vrm'
          axios.get(url, { responseType: 'arraybuffer' }).then((vrmRes) => {
            threeScene.updateVrmArryaBuffer(vrmRes.data)
          })
*/
        },
        render: (gl: WebGLRenderingContext, matrix: number[]) => {
          const rotationX = new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), modelTransform.rotateX);
          const rotationY = new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), modelTransform.rotateY);
          const rotationZ = new Matrix4().makeRotationAxis(new Vector3(0, 0, 1), modelTransform.rotateZ);
          const m = new Matrix4().fromArray(matrix);
          const l = new Matrix4()
            .makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
            .scale(new Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

          //this.camera!.projectionMatrix = m.multiply(l);
          this.renderer?.resetState();
          this.renderer?.render(this.scene!, this.camera!);
          this.map?.triggerRepaint();
        },
      };
      map.addLayer(customLayer, 'waterway-label');
    });
    /*
    map.on("load", () => {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
      })
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 })
      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 90.0],
          "sky-atmosphere-sun-intensity": 15,
        },
      })
    })
*/
  }
/*
  async updateVrmUrl(url: string): Promise<any> {
    return this.threeScene?.updateVrmUrl(url);
  }

  async updateVrmArryaBuffer(arrayBuffer: string | ArrayBuffer): Promise<any> {
    return this.threeScene?.updateVrmArryaBuffer(arrayBuffer);
  }
*/
  onMapSetupComplete = (divElement: HTMLDivElement) => {
    this.initScene();
  };

  render() {
    return <div id="map" ref={this.onMapSetupComplete} style={{ width: '100%', height: '100vh' }} />;
  }
}
