import {useState, useEffect} from "react";
import ReactPlayer from "react-player";

function App() {

  const [video, setVideo] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const queryParameters = new URLSearchParams(window.location.search);
      const user = queryParameters.get("user");
      if (!video) {
        fetch(`/api?user=${user}`)
          .then((res) => res.json())
          .then((data) => {
            setVideo(data.videos[0]);
            setText(data.text[0]);
          });
      } else {
        fetch(`/api?user=${user}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.skipped) {
              fetch(`/skip-video?user=${user}&skipped=true`).then(res => {
                setVideo("");
                setText("");
              })
            }
          });
      }
    }, 200);
    return () => clearInterval(interval);
  }, [video]);

  const handleOnEnded = videoUrl => {
    fetch(`/delete-video?user=kurae&title=${videoUrl}`).then(res => {
      setVideo("");
      setText("");
    })
  }

  return (
    <div className="App">
      {!!video && video.length > 0
        && <div style={{ position: "relative", width: "fit-content" }}>
          <ReactPlayer
            style={{ pointerEvents: "none" }}
            url={video}
            playing
            onEnded={() => handleOnEnded(video)}
          />
          {!!text && <p>{text}</p>}
        </div>
      }
    </div>
  );
}

export default App;
