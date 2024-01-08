import { useState } from "react";
import MapView from "./components/MapView";
import UploadFile from "./components/UploadFile";
import DisplayFile from "./components/DisplayFile";
import './App.css'

function App() {
  const [pdf, setPdf] = useState<File | null>(null)
  const [imageUri, setImageUri] = useState<string | null>(null)
  return (
    <div className="App" >
      <UploadFile onSubmit={setPdf} />
      <MapView planImageUri={imageUri} />
      {pdf && <DisplayFile file={pdf} onImageReady={setImageUri} />}
    </div>
  );
}

export default App;
