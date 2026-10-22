import { cell, resource, resourceFactory } from 'ember-resources';

function now(intervalSeconds = 5) {
  return resource(({ on }) => {
    const time = cell(new Date());
    const interval = setInterval(() => (time.current = new Date()), intervalSeconds * 1_000);

    on.cleanup(() => clearInterval(interval));

    return time;
  });
}

export default resourceFactory(now);
