import netlix from "../assets/netflix.png";
import amazon from "../assets/amazon.png";
import spotify from "../assets/spotify.png";
import disney from "../assets/disney.png";
import pornhub from "../assets/pornhub.png";
import xbox from "../assets/xbox.png";
import youtube from "../assets/youtube.png";
import paramount from "../assets/paramount.png";

export const cargarLogos = (nombre) => {
  switch (nombre) {
    case "Netflix":
      return netlix;
    case "Amazon":
      return amazon;
    case "Spotify":
      return spotify;
    case "Paramount":
      return paramount;
    case "Disney":
      return disney;
    case "PornHub":
      return pornhub;
    case "Xbox":
      return xbox;
    case "Youtube":
      return youtube;
    default:
      return;
  }
};
