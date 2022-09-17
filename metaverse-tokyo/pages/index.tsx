import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import { ThreeScene } from '../compoments/three-scene';
import { useState, createRef } from 'react';
import axios from 'axios';
import { MapScene } from '../compoments/mapbox-render-map';

const Home: NextPage = (context) => {
  console.log(context);
  const threeSceneRef = createRef<ThreeScene>();
  const threeScene = <ThreeScene ref={threeSceneRef} />;
  const router = useRouter();

  const [responseJson, setResponseJson] = useState('');
  const parseAndShowVRM = (binary: ArrayBuffer | string) => {
    threeSceneRef?.current?.updateVrmArryaBuffer(binary);
    //    const parsedVrm = parseMetum(binary);
    //    setResponseJson(JSON.stringify(JSON.parse(parsedVrm.metaString), null, 2));
  };
  const onLoadFile = (files: File[]) => {
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        const readFileResult = reader.result;
        if (readFileResult !== null) {
          parseAndShowVRM(readFileResult);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  const onLoadVRM = async (url: string) => {
    const vrmRes = await axios.get(url, { responseType: 'arraybuffer' });
    parseAndShowVRM(vrmRes.data);
  };
  onLoadVRM('http://localhost:3000/AliciaSolid.vrm');

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.0.0/mapbox-gl.css" rel="stylesheet" />
      </Head>

      {threeScene}
      <MapScene />

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
