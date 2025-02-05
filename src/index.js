/**
 * Registers the detect-unused-images extension.
 *
 * @param {Object} config - The configuration object.
 * @param {Array<string>} [config.excludeimageextension] - List of image extensions to exclude from detection.
 */
export function register({ config }) {
  const logger = this.getLogger("detect-unused-images");
  logger.info("Start unused images detection");

  config && Object.keys(config).length
    ? logger.info(
        "Override default configuration with %s",
        JSON.stringify(config, null, 2),
      )
    : logger.info("Use the default configuration");

  this.once("contentClassified", ({ contentCatalog }) => {
    // Initialize the set of extensions to ignore, including '.cast'
    let extensionToIgnore = new Set([".cast"]);

    // If config.excludeimageextension is provided, merge it with the default extensions to ignore
    if (config.excludeimageextension) {
      extensionToIgnore = new Set([
        ...config.excludeimageextension,
        ...extensionToIgnore,
      ]);
    }

    logger.info(
      "Assets with extensions will be ignored %s",
      Array.from(extensionToIgnore),
    );

    const imageReferences = extractMediaReferences(contentCatalog, logger);

    const unusedImages = findUnusedmedia(
      contentCatalog,
      imageReferences,
      extensionToIgnore,
      logger,
    );

    if (unusedImages.size > 0) {
      logger.warn(
        "Some media are unused, check previous logs and delete unused media.",
      );
    }
  });
}

export function extractMediaReferences(contentCatalog, logger) {
  const mediaReferences = new Set();
  const families = ["page", "partial"];

  contentCatalog
    .getFiles()
    .filter((file) => families.includes(file.src.family))
    .forEach((file) => {
      try {
        if (file.contents) {
          const mediaMatches =
            file.contents.toString().match(/(image|video)::?([^[]+)/g) || [];
          mediaMatches.forEach((match) => {
            const imagePath = match.replace(/(image|video)::?/g, "").trim();
            mediaReferences.add(imagePath);
          });
        }
      } catch (error) {
        logger.fatal(
          "%s (%s) - %s",
          file.src.component,
          file.src.version,
          file.src.basename,
        );
        logger.fatal(error);
      }
    });

  logger.info("Found %s media references", mediaReferences.size);
  return mediaReferences;
}

export function findUnusedmedia(
  contentCatalog,
  mediaReferences,
  extensionToIgnore,
  logger,
) {
  const unusedmedia = new Set();
  contentCatalog
    .getFiles()
    .filter(
      (file) =>
        file.src.family === "image" && !extensionToIgnore.has(file.src.extname),
    )
    .forEach((img) => {
      // check if the media are used in the module or in an external
      // ex: ROOT:images/myImage.png or images:myImages.png
      if (
        !(
          mediaReferences.has(img.src.relative.toString()) ||
          mediaReferences.has(
            img.src.module + ":" + img.src.relative.toString(),
          )
        )
      ) {
        unusedmedia.add(img);
        logger.warn(
          "[%s] [%s] %s",
          img.src.component,
          img.src.version,
          img.src.path,
        );
      }
    });
  logger.info("Finish and detecting %s unused media", unusedmedia.size);
  return unusedmedia;
}
