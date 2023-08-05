import {useState, useEffect} from "react";
import ReactPlayer from "react-player";

function App() {

  const [video, setVideo] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      if (!video) {
        fetch("/api")
          .then((res) => res.json())
          .then((data) => setVideo(data.videos[0]));
      }
    }, 200);
    return () => clearInterval(interval);
  }, [video]);

  const handleOnEnded = () => {
    fetch("/delete-video").then(() => {
      setVideo("");
      console.log("video ended")
    })
  }

  return (
    <div className="App">
      {!!video && video.length > 0
        && <ReactPlayer
          style={{ pointerEvents: "none" }}
          url={video}
          playing
          onEnded={handleOnEnded}
        />
      }
    </div>
  );
}

export default App;
