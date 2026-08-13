/** Web build shim — Stream video filters optional; avoids Metro parsing mediapipe dynamic import. */
export class FilesetResolver {
  static async forVisionTasks() {
    return {};
  }
}

export class ImageSegmenter {
  static async createFromOptions() {
    return {
      close() {},
      segment() {
        return null;
      },
    };
  }
}
