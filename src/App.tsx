import DeckGL from "@deck.gl/react/typed";
import { ScatterplotLayer, IconLayer } from "@deck.gl/layers/typed";
import { Map } from "react-map-gl/maplibre";
import { BASEMAP } from "@deck.gl/carto/typed";
import issIcon from "./assets/iss.png";
import { useState, useEffect } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

interface Position {
  longitude: number;
  latitude: number;
  timestamp: number;
}

interface IssNow {
  name: string;
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  footprint: number;
  timestamp: number;
  daynum: number;
  solar_lat: number;
  solar_lon: number;
  units: string;
}

export const App = () => {
  const [viewState, setViewState] = useState<Record<string, unknown>>({
    longitude: 0,
    latitude: 0,
    zoom: 1,
  });

  const [issNow, setIssNow] = useState<IssNow>();
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    let timer: number | undefined = undefined;

    const fetchIssNow = async () => {
      console.log("start");

      const data: IssNow = await (
        await fetch("https://api.wheretheiss.at/v1/satellites/25544")
      ).json();

      if (data) {
        setIssNow(data);

        setPositions((prev) => [
          ...prev,
          {
            longitude: data.longitude,
            latitude: data.latitude,
            timestamp: data.timestamp,
          },
        ]);
      }
    };

    if (!timer) {
      timer = setInterval(fetchIssNow, 10000);
    }

    fetchIssNow();

    return () => {
      clearInterval(timer);
      console.log("return", timer);
    };
  }, []);

  const layers = [
    new ScatterplotLayer({
      id: "scatterplot-layer",
      data: positions,
      pickable: true,
      stroked: false,
      filled: true,
      radiusMinPixels: 1,
      lineWidthMinPixels: 1,
      getPosition: ({ longitude, latitude }) => [longitude, latitude],
      getFillColor: [50, 180, 255],
    }),
    new IconLayer({
      id: "IconLayer",
      data: [
        {
          icon: issIcon,
          ...issNow,
        },
      ],
      getIcon: (d) => ({
        url: d.icon,
        width: 512,
        height: 512,
      }),
      getPosition: ({ longitude, latitude }) => [longitude, latitude],
      getSize: 50,
      pickable: true,
    }),
  ];

  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={({ viewState }) => {
        setViewState({ ...viewState, transitionDuration: 0 });
      }}
      controller={true}
      layers={issNow ? layers : []}
    >
      <Map mapLib={import("maplibre-gl")} mapStyle={BASEMAP.DARK_MATTER} />
    </DeckGL>
  );
};
