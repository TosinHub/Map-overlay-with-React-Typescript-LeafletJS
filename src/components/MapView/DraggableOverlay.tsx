// DraggableImageOverlay.ts
import L from 'leaflet';

// @ts-ignore
L.LatLng.prototype.latLngOffset = function (latOffset: number, lngOffset: number) {
  return L.latLng(this.lat + latOffset, this.lng + lngOffset);
};

// Extend the leaflet ImageOverlay class to add dragging functionality to the image
class DraggableImageOverlay extends L.ImageOverlay {
  private dragging = false;
  private startLatLng: L.LatLng | null = null;
  private currentRotation: number = 0;

  // Used to show the controls when the image is clicked on
  onClick: (event: MouseEvent) => void;

  constructor(url: string, bounds: L.LatLngBoundsExpression, onClick: (event: MouseEvent) => void) {
    super(url, bounds);

    this.onClick = onClick;

    this.on('add', () => {
      const img = this.getElement();
      // @ts-ignore
      img.addEventListener('click', this.onClick); // Add event listener to show controls
      // @ts-ignore
      img.addEventListener('mousedown', this.onMouseDown); // add event listener to move and update position of the image
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
    img.style.cursor = 'grabbing'; // Update cursor to show image is being moved or grabbed

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
      // Handle image rotation via transform
      img.style.transform += `rotate(${this.currentRotation}deg)`;
    }
  }

  // Handles rotation of image
  setRotation(angle: number) {
    // Store current rotation so this can be referred to later when updating other image properties
    this.currentRotation = angle;
    this.updateTransform();
  }
}

export default DraggableImageOverlay;
