import { useState } from "react";
import MapView from "./components/MapView";
import UploadFile from "./components/UploadFile";
import './App.css'
import { convertPdfToImage } from "./utils";

function App() {
  const [imageUri, setImageUri] = useState<string | null>(null)

  const onSubmit = (pdf: File) => {
    convertPdfToImage(pdf).then(setImageUri)
  }
  return (
    <div className="App" >
      <UploadFile onSubmit={onSubmit} />
      <MapView planImageUri={imageUri} />
    </div>
  );
}

export default App;
