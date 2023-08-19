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
        fetch(`delete-video?user=${user}`).then(res => {
          setVideo("");
          setText("");
        })
      }, 15000);
    }
    return () => clearInterval(interval);
  }, [video]);

  const handleOnEnded = videoUrl => {
    const queryParameters = new URLSearchParams(window.location.search);
    const user = queryParameters.get("user");
    fetch(`/delete-video?user=${user}`).then(res => {
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
      <div className={`container ${!!video ? "appear" : ""}`}>
        <div className="video">
          {!!video && !isUrlImage(video)
            && <ReactPlayer
              style={{ pointerEvents: "none"}}
              url={video}
              playing
              onEnded={() => handleOnEnded(video)}
            />
          }
          {!!video && isUrlImage(video)
            && <img style={{ minHeight: "60vh", maxHeight: "80vh"}} src={video.split(" ")[0]} alt="" />
          }
        </div>
        {!!text && <p>{text}</p>}
      </div>
      {!!video && <audio autoPlay>
        <source src="notification.wav" type="audio/wav"/>
      </audio>}
    </div>
  );
}

export default App;
