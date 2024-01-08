import { useEffect, useState, useCallback } from 'react';
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
  const [sliderStyle, setSliderStyle] = useState<{ left: string, top: string }>({ left: '0', top: '0' })
  const [overlayBounds, setOverlayBounds] = useState<L.LatLngBounds | null>(null);
  const [overlay, setOverlay] = useState<DraggableImageOverlay | null>(null);

  const map = useMap();

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(event.target.value);
    overlay?.setRotation(Number(event.target.value))
    // You'll pass this value to the DraggableOverlayComponent to update the overlay
  };

  const handleOverlayBoundsChange = useCallback((newBounds: L.LatLngBounds) => {
    setOverlayBounds(newBounds);
  }, []);

  const onImageClick = () => setShowSlider(true)

  const updateSliderPosition = useCallback(() => {
    if (map && overlayBounds) {
      const southWest = map.latLngToContainerPoint(overlayBounds.getSouthWest());
      const northEast = map.latLngToContainerPoint(overlayBounds.getNorthEast());

      // Position the slider just below the image
      const sliderPosition = {
        left: `${(southWest.x + northEast.x - 100) / 2}px`,
        top: `${northEast.y - 20}px`,
      };

      setSliderStyle(sliderPosition);
    }
  }, [map, overlayBounds]);

  useEffect(() => {
    if (map) {
      map.on('move', updateSliderPosition);
      map.on('zoom', updateSliderPosition);

      return () => {
        map.off('move', updateSliderPosition);
        map.off('zoom', updateSliderPosition);
      };
    }
  }, [map, planImageUri, updateSliderPosition]);

  useEffect(() => {
    if (planImageUri) {
      const center = map.getCenter();
      const offset = 0.001;
      const imageBounds: L.LatLngBoundsLiteral = [
        [center.lat - offset, center.lng - offset],
        [center.lat + offset, center.lng + offset]
      ];

      const newOverlay = new DraggableImageOverlay(planImageUri, imageBounds, onImageClick, handleOverlayBoundsChange);
      newOverlay.options.opacity = 0.9;
      newOverlay.options.interactive = true;
      newOverlay.addTo(map);

      setOverlay(newOverlay);
    }
  }, [map, planImageUri, handleOverlayBoundsChange]);

  const styles = {
    position: 'absolute' as 'absolute',
    zIndex: 1000,
    ...sliderStyle,
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
          // @ts-ignore
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
