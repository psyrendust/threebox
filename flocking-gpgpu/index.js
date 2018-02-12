import Birdflocking from './BirdFlocking';
// import OldFlocking from './OldFlocking';
import mapboxgl from './mapboxgl';
import config from './config';
import Stats from '../src/stats';

mapboxgl.accessToken = config.accessToken;
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v9',
  center: [-122.4131, 37.7743],
  zoom: 13,
  pitch: 60,
  hash: false,
});
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

map.on('load', () => {
  // const oldFlocking = new OldFlocking(map);
  // const threebox = oldFlocking.threebox;
  const birdFlocking = new Birdflocking(map);
  const threebox = birdFlocking.threebox;
  const container = document.querySelector('body');
  const stats = new Stats();
  container.appendChild(stats.dom);

  // oldFlocking.drive();
  birdFlocking.init();
  threebox.onAfterUpdate(() => {
    stats.update();
  });
});

