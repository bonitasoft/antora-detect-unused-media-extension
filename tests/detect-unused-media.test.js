import { test } from "node:test";
import { register } from "../src/index.js";

test("register function should handle empty content catalog", () => {
  const logger = {
    info: () => {},
    warn: () => {},
    fatal: () => {},
  };

  const context = {
    getLogger: () => logger,
    once: (event, callback) => {
      if (event === "contentClassified") {
        callback({ contentCatalog: { getFiles: () => [] } });
      }
    },
  };

  register.call(context, {
    config: {},
  });
});

test("register function should handle files with no image references", () => {
  const logger = {
    info: () => {},
    warn: () => {},
    fatal: () => {},
  };

  const context = {
    getLogger: () => logger,
    once: (event, callback) => {
      if (event === "contentClassified") {
        callback({
          contentCatalog: {
            getFiles: () => [
              { src: { family: "page", contents: "No image references here" } },
            ],
          },
        });
      }
    },
  };

  register.call(context, { config: {} });
});

test("register function should handle matching image references", () => {
  const logger = {
    info: () => {},
    warn: () => {},
    fatal: () => {},
  };

  const context = {
    getLogger: () => logger,
    once: (event, callback) => {
      if (event === "contentClassified") {
        callback({
          contentCatalog: {
            getFiles: () => [
              { src: { family: "page", contents: "image::path/to/image.png" } },
              {
                src: {
                  family: "image",
                  extname: ".png",
                  relative: "path/to/image.png",
                  module: "module",
                  path: "path/to/image.png",
                },
              },
            ],
          },
        });
      }
    },
  };

  register.call(context, { config: {} });
});
