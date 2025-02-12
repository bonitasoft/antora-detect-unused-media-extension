import { strict as assert } from "node:assert"; // Importing assert
import { beforeEach, describe, it } from "node:test";
import {
  extractMediaReferences,
  findUnusedMedia,
  register,
} from "../src/index.js";
import { createLogger } from "./lib.js";

describe("extractMediaReferences", async () => {
  it("should extract media references from one file", () => {
    const logger = createLogger();
    const contentCatalog = {
      getFiles: () => [
        {
          src: { family: "page" },
          contents:
            "image::path/to/image1.png[] \n image::path/to/image2.cast[] \n image:component:modules/cat.gif[]",
        },
      ],
    };

    const imageReferences = extractMediaReferences(contentCatalog, logger);

    assert.strictEqual(imageReferences.size, 3);
    assert.strictEqual(imageReferences.has("path/to/image1.png"), true);
    assert.strictEqual(imageReferences.has("path/to/image2.cast"), true);
    assert.strictEqual(imageReferences.has("component:modules/cat.gif"), true);
  });

  it("should extract media references from multiple files", () => {
    const logger = createLogger();
    const contentCatalog = {
      getFiles: () => [
        { src: { family: "page" }, contents: "image::path/to/image1.png[] \n" },
        {
          src: { family: "page" },
          contents:
            "image::path/to/image1.png[] \n image::path/to/image2.cast[] \n image:component:modules/cat.gif[]",
        },
      ],
    };

    const imageReferences = extractMediaReferences(contentCatalog, logger);

    assert.strictEqual(imageReferences.size, 3);
    assert.strictEqual(imageReferences.has("path/to/image1.png"), true);
    assert.strictEqual(imageReferences.has("path/to/image2.cast"), true);
    assert.strictEqual(imageReferences.has("component:modules/cat.gif"), true);
  });

  it("should extract media references from file and partial", () => {
    const logger = createLogger();
    const contentCatalog = {
      getFiles: () => [
        {
          src: { family: "page" },
          contents:
            "image::path/to/image1.png[] \n \n image:component:modules/cat.gif[]",
        },
        {
          src: { family: "partial" },
          contents: "Load a .cast in the partial image::path/to/image2.cast[]",
        },
      ],
    };

    const mediaReferences = extractMediaReferences(contentCatalog, logger);

    assert.strictEqual(mediaReferences.size, 3);
    assert.strictEqual(mediaReferences.has("path/to/image1.png"), true);
    assert.strictEqual(mediaReferences.has("path/to/image2.cast"), true);
    assert.strictEqual(mediaReferences.has("component:modules/cat.gif"), true);
  });
});

describe("findUnusedImages", () => {
  let contentCatalog;
  let logger;

  beforeEach(() => {
    contentCatalog = {
      getFiles: () => [],
    };
    logger = createLogger();
  });

  it("returns unused media when there are media not referenced", () => {
    contentCatalog.getFiles = () => [
      {
        src: {
          family: "image",
          extname: ".png",
          relative: "images/img1.png",
          component: "comp1",
          version: "v1",
          path: "path1",
        },
      },
      {
        src: {
          family: "image",
          extname: ".jpg",
          relative: "images/img2.jpg",
          component: "comp2",
          version: "v2",
          path: "path2",
        },
      },
    ];

    const mediaReferences = new Set(["images/img1.png"]);
    const extensionToIgnore = new Set([".cast"]);

    const result = findUnusedMedia(
      contentCatalog,
      mediaReferences,
      extensionToIgnore,
      logger,
    );

    assert.strictEqual(result.size, 1);
    assert.deepStrictEqual(Array.from(result)[0], {
      src: {
        family: "image",
        extname: ".jpg",
        relative: "images/img2.jpg",
        component: "comp2",
        version: "v2",
        path: "path2",
      },
    });

    assert.strictEqual(logger.callCount.warn, 1);
  });
});

describe("Extension should", () => {
  it("register function should log unused media", () => {
    const logger = createLogger();

    const context = {
      getLogger: () => logger,
      once: (event, callback) => {
        if (event === "contentClassified") {
          callback({
            contentCatalog: {
              getFiles: () => [
                {
                  src: {
                    family: "image",
                    extname: ".png",
                    relative: "path/to/unused-image.png",
                    module: "module",
                    path: "path/to/unused-image.png",
                  },
                },
              ],
            },
          });
        }
      },
    };

    register.call(context, { config: {} });

    // Add assertion
    assert.strictEqual(
      logger.messages.warn.includes(
        "Some media are unused, check previous logs and delete unused media.",
      ),
      true,
      "Logger should warn about unused media",
    );
  });
});
