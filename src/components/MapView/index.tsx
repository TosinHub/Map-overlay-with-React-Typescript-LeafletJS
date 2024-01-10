import { useEffect, useState,  } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

import DraggableImageOverlay from './DraggableOverlay';

type Props = {
  planImageUri: string | null;
};

const DraggableOverlayComponent = ({ planImageUri }: Props) => {
  const [sliderValue, setSliderValue] = useState<string>('0');
  const [showSlider, setShowSlider] = useState<boolean>(false);
  const [overlay, setOverlay] = useState<DraggableImageOverlay | null>(null);

  const map = useMap();

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(event.target.value);
    overlay?.setRotation(Number(event.target.value)) 
  };

  const onImageClick = () => {
    setShowSlider(true)
  }

  useEffect(() => {
    if (planImageUri) {
      const center = map.getCenter();
      const offset = 0.001;

      const imageBounds: L.LatLngBoundsLiteral = [
        [center.lat - offset, center.lng - offset],
        [center.lat + offset, center.lng + offset]
      ];
      
      const newOverlay = new DraggableImageOverlay(planImageUri, imageBounds, onImageClick);
      newOverlay.options.opacity = 0.9;
      newOverlay.options.interactive = true; 
      newOverlay.addTo(map);

      setOverlay(newOverlay);
    }
  }, [map, planImageUri]);

  const styles = {
    position: 'absolute' as 'absolute',
    zIndex: 1000,
  }

  return showSlider ? (
    <div style={{ backgroundColor: 'green' }} >
      <input
        type="range"
        min="0"
        max="360"
        value={sliderValue}
        onChange={handleSliderChange}
        style={styles}
        onMouseDown={(event) => {
          //@ts-ignore
          L.DomEvent.stopPropagation(event);
        }}
      />
    </div>
  ) : null;
};

const MapView = ({ planImageUri }: Props) => {
  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={16}
      scrollWheelZoom={true}
      style={{ height: '80vh', width: '100%' }}
      dragging={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={20}
        attribution="© OpenStreetMap contributors"
      />
      <DraggableOverlayComponent planImageUri={planImageUri} />
    </MapContainer>
  );
};

export default MapView;
