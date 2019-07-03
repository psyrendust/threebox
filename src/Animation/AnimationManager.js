import { lineString } from '@turf/helpers';
import along from '@turf/along';
import destination from '@turf/destination';
import distance from '@turf/distance';

import * as utils from '../utils';

function AnimationManager() {
    this.enrolledObjects = [];
    this.previousFrameTime = undefined;
}

AnimationManager.prototype = {
    enroll(obj) {
        /* Extend the provided object with animation-specific properties and track in the animation manager */

        this.enrolledObjects.push(obj);

        // Give this object its own internal animation queue
        obj.animationQueue = [];

        obj.set = function set(state, options) {
            // if duration is set, animate to the new state
            if (options && options.duration > 0) {
                const entry = {
                    type: 'set',
                    parameters: {
                        start: Date.now(),
                        expiration: Date.now() + options.duration,
                        duration: options.duration,
                    },
                };

                if (state.rotation) {
                    const c = obj.rotation;
                    entry.parameters.startRotation = [ c.x, c.y, c.z ];
                    entry.parameters.rotationPerMs = [ c.x, c.y, c.z ].map((radian, index) => {
                        return (utils.radify(state.rotation[ index ]) - radian) / (options.duration);
                    });
                }
                if (state.position) {
                    entry.parameters.startPosition = obj.coordinates;
                    entry.parameters.positionPerMs = obj.coordinates.map((px, index) => {
                        return (state.position[ index ] - px) / (options.duration);
                    });
                }

                this.animationQueue.push(entry);
            } else { // if no duration set, stop existing animations and go to that state immediately
                this.stop();
                state.rotation = utils.radify(state.rotation);
                this._setObject(state);
            }

            return this;
        };

        obj.stop = function stop() {
            this.animationQueue = [];
            return this;
        };

        obj.setSpeed = function setSpeed(options) {
            var now = now;
            if (options.duration) options.expiration = now + options.duration;
            const animationEntry = { object: this, type: 'continuous', parameters: options };

            this.animationQueue.push({ type: 'continuous', parameters: options });

            return this;
        };

        obj.followPath = function followPath(coordinates, options) {
            // var easing = options.easing || 1;

            // var totalDuration = (totalDistance / lineGeojson.properties.speed) * 1000;

            const lineGeojson = lineString(coordinates);
            const entry = {
                type: 'followPath',
                parameters: {
                    start: now,
                    distance: distance(lineGeojson, { units: 'kilometers' }),
                    geometry: lineGeojson,
                    speed: options.speed || 10,
                    acceleration: options.acceleration || 0,
                    trackHeading: true,
                    turnSpeed: utils.radify(options.turnSpeed) || utils.radify(3600),
                },
            };

            this.animationQueue
                .push(entry);

            return this;
        };

        obj.circlePoint = function circlePoint(options) {
            // radius, duration, start angle
            options.start = now;

            const entry = {
                type: 'circle',
                parameters: options,
            };

            this.animationQueue
                .push(entry);

            return this;
        };

        obj._setObject = function _setObject(options) {
            const p = options.position;
            const r = options.rotation;

            if (p) {
                this.coordinates = p;
                const c = utils.project(p);

                this.position.set(c[ 0 ], c[ 1 ], c[ 2 ]);
            }

            if (r) {
                this.rotation.set(r[ 0 ], r[ 1 ], r[ 2 ]);
            }
        };
    },

    update(now) {
        if (this.previousFrameTime === undefined) this.previousFrameTime = now;

        const dimensions = [ 'X', 'Y', 'Z' ];

        // iterate through objects in queue. count in reverse so we can cull objects without frame shifting
        for (let a = this.enrolledObjects.length - 1; a >= 0; a--) {
            const object = this.enrolledObjects[ a ];

            if (!object.animationQueue || object.animationQueue.length === 0) continue;

            // focus on first item in queue
            const item = object.animationQueue[ 0 ];

            var options = item.parameters;

            // cull expired animations
            if (options.expiration < now) {
                console.log('culled');

                object.animationQueue.splice(0, 1);

                // set the start time of the next animation
                object.animationQueue[ 0 ].parameters.start = now;

                return;
            }

            const sinceLastTick = (now - this.previousFrameTime) / 1000;

            if (item.type === 'set') {
                const timeProgress = now - options.start;
                let newPosition;
                let newRotation;

                if (options.positionPerMs) {
                    newPosition = options.startPosition.map((px, index) => {
                        return px + options.positionPerMs[ index ] * timeProgress;
                    });
                }
                if (options.rotationPerMs) {
                    newRotation = options.startRotation.map((rad, index) => {
                        return rad + options.rotationPerMs[ index ] * timeProgress;
                    });
                }

                object._setObject({ position: newPosition, rotation: newRotation });
            }

            // handle continuous animations
            if (item.type === 'continuous') {
                if (options.position) {
                    object.translateX(options.position[ 0 ] / sinceLastTick);
                    object.translateY(options.position[ 1 ] / sinceLastTick);
                    object.translateZ(options.position[ 2 ] / sinceLastTick);
                }

                if (options.rotation) {
                    object.rotateX(options.rotation[ 0 ] / sinceLastTick);
                    object.rotateY(options.rotation[ 1 ] / sinceLastTick);
                    object.rotateZ(options.rotation[ 2 ] / sinceLastTick);
                }
            }

            if (item.type === 'followPath') {
                const timeProgress = (now - options.start) / 1000;
                const lineGeojson = options.geometry;
                const acceleration = options.acceleration;
                const turnSpeed = options.turnSpeed;

                // var fractionalProgress = Math.pow(1*Math.round(1*(timeProgress)) / totalDuration, easing);

                // default to duration for time
                const distanceProgress = options.speed * timeProgress + 0.5 * acceleration * Math.pow(timeProgress, 2);// totalDistance*fractionalProgress
                const currentLngLat = along(lineGeojson, distanceProgress, 'meters').geometry.coordinates;
                const nextPosition = utils.project(currentLngLat);

                let toTurn;

                // if we need to track heading
                if (options.trackHeading) {
                    // opposite/adjacent
                    const angle = (Math.atan2((nextPosition[ 1 ] - object.position.y), (nextPosition[ 0 ] - object.position.x)) + 0.5 * Math.PI).toFixed(4);
                    const angleDelta = angle - object.rotation.z;

                    // if object needs to turn, turn it by up to the allowed turnSpeed
                    if (angleDelta !== 0) {
                        const xTurn = 0;
                        const yTurn = 0;
                        const zTurn = Math.sign(angleDelta) * Math.min(Math.abs(angleDelta), turnSpeed) * sinceLastTick;
                        toTurn = [ xTurn, yTurn, object.rotation.z + zTurn ];
                    }
                } else if (options.rotation) {
                    console.log('rotation present!'); // eslint-disable-line
                }

                object._setObject({ position: currentLngLat, rotation: toTurn });

                // if finished, flag this for removal next time around
                if (distanceProgress >= options.distance) options.expiration = now;
            }

            if (item.type === 'circle') {
                const timeProgress = (now - options.start) / 1000;
                const period = options.period;
                const radius = options.radius;
                const center = options.center;

                const angle = utils.radify((360 * timeProgress / period));
                const dest = destination(center, radius / 1000, angle, 'kilometers');
                const coords = dest.geometry.coordinates;
                coords[ 2 ] = 500;
                object._setObject({ position: coords, rotation: [ 0, 0, angle / 100 ] });
            }
        }

        this.previousFrameTime = now;
    },
};

module.exports = exports = AnimationManager;
