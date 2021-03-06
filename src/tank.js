import { create, forEach, remove } from 'lodash';

const RADIUS_LIMIT = 50;

export default function (engine) {
    const { stage, view } = engine;
    const content = [];
    const props = {
        engine,
        content
    }
    const proto = {
        add: (entity) => {
            content.push(entity);
            stage.addChild(entity.shape);
        },
        remove: (entity) => {
            remove(content, entity);
            stage.removeChild(entity.shape);
        },
        each: (callback) => {
            forEach(content, entity => callback(entity));
        },
        update,
        radius: radius(content),
        get width() { return view.width },
        get height() { return view.height }
    }
    return create(proto, props);
}

function update() {
    const tank = this;

    // pre-behaviour actions here

    tank.each(entity => {
        if (entity.behaviour) {
            let data = {};
            forEach(entity.behaviour, behaviour => {
                behaviour(entity, tank, data);
            });
            data = null;
        }
        entity.borders(tank);
        entity.updateForce();
        entity.display();
    });
}

function radius(content) {
    return (entity, value) => {
        const position = entity.position;
        const closest = [];

        value = value * value;
        forEach(content, next => {
            if (entity !== next) {
                let dist = position.distanceSq(next.position);
                if (dist < value) {
                    closest.push([dist, next]);
                    if (closest.length > RADIUS_LIMIT) {
                        return false;
                    }
                }
            }
        });
        return closest
            .sort((a, b) => a[0] - b[0])
            .map(item => item[1]);
    }
}