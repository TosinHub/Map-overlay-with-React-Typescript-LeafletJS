// DraggableImageOverlay.ts
import L from 'leaflet';

// @ts-ignore
L.LatLng.prototype.latLngOffset = function (latOffset: number, lngOffset: number) {
  return L.latLng(this.lat + latOffset, this.lng + lngOffset);
};

class DraggableImageOverlay extends L.ImageOverlay {
  private dragging = false;
  private startLatLng: L.LatLng | null = null;
  private currentRotation: number = 0;
  private currentPosition: { x: number; y: number } = { x: 0, y: 0 };

  onClick: (event: MouseEvent) => void;
  updateBoundsCallback: (event: L.LatLngBounds) => void;

  constructor(url: string, bounds: L.LatLngBoundsExpression, onClick: (event: MouseEvent) => void, updateBoundsCallback: (bounds: L.LatLngBounds) => void) {
    super(url, bounds);

    this.onClick = onClick;
    this.updateBoundsCallback = updateBoundsCallback;

    this.on('add', () => {
      const img = this.getElement();
      // @ts-ignore
      img.addEventListener('click', this.onClick);
      // @ts-ignore
      img.addEventListener('mousedown', this.onMouseDown);
      // @ts-ignore
      img.style.cursor = 'grab';
    });
  }

  private onMouseDown = (event: MouseEvent) => {
    event.preventDefault();

    L.DomEvent.stopPropagation(event);
    L.DomEvent.preventDefault(event);
    this.dragging = true;
    this.startLatLng = this._map?.mouseEventToLatLng(event);

    const img = this.getElement();
    // @ts-ignore
    img.style.cursor = 'grabbing';
    const bounds = this.getBounds();
    this.updateBoundsCallback(bounds)

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!this.dragging || !this.startLatLng || !this._map) return;

    L.DomEvent.stopPropagation(event);
    L.DomEvent.preventDefault(event);

    const currentLatLng = this._map.mouseEventToLatLng(event);
    const latDiff = currentLatLng.lat - this.startLatLng.lat;
    const lngDiff = currentLatLng.lng - this.startLatLng.lng;

    const currentBounds = this.getBounds();

    // Calculate new positions for SW and NE corners
    const newSouthWest = L.latLng(currentBounds.getSouthWest().lat + latDiff, currentBounds.getSouthWest().lng + lngDiff);
    const newNorthEast = L.latLng(currentBounds.getNorthEast().lat + latDiff, currentBounds.getNorthEast().lng + lngDiff);

    // Set new bounds
    const newBounds = L.latLngBounds(newSouthWest, newNorthEast);
    this.updateBoundsCallback(newBounds)
    this.setBounds(newBounds);

    this.startLatLng = currentLatLng;
  };

  private onMouseUp = () => {
    this.dragging = false;
    const img = this.getElement();
    // @ts-ignore
    img.style.cursor = 'grab';
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  private updateTransform() {
    const img = this.getElement();
    if (img) {
      img.style.transform += `rotate(${this.currentRotation}deg)`;
    }
  }

  setRotation(angle: number) {
    this.currentRotation = angle;
    this.updateTransform();
  }
}

export default DraggableImageOverlay;
