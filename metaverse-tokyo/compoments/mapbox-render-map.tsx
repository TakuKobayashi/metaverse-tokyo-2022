import React, { useRef, useEffect } from "react"
import mapboxgl from "mapbox-gl"

// Grab the access token from your Mapbox account
// I typically like to store sensitive things like this
// in a .env file
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN!

export const Map = () => {
  const mapContainer = useRef()

  // this is where all of our map logic is going to live
  // adding the empty dependency array ensures that the map
  // is only created once
  useEffect(() => {
    // create the map and configure it
    // check out the API reference for more options
    // https://docs.mapbox.com/mapbox-gl-js/api/map/
    const map = new mapboxgl.Map({
      container: "map",
//      style: "mapbox://styles/mapbox/satellite-streets-v11",
      style: 'mapbox://styles/mapbox/light-v10',
      center: {
        lat: 35.6796449,
        lng: 139.735763,
      },
      zoom: 18,
      pitch: 60,
    })
    // https://docs.mapbox.com/jp/mapbox-gl-js/example/3d-buildings/ 建物を3Dで表示する
    map.on('load', () => {
      // Insert the layer beneath any symbol layer.
      const layers = map.getStyle().layers;
      const labelLayerId = layers.find((layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']);
      map.addLayer(
      {
      'id': 'add-3d-buildings',
      'source': 'composite',
      'source-layer': 'building',
      'filter': ['==', 'extrude', 'true'],
      'type': 'fill-extrusion',
      'minzoom': 15,
      'paint': {
        'fill-extrusion-color': '#aaa',
        // Use an 'interpolate' expression to
        // add a smooth transition effect to
        // the buildings as the user zooms in.
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'height']
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'min_height']
        ],
        'fill-extrusion-opacity': 0.6
      }
    },
    labelLayerId?.id
    );
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

  }, [])

  return (
    <div
      id="map"
      ref={mapContainer}
      style={{ width: "100%", height: "100vh" }}
    />
  )
}
