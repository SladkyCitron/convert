import CommonFormats from "src/CommonFormats.ts";
import type { FileData, FileFormat, FormatHandler } from "../FormatHandler.ts";

class textToGoHandler implements FormatHandler {
  public name = "textToGo";
  public supportedFormats: FileFormat[] = [
    CommonFormats.TEXT.supported("txt", true, false, true),
    {
      name: "Go Source File",
      format: "go",
      extension: "go",
      mime: "text/x-go",
      from: false,
      to: true,
      internal: "go",
      category: "text",
      lossless: true,
    }
  ];
  public ready: boolean = true;

  async init() {
    this.ready = true
  }

  async doConvert(
    inputFiles: FileData[],
    inputFormat: FileFormat,
    outputFormat: FileFormat,
  ): Promise<FileData[]> {
    const outputFiles: FileData[] = [];

    if (inputFormat.internal !== "txt" || outputFormat.internal !== "go") {
      throw "Invalid input/output format.";
    }

    for (const inputFile of inputFiles) {
      console.log(inputFiles, inputFormat, outputFormat);

      const text = new TextDecoder().decode(inputFile.bytes);
      let out = "";

      const lines = text.split(/\r?\n/).slice(0, -1);

      out += "package main\n";
      out += "\n";
      out += "import \"fmt\"\n";
      out += "\n";
      out += "func main() {\n";

      for (const line of lines) {
        if (line === "") {
          out += "\tfmt.Println()\n";
        } else {
          out += `\tfmt.Println(\`${line}\`)\n`;
        }
      }

      out += "}\n";

      const name = inputFile.name.split(".")[0]+".go";
      outputFiles.push({bytes: new TextEncoder().encode(out), name});
    }

    return outputFiles;
  }
}

export default textToGoHandler;
