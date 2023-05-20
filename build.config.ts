import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index"],
  outDir: "bin",
  declaration: true,
  clean: true,
});
