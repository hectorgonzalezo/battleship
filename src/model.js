import PubSub from "pubsub-js";

window.addEventListener("load", (event) => {
  PubSub.publish("window-loaded");
});
