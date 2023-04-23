import React, { useState, useEffect } from 'react';
import { BBox } from 'geojson';
import Supercluster from 'supercluster';
import { interpolate } from 'd3-interpolate';
import { Marker } from 'react-map-gl';
import { getCategoryEmoji } from './Category';



interface ClusteredMarkersProps {
  data: Array<{
    Name: string;
    Category: string;
    Location: { Latitude: number; Longitude: number };
    Id: string;
  }>;
  zoom: number;
  }

const ClusteredMarkers: React.FC<ClusteredMarkersProps> = ({ data, zoom }) => {
  // Function to handle clustering of markers
  function createSuperCluster(data: Array<{
    Name: string;
    Category: string;
    Location: { Latitude: number; Longitude: number };
    Id: string;
  }>) {
    const index = new Supercluster({
      radius: 15,
      maxZoom: 14,
    });

    index.load(data.map((item) => ({
      type: "Feature",
      properties: {
        Name: item.Name,
        Category: item.Category,
        Id: item.Id,
      },
      geometry: {
        type: "Point",
        coordinates: [item.Location.Longitude, item.Location.Latitude],
      },
    })));

    return index;
  }

  function getClusteredData(superCluster: Supercluster, zoom: number) {
    const bbox = [-180, -85, 180, 85] as BBox;
    const clusters = superCluster.getClusters(bbox, zoom);

    return {
      features: clusters,
    };
  }

  const [superCluster, setSuperCluster] = useState<Supercluster>();

  useEffect(() => {
    if (data) {
      const clusterIndex = createSuperCluster(data);
      setSuperCluster(clusterIndex);
    }
  }, [data]);

  const clusteredData = superCluster ? getClusteredData(superCluster, zoom) : { features: [] };

  // Function to render custom markers
  function renderMarkers(data: { features: any[] }, zoom: number) {
    return data.features.map((feature, index) => {
      const [longitude, latitude] = feature.geometry.coordinates;
      const category = feature.properties.Category;
      const name = feature.properties.Name;
      const id = feature.properties.Id;

      const emoji = getCategoryEmoji(category);

      const isTextVisible = zoom >= 12;
      const textOpacity = isTextVisible
        ? Math.min(Math.pow((zoom - 12), 2), 1)
        : 0;
      const scale = interpolate(0.9, 1);
      const interpolatedScale = scale(textOpacity);

      return (
        <Marker key={index} longitude={longitude} latitude={latitude}
       
        >
          <div
            style={{
              transform: `scale(${interpolatedScale})`,
              transition: 'transform 1000ms',
            }}
            

          >
            <div className="relative text-sm text-center">{emoji}</div>
            <div
              className="text-xs mt-1 font-light font-sans"
              style={{
                opacity: textOpacity,
                visibility: isTextVisible ? 'visible' : 'hidden',
              }}
            >
              {name}
            </div>
          </div>
        </Marker>
      );
    });
  }

  return <>{superCluster && renderMarkers(clusteredData, zoom)}</>;
};

export default ClusteredMarkers;
