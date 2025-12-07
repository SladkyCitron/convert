import { fetchFile } from "/node_modules/@ffmpeg/util/dist/esm/index.js";
import { FFmpeg } from "/node_modules/@ffmpeg/ffmpeg/dist/esm/index.js";

let ffmpeg;

let supportedFormats = [];

async function init () {

  ffmpeg = new FFmpeg();

  await ffmpeg.load({
    coreURL: "/node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js",
  });

  let formatDumpStarted = false;
  const handleFormatDump = ({ message }) => {

    if (message === " --") return formatDumpStarted = true;
    else if (!formatDumpStarted) return;

    let len;
    do {
      len = message.length;
      message = message.replaceAll("  ", " ");
    } while (len !== message.length);
    message = message.trim();

    const parts = message.split(" ");
    supportedFormats.push({
      name: parts.slice(2).join(" "),
      format: parts[1],
      extension: parts[1],
      mime: "video/" + parts[1],
      from: parts[0].includes("D"),
      to: parts[0].includes("E"),
      internal: parts[1]
    });

  };

  ffmpeg.on("log", handleFormatDump);
  await ffmpeg.exec(["-formats", "-hide_banner"]);
  ffmpeg.off("log", handleFormatDump);

}

async function doConvert (inputFile, inputFormat, outputFormat) {

  await ffmpeg.writeFile(inputFile.name, await fetchFile(inputFile));
  await ffmpeg.exec(["-i", inputFile.name, "-f", outputFormat.internal, "output"]);
  return (await ffmpeg.readFile("output"))?.buffer;

}

export default {
  init,
  supportedFormats,
  doConvert
};
