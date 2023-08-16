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
    if (isUrlImage(video)) {
      console.log("image")
      setTimeout(() => {
        console.log("entered timeout")
        const queryParameters = new URLSearchParams(window.location.search);
        const user = queryParameters.get("user");
        fetch(`delete-video?user=${user}&title=${video}`).then(res => {
          setVideo("");
          setText("");
        })
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [video]);

  const handleOnEnded = videoUrl => {
    const queryParameters = new URLSearchParams(window.location.search);
    const user = queryParameters.get("user");
    fetch(`/delete-video?user=${user}&title=${videoUrl}`).then(res => {
      setVideo("");
      setText("");
    })
  }

  const isUrlImage = (videoUrl) => {
    const imageUrlRegex = /\.(jpeg|jpg|gif|png)$/i;
    return imageUrlRegex.test(videoUrl);
  }

  return (
    <div className="App">
      <div style={{ position: "relative", width: "fit-content" }}>
        {!!video && video.length > 0 && !isUrlImage(video)
          && <ReactPlayer
            style={{ pointerEvents: "none" }}
            url={video}
            playing
            onEnded={() => handleOnEnded(video)}
          />
        }
        {!!video && video.length > 0 && isUrlImage(video)
          && <img style={{ maxHeight: "80vh"}} src={video.split(" ")[0]} alt="" />
        }
        {!!text && <p>{text}</p>}
      </div>
    </div>
  );
}

export default App;
